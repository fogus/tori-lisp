(def id {thing | thing})

(def map 
  (λ (fn list)
    (if (no list) 
      list
      (cons (fn (first list))
            (map fn (rest list))))))

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
      
