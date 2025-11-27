/**
 * Debug component to show which contract is being used
 * Add this temporarily to help diagnose the issue
 */

'use client'
import { contract } from "@/constants/contract";

export function ContractDebug() {
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 border border-gray-700 p-3 rounded text-xs font-mono z-50 max-w-xs">
      <div className="text-green-400 font-bold mb-1">Contract Debug:</div>
      <div className="text-gray-300 break-all">
        {contract.address}
      </div>
      <div className="text-gray-500 text-[10px] mt-1">
        Chain: {contract.chain?.id || 'Unknown'}
      </div>
    </div>
  );
}

