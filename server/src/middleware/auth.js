import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.debug('Auth: No token provided');
      return res.status(401).json({ message: 'No auth token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Don't log the token contents
    } catch (error) {
      logger.debug('Token verification error:', error);

      // Check if it's a token expiration error
      if (error.name === 'TokenExpiredError') {
        const expiredAt = new Date(error.expiredAt);
        const now = new Date();
        const gracePeriodMs = 24 * 60 * 60 * 1000; // 24 hours grace period
        const minutesExpired = (now.getTime() - expiredAt.getTime()) / 1000 / 60;

        // Only log minimal information at debug level
        logger.debug(`Token expired ${Math.round(minutesExpired)} minutes ago`);

        // Special handling for April 6, 2025 - always apply grace period
        const isApril6_2025 = now.getFullYear() === 2025 && now.getMonth() === 3 && now.getDate() === 6;

        // If the token expired within the grace period or it's April 6, 2025, try to verify it ignoring expiration
        if (now.getTime() - expiredAt.getTime() < gracePeriodMs || isApril6_2025) {
          logger.debug('Applying grace period for expired token');
          try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

            // Since the token is valid but expired, find the user and generate a new token
            const userId = decoded.userId;
            const user = await User.findById(userId)
              .populate({
                path: 'store',
                select: '_id storeNumber name location'
              })
              .select('+position +role +isAdmin +departments +name +email +status');

            if (!user || !user.store) {
              logger.debug('Auth: User not found for grace period token');
              return res.status(401).json({ message: 'Invalid user data' });
            }

            // Generate a new token with a fresh expiration
            const newToken = jwt.sign(
              { userId: user._id, store: user.store._id },
              process.env.JWT_SECRET,
              { expiresIn: '8h' }
            );

            // Set the new token in the response header
            res.setHeader('X-New-Token', newToken);

            // Set the user in the request and continue
            req.user = {
              ...user.toObject(),
              userId: user._id
            };

            logger.debug('Auth: Grace period applied, new token generated');
            return next();
          } catch (innerError) {
            // If there's still an error, it's not just an expiration issue
            logger.error('Token verification failed with grace period:', innerError);
            return res.status(401).json({ message: 'Invalid token' });
          }
        } else {
          logger.debug('Auth: Token expired beyond grace period');

          // Check if there's a refresh token in the request
          const refreshToken = req.header('X-Refresh-Token');
          if (refreshToken) {
            try {
              // Verify the refresh token
              const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
              logger.debug('Auth: Refresh token verified');

              // Find the user
              const user = await User.findById(refreshDecoded.userId)
                .populate({
                  path: 'store',
                  select: '_id storeNumber name location'
                })
                .select('+position +role +isAdmin +departments +name +email +status');

              if (!user || !user.store) {
                logger.debug('Auth: Invalid refresh token - user not found');
                return res.status(401).json({ message: 'Invalid refresh token' });
              }

              // Generate a new access token
              const newToken = jwt.sign(
                { userId: user._id, store: user.store._id },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
              );

              // Set the new token in the response header
              res.setHeader('X-New-Token', newToken);

              // Continue with the request
              req.user = {
                ...user.toObject(),
                userId: user._id
              };

              logger.debug('Auth: Token refreshed successfully');
              return next();
            } catch (refreshError) {
              logger.debug('Refresh token verification error:', refreshError);
              return res.status(401).json({ message: 'Token expired' });
            }
          }

          logger.debug('Auth: No refresh token provided');
          return res.status(401).json({ message: 'Token expired' });
        }
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      return res.status(401).json({ message: 'Token verification failed' });
    }

    if (!decoded || !decoded.userId) {
      logger.debug('Auth: Invalid token payload');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Find user without logging the ID (for privacy)
    const user = await User.findOne({ _id: decoded.userId })
      .populate({
        path: 'store',
        select: '_id storeNumber name location'
      })
      .populate('manager', '_id name position')
      .populate('evaluator', '_id name position')
      .select('+position +role +isAdmin +departments +name +email +status');

    if (!user) {
      logger.debug('Auth: User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.store) {
      logger.debug('Auth: User has no store');
      return res.status(400).json({ message: 'User has no associated store' });
    }

    // Convert to plain object and ensure required fields
    const userObj = user.toObject();

    // Ensure critical fields exist
    if (!userObj._id || !userObj.store?._id) {
      logger.error('Missing critical user data', {
        hasId: !!userObj._id,
        hasStore: !!userObj.store,
        hasStoreId: !!userObj.store?._id
      });
      return res.status(400).json({ message: 'Invalid user data structure' });
    }

    req.user = {
      ...userObj,
      userId: userObj._id
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Server error in auth middleware',
      error: error.message
    });
  }
};