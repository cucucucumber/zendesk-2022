/**
 * For more configuration, please refer to https://angular.io/guide/build#proxying-to-a-backend-server
 *
 * Note: The proxy is only valid for real requests, Mock does not actually generate requests, so the priority of Mock will be higher than the proxy
 */
module.exports = {
  /**
   * The following means that all requests are directed to the backend `https://localhost:9000/`
   */
  '/api/v2/tickets.json': {
    target: 'https://zendeskcodingchallenge3907.zendesk.com/api/v2/tickets.json',
    secure: true, // Ignore invalid SSL certificates
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api/v2/tickets.json': ''
    }
  }
};
