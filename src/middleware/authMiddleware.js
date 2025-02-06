const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT and attach the user object to req.user.
 */
exports.isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Expect header format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: 'Authentication failed - token invalid or expired'
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.userId)
      .populate('roles')
      .populate('permissions');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to check if the authenticated user has the specified permission or role.
 *
 * @param {String} requiredPermission - The permission name required.
 */
exports.checkRoleOrPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Set by isAuthenticated middleware
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Automatically allow if the user has an admin role.
      if (user.roles && user.roles.some(role => role.name.toLowerCase() === 'admin')) {
        return next();
      }

      // Check if the user has the required permission directly.
      if (user.permissions && user.permissions.some(perm => perm.name === requiredPermission)) {
        return next();
      }

      // Check role-based permissions:
      if (user.roles && user.roles.length > 0) {
        for (const role of user.roles) {
          // Populate permissions with only the 'name' field.
          await role.populate({ path: 'permissions', select: 'name' });
          if (role.permissions && role.permissions.some(perm => perm.name === requiredPermission)) {
            return next();
          }
        }
      }

      return res.status(403).json({ message: 'Forbidden' });
    } catch (error) {
      console.error('Role/Permission Check Error:', error);
      return res.status(500).json({ message: 'Server Error' });
    }
  };
};

