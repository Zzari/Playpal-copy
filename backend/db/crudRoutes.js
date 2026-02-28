const express = require('express');
const router = express.Router();
const player = require('../models/users');
const game = require('../models/games');
const { addPlayer, searchOne, searchAll, deleteOne, updateOne, 
    addSched, updateSched, joinGame, quitGame, searchAllGames, filteredGameSearch } = require('../controllers/playerController.js');
const app = express();
app.use(express.json());

//Get All Players
router.get('/listall', searchAll)
//Get One Player
router.get('/searchPlayer', searchOne)
//Create One Player
router.post('/newPlayer', addPlayer);
//Update One Player
router.patch('/updatePlayer', updateOne);
//Delete One Player
router.delete('/deletePlayer', deleteOne);
//Add an Event
router.post('/addEvent', addSched);
//Add an Event
router.post('/updateEvent', updateSched);
//Add an Event
router.post('/join', joinGame);
//Add an Event
router.post('/quit', quitGame);
//Get all Events
router.get('/eventlist', searchAllGames);
//Filtered Event Search
router.get('/eventsearch', filteredGameSearch);


module.exports = router;
