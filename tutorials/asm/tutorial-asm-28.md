# 28. x86 vs. x64: Migration and Compatibility Considerations for Safety-Critical Systems

## Introduction: Why Architecture Migration Is a Safety-Critical Concern

In safety-critical systems, **changing processor architectures is not a simple technical upgrade—it's a safety event**. When a medical device transitions from x86 to x64, an avionics system migrates to 64-bit processing, or an industrial control system updates its hardware platform, the implications for safety verification are profound. Traditional approaches treat architecture migration as a performance optimization exercise, but in safety-critical contexts, this is dangerously inadequate.

The transition from x86 to x64 (or vice versa) introduces fundamental changes that directly impact:
- Memory addressing and safety boundaries
- Register usage and preservation requirements
- Calling conventions and interface safety
- Timing behavior and worst-case execution time
- Toolchain verification and qualification requirements

Unlike general-purpose development that prioritizes performance over process compliance, safety-critical architecture migration requires a fundamentally different approach. This tutorial examines how to transform architecture migration from a technical challenge into a verifiable safety process—ensuring that the migration itself becomes part of the safety case rather than a certification risk.

> **Safety Philosophy**: *If you cannot prove that the migrated code maintains identical safety properties to the certified version, then the migration has compromised safety.*

---

## Why Traditional Architecture Migration Approaches Fail in Safety-Critical Contexts

Many organizations treat architecture migration as a straightforward technical upgrade. These approaches create significant risks when applied to safety-critical systems.

| Problem (Traditional Approach) | Consequence in Safety-Critical Systems |
|-------------------------------|----------------------------------------|
| Performance-focused migration | Safety properties compromised for speed |
| Incomplete verification of architectural differences | Undetected safety violations |
| Assumption of binary compatibility | Hidden memory model and addressing errors |
| Lack of migration-specific verification evidence | Certification rejection |
| Ignoring toolchain qualification impacts | Invalid verification evidence |
| Incomplete traceability of migration effects | Gaps in safety case |

### Case Study: Avionics System Failure Due to Incomplete x86 to x64 Migration

An aircraft's flight control system experienced intermittent failures during high-workload conditions after migrating from x86 to x64. The root cause was traced to improper handling of the x64 memory model's flat addressing scheme. The safety-critical timing loop relied on segment-based addressing assumptions that were invalidated in x64 mode. The verification process had focused on functional correctness but missed the safety impact because the architectural differences weren't properly documented or verified as part of the safety case.

> **Lesson**: Architecture migration must be treated as a safety event with its own verification requirements—not merely a technical upgrade.

---

## The Architecture Migration Philosophy for Safety-Critical Systems

Architecture migration transforms from a technical exercise into a **safety verification process**. It ensures that the transition between architectures maintains or improves safety properties while generating the evidence needed for certification.

### Core Principles of Safety-Critical Architecture Migration

1. **Architectural Differences as Safety Properties**: Treat architectural differences as safety properties requiring verification.
2. **Complete Verification of Migration Effects**: Verify all code paths for architectural impact.
3. **Migration-Specific Evidence Generation**: Generate evidence specifically for the migration process.
4. **Toolchain Requalification**: Requalify all tools affected by the architecture change.
5. **Complete Traceability**: Trace migration effects to safety requirements.
6. **Performance-Safety Tradeoff Analysis**: Explicitly document performance-safety tradeoffs.

> **Core Tenet**: *Your migration process must be as safety-critical as the code it transforms.*

---

## Designing a Migration Safety Assessment Framework

A robust migration safety assessment identifies and verifies all architectural differences that impact safety.

### Safe Pattern: Migration Safety Assessment Template

```markdown
# MIGRATION SAFETY ASSESSMENT: x86 to x64 MIGRATION

## Metadata
- **System**: Flight Control Computer
- **Current Architecture**: x86 (32-bit)
- **Target Architecture**: x64 (64-bit)
- **Migration Date**: 2025-06-01
- **Assessment Date**: 2025-03-15
- **Assessor**: Jane Doe, Safety Engineering Lead

## Architectural Differences Assessment
| Architectural Feature | x86 Behavior | x64 Behavior | Safety Impact | Verification Approach | Status |
|----------------------|--------------|--------------|---------------|----------------------|--------|
| **Memory Model** | Segmented (4GB) | Flat (256TB) | High: Addressing assumptions invalidated | Code review + static analysis | Verified |
| **Register Set** | 8 general-purpose | 16 general-purpose | Medium: Calling conventions changed | Interface verification | Verified |
| **Calling Convention** | Stack-based | Register-based | High: Parameter passing changed | Cross-architecture testing | Verified |
| **Instruction Set** | x87 FPU | SSE-based | Medium: Floating-point behavior | Precision testing | Verified |
| **Stack Alignment** | 4-byte | 16-byte | High: Stack overflow risk | Runtime monitoring | Verified |
| **Address Size** | 32-bit | 64-bit | High: Pointer truncation risk | Static analysis + testing | Verified |
| **Memory Protection** | Limited PAE | Enhanced NX | Medium: Security vs. safety | Threat modeling | Verified |

## Safety Impact Analysis
### Critical Safety Properties Affected
1. **Timing Determinism**:
   - *Impact*: x64's larger register set changes instruction scheduling
   - *Verification*: WCET analysis on both architectures
   - *Evidence*: `WCET_x86_vs_x64.pdf`

2. **Memory Safety**:
   - *Impact*: Flat memory model invalidates segment-based protection
   - *Verification*: Memory protection unit reconfiguration
   - *Evidence*: `MPU_Configuration_Report.pdf`

3. **Interface Compatibility**:
   - *Impact*: Different calling conventions break interface contracts
   - *Verification*: Cross-architecture interface testing
   - *Evidence*: `Interface_Verification_Report.pdf`

## Migration Verification Plan
| Verification Activity | Method | Evidence | Responsible |
|----------------------|--------|----------|-------------|
| Memory model verification | Static analysis + runtime monitoring | `Memory_Model_Verification.log` | Verification Engineer |
| Register usage verification | Code review + interface testing | `Register_Usage_Report.pdf` | Verification Engineer |
| Calling convention verification | Cross-architecture testing | `Calling_Convention_Test.log` | Test Engineer |
| Timing behavior verification | WCET analysis on both platforms | `WCET_Comparison_Report.pdf` | Timing Analyst |
| Toolchain requalification | Tool qualification process | `Tool_Qualification_Pack.zip` | Tool Qualification Lead |

## Migration Risk Register
| Risk ID | Risk Description | Severity | Mitigation | Status |
|---------|------------------|----------|------------|--------|
| MIG-001 | Stack misalignment causing overflow | HIGH | Implement stack alignment checks | Mitigated |
| MIG-002 | Pointer truncation in mixed-mode code | CRITICAL | Remove all 32-bit pointers | Mitigated |
| MIG-003 | Different floating-point precision | MEDIUM | Implement precision validation | Mitigated |
| MIG-004 | Register clobber in calling convention | HIGH | Implement register preservation | Mitigated |

## Configuration Management Plan
| Component | x86 Version | x64 Version | Migration Status | Verification Status |
|-----------|-------------|-------------|------------------|---------------------|
| Flight Control Algorithm | 1.2.0 | 2.0.0 | Migrated | Verified |
| Sensor Interface | 1.1.0 | 1.1.0 | No change needed | Verified |
| Communication Module | 1.0.0 | 1.5.0 | Migrated | Verified |
| Safety Monitor | 1.3.0 | 2.0.0 | Migrated | Verified |

## Regulatory Compliance Assessment
| Regulation | Requirement | Migration Impact | Verification Evidence | Status |
|------------|-------------|------------------|------------------------|--------|
| DO-178C | Section 6.3 (Tool Qualification) | Toolchain changes require requalification | `Tool_Qualification_Pack.zip` | Compliant |
| DO-178C | Section 6.4 (Verification) | Complete verification of migration effects | `Migration_Verification_Report.pdf` | Compliant |
| IEC 62304 | Section 5.1.3 (Risk Management) | Migration treated as safety event | `Risk_Management_Report.pdf` | Compliant |
```

> **Verification Tags**: Every architectural difference is tagged for traceability.
> **Safety Impact**: Each difference is assessed for safety implications.
> **Evidence Generation**: Verification activities produce certification-grade evidence.

---

## Implementing Migration-Specific Verification Techniques

Migration verification requires specialized techniques beyond standard testing.

### Safe Pattern: Cross-Architecture Verification Framework

```c
/*
 * # Summary: Cross-architecture verification framework
 * # Requirement: REQ-XARCH-001
 * # Verification: VC-XARCH-001
 * # Test: TEST-XARCH-001
 *
 * Cross-Architecture Verification Considerations:
 *
 * 1. Safety Rules:
 *    - Verified behavior consistency across architectures
 *    - Complete migration effect verification
 *    - Safety property preservation
 *
 * 2. Safety Verification:
 *    - Migration behavior verified
 *    - No unverified migration operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <string.h>

// Constants for safety constraints
#define MAX_ALTITUDE 50000
#define MAX_ALTITUDE_ERROR 0.1  // 0.1% maximum deviation

// Structure for cross-architecture testing
typedef struct {
    int64_t current_altitude;
    int64_t altitude_adjustment;
    int64_t error_code;
    double x86_result;
    double x64_result;
} cross_arch_test_t;

/*# check: REQ-XARCH-002
  # check: VC-XARCH-002
  Verify consistent behavior across architectures */
int verify_cross_architecture_consistency(
    const cross_arch_test_t* test,
    double max_deviation
) {
    /* Safety Rationale: Ensure consistent behavior across architectures
     * Failure Mode: Return error if deviation exceeds threshold
     * Verification Behavior: Cross-architecture comparison
     * Interface Safety: Safety property preservation */
    
    double absolute_deviation = test->x64_result - test->x86_result;
    double relative_deviation = absolute_deviation / test->x86_result;
    
    if (relative_deviation > max_deviation) {
        return -1;  // Inconsistent behavior
    }
    
    return 0;  // Consistent behavior
}

/*# check: REQ-XARCH-003
  # check: VC-XARCH-003
  Execute cross-architecture test */
void execute_cross_architecture_test(
    cross_arch_test_t* test,
    void (*x86_function)(void*),
    void (*x64_function)(void*)
) {
    /* Safety Rationale: Execute identical test on both architectures
     * Failure Mode: None (safe operation)
     * Verification Behavior: Test execution
     * Interface Safety: Test isolation */
    
    // Save original state
    cross_arch_test_t original;
    memcpy(&original, test, sizeof(cross_arch_test_t));
    
    // Execute on x86
    x86_function(test);
    test->x86_result = test->current_altitude;
    
    // Restore original state
    memcpy(test, &original, sizeof(cross_arch_test_t));
    
    // Execute on x64
    x64_function(test);
    test->x64_result = test->current_altitude;
    
    // Restore original state
    memcpy(test, &original, sizeof(cross_arch_test_t));
}

/*# check: REQ-XARCH-004
  # check: VC-XARCH-004
  Verify stack alignment requirements */
int verify_stack_alignment() {
    /* Safety Rationale: Ensure stack alignment meets architecture requirements
     * Failure Mode: Return error if misaligned
     * Verification Behavior: Alignment check
     * Interface Safety: Stack safety */
    
    #ifdef __x86_64__
        // x64 requires 16-byte stack alignment
        uintptr_t sp;
        __asm__ volatile("mov %%rsp, %0" : "=r"(sp));
        return (sp & 0xF) == 0;  // 16-byte alignment
    #else
        // x86 requires 4-byte stack alignment
        uintptr_t sp;
        __asm__ volatile("mov %%esp, %0" : "=r"(sp));
        return (sp & 0x3) == 0;  // 4-byte alignment
    #endif
}

/*# check: REQ-XARCH-005
  # check: VC-XARCH-005
  Verify pointer size consistency */
int verify_pointer_size_consistency() {
    /* Safety Rationale: Ensure pointer size consistency across architectures
     * Failure Mode: Return error if inconsistent
     * Verification Behavior: Size check
     * Interface Safety: Memory safety */
    
    #ifdef __x86_64__
        return sizeof(void*) == 8;  // 64-bit pointers
    #else
        return sizeof(void*) == 4;  // 32-bit pointers
    #endif
}

/*# check: REQ-XARCH-006
  # check: VC-XARCH-006
  Generate cross-architecture verification report */
void generate_cross_architecture_report(
    const cross_arch_test_t* tests,
    int test_count,
    const char* output_file
) {
    /* Safety Rationale: Document verification results for certification
     * Failure Mode: None (safe operation)
     * Verification Behavior: Reporting
     * Interface Safety: Evidence generation */
    
    // In a real system, this would generate a detailed report
    // For this example, we'll just log some statistics
    
    int consistent = 0;
    int inconsistent = 0;
    
    for (int i = 0; i < test_count; i++) {
        if (verify_cross_architecture_consistency(&tests[i], MAX_ALTITUDE_ERROR) == 0) {
            consistent++;
        } else {
            inconsistent++;
        }
    }
    
    // Log report (in real system, would write to non-volatile memory)
    log_event(EVENT_XARCH_REPORT);
    log_value("CONSISTENT_TESTS", consistent);
    log_value("INCONSISTENT_TESTS", inconsistent);
    log_value("TOTAL_TESTS", test_count);
}
```

> **Verification Note**: For DO-178C Level A, all cross-architecture verification logic must be formally verified and documented in the safety case.

---

## Addressing Memory Model Differences

The transition from segmented (x86) to flat (x64) memory models has significant safety implications.

### Safe Pattern: Memory Model Abstraction Layer

```c
/*
 * # Summary: Memory model abstraction layer for migration safety
 * # Requirement: REQ-MM-001
 * # Verification: VC-MM-001
 * # Test: TEST-MM-001
 *
 * Memory Model Considerations:
 *
 * 1. Safety Rules:
 *    - Verified memory model abstraction
 *    - Complete memory safety verification
 *    - Architecture-independent memory access
 *
 * 2. Safety Verification:
 *    - Memory access verified
 *    - No unverified memory operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <stddef.h>

// Memory protection constants
#define MEM_PROT_READ  0x01
#define MEM_PROT_WRITE 0x02
#define MEM_PROT_EXEC  0x04

// Memory region types
typedef enum {
    REGION_CODE,
    REGION_DATA,
    REGION_STACK,
    REGION_HEAP,
    REGION_IO
} memory_region_t;

// Memory region structure
typedef struct {
    void* base;
    size_t size;
    uint8_t permissions;
    memory_region_t type;
} memory_region_t;

// Memory model abstraction functions
void memory_init();
int memory_register_region(void* base, size_t size, uint8_t permissions, memory_region_t type);
int memory_verify_access(void* addr, size_t size, uint8_t permissions);
void memory_protect_region(memory_region_t region_type, uint8_t permissions);

/*# check: REQ-MM-002
  # check: VC-MM-002
  Initialize memory model abstraction */
void memory_init() {
    /* Safety Rationale: Establish safe memory model abstraction
     * Failure Mode: None (safe operation)
     * Memory Behavior: Initialization
     * Interface Safety: Memory access */
    
    // Initialize memory protection unit
    #ifdef __x86_64__
        // x64-specific initialization
        init_x64_mmu();
    #else
        // x86-specific initialization
        init_x86_mmu();
    #endif
    
    // Register critical memory regions
    memory_register_region(
        CRITICAL_RAM_START,
        CRITICAL_RAM_SIZE,
        MEM_PROT_READ | MEM_PROT_WRITE,
        REGION_DATA
    );
    
    memory_register_region(
        CONTROL_STRUCT_START,
        CONTROL_STRUCT_SIZE,
        MEM_PROT_READ | MEM_PROT_WRITE,
        REGION_DATA
    );
}

/*# check: REQ-MM-003
  # check: VC-MM-003
  Register memory region for protection */
int memory_register_region(void* base, size_t size, uint8_t permissions, memory_region_t type) {
    /* Safety Rationale: Register memory region for protection
     * Failure Mode: Return error if registration fails
     * Memory Behavior: Region registration
     * Interface Safety: Memory protection */
    
    // Validate parameters
    if (base == NULL || size == 0) {
        return -1;  // Invalid parameters
    }
    
    // Register with architecture-specific MMU
    #ifdef __x86_64__
        return x64_register_memory_region(base, size, permissions, type);
    #else
        return x86_register_memory_region(base, size, permissions, type);
    #endif
}

/*# check: REQ-MM-004
  # check: VC-MM-004
  Verify memory access safety */
int memory_verify_access(void* addr, size_t size, uint8_t permissions) {
    /* Safety Rationale: Verify memory access meets safety requirements
     * Failure Mode: Return error if access unsafe
     * Memory Behavior: Access verification
     * Interface Safety: Memory safety */
    
    // Validate address range
    if (addr == NULL || size == 0) {
        return -1;  // Invalid parameters
    }
    
    // Check against all registered regions
    for (int i = 0; i < MAX_MEMORY_REGIONS; i++) {
        memory_region_t* region = &memory_regions[i];
        
        if (region->base == NULL) {
            continue;  // Skip unregistered regions
        }
        
        // Check if address range overlaps with region
        uintptr_t addr_start = (uintptr_t)addr;
        uintptr_t addr_end = addr_start + size;
        uintptr_t region_start = (uintptr_t)region->base;
        uintptr_t region_end = region_start + region->size;
        
        if (addr_start >= region_start && addr_end <= region_end) {
            // Check permissions
            if ((region->permissions & permissions) != permissions) {
                return -2;  // Insufficient permissions
            }
            
            return 0;  // Valid access
        }
    }
    
    return -3;  // Address not in any registered region
}

/*# check: REQ-MM-005
  # check: VC-MM-005
  Protect memory region with specified permissions */
void memory_protect_region(memory_region_t region_type, uint8_t permissions) {
    /* Safety Rationale: Update memory region protection
     * Failure Mode: None (safe operation)
     * Memory Behavior: Protection update
     * Interface Safety: Memory protection */
    
    for (int i = 0; i < MAX_MEMORY_REGIONS; i++) {
        if (memory_regions[i].type == region_type) {
            memory_regions[i].permissions = permissions;
            
            #ifdef __x86_64__
                x64_update_memory_protection(&memory_regions[i]);
            #else
                x86_update_memory_protection(&memory_regions[i]);
            #endif
            
            return;
        }
    }
}

/*# check: REQ-MM-006
  # check: VC-MM-006
  Verify memory model abstraction safety */
void verify_memory_model_safety() {
    /* Safety Rationale: Verify memory model abstraction maintains safety
     * Failure Mode: Log error if verification fails
     * Memory Behavior: Safety verification
     * Interface Safety: Safety evidence */
    
    // Verify critical region protection
    if (memory_verify_access(
            (void*)CRITICAL_RAM_START,
            4,
            MEM_PROT_READ | MEM_PROT_WRITE
        ) != 0) {
        log_event(EVENT_MEMORY_PROTECTION_FAILURE);
    }
    
    // Verify control structure protection
    if (memory_verify_access(
            (void*)CONTROL_STRUCT_START,
            4,
            MEM_PROT_READ | MEM_PROT_WRITE
        ) != 0) {
        log_event(EVENT_CONTROL_STRUCT_PROTECTION_FAILURE);
    }
    
    // Verify no executable data regions
    for (int i = 0; i < MAX_MEMORY_REGIONS; i++) {
        if (memory_regions[i].type == REGION_DATA && 
            (memory_regions[i].permissions & MEM_PROT_EXEC)) {
            log_event(EVENT_EXECUTABLE_DATA_REGION);
        }
    }
}
```

> **Verification Note**: For DO-178C Level A, all memory model abstraction logic must be formally verified and documented in the safety case.

---

## Managing Register Usage and Preservation Differences

The transition from 8 to 16 general-purpose registers significantly impacts calling conventions and register preservation requirements.

### Safe Pattern: Register Abstraction Layer

```c
/*
 * # Summary: Register abstraction layer for migration safety
 * # Requirement: REQ-REG-001
 * # Verification: VC-REG-001
 * # Test: TEST-REG-001
 *
 * Register Abstraction Considerations:
 *
 * 1. Safety Rules:
 *    - Verified register usage abstraction
 *    - Complete register preservation
 *    - Architecture-independent register access
 *
 * 2. Safety Verification:
 *    - Register usage verified
 *    - No unverified register operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>

// Register types
typedef enum {
    REG_TYPE_GENERAL,
    REG_TYPE_POINTER,
    REG_TYPE_STACK,
    REG_TYPE_FLAG
} register_type_t;

// Register identifiers
typedef enum {
    REG_RAX = 0,
    REG_RBX,
    REG_RCX,
    REG_RDX,
    REG_RSI,
    REG_RDI,
    REG_RBP,
    REG_RSP,
    REG_R8,
    REG_R9,
    REG_R10,
    REG_R11,
    REG_R12,
    REG_R13,
    REG_R14,
    REG_R15,
    REG_COUNT
} register_id_t;

// Register state structure
typedef struct {
    uint64_t values[REG_COUNT];
    uint64_t flags;
} register_state_t;

// Register preservation levels
typedef enum {
    PRESERVE_NONE,
    PRESERVE_CALLEE_SAVED,
    PRESERVE_ALL
} preserve_level_t;

// Register abstraction functions
void registers_init();
void registers_save(register_state_t* state, preserve_level_t level);
void registers_restore(const register_state_t* state, preserve_level_t level);
int registers_verify_preservation(const register_state_t* before, const register_state_t* after, preserve_level_t level);
void registers_log_state(const register_state_t* state);

/*# check: REQ-REG-002
  # check: VC-REG-002
  Initialize register abstraction */
void registers_init() {
    /* Safety Rationale: Establish safe register abstraction
     * Failure Mode: None (safe operation)
     * Register Behavior: Initialization
     * Interface Safety: Register access */
    
    // Architecture-specific initialization
    #ifdef __x86_64__
        // x64-specific initialization
        init_x64_registers();
    #else
        // x86-specific initialization
        init_x86_registers();
    #endif
}

/*# check: REQ-REG-003
  # check: VC-REG-003
  Save register state */
void registers_save(register_state_t* state, preserve_level_t level) {
    /* Safety Rationale: Save register state safely
     * Failure Mode: None (safe operation)
     * Register Behavior: State saving
     * Interface Safety: Register preservation */
    
    // Save general-purpose registers
    #ifdef __x86_64__
        __asm__ volatile (
            "mov %%rax, %0\n"
            "mov %%rbx, %1\n"
            "mov %%rcx, %2\n"
            "mov %%rdx, %3\n"
            "mov %%rsi, %4\n"
            "mov %%rdi, %5\n"
            "mov %%rbp, %6\n"
            "mov %%rsp, %7\n"
            "mov %%r8,  %8\n"
            "mov %%r9,  %9\n"
            "mov %%r10, %10\n"
            "mov %%r11, %11\n"
            "mov %%r12, %12\n"
            "mov %%r13, %13\n"
            "mov %%r14, %14\n"
            "mov %%r15, %15\n"
            : "=m"(state->values[REG_RAX]),
              "=m"(state->values[REG_RBX]),
              "=m"(state->values[REG_RCX]),
              "=m"(state->values[REG_RDX]),
              "=m"(state->values[REG_RSI]),
              "=m"(state->values[REG_RDI]),
              "=m"(state->values[REG_RBP]),
              "=m"(state->values[REG_RSP]),
              "=m"(state->values[REG_R8]),
              "=m"(state->values[REG_R9]),
              "=m"(state->values[REG_R10]),
              "=m"(state->values[REG_R11]),
              "=m"(state->values[REG_R12]),
              "=m"(state->values[REG_R13]),
              "=m"(state->values[REG_R14]),
              "=m"(state->values[REG_R15])
            :
            : "memory"
        );
    #else
        __asm__ volatile (
            "mov %%eax, %0\n"
            "mov %%ebx, %1\n"
            "mov %%ecx, %2\n"
            "mov %%edx, %3\n"
            "mov %%esi, %4\n"
            "mov %%edi, %5\n"
            "mov %%ebp, %6\n"
            "mov %%esp, %7\n"
            : "=m"(state->values[REG_RAX]),
              "=m"(state->values[REG_RBX]),
              "=m"(state->values[REG_RCX]),
              "=m"(state->values[REG_RDX]),
              "=m"(state->values[REG_RSI]),
              "=m"(state->values[REG_RDI]),
              "=m"(state->values[REG_RBP]),
              "=m"(state->values[REG_RSP])
            :
            : "memory"
        );
    #endif
    
    // Save flags register
    #ifdef __x86_64__
        __asm__ volatile ("pushf\n pop %0" : "=r"(state->flags));
    #else
        __asm__ volatile ("pushf\n popl %0" : "=r"(state->flags));
    #endif
    
    // If preserving only callee-saved registers, clear others
    if (level == PRESERVE_CALLEE_SAVED) {
        #ifdef __x86_64__
            // x64 callee-saved: RBX, RBP, RSP, R12-R15
            memset(&state->values[REG_RCX], 0, 4 * sizeof(uint64_t)); // RCX, RDX, RSI, RDI
            memset(&state->values[REG_R8], 0, 4 * sizeof(uint64_t));  // R8-R11
        #else
            // x86 callee-saved: EBX, EBP, ESP
            memset(&state->values[REG_RCX], 0, 3 * sizeof(uint64_t)); // ECX, EDX, ESI, EDI
        #endif
    }
}

/*# check: REQ-REG-004
  # check: VC-REG-004
  Restore register state */
void registers_restore(const register_state_t* state, preserve_level_t level) {
    /* Safety Rationale: Restore register state safely
     * Failure Mode: None (safe operation)
     * Register Behavior: State restoration
     * Interface Safety: Register preservation */
    
    // Restore general-purpose registers
    #ifdef __x86_64__
        __asm__ volatile (
            "mov %0, %%rax\n"
            "mov %1, %%rbx\n"
            "mov %2, %%rcx\n"
            "mov %3, %%rdx\n"
            "mov %4, %%rsi\n"
            "mov %5, %%rdi\n"
            "mov %6, %%rbp\n"
            "mov %7, %%rsp\n"
            "mov %8,  %%r8\n"
            "mov %9,  %%r9\n"
            "mov %10, %%r10\n"
            "mov %11, %%r11\n"
            "mov %12, %%r12\n"
            "mov %13, %%r13\n"
            "mov %14, %%r14\n"
            "mov %15, %%r15\n"
            :
            : "m"(state->values[REG_RAX]),
              "m"(state->values[REG_RBX]),
              "m"(state->values[REG_RCX]),
              "m"(state->values[REG_RDX]),
              "m"(state->values[REG_RSI]),
              "m"(state->values[REG_RDI]),
              "m"(state->values[REG_RBP]),
              "m"(state->values[REG_RSP]),
              "m"(state->values[REG_R8]),
              "m"(state->values[REG_R9]),
              "m"(state->values[REG_R10]),
              "m"(state->values[REG_R11]),
              "m"(state->values[REG_R12]),
              "m"(state->values[REG_R13]),
              "m"(state->values[REG_R14]),
              "m"(state->values[REG_R15])
            : "rax", "rbx", "rcx", "rdx", "rsi", "rdi", "rbp", "rsp",
              "r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15", "memory"
        );
    #else
        __asm__ volatile (
            "mov %0, %%eax\n"
            "mov %1, %%ebx\n"
            "mov %2, %%ecx\n"
            "mov %3, %%edx\n"
            "mov %4, %%esi\n"
            "mov %5, %%edi\n"
            "mov %6, %%ebp\n"
            "mov %7, %%esp\n"
            :
            : "m"(state->values[REG_RAX]),
              "m"(state->values[REG_RBX]),
              "m"(state->values[REG_RCX]),
              "m"(state->values[REG_RDX]),
              "m"(state->values[REG_RSI]),
              "m"(state->values[REG_RDI]),
              "m"(state->values[REG_RBP]),
              "m"(state->values[REG_RSP])
            : "eax", "ebx", "ecx", "edx", "esi", "edi", "ebp", "esp", "memory"
        );
    #endif
    
    // Restore flags register
    #ifdef __x86_64__
        __asm__ volatile ("push %0\n popf" : : "r"(state->flags) : "flags", "memory");
    #else
        __asm__ volatile ("pushl %0\n popf" : : "r"(state->flags) : "flags", "memory");
    #endif
}

/*# check: REQ-REG-005
  # check: VC-REG-005
  Verify register preservation */
int registers_verify_preservation(const register_state_t* before, const register_state_t* after, preserve_level_t level) {
    /* Safety Rationale: Verify register preservation meets requirements
     * Failure Mode: Return error if preservation fails
     * Register Behavior: Preservation verification
     * Interface Safety: Register safety */
    
    // Verify general-purpose registers
    #ifdef __x86_64__
        // x64: Callee-saved = RBX, RBP, RSP, R12-R15
        if (level >= PRESERVE_CALLEE_SAVED) {
            if (before->values[REG_RBX] != after->values[REG_RBX]) return REG_RBX;
            if (before->values[REG_RBP] != after->values[REG_RBP]) return REG_RBP;
            if (before->values[REG_RSP] != after->values[REG_RSP]) return REG_RSP;
            if (before->values[REG_R12] != after->values[REG_R12]) return REG_R12;
            if (before->values[REG_R13] != after->values[REG_R13]) return REG_R13;
            if (before->values[REG_R14] != after->values[REG_R14]) return REG_R14;
            if (before->values[REG_R15] != after->values[REG_R15]) return REG_R15;
        }
    #else
        // x86: Callee-saved = EBX, EBP, ESP
        if (level >= PRESERVE_CALLEE_SAVED) {
            if (before->values[REG_RBX] != after->values[REG_RBX]) return REG_RBX;
            if (before->values[REG_RBP] != after->values[REG_RBP]) return REG_RBP;
            if (before->values[REG_RSP] != after->values[REG_RSP]) return REG_RSP;
        }
    #endif
    
    return 0;  // All registers preserved correctly
}

/*# check: REQ-REG-006
  # check: VC-REG-006
  Generate register verification report */
void generate_register_verification_report(
    const register_state_t* before,
    const register_state_t* after,
    preserve_level_t level,
    const char* output_file
) {
    /* Safety Rationale: Document register verification results
     * Failure Mode: None (safe operation)
     * Register Behavior: Reporting
     * Interface Safety: Evidence generation */
    
    // In a real system, this would generate a detailed report
    // For this example, we'll just log some statistics
    
    int result = registers_verify_preservation(before, after, level);
    
    log_event(EVENT_REGISTER_VERIFICATION);
    log_value("PRESERVE_LEVEL", level);
    log_value("VERIFICATION_RESULT", result);
    
    if (result != 0) {
        log_value("FAILED_REGISTER", result);
    }
}
```

> **Verification Note**: For DO-178C Level A, all register abstraction logic must be formally verified and documented in the safety case.

---

## Addressing Calling Convention Differences

The shift from stack-based (x86) to register-based (x64) parameter passing has significant implications for interface safety.

### Safe Pattern: Calling Convention Abstraction Layer

```c
/*
 * # Summary: Calling convention abstraction layer for migration safety
 * # Requirement: REQ-CC-001
 * # Verification: VC-CC-001
 * # Test: TEST-CC-001
 *
 * Calling Convention Considerations:
 *
 * 1. Safety Rules:
 *    - Verified calling convention abstraction
 *    - Complete parameter marshaling
 *    - Architecture-independent interface contracts
 *
 * 2. Safety Verification:
 *    - Calling convention verified
 *    - No unverified interface operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <stdarg.h>

// Calling convention types
typedef enum {
    CC_CDECL,     // C declaration (stack-based)
    CC_STDCALL,   // Standard call (stack-based)
    CC_FASTCALL,  // Fast call (registers + stack)
    CC_SYSTEMV    // System V AMD64 ABI (registers)
} calling_convention_t;

// Parameter types
typedef enum {
    PARAM_INT,
    PARAM_FLOAT,
    PARAM_PTR,
    PARAM_STRUCT
} param_type_t;

// Parameter descriptor
typedef struct {
    param_type_t type;
    size_t size;
    const char* name;
} param_desc_t;

// Function descriptor
typedef struct {
    const char* name;
    calling_convention_t convention;
    int param_count;
    const param_desc_t* params;
    param_desc_t return_type;
} func_desc_t;

// Calling convention abstraction functions
void cc_init();
void* cc_get_function_address(const char* name);
int cc_call_function(
    const func_desc_t* func,
    void* result,
    ...
);
int cc_verify_calling_convention(
    const func_desc_t* func,
    const void* expected,
    const void* actual
);

/*# check: REQ-CC-002
  # check: VC-CC-002
  Initialize calling convention abstraction */
void cc_init() {
    /* Safety Rationale: Establish safe calling convention abstraction
     * Failure Mode: None (safe operation)
     * Calling Behavior: Initialization
     * Interface Safety: Interface contract */
    
    // Architecture-specific initialization
    #ifdef __x86_64__
        // x64-specific initialization (System V ABI)
        init_systemv_abi();
    #else
        // x86-specific initialization (cdecl/stdcall)
        init_cdecl_abi();
    #endif
}

/*# check: REQ-CC-003
  # check: VC-CC-003
  Get function address by name */
void* cc_get_function_address(const char* name) {
    /* Safety Rationale: Resolve function address safely
     * Failure Mode: Return NULL if not found
     * Calling Behavior: Address resolution
     * Interface Safety: Symbol safety */
    
    // In a real system, this would use architecture-specific symbol resolution
    return get_symbol_address(name);
}

/*# check: REQ-CC-004
  # check: VC-CC-004
  Call function with variable arguments */
int cc_call_function(
    const func_desc_t* func,
    void* result,
    ...
) {
    /* Safety Rationale: Call function with architecture-appropriate convention
     * Failure Mode: Return error if call fails
     * Calling Behavior: Function invocation
     * Interface Safety: Parameter safety */
    
    va_list args;
    va_start(args, result);
    
    int status;
    
    #ifdef __x86_64__
        // x64: System V AMD64 ABI (registers for first 6 integer/pointer args)
        status = systemv_call_function(func, result, args);
    #else
        // x86: cdecl/stdcall (stack-based)
        status = cdecl_call_function(func, result, args);
    #endif
    
    va_end(args);
    return status;
}

/*# check: REQ-CC-005
  # check: VC-CC-005
  Verify calling convention safety */
int cc_verify_calling_convention(
    const func_desc_t* func,
    const void* expected,
    const void* actual
) {
    /* Safety Rationale: Verify calling convention maintains safety properties
     * Failure Mode: Return error if verification fails
     * Calling Behavior: Safety verification
     * Interface Safety: Interface safety */
    
    // Verify parameter marshaling
    for (int i = 0; i < func->param_count; i++) {
        size_t size = func->params[i].size;
        
        if (memcmp(
            (const char*)expected + i * sizeof(void*),
            (const char*)actual + i * sizeof(void*),
            size
        ) != 0) {
            return -(i + 1);  // Parameter mismatch
        }
    }
    
    // Verify return value
    if (memcmp(
        expected + func->param_count * sizeof(void*),
        actual + func->param_count * sizeof(void*),
        func->return_type.size
    ) != 0) {
        return func->param_count + 1;  // Return value mismatch
    }
    
    return 0;  // Calling convention verified
}

/*# check: REQ-CC-006
  # check: VC-CC-006
  Generate calling convention verification report */
void generate_cc_verification_report(
    const func_desc_t* func,
    const void* expected,
    const void* actual,
    const char* output_file
) {
    /* Safety Rationale: Document calling convention verification results
     * Failure Mode: None (safe operation)
     * Calling Behavior: Reporting
     * Interface Safety: Evidence generation */
    
    int result = cc_verify_calling_convention(func, expected, actual);
    
    log_event(EVENT_CC_VERIFICATION);
    log_value("FUNCTION", (uint64_t)func->name);
    log_value("VERIFICATION_RESULT", result);
    
    if (result < 0) {
        log_value("FAILED_PARAMETER", -result);
    } else if (result > 0) {
        log_value("FAILED_RETURN", result);
    }
}
```

> **Verification Note**: For DO-178C Level A, all calling convention abstraction logic must be formally verified and documented in the safety case.

---

## Handling Floating-Point and Precision Differences

The transition from x87 FPU (x86) to SSE-based operations (x64) introduces precision and behavior differences that impact safety-critical calculations.

### Safe Pattern: Floating-Point Abstraction Layer

```c
/*
 * # Summary: Floating-point abstraction layer for migration safety
 * # Requirement: REQ-FP-001
 * # Verification: VC-FP-001
 * # Test: TEST-FP-001
 *
 * Floating-Point Considerations:
 *
 * 1. Safety Rules:
 *    - Verified floating-point behavior consistency
 *    - Complete precision verification
 *    - Architecture-independent calculation safety
 *
 * 2. Safety Verification:
 *    - Floating-point behavior verified
 *    - No unverified calculation operations
 *    - Safety properties maintained
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <math.h>

// Floating-point precision levels
typedef enum {
    FP_PRECISION_SINGLE,   // 32-bit (float)
    FP_PRECISION_DOUBLE,   // 64-bit (double)
    FP_PRECISION_EXTENDED  // 80-bit (x87)
} fp_precision_t;

// Floating-point rounding modes
typedef enum {
    FP_ROUND_NEAREST,
    FP_ROUND_DOWN,
    FP_ROUND_UP,
    FP_ROUND_TOWARD_ZERO
} fp_rounding_mode_t;

// Floating-point exception flags
#define FP_EX_INVALID    0x01
#define FP_EX_DIVZERO    0x02
#define FP_EX_OVERFLOW   0x04
#define FP_EX_UNDERFLOW  0x08
#define FP_EX_INEXACT    0x10

// Floating-point abstraction functions
void fp_init();
void fp_set_precision(fp_precision_t precision);
void fp_set_rounding_mode(fp_rounding_mode_t mode);
uint32_t fp_get_exceptions();
void fp_clear_exceptions();
double fp_add(double a, double b);
double fp_sub(double a, double a, double b);
double fp_mul(double a, double b);
double fp_div(double a, double b);
int fp_compare(double a, double b);
int fp_is_nan(double x);
int fp_is_inf(double x);

/*# check: REQ-FP-002
  # check: VC-FP-002
  Initialize floating-point abstraction */
void fp_init() {
    /* Safety Rationale: Establish safe floating-point environment
     * Failure Mode: None (safe operation)
     * FP Behavior: Initialization
     * Interface Safety: Calculation safety */
    
    // Architecture-specific initialization
    #ifdef __x86_64__
        // x64: SSE-based floating-point
        init_sse_fp();
    #else
        // x86: x87 FPU
        init_x87_fp();
    #endif
    
    // Set default precision and rounding
    fp_set_precision(FP_PRECISION_DOUBLE);
    fp_set_rounding_mode(FP_ROUND_NEAREST);
}

/*# check: REQ-FP-003
  # check: VC-FP-003
  Set floating-point precision */
void fp_set_precision(fp_precision_t precision) {
    /* Safety Rationale: Set floating-point precision safely
     * Failure Mode: None (safe operation)
     * FP Behavior: Precision setting
     * Interface Safety: Calculation precision */
    
    #ifdef __x86_64__
        // x64: SSE control register
        uint32_t mxcsr = get_mxcsr();
        
        // Clear precision bits
        mxcsr &= ~0x6000;
        
        // Set new precision
        switch (precision) {
            case FP_PRECISION_SINGLE:
                mxcsr |= 0x0000;  // Single precision
                break;
            case FP_PRECISION_DOUBLE:
                mxcsr |= 0x2000;  // Double precision
                break;
            case FP_PRECISION_EXTENDED:
                mxcsr |= 0x3000;  // Extended precision (not fully supported in SSE)
                break;
        }
        
        set_mxcsr(mxcsr);
    #else
        // x86: x87 control word
        uint16_t cw = get_control_word();
        
        // Clear precision bits
        cw &= ~0x0300;
        
        // Set new precision
        switch (precision) {
            case FP_PRECISION_SINGLE:
                cw |= 0x0000;  // Single precision
                break;
            case FP_PRECISION_DOUBLE:
                cw |= 0x0200;  // Double precision
                break;
            case FP_PRECISION_EXTENDED:
                cw |= 0x0300;  // Extended precision
                break;
        }
        
        set_control_word(cw);
    #endif
}

/*# check: REQ-FP-004
  # check: VC-FP-004
  Set floating-point rounding mode */
void fp_set_rounding_mode(fp_rounding_mode_t mode) {
    /* Safety Rationale: Set rounding mode safely
     * Failure Mode: None (safe operation)
     * FP Behavior: Rounding control
     * Interface Safety: Calculation consistency */
    
    #ifdef __x86_64__
        // x64: SSE control register
        uint32_t mxcsr = get_mxcsr();
        
        // Clear rounding bits
        mxcsr &= ~0x6000;
        
        // Set new rounding mode
        switch (mode) {
            case FP_ROUND_NEAREST:
                mxcsr |= 0x0000;
                break;
            case FP_ROUND_DOWN:
                mxcsr |= 0x2000;
                break;
            case FP_ROUND_UP:
                mxcsr |= 0x4000;
                break;
            case FP_ROUND_TOWARD_ZERO:
                mxcsr |= 0x6000;
                break;
        }
        
        set_mxcsr(mxcsr);
    #else
        // x86: x87 control word
        uint16_t cw = get_control_word();
        
        // Clear rounding bits
        cw &= ~0x0C00;
        
        // Set new rounding mode
        switch (mode) {
            case FP_ROUND_NEAREST:
                cw |= 0x0000;
                break;
            case FP_ROUND_DOWN:
                cw |= 0x0400;
                break;
            case FP_ROUND_UP:
                cw |= 0x0800;
                break;
            case FP_ROUND_TOWARD_ZERO:
                cw |= 0x0C00;
                break;
        }
        
        set_control_word(cw);
    #endif
}

/*# check: REQ-FP-005
  # check: VC-FP-005
  Get floating-point exception flags */
uint32_t fp_get_exceptions() {
    /* Safety Rationale: Get exception flags safely
     * Failure Mode: None (safe operation)
     * FP Behavior: Exception checking
     * Interface Safety: Error detection */
    
    #ifdef __x86_64__
        return get_mxcsr() & 0x3F;
    #else
        return get_status_word() & 0x3F;
    #endif
}

/*# check: REQ-FP-006
  # check: VC-FP-006
  Clear floating-point exceptions */
void fp_clear_exceptions() {
    /* Safety Rationale: Clear exception flags safely
     * Failure Mode: None (safe operation)
     * FP Behavior: Exception clearing
     * Interface Safety: Error recovery */
    
    #ifdef __x86_64__
        uint32_t mxcsr = get_mxcsr();
        mxcsr &= ~0x3F;  // Clear exception flags
        set_mxcsr(mxcsr);
    #else
        clear_status_word();
    #endif
}

/*# check: REQ-FP-007
  # check: VC-FP-007
  Verify floating-point consistency across architectures */
int fp_verify_consistency(
    double (*x86_function)(double, double),
    double (*x64_function)(double, double),
    double a,
    double b,
    double max_relative_error
) {
    /* Safety Rationale: Verify FP behavior consistency across architectures
     * Failure Mode: Return error if inconsistent
     * FP Behavior: Cross-architecture verification
     * Interface Safety: Calculation safety */
    
    #ifndef __x86_64__
        double x86_result = x86_function(a, b);
        double x64_result = x64_function(a, b);
        
        double absolute_error = fabs(x64_result - x86_result);
        double relative_error = (x86_result != 0.0) ? absolute_error / fabs(x86_result) : absolute_error;
        
        return (relative_error <= max_relative_error) ? 0 : -1;
    #else
        // On x64 platform, we can't run x86 code directly
        // This would require a cross-architecture test framework
        return 0;  // Placeholder for actual verification
    #endif
}

/*# check: REQ-FP-008
  # check: VC-FP-008
  Generate floating-point verification report */
void generate_fp_verification_report(
    const char* operation,
    double a,
    double b,
    double x86_result,
    double x64_result,
    double max_relative_error,
    const char* output_file
) {
    /* Safety Rationale: Document FP verification results
     * Failure Mode: None (safe operation)
     * FP Behavior: Reporting
     * Interface Safety: Evidence generation */
    
    double absolute_error = fabs(x64_result - x86_result);
    double relative_error = (x86_result != 0.0) ? absolute_error / fabs(x86_result) : absolute_error;
    int consistent = (relative_error <= max_relative_error);
    
    log_event(EVENT_FP_VERIFICATION);
    log_string("OPERATION", operation);
    log_value("A", *(uint64_t*)&a);
    log_value("B", *(uint64_t*)&b);
    log_value("X86_RESULT", *(uint64_t*)&x86_result);
    log_value("X64_RESULT", *(uint64_t*)&x64_result);
    log_value("RELATIVE_ERROR", *(uint64_t*)&relative_error);
    log_value("MAX_ERROR", *(uint64_t*)&max_relative_error);
    log_value("CONSISTENT", consistent);
}
```

> **Verification Note**: For DO-178C Level A, all floating-point abstraction logic must be formally verified and documented in the safety case.

---

## Managing Toolchain Qualification During Migration

Architecture migration requires complete requalification of the toolchain, as the tools themselves may behave differently on the new architecture.

### Safe Pattern: Toolchain Requalification Framework

```python
#!/usr/bin/env python3
"""
toolchain_requalification.py
Tool ID: TQ-TOOLCHAIN-001
"""

import json
import os
import subprocess
import hashlib
from datetime import datetime

class ToolchainRequalification:
    """Manages toolchain requalification for architecture migration."""
    
    def __init__(self, db_path="toolchain.db"):
        self.db_path = db_path
        self._load_database()
    
    def _load_database(self):
        """Load toolchain database from file."""
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                self.db = json.load(f)
        else:
            self.db = {
                'tools': {
                    'assembler': {
                        'name': 'GNU Assembler',
                        'versions': {},
                        'qualification_requirements': [
                            'REQ-TOOL-001',
                            'REQ-TOOL-002',
                            'REQ-TOOL-003'
                        ]
                    },
                    'compiler': {
                        'name': 'GCC',
                        'versions': {},
                        'qualification_requirements': [
                            'REQ-TOOL-004',
                            'REQ-TOOL-005',
                            'REQ-TOOL-006'
                        ]
                    },
                    'linker': {
                        'name': 'GNU Linker',
                        'versions': {},
                        'qualification_requirements': [
                            'REQ-TOOL-007',
                            'REQ-TOOL-008',
                            'REQ-TOOL-009'
                        ]
                    }
                },
                'qualifications': []
            }
    
    def _save_database(self):
        """Save toolchain database to file."""
        with open(self.db_path, 'w') as f:
            json.dump(self.db, f, indent=2)
    
    def register_tool_version(self, tool_type, version, architecture, path):
        """Register a tool version for qualification."""
        if tool_type not in self.db['tools']:
            raise ValueError(f"Unknown tool type: {tool_type}")
        
        if version in self.db['tools'][tool_type]['versions']:
            if architecture in self.db['tools'][tool_type]['versions'][version]:
                raise ValueError(f"Tool version {version} for {architecture} already registered")
        
        # Calculate tool hash
        tool_hash = self._calculate_tool_hash(path)
        
        # Register tool version
        if version not in self.db['tools'][tool_type]['versions']:
            self.db['tools'][tool_type]['versions'][version] = {}
        
        self.db['tools'][tool_type]['versions'][version][architecture] = {
            'path': path,
            'hash': tool_hash,
            'registered': datetime.now().isoformat()
        }
    
    def _calculate_tool_hash(self, path):
        """Calculate SHA-256 hash of tool binary."""
        sha256_hash = hashlib.sha256()
        with open(path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def qualify_tool_version(self, tool_type, version, architecture, qualification_id, evidence):
        """Qualify a tool version for a specific architecture."""
        if tool_type not in self.db['tools']:
            raise ValueError(f"Unknown tool type: {tool_type}")
        
        if version not in self.db['tools'][tool_type]['versions']:
            raise ValueError(f"Tool version {version} not registered")
        
        if architecture not in self.db['tools'][tool_type]['versions'][version]:
            raise ValueError(f"Tool version {version} not registered for {architecture}")
        
        # Create qualification record
        qualification = {
            'id': qualification_id,
            'tool_type': tool_type,
            'version': version,
            'architecture': architecture,
            'requirements': self.db['tools'][tool_type]['qualification_requirements'],
            'evidence': evidence,
            'qualified': datetime.now().isoformat(),
            'status': 'qualified'
        }
        
        self.db['qualifications'].append(qualification)
    
    def verify_architecture_consistency(self, tool_type, version, x86_path, x64_path):
        """Verify that tool behavior is consistent across architectures."""
        # Run test suite on both architectures
        x86_results = self._run_test_suite(tool_type, version, 'x86', x86_path)
        x64_results = self._run_test_suite(tool_type, version, 'x64', x64_path)
        
        # Compare results
        consistent = self._compare_test_results(x86_results, x64_results)
        
        return {
            'x86_path': x86_path,
            'x64_path': x64_path,
            'consistent': consistent,
            'x86_results': x86_results,
            'x64_results': x64_results
        }
    
    def _run_test_suite(self, tool_type, version, architecture, tool_path):
        """Run test suite for a tool version."""
        # In a real system, this would run a comprehensive test suite
        # For this example, we'll simulate test results
        
        return {
            'tool': f"{tool_type}-{version}-{architecture}",
            'tests_run': 100,
            'tests_passed': 100,
            'verification_coverage': 95.0
        }
    
    def _compare_test_results(self, x86_results, x64_results):
        """Compare test results between architectures."""
        # In a real system, this would perform detailed comparison
        # For this example, we'll just check basic consistency
        
        return (x86_results['tests_passed'] == x64_results['tests_passed'] and
                abs(x86_results['verification_coverage'] - x64_results['verification_coverage']) < 0.1)
    
    def generate_qualification_report(self, output_file):
        """Generate toolchain qualification report."""
        report = {
            'metadata': {
                'tool_version': '1.0',
                'generation_time': datetime.now().isoformat()
            },
            'tools': {},
            'qualifications': []
        }
        
        # Tool information
        for tool_type, tool_info in self.db['tools'].items():
            report['tools'][tool_type] = {
                'name': tool_info['name'],
                'versions': {}
            }
            
            for version, archs in tool_info['versions'].items():
                report['tools'][tool_type]['versions'][version] = {
                    'architectures': list(archs.keys()),
                    'registered': archs[list(archs.keys())[0]]['registered']
                }
        
        # Qualification information
        for qualification in self.db['qualifications']:
            report['qualifications'].append({
                'id': qualification['id'],
                'tool': qualification['tool_type'],
                'version': qualification['version'],
                'architecture': qualification['architecture'],
                'status': qualification['status'],
                'qualified': qualification['qualified']
            })
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return output_file
    
    def generate_architecture_comparison_report(self, output_file):
        """Generate architecture comparison report for toolchain."""
        report = {
            'metadata': {
                'tool_version': '1.0',
                'generation_time': datetime.now().isoformat()
            },
            'comparisons': []
        }
        
        # Compare tool behavior across architectures
        for tool_type in self.db['tools']:
            for version in self.db['tools'][tool_type]['versions']:
                architectures = list(self.db['tools'][tool_type]['versions'][version].keys())
                
                if 'x86' in architectures and 'x64' in architectures:
                    x86_path = self.db['tools'][tool_type]['versions'][version]['x86']['path']
                    x64_path = self.db['tools'][tool_type]['versions'][version]['x64']['path']
                    
                    comparison = self.verify_architecture_consistency(
                        tool_type, version, x86_path, x64_path
                    )
                    
                    report['comparisons'].append({
                        'tool': f"{tool_type}-{version}",
                        'consistent': comparison['consistent'],
                        'x86_results': comparison['x86_results'],
                        'x64_results': comparison['x64_results']
                    })
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return output_file

# Example usage
if __name__ == "__main__":
    requalifier = ToolchainRequalification()
    
    # Register tool versions
    requalifier.register_tool_version(
        "assembler",
        "2.38",
        "x86",
        "/usr/bin/as"
    )
    
    requalifier.register_tool_version(
        "assembler",
        "2.38",
        "x64",
        "/usr/bin/as"
    )
    
    requalifier.register_tool_version(
        "compiler",
        "11.2.0",
        "x86",
        "/usr/bin/gcc"
    )
    
    requalifier.register_tool_version(
        "compiler",
        "11.2.0",
        "x64",
        "/usr/bin/gcc"
    )
    
    # Qualify tools
    requalifier.qualify_tool_version(
        "assembler",
        "2.38",
        "x86",
        "TQ-ASM-X86-001",
        ["test_results_x86.zip", "verification_report_x86.pdf"]
    )
    
    requalifier.qualify_tool_version(
        "assembler",
        "2.38",
        "x64",
        "TQ-ASM-X64-001",
        ["test_results_x64.zip", "verification_report_x64.pdf"]
    )
    
    requalifier.qualify_tool_version(
        "compiler",
        "11.2.0",
        "x86",
        "TQ-GCC-X86-001",
        ["test_results_x86.zip", "verification_report_x86.pdf"]
    )
    
    requalifier.qualify_tool_version(
        "compiler",
        "11.2.0",
        "x64",
        "TQ-GCC-X64-001",
        ["test_results_x64.zip", "verification_report_x64.pdf"]
    )
    
    # Generate reports
    requalifier.generate_qualification_report("toolchain_qualification_report.json")
    requalifier.generate_architecture_comparison_report("architecture_comparison_report.json")
    
    # Save database
    requalifier._save_database()
```

> **Certification Note**: This tool must be qualified as TQL-2 per DO-178C before it can generate valid certification evidence.

---

## Real-World Case Study: Avionics System Migration from x86 to x64

**System**: Primary Flight Control Computer (PFCC) for commercial aircraft.

**Challenge**: Migrate from x86 to x64 while maintaining DO-178C Level A certification.

**Solution**:
1. Implemented comprehensive migration safety assessment:
   - Documented all architectural differences and safety impacts
   - Verified memory model, register usage, and calling convention changes
   - Created abstraction layers for critical architecture-specific code
2. Developed cross-architecture verification framework:
   - Verified consistent behavior across architectures
   - Generated evidence for certification body
   - Ensured timing behavior met requirements
3. Executed toolchain requalification:
   - Qualified all tools for both architectures
   - Verified consistent tool behavior
   - Documented qualification process

**Migration Safety Assessment Highlights**:
- **Memory Model**: Implemented memory model abstraction layer to handle flat vs. segmented addressing
- **Register Usage**: Created register abstraction layer to manage different preservation requirements
- **Calling Conventions**: Developed calling convention abstraction for stack-based vs. register-based parameter passing
- **Floating-Point**: Implemented FP abstraction to handle x87 vs. SSE precision differences
- **Stack Alignment**: Added stack alignment verification for 16-byte requirement in x64

**Verification Approach**:
- Cross-architecture testing with identical inputs
- WCET analysis on both architectures
- Memory safety verification with abstraction layer
- Register preservation verification
- Calling convention verification
- Floating-point behavior consistency testing

**Outcome**: Successful migration with zero safety incidents. The certification body approved the migration based on the comprehensive safety assessment and verification evidence, noting that the abstraction layers and verification framework provided "exemplary evidence of safety property preservation across architectures."

---

## Tiered Exercises: Building Your Own Architecture Migration System

### Exercise 1: Basic — Implement Memory Model Abstraction

**Goal**: Create a basic memory model abstraction layer.

**Tasks**:
- Define memory protection requirements
- Implement region registration
- Add access verification
- Generate memory protection reports
- Verify abstraction layer

**Deliverables**:
- `memory_abstraction.c`, `memory_abstraction.h`
- Test harness for memory protection
- Verification report

---

### Exercise 2: Intermediate — Add Register Abstraction

**Goal**: Extend the system with register abstraction.

**Tasks**:
- Implement register state management
- Add preservation verification
- Generate register verification reports
- Verify behavior across architectures
- Integrate with memory abstraction

**Deliverables**:
- `register_abstraction.c`, `register_abstraction.h`
- Test cases for register preservation
- Traceability matrix

---

### Exercise 3: Advanced — Full Architecture Migration System

**Goal**: Build a complete architecture migration verification system.

**Tasks**:
- Implement all migration components
- Add toolchain requalification
- Qualify all migration tools
- Package certification evidence
- Test with architecture migration simulation

**Deliverables**:
- Complete migration source code
- Qualified tool reports
- `certification_evidence.zip`
- Migration simulation results

---

## Verification Pitfalls to Avoid

| Pitfall | Mitigation |
|--------|------------|
| Assuming binary compatibility | Verify all code paths for architectural differences |
| Incomplete memory model verification | Implement memory model abstraction with verification |
| Ignoring register preservation differences | Create register abstraction layer with verification |
| Overlooking calling convention changes | Implement calling convention abstraction |
| Neglecting floating-point behavior differences | Create FP abstraction with consistency verification |
| Incomplete toolchain requalification | Qualify all tools for new architecture |

---

## Connection to Next Tutorial: ARM Assembly for Safety-Critical Systems

In **Tutorial #29**, we will cover:
- ARM architecture safety features (MPU, TrustZone)
- Thumb instruction set safety considerations
- ARM-specific calling conventions and register preservation
- Certification considerations for ARM in medical/aviation contexts
- Toolchain qualification differences from x64

You'll learn how to apply the same safety-critical principles to ARM architecture, with specific considerations for its unique features.

> **Final Principle**: *Architecture migration isn't about changing platforms—it's about preserving safety properties across platforms.*
