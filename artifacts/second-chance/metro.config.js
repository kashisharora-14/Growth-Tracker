const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      middleware(req, res, next);
    };
  },
};

module.exports = config;
