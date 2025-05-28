# Firestore Indexes Required for OnTheBell

This document lists the composite indexes required for the OnTheBell platform to function correctly.

## Required Composite Indexes

### 1. Posts Collection - Category + Status + CreatedAt
**Collection ID:** `posts`
**Fields indexed:**
- `category` (Ascending)
- `status` (Ascending) 
- `createdAt` (Descending)

**Query patterns this supports:**
- `getPosts({ category: 'marketplace' })` - Marketplace items
- `getPosts({ category: 'free_items' })` - Free items
- `getPosts({ category: 'events' })` - Events
- `getPosts({ category: 'community' })` - Community posts
- Any category-specific queries with active status

### 2. Posts Collection - Status + CreatedAt (for general queries)
**Collection ID:** `posts`
**Fields indexed:**
- `status` (Ascending)
- `createdAt` (Descending)

**Query patterns this supports:**
- `getPosts({})` - All active posts (Community page)

### 3. Posts Collection - AuthorId + Status + CreatedAt
**Collection ID:** `posts`
**Fields indexed:**
- `authorId` (Ascending)
- `status` (Ascending)
- `createdAt` (Descending)

**Query patterns this supports:**
- User's own posts
- Profile page post listings

### 4. Posts Collection - Visibility + Status + CreatedAt
**Collection ID:** `posts`
**Fields indexed:**
- `visibility` (Ascending)
- `status` (Ascending)
- `createdAt` (Descending)

**Query patterns this supports:**
- Public vs. verified-only content filtering

## How to Create These Indexes

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your OnTheBell project
3. Navigate to Firestore Database > Indexes tab
4. Click "Create Index"
5. Set Collection ID to `posts`
6. Add the fields as specified above
7. Click "Create"

### Option 2: Firebase CLI
You can also create indexes using the Firebase CLI by adding them to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts", 
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "visibility", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Then run:
```bash
firebase deploy --only firestore:indexes
```

## Error Messages That Indicate Missing Indexes

If you see errors like:
- "The query requires an index"
- "FAILED_PRECONDITION: The query requires an index"
- "Failed to load marketplace data"

These typically mean the required composite indexes haven't been created yet.

## Index Creation Time

Note that creating indexes can take several minutes to complete, especially for collections with existing data. You'll see a status indicator in the Firebase console showing the build progress.

## Testing After Index Creation

Once indexes are created, test the following pages:
- `/community` - Should load all community posts
- `/marketplace` - Should load marketplace and free items
- `/events` - Should load event posts
- User profiles - Should load user-specific posts

All pages should load without errors once the appropriate indexes are in place.
