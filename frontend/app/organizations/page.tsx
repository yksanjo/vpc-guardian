'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function OrganizationsPage() {
  const router = useRouter()
  const { setOrganization } = useAuthStore()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [newOrgName, setNewOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const response = await api.get('/organizations')
      setOrganizations(response.data.organizations)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await api.post('/organizations', { name: newOrgName })
      await loadOrganizations()
      setNewOrgName('')
    } catch (error) {
      console.error('Failed to create organization:', error)
    } finally {
      setCreating(false)
    }
  }

  const selectOrganization = (orgId: string) => {
    setOrganization(orgId)
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Select or Create Organization</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
          <form onSubmit={createOrganization} className="flex gap-4">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Organizations</h2>
          {organizations.length === 0 ? (
            <p className="text-gray-600">No organizations yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => selectOrganization(org.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition"
                >
                  <div className="font-semibold text-lg">{org.name}</div>
                  <div className="text-sm text-gray-500">
                    Role: {org.member_role} • Created {new Date(org.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

