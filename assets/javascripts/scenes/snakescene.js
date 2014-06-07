function SnakeScene () {
  var name = "Snake";
  var DEFAULT_ENTITIES = [ new Snake({ size: SNAKE_BASE_SIZE }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
  var handleEvent = function (e) {
    var d = scenes[TimeAttackScenes.SNAKE].entities[0].direction,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '32' && hasUpgrade(Upgrades.StillAir)) scenes[TimeAttackScenes.SNAKE].spawnStillZone(); 
    else if (key == '27' || key == '80') pause();
    else if (key == '81' && paused) {
      scenes[TimeAttackScenes.SNAKE].end();
      pause();
      cur = TimeAttackScenes.MAINMENU;
    }
    inputs.push(d);
  }.bind(this);
  
  Scene.call(this, name, DEFAULT_ENTITIES, handleEvent);
  
  this.inStillAir = false;
  this.arcadeTimerLooper = 0;
  this.slowTimeLooper = null;
  this.shopTimer = null;
  this.shop = {
    x: undefined,
    y: undefined,
    horizontal: false
  }
/* =================
 * SNAKE - OVERRIDES
 * =================
 
   Overrides of Scene class functions.
 
 */
  
  this.logic = function () {
        if(!this.initialized) this.init();
        if(!this.entities) this.entities = cloneArray(DEFAULT_ENTITIES);
    
        if(hasUpgrade(Upgrades.Aerobody)) this.aerobody();
        if(this.entities.length > 2) this.stillair();
        else if (this.inStillAir) {
            this.inStillAir = false;
            this.slowTimeLooper = null;
        }
    
        if(this.score >= this.maxScore) {
          this.score = this.maxScore; //just in case someone cheated!
          return this.end();
        }
    
        if(this.atWorldsEnd()) {
          if(this.atShopEntrance()) return this.enterShop();
          else if(hasUpgrade(Upgrades.GoldenPlumes)) return this.move();
          else {
            this.end();
            this.respawn();
            cur = TimeAttackScenes.GAMEOVER;
          }
        }
    
        if(this.bitingSelf()) { console.log('BITING SELF IS MUCH PROBLEM'); this.respawn(); this.end(); cur = TimeAttackScenes.GAMEOVER; }
        if(this.eatingEgg()) return this.eatEgg();
        if(this.name === 'Time Attack - Snake' && this.timeIsUp()) return this.end();
    
        return this.move();
  };
  this.render = function () {
        if(!this.entities) return;
    
    
        /* Draw any still airs first, since they're further back */
        if(this.entities.length > 1) {
          this.entities.forEach(function (e, i, a) {  
            if(i <= 1) return;
            e.render();
          });
        };
        
        /* Draw the snake, then the egg, so the egg is always visible, and the snake is always visible above the still airs. */
        this.entities[0].render();
        this.entities[1].render();
    
  };
  this.move = function () {
      if (!this.entities) throw new EntityInitializationException(this.name + ': move() function didn\'t get an entity set.');
      this.entities.forEach(function (e, i, a) {
          e.move();
      });
  };
  this.end = function () {
    this.initialized = false;
    console.log(this.name + ' scene is ending...');
    document.removeEventListener('keydown', this.handleEvent);
    cur = TimeAttackScenes.SHOP;
  };
  this.pause = function () {
    console.log(this.name + ' scene is pausing...');
    console.log('WE MIGHT ONLY USE THIS PATTERN FOR SNAKE -> SHOP SCENE TRANSITION');
    document.removeEventListener('keydown', this.handleEvent);
    cur = TimeAttackScenes.SHOP;
  }; 
  this.unpause = function () {
    console.log(this.name + ' scene is unpausing...');
    document.addEventListener('keydown', this.handleEvent);
  }
  this.setUpShop = function () {
    var side = Math.floor(Math.random() * 4);
    //TOP, RIGHT, BOTTOM, LEFT : 0, 1, 2, 3
    switch(side){
      case 0:
        scenes[cur].shop.x = Math.floor(Math.random() * (width/BLOCK_WIDTH - 5 + 1)) + 2;
        scenes[cur].shop.y = 0;
        scenes[cur].shop.horizontal = true;
        return true;
      case 1:
        scenes[cur].shop.x = width/BLOCK_WIDTH + 1;
        scenes[cur].shop.y = Math.floor(Math.random() * (height/BLOCK_WIDTH - 5 + 1)) + 2;
        scenes[cur].shop.horizontal = false;
        return true;
      case 2:
        scenes[cur].shop.x = Math.floor(Math.random() * (width/BLOCK_WIDTH - 5 + 1)) + 2;
        scenes[cur].shop.y = height/BLOCK_WIDTH + 1;
        scenes[cur].shop.horizontal = true;
        return true;
      case 3:
        scenes[cur].shop.x = 0;
        scenes[cur].shop.y = Math.floor(Math.random() * (height/BLOCK_WIDTH - 5 + 1)) + 2;
        scenes[cur].shop.horizontal = false;
        return true;
      default:
        scenes[cur].shop.x = 0; this.shop.y = 0; this.shop.horizontal = false;
        console.log('Error setting up shop (snakescene.js, 135). Value of side: ' + side);
        return false;
    }
    return false;
  };
  this.takeDownShop = function () {
     scenes[cur].shop.x = scenes[cur].shop.y = undefined;
  }
  
/* ==============
 * SNAKE - EVENTS
 * ==============
 
   Common game events. 
   
 */

  this.atWorldsEnd = function () {
        var snakeHead;
        
        if(!this.entities) return false;
        if(this.entities == undefined) return false;
        if(!(snakeHead = this.entities[0].blocks[0]))return false;
          
        if(snakeHead.x < 1
           ||
           snakeHead.y < 1
           ||
           snakeHead.x > width/BLOCK_WIDTH 
           ||
           snakeHead.y > height/BLOCK_WIDTH)
              return true;
        
        return false;
      };
  this.atShopEntrance = function () {
        var snakeHead;
        
        if(!this.entities) return false;
        if(this.entities == undefined) return false;
        if(!(snakeHead = this.entities[0].blocks[0]))return false;
    
        if(this.shop.horizontal
        && snakeHead.x     >= this.shop.x
        && snakeHead.x - 2 <= this.shop.x
        && snakeHead.y     == this.shop.y) return true;
    
        else if(!this.shop.horizontal
        && snakeHead.y     >= this.shop.y
        && snakeHead.y - 2 <= this.shop.y
        && snakeHead.x     == this.shop.x) return true;
    
        else return false;
        
           
  };
  this.bitingSelf = function () {
        if(!this.entities) return false;
        if(!this.entities[0].blocks[0]) return false;
      
        if(hasUpgrade(Upgrades.Aerobody)) {
          var head,
              ret = false;
          
          this.entities[0].blocks.some(function (e, i, a) {
            if(!head) { head = e; }
            else if(e.hasOwnProperty('isTransparent') && e.isTransparent) { }
            else if(Math.sqrt(Math.pow(head.x - e.x, 2) + Math.pow(head.y - e.y, 2)) < 1) return (ret = true);
          });
          
          if(ret) return ret;
          
          
          head = 0;
          var ix;
          for(ix = 0; ix < this.entities[0].blocks.length; ix++){
            if(head) break;
            // if the last block was transparent, but this one isn't, count it as the second head
            if(this.entities[0].blocks[ix-1] && this.entities[0].blocks[ix-1].isTransparent && !this.entities[0].blocks[ix].isTransparent) {
              head = this.entities[0].blocks[ix];
              break;
            }
          }
          
          this.entities[0].blocks.some(function (e, i, a) {
            if(ix == i) { }
            else if(!head) { head = e; }
            else if(e.hasOwnProperty('isTransparent') && e.isTransparent) { }
            else if(Math.sqrt(Math.pow(head.x - e.x, 2) + Math.pow(head.y - e.y, 2)) < 1) { return (ret = true); }
          });
          return ret;
        }
    
        var head,
            ret = false;
        this.entities[0].blocks.some(function (e, i, a) {
          if(!head) { head = e; }
          else if(e.hasOwnProperty('isTransparent') && e.isTransparent) { }
          else if(head.x == e.x && head.y == e.y) {
            return (ret = true);
          }
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
        return false; 
  }

/* ===============
 * SNAKE - ACTIONS
 * ===============
 
   Common game actions. 
   
 */




this.respawn = function () {
        if(!this.entities) return false;
        this.entities[0] = new Snake({ size: SNAKE_BASE_SIZE });
        this.entities[1] = new Block({ moves: false, fillStyle: '#CC3A09' });
        if(this.highscore < this.score) { this.highscore = this.score; docCookies.setItem('timeattackscore', this.highscore); }
        this.curscore = 0;
      };

this.eatEgg = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return respawn();
        this.entities[1] =  new Block ({ fillStyle: '#CC3A09' }) ;
        this.growSnake();
        if(++this.score > this.highscore) {
          this.highscore = this.score;
          docCookies.setItem('timeattackscore', this.highscore);
        } 
        if(this.name === 'Time Attack - Snake') this.maxTime += 3;
        this.curscore++;
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
  
  this.enterShop = function () {
        if(paused) pause();
        scenes[TimeAttackScenes.SNAKE].pause();
        cur = TimeAttackScenes.SHOP;
  };
  this.exitShop = function () {
        var tx = (this.shop.horizontal || this.shop.x == 0) ?
                  this.shop.x + 1
                : this.shop.x - 1
          , ty = (!this.shop.horizontal || this.shop.y == 0) ?
                  this.shop.y + 1
                : this.shop.y - 1
          , score = this.score;
    
    
        this.entities[0] = new Snake ( 
          { 
            loops: SNAKE_BASE_LOOPS_TO_MOVE * Math.pow(0.95, score)
          , size: SNAKE_BASE_SIZE + score 
          },
          {
            x: tx
          , y: ty
          , direction: getDirectionFromWallProximity(new Block( { x: tx, y: ty })) 
          , moves: true
          }
        );
        setTimeout(this.takeDownShop, 1000);
        setTimeout(this.setUpShop, 11000);
  };
  
  this.spawnStillZone = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return false;
        if(!this.entities[1]) return false;
    
        upgrades.splice(upgrades.indexOf(Upgrades.StillAir), 1);
        this.entities.push(new StillZone(this.entities[0].blocks[0].x + 1 / 2, this.entities[0].blocks[0].y + 1 / 2, this.entities.length, { }))
  };
  
  this.aerobody = function () {
       this.entities[0].blocks.forEach(function (e, i, a) {
         if(i > (this.entities[0].blocks.length - 1)/4 && i < (this.entities[0].blocks.length - 1)*3/4)
           e.isTransparent = true;
         else e.isTransparent = false;
       }, this);
  };
  
  this.stillair = function () {
        this.isSlowMo();
        this.slowMoTimerSetup();
  };

  this.isSlowMo = function () {
        var entitiesToRemove = [];


        for(var i = 0; i < this.entities.length; i++) {
          if(this.entities[i].hasOwnProperty('alive')) {

            if (!this.entities[i].alive) { entitiesToRemove.push(i); }

            var e = this.entities[i],
                a = this.entities;
            //FIXME
            this.inStillAir = (Math.sqrt(Math.pow(e.x - a[0].blocks[0].x, 2) + Math.pow(e.y - a[0].blocks[0].y, 2)) < (e.r / BLOCK_WIDTH));
          }
        }

        for(var i = entitiesToRemove.length - 1; i >= 0; i--) {
          clearInterval(this.entities[entitiesToRemove[i]].lifetimeID);
          this.entities.splice(entitiesToRemove[i], 1);
        }

  };    
  this.slowMoTimerSetup = function () {
        if(this.inStillAir && this.arcadeTimeLooper != null) { 
          if(this.name === 'Time Attack - Snake') { // not sure if want
            clearInterval(this.arcadeTimeLooper); 
            this.arcadeTimeLooper = null
            this.slowTimeLooper = setInterval(this.timerHandler, 3000);
            this.timerHandler();
          }
        }
        else if (!this.inStillAir && this.arcadeTimeLooper == null) { 
          if(this.name === 'Time Attack - Snake') {
            clearInterval(this.slowTimeLooper);
            this.slowTimeLooper = null;
            this.arcadeTimeLooper = setInterval(this.timerHandler, 1000); 
          }
        }
  };
}
/* ARCADE MODE STUFF - SNAKESCENE

this.isArcadeMode = true; // NOT GONNA ALWAYS BE TRUE IN THE FUTURE
  this.score = 0;
  this.highscore = 0;
  this.maxScore = 50;
  arcadeTimeLimit = ARCADE_TIMER_STARTING_MAX;
  

  
  this.arcadeModeTimerHandler = arcadeModeTimerHandler;
  
  this.init = function () {
    document.addEventListener('keydown', keyHandler);
    if(this.isArcadeMode) {
      if(docCookies.hasItem('timeattackscore')) { /* high score on the screen = timeattackscore *//* }
      arcadeTimeLooper = setInterval(arcadeModeTimerHandler, 1000); 
    }
    this.initialized = true;
  }
  
  
  in this.logic...
        if(this.isArcadeMode && this.timeIsUp()) return this.end();
        
        
  this.end = function () {
    document.removeEventListener('keydown', keyHandler);
    if(this.isArcadeMode) {
      clearInterval(arcadeTimeLooper);
    }
    this.entities = DEFAULT_ENTITIES;
    /* 
       if(this.highscore < score) { this.highscore = score; highscore = this.highscore; } 
       ==== 
       if (the high score on screen is less than the current total score) the high score = total 
     *//*
    this.score = 0;
    this.initialized = false;
    
  };
*/
