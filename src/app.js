const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require ('./routes/login');
const mainRoutes = require('./routes/mainRoute');
const { redirect } = require('express/lib/response');
const app = express();
const methodOverride = require('method-override');



app.set('port', 4000);

//configuracion de plantillas
app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
	extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// Configuración de Multer



//Conexion a base de datos
app.use (myconnection(mysql, {
  host: '127.0.0.1',
  user: 'devops',
  password: 'admin',
  port: 3306,
  database: 'inventario'
}, 'single'));



//configuracion de sesion
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const date = new Date().toString().replace(/:/g, '-');
app.listen(app.get('port'), () =>{
    console.log('Estamos trabajndo sobre el puerto', app.get('port'));
    //console.log(date)
});


//Configuracion de Rutas
app.use('/', loginRoutes);
app.use('/', mainRoutes);

/*
app.get('/', (req,res) =>{
    res.render('home');
});
*/

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


app.get('/', (req, res)=>{
  res.render('main')
});

app.use(methodOverride('_method'));







