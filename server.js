const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error');
      console.error(err);
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(data);
  });
});

// server lister on port 3000 on 0.0.0.0 
server.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on http://0.0.0.0:3000/');
});