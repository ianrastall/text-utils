# 20. Static Analysis in Assembly

## 20.1 Introduction to Static Analysis in Assembly

Static analysis is the examination of source or binary code without executing it. In high-level languages, static analyzers detect type mismatches, null pointer dereferences, resource leaks, and security vulnerabilities. In assembly language — where abstractions vanish and every instruction manipulates hardware state directly — static analysis becomes both more challenging and more essential.

> **“Assembly does not have a compiler to catch your mistakes — it has you. Static analysis is the scalpel that exposes flaws before they become failures.”**  
> Unlike C or Rust, where the compiler enforces type safety and memory ownership, assembly offers no such guarantees. Static analysis tools — automated or manual — are your only mechanism for detecting undefined behavior, control flow anomalies, and architectural violations before runtime.

> **“If your code passes static analysis, it is not necessarily correct — but if it fails, it is certainly wrong.”**  
> Static analysis is conservative: it may report false positives, but it rarely misses true errors. Treat every warning as a potential catastrophe — because in assembly, it often is.

By the end of this chapter, you will understand:

- How to perform manual static analysis through systematic code review.
- How to use disassemblers and decompilers to reconstruct control flow and data flow.
- How to detect undefined behavior: uninitialized registers, invalid memory accesses, stack misalignment.
- How to verify calling convention compliance: register preservation, parameter passing, stack management.
- How to analyze binary code when source is unavailable.
- How to use symbolic execution and abstract interpretation for deeper analysis.
- How to integrate static analysis into build systems and CI/CD pipelines.
- How to apply static analysis to concurrent and interrupt-driven code.
- How to extend and customize open-source analysis tools for assembly.
- How to combine static analysis with dynamic analysis for comprehensive verification.

---

## 20.2 Manual Static Analysis: The Programmer as Analyzer

Before automated tools, there was — and still is — the human analyst. Manual static analysis is a disciplined, line-by-line inspection of assembly code to detect violations of invariants, contracts, and architectural rules.

### 20.2.1 Checklist for Manual Review

Every assembly function should be reviewed against the following criteria:

- **Register usage**: Are callee-saved registers preserved? Are volatile registers clobbered appropriately?
- **Stack alignment**: Is the stack 16-byte aligned before every `call`? Is the red zone respected?
- **Memory safety**: Are all memory accesses within bounds? Are pointers validated?
- **Control flow**: Does every path terminate? Are jumps and calls balanced with returns?
- **Error handling**: Are error codes returned consistently? Are failure paths tested?
- **Concurrency**: Are shared variables accessed atomically? Are locks acquired and released symmetrically?
- **Interrupt safety**: Are interrupt handlers reentrant? Do they preserve flags and floating-point state?

### 20.2.2 Example: Reviewing a String Copy Function

Consider this assembly function:

```x86asm
global unsafe_strcpy
unsafe_strcpy:
    ; RDI = dest, RSI = src
.copy_loop:
    mov al, [rsi]
    mov [rdi], al
    inc rsi
    inc rdi
    test al, al
    jnz .copy_loop
    ret
```

Manual analysis reveals:

- **No bounds checking**: If `src` is not null-terminated, this loops indefinitely or overflows `dest`.
- **No alignment consideration**: Could be optimized with SIMD if length known.
- **No error return**: Caller cannot detect failure.
- **No register preservation**: OK if no callee-saved registers used.

Improved version:

```x86asm
global safe_strcpy
safe_strcpy:
    ; RDI = dest, RSI = src, RDX = max_len
    test rdx, rdx
    jz .error
    xor rcx, rcx        ; byte counter

.copy_loop:
    cmp rcx, rdx
    jge .error
    mov al, [rsi]
    mov [rdi], al
    inc rsi
    inc rdi
    inc rcx
    test al, al
    jnz .copy_loop
    xor rax, rax        ; success
    ret

.error:
    mov rax, -1         ; error
    ret
```

### 20.2.3 Control Flow Graph (CFG) Reconstruction

Draw the CFG manually to detect unreachable code, infinite loops, or missing returns.

Example:

```x86asm
global flawed_function
flawed_function:
    cmp rdi, 0
    jl .negative
    jmp .positive
.negative:
    mov rax, -1
    ; Missing ret!
.positive:
    mov rax, 1
    ret
```

Manual CFG shows `.negative` path does not return — a critical bug.

Fixed:

```x86asm
.negative:
    mov rax, -1
    ret          ; Added
```

---

## 20.3 Disassemblers and Decompilers for Static Analysis

When source code is unavailable — or to verify compiler output — disassemblers and decompilers reconstruct structure from binaries.

### 20.3.1 objdump and ndisasm

Basic disassembly with `objdump`:

```bash
nasm -f elf64 example.asm -o example.o
objdump -d example.o
```

Output:

```
0000000000000000 <safe_strcpy>:
   0:	48 85 d2             	test   %rdx,%rdx
   3:	74 1d                	je     22 <safe_strcpy+0x22>
   ...
```

Use `ndisasm` for raw binary:

```bash
ndisasm -b 64 raw.bin
```

### 20.3.2 Radare2 for Interactive Analysis

Radare2 provides CFG, cross-references, and scripting.

```bash
r2 -A your_program
[0x00000000]> pdf @ sym.safe_strcpy   # disassemble function
[0x00000000]> agf @ sym.safe_strcpy   # show CFG
[0x00000000]> axt @ 0x00000010        # find cross-references to address
```

### 20.3.3 Ghidra for Decompilation

Ghidra decompiles assembly to pseudo-C — invaluable for understanding complex logic.

Steps:

1. Import binary into Ghidra.
2. Analyze → Auto Analyze.
3. View decompiled code in Listing window.

Example output for `safe_strcpy`:

```c
long safe_strcpy(char *dest, char *src, ulong max_len)
{
  ulong counter;
  byte bVar1;
  
  if (max_len == 0) {
    return -1;
  }
  counter = 0;
  do {
    if (max_len <= counter) {
      return -1;
    }
    bVar1 = *src;
    *dest = bVar1;
    src = src + 1;
    dest = dest + 1;
    counter = counter + 1;
  } while (bVar1 != 0);
  return 0;
}
```

Ghidra reveals:

- Loop structure.
- Variable roles.
- Potential signed/unsigned mismatches.

---

## 20.4 Detecting Undefined Behavior

Undefined behavior in assembly includes uninitialized registers, invalid memory accesses, and architectural violations.

### 20.4.1 Uninitialized Registers

Using a register before assigning a value.

```x86asm
global bad_function
bad_function:
    add rax, 1      ; RAX uninitialized!
    ret
```

Detection:

- Manual review: Track register definitions.
- Tools: Use Valgrind (via C wrapper) or custom analyzers.

Fixed:

```x86asm
    xor rax, rax
    add rax, 1
```

### 20.4.2 Invalid Memory Accesses

Accessing unmapped or protected memory.

```x86asm
global crash_function
crash_function:
    mov rax, [rdi]  ; RDI may be 0 or invalid
    ret
```

Detection:

- Static: Validate pointer preconditions in comments or assertions.
- Dynamic: Valgrind, AddressSanitizer.

Fixed:

```x86asm
    test rdi, rdi
    jz .error
    mov rax, [rdi]
    ret
.error:
    mov rax, -1
    ret
```

### 20.4.3 Stack Misalignment

Violating 16-byte alignment before `call`.

```x86asm
global misaligned_call
misaligned_call:
    push rax        ; RSP now 8 mod 16
    call printf     ; May crash or corrupt stack
    pop rax
    ret
```

Detection:

- Manual: Count stack adjustments.
- Tools: Custom linter or binary analysis.

Fixed:

```x86asm
    sub rsp, 8
    push rax
    call printf
    pop rax
    add rsp, 8
```

---

## 20.5 Calling Convention Compliance

Static analysis must verify that functions adhere to the ABI.

### 20.5.1 Register Preservation

Callee-saved registers (`rbx`, `rbp`, `r12`–`r15`) must be preserved.

```x86asm
global violates_abi
violates_abi:
    mov rbx, rdi    ; RBX modified without saving
    call some_function
    add rax, rbx    ; RBX may be corrupted
    ret             ; ABI violation
```

Detection:

- Manual: Check save/restore pairs.
- Tools: Binary diffing or register liveness analysis.

Fixed:

```x86asm
    push rbx
    mov rbx, rdi
    call some_function
    add rax, rbx
    pop rbx
    ret
```

### 20.5.2 Parameter Passing

Verify arguments are passed in correct registers.

```x86asm
global wrong_params
wrong_params:
    ; Should be: RDI, RSI, RDX, RCX, R8, R9
    mov rax, rdi    ; OK
    mov rbx, rsi    ; OK
    mov rcx, rdx    ; OK
    mov rdx, rcx    ; Swapped! Should be RCX=4th, RDX=3rd
    ; ...
```

Detection:

- Manual: Cross-reference with function signature.
- Tools: Ghidra decompiler shows parameter mismatches.

### 20.5.3 Return Value Handling

Ensure return values are placed in correct registers.

```x86asm
global wrong_return
wrong_return:
    mov rbx, 42     ; Should be RAX
    ret
```

Detection:

- Manual: Check final assignment before `ret`.
- Tools: Decompiler shows return variable.

Fixed:

```x86asm
    mov rax, 42
    ret
```

---

## 20.6 Data Flow and Taint Analysis

Track how data moves through registers and memory to detect information leaks, uninitialized uses, or corruption.

### 20.6.1 Manual Taint Tracking

Mark untrusted inputs and trace their propagation.

Example: Validate user input.

```x86asm
global process_input
process_input:
    ; RDI = user_input (tainted)
    cmp rdi, 100
    ja .invalid
    mov [buffer], rdi   ; Propagate taint to memory
    ; ... later ...
    mov rax, [buffer]
    add rax, 10         ; Still tainted
    ; Must validate before use!
    cmp rax, 200
    ja .invalid
    ; ...
```

### 20.6.2 Automated Taint Analysis with Angr

Angr performs symbolic execution and taint tracking.

Python script:

```python
import angr

proj = angr.Project('your_binary', auto_load_libs=False)
state = proj.factory.entry_state()
simgr = proj.factory.simulation_manager(state)

# Mark RDI as tainted
state.regs.rdi = state.solver.BVS('user_input', 64)

simgr.explore(find=0x401000)  # target address

for found in simgr.found:
    user_input = found.solver.eval(found.regs.rdi)
    print(f"Input causing target: {user_input}")
```

Useful for finding inputs that reach dangerous code paths.

---

## 20.7 Symbolic Execution and Abstract Interpretation

Symbolic execution executes code with symbolic (not concrete) values to explore all paths.

### 20.7.1 Angr for Path Exploration

Find all paths through a function.

```python
import angr

proj = angr.Project('your_binary')
cfg = proj.analyses.CFGFast()

# Get function
func = cfg.functions['your_function']

# Symbolic execution
state = proj.factory.blank_state(addr=func.addr)
simgr = proj.factory.simulation_manager(state)

simgr.explore()

for deadended in simgr.deadended:
    print(f"Path ended at {hex(deadended.addr)}")
```

### 20.7.2 Detecting Unreachable Code

Code that no input can reach.

```x86asm
global unreachable_code
unreachable_code:
    cmp rdi, 0
    jl .valid
    jmp .end
.valid:
    ; This path is unreachable if RDI is unsigned
    mov rax, 1
    ret
.end:
    mov rax, 0
    ret
```

Angr can prove `.valid` is unreachable if `rdi` is constrained to ≥0.

### 20.7.3 Abstract Interpretation with Miasm

Miasm is a binary analysis framework for abstract interpretation.

Example: Track register intervals.

```python
from miasm.analysis.binary import Container
from miasm.analysis.machine import Machine
from miasm.ir.symbexec import SymbolicExecutionEngine

# Load binary
cont = Container.from_stream(open('your_binary', 'rb'))
machine = Machine(cont.arch)
mdis = machine.dis_engine(cont.bin_stream)

# Disassemble function
addr = 0x401000
asmcfg = mdis.dis_multiblock(addr)

# Symbolic execution
sb = machine.ir(mdis.loc_db)
ircfg = sb.new_ircfg_from_asmcfg(asmcfg)
symb = SymbolicExecutionEngine(sb)

# Execute
symb.run_at(ircfg, addr)

# Inspect register states
print(symb.symbols)
```

---

## 20.8 Binary Analysis Without Source

When only binaries are available, static analysis becomes forensic.

### 20.8.1 Identifying Functions and Entry Points

Use `objdump` or Radare2 to find symbols.

```bash
objdump -t your_binary | grep "F .text"
```

If stripped, use heuristics: `push rbp; mov rbp, rsp` prologues.

### 20.8.2 Cross-Reference Analysis

Find where functions are called.

In Radare2:

```bash
[0x00000000]> axt sym.imp.printf
```

In Ghidra: Right-click function → “Find References”.

### 20.8.3 String and Constant Analysis

Find embedded strings or constants that reveal functionality.

```bash
strings your_binary | grep "Error"
```

In Ghidra: Search → For Strings.

---

## 20.9 Static Analysis of Concurrent Code

Concurrency introduces race conditions, deadlocks, and atomicity violations.

### 20.9.1 Atomicity Verification

Ensure RMW operations use `lock` prefix.

```x86asm
global non_atomic_increment
non_atomic_increment:
    inc qword [rdi]     ; Not atomic! Missing lock
    ret
```

Detection:

- Manual: Search for `inc`, `add`, `dec` on memory without `lock`.
- Tools: Custom script or binary pattern matcher.

Fixed:

```x86asm
    lock inc qword [rdi]
```

### 20.9.2 Lock Pairing

Verify every lock acquire has a release.

```x86asm
global unpaired_lock
unpaired_lock:
    mov rax, 1
    xchg rax, [lock_var]   ; Acquire
    test rax, rax
    jnz .acquired
    ret                    ; Forgot to release!
.acquired:
    ; ... critical section ...
    mov qword [lock_var], 0  ; Release
    ret
```

Detection:

- Manual: Track lock state per path.
- Tools: Model checking or abstract interpretation.

### 20.9.3 Deadlock Detection via Lock Order Analysis

If locks are acquired in inconsistent order, deadlock may occur.

Static analysis can build a lock graph and detect cycles.

Tools: TLA+, Spin, or custom analyzers.

---

## 20.10 Static Analysis of Interrupt Handlers

Handlers must be minimal, reentrant, and restore state.

### 20.10.1 Stack and Register Validation

Ensure all volatile registers are saved.

```x86asm
global incomplete_handler
incomplete_handler:
    push rax
    ; Forgot to save rcx, rdx, rsi, etc.
    call some_function
    pop rax
    iretq
```

Detection:

- Manual: Compare with ABI requirements.
- Tools: Binary register liveness analysis.

### 20.10.2 Floating-Point State

Handlers must not use FP instructions without saving state.

```x86asm
global unsafe_fp_handler
unsafe_fp_handler:
    addsd xmm0, xmm1    ; FP instruction without fxsave!
    iretq
```

Detection:

- Manual: Scan for `xmm`, `ymm`, `fst`, `fadd`, etc.
- Tools: Instruction set analyzer.

Fixed:

```x86asm
    sub rsp, 512
    fxsave [rsp]
    addsd xmm0, xmm1
    fxrstor [rsp]
    add rsp, 512
    iretq
```

---

## 20.11 Integration with Build Systems and CI/CD

Automate static analysis in your workflow.

### 20.11.1 Makefile Integration

```makefile
.PHONY: analyze

analyze: your_program
	./static_analyzer.sh $<
	angr-check.py $<
	miasm-analyze.py $<

your_program: src/*.asm
	nasm -g -f elf64 -o build/main.o src/main.asm
	gcc build/main.o -o your_program
```

### 20.11.2 Custom Linter Script

`static_analyzer.sh`:

```bash
#!/bin/bash
file=$1

# Check for missing ret
if ! objdump -d $file | grep -q "ret"; then
    echo "Error: No ret found in $file"
    exit 1
fi

# Check for lock prefix on memory RMW
if objdump -d $file | grep -E "(inc|dec|add|sub|xor|or|and) .*%.*" | grep -v "lock"; then
    echo "Warning: Possible non-atomic RMW without lock"
fi

echo "Static analysis passed"
```

### 20.11.3 GitHub Actions

`.github/workflows/analyze.yml`:

```yaml
name: Static Analysis
on: [push, pull_request]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Install tools
      run: |
        sudo apt install nasm angr python3-miasm
        pip install angr
    - name: Build
      run: make
    - name: Static Analysis
      run: make analyze
```

---

## 20.12 Extending and Customizing Analysis Tools

Open-source tools can be extended for domain-specific checks.

### 20.12.1 Angr Custom Analyses

Write a plugin to detect unsafe string copies.

```python
import angr

class UnsafeStrcpyDetector(angr.Analyses.Analysis):
    def __init__(self, func_addr):
        self.func_addr = func_addr
        self.unsafe_calls = []
        self.run()

    def run(self):
        cfg = self.project.analyses.CFGFast()
        func = cfg.functions[self.func_addr]
        for block in func.blocks:
            for insn in block.capstone.insns:
                if insn.mnemonic == 'call' and 'strcpy' in insn.op_str:
                    self.unsafe_calls.append(insn.address)

# Usage
proj = angr.Project('your_binary')
unsafe = proj.analyses.UnsafeStrcpyDetector(0x401000)
print(unsafe.unsafe_calls)
```

### 20.12.2 Ghidra Scripting

Write a Ghidra script to find missing stack alignment.

```java
// FindFunctionsMissingStackAlignment.java
import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.Function;

public class FindFunctionsMissingStackAlignment extends GhidraScript {
    @Override
    public void run() throws Exception {
        for (Function func : getFunctions()) {
            if (isFunctionMissingAlignment(func)) {
                println("Function " + func.getName() + " may have stack misalignment");
            }
        }
    }

    private boolean isFunctionMissingAlignment(Function func) {
        // Heuristic: check for push without alignment
        // Implement using instruction iterator
        return false; // placeholder
    }
}
```

---

## 20.13 Combining Static and Dynamic Analysis

Static analysis finds potential bugs; dynamic analysis confirms them.

### 20.13.1 Static Analysis Guides Fuzzing

Use Angr to find unconstrained paths, then fuzz them with AFL.

```python
# Generate test cases for uncovered paths
import angr

proj = angr.Project('your_binary')
state = proj.factory.entry_state()
simgr = proj.factory.simulation_manager(state)

simgr.explore(find=lambda s: b"vulnerable" in s.posix.dumps(1))

for found in simgr.found:
    input_data = found.posix.dumps(0)
    with open(f"test_case_{len(input_data)}.bin", "wb") as f:
        f.write(input_data)
```

Then run AFL:

```bash
afl-fuzz -i test_cases -o findings -- ./your_program @@
```

### 20.13.2 Symbolic Execution + Concrete Execution

Use Angr to generate inputs, then validate with GDB.

```python
# Generate input that reaches a target
state = proj.factory.entry_state()
simgr = proj.factory.simulation_manager(state)
simgr.explore(find=0x401000)

if simgr.found:
    test_input = simgr.found[0].posix.dumps(0)
    with open("trigger.bin", "wb") as f:
        f.write(test_input)
```

Debug in GDB:

```bash
gdb ./your_program
(gdb) run < trigger.bin
(gdb) break *0x401000
```

---

## 20.14 Best Practices and Pitfalls

### 20.14.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Review Manually First**     | Human eyes catch context that tools miss.                                       |
| **Automate Repetitive Checks**| Use scripts for alignment, register preservation, lock pairing.                 |
| **Verify Binaries**           | Analyze final binaries — compiler or assembler may introduce errors.            |
| **Combine Static and Dynamic**| Use static analysis to guide testing and fuzzing.                               |
| **Customize Tools**           | Extend Angr, Ghidra, or Miasm for domain-specific rules.                        |
| **Integrate into CI/CD**      | Fail builds on critical static analysis violations.                             |
| **Document Assumptions**      | Comments help both humans and tools understand invariants.                      |
| **Profile Analysis Cost**     | Heavy symbolic execution may be slow — use selectively.                         |

### 20.14.2 Common Pitfalls

- **False Sense of Security**: Passing static analysis ≠ correctness.
- **Ignoring Warnings**: “It’s probably fine” is the first step to failure.
- **Overhead Neglect**: Symbolic execution can be computationally expensive.
- **Tool Misconfiguration**: Wrong architecture or ABI settings lead to false reports.
- **Binary Stripping**: Stripped binaries lose symbol information — harder to analyze.

> **“Static analysis is the microscope of assembly programming. It reveals the microbes of error that the naked eye cannot see.”**  
> Use it early, use it often, and never ignore its findings. What it reveals may save you from hours of debugging — or worse, a deployed catastrophe.

> **“The tool is only as good as the analyst. Automate the mechanics, but never outsource the judgment.”**  
> Tools find patterns; humans understand context. A register clobber may be intentional — but only you know if it’s safe.

---

## 20.15 Exercises

1. Perform a manual static analysis of a provided assembly function, identifying at least three violations.
2. Use `objdump` and `ndisasm` to disassemble a binary and reconstruct its control flow graph.
3. Write a Radare2 script to find all functions that do not preserve `rbx`.
4. Use Ghidra to decompile an assembly function and identify parameter mismatches.
5. Write an Angr script to find inputs that cause a buffer overflow in a provided binary.
6. Use Miasm to perform abstract interpretation and track the range of a register value.
7. Write a custom linter script that checks for missing `lock` prefixes on memory writes.
8. Analyze a stripped binary to identify function boundaries and calling conventions.
9. Write a Ghidra script to detect interrupt handlers that use floating-point instructions without saving state.
10. Integrate static analysis into a CI pipeline that fails on any use of `strcpy` in disassembled code.

---

## 20.16 Further Reading

- “Binary Analysis Cookbook” by Michael Born, Gerhard Klostermeier.
- Angr Documentation: https://docs.angr.io/
- Ghidra Documentation: https://ghidra-sre.org/
- Miasm Documentation: https://miasm.readthedocs.io/
- Radare2 Book: https://radare.gitbooks.io/radare2book/
- “Practical Binary Analysis” by Dennis Andriesse.
- “The IDA Pro Book” by Chris Eagle.
