const express = require('express');
const mainController = require('../controllers/exportController');
const router = express.Router();


//ruta para mostrar exportacion
router.get('/report', mainController.index);
router.get('/export-csv', mainController.exportToCsv)


// En tus rutas, usando POST para la nueva funcionalidad
router.post('/export-selected', mainController.exportSelectedFieldsToCsv);


module.exports = router;