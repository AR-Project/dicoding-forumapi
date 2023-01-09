const Comment = require('../../Domains/comments/entitites/Comment')
const AddedComment = require('../../Domains/comments/entitites/AddedComment')

class AddCommentUseCase {
  constructor({commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;

  }

  async execute(useCasePayload, ownerId, threadId) {
    // verify parameter recieved
    this._verifyParameter(ownerId, threadId);

    // verify thread existence using threadRepository method
    await this._threadRepository.verifyThread(threadId);

    // No need to verify payload here since, gonna be sanitized 
    // inside Comment entity.
    const newComment = new Comment({content: useCasePayload.content, owner: ownerId, threadId})

    // Finally invoke add comment and expect AddedComment in return
    return this._commentRepository.addComment(newComment);
  }

  _verifyParameter(ownerId, threadId) {
    if (!ownerId) {
      throw new Error('ADD_COMMENT_USECASE.MISSING_OWNER_ID_PARAM')
    }
    if (!threadId) {
      throw new Error('ADD_COMMENT_USECASE.MISSING_THREAD_ID_PARAM')
    }
  }
}

module.exports = AddCommentUseCase;
