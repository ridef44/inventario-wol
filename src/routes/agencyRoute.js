const express = require('express');
const mainController = require('../controllers/agencyController');

const router = express.Router();

//ruta para renderizar pagina de ingreso
router.get('/listar', mainController.index);

//ruta para renderizar pagina de ingreso
router.get('/agencia', mainController.create);

//Para insertar los datos a BD
router.post('/agencia', mainController.storeagency)



module.exports = router;