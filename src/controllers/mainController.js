
const multer = require('multer');
const path = require('path');

/*function create (req, res){
    res.render('mainViews/main');
}
*/

function create(req, res) {
  if (req.session.loggedIn) {
    let name = req.session.nombre;
    res.render('mainViews/main', {name});
    // user is logged in.
      }
  else {
    res.redirect('/');
      // user is not logged in.
        }
      }

// Configuramos multer para almacenar los archivos en la carpeta 'uploads'

const storage = multer.diskStorage({
  
  destination: './public/facturas/',
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = path.basename(file.originalname, ext);
    const date = new Date().toString().replace(/:/g, '-');
    cb(null, `${filename}-${date}${ext}`);
  }
});
// Creamos una función que será utilizada para subir los archivos
const upload = multer({ storage: storage });

// Definimos nuestro controlador para manejar la subida de archivos
function store(req, res) {
  let filename = '';
  if (req.file) {
    filename = req.file.filename;
  }
  const data = { ...req.body, filename };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO inventario SET ?', [data], (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });
}

//Controlador para listar los equipos



function index(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT *, DATE_FORMAT(fecha, "%d-%m-%Y") as fecha FROM inventario', (err, stock) => {
      if(err) {
        console.log(err)
      }
      res.render('mainViews/list', {stock}); // se corrige el paréntesis que cerraba mal

    });
  });
}




module.exports = {
    create,
    store,
    upload,
    index

}