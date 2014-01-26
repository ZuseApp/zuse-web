/*
 * extend_core_datatypes.js
 *
 * Author: Andrew Butterfield
 * Date: 18 Jan 2014
 *
 * Contains extensions to core datatypes
 *
 */

/*
 * Folds values contained in array
 * by passing init and each value of the array
 * to f from left to right and returns the
 * accumulated result.
 *
 */
Array.prototype.foldl = function(f,init)
{
  for (var i = 0; i < this.length; i++)
    init = f(init,this[i]);
  return init;
};

Array.prototype.map = function(f)
{
  var result = [];
  for (var i = 0; i < this.length; i++)
    result.push(f(this[i]));

  return result;
};
