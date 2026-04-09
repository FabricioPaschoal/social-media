'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">SocialAI</h1>
          <p className="mt-2 text-gray-600">AI-Powered Social Media Management</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
