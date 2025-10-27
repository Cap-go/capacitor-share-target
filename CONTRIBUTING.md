# Contributing

Thank you for your interest in contributing to this project!

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Run linters:
   ```bash
   npm run lint
   ```

4. Format code:
   ```bash
   npm run fmt
   ```

## Testing

### Android

```bash
npm run verify:android
```

### iOS

```bash
npm run verify:ios
```

### Web

```bash
npm run verify:web
```

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linters
5. Submit a pull request

## Code Style

This project uses:
- ESLint for TypeScript/JavaScript
- Prettier for formatting
- SwiftLint for Swift code

Run `npm run fmt` to automatically format your code.

## Documentation

Update the JSDoc comments in the source files and run `npm run docgen` to regenerate the documentation in the README.
