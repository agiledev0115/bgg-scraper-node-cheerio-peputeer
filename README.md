# BoardGameGeek Scraper

## Technology

* JavaScript
* Mongoose
* Cheerio
* Axios

## Running the application

1. Ensure you have MongoDB running locally or on a remote cloud server.
2. Ensure you have `MONGO_HOSTNAME` and `MONGO_DATABASE_NAME` set as environmental variables on your machine

```shell
$ npm install
$ MONGO_HOSTNAME=localhost MONGO_DATABASE_NAME=boardgamegeek node index.js
```

## Debugging

Setting the environment variable `DEBUGGING` to `true` will switch the application into debug mode.

*DEBUGGING is dangerous and results in the database being dropped, only debug when you are NOT connected to a production database*

```shell
$ MONGO_HOSTNAME=localhost MONGO_DATABASE_NAME=boardgamegeek DEBUGGING=true node index.js
```

## Technical Architecture

1. Database connection is opened
2. We iterate up to "page number", delaying each iterations exponentially by 10000ms
3. We fetch the list of games by index number (returns 100 games per request)
4. We parse the catalogue, extracting information about each game
5. For each game we fetch its details and build a model
6. Finally we persist the model into MongoDB

