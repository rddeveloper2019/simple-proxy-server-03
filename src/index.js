const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const proxy = require('express-http-proxy');
const catchCookies = require('./catchCookies');
const catchedCookies = require('./catchedCookies');
const getCookiesString = require('./getCookiesString');
const catchedCookiesFile = './catchedCookies.js';
let proxyUrl = 'https://test03.rshb.ru';
let needResetTimer = true;
let time = 0;
let resetTimer = null;
let standInfo = proxyUrl === 'https://test03.rshb.ru' ? 'TEST03' : 'TEST04';
const resetData = () => {
  const data = 'module.exports = {};';
  fs.writeFile(catchedCookiesFile, data, (err) => {
    if (err) {
      console.log('server reset err:');
      console.log(err);
    } else {
      console.log('server reset success');
    }
  });

};

const restartResetTimer = () => {
  if (!time) {
    return;
  }
  if (resetTimer) {
    clearTimeout(resetTimer);
  }
  if (needResetTimer) {
    console.log(`reset timer: reset data after ${time} min`);
    resetTimer = setTimeout(resetData, time * 1000 * 60);
  }
};

const cookieCather = (req, res, next) => {
  if (catchedCookies.JSESSIONID) {
    req.headers.cookie = getCookiesString(req.headers.cookie, catchedCookies);
    console.log(catchedCookies);
    console.log(req.headers.cookie);
  }
  time = 7;
  restartResetTimer();
  catchCookies(req, catchedCookies);
  next();
};

app.use(cookieCather);

app.get('/manual', (req, res) => {
  res.status(200);
  const message = needResetTimer
    ? 'Автоматическое обнуление ON (сервер перезапустится через 7 минут после последнего запроса)'
    : 'Автоматическое обнуление OFF';

  res.send(
    `<p>var workHost ="https://simple-proxy-server-03.onrender.com"</p><p>Стенд: ${standInfo}</p><a href="/toggleProxyUrl">Сменить стенд</a><p>${message}</p><a href="/toggleTimer">ОТКЛ/ВКЛ автоматическое обнуление</a><p><a href="/resetNow">Обнулить сейчас (Стенд RTEST по умолчанию)</a></p>`
  );
});

app.get('/toggleTimer', (req, res) => {
  needResetTimer = !needResetTimer;
  const message = needResetTimer ? 'Reset timer ON' : 'Reset timer OFF';
  res.status(200);
  console.log(message);
  res.redirect(`/manual`);
});

app.get('/toggleProxyUrl', (req, res) => {
  ;
  proxyUrl =
    proxyUrl === 'https://test03.rshb.ru'
      ? 'https://test04.rshb.ru'
      : 'https://test03.rshb.ru';
  standInfo = proxyUrl === 'https://test03.rshb.ru' ? 'TEST03' : 'TEST04';
  res.status(200);
  console.log('Proxy URL: ', proxyUrl);
  res.redirect(`/manual`);
});

app.get('/resetNow', (req, res) => {
  resetData();
  console.log('Proxy URL: ', proxyUrl);
  res.status(200);
  res.redirect(`/manual`);
});

app.use(cors());

app.use('/', proxy(proxyUrl));

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
