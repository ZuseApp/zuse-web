function Sprite (options)
{
  this.id = options.id;
  this.width = options.width;
  this.height = options.height;
  this.cx = options.x;
  this.cy = options.y;
  this.x = Math.floor(this.cx - (this.width/2));
  this.y = Math.floor(this.cy - (this.height/2));
  this.vx = 0.0;
  this.vy = 0.0;
  this.physics_body = options.physics_body;
  this.collision_group = options.collision_group;
  this.type = options.type;
  this.rasterizeImage(options.image);
}

Sprite.prototype.hasVelocity = function ()
{
  return this.vx != 0.0 || this.vy != 0.0;
};

Sprite.prototype.updatePosition = function (dt)
{
  this.setX(this.cx + (this.vx * (dt / 1000)));
  this.setY(this.cy + (this.vy * (dt / 1000)));
};

Sprite.prototype.setX = function (x)
{
  this.cx = x;
  this.x = Math.floor(this.cx - (this.width/2));
};

Sprite.prototype.setY = function (y)
{
  this.cy = y;
  this.y = Math.floor(this.cy - (this.height/2));
};

Sprite.prototype.rasterizeImage = function (img)
{
  if (img.height <= this.height && img.width <= this.width)
  {
    this.image = img;
    return;
  }

  var c1 = document.createElement("canvas");
  var ctx1 = c1.getContext("2d");

  c1.width = img.width * 0.5;
  c1.height = img.height * 0.5;

  ctx1.drawImage(img, 0, 0, c1.width, c1.height);

  for (var i = 0; i < 2; i++)
  {
    var c2 = document.createElement("canvas");
    var ctx2 = c2.getContext("2d");

    c2.width = c1.width * 0.5;
    c2.height = c1.height * 0.5;

    ctx2.drawImage(c1, 0, 0, c2.width, c2.height);

    c1 = c2;
    ctx1 = ctx2;
  }
  
  this.image = c1;
};

Sprite.prototype.isHit = function (x, y)
{
  return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
};

Sprite.prototype.right = function ()
{
  return this.x + this.width;
};

Sprite.prototype.left = function ()
{
  return this.x;
};

Sprite.prototype.collidesWith = function (other_sprite)
{
  var s = other_sprite;

  if (s.left() < this.right() && s.top() < this.bottom() && s.right() > this.left() && s.bottom() > this.top())
    return true;

  return false;
};

Sprite.prototype.handleCollisionWith = function (other_sprite)
{
  var s = other_sprite;

  if (s.top() < this.bottom() || s.bottom() > this.top())
    this.vy = this.vy * -1;

  if (s.left() < this.right() || s.right() > this.left())
    this.vx = this.vx * -1;
};

Sprite.prototype.top = function ()
{
  return this.y;
};

Sprite.prototype.bottom = function ()
{
  return this.y + this.height;
};
