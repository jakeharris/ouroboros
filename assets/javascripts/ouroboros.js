/* ====
 * GAME
 * ====
 */


var width = vpwidth(),
    height = vpheight(),
    c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    scenes = [],
    cur = 0,
    game,
    inputs = [],
    paused = false,
    upgrades = [];

ctx.font = "22pt Cascada";

var clear = function () {
        width = vpwidth();
        height = vpheight();
        if(c.width != vpwidth() || c.height != vpheight()) {
          c.width = vpwidth();
          c.height = vpheight();
          BLOCK_WIDTH = Math.floor(vpwidth() / 60);
          BLOCK_HEIGHT = BLOCK_WIDTH;
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.closePath();
        ctx.fill();
    };

var render = function () { 
        if(!scenes || !scenes[0]) scenes = [ new StartScene({ }), new TimeAttackSnakeScene({ }), new ShopScene({ }), new TimeAttackEndScene({ }) ];
        if(!scenes[cur]) {
          console.log("Current scene variable cur has exceeded legal bounds. (val: " + cur + ").")
          //return false;
        }
        scenes[cur].render();
    };

var logic = function () {
        if(!scenes || !scenes[0]) scenes = [ new StartScene({ }), new TimeAttackSnakeScene({ }), new ShopScene({ }), new TimeAttackEndScene({ }) ];
        if(!scenes[cur]) {
          console.log("Current scene variable cur has exceeded legal bounds. (val: " + cur + ").")
          //return false;
        }
        scenes[cur].logic();
    };

var loop = function () {
        clear();
        render();
        logic();
  
        game = setTimeout(loop, 10);
    };

var renderPause = function () {
        ctx.fillStyle = "rgba(0, 0, 0, .5)";
        ctx.beginPath();
        ctx.rect(0, 0, c.width, c.height);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.fillText('Press P or ESC to continue playing.', c.width*3/8, c.height/2); //FIXME
        ctx.fillText('Press Q to quit.', c.width*3/8, c.height/2 + 32);
        ctx.closePath();
}

var pause = function () {
        renderPause();
        if(!paused) {
          clearTimeout(game);
          if(scenes[cur].name === 'Time Attack - Snake') clearInterval(scenes[cur].arcadeTimeLooper);
          paused = true;
        } else {
          game = setTimeout(loop, 10);
          if(scenes[cur].name === 'Time Attack - Snake') { scenes[cur].arcadeTimeLooper = setInterval(scenes[cur].timerHandler, 1000); }
          paused = false;
        }
}

loop();
