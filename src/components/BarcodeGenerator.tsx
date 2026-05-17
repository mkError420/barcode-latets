import React, { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Printer, RefreshCw, Package, Tag, Hash, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BARCRAFT_PREFIX = "BC1:";

interface BarcodeDisplayProps {
  value: string;
  name: string;
  id: string;
  onRef: (ref: SVGSVGElement | null) => void;
}

function BarcodeDisplay({ value, name, id, onRef }: BarcodeDisplayProps) {
  const localRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (localRef.current) {
      try {
        JsBarcode(localRef.current, value, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.5,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
        onRef(localRef.current);
      } catch (err) {
        console.error("Barcode generation failed:", err);
      }
    }
  }, [value]);

  return (
    <motion.div
      key="barcode-result"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="bg-white p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-100 rounded-2xl flex flex-col items-center gap-6 max-w-full"
    >
      <div className="bg-white p-4 flex items-center justify-center min-h-[140px] w-full overflow-x-auto border border-slate-50 rounded-xl">
        <svg ref={localRef} className="max-w-full h-auto"></svg>
      </div>
      
      <div className="text-center space-y-1">
        <div className="text-[10px] font-mono tracking-[0.3em] font-bold uppercase text-slate-400">SERIAL ID: {id}</div>
        <div className="text-base font-bold text-slate-900 uppercase tracking-tight leading-tight">{name}</div>
      </div>
    </motion.div>
  );
}

export default function BarcodeGenerator() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [price, setPrice] = useState('');
  const [generated, setGenerated] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  const generateBarcodeValue = () => {
    if (!name || !id || !price) return id;
    return `${BARCRAFT_PREFIX}${name}|${id}|${price}`;
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      setGenerated(false);
      // Short delay to trigger re-animation and clean mount
      setTimeout(() => {
        setCurrentValue(generateBarcodeValue());
        setGenerated(true);
      }, 50);
    }
  };

  const downloadBarcode = () => {
    if (!barcodeRef.current) return;
    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const canvas = document.createElement("canvas");
    const svgSize = barcodeRef.current.getBBox();
    const margin = 20;
    canvas.width = svgSize.width + margin * 2;
    canvas.height = svgSize.height + margin * 2;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, margin, margin);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `barcode-${id || 'product'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printBarcode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !barcodeRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            .info { margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          ${svgData}
          <div class="info">
            <h2>${name}</h2>
            <p>ID: ${id} | Price: ৳${price}</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Input Section */}
      <section className="md:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Registration
          </h2>
          <p className="text-xs text-slate-500 mt-1">Populate the fields below to generate a serialized barcode.</p>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Catalog Name</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Industrial Glass Tube"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Object Serial / SKU</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="SKU-892"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Valuation (BDT)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Generate System Label
          </button>
        </form>
      </section>

      {/* Preview Section */}
      <section className="md:col-span-7 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {!generated ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Box className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">System Standby</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-8 w-full">
                <BarcodeDisplay 
                  value={currentValue} 
                  name={name} 
                  id={id} 
                  onRef={(r) => { barcodeRef.current = r; }} 
                />

                <div className="flex gap-3 w-full max-w-sm">
                  <button
                    onClick={downloadBarcode}
                    className="flex-1 h-12 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={printBarcode}
                    className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Data Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Encoding</span>
            <span className="block text-xs font-bold text-slate-700">CODE-128</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Complexity</span>
            <span className="block text-xs font-bold text-slate-700">Standard</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Checksum</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="block text-xs font-bold text-green-600">Active</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
