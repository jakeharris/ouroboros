function TimeAttackEndScene (opts) {
  var name = "Game Over";
  var DEFAULT_ENTITIES = [ 
                    new Text( { type: "Title", text: this.name, y: vpheight()/20 } ),
                    new Menu( [
                                new Text( { type: "MenuItem", text: "Retry" } ), 
                                new Text( { type: "MenuItem", text: "Quit" } )
                              ], 
                             { x: vpwidth() / 4,y: vpheight() / 5 } ),
                    new Text( { type: "Subtitle", text: "Score: " + 0, y: vpheight()/10 })
  ];
  var handleEvent = function (e) {
    var d,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13'){
      docCookies.setItem('save', 'true');
      console.log(scenes[TimeAttackScenes.SNAKE].highscore);
      docCookies.setItem('timeattackscore', scenes[TimeAttackScenes.SNAKE].highscore);
      upgrades = [ ];
      scenes[TimeAttackScenes.SNAKE].timePassed = 0;
      scenes[TimeAttackScenes.SNAKE].maxTime = ARCADE_TIMER_STARTING_MAX;
      scenes[TimeAttackScenes.SNAKE].score = 0;
      scenes[TimeAttackScenes.SHOP] = new ShopScene({});
      scenes[TimeAttackScenes.GAMEOVER].initialized = false;
      document.removeEventListener('keydown', this.handleEvent);
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
  }.bind(this);
  
  Scene.call(this, name, DEFAULT_ENTITIES, handleEvent);

  this.logic = function () {
    if(!this.initialized) this.init();
    this.entities[2].text = "Score: " + scenes[TimeAttackScenes.SNAKE].score;
    return this.move();
  };
  this.render = function () {
    this.entities.forEach(function (e, i, a) {
      e.render();
    });
  };
  this.move = function () {
    this.entities.forEach(function (e, i, a) {
      e.move();
    });
  };
  
}