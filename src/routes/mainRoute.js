const express = require('express');
const mainController = require('../controllers/mainController');

const router = express.Router();


//ruta para renderizar creacion de elementos
router.get('/main', mainController.create);

//ingreso de archivos
router.post('/main', mainController.upload.single('archivo'), mainController.store);

//ruta para listar elementos
router.get('/index', mainController.index);

//Ruta para borrar elementos
//router.post('/index/delete', mainController.destroy);
router.post('/index/:id', mainController.destroy);

//Ruta para obtener el elemento 
router.get('/index/edit/:id', mainController.edit);

// Ruta para actualizar un elemento
router.post('/index/edit/:id', mainController.upload.single('archivo'), mainController.update);

//Ruta para obtener el elemento para la funcion de ver (read)
router.get('/index/read/:id', mainController.read);


module.exports = router;