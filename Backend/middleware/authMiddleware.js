const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ msg: "No token" });

    // Check if header starts with 'Bearer '
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) return res.status(401).json({ msg: "Invalid token" });
        if (roles.length && !roles.includes(decoded.role))
            return res.status(403).json({ msg: "Access denied" });
        req.user = decoded;
        next();
    });
};


module.exports = authMiddleware;
