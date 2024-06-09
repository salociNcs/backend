const mongoose = require('mongoose');
const WatchData = require('../models/WatchData');
const Pool = require('../models/Pool');
const WatchData2Pool = require('../models/WatchData2Pool');
const User = require('../models/User');
const Pool2User = require('../models/Pool2User');
const Votes = require('../models/Votes');
require('dotenv').config();

exports.getTitle = async (req, res) => {
    try {
        // let pools = await findPoolByUserId(req.body.userId);
        // console.log(pools);

        const alreadyFetchedWatchDataRes = await WatchData.findOne({ _id: req.body.watchDataId, isFetched: true });
        // console.log("alreadyFetchedWatchDataRes");
        // console.log(alreadyFetchedWatchDataRes);
        if (alreadyFetchedWatchDataRes) {
            res.status(200).json(alreadyFetchedWatchDataRes);
            return;
        }

        //Noch nicht von API gefetched, führe API Call aus
        const fetchedTitleRes = await fetchTitleFromApiById(req.body.watchDataId);
        if (!fetchedTitleRes) {
            throw "title fetch failed";
        }
        res.status(200).json(fetchedTitleRes);
        // res.status(200).json({ _id: req.body.watchDataId, title: "fetched title" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
}


const fetchTitleFromApiById = async (watchDataId) => {


    try {
        // const sourceIds = [203, 372, 444, 26];
        // const types = ["movie"];
        // const regions = ["US"];
        // const sortBy = "popularity_desc";
        // const genres = [1,39];
        // let url = "https://api.watchmode.com/v1/list-titles/?apiKey=" + process.env.WATCHMODE_API_KEY;
        let url = "https://api.watchmode.com/v1/title/" + watchDataId + "/details/?apiKey=" + process.env.WATCHMODE_API_KEY;

        // if (sourceIds.length > 0) {
        //     url += "&source_ids=" + sourceIds.join(",");
        // }
        // if (types.length > 0) {
        //     url += "&types=" + types.join(",");
        // }
        // if (regions.length > 0) {
        //     url += "&regions=" + regions.join(",");
        // }

        // if (sortBy) {
        //     url += "&sort_by=" + sortBy;
        // }


        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!API!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log({ url });

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (!response.ok) {
            // console.log(data);
            throw response.status + ": " + JSON.stringify(data);
        }

        // console.log("data");
        // console.log(data);
        //Update WatchData in DB mit fetched Data

        const schemaKeys = Object.keys(WatchData.schema.paths);

        // Filtere das updateData-Objekt, um nur gültige Schlüssel zu behalten
        const filteredUpdateData = {};
        for (const key of Object.keys(data)) {
            if (schemaKeys.includes(key)) {
                filteredUpdateData[key] = data[key];
            }
        }

        filteredUpdateData.isFetched = true;
        // console.log("filteredUpdateData");
        // console.log(filteredUpdateData);
        const updatedUser = await WatchData.findOneAndUpdate(
            { _id: data.id },
            { $set: filteredUpdateData },
            { new: true, upsert: true }
        );

        // console.log("updatedUser");
        // console.log(updatedUser);
        if (!updatedUser) {
            throw "updateWatchData failed";
        }

        return updatedUser;
    } catch (err) {
        console.log(err);
        return null;
    }


}

exports.getPoolsByUserId = async (req, res) => {
    try {
        let pools = await findPoolByUserId(req.body.userId);
        // console.log(pools);
        res.status(200).json(pools);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

exports.getPoolById = async (req, res) => {
    try {

        const poolId = new mongoose.Types.ObjectId(req.body.poolId);
        const pool = await findPoolById(poolId);
        if (!pool) {
            throw "pool not found";
        }

        // console.log(pool);
        res.status(200).json(pool);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};


exports.getFriends = async (req, res) => {
    try {
        let friends = await getFriends(req.body.user);
        // console.log(friends);
        res.status(200).json(friends);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

const getFriends = async (user) => {
    try {
        const friendsRes = await User.find({ _id: { $ne: user._id } });
        if (friendsRes.length === 0) {
            throw "no friends found";
        }

        return friendsRes;

    } catch (err) {
        console.error(err.message);
        return [];
    }



}

exports.getUndoneVotesByPoolForUser = async (req, res) => {
    // const { userId, poolId } = req.body;
    try {

        const poolId = new mongoose.Types.ObjectId(req.body.poolId);
        const pool = await findPoolById(poolId);
        if (!pool) {
            throw "pool not found";
        }

        const userId = new mongoose.Types.ObjectId(req.body.userId);
        const user = await findUserById(userId);
        if (!user) {
            throw "user not found";
        }

        let undoneVotes = await getUndoneVotesByPoolForUser(pool, user);
        // console.log(undoneVotes);

        if (!undoneVotes || undoneVotes.length === 0) {
            res.status(200).json([]);
            return;
        }

        let undoneWatchDataByVotes = await getWatchDataByUndoneVotes(undoneVotes);
        // console.log(undoneWatchDataByVotes);

        res.status(200).json(undoneWatchDataByVotes);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

exports.vote = async (req, res) => {
    try {
        await resolveUndoneVote(req.body.voteId, req.body.liked);
        res.status(200).json({});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

exports.getWatchDataMatches = async (req, res) => {

    try {

        const poolId = new mongoose.Types.ObjectId(req.body.poolId);
        const pool = await findPoolById(poolId);
        if (!pool) {
            throw "pool not found";
        }

        let watchData = [];

        var matchingWatchData = await getMatchingWatchDataIdByPool(pool._id);
        if (!matchingWatchData) {
            res.status(200).json([]);
            return;
        }
        for (let watchDataId of matchingWatchData) {
            let watchDataRes = await getWatchDataById(watchDataId);
            watchData.push(watchDataRes);
        }

        res.status(200).json(watchData);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

exports.addPool = async (req, res) => {

    try {

        let pool = await addPoolOnly();
        if (!pool) {
            throw "pool is null";
        }

        let user = await findUserById(req.body.userId);
        if (!user) {
            throw "user is null";
        }

        // console.log(pool);
        // console.log(user);
        await addPool2User(pool, user);
        res.status(200).json(pool);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

exports.updatePool = async (req, res) => {

    try {
        const updatedPool = await Pool.findOneAndUpdate(
            { _id: req.body.pool._id },
            { $set: req.body.pool },
            { new: true, upsert: true }
        );

        if (!updatedPool) {
            throw "updatedPool failed";
        }

        res.status(200).json(updatedPool);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};

exports.deletePool = async (req, res) => {
    // res.status(200).json({ msg: "gut" });
    try {
        const deletedPool = await Pool.findByIdAndDelete(req.body.pool._id);

        if (!deletedPool) {
            throw "deletedPool failed";
        }

        const deletedPool2User = await Pool2User.findOneAndDelete({ poolId: req.body.pool._id });

        if (!deletedPool2User) {
            throw "deletedPool2User failed";
        }

        res.status(200).json(deletedPool);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
};



const addPool2User = async (pool, user) => {
    try {

        const existingLink = await Pool2User.findOne({ poolId: pool._id, userId: user._id });
        if (existingLink) {
            console.log('Die Verknüpfung existiert bereits.');
            return null;
        }

        const pool2User = new Pool2User({
            _id: new mongoose.Types.ObjectId(),
            poolId: pool._id,
            userId: user._id
        });
        await pool2User.save();
    } catch (err) {
        console.error(err.message);
    }
};

exports.addPool2User = async (req, res) => {
    try {
        const { poolId, user } = req.body;
        if (!poolId) {
            throw "pool is null";
        }

        const pool = await findPoolById(poolId);
        if (!pool) {
            throw "pool not found";
        }

        if (!user) {
            throw "user is null";
        }
        await addPool2User(pool, user);
        res.status(200).json({ msg: "pool linked to user" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler: ' + err });
    }
}



//add WatchData Begin
const addWatchData = async () => {

    try {


        console.log(watchDataId);
        const newData = {
            _id: watchDataId
        };
        const filter = { _id: newData._id };
        const updateDoc = {
            $setOnInsert: newData,
        };

        const result = await WatchData.updateOne(filter, updateDoc, { upsert: true });

        if (result.upsertedCount > 0) {
            console.log(`Ein neues Dokument wurde eingefügt mit der ID ${result.upsertedId._id}`);
        } else {
            console.log("Das Dokument existiert bereits und wurde nicht eingefügt.");
        }


        const watchData = new WatchData({
            _id: new mongoose.Types.ObjectId(),
            type: "movie",
            title: 'Fast 9'
        });
        await watchData.save();

    } catch (err) {
        console.error(err.message);
    }
};

// await addWatchData();
//add WatchData End

//add Pool Begin

const addPoolOnly = async () => {
    try {
        const pool = new Pool({
            _id: new mongoose.Types.ObjectId()//,
        });
        await pool.save();
        return pool;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

// await addPoolWithUserId();
//add Pool End

//add WatchData2Pool Begin

const findWatchDataById = async (watchDataId) => {
    try {
        const watchData = await WatchData.findById(watchDataId);
        if (!watchData) {
            console.log('Kein watchData mit dieser ID gefunden');
            return null;
        }
        // console.log('watchData gefunden:', watchData);
        return watchData;

    } catch (error) {
        console.error('Fehler beim Finden des watchData:', error);
    } finally {
        // Verbindung zur Datenbank schließen
        //   mongoose.connection.close();
    }
};

// const watchDataId = new mongoose.Types.ObjectId('665e1c3776e6118471f59e12');
// const watchDataId = new mongoose.Types.ObjectId('665e1c744ef7d37f11af3cfe');
// const watchData = await findWatchDataById(watchDataId);

const findPoolById = async (poolId) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            console.log('Kein pool mit dieser ID gefunden');
            return null;
        }
        // console.log('pool gefunden:', pool);
        return pool;

    } catch (error) {
        console.error('Fehler beim Finden des pool:', error);
    } finally {
        // Verbindung zur Datenbank schließen
        //   mongoose.connection.close();
    }
};

// const poolId = new mongoose.Types.ObjectId('665e1d5ccc21bafeb9710fe5');
// const pool = await findPoolById(poolId);


const addWatchData2Pool = async (watchDataId, pool) => {
    try {

        const existingLink = await WatchData2Pool.findOne({ poolId: pool._id, watchDataId: watchDataId });
        if (existingLink) {
            console.log('Die Verknüpfung existiert bereits.');
            return true;
        }

        const watchData2Pool = new WatchData2Pool({
            _id: new mongoose.Types.ObjectId(),
            poolId: pool._id,
            watchDataId: watchDataId
        });
        await watchData2Pool.save();
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

// await addWatchData2Pool(watchData, pool);
//add WatchData2Pool End

//add Pool2User Begin


const findUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log('Kein user mit dieser ID gefunden');
            return null;
        }
        // console.log('watchData gefunden:', watchData);
        return user;

    } catch (error) {
        console.error('Fehler beim Finden des user:', error);
    } finally {
        // Verbindung zur Datenbank schließen
        //   mongoose.connection.close();
    }
};

// const userId = new mongoose.Types.ObjectId('665e2697be5ce2fa3cbfdc65');
// const userId = new mongoose.Types.ObjectId('665e37947b45027278a54993');
// const user = await findUserById(userId);


// await addPool2User(pool, user);
//add Pool2User End

//create votes Begin

const addVotesByPool = async (pool) => {
    try {

        const watchDataRes = await WatchData2Pool.find({ poolId: pool._id });
        if (watchDataRes.length === 0) {
            throw "no watch data found";
        }

        const userRes = await Pool2User.find({ poolId: pool._id });
        if (userRes.length === 0) {
            throw "no user found";
        }


        userRes.forEach(async (userItm) => {
            watchDataRes.forEach(async (watchDataItm) => {

                const votesRes = await Votes.find({ userId: userItm.userId, watchDataId: watchDataItm.watchDataId, poolId: pool._id });
                if (votesRes.length > 0) {
                    // console.log("already in votes");
                    return;
                }

                const vote = new Votes({
                    _id: new mongoose.Types.ObjectId(),
                    userId: userItm.userId,
                    watchDataId: watchDataItm.watchDataId,
                    poolId: pool._id,
                    voted: false,
                    liked: false,
                });
                await vote.save();


            });
        });

        return true;


    } catch (err) {
        console.error(err.message);
        return false;
    }
};
// addVotesByPool(pool);
//get votes End

const fetchWatchDatasFromApiById = async () => {


    try {
        const sourceIds = [203, 372, 444, 26];
        const types = ["movie"];
        const regions = ["US"];
        const sortBy = "popularity_desc";
        // const genres = [1,39];
        let url = "https://api.watchmode.com/v1/list-titles/?apiKey=" + process.env.WATCHMODE_API_KEY;

        if (sourceIds.length > 0) {
            url += "&source_ids=" + sourceIds.join(",");
        }
        if (types.length > 0) {
            url += "&types=" + types.join(",");
        }
        if (regions.length > 0) {
            url += "&regions=" + regions.join(",");
        }

        if (sortBy) {
            url += "&sort_by=" + sortBy;
        }


        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!API!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log({ url });

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw response.status + ": " + JSON.stringify(data);
            console.log(data);
        }

        return data.titles;

    } catch (err) {
        console.log(err);
        return [];
    }


}

//getUndoneVotesByPoolForUser Begin
const getUndoneVotesByPoolForUser = async (pool, user) => {
    try {

        /*
        gucke ob noch offene votes vorhanden (min: 50)
        wenn ja: 
            lade votes 
        wenn nein: 
            lade neues watchdata für vote und füge vote hinzu 
            lade votes



        */

        const minUndoneVotesCount = 50;

        let undoneVotes = await Votes.find({ userId: user._id, poolId: pool._id, voted: false });
        if (undoneVotes.length < minUndoneVotesCount) {
            console.log("nicht genug offene votes gefunden");
            /**
             * mache api call für titles ggfs mit individudelle paramteren des pools -ereldigt
             * durclaufe alle treffer -erledigt
             * prüfe ob in watchdata die idvorhandne -ereldigt
             * wenn nein:  -erledigt
             *  skip - erldigt
             * wenn ja:  - erldigt
             *  weiter -. erldigt 
             * prüfe ob id bereites in votes vorhanden  -< teils ereldigt - - rpüfe negativ ergebnis
             * wenn ja: teils ereldigt - - rpüfe negativ ergebnis
             *      skip teils ereldigt - - rpüfe negativ ergebnis
             * wenn nein:  - erldigt
             *      füge zu votes hinz (alle user für diesen pool add watchdata id)
             * 
             * hole die nächsten 50 votes für user und poool die nicht votes sind
             * gebe das ergebnios als arrax zurcül
             * 
             */

            const watchDatasFromApi = await fetchWatchDatasFromApiById();
            if (!watchDatasFromApi) {
                throw "watchDataFromApi is null";
            }
            if (watchDatasFromApi.length === 0) {
                throw "no WatchDataFromApi found";
            }

            for (let watchData of watchDatasFromApi) {
                if (!watchData.id) {
                    // console.log("watchData.id is null");
                    continue;
                }

                let watchDataExistsRes = await watchDataExists(watchData.id)
                if (!watchDataExistsRes) {
                    // console.log("watchData.id not exists: " + watchData.id);
                    continue;
                }

                const voteRes = await Votes.findOne({ watchDataId: watchData.id, poolId: pool._id });
                if (voteRes) {
                    console.log("watchData alreaddy added to votes");
                    continue;
                }

                const addWatchData2PoolRes = await addWatchData2Pool(watchData.id, pool);
                if (!addWatchData2PoolRes) {
                    console.log("addWatchData2Pool failed");
                    continue;
                }

                const addVotesByPoolRes = await addVotesByPool(pool);
                if (!addVotesByPoolRes) {
                    console.log("addVotesByPoolRes failed");
                    continue;
                }
            }

            undoneVotes = await Votes.find({ userId: user._id, poolId: pool._id, voted: false });

        }

        return undoneVotes;

        // const watchDataRes = await WatchData2Pool.find({ poolId: pool._id });
        // if (watchDataRes.length === 0) {
        //     throw "no watch data found";
        // }
        // //const userRes = await Pool2User.find({ poolId: pool._id });
        // //if (userRes.length === 0) {
        //  //   throw "no user found";
        // //}
        // let undoneVotes = [];
        // for (let watchDataItm of watchDataRes) {
        //     const voteRes = await Votes.findOne({ userId: user._id, watchDataId: watchDataItm.watchDataId, poolId: pool._id, voted: false });
        //     if (!voteRes) {
        //         // console.log("voteRes nicht gefunden oder bereits voted");
        //         continue;
        //     }
        //     undoneVotes.push(voteRes);
        // };
        // return undoneVotes;
        // return [];

    } catch (err) {
        console.error(err.message);
    }
};

const watchDataExists = async (watchDataId) => {
    try {

        const watchDataRes = await WatchData.findOne({ _id: watchDataId });
        if (!watchDataRes) {
            throw "watchData not found";
        }

        return true;
    } catch (error) {
        // console.log(error);
        return false;
    }
}
//alt ohne fremde api 
// const getUndoneVotesByPoolForUser = async (pool, user) => {
//     try {

//         /*
//         gucke ob noch offene votes vorhanden (min: 50)
//         wenn ja: 
//             lade votes 
//         wenn nein: 
//             lade neues watchdata für vote und füge vote hinzu 
//             lade votes



//         */


//         const watchDataRes = await WatchData2Pool.find({ poolId: pool._id });
//         if (watchDataRes.length === 0) {
//             throw "no watch data found";
//         }
//         // const userRes = await Pool2User.find({ poolId: pool._id });
//         // if (userRes.length === 0) {
//         //     throw "no user found";
//         // }
//         let undoneVotes = [];
//         for (let watchDataItm of watchDataRes) {
//             const voteRes = await Votes.findOne({ userId: user._id, watchDataId: watchDataItm.watchDataId, poolId: pool._id, voted: false });
//             if (!voteRes) {
//                 // console.log("voteRes nicht gefunden oder bereits voted");
//                 continue;
//             }
//             undoneVotes.push(voteRes);
//         };
//         return undoneVotes;

//     } catch (err) {
//         console.error(err.message);
//     }
// };
// let undoneVotes = await getUndoneVotesByPoolForUser(pool, user);
// console.log(undoneVotes);
//getUndoneVotesByPoolForUser End

//getWatchDataByUndoneVotes Begin
const getWatchDataByUndoneVotes = async (undoneVotes) => {
    try {
        let watchDataRes = [];
        for (let vote of undoneVotes) {

            const watchData = await WatchData.findOne({ _id: vote.watchDataId });
            if (!watchData) {
                throw "no watch data found";
            }

            let updatedWatchData = {
                ...watchData._doc,
                voteId: vote._id.toString()
            }

            watchDataRes.push(updatedWatchData);
        }

        return watchDataRes;

    } catch (err) {
        console.error(err.message);
    }
};
// let undoneWatchDataByVotes = await getWatchDataByUndoneVotes(undoneVotes);
// console.log(undoneWatchDataByVotes);
//getUndoneVotesByPool End

//resolveUndoneVote Begin
const resolveUndoneVote = async (voteId, liked) => {
    try {

        const result = await Votes.updateOne({ _id: voteId }, { $set: { voted: true, liked: liked } });
        if (result.nModified == 0) {
            console.log('Kein Vote mit dieser id gefunden oder Wert ist bereits aktuell');
        }
    } catch (err) {
        console.error(err.message);
    }
};

// for (let vote of undoneVotes) {
// await resolveUndoneVote(vote._id, true);
// }
//resolveUndoneVote End


//getMatchingWatchDataIdByPool Begin
const getMatchingWatchDataIdByPool = async (pool) => {
    try {
        const notLikedVotes = await Votes.find({ poolId: pool._id, liked: false });
        let notLikedWatchDataIds = [];
        for (let vote of notLikedVotes) {
            if (notLikedWatchDataIds.indexOf(vote.watchDataId.toString()) === -1) {
                notLikedWatchDataIds.push(vote.watchDataId.toString());
            }
        }

        const votes = await Votes.find({ poolId: pool._id });
        if (votes.length == 0) {
            return [];
        }

        let matchingWatchDataIds = [];
        for (let vote of votes) {
            if (notLikedWatchDataIds.indexOf(vote.watchDataId.toString()) > -1) {
                continue;
            }
            if (matchingWatchDataIds.indexOf(vote.watchDataId.toString()) === -1) {
                matchingWatchDataIds.push(vote.watchDataId.toString());
            }
        }

        // let matchingWatchDataIds = [];
        // for (let vote of votes) {
        //     if (matchingWatchDataIds.indexOf(vote.watchDataId.toString()) === -1) {
        //         let unlinkedVote = await Votes.findOne({ poolId: pool._id, _id: { $ne: vote._id }, liked: false });
        //         if (unlinkedVote) {
        //             continue;
        //         }
        //         matchingWatchDataIds.push(vote.watchDataId.toString());
        //     }
        // }


        // console.log(matchingWatchDataIds);
        return matchingWatchDataIds;



    } catch (err) {
        console.error(err.message);
    }
};

// let matchingWatchData = await getMatchingWatchDataIdByPool(pool);
// console.log(matchingWatchData);
//getMatchingWatchDataIdByPool End

//getWatchDataById Begin
const getWatchDataById = async (watchDataId) => {
    try {
        const watchData = await WatchData.findOne({ _id: watchDataId });
        if (!watchData) {
            throw "no watch data found";
        }
        return watchData;
    } catch (err) {
        console.error(err.message);
    }
};
// for (let watchDataId of matchingWatchData) {
// let watchDataRes = await getWatchDataById(watchDataId);
// console.log(watchDataRes);
// }
//getWatchDataById End


const findPoolByUserId = async (userId) => {
    try {

        const pool2UsersRes = await Pool2User.find({ userId: userId });
        if (pool2UsersRes.length === 0) {
            return [];
        }

        let pools = [];

        for (let pool2Users of pool2UsersRes) {
            const pool = await Pool.findById(pool2Users.poolId);
            if (!pool) {
                // console.log('Kein pool mit dieser ID gefunden: ' + pool2Users.poolId);
                continue;
            }
            pools.push(pool);

        }
        return pools;

    } catch (error) {
        console.error('Fehler beim Finden der pools:', error);
    } finally {
        // Verbindung zur Datenbank schließen
        //   mongoose.connection.close();
    }
};