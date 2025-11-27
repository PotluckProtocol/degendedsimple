/**
 * Component to display which contract address is being used
 * Helps debug which contract Vercel is connecting to
 */

'use client'
import { contractAddress } from "@/constants/contract";
import { Card, CardContent } from "./ui/card";

export function ContractAddressDisplay() {
  const isNewContract = contractAddress.toLowerCase() === "0xc04c1de26f5b01151ec72183b5615635e609cc81";
  const isOldContract = contractAddress.toLowerCase() === "0x39b4bd619ba158b4cfe61a6fadd900fab22e930b";
  
  return (
    <Card className="mb-4 border-2 border-blue-500/50 bg-blue-500/5">
      <CardContent className="pt-6">
        <div className="text-xs font-mono">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold">Contract Address:</span>
            {isNewContract && (
              <span className="text-green-400">✅ New (with refunds)</span>
            )}
            {isOldContract && (
              <span className="text-red-400">❌ Old (no refunds)</span>
            )}
            {!isNewContract && !isOldContract && (
              <span className="text-yellow-400">⚠️ Unknown</span>
            )}
          </div>
          <div className="break-all text-gray-400">{contractAddress}</div>
          {isOldContract && (
            <div className="mt-2 text-red-400 text-xs">
              ⚠️ This contract doesn't support refunds. Update Vercel env var!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

