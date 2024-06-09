const mongoose = require('mongoose');
const WatchData = require('../models/WatchData');
const https = require('https');
const fs = require('fs');
const csv = require('csv-parser');
const os = require('os');
const path = require('path');
require('dotenv').config();

const fetchTitles = async () => {
    console.log("fetch titles");
    downloadCSV(url, parseCSV);
};

module.exports = fetchTitles;


const url = process.env.WATCHMODE_TITLES_CSV_URL;
const outputPath = path.join(os.tmpdir(), 'title_id_map.csv');

// Funktion zum Herunterladen der Datei
function downloadCSV(url, callback) {
    const file = fs.createWriteStream(outputPath);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(callback);
        });
    }).on('error', function (err) {
        fs.unlink(outputPath); // Datei löschen bei Fehler
        console.error('Error downloading the file:', err.message);
    });
}

// Funktion zum Parsen der CSV-Datei
function parseCSV() {
    fs.createReadStream(outputPath)
        .pipe(csv())
        .on('data', (row) => {
            // console.log(row["Watchmode ID"]);
            add2WatchData(row["Watchmode ID"]);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
}

const add2WatchData = async (watchDataId) => {
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
}

