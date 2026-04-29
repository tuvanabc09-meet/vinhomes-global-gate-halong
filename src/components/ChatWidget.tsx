import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Loader2 } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";

interface Msg { role: "user" | "assistant"; content: string }

const getVisitorId = () => {
  let id = localStorage.getItem("vh_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("vh_visitor_id", id);
  }
  return id;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Xin chào! Tôi là trợ lý tư vấn Vinhomes Global Gate Hạ Long. Bạn cần tìm hiểu điều gì ạ?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: next,
          visitorId: getVisitorId(),
          conversationId: convId,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.conversationId) setConvId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi kết nối";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 hover:scale-105 transition-transform"
          aria-label="Mở chat tư vấn"
        >
          <span className="hidden sm:block bg-background border rounded-2xl rounded-br-sm shadow-lg px-3 py-2 text-sm font-medium animate-fade-in">
            Chào bạn! Cần tư vấn? 💬
          </span>
          <span className="relative">
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
            <SmartImage
              slotId="agent_avatar"
              alt="Trợ lý tư vấn"
              className="relative w-16 h-16 rounded-full object-cover border-4 border-background shadow-2xl"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
          </span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Tư vấn 24/7</h3>
              <p className="text-xs opacity-90">Vinhomes Global Gate Hạ Long</p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3 bg-muted/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-background border rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-muted-foreground">Đang trả lời...</span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t bg-background flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              disabled={loading}
              maxLength={1000}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
