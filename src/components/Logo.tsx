import { useEffect, useState } from "react";
import { getMedia, loadAllMedia, subscribeMedia } from "@/lib/siteMedia";
import { getImage } from "@/lib/images";

const SLOT = "logo";

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  const [, force] = useState(0);

  useEffect(() => {
    loadAllMedia().then(() => force((n) => n + 1));
    const unsub = subscribeMedia(() => force((n) => n + 1));
    const onLocal = () => force((n) => n + 1);
    window.addEventListener("vhgg-image-updated", onLocal);
    return () => { unsub(); window.removeEventListener("vhgg-image-updated", onLocal); };
  }, []);

  const cloudUrl = getMedia(SLOT)?.url;
  const localUrl = getImage(SLOT);
  const url = cloudUrl || (localUrl !== SLOT ? localUrl : null);

  if (url) {
    return (
      <img
        src={url}
        alt="Vinhomes Global Gate Hạ Long"
        className={`${className} object-contain rounded-full bg-white/10 shadow-premium`}
      />
    );
  }

  return (
    <div className={`${className} gradient-sunset flex items-center justify-center font-black text-white shadow-premium rounded-full`}>
      ​
    </div>
  );
};
