# 19. Verification of Assembly Language Code

## 19.1 Introduction to Assembly Verification

Verification is the process of ensuring that a program behaves as intended — not just under nominal conditions, but across all possible inputs, states, and environmental interactions. In high-level languages, verification often relies on type systems, static analyzers, unit tests, and runtime assertions. In assembly language, where abstraction is minimal and control is maximal, verification demands a more rigorous, multi-layered approach.

> **“Assembly does not forgive. It executes. Verification is the process of ensuring that what it executes is what you intended.”**  
> Unlike high-level languages, where the compiler and runtime provide guardrails, assembly offers no safety net. Verification is your only defense against silent corruption and catastrophic failure.

> **“If you cannot verify it, you do not understand it. If you do not understand it, you should not deploy it.”**  
> Verification is not merely testing — it is formal reasoning, static analysis, dynamic tracing, and systematic validation. It transforms assembly from a black art into an engineering discipline.

By the end of this chapter, you will understand:

- How to design verifiable assembly routines from the outset.
- How to write assertions and contracts in assembly.
- How to use static analysis tools to detect undefined behavior.
- How to write comprehensive unit and integration tests for assembly code.
- How to perform symbolic execution and formal verification.
- How to validate memory safety, control flow integrity, and register usage.
- How to debug and trace assembly execution with GDB, Valgrind, and custom tools.
- How to verify concurrent and interrupt-driven code.
- How to apply verification techniques from safety-critical domains to general-purpose software.
- How to automate verification in CI/CD pipelines.

---

## 19.2 Designing for Verifiability

Verification begins at design time. Code structured for clarity, modularity, and testability is inherently easier to verify.

### 19.2.1 Single Responsibility Principle

Each assembly function should perform one task and do it well. Avoid side effects unless explicitly documented.

Example: A function that both modifies a buffer and returns a status code is harder to verify than one that does only one.

```x86asm
; BAD: Modifies buffer and returns new length — conflates responsibilities
global transform_buffer
transform_buffer:
    ; RDI = buffer, RSI = length
    ; ... modifies buffer ...
    ; RAX = new length
    ret

; GOOD: Separate transformation from length query
global apply_transform
apply_transform:
    ; RDI = buffer, RSI = length
    ; modifies buffer, returns void (RAX = 0)
    xor rax, rax
    ret

global get_transformed_length
get_transformed_length:
    ; RDI = original length
    ; RAX = transformed length
    lea rax, [rdi + rdi]  ; example: double length
    ret
```

### 19.2.2 Explicit Preconditions and Postconditions

Document — and enforce — what the function expects and guarantees.

```x86asm
; Preconditions:
;   - RDI != 0 (valid pointer)
;   - RSI > 0 (length > 0)
;   - Buffer is readable and writable
; Postconditions:
;   - Buffer contents transformed
;   - RAX = 0 on success
global safe_transform
safe_transform:
    test rdi, rdi
    jz .precondition_failed
    test rsi, rsi
    jz .precondition_failed

    ; ... body ...

    xor rax, rax
    ret

.precondition_failed:
    mov rax, -1
    ret
```

### 19.2.3 Avoid Global State

Global variables introduce hidden dependencies and make verification state-space explode.

```x86asm
section .data
    ; AVOID
    global_counter dq 0

; Instead, pass state explicitly
global transform_with_state
transform_with_state:
    ; RDI = buffer, RSI = length, RDX = state ptr
    ; ...
    ret
```

---

## 19.3 Static Analysis and Linting

Static analysis examines code without executing it. It can catch undefined behavior, unreachable code, and violations of calling conventions.

### 19.3.1 Manual Code Review Checklist

Before running tools, perform a manual review:

- Are all registers preserved according to ABI?
- Is the stack aligned before `call`?
- Are all code paths terminated with `ret` or `jmp`?
- Are memory accesses within bounds?
- Are error codes handled consistently?
- Are labels unique and jumps valid?

### 19.3.2 Using `asm-lint` and Custom Scripts

While no universal “lint” tool exists for assembly, you can write scripts to check for patterns.

Example: Check for missing `ret`.

```bash
# Simple shell script to find functions without ret
nasm -f elf64 -g -l listing.lst yourfile.asm
grep -B 5 -A 5 "global" listing.lst | grep -v "ret" | grep -E "(call|jmp|loop)"
```

### 19.3.3 Disassembler-Based Analysis

Use `objdump` to verify generated code.

```bash
nasm -f elf64 yourfile.asm -o yourfile.o
objdump -d yourfile.o
```

Look for:

- Unintended instructions.
- Missing or extra `ret`.
- Incorrect register usage.

### 19.3.4 Control Flow Graph (CFG) Extraction

Tools like `radare2` or `Ghidra` can generate CFGs.

```bash
r2 -A your_binary
[0x00000000]> pdf @ main
```

Verify that all paths lead to termination and no infinite loops exist unintentionally.

---

## 19.4 Dynamic Analysis: Testing and Debugging

Dynamic analysis executes the code with specific inputs to observe behavior.

### 19.4.1 Unit Testing Frameworks for Assembly

Write tests in C or a scripting language that calls your assembly functions.

Example: C test harness.

```c
// test_math.c
#include <stdio.h>
#include <assert.h>

extern int asm_add(int a, int b);

void test_add() {
    assert(asm_add(2, 3) == 5);
    assert(asm_add(-1, 1) == 0);
    assert(asm_add(0, 0) == 0);
    printf("test_add passed\n");
}

int main() {
    test_add();
    return 0;
}
```

Compile and run:

```bash
nasm -f elf64 math.asm -o math.o
gcc test_math.c math.o -o test_math
./test_math
```

### 19.4.2 Property-Based Testing

Use tools like `QuickCheck` (via Haskell or Rust bindings) to generate random inputs.

Rust example:

```rust
extern "C" {
    fn asm_add(a: i32, b: i32) -> i32;
}

#[cfg(test)]
mod tests {
    use super::*;
    use quickcheck::QuickCheck;

    fn prop_add_commutative(a: i32, b: i32) -> bool {
        let result1 = unsafe { asm_add(a, b) };
        let result2 = unsafe { asm_add(b, a) };
        result1 == result2
    }

    #[test]
    fn test_add_commutative() {
        QuickCheck::new().quickcheck(prop_add_commutative as fn(i32, i32) -> bool);
    }
}
```

### 19.4.3 Edge Case Testing

Test boundaries: zero, maximum, minimum, negative, alignment.

```c
void test_edge_cases() {
    assert(asm_add(INT_MAX, 0) == INT_MAX);
    assert(asm_add(INT_MIN, 0) == INT_MIN);
    assert(asm_add(INT_MAX, 1) == INT_MIN); // overflow
    // ... etc
}
```

---

## 19.5 Assertions and Runtime Contracts

Insert runtime checks to catch violations during execution.

### 19.5.1 Assertion Macros

Define assertion macros in assembly.

```x86asm
%macro assert_nonzero 1
    test %1, %1
    jnz %%.pass
    mov rdi, %%.msg
    call assert_fail
%%.pass:
%%.msg: db "Assertion failed: %1 != 0", 10, 0
%endmacro

global safe_divide
safe_divide:
    assert_nonzero rsi
    mov rax, rdi
    cqo
    idiv rsi
    ret

assert_fail:
    ; Print message and abort
    extern printf
    extern exit
    push rdi
    mov rsi, rdi
    mov rdi, fmt
    xor rax, rax
    call printf
    pop rdi
    mov rdi, 1
    call exit
fmt: db "%s", 0
```

### 19.5.2 Contract Enforcement

Enforce preconditions and postconditions.

```x86asm
%macro require 2
    cmp %1, %2
    jge %%.ok
    mov rdi, %%.msg
    call contract_violation
%%.ok:
%%.msg: db "Contract failed: %1 >= %2", 10, 0
%endmacro

global buffer_copy
buffer_copy:
    ; RDI = dest, RSI = src, RDX = len
    require rdx, 0
    test rdi, rdi
    jz .invalid_ptr
    test rsi, rsi
    jz .invalid_ptr

    ; ... copy ...

    ret

.invalid_ptr:
    mov rax, -1
    ret

contract_violation:
    ; Log and abort
    ; ...
    ret
```

---

## 19.6 Memory Safety Verification

Memory errors — buffer overflows, use-after-free, uninitialized reads — are the most common source of vulnerabilities in assembly.

### 19.6.1 Bounds Checking

Always validate pointer arithmetic.

```x86asm
global safe_memcpy
safe_memcpy:
    ; RDI = dest, RSI = src, RDX = len
    test rdx, rdx
    jz .done
    ; Validate that dest + len doesn’t wrap
    mov rax, rdi
    add rax, rdx
    jc .overflow
    ; Validate that src + len doesn’t wrap
    mov rax, rsi
    add rax, rdx
    jc .overflow

    ; ... copy ...

.done:
    xor rax, rax
    ret
.overflow:
    mov rax, -1
    ret
```

### 19.6.2 Using Valgrind and AddressSanitizer

Although designed for C, these tools work with assembly if called from C.

C wrapper:

```c
// wrapper.c
extern void asm_function(char *buf, size_t len);

int main() {
    char *buf = malloc(100);
    asm_function(buf, 150); // should trigger overflow
    free(buf);
    return 0;
}
```

Run with Valgrind:

```bash
gcc -g wrapper.c your_asm.o -o program
valgrind ./program
```

Or AddressSanitizer:

```bash
gcc -fsanitize=address -g wrapper.c your_asm.o -o program
./program
```

### 19.6.3 Stack Canary and Guard Pages

For functions handling untrusted input, insert stack canaries.

```x86asm
section .data
    canary dq 0x123456789ABCDEF0

global vulnerable_function
vulnerable_function:
    ; Save canary
    mov rax, [canary]
    mov [rsp - 8], rax

    ; ... function body ...

    ; Check canary
    mov rax, [rsp - 8]
    cmp rax, [canary]
    jne .stack_smash
    ret

.stack_smash:
    ; Abort
    mov rdi, msg
    call print_and_abort
msg: db "Stack smashed!", 10, 0
```

---

## 19.7 Control Flow Integrity

Ensure that execution follows only intended paths.

### 19.7.1 Jump Table Validation

Validate indices before indirect jumps.

```x86asm
section .data
    jump_table:
        dq .case0, .case1, .case2, .case3
    table_size = 4

global dispatch
dispatch:
    ; RDI = index
    cmp rdi, table_size
    jae .invalid
    mov rax, [jump_table + rdi*8]
    jmp rax

.case0:
    ; ...
    ret
.case1:
    ; ...
    ret
; ...

.invalid:
    mov rax, -1
    ret
```

### 19.7.2 Return Address Checking

Validate return addresses in critical functions.

```x86asm
global secure_function
secure_function:
    ; Save expected return address
    mov rax, [rsp]
    ; ... body ...
    ; Validate return address hasn’t changed
    cmp rax, [rsp]
    jne .hijacked
    ret

.hijacked:
    ; Abort
    hlt
```

---

## 19.8 Register and Flag Usage Verification

Incorrect register or flag usage can cause subtle bugs.

### 19.8.1 Callee-Saved Register Validation

Ensure non-volatile registers are preserved.

```x86asm
global safe_function
safe_function:
    ; Save callee-saved registers
    push rbx
    push r12

    ; ... body — may use rbx, r12 ...

    ; Validate they are restored? (optional — expensive)
    ; Instead, rely on code review and testing

    pop r12
    pop rbx
    ret
```

### 19.8.2 Flag Preservation

If your function must preserve flags, save and restore RFLAGS.

```x86asm
global flag_preserving_function
flag_preserving_function:
    pushfq
    ; ... body that modifies flags ...
    popfq
    ret
```

---

## 19.9 Formal Verification and Symbolic Execution

Formal methods mathematically prove correctness.

### 19.9.1 Annotated Assembly with ACSL

While ACSL (ANSI/ISO C Specification Language) targets C, you can annotate C wrappers.

```c
// math_wrapper.c
/*@ requires a >= 0 && b >= 0;
    ensures \result == a + b;
*/
int asm_add(int a, int b);
```

Use Frama-C to verify:

```bash
frama-c -wp math_wrapper.c
```

### 19.9.2 Symbolic Execution with KLEE or S2E

Compile assembly to LLVM IR (via `llc` or custom tool), then use KLEE.

```bash
# Hypothetical — requires assembly-to-LLVM translator
klee your_code.bc
```

### 19.9.3 Model Checking with Spin or TLA+

Model high-level behavior in Promela or TLA+, then verify against assembly specification.

Example Promela model for a spinlock:

```promela
byte lock = 0;

active proctype worker() {
    do
    :: atomic { lock == 0; lock = 1 } ->
        /* critical section */
        lock = 0
    od
}
```

Verify with Spin:

```bash
spin -a model.pml
gcc -o pan pan.c
./pan
```

---

## 19.10 Verification of Concurrent Code

Concurrent assembly code requires additional verification for race conditions, deadlocks, and atomicity.

### 19.10.1 Atomicity Verification

Ensure RMW (read-modify-write) operations use `lock` prefix.

```x86asm
global atomic_increment
atomic_increment:
    lock inc qword [rdi]   ; Correct
    ; inc qword [rdi]     ; Incorrect — not atomic
    ret
```

### 19.10.2 Race Condition Detection

Use ThreadSanitizer (TSan) via C wrapper.

```c
// wrapper.c
extern void concurrent_function(int *shared);

int main() {
    int shared = 0;
    #pragma omp parallel for
    for (int i = 0; i < 1000; i++) {
        concurrent_function(&shared);
    }
    return 0;
}
```

Compile with TSan:

```bash
gcc -fsanitize=thread -fPIE -pie -g wrapper.c your_asm.o -o program
./program
```

### 19.10.3 Deadlock Detection

Model locking protocols and verify absence of cycles.

Use static analysis or model checking.

---

## 19.11 Interrupt and Exception Handler Verification

Handlers must be reentrant, minimal, and restore state correctly.

### 19.11.1 Stack and Register Validation

Ensure `iretq` returns to correct state.

```x86asm
global timer_handler
timer_handler:
    ; Save all volatile registers
    push rax
    push rcx
    push rdx
    push rsi
    push rdi
    push r8
    push r9
    push r10
    push r11

    ; ... body ...

    ; Restore in reverse order
    pop r11
    pop r10
    pop r9
    pop r8
    pop rdi
    pop rsi
    pop rdx
    pop rcx
    pop rax
    iretq
```

### 19.11.2 No Floating-Point in Handlers

Unless explicitly saved.

```x86asm
global safe_handler
safe_handler:
    sub rsp, 512
    fxsave [rsp]    ; Save FP state

    ; ... body ...

    fxrstor [rsp]
    add rsp, 512
    iretq
```

---

## 19.12 Debugging and Tracing

Use debuggers and tracers to observe execution.

### 19.12.1 GDB for Assembly Debugging

Compile with debug symbols:

```bash
nasm -g -F dwarf -f elf64 yourfile.asm -o yourfile.o
gcc -g yourfile.o -o program
gdb ./program
```

In GDB:

- `break *function_name`
- `stepi` — step one instruction
- `info registers` — view all registers
- `x/10i $rip` — examine next 10 instructions
- `disassemble` — show function assembly

### 19.12.2 Logging and Tracing

Insert logging via `printf` or `write` system call.

```x86asm
global traced_function
traced_function:
    ; Log entry
    mov rdi, log_msg
    call print_string

    ; ... body ...

    ; Log exit
    mov rdi, exit_msg
    call print_string
    ret

section .data
log_msg db "Entering traced_function", 10, 0
exit_msg db "Exiting traced_function", 10, 0
```

### 19.12.3 Performance Counters

Use `perf` to monitor cache misses, branches, etc.

```bash
perf stat ./program
perf record ./program
perf report
```

---

## 19.13 Automation and Continuous Integration

Integrate verification into CI/CD pipelines.

### 19.13.1 Makefile with Verification Targets

```makefile
.PHONY: test lint verify

test: program
	./test_runner

lint:
	./asm-lint.sh src/*.asm

verify: lint test
	@echo "Verification passed"

program: src/math.asm
	nasm -g -f elf64 $< -o build/math.o
	gcc build/math.o test/test_math.c -o program
```

### 19.13.2 GitHub Actions Example

`.github/workflows/verify.yml`:

```yaml
name: Verify Assembly
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Install tools
      run: sudo apt install nasm gcc
    - name: Build and test
      run: |
        make
        make test
    - name: Run Valgrind
      run: valgrind --error-exitcode=1 ./program
```

---

## 19.14 Verification in Safety-Critical vs. General-Purpose Contexts

While this chapter is general-purpose, safety-critical techniques are often applicable.

### 19.14.1 DO-178C / ISO 26262 Techniques

- **Requirements traceability**: Every line of assembly must map to a requirement.
- **Structural coverage**: Achieve 100% MC/DC (Modified Condition/Decision Coverage).
- **Independent verification**: Separate team reviews and tests code.

### 19.14.2 Applying to General Software

- Use requirements traceability for critical functions (e.g., crypto, memory management).
- Aim for high coverage in unit tests.
- Perform independent code reviews.

---

## 19.15 Best Practices and Pitfalls

### 19.15.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Write Testable Code**       | Modular, single-responsibility functions with clear pre/postconditions.         |
| **Use Static Analysis**       | Manual review and tool-based linting before dynamic testing.                    |
| **Enforce Contracts**         | Use assertions and runtime checks liberally in development builds.              |
| **Validate Memory Accesses**  | Bounds check all pointer arithmetic.                                            |
| **Verify Concurrency**        | Use ThreadSanitizer and model checkers for multi-threaded code.                 |
| **Automate Verification**     | Integrate tests and analysis into CI/CD pipelines.                              |
| **Profile and Trace**         | Use GDB, perf, and logging to observe runtime behavior.                         |
| **Review Independently**      | Have another programmer verify critical routines.                               |

### 19.15.2 Common Pitfalls

- **Assuming Correctness**: “It works on my machine” is not verification.
- **Ignoring Edge Cases**: Zero, overflow, alignment, and null pointers.
- **Overlooking Concurrency**: Race conditions only appear under load.
- **Missing Register Saves**: Corrupting `rbx` or `r12` causes random failures.
- **Stack Misalignment**: Crashes on `call` or SIMD instructions.

> **“Verification is not a phase — it is a mindset. Every line of assembly must be written with the question: How will I know this is correct?”**  
> Adopt verification as a core discipline, not an afterthought. It is the difference between code that works and code that can be trusted.

> **“The most dangerous bug is the one you think you’ve fixed. Verification is the process of proving you actually did.”**  
> Never assume a fix works — test it, trace it, and verify it under the conditions that exposed the bug.

---

## 19.16 Exercises

1. Write a unit test harness in C for an assembly function that reverses a string.
2. Use Valgrind to detect a buffer overflow in an assembly `memcpy` implementation.
3. Insert assertions into an assembly division function to prevent divide-by-zero.
4. Verify that a spinlock implementation is deadlock-free using model checking (Spin or TLA+).
5. Use GDB to step through an assembly function and validate register usage.
6. Write a property-based test in Rust for an assembly arithmetic function.
7. Implement stack canaries in an assembly function and trigger a stack smash to verify detection.
8. Use AddressSanitizer to detect a use-after-free in an assembly memory manager.
9. Verify control flow integrity in a jump table by injecting an invalid index and ensuring it is caught.
10. Set up a GitHub Actions workflow that builds, tests, and runs Valgrind on an assembly project.

---

## 19.17 Further Reading

- “The Verification of Assembly Language” — Technical Report, University of Cambridge.
- Frama-C: https://frama-c.com/
- KLEE: https://klee.github.io/
- Valgrind: https://valgrind.org/
- Spin: http://spinroot.com/
- TLA+: https://lamport.azurewebsites.net/tla/tla.html
- DO-178C: RTCA DO-178C Standard.
- “Building Secure and Reliable Systems” — Google.
