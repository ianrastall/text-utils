# 22. Safety Patterns in Assembly Language Programming

## 22.1 Introduction to Safety Patterns

Safety patterns are proven, reusable solutions to common programming hazards — buffer overflows, null pointer dereferences, integer overflows, race conditions, and undefined behavior. In high-level languages, safety is often enforced by the compiler, runtime, or language design (e.g., Rust’s ownership model). In assembly language, where the programmer has direct control over every register, memory access, and instruction, safety must be explicitly designed, implemented, and verified.

> **“Assembly does not have guardrails — it has you. Safety patterns are the habits that keep you from driving off the cliff.”**  
> Unlike C or Rust, where the compiler catches many errors, assembly offers no such protection. Safety patterns are your only defense against silent corruption, crashes, and security vulnerabilities.

> **“A safety pattern is not a restriction — it is a discipline. It transforms dangerous freedom into reliable control.”**  
> Assembly’s power is its peril. Safety patterns harness that power without sacrificing correctness or robustness.

By the end of this chapter, you will understand:

- How to prevent memory safety violations: buffer overflows, use-after-free, null pointer dereferences.
- How to enforce integer safety: overflow, underflow, division by zero.
- How to ensure control flow integrity: jump validation, return address protection.
- How to implement concurrency safety: atomic operations, lock ordering, deadlock avoidance.
- How to validate inputs and enforce contracts.
- How to use hardware features for safety: segmentation (legacy), SMAP/SMEP, CET.
- How to apply safety patterns from Rust, C++, and Ada to assembly.
- How to automate safety checks with static analysis and runtime assertions.
- How to document and review safety-critical code.
- How to integrate safety patterns into existing codebases.

---

## 22.2 Memory Safety Patterns

Memory safety violations — buffer overflows, use-after-free, uninitialized reads — are the leading cause of security vulnerabilities in native code. In assembly, they must be prevented by design.

### 22.2.1 Bounds-Checked Memory Access

Always validate that memory accesses are within allocated bounds.

```x86asm
; BAD: No bounds check
global unsafe_memcpy
unsafe_memcpy:
    ; RDI = dest, RSI = src, RDX = len
    rep movsb
    ret

; GOOD: Validate length and pointer arithmetic
global safe_memcpy
safe_memcpy:
    ; Preconditions: RDI != 0, RSI != 0, RDX >= 0
    test rdi, rdi
    jz .error
    test rsi, rsi
    jz .error
    test rdx, rdx
    js .error

    ; Validate no wraparound
    mov rax, rdi
    add rax, rdx
    jc .error          ; dest + len wraps
    mov rax, rsi
    add rax, rdx
    jc .error          ; src + len wraps

    rep movsb
    xor rax, rax       ; success
    ret

.error:
    mov rax, -1        ; error
    ret
```

### 22.2.2 Pointer Validation

Validate pointers before dereferencing.

```x86asm
global safe_load
safe_load:
    ; RDI = pointer
    test rdi, rdi
    jz .null_ptr
    cmp rdi, 0x1000    ; arbitrary low bound
    jb .invalid_ptr
    ; ... load ...
    mov rax, [rdi]
    ret

.null_ptr:
.invalid_ptr:
    mov rax, 0         ; or raise exception
    ret
```

### 22.2.3 Stack Canary Pattern

Detect stack buffer overflows by placing a canary value before return addresses.

```x86asm
section .data
    canary_value dq 0x123456789ABCDEF0

global protected_function
protected_function:
    ; Save canary
    mov rax, [canary_value]
    mov [rsp - 8], rax   ; place below saved RBP

    push rbp
    mov rbp, rsp

    ; ... function body ...

    ; Check canary before return
    mov rax, [rbp - 8]   ; canary location
    cmp rax, [canary_value]
    jne .stack_smash

    leave
    ret

.stack_smash:
    ; Abort or log
    mov rdi, stack_smash_msg
    call print_and_halt
stack_smash_msg db "Stack smashed!", 10, 0
```

### 22.2.4 Use-After-Free Detection

Track allocation state — or defer to higher-level language.

In assembly, use reference counting or generation tags.

```x86asm
struc heap_object
    .refcount: resq 1
    .generation: resq 1
    .data: resb 256
endstruc

global safe_deref
safe_deref:
    ; RDI = object ptr
    cmp qword [rdi + heap_object.refcount], 0
    jle .freed
    ; ... use object ...
    ret

.freed:
    mov rax, 0
    ret
```

---

## 22.3 Integer Safety Patterns

Integer overflows, underflows, and division errors can cause crashes or security bugs.

### 22.3.1 Overflow Detection

Check for overflow after arithmetic operations.

```x86asm
global safe_add
safe_add:
    ; RDI = a, RSI = b
    mov rax, rdi
    add rax, rsi
    jo .overflow       ; jump if overflow
    ret

.overflow:
    mov rax, -1
    ret
```

For unsigned:

```x86asm
    add rax, rsi
    jc .overflow       ; carry set on unsigned overflow
```

### 22.3.2 Safe Multiplication

Check for overflow in multiplication.

```x86asm
global safe_mul
safe_mul:
    ; RDI = a, RSI = b
    mov rax, rdi
    imul rsi
    jo .overflow
    ret

.overflow:
    mov rax, -1
    ret
```

### 22.3.3 Division by Zero and Overflow

Validate divisor and check for MIN/-1 overflow.

```x86asm
global safe_divide
safe_divide:
    ; RDI = dividend, RSI = divisor
    test rsi, rsi
    jz .divide_by_zero

    ; Check for INT_MIN / -1
    mov rax, rdi
    cmp rax, 0x8000000000000000  ; INT64_MIN
    jne .safe
    cmp rsi, -1
    jne .safe
    jmp .overflow

.safe:
    cqo
    idiv rsi
    ret

.divide_by_zero:
.overflow:
    mov rax, -1
    ret
```

### 22.3.4 Saturation Arithmetic

Clamp results instead of overflowing.

```x86asm
global saturating_add
saturating_add:
    mov rax, rdi
    add rax, rsi
    jno .no_overflow

    ; Overflow — clamp to INT64_MAX or INT64_MIN
    test rdi, rdi
    js .neg_overflow
    mov rax, 0x7FFFFFFFFFFFFFFF  ; INT64_MAX
    ret
.neg_overflow:
    mov rax, 0x8000000000000000  ; INT64_MIN
    ret

.no_overflow:
    ret
```

---

## 22.4 Control Flow Integrity Patterns

Prevent hijacking of control flow via corrupted return addresses, function pointers, or jump tables.

### 22.4.1 Return Address Protection

Validate return address before `ret`.

```x86asm
global protected_function
protected_function:
    push rbp
    mov rbp, rsp

    ; Save expected return address
    mov rax, [rbp + 8]   ; return address

    ; ... function body ...

    ; Validate return address unchanged
    cmp rax, [rbp + 8]
    jne .hijacked

    leave
    ret

.hijacked:
    hlt                  ; or call abort
```

### 22.4.2 Jump Table Validation

Validate indices before indirect jumps.

```x86asm
section .data
    jump_table:
        dq .handler0, .handler1, .handler2, .handler3
    table_size = 4

global dispatch
dispatch:
    ; RDI = index
    cmp rdi, table_size
    jae .invalid_index
    mov rax, [jump_table + rdi*8]
    jmp rax

.handler0:
    ; ...
    ret
; ...

.invalid_index:
    mov rax, -1
    ret
```

### 22.4.3 Call Site Validation

Validate function pointers before calling.

```x86asm
global safe_call
safe_call:
    ; RDI = function pointer
    test rdi, rdi
    jz .null_func

    ; Validate within expected range (e.g., text section)
    mov rax, rdi
    sub rax, text_start
    cmp rax, text_size
    ja .invalid_func

    call rdi
    ret

.null_func:
.invalid_func:
    mov rax, -1
    ret

section .text
text_start:
    ; ... code ...
text_end:
text_size = text_end - text_start
```

---

## 22.5 Concurrency Safety Patterns

Concurrency introduces race conditions, deadlocks, and atomicity violations.

### 22.5.1 Atomic Read-Modify-Write

Always use `lock` prefix for RMW operations.

```x86asm
; BAD
global non_atomic_increment
non_atomic_increment:
    inc qword [rdi]     ; Not atomic!
    ret

; GOOD
global atomic_increment
atomic_increment:
    lock inc qword [rdi]
    ret
```

### 22.5.2 Lock Ordering

Acquire locks in a global order to prevent deadlocks.

```x86asm
; Assume lock A < lock B
global safe_double_lock
safe_double_lock:
    ; Always acquire lock A first
    call acquire_lock_a
    call acquire_lock_b
    ; ... critical section ...
    call release_lock_b
    call release_lock_a
    ret
```

### 22.5.3 Try-Lock with Timeout

Avoid indefinite blocking.

```x86asm
global try_lock_with_timeout
try_lock_with_timeout:
    ; RDI = lock ptr, RSI = timeout in cycles
    rdtsc
    mov rbx, rax        ; start time

.try:
    mov rax, 1
    xchg rax, [rdi]     ; attempt atomic acquire
    test rax, rax
    jz .acquired

    ; Check timeout
    rdtsc
    sub rax, rbx
    cmp rax, rsi
    jge .timeout

    pause
    jmp .try

.acquired:
    xor rax, rax        ; success
    ret

.timeout:
    mov rax, -1         ; timeout
    ret
```

### 22.5.4 Lock-Free Patterns

Use CAS (Compare-and-Swap) for lock-free data structures.

```x86asm
; Atomic set if equal to expected
global atomic_cas
atomic_cas:
    ; RDI = ptr, RSI = expected, RDX = desired
    mov rax, rsi
    lock cmpxchg [rdi], rdx
    ; RAX = actual value, ZF set if successful
    ret
```

---

## 22.6 Input Validation and Contract Enforcement

Treat all inputs as untrusted. Enforce preconditions and postconditions.

### 22.6.1 Assertion Macros

Define reusable assertion macros.

```x86asm
%macro assert 2
    cmp %1, %2
    jne %%.fail
%%.fail:
    mov rdi, %%.msg
    call assert_fail
%%.msg: db "Assertion failed: %1 %2", 10, 0
%endmacro

global safe_function
safe_function:
    assert rdi, 0       ; assert RDI != 0
    assert rsi, >, 0    ; assert RSI > 0 (custom macro needed)
    ; ... body ...
    ret
```

### 22.6.2 Design by Contract

Enforce preconditions, postconditions, invariants.

```x86asm
global divide_with_contract
divide_with_contract:
    ; Precondition: divisor != 0
    test rsi, rsi
    jz .precondition_violation

    mov rax, rdi
    cqo
    idiv rsi

    ; Postcondition: quotient * divisor + remainder = dividend
    push rdx            ; save remainder
    imul rbx, rax, rsi  ; quotient * divisor
    pop rdx
    add rbx, rdx        ; + remainder
    cmp rbx, rdi
    jne .postcondition_violation

    ret

.precondition_violation:
.postcondition_violation:
    mov rax, -1
    ret
```

### 22.6.3 Range Validation

Validate inputs are within expected ranges.

```x86asm
global process_byte
process_byte:
    ; RDI = byte (0-255)
    cmp dil, 255
    ja .invalid
    ; ... process ...
    ret

.invalid:
    mov rax, -1
    ret
```

---

## 22.7 Hardware-Assisted Safety Features

Modern x86-64 CPUs provide hardware features to enhance safety.

### 22.7.1 Supervisor Mode Access Prevention (SMAP) and Execution Prevention (SMEP)

Prevent kernel from accessing user-space data or executing user-space code.

Enable in kernel:

```x86asm
; Enable SMEP and SMAP
mov rax, cr4
or rax, (1<<20) | (1<<21)  ; SMEP | SMAP
mov cr4, rax
```

Violations cause page faults.

### 22.7.2 Control-flow Enforcement Technology (CET)

CET provides shadow stacks and indirect branch tracking.

Enable shadow stack:

```x86asm
; Enable CET
mov rcx, 0x6A0          ; IA32_U_CET MSR
rdmsr
or eax, 1               ; enable user-mode CET
wrmsr
```

Shadow stack stores return addresses separately — hardware validates on `ret`.

### 22.7.3 Memory Protection Keys (MPK)

Restrict access to memory regions.

```x86asm
; Set PKRU to deny access to key 1
mov eax, 0x3            ; AD=1, WD=1 for key 1
mov rcx, 0x1000         ; IA32_PKRU
wrmsr

; Memory with key 1 is now inaccessible
```

---

## 22.8 Applying High-Level Language Safety Patterns to Assembly

Patterns from Rust, C++, and Ada can be adapted to assembly.

### 22.8.1 RAII (Resource Acquisition Is Initialization)

In assembly, use paired acquire/release.

```x86asm
global safe_with_resource
safe_with_resource:
    call acquire_resource
    push rax            ; save handle

    ; ... use resource ...

    pop rdi
    call release_resource
    ret
```

### 22.8.2 Option/Maybe Pattern

Return error codes or use output parameters.

```x86asm
global safe_divide_option
safe_divide_option:
    ; RDI = a, RSI = b, RDX = ptr to result
    test rsi, rsi
    jz .none
    mov rax, rdi
    cqo
    idiv rsi
    mov [rdx], rax
    mov rax, 1          ; Some
    ret

.none:
    mov rax, 0          ; None
    ret
```

### 22.8.3 Iterator Pattern with Bounds

Validate iterator bounds.

```x86asm
global safe_iterate
safe_iterate:
    ; RDI = array, RSI = length, RDX = callback
    xor rcx, rcx        ; index

.loop:
    cmp rcx, rsi
    jge .done
    ; Validate callback
    test rdx, rdx
    jz .done
    ; Call with element
    mov rdi, [rdi + rcx*8]
    call rdx
    inc rcx
    jmp .loop

.done:
    ret
```

---

## 22.9 Automated Safety Checks

Integrate safety checks into build and test workflows.

### 22.9.1 Static Analysis for Safety

Custom linter for common patterns.

```bash
#!/bin/bash
# safety_lint.sh
file=$1

# Check for missing lock prefix
if grep -E "(inc|dec|add|sub|and|or|xor) .*%.*" $file | grep -v "lock"; then
    echo "Warning: Possible non-atomic RMW without lock in $file"
fi

# Check for unchecked pointer dereference
if grep -E "mov.*\[%.*\]" $file | grep -v "test %.*,%.*"; then
    echo "Warning: Possible unchecked pointer dereference in $file"
fi
```

### 22.9.2 Runtime Assertions

Enable assertions in debug builds.

```x86asm
%ifdef DEBUG
    %macro assert 1
        test %1, %1
        jnz %%.pass
        mov rdi, %%.msg
        call abort
    %%.pass:
    %%.msg: db "Assertion failed: %1", 10, 0
    %endmacro
%else
    %macro assert 1
    %endmacro
%endif
```

### 22.9.3 Fuzzing for Safety

Use AFL or libFuzzer via C wrapper.

C wrapper:

```c
extern int asm_function(char *buf, size_t len);

int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    asm_function((char*)data, size);
    return 0;
}
```

Fuzz:

```bash
afl-fuzz -i testcases -o findings -- ./fuzz_target @@
```

---

## 22.10 Documentation and Code Review for Safety

Safety is a team sport — document assumptions and review code.

### 22.10.1 Safety Comments

Annotate code with safety invariants.

```x86asm
; SAFETY: RDI must be 16-byte aligned — caller must ensure
; SAFETY: RSI must be <= 1024 — validated by caller
global safe_sse_function
safe_sse_function:
    movaps xmm0, [rdi]   ; requires 16-byte alignment
    ; ...
```

### 22.10.2 Code Review Checklist

Review for:

- Memory safety: bounds, null, use-after-free.
- Integer safety: overflow, division.
- Concurrency: atomicity, lock ordering.
- Control flow: jump validation, return protection.
- Input validation: preconditions, ranges.

### 22.10.3 Pair Programming and Mob Review

For critical code, review in pairs or teams.

---

## 22.11 Integrating Safety Patterns into Legacy Code

Retrofitting safety into existing assembly codebases.

### 22.11.1 Incremental Adoption

- Start with new code.
- Refactor high-risk functions first.
- Add wrappers with safety checks.

### 22.11.2 Safe Wrappers for Unsafe Functions

Wrap legacy functions with safety checks.

```x86asm
global safe_wrapper_for_unsafe_function
safe_wrapper_for_unsafe_function:
    ; Validate inputs
    test rdi, rdi
    jz .error
    cmp rsi, max_size
    ja .error

    ; Call unsafe function
    call unsafe_function
    ret

.error:
    mov rax, -1
    ret
```

### 22.11.3 Gradual Hardening

- Add stack canaries.
- Enable CET or SMAP/SMEP.
- Introduce static analysis.

---

## 22.12 Best Practices and Pitfalls

### 22.12.1 Best Practices Table

| **Pattern**               | **Description**                                                                 |
| :---                      | :---                                                                            |
| **Bounds Checking**       | Validate all pointer arithmetic and array accesses.                             |
| **Atomic Operations**     | Use `lock` prefix for all shared memory RMW.                                    |
| **Input Validation**      | Treat all inputs as untrusted — validate early.                                 |
| **Hardware Features**     | Enable SMAP, SMEP, CET for additional protection.                               |
| **Static Analysis**       | Run linters and analyzers on every build.                                       |
| **Assertions**            | Use runtime assertions in debug builds to catch violations.                     |
| **Code Review**           | Review safety-critical code with checklists and pairs.                          |
| **Gradual Hardening**     | Retrofit safety into legacy code incrementally.                                 |

### 22.12.2 Common Pitfalls

- **Assuming Safety**: “It works” ≠ “It’s safe”.
- **Ignoring Concurrency**: Race conditions only appear under load.
- **Overhead Fear**: Safety checks are cheap compared to crashes.
- **Incomplete Validation**: Checking pointer != 0 but not bounds.
- **Tool Neglect**: Not using available hardware or analysis tools.

> **“Safety is not the absence of danger — it is the presence of defenses. In assembly, you build those defenses line by line.”**  
> Every instruction is a potential vulnerability. Safety patterns are the armor you forge to protect your code — and your users.

> **“The safest code is the code that refuses to run when conditions are unsafe. Better a controlled failure than an uncontrolled catastrophe.”**  
> Fail fast, fail loudly, fail safely. Assembly gives you the power to enforce that principle — use it.

---

## 22.13 Exercises

1. Implement a bounds-checked array access function in assembly.
2. Add stack canaries to an existing assembly function and test with a buffer overflow.
3. Write a safe integer addition function that detects overflow and returns an error.
4. Implement a jump table with index validation and test with invalid indices.
5. Write a lock-free counter using `lock cmpxchg` and verify with ThreadSanitizer.
6. Enable SMEP in a kernel module and attempt to execute user-space code.
7. Write a static analysis script that flags all `mov` instructions without prior pointer validation.
8. Add runtime assertions to an assembly function and verify they trigger on invalid inputs.
9. Refactor a legacy assembly function to use RAII-style resource management.
10. Conduct a safety-focused code review of a peer’s assembly code using a checklist.

---

## 22.14 Further Reading

- “The Shellcoder’s Handbook” — for understanding exploits and defenses.
- Intel® 64 and IA-32 Architectures Software Developer’s Manual (SMAP, SMEP, CET).
- “Secure Coding in C and C++” by Robert Seacord.
- “Rust for Low-Level Programming” — adapting Rust safety to assembly.
- “Building Secure and Reliable Systems” by Google.
- CWE Top 25 (https://cwe.mitre.org/top25/) — common weakness enumeration.
