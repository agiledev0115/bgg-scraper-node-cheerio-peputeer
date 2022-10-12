const cheerio = require("cheerio");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const hostname = process.env.MONGO_HOSTNAME;
const database = process.env.MONGO_DATABASE_NAME;
const debugging = process.env.DEBUGGING;

const GameModel = require("./src/models/Game");
const GameDetails = require("./src/clients/GameDetails");
const CatalogueParser = require("./src/parsers/Catalogue");
const utils = require("./src/utils");

const catalogue = new CatalogueParser([]);
const gameDetails = new GameDetails();

mongoose.connect("mongodb://localhost:3001/meteor", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//console.log('mongodb://'+hostname+':'+portnumber+'/'+database);
// should we handle username and password? mongoose.connect('mongodb://username:password@'hostname':'portnumber'/'database, { useNewUrlParser: true });
//mongoose.connect('mongodb://'+hostname+':'+portnumber+'/'+database, { useNewUrlParser: true, useFindAndModify: true });
// mongoose.connect('mongodb://testing:abcdefghijklmn0p33@192.168.1.200:49153/' , { useNewUrlParser: true, useFindAndModify: false });

const db = mongoose.connection;

db.on("error", (e) => console.error("Database not connected: " + e));
db.once("open", () => console.log("Database connected OK"));

if (debugging == " true") {
  console.log("Running in debug mode.");

  // console.log("Dropping database...");
  // db.dropDatabase((err, result) => {
  //     if(!err) console.log("Database dropped.")
  // });
}

const boardGameGeekPagePromises = [];
const bggPageCount = 1351;
const invertPull = true;

for (let i = 1; i <= bggPageCount; i++) {
  let iDelay = 0;

  if (invertPull) {
    iDelay = bggPageCount * 10000 - i * 10000;
  } else {
    iDelay = i * 10000;
  }

  boardGameGeekPagePromises.push(
    new Promise((resolve, reject) =>
      utils.delay(iDelay).then(() =>
        gameDetails
          .getGamesList(i)
          .then((games) => {
            if (invertPull) {
              console.log(
                "Inverted Update - Page " + i + ", and counting down."
              );
            } else {
              console.log(
                "Progress Update - Page " +
                  i +
                  " of " +
                  bggPageCount +
                  " pages."
              );
            }

            const html = cheerio.load(games.data);

            console.log(games.data);
            return Promise.all(
              catalogue.parse(html).map((game) =>
                gameDetails.getGameDetails(game).then((data) =>
                  new GameModel(
                    data.objectid,
                    data.name,
                    data.yearpublished,
                    data.minplayers,
                    data.maxplayers,
                    data.playingtime,
                    data.minplaytime,
                    data.maxplaytime,
                    data.age,
                    data.description,
                    data.thumbnail,
                    data.image, //Removed as BGG has string AND arrays in this field
                    data.boardgameartist,
                    data.boardgamemechanic,
                    data.boardgamepublisher,
                    data.boardgamecategory,
                    data.boardgamedesigner
                  ).save()
                )
              )
            ).then((boardGameGeekPageGames) => resolve(boardGameGeekPageGames));
          })
          .catch((e) => {
            console.log(e);
            console.log("Encountered Issue - re-trying page ", i);
            return boardGameGeekPagePromises.push(gameDetails.getGamesList(i));
          })
      )
    )
  );
}

Promise.all(boardGameGeekPagePromises).then(() => {
  mongoose.connection.close();
});
