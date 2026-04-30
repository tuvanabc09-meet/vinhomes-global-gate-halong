import { useEffect, useRef, useState } from "react";
import { getMedia, loadAllMedia, subscribeMedia, youtubeEmbedUrl, upsertMediaVideo, deleteMedia, uploadFileToBucket } from "@/lib/siteMedia";
import { useAdmin } from "@/hooks/useAdmin";
import { Pencil, Upload, Link as LinkIcon, Trash2, X, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const SLOT = "intro_video";

export const IntroVideo = () => {
  const { isAdmin } = useAdmin();
  const [, force] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadAllMedia().then(() => force((n) => n + 1));
    const unsub = subscribeMedia(() => force((n) => n + 1));
    return () => { unsub(); };
  }, []);

  const media = getMedia(SLOT);
  const hasVideo = media && media.kind === "video";

  return (
    <div className="mt-12">
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-3">
          🎬 VIDEO GIỚI THIỆU DỰ ÁN
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-primary-deep">
          Toàn cảnh Vinhomes Global Gate Hạ Long
        </h3>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-card border border-border bg-primary-deep aspect-video">
        {hasVideo ? (
          media.video_type === "youtube" ? (
            <iframe
              src={media.url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={media.title || "Video giới thiệu"}
            />
          ) : (
            <video
              src={media.url}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              controls
              playsInline
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
            <PlayCircle className="w-20 h-20" />
            <p className="text-sm">
              {isAdmin ? "Chưa có video — bấm 'Quản lý video' để thêm." : "Video sẽ sớm được cập nhật."}
            </p>
          </div>
        )}

        {isAdmin && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-cta text-cta-foreground text-xs font-bold shadow-premium hover:bg-cta-deep transition-smooth"
          >
            <Pencil className="w-3.5 h-3.5" /> Quản lý video
          </button>
        )}
      </div>

      {editing && <VideoEditor onClose={() => setEditing(false)} />}
    </div>
  );
};

const VideoEditor = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<"youtube" | "upload">("youtube");
  const [ytUrl, setYtUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveYoutube = async () => {
    const embed = youtubeEmbedUrl(ytUrl);
    if (!embed) {
      toast.error("Link YouTube không hợp lệ");
      return;
    }
    setBusy(true);
    try {
      await upsertMediaVideo(SLOT, embed, "youtube", title);
      toast.success("Đã cập nhật video");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  };

  const saveUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 100MB)");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadFileToBucket(file, "videos");
      await upsertMediaVideo(SLOT, url, "upload", title || file.name);
      toast.success("Đã tải lên video");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  };

  const removeVideo = async () => {
    if (!confirm("Xoá video hiện tại?")) return;
    setBusy(true);
    try {
      await deleteMedia(SLOT);
      toast.success("Đã xoá");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card text-foreground max-w-lg w-full rounded-2xl shadow-2xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-lg">🎬 Quản lý video giới thiệu</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setTab("youtube")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${tab === "youtube" ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >
              <LinkIcon className="w-4 h-4 inline mr-1" /> Link YouTube
            </button>
            <button
              onClick={() => setTab("upload")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${tab === "upload" ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >
              <Upload className="w-4 h-4 inline mr-1" /> Tải lên MP4
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tiêu đề (tuỳ chọn)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Toàn cảnh dự án"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </div>

          {tab === "youtube" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium block">Dán link YouTube</label>
              <input
                type="url"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
              <button
                onClick={saveYoutube}
                disabled={busy}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Lưu video YouTube
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Hỗ trợ MP4, WebM. Tối đa 100MB.</p>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && saveUpload(e.target.files[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {busy ? "Đang tải..." : "Chọn file video"}
              </button>
            </div>
          )}

          <button
            onClick={removeVideo}
            disabled={busy}
            className="w-full h-10 rounded-lg border border-destructive/40 text-destructive font-medium hover:bg-destructive/10 inline-flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Xoá video hiện tại
          </button>
        </div>
      </div>
    </div>
  );
};
