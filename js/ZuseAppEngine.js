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
  this.code = options.code;
  this.sprites = {};

  // Interpreter
  var compiler = new Compiler( { project_json: this.code } );
  this.interpreter = compiler.getInterpreter();

  // jQuery canvas handle
  this.canvas = options.canvas;
  
  // Set canvas to game width/height TODO
  this.canvas.css( { width: "320px", height: "480px" } );
  this.canvas.attr("width", 320);
  this.canvas.attr("height", 480);

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

ZuseAppEngine.prototype.getImageCount = function()
{
  var count = 0;
  var images = {};

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
      this.images[path].src = "images/" + path;
    }
  }
};

ZuseAppEngine.prototype.imageLoadSuccess = function (e)
{
  console.log("Image Loaded: " + e.srcElement.src);
  this.loaded_image_count++;

  if (this.loaded_image_count == this.image_count)
  {
    this.registerMouseEventHandlers();
    this.loadSprites();
    this.start();
  }
};

ZuseAppEngine.prototype.imageLoadError = function (e)
{
  throw new Error("Image load error: " + e.srcElement.src); 
};

ZuseAppEngine.prototype.start = function ()
{
  console.log("Zuse App Started");
  var that = this;

  this.animationFrameId = requestAnimationFrame(function (ts) { that.draw(ts); });
  this.timeoutId = setTimeout( function () { that.step(); }, 1000 / 60 );
};

ZuseAppEngine.prototype.step = function ()
{
  var that = this;
  this.timeoutId = setTimeout( function () { that.step(); }, 1000 / 60 );

  if (this.lastStep === null)
    this.lastStep = new Date().getTime();

  var now = new Date().getTime();
  var elapsed = now - this.lastStep;
  this.lastStep = now;
  this.boundSpriteByWorld();
  this.detectSpriteCollision();
  this.updateSpritePositions(elapsed);
};

ZuseAppEngine.prototype.registerMouseEventHandlers = function ()
{
  // handle to object scope
  var that = this;

  $(document).on("mousedown", function (e){
    var id = null;
    
    if (e.target.nodeName !== "CANVAS")
      return;
    
    var x = e.clientX - e.target.offsetLeft - 1;
    var y = e.clientY - e.target.offsetTop - 1;
    
    if (id = that.hitObject(x, y))
    {
      that.mouseDown = true;
      that.currentObject = that.sprites[id];
      that.currentObject.vx = 100;
      that.currentObject.vy = -100;
      console.log(id, that.currentObject);
    }
  });

  $(document).on("mousemove", function (e){
  });

  $(document).on("mouseup", function (e){
    that.mouseDown = false;
    that.currentObject = null;
  });
};

ZuseAppEngine.prototype.loadMethodsIntoInterpreter = function ()
{
  // Reference to this object's scope
  var that = this;

  // Move method
  var move = function (sprite_id, args)
  { 
    that.applyVelocityToSprite(sprite_id, args[0], args[1]);
  }

};

ZuseAppEngine.prototype.applyVelocityToSprite = function (sprite_id, direction, speed)
{
  var sprite = this.sprites[sprite_id];
  sprite.applyVelocity(direction, speed);
};

ZuseAppEngine.prototype.loadSprites = function ()
{
  for (var i = 0; i < this.code.objects.length; i++)
  { 
    var obj = this.code.objects[i];
    var options = {};

    if (obj.type === "text")
    {
    }
    else if (obj.type === "image")
    {
      options.id = obj.id;
      options.x = obj.properties.x;
      options.y = this.canvas.innerHeight() - obj.properties.y;
      options.width = obj.properties.width;
      options.height = obj.properties.height;
      options.physics_body = obj.physics_body;
      options.collision_group = obj.collision_group;
      options.image = this.images[obj.image.path];

      this.sprites[obj.id] = new Sprite(options);
    }
  }
};

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
        
    this.ctx.drawImage(s.image, s.x, s.y, s.width, s.height);
  }

};

ZuseAppEngine.prototype.clearCtx = function ()
{
  this.ctx.clearRect(0, 0, this.canvas.attr("width"), this.canvas.attr("height"));
};

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

ZuseAppEngine.prototype.setRequestAnimationFrameHandle = function ()
{
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                 window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
};

ZuseAppEngine.prototype.detectSpriteCollision = function ()
{
  var temp_sprites = {};

  for (var k in this.sprites)
    temp_sprites[k] = this.sprites[k];

  for (var k in this.sprites)
  {
    var s = this.sprites[k];
    delete temp_sprites[k];

    for (var q in temp_sprites)
    {
      var cg = this.collision_groups[s.collision_group];

      if (cg.contains(temp_sprites[q].collision_group) && s.collidesWith(temp_sprites[q]))
      {
        s.handleCollisionWith(temp_sprites[q]);
        temp_sprites[q].handleCollisionWith(s);
      }
    }
  }
};

ZuseAppEngine.prototype.isSpriteOutsideWorld = function (sprite)
{
  var pos = sprite.position;

  if (sprite.right() < 0 || sprite.left() > this.canvas.innerWidth() ||
      sprite.top() > this.canvas.innerHeight() || sprite.bottom() < 0)
    return true;

  return false;
};

