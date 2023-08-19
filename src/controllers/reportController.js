
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

function generateExcel(req, res) {
  const { checkedIds } = req.body;

  // Verifica que los datos de la entrada son válidos.
  if (!checkedIds || checkedIds.length === 0) {
    return res.status(400).json({ message: 'Debe seleccionar al menos un elemento para exportar.' });
  }

  // Genera el archivo Excel.
  const conn = req.getConnection();
  const sql = `SELECT inventario.*, agencia.nombre AS nombre_agencia 
               FROM inventario 
               INNER JOIN agencia ON inventario.id_agencia = agencia.id 
               WHERE id IN (${checkedIds.join(', ')})`;

  conn.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al generar el reporte.' });
    }

    // Crear el archivo Excel.
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    // Agregar encabezados de columna si es necesario.
    const columnHeaders = Object.keys(rows[0]); // Suponiendo que rows[0] contiene las columnas.
    worksheet.addRow(columnHeaders);

    // Agregar filas de datos al archivo Excel.
    for (const row of rows) {
      worksheet.addRow(Object.values(row));
    }

    // Guardar el archivo Excel y enviarlo al cliente.
    const excelFilePath = 'export.xlsx';
    workbook.xlsx.writeFile(excelFilePath)
      .then(() => {
        res.status(200).download(excelFilePath, 'reporte.xlsx');
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar el archivo Excel.' });
      });
  });
}

  module.exports = {
    index,
    generateExcel
    }