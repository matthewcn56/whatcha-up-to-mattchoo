import fetch from "node-fetch";
// const from = new Date("2022-01-01T21:09:29Z");
// const to = new Date("2022-07-09T21:09:29Z");
// const fromTimestamp = from.getTime() / 1000;
// const toTimestamp = to.getTime() / 1000;
// console.log(fromTimestamp);
// console.log(toTimestamp);

// const now = new Date();
// const from = new Date();
// from.setDate(now.getDate() - 7);
// console.log(from.toISOString().split("T")[0]);
// const dateString = now.toISOString().split("T")[0];
// console.log(dateString);
// console.log(loopDate.getTime() / 1000);
// console.log(Math.floor((loopDate.getTime() - 450800) / 1000));
let loopDate = new Date(1641124800000);
let now = new Date(1657454400000);
while (loopDate.getTime() < now.getTime()) {
  //getTopWeekDataAndUpdateDataFile(loopDate);
  loopDate.setTime(loopDate.getTime() + 604800000);
  console.log(loopDate.getTime());
}

// // let testDate = new Date(1000 * 1640908349);
// // console.log(testDate.toUTCString());

// const mattchooCharts = fetch(
//   "http://ws.audioscrobbler.com/2.0/?method=user.getweeklychartlist&user=Mattchooachoo&api_key=20564605a010b5664e21a62f8b4ff4f9&format=json"
// ).then(async (data) => {
//   const dataJson = await data.json();
//   //console.log(dataJson);
//   const charts = dataJson.weeklychartlist.chart;
//   const filtered = charts.filter((chart) => chart.from > 1640952000);
//   console.log(filtered);
// });

// const date = new Date("Fri, 31 Dec 2021 12:00:00 GMT");
// console.log(date.getTime());
