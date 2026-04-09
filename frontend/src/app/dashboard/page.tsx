'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/usePosts';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardBody } from '@/components/ui/Card';
import PostCard from '@/components/posts/PostCard';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = useDashboard();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here&apos;s an overview of your social media activity.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data?.stats.totalPosts ?? 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {data?.stats.published ?? 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {data?.stats.scheduled ?? 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {data?.stats.failed ?? 0}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/posts/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            + Create Post
          </Link>
          <Link
            href="/social-accounts"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
          >
            Manage Accounts
          </Link>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link
              href="/posts/history"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          {data?.recentPosts && data.recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-gray-500 mb-4">No posts yet. Create your first post!</p>
                <Link
                  href="/posts/create"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                >
                  + Create Post
                </Link>
              </CardBody>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
