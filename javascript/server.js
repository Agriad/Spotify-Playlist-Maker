/* Load the HTTP library */
var http = require("http");
var fs = require("fs");
var app = require("app");

var javascript = require("./javascript");
var songPromise = require("./songPromise");

// Reads the html file to show it

fs.readFile("../index.html", function (err, html) {
  if (err) {
    throw err;
  }

  /* Create an HTTP server to handle responses */

  http
    .createServer(function (request, response) {
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(html);
      response.end();
    })
    .listen(80);
});

function banana() {
  console.log("banana");
}
