/* =======
 * HELPERS
 * =======
 
   Thanks to JCOC611 on stackoverflow!
   
 */


var vpwidth = function () {
   return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
}
var vpheight = function () {
   return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
}



/* =====
 * TYPES
 * =====
 
   Types common to the whole game. 
   
 */


/* CONSTANTS */
var BLOCK_WIDTH = Math.floor(vpwidth() / 60),
    BLOCK_HEIGHT = BLOCK_WIDTH,
    BLOCK_BASE_SPEED = 4,
    SNAKE_BASE_SPEED = 1,
    SNAKE_BASE_LOOPS_TO_MOVE = 20,
    SNAKE_BASE_LENGTH = 4;

Direction = {
  LEFT: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3
}

function Scene (name, opts) {
  this.name = name;
  this.entities = (opts.entities) ? opts.entities : [ new Snake({ }, { }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
  
  this.logic = (opts.logic) ? opts.logic : function () {
        if(!this.entities) {
          this.entities = [ new Snake({ }, { }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
          return;
        }
    
        if(inputs.length != 0)
            this.entities[0].direction = inputs.pop();
        if(atWorldsEnd()) return respawn();
        if(bitingSelf()) return respawn();
        if(eatingEgg()) return eggSpawn();
        return move();
  };
  this.render = (opts.render) ? opts.render : function () {
        if(!entities) return;
    
        entities.forEach(function (e, i, a) {  
          e.render();
        });
        
        ctx.fillStyle = '#282828';
        ctx.beginPath();
        ctx.fillText('Score: ' + score, c.width/20, c.height/20);
        ctx.fillText('High score: ' + highscore, c.width/20, c.height/10);
        ctx.closePath();
        ctx.fill();
  };
}

function SnakeScene (opts) {
  this.name = "Snake";
  this.entities = (opts.entities) ? opts.entities : [ new Snake({ }, { }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
  
  this.logic = (opts.logic) ? opts.logic : function () {
        if(!this.entities) {
          this.entities = [ new Snake({ }, { }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
          return;
        }
    
        if(inputs.length != 0)
            this.entities[0].direction = inputs.pop();
        if(this.atWorldsEnd()) return this.respawn();
        if(this.bitingSelf()) return this.respawn();
        if(this.eatingEgg()) return this.eggSpawn();
        return this.move();
  };
  this.render = (opts.render) ? opts.render : function () {
        if(!this.entities) return;
    
        this.entities.forEach(function (e, i, a) {  
          e.render();
        });
        
        ctx.fillStyle = '#282828';
        ctx.beginPath();
        ctx.fillText('Score: ' + score, c.width/20, c.height/20);
        ctx.fillText('High score: ' + highscore, c.width/20, c.height/10);
        ctx.closePath();
        ctx.fill();
  };
  
/* ======
 * EVENTS
 * ======
 
   Common game events. 
   These events can happen to nearly any object. 
   If I define a base object type for games, these will go there. 
   
 */

  this.atWorldsEnd = function () {
        var snakeHead;
        
        if(!this.entities) return false;
        if(!(snakeHead = this.entities[0].blocks[0]))return false;
        
        if(snakeHead.x < 0
           ||
           snakeHead.y < 0
           ||
           snakeHead.x > document.width/BLOCK_WIDTH - 1
           ||
           snakeHead.y > document.height/BLOCK_WIDTH - 1)
              return true;
        
        return false;
      };
                       
  this.bitingSelf = function () {
        if(!this.entities) return false;
        if(!this.entities[0].blocks[0]) return false;
      
        var head,
            ret = false;
        this.entities[0].blocks.some(function (e, i, a) {
          if(!head) { head = e; }
          else if(Math.sqrt(Math.pow(head.x - e.x, 2) + Math.pow(head.y - e.y, 2)) < 1) return (ret = true);
        });
        return ret;
      };
      
  this.eatingEgg = function () {
        var head;
        if(!this.entities) return false;
        if(!(head = this.entities[0].blocks[0])) return false;
        if(!this.entities[1]) return false;
        
        if(!head) { head = this.entities[0].blocks[0]; }
        else if(Math.sqrt(Math.pow(head.x - this.entities[1].x, 2) + Math.pow(head.y - this.entities[1].y, 2)) < 1) return true;
      
        return false;
      };
  
/* =======
 * ACTIONS
 * =======
 
   Common game actions. 
   These actions can be performed by nearly any object. 
   If I define a base object type for games, these will go there. 
   
 */


this.move = function () {
        if(!this.entities) return false;
        this.entities.forEach(function (e, i, a) {
          if(e.moves) e.move();
        });
      };

this.respawn = function () {
        if(!this.entities) return false;
        this.entities = [ new Snake({ }, { }) ];
        if(highscore < score) highscore = score;
        score = 0;
        this.entities[1] =  new Block ({ fillStyle: '#CC3A09' }) ;
      };

this.eggSpawn = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return respawn();
        this.entities[1] =  new Block ({ fillStyle: '#CC3A09' }) ;
        this.growSnake();
        score++;
        this.entities[0].loops_to_move = (this.entities[0].loops_to_move)*0.95 //used to be //entities[0].loops_to_move--;
      };

this.growSnake = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return false;
        
        var block,
            i,
            snakeBlocks = this.entities[0].blocks;
        
        i = snakeBlocks.length - 1;
        
        switch(snakeBlocks[i].direction) {
          case Direction.LEFT: //add it to the right of the last one
            block = new Block( { x: snakeBlocks[i].x + 1, y: snakeBlocks[i], moves: true } );
            break;
          case Direction.UP: //add it to the bottom of the last one
            block = new Block( { x: snakeBlocks[i].x, y: snakeBlocks[i].y + 1, moves: true} );
            break;
          case Direction.RIGHT: //add it to the left of the last one
            block = new Block( { x: snakeBlocks[i].x - 1, y: snakeBlocks[i], moves: true} );
            break;
          case Direction.DOWN: //add it to the top of the last one
            block = new Block( { x: snakeBlocks[i].x, y: snakeBlocks[i].y - 1, moves: true} );
            break;
          default:
            break;
        }
        
        snakeBlocks.push(block);
        this.entities[0].blocks = snakeBlocks;
      };
}

function Block (opts) {
  this.x = (opts.x) ? opts.x : Math.floor(Math.random() * Math.floor( document.width/BLOCK_WIDTH )), 
  this.y = (opts.y) ? opts.y : Math.floor(Math.random() * Math.floor( document.height/BLOCK_HEIGHT )),
  this.width = BLOCK_WIDTH,
  this.height = BLOCK_HEIGHT,
  this.moves = (opts.moves) ? opts.moves : false,
  this.fillStyle = (opts.fillStyle) ? opts.fillStyle : '#282828'; /* must be a color or a gradient or a pattern */
  
  this.multiplier = 1;
  this.direction = (opts.direction) ? opts.direction : Direction.UP;
  this.move = function () {
    switch (this.direction) {
      case Direction.LEFT:
        this.x = this.x - 1;
        break;
      case Direction.UP:
        this.y = this.y - 1;
        break;
      case Direction.RIGHT:
        this.x = this.x + 1;
        break;
      case Direction.DOWN:
        this.y = this.y + 1;
        break;
      default:
        return false;
    }
  };
  
  this.render = function () {
          ctx.fillStyle = (this.fillStyle)? this.fillStyle : '#282828';
          ctx.beginPath();
          ctx.rect((this.x)? this.x*BLOCK_WIDTH : 0,
                   (this.y)? this.y*BLOCK_HEIGHT : 0,
                   (this.width)? BLOCK_WIDTH : 0,
                   (this.height)? BLOCK_HEIGHT : 0); /* make this handle different shapes, images, etc. */
          ctx.closePath();
          ctx.fill();
  };
}

function Snake (opts, blockopts) {
  this.blocks = (blockopts) ? [ new Block (blockopts) ] : [ new Block ({ moves: true }) ],
  this.speed = (opts.speed) ? opts.speed : SNAKE_BASE_SPEED,
  this.loops_to_move = (opts.loops) ? opts.loops : SNAKE_BASE_LOOPS_TO_MOVE,
  this.loops = 0;
  this.tail;
  this.direction = (opts.direction) ? opts.direction : Direction.UP;
  this.moves = true;
  this.move = function () {
    if(++this.loops >= this.loops_to_move) {
        for(var x = 0; x < this.speed; x++) {
          this.tail = this.blocks.pop();
          this.tail.x = this.blocks[0].x; this.tail.y = this.blocks[0].y; this.tail.direction = this.blocks[0].direction;
          this.preventOuroboros();
          this.tail.move();
          this.blocks.unshift(this.tail)
        }
        this.loops = 0;
    }
  };
  
  this.preventOuroboros = function () {
    if((this.tail.direction == Direction.LEFT && this.direction == Direction.RIGHT)
    || (this.tail.direction == Direction.UP && this.direction == Direction.DOWN)
    || (this.tail.direction == Direction.RIGHT && this.direction == Direction.LEFT)
    || (this.tail.direction == Direction.DOWN && this.direction == Direction.UP))
      return;
    else this.tail.direction = this.direction;
  };
  
  this.render = function () {
    this.blocks.forEach(function(e, i, a) {
      e.render();
    });
  }
  
  var size = (opts.size) ? opts.size : SNAKE_BASE_LENGTH;
  
  while(this.blocks.length < size) this.blocks.push (new Block( { x: this.blocks[this.blocks.length - 1].x, y: this.blocks[this.blocks.length - 1].y + 1, moves: true} ));
  
}




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
        if(!scenes || !scenes[0]) scenes = [ new SnakeScene({ }) ];
        if(!scenes[cur]) {
          console.log("Current scene variable c has exceeded legal bounds. (val: " + c + ").")
          //return false;
        }
        scenes[cur].render();
    };

var logic = function () {
        if(!scenes || !scenes[0]) scenes = [ new SnakeScene({ }) ];
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
});

loop();
