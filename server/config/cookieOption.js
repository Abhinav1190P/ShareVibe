// Here we define the cookie duration and log in duration (Until when is a user allowed to be logged in)

const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    //About a day
  };
  
  module.exports = cookieOption;