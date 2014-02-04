/*
 * compiler_tests.js
 *
 * Author: Andrew Butterfield
 * Date: 31 Jan 2014
 *
 * Contains all the tests for boolean operations
 *
 */

// set up code
var code = {
  traits: {
    Draggable: {
      parameters: {
        horizontal: true,
        vertical: true
      },
      code: [
        {
          "set": [
            "offset_x",
            0
          ]
        },
        {
          "set": [
            "offset_y",
            20
          ]
        },
        {
          on_event: {
            name: "start",
            code: [
              { get: "offset_y" }
            ]
          }
        }
      ]
    }
  },
  objects: [
    {
      id: "first",
      traits: {
        Draggable: {
          parameters: {
            vertical: false
          }
        }
      },
      properties: {
        x: 0,
        y: 0
      },
      code: []
    },
    {
      id: "second",
      properties: {
        x: 1,
        y: 1
      },
      code: []
    }
  ]
};

test("basic compiler", function() {
  var c = new Compiler( { project_json: code } );
  var i = c.getInterpreter();

  equal(i.triggerEventOnObjectWithParameters("start", "first", []), 20, "Triggering start event should return 20"); 
});
