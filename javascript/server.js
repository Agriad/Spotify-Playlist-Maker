// Created with the help of the example spotify code, specifically the authentication code method
// https://github.com/spotify/web-api-auth-examples

/* Load the HTTP library */
const fs = require("fs");
const express = require("express");
const request = require("request"); // "Request" library
const app = express();
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const nodeID3 = require("node-id3");
const path = require("path");
const functions = require("./functions");

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

app.use(express.static(__dirname + "/../public/index"))
    .use(cors())
    .use(cookieParser())
    .use(express.json())
    .use(
        express.urlencoded({
            extended: true,
        })
    );

var client_id = "";
var client_secret = "";
var redirect_uri = "http://localhost:8000/callback";
var playlist_id = "";
var song_list = [];
var current_access_token = "";

try {
    var data = fs.readFileSync("../secret/secret.txt", "utf8");
    var data_string = data.toString();
    var data_words = data_string.split("\n");

    client_id = data_words[0].substr(0, data_words[0].length);
    client_secret = data_words[1].substr(0, data_words[1].length);
    redirect_uri = data_words[2].substr(0, data_words[2].length);
    playlist_id = data_words[3];
} catch (e) {
    console.log("Using input field");
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

app.post("/login", function (req, res) {
    client_id = req.body.client_id;
    client_secret = req.body.client_secret;
    console.log(client_id);
    console.log(client_secret);
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    // var scope = 'playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
    var scope =
        "playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private";
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

app.get("/login", function (req, res) {
    res.sendFile(
        path.join(__dirname, "../public/spotify_options/spotifyoptions.html")
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
                    new Buffer.from(client_id + ":" + client_secret).toString(
                        "base64"
                    ),
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

                    res.sendFile(
                        path.join(
                            __dirname,
                            "../public/spotify_options/spotifyoptions.html"
                        )
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
            current_access_token = access_token;
            console.log(song_list);
            console.log(access_token);
        });
    }
});

app.post("/add_songs", function (req, res) {
    console.log("starting song adding");
    try {
        var song_address = req.body.song_location;
        var mp3_files = fs.readdirSync(song_address);

        for (var i = 0; i < mp3_files.length; i++) {
            var tags = nodeID3.read(song_address + "/" + mp3_files[i]);
            var song_title = tags.title;
            var song_artist = tags.artist;
            var song_album = tags.album;
            var song_info = [song_title, song_artist, song_album];
            song_list.push(song_info);

            if (i % 100 == 0) {
                console.log("parsing song: " + i);
            }
        }
    } catch (e) {
        console.log("Error:", e.stack);
    }
    functions.sleep(500);
    functions.search_song(
        current_access_token,
        song_list,
        req.body.playlist_id
    );
});

app.post("/playlist_text", function (req, res) {
    functions.playlist_to_text(current_access_token, req.body.playlist_id);
});

app.listen(8000);
console.log("Running");
