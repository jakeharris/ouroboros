function TimeAttackSnakeScene() {
  SnakeScene.call(this);
  
  this.name = 'Time Attack - Snake';
  
  this.curscore = 0;
  this.score = 0;
  this.highscore = 0;
  
  this.maxTime = 30;
  this.timePassed = 0;
  
  this.timerHandler = function () {
    this.timePassed++;
  }.bind(this);
  
  this.init = function () {
    console.log(this.name + ' scene is starting...');
    document.addEventListener('keydown', this.handleEvent);
    this.initialized = true;
    console.log('I\'m initializing!');
    this.shopTimer = window.setTimeout(this.setUpShop, 5000);
    //this.arcadeTimeLooper = setInterval(this.timerHandler, 1000); 
    if(docCookies.hasItem('timeattackscore')) this.highscore = docCookies.getItem('timeattackscore');
  };
  
  this.test = function () {
    upgrades.push(Upgrades.GoldenPlumes); 
  }
  
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
    
    var minutes = (Math.floor((this.maxTime - this.timePassed) / 60)),
        seconds = ((this.maxTime - this.timePassed) - Math.floor((this.maxTime - this.timePassed) / 60)*60);
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.textAlign = 'left';
    ctx.fillText('Total: ' + this.score, width - BLOCK_WIDTH, height/20);
    ctx.fillText('High score: ' + this.highscore, BLOCK_WIDTH, height/20);
    //ctx.fillText('' + minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds), width/2, height/20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#282828';
    
    
    if(this.shop.x !== undefined && this.shop.y !== undefined) {
      ctx.beginPath();
      ctx.fillStyle = '#ffe584';
      if(this.shop.horizontal) {
        ctx.fillRect(this.shop.x * BLOCK_WIDTH, this.shop.y * BLOCK_HEIGHT, 3 * BLOCK_WIDTH, BLOCK_HEIGHT); 
      } else {
        ctx.fillRect(this.shop.x * BLOCK_WIDTH, this.shop.y * BLOCK_HEIGHT, BLOCK_WIDTH, 3 * BLOCK_HEIGHT); 
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#282828';
    }
  };
  
  this.end = function () {
    this.initialized = false;
    console.log(this.name + ' scene is ending...');
    document.removeEventListener('keydown', this.handleEvent);
    this.respawn();
    scenes[TimeAttackScenes.GAMEOVER].score = this.score;
    cur = (this.timeIsUp()) ? TimeAttackScenes.GAMEOVER : TimeAttackScenes.SHOP;
    clearInterval(this.arcadeTimeLooper);
  };
  this.pause = function () {
    console.log(this.name + ' scene is pausing...');
    console.log('WE MIGHT ONLY USE THIS PATTERN FOR SNAKE -> SHOP SCENE TRANSITION');
    document.removeEventListener('keydown', this.handleEvent);
    clearInterval(this.arcadeTimeLooper);
    cur = TimeAttackScenes.SHOP;
  }; 
  this.unpause = function () {
    console.log(this.name + ' scene is unpausing...');
    document.addEventListener('keydown', this.handleEvent);
    this.arcadeTimeLooper = setInterval(this.timerHandler, 1000); 
  }
  
  this.timeIsUp = function () {
    return this.maxTime - this.timePassed <= 0;
  };
  
}