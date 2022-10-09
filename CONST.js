const { getSubscribeTimesData } = require("./helper");

module.exports = {
    SUBSCRIBES_PATH: 'db/subscribes.json',
    USERS_PATH: 'db/users.json',
    SUBSCRIBE_TIMES_DATA: getSubscribeTimesData(),
    BOT_NAME: '@HoroMoonAstroBot'
}
