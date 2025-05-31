import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './config';
import { User } from '@/types';

/**
 * Migrate existing users to have default notification preferences
 * This should be run once as part of the application startup or as an admin function
 */
export async function migrateUsersNotificationPreferences(): Promise<{
  migratedCount: number;
  totalChecked: number;
  hadMigration: boolean;
}> {
  try {
    console.log('Starting user notification preferences migration...');

    // Get all users without notification preferences
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersToMigrate: User[] = [];

    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data() as User;
      if (!userData.notificationPreferences) {
        usersToMigrate.push({
          ...userData,
          id: userDoc.id, // Set the id from the document
        });
      }
    });

    if (usersToMigrate.length === 0) {
      console.log('No users need migration for notification preferences');
      return {
        migratedCount: 0,
        totalChecked: usersSnapshot.size,
        hadMigration: false,
      };
    }

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    // Use batched writes for better performance
    const batchSize = 500; // Firestore limit is 500 operations per batch
    let batchCount = 0;
    let migratedCount = 0;

    for (let i = 0; i < usersToMigrate.length; i += batchSize) {
      const batch = writeBatch(db);
      const usersChunk = usersToMigrate.slice(i, i + batchSize);

      usersChunk.forEach(user => {
        const userRef = doc(db, 'users', user.id);

        batch.update(userRef, {
          notificationPreferences: {
            newPosts: {
              deals: true,
              events: true,
              marketplace: true,
              free_items: true,
              help_requests: true,
              community: true,
              food: true,
              services: true,
            },
            likes: true,
            comments: true,
            follows: true,
          },
        });
      });

      await batch.commit();
      batchCount++;
      migratedCount += usersChunk.length;
      console.log(
        `Batch ${batchCount} completed. Migrated ${migratedCount}/${usersToMigrate.length} users`
      );
    }

    console.log('User notification preferences migration completed successfully');

    return {
      migratedCount,
      totalChecked: usersSnapshot.size,
      hadMigration: true,
    };
  } catch (error) {
    console.error('Error migrating user notification preferences:', error);
    throw error;
  }
}
