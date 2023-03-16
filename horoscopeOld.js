const fetch = require("node-fetch");
const {parseHtml, formatText} = require("./helper");
const { SUBSCRIBE_TIMES_DATA } = require('./CONST.js');

const zodiacSignsButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: '♈ Овен', callback_data: 'Aries'}, {text: '♉ Телец', callback_data: 'Taurus'}, {text: '♊ Близнецы', callback_data: 'Gemini'}, {text: '♋ Рак', callback_data: 'Cancer'}],
            [{text: '♌ Лев', callback_data: 'Leo'}, {text: '♍ Дева', callback_data: 'Virgo'}, {text: '♎ Весы', callback_data: 'Libra'}, {text: '♏ Скорпион', callback_data: 'Scorpio'}],
            [{text: '♐ Стрелец', callback_data: 'Sagittarius'}, {text: '♑ Козерог', callback_data: 'Capricorn'}, {text: '♒ Водолей', callback_data: 'Aquarius'}, {text: '♓ Рыбы', callback_data: 'Pisces'}],
        ]
    })
}

const getSubscribeTimesButtons = (type) => {
    const keyboard = [[], [], [], [], [], []];
    let position = 0;
    Object.keys(SUBSCRIBE_TIMES_DATA).forEach((time, i) => {
        if(i!== 0 && i % 4 === 0) {
            position++
        }

       keyboard[position].push({
           text: SUBSCRIBE_TIMES_DATA[time],
           callback_data: `subscribeTime${type}-${time}`
       })
   })

    return  {
        reply_markup: JSON.stringify({
            inline_keyboard: [...keyboard]
        })
    }
}

const zodiacSigns = {
    Aries: { title: 'Овен', request: 'oвен', symbol: '♈'},
    Taurus: { title: 'Телец', request: 'tелец', symbol: '♉'},
    Gemini: { title: 'Близнецы', request: 'Близнецы', symbol: '♊'},
    Cancer: { title: 'Телец', request: 'pак', symbol: '♋'},
    Leo: { title: 'Лев', request: 'Лев', symbol: '♌'},
    Virgo: { title: 'Дева', request: 'Дева', symbol: '♍'},
    Libra: { title: 'Весы', request: 'bесы', symbol: '♎'},
    Scorpio: { title: 'Скорпион', request: 'cкорпион', symbol: '♏'},
    Sagittarius: { title: 'Стрелец', request: 'cтрелец', symbol: '♐'},
    Capricorn: { title: 'Козерог', request: 'kозерог', symbol: '♑'},
    Aquarius: { title: 'Водолей', request: 'bодолей', symbol: '♒'},
    Pisces: { title: 'Рыбы', request: 'pыбы', symbol: '♓'},
}

const horoscopeData = {
    title: '',
    born: '',
    date: '',
    description: '',
    progress: {
        health: 0,
        energy: 0,
        money: 0,
        love: 0,
        work: 0,
        creation: 0,
    },
    luckyNumbers: '',
    friendlySigns: '',
    beware: '',
}

const getHoroscopeMsg = () => {
    return `*${horoscopeData.title}* (${horoscopeData.born})
    
*${horoscopeData.date}*
${horoscopeData.description} 
    
*Здоровье*: ${horoscopeData.progress.health}%      *Энергия*: ${horoscopeData.progress.energy}%     *Деньги*: ${horoscopeData.progress.money}% 
*Любовь*: ${horoscopeData.progress.love}%          *Работа*: ${horoscopeData.progress.work}%       *Творчество*: ${horoscopeData.progress.creation}%

*Счастливые числа*: ${horoscopeData.luckyNumbers}
*Дружественные знаки*: ${horoscopeData.friendlySigns}
*Остерегаться*: ${horoscopeData.beware}`
}

const setTitle = (content) => {
    horoscopeData.title = formatText(content?.querySelector('.chi_left')?.getElementsByTagName('h1')[0]?.childNodes[0]?._rawText)?.toUpperCase();
}

const setBornPeriod = (content) => {
    horoscopeData.born = formatText(content?.querySelector('.chi_left')?.getElementsByTagName('h6')[0]?.childNodes[0]?._rawText);
}

const setDate = (content) => {
    horoscopeData.date = formatText(content?.getElementsByTagName('h4')[0]?.childNodes[0]?._rawText);
}

const setDescription = (content) => {
    horoscopeData.description = formatText(content?.getElementsByTagName('p')[0]?.childNodes[0]?._rawText);
}

const setLuckyNumbers = (content) => {
    horoscopeData.luckyNumbers = formatText(content?.getElementsByTagName('p')[1]?.childNodes[1]?._rawText);
}

const setFriendlySigns = (content) => {
    horoscopeData.friendlySigns = formatText(content?.getElementsByTagName('p')[2]?.childNodes[1]?._rawText);
}

const setBeware = (content) => {
    horoscopeData.beware = formatText(content?.getElementsByTagName('p')[3]?.childNodes[1]?._rawText);
}

const setProgress = (content) => {
    const progressBlock = content?.getElementById('for_day');
    const progressChildNodesKey = {
        health: 1,
        energy: 3,
        money: 5,
        love: 7,
        work: 15,
        creation: 17,
    }

    Object.keys(progressChildNodesKey).map(i => {
        horoscopeData.progress[i] = progressBlock.childNodes[progressChildNodesKey[i]]?.querySelector('.right')?.childNodes[0]?._rawText?.trim();
    })
}

const setHoroscopeData = (html) => {
    const content = html.querySelector('.wrap2');

    setTitle(content);
    setBornPeriod(content);
    setDate(content);
    setDescription(content);
    setLuckyNumbers(content);
    setFriendlySigns(content);
    setBeware(content);
    setProgress(content);
}

const getHoroscope = async (sign, day) => {
    let param = `${zodiacSigns[sign].request}`;

    if (day) day === 'nextDay' ? param += '_1' : param += '_-1';

    try {
        const resp = await fetch(`https://goroskop.tv/${param}`)
        const htmlText = await resp.text()
        setHoroscopeData(parseHtml(htmlText));
        return getHoroscopeMsg();
    } catch (e){
        console.log('Error getHoroscope', e)
    }
};

const getHoroscopeButtons = (sign) => {
    return {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '⏮ Получить гороскоп на предыдущий день', callback_data: `previousDay-${sign}`}],
                [{text: '⏭ Получить гороскоп на следующий день', callback_data: `nextDay-${sign}`}],
                [{text: '📬 Подписаться на рассылку этого знака зодиака', callback_data: `subscribeHoroscope-${sign}`}],
            ]
        }),
        parse_mode: 'Markdown'
    }
}


module.exports = {
    getHoroscope,
    zodiacSigns,
    zodiacSignsButtons,
    getHoroscopeButtons,
    getSubscribeTimesButtons,
}
