function ZuseGame(options)
{
  var that = this;

  // Game code
  this.code = options.code;

  // Physics bodies
  this.bodies = {};

  this.mouseDown = false;
  this.currentObject = null;
  
  // Compiler
  var compiler = new Compiler( { project_json: this.code } );
  this.interpreter = compiler.getInterpreter();

  // jQuery canvas handle
  this.canvas = options.canvas;
  this.canvas.css({width: "320px", height: "480px"});

  $(document).on("mousedown", function (e){
    var id = null;
    var x = e.clientX - e.target.offsetLeft - 1;
    var y = e.clientY - e.target.offsetTop - 1;
    
    if (id = that.hitObject(x, y))
    {
      that.mouseDown = true;
      that.currentObject = that.bodies[id];
      console.log(that.bodies[id]);
      that.bodies[id].state.vel.set(0.01,0);
    }
  });

  $(document).on("mousemove", function (e){
  });

  $(document).on("mouseup", function (e){
    that.mouseDown = false;
    that.currentObject = null;
  });


  // Physics world/rendering engine
  this.world = Physics();

  // Image assets that need loading
  this.images = {};
  this.image_count = this.getImageCount();
  this.loaded_image_count = 0;

  // When images finish loading side effect is starting the game
  this.loadImages();
}

ZuseGame.prototype.loadImages = function (image_list)
{
  for (var i = 0; i < this.code.objects.length; i++)
  { 
    var obj = this.code.objects[i];
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

ZuseGame.prototype.imageLoadSuccess = function (e)
{
  console.log("Image Loaded: " + e.srcElement.src);
  this.loaded_image_count++;

  if (this.loaded_image_count == this.image_count)
    this.start();
};

ZuseGame.prototype.imageLoadError = function (e)
{
  throw new Error("Image load error: " + e.srcElement.src); 
};

ZuseGame.prototype.getImageCount = function()
{
  var count = 0;
  var images = {};

  for (var i = 0; i < this.code.objects.length; i++)
  { 
    var obj = this.code.objects[i];
    var path = obj.image.path;

    if (!(path in images))
    {
      images[path] = "";
      count++;
    }
  } 

  return count;
};

ZuseGame.prototype.configurePhysicsWorld = function ()
{
  var that = this;

  var renderer = Physics.renderer("canvas", {
    el: this.canvas.attr("id"),
    width: this.canvas.innerWidth(),
    height: this.canvas.innerHeight()
  });

  this.world.add(renderer);

  var bounds = Physics.aabb(0, 0, this.canvas.innerWidth(), this.canvas.innerHeight());

  this.world.add(Physics.behavior('edge-collision-detection', {
    aabb: bounds
  }));

  this.world.add( Physics.behavior('body-collision-detection') );
  this.world.add( Physics.behavior('sweep-prune') );
};

ZuseGame.prototype.start = function()
{
  var that = this;

  this.configurePhysicsWorld();
  this.addObjectsToWorld();

   Physics.util.ticker.subscribe(function( time, dt ){
    that.world.step( time );
  });

  Physics.util.ticker.start();

  this.world.subscribe("step", function() {
    that.world.render();
  });
};

ZuseGame.prototype.addObjectsToWorld = function ()
{
  for (var i = 0; i < this.code.objects.length; i++)
  {
    var obj = this.code.objects[i];

    switch(obj["physics_body"])
    {
      case "rectangle":
        this.addRectangularSpriteToWorld(obj);
        break;
      case "circle":
        this.addCircularSpriteToWorld(obj);
        break;
    }
  }
};

ZuseGame.normalizeX = function (x, width)
{
  return Math.floor(x + width/2);
};

ZuseGame.normalizeY = function (y, height)
{
   return Math.floor(y - height/2);
};

ZuseGame.getVertList = function (width, height)
{
  return [ { x: 0, y: 0 },
           { x: width, y: 0 },
           { x: width, y: height },
           { x: 0, y: height } ];
};

ZuseGame.getRadius = function (width)
{
  return width/2;
};

ZuseGame.prototype.addRectangularSpriteToWorld = function (o)
{
  var rect = Physics.body('convex-polygon', {
    x: o.properties.x,
    y: this.canvas.innerHeight() - o.properties.y,
    vertices: ZuseGame.getVertList(o.properties.width, o.properties.height),
    width: o.properties.width,
    height: o.properties.height
  });

  this.images[o.image.path].height = o.properties.height;
  this.images[o.image.path].width = o.properties.width;
  rect.view = this.images[o.image.path];

  this.world.add(rect);

  this.bodies[o.id] = rect;
};

ZuseGame.prototype.addCircularSpriteToWorld = function (o)
{
  var circ = Physics.body('circle', {
    x: o.properties.x,
    y: o.properties.y,
    radius: ZuseGame.getRadius(o.properties.width),
    width: o.properties.width,
    height: o.properties.height
  });

  this.images[o.image.path].height = o.properties.height;
  this.images[o.image.path].width = o.properties.width;
  circ.view = this.images[o.image.path];

  this.world.add(circ);
  
  this.bodies[o.id] = circ;
};

ZuseGame.prototype.hitObject = function (x, y)
{
  var id = null;

  for (k in this.bodies)
  {
    var o = this.bodies[k];
    var objX = Math.floor(o.state.pos.get(0) - o.options.width/2);
    var objY = Math.floor(o.state.pos.get(1) - o.options.height/2);
    
    if (x >= objX && x <= (objX + o.options.width) && y >= objY && y <= (objY + o.options.height))
      id = k;
  }
  console.log(id);
  return id;
};
