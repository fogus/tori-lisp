QUnit.test( "read forms", function(assert) {
  assert.deepEqual(lisp.read("25"), 25, "int number");
  assert.deepEqual(lisp.read("0.5"), 0.5, "decimal number");
  assert.deepEqual(lisp.read("\"foo\""), 'foo', "string");
  assert.deepEqual(lisp.read("a"), "'a", "symbols");
  assert.deepEqual(lisp.read("()"), [], "empty array");
  assert.deepEqual(lisp.read("[]"), ["'list"], "empty list literal");
  assert.deepEqual(lisp.read("(a)"), ["'a"], "array");
  assert.deepEqual(lisp.read("[a]"), ["'list", "'a"], "list literal");
  assert.deepEqual(lisp.read("(+ 1 2)"), ["'+", 1, 2], "array");
  assert.deepEqual(lisp.read("(λ (a b) (+ a b))"), ["'λ", ["'a", "'b"], ["'+", "'a", "'b"]], "lambda");
  assert.deepEqual(lisp.read("{a b | (+ a b)}"), ["'λ", ["'a", "'b"], ["'+", "'a", "'b"]], "function literal form");  
  assert.deepEqual(lisp.read("'a"), ["'quote", "'a"], "quoted symbol");
  assert.deepEqual(lisp.read("'(a)"), ["'quote", ["'a"]], "quoted array");
  assert.deepEqual(lisp.read("'(a b (c (d)))"), ["'quote", ["'a", "'b", ["'c", ["'d"]]]], "quoted nested array");
});

QUnit.test( "math", function(assert) {
  assert.deepEqual(lisp.evil("(+ 1 2)"), 3, "simple add");
  assert.deepEqual(lisp.evil("(+ (+ 1 2) (+ 3 (+ 4 5)))"), 15, "nested add");
  assert.throws(() => lisp.evil("(+ 1 2 3)"), Error, "wrong add args count");
  assert.deepEqual(lisp.evil("(- 1 2)"), -1, "simple sub");
  assert.deepEqual(lisp.evil("(* 100 2)"), 200, "simple mult");
  assert.deepEqual(lisp.evil("(/ 1 2)"), 0.5, "simple div");
});

QUnit.test( "curried functions", function(assert) {
  var curriedAdd = lisp.evil("(+ 1)");

  assert.ok((typeof curriedAdd) === 'function');
  assert.equal(curriedAdd(2), 3);
});

QUnit.test( "def", function(assert) {
  assert.ok(lisp.evil("(def foo 13)"));
  assert.equal(lisp.evil("foo"), 13);
});

QUnit.test( "quote", function(assert) {
  assert.equal(lisp.evil("'foo"), "'foo");
});
