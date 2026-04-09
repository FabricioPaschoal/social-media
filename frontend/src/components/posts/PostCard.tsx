'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { PostData } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface PostCardProps {
  post: PostData;
}

export default function PostCard({ post }: PostCardProps) {
  const socialAccount = typeof post.socialAccountId === 'object' ? post.socialAccountId : null;

  return (
    <Link href={`/posts/${post._id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
          <StatusBadge status={post.status} />
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.caption}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
              post.targetPlatform === 'facebook'
                ? 'bg-blue-50 text-blue-700'
                : post.targetPlatform === 'instagram'
                  ? 'bg-pink-50 text-pink-700'
                  : 'bg-purple-50 text-purple-700'
            }`}>
              {post.targetPlatform}
            </span>
            {socialAccount && (
              <span>{socialAccount.pageName || socialAccount.platformUsername}</span>
            )}
          </div>
          <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
        </div>
        {post.scheduledAt && post.status === 'scheduled' && (
          <div className="mt-2 text-xs text-blue-600">
            Scheduled: {format(new Date(post.scheduledAt), 'MMM d, yyyy h:mm a')}
          </div>
        )}
        {post.errorMessage && post.status === 'failed' && (
          <div className="mt-2 text-xs text-red-600 line-clamp-1">
            Error: {post.errorMessage}
          </div>
        )}
      </div>
    </Link>
  );
}
