function create (req, res){
    /*
    if (!req.session.loggedIn) {
        return res.redirect('/');
      }
    else{
        let name = req.session.nombre;
        res.render('agency/agency',{name})
    }*/
    let name = req.session.nombre;
    res.render('agency/agency',{name})
}

function index(req,res){
  let name = req.session.nombre;
  res.render('agency/listagency',{name})
}

//Funcion para crear y verificar que la agencia existe 
function storeagency(req, res) {
  const data = req.body;

  req.getConnection((err, conn) => 
  {
    conn.query('SELECT * FROM agencia WHERE nombre = ?', [data.nombre], (err, agencydata) => 
    {
      if (agencydata.length > 0) 
        {
          res.render('agency/agency', { error: 'Agencia ya existe' });
        } else 
        
      {
        conn.query('INSERT INTO agencia SET ?', [data], (err, rows) => {
          if (err) 
          {
            console.log(err);
          } else {
            // Aquí se ejecutará la redirección después de la inserción
            setTimeout(() => 
            {
              res.redirect('/listar');
            }, 3000);
          }
        });
      }
    });
  });
}




module.exports = {
    create,
    index,
    storeagency
    }