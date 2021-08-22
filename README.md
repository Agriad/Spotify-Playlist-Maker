# Spotify-Playlist-Maker-2nd-Attempt

# Index
1. [Description](#description)
1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Guide](#guide)
1. [Program Input Guide](#program_input_guide)
1. [Song Location Guide](#song_location_guide)

<a name="description"></a>
## Description
Spotify automation program with multiple functions.  
* Takes local mp3 files and adds them to spotify playlist by searching the artist and title. If it is not found, it will add the information into a text file for the user to add manually to their playlist. Also shows the information of songs that were added into the playlist into another text file.  
* Backup your playlist on Spotify into a text file with information of the artist, title of the song, and album. The text file produced will be located in the `output` folder.

<a name="requirements"></a>
## Requirements
1. Node.js

<a name="installation"></a>
## Installation
1. Download as a zip and extract anywhere.
2. Run `npm install` in the root folder.

<a name="guide"></a>
## Guide
1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard/) and create an app for this program.
1. In the settings for the app add `http://localhost:8000/callback` as the redirect 
1. Run `npm start` in the root folder or `node server.js` in the javascript folder.
1. In your browser go to `localhost:8000`
1. Click on `Login` button.
1. Fill in the appropriate input. See more information [here](#program_input_guide).
1. Check the terminal to see if things are going smoothly.

<a name="program_input_guide"></a>
## Program Input Guide
* Client ID = Found in [Spotify for Developers](https://developer.spotify.com/dashboard/) inside the app dashboard.  
* Client Secret = Found in [Spotify for Developers](https://developer.spotify.com/dashboard/) inside the app dashboard. Requires you to click show client secret. 
* Playlist ID = Found in [Spotify Web Player](https://open.spotify.com/). When you enter a playlist it shows in the URL after `playlist/` and before `?`.  
For example `https://open.spotify.com/playlist/4hsReDJBeNEXQQj6U2dXsK?si=b18737fd10b94e26&nd=1` has the ID `4hsReDJBeNEXQQj6U2dXsK`.
* Song Location = See [here](#song_location_guide).

<a name="song_location_guide"></a>
## Song Location Guide
The song location can accept either the full path of the location or look based from the location of the `javascript` folder.
```
home/  
├── spotify-playlist-maker/  
│   ├── javascript/  
│   │   ├──function.js  
│   │   └──server.js  
│   ├── output/  
│   ├── public/  
│   └── secret/  
└── song/  
    ├── song1.mp3  
    └── song2.mp3  
```

In the example above you can either put in `home/song/`or `../../song/`as the song file location.
