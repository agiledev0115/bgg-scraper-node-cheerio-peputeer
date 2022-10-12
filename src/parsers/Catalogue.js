const CatalogueGameModel = require('../models/CatalogueGame');

const sanitize = data => data && data.trim().replace(/\n/g, '').replace(/\t/g, '')

class Catalogue {
    parseTotalNumberOfPages($){
        return $('[title="last page"]').toArray()[0].children[0].data.replace('[','').replace(']','');
    }

    parse($) {
        let games = [];
        const data = $('.collection_table > tbody > tr > td').toArray();
        const pageGameCount = data.length / 7;

        games.push(
            new CatalogueGameModel(
                sanitize($(data[0]).text()),
                sanitize($(data[2]).text()).replace('(', ' ('),
                sanitize($(data[3]).text()),
                sanitize($(data[4]).text()),
                sanitize($(data[5]).text()),
                "https://boardgamegeek.com" + sanitize($(data[2]).find('a').attr('href')),
            )
        );

        for (let i = 1; i < pageGameCount; i++) {
            games.push(
                new CatalogueGameModel(
                    sanitize($(data[0 + (7 * i)]).text()),
                    sanitize($(data[2 + (7 * i)]).text()).replace('(', ' ('),
                    sanitize($(data[3 + (7 * i)]).text()),
                    sanitize($(data[4 + (7 * i)]).text()),
                    sanitize($(data[5 + (7 * i)]).text()),
                    "https://boardgamegeek.com" + sanitize($(data[2 + (7 * i)]).find('a').attr('href')),
                )
            );
        }

        return games;
    }
}

module.exports = Catalogue;
