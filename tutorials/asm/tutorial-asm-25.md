# 25. Safety-Critical System Diagnostics and Forensics: Transforming Runtime Data into Actionable Safety Insights

## Introduction: Why Diagnostics Are Not Optional — They're Foundational to Safety

In safety-critical systems, **understanding what happened during an incident is as important as preventing it**. When a medical device malfunctions, an aircraft experiences an anomaly, or an autonomous vehicle encounters an unexpected situation, the ability to reconstruct events with precision becomes a matter of life and death.

Traditional diagnostic approaches treat incident analysis as a post-mortem activity — something to be done only after failure occurs. In safety-critical systems, this is dangerously inadequate. Diagnostic capabilities must be designed from the outset as an **integral part of the safety architecture**, transforming runtime data into actionable insights that:
- Enable rapid root cause determination
- Support regulatory reporting requirements
- Inform future safety improvements
- Provide evidence for certification maintenance
- Help prevent recurrence of safety issues

> **Safety Philosophy**: *If you cannot prove what happened during a safety event, then you cannot prove your system is safe.*

This tutorial provides a complete framework for implementing safety-critical diagnostics and forensics capabilities — with special emphasis on how to transform runtime monitoring data into certification-grade evidence. You will learn how to:
- Design non-volatile event logging that survives system failures
- Implement crash dump analysis for assembly-level diagnostics
- Perform root cause determination with forensic precision
- Generate audit-ready diagnostic evidence for certification bodies
- Integrate diagnostics into your continuous verification pipeline

By the end of this tutorial, your system will not only detect safety issues — it will provide the evidence needed to understand them, correct them, and prove they've been corrected.

---

## Why Traditional Diagnostic Approaches Fail in Safety-Critical Contexts

Many embedded systems use simplistic diagnostic mechanisms that were designed for debugging rather than certification compliance. Their fundamental assumptions create significant risks when applied to safety-critical systems.

| Problem (Traditional Approach) | Consequence in Safety-Critical Systems |
|-------------------------------|----------------------------------------|
| Volatile logs that disappear on reset | Lost evidence of safety events |
| Incomplete event data | Inability to determine root cause |
| No timestamp precision | Inability to reconstruct event sequences |
| Unverified diagnostic code | Diagnostic evidence is invalid |
| No traceability to requirements | Evidence rejected by certification bodies |
| Manual analysis processes | Inconsistent, non-reproducible results |
| No anti-tampering measures | Risk of evidence corruption |

### Case Study: Medical Device Recall Due to Inadequate Diagnostics

A Class III infusion pump experienced intermittent failures that caused incorrect dosage delivery. The device had basic logging capabilities, but the logs were stored in volatile memory and overwritten during normal operation. When the failures occurred, no diagnostic evidence remained. The manufacturer had to issue a recall after the FDA determined that the system lacked sufficient diagnostic capabilities to investigate the issue.

> **Lesson**: Diagnostic capabilities must be designed as a safety feature — with the same rigor as the safety functions themselves.

---

## The Diagnostics and Forensics Philosophy for Safety-Critical Systems

Diagnostics and forensics transform your system from a black box into a transparent safety instrument. They ensure that when anomalies occur, you have the evidence needed to understand what happened and why.

### Core Principles of Safety-Critical Diagnostics

1. **Non-Volatility**: All critical diagnostic data must survive system resets and power loss.
2. **Completeness**: Logs must capture all data necessary for root cause determination.
3. **Tamper Resistance**: Diagnostic evidence must be protected from modification or deletion.
4. **Traceability**: Diagnostic data must be directly traceable to safety requirements.
5. **Verified Collection**: The diagnostic collection process itself must be certified.
6. **Actionable Insights**: Diagnostics must produce evidence that directly informs safety improvements.

> **Core Tenet**: *Your diagnostic system must be as safety-critical as the system it monitors.*

---

## Designing a Non-Volatile Event Logging System

A robust non-volatile event logging system is the foundation of safety-critical diagnostics.

### Safe Pattern: Non-Volatile Circular Buffer Implementation

```c
/*
 * # Summary: Non-volatile circular event buffer
 * # Requirement: REQ-LOG-001
 * # Verification: VC-LOG-001
 * # Test: TEST-LOG-001
 *
 * Event Logging Considerations:
 *
 * 1. Safety Rules:
 *    - Verified non-volatile storage
 *    - Complete event capture
 *    - Tamper-resistant design
 *
 * 2. Safety Verification:
 *    - Logging behavior verified
 *    - No unverified logging operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <string.h>

// Constants for event buffer
#define EVENT_BUFFER_SIZE 1024
#define EVENT_HEADER_SIZE 16
#define MAX_EVENT_DATA_SIZE 48

// Event types
typedef enum {
    EVENT_SYSTEM_START = 0x0001,
    EVENT_SAFETY_WARNING = 0x0002,
    EVENT_SAFETY_DEGRADED = 0x0003,
    EVENT_SAFETY_SHUTDOWN = 0x0004,
    EVENT_MEMORY_CORRUPTION = 0x0101,
    EVENT_TIMING_VIOLATION = 0x0102,
    EVENT_CONTROL_INCONSISTENCY = 0x0103
} event_type_t;

// Event record structure
typedef struct {
    uint32_t magic;           // Magic number for integrity check
    uint32_t sequence;        // Sequence number
    uint32_t timestamp;       // Timestamp (microseconds)
    uint16_t type;            // Event type
    uint16_t size;            // Size of data (including header)
    uint8_t data[MAX_EVENT_DATA_SIZE]; // Event-specific data
    uint32_t crc32;           // CRC-32 for integrity
} event_record_t;

// Event buffer structure (stored in non-volatile memory)
typedef struct {
    uint32_t magic;           // Magic number (0x5A5A5A5A)
    uint32_t version;         // Version number
    uint32_t head;            // Head index
    uint32_t tail;            // Tail index
    event_record_t events[EVENT_BUFFER_SIZE];
} event_buffer_t;

// Non-volatile memory address (must be mapped to actual hardware)
#define EVENT_BUFFER_ADDR 0x1000_0000
#define EVENT_BUFFER ((event_buffer_t*)EVENT_BUFFER_ADDR)

/*# check: REQ-LOG-002
  # check: VC-LOG-002
  Initialize event buffer */
void init_event_buffer() {
    /* Safety Rationale: Establish valid buffer state
     * Failure Mode: None (safe operation)
     * Logging Behavior: Initialization
     * Interface Safety: Memory access */
    
    // Clear buffer (except magic/version)
    memset(&EVENT_BUFFER->head, 0, sizeof(event_buffer_t) - offsetof(event_buffer_t, head));
    
    // Set magic number and version
    EVENT_BUFFER->magic = 0x5A5A5A5A;
    EVENT_BUFFER->version = 1;
}

/*# check: REQ-LOG-003
  # check: VC-LOG-003
  Calculate CRC-32 for event */
uint32_t calculate_event_crc(const event_record_t* event) {
    /* Safety Rationale: Ensure event integrity
     * Failure Mode: None (safe operation)
     * Logging Behavior: Integrity check
     * Interface Safety: Data processing */
    
    // Implementation of CRC-32 calculation
    // ...
    return 0; // Placeholder
}

/*# check: REQ-LOG-004
  # check: VC-LOG-004
  Verify event integrity */
int verify_event_integrity(const event_record_t* event) {
    /* Safety Rationale: Detect corrupted events
     * Failure Mode: Return 0 if invalid
     * Logging Behavior: Integrity verification
     * Interface Safety: Data validation */
    
    // Check magic number
    if (event->magic != 0xDEADBEEF) {
        return 0;
    }
    
    // Verify CRC
    if (calculate_event_crc(event) != event->crc32) {
        return 0;
    }
    
    return 1;
}

/*# check: REQ-LOG-005
  # check: VC-LOG-005
  Add event to buffer */
void add_event(event_type_t type, const void* data, uint16_t size) {
    /* Safety Rationale: Record safety-critical events
     * Failure Mode: None (safe operation)
     * Logging Behavior: Event recording
     * Interface Safety: Memory management */
    
    // Validate size
    if (size > MAX_EVENT_DATA_SIZE) {
        size = MAX_EVENT_DATA_SIZE;
    }
    
    // Get next available slot
    uint32_t next_head = (EVENT_BUFFER->head + 1) % EVENT_BUFFER_SIZE;
    
    // Prepare event record
    event_record_t* event = &EVENT_BUFFER->events[EVENT_BUFFER->head];
    event->magic = 0xDEADBEEF;
    event->sequence = EVENT_BUFFER->head;
    event->timestamp = get_microsecond_timestamp();
    event->type = type;
    event->size = EVENT_HEADER_SIZE + size;
    memcpy(event->data, data, size);
    
    // Calculate CRC
    event->crc32 = calculate_event_crc(event);
    
    // Update head (atomic operation required in real implementation)
    EVENT_BUFFER->head = next_head;
    
    // If buffer full, advance tail
    if (next_head == EVENT_BUFFER->tail) {
        EVENT_BUFFER->tail = (EVENT_BUFFER->tail + 1) % EVENT_BUFFER_SIZE;
    }
}

/*# check: REQ-LOG-006
  # check: VC-LOG-006
  Get next event for analysis */
int get_next_event(uint32_t* index, event_record_t* out_event) {
    /* Safety Rationale: Retrieve events for analysis
     * Failure Mode: Return 0 if no events
     * Logging Behavior: Event retrieval
     * Interface Safety: Data access */
    
    if (EVENT_BUFFER->tail == EVENT_BUFFER->head) {
        return 0; // No events
    }
    
    // Copy event to output
    *out_event = EVENT_BUFFER->events[EVENT_BUFFER->tail];
    
    // Verify integrity
    if (!verify_event_integrity(out_event)) {
        return -1; // Corrupted event
    }
    
    // Update tail (atomic operation required)
    *index = EVENT_BUFFER->tail;
    EVENT_BUFFER->tail = (EVENT_BUFFER->tail + 1) % EVENT_BUFFER_SIZE;
    
    return 1; // Success
}
```

> **Key Safety Features**:
> - Magic numbers prevent misinterpretation of random memory
> - CRC ensures event integrity
> - Circular buffer prevents overflow while maintaining recent history
> - All operations verified for safety properties

---

## Implementing Crash Dump Analysis for Assembly-Level Diagnostics

When a critical failure occurs, the ability to capture and analyze the system state is essential for root cause determination.

### Safe Pattern: Crash Dump Handler with Assembly Integration

```asm
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;# Summary: Crash dump handler for safety-critical systems
;# Requirement: REQ-DUMP-001
;# Verification: VC-DUMP-001 
;# Test: TEST-DUMP-001
;#
;# Crash Dump Considerations:
;#
;# 1. Safety Rules:
;#    - Verified crash dump generation
;#    - Complete state capture
;#    - Tamper-resistant storage
;#
;# 2. Safety Verification:
;#    - Dump behavior verified
;#    - No unverified dump operations
;#    - Safety properties maintained
;#
;# Tool: GNU Assembler 2.38 (qualified)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

.section .text
.global crash_dump_handler
.type crash_dump_handler, @function

; Crash reason codes
CRASH_UNDEFINED = 0
CRASH_MEMORY = 1
CRASH_BUS = 2
CRASH_USAGE = 3
CRASH_SAFETY = 4

; Memory regions for crash dump
CRASH_DUMP_BASE = 0x2000_1000
CRASH_DUMP_SIZE = 0x1000

; Register save offsets
REG_SAVE_R0 = 0
REG_SAVE_R1 = 4
REG_SAVE_R2 = 8
REG_SAVE_R3 = 12
REG_SAVE_R12 = 48
REG_SAVE_LR = 52
REG_SAVE_PC = 56
REG_SAVE_PSR = 60
REG_SAVE_SP = 64

crash_dump_handler:
    ;# check: REQ-DUMP-002
    ;# check: VC-DUMP-002
    ; Save current stack pointer
    mov %rsp, %r11
    
    ;# check: REQ-DUMP-003
    ;# check: VC-DUMP-003
    ; Switch to dedicated crash stack
    mov $CRASH_DUMP_BASE, %rsp
    
    ;# check: REQ-DUMP-004
    ;# check: VC-DUMP-004
    ; Save general purpose registers
    str %r0, [crash_dump_regs + REG_SAVE_R0]
    str %r1, [crash_dump_regs + REG_SAVE_R1]
    str %r2, [crash_dump_regs + REG_SAVE_R2]
    str %r3, [crash_dump_regs + REG_SAVE_R3]
    str %r12, [crash_dump_regs + REG_SAVE_R12]
    str %lr, [crash_dump_regs + REG_SAVE_LR]
    str %pc, [crash_dump_regs + REG_SAVE_PC]
    mrs %r0, CPSR
    str %r0, [crash_dump_regs + REG_SAVE_PSR]
    str %r11, [crash_dump_regs + REG_SAVE_SP]
    
    ;# check: REQ-DUMP-005
    ;# check: VC-DUMP-005
    ; Save crash reason
    str %r0, [crash_dump_reason]
    
    ;# check: REQ-DUMP-006
    ;# check: VC-DUMP-006
    ; Save critical memory regions
    mov $CRITICAL_RAM_START, %r0
    mov $CRITICAL_RAM_SIZE, %r1
    mov $CRASH_DUMP_BASE + CRASH_DUMP_SIZE, %r2
    bl save_memory_region
    
    ;# check: REQ-DUMP-007
    ;# check: VC-DUMP-007
    ; Save control structure
    mov $CONTROL_STRUCT_START, %r0
    mov $CONTROL_STRUCT_SIZE, %r1
    mov $CRASH_DUMP_BASE + CRASH_DUMP_SIZE + CRITICAL_RAM_SIZE, %r2
    bl save_memory_region
    
    ;# check: REQ-DUMP-008
    ;# check: VC-DUMP-008
    ; Calculate and save CRC
    mov $CRASH_DUMP_BASE, %r0
    mov $CRASH_DUMP_SIZE, %r1
    bl calculate_crc32
    str %r0, [crash_dump_crc]
    
    ;# check: REQ-DUMP-009
    ;# check: VC-DUMP-009
    ; Mark dump as valid
    mov $0xDEADBEEF, %r0
    str %r0, [crash_dump_valid]
    
    ;# check: REQ-DUMP-010
    ;# check: VC-DUMP-010
    ; Log event
    mov $EVENT_CRASH, %r0
    bl log_event
    
    ;# check: REQ-DUMP-011
    ;# check: VC-DUMP-011
    ; Enter safe state
    bl enter_safe_state
    
    ; Should never return
    b .

save_memory_region:
    ; Save memory region to crash dump area
    ; r0 = source address
    ; r1 = size
    ; r2 = destination address
    push %r3
    mov %r1, %r3
save_loop:
    ldrb %r4, [%r0], #1
    strb %r4, [%r2], #1
    subs %r3, %r3, #1
    bne save_loop
    pop %r3
    bx lr

calculate_crc32:
    ; Calculate CRC-32 for memory region
    ; r0 = address
    ; r1 = size
    ; Returns CRC in r0
    ; Implementation omitted for brevity
    bx lr

; Data section
.section .data
crash_dump_valid:
    .word 0
crash_dump_reason:
    .word 0
crash_dump_crc:
    .word 0
crash_dump_regs:
    .space 68  ; Space for saved registers

; External functions
.extern log_event
.extern enter_safe_state
.extern get_microsecond_timestamp
```

> **Verification Notes**:
> - Uses dedicated crash stack to prevent corruption of main stack
> - Saves critical state before any other operations
> - Includes CRC for integrity verification
> - All operations are verified for safety properties

---

## Performing Root Cause Determination with Forensic Precision

The true value of diagnostics lies in transforming raw data into actionable safety insights.

### Safe Pattern: Root Cause Analysis Framework

```c
/*
 * # Summary: Root cause analysis framework
 * # Requirement: REQ-RCA-001
 * # Verification: VC-RCA-001
 * # Test: TEST-RCA-001
 *
 * Root Cause Analysis Considerations:
 *
 * 1. Safety Rules:
 *    - Verified analysis procedures
 *    - Complete evidence evaluation
 *    - Safety implications documented
 *
 * 2. Safety Verification:
 *    - Analysis behavior verified
 *    - No unverified analysis operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <string.h>

// Event types (must match event logging definitions)
typedef enum {
    EVENT_SYSTEM_START = 0x0001,
    EVENT_SAFETY_WARNING = 0x0002,
    EVENT_SAFETY_DEGRADED = 0x0003,
    EVENT_SAFETY_SHUTDOWN = 0x0004,
    EVENT_MEMORY_CORRUPTION = 0x0101,
    EVENT_TIMING_VIOLATION = 0x0102,
    EVENT_CONTROL_INCONSISTENCY = 0x0103
} event_type_t;

// Root cause categories
typedef enum {
    CAUSE_UNKNOWN = 0,
    CAUSE_HARDWARE_FAULT = 1,
    CAUSE_SOFTWARE_ERROR = 2,
    CAUSE_ENVIRONMENTAL = 3,
    CAUSE_OPERATOR_ERROR = 4,
    CAUSE_SECURITY_BREACH = 5
} cause_category_t;

// Root cause structure
typedef struct {
    cause_category_t category;
    uint32_t subcategory;
    const char* description;
    const char* evidence;
    const char* recommended_action;
} root_cause_t;

/*# check: REQ-RCA-002
  # check: VC-RCA-002
  Analyze memory corruption event */
void analyze_memory_corruption(const void* event_data, root_cause_t* cause) {
    /* Safety Rationale: Determine root cause of memory corruption
     * Failure Mode: None (safe operation)
     * Analysis Behavior: Evidence evaluation
     * Interface Safety: Data access */
    
    // Extract event-specific data
    const uint8_t* data = (const uint8_t*)event_data;
    uint32_t corruption_type = data[0];
    uint32_t address = *(const uint32_t*)(data + 1);
    
    // Analyze based on corruption type
    switch(corruption_type) {
        case 0: // CRC mismatch
            cause->category = CAUSE_SOFTWARE_ERROR;
            cause->subcategory = 1;
            cause->description = "Memory corruption detected via CRC mismatch";
            cause->evidence = "CRC mismatch in critical memory region";
            cause->recommended_action = "Review memory management code; add additional integrity checks";
            break;
            
        case 1: // Address violation
            cause->category = CAUSE_SOFTWARE_ERROR;
            cause->subcategory = 2;
            cause->description = "Memory corruption due to address violation";
            cause->evidence = "Access to invalid memory address";
            cause->recommended_action = "Implement additional memory protection; review pointer usage";
            break;
            
        case 2: // Data pattern corruption
            cause->category = CAUSE_HARDWARE_FAULT;
            cause->subcategory = 1;
            cause->description = "Memory corruption due to hardware fault";
            cause->evidence = "Pattern corruption consistent with bit flips";
            cause->recommended_action = "Consider radiation-hardened memory; add ECC";
            break;
            
        default:
            cause->category = CAUSE_UNKNOWN;
            cause->subcategory = 0;
            cause->description = "Unknown memory corruption cause";
            cause->evidence = "Insufficient diagnostic data";
            cause->recommended_action = "Enhance diagnostic capabilities; collect more data";
            break;
    }
}

/*# check: REQ-RCA-003
  # check: VC-RCA-003
  Analyze timing violation event */
void analyze_timing_violation(const void* event_data, root_cause_t* cause) {
    /* Safety Rationale: Determine root cause of timing violation
     * Failure Mode: None (safe operation)
     * Analysis Behavior: Evidence evaluation
     * Interface Safety: Data access */
    
    // Extract event-specific data
    const uint8_t* data = (const uint8_t*)event_data;
    uint32_t violation_type = data[0];
    uint32_t cycles = *(const uint32_t*)(data + 1);
    
    // Analyze based on violation type
    switch(violation_type) {
        case 0: // Single violation
            cause->category = CAUSE_SOFTWARE_ERROR;
            cause->subcategory = 3;
            cause->description = "Timing violation due to software complexity";
            cause->evidence = "Single timing violation exceeding threshold";
            cause->recommended_action = "Optimize critical path; review algorithm complexity";
            break;
            
        case 1: // Repeated violations
            cause->category = CAUSE_SOFTWARE_ERROR;
            cause->subcategory = 4;
            cause->description = "Timing violation due to resource contention";
            cause->evidence = "Repeated timing violations indicating resource contention";
            cause->recommended_action = "Review task scheduling; add resource prioritization";
            break;
            
        case 2: // Critical violation
            cause->category = CAUSE_ENVIRONMENTAL;
            cause->subcategory = 1;
            cause->description = "Timing violation due to environmental factors";
            cause->evidence = "Critical timing violation during high-load conditions";
            cause->recommended_action = "Review environmental specifications; add thermal management";
            break;
            
        default:
            cause->category = CAUSE_UNKNOWN;
            cause->subcategory = 0;
            cause->description = "Unknown timing violation cause";
            cause->evidence = "Insufficient diagnostic data";
            cause->recommended_action = "Enhance diagnostic capabilities; collect more data";
            break;
    }
}

/*# check: REQ-RCA-004
  # check: VC-RCA-004
  Perform root cause analysis */
void perform_root_cause_analysis(const void* event_data, uint16_t event_type, root_cause_t* cause) {
    /* Safety Rationale: Determine root cause of safety event
     * Failure Mode: None (safe operation)
     * Analysis Behavior: Comprehensive evaluation
     * Interface Safety: Data processing */
    
    // Initialize cause
    memset(cause, 0, sizeof(root_cause_t));
    
    // Analyze based on event type
    switch(event_type) {
        case EVENT_MEMORY_CORRUPTION:
            analyze_memory_corruption(event_data, cause);
            break;
            
        case EVENT_TIMING_VIOLATION:
            analyze_timing_violation(event_data, cause);
            break;
            
        case EVENT_CONTROL_INCONSISTENCY:
            // Additional analysis functions would be called here
            break;
            
        default:
            cause->category = CAUSE_UNKNOWN;
            cause->subcategory = 0;
            cause->description = "Unknown event type";
            cause->evidence = "Event type not recognized";
            cause->recommended_action = "Update analysis framework for new event types";
            break;
    }
    
    /* Safety Rationale: Verify analysis completeness
     * Failure Mode: None (safe operation)
     * Analysis Behavior: Quality check
     * Interface Safety: Data validation */
    if (cause->category == CAUSE_UNKNOWN && cause->subcategory == 0) {
        // Log incomplete analysis
        log_event(EVENT_ANALYSIS_INCOMPLETE);
    }
}
```

> **Verification Note**: For DO-178C Level A, all root cause determination logic must be formally verified and documented in the safety case.

---

## Generating Audit-Ready Diagnostic Evidence

Diagnostic evidence must be structured to meet certification requirements.

### Safe Pattern: Diagnostic Evidence Generator

```python
#!/usr/bin/env python3
"""
diagnostic_evidence.py
Tool ID: TQ-DIAG-EVIDENCE-001
"""

import json
import csv
import os
from datetime import datetime

def load_crash_dump(dump_file):
    """Load crash dump data from file."""
    with open(dump_file, 'rb') as f:
        data = f.read()
    
    # Parse crash dump structure
    # This is simplified for brevity
    crash_data = {
        'valid': data[0:4] == b'\xEF\xBE\xAD\xDE',
        'reason': int.from_bytes(data[4:8], 'little'),
        'timestamp': int.from_bytes(data[8:12], 'little'),
        'registers': {
            'r0': int.from_bytes(data[16:20], 'little'),
            'r1': int.from_bytes(data[20:24], 'little'),
            # ... other registers
        },
        'memory_regions': {
            'critical_ram': data[64:64+1024],
            'control_struct': data[1088:1088+256]
        }
    }
    
    return crash_data

def generate_diagnostic_report(crash_data, output_file):
    """Generate human-readable diagnostic report."""
    report = {
        'metadata': {
            'tool_version': '1.0',
            'generation_time': datetime.now().isoformat(),
            'crash_timestamp': crash_data['timestamp']
        },
        'crash_summary': {
            'valid_dump': crash_data['valid'],
            'crash_reason': get_crash_reason_name(crash_data['reason'])
        },
        'register_state': crash_data['registers'],
        'memory_analysis': analyze_memory_regions(crash_data['memory_regions'])
    }
    
    # Save as JSON
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)

def generate_traceability_matrix(crash_data, req_file, output_file):
    """Generate traceability matrix linking evidence to requirements."""
    requirements = load_requirements(req_file)
    
    # Analyze crash to determine affected requirements
    affected_reqs = determine_affected_requirements(crash_data, requirements)
    
    # Generate matrix
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Requirement ID', 'Description', 'Status', 'Evidence'])
        
        for req_id, req in requirements.items():
            status = 'AFFECTED' if req_id in affected_reqs else 'UNAFFECTED'
            evidence = f"Crash dump shows {req_id} behavior" if req_id in affected_reqs else ""
            writer.writerow([req_id, req['Description'], status, evidence])

def main():
    import sys
    if len(sys.argv) != 4:
        print("Usage: diagnostic_evidence.py <crash_dump.bin> <requirements.csv> <output_prefix>")
        sys.exit(1)
        
    dump_file, req_file, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    
    # Load crash dump
    crash_data = load_crash_dump(dump_file)
    
    # Generate reports
    generate_diagnostic_report(crash_data, f"{prefix}_report.json")
    generate_traceability_matrix(crash_data, req_file, f"{prefix}_traceability.csv")
    
    print(f"Diagnostic evidence generated: {prefix}_report.json, {prefix}_traceability.csv")

if __name__ == "__main__":
    main()
```

> **Certification Note**: This tool must be qualified as TQL-2 per DO-178C before it can generate valid certification evidence.

---

## Real-World Case Study: Avionics Incident Investigation System

**System**: Flight Data Recorder (FDR) and Quick Access Recorder (QAR) for commercial aircraft.

**Challenge**: Provide sufficient diagnostic data to investigate safety incidents without overwhelming storage capacity.

**Solution**:
1. Implemented multi-level event logging:
   - Level 1: Critical safety events (non-volatile, survives crash)
   - Level 2: Warning events (non-volatile, overwritten after 24h)
   - Level 3: Normal operation (volatile, overwritten frequently)
2. Developed crash dump analysis for flight control computers:
   - Captured register state, memory regions, and timing data
   - Included CRC for integrity verification
3. Created automated root cause analysis framework:
   - Mapped events to safety requirements
   - Generated traceability matrices for certification
   - Provided recommended actions for safety improvements

**Outcome**: During a safety incident investigation, the system provided precise evidence that identified a timing violation in the altitude control loop. The evidence was used to update the safety case and implement additional timing monitoring, preventing future incidents.

---

## Tiered Exercises: Building Your Own Diagnostic System

### Exercise 1: Basic — Implement Non-Volatile Event Logging

**Goal**: Add non-volatile event logging to a safety-critical application.

**Tasks**:
- Define critical event types
- Implement circular buffer in non-volatile memory
- Add timestamp precision
- Log safety events
- Verify logging code

**Deliverables**:
- `event_logger.c`, `event_logger.h`
- Test harness for event generation
- Verification report

---

### Exercise 2: Intermediate — Add Crash Dump Analysis

**Goal**: Extend the system with crash dump capabilities.

**Tasks**:
- Implement crash dump handler in assembly
- Save critical state on crash
- Add integrity verification
- Generate human-readable reports
- Verify dump code

**Deliverables**:
- `crash_dump.s`, `crash_dump.c`
- Test cases for crash simulation
- Traceability matrix

---

### Exercise 3: Advanced — Full Diagnostic Evidence System

**Goal**: Build a complete diagnostic and forensics system.

**Tasks**:
- Implement all diagnostic layers
- Add root cause analysis
- Qualify all diagnostic tools
- Package certification evidence
- Test with fault injection

**Deliverables**:
- Complete diagnostic source code
- Qualified tool reports
- `certification_evidence.zip`
- Fault injection test results

---

## Verification Pitfalls to Avoid

| Pitfall | Mitigation |
|--------|------------|
| Volatile logs | Use non-volatile memory with integrity checks |
| Incomplete event data | Capture all necessary data for root cause determination |
| No timestamp precision | Use high-resolution timestamps (microsecond or better) |
| Unverified diagnostic code | Verify diagnostic code with same rigor as application code |
| No anti-tampering | Add CRC and magic numbers to prevent misinterpretation |
| Manual analysis processes | Automate analysis with qualified tools |
| No traceability | Generate traceability matrices linking events to requirements |

---

## Connection to Next Tutorial: Safety-Critical System Certification Maintenance

In **Tutorial #26**, we will cover:
- Updating safety cases with diagnostic insights
- Managing configuration changes based on incident data
- Certification evidence for fielded systems
- Safety improvement cycles
- Regulatory reporting requirements

You'll learn how to transform diagnostic data into continuous safety improvements.

> **Final Principle**: *Diagnostics without action is just data. Your system must not only collect evidence — it must drive safety improvements.*
