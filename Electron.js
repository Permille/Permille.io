require("./Server.js");
const {app, BrowserWindow} = require("electron");
void async function(){
  await app.whenReady();

  const Window = new BrowserWindow({
    "width": 1280,
    "height": 720
  });
  Window.setMenuBarVisibility(false);
  Window.loadURL("http://127.0.0.1:27/dist/index.html");
  Window.setProgressBar(1);

  app.on("window-all-closed", function(){
    if(process.platform !== "darwin") app.quit();
  });
}();
