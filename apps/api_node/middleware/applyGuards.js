const { defaultCostGuard } = require('../src/guards/costGuard');

/**
 * Middleware Express para aplicar guards antes de procesamiento
 * Rechaza con HTTP 402 si se excede cap de coste
 */

function applyGuards(req, res, next) {
  try {
    const request = req.body;
    const model = request.metadata?.model || 'gpt-4o-mini';
    
    // Cost guard: rechaza si excede cap
    const context = defaultCostGuard.assertWithinCaps(request, model);
    
    // Agregar contexto al request para uso posterior
    req.costContext = context;
    
    console.log('[applyGuards] Cost check passed', {
      ts: new Date().toISOString(),
      agentId: request.agentId,
      estimatedCost: context.estimatedCostEUR,
      cap: context.requestCostCap
    });
    
    next();
  } catch (error) {
    const code = error.code;
    const context = error.context;
    
    if (code === 'COST_CAP_EXCEEDED' || code === 'DAILY_BUDGET_EXCEEDED') {
      console.error('[applyGuards] Cost guard rejected', {
        ts: new Date().toISOString(),
        code,
        message: error.message,
        context
      });
      
      return res.status(402).json({
        error: 'Payment Required',
        code,
        message: error.message,
        details: context
      });
    }
    
    // Otro tipo de error
    console.error('[applyGuards] Unexpected error', { error: error.message });
    return res.status(500).json({
      error: 'Internal guard error',
      message: error.message
    });
  }
}

module.exports = { applyGuards };
