(def id {thing | thing})

(def map 
  (λ (fn list)
    (if (no list) 
      list
      (cons (fn (first list))
            (map fn (rest list))))))

(def second (comp first rest))

(def not
  (λ (x)
    (cond
      x false
      #t #t)))
