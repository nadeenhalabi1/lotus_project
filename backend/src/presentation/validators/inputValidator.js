import { body, validationResult } from 'express-validator';

/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs to prevent security vulnerabilities
 */

// Report generation validation
export const validateReportGeneration = [
  body('reportType')
    .notEmpty()
    .withMessage('reportType is required')
    .isIn([
      'monthly-performance',
      'course-completion',
      'user-engagement',
      'organizational-benchmark',
      'learning-roi',
      'skill-gap',
      'compliance',
      'performance-trend',
      'course-performance-deep-dive',
      'content-effectiveness',
      'department-performance',
      'drop-off-analysis'
    ])
    .withMessage('Invalid report type'),
  body('dateRange.start').optional().isISO8601().withMessage('Invalid start date'),
  body('dateRange.end').optional().isISO8601().withMessage('Invalid end date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Data refresh validation
export const validateDataRefresh = [
  body('services').optional().isArray().withMessage('Services must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Sanitize inputs
export const sanitizeInput = (req, res, next) => {
  // Remove potential XSS vectors
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

