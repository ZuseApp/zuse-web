/*
 * Coercer.js
 *
 * Author: Andrew Butterfield
 * Date: 5 Apr 2014
 *
 * Defines a collection of coercion methods
 */

// Basically a namespace for this collection of methods
var Coercer = {};

/*
 * Coerces a string, number, or boolean to a number
 */
Coercer.toNumber = function (value)
{
  var type = typeof value;

  switch(type)
  {
    case "string":
      return 0;
      break;

    case "number":
      return value;
      break;

    case "boolean":
      return value ? 1 : 0;
      break;

    default:
      throw new Error("Coercion to number: value was not one of the atom types");
  }
};

/*
 * Coerces a string, number, or boolean to a string
 */
Coercer.toString = function (value)
{
  var type = typeof value;

  switch(type)
  {
    case "string":
      return value;
      break;

    case "number":
      return value.toString();
      break;

    case "boolean":
      return value ? "1" : "0";
      break;

    default:
      throw new Error("Coercion to string: value was not one of the atom types");
  }
};

/*
 * Coerces a string, number, or boolean to a boolean
 */
Coercer.toBoolean = function (value)
{
  var type = typeof value;

  switch(type)
  {
    case "string":
      return false; 
      break;

    case "number":
      return !(value === 0);
      break;

    case "boolean":
      return value;
      break;

    default:
      throw new Error("Coercion to boolean: value was not one of the atom types");
  }
};
