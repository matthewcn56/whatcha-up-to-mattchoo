import * as fs from "fs";
import * as yaml from "js-yaml";
import fetch from "node-fetch";
import { Buffer } from "node:buffer";
const scrobbledPath = "../_posts/2021-12-24-top-scrobbled.md";
//var LastFmNode = require("lastfm").LastFmNode;

const API_KEY = "20564605a010b5664e21a62f8b4ff4f9";
const LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0/";

// const lastfm = new LastFmNode({
//   api_key: "20564605a010b5664e21a62f8b4ff4f9",
//   secret: "79c3ef8744434c16e7602962f0d49906",
// });

function getGenresFromTags(tags, genres) {
  const rV = [];
  for (const tag of tags) {
    if (genres.indexOf(tag) !== -1) rV.push(tag);
  }
  return rV;
}

async function getTopWeekDataAndUpdateDataFile(to) {
  let funcFrom = 0;
  let funcTo = 0;
  // now if no from or to
  if (!to) {
    to = new Date();
    funcTo = "";
    funcFrom = "";
  } else {
    funcTo = to.getTime() / 1000;
    funcFrom = funcTo - 604800;
  }
  console.log(
    `${LASTFM_BASE_URL}?method=user.getweeklytrackchart&user=Mattchooachoo&api_key=${API_KEY}&from=${funcFrom}&to=${funcTo}&format=json`
  );
  const weeklyData = await fetch(
    `${LASTFM_BASE_URL}?method=user.getweeklytrackchart&user=Mattchooachoo&api_key=${API_KEY}&from=${funcFrom}&to=${funcTo}&format=json`
  );
  const dataJson = await weeklyData.json();
  console.log("Successfully fetched weekly top data");
  //console.log(dataJson);
  const tracks = dataJson.weeklytrackchart.track;
  const top = tracks[0];
  console.log(top);
  //conditional for artist if it exists
  let artistName = "";
  if (top.artist.name) {
    artistName = top.artist.name;
  } else if (top.artist["#text"]) {
    artistName = top.artist["#text"];
  }
  const trackName = top.name;
  const mbid = top.mbid;
  const numScrobbles = top.playcount;
  try {
    console.log(
      `${LASTFM_BASE_URL}?method=track.getInfo&api_key=${API_KEY}&artist=${artistName}&track=${trackName}&format=json`
    );
    const topTrackData = await fetch(
      `${LASTFM_BASE_URL}?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(
        artistName
      )}&track=${encodeURIComponent(trackName)}&format=json`
    );
    console.log("Successfully fetched top song data");
    const topJson = await topTrackData.json();
    console.log(topJson);
    const songData = topJson.track;
    const songUrl = songData.url;
    const artistUrl = songData.artist.url;
    //checking for image
    let images = [];
    if (songData.album) {
      images = songData.album.image ?? [];
    }

    const tags = songData.toptags.tag;
    const tagStrings = tags.map((tag) => tag.name);
    console.log(tags);
    console.log(images);
    let imgURL = "";
    if (images.length > 0) {
      imgURL = images[images.length - 1]["#text"];
    } else {
      imgURL =
        "https://lastfm.freetls.fastly.net/i/u/300x300/4128a6eb29f94943c9d206c08e625904.jpg";
    }
    if (!imgURL) {
      imgURL =
        "https://lastfm.freetls.fastly.net/i/u/300x300/4128a6eb29f94943c9d206c08e625904.jpg";
    }
    const imgData = await fetch(imgURL);
    const imgBlob = await imgData.arrayBuffer();
    const vettedTrackName = trackName
      .replace(/[^A-Z0-9]/gi, "_")
      .substring(0, 20);
    const vettedArtistName = artistName
      .replace(/[^A-Z0-9]/gi, "_")
      .substring(0, 20);
    const savedImgPath = `../assets/images/scrobbled/${vettedTrackName}_${vettedArtistName}.png`;

    //grab the yaml file
    const doc = yaml.load(
      fs.readFileSync("../_data/top_scrobbled.yml", "utf8")
    );
    const lastDate = doc[doc.length - 1].date;

    const genresDoc = yaml.load(
      fs.readFileSync("../_data/playlists.yml", "utf8")
    );
    const listedGenres = genresDoc.map((item) => item.genre);
    //getting genres
    const topSongGenres = getGenresFromTags(tagStrings, listedGenres);
    if (topSongGenres.length === 0) topSongGenres.push("pop");

    // Writing image to file if it doesn't exist yet...
    if (!fs.existsSync(savedImgPath)) {
      fs.writeFile(savedImgPath, Buffer.from(imgBlob), (err) => {
        if (err) return console.log(err);
        else return console.log("File Saved!");
      });
    }

    const updatedDoc = [...doc];

    const translatedImgPath = savedImgPath.split(
      "../assets/images/scrobbled/"
    )[1];
    const nowDate = to.toISOString().split("T")[0];
    const newItem = {
      track: trackName,
      artist: artistName,
      scrobbles: numScrobbles,
      genres: topSongGenres,
      lyric: "To be updated!",
      highlight: "To be updated!",
      date: nowDate,
      img: translatedImgPath,
      song_link: songUrl,
      artist_link: artistUrl,
    };
    updatedDoc.push(newItem);

    //updating the top_scrobbled yaml
    fs.writeFile(
      "../_data/top_scrobbled.yml",
      yaml.dump(updatedDoc),
      "utf8",
      (err) => {
        if (err) console.log(err);
      }
    );
    console.log("Successfully updated the top_scrobbled yaml!");

    //updating the date of the previous top_scrobbled file
    fs.readFile(scrobbledPath, { encoding: "utf-8" }, (err, data) => {
      const toReplace = new RegExp(`date: ${lastDate}`, "g");
      const updatedDate = data.replace(toReplace, `date: ${nowDate}`);
      fs.writeFile(scrobbledPath, updatedDate, "utf-8", (err) => {
        if (err) console.error(err);
      });
    });
    console.log(
      "Successfully updated the date of the previous top_scrobbled file!"
    );

    //txt file updating
    const lyricsString = updatedDoc.reduce(
      (str, song) => str + song.lyric + " ",
      ""
    );
    //console.log(lyricsString);
    fs.writeFile("./lyricsCloud.txt", lyricsString, (err) => {
      if (err) return console.log(err);
      else return console.log("File Saved!");
    });
    updatedDoc.reverse();

    const genresMap = {};
    for (const song of updatedDoc) {
      for (const genre of song.genres) {
        if (genresMap[genre]) genresMap[genre] += parseInt(song.scrobbles);
        else genresMap[genre] = parseInt(song.scrobbles);
      }
    }
    //console.log(genresMap);
    let genresString = "";
    const sortedGenres = Object.entries(genresMap).sort((a, b) => b[1] - a[1]);
    // console.log("SORTED");
    // console.log(sortedGenres);
    for (const [genre, freq] of sortedGenres) {
      genresString += genre;
      genresString += ":";
      genresString += freq;
      genresString += "\n";
    }

    fs.writeFile("./genresCloud.txt", genresString, (err) => {
      if (err) return console.log(err);
      else return console.log("File Saved!");
    });

    const songMap = {};
    for (let song of doc) {
      if (songMap[song.track]) songMap[song.track] += parseInt(song.scrobbles);
      else songMap[song.track] = parseInt(song.scrobbles);
    }
    //console.log(songMap);
    const sortedSongs = Object.entries(songMap).sort((a, b) => b[1] - a[1]);
    // console.log("SORTED SONGS");
    //console.log(sortedSongs);
    let trackTable = "";
    for (const [title, freq] of sortedSongs) {
      trackTable += title;
      trackTable += ":";
      trackTable += freq;
      trackTable += "\n";
    }
    //console.log(trackTable);

    fs.writeFile("./tracksCloud.txt", trackTable, (err) => {
      if (err) return console.log(err);
      else return console.log("File Saved!");
    });
  } catch (err) {
    console.log(err);
  }
}

// getTopWeekDataAndUpdateDataFile();

// let loopDate = new Date(1641124800000);
// let now = new Date(1657454400000);
// while (loopDate.getTime() < now.getTime()) {
//   getTopWeekDataAndUpdateDataFile(loopDate);
//   loopDate.setTime(loopDate.getTime() + 604800000);
//   console.log(loopDate.getTime());
// }

getTopWeekDataAndUpdateDataFile();

//done: 1656849600

// //console.log("yo");
// try {
//   const doc = yaml.load(fs.readFileSync("../_data/top_scrobbled.yml", "utf8"));
//   const lyricsString = doc.reduce((str, song) => str + song.lyric + " ", "");
//   console.log(lyricsString);
//   fs.writeFile("./lyricsCloud.txt", lyricsString, (err) => {
//     if (err) return console.log(err);
//     else return console.log("File Saved!");
//   });
//   doc.reverse();

//   const genresMap = {};
//   for (const song of doc) {
//     for (const genre of song.genres) {
//       if (genresMap[genre]) genresMap[genre] += song.scrobbles;
//       else genresMap[genre] = song.scrobbles;
//     }
//   }
//   console.log(genresMap);
//   let genresString = "";
//   const sortedGenres = Object.entries(genresMap).sort((a, b) => b[1] - a[1]);
//   console.log("SORTED");
//   console.log(sortedGenres);
//   for (const [genre, freq] of sortedGenres) {
//     genresString += genre;
//     genresString += ":";
//     genresString += freq;
//     genresString += "\n";
//   }
//   // const genresString = doc.reduce((str, song) => str + song.genres.reduce(
//   //   (list,genre) => list + genre.type + " " ,""),"");
//   // console.log(genresString);
//   fs.writeFile("./genresCloud.txt", genresString, (err) => {
//     if (err) return console.log(err);
//     else return console.log("File Saved!");
//   });

//   const songMap = {};
//   for (let song of doc) {
//     if (songMap[song.track]) songMap[song.track] += song.scrobbles;
//     else songMap[song.track] = song.scrobbles;
//   }
//   console.log(songMap);
//   const sortedSongs = Object.entries(songMap).sort((a, b) => b[1] - a[1]);
//   console.log("SORTED SONGS");
//   console.log(sortedSongs);
//   let trackTable = "";
//   for (const [title, freq] of sortedSongs) {
//     trackTable += title;
//     trackTable += ":";
//     trackTable += freq;
//     trackTable += "\n";
//   }
//   console.log(trackTable);

//   fs.writeFile("./tracksCloud.txt", trackTable, (err) => {
//     if (err) return console.log(err);
//     else return console.log("File Saved!");
//   });

//   //word it out with table format of TITLE:FREQ
// } catch (e) {
//   console.log(e);
// }

//word cloud link! https://worditout.com/word-cloud/create
//background color: #fdeeee
//range: #107010 to #bf8fef
//serif font
