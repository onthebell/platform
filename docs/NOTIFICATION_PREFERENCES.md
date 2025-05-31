# Notification Preferences System

The notification preferences system allows users to control which types of
notifications they receive on the OnTheBell platform.

## User Preferences Structure

Notification preferences are stored in the User object with the following
structure:

```typescript
notificationPreferences: {
  newPosts: {
    deals: boolean;
    events: boolean;
    marketplace: boolean;
    free_items: boolean;
    help_requests: boolean;
    community: boolean;
    food: boolean;
    services: boolean;
  }
  likes: boolean;
  comments: boolean;
  follows: boolean;
}
```

## Notification Types

The system supports the following notification types:

1. **New Posts** - Notifications for new posts in specific categories

   - Users can choose which post categories they want to be notified about
   - Categories include: deals, events, marketplace, free items, help requests,
     community, food, services

2. **Interaction Notifications**
   - Likes - When someone likes the user's post
   - Comments - When someone comments on the user's post
   - Follows - When someone follows the user

## Implementation Details

### User Interface

Users can manage their notification preferences in the profile settings under
the "Notifications" tab. The UI allows:

- Toggling notification categories for new posts (with "Enable All" and "Disable
  All" options)
- Toggling interaction notifications (likes, comments, follows)

### Backend Implementation

1. **Firestore Storage**

   - Notification preferences are stored in the user document in Firestore
   - Default preferences (all enabled) are applied for new users

2. **Notification Creation**

   - New post notifications are created when a post is published
   - Only users who have enabled notifications for that post category receive
     notifications
   - Post author doesn't receive notifications for their own posts
   - Visibility settings are respected (verified-only posts only notify verified
     users)

3. **Migration System**
   - A migration utility exists to add default notification preferences to
     existing users
   - This runs automatically for admin users in the admin dashboard

## Technical Components

1. **User Interface Components**

   - `NotificationPreferences.tsx` - Main component for managing preferences
   - `NotificationItem.tsx` - Displays notification items with appropriate
     styling

2. **Backend Services**

   - `postNotifications.ts` - Handles creation of new post notifications
   - `migrateUsers.ts` - Handles migration of existing users to add notification
     preferences

3. **Database Queries**
   - `getUsersByPreference()` - Gets users who have enabled notifications for a
     specific post category

## Testing

The notification preferences system includes:

- Integration tests for notification creation
- User interface tests for preference management

## Future Enhancements

Potential future enhancements to the notification system:

- Email notifications
- Push notifications via Firebase Cloud Messaging
- Time-based notification settings (e.g., quiet hours)
- Notification digests (daily/weekly summaries)
