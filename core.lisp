(def id {thing | thing})

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

(def second (comp first rest))

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

(def abs
  (λ (n)
    (if (< n 0) (- 0 n) n)))

(def repeat
  (λ (times body)
  ))
      
