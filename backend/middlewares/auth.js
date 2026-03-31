const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // = `Bearer ${token}`

    if (!authHeader) return res.status(401).json({ message: "Token Not Found" });

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    /*
      decoded = 
      {
        _id : 
        username : 
        email :
        password :
      }
    */

    req.user = await User.findById(decodedToken.id).select("-password");

    /*
        req means object contains properties
        req = {
            body: awlknfanwf
            params:  awkfnawhfolawhn
            .....
            .....
            ....
            user : jawbdabwf

        }
    */
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid Token" });
  }
};

const adminOnly = (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin Access Required" });
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { protect, adminOnly };
