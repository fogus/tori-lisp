QUnit.test( "runtime defun", function(assert) {
  var inc = lisp.defun((function(n){ return n + 1 }), 1);
  
  assert.equal( inc.apply(null, [1]), 2, "An inc function returns the expected value");

  var add = lisp.defun((function(a,b){ return a+b }), 2);
  
  assert.equal(add.apply(null, [1,3]), 4, "An add function returns the expected value");

  assert.throws(function() { return add.apply(null, [1,2,3]) },
		new Error('Invalid arity: 3'),
		"An add function called with too many args throws and arity error.");

  var thunk = add.apply(null, [1]);
  assert.ok(thunk instanceof lisp.Thunk, "less args to a function returns a Thunk object.");		 
});


QUnit.test( "thunks", function(assert) {
  var add = lisp.defun((function(a,b) { return a + b; }), 2);
  var add1 = add.apply(null, [1]);

  assert.ok(add1 instanceof lisp.Thunk, "less args to a function returns a Thunk object.");		 
  assert.equal(add1.apply(null, [1]), 2, "A thunked funtion resolves when getting its last arg.");
  
  var sum = lisp.defun((function(a,b,c) { return a + b + c; }), 3);
  var sum1 = sum.apply(null, [1]);
  var sum2 = sum1.apply(null, [2]);

  assert.ok(sum1 instanceof lisp.Thunk, "less args to a function returns a Thunk object.");
  assert.ok(sum2 instanceof lisp.Thunk, "less args to a function returns a Thunk object.");
  assert.equal(sum2.apply(null, [3]), 6, "A double thunked funtion resolves when getting its last arg.");
});


QUnit.test( "read forms", function(assert) {
  assert.deepEqual(lisp.read("a"), "'a", "symbols");
  assert.deepEqual(lisp.read("|"), "'|", "symbols");
  assert.deepEqual(lisp.read("()"), [], "empty array");
  assert.deepEqual(lisp.read("(a)"), ["'a"], "array");
  assert.deepEqual(lisp.read("(+ 1 2)"), ["'+", 1, 2], "array");
  assert.deepEqual(lisp.read("(λ (a b) (+ a b))"), ["'λ", ["'a", "'b"], ["'+", "'a", "'b"]], "function form");
});

