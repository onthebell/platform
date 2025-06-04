import {
  verifyAddress,
  requestVerification,
  updateVerificationStatus,
  verifyPostalCode,
} from '../verification';

// Mock the firebase/firestore module with proper Timestamp mock
jest.mock('firebase/firestore', () => {
  const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
  const mockGetDoc = jest.fn();
  const mockGetDocs = jest.fn();

  // Create mock document reference
  const createMockDocRef = (collection: string, id: string) => ({
    id,
    path: `${collection}/${id}`,
    collection,
    _type: 'DocumentReference',
  });

  const mockDoc = jest.fn((db, collection, id) => createMockDocRef(collection, id));

  // Create a proper Timestamp class mock
  class MockTimestamp {
    constructor(
      public seconds: number,
      public nanoseconds: number
    ) {}

    toDate() {
      return new Date(this.seconds * 1000);
    }

    static fromDate(date: Date) {
      return new MockTimestamp(Math.floor(date.getTime() / 1000), 0);
    }
  }

  return {
    doc: mockDoc,
    updateDoc: mockUpdateDoc,
    setDoc: jest.fn().mockResolvedValue(undefined),
    collection: jest.fn(),
    addDoc: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: mockGetDocs,
    getDoc: mockGetDoc,
    Timestamp: MockTimestamp,
  };
});

jest.mock('../config', () => ({ db: {} }));

// Get the mocked functions for use in tests
const {
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
} = jest.requireMock('firebase/firestore');

describe('Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests verification', async () => {
    await expect(
      requestVerification('user123', {
        street: '1 Test St',
        suburb: 'Testurb',
        state: 'VIC',
        postcode: '3122',
      })
    ).resolves.toBeUndefined();
  });

  it('verifies address', async () => {
    await expect(verifyAddress('user123')).resolves.toBeUndefined();
  });

  describe('updateVerificationStatus', () => {
    it('should update user profile when verification is approved', async () => {
      // Mock verification document
      const mockVerificationData = {
        userId: 'user123',
        address: {
          street: '1 Test St',
          suburb: 'Torquay',
          state: 'VIC',
          postcode: '3228',
        },
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockVerificationData,
      });

      await updateVerificationStatus(
        'verification123',
        'approved',
        'admin@test.com',
        'Approved by admin'
      );

      // Should update the verification document first
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: 'verification123',
          path: 'verifications/verification123',
          collection: 'verifications',
        }),
        expect.objectContaining({
          status: 'approved',
          reviewedBy: 'admin@test.com',
          reviewNotes: 'Approved by admin',
          reviewedAt: expect.anything(),
        })
      );

      // Should update the user profile second
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          id: 'user123',
          path: 'users/user123',
          collection: 'users',
        }),
        expect.objectContaining({
          isVerified: true,
          verificationStatus: 'approved',
          verifiedAt: expect.anything(),
        })
      );
    });

    it('should not update user profile when verification is rejected', async () => {
      const mockVerificationData = {
        userId: 'user123',
        address: {
          street: '1 Test St',
          suburb: 'Torquay',
          state: 'VIC',
          postcode: '3228',
        },
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockVerificationData,
      });

      await updateVerificationStatus(
        'verification123',
        'rejected',
        'admin@test.com',
        'Rejected by admin'
      );

      // Should update the verification document
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'rejected',
          reviewedBy: 'admin@test.com',
          reviewNotes: 'Rejected by admin',
          reviewedAt: expect.anything(),
        })
      );

      // Should only call updateDoc once for the verification document, not for user profile
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyPostalCode', () => {
    it('should update user profile when postal code verification succeeds', async () => {
      const mockVerificationDoc = {
        id: 'verification123',
        data: () => ({
          userId: 'user123',
          postalCode: 'ABC123',
          postalCodeExpiry: new (jest.requireMock('firebase/firestore').Timestamp)(
            Math.floor((Date.now() + 1000 * 60 * 60) / 1000), // 1 hour from now
            0
          ),
        }),
      };

      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockVerificationDoc],
      });

      const result = await verifyPostalCode('user123', 'ABC123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Address verified successfully!');

      // Should update the verification document first
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({
          status: 'approved',
          reviewedBy: 'system',
          reviewNotes: 'Approved via postal code verification',
          reviewedAt: expect.anything(),
        })
      );

      // Should update the user profile second
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          isVerified: true,
          verificationStatus: 'approved',
          verifiedAt: expect.anything(),
        })
      );
    });

    it('should not update user profile when postal code is incorrect', async () => {
      const mockVerificationDoc = {
        id: 'verification123',
        data: () => ({
          userId: 'user123',
          postalCode: 'ABC123',
          postalCodeExpiry: new (jest.requireMock('firebase/firestore').Timestamp)(
            Math.floor((Date.now() + 1000 * 60 * 60) / 1000), // 1 hour from now
            0
          ),
        }),
      };

      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [mockVerificationDoc],
      });

      const result = await verifyPostalCode('user123', 'WRONG');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid verification code');

      // Should not update any documents
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });
});
