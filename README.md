# ToriLisp

An ersatz LISP for little birds.

An experiment in writing languages in JavaScript.

A code painting.

Run the ToriLisp REPL in a command shell with:

    node repl.js core.lisp

ToriLisp (TL) programs consists of expressions. The simplest expressions are things like numbers and strings, which evaluate to themselves.

    鳥> 9
    9
    
    鳥> "quack"
    "quack"

Several expressions enclosed within parentheses are also an expression.

These are called arrays.  When a list is evaluated, the elements are
evaluated from left to right, and the value of the first (presumably
a function) is passed the values of the rest.  Whatever it returns
is returned as the value of the expression.

    鳥> (+ 1 2)
    3

Here's what just happened.  First +, 1, and 2 were evaluated,
returning the plus function, 1, and 2 respectively.  1 and 2 were
then passed to the plus function, which returned 3, which was
returned as the value of the whole expression.

Since expression and evaluation are both defined recursively, 
programs can be as complex as you want:

    鳥> (+ (+ 1 2) (+ 3 (+ 4 5)))
    15

Putting the + before the numbers looks odd when you're used to
writing "1 + 2," but it has the advantage that + can do interesting things when given less than 2 arguments:

	鳥> (+ 1 2)
	3
    
	鳥> (+ 1) 
	<curried_fun/1>
	
This turns out to be a convenient property, especially when composing functions, which is a common thing to do in functional languages.

Lisp dialects like ToriLisp have a data type many languages don't:
symbols.  We've already seen one: + is a symbol.  Symbols don't
evaluate to themselves the way numbers and strings do.  They return
whatever value they've been assigned.

If we give foo the value 13, it will return 13 when evaluated:

    鳥> (def foo 13)
    13
	
    鳥> foo
    13

You can turn off evaluation by putting a single quote character
before an expression.  So 'foo returns the symbol foo.

    鳥> 'foo
    foo

Particularly observant readers may be wondering how we got away
with using foo as the first argument to `def`.  If the arguments are
evaluated left to right, why didn't this cause an error when foo
was evaluated?  There are some operators that violate the usual
evaluation rule, and `def` is one of them.  Its first argument isn't
evaluated.

If you quote an array, you get back the array itself.  

    鳥> (+ 1 2)   
    3
	
    鳥> '(+ 1 2)
    (+ 1 2)

The first expression returns the number 3.  The second, because it
was quoted, returns an array consisting of the symbol + and the numbers 1 and 2.

You can build up arrays with `cons`, which returns an array with a new
element on the front:

    鳥> (cons 'f '(a b))
    (f a b)

It doesn't change the original array:

    鳥> (def x '(a b))
    (a b)
	
	鳥> (cons 'f x)
    (f a b)
	
    鳥> x
    (a b)

The empty array is naturally represented by the form `()`, which evaluates to itself.  So to make an array of one element you say:

    鳥> (cons 'a ())
    (a)

You can take arrays apart with `first`, `head`, and `tail`, which return the first element and everything but the first element respectively:

    鳥> (first '(a b c))
    a
	
    鳥> (head '(a b c))
    (a)
	
    鳥> (tail '(a b c))
    (b c)

Using `cons` in sequence is one way to build an array:

    鳥> (cons 'a (cons 'b (cons 'c ())))
	(a b c)

But that's a bit inconvenient. Instead, ToriLisp provides another bit of syntax to build something that's array-like called a Vector:

    鳥> [1 2 3]
	[1 2 3]

Like arrays, Vectors can hold values of differing types:

    鳥> [1 'a '(b) [() "d" 3]]
	[1 a (b) [() "d" 3]]

Arrays and Vectors are useful in exploratory programming because they're so flexible.  You don't have to commit in advance to exactly what they represent.  For example, you can use a Vector of two numbers
to represent a point on a plane.  Some would think it more proper
to define a point object with two fields, x and y.  But if you use
Vectors to represent points, then when you expand your program to
deal with n dimensions, all you have to do is make the new code
default to zero for missing coordinates, and any remaining planar
code will continue to work.

Or if you decide to expand in another direction and allow partially
evaluated points, you can start using symbols representing variables
as components of points, and once again, all the existing code will
continue to work.

In exploratory programming, it's as important to avoid premature
specification as premature optimization. Along these lines I'll talk more about Vectors later.

One of the most exciting thing arrays can represent is code.  The arrays you build with cons are the same things programs are made out of.  This means you can write programs that write programs.  But first, I'll talk about functions.

We've already seen some functions: `+`, `cons`, `first`, `head`, and `tail`.  You can define new ones with `def`, which takes a symbol to use as the name and a function. A function is denoted using curly braces to enclose its parameters, a Vector of symbols representing the parameters, and then zero or more expressions called the body.  When the function is called, those expressions will be evaluated in order with the symbols in the body temporarily set ("bound") to the corresponding argument. Whatever the last expression returns will be returned as the value of the call.

    鳥> (def average {[x y] (/ (+ x y) 2)})
    <fun/2>
	
	鳥> (average 2 4)
	3

The body of the function consists of one expression, `(/ (+ x y) 2)`. It's common for functions to consist of one expression; in purely functional code (code with no side-effects) they probably always should.

What's the strange-looking object returned as the value of the def expression?  That's what a function handle looks like. In ToriLisp, as in most Lisps, functions are a data type, just like numbers or strings.

As the literal representation of a string is a series of characters surrounded by double quotes, the literal representation of a function is a "block," followed by parameters, followed by a body.  So you could represent a function to return the average of two numbers as:

    鳥> {[x y] (/ (+ x y) 2)}
    <fun/2>

And of course you can use a literal function wherever you could use
a symbol whose value is one, e.g.

    鳥> ({[x y] (/ (+ x y) 2)} 2 4)
    3

This expression has three elements, `{[x y] (/ (+ x y) 2)}`, which yields a function that returns averages, and the numbers 2 and 4. So when you evaluate all three expressions and pass the values of the second and third to the value of the first, you pass 2 and 4 to a function that returns averages, and the result is 3.

There's one thing you can't do with functions that you can do with
data types like symbols and strings: you can't print them out in a
way that could be read back in.  The reason is that the function 
could be a closure; displaying closures is a tricky problem.



(def  L [1 2 3])
[1 2 3]

(L^[?..] 42)
[42 1 2 3]

(L^[..?] 42)
[1 2 3 42]

(L^[?..])
1

(L^[..?])
3

