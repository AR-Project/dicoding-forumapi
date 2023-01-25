const CommentLikeHandler = require('./handler');
const routes = require('./route');

module.exports = {
  name: 'commentLikes',
  register: async (server, { container }) => {
    const commentLikeHandler = new CommentLikeHandler(container);
    server.route(routes(commentLikeHandler));
  },
};
