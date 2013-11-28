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
    else if (key == '27' || key == '80') pause();
    else if (key == '81' && paused) {
      scenes[TimeAttackScenes.SNAKE].end();
      pause();
    }
    inputs.push(d);
  }.bind(this);
  
  Scene.call(this, name, DEFAULT_ENTITIES, handleEvent);
  
  this.logic = function () {
        if(!this.initialized) this.init();
        if(!this.entities) this.entities = cloneArray(DEFAULT_ENTITIES);
    
        if(hasUpgrade(Upgrades.Aerobody)) this.aerobody();
        if(this.entities.length > 2) this.stillair();      
    
        if(this.score >= this.maxScore) {
          this.score = this.maxScore; //just in case someone cheated!
          return this.end();
        }
        if(this.atWorldsEnd()) {
          if(hasUpgrade(Upgrades.GoldenPlumes)) return this.move();
          return this.end();
        }
        if(this.bitingSelf()) return this.end();
        if(this.eatingEgg()) return this.eggSpawn();
        return this.move();
  };
  this.move = function () {
        if(!this.entities) return false;
        this.entities.forEach(function (e, i, a) {
          if(e.moves) e.move();
        });
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
    
        ctx.fillStyle = '#282828';
        ctx.beginPath();
        ctx.fillText('This life: ' + this.score, c.width/20, c.height/10);
        ctx.fillText('Total: ' + score, c.width/20, c.height/20);
        ctx.fillText('High score: ' + this.highscore, c.width/20, c.height*3/20);
        if(this.isArcadeMode) {
          var minutes = (Math.floor((arcadeTimeLimit - arcadeTimer) / 60)),
              seconds = ((arcadeTimeLimit - arcadeTimer) - Math.floor((arcadeTimeLimit - arcadeTimer) / 60)*60);
          ctx.fillText('' + minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds), c.width/2, c.height/20);
        }
        ctx.closePath();
        ctx.fill();
  };  
  this.end = function () {
    this.initialized = false;
    document.removeEventListener('keydown', this.handleEvent);
    this.entities = cloneArray(DEFAULT_ENTITIES);
    console.log('biting self after reset? ' + this.bitingSelf());
    cur = TimeAttackScenes.SHOP;
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
    return arcadeTimeLimit - arcadeTimer < 0;
  }
/* ===============
 * SNAKE - ACTIONS
 * ===============
 
   Common game actions. 
   
 */




this.respawn = function () {
        if(!this.entities) return false;
        this.entities = cloneArray(DEFAULT_ENTITIES);
        //if(this.highscore < score) this.highscore = score;
        score = 0;
      };

this.eggSpawn = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return respawn();
        this.entities[1] =  new Block ({ fillStyle: '#CC3A09' }) ;
        this.growSnake();
        if(this.isArcadeMode) {
          if(++score > this.highscore) this.highscore = score;
          arcadeTimeLimit += 3;
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
  
  this.spawnStillZone = function () {
        if(!this.entities) return false;
        if(!this.entities[0]) return false;
        if(!this.entities[1]) return false;
    
        upgrades.splice(upgrades.indexOf(Upgrades.StillAir), 1);
        this.entities.push(new StillZone(this.entities[0].blocks[0].x, this.entities[0].blocks[0].y, { }))
  };
  
  
}
/* ARCADE MODE STUFF - SNAKESCENE

this.isArcadeMode = true; // NOT GONNA ALWAYS BE TRUE IN THE FUTURE
  this.score = 0;
  this.highscore = 0;
  this.maxScore = 50;
  this.slowMo = false;
  this.slowMoTimerActive = false;
  arcadeTimeLimit = ARCADE_TIMER_STARTING_MAX;
  
  var arcadeModeTimerHandler = function () {
        arcadeTimer++;
  };
  var slowMoHandler = function () {
        scenes[TimeAttackScenes.SNAKE].entities.forEach(function (e, i, a) {
            if(i < 2) return;
            if(!e.hasOwnProperty('lifeTime') || !e.hasOwnProperty('duration')) return;
            e.lifeTime++;
        }, this);
  }
  
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
    cur = (this.timeIsUp()) ? TimeAttackScenes.GAMEOVER : TimeAttackScenes.SHOP;
  };
*/

/* STILL AIR STUFF - SNAKESCENE 

        this.stillair = function () {
          this.isSlowMo();
          this.slowMoTimerSetup();
        }
    
        this.isSlowMo = function () {
          if(this.entities.length > 2) { 
            this.entities.forEach(function (e, i, a) {
              if(i < 2) return;
              if(!e.hasOwnProperty('lifeTime') || !e.hasOwnProperty('duration')) return;
              if(e.lifeTime >= e.duration) { a.splice(i, 1); return; }
              
              if (this.slowMo && i > 2) { return; }
              
              this.slowMo = (Math.sqrt(Math.pow(e.x - a[0].blocks[0].x, 2) + Math.pow(e.y - a[0].blocks[0].y, 2)) < Math.sqrt(e.r / BLOCK_WIDTH))
            }, this);
          } else this.slowMo = false;
        }       
        this.slowMoTimerSetup = function () {
          if(this.slowMo && !this.slowMoTimerActive) { 
            clearInterval(arcadeTimeLooper); 
            arcadeTimeLooper = setInterval(arcadeModeTimerHandler, 3000);
            slowMoLooper = setInterval(slowMoHandler, 1000);
            slowMoHandler();
            this.slowMoTimerActive = true; 
          }
          else if (!this.slowMo && this.slowMoTimerActive) { 
            clearInterval(arcadeTimeLooper); 
            arcadeTimeLooper = setInterval(arcadeModeTimerHandler, 1000); 
            clearInterval(slowMoLooper);
            this.slowMoTimerActive = false;
          }
        };
        
*/

/* AEROBODY STUFF - SNAKESCENE
  this.aerobody = function () {
   this.entities[0].blocks.forEach(function (e, i, a) {
     if(i > (this.entities[0].blocks.length - 1)/4 && i < (this.entities[0].blocks.length - 1)*3/4)
       e.isTransparent = true;
     else e.isTransparent = false;
   }, this);
  }
*/