/*
 * ZuseAppEngine.js
 *
 * Author: Andrew Butterfield
 * Date: 12 Feb 2014
 *
 * Defines a class that represents an engine for a Zuse app
 */
function ZuseAppEngine (options)
{
  // reference to this scope
  var that = this;

  // App code
  this.code = options.project_json;
  this.compiled_code = options.compiled_code;
  this.sprites = {};

  // Interpreter
  this.interpreter = new Interpreter();
  this.interpreter.runJSON(this.compiled_code);
  this.loadMethodsIntoInterpreter();
  this.interpreter.propertyUpdateCallback = function (object_id, update) { that.interpreterObjectUpdatedProperty(object_id, update) };

  // jQuery canvas handle
  this.canvas = options.canvas;
  
  // Set canvas to game width/height TODO
  this.canvas.css( { width: "320px", height: "524px" } );
  this.canvas.attr("width", 320);
  this.canvas.attr("height", 524);

  // 2d context
  this.ctx = this.canvas[0].getContext("2d");

  // Event handling variables
  this.isMouseDown = false;
  this.currentObject = null;

  // request animation frame event id
  this.animationFrameId = null;
  this.timeoutId = null;

  this.lastStep = null;
  this.lastDraw = null;
  this.fps = 0;

  this.collision_groups = this.code.collision_groups;

  // Image assets
  this.images = {};
  this.image_count = this.getImageCount();
  this.loaded_image_count = 0;
  this.loadImages();
}

/*
 * Defines a delegate for the interpreter to call
 */
ZuseAppEngine.prototype.interpreterObjectUpdatedProperty = function (object_id, update)
{
  // Get sprite
  var s = this.sprites[object_id];

  // Determine property that got updated and set it on the sprite
  if ("x" in update)
  {
    s.setX(update.x);

    if (s.left() < 0)
      s.setX(s.cx + Math.abs(s.left()));
    else if (s.right() > this.canvas.innerWidth())
      s.setX(s.cx - (s.right() - this.canvas.innerWidth()));
  }
  else if ("y" in update)
  {
    s.setY(this.canvas.innerHeight() - update.y);

    if (s.top() < 0)
      s.setY(s.cy + Math.abs(s.top()));
    else if (s.bottom() > this.canvas.innerHeight())
      s.setY(s.cy - (s.bottom() - this.canvas.innerHeight()));
  }
  else if ("text" in update)
  {
    s.text = update.text;
  }
};

/*
 * Gets a count of the total number of distinct images
 * the sprites use
 */
ZuseAppEngine.prototype.getImageCount = function()
{
  var count = 0;
  var images = {};

  // For each sprite, determine if it has an image
  for (var i = 0; i < this.code.objects.length; i++)
  { 
    var obj = this.code.objects[i];

    if (!("image" in obj))
      continue;

    var path = obj.image.path;

    if (!(path in images))
    {
      images[path] = "";
      count++;
    }
  } 

  return count;
};

/*
 * Preloads the images for the sprites
 */
ZuseAppEngine.prototype.loadImages = function ()
{
  for (var i = 0; i < this.code.objects.length; i++)
  { 
    var obj = this.code.objects[i];

    if (!("image" in obj))
      continue;

    var path = obj.image.path;
    var that = this;

    if (!(path in this.images))
    {
      this.images[path] = new Image();
      this.images[path].onload = function (e) { that.imageLoadSuccess(e); };
      this.images[path].onerror = function (e) { that.imageLoadError(e); };
      this.images[path].src = "/images/" + path;
    }
  }
};

/*
 * Fires when an image is successfully loaded
 */
ZuseAppEngine.prototype.imageLoadSuccess = function (e)
{
  console.log("Image Loaded: " + e.currentTarget.src);
  this.loaded_image_count++;

  if (this.loaded_image_count == this.image_count)
  {
    this.registerMouseEventHandlers();
    this.loadSprites();
    this.start();
  }
};

/*
 * Throws an exception if there is an error loading the image
 */
ZuseAppEngine.prototype.imageLoadError = function (e)
{
  throw new Error("Image load error: " + e.currentTarget.src); 
};

/*
 * Kicks of the Zuse app by calling the start event on all objects
 */
ZuseAppEngine.prototype.start = function ()
{
  console.log("Zuse App Started");
  var that = this;

  this.animationFrameId = requestAnimationFrame(function (ts) { that.draw(ts); });
  this.timeoutId = setTimeout( function () { that.step(); }, 1000 / 60 );
  this.interpreter.triggerEvent("start");
};

/*
 * Driver for the calculation intensive parts of the physics engine
 */
ZuseAppEngine.prototype.step = function ()
{
  var that = this;
  this.timeoutId = setTimeout( function () { that.step(); }, 1000 / 60 );

  if (this.lastStep === null)
    this.lastStep = new Date().getTime();

  var now = new Date().getTime();
  var elapsed = now - this.lastStep;
  this.lastStep = now;
  this.detectSpriteCollision();
  this.boundSpriteByWorld();
  this.updateSpritePositions(elapsed);
};

/*
 * Creates all the mouse event handlers needed for mouse interaction with the 
 * canvas
 */
ZuseAppEngine.prototype.registerMouseEventHandlers = function ()
{
  // handle to object scope
  var that = this;

  $(document).on("mousedown", function (e){
    var id = null;
    
    if (e.target.nodeName !== "CANVAS")
      return;
    
    var x = e.pageX - e.target.offsetLeft - 1;
    var y = e.pageY - e.target.offsetTop - 1;
   
    that.mouseDown = true;
    if (id = that.hitObject(x, y))
    {
      that.currentObject = that.sprites[id];
      that.interpreter.triggerEventOnObjectWithParameters("touch_began", id, { touch_x: x, touch_y: that.canvas.innerHeight() - y });
    }
  });

  $(document).on("mousemove", function (e) {
    if (!that.mouseDown || that.currentObject == null)
      return;

    if (e.target.nodeName === "CANVAS")
    {
      var x = e.pageX - e.target.offsetLeft - 1;
      var y = e.pageY - e.target.offsetTop - 1;

      that.interpreter.triggerEventOnObjectWithParameters("touch_moved", that.currentObject.id, { touch_x: x, touch_y: that.canvas.innerHeight() - y });
    }

  });

  $(document).on("mouseup", function (e){
    that.mouseDown = false;
    that.currentObject = null;
    console.log("mouse up");
  });
  
};

/*
 * Loads the methods into the interpreter that it calls
 */
ZuseAppEngine.prototype.loadMethodsIntoInterpreter = function ()
{
  // Reference to this object's scope
  var that = this;
  var methods = {};

  // Move method
  methods.move = function (sprite_id, args)
  {
    that.applyVelocityToSprite(sprite_id, args[0], args[1]);
  }

  // Remove sprite method
  methods.remove = function (sprite_id, args)
  {
    that.removeSpriteFromWorld(sprite_id);
  }

  // Generate a sprite dynamically
  methods.generate = function (sprite_id, args)
  {
    that.generateFromGenerator(sprite_id, args[0], args[1], args[2])
  }

  for (var k in methods)
    this.interpreter.loadMethod(k, methods[k]);
};

/*
 * Puts a generated sprite into the world
 */
ZuseAppEngine.prototype.generateFromGenerator = function(sprite_id, gen_name, x, y)
{

}

/*
 * Applies a velocity to a sprite
 */
ZuseAppEngine.prototype.applyVelocityToSprite = function (sprite_id, direction, speed)
{
  var sprite = this.sprites[sprite_id];
  var rad = direction * Math.PI / 180;
  sprite.applyVelocity(Math.cos(rad) * speed, -Math.sin(rad) * speed);
};

/*
 * Removes a sprite from the world
 */
ZuseAppEngine.prototype.removeSpriteFromWorld = function(sprite_id)
{
  delete this.sprites[sprite_id];
  this.interpreter.removeObjectWithIdentifier(sprite_id);
}

/*
 * Loads all the sprites into the engine
 */
ZuseAppEngine.prototype.loadSprites = function ()
{
  for (var i = 0; i < this.code.objects.length; i++)
  { 
    var obj = this.code.objects[i];
    var options = {};

    options.id = obj.id;
    options.x = obj.properties.x;
    options.y = this.canvas.innerHeight() - obj.properties.y;
    options.width = obj.properties.width;
    options.height = obj.properties.height;
    options.physics_body = obj.physics_body;
    options.collision_group = obj.collision_group;
    options.type = obj.type;

    if (obj.type === "text")
    {
      options.text = obj.properties.text;
    }
    else if (obj.type === "image")
    {
      options.image = this.images[obj.image.path];
    }
    
    this.sprites[obj.id] = new Sprite(options);
  }
};

/*
 * Keeps the sprite within the world
 */
ZuseAppEngine.prototype.boundSpriteByWorld = function()
{
  for (var k in this.sprites)
  {
    var s = this.sprites[k];
    
    if (s.left() <= 0 && s.vx < 0)
      s.vx = s.vx * -1;

    if (s.right() >= this.canvas.attr("width") && s.vx > 0)
      s.vx = s.vx * -1;

    if (s.top() <= 0 && s.vy < 0)
      s.vy = s.vy * -1;
      
    if (s.bottom() >= this.canvas.attr("height") && s.vy > 0)
      s.vy = s.vy * -1;
  }
};

/*
 * Updates a sprite's position
 */
ZuseAppEngine.prototype.updateSpritePositions = function (dt)
{
  for (var k in this.sprites)
  {
    var s = this.sprites[k];
    var old_position = s.position();
    
    s.updatePosition(dt);

    if (this.isSpriteOutsideWorld(s))
      s.restorePosition(old_position);
  }
};

/*
 * The drawing aspect of the physics engine. Takes care of
 * drawing each frame
 */
ZuseAppEngine.prototype.draw = function (timestamp)
{
  var that = this;
  this.animationFrameId = requestAnimationFrame(function (ts) { that.draw(ts); });

  if (this.lastDraw === null)
    this.lastDraw = timestamp;

  var elapsed = timestamp - this.lastDraw;
  this.fps = 1000/elapsed;

  this.lastDraw = timestamp;

  this.clearCtx();

  for (var k in this.sprites)
  {
    var s = this.sprites[k];
       
    if (s.type === "image")
    {
      this.ctx.drawImage(s.image, s.x, s.y, s.width, s.height);
    }
    else if (s.type === "text")
    {
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = "30px Helvetica";

      this.ctx.fillText(s.text, s.cx, s.cy, s.width);

    }
  }

};

/*
 * Clears the graphics context
 */
ZuseAppEngine.prototype.clearCtx = function ()
{
  this.ctx.clearRect(0, 0, this.canvas.attr("width"), this.canvas.attr("height"));
};

/*
 * Determins whether sprites are colliding
 */
ZuseAppEngine.prototype.hitObject = function (x, y)
{
  var id = null;

  for (k in this.sprites)
  {
    var s = this.sprites[k];
    
    if (s.isHit(x,y))
    {
      id = k;
      break;
    }
  }
  
  return id;
};

/*
 * Gets the correct requestAnimatinoFrame object for the given browser
 */
ZuseAppEngine.prototype.setRequestAnimationFrameHandle = function ()
{
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                 window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
};

/*
 * Determines if sprites are colliding
 */
ZuseAppEngine.prototype.detectSpriteCollision = function ()
{
  var temp_sprites = {};

  for (var k in this.sprites)
  {
    if (this.sprites[k].collision_group in this.collision_groups)
      temp_sprites[k] = this.sprites[k];
  }

  for (var k in this.sprites)
  {
    if (!(this.sprites[k].collision_group in this.collision_groups))
      continue;

    var s = this.sprites[k];
    delete temp_sprites[k];

    for (var q in temp_sprites)
    {
      var cg = this.collision_groups[s.collision_group];

      if (cg.contains(temp_sprites[q].collision_group) && s.collidesWith(temp_sprites[q]))
      {
        s.resolveCollisionWith(temp_sprites[q]);
        this.interpreter.triggerEventOnObjectWithParameters("collision", s.id, { other_sprite: temp_sprites[q].id });
        this.interpreter.triggerEventOnObjectWithParameters("collision", temp_sprites[q].id, { other_sprite: s.id });
      }
    }
  }
};

/*
 * Determins if sprite is outside of the world
 */
ZuseAppEngine.prototype.isSpriteOutsideWorld = function (sprite)
{
  var pos = sprite.position;

  if (sprite.right() < 0 || sprite.left() > this.canvas.innerWidth() ||
      sprite.top() > this.canvas.innerHeight() || sprite.bottom() < 0)
    return true;

  return false;
};

