# ToriLisp

An ersatz LISP for little birds.

An experiment in writing languages in JavaScript.

A code painting.

An alternative to solving jigsaw puzzles.

## Introduction

Run the ToriLisp REPL in a command shell with:

    node repl.js core.lisp core-tests.lisp

ToriLisp (TL) programs consists of expressions. The simplest expressions 
are things like numbers and strings, which evaluate to themselves.

    鳥> 9
    9
    
    鳥> "quack"
    'quack'

A more extensive walk-through of the language is given in the tut.txt
file in this repository.

## Notes

The seeds of ToriLisp come from Mary Rose Cook's lovely 
[Little Lisp](https://github.com/maryrosecook/littlelisp) and takes
the MIT license from it.

At the moment symbols are encoded as strings containing a single quote
followed by the lexematic representation of the symbol. This encoding
may change and should be relied on to remain stable.

## Dev

Make changes and then try them out in node or in the index.html, but run the following first:

    python3 -m http.server 8888

And then visit <http://localhost:8888/index.html>.

## References

- [Arc tutorial](http://www.arclanguage.org/tut.txt)
- [Equal Rights for Functional Objects or, The More Things Change, The More They Are the Same](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.23.9999) by Henry Baker
- [LISP 1.5 Programmer's Manual](http://www.softwarepreservation.org/projects/LISP/book/LISP%201.5%20Programmers%20Manual.pdf/view) by McCarthy, et al.
- [Little Lisp](https://github.com/maryrosecook/littlelisp) by Mary Rose Cook
- [Misp Chronicles, The](https://web.archive.org/web/20111109113907/http://cubiclemuses.com/cm/blog/2007/misp_final.html?showcomments=yes) by William Taysom
- [ML for the Working Programmer](https://www.amazon.com/ML-Working-Programmer-2nd-Paulson/dp/052156543X/?tag=fogus-20) by L.C. Paulson
