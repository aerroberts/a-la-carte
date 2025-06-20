import { Calculator } from "./calculator";

describe("Calculator", () => {
    let calculator: Calculator;

    beforeEach(() => {
        calculator = new Calculator();
    });

    describe("add", () => {
        it("should add two positive numbers", () => {
            expect(calculator.add(2, 3)).toBe(5);
        });

        it("should add positive and negative numbers", () => {
            expect(calculator.add(5, -3)).toBe(2);
        });

        it("should add two negative numbers", () => {
            expect(calculator.add(-2, -3)).toBe(-5);
        });

        it("should add decimal numbers", () => {
            expect(calculator.add(1.5, 2.5)).toBe(4);
        });
    });

    describe("subtract", () => {
        it("should subtract two positive numbers", () => {
            expect(calculator.subtract(5, 3)).toBe(2);
        });

        it("should subtract negative from positive", () => {
            expect(calculator.subtract(5, -3)).toBe(8);
        });

        it("should subtract positive from negative", () => {
            expect(calculator.subtract(-5, 3)).toBe(-8);
        });
    });

    describe("multiply", () => {
        it("should multiply two positive numbers", () => {
            expect(calculator.multiply(3, 4)).toBe(12);
        });

        it("should multiply positive and negative numbers", () => {
            expect(calculator.multiply(3, -4)).toBe(-12);
        });

        it("should multiply by zero", () => {
            expect(calculator.multiply(5, 0)).toBe(0);
        });

        it("should multiply decimal numbers", () => {
            expect(calculator.multiply(2.5, 4)).toBe(10);
        });
    });

    describe("divide", () => {
        it("should divide two positive numbers", () => {
            expect(calculator.divide(12, 3)).toBe(4);
        });

        it("should divide positive and negative numbers", () => {
            expect(calculator.divide(12, -3)).toBe(-4);
        });

        it("should divide decimal numbers", () => {
            expect(calculator.divide(7.5, 2.5)).toBe(3);
        });

        it("should throw error when dividing by zero", () => {
            expect(() => calculator.divide(5, 0)).toThrow("Division by zero is not allowed");
        });
    });

    describe("power", () => {
        it("should calculate power of positive numbers", () => {
            expect(calculator.power(2, 3)).toBe(8);
        });

        it("should calculate power with zero exponent", () => {
            expect(calculator.power(5, 0)).toBe(1);
        });

        it("should calculate power with negative exponent", () => {
            expect(calculator.power(2, -2)).toBe(0.25);
        });

        it("should calculate power with decimal base", () => {
            expect(calculator.power(2.5, 2)).toBe(6.25);
        });
    });

    describe("squareRoot", () => {
        it("should calculate square root of positive numbers", () => {
            expect(calculator.squareRoot(9)).toBe(3);
            expect(calculator.squareRoot(16)).toBe(4);
        });

        it("should calculate square root of decimal numbers", () => {
            expect(calculator.squareRoot(2.25)).toBe(1.5);
        });

        it("should calculate square root of zero", () => {
            expect(calculator.squareRoot(0)).toBe(0);
        });

        it("should throw error for negative numbers", () => {
            expect(() => calculator.squareRoot(-1)).toThrow("Cannot calculate square root of negative number");
        });
    });

    describe("history", () => {
        it("should track calculation history", () => {
            calculator.add(2, 3);
            calculator.multiply(4, 5);

            const history = calculator.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0]).toBe("2 + 3 = 5");
            expect(history[1]).toBe("4 × 5 = 20");
        });

        it("should return empty history initially", () => {
            expect(calculator.getHistory()).toHaveLength(0);
        });

        it("should clear history", () => {
            calculator.add(1, 1);
            calculator.clearHistory();
            expect(calculator.getHistory()).toHaveLength(0);
        });

        it("should get last result", () => {
            calculator.add(2, 3);
            expect(calculator.getLastResult()).toBe("2 + 3 = 5");
        });

        it("should return null for last result when no calculations", () => {
            expect(calculator.getLastResult()).toBeNull();
        });
    });
});
