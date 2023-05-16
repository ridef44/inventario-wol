
const multer = require('multer');
const path = require('path');

//Funcion para renderizar vista de creacion de equipos
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



// ---------------FUNCION PRINCIPAL DE CREACION DE ELEMENTOS---------------
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
        res.redirect('/index');
      }
    });
  });
}
// ---------------FIM DE FUNCION PRINCIPAL DE CREACION DE ELEMENTOS---------------




//Controlador para listar los equipos
function index(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT *, DATE_FORMAT(fecha, "%d-%m-%Y") as fecha FROM inventario', (err, stock) => {
      if(err) {
        console.log(err)
      }
      res.render('mainViews/list', {stock}); // se corrige el paréntesis que cerraba mal
      console.log(stock.filename)

    });
  });
}

//FUncion para eliminar los elementos
/*function destroy(req, res) {
  const id = req.body.id;

  req.getConnection((err, conn) => {
    conn.query('DELETE FROM inventario WHERE id = ?', [id], (err, rows) => {
      res.redirect('/index');
      console.log(id)
     if(err){
      console.log(err);
     }
    });
  })
}
*/

function destroy(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error de servidor');
    }

    conn.query('DELETE FROM inventario WHERE id = ?', [id], (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error de servidor');
      }

      console.log(`Eliminado el registro con id: ${id}`);
      res.redirect('/index');
    });
  });
}



module.exports = {
    create,
    store,
    index,
    upload,
    destroy

}