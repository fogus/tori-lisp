(def mylen 
  (λ (xs)
     (if (no xs)
       0
       (+ 1 (mylen (rest xs))))))

(check {(mylen nil)}      is? 0 "Testing that mylen of nil is 0")
(check {(mylen '(a b c))} is? 3 "Testing that mylen of a list is 3")
(check {(mylen [1 2 3])}  is? 3 "Testing that mylen of a list literal is 3")

(def translate 
  (λ (sym)
     (cond
       (is? sym 'apple) 'mela 
       (is? sym 'onion) 'cipolla
       #t 'che?)))

(check {(translate 'apple)}  is? 'mela "Testing that translate works.")
(check {(translate 'syzygy)} is? 'che? "Testing that translate works.")


(check {(map (+ 10) '(1 2 3))} eqv? [ 11, 12, 13 ] "Testing that a curried function works with map.")
(check {(map (comp first rest) '((a b) (c d) (e f)))} eqv? [ 'b 'd 'f ] "Testing that a composed function works with map.")
(check {(map (comp not odd?) '(1 2 3 4 5 6))} eqv? [ #f #t #f #t #f #t ] "Testing that a composed function works with map and not.")

(check {(filter odd? '(1 2 3 4 5 6 7))} eqv? [1 3 5 7] "Testing filter.")
(check {(remove odd? '(1 2 3 4 5 6 7))} eqv? [2 4 6] "Testing remove.")
