/* =======
 * HELPERS
 * =======
 
   Thanks to JCOC611 on stackoverflow for the robust dimension detection!
   Thanks to Grumdrig on stackoverflow for the roundRect idea!
   
 */


var vpwidth = function () {
   return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
}
var vpheight = function () {
   return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
}

var setGameDimensions = function(w, h) {
   
   if(w >= 1920) w = 1920;
   if(w >= 1600) w = 1600;
   if(w >= 1366) w = 1366;
   if(w >= 1024) w = 1024;
   if(w >= 800)  w = 800;
   if(w >= 640)  w = 640;

   if(h >= 1080) h = 1080;
   if(h >= 900)  h = 900;
   if(h >= 768)  h = 768;
   if(h >= 640)  h = 640;
   if(h >= 600)  h = 600;
   if(h >= 480)  h = 480;

}

function hasUpgrade(p){
  for(var u in upgrades) {
        if(upgrades[u] === p) return true;
  }
  return false;
}
function cloneArray(arr) {
  var tmp = new Array();
  for(var a in arr) {
    tmp[a] = new Object(arr[a]); 
  }
  return tmp;
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

StartSceneMenuOptions = {
  CONTINUE: 0,
  NEWGAME: 1,
  TIMEATTACK: 2
}

TimeAttackScenes = {
  MAINMENU: 0,
  SNAKE: 1,
  SHOP: 2,
  GAMEOVER: 3
}

function EntityInitializationException(message) {
  this.message = message;
  this.name = 'EntityInitializationException';
};
function SceneInitializationException(message) {
  this.message = message;
  this.name = 'SceneInitializationException';
};
