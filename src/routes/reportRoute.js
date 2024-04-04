const express = require('express');
const mainController = require('../controllers/reportController');
const jsPDF = require('jspdf');
const router = express.Router();


//listar equipos para carta de enterga
router.get('/letter', mainController.liststock)

//Ruta para renderizar carta de entrega como vista previa
router.get('/letter/read/:id', mainController.carta_read)

//Ruta para generar link previo a exportar
router.get('/letter/pdf/:id', mainController.vista);

//Ruta para ejecutar carta de entrega
router.get('/letter/set/:id', mainController.createPDF);



module.exports = router;