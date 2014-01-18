Array.prototype.foldl = function(f,init)
{
  for (var i = 0; i < this.length; i++)
    init = f(init,this[i]);
  return init;
};
