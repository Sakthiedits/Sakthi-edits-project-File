/**
 * Custom React hooks for data-fetching in Sakthiedits.
 *
 * All hooks use `useEffect` for their initial fetch, `useCallback` for the
 * refetch helper, and expose a consistent `{ loading, error }` shape so
 * consumers can render loading skeletons and error messages uniformly.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPublicProjects,
  adminGetProjects,
  checkAdminSession,
  getStoredProjects,
  type AdminProjectsParams,
} from '../lib/api';
import type { Project, AdminUser } from '../types';

// ---------------------------------------------------------------------------
// usePublicProjects
// ---------------------------------------------------------------------------

export interface UsePublicProjectsResult {
  /** Filtered (by category) list of published projects. */
  projects: Project[];
  loading: boolean;
  error: string | null;
  /** Call to manually re-fetch the project list from the server. */
  refetch: () => void;
}

/**
 * Fetch and (optionally) filter the public list of published projects.
 *
 * Filtering by `category` is performed client-side after the fetch so that a
 * single network request populates all category tabs without extra round-trips.
 *
 * @param category - When provided, only projects whose `category` matches this
 *                   string (case-insensitive) are included in the result.
 *
 * @example
 * const { projects, loading, error } = usePublicProjects('VSL');
 */
import { SAMPLE_PROJECTS } from '../lib/sampleProjects';

export function usePublicProjects(category?: string): UsePublicProjectsResult {
  const [allProjects, setAllProjects] = useState<Project[]>(() => {
    try {
      const stored = getStoredProjects().filter((p) => p.published !== false);
      return stored.length > 0 ? stored : SAMPLE_PROJECTS;
    } catch {
      return SAMPLE_PROJECTS;
    }
  });
  const [loading, setLoading]         = useState<boolean>(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await getPublicProjects();
      if (response.success && response.data) {
        setAllProjects(response.data);
      }
    } catch {
      // Backend offline / fallback
      const local = getStoredProjects().filter((p) => p.published !== false);
      setAllProjects(local.length > 0 ? local : SAMPLE_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const handleSync = () => {
      fetchProjects();
    };

    window.addEventListener('sakthi_projects_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('sakthi_projects_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchProjects]);

  const projects = category
    ? allProjects.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      )
    : allProjects;

  return { projects, loading, error, refetch: fetchProjects };
}

// ---------------------------------------------------------------------------
// useAdminProjects
// ---------------------------------------------------------------------------

export interface UseAdminProjectsResult {
  projects: Project[];
  /** Total count of matching projects on the server (for pagination). */
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch the admin project list with optional search, category filter, and
 * page-based pagination.
 *
 * Re-fetches automatically whenever `search`, `category`, or `page` changes.
 *
 * @param search   - Optional free-text search string.
 * @param category - Optional category filter string.
 * @param page     - Page number (1-indexed). Defaults to `1`.
 *
 * @example
 * const { projects, total, loading } = useAdminProjects('vsl', undefined, 2);
 */
export function useAdminProjects(
  search?: string,
  category?: string,
  page: number = 1,
): UseAdminProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal]       = useState<number>(0);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AdminProjectsParams = { page };
      if (search)   params.search   = search;
      if (category) params.category = category;

      const response = await adminGetProjects(params);
      if (response.success) {
        setProjects(response.data);
        setTotal(response.total);
      } else {
        setError('Failed to load projects.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, total, loading, error, refetch: fetchProjects };
}

// ---------------------------------------------------------------------------
// useAdminAuth
// ---------------------------------------------------------------------------

export interface UseAdminAuthResult {
  /** `true` once the session check resolves and an active session is found. */
  isAuthenticated: boolean;
  /** `true` while the initial session check request is in-flight. */
  isLoading: boolean;
  /** The authenticated admin user, or `null` when not logged in. */
  user: AdminUser | null;
}

/**
 * Verify whether the visitor holds a valid admin session.
 *
 * Fires a single `GET /api/admin/session` request on mount. Use `isLoading`
 * to guard routes while the check is pending so the UI doesn't flash the
 * login form for an already-authenticated admin.
 *
 * @example
 * const { isAuthenticated, isLoading, user } = useAdminAuth();
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <Navigate to="/admin/login" />;
 */
export function useAdminAuth(): UseAdminAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading]             = useState<boolean>(true);
  const [user, setUser]                       = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await checkAdminSession();
        if (!cancelled) {
          if (response.success && response.data) {
            setIsAuthenticated(true);
            setUser(response.data);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAuthenticated, isLoading, user };
}
