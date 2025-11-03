// authentication middleware in Node.js


const jwt = require("jsonwebtoken");  // package to create and verify tokens.
                                      // JWT = JSON Web Token.

const authMiddleware = (roles = []) => (req, res, next) => { 
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ msg: "No token" });  // check if request has token or not
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;  //get only token part without prefix

    jwt.verify(token, "secretKey", (err, decoded) => { //check if the token valid
                                                       // err =  error if verification fails - token expired, invalid signature.
        if (err) return res.status(401).json({ msg: "Invalid token" });  //decoded → have payload - date stored of the token sush id,role.

        // If roles.length is 0 - no role restrictions - everyone can access.
        // If roles.length > 0 - only roles in decoded.rol are allowed.
        // If has role restrictions AND the user’s role is NOT in the allowed roles, block access.
        if (roles.length && !roles.includes(decoded.role)) 
            return res.status(403).json({ msg: "Access denied" });
        req.user = decoded; //in this request, the info in req of the authenticated user, to can route use it 
        next(); // pass control to the route handler to can access to it.
    });
};


module.exports = authMiddleware;
