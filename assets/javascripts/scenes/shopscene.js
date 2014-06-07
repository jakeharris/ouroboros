function ShopScene (opts) {
  var name = 'Yopico Shop';
  var DEFAULT_ENTITIES = [ 
                    new Text( { type: 'Title', text: name, y: height/20 } ),
                    new Menu( [
                                new Text( {
                                  type: 'MenuItem',
                                  text: 'Consumables: ',
                                  isCursorable: false
                                } ),
                                /*new ShopItem( {
                                    text: Upgrades.TimeExtension.name,
                                    val: Upgrades.TimeExtension.price,
                                    flavorText: Upgrades.TimeExtension.flavorText,
                                    id: Upgrades.TimeExtension.id
                                } ), //+30s*/
                                new ShopItem( { 
                                  text: Upgrades.StillAir.name, 
                                  val: Upgrades.StillAir.price, 
                                  flavorText: Upgrades.StillAir.flavorText, 
                                  id: Upgrades.StillAir.id
                                } ), //gives 1 breeze (slows time)
                                new Text( {
                                  type: 'MenuItem',
                                  text: 'Upgrades: ',
                                  isCursorable: false
                                } ),
                                new ShopItem( { 
                                  text: Upgrades.SmoothUnderbelly.name, 
                                  val: Upgrades.SmoothUnderbelly.price, 
                                  flavorText: Upgrades.SmoothUnderbelly.flavorText,
                                  id: Upgrades.SmoothUnderbelly.id
                                } ), // smooth underbelly (gives faster start)
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
                                new Text( { type: 'MenuItem', text: 'Exit shop', isQuitOption: true } )
                    ], { x: width / 4, y: height / 5 } ),
                    new Text( { type: 'Subtitle', text: 'Eggs remaining: ' + this.wallet, y: height/10 })
  ];
  var handleEvent = function (e) {
    var d,
        key = e.which;
    
    if      (key == '37' && d != Direction.RIGHT) d = Direction.LEFT;
    else if (key == '38' && d != Direction.DOWN)  d = Direction.UP;
    else if (key == '39' && d != Direction.LEFT)  d = Direction.RIGHT;
    else if (key == '40' && d != Direction.UP)    d = Direction.DOWN;
    else if (key == '13'){
      if(scenes[TimeAttackScenes.SHOP].entities[1].cursor.i == scenes[TimeAttackScenes.SHOP].entities[1].items.length - 1) {
        scenes[TimeAttackScenes.SHOP].end();
        scenes[TimeAttackScenes.SNAKE].exitShop();
        scenes[TimeAttackScenes.SNAKE].unpause();
        cur = TimeAttackScenes.SNAKE;
        return;
      }
      if(scenes[TimeAttackScenes.SHOP].entities[1].items[scenes[TimeAttackScenes.SHOP].entities[1].cursor.i].val <= scenes[TimeAttackScenes.SHOP].wallet ) {
         scenes[TimeAttackScenes.SHOP].buy(scenes[TimeAttackScenes.SHOP].entities[1].cursor.i);
      }
    }
    inputs.push(d);
  }.bind(this);
  
  Scene.call(this, name, DEFAULT_ENTITIES, handleEvent);
  
  this.spent = (opts.spent !== undefined) ? opts.spent : 0;

  this.init = function () {
    console.log(name + ' scene is starting...');
    document.addEventListener('keydown', this.handleEvent);
    if(name === 'Snake') console.log(DEFAULT_ENTITIES);
    this.initialized = true;
    this.walletUpdated = true;
  };
  
  this.logic = function () {
    if(!this.initialized) this.init();
    if(!this.entities) {
      this.entities = cloneArray(DEFAULT_ENTITIES);
    }
    if(this.walletUpdated) {
      this.wallet = scenes[TimeAttackScenes.SNAKE].score - this.spent;
      this.entities[2].text = 'Eggs remaining: ' + this.wallet;
      this.walletUpdated = false;
    }
    this.entities[0].x = width / 2 - 100 + BLOCK_WIDTH;
    this.entities[1].x = width / 2 - 100 + BLOCK_WIDTH;
    this.entities[2].x = width / 2 - 100 + BLOCK_WIDTH;
    return this.move();
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
}
