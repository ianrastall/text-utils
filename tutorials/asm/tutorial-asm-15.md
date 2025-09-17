# 15. C and Assembly Language Interoperability

## 15.1 Introduction to Interoperability

The ability to combine C and assembly language is one of the most powerful techniques available to systems programmers. While C provides high-level abstractions, portability, and rapid development, assembly language delivers precise control over performance, hardware interaction, and instruction selection. Together, they form a symbiotic relationship — C orchestrates program structure and logic, while assembly optimizes critical paths, accesses privileged instructions, or interfaces directly with hardware.

This is the fifteenth chapter in a comprehensive series on x86-64 assembly language programming. Previous chapters have covered foundational topics such as registers, memory addressing, control flow, multi-core concurrency, and exception handling. Now, we turn to the practical integration of assembly with the most widely used systems programming language: C.

Although earlier editions of this material focused exclusively on safety-critical domains — such as aerospace, medical devices, and industrial control — this chapter adopts a general-purpose scope. Whether you are writing a game engine, optimizing a cryptographic library, building a kernel module, or developing embedded firmware, interoperability between C and assembly is essential.

> **“Assembly is not the enemy of abstraction — it is its precision instrument.”**  
> When C’s abstractions become too coarse, assembly refines them. When C’s performance becomes inadequate, assembly accelerates it. The goal is not to replace C, but to augment it — surgically, where necessary.

> **“The best assembly code is often the code you don’t write — unless you must.”**  
> Modern compilers are remarkably efficient. Write assembly only when profiling shows a bottleneck, when hardware requires it, or when algorithmic constraints demand explicit instruction sequences.

This chapter will teach you:

- How to call assembly functions from C and vice versa.
- How to conform to the System V ABI (Application Binary Interface) on x86-64.
- How to pass parameters, return values, and preserve registers.
- How to access global and static variables from assembly.
- How to inline assembly within C functions using GCC and Clang syntax.
- How to handle stack alignment, red zones, and calling conventions.
- How to debug mixed C/assembly programs.
- How to optimize performance-critical loops and mathematical operations.
- How to interface with SIMD intrinsics and inline assembly.
- How to avoid common pitfalls: register corruption, stack misalignment, ABI violations.

By the end of this chapter, you will be able to seamlessly integrate hand-written assembly routines into C projects — enhancing performance, enabling hardware access, and deepening your understanding of how high-level code maps to machine instructions.

---

## 15.2 The System V ABI for x86-64

Before writing interoperable code, you must understand the Application Binary Interface (ABI) — the contract between compiled code modules. On Unix-like systems (Linux, macOS, BSD), the System V ABI defines calling conventions, register usage, stack layout, and symbol naming for x86-64.

### 15.2.1 Register Usage and Parameter Passing

The System V ABI specifies that the first six integer or pointer arguments are passed in registers:

| **Argument** | **Register** |
| :---         | :---         |
| **1st**      | `rdi`        |
| **2nd**      | `rsi`        |
| **3rd**      | `rdx`        |
| **4th**      | `rcx`        |
| **5th**      | `r8`         |
| **6th**      | `r9`         |

Additional arguments are passed on the stack, right-to-left.

Floating-point arguments are passed in `xmm0` through `xmm7`.

Return values:

- Integer or pointer: `rax` (and `rdx` for 128-bit values).
- Floating-point: `xmm0`.

### 15.2.2 Volatile vs. Non-Volatile Registers

Registers are classified as **caller-saved** (volatile) or **callee-saved** (non-volatile).

Caller-saved registers (must be saved by the caller if needed across a call):

- `rax`, `rcx`, `rdx`, `rsi`, `rdi`, `r8`, `r9`, `r10`, `r11`
- `xmm0`–`xmm15`

Callee-saved registers (must be preserved by the callee):

- `rbx`, `rbp`, `r12`, `r13`, `r14`, `r15`
- `xmm6`–`xmm15` (Note: Despite being volatile, some ABIs or toolchains may preserve these — consult your platform’s documentation.)

### 15.2.3 Stack Alignment and Red Zone

The stack must be 16-byte aligned before any `call` instruction.

Additionally, the ABI defines a 128-byte **red zone** below `rsp` — a region the function may use without adjusting `rsp`, safe from signal handlers and interrupts. This is available only in leaf functions (functions that do not call other functions).

> **“The ABI is not a suggestion — it is a contract. Violate it, and your program will fail in mysterious, unreproducible ways.”**  
> Compilers assume the ABI is followed. If your assembly corrupts `rbx` without saving it, or misaligns the stack, the calling C code may crash hours later — with no obvious connection to your assembly routine.

### 15.2.4 Symbol Naming

C symbols are typically prefixed with an underscore (`_`) on some platforms (e.g., macOS), but not on Linux. Use `extern` and `global` directives appropriately.

In assembly:

```x86asm
global my_function      ; Linux
; global _my_function  ; macOS — uncomment if targeting Darwin
```

In C:

```c
extern int my_function(int a, int b);
```

Use `nm` or `objdump` to verify symbol names in object files.

---

## 15.3 Calling Assembly Functions from C

The most common use case: writing performance-critical or hardware-specific functions in assembly, then calling them from C.

### 15.3.1 Simple Example: Integer Addition

C declaration:

```c
// add.h
#ifndef ADD_H
#define ADD_H
int asm_add(int a, int b);
#endif
```

Assembly implementation:

```x86asm
; add.asm
bits 64
section .text
global asm_add

asm_add:
    ; RDI = a, RSI = b
    mov rax, rdi
    add rax, rsi
    ret
```

Compile and link:

```bash
nasm -f elf64 add.asm -o add.o
gcc -c main.c -o main.o
gcc main.o add.o -o program
```

C main:

```c
// main.c
#include <stdio.h>
#include "add.h"

int main() {
    int result = asm_add(5, 7);
    printf("5 + 7 = %d\n", result);  // Output: 12
    return 0;
}
```

### 15.3.2 Handling More Than Six Arguments

Seventh and subsequent arguments are passed on the stack.

```x86asm
; sum7.asm
global sum7

sum7:
    ; RDI, RSI, RDX, RCX, R8, R9 = args 1-6
    ; [rsp+8] = arg7 (return address is at [rsp])
    mov rax, rdi
    add rax, rsi
    add rax, rdx
    add rax, rcx
    add rax, r8
    add rax, r9
    add rax, [rsp + 8]   ; 7th argument
    ret
```

C declaration:

```c
long sum7(long a, long b, long c, long d, long e, long f, long g);
```

### 15.3.3 Returning Structures

Small structures (≤16 bytes) are returned in `rax` and `rdx`. Larger structures are returned via a hidden pointer passed as the first argument.

Example: Return a 16-byte struct.

```x86asm
; point2d.asm
struc point2d
    .x: resq 1
    .y: resq 1
endstruc

global make_point

make_point:
    ; RDI = x, RSI = y
    ; Return in RAX (low 8 bytes) and RDX (high 8 bytes)
    mov rax, rdi
    mov rdx, rsi
    ret
```

C:

```c
typedef struct { long x, y; } point2d;

point2d make_point(long x, long y);
```

For structures >16 bytes:

```x86asm
; big_struct.asm
global make_big

make_big:
    ; RDI = hidden pointer to return struct
    ; RSI = arg1, RDX = arg2, etc.
    mov qword [rdi + 0], rsi
    mov qword [rdi + 8], rdx
    mov qword [rdi + 16], rcx
    ; ... initialize struct at [rdi]
    mov rax, rdi   ; return pointer
    ret
```

C:

```c
typedef struct { long a, b, c; } big_struct;
big_struct make_big(long a, long b, long c);
```

The compiler automatically allocates space and passes the address.

---

## 15.4 Calling C Functions from Assembly

Assembly routines often need to call C library functions (e.g., `printf`, `malloc`, `memcpy`).

### 15.4.1 Basic Example: Calling printf

```x86asm
; hello.asm
extern printf
section .data
    fmt db "Hello from assembly! Result: %d", 10, 0

section .text
global _start

_start:
    ; Compute result
    mov rdi, 42

    ; Call C function
    push rbp           ; maintain 16-byte alignment
    mov rsi, rdi       ; second arg to printf
    mov rdi, fmt       ; first arg (format string)
    xor rax, rax       ; no xmm args
    call printf
    pop rbp

    ; Exit
    mov rax, 60        ; sys_exit
    mov rdi, 0
    syscall
```

Compile:

```bash
nasm -f elf64 hello.asm -o hello.o
gcc hello.o -o hello
```

Note: `printf` is a variadic function. The `rax` register must contain the number of floating-point arguments passed in vector registers — zero in this case.

### 15.4.2 Preserving Callee-Saved Registers

If your assembly function calls C functions, you must preserve `rbx`, `rbp`, `r12`–`r15`.

```x86asm
; safe_call.asm
extern malloc
global process_data

process_data:
    push rbx
    push r12
    push r13
    push rbp

    ; Use rbx, r12, r13 freely
    mov rbx, rdi
    mov r12, 8
    mov rdi, r12
    call malloc        ; may clobber rax, rcx, rdx, rsi, r8, r9, r10, r11
    test rax, rax
    jz .error

    ; ... use allocated memory ...

.error:
    xor rax, rax

    pop rbp
    pop r13
    pop r12
    pop rbx
    ret
```

### 15.4.3 Handling Variadic Functions

Variadic functions like `printf` require `rax` to specify the number of vector registers used.

```x86asm
; print_float.asm
extern printf
section .data
    fmt db "Value: %f", 10, 0

section .text
global print_float

print_float:
    ; xmm0 = float value
    sub rsp, 8         ; align to 16
    mov rdi, fmt
    mov rax, 1         ; one xmm register used
    call printf
    add rsp, 8
    ret
```

Failure to set `rax` correctly may cause crashes or garbage output.

---

## 15.5 Accessing Global and Static Variables

Assembly code can read and write C global and static variables by declaring them as `extern`.

### 15.5.1 Reading and Writing Global Variables

C:

```c
// globals.c
long global_counter = 0;
static long static_value = 42;
```

Assembly:

```x86asm
; access_globals.asm
extern global_counter
extern static_value   ; Note: static variables may have mangled names — check with nm

global increment_counter
global get_static_value

increment_counter:
    lock inc qword [global_counter]   ; atomic increment
    ret

get_static_value:
    mov rax, [static_value]
    ret
```

Compile together:

```bash
gcc -c globals.c -o globals.o
nasm -f elf64 access_globals.asm -o access_globals.o
gcc globals.o access_globals.o -o program
```

> **“Static variables are not hidden from assembly — they are hidden from the linker. Use `nm` to find their true names.”**  
> Static variables may be named `_ZL11static_value` or similar due to compiler mangling. Use `nm your_object.o` to list symbols and find the correct name.

### 15.5.2 Thread-Local Storage (TLS)

Accessing TLS variables requires special handling. Use `mov rax, [rel var@tpoff]` + base from `fs` segment (Linux) or `gs` (Windows/macOS).

Linux example:

```x86asm
; tls.asm
extern errno           ; often TLS

global get_errno
get_errno:
    mov rax, [fs:0]    ; get TLS base (simplified — actual offset may vary)
    add rax, errno@tpoff
    mov rax, [rax]
    ret
```

In practice, prefer calling C wrapper functions for TLS access unless performance is critical.

---

## 15.6 Inline Assembly in C

GCC and Clang support inline assembly via the `asm` keyword. This allows embedding assembly directly within C functions.

### 15.6.1 Basic Syntax: `asm("instruction")`

Simple, no operands:

```c
void nop() {
    asm("nop");
}
```

### 15.6.2 Extended Inline Assembly

Syntax:

```c
asm("instructions"
    : output operands
    : input operands
    : clobbered registers
);
```

Example: Add two numbers.

```c
int add_inline(int a, int b) {
    int result;
    asm("addl %1, %0"
        : "=r" (result)      // output
        : "r" (a), "0" (b)   // input — "0" means same as operand 0
    );
    return result;
}
```

Operand constraints:

- `"r"`: general register
- `"m"`: memory
- `"i"`: immediate integer
- `"=r"`: output in register
- `"+r"`: input and output

### 15.6.3 Clobber List

Inform the compiler which registers or flags are modified.

```c
void cpuid_example(unsigned int *eax, unsigned int *ebx,
                   unsigned int *ecx, unsigned int *edx) {
    asm("cpuid"
        : "=a" (*eax), "=b" (*ebx), "=c" (*ecx), "=d" (*edx)
        : "a" (*eax), "c" (*ecx)
        : /* no clobbers — cpuid outputs in a,b,c,d */
    );
}
```

If you modify memory or flags:

```c
asm("stc"              // set carry flag
    :
    :
    : "cc"             // clobber condition codes
);
```

Or memory:

```c
asm("movl %1, %0"
    : "=m" (dest)
    : "r" (src)
    : "memory"
);
```

### 15.6.4 Inline Assembly with Labels and Jumps

Use `%= ` to generate unique labels.

```c
int abs_inline(int x) {
    int result;
    asm("movl %1, %0\n\t"
        "testl %0, %0\n\t"
        "jge 1f%=\n\t"
        "negl %0\n\t"
        "1:%="
        : "=r" (result)
        : "r" (x)
    );
    return result;
}
```

### 15.6.5 Performance Optimization: Loop Unrolling

Inline assembly can optimize tight loops.

```c
void memset_32(char *ptr, char val, size_t n) {
    asm volatile(
        "cld\n\t"
        "rep stosb"
        :
        : "D" (ptr), "a" (val), "c" (n)
        : "memory", "rdi", "rcx"
    );
}
```

The `volatile` keyword prevents the compiler from optimizing away the assembly block.

---

## 15.7 Stack Management and Alignment

Incorrect stack handling is the most common source of crashes in mixed C/assembly code.

### 15.7.1 Maintaining 16-Byte Alignment

The stack pointer (`rsp`) must be 16-byte aligned before any `call` instruction.

Example: Function that calls `printf`.

```x86asm
print_value:
    ; RDI = value to print
    push rbp           ; RBP is 8 bytes — now stack is misaligned
    sub rsp, 8         ; adjust to 16-byte alignment
    mov rsi, rdi
    mov rdi, fmt
    xor rax, rax
    call printf
    add rsp, 8
    pop rbp
    ret

section .data
fmt db "Value: %ld", 10, 0
```

Alternatively, push a dummy register:

```x86asm
print_value:
    push rax           ; preserve nothing, just align
    mov rsi, rdi
    mov rdi, fmt
    xor rax, rax
    call printf
    pop rax
    ret
```

### 15.7.2 Red Zone Usage

The 128-byte red zone below `rsp` is available for leaf functions.

```x86asm
leaf_function:
    ; No function calls — safe to use red zone
    mov [rsp - 8], rdi    ; store arg in red zone
    mov [rsp - 16], rsi
    ; ... computations ...
    mov rax, [rsp - 8]
    add rax, [rsp - 16]
    ret
```

Do not use the red zone if calling other functions — they may overwrite it.

### 15.7.3 Stack Frames and Debugging

For debuggability, establish a standard stack frame.

```x86asm
my_function:
    push rbp
    mov rbp, rsp
    sub rsp, 32          ; local variables

    ; ... body ...

    mov rsp, rbp
    pop rbp
    ret
```

This allows debuggers (GDB) to unwind the stack and display local variables.

---

## 15.8 SIMD and Inline Assembly

SIMD (Single Instruction, Multiple Data) operations are crucial for performance in multimedia, scientific computing, and cryptography. While intrinsics are preferred, inline assembly offers maximum control.

### 15.8.1 SSE Example: Vector Addition

C with intrinsics:

```c
#include <xmmintrin.h>
__m128 add_vectors(__m128 a, __m128 b) {
    return _mm_add_ps(a, b);
}
```

Equivalent inline assembly:

```c
__m128 add_vectors_asm(__m128 a, __m128 b) {
    __m128 result;
    asm("addps %1, %0"
        : "=x" (result)
        : "x" (a), "0" (b)
    );
    return result;
}
```

Constraint `"x"` means SSE register.

### 15.8.2 AVX Example: 256-bit Addition

```c
#include <immintrin.h>
__m256 add_vectors_avx(__m256 a, __m256 b) {
    __m256 result;
    asm("vaddps %1, %0, %0"
        : "=v" (result)
        : "v" (a), "0" (b)
    );
    return result;
}
```

Constraint `"v"` for AVX registers.

### 15.8.3 Memory Operands

Load/store with SIMD.

```c
void load_add_store(float *a, float *b, float *result) {
    asm("movaps (%1), %%xmm0\n\t"
        "addps (%2), %%xmm0\n\t"
        "movaps %%xmm0, (%0)"
        :
        : "r" (result), "r" (a), "r" (b)
        : "xmm0", "memory"
    );
}
```

Note: Use `%%` to escape register names in inline assembly.

---

## 15.9 Debugging Mixed C and Assembly Code

Debugging requires understanding both source levels.

### 15.9.1 Using GDB

Compile with debug symbols:

```bash
gcc -g -c main.c -o main.o
nasm -g -F dwarf -f elf64 asmfile.asm -o asmfile.o
gcc -g main.o asmfile.o -o program
```

In GDB:

- `break function_name` — set breakpoint.
- `stepi` — step one assembly instruction.
- `info registers` — view register state.
- `x/10i $rip` — examine next 10 instructions.
- `disassemble` — show assembly for current function.

### 15.9.2 Viewing Generated Assembly

Use `objdump` or compiler flags to inspect generated code.

```bash
gcc -S -masm=intel main.c   # generate Intel-syntax assembly
objdump -d program          # disassemble executable
```

### 15.9.3 Common Debugging Scenarios

- **Segmentation fault**: Usually stack misalignment or invalid memory access.
- **Incorrect results**: Register clobbering — forgot to save `rbx` or declare clobber.
- **Crash after return**: Stack imbalance — pushed but didn’t pop, or vice versa.
- **Floating-point corruption**: Forgot to save `xmm6`–`xmm15` if modified.

---

## 15.10 Performance Optimization Techniques

Assembly is often used to optimize hotspots. Here are proven techniques.

### 15.10.1 Loop Optimization

Unroll loops and use SIMD.

C:

```c
void scale_array(float *arr, float scale, int n) {
    for (int i = 0; i < n; i++) {
        arr[i] *= scale;
    }
}
```

Assembly (SIMD):

```x86asm
global scale_array
scale_array:
    ; RDI = arr, XMM0 = scale, RSI = n
    test rsi, rsi
    jz .done
    shl rsi, 2          ; n * 4 = byte count
    add rsi, rdi        ; end pointer
.loop:
    movaps xmm1, [rdi]
    mulps xmm1, xmm0
    movaps [rdi], xmm1
    add rdi, 16
    cmp rdi, rsi
    jl .loop
.done:
    ret
```

### 15.10.2 Bit Manipulation and Arithmetic

Use `lea`, `imul`, and bit shifts for fast arithmetic.

```x86asm
; Compute (a * 5 + b) * 2
compute_fast:
    lea rax, [rdi + rdi*4]   ; a * 5
    add rax, rsi             ; + b
    add rax, rax             ; * 2
    ret
```

### 15.10.3 Avoiding Branches

Use conditional moves or arithmetic to avoid pipeline stalls.

```x86asm
; Return max(a, b)
max_no_branch:
    mov rax, rdi
    cmp rax, rsi
    cmovl rax, rsi
    ret
```

---

## 15.11 Common Pitfalls and How to Avoid Them

### 15.11.1 Register Corruption

Forgetting to save callee-saved registers.

```x86asm
; BAD
bad_function:
    mov rbx, rdi    ; rbx not saved!
    call some_c_function
    add rax, rbx    ; rbx may be corrupted
    ret
```

Fixed:

```x86asm
; GOOD
good_function:
    push rbx
    mov rbx, rdi
    call some_c_function
    add rax, rbx
    pop rbx
    ret
```

### 15.11.2 Stack Misalignment

Causes crashes on `call` or `movaps`.

```x86asm
; BAD
misaligned_call:
    push rax        ; rsp now 8 mod 16
    call printf     ; may crash
    pop rax
    ret
```

Fixed:

```x86asm
; GOOD
aligned_call:
    sub rsp, 8
    push rax
    call printf
    pop rax
    add rsp, 8
    ret
```

### 15.11.3 Incorrect Clobber Lists

Compiler assumes registers are unchanged.

```c
// BAD
int bad_asm(int x) {
    int y;
    asm("movl %1, %%ebx\n\t"
        "addl $10, %%ebx\n\t"
        "movl %%ebx, %0"
        : "=r" (y)
        : "r" (x)
        // FORGOT TO CLOBBER "ebx"
    );
    return y;
}
```

Fixed:

```c
// GOOD
int good_asm(int x) {
    int y;
    asm("movl %1, %%ebx\n\t"
        "addl $10, %%ebx\n\t"
        "movl %%ebx, %0"
        : "=r" (y)
        : "r" (x)
        : "ebx"
    );
    return y;
}
```

### 15.11.4 ABI Violations Table

| **Violation**               | **Symptom**                          | **Solution**                                |
| :---                        | :---                                 | :---                                        |
| **Stack Misalignment**      | Crash on `call`, `movaps`, or `printf`| Align `rsp` to 16 bytes before `call`.      |
| **Unsaved Callee Registers**| Random corruption after function call | Save `rbx`, `rbp`, `r12`–`r15` if used.     |
| **Missing Clobbers**        | Compiler reuses corrupted registers   | Declare all modified registers in clobber list. |
| **Incorrect Parameter Order**| Wrong values in registers            | Follow System V ABI: `rdi`, `rsi`, `rdx`... |
| **Red Zone Overwrite**      | Crash in signal handlers             | Don’t use red zone if calling other functions. |

---

## 15.12 Advanced Topics: Exception Handling, Structured Control Flow

### 15.12.1 Handling Exceptions in Inline Assembly

You can trigger or handle exceptions, but C++ exceptions won’t cross assembly boundaries without special handling.

```c
void trigger_divide_by_zero() {
    asm volatile("xor %%rax, %%rax\n\t"
                 "div %%rax"
                 :
                 :
                 : "rax", "rdx"
    );
    // This will crash — no C++ catch block will catch it
}
```

To interface with C++ exceptions, use `libunwind` or write explicit SEH (Windows) or signal handlers (Unix).

### 15.12.2 Structured Inline Assembly with Labels

GCC supports goto labels in inline assembly.

```c
void example_goto() {
    asm goto("jmp %l0"
             :
             :
             :
             : error_label
    );
    return;
error_label:
    printf("Jumped to error label\n");
}
```

Useful for complex control flow, but reduces portability.

---

## 15.13 Real-World Examples

### 15.13.1 Fast Memory Copy

```x86asm
global fast_memcpy
fast_memcpy:
    ; RDI = dest, RSI = src, RDX = len
    mov rcx, rdx
    shr rcx, 3          ; len / 8
    rep movsq           ; copy 8 bytes at a time
    mov rcx, rdx
    and rcx, 7          ; remainder
    rep movsb           ; copy remaining bytes
    mov rax, rdi
    ret
```

### 15.13.2 CRC32 Calculation

Using `crc32` instruction.

```x86asm
global crc32_byte
crc32_byte:
    ; RDI = crc, RSI = byte
    movzx esi, sil
    crc32 edi, esi
    mov rax, rdi
    ret
```

### 15.13.3 Atomic Operations

```x86asm
global atomic_add
atomic_add:
    ; RDI = ptr, RSI = value
    mov rax, rsi
    lock xadd [rdi], rax
    add rax, rsi
    ret
```

---

## 15.14 Summary and Best Practices

### 15.14.1 Key Takeaways

- Follow the System V ABI strictly: register usage, stack alignment, calling conventions.
- Save callee-saved registers if you modify them.
- Use `extern` to access C globals; use `global` to export assembly functions.
- Inline assembly is powerful but error-prone — validate constraints and clobbers.
- Debug with GDB and `objdump`; test edge cases.
- Optimize only after profiling — avoid premature optimization.
- Prefer intrinsics over inline assembly for SIMD — unless you need precise control.

### 15.14.2 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Preserve ABI Compliance**   | Always save `rbx`, `rbp`, `r12`–`r15`; align stack to 16 bytes.                 |
| **Use Extended Inline Assembly**| Prefer over basic `asm` — allows inputs, outputs, clobbers.                     |
| **Declare All Clobbers**      | Tell compiler which registers and flags you modify.                             |
| **Validate with Compiler Output**| Use `gcc -S` to inspect generated assembly.                                     |
| **Test on Multiple Platforms**| macOS, Linux, Windows may have different symbol naming or TLS models.           |
| **Profile Before Optimizing** | Ensure the assembly actually improves performance.                              |
| **Comment Extensively**       | Assembly is hard to read — document register usage, stack layout, and ABI assumptions. |

> **“Interoperability is not a feature — it is a discipline. One misaligned stack, one unsaved register, and your program collapses.”**  
> Treat every assembly function as a contract. Document its inputs, outputs, side effects, and assumptions. Test it in isolation before integrating.

> **“The compiler is your ally, not your adversary. Write assembly that cooperates with it — not against it.”**  
> Use constraints, clobbers, and memory barriers to inform the compiler. Never assume the compiler is “too dumb” — assume it is optimizing around your assembly.

---

## 15.15 Exercises

1. Write an assembly function that computes the factorial of a number and call it from C.
2. Implement `strlen` in assembly and compare performance with the C library version.
3. Write inline assembly to swap two integers without a temporary variable.
4. Create a function that uses inline assembly to read the CPU’s time-stamp counter (`rdtsc`).
5. Write a SIMD assembly function to compute the dot product of two float arrays.
6. Access a C global array from assembly and reverse its elements in place.
7. Write a function that calls `malloc` from assembly, initializes the memory, and returns a pointer.
8. Use inline assembly to implement a spinlock using `xchg`.
9. Write a function that triggers a divide-by-zero exception and catches it via a signal handler in C.
10. Optimize a matrix multiplication kernel using AVX inline assembly.

---

## 15.16 Further Reading

- System V ABI x86-64 Specification (https://refspecs.linuxfoundation.org/elf/x86_64-abi-0.99.pdf)
- GCC Inline Assembly HOWTO (https://gcc.gnu.org/onlinedocs/gcc/Extended-Asm.html)
- Intel® 64 and IA-32 Architectures Software Developer’s Manual
- “Computer Systems: A Programmer’s Perspective” by Bryant and O’Hallaron
- Agner Fog’s Optimization Manuals (www.agner.org)
