import { supabase } from "@/integrations/supabase/client";

export interface SiteMediaRow {
  slot_id: string;
  kind: "image" | "video";
  url: string;
  video_type: "youtube" | "upload" | null;
  title: string | null;
}

let cache: Record<string, SiteMediaRow> = {};
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function subscribeMedia(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function emit() {
  listeners.forEach((l) => l());
}

export async function loadAllMedia() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const { data } = await supabase.from("site_media").select("*");
      cache = {};
      (data ?? []).forEach((r) => {
        cache[r.slot_id] = r as SiteMediaRow;
      });
      emit();
    })();
  }
  return loadPromise;
}

export function getMedia(slotId: string): SiteMediaRow | undefined {
  return cache[slotId];
}

export async function refreshMedia() {
  loadPromise = null;
  await loadAllMedia();
}

export async function upsertMediaImage(slotId: string, url: string, title?: string) {
  const { error } = await supabase
    .from("site_media")
    .upsert({ slot_id: slotId, kind: "image", url, title }, { onConflict: "slot_id" });
  if (error) throw error;
  await refreshMedia();
}

export async function upsertMediaVideo(
  slotId: string,
  url: string,
  videoType: "youtube" | "upload",
  title?: string,
) {
  const { error } = await supabase
    .from("site_media")
    .upsert(
      { slot_id: slotId, kind: "video", url, video_type: videoType, title },
      { onConflict: "slot_id" },
    );
  if (error) throw error;
  await refreshMedia();
}

export async function deleteMedia(slotId: string) {
  const { error } = await supabase.from("site_media").delete().eq("slot_id", slotId);
  if (error) throw error;
  await refreshMedia();
}

export async function uploadFileToBucket(file: File, prefix: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("site-media").getPublicUrl(path);
  return data.publicUrl;
}

export function youtubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    let id: string | null = null;
    if (url.hostname.includes("youtu.be")) id = url.pathname.slice(1);
    else if (url.searchParams.get("v")) id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2];
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
