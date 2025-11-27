/**
 * King Of The Hill badge component
 * Displays a glowing badge with caveman icon for the top market
 */

'use client'
import { Badge } from "./ui/badge";

export function KingOfTheHillBadge() {
  return (
    <Badge 
      className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white border-2 border-orange-400 px-3 py-1.5 shadow-lg z-10 flex items-center gap-1.5"
      style={{
        boxShadow: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.6)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <img 
        src="/icon.png" 
        alt="Caveman" 
        width={20} 
        height={20} 
        className="object-contain flex-shrink-0 rounded-sm"
        style={{ 
          width: '20px',
          height: '20px',
          objectFit: 'contain',
        }}
        onError={(e) => {
          console.error('Failed to load caveman icon:', e);
          // Fallback: hide the image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
      <span className="font-bold text-xs whitespace-nowrap">KING OF THE HILL</span>
    </Badge>
  );
}

