# Spotify-Playlist-Maker-2nd-Attempt

# Index
1. [Description](#description)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Guide](#guide)

<a name="description"></a>
## 1. Description
Takes local mp3 files and adds them to spotify playlist by searching the artist and title. If not found it will add the local file into the playlist or it is placed into a text file to be sorted manually.

<a name="requirements"></a>
## 2. Requirements
1. Node.js

<a name="installation"></a>
## 3. Installation
1. Download as a zip and extract anywhere.
2. Run `npm install` in the root folder.

<a name="guide"></a>
## 4. Guide
### Option 1
1. Go to Spotify for Developers and create an app for this program.
1. In the settings for the app add `http://localhost:8000/callback` as the redirect 
1. Inside `javascript/server.js` you will find `var song_address = "D:/Music/My songs";`, change `"D:/Music/My songs";` into the location that you want the program to look at. You can either put the full path or the path from the `javascript` folder.
1. Run `npm start` in the root folder or `node server.js` in the javascript folder.
1. In your browser go to `localhost:8000`
1. Click on `Test` button.
