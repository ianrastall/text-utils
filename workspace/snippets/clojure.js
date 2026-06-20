// snippets/clojure.js
// Defines code snippets for the Clojure language (JVM target assumed for IO/Time/File)
// Applying escaping rules: \ -> \\ (for Clojure escapes like \n)
// Added leading/trailing newlines within template literals.

snippets.clojure = {
    randomNumber: `
(ns snippet.random
  (:require [clojure.string :as str])) ; Require string for join later if needed

;; Seed the random number generator (less common in Clojure, relies on Java's)
;; To use a specific seed, create a java.util.Random instance:
;; (def my-rng (java.util.Random. 12345))
;; (.nextInt my-rng)

;; Generate a random floating-point number between 0.0 (inclusive) and 1.0 (exclusive)
(let [random-float (rand)]
  (println (str "Random float [0.0, 1.0): " random-float)))

;; Generate a random integer between 0 (inclusive) and n (exclusive)
(let [max-exclusive 101 ; To get ints up to 100
      random-int-upto (rand-int max-exclusive)] ; [0, n)
  (println (str "Random integer [0-" (dec max-exclusive) "): " random-int-upto)))

;; Generate a random integer within a specific range [min, max] (inclusive)
;; Formula: min + (rand-int (inc (- max min)))
(let [min-val 10
      max-val 20
      random-int-range (+ min-val (rand-int (inc (- max-val min-val))))]
  (println (str "Random integer [" min-val "-" max-val "]: " random-int-range)))

;; Select a random element from a collection (vector or list)
(let [fruits ["apple" "banana" "cherry"]] ; Vector literal
  (when (seq fruits) ; Check if collection is not empty
    (let [random-fruit (rand-nth fruits)]
      (println (str "Random fruit: " random-fruit)))))

`,

    reverseString: `
(ns snippet.reverse
  (:require [clojure.string :as str])) ; Requires clojure.string namespace

(let [original-string "Clojure Lisp Dialect"]
  (println (str "Original: " original-string))

  ;; Use clojure.string/reverse (handles Unicode correctly)
  (let [reversed-string (str/reverse original-string)]
    (println (str "Reversed: " reversed-string)))

  ;; Example with Unicode
  (let [original-unicode "你好 Clojure"]
    (println (str "Original Unicode: " original-unicode))
    (println (str "Reversed Unicode: " (str/reverse original-unicode)))))

`,

    fibonacci: `
(ns snippet.fibonacci)

;; Calculate Nth Fibonacci number (0-indexed)
;; Clojure numbers auto-promote to handle arbitrary size (BigInt)

;; Method 1: Recursive with memoization (efficient for multiple calls)
(def fib-memo
  (memoize
   (fn [n]
     (cond
       (neg? n) (throw (IllegalArgumentException. "Input must be non-negative"))
       (zero? n) 0
       (= n 1) 1
       :else (+ (fib-memo (dec n)) (fib-memo (- n 2)))))))

;; Method 2: Tail-recursive using loop/recur (efficient, no stack overflow)
(defn fib-loop [n]
  (if (neg? n) (throw (IllegalArgumentException. "Input must be non-negative")))
  (loop [k n a 0 b 1]
    (cond
      (zero? k) a
      (= k 1) b
      :else (recur (dec k) b (+ a b))))) ; Tail call optimization

;; Generate first 'count' Fibonacci numbers using lazy sequence
(defn generate-fib-sequence [count]
   (if (neg? count) (throw (IllegalArgumentException. "Count must be non-negative")))
   (map first (take count (iterate (fn [[a b]] [b (+ a b)]) [0 1]))))
   ;; Or using fib-loop/fib-memo:
   ;; (mapv fib-loop (range count)) ; mapv creates a vector

;; Example Usage
(let [n 10]
  (println (str "Fibonacci number F(" n ") (loop): " (fib-loop n)))
  (println (str "Fibonacci number F(" n ") (memo): " (fib-memo n))))

(let [num-terms 15]
  (println (str "First " num-terms " Fibonacci numbers:"))
  ;; Print sequence (vectors print nicely)
  (println (generate-fib-sequence num-terms)))

;; Example with large number
(let [large-n 90]
  (println (str "Fibonacci number F(" large-n ") (loop): " (fib-loop large-n))))

`,

    factorial: `
(ns snippet.factorial)

;; Calculate Factorial N!
;; Clojure numbers auto-promote to handle arbitrary size (BigInt)

;; Method 1: Tail recursive using loop/recur
(defn factorial-loop [n]
  (if (neg? n) (throw (IllegalArgumentException. "Factorial input must be non-negative")))
  (loop [k n acc 1] ; Start accumulator at 1
    (if (zero? k)
      acc
      (recur (dec k) (* acc k))))) ; Tail recursive call

;; Method 2: Using reduce
(defn factorial-reduce [n]
   (if (neg? n) (throw (IllegalArgumentException. "Factorial input must be non-negative")))
   (if (zero? n)
     1
     (reduce *' (range 1 (inc n))))) ; reduce *' ensures BigInt multiplication

;; Example usage
(let [num 5]
  (println (str "Factorial of " num " (loop): " (factorial-loop num)))
  (println (str "Factorial of " num " (reduce): " (factorial-reduce num))))

(let [num-zero 0]
  (println (str "Factorial of " num-zero ": " (factorial-loop num-zero))))

(let [num-large 30]
  (println (str "Factorial of " num-large ": " (factorial-loop num-large))))

;; Example invalid input
;; Use try/catch to handle Java exceptions
(try
  (factorial-loop -3)
  (catch IllegalArgumentException e
    (println (str "Error calculating factorial: " (.getMessage e)))))

`,

    primeCheck: `
(ns snippet.prime)

;; Function to check if a number is prime
(defn is-prime? [n]
  (let [n (long n)] ; Ensure we work with longs for range
    (cond
      (<= n 1) false
      (<= n 3) true
      (zero? (rem n 2)) false ; Use rem for remainder
      (zero? (rem n 3)) false
      :else
      (let [limit (long (Math/sqrt n))] ; Java interop for sqrt
        ;; Check factors from 5 upwards, stepping by 6
        ;; Use loop/recur for efficiency
        (loop [i 5]
          (cond
            (> i limit) true ; Checked all divisors up to limit
            (zero? (rem n i)) false ; Divisible by i
            (zero? (rem n (+ i 2))) false ; Divisible by i+2
            :else (recur (+ i 6)))))))) ; Recurse to next pair

;; Example usage
(let [numbers-to-check [2 3 4 17 25 29 97 100 1 -5 1000000007]]
  (doseq [n numbers-to-check] ; Iterate through sequence
    (if (is-prime? n)
      (println (str n " is prime."))
      (println (str n " is not prime.")))))

`,

    readFile: `
(ns snippet.readfile
  (:require [clojure.java.io :as io]) ; For reader, file etc.
  (:import [java.io File BufferedReader])) ; For type hints or specific methods

;; Read content from a file (JVM target assumed)

(let [file-path "clojure_read_test.txt"
      dummy-content (str "Line 1 content from Clojure.\\n"
                         "This is the second line.\\n"
                         "End.")]

  ;; Create a dummy file for reading using 'spit'
  (try
    (spit file-path dummy-content) ; Overwrites/creates file
    (println (str "Created dummy file '" file-path "' for reading."))
    (catch Exception e
      (println (str "Error creating dummy file: " (.getMessage e)))
      (System/exit 1))) ; Exit if creation failed


  (println (str "\\n--- Reading file '" file-path "' ---"))

  (let [file (io/file file-path)] ; Create a File object
    (if (and (.exists file) (.isFile file))
      (try
        ;; Method 1: Read entire file into one string using 'slurp' (convenient)
        (println "\\n--- Reading using slurp ---")
        (let [content (slurp file)] ; Reads entire file
          (println "File content as single string:")
          (println content)
          (println "--- End of slurp ---"))


        ;; Method 2: Read line by line using 'line-seq' (lazy sequence)
        (println "\\n--- Reading line by line using line-seq ---")
        (with-open [rdr (io/reader file)] ; Ensures reader is closed
          (doseq [[line-num line] (map-indexed vector (line-seq rdr))]
            (println (str "Line " (inc line-num) ": " line)))) ; inc because map-indexed is 0-based
        (println "--- End of line-seq read ---")


        ;; Clean up dummy file
        (.delete file)
        (println (str "\\nCleaned up dummy file '" file-path "'."))

        (catch Exception e
          (println (str "An error occurred while reading/cleaning file: " (.getMessage e)))
          ;; Attempt cleanup again in case of read error
          (when (.exists file) (.delete file))))
      (println (str "Error: File not found or is not a regular file: '" file-path "'"))))

`,

    writeFile: `
(ns snippet.writefile
  (:require [clojure.java.io :as io])) ; For spit, file

;; Write or append text content to a file (JVM target assumed)

(let [file-path "output_clojure.txt"
      initial-lines ["First line written by Clojure."
                     "Second line using spit."]
      line-to-append "Third line, appended."]

  ;; --- Write using 'spit' (overwrites or creates) ---
  (println (str "--- Writing to '" file-path "' (overwrite) ---"))
  (try
    ;; Join lines with newline and write
    (spit file-path (str (clojure.string/join "\\n" initial-lines) "\\n"))
    (println (str "Successfully wrote initial content."))
    (catch Exception e
      (println (str "Error writing to '" file-path "': " (.getMessage e)))))


  ;; --- Append using 'spit' with :append true ---
  (println (str "\\n--- Appending to '" file-path "' ---"))
  (try
    (spit file-path (str line-to-append "\\n") :append true)
    (println (str "Successfully appended content."))
    (catch Exception e
      (println (str "Error appending to '" file-path "': " (.getMessage e)))))


  ;; --- Display final content (by reading back with slurp) ---
  (println (str "\\n--- Final content of '" file-path "': ---"))
  (let [file (io/file file-path)]
    (if (.exists file)
      (try
        (print (slurp file)) ; Print file content
        (catch Exception e
          (println (str "\\nError reading back file: " (.getMessage e)))))
      (println (str "File '" file-path "' not found for display."))))


  ;; Optional: Clean up
  ;; (let [f (io/file file-path)] (when (.exists f) (.delete f)))
)

`,

    fileExists: `
(ns snippet.fileexists
  (:require [clojure.java.io :as io]) ; For io/file
  (:import [java.io File])) ; For type hint on File object methods

;; Check if a file or directory exists using Java interop (JVM target assumed)

(defn check-path [^String path-str] ; Type hint for clarity
  (println (str "Checking: '" path-str "'"))
  (let [f (io/file path-str)] ; Create java.io.File object
    (cond
      (not (.exists f)) (println " -> Does NOT exist.")
      (.isFile f)      (println " -> Exists as a FILE.") ; Java method .isFile
      (.isDirectory f) (println " -> Exists as a DIRECTORY.") ; Java method .isDirectory
      :else            (println " -> Exists but is neither file nor directory (link?)."))))

;; Example Usage
(let [file-to-check "clojure_exists_test.clj"
      dir-to-check  "MyClojureFolder"
      non-existent  "NoSuchThingHereClj.xyz"]

  ;; Create dummy file/dir
  (println "Creating dummy file and directory...")
  (try
    (spit file-to-check ";; Clojure test file")
    (.mkdirs (io/file dir-to-check)) ; Java method .mkdirs
    (println (str "Created/Ensured dummies."))
    (catch Exception e (println (str "Error creating dummies: " (.getMessage e)))))


  (println "\\n--- Checking Paths --- ")
  (check-path file-to-check)
  (check-path dir-to-check)
  (check-path non-existent)


  ;; Clean up
  (println "\\nCleaning up...")
  (try
     (let [f1 (io/file file-to-check) f2 (io/file dir-to-check)]
       (when (.exists f1) (.delete f1))
       (when (.exists f2) (.delete f2))) ; .delete works for empty dir too
     (println "Cleanup attempt finished.")
     (catch Exception e (println (str "Error during cleanup: " (.getMessage e)))))
)

`,

    dateTime: `
(ns snippet.datetime
  ;; Uses Java 8+ java.time API via interop (JVM target assumed)
  (:import [java.time LocalDateTime ZonedDateTime Instant ZoneId]
           [java.time.format DateTimeFormatter]
           [java.util Locale]))

(println "--- Current Date and Time (using java.time) ---")
(let [^LocalDateTime now (LocalDateTime/now) ; Type hint for clarity
      ^ZonedDateTime zoned-now (ZonedDateTime/now)
      ^Instant       utc-now (Instant/now)]

  (println (str "LocalDateTime: " now))
  (println (str "ZonedDateTime: " zoned-now))
  (println (str "Instant (UTC): " utc-now))

  (println "\\n--- Common Formats (using DateTimeFormatter) ---")
  (println (str "ISO Local Date Time: " (.format now DateTimeFormatter/ISO_LOCAL_DATE_TIME)))
  (println (str "ISO Zoned Date Time: " (.format zoned-now DateTimeFormatter/ISO_ZONED_DATE_TIME)))
  (println (str "RFC 1123: " (.format zoned-now DateTimeFormatter/RFC_1123_DATE_TIME)))

  (println "\\n--- Custom Formats ---")
  (let [custom-formatter (DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm:ss")]
    (println (str "Custom ('yyyy-MM-dd HH:mm:ss'): " (.format now custom-formatter))))
  (let [readable-formatter (DateTimeFormatter/ofPattern "EEEE, MMMM dd, yyyy 'at' hh:mm:ss a zzzz" Locale/ENGLISH)]
    (println (str "Readable (English): " (.format zoned-now readable-formatter))))

  (println "\\n--- Components (using java.time accessors) ---")
  (println (str "Year: " (.getYear now)))
  (println (str "Month: " (.getMonthValue now) " (" (.getMonth now) ")"))
  (println (str "Day: " (.getDayOfMonth now)))
  (println (str "Hour: " (.getHour now)))
  (println (str "Minute: " (.getMinute now)))
  (println (str "Second: " (.getSecond now)))
  (println (str "NanoSecond: " (.getNano now)))
  (println (str "DayOfWeek: " (.getDayOfWeek now))) ; Enum MONDAY etc.
  (println (str "DayOfYear: " (.getDayOfYear now)))

  (println "\\n--- Unix Epoch Seconds ---")
  (let [epoch-seconds (.getEpochSecond utc-now) ; From Instant
        epoch-milli (.toEpochMilli utc-now)]
    (println (str "Seconds since epoch (UTC): " epoch-seconds))
    (println (str "Milliseconds since epoch (UTC): " epoch-milli)))
)

`,

    maxInArray: `
(ns snippet.maxarray)

;; Finding the maximum value in a Clojure collection (vector or list)

;; Example numeric vector
(let [numbers [10 5 42 17 8 99 32 -5 0]]
  (println (str "Vector: " numbers)) ; Vectors print nicely

  (if (empty? numbers)
    (println "Vector is empty, cannot find maximum.")
    (let [;; Use apply with max function (works on numbers)
          max-value (apply max numbers)
          ;; Alternatively use reduce
          ; max-value-reduce (reduce max numbers)
          ]
      (println (str "Maximum value: " max-value)))))


;; Finding the index (more complex, requires tracking during iteration)
(defn find-max-index [coll]
  (when (seq coll) ; Proceed only if collection is not empty
    (let [indexed-coll (map-indexed vector coll) ; Create pairs [index value]
          ;; Find the pair with the maximum value using reduce
          max-pair (reduce (fn [[idx1 val1] [idx2 val2]]
                             (if (> val2 val1) [idx2 val2] [idx1 val1]))
                           (first indexed-coll) ; Initial value is first pair
                           (rest indexed-coll))] ; Iterate over the rest
      (first max-pair)))) ; Return the index from the max pair

(let [numbers [10 5 42 17 8 99 32 -5 0]
      max-idx (find-max-index numbers)]
   (when max-idx (println (str "Index of maximum value: " max-idx))))


(println "\\n--- Other Examples ---")
;; Example string vector (lexicographical maximum using Clojure's compare)
(let [strings ["apple" "banana" "zebra" "cherry"]]
  (println (str "String vector: " strings))
  (println (str "Maximum value (lexicographical): " (apply max strings))))


;; Example empty vector
(let [empty-vec []]
  (println (str "\\nEmpty vector: " empty-vec))
  ;; (apply max empty-vec) ; This would throw ArityException
  (if (empty? empty-vec)
    (println "Cannot find maximum in empty vector.")))

;; Example vector with mixed comparable types
(let [mixed-numeric [10 5.5 42 17.0]]
  (println (str "\\nMixed numeric vector: " mixed-numeric))
  (println (str "Maximum value: " (apply max mixed-numeric)))) ; max handles mixed numerics


;; Example with incompatible types (max will throw ClassCastException)
;; (let [mixed-incompatible [1 "apple" 5]]
;;   (try (println (apply max mixed-incompatible))
;;        (catch Exception e (println (str "Error: " (.getMessage e))))))

`,

}; // End of snippets.clojure definition