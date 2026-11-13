import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already installed & running in standalone mode
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (inStandalone) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if dismissed recently (within 24 hours)
    const dismissedUntil = localStorage.getItem("soalku_pwa_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      setIsDismissed(true);
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Capture beforeinstallprompt on Chromium (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Handle appinstalled event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      console.log("[SoalKu PWA] Aplikasi berhasil di-install!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        setShowIosGuide(true);
      }
      return;
    }

    // Show native browser install prompt
    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("[SoalKu PWA] User menyetujui instalasi aplikasi");
      setIsInstallable(false);
    } else {
      console.log("[SoalKu PWA] User menolak prompt instalasi");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Remember dismissal for 24 hours
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("soalku_pwa_dismissed_until", String(expiry));
    setIsDismissed(true);
  };

  // Don't show if already running in standalone PWA or dismissed
  if (isStandalone || isDismissed) return null;

  // Show if installable or if iOS user
  if (!isInstallable && !isIos) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white border border-[#B8CFB3] rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#84A282] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/icons/icon-192x192.png"
                  alt="SoalKu Icon"
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.svg";
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F6E2E9] text-[#60795e] border border-[#B8CFB3]">
                    Aplikasi PWA
                  </span>
                  <span className="text-[10px] text-[#84A282] font-semibold">
                    Siap Dipasang
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">Pasang Aplikasi SoalKu</h4>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-[#FEFAF3] transition"
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Install SoalKu di perangkat Anda untuk latihan CBT layar penuh, akses kilat dari beranda, dan pengalaman belajar tanpa membuka browser.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#FEFAF3] hover:bg-[#F6E2E9] text-slate-700 border border-[#B8CFB3] transition"
            >
              Nanti Saja
            </button>

            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIos ? "Cara Install di iOS" : "Install Sekarang"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Panduan Install di iOS Safari */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-[#B8CFB3]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] flex items-center justify-center border border-[#B8CFB3]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
                  <p className="text-xs text-slate-500">Petunjuk instalasi PWA di Safari iOS</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-[#FEFAF3] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-1">
                <span className="font-bold text-[#60795e] block">Langkah 1:</span>
                <p>
                  Ketuk tombol <b>Bagikan / Share</b> (<Share2 className="w-3.5 h-3.5 inline text-[#84A282]" />) pada bilah navigasi Safari bawah.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-1">
                <span className="font-bold text-[#60795e] block">Langkah 2:</span>
                <p>
                  Gulir ke bawah dan pilih menu <b>"Tambahkan ke Layar Utama"</b> (<i>Add to Home Screen</i>).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-1">
                <span className="font-bold text-[#60795e] block">Langkah 3:</span>
                <p>
                  Ketuk <b>"Tambah"</b> di pojok kanan atas. Ikon SoalKu akan muncul di layar utama gadget Anda!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs transition shadow-sm"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaInstallPrompt;
