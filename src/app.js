require('dotenv').config();
const express = require('express');
const path    = require('path');

const ayudasRoutes = require('./routes/ayudas.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
app.use('/api/ayudas', ayudasRoutes);

// Sirve el frontend en cualquier otra ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor arrancado en http://localhost:${PORT}`);
});

module.exports = app;
