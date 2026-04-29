import { createContext, useContext, useState, ReactNode } from "react";
import { X, ExternalLink, Phone } from "lucide-react";
import { SmartImage } from "@/components/SmartImage";

const PHONE = "0962891111";
const PHONE_DISPLAY = "0962 891 111";
const ZALO_URL = `https://zalo.me/${PHONE}`;

interface Ctx { open: () => void }
const ZaloQRContext = createContext<Ctx>({ open: () => {} });
export const useZaloQR = () => useContext(ZaloQRContext);

export const ZaloQRProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ZaloQRContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative bg-background rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-smooth"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0068FF]/10 text-[#0068FF] text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-[#0068FF] rounded-full animate-pulse" />
                LIÊN HỆ ZALO
              </div>
              <h3 className="text-xl font-black text-foreground mb-1">Quét mã QR để chat ngay</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mở Zalo trên điện thoại → bấm biểu tượng <strong>QR</strong> → quét mã bên dưới
              </p>

              <div className="bg-white p-4 rounded-2xl border-4 border-[#0068FF]/20 mx-auto inline-block">
                <SmartImage
                  slotId="qr_zalo"
                  alt="QR Zalo Ngọc Mai Land"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="mt-5 space-y-2">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0068FF] text-white font-bold hover:bg-[#0055cc] transition-smooth"
                >
                  <ExternalLink className="w-5 h-5" /> Mở Zalo trực tiếp
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-smooth"
                >
                  <Phone className="w-4 h-4" /> Gọi {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </ZaloQRContext.Provider>
  );
};
