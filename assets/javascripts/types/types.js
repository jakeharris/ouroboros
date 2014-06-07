/* =====
 * TYPES
 * =====
 
   Types common to the whole game. 
   
 */


/* CONSTANTS */
var BLOCK_WIDTH = Math.floor(vpwidth() / 60),
    BLOCK_HEIGHT = BLOCK_WIDTH,
    BLOCK_BASE_SPEED = 4,
    SNAKE_BASE_SIZE = 5,
    SNAKE_BASE_SPEED = 1,
    SNAKE_BASE_LOOPS_TO_MOVE = 15,
    SNAKE_BASE_LENGTH = 4,
    ARCADE_TIMER_STARTING_MAX = 30, // (in seconds) (hopefully)
    STILLZONE_BASE_RADIUS = 6,
    STILLZONE_BASE_DURATION = 3; 

Direction = {
  LEFT: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3
}

function Upgrades () {
 
}

Upgrades.SmoothUnderbelly = {
   id: 0,
   name: "Smooth underbelly",
   price: 10,
   flavorText: "Lets you start faster. Carpe diem!",
   isUnique: true, // means you can only buy it once
   speed: SNAKE_BASE_LOOPS_TO_MOVE * Math.pow(0.95, 10), // moves like you already have a score of 10
   fillStyle: "#CC3A09"
}; 

Upgrades.StillAir = {
  id: 1,
  name: "Still air",
  price: 5,
  flavorText: "Slows down everything in an area to a balmy calm. Consumable.",
  isUnique: false
};



Upgrades.GoldenPlumes = {
  id: 2,
  name: "Golden plumes",
  price: 20,
  flavorText: "Allows true ouroboros. Try leaving the map to see!",
  isUnique: true
};

Upgrades.Aerobody = {
  id: 3,
  name: "Aerobody",
  price: 20,
  flavorText: "Transforms pieces of your body into raw, elemental, air magic.",
  isUnique: true
}

function Block (opts) {
  
  this.x = (opts !== undefined && opts.x !== undefined) ? opts.x : Math.floor(Math.random() * Math.floor( width/BLOCK_WIDTH - 1 )) + 1;
  this.y = (opts !== undefined && opts.y !== undefined) ? opts.y : Math.floor(Math.random() * Math.floor( height/BLOCK_HEIGHT - 1 )) + 1;    
  this.width = BLOCK_WIDTH,
  this.height = BLOCK_HEIGHT,
  this.moves = (opts.moves) ? opts.moves : false,
  this.fillStyle = (opts.fillStyle) ? opts.fillStyle : '#282828'; /* must be a color or a gradient or a pattern */
  this.sprite = new Image();
  this.sprite.src = 'assets/sprites/snake-body-vert-modern.png';
  
  this.multiplier = 1;
  this.direction = (opts.direction !== undefined) ? opts.direction : Direction.UP;
  
  this.move = function () {
    if(!this.moves) return false;
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
    if(hasUpgrade(Upgrades.GoldenPlumes) && (this.x < 1 || this.x > width/BLOCK_WIDTH || this.y < 1 || this.y > height/BLOCK_WIDTH)) {
      if(this.x < 1) {
        this.x = width/BLOCK_WIDTH; 
      } else if (this.x > width / BLOCK_WIDTH) {
        this.x = 1; 
      } else if (this.y < 1) {
          this.y = Math.floor(height / BLOCK_WIDTH);
      } else if (this.y > height/BLOCK_WIDTH) {
        this.y = 1; 
      }
    }
  };
  
  this.render = function () {
          ctx.fillStyle = (this.fillStyle)? this.fillStyle : '#282828';
          ctx.beginPath();
          /*ctx.drawImage(this.sprite, this.x*BLOCK_WIDTH, this.y*BLOCK_HEIGHT);*/
          ctx.rect((this.x)? this.x*BLOCK_WIDTH : 0,
                   (this.y)? this.y*BLOCK_HEIGHT : 0,
                   (this.width)? BLOCK_WIDTH : 0,
                   (this.height)? BLOCK_HEIGHT : 0);  //make this handle different shapes, images, etc. 
          ctx.closePath();
          ctx.fill();
          // TODO: WORK IN PROGRESS. ADDS A RED LINE TO ONE SIDE OF THE SNAKE WHEN YOU HAVE THE SMOOTH UNDERBELLY UPGRADE.
          /*if (hasUpgrade(Upgrades.SmoothUnderbelly)) {
            var x = 0,
                y = 0,
                width = 0,
                height = 0;
            switch(this.direction) {
              case Direction.LEFT:
              case Direction.RIGHT:
                y = BLOCK_HEIGHT - 2;
                width = BLOCK_WIDTH;
                height = 2;
                break;
              case Direction.UP:
              case Direction.DOWN:
                x = BLOCK_WIDTH - 2;
                width = 2;
                height = BLOCK_HEIGHT;
            }
            ctx.fillStyle = Upgrades.SmoothUnderbelly.fillStyle;
            ctx.beginPath();
            ctx.rect(this.x*BLOCK_WIDTH + x,
                     this.y*BLOCK_HEIGHT + y,
                     width,
                     height);
            ctx.closePath();
            ctx.fill();
          }*/
  };
}

function getDirectionFromWallProximity(b) { //b for block
  switch(Math.min(b.x, b.y, (Math.floor( width/BLOCK_WIDTH ) - b.x), (Math.floor( height/BLOCK_HEIGHT ) - b.y))) {
    case b.x: //nearest the left wall
      return (b.direction = Direction.RIGHT);
    case b.y: //nearest the top wall
      return (b.direction = Direction.DOWN);
    case (Math.floor( width/BLOCK_WIDTH ) - b.x):
      return (b.direction = Direction.LEFT);
    case (Math.floor( height/BLOCK_HEIGHT ) - b.y):
      return (b.direction = Direction.UP);
    default:
      return (b.direction = Direction.UP);
  }
}

function Snake (opts, blockopts) {
  this.blocks = (blockopts !== undefined) ? [ new Block (blockopts) ] : [ new Block ({ moves: true }) ],
  this.speed = (opts.speed) ? opts.speed : SNAKE_BASE_SPEED,
  this.loopsToMove = (opts.loops) ? opts.loops : SNAKE_BASE_LOOPS_TO_MOVE,
  this.loops = 0;
  this.tail;
  this.direction = getDirectionFromWallProximity(this.blocks[0]);
  
  this.moves = true;
  this.move = function () {
    var loopsToMove = this.loopsToMove;
    if(loopsToMove > Upgrades.SmoothUnderbelly.speed) {
      if(hasUpgrade(Upgrades.SmoothUnderbelly)) {
          loopsToMove = Upgrades.SmoothUnderbelly.speed; 
      }
    }
    if(scenes[cur].inStillAir) loopsToMove = SNAKE_BASE_LOOPS_TO_MOVE*3;
    if(++this.loops >= loopsToMove) {
        for(var x = 0; x < this.speed; x++) {
          this.tail = this.blocks.pop();
          this.tail.x = this.blocks[0].x; this.tail.y = this.blocks[0].y; this.tail.direction = this.blocks[0].direction;
          if(inputs.length > 0) {
            var i = inputs.pop();
            while(i !== undefined && 
               (i == this.direction 
                || (i == Direction.LEFT && this.direction == Direction.RIGHT)
                || (i == Direction.UP && this.direction == Direction.DOWN)
                || (i == Direction.RIGHT && this.direction == Direction.LEFT)
                || (i == Direction.DOWN && this.direction == Direction.UP))) {
              i = inputs.pop();
            }
            this.direction = (i !== undefined) ? i : this.direction;
          }
          this.preventOuroboros();
          this.tail.move();
          this.blocks.unshift(this.tail);
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
      if(i == 0 && hasUpgrade(Upgrades.GoldenPlumes)) e.fillStyle = '#CCCC09';
      else if((i > (this.blocks.length - 1)/4 && i < (this.blocks.length - 1)*3/4) && hasUpgrade(Upgrades.Aerobody)) e.fillStyle = '#ddd';
      else e.fillStyle = '#282828';
      e.render();
    }, this);
  }
  
  var size = (opts.size) ? opts.size : SNAKE_BASE_LENGTH,
      xmod = 0,
      ymod = 0;
  
  switch(this.blocks[0].direction){
      case Direction.LEFT:
        xmod = 1;
        break;
      case Direction.UP:
        ymod = 1;
        break;
      case Direction.RIGHT:
        xmod = -1;
        break;
      case Direction.DOWN:
        ymod = -1;
        break;
      default:
        ymod = 1;
        break;
  }
  
  while(this.blocks.length < size) {
    this.blocks.push (new Block( { 
                                  x: this.blocks[this.blocks.length - 1].x + xmod, 
                                  y: this.blocks[this.blocks.length - 1].y + ymod, 
                                  moves: true, 
                                  direction: this.blocks[0].direction
                                } ));
  }
  
}

function Menu (items, opts) {
  this.items = items;
  this.spacing = (opts.spacing) ? opts.spacing : height / 10;
  this.x = (opts.x) ? opts.x : width / 2 - 100;
  this.y = (opts.y) ? opts.y : (height - 400);
  this.cursor = new Cursor ( items.length - 1, { h: 16, w: 16 } )
  
  while(this.items[this.cursor.i].isCursorable !== undefined && !this.items[this.cursor.i].isCursorable) this.cursor.i++;
  
  items.forEach(function (e, i, a) {
    e.x = this.x;
    e.y = this.y;
    if(e.type === "MenuItem") {
      e.x += BLOCK_WIDTH;
      e.y += i*this.spacing;
    }
    if (i == items.length - 1 && e.isQuitOption == true) e.y += this.spacing;
  }, this);
  
  this.render = function () {
    this.spacing = height / 10;
    this.cursor.render(this.x, this.items[this.cursor.i].y - this.cursor.h);
    items.forEach(function (e, i, a) {
      e.x = this.x;
      e.y = this.y;
      if(e.type === "MenuItem") {
        e.x += BLOCK_WIDTH;
        e.y += i*this.spacing;
      }
      if (i == items.length - 1 && e.isQuitOption == true) e.y += this.spacing;
      e.render();
    }, this);
  }
  
  this.move = function () {
    var d = this.cursor.move();
    if(this.items[this.cursor.i].isCursorable !== undefined && !this.items[this.cursor.i].isCursorable) {
      inputs.push(d);
      this.cursor.move();
    }
    items.forEach(function (e, i, a) {
      e.move();
    });
  }
}

function Cursor (max, opts) {
  this.max = max;
  
  this.i = (opts.i) ? opts.i : 0;
  this.w = (opts.w) ? opts.w : BLOCK_WIDTH;
  this.h = (opts.h) ? opts.h : BLOCK_HEIGHT;
  
  this.fillStyle = (opts.fillStyle) ? opts.fillStyle : '#282828';
  
  this.move = function () {
    var d;
    if(inputs.length > 0) {  d = inputs.pop(); }
    if(d) {
      switch(d){
        case Direction.UP:
          if (--this.i < 0) this.i = this.max;
          break;
        case Direction.DOWN:
          if (++this.i > this.max) this.i = 0;
          break;
        case Direction.LEFT:
        case Direction.RIGHT:
        default:
          break;
      }
    }
    return d;
  };
  
  this.render = function (x, y) {
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(x, y, this.w, this.h);
    ctx.closePath();
  };
}

// for when simple text won't cut it
function ShopItem (opts) {
  this.type = (opts.type) ? opts.type : "MenuItem";
  this.text = (opts.text) ? opts.text : Upgrades.SmoothUnderbelly.name;
  this.id = (opts.id) ? opts.id : 0;
  this.val = (opts.val) ? opts.val : Upgrades.SmoothUnderbelly.price;
  this.flavorText = (opts.flavorText) ? opts.flavorText : Upgrades.SmoothUnderbelly.flavorText;  
  this.soldOut = false;
  
  this.x = (opts.x !== undefined) ? opts.x : ((width / 4) - 130);
  this.y = (opts.y !== undefined) ? opts.y : ((height / 2) - 200);
  this.w = (opts.w !== undefined) ? opts.w : (width / 2);
  
  this.fontFamily = "MS Shell DLG, Arial, fantasy";
  this.fillStyle = (opts.fillStyle) ? opts.fillStyle : "#282828";
  this.altFillStyle = (opts.altFillStyle) ? opts.altFillStyle : "#999";
  this.soldOutFillStyle = "#885050";
  this.fontSize = "22pt";
  
  this.move = function () {
    // hover effect -- think Hotline Miami
    return;
  }
  
  this.render = function () {
    ctx.beginPath();
    ctx.font = this.fontSize + " " + this.fontFamily;
    ctx.fillStyle = (this.soldOut) ? this.soldOutFillStyle : this.fillStyle;
    ctx.fillText(this.text, this.x, this.y);
    ctx.fillStyle = this.altFillStyle;
    ctx.fillText(this.val, this.x + this.w - 50, this.y);
    ctx.font = "14pt " + this.fontFamily;
    ctx.fillText(this.flavorText, this.x, this.y + 28);
    ctx.closePath();
  }
}

function Text (opts) {
  this.type = (opts.type) ? opts.type : "Title";
  this.text = (opts.text) ? opts.text : "OUROBOROS";
  
  this.isQuitOption = (opts.isQuitOption) ? opts.isQuitOption : false;
  this.isCursorable = (opts.isCursorable !== undefined) ? opts.isCursorable : true;
  
  this.x = (opts.x) ? opts.x : (width / 2);
  this.y = (opts.y) ? opts.y : (height / 2);
  
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

function StillZone (x, y, i, opts) {  
  this.fillStyle = '#44B8FC'; //this is one of the colors in the Magic Man's hatband (Adventure Time)
  this.moves = true;
  
  this.i = i; //identifier
  
  this.x = x;
  this.y = y;
  
  this.r = (opts.r) ? opts.r : STILLZONE_BASE_RADIUS;
  
  this.alive = true;
  
  this.destroy = function () {
    console.log('stillzone is now not alive');
    this.alive = false;
  };
  
  this.lifetimeID = setInterval(function () { 
    scenes[cur].entities.some(function (e, i, a) {
      if(e instanceof StillZone) {
        if (e.alive) {
          e.alive = false; 
          return true;
        }
        return false;
      }
    })
  }, 3000);
  
  this.move = function () {
     if(this.r < STILLZONE_BASE_RADIUS*BLOCK_WIDTH) this.r++;
    return;
  };
  
  this.render = function () {
     ctx.beginPath();
     ctx.fillStyle = this.fillStyle;
     ctx.arc(this.x*BLOCK_WIDTH, this.y*BLOCK_HEIGHT, this.r, 0, 2*Math.PI);
     ctx.fill();
     ctx.closePath();
  };
  
}




