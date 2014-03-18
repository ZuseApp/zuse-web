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

/*
 * Constructor
 */
function Interpreter() 
{
  this.objects = {};
  this.methods = {};
  this.properties = {};
  this.events = {};
  this.data_store = {};

  this.propertyUpdateCallback = null;
}

/*
 * Loads an object into the interpreter
 */
Interpreter.prototype.loadObject = function(o)
{
  // Add entry in events
  this.events[o["id"]] = {};

  // Object to objects
  this.objects[o["id"]] = o;

  var env = this.addPropertiesToDataStore(o["properties"]);

  var context = new ExecutionContext({ id: o["id"], environment: env});

  this.properties[o["id"]] = context;

  // Run the code
  this.runSuiteWithContext(this.objects[o["id"]].code, context);
};

/*
 * Triggers an event on all objects with empty params
 */
Interpreter.prototype.triggerEvent = function (event_name)
{
  this.triggerEventWithParameters(event_name, {});
};

/*
 * Triggers the named event on all object with the given parameters
 */
Interpreter.prototype.triggerEventWithParameters = function (event_name, parameters)
{
  // Loop through objects and trigger the event
  for (var k in this.events)
    this.triggerEventOnObjectWithParameters(event_name, k, parameters);
};

/*
 * Triggers an event of type 'event_name' on an object with id 'object_id'
 * passing the given parameters
 */
Interpreter.prototype.triggerEventOnObjectWithParameters = function(event_name, object_id, parameters)
{
  // Make sure the object is in the event hash and that the event name is in the objects events
  if (!(object_id in this.events) || !(event_name in this.events[object_id]))
    return null;

  // get new context for event
  var new_context = this.events[object_id][event_name].context.contextWithNewEnvironment();
  
  // Add parameters to store
  var params = this.addPropertiesToDataStore(parameters);

  // Add these to the context
  new_context.addPropertiesToEnvironment(params);

  // Run the code
  return this.runSuiteWithContext(this.events[object_id][event_name].code, new_context);
};

/*
 * Adds the values of the properties object into the data store
 * with a unique identifier key. Creates an object where key is 
 * the key from properties and its value is the identifier of
 * the value in the store
 */
Interpreter.prototype.addPropertiesToDataStore = function(properties)
{
  // Create empty environment
  var environment = {};

  // For each key in properties
  for (var p in properties)
  {
    // Generate a unique key
    var unique_key = String.uuid();

    // add identifier to the environment
    environment[p] = unique_key;

    // add value to the store
    this.data_store[unique_key] = properties[p];
  }

  // Return the environment
  return environment;
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
Interpreter.prototype.runJSONString = function(exp)
{
  // Convert json to object
  var o = JSON.parse(exp);
  var empty = this.emptyObject();

  this.loadObject(empty);

  var env = this.addPropertiesToDataStore(empty.properties);
  var context = new ExecutionContext({ id: empty.id, environment: env});
  return this.runCodeWithContext(o,context);
 
};

/*
 * Converts the json string that represents
 * the program into a javascript object
 * and then starts the evaluation process
 */
Interpreter.prototype.runJSON = function(exp)
{
  // Convert json to object
  var empty = this.emptyObject();

  this.loadObject(empty);

  var env = this.addPropertiesToDataStore(empty.properties);
  var context = new ExecutionContext({ id: empty.id, environment: env});
  return this.runCodeWithContext(exp,context);
 
};

/*
 * Generates an empty object 
 * Mostly used for testing
 */
Interpreter.prototype.emptyObject = function()
{
  return { id: String.uuid(),
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
  //if (key === "code")
  //{
  //  return this.runSuiteWithContext(obj[key], context);
  //}
  // Handle on_event
  if (key === "on_event")
  {
    this.events[context.id][obj[key]["name"]] = { code: obj[key]["code"], context: context }; 
  }
  // Handle set
  else if (key === "set")
  {
    // evaluate value
    var new_value = this.evalExpressionWithContext(obj[key][1], context);

    // get identifier if any
    var identifier = context.environment[obj[key][0]];

    // If identifier already exists set new value
    if (identifier)
      this.data_store[identifier] = new_value;
    // Otherwise create new identifier and set value
    else
    {
      identifier = String.uuid();
      context.environment[obj[key][0]] = identifier;
      this.data_store[identifier] = new_value;
    }

    if (this.propertyUpdateCallback)
    {
      var update = {};
      update[obj[key][0]] = new_value;
      this.propertyUpdateCallback(context.id, update);
    }
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
  // Handle scope
  else if (key === "suite")
  {
    return this.runSuiteWithContext(obj[key], context.contextWithNewEnvironment());
  }
  // Handle trigger event
  else if (key === "trigger_event")
  {
    this.triggerEventWithParameters(obj[key].name, obj[key].properties);
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

  // Handle object
  if (key === "object")
  {
    this.loadObject(exp["object"]);
    return exp["object"];
  }

  // Handle a get
  if (key === "get")
  {
    // If the key is in the environment return it
    if (exp["get"] in context.environment)
      return this.data_store[context.environment[exp["get"]]];
    // Otherwise throw an exception
    else
      throw new Error("Free variable: " + exp["get"]);
  }
  // Handle method call
  else if (key === "call")
  {
    // Create reference to this scope
    var that = this;

    // evaluate params if any
    var params = "parameters" in exp["call"] ? exp["call"]["parameters"] : [];
    params = params.map(function(p){return that.evalExpressionWithContext(p, context)});
    
    // check if the method is defined and call if it is
    if (exp["call"].method in this.methods)
      return this.methods[exp["call"].method](context.id, params);
    // Otherwise throw exception
    else
      throw new Error("Undefined method: " + exp["call"].method);
  }
  // Check if it is a math expression
  else if ((result = this.evalMathExpressionWithContext(exp, context)) !== null)
  {
    return result;
  }
  // Check if ti is a boolean expression
  else if ((result = this.evalBoolExpressionWithContext(exp, context)) !== null)
  {
    return result
  }

  // Otherwise return null
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
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
      return val.slice(1).foldl(function(a,b) { return a + that.evalExpressionWithContext(b, context); }, first); 
      break;
    // Handle subtraction
    case "-":
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
      return val.slice(1).foldl(function(a,b) { return a - that.evalExpressionWithContext(b, context); }, first);
      break;
    // Handle multiplication
    case "*":
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
      return val.slice(1).foldl(function(a,b) { return a * that.evalExpressionWithContext(b, context); }, first);
      break;
    // Handle division
    case "/":
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
       return val.slice(1).foldl(function(a,b) { return a / that.evalExpressionWithContext(b, context); }, first);
      break;
    // Handle modulus
    case "%":
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
      return val.slice(1).foldl(function(a,b) { return a % that.evalExpressionWithContext(b, context); }, first);
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
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
      return val.slice(1).foldl(function(a,b) { return a && that.evalExpressionWithContext(b, context); }, first);
      break;
    // handle or
    case "or":
      var first = this.evalExpressionWithContext(val.slice(0,1)[0], context);
      return val.slice(1).foldl(function(a,b) { return a || that.evalExpressionWithContext(b, context); }, first);
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
  for (var k in o)
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

/*
 * Removes an object from the interpreter
 */
Interpreter.prototype.removeObjectWithIdentifier = function (id)
{
  delete this.objects[id];
  delete this.properties[id];
  delete this.events[id];
}
