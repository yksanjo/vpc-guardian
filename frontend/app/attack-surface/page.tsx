'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Plus, Search, AlertCircle, Shield, GitBranch, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AttackSurfacePage() {
  const queryClient = useQueryClient()
  const [showAddRepo, setShowAddRepo] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const { data: repos } = useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      const response = await api.get('/repos')
      return response.data.repos
    },
  })

  const { data: findings } = useQuery({
    queryKey: ['findings', severityFilter],
    queryFn: async () => {
      const params = severityFilter !== 'all' ? `?severity=${severityFilter}` : ''
      const response = await api.get(`/findings${params}`)
      return response.data.findings
    },
  })

  const filteredFindings = findings?.filter((f: any) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.repo_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: findings?.length || 0,
    critical: findings?.filter((f: any) => f.severity === 'critical').length || 0,
    high: findings?.filter((f: any) => f.severity === 'high').length || 0,
    open: findings?.filter((f: any) => f.status === 'open').length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-primary-600" size={32} />
                Attack Surface Monitor
              </h1>
              <p className="text-gray-600 mt-1">Continuous security monitoring for your GitHub repositories</p>
            </div>
            <button
              onClick={() => setShowAddRepo(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus size={20} />
              Add Repository
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Findings"
            value={stats.total}
            icon={AlertCircle}
            color="blue"
          />
          <StatCard
            label="Critical"
            value={stats.critical}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            label="High Severity"
            value={stats.high}
            icon={AlertCircle}
            color="orange"
          />
          <StatCard
            label="Open Issues"
            value={stats.open}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {showAddRepo && (
          <AddRepoModal
            onClose={() => setShowAddRepo(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['repos'] })
              setShowAddRepo(false)
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repositories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GitBranch size={20} />
                Repositories
              </h2>
              {repos?.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600 mb-4">No repositories added yet</p>
                  <button
                    onClick={() => setShowAddRepo(true)}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Add your first repository →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {repos?.map((repo: any) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Findings Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Security Findings</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search findings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {filteredFindings?.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">
                    {searchQuery ? 'No findings match your search' : 'No findings yet. Run a scan to get started.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFindings?.map((finding: any) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon size={32} className="opacity-50" />
      </div>
    </div>
  )
}

function RepoCard({ repo }: { repo: any }) {
  const queryClient = useQueryClient()
  const [scanning, setScanning] = useState(false)

  const scanMutation = useMutation({
    mutationFn: async () => {
      const token = prompt('Enter GitHub token:')
      if (!token) return
      return api.post(`/repos/${repo.id}/scan`, { github_token: token })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] })
      setScanning(false)
    },
  })

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{repo.repo_name}</h3>
          <p className="text-sm text-gray-500 truncate">{repo.repo_url}</p>
        </div>
        {repo.is_active ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">Inactive</span>
        )}
      </div>
      {repo.last_scan_at && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock size={12} />
          Scanned {formatDistanceToNow(new Date(repo.last_scan_at), { addSuffix: true })}
        </div>
      )}
      <button
        onClick={() => {
          setScanning(true)
          scanMutation.mutate()
        }}
        disabled={scanning}
        className="w-full bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
      >
        {scanning ? 'Scanning...' : 'Scan Now'}
      </button>
    </div>
  )
}

function FindingCard({ finding }: { finding: any }) {
  const queryClient = useQueryClient()
  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  const statusColors = {
    open: 'bg-red-50 text-red-700',
    acknowledged: 'bg-yellow-50 text-yellow-700',
    resolved: 'bg-green-50 text-green-700',
    false_positive: 'bg-gray-50 text-gray-700',
  }

  return (
    <div className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
      finding.severity === 'critical' ? 'border-red-200 bg-red-50/50' :
      finding.severity === 'high' ? 'border-orange-200 bg-orange-50/50' :
      'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle
              className={
                finding.severity === 'critical' ? 'text-red-600' :
                finding.severity === 'high' ? 'text-orange-600' :
                'text-gray-600'
              }
              size={24}
            />
            <h3 className="font-semibold text-lg text-gray-900">{finding.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${severityColors[finding.severity as keyof typeof severityColors]}`}>
              {finding.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{finding.ai_explanation}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📍 {finding.location}</span>
            {finding.repo_name && <span>📦 {finding.repo_name}</span>}
            <span>🕒 {formatDistanceToNow(new Date(finding.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        <select
          value={finding.status}
          onChange={async (e) => {
            await api.patch(`/findings/${finding.id}`, { status: e.target.value })
            queryClient.invalidateQueries({ queryKey: ['findings'] })
          }}
          className={`px-3 py-2 rounded-lg text-sm font-semibold border-0 ${statusColors[finding.status as keyof typeof statusColors]}`}
        >
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="false_positive">False Positive</option>
        </select>
      </div>
      {finding.remediation_pr_url && (
        <a
          href={finding.remediation_pr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
        >
          View Remediation PR →
        </a>
      )}
    </div>
  )
}

function AddRepoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [repoName, setRepoName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/repos', { repo_name: repoName, repo_url: repoUrl, github_token: githubToken })
      onSuccess()
    } catch (error) {
      console.error('Failed to add repository:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Add GitHub Repository</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository Name
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="owner/repository"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository URL
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Token
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Token is encrypted and stored securely</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {loading ? 'Adding...' : 'Add Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

