const express = require('express');
const router = express.Router();
const {
    getUndoneVotesByPoolForUser,
    vote,
    getWatchDataMatches,
    getPoolsByUserId,
    getPoolById, addPool,
    addPool2User, getFriends,
    getTitle,
    updatePool,
    deletePool
} = require('../controllers/watchFinderController');

router.post('/addPool', addPool);
router.post('/updatePool', updatePool);
router.post('/deletePool', deletePool);
router.post('/title', getTitle);
router.post('/addPool2User', addPool2User);
router.post('/vote', vote);
router.post('/watchDataForVoting', getUndoneVotesByPoolForUser);
router.post('/watchDataMatches', getWatchDataMatches);
router.post('/pools', getPoolsByUserId);
router.post('/pool', getPoolById);
router.post('/friends', getFriends);

module.exports = router;
