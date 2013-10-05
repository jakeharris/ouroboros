/* ======
 * SCENES
 * ======
 
   The different sections of the game.
 
 */

function StartScene(opts) {
    "use strict";
    this.name = "Start Menu";
    this.initialized = false;
    this.entities = opts.entities || [
        new Text({ type: 'Title', text: 'OUROBOROS' }),
        new Menu([
            new Text({ type: 'MenuItem', text: 'New Game (coming soon!)' }),
            new Text({ type: 'MenuItem', text: 'Continue (coming soon!)' }),
            new Text({ type: 'MenuItem', text: 'Arcade Mode' })
        ],
            { }
                )
    ];
    this.init = function () {
        document.addEventListener('keydown', keyHandler);
        this.initialized = true;
    };
  
    this.logic = (opts.logic) ? opts.logic : function () {
        if (!this.initialized) this.init();
        if (!this.entities) {
          this.entities = [ 
                            new Text({ type: 'Title', text: 'OUROBOROS' }), 
                            new Menu([
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
  };
  
  var keyHandler = function (e) {
    var d = scenes[cur].entities[0].direction,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13') {
      switch(scenes[cur].entities[1].cursor.i){ 
          case 2:
            cur++;
            document.removeEventListener('keydown', keyHandler);
            return;
          case 0:
          case 1:
          default:
            break;
      }
    }
    inputs.push(d);
  }
}



















function SnakeScene (opts) {
  this.name = "Snake";
  this.initialized = false;
  this.id = (opts.id) ? opts.id : 0;
  this.isArcadeMode = true; // NOT GONNA ALWAYS BE TRUE IN THE FUTURE
  this.score = (opts.score) ? opts.score : 0;
  this.maxScore = (opts.score) ? opts.score : 50;
  this.entities = (opts.entities) ? opts.entities : [ new Snake({ size: 20 }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
  arcadeTimeLimit = ARCADE_TIMER_STARTING_MAX;
  
  this.init = function () {
    document.addEventListener('keydown', keyHandler);
    if(this.isArcadeMode) {
      arcadeTimeLooper = setInterval(function () { arcadeTimer++; }, 1000); 
    }
    this.initialized = true;
  }
  
  this.logic = (opts.logic) ? opts.logic : function () {
        if(!this.initialized) this.init();
        if(!this.entities) {
          this.entities = [ new Snake({ }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
          return;
        }
    
        if(this.score >= this.maxScore) {
          this.score = this.maxScore; //just in case someone cheated!
          return this.end();
        }
        if(this.atWorldsEnd()) {
          if(hasUpgrade(Upgrades.GoldenPlumes)) return this.move();
          return this.end();
        }
        if(this.isArcadeMode && this.timeIsUp()) return this.end();
        if(this.bitingSelf()) return this.end();
        if(this.eatingEgg()) return this.eggSpawn();
        return this.move();
  };

  this.loopMove = function () {
    
  };
  
  this.end = function () {
    document.removeEventListener('keydown', keyHandler);
    if(this.isArcadeMode) arcadeTimeLooper = clearInterval(arcadeTimeLooper);
    this.entities = (opts.entities) ? opts.entities : [ new Snake({ size: 20 }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
    this.score = 0;
    this.initialized = false;
    cur++;
  };
  
  this.render = (opts.render) ? opts.render : function () {
        if(!this.entities) return;
    
        this.entities.forEach(function (e, i, a) {  
          e.render();
        });
        
        ctx.fillStyle = '#282828';
        ctx.beginPath();
        ctx.fillText('This life: ' + this.score, c.width/20, c.height/10);
        ctx.fillText('Total: ' + score, c.width/20, c.height/20);
        if(this.isArcadeMode) {
          var minutes = (Math.floor((arcadeTimeLimit - arcadeTimer) / 60)),
              seconds = ((arcadeTimeLimit - arcadeTimer) - Math.floor((arcadeTimeLimit - arcadeTimer) / 60)*60);
          ctx.fillText('' + minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds), c.width/2, c.height/20);
        }
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
  this.timeIsUp = function () {
    return arcadeTimeLimit - arcadeTimer < 0;
  }
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
        if(this.isArcadeMode) {
          score++;
        } 
        this.score++;
        this.entities[0].loopsToMove = (this.entities[0].loopsToMove)*0.95 //used to be //entities[0].loops_to_move--;
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
  this.name = "Yopico Shop";
  this.initialized = false;
  this.walletUpdated = true;
  this.spent = (opts.spent !== undefined) ? opts.spent : 0;
  this.entities = [ 
                    new Text( { type: "Title", text: this.name, y: vpheight()/20 } ),
                    new Menu( [
                                new ShopItem( { 
                                  text: Upgrades.SmoothUnderbelly.name, 
                                  val: Upgrades.SmoothUnderbelly.price, 
                                  flavorText: Upgrades.SmoothUnderbelly.flavorText,
                                  id: Upgrades.SmoothUnderbelly.id
                                } ), // smooth underbelly (gives faster start)
                                new ShopItem( { 
                                  text: Upgrades.StillAir.name, 
                                  val: Upgrades.StillAir.price, 
                                  flavorText: Upgrades.StillAir.flavorText, 
                                  id: Upgrades.StillAir.id
                                } ), //gives 1 breeze (slows time)
                                new ShopItem( { 
                                  text: Upgrades.GoldenPlumes.name,
                                  val: Upgrades.GoldenPlumes.price, 
                                  flavorText: Upgrades.GoldenPlumes.flavorText, 
                                  id: Upgrades.GoldenPlumes.id
                                } ), //allows map-wrap
                                new ShopItem( { 
                                  text: Upgrades.Aerobody.name, 
                                  val: Upgrades.Aerobody.price, 
                                  flavorText: Upgrades.Aerobody.flavorText, 
                                  id: Upgrades.Aerobody.id
                                } ), //segments of unit collision avoidance in the body
                                new ShopItem( {
                                    text: Upgrades.TimeExtension.name,
                                    val: Upgrades.TimeExtension.price,
                                    flavorText: Upgrades.TimeExtension.flavorText,
                                    id: Upgrades.TimeExtension.id
                                } ), //+30s
                                new Text( { type: "MenuItem", text: "Exit shop", isQuitOption: true } )
                    ], { x: vpwidth() / 4,y: vpheight() / 5 } ),
                    new Text( { type: "Subtitle", text: "Eggs remaining: " + this.wallet, y: vpheight()/10 })
  ];
  
  this.init = function () {
    this.initialized = true; 
    this.walletUpdated = true;
    document.addEventListener('keydown', keyHandler);
  };
  
  this.render = function () {
    this.entities.forEach(function (e, i, a) {
      e.render();
    });
  };
  
  this.logic = function () {
    if(!this.initialized) this.init();
    if(!this.entities) {
      this.entities = [ 
                    new Text( { type: "Title", text: this.name, y: vpheight()/20 } ),
                    new Menu( [
                                new ShopItem( { 
                                  text: Upgrades.SmoothUnderbelly.name, 
                                  val: Upgrades.SmoothUnderbelly.price, 
                                  flavorText: Upgrades.SmoothUnderbelly.flavorText,
                                  id: Upgrades.SmoothUnderbelly.id
                                } ), // smooth underbelly (gives faster start)
                                new ShopItem( { 
                                  text: Upgrades.StillAir.name, 
                                  val: Upgrades.StillAir.price, 
                                  flavorText: Upgrades.StillAir.flavorText, 
                                  id: Upgrades.StillAir.id
                                } ), //gives 1 breeze (slows time)
                                new ShopItem( { 
                                  text: Upgrades.GoldenPlumes.name,
                                  val: Upgrades.GoldenPlumes.price, 
                                  flavorText: Upgrades.GoldenPlumes.flavorText, 
                                  id: Upgrades.GoldenPlumes.id
                                } ), //allows map-wrap
                                new ShopItem( { 
                                  text: Upgrades.Aerobody.name, 
                                  val: Upgrades.Aerobody.price, 
                                  flavorText: Upgrades.Aerobody.flavorText, 
                                  id: Upgrades.Aerobody.id
                                } ), //segments of unit collision avoidance in the body
                                new ShopItem( {
                                    text: Upgrades.TimeExtension.name,
                                    val: Upgrades.TimeExtension.price,
                                    flavorText: Upgrades.TimeExtension.flavorText,
                                    id: Upgrades.TimeExtension.id
                                } ), //+30s
                                new Text( { type: "MenuItem", text: "Exit shop" } )
                    ], { x: vpwidth() / 4,y: vpheight() / 5 } ),
                    new Text( { type: "Subtitle", text: "Eggs remaining: " + this.wallet, y: vpheight()/20 })
      ];
      return;
    }
    if(this.walletUpdated) {
      this.wallet = score - this.spent;
      this.entities[2].text = "Eggs remaining: " + this.wallet;
    }
    this.walletUpdated = false;
    return this.move();
  };
  
  this.move = function () {
    this.entities.forEach(function (e, i, a) {
      e.move();
    });
  };
  
  this.buy = function (i) {
    if(this.entities[1].items[i].soldOut) return false;
    console.log(this.entities[1].items[i]);
    for (var u in Upgrades) {
      if (!Upgrades.hasOwnProperty(u)) continue;
      if(Upgrades[u].id === this.entities[1].items[i].id) {
        upgrades.push(Upgrades[u]);
        if(Upgrades[u].isUnique) this.entities[1].items[i].soldOut = true;
        if(Upgrades[u] === Upgrades.TimeExtension) arcadeTimeLimit += 30;
      }
    }
    
    this.spent += this.entities[1].items[i].val;
    this.wallet -= this.entities[1].items[i].val;
    this.walletUpdated = true;
  }
  
  var keyHandler = function (e) {
    var d,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13'){
      if(scenes[cur].entities[1].cursor.i == scenes[cur].entities[1].items.length - 1) {
        scenes[cur].initialized = false;
        document.removeEventListener('keydown', keyHandler);
        cur--;
        return;
      }
      if(scenes[cur].entities[1].items[scenes[cur].entities[1].cursor.i].val <= scenes[cur].wallet ) {
         scenes[cur].buy(scenes[cur].entities[1].cursor.i);
      }
    }
    inputs.push(d);
  };
  
}