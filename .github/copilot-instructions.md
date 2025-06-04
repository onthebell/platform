# Copilot Instructions for OnTheBell

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

OnTheBell is a community platform for residents of the Bellarine Peninsula in
Victoria, Australia. The platform provides a central hub for local information,
community connections, and services.

## Technology Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: TailwindCSS
- **Authentication & Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Stripe for donations
- **Maps**: Leaflet and React Leaflet for location mapping
- **Media**: Mux for video components
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Package Manager**: pnpm

## Key Features & Architecture

1. **User Authentication & Verification**

   - Firebase Auth for user management
   - Street address verification system for "On the Bell" access
   - Tiered access: verified residents vs. general public

2. **Community Features**

   - Deals and discounts
   - Local events calendar
   - Marketplace (buy/sell/free items)
   - Community requests for help
   - Neighborhood connections

3. **Location Services**

   - Leaflet maps for location-based features
   - Address verification integration
   - Location-based content filtering

4. **Content Management**

   - Firebase Firestore for data storage
   - Firebase Storage for media files
   - Mux integration for video content

5. **Monetization**
   - Stripe integration for voluntary donations
   - Support platform development funding

## Code Style Guidelines

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use TailwindCSS for styling with a mobile-first approach
- Implement proper error handling and loading states
- Use React Server Components where appropriate
- Follow Firebase security rules best practices
- Implement proper SEO and accessibility features

## File Structure Conventions

```
/src/app         → Next.js App Router pages and layouts
/src/components  → Reusable React components
/src/lib         → Utility functions and configurations
/src/hooks       → Custom React hooks
/src/types       → TypeScript type definitions
/src/styles      → Global styles and TailwindCSS configs
```

## Security Considerations

- Implement proper Firebase security rules
- Validate user permissions before displaying sensitive content
- Secure API routes for payments and user verification
- Follow OWASP guidelines for web security

## Performance Guidelines

- Optimize images and media files
- Use Next.js built-in optimizations
- Implement proper caching strategies
- Minimize bundle size with tree shaking

---

## 🔁 Copilot Changelog Instruction

Copilot **must** append a new entry to `CHANGELOG.md` for any change it assists
with.

Each entry should include the **date** and categorized changes using the format
below:

```
### [YYYY-MM-DD]
**Feature**: Describe new functionality
**Fix**: Describe bug fix
**Refactor**: Describe code reorganization
**Test**: Describe new or updated test coverage
**Chore**: Linting, formatting, dependency updates, config changes
```

**Example:**

```
### [2025-06-04]
**Feature**: Added Leaflet map integration for event pages
**Fix**: Corrected Firestore query for user verification status
**Test**: Created tests for AddressVerification component
**Chore**: Ran Prettier and ESLint cleanup across /src/app/pages
```

---

## ✅ Approved Copilot Tasks

Copilot is encouraged to:

- Scaffold new pages, routes, and components using Next.js App Router
- Write unit and integration tests with Jest + React Testing Library
- Fix ESLint or Prettier issues
- Improve Tailwind styling and responsiveness
- Write Firebase Firestore queries with type safety
- Suggest performance optimizations
- Generate accessible, SEO-friendly components
- Automatically document changelog entries
