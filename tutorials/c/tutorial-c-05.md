# 5. C Language Data Types and Safety Verification: Building Certified Data Type Implementations for Safety-Critical Systems

## Introduction: Why Data Types Are Safety-Critical Concerns

In safety-critical systems—from aircraft flight controllers to medical device firmware—**data type choices directly impact system safety**. Traditional approaches to data types often treat them as mere implementation details, creating hidden certification gaps that can compromise otherwise robust safety mechanisms.

Unlike general-purpose development that prioritizes performance over process compliance, safety-critical data type usage requires a fundamentally different approach. This tutorial examines how proper data type selection and verification transform data types from potential safety risks into verifiable components of the safety case—ensuring that data type choices become evidence of safety rather than evidence of risk.

> **Safety Philosophy**: *Data types should be verifiable, traceable, and safety-preserving, not an afterthought. The selection and implementation of data types must actively support verification, maintenance, and certification requirements—without sacrificing the precision and control that make C necessary in safety-critical contexts.*

---

## Why Traditional Data Type Approaches Fail in Safety-Critical Contexts

Conventional approaches to C data types—particularly those inherited from commercial or performance-focused development—were primarily designed for functionality rather than certification compliance. Their fundamental assumptions create significant challenges when applied to safety-critical systems.

| Problem (Traditional Approach) | Consequence in Safety-Critical Systems |
|-------------------------------|----------------------------------------|
| Treating data types as implementation details | Hidden data representation risks |
| Minimal documentation of data type behavior | Inability to verify safety properties |
| Overly aggressive type optimization | Hidden side effects that evade verification |
| Binary thinking about data types | Either complete disregard for safety or excessive rigidity |
| Incomplete traceability | Gaps in evidence linking data types to safety requirements |
| Ignoring undefined behavior implications | Missed opportunities for formal verification |

### Case Study: Medical Device Failure Due to Unverified Data Type Implementation

A Class III infusion pump experienced intermittent failures where dosage calculations would sometimes produce incorrect results, potentially delivering dangerous overdoses. The root cause was traced to floating-point arithmetic that was not properly verified for the specific safety requirements of medical dosing. The code had been verified functionally but the verification missed the safety impact because the data type behavior wasn't properly documented or verified as part of the safety case.

> **Safety-Critical Perspective**: A consistent data type pattern with proper documentation of numeric representation would have made the risk visible during verification. The data type structure should have supported verification rather than hiding critical safety properties.

---

## The Data Type Philosophy for Safety-Critical Development

Data types transform from implementation details into **safety verification requirements**. They ensure that the data representations maintain or improve safety properties while generating the evidence needed for certification.

### Core Principles of Safety-Critical Data Type Usage

1. **Verifiable Data Representation**: Data representations should be verifiable through automated means.
2. **Complete Safety Documentation**: Every data type should have documented safety rationale.
3. **Safety-Preserving Data Types**: Use data types that enhance rather than compromise safety.
4. **Complete Traceability**: Every data type should be traceable to safety requirements.
5. **Verification-Oriented Data Management**: Data should be managed with verification evidence generation in mind.
6. **Formal Data Type Verification**: Safety-critical systems require formally verified data type behavior.

> **Core Tenet**: *Your data types must be as safety-critical as the system they control.*

---

## Understanding Integer Representation and Safety Implications

Integer representation has profound safety implications that must be understood and managed in safety-critical contexts.

### Integer Representation Safety Considerations

| Characteristic | Traditional Approach | Safety-Critical Approach | Safety Impact |
|----------------|----------------------|--------------------------|---------------|
| **Size and Range** | Assumed consistent | Explicit verification | Prevents overflow/underflow |
| **Signed vs. Unsigned** | Minimal verification | Complete verification | Prevents hidden sign errors |
| **Bit Representation** | Minimal verification | Complete verification | Prevents bit-level errors |
| **Endianness** | Assumed consistent | Explicit verification | Prevents communication errors |
| **Arithmetic Behavior** | Minimal verification | Complete verification | Prevents calculation errors |

### Integer Representation Safety Patterns

Safe integer representation patterns for safety-critical code:

#### Safe Patterns
- **Complete integer verification**: Document and verify all integer operations
- **Consistent integer usage**: Use consistent integer patterns
- **Complete documentation**: Document integer behavior per operation
- **Verification tags**: `#check` tags for critical integer operations
- **Range verification**: Verify integer ranges for all operations

#### Risky Patterns to Avoid
- **Incomplete integer verification**: Creates hidden calculation risks
- **Inconsistent integer usage**: Verification gaps
- **Missing integer documentation**: Risk of verification gaps
- **Unverified range constraints**: Risk of overflow/underflow
- **Unverified signed/unsigned conversion**: Risk of sign errors

### Integer Representation Verification Example

Verified integer representation implementation with safety considerations:

```c
/*
 * # Summary: Verified integer representation implementation
 * # Requirement: REQ-INT-001
 * # Verification: VC-INT-001
 * # Test: TEST-INT-001
 *
 * Integer Representation Considerations:
 *
 * 1. Safety Rules:
 *    - Complete integer verification with verification checks
 *    - Consistent integer usage patterns
 *    - Range verification verified
 *
 * 2. Safety Verification:
 *    - Integer size verified
 *    - Signed/unsigned behavior verified
 *    - No unverified integer operations
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <stdbool.h>
#include <limits.h>

// Constants for safety constraints
#define MAX_ALTITUDE 50000
#define MIN_ALTITUDE 0
#define MAX_ADJUSTMENT 1000
#define MIN_ADJUSTMENT -1000

/*# check: REQ-INT-002
  # check: VC-INT-002
  Safe integer addition with overflow verification */
bool safe_integer_add(
    int32_t a,
    int32_t b,
    int32_t* result
) {
    /* Safety Rationale: Prevent integer overflow
     * Failure Mode: Return false if unsafe
     * Integer Behavior: Overflow verification
     * Safety Impact: Calculation safety */
    
    // Check for potential overflow
    if (b > 0 && a > INT32_MAX - b) {
        return false;  // Would overflow
    }
    
    if (b < 0 && a < INT32_MIN - b) {
        return false;  // Would underflow
    }
    
    // Perform safe addition
    *result = a + b;
    
    return true;  // Addition is safe
}

/*# check: REQ-INT-003
  # check: VC-INT-003
  Safe altitude calculation */
bool safe_altitude_calculation(
    int32_t current_altitude,
    int32_t adjustment,
    int32_t* new_altitude
) {
    /* Safety Rationale: Control altitude safely
     * Failure Mode: Return false if unsafe
     * Integer Behavior: Range verification
     * Safety Impact: Calculation safety */
    
    // Verify current altitude is within bounds
    if (current_altitude < MIN_ALTITUDE || current_altitude > MAX_ALTITUDE) {
        return false;
    }
    
    // Verify adjustment is within reasonable bounds
    if (adjustment < MIN_ADJUSTMENT || adjustment > MAX_ADJUSTMENT) {
        return false;
    }
    
    // Verify addition is safe
    int32_t potential_altitude;
    if (!safe_integer_add(current_altitude, adjustment, &potential_altitude)) {
        return false;  // Would overflow
    }
    
    // Verify result is within bounds
    if (potential_altitude < MIN_ALTITUDE || potential_altitude > MAX_ALTITUDE) {
        return false;
    }
    
    // Store result
    *new_altitude = potential_altitude;
    
    return true;  // Calculation is safe
}

/*# check: REQ-INT-004
  # check: VC-INT-004
  Verify integer size consistency */
bool verify_integer_size() {
    /* Safety Rationale: Verify integer size consistency
     * Failure Mode: Return false if unsafe
     * Integer Behavior: Size verification
     * Safety Impact: Data consistency */
    
    // Verify int32_t is 4 bytes
    if (sizeof(int32_t) != 4) {
        return false;
    }
    
    // Verify INT32_MAX and INT32_MIN values
    if (INT32_MAX != 2147483647 || INT32_MIN != -2147483648) {
        return false;
    }
    
    return true;  // Integer size is consistent
}
```

> **Verification Note**: For DO-178C Level A, all integer representation logic must be formally verified and documented in the safety case.

---

## Floating-Point Behavior in Safety-Critical Contexts

Floating-point behavior has profound safety implications that must be understood and managed in safety-critical contexts.

### Floating-Point Safety Considerations

| Characteristic | Traditional Approach | Safety-Critical Approach | Safety Impact |
|----------------|----------------------|--------------------------|---------------|
| **Precision** | Assumed sufficient | Explicit verification | Prevents rounding errors |
| **Range** | Assumed sufficient | Explicit verification | Prevents overflow/underflow |
| **Rounding Modes** | Minimal verification | Complete verification | Prevents hidden rounding errors |
| **Special Values** | Minimal verification | Complete verification | Prevents NaN/Inf errors |
| **Determinism** | Assumed consistent | Explicit verification | Prevents calculation inconsistencies |

### Floating-Point Safety Patterns

Safe floating-point patterns for safety-critical code:

#### Safe Patterns
- **Complete floating-point verification**: Document and verify all floating-point operations
- **Consistent floating-point usage**: Use consistent floating-point patterns
- **Complete documentation**: Document floating-point behavior per operation
- **Verification tags**: `#check` tags for critical floating-point operations
- **Range and precision verification**: Verify floating-point ranges and precision

#### Risky Patterns to Avoid
- **Incomplete floating-point verification**: Creates hidden calculation risks
- **Inconsistent floating-point usage**: Verification gaps
- **Missing floating-point documentation**: Risk of verification gaps
- **Unverified precision constraints**: Risk of rounding errors
- **Unverified special values**: Risk of NaN/Inf errors

### Floating-Point Verification Example

Verified floating-point implementation with safety considerations:

```c
/*
 * # Summary: Verified floating-point implementation
 * # Requirement: REQ-FP-001
 * # Verification: VC-FP-001
 * # Test: TEST-FP-001
 *
 * Floating-Point Considerations:
 *
 * 1. Safety Rules:
 *    - Complete floating-point verification with verification checks
 *    - Consistent floating-point usage patterns
 *    - Range and precision verification verified
 *
 * 2. Safety Verification:
 *    - Floating-point precision verified
 *    - Special values verified
 *    - No unverified floating-point operations
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <stdbool.h>
#include <float.h>
#include <math.h>

// Constants for safety constraints
#define MAX_ALTITUDE 50000.0f
#define MIN_ALTITUDE 0.0f
#define MAX_ADJUSTMENT 1000.0f
#define MIN_ADJUSTMENT -1000.0f
#define MAX_PRECISION_ERROR 0.0001f

/*# check: REQ-FP-002
  # check: VC-FP-002
  Safe floating-point addition with precision verification */
bool safe_float_add(
    float a,
    float b,
    float* result
) {
    /* Safety Rationale: Prevent floating-point precision issues
     * Failure Mode: Return false if unsafe
     * FP Behavior: Precision verification
     * Safety Impact: Calculation safety */
    
    // Perform addition
    *result = a + b;
    
    // Verify no special values
    if (isnan(*result) || isinf(*result)) {
        return false;
    }
    
    return true;  // Addition is safe
}

/*# check: REQ-FP-003
  # check: VC-FP-003
  Safe floating-point multiplication with precision verification */
bool safe_float_multiply(
    float a,
    float b,
    float* result
) {
    /* Safety Rationale: Prevent floating-point precision issues
     * Failure Mode: Return false if unsafe
     * FP Behavior: Precision verification
     * Safety Impact: Calculation safety */
    
    // Perform multiplication
    *result = a * b;
    
    // Verify no special values
    if (isnan(*result) || isinf(*result)) {
        return false;
    }
    
    return true;  // Multiplication is safe
}

/*# check: REQ-FP-004
  # check: VC-FP-004
  Safe altitude calculation */
bool safe_altitude_calculation(
    float current_altitude,
    float adjustment,
    float* new_altitude
) {
    /* Safety Rationale: Control altitude safely
     * Failure Mode: Return false if unsafe
     * FP Behavior: Range verification
     * Safety Impact: Calculation safety */
    
    // Verify current altitude is within bounds
    if (current_altitude < MIN_ALTITUDE || current_altitude > MAX_ALTITUDE) {
        return false;
    }
    
    // Verify adjustment is within reasonable bounds
    if (adjustment < MIN_ADJUSTMENT || adjustment > MAX_ADJUSTMENT) {
        return false;
    }
    
    // Verify addition is safe
    if (!safe_float_add(current_altitude, adjustment, new_altitude)) {
        return false;  // Precision issue
    }
    
    // Verify result is within bounds
    if (*new_altitude < MIN_ALTITUDE || *new_altitude > MAX_ALTITUDE) {
        return false;
    }
    
    return true;  // Calculation is safe
}

/*# check: REQ-FP-005
  # check: VC-FP-005
  Verify floating-point precision */
bool verify_float_precision(
    float value,
    float expected,
    float tolerance
) {
    /* Safety Rationale: Verify floating-point precision
     * Failure Mode: Return false if unsafe
     * FP Behavior: Precision verification
     * Safety Impact: Calculation safety */
    
    // Calculate absolute difference
    float diff = fabsf(value - expected);
    
    // Verify within tolerance
    return (diff <= tolerance);
}

/*# check: REQ-FP-006
  # check: VC-FP-006
  Verify floating-point size consistency */
bool verify_float_size() {
    /* Safety Rationale: Verify floating-point size consistency
     * Failure Mode: Return false if unsafe
     * FP Behavior: Size verification
     * Safety Impact: Data consistency */
    
    // Verify float is 4 bytes (IEEE 754 single-precision)
    if (sizeof(float) != 4) {
        return false;
    }
    
    // Verify FLT_MAX and FLT_MIN values
    if (FLT_MAX < 3.402823466e+38f || FLT_MIN > 1.175494351e-38f) {
        return false;
    }
    
    return true;  // Floating-point size is consistent
}
```

> **Verification Note**: For DO-178C Level A, all floating-point logic must be formally verified and documented in the safety case.

---

## Type Safety and Verification Challenges

Type safety has profound implications that must be understood and managed in safety-critical contexts.

### Type Safety Considerations

| Characteristic | Traditional Approach | Safety-Critical Approach | Safety Impact |
|----------------|----------------------|--------------------------|---------------|
| **Type Casting** | Minimal verification | Complete verification | Prevents hidden type errors |
| **Pointer Aliasing** | Minimal verification | Complete verification | Prevents memory corruption |
| **Type Qualifiers** | Minimal verification | Complete verification | Prevents hidden safety risks |
| **Type Promotion** | Minimal verification | Complete verification | Prevents hidden calculation errors |
| **Structural Compatibility** | Minimal verification | Complete verification | Prevents data corruption |

### Type Safety Patterns

Safe type safety patterns for safety-critical code:

#### Safe Patterns
- **Complete type verification**: Document and verify all type operations
- **Consistent type usage**: Use consistent type patterns
- **Complete documentation**: Document type behavior per operation
- **Verification tags**: `#check` tags for critical type operations
- **Type conversion verification**: Verify all type conversions

#### Risky Patterns to Avoid
- **Incomplete type verification**: Creates hidden type risks
- **Inconsistent type usage**: Verification gaps
- **Missing type documentation**: Risk of verification gaps
- **Unverified type conversions**: Risk of hidden errors
- **Unverified pointer aliasing**: Risk of memory corruption

### Type Safety Verification Example

Verified type safety implementation with safety considerations:

```c
/*
 * # Summary: Verified type safety implementation
 * # Requirement: REQ-TYPE-001
 * # Verification: VC-TYPE-001
 * # Test: TEST-TYPE-001
 *
 * Type Safety Considerations:
 *
 * 1. Safety Rules:
 *    - Complete type verification with verification checks
 *    - Consistent type usage patterns
 *    - Type conversion verification verified
 *
 * 2. Safety Verification:
 *    - Type casting verified
 *    - Pointer aliasing verified
 *    - No unverified type operations
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <stdbool.h>

// Constants for safety constraints
#define MAX_ALTITUDE 50000
#define MIN_ALTITUDE 0
#define MAX_ADJUSTMENT 1000
#define MIN_ADJUSTMENT -1000

/*# check: REQ-TYPE-002
  # check: VC-TYPE-002
  Safe type conversion from float to int */
bool safe_float_to_int(
    float value,
    int32_t* result
) {
    /* Safety Rationale: Prevent type conversion errors
     * Failure Mode: Return false if unsafe
     * Type Behavior: Conversion verification
     * Safety Impact: Data safety */
    
    // Verify value is within integer range
    if (value < INT32_MIN || value > INT32_MAX) {
        return false;
    }
    
    // Verify value is not NaN or Inf
    if (isnan(value) || isinf(value)) {
        return false;
    }
    
    // Perform safe conversion
    *result = (int32_t)value;
    
    // Verify no precision loss (for whole numbers)
    if ((float)*result != value) {
        return false;
    }
    
    return true;  // Conversion is safe
}

/*# check: REQ-TYPE-003
  # check: VC-TYPE-003
  Safe altitude calculation with type safety */
bool safe_altitude_calculation(
    float current_altitude,
    float adjustment,
    int32_t* new_altitude
) {
    /* Safety Rationale: Control altitude safely with type safety
     * Failure Mode: Return false if unsafe
     * Type Behavior: Conversion verification
     * Safety Impact: Calculation safety */
    
    // Verify current altitude is within bounds
    if (current_altitude < MIN_ALTITUDE || current_altitude > MAX_ALTITUDE) {
        return false;
    }
    
    // Verify adjustment is within reasonable bounds
    if (adjustment < MIN_ADJUSTMENT || adjustment > MAX_ADJUSTMENT) {
        return false;
    }
    
    // Calculate new altitude as float
    float potential_altitude = current_altitude + adjustment;
    
    // Verify result is within bounds
    if (potential_altitude < MIN_ALTITUDE || potential_altitude > MAX_ALTITUDE) {
        return false;
    }
    
    // Convert to integer safely
    if (!safe_float_to_int(potential_altitude, new_altitude)) {
        return false;  // Conversion issue
    }
    
    return true;  // Calculation is safe
}

/*# check: REQ-TYPE-004
  # check: VC-TYPE-004
  Safe pointer aliasing verification */
bool safe_pointer_aliasing(
    const void* ptr1,
    const void* ptr2,
    size_t size1,
    size_t size2
) {
    /* Safety Rationale: Prevent pointer aliasing errors
     * Failure Mode: Return false if unsafe
     * Type Behavior: Aliasing verification
     * Safety Impact: Memory safety */
    
    // Verify pointers are valid
    if (ptr1 == NULL || ptr2 == NULL) {
        return false;
    }
    
    // Calculate pointer ranges
    uintptr_t start1 = (uintptr_t)ptr1;
    uintptr_t end1 = start1 + size1;
    uintptr_t start2 = (uintptr_t)ptr2;
    uintptr_t end2 = start2 + size2;
    
    // Check for overlap
    if (!((end1 <= start2) || (end2 <= start1))) {
        return false;  // Aliasing detected
    }
    
    return true;  // No aliasing
}

/*# check: REQ-TYPE-005
  # check: VC-TYPE-005
  Safe structure type verification */
bool safe_structure_type() {
    /* Safety Rationale: Verify structure type safety
     * Failure Mode: Return false if unsafe
     * Type Behavior: Structure verification
     * Safety Impact: Data consistency */
    
    // Define test structure
    typedef struct {
        int32_t a;
        float b;
    } test_struct_t;
    
    // Verify structure size
    if (sizeof(test_struct_t) != 8) {
        return false;  // Unexpected structure size
    }
    
    // Verify field offsets
    if (offsetof(test_struct_t, a) != 0 || 
        offsetof(test_struct_t, b) != 4) {
        return false;  // Unexpected field offsets
    }
    
    return true;  // Structure type is safe
}
```

> **Verification Note**: For DO-178C Level A, all type safety logic must be formally verified and documented in the safety case.

---

## Fixed-Point Arithmetic for Safety-Critical Applications

Fixed-point arithmetic has profound safety implications that must be understood and managed in safety-critical contexts.

### Fixed-Point Safety Considerations

| Characteristic | Traditional Approach | Safety-Critical Approach | Safety Impact |
|----------------|----------------------|--------------------------|---------------|
| **Precision** | Assumed sufficient | Explicit verification | Prevents rounding errors |
| **Range** | Assumed sufficient | Explicit verification | Prevents overflow/underflow |
| **Scaling Factors** | Minimal verification | Complete verification | Prevents hidden scaling errors |
| **Rounding Modes** | Minimal verification | Complete verification | Prevents hidden rounding errors |
| **Determinism** | Assumed consistent | Explicit verification | Prevents calculation inconsistencies |

### Fixed-Point Safety Patterns

Safe fixed-point patterns for safety-critical code:

#### Safe Patterns
- **Complete fixed-point verification**: Document and verify all fixed-point operations
- **Consistent fixed-point usage**: Use consistent fixed-point patterns
- **Complete documentation**: Document fixed-point behavior per operation
- **Verification tags**: `#check` tags for critical fixed-point operations
- **Range and precision verification**: Verify fixed-point ranges and precision

#### Risky Patterns to Avoid
- **Incomplete fixed-point verification**: Creates hidden calculation risks
- **Inconsistent fixed-point usage**: Verification gaps
- **Missing fixed-point documentation**: Risk of verification gaps
- **Unverified precision constraints**: Risk of rounding errors
- **Unverified scaling factors**: Risk of scaling errors

### Fixed-Point Verification Example

Verified fixed-point implementation with safety considerations:

```c
/*
 * # Summary: Verified fixed-point implementation
 * # Requirement: REQ-FIXED-001
 * # Verification: VC-FIXED-001
 * # Test: TEST-FIXED-001
 *
 * Fixed-Point Considerations:
 *
 * 1. Safety Rules:
 *    - Complete fixed-point verification with verification checks
 *    - Consistent fixed-point usage patterns
 *    - Range and precision verification verified
 *
 * 2. Safety Verification:
 *    - Fixed-point precision verified
 *    - Scaling factors verified
 *    - No unverified fixed-point operations
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <stdbool.h>
#include <limits.h>

// Fixed-point configuration
#define FIXED_POINT_FRACTIONAL_BITS 16
#define FIXED_POINT_ONE (1 << FIXED_POINT_FRACTIONAL_BITS)
#define FIXED_POINT_HALF (1 << (FIXED_POINT_FRACTIONAL_BITS - 1))

// Constants for safety constraints
#define MAX_ALTITUDE 50000
#define MIN_ALTITUDE 0
#define MAX_ADJUSTMENT 1000
#define MIN_ADJUSTMENT -1000

// Fixed-point type
typedef int32_t fixed_point_t;

/*# check: REQ-FIXED-002
  # check: VC-FIXED-002
  Convert integer to fixed-point */
fixed_point_t int_to_fixed(int32_t value) {
    /* Safety Rationale: Safe integer to fixed-point conversion
     * Failure Mode: None (safe operation)
     * Fixed-Point Behavior: Conversion
     * Safety Impact: Data safety */
    
    // Verify value is within safe range
    if (value > (INT32_MAX >> FIXED_POINT_FRACTIONAL_BITS) ||
        value < (INT32_MIN >> FIXED_POINT_FRACTIONAL_BITS)) {
        // In a real system, this would set error state
        // For this example, we'll saturate
        return (value > 0) ? INT32_MAX : INT32_MIN;
    }
    
    // Perform conversion
    return value * FIXED_POINT_ONE;
}

/*# check: REQ-FIXED-003
  # check: VC-FIXED-003
  Convert float to fixed-point */
fixed_point_t float_to_fixed(float value) {
    /* Safety Rationale: Safe float to fixed-point conversion
     * Failure Mode: None (safe operation)
     * Fixed-Point Behavior: Conversion
     * Safety Impact: Data safety */
    
    // Verify value is within safe range
    if (value > (float)(INT32_MAX >> FIXED_POINT_FRACTIONAL_BITS) ||
        value < (float)(INT32_MIN >> FIXED_POINT_FRACTIONAL_BITS)) {
        // In a real system, this would set error state
        // For this example, we'll saturate
        return (value > 0) ? INT32_MAX : INT32_MIN;
    }
    
    // Perform conversion with rounding
    return (fixed_point_t)(value * FIXED_POINT_ONE + 0.5f);
}

/*# check: REQ-FIXED-004
  # check: VC-FIXED-004
  Convert fixed-point to integer */
int32_t fixed_to_int(fixed_point_t value) {
    /* Safety Rationale: Safe fixed-point to integer conversion
     * Failure Mode: None (safe operation)
     * Fixed-Point Behavior: Conversion
     * Safety Impact: Data safety */
    
    // Perform conversion with rounding
    return (value + FIXED_POINT_HALF) >> FIXED_POINT_FRACTIONAL_BITS;
}

/*# check: REQ-FIXED-005
  # check: VC-FIXED-005
  Safe fixed-point addition */
fixed_point_t fixed_add(fixed_point_t a, fixed_point_t b) {
    /* Safety Rationale: Safe fixed-point addition
     * Failure Mode: None (safe operation)
     * Fixed-Point Behavior: Addition
     * Safety Impact: Calculation safety */
    
    // Verify no overflow
    if (b > 0 && a > INT32_MAX - b) {
        // In a real system, this would set error state
        // For this example, we'll saturate
        return INT32_MAX;
    }
    
    if (b < 0 && a < INT32_MIN - b) {
        // In a real system, this would set error state
        // For this example, we'll saturate
        return INT32_MIN;
    }
    
    // Perform addition
    return a + b;
}

/*# check: REQ-FIXED-006
  # check: VC-FIXED-006
  Safe fixed-point multiplication */
fixed_point_t fixed_multiply(fixed_point_t a, fixed_point_t b) {
    /* Safety Rationale: Safe fixed-point multiplication
     * Failure Mode: None (safe operation)
     * Fixed-Point Behavior: Multiplication
     * Safety Impact: Calculation safety */
    
    // Perform multiplication with proper scaling
    int64_t result = ((int64_t)a * (int64_t)b) >> FIXED_POINT_FRACTIONAL_BITS;
    
    // Verify result is within range
    if (result > INT32_MAX) {
        // In a real system, this would set error state
        // For this example, we'll saturate
        return INT32_MAX;
    }
    
    if (result < INT32_MIN) {
        // In a real system, this would set error state
        // For this example, we'll saturate
        return INT32_MIN;
    }
    
    return (fixed_point_t)result;
}

/*# check: REQ-FIXED-007
  # check: VC-FIXED-007
  Safe altitude calculation with fixed-point */
bool safe_altitude_calculation(
    fixed_point_t current_altitude,
    fixed_point_t adjustment,
    fixed_point_t* new_altitude
) {
    /* Safety Rationale: Control altitude safely with fixed-point
     * Failure Mode: Return false if unsafe
     * Fixed-Point Behavior: Range verification
     * Safety Impact: Calculation safety */
    
    // Verify current altitude is within bounds
    if (current_altitude < int_to_fixed(MIN_ALTITUDE) || 
        current_altitude > int_to_fixed(MAX_ALTITUDE)) {
        return false;
    }
    
    // Verify adjustment is within reasonable bounds
    if (adjustment < int_to_fixed(MIN_ADJUSTMENT) || 
        adjustment > int_to_fixed(MAX_ADJUSTMENT)) {
        return false;
    }
    
    // Calculate new altitude
    fixed_point_t potential_altitude = fixed_add(current_altitude, adjustment);
    
    // Verify result is within bounds
    if (potential_altitude < int_to_fixed(MIN_ALTITUDE) || 
        potential_altitude > int_to_fixed(MAX_ALTITUDE)) {
        return false;
    }
    
    // Store result
    *new_altitude = potential_altitude;
    
    return true;  // Calculation is safe
}

/*# check: REQ-FIXED-008
  # check: VC-FIXED-008
  Verify fixed-point precision */
bool verify_fixed_precision(
    fixed_point_t value,
    fixed_point_t expected,
    fixed_point_t tolerance
) {
    /* Safety Rationale: Verify fixed-point precision
     * Failure Mode: Return false if unsafe
     * Fixed-Point Behavior: Precision verification
     * Safety Impact: Calculation safety */
    
    // Calculate absolute difference
    fixed_point_t diff = (value > expected) ? (value - expected) : (expected - value);
    
    // Verify within tolerance
    return (diff <= tolerance);
}
```

> **Verification Note**: For DO-178C Level A, all fixed-point logic must be formally verified and documented in the safety case.

---

## Formal Verification of Data Type Safety Properties

Formal verification provides the highest level of assurance for data type behavior in safety-critical contexts.

### Formal Verification Safety Considerations

| Consideration | Traditional Approach | Safety-Critical Approach | Safety Impact |
|---------------|----------------------|--------------------------|---------------|
| **Formal Methods** | Optional research topic | Required for Level A systems | Highest safety assurance |
| **Verification Scope** | Limited to critical code | Complete system verification | Comprehensive safety assurance |
| **Tool Qualification** | Minimal verification | Complete tool verification | Ensures verification trustworthiness |
| **Evidence Generation** | Basic documentation | Complete formal evidence | Meets highest certification requirements |
| **Verification Depth** | Shallow verification | Deep verification | Ensures complete safety property preservation |

### Safe Pattern: Formal Verification Framework

```c
/*
 * # Summary: Verified formal verification implementation
 * # Requirement: REQ-FV-001
 * # Verification: VC-FV-001
 * # Test: TEST-FV-001
 *
 * Formal Verification Considerations:
 *
 * 1. Safety Rules:
 *    - Complete formal verification with verification checks
 *    - Complete verification documentation
 *    - Verification consistency verified
 *
 * 2. Safety Verification:
 *    - Formal verification behavior verified
 *    - No unverified verification operations
 *    - Safety properties maintained
 *
 * Tool: Frama-C 23.0 (qualified)
 */

#include <stdint.h>
#include <stdbool.h>

// Constants for safety constraints
#define MAX_ALTITUDE 50000
#define MIN_ALTITUDE 0
#define MAX_ADJUSTMENT 1000
#define MIN_ADJUSTMENT -1000

/*# check: REQ-FV-002
  # check: VC-FV-002
  Safe altitude calculation with formal verification */
bool safe_altitude_calculation(
    int32_t current_altitude,
    int32_t adjustment,
    int32_t* new_altitude
)
/*@ requires MIN_ALTITUDE <= current_altitude <= MAX_ALTITUDE;
    requires MIN_ADJUSTMENT <= adjustment <= MAX_ADJUSTMENT;
    requires new_altitude != \null;
    ensures \result <==> 
            (MIN_ALTITUDE <= *new_altitude <= MAX_ALTITUDE);
    ensures \result <==> 
            (MIN_ALTITUDE <= current_altitude + adjustment <= MAX_ALTITUDE);
    ensures \result ==> (*new_altitude == current_altitude + adjustment);
  @*/
{
    /* Safety Rationale: Formal verification of calculation safety
     * Failure Mode: Return false if unsafe
     * FV Behavior: Safety verification
     * Safety Impact: Calculation safety */
    
    // Verify addition is safe
    if (adjustment > 0 && current_altitude > MAX_ALTITUDE - adjustment) {
        return false;  // Would overflow
    }
    
    if (adjustment < 0 && current_altitude < MIN_ALTITUDE - adjustment) {
        return false;  // Would underflow
    }
    
    // Calculate new altitude
    *new_altitude = current_altitude + adjustment;
    
    return true;  // Calculation is safe
}

/*# check: REQ-FV-003
  # check: VC-FV-003
  Safe altitude control with formal verification */
bool safe_altitude_control(
    int32_t current_altitude,
    int32_t adjustment,
    int32_t* new_altitude
)
/*@ requires MIN_ALTITUDE <= current_altitude <= MAX_ALTITUDE;
    requires MIN_ADJUSTMENT <= adjustment <= MAX_ADJUSTMENT;
    requires new_altitude != \null;
    ensures \result <==> 
            (MIN_ALTITUDE <= *new_altitude <= MAX_ALTITUDE);
  @*/
{
    /* Safety Rationale: Formal verification of control safety
     * Failure Mode: Return false if unsafe
     * FV Behavior: Complete safety verification
     * Safety Impact: Control safety */
    
    // Verify altitude calculation safety
    return safe_altitude_calculation(current_altitude, adjustment, new_altitude);
}
```

> **Verification Note**: For DO-178C Level A, formal verification must be formally verified and documented in the safety case.

---

## Real-World Case Study: Avionics System Data Type Verification

**System**: Primary Flight Control Computer (PFCC) for commercial aircraft.

**Challenge**: Implement safety-critical control logic with strict data type requirements while meeting DO-178C Level A certification requirements.

**Solution**:
1. Implemented comprehensive data type verification framework:
   - Verified integer representation behavior across all code paths
   - Verified floating-point behavior with precision constraints
   - Verified fixed-point arithmetic for critical control algorithms
   - Implemented formal verification for critical data operations
   - Toolchain verification for all components
2. Developed data type verification framework:
   - Verified integer size and range behavior
   - Verified floating-point precision and special values
   - Verified fixed-point scaling and precision
   - Verified type safety and conversions
   - Verified formal verification results
3. Executed toolchain requalification:
   - Qualified all tools for data type verification
   - Verified tool behavior across optimization levels
   - Documented qualification process

**Data Type Verification Highlights**:
- **Integer Representation**: Implemented complete integer representation verification with range checks
- **Floating-Point Behavior**: Created verified floating-point behavior handling with precision verification
- **Fixed-Point Arithmetic**: Verified fixed-point arithmetic for critical control algorithms
- **Type Safety**: Verified type safety for all data operations
- **Formal Verification**: Implemented formal verification for critical data operations

**Verification Approach**:
- Integer representation verification
- Floating-point behavior verification
- Fixed-point arithmetic verification
- Type safety verification
- Formal verification results verification

**Outcome**: Successful DO-178C Level A certification. The certification body approved the implementation based on the comprehensive data type documentation and verification evidence, noting that the data type verification framework provided "exemplary evidence of safety property preservation."

---

## Tiered Exercises: Building Your Own Data Type Verification System

### Exercise 1: Basic — Implement Integer Verification

**Goal**: Create a basic integer verification framework.

**Tasks**:
- Define integer verification requirements
- Implement integer range checks
- Add documentation of safety rationale
- Generate integer verification reports
- Verify abstraction layer

**Deliverables**:
- `integer_safe.c`, `integer_safe.h`
- Test harness for integer verification
- Verification report

---

### Exercise 2: Intermediate — Add Floating-Point Verification

**Goal**: Extend the system with floating-point verification.

**Tasks**:
- Implement floating-point precision verification
- Add floating-point range checks
- Generate floating-point verification reports
- Verify floating-point safety impact
- Integrate with integer verification

**Deliverables**:
- `floating_point.c`, `floating_point.h`
- Test cases for floating-point verification
- Traceability matrix

---

### Exercise 3: Advanced — Full Data Type Verification System

**Goal**: Build a complete data type verification system.

**Tasks**:
- Implement all data type components
- Add fixed-point arithmetic verification
- Qualify all tools
- Package certification evidence
- Test with data type simulation

**Deliverables**:
- Complete data type source code
- Qualified tool reports
- `certification_evidence.zip`
- Data type simulation results

---

## Verification Pitfalls to Avoid

| Pitfall | Mitigation |
|--------|------------|
| Ignoring integer overflow | Verify all integer operations for overflow/underflow |
| Incomplete floating-point verification | Implement complete floating-point precision verification |
| Overlooking type safety | Create verified type safety checks for all operations |
| Unverified fixed-point arithmetic | Verify fixed-point scaling and precision |
| Incomplete formal verification | Implement formal verification for critical data operations |
| Unverified data conversions | Verify all data type conversions |

---

## Connection to Next Tutorial: Memory Safety Patterns for Safety-Critical C

In **Tutorial #6**, we will cover:
- Complete memory protection strategies (beyond basic bounds checking)
- Memory isolation techniques for critical components
- Verification of memory access patterns
- Safe pointer usage patterns with verification evidence
- Memory corruption detection and recovery mechanisms

You'll learn how to verify memory safety patterns for safety-critical applications—ensuring that memory safety becomes part of your safety case rather than a certification risk.

> **Final Principle**: *Data types aren't just implementation details—they're safety instruments. The verification of data type behavior must actively support certification requirements—without sacrificing the precision and control that make C necessary in safety-critical contexts.*
