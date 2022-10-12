const axios = require('axios');
const parser = require('xml2json');

const BOARDGAME_API = "https://www.boardgamegeek.com/xmlapi/boardgame/";

const getBoardgameApiEndpoint = game => BOARDGAME_API + game.link.split("/")[4];

const retry = (url, resolve) => axios.get(url).then(data => {
    data = JSON.parse(parser.toJson(data.data)).boardgames.boardgame
    return resolve(data)
}).catch(e => {
    retry(e.config.url, resolve);
});

class GameDetails { 
    getGameDetails(game){
        return new Promise((resolve, reject) => axios
            .get(getBoardgameApiEndpoint(game))
            .then(data => {
                data = JSON.parse(parser.toJson(data.data)).boardgames.boardgame
                return resolve(data)
            }).catch(e => {
                retry(e.config.url, resolve);
            })
        )}

    getGamesList(i){
        return axios.get('https://boardgamegeek.com/browse/boardgame/page/' + i)
    }
}

module.exports = GameDetails;
