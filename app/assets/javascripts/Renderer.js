/*
 * Renderer.js
 *
 * Author: Andrew Butterfield
 * Date: 25 Jan 2014
 *
 * Defines a class that represents a renderer for a Zuse app
 */
function Renderer()
{
  this.interpreter = new Interpreter();
}

Renderer.prototype.addMethod = function(name, method)
{
  this.interpreter.loadMethod(name, method);
};

Renderer.prototype.addObject = function(o)
{
  this.interpreter.loadObject({ id: o.id, properties: o.properties, code: o.code});
};

Renderer.prototype.triggerEventOnObjectWithParameters = function (event_name, object_id, params)
{
  this.interpreter.triggerEventOnObjectWithParameters(event_name, object_id, params);
};
