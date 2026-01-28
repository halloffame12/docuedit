
import React, { useState, useMemo, useEffect } from 'react';
import { analyzeDocument, applyInpainting } from './services/geminiService';
import { DocumentState, TextRegion } from './types';
import { ImageCanvas } from './components/ImageCanvas';
import { Loader } from './components/ui/Loader';
import { 
  Upload, 
  Trash2, 
  RotateCcw, 
  Download, 
  AlertCircle,
  MousePointer2,
  Type as TypeIcon,
  Search,
  Zap,
  Droplets,
  ChevronLeft,
  ShieldCheck,
  Cpu,
  Fingerprint,
  Layers,
  Sparkles,
  Terminal as TerminalIcon,
  Activity,
  Maximize2
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<DocumentState>({
    originalImage: null,
    editedImage: null,
    isAnalyzing: false,
    isProcessing: false,
    regions: [],
    selectedRegionId: null,
    history: [],
  });

  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate forensic logs for landing page aesthetic
  useEffect(() => {
    if (!state.originalImage) {
      const messages = [
        "Core protocol initialized...",
        "Awaiting document ingestion...",
        "Neural sync: READY",
        "Security layer: ENCRYPTED",
        "Analysis engine: STANDBY",
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLogs(prev => [...prev.slice(-3), messages[i % messages.length]]);
        i++;
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [state.originalImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setState(prev => ({ 
        ...prev, 
        originalImage: base64, 
        editedImage: null, 
        isAnalyzing: true,
        regions: [],
        history: []
      }));
      setError(null);

      try {
        const detectedRegions = await analyzeDocument(base64);
        setState(prev => ({ 
          ...prev, 
          regions: detectedRegions, 
          isAnalyzing: false 
        }));
      } catch (err) {
        setError("Analysis interrupted. Low resolution or integrity issues detected.");
        setState(prev => ({ ...prev, isAnalyzing: false }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectRegion = (region: TextRegion) => {
    setState(prev => ({ ...prev, selectedRegionId: region.id }));
    setEditText(region.text);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('editor-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleApplyEdit = async () => {
    const selectedRegion = state.regions.find(r => r.id === state.selectedRegionId);
    if (!selectedRegion || !state.originalImage) return;

    setState(prev => ({ ...prev, isProcessing: true }));
    setError(null);

    try {
      const currentImg = state.editedImage || state.originalImage;
      const result = await applyInpainting(currentImg, selectedRegion, editText);
      
      if (result) {
        setState(prev => ({
          ...prev,
          editedImage: result,
          history: [...prev.history, prev.editedImage || prev.originalImage!],
          isProcessing: false,
          selectedRegionId: null,
          regions: prev.regions.map(r => r.id === selectedRegion.id ? { ...r, text: editText } : r)
        }));
      } else {
        throw new Error("Reconstruction failure");
      }
    } catch (err) {
      setError("Forensic reconstruction failed. Retrying neural link...");
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const selectedRegion = useMemo(() => 
    state.regions.find(r => r.id === state.selectedRegionId), 
    [state.regions, state.selectedRegionId]
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-100 overflow-x-hidden">
      {/* Sophisticated Responsive Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/60 h-16 md:h-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 md:w-14 md:h-14 bg-teal-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(20,184,166,0.2)] group-hover:scale-110 transition-all duration-700 relative shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Fingerprint className="text-white w-5 h-5 md:w-8 md:h-8" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-2xl font-black classic-heading uppercase italic tracking-tighter leading-none flex items-center group-hover:text-teal-400 transition-colors whitespace-nowrap">
                DocuEdit <span className="text-slate-400 ml-1.5 md:ml-2 font-sans not-italic font-light opacity-60">Ultra</span>
              </h1>
              <div className="hidden xs:flex items-center space-x-2 mt-1 md:mt-1.5">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <p className="text-[7px] md:text-[9px] text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] font-black truncate">Secure Link Established</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {state.originalImage && (
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl p-0.5 md:p-1">
                <HeaderBtn onClick={() => setState(p => ({ ...p, history: p.history.slice(0, -1), editedImage: p.history[p.history.length-1] || null }))} disabled={state.history.length === 0} icon={<RotateCcw className="w-4 h-4 md:w-5 md:h-5"/>} />
                <div className="w-px h-4 md:h-6 bg-slate-800 mx-0.5 md:mx-1"></div>
                <HeaderBtn onClick={() => window.location.reload()} icon={<Trash2 className="w-4 h-4 md:w-5 md:h-5"/>} color="hover:text-red-400" />
              </div>
            )}
            {state.originalImage && (
              <button 
                onClick={() => {
                  const l = document.createElement('a');
                  l.href = state.editedImage || state.originalImage!;
                  l.download = 'DocuEdit_Export.png';
                  l.click();
                }}
                className="bg-teal-500 text-slate-950 px-3 md:px-10 py-2 md:py-4 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs hover:bg-teal-400 transition-all shadow-xl uppercase tracking-widest flex items-center space-x-2 active:scale-95 shrink-0"
              >
                <Download className="w-3 h-3 md:w-4 h-4" />
                <span className="hidden sm:inline">Commit Changes</span>
                <span className="sm:hidden">Commit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pt-16 md:pt-24">
        {!state.originalImage ? (
          /* --- ADVANCED RESPONSIVE LANDING --- */
          <div className="relative min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-96px)] overflow-hidden flex flex-col">
            
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 neural-mesh opacity-10 md:opacity-20" />
              <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-900/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse" />
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#0f172a_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 sm:px-12 md:px-16 py-12 md:py-24 lg:py-36 flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* Text Side */}
              <div className="space-y-8 md:space-y-12 text-center lg:text-left animate-in slide-in-from-left-10 duration-1000">
                <div className="inline-flex items-center space-x-2 md:space-x-3 bg-teal-500/5 border border-teal-500/20 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-teal-400 text-[8px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] backdrop-blur-xl mx-auto lg:mx-0">
                   <Activity className="w-3 h-3 md:w-4 h-4 animate-pulse" />
                   <span>Forensic Engine v4.0</span>
                </div>
                
                <h2 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl classic-heading tracking-tighter leading-[0.9] sm:leading-[0.8] uppercase italic text-glow">
                  Silent <br className="hidden sm:block" /> <span className="text-teal-500 opacity-90">Forensic</span> <br className="hidden sm:block" /> Edits
                </h2>
                
                <p className="text-slate-400 text-sm sm:text-lg md:text-2xl max-w-lg md:max-w-xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide italic">
                  Advanced document reconstruction. Maps ink viscosity and surface geometry to enable indistinguishable text manipulation.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 pt-4 sm:pt-6">
                  <div className="relative group w-full sm:w-auto rounded-xl md:rounded-2xl p-0.5 bg-slate-800 transition-all hover:bg-teal-500/30">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <button className="w-full sm:w-auto bg-slate-950 text-white px-8 sm:px-14 py-4 sm:py-7 rounded-xl font-black uppercase tracking-[0.3em] text-xs sm:text-sm flex items-center justify-center space-x-3 sm:space-x-4 transition-all group-hover:bg-slate-900">
                      <Search className="w-4 h-4 sm:w-6 h-6 text-teal-500" />
                      <span>Scan Archive</span>
                    </button>
                  </div>
                  
                  {/* Console Preview on Desktop/Large Tablet */}
                  <div className="hidden md:flex flex-col bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 w-72 backdrop-blur-xl shadow-2xl h-28 sm:h-36 shrink-0">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 border-b border-slate-800 pb-2">
                       <div className="flex items-center space-x-2">
                          <TerminalIcon className="w-3 h-3 sm:w-4 h-4 text-slate-600" />
                          <span className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol.log</span>
                       </div>
                       <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-500 animate-ping"></div>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5 overflow-hidden">
                      {logs.map((log, i) => (
                        <div key={i} className="text-[7px] sm:text-[10px] mono text-teal-400/60 leading-none flex items-center space-x-2 sm:space-x-3">
                           <span className="text-slate-700 opacity-50 shrink-0">{new Date().toLocaleTimeString([], {hour12: false, minute: '2-digit', second: '2-digit'})}</span>
                           <span className="truncate">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 sm:pt-12 flex items-center justify-center lg:justify-start space-x-8 sm:space-x-12 md:space-x-20 border-t border-slate-800/50">
                   <StatItem val="100%" label="Integrity" />
                   <StatItem val="1.2k" label="Density" />
                   <StatItem val="Zero" label="Trace" />
                </div>
              </div>

              {/* Graphic Side */}
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-[600px] mx-auto animate-in slide-in-from-bottom-10 lg:slide-in-from-right-10 duration-1000">
                <div className="relative aspect-[3/4] sm:aspect-square glass-panel rounded-[3rem] sm:rounded-[5rem] p-8 sm:p-16 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden group">
                   <div className="scan-line z-20" />
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#14b8a610_0%,transparent_50%)]" />
                   
                   <div className="relative h-full flex flex-col justify-between z-10">
                     <div className="flex items-center justify-between opacity-30 sm:opacity-40">
                        <Activity className="w-4 h-4 sm:w-6 h-6 text-teal-500" />
                        <Maximize2 className="w-4 h-4 sm:w-6 h-6 text-slate-500" />
                     </div>
                     
                     <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-40 xs:w-48 sm:w-72 h-56 xs:h-64 sm:h-96 bg-slate-900 border border-slate-800 p-5 xs:p-6 sm:p-8 flex flex-col justify-between transform -rotate-1 sm:-rotate-2 group-hover:rotate-0 transition-transform duration-1000 shadow-2xl group-hover:border-teal-500/40">
                           <div className="space-y-2 sm:space-y-3">
                              <div className="h-1 sm:h-1.5 bg-slate-800 rounded-full w-full" />
                              <div className="h-1 sm:h-1.5 bg-slate-800 rounded-full w-5/6" />
                              <div className="h-1 sm:h-1.5 bg-slate-800 rounded-full w-3/4" />
                           </div>
                           <div className="p-3 sm:p-5 border border-teal-500/20 bg-teal-500/5 rounded-lg sm:rounded-xl">
                              <div className="h-1 bg-teal-500/30 w-8 sm:w-12 mb-1.5 sm:mb-2" />
                              <div className="h-1 bg-teal-500/30 w-16 sm:w-24" />
                           </div>
                           <div className="flex justify-between items-end opacity-20">
                              <div className="w-6 h-6 sm:w-8 h-8 rounded-full border border-slate-700" />
                              <div className="w-8 h-1 sm:w-12 h-1 bg-slate-700" />
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 flex items-center space-x-4 sm:space-x-6">
                        <div className="w-10 h-10 sm:w-14 h-14 bg-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 shrink-0">
                           <Zap className="w-5 h-5 sm:w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 space-y-1.5 sm:space-y-2 overflow-hidden">
                           <div className="h-1.5 sm:h-2 bg-slate-800 rounded-full w-24 sm:w-32" />
                           <div className="h-1.5 sm:h-2 bg-slate-800 rounded-full w-full opacity-30" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Feature Grid */}
            <div className="mt-auto border-t border-slate-800/40 py-12 md:py-24 bg-slate-950/50 backdrop-blur-3xl">
              <div className="max-w-[1600px] mx-auto px-6 sm:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                 <TechCard icon={<Droplets className="w-6 h-6 md:w-8 h-8"/>} title="Chromatography" desc="Chemical ink signature matching" />
                 <TechCard icon={<Cpu className="w-6 h-6 md:w-8 h-8"/>} title="Inpainting" desc="Neural pixel synthesis engine" />
                 <TechCard icon={<Layers className="w-6 h-6 md:w-8 h-8"/>} title="Topology" desc="Paper grain surface reproduction" />
                 <TechCard icon={<ShieldCheck className="w-6 h-6 md:w-8 h-8"/>} title="Security" desc="Air-gapped processing simulation" />
              </div>
            </div>
          </div>
        ) : (
          /* --- EDITOR INTERFACE (RESPONSIVE) --- */
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-16 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
              
              {/* Interaction Canvas Column */}
              <div className="w-full lg:flex-1 space-y-6 sm:space-y-10">
                {state.isAnalyzing ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-[3rem] py-32 sm:py-48 md:py-60 flex items-center justify-center shadow-2xl">
                    <Loader message="Synchronizing Forensic Mapping..." />
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-10">
                    <ImageCanvas 
                      imageUrl={state.editedImage || state.originalImage!} 
                      regions={state.regions} 
                      onSelectRegion={handleSelectRegion}
                      selectedRegionId={state.selectedRegionId}
                    />
                    
                    <div className="bg-teal-600 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-teal-950/40 text-slate-950 overflow-hidden relative">
                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] translate-x-[-100%] animate-[shimmer_5s_infinite]"></div>
                       <div className="flex items-center space-x-4 sm:space-x-8 relative z-10">
                         <div className="p-4 sm:p-6 bg-slate-950 text-teal-400 rounded-xl sm:rounded-2xl shrink-0">
                           <Zap className="w-6 h-6 sm:w-10 h-10 fill-current" />
                         </div>
                         <div>
                            <h4 className="font-black classic-heading text-xl sm:text-3xl uppercase tracking-tighter italic">Mapping Complete</h4>
                            <p className="text-[8px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-1 sm:mt-1.5 opacity-80">Indistinguishable Synthesis Engine Enabled</p>
                         </div>
                       </div>
                       <div className="hidden lg:flex flex-col items-end relative z-10 text-[10px] font-black uppercase tracking-[0.4em]">
                          <span className="opacity-60 mb-1">Latency Profile</span>
                          <span className="text-sm tracking-tighter italic">0.02ms-FORENSIC</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar/Editor Controls Column */}
              <div id="editor-panel" className="w-full lg:w-[400px] xl:w-[440px] space-y-8 sm:space-y-12 shrink-0 lg:sticky lg:top-36 pb-20 sm:pb-32">
                
                <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="px-6 sm:px-10 py-6 sm:py-10 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <TerminalIcon className="w-4 h-4 sm:w-5 h-5 text-teal-500" />
                      <h3 className="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] italic text-slate-500">Forensic Workspace</h3>
                    </div>
                    {selectedRegion && (
                      <span className="px-3 sm:px-5 py-1 sm:py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-[8px] sm:text-[10px] font-black border border-teal-500/30 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                        LINK: {(selectedRegion.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  
                  <div className="p-6 sm:p-10">
                    {selectedRegion ? (
                      <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-6 duration-500">
                        
                        <div className="grid grid-cols-2 gap-4 sm:gap-8">
                           <ConsoleMeta label="Ink Sig" val={selectedRegion.detectedColor} icon={<div className="w-4 h-4 sm:w-5 h-5 rounded-full border border-slate-600" style={{backgroundColor: selectedRegion.detectedColor}} />} />
                           <ConsoleMeta label="Medium" val={selectedRegion.inkType} icon={<Droplets className="w-4 h-4 sm:w-5 h-5 text-teal-500" />} />
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                           <label className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] sm:tracking-[0.4em] ml-2">Modified Data</label>
                           <textarea
                            rows={3}
                            className="w-full p-4 sm:p-8 bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl focus:border-teal-500/50 outline-none transition-all font-mono text-sm sm:text-base text-slate-200 placeholder-slate-700 shadow-inner resize-none"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Type payload..."
                           />
                        </div>

                        <div className="space-y-4 sm:space-y-5 pt-2 sm:pt-4">
                           <button
                            onClick={handleApplyEdit}
                            disabled={state.isProcessing}
                            className="w-full py-5 sm:py-7 bg-teal-500 text-slate-950 rounded-xl sm:rounded-[2rem] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[10px] sm:text-xs hover:bg-teal-400 disabled:opacity-50 transition-all shadow-2xl shadow-teal-900/10 flex items-center justify-center space-x-3 sm:space-x-4 active:scale-95 group"
                           >
                            {state.isProcessing ? (
                              <div className="w-5 h-5 sm:w-6 h-6 border-[2px] sm:border-[3px] border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 sm:w-5 h-5 group-hover:scale-125 transition-transform" />
                                <span>Commit Synthesis</span>
                              </>
                            )}
                           </button>
                           <button
                            onClick={() => setState(s => ({ ...s, selectedRegionId: null }))}
                            className="w-full py-3 sm:py-5 text-slate-600 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] hover:text-teal-400 transition-colors flex items-center justify-center space-x-2 sm:space-x-3"
                           >
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 h-4" />
                            <span>Return to Scan</span>
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 sm:py-32 group">
                        <div className="w-20 h-20 sm:w-28 h-28 bg-slate-950 rounded-2xl sm:rounded-[3rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 border border-slate-800 group-hover:border-teal-500/30 transition-all duration-1000">
                          <MousePointer2 className="w-8 h-8 sm:w-10 h-10 text-slate-700 group-hover:text-teal-500" />
                        </div>
                        <h4 className="font-black text-xs sm:text-sm uppercase italic tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-4 text-slate-500">Scan Required</h4>
                        <p className="text-slate-600 text-[8px] sm:text-[10px] font-bold px-6 sm:px-12 leading-relaxed uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                          Select a mapping block to begin microscopic reconstruction.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-3xl rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-6 sm:space-y-10">
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center">
                        <span className="w-1.5 h-1.5 sm:w-2 h-2 rounded-full bg-teal-500 mr-2 sm:mr-4 animate-pulse"></span>
                        Neural Metrics
                     </h4>
                     <span className="text-[7px] sm:text-[9px] font-black text-teal-600 border border-teal-500/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-[0.1em] sm:tracking-[0.2em]">Verified</span>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                     <StatusRow label="Grain Profile" val="GEOMETRY_LOCKED" />
                     <StatusRow label="Chroma Sync" val="INK_MATCH_4.0" />
                     <StatusRow label="Resolution" val="1200_DPI_NATIVE" />
                     <StatusRow label="Traceability" val="ZERO_DETECT" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-center space-x-4 text-red-500 animate-in slide-in-from-top-4 shadow-2xl">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] leading-relaxed italic">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-10 sm:py-16 px-6 sm:px-12 text-center z-[60]">
        <p className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] sm:tracking-[0.6em] opacity-40 italic">
          DocuEdit Pro • Neural Forensic Suite • Zero Trace Manipulation
        </p>
      </footer>
    </div>
  );
};

/* --- ENHANCED UI HELPERS --- */

const HeaderBtn = ({ onClick, disabled, icon, color = "hover:text-teal-400" }: any) => (
  <button onClick={onClick} disabled={disabled} className={`p-2.5 sm:p-4 text-slate-600 ${color} transition-all disabled:opacity-10 active:scale-75 hover:scale-110`}>
    {icon}
  </button>
);

const ConsoleMeta = ({ label, val, icon }: { label: string, val: string, icon: React.ReactNode }) => (
  <div className="p-4 sm:p-6 bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl flex flex-col hover:border-teal-500/20 transition-colors">
    <label className="text-[8px] sm:text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-1.5 sm:mb-3">{label}</label>
    <div className="flex items-center space-x-3 sm:space-x-4 overflow-hidden">
       <div className="shrink-0">{icon}</div>
       <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-tighter truncate italic">{val}</span>
    </div>
  </div>
);

const StatusRow = ({ label, val }: { label: string, val: string }) => (
  <div className="flex items-center justify-between border-b border-slate-900 pb-3 sm:pb-4 group">
    <span className="text-[8px] sm:text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] sm:tracking-[0.4em] group-hover:text-teal-600 transition-colors whitespace-nowrap">{label}</span>
    <span className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-tighter italic group-hover:text-white transition-colors truncate ml-2">{val}</span>
  </div>
);

const TechCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-slate-900/40 p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] border border-slate-800 shadow-2xl group hover:bg-slate-900 transition-all hover:-translate-y-2 lg:hover:-translate-y-4 duration-700 relative overflow-hidden">
     <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-teal-500/5 rounded-bl-[4rem] sm:rounded-bl-[5rem]" />
     <div className="text-teal-500 mb-6 sm:mb-8 group-hover:scale-125 transition-transform duration-700 shrink-0">{icon}</div>
     <h5 className="text-base sm:text-lg font-black classic-heading uppercase tracking-tighter italic mb-2 sm:mb-3 text-white">{title}</h5>
     <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] leading-relaxed sm:leading-loose opacity-70">{desc}</p>
  </div>
);

const StatItem = ({ val, label }: { val: string, label: string }) => (
  <div className="flex flex-col items-center lg:items-start group">
    <span className="text-2xl sm:text-4xl md:text-6xl font-black classic-heading italic tracking-tighter text-teal-500 group-hover:text-white transition-colors duration-700 whitespace-nowrap">{val}</span>
    <span className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] md:tracking-[0.5em] mt-2 sm:mt-4 whitespace-nowrap">{label}</span>
  </div>
);

export default App;
