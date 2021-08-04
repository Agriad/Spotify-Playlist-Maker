// https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// https://stackoverflow.com/questions/48268882/using-a-module-export-function-inside-the-same-file-same-file-where-its-impleme/48268950

const fs = require("fs");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const add_song = function (
    access_token,
    song_info,
    song_promise,
    playlist_id,
    counter
) {
    if (counter % 5 == 0) {
        sleep(500);
    }

    song_promise.then((response_text) => {
        if (counter % 100 == 0) {
            console.log("adding song: " + counter);
        }

        try {
            json_text = JSON.parse(response_text);
            track = json_text.tracks.items;

            if (track != null) {
                var song_id = track[0].id;
                var artist = track[0].artists[0].name;
                var title = track[0].name;

                if (
                    artist.toLowerCase() == song_info[1].toLowerCase() &&
                    title.toLowerCase() == song_info[0].toLowerCase()
                ) {
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
                        xmlHttp.setRequestHeader(
                            "Authorization",
                            "Bearer " + access_token
                        );
                        xmlHttp.setRequestHeader("Accept: application/json");
                        xmlHttp.send();

                        resolve(xmlHttp.responseText);
                    }).then((output) => {
                        list_song_info(song_info, true);
                    });
                } else {
                    list_song_info(song_info, false);
                }
            } else {
                list_song_info(song_info, false);
            }
        } catch (error) {
            console.log(error);
            console.log(song_info);
            list_song_info(song_info, false);
        }
    });
};

const list_playlist_song = function (playlist_info) {
    console.log("printing playlist to text");
    console.log(playlist_info);

    for (let i = 0; i < playlist_info.length; i++) {
        if (i % 100 == 0) {
            console.log("printing song: " + i);
        }

        var text =
            playlist_info[i][0] +
            " - " +
            playlist_info[i][1] +
            " - " +
            playlist_info[i][2] +
            "\n";
        fs.appendFile("../output/SongList.txt", text, function (error, result) {
            if (error) {
                console.log("Error:", e.stack);
            }
        });
    }

    console.log("Done");
};

const list_song_info = function (song_info, found) {
    var text = "";

    for (var i = 0; i < song_info.length; i++) {
        if (song_info[i] != undefined) {
            text = text + song_info[i] + " - ";
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

const playlist_to_text = function (access_token, playlist_id) {
    console.log("starting playlist to text transfer");

    // ask how many songs in playlist
    new Promise(function (resolve, reject) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(
            "GET",
            "https://api.spotify.com/v1/playlists/" +
                playlist_id +
                "/tracks?fields=total",
            false
        );

        xmlHttp.setRequestHeader("Authorization", "Bearer " + access_token);
        xmlHttp.send();

        resolve(xmlHttp.responseText);
    })
        .catch((error) => {
            console.log("error");
            console.log(error);
        })
        // keep asking for the next 100 songs in playlist
        .then((total_data) => {
            json_text = JSON.parse(total_data);
            var song_total = json_text.total;

            for (var index = 0; index < song_total; index += 100) {
                console.log("retrieving song: " + index);

                sleep(500);
                new Promise(function (resolve, reject) {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open(
                        "GET",
                        "https://api.spotify.com/v1/playlists/" +
                            playlist_id +
                            "/tracks?market=SE&limit=100&offset=" +
                            index,
                        false
                    );

                    xmlHttp.setRequestHeader(
                        "Authorization",
                        "Bearer " + access_token
                    );
                    xmlHttp.send();

                    resolve(xmlHttp.responseText);
                })
                    .catch((error) => {
                        console.log("error");
                        console.log(error);
                    })
                    // add the information to a list
                    .then((playlist_data) => {
                        json_text = JSON.parse(playlist_data);
                        var current_song_list = json_text.items;

                        for (var i = 0; i < current_song_list.length; i++) {
                            var artist = "";
                            var title = "";
                            var album = "";

                            try {
                                album = current_song_list[i].track.album.name;
                            } catch (error) {
                                album = "";
                            }

                            try {
                                var artist_list =
                                    current_song_list[i].track.artists;

                                for (let j = 0; j < artist_list.length; j++) {
                                    artist += artist_list[j].name;
                                    artist += ", ";
                                }

                                artist = artist.substr(0, artist.length - 2);
                            } catch (error) {
                                artist = "";
                            }

                            try {
                                title = current_song_list[i].track.name;
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

const search_song = function (access_token, song_list, playlist_id) {
    console.log("starting song search");

    for (var i = 0; i < song_list.length; i++) {
        if (i % 5 == 0) {
            sleep(1000);
        }
        if (i % 100 == 0) {
            console.log("search song: " + i);
        }

        var search_text = "";

        for (var j = 0; j < song_list[i].length; j++) {
            if (song_list[i][j] != null) {
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
            console.log(error);
        });

        add_song(access_token, song_list[i], song_promise, playlist_id, i);
    }
};

const sleep = function (milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
};

module.exports = {
    add_song,
    list_song_info,
    playlist_to_text,
    search_song,
    sleep,
};
