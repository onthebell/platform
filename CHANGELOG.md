### [2025-06-04]

**Feature**: Added a global "Coming Soon" landing page and middleware redirect.
In production, all routes except static assets and /coming-soon now show the
coming soon page, regardless of the requested path.

**Feature**: Added bellarineSuburbs GeoJSON as a map layer for suburb boundaries
in MapboxMap using react-map-gl/mapbox Source and Layer components.

**Feature**: Reintroduced Supercluster for marker clustering in MapboxMap, with
correct GeoJSON typing and cluster rendering using react-map-gl/mapbox.

**Refactor**: Removed all usages of `any` type across main code and tests,
replacing with proper types for improved type safety and maintainability
**Refactor**: Updated `AdminActivity` metadata to use `Record<string, unknown>`
**Refactor**: Updated `updateUser` and related admin hooks to use
`Partial<User>` instead of `any` **Refactor**: Updated moderation tests to use
fully typed `category_scores` objects, matching `ModerationResult` type
**Refactor**: Replaced <img> tag with Next.js <Image /> in FollowList component
for better performance and optimization **Refactor**: Removed default `any` type
from `authenticatedRequest` utility for improved type safety; now requires
explicit generic type parameter **Refactor**: Extracted PostOptionsMenu as a
typed subcomponent from PostCard for improved maintainability and clarity
**Refactor**: Extracted PostCardCompact as a typed subcomponent from PostCard
for maintainable compact card rendering; fixed all related type errors
**Refactor**: Extracted JobDetailsSection as a typed subcomponent from PostCard
for maintainable job details rendering **Refactor**: Extracted PostsGridFilters
and PostsGridEmpty as typed subcomponents from PostsGrid; added JSDoc for
maintainability **Refactor**: Extracted CommentActions as a typed subcomponent
from Comment; added JSDoc for maintainability **Refactor**: Added comprehensive
JSDoc documentation to all exported hooks in /src/hooks for clarity and
maintainability **Fix**: Fixed missing imports for types in admin and moderation
files **Chore**: Ran ESLint and Prettier to ensure code style and formatting
compliance **Chore**: Verified all custom hooks are type-safe, error-free, and
follow code style guidelines **Docs**: Added JSDoc documentation to CommentForm,
CommentsSection, UserLikedPosts, FollowList, FollowStats, and SuggestedUsers
components for improved maintainability **Docs**: Added JSDoc documentation to
FollowButton and AddressAutocomplete components for improved maintainability
**Refactor**: Migrated MapboxMap component to use Map from 'react-map-gl/mapbox'
instead of direct mapbox-gl usage. All map rendering and markers now use the
React Map component for improved maintainability and compatibility.
