const express = require('express');
const cors = require('cors')
const app = express();
var proxy = require('express-http-proxy');

app.get('/test', (req, res)=>{
  res.status(200);
  res.send('proxy-server-03 SUCCESS');
})

app.use(cors());
app.use(proxy('https://test03.rshb.ru'));


app.listen(3000, ()=> {
  console.log('http://localhost:3000')
});