import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import {
  listDocuments,
  createDocument,
  deleteDocument,
  updateDocument,
  uploadDocumentFile,
  detectFileType,
  formatBytes,
  type SiteDocument,
} from "@/lib/siteDocuments";
import { FileText, Image as ImageIcon, File as FileIcon, Download, Eye, Plus, Pencil, Trash2, X, Loader2, Upload, EyeOff } from "lucide-react";
import { toast } from "sonner";

const iconFor = (t: SiteDocument["file_type"]) =>
  t === "pdf" ? FileText : t === "image" ? ImageIcon : FileIcon;

export const DocumentsSection = () => {
  const { isAdmin } = useAdmin();
  const [docs, setDocs] = useState<SiteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SiteDocument | "new" | null>(null);
  const [previewImg, setPreviewImg] = useState<SiteDocument | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const d = await listDocuments(!isAdmin);
      setDocs(d);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải tài liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleOpen = (d: SiteDocument) => {
    if (d.file_type === "image") {
      setPreviewImg(d);
    } else {
      window.open(d.file_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = async (d: SiteDocument) => {
    if (!confirm(`Xoá tài liệu "${d.title}"?`)) return;
    try {
      await deleteDocument(d.id);
      toast.success("Đã xoá");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const toggleActive = async (d: SiteDocument) => {
    try {
      await updateDocument(d.id, { is_active: !d.is_active });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  };

  return (
    <section id="tailieu" className="py-20 sm:py-28 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-3">
            📚 TÀI LIỆU DỰ ÁN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-primary-deep mb-3">
            Tài Liệu & Brochure
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bấm vào tài liệu để xem trực tiếp hoặc tải về máy.
          </p>
        </div>

        {isAdmin && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-cta text-cta-foreground font-bold hover:bg-cta-deep transition-smooth"
            >
              <Plus className="w-4 h-4" /> Thêm tài liệu
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin inline" />
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isAdmin ? "Chưa có tài liệu — bấm 'Thêm tài liệu'." : "Tài liệu sẽ sớm được cập nhật."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {docs.map((d) => {
              const Icon = iconFor(d.file_type);
              return (
                <div
                  key={d.id}
                  className={`group relative rounded-2xl border border-border bg-card shadow-soft hover:shadow-card transition-smooth overflow-hidden ${!d.is_active ? "opacity-60" : ""}`}
                >
                  <button
                    onClick={() => handleOpen(d)}
                    className="block w-full text-left"
                  >
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
                      {d.thumbnail_url ? (
                        <img src={d.thumbnail_url} alt={d.title} className="w-full h-full object-cover" />
                      ) : d.file_type === "image" ? (
                        <img src={d.file_url} alt={d.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-primary-deep">
                          <Icon className="w-16 h-16" strokeWidth={1.5} />
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {d.file_type === "pdf" ? "PDF" : "FILE"}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary-deep/0 group-hover:bg-primary-deep/30 transition-smooth flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-smooth inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-primary-deep text-xs font-bold">
                          <Eye className="w-3.5 h-3.5" /> Xem ngay
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-primary-deep line-clamp-2">{d.title}</div>
                      {d.description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{d.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        <span className="uppercase">{d.file_type}</span>
                        {d.file_size ? <span>· {formatBytes(d.file_size)}</span> : null}
                      </div>
                    </div>
                  </button>

                  <div className="px-4 pb-4 flex items-center gap-2">
                    <a
                      href={d.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải về
                    </a>
                    {isAdmin && (
                      <>
                        <button onClick={() => toggleActive(d)} title={d.is_active ? "Ẩn" : "Hiện"} className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 inline-flex items-center justify-center">
                          {d.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditing(d)} title="Sửa" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 inline-flex items-center justify-center">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(d)} title="Xoá" className="w-9 h-9 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 inline-flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <DocumentEditor
          doc={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}

      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white inline-flex items-center justify-center hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          <img
            src={previewImg.file_url}
            alt={previewImg.title}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export const DocumentEditor = ({
  doc,
  onClose,
  onSaved,
}: {
  doc: SiteDocument | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [title, setTitle] = useState(doc?.title ?? "");
  const [description, setDescription] = useState(doc?.description ?? "");
  const [fileUrl, setFileUrl] = useState(doc?.file_url ?? "");
  const [fileType, setFileType] = useState<SiteDocument["file_type"]>(doc?.file_type ?? "pdf");
  const [mime, setMime] = useState<string>(doc?.mime_type ?? "");
  const [size, setSize] = useState<number | null>(doc?.file_size ?? null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 50MB)");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadDocumentFile(file);
      setFileUrl(url);
      setMime(file.type);
      setSize(file.size);
      setFileType(detectFileType(file.type));
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast.success("Đã tải lên");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!title.trim() || !fileUrl) {
      toast.error("Cần tiêu đề và file");
      return;
    }
    setBusy(true);
    try {
      if (doc) {
        await updateDocument(doc.id, {
          title, description, file_url: fileUrl, file_type: fileType, mime_type: mime, file_size: size,
        });
      } else {
        await createDocument({
          title, description, file_url: fileUrl, file_type: fileType, mime_type: mime, file_size: size ?? undefined,
        });
      }
      toast.success("Đã lưu");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card text-foreground max-w-lg w-full rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-bold text-lg">{doc ? "Sửa tài liệu" : "Thêm tài liệu mới"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tiêu đề *</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Brochure dự án 2026"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mô tả ngắn</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu chi tiết, bảng giá..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">File (PDF, ảnh, Word, Excel...) *</label>
            <input
              ref={inputRef} type="file" className="hidden"
              accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="w-full h-11 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 inline-flex items-center justify-center gap-2 transition-smooth disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {fileUrl ? "Thay file khác" : "Chọn file để tải lên"}
            </button>
            {fileUrl && (
              <div className="mt-2 text-xs text-muted-foreground break-all">
                ✓ {mime || fileType} {size ? `· ${formatBytes(size)}` : ""}
              </div>
            )}
          </div>

          <button
            onClick={save}
            disabled={busy || !title.trim() || !fileUrl}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Lưu tài liệu
          </button>
        </div>
      </div>
    </div>
  );
};
