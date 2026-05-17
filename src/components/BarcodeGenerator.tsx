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
      className="bg-white p-6 sm:p-12 border-4 border-brand-black shadow-[12px_12px_0px_#121212] flex flex-col items-center gap-6 sm:gap-8 max-w-full"
    >
      <div className="bg-white p-2 flex items-center justify-center min-h-[140px] w-full overflow-x-auto">
        <svg ref={localRef} className="max-w-full h-auto"></svg>
      </div>
      
      <div className="text-center space-y-1">
        <div className="text-[10px] sm:text-xs font-mono tracking-[0.5em] font-bold uppercase opacity-60">ID: {id}</div>
        <div className="text-sm sm:text-base font-black uppercase tracking-widest leading-tight">{name}</div>
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
    <div className="h-full grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
      {/* Input Section */}
      <section className="md:col-span-4 border-r-2 border-brand-black p-6 sm:p-10 flex flex-col justify-between bg-brand-muted">
        <div>
          <div className="mb-8 sm:mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-2 opacity-40">Step 01</span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight uppercase tracking-tight">Product<br/>Specification</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8 sm:space-y-12">
            <div className="group">
              <label className="text-[10px] sm:text-[11px] font-black uppercase mb-2 block tracking-[0.15em]">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Initialize Name..."
                className="w-full bg-transparent border-b-2 border-brand-black py-2 text-lg sm:text-xl font-medium focus:outline-none focus:border-brand-orange transition-colors placeholder:opacity-20"
                required
              />
            </div>

            <div className="group">
              <label className="text-[10px] sm:text-[11px] font-black uppercase mb-2 block tracking-[0.15em]">Product ID / SKU</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="SKU-XXXXX"
                className="w-full bg-transparent border-b-2 border-brand-black py-2 text-lg sm:text-xl font-mono focus:outline-none focus:border-brand-orange transition-colors placeholder:opacity-20"
                required
              />
            </div>

            <div className="group">
              <label className="text-[10px] sm:text-[11px] font-black uppercase mb-2 block tracking-[0.15em]">Retail Price (BDT)</label>
              <div className="relative">
                <span className="absolute left-0 top-2 text-xl sm:text-3xl font-bold opacity-30">৳</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent border-b-2 border-brand-black py-2 pl-6 sm:pl-8 text-2xl sm:text-3xl font-bold focus:outline-none focus:border-brand-orange transition-colors placeholder:opacity-20"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 mt-4 bg-brand-black text-white font-black uppercase tracking-[0.2em] hover:bg-brand-orange transition-colors flex justify-between px-6 items-center group cursor-pointer"
            >
              <span className="text-xs sm:text-sm">Initialize Sequence</span>
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </form>
        </div>
      </section>

      {/* Preview Section */}
      <section className="md:col-span-8 bg-white p-6 sm:p-16 flex flex-col relative overflow-hidden">
        {/* Background Decorative Text */}
<div className="absolute top-50 left-0 right-0 flex flex-col items-center justify-center opacity-[0.05] pointer-events-none select-none">
  <span className="text-[60px] sm:text-[60px] font-black leading-none">GenBarcode</span>
  <span className="text-[60px] sm:text-[60px] font-black leading-none">by (MK)</span>
</div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!generated ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 border-2 border-brand-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Box className="w-8 h-8 opacity-10" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Awaiting Sequence...</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <BarcodeDisplay 
                  value={currentValue} 
                  name={name} 
                  id={id} 
                  onRef={(r) => { barcodeRef.current = r; }} 
                />

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 w-full px-2"
                >
                  <button
                    onClick={downloadBarcode}
                    className="flex-1 h-14 bg-brand-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange transition-colors flex items-center justify-center gap-3 px-4"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download SVG</span>
                  </button>
                  <button
                    onClick={printBarcode}
                    className="w-14 h-14 border-2 border-brand-black flex items-center justify-center hover:bg-brand-black hover:text-white transition-all text-brand-black shrink-0"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Area */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 shrink-0">
          <div className="flex gap-8 sm:gap-12">
            <div className="space-y-1 text-left">
              <span className="block text-[9px] font-black uppercase opacity-40 tracking-tighter">Format</span>
              <span className="block text-xs sm:text-sm font-bold uppercase tracking-wide">Code 128-B</span>
            </div>
            <div className="space-y-1 text-left">
              <span className="block text-[9px] font-black uppercase opacity-40 tracking-tighter">Resolution</span>
              <span className="block text-xs sm:text-sm font-bold uppercase tracking-wide">High / 600DPI</span>
            </div>
            <div className="space-y-1 text-left">
              <span className="block text-[9px] font-black uppercase opacity-40 tracking-tighter">Checksum</span>
              <span className="block text-xs sm:text-sm font-bold uppercase tracking-wide">Active</span>
            </div>
          </div>

          <div className="text-right flex items-center sm:block gap-4">
            <span className="block text-[9px] font-black uppercase opacity-40 mb-1 tracking-tighter">Status</span>
            <div className={`flex items-center gap-2 ${generated ? 'text-green-600' : 'text-orange-400 animate-pulse'}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">{generated ? 'Ready for Print' : 'Awaiting Input'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
