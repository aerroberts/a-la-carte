import * as readlineSync from "readline-sync";
import { Calculator } from "./calculator";
import { formatNumber, parseNumber } from "./utils";

/**
 * Main calculator application
 */
class CalculatorApp {
    private calculator: Calculator;

    constructor() {
        this.calculator = new Calculator();
    }

    /**
     * Start the calculator application
     */
    start(): void {
        console.log("🧮 TypeScript Calculator");
        console.log("=======================");
        console.log("Available operations: +, -, *, /, ^, sqrt");
        console.log('Type "history" to see calculation history');
        console.log('Type "clear" to clear history');
        console.log('Type "quit" to exit\n');

        while (true) {
            try {
                const input = readlineSync.question('Enter calculation (e.g., "5 + 3"): ');

                if (input.toLowerCase() === "quit") {
                    console.log("Goodbye! 👋");
                    break;
                }

                if (input.toLowerCase() === "history") {
                    this.showHistory();
                    continue;
                }

                if (input.toLowerCase() === "clear") {
                    this.calculator.clearHistory();
                    console.log("History cleared! 🗑️\n");
                    continue;
                }

                const result = this.evaluateExpression(input);
                console.log(`Result: ${formatNumber(result)}\n`);
            } catch (error) {
                console.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}\n`);
            }
        }
    }

    /**
     * Evaluate a mathematical expression
     */
    private evaluateExpression(expression: string): number {
        const trimmed = expression.trim();

        // Handle square root
        if (trimmed.startsWith("sqrt(") && trimmed.endsWith(")")) {
            const inner = trimmed.slice(5, -1);
            const num = parseNumber(inner);
            return this.calculator.squareRoot(num);
        }

        // Handle binary operations
        const operators = ["+", "-", "*", "/", "^"];
        for (const op of operators) {
            const parts = trimmed.split(op);
            if (parts.length === 2) {
                const a = parseNumber(parts[0].trim());
                const b = parseNumber(parts[1].trim());

                switch (op) {
                    case "+":
                        return this.calculator.add(a, b);
                    case "-":
                        return this.calculator.subtract(a, b);
                    case "*":
                        return this.calculator.multiply(a, b);
                    case "/":
                        return this.calculator.divide(a, b);
                    case "^":
                        return this.calculator.power(a, b);
                }
            }
        }

        throw new Error('Invalid expression format. Use: "a + b", "a - b", "a * b", "a / b", "a ^ b", or "sqrt(a)"');
    }

    /**
     * Show calculation history
     */
    private showHistory(): void {
        const history = this.calculator.getHistory();
        if (history.length === 0) {
            console.log("No calculations in history.\n");
            return;
        }

        console.log("\n📊 Calculation History:");
        console.log("========================");
        history.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry}`);
        });
        console.log("");
    }
}

// Start the application if this file is run directly
if (require.main === module) {
    const app = new CalculatorApp();
    app.start();
}
