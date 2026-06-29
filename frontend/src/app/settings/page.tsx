"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Settings, Save, Server, Shield, Sliders } from "lucide-react";

export default function SettingsPage() {
  const [expWeight, setExpWeight] = useState(30);
  const [techWeight, setTechWeight] = useState(40);
  const [cultureWeight, setCultureWeight] = useState(30);
  const [strictHoneypot, setStrictHoneypot] = useState(true);
  const [keywordPenalty, setKeywordPenalty] = useState(true);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Settings size={24} />
                  Algorithm Configurations
                </h1>
                <p className="text-muted text-sm mt-1">Fine-tune the ranking engine weights and security parameters.</p>
              </div>
              <button className="px-4 py-2 bg-emerald-glow hover:bg-emerald-bright text-[#0d0d11] rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </button>
            </div>

            {/* Config Sections */}
            <div className="space-y-6">
              
              {/* Scoring Weights */}
              <section className="p-6 bg-surface/30 border border-border-subtle rounded-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4">
                  <Sliders size={18} className="text-emerald-glow" />
                  <h2 className="font-semibold">Scoring Weights Matrix</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Slider 1 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Experience Alignment Multiplier</label>
                      <span className="text-sm text-emerald-glow font-mono">{expWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={expWeight} 
                      onChange={(e) => setExpWeight(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-emerald-glow"
                    />
                    <p className="text-[11px] text-muted mt-2">Rewards candidates hitting the 5-9 YOE sweet spot.</p>
                  </div>

                  {/* Slider 2 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Technical Depth Multiplier</label>
                      <span className="text-sm text-emerald-glow font-mono">{techWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={techWeight} 
                      onChange={(e) => setTechWeight(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-emerald-glow"
                    />
                    <p className="text-[11px] text-muted mt-2">Analyzes target vector AI skills (FAISS, Embeddings, RAG).</p>
                  </div>

                  {/* Slider 3 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Cultural & Domain Fit</label>
                      <span className="text-sm text-emerald-glow font-mono">{cultureWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={cultureWeight} 
                      onChange={(e) => setCultureWeight(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-emerald-glow"
                    />
                  </div>
                </div>
              </section>

              {/* Security Engine */}
              <section className="p-6 bg-surface/30 border border-border-subtle rounded-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4">
                  <Shield size={18} className="text-red-400" />
                  <h2 className="font-semibold">Integrity Filters</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Toggle 1 */}
                  <label className="flex items-center justify-between p-4 border border-border-subtle rounded-lg bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
                    <div>
                      <div className="font-medium text-sm text-foreground">Strict Honeypot Purge</div>
                      <div className="text-[11px] text-muted mt-1">Automatically drop candidates with mathematically impossible timelines.</div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={strictHoneypot} onChange={() => setStrictHoneypot(!strictHoneypot)} />
                      <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-glow"></div>
                    </div>
                  </label>

                  {/* Toggle 2 */}
                  <label className="flex items-center justify-between p-4 border border-border-subtle rounded-lg bg-surface/50 cursor-pointer hover:bg-surface transition-colors">
                    <div>
                      <div className="font-medium text-sm text-foreground">Keyword Stuffer Zero-Scoring</div>
                      <div className="text-[11px] text-muted mt-1">Assign 0.0 score to non-technical titles (Marketing/Sales) injecting AI tags.</div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={keywordPenalty} onChange={() => setKeywordPenalty(!keywordPenalty)} />
                      <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-glow"></div>
                    </div>
                  </label>
                </div>
              </section>

              {/* API Integration */}
              <section className="p-6 bg-surface/30 border border-border-subtle rounded-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4">
                  <Server size={18} className="text-blue-400" />
                  <h2 className="font-semibold">Backend Connection</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted block mb-1.5">FastAPI Endpoint URL</label>
                    <input 
                      type="text" 
                      defaultValue="http://localhost:8000"
                      className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-glow/50"
                    />
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
