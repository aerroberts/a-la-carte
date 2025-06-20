/**
 * Utility functions for the calculator application
 */

/**
 * Check if a string is a valid number
 */
export function isValidNumber(str: string): boolean {
    const num = parseFloat(str);
    return !isNaN(num) && isFinite(num);
}

/**
 * Parse a string to number with validation
 */
export function parseNumber(str: string): number {
    if (!isValidNumber(str)) {
        throw new Error(`Invalid number: ${str}`);
    }
    return parseFloat(str);
}

/**
 * Format a number for display (round to specified decimal places)
 */
export function formatNumber(num: number, decimals: number = 10): string {
    if (Number.isInteger(num)) {
        return num.toString();
    }

    // Round to specified decimal places and remove trailing zeros
    const rounded = parseFloat(num.toFixed(decimals));
    return rounded.toString();
}

/**
 * Check if two numbers are approximately equal (useful for floating point comparisons)
 */
export function isApproximatelyEqual(a: number, b: number, tolerance: number = 1e-10): boolean {
    return Math.abs(a - b) < tolerance;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
