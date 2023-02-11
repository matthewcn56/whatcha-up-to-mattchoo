import * as fs from "fs";
import * as yaml from "js-yaml";

try {
  const doc = yaml.load(fs.readFileSync("../_data/top_scrobbled.yml", "utf8"));
  const lyricsString = doc.reduce((str, song) => str + song.lyric + " ", "");
  console.log(lyricsString);
  fs.writeFile("./lyricsCloud.txt", lyricsString, (err) => {
    if (err) return console.log(err);
    else return console.log("File Saved!");
  });
  doc.reverse();

  const genresMap = {};
  for (const song of doc) {
    for (const genre of song.genres) {
      if (genresMap[genre]) genresMap[genre] += parseInt(song.scrobbles);
      else genresMap[genre] = parseInt(song.scrobbles);
    }
  }
  console.log(genresMap);
  let genresString = "";
  const sortedGenres = Object.entries(genresMap).sort((a, b) => b[1] - a[1]);
  console.log("SORTED");
  console.log(sortedGenres);
  for (const [genre, freq] of sortedGenres) {
    genresString += genre;
    genresString += ":";
    genresString += freq;
    genresString += "\n";
  }
  // const genresString = doc.reduce((str, song) => str + song.genres.reduce(
  //   (list,genre) => list + genre.type + " " ,""),"");
  // console.log(genresString);
  fs.writeFile("./genresCloud.txt", genresString, (err) => {
    if (err) return console.log(err);
    else return console.log("File Saved!");
  });

  const songMap = {};
  for (let song of doc) {
    if (songMap[song.track]) songMap[song.track] += parseInt(song.scrobbles);
    else songMap[song.track] = parseInt(song.scrobbles);
  }
  console.log(songMap);
  const sortedSongs = Object.entries(songMap).sort((a, b) => b[1] - a[1]);
  console.log("SORTED SONGS");
  console.log(sortedSongs);
  let trackTable = "";
  for (const [title, freq] of sortedSongs) {
    trackTable += title;
    trackTable += ":";
    trackTable += freq;
    trackTable += "\n";
  }
  console.log(trackTable);

  fs.writeFile("./tracksCloud.txt", trackTable, (err) => {
    if (err) return console.log(err);
    else return console.log("File Saved!");
  });

  //word it out with table format of TITLE:FREQ
} catch (e) {
  console.log(e);
}
