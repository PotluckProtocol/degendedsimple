/**
 * USDC Utility Functions
 * 
 * USDC uses 6 decimals (not 18 like ETH)
 * These helpers convert between USDC amounts and human-readable format
 */

const USDC_DECIMALS = 6;

/**
 * Convert USDC amount (bigint with 6 decimals) to human-readable number
 * @param amount - Amount in smallest USDC unit (with 6 decimals)
 * @returns Human-readable number (e.g., 1000000n -> 1.0)
 */
export function fromUSDC(amount: bigint): number {
    return Number(amount) / Math.pow(10, USDC_DECIMALS);
}

/**
 * Convert human-readable USDC amount to bigint with 6 decimals
 * @param amount - Human-readable amount (e.g., 1.5)
 * @returns Amount in smallest USDC unit (e.g., 1500000n)
 */
export function toUSDC(amount: string | number): bigint {
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    const [integerPart, decimalPart = ''] = amountStr.split('.');
    const paddedDecimal = decimalPart.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
    return BigInt(integerPart + paddedDecimal);
}

/**
 * Format USDC amount for display
 * @param amount - Amount in smallest USDC unit (with 6 decimals)
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string (e.g., "1.00" or "1,234.56")
 */
export function formatUSDC(amount: bigint, decimals: number = 2): string {
    const value = fromUSDC(amount);
    return value.toFixed(decimals);
}


