module.exports = (req, catchedCookies) => {
  const sock = req.socket;
  const write = sock.write.bind(sock);
  sock.write = (data, encoding, callback) => {
    if (typeof data === 'string') {
      var cookies = data.split('\n').filter((e) => e.includes('set-cookie'));
      if (cookies.length > 0) {
        cookies = cookies.map((el) => {
          return el.split(' ').slice(1);
        });
        cookies.forEach((el) => {
          el.forEach((str) => {
            if (str.includes('=')) {
              var [key, value] = str.split('=');
              if (key.toLowerCase() === 'path') {
                catchedCookies['path'] = value.slice(0, -1);
              } else if (!catchedCookies[key]) {
                catchedCookies[key] = value.slice(0, -1);
              }
            }
          });
          catchedCookies['SameSite'] = 'None; Secure; HttpOnly';
        });
      }
    }

    write(data, encoding, callback);
  };
};
