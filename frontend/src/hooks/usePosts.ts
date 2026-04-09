'use client';

import { useState, useEffect, useCallback } from 'react';
import { postsService } from '@/services/posts.service';
import type { PostData, DashboardStats, PaginatedResponse } from '@/types';

export function useDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await postsService.getDashboard();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function usePostsList(status?: string) {
  const [data, setData] = useState<PaginatedResponse<PostData>>({ posts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await postsService.getPosts(status, page);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, page, setPage, refresh: fetch };
}

export function usePost(id: string) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await postsService.getPost(id);
      setPost(result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { post, loading, error, refresh: fetch };
}
