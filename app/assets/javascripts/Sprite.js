/*
 * Sprite.js
 *
 * Author: Andrew Butterfield
 * Date: 21 Feb 2014
 *
 * Defines a class that represents a sprite in the ZuseAppEngine
 */

/*
 * Constructor
 */
function Sprite (options)
{
  this.id = options.id;
  this.width = options.width;
  this.height = options.height;
  this.cx = options.x;
  this.cy = options.y;
  this.x = Math.round(this.cx - (this.width/2));
  this.y = Math.round(this.cy - (this.height/2));
  this.vx = 0.0;
  this.vy = 0.0;
  this.physics_body = options.physics_body;
  this.collision_group = options.collision_group;
  this.type = options.type;
  
  if (this.type === "image")
  {
    this.rasterizeImage(options.image);
  }
  else if (this.type === "text")
  {
    this.text = options.text;
  }
}

/*
 * Returns whether the sprite has a velocity
 */
Sprite.prototype.hasVelocity = function ()
{
  return this.vx != 0.0 || this.vy != 0.0;
};

/*
 * Updates position based on last time click
 */
Sprite.prototype.updatePosition = function (dt)
{
  this.setX(this.cx + (this.vx * (dt / 1000)));
  this.setY(this.cy + (this.vy * (dt / 1000)));
};

/*
 * Sets both cx and x of this sprite
 */
Sprite.prototype.setX = function (x)
{
  this.cx = x;
  this.x = Math.round(this.cx - (this.width/2));
};

/*
 * Sets both cy and y of this sprite
 */
Sprite.prototype.setY = function (y)
{
  this.cy = y;
  this.y = Math.round(this.cy - (this.height/2));
};

/*
 * Rasterizes images when resizes on canvas
 */
Sprite.prototype.rasterizeImage = function (img)
{
  // Short curcuit and don't rasterize to increase performance
  //if (img.height <= this.height && img.width <= this.width)
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

/*
 * Determines whether the given x, y position is a hit within this sprite
 */
Sprite.prototype.isHit = function (x, y)
{
  return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
};

/*
 * Returns the right boundary of the sprite
 */
Sprite.prototype.right = function ()
{
  return this.x + this.width;
};

/*
 * Returns the left boundary of the sprite
 */
Sprite.prototype.left = function ()
{
  return this.x;
};

/*
 * Returns whether the passed in sprite is colliding with this sprite
 */
Sprite.prototype.collidesWith = function (other_sprite)
{
  var s = other_sprite;

  if (this.left() <= s.right() && this.top() <= s.bottom() && this.right() >= s.left() && this.bottom() >= s.top())
    return true;

  return false;
};

/*
 * Resolves a collision with another sprite by bouncing
 */
Sprite.prototype.resolveCollisionWith = function (other_sprite)
{
  // Check if still colliding
  if (!this.collidesWith(other_sprite))
    return;

  var overlap = this.getOverlapVector(other_sprite);
  var static = null;
  var dynamic = null;

  if (!this.hasVelocity() && other_sprite.hasVelocity())
  {
    static = this;
    dynamic = other_sprite;
  }

  if (!other_sprite.hasVelocity() && this.hasVelocity())
  {
    static = other_sprite;
    dynamic = this;
  }

  if (static != null)
  {
    if (overlap.x)
    {
      if (dynamic.vx < 0)
      {
        if (dynamic.left() < static.right())
          dynamic.setX(dynamic.cx + overlap.x);
        else
          dynamic.setX(dynamic.cx - overlap.x);
      }
      else
      {
        if (dynamic.right() > static.left())
          dynamic.setX(dynamic.cx - overlap.x);
        else
          dynamic.setX(dynamic.cx + overlap.x);
      }
      dynamic.vx = dynamic.vx * -1;
    }
    else
    {
      if (dynamic.yx < 0)
      {
        if (dynamic.bottom() > static.top())
          dynamic.setY(dynamic.cy - overlap.y);
        else
          dynamic.setY(dynamic.cy + overlap.y);
      }
      else
      {
        if (dynamic.top() < static.bottom())
          dynamic.setY(dynamic.cy + overlap.y);
        else
          dynamic.setY(dynamic.cy - overlap.y);
      }
      
      dynamic.vy = dynamic.vy * -1;
    }
  }
  else
  {
    if (overlap.x)
    {
      if (s.vx < 0)
      {
        s.setX(dynamic.cx + overlap.x);
      }
      else
      {
        dynamic.setX(dynamic.cx - overlap.x);
      }
      dynamic.vx = dynamic.vx * -1;
    }
    else
    {
      if (s.yx < 0)
      {
        dynamic.setY(dynamic.cy + overlap.y);
      }
      else
      {
        dynamic.setY(dynamic.cy - overlap.y);
      }
      
      dynamic.vy = dynamic.vy * -1;
    }
  }
  

};

/*
 * Returns overlap vector
 */
Sprite.prototype.getOverlapVector = function (other_sprite)
{
  var x = (other_sprite.width/2 + this.width/2) - (Math.abs(other_sprite.cx - this.cx));
  var y = (other_sprite.height/2 + this.height/2) - (Math.abs(other_sprite.cy - this.cy));

  if (x <= y)
    return { x: Math.ceil(x), y: null };
  else
    return { x: null, y: Math.ceil(y) };
}

/*
 * Resolves a collision with another sprite by bouncing (elastic collision)
 */
Sprite.prototype.resolveCollisionWithOld = function (other_sprite)
{
  var diff = 0;
  var width = 0;
  var height = 0;
  var static = null;
  var dynamic = null;
  var topOrBottom = false;
  var leftOrRight = false;

  if (!this.hasVelocity() && other_sprite.hasVelocity())
  {
    static = this;
    dynamic = other_sprite;
  }

  if (!other_sprite.hasVelocity() && this.hasVelocity())
  {
    static = other_sprite;
    dynamic = this;
  }

  if (static !== null)
  {
    var horizontalOverlap = (Math.min(static.right(), dynamic.right()) - Math.max(static.left(), dynamic.left())) + 1.5;
    var verticalOverlap = (Math.min(static.bottom(), dynamic.bottom()) - Math.max(static.top(), dynamic.top())) + 1.5;

    if (horizontalOverlap == verticalOverlap)
    {
      console.log("even steven");
      dynamic.vx = dynamic.vx * -1;
      dynamic.vy = dynamic.vy * -1;

      if (dynamic.top() <= static.bottom())
        dynamic.setX(dynamic.cx + verticalOverlap + 1)
      else
        dynamic.setX(dynamic.cx - verticalOverlap - 1)

      if (dynamic.left() <= static.right())
        dynamic.setY(dynamic.cy + horizontalOverlap + 1)
      else
        dynamic.setY(dynamic.cy - horizontalOverlap - 1)
    }
    else if (horizontalOverlap > verticalOverlap)
    {
      console.log("horizontal");
      dynamic.vy = dynamic.vy * -1;

      if (dynamic.top() <= static.bottom())
        dynamic.setX(dynamic.cx + verticalOverlap + 1)
      else
        dynamic.setX(dynamic.cx - verticalOverlap - 1)

    }
    else if (horizontalOverlap < verticalOverlap)
    {
      console.log("vertical");
      dynamic.vx = dynamic.vx * -1;

      if (dynamic.left() <= static.right())
        dynamic.setY(dynamic.cy + horizontalOverlap + 1)
      else
        dynamic.setY(dynamic.cy - horizontalOverlap - 1)
    }
  }
  else
  {
    var horizontalOverlap = (Math.min(other_sprite.right(), this.right()) - Math.max(other_sprite.left(), this.left())) + 1.5;
    var verticalOverlap = (Math.min(other_sprite.bottom(), this.bottom()) - Math.max(other_sprite.top(), this.top())) + 1.5;

    if (horizontalOverlap == verticalOverlap)
    {
      this.vx = this.vx * -1;
      this.vy = this.vy * -1;

      other_sprite.vx = other_sprite.vx * -1;
      other_sprite.vy = other_sprite.vy * -1;

      if (this.top() <= other_sprite.bottom())
        this.setX(this.cx + verticalOverlap)
      else
        this.setX(this.cx - verticalOverlap)

      if (this.left() <= other_sprite.right())
        this.setY(this.cy + horizontalOverlap)
      else
        this.setY(this.cy - horizontalOverlap)
    }
    else if (horizontalOverlap > verticalOverlap)
    {
      this.vy = this.vy * -1;

      other_sprite.vy = other_sprite.vy * -1;

      if (this.top() <= other_sprite.bottom())
        this.setX(this.cx + verticalOverlap)
      else
        this.setX(this.cx - verticalOverlap)

    }
    else if (horizontalOverlap < verticalOverlap)
    {
      this.vx = this.vx * -1;

      other_sprite.vx = other_sprite.vx * -1;

      if (this.left() <= other_sprite.right())
        this.setY(this.cy + horizontalOverlap)
      else
        this.setY(this.cy - horizontalOverlap)
    }

  }
  
  
};

/*
 * Returns the top position of this sprite
 */
Sprite.prototype.top = function ()
{
  return this.y;
};

/*
 * Returns the bottom position of this sprite
 */
Sprite.prototype.bottom = function ()
{
  return this.y + this.height;
};

/*
 * Returns a position object of this sprite
 */
Sprite.prototype.position = function ()
{
  return { x: this.x, y: this.y, cx: this.cx, cy: this.cy };
}

/*
 * Sets this sprite's position to the passed in pos objects information
 */
Sprite.prototype.restorePosition = function (pos)
{
  this.x = pos.x;
  this.y = pos.y;
  this.cx = pos.cx;
  this.cy = pos.cy;
};

/*
 * Sets a velocity for this sprite
 */
Sprite.prototype.applyVelocity = function (vx, vy)
{
  this.vx = vx;
  this.vy = vy;
};

