const cors_proxy = require('cors-anywhere');

const port = process.env.PORT || 8080;

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
}).listen(port, () => {
  console.log(`CORS Anywhere proxy running on localhost:${port}`);
});