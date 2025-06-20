/**
 * A simple calculator class with basic mathematical operations
 */
export class Calculator {
    private history: string[] = [];

    /**
     * Add two numbers
     */
    add(a: number, b: number): number {
        const result = a + b;
        this.history.push(`${a} + ${b} = ${result}`);
        return result;
    }

    /**
     * Subtract two numbers
     */
    subtract(a: number, b: number): number {
        const result = a - b;
        this.history.push(`${a} - ${b} = ${result}`);
        return result;
    }

    /**
     * Multiply two numbers
     */
    multiply(a: number, b: number): number {
        const result = a * b;
        this.history.push(`${a} × ${b} = ${result}`);
        return result;
    }

    /**
     * Divide two numbers
     */
    divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error("Division by zero is not allowed");
        }
        const result = a / b;
        this.history.push(`${a} ÷ ${b} = ${result}`);
        return result;
    }

    /**
     * Calculate power of a number
     */
    power(base: number, exponent: number): number {
        const result = Math.pow(base, exponent);
        this.history.push(`${base}^${exponent} = ${result}`);
        return result;
    }

    /**
     * Calculate square root
     */
    squareRoot(n: number): number {
        if (n < 0) {
            throw new Error("Cannot calculate square root of negative number");
        }
        const result = Math.sqrt(n);
        this.history.push(`√${n} = ${result}`);
        return result;
    }

    /**
     * Get calculation history
     */
    getHistory(): string[] {
        return [...this.history];
    }

    /**
     * Clear calculation history
     */
    clearHistory(): void {
        this.history = [];
    }

    /**
     * Get the last calculation result
     */
    getLastResult(): string | null {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }
}
