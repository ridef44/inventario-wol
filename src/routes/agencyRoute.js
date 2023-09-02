const express = require('express');
const mainController = require('../controllers/agencyController');

const router = express.Router();

//ruta para renderizar pagina listado de agencias
router.get('/listar', mainController.index);

//ruta para renderizar pagina de ingreso
router.get('/agencia', mainController.create);

//Para insertar los datos a BD
router.post('/agencia', mainController.storeagency)

//Para insertar los datos en el formualrio de leer
router.get('/agencia/read/:id', mainController.getAgencyById)

//Para insertar los datos en el formualrio de editar
router.get('/agencia/edit/:id', mainController.edit)

//Para insertar los datos en el formualrio de editar
router.post('/agencia/edit/:id', mainController.update)

//Ruta para borrar elementos
router.post('/agencia/:id', mainController.destroy);


module.exports = router;