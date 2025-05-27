# Copilot Instructions for OnTheBell

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
OnTheBell is a community platform for residents of the Bellarine Peninsula in Victoria, Australia. The platform provides a central hub for local information, community connections, and services.

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
1. **User Authentication & Verification**:
   - Firebase Auth for user management
   - Street address verification system for "On the Bell" access
   - Tiered access: verified residents vs. general public

2. **Community Features**:
   - Deals and discounts
   - Local events calendar
   - Marketplace (buy/sell/free items)
   - Community requests for help
   - Neighborhood connections

3. **Location Services**:
   - Leaflet maps for location-based features
   - Address verification integration
   - Location-based content filtering

4. **Content Management**:
   - Firebase Firestore for data storage
   - Firebase Storage for media files
   - Mux integration for video content

5. **Monetization**:
   - Stripe integration for voluntary donations
   - Support platform development funding

## Code Style Guidelines
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use TailwindCSS for styling with mobile-first approach
- Implement proper error handling and loading states
- Use React Server Components where appropriate
- Follow Firebase security rules best practices
- Implement proper SEO and accessibility features

## File Structure Conventions
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configurations
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions
- `/src/styles` - Global styles and TailwindCSS configs

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
