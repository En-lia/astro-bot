const TelegramBot = require("node-telegram-bot-api");
const {BOT_TOKEN} = require("./keys");
const {SUBSCRIBE_TIMES_DATA, BOT_NAME} = require("./CONST");
const {setUser, subscribeUser, unsubscribeUser, getUserSubscribes, SUBSCRIBES, USERS} = require("./users");
const {zodiacSignsButtons, zodiacSigns, getHoroscopeButtons, getSubscribeTimesButtons, getHoroscope} = require("./horoscope");
const {getMoonCalendar, getMoonDayMsg, getWeekDayMsg, getMoonPhaseMsg} = require("./moonCalendar");

const bot = new TelegramBot(BOT_TOKEN, {polling: true});

const startBot = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/horoscope', description: 'Получить прогноз по знаку зодиака'},
        {command: '/mooncalendar', description: 'Получить прогноз по лунному календарю'},
        {command: '/mysubscribes', description: 'Посмотреть свои подписки'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const chatType = msg.chat.type;
        const name = msg.chat.first_name || msg.chat.title;


        if (text === '/start' || text === `/start${BOT_NAME}`) {
            return sendStartMessage(chatId, name);
        }

        if (text === '/horoscope' && chatType !=='group' || text === `/horoscope${BOT_NAME}`) {
            return bot.sendMessage(chatId, `Выбери свой знак зодиака:`, zodiacSignsButtons);
        }

        if (text === '/mooncalendar' || text=== `/mooncalendar${BOT_NAME}`) {
            return sendCalendarMessage(chatId);
        }

        if (text === '/mysubscribes' || text === `/mysubscribes${BOT_NAME}`) {
            return sendMySubscribesMassage(chatId)
        }

        if (text) {
            return bot.sendMessage(chatId, `Я тебя не понимаю, попробуй еще раз` )
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const isZodiacSign = Object.keys(zodiacSigns).includes(data);

        if (isZodiacSign) {
            await sendZodiacSignMessage(data, chatId);
            return bot.sendMessage(chatId, `${zodiacSigns[data].symbol} Может что-нибудь еще для знака *${zodiacSigns[data].title}?*`, getHoroscopeButtons(data));
        }

        const [option, param] = data.split('-');
        const isNextDay = option === 'nextDay';
        const isPrevDay = option === 'previousDay';
        const isSubscribeToHoroscope = option === 'subscribeHoroscope';
        const isSubscribeToCalendar = option === 'subscribeCalendar';
        const isSubscribeTimeToHoroscope = option === 'subscribeTimeHoroscope';
        const isSubscribeTimeToCalendar = option === 'subscribeTimeCalendar';
        const isUnsubscribeHoroscope = option === 'unsubscribeHoroscope';
        const isUnsubscribeCalendar = option === 'unsubscribeCalendar';
        const isMoonDayPhaseInfo = option === 'moonDayPhaseInfo';
        const isWeekDayInfo = option === 'weekDayInfo';

        if ( isNextDay || isPrevDay) await sendZodiacSignMessage(param, chatId, option);
        if (isSubscribeToHoroscope) {
            await setUser(msg.message.chat, param);
            return bot.sendMessage(chatId,
                `⏳ В какое время присылать гороскоп для знака *${zodiacSigns[param].title}* (время московское)?`,
                {
                    ...getSubscribeTimesButtons('Horoscope'),
                    parse_mode: 'Markdown'
                });
        }
        if (isSubscribeToCalendar) {
            await setUser(msg.message.chat);
            return bot.sendMessage(chatId,
                `⏳ В какое время присылать лунный календарь (время московское)?`,
                {
                    ...getSubscribeTimesButtons('Calendar'),
                    parse_mode: 'Markdown'
                });
        }

        if (isSubscribeTimeToHoroscope) {
            await subscribeUser(chatId, param, 'horoscope');
            return bot.sendMessage(chatId,
                `Готово! Теперь каждый день в *${SUBSCRIBE_TIMES_DATA[param]}* по московскому времени будет приходить ваш гороскоп`,
                { parse_mode: 'Markdown' });
        }

        if (isSubscribeTimeToCalendar) {
            await subscribeUser(chatId, param, 'calendar');
            return bot.sendMessage(chatId,
                `Готово! Теперь каждый день в *${SUBSCRIBE_TIMES_DATA[param]}* по московскому времени будет приходить лунный календарь`,
                { parse_mode: 'Markdown' });
        }

        if (isUnsubscribeHoroscope) {
            await unsubscribeUser(chatId, 'horoscope');
            return bot.sendMessage(chatId,
                `Готово! Вы отписаны от рассылки гороскопа`,
                { parse_mode: 'Markdown' });
        }

        if (isUnsubscribeCalendar) {
            await unsubscribeUser(chatId, 'calendar');
            return bot.sendMessage(chatId,
                `Готово! Вы отписаны от рассылки лунного календаря`,
                { parse_mode: 'Markdown' });
        }

        if (isMoonDayPhaseInfo) {
            const moonPhaseMsg = getMoonPhaseMsg();
            return bot.sendMessage(chatId,
                moonPhaseMsg,
                { parse_mode: 'Markdown' });
        }

        if (isWeekDayInfo) {
            const weekDayMsg = getWeekDayMsg();
            return bot.sendMessage(chatId,
                weekDayMsg,
                { parse_mode: 'Markdown' });
        }
    })

    console.log('Bot is starting...');
}

const sendStartMessage = async (chatId, name) => {
    await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/908/d49/908d4980-df6b-3818-8069-2b9bdf5af97b/2.webp')
    return bot.sendMessage(chatId, `*Привет, ${name}!* Чего желаешь?
            \n💫 Получить гороскоп - /horoscope
            \n🌚 Получить прогноз по лунному календарю - /mooncalendar
            \n📬 Управлять своими подписками - /mysubscribes`,
        { parse_mode: 'Markdown' })
}

const sendCalendarMessage = async (chatId) => {
    const keyboardItem = [{text: '📬 Подписаться на рассылку лунного календаря', callback_data: `subscribeCalendar`}];
    await sendMoonCalendarMessage(chatId, keyboardItem);
}

const sendMySubscribesMassage = async (chatId) => {
    const { message, keyboard } = getUserSubscribes(chatId);

    return bot.sendMessage(chatId, message, {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        }),
        parse_mode: 'Markdown'
    });
}

const sendZodiacSignMessage = async (data, chatId, option) => {
    const horoscope = await getHoroscope(data, option);
    return bot.sendMessage(chatId, horoscope, { parse_mode: 'Markdown' });
}

const sendMoonCalendarMessage = async (userId, keyboardItem) => {
    await getMoonCalendar();
    const moonDayMsg = getMoonDayMsg();
    const keyboard = [
        [{text: '🌓 Подробнее про Фазу луны', callback_data: `moonDayPhaseInfo`}],
        [{text: '📆 Узнать про Влияние дня недели ', callback_data: `weekDayInfo`}],
    ]

    if (keyboardItem) keyboard.push(keyboardItem);

    await bot.sendMessage(userId, moonDayMsg, {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        }),
        parse_mode: 'Markdown'
    });
}

const sendMailing =  () => {
    const currentHour = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', timeZone: 'Europe/Moscow' });
    const time = currentHour.replace(/^0/, '');
    const horoscopeSubscribers = SUBSCRIBES.horoscope[time];
    const calendarSubscribers = SUBSCRIBES.calendar[time];

    if (horoscopeSubscribers.length > 0) {
        horoscopeSubscribers.forEach( userId => {
            const zodiac = USERS[userId].zodiac;
            try {
                sendZodiacSignMessage(zodiac, userId);
            } catch (e) {
                console.log('Error sendZodiacSignMessage', e);
            }
        })
    }

    if (calendarSubscribers.length > 0) {
        calendarSubscribers.forEach( userId => {
            try {
                sendMoonCalendarMessage(userId);
            } catch (e) {
                console.log('Error sendMoonCalendarMessage', e);
            }
        })
    }
}

module.exports = {
    startBot,
    sendMailing,
}
