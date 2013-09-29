/* ======
 * SCENES
 * ======
 
   The different sections of the game.
 
 */

function StartScene (opts) {
  this.name = "Start Menu";
  this.entities = (opts.entities) ? opts.entities : [  
                                                      new Text({ type: 'Title', text: 'OUROBOROS' }), 
                                                      new Menu([
                                                                new Cursor({ }),
                                                                new Text({ type: 'MenuItem', text: 'New Game' }),
                                                                new Text({ type: 'MenuItem', text: 'Continue' }),
                                                                new Text({ type: 'MenuItem', text: 'Arcade Mode' })
                                                               ], 
                                                              { }
                                                              )
                                                    ];
  this.init = function () {
    document.addEventListener('keydown', keyHandler); 
  }
  
  this.logic = (opts.logic) ? opts.logic : function () {
        if(!this.entities) {
          this.entities = [ 
                            new Text({ type: 'Title', text: 'OUROBOROS' }), 
                            new Menu([
                              new Cursor({ }),
                              new Text({ type: 'MenuItem', text: 'New Game' }),
                              new Text({ type: 'MenuItem', text: 'Continue' }),
                              new Text({ type: 'MenuItem', text: 'Arcade Mode' })
                            ], { })
                          ];
          return;
        }
        return this.move();
      };
  
  this.move = (opts.move) ? opts.move : function () {
    if(!this.entities) return;
    
    this.entities.forEach(function (e, i, a) {
      e.move();
    });
  };
  
  this.render = (opts.render) ? opts.render : function () {
    if(!this.entities) return;
    
    this.entities.forEach(function (e, i, a) {
      e.render();
    });
  }
  var keyHandler = function (e) {
    var d = scenes[cur].entities[0].direction,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13') {
      cur++;
      document.removeEventListener('keydown', keyHandler);
    }
    
    inputs.push(d);
  }
  this.init();
}



















function SnakeScene (opts) {
  this.name = "Snake";
  this.entities = (opts.entities) ? opts.entities : [ new Snake({ size: 20 }, { }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
  
  this.init = function () {
    document.addEventListener('keydown', keyHandler); 
  }
  
  this.logic = (opts.logic) ? opts.logic : function () {
        if(!this.entities) {
          this.entities = [ new Snake({ }, { }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
          return;
        }
    
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
  
/* ==============
 * SNAKE - EVENTS
 * ==============
 
   Common game events. 
   
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
  
/* ===============
 * SNAKE - ACTIONS
 * ===============
 
   Common game actions. 
   
 */


this.move = function () {
        if(!this.entities) return false;
        this.entities.forEach(function (e, i, a) {
          if(e.moves) e.move();
        });
      };

this.respawn = function () {
        if(!this.entities) return false;
        this.entities = [ new Snake({ size: 20 }, { }) ];
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
  var keyHandler = function (e) {
    var d = scenes[cur].entities[0].direction,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '27' || key == '80') pause();
    
    inputs.push(d);
  };
  this.init();
}

function TransitionScene (opts, passables) {
  this.name = "Transition";
  this.passables = passables;
  
  this.logic = function () {
    
  };
  this.move = function () {
    
  };
  this.render = function () {
    
  };
}

function ShopScene (opts) {
  this.name = "Shop";
}