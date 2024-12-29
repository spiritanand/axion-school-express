const jwt = require("jsonwebtoken");
const config = require("../config/index.config.js");

const ROLES = {
  SUPERADMIN: "superadmin",
  SCHOOL_ADMIN: "school_admin",
};

const PERMISSIONS = {
  SCHOOL: {
    CREATE: "school:create",
    READ: "school:read",
    UPDATE: "school:update",
    DELETE: "school:delete",
  },
  CLASSROOM: {
    CREATE: "classroom:create",
    READ: "classroom:read",
    UPDATE: "classroom:update",
    DELETE: "classroom:delete",
  },
  STUDENT: {
    CREATE: "student:create",
    READ: "student:read",
    UPDATE: "student:update",
    DELETE: "student:delete",
  },
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: Object.values(PERMISSIONS.SCHOOL)
    .concat(Object.values(PERMISSIONS.CLASSROOM))
    .concat(Object.values(PERMISSIONS.STUDENT)),
  [ROLES.SCHOOL_ADMIN]: Object.values(PERMISSIONS.CLASSROOM)
    .concat(Object.values(PERMISSIONS.STUDENT))
    .concat([PERMISSIONS.SCHOOL.READ]),
};

function hasPermission(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

async function rbacMiddleware(permission) {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(token, config.dotEnv.JWT_SECRET);
      const userRole = decoded.role;
      const schoolId = decoded.schoolId;

      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      // Add user info to request for downstream use
      req.user = {
        id: decoded.id,
        role: userRole,
        schoolId,
      };

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }
      next(error);
    }
  };
}

module.exports = {
  rbacMiddleware,
  ROLES,
  PERMISSIONS,
};
