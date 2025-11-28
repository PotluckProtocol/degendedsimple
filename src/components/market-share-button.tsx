/**
 * Share button component for markets
 * Copies share text and URL to clipboard
 */

'use client'
import { Button } from "./ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface MarketShareButtonProps {
  marketQuestion: string;
  marketId?: number;
}

export function MarketShareButton({ marketQuestion, marketId }: MarketShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `I just bought shares on the "${marketQuestion}" market, do you want to bet?`;
    
    // Build URL - if marketId is provided, try to link to specific market (may not work depending on routing)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.degended.bet';
    const shareUrl = baseUrl;
    
    const fullText = `${shareText}\n\n${shareUrl}`;

    try {
      // Try Web Share API first (mobile-friendly)
      if (navigator.share) {
        await navigator.share({
          title: 'Degended Markets',
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared!",
          description: "Market shared successfully.",
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Share text copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // User cancelled share or clipboard failed - try clipboard as fallback
      try {
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Share text copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        toast({
          title: "Failed to Share",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}


