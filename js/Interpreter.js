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
  this.objects = {};
  this.events = {};
  this.methods = {};
}

/*
 * Loads an object into the interpreter
 */
Interpreter.prototype.loadObject = function(o)
{
  // Create object
  var formatted_object = { properties: o["properties"], code: o["code"], events: {}}


  this.objects[o["id"] = formatted_object;
};

Interpreter.prototype.triggerEvent = function(e)
{

};


/*
 * Loads a method into the interpreter
 */
Interpreter.prototype.loadMethod = function()
{

};

/*
 * Converts the json string that represents
 * the program into a javascript object
 * and then starts the evaluation process
 */
Interpreter.prototype.runJSON = function(exp)
{
  // Convert json to object
  var o = JSON.parse(exp);

  return this.runCode(o);
 
};

Interpreter.prototype.runSuite = function(suites)
{
  var value = null;

  for (var i = 0; i < suites.length; i++)
    value = this.runCode(suites[i]);

  return value;
};

Interpreter.prototype.runCode = function(obj)
{
  // Get key of obj
  var key = this.getObjectKey(obj);


  // Handle if statement
  if (key === "if")
  {
    if (this.evalExpression(obj[key]["test"]))
      return this.runSuite(obj[key]["true"]);
    else if ("false" in obj[key])
      return this.runSuite(obj[key]["false"]);
    else
      return null;
  }
  // Must be an expression, evaluate it
  else
    return this.evalExpression(obj);
  
};

/*
 * Evaluates the object expression and returns the result
 */
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
  else if ((result = this.evalBoolExpression(exp)) !== null)
  {
    return result
  }

  return null;
};

/*
 * Interprets a mathematical expression and returns its
 * result; if the expression is not a mathematical one,
 * returns null
 */
Interpreter.prototype.evalMathExpression = function(exp)
{
  // Get operation type
  var op = this.getObjectKey(exp);
  var val = exp[op];
  var that = this;

  // Go through the cases
  switch(op)
  {
    // Handle addition
    case "+":
      var first = this.evalExpression(val.shift());
      return val.foldl(function(a,b) { return a + that.evalExpression(b); }, first); 
      break;
    // Handle subtraction
    case "-":
      var first = this.evalExpression(val.shift());
      return val.foldl(function(a,b) { return a - that.evalExpression(b); }, first);
      break;
    // Handle multiplication
    case "*":
      var first = this.evalExpression(val.shift());
      return val.foldl(function(a,b) { return a * that.evalExpression(b); }, first);
      break;
    // Handle division
    case "/":
      var first = this.evalExpression(val.shift());
       return val.foldl(function(a,b) { return a / that.evalExpression(b); }, first);
      break;
    // Handle modulus
    case "%":
      var first = this.evalExpression(val.shift());
      return val.foldl(function(a,b) { return a % that.evalExpression(b); }, first);
      break;
  }
 
  // Must not have been a mathematical expression if we get here
  return null;
};

Interpreter.prototype.evalBoolExpression = function(exp)
{
  // Get operation type
  var op = this.getObjectKey(exp);
  var val = exp[op];
  var that = this;

  // Go through the cases
  switch(op)
  {
    // handle and
    case "and":
      var first = this.evalExpression(val.shift());
      return val.foldl(function(a,b) { return a && that.evalExpression(b); }, first);
      break;
    // handle or
    case "or":
      var first = this.evalExpression(val.shift());
      return val.foldl(function(a,b) { return a || that.evalExpression(b); }, first);
      break;
    // handle ==
    case "==":
      return this.evalExpression(val[0]) === this.evalExpression(val[1]);
      break;
    // handle !=
    case "!=":
      return this.evalExpression(val[0]) !== this.evalExpression(val[1]);
      break;
    // handle >
    case ">":
      return this.evalExpression(val[0]) > this.evalExpression(val[1]);
      break;
    // handle <
    case "<":
      return this.evalExpression(val[0]) < this.evalExpression(val[1]);
      break;
    // handle >=
    case ">=":
      return this.evalExpression(val[0]) >= this.evalExpression(val[1]);
      break;
    // handle <=
    case "<=":
      return this.evalExpression(val[0]) <= this.evalExpression(val[1]);
      break;
  }

  // If we get here must not have been a boolean expressoin
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


