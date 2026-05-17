/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Scan, Box, Github } from 'lucide-react';
import BarcodeGenerator from './components/BarcodeGenerator';
import BarcodeScanner from './components/BarcodeScanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');

  return (
    <div className="min-h-screen bg-brand-beige selection:bg-brand-orange selection:text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="h-20 border-b border-slate-200 flex items-center px-6 sm:px-10 justify-between bg-white shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">GenBarcode</h1>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Industrial Barcode Utility</span>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'generate'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'scan'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Scanner
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'generate' ? <BarcodeGenerator /> : <BarcodeScanner />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-6 text-[11px] font-medium text-slate-400 uppercase tracking-widest text-center sm:text-left">
          <span>System V2.0.1</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="hidden sm:inline">Engine: Pro-Standard</span>
        </div>
                <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider text-center sm:text-right">
                  &copy; {new Date().getFullYear()} Developed by{" "}
                 <a 
                  href="https://itsmk.netlify.app/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="hover:text-slate-600 transition-colors duration-200 ease-in-out"
                  >
                   MK. Rabbani
                 </a>
                </div>
      </footer>
    </div>
  );
}

