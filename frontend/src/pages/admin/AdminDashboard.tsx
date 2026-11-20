import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminLogout } from '../../api/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAdminProjects } from '../../hooks/useAdminProjects';
import { Project } from '../../types';
import ProjectTable from '../../components/admin/ProjectTable';
import ProjectForm from './ProjectForm';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  ExternalLink,
  Plus,
  LogOut,
  Search,
  AlertTriangle,
  Film,
  Video,
  Eye,
  CheckCircle2,
} from 'lucide-react';

const MAX_VIDEOS_LIMIT = 6;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Auth guard
  const { loading: authLoading } = useAdminAuth();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refetch,
    deleteProject,
    togglePublish,
  } = useAdminProjects();

  // UI state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProject, setEditingProject] = useState<Project | null | 'new'>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const categories = ['All', 'VSL', 'Video Ad', 'Motion Graphics', 'Brand Video', 'Social Media', 'Other'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isLimitReached = projects.length >= MAX_VIDEOS_LIMIT;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  const handleDelete = useCallback(async () => {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await deleteProject(deletingId);
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  }, [deletingId, deleteProject]);

  const handleTogglePublish = useCallback(
    async (id: number, published: boolean) => {
      await togglePublish(id, published);
    },
    [togglePublish]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      {/* ── Top Navigation Bar (White Theme) ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
              SAKTHI<span className="text-purple-600">EDITS</span>
            </h1>
          </div>

          {/* 6 Video Limit Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight border ${
              isLimitReached
                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            📹 {projects.length} / {MAX_VIDEOS_LIMIT} Videos
          </span>
        </div>

        {/* Action Buttons: View Website, Add Video, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 👁️ View Website Button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="View Live Website"
          >
            <Eye className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">View Website</span>
          </a>

          {/* Add New Video Button */}
          <button
            type="button"
            disabled={isLimitReached}
            onClick={() => setEditingProject('new')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
              isLimitReached
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25 cursor-pointer active:scale-95'
            }`}
            title={isLimitReached ? 'Maximum 6 videos reached' : 'Add video'}
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Limit Warning Banner if >= 6 videos */}
        {isLimitReached && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3 text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Maximum 6 Videos Limit Reached ({projects.length}/{MAX_VIDEOS_LIMIT})
                </p>
                <p className="text-xs text-amber-700">
                  Unga portfolio-la 6 videos limit aagiduchu. Puthu video add panna, irukura edhaavadhu oru video-va delete pannunga.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters & Search Row ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category or video..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-200 transition-all"
            />
          </div>

          {/* Category Filter Pills (Scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((c) => {
              const count = c === 'All' ? projects.length : projects.filter((p) => p.category === c).length;
              const isSelected = categoryFilter === c;

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                  <span className={`ml-1.5 text-[10px] font-mono px-1 py-0.2 rounded-md ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Video Project Table / Cards ── */}
        <div>
          {projectsError ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <p className="text-red-500 text-sm font-semibold">{projectsError}</p>
              <button
                type="button"
                onClick={refetch}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
              >
                Retry
              </button>
            </div>
          ) : (
            <ProjectTable
              projects={filteredProjects}
              loading={projectsLoading}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(id) => setDeletingId(id)}
              onTogglePublish={handleTogglePublish}
            />
          )}
        </div>
      </main>

      {/* ── Project Form Modal ── */}
      <AnimatePresence>
        {editingProject !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setEditingProject(null)}
            />
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto"
            >
              <ProjectForm
                project={editingProject === 'new' ? undefined : editingProject}
                totalProjectsCount={projects.length}
                onSuccess={() => {
                  setEditingProject(null);
                  refetch();
                }}
                onClose={() => setEditingProject(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        title="Delete Video"
        message="Are you sure you want to delete this video? It will be removed from your portfolio."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminDashboard;
