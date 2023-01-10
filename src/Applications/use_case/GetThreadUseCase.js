class GetThreadUseCase {
  constructor({threadRepository, commentRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(parameter) {
    if (!parameter) {
      throw new Error('GET_THREAD_USECASE.MISSING_PARAMS')
    }

    await this._threadRepository.verifyThread(parameter);
    const thread = await this._threadRepository.getThread(parameter);
    const rawComments = await this._commentRepository.getAllCommentsByThreadId(parameter);
    thread.comments = this._sanitizeComments(rawComments);

    return thread
  }

  _sanitizeComments(comments) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }
}

module.exports = GetThreadUseCase;
