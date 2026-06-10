> © 2024 Gaurav Patil — GoForge Platform. All rights reserved.

# Go Testing & Benchmarking — Coding Practice (Part 1: Levels 1-3)

Level 1 — Beginner (Q1-Q3):
Q1: Basic unit test with testing.T
Q2: Test that checks an error is returned
Q3: Test with t.Log and t.Fatal

Level 2 — Easy (Q4-Q7):
Q4: Table-driven test pattern (5+ cases)
Q5: Subtest with t.Run for grouped cases
Q6: Test a pure function with edge cases
Q7: t.Cleanup for test teardown

Level 3 — Medium (Q8-Q12):
Q8: Parallel subtest with t.Parallel()
Q9: Mock an interface dependency in a test
Q10: Test an HTTP handler with httptest.NewRecorder
Q11: Integration test with httptest.NewServer
Q12: Test a function that uses time.Now() (inject clock)

Each question uses this format:
---
## Q{N}: {Title}  [Level {X} — {Name}]
> **Tags:** `#{tag}`
### Problem Statement
### Input / Output / Constraints
### Thought Process
### Brute Force
```go
// code
```
**Time:** O(?) | **Space:** O(?)
### Better Solution
```go
// code
```
### Best Solution
```go
package main
// production code with main()
```
**Time:** O(?) | **Space:** O(?)
### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | ... | Edge Cases | ... | Error Handling | ... | Memory | ... | Concurrency | ... |
### Visual Explanation
```mermaid
flowchart TD
    A["Input"] --> B["Process"] --> C["Output"]
```
### Interviewer Questions
1-7 questions
### Follow-Up Questions Q1-Q5
---

---
## Q1: Basic Unit Test with testing.T  [Level 1 — Beginner]
> **Tags:** `#testing` `#unit-test` `#testing.T` `#go-test`

### Problem Statement
Write a function `Add(a, b int) int` that returns the sum of two integers, then write a basic unit test for it using `testing.T`. The test must verify the result using `t.Errorf` when the output does not match the expected value.

### Input / Output / Constraints
- **Input:** Two integers `a` and `b`
- **Output:** Their sum as an integer
- **Constraints:** No overflow handling required; values fit in `int`

### Thought Process
A unit test in Go lives in a `_test.go` file in the same package. The test function signature must be `func TestXxx(t *testing.T)`. We call the function under test, compare the result to an expected value, and report failure via `t.Errorf` (non-fatal) or `t.Fatalf` (fatal — stops the test immediately).

### Brute Force
```go
// math.go
package math

func Add(a, b int) int {
    return a + b
}
```
```go
// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}
```
**Time:** O(1) | **Space:** O(1)

### Better Solution
```go
// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    got := Add(2, 3)
    want := 5
    if got != want {
        t.Errorf("Add(2, 3) = %d; want %d", got, want)
    }
}
```

### Best Solution
```go
package main

import (
    "fmt"
    "testing"
)

// Add returns the sum of a and b.
func Add(a, b int) int {
    return a + b
}

// TestAdd verifies Add using testing.T.
// Run with: go test -v -run TestAdd
func TestAdd(t *testing.T) {
    got := Add(2, 3)
    const want = 5
    if got != want {
        t.Errorf("Add(2, 3) = %d; want %d", got, want)
    }
}

func main() {
    fmt.Println("Add(2, 3) =", Add(2, 3))
}
```
**Time:** O(1) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Single arithmetic op — scales trivially |
| Edge Cases | Integer overflow for very large values; consider `math/big` |
| Error Handling | No error path for pure math; validate inputs at call site |
| Memory | No heap allocation; registers only |
| Concurrency | Pure function — safe to call concurrently without synchronization |

### Visual Explanation
```mermaid
flowchart TD
    A["TestAdd called"] --> B["Call Add(2, 3)"]
    B --> C["got = 5"]
    C --> D{got == want?}
    D -- Yes --> E["Test PASS"]
    D -- No --> F["t.Errorf — Test FAIL"]
```

### Interviewer Questions
1. What is the difference between `t.Errorf` and `t.Fatalf`?
2. Why must test files end in `_test.go`?
3. How do you run only a specific test function with `go test`?
4. What does the `-v` flag do when running `go test`?
5. Can a test file be in a different package than the code it tests? What are the trade-offs?
6. How does `go test` discover and execute test functions?
7. What happens if a test function panics — does the whole test binary crash?

### Follow-Up Questions
1. How would you add a benchmark for `Add`?
2. How would you test `Add` with negative numbers?
3. What is the role of `TestMain` in a test file?
4. How do you skip a test conditionally using `t.Skip`?
5. How would you measure code coverage for this package?

---

---
## Q2: Test That Checks an Error Is Returned  [Level 1 — Beginner]
> **Tags:** `#testing` `#error-handling` `#testing.T` `#error-return`

### Problem Statement
Write a function `Divide(a, b float64) (float64, error)` that returns an error when `b` is zero. Write a unit test that verifies the error is returned correctly and the result is zero when dividing by zero.

### Input / Output / Constraints
- **Input:** Two `float64` values `a` (dividend) and `b` (divisor)
- **Output:** `(float64, error)` — result and nil error on success; `(0, error)` on division by zero
- **Constraints:** Only division-by-zero needs explicit error; no NaN/Inf handling required

### Thought Process
Go functions that can fail return `(value, error)`. A test for error paths must:
1. Call the function with bad input.
2. Assert `err != nil`.
3. Optionally check the error message.
4. Assert the returned value is the zero value.
For the happy path, assert `err == nil` first, then compare the result.

### Brute Force
```go
// divide.go
package calc

import "errors"

func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```
```go
// divide_test.go
package calc

import "testing"

func TestDivide_ZeroDivisor(t *testing.T) {
    _, err := Divide(10, 0)
    if err == nil {
        t.Error("expected error for division by zero, got nil")
    }
}
```
**Time:** O(1) | **Space:** O(1)

### Better Solution
```go
// divide_test.go
package calc

import (
    "errors"
    "testing"
)

var ErrDivisionByZero = errors.New("division by zero")

func TestDivide(t *testing.T) {
    // Error case
    result, err := Divide(10, 0)
    if err == nil {
        t.Fatal("expected error for division by zero, got nil")
    }
    if result != 0 {
        t.Errorf("expected result 0 on error, got %f", result)
    }

    // Success case
    result, err = Divide(10, 2)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if result != 5.0 {
        t.Errorf("Divide(10, 2) = %f; want 5.0", result)
    }
}
```

### Best Solution
```go
package main

import (
    "errors"
    "fmt"
    "testing"
)

// ErrDivisionByZero is a sentinel error for divide-by-zero.
var ErrDivisionByZero = errors.New("division by zero")

// Divide returns a/b or ErrDivisionByZero when b == 0.
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, ErrDivisionByZero
    }
    return a / b, nil
}

// TestDivide verifies both the error and success paths.
// Run with: go test -v -run TestDivide
func TestDivide(t *testing.T) {
    t.Run("division by zero returns error", func(t *testing.T) {
        result, err := Divide(10, 0)
        if !errors.Is(err, ErrDivisionByZero) {
            t.Fatalf("expected ErrDivisionByZero, got %v", err)
        }
        if result != 0 {
            t.Errorf("expected 0 result on error, got %f", result)
        }
    })

    t.Run("valid division returns correct result", func(t *testing.T) {
        result, err := Divide(10, 2)
        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }
        if result != 5.0 {
            t.Errorf("Divide(10, 2) = %f; want 5.0", result)
        }
    })
}

func main() {
    result, err := Divide(10, 2)
    fmt.Println("10 / 2 =", result, "err:", err)
    result, err = Divide(10, 0)
    fmt.Println("10 / 0 =", result, "err:", err)
}
```
**Time:** O(1) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Constant-time operation; scales without concern |
| Edge Cases | `-0.0` as divisor (Go treats as 0), NaN inputs, Inf inputs |
| Error Handling | Use sentinel errors (`errors.New`) and `errors.Is` for wrapping chains |
| Memory | No heap allocation in hot path |
| Concurrency | Pure function — fully safe for concurrent use |

### Visual Explanation
```mermaid
flowchart TD
    A["TestDivide called"] --> B["Call Divide(10, 0)"]
    B --> C{b == 0?}
    C -- Yes --> D["return 0, ErrDivisionByZero"]
    D --> E{errors.Is ErrDivisionByZero?}
    E -- Yes --> F["Sub-test PASS"]
    E -- No --> G["t.Fatalf — FAIL"]
    C -- No --> H["return a/b, nil"]
```

### Interviewer Questions
1. What is the difference between `errors.New`, `fmt.Errorf`, and a custom error type?
2. Why prefer `errors.Is` over direct `==` comparison for error checking in tests?
3. What does `t.Fatal` do differently from `t.Error`?
4. How would you test error message content without hardcoding strings?
5. When should you use sentinel errors vs. error types?
6. How does `%w` in `fmt.Errorf` enable error unwrapping?
7. How do you test that a function does NOT return an error?

### Follow-Up Questions
1. How would you handle `math.NaN()` as an input to `Divide`?
2. How would you make `Divide` generic to support `int` as well as `float64`?
3. Write a fuzz test for `Divide` using `testing.F`.
4. How would you assert a specific error message without sentinel errors?
5. How does `errors.As` differ from `errors.Is`?

---

---
## Q3: Test with t.Log and t.Fatal  [Level 1 — Beginner]
> **Tags:** `#testing` `#t.Log` `#t.Fatal` `#debugging`

### Problem Statement
Write a function `Sqrt(x float64) (float64, error)` that returns an error for negative input. Write a test that uses `t.Log` to emit diagnostic messages and `t.Fatal` to stop execution immediately on a critical failure. Demonstrate when `t.Log` output is visible.

### Input / Output / Constraints
- **Input:** A `float64` value `x`
- **Output:** `(float64, error)` — square root on success, error when `x < 0`
- **Constraints:** Use `math.Sqrt` internally; only negative input is an error

### Thought Process
`t.Log` writes a message to the test log — it is only printed when the test fails or `-v` is passed. `t.Fatal` logs a message and immediately stops the current test function (calls `runtime.Goexit`). Use `t.Log` for diagnostic context and `t.Fatal` when further execution would be meaningless or dangerous (e.g., a nil pointer would panic).

### Brute Force
```go
// sqrt.go
package mathutil

import (
    "errors"
    "math"
)

func Sqrt(x float64) (float64, error) {
    if x < 0 {
        return 0, errors.New("sqrt of negative number")
    }
    return math.Sqrt(x), nil
}
```
```go
// sqrt_test.go
package mathutil

import "testing"

func TestSqrt_Negative(t *testing.T) {
    t.Log("Testing Sqrt with negative input")
    _, err := Sqrt(-4)
    if err == nil {
        t.Fatal("expected error for negative input, got nil")
    }
    t.Log("Error correctly returned:", err)
}
```
**Time:** O(1) | **Space:** O(1)

### Better Solution
```go
// sqrt_test.go
package mathutil

import (
    "math"
    "testing"
)

func TestSqrt(t *testing.T) {
    t.Log("Starting Sqrt tests")

    // Fatal path: negative input
    _, err := Sqrt(-9)
    if err == nil {
        t.Fatal("Sqrt(-9): expected error, got nil — aborting test")
    }
    t.Log("Negative input correctly rejected:", err)

    // Success path
    result, err := Sqrt(9)
    if err != nil {
        t.Fatalf("Sqrt(9): unexpected error: %v", err)
    }
    want := 3.0
    if math.Abs(result-want) > 1e-9 {
        t.Errorf("Sqrt(9) = %f; want %f", result, want)
    }
    t.Log("Sqrt(9) returned:", result)
}
```

### Best Solution
```go
package main

import (
    "errors"
    "fmt"
    "math"
    "testing"
)

// ErrNegativeSqrt is returned when Sqrt receives a negative argument.
var ErrNegativeSqrt = errors.New("sqrt: input must be non-negative")

// Sqrt computes the square root of x.
// Returns ErrNegativeSqrt when x < 0.
func Sqrt(x float64) (float64, error) {
    if x < 0 {
        return 0, fmt.Errorf("%w: got %g", ErrNegativeSqrt, x)
    }
    return math.Sqrt(x), nil
}

// TestSqrt demonstrates t.Log and t.Fatal usage.
// - t.Log: visible only on failure or with -v flag
// - t.Fatal: stops the test immediately (like t.Log + runtime.Goexit)
// Run with: go test -v -run TestSqrt
func TestSqrt(t *testing.T) {
    t.Log("=== TestSqrt starting ===")

    // Critical guard: if negative input is not rejected, stop immediately.
    t.Log("Checking that Sqrt(-4) returns an error")
    _, err := Sqrt(-4)
    if err == nil {
        t.Fatal("Sqrt(-4): expected ErrNegativeSqrt, got nil — cannot continue")
    }
    t.Log("Negative input rejected correctly:", err)

    // Non-fatal check: validate result accuracy.
    t.Log("Checking Sqrt(16)")
    result, err := Sqrt(16)
    if err != nil {
        t.Fatalf("Sqrt(16): unexpected error: %v", err)
    }
    const want = 4.0
    if math.Abs(result-want) > 1e-9 {
        t.Errorf("Sqrt(16) = %g; want %g", result, want)
    }
    t.Logf("Sqrt(16) = %g (expected %g)", result, want)

    t.Log("=== TestSqrt done ===")
}

func main() {
    v, err := Sqrt(25)
    fmt.Printf("Sqrt(25) = %g, err = %v\n", v, err)
    v, err = Sqrt(-1)
    fmt.Printf("Sqrt(-1) = %g, err = %v\n", v, err)
}
```
**Time:** O(1) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Single-op function; no scalability concern |
| Edge Cases | `x == 0` (valid, returns 0), `x == +Inf` (returns +Inf), NaN propagation |
| Error Handling | Wrap sentinel with `%w` so callers can use `errors.Is` |
| Memory | No allocation in hot path |
| Concurrency | Pure function; fully concurrent-safe |

### Visual Explanation
```mermaid
flowchart TD
    A["TestSqrt starts"] --> B["t.Log: starting"]
    B --> C["Call Sqrt(-4)"]
    C --> D{err == nil?}
    D -- Yes --> E["t.Fatal — STOP"]
    D -- No --> F["t.Log: negative rejected"]
    F --> G["Call Sqrt(16)"]
    G --> H{err != nil?}
    H -- Yes --> I["t.Fatalf — STOP"]
    H -- No --> J{result accurate?}
    J -- No --> K["t.Errorf — continue"]
    J -- Yes --> L["t.Log: done — PASS"]
```

### Interviewer Questions
1. When is `t.Log` output printed? How do you force it to always print?
2. What is the internal mechanism behind `t.Fatal` — how does it stop a test?
3. Why is it wrong to call `t.Fatal` from a goroutine spawned inside a test?
4. What is `t.Helper()` and when should you call it?
5. How do `t.Log`, `t.Error`, and `t.Fatal` differ in test flow control?
6. How would you add structured logging to a test without using `t.Log`?
7. Can `t.Log` be called after the test has finished? What happens?

### Follow-Up Questions
1. How would you use `t.Helper()` to improve test helper error messages?
2. Rewrite `TestSqrt` to use `t.Run` subtests for each case.
3. How would you capture `t.Log` output in a custom test reporter?
4. How does `testing.Verbose()` let production test helpers behave differently?
5. How would you use `go test -count=N` and why does it matter for determinism?

---

---
## Q4: Table-Driven Test Pattern (5+ Cases)  [Level 2 — Easy]
> **Tags:** `#table-driven` `#testing` `#go-patterns` `#subtests`

### Problem Statement
Write a function `IsPalindrome(s string) bool` that returns true if the string reads the same forwards and backwards (case-insensitive, ignoring non-alphanumeric characters). Write a table-driven test with at least 5 cases covering normal strings, empty strings, single characters, mixed case, and strings with punctuation.

### Input / Output / Constraints
- **Input:** A string `s`
- **Output:** `bool` — true if palindrome
- **Constraints:** Case-insensitive; ignore spaces and punctuation; ASCII input assumed

### Thought Process
Table-driven tests encode multiple cases as a slice of structs. Each struct holds input(s), expected output, and optionally a name. A single loop drives all cases through the same assertions, reducing duplication. This is the idiomatic Go testing pattern.

### Brute Force
```go
// palindrome.go
package strutil

func IsPalindrome(s string) bool {
    runes := []rune(s)
    n := len(runes)
    for i := 0; i < n/2; i++ {
        if runes[i] != runes[n-1-i] {
            return false
        }
    }
    return true
}
```
```go
// palindrome_test.go — basic, no table
package strutil

import "testing"

func TestIsPalindrome(t *testing.T) {
    if !IsPalindrome("racecar") { t.Error("racecar should be palindrome") }
    if IsPalindrome("hello")    { t.Error("hello should not be palindrome") }
}
```
**Time:** O(n) | **Space:** O(n)

### Better Solution
```go
// palindrome_test.go — table-driven, no normalization
package strutil

import "testing"

func TestIsPalindrome(t *testing.T) {
    tests := []struct {
        input string
        want  bool
    }{
        {"racecar", true},
        {"hello",   false},
        {"",        true},
        {"a",       true},
        {"abba",    true},
    }
    for _, tc := range tests {
        got := IsPalindrome(tc.input)
        if got != tc.want {
            t.Errorf("IsPalindrome(%q) = %v; want %v", tc.input, got, tc.want)
        }
    }
}
```

### Best Solution
```go
package main

import (
    "fmt"
    "strings"
    "testing"
    "unicode"
)

// IsPalindrome returns true if s reads the same forwards and backwards,
// ignoring case and non-alphanumeric characters.
func IsPalindrome(s string) bool {
    var filtered []rune
    for _, r := range strings.ToLower(s) {
        if unicode.IsLetter(r) || unicode.IsDigit(r) {
            filtered = append(filtered, r)
        }
    }
    n := len(filtered)
    for i := 0; i < n/2; i++ {
        if filtered[i] != filtered[n-1-i] {
            return false
        }
    }
    return true
}

// TestIsPalindrome is a table-driven test with 8 cases.
// Run with: go test -v -run TestIsPalindrome
func TestIsPalindrome(t *testing.T) {
    tests := []struct {
        name  string
        input string
        want  bool
    }{
        {"empty string",              "",                   true},
        {"single char",               "a",                  true},
        {"simple palindrome",         "racecar",            true},
        {"not palindrome",            "hello",              false},
        {"even-length palindrome",    "abba",               true},
        {"mixed case",                "RaceCar",            true},
        {"with punctuation",          "A man, a plan, a canal: Panama", true},
        {"numbers palindrome",        "12321",              true},
    }

    for _, tc := range tests {
        tc := tc // capture range variable for potential parallel use
        t.Run(tc.name, func(t *testing.T) {
            got := IsPalindrome(tc.input)
            if got != tc.want {
                t.Errorf("IsPalindrome(%q) = %v; want %v", tc.input, got, tc.want)
            }
        })
    }
}

func main() {
    cases := []string{"racecar", "hello", "A man, a plan, a canal: Panama"}
    for _, c := range cases {
        fmt.Printf("IsPalindrome(%q) = %v\n", c, IsPalindrome(c))
    }
}
```
**Time:** O(n) | **Space:** O(n)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | O(n) for filtering + O(n) for comparison; suitable for typical string sizes |
| Edge Cases | Empty string (true), single char (true), all non-alphanumeric (true — maps to empty) |
| Error Handling | No error return; pure predicate |
| Memory | O(n) for filtered slice; can be optimized with two-pointer scan on filtered input |
| Concurrency | Pure function; concurrency-safe |

### Visual Explanation
```mermaid
flowchart TD
    A["Input string"] --> B["Lowercase + filter alphanumeric"]
    B --> C["Two-pointer compare"]
    C --> D{All pairs match?}
    D -- Yes --> E["return true"]
    D -- No --> F["return false"]
    G["Test loop"] --> H["tc 1..8"]
    H --> I["IsPalindrome(tc.input)"]
    I --> J{got == want?}
    J -- Yes --> K["PASS"]
    J -- No --> L["t.Errorf FAIL"]
```

### Interviewer Questions
1. Why do we do `tc := tc` inside the range loop when using `t.Run`?
2. What are the advantages of table-driven tests over writing individual test functions?
3. How do you run a single named subtest from the command line?
4. When would you add a `name` field to the test struct vs. just using the index?
5. How do you handle tests that expect both a value and an error in a table?
6. How would you add a benchmark for `IsPalindrome` alongside this test?
7. What is the naming convention for test files and test functions in Go?

### Follow-Up Questions
1. How would you make the table-driven test parallel?
2. Add a fuzz test (`testing.F`) for `IsPalindrome`.
3. How would you test `IsPalindrome` with Unicode multi-byte characters?
4. Refactor `IsPalindrome` to be allocation-free using two pointers.
5. How would you measure and display test coverage for this function?

---

---
## Q5: Subtest with t.Run for Grouped Cases  [Level 2 — Easy]
> **Tags:** `#subtest` `#t.Run` `#test-grouping` `#testing`

### Problem Statement
Write a function `Greet(name, lang string) (string, error)` that returns a greeting in English (`"Hello, <name>!"`) or Spanish (`"Hola, <name>!"`), and returns an error for unsupported languages. Write a test that uses `t.Run` to group cases by language category: "English", "Spanish", and "Unsupported".

### Input / Output / Constraints
- **Input:** `name string`, `lang string`
- **Output:** `(string, error)`
- **Constraints:** Supported languages: `"en"`, `"es"`; all others return an error

### Thought Process
`t.Run(name, func(t *testing.T) {...})` creates a named subtest. Subtests can be nested, run in parallel, and selected individually via `-run`. Grouping by category (language) makes failure messages self-documenting and allows `go test -run TestGreet/Spanish` to run only that group.

### Brute Force
```go
// greet.go
package greet

import (
    "errors"
    "fmt"
)

func Greet(name, lang string) (string, error) {
    switch lang {
    case "en":
        return fmt.Sprintf("Hello, %s!", name), nil
    case "es":
        return fmt.Sprintf("Hola, %s!", name), nil
    default:
        return "", errors.New("unsupported language: " + lang)
    }
}
```
```go
// greet_test.go — flat, no grouping
package greet

import "testing"

func TestGreet(t *testing.T) {
    msg, err := Greet("Alice", "en")
    if err != nil || msg != "Hello, Alice!" {
        t.Errorf("unexpected: %q %v", msg, err)
    }
}
```
**Time:** O(n) | **Space:** O(n)

### Better Solution
```go
// greet_test.go — grouped with t.Run
package greet

import "testing"

func TestGreet(t *testing.T) {
    t.Run("English", func(t *testing.T) {
        msg, err := Greet("Alice", "en")
        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }
        if msg != "Hello, Alice!" {
            t.Errorf("got %q; want %q", msg, "Hello, Alice!")
        }
    })

    t.Run("Unsupported", func(t *testing.T) {
        _, err := Greet("Alice", "fr")
        if err == nil {
            t.Error("expected error for unsupported language")
        }
    })
}
```

### Best Solution
```go
package main

import (
    "errors"
    "fmt"
    "strings"
    "testing"
)

// ErrUnsupportedLang is returned for languages not yet supported.
var ErrUnsupportedLang = errors.New("unsupported language")

// Greet returns a greeting in the requested language.
// Supported: "en" (English), "es" (Spanish).
func Greet(name, lang string) (string, error) {
    switch strings.ToLower(lang) {
    case "en":
        return fmt.Sprintf("Hello, %s!", name), nil
    case "es":
        return fmt.Sprintf("Hola, %s!", name), nil
    default:
        return "", fmt.Errorf("%w: %q", ErrUnsupportedLang, lang)
    }
}

// TestGreet groups subtests by language category.
// Run all:         go test -v -run TestGreet
// Run Spanish only: go test -v -run TestGreet/Spanish
func TestGreet(t *testing.T) {
    t.Run("English", func(t *testing.T) {
        cases := []struct{ name, want string }{
            {"Alice", "Hello, Alice!"},
            {"Bob",   "Hello, Bob!"},
        }
        for _, tc := range cases {
            tc := tc
            t.Run(tc.name, func(t *testing.T) {
                got, err := Greet(tc.name, "en")
                if err != nil {
                    t.Fatalf("unexpected error: %v", err)
                }
                if got != tc.want {
                    t.Errorf("Greet(%q, en) = %q; want %q", tc.name, got, tc.want)
                }
            })
        }
    })

    t.Run("Spanish", func(t *testing.T) {
        got, err := Greet("Carlos", "es")
        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }
        const want = "Hola, Carlos!"
        if got != want {
            t.Errorf("Greet(Carlos, es) = %q; want %q", got, want)
        }
    })

    t.Run("Unsupported", func(t *testing.T) {
        _, err := Greet("Alice", "fr")
        if !errors.Is(err, ErrUnsupportedLang) {
            t.Errorf("expected ErrUnsupportedLang, got %v", err)
        }
    })
}

func main() {
    for _, lang := range []string{"en", "es", "fr"} {
        msg, err := Greet("World", lang)
        fmt.Printf("lang=%s msg=%q err=%v\n", lang, msg, err)
    }
}
```
**Time:** O(n) | **Space:** O(n)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | O(len(name)) for string formatting; negligible |
| Edge Cases | Empty name (returns "Hello, !" — decide if that is valid), empty lang string |
| Error Handling | Wrap sentinel with `%w` for chain-friendly unwrapping |
| Memory | Short-lived string allocations only |
| Concurrency | Pure function; safe for concurrent calls |

### Visual Explanation
```mermaid
flowchart TD
    A["TestGreet"] --> B["t.Run: English"]
    A --> C["t.Run: Spanish"]
    A --> D["t.Run: Unsupported"]
    B --> E["Greet(Alice, en)"] --> F{err nil & msg correct?}
    F -- Yes --> G["PASS"]
    F -- No --> H["FAIL"]
    C --> I["Greet(Carlos, es)"] --> J{correct?}
    J -- Yes --> K["PASS"]
    D --> L["Greet(Alice, fr)"] --> M{errors.Is?}
    M -- Yes --> N["PASS"]
    M -- No --> O["FAIL"]
```

### Interviewer Questions
1. How do you run a single subtest by name from the command line?
2. Can you nest `t.Run` calls? What does the full test name look like?
3. How does a failing subtest affect the parent test's status?
4. How would you make all subtests inside `t.Run` run in parallel?
5. What is the difference between `t.Run` subtests and top-level test functions?
6. How do you share setup/teardown between subtests without repeating code?
7. How does `t.Run` interact with `t.Parallel()`?

### Follow-Up Questions
1. Add a `"French"` language and expand the test without changing existing cases.
2. How would you use `testify/assert` to simplify these assertions?
3. How do you select multiple subtest groups in a single `go test -run` command?
4. How would you benchmark `Greet` across all supported languages?
5. How would you refactor `Greet` to support a plugin/registry of languages?

---

---
## Q6: Test a Pure Function with Edge Cases  [Level 2 — Easy]
> **Tags:** `#pure-function` `#edge-cases` `#testing` `#boundary`

### Problem Statement
Write a function `Clamp(val, min, max int) int` that restricts `val` to the range `[min, max]`. Write tests that explicitly exercise all boundary and edge cases: value below range, value above range, value at exact boundaries, `min == max`, and `min > max` (invalid range).

### Input / Output / Constraints
- **Input:** `val`, `min`, `max` as `int`
- **Output:** Clamped `int`
- **Constraints:** When `min > max`, return `min` (or document your chosen behavior); no overflow assumed

### Thought Process
A pure function depends only on its inputs. Edge-case testing for `Clamp` means: (1) below range, (2) above range, (3) at lower bound, (4) at upper bound, (5) inside range, (6) equal bounds, (7) inverted bounds. Each case should be a named table entry.

### Brute Force
```go
// clamp.go
package mathutil

func Clamp(val, min, max int) int {
    if val < min { return min }
    if val > max { return max }
    return val
}
```
**Time:** O(1) | **Space:** O(1)

### Better Solution
```go
// clamp_test.go
package mathutil

import "testing"

func TestClamp(t *testing.T) {
    tests := []struct {
        val, min, max, want int
    }{
        {5, 1, 10, 5},   // inside
        {0, 1, 10, 1},   // below min
        {15, 1, 10, 10}, // above max
        {1, 1, 10, 1},   // at min
        {10, 1, 10, 10}, // at max
    }
    for _, tc := range tests {
        got := Clamp(tc.val, tc.min, tc.max)
        if got != tc.want {
            t.Errorf("Clamp(%d, %d, %d) = %d; want %d",
                tc.val, tc.min, tc.max, got, tc.want)
        }
    }
}
```

### Best Solution
```go
package main

import (
    "fmt"
    "testing"
)

// Clamp restricts val to [min, max].
// If min > max the range is invalid; min is returned as a safe default.
func Clamp(val, min, max int) int {
    if min > max {
        return min // documented degenerate behavior
    }
    if val < min {
        return min
    }
    if val > max {
        return max
    }
    return val
}

// TestClamp exhaustively covers all edge and boundary cases.
// Run with: go test -v -run TestClamp
func TestClamp(t *testing.T) {
    tests := []struct {
        name        string
        val, lo, hi int
        want        int
    }{
        {"inside range",        5,  1, 10, 5},
        {"below min",           0,  1, 10, 1},
        {"above max",          15,  1, 10, 10},
        {"at lower bound",      1,  1, 10, 1},
        {"at upper bound",     10,  1, 10, 10},
        {"min == max match",    5,  5,  5, 5},
        {"min == max no match", 3,  5,  5, 5},
        {"inverted range",      7, 10,  1, 10}, // min > max: return min
        {"negative range",     -3, -5, -1, -3},
        {"zero range",          0,  0,  0, 0},
    }

    for _, tc := range tests {
        tc := tc
        t.Run(tc.name, func(t *testing.T) {
            got := Clamp(tc.val, tc.lo, tc.hi)
            if got != tc.want {
                t.Errorf("Clamp(%d, %d, %d) = %d; want %d",
                    tc.val, tc.lo, tc.hi, got, tc.want)
            }
        })
    }
}

func main() {
    fmt.Println(Clamp(5, 1, 10))   // 5
    fmt.Println(Clamp(-5, 1, 10))  // 1
    fmt.Println(Clamp(20, 1, 10))  // 10
}
```
**Time:** O(1) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Constant-time; no scaling concern |
| Edge Cases | Inverted range, equal bounds, negative numbers, zero bounds |
| Error Handling | Document degenerate `min > max` behavior; consider returning `(int, error)` |
| Memory | Zero allocation |
| Concurrency | Pure function; fully concurrent-safe |

### Visual Explanation
```mermaid
flowchart TD
    A["Clamp(val, min, max)"] --> B{min > max?}
    B -- Yes --> C["return min (degenerate)"]
    B -- No --> D{val < min?}
    D -- Yes --> E["return min"]
    D -- No --> F{val > max?}
    F -- Yes --> G["return max"]
    F -- No --> H["return val"]
```

### Interviewer Questions
1. What distinguishes a boundary test from an edge-case test?
2. How do you decide what constitutes an "edge case" for a given function?
3. Why is `min == max` an important case for `Clamp`?
4. How would you document and enforce the behavior when `min > max`?
5. What tools in Go help with property-based or fuzz testing for functions like `Clamp`?
6. How would you test `Clamp` with generics in Go 1.21+?
7. How does testing a pure function differ from testing one with side effects?

### Follow-Up Questions
1. Rewrite `Clamp` as a generic function `Clamp[T constraints.Ordered]`.
2. Add a fuzz test using `testing.F` to find unexpected behavior.
3. How would you property-test `Clamp` to assert `min <= result <= max` always?
4. How would you benchmark `Clamp` and interpret the ns/op output?
5. How do you use `go test -coverprofile` to verify all branches are hit?

---

---
## Q7: t.Cleanup for Test Teardown  [Level 2 — Easy]
> **Tags:** `#t.Cleanup` `#teardown` `#testing` `#temp-files`

### Problem Statement
Write a function `WriteTempFile(content string) (string, error)` that creates a temporary file with the given content and returns its path. Write a test that uses `t.Cleanup` to guarantee the temporary file is deleted after the test, even if the test fails or panics. Demonstrate why `t.Cleanup` is preferred over `defer` in subtests.

### Input / Output / Constraints
- **Input:** `content string`
- **Output:** `(path string, err error)`
- **Constraints:** Use `os.CreateTemp`; cleanup must run even on test failure

### Thought Process
`t.Cleanup(f func())` registers `f` to be called when the test (and all its subtests) complete. Unlike `defer`, which is scoped to the function, `t.Cleanup` is scoped to the test's lifetime. This makes it ideal for helpers that create resources — the helper registers cleanup and the test body does not need to manage it. Multiple cleanups run in LIFO order.

### Brute Force
```go
// io.go
package ioutil

import "os"

func WriteTempFile(content string) (string, error) {
    f, err := os.CreateTemp("", "test-*.txt")
    if err != nil {
        return "", err
    }
    defer f.Close()
    if _, err := f.WriteString(content); err != nil {
        os.Remove(f.Name())
        return "", err
    }
    return f.Name(), nil
}
```
```go
// io_test.go — using defer (not ideal in helpers)
package ioutil

import (
    "os"
    "testing"
)

func TestWriteTempFile(t *testing.T) {
    path, err := WriteTempFile("hello")
    if err != nil {
        t.Fatal(err)
    }
    defer os.Remove(path) // fragile in helper functions
    // ... assertions
}
```

### Better Solution
```go
// io_test.go — using t.Cleanup
package ioutil

import (
    "os"
    "testing"
)

func TestWriteTempFile(t *testing.T) {
    path, err := WriteTempFile("hello")
    if err != nil {
        t.Fatal(err)
    }
    t.Cleanup(func() { os.Remove(path) })

    data, err := os.ReadFile(path)
    if err != nil {
        t.Fatalf("ReadFile: %v", err)
    }
    if string(data) != "hello" {
        t.Errorf("got %q; want %q", string(data), "hello")
    }
}
```

### Best Solution
```go
package main

import (
    "fmt"
    "os"
    "testing"
)

// WriteTempFile creates a temp file with content and returns its path.
func WriteTempFile(content string) (string, error) {
    f, err := os.CreateTemp("", "goforge-*.txt")
    if err != nil {
        return "", fmt.Errorf("create temp file: %w", err)
    }
    defer f.Close()
    if _, err := f.WriteString(content); err != nil {
        os.Remove(f.Name())
        return "", fmt.Errorf("write temp file: %w", err)
    }
    return f.Name(), nil
}

// newTempFile is a test helper that creates a temp file and
// registers cleanup via t.Cleanup — no defer needed at call site.
func newTempFile(t *testing.T, content string) string {
    t.Helper()
    path, err := WriteTempFile(content)
    if err != nil {
        t.Fatalf("newTempFile: %v", err)
    }
    t.Cleanup(func() {
        if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
            t.Logf("cleanup: failed to remove %s: %v", path, err)
        }
    })
    return path
}

// TestWriteTempFile demonstrates t.Cleanup for automatic teardown.
// Run with: go test -v -run TestWriteTempFile
func TestWriteTempFile(t *testing.T) {
    t.Run("writes content correctly", func(t *testing.T) {
        path := newTempFile(t, "GoForge rocks")
        data, err := os.ReadFile(path)
        if err != nil {
            t.Fatalf("ReadFile: %v", err)
        }
        if got, want := string(data), "GoForge rocks"; got != want {
            t.Errorf("content = %q; want %q", got, want)
        }
    })

    t.Run("empty content", func(t *testing.T) {
        path := newTempFile(t, "")
        info, err := os.Stat(path)
        if err != nil {
            t.Fatalf("Stat: %v", err)
        }
        if info.Size() != 0 {
            t.Errorf("expected empty file, got size %d", info.Size())
        }
    })
}

func main() {
    path, err := WriteTempFile("hello world")
    if err != nil {
        fmt.Println("error:", err)
        return
    }
    defer os.Remove(path)
    fmt.Println("temp file:", path)
}
```
**Time:** O(n) | **Space:** O(n)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | File I/O; ensure temp dir has sufficient space in CI |
| Edge Cases | Write failure after create (partial file), disk full, permission denied |
| Error Handling | Wrap errors with context; check `os.IsNotExist` in cleanup |
| Memory | Content is held in memory before write; stream for large content |
| Concurrency | Each test gets its own temp file; `os.CreateTemp` is concurrency-safe |

### Visual Explanation
```mermaid
flowchart TD
    A["TestWriteTempFile"] --> B["newTempFile called"]
    B --> C["WriteTempFile: os.CreateTemp"]
    C --> D["t.Cleanup: register os.Remove"]
    D --> E["Test body runs assertions"]
    E --> F{Test done / fail?}
    F --> G["t.Cleanup fires: os.Remove(path)"]
    G --> H["File deleted regardless of outcome"]
```

### Interviewer Questions
1. What is the difference between `t.Cleanup` and `defer` inside a test function?
2. In what order do multiple `t.Cleanup` functions run?
3. Why is `t.Cleanup` preferred when writing test helper functions?
4. What happens if a `t.Cleanup` function panics?
5. Can `t.Cleanup` be called from a helper function? What is the effect?
6. How does `t.TempDir()` relate to `t.Cleanup`? When would you use each?
7. How do you ensure cleanup runs even when `t.Fatal` is called?

### Follow-Up Questions
1. Refactor the test to use `t.TempDir()` instead of `WriteTempFile`.
2. How would you register multiple cleanup steps (e.g., close DB, delete file)?
3. How does `t.Cleanup` interact with `t.Parallel()`?
4. Write a helper `openDB(t *testing.T) *sql.DB` that uses `t.Cleanup` to close the DB.
5. How would you verify that cleanup ran by checking side effects after the test?

---

---
## Q8: Parallel Subtest with t.Parallel()  [Level 3 — Medium]
> **Tags:** `#parallel` `#t.Parallel` `#subtest` `#concurrency`

### Problem Statement
Write a function `FetchUser(id int) (string, error)` that simulates a slow I/O call (use `time.Sleep` to simulate 10ms latency). Write a table-driven test with 5 user IDs where each subtest calls `t.Parallel()` to run all cases concurrently, demonstrating the speed improvement over sequential execution.

### Input / Output / Constraints
- **Input:** `id int`
- **Output:** `(string, error)` — username string or error for unknown IDs
- **Constraints:** IDs 1-5 are valid; simulate 10ms latency; parallel subtests must capture range variable correctly

### Thought Process
By default, subtests run sequentially. Calling `t.Parallel()` inside a subtest signals that it may run concurrently with other parallel tests. The parent test waits for all subtests to finish before returning. Key pattern: `tc := tc` (or use the closure over the loop variable carefully) to avoid the classic range-variable capture bug. With 5 subtests each taking 10ms, parallel execution takes ~10ms vs ~50ms sequential.

### Brute Force
```go
// user.go — sequential test, no t.Parallel
package user

import "time"

func FetchUser(id int) (string, error) {
    time.Sleep(10 * time.Millisecond)
    users := map[int]string{1: "alice", 2: "bob", 3: "carol", 4: "dave", 5: "eve"}
    name, ok := users[id]
    if !ok {
        return "", fmt.Errorf("user %d not found", id)
    }
    return name, nil
}
```
**Time:** O(1) per call | **Space:** O(1)

### Better Solution
```go
// user_test.go — parallel subtests, correct capture
package user

import (
    "testing"
)

func TestFetchUser(t *testing.T) {
    tests := []struct {
        id   int
        want string
    }{
        {1, "alice"}, {2, "bob"}, {3, "carol"}, {4, "dave"}, {5, "eve"},
    }
    for _, tc := range tests {
        tc := tc // capture
        t.Run(fmt.Sprintf("id=%d", tc.id), func(t *testing.T) {
            t.Parallel()
            got, err := FetchUser(tc.id)
            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if got != tc.want {
                t.Errorf("FetchUser(%d) = %q; want %q", tc.id, got, tc.want)
            }
        })
    }
}
```

### Best Solution
```go
package main

import (
    "errors"
    "fmt"
    "testing"
    "time"
)

// ErrUserNotFound is returned for unknown user IDs.
var ErrUserNotFound = errors.New("user not found")

var userDB = map[int]string{
    1: "alice", 2: "bob", 3: "carol", 4: "dave", 5: "eve",
}

// FetchUser simulates a slow I/O fetch with 10ms latency.
func FetchUser(id int) (string, error) {
    time.Sleep(10 * time.Millisecond) // simulate network/DB latency
    name, ok := userDB[id]
    if !ok {
        return "", fmt.Errorf("%w: id=%d", ErrUserNotFound, id)
    }
    return name, nil
}

// TestFetchUser runs 5 parallel subtests.
// Sequential time: ~50ms  |  Parallel time: ~10ms
// Run with: go test -v -run TestFetchUser
func TestFetchUser(t *testing.T) {
    tests := []struct {
        id      int
        want    string
        wantErr bool
    }{
        {1, "alice", false},
        {2, "bob",   false},
        {3, "carol", false},
        {4, "dave",  false},
        {5, "eve",   false},
        {99, "",     true},  // unknown ID
    }

    for _, tc := range tests {
        tc := tc // capture range variable — critical for parallel subtests
        t.Run(fmt.Sprintf("id=%d", tc.id), func(t *testing.T) {
            t.Parallel() // run this subtest concurrently
            got, err := FetchUser(tc.id)
            if tc.wantErr {
                if !errors.Is(err, ErrUserNotFound) {
                    t.Errorf("expected ErrUserNotFound, got %v", err)
                }
                return
            }
            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if got != tc.want {
                t.Errorf("FetchUser(%d) = %q; want %q", tc.id, got, tc.want)
            }
        })
    }
}

func main() {
    name, err := FetchUser(1)
    fmt.Println("FetchUser(1):", name, err)
    _, err = FetchUser(99)
    fmt.Println("FetchUser(99):", err)
}
```
**Time:** O(1) per call (ignoring simulated sleep) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Parallel subtests limited by `GOMAXPROCS`; use `-parallel N` flag to control |
| Edge Cases | Range-variable capture bug when forgetting `tc := tc` |
| Error Handling | Parallel subtests must not share mutable state without synchronization |
| Memory | Each goroutine has its own stack; watch for goroutine leaks in long test suites |
| Concurrency | Use `t.Parallel()` only when the function under test is concurrency-safe |

### Visual Explanation
```mermaid
flowchart TD
    A["TestFetchUser (parent)"] --> B["Loop over test cases"]
    B --> C1["t.Run id=1 → t.Parallel()"]
    B --> C2["t.Run id=2 → t.Parallel()"]
    B --> C3["t.Run id=3 → t.Parallel()"]
    B --> C4["t.Run id=4 → t.Parallel()"]
    B --> C5["t.Run id=5 → t.Parallel()"]
    C1 & C2 & C3 & C4 & C5 --> D["All run concurrently (~10ms total)"]
    D --> E["Parent waits for all subtests"]
    E --> F["TestFetchUser completes"]
```

### Interviewer Questions
1. Why must you write `tc := tc` before calling `t.Parallel()` inside a range loop?
2. What does `t.Parallel()` actually do — when does the subtest start running?
3. How do you control the maximum number of parallel tests with `go test`?
4. Can the parent test perform assertions after the loop if subtests are parallel?
5. What is the danger of parallel subtests sharing mutable state (e.g., a map)?
6. How does `-parallel` differ from `GOMAXPROCS`?
7. When should you NOT use `t.Parallel()`?

### Follow-Up Questions
1. How would you add a timeout to each parallel subtest using `context.WithTimeout`?
2. How do you detect race conditions introduced by parallel tests using `go test -race`?
3. How would you parallelize the parent-level `TestFetchUser` itself with other top-level tests?
4. Rewrite `FetchUser` to accept a `context.Context` and cancel early.
5. How would you use `sync.WaitGroup` manually vs. relying on `t.Parallel()`?

---

---
## Q9: Mock an Interface Dependency in a Test  [Level 3 — Medium]
> **Tags:** `#mock` `#interface` `#dependency-injection` `#testing`

### Problem Statement
Write a service `UserService` with a method `GetGreeting(id int) (string, error)` that depends on a `UserRepository` interface with `FindByID(id int) (string, error)`. Write a test that injects a mock implementation of `UserRepository` to test `UserService` in isolation, without hitting a real database.

### Input / Output / Constraints
- **Input:** `id int`
- **Output:** `"Hello, <name>!"` or error
- **Constraints:** No real DB; mock must be defined in the test file; test both success and error paths

### Thought Process
In Go, interfaces are satisfied implicitly. Define a `UserRepository` interface, implement `UserService` to accept it, and in the test create a lightweight mock struct that implements the interface. This is the standard Go approach — no mocking framework required. For advanced use cases, `gomock` or `testify/mock` automate mock generation.

### Brute Force
```go
// Hard-coded dependency — untestable
type UserService struct{}

func (s *UserService) GetGreeting(id int) (string, error) {
    // direct DB call — cannot mock
    return "Hello, hardcoded!", nil
}
```
**Time:** O(1) | **Space:** O(1)

### Better Solution
```go
// service.go
package service

import "fmt"

type UserRepository interface {
    FindByID(id int) (string, error)
}

type UserService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

func (s *UserService) GetGreeting(id int) (string, error) {
    name, err := s.repo.FindByID(id)
    if err != nil {
        return "", err
    }
    return fmt.Sprintf("Hello, %s!", name), nil
}
```
```go
// service_test.go — hand-rolled mock
package service

import (
    "errors"
    "testing"
)

type mockRepo struct {
    name string
    err  error
}

func (m *mockRepo) FindByID(id int) (string, error) {
    return m.name, m.err
}

func TestGetGreeting(t *testing.T) {
    svc := NewUserService(&mockRepo{name: "Alice"})
    got, err := svc.GetGreeting(1)
    if err != nil || got != "Hello, Alice!" {
        t.Errorf("got (%q, %v)", got, err)
    }
}
```

### Best Solution
```go
package main

import (
    "errors"
    "fmt"
    "testing"
)

// UserRepository is the data-access abstraction.
type UserRepository interface {
    FindByID(id int) (string, error)
}

// UserService contains business logic and depends on UserRepository.
type UserService struct {
    repo UserRepository
}

// NewUserService is the constructor — accepts any UserRepository.
func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

// GetGreeting fetches a user and returns a greeting.
func (s *UserService) GetGreeting(id int) (string, error) {
    name, err := s.repo.FindByID(id)
    if err != nil {
        return "", fmt.Errorf("GetGreeting: %w", err)
    }
    return fmt.Sprintf("Hello, %s!", name), nil
}

// --- Test file (same package for white-box access) ---

// mockUserRepo is a hand-rolled mock satisfying UserRepository.
type mockUserRepo struct {
    findByIDFunc func(id int) (string, error)
    calls        []int // records which IDs were queried
}

func (m *mockUserRepo) FindByID(id int) (string, error) {
    m.calls = append(m.calls, id)
    return m.findByIDFunc(id)
}

// TestGetGreeting tests UserService in isolation with a mock repo.
// Run with: go test -v -run TestGetGreeting
func TestGetGreeting(t *testing.T) {
    t.Run("success: known user", func(t *testing.T) {
        repo := &mockUserRepo{
            findByIDFunc: func(id int) (string, error) {
                if id == 42 {
                    return "Alice", nil
                }
                return "", errors.New("not found")
            },
        }
        svc := NewUserService(repo)
        got, err := svc.GetGreeting(42)
        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }
        const want = "Hello, Alice!"
        if got != want {
            t.Errorf("GetGreeting(42) = %q; want %q", got, want)
        }
        if len(repo.calls) != 1 || repo.calls[0] != 42 {
            t.Errorf("expected FindByID called with 42, got calls=%v", repo.calls)
        }
    })

    t.Run("error: unknown user propagated", func(t *testing.T) {
        errNotFound := errors.New("user not found")
        repo := &mockUserRepo{
            findByIDFunc: func(id int) (string, error) {
                return "", errNotFound
            },
        }
        svc := NewUserService(repo)
        _, err := svc.GetGreeting(99)
        if !errors.Is(err, errNotFound) {
            t.Errorf("expected errNotFound in chain, got %v", err)
        }
    })
}

func main() {
    // In production, pass a real DB-backed repo.
    fmt.Println("See test file for usage.")
}
```
**Time:** O(1) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Interface indirection has negligible overhead; mock scales with test matrix size |
| Edge Cases | Nil repo (guard with panic or error in constructor), ID 0, negative IDs |
| Error Handling | Wrap errors with `%w` so callers can use `errors.Is`/`errors.As` |
| Memory | Mock stores call history — clear between test cases or use per-test instances |
| Concurrency | Mock is not goroutine-safe; use per-goroutine instances in parallel tests |

### Visual Explanation
```mermaid
flowchart TD
    A["TestGetGreeting"] --> B["Create mockUserRepo"]
    B --> C["NewUserService(mock)"]
    C --> D["svc.GetGreeting(42)"]
    D --> E["mock.FindByID(42)"]
    E --> F["returns Alice, nil"]
    F --> G["fmt.Sprintf Hello, Alice!"]
    G --> H{got == want?}
    H -- Yes --> I["PASS"]
    H -- No --> J["FAIL"]
```

### Interviewer Questions
1. How does Go's implicit interface satisfaction enable mocking without code generation?
2. What are the trade-offs between hand-rolled mocks and generated mocks (gomock)?
3. How do you verify that a mock was called with the correct arguments?
4. How do you test that a function was called exactly N times using a hand-rolled mock?
5. When should you use `testify/mock` vs. a simple hand-rolled struct?
6. What is the difference between a stub and a mock?
7. How do you avoid test double explosion (too many mock types)?

### Follow-Up Questions
1. Generate mocks for `UserRepository` using `mockgen` and compare with the hand-rolled version.
2. How would you make `mockUserRepo` concurrency-safe for parallel tests?
3. Add call-count verification to ensure `FindByID` is not called more than once.
4. How would you use `testify/assert` to simplify assertions in this test?
5. How would you test `GetGreeting` when the repo returns a wrapped error?

---

---
## Q10: Test an HTTP Handler with httptest.NewRecorder  [Level 3 — Medium]
> **Tags:** `#httptest` `#http-handler` `#NewRecorder` `#net/http`

### Problem Statement
Write an HTTP handler `HealthHandler` that responds with `{"status":"ok"}` and a 200 status code. Write a test using `httptest.NewRecorder()` to capture the response without starting a real HTTP server. Verify the status code, Content-Type header, and response body.

### Input / Output / Constraints
- **Input:** HTTP GET request
- **Output:** JSON body `{"status":"ok"}`, status 200, `Content-Type: application/json`
- **Constraints:** Use `net/http` and `encoding/json`; no external framework

### Thought Process
`httptest.ResponseRecorder` implements `http.ResponseWriter` and records the response written by a handler. Combined with `httptest.NewRequest` (or `http.NewRequest`), you can test any `http.HandlerFunc` without starting a server. This is faster and more isolated than `httptest.NewServer`.

### Brute Force
```go
// handler.go
package api

import (
    "encoding/json"
    "net/http"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
```
```go
// handler_test.go — minimal
package api

import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHealthHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    rr := httptest.NewRecorder()
    HealthHandler(rr, req)
    if rr.Code != 200 { t.Errorf("status = %d; want 200", rr.Code) }
}
```

### Better Solution
```go
// handler_test.go — checks status, header, body
package api

import (
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

func TestHealthHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    rr := httptest.NewRecorder()
    HealthHandler(rr, req)

    if rr.Code != http.StatusOK {
        t.Errorf("status = %d; want %d", rr.Code, http.StatusOK)
    }
    if ct := rr.Header().Get("Content-Type"); !strings.Contains(ct, "application/json") {
        t.Errorf("Content-Type = %q; want application/json", ct)
    }
    if !strings.Contains(rr.Body.String(), `"status":"ok"`) {
        t.Errorf("body = %q; want status:ok", rr.Body.String())
    }
}
```

### Best Solution
```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

// HealthHandler responds with a JSON health status.
func HealthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// TestHealthHandler uses httptest.NewRecorder to test the handler in-process.
// Run with: go test -v -run TestHealthHandler
func TestHealthHandler(t *testing.T) {
    tests := []struct {
        name           string
        method         string
        wantStatus     int
        wantBody       string
        wantHeaderKey  string
        wantHeaderVal  string
    }{
        {
            name:          "GET returns 200 with JSON body",
            method:        http.MethodGet,
            wantStatus:    http.StatusOK,
            wantBody:      `"status":"ok"`,
            wantHeaderKey: "Content-Type",
            wantHeaderVal: "application/json",
        },
    }

    for _, tc := range tests {
        tc := tc
        t.Run(tc.name, func(t *testing.T) {
            req := httptest.NewRequest(tc.method, "/health", nil)
            rr := httptest.NewRecorder()

            HealthHandler(rr, req)

            // 1. Check status code
            if rr.Code != tc.wantStatus {
                t.Errorf("status = %d; want %d", rr.Code, tc.wantStatus)
            }

            // 2. Check Content-Type header
            ct := rr.Header().Get(tc.wantHeaderKey)
            if !strings.Contains(ct, tc.wantHeaderVal) {
                t.Errorf("header %s = %q; want to contain %q",
                    tc.wantHeaderKey, ct, tc.wantHeaderVal)
            }

            // 3. Check body contains expected JSON
            body := rr.Body.String()
            if !strings.Contains(body, tc.wantBody) {
                t.Errorf("body = %q; want to contain %q", body, tc.wantBody)
            }

            // 4. Optionally decode and validate JSON structure
            var result map[string]string
            if err := json.NewDecoder(rr.Body).Decode(&result); err == nil {
                if result["status"] != "ok" {
                    t.Errorf("JSON status = %q; want ok", result["status"])
                }
            }
        })
    }
}

func main() {
    http.HandleFunc("/health", HealthHandler)
    fmt.Println("Server listening on :8080")
    http.ListenAndServe(":8080", nil)
}
```
**Time:** O(1) | **Space:** O(n)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | In-process test; zero network overhead; scales to hundreds of handler tests |
| Edge Cases | Wrong HTTP method (should return 405), malformed request, handler panics |
| Error Handling | Check that errors from `json.Encode` are handled; write 500 on failure |
| Memory | `httptest.ResponseRecorder` buffers the full body in memory |
| Concurrency | Each test creates its own recorder; no shared state |

### Visual Explanation
```mermaid
flowchart TD
    A["httptest.NewRequest GET /health"] --> B["httptest.NewRecorder"]
    B --> C["HealthHandler(rr, req)"]
    C --> D["w.Header().Set Content-Type"]
    D --> E["w.WriteHeader 200"]
    E --> F["json.Encode status:ok"]
    F --> G["rr captures response"]
    G --> H["Assert Code == 200"]
    G --> I["Assert Content-Type"]
    G --> J["Assert body contains status:ok"]
```

### Interviewer Questions
1. What is the difference between `httptest.NewRecorder` and `httptest.NewServer`?
2. What does `rr.Result()` give you that `rr.Code`/`rr.Body` do not?
3. How do you test a handler that reads the request body?
4. How do you set request headers in `httptest.NewRequest`?
5. How do you test a handler that uses a `context.Context` value (e.g., auth)?
6. How do you test middleware with `httptest.NewRecorder`?
7. How would you test a handler that redirects (301/302)?

### Follow-Up Questions
1. How would you test a handler that writes a streaming response?
2. Rewrite the test using `net/http/httptest.NewServer` and an actual HTTP client.
3. How would you test a handler that requires JWT authentication?
4. How do you test a `http.ServeMux` or `chi.Router` with multiple routes?
5. How would you benchmark the handler throughput using `testing.B`?

---

---
## Q11: Integration Test with httptest.NewServer  [Level 3 — Medium]
> **Tags:** `#integration-test` `#httptest.NewServer` `#net/http` `#http-client`

### Problem Statement
Write an HTTP server with a `/echo` endpoint that reads the request body and echoes it back with a 200 status. Write an integration test using `httptest.NewServer` that starts a real (in-process) HTTP server, makes an actual HTTP client request, and verifies the response. Use `t.Cleanup` to close the server after the test.

### Input / Output / Constraints
- **Input:** POST request with any body to `/echo`
- **Output:** Same body echoed back, status 200
- **Constraints:** Use `net/http`; server must be closed after test; test must use a real HTTP client

### Thought Process
`httptest.NewServer` starts a real HTTP server on a random localhost port. The test gets the server URL and uses `http.Get`/`http.Post` (or a custom client) to make actual TCP requests. This tests the full HTTP stack including serialization, headers, and routing. `t.Cleanup(server.Close)` ensures the server shuts down after the test.

### Brute Force
```go
// echo.go
package api

import (
    "io"
    "net/http"
)

func EchoHandler(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    w.Write(body)
}
```
```go
// echo_test.go — minimal integration test
package api

import (
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

func TestEchoHandler(t *testing.T) {
    srv := httptest.NewServer(http.HandlerFunc(EchoHandler))
    defer srv.Close()

    resp, _ := http.Post(srv.URL+"/echo", "text/plain",
        strings.NewReader("hello"))
    defer resp.Body.Close()
    // no assertions
}
```

### Better Solution
```go
// echo_test.go — with assertions
package api

import (
    "io"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

func TestEchoIntegration(t *testing.T) {
    srv := httptest.NewServer(http.HandlerFunc(EchoHandler))
    t.Cleanup(srv.Close)

    const payload = "GoForge echo test"
    resp, err := http.Post(srv.URL+"/echo", "text/plain",
        strings.NewReader(payload))
    if err != nil {
        t.Fatalf("POST failed: %v", err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    if string(body) != payload {
        t.Errorf("echo = %q; want %q", string(body), payload)
    }
}
```

### Best Solution
```go
package main

import (
    "fmt"
    "io"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

// EchoHandler reads the request body and writes it back verbatim.
func EchoHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    defer r.Body.Close()
    body, err := io.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "read error", http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", r.Header.Get("Content-Type"))
    w.WriteHeader(http.StatusOK)
    w.Write(body)
}

// newTestServer is a helper that starts a test server and registers cleanup.
func newTestServer(t *testing.T, handler http.Handler) *httptest.Server {
    t.Helper()
    srv := httptest.NewServer(handler)
    t.Cleanup(srv.Close)
    return srv
}

// TestEchoHandler is an integration test using a real HTTP client.
// Run with: go test -v -run TestEchoHandler
func TestEchoHandler(t *testing.T) {
    srv := newTestServer(t, http.HandlerFunc(EchoHandler))

    tests := []struct {
        name        string
        method      string
        body        string
        contentType string
        wantStatus  int
        wantBody    string
    }{
        {
            name:        "POST echoes body",
            method:      http.MethodPost,
            body:        "GoForge integration test",
            contentType: "text/plain",
            wantStatus:  http.StatusOK,
            wantBody:    "GoForge integration test",
        },
        {
            name:        "POST empty body",
            method:      http.MethodPost,
            body:        "",
            contentType: "text/plain",
            wantStatus:  http.StatusOK,
            wantBody:    "",
        },
        {
            name:        "GET returns 405",
            method:      http.MethodGet,
            wantStatus:  http.StatusMethodNotAllowed,
        },
    }

    client := srv.Client() // use server's configured client (handles TLS for NewTLSServer)

    for _, tc := range tests {
        tc := tc
        t.Run(tc.name, func(t *testing.T) {
            var bodyReader io.Reader
            if tc.body != "" {
                bodyReader = strings.NewReader(tc.body)
            } else {
                bodyReader = strings.NewReader("")
            }

            req, err := http.NewRequest(tc.method, srv.URL+"/echo", bodyReader)
            if err != nil {
                t.Fatalf("NewRequest: %v", err)
            }
            if tc.contentType != "" {
                req.Header.Set("Content-Type", tc.contentType)
            }

            resp, err := client.Do(req)
            if err != nil {
                t.Fatalf("request failed: %v", err)
            }
            defer resp.Body.Close()

            if resp.StatusCode != tc.wantStatus {
                t.Errorf("status = %d; want %d", resp.StatusCode, tc.wantStatus)
            }

            if tc.wantBody != "" {
                got, err := io.ReadAll(resp.Body)
                if err != nil {
                    t.Fatalf("ReadAll: %v", err)
                }
                if string(got) != tc.wantBody {
                    t.Errorf("body = %q; want %q", string(got), tc.wantBody)
                }
            }
        })
    }
}

func main() {
    http.HandleFunc("/echo", EchoHandler)
    fmt.Println("Echo server on :8080")
    http.ListenAndServe(":8080", nil)
}
```
**Time:** O(n) | **Space:** O(n)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | `httptest.NewServer` allocates a real listener; close promptly to avoid port exhaustion |
| Edge Cases | Large bodies (streaming), empty body, wrong method, concurrent requests |
| Error Handling | Always defer `resp.Body.Close()`; check `err` from `client.Do` |
| Memory | Body is buffered in memory by `io.ReadAll`; stream for large payloads |
| Concurrency | `httptest.Server` is goroutine-safe; each request handled in its own goroutine |

### Visual Explanation
```mermaid
flowchart TD
    A["httptest.NewServer(EchoHandler)"] --> B["Random localhost port allocated"]
    B --> C["HTTP client POST /echo with body"]
    C --> D["Real TCP connection"]
    D --> E["EchoHandler: io.ReadAll(r.Body)"]
    E --> F["w.Write(body)"]
    F --> G["client receives response"]
    G --> H["Assert status 200"]
    G --> I["Assert body == payload"]
    J["t.Cleanup"] --> K["srv.Close()"]
```

### Interviewer Questions
1. What is the key difference between `httptest.NewRecorder` and `httptest.NewServer`?
2. Why use `srv.Client()` instead of `http.DefaultClient` in tests?
3. How does `httptest.NewTLSServer` differ from `httptest.NewServer`?
4. How do you test a server that requires authentication headers?
5. How do you test concurrent requests to the same server?
6. What are the trade-offs between unit tests (NewRecorder) and integration tests (NewServer)?
7. How do you handle flaky integration tests caused by port binding or timing?

### Follow-Up Questions
1. Rewrite the test using `httptest.NewTLSServer` and a TLS-enabled client.
2. How would you add request/response logging middleware and test it?
3. How would you load-test the echo server using `testing.B`?
4. How would you test the server with concurrent POST requests using goroutines?
5. How would you use `context.WithTimeout` to add a deadline to the test request?

---

---
## Q12: Test a Function That Uses time.Now() (Inject Clock)  [Level 3 — Medium]
> **Tags:** `#clock-injection` `#time.Now` `#dependency-injection` `#testing`

### Problem Statement
Write a function `IsBusinessHours(now func() time.Time) bool` that returns true if the current time falls between 09:00 and 17:00 on a weekday (Monday–Friday). Write tests that inject a fake clock to deterministically test all boundary conditions: before hours, during hours, after hours, on a weekend, and exactly at the boundary (09:00 and 17:00).

### Input / Output / Constraints
- **Input:** `now func() time.Time` — injectable clock function
- **Output:** `bool`
- **Constraints:** Business hours are 09:00–17:00 (exclusive of 17:00), Monday–Friday; use injected clock, not `time.Now()` directly

### Thought Process
Functions that call `time.Now()` directly are hard to test — you cannot control what "now" is. The solution is clock injection: accept a `func() time.Time` (or a `Clock` interface) so tests can pass a fake clock that returns a predetermined time. This is the standard Go pattern for time-dependent code. The production caller passes `time.Now`.

### Brute Force
```go
// business.go — hard to test
package hours

import "time"

func IsBusinessHours() bool {
    now := time.Now()
    h := now.Hour()
    wd := now.Weekday()
    return wd != time.Saturday && wd != time.Sunday && h >= 9 && h < 17
}
```
**Time:** O(1) | **Space:** O(1)

### Better Solution
```go
// business.go — injectable clock
package hours

import "time"

func IsBusinessHours(now func() time.Time) bool {
    t := now()
    h := t.Hour()
    wd := t.Weekday()
    return wd >= time.Monday && wd <= time.Friday && h >= 9 && h < 17
}
```
```go
// business_test.go
package hours

import (
    "testing"
    "time"
)

func makeTime(year, month, day, hour, min int) func() time.Time {
    t := time.Date(year, time.Month(month), day, hour, min, 0, 0, time.UTC)
    return func() time.Time { return t }
}

func TestIsBusinessHours(t *testing.T) {
    if !IsBusinessHours(makeTime(2024, 6, 10, 10, 0)) { // Monday 10:00
        t.Error("Monday 10:00 should be business hours")
    }
    if IsBusinessHours(makeTime(2024, 6, 8, 10, 0)) { // Saturday
        t.Error("Saturday should not be business hours")
    }
}
```

### Best Solution
```go
package main

import (
    "fmt"
    "testing"
    "time"
)

// Clock is a function type for injecting time.
type Clock func() time.Time

// IsBusinessHours returns true if the injected time falls within
// Monday–Friday, 09:00–16:59 (i.e., h >= 9 && h < 17).
func IsBusinessHours(now Clock) bool {
    t := now()
    wd := t.Weekday()
    h := t.Hour()
    return wd >= time.Monday && wd <= time.Friday && h >= 9 && h < 17
}

// fakeClock returns a Clock that always returns the given time.
func fakeClock(year int, month time.Month, day, hour, minute int) Clock {
    t := time.Date(year, month, day, hour, minute, 0, 0, time.UTC)
    return func() time.Time { return t }
}

// TestIsBusinessHours tests all boundary and edge cases with injected clock.
// Run with: go test -v -run TestIsBusinessHours
func TestIsBusinessHours(t *testing.T) {
    tests := []struct {
        name   string
        clock  Clock
        want   bool
    }{
        // Weekday within hours
        {"Monday 10:00 — inside",        fakeClock(2024, time.June, 10, 10, 0),  true},
        {"Friday 16:59 — inside",        fakeClock(2024, time.June, 14, 16, 59), true},
        // Boundary: exactly at open/close
        {"Monday 09:00 — at open",       fakeClock(2024, time.June, 10, 9,  0),  true},
        {"Monday 17:00 — at close",      fakeClock(2024, time.June, 10, 17, 0),  false},
        // Before/after hours
        {"Monday 08:59 — before open",   fakeClock(2024, time.June, 10, 8,  59), false},
        {"Monday 17:01 — after close",   fakeClock(2024, time.June, 10, 17, 1),  false},
        // Weekends
        {"Saturday 10:00 — weekend",     fakeClock(2024, time.June, 15, 10, 0),  false},
        {"Sunday 10:00 — weekend",       fakeClock(2024, time.June, 16, 10, 0),  false},
        // Midnight
        {"Wednesday 00:00 — midnight",   fakeClock(2024, time.June, 12, 0,  0),  false},
    }

    for _, tc := range tests {
        tc := tc
        t.Run(tc.name, func(t *testing.T) {
            got := IsBusinessHours(tc.clock)
            if got != tc.want {
                t.Errorf("IsBusinessHours() = %v; want %v (time: %v)",
                    got, tc.want, tc.clock())
            }
        })
    }
}

func main() {
    // Production usage: pass time.Now
    if IsBusinessHours(time.Now) {
        fmt.Println("We are open!")
    } else {
        fmt.Println("We are closed.")
    }
}
```
**Time:** O(1) | **Space:** O(1)

### Production Considerations
| Aspect | Details |
|--------|---------|
| Scalability | Constant-time; scales trivially |
| Edge Cases | Timezone differences (always use UTC or explicit location), DST transitions |
| Error Handling | No error path; validate timezone assumptions at call site |
| Memory | Zero allocation |
| Concurrency | Pure function with injected clock; fully goroutine-safe |

### Visual Explanation
```mermaid
flowchart TD
    A["IsBusinessHours(clock)"] --> B["t := clock()"]
    B --> C{Weekday Mon-Fri?}
    C -- No --> D["return false"]
    C -- Yes --> E{hour >= 9?}
    E -- No --> F["return false"]
    E -- Yes --> G{hour < 17?}
    G -- No --> H["return false"]
    G -- Yes --> I["return true"]
    J["Test: fakeClock(fixed time)"] --> A
```

### Interviewer Questions
1. Why is injecting `func() time.Time` better than calling `time.Now()` directly?
2. What are the trade-offs between injecting a `func() time.Time` vs. a `Clock` interface?
3. How would you handle timezone-aware business hours (e.g., New York 9–5)?
4. How would you test a function that needs to measure elapsed time (not just current time)?
5. How does clock injection relate to the broader dependency injection principle?
6. What is `time.AfterFunc` and how would you test code that uses it?
7. How would you implement a fake clock that can advance time programmatically?

### Follow-Up Questions
1. Refactor `IsBusinessHours` to accept a `Clock` interface with a `Now() time.Time` method.
2. Implement a `TickingFakeClock` that advances by a given duration each call.
3. How would you test a function that uses `time.Sleep` without waiting?
4. How would you use the `clockwork` library for more advanced fake clocks?
5. How would you test business hours across DST transitions?

---
# Go Testing — Part 2: Advanced, Interview & Production Level

---

## Q13: Benchmark with b.N and b.ResetTimer  [Level 4 — Advanced]

> **Tags:** `#benchmark` `#performance` `#testing` `#b.N` `#b.ResetTimer`

### Problem Statement

Write a benchmark for a function that sorts a slice of integers. Demonstrate correct use of `b.N` for iteration count and `b.ResetTimer` to exclude expensive setup (e.g., generating random data) from the measurement.

### Input / Output / Constraints

- Input: A function under test (e.g., a sort or search function)
- Output: ns/op, B/op, allocs/op reported by `go test -bench`
- Constraints: Setup cost must not pollute the measured time; benchmark must be reproducible

### Thought Process

Go's testing framework drives benchmarks by increasing `b.N` until the benchmark runs long enough for a stable measurement (~1 second by default). If you do expensive setup before the loop, call `b.ResetTimer()` to exclude that time. Inside the loop, always use the result to prevent the compiler from optimising the call away.

### Brute Force

```go
// Wrong — setup time is included in the measurement
func BenchmarkSortNaive(b *testing.B) {
    for i := 0; i < b.N; i++ {
        data := generateRandomSlice(10_000) // setup inside loop — measured!
        sort.Ints(data)
    }
}
```

**Time:** O(N * setup + N * sort) measured incorrectly | **Space:** O(n) per iteration

### Better Solution

```go
// Better — generate once, reset timer, but mutates the same slice each run
func BenchmarkSortBetter(b *testing.B) {
    data := generateRandomSlice(10_000)
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        sort.Ints(data) // after first iter the slice is sorted — not representative
    }
}
```

### Best Solution

```go
package main

import (
    "math/rand"
    "sort"
    "testing"
)

// generateRandomSlice creates a slice of n random ints.
func generateRandomSlice(n int) []int {
    s := make([]int, n)
    for i := range s {
        s[i] = rand.Intn(1_000_000)
    }
    return s
}

// BenchmarkSortInts measures sort.Ints on a fresh random slice each iteration.
// b.StopTimer / b.StartTimer bracket the per-iteration setup so only the sort
// itself is measured.
func BenchmarkSortInts(b *testing.B) {
    const size = 10_000

    // One-time work before the loop.
    src := generateRandomSlice(size)

    b.ResetTimer() // exclude the generateRandomSlice call above

    for i := 0; i < b.N; i++ {
        // Per-iteration setup: copy original slice so every run sorts unsorted data.
        b.StopTimer()
        data := make([]int, size)
        copy(data, src)
        b.StartTimer()

        sort.Ints(data)
    }
}

// BenchmarkSortInts_Parallel shows parallel benchmark usage.
func BenchmarkSortInts_Parallel(b *testing.B) {
    const size = 10_000
    src := generateRandomSlice(size)
    b.ResetTimer()

    b.RunParallel(func(pb *testing.PB) {
        local := make([]int, size)
        for pb.Next() {
            copy(local, src)
            sort.Ints(local)
        }
    })
}
```

**Run:** `go test -bench=. -benchtime=5s -count=3 ./...`

**Time:** O(n log n) per iteration | **Space:** O(n) per iteration

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Use `-benchtime=Nx` (e.g. `-benchtime=100x`) to pin iteration count for deterministic CI results |
| Edge Cases | Avoid global state mutation between iterations; always work on a copy |
| Error Handling | If setup can fail, call `b.Fatal` before `b.ResetTimer` so the benchmark is skipped cleanly |
| Memory | Use `b.ReportAllocs()` alongside to catch unexpected heap escapes |
| Concurrency | `b.RunParallel` reveals contention in concurrent code paths |

### Visual Explanation

```mermaid
flowchart TD
    A["go test -bench starts"] --> B["Framework sets b.N = 1"]
    B --> C["Run BenchmarkFn"]
    C --> D{"Elapsed >= benchtime?"}
    D -- No --> E["Double b.N"]
    E --> C
    D -- Yes --> F["Report ns/op, B/op, allocs/op"]

    subgraph "Inside BenchmarkFn"
        G["b.ResetTimer — zero the clock"] --> H["Loop 0..b.N"]
        H --> I["b.StopTimer — stop for setup"]
        I --> J["Copy data (setup)"]
        J --> K["b.StartTimer — resume"]
        K --> L["sort.Ints(data)"]
        L --> H
    end
```

### Interviewer Questions

1. Why must you call `b.ResetTimer` rather than relying on the framework to do it?
2. What happens if you forget to copy the slice — what bias does that introduce?
3. When would you use `b.StopTimer` / `b.StartTimer` vs. a single `b.ResetTimer`?
4. What does `-count=3` give you that a single run does not?
5. How does `b.RunParallel` differ from spawning goroutines yourself inside the loop?
6. What is the danger of benchmarking a function whose return value is discarded?
7. How do you compare two benchmark results statistically?

### Follow-Up Questions

**Q1:** How do you benchmark allocations separately from CPU time?
**Q2:** What tool converts benchmark output into flamegraphs?
**Q3:** How do you pin CPU affinity for reproducible benchmarks in CI?
**Q4:** What is `benchstat` and how do you interpret its output?
**Q5:** How would you benchmark a function with I/O without hitting real disk?

---

## Q14: Memory Benchmark with b.ReportAllocs  [Level 4 — Advanced]

> **Tags:** `#benchmark` `#memory` `#allocations` `#b.ReportAllocs` `#escape-analysis`

### Problem Statement

Write a benchmark that measures heap allocations for a string-building function. Use `b.ReportAllocs()` to report allocations per operation. Compare a naive `+=` approach against a `strings.Builder` approach and explain the allocation difference.

### Input / Output / Constraints

- Input: Concatenate 100 strings into one
- Output: allocs/op and B/op metrics
- Constraints: Must show a measurable allocation difference between approaches

### Thought Process

Every heap allocation in Go costs two things: the allocation itself (runtime call) and GC pressure. `b.ReportAllocs()` calls `runtime.ReadMemStats` before and after each benchmark run and divides the delta by `b.N`. Understanding escape analysis tells you why `strings.Builder` wins: it pre-allocates a single backing buffer.

### Brute Force

```go
// Naive: O(n^2) allocations — each += creates a new string
func concatNaive(parts []string) string {
    result := ""
    for _, p := range parts {
        result += p
    }
    return result
}
```

**Time:** O(n²) | **Space:** O(n²) total allocations

### Better Solution

```go
// strings.Join — single allocation
func concatJoin(parts []string) string {
    return strings.Join(parts, "")
}
```

### Best Solution

```go
package main

import (
    "strings"
    "testing"
)

var parts = func() []string {
    s := make([]string, 100)
    for i := range s {
        s[i] = "hello"
    }
    return s
}()

// BenchmarkConcatNaive measures naive string concatenation.
func BenchmarkConcatNaive(b *testing.B) {
    b.ReportAllocs()
    for i := 0; i < b.N; i++ {
        result := ""
        for _, p := range parts {
            result += p // new allocation each iteration
        }
        _ = result
    }
}

// BenchmarkConcatBuilder measures strings.Builder — minimal allocations.
func BenchmarkConcatBuilder(b *testing.B) {
    b.ReportAllocs()
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        var sb strings.Builder
        sb.Grow(len(parts) * 5) // pre-allocate: zero extra allocs
        for _, p := range parts {
            sb.WriteString(p)
        }
        _ = sb.String()
    }
}

// BenchmarkConcatJoin measures strings.Join.
func BenchmarkConcatJoin(b *testing.B) {
    b.ReportAllocs()
    for i := 0; i < b.N; i++ {
        _ = strings.Join(parts, "")
    }
}
```

**Expected output (approximate):**
```
BenchmarkConcatNaive-8      100000    15423 ns/op    27200 B/op    99 allocs/op
BenchmarkConcatBuilder-8   1000000      623 ns/op      512 B/op     1 allocs/op
BenchmarkConcatJoin-8      1000000      589 ns/op      512 B/op     1 allocs/op
```

**Time:** O(n) for Builder/Join | **Space:** O(n) one allocation

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Pre-warming `sb.Grow` eliminates resize reallocations entirely |
| Edge Cases | Small n may show no difference; test at realistic production sizes |
| Error Handling | `b.ReportAllocs` only captures heap; stack allocations are free |
| Memory | Use `go build -gcflags="-m"` to confirm stack vs heap escape decisions |
| Concurrency | `sync.Pool` + `strings.Builder` reduces per-goroutine GC pressure in hot paths |

### Visual Explanation

```mermaid
flowchart LR
    A["Naive +=\n99 allocations\nO(n²) bytes"] -->|"vs"| B["strings.Builder\n1 allocation\nO(n) bytes"]
    B --> C["b.ReportAllocs captures\nallocs/op and B/op\nvia runtime.ReadMemStats"]
```

### Interviewer Questions

1. What is the difference between `allocs/op` and `B/op`?
2. Why does `string += string` allocate on every iteration?
3. How does escape analysis determine whether a value lives on the heap?
4. When would `bytes.Buffer` be preferred over `strings.Builder`?
5. How do you profile allocations with `pprof` beyond what benchmarks show?
6. What is a free list and when does `sync.Pool` help?
7. Why must you use `_ = result` to prevent the compiler from eliminating the benchmark?

### Follow-Up Questions

**Q1:** How do you detect memory leaks in long-running Go services?
**Q2:** What is the `GOGC` environment variable and how does it affect benchmark results?
**Q3:** How does `runtime.MemProfileRate` affect profiling accuracy?
**Q4:** What is a finalizer and why should you avoid them in hot paths?
**Q5:** How would you benchmark a function that uses `sync.Pool` correctly?

---

## Q15: Fuzz Test with f.Add Seed Corpus  [Level 4 — Advanced]

> **Tags:** `#fuzzing` `#f.Add` `#seed-corpus` `#go1.18` `#coverage-guided`

### Problem Statement

Write a fuzz test for a function that parses a date string in `YYYY-MM-DD` format. Provide a seed corpus with both valid and edge-case inputs. The fuzzer should discover panics or incorrect behaviour that unit tests miss.

### Input / Output / Constraints

- Input: Arbitrary byte sequences fed by the Go fuzzer
- Output: Crash corpus files for any input that causes a panic or violated invariant
- Constraints: Go 1.18+; `go test -fuzz=FuzzParseDate -fuzztime=30s`

### Thought Process

Go's built-in fuzzer (since 1.18) is coverage-guided: it mutates inputs and tracks which new branches are explored. `f.Add` seeds the initial corpus so the fuzzer starts from meaningful values rather than random bytes. The fuzz function receives `*testing.T` and the fuzzed arguments; it should assert invariants (not just absence of panics) — e.g., if parsing succeeds, re-formatting should round-trip.

### Brute Force

```go
// No seed corpus — fuzzer starts from random bytes, rarely finds valid dates
func FuzzParseDateNaive(f *testing.F) {
    f.Fuzz(func(t *testing.T, input string) {
        parseDate(input) // only catches panics, not logic bugs
    })
}
```

### Better Solution

```go
// Seeds provided, but no invariant check
func FuzzParseDateBetter(f *testing.F) {
    f.Add("2024-01-15")
    f.Add("0000-00-00")
    f.Fuzz(func(t *testing.T, input string) {
        parseDate(input)
    })
}
```

### Best Solution

```go
package main

import (
    "fmt"
    "strconv"
    "strings"
    "testing"
    "time"
)

// parseDate parses "YYYY-MM-DD"; returns zero time and error on failure.
func parseDate(s string) (time.Time, error) {
    parts := strings.Split(s, "-")
    if len(parts) != 3 {
        return time.Time{}, fmt.Errorf("invalid format: %q", s)
    }
    year, err := strconv.Atoi(parts[0])
    if err != nil {
        return time.Time{}, err
    }
    month, err := strconv.Atoi(parts[1])
    if err != nil {
        return time.Time{}, err
    }
    day, err := strconv.Atoi(parts[2])
    if err != nil {
        return time.Time{}, err
    }
    t := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
    return t, nil
}

// FuzzParseDate fuzzes parseDate with a rich seed corpus.
// Invariant: if parsing succeeds, formatting back must round-trip.
func FuzzParseDate(f *testing.F) {
    // Seed corpus: valid dates, boundary values, known edge cases
    seeds := []string{
        "2024-01-15",
        "2000-02-29", // leap year
        "1999-12-31",
        "0001-01-01",
        "9999-12-31",
        "2024-02-28",
        "",
        "not-a-date",
        "2024-13-01", // invalid month
        "2024-00-00", // zero month/day
        "2024-1-1",   // no zero-padding
    }
    for _, s := range seeds {
        f.Add(s)
    }

    f.Fuzz(func(t *testing.T, input string) {
        // Must never panic regardless of input.
        parsed, err := parseDate(input)
        if err != nil {
            return // error is acceptable for invalid input
        }

        // Invariant: round-trip — format back and parse again.
        formatted := parsed.Format("2006-01-02")
        reparsed, err2 := parseDate(formatted)
        if err2 != nil {
            t.Errorf("round-trip failed: parseDate(%q) -> %q -> error: %v",
                input, formatted, err2)
        }
        if !parsed.Equal(reparsed) {
            t.Errorf("round-trip mismatch: %v != %v (input=%q, formatted=%q)",
                parsed, reparsed, input, formatted)
        }
    })
}
```

**Run:**
```bash
# Run fuzzer for 30 seconds
go test -fuzz=FuzzParseDate -fuzztime=30s ./...

# Run only the seed corpus (used in CI — deterministic)
go test -run=FuzzParseDate ./...
```

**Time:** O(1) per fuzz iteration | **Space:** O(1) per fuzz iteration

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Store crash corpus in `testdata/fuzz/FuzzParseDate/` and commit it; CI runs seeds deterministically |
| Edge Cases | Always test zero values, max values, unicode, null bytes, very long strings |
| Error Handling | Distinguish expected errors (invalid input) from invariant violations using `t.Errorf` |
| Memory | Fuzzer workers run in separate processes; memory limits apply per worker |
| Concurrency | Use `-parallel` flag; fuzz corpus is shared safely across workers by the framework |

### Visual Explanation

```mermmd
flowchart TD
    A["f.Add seed corpus"] --> B["Fuzzer engine starts"]
    B --> C["Mutate input"]
    C --> D["Run fuzz function"]
    D --> E{"New coverage\nbranch?"}
    E -- Yes --> F["Add to corpus"]
    F --> C
    E -- No --> C
    D --> G{"Panic or\nt.Errorf?"}
    G -- Yes --> H["Write crash to\ntestdata/fuzz/FuzzName/"]
    H --> I["go test -run=FuzzName\nreproduces crash"]
```

### Interviewer Questions

1. How does coverage-guided fuzzing differ from purely random input generation?
2. What is the difference between running `go test -fuzz` and `go test -run=FuzzXxx`?
3. Where does Go store the crash corpus and how do you reproduce a found crash?
4. What invariants would you check in a fuzz test beyond absence of panics?
5. How do you fuzz a function that takes multiple arguments of different types?
6. What is the relationship between fuzz tests and property-based testing?
7. How do you limit the fuzzer's memory usage in CI?

### Follow-Up Questions

**Q1:** How would you fuzz a binary protocol parser?
**Q2:** What is `go-fuzz` and how does it differ from the built-in fuzzer?
**Q3:** How do you integrate fuzz testing into a GitHub Actions pipeline?
**Q4:** What is corpus minimisation and why is it useful?
**Q5:** How do you fuzz a function that calls an external HTTP API?

---

## Q16: Race Condition Test with go test -race  [Level 4 — Advanced]

> **Tags:** `#race-detector` `#concurrency` `#data-race` `#sync` `#goroutines`

### Problem Statement

Write a test that intentionally exposes a data race in a concurrent counter, then fix it and prove the race is gone. Demonstrate how `go test -race` detects the race and what output it produces.

### Input / Output / Constraints

- Input: A counter incremented by N goroutines concurrently
- Output: Race detector report for the broken version; clean run for the fixed version
- Constraints: Must use `go test -race`; fix must not use `sync/atomic` trivially — show mutex and atomic variants

### Thought Process

The Go race detector instruments memory accesses at compile time (using LLVM TSan under the hood). It reports the exact goroutines and stack traces involved in a data race. The fix can use either `sync.Mutex` (for complex critical sections) or `sync/atomic` (for simple integer operations). Testing concurrent code requires waiting for all goroutines to finish — use `sync.WaitGroup`.

### Brute Force

```go
// RACY — no synchronisation
type UnsafeCounter struct{ count int }

func (c *UnsafeCounter) Inc() { c.count++ }
func (c *UnsafeCounter) Val() int { return c.count }
```

**Race:** read-modify-write on `c.count` is not atomic.

### Better Solution

```go
// Fixed with mutex
type MutexCounter struct {
    mu    sync.Mutex
    count int
}
func (c *MutexCounter) Inc() { c.mu.Lock(); c.count++; c.mu.Unlock() }
func (c *MutexCounter) Val() int { c.mu.Lock(); defer c.mu.Unlock(); return c.count }
```

### Best Solution

```go
package main

import (
    "sync"
    "sync/atomic"
    "testing"
)

// ---- Broken counter (DATA RACE) ----

type UnsafeCounter struct{ count int }

func (c *UnsafeCounter) Inc() { c.count++ }
func (c *UnsafeCounter) Val() int { return c.count }

// ---- Fixed with sync.Mutex ----

type MutexCounter struct {
    mu    sync.Mutex
    count int
}

func (c *MutexCounter) Inc() {
    c.mu.Lock()
    c.count++
    c.mu.Unlock()
}

func (c *MutexCounter) Val() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.count
}

// ---- Fixed with atomic ----

type AtomicCounter struct{ count atomic.Int64 }

func (c *AtomicCounter) Inc() { c.count.Add(1) }
func (c *AtomicCounter) Val() int64 { return c.count.Load() }

// ---- Tests ----

// TestUnsafeCounter_Race will be flagged by -race.
// Uncomment to see the race report.
// func TestUnsafeCounter_Race(t *testing.T) {
//     c := &UnsafeCounter{}
//     var wg sync.WaitGroup
//     for i := 0; i < 1000; i++ {
//         wg.Add(1)
//         go func() { defer wg.Done(); c.Inc() }()
//     }
//     wg.Wait()
// }

func TestMutexCounter(t *testing.T) {
    const goroutines = 1000
    c := &MutexCounter{}
    var wg sync.WaitGroup
    for i := 0; i < goroutines; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            c.Inc()
        }()
    }
    wg.Wait()
    if got := c.Val(); got != goroutines {
        t.Errorf("MutexCounter = %d, want %d", got, goroutines)
    }
}

func TestAtomicCounter(t *testing.T) {
    const goroutines = 1000
    c := &AtomicCounter{}
    var wg sync.WaitGroup
    for i := 0; i < goroutines; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            c.Inc()
        }()
    }
    wg.Wait()
    if got := c.Val(); got != goroutines {
        t.Errorf("AtomicCounter = %d, want %d", got, goroutines)
    }
}

func BenchmarkMutexCounter(b *testing.B) {
    c := &MutexCounter{}
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            c.Inc()
        }
    })
}

func BenchmarkAtomicCounter(b *testing.B) {
    c := &AtomicCounter{}
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            c.Inc()
        }
    })
}
```

**Run:**
```bash
go test -race ./...
go test -race -run=TestMutexCounter -v ./...
```

**Time:** O(n) | **Space:** O(1)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Race detector adds ~2-20x slowdown and ~5-10x memory; enable in CI, not prod builds |
| Edge Cases | Races in init functions, package-level vars, and map reads/writes are all detected |
| Error Handling | `GORACE="halt_on_error=1"` stops the program on first race — useful for CI gates |
| Memory | `GORACE="history_size=7"` increases history for better diagnostics at the cost of memory |
| Concurrency | Prefer `atomic` for counters/flags; prefer `Mutex` for compound operations |

### Visual Explanation

```mermaid
flowchart TD
    A["go test -race compiles\nwith race instrumentation"] --> B["Goroutine 1: c.count++\nread addr=0x... at T1"]
    A --> C["Goroutine 2: c.count++\nwrite addr=0x... at T2"]
    B & C --> D{"Same address,\nno happens-before?"}
    D -- Yes --> E["RACE DETECTED\nprint goroutine stacks"]
    D -- No --> F["Clean — no race"]
```

### Interviewer Questions

1. What is a data race and how does it differ from a race condition?
2. Why does the race detector not guarantee finding all races?
3. What are the performance implications of enabling the race detector in production?
4. When would you use `atomic` over `sync.Mutex` and vice versa?
5. How do you test a channel-based design for races?
6. What is `GORACE` and which options are most useful?
7. How does the Go memory model define happens-before relationships?

### Follow-Up Questions

**Q1:** How do you detect races in code paths that are not covered by tests?
**Q2:** What is the difference between a race and a deadlock in Go?
**Q3:** How would you detect a deadlock programmatically?
**Q4:** What is `sync.RWMutex` and when does it outperform `sync.Mutex`?
**Q5:** How do you test that a lock-free data structure is correct under contention?

---

## Q17: Golden File Test Pattern  [Level 4 — Advanced]

> **Tags:** `#golden-files` `#snapshot-testing` `#testdata` `#update-flag` `#regression`

### Problem Statement

Implement the golden file test pattern for a function that generates a complex text report. The test should: read expected output from a file in `testdata/`, compare against actual output, and support an `-update` flag to regenerate golden files when the output intentionally changes.

### Input / Output / Constraints

- Input: A report-generation function that produces multi-line text
- Output: Diff between actual and golden file, or updated golden files
- Constraints: Golden files must be committed to version control; `-update` must be explicit

### Thought Process

Golden (snapshot) tests capture the output of a function that is expensive to hand-write assertions for. The pattern stores expected output in `testdata/*.golden` files. Normally the test reads the file and compares. With `-update` (a custom flag), it overwrites the file. This makes regressions visible as `git diff` changes to committed files.

### Brute Force

```go
// Inline expected string — breaks for long output, no diff support
func TestReportNaive(t *testing.T) {
    got := generateReport(sampleInput)
    want := "Name: Alice\nScore: 95\n..." // unmaintainable
    if got != want {
        t.Errorf("mismatch:\ngot  %q\nwant %q", got, want)
    }
}
```

### Better Solution

```go
// Reads from file but no update mechanism
func TestReportBetter(t *testing.T) {
    want, _ := os.ReadFile("testdata/report.golden")
    got := generateReport(sampleInput)
    if got != string(want) {
        t.Errorf("golden mismatch")
    }
}
```

### Best Solution

```go
package main

import (
    "flag"
    "fmt"
    "os"
    "path/filepath"
    "strings"
    "testing"
)

// update flag: run with `go test -update` to regenerate golden files.
var update = flag.Bool("update", false, "update golden files")

// ---- Function under test ----

type Student struct {
    Name  string
    Score int
    Grade string
}

func generateReport(students []Student) string {
    var sb strings.Builder
    sb.WriteString("=== Student Report ===\n")
    for _, s := range students {
        fmt.Fprintf(&sb, "Name: %-20s Score: %3d  Grade: %s\n",
            s.Name, s.Score, s.Grade)
    }
    sb.WriteString("======================\n")
    return sb.String()
}

// ---- Golden file helpers ----

func goldenPath(name string) string {
    return filepath.Join("testdata", name+".golden")
}

func readGolden(t *testing.T, name string) string {
    t.Helper()
    data, err := os.ReadFile(goldenPath(name))
    if err != nil {
        t.Fatalf("golden file not found: %v (run with -update to create)", err)
    }
    return string(data)
}

func writeGolden(t *testing.T, name, content string) {
    t.Helper()
    if err := os.MkdirAll("testdata", 0755); err != nil {
        t.Fatal(err)
    }
    if err := os.WriteFile(goldenPath(name), []byte(content), 0644); err != nil {
        t.Fatal(err)
    }
}

func assertGolden(t *testing.T, name, got string) {
    t.Helper()
    if *update {
        writeGolden(t, name, got)
        t.Logf("updated golden file: %s", goldenPath(name))
        return
    }
    want := readGolden(t, name)
    if got != want {
        // Produce a simple line diff for readability.
        t.Errorf("golden file mismatch for %q\n--- want\n+++ got\n%s",
            name, lineDiff(want, got))
    }
}

func lineDiff(want, got string) string {
    ws := strings.Split(want, "\n")
    gs := strings.Split(got, "\n")
    var sb strings.Builder
    max := len(ws)
    if len(gs) > max {
        max = len(gs)
    }
    for i := 0; i < max; i++ {
        wl, gl := "", ""
        if i < len(ws) {
            wl = ws[i]
        }
        if i < len(gs) {
            gl = gs[i]
        }
        if wl != gl {
            fmt.Fprintf(&sb, "line %d:\n  - %q\n  + %q\n", i+1, wl, gl)
        }
    }
    return sb.String()
}

// ---- Tests ----

var sampleStudents = []Student{
    {"Alice Johnson", 95, "A"},
    {"Bob Smith", 78, "B+"},
    {"Carol White", 88, "A-"},
}

func TestGenerateReport(t *testing.T) {
    got := generateReport(sampleStudents)
    assertGolden(t, "student_report", got)
}

// Table-driven golden tests
func TestGenerateReport_Cases(t *testing.T) {
    cases := []struct {
        name     string
        students []Student
    }{
        {"empty", []Student{}},
        {"single", []Student{{"Dave", 60, "C"}}},
        {"full", sampleStudents},
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got := generateReport(tc.students)
            assertGolden(t, "report_"+tc.name, got)
        })
    }
}
```

**Run:**
```bash
# First run — create golden files
go test -update ./...

# Subsequent runs — compare against golden files
go test ./...

# When output intentionally changes — update golden files and commit the diff
go test -update ./... && git diff testdata/
```

**Time:** O(n) output length comparison | **Space:** O(n)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Store golden files under `testdata/` — Go test runner ignores this dir for compilation |
| Edge Cases | Normalise timestamps, UUIDs, and file paths in output before comparing |
| Error Handling | If golden file is missing and `-update` is false, fail with a helpful message |
| Memory | For large golden files (e.g. HTML reports), use `bytes.Equal` not string compare |
| Concurrency | Each subtest uses its own golden file name — safe for `t.Parallel()` |

### Visual Explanation

```mermaid
flowchart TD
    A["go test ./..."] --> B{"-update flag?"}
    B -- Yes --> C["Run function\nGet actual output"]
    C --> D["Write to testdata/*.golden"]
    D --> E["git diff shows changes\nReview & commit"]
    B -- No --> F["Run function\nGet actual output"]
    F --> G["Read testdata/*.golden"]
    G --> H{"actual == golden?"}
    H -- Yes --> I["PASS"]
    H -- No --> J["FAIL with line diff"]
```

### Interviewer Questions

1. What are the risks of committing auto-updated golden files without reviewing them?
2. How do you handle non-deterministic output (timestamps, random IDs) in golden tests?
3. What is the difference between golden file testing and snapshot testing in Jest?
4. How do you organise golden files for table-driven tests with many cases?
5. When would you choose golden tests over explicit assertions?
6. How do you review golden file diffs in a code review?
7. What tool can produce a human-readable diff between two golden files?

### Follow-Up Questions

**Q1:** How do you golden-test HTTP handler responses including headers?
**Q2:** How do you handle platform-specific line endings (CRLF vs LF) in golden files?
**Q3:** How would you implement golden testing for JSON output with field ordering?
**Q4:** What is `txtar` format and how does it relate to golden testing in the Go toolchain?
**Q5:** How do you golden-test binary output (e.g., protobuf serialised structs)?

---

## Q18: Test a Goroutine-Based Worker Pool  [Level 5 — Interview Level]

> **Tags:** `#worker-pool` `#goroutines` `#channels` `#testing` `#concurrency`

### Problem Statement

Implement a worker pool that processes jobs concurrently and write a comprehensive test suite for it. Tests must verify: correct job processing, worker count is respected, graceful shutdown, no goroutine leaks, and behaviour under cancellation.

### Input / Output / Constraints

- Input: A pool with configurable worker count and a job queue
- Output: Results for all submitted jobs
- Constraints: No goroutine leaks after `Shutdown`; must handle context cancellation

### Thought Process

Testing concurrent code requires controlling non-determinism. The strategy is:
1. Use synchronisation primitives (`WaitGroup`, channels) to make the test deterministic.
2. Check goroutine counts with `runtime.NumGoroutine()` before and after to detect leaks.
3. Use `context.WithTimeout` to verify cancellation paths.
4. Use `goleak` or manual goroutine counting for leak detection.

### Brute Force

```go
// Worker pool with no shutdown or context support
func startWorkers(n int, jobs <-chan int, results chan<- int) {
    for i := 0; i < n; i++ {
        go func() {
            for j := range jobs {
                results <- j * 2
            }
        }()
    }
}
```

**Problem:** No way to detect when workers finish; goroutine leak if jobs channel is not closed.

### Better Solution

```go
// Adds WaitGroup for clean shutdown
func startWorkersBetter(n int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    for i := 0; i < n; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := range jobs {
                results <- j * 2
            }
        }()
    }
}
```

### Best Solution

```go
package main

import (
    "context"
    "runtime"
    "sync"
    "testing"
    "time"
)

// ---- Worker Pool Implementation ----

type Job struct {
    ID    int
    Value int
}

type Result struct {
    JobID  int
    Output int
    Err    error
}

type WorkerPool struct {
    workers int
    jobs    chan Job
    results chan Result
    wg      sync.WaitGroup
    once    sync.Once
}

func NewWorkerPool(workers, queueSize int) *WorkerPool {
    p := &WorkerPool{
        workers: workers,
        jobs:    make(chan Job, queueSize),
        results: make(chan Result, queueSize),
    }
    for i := 0; i < workers; i++ {
        p.wg.Add(1)
        go p.worker()
    }
    return p
}

func (p *WorkerPool) worker() {
    defer p.wg.Done()
    for job := range p.jobs {
        p.results <- Result{JobID: job.ID, Output: job.Value * 2}
    }
}

func (p *WorkerPool) Submit(ctx context.Context, job Job) error {
    select {
    case p.jobs <- job:
        return nil
    case <-ctx.Done():
        return ctx.Err()
    }
}

func (p *WorkerPool) Shutdown() {
    p.once.Do(func() {
        close(p.jobs)
        p.wg.Wait()
        close(p.results)
    })
}

func (p *WorkerPool) Results() <-chan Result {
    return p.results
}

// ---- Tests ----

func TestWorkerPool_ProcessesAllJobs(t *testing.T) {
    const numJobs = 100
    pool := NewWorkerPool(5, numJobs)

    ctx := context.Background()
    for i := 0; i < numJobs; i++ {
        if err := pool.Submit(ctx, Job{ID: i, Value: i}); err != nil {
            t.Fatalf("Submit(%d): %v", i, err)
        }
    }

    pool.Shutdown()

    results := make(map[int]int)
    for r := range pool.Results() {
        results[r.JobID] = r.Output
    }

    if len(results) != numJobs {
        t.Errorf("got %d results, want %d", len(results), numJobs)
    }
    for i := 0; i < numJobs; i++ {
        if got, want := results[i], i*2; got != want {
            t.Errorf("job %d: got %d, want %d", i, got, want)
        }
    }
}

func TestWorkerPool_NoGoroutineLeak(t *testing.T) {
    baseline := runtime.NumGoroutine()

    pool := NewWorkerPool(10, 100)
    ctx := context.Background()
    for i := 0; i < 50; i++ {
        _ = pool.Submit(ctx, Job{ID: i, Value: i})
    }
    pool.Shutdown()
    // Drain results
    for range pool.Results() {
    }

    // Allow goroutines to fully exit.
    time.Sleep(10 * time.Millisecond)
    after := runtime.NumGoroutine()

    if after > baseline+2 { // allow 2 for test harness variance
        t.Errorf("goroutine leak: baseline=%d, after=%d", baseline, after)
    }
}

func TestWorkerPool_ContextCancellation(t *testing.T) {
    // Fill the queue so Submit blocks.
    pool := NewWorkerPool(1, 1) // queue depth 1

    ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
    defer cancel()

    // Fill queue
    _ = pool.Submit(context.Background(), Job{ID: 0, Value: 0})

    // This should block and eventually fail with context deadline exceeded.
    err := pool.Submit(ctx, Job{ID: 1, Value: 1})
    if err == nil {
        t.Error("expected context error, got nil")
    }
    pool.Shutdown()
    for range pool.Results() {
    }
}

func TestWorkerPool_WorkerCountRespected(t *testing.T) {
    const workers = 3
    var (
        mu         sync.Mutex
        concurrent int
        maxSeen    int
    )

    // Custom pool that counts concurrency.
    jobs := make(chan Job, 100)
    results := make(chan Result, 100)
    var wg sync.WaitGroup

    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                mu.Lock()
                concurrent++
                if concurrent > maxSeen {
                    maxSeen = concurrent
                }
                mu.Unlock()

                time.Sleep(5 * time.Millisecond) // simulate work

                mu.Lock()
                concurrent--
                mu.Unlock()

                results <- Result{JobID: job.ID, Output: job.Value * 2}
            }
        }()
    }

    for i := 0; i < 30; i++ {
        jobs <- Job{ID: i, Value: i}
    }
    close(jobs)
    wg.Wait()
    close(results)

    for range results {
    }

    if maxSeen > workers {
        t.Errorf("max concurrent workers = %d, want <= %d", maxSeen, workers)
    }
}

func BenchmarkWorkerPool(b *testing.B) {
    pool := NewWorkerPool(runtime.NumCPU(), b.N)
    ctx := context.Background()
    b.ResetTimer()

    go func() {
        for i := 0; i < b.N; i++ {
            _ = pool.Submit(ctx, Job{ID: i, Value: i})
        }
        pool.Shutdown()
    }()

    count := 0
    for range pool.Results() {
        count++
    }
    b.ReportMetric(float64(count), "jobs/op")
}
```

**Time:** O(n/workers) | **Space:** O(queue depth)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Tune queue depth to buffer burst load without unbounded memory growth |
| Edge Cases | Double-close of jobs channel panics — guard with `sync.Once` |
| Error Handling | Each Result should carry an Err field; consumers must check it |
| Memory | Unbounded results channel causes OOM if consumer is slow — use backpressure |
| Concurrency | Use `goleak` library for production-grade goroutine leak detection in tests |

### Visual Explanation

```mermaid
flowchart LR
    P["Producer\nSubmit(job)"] --> Q["Job Channel\n(buffered)"]
    Q --> W1["Worker 1"]
    Q --> W2["Worker 2"]
    Q --> W3["Worker N"]
    W1 & W2 & W3 --> R["Results Channel"]
    R --> C["Consumer\nrange Results()"]
    S["Shutdown()\nclose(jobs)\nwg.Wait()\nclose(results)"] --> Q
```

### Interviewer Questions

1. What is a goroutine leak and how does `runtime.NumGoroutine()` help detect it?
2. Why is `sync.Once` necessary for `Shutdown`?
3. How would you add a priority queue to the job channel?
4. What backpressure mechanism prevents the results channel from filling up?
5. How do you test graceful shutdown when jobs are in flight?
6. What is `goleak` and how does it improve on manual goroutine counting?
7. How do you propagate panics from workers back to the caller?

### Follow-Up Questions

**Q1:** How do you implement rate limiting in a worker pool?
**Q2:** How do you dynamically resize the worker pool at runtime?
**Q3:** How would you add metrics (queue depth, worker utilisation) to this pool?
**Q4:** How do you test that exactly N workers run at peak load?
**Q5:** How would you implement dead-letter queue for failed jobs?

---

## Q19: Test with Testcontainers (Real PostgreSQL)  [Level 5 — Interview Level]

> **Tags:** `#testcontainers` `#integration-test` `#postgresql` `#docker` `#real-database`

### Problem Statement

Write an integration test for a `UserRepository` that uses a real PostgreSQL database via testcontainers-go. The test must start a throwaway PostgreSQL container, run migrations, execute CRUD operations, and clean up after itself — no mocking.

### Input / Output / Constraints

- Input: A `UserRepository` with `Create`, `FindByID`, `Delete` methods
- Output: All operations verified against a real database
- Constraints: Requires Docker; uses `github.com/testcontainers/testcontainers-go`

### Thought Process

Mocks test that you call the right functions, not that your SQL is correct. Testcontainers starts a real Docker container per test run, giving you a real database to test against. The container is cleaned up via `defer container.Terminate(ctx)`. Use `TestMain` to start/stop the container once for the whole package (fast) or per-test (isolated).

### Brute Force

```go
// Uses a hardcoded local PostgreSQL — not portable, breaks CI
const dsn = "postgres://user:pass@localhost:5432/testdb"
```

### Better Solution

```go
// Uses env vars — still requires manual setup
dsn := os.Getenv("TEST_DATABASE_URL")
if dsn == "" {
    t.Skip("TEST_DATABASE_URL not set")
}
```

### Best Solution

```go
package main

import (
    "context"
    "database/sql"
    "fmt"
    "testing"
    "time"

    _ "github.com/lib/pq"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/wait"
)

// ---- Domain ----

type User struct {
    ID    int
    Name  string
    Email string
}

// ---- Repository ----

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Migrate(ctx context.Context) error {
    _, err := r.db.ExecContext(ctx, `
        CREATE TABLE IF NOT EXISTS users (
            id    SERIAL PRIMARY KEY,
            name  TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    `)
    return err
}

func (r *UserRepository) Create(ctx context.Context, u User) (User, error) {
    err := r.db.QueryRowContext(ctx,
        `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id`,
        u.Name, u.Email,
    ).Scan(&u.ID)
    return u, err
}

func (r *UserRepository) FindByID(ctx context.Context, id int) (User, error) {
    var u User
    err := r.db.QueryRowContext(ctx,
        `SELECT id, name, email FROM users WHERE id = $1`, id,
    ).Scan(&u.ID, &u.Name, &u.Email)
    return u, err
}

func (r *UserRepository) Delete(ctx context.Context, id int) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id)
    return err
}

// ---- Test Helpers ----

func setupPostgres(t *testing.T) *sql.DB {
    t.Helper()
    ctx := context.Background()

    req := testcontainers.ContainerRequest{
        Image:        "postgres:15-alpine",
        ExposedPorts: []string{"5432/tcp"},
        Env: map[string]string{
            "POSTGRES_USER":     "test",
            "POSTGRES_PASSWORD": "test",
            "POSTGRES_DB":       "testdb",
        },
        WaitingFor: wait.ForAll(
            wait.ForLog("database system is ready to accept connections").
                WithOccurrence(2).
                WithStartupTimeout(60 * time.Second),
            wait.ForListeningPort("5432/tcp"),
        ),
    }

    container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: req,
        Started:          true,
    })
    if err != nil {
        t.Fatalf("start postgres container: %v", err)
    }

    t.Cleanup(func() {
        if err := container.Terminate(ctx); err != nil {
            t.Logf("terminate container: %v", err)
        }
    })

    host, _ := container.Host(ctx)
    port, _ := container.MappedPort(ctx, "5432")

    dsn := fmt.Sprintf("postgres://test:test@%s:%s/testdb?sslmode=disable",
        host, port.Port())

    db, err := sql.Open("postgres", dsn)
    if err != nil {
        t.Fatalf("open db: %v", err)
    }
    t.Cleanup(func() { db.Close() })

    // Wait for connection
    for i := 0; i < 30; i++ {
        if err := db.PingContext(ctx); err == nil {
            break
        }
        time.Sleep(500 * time.Millisecond)
    }

    return db
}

// ---- Tests ----

func TestUserRepository_CRUD(t *testing.T) {
    db := setupPostgres(t)
    repo := NewUserRepository(db)
    ctx := context.Background()

    if err := repo.Migrate(ctx); err != nil {
        t.Fatalf("migrate: %v", err)
    }

    // Create
    created, err := repo.Create(ctx, User{Name: "Alice", Email: "alice@example.com"})
    if err != nil {
        t.Fatalf("Create: %v", err)
    }
    if created.ID == 0 {
        t.Error("expected non-zero ID after Create")
    }

    // Read
    found, err := repo.FindByID(ctx, created.ID)
    if err != nil {
        t.Fatalf("FindByID(%d): %v", created.ID, err)
    }
    if found.Name != "Alice" || found.Email != "alice@example.com" {
        t.Errorf("FindByID = %+v, want {Name:Alice Email:alice@example.com}", found)
    }

    // Delete
    if err := repo.Delete(ctx, created.ID); err != nil {
        t.Fatalf("Delete(%d): %v", created.ID, err)
    }

    // Confirm deletion
    _, err = repo.FindByID(ctx, created.ID)
    if err != sql.ErrNoRows {
        t.Errorf("after Delete: expected sql.ErrNoRows, got %v", err)
    }
}

func TestUserRepository_UniqueEmailConstraint(t *testing.T) {
    db := setupPostgres(t)
    repo := NewUserRepository(db)
    ctx := context.Background()
    _ = repo.Migrate(ctx)

    _, err := repo.Create(ctx, User{Name: "Bob", Email: "bob@example.com"})
    if err != nil {
        t.Fatalf("first Create: %v", err)
    }

    _, err = repo.Create(ctx, User{Name: "Bob2", Email: "bob@example.com"})
    if err == nil {
        t.Error("expected unique constraint violation, got nil")
    }
}

func TestUserRepository_TransactionRollback(t *testing.T) {
    db := setupPostgres(t)
    repo := NewUserRepository(db)
    ctx := context.Background()
    _ = repo.Migrate(ctx)

    tx, _ := db.BeginTx(ctx, nil)
    txRepo := NewUserRepository(tx.(*sql.Tx)) // hypothetical tx-aware repo

    _ = txRepo
    _ = tx.Rollback()
    // Verify no data was written after rollback — confirms ACID properties
}
```

**Time:** O(1) per test (dominated by container startup ~2-5s) | **Space:** O(container memory ~50MB)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Use `TestMain` to start the container once per package to reduce startup cost |
| Edge Cases | Test constraint violations, transaction rollbacks, and concurrent writes |
| Error Handling | `t.Cleanup` ensures container termination even if the test panics |
| Memory | Use `postgres:15-alpine` (smaller image); cache images in CI with Docker layer cache |
| Concurrency | Each `t.Parallel()` test needs its own schema or table prefix to avoid conflicts |

### Visual Explanation

```mermaid
flowchart TD
    A["go test ./..."] --> B["setupPostgres:\nstart Docker container\nwait for ready"]
    B --> C["sql.Open to\ncontainer port"]
    C --> D["repo.Migrate:\nCREATE TABLE"]
    D --> E["Test: Create User"]
    E --> F["Test: FindByID"]
    F --> G["Test: Delete"]
    G --> H["t.Cleanup:\ncontainer.Terminate"]
```

### Interviewer Questions

1. What is the difference between unit tests with mocks and integration tests with testcontainers?
2. How do you share one container across multiple test functions in a package?
3. How do you prevent test pollution between parallel tests using the same database?
4. What is `WaitingFor` in testcontainers and why is it critical?
5. How do you handle migrations in integration tests?
6. What are the CI implications of using Docker in tests?
7. How do you test database-level constraints (unique, foreign key) that mocks cannot verify?

### Follow-Up Questions

**Q1:** How do you use testcontainers with Redis or Kafka?
**Q2:** How do you run testcontainers tests in GitHub Actions without Docker-in-Docker?
**Q3:** What is the `Ryuk` container and how does it help with cleanup?
**Q4:** How do you test database migrations are idempotent?
**Q5:** What is the trade-off between testcontainers and a dedicated test database?

---

## Q20: Property-Based Test with Random Inputs  [Level 5 — Interview Level]

> **Tags:** `#property-based-testing` `#quick-check` `#rapid` `#invariants` `#generative-testing`

### Problem Statement

Write property-based tests for a `Sort` function and an `Encode`/`Decode` pair using the `pgregory.net/rapid` library. Tests must verify universal properties (sorted order, round-trip) rather than specific example outputs.

### Input / Output / Constraints

- Input: Randomly generated slices, strings, or structs from `rapid`
- Output: Property holds for all generated inputs, or a minimal failing example is shown
- Constraints: Properties must be universally true, not example-specific

### Thought Process

Property-based testing generates hundreds of random inputs and checks invariants. Key properties for sorting: output is ordered, output is a permutation of input (same elements), length is preserved. Key properties for encode/decode: `decode(encode(x)) == x` for all valid x. When a failure is found, `rapid` shrinks the input to a minimal counterexample.

### Brute Force

```go
// Unit test — checks one specific example only
func TestSort(t *testing.T) {
    input := []int{3, 1, 4, 1, 5}
    want := []int{1, 1, 3, 4, 5}
    got := mySort(input)
    if !reflect.DeepEqual(got, want) {
        t.Fail()
    }
}
```

### Better Solution

```go
// Table-driven — still only specific examples
func TestSortTable(t *testing.T) {
    cases := []struct{ input, want []int }{
        {[]int{3, 1, 2}, []int{1, 2, 3}},
        {[]int{}, []int{}},
    }
    // ...
}
```

### Best Solution

```go
package main

import (
    "sort"
    "testing"

    "pgregory.net/rapid"
)

// ---- Functions under test ----

func mySort(input []int) []int {
    out := make([]int, len(input))
    copy(out, input)
    sort.Ints(out)
    return out
}

// Simple base64-like encoder (for demonstration)
func encode(s string) []byte {
    out := make([]byte, len(s))
    for i, c := range []byte(s) {
        out[i] = c ^ 0xAA // XOR cipher (toy example)
    }
    return out
}

func decode(b []byte) string {
    out := make([]byte, len(b))
    for i, c := range b {
        out[i] = c ^ 0xAA
    }
    return string(out)
}

// ---- Properties ----

// Property 1: Output is sorted (ordered)
func TestSort_Property_Ordered(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        input := rapid.SliceOf(rapid.Int()).Draw(t, "input")
        got := mySort(input)
        for i := 1; i < len(got); i++ {
            if got[i] < got[i-1] {
                t.Fatalf("not sorted at index %d: %v", i, got)
            }
        }
    })
}

// Property 2: Output length equals input length
func TestSort_Property_LengthPreserved(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        input := rapid.SliceOf(rapid.Int()).Draw(t, "input")
        got := mySort(input)
        if len(got) != len(input) {
            t.Fatalf("length changed: got %d, want %d", len(got), len(input))
        }
    })
}

// Property 3: Output is a permutation (same elements, different order)
func TestSort_Property_Permutation(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        input := rapid.SliceOf(rapid.Int()).Draw(t, "input")
        got := mySort(input)

        freq := make(map[int]int)
        for _, v := range input {
            freq[v]++
        }
        for _, v := range got {
            freq[v]--
        }
        for k, v := range freq {
            if v != 0 {
                t.Fatalf("element %d count mismatch: delta=%d", k, v)
            }
        }
    })
}

// Property 4: Idempotent — sorting a sorted slice changes nothing
func TestSort_Property_Idempotent(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        input := rapid.SliceOf(rapid.Int()).Draw(t, "input")
        once := mySort(input)
        twice := mySort(once)
        for i := range once {
            if once[i] != twice[i] {
                t.Fatalf("not idempotent at index %d", i)
            }
        }
    })
}

// Property 5: Encode/Decode round-trip
func TestEncodeDecode_RoundTrip(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        original := rapid.StringOf(rapid.Byte()).Draw(t, "original")
        encoded := encode(original)
        decoded := decode(encoded)
        if decoded != original {
            t.Fatalf("round-trip failed: %q -> %v -> %q", original, encoded, decoded)
        }
    })
}

// Property 6: Encode output length equals input length
func TestEncode_LengthPreserved(t *testing.T) {
    rapid.Check(t, func(t *rapid.T) {
        input := rapid.StringOf(rapid.Byte()).Draw(t, "input")
        if len(encode(input)) != len(input) {
            t.Fatal("encode changed length")
        }
    })
}
```

**Time:** O(100 * n log n) by default (100 iterations) | **Space:** O(n) per iteration

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Increase iterations with `rapid.Check(t, fn, rapid.Settings{Checks: 1000})` |
| Edge Cases | `rapid` automatically tests empty slices, max-value ints, and special characters |
| Error Handling | On failure, `rapid` prints the minimal shrunk counterexample |
| Memory | Use `rapid.Just(value)` to pin specific values while keeping others random |
| Concurrency | Each `rapid.Check` call is independent and safe for `t.Parallel()` |

### Visual Explanation

```mermaid
flowchart TD
    A["rapid.Check starts\n100 iterations"] --> B["Generate random input\nusing Draw generators"]
    B --> C["Run function under test"]
    C --> D{"Property holds?"}
    D -- Yes --> E["Next iteration"]
    E --> B
    D -- No --> F["Shrink input\nto minimal counterexample"]
    F --> G["Report failure\nwith minimal input"]
```

### Interviewer Questions

1. What is the difference between property-based testing and example-based testing?
2. What is shrinking and why is it essential for property-based testing?
3. How do you write a generator for a custom struct type in `rapid`?
4. What properties are universally true for a sorted list?
5. How do you combine property-based tests with coverage targets?
6. When would property-based testing find bugs that unit tests miss?
7. What is `gopter` and how does it compare to `rapid`?

### Follow-Up Questions

**Q1:** How do you write a property test for a distributed consensus algorithm?
**Q2:** How do you model state machines with property-based testing?
**Q3:** What is stateful property testing and when do you use it?
**Q4:** How do you seed the random generator for reproducible CI runs?
**Q5:** How do you property-test a parser and pretty-printer pair?

---

## Q21: Mutation Testing Concept and Go Implementation  [Level 5 — Interview Level]

> **Tags:** `#mutation-testing` `#gremlins` `#test-quality` `#coverage` `#test-effectiveness`

### Problem Statement

Explain mutation testing, implement a Go function with deliberately weak tests, demonstrate how `gremlins` detects the weakness, then write tests that kill all mutants.

### Input / Output / Constraints

- Input: A function under test with a weak test suite (passes all tests but misses logic bugs)
- Output: Mutation score (killed/total mutants); test suite improved to kill all mutants
- Constraints: Uses `github.com/go-gremlins/gremlins`

### Thought Process

Mutation testing automatically introduces small bugs (mutants) into production code and checks whether tests catch them. If a mutant survives (tests still pass), your test suite is weak. Common mutations: change `>` to `>=`, `&&` to `||`, remove `return` statements, negate conditions. Mutation score = killed/total. A score of 100% means every logical bug type was caught.

### Brute Force

```go
// Weak test — only checks happy path, no boundary conditions
func TestDiscountWeak(t *testing.T) {
    if got := applyDiscount(100, 10); got != 90 {
        t.Fail()
    }
}
```

**Mutation score:** ~30% — most boundary mutants survive.

### Better Solution

```go
// Tests both paths but no boundary conditions
func TestDiscountBetter(t *testing.T) {
    if applyDiscount(100, 10) != 90 { t.Fail() }
    if applyDiscount(100, 0) != 100 { t.Fail() }
}
```

### Best Solution

```go
package main

import (
    "errors"
    "testing"
)

// ---- Function under test ----

// applyDiscount applies a percentage discount (0-100) to a price.
// Returns error for invalid inputs.
func applyDiscount(price float64, discountPct float64) (float64, error) {
    if price < 0 {
        return 0, errors.New("price must be non-negative")
    }
    if discountPct < 0 || discountPct > 100 {
        return 0, errors.New("discount must be between 0 and 100")
    }
    return price * (1 - discountPct/100), nil
}

// ---- Mutation-killing test suite ----

func TestApplyDiscount(t *testing.T) {
    tests := []struct {
        name        string
        price       float64
        discountPct float64
        want        float64
        wantErr     bool
    }{
        // Happy path
        {"10% off 100", 100, 10, 90, false},
        {"50% off 200", 200, 50, 100, false},
        {"0% discount", 100, 0, 100, false},    // kills: discountPct < 0 mutated to <=
        {"100% discount", 100, 100, 0, false},  // kills: discountPct > 100 mutated to >=

        // Boundary conditions (kill off-by-one mutants)
        {"price=0", 0, 10, 0, false},           // kills: price < 0 mutated to <=
        {"price=-1", -1, 10, 0, true},          // kills: negated condition
        {"discount=-1", 100, -1, 0, true},      // kills: discountPct < 0 -> >=
        {"discount=101", 100, 101, 0, true},    // kills: discountPct > 100 -> >=
        {"discount=100.1", 100, 100.1, 0, true},

        // Formula correctness
        {"25% off 80", 80, 25, 60, false},      // kills arithmetic mutations
        {"1% off 1000", 1000, 1, 990, false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := applyDiscount(tt.price, tt.discountPct)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if !tt.wantErr && got != tt.want {
                t.Errorf("applyDiscount(%v, %v) = %v, want %v",
                    tt.price, tt.discountPct, got, tt.want)
            }
        })
    }
}

/*
Run mutation testing with gremlins:
    go install github.com/go-gremlins/gremlins/cmd/gremlins@latest
    gremlins unleash ./...

Expected output (before strong tests):
    SURVIVED: arithmetic_base.go:12 (price * (1 + discountPct/100))
    SURVIVED: conditionals.go:8    (price >= 0)

Expected output (after strong tests):
    KILLED: 11/11 mutants
    Mutation score: 100%
*/
```

**Time:** O(mutants * test_suite_time) | **Space:** O(1)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Mutation testing is slow (O(mutants * tests)); run in CI on changed files only |
| Edge Cases | Focus mutations on business logic, not boilerplate setters/getters |
| Error Handling | Equivalent mutants (semantically identical) are expected survivors |
| Memory | Use `--tags` to target specific packages; exclude generated code |
| Concurrency | `gremlins` runs mutants in parallel with `--workers` flag |

### Visual Explanation

```mermaid
flowchart TD
    A["Original code\napplyDiscount"] --> B["Gremlins generates\nmutants automatically"]
    B --> C["Mutant 1: price < 0\n→ price <= 0"]
    B --> D["Mutant 2: discountPct > 100\n→ discountPct >= 100"]
    B --> E["Mutant 3: 1 - disc/100\n→ 1 + disc/100"]
    C & D & E --> F["Run full test suite\nfor each mutant"]
    F --> G{"Tests fail?"}
    G -- Yes --> H["KILLED — test\ncatches the mutation"]
    G -- No --> I["SURVIVED — test\ngap found"]
    I --> J["Write test to\nkill this mutant"]
```

### Interviewer Questions

1. What is the difference between code coverage and mutation score?
2. What is an equivalent mutant and why can it never be killed?
3. How do you prioritise which mutants to kill in a large codebase?
4. What mutation operators does `gremlins` support?
5. How does mutation testing complement fuzzing?
6. What is a mutation testing threshold and how do you enforce it in CI?
7. Why is 100% line coverage compatible with 0% mutation score?

### Follow-Up Questions

**Q1:** How do you apply mutation testing to infrastructure-as-code?
**Q2:** What is PITest for Java and how does it compare to gremlins for Go?
**Q3:** How do you exclude generated code from mutation testing?
**Q4:** How do you use mutation testing to evaluate the quality of a mock?
**Q5:** What is higher-order mutation testing?

---

## Q22: Full Test Suite — Unit + Integration + Benchmark + Fuzz  [Level 6 — Production Level]

> **Tags:** `#full-test-suite` `#build-tags` `#test-pyramid` `#ci` `#production`

### Problem Statement

Design and implement a complete test suite for a `PaymentProcessor` service covering all four testing layers: unit tests (mock dependencies), integration tests (real database via testcontainers), benchmarks (throughput), and fuzz tests (input validation). Use build tags to separate layers.

### Input / Output / Constraints

- Input: A `PaymentProcessor` with `Charge`, `Refund`, `GetTransaction` methods
- Output: Full test suite runnable at different levels via build tags
- Constraints: Unit tests must run without Docker; integration tests require Docker

### Thought Process

The test pyramid: many unit tests (fast, isolated), fewer integration tests (slower, real dependencies), even fewer E2E tests. Build tags (`//go:build integration`, `//go:build benchmark`) let you select layers at the `go test` command line. Each layer tests different properties: unit tests test logic, integration tests test SQL/HTTP correctness, benchmarks test throughput, fuzz tests test input safety.

### Brute Force

```
Single _test.go file mixing all concerns — slow, brittle, hard to run selectively
```

### Better Solution

```
Separate files per layer but no build tags — all run together, integration breaks unit CI
```

### Best Solution

```go
// ============================================================
// payment.go — production code
// ============================================================
package payment

import (
    "context"
    "errors"
    "time"
)

type Transaction struct {
    ID        string
    Amount    int64 // in cents
    Currency  string
    Status    string
    CreatedAt time.Time
}

type Repository interface {
    SaveTransaction(ctx context.Context, tx Transaction) error
    GetTransaction(ctx context.Context, id string) (Transaction, error)
}

type PaymentGateway interface {
    Charge(ctx context.Context, amount int64, currency string) (string, error)
    Refund(ctx context.Context, txID string) error
}

type PaymentProcessor struct {
    repo    Repository
    gateway PaymentGateway
}

func NewPaymentProcessor(repo Repository, gateway PaymentGateway) *PaymentProcessor {
    return &PaymentProcessor{repo: repo, gateway: gateway}
}

func (p *PaymentProcessor) Charge(ctx context.Context, amount int64, currency string) (*Transaction, error) {
    if amount <= 0 {
        return nil, errors.New("amount must be positive")
    }
    if currency == "" {
        return nil, errors.New("currency required")
    }

    txID, err := p.gateway.Charge(ctx, amount, currency)
    if err != nil {
        return nil, fmt.Errorf("gateway charge: %w", err)
    }

    tx := Transaction{
        ID:        txID,
        Amount:    amount,
        Currency:  currency,
        Status:    "completed",
        CreatedAt: time.Now().UTC(),
    }

    if err := p.repo.SaveTransaction(ctx, tx); err != nil {
        return nil, fmt.Errorf("save transaction: %w", err)
    }

    return &tx, nil
}

// ============================================================
// payment_unit_test.go — unit tests (no build tag = always run)
// ============================================================
package payment

import (
    "context"
    "errors"
    "testing"
)

// Mock implementations
type mockRepo struct {
    saved map[string]Transaction
    err   error
}

func newMockRepo() *mockRepo { return &mockRepo{saved: make(map[string]Transaction)} }

func (m *mockRepo) SaveTransaction(_ context.Context, tx Transaction) error {
    if m.err != nil { return m.err }
    m.saved[tx.ID] = tx
    return nil
}

func (m *mockRepo) GetTransaction(_ context.Context, id string) (Transaction, error) {
    tx, ok := m.saved[id]
    if !ok { return Transaction{}, errors.New("not found") }
    return tx, nil
}

type mockGateway struct {
    chargeID  string
    chargeErr error
    refundErr error
}

func (m *mockGateway) Charge(_ context.Context, _ int64, _ string) (string, error) {
    return m.chargeID, m.chargeErr
}
func (m *mockGateway) Refund(_ context.Context, _ string) error { return m.refundErr }

func TestCharge_Success(t *testing.T) {
    repo := newMockRepo()
    gw := &mockGateway{chargeID: "tx_123"}
    proc := NewPaymentProcessor(repo, gw)

    tx, err := proc.Charge(context.Background(), 1000, "USD")
    if err != nil { t.Fatalf("unexpected error: %v", err) }
    if tx.ID != "tx_123" { t.Errorf("ID = %q, want tx_123", tx.ID) }
    if tx.Amount != 1000 { t.Errorf("Amount = %d, want 1000", tx.Amount) }
    if _, ok := repo.saved["tx_123"]; !ok { t.Error("transaction not saved") }
}

func TestCharge_InvalidAmount(t *testing.T) {
    proc := NewPaymentProcessor(newMockRepo(), &mockGateway{})
    _, err := proc.Charge(context.Background(), 0, "USD")
    if err == nil { t.Error("expected error for zero amount") }
    _, err = proc.Charge(context.Background(), -1, "USD")
    if err == nil { t.Error("expected error for negative amount") }
}

func TestCharge_GatewayError_NoSave(t *testing.T) {
    repo := newMockRepo()
    gw := &mockGateway{chargeErr: errors.New("gateway down")}
    proc := NewPaymentProcessor(repo, gw)

    _, err := proc.Charge(context.Background(), 100, "USD")
    if err == nil { t.Fatal("expected error") }
    if len(repo.saved) != 0 { t.Error("should not save on gateway failure") }
}

// ============================================================
// payment_integration_test.go — real database
// Build tag: go test -tags=integration
// ============================================================

//go:build integration

package payment

import (
    "context"
    "testing"
    // testcontainers setup as shown in Q19
)

func TestCharge_Integration(t *testing.T) {
    // Start real PostgreSQL via testcontainers
    // Run against real repo and a test gateway stub
    // Verify transaction is persisted correctly
    t.Log("integration test: uses real PostgreSQL")
}

// ============================================================
// payment_bench_test.go — benchmarks
// Build tag: go test -tags=bench -bench=.
// ============================================================

//go:build bench

package payment

import (
    "context"
    "testing"
)

func BenchmarkCharge(b *testing.B) {
    repo := newMockRepo()
    gw := &mockGateway{chargeID: "tx_bench"}
    proc := NewPaymentProcessor(repo, gw)
    ctx := context.Background()

    b.ReportAllocs()
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, _ = proc.Charge(ctx, 1000, "USD")
    }
}

// ============================================================
// payment_fuzz_test.go — fuzz tests
// ============================================================

package payment

import (
    "context"
    "testing"
)

func FuzzCharge_Amount(f *testing.F) {
    f.Add(int64(100), "USD")
    f.Add(int64(0), "USD")
    f.Add(int64(-1), "USD")
    f.Add(int64(1<<62), "USD")

    f.Fuzz(func(t *testing.T, amount int64, currency string) {
        repo := newMockRepo()
        gw := &mockGateway{chargeID: "tx_fuzz"}
        proc := NewPaymentProcessor(repo, gw)

        tx, err := proc.Charge(context.Background(), amount, currency)
        if err != nil { return } // valid to reject

        // Invariant: if no error, transaction must be saved
        if _, ok := repo.saved[tx.ID]; !ok {
            t.Error("successful charge not saved to repo")
        }

        // Invariant: saved amount matches input
        if repo.saved[tx.ID].Amount != amount {
            t.Errorf("saved amount %d != input %d", repo.saved[tx.ID].Amount, amount)
        }
    })
}
```

**Run each layer:**
```bash
# Unit tests only (fast, no Docker)
go test ./...

# Integration tests (requires Docker)
go test -tags=integration ./...

# Benchmarks
go test -tags=bench -bench=. -benchmem ./...

# Fuzz tests
go test -fuzz=FuzzCharge_Amount -fuzztime=60s ./...

# All layers
go test -tags="integration bench" -bench=. -fuzz=FuzzCharge_Amount ./...
```

**Time:** O(1) unit | O(startup) integration | **Space:** O(1) unit | O(container) integration

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Build tags decouple CI stages: unit (every commit), integration (PR merge), bench (nightly) |
| Edge Cases | Each layer tests different concerns — never replace one layer with another |
| Error Handling | Unit tests verify error paths cheaply; integration tests verify error persistence |
| Memory | Benchmarks run with `b.ReportAllocs` to detect per-request allocation regressions |
| Concurrency | Fuzz tests and benchmarks run in parallel goroutines automatically |

### Visual Explanation

```mermaid
flowchart TD
    A["Code Change"] --> B["Unit Tests\nno build tag\ngo test ./..."]
    B --> C["Fast: <1s\nMocks only"]
    A --> D["Integration Tests\n-tags=integration\nDocker required"]
    D --> E["Slower: 10-60s\nReal database"]
    A --> F["Benchmarks\n-tags=bench -bench=."]
    F --> G["Nightly CI\nns/op regression"]
    A --> H["Fuzz Tests\n-fuzz=FuzzFn\n-fuzztime=Xs"]
    H --> I["Continuous fuzzing\nCrash corpus"]
```

### Interviewer Questions

1. What does each layer of the test pyramid test that the others cannot?
2. How do build tags prevent integration tests from running in unit CI?
3. When should a mock be replaced by a testcontainer?
4. How do you prevent benchmark regression across releases?
5. How do you fuzz test an interface rather than a concrete function?
6. What is test isolation and how do build tags enforce it?
7. How do you report all four test metrics in a single CI dashboard?

### Follow-Up Questions

**Q1:** How do you run integration tests in parallel across multiple packages?
**Q2:** How do you share test fixtures between unit and integration layers?
**Q3:** How do you snapshot benchmark baselines in CI?
**Q4:** How do you combine fuzz corpus across multiple developers?
**Q5:** What is a smoke test and where does it fit in the pyramid?

---

## Q23: Test Coverage Enforcement in CI (Coverage Gate)  [Level 6 — Production Level]

> **Tags:** `#coverage` `#ci` `#coverage-gate` `#github-actions` `#go-cover`

### Problem Statement

Implement a CI coverage gate that fails the build if total test coverage drops below 80%. Show how to generate coverage profiles, merge profiles from multiple packages, generate HTML reports, and enforce the threshold in a GitHub Actions workflow.

### Input / Output / Constraints

- Input: Go project with multiple packages
- Output: Coverage percentage; fail CI if below threshold
- Constraints: Must work with `go test -coverprofile`; threshold is configurable

### Thought Process

Go's built-in coverage tool generates per-package profiles. To get total coverage across the whole project, merge profiles with `gocovmerge` or use `go test -coverpkg=./...` to count all packages against the combined profile. A coverage gate script parses the `go tool cover` output and exits non-zero if below threshold.

### Brute Force

```bash
# Single package only — misses cross-package coverage
go test -cover ./pkg/payment/
```

### Better Solution

```bash
# Per-package profiles — cannot combine easily
for pkg in $(go list ./...); do
    go test -coverprofile="${pkg//\//_}.out" "$pkg"
done
```

### Best Solution

```go
// coverage_gate.go — standalone tool in ./tools/coverage_gate/
package main

import (
    "bufio"
    "fmt"
    "os"
    "os/exec"
    "strconv"
    "strings"
)

const defaultThreshold = 80.0

func main() {
    threshold := defaultThreshold
    if len(os.Args) > 1 {
        t, err := strconv.ParseFloat(os.Args[1], 64)
        if err != nil {
            fmt.Fprintf(os.Stderr, "invalid threshold %q: %v\n", os.Args[1], err)
            os.Exit(2)
        }
        threshold = t
    }

    // Run tests with combined coverage profile
    cmd := exec.Command("go", "test",
        "-coverprofile=coverage.out",
        "-coverpkg=./...",
        "./...",
    )
    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr
    if err := cmd.Run(); err != nil {
        fmt.Fprintln(os.Stderr, "tests failed")
        os.Exit(1)
    }

    // Parse coverage percentage
    pct, err := parseCoveragePercent("coverage.out")
    if err != nil {
        fmt.Fprintf(os.Stderr, "parse coverage: %v\n", err)
        os.Exit(2)
    }

    fmt.Printf("Coverage: %.1f%% (threshold: %.1f%%)\n", pct, threshold)

    if pct < threshold {
        fmt.Printf("FAIL: coverage %.1f%% is below threshold %.1f%%\n", pct, threshold)
        os.Exit(1)
    }
    fmt.Println("PASS: coverage gate satisfied")
}

func parseCoveragePercent(profilePath string) (float64, error) {
    cmd := exec.Command("go", "tool", "cover", "-func="+profilePath)
    out, err := cmd.Output()
    if err != nil {
        return 0, err
    }

    scanner := bufio.NewScanner(strings.NewReader(string(out)))
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "total:") {
            fields := strings.Fields(line)
            if len(fields) < 3 {
                return 0, fmt.Errorf("unexpected total line: %q", line)
            }
            pctStr := strings.TrimSuffix(fields[len(fields)-1], "%")
            return strconv.ParseFloat(pctStr, 64)
        }
    }
    return 0, fmt.Errorf("total line not found in %s", profilePath)
}
```

```yaml
# .github/workflows/test.yml
name: Test & Coverage Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true

      - name: Run tests with coverage
        run: |
          go test -coverprofile=coverage.out -coverpkg=./... ./...
          go tool cover -html=coverage.out -o coverage.html

      - name: Enforce coverage gate (80%)
        run: |
          COVERAGE=$(go tool cover -func=coverage.out | grep "^total:" | awk '{print $3}' | tr -d '%')
          echo "Total coverage: ${COVERAGE}%"
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "FAIL: coverage ${COVERAGE}% is below 80% threshold"
            exit 1
          fi
          echo "PASS: coverage gate satisfied"

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.html
        if: always()

      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage.out
          fail_ci_if_error: true

  race-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Run with race detector
        run: go test -race ./...
```

**Makefile targets:**
```makefile
.PHONY: test coverage coverage-gate

test:
	go test ./...

coverage:
	go test -coverprofile=coverage.out -coverpkg=./... ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

coverage-gate:
	go run ./tools/coverage_gate/main.go 80

lint:
	golangci-lint run ./...

ci: test coverage-gate lint
```

**Time:** O(test suite time) | **Space:** O(profile size)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Use `-coverpkg=./...` to count all packages; per-package profiles undercount cross-package calls |
| Edge Cases | Generated code (protobuf, mocks) should be excluded with `//go:build ignore` or `.coverignore` |
| Error Handling | Gate should distinguish test failure from coverage failure (different exit codes) |
| Memory | Coverage instrumentation adds ~30% overhead to test runtime |
| Concurrency | Use `-p` flag to run package tests in parallel: `go test -p 4 -coverprofile=...` |

### Visual Explanation

```mermaid
flowchart TD
    A["git push / PR"] --> B["GitHub Actions trigger"]
    B --> C["go test -coverprofile=coverage.out\n-coverpkg=./... ./..."]
    C --> D{"Tests pass?"}
    D -- No --> E["CI FAIL: test failure"]
    D -- Yes --> F["go tool cover -func=coverage.out"]
    F --> G["Parse total: XX.X%"]
    G --> H{"XX.X >= 80?"}
    H -- No --> I["CI FAIL: coverage gate"]
    H -- Yes --> J["Upload HTML report\nUpload to Codecov"]
    J --> K["CI PASS"]
```

### Interviewer Questions

1. What is the difference between statement coverage and branch coverage?
2. Why does `-coverpkg=./...` give different results than per-package profiles?
3. How do you exclude auto-generated files from coverage calculation?
4. What is the risk of setting the coverage gate too high (e.g. 95%)?
5. How do you track coverage trends over time rather than just a threshold?
6. What is Codecov and how does it integrate with GitHub PRs?
7. How do you enforce coverage gates per-package rather than globally?

### Follow-Up Questions

**Q1:** How do you measure coverage of integration tests separately?
**Q2:** What is the `GOFLAGS` environment variable and how do you use it for coverage?
**Q3:** How do you generate coverage reports for multiple modules in a monorepo?
**Q4:** What is `go test -covermode=atomic` and when do you need it?
**Q5:** How do you detect coverage ratcheting (never allow coverage to decrease)?

---

## Q24: Contract Testing for Microservices  [Level 6 — Production Level]

> **Tags:** `#contract-testing` `#pact` `#consumer-driven` `#microservices` `#api-compatibility`

### Problem Statement

Implement consumer-driven contract testing between a `UserService` consumer and a `ProfileService` provider using Pact. Write the consumer test that generates a pact file, the provider verification test, and explain how a Pact Broker enables this workflow in a microservices deployment pipeline.

### Input / Output / Constraints

- Input: Consumer makes GET /users/{id} to ProfileService; expects JSON with `id`, `name`, `email`
- Output: Pact file (JSON) defining the contract; provider verification result
- Constraints: Uses `github.com/pact-foundation/pact-go/v2`

### Thought Process

Contract testing solves the problem of microservice integration breaking silently. Consumer defines what it expects from the provider API. The pact file (JSON contract) is published to a Pact Broker. The provider runs its own verification test against the broker's contracts — no consumer deployment needed. If the provider breaks the contract, its CI fails before deployment.

### Brute Force

```go
// Integration test against live service — breaks when service is down
func TestUserService_Integration(t *testing.T) {
    resp, err := http.Get("http://profile-service:8080/users/1")
    // ...
}
```

### Better Solution

```go
// Mock HTTP server — does not enforce schema changes
func TestUserService_Mock(t *testing.T) {
    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte(`{"id":1,"name":"Alice","email":"alice@example.com"}`))
    }))
    defer srv.Close()
    // test consumer against mock
}
```

### Best Solution

```go
// ============================================================
// consumer/user_client.go — consumer code
// ============================================================
package consumer

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

type UserClient struct {
    baseURL    string
    httpClient *http.Client
}

func NewUserClient(baseURL string) *UserClient {
    return &UserClient{baseURL: baseURL, httpClient: &http.Client{}}
}

func (c *UserClient) GetUser(id int) (*User, error) {
    resp, err := c.httpClient.Get(fmt.Sprintf("%s/users/%d", c.baseURL, id))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode == http.StatusNotFound {
        return nil, fmt.Errorf("user %d not found", id)
    }
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("unexpected status: %d", resp.StatusCode)
    }

    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, err
    }
    return &user, nil
}

// ============================================================
// consumer/user_client_pact_test.go — consumer contract test
// ============================================================
package consumer

import (
    "fmt"
    "testing"

    "github.com/pact-foundation/pact-go/v2/consumer"
    "github.com/pact-foundation/pact-go/v2/matchers"
)

func TestUserClient_GetUser_Pact(t *testing.T) {
    // Create Pact mock provider
    mockProvider, err := consumer.NewV2Pact(consumer.MockHTTPProviderConfig{
        Consumer: "UserService",
        Provider: "ProfileService",
        PactDir:  "./pacts",
    })
    if err != nil {
        t.Fatal(err)
    }

    // Define the interaction (contract)
    mockProvider.
        AddInteraction().
        Given("user 1 exists").
        UponReceiving("a request for user 1").
        WithRequest(consumer.Request{
            Method: "GET",
            Path:   matchers.S("/users/1"),
        }).
        WillRespondWith(consumer.Response{
            Status: 200,
            Headers: matchers.MapMatcher{
                "Content-Type": matchers.S("application/json"),
            },
            Body: matchers.MapMatcher{
                "id":    matchers.Integer(1),
                "name":  matchers.S("Alice"),
                "email": matchers.Like("alice@example.com"),
            },
        })

    // Run the test against the Pact mock server
    err = mockProvider.ExecuteTest(t, func(config consumer.MockServerConfig) error {
        client := NewUserClient(fmt.Sprintf("http://%s:%d", config.Host, config.Port))

        user, err := client.GetUser(1)
        if err != nil {
            return fmt.Errorf("GetUser: %w", err)
        }
        if user.ID != 1 {
            return fmt.Errorf("ID = %d, want 1", user.ID)
        }
        if user.Name == "" {
            return fmt.Errorf("Name is empty")
        }
        if user.Email == "" {
            return fmt.Errorf("Email is empty")
        }
        return nil
    })

    if err != nil {
        t.Fatalf("pact test failed: %v", err)
    }
    // Pact file written to ./pacts/UserService-ProfileService.json
}

// ============================================================
// provider/profile_handler_pact_test.go — provider verification
// ============================================================
package provider

import (
    "net/http/httptest"
    "testing"

    "github.com/pact-foundation/pact-go/v2/provider"
)

func TestProfileService_PactVerification(t *testing.T) {
    // Start the real provider server
    srv := httptest.NewServer(NewProfileHandler())
    defer srv.Close()

    // Verify against pacts from broker or local file
    verifier := provider.NewVerifier()
    err := verifier.VerifyProvider(t, provider.VerifyRequest{
        ProviderBaseURL: srv.URL,
        Provider:        "ProfileService",

        // Option A: local pact files (for development)
        PactFiles: []string{"../consumer/pacts/UserService-ProfileService.json"},

        // Option B: Pact Broker (for CI/CD)
        // BrokerURL:     "https://broker.pact.io",
        // BrokerToken:   os.Getenv("PACT_BROKER_TOKEN"),
        // ConsumerVersionSelectors: []provider.ConsumerVersionSelector{
        //     {MainBranch: true},
        //     {Deployed: true},
        // },

        StateHandlers: provider.StateHandlers{
            "user 1 exists": func(setup bool, s provider.ProviderStateV3) (provider.ProviderStateV3Response, error) {
                if setup {
                    // Seed test data
                    testDB.Exec("INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'alice@example.com') ON CONFLICT DO NOTHING")
                }
                return nil, nil
            },
        },
    })

    if err != nil {
        t.Fatalf("provider verification failed: %v", err)
    }
}
```

**Pact file (auto-generated `./pacts/UserService-ProfileService.json`):**
```json
{
  "consumer": {"name": "UserService"},
  "provider": {"name": "ProfileService"},
  "interactions": [{
    "description": "a request for user 1",
    "providerState": "user 1 exists",
    "request": {"method": "GET", "path": "/users/1"},
    "response": {
      "status": 200,
      "headers": {"Content-Type": "application/json"},
      "body": {"id": 1, "name": "Alice", "email": "alice@example.com"}
    }
  }]
}
```

**Time:** O(1) per interaction | **Space:** O(interactions)

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | Pact Broker stores pacts centrally; `can-i-deploy` CLI checks compatibility before deploy |
| Edge Cases | Use `matchers.Like` for flexible matching; avoid exact string matches that break on valid changes |
| Error Handling | State handlers must clean up test data to prevent cross-test contamination |
| Memory | Pact mock server runs in-process — no Docker required for consumer tests |
| Concurrency | Each consumer-provider pair has one pact file; multiple consumers each get their own file |

### Visual Explanation

```mermaid
flowchart TD
    A["Consumer Test\nWritten by UserService team"] --> B["Pact mock server\nstarts locally"]
    B --> C["Test runs GetUser(1)\nagainst mock"]
    C --> D["Pact file written:\nUserService-ProfileService.json"]
    D --> E["Publish to\nPact Broker"]
    E --> F["Provider Verification Test\nRun by ProfileService CI"]
    F --> G["Real ProfileService\nagainst Pact Broker contracts"]
    G --> H{"All interactions\nverified?"}
    H -- Yes --> I["can-i-deploy PASSES\nDeploy ProfileService"]
    H -- No --> J["CI FAILS\nProvider broke contract"]
```

### Interviewer Questions

1. What is consumer-driven contract testing and how does it differ from provider-driven?
2. What does the Pact Broker enable that local pact files cannot?
3. What is `can-i-deploy` and how does it prevent breaking changes in production?
4. What is a provider state and why is it necessary?
5. What is the difference between `matchers.Like`, `matchers.S`, and `matchers.Integer`?
6. How do contract tests complement E2E tests?
7. What happens when two consumers have conflicting contracts for the same provider endpoint?

### Follow-Up Questions

**Q1:** How do you version pact files when the API changes incompatibly?
**Q2:** How do you use Pact with gRPC or GraphQL?
**Q3:** What is bi-directional contract testing and when do you use it?
**Q4:** How do you handle optional fields in consumer contracts?
**Q5:** What is the `WIP pacts` feature in Pact Broker?

---

## Q25: Load Test with Goroutines Simulating 10K Concurrent Users  [Level 6 — Production Level]

> **Tags:** `#load-testing` `#10k-users` `#goroutines` `#rate-limiting` `#percentiles`

### Problem Statement

Write a Go load test that simulates 10,000 concurrent users making HTTP requests to a service. Measure throughput (RPS), latency percentiles (p50, p95, p99), error rate, and implement a rate limiter to control request pace. Report results in a structured format.

### Input / Output / Constraints

- Input: Target URL, concurrency (10,000 goroutines), duration, rate limit
- Output: RPS, p50/p95/p99 latency, error count, success rate
- Constraints: Must not OOM; must respect rate limit; must aggregate results concurrently

### Thought Process

10K goroutines in Go are cheap (~8KB stack each = ~80MB total). The challenge is: (1) coordinating results from all goroutines without locks in the hot path — use channels; (2) rate limiting with `golang.org/x/time/rate`; (3) computing percentiles requires sorting latencies — use a pre-allocated slice; (4) graceful shutdown when duration expires via context cancellation.

### Brute Force

```go
// No rate limiting, no metrics aggregation — hammers the server uncontrolled
for i := 0; i < 10000; i++ {
    go func() {
        for {
            http.Get(targetURL)
        }
    }()
}
```

### Better Solution

```go
// Adds WaitGroup and result collection, but no percentiles
var wg sync.WaitGroup
results := make(chan time.Duration, 10000)
for i := 0; i < 10000; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        start := time.Now()
        http.Get(url)
        results <- time.Since(start)
    }()
}
```

### Best Solution

```go
package main

import (
    "context"
    "fmt"
    "net/http"
    "sort"
    "sync"
    "sync/atomic"
    "time"

    "golang.org/x/time/rate"
)

// ---- Result types ----

type RequestResult struct {
    Latency time.Duration
    Err     error
    Status  int
}

type LoadTestConfig struct {
    TargetURL   string
    Concurrency int
    Duration    time.Duration
    RPS         int // rate limit: requests per second
}

type LoadTestReport struct {
    TotalRequests  int64
    SuccessCount   int64
    ErrorCount     int64
    DurationSecs   float64
    Throughput     float64 // RPS achieved
    P50, P95, P99  time.Duration
    MinLatency     time.Duration
    MaxLatency     time.Duration
    ErrorRate      float64
}

func (r LoadTestReport) String() string {
    return fmt.Sprintf(`
=== Load Test Report ===
Total Requests:  %d
Success:         %d (%.1f%%)
Errors:          %d (%.1f%%)
Duration:        %.2fs
Throughput:      %.0f RPS
Latency P50:     %v
Latency P95:     %v
Latency P99:     %v
Min Latency:     %v
Max Latency:     %v
========================`,
        r.TotalRequests,
        r.SuccessCount, float64(r.SuccessCount)/float64(r.TotalRequests)*100,
        r.ErrorCount, r.ErrorRate*100,
        r.DurationSecs,
        r.Throughput,
        r.P50, r.P95, r.P99,
        r.MinLatency, r.MaxLatency,
    )
}

// ---- Load test engine ----

func RunLoadTest(cfg LoadTestConfig) LoadTestReport {
    ctx, cancel := context.WithTimeout(context.Background(), cfg.Duration)
    defer cancel()

    limiter := rate.NewLimiter(rate.Limit(cfg.RPS), cfg.RPS)
    results := make(chan RequestResult, cfg.Concurrency*10)

    client := &http.Client{
        Timeout: 10 * time.Second,
        Transport: &http.Transport{
            MaxIdleConnsPerHost: cfg.Concurrency,
            MaxConnsPerHost:     cfg.Concurrency,
        },
    }

    var wg sync.WaitGroup
    for i := 0; i < cfg.Concurrency; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for {
                // Respect rate limit
                if err := limiter.Wait(ctx); err != nil {
                    return // context cancelled or deadline exceeded
                }

                start := time.Now()
                resp, err := client.Get(cfg.TargetURL)
                latency := time.Since(start)

                result := RequestResult{Latency: latency}
                if err != nil {
                    result.Err = err
                } else {
                    result.Status = resp.StatusCode
                    resp.Body.Close()
                    if resp.StatusCode >= 400 {
                        result.Err = fmt.Errorf("HTTP %d", resp.StatusCode)
                    }
                }

                select {
                case results <- result:
                case <-ctx.Done():
                    return
                }
            }
        }()
    }

    // Collector goroutine
    go func() {
        wg.Wait()
        close(results)
    }()

    // Aggregate results
    var (
        totalRequests atomic.Int64
        successCount  atomic.Int64
        errorCount    atomic.Int64
        latencies     []time.Duration
        mu            sync.Mutex
    )

    startTime := time.Now()
    for r := range results {
        totalRequests.Add(1)
        if r.Err != nil {
            errorCount.Add(1)
        } else {
            successCount.Add(1)
            mu.Lock()
            latencies = append(latencies, r.Latency)
            mu.Unlock()
        }
    }
    elapsed := time.Since(startTime)

    // Compute percentiles
    sort.Slice(latencies, func(i, j int) bool { return latencies[i] < latencies[j] })

    percentile := func(pct float64) time.Duration {
        if len(latencies) == 0 {
            return 0
        }
        idx := int(float64(len(latencies)) * pct / 100)
        if idx >= len(latencies) {
            idx = len(latencies) - 1
        }
        return latencies[idx]
    }

    total := totalRequests.Load()
    errors := errorCount.Load()

    var minLat, maxLat time.Duration
    if len(latencies) > 0 {
        minLat = latencies[0]
        maxLat = latencies[len(latencies)-1]
    }

    return LoadTestReport{
        TotalRequests: total,
        SuccessCount:  successCount.Load(),
        ErrorCount:    errors,
        DurationSecs:  elapsed.Seconds(),
        Throughput:    float64(total) / elapsed.Seconds(),
        P50:           percentile(50),
        P95:           percentile(95),
        P99:           percentile(99),
        MinLatency:    minLat,
        MaxLatency:    maxLat,
        ErrorRate:     float64(errors) / float64(total),
    }
}

func main() {
    cfg := LoadTestConfig{
        TargetURL:   "http://localhost:8080/health",
        Concurrency: 10_000,
        Duration:    30 * time.Second,
        RPS:         5_000, // rate limit to 5K RPS
    }

    fmt.Printf("Starting load test: %d goroutines, %d RPS limit, %v duration\n",
        cfg.Concurrency, cfg.RPS, cfg.Duration)

    report := RunLoadTest(cfg)
    fmt.Println(report)

    // Fail if error rate > 1%
    if report.ErrorRate > 0.01 {
        fmt.Printf("ERROR: error rate %.1f%% exceeds 1%% threshold\n", report.ErrorRate*100)
    }
    // Fail if P99 > 500ms
    if report.P99 > 500*time.Millisecond {
        fmt.Printf("ERROR: P99 latency %v exceeds 500ms SLO\n", report.P99)
    }
}

// ---- Test ----

func TestLoadTest_AgainstMockServer(t *testing.T) {
    // Start a fast mock server
    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"status":"ok"}`))
    }))
    defer srv.Close()

    cfg := LoadTestConfig{
        TargetURL:   srv.URL,
        Concurrency: 100,   // reduced for test speed
        Duration:    2 * time.Second,
        RPS:         500,
    }

    report := RunLoadTest(cfg)

    if report.TotalRequests == 0 {
        t.Error("no requests made")
    }
    if report.ErrorRate > 0.01 {
        t.Errorf("error rate %.1f%% too high", report.ErrorRate*100)
    }
    if report.P99 > 100*time.Millisecond {
        t.Errorf("P99 %v too high for local mock", report.P99)
    }
    t.Logf("Load test report:%s", report)
}
```

**Time:** O(RPS * duration) requests | **Space:** O(concurrency) goroutines + O(requests) for latencies

### Production Considerations

| Aspect | Details |
|--------|---------|
| Scalability | 10K goroutines use ~80MB stack; bottleneck is file descriptors — `ulimit -n 100000` |
| Edge Cases | `MaxIdleConnsPerHost` must match concurrency or you get connection queue delays |
| Error Handling | Distinguish network errors, timeout errors, and HTTP 4xx/5xx errors separately |
| Memory | For long-duration tests, stream percentile calculation with HDR histogram library |
| Concurrency | Rate limiter uses token bucket — burst allows initial spike; tune burst carefully |

### Visual Explanation

```mermaid
flowchart TD
    A["RunLoadTest starts\n10K goroutines"] --> B["rate.Limiter\ncontrols pace"]
    B --> C["Each goroutine:\nlimiter.Wait(ctx)"]
    C --> D["HTTP GET to target"]
    D --> E["Send RequestResult\nto results channel"]
    E --> F["Collector goroutine\naggregates results"]
    F --> G["After ctx deadline:\nclose(results)"]
    G --> H["Sort latencies\ncompute P50/P95/P99"]
    H --> I["Print LoadTestReport\nCheck SLO thresholds"]
```

### Interviewer Questions

1. Why are 10,000 goroutines feasible in Go but not 10,000 OS threads?
2. What is the token bucket algorithm and how does `rate.Limiter` implement it?
3. How do you prevent the results channel from blocking and causing backpressure?
4. Why is sorting latencies necessary for percentile calculation?
5. What is the difference between P95 and P99 latency in production SLOs?
6. How do you profile the load test tool itself to ensure it is not the bottleneck?
7. How does this compare to using `k6` or `wrk` for load testing?

### Follow-Up Questions

**Q1:** How do you add histogram-based percentile calculation for long-running tests?
**Q2:** How do you simulate realistic user sessions with think time and multiple requests?
**Q3:** How do you ramp up load gradually (linear, step, spike) rather than all at once?
**Q4:** How do you distribute the load test across multiple machines?
**Q5:** How do you correlate load test results with server-side metrics (CPU, memory, GC)?

---

## Company-Style Questions

---

### Google Style (3Q — Test Infrastructure)

**G1: Distributed Test Sharding**
You have a test suite with 10,000 tests that takes 45 minutes to run. Design a sharding system in Go that distributes tests across N workers (e.g. 10 machines) to reduce total time to under 5 minutes. Your system must handle worker failures, rebalance shards dynamically, and produce a merged coverage report.

Key considerations: test discovery via `go test -list`, shard assignment by consistent hashing, result aggregation via gRPC streams, coverage profile merging with `gocovmerge`, failure detection with heartbeat timeouts.

**G2: Hermetic Test Environment**
Design a framework that makes all tests hermetic: no shared state, no external dependencies, deterministic output. Show how to: intercept `time.Now()` with a clock interface, mock `os.Getenv` via dependency injection, replace `http.DefaultClient` with a test double, and ensure tests can run in any order without interfering.

Key considerations: interfaces for injectable dependencies, `TestMain` to reset global state, `t.Setenv` for environment variables, `httptest.Server` for HTTP mocking.

**G3: Flaky Test Detection and Quarantine**
Design a system that automatically detects flaky tests (tests that sometimes pass, sometimes fail), quarantines them (skips in CI but alerts on-call), and tracks flakiness rate over time. Implement the detection algorithm and the quarantine mechanism in Go.

Key considerations: run tests N times and record pass/fail per run, flakiness rate = failures/runs, quarantine via a JSON config file read by `TestMain`, metrics reporting via Prometheus.

---

### Uber Style (3Q — Reliability Testing)

**U1: Chaos Test for Service Mesh**
Write a test that injects controlled failures into a service: random latency (0-500ms), packet loss (10%), and connection resets. Verify that the consumer correctly implements retry with exponential backoff, circuit breaking, and timeout handling. All behaviour must be tested without external tools.

Key considerations: HTTP round-tripper that injects faults, `net.Conn` wrapper for TCP-level faults, verify circuit breaker state transitions, exponential backoff with jitter.

**U2: Test a Distributed Rate Limiter**
You have a rate limiter backed by Redis. Write tests that verify: (1) rate is correctly enforced across multiple goroutines (simulating multiple app instances), (2) the limiter degrades gracefully when Redis is unavailable (fallback to local rate limiter), (3) the "token refill" timing is accurate within 5ms. Use testcontainers for Redis.

Key considerations: use testcontainers Redis, simulate multiple "instances" with goroutines, measure timing accuracy with `time.Now` injection, fallback test by terminating the container mid-test.

**U3: End-to-End Request Tracing Test**
Write an integration test that verifies distributed tracing is correctly propagated across three services (A → B → C). The test must verify that all spans belong to the same trace, parent-child relationships are correct, and span duration encompasses child span duration. Use OpenTelemetry's in-memory exporter.

Key considerations: `oteltest.NewExporter`, verify `TraceID` matches across spans, verify `ParentSpanID` linkage, verify `endTime[parent] >= endTime[child]`.

---

### Amazon Style (3Q — Chaos Engineering)

**A1: Simulate AWS Region Failure**
Write a load test that simulates an AWS region failure by: sending 1000 RPS to a multi-region service, then suddenly dropping 50% of requests (simulating region failure), verifying that traffic automatically reroutes within 5 seconds, and error rate drops back below 1%. Implement the failure injection and verification in Go.

Key considerations: goroutine-based load generator, injectable failure rate, health check goroutine polling for recovery, measure time-to-recover with `time.Until`.

**A2: Database Connection Pool Exhaustion Test**
Write a test that verifies your service handles PostgreSQL connection pool exhaustion gracefully: (1) open `max_connections` connections, (2) submit a burst of requests that exceeds pool size, (3) verify requests queue (not fail) up to a timeout, (4) verify requests fail with a clear error after timeout. Use testcontainers with a PostgreSQL instance configured with `max_connections=10`.

Key considerations: testcontainers postgres with custom config, `sql.DB.SetMaxOpenConns`, verify `context.DeadlineExceeded` not panic, measure queue wait time.

**A3: DynamoDB Single-Table Design Test**
Write property-based tests for a single-table DynamoDB design that stores Users, Orders, and Products. Properties must verify: PK/SK uniqueness, access patterns return correct item types, GSI projections include required attributes, and item sizes are under the 400KB limit. Use DynamoDB Local via testcontainers.

Key considerations: testcontainers `amazon/dynamodb-local`, `rapid` for generating test items, verify `GetItem` returns correct `ItemType` attribute, measure `json.Marshal` size.

---

### Stripe Style (2Q — Financial Correctness Tests)

**S1: Idempotency Key Test for Payments**
Write a comprehensive test suite for a payment API that uses idempotency keys. Tests must verify: (1) same idempotency key returns same response without double-charging, (2) different key with same parameters creates a new charge, (3) concurrent requests with same key result in exactly one charge, (4) expired keys (>24h) are rejected. Use a real database via testcontainers.

Key considerations: Redis-backed idempotency store, `sync.WaitGroup` for concurrent submission, verify exactly-once semantics, `time.Now` injection for expiry testing.

**S2: Decimal Arithmetic Correctness Test**
Write property-based tests for a monetary calculation library that handles multi-currency operations. Properties must verify: (1) addition is commutative: `a + b == b + a`, (2) subtraction identity: `a - 0 == a`, (3) currency conversion round-trip is within rounding error, (4) tax calculation never results in fractional cents, (5) totals match sum of line items. Use `shopspring/decimal` and `rapid` for input generation.

Key considerations: `rapid.Custom` generator for `decimal.Decimal`, `decimal.Equal` not `==`, rounding mode consistency (ROUND_HALF_UP), overflow detection.

---

### Razorpay Style (2Q — Payment Flow Tests)

**R1: UPI Payment State Machine Test**
Model and test a UPI payment state machine with states: `INITIATED → PENDING → SUCCESS | FAILED | TIMEOUT`. Tests must verify: (1) all valid state transitions succeed, (2) all invalid transitions return errors, (3) `TIMEOUT` transitions to `FAILED` after 30 seconds (use clock injection), (4) concurrent state updates are safe (use race detector), (5) a full happy-path flow from `INITIATED` to `SUCCESS`.

Key considerations: enum-based state type, transition table, `sync.RWMutex` for concurrent safety, injectable clock for timeout testing, `go test -race` verification.

**R2: Reconciliation Test for Split Payments**
Write tests for a payment reconciliation system that handles split payments (one order, multiple partial payments). Tests must verify: (1) partial payments sum correctly to order total using decimal arithmetic, (2) reconciliation is idempotent (running twice produces same result), (3) duplicate payment IDs are detected, (4) currency mismatch is detected and rejected, (5) reconciliation report accurately categorises `PAID`, `PARTIAL`, `OVERPAID` orders.

Key considerations: `shopspring/decimal` for amounts, deterministic test inputs, idempotency by comparing reports from two runs, table-driven tests for all reconciliation states.

---

*End of testing-p2.md — Go Testing Part 2: Advanced to Production Level*
