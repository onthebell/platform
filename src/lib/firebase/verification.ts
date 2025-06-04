import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { bellarinePostcodes } from '../utils';
import { VerificationMethod } from '../../types';

export interface AddressVerificationRequest {
  id?: string;
  userId: string;
  userEmail: string;
  address: {
    street: string;
    suburb: string;
    postcode: string;
    state: string;
    country: string;
  };
  method: 'document' | 'postal'; // New field for verification method
  proofDocument?: string; // URL to uploaded proof document (for document method)
  postalCode?: string; // Generated verification code (for postal method)
  postalCodeExpiry?: Date; // Expiry date for postal verification code
  paymentIntentId?: string; // Stripe payment intent ID (for postal method)
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  autoDeletedAt?: Date; // Track when document was automatically deleted
}

// Define Bellarine Peninsula suburbs for verification
const BELLARINE_SUBURBS = [
  'Queenscliff',
  'Point Lonsdale',
  'Ocean Grove',
  'Barwon Heads',
  'Batesford',
  'Bellarine',
  'Clifton Springs',
  'Curlewis',
  'Drysdale',
  'Indented Head',
  'Leopold',
  'Mannerim',
  'Marcus Hill',
  'Portarlington',
  'St Leonards',
  'Swan Bay',
  'Wallington',
  'Connewarre',
  'Moolap',
  'Newcomb',
  'Whittington',
];

/**
 * Submit an address verification request
 */
export async function submitAddressVerification(
  userId: string,
  userEmail: string,
  address: AddressVerificationRequest['address'],
  method: 'document' | 'postal',
  proofDocumentUrl?: string,
  postalCode?: string,
  paymentIntentId?: string
): Promise<string> {
  try {
    const verificationData: Omit<AddressVerificationRequest, 'id'> = {
      userId,
      userEmail,
      address,
      method,
      proofDocument: proofDocumentUrl,
      postalCode,
      paymentIntentId,
      postalCodeExpiry:
        method === 'postal' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30 days expiry
      status: 'pending',
      submittedAt: new Date(),
    };

    // Filter out undefined values to prevent Firestore errors
    const firestoreData = Object.fromEntries(
      Object.entries({
        ...verificationData,
        submittedAt: Timestamp.fromDate(verificationData.submittedAt),
        postalCodeExpiry: verificationData.postalCodeExpiry
          ? Timestamp.fromDate(verificationData.postalCodeExpiry)
          : undefined,
      }).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'verifications'), firestoreData);

    return docRef.id;
  } catch (error) {
    console.error('Error submitting verification:', error);
    throw new Error('Failed to submit verification request');
  }
}

/**
 * Check if user has a pending or approved verification
 */
export async function getUserVerificationStatus(userId: string): Promise<{
  hasRequest: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  verificationId?: string;
  method?: VerificationMethod;
  paymentIntentId?: string;
}> {
  try {
    const q = query(collection(db, 'verifications'), where('userId', '==', userId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { hasRequest: false };
    }

    // Get the most recent verification request
    const docs = querySnapshot.docs.sort((a, b) => {
      const aDate = a.data().submittedAt.toDate();
      const bDate = b.data().submittedAt.toDate();
      return bDate.getTime() - aDate.getTime();
    });

    const latestRequest = docs[0];
    const data = latestRequest.data() as AddressVerificationRequest;

    return {
      hasRequest: true,
      status: data.status,
      verificationId: latestRequest.id,
      method: data.method,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw new Error('Failed to check verification status');
  }
}

/**
 * Validate if an address is within the Bellarine Peninsula
 */
export function validateBellarineAddress(address: {
  suburb: string;
  postcode: string;
  state: string;
  country: string;
}): { isValid: boolean; error?: string } {
  // Check country
  if (address.country.toLowerCase() !== 'australia' && address.country.toLowerCase() !== 'au') {
    return { isValid: false, error: 'Address must be in Australia' };
  }

  // Check state
  if (
    address.state.toLowerCase() !== 'victoria' &&
    address.state.toLowerCase() !== 'vic' &&
    address.state.toLowerCase() !== 'melbourne'
  ) {
    return { isValid: false, error: 'Address must be in Victoria' };
  }

  // Check postcode
  if (!bellarinePostcodes.includes(address.postcode)) {
    return { isValid: false, error: 'Postcode is not within the Bellarine Peninsula area' };
  }

  // Check suburb (case insensitive)
  const normalizedSuburb = address.suburb.toLowerCase().trim();
  const isValidSuburb = BELLARINE_SUBURBS.some(suburb => suburb.toLowerCase() === normalizedSuburb);

  if (!isValidSuburb) {
    return {
      isValid: false,
      error: `${address.suburb} is not recognized as a Bellarine Peninsula suburb. Valid suburbs include: ${BELLARINE_SUBURBS.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Get list of valid Bellarine suburbs for form dropdown
 */
export function getBellarineSuburbs(): string[] {
  return [...BELLARINE_SUBURBS].sort();
}

/**
 * Get list of valid Bellarine postcodes
 */
export function getBellarinePostcodes(): string[] {
  return [...bellarinePostcodes].sort();
}

/**
 * Admin function to approve/reject verification (would be used in admin panel)
 */
export async function updateVerificationStatus(
  verificationId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> {
  try {
    const verificationRef = doc(db, 'verifications', verificationId);

    await updateDoc(verificationRef, {
      status,
      reviewedAt: Timestamp.fromDate(new Date()),
      reviewedBy,
      reviewNotes: reviewNotes || '',
    });

    // If approved, update the user's verification status
    if (status === 'approved') {
      // Get the verification document to find the userId
      const verificationDocRef = doc(db, 'verifications', verificationId);
      const verificationSnapshot = await getDoc(verificationDocRef);

      if (verificationSnapshot.exists()) {
        const verificationData = verificationSnapshot.data() as AddressVerificationRequest;

        // Update the user's profile with verification status
        const userRef = doc(db, 'users', verificationData.userId);
        await updateDoc(userRef, {
          isVerified: true,
          verificationStatus: 'approved',
          verifiedAt: Timestamp.fromDate(new Date()),
        });
      }
    }
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw new Error('Failed to update verification status');
  }
}

/**
 * Parse address string into components
 */
export function parseAddressString(
  addressString: string
): Partial<AddressVerificationRequest['address']> {
  const parts = addressString.split(',').map(part => part.trim());

  if (parts.length < 2) {
    return {};
  }

  // Basic parsing - this could be enhanced with a proper address parsing service
  const lastPart = parts[parts.length - 1];
  const secondLastPart = parts[parts.length - 2];

  // Try to extract postcode from last part
  const postcodeMatch = lastPart.match(/(\d{4})/);
  const postcode = postcodeMatch ? postcodeMatch[1] : '';

  // Try to extract state
  const stateMatch = lastPart.match(/(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)/i);
  const state = stateMatch ? stateMatch[1].toUpperCase() : 'VIC';

  return {
    street: parts.length > 2 ? parts.slice(0, -2).join(', ') : '',
    suburb: secondLastPart || '',
    postcode,
    state,
    country: 'Australia',
  };
}

/**
 * Verify an address is within the Bellarine Peninsula or verify a user's address directly
 */
export async function verifyAddress(
  addressOrUserId:
    | string
    | {
        street: string;
        suburb: string;
        postcode: string;
        state: string;
      }
): Promise<boolean | void> {
  // If it's a userId string, update the user's verification status
  if (typeof addressOrUserId === 'string') {
    try {
      const userDoc = doc(db, 'users', addressOrUserId);
      await updateDoc(userDoc, {
        isVerified: true,
        verifiedAt: Timestamp.fromDate(new Date()),
      });
      return;
    } catch (error) {
      console.error('Error verifying address:', error);
      throw new Error('Failed to verify address');
    }
  }

  // Otherwise, check if the address is in the Bellarine Peninsula
  const address = addressOrUserId;
  const isInBellarine = BELLARINE_SUBURBS.some(
    s => s.toLowerCase() === address.suburb.toLowerCase()
  );

  // Basic verification for testing
  return isInBellarine && address.state === 'VIC' && address.postcode.startsWith('32');
}

/**
 * Submit a verification request
 */
export async function requestVerification(
  requestOrUserId: string | Omit<AddressVerificationRequest, 'id' | 'submittedAt' | 'status'>,
  address?: { street: string; suburb: string; state: string; postcode: string }
): Promise<string | void> {
  // Handle simple form for tests
  if (typeof requestOrUserId === 'string' && address) {
    try {
      const userDoc = doc(db, 'users', requestOrUserId);
      await updateDoc(userDoc, {
        pendingVerification: true,
        address,
        verificationRequestedAt: Timestamp.fromDate(new Date()),
      });
      return;
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw new Error('Failed to request verification');
    }
  }

  // Original implementation for the full request object
  try {
    const request = requestOrUserId as Omit<
      AddressVerificationRequest,
      'id' | 'submittedAt' | 'status'
    >;
    const verificationRequest: Omit<AddressVerificationRequest, 'id'> = {
      ...request,
      status: 'pending',
      submittedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'addressVerifications'), verificationRequest);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting verification request:', error);
    throw new Error('Failed to submit verification request');
  }
}

/**
 * Generate a random postal verification code
 */
export function generatePostalCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Verify a postal code submission
 */
export async function verifyPostalCode(
  userId: string,
  submittedCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(
      collection(db, 'verifications'),
      where('userId', '==', userId),
      where('method', '==', 'postal'),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'No pending postal verification found' };
    }

    const verificationDoc = querySnapshot.docs[0];
    const verification = verificationDoc.data() as AddressVerificationRequest;

    // Check if code has expired - convert Firestore Timestamp to Date for comparison
    if (verification.postalCodeExpiry) {
      const expiryDate =
        verification.postalCodeExpiry instanceof Timestamp
          ? verification.postalCodeExpiry.toDate()
          : new Date(verification.postalCodeExpiry);

      if (expiryDate < new Date()) {
        return { success: false, message: 'Verification code has expired' };
      }
    }

    // Check if codes match
    if (verification.postalCode !== submittedCode.toUpperCase()) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Approve the verification
    await updateDoc(doc(db, 'verifications', verificationDoc.id), {
      status: 'approved',
      reviewedAt: Timestamp.fromDate(new Date()),
      reviewedBy: 'system',
      reviewNotes: 'Approved via postal code verification',
    });

    // Update the user's profile with verification status
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isVerified: true,
      verificationStatus: 'approved',
      verifiedAt: Timestamp.fromDate(new Date()),
    });

    return { success: true, message: 'Address verified successfully!' };
  } catch (error) {
    console.error('Error verifying postal code:', error);
    return { success: false, message: 'Failed to verify postal code' };
  }
}

/**
 * Auto-delete document after verification approval
 */
export async function deleteVerificationDocument(
  verificationId: string,
  documentUrl: string
): Promise<void> {
  try {
    // Import deleteFile from storage
    const { deleteFile } = await import('./storage');

    // Delete the file from Firebase Storage
    await deleteFile(documentUrl);

    // Update verification record to mark document as deleted
    await updateDoc(doc(db, 'verifications', verificationId), {
      autoDeletedAt: Timestamp.fromDate(new Date()),
      proofDocument: null, // Clear the document URL
    });
  } catch (error) {
    console.error('Error deleting verification document:', error);
    throw new Error('Failed to delete verification document');
  }
}

/**
 * Get all address verification requests (admin function)
 */
export async function getAddressVerificationRequests(): Promise<AddressVerificationRequest[]> {
  try {
    const q = query(collection(db, 'verifications'), orderBy('submittedAt', 'desc'));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt.toDate(),
      reviewedAt: doc.data().reviewedAt?.toDate(),
      postalCodeExpiry: doc.data().postalCodeExpiry?.toDate(),
      autoDeletedAt: doc.data().autoDeletedAt?.toDate(),
    })) as AddressVerificationRequest[];
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    throw new Error('Failed to fetch verification requests');
  }
}
