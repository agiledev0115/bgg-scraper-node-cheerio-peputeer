const mongoose = require('mongoose');
const GameArtist = require('./GameArtist');
const GameMechanic = require('./GameMechanic');
const GamePublisher = require('./GamePublisher');
const GameCategory = require('./GameCategory');
const GameDesigner = require('./GameDesigner');
const AlternativeName = require('./AlternativeName');

const AlternativeNameSchema = new mongoose.Schema({
    id: String,
    name: String
});

const GameDesignerSchema = new mongoose.Schema({
    id: String,
    designer: String
});

const GameCategorySchema = new mongoose.Schema({
    id: String,
    category: String
});

const GamePublisherSchema = new mongoose.Schema({
    id: String,
    publisher: String
});

const GameMechanicSchema = new mongoose.Schema({
    id: String,
    mechanic: String
});

const GameArtistSchema = new mongoose.Schema({
    id: String,
    name: String
});

const schema = new mongoose.Schema({
    bggid: String,
    title: String,
    minPlayers: String,
    maxPlayers: String,
    playingTime: String,
    minPlaytime: String,
    maxPlaytime: String,
    age: String,
    description: String,
    thumbnail: String,
    image: String,
    yearPublished: String,
    modified: Date,
    pulled: Boolean,
    gameArtists: [GameArtistSchema],
    gameMechanics: [GameMechanicSchema],
    gamePublishers: [GamePublisherSchema],
    gameCategories: [GameCategorySchema],
    gameDesigners: [GameDesignerSchema],
    alternativeNames: [AlternativeNameSchema]
});

const MongooseGame = mongoose.model('Game', schema, 'Games');

const parseName = name => name.filter ? name.filter(name => name.primary).map(name => name['$t'])[0] : name['$t'];

const parseGenericObjectIntoDomain = (data, Domain) => {
    if (!data) {
        return null;
    }

    if (data.filter) {
        return data.map(datum => {
            return new Domain(datum.objectid, datum['$t']);
        });
    }

    return [new Domain(data.objectid, data['$t'])];
};

const parseString = stringVar => typeof stringVar === "string" ? stringVar : null;

class Game {
    constructor(
        bggid,
        title,
        yearPublished,
        minPlayers,
        maxPlayers,
        playingTime,
        minPlaytime,
        maxPlaytime,
        age,
        description,
        thumbnail,
        image,
        gameArtists,
        gameMechanics,
        gamePublishers,
        gameCategories,
        gameDesigners
    ) {
        this.bggid = parseString(bggid);
        this.title = parseName(title);
        this.yearPublished = parseString(yearPublished);
        this.minPlayers = parseString(minPlayers);
        this.maxPlayers = parseString(maxPlayers);
        this.playingTime = parseString(playingTime);
        this.minPlaytime = parseString(minPlaytime);
        this.maxPlaytime = parseString(maxPlaytime);
        this.age = parseString(age);
        this.description = parseString(description);
        this.thumbnail = parseString(thumbnail);
        this.image = parseString(image);
        this.gameArtists = parseGenericObjectIntoDomain(gameArtists, GameArtist);
        this.gameMechanics = parseGenericObjectIntoDomain(gameMechanics, GameMechanic);
        this.gamePublishers = parseGenericObjectIntoDomain(gamePublishers, GamePublisher);
        this.gameCategories = parseGenericObjectIntoDomain(gameCategories, GameCategory);
        this.gameDesigners = parseGenericObjectIntoDomain(gameDesigners, GameDesigner);
        this.alternativeNames = parseGenericObjectIntoDomain(title, AlternativeName);
        this.pulled = false;
    }

    async save() {
        let data = await MongooseGame.findOne({ bggid: this.bggid })

        if(data) {
            if( data.title != this.title ||
                data.yearPublished != this.yearPublished ||
                data.minPlayers != this.minPlayers ||
                data.maxPlayers != this.maxPlayers ||
                data.playingTime != this.playingTime ||
                data.minPlaytime != this.minPlaytime ||
                data.maxPlaytime != this.maxPlaytime ||
                data.age != this.age ||
                data.description != this.description ||
                data.thumbnail != this.thumbnail ||
                data.image != this.image ||
                !data.modified
            ) {
                this.modified = new Date()
                console.log('---updating entry for id: ' + this.bggid)
                return MongooseGame.updateOne({ bggid: this.bggid }, this)
            }
            return;
        }

        console.log('---creating new entry for id: ' + this.bggid)
        this.modified = new Date();
        return new MongooseGame(this).save();
    }

    async check(period) {
        let data = await MongooseGame.findOne({ bggid: this.bggid })

        if(data) {
            if(data.modified == undefined)
                return true;

            const d = new Date(data.modified)
            const now = new Date()
            d.setDate(d.getDate() + period)

            if(now > d)
                return true;
            return 0;
        }

        return true;
    }
}

module.exports = Game;
