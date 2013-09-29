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
          if(inputs.length > 0)
            this.direction = inputs.pop();
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
      if(i == 0) e.fillStyle = '#CCCC09';
      else e.fillStyle = '#282828';
      e.render();
    });
  }
  
  var size = (opts.size) ? opts.size : SNAKE_BASE_LENGTH;
  
  while(this.blocks.length < size) this.blocks.push (new Block( { x: this.blocks[this.blocks.length - 1].x, y: this.blocks[this.blocks.length - 1].y + 1, moves: true} ));
  
}

function Menu (items, opts) {
  this.items = items;
  this.spacing = (opts.spacing) ? opts.spacing : 1*BLOCK_HEIGHT;
  this.x = (opts.x) ? opts.x : (vpwidth() / 2 - 100);
  this.y = (opts.y) ? opts.y : (vpheight() - 400);
  
  items.forEach(function (e, i, a){
    e.x = this.x;
    e.y = this.y;
    console.log(e.type);
    if(e.type === "MenuItem") {
      e.x += BLOCK_WIDTH;         //to make room for the cursor
      e.y += i*this.spacing;  //since item 0 of a menu is always the cursor object
    } else e.y -= BLOCK_HEIGHT;
  }, this);
  
  console.log('items.length: ' + items.length);
  this.cursor = (opts.cursor) ? opts.cursor : new Cursor( { }, items.length );
  
  this.render = function () {
    this.cursor.render(this.x, this.y, this.spacing);
    items.forEach(function (e, i, a) {
      e.render();
    });
  }
  this.move = function () {
    this.cursor.move();
    items.forEach(function (e, i, a) {
      e.move();
    });
  }
}

function Cursor (opts, max) {
  
  console.log('max: ' + max);
  console.log('max - 1: ' + (max - 1));
  
  this.i = (opts.i) ? opts.i : 0;
  this.max = (max) ? (max - 1) : 3;
  
  this.w = (opts.w) ? opts.w : BLOCK_WIDTH;
  this.h = (opts.h) ? opts.h : BLOCK_HEIGHT;
  
  this.fillStyle = (opts.fillStyle) ? opts.fillStyle : "#282828";
  
  this.move = function () {
    var d;
    if(inputs.length > 0)
      d = inputs.pop();
    if(d){
      switch(d){
        case Direction.UP:
          if ((this.i = this.i - 1) < 0) this.i = (this.max - 1);
          console.log('i: ' + this.i + ', max: ' + this.max);
          break;
        case Direction.DOWN:
          if (++this.i >= this.max) this.i = 0;
          console.log('i: ' + this.i + ', max: ' + this.max);
          break;
        case Direction.LEFT:
        case Direction.RIGHT:
        default:
          break;
      }
    }
      
    
  };
  
  this.render = function (x, y, spacing) {
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(x, y + (this.i * spacing), this.w, this.h);
    ctx.closePath();
  };
}

function Text (opts) {
  this.type = (opts.type) ? opts.type : "Title";
  this.text = (opts.text) ? opts.text : "OUROBOROS";
  
  this.x = (opts.x) ? opts.x : ((vpwidth() / 2) - 130);
  this.y = (opts.y) ? opts.y : ((vpheight() / 2) - 200);
  
  this.fontFamily = "MS Shell DLG, Arial, fantasy";
  this.fillStyle = (opts.fillStyle) ? opts.fillStyle : "#282828";
  switch(this.type){
    case "Title":
      this.fontSize = "32pt";
      break;
    case "MenuItem":
      this.fontSize = "22pt";
      break;
  }
  
  this.move = function () {
    // hover effect -- think Hotline Miami
    return;
  }
  
  this.render = function () {
    ctx.beginPath();
    ctx.font = this.fontSize + " " + this.fontFamily;
    ctx.fillStyle = this.fillStyle;
    ctx.fillText(this.text, this.x, this.y);
    ctx.closePath();
  }
}