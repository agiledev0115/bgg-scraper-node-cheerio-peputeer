const CatalogueGameModel = require('../models/CatalogueGame');

const sanitize = data => data && data.trim().replace(/\n/g, '').replace(/\t/g, '')

class Catalogue {
    parseTotalNumberOfPages($){
        return $('[title="last page"]').toArray()[0].children[0].data.replace('[','').replace(']','');
    }

    async parse(page) {
        let games = [];
        const gameLinks = await page.$$('.collection_table > tbody > tr > td.collection_thumbnail > a')
        
        const gameCount = gameLinks.length;
        for (let i = 0; i < gameCount; i ++) {
            let link = sanitize(await gameLinks[i].evaluate(node => node.getAttribute('href')))

            let bggid = link.split('/')[2];
            games.push(
                new CatalogueGameModel(bggid, "https://boardgamegeek.com" + link)
            )
        }
        return games;
    }
}

module.exports = Catalogue;
