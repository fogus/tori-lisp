QUnit.test( "read forms", function(assert) {
  assert.deepEqual(lisp.read("a"), "'a", "symbols");
  assert.deepEqual(lisp.read("()"), [], "empty array");
  assert.deepEqual(lisp.read("(a)"), ["'a"], "array");
  assert.deepEqual(lisp.read("(+ 1 2)"), ["'+", 1, 2], "array");
  assert.deepEqual(lisp.read("(λ (a b) (+ a b))"), ["'λ", ["'a", "'b"], ["'+", "'a", "'b"]], "lambda");
  assert.deepEqual(lisp.read("{a b | (+ a b)}"), ["'λ", ["'a", "'b"], ["'+", "'a", "'b"]], "function literal form");  
  assert.deepEqual(lisp.read("'a"), ["'quote", "'a"], "quoted symbol");
  assert.deepEqual(lisp.read("'(a)"), ["'quote", ["'a"]], "quoted array");
  assert.deepEqual(lisp.read("'(a b (c (d)))"), ["'quote", ["'a", "'b", ["'c", ["'d"]]]], "quoted nested array");
});

