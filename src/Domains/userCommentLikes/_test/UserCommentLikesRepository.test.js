const UserCommentLikesRepository = require('../UserCommentLikesRepository');

describe('UserCommentLikesRepository interface', () => {
  it('should throw error when ivoked abstract behavior', async () => {
    // Arrange
    const userCommentLikesRepository = new UserCommentLikesRepository();

    // Action and assert
    await expect(userCommentLikesRepository.currentLikeStatus('')).rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikesRepository.addLike('')).rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikesRepository.removeLike('')).rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(userCommentLikesRepository.getLikesNumberByCommentIds([])).rejects
      .toThrowError('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
