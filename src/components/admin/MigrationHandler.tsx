'use client';

import { useEffect, useState, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdmin';
import { migrateUsersNotificationPreferences } from '@/lib/firebase/migrateUsers';

type MigrationStatus = 'idle' | 'running' | 'completed' | 'error';

/**
 * Component to handle user data migrations.
 * This should be placed in the application once, preferably in a layout or admin page.
 * Uses localStorage to prevent re-running migrations across sessions.
 */
export default function MigrationHandler() {
  const { user, isAdmin } = useAdminAuth();
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [migrationResult, setMigrationResult] = useState<{
    migratedCount: number;
    totalChecked: number;
    hadMigration: boolean;
  } | null>(null);

  // Use useRef to track if migration has been attempted in this component instance
  const migrationAttempted = useRef(false);
  const isRunning = useRef(false);

  // Check if migration was already completed in this browser session
  const getMigrationKey = () => 'onthebell_migration_notification_preferences_completed';

  const wasMigrationCompleted = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(getMigrationKey()) === 'true';
    }
    return false;
  };

  const markMigrationCompleted = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getMigrationKey(), 'true');
    }
  };

  useEffect(() => {
    // Only run migrations if:
    // 1. User is an admin
    // 2. Migration hasn't been attempted yet in this component instance
    // 3. Migration wasn't already completed (persisted in localStorage)
    // 4. Not currently running
    if (
      user &&
      isAdmin &&
      !migrationAttempted.current &&
      !wasMigrationCompleted() &&
      !isRunning.current
    ) {
      migrationAttempted.current = true; // Mark as attempted immediately
      isRunning.current = true; // Prevent concurrent runs

      const runMigrations = async () => {
        try {
          setMigrationStatus('running');
          console.log('Running user migrations as admin...');

          const result = await migrateUsersNotificationPreferences();

          setMigrationResult(result);
          setMigrationStatus('completed');
          markMigrationCompleted(); // Persist completion state
          console.log(`Migration completed. ${result.migratedCount} users migrated.`);
        } catch (error) {
          console.error('Error running migrations:', error);
          setMigrationStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
          migrationAttempted.current = false; // Allow retry on error
        } finally {
          isRunning.current = false;
        }
      };

      runMigrations();
    } else if (user && isAdmin && wasMigrationCompleted()) {
      // Show completed state if migration was already done
      setMigrationStatus('completed');
      setMigrationResult({
        migratedCount: 0,
        totalChecked: 0,
        hadMigration: false,
      });
    }
  }, [user, isAdmin]);

  // Don't render anything if not an admin
  if (!user || !isAdmin) {
    return null;
  }

  // Render migration status
  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">System Migrations</h3>

      {migrationStatus === 'idle' && (
        <div className="flex items-center text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3"></div>
          Waiting to run migrations...
        </div>
      )}

      {migrationStatus === 'running' && (
        <div className="flex items-center text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          Running notification preferences migration...
        </div>
      )}

      {migrationStatus === 'completed' && migrationResult && (
        <div className="flex items-center text-green-600">
          <div className="w-4 h-4 bg-green-600 rounded-full mr-3 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {wasMigrationCompleted() ? (
            <span>Migration was previously completed and cached.</span>
          ) : migrationResult.hadMigration ? (
            <span>
              Migration completed successfully! {migrationResult.migratedCount} users updated out of{' '}
              {migrationResult.totalChecked} checked.
            </span>
          ) : (
            <span>
              Migration check completed. All {migrationResult.totalChecked} users already have
              notification preferences.
            </span>
          )}
        </div>
      )}

      {migrationStatus === 'error' && (
        <div className="text-red-600">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-red-600 rounded-full mr-3 flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Migration failed
          </div>
          <p className="text-sm text-red-700 ml-7">{errorMessage}</p>
        </div>
      )}

      {/* Development reset button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem(getMigrationKey());
              setMigrationStatus('idle');
              setMigrationResult(null);
              setErrorMessage('');
              migrationAttempted.current = false;
              isRunning.current = false;
              console.log('Migration state reset');
            }}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
          >
            Reset Migration State (Dev)
          </button>
        </div>
      )}
    </div>
  );
}
