import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ShieldCheck, MapPin, Loader2, AlertTriangle, Zap, Target, Activity, Radar, Crosshair, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { DisasterResponse } from '../services/geminiService';

// Fix for default marker icon in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Red Locator Icon (Google Maps Style)
const customRedIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="position: relative;">
          <div style="
            background-color: #ef4444;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            position: absolute;
            left: -15px;
            top: -35px;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
          <div style="
            width: 10px;
            height: 10px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            position: absolute;
            left: -5px;
            top: -5px;
            filter: blur(2px);
          "></div>
        </div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});

interface DisasterDashboardProps {
  isLoading: boolean;
  isFetchingLocation?: boolean;
  onCheckStatus: (coords?: { lat: number; lng: number }) => void;
  result: DisasterResponse | null;
  location: { lat: number; lng: number } | null;
  lastChecked: Date | null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && map) {
      const timer = setTimeout(() => {
        try {
          map.invalidateSize();
          map.setView([lat, lng], map.getZoom(), { animate: true });
        } catch (error) {
          console.warn("Leaflet re-centering failed:", error);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [lat, lng, map]);
  return null;
}

export function DisasterDashboard({ 
  isLoading, 
  isFetchingLocation, 
  onCheckStatus, 
  result, 
  location, 
  lastChecked 
}: DisasterDashboardProps) {
  const isDanger = result?.status === 'Red';
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => (p + 1) % 2), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-red-500/30 overflow-hidden relative">
      {/* HUD Grid & Scanlines */}
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-20 z-0"></div>
      <div className="fixed inset-0 pointer-events-none scanline opacity-[0.03] z-[100]"></div>
      <div className="fixed inset-x-0 h-[2px] bg-red-500/20 z-[101] animate-scan blur-[1px]"></div>

      {/* Decorative HUD Elements */}
      <div className="fixed top-0 left-0 p-8 flex flex-col gap-1 z-20 pointer-events-none">
        <div className="flex items-center gap-2 text-red-500/60 font-mono text-[10px] uppercase tracking-[0.3em]">
          <Radar className="w-3 h-3 animate-pulse" />
          System Active
        </div>
        <div className="text-white/20 font-mono text-[8px] uppercase tracking-widest">
          Version 2.4.0-Stable // Build 882
        </div>
      </div>

      <div className="fixed top-0 right-0 p-8 z-20 pointer-events-none flex flex-col items-end">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Global Feed</div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-1 h-3 rounded-full ${i <= 2 ? 'bg-red-500/40' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
          <Activity className="w-5 h-5 text-red-500/30" />
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-24 flex flex-col items-center">
        {/* Main Tactical Scanner */}
        <div className="relative mb-24 group">
          <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all duration-1000"></div>
          
          {/* Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-10 border border-white/5 rounded-full border-dashed"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-16 border border-red-500/10 rounded-full border-dotted"
          />

          <button
            onClick={() => onCheckStatus()}
            disabled={isLoading || isFetchingLocation}
            className="relative w-72 h-72 rounded-full border-2 border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 transition-all duration-500 group-hover:border-red-500/40 group-hover:shadow-[0_0_50px_rgba(239,68,68,0.15)] active:scale-95 disabled:opacity-50 overflow-hidden"
          >
            {/* Liquid Background for processing */}
            {isLoading && (
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: "-100%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-red-500/10 z-0 blur-xl"
              />
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
              <AnimatePresence mode="wait">
                {isLoading || isFetchingLocation ? (
                  <motion.div
                    key="loading"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="relative"
                  >
                    <Loader2 className="w-20 h-20 text-red-500 animate-spin" />
                    <Crosshair className="absolute inset-0 w-20 h-20 text-white/20 p-4" />
                  </motion.div>
                ) : result?.status === 'Red' ? (
                  <motion.div key="red" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                    <ShieldAlert className="w-20 h-20 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                  </motion.div>
                ) : result?.status === 'Green' ? (
                  <motion.div key="green" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                    <ShieldCheck className="w-20 h-20 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </motion.div>
                ) : (
                  <motion.div key="idle" className="relative group-hover:scale-110 transition-transform duration-500">
                    <Target className="w-20 h-20 text-white/60 group-hover:text-red-500 transition-colors" />
                    <div className={`absolute inset-0 rounded-full border-2 border-red-500/40 transition-all duration-1000 ${pulse ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center">
                <span className="block text-4xl font-black uppercase tracking-tighter italic leading-none mb-1">
                  {isFetchingLocation ? "Syncing" : isLoading ? "Scanning" : result ? "Report" : "Scan Area"}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-medium transition-colors ${isDanger ? 'text-red-500' : 'text-white/40'}`}>
                  {isFetchingLocation ? "GPX LINK ACQUIRED" : isLoading ? "NEURAL ANALYSIS" : result ? "LOCALIZED DATA" : "Tactical Ready"}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Data Feed Grid */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column - Main Status */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`relative p-8 rounded-3xl border overflow-hidden backdrop-blur-xl ${isDanger ? 'bg-red-500/5 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'bg-emerald-500/5 border-emerald-500/30'}`}>
                  {/* Decorative Corner Brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="text-[11px] font-mono uppercase tracking-[0.4em] font-bold opacity-60">Status Assessment</span>
                  </div>

                  <h2 className={`text-6xl font-black italic tracking-tighter mb-4 ${isDanger ? 'text-red-500 text-glow-red' : 'text-emerald-400 text-glow-emerald'}`}>
                    {result.status}
                  </h2>
                  
                  <p className="text-xl text-white/80 font-light leading-relaxed mb-8">
                    {result.message}
                  </p>

                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-center px-4 border-r border-white/10">
                      <div className="text-[10px] font-mono uppercase text-white/30 tracking-widest mb-1">Threat Level</div>
                      <div className={`text-xl font-bold uppercase italic ${isDanger ? 'text-red-500' : 'text-emerald-400'}`}>{result.riskLevel}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-mono uppercase text-white/30 tracking-widest mb-2">Confidence Heuristics</div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: isDanger ? "94%" : "89%" }}
                          className={`h-full ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Info HUD */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-mono tracking-widest text-white/60">
                        LAT {location?.lat?.toFixed(6) ?? '---'} // LNG {location?.lng?.toFixed(6) ?? '---'}
                      </span>
                    </div>
                    {lastChecked && (
                      <div className="flex items-center gap-2 pl-7 font-mono text-[9px] uppercase tracking-widest text-white/30">
                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                        Timestamp: {lastChecked.toLocaleTimeString()} [{Intl.DateTimeFormat().resolvedOptions().timeZone}]
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <Zap className="w-4 h-4 text-white/40 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Middle Column - Hazards & Tips */}
              <div className="lg:col-span-4 space-y-6">
                {/* Hazards Card */}
                <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-white/30 italic">Threat Vectors</span>
                    <AlertTriangle className={`w-4 h-4 ${result.hazards.length > 0 ? 'text-red-500' : 'text-emerald-500/30'}`} />
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {result.hazards.length > 0 ? result.hazards.map((hazard, i) => (
                      <motion.div 
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium tracking-wide">{hazard}</span>
                      </motion.div>
                    )) : (
                      <div className="text-sm text-white/20 italic font-mono uppercase tracking-widest">No primary threats detected</div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-white/30 italic mb-4 block">Protocols</span>
                    <div className="space-y-3">
                      {result.safetyTips.map((tip, i) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${isDanger ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {i + 1}
                          </div>
                          <p className="text-sm text-white/70 leading-relaxed font-light group-hover:text-white transition-colors">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Map & Nearby Alerts */}
              <div className="lg:col-span-3 space-y-6">
                {/* Map HUD */}
                <div className="relative rounded-3xl border border-white/10 bg-zinc-900 overflow-hidden aspect-square lg:aspect-auto lg:h-[300px]">
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[1px] border-white/10 z-[1001]" />
                  <div className="absolute inset-0 z-0 grayscale contrast-[1.1] brightness-[0.8] hover:grayscale-0 transition-all duration-1000">
                    <MapContainer 
                      center={[location?.lat ?? 0, location?.lng ?? 0]} 
                      zoom={14} 
                      scrollWheelZoom={false}
                      zoomControl={false}
                      className="w-full h-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker 
                        position={[location?.lat ?? 0, location?.lng ?? 0]} 
                        icon={customRedIcon}
                      />
                      {location && (
                        <Circle 
                          center={[location.lat, location.lng]} 
                          radius={20000} // 20km as requested in prompt
                          pathOptions={{ 
                            color: isDanger ? '#ef4444' : '#10b981', 
                            fillColor: isDanger ? '#ef4444' : '#10b981', 
                            fillOpacity: 0.05,
                            weight: 1,
                            dashArray: '5, 10'
                          }} 
                        />
                      )}
                      <MapRecenter lat={location?.lat ?? 0} lng={location?.lng ?? 0} />
                      <MapClickHandler onLocationSelect={(lat, lng) => onCheckStatus({ lat, lng })} />
                    </MapContainer>
                  </div>
                  {/* Map Overlay Brackets */}
                  <div className="absolute top-4 left-4 text-white/40 font-mono text-[8px] uppercase tracking-widest z-[1002] bg-black/60 px-2 py-1 rounded backdrop-blur-md">Tactical Feed // Local</div>
                  <div className="absolute bottom-4 right-4 flex gap-1 z-[1002]">
                    <div className="w-1 h-3 bg-red-500/60" />
                    <div className="w-1 h-3 bg-red-500/60 animate-pulse" />
                  </div>
                </div>

                {/* Nearby Alerts HUD */}
                <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Radar className="w-4 h-4 text-red-500/40" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-white/30 italic">Proximity Alerts</span>
                  </div>
                  <div className="space-y-4">
                    {result.nearbyAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-help">
                        <p className="text-xs text-white/50 group-hover:text-red-400 transition-colors">{alert}</p>
                        <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-red-500/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 inset-x-0 p-8 flex justify-between items-end z-20 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-white/10 font-mono text-[8px] uppercase tracking-[0.4em]">Securing Humanity through Artificial Intelligence</div>
          <div className="text-white/5 font-mono text-[7px] uppercase tracking-[0.5em]">AIS-DG-V2 // GLOBAL GUARDIAN NETWORK</div>
        </div>
        <div className="text-white/30 font-mono text-[10px] tracking-widest">
          {new Date().getFullYear()} // ALL SYSTEMS NOMINAL
        </div>
      </footer>
    </div>
  );
}
