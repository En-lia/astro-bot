const fs = require('fs');
const { USERS_PATH, SUBSCRIBES_PATH, SUBSCRIBE_TIMES_DATA } = require("./CONST");
const { zodiacSigns } = require("./horoscope");

const USERS = JSON.parse(fs.readFileSync(USERS_PATH));
const SUBSCRIBES = JSON.parse(fs.readFileSync(SUBSCRIBES_PATH));

const setUser = async (user, zodiac = '') => {
    const isUserExist = Boolean(USERS[user.id]);

    if (isUserExist) {
        if (checkIsRewriteZodiac(USERS[user.id], zodiac)) {
            USERS[user.id].zodiac = zodiac;
        } else {
            return;
        }
    } else {
        USERS[user.id] = {
            ...user,
            zodiac,
            subscribes: {
                horoscope: null,
                calendar: null,
            }
        };
    }

    const data = JSON.stringify(USERS, null, 2);
    await fs.writeFile( USERS_PATH, data, (error) => {
        if (error) console.log(error);
    });
}

const checkIsRewriteZodiac = (currentUser, zodiac) => {
    if (!zodiac) return false;

    return currentUser.zodiac !== zodiac;
}

const subscribeUser = async (userId, time, type) => {
    const oldTime = USERS[userId]?.subscribes[type] || null;

    if (oldTime !== null ) {
        SUBSCRIBES[type][oldTime] = SUBSCRIBES[type][oldTime].filter(id => id !== userId);
    }

    SUBSCRIBES[type][time]?.push(userId);
    const subscribesData = JSON.stringify(SUBSCRIBES, null, 2);
    await fs.writeFile(SUBSCRIBES_PATH, subscribesData, (error) => {
        if (error) console.log(error);
    })

    USERS[userId].subscribes[type] = time;
    const usersData = JSON.stringify(USERS, null, 2);
    await fs.writeFile( USERS_PATH, usersData, (error) => {
        if (error) console.log(error);
    })
}

const unsubscribeUser = async (userId, type) => {
    const subscribeTime = USERS[userId]?.subscribes[type];

    if (!subscribeTime) return;

    SUBSCRIBES[type][subscribeTime] = SUBSCRIBES[type][subscribeTime].filter(id => id !== userId);
    USERS[userId].subscribes[type] = null;

    const subscribesData = JSON.stringify(SUBSCRIBES, null, 2);
    await fs.writeFile(SUBSCRIBES_PATH, subscribesData, (error) => {
        if (error) console.log(error);
    })

    const usersData = JSON.stringify(USERS, null, 2);
    await fs.writeFile( USERS_PATH, usersData, (error) => {
        if (error) console.log(error);
    })
}

const getUserSubscribes = (userId) => {
    const userData = USERS[userId];
    const horoscopeSubscribeTime = userData?.subscribes.horoscope;
    const calendarSubscribeTime = userData?.subscribes.calendar;
    const hasSubscribes = Boolean(horoscopeSubscribeTime) || Boolean(calendarSubscribeTime);
    let message = '';
    const keyboard = [];

    if (!userData || !hasSubscribes ) {
        message = `Вот это да, нет ни одной подписки 😔
                \n/horoscope - подписаться на рассылку гороскопа \n/mooncalendar - подписаться на рассылку лунного календаря 
`;
    } else {
        const subscribeMsg = [];
        if (horoscopeSubscribeTime) {
            subscribeMsg.push(`гороскоп для знака *${zodiacSigns[userData.zodiac].title}*, который приходит ежедневно в *${SUBSCRIBE_TIMES_DATA[horoscopeSubscribeTime]}*`);
            keyboard.push([{text: '💫 ❌ Отписаться от рассылки гороскопа?', callback_data: `unsubscribeHoroscope`}])
        }

        if (calendarSubscribeTime) {
            subscribeMsg.push(`лунный календарь, который приходит ежедневно в *${SUBSCRIBE_TIMES_DATA[calendarSubscribeTime]}*`);
            keyboard.push([{text: '🌚 ❌ Отписаться от рассылки лунного календаря?', callback_data: `unsubscribeCalendar`}])
        }

        message = 'Вы подписаны на ';
        subscribeMsg.forEach((item, i) => {
            if (i > 0) message+=' и ';
            message += subscribeMsg[i];
        })
    }

    return {
        message,
        keyboard
    }
}


module.exports = {
    setUser,
    unsubscribeUser,
    subscribeUser,
    getUserSubscribes,
    USERS,
    SUBSCRIBES,
}
