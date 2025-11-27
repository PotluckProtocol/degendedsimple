/**
 * King Of The Hill badge component
 * Displays a glowing badge with caveman icon for the top market
 */

'use client'
import { Badge } from "./ui/badge";

export function KingOfTheHillBadge() {
  return (
    <Badge 
      className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white border-2 border-orange-400 px-3 py-1.5 shadow-lg z-10"
      style={{
        boxShadow: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.6)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <span className="font-bold text-xs whitespace-nowrap">KING OF THE HILL</span>
    </Badge>
  );
}

