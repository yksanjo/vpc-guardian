import { Octokit } from '@octokit/rest';
import { pool } from '../../db';
import { generatePlainEnglishExplanation, generateRemediationSteps } from '../ai/openai';

export class GitHubScanner {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async scanRepository(orgId: string, repoId: string, repoName: string) {
    const [owner, repo] = repoName.split('/');
    
    try {
      // Scan for exposed secrets and keys
      const codeResults = await this.scanCodeForSecrets(owner, repo);
      
      // Scan repository settings
      const settingsResults = await this.scanRepositorySettings(owner, repo);
      
      // Scan for public buckets/URLs in code
      const bucketResults = await this.scanForExposedResources(owner, repo);

      const allFindings = [...codeResults, ...settingsResults, ...bucketResults];

      // Save findings to database
      for (const finding of allFindings) {
        const aiExplanation = await generatePlainEnglishExplanation({
          findingType: finding.type,
          severity: finding.severity,
          technicalDetails: finding.details,
        });

        await pool.query(
          `INSERT INTO attack_surface_findings 
           (organization_id, github_repo_id, finding_type, severity, title, description, 
            ai_explanation, location, raw_data, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')`,
          [
            orgId,
            repoId,
            finding.type,
            finding.severity,
            finding.title,
            finding.description,
            aiExplanation,
            finding.location,
            JSON.stringify(finding.details),
          ]
        );
      }

      // Update last scan time
      await pool.query(
        'UPDATE github_repos SET last_scan_at = NOW() WHERE id = $1',
        [repoId]
      );

      return { findingsCount: allFindings.length };
    } catch (error) {
      console.error('GitHub scan error:', error);
      throw error;
    }
  }

  private async scanCodeForSecrets(owner: string, repo: string) {
    const findings: any[] = [];

    try {
      // Search for common secret patterns
      const secretPatterns = [
        { pattern: /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/i, type: 'exposed_api_key' },
        { pattern: /aws[_-]?access[_-]?key[_-]?id\s*[:=]\s*['"]([^'"]+)['"]/i, type: 'exposed_aws_key' },
        { pattern: /password\s*[:=]\s*['"]([^'"]+)['"]/i, type: 'hardcoded_password' },
        { pattern: /secret[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/i, type: 'exposed_secret' },
      ];

      // Search code using GitHub API
      for (const { pattern, type } of secretPatterns) {
        try {
          const searchQuery = `repo:${owner}/${repo} ${pattern.source}`;
          const results = await this.octokit.search.code({
            q: searchQuery,
            per_page: 10,
          });

          for (const item of results.data.items) {
            findings.push({
              type,
              severity: this.getSeverityForType(type),
              title: `Exposed ${type.replace(/_/g, ' ')} found in ${item.path}`,
              description: `A potential ${type} was found in the codebase.`,
              location: `${item.html_url}#L${item.name}`,
              details: {
                file: item.path,
                url: item.html_url,
                repository: item.repository.full_name,
              },
            });
          }
        } catch (error) {
          // Rate limit or other API errors - continue
          console.warn(`Search error for ${type}:`, error);
        }
      }
    } catch (error) {
      console.error('Error scanning code:', error);
    }

    return findings;
  }

  private async scanRepositorySettings(owner: string, repo: string) {
    const findings: any[] = [];

    try {
      const repoInfo = await this.octokit.repos.get({ owner, repo });

      // Check if repository is public
      if (repoInfo.data.private === false) {
        findings.push({
          type: 'public_repository',
          severity: 'medium',
          title: `Repository ${owner}/${repo} is public`,
          description: 'Public repositories expose code to anyone on the internet.',
          location: repoInfo.data.html_url,
          details: {
            visibility: 'public',
            url: repoInfo.data.html_url,
          },
        });
      }

      // Check branch protection
      const branches = await this.octokit.repos.listBranches({ owner, repo });
      for (const branch of branches.data) {
        if (branch.name === 'main' || branch.name === 'master') {
          try {
            const protection = await this.octokit.repos.getBranchProtection({
              owner,
              repo,
              branch: branch.name,
            });
            // Branch is protected
          } catch (error: any) {
            if (error.status === 404) {
              findings.push({
                type: 'unprotected_main_branch',
                severity: 'high',
                title: `Main branch ${branch.name} is not protected`,
                description: 'The main branch should have protection rules enabled.',
                location: `${repoInfo.data.html_url}/tree/${branch.name}`,
                details: {
                  branch: branch.name,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning repository settings:', error);
    }

    return findings;
  }

  private async scanForExposedResources(owner: string, repo: string) {
    const findings: any[] = [];

    try {
      // Search for S3 bucket URLs, cloud storage URLs, etc.
      const resourcePatterns = [
        { pattern: /s3:\/\/[^\s"']+/i, type: 'exposed_s3_bucket' },
        { pattern: /https?:\/\/[a-z0-9-]+\.s3\.[^/\s"']+/i, type: 'exposed_s3_url' },
        { pattern: /gs:\/\/[^\s"']+/i, type: 'exposed_gcs_bucket' },
      ];

      for (const { pattern, type } of resourcePatterns) {
        try {
          const searchQuery = `repo:${owner}/${repo} ${pattern.source}`;
          const results = await this.octokit.search.code({
            q: searchQuery,
            per_page: 10,
          });

          for (const item of results.data.items) {
            findings.push({
              type,
              severity: 'high',
              title: `Exposed ${type.replace(/_/g, ' ')} found in ${item.path}`,
              description: `A cloud storage resource URL was found in the codebase.`,
              location: item.html_url,
              details: {
                file: item.path,
                url: item.html_url,
              },
            });
          }
        } catch (error) {
          console.warn(`Search error for ${type}:`, error);
        }
      }
    } catch (error) {
      console.error('Error scanning for exposed resources:', error);
    }

    return findings;
  }

  private getSeverityForType(type: string): string {
    const severityMap: Record<string, string> = {
      exposed_api_key: 'high',
      exposed_aws_key: 'critical',
      hardcoded_password: 'critical',
      exposed_secret: 'critical',
      exposed_s3_bucket: 'high',
      exposed_s3_url: 'high',
      exposed_gcs_bucket: 'high',
      public_repository: 'medium',
      unprotected_main_branch: 'high',
    };
    return severityMap[type] || 'medium';
  }

  async generateRemediationPR(
    orgId: string,
    repoId: string,
    findingId: string,
    owner: string,
    repo: string
  ) {
    // Get finding details
    const findingResult = await pool.query(
      'SELECT * FROM attack_surface_findings WHERE id = $1',
      [findingId]
    );

    if (findingResult.rows.length === 0) {
      throw new Error('Finding not found');
    }

    const finding = findingResult.rows[0];
    const remediationSteps = await generateRemediationSteps(
      finding.finding_type,
      finding.raw_data
    );

    // Create a branch
    const branchName = `security-fix-${findingId.substring(0, 8)}`;
    
    // In a real implementation, you would:
    // 1. Create a fork or branch
    // 2. Make the necessary code changes
    // 3. Create a PR with the remediation steps

    // For now, return a placeholder
    return {
      prUrl: `https://github.com/${owner}/${repo}/pull/new/${branchName}`,
      branchName,
      remediationSteps,
    };
  }
}

