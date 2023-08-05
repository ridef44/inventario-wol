const express = require('express');
const mainController = require('../controllers/reportController');

const router = express.Router();


//ruta para listar elementos
router.get('/report', mainController.index);


module.exports = router;