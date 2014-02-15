/* 
 * Compiler.js
 *
 * Author: Andrew Butterfield
 * Date: 29 Jan 2014
 *
 * Defines a class that represents a compiler for a Zuse app
 *
 */

/*
 * Constructor
 */
function Compiler (options)
{
  this.program = options.project_json;
}

/*
 * Compiles traits into the objects 
 * and returns those objects
 */
Compiler.prototype.compile = function ()
{
  var traits = this.program.traits;

  // If there are no traits return the objects in the program
  if (!traits)
    return this.program.objects;

  // Create container for compiled objects
  var compiled_objects = [];

  // loop through the objects and compile the traits in
  for (var i = 0; i < this.program.objects.length; i++)
  {
    // Get current object
    var current_object = this.program.objects[i];

    // Check if object has code block, if not add one
    if (!("code" in current_object))
      current_object["code"] = [];

    // Check if the object has traits
    if (("traits" in current_object) && Object.keys(current_object["traits"]).length > 0)
    {
      // Loop through object traits
      for (var t in current_object["traits"])
      {
        // get global trait
        var global_trait = traits[t];
        var obj_trait = current_object["traits"][t];

        // check if global trait exists
        if (global_trait)
        {
          // Make a copy of the global_trait params
          var trait_params = Object.copy(global_trait["parameters"]);

          // replace default parameters with object specific parameters
          for (var k in obj_trait["parameters"])
            trait_params[k] = obj_trait["parameters"][k];

          // Create container for param expressions
          var param_expressions = [];

          // build up param_expressions to add set expression for params
          for (var k in trait_params)
            param_expressions.push({ set: [k, trait_params[k]]});

          // Create a new suite with set expressions and global trait code
          var new_suite = param_expressions.concat(global_trait["code"].slice(0));

          // Create a new statement to create a scope
          var new_statement = { scope: new_suite };

          // add statement to current object
          current_object["code"].push(new_statement);
        }
        // throw error if trait does not exists
        else
        {
          throw new Error("Unkown Trait: " + t); 
        }
      }
    }

    // Remove traits from object
    delete current_object["traits"];

    // Push the current object onto array of compiled objects
    compiled_objects.push(current_object);
  }

  // Return array of compiled objects
  return compiled_objects;

};

/*
 * Returns a new Interpreter with compiled objects
 * loaded into it
 */
Compiler.prototype.getInterpreter = function ()
{
  // Get the compilation
  var compilation = this.compile();

  // Make interpreter
  var i = new Interpreter();

  // Load the objects
  for (var j = 0; j < compilation.length; j++)
    i.loadObject(compilation[j]);

  // Return the preped interpreter
  return i;
};
