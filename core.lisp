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

(def second (comp first rest))

(def not
  (λ (x)
    (cond
      x false
      #t #t)))
