/*
 * boolean_tests.js
 *
 * Author: Andrew Butterfield
 * Date: 21 Jan 2014
 *
 * Contains all the tests for boolean operations
 *
 */

// testing atomic
test("make sure that the interpreter properly returns a boolean atom", function() {
  var i = new Interpreter();

  equal(i.runJSON(true), true);
  equal(i.runJSON(false), false);
});

// testing greater than
test("greater than with numbers -> true", function() {
  var i = new Interpreter();
  var exp = '{ ">" : [2, 1] }';
  equal(i.runJSON(exp), true);
});

test("greater than with numbers -> false", function() {
  var i = new Interpreter();
  var exp = '{ ">" : [1, 2] }';
  equal(i.runJSON(exp), false);
});

test("greater than with numeric expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ ">" : [ { "+" : [1,2] }, { "-" : [1, 3] } ] }';
  equal(i.runJSON(exp), true);
});

// testing greater than or equal to
test("greater than or equal with numbers -> true", function() {
  var i = new Interpreter();
  var exp = '{ ">=" : [2, 1] }';
  equal(i.runJSON(exp), true);
});

test("greater than or equal with numbers -> false", function() {
  var i = new Interpreter();
  var exp = '{ ">=" : [1, 2] }';
  equal(i.runJSON(exp), false);
});

test("greater than or equal with numbers (equal) -> true", function() {
  var i = new Interpreter();
  var exp = '{ ">=" : [2, 2] }';
  equal(i.runJSON(exp), true);
});

test("greater than or equal to with numeric expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ ">=" : [ { "+" : [1,2] }, { "-" : [1, 3] } ] }';
  equal(i.runJSON(exp), true);
});

// testing less than
test("less than with numbers -> false", function() {
  var i = new Interpreter();
  var exp = '{ "<" : [2, 1] }';
  equal(i.runJSON(exp), false);
});

test("less than with numbers -> true", function() {
  var i = new Interpreter();
  var exp = '{ "<" : [1, 2] }';
  equal(i.runJSON(exp), true);
});

test("less than with numeric expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "<" : [ { "+" : [1,2] }, { "-" : [1, 3] } ] }';
  equal(i.runJSON(exp), false);
});

// testing less than or equal to
test("less than or equal with numbers -> false", function() {
  var i = new Interpreter();
  var exp = '{ "<=" : [2, 1] }';
  equal(i.runJSON(exp), false);
});

test("less than or equal with numbers -> true", function() {
  var i = new Interpreter();
  var exp = '{ "<=" : [1, 2] }';
  equal(i.runJSON(exp), true);
});

test("less than or equal with numbers (equal) -> true", function() {
  var i = new Interpreter();
  var exp = '{ "<=" : [2, 2] }';
  equal(i.runJSON(exp), true);
});

test("less than or equal to with numeric expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "<=" : [ { "+" : [1,2] }, { "-" : [1, 3] } ] }';
  equal(i.runJSON(exp), false);
});

// testing equals
test("equals numeric expresssions -> true", function() {
  var i = new Interpreter();
  var exp = '{ "==" : [ 1, 1 ] }';
  equal(i.runJSON(exp), true);
});

test("equals numeric expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "==" : [ 1, 2 ] }';
  equal(i.runJSON(exp), false);
});

test("equals numeric/string expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "==" : [ "1", 1 ] }';
  equal(i.runJSON(exp), false);
});

test("equals numeric/boolean expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "==" : [ true, 1 ] }';
  equal(i.runJSON(exp), false);
});

test("equals string expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "==" : [ "hey", "he" ] }';
  equal(i.runJSON(exp), false);
});

test("equals string expresssions -> true", function() {
  var i = new Interpreter();
  var exp = '{ "==" : [ "hey", "hey" ] }';
  equal(i.runJSON(exp), true);
});

// testing not equals
test("not equals numeric expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "!=" : [ 1, 1 ] }';
  equal(i.runJSON(exp), false);
});

test("not equals numeric expresssions -> true", function() {
  var i = new Interpreter();
  var exp = '{ "!=" : [ 1, 2 ] }';
  equal(i.runJSON(exp), true);
});

test("not equals numeric/string expresssions -> true", function() {
  var i = new Interpreter();
  var exp = '{ "!=" : [ "1", 1 ] }';
  equal(i.runJSON(exp), true);
});

test("not equals numeric/boolean expresssions -> true", function() {
  var i = new Interpreter();
  var exp = '{ "!=" : [ true, 1 ] }';
  equal(i.runJSON(exp), true);
});

test("not equals string expresssions -> true", function() {
  var i = new Interpreter();
  var exp = '{ "!=" : [ "hey", "he" ] }';
  equal(i.runJSON(exp), true);
});

test("not equals string expresssions -> false", function() {
  var i = new Interpreter();
  var exp = '{ "!=" : [ "hey", "hey" ] }';
  equal(i.runJSON(exp), false);
});

// testing and
test("simple and -> true", function() {
  var i = new Interpreter();
  var exp = '{ "and" : [true, true, true] }';
  equal(i.runJSON(exp), true);
});

test("simple and -> false", function() {
  var i = new Interpreter();
  var exp = '{ "and" : [true, true, true, false] }';
  equal(i.runJSON(exp), false);
});

test("complex and -> true", function() {
  var i = new Interpreter();
  var exp = '{ "and" : [ { "<" : [1,100] }, { ">": [8,4] },  {"==" : ["hi", "hi"] }, true] }';
  equal(i.runJSON(exp), true);
});

// testing or
test("simple or -> true", function() {
  var i = new Interpreter();
  var exp = '{ "or" : [false, false, true] }';
  equal(i.runJSON(exp), true);
});

test("simple or -> false", function() {
  var i = new Interpreter();
  var exp = '{ "or" : [false, false, false] }';
  equal(i.runJSON(exp), false);
});

test("complex or -> false", function() {
  var i = new Interpreter();
  var exp = '{ "or" : [ { ">" : [1,100] }, { "<": [8,4] },  {"!=" : ["hi", "hi"] }, false] }';
  equal(i.runJSON(exp), false);
});

test("complex or -> true", function() {
  var i = new Interpreter();
  var exp = '{ "or" : [ { ">" : [1,100] }, { "<": [8,4] },  {"!=" : ["hi", "hi"] }, true] }';
  equal(i.runJSON(exp), true);
});
