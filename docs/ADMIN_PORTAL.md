# OnTheBell Admin Portal

The OnTheBell Admin Portal provides comprehensive content moderation and user
management capabilities for administrators and moderators.

## Features

### 🎯 Dashboard

- Real-time statistics on users, posts, and reports
- Activity feed showing recent moderation actions
- Key metrics and growth indicators

### 📝 Posts Management

- View all community posts with filtering and search
- Hide/show posts with moderation notes
- Delete inappropriate content
- Bulk actions for efficient moderation

### 👥 Users Management

- View all users with role and verification status
- Suspend/unsuspend users with reasons
- Change user roles and permissions
- View user activity and history

### 🚩 Reports Management

- Review content reports from community members
- Take moderation actions (hide, delete, warn, suspend)
- Track resolution status and moderator notes
- Comprehensive reporting reasons and custom descriptions

## Role-Based Access Control

### User Roles

- **User**: Regular community member
- **Moderator**: Can moderate content and manage reports
- **Admin**: Full access including user management
- **Super Admin**: All permissions including system management

### Permissions

- `manage_posts`: Create, edit, hide, and delete posts
- `manage_users`: View users, change roles, suspend accounts
- `manage_reports`: Review and resolve content reports
- `manage_events`: Moderate community events
- `manage_businesses`: Moderate business listings
- `view_analytics`: Access dashboard and analytics
- `manage_moderators`: Assign moderator roles

## API Endpoints

### Admin Dashboard

```
GET /api/admin/dashboard
```

Returns comprehensive statistics and recent activity.

### Posts Management

```
GET /api/admin/posts
POST /api/admin/posts (bulk actions)
```

### Users Management

```
GET /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Reports Management

```
GET /api/admin/reports
PUT /api/admin/reports/:id/resolve
```

### Content Reporting

```
POST /api/report
```

Allows users to report inappropriate content.

## Setup and Configuration

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# OR
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI for content moderation (optional)
OPENAI_API_KEY=your_openai_api_key
MODERATION_ENABLED=true
```

### 2. Firebase Setup

1. Enable Firebase Admin SDK in your project
2. Create a service account with Firestore permissions
3. Download the service account key
4. Add the key to environment variables

### 3. Firestore Security Rules

Ensure your Firestore rules allow admin operations:

```javascript
// Admin operations
allow read, write: if request.auth != null &&
  resource.data.role in ['admin', 'super_admin'];

// Report submissions
allow create: if request.auth != null &&
  request.auth.uid == resource.data.reporterId;
```

### 4. User Role Assignment

Assign initial admin roles in Firestore:

```javascript
// In Firestore Console or admin script
await firestore
  .collection('users')
  .doc(userId)
  .update({
    role: 'admin',
    permissions: [
      'manage_posts',
      'manage_users',
      'manage_reports',
      'view_analytics',
    ],
  });
```

## Usage

### Accessing the Admin Portal

1. Navigate to `/admin` (requires admin role)
2. Dashboard shows overview of community activity
3. Use sidebar navigation to access different sections

### Content Moderation Workflow

1. **Reports**: Users report inappropriate content
2. **Review**: Admins review reports in `/admin/reports`
3. **Action**: Take appropriate moderation action
4. **Resolution**: Report marked as resolved with notes

### User Management

1. **View Users**: Browse all users with filters
2. **Role Management**: Assign roles and permissions
3. **Suspensions**: Temporarily suspend users with reasons
4. **Activity**: Track user actions and history

## Components

### Admin Layout (`AdminLayout.tsx`)

- Sidebar navigation with role-based visibility
- User menu with logout functionality
- Responsive design for mobile/desktop

### Dashboard (`AdminDashboard.tsx`)

- Statistics cards with trend indicators
- Activity feed showing recent actions
- Quick access to pending items

### Posts Management (`AdminPosts.tsx`)

- Searchable and filterable post list
- Inline moderation actions
- Bulk operations for efficiency

### Users Management (`AdminUsers.tsx`)

- User search and filtering
- Role assignment interface
- Suspension management

### Reports Management (`AdminReports.tsx`)

- Report review interface
- Moderation action selection
- Resolution tracking

### Content Reporting (`ReportModal.tsx`, `ReportButton.tsx`)

- User-friendly reporting interface
- Multiple report categories
- Custom reason input

## Security Considerations

### Authentication

- Firebase ID token verification required
- Admin role validation on every request
- Secure token transmission

### Authorization

- Role-based access control (RBAC)
- Permission checking at component and API level
- Principle of least privilege

### Data Protection

- Sanitized user data display
- Secure admin activity logging
- Audit trails for all actions

### API Security

- Request validation and sanitization
- Rate limiting on report submissions
- Error handling without information leakage

## Development

### Testing

```bash
# Run admin portal tests
npm run test -- --testPathPattern=admin

# Test role-based access
npm run test -- useAdmin.test.ts
```

### Local Development

```bash
# Start with admin portal enabled
npm run dev

# Access admin portal
open http://localhost:3000/admin
```

### Building for Production

```bash
# Build with admin features
npm run build

# Verify admin routes are protected
npm run start
```

## Troubleshooting

### Common Issues

1. **"Admin access required" error**

   - Check user role in Firestore
   - Verify Firebase Admin SDK configuration
   - Ensure proper authentication headers

2. **Reports not loading**

   - Check Firestore permissions
   - Verify report collection structure
   - Review console for API errors

3. **Statistics not updating**
   - Check Firestore query limits
   - Verify date range calculations
   - Review dashboard API response

### Debug Mode

Enable debug logging:

```javascript
// In admin hooks
const DEBUG_MODE = process.env.NODE_ENV === 'development';
if (DEBUG_MODE) console.log('Admin operation:', data);
```

## Contributing

When adding new admin features:

1. Update types in `src/types/index.ts`
2. Add API endpoints in `src/app/api/admin/`
3. Create/update components in `src/components/admin/`
4. Add tests for new functionality
5. Update this documentation

## License

This admin portal is part of the OnTheBell platform and follows the same
licensing terms.
