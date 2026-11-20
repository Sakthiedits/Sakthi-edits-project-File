import React from 'react';
import { Pencil, Trash2, Globe, EyeOff, Film, ExternalLink } from 'lucide-react';
import type { Project, VideoSourceType } from '../../types';
import { getAutoThumbnail } from '../video/VideoCard';

export interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, published: boolean) => void;
}

function getSourceBadge(sourceType: VideoSourceType) {
  switch (sourceType) {
    case 'youtube':
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
          YouTube
        </span>
      );
    case 'google_drive':
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Google Drive
        </span>
      );
    case 'direct_mp4':
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          MP4
        </span>
      );
    case 'r2_upload':
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          R2 Direct
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {sourceType}
        </span>
      );
  }
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 bg-white border border-slate-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
          <Film className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No videos added yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Click "+ Add Video" above to publish your first video edit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Desktop View (Table) ── */}
      <div className="hidden md:block overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/80">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Video / Preview</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4 text-center">Published ON/OFF</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {projects.map((project, idx) => {
              const thumb = getAutoThumbnail(project);

              return (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{project.title}</p>
                        {project.video_url && (
                          project.video_url.startsWith('indexeddb://') ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              Local Upload (Saved)
                            </span>
                          ) : (
                            <a
                              href={project.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 truncate max-w-xs transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open Link
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {project.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getSourceBadge(project.video_source_type)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {/* 1-Click Published ON / OFF Toggle */}
                    <button
                      type="button"
                      onClick={() => onTogglePublish(project.id, !project.published)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                        project.published
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                      }`}
                      title={project.published ? 'Click to turn OFF (Draft)' : 'Click to turn ON (Publish)'}
                    >
                      {project.published ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ON (Published)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>OFF (Draft)</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(project)}
                        className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Edit video"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(project.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile View (Cards) ── */}
      <div className="md:hidden space-y-3">
        {projects.map((project, idx) => {
          const thumb = getAutoThumbnail(project);

          return (
            <div
              key={project.id}
              className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {project.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {project.title}
                    </h4>
                    <div className="mt-1">
                      {getSourceBadge(project.video_source_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom controls row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onTogglePublish(project.id, !project.published)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer ${
                    project.published
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  {project.published ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>OFF</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="p-2 rounded-xl text-slate-600 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(project.id)}
                    className="p-2 rounded-xl text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTable;
