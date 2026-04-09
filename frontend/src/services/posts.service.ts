import api from '@/lib/api';
import type {
  PostData,
  DashboardStats,
  PaginatedResponse,
  GeneratePostInput,
  AiGeneratedPost,
} from '@/types';

export const postsService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/posts/dashboard');
    return data;
  },

  async getPosts(
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<PostData>> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (status) params.status = status;
    const { data } = await api.get<PaginatedResponse<PostData>>('/posts', { params });
    return data;
  },

  async getPost(id: string): Promise<PostData> {
    const { data } = await api.get<PostData>(`/posts/${id}`);
    return data;
  },

  async createPost(postData: Record<string, any>): Promise<PostData> {
    const { data } = await api.post<PostData>('/posts', postData);
    return data;
  },

  async updatePost(id: string, postData: Record<string, any>): Promise<PostData> {
    const { data } = await api.put<PostData>(`/posts/${id}`, postData);
    return data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async publishPost(id: string): Promise<PostData> {
    const { data } = await api.post<PostData>(`/posts/${id}/publish`);
    return data;
  },

  async generateWithAi(input: GeneratePostInput): Promise<AiGeneratedPost> {
    const { data } = await api.post<AiGeneratedPost>('/ai/generate', input);
    return data;
  },
};
