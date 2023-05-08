const express = require('express');
const exhbs = require('express-handlebars');
const path = require('path');

const app = express();

// Configuración de Handlebars
app.engine('handlebars', exhbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.render('home');
});

// Puerto de escucha
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}/`);
});
