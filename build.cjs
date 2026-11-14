const fs=require('node:fs');
fs.mkdirSync('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','geometry.mjs','icon.svg']) fs.copyFileSync(file,'dist/'+file);
console.log('Static web app built in dist/');
