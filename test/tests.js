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

QUnit.test( "function literals", function(assert) {
  assert.equal(lisp.evil("({x y | (/ (+ x y) 2)} 2 4)"), 3);
});

QUnit.test( "curried functions", function(assert) {
  var curriedAdd = lisp.evil("(+ 1)");

  assert.ok((typeof curriedAdd) === 'function');
  assert.equal(curriedAdd(2), 3);

  var avg = lisp.evil("(def average {x y | (/ (+ x y) 2)})");
  assert.ok((typeof avg) === 'function');
  assert.equal(avg(2, 4), 3);

  var curriedAvg = avg(2);
  assert.ok((typeof curriedAvg) === 'function');
  assert.equal(curriedAvg(4), 3);
});

QUnit.test( "function meta", function(assert) {
  var avg = lisp.evil("(def average {x y | (/ (+ x y) 2)})");
  assert.ok((typeof avg) === 'function');

  assert.deepEqual(lisp.evil("(meta/body average)"), [ [ "'/", [ "'+", "'x", "'y" ], 2 ] ], "function body");
  assert.deepEqual(lisp.evil("(meta/params average)"), [ "'x", "'y" ], "function params");
});

QUnit.test( "def", function(assert) {
  assert.ok(lisp.evil("(def foo 13)"));
  assert.equal(lisp.evil("foo"), 13);

  assert.ok(lisp.evil("(def x '(a b))"));
  assert.ok(lisp.evil("(cons 'f x)"));
  assert.deepEqual(lisp.evil("x"), ["'a", "'b"], "list unchanged");
});

QUnit.test( "quote", function(assert) {
  assert.equal(lisp.evil("'foo"), "'foo");
});

QUnit.test( "lists", function(assert) {
  assert.deepEqual(lisp.evil("(cons 'a nil)"), ["'a"]);
  assert.deepEqual(lisp.evil("(first '(a b c))"), "'a");
  assert.deepEqual(lisp.evil("(rest '(a b c))"), ["'b", "'c"]);
  assert.deepEqual(lisp.evil("(head '(a b c))"), ["'a"]);
  assert.deepEqual(lisp.evil("(list 'a 1 \"foo\" '(b))"), [ "'a", 1, 'foo', [ "'b" ] ]);
  assert.deepEqual(lisp.evil("['a 1 \"foo\" ['b]]"), [ "'a", 1, 'foo', [ "'b" ] ]);

  assert.deepEqual(lisp.evil("(part 2 [1 2 3 4 5 6])"), [ [1, 2], [3, 4], [5, 6] ]);
  assert.deepEqual(lisp.evil("(part 2 [1 2 3 4 5])"), [ [1, 2], [3, 4], [5] ]);
  assert.deepEqual(lisp.evil("(part 3 [1 2 3 4 5 6])"), [ [1, 2, 3], [4, 5, 6] ]);
  assert.deepEqual(lisp.evil("(part 3 [1 2 3 4])"), [ [1, 2, 3], [4] ]);

  assert.deepEqual(lisp.evil("(sort < '(2 9 3 7 5 1))"), [ 1, 2, 3, 5, 7, 9 ], "sorting a list <");
  assert.deepEqual(lisp.evil("(sort {l r | (< (len l) (len r))} '(\"orange\" \"pea\" \"apricot\" \"apple\"))"), [ 'pea', 'apple', 'orange', 'apricot' ], "sorting a list w/ a custon function");
  assert.deepEqual(lisp.evil("(sort {l r | (< (len l) (len r))} '(\"aa\" \"bb\" \"cc\"))"), [ 'aa', 'bb', 'cc' ], "stable sorting");
});

QUnit.test( "strings", function(assert) {
  assert.equal(lisp.evil("(\"foo\" 0)"), 'f', "one arg");
  assert.equal(lisp.evil("(\"foo\" 0 2)"), 'fo', "two args");
  assert.equal(lisp.evil("(str 99 \" bottles of \" 'bee ['r])"), '99 bottles of bee[r]');
});

QUnit.test( "let", function(assert) {
  assert.equal(lisp.evil("(let (x 1) (+ x (* x 2)))"), 3, "let w/ one bind");
  assert.equal(lisp.evil("(let (x 1) (+ x (* x 2)) x)"), 1, "let w/ one bind but multiple body forms");
  assert.equal(lisp.evil("(let (x 3 y 4) (+ (* x 2) (* y 2)))"), 14, "let w/ two binds");
});

QUnit.test( "if", function(assert) {
  assert.equal(lisp.evil("(if (odd? 1) 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if (even? 1) 'a 'b)"), "'b");
  assert.equal(lisp.evil("(if nil 'a 'b)"), "'b");
  assert.equal(lisp.evil("(if undefined 'a 'b)"), "'b");
  assert.equal(lisp.evil("(if #t 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if true 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if #f 'a 'b)"), "'b");
  assert.equal(lisp.evil("(if false 'a 'b)"), "'b");
  assert.equal(lisp.evil("(if [1 2 3] 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if 1 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if 0 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if -1 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if (hash 'a 1) 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if \"a\" 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if 'truthy 'a 'b)"), "'a");
  assert.equal(lisp.evil("(if #t (do 1 2)))"), 2);
  assert.equal(lisp.evil("(if #t 1)"), 1);
  assert.equal(lisp.evil("(if #f 1)"), undefined);
  assert.equal(lisp.evil("(if \"\" 'a 'b)"), "'a");
  assert.throws(() => lisp.evil("(if doesnetexist 'a 'b)"), Error, "non-bound var");
});

QUnit.test( "len", function(assert) {
  assert.equal(lisp.evil("(len [1 2 3])"), 3);
  assert.equal(lisp.evil("(len \"abc\")"), 3);
  assert.equal(lisp.evil("(len {a | a})"), 1);
  assert.equal(lisp.evil("(len {})"), 0);
  assert.equal(lisp.evil("(len +)"), 2);
});

QUnit.test( "is?", function(assert) {
  assert.ok(lisp.evil("(is? 'a 'a)"));
  assert.ok(lisp.evil("(is? \"foo\" \"foo\")"));
  assert.ok(lisp.evil("(let (x ['a]) (is? x x))"));
  assert.ok(lisp.evil("(let (x 'c) (or (is? x 'a) (is? x 'b) (is? x 'c)))"));
  assert.notOk(lisp.evil("(is? ['a] ['a])"));
});

QUnit.test( "eqv?", function(assert) {
  assert.ok(lisp.evil("(eqv? ['a] ['a])"));
});

QUnit.test( "comp, juxt, ->", function(assert) {
  assert.deepEqual(lisp.evil("((comp first rest) '(1 2 3))"), 2);
  assert.deepEqual(lisp.evil("((juxt first rest) '(1 2 3))"), [ 1, [ 2, 3 ] ]);
});

QUnit.test( "hash maps", function(assert) {
  assert.deepEqual(lisp.evil("(hash 'x 1 'y 2)"), new Map([["'x", 1], ["'y", 2]]));
  assert.deepEqual(lisp.evil("(let (m (hash 'x 1 'y 2)) (get m 'x))"), 1);
  assert.deepEqual(lisp.evil("(let (m (hash 'x 1 'y 2)) (get m 'a))"), undefined);
  assert.deepEqual(lisp.evil("(let (m (hash 'x 1 'y 2)) (m 'x))"), 1);

  lisp.evil("(def codes (hash \"Boston\" 'bos \"San Francisco\" 'sfo \"Paris\" 'cdg))");
  assert.deepEqual(lisp.evil("(keys codes)"), [ 'Boston', 'San Francisco', 'Paris' ]);
  assert.deepEqual(lisp.evil("(pairs codes)"), [ [ 'Boston', "'bos" ], [ 'San Francisco', "'sfo" ], [ 'Paris', "'cdg" ] ]);
});

QUnit.test( "lists as stacks", function(assert) {
  lisp.evil("(def x '(c a b))");
  assert.deepEqual(lisp.evil("(pop x)"), [ "'a", "'b" ]);
  assert.deepEqual(lisp.evil("x"), [ "'c", "'a", "'b" ]);
  assert.deepEqual(lisp.evil("(push x 'f)"), [ "'f", "'c", "'a", "'b" ]);
  assert.deepEqual(lisp.evil("x"), [ "'c", "'a", "'b" ]);
});

QUnit.test( "apply", function(assert) {
  assert.equal(lisp.evil("(apply + '(1 2))"), 3);

  var p1 = lisp.evil("(apply + '(1))");
  assert.ok((typeof p1) === 'function');

  assert.equal(p1(2), 3);
  assert.equal(lisp.evil("((apply + '(1)) 2)"), 3);
});
