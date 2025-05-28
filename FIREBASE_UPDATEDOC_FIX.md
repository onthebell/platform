# Firebase updateDoc() Error Fix

## Problem Description

The application was encountering a Firebase error when updating posts
(specifically deals):

```
FirebaseError: Function updateDoc() called with invalid data. Unsupported field value: undefined (found in field price in document posts/C8VterKhBBUDjAcR4nL1)
```

## Root Cause

The error occurred when:

1. Users edited posts with empty price fields
2. The edit form would pass `formData.price` as an empty string `""`
3. `parseFloat("")` returns `NaN`
4. The `updatePost()` function would pass `NaN` or `undefined` values to
   Firebase's `updateDoc()`
5. Firebase rejects `undefined` and `NaN` values, causing the error

## Solution Implemented

### 1. Enhanced `updatePost()` Function

Updated `/src/lib/firebase/firestore.ts` to filter out undefined and NaN values:

```typescript
export async function updatePost(id: string, updates: Partial<CommunityPost>) {
  const docRef = doc(db, 'posts', id);

  // Filter out undefined and NaN values to prevent Firestore errors
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(
      ([, value]) => value !== undefined && !Number.isNaN(value)
    )
  );

  const updateData = {
    ...cleanUpdates,
    updatedAt: Timestamp.fromDate(new Date()),
  };

  await updateDoc(docRef, updateData);
}
```

### 2. Fixed Price Handling in Edit Form

Updated `/src/app/(community)/community/edit/[postId]/page.tsx`:

```typescript
price: formData.price && !isNaN(parseFloat(formData.price)) ? parseFloat(formData.price) : undefined,
```

### 3. Fixed Price Handling in Create Form

Updated `/src/app/(community)/community/create/page.tsx`:

```typescript
price: formData.price && !isNaN(parseFloat(formData.price)) ? parseFloat(formData.price) : undefined,
currency: formData.price && !isNaN(parseFloat(formData.price)) ? formData.currency : undefined,
```

### 4. Applied Same Fix to User Profile Updates

Updated `updateUserProfile()` function with the same filtering approach.

## Benefits

1. **Prevents Firebase Errors**: No more `updateDoc()` errors from undefined/NaN
   values
2. **Better Data Integrity**: Only valid values are stored in Firestore
3. **Consistent Behavior**: All update functions now handle invalid values
   consistently
4. **User Experience**: Users can now successfully update posts even with empty
   price fields

## Testing

- Development server starts without errors
- Posts can be edited with empty price fields
- Invalid numeric inputs are properly handled
- Existing functionality remains intact

## Related Files

- `/src/lib/firebase/firestore.ts` - Core Firebase functions
- `/src/app/(community)/community/edit/[postId]/page.tsx` - Edit post form
- `/src/app/(community)/community/create/page.tsx` - Create post form
- `/src/types/index.ts` - Type definitions (CommunityPost interface)
