(def id {thing | thing}
  "Returns whatever it's given, unchanged.")

(def dec {n | (- n 1)})
(def inc (+ 1))

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
    (reduce {a x | (cons x a)} nil list)))

(def member
  (λ (test? list)
     (cond
       (no list) undefined
       (test? (first list)) (first list)
       #t (member test? (rest list)))))

(def union
  (λ (l r)
     (cond
       (no l) r
       (member (eqv? (first l)) r) (union (rest l) r)
       #t (cons (first l) (union (rest l) r)))))

(def intersection
  (λ (l r)
     (cond
       (no l) nil
       (member (eqv? (first l)) r) (cons (first l) (intersection (rest l) r))
       #t (intersection (rest l) r))))

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
      nil)))

(def abs {n | (if (< n 0) (- 0 n) n)})

(def repeat
  (λ (times body!)
     (if (<= times 0)
       nil
       (do
         (body!)
         (repeat (dec times) body!)))))

