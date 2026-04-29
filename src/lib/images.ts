import heroBg from "@/assets/hero-bg.jpg";
import masterplan from "@/assets/masterplan.jpg";
import amenityGolf from "@/assets/amenity-golf.jpg";
import amenityMall from "@/assets/amenity-mall.jpg";
import amenityBeer from "@/assets/amenity-beer.jpg";
import amenityPark from "@/assets/amenity-park.jpg";
import amenityPool from "@/assets/amenity-pool.jpg";
import amenitySchool from "@/assets/amenity-school.jpg";
import productVilla from "@/assets/product-villa.jpg";
import productTownhouse from "@/assets/product-townhouse.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import agentAvatar from "@/assets/agent-avatar.jpg";

export const DEFAULT_IMAGES: Record<string, string> = {
  hero_bg: heroBg,
  masterplan: masterplan,
  amenity_1: amenityGolf,
  amenity_2: amenityMall,
  amenity_3: amenityBeer,
  amenity_4: amenityPark,
  amenity_5: amenityPool,
  amenity_6: amenitySchool,
  product_villa: productVilla,
  product_townhouse: productTownhouse,
  gallery_1: gallery1,
  gallery_2: gallery2,
  gallery_3: gallery3,
  gallery_4: gallery4,
  gallery_5: gallery5,
  gallery_6: gallery6,
  testimonial_1: testimonial1,
  testimonial_2: testimonial2,
  testimonial_3: testimonial3,
  agent_avatar: agentAvatar,
};

export const IMAGE_SLOTS: { id: string; label: string }[] = [
  { id: "hero_bg", label: "Ảnh nền Hero (1920×1080)" },
  { id: "masterplan", label: "Mặt bằng tổng thể" },
  { id: "amenity_1", label: "Tiện ích 1 — Sân Golf" },
  { id: "amenity_2", label: "Tiện ích 2 — Vincom Megamall" },
  { id: "amenity_3", label: "Tiện ích 3 — Làng Bia" },
  { id: "amenity_4", label: "Tiện ích 4 — Công viên rừng" },
  { id: "amenity_5", label: "Tiện ích 5 — Bể bơi & biển" },
  { id: "amenity_6", label: "Tiện ích 6 — Trường học" },
  { id: "product_villa", label: "Sản phẩm — Biệt thự" },
  { id: "product_townhouse", label: "Sản phẩm — Liên kế" },
  { id: "gallery_1", label: "Thư viện 1" },
  { id: "gallery_2", label: "Thư viện 2" },
  { id: "gallery_3", label: "Thư viện 3" },
  { id: "gallery_4", label: "Thư viện 4" },
  { id: "gallery_5", label: "Thư viện 5" },
  { id: "gallery_6", label: "Thư viện 6" },
  { id: "testimonial_1", label: "Khách hàng 1" },
  { id: "testimonial_2", label: "Khách hàng 2" },
  { id: "testimonial_3", label: "Khách hàng 3" },
  { id: "agent_avatar", label: "Ảnh môi giới" },
];

const STORAGE_PREFIX = "vhgg_images_";

export function getImage(id: string): string {
  if (typeof window === "undefined") return DEFAULT_IMAGES[id] ?? "";
  const stored = localStorage.getItem(STORAGE_PREFIX + id);
  return stored ?? DEFAULT_IMAGES[id] ?? "";
}

export function setImage(id: string, dataUrl: string) {
  localStorage.setItem(STORAGE_PREFIX + id, dataUrl);
  window.dispatchEvent(new CustomEvent("vhgg-image-updated", { detail: { id } }));
}

export function resetImage(id: string) {
  localStorage.removeItem(STORAGE_PREFIX + id);
  window.dispatchEvent(new CustomEvent("vhgg-image-updated", { detail: { id } }));
}
