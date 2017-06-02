function authChecker (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403).json({message: 'Unauthorized'});
}

module.exports = authChecker;
