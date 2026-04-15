const ayudasService = require('../services/ayudasService');

exports.buscar = async (req, res, next) => {
  try {
    const policy = req.accessPolicy;
    const requestedDays = parseInt(req.query.dias, 10) || 7;
    const dias = Math.min(requestedDays, policy.maxDays);
    const keyword = policy.allowKeywordSearch ? req.query.q : '';

    const criterios = {
      q:      keyword,
      sector: policy.allowSectorFilter ? req.query.sector : '',
      tipo:   req.query.tipo
    };

    const ayudas = await ayudasService.buscarAyudas(criterios, dias);
    const hasLimit = Number.isInteger(policy.maxResults) && policy.maxResults > 0;
    const ayudasRecortadas = hasLimit ? ayudas.slice(0, policy.maxResults) : ayudas;
    res.json({
      success: true,
      data: ayudasRecortadas,
      total: ayudas.length,
      meta: {
        role: req.userRole,
        roleLabel: policy.label,
        limits: {
          maxDays: policy.maxDays,
          maxResults: hasLimit ? policy.maxResults : 'sin limite',
          allowKeywordSearch: policy.allowKeywordSearch,
          allowSectorFilter: policy.allowSectorFilter,
          allowMontoFilter: policy.allowMontoFilter
        },
        applied: {
          diasSolicitados: requestedDays,
          diasAplicados: dias,
          keywordIgnorado: !policy.allowKeywordSearch && Boolean(req.query.q),
          resultadosRecortados: hasLimit && ayudas.length > ayudasRecortadas.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerDetalle = async (req, res, next) => {
  try {
    const ayuda = await ayudasService.obtenerDetalle(req.params.id);
    res.json({ success: true, data: ayuda });
  } catch (error) {
    next(error);
  }
};

// GET /api/ayudas/sumario?fecha=2026-04-06
exports.sumario = async (req, res, next) => {
  try {
    const policy = req.accessPolicy;
    const fechaSolicitada = req.query.fecha;
    if (fechaSolicitada && !policy.allowDebug) {
      return res.status(403).json({
        success: false,
        error: 'Solo la version creador puede consultar sumario por fecha manual.'
      });
    }

    const fecha = req.query.fecha ? new Date(req.query.fecha) : new Date();
    const disposiciones = await ayudasService.obtenerSumario(fecha);
    res.json({ success: true, data: disposiciones, total: disposiciones.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/ayudas/debug?fecha=20260407
// Devuelve el XML crudo del BOE ya parseado — útil para ver la estructura real
exports.debug = async (req, res, next) => {
  try {
    const policy = req.accessPolicy;
    if (!policy.allowDebug) {
      return res.status(403).json({
        success: false,
        error: 'Solo la version creador puede acceder al endpoint debug.'
      });
    }

    const hoy = new Date();
    const def = `${hoy.getFullYear()}${String(hoy.getMonth()+1).padStart(2,'0')}${String(hoy.getDate()).padStart(2,'0')}`;
    const fechaParam = req.query.fecha || def;
    const raw = await ayudasService.rawSumario(fechaParam);
    res.json({ fechaParam, estructura: raw });
  } catch (error) {
    next(error);
  }
};

