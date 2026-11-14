const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = {'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req,res) => {
  const name = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(__dirname, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(__dirname + path.sep) || !['.html','.js','.mjs','.css','.svg','.json'].includes(path.extname(file))) {res.writeHead(404); return res.end();}
  fs.readFile(file,(err,data)=> {res.writeHead(err ? 404 : 200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache'});res.end(err ? 'Not found' : data);});
}).listen(5173,'127.0.0.1',()=>console.log('Spiro Craft → http://127.0.0.1:5173'));
