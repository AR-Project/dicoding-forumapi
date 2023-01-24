exports.up = (pgm) => {
  pgm.addConstraint('comments', 'fk_comments.owner_user.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('comments', 'fk_comments.thread_id__threads.id', 'FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'fk_comments.thread_id__threads.id');
  pgm.dropConstraint('comments', 'fk_comments.owner_user.id');
};
