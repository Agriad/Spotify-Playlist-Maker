module.exports = {
  test: test(),
};

function test() {
  getSpotifySecret();
}

// // The main function that runs the entire program
// function spotifyAdd() {
//   let songlistPromise = getLocalFiles();
//   let spotifySecretPromise = getSpotifySecret();
//   Promise.all([songlistPromise, spotifySecretPromise]).then((values) => {
//     let songListObject = values[0];
//     console.log(songListObject);
//     let spotifySecret = values[1];
//     let spotifyAccessTokenPromise = requestAuthorizationSpotify(spotifySecret);
//     spotifyAccessTokenPromise.then((spotifyAccessToken) => {
//       let songPromises = getSpotifySongID(spotifyAccessToken, songListObject);

//       console.log(spotifyAccessToken);

//       let songIDNotFound = [];
//       let songIDFound = [];
//       let spotifySecretJSON = JSON.parse(spotifySecret);
//       let playlistID = spotifySecretJSON.playlistID;
//       let counter = 0;
//       // iterateSongPromise(
//       //   songPromises,
//       //   songIDNotFound,
//       //   songIDFound,
//       //   spotifyAccessToken,
//       //   playlistID,
//       //   counter
//       // );
//     });
//   });
// }

// // Promises and ajax: https://stackoverflow.com/questions/37741859/how-to-use-promises-or-complete-an-ajax-request-before-the-function-finishes

// // Calls the local files php to get song data
// function getLocalFiles() {
//   return new Promise(function (resolve, reject) {
//     $.ajax({
//       data: "",
//       url: "php/GetLocalFiles.php",
//       method: "GET",
//       success: function (msg) {
//         resolve(msg);
//       },
//       error: function (msg) {
//         reject(msg);
//       },
//     });
//   });
// }

// Calls the spotify secret php to get account info
function getSpotifySecret() {
  let file = "../secret/secret.txt";
  fs = require("fs");
  fs.readFile(file, "utf8", function (err, data) {
      if (err) {
          return console.log(err);
      }

      console.log(data);
  });
}

// // Takes in list of songs to send search request to spotify
// function getSpotifySongID(spotifyAccessToken, songListObject) {
//   songListObject = JSON.parse(songListObject);
//   let songList = songListObject.song_list;
//   let songCounter = songListObject.song_counter;
//   let songPromises = [];

//   for (let i = 0; i < songCounter; i++) {
//     let song = songList[i];

//     let artist = song.artist.replace(/\s/g, "%20");
//     let title = song.title.replace(/\s/g, "%20");
//     let album = song.album.replace(/\s/g, "%20");

//     if (i % 10 == 0) {
//       wait(500);
//       counter = 0;
//     }
//     counter++;

//     const myURL =
//       "https://api.spotify.com/v1/search?q=" +
//       title +
//       "%20" +
//       artist +
//       "&type=track";

//     let songPromise = new Promise(function (resolve, reject) {
//       let data = JSON.stringify({
//         title: title,
//         artist: artist,
//         spotifyAccessToken: spotifyAccessToken,
//       });
//       return $.ajax({
//         url: "php/GetSongSpotify.php",
//         type: "post",
//         dataType: "json",
//         data: data,
//         success: function (data) {
//           resolve(data);
//         },
//         error: function (msg) {
//           reject(msg);
//         },
//       });
//     });

//     if (i == 0) {
//       songPromises = new SongPromise(
//         songPromise,
//         null,
//         song.artist,
//         song.title,
//         song.album
//       );
//     } else {
//       songPromises = new SongPromise(
//         songPromise,
//         songPromises,
//         song.artist,
//         song.title,
//         song.album
//       );
//     }
//   }

//   return songPromises;
// }

// // Goes through promises in a linear way to get song id from spotify
// function iterateSongPromise(
//   songPromises,
//   songIDNotFound,
//   songIDFound,
//   spotifyAccessToken,
//   playlistID,
//   counter
// ) {
//   if (songPromises == null) {
//     console.log("fail");
//     let songIDNotFoundObject = new Object();
//     songIDNotFoundObject.songNotFound = songIDNotFound;
//     let songIDNotFoundJSONObject = JSON.stringify(songIDNotFoundObject);
//     writeToFileNotFound(songIDNotFoundJSONObject);
//     let songIDFoundObject = new Object();
//     songIDFoundObject.songNotFound = songIDFound;
//     let songIDFoundJSONObject = JSON.stringify(songIDFoundObject);
//     writeToFileFound(songIDFoundJSONObject);
//   } else {
//     let promise = songPromises.getPromise();
//     let songInfo = songPromises.getSongInfo();
//     console.log(promise);

//     if (counter == 25) {
//       wait(500);
//       counter = 0;
//     }
//     counter++;

//     promise.then((messages) => {
//       console.log(messages);
//       let spotifyData = messages.tracks;
//       let spotifySong = spotifyData.items;
//       if (spotifySong.length == 0) {
//         songIDNotFound.push(songInfo);
//       } else {
//         let spotifySongID = spotifySong[0].id;
//         console.log(spotifySongID);
//         songIDFound.push(songInfo);

//         let json = JSON.stringify({
//           spotifySongID: spotifySongID,
//           spotifyAccessToken: spotifyAccessToken,
//           playlistID: playlistID,
//         });

//         $.ajax({
//           type: "post",
//           url: "php/AddSongSpotify.php",
//           data: json,
//           success: function (data) {
//             console.log("success");
//             console.log(data);
//           },
//           error: function (e) {
//             console.log("error");
//             console.log(e);
//           },
//         });
//       }
//       let before = songPromises.getPrevious();
//       iterateSongPromise(
//         before,
//         songIDNotFound,
//         songIDFound,
//         spotifyAccessToken,
//         playlistID,
//         counter
//       );
//     });
//   }
// }

// // Using authorization code authorization step 1
// // Authorize this program to handle stuff for the account given
// function requestAuthorizationSpotify(spotifySecret) {
//   let spotifySecretJSON = JSON.parse(spotifySecret);
//   // https://stackoverflow.com/questions/38198071/setting-localhost-as-a-spotify-redirect-uri
//   // https://glitch.com/~spotify-implicit-grant

//   let clientID = spotifySecretJSON.clientID.split("\r")[0];
//   let clientSecret = spotifySecretJSON.clientSecret.split("\r")[0];
//   let redirectURI = spotifySecretJSON.redirectURI.split("\r")[0];

//   const url =
//     "https://accounts.spotify.com/authorize?client_id=" +
//     clientID +
//     "&response_type=token&scope=playlist-modify-private&redirect_uri=" +
//     redirectURI;

//   location.replace(url);

//   let clientData = new Promise(function (resolve, reject) {
//     let urlHash = window.location.hash;
//     let urlHashPart = urlHash.split("&");
//     urlHashPart = urlHashPart[0].split("=");
//     let spotifyAuthorization = urlHashPart[1];
//     let json = JSON.stringify({
//       clientID: clientID,
//       clientSecret: clientSecret,
//       redirectURI: redirectURI,
//       playlistID: spotifySecretJSON.playlistID,
//       authorization: spotifyAuthorization,
//     });
//     resolve(json);
//     reject(json);
//   });

//   return clientData;
// }

// // Using authorization code authorization step 2
// // Authorize this program to handle stuff for the account given
// function requestRefreshAccessToken(spotifySecret) {
//   let jsonInput = JSON.parse(spotifySecret);
//   let jsonOutput = JSON.stringify({
//     clientID: jsonInput.clientID,
//     clientSecret: jsonInput.clientSecret,
//     redirectURI: jsonInput.redirectURI,
//     playlistID: jsonInput.playlistID,
//     authorization: jsonInput.authorization,
//   });
//   return new Promise(function (resolve, reject) {
//     return $.ajax({
//       data: jsonOutput,
//       url: "php/RequestRefreshAccessToken.php",
//       method: "post",
//       success: function (msg) {
//         resolve(msg);
//       },
//       error: function (msg) {
//         reject(msg);
//       },
//     });
//   });

//   // let jsonInput = JSON.parse(spotifySecret);

//   // let headerStart = "Authorization: Basic ";
//   // let headerEnd = btoa(jsonInput.clientID.concat(":").concat(jsonInput.clientSecret));
//   // let header = headerStart.concat(headerEnd);

//   // let url = "https://accounts.spotify.com/api/token";

//   // return new Promise(function (resolve, reject) {
//   //   return $.ajax({
//   //     method: "post",
//   //     headers: {
//   //       header
//   //     },
//   //     data: {
//   //       grant_type: "authorization_code",
//   //       code: jsonInput.authorization,
//   //       redirect_uri: jsonInput.redirectURI
//   //     },
//   //     url: url,
//   //     success: function(msg) {
//   //       console.log("success");
//   //       resolve(msg);
//   //     },
//   //     error: function(msg) {
//   //       console.log("fail");
//   //       reject(msg);
//   //     }
//   //   });
//   // });
// }

// // sends list of found songs to get written by php
// function writeToFileFound(songIDFoundJSONObject) {
//   $.ajax({
//     type: "post",
//     url: "php/PutSongFound.php",
//     data: songIDFoundJSONObject,
//     success: function (data) {
//       console.log("success");
//     },
//     error: function (e) {
//       console.log(e);
//     },
//   });
// }

// // wait function
// function wait(ms) {
//   var date = new Date();
//   var date2 = null;
//   do {
//     date2 = new Date();
//   } while (date2 - date < ms);
// }

// // sends list of not found songs to get written by php
// // https://stackoverflow.com/questions/10955017/sending-json-to-php-using-ajax
// function writeToFileNotFound(songIDFoundJSONObject) {
//   $.ajax({
//     type: "post",
//     url: "php/PutSongNotFound.php",
//     data: songIDFoundJSONObject,
//     success: function (data) {
//       console.log("success");
//     },
//     error: function (e) {
//       console.log(e);
//     },
//   });
// }
