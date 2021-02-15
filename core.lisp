(def id {thing | thing}
  "Returns whatever it's given, unchanged.")

(def dec {n | (- n 1)})
(def inc (+ 1))

(def always {e | {e}})

(def map 
  (λ (fn list)
    (if (no list) 
      list
      (cons (fn (first list))
            (map fn (rest list))))))

(def reduce
  (λ (fn init list)
    (if (no list)
      init
      (reduce fn 
              (fn init (first list))
              (rest list)))))

(def foldr
  (λ (fn init list)
    (if (no list)
      init
      (fn (first list)
          (foldr fn init (rest list))))))

(def filter
  (λ (fn list)
    (if (no list)
      list
      (if (fn (first list))
        (cons (first list) (filter fn (rest list)))
        (filter fn (rest list))))))

(def remove
  (λ (fn list)
    (if (no list)
      list
      (if (fn (first list))
        (remove fn (rest list))
        (cons (first list) (remove fn (rest list)))))))      

(def append
  (λ (l r)
    (if (no l)
      r
      (cons (first l) (append (rest l) r)))))

(def reverse
  (λ (list)
    (reduce {acc x | (cons x acc)} nil list)))

(def member
  (λ (test? list)
     (cond
       (no list) undefined
       (test? (first list)) (first list)
       #t (member test? (rest list))))
  "Checks a list given a test function and returns the first element that matches.")

(def union
  (λ (l r)
     (cond
       (no l) r
       (member (eqv? (first l)) r) (union (rest l) r)
       #t (cons (first l) (union (rest l) r))))
  "Set union of two lists.")

(def intersection
  (λ (l r)
     (cond
       (no l) nil
       (member (eqv? (first l)) r) (cons (first l) (intersection (rest l) r))
       #t (intersection (rest l) r)))
  "Set intersection of two lists.")

(def second (comp first rest))
(def third  (-> rest rest first))

(def not
  (λ (x)
    (cond
      x false
      #t #t)))

(def when
  (λ (condition body)
    (if (condition)
      (body)
      nil))
  "Takes two functions and returns the result of the second when the first returns a truthy value.")

(def abs {n | (if (< n 0) (- 0 n) n)})

(def repeat
  (λ (times body!)
     (if (<= times 0)
       nil
       (do
         (body!)
         (repeat (dec times) body!))))
  "Takes a number and a function and executes the functions the given number of times.")

(def take
  (λ (n list)
     (if (<= n 0)
       nil
       (cons (first list)
             (take (dec n) (rest list)))))
  "Returns the first n number of elements from a given list.")

(def drop
  (λ (n list)
     (if (<= n 0)
       list
       (drop (dec n) (rest list))))
  "Removes the first n number of elements from a given list.")

(def split
  (λ (n list)
     (cons (take n list)
           (cons (drop n list) nil))))

(def null? {x | (is? x js/null)})

(def zero? {n | (is? n 0)})
(def pos?  {n | (> n 0)})
(def neg?  {n | (< n 0)})

(def odd?  {n | (is? (mod n 2) 1)})
(def even? (comp not odd?))

(def math/logn {n base | (/ (math/log n) (math/log base))})

(def math/pow {x y | (math/exp (* y (math/log x)))})

(def math/sec {x | (/ 1 (math/cos x))})
(def math/csc {x | (/ 1 (math/sine x))})
(def math/tan {x | (/ (math/sine x) (math/cos x))})
(def math/cot {x | (/ (math/cos x) (math/sine x))})



(def Y
  (λ (f)
     ({x | (f (x x))}
      {x | (f (x x))})))

(def fib0
  (λ (f)
     (λ (n)
        (cond (is? n 0) 1
              (is? n 1) 1
              #t (+ (f (- n 1))
                    (f (- n 2)))))))

