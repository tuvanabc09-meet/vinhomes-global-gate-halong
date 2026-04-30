import { useEffect, useRef, useState } from "react";
import { IMAGE_SLOTS, getImage, setImage, resetImage } from "@/lib/images";
import { getMedia, loadAllMedia, upsertMediaImage, deleteMedia, uploadFileToBucket, subscribeMedia } from "@/lib/siteMedia";
import { useAdmin } from "@/hooks/useAdmin";
import { X, Upload, RotateCcw, Cloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ open, onClose }: AdminPanelProps) => {
  const { isAdmin } = useAdmin();
  useEffect(() => {
    if (open) loadAllMedia();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto bg-[#1a1a1a] text-white rounded-2xl shadow-2xl border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#1a1a1a] rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-secondary">⚙️ Quản Trị Hình Ảnh</h2>
            <p className="text-white/60 text-sm mt-1">
              {isAdmin
                ? "✅ Đăng nhập admin — ảnh sẽ lưu trên Cloud, mọi khách đều thấy."
                : "⚠️ Chưa đăng nhập admin — ảnh chỉ lưu cục bộ trên trình duyệt này."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-smooth" aria-label="Đóng">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
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
