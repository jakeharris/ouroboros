function TimeAttackEndScene (opts) {
  this.name = "Game Over";
  this.initialized = false;
  this.entities = [ 
                    new Text( { type: "Title", text: this.name, y: vpheight()/20 } ),
                    new Menu( [
                                new Text( { type: "MenuItem", text: "Retry" } ), 
                                new Text( { type: "MenuItem", text: "Quit" } )
                              ], 
                             { x: vpwidth() / 4,y: vpheight() / 5 } ),
                    new Text( { type: "Subtitle", text: "Score: " + score, y: vpheight()/10 })
      ];
  
  this.init = function () {
    this.initialized = true;
    docCookies.setItem('save', 'true');
    console.log(highscore);
    docCookies.setItem('timeattackscore', highscore);
    upgrades = [ ];
    //do things
    document.addEventListener('keydown', keyHandler);
  }
  this.logic = function () {
    if(!this.initialized) this.init();
    this.entities[2].text = "Score: " + score;
    return this.move();
  }
  this.render = function () {
    this.entities.forEach(function (e, i, a) {
      e.render();
    });
  }
  this.move = function () {
    this.entities.forEach(function (e, i, a) {
      e.move();
    });
  }
  var keyHandler = function (e) {
    var d,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13'){
      arcadeTimer = 0;
      arcadeTimeLimit = 30;
      score = 0;
      scenes[TimeAttackScenes.GAMEOVER].initialized = false;
      document.removeEventListener('keydown', keyHandler);
      switch(scenes[TimeAttackScenes.GAMEOVER].entities[1].cursor.i) {
        case 0:
          cur = TimeAttackScenes.SNAKE;
          break;
        case 1:
          cur = TimeAttackScenes.MAINMENU;
          break;
        default:
          break;
      }      
    }
    inputs.push(d);
  }
}