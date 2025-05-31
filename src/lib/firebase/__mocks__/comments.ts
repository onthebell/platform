// Mock firebase/comments.ts
export const getPostCommentCount = jest.fn().mockResolvedValue(5);
export const getPostComments = jest.fn().mockResolvedValue([]);
export const addComment = jest.fn().mockResolvedValue('new-comment-id');
export const updateComment = jest.fn().mockResolvedValue(undefined);
export const deleteComment = jest.fn().mockResolvedValue(undefined);
export const getComment = jest.fn().mockResolvedValue(null);

// Real-time subscription mocks
export const subscribeToPostComments = jest.fn().mockImplementation((postId, callback) => {
  // Simulate real-time subscription by calling callback with mock data
  setTimeout(() => {
    callback([]);
  }, 0);
  // Return unsubscribe function
  return jest.fn();
});

export const subscribeToPostCommentCount = jest.fn().mockImplementation((postId, callback) => {
  // Simulate real-time subscription by calling callback with mock data
  setTimeout(() => {
    callback(0);
  }, 0);
  // Return unsubscribe function
  return jest.fn();
});
