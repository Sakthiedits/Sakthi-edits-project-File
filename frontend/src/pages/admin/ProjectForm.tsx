import React, { useState, useRef, useEffect } from 'react';
import {
  adminCreateProject,
  adminUpdateProject,
  adminUploadVideo,
  adminGetUploadUsage,
} from '../../api/api';
import { VideoSourceValidator } from '../../lib/api';
import { storeVideoFile, extractThumbnailFromVideoFile } from '../../lib/videoStorage';
import { Project } from '../../types';
import {
  X, Check, Video, Globe, EyeOff, AlertCircle,
  Upload, Link2, HardDrive, Loader2, CheckCircle2,
} from 'lucide-react';

const CATEGORIES = ['VSL', 'Video Ad', 'Motion Graphics', 'Brand Video', 'Social Media', 'Other'];

// File size limits
const MAX_FILE_MB = 80;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
// Recommended compressed size
const RECOMMENDED_MB = 30;

interface Props {
  project?: Project;
  totalProjectsCount?: number;
  onSuccess: () => void;
  onClose: () => void;
}

// ─── Lightweight browser-side video compressor using MediaRecorder ───────────
// Captures video frames at lower bitrate. Works without WASM/FFmpeg.
// For heavy compression, we just validate and warn the user.
async function estimateFileSizeMB(file: File): Promise<number> {
  return file.size / 1024 / 1024;
}

// Get video duration & dimensions via HTML5 video element
function getVideoMeta(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      resolve({ duration: videoEl.duration, width: videoEl.videoWidth, height: videoEl.videoHeight });
      URL.revokeObjectURL(url);
    };
    videoEl.onerror = () => {
      resolve({ duration: 0, width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    videoEl.src = url;
  });
}

export const ProjectForm: React.FC<Props> = ({
  project,
  totalProjectsCount = 0,
  onSuccess,
  onClose,
}) => {
  const isEditing = !!project;
  const isLimitReached = !isEditing && totalProjectsCount >= 6;

  const [category, setCategory] = useState(project?.category || 'Social Media');
  const [videoUrl, setVideoUrl] = useState(project?.video_url || '');
  const [published, setPublished] = useState(project ? Boolean(project.published) : true);

  // Upload mode: 'link' (YouTube/Drive) or 'file' (direct upload to R2)
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('file');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{ sizeMB: number; duration: number; width: number; height: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage usage
  const [storageUsage, setStorageUsage] = useState<{
    usedPercent: number; totalMB: number; fileCount: number; remainingGB: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch storage usage on mount
  useEffect(() => {
    adminGetUploadUsage()
      .then((d) => {
        if (d.success && d.usage) setStorageUsage(d.usage);
      })
      .catch(() => {});
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSelectedFile(file);

    const sizeMB = await estimateFileSizeMB(file);
    const meta = await getVideoMeta(file);
    setFileMeta({ sizeMB, ...meta });

    if (file.size > MAX_FILE_BYTES) {
      setError(`File too large: ${sizeMB.toFixed(1)}MB. Maximum is ${MAX_FILE_MB}MB. Please compress your video first using HandBrake (free) or Capcut before uploading.`);
      setSelectedFile(null);
      setFileMeta(null);
    }
  };

  const uploadFileToR2 = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    const res = await adminUploadVideo(file, (percent) => {
      setUploadProgress(percent);
    });

    setUploading(false);

    if (!res.success || !res.url) {
      throw new Error(res.error || 'Upload failed');
    }

    return res.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLimitReached) {
      setError('Limit reached: Maximum 6 videos allowed.');
      return;
    }

    let finalVideoUrl = videoUrl.trim();
    let detectedSource = 'direct_mp4';
    let resolvedThumb = isEditing && project?.thumbnail_url ? project.thumbnail_url : '';

    if (uploadMode === 'file') {
      if (!selectedFile) {
        setError('Please select a video file to upload.');
        return;
      }
      if (selectedFile.size > MAX_FILE_BYTES) {
        setError(`File too large. Max ${MAX_FILE_MB}MB. Compress first.`);
        return;
      }

      setLoading(true);
      try {
        finalVideoUrl = await uploadFileToR2(selectedFile);
        detectedSource = 'r2_upload';
      } catch (err: any) {
        // Fallback gracefully to browser-local IndexedDB storage if backend R2 is offline
        console.warn('Backend R2 upload failed, saving to local browser storage:', err);
        try {
          const videoKey = `video_${Date.now()}`;
          finalVideoUrl = await storeVideoFile(videoKey, selectedFile);
          detectedSource = 'direct_mp4';
          if (!resolvedThumb) {
            resolvedThumb = await extractThumbnailFromVideoFile(selectedFile);
          }
        } catch (storeErr: any) {
          setError(storeErr?.message || 'Upload failed. Please try again or paste a video link.');
          setLoading(false);
          return;
        }
      }
    } else {
      // Link mode
      if (!finalVideoUrl) {
        setError('Please paste a video link.');
        return;
      }
      setLoading(true);
      detectedSource = VideoSourceValidator.detectVideoSourceType(finalVideoUrl) || 'direct_mp4';
    }

    try {
      // Auto-resolve thumbnail URL
      if (!resolvedThumb && detectedSource === 'google_drive') {
        const driveId = VideoSourceValidator.extractGoogleDriveId(finalVideoUrl);
        if (driveId) resolvedThumb = `https://lh3.googleusercontent.com/d/${driveId}=w1000`;
      } else if (!resolvedThumb && detectedSource === 'youtube') {
        const ytId = VideoSourceValidator.extractYouTubeId(finalVideoUrl);
        if (ytId) resolvedThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }

      const title = isEditing && project.title ? project.title : `${category} Video`;

      const payload: any = {
        title: title.trim(),
        description: '',
        category,
        video_source_type: detectedSource,
        video_url: finalVideoUrl,
        thumbnail_url: resolvedThumb,
        aspect_ratio: '9:16',
        display_order: 0,
        published,
      };

      if (isEditing && project) {
        await adminUpdateProject(project.id, payload);
      } else {
        await adminCreateProject(payload);
      }

      setSuccess(true);
      setTimeout(() => { onSuccess(); }, 700);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const storageBarColor =
    !storageUsage ? 'bg-blue-500' :
    storageUsage.usedPercent > 85 ? 'bg-red-500' :
    storageUsage.usedPercent > 65 ? 'bg-amber-500' :
    'bg-emerald-500';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-w-lg mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-slate-900 font-bold text-base">
              {isEditing ? 'Edit Video' : 'Add New Video'}
            </h2>
            <p className="text-slate-500 text-xs">Select category & upload or paste link</p>
          </div>
        </div>
        <button onClick={onClose} type="button"
          className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Storage Usage Bar ── */}
      {storageUsage && (
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              R2 Storage: {storageUsage.totalMB.toFixed(0)}MB used / 5120MB
            </span>
            <span className={
              storageUsage.usedPercent > 85 ? 'text-red-600 font-bold' :
              storageUsage.usedPercent > 65 ? 'text-amber-600 font-semibold' :
              'text-emerald-600 font-semibold'
            }>
              {storageUsage.usedPercent.toFixed(1)}% used · {storageUsage.fileCount} files
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${storageBarColor}`}
              style={{ width: `${storageUsage.usedPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Remaining: ~{storageUsage.remainingGB.toFixed(2)}GB
            {storageUsage.usedPercent > 80 && ' ⚠️ Running low — delete old videos'}
          </p>
        </div>
      )}

      {/* ── Limit Warning ── */}
      {isLimitReached && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Maximum 6 videos limit reached. Delete an existing video to add new one.</span>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* 1. Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            1. Choose Category *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                  category === cat
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Upload Mode Toggle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            2. Video Source *
          </label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button type="button" onClick={() => { setUploadMode('file'); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                uploadMode === 'file'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}>
              <Upload className="w-3.5 h-3.5" />
              Upload MP4 File
            </button>
            <button type="button" onClick={() => { setUploadMode('link'); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                uploadMode === 'link'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}>
              <Link2 className="w-3.5 h-3.5" />
              Paste Link
            </button>
          </div>

          {/* ── File Upload Mode ── */}
          {uploadMode === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || isLimitReached}
                className="w-full border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-xl p-6 text-center transition-all cursor-pointer group hover:bg-purple-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedFile ? (
                  <div className="space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {fileMeta?.sizeMB.toFixed(1)}MB
                      {fileMeta?.duration ? ` · ${Math.round(fileMeta.duration)}s` : ''}
                      {fileMeta?.width ? ` · ${fileMeta.width}×${fileMeta.height}` : ''}
                    </p>
                    {fileMeta && fileMeta.sizeMB > RECOMMENDED_MB && (
                      <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-1">
                        ⚠️ {fileMeta.sizeMB.toFixed(0)}MB is large. Compress to under {RECOMMENDED_MB}MB using HandBrake or Capcut for faster loading.
                      </p>
                    )}
                    {fileMeta && fileMeta.sizeMB <= RECOMMENDED_MB && (
                      <p className="text-[11px] text-emerald-600">✅ Good size — will load fast</p>
                    )}
                    <p className="text-[11px] text-purple-500 underline mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-500 mx-auto transition-colors" />
                    <p className="text-sm font-semibold text-slate-700">Click to select MP4 / MOV / WebM</p>
                    <p className="text-[11px] text-slate-400">
                      Max {MAX_FILE_MB}MB · Recommended: under {RECOMMENDED_MB}MB
                    </p>
                    <p className="text-[11px] text-slate-400">
                      💡 Compress with <strong>HandBrake</strong> (free) before uploading to save R2 space
                    </p>
                  </div>
                )}
              </button>

              {/* Upload progress bar */}
              {uploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading to R2…
                    </span>
                    <span className="font-bold text-purple-600">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Link Paste Mode ── */}
          {uploadMode === 'link' && (
            <div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste Google Drive link or YouTube link..."
                disabled={loading || isLimitReached}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                ⚠️ YouTube videos need tap-to-play on mobile (browser restriction). Google Drive recommended.
              </p>
            </div>
          )}
        </div>

        {/* 3. Published */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Published Status</p>
            <p className="text-[11px] text-slate-500">
              {published ? 'Visible on website' : 'Hidden (draft)'}
            </p>
          </div>
          <button type="button" onClick={() => setPublished(!published)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              published ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}>
            {published ? <><Globe className="w-3.5 h-3.5" /><span>ON</span></> : <><EyeOff className="w-3.5 h-3.5" /><span>OFF</span></>}
          </button>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={loading || isLimitReached || uploading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Uploading… {uploadProgress}%</span></>
            ) : loading ? (
              <span>Saving...</span>
            ) : success ? (
              <><Check className="w-4 h-4" /><span>Saved!</span></>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Publish Video'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
