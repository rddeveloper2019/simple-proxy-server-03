const express = require('express');
const cors = require('cors')
const app = express();
var proxy = require('express-http-proxy');

app.get('/test', (req, res)=>{
  res.status(200);
  res.send('<p>https://simple-proxy-server-03.onrender.com/test03</p><p>https://simple-proxy-server-03.onrender.com/test04</p>');
})

app.use(cors());
app.use('/test03', proxy('https://test03.rshb.ru'));
app.use('/test04', proxy('https://test04.rshb.ru'));

app.listen(3000, ()=> {
  console.log('http://localhost:3000')
});