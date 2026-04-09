'use client';

import React from 'react';
import { format } from 'date-fns';
import type { SocialAccount } from '@/types';

interface SocialAccountCardProps {
  account: SocialAccount;
  onDisconnect: (id: string) => void;
}

export default function SocialAccountCard({ account, onDisconnect }: SocialAccountCardProps) {
  const isExpired = account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            account.platform === 'facebook' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            {account.platform === 'facebook' ? 'f' : 'IG'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {account.pageName || account.platformUsername || account.platform}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isExpired ? (
            <span className="text-xs text-red-600 font-medium">Token Expired</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">Active</span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {account.platformUsername && (
          <p>Username: {account.platformUsername}</p>
        )}
        {account.tokenExpiresAt && (
          <p>Token expires: {format(new Date(account.tokenExpiresAt), 'MMM d, yyyy')}</p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onDisconnect(account._id)}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
