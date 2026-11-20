import { useState, useEffect, useCallback } from 'react';
import { adminGetProjects, adminDeleteProject, adminPublishProject } from '../lib/api';
import type { Project } from '../types';

export function useAdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetProjects({ limit: 100 });
      if (res.success && res.data) {
        setProjects(res.data);
        setTotal(res.total ?? res.data.length);
      } else {
        setError(res.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
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

  const deleteProject = useCallback(async (id: number) => {
    const res = await adminDeleteProject(id);
    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } else {
      throw new Error(res.error || 'Failed to delete project');
    }
  }, []);

  const togglePublish = useCallback(async (id: number, published: boolean) => {
    const res = await adminPublishProject(id, published);
    if (res.success) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, published } : p))
      );
    } else {
      throw new Error(res.error || 'Failed to toggle publication status');
    }
  }, []);

  return {
    projects,
    total,
    loading,
    error,
    refetch: fetchProjects,
    deleteProject,
    togglePublish,
  };
}
