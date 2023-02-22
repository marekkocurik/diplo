import ky from 'ky';

const client = ky.extend({
  credentials: 'include',
  prefixUrl: 'http://localhost:8080',
  timeout: false,
  hooks: {
    beforeRequest: [
      (request) => {
        // Do something before every request
        // This is a good place to authorize request if needed
      },
    ],
    afterResponse: [
      (req, options, response) => {
        // Do something after every response
        // For example, check status code etc...
        if(response.status >= 300 && response.status < 400)
          window.location.href = '/auth/login'
      },
    ],
  },
});

export default client;
