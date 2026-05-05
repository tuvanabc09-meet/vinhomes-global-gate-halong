import { useEffect, useRef, useState } from "react";
import { IMAGE_SLOTS, getImage, setImage, resetImage } from "@/lib/images";
import { getMedia, loadAllMedia, upsertMediaImage, deleteMedia, uploadFileToBucket, subscribeMedia } from "@/lib/siteMedia";
import { useAdmin, refreshAdmin } from "@/hooks/useAdmin";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, RotateCcw, Cloud, Loader2, LogIn, LogOut, PlayCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { VideoEditor } from "./IntroVideo";
import { DocumentEditor } from "./DocumentsSection";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ open, onClose }: AdminPanelProps) => {
  const { user, isAdmin, loading } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showDocEditor, setShowDocEditor] = useState(false);

  useEffect(() => {
    if (open) loadAllMedia();
  }, [open]);
  if (!open) return null;

  const signIn = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Không đăng nhập được");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      // Tokens received in-place — refresh admin state immediately
      await refreshAdmin();
      toast.success("Đã đăng nhập — đã cập nhật quyền admin");
      setBusy(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Đã đăng xuất");
  };

  const goTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const openVideoEditor = () => {
    if (!isAdmin) { toast.error("Cần đăng nhập admin"); return; }
    setShowVideoEditor(true);
  };
  const openDocEditor = () => {
    if (!isAdmin) { toast.error("Cần đăng nhập admin"); return; }
    setShowDocEditor(true);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto bg-[#1a1a1a] text-white rounded-2xl shadow-2xl border border-white/10">
        <div className="flex items-start justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1a1a1a] rounded-t-2xl z-10 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-secondary">⚙️ Bảng Điều Khiển Quản Trị</h2>
            <p className="text-white/60 text-sm mt-1">
              {loading
                ? "Đang kiểm tra quyền…"
                : isAdmin
                ? `✅ Admin (${user?.email}) — mọi thay đổi lưu Cloud, khách đều thấy.`
                : user
                ? `⚠️ ${user.email} chưa có quyền admin — liên hệ kỹ thuật để được cấp quyền.`
                : "⚠️ Chưa đăng nhập — bấm 'Đăng nhập Google' để quản lý ảnh, video, tài liệu trên Cloud."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!user ? (
              <button
                onClick={signIn}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-cta text-cta-foreground font-bold text-sm hover:bg-cta-deep transition-smooth disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Đăng nhập Google
              </button>
            ) : (
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 h-10 rounded-full bg-white/10 hover:bg-white/20 text-xs transition-smooth"
                title={user.email || ""}
              >
                <LogOut className="w-4 h-4" /> Thoát
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-smooth" aria-label="Đóng">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick admin shortcuts: open editors directly */}
        <div className="p-6 border-b border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/30 flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">🎬 Video giới thiệu</div>
                <div className="text-xs text-white/60">Dán link YouTube hoặc upload MP4 (≤100MB).</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openVideoEditor}
                disabled={!isAdmin}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-cta text-cta-foreground text-xs font-bold hover:bg-cta-deep disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" /> Upload / Đổi video
              </button>
              <button
                onClick={() => goTo("tongquan")}
                className="px-3 h-9 rounded-md bg-white/10 hover:bg-white/20 text-xs"
              >
                Xem
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/5 border border-secondary/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">📚 Tài liệu & Brochure</div>
                <div className="text-xs text-white/60">Upload PDF / Word / Excel / ảnh (≤50MB).</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openDocEditor}
                disabled={!isAdmin}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-cta text-cta-foreground text-xs font-bold hover:bg-cta-deep disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" /> Thêm tài liệu mới
              </button>
              <button
                onClick={() => goTo("tailieu")}
                className="px-3 h-9 rounded-md bg-white/10 hover:bg-white/20 text-xs"
              >
                Xem
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-secondary">🖼️ Quản trị hình ảnh</h3>
          <p className="text-xs text-white/50">Bấm "Tải ảnh mới" cho từng vị trí để cập nhật ảnh website.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-3">
          {IMAGE_SLOTS.map((slot) => (
            <SlotRow key={slot.id} id={slot.id} label={slot.label} isAdmin={isAdmin} />
          ))}
        </div>
        <div className="p-6 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 rounded-full bg-cta text-cta-foreground font-semibold hover:bg-cta-deep transition-smooth">
            Đóng
          </button>
        </div>
      </div>

      {showVideoEditor && <VideoEditor onClose={() => setShowVideoEditor(false)} />}
      {showDocEditor && (
        <DocumentEditor
          doc={null}
          onClose={() => setShowDocEditor(false)}
          onSaved={() => setShowDocEditor(false)}
        />
      )}
    </div>
  );
};

const SlotRow = ({ id, label, isAdmin }: { id: string; label: string; isAdmin: boolean }) => {
  const resolve = () => getMedia(id)?.url || getImage(id);
  const [preview, setPreview] = useState(resolve);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCloud = !!getMedia(id);

  useEffect(() => {
    const unsub = subscribeMedia(() => setPreview(resolve()));
    return () => { unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (isAdmin) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ảnh quá lớn (tối đa 10MB)");
        return;
      }
      setBusy(true);
      try {
        const url = await uploadFileToBucket(file, `images/${id}`);
        await upsertMediaImage(id, url, label);
        setPreview(url);
        toast.success(`☁️ Đã đăng lên Cloud: ${label}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi upload");
      } finally {
        setBusy(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        try {
          setImage(id, dataUrl);
          setPreview(dataUrl);
          toast.success(`✅ Đã cập nhật cục bộ: ${label}`);
        } catch {
          toast.error("Ảnh quá lớn — chọn ảnh nhỏ hơn");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = async () => {
    if (isAdmin && isCloud) {
      setBusy(true);
      try {
        await deleteMedia(id);
        toast("Đã xoá ảnh Cloud, khôi phục mặc định");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi");
      } finally {
        setBusy(false);
      }
    }
    resetImage(id);
    setPreview(resolve());
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
      <img src={preview} alt={label} className="w-20 h-20 rounded-lg object-cover bg-white/10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate flex items-center gap-1">
          {label}
          {isCloud && <Cloud className="w-3 h-3 text-secondary" aria-label="Đã lưu Cloud" />}
        </div>
        <div className="text-xs text-white/50 mb-2">ID: {id}</div>
        <div className="flex gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary-glow transition-smooth disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {busy ? "Đang tải..." : "Tải ảnh mới"}
          </button>
          <button
            onClick={handleReset}
            disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/10 rounded-md hover:bg-white/20 transition-smooth disabled:opacity-60"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
};
