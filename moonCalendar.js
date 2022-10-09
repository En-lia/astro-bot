const fetch = require("node-fetch");
const {parseHtml} = require("./helper")

const moonCalendarData = {
    moonDayTitle: '',
    moonDayDescription: '',
    moonTypeTitle: '',
    moonTypeDescription: '',
    weekDayTitle: '',
    weekDayDescription: '',
}

const getMoonDayMsg = () => {
    return `*${moonCalendarData.moonDayTitle}*
${moonCalendarData.moonDayDescription}

*${moonCalendarData.moonTypeTitle}*
${moonCalendarData.moonTypeDescription}`
}

const getWeekDayMsg = () => {
    return `*${moonCalendarData.weekDayTitle}*
${moonCalendarData.weekDayDescription}`
}

const getMoonCalendar = async () => {
    try {
        const resp = await fetch(`https://mirkosmosa.ru/lunar-calendar/phase-moon/lunar-day-today`)
        const htmlText = await resp.text()
        setMoonCalendarData(parseHtml(htmlText));
    } catch (e){
        console.log('Error getMoonCalendar', e)
    }
};

const setMoonCalendarData = (html) => {
    const content = html.querySelector('.moon_c-wrapper');

    moonCalendarData.moonDayTitle = formatTitle(content?.childNodes[9]?.childNodes[1]?.childNodes[0]?._rawText);
    moonCalendarData.moonDayDescription = content?.childNodes[9]?.childNodes[3]?.textContent;

    moonCalendarData.moonTypeTitle = formatTitle(content?.childNodes[11]?.childNodes[1]?.childNodes[0]?._rawText);
    moonCalendarData.moonTypeDescription = content?.childNodes[11]?.childNodes[3]?.textContent;

    moonCalendarData.weekDayTitle = formatTitle(content?.childNodes[13]?.childNodes[1]?.childNodes[0]?._rawText);
    moonCalendarData.weekDayDescription = content?.childNodes[13]?.childNodes[3]?.textContent;
}

const formatTitle = (string) => {
    return string.replace(/(\(.*\))|([\(\)])/, ' ');
}

module.exports = {
    getMoonCalendar,
    getMoonDayMsg,
    getWeekDayMsg,
}
