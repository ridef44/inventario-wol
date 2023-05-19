
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
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    cb(null, `${filename}-${formattedDate}${ext}`);
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
        console.log('HOLA')
      }
      res.render('mainViews/list', {stock}); // se corrige el paréntesis que cerraba mal
  
    });
  });
}

//FUncion para eliminar los elementos

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

// extrae los campos y los presenta en el form

function edit(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM inventario WHERE id = ?', [id], (err, stock) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error de servidor');
      }

      const formattedStock = {
        ...stock[0],
        fecha: formatDate(stock[0].fecha) // Formatear la fecha antes de pasarla al renderizado de la vista
      };

      res.render('mainViews/edit', { stock: formattedStock });
    });
  });
}

// Función para formatear la fecha en el formato yyyy-MM-dd
function formatDate(date) {
  const currentDate = new Date(date);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

function update(req, res) {
  const itemId = req.params.id; // Obtén el ID del elemento a actualizar
  let filename = '';

  // Verificar si se ha subido un nuevo archivo
  if (req.file) {
    filename = req.file.filename;
  }

  const newData = {
    ...req.body,
    filename: filename
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    // Actualizar los campos en la tabla usando el ID del elemento
    conn.query('UPDATE inventario SET ? WHERE id = ?', [newData, itemId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error al actualizar el elemento');
      }

      res.redirect('/index');
    });
  });
}

function read(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM inventario WHERE id = ?', [id], (err, stock) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error de servidor');
      }

      const formattedStock = {
        ...stock[0],
        fecha: formatDate(stock[0].fecha) // Formatear la fecha antes de pasarla al renderizado de la vista
      };

      res.render('mainViews/read', { stock: formattedStock });
    });
  });
}



module.exports = {
    create,
    store,
    index,
    upload,
    destroy,
    edit,
    update,
    read
  

}