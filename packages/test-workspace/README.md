# TypeScript Calculator

A simple command-line calculator application built with TypeScript for demonstration and testing purposes.

## Features

- Basic arithmetic operations (add, subtract, multiply, divide)
- Advanced operations (power, square root)
- Calculation history tracking
- Interactive CLI interface
- Comprehensive test suite

## Installation

```bash
npm install
```

## Usage

### Development Mode
```bash
npm run dev
```

### Build and Run
```bash
npm run build
npm start
```

### Available Commands

- **Basic Operations**: `5 + 3`, `10 - 2`, `4 * 6`, `12 / 3`
- **Power**: `2 ^ 3` (2 to the power of 3)
- **Square Root**: `sqrt(16)`
- **History**: Type `history` to see calculation history
- **Clear**: Type `clear` to clear history
- **Quit**: Type `quit` to exit

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Build project
npm run build
```

## Project Structure

```
src/
├── calculator.ts      # Main Calculator class
├── utils.ts          # Utility functions
├── index.ts          # CLI application entry point
├── calculator.test.ts # Calculator tests
└── utils.test.ts     # Utility tests
```

## Dependencies

- **TypeScript**: Main programming language
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **readline-sync**: CLI input handling

## License

MIT 