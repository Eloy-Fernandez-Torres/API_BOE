const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ayudas.controller');
const { resolveRole } = require('../middleware/roleAccess');

router.use(resolveRole);
router.get('/buscar',  ctrl.buscar);
router.get('/sumario', ctrl.sumario);
router.get('/debug',   ctrl.debug);
router.get('/:id',     ctrl.obtenerDetalle);

module.exports = router;
