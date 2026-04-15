module.exports = (err, req, res, next) => {
  console.error('[Error]', err.message);

  const status = err.response?.status || err.status || 500;
  const message = status === 404
    ? 'Recurso no encontrado'
    : status >= 500
    ? 'Error interno del servidor'
    : err.message || 'Error desconocido';

  res.status(status).json({ success: false, error: message });
};
