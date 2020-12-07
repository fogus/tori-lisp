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

(check {(translate 'apple)} is? 'mela "Testing that translate works.")
