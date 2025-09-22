# 25. x86 vs. x64 Migration and Compatibility Considerations

## 25.1 Introduction to x86 and x64 Architectures

The transition from 32-bit x86 to 64-bit x64 (also known as x86-64, AMD64, or Intel 64) represents one of the most significant evolutions in modern computing architecture. While x86 dominated the computing landscape for decades, the limitations of 32-bit addressing, register width, and performance scalability necessitated a migration to 64-bit. This migration was not a clean break — it was an evolutionary extension designed for backward compatibility, allowing 32-bit applications to run unmodified on 64-bit systems.

> **“x64 is not a replacement for x86 — it is its evolutionary successor. The transition is not a revolution, but a carefully engineered compatibility layer built atop a modern foundation.”**  
> Unlike transitions such as ARM32 to ARM64 or MIPS32 to MIPS64, x64 was designed from the outset to run x86 code natively — without emulation. This compatibility is both a blessing and a curse: it enables smooth migration but obscures the profound differences beneath the surface.

> **“Writing assembly for x64 without understanding x86 is like driving a car without knowing how the engine works. The abstraction will fail you — and when it does, you must know why.”**  
> Even if you never write 32-bit code, you will debug it, interface with it, and optimize around it. Ignoring x86 is not an option — understanding it is a requirement.

By the end of this chapter, you will understand:

- The architectural differences between x86 and x64: registers, addressing, calling conventions.
- How to migrate assembly code from x86 to x64 — line by line.
- How to write assembly that is compatible with both architectures.
- How to handle pointer truncation, stack alignment, and ABI mismatches.
- How to use CPU feature detection and runtime dispatch for hybrid binaries.
- How to debug and profile mixed-mode applications.
- How to interface x86 assembly with x64 C/C++ code (and vice versa).
- How to use tools like `objdump`, `GDB`, and `lldb` to analyze 32-bit vs. 64-bit binaries.
- How to avoid common pitfalls during migration: register corruption, stack misalignment, segmentation faults.
- How to future-proof your code for pure 64-bit environments while maintaining backward compatibility.

---

## 25.2 Architectural Differences Between x86 and x64

Before migrating code, you must understand the fundamental differences between the two architectures.

### 25.2.1 Register Set Expansion

x86 provides 8 general-purpose 32-bit registers: `EAX`, `EBX`, `ECX`, `EDX`, `ESI`, `EDI`, `ESP`, `EBP`.

x64 extends these to 64-bit (`RAX`, `RBX`, etc.) and adds 8 new registers: `R8`–`R15`.

| **Register Type**         | **x86 (32-bit)** | **x64 (64-bit)**       |
| :---                      | :---             | :---                   |
| **General Purpose**       | 8 registers      | 16 registers           |
| **Register Width**        | 32-bit           | 64-bit                 |
| **Additional Registers**  | None             | R8–R15                 |
| **Vector Registers**      | 8 x 128-bit XMM  | 16 x 128-bit XMM, plus YMM/ZMM for AVX/AVX-512 |

Example: Using R8–R15 in x64.

```x86asm
; x64 only
mov r8, 1
mov r9, 2
add r8, r9
```

In x86, `R8` does not exist — this code will not assemble.

### 25.2.2 Address Space and Pointer Size

x86 supports up to 4 GB of virtual address space (2^32).

x64 supports up to 256 TB (48-bit virtual addresses in current implementations) — theoretically 2^64.

This affects:

- Pointer size: 4 bytes in x86, 8 bytes in x64.
- Data structures containing pointers grow in size.
- Pointer arithmetic must account for 8-byte alignment in x64.

Example: Structure with pointers.

```c
struct node {
    int data;
    struct node *next;
};
```

In x86: 8 bytes (4 + 4).  
In x64: 16 bytes (4 + padding + 8).

Assembly must adjust offsets accordingly.

### 25.2.3 Instruction Encoding and Default Operand Size

x86 instructions default to 32-bit operands.

x64 instructions default to 32-bit or 64-bit depending on context — but can be overridden with prefixes.

Example:

```x86asm
; In x86
mov eax, 1      ; 32-bit

; In x64
mov eax, 1      ; still 32-bit — zero-extends to RAX
mov rax, 1      ; 64-bit
```

Note: Writing to 32-bit register in x64 zero-extends to 64-bit — a critical difference.

```x86asm
mov eax, 0xFFFFFFFF   ; RAX = 0x00000000FFFFFFFF
```

In x86, `EAX = 0xFFFFFFFF`, and upper 32 bits of RAX are undefined (but irrelevant).  
In x64, RAX is explicitly zero-extended.

### 25.2.4 Stack and Calling Conventions

x86 typically uses the `cdecl` or `stdcall` conventions — arguments passed on stack.

x64 uses register-based calling conventions:

- **System V ABI (Unix)**: `RDI`, `RSI`, `RDX`, `RCX`, `R8`, `R9` for integer args.
- **Microsoft x64**: `RCX`, `RDX`, `R8`, `R9` for integer args.

Stack must be 16-byte aligned before `call` in x64 — not required in x86.

Example: Function call in x86 vs. x64.

```x86asm
; x86 cdecl
push 2
push 1
call add
add esp, 8

; x64 System V
mov rdi, 1
mov rsi, 2
call add
```

---

## 25.3 Migration Strategies: Porting x86 Assembly to x64

Migration is not automatic — it requires careful analysis and modification.

### 25.3.1 Step 1: Identify Architecture-Specific Constructs

Scan code for:

- 32-bit register names (`EAX`, `EBX`, etc.) — may need widening.
- Stack-based parameter passing — must convert to register-based.
- Inline assembly with hardcoded register constraints.
- Pointer arithmetic assuming 4-byte pointers.
- Assumptions about data structure layout.

### 25.3.2 Step 2: Update Register Usage

Replace 32-bit registers with 64-bit equivalents where necessary.

```x86asm
; x86
mov eax, [esp + 4]   ; first arg
mov ebx, [esp + 8]   ; second arg
add eax, ebx
ret

; x64 System V
mov rax, rdi         ; first arg
add rax, rsi         ; second arg
ret
```

If more than 6 arguments, use stack — but in x64, caller must allocate “home space” (shadow space) on Windows, or pass on stack with 16-byte alignment on Unix.

### 25.3.3 Step 3: Adjust Stack Management

In x86, stack cleanup is often callee’s responsibility (`stdcall`) or caller’s (`cdecl`).

In x64, caller always cleans stack — but rarely uses stack for args.

Example: Stack frame in x86 vs. x64.

```x86asm
; x86
push ebp
mov ebp, esp
sub esp, 16          ; local variables
; ...
mov esp, ebp
pop ebp
ret

; x64
push rbp
mov rbp, rsp
sub rsp, 16          ; local variables — AND align to 16
; ...
mov rsp, rbp
pop rbp
ret
```

Critical: Ensure `RSP` is 16-byte aligned before `call` in x64.

### 25.3.4 Step 4: Handle Pointer and Data Structure Changes

Adjust offsets for 8-byte pointers.

```x86asm
struc list_node
    .data: resd 1        ; 4 bytes
    .next: resq 1        ; 8 bytes in x64, 4 in x86
endstruc
```

In x86: `.next` at offset 4.  
In x64: `.next` at offset 8 (due to alignment).

Use conditional assembly:

```x86asm
%ifdef ARCH_X64
    struc list_node
        .data: resd 1
        .next: resq 1
    endstruc
%else
    struc list_node
        .data: resd 1
        .next: resd 1
    endstruc
%endif
```

### 25.3.5 Step 5: Update Inline Assembly and Intrinsics

Inline assembly in C/C++ must be updated for register constraints.

GCC x86:

```c
asm("movl %1, %%eax\n\t"
    "addl %2, %%eax\n\t"
    "movl %%eax, %0"
    : "=m" (result)
    : "m" (a), "m" (b)
    : "eax"
);
```

GCC x64:

```c
asm("movq %1, %%rax\n\t"
    "addq %2, %%rax\n\t"
    "movq %%rax, %0"
    : "=m" (result)
    : "m" (a), "m" (b)
    : "rax"
);
```

Or better — use register constraints to let compiler choose:

```c
asm("addq %2, %0"
    : "=r" (result)
    : "0" (a), "r" (b)
);
```

---

## 25.4 Compatibility: Running x86 Code on x64 Systems

x64 processors include a compatibility mode that allows unmodified x86 code to run.

### 25.4.1 How Compatibility Mode Works

- CPU switches to 32-bit mode when executing x86 code.
- Registers are truncated to 32 bits.
- Address space limited to 4 GB.
- System calls use 32-bit conventions.

On Linux, use `linux32` command or compile with `-m32`.

On Windows, WoW64 (Windows-on-Windows 64) layer translates 32-bit system calls to 64-bit.

### 25.4.2 Limitations of Compatibility Mode

- Performance overhead due to mode switching.
- Cannot access >4 GB memory from 32-bit process.
- Some 64-bit features (e.g., extra registers, SSE2+) may not be fully utilized.
- Debugging mixed 32/64-bit processes is complex.

### 25.4.3 When to Use Compatibility Mode

- Legacy applications with no source code.
- Third-party libraries not available in 64-bit.
- Temporary migration step.

Avoid for new development.

---

## 25.5 Writing Architecture-Neutral Assembly

For libraries that must support both x86 and x64, write conditional assembly.

### 25.5.1 Using Preprocessor Directives

NASM supports `%ifdef`, `%elifdef`, `%else`.

```x86asm
%ifdef ARCH_X64
    ; x64 version
    mov rax, rdi
    add rax, rsi
    ret
%else
    ; x86 version
    mov eax, [esp + 4]
    add eax, [esp + 8]
    ret
%endif
```

Compile with:

```bash
nasm -f elf64 -D ARCH_X64 -o add_x64.o add.asm
nasm -f elf32 -o add_x86.o add.asm
```

### 25.5.2 Abstracting Calling Conventions

Write macros to hide ABI differences.

```x86asm
%macro ARG 2
%ifdef ARCH_X64
    mov %1, %2
%else
    mov %1, [esp + %2]
%endif
%endmacro

global add
add:
%ifdef ARCH_X64
    ARG rax, rdi
    ARG rbx, rsi
%else
    ARG eax, 4
    ARG ebx, 8
%endif
    add rax, rbx
    ret
```

### 25.5.3 Runtime Dispatch for Performance-Critical Code

Detect architecture at runtime and jump to optimized version.

```x86asm
global add_dispatch
add_dispatch:
    ; Detect if running in 64-bit mode
    pushf
    pop rax
    bt rax, 21          ; Check if RFLAGS bit 21 is accessible (64-bit)
    jc .x64_mode
    jmp add_x86

.x64_mode:
    jmp add_x64

global add_x86
add_x86:
    mov eax, [esp + 4]
    add eax, [esp + 8]
    ret

global add_x64
add_x64:
    mov rax, rdi
    add rax, rsi
    ret
```

---

## 25.6 Interfacing x86 and x64 Code

Sometimes you must call x86 functions from x64 (or vice versa) — e.g., in plugins, legacy systems, or mixed-language projects.

### 25.6.1 Calling x86 Functions from x64

Not directly possible — different ABIs, stack alignment, register sets.

Solutions:

- Use a thunk (glue code) that translates calling conventions.
- Run x86 code in separate process and use IPC.
- Recompile x86 code to x64.

Example thunk (conceptual):

```x86asm
; x64 caller calls this thunk
global thunk_add_x86
thunk_add_x86:
    ; Save x64 registers
    push rbp
    mov rbp, rsp
    sub rsp, 32         ; shadow space + alignment

    ; Convert x64 args to x86 stack
    push rsi            ; second arg
    push rdi            ; first arg

    ; Call x86 function (must be in separate 32-bit module)
    call add_x86_32

    ; Clean stack
    add esp, 8

    ; Restore x64 stack
    mov rsp, rbp
    pop rbp
    ret
```

This requires the x86 function to be in a separate 32-bit DLL or shared library.

### 25.6.2 Calling x64 Functions from x86

Even harder — x86 code cannot directly call x64 functions due to mode switching.

Use OS services to switch modes — complex and slow.

Avoid if possible.

### 25.6.3 Shared Libraries and DLLs

On Windows, 32-bit and 64-bit DLLs are incompatible. Must ship both versions.

On Linux, use separate `.so` files: `libfoo32.so`, `libfoo64.so`.

---

## 25.7 Debugging and Profiling Mixed-Mode Applications

Debugging applications that mix x86 and x64 code is challenging.

### 25.7.1 GDB for Mixed-Mode Debugging

GDB can debug 32-bit processes on 64-bit systems.

```bash
gdb ./my32bitprogram
(gdb) set architecture i386
(gdb) break main
(gdb) run
```

For mixed processes (e.g., WoW64 on Windows), use specialized debuggers like WinDbg.

### 25.7.2 Disassembly and Binary Analysis

Use `objdump` with correct architecture flag.

```bash
objdump -d -M intel -m i386 your32bit.o
objdump -d -M intel -m i386:x86-64 your64bit.o
```

### 25.7.3 Performance Profiling

Use `perf` (Linux) or VTune (Intel) — ensure profiler supports target architecture.

```bash
perf record -e cycles ./myprogram
perf report
```

Profile separately for 32-bit and 64-bit versions — performance characteristics differ significantly.

---

## 25.8 Common Migration Pitfalls and Solutions

### 25.8.1 Pointer Truncation

Assigning 64-bit pointer to 32-bit variable.

```c
// BAD
int *ptr = ...; // 64-bit address
int truncated = (int)ptr; // loses upper 32 bits
```

In assembly:

```x86asm
; BAD in x64
mov eax, rdi   ; truncates pointer!
```

Fixed:

```x86asm
; GOOD
mov rax, rdi   ; preserve full pointer
```

### 25.8.2 Stack Misalignment in x64

Forgetting 16-byte alignment before `call`.

```x86asm
; BAD
push rax        ; RSP now 8 mod 16
call printf     ; may crash
pop rax
```

Fixed:

```x86asm
; GOOD
sub rsp, 8
push rax
call printf
pop rax
add rsp, 8
```

### 25.8.3 Register Preservation Violations

In x64, more registers must be preserved (`R12`–`R15`, `RBX`, `RBP`).

```x86asm
; BAD in x64
mov r12, rdi    ; R12 not saved!
call some_func
add rax, r12    ; R12 may be corrupted
```

Fixed:

```x86asm
; GOOD
push r12
mov r12, rdi
call some_func
add rax, r12
pop r12
```

### 25.8.4 Incorrect Data Structure Layout

Assuming 32-bit structure layout in 64-bit code.

```x86asm
; BAD: Assumes .next at offset 4
mov rax, [rdi + 4]   ; should be +8 in x64
```

Use symbolic names:

```x86asm
mov rax, [rdi + list_node.next]
```

### 25.8.5 Pitfalls Table

| **Pitfall**               | **Symptom**                          | **Solution**                                |
| :---                      | :---                                 | :---                                        |
| **Pointer Truncation**    | Crashes, data corruption             | Use 64-bit registers for pointers.          |
| **Stack Misalignment**    | Crash on `call` or `movaps`          | Align RSP to 16 bytes before `call`.        |
| **Register Corruption**   | Random failures after function calls | Save/restore callee-saved registers.        |
| **ABI Mismatch**          | Wrong parameters, crashes            | Use correct calling convention for target.  |
| **Structure Offset Error**| Reading wrong data                   | Use symbolic offsets, not hard-coded numbers. |

---

## 25.9 Tooling and Automation for Migration

Automate migration where possible.

### 25.9.1 Static Analysis Tools

- **Custom Scripts**: Parse assembly for 32-bit patterns.
- **LLVM**: Convert x86 inline assembly to x64 via Clang.
- **IDA Pro/Ghidra**: Disassemble and recompile.

### 25.9.2 Build System Integration

Use Makefile or CMake to build both versions.

Makefile:

```makefile
ASM = nasm
CFLAGS_X86 = -m32
CFLAGS_X64 = -m64
LDFLAGS_X86 = -m32
LDFLAGS_X64 = -m64

all: libfoo32.so libfoo64.so

libfoo32.so: foo_x86.o
	$(CC) $(LDFLAGS_X86) -shared -o $@ $^

libfoo64.so: foo_x64.o
	$(CC) $(LDFLAGS_X64) -shared -o $@ $^

foo_x86.o: foo.asm
	$(ASM) -f elf32 -D ARCH_X86 -o $@ $<

foo_x64.o: foo.asm
	$(ASM) -f elf64 -D ARCH_X64 -o $@ $<

.PHONY: clean
clean:
	rm -f *.o *.so
```

### 25.9.3 Continuous Integration

Test both 32-bit and 64-bit builds in CI.

GitHub Actions:

```yaml
name: Build x86 and x64
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        arch: [x86, x64]
    steps:
    - uses: actions/checkout@v3
    - name: Install tools
      run: sudo apt install nasm gcc-multilib
    - name: Build
      run: |
        if [ "${{ matrix.arch }}" = "x86" ]; then
          make libfoo32.so
        else
          make libfoo64.so
        fi
    - name: Test
      run: ./test_${{ matrix.arch }}.sh
```

---

## 25.10 Performance Implications of Migration

x64 is not always faster — but usually is, due to more registers and better ABI.

### 25.10.1 Performance Gains

- More registers reduce stack spills.
- Register-based parameters reduce memory accesses.
- SSE2+ always available in x64 — enables vectorization.
- Larger address space enables bigger caches, buffers.

### 25.10.2 Performance Losses

- Larger pointers increase memory footprint.
- 64-bit arithmetic may be slower on some CPUs.
- Compatibility mode adds overhead.

### 25.10.3 Benchmarking

Always benchmark before and after migration.

Example: Benchmark loop performance.

```x86asm
; x86
mov ecx, 1000000
loop_start:
    add eax, 1
    loop loop_start

; x64
mov rcx, 1000000
loop_start:
    add rax, 1
    dec rcx
    jnz loop_start
```

Measure with `rdtsc` or `perf`.

---

## 25.11 Case Study: Migrating a Legacy x86 Library to x64

Consider a legacy x86 assembly library for image processing.

Original x86 code:

```x86asm
; x86: blur_row
; Args: [esp+4] = src ptr, [esp+8] = dst ptr, [esp+12] = width
blur_row:
    push ebp
    mov ebp, esp
    push ebx
    push esi
    push edi

    mov esi, [ebp + 8]   ; src
    mov edi, [ebp + 12]  ; dst
    mov ecx, [ebp + 16]  ; width

    ; ... blur logic ...

    pop edi
    pop esi
    pop ebx
    mov esp, ebp
    pop ebp
    ret
```

Migrated x64 code:

```x86asm
; x64: blur_row
; Args: RDI = src, RSI = dst, RDX = width
blur_row:
    push rbp
    mov rbp, rsp
    push rbx
    push r12
    push r13

    mov r12, rdi         ; src
    mov r13, rsi         ; dst
    mov rbx, rdx         ; width

    ; ... blur logic — may use SSE2 for speedup ...

    pop r13
    pop r12
    pop rbx
    pop rbp
    ret
```

Changes:

- Register-based parameters.
- Use of `R12`, `R13` (must be preserved).
- Potential to use SSE2 (guaranteed available in x64).

Performance: 20–40% faster due to reduced memory accesses and vectorization.

---

## 25.12 Future-Proofing: Preparing for Pure 64-Bit Environments

As 32-bit systems fade, prepare for pure 64-bit.

### 25.12.1 Deprecate 32-bit Builds

- Stop shipping 32-bit binaries.
- Require 64-bit OS in system requirements.
- Use 64-bit-only features (e.g., `R8`–`R15`, AVX-512).

### 25.12.2 Use Portable Abstractions

- Hide architecture differences behind macros or C wrappers.
- Use `intptr_t` and `uintptr_t` for pointer-sized integers.
- Avoid inline assembly — use intrinsics when possible.

### 25.12.3 Educate and Document

- Document which parts of code are architecture-dependent.
- Train team on x64 best practices.
- Archive 32-bit code with clear deprecation notices.

---

## 25.13 Best Practices and Summary

### 25.13.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Use Conditional Assembly**  | Support both x86 and x64 with `%ifdef` directives.                              |
| **Validate Pointer Sizes**    | Never truncate 64-bit pointers to 32 bits.                                      |
| **Enforce Stack Alignment**   | 16-byte alignment before `call` in x64.                                         |
| **Preserve All Callee Registers**| Save `RBX`, `RBP`, `R12`–`R15` in x64.                                       |
| **Benchmark Before and After**| Measure performance impact of migration.                                        |
| **Automate Builds**           | Build both 32-bit and 64-bit versions in CI.                                    |
| **Avoid Mixed-Mode Calls**    | Recompile or use IPC instead of direct x86/x64 calls.                           |
| **Use Symbolic Offsets**      | Avoid hard-coded structure offsets.                                             |

> **“Migration is not a one-time event — it is a process. Start with compatibility, optimize for performance, and end with purity.”**  
> The path from x86 to x64 is not a cliff — it is a ramp. Walk it deliberately, test at each step, and leave no code behind without a plan.

> **“The future is 64-bit — but the past is still running. Your job is to bridge them without breaking either.”**  
> Respect legacy systems, but do not let them constrain your future. Migrate with care, optimize with precision, and deploy with confidence.

---

## 25.14 Exercises

1. Migrate a simple x86 assembly function (e.g., string length) to x64.
2. Write a conditional assembly macro that works for both x86 and x64.
3. Debug a 32-bit assembly program on a 64-bit Linux system using GDB.
4. Identify and fix pointer truncation in a provided x64 assembly snippet.
5. Write a thunk that calls an x86 function from x64 code (simulate with separate files).
6. Benchmark a loop in x86 vs. x64 and report performance difference.
7. Use `objdump` to disassemble a 32-bit and 64-bit binary of the same function.
8. Write a Makefile that builds both 32-bit and 64-bit versions of an assembly library.
9. Convert x86 inline assembly in a C program to x64-compatible inline assembly.
10. Profile a mixed C/assembly program in x86 and x64 modes using `perf`.

---

## 25.15 Further Reading

- Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volumes 1–3.
- “Computer Systems: A Programmer’s Perspective” by Bryant and O’Hallaron.
- AMD64 Architecture Programmer’s Manual.
- GCC x86-64 ABI Documentation: https://gcc.gnu.org/wiki/x86-64
- Microsoft x64 Calling Convention: https://docs.microsoft.com/en-us/cpp/build/x64-calling-convention
- “The Art of Assembly Language” by Randall Hyde.
- Agner Fog’s Optimization Manuals: www.agner.org

