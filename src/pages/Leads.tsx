import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2, Download, ArrowLeft, Trash2, RefreshCw, ShieldAlert, LogIn } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  product_interest: string | null;
  budget: string | null;
  note: string | null;
  source: string | null;
  created_at: string;
}

const COLS: { key: keyof Lead; label: string }[] = [
  { key: "created_at", label: "Thời gian" },
  { key: "full_name", label: "Họ tên" },
  { key: "phone", label: "SĐT" },
  { key: "email", label: "Email" },
  { key: "product_interest", label: "Sản phẩm" },
  { key: "budget", label: "Ngân sách" },
  { key: "note", label: "Ghi chú" },
  { key: "source", label: "Nguồn" },
];

export default function Leads() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const load = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLeads(data as Lead[]);
    setBusy(false);
  };

  const downloadCsv = () => {
    if (!leads.length) {
      toast.info("Chưa có dữ liệu để tải");
      return;
    }
    const headers = COLS.map((c) => c.label);
    const keys = COLS.map((c) => c.key);
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = leads.map((l) =>
      keys.map((k) => (k === "created_at" ? new Date(l[k] as string).toLocaleString("vi-VN") : esc(l[k]))).join(","),
    );
    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khach-dang-ky-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteOne = async (id: string) => {
    if (!confirm("Xoá khách này?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Đã xoá");
      setLeads((xs) => xs.filter((x) => x.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-card border border-border text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-cta mb-4" />
          <h2 className="text-xl font-bold mb-2">Cần đăng nhập</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Vui lòng đăng nhập tài khoản quản trị để xem danh sách khách đăng ký.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href })
              }
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập bằng Google
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="w-full h-11 rounded-lg border border-border font-medium"
            >
              Đăng nhập bằng email/mật khẩu
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground mt-2">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-card border border-border text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Không có quyền truy cập</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Tài khoản: <strong>{user.email}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Tài khoản này chưa được cấp quyền admin.
          </p>
          <button onClick={() => navigate("/")} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold">📋 Khách Đăng Ký Tư Vấn</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={busy}
              className="inline-flex items-center gap-1 px-3 h-9 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Tải lại
            </button>
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-1 px-4 h-9 rounded-lg bg-cta text-cta-foreground font-bold text-sm hover:bg-cta-deep"
            >
              <Download className="w-4 h-4" /> Tải CSV ({leads.length})
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {COLS.map((c) => (
                    <th key={c.key} className="text-left px-3 py-2 font-semibold whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={COLS.length + 1} className="text-center py-12 text-muted-foreground">
                      {busy ? "Đang tải..." : "Chưa có khách đăng ký nào."}
                    </td>
                  </tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {new Date(l.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2 font-medium">{l.full_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a href={`tel:${l.phone}`} className="text-primary hover:underline">
                        {l.phone}
                      </a>
                    </td>
                    <td className="px-3 py-2">{l.email || "-"}</td>
                    <td className="px-3 py-2">{l.product_interest || "-"}</td>
                    <td className="px-3 py-2">{l.budget || "-"}</td>
                    <td className="px-3 py-2 max-w-[240px] truncate" title={l.note || ""}>
                      {l.note || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{l.source || "-"}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteOne(l.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
