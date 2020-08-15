const SpotifyWebApi = require("spotify-web-api-node");
const querystring = require("querystring");
const request = require("request");
require("dotenv").config();

const stateKey = "spotify_auth_state";
const clientId = process.env.CLIENT_ID; // Your client id
const clientSecret = process.env.CLIENT_SECRET; // Your secret
const redirectUri = process.env.REDIRECT_URI; // Your redirect uri

function generateRandomString(length) {
  let text = "";
  const POSSIBLE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
  }
  return text;
}

//*Spotify Login
module.exports.spotifyLogin = (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  const scope = "user-read-email user-read-recently-played";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
      })
  );
};

//*Spotify callback + sessions

//? credentials are optional
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

module.exports.spotifyCallback = function (req, res) {
  spotifyApi
    .authorizationCodeGrant(req.query.code)
    .then((data) => {
      spotifyApi.setAccessToken(data.body.access_token);
      spotifyApi.setRefreshToken(data.body.refresh_token);
      return spotifyApi.getMe();
    })
    .then(() => {
      spotifyApi
        .getMyRecentlyPlayedTracks({ limit: 1 })
        .then((data) => {
          let trackId = [];
          data.body.items.forEach((item) => {
            trackId.push(item.track.id);
            console.log(item.track.id);
          });
          return trackId;
        })
        .then((data) => {
          spotifyApi.getAudioFeaturesForTracks(data).then((data) => {
            console.log(data.body.audio_features);
          });
        });
    })
    .then((data) => {
      res.redirect("http://localhost:3000");
    });
  // spotifyApi
  //   .authorizationCodeGrant(req.query.code)
  //   .then(function (data) {
  //     spotifyApi.setAccessToken(data.body.access_token);
  //     spotifyApi.setRefreshToken(data.body.refresh_token);
  //     return spotifyApi.getMe();
  //   })
  //   .then(function (data) {
  //     spotifyApi
  //       .getMyRecentlyPlayedTracks({
  //         limit: 50,
  //       })
  //       .then(function (data) {
  //         const arr = [],
  //           songIDs = [];
  //         data.body.items.forEach(function (p) {
  //           const obj = {
  //             id: p.track.id,
  //             played_at: p.played_at,
  //             name: p.track.name,
  //           };

  //           arr.push(obj);
  //           songIDs.push(p.track.id);
  //         });
  //         //calculating the time difference
  //         const startTime = Date.parse(arr[arr.length - 1].played_at);
  //         const endTime = Date.parse(arr[0].played_at);
  //         //convert to hours
  //         const timeDif = (endTime - startTime) / (1000 * 60 * 60);

  //         if (timeDif < 10) {
  //           req.session.timeDiff = 0;
  //           console.log("timeDIff" + 0);
  //         } else if (timeDif > 10 && timeDif < 18) {
  //           req.session.timeDiff = 1;
  //           console.log("timeDIff" + 1);
  //         } else {
  //           req.session.timeDiff = 2;
  //           console.log("timeDIff" + 2);
  //         }
  //         spotifyApi.getAudioFeaturesForTracks(songIDs).then(function (data) {
  //           let danceability = 0,
  //             key = [],
  //             loudness = 0,
  //             valence = 0,
  //             tempo = 0,
  //             mode = 0,
  //             energy = 0,
  //             speechiness = 0,
  //             acousticness = 0,
  //             instrumentalness = 0,
  //             liveness = 0;

  //           data.body.audio_features.forEach(function (p1, p2, p3) {
  //             danceability += p1.danceability;
  //             key.push(p1.key);
  //             loudness += p1.loudness;
  //             valence += p1.valence;
  //             tempo += p1.tempo;
  //             mode += p1.mode;
  //             energy += p1.energy;
  //             speechiness += p1.speechiness;
  //             acousticness += p1.acousticness;
  //             instrumentalness += p1.instrumentalness;
  //             liveness += p1.liveness;
  //           });
  //           const obj = {
  //             danceability: danceability / data.body.audio_features.length,
  //             key: frequent(key),  
  //             loudness: loudness / data.body.audio_features.length,
  //             valence: valence / data.body.audio_features.length,
  //             tempo: tempo / data.body.audio_features.length,
  //             mode: Math.round(mode / data.body.audio_features.length),
  //             energy: energy / data.body.audio_features.length,
  //             speechiness: speechiness / data.body.audio_features.length,
  //             acousticness: acousticness / data.body.audio_features.length,
  //             instrumentalness:
  //               instrumentalness / data.body.audio_features.length,
  //             liveness: liveness / data.body.audio_features.length,
  //           };
  //           req.session.obj = obj;
  //           res.redirect("/musicScape");
  //         });
  //       });
  //     req.session.user =
  //       data.body.id.length > 10 ? data.body.display_name : data.body.id;
  //   });
};

//function from: https://stackoverflow.com/a/1053865/7044471
function frequent(array) {
  if (array.length == 0) return null;
  let modeMap = {};
  let maxEl = array[0],
    maxCount = 1;
  for (let i = 0; i < array.length; i++) {
    const el = array[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}
