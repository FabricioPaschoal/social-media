export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: Record<string, any>;
  createdAt: string;
}

export interface SocialAccount {
  _id: string;
  userId: string;
  platform: 'facebook' | 'instagram';
  platformUserId: string;
  platformUsername: string;
  pageName?: string;
  pageId?: string;
  igUserId?: string;
  accessToken: string;
  tokenExpiresAt: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PostData {
  _id: string;
  userId: string;
  socialAccountId: SocialAccount | string;
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  imageUrl?: string;
  category: string;
  emojis: string[];
  variations: Array<{ caption: string; hashtags: string[] }>;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  targetPlatform: 'facebook' | 'instagram' | 'both';
  scheduledAt?: string;
  publishedAt?: string;
  platformPostId?: string;
  platformResponse?: string;
  errorMessage?: string;
  aiInput: Record<string, any>;
  aiOutput: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AiGeneratedPost {
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  title: string;
  category: string;
  emojis: string[];
  variations: Array<{ caption: string; hashtags: string[] }>;
}

export interface GeneratePostInput {
  postDescription: string;
  goal?: string;
  audience?: string;
  tone?: string;
  mediaType?: string;
  mandatoryKeywords?: string[];
  brandName?: string;
}

export interface DashboardStats {
  stats: {
    totalPosts: number;
    published: number;
    scheduled: number;
    failed: number;
  };
  recentPosts: PostData[];
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  access_token: string;
}

export interface PaginatedResponse<T> {
  posts: T[];
  total: number;
}

export interface LogEntry {
  _id: string;
  userId: string;
  postId: PostData | string;
  level: 'info' | 'warn' | 'error' | 'success';
  action: string;
  message: string;
  details: Record<string, any>;
  createdAt: string;
}
