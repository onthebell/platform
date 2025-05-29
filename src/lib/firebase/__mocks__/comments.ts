// Mock firebase/comments.ts
export const getPostCommentCount = jest.fn().mockResolvedValue(5);
export const getPostComments = jest.fn().mockResolvedValue([]);
export const addComment = jest.fn().mockResolvedValue('new-comment-id');
export const updateComment = jest.fn().mockResolvedValue(undefined);
export const deleteComment = jest.fn().mockResolvedValue(undefined);
export const getComment = jest.fn().mockResolvedValue(null);
