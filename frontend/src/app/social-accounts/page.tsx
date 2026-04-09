'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { socialAccountsService } from '@/services/social-accounts.service';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardBody } from '@/components/ui/Card';
import SocialAccountCard from '@/components/social/SocialAccountCard';
import toast from 'react-hot-toast';

function SocialAccountsContent() {
  const { user, loading: authLoading } = useAuth();
  const { accounts, loading, error, refresh, disconnect } = useSocialAccounts();
  const searchParams = useSearchParams();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const errorMsg = searchParams.get('error');
    if (connected === 'true') {
      toast.success('Social account connected successfully!');
      refresh();
    }
    if (errorMsg) {
      toast.error(`Connection failed: ${errorMsg}`);
    }
  }, [searchParams, refresh]);

  const handleConnectFacebook = async () => {
    setConnecting(true);
    try {
      const url = await socialAccountsService.getFacebookAuthUrl();
      // Add user ID as state parameter for the callback
      const separator = url.includes('?') ? '&' : '?';
      window.location.href = `${url}${separator}state=${user?.id}`;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to get auth URL');
      setConnecting(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    try {
      await disconnect(accountId);
      toast.success('Account disconnected');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disconnect');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
            <p className="mt-1 text-gray-600">
              Connect your social media accounts to start publishing.
            </p>
          </div>
        </div>

        {/* Connect Buttons */}
        <Card className="mb-6">
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect a New Account</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleConnectFacebook}
                disabled={connecting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <span className="mr-2 font-bold">f</span>
                {connecting ? 'Connecting...' : 'Connect Facebook'}
              </button>
              <button
                onClick={handleConnectFacebook}
                disabled={connecting}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition"
              >
                <span className="mr-2 font-bold">IG</span>
                {connecting ? 'Connecting...' : 'Connect Instagram'}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Instagram requires a Facebook Business Page with a linked Instagram Business/Creator account.
              Both are connected through Facebook Login.
            </p>
          </CardBody>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Connected Accounts */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <SocialAccountCard
                key={account._id}
                account={account}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500">
                No accounts connected yet. Connect your Facebook or Instagram account to get started.
              </p>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function SocialAccountsPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <SocialAccountsContent />
    </Suspense>
  );
}
