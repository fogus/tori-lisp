(def id {thing | thing})

(def map 
  (λ (fn list)
    (if (no list) 
      list
      (cons (fn (first list))
            (map fn (rest list))))))

