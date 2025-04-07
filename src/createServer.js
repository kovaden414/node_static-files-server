'use strict';

const fsp = require('fs/promises');
const http = require('http');
const url = require('url');

function createServer() {
  const server = http.createServer(async (req, res) => {
    const normalizedURL = new url.URL(req.url, `http://${req.headers.host}`);
    const normalizedPath =
      normalizedURL.pathname.replace(/^\/file\//, '') || 'index.html';

    if (
      !normalizedURL.pathname.startsWith('/file') ||
      normalizedURL.pathname.includes('..')
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Invalid file path');
    }

    if (!normalizedURL.pathname.startsWith('/file/')) {
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Path should start with "/file/"');
    }

    if (normalizedPath.includes('//')) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Paths have duplicated slashes');
    }

    try {
      const file = await fsp.readFile(`./public/${normalizedPath}`, 'utf-8');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(file);
    } catch (error) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Not Found');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
