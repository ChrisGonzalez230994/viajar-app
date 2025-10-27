const jwt = require('jsonwebtoken'); 

let checkAuth = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {

        

        if (err){

            if(err.name === "TokenExpiredError"){
                return res.status(401).json({
                status: "error",
                code: 10,
                msg: "ExpiredVerification",
                error: err  
                });
            }else{
                return res.status(401).json({
                  status: "error",
                  error: err  
                });
            }
           
        }

        req.userData = decoded.userData;
        req.userId = decoded.userData._id;
        req.userRole = decoded.userData.rol || decoded.userData.role;

        next();

    });

}

let checkAdmin = (req, res, next) => {
    // Este middleware debe ejecutarse después de checkAuth
    if (!req.userRole) {
        return res.status(401).json({
            status: "error",
            error: "No autenticado"
        });
    }

    if (req.userRole !== 'admin') {
        return res.status(403).json({
            status: "error",
            error: "Acceso denegado. Se requieren permisos de administrador."
        });
    }

    next();
}

module.exports = {checkAuth, checkAdmin}