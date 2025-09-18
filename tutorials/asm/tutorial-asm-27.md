# 27. RISC-V Assembly

## 27.1 Introduction to RISC-V Architecture and Assembly

RISC-V (pronounced “risk-five”) is an open, royalty-free instruction set architecture (ISA) that has rapidly emerged as a disruptive force in computing. Unlike proprietary ISAs such as x86 and ARM, RISC-V is developed collaboratively under open standards, enabling innovation without licensing barriers. From embedded microcontrollers and IoT devices to high-performance servers and academic research platforms, RISC-V’s modularity, simplicity, and extensibility make it ideal for education, industry, and experimentation.

> **“RISC-V is not just an architecture — it is a movement. It represents the democratization of computing: no gatekeepers, no royalties, no secrets.”**  
> RISC-V’s open specification allows anyone to implement, extend, and optimize the ISA — from universities building educational cores to corporations deploying datacenter-scale processors. Learning RISC-V is not just learning assembly — it is participating in the future of hardware-software co-design.

> **“If ARM is the architecture of efficiency and x86 the architecture of legacy, RISC-V is the architecture of freedom. Write once, run anywhere — without permission.”**  
> RISC-V’s clean, modular design makes it easier to learn than x86 and more transparent than ARM. Its lack of historical baggage allows for pedagogical clarity and industrial innovation — a rare combination in modern computing.

By the end of this chapter, you will understand:

- The RISC-V architecture: registers, instruction formats, privilege levels.
- RISC-V assembly syntax and toolchains (GNU as, LLVM, RARS).
- How to write, assemble, link, and debug RISC-V programs.
- The RISC-V calling convention (RV64G ABI).
- How to interface RISC-V assembly with C and other languages.
- How to handle exceptions, interrupts, and system calls.
- How to use RISC-V’s modular extensions: M (integer multiply/divide), A (atomic), F/D (floating-point), V (vector).
- How to optimize for RISC-V pipelines, caches, and branch predictors.
- How to write portable RISC-V assembly for embedded (RV32I) and application (RV64G) profiles.
- How to use inline assembly in C/C++ for RISC-V.
- How to debug RISC-V code with GDB, QEMU, Spike, and hardware debuggers.
- How to apply RISC-V assembly in real-world contexts: embedded, education, cloud, research.

---

## 27.2 RISC-V Architecture Overview

RISC-V is a load-store RISC architecture designed for simplicity, modularity, and extensibility. The base integer ISA (RV32I or RV64I) is minimal — just 40 instructions — with optional extensions for multiplication, atomics, floating-point, vectors, and more.

### 27.2.1 RISC-V Profiles

- **RV32I**: 32-bit base integer ISA.
- **RV64I**: 64-bit base integer ISA.
- **RV32G**: RV32I + M (multiply/divide) + A (atomics) + F (single-precision FP) + D (double-precision FP).
- **RV64G**: RV64I + M + A + F + D — the “general-purpose” profile.
- **RV64GC**: RV64G + C (compressed instructions) — common in Linux distributions.

This chapter focuses on **RV64GC** — the standard for application processors — with notes on RV32I for embedded systems.

### 27.2.2 Registers

RISC-V provides:

- 32 general-purpose registers: `x0`–`x31` (also named `zero`, `ra`, `sp`, `gp`, `tp`, `t0`–`t6`, `s0`–`s11`, `a0`–`a7`).
- `pc` (program counter — not directly accessible).
- Optional floating-point registers: `f0`–`f31` (if F/D extensions present).
- Optional vector registers: `v0`–`v31` (if V extension present).

Register aliases:

| **Register** | **ABI Name** | **Description**               |
| :---         | :---         | :---                          |
| **x0**       | `zero`       | Hardwired to 0                |
| **x1**       | `ra`         | Return address                |
| **x2**       | `sp`         | Stack pointer                 |
| **x3**       | `gp`         | Global pointer                |
| **x4**       | `tp`         | Thread pointer                |
| **x5–7**     | `t0–t2`      | Temporary registers           |
| **x8**       | `s0`/`fp`    | Saved register / frame pointer|
| **x9**       | `s1`         | Saved register                |
| **x10–11**   | `a0–a1`      | Argument/return registers     |
| **x12–17**   | `a2–a7`      | Argument registers            |
| **x18–27**   | `s2–s11`     | Saved registers               |
| **x28–31**   | `t3–t6`      | Temporary registers           |

### 27.2.3 Instruction Formats

RISC-V instructions are 32 bits (except compressed 16-bit instructions in C extension). Five base formats:

- **R-type**: Register-register operations (e.g., `add`, `sub`).
- **I-type**: Immediate to register (e `addi`, `lw`).
- **S-type**: Store (e.g., `sw`).
- **B-type**: Branch (e.g., `beq`, `bne`).
- **U-type**: Upper immediate (e.g., `lui`, `auipc`).
- **J-type**: Jump (e.g., `jal`).

Example:

```riscv
add x1, x2, x3      # R-type: x1 = x2 + x3
addi x4, x5, 10     # I-type: x4 = x5 + 10
lw x6, 0(x7)        # I-type: x6 = *(x7 + 0)
sw x8, 8(x9)        # S-type: *(x9 + 8) = x8
beq x10, x11, label # B-type: branch if x10 == x11
jal x12, label      # J-type: jump and link
lui x13, 0x12345    # U-type: x13 = 0x12345000
```

### 27.2.4 Privilege Levels

RISC-V defines three privilege levels:

- **M-mode (Machine)**: Highest privilege — firmware, bootloaders.
- **S-mode (Supervisor)**: Operating system kernel.
- **U-mode (User)**: Applications.

Each mode has its own CSRs (Control and Status Registers) and exception handling.

---

## 27.3 RISC-V Assembly Syntax and Toolchains

RISC-V assembly can be written for multiple assemblers: GNU `as`, LLVM `llc`, RARS (educational), and vendor-specific tools.

### 27.3.1 GNU as (RV64GC) Syntax

```riscv
.section .text
.global _start

_start:
    # Print "Hello, RISC-V!"
    li a7, 64           # sys_write
    li a0, 1            # stdout
    la a1, message      # load address
    li a2, len          # length
    ecall               # system call

    # Exit
    li a7, 93           # sys_exit
    li a0, 0
    ecall

.section .data
message: .string "Hello, RISC-V!\n"
len = . - message
```

Assemble and link:

```bash
riscv64-unknown-elf-as -o hello.o hello.s
riscv64-unknown-elf-ld -o hello hello.o
```

### 27.3.2 Directives

Common GNU as directives:

- `.section .text` / `.section .data`
- `.global _start`
- `.string`, `.byte`, `.word`, `.dword`
- `.align 3` — align to 8 bytes (2^3)

### 27.3.3 Comments

GNU as: `#`  
RARS: `#` or `//`

---

## 27.4 The RISC-V Calling Convention (RV64G ABI)

The RISC-V ABI defines how functions pass parameters, return values, and preserve registers.

### 27.4.1 Parameter Passing

- Integer/pointer arguments: `a0`–`a7` (`x10`–`x17`).
- Return values: `a0`/`a1` (`x10`/`x11`).
- Additional arguments passed on stack (16-byte aligned).
- Floating-point arguments: `fa0`–`fa7` (`f10`–`f17`) if F/D extension.

### 27.4.2 Register Usage

- **Caller-saved (volatile)**: `t0`–`t6` (`x5`–`x7`, `x28`–`x31`), `a0`–`a7` (`x10`–`x17`).
- **Callee-saved (non-volatile)**: `s0`–`s11` (`x8`–`x9`, `x18`–`x27`), `sp` (`x2`).
- `ra` (`x1`) must be preserved if function calls other functions.

### 27.4.3 Stack Frame

```riscv
my_function:
    addi sp, sp, -32    # allocate 32 bytes
    sd ra, 0(sp)        # save return address
    sd s0, 8(sp)        # save s0
    addi s0, sp, 32     # set frame pointer (optional)

    # ... function body ...

    ld ra, 0(sp)        # restore return address
    ld s0, 8(sp)        # restore s0
    addi sp, sp, 32     # deallocate
    jr ra               # return
```

`sd` = store doubleword (64-bit), `ld` = load doubleword.

---

## 27.5 Writing RISC-V Assembly Programs

### 27.5.1 Hello World (Linux RV64GC)

```riscv
.section .text
.global _start

_start:
    # write(1, msg, len)
    li a7, 64           # sys_write
    li a0, 1            # fd
    la a1, message
    li a2, len
    ecall

    # exit(0)
    li a7, 93           # sys_exit
    li a0, 0
    ecall

.section .data
message: .string "Hello, RISC-V!\n"
len = . - message
```

### 27.5.2 Function with Parameters

```riscv
# int add(int a, int b) { return a + b; }
.global add
add:
    add a0, a0, a1      # a0 = a0 + a1
    ret                 # alias for jr ra
```

C declaration:

```c
int add(int a, int b);
```

### 27.5.3 Loop Example

```riscv
# long sum_to_n(long n) { long sum = 0; for (long i = 1; i <= n; i++) sum += i; return sum; }
.global sum_to_n
sum_to_n:
    # a0 = n, return sum in a0
    bgez a0, .start     # if n < 0, skip
    li a0, 0
    ret

.start:
    li t0, 0            # sum = 0
    li t1, 1            # i = 1

.loop:
    bgt t1, a0, .done   # if i > n, break
    add t0, t0, t1      # sum += i
    addi t1, t1, 1      # i++
    j .loop

.done:
    mv a0, t0           # return sum
    ret
```

---

## 27.6 Interfacing RISC-V Assembly with C

RISC-V assembly integrates seamlessly with C via the RV64G ABI.

### 27.6.1 Calling Assembly from C

C:

```c
// add.h
#ifndef ADD_H
#define ADD_H
int asm_add(int a, int b);
#endif
```

Assembly (`add.s`):

```riscv
.global asm_add
asm_add:
    add a0, a0, a1
    ret
```

Compile:

```bash
riscv64-unknown-elf-gcc -c main.c -o main.o
riscv64-unknown-elf-gcc main.o add.o -o program
```

### 27.6.2 Calling C from Assembly

Assembly:

```riscv
.extern printf
.global _start

_start:
    addi sp, sp, -16
    sd ra, 0(sp)

    la a0, fmt
    li a1, 42
    call printf         # alias for jal ra, printf

    ld ra, 0(sp)
    addi sp, sp, 16

    li a7, 93
    li a0, 0
    ecall

.section .data
fmt: .string "The answer is %d\n"
```

Note: `.string` = null-terminated string.

---

## 27.7 Exception Handling and Interrupts

RISC-V uses a unified trap mechanism for exceptions and interrupts.

### 27.7.1 Trap Handling

- Traps vector to `mtvec` (M-mode) or `stvec` (S-mode).
- Trap cause in `mcause`/`scause`.
- Trap value (e.g., faulting address) in `mtval`/`stval`.

### 27.7.2 System Calls (Linux)

Use `ecall` — syscall number in `a7`, arguments in `a0`–`a6`.

```riscv
# write syscall
li a7, 64           # __NR_write
li a0, 1            # fd
la a1, msg
li a2, len
ecall
```

### 27.7.3 Interrupt Vectors

Example M-mode vector table:

```riscv
.section .text
.global _start
_start:
    # Set trap vector
    la t0, trap_handler
    csrw mtvec, t0

    # Enable interrupts
    li t0, 0x8          # MIE (machine interrupt enable)
    csrs mie, t0
    li t0, 0x8          # MPIE (machine previous interrupt enable)
    csrs mstatus, t0

    # ... main code ...

trap_handler:
    # Save context
    addi sp, sp, -32
    sd ra, 0(sp)
    sd t0, 8(sp)

    # Check cause
    csrr t0, mcause
    andi t0, t0, 0xF    # mask to 4 bits
    beqz t0, .syscall   # if 0, syscall

    # Handle interrupt or exception
    # ...

.syscall:
    # Handle syscall
    # ...

    # Restore and return
    ld t0, 8(sp)
    ld ra, 0(sp)
    addi sp, sp, 32
    mret                # return from M-mode trap
```

---

## 27.8 RISC-V Extensions: M, A, F, D, V

RISC-V’s power lies in its modular extensions.

### 27.8.1 M Extension (Integer Multiply/Divide)

```riscv
# Multiply and divide
.global mul_div
mul_div:
    mul a0, a0, a1      # a0 = a0 * a1
    div a1, a2, a3      # a1 = a2 / a3
    rem a2, a4, a5      # a2 = a4 % a5
    ret
```

### 27.8.2 A Extension (Atomics)

Atomic memory operations — essential for concurrency.

```riscv
# Atomic increment
.global atomic_inc
atomic_inc:
    # a0 = pointer to value
    li t0, 1
1:  lr.w t1, (a0)       # load reserved
    add t1, t1, t0
    sc.w t2, t1, (a0)   # store conditional
    bnez t2, 1b         # retry if failed
    mv a0, t1           # return new value
    ret
```

### 27.8.3 F/D Extension (Floating-Point)

Single-precision (F) and double-precision (D) floating-point.

```riscv
# double add_double(double a, double b) { return a + b; }
.global add_double
add_double:
    fadd.d fa0, fa0, fa1  # fa0 = fa0 + fa1
    ret
```

### 27.8.4 V Extension (Vector)

Scalable vector operations (draft as of 2024).

```riscv
# Vector add (conceptual — syntax may vary)
.global vec_add
vec_add:
    vsetvli t0, a2, e64, m8  # set vector length
    vle64.v v0, (a0)         # load vector a
    vle64.v v1, (a1)         # load vector b
    vadd.vv v2, v0, v1       # v2 = v0 + v1
    vse64.v v2, (a3)         # store result
    ret
```

---

## 27.9 Inline Assembly in C for RISC-V

GCC and Clang support inline assembly for RISC-V.

### 27.9.1 Basic Syntax

```c
int add_inline(int a, int b) {
    int result;
    asm("add %0, %1, %2"
        : "=r" (result)
        : "r" (a), "r" (b)
    );
    return result;
}
```

### 27.9.2 Atomic Inline Assembly

```c
int atomic_add(int *ptr, int value) {
    int result;
    asm volatile(
        "amoadd.w %0, %2, (%1)"
        : "=r" (result)
        : "r" (ptr), "r" (value)
        : "memory"
    );
    return result;
}
```

`amoadd.w` = atomic add word.

---

## 27.10 Debugging RISC-V Assembly

### 27.10.1 GDB for RISC-V

Debug natively on RISC-V or via QEMU.

```bash
riscv64-unknown-elf-gdb ./program
(gdb) break *_start
(gdb) stepi
(gdb) info registers
(gdb) x/10i $pc
```

### 27.10.2 QEMU Emulation

Emulate RISC-V on x86-64.

```bash
qemu-riscv64 -g 1234 ./program &
riscv64-unknown-elf-gdb ./program
(gdb) target remote :1234
```

### 27.10.3 Spike Simulator

Spike is the reference RISC-V simulator.

```bash
spike --gdb-port=1234 pk ./program &
riscv64-unknown-elf-gdb ./program
(gdb) target remote :1234
```

### 27.10.4 Hardware Debugging (JTAG)

Use OpenOCD with RISC-V targets.

```bash
openocd -f interface/jlink.cfg -f target/riscv.cfg
```

GDB:

```gdb
(gdb) target remote :3333
```

---

## 27.11 Differences Between RV32I and RV64I

### 27.11.1 Registers and Instructions

- RV32I: 32-bit registers, 32-bit addresses.
- RV64I: 64-bit registers, 64-bit addresses — but can operate on 32-bit values.

### 27.11.2 Instruction Suffixes

- RV32I: `lw` (load word), `sw` (store word).
- RV64I: `lw` (load 32-bit, sign-extend), `ld` (load doubleword), `sd` (store doubleword).

Example: RV32I function.

```riscv
# RV32I
.global add
add:
    add a0, a0, a1
    ret
```

RV64I version is identical — but can handle 64-bit values.

### 27.11.3 Calling Convention

Same ABI — but pointers are 4 bytes (RV32I) vs. 8 bytes (RV64I).

---

## 27.12 RISC-V for Embedded Systems (RV32I)

RV32I is ideal for microcontrollers — minimal, no MMU.

### 27.12.1 Example: Blink LED on RV32I

```riscv
# RV32I — assume memory-mapped LED at 0x10000000
.section .text
.global _start
_start:
    li t0, 0x10000000   # LED address
    li t1, 1             # LED on

loop:
    sw t1, 0(t0)         # turn LED on
    call delay
    sw zero, 0(t0)       # turn LED off
    call delay
    j loop

delay:
    li t2, 0x100000
delay_loop:
    addi t2, t2, -1
    bnez t2, delay_loop
    ret
```

### 27.12.2 Interrupts on RV32I

Similar to RV64 — use `mtvec`, `mcause`.

---

## 27.13 Optimization Techniques for RISC-V

### 27.13.1 Pipeline and Branch Prediction

Minimize branches with conditional moves (via `slt` + `bnez`).

```riscv
# Conditional move: x1 = (x2 < x3) ? x4 : x5
slt t0, x2, x3        # t0 = 1 if x2 < x3, else 0
bnez t0, .true
    mv x1, x5
    j .done
.true:
    mv x1, x4
.done:
```

### 27.13.2 Cache Optimization

Use aligned accesses and prefetch (if supported).

```riscv
# Aligned load
ld x1, 0(x2)          # 64-bit aligned
```

### 27.13.3 Vectorization with V Extension

```riscv
# Vector add (when V extension stable)
vsetvli t0, a2, e64   # set vector length
vle64.v v0, (a0)      # load a
vle64.v v1, (a1)      # load b
vadd.vv v2, v0, v1    # add
vse64.v v2, (a3)      # store
```

---

## 27.14 Porting x86 or ARM Assembly to RISC-V

### 27.14.1 Register Mapping

| **x86-64** | **ARM64** | **RISC-V RV64G** | **Notes**                     |
| :---       | :---      | :---             | :---                          |
| **RAX**    | **X0**    | **a0**           | Return value, first arg       |
| **RDI**    | **X0**    | **a0**           | First arg (System V)          |
| **RSI**    | **X1**    | **a1**           | Second arg                    |
| **RDX**    | **X2**    | **a2**           | Third arg                     |
| **RCX**    | **X3**    | **a3**           | Fourth arg                    |
| **R8**     | **X4**    | **a4**           | Fifth arg                     |
| **R9**     | **X5**    | **a5**           | Sixth arg                     |
| **RSP**    | **SP**    | **sp**           | Stack pointer                 |
| **RBP**    | **X29**   | **s0/fp**        | Frame pointer                 |
| **RIP**    | **PC**    | **pc**           | Not directly accessible       |

### 27.14.2 Stack Management

x86-64:

```x86asm
push rbp
mov rbp, rsp
sub rsp, 32
; ...
mov rsp, rbp
pop rbp
ret
```

RISC-V:

```riscv
addi sp, sp, -32
sd ra, 0(sp)
sd s0, 8(sp)
addi s0, sp, 32
; ...
ld ra, 0(sp)
ld s0, 8(sp)
addi sp, sp, 32
jr ra
```

### 27.14.3 Example: Porting a Function

x86-64:

```x86asm
global add
add:
    mov rax, rdi
    add rax, rsi
    ret
```

RISC-V:

```riscv
.global add
add:
    add a0, a0, a1
    ret
```

---

## 27.15 Toolchains and Build Systems

### 27.15.1 Cross-Compilation

Install RISC-V GCC:

```bash
sudo apt install gcc-riscv64-linux-gnu
```

Compile:

```bash
riscv64-linux-gnu-gcc -c program.s -o program.o
riscv64-linux-gnu-ld -o program program.o
```

### 27.15.2 CMake for RISC-V

```cmake
set(CMAKE_SYSTEM_PROCESSOR riscv64)
set(CMAKE_C_COMPILER riscv64-linux-gnu-gcc)
set(CMAKE_ASM_COMPILER riscv64-linux-gnu-as)
```

### 27.15.3 Makefile

```makefile
CC = riscv64-linux-gnu-gcc
AS = riscv64-linux-gnu-as
LD = riscv64-linux-gnu-ld

%.o: %.s
	$(AS) -o $@ $<

program: main.o add.o
	$(LD) -o $@ $^

.PHONY: clean
clean:
	rm -f *.o program
```

---

## 27.16 Real-World Applications

### 27.16.1 Embedded (SiFive, ESP32-C3)

- SiFive HiFive boards — perfect for learning.
- ESP32-C3 — Wi-Fi/BLE microcontroller with RV32I.

### 27.16.2 Education (RARS, Venus)

- RARS (RISC-V Assembler and Runtime Simulator) — educational tool.
- Venus — online RISC-V simulator.

### 27.16.3 Server (AWS Graviton-like, Alibaba)

- Alibaba’s Xuantie 910 — high-performance RISC-V core.
- Cloud servers emerging (e.g., Scaleway).

### 27.16.4 Research and Custom Cores

- FPGA-based RISC-V cores (e.g., VexRiscv, Rocket Chip).
- Academic research in computer architecture.

---

## 27.17 Best Practices and Pitfalls

### 27.17.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Use RV64G ABI Conventions** | Follow parameter passing and register preservation rules.                       |
| **Align Stack to 16 Bytes**   | Required before function calls in Linux ABI.                                    |
| **Save RA and S-registers**   | Preserve `ra`, `s0`–`s11` in functions that call other functions.               |
| **Use Compressed Instructions**| If targeting RV64GC, use C extension for code density.                          |
| **Leverage Extensions**       | Use M, A, F, D, V extensions for performance and functionality.                 |
| **Test on Target or Emulator**| QEMU, Spike, or hardware — emulators may not catch all timing issues.           |
| **Document Assumptions**      | Specify which extensions (M, A, F, etc.) your code requires.                    |

### 27.17.2 Common Pitfalls

- **Stack Misalignment**: Causes crashes or undefined behavior in Linux.
- **Forgetting to Save RA**: `ret` returns to wrong address.
- **Ignoring Extension Requirements**: Code using `mul` fails on RV32I without M extension.
- **Incorrect Vector Setup**: V extension requires `vsetvli` before vector ops.
- **Porting x86/ARM Assumptions**: RISC-V has no flags register — use comparisons + branches.

> **“RISC-V’s simplicity is its superpower — but also its responsibility. Every instruction is explicit, every convention documented. There are no hidden registers, no legacy quirks — only clarity.”**  
> This clarity demands discipline. You cannot rely on the processor to “figure it out.” You must be precise — in register usage, stack alignment, and extension requirements.

> **“The RISC-V programmer is an architect, not just a coder. With great openness comes great responsibility — to design, to document, to share.”**  
> RISC-V thrives on collaboration. Write code that others can understand, extend, and improve. Comment your assembly, document your dependencies, and contribute back to the community.

---

## 27.18 Exercises

1. Write a RISC-V assembly program that prints “Hello, World!” using system calls.
2. Implement a function to compute Fibonacci numbers in RISC-V assembly and call it from C.
3. Write a loop that finds the maximum value in an array using RISC-V assembly.
4. Use the M extension to implement 64-bit multiplication in RISC-V.
5. Port an x86-64 or ARM64 assembly function (e.g., string copy) to RISC-V.
6. Write a RISC-V assembly program that blinks an LED (simulate with QEMU or Spike).
7. Use inline assembly in C to perform an atomic compare-and-swap on RISC-V.
8. Debug a RISC-V assembly program using GDB and QEMU.
9. Write a function that uses the F extension to compute the square root of a float.
10. Build a mixed C/RISC-V assembly project using CMake and cross-compilation.

---

## 27.19 Further Reading

- RISC-V Specifications: https://riscv.org/technical/specifications/
- “The RISC-V Reader” by David Patterson and Andrew Waterman.
- GNU Assembler Manual: https://sourceware.org/binutils/docs/as/RISC_002dV_002dDependent.html
- RARS: https://github.com/TheThirdOne/rars
- Spike: https://github.com/riscv-software-src/riscv-isa-sim
- “Computer Organization and Design RISC-V Edition” by Patterson and Hennessy.
