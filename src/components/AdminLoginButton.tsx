import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, Settings, Loader2, Users } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onOpenAdmin: () => void;
}

export const AdminLoginButton = ({ onOpenAdmin }: Props) => {
  const { user, isAdmin, loading } = useAdmin();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (loading) return null;

  const signIn = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Không đăng nhập được");
        setBusy(false);
      }
      // if redirected, browser navigates away
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Đã đăng xuất");
  };

  if (!user) {
    return (
      <button
        onClick={onOpenAdmin}
        title="Mở bảng điều khiển quản trị"
        className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-secondary text-secondary-foreground hover:opacity-90 text-xs font-bold transition-smooth"
      >
        <Settings className="w-3.5 h-3.5" /> Quản trị
      </button>
    );
  }

  if (isAdmin) {
    return (
      <div className="hidden sm:flex items-center gap-1">
        <button
          onClick={() => navigate("/admin/leads")}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-secondary text-secondary-foreground hover:opacity-90 text-xs font-bold transition-smooth"
        >
          <Users className="w-3.5 h-3.5" /> Khách đăng ký
        </button>
        <button
          onClick={onOpenAdmin}
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-cta text-cta-foreground hover:bg-cta-deep text-xs font-bold transition-smooth"
        >
          <Settings className="w-3.5 h-3.5" /> Ảnh & Video
        </button>
        <button
          onClick={signOut}
          title={user.email || ""}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-smooth"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Logged in but not admin
  return (
    <button
      onClick={signOut}
      title={`${user.email} (chưa có quyền admin)`}
      className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/10 text-white/60 hover:bg-white/20 text-xs transition-smooth"
    >
      <LogOut className="w-3.5 h-3.5" /> Thoát
    </button>
  );
};
