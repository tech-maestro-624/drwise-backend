// middlewares/authMiddleware.js
const User = require('../models/User')

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  

  // middlewares/authMiddleware.js

// exports.checkRoleOrPermission = (requiredPermissions) => {
//   return (req, res, next) => {
//     if (!req.isAuthenticated()) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const userRoles = req?.user?.roles?.map(role => role.name);
//     const userRolePermissions = req?.user?.roles?.flatMap(role => role?.permissions.map(permission => permission.name));
//     const userDirectPermissions = req?.user?.permissions.map(permission => permission.name);

//     // Combine role-based and direct permissions
//     const userPermissions = new Set([...userRolePermissions, ...userDirectPermissions]);

//     const hasPermission = requiredPermissions.some(permission => userPermissions.has(permission) || userRoles.includes(permission));

//     if (hasPermission) {
//       return next();
//     }

//     return res.status(403).json({ message: 'Forbidden' });
//   };
// };

exports.checkRoleOrPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate('roles').populate('permissions');
      const userPermissions = user.permissions;
      // Check direct permissions
      if (userPermissions.some((perm) => perm.name === permission)) {
        return next();
      }

      // Check role-based permissions
      const roles = user.roles;
      for (const role of roles) {
        const roleWithPermissions = await role.populate('permissions');
        if (roleWithPermissions.permissions.some((perm) => perm.name === permission)) {
          return next();
        }
      }
      return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
      console.log(err)

      return res.status(500).json({ message: 'Server Error' });
    }
  };
};

  