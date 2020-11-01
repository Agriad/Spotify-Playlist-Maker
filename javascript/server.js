// Created with the help of the example spotify code, specifically the authentication code method
// https://github.com/spotify/web-api-auth-examples

/* Load the HTTP library */
var http = require("http");
var fs = require("fs");
var express = require("express");
var request = require("request"); // "Request" library
var app = express();
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");
var nodeID3 = require("node-id3");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var javascript = require("./javascript");
var songPromise = require("./songPromise");
const { test } = require("./javascript");
const { response } = require("express");

app
  .use(express.static(__dirname + "/../public"))
  .use(cors())
  .use(cookieParser());

var client_id = "";
var client_secret = "";
var redirect_uri = "";
var playlist_id = "";

try {
  var data = fs.readFileSync("../secret/secret.txt", "utf8");
  var data_string = data.toString();
  var data_words = data_string.split("\n");

  client_id = data_words[0].substr(0, data_words[0].length - 1);
  client_secret = data_words[1].substr(0, data_words[1].length - 1);
  redirect_uri = data_words[2].substr(0, data_words[2].length - 1);
  playlist_id = data_words[3];
} catch (e) {
  console.log("Error:", e.stack);
}

var song_list = [];

try {
  var song_address = "D:/Music/My songs test";
  var mp3_files = fs.readdirSync(song_address);

  for (var i = 0; i < mp3_files.length; i++) {
    var tags = nodeID3.read(song_address + "/" + mp3_files[i]);
    var song_title = tags.title;
    var song_artist = tags.artist;
    var song_album = tags.album;
    var song_info = [song_title, song_artist, song_album];
    song_list.push(song_info);
  }
} catch (e) {
  console.log("Error:", e.stack);
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// app.get('/one', function(request, response) {
//   // test.test();
//   response.writeHead(200, {"Content-Type": "text/plain"})
//   response.write("golem");
//   response.end();

//   console.log(request);
//   console.log("something");

//   return response.get;
// });

var stateKey = "spotify_auth_state";

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  // var scope = 'playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
  var scope = "playlist-read-private playlist-modify-private";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    new Promise(function (resolve, reject) {
      request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var access_token = body.access_token,
            refresh_token = body.refresh_token;

          access_token_test = access_token;

          var options = {
            url: "https://api.spotify.com/v1/me",
            headers: { Authorization: "Bearer " + access_token },
            json: true,
          };

          // use the access token to access the Spotify Web API
          request.get(options, function (error, response, body) {
            console.log(body);
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect(
            "/#" +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token,
              })
          );

          resolve(access_token);
        } else {
          res.redirect(
            "/#" +
              querystring.stringify({
                error: "invalid_token",
              })
          );

          reject("error");
        }
      });
    }).then((access_token) => {
      // testing(access_token);
      var song_promises = search_song(access_token, song_list);
      var song_playlist_info = add_song(access_token, song_list, song_promises, playlist_id);
      list_song_info(song_playlist_info);
    });
  }
});

function testing(access_token) {
  var xmlHttp = new XMLHttpRequest();
  // xmlHttp.open("GET", "https://api.spotify.com/v1/search" + "?q=tania%20bowra&type=artist", false); // false for synchronous request
  xmlHttp.open(
    "GET",
    "https://api.spotify.com/v1/search" +
      "?q=get%20lucky%20daft%20punk&type=track&offset=0&limit=1",
    false
  ); // false for synchronous request
  xmlHttp.setRequestHeader("Authorization", "Bearer " + access_token);
  xmlHttp.send();
  // console.log(xmlHttp.responseText);

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open(
    "POST",
    "POST https://api.spotify.com/v1/playlists/" +
      playlist_id +
      "/tracks" +
      "?uris=spotify%3Atrack%2ePFIvZKMe8zefATp9ofFA",
    false
  );
  xmlHttp.setRequestHeader("Authorization", "Bearer " + access_token);
  xmlHttp.send();
  console.log(xmlHttp.responseText);
}

function list_song_info(song_playlist_info) {
  for (var i = 0; i < song_playlist_info[0].length; i++) {
    try {
      fs.writeFile("../output/FoundList.txt", song_playlist_info[0][i]);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }

  for (var i = 0; i < song_playlist_info[1].length; i++) {
    try {
      fs.writeFile("../output/NotFoundList.txt", song_playlist_info[1][i]);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }
}

function add_song(access_token, song_list, song_promises, playlist_id) {
  var song_found = [];
  var song_not_found = [];

  for (var i = 0; i < song_promises.length; i++) {
    song_promise = song_promises[i];

    song_promise.then((response_text) => {
      json_text = JSON.parse(response_text);
      track = json_text.tracks.items;

      if (track != null) {
        song_id = track.id;
        artist = track.album.artists.name;
        title = track.name;

        if (artist == song_list[1] && title == song_list[0]) {
          song_found.push([song_id, song_list[i]]);
        } else {
          song_not_found.push(song_list[i]);
        }
      } else {
        song_not_found.push(song_list[i]);
      }
    });
  }

  for (var i = 0; i < song_found.length; i++) {
    xmlHttp.open(
      "POST",
      "https://api.spotify.com/v1/playlists/" +
        playlist_id +
        "tracks?uris=spotify%3Atrack%3" +
        song_found[0][i],
      false
    ); // false for synchronous request
    xmlHttp.setRequestHeader("Authorization", "Bearer " + access_token);
    xmlHttp.setRequestHeader("Accept: application/json");
    xmlHttp.send();
  }

  var song_playlist_info = [song_found, song_not_found];

  return song_playlist_info;
}

function search_song(access_token, song_list) {
  var song_promises = [];
  var counter = 0;

  for (var i = 0; i < song_list.length; i++) {
    if (counter % 5 == 0) {
      sleep(500).then();
    }

    var search_text = "";

    for (var j = 0; j < song_list[i].length; j++) {
      if (song_list[i][j] != null) {
        search_text.push(song_list[i][j] + "%20");
      }
    }

    var song_promise = new Promise(function (resolve, reject) {
      xmlHttp.open(
        "GET",
        "https://api.spotify.com/v1/search?q=" +
          search_text +
          "&type=track&offset=0&limit=1",
        false
      ); // false for synchronous request
      xmlHttp.setRequestHeader("Authorization", "Bearer " + access_token);
      xmlHttp.send();

      resolve(xmlHttp.responseText);
    });

    song_promises.push(song_promise);
  }

  return song_promises;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(80);
