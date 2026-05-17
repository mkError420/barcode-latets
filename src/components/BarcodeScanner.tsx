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
    <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Scanner Section */}
      <section className="md:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Optical Engine
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <ScanLine className="w-3 h-3 animate-pulse" />
              Live
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Industrial-grade barcode recognition active.</p>
        </div>

        <div className="p-6 relative group">
          <div id="reader" className="w-full aspect-[4/3] bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
             <Camera className="w-12 h-12 text-slate-300" />
          </div>
          <div className="mt-6 flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs font-medium text-slate-600">Ensure optimal lighting and maintain vertical alignment of the barcode within the digital frame.</p>
          </div>
        </div>
      </section>

      {/* Result Section */}
      <section className="md:col-span-7 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-600 text-white p-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-lg shadow-red-100 mb-6"
              >
                <AlertCircle className="w-5 h-5" />
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
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scan className="w-10 h-10 text-slate-200 animate-pulse" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300">Awaiting Signal...</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-100 flex flex-col gap-10"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Log Record</span>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Label Data Decoded</h3>
                  </div>
                  {scannedResult.isExternal && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">EXT-SRC</span>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Entity Name</span>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight uppercase leading-none">{scannedResult.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Catalog ID</span>
                      <p className="text-lg font-mono font-bold text-slate-800 leading-none">{scannedResult.id}</p>
                    </div>
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">System Value</span>
                      <p className="text-3xl font-bold text-slate-900 leading-none">
                        {scannedResult.price === "Unknown" ? "---" : `৳${scannedResult.price}`}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setScannedResult(null)}
                  className="w-full py-4 bg-slate-900 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Reset Scanner
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decoder Status */}
        <div className="flex justify-between items-center py-4 px-6 bg-white rounded-xl border border-slate-100">
          <div className="flex gap-8">
            <div className="space-y-0.5">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Protocol</span>
              <span className="block text-xs font-bold text-slate-700">AES-LABEL</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Buffer</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="block text-xs font-bold text-green-600 uppercase">Synchronized</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="w-24 h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                  animate={{ left: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  style={{ width: "30%" }}
                />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
