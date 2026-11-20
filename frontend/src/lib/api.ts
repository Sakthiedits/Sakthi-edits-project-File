/**
 * API client for Sakthiedits.
 *
 * All requests are made to the `/api` base path, which is proxied to the
 * backend during local development (via Vite proxy config) and served from
 * the same origin in production.
 *
 * Every call includes `credentials: 'include'` so that the session cookie is
 * sent automatically, enabling admin authentication without any manual token
 * management.
 */

import type {
  Project,
  ProjectFormData,
  ApiResponse,
  PaginatedResponse,
  AdminUser,
  LoginCredentials,
  VideoSourceType,
} from '../types';
import { SAMPLE_PROJECTS } from './sampleProjects';

import { deleteVideoFile } from './videoStorage';

// ---------------------------------------------------------------------------
// Internal helpers & Local Storage Fallback
// ---------------------------------------------------------------------------

const BASE_URL = '/api';
const STORAGE_PROJECTS_KEY = 'sakthiedits_portfolio_projects_v6';
const STORAGE_SESSION_KEY = 'sakthiedits_admin_session';

export function getStoredProjects(): Project[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Only filter out obsolete mock videos
          const hasBrokenOldMock = parsed.some(
            (p: any) =>
              p.video_url?.includes('dQw4w9WgXcQ') ||
              p.video_url?.includes('ForBiggerBlazes') ||
              p.video_url?.includes('ForBiggerEscapes')
          );
          if (!hasBrokenOldMock) return parsed;
        }
      }
    }
  } catch {
    // ignore
  }
  return [...SAMPLE_PROJECTS];
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
      // Dispatch both CustomEvent and standard storage event for instant cross-component & cross-tab sync
      window.dispatchEvent(new CustomEvent('sakthi_projects_updated', { detail: projects }));
    }
  } catch (err) {
    console.error('Failed to save projects locally:', err);
  }
}

/** Shared fetch wrapper that attaches credentials and parses JSON. */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let json: T;
  try {
    json = (await response.json()) as T;
  } catch {
    throw new Error(`Non-JSON response from ${path} (status ${response.status})`);
  }

  return json;
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

/**
 * Fetch all published projects (public-facing portfolio listing).
 *
 * @returns ApiResponse wrapping an array of published Projects.
 */
export async function getPublicProjects(): Promise<ApiResponse<Project[]>> {
  try {
    const res = await request<ApiResponse<Project[]>>('/projects');
    if (res.success && res.data && res.data.length > 0) {
      saveStoredProjects(res.data);
      return res;
    }
  } catch {
    // Backend offline / fallback to local storage
  }
  const local = getStoredProjects().filter((p) => p.published !== false);
  return { success: true, data: local };
}

/**
 * Fetch a single published project by its URL slug.
 *
 * @param slug - The project's unique URL slug.
 * @returns ApiResponse wrapping the matching Project.
 */
export async function getPublicProject(
  slug: string,
): Promise<ApiResponse<Project>> {
  try {
    const res = await request<ApiResponse<Project>>(`/projects/${encodeURIComponent(slug)}`);
    if (res.success && res.data) return res;
  } catch {
    // fallback
  }
  const match = getStoredProjects().find((p) => p.slug === slug);
  if (match) return { success: true, data: match };
  return { success: false, error: 'Project not found' };
}

// ---------------------------------------------------------------------------
// Admin — authentication
// ---------------------------------------------------------------------------

/**
 * Authenticate as an admin and obtain a session cookie or local session.
 *
 * @param credentials - `{ username, password }` pair.
 * @returns ApiResponse wrapping the authenticated AdminUser.
 */
export async function adminLogin(
  credentials: LoginCredentials,
): Promise<ApiResponse<AdminUser>> {
  try {
    return await request<ApiResponse<AdminUser>>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch {
    // Offline / local fallback authentication
    const userLower = credentials.username.trim().toLowerCase();
    const pass = credentials.password.trim();
    if (
      (userLower === 'admin' || userLower === 'sakthi') &&
      (pass === 'sakthi' || pass === 'sakthi123' || pass === 'admin' || pass === 'admin123')
    ) {
      const user: AdminUser = { id: 1, username: credentials.username.trim() };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      }
      return { success: true, data: user };
    }
    throw new Error('Invalid username or password. (Hint: Try username "sakthi" & password "sakthi123")');
  }
}

/**
 * Destroy the current admin session.
 *
 * @returns ApiResponse with a success flag and optional message.
 */
export async function adminLogout(): Promise<ApiResponse<null>> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
  try {
    return await request<ApiResponse<null>>('/admin/logout', { method: 'POST' });
  } catch {
    return { success: true, data: null };
  }
}

/**
 * Check whether the current session belongs to a valid admin session.
 *
 * @returns ApiResponse wrapping the AdminUser if authenticated.
 */
export async function checkAdminSession(): Promise<ApiResponse<AdminUser>> {
  try {
    const res = await request<ApiResponse<AdminUser>>('/admin/session');
    if (res.success && res.data) return res;
  } catch {
    // Check local session
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (raw) {
        try {
          const user = JSON.parse(raw) as AdminUser;
          return { success: true, data: user };
        } catch {
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }
      }
    }
  }
  return { success: false, error: 'Unauthenticated' };
}

// ---------------------------------------------------------------------------
// Admin — project CRUD
// ---------------------------------------------------------------------------

export interface AdminProjectsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

/**
 * List all projects in the admin panel with optional search / filter / pagination.
 *
 * @param params - Optional query parameters.
 * @returns PaginatedResponse wrapping an array of Projects.
 */
export async function adminGetProjects(
  params?: AdminProjectsParams,
): Promise<PaginatedResponse<Project>> {
  try {
    const qs = new URLSearchParams();
    if (params?.search)   qs.set('search',   params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.page)     qs.set('page',     String(params.page));
    if (params?.limit)    qs.set('limit',    String(params.limit));

    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await request<PaginatedResponse<Project>>(`/admin/projects${query}`);
    if (res.success && res.data) {
      saveStoredProjects(res.data);
      return res;
    }
  } catch {
    // Offline / fallback to stored projects
  }

  let list = getStoredProjects();
  if (params?.category && params.category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }

  return {
    success: true,
    data: list,
    total: list.length,
    page: params?.page || 1,
    limit: params?.limit || 50,
  };
}

/**
 * Fetch a single project by its numeric ID (admin).
 *
 * @param id - Numeric project ID.
 * @returns ApiResponse wrapping the Project.
 */
export async function adminGetProject(
  id: number,
): Promise<ApiResponse<Project>> {
  try {
    return await request<ApiResponse<Project>>(`/admin/projects/${id}`);
  } catch {
    const match = getStoredProjects().find((p) => p.id === id);
    if (match) return { success: true, data: match };
    return { success: false, error: 'Project not found' };
  }
}

/**
 * Create a new project.
 *
 * @param data - ProjectFormData payload.
 * @returns ApiResponse wrapping the newly-created Project.
 */
export async function adminCreateProject(
  data: ProjectFormData,
): Promise<ApiResponse<Project>> {
  try {
    const res = await request<ApiResponse<Project>>('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data) {
      const current = getStoredProjects();
      saveStoredProjects([res.data, ...current]);
      return res;
    }
  } catch {
    // Local fallback
  }

  const current = getStoredProjects();
  const slug =
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

  // Auto-generate thumbnail for Google Drive or YouTube if empty
  let thumb = data.thumbnail_url?.trim() || '';
  if (!thumb) {
    if (data.video_source_type === 'google_drive') {
      const driveId = VideoSourceValidator.extractGoogleDriveId(data.video_url);
      if (driveId) {
        thumb = `https://lh3.googleusercontent.com/d/${driveId}=w1000`;
      }
    } else if (data.video_source_type === 'youtube') {
      const ytId = VideoSourceValidator.extractYouTubeId(data.video_url);
      if (ytId) {
        thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }
  }

  const newProject: Project = {
    id: Date.now(),
    title: data.title,
    slug,
    description: data.description || '',
    category: data.category,
    video_source_type: data.video_source_type,
    video_url: data.video_url || '',
    r2_object_key: null,
    thumbnail_url: thumb || null,
    aspect_ratio: data.aspect_ratio || (data.category === 'Social Media' ? '9:16' : '16:9'),
    display_order: data.display_order ?? 0,
    published: data.published ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newProject, ...current];
  saveStoredProjects(updated);
  return { success: true, data: newProject };
}

/**
 * Update an existing project by ID.
 *
 * @param id   - Numeric project ID.
 * @param data - Partial or full ProjectFormData payload.
 * @returns ApiResponse wrapping the updated Project.
 */
export async function adminUpdateProject(
  id: number,
  data: Partial<ProjectFormData>,
): Promise<ApiResponse<Project>> {
  try {
    const res = await request<ApiResponse<Project>>(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.success && res.data) {
      const current = getStoredProjects();
      const updated = current.map((p) => (p.id === id ? res.data! : p));
      saveStoredProjects(updated);
      return res;
    }
  } catch {
    // Local fallback
  }

  const current = getStoredProjects();
  const existing = current.find((p) => p.id === id);
  if (!existing) {
    throw new Error('Project not found');
  }

  let thumb =
    (data.thumbnail_url !== undefined ? data.thumbnail_url.trim() : existing.thumbnail_url) ||
    '';
  const sourceType = data.video_source_type || existing.video_source_type;
  const videoUrl = data.video_url !== undefined ? data.video_url : existing.video_url;

  if (!thumb && videoUrl) {
    if (sourceType === 'google_drive') {
      const driveId = VideoSourceValidator.extractGoogleDriveId(videoUrl);
      if (driveId) thumb = `https://lh3.googleusercontent.com/d/${driveId}=w1000`;
    } else if (sourceType === 'youtube') {
      const ytId = VideoSourceValidator.extractYouTubeId(videoUrl);
      if (ytId) thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }

  const updatedProject: Project = {
    ...existing,
    ...data,
    thumbnail_url: thumb || null,
    updated_at: new Date().toISOString(),
  };

  const updated = current.map((p) => (p.id === id ? updatedProject : p));
  saveStoredProjects(updated);
  return { success: true, data: updatedProject };
}

/**
 * Permanently delete a project by ID.
 *
 * @param id - Numeric project ID.
 * @returns ApiResponse with success flag and optional message.
 */
export async function adminDeleteProject(
  id: number,
): Promise<ApiResponse<null>> {
  try {
    await request<ApiResponse<null>>(`/admin/projects/${id}`, {
      method: 'DELETE',
    });
  } catch {
    // Local fallback
  }

  const current = getStoredProjects();
  const deletedItem = current.find((p) => p.id === id);
  if (deletedItem?.video_url?.startsWith('indexeddb://')) {
    const key = deletedItem.video_url.replace('indexeddb://', '');
    deleteVideoFile(key).catch(() => {});
  }
  const filtered = current.filter((p) => p.id !== id);
  saveStoredProjects(filtered);
  return { success: true, data: null };
}

/**
 * Toggle a project's published status.
 *
 * @param id        - Numeric project ID.
 * @param published - `true` to publish, `false` to unpublish.
 * @returns ApiResponse wrapping the updated Project.
 */
export async function adminPublishProject(
  id: number,
  published: boolean,
): Promise<ApiResponse<Project>> {
  try {
    const res = await request<ApiResponse<Project>>(`/admin/projects/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ published }),
    });
    if (res.success && res.data) {
      const current = getStoredProjects();
      saveStoredProjects(current.map((p) => (p.id === id ? res.data! : p)));
      return res;
    }
  } catch {
    // Local fallback
  }

  const current = getStoredProjects();
  const item = current.find((p) => p.id === id);
  if (!item) throw new Error('Project not found');

  const updatedItem: Project = {
    ...item,
    published,
    updated_at: new Date().toISOString(),
  };
  const updated = current.map((p) => (p.id === id ? updatedItem : p));
  saveStoredProjects(updated);
  return { success: true, data: updatedItem };
}

// ---------------------------------------------------------------------------
// VideoSourceValidator
// ---------------------------------------------------------------------------

/**
 * Utility namespace for detecting and converting video source URLs.
 *
 * Supported source types:
 *  - `youtube`      — various youtube.com / youtu.be URL patterns
 *  - `google_drive` — drive.google.com file URLs
 *  - `direct_mp4`   — any URL ending in `.mp4` (or `.webm` / `.ogg`)
 *  - `r2_upload`    — Cloudflare R2 object URLs (detected last as a fallback)
 */
export const VideoSourceValidator = {
  // -------------------------------------------------------------------------
  // Detection
  // -------------------------------------------------------------------------

  /**
   * Analyse a URL and return the appropriate VideoSourceType, or `null` if the
   * URL cannot be recognised.
   */
  detectVideoSourceType(url: string): VideoSourceType | null {
    if (!url || !url.trim()) return null;

    if (VideoSourceValidator.extractYouTubeId(url) !== null) return 'youtube';
    if (VideoSourceValidator.extractGoogleDriveId(url) !== null) return 'google_drive';

    // Direct video files, local assets, blobs, and indexeddb blobs
    if (
      url.startsWith('indexeddb://') ||
      url.startsWith('blob:') ||
      url.startsWith('/videos/') ||
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
    ) {
      return 'direct_mp4';
    }

    // Cloudflare R2 / generic CDN bucket URL
    if (
      /r2\.cloudflarestorage\.com/i.test(url) ||
      /\.r2\.dev\//i.test(url) ||
      /pub-[a-f0-9]+\.r2\.dev\//i.test(url)
    ) {
      return 'r2_upload';
    }

    // Fallback to direct_mp4 if unknown link so it doesn't break
    return 'direct_mp4';
  },

  // -------------------------------------------------------------------------
  // YouTube helpers
  // -------------------------------------------------------------------------

  /**
   * Extract the 11-character video ID from any supported YouTube URL format.
   *
   * Supported patterns:
   *  - https://www.youtube.com/watch?v=VIDEO_ID
   *  - https://youtu.be/VIDEO_ID
   *  - https://youtube.com/shorts/VIDEO_ID
   *  - https://www.youtube.com/embed/VIDEO_ID
   *
   * @returns The video ID string, or `null` if the URL is not a YouTube link.
   */
  extractYouTubeId(url: string): string | null {
    if (!url) return null;

    // Standard watch URL: ?v=... (also handles additional query params)
    const watchMatch = url.match(
      /(?:youtube\.com\/watch\?(?:[^&]*&)*v=)([a-zA-Z0-9_-]{11})/,
    );
    if (watchMatch) return watchMatch[1];

    // Short link: youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // Shorts: youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // Embed URL: youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return null;
  },

  /**
   * Build the standard YouTube iframe embed URL for the given video ID.
   *
   * Query params included:
   *  - `rel=0`         — suppress related-video sidebar
   *  - `modestbranding=1` — reduce YouTube branding
   *
   * @param videoId - 11-character YouTube video ID.
   */
  getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  },

  // -------------------------------------------------------------------------
  // Google Drive helpers
  // -------------------------------------------------------------------------

  /**
   * Extract the file ID from any supported Google Drive URL format.
   *
   * Supported patterns:
   *  - https://drive.google.com/file/d/FILE_ID/view
   *  - https://drive.google.com/file/d/FILE_ID/preview
   *  - https://drive.google.com/open?id=FILE_ID
   *  - https://drive.google.com/uc?id=FILE_ID
   *
   * @returns The Drive file ID string, or `null` if not a Drive URL.
   */
  extractGoogleDriveId(url: string): string | null {
    if (!url) return null;

    // /file/d/FILE_ID/ pattern (view, preview, edit, etc.)
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    // ?id=FILE_ID pattern (open, uc, etc.)
    const idMatch = url.match(/drive\.google\.com\/(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];

    return null;
  },

  /**
   * Build an embeddable preview URL for a Google Drive video file.
   *
   * Uses the `/preview` endpoint which renders an inline video player without
   * requiring the viewer to be logged in (for publicly shared files).
   *
   * @param fileId - Google Drive file ID.
   */
  getGoogleDriveEmbedUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`;
  },

  /**
   * Build a direct download / streaming URL for a Google Drive file.
   *
   * Useful as a `<video src="...">` source when the file is public.
   *
   * @param fileId - Google Drive file ID.
   */
  getGoogleDriveDirectUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  },
} as const;

/**
 * Upload a video file to R2 via the worker.
 */
export async function adminUploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/admin/upload/video`);
    xhr.withCredentials = true;

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        resolve(data);
      } catch {
        resolve({ success: false, error: 'Failed to parse upload response' });
      }
    };

    xhr.onerror = () => {
      resolve({ success: false, error: 'Network error during video upload' });
    };

    xhr.send(formData);
  });
}

/**
 * Fetch R2 storage usage statistics.
 */
export async function adminGetUploadUsage(): Promise<{
  success: boolean;
  usage?: {
    totalBytes: number;
    totalMB: number;
    totalGB: number;
    limitGB: number;
    usedPercent: number;
    fileCount: number;
    remainingGB: number;
  };
  error?: string;
}> {
  try {
    return await request('/admin/upload/usage');
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch storage usage' };
  }
}

