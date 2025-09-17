# 16. Inline Assembly in C/C++ Compilers

## 16.1 Introduction to Inline Assembly

Inline assembly is the mechanism by which assembly language instructions are embedded directly within C or C++ source code. Unlike standalone assembly modules that are compiled separately and linked, inline assembly is processed by the compiler as part of the compilation unit. This enables fine-grained control over instruction selection, register allocation, and memory access — while retaining the structure, tooling, and debugging support of high-level languages.

This is the sixteenth chapter in a comprehensive series on x86-64 assembly language programming. While earlier chapters focused on foundational concepts, multi-core concurrency, exception handling, and C/assembly interoperability, this chapter dives deeply into the syntax, semantics, optimization, and pitfalls of inline assembly — specifically as implemented by GCC and Clang on x86-64 platforms. Microsoft Visual C++ uses a different syntax (discussed briefly in Section 16.10), but the principles remain consistent.

Inline assembly is not a tool for rewriting entire programs in assembly. It is a scalpel — to be used sparingly, precisely, and only when profiling or hardware constraints justify it. Modern compilers are exceptionally good at optimizing high-level code. Use inline assembly when:

- You need to execute a specific instruction not exposed via intrinsics (e.g., `rdtsc`, `cpuid`, `xgetbv`).
- You are implementing atomic or synchronization primitives that require precise instruction ordering.
- You are optimizing a hot loop where compiler-generated code is suboptimal.
- You are accessing model-specific registers (MSRs) or privileged instructions (in kernel mode).
- You are writing code for embedded or real-time systems with strict timing or size constraints.

> **“Inline assembly is not performance — it is precision. Use it to enforce what the compiler cannot infer, not to outsmart it.”**  
> The compiler’s optimizer is your ally. Inline assembly should complement it — by constraining register usage, enforcing memory barriers, or inserting specific opcodes — not replace it.

> **“Every line of inline assembly is a contract with the compiler. Break that contract, and your program will fail — silently, randomly, and catastrophically.”**  
> Unlike standalone assembly, inline assembly must declare its inputs, outputs, side effects, and register modifications. Failure to do so results in corrupted state, incorrect optimizations, and unreproducible bugs.

By the end of this chapter, you will understand:

- The basic and extended syntax of GCC inline assembly.
- How to specify input, output, and clobber constraints.
- How to use register, memory, and immediate operands.
- How to handle condition codes, labels, and jumps.
- How to optimize loops, mathematical operations, and bit manipulations.
- How to interface with SIMD and vector instructions.
- How to avoid common pitfalls: register corruption, memory aliasing, stack misalignment.
- How to debug and validate inline assembly blocks.
- How Microsoft’s inline assembly differs and when to use each.

---

## 16.2 Basic Inline Assembly Syntax

The simplest form of inline assembly consists of a string literal containing assembly instructions.

### 16.2.1 Single Instruction

```c
void do_nop() {
    asm("nop");
}
```

This inserts a single `nop` instruction at the point of the `asm` statement. The compiler treats it as a black box — it does not know what registers or memory are affected.

### 16.2.2 Multiple Instructions

Separate instructions with `\n\t` for readability and correct formatting.

```c
void do_several_things() {
    asm("mov $1, %rax\n\t"
        "add $2, %rax\n\t"
        "nop");
}
```

Note: This uses AT&T syntax by default (destination on right). For Intel syntax, compile with `-masm=intel` or use `.intel_syntax` prefix (see Section 16.7).

### 16.2.3 Volatile Keyword

The `volatile` keyword prevents the compiler from optimizing away or reordering the assembly block.

```c
void memory_barrier() {
    asm volatile("" ::: "memory");
}
```

Without `volatile`, the compiler may remove “empty” or “redundant” assembly blocks.

---

## 16.3 Extended Inline Assembly: Inputs, Outputs, Clobbers

Extended inline assembly provides a structured interface between C variables and assembly instructions.

### 16.3.1 Syntax

```c
asm [volatile] (
    "assembly template"
    : output operands
    : input operands
    : clobbered registers or flags
);
```

Each operand list is comma-separated. Empty lists are omitted or left blank.

### 16.3.2 Output Operands

Output operands use the `=constraint` syntax. The constraint specifies where the output should be placed (register, memory, etc.).

Example: Add two integers.

```c
int add_asm(int a, int b) {
    int result;
    asm("addl %1, %0"
        : "=r" (result)      // output: any general register
        : "r" (a), "0" (b)   // inputs: register, and operand 0 (same as result)
    );
    return result;
}
```

Here, `%0` refers to the first operand (`result`), and `%1` refers to the second (`a`). The constraint `"0"` for `b` means “use the same location as operand 0”.

### 16.3.3 Input Operands

Input operands are read-only unless marked with `+` (input-output).

```c
int increment_asm(int x) {
    asm("incl %0"
        : "+r" (x)   // input and output
    );
    return x;
}
```

### 16.3.4 Clobber List

The clobber list informs the compiler which registers, memory, or condition codes are modified.

```c
void set_carry_flag() {
    asm("stc" ::: "cc");   // clobber condition codes
}
```

Common clobbers:

- `"rax"`, `"rbx"`, ... — specific registers
- `"memory"` — memory may be read or written
- `"cc"` — condition codes (flags) modified

---

## 16.4 Operand Constraints

Constraints tell the compiler how to allocate operands — in registers, memory, or immediates.

### 16.4.1 Register Constraints

| **Constraint** | **Description**                     |
| :---           | :---                                |
| **"r"**        | Any general-purpose register        |
| **"a"**        | `rax`/`eax`/`ax`/`al`               |
| **"b"**        | `rbx`/`ebx`/`bx`/`bl`               |
| **"c"**        | `rcx`/`ecx`/`cx`/`cl`               |
| **"d"**        | `rdx`/`edx`/`dx`/`dl`               |
| **"S"**        | `rsi`/`esi`/`si`/`sil`              |
| **"D"**        | `rdi`/`edi`/`di`/`dil`              |
| **"q"**        | `rax`, `rbx`, `rcx`, `rdx` (legacy) |

Example:

```c
void outb(unsigned short port, unsigned char val) {
    asm("outb %0, %1"
        :
        : "a" (val), "Nd" (port)   // "Nd" = 0-255 immediate or dx
    );
}
```

### 16.4.2 Memory Constraints

| **Constraint** | **Description**                     |
| :---           | :---                                |
| **"m"**        | Memory operand                      |
| **"o"**        | Offsettable memory (can add offset) |
| **"V"**        | Non-offsettable memory              |

Example:

```c
void store_value(int *ptr, int val) {
    asm("movl %1, %0"
        : "=m" (*ptr)
        : "r" (val)
    );
}
```

### 16.4.3 Immediate Constraints

| **Constraint** | **Description**                     |
| :---           | :---                                |
| **"i"**        | Immediate integer                   |
| **"n"**        | Known numeric immediate             |
| **"I"**        | 0–31 (for shifts)                   |
| **"J"**        | 0–63                                |
| **"K"**        | Signed 8-bit                        |
| **"L"**        | `0xFF` or `0xFFFF`                  |
| **"M"**        | 0–3                                 |
| **"N"**        | 0–255 (for `out` instruction)       |

Example:

```c
void shift_left(int *x) {
    asm("shll $3, %0"
        : "+m" (*x)
        : /* no input */
        : "cc"
    );
}
```

### 16.4.4 Floating-Point and SIMD Constraints

| **Constraint** | **Description**                     |
| :---           | :---                                |
| **"x"**        | SSE register (`xmm0`–`xmm15`)       |
| **"v"**        | AVX register (`ymm0`–`ymm15`)       |
| **"f"**        | x87 floating-point register         |

Example:

```c
float add_floats(float a, float b) {
    float result;
    asm("addss %1, %0"
        : "=x" (result)
        : "x" (a), "0" (b)
    );
    return result;
}
```

---

## 16.5 Advanced Constraint Features

### 16.5.1 Matching Constraints

Use digit constraints to force operands to share the same location.

```c
int add_to_self(int *x, int y) {
    asm("addl %1, %0"
        : "+r" (*x)     // input-output
        : "r" (y)       // input
    );
    return *x;
}
```

Or explicitly:

```c
int add_to_self_v2(int *x, int y) {
    asm("addl %2, %0"
        : "=r" (*x)
        : "0" (*x), "r" (y)   // operand 1 matches operand 0
    );
    return *x;
}
```

### 16.5.2 Multiple Alternative Constraints

Use `|` to specify alternatives.

```c
void move_data(void *dest, const void *src, size_t len) {
    asm("rep movsb"
        :
        : "D" (dest), "S" (src), "c" (len)
        : "memory"
    );
}
```

### 16.5.3 Constraint Modifiers

- `=`: Write-only output.
- `+`: Read-write operand.
- `&`: Early clobber — output is written before all inputs are consumed.
- `%`: Commutative operand (can swap with next operand).

Example: Early clobber.

```c
int divmod(int a, int b, int *rem) {
    int quot;
    asm("idivl %2"
        : "=a" (quot), "=d" (*rem)
        : "r" (b), "0" (a)   // "0" = same as operand 0 (a in rax)
        : /* no clobbers — idiv uses rax, rdx */
    );
    return quot;
}
```

Here, `rdx` is written (remainder) before `b` is fully consumed — but since `b` is in a general register, not `rdx`, it’s safe.

If `b` were forced into `rdx`, it would be overwritten prematurely. Use `&` to prevent this:

```c
asm("idivl %2"
    : "=&a" (quot), "=&d" (*rem)   // early clobber
    : "r" (b), "0" (a)
);
```

---

## 16.6 Memory Clobbers and Barriers

The `"memory"` clobber tells the compiler that the assembly block may read or write memory not explicitly listed in operands.

### 16.6.1 Preventing Memory Reordering

```c
void atomic_store(int *ptr, int val) {
    asm volatile("movl %1, %0"
                 : "=m" (*ptr)
                 : "r" (val)
                 : "memory"
    );
}
```

Without `"memory"`, the compiler might reorder stores around this instruction.

### 16.6.2 Compiler Memory Barrier

An empty assembly block with `"memory"` clobber acts as a compiler barrier.

```c
#define barrier() asm volatile("" ::: "memory")
```

This prevents the compiler from reordering memory accesses across the barrier — but does not generate any CPU fence instructions.

### 16.6.3 Combining with CPU Barriers

For full memory ordering, combine with `mfence`, `sfence`, `lfence`.

```c
void store_release(int *ptr, int val) {
    asm volatile("movl %1, %0\n\t"
                 "sfence"
                 : "=m" (*ptr)
                 : "r" (val)
                 : "memory"
    );
}
```

---

## 16.7 Syntax Variants: AT&T vs. Intel

GCC uses AT&T syntax by default. You can switch to Intel syntax per-block or globally.

### 16.7.1 Per-Block Intel Syntax

```c
void example_intel() {
    asm(".intel_syntax noprefix\n\t"
        "mov eax, 1\n\t"
        "add eax, 2\n\t"
        ".att_syntax prefix"
        :
        :
        :
    );
}
```

### 16.7.2 Global Intel Syntax

Compile with `-masm=intel`.

```bash
gcc -masm=intel -c file.c
```

Then write:

```c
void example_global_intel() {
    asm("mov eax, 1\n\t"
        "add eax, 2"
        :
        :
        :
    );
}
```

### 16.7.3 Operand Order

AT&T: `op src, dest`  
Intel: `op dest, src`

Example:

```c
// AT&T
asm("addl %1, %0" : "=r" (a) : "r" (b));

// Intel
asm("add %0, %1" : "=r" (a) : "r" (b));   // same operands, different order
```

---

## 16.8 Labels, Jumps, and Control Flow

Inline assembly can contain labels and jumps — but requires special handling to avoid conflicts.

### 16.8.1 Local Labels with `%=`

Use `%=` to generate a unique number for each instance of the assembly block.

```c
int abs_asm(int x) {
    int result;
    asm("movl %1, %0\n\t"
        "testl %0, %0\n\t"
        "jge 1f%=\n\t"
        "negl %0\n\t"
        "1%=:"
        : "=r" (result)
        : "r" (x)
    );
    return result;
}
```

### 16.8.2 Jumping to C Labels (GCC Extension)

Use `asm goto` to jump to C labels.

```c
void check_value(int x) {
    asm goto("cmpl $0, %0\n\t"
             "jl %l1"
             :
             : "r" (x)
             : "cc"
             : negative
    );
    printf("Non-negative\n");
    return;
negative:
    printf("Negative\n");
}
```

This is useful for error handling or fast paths.

### 16.8.3 Preserving Control Flow

Avoid jumps that bypass C cleanup (e.g., destructors in C++). Use `asm goto` for structured control flow.

---

## 16.9 SIMD and Vector Operations

Inline assembly is often used for SIMD when intrinsics are insufficient or when precise instruction selection is needed.

### 16.9.1 SSE Example: Vector Addition

```c
#include <xmmintrin.h>

__m128 add_ps(__m128 a, __m128 b) {
    __m128 result;
    asm("addps %1, %0"
        : "=x" (result)
        : "x" (a), "0" (b)
    );
    return result;
}
```

### 16.9.2 AVX Example: Fused Multiply-Add

```c
#include <immintrin.h>

__m256 fmadd_ps(__m256 a, __m256 b, __m256 c) {
    __m256 result;
    asm("vfmadd132ps %2, %1, %0"
        : "=v" (result)
        : "v" (c), "v" (b), "0" (a)
    );
    return result;
}
```

### 16.9.3 Memory Operands with SIMD

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

Note: Use `%%` to escape register names in inline assembly strings.

---

## 16.10 Microsoft Visual C++ Inline Assembly

Microsoft’s compiler uses a different syntax — only available in 32-bit mode. x64 MSVC does not support inline assembly; use intrinsics instead.

### 16.10.1 Basic Syntax

```c
void do_add() {
    int a = 5, b = 7, result;
    __asm {
        mov eax, a
        add eax, b
        mov result, eax
    }
}
```

### 16.10.2 Limitations

- No direct access to C++ variables in x64.
- No extended constraints or clobbers.
- Less portable.

### 16.10.3 When to Use

- Legacy 32-bit Windows code.
- Educational purposes.
- Avoid in new x64 projects — use intrinsics or standalone assembly.

---

## 16.11 Optimization and Performance

Inline assembly can improve performance — but only if used correctly.

### 16.11.1 Loop Optimization

Unroll and vectorize manually.

```c
void scale_array(float *arr, float scale, int n) {
    int i = 0;
    if (n >= 8) {
        __m256 v_scale = _mm256_set1_ps(scale);
        for (; i <= n - 8; i += 8) {
            __m256 v = _mm256_load_ps(&arr[i]);
            v = _mm256_mul_ps(v, v_scale);
            _mm256_store_ps(&arr[i], v);
        }
    }
    // Remainder with inline assembly
    for (; i < n; i++) {
        asm("mulss %1, %0"
            : "+x" (arr[i])
            : "x" (scale)
        );
    }
}
```

### 16.11.2 Bit Manipulation

Use `lea`, `imul`, shifts for fast arithmetic.

```c
int compute_index(int a, int b) {
    int result;
    asm("leal (%1, %1, 4), %0\n\t"   // a * 5
        "leal (%0, %2), %0\n\t"      // + b
        "addl %0, %0"                // * 2
        : "=r" (result)
        : "r" (a), "r" (b)
    );
    return result;
}
```

### 16.11.3 Avoiding Branches

Use conditional moves or arithmetic.

```c
int max_asm(int a, int b) {
    int result;
    asm("movl %1, %0\n\t"
        "cmpl %2, %0\n\t"
        "cmovl %2, %0"
        : "=&r" (result)
        : "r" (a), "r" (b)
    );
    return result;
}
```

---

## 16.12 Debugging and Validation

Debugging inline assembly requires understanding both C and assembly contexts.

### 16.12.1 Using GDB

Compile with `-g`.

```bash
gcc -g -c file.c
gdb ./program
```

In GDB:

- `break function`
- `stepi` — step one instruction
- `info registers` — view state
- `disassemble` — show mixed source+assembly

### 16.12.2 Compiler Output Inspection

Use `gcc -S` to generate assembly.

```bash
gcc -S -masm=intel file.c
```

Check that operands are allocated correctly and clobbers are respected.

### 16.12.3 Static Analysis

Tools like `clang-tidy` or `cppcheck` may not understand inline assembly. Validate manually.

---

## 16.13 Common Pitfalls and Best Practices

### 16.13.1 Pitfall: Forgetting Clobbers

```c
// BAD
int bad_crc(int crc, char byte) {
    int result;
    asm("crc32b %1, %0"
        : "=r" (result)
        : "r" (byte), "0" (crc)
        // FORGOT TO CLOBBER FLAGS
    );
    return result;
}
```

Fixed:

```c
// GOOD
int good_crc(int crc, char byte) {
    int result;
    asm("crc32b %1, %0"
        : "=r" (result)
        : "r" (byte), "0" (crc)
        : "cc"
    );
    return result;
}
```

### 16.13.2 Pitfall: Incorrect Constraints

```c
// BAD
void outb_bad(unsigned short port, unsigned char val) {
    asm("outb %0, %1"
        :
        : "a" (val), "r" (port)   // port must be in dx or immediate
    );
}
```

Fixed:

```c
// GOOD
void outb_good(unsigned short port, unsigned char val) {
    asm("outb %0, %1"
        :
        : "a" (val), "Nd" (port)
    );
}
```

### 16.13.3 Pitfall: Stack Misalignment

Inline assembly that calls functions must maintain 16-byte stack alignment.

```c
// BAD
void call_printf_bad(int x) {
    asm("pushq %%rax\n\t"       // misaligns stack
        "movq %0, %%rsi\n\t"
        "movq $fmt, %%rdi\n\t"
        "xorq %%rax, %%rax\n\t"
        "call printf\n\t"
        "popq %%rax"
        :
        : "r" (x)
        : "rdi", "rsi", "rax", "memory"
    );
}
```

Fixed:

```c
// GOOD
void call_printf_good(int x) {
    asm("subq $8, %%rsp\n\t"    // align
        "movq %0, %%rsi\n\t"
        "movq $fmt, %%rdi\n\t"
        "xorq %%rax, %%rax\n\t"
        "call printf\n\t"
        "addq $8, %%rsp"
        :
        : "r" (x)
        : "rdi", "rsi", "rax", "memory"
    );
}
```

### 16.13.4 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Always Specify Clobbers**   | Declare all modified registers, flags, and memory.                              |
| **Use Volatile When Needed**  | Prevent optimization of timing-critical or side-effecting code.                 |
| **Validate with Compiler Output**| Use `gcc -S` to inspect generated assembly.                                     |
| **Prefer Intrinsics for SIMD**| Unless you need exact instruction selection, use intrinsics for readability and portability. |
| **Test on Multiple Compilers**| GCC, Clang, ICC may handle constraints differently.                             |
| **Avoid Inline Assembly in Headers**| Increases compilation time and complexity.                                     |
| **Document Constraints and Effects**| Comment every inline assembly block thoroughly.                                |

---

## 16.14 Real-World Examples

### 16.14.1 RDTSC — Read Time-Stamp Counter

```c
inline uint64_t rdtsc() {
    uint32_t lo, hi;
    asm volatile("rdtsc"
                 : "=a" (lo), "=d" (hi)
    );
    return ((uint64_t)hi << 32) | lo;
}
```

### 16.14.2 CPUID

```c
void cpuid(uint32_t leaf, uint32_t *eax, uint32_t *ebx,
           uint32_t *ecx, uint32_t *edx) {
    asm volatile("cpuid"
                 : "=a" (*eax), "=b" (*ebx), "=c" (*ecx), "=d" (*edx)
                 : "a" (leaf), "c" (0)
    );
}
```

### 16.14.3 Atomic Compare-and-Swap

```c
int atomic_cas(int *ptr, int expected, int desired) {
    int result;
    asm volatile("lock cmpxchgl %2, %1"
                 : "=a" (result), "+m" (*ptr)
                 : "r" (desired), "0" (expected)
                 : "cc", "memory"
    );
    return result;
}
```

### 16.14.4 Memory Copy with REP MOVSB

```c
void fast_memcpy(void *dest, const void *src, size_t len) {
    asm volatile("rep movsb"
                 :
                 : "D" (dest), "S" (src), "c" (len)
                 : "memory"
    );
}
```

---

## 16.15 Summary and Key Takeaways

### 16.15.1 Key Takeaways

- Inline assembly is a precision tool — use it sparingly and only when necessary.
- Extended syntax with constraints is essential for correctness.
- Always declare clobbers — registers, flags, and memory.
- Use `volatile` to prevent unwanted optimizations.
- Prefer intrinsics for SIMD unless exact control is needed.
- Validate with compiler output and debuggers.
- Test thoroughly — inline assembly bugs are often subtle and timing-dependent.

> **“Inline assembly is the last resort of the performance engineer — not the first.”**  
> Profile first. Optimize algorithms and data structures first. Only then, if a hotspot remains, reach for inline assembly.

> **“The compiler does not fear your assembly — it ignores it. Teach it respect with constraints and clobbers.”**  
> Without proper metadata, the compiler assumes your assembly block is a no-op. Declare its effects explicitly.

---

## 16.16 Exercises

1. Write inline assembly to compute the population count (number of set bits) of a 64-bit integer using the `popcnt` instruction.
2. Implement a spinlock using `xchg` in inline assembly.
3. Write a function that reads the `xgetbv` instruction to check XCR0 register (for AVX support).
4. Use inline assembly to implement a 128-bit atomic compare-and-swap (using `cmpxchg16b`).
5. Write inline assembly to serialize execution (CPUID or MFENCE) and measure its overhead.
6. Implement a byte-swap (endian conversion) function using `bswap` instruction.
7. Use inline assembly to access the FS or GS segment base (for thread-local storage).
8. Write a function that triggers a breakpoint (`int3`) and catches it via a signal handler.
9. Optimize a matrix transposition using AVX inline assembly.
10. Write inline assembly that calls a C function pointer — handle stack alignment and register preservation.

---

## 16.17 Further Reading

- GCC Inline Assembly Documentation: https://gcc.gnu.org/onlinedocs/gcc/Extended-Asm.html
- Intel® 64 and IA-32 Architectures Software Developer’s Manual
- Agner Fog’s “Optimizing Subroutines in Assembly Language” (www.agner.org)
- “Computer Systems: A Programmer’s Perspective” by Bryant and O’Hallaron
- LLVM Inline Assembly Guide (for Clang): https://llvm.org/docs/LangRef.html#inline-asm-expressions
