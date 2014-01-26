test("get with empty object throw error", function(){
  var i = new Interpreter();
  var exp = '{ "get" : "foo"}';

  throws(function() { i.runJSON(exp); },
    "Free variable: foo",
    "Properly throws error when property doesn't exist in context");
});

test("set return null", function(){
  var i = new Interpreter();
  var exp = '{ "set" : [ "foo", 1 ]}';

  equal(i.runJSON(exp), null, "set should return null");
});

test("get returns loaded object's property", function(){
  var i = new Interpreter();
  i.loadObject({ id: "a", properties: { x: 1 }, code: [] });
  var exp = { "get" : "x"};

  equal(i.runCodeWithContext(exp, "a"), 1, "get returns value of x in object a");
});

test("set creates new property", function(){
  var i = new Interpreter();
  var exp = '{ "code" : [{ "set" : [ "foo", 1 ]}, { "get" : "foo" } ] }';

  equal(i.runJSON(exp), 1, "get returns new variable's value");
});

test("set updates existing property", function(){
  var i = new Interpreter();
  i.loadObject({ id: "a", properties: { x: 1 }, code: [] });
  var exp = { code : [
                { set : [ "x", 14 ] },
                { get : "x" }
              ]
            };

  equal(i.runCodeWithContext(exp, "a"), 14, "get returns value of x after it was set");
});

