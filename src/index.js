const express = require('express');
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware');
var cookieParser = require('cookie-parser')
const defaultsObj=require('./defaultsObj.js')
const app = express();
let collectedCookies=require('./collectedCookies.js');

var corsOptions = {
  origin: 'https://test03.rshb.ru',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


app.use(cookieParser())
app.use((req, res, next)=>{
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)
   if( Object.keys(req.cookies).length>0) {
     collectedCookies = {...collectedCookies, ...req.cookies}
   } else {
    Object.entries(collectedCookies).forEach((name,value)=>{
      console.log(name, value)
      req.cookies[name] = value
    })
   }
  next()
})
app.use(cors());
app.use('/',  createProxyMiddleware({ target: 'https://test03.rshb.ru', changeOrigin: true }));
app.use(cors(corsOptions));




//app.use('/', createProxyMiddleware({ target: 'https://test03.rshb.ru', changeOrigin: true }));
//app.use('/', createProxyMiddleware({ target: 'https://test03.rshb.ru', changeOrigin: true }));



// app.use('/b1/ib6/rest/v40/login', (req, res, next)=>{
  
//   console.log(res.headers)
//  });


app.listen(3000, ()=> {
  console.log('http://localhost:3000')
});