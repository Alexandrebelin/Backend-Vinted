const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const user = await User.findOne({
        token: req.headers.authorization.replace("Bearer ", ""),
      });

      if (user) {
        req.user = user;
        return next();
      } else {
        return res.status(401).json({ message: "Unauthorize1" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorize2" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
