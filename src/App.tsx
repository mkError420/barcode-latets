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
    <div className="min-h-screen bg-brand-black p-0 sm:p-3 lg:p-4">
      <div className="min-h-screen sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2rem)] bg-brand-beige border-[8px] sm:border-[12px] border-brand-black flex flex-col overflow-hidden relative selection:bg-brand-orange selection:text-white">
        
        {/* Header */}
        <header className="h-24 border-b-2 border-brand-black flex items-center px-6 sm:px-10 justify-between bg-white shrink-0">
          <div className="flex items-baseline gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-5xl font-black tracking-tighter uppercase italic leading-none">GenBarcode</h1>
              <span className="text-[09px] font-mono opacity-50 uppercase tracking-[0.3em] mt-1 shrink-0">v.2.01 / BD Encoder</span>
            </div>
          </div>

          <nav className="flex gap-4 sm:gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <button
              onClick={() => setActiveTab('generate')}
              className={`transition-all ${
                activeTab === 'generate'
                  ? 'underline decoration-2 underline-offset-4 text-brand-black'
                  : 'opacity-30 hover:opacity-100'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`transition-all ${
                activeTab === 'scan'
                  ? 'underline decoration-2 underline-offset-4 text-brand-black'
                  : 'opacity-30 hover:opacity-100'
              }`}
            >
              Scan Mode
            </button>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'generate' ? <BarcodeGenerator /> : <BarcodeScanner />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="h-12 border-t-2 border-brand-black flex items-center px-6 sm:px-10 justify-between bg-brand-black text-white text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] shrink-0">
          <div className="flex gap-4 sm:gap-8 overflow-hidden">
            <span className="hidden sm:inline">Object-ID: BC-2024-X</span>
            <span>Local Engine: Core-01</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Design & Developed by MK. Rabbani</span>
        </footer>
      </div>
    </div>
  );
}

