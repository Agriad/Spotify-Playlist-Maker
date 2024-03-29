// https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// https://stackoverflow.com/questions/48268882/using-a-module-export-function-inside-the-same-file-same-file-where-its-impleme/48268950

const fs = require("fs");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/**
 * Adds the specified song into the targeted Spotify playlist if the mp3 information and Spotify information matches.
 * @param {String} accessToken Access token from Spotify.
 * @param {Object} songInfo 2D list of strings containing the artist, title, and album.
 * @param {Promise} songPromise The search Promise of the song.
 * @param {String} playlistID ID of the playlist.
 * @param {Number} counter Index of the song.
 */
const addSong = function (
    accessToken,
    songInfo,
    songPromise,
    playlistID,
    counter
) {
    if (counter % 5 == 0) {
        sleep(500);
    }

    songPromise.then((responseText) => {
        if (counter % 100 == 0) {
            console.log("adding song: " + counter);
        }

        try {
            jsonObject = JSON.parse(responseText);
            track = jsonObject.tracks.items;

            if (track != null) {
                var songID = track[0].id;
                var artist = track[0].artists[0].name;
                var title = track[0].name;

                if (
                    artist.toLowerCase() == songInfo[1].toLowerCase() &&
                    title.toLowerCase() == songInfo[0].toLowerCase()
                ) {
                    new Promise(function (resolve, reject) {
                        var xmlHttp = new XMLHttpRequest();
                        xmlHttp.open(
                            "POST",
                            "https://api.spotify.com/v1/playlists/" +
                                playlistID +
                                "/tracks?uris=spotify%3Atrack%3A" +
                                songID,
                            false
                        ); // false for synchronous request
                        xmlHttp.setRequestHeader(
                            "Authorization",
                            "Bearer " + accessToken
                        );
                        xmlHttp.setRequestHeader("Accept: application/json");
                        xmlHttp.send();

                        resolve(xmlHttp.responseText);
                    }).then((output) => {
                        listSongInfo(songInfo, true);
                    });
                } else {
                    listSongInfo(songInfo, false);
                }
            } else {
                listSongInfo(songInfo, false);
            }
        } catch (error) {
            console.log(error);
            console.log(songInfo);
            listSongInfo(songInfo, false);
        }
    });
};

/**
 * Generates a random string containing numbers and letters.
 * @param  {Number} length The length of the string.
 * @return {String} The generated string.
 */
const generateRandomString = function (length) {
    var text = "";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

/**
 * Adds the song information to different text file depending if it was found or not.
 * @param {Object} songInfo 2D list of strings containing the artist, title, and album.
 * @param {Boolean} found Tells whether the song is found or not in Spotify.
 */
const listSongInfo = function (songInfo, found) {
    var text = "";

    for (var i = 0; i < songInfo.length; i++) {
        if (songInfo[i] != undefined) {
            text = text + songInfo[i] + " - ";
        }
    }

    text = text + "\n";

    if (found) {
        fs.appendFile(
            "../output/FoundList.txt",
            text,
            function (error, result) {
                if (error) {
                    console.log("Error:", e.stack);
                }
            }
        );
    } else {
        fs.appendFile(
            "../output/NotFoundList.txt",
            text,
            function (error, result) {
                if (error) {
                    console.log("Error:", e.stack);
                }
            }
        );
    }
};

/**
 * Retrieves the playlist, extract the artist, title, and album, and then prints into a text file.
 * @param {String} accessToken Access token from Spotify.
 * @param {String} playlistID ID of the playlist.
 */
const playlistToText = function (accessToken, playlistID) {
    console.log("starting playlist to text transfer");

    // ask how many songs in playlist
    new Promise(function (resolve, reject) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(
            "GET",
            "https://api.spotify.com/v1/playlists/" +
                playlistID +
                "/tracks?fields=total",
            false
        );

        xmlHttp.setRequestHeader("Authorization", "Bearer " + accessToken);
        xmlHttp.send();

        resolve(xmlHttp.responseText);
    })
        .catch((error) => {
            console.log("error");
            console.log(error);
        })
        // keep asking for the next 100 songs in playlist
        .then((totalData) => {
            jsonObject = JSON.parse(totalData);
            var songTotal = jsonObject.total;

            for (var index = 0; index < songTotal; index += 100) {
                console.log("retrieving song: " + index);

                sleep(500);
                new Promise(function (resolve, reject) {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open(
                        "GET",
                        "https://api.spotify.com/v1/playlists/" +
                            playlistID +
                            "/tracks?market=SE&limit=100&offset=" +
                            index,
                        false
                    );

                    xmlHttp.setRequestHeader(
                        "Authorization",
                        "Bearer " + accessToken
                    );
                    xmlHttp.send();

                    resolve(xmlHttp.responseText);
                })
                    .catch((error) => {
                        console.log("error");
                        console.log(error);
                    })
                    // add the information to a list
                    .then((playlistData) => {
                        jsonObject = JSON.parse(playlistData);
                        var currentSongList = jsonObject.items;

                        for (var i = 0; i < currentSongList.length; i++) {
                            var artist = "";
                            var title = "";
                            var album = "";

                            try {
                                album = currentSongList[i].track.album.name;
                            } catch (error) {
                                album = "";
                            }

                            try {
                                var artistList =
                                    currentSongList[i].track.artists;

                                for (let j = 0; j < artistList.length; j++) {
                                    artist += artistList[j].name;
                                    artist += ", ";
                                }

                                artist = artist.substr(0, artist.length - 2);
                            } catch (error) {
                                artist = "";
                            }

                            try {
                                title = currentSongList[i].track.name;
                            } catch (error) {
                                title = "";
                            }

                            var text =
                                artist + " - " + title + " - " + album + "\n";
                            fs.appendFile(
                                "../output/SongList.txt",
                                text,
                                function (error, result) {
                                    if (error) {
                                        console.log("Error:", e.stack);
                                    }
                                }
                            );
                        }
                    });
            }

            console.log("Done");
        });
};

/**
 * Searches the song on Spotify and then calls addSong.
 * @param {String} accessToken Access token from Spotify.
 * @param {List} songList 2D list of strings containing the artist, title, and album.
 * @param {String} playlistID ID of the playlist.
 */
const searchSong = function (accessToken, songList, playlistID) {
    console.log("starting song search");

    for (var i = 0; i < songList.length; i++) {
        if (i % 5 == 0) {
            sleep(1000);
        }
        if (i % 100 == 0) {
            console.log("search song: " + i);
        }

        var searchText = "";

        for (var j = 0; j < songList[i].length; j++) {
            if (songList[i][j] != null) {
                var text = songList[i][j];
                var asciiText = text.replace(/[^\x00-\x7F]/g, "");
                var replacedText = asciiText.split(" ").join("%20");
                if (j < songList[i].length - 1) {
                    searchText = searchText + replacedText + "%20";
                } else {
                    searchText = searchText + replacedText;
                }
            }
        }

        var songPromise = new Promise(function (resolve, reject) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open(
                "GET",
                "https://api.spotify.com/v1/search?q=" +
                    searchText +
                    "&type=track&offset=0&limit=1",
                false
            ); // false for synchronous request
            xmlHttp.setRequestHeader("Authorization", "Bearer " + accessToken);
            xmlHttp.send();

            resolve(xmlHttp.responseText);
        }).catch((error) => {
            console.log(error);
        });

        addSong(accessToken, songList[i], songPromise, playlistID, i);
    }
};

/**
 * A sleep function in milliseconds.
 * @param {Number} milliseconds Number of milliseconds.
 */
const sleep = function (milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
};

module.exports = {
    generateRandomString,
    playlistToText,
    searchSong,
    sleep,
};
