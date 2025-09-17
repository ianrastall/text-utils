# 26. ARM Assembly

## 26.1 Introduction to ARM Architecture and Assembly

ARM (Advanced RISC Machine) architecture has become the dominant force in mobile, embedded, and increasingly server and desktop computing. From smartphones and tablets to IoT devices, automotive systems, and cloud servers, ARM’s power efficiency, scalability, and licensing model have propelled it to ubiquity. Unlike x86’s complex instruction set and legacy baggage, ARM offers a clean, orthogonal, load-store RISC architecture — making it an ideal platform for learning assembly language fundamentals while remaining highly relevant in modern systems.

> **“ARM is not ‘just another architecture’ — it is the architecture of the future. Master it, and you master the devices that shape our world.”**  
> ARM’s RISC philosophy — simple, regular instructions, load-store architecture, and uniform register file — makes it easier to learn than x86, yet powerful enough for the most demanding applications. Its dominance in mobile and embedded ensures that ARM skills are not niche — they are fundamental.

> **“Learning ARM after x86 is like learning to fly after driving. The rules are different, the view is better, and the efficiency is astonishing.”**  
> ARM’s elegance lies in its consistency: three-operand instructions, conditional execution, and a clean pipeline model. Once mastered, ARM assembly feels intuitive — a stark contrast to x86’s historical quirks.

By the end of this chapter, you will understand:

- The ARM architecture: registers, instruction set, memory model.
- ARM assembly syntax and directives (GNU as, ARMASM, LLVM).
- How to write, assemble, link, and debug ARM assembly programs.
- How to use the ARM Procedure Call Standard (AAPCS).
- How to interface ARM assembly with C and other languages.
- How to handle exceptions, interrupts, and system calls.
- How to optimize for ARM microarchitectures: pipelines, caches, NEON.
- How to write portable ARM assembly for Cortex-A, Cortex-R, Cortex-M.
- How to use inline assembly in C/C++ for ARM.
- How to debug ARM code with GDB, QEMU, and hardware debuggers.
- How to apply ARM assembly in real-world contexts: embedded, mobile, server.

---

## 26.2 ARM Architecture Overview

ARM is a family of RISC architectures developed by ARM Holdings (now part of NVIDIA). It is licensed to hundreds of companies, including Apple, Qualcomm, Samsung, and Amazon.

### 26.2.1 ARM Processor Families

- **Cortex-A**: Application processors (smartphones, tablets, servers) — supports ARMv7-A, ARMv8-A (AArch64).
- **Cortex-R**: Real-time processors (automotive, industrial) — ARMv7-R.
- **Cortex-M**: Microcontrollers (IoT, sensors) — ARMv6-M, ARMv7-M, ARMv8-M.

This chapter focuses on **ARMv8-A AArch64** (64-bit) — the modern standard for application processors — with notes on differences for 32-bit (AArch32) and embedded variants.

### 26.2.2 Registers

ARMv8-A AArch64 provides:

- 31 general-purpose 64-bit registers: `X0`–`X30`.
- `SP` (stack pointer), `PC` (program counter — not directly accessible).
- 32 × 128-bit SIMD/FP registers: `V0`–`V31`.
- Special registers: `NZCV` (flags), `ELR_ELx`, `SPSR_ELx` (exception handling).

Register naming:

- `Xn`: 64-bit general-purpose register.
- `Wn`: 32-bit view of `Xn` (lower 32 bits; writing zero-extends to 64-bit).
- `Vn`: 128-bit SIMD/FP register.
- `Bn`, `Hn`, `Sn`, `Dn`: 8-, 16-, 32-, 64-bit views of `Vn`.

Example:

```armasm
mov x0, #0xFFFFFFFFFFFFFFFF   ; X0 = 0xFFFFFFFFFFFFFFFF
mov w1, #0xFFFFFFFF           ; W1 = 0xFFFFFFFF, X1 = 0x00000000FFFFFFFF
```

### 26.2.3 Instruction Set Philosophy

ARM is a load-store architecture:

- Only `LDR`/`STR` instructions access memory.
- All other instructions operate on registers.
- Three-operand format: `op dest, src1, src2`.

Example:

```armasm
add x0, x1, x2    ; x0 = x1 + x2
ldr x3, [x4]      ; x3 = *x4
str x5, [x6]      ; *x6 = x5
```

### 26.2.4 Conditional Execution and Flags

ARM instructions can be conditionally executed using condition codes — a unique feature.

Flags (`NZCV`):

- **N**: Negative (result < 0)
- **Z**: Zero (result == 0)
- **C**: Carry (unsigned overflow)
- **V**: Overflow (signed overflow)

Conditional suffixes:

```armasm
cmp x0, x1        ; compare x0 and x1 — sets flags
add eq x2, x3, x4 ; if equal, x2 = x3 + x4
mov ne x5, #0     ; if not equal, x5 = 0
```

Common conditions:

| **Suffix** | **Condition**              | **Flags**         |
| :---       | :---                       | :---              |
| **EQ**     | Equal                      | Z == 1            |
| **NE**     | Not equal                  | Z == 0            |
| **CS/HS**  | Carry set / unsigned ≥     | C == 1            |
| **CC/LO**  | Carry clear / unsigned <   | C == 0            |
| **MI**     | Negative                   | N == 1            |
| **PL**     | Positive or zero           | N == 0            |
| **VS**     | Overflow                   | V == 1            |
| **VC**     | No overflow                | V == 0            |
| **HI**     | Unsigned >                 | C == 1 and Z == 0 |
| **LS**     | Unsigned ≤                 | C == 0 or Z == 1  |
| **GE**     | Signed ≥                   | N == V            |
| **LT**     | Signed <                   | N != V            |
| **GT**     | Signed >                   | Z == 0 and N == V |
| **LE**     | Signed ≤                   | Z == 1 or N != V  |

---

## 26.3 ARM Assembly Syntax and Toolchains

ARM assembly can be written for multiple assemblers: GNU `as` (default on Linux), ARMASM (ARM’s proprietary tool), LLVM `llc`.

### 26.3.1 GNU as (AArch64) Syntax

```armasm
.section .text
.global _start

_start:
    mov x0, #1          // immediate
    ldr x1, =msg        // load address
    bl print            // branch with link (call)
    mov x8, #93         // sys_exit (Linux)
    svc #0              // system call

print:
    // x0 = fd, x1 = buffer, x2 = len
    mov x8, #64         // sys_write
    svc #0
    ret

.section .data
msg: .ascii "Hello, ARM64!\n"
```

Assemble and link:

```bash
as -o hello.o hello.s
ld -o hello hello.o
```

### 26.3.2 Directives

Common GNU as directives:

- `.section .text` / `.section .data`
- `.global _start`
- `.ascii`, `.byte`, `.word`, `.quad`
- `.align 4` — align to 16 bytes (2^4)

### 26.3.3 Comments

GNU as: `//` or `@`  
ARMASM: `;`

---

## 26.4 The ARM Procedure Call Standard (AAPCS64)

AAPCS64 defines calling conventions for AArch64.

### 26.4.1 Parameter Passing

- Integer/pointer arguments: `X0`–`X7`.
- Floating-point/ SIMD: `V0`–`V7`.
- Additional arguments passed on stack (16-byte aligned).
- Return values: `X0`/`X1` (integer), `V0`/`V1` (float/SIMD).

### 26.4.2 Register Usage

- **Caller-saved (volatile)**: `X0`–`X18`, `V0`–`V7`, `V16`–`V31`.
- **Callee-saved (non-volatile)**: `X19`–`X29`, `V8`–`V15`.
- `X29`: Frame pointer (FP).
- `X30`: Link register (LR) — return address.
- `SP`: Stack pointer — must be 16-byte aligned.

### 26.4.3 Stack Frame

```armasm
my_function:
    stp x29, x30, [sp, #-16]!   // save FP, LR; pre-decrement SP by 16
    mov x29, sp                  // set FP

    // ... function body ...

    ldp x29, x30, [sp], #16     // restore FP, LR; post-increment SP by 16
    ret
```

`stp` = store pair, `ldp` = load pair — efficient for saving/restoring register pairs.

---

## 26.5 Writing ARM Assembly Programs

### 26.5.1 Hello World (Linux AArch64)

```armasm
.section .text
.global _start

_start:
    // write(1, msg, len)
    mov x0, #1
    ldr x1, =message
    mov x2, #len
    mov x8, #64         // sys_write
    svc #0

    // exit(0)
    mov x0, #0
    mov x8, #93         // sys_exit
    svc #0

.section .data
message: .ascii "Hello, ARM64!\n"
len = . - message
```

### 26.5.2 Function with Parameters

```armasm
// int add(int a, int b) { return a + b; }
.global add
add:
    add w0, w0, w1      // w0 = w0 + w1 (32-bit)
    ret                 // return via x30
```

C declaration:

```c
int add(int a, int b);
```

### 26.5.3 Loop Example

```armasm
// Sum integers from 1 to n
.global sum_to_n
sum_to_n:
    // x0 = n, return sum in x0
    cmp x0, #0
    b.le .done
    mov x1, #0          // sum = 0
    mov x2, #1          // i = 1

.loop:
    add x1, x1, x2      // sum += i
    add x2, x2, #1      // i++
    cmp x2, x0
    b.le .loop

.done:
    mov x0, x1
    ret
```

---

## 26.6 Interfacing ARM Assembly with C

ARM assembly integrates seamlessly with C via AAPCS64.

### 26.6.1 Calling Assembly from C

C:

```c
// add.h
#ifndef ADD_H
#define ADD_H
int asm_add(int a, int b);
#endif
```

Assembly (`add.s`):

```armasm
.global asm_add
asm_add:
    add w0, w0, w1
    ret
```

Compile:

```bash
as -o add.o add.s
gcc -c main.c -o main.o
gcc main.o add.o -o program
```

### 26.6.2 Calling C from Assembly

Assembly:

```armasm
.extern printf
.global _start

_start:
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    ldr x0, =fmt
    mov x1, #42
    bl printf

    ldp x29, x30, [sp], #16
    mov x8, #93
    mov x0, #0
    svc #0

.section .data
fmt: .asciz "The answer is %d\n"
```

Note: `.asciz` = null-terminated string.

---

## 26.7 Exception Handling and Interrupts

ARM uses Exception Levels (EL0–EL3) for privilege separation.

### 26.7.1 Synchronous Exceptions (Traps)

- System calls (`svc`), undefined instructions, data aborts.

### 26.7.2 Interrupts

- IRQ (Interrupt Request), FIQ (Fast Interrupt Request).

### 26.7.3 Exception Vectors

Defined in vector table — typically at `0xFFFF_FFFF_FFFF_0000` or configured via `VBAR_ELx`.

Example vector table entry (EL1):

```armasm
.section .vectors, "ax"
.align 11             // 2048-byte alignment

vector_table:
    b sync_handler    // Synchronous EL1
    b irq_handler     // IRQ EL1
    b fiq_handler     // FIQ EL1
    b serr_handler    // SError EL1
    // ... repeat for other levels ...

sync_handler:
    // Save state
    stp x0, x1, [sp, #-16]!
    // ... handle exception ...
    ldp x0, x1, [sp], #16
    eret              // return from exception
```

### 26.7.4 System Calls (Linux)

Use `svc #0` — syscall number in `X8`.

```armasm
// write syscall
mov x0, #1          // fd
ldr x1, =msg
mov x2, #len
mov x8, #64         // __NR_write
svc #0
```

---

## 26.8 ARM SIMD and Floating-Point: NEON and SVE

ARM provides powerful SIMD extensions.

### 26.8.1 NEON (Advanced SIMD)

128-bit registers `V0`–`V31`, support for integers and floats.

Example: Vector addition.

```armasm
.global add_vectors
add_vectors:
    // x0 = ptr to a, x1 = ptr to b, x2 = ptr to result
    ld1 {v0.4s}, [x0]   // load 4 singles from a
    ld1 {v1.4s}, [x1]   // load 4 singles from b
    fadd v2.4s, v0.4s, v1.4s  // v2 = v0 + v1
    st1 {v2.4s}, [x2]   // store result
    ret
```

### 26.8.2 Scalable Vector Extension (SVE)

Variable-length vectors (128–2048 bits).

```armasm
.global sve_add
sve_add:
    // z0, z1, z2 are scalable vectors
    ld1w z0.s, p0/z, [x0]  // load with predicate
    ld1w z1.s, p0/z, [x1]
    add z2.s, z0.s, z1.s
    st1w z2.s, p0, [x2]
    ret
```

---

## 26.9 Inline Assembly in C for ARM

GCC and Clang support inline assembly for ARM.

### 26.9.1 Basic Syntax

```c
int add_inline(int a, int b) {
    int result;
    asm("add %w0, %w1, %w2"
        : "=r" (result)
        : "r" (a), "r" (b)
    );
    return result;
}
```

`%w0` = 32-bit view of register 0.

### 26.9.2 NEON Inline Assembly

```c
void add_vectors_inline(float *a, float *b, float *result) {
    asm("ld1 {v0.4s}, [%0]\n\t"
        "ld1 {v1.4s}, [%1]\n\t"
        "fadd v2.4s, v0.4s, v1.4s\n\t"
        "st1 {v2.4s}, [%2]"
        :
        : "r" (a), "r" (b), "r" (result)
        : "v0", "v1", "v2", "memory"
    );
}
```

---

## 26.10 Debugging ARM Assembly

### 26.10.1 GDB for ARM

Debug natively on ARM or via QEMU.

```bash
gdb ./program
(gdb) break *main
(gdb) stepi
(gdb) info registers
(gdb) x/10i $pc
```

### 26.10.2 QEMU Emulation

Emulate AArch64 on x86-64.

```bash
qemu-aarch64 -g 1234 ./program &
gdb ./program
(gdb) target remote :1234
```

### 26.10.3 Hardware Debugging (JTAG)

Use OpenOCD with JTAG probes.

```bash
openocd -f interface/jlink.cfg -f target/aarch64.cfg
```

GDB:

```gdb
(gdb) target remote :3333
```

---

## 26.11 Differences Between ARMv7 (AArch32) and ARMv8 (AArch64)

### 26.11.1 Registers

- AArch32: 16 × 32-bit registers (`R0`–`R15`), `CPSR`.
- AArch64: 31 × 64-bit registers (`X0`–`X30`), `NZCV`.

### 26.11.2 Instruction Set

- AArch32: Thumb, Thumb-2, conditional execution on all instructions.
- AArch64: No Thumb, conditional execution only on branches and select instructions.

### 26.11.3 Calling Convention

- AArch32: AAPCS32 — args in `R0`–`R3`, stack for rest.
- AArch64: AAPCS64 — args in `X0`–`X7`.

Example: AArch32 function.

```armasm
@ AArch32
.global add
add:
    add r0, r0, r1
    bx lr
```

---

## 26.12 ARM for Embedded Systems (Cortex-M)

Cortex-M uses ARMv6-M/v7-M/v8-M — Thumb-only, no MMU.

### 26.12.1 Registers

- `R0`–`R12`, `SP`, `LR`, `PC`, `PSR`.
- No `X` registers — all 32-bit.

### 26.12.2 Interrupts

Vector table at address 0.

```armasm
.section .vectors
.word _start + 1        @ reset (thumb bit set)
.word nmi_handler + 1
.word hard_fault + 1
// ...

.section .text
.type hard_fault, %function
hard_fault:
    b .                 @ infinite loop
```

### 26.12.3 Example: Blink LED on Cortex-M

```armasm
@ Cortex-M3
.section .text
.global _start
_start:
    ldr r0, =0x40021018 @ RCC_AHB1ENR
    ldr r1, [r0]
    orr r1, #(1 << 5)   @ enable GPIOA
    str r1, [r0]

    ldr r0, =0x40020000 @ GPIOA_MODER
    ldr r1, [r0]
    bic r1, #(3 << 10)  @ clear PA5 mode
    orr r1, #(1 << 10)  @ set PA5 to output
    str r1, [r0]

loop:
    ldr r0, =0x40020018 @ GPIOA_ODR
    ldr r1, [r0]
    eor r1, #(1 << 5)   @ toggle PA5
    str r1, [r0]

    @ delay
    mov r2, #0x100000
delay:
    subs r2, #1
    bne delay

    b loop
```

---

## 26.13 Optimization Techniques for ARM

### 26.13.1 Pipeline and Branch Prediction

Avoid branches with conditional instructions.

```armasm
cmp x0, x1
csel x2, x3, x4, eq   // x2 = (x0 == x1) ? x3 : x4
```

### 26.13.2 Cache Optimization

Use prefetch and aligned accesses.

```armasm
prfm pldl1keep, [x0]  // prefetch
ldr x1, [x0, #64]     // aligned load
```

### 26.13.3 NEON for Data Parallelism

```armasm
// 4x float addition
fadd v0.4s, v1.4s, v2.4s
```

---

## 26.14 Porting x86 Assembly to ARM

### 26.14.1 Register Mapping

| **x86-64** | **AArch64** | **Notes**                     |
| :---       | :---        | :---                          |
| **RAX**    | **X0**      | Return value, first arg       |
| **RDI**    | **X0**      | First arg (System V)          |
| **RSI**    | **X1**      | Second arg                    |
| **RDX**    | **X2**      | Third arg                     |
| **RCX**    | **X3**      | Fourth arg                    |
| **R8**     | **X4**      | Fifth arg                     |
| **R9**     | **X5**      | Sixth arg                     |
| **RSP**    | **SP**      | Stack pointer                 |
| **RBP**    | **X29**     | Frame pointer                 |
| **RIP**    | **PC**      | Not directly accessible       |

### 26.14.2 Stack Management

x86:

```x86asm
push rbp
mov rbp, rsp
sub rsp, 32
; ...
mov rsp, rbp
pop rbp
ret
```

ARM:

```armasm
stp x29, x30, [sp, #-16]!
mov x29, sp
sub sp, sp, #32
; ...
add sp, sp, #32
ldp x29, x30, [sp], #16
ret
```

### 26.14.3 Example: Porting a Function

x86-64:

```x86asm
global add
add:
    mov rax, rdi
    add rax, rsi
    ret
```

ARM64:

```armasm
.global add
add:
    add x0, x0, x1
    ret
```

---

## 26.15 Toolchains and Build Systems

### 26.15.1 Cross-Compilation

Install cross-compiler:

```bash
sudo apt install gcc-aarch64-linux-gnu
```

Compile:

```bash
aarch64-linux-gnu-gcc -c program.s -o program.o
aarch64-linux-gnu-ld -o program program.o
```

### 26.15.2 CMake for ARM

```cmake
set(CMAKE_SYSTEM_PROCESSOR aarch64)
set(CMAKE_C_COMPILER aarch64-linux-gnu-gcc)
set(CMAKE_ASM_COMPILER aarch64-linux-gnu-as)
```

### 26.15.3 Makefile

```makefile
CC = aarch64-linux-gnu-gcc
AS = aarch64-linux-gnu-as
LD = aarch64-linux-gnu-ld

%.o: %.s
	$(AS) -o $@ $<

program: main.o add.o
	$(LD) -o $@ $^

.PHONY: clean
clean:
	rm -f *.o program
```

---

## 26.16 Real-World Applications

### 26.16.1 Mobile (Android, iOS)

- Android NDK supports ARM assembly.
- iOS apps on Apple Silicon (AArch64).

### 26.16.2 Embedded (Raspberry Pi, IoT)

- Raspberry Pi OS (AArch64) — perfect for learning.
- FreeRTOS on Cortex-M.

### 26.16.3 Server (AWS Graviton, Ampere)

- Cloud servers running Linux on ARM.
- Performance-critical services optimized with NEON.

---

## 26.17 Best Practices and Pitfalls

### 26.17.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Use AAPCS64 Conventions**   | Follow parameter passing and register preservation rules.                       |
| **Align Stack to 16 Bytes**   | Required before function calls.                                                 |
| **Prefer Conditional Instructions**| Reduce branches for better pipeline performance.                             |
| **Use NEON for Data Parallelism**| Leverage SIMD for image, audio, math operations.                              |
| **Save/Restore Non-Volatile Registers**| Preserve X19–X29, V8–V15 in functions.                                     |
| **Use `stp`/`ldp` for Efficiency**| Save/restore register pairs in one instruction.                               |
| **Test on Target Hardware**   | Emulators may not catch all timing or alignment issues.                         |

### 26.17.2 Common Pitfalls

- **Stack Misalignment**: Causes crashes or undefined behavior.
- **Ignoring Register Width**: Writing to `W0` vs. `X0`.
- **Forgetting to Save LR**: `ret` returns to wrong address.
- **Incorrect Vector Lengths**: NEON instructions assume 128-bit vectors.
- **Porting x86 Assumptions**: ARM has no `push`/`pop` — use `stp`/`ldp`.

> **“ARM’s simplicity is its strength — but also its trap. What seems obvious may hide subtle rules — stack alignment, register width, conditional execution.”**  
> Respect the architecture. Read the manual. Test thoroughly. ARM forgives nothing.

> **“The ARM programmer does not fight the pipeline — they dance with it. Conditional execution, paired loads, and prefetch are the steps of that dance.”**  
> Optimize not by brute force, but by harmony — with the processor, the memory system, and the compiler.

---

## 26.18 Exercises

1. Write an ARM64 assembly program that prints “Hello, World!” using system calls.
2. Implement a function to compute factorial in ARM assembly and call it from C.
3. Write a loop that sums an array of integers using ARM assembly.
4. Use NEON instructions to add two 4-element float arrays.
5. Port an x86-64 assembly function (e.g., string length) to ARM64.
6. Write a Cortex-M assembly program that blinks an LED (simulate with QEMU).
7. Use inline assembly in C to perform a 64-bit atomic add on ARM.
8. Debug an ARM assembly program using GDB and QEMU.
9. Write a function that uses conditional execution to return the maximum of two integers.
10. Build a mixed C/ARM assembly project using CMake and cross-compilation.

---

## 26.19 Further Reading

- ARM Architecture Reference Manual (ARMv8-A).
- “ARM Assembly Language Programming” by Peter Knaggs.
- GNU Assembler Manual: https://sourceware.org/binutils/docs/as/ARM_002dDependent.html
- ARM NEON Programmer’s Guide.
- Raspberry Pi Assembly Language Programming (by Bruce Smith).
- “Computer Organization and Design” by Patterson and Hennessy (ARM edition).
