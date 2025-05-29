import { verifyAddress, requestVerification } from '../verification';

// Mock the firebase/firestore module with proper Timestamp mock
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  setDoc: jest.fn().mockResolvedValue(undefined),
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: 'mock-id' }),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
  Timestamp: {
    fromDate: jest.fn(date => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

jest.mock('../config', () => ({ db: {} }));

describe('Verification', () => {
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
});
