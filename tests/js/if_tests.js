// Simple if test
test("simple true test", function() {
  var i = new Interpreter();
  var exp = '{ "if" : { "test" : true, "true" : [true], "false" : [false] }}';
  console.log("hey");
  console.log(i.runJSON(exp));
  ok(i.runJSON(exp), "true evaluated to true");
});

test("simple true false", function() {
  var i = new Interpreter();
  var exp = '{ "if" : { "test" : false, "true" : [true], "false" : [false] }}';

  ok(!i.runJSON(exp), "false evaluated to false");
});

test("if without false", function() {
  var i = new Interpreter();
  var exp = '{ "if" : { "test" : false, "true" : [true]}}';

  equal(i.runJSON(exp), null, "if with no false returns null");
});

test("if with multiple suite statements", function() {
  var i = new Interpreter();
  var exp = '{ "if" : { "test" : true, "true" : [true, { "+" : [1,2]}]}}';

  equal(i.runJSON(exp), 3, "if with many suite statements");
});
