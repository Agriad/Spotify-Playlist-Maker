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

var clientID = "";
var clientSecret = "";
var redirectURI = "http://localhost:8000/callback";
var songList = [];
var currentAccessToken = "";
var stateKey = "spotify_auth_state";

/**
 * Retrieves the login information and then redirects to the Spotify login.
 */
app.post("/login", function (req, res) {
    clientID = req.body.client_id;
    clientSecret = req.body.client_secret;
    console.log(clientID);
    console.log(clientSecret);
    var state = functions.generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    // var scope = 'playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private';
    var scope =
        "playlist-modify-public playlist-read-collaborative playlist-read-private playlist-modify-private";
    res.redirect(
        "https://accounts.spotify.com/authorize?" +
            new URLSearchParams([
                ["response_type", "code"],
                ["client_id", clientID],
                ["scope", scope],
                ["redirect_uri", redirectURI],
                ["state", state],
            ])
    );
});

/**
 * After returning from Spotify login then send the page with automation options.
 */
app.get("/login", function (req, res) {
    res.sendFile(
        path.join(__dirname, "../public/spotify_options/spotifyoptions.html")
    );
});

/**
 * Callback from Spotify login. Parses the information to retrieve the access token.
 */
app.get("/callback", function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect("/#" + new URLSearchParams([["error", "state_mismatch"]]));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: "https://accounts.spotify.com/api/token",
            form: {
                code: code,
                redirect_uri: redirectURI,
                grant_type: "authorization_code",
            },
            headers: {
                Authorization:
                    "Basic " +
                    new Buffer.from(clientID + ":" + clientSecret).toString(
                        "base64"
                    ),
            },
            json: true,
        };

        new Promise(function (resolve, reject) {
            request.post(authOptions, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var accessToken = body.access_token,
                        refreshToken = body.refresh_token;

                    var options = {
                        url: "https://api.spotify.com/v1/me",
                        headers: { Authorization: "Bearer " + accessToken },
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

                    resolve(accessToken);
                } else {
                    res.redirect(
                        "/#" + new URLSearchParams([[error, "invalid_token"]])
                    );

                    reject("error");
                }
            });
        }).then((accessToken) => {
            currentAccessToken = accessToken;
            console.log(accessToken);
        });
    }
});

/**
 * When the user selects to add songs then retrieves the inputs and calls searchSong.
 */
app.post("/add_songs", function (req, res) {
    console.log("starting song adding");
    try {
        var songAddress = req.body.song_location;
        var mp3Files = fs.readdirSync(songAddress);

        for (var i = 0; i < mp3Files.length; i++) {
            var tags = nodeID3.read(songAddress + "/" + mp3Files[i]);
            var songTitle = tags.title;
            var songArtist = tags.artist;
            var songAlbum = tags.album;
            var songInfo = [songTitle, songArtist, songAlbum];
            songList.push(songInfo);

            if (i % 100 == 0) {
                console.log("parsing song: " + i);
            }
        }
    } catch (e) {
        console.log("Error:", e.stack);
    }
    functions.sleep(500);
    functions.searchSong(currentAccessToken, songList, req.body.playlist_id);
});

/**
 * When the user selects to add songs then retrieves the inputs and calls playlistToText.
 */
app.post("/playlist_text", function (req, res) {
    functions.playlistToText(currentAccessToken, req.body.playlist_id);
});

app.listen(8000);
console.log("Running");
