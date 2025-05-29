import { uploadFile, getFileUrl, deleteFile } from '../storage';
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn().mockResolvedValue({}),
  getDownloadURL: jest.fn().mockResolvedValue('https://example.com/file.jpg'),
  deleteObject: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../config', () => ({ storage: {} }));

describe('Firebase Storage', () => {
  it('uploads a file', async () => {
    const file = new File(['data'], 'test.jpg');
    const url = await uploadFile(file, 'test.jpg');
    expect(url).toBe('https://example.com/file.jpg');
  });

  it('gets file URL', async () => {
    const url = await getFileUrl('test.jpg');
    expect(url).toBe('https://example.com/file.jpg');
  });

  it('deletes a file', async () => {
    await expect(deleteFile('test.jpg')).resolves.toBeUndefined();
  });
});
