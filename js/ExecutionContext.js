/*
 * ExecutionContext.js
 *
 * Author: Andrew Butterfield
 * Date: 29 Jan 2014
 *
 * Defines a class that represents an execution context for the interpreter
 *
 */

/*
 * Constructor
 */
function ExecutionContext(options)
{
  this.id = options.id;
  this.environment = options.environment || {};
}

/*
 * Returns a new context with a new environment
 * using this context's environment
 */
ExecutionContext.prototype.contextWithNewEnvironment = function ()
{
  var new_env = {};

  for (var k in this.environment)
    new_env[k] = this.environment[k];

  return new ExecutionContext({id: this.id, environment: new_env});
};

/*
 * Adds properties to the environment
 */
ExecutionContext.prototype.addPropertiesToEnvironment = function(properties)
{
  for (var k in properties)
    this.environment[k] = properties[k];
};

