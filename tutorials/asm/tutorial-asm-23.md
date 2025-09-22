# 23. Debugging and Testing in Assembly Language Programming

## 23.1 Introduction to Debugging and Testing in Assembly

Debugging and testing are the twin pillars of software reliability. In high-level languages, debuggers, unit testing frameworks, and runtime diagnostics provide rich tooling. In assembly language — where every instruction manipulates hardware state directly — debugging and testing demand precision, discipline, and a deep understanding of the machine.

> **“Assembly does not hide its mistakes — it executes them. Debugging is the process of catching those executions before they catch you.”**  
> Unlike high-level languages, where exceptions and stack traces guide you to the source of failure, assembly offers raw registers, memory dumps, and instruction pointers. Mastering debugging is not optional — it is the difference between hours and weeks of frustration.

> **“Testing is not proof of correctness — it is proof of effort. In assembly, where the compiler provides no safety net, that effort is your only defense.”**  
> Every test case is a documented scenario where your code behaves as intended. Without tests, you have no evidence — only hope.

By the end of this chapter, you will understand:

- How to use GDB and other debuggers to step through assembly code.
- How to set breakpoints, watchpoints, and catchpoints.
- How to inspect and modify registers, flags, and memory.
- How to write unit, integration, and property-based tests for assembly functions.
- How to use logging, tracing, and assertions for runtime diagnostics.
- How to debug concurrent and interrupt-driven code.
- How to use performance profilers to identify bottlenecks.
- How to automate testing in CI/CD pipelines.
- How to debug bootloaders, kernels, and bare-metal code.
- How to apply debugging and testing techniques from safety-critical domains to general software.

---

## 23.2 Debugging with GDB: The Essential Toolkit

GDB (GNU Debugger) is the most powerful and widely used debugger for assembly code on Unix-like systems.

### 23.2.1 Compiling for Debugging

Always compile with debug symbols.

```bash
nasm -g -F dwarf -f elf64 yourfile.asm -o yourfile.o
gcc -g yourfile.o -o your_program
```

The `-g` flag embeds DWARF debug information. `-F dwarf` tells NASM to generate it.

### 23.2.2 Starting GDB and Loading Symbols

```bash
gdb ./your_program
```

Verify symbols loaded:

```gdb
(gdb) info functions
(gdb) disassemble main
```

### 23.2.3 Setting Breakpoints

Break at function entry:

```gdb
(gdb) break *your_function
```

Break at specific address:

```gdb
(gdb) break *0x401000
```

Break at source line (if debug info available):

```gdb
(gdb) break yourfile.asm:45
```

### 23.2.4 Stepping Through Instructions

Step one instruction (step into calls):

```gdb
(gdb) stepi
```

Step one instruction (step over calls):

```gdb
(gdb) nexti
```

Continue execution:

```gdb
(gdb) continue
```

### 23.2.5 Inspecting State

View all registers:

```gdb
(gdb) info registers
```

View specific register:

```gdb
(gdb) print $rax
```

View flags:

```gdb
(gdb) info registers eflags
```

View memory:

```gdb
(gdb) x/10xg $rsp    # 10 hex quadwords from RSP
(gdb) x/20i $rip     # 20 instructions from RIP
```

### 23.2.6 Modifying State

Change register value:

```gdb
(gdb) set $rax = 42
```

Change memory:

```gdb
(gdb) set *(int*)0x601000 = 100
```

### 23.2.7 Watchpoints and Catchpoints

Watch memory location:

```gdb
(gdb) watch *0x601000
```

Catch system calls:

```gdb
(gdb) catch syscall write
```

Catch exceptions (signals):

```gdb
(gdb) catch signal SIGSEGV
```

---

## 23.3 Advanced GDB Techniques

### 23.3.1 Reverse Debugging

If GDB was configured with `--enable-targets=all` and the program was recorded:

```gdb
(gdb) record
(gdb) continue
# ... crash ...
(gdb) reverse-stepi
```

### 23.3.2 Scripting with Python

GDB supports Python scripting for automation.

```python
# gdb_script.py
import gdb

class StepUntilCall(gdb.Command):
    def __init__(self):
        super(StepUntilCall, self).__init__("step-until-call", gdb.COMMAND_USER)

    def invoke(self, arg, from_tty):
        while True:
            insn = gdb.selected_frame().architecture().disassemble(gdb.selected_frame().pc())[0]['asm']
            if 'call' in insn:
                print(f"Call found: {insn}")
                break
            gdb.execute("stepi")

StepUntilCall()
```

Load in GDB:

```gdb
(gdb) source gdb_script.py
(gdb) step-until-call
```

### 23.3.3 Core Dump Analysis

Debug crashed programs post-mortem.

```bash
./your_program        # crashes and generates core
gdb ./your_program core
(gdb) bt              # backtrace
(gdb) info registers
```

Enable core dumps:

```bash
ulimit -c unlimited
```

### 23.3.4 Multi-threaded Debugging

List threads:

```gdb
(gdb) info threads
```

Switch thread:

```gdb
(gdb) thread 2
```

Set breakpoint in all threads:

```gdb
(gdb) set scheduler-locking on
```

---

## 23.4 Testing Assembly Functions

Testing is systematic execution with known inputs and expected outputs.

### 23.4.1 Unit Testing with C Harnesses

Write tests in C that call assembly functions.

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
gcc -g test_math.c math.o -o test_math
./test_math
```

### 23.4.2 Test-Driven Development (TDD) in Assembly

Write test first, then implement.

Test:

```c
void test_safe_divide() {
    int result;
    assert(safe_divide(10, 2, &result) == 0 && result == 5);
    assert(safe_divide(10, 0, &result) == -1);
}
```

Implement:

```x86asm
global safe_divide
safe_divide:
    ; RDI = dividend, RSI = divisor, RDX = result ptr
    test rsi, rsi
    jz .error
    mov rax, rdi
    cqo
    idiv rsi
    mov [rdx], rax
    xor rax, rax
    ret
.error:
    mov rax, -1
    ret
```

### 23.4.3 Property-Based Testing

Use QuickCheck (via Rust or Haskell) to generate random inputs.

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

### 23.4.4 Edge Case Testing

Test boundaries: zero, maximum, minimum, negative, alignment.

```c
void test_edge_cases() {
    assert(asm_add(INT_MAX, 0) == INT_MAX);
    assert(asm_add(INT_MIN, 0) == INT_MIN);
    assert(asm_add(INT_MAX, 1) == INT_MIN); // overflow
    assert(asm_add(0x7FFFFFFF, 1) == 0x80000000); // signed overflow
}
```

---

## 23.5 Logging, Tracing, and Assertions

When debuggers are unavailable (e.g., embedded systems), use logging and assertions.

### 23.5.1 Logging via printf

```x86asm
extern printf

global traced_function
traced_function:
    push rdi
    mov rdi, enter_msg
    xor rax, rax
    call printf
    pop rdi

    ; ... function body ...

    push rdi
    mov rdi, exit_msg
    call printf
    pop rdi
    ret

section .data
enter_msg db "Entering traced_function", 10, 0
exit_msg db "Exiting traced_function", 10, 0
```

### 23.5.2 Assertion Macros

```x86asm
%macro assert 1
    test %1, %1
    jnz %%.pass
    mov rdi, %%.msg
    call assert_fail
%%.pass:
%%.msg: db "Assertion failed: %1", 10, 0
%endmacro

global safe_function
safe_function:
    assert rdi          ; assert RDI != 0
    ; ... body ...
    ret

assert_fail:
    ; Print message and abort
    extern printf, exit
    push rdi
    mov rsi, rdi
    mov rdi, fmt
    xor rax, rax
    call printf
    pop rdi
    mov rdi, 1
    call exit
fmt: db "%s", 10, 0
```

### 23.5.3 Tracing Execution Flow

Log every basic block.

```x86asm
%macro trace 1
    push rdi
    mov rdi, %1
    call print_string
    pop rdi
%endmacro

global complex_function
complex_function:
    trace block1_msg
    ; ... code ...
    jmp .next

.next:
    trace block2_msg
    ; ... code ...
    ret

section .data
block1_msg db "Block 1", 10, 0
block2_msg db "Block 2", 10, 0
```

---

## 23.6 Debugging Concurrent Code

Concurrency introduces race conditions, deadlocks, and atomicity issues.

### 23.6.1 ThreadSanitizer (TSan)

Use via C wrapper.

```c
// wrapper.c
#include <pthread.h>
extern void concurrent_function(int *shared);

void* thread_func(void* arg) {
    int *shared = (int*)arg;
    for (int i = 0; i < 1000; i++) {
        concurrent_function(shared);
    }
    return NULL;
}

int main() {
    int shared = 0;
    pthread_t t1, t2;
    pthread_create(&t1, NULL, thread_func, &shared);
    pthread_create(&t2, NULL, thread_func, &shared);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    return 0;
}
```

Compile with TSan:

```bash
gcc -fsanitize=thread -fPIE -pie -g wrapper.c your_asm.o -o program
./program
```

### 23.6.2 Logging Thread IDs

In assembly, log thread-specific data.

```x86asm
extern pthread_self

global thread_safe_function
thread_safe_function:
    call pthread_self
    mov rdi, rax        ; thread ID
    mov rsi, log_msg
    call log_thread_id
    ; ... body ...
    ret

log_thread_id:
    ; RDI = thread ID, RSI = message
    ; ... print ...
    ret

section .data
log_msg db "Thread ID: ", 0
```

### 23.6.3 Deadlock Detection

Use lock ordering and timeout patterns (see Chapter 22).

---

## 23.7 Debugging Interrupt Handlers and Kernel Code

Kernel and interrupt code cannot be debugged like user-space code.

### 23.7.1 Serial Port Debugging

Output debug messages via serial port.

```x86asm
; Write character to serial port (COM1)
serial_putc:
    push rax
    push rdx
.wait:
    mov dx, 0x3F8 + 5   ; Line Status Register
    in al, dx
    test al, 0x20       ; TX buffer empty?
    jz .wait
    mov dx, 0x3F8       ; Data Register
    mov al, dil
    out dx, al
    pop rdx
    pop rax
    ret

global debug_handler
debug_handler:
    mov dil, '!'
    call serial_putc
    iretq
```

### 23.7.2 QEMU with GDB Stub

Debug kernel code with QEMU.

Start QEMU:

```bash
qemu-system-x86_64 -s -S -kernel your_kernel
```

In another terminal:

```bash
gdb
(gdb) target remote :1234
(gdb) break *0x1000
(gdb) continue
```

### 23.7.3 Bochs Debugger

Bochs has built-in debugger.

```bash
bochs -f bochsrc -q
<bochs> b 0x1000
<bochs> c
```

---

## 23.8 Performance Profiling and Optimization Debugging

Sometimes bugs are performance issues — cache misses, branch mispredictions, pipeline stalls.

### 23.8.1 Using perf

Profile CPU cycles, cache misses, branches.

```bash
perf record ./your_program
perf report
```

Annotate assembly:

```bash
perf annotate --symbol=your_function
```

### 23.8.2 Intel VTune

Advanced profiling for x86.

```bash
vtune -collect hotspots ./your_program
```

Identify hotspots, vectorization inefficiencies, memory bottlenecks.

### 23.8.3 Cache Miss Debugging

Use `perf` to count cache misses.

```bash
perf stat -e cache-misses,cache-references ./your_program
```

Optimize data layout, prefetching, alignment.

---

## 23.9 Automated Testing and CI/CD Integration

Automate testing to catch regressions.

### 23.9.1 Makefile with Test Targets

```makefile
.PHONY: test debug

test: program
	./test_runner

debug: program
	gdb ./program

program: src/math.asm
	nasm -g -f elf64 $< -o build/math.o
	gcc -g build/math.o test/test_math.c -o program
```

### 23.9.2 GitHub Actions

`.github/workflows/test.yml`:

```yaml
name: Test Assembly
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Install tools
      run: sudo apt install nasm gcc
    - name: Build and test
      run: |
        make
        make test
    - name: Run with Valgrind
      run: valgrind --error-exitcode=1 ./program
```

### 23.9.3 Fuzzing with AFL

Fuzz assembly functions via C wrapper.

```c
// fuzz_target.c
extern int asm_function(char *buf, size_t len);

int main(int argc, char **argv) {
    if (argc < 2) return 1;
    FILE *f = fopen(argv[1], "rb");
    if (!f) return 1;
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    char *buf = malloc(size);
    fread(buf, 1, size, f);
    fclose(f);
    asm_function(buf, size);
    free(buf);
    return 0;
}
```

Fuzz:

```bash
afl-fuzz -i testcases -o findings -- ./fuzz_target @@
```

---

## 23.10 Debugging Tools Beyond GDB

### 23.10.1 LLDB (macOS)

Similar to GDB.

```bash
lldb ./your_program
(lldb) break set -n your_function
(lldb) run
(lldb) register read
```

### 23.10.2 Radare2

Interactive disassembler and debugger.

```bash
r2 -d your_program
[0x00000000]> dc          # continue
[0x00000000]> db 0x401000 # breakpoint
[0x00000000]> dr rax      # read RAX
```

### 23.10.3 Valgrind for Memory Errors

Detect invalid memory accesses.

```bash
valgrind --tool=memcheck ./your_program
```

### 23.10.4 strace and ltrace

Trace system calls and library calls.

```bash
strace ./your_program
ltrace ./your_program
```

---

## 23.11 Debugging Bootloaders and Bare-Metal Code

No OS, no debugger — use simulators and hardware.

### 23.11.1 QEMU for Bootloader Debugging

```bash
qemu-system-x86_64 -s -S -drive format=raw,file=bootloader.img
```

Debug with GDB as in Section 23.7.2.

### 23.11.2 Hardware Debuggers (JTAG)

Use OpenOCD with JTAG probes.

```bash
openocd -f interface/jlink.cfg -f target/x86_64.cfg
```

Connect GDB:

```gdb
(gdb) target remote :3333
```

### 23.11.3 Logging to VGA Text Mode

In bootloader, write directly to VGA memory.

```x86asm
; Write character to VGA text buffer
print_char:
    push rax
    push rbx
    mov rbx, 0xB8000    ; VGA text buffer
    mov byte [rbx], dil ; character
    mov byte [rbx+1], 0x07 ; attribute (white on black)
    pop rbx
    pop rax
    ret
```

---

## 23.12 Common Debugging Scenarios and Solutions

### 23.12.1 Segmentation Fault

Usually invalid memory access.

Debug with GDB:

```gdb
(gdb) run
# ... segfault ...
(gdb) bt
(gdb) info registers
(gdb) x/10i $rip
```

Check pointer validity, stack alignment.

### 23.12.2 Infinite Loop

Use `stepi` to trace execution.

Set watchpoint on loop counter:

```gdb
(gdb) watch $rcx
```

### 23.12.3 Incorrect Results

Check register usage, calling convention.

Verify inputs with `print`, outputs with `x`.

### 23.12.4 Stack Corruption

Check for buffer overflows, misaligned stacks.

Use stack canaries (Chapter 22).

---

## 23.13 Best Practices and Pitfalls

### 23.13.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Compile with Debug Symbols**| Always use `-g` and `-F dwarf` for NASM.                                        |
| **Write Unit Tests**          | Test every function with edge cases and property-based tests.                   |
| **Use Logging Liberally**     | When debuggers fail, logging saves you.                                         |
| **Automate Testing**          | Integrate tests into CI/CD to catch regressions.                                |
| **Profile Performance**       | Use `perf` or VTune to find bottlenecks and optimization opportunities.         |
| **Debug Concurrency Early**   | Use TSan and logging to catch race conditions before they hide.                 |
| **Simulate Kernel Code**      | Use QEMU + GDB for kernel and bootloader debugging.                             |
| **Document Debugging Steps**  | Keep a log of debugging sessions — patterns repeat.                             |

### 23.13.2 Common Pitfalls

- **No Debug Symbols**: Makes debugging guesswork.
- **Ignoring Edge Cases**: Tests pass until real data fails.
- **Overlooking Concurrency**: Race conditions only appear under load.
- **Hardware Assumptions**: Code works on one machine, fails on another.
- **No Automation**: Manual testing misses regressions.

> **“Debugging is not a chore — it is a conversation with the machine. Listen carefully, and it will tell you where you went wrong.”**  
> Every crash, every incorrect result, is a message from the hardware. Learn to read it, and you will master assembly.

> **“The most dangerous bug is the one you think you’ve fixed. Test it, trace it, and verify it — then test it again.”**  
> In assembly, fixes can introduce new bugs. Never assume — always validate.

---

## 23.14 Exercises

1. Use GDB to debug a segmentation fault in an assembly function.
2. Write a unit test harness in C for an assembly string reversal function.
3. Use GDB watchpoints to debug an infinite loop in assembly code.
4. Set up QEMU + GDB to debug a simple bootloader.
5. Use ThreadSanitizer to detect a race condition in a multi-threaded assembly program.
6. Write a property-based test in Rust for an assembly arithmetic function.
7. Use `perf` to profile an assembly function and identify a performance bottleneck.
8. Implement serial port debugging in an interrupt handler.
9. Set up a GitHub Actions workflow that builds, tests, and runs Valgrind on an assembly project.
10. Use Radare2 to debug a stripped binary and reconstruct its control flow.

---

## 23.15 Further Reading

- GDB Manual: https://sourceware.org/gdb/current/onlinedocs/gdb/
- “The Art of Debugging with GDB, DDD, and Eclipse” by Norman Matloff.
- Valgrind Documentation: https://valgrind.org/docs/
- Intel VTune Profiler: https://software.intel.com/content/www/us/en/develop/tools/vtune-profiler.html
- QEMU User Documentation: https://wiki.qemu.org/Main_Page
- “Systems Performance: Enterprise and the Cloud” by Brendan Gregg.
- AFL Fuzzer: http://lcamtuf.coredump.cx/afl/

