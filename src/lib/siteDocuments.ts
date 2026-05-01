import { supabase } from "@/integrations/supabase/client";

export interface SiteDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: "pdf" | "image" | "other";
  mime_type: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export function detectFileType(mime: string): "pdf" | "image" | "other" {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  return "other";
}

export async function listDocuments(activeOnly = true): Promise<SiteDocument[]> {
  let q = supabase.from("site_documents").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as SiteDocument[];
}

export async function createDocument(input: {
  title: string;
  description?: string;
  file_url: string;
  file_type: "pdf" | "image" | "other";
  mime_type?: string;
  file_size?: number;
  thumbnail_url?: string;
  sort_order?: number;
}) {
  const { error } = await supabase.from("site_documents").insert(input);
  if (error) throw error;
}

export async function updateDocument(id: string, patch: Partial<SiteDocument>) {
  const { error } = await supabase.from("site_documents").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from("site_documents").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadDocumentFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
  const path = `documents/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("site-media").getPublicUrl(path);
  return data.publicUrl;
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}
