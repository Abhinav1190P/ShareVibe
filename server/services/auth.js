const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const errorMessage = require("../utils/errorMessage");
const { jwtSecret } = require("../config");


const jwtSignIn = (payload) => {
  const accessToken = jwt.sign(payload, jwtSecret.access, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, jwtSecret.refresh, {
    expiresIn: "1d",
  });

  return { accessToken, refreshToken };
};


const findByProperty = (key, value) => {
  if (!key || !value) return null;

  if (key === "_id") {
    return Auth.findById(value);
  }

  return Auth.findOne({ [key]: value });
};


const signupUser = async (data) => {

  return Auth.create(data);
};

const login = async ({ userName, password }) => {
  const auth = await findByProperty("userName", userName);

  if (!auth) throw errorMessage("Incorrect username or passowrd!", 400);

  const isPasswordMatch = await auth.comparePassword(password);
  if (!isPasswordMatch)
    throw errorMessage("Incorrect username or passowrd!", 400);

  if (!auth.active)
    throw errorMessage(
      "Account is not activated, please contact with admin",
      400
    );

  return auth;
};


const resetPassword = async ({ userName, password }) => {
  const auth = await findByProperty("userName", userName);

  if (!auth) throw errorMessage("Incorrect username!", 400);

  auth.password = password;
  return auth.save();
};

module.exports = {
  signupUser,
  findByProperty,
  login,
  jwtSignIn,
  resetPassword,
};