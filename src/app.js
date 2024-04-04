const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require ('./routes/login');
const mainRoutes = require('./routes/mainRoute');
const reportRoutes = require ('./routes/reportRoute')
const agencyRoutes = require ('./routes/agencyRoute')
const exportRoutes = require ('./routes/exportRoute')

const app = express();
const methodOverride = require('method-override');
const path = require('path');

const dotenv = require ('dotenv');

dotenv.config({path:'.env'})


app.set('port', process.env.PORT || 4000);

//configuracion de plantillas
app.set('views', __dirname + '/views');

// Configuración de plantillas
app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: __dirname + '/views/partials',
  helpers: {
    isEqual: function (value1, value2) {
      return value1 === value2;
    },
    isEqualValue: function (value1, value2) {
      return value1 == value2;
    },
    isEven: function(index) {
      return index % 2 === 0 ? 'bg-gray-200' : 'bg-white';
    },
  }
}));
app.set('view engine', '.hbs');




// Configuración de body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de sesión
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Middleware para verificar si el usuario tiene una sesión iniciada
app.use(function(req, res, next) {
  res.locals.isLoggedIn = req.session.loggedIn || false;
  next();
});


//Conexion a base de datos
app.use(myconnection(mysql, {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 3306,
  database: process.env.DB_DATABASE,
}, 'single'));


const date = new Date().toString().replace(/:/g, '-');
app.listen(app.get('port'), () =>{
    console.log('Estamos trabajndo sobre el puerto', app.get('port'));
    //console.log(date)
});

// Configuración de archivos estáticos



app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/images', express.static(path.join(__dirname, '/views/img')));




// Ruta para acceder a los archivos PDF
app.get('public/facturas/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'public', 'facturas', fileName);
  res.sendFile(filePath);
});

// Ruta para descargar PDF
app.post('public/facturas/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'public', 'facturas', fileName);
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error al descargar el archivo PDF');
    }
  });
});



//Configuracion de Rutas
app.use('/', loginRoutes);
app.use('/', mainRoutes);
app.use('/', reportRoutes);
app.use('/', agencyRoutes);
app.use('/', exportRoutes);



app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    let name = req.session.nombre;
    res.render('home', {name});
    // user is logged in.
}
else {
  res.redirect('/login');
    // user is not logged in.
}
}
);

/*
app.get('/', (req, res)=>{
  res.render('main')
});
*/


app.use(methodOverride('_method'));