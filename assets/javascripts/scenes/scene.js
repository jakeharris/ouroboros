/* ======
 * SCENES
 * ======
 
   The different sections of the game.
   
   // variable list
   this.entities: list of all objects represented in the game.
   this.init: sets scene to initial conditions (i.e. at the beginning of the use of that scene). sets up the 
   this.logic: calculates changes according to input, etc.
   this.move: expresses the way the entities in the scene are preferred (or not) in move order. the default is to loop through entities[] and call each entity's move().
   this.render: expresses the way entities in the scene are preferred in render order. same as above.
   this.end: sets scene to final conditions and uninitializes
 */


function Scene(name, DEFAULT_ENTITIES, handleEvent) {
  'use strict';
  
  if(typeof name === 'undefined') throw new SceneInitializationException('Scene initialization failed. No valid name supplied.');
  if(typeof DEFAULT_ENTITIES === 'undefined') throw new SceneInitializationException('Scene ' + name + ' initialization failed. No valid DEFAULT_ENTITIES supplied.');
  if(typeof handleEvent !== 'function') throw new SceneInitializationException('Scene ' + name + ' initialization failed. No valid keyHandler supplied.');
  
  this.DEFAULT_ENTITIES = DEFAULT_ENTITIES; //overwrite this
  this.handleEvent = handleEvent; //overwrite this
  
  this.name = name; //overwrite this
  this.initialized = false;
  this.entities = cloneArray(DEFAULT_ENTITIES); //overwrite this
  
  this.init = function () {
    console.log(name + ' scene is starting...');
    document.addEventListener('keydown', this.handleEvent);
    this.initialized = true;
  };
  this.logic = function () {
    if(!this.initialized) this.init();
    if(!this.entities) this.entities = cloneArray(DEFAULT_ENTITIES);
    return this.move();
  };
  this.move = function () {
    if(!this.entities) throw new EntityInitializationException(this.name + ': move() function didn\'t get an entity set.');
    this.entities.forEach(function (e, i, a) {
      e.move();
    });
  };
  this.render = function () {
    if(!this.entities) return;
    this.entities.forEach(function (e, i, a) {
      e.render();
    });
  };
  this.end = function () {
    this.initialized = false;
    console.log(name + ' scene is ending...');
    document.removeEventListener('keydown', this.handleEvent);
    this.entities = cloneArray(DEFAULT_ENTITIES);
  };
  
};