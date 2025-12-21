-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization members (many-to-many)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  product VARCHAR(50) NOT NULL, -- 'attack-surface', 'log-intelligence', 'cloud-monitor', 'pentest', 'suite'
  plan VARCHAR(50) NOT NULL, -- 'starter', 'professional', 'enterprise'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attack Surface Monitor tables
CREATE TABLE IF NOT EXISTS github_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  repo_name VARCHAR(255) NOT NULL,
  repo_url VARCHAR(500) NOT NULL,
  github_repo_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  last_scan_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attack_surface_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  github_repo_id UUID REFERENCES github_repos(id) ON DELETE CASCADE,
  finding_type VARCHAR(100) NOT NULL, -- 'exposed_key', 'hardcoded_secret', 'public_bucket', etc.
  severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title VARCHAR(500) NOT NULL,
  description TEXT,
  ai_explanation TEXT, -- Plain English explanation
  location VARCHAR(500), -- File path, URL, etc.
  raw_data JSONB,
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'false_positive'
  remediation_pr_url VARCHAR(500),
  remediation_issue_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Log Intelligence tables
CREATE TABLE IF NOT EXISTS log_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'api', 's3', 'opentelemetry', 'webhook'
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  log_source_id UUID REFERENCES log_sources(id) ON DELETE CASCADE,
  anomaly_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  ai_explanation TEXT,
  log_data JSONB,
  playbook_suggestions JSONB,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cloud Network Monitor tables
CREATE TABLE IF NOT EXISTS cloud_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_provider VARCHAR(50) NOT NULL, -- 'aws', 'gcp', 'azure'
  account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255),
  credentials_config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cloud_network_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cloud_account_id UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
  finding_type VARCHAR(100) NOT NULL, -- 'lateral_movement', 'data_exfiltration', 'suspicious_iam', etc.
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  ai_explanation TEXT,
  source_ip VARCHAR(100),
  destination_ip VARCHAR(100),
  protocol VARCHAR(20),
  raw_data JSONB,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pentest Assistant tables
CREATE TABLE IF NOT EXISTS pentest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_url VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused'
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pentest_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pentest_session_id UUID REFERENCES pentest_sessions(id) ON DELETE CASCADE,
  vulnerability_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  technical_details TEXT,
  executive_summary TEXT,
  remediation_steps TEXT,
  proof_of_concept TEXT,
  raw_data JSONB,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance reports
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'soc2', 'iso27001', 'custom'
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attack_surface_findings_org ON attack_surface_findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_attack_surface_findings_status ON attack_surface_findings(status);
CREATE INDEX IF NOT EXISTS idx_log_anomalies_org ON log_anomalies(organization_id);
CREATE INDEX IF NOT EXISTS idx_cloud_network_findings_org ON cloud_network_findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_pentest_findings_session ON pentest_findings(pentest_session_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

