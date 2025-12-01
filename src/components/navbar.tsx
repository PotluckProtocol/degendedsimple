'use client'

import { ConnectButton, darkTheme } from "thirdweb/react";
import { client } from "@/app/client";
import { sonic } from "@/constants/chain";
import { tokenAddress } from "@/constants/contract";
import { useRouter, useSearchParams } from "next/navigation";

export function Navbar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasMarketParam = searchParams.get('market') !== null;

    const handleLogoClick = () => {
        // If viewing an isolated market, return to home (clear URL params)
        if (hasMarketParam) {
            router.push('/');
        }
    };

    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-6">
                <h1 
                    onClick={handleLogoClick}
                    className={`text-5xl md:text-6xl font-black tracking-wider uppercase ${hasMarketParam ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    style={{
                        fontFamily: '"Courier New", monospace',
                        textShadow: `
                            3px 3px 0px #3B82F6,
                            6px 6px 0px #2563EB,
                            9px 9px 0px #1E40AF,
                            12px 12px 0px #1E3A8A,
                            0 0 10px rgba(59, 130, 246, 0.5),
                            0 0 20px rgba(59, 130, 246, 0.3)
                        `,
                        color: '#60A5FA',
                        letterSpacing: '0.1em',
                        imageRendering: 'pixelated',
                        WebkitFontSmoothing: 'none',
                        MozOsxFontSmoothing: 'unset',
                        filter: 'contrast(1.2)'
                    }}
                    title={hasMarketParam ? 'Click to return to home' : ''}
                >
                    DEGENDED MARKETS
                </h1>
            </div>
            <div className="items-center flex gap-2">
                <ConnectButton 
                    client={client} 
                    theme={darkTheme()}
                    chain={sonic}
                    connectButton={{
                        style: {
                            fontSize: '0.75rem !important',
                            height: '2.5rem !important',
                        },
                        label: 'Connect Wallet',
                    }}
                    detailsButton={{
                        displayBalanceToken: {
                            [sonic.id]: tokenAddress
                        }
                    }}
                    connectModal={{
                        size: "wide",
                        title: "Connect Wallet",
                    }}
                />
            </div>
        </div>
    );
}
