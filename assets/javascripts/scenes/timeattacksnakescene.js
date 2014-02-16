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
    this.arcadeTimeLooper = setInterval(this.timerHandler, 1000); 
    if(docCookies.hasItem('timeattackscore')) this.highscore = docCookies.getItem('timeattackscore');
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
    
    var minutes = (Math.floor((this.maxTime - this.timePassed) / 60)),
        seconds = ((this.maxTime - this.timePassed) - Math.floor((this.maxTime - this.timePassed) / 60)*60);
    
    ctx.fillStyle = '#282828';
    ctx.beginPath();
    ctx.fillText('Total: ' + this.score, width/20, height/20);
    ctx.fillText('This life: ' + this.curscore, width/20, height/10);
    ctx.fillText('High score: ' + this.highscore, width/20, height*3/20);
    ctx.fillText('' + minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds), width/2, height/20);
    ctx.closePath();
    ctx.fill();
  };
  
  this.end = function () {
    this.initialized = false;
    console.log(this.name + ' scene is ending...');
    document.removeEventListener('keydown', this.handleEvent);
    this.respawn();
    cur = (this.timeIsUp()) ? TimeAttackScenes.GAMEOVER : TimeAttackScenes.SHOP;
    clearInterval(this.arcadeTimeLooper);
  };
  
  this.timeIsUp = function () {
    return this.maxTime - this.timePassed <= 0;
  };
  
}