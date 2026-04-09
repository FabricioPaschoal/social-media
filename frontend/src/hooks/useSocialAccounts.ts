'use client';

import { useState, useEffect, useCallback } from 'react';
import { socialAccountsService } from '@/services/social-accounts.service';
import type { SocialAccount } from '@/types';

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await socialAccountsService.getAccounts();
      setAccounts(result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const disconnect = async (accountId: string) => {
    await socialAccountsService.disconnectAccount(accountId);
    await fetch();
  };

  return { accounts, loading, error, refresh: fetch, disconnect };
}
