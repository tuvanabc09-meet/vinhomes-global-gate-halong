import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatMsg { role: "user" | "assistant"; content: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { messages, visitorId, visitorName, visitorPhone, conversationId } =
      (await req.json()) as {
        messages: ChatMsg[];
        visitorId: string;
        visitorName?: string;
        visitorPhone?: string;
        conversationId?: string;
      };

    if (!Array.isArray(messages) || messages.length === 0 || !visitorId) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Load active knowledge base
    const { data: kb } = await admin
      .from("knowledge_base")
      .select("title, content")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    const kbText = (kb ?? [])
      .map((k) => `### ${k.title}\n${k.content}`)
      .join("\n\n");

    const systemPrompt = `Bạn là trợ lý tư vấn bất động sản dự án Vinhomes Global Gate Hạ Long – Khu 1 Paradise Bay.
Trả lời thân thiện, ngắn gọn, lịch sự bằng tiếng Việt. Luôn dựa trên TÀI LIỆU dưới đây.
Nếu câu hỏi nằm ngoài phạm vi tài liệu, hãy lịch sự đề nghị khách để lại số điện thoại để chuyên viên gọi lại.
Khi khách quan tâm sản phẩm/giá, khuyến khích để lại SĐT.

=== TÀI LIỆU ===
${kbText || "(chưa có tài liệu)"}
=== HẾT ===`;

    // Ensure conversation exists
    let convId = conversationId;
    if (!convId) {
      const { data: conv, error: cErr } = await admin
        .from("chat_conversations")
        .insert({
          visitor_id: visitorId,
          visitor_name: visitorName ?? null,
          visitor_phone: visitorPhone ?? null,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;
      convId = conv.id;
    }

    // Save the latest user message
    const lastUser = messages[messages.length - 1];
    if (lastUser?.role === "user") {
      await admin.from("chat_messages").insert({
        conversation_id: convId,
        role: "user",
        content: lastUser.content.slice(0, 4000),
      });
    }

    // Call Lovable AI
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "Hệ thống đang quá tải, vui lòng thử lại sau ít phút." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "Hết credit AI. Vui lòng nạp thêm trong Workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error("AI gateway error");
    }

    const data = await aiResp.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

    await admin.from("chat_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: reply,
    });
    await admin.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);

    return new Response(JSON.stringify({ reply, conversationId: convId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
