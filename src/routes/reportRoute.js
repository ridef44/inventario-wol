const express = require('express');
const mainController = require('../controllers/reportController');

const router = express.Router();


//ruta para mostrar reportes
router.get('/report', mainController.index);

//listar equipos para carta de enterga
router.get('/letter', mainController.liststock)

//Ruta para renderizar carta de entrega
router.get('/letter/read/:id', mainController.carta_read)




module.exports = router;