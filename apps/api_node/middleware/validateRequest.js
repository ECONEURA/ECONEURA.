const Ajv = require('ajv');
const { neuraRequestSchema } = require('../src/core/schemas');

/**
 * Middleware de validación AJV para requests ECONEURA
 * Valida estructura antes de procesamiento
 */

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(neuraRequestSchema);

function validateRequest(req, res, next) {
  const valid = validate(req.body);
  
  if (!valid) {
    const errors = validate.errors || [];
    const details = errors.map(err => ({
      field: err.instancePath || err.params?.missingProperty || 'root',
      message: err.message || 'validation error',
      value: err.params
    }));

    console.error('[validateRequest] Validation failed', { 
      ts: new Date().toISOString(),
      errors: details,
      body: req.body 
    });

    return res.status(400).json({
      error: 'Invalid request',
      code: 'VALIDATION_ERROR',
      details
    });
  }

  next();
}

module.exports = { validateRequest };
