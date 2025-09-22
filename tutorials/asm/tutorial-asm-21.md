# 21. Certification of Assembly Language Components

## 21.1 Introduction to Certification in Assembly

Certification is the formal process of verifying that a software component meets specified requirements, standards, or regulations. In safety-critical domains — aerospace, medical devices, automotive, industrial control — certification is mandatory. In general-purpose software, certification is increasingly valuable for security, reliability, and supply chain integrity.

> **“Certification is not bureaucracy — it is accountability. It transforms subjective confidence into objective evidence.”**  
> In assembly, where a single instruction can compromise an entire system, certification forces discipline: requirements traceability, structural coverage, independent verification, and configuration management.

> **“If you cannot certify it, you do not truly own it. Certification is the audit trail of engineering rigor.”**  
> Certification artifacts — test reports, analysis logs, review records — are not paperwork. They are the proof that your code behaves as intended under all specified conditions.

By the end of this chapter, you will understand:

- How to define certifiable requirements for assembly components.
- How to achieve structural coverage (statement, branch, MC/DC) in assembly.
- How to perform requirements traceability from specification to source to test.
- How to conduct independent verification and validation (IV&V).
- How to manage configuration and version control for certification.
- How to apply safety-critical certification standards (DO-178C, ISO 26262) to general-purpose software.
- How to use tools for automated certification evidence generation.
- How to prepare for third-party audits and assessments.
- How to certify open-source and third-party assembly components.
- How to integrate certification into agile and DevOps workflows.

---

## 21.2 Defining Certifiable Requirements

Certification begins with requirements — precise, testable, traceable specifications of what the assembly component must do.

### 21.2.1 Types of Requirements

- **Functional**: What the component does (e.g., “The function shall compute SHA-256 of a buffer”).
- **Performance**: Timing, throughput, resource usage (e.g., “The function shall complete in ≤100μs for 1KB input”).
- **Safety/Security**: Constraints on failure modes (e.g., “The function shall not access memory outside the input buffer”).
- **Interface**: How it interacts with other components (e.g., “The function shall conform to System V ABI”).

### 21.2.2 Writing Testable Requirements

Requirements must be verifiable — ideally, by automated tests.

Example: Poor requirement.

> “The function should be fast.”

Example: Certifiable requirement.

> “The function `sha256_hash` shall compute the SHA-256 hash of a buffer of length N bytes in O(N) time, with throughput ≥1 GB/s on Intel Core i7-1185G7.”

### 21.2.3 Requirements Traceability Matrix (RTM)

Map each requirement to design elements, source code, and test cases.

| **Requirement ID** | **Description**                          | **Source Location**      | **Test Case ID** |
| :---               | :---                                     | :---                     | :---             |
| **REQ-001**        | Compute SHA-256 of buffer                | `src/asm/sha256.asm:45`  | `TEST-001`       |
| **REQ-002**        | Validate input pointer non-null          | `src/asm/sha256.asm:50`  | `TEST-002`       |
| **REQ-003**        | Return 0 on success, -1 on error         | `src/asm/sha256.asm:120` | `TEST-003`       |

Tool: Use Excel, ReqIF, or specialized tools like Jama, DOORS, or Polarion.

---

## 21.3 Structural Coverage Analysis

Certification requires demonstrating that tests exercise all code structures.

### 21.3.1 Coverage Levels

- **Statement Coverage**: Every instruction is executed at least once.
- **Branch Coverage**: Every conditional branch (jump) is taken and not taken.
- **Modified Condition/Decision Coverage (MC/DC)**: Every condition in a decision independently affects the outcome.

MC/DC is required for the highest safety levels (e.g., DO-178C Level A).

### 21.3.2 Achieving Coverage in Assembly

Example: Branch coverage for a conditional.

```x86asm
global safe_divide
safe_divide:
    ; RDI = a, RSI = b, RDX = result ptr
    test rsi, rsi
    jz .divide_by_zero    ; Branch 1: if zero
    mov rax, rdi
    cqo
    idiv rsi
    mov [rdx], rax
    xor rax, rax
    ret
.divide_by_zero:
    mov rax, -1
    ret
```

To achieve branch coverage:

- Test case 1: `b != 0` → takes “not zero” path.
- Test case 2: `b == 0` → takes “zero” path.

### 21.3.3 MC/DC in Assembly

For complex conditions, ensure each sub-condition independently affects the outcome.

Example:

```x86asm
; if (len > 0 && ptr != 0)
    cmp rsi, 0
    jle .invalid
    test rdi, rdi
    jz .invalid
```

MC/DC requires four test cases:

1. `len > 0`, `ptr != 0` → valid.
2. `len > 0`, `ptr == 0` → invalid (proves `ptr` matters).
3. `len <= 0`, `ptr != 0` → invalid (proves `len` matters).
4. `len <= 0`, `ptr == 0` → invalid.

### 21.3.4 Coverage Tools for Assembly

- **Custom Scripts**: Parse `gcov` output from C wrappers.
- **Angr**: Symbolic execution to generate coverage-maximizing inputs.
- **LLVM-based Tools**: If assembly is compiled from LLVM IR.

Example: Angr for branch coverage.

```python
import angr

proj = angr.Project('your_binary')
state = proj.factory.entry_state()
simgr = proj.factory.simulation_manager(state)

# Explore all branches
simgr.explore()

covered_addresses = set()
for deadended in simgr.deadended:
    for addr in deadended.history.bbl_addrs:
        covered_addresses.add(addr)

# Compare with all branch targets in binary
```

---

## 21.4 Requirements Traceability

Every requirement must be linked to source code and test cases.

### 21.4.1 Source Code Annotations

Embed requirement IDs in comments.

```x86asm
; REQ-001: Compute SHA-256 of buffer
global sha256_hash
sha256_hash:
    ; REQ-002: Validate input pointer
    test rdi, rdi
    jz .error
    ; ... implementation ...
    ret
.error:
    ; REQ-003: Return -1 on error
    mov rax, -1
    ret
```

### 21.4.2 Automated Traceability

Use scripts to extract annotations and generate RTM.

Python script:

```python
import re

def extract_requirements(asm_file):
    req_map = {}
    with open(asm_file, 'r') as f:
        for line_num, line in enumerate(f, 1):
            match = re.search(r';\s*(REQ-\d+)', line)
            if match:
                req_id = match.group(1)
                if req_id not in req_map:
                    req_map[req_id] = []
                req_map[req_id].append(line_num)
    return req_map

# Generate RTM
reqs = extract_requirements('sha256.asm')
for req, lines in reqs.items():
    print(f"{req} -> lines {lines}")
```

### 21.4.3 Bidirectional Traceability

Ensure traceability from:

- Requirements → Source → Tests.
- Tests → Source → Requirements.

Tool: Use a traceability matrix in Excel or a database.

---

## 21.5 Independent Verification and Validation (IV&V)

Certification requires that verification be performed by a party independent of development.

### 21.5.1 Independence Levels

- **Tool Independence**: Use tools not developed by the same team.
- **Personnel Independence**: Separate verification team.
- **Organizational Independence**: External auditor or certification body.

### 21.5.2 IV&V Activities

- **Code Review**: Independent team reviews assembly source.
- **Test Execution**: Independent team runs test suite.
- **Static Analysis**: Independent team runs analyzers.
- **Coverage Analysis**: Independent team verifies coverage metrics.

### 21.5.3 Evidence Generation

IV&V produces artifacts:

- Review checklists and sign-offs.
- Test execution logs.
- Coverage reports.
- Static analysis outputs.

Example: Code review checklist.

| **Check Item**               | **Reviewer** | **Date**       | **Status** |
| :---                         | :---         | :---           | :---       |
| **Stack alignment verified** | J. Smith     | 2024-06-01     | Pass       |
| **Register preservation**    | J. Smith     | 2024-06-01     | Pass       |
| **No floating-point in ISR** | J. Smith     | 2024-06-01     | Pass       |

---

## 21.6 Configuration Management

Certification requires strict control over source code, tools, and environments.

### 21.6.1 Version Control

Use Git with signed commits and tags.

```bash
git tag -s v1.0-certified -m "Certified release for DO-178C Level B"
```

### 21.6.2 Tool Qualification

Tools used in certification (compilers, assemblers, analyzers) must be qualified.

- **Compiler**: GCC, Clang — use certified versions or qualify via testing.
- **Assembler**: NASM — document version and flags.
- **Analyzer**: Angr, Ghidra — validate on known test cases.

### 21.6.3 Build Reproducibility

Builds must be bit-for-bit reproducible.

- Pin tool versions.
- Use containerized builds (Docker).
- Archive build environments.

Example: Dockerfile for reproducible build.

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y nasm gcc
COPY . /src
WORKDIR /src
RUN make
```

Build:

```bash
docker build -t assembly-certified .
```

---

## 21.7 Applying Safety-Critical Standards to General Software

Standards like DO-178C and ISO 26262 provide frameworks adaptable to general software.

### 21.7.1 DO-178C Lite

Adapt DO-178C for non-avionics:

- **Level D (Minor)**: For non-safety-critical components.
  - Requirements traceability.
  - Statement coverage.
  - Peer reviews.

### 21.7.2 ISO 26262 for Software Supply Chain

Apply automotive standard to general software:

- **ASIL A (Low)**: For low-risk components.
  - Requirements management.
  - Static analysis.
  - Basic testing.

### 21.7.3 Mapping Standards to Practices

| **Standard** | **General Practice**                     | **Assembly-Specific Activity**                  |
| :---         | :---                                     | :---                                            |
| **DO-178C**  | Requirements traceability                | Annotate assembly source with REQ IDs.          |
| **ISO 26262**| Static analysis                          | Run custom linter for register preservation.    |
| **IEC 61508**| Structural coverage                      | Use Angr to achieve branch coverage.            |

---

## 21.8 Tool Support for Certification

Automate evidence generation with tools.

### 21.8.1 Test Frameworks with Coverage

Use C-based test harnesses with `gcov`.

C test:

```c
// test_sha256.c
#include <stdio.h>
#include "sha256.h"

int main() {
    unsigned char buf[32];
    int result = sha256_hash("test", 4, buf);
    printf("Result: %d\n", result);
    return 0;
}
```

Compile with coverage:

```bash
gcc -fprofile-arcs -ftest-coverage test_sha256.c sha256.o -o test
./test
gcov test_sha256.c
```

Parse output for assembly coverage (via wrapper).

### 21.8.2 Static Analysis Tools

- **Angr**: For symbolic execution and coverage.
- **Ghidra**: For decompilation and manual review.
- **Custom Scripts**: For ABI compliance, lock prefix checks.

### 21.8.3 Requirements Management Tools

- **Jama**: Commercial, supports RTM.
- **Polarion**: ALM with traceability.
- **Excel**: Simple, manual RTM.

---

## 21.9 Preparing for Audits and Assessments

Third-party assessors will review your certification artifacts.

### 21.9.1 Audit Checklist

- **Requirements**: Complete, testable, traced.
- **Design**: Documented, reviewed.
- **Source Code**: Annotated, version-controlled.
- **Tests**: Executed, results recorded, coverage met.
- **Reviews**: Checklists signed, issues resolved.
- **Tools**: Qualified, versions documented.
- **Configuration**: Reproducible builds, environment archived.

### 21.9.2 Evidence Package

Prepare a certification dossier:

1. Requirements Specification.
2. Design Description.
3. Source Code (with annotations).
4. Test Plan and Results.
5. Coverage Report.
6. Review Records.
7. Tool Qualification Reports.
8. Configuration Management Records.
9. Verification Summary.

### 21.9.3 Mock Audits

Conduct internal audits before external assessment.

- Assign independent auditor.
- Simulate assessment questions.
- Fix gaps before formal audit.

---

## 21.10 Certifying Open-Source and Third-Party Components

Open-source assembly code (e.g., from OpenSSL, Linux kernel) can be certified.

### 21.10.1 Steps for Certification

1. **Fork and Annotate**: Add requirement IDs and comments.
2. **Add Tests**: Write test harnesses to achieve coverage.
3. **Static Analysis**: Run analyzers and fix issues.
4. **Document Toolchain**: Record assembler version, flags.
5. **Generate Evidence**: Coverage reports, review logs.

### 21.10.2 Example: Certifying OpenSSL Assembly

OpenSSL contains x86-64 assembly for AES, SHA, etc.

Steps:

- Fork OpenSSL repository.
- Add `; REQ-XXX` comments to assembly files.
- Write C test harnesses for each assembly function.
- Use `gcov` via C wrappers to measure coverage.
- Perform independent code review.
- Archive toolchain (NASM version, GCC version).

### 21.10.3 Supply Chain Certification

Certify components you did not write:

- Obtain source and build scripts.
- Rebuild with your toolchain.
- Perform IV&V on rebuilt binaries.
- Generate traceability from your requirements to their source.

---

## 21.11 Integrating Certification into Agile and DevOps

Certification is compatible with modern workflows.

### 21.11.1 Agile Certification

- **Sprint 0**: Define requirements and RTM template.
- **Each Sprint**: Implement features, write tests, update RTM.
- **Sprint Review**: Independent verification of sprint output.
- **Release**: Generate certification dossier.

### 21.11.2 DevOps Automation

Integrate certification into CI/CD.

Example: GitHub Actions.

```yaml
name: Certification Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build
      run: make
    - name: Run Tests
      run: make test
    - name: Generate Coverage
      run: ./generate_coverage.sh
    - name: Static Analysis
      run: ./static_analyzer.sh
    - name: Update RTM
      run: ./update_rtm.py
    - name: Archive Evidence
      uses: actions/upload-artifact@v3
      with:
        name: certification-evidence
        path: evidence/
```

### 21.11.3 Continuous Certification

- Automate evidence generation on every commit.
- Fail build if coverage drops or static analysis finds new issues.
- Maintain living RTM in version control.

---

## 21.12 Certification of Concurrent and Interrupt-Driven Code

Concurrency and interrupts add complexity to certification.

### 21.12.1 Coverage for Concurrent Code

- **Thread interleavings**: Use ThreadSanitizer to detect races.
- **Lock states**: Model check for deadlocks.
- **Atomicity**: Verify `lock` prefixes on all RMW operations.

### 21.12.2 Interrupt Handler Certification

- **Reentrancy**: Verify no shared state without locks.
- **Execution time**: Measure worst-case interrupt latency.
- **Stack usage**: Static analysis of maximum stack depth.

Example: WCET (Worst-Case Execution Time) analysis.

```x86asm
; Measure cycles for interrupt handler
global timer_handler
timer_handler:
    rdtsc
    mov [start_tsc], rax
    ; ... handler body ...
    rdtsc
    sub rax, [start_tsc]
    mov [handler_cycles], rax
    iretq
```

### 21.12.3 Evidence for Concurrency

- Race detection reports (ThreadSanitizer).
- Model checking results (Spin, TLA+).
- Timing measurements (rdtsc, perf).

---

## 21.13 Cost, Effort, and ROI of Certification

Certification requires investment — but delivers ROI in quality and trust.

### 21.13.1 Effort Estimation

| **Activity**               | **Effort (Person-Days)** | **Notes**                                  |
| :---                       | :---                     | :---                                       |
| **Requirements Writing**   | 5–10                     | Per 1000 lines of assembly.                |
| **Test Development**       | 10–20                    | To achieve MC/DC coverage.                 |
| **Static Analysis**        | 5–10                     | Tool setup and review.                     |
| **IV&V**                   | 10–15                    | Independent review and testing.            |
| **Documentation**          | 5–10                     | RTM, tool qualification, summary reports.  |

### 21.13.2 Return on Investment

- **Reduced Field Failures**: Fewer bugs in production.
- **Faster Debugging**: Traceability accelerates root cause analysis.
- **Customer Trust**: Certification as a market differentiator.
- **Regulatory Compliance**: Avoid fines or recalls.

> **“Certification is not a cost center — it is a quality multiplier. The effort invested in certification pays dividends in reliability, maintainability, and customer confidence.”**  
> In assembly, where bugs are expensive and hard to fix, certification is not optional — it is essential engineering hygiene.

> **“The certified component is not the one with the most features — it is the one with the most evidence.”**  
> Certification shifts focus from “does it work?” to “how do we know it works?”. That shift is the foundation of trustworthy systems.

---

## 21.14 Best Practices and Pitfalls

### 21.14.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Start Early**               | Define requirements and RTM at project start — not at the end.                  |
| **Automate Evidence**         | Use scripts and CI/CD to generate coverage, static analysis, RTM updates.       |
| **Independent Review**        | Never self-certify — use separate team or external auditor.                     |
| **Version Everything**        | Source, tools, tests, environment — all under version control.                  |
| **Certify Third-Party Code**  | Don’t assume open-source is safe — certify it yourself.                         |
| **Measure WCET**              | For real-time systems, worst-case timing is a certifiable requirement.          |
| **Archive Builds**            | Keep bit-for-bit reproducible builds for audit.                                 |
| **Train Your Team**           | Certification is a skill — invest in training and templates.                    |

### 21.14.2 Common Pitfalls

- **Late Start**: Trying to retrofit certification after code is written.
- **Incomplete Traceability**: Missing links between tests and requirements.
- **Tool Misqualification**: Using unqualified tools without compensating tests.
- **Coverage Gaps**: Assuming branch coverage is sufficient for safety-critical code.
- **Ignoring Concurrency**: Failing to certify thread safety and interrupt handling.

---

## 21.15 Exercises

1. Write a requirements specification for an assembly function that computes CRC32.
2. Create a Requirements Traceability Matrix (RTM) linking requirements to source lines and test cases.
3. Use Angr to achieve 100% branch coverage for a provided assembly function.
4. Perform MC/DC analysis on a complex conditional in assembly and write test cases to satisfy it.
5. Set up a Docker container for reproducible assembly builds.
6. Write a static analysis script that checks for missing `lock` prefixes in assembly source.
7. Conduct a mock IV&V review of a peer’s assembly code using a checklist.
8. Certify an open-source assembly function (e.g., from OpenSSL) by adding requirements, tests, and coverage.
9. Integrate certification evidence generation into a GitHub Actions CI pipeline.
10. Measure the worst-case execution time (WCET) of an interrupt handler using `rdtsc`.

---

## 21.16 Further Reading

- RTCA DO-178C: “Software Considerations in Airborne Systems and Equipment Certification”.
- ISO 26262: “Road Vehicles — Functional Safety”.
- IEC 61508: “Functional Safety of Electrical/Electronic/Programmable Electronic Safety-related Systems”.
- “Certification of Critical Software: A Practitioner’s Guide” by John Knight.
- Angr Documentation: https://docs.angr.io/
- “Building Secure and Reliable Systems” by Google.
- “The Clean Coder” by Robert C. Martin (for professional ethics in certification).

