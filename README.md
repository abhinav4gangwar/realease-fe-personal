# RealEase Frontend

A modern, production-ready Next.js application for real estate management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
real-ease-fe/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router (pages & API routes)
│   │   ├── (auth)/            # Route groups for authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Route groups for dashboard pages
│   │   │   ├── properties/
│   │   │   ├── clients/
│   │   │   └── analytics/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── properties/
│   │   │   └── users/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── loading.tsx        # Global loading UI
│   │   ├── error.tsx          # Global error UI
│   │   └── not-found.tsx      # 404 page
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── index.ts       # Barrel exports
│   │   ├── forms/            # Form components
│   │   │   ├── login-form.tsx
│   │   │   └── property-form.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   └── features/         # Feature-specific components
│   │       ├── properties/
│   │       ├── dashboard/
│   │       └── auth/
│   ├── lib/                  # Utility functions & configurations
│   │   ├── utils.ts          # General utility functions
│   │   ├── validations.ts    # Zod validation schemas
│   │   ├── constants.ts      # Application constants
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── api.ts            # API client configuration
│   │   └── env.ts            # Environment variable validation
│   ├── hooks/                # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-properties.ts
│   │   └── use-local-storage.ts
│   ├── store/                # Global state management
│   │   ├── auth-store.ts
│   │   ├── property-store.ts
│   │   └── ui-store.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── property.ts
│   │   └── api.ts
│   ├── styles/               # Additional styling
│   │   └── components.css
│   └── __tests__/            # Test files
│       ├── components/
│       ├── utils/
│       └── __mocks__/
├── .env.example               # Environment variables template
├── .env.local                # Local environment variables (gitignored)
├── sop.md                    # Standard Operating Procedures
└── package.json
```

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library + Playwright
- **Code Quality**: ESLint + Prettier + Husky
- **Authentication**: NextAuth.js
- **Database Client**: Prisma (if using ORM) or direct fetch calls

## ⚙️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to backend API endpoints

### Environment Variables

Create `.env.local` from `.env.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database (if direct connection needed)
DATABASE_URL=postgresql://user:password@localhost:5432/realease

# External Services
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_MAPS_API_KEY=your-maps-api-key
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd real-ease-fe

# Install dependencies
npm install

# Set up git hooks
npm run prepare

# Start development server
npm run dev
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript compiler check

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
npm run test:coverage # Generate test coverage report

# Analysis
npm run analyze      # Analyze bundle size
npm run lighthouse   # Run Lighthouse audit
```

## 🏗 Development Guidelines

### Code Standards

1. **Components**: Use functional components with TypeScript
2. **Styling**: Use Tailwind CSS classes, avoid inline styles
3. **State**: Local state with useState, global state with Zustand
4. **Forms**: Use React Hook Form with Zod validation
5. **API Calls**: Use TanStack Query for data fetching
6. **File Naming**: Use kebab-case for files, PascalCase for components

### Folder Organization

- **Components**: Organize by feature, then by type
- **Utilities**: Keep pure functions in `lib/utils.ts`
- **Types**: Co-locate types with features when possible
- **Tests**: Mirror source structure in `__tests__/`

### Import Conventions

```typescript
// External packages
import React from "react";
import { NextPage } from "next";

// Internal imports (absolute paths using @/)
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { ApiResponse } from "@/types/api";

// Relative imports (same directory)
import "./component.css";
```

### Component Structure

```typescript
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Hooks
  // Event handlers
  // Render logic

  return (
    // JSX
  )
}

// Default export at bottom
export default Component
```

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# Lint and test before deployment
npm run lint
npm run test
npm run type-check
```

### Environment Setup

- **Development**: `.env.local`
- **Staging**: Environment variables in deployment platform
- **Production**: Environment variables in deployment platform

## 🧪 Testing Strategy

- **Unit Tests**: Components and utilities
- **Integration Tests**: API routes and complex interactions
- **E2E Tests**: Critical user flows
- **Visual Tests**: Component library with Storybook

## 📊 Performance Monitoring

- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle Analysis**: Regular bundle size monitoring
- **Error Tracking**: Implement error boundaries and logging
- **Analytics**: User behavior and performance metrics

## 🔒 Security Considerations

- Environment variable validation
- Input sanitization with Zod
- Secure HTTP-only cookies for auth
- CSRF protection
- Content Security Policy headers

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [SOP Document](./sop.md) - Complete development procedures
- [Component Library](./storybook) - UI component documentation
- [API Documentation](./docs/api.md) - Backend integration guide

## 🤝 Contributing

1. Follow the established folder structure
2. Write tests for new features
3. Update documentation
4. Follow commit message conventions
5. Ensure all checks pass before PR submission

For detailed development procedures, see [sop.md](./sop.md).

Test Commit2