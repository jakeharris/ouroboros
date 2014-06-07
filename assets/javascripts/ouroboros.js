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
    destroyStillAirsThroughIndex = 0,
    upgrades = [];

ctx.font = "22pt Cascada";

var clear = function () {
        var dim = setGameDimensions(vpwidth(), vpheight(), BLOCK_WIDTH, BLOCK_HEIGHT);
        BLOCK_WIDTH = dim.block_width;
        BLOCK_HEIGHT = dim.block_height;
        width = dim.width - 2 * BLOCK_WIDTH;
        height = dim.height - 2 * BLOCK_HEIGHT;
  
        if(c.width != vpwidth() || c.height != vpheight()) {
          c.width = vpwidth();
          c.height = vpheight();
        }
  
        ctx.fillstyle = '#282828';
        ctx.textAlign = 'center';
        ctx.beginPath();
        ctx.rect(0, 0, vpwidth(), vpheight());
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.rect(BLOCK_WIDTH, BLOCK_HEIGHT, width, height);
        ctx.closePath();
        ctx.fill();
        /*if(cur === TimeAttackScenes.SNAKE) {
          ctx.beginPath();
          ctx.closePath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
          ctx.stroke();
        }*/
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
        var dim = setGameDimensions(vpwidth(), vpheight(), BLOCK_WIDTH, BLOCK_HEIGHT);
        width = dim.width;
        height = dim.height;
        BLOCK_WIDTH = dim.block_width;
        BLOCK_HEIGHT = dim.block_height;
  
        if(c.width != vpwidth() || c.height != vpheight()) {
          c.width = vpwidth();
          c.height = vpheight();
        }
  
        ctx.fillstyle = '#282828';
        ctx.beginPath();
        ctx.rect(0, 0, vpwidth(), vpheight());
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = "rgba(0, 0, 0, .5)";
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.closePath();
        ctx.fill();
  
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.fillText('Press P or ESC to continue playing.', width*3/8, height/2); //FIXME
        ctx.fillText('Press Q to quit.', width*3/8, height/2 + 64);
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
