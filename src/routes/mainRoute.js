const express = require('express');
const mainController = require('../controllers/mainController');

const router = express.Router();

//router.get('/list', mainController.listtask);

router.get('/main', mainController.create);
router.post('/main', mainController.upload.single('archivo'), mainController.store);
router.get('/index', mainController.index);



module.exports = router;