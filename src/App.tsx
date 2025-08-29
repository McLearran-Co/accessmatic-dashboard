import React, { useState } from 'react'
import { Shield, Copy, CheckCircle } from 'lucide-react'

function App() {
  const [copied, setCopied] = useState(false)
  const apiKey = 'am_demo123456789'

  const copyCode = () => {
    const code = `<script src="https://cdn.accessmatic.us/accessmatic.min.js" data-accessmatic-key="${apiKey}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">AccessMatic Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Quick Setup</h2>
          <p className="text-blue-700 mb-4">Add AccessMatic to your website in 2 minutes</p>
          
          <div className="bg-white p-4 rounded border mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">1. Copy this script tag:</h3>
              <button
                onClick={copyCode}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                {copied ? <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              {`<script src="https://cdn.accessmatic.us/accessmatic.min.js" data-accessmatic-key="${apiKey}"></script>`}
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-sm mb-2">2. Paste it in your website head section</h3>
            <p className="text-sm text-gray-600">Works with WordPress, Drupal, or any website.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="bg-white p-5 shadow rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">API Key</h3>
            <p className="text-lg font-medium text-gray-900">Active</p>
          </div>
          <div className="bg-white p-5 shadow rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Documents</h3>
            <p className="text-lg font-medium text-gray-900">0</p>
          </div>
          <div className="bg-white p-5 shadow rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Avg Score</h3>
            <p className="text-lg font-medium text-gray-900">--</p>
          </div>
          <div className="bg-white p-5 shadow rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Plan</h3>
            <p className="text-lg font-medium text-gray-900">Trial</p>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Coming Soon</h3>
          <p className="text-gray-600">Advanced features will be available soon!</p>
        </div>
      </div>
    </div>
  )
}

export default App
