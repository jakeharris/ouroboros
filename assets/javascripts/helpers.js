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