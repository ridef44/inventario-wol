
const excel = require('exceljs');
const db = require('express-myconnection'); // Importa la biblioteca que utilizas para la base de datos

function index (req, res){
    if (!req.session.loggedIn) {
        return res.redirect('/');
      }
    else{
        let name = req.session.nombre;
        res.render('report/report',{name})
    }
}

//Listar inventario para imprimir carta de entrega

function liststock(req, res) {
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
      res.render('report/carta', { name, stock, queryError, query });
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
    sql += ' ORDER BY inventario.id ASC LIMIT 8';
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

// Función para formatear la fecha en el formato yyyy-MM-dd
function formatDate(date) {
  const currentDate = new Date(date);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

//Funcion que extare los elementos de la tabla par insertar en carta
function carta_read(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }
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
        let name = req.session.nombre;
        res.render('report/carta_pdf', { stock: formattedStock,name });
  
      }
    );
  });
}

  module.exports = {
    index,
    liststock,
    getStock,
    carta_read
    }