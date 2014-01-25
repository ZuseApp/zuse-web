/*
 * mathematical_tests.js
 *
 * Author: Andrew Butterfield
 * Date: 18 Jan 2014
 *
 * Contains all the tests for mathematical operations
 *
 */

// testing atomic
test("make sure that the interpreter properly returns a numeric atom", function() {
  var i = new Interpreter();

  equal(i.runJSON(5), 5);
});

// testing simple addition
test("add one number", function() {
  var i = new Interpreter();
  var exp = '{ "+" : [1] }';
  equal(i.runJSON(exp), 1);
});

test("add many number", function() {
  var i = new Interpreter();
  var exp = '{ "+" : [1,2,3,4,5] }';
  equal(i.runJSON(exp), 15);
});

// testing simple subtraction
test("subtract 2 number", function() {
  var i = new Interpreter();
  var exp = '{ "-" : [1,2] }';
  equal(i.runJSON(exp), -1);
});

test("subtract many number", function() {
  var i = new Interpreter();
  var exp = '{ "-" : [1,-2,-3,-4,-5] }';
  equal(i.runJSON(exp), 15);
});

test("subtract many positive and negative", function() {
  var i = new Interpreter();
  var exp = '{ "-" : [1,-2,-3,4,5] }';
  equal(i.runJSON(exp), -3);
});

// test simply multiplication
test("multiply 2 numbers", function() {
  var i = new Interpreter();
  var exp = '{ "*" : [6,-11] }';
  equal(i.runJSON(exp), -66);
});

test("multiply many numbers", function() {
  var i = new Interpreter();
  var exp = '{ "*" : [1,2,3,4,5] }';
  equal(i.runJSON(exp), 120);
});

// test simple division
test("divide 2 numbers", function() {
  var i = new Interpreter();
  var exp = '{ "/" : [5,8] }';
  equal(i.runJSON(exp), 0.625);
});

test("divide many numbers", function() {
  var i = new Interpreter();
  var exp = '{ "/" : [1,2,3,4,5] }';
  equal(i.runJSON(exp), 0.008333333333333333);
});

test("mod 2 numbers", function() {
  var i = new Interpreter();
  var exp = '{ "%" : [9,8] }';
  equal(i.runJSON(exp), 1);
});

test("mod many numbers", function() {
  var i = new Interpreter();
  var exp = '{ "%" : [100,13,2] }';
  equal(i.runJSON(exp), 1);
});


// nested expressions
test("addition, subtraction, multiplication", function() {
  var i = new Interpreter();
  var exp = '{ "+" : [100, {"-" : [2, { "*" : [5,-1] }, 3] },2] }';
  equal(i.runJSON(exp), 106);
});


