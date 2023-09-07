const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const proxy = require('express-http-proxy');
const catchCookies = require('./catchCookies');
let catchedCookies = require('./catchedCookies');
const getCookiesString = require('./getCookiesString');
const catchedCookiesFile = './src/catchedCookies.js';
let proxyUrl = 'https://test04.rshb.ru';
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

const getProxyUrl = () => {
  return proxyUrl;
};

const cookieCatcher = (req, res, next) => {
  //console.log('**proxyUrl:');
  //console.log(proxyUrl);
  if (catchedCookies.JSESSIONID) {
    req.headers.cookie = getCookiesString(req.headers.cookie, catchedCookies);
    //console.log(catchedCookies);
    //console.log(req.headers.cookie);
  }
  time = 10;
  restartResetTimer();
  catchCookies(req, catchedCookies);
  next();
};

app.use('/', cookieCatcher);

app.get('/manual', (req, res) => {
  res.status(200);
  res.send(
    `<h3>PWA corsy-proxy-server</h3>
    <p>Установлен стенд: <b>${standInfo}</b></p>
    <p><button><a href="/toggleProxyUrl">Сменить стенд</a></button> (Сменит стенд, а также очистит накопленные данные)</p> 
    <p><button><a href="/resetNow">Сброс</a></button> (TEST04  установится по умолчанию). </p>
    <p style="max-width: 50%"> Принцип заключается в переадресации запроса через прокси сервер, на котором решается проблема с CORS. Тем не менее, браузер отказывется принимать и отправлять куки, без которых не происходит авторизация. Куки накапливаются на прокси-сервере и отправляются при каждом запросе, поэтому логин происходит со второго клика (* возможно это как-то решается).
    Cервер сбросится (перезапустится и завершит сессии) автоматически через 10 мин после последней активности (за это отвечает "let needResetTimer = true" в index.js ).<br>
    Данные хранятся в оперативной памяти. Необходимо выполнять сброс перед началом работы. Несброшенные данные от предыдущего аккаунта могут приводить к блокировке нынешнего аккаунта на 1 час.<br>  
    Перебрасывайте PWA наружу с помощью ngrok или аналогов (localtunnel и пр.) - манипуляции с настройками браузера не обеспечивают стабильную работу.<br>
    Итоговое приложение работает стабильно и ничем не отличается от обычного PWA, за исключением чата (чат блокируется CORS, возможно обходит прокси-сервер и работает напрямую со своими рестами)<br>
    Запуск может показаться медленным, но работа приложения приемлема.<br>
    Прокси-сервер может обслуживать только одно подключение одновременно!</p>
    <p>1) Для работы пропишите в файле config.ts:</p>
    <p>var workHost = <b>"https://simple-proxy-server-03.onrender.com"</b></p>
    <p style="max-width: 50%">1-б) Для локальной работы (только для симулятора IOS или десктопных браузеров в обычном режиме) запустите прокси-сервер (npm start), пропишите в файле config.ts: </p>
    <p>var workHost =<b>"http://localhost:3000"</b></p>
    <p>2) Выполните сброс прокси-сервера, выберите стенд</p>
    <p>3) Начинайте работу</p>
    `
  );
});

app.get('/toggleProxyUrl', (req, res) => {
  catchedCookies = {};
  proxyUrl =
    proxyUrl === 'https://test03.rshb.ru'
      ? 'https://test04.rshb.ru'
      : 'https://test03.rshb.ru';
  standInfo = proxyUrl === 'https://test03.rshb.ru' ? 'TEST03' : 'TEST04';
  res.status(200);
  //console.log('Proxy URL: ', getProxyUrl());
  res.redirect(`/manual`);
});

app.get('/resetNow', (req, res) => {
  res.send(
    '<p>Выполнен сброс сервера</p><button><a href="/manual">НАЗАД</a></button> '
  );
  resetData();
});

app.use(cors());


app.use('/', proxy(getProxyUrl));

app.listen(3000, () => {
  console.log(
    `(config.ts) var workHost = "http://localhost:3000"
manual: http://localhost:3000/manual`
  );
});
