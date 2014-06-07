function StartScene() {
  
  var name = 'Start';
  var DEFAULT_ENTITIES = [
      new Text({ type: 'Title', text: 'OUROBOROS' }),
      new Text({ type: 'MenuItem', text: 'Press any key to start', y: height/2 + BLOCK_HEIGHT})
      /*
      x: width/2 - 130 + BLOCK_WIDTH
      , x: width/2 - 130 + BLOCK_WIDTH, y: height/2 + BLOCK_HEIGHT 
      new Menu([
          new Text({ type: 'MenuItem', text: 'New Game (coming soon!)' }),
          new Text({ type: 'MenuItem', text: 'Continue (coming soon!)', fillStyle: (docCookies.hasItem('save') && docCookies.hasItem('game')) ? '#282828' : '#aaa' }),
          new Text({ type: 'MenuItem', text: 'Time Attack' })
      ], { x: vpwidth()/2 - 185, y: vpheight()/2 })*/
  ];
  var handleEvent = function (e) {
    scenes[0].initialized = false;
    cur = TimeAttackScenes.SNAKE;
    document.removeEventListener('keydown', this.handleEvent);
    /*var d = scenes[0].entities[0].direction,
        key = e.which;
    
    if      (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13') {
      switch(scenes[0].entities[1].cursor.i){ 
          case StartSceneMenuOptions.TIMEATTACK:
            scenes[0].initialized = false;
            cur = TimeAttackScenes.SNAKE;
            document.removeEventListener('keydown', this.handleEvent);
            return;
          case 0:
          case 1:
          default:
            break;
      }
    }
    inputs.push(d);*/
  }.bind(this);
  
  Scene.call(this, name, DEFAULT_ENTITIES, handleEvent);
  
}
