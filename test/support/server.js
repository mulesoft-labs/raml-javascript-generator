const fs = require('fs');
const qs = require('querystring');
const join = require('path').join;
const express = require('express');

module.exports = express();
const app = module.exports;
const port = process.env.PORT || 4567;

/**
 * Respond with "Success".
 */
function successHandler(req, res) {
  return res.send('Success');
}

/**
 * Respond with the "id" uri parameter.
 */
function idParamHandler(req, res) {
  return res.send(req.params.id);
}

/**
 * Enable CORS.
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

  return next();
});

/**
 * Respond to the root resource.
 */
app.all('/', successHandler);

/**
 * Bounce the status code and body back to the user.
 */
app.all('/status/:status(\\d+)', (req, res) => {
  res.statusCode = Number(req.params.status);

  return res.send('Success');
});

/**
 * Say hello!
 */
app.all('/hello', (req, res) => res.send(`Hello ${req.query.name || 'World'}!`));

/**
 * Stream a file back to the user.
 */
app.all('/stream', (req, res) => fs.createReadStream(join(__dirname, 'fixtures/lorem.txt')).pipe(res));

/**
 * Create a bounce router, whose purpose is to give requests back to the user.
 */
const bounce = new express.Router()
  .all('/url', (req, res) => res.send(req.originalUrl))
  .all('/body', (req, res) => {
    if (req.headers['content-type']) {
      res.setHeader('Content-Type', req.headers['content-type']);
    }

    return req.pipe(res);
  })
  .all('/query', (req, res) => res.send(req.query))
  .all('/headers', (req, res) => {
    res.header(
      'Access-Control-Allow-Headers',
      'Authorization, X-Default-Header, X-Custom-Header'
    );

    return res.send(req.headers);
  })
  .all('/parameter/:id?', idParamHandler);

/**
 * Use the bouncers for the bounce and defaults routes.
 */
app.use(['/bounce', '/defaults'], bounce);

/**
 * Respond with the request uri parameter.
 */
app.all('/parameters/single/:id', idParamHandler);
app.all('/parameters/prefix/one:id', idParamHandler);
app.all('/parameters/prefix/three:id', idParamHandler);

/**
 * Respond with success.
 */
app.all('/extensions/static.json', successHandler);
app.all('/extensions/media-type/enum.:ext(json|xml)', successHandler);
app.all('/extensions/media-type/enum-period.:ext(json|xml)', successHandler);
app.all('/extensions/media-type/basic.:ext', successHandler);

/**
 * RAML conflict uris.
 */
app.all('/conflicts/media-type.json', successHandler);
app.all('/conflicts/media-type/route', successHandler);

/**
 * Respond with basic text.
 */
app.all('/responses/text', (req, res) => res.send('text'));

/**
 * Respond with JSON.
 */
app.all('/responses/json', (req, res) => res.send({ json: true }));

/**
 * Respond to url encoded endpoint.
 */
app.all('/responses/url-encoded/basic', (req, res) => {
  res.setHeader('Content-Type', 'application/x-www-form-urlencoded');

  return res.send('key=value');
});

/**
 * Respond to url encoded endpoint.
 */
app.all('/responses/url-encoded/duplicate', (req, res) => {
  res.setHeader('Content-Type', 'application/x-www-form-urlencoded');

  return res.send('key=1&key=2&key=3');
});

/**
 * Respond to url encoded endpoint.
 */
app.all('/responses/url-encoded/escaped', (req, res) => {
  res.setHeader('Content-Type', 'application/x-www-form-urlencoded');

  return res.send(qs.stringify({ key: 'Hello, world!' }));
});

/**
 * Listen to a port if the module wasn't required.
 */
if (!module.parent) {
  app.listen(port, () => {
    console.log(`Express running at http://localhost:${port}`); // eslint-disable-line no-console
  });
}
