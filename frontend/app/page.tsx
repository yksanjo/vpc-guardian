'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            SMB Security Suite
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            AI-Native Security Platform for Modern Businesses
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <ProductCard
            title="Attack Surface Monitor"
            subtitle="SurfaceAI"
            description="Continuously scan GitHub repos, cloud buckets, and DNS records. AI-powered risk correlation with auto-remediation."
            price="$29-99/month"
          />
          <ProductCard
            title="Log Intelligence"
            subtitle="LogCopilot"
            description="Natural language log analysis for non-security experts. AI anomaly detection with plain-English alerts."
            price="$49-149/month"
          />
          <ProductCard
            title="Cloud Network Monitor"
            subtitle="VPC Guardian"
            description="Analyze VPC flow logs and IAM events. Detect lateral movement and data exfiltration patterns."
            price="$79-199/month"
          />
          <ProductCard
            title="Pentest Assistant"
            subtitle="PentestGPT"
            description="Browser-based AI copilot for security testing. Integrates with Burp Suite and OWASP ZAP."
            price="$99-299/month"
          />
          <ProductCard
            title="Unified Dashboard"
            subtitle="SMB Security Suite"
            description="Single pane of glass for all security products. Compliance reporting and centralized threat view."
            price="$199-499/month"
            featured
          />
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  title,
  subtitle,
  description,
  price,
  featured = false,
}: {
  title: string
  subtitle: string
  description: string
  price: string
  featured?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-lg ${
        featured ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {featured && (
          <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded">
            BUNDLE
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      <p className="text-gray-600 mb-4">{description}</p>
      <p className="text-lg font-semibold text-primary-600">{price}</p>
    </div>
  )
}

