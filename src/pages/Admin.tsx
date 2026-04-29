import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, LogOut, Plus, Pencil, Trash2, MessageSquare, BookOpen, ShieldAlert } from "lucide-react";

interface KbItem {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

interface Conversation {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // KB state
  const [items, setItems] = useState<KbItem[]>([]);
  const [editing, setEditing] = useState<KbItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setUser(data.session?.user ?? null);
      if (!data.session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadKb();
      loadConversations();
    }
  }, [isAdmin]);

  const loadKb = async () => {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data as KbItem[]);
  };

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    setConversations((data ?? []) as Conversation[]);
  };

  const loadMessages = async (convId: string) => {
    setActiveConv(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Message[]);
  };

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setIsActive(true);
  };

  const startEdit = (item: KbItem) => {
    setEditing(item);
    setTitle(item.title);
    setContent(item.content);
    setIsActive(item.is_active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("knowledge_base")
          .update({ title: title.trim(), content: content.trim(), is_active: isActive })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Đã cập nhật");
      } else {
        const { error } = await supabase.from("knowledge_base").insert({
          title: title.trim(),
          content: content.trim(),
          is_active: isActive,
          created_by: user?.id,
        });
        if (error) throw error;
        toast.success("Đã thêm mới");
      }
      resetForm();
      loadKb();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá mục này?")) return;
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Đã xoá");
      loadKb();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Bạn chưa có quyền admin</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Tài khoản: <strong>{user?.email}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Để cấp quyền admin: vào Backend → Database → bảng <code>user_roles</code>, thêm dòng với
            user_id của bạn và role = <code>admin</code>.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout} className="flex-1">
              Đăng xuất
            </Button>
            <Button onClick={() => navigate("/")} className="flex-1">
              Về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Trang quản trị Chatbot</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Xem trang chủ
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="kb">
          <TabsList>
            <TabsTrigger value="kb"><BookOpen className="w-4 h-4 mr-2" />Tài liệu chatbot</TabsTrigger>
            <TabsTrigger value="conv"><MessageSquare className="w-4 h-4 mr-2" />Hội thoại</TabsTrigger>
          </TabsList>

          <TabsContent value="kb" className="grid md:grid-cols-2 gap-6 mt-4">
            <Card className="p-6">
              <h2 className="font-semibold mb-4">{editing ? "Chỉnh sửa mục" : "Thêm mục mới"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Tiêu đề</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Chính sách thanh toán" maxLength={200} />
                </div>
                <div>
                  <Label>Nội dung</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Hướng dẫn cụ thể chatbot trả lời..." rows={10} maxLength={8000} />
                  <p className="text-xs text-muted-foreground mt-1">{content.length}/8000</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Đang sử dụng</Label>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editing ? "Cập nhật" : <><Plus className="w-4 h-4 mr-2" />Thêm</>}
                  </Button>
                  {editing && <Button type="button" variant="outline" onClick={resetForm}>Huỷ</Button>}
                </div>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4">Danh sách ({items.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-auto">
                {items.length === 0 && <p className="text-sm text-muted-foreground">Chưa có mục nào.</p>}
                {items.map((it) => (
                  <div key={it.id} className="border rounded-lg p-3 hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{it.title}</h3>
                          {!it.is_active && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Tắt</span>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{it.content}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(it)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(it.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="conv" className="grid md:grid-cols-[300px_1fr] gap-6 mt-4">
            <Card className="p-4">
              <h2 className="font-semibold mb-3">Cuộc trò chuyện ({conversations.length})</h2>
              <div className="space-y-2 max-h-[600px] overflow-auto">
                {conversations.length === 0 && <p className="text-sm text-muted-foreground">Chưa có hội thoại.</p>}
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => loadMessages(c.id)}
                    className={`w-full text-left p-2 rounded border transition ${
                      activeConv === c.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{c.visitor_name || `Khách ${c.visitor_id.slice(0, 6)}`}</p>
                    {c.visitor_phone && <p className="text-xs text-muted-foreground">{c.visitor_phone}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleString("vi-VN")}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              {!activeConv ? (
                <p className="text-sm text-muted-foreground text-center py-12">Chọn một hội thoại để xem chi tiết</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString("vi-VN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
