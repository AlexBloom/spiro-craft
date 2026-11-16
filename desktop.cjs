const {app, BrowserWindow, Menu} = require('electron');
function createWindow() {
 const window = new BrowserWindow({width:1440,height:1000,minWidth:860,minHeight:650,title:'Spiro Craft',backgroundColor:'#f8f7f2',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.loadFile('dist/index.html');
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 window.webContents.on('will-navigate',e=>e.preventDefault());
 Menu.setApplicationMenu(Menu.buildFromTemplate([{role:'appMenu'},{role:'editMenu'},{role:'viewMenu'},{role:'windowMenu'}]));
}
app.whenReady().then(()=> {createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length) createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin') app.quit();});
