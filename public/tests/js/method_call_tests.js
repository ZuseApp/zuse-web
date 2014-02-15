var f = function(a){
  return a[0]+1;
};

test("simple method call", function(){
  var i = new Interpreter();
  i.loadMethod("plusOne", f);
  var exp = '{ "call" : { "method" : "plusOne", "parameters" : [6] } }';

  equal(i.runJSON(exp), 7, "method plusOne was properly called");
});


