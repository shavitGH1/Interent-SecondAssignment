const Session = require('../models/Session');

const authRequired = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await Session.findOne({
    accessToken: token,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  req.user = session.userId;
  req.session = session;
  next();
};

module.exports = { authRequired };
