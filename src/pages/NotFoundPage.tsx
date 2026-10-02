/**
 * NotFoundPage.tsx
 * 404 page with DoCA branding and navigation buttons.
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { Scale, ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div
        className="h-1.5 w-full"
        style={{
          background: 'linear-gradient(to right, #FF9933 33.3%, #FFFFFF 33.3% 66.6%, #138808 66.6%)',
        }}
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full p-8 space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center mx-auto mb-2">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-navy-900">404</h1>
          <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
          <p className="text-gray-500 text-sm">
            The requested metrological document or administrative view does not exist or has been relocated.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link to="/dashboard" className="btn btn-primary text-sm flex items-center gap-2">
              <Home className="w-4 h-4" /> Go to Dashboard
            </Link>
            <Link to="/" className="btn btn-outline text-sm">
              Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
