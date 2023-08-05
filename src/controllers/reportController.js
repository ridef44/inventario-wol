
function index (req, res){
    if (!req.session.loggedIn) {
        return res.redirect('/');
      }
    else{
        let name = req.session.nombre;
        res.render('report/report',{name})
    }



   
}


module.exports = {
    index

}