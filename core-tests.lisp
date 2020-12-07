(def mylen 
  (λ (xs)
     (if (no xs)
       0
       (+ 1 (mylen (rest xs))))))

(check {(mylen nil)} is? 1 "Testing that mylen of nil is 0")
