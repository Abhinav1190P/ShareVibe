


const jwt = require("jsonwebtoken");
const cookieOption = require("../config/cookieOption");
const { jwtSecret } = require("../config");
const authService = require("../services/auth");
const Auth = require('../models/Auth')

const signup = async (req, res, next) => {
  try {
    const user = req.body;
    console.log(user);


    const isAuth = await Auth.isUserNameExist(user.userName);
    if (isAuth) {
      return res.status(200).send({ message: `'${user.userName}' is already registered!` })
    }


    if (!user.phoneNumber) {
      return res.status(200).send({ message: "Phone number is required." });
    }


    const accountCount = await Auth.countAccountsByPhoneNumber(user.phoneNumber);
    if (accountCount >= 2) {
      return res.status(200).send({ message: "Number is already in use." });
    }


    await authService.signupUser(user);

    res.status(201).json({ message: "Account created successfully!", success: true });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  const { userName, password } = req.body;

  const cookies = req.cookies;
  const cookiesToken = cookies?.refreshToken;

  try {
    const loggedInUser = await authService.login({ userName, password });

    let newRefreshTokenList = !cookiesToken
      ? loggedInUser.refreshToken || []
      : loggedInUser.refreshToken?.filter((rt) => rt !== cookiesToken) || [];

    if (cookiesToken) {
      const foundToken = await authService.findByProperty(
        "refreshToken",
        cookiesToken
      );


      if (!foundToken) newRefreshTokenList = [];


      res.clearCookie("refreshToken", cookieOption);
    }


    const payload = {
      userId: loggedInUser._id.toString(),
      userName: loggedInUser.userName,
      role: loggedInUser.role,
    };

    const { accessToken, refreshToken } = authService.jwtSignIn(payload);


    loggedInUser.refreshToken = [...newRefreshTokenList, refreshToken];
    await loggedInUser.save();


    res.cookie("refreshToken", refreshToken, cookieOption);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};


const refresh = async (req, res) => {
  const cookies = req.cookies;
  const cookiesToken = cookies?.refreshToken;

  if (!cookiesToken) {
    return res.status(401).json({ message: "Unauthorized!" });
  }


  res.clearCookie("refreshToken", cookieOption);

  const foundUser = await authService.findByProperty(
    "refreshToken",
    cookiesToken
  );


  if (!foundUser) {
    jwt.verify(cookiesToken, jwtSecret.refresh, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden!" });
      }

      const decodedId = decoded.userId;
      const hackedUser = await authService.findByProperty("_id", decodedId);

      if (hackedUser) {
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    });

    return res.status(403).json({ message: "Forbidden!" });
  }

  const newRefreshTokenList =
    foundUser?.refreshToken?.filter((rt) => rt !== cookiesToken) || [];

  jwt.verify(cookiesToken, jwtSecret.refresh, async (err, decoded) => {
    if (err) {
      foundUser.refreshToken = [...newRefreshTokenList];
      await foundUser.save();
    }

    const decodedId = decoded.userId;

    if (err || foundUser?._id.toString() !== decodedId) {
      return res.status(403).json({ message: "Forbidden!" });
    }


    const payload = {
      userId: foundUser._id.toString(),
      userName: foundUser.userName,
      role: foundUser.role,
    };

    const jwtSign = authService.jwtSignIn(payload);


    foundUser.refreshToken = [...newRefreshTokenList, jwtSign.refreshToken];
    await foundUser.save();


    res.cookie("refreshToken", jwtSign.refreshToken, cookieOption);

    res.json({ accessToken: jwtSign.accessToken });
  });
};


const logout = async (req, res) => {
  const cookies = req.cookies;
  const cookiesToken = cookies?.refreshToken;

  if (!cookiesToken) return res.status(204).json({ message: "No content!" });

  res.clearCookie("refreshToken", cookieOption);

  const foundUser = await authService.findByProperty(
    "refreshToken",
    cookiesToken
  );

  if (!foundUser) {
    return res.status(204).json({ message: "No content!" });
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== cookiesToken
  );
  await foundUser.save();

  res.status(204).json({ message: "No content!" });
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
};