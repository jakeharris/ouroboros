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
    score = 0,
    highscore = 0;

ctx.font = "22pt Arial";

var clear = function () {
        width = vpwidth();
        height = vpheight();
        if(c.width != vpwidth() || c.height != vpheight()) {
          c.width = vpwidth();
          c.height = vpheight();
          BLOCK_WIDTH = Math.floor(vpwidth() / 60);
          BLOCK_HEIGHT = BLOCK_WIDTH;
        }
        ctx.fillStyle = '#fafafa';
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.closePath();
        ctx.fill();
    };

var render = function () { 
        if(!scenes || !scenes[0]) scenes = [ new StartScene({ }), new SnakeScene({ }) ];
        if(!scenes[cur]) {
          console.log("Current scene variable c has exceeded legal bounds. (val: " + c + ").")
          //return false;
        }
        scenes[cur].render();
    };

var logic = function () {
        if(!scenes || !scenes[0]) scenes = [ new StartScene({ }), new SnakeScene({ }) ];
        if(!scenes[cur]) {
          console.log("Current scene variable c has exceeded legal bounds. (val: " + c + ").")
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
        ctx.fillText('Press <P> or <ESC> to continue playing.', c.width*3/8, c.height/2); //FIXME
        ctx.closePath();
}

var pause = function () {
        renderPause();
        if(!paused) {
          game = clearTimeout(game);
          paused = true;
        } else {
          game = setTimeout(loop, 10);
          paused = false;
        }
}

document.addEventListener('keydown', function (e) {
  var d = scenes[cur].entities[0].direction,
      key = e.which;
  
  if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
  else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
  else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
  else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
  else if (key == '27' || key == '80') pause();
  
  inputs.push(d);
  console.log('inputs[0]: ' + inputs[0]);
});

loop();
