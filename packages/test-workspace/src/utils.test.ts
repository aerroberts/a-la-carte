import { clamp, formatNumber, isApproximatelyEqual, isValidNumber, parseNumber, randomBetween } from "./utils";

describe("Utils", () => {
    describe("isValidNumber", () => {
        it("should return true for valid numbers", () => {
            expect(isValidNumber("123")).toBe(true);
            expect(isValidNumber("123.45")).toBe(true);
            expect(isValidNumber("-123")).toBe(true);
            expect(isValidNumber("0")).toBe(true);
            expect(isValidNumber("0.0")).toBe(true);
        });

        it("should return false for invalid numbers", () => {
            expect(isValidNumber("abc")).toBe(false);
            expect(isValidNumber("")).toBe(false);
            expect(isValidNumber("123abc")).toBe(false);
            expect(isValidNumber("Infinity")).toBe(false);
            expect(isValidNumber("NaN")).toBe(false);
        });
    });

    describe("parseNumber", () => {
        it("should parse valid number strings", () => {
            expect(parseNumber("123")).toBe(123);
            expect(parseNumber("123.45")).toBe(123.45);
            expect(parseNumber("-123")).toBe(-123);
            expect(parseNumber("0")).toBe(0);
        });

        it("should throw error for invalid number strings", () => {
            expect(() => parseNumber("abc")).toThrow("Invalid number: abc");
            expect(() => parseNumber("")).toThrow("Invalid number: ");
            expect(() => parseNumber("123abc")).toThrow("Invalid number: 123abc");
        });
    });

    describe("formatNumber", () => {
        it("should return integers as strings without decimals", () => {
            expect(formatNumber(5)).toBe("5");
            expect(formatNumber(0)).toBe("0");
            expect(formatNumber(-10)).toBe("-10");
        });

        it("should format decimal numbers", () => {
            expect(formatNumber(3.14159)).toBe("3.14159");
            expect(formatNumber(2.5)).toBe("2.5");
        });

        it("should handle very small decimal numbers", () => {
            expect(formatNumber(0.0000000001)).toBe("1e-10");
        });
    });

    describe("isApproximatelyEqual", () => {
        it("should return true for approximately equal numbers", () => {
            expect(isApproximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
            expect(isApproximatelyEqual(1.0000000001, 1.0000000002)).toBe(true);
        });

        it("should return false for significantly different numbers", () => {
            expect(isApproximatelyEqual(1, 2)).toBe(false);
            expect(isApproximatelyEqual(0.1, 0.2)).toBe(false);
        });

        it("should work with custom tolerance", () => {
            expect(isApproximatelyEqual(1.1, 1.2, 0.1)).toBe(true);
            expect(isApproximatelyEqual(1.1, 1.3, 0.1)).toBe(false);
        });
    });

    describe("clamp", () => {
        it("should clamp values within range", () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        it("should handle edge cases", () => {
            expect(clamp(0, 0, 10)).toBe(0);
            expect(clamp(10, 0, 10)).toBe(10);
        });
    });

    describe("randomBetween", () => {
        it("should generate numbers within range", () => {
            const min = 1;
            const max = 10;

            for (let i = 0; i < 100; i++) {
                const result = randomBetween(min, max);
                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThanOrEqual(max);
            }
        });

        it("should handle same min and max", () => {
            expect(randomBetween(5, 5)).toBe(5);
        });
    });
});
