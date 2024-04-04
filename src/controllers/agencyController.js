function create (req, res){
    
    if (!req.session.loggedIn) {
        return res.redirect('/');
      }
    else{
        let name = req.session.nombre;
        res.render('agency/agency',{name})
    }
}

//Listar agencias y mostrarlos en la tabla
function index(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM agencia', (err, agencia) => {
      if(err) {
        res.json(err);
      }
      let name = req.session.nombre;
      res.render('agency/listagency', { agencia, name });
    });
  });
}

//Funcion para ver los elementos de agencia (opcion ver)
function getAgencyById(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  const id = req.params.id;
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error del servidor');
    }
    conn.query('SELECT * FROM agencia WHERE id = ?', [id], (err, agenciaResult) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error al consultar la base de datos');
      }

      if (agenciaResult.length === 0) {
        // Manejar el caso donde no se encontraron registros
        return res.status(404).send('Agencia no encontrada');
      }

      const agencia = agenciaResult[0];
      let name = req.session.nombre;
      res.render('agency/read', { agencia,name });
    
    });
  });
}

//Funcion para crear y verificar que la agencia existe 
function storeagency(req, res) {
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM agencia WHERE nombre = ?', [data.nombre], (err, agencydata) => {
      if (agencydata.length > 0) {
        res.render('agency/agency', { error: 'Agencia ya existe', data });
      } else {
        conn.query('INSERT INTO agencia SET ?', [data], (err, rows) => {
          if (err) {
            console.log(err);
          } else {
            setTimeout(() => {
              res.redirect('/listar');
            }, 3000);
          }
        });
      }
    });
  });
}

//Funcion para llenar los campos segun el ID y actualziar
function edit(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }

  const id = req.params.id;
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error del servidor');
    }
    conn.query('SELECT * FROM agencia WHERE id = ?', [id], (err, agenciaResult) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error al consultar la base de datos');
      }

      if (agenciaResult.length === 0) {
        // Manejar el caso donde no se encontraron registros
        deleteForm.setAttribute('data-error', 'true');
        return res.status(404).send('Agencia no encontrada');
      }
      let name = req.session.nombre;
      const agencia = agenciaResult[0];
      res.render('agency/edit', { agencia, name });
     
    });
  });
}

function update(req, res) {
  const id = req.params.id;
  const data = req.body;

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error del servidor');
    }

    conn.query('UPDATE agencia SET ? WHERE id = ?', [data, id], (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error al actualizar la agencia');
      }

      setTimeout(() => {
        res.redirect('/listar');
      }, 3000);
    });
  });
}

//Funcion para eliminar agencias

function destroy(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error de servidor');
    }

    // Verificar si existen registros en la tabla de inventario para esta agencia
    conn.query('SELECT id FROM inventario WHERE id_agencia = ?', [id], (err, inventoryRows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error de servidor');
      }

      if (inventoryRows.length > 0) {
        // Hay registros en la tabla de inventario que hacen referencia a esta agencia
        //return res.status(400).send('No se puede eliminar: existen registros en la tabla de inventario para esta agencia');
        return res.render('agency/listagency', { error: 'No se puede eliminar: existen registros en la tabla de inventario para esta agencia' });
      }

      // Si no hay registros en la tabla de inventario, proceder con la eliminación
      conn.query('DELETE FROM agencia WHERE id = ?', [id], (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Error de servidor');
        }

        
        res.redirect('/listar');
      });
    });
  });
}

module.exports = {
    create,
    index,
    storeagency,
    getAgencyById,
    edit,
    update,
    destroy
    }