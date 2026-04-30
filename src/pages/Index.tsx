import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Phone, MessageCircle, Facebook, Youtube, Menu, X, ChevronDown,
  Trophy, Waves, TrendingUp, ShieldCheck, Rocket, Wallet, MapPin, Clock, Lock, Star, Shield, Check,
  Frown, Angry, Home as HomeIcon, AlertTriangle, HeartCrack, Hourglass, Flame, Building2, Gem,
} from "lucide-react";
import { SmartImage } from "@/components/SmartImage";
import { AdminPanel } from "@/components/AdminPanel";
import { Countdown } from "@/components/Countdown";
import { Lightbox } from "@/components/Lightbox";
import { ZaloQRProvider, useZaloQR } from "@/components/ZaloQRDialog";

const PHONE = "0962891111";
const PHONE_DISPLAY = "0962 891 111";
const ZALO_URL = `https://zalo.me/${PHONE}`;
// TODO: Admin sẽ cập nhật link Facebook / YouTube qua mail quản trị sau
const FB_URL = "#";
const YT_URL = "#";
const TT_URL = "#";

const NAV = [
  { id: "tongquan", label: "Tổng quan" },
  { id: "tienich", label: "Tiện ích" },
  { id: "matbang", label: "Mặt bằng" },
  { id: "sanpham", label: "Sản phẩm" },
  { id: "lienhe", label: "Liên hệ" },
];

const Index = () => (
  <ZaloQRProvider>
    <IndexInner />
  </ZaloQRProvider>
);

const IndexInner = () => {
  const { open: zaloOpen } = useZaloQR();
  const [adminOpen, setAdminOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const logoClicks = useRef(0);
  const logoTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = () => {
    logoClicks.current += 1;
    if (logoTimer.current) window.clearTimeout(logoTimer.current);
    logoTimer.current = window.setTimeout(() => (logoClicks.current = 0), 1500);
    if (logoClicks.current >= 5) {
      logoClicks.current = 0;
      setAdminOpen(true);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNav(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${scrolled ? "bg-primary-deep/95 backdrop-blur-md shadow-card" : "bg-gradient-to-b from-black/40 to-transparent"}`}>
        <div className="container flex items-center justify-between h-16 sm:h-20">
          <button onClick={handleLogoClick} className="flex items-center gap-2 select-none">
            <div className="w-10 h-10 rounded-xl gradient-sunset flex items-center justify-center font-black text-white shadow-premium">V</div>
            <span className="font-black text-lg sm:text-xl text-secondary tracking-tight">VINHOMES GLOBAL GATE HẠ LONG</span>
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="px-4 py-2 text-white/90 hover:text-secondary font-medium transition-smooth">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={`tel:${PHONE}`} className="hidden sm:inline-flex items-center gap-2 pulse-cta px-5 py-2.5 rounded-full gradient-cta text-cta-foreground font-bold text-sm shadow-cta hover:scale-105 transition-bounce">
              <Phone className="w-4 h-4" /> GỌI NGAY
            </a>
            <button onClick={() => setMobileNav(true)} className="lg:hidden text-white p-2" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      {mobileNav && (
        <div className="fixed inset-0 z-[100] bg-primary-deep/98 backdrop-blur-lg flex flex-col p-6 animate-fade-in">
          <div className="flex justify-end">
            <button onClick={() => setMobileNav(false)} className="text-white p-2"><X className="w-7 h-7" /></button>
          </div>
          <nav className="flex flex-col gap-2 mt-8">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-2xl font-bold text-white text-left py-3 border-b border-white/10">
                {n.label}
              </button>
            ))}
            <a href={`tel:${PHONE}`} className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full gradient-cta text-white font-bold shadow-cta">
              <Phone className="w-5 h-5" /> GỌI NGAY: {PHONE_DISPLAY}
            </a>
            <button onClick={() => { setMobileNav(false); zaloOpen(); }} className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#0068FF] text-white font-bold">
              <MessageCircle className="w-5 h-5" /> NHẮN ZALO
            </button>
          </nav>
        </div>
      )}

      <main>
        <Hero scrollTo={scrollTo} />
        <UrgencyBar />
        <PainPoints />
        <Solution />
        <Amenities />
        <Masterplan />
        <Products />
        <UrgencyReasons />
        <Gallery />
        <Testimonials />
        <ContactForm />
        <FAQ />
        <FinalCTA />
        <Footer scrollTo={scrollTo} />
      </main>

      {/* FLOATING DESKTOP ZALO */}
      <button
        onClick={zaloOpen}
        className="hidden md:flex fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-[#0068FF] text-white items-center justify-center shadow-cta hover:scale-110 transition-bounce float-anim"
        aria-label="Nhắn Zalo"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* MOBILE FLOATING BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 shadow-card">
        <a href={`tel:${PHONE}`} className="flex flex-col items-center justify-center py-3 bg-cta text-white font-semibold text-xs gap-1">
          <Phone className="w-5 h-5" /> Gọi ngay
        </a>
        <button onClick={zaloOpen} className="flex flex-col items-center justify-center py-3 bg-[#0068FF] text-white font-semibold text-xs gap-1">
          <MessageCircle className="w-5 h-5" /> Zalo
        </button>
        <a href={FB_URL} className="flex flex-col items-center justify-center py-3 bg-[#1877F2] text-white font-semibold text-xs gap-1">
          <Facebook className="w-5 h-5" /> Nhắn FB
        </a>
      </div>

      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
};

/* ----------------------------- HERO ----------------------------- */
const Hero = ({ scrollTo }: { scrollTo: (id: string) => void }) => (
  <section id="tongquan" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
    <SmartImage slotId="hero_bg" alt="Vinhomes Global Gate Hạ Long" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 gradient-hero" />
    <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/40 via-transparent to-primary-deep/70" />
    <div className="container relative z-10 text-center text-white pt-24 pb-32">
      {/* Marquee chữ chạy thu hút */}
      <div className="absolute top-20 left-0 right-0 overflow-hidden border-y border-secondary/40 bg-primary-deep/40 backdrop-blur-sm py-2 mb-6">
        <div className="marquee-track text-secondary font-bold text-sm sm:text-base whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-8 pr-8">
              {["🔥 ƯU ĐÃI VÀNG: Chiết khấu lên đến 18% + Tặng gói nội thất 500 triệu","💎 Chỉ còn 12 căn cuối khu Vịnh Thiên Đường","🌊 Sở hữu lâu dài — View vịnh Hạ Long trực diện","⚡ Lãi suất 0% trong 24 tháng — Ân hạn gốc 36 tháng","🏆 Vinhomes — Chủ đầu tư uy tín #1 Việt Nam"].map((t, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span>{t}</span>
                  <span className="text-white/50">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mt-12 mb-6 animate-fade-in-up glow-pulse">
        <Waves className="w-4 h-4 text-secondary" />
        <span className="text-xs sm:text-sm font-medium">Khu 1: Vịnh Thiên Đường — Paradise Bay</span>
      </div>
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 animate-fade-in-up text-emboss" style={{ animationDelay: "0.1s" }}>
        Vinhomes Global Gate Hạ Long<br />
        <span className="text-secondary">Trong Từng Góc Nhìn</span>
      </h1>
      <p className="text-base sm:text-xl text-secondary font-medium max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        VINHOMES GLOBAL GATE HẠ LONG — 935 Ha đô thị thượng lưu bên vịnh biển kỳ quan thế giới.<br />
        <span className="text-white/90 text-base">Cơ hội sở hữu BĐS tăng giá từng ngày — trước khi quá muộn.</span>
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        {[
          { i: <Trophy className="w-4 h-4" />, t: "Vinhomes — CĐT Uy Tín #1 Việt Nam" },
          { i: <Waves className="w-4 h-4" />, t: "Bên Vịnh Hạ Long — Di Sản UNESCO" },
          { i: <TrendingUp className="w-4 h-4" />, t: "Tiềm Năng Tăng Giá 30–50%/Năm" },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-secondary/40 text-sm font-medium">
            <span className="text-secondary">{b.i}</span>{b.t}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <a href={`tel:${PHONE}`} className="pulse-cta inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full gradient-cta text-white font-bold text-base shadow-cta hover:scale-105 transition-bounce">
          <Phone className="w-5 h-5" /> NHẬN TƯ VẤN MIỄN PHÍ
        </a>
        <button onClick={() => scrollTo("matbang")} className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full border-2 border-white text-white font-bold text-base hover:bg-white hover:text-primary-deep transition-smooth">
          XEM NGAY MẶT BẰNG <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  </section>
);

const UrgencyBar = () => (
  <div className="bg-primary-deep text-white py-3 overflow-hidden">
    <div className="flex whitespace-nowrap marquee">
      {Array.from({ length: 2 }).map((_, k) => (
        <div key={k} className="flex items-center gap-12 px-6 text-sm font-medium">
          <span>🔥 Hơn 500 sản phẩm đã đặt chỗ trong 48 giờ đầu công bố</span>
          <span className="text-secondary">⚡ Chỉ còn giỏ hàng ưu tiên — Liên hệ ngay để không bị bỏ lỡ</span>
          <span>📞 Hotline {PHONE_DISPLAY}</span>
          <span className="text-secondary">🎁 Ưu đãi giai đoạn đầu — đến 30/06/2026</span>
        </div>
      ))}
    </div>
  </div>
);

/* --------------------------- PAIN POINTS --------------------------- */
const PAINS = [
  { i: Frown, t: "Tiền Gửi Ngân Hàng Mãi Không Sinh Lời", d: "Lãi suất 5–6%/năm không đủ đánh bại lạm phát. Tài sản của bạn đang âm thầm bị bào mòn mỗi ngày." },
  { i: Angry, t: "Giá BĐS Tăng Mãi Mà Chưa Dám Xuống Tiền", d: "Cứ chờ 'đúng thời điểm', nhưng chần chừ là kẻ thù. Người mua trước bạn 2 năm đang lãi gấp đôi rồi." },
  { i: HomeIcon, t: "Mua BĐS Tỉnh Lẻ Không Có Thanh Khoản", d: "Tiền rót vào nhưng muốn bán lại không ai hỏi mua. BĐS đẹp phải ở đô thị có hạ tầng và dân số thực." },
  { i: AlertTriangle, t: "Đầu Tư Sai Chỗ, Mất Vốn Không Kịp Trở Tay", d: "Nhiều người 'kẹt hàng' ở dự án không rõ pháp lý. Rủi ro tiền tỷ chỉ vì không chọn đúng thương hiệu." },
  { i: HeartCrack, t: "Con Cái Lớn Lên Cần Chỗ Sống Xứng Tầm", d: "Môi trường sống quyết định tương lai. Bạn muốn con học trường quốc tế, sống văn minh — nhưng tìm đâu?" },
  { i: Hourglass, t: "Cơ Hội Vàng Qua Đi, Hối Tiếc Không Kịp", d: "Vinhomes Ocean Park, Smart City — ai mua từ đầu đều x3 tài sản. Lần này bạn có muốn lặp lại không?" },
];

const PainPoints = () => (
  <section className="py-20 sm:py-28 bg-background">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-block px-4 py-1 rounded-full bg-cta/10 text-cta-deep text-sm font-semibold mb-4">NỖI ĐAU NGƯỜI MUA BĐS</span>
        <h2 className="text-3xl sm:text-5xl font-black text-primary-deep mb-4">Bạn Có Đang Mắc Kẹt Trong<br /><span className="text-gradient-sunset">Những Vòng Lặp Này?</span></h2>
        <p className="text-muted-foreground text-base sm:text-lg">87% người mua BĐS chia sẻ với chúng tôi rằng họ đang gặp ít nhất 3 trong số những vấn đề sau:</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PAINS.map(({ i: Icon, t, d }, idx) => (
          <div key={idx} className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-card border border-border hover:border-cta/40 transition-smooth">
            <div className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-cta-deep mb-2">{t}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-accent border border-primary/20 rounded-2xl p-8 max-w-3xl mx-auto shadow-soft">
        <p className="text-lg sm:text-xl font-semibold text-primary-deep">
          → Nếu bạn gặp bất kỳ điều nào ở trên, <span className="text-cta-deep">Vinhomes Global Gate Hạ Long</span> chính là câu trả lời thị trường đã chờ đợi.
        </p>
      </div>
    </div>
  </section>
);

/* ----------------------------- SOLUTION ----------------------------- */
const Solution = () => (
  <section className="py-20 sm:py-28 gradient-deep text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--primary-glow)) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--secondary)) 0%, transparent 50%)" }} />
    <div className="container relative">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4">GIẢI PHÁP</span>
        <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
          Vinhomes Global Gate Hạ Long<br />
          <span className="text-gradient-sunset">Máy In Tiền Bên Vịnh Kỳ Quan</span>
        </h2>
        <p className="text-white/80 text-base sm:text-lg">Không phải BĐS thông thường — đây là tài sản gia tộc.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { i: Wallet, t: "Sinh Lời Ngay Từ Ngày Đầu", d: "Hạ Long đón 14 triệu lượt khách/năm. BĐS nghỉ dưỡng cho thuê tỷ suất 8–15%/năm. Vừa ở vừa kinh doanh vừa tăng giá." },
          { i: Rocket, t: "Hạ Tầng TOD Tỷ Đô", d: "Quy hoạch TOD đầu tiên Việt Nam — sân bay, cao tốc, metro kết nối trực tiếp. BĐS tăng giá theo từng km hạ tầng hoàn thiện." },
          { i: ShieldCheck, t: "Vinhomes Bảo Đảm", d: "Pháp lý minh bạch 100%. 10+ năm bàn giao đúng cam kết. Cộng đồng thượng lưu, an ninh 5 lớp, quản lý 5 sao." },
        ].map(({ i: Icon, t, d }, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-7 hover:bg-white/15 hover:-translate-y-1 transition-bounce">
            <div className="w-16 h-16 rounded-2xl gradient-premium flex items-center justify-center mb-5 shadow-premium">
              <Icon className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-3">{t}</h3>
            <p className="text-white/85 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {[
          { v: "935", u: "Ha", l: "Tổng diện tích" },
          { v: "20", u: "+", l: "Tiện ích quốc tế" },
          { v: "14", u: "tr", l: "Du khách / năm" },
          { v: "#1", u: "", l: "CĐT uy tín VN" },
        ].map((s, i) => (
          <div key={i} className="text-center bg-secondary text-secondary-foreground rounded-2xl p-5 shadow-premium">
            <div className="text-3xl sm:text-4xl font-black">{s.v}<span className="text-xl">{s.u}</span></div>
            <div className="text-xs sm:text-sm font-medium mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ----------------------------- AMENITIES ----------------------------- */
const AMENITIES = [
  { id: "amenity_1", icon: "⛳", title: "Cụm 03 Sân Golf Đẳng Cấp Thế Giới", desc: "Top sân golf đẹp nhất thế giới ngay trong khu đô thị — đặc quyền cư dân VHGG." },
  { id: "amenity_2", icon: "🛍️", title: "Vincom Megamall & TGO Outlet 71ha", desc: "Trung tâm thương mại lớn nhất miền Bắc trong dự án. Mua sắm — ăn uống — giải trí trọn vẹn." },
  { id: "amenity_3", icon: "🍺", title: "Làng Bia Quốc Tế Wonder Beer Town 4.2ha", desc: "Điểm đến giải trí độc nhất vô nhị — văn hóa bia quốc tế bên bờ vịnh." },
  { id: "amenity_4", icon: "🌿", title: "Công Viên Rừng Globe Hạ Long 80ha", desc: "80 hecta rừng nguyên sinh giữa lòng đô thị — lá phổi xanh cho cả gia đình." },
  { id: "amenity_5", icon: "🏊", title: "Bể Bơi Nổi & Bãi Biển Cát Trắng", desc: "Bãi biển dừa xanh cát trắng và bể bơi nổi nhiệt đới — kỳ nghỉ mỗi ngày tại nhà." },
  { id: "amenity_6", icon: "🎓", title: "VinSchool & Trường Quốc Tế Hàng Đầu", desc: "Hệ thống VinSchool và trường quốc tế Mỹ — đầu tư cho tương lai con em ngay hôm nay." },
];
const EXTRA_AMENITIES = [
  "Healing Oasis Park 6.3ha", "Blue Bay Park 3ha", "Coral Bay Park 4ha", "Seagull Park 2.5ha",
  "Chill Town 24/7 3ha", "Family Town 2.4ha", "Vincom Collection", "140+ Công viên nội khu", "Trường học đa cấp",
];

const Amenities = () => (
  <section id="tienich" className="py-20 sm:py-28 bg-background">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary-deep text-sm font-bold mb-4">TIỆN ÍCH ĐẲNG CẤP</span>
        <h2 className="text-3xl sm:text-5xl font-black text-primary-deep mb-4">20 Tiện ích Điểm Nhấn&nbsp;<br /><span className="text-gradient-sea">Cả Thế Giới Trong Một Đô Thị</span></h2>
        <p className="text-muted-foreground text-base sm:text-lg">Không nơi nào ở Việt Nam bạn có thể sở hữu ngôi nhà vừa sát vịnh kỳ quan UNESCO, vừa trong lòng đô thị 5 sao như thế này.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {AMENITIES.map((a) => (
          <article key={a.id} className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-smooth border border-border">
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage slotId={a.id} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 to-transparent" />
              <div className="absolute top-3 left-3 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center text-2xl shadow-soft">
                {a.icon}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-primary-deep mb-2">{a.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{a.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center">
        {EXTRA_AMENITIES.map((tag) => (
          <span key={tag} className="flex-shrink-0 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium border border-primary/20">
            ✦ {tag}
          </span>
        ))}
      </div>
    </div>
  </section>
);

/* ----------------------------- MASTERPLAN ----------------------------- */
const ZONES = [
  { color: "bg-cta", label: "Vịnh Hoàng Hôn (Sunset Bay 1/2/3)" },
  { color: "bg-secondary", label: "Vịnh Bình Minh (Sunrise Bay 1/2)" },
  { color: "bg-primary", label: "Thiên Đường Nhiệt Đới (Tropical Paradise 1/2/3)" },
  { color: "bg-primary-deep", label: "Thiên Đường Xanh (Green Paradise)" },
  { color: "bg-highlight", label: "Đảo Thiên Đường (Paradise Island)" },
];

const Masterplan = () => {
  const [open, setOpen] = useState(false);
  return (
    <section id="matbang" className="py-20 sm:py-28 gradient-mint">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">MẶT BẰNG TỔNG THỂ</span>
          <h2 className="text-3xl sm:text-5xl font-black text-primary-deep mb-4">Khu 1: Vịnh Thiên Đường</h2>
          <p className="text-muted-foreground text-base sm:text-lg">935 ha quy hoạch bài bản — mỗi m² đều là tài sản sinh lời.</p>
        </div>

        <div className="relative bg-card rounded-3xl overflow-hidden shadow-card border border-border cursor-zoom-in group" onClick={() => setOpen(true)}>
          <SmartImage slotId="masterplan" alt="Mặt bằng tổng thể VHGG Hạ Long" className="w-full max-h-[600px] object-contain bg-primary-deep transition-smooth group-hover:scale-[1.01]" />
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 text-primary-deep text-xs font-bold backdrop-blur flex items-center gap-1">
            🔍 Click để phóng to
          </div>
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur">
            VHGG HẠ LONG · {PHONE_DISPLAY}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ZONES.map((z) => (
            <div key={z.label} className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-soft border border-border">
              <span className={`w-4 h-4 rounded-full ${z.color} flex-shrink-0`} />
              <span className="text-sm font-medium text-foreground">{z.label}</span>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <Lightbox
          items={[{ slotId: "masterplan", title: "Mặt bằng tổng thể — Khu 1: Vịnh Thiên Đường" }]}
          index={0}
          onChange={() => {}}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
};

/* ----------------------------- PRODUCTS ----------------------------- */
const VILLAS = [
  { t: "Biệt thự Đơn Lập", d: "Đỉnh cao của sự độc bản — 1 căn trên 1 lô đất, riêng tư tuyệt đối, giá trị tích lũy theo thế hệ." },
  { t: "Biệt thự Song Lập 9×22", d: "Không gian rộng mở — lý tưởng cho gia đình 3 thế hệ, kết hợp kinh doanh homestay." },
  { t: "Biệt thự Song Lập 9×18", d: "Tối ưu đầu tư — cân bằng hoàn hảo giữa giá trị sử dụng và tiềm năng cho thuê nghỉ dưỡng." },
  { t: "Biệt thự Song Lập Khác", d: "Linh hoạt theo nhu cầu — đa dạng thiết kế, phù hợp từng phong cách sống." },
];
const TOWNHOUSES = [
  { t: "Liên kế 5×10", d: "Khởi đầu thông minh" },
  { t: "Liên kế 5×11", d: "Không gian tối ưu" },
  { t: "Liên kế 5×12", d: "Lý tưởng cho thuê" },
  { t: "Liên kế 5×14", d: "Đầu tư sinh lời" },
  { t: "Liên kế 5×16", d: "Thương mại kết hợp" },
  { t: "Liên kế 6×11", d: "Mặt tiền rộng" },
  { t: "Liên kế 6×16", d: "Cờ vàng đầu tư" },
];

const Products = () => {
  const [tab, setTab] = useState<"villa" | "townhouse">("villa");
  const { open: zaloOpen } = useZaloQR();
  return (
    <section id="sanpham" className="py-20 sm:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4">LOẠI HÌNH SẢN PHẨM</span>
          <h2 className="text-3xl sm:text-5xl font-black text-primary-deep mb-4">Lựa Chọn Phù Hợp —<br /><span className="text-gradient-sunset">Đầu Tư Thông Minh</span></h2>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {[
            { k: "villa", l: "Nhà Biệt Thự" },
            { k: "townhouse", l: "Nhà Liên Kế" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as "villa" | "townhouse")}
              className={`px-6 py-3 rounded-full font-bold transition-bounce ${tab === t.k ? "gradient-sea text-white shadow-glow scale-105" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === "villa" ? (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {VILLAS.map((v, i) => (
              <div key={i} className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-card border border-border transition-smooth flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl gradient-sea flex items-center justify-center flex-shrink-0 shadow-glow">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-deep mb-1">{v.t}</h3>
                  <p className="text-muted-foreground text-sm">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {TOWNHOUSES.map((v, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card border border-border hover:border-primary/40 transition-smooth text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl gradient-premium flex items-center justify-center mb-3 shadow-premium">
                  <HomeIcon className="w-7 h-7 text-secondary-foreground" />
                </div>
                <h3 className="font-bold text-lg text-primary-deep">{v.t}</h3>
                <p className="text-muted-foreground text-sm mb-4">{v.d}</p>
                <button onClick={zaloOpen} className="inline-flex items-center gap-2 text-sm font-semibold text-cta hover:text-cta-deep">
                  <MessageCircle className="w-4 h-4" /> Nhận báo giá
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { id: "product_villa", t: "Nhà Biệt Thự" },
            { id: "product_townhouse", t: "Nhà Liên Kế" },
          ].map((p) => (
            <div key={p.id} className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-card group">
              <SmartImage slotId={p.id} alt={p.t} className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-black text-secondary">{p.t}</h3>
                <p className="text-sm opacity-90 mt-1">VHGG Hạ Long · Khu 1 Vịnh Thiên Đường</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --------------------------- URGENCY REASONS --------------------------- */
const REASONS = [
  { i: Flame, t: "Giỏ Hàng Đang Cạn Dần", d: "Hơn 500 sản phẩm đã đặt chỗ ngay trong tuần công bố. VHGG HẠ LONG bán thật — không phải dự án 'khai mãi không hết hàng'." },
  { i: TrendingUp, t: "Hạ Tầng Hoàn Thiện — Giá Tăng Theo Ngày", d: "Cao tốc Hạ Long–Vân Đồn, sân bay mở rộng, metro triển khai. Mỗi ngày trì hoãn là mỗi ngày bạn mua đắt hơn." },
  { i: Gem, t: "Ưu Đãi Chỉ Áp Dụng Giai Đoạn Đầu", d: "Chính sách thanh toán linh hoạt, hỗ trợ lãi suất — chỉ dành cho khách hàng mua trong giai đoạn ra hàng đầu tiên." },
  { i: Waves, t: "Chỉ Có 1 Vịnh Hạ Long Trên Thế Giới", d: "Đây là cơ hội sở hữu tài sản tại Di Sản Thiên Nhiên UNESCO — không thể tái tạo, không thể nhân rộng." },
];

const UrgencyReasons = () => (
  <section className="py-20 sm:py-28 gradient-cta text-white relative overflow-hidden">
    <div className="container relative">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-5xl font-black mb-4">⚠️ Tại Sao Bạn Không Nên Chờ Thêm?</h2>
        <p className="text-white/90 text-base sm:text-lg">Mỗi ngày trôi qua là một cơ hội bị bỏ lỡ.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-12">
        {REASONS.map(({ i: Icon, t, d }, idx) => (
          <div key={idx} className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-6 hover:bg-white/20 transition-smooth flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-cta flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary mb-2">{t}</h3>
              <p className="text-white/90 leading-relaxed text-sm">{d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center bg-black/30 backdrop-blur-md rounded-3xl p-8 max-w-3xl mx-auto border border-white/20">
        <p className="text-secondary font-bold text-lg mb-4">🕐 ƯU ĐÃI KẾT THÚC SAU:</p>
        <Countdown variant="dark" />
        <a href={`tel:${PHONE}`} className="mt-8 inline-flex items-center gap-2 px-8 h-14 rounded-full bg-white text-cta font-black text-base shadow-cta hover:scale-105 transition-bounce">
          <Phone className="w-5 h-5" /> LIÊN HỆ NGAY — NHẬN GIỎ HÀNG ƯU TIÊN
        </a>
      </div>
    </div>
  </section>
);

/* ----------------------------- GALLERY ----------------------------- */
const GALLERY_IDS = ["gallery_1", "gallery_2", "gallery_3", "gallery_4", "gallery_5", "gallery_6"];

const GALLERY_ITEMS = GALLERY_IDS.map((id, i) => ({
  slotId: id,
  title: `VHGG Hạ Long — Ảnh dự án ${i + 1}`,
}));

const Gallery = () => {
  const [idx, setIdx] = useState<number | null>(null);
  return (
    <section className="py-20 sm:py-28 bg-[#0f1419] text-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4">THƯ VIỆN DỰ ÁN</span>
          <h2 className="text-3xl sm:text-5xl font-black mb-4">VHGG Hạ Long —<br /><span className="text-gradient-sunset">Trong Từng Góc Nhìn</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {GALLERY_IDS.map((id, i) => (
            <button key={id} onClick={() => setIdx(i)} className="group relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-card">
              <SmartImage slotId={id} alt={`Ảnh dự án ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500" />
              <div className="absolute inset-0 bg-primary-deep/0 group-hover:bg-primary-deep/40 transition-smooth flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-smooth text-white font-semibold">🔍 Phóng to</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {idx !== null && (
        <Lightbox
          items={GALLERY_ITEMS}
          index={idx}
          onChange={setIdx}
          onClose={() => setIdx(null)}
        />
      )}
    </section>
  );
};

/* ----------------------------- TESTIMONIALS ----------------------------- */
const TESTIMONIALS = [
  { id: "testimonial_1", n: "Anh Nguyễn Thanh Hưng", r: "Doanh nhân, Hà Nội", q: "Tôi đã đầu tư Vinhomes Ocean Park từ 2019 và lãi gấp 3 sau 5 năm. Khi nghe VHGG Hạ Long ra mắt, tôi không chần chừ nửa giây. Cơ hội như thế này không đến hai lần." },
  { id: "testimonial_2", n: "Chị Trần Minh Châu", r: "Chuyên gia tài chính, TP.HCM", q: "Sau khi nghiên cứu quy hoạch TOD và hạ tầng Hạ Long, tôi kết luận: đây là điểm đầu tư 10 năm có 1. Vinhomes + vịnh UNESCO + hạ tầng nghìn tỷ = bộ ba hoàn hảo." },
  { id: "testimonial_3", n: "Anh Lê Đức Minh", r: "Kiến trúc sư, Quảng Ninh", q: "Sống ở Hạ Long 15 năm, tôi chưa bao giờ thấy dự án nào quy hoạch bài bản và đẳng cấp như VHGG. Gia đình tôi đã đặt 2 căn liên kề và 1 biệt thự." },
];

const Testimonials = () => (
  <section className="py-20 sm:py-28 gradient-mint">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-block px-4 py-1 rounded-full bg-cta text-white text-sm font-bold mb-4">KHÁCH HÀNG NÓI GÌ</span>
        <h2 className="text-3xl sm:text-5xl font-black text-primary-deep">Nhà Đầu Tư Thông Minh<br /><span className="text-gradient-sea">Đã Nói Gì Sau Khi Xuống Tiền?</span></h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <div key={t.id} className="bg-card rounded-3xl p-7 shadow-card border border-border relative">
            <div className="text-secondary text-5xl absolute top-4 right-6 font-serif leading-none">"</div>
            <div className="flex items-center gap-4 mb-4">
              <SmartImage slotId={t.id} alt={t.n} className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20" />
              <div>
                <h4 className="font-bold text-primary-deep">{t.n}</h4>
                <p className="text-xs text-muted-foreground">{t.r}</p>
                <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-secondary text-secondary" />)}</div>
              </div>
            </div>
            <p className="text-foreground/85 leading-relaxed text-sm italic">"{t.q}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ----------------------------- CONTACT FORM ----------------------------- */
type FormData = {
  name: string;
  phone: string;
  email?: string;
  product: string;
  budget: string;
  note?: string;
};

const ContactForm = () => {
  const { open: zaloOpen } = useZaloQR();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    const stored = JSON.parse(localStorage.getItem("vhgg_leads") ?? "[]");
    stored.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem("vhgg_leads", JSON.stringify(stored));
    toast.success("✅ Đăng ký thành công!", { description: "Chuyên viên sẽ liên hệ bạn trong 15 phút." });
    reset();
  };

  return (
    <section id="lienhe" className="py-20 sm:py-28 bg-background">
      <div className="container grid lg:grid-cols-2 gap-8 items-start">
        {/* FORM */}
        <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-card border border-border">
          <span className="inline-block px-4 py-1 rounded-full bg-cta text-white text-sm font-bold mb-3">ĐĂNG KÝ TƯ VẤN</span>
          <h2 className="text-2xl sm:text-3xl font-black text-primary-deep mb-2">Nhận Tư Vấn Miễn Phí — Chỉ 30 Giây</h2>
          <p className="text-muted-foreground mb-6 text-sm">Chuyên viên sẽ liên hệ trong 15 phút (8h–22h hàng ngày).</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("name", { required: "Vui lòng nhập họ tên" })}
                placeholder="Họ và tên *"
                className="w-full px-4 h-12 rounded-xl bg-muted border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
              />
              {errors.name && <p className="text-cta text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <input
                {...register("phone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: { value: /^(0|\+84)(\d{9,10})$/, message: "Số điện thoại không hợp lệ" },
                })}
                placeholder="Số điện thoại *  (vd: 09xxxxxxxx)"
                className="w-full px-4 h-12 rounded-xl bg-muted border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
              />
              {errors.phone && <p className="text-cta text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <input
              {...register("email")}
              placeholder="Email (không bắt buộc)"
              className="w-full px-4 h-12 rounded-xl bg-muted border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
            />
            <select
              {...register("product")}
              defaultValue=""
              className="w-full px-4 h-12 rounded-xl bg-muted border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
            >
              <option value="" disabled>— Loại sản phẩm quan tâm —</option>
              <option>Biệt thự đơn lập</option>
              <option>Song lập 9×22</option>
              <option>Song lập 9×18</option>
              <option>Liên kế 5×10</option>
              <option>Liên kế 5×11</option>
              <option>Liên kế 5×12</option>
              <option>Liên kế 5×14</option>
              <option>Liên kế 5×16</option>
              <option>Liên kế 6×11</option>
              <option>Liên kế 6×16</option>
              <option>Chưa xác định</option>
            </select>
            <select
              {...register("budget")}
              defaultValue=""
              className="w-full px-4 h-12 rounded-xl bg-muted border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
            >
              <option value="" disabled>— Ngân sách dự kiến —</option>
              <option>Dưới 5 tỷ</option>
              <option>5–10 tỷ</option>
              <option>10–20 tỷ</option>
              <option>Trên 20 tỷ</option>
              <option>Sẽ trao đổi với chuyên viên</option>
            </select>
            <textarea
              {...register("note")}
              placeholder="Ghi chú (không bắt buộc)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-smooth"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-full gradient-cta text-white font-black shadow-cta hover:scale-[1.02] transition-bounce pulse-cta disabled:opacity-60"
            >
              {isSubmitting ? "ĐANG GỬI..." : "ĐĂNG KÝ TƯ VẤN NGAY 🔥"}
            </button>
            <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
              <Lock className="w-3 h-3" /> Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi không spam.
            </p>
          </form>
        </div>

        {/* CONTACT INFO */}
        <div className="gradient-deep text-white rounded-3xl p-6 sm:p-10 shadow-card border border-white/10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full gradient-sunset opacity-30 blur-3xl" />
          <div className="relative">
            <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4">LIÊN HỆ TRỰC TIẾP</span>
            <h3 className="text-2xl sm:text-3xl font-black mb-6">Liên Hệ Trực Tiếp&nbsp;</h3>

            <div className="flex items-center gap-4 mb-6">
              <SmartImage slotId="agent_avatar" alt="Chuyên viên VHGG" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-secondary/40" />
              <div>
                <h4 className="font-bold text-secondary text-lg">Chuyên Viên Tư Vấn Vinhomes Hạ Long Xanh</h4>
                <p className="text-white/80 text-sm">Tận tâm — Chuyên nghiệp — Hiệu quả</p>
              </div>
            </div>

            <div className="space-y-3">
              <a href={`tel:${PHONE}`} className="flex items-center justify-center gap-2 h-12 rounded-xl gradient-cta text-white font-bold shadow-cta hover:scale-[1.02] transition-bounce">
                <Phone className="w-5 h-5" /> GỌI NGAY: {PHONE_DISPLAY}
              </a>
              <button onClick={zaloOpen} className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0068FF] text-white font-bold hover:scale-[1.02] transition-bounce">
                <MessageCircle className="w-5 h-5" /> NHẮN ZALO: {PHONE_DISPLAY}
              </button>
              <a href={FB_URL} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#1877F2] text-white font-bold hover:scale-[1.02] transition-bounce">
                <Facebook className="w-5 h-5" /> FACEBOOK
              </a>
              <a href={YT_URL} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#FF0000] text-white font-bold hover:scale-[1.02] transition-bounce">
                <Youtube className="w-5 h-5" /> YOUTUBE
              </a>
            </div>

            <p className="text-xs text-white/60 mt-3 text-center">💡 Bấm nút <strong className="text-secondary">"NHẮN ZALO"</strong> để hiện QR — quét nhanh từ điện thoại</p>

            <div className="mt-6 pt-6 border-t border-white/15 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Hỗ trợ 7 ngày/tuần: 7:30 – 22:00</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary" /> Văn phòng: Hạ Long, Quảng Ninh</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------- FAQ ----------------------------- */
const FAQS = [
  { q: "Vinhomes Global Gate Hạ Long có pháp lý đầy đủ chưa?", a: "Dự án được phát triển bởi Vinhomes — thành viên Vingroup, một trong những CĐT uy tín hàng đầu Việt Nam với 10+ năm bàn giao đúng cam kết. Pháp lý dự án minh bạch, có thể yêu cầu xem hồ sơ bất kỳ lúc nào." },
  { q: "Tôi cần bao nhiêu vốn để đầu tư vào dự án này?", a: "Tùy loại sản phẩm và phương thức thanh toán. Vinhomes có chính sách thanh toán linh hoạt, hỗ trợ vay ngân hàng đến 70–80% giá trị. Liên hệ chuyên viên để được tư vấn phương án tài chính phù hợp." },
  { q: "Tiềm năng cho thuê nghỉ dưỡng tại đây như thế nào?", a: "Hạ Long đón 14 triệu lượt khách/năm, BĐS nghỉ dưỡng có tỷ lệ lấp đầy 70–90% mùa cao điểm. Tỷ suất cho thuê ước tính 8–15%/năm tùy vị trí và loại sản phẩm." },
  { q: "Dự án bao giờ bàn giao?", a: "Theo tiến độ dự kiến của CĐT. Vinhomes nổi tiếng bàn giao đúng hạn. Liên hệ ngay để nhận cập nhật tiến độ mới nhất." },
  { q: "Tôi ở TP.HCM / Hà Nội có thể mua được không?", a: "Hoàn toàn được! Chúng tôi hỗ trợ tư vấn online, gửi tài liệu điện tử, tổ chức tham quan thực tế miễn phí (xe đưa đón từ Hà Nội)." },
  { q: "VHGG Hạ Long khác gì so với các dự án Vinhomes khác?", a: "Đây là dự án TOD đầu tiên của Vinhomes và Việt Nam — tích hợp giao thông công cộng vào quy hoạch. Vị trí ngay bên vịnh UNESCO là đặc quyền không thể tìm thấy ở bất kỳ dự án nào khác." },
  { q: "Có thể xem thực tế dự án không?", a: "Có! Chúng tôi tổ chức tham quan thực địa định kỳ với xe đưa đón. Đăng ký để đặt suất tham quan miễn phí cuối tuần gần nhất." },
  { q: "Nếu muốn bán lại sau này có khó không?", a: "Thanh khoản là điểm mạnh của BĐS Vinhomes. Cộng đồng mua đi bán lại Vinhomes rất sôi động. Thương hiệu mạnh + vị trí đắc địa + hạ tầng tốt = thanh khoản cao." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20 sm:py-28 bg-accent/40">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">FAQ</span>
          <h2 className="text-3xl sm:text-5xl font-black text-primary-deep">Những Câu Hỏi Thường Gặp</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden transition-smooth">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="font-bold text-primary-deep">{f.q}</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-smooth ${open === i ? "rotate-180 text-cta" : "text-muted-foreground"}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed text-sm animate-fade-in">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------- FINAL CTA ----------------------------- */
const FinalCTA = () => {
  const { open: zaloOpen } = useZaloQR();
  return (
  <section className="py-24 sm:py-32 gradient-cta text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, hsl(var(--secondary)) 0%, transparent 40%), radial-gradient(circle at 70% 80%, hsl(var(--highlight)) 0%, transparent 40%)" }} />
    <div className="container relative text-center max-w-3xl">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
        Đừng Để 5 Năm Sau Bạn Hỏi:<br /><span className="text-secondary">"Sao Hồi Đó Mình Không Mua?"</span>
      </h2>
      <p className="text-base sm:text-xl text-white/95 mb-10">
        Người mua Vinhomes Ocean Park 2019 đang lãi <strong>300%</strong>.<br />
        Người mua Smart City 2020 đang lãi <strong>200%</strong>.<br />
        <span className="text-secondary font-bold">Bạn sẽ là người mua VHGG Hạ Long 2025 lãi bao nhiêu?</span>
      </p>

      <p className="text-secondary font-bold mb-4">⏳ ƯU ĐÃI GIAI ĐOẠN ĐẦU KẾT THÚC SAU:</p>
      <Countdown variant="dark" />

      <div className="mt-10 flex flex-col gap-3 max-w-md mx-auto">
        <a href={`tel:${PHONE}`} className="h-16 rounded-full bg-white text-cta font-black text-lg flex items-center justify-center gap-2 shadow-cta hover:scale-105 transition-bounce">
          <Phone className="w-6 h-6" /> GỌI NGAY — {PHONE_DISPLAY}
        </a>
        <button onClick={zaloOpen} className="h-16 rounded-full bg-[#0068FF] text-white font-black text-lg flex items-center justify-center gap-2 hover:scale-105 transition-bounce">
          <MessageCircle className="w-6 h-6" /> NHẮN ZALO — QUÉT QR NGAY
        </button>
        <p className="text-xs text-white/80">💡 Bấm "NHẮN ZALO" để hiện mã QR — quét bằng app Zalo trên điện thoại</p>
      </div>

      <div className="mt-10 max-w-lg mx-auto bg-black/30 backdrop-blur-md rounded-2xl p-6 text-left border border-white/20">
        <p className="font-bold text-secondary mb-3 flex items-center gap-2"><Shield className="w-5 h-5" /> CAM KẾT TỪ CHÚNG TÔI:</p>
        <ul className="space-y-2 text-sm">
          {["Tư vấn miễn phí, không ép buộc", "Thông tin pháp lý minh bạch 100%", "Tham quan thực tế miễn phí", "Hỗ trợ thủ tục từ A đến Z"].map((c) => (
            <li key={c} className="flex items-start gap-2"><Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" /> {c}</li>
          ))}
        </ul>
      </div>
    </div>
  </section>
  );
};

/* ----------------------------- FOOTER ----------------------------- */
const Footer = ({ scrollTo }: { scrollTo: (id: string) => void }) => {
  const { open: zaloOpen } = useZaloQR();
  return (
  <footer className="bg-primary-deep text-white pt-16 pb-24 md:pb-10">
    <div className="container grid md:grid-cols-3 gap-10">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-sunset flex items-center justify-center font-black text-white">V</div>
          <span className="font-black text-xl text-secondary">Vinhomes Global Gate<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HẠ LONG</span>
        </div>
        <p className="text-white/70 text-sm mb-2">Đại lý phân phối chính thức</p>
        <p className="text-white/90 font-medium mb-4">Vinhomes Global Gate Hạ Long — Khu 1: Vịnh Thiên Đường</p>
        <p className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-secondary" /> Hotline: <a href={`tel:${PHONE}`} className="font-bold hover:text-secondary">{PHONE_DISPLAY}</a></p>
        <p className="text-sm flex items-center gap-2 mt-1"><MessageCircle className="w-4 h-4 text-secondary" /> Zalo: <button onClick={zaloOpen} className="font-bold hover:text-secondary underline-offset-2 hover:underline">{PHONE_DISPLAY}</button></p>
      </div>

      <div>
        <h4 className="font-bold text-secondary mb-4">Liên kết nhanh</h4>
        <ul className="space-y-2 text-white/80 text-sm">
          {NAV.map((n) => (
            <li key={n.id}>
              <button onClick={() => scrollTo(n.id)} className="hover:text-secondary transition-smooth">{n.label}</button>
            </li>
          ))}
          <li><button onClick={() => scrollTo("lienhe")} className="hover:text-secondary transition-smooth">Đăng ký tư vấn</button></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-secondary mb-4">Theo dõi chúng tôi</h4>
        <div className="flex gap-3 mb-4">
          <a href={FB_URL} target="_blank" rel="noopener" className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-bounce"><Facebook className="w-5 h-5" /></a>
          <a href={YT_URL} target="_blank" rel="noopener" className="w-11 h-11 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition-bounce"><Youtube className="w-5 h-5" /></a>
          <button onClick={zaloOpen} aria-label="Nhắn Zalo" className="w-11 h-11 rounded-full bg-[#0068FF] flex items-center justify-center hover:scale-110 transition-bounce"><MessageCircle className="w-5 h-5" /></button>
          <a href={TT_URL} target="_blank" rel="noopener" className="w-11 h-11 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-bounce"><span className="font-black text-sm">TT</span></a>
        </div>
      </div>
    </div>

    <div className="container mt-10 pt-6 border-t border-white/15 text-center text-xs text-white/60 space-y-2">
      <p>© 2025 Vinhomes Global Gate Hạ Long · Đại lý phân phối ủy quyền · Hotline: <a href={`tel:${PHONE}`} className="text-secondary font-semibold">{PHONE_DISPLAY}</a></p>
      <p className="opacity-80">⚠️ Thông tin trên trang chỉ mang tính tham khảo. Giá và chính sách có thể thay đổi. Liên hệ trực tiếp để cập nhật mới nhất.</p>
    </div>
  </footer>
  );
};

export default Index;
