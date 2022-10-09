const HTMLParser = require("node-html-parser");

const parseHtml = (htmlText) => {
    const html = htmlText.replace(/<!DOCTYPE html>/g, '');
    return HTMLParser.parse(html);
}

const formatText = (text) => {
    return text.trim().replace(/(\r\n|\n|\r)/gm, ' ');
}

const getSubscribeTimesData = () => {
    const subscribeTimes = {};

    for ( let i = 0; i < 24; i++ ) {
        if (i < 10) {
            subscribeTimes[i] = `0${i}:00`
        } else {
            subscribeTimes[i] = `${i}:00`
        }
    }

    return subscribeTimes;
}

module.exports = {
    parseHtml,
    formatText,
    getSubscribeTimesData,
}
