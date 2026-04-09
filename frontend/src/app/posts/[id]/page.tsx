'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { usePost } from '@/hooks/usePosts';
import { postsService } from '@/services/posts.service';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { post, loading, error, refresh } = usePost(params.id as string);

  const handlePublish = async () => {
    if (!post) return;
    try {
      await postsService.publishPost(post._id);
      toast.success('Post is being published!');
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsService.deletePost(post._id);
      toast.success('Post deleted');
      router.push('/posts/history');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

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

  if (!user) return null;

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error || 'Post not found'}
          </div>
        </main>
      </div>
    );
  }

  const socialAccount = typeof post.socialAccountId === 'object' ? post.socialAccountId : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
            >
              &larr; Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          </div>
          <StatusBadge status={post.status} />
        </div>

        <div className="space-y-6">
          {/* Post Content */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Post Content</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Caption</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{post.caption}</p>
                </div>
                {post.hashtags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hashtags</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {post.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {post.imagePrompt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Image Prompt</label>
                    <p className="mt-1 text-gray-700 text-sm">{post.imagePrompt}</p>
                  </div>
                )}
                {post.imageUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Image URL</label>
                    <p className="mt-1 text-sm">
                      <a
                        href={post.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline break-all"
                      >
                        {post.imageUrl}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Publishing Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Publishing Details</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Platform</label>
                  <p className="mt-1 text-gray-900 capitalize">{post.targetPlatform}</p>
                </div>
                {socialAccount && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account</label>
                    <p className="mt-1 text-gray-900">
                      {socialAccount.pageName || socialAccount.platformUsername}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {post.scheduledAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled For</label>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(post.scheduledAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
                {post.publishedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Published At</label>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(post.publishedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
                {post.platformPostId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Platform Post ID</label>
                    <p className="mt-1 text-gray-700 text-sm font-mono">{post.platformPostId}</p>
                  </div>
                )}
              </div>
              {post.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <label className="text-sm font-medium text-red-700">Error</label>
                  <p className="mt-1 text-red-600 text-sm">{post.errorMessage}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* AI Generation Info */}
          {post.aiOutput && Object.keys(post.aiOutput).length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">AI Generation Details</h2>
              </CardHeader>
              <CardBody>
                {post.aiInput && Object.keys(post.aiInput).length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500">Input Parameters</label>
                    <pre className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(post.aiInput, null, 2)}
                    </pre>
                  </div>
                )}
                {post.variations && post.variations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">AI Variations</label>
                    <div className="mt-2 space-y-2">
                      {post.variations.map((v, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{v.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {(post.status === 'draft' || post.status === 'failed') && (
              <button
                onClick={handlePublish}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Publish Now
              </button>
            )}
            {post.status !== 'publishing' && (
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
