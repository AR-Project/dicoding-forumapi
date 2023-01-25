/* eslint-disable no-unused-vars */
class UserCommentLikesRepository {
  async currentLikeStatus(userId, commentId) {
    throw new Error('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addLike(userId, commentId) {
    throw new Error('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async removeLike(userId, commentId) {
    throw new Error('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getLikesNumberByCommentIds([commentId1, commentId2]) {
    throw new Error('USER_COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = UserCommentLikesRepository;
