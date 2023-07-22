
const multer = require('multer');
const path = require('path');

//Funcion para renderizar vista de creacion de equipos
/*
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

*/
//Renderisa la vista principal para crear elementos y extrae los datos de la tabla agencia
function create(req, res) {
  if (req.session.loggedIn) {
    req.getConnection((err, conn) => {
      if (err) {
        console.log(err);
        return res.render('error', { message: 'Error de conexión a la base de datos' });
      }

      // Obtener las opciones de agencia desde la tabla "agencia"
      conn.query('SELECT id, nombre FROM agencia', (err, rows) => {
        if (err) {
          console.log(err);
          return res.render('error', { message: 'Error al obtener las opciones de agencia' });
        }

        let name = req.session.nombre;
        res.render('mainViews/main', { name, agencias: rows });
      });
    });
  } else {
    res.redirect('/');
    // user is not logged in.
  }
}

// ---------------FUNCION PRINCIPAL DE CREACION DE ELEMENTOS---------------
// Configuramos multer para almacenar los archivos en la carpeta 'uploads' y formateamos la fecha para el ingreso de los archivos

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
        // Agregar código para mostrar una notificación aquí
        console.log('El elemento fue creado exitosamente');

        // Retrasar la redirección por 3 segundos
        setTimeout(() => {
          res.redirect('/index');
        }, 3000);
        
      }
    });
  });
}

// ---------------FIM DE FUNCION PRINCIPAL DE CREACION DE ELEMENTOS---------------


//Controlador para listar los equipos

function index(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return;
    }

    const { query } = req.query; // Obtén el valor del parámetro de búsqueda desde la URL
    let queryError = false;

    if (query && query.length < 3) {
      queryError = true;
    }

    getStock(conn, query, (err, stock) => {
      if (err) {
        console.log(err);
        return;
      }

      let name = req.session.nombre;
      res.render('mainViews/list', { name, stock, queryError });
    });
  });
}


function getStock(conn, query, callback) {

  if (query && query.length < 3) {
    callback(null, []); // Retorna una lista vacía si la búsqueda tiene menos de 3 caracteres
    return;
  }

  let sql = 'SELECT inventario.*, agencia.nombre AS nombre_agencia FROM inventario INNER JOIN agencia ON inventario.id_agencia = agencia.id';

  if (query && query.trim() !== '') {
    // Si hay un valor de búsqueda no vacío, ajusta la consulta SQL para realizar la búsqueda en varios campos
    sql += ` WHERE inventario.nombre LIKE '%${query}%' 
                OR inventario.correo LIKE '%${query}%' 
                OR inventario.serie LIKE '%${query}%' 
                OR inventario.cpu LIKE '%${query}%' 
                OR inventario.fecha LIKE '%${query}%' 
                OR inventario.usuario_anterior LIKE '%${query}%' 
                OR agencia.nombre LIKE '%${query}%'`;
  } else {
    // Si no hay un valor de búsqueda, realiza la paginación por 15 elementos
    sql += ' ORDER BY inventario.id ASC LIMIT 10';
  }

  conn.query(sql, (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }

    const stock = rows.map((row) => ({
      ...row,
      fecha: formatDate(row.fecha), // Formatear la fecha utilizando una función formatDate
    }));

    callback(null, stock);
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
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error de servidor');
    }
// Consulta para obtener los datos del inventario y el nombre de la agencia correspondiente
    const queryStock = `
      SELECT inventario.*, agencia.nombre AS nombre_agencia
      FROM inventario
      INNER JOIN agencia ON inventario.id_agencia = agencia.id
      WHERE inventario.id = ?
    `;

    conn.query(queryStock, [id], (err, rowsStock) => {
      if (err) {
        return res.status(500).send('Error de servidor');
      }

      if (rowsStock.length === 0) {
        return res.status(404).send('Inventario no encontrado');
      }

      // Formatear la fecha antes de pasarla al renderizado de la vista
      const stock = {
        ...rowsStock[0],
        fecha: formatDate(rowsStock[0].fecha)
      };
       // Consulta para obtener todas las agencias
      const queryAgencias = 'SELECT id, nombre FROM agencia';
      conn.query(queryAgencias, (err, rowsAgencias) => {
        if (err) {
          return res.status(500).send('Error de servidor');
        }

        const agencias = rowsAgencias;
        const nombreAgencia = stock.nombre_agencia;

        agencias.forEach((agencia) => {
          agencia.selected = agencia.id === stock.id_agencia;
        });

        res.render('mainViews/edit', { stock, agencias, nombreAgencia, name: req.session.nombre });
      });
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

      setTimeout(() => {
        res.redirect('/index');
      }, 3000);

    });
  });
}

// ... (el resto del código)

function read(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error de servidor');
    }

    conn.query(
      'SELECT inventario.*, agencia.nombre AS nombre_agencia FROM inventario INNER JOIN agencia ON inventario.id_agencia = agencia.id WHERE inventario.id = ?',
      [id],
      (err, stock) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Error de servidor');
        }

        if (stock.length === 0) {
          // El registro no fue encontrado, puedes manejarlo aquí si es necesario
          return res.status(404).send('Registro no encontrado');
        }

        const formattedStock = {
          ...stock[0],
          fecha: formatDate(stock[0].fecha), // Formatear la fecha antes de pasarla al renderizado de la vista
        };

        // Verificar si el nombre del archivo PDF existe en el objeto "formattedStock"
        if (formattedStock.filename) {
          // Renderizar la vista "mainViews/read" con los datos del equipo
          res.render('mainViews/read', { stock: formattedStock });
        } else {
          // Si no hay un nombre de archivo PDF, simplemente renderizamos la vista "mainViews/read" sin la opción de descarga
          res.render('mainViews/read', { stock: formattedStock, noPdf: true });
        }
      }
    );
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