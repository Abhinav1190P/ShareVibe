const dotenv = require("dotenv");

dotenv.config();
// process.env.PORT refers to the .env file...


module.exports = {
  port: process.env.PORT || 4000,
  mongooseUrl:
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/sharevib",
  jwtSecret: {
    access: process.env.ACCESS_TOKEN_SECRET,
    refresh: process.env.REFRESH_TOKEN_SECRET,
  },
};