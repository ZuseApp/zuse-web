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

/*
 * Calls f on each item in the array,
 * returning a new array of the values
 * that f returned. f must take one parameter 
 * of the type of object in this array
 */
Array.prototype.map = function(f)
{
  var result = [];
  for (var i = 0; i < this.length; i++)
    result.push(f(this[i]));

  return result;
};

/*
 * Simple utility function that generates a uuid
 */
String.uuid = function()
{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});
}

/*
 * Creates a shallow copy of obj
 */
Object.copy = function (obj)
{
  var copy = {};

  for (var k in obj)
    copy[k] = obj[k];

  return copy;
};
