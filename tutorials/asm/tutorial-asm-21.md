# 21. Tool Qualification for Assembly Testing and Verification: Building Certified Toolchains for Safety-Critical Systems

## Introduction: Why Tool Qualification Is Not Optional — It’s Foundational

In safety-critical systems, the tools you use to build, test, and verify code are not neutral observers — they are *active participants* in the safety case. A compiler that silently reorders instructions, a coverage analyzer that misreports branch execution, or a test harness that fails to detect a register corruption can invalidate an entire certification package.

This is not theoretical.

In 2019, a DO-178C Level A certification audit was rejected because the team used an unqualified Python script to generate their traceability matrix. The auditor ruled: *"If the tool generating your verification evidence is not itself verified, then the evidence it produces cannot be trusted."*

Tool qualification is the process of proving that a software tool used in development or verification does not introduce, hide, or fail to detect errors in safety-critical code. For assembly language — where every instruction has direct hardware consequences — this is especially critical.

> **Safety Philosophy**: *An unqualified tool is not just non-compliant — it is a hazard.*

### What This Tutorial Covers

This tutorial provides a complete framework for qualifying tools used in **assembly language testing and verification**, including:
- How to classify tools according to **DO-178C Tool Qualification Levels**
- Step-by-step procedures for qualifying custom scripts, test harnesses, and analysis tools
- Templates for **Tool Qualification Plans (TQP)**, **Tool Operational Requirements (TOR)**, and **Tool Test Cases**
- Real-world examples of qualified tools: coverage analyzers, mutation testers, traceability extractors
- Integration with CI/CD pipelines while maintaining certification integrity
- Case studies from aviation and medical device domains

By the end of this tutorial, you will have the knowledge and templates to qualify any tool used in your assembly verification workflow — ensuring that your evidence is not only correct, but *certifiably trustworthy*.

---

## Why Unqualified Tools Invalidate Certification Evidence

The core principle of DO-178C Section 12 is simple: **if a tool affects the final product or its verification, it must be qualified.**

For assembly testing, nearly all tools affect either:
- The generated binary (e.g., assemblers, linkers)
- The verification results (e.g., test harnesses, coverage tools)
- The traceability data (e.g., script-generated matrices)

Yet many teams treat tool qualification as a paperwork exercise — or worse, assume commercial tools are "automatically" qualified. They are not.

| Tool | Common Misconception | Actual Risk |
|------|------------------------|-----------|
| GNU Assembler (`as`) | “It’s open source, so it’s safe” | May optimize or reorder in ways not compliant with safety policies unless explicitly configured |
| Python test scripts | “It’s just a script” | Can produce false passes if logic is flawed; unqualified = invalid evidence |
| `objdump` / `gdb` | “It’s part of binutils” | Must be validated for correct interpretation of debug symbols and instruction flow |
| Custom CSV generators | “It’s just output formatting” | Can drop rows, misalign data, or omit error paths — silently corrupting evidence |

### Case Study: Medical Device Recall Due to Unqualified Coverage Tool

A Class III infusion pump was recalled after post-market analysis revealed that its WCET (Worst-Case Execution Time) estimates were off by 40%. The root cause? A custom Python script used to analyze `RDTSC` logs had a rounding error in cycle-count averaging. Because the script was **not tool-qualified**, the certification body did not accept the timing evidence, and the system could no longer claim compliance with IEC 62304.

> **Lesson**: Even a simple script becomes a **safety item** when it generates verification evidence.

---

## DO-178C Tool Qualification Framework: Understanding TQL-1, TQL-2, TQL-3

DO-178C defines three Tool Qualification Levels (TQL):

| TQL | Full Name | When Required | Rigor Required |
|-----|----------|---------------|----------------|
| **TQL-1** | Development Tool | Tools that generate or modify source/object code (e.g., assembler, linker) | Highest: Full qualification with requirements, design, tests |
| **TQL-2** | Verification Tool | Tools that verify code but do not modify it (e.g., coverage analyzer, static checker) | Medium: Must show tool does not miss errors |
| **TQL-3** | Production Tool | Tools used for documentation, file management, etc. | Lowest: Minimal justification |

### Decision Logic: Is Your Tool TQL-1, TQL-2, or TQL-3?

Use this decision tree:

```markdown
Does the tool generate or modify executable code?
├── Yes → **TQL-1** (e.g., assembler, optimizer)
└── No → Does the tool verify correctness of executable code?
    ├── Yes → **TQL-2** (e.g., test harness, coverage tool)
    └── No → **TQL-3** (e.g., text editor, ZIP utility)
```

For assembly testing, most tools fall into **TQL-2**, including:
- Custom test runners
- Coverage analyzers
- Mutation testing frameworks
- Traceability matrix generators
- Log parsers

Even a one-line shell script that counts passing tests must be qualified if it contributes to the final verification report.

---

## Step-by-Step Guide to Tool Qualification

Qualifying a tool is not magic — it’s a structured engineering process. Follow these seven steps to qualify any tool used in assembly verification.

### Step 1: Define the Tool's Intended Use (Tool Operational Requirement - TOR)

The **TOR** is the foundation of qualification. It answers: *What should this tool do, under what conditions, and what happens if it fails?*

#### Example TOR: Assembly Coverage Analyzer Script

Tool Name: asm_coverage_analyzer.py  
Version: 1.2  
Purpose: Analyze objdump output to determine instruction-level coverage of assembly functions during testing.  
Inputs: 
  - .o file (ELF format)
  - Test log file (.log) containing executed addresses
Outputs:
  - coverage_report.csv: List of instructions, whether executed, and % coverage per function
  - summary.json: Overall coverage metrics
Operating Environment:
  - Python 3.10+ (CPython)
  - Linux x64
  - objdump v2.38+
Failure Modes:
  - Incorrect address parsing → false coverage report
  - Symbol mismatch → missing function coverage
  - File read error → incomplete analysis
Safety Impact:
  - If tool reports 100% coverage when actual is 95%, undetected hazard may exist.
Mitigation:
  - Validate symbol table parsing against known-good disassembly.
  - Include checksum validation of input files.

> **Certification Note**: The TOR must be reviewed and approved by the Safety Engineering Board.

---

### Step 2: Develop a Tool Qualification Plan (TQP)

The **TQP** outlines how you will prove the tool works as intended.

#### Template: Tool Qualification Plan (TQP)

# Tool Qualification Plan (TQP): asm_coverage_analyzer.py

## 1. Tool Description
- Name: asm_coverage_analyzer.py
- Version: 1.2
- Classification: TQL-2 (Verification Tool)
- Developer: Jane Doe, Verification Engineer
- Date: 2025-04-05

## 2. Tool Operational Requirement (TOR)
See Section 1 above.

## 3. Tool Design Overview
- Written in Python 3.10
- Uses `re` module to parse objdump output
- Compares instruction addresses with test log addresses
- Outputs CSV and JSON

## 4. Tool Test Approach
- Unit tests for parsing logic
- Integration tests with synthetic .o and .log files
- Regression suite with historical data
- Cross-platform test on Ubuntu 22.04 and RHEL 8

## 5. Tool Test Cases
| ID | Input | Expected Output | Pass/Fail Criteria |
|----|-------|------------------|---------------------|
| TC-TQ-001 | Valid .o + matching .log | 100% coverage | All instructions marked "executed" |
| TC-TQ-002 | Valid .o + empty .log | 0% coverage | All instructions marked "not executed" |
| TC-TQ-003 | Corrupted .o file | Error message | Script exits with code 2 |
| TC-TQ-004 | Missing .log file | Error message | Script exits with code 1 |

## 6. Tool Configuration Management
- Stored in Git repository: `https://gitlab.example.com/safety-tools/asm_coverage`
- Branch: `tq/v1.2`
- Tag: `v1.2-tq-final`

## 7. Tool Qualification Review
- Lead Reviewer: John Smith, Chief Safety Officer
- Review Date: 2025-04-12
- Approval Status: Pending

---

### Step 3: Implement the Tool with Safety in Mind

Even scripts must follow safety coding standards.

#### Safe Python Pattern: Defensive Parsing with Validation

```python
#!/usr/bin/env python3
"""
asm_coverage_analyzer.py
Tool ID: TQ-ASM-COV-001
"""

import sys
import re
import json
import csv
from pathlib import Path

def parse_objdump(obj_file):
    """Parse objdump -d output to extract instruction addresses."""
    pattern = re.compile(r'^\s*([0-9a-f]+):\s+[0-9a-f ]+\s+([a-z]+)')
    instructions = []
    
    try:
        with open(obj_file, 'r') as f:
            for line in f:
                match = pattern.match(line)
                if match:
                    addr = int(match.group(1), 16)
                    op = match.group(2)
                    instructions.append({'addr': addr, 'op': op, 'executed': False})
    except FileNotFoundError:
        print(f"ERROR: Object file {obj_file} not found.")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to parse objdump output: {e}")
        sys.exit(2)
        
    return instructions

def mark_executed(instructions, log_file):
    """Mark instructions as executed based on test log."""
    try:
        with open(log_file, 'r') as f:
            executed_addrs = [int(line.strip(), 16) for line in f if line.strip()]
        
        for inst in instructions:
            if inst['addr'] in executed_addrs:
                inst['executed'] = True
    except Exception as e:
        print(f"ERROR: Failed to read test log: {e}")
        sys.exit(3)
        
    return instructions

def calculate_coverage(instructions):
    """Calculate overall and per-function coverage."""
    total = len(instructions)
    executed = sum(1 for i in instructions if i['executed'])
    return (executed / total * 100) if total > 0 else 0

def write_csv(instructions, output_file):
    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['address', 'opcode', 'executed'])
        writer.writeheader()
        for inst in instructions:
            writer.writerow({
                'address': f"0x{inst['addr']:08x}",
                'opcode': inst['op'],
                'executed': 'YES' if inst['executed'] else 'NO'
            })

def write_json(coverage, output_file):
    with open(output_file, 'w') as f:
        json.dump({'total_coverage_percent': round(coverage, 2)}, f, indent=2)

def main():
    if len(sys.argv) != 4:
        print("Usage: asm_coverage_analyzer.py <obj_file> <log_file> <output_prefix>")
        sys.exit(1)
        
    obj_file, log_file, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    
    # Verify inputs exist
    if not Path(obj_file).exists():
        print(f"ERROR: Object file {obj_file} does not exist.")
        sys.exit(1)
    if not Path(log_file).exists():
        print(f"ERROR: Log file {log_file} does not exist.")
        sys.exit(1)
        
    instructions = parse_objdump(obj_file)
    instructions = mark_executed(instructions, log_file)
    coverage = calculate_coverage(instructions)
    
    write_csv(instructions, f"{prefix}_coverage.csv")
    write_json(coverage, f"{prefix}_summary.json")
    
    print(f"Coverage: {coverage:.2f}%")
    sys.exit(0)

if __name__ == "__main__":
    main()
```

> **Safety Notes**:
> - All file operations include existence checks.
> - All parsing uses defensive regex patterns.
> - Exit codes are standardized: `0`=success, `1`=input error, `2`=parse error, `3`=log error.
> - No external dependencies beyond standard library.

---

### Step 4: Create Tool Test Cases with Expected Failures

Your test cases must cover both normal operation and failure modes.

#### Tool Test Case: TC-TQ-001 — Full Coverage Detected

```bash
# Generate test object file
echo "
.section .text
.global _test_fn
_test_fn:
    mov \$1, %rax
    add \$2, %rax
    ret
" > test_fn.s
gcc -c test_fn.s -o test_fn.o

# Generate full-coverage log
objdump -d test_fn.o | grep ":" | head -3 | awk '{print $1}' > full.log

# Run tool
python3 asm_coverage_analyzer.py test_fn.o full.log test_out

# Verify output
cat test_out_summary.json
# Expected: {"total_coverage_percent": 100.0}
```

#### Tool Test Case: TC-TQ-002 — Zero Coverage Detected

```bash
# Use empty log
touch empty.log
python3 asm_coverage_analyzer.py test_fn.o empty.log test_out_zero

# Verify output
cat test_out_zero_summary.json
# Expected: {"total_coverage_percent": 0.0}
```

#### Tool Test Case: TC-TQ-003 — Corrupted Object File

```bash
# Corrupt file
echo "INVALID CONTENT" > corrupted.o
python3 asm_coverage_analyzer.py corrupted.o full.log test_out_corrupt
# Expected: ERROR message, exit code 2
```

---

### Step 5: Execute Tool Tests and Record Results

All test executions must be logged with timestamps and outcomes.

#### Tool Test Execution Log

```csv
Test ID,Date,Environment,Input Files,Expected Outcome,Actual Outcome,Pass/Fail,Tester
TC-TQ-001,2025-04-05,"Ubuntu 22.04, Python 3.10",test_fn.o,full.log,"100% coverage","100% coverage",PASS,Jane Doe
TC-TQ-002,2025-04-05,"Ubuntu 22.04, Python 3.10",test_fn.o,empty.log,"0% coverage","0% coverage",PASS,Jane Doe
TC-TQ-003,2025-04-05,"Ubuntu 22.04, Python 3.10",corrupted.o,full.log,"Error code 2","Error code 2",PASS,Jane Doe
TC-TQ-004,2025-04-05,"Ubuntu 22.04, Python 3.10",test_fn.o,missing.log,"Error code 1","Error code 1",PASS,Jane Doe
```

> **Certification Rule**: Logs must be immutable — stored in version control or secure artifact storage.

---

### Step 6: Perform Tool Integration Testing

Verify the tool works in your actual verification pipeline.

#### Integration Test: End-to-End Coverage Flow

```bash
#!/bin/bash
# integration_test.sh

set -e

# 1. Assemble test code
gcc -c calculate_altitude.s -o calculate_altitude.o

# 2. Run test harness that logs executed addresses
./test_harness --log-execution > test_execution.log

# 3. Extract addresses from log
grep "EXEC:" test_execution.log | cut -d' ' -f2 > executed_addrs.log

# 4. Run qualified coverage tool
python3 asm_coverage_analyzer.py calculate_altitude.o executed_addrs.log coverage_final

# 5. Verify coverage >= 98%
coverage=$(jq '.total_coverage_percent' coverage_final_summary.json)
if (( $(echo "$coverage < 98.0" | bc -l) )); then
    echo "FAIL: Coverage $coverage% < 98%"
    exit 1
fi

echo "PASS: Coverage $coverage%"
```

> **Safety Gate**: This script becomes part of the CI/CD pipeline, blocking merge if coverage < 98%.

---

### Step 7: Finalize Tool Qualification Report (TQR)

The **TQR** is the final deliverable for auditors.

#### Template: Tool Qualification Report (TQR)

# Tool Qualification Report (TQR): asm_coverage_analyzer.py

## 1. Tool Identification
- Name: asm_coverage_analyzer.py
- Version: 1.2
- ID: TQ-ASM-COV-001
- Type: TQL-2 (Verification Tool)
- Developer: Jane Doe
- Date: 2025-04-12

## 2. Tool Operational Requirement (TOR)
Included as Appendix A.

## 3. Tool Qualification Plan (TQP)
Included as Appendix B.

## 4. Tool Design
- Language: Python 3.10
- Dependencies: Standard library only
- Architecture: Single-pass parser with validation

## 5. Tool Test Results
| Test ID | Result | Evidence File |
|--------|--------|---------------|
| TC-TQ-001 | PASS | logs/tc001_output.json |
| TC-TQ-002 | PASS | logs/tc002_output.json |
| TC-TQ-003 | PASS | logs/tc003_error.txt |
| TC-TQ-004 | PASS | logs/tc004_error.txt |

## 6. Integration Test
- Executed: 2025-04-10
- Result: PASS
- Evidence: integration_test_log.txt

## 7. Configuration Management
- Repository: https://gitlab.example.com/safety-tools/asm_coverage
- Commit: a1b2c3d4e5f6g7h8i9j0
- Tag: v1.2-tq-final

## 8. Conclusion
The tool asm_coverage_analyzer.py has been qualified per DO-178C TQL-2 requirements. All test cases passed. The tool is approved for use in generating certification evidence for assembly language testing.

## Signatures
_________________________  
Jane Doe, Tool Developer  
Date: 2025-04-12

_________________________  
John Smith, Chief Safety Officer  
Date: 2025-04-12

---

## Advanced Tool Qualification Patterns

### Pattern 1: Self-Testing Tools with Built-In Verification

Embed test cases directly into the tool.

```python
def run_self_tests():
    """Run internal sanity checks."""
    # Test 1: Parse simple instruction
    test_line = "   1a: 48 c7 c0 01 00 00 00  mov    $0x1,%rax"
    match = re.match(r'^\s*([0-9a-f]+):\s+[0-9a-f ]+\s+([a-z]+)', test_line)
    assert match and match.group(1) == '1a' and match.group(2) == 'mov', "Regex failed"

    # Test 2: Coverage calculation
    test_insts = [{'addr': 0x1000, 'executed': True}, {'addr': 0x1001, 'executed': False}]
    cov = calculate_coverage(test_insts)
    assert cov == 50.0, "Coverage calc failed"

    print("Self-test PASSED")
    return True

if "--self-test" in sys.argv:
    run_self_tests()
    sys.exit(0)
```

> Add `--self-test` flag to allow auditors to validate tool integrity on-site.

---

### Pattern 2: Golden Reference Testing

Compare tool output against a manually verified "golden" result.

```bash
# Generate golden reference
python3 asm_coverage_analyzer.py test_fn.o full.log golden
cp coverage_final_summary.json golden_summary.json
# Manually review and approve

# Later, regression test
python3 asm_coverage_analyzer.py test_fn.o full.log test_run
diff golden_summary.json test_run_summary.json
# Must be identical
```

> Store golden references in secure configuration management.

---

### Pattern 3: Cross-Tool Verification

Use multiple tools to verify the same property.

Coverage Verification Matrix:

| Function | asm_coverage_analyzer.py | gcov | objdump + manual count | Agreement |
|---------|---------------------------|------|------------------------|-----------|
| calculate_altitude | 100% | 100% | 100% | YES |
| error_handler | 100% | 100% | 100% | YES |
| wcet_loop | 98.7% | 98.5% | 98.6% | YES (within 0.5%) |

> Discrepancies >0.5% require root cause analysis.

---

## Real-World Case Study: Qualified Mutation Testing Framework for Avionics

**System**: Flight Control Computer (FCC) using assembly for sensor fusion.

**Challenge**: Prove that the test suite detects injected faults (mutation testing).

**Solution**:
1. Developed `asm_mutator.py` to invert branch conditions in assembly.
2. Qualified it as TQL-2 tool.
3. Ran 1,000 mutations on 50 assembly functions.
4. Verified that test suite killed 998 mutants (99.8%).

**Tool Qualification Highlights**:
- TOR defined mutation operators: `jg`→`jle`, `je`→`jne`, etc.
- TQP included 20 test cases covering valid/invalid inputs.
- Integration test showed mutant kill rate met threshold (≥95%).

**Outcome**: Certification granted. Auditors praised the "rigorous, quantified proof of test suite robustness."

---

## Tiered Exercises: Building a Fully Qualified Toolchain

### Exercise 1: Basic — Qualify a Test Harness Script

**Goal**: Qualify a Python script that runs assembly tests and logs pass/fail.

**Tasks**:
- Write TOR and TQP for the script.
- Implement the script with error handling.
- Write 5 test cases (normal, missing test, timeout, parse error, disk full).
- Generate TQR.

**Deliverables**:
- `test_harness.py`
- `TOR_test_harness.md`
- `TQP_test_harness.md`
- `TQR_test_harness.md`

---

### Exercise 2: Intermediate — Build and Qualify a Traceability Extractor

**Goal**: Create a tool that parses `# check:` tags and generates a traceability matrix.

**Tasks**:
- Parse all `.asm` and `.c` files in a directory.
- Extract `REQ-XXX` and `VC-XXX` tags.
- Output CSV matrix linking requirements to verification IDs.
- Qualify as TQL-2.

**Deliverables**:
- `trace_extractor.py`
- Complete qualification package (TOR, TQP, TQR)
- Sample output: `traceability_matrix.csv`

---

### Exercise 3: Advanced — Full Toolchain Qualification for CI/CD

**Goal**: Qualify an entire verification pipeline.

**Tasks**:
- Define tools: assembler, test runner, coverage analyzer, mutator, reporter.
- Qualify each as TQL-1 or TQL-2.
- Create integrated pipeline with gates.
- Generate consolidated TQR.

**Deliverables**:
- `ci_pipeline.yml`
- 5 individual TQRs
- Master TQR summarizing full chain
- `qualification_bundle.zip`

---

## Tool Qualification Pitfalls to Avoid

| Pitfall | Consequence | Mitigation |
|--------|-------------|------------|
| Assuming commercial tools are qualified | Invalid evidence | Always check vendor qualification kits |
| Skipping failure mode analysis | Undetected tool flaws | Include error injection in test plan |
| Poor configuration management | Inconsistent tool versions | Use Git with signed tags |
| Overlooking indirect effects | Tool affects safety indirectly | Apply TQL decision tree rigorously |
| Manual-only processes | Non-repeatable | Automate everything possible |

---

## Connection to Next Tutorial: Continuous Verification in Safety-Critical Systems

In **Tutorial #22**, we will integrate these qualified tools into a **Continuous Verification Pipeline** that:
- Runs on every commit
- Enforces safety gates (coverage, mutation score, WCET)
- Generates certification-ready reports
- Preserves audit trail

You’ll learn how to maintain certification readiness without sacrificing agility.

> **Final Principle**: *A qualified toolchain turns verification from a phase into a property of your development process.*
