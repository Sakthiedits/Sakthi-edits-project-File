export type VideoSourceType = 'youtube' | 'google_drive' | 'direct_mp4' | 'r2_upload';

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  video_source_type: VideoSourceType;
  video_url: string | null;
  r2_object_key: string | null;
  thumbnail_url: string | null;
  aspect_ratio?: '9:16' | '16:9';
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  video_source_type: VideoSourceType;
  video_url: string;
  thumbnail_url: string;
  aspect_ratio?: '9:16' | '16:9';
  display_order: number;
  published: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface AdminUser {
  id: number;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type VideoCategory =
  | 'VSL'
  | 'Video Ad'
  | 'Motion Graphics'
  | 'Brand Video'
  | 'Social Media'
  | 'Other';

export const VIDEO_CATEGORIES: VideoCategory[] = [
  'VSL',
  'Video Ad',
  'Motion Graphics',
  'Brand Video',
  'Social Media',
  'Other',
];
