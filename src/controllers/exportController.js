
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
          {id: 'id', title: 'ID'},
          {id: 'nombre_agencia', title: 'Agencia'}, //
          {id: 'nombre', title: 'Nombre'},
          {id: 'departamento', title: 'Departamento'},
          {id: 'correo', title: 'Correo'},
          {id: 'serie', title: 'Serie'},
          {id: 'cpu', title: 'CPU'},
          {id: 'ram', title: 'RAM'},
          {id: 'disco_duro', title: 'Disco Duro'},
          {id: 'monitor', title: 'Monitor'},
          {id: 'teclado', title: 'Teclado'},
          {id: 'mouse', title: 'Mouse'},
          {id: 'tableta', title: 'Tableta'},
          {id: 'adaptador', title: 'Adaptador'},
          {id: 'so', title: 'Sistema Operativo'},
          {id: 'licencia', title: 'Licencia'},
          {id: 'direccion_ip', title: 'Dirección IP'},
          {id: 'direccion_ip_wifi', title: 'Dirección IP WiFi'},
          {id: 'mac_address', title: 'MAC Address'},
          {id: 'mac_address_wifi', title: 'MAC Address WiFi'},
          {id: 'factura', title: 'Factura'},
          {id: 'costo', title: 'Costo'},
          {id: 'fecha', title: 'Fecha'},
          {id: 'proveedor', title: 'Proveedor'},
          {id: 'via_compra', title: 'Vía de Compra'},
          {id: 'garantia', title: 'Garantía'},
          {id: 'usuario_anterior', title: 'Usuario Anterior'},
          {id: 'otro', title: 'Otros'}, 
          {id: 'comentario', title: 'Comentarios'}, 
          {id: 'activo', title: 'Activo'}
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

function formatDate(date) {
  const currentDate = new Date(date);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
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
    return `${year}-${month}-${day}`;
}





  module.exports = {
    index,
    exportToCsv,
    exportSelectedFieldsToCsv
  
    }