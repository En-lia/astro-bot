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
    Aries: { title: 'Овен', request: 'aries', symbol: '♈', born: '21 марта – 19 апреля'},
    Taurus: { title: 'Телец', request: 'taurus', symbol: '♉', born: '21 апреля – 20 мая'},
    Gemini: { title: 'Близнецы', request: 'gemini', symbol: '♊', born: '21 мая – 20 июня'},
    Cancer: { title: 'Рак', request: 'cancer', symbol: '♋', born: '21 июня – 22 июля'},
    Leo: { title: 'Лев', request: 'leo', symbol: '♌', born: '23 июля – 22 августа'},
    Virgo: { title: 'Дева', request: 'virgo', symbol: '♍', born: '23 августа – 22 сентября'},
    Libra: { title: 'Весы', request: 'libra', symbol: '♎', born: '23 сентября – 22 октября'},
    Scorpio: { title: 'Скорпион', request: 'scorpio', symbol: '♏', born: '23 октября – 21 ноября'},
    Sagittarius: { title: 'Стрелец', request: 'sagittarius', symbol: '♐', born: '22 ноября – 21 декабря'},
    Capricorn: { title: 'Козерог', request: 'capricorn', symbol: '♑', born: '22 декабря – 19 января'},
    Aquarius: { title: 'Водолей', request: 'aquarius', symbol: '♒', born: '20 января – 18 февраля'},
    Pisces: { title: 'Рыбы', request: 'pisces', symbol: '♓', born: '19 февраля – 20 марта'},
}

const horoscopeData = {
    title: '',
    symbol: '',
    born: '',
    date: '',
    description: '',
    businessScore: '',
    loveScore: '',
}

const getHoroscopeMsg = () => {
    return `${horoscopeData.symbol} *${horoscopeData.title}* (${horoscopeData.born})
    
*${horoscopeData.date}*
${horoscopeData.description}`
}

const setDate = (content) => {
    horoscopeData.date = content.querySelector('span').text.replace('Прогноз на ', '');
}

const setDescription = (article) => {
    let content = '';

    article?.forEach((item) => {
        const pElement = item.querySelector('div p');

        if (pElement) {
            content += `${pElement.text}\n\n`;
        }
    });

    horoscopeData.description = formatText(content);
}

const setHoroscopeData = (html, sign) => {
    const article = html.querySelectorAll('div[article-item-type="html"]');
    const currentDate = html.querySelector('div[data-logger="Breadcrumbs"][role="navigation"]');
    horoscopeData.title = zodiacSigns[sign].title;
    horoscopeData.symbol = zodiacSigns[sign].symbol;
    horoscopeData.born = zodiacSigns[sign].born;
    setDate(currentDate);
    setDescription(article);
}

const getHoroscope = async (sign, day) => {
    let param = `${zodiacSigns[sign].request}`;

    if (day) {
        day === 'nextDay' ? param += '/tomorrow' :  param += '/yesterday';
    } else {
        param += '/today';
    }


    try {
        const resp = await fetch(`https://horo.mail.ru/prediction/${param}`);
        const htmlText = await resp.text();
        setHoroscopeData(parseHtml(htmlText), sign);
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
