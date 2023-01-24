exports.up = (pgm) => {
  pgm.addConstraint('threads', 'fk_threads.owner_user.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('threads', 'fk_threads.owner_user.id');
};
