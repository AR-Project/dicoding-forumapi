exports.up = (pgm) => {
  pgm.addConstraint('replies', 'fk_replies.owner__user.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_comments.comment_id__comments.id', 'FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('replies', 'fk_replies.owner__user.id');
  pgm.dropConstraint('replies', 'fk_comments.comment_id__comments.id');
};
