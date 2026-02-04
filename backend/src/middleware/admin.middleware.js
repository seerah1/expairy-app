/**
 * Admin role middleware
 * Checks if authenticated user has admin role
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Authentication required',
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Admin access required',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = adminMiddleware;
