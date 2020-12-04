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
  // var song_address = "D:/Music/My song another test";
  // var song_address = "D:/Music/My songs";
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
      // console.log("here 1");
      // console.log(song_list);
      // var song_promises = search_song(access_token, song_list, playlist_id);
      // var song_playlist_info = add_song(access_token, song_list, song_promises, playlist_id);
      // console.log(song_playlist_info);
      // list_song_info(song_playlist_info);
      search_song(access_token, song_list, playlist_id);
    });
  }
});

function add_song(access_token, song_info, song_promise, playlist_id) {
  var song_found = [];
  var song_not_found = [];

  // console.log("pirarucu");
  // console.log(song_info);

  song_promise.then((response_text) => {
    // console.log(response_text);
    json_text = JSON.parse(response_text);
    track = ""

    // console.log("onion");
    // console.log(song_info);

    try {
      track = json_text.tracks.items;
      // console.log(track);
      if (track != null) {
        // console.log("happy");

        var something = track[0].artists
        // console.log(something);

        var song_id = track[0].id;
        var artist = track[0].artists[0].name
        var title = track[0].name;

        // console.log("a" + song_id + "a");
        // console.log("a" + artist + "a");
        // console.log("a" + song_info[1] + "a")
        // console.log("a" + title + "a");
        // console.log("a" + song_info[0] + "a")

        // if (artist == song_info[1]) {
        //   console.log("artist success");
        // }

        // if (title == song_info[0]) {
        //   console.log("title success");
        // }

        if (artist == song_info[1] && title == song_info[0]) {
          // console.log("something success");

          new Promise(function (resolve, reject) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open(
              "POST",
              "https://api.spotify.com/v1/playlists/" +
                playlist_id +
                "/tracks?uris=spotify%3Atrack%3A" +
                song_id,
              false
            ); // false for synchronous request
            xmlHttp.setRequestHeader("Authorization", "Bearer " + access_token);
            xmlHttp.setRequestHeader("Accept: application/json");
            xmlHttp.send();
      
            resolve(xmlHttp.responseText);
          }).then((output) => {
            // console.log(output);
            list_song_info(song_info, true);
          });
        } else {
          song_not_found.push(song_list[0]);
          list_song_info(song_info, false);
        }
      } else {
        song_not_found.push(song_list[0]);
        list_song_info(song_info, false);
      }
    } catch (error) {
      song_not_found.push(song_list[0]);
      list_song_info(song_info, false);
      // console.log("sad");
    }
  });
}

function list_song_info(song_info, found) {
  // console.log("yay reaching somewhere");
  // console.log(song_info);
  var text = ""

  for (var i = 0; i < song_info.length; i++) {
    if (song_info[i] != undefined) {
      text = text + song_info[i] + " - ";
    }
  }

  text = text + "\n";

  if (found) {
    fs.appendFile("../output/FoundList.txt", text, function(error, result) {
      if (error) {
        console.log("Error:", e.stack);
      }
    });
  } else {
    fs.appendFile("../output/NotFoundList.txt", text, function(error, result) {
      if (error) {
        console.log("Error:", e.stack);
      }
    });
  }
}

function search_song(access_token, song_list, playlist_id) {
  var counter = 0;

  for (var i = 0; i < song_list.length; i++) {
    if (counter % 5 == 0) {
      sleep(500);
    }

    // console.log("bolter")

    var search_text = "";

    for (var j = 0; j < song_list[i].length; j++) {
      if (song_list[i][j] != null) {
        // console.log(song_list[i][j])
        var text = song_list[i][j];
        var ascii_text = text.replace(/[^\x00-\x7F]/g, "");
        var replaced_text = ascii_text.split(" ").join("%20");
        if (j < song_list[i].length - 1) {
          search_text = search_text + replaced_text + "%20";
        } else {
          search_text = search_text + replaced_text;
        }
      }
    }

    // console.log(search_text)
    // console.log("https://api.spotify.com/v1/search?q=" + search_text + "&type=track&offset=0&limit=1");

    var song_promise = new Promise(function (resolve, reject) {
      var xmlHttp = new XMLHttpRequest();
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
    }).catch((error) => {
      // console.log("sucks");
      console.log(error);
    });

    // song_promise.then((something) => {
    //   console.log(something);
    // });

    // sleep(2000)

    add_song(access_token, song_list[i], song_promise, playlist_id);
  }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

app.listen(80);
