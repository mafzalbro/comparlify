# Comparlify

Premium AI-powered platform for course creators and educators.

## Getting Started

1. Install dependencies: `pnpm install`
2. Set up your environment variables (`.env`)
3. Run the development server: `npm run dev`

## Testing

The project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing.

### Run Tests (Watch Mode)

```bash
npm run test
```

### Run Tests (Single Run / CI)

```bash
npm run test:run
```

> **Note for Bun users**: This test suite is optimized for Vitest. While Bun has a built-in test runner, some tests (especially those involving complex React components or deep mocks) may require the Vitest environment provided via `pnpm install` and the scripts above.

### Directory Structure

Tests are located in the `__tests__` directory:
- `unit/components`: Tests for individual UI components.
- `unit/hooks`: Tests for custom React hooks.
- `unit/lib`: Tests for utility functions and core logic.
- `unit/forms`: Tests for complex form components.
- `integration/actions`: Tests for Next.js Server Actions.
- `integration/api`: Tests for REST API routes.

## Deployment

The project is configured for deployment on Vercel. Ensure all environment variables, including `DATABASE_URL` and `REST_API_KEY`, are correctly set.
