function SnakeScene () {
  var name = "Snake";
  var DEFAULT_ENTITIES = [ new Snake({ size: 20 }), new Block ({ moves: false, fillStyle: '#CC3A09' }) ];
  var handleEvent = function (e) {
    var d = scenes[TimeAttackScenes.SNAKE].entities[0].direction,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '32' && hasUpgrade(Upgrades.StillAir)) scenes[TimeAttackScenes.SNAKE].spawnStillZone(); 
    else if (key == '17') {
      scenes[TimeAttackScenes.SNAKE].pause();
      cur = TimeAttackScenes.SHOP;
    }
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
            clearInterval(this.slowTimeLooper);
            this.slowTimeLooper = null;
            this.arcadeTimeLooper = setInterval(this.timerHandler, 1000);
        }
    
        if(this.score >= this.maxScore) {
          this.score = this.maxScore; //just in case someone cheated!
          return this.end();
        }
        if(this.atWorldsEnd()) {
          if(hasUpgrade(Upgrades.GoldenPlumes)) return this.move();
          this.respawn();
          this.end();
          cur = TimeAttackScenes.GAMEOVER;
        }
        if(this.bitingSelf()) { this.respawn(); this.end(); cur = TimeAttackScenes.GAMEOVER; }
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
    document.addEventListener('keydown', this.handleEvent);
  }
  
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
           snakeHead.x > vpwidth()/BLOCK_WIDTH - 1
           ||
           snakeHead.y > vpheight()/BLOCK_WIDTH - 1)
              return true;
        
        return false;
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
    return false; 
  }

/* ===============
 * SNAKE - ACTIONS
 * ===============
 
   Common game actions. 
   
 */




this.respawn = function () {
        if(!this.entities) return false;
        this.entities[0] = new Snake({ size: 20 });
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
  
  this.spawnStillZone = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return false;
        if(!this.entities[1]) return false;
    
        upgrades.splice(upgrades.indexOf(Upgrades.StillAir), 1);
        this.entities.push(new StillZone(this.entities[0].blocks[0].x, this.entities[0].blocks[0].y, { }))
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
        
        this.inStillAir = (Math.sqrt(Math.pow(e.x - a[0].blocks[0].x, 2) + Math.pow(e.y - a[0].blocks[0].y, 2)) < Math.sqrt(e.r / BLOCK_WIDTH));
      }
    }
    for(var i = entitiesToRemove.length - 1; i >= 0; i--) {
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
