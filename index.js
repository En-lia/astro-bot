const cron = require('node-cron');
const { startBot, sendMailing } = require('./bot.js');

cron.schedule('0 * * * *', async () => {
    sendMailing();
});

startBot();
