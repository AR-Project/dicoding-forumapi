class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(parameter) {
    // Verify Parameter
    if (!parameter) {
      throw new Error('GET_THREAD_USECASE.MISSING_PARAMS');
    }
    // Verify thread
    await this._threadRepository.verifyThread(parameter);

    // Fetch Thread
    const thread = await this._threadRepository.getThread(parameter);

    // Fetch All Comment using parameter: threadId
    const rawComments = await this._commentRepository.getAllCommentsByThreadId(parameter);

    // Sanitize Comment
    thread.comments = this._sanitizeComments(rawComments);

    // Iterate every comment
    for (let i = 0; i < thread.comments.length; i += 1) {
      // Fetch All Replies using parameter: current threadId
      // eslint-disable-next-line no-await-in-loop
      const rawReplies = await this._replyRepository
        .getAllRepliesByCommentId(thread.comments[i].id);

      // Sanitize Replies and store into EACH comments
      thread.comments[i].replies = this._sanitizeReplies(rawReplies);
    }

    return thread;
  }

  _sanitizeComments(comments) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }

  _sanitizeReplies(replies) {
    return replies.map((reply) => ({
      id: reply.id,
      username: reply.username,
      date: reply.date,
      content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
    }));
  }
}

module.exports = GetThreadUseCase;
