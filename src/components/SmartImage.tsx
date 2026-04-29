import { useEffect, useState } from "react";
import { getImage } from "@/lib/images";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  slotId: string;
}

/** Image bound to an admin-editable slot (localStorage backed). */
export const SmartImage = ({ slotId, alt = "", className, ...rest }: SmartImageProps) => {
  const [src, setSrc] = useState(() => getImage(slotId));

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>;
      if (ce.detail?.id === slotId) setSrc(getImage(slotId));
    };
    window.addEventListener("vhgg-image-updated", handler);
    return () => window.removeEventListener("vhgg-image-updated", handler);
  }, [slotId]);

  return <img src={src} alt={alt} className={className} {...rest} />;
};
