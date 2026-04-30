import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const LeadSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^(\+?\d{6,20})$/, "Invalid phone"),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  product_interest: z.string().trim().max(100).optional().or(z.literal("")),
  budget: z.string().trim().max(100).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

const NOTIFY_TO = "tuvanabc01@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const phoneNorm = String(body.phone ?? "").replace(/[\s.-]/g, "");
    const parsed = LeadSchema.safeParse({ ...body, phone: phoneNorm });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const insertRow = {
      full_name: data.full_name,
      phone: data.phone,
      email: data.email || null,
      product_interest: data.product_interest || null,
      budget: data.budget || null,
      note: data.note || null,
      source: "website",
    };

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert(insertRow)
      .select()
      .single();
    if (error) throw error;

    // Try to send email via Resend (optional — only if API key configured)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const html = `
        <h2>🔔 Khách mới đăng ký tư vấn — VHGG Hạ Long</h2>
        <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>Họ tên</b></td><td style="padding:6px 12px">${escapeHtml(data.full_name)}</td></tr>
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>SĐT</b></td><td style="padding:6px 12px"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>Email</b></td><td style="padding:6px 12px">${escapeHtml(data.email || "-")}</td></tr>
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>Sản phẩm</b></td><td style="padding:6px 12px">${escapeHtml(data.product_interest || "-")}</td></tr>
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>Ngân sách</b></td><td style="padding:6px 12px">${escapeHtml(data.budget || "-")}</td></tr>
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>Ghi chú</b></td><td style="padding:6px 12px">${escapeHtml(data.note || "-")}</td></tr>
          <tr><td style="padding:6px 12px;background:#f3f4f6"><b>Thời gian</b></td><td style="padding:6px 12px">${new Date(inserted.created_at).toLocaleString("vi-VN")}</td></tr>
        </table>
        <p style="color:#666;font-size:12px;margin-top:16px">Toàn bộ danh sách khách & xuất CSV trong trang quản trị.</p>
      `;

      const csv = toCsv([inserted]);
      const csvB64 = btoa(unescape(encodeURIComponent(csv)));

      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "VHGG Leads <onboarding@resend.dev>",
            to: [NOTIFY_TO],
            subject: `🔔 Khách mới: ${data.full_name} — ${data.phone}`,
            html,
            attachments: [
              { filename: `lead-${inserted.id.slice(0, 8)}.csv`, content: csvB64 },
            ],
          }),
        });
        if (!r.ok) console.error("Resend error", r.status, await r.text());
      } catch (e) {
        console.error("Email send failed", e);
      }
    } else {
      console.log("RESEND_API_KEY not configured — skipping email notification");
    }

    return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-lead error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = ["created_at", "full_name", "phone", "email", "product_interest", "budget", "note", "source"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");
  return "\uFEFF" + head + "\n" + body;
}
