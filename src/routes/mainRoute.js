const express = require('express');
const mainController = require('../controllers/mainController');

const router = express.Router();


//ruta para creacion de elementos
router.get('/main', mainController.create);

//ingreso de archivos
router.post('/main', mainController.upload.single('archivo'), mainController.store);

//ruta para listar elementos
router.get('/index', mainController.index);

//Ruta para borrar elementos
//router.post('/index/delete', mainController.destroy);
router.post('/index/:id', mainController.destroy);








module.exports = router;