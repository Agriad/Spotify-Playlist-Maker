// Created with the help of the example spotify code, specifically the authentication code method
// https://github.com/spotify/web-api-auth-examples

/* Load the HTTP library */
var http = require("http");
var fs = require("fs");
var express = require("express");
var request = require('request'); // "Request" library
var app = express();
var cors = require("cors");
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var javascript = require("./javascript");
var songPromise = require("./songPromise");
const { test } = require("./javascript");

// Reads the html file to show it
// fs.readFile("../index.html", function (err, html) {
//   if (err) {
//     throw err;
//   }

//   /* Create an HTTP server to handle responses */

//   http
//     .createServer(function (request, response) {
//       response.writeHead(200, { "Content-Type": "text/html" });
//       response.write(html);
//       response.end();
//     })
//     .listen(80);
// });

// app.use(express.static(__dirname + '/public'))
//    .use(cors())
//    .use(cookieParser());

// app.use(express.static("D:/Games/Programming/Git/Spotify-Playlist-Maker-2nd-Attempt/public"))
//    .use(cors())
//    .use(cookieParser());

app.use(express.static(__dirname + "/../public"))
   .use(cors())
   .use(cookieParser());

var client_id = "";
var client_secret = "";
var redirect_uri = "";
var playlist_id = "";

try {  
  var data = fs.readFileSync('../secret/secret.txt', 'utf8');
  var data_string = data.toString();
  var data_words = data_string.split("\n");
  client_id = data_words[0];
  client_secret = data_words[1];
  redirect_uri = data_words[2];
  playlist_id = data_words[3];

  console.log(client_id);

} catch(e) {
  console.log('Error:', e.stack);
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// app.get('/one', function(request, response) {
//   test.test();
//   response.writeHead(200, {"Content-Type": "text/plain"})
//   response.write("golem");
//   response.end();

//   console.log(request);
//   console.log("something");

//   return response.get;
// });

app.get('/login', function(req, res) {

  console.log("/login activated")

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.listen(80)