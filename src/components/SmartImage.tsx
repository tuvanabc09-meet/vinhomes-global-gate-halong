import { useEffect, useState } from "react";
import { getImage } from "@/lib/images";
import { getMedia, loadAllMedia, subscribeMedia } from "@/lib/siteMedia";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  slotId: string;
}

/** Image bound to an admin-editable slot. Cloud first, then localStorage, then default. */
export const SmartImage = ({ slotId, alt = "", className, ...rest }: SmartImageProps) => {
  const resolve = () => {
    const cloud = getMedia(slotId);
    if (cloud && cloud.kind === "image") return cloud.url;
    return getImage(slotId);
  };
  const [src, setSrc] = useState<string>(resolve);

  useEffect(() => {
    loadAllMedia().then(() => setSrc(resolve()));
    const unsub = subscribeMedia(() => setSrc(resolve()));
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>;
      if (ce.detail?.id === slotId) setSrc(resolve());
    };
    window.addEventListener("vhgg-image-updated", handler);
    return () => {
      unsub();
      window.removeEventListener("vhgg-image-updated", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

  return <img src={src} alt={alt} className={className} {...rest} />;
};
