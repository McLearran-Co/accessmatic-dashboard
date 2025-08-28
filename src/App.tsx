import React, { useState } from 'react'
import { Shield, Key, Copy, ExternalLink, CheckCircle } from 'lucide-react'

function App() {
  const [apiKey] = useState('am_' + Math.random().toString(36).substr(2, 32))
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const integrationCode = `<script 
  src="https://cdn.accessmatic.us/sdk/v1/accessmatic.min.js"
  data-accessmatic-key="${apiKey}"
  data-auto-discover="true">
</script>`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">AccessMatic Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Trial Active
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">🚀 Quick Setup</h2>
            <p className="text-blue-700 mb-4">
              Add AccessMatic to your website in 2 minutes
            </p>

            {/* Integration Code */}
            <div className="bg-white p-4 rounded border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">1. Copy this script tag:</h3>
                <button
                  onClick={() => copyToClipboard(integrationCode)}
                  className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  {copied ? <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{integrationCode}</code>
              </pre>
            </div>

            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-medium text-sm mb-2">2. Paste it in your website's &lt;head&gt; section</h3>
              <p className="text-sm text-gray-600">
                Works with WordPress, Drupal, or any website. No technical knowledge required.
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              
                href="https://docs.accessmatic.us"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Integration Guide
              </a>
              
                href="mailto:hello@accessmatic.us"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Need Help? Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Key className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        API Key
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Active
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Documents Processed
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg. Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        --
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExternalLink className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Plan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Trial
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Full Dashboard Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              Advanced analytics, document management, and compliance reporting will be available soon.
            </p>
            <p className="text-sm text-gray-500">
              For now, add the script above to your website and start making PDFs accessible!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
