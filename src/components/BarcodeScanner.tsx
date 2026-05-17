import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Package, Tag, Hash, AlertCircle, ScanLine, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BARCRAFT_PREFIX = "BC1:";

interface ScannedProduct {
  name: string;
  id: string;
  price: string;
  isExternal?: boolean;
}

export default function BarcodeScanner() {
  const [scannedResult, setScannedResult] = useState<ScannedProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (errorMessage) => {
        // We don't want to show errors for every failed frame scan
        // unless it's a critical hardware error
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner clear fail", err));
      }
    };
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    if (decodedText.startsWith(BARCRAFT_PREFIX)) {
      const data = decodedText.replace(BARCRAFT_PREFIX, "").split("|");
      if (data.length === 3) {
        setScannedResult({
          name: data[0],
          id: data[1],
          price: data[2],
          isExternal: false
        });
        setError(null);
      } else {
        setError("Invalid BarCraft format");
      }
    } else {
      // Standard barcode - just show the ID
      setScannedResult({
        name: "External Product",
        id: decodedText,
        price: "Unknown",
        isExternal: true
      });
      setError(null);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
      {/* Scanner Section */}
      <section className="md:col-span-6 border-r-2 border-brand-black p-6 sm:p-10 flex flex-col justify-between bg-brand-muted">
        <div>
          <div className="mb-8 sm:mb-12 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-2 opacity-40">Module 02</span>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight uppercase tracking-tight text-brand-black">Optical<br/>Recognition</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-brand-orange uppercase tracking-widest bg-white border border-brand-black px-3 py-1 mt-1">
              <ScanLine className="w-3 h-3 animate-pulse" />
              Live
            </div>
          </div>

          <div className="relative group">
            <div id="reader" className="w-full aspect-[4/3] bg-brand-black border-4 border-brand-black shadow-[12px_12px_0px_#121212] flex items-center justify-center overflow-hidden">
               <Camera className="w-12 h-12 text-white/10" />
            </div>
            <div className="absolute inset-0 pointer-events-none border-2 border-brand-orange/30 opacity-50"></div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white border-2 border-brand-black">
              <div className="w-8 h-8 rounded-full border border-brand-black flex items-center justify-center opacity-30 text-[10px] font-bold">i</div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Position barcode within the optical frame for instant processing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Result Section */}
      <section className="md:col-span-6 bg-white p-6 sm:p-16 flex flex-col relative overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-50 right-0 left-0 flex flex-col items-end opacity-[0.03] pointer-events-none select-none">
              <span className="text-[60px] sm:text-[60px] font-black leading-none">GenBarcode</span>
              <span className="text-[60px] sm:text-[60px] font-black leading-none">by (MK)</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-brand-orange text-white p-6 border-b-4 border-brand-black font-black uppercase tracking-widest text-xs flex items-center gap-4"
              >
                <AlertCircle className="w-6 h-6" />
                <span>{error}</span>
              </motion.div>
            )}

            {!scannedResult ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 border-4 border-dashed border-brand-black/10 flex items-center justify-center mx-auto mb-6">
                  <Scan className="w-10 h-10 opacity-10 animate-pulse" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Awaiting Signal...</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-brand-muted border-4 border-brand-black p-8 shadow-[16px_16px_0px_#FF4E00] flex flex-col gap-8"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Record</span>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Decoded Data</h3>
                  </div>
                  {scannedResult.isExternal && (
                    <span className="bg-brand-black text-white text-[8px] font-black px-2 py-1 uppercase tracking-tighter">Unregistered Format</span>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="border-b-2 border-brand-black pb-4">
                    <span className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] block mb-1">Entity Name</span>
                    <p className="text-xl font-bold tracking-tight uppercase leading-none">{scannedResult.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="border-b-2 border-brand-black pb-4">
                      <span className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] block mb-1">Object ID</span>
                      <p className="text-lg font-mono font-bold leading-none">{scannedResult.id}</p>
                    </div>
                    <div className="border-b-2 border-brand-black pb-4">
                      <span className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] block mb-1">Value (BDT)</span>
                      <p className="text-2xl font-black leading-none">
                        {scannedResult.price === "Unknown" ? "---" : `৳${scannedResult.price}`}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setScannedResult(null)}
                  className="w-full py-5 bg-brand-black text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-brand-orange transition-colors"
                >
                  Clear Sequence
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decoder Status */}
        <div className="mt-12 flex justify-between items-end shrink-0">
          <div className="flex gap-12">
            <div className="space-y-1">
              <span className="block text-[9px] font-black uppercase opacity-40">Protocol</span>
              <span className="block text-xs font-bold uppercase">Multi-Pass</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] font-black uppercase opacity-40">Buffer</span>
              <span className="block text-xs font-bold uppercase">Secure</span>
            </div>
          </div>
          <div className="text-right">
             <div className="w-32 h-2 bg-brand-muted border border-brand-black relative overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-brand-orange"
                  animate={{ left: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{ width: "20%" }}
                />
             </div>
             <span className="block text-[9px] font-black uppercase opacity-40 mt-2 tracking-widest">Decoding Engine Active</span>
          </div>
        </div>
      </section>
    </div>
  );
}
