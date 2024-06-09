const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const watchFinderRoutes = require('./routes/watchFinder');
const cron = require('node-cron');
const fetchTitles = require('./utils/watchmodeUtil');


const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/watchFinder', watchFinderRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function scheduledTask() {
    console.log('Aktion wird ausgeführt!');
    fetchTitles();
    // Hier können Sie den Code für Ihre Aktion einfügen
}

// cron.schedule('0 0 */10 * *', scheduledTask);
// scheduledTask();

