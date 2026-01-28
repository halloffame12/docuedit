import React, { useRef } from 'react';
import { TextRegion } from '../types';

interface ImageCanvasProps {
  imageUrl: string;
  regions: TextRegion[];
  onSelectRegion: (region: TextRegion) => void;
  selectedRegionId: string | null;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({ 
  imageUrl, 
  regions, 
  onSelectRegion,
  selectedRegionId 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className="relative border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-900 shadow-2xl cursor-crosshair group" 
      ref={containerRef}
    >
      <img 
        src={imageUrl} 
        alt="Document" 
        className="block w-full h-auto select-none opacity-95 transition-opacity duration-700 group-hover:opacity-100"
      />
      
      {/* SVG Overlay for interactive bounding boxes */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {regions.map((region) => (
          <g key={region.id}>
            <rect
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              className={`
                cursor-pointer pointer-events-auto transition-all duration-300
                ${selectedRegionId === region.id 
                  ? 'fill-teal-500/20 stroke-teal-400 stroke-[1] [stroke-dasharray:2,1] animate-pulse' 
                  : 'fill-transparent hover:fill-teal-400/10 stroke-teal-500/30 hover:stroke-teal-400 stroke-[0.4]'}
              `}
              onClick={() => onSelectRegion(region)}
            />
          </g>
        ))}
      </svg>
      
      {regions.length > 0 && !selectedRegionId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-xl border border-teal-500/20 text-teal-400 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center space-x-3 animate-bounce md:hidden pointer-events-none shadow-2xl">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></div>
          <span>Selection Protocol Active</span>
        </div>
      )}
    </div>
  );
};