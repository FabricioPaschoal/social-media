import api from '@/lib/api';
import type { SocialAccount } from '@/types';

export const socialAccountsService = {
  async getAccounts(): Promise<SocialAccount[]> {
    const { data } = await api.get<SocialAccount[]>('/social-accounts');
    return data;
  },

  async getFacebookAuthUrl(): Promise<string> {
    const { data } = await api.get<{ url: string }>('/social-accounts/facebook/auth-url');
    return data.url;
  },

  async disconnectAccount(accountId: string): Promise<void> {
    await api.delete(`/social-accounts/${accountId}`);
  },
};
