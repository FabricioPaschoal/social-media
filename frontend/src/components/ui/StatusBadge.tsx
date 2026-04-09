'use client';

import React from 'react';

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
  scheduled: { color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
  publishing: { color: 'bg-yellow-100 text-yellow-700', label: 'Publishing' },
  published: { color: 'bg-green-100 text-green-700', label: 'Published' },
  failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
