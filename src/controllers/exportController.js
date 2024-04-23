
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


function index (req, res){
  if (!req.session.loggedIn) {
      return res.redirect('/');
    }
  else{
      let name = req.session.nombre;
      res.render('report/report',{name})
  }
}

function exportToCsv(req, res) {
    const csvWriter = createCsvWriter({
        path: 'csv_inventario_all.csv',
        header: [
          {id: 'id', title: 'id'},
          {id: 'id_agencia', title: 'id_agencia'}, //
          {id: 'nombre', title: 'nombre'},
          {id: 'departamento', title: 'departamento'},
          {id: 'correo', title: 'correo'},
          {id: 'serie', title: 'serie'},
          {id: 'cpu', title: 'cpu'},
          {id: 'ram', title: 'ram'},
          {id: 'disco_duro', title: 'disco_duro'},
          {id: 'monitor', title: 'monitor'},
          {id: 'teclado', title: 'teclado'},
          {id: 'mouse', title: 'mouse'},
          {id: 'tableta', title: 'tableta'},
          {id: 'adaptador', title: 'adaptador'},
          {id: 'so', title: 'so'},
          {id: 'licencia', title: 'licencia'},
          {id: 'direccion_ip', title: 'direccion_ip'},
          {id: 'direccion_ip_wifi', title: 'direccion_ip_wifi'},
          {id: 'mac_address', title: 'mac_address'},
          {id: 'mac_address_wifi', title: 'mac_address_wifi'},
          {id: 'factura', title: 'factura'},
          {id: 'costo', title: 'costo'},
          {id: 'fecha', title: 'fecha'},
          {id: 'proveedor', title: 'proveedor'},
          {id: 'via_compra', title: 'via_compra'},
          {id: 'garantia', title: 'garantia'},
          {id: 'usuario_anterior', title: 'usuario_anterior'},
          {id: 'comentario', title: 'comentario'},
          {id: 'accesorio', title: 'accesorio'}, 
          {id: 'activo', title: 'activo'},
          {id: 'filename', title: 'filename'}
        ]
    });

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send('Error de servidor');
        }
        conn.query('SELECT inventario.*, agencia.nombre AS nombre_agencia FROM inventario INNER JOIN agencia ON inventario.id_agencia = agencia.id;', (err, rows) => {
            if (err) {
                return res.status(500).send('Error al consultar la base de datos');
            }

            const formattedRows = rows.map(row => {
              return {
                ...row,
                fecha: formatDate(row.fecha),
                
              };
            });

            csvWriter.writeRecords(formattedRows)
                .then(() => {
                    res.download('csv_inventario_all.csv', 'INVENTARIO.csv');
                });
        });
    });
}


//Exportar con checks seleccionados
function exportSelectedFieldsToCsv(req, res) {
    const camposSeleccionados = req.body.campos || []; // Esto viene del formulario

    if (camposSeleccionados.length === 0) {
        return console.log('Seleecione al menos 2 campos')
    }

    const headers = camposSeleccionados.map(campo => ({
        id: campo, // Usamos el nombre del campo tal como se espera en el resultado de la consulta
        title: campo.replace(/_/g, ' ').toUpperCase() // Formateamos el título para el CSV
    }));

    const csvWriter = createCsvWriter({
        path: 'csv_inventario.csv',
        header: headers
    });

    // Construye la selección de campos para la consulta SQL considerando todos los campos
    const camposConsulta = camposSeleccionados.map(campo => {
        switch (campo) {
            case 'nombre_agencia':
                return 'agencia.nombre AS "nombre_agencia"'; // Caso especial por el JOIN
            default:
                return `inventario.${campo} AS "${campo}"`; // Asume el resto de campos de la tabla 'inventario'
        }
    }).join(', ');

    const consultaSQL = `SELECT ${camposConsulta} FROM inventario INNER JOIN agencia ON inventario.id_agencia = agencia.id;`;

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send('Error de servidor');
        }

        conn.query(consultaSQL, (err, rows) => {
            if (err) {
                return res.status(500).send('Error al consultar la base de datos');
            }

            // Formateo de la fecha dentro del mapeo de datos antes de escribir en CSV, si 'fecha' está presente
            const formattedRows = rows.map(row => {
                if (row.fecha) {
                    row.fecha = formatDate(row.fecha); // Asegúrate de que esta función está definida y es accesible
                }
                return row;
            });

            csvWriter.writeRecords(formattedRows)
                .then(() => {
                    res.download('csv_inventario.csv', 'INVENTARIO_SELECT.csv');
                });
        });
    });
}

function formatDate(date) {
    const currentDate = new Date(date);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }


function exportAgency(req, res) {
    const csvWriter = createCsvWriter({
        path: 'csv_agency.csv',
        header: [
          {id: 'id', title: 'id'},
          {id: 'nombre', title: 'nombre'},
          {id: 'razon_social', title: 'razon_social'},
          {id: 'direccion', title: 'direccion'},
          {id: 'NIT', title: 'NIT'}
        ]
    });

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send('Error de servidor');
        }
        conn.query('SELECT * FROM agencia;', (err, rows) => {
            if (err) {
                return res.status(500).send('Error al consultar la base de datos');
            }
            csvWriter.writeRecords(rows)
                .then(() => {
                    res.download('csv_agency.csv', 'AGENCIA.csv');
                });
        });
    });
}



  module.exports = {
    index,
    exportToCsv,
    exportSelectedFieldsToCsv,
    exportAgency
  
    }