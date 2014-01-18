/*
 *  Interpreter.js
 *
 *  Author: Andrew Butterfield
 *  Date: 18 Jan 2014
 *
 *  Defines a class that represents an interpreter for the Zuse
 *  language.
 *
 */
function Interpreter() 
{

}

Interpreter.prototype.runJSON = function(exp)
{
  // Translate into object
  return this.evalExpression(JSON.parse(exp));
};

Interpreter.prototype.evalExpression = function(exp)
{
  // capture result
  var result = null;

  // Check if exp is an atom
  if (typeof exp === "number" || typeof exp === "string" || typeof exp === "boolean")
  {
    return exp;
  }
  else if ((result = this.evalMathExpression(exp)) !== null)
  {
    return result;
  }
};

Interpreter.prototype.evalMathExpression = function(exp)
{
  // Get operation type
  var op = this.getObjectKey(exp);
  var val = exp[op];
  var first = val.shift();
  var that = this;

  // Go through the cases
  switch(op)
  {
    // Handle addition
    case "+":
      return val.foldl(function(a,b) { return a + that.evalExpression(b); }, first); 
      break;
    // Handle subtraction
    case "-":
      return val.foldl(function(a,b) { return a - that.evalExpression(b); }, first);
      break;
    // Handle multiplication
    case "*":
      return val.foldl(function(a,b) { return a * that.evalExpression(b); }, first);
      break;
    // Handle division
    case "/":
       return val.foldl(function(a,b) { return a / that.evalExpression(b); }, first);
      break;
    // Handle modulus
    case "%":
      return val.foldl(function(a,b) { return a % that.evalExpression(b); }, first);
      break;
  }
 
  // Must not have been a mathematical expression if we get here
  return null;
};

/*
 * If an object has a single key, returns it.
 * Otherwise returns null.
 */
Interpreter.prototype.getObjectKey = function(o)
{
  // Set up variables
  var key = null;
  var count = 0;

  // Loop through object to get key
  for (k in o)
  {
    key = k;
    count++
  }
  // If the object had more than one key
  if (count > 1)
    return null;
  // Otherwise here is the single key
  else
    return key;
};


