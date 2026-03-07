const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`RBAC: User ${req.user.userId || req.user.id} with role '${req.user.role}' denied access to ${req.originalUrl}`);
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
