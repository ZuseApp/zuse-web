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
  this.methods = {};
}

/*
 * Loads an object into the interpreter
 */
Interpreter.prototype.loadObject = function(o)
{
  // Create object
  var formatted_object = { properties: o["properties"], code: o["code"], events: {}}

  // Add it to the list of objects
  this.objects[o["id"]] = formatted_object;

  // Run the code
  this.runSuiteWithContext(this.objects[o["id"]].code, o["id"]);

};

/*
 * Triggers an event of type 'event_name' on an object with id 'object_id'
 * passing the given parameters
 */
Interpreter.prototype.triggerEventOnObjectWithParameters = function(event_name, object_id, parameters)
{
  // add parameters to the object
  this.runSuiteWithContext(this.objects[object_id].events[event_name], object_id);
};


/*
 * Loads a method into the interpreter
 */
Interpreter.prototype.loadMethod = function(name,func)
{
  this.methods[name] = func;
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
  var empty = this.emptyObject();

  this.loadObject(empty);

  return this.runCodeWithContext(o,empty.id);
 
};

/*
 * Generates an empty object 
 * Mostly used for testing
 */
Interpreter.prototype.emptyObject = function()
{
  return { id: Math.random() * Number.MAX_VALUE + "",
           properties: {},
           code: []};
};

/*
 * Interprets a series of statements, return the result of the last
 */
Interpreter.prototype.runSuiteWithContext = function(suites, context)
{
  var value = null;

  for (var i = 0; i < suites.length; i++)
    value = this.runCodeWithContext(suites[i], context);

  return value;
};

/*
 * Basically runs the code its given
 */
Interpreter.prototype.runCodeWithContext = function(obj, context)
{
  // Get key of obj
  var key = this.getObjectKey(obj);

  // Handle code block
  if (key === "code")
  {
    return this.runSuiteWithContext(obj[key], context);
  }
  // Handle on_event
  else if (key === "on_event")
  {
    this.objects[context].events[obj[key]["name"]] = obj[key]["code"]; 
  }
  // Handle set
  else if (key === "set")
  {
    // add/update var in context
    this.objects[context].properties[obj[key][0]] = this.evalExpressionWithContext(obj[key][1]);
  }
  // Handle if statement
  else if (key === "if")
  {
    if (this.evalExpressionWithContext(obj[key]["test"], context))
      return this.runSuiteWithContext(obj[key]["true"], context);
    else if ("false" in obj[key])
      return this.runSuiteWithContext(obj[key]["false"], context);
    else
      return null;
  }
  // Must be an expression, evaluate it
  else
  {
    return this.evalExpressionWithContext(obj, context);
  }
  
};

/*
 * Evaluates the object expression and returns the result
 */
Interpreter.prototype.evalExpressionWithContext = function(exp, context)
{
  // capture result
  var result = null;

  // Check if exp is an atom
  if (typeof exp === "number" || typeof exp === "string" || typeof exp === "boolean")
  {
    return exp;
  }

  // Get key of obj
  var key = this.getObjectKey(exp);

  if (key === "get")
  {
    if (exp["get"] in this.objects[context].properties)
      return this.objects[context].properties[exp["get"]];
    else
      throw new Error("Free variable: " + exp["get"]);
  }
  else if (key === "call")
  {
    var that = this;
    var params = "parameters" in exp["call"] ? exp["call"]["parameters"] : [];
    params = params.map(function(p){return that.evalExpressionWithContext(p,context)});
    if (exp["call"].method in this.methods)
      return this.methods[exp["call"].method](params);
    else
      throw new Error("Undefined method: " + exp["call"].method);
  }
  else if ((result = this.evalMathExpressionWithContext(exp, context)) !== null)
  {
    return result;
  }
  else if ((result = this.evalBoolExpressionWithContext(exp, context)) !== null)
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
Interpreter.prototype.evalMathExpressionWithContext = function(exp, context)
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
      var first = this.evalExpressionWithContext(val.shift(), context);
      return val.foldl(function(a,b) { return a + that.evalExpressionWithContext(b, context); }, first); 
      break;
    // Handle subtraction
    case "-":
      var first = this.evalExpressionWithContext(val.shift(), context);
      return val.foldl(function(a,b) { return a - that.evalExpressionWithContext(b, context); }, first);
      break;
    // Handle multiplication
    case "*":
      var first = this.evalExpressionWithContext(val.shift(), context);
      return val.foldl(function(a,b) { return a * that.evalExpressionWithContext(b, context); }, first);
      break;
    // Handle division
    case "/":
      var first = this.evalExpressionWithContext(val.shift(), context);
       return val.foldl(function(a,b) { return a / that.evalExpressionWithContext(b, context); }, first);
      break;
    // Handle modulus
    case "%":
      var first = this.evalExpressionWithContext(val.shift(), context);
      return val.foldl(function(a,b) { return a % that.evalExpressionWithContext(b, context); }, first);
      break;
  }
 
  // Must not have been a mathematical expression if we get here
  return null;
};

/*
 * Interprets the given boolean expression returning its result
 */
Interpreter.prototype.evalBoolExpressionWithContext = function(exp, context)
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
      var first = this.evalExpressionWithContext(val.shift(), context);
      return val.foldl(function(a,b) { return a && that.evalExpressionWithContext(b, context); }, first);
      break;
    // handle or
    case "or":
      var first = this.evalExpressionWithContext(val.shift(), context);
      return val.foldl(function(a,b) { return a || that.evalExpressionWithContext(b, context); }, first);
      break;
    // handle ==
    case "==":
      return this.evalExpressionWithContext(val[0], context) === this.evalExpressionWithContext(val[1], context);
      break;
    // handle !=
    case "!=":
      return this.evalExpressionWithContext(val[0], context) !== this.evalExpressionWithContext(val[1], context);
      break;
    // handle >
    case ">":
      return this.evalExpressionWithContext(val[0], context) > this.evalExpressionWithContext(val[1], context);
      break;
    // handle <
    case "<":
      return this.evalExpressionWithContext(val[0], context) < this.evalExpressionWithContext(val[1], context);
      break;
    // handle >=
    case ">=":
      return this.evalExpressionWithContext(val[0], context) >= this.evalExpressionWithContext(val[1], context);
      break;
    // handle <=
    case "<=":
      return this.evalExpressionWithContext(val[0], context) <= this.evalExpressionWithContext(val[1], context);
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
  {
    return null;
  }
  // Otherwise here is the single key
  else
  {
    return key;
  }
};


