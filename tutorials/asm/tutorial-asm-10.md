# 10. Floating-Point and SIMD Programming in Assembly

## 10.1 The Critical Importance of Floating-Point and SIMD Programming

Floating-point arithmetic and Single Instruction Multiple Data (SIMD) operations represent essential capabilities in modern computing, enabling high-performance numerical computation across diverse application domains. For the Assembly language programmer, understanding these features is not merely an academic exercise—it is the essential foundation upon which all effective numerical and data-parallel programming rests. Unlike high-level languages that abstract away the details of floating-point representation and vector processing, Assembly requires explicit management of floating-point units, vector registers, and data alignment—knowledge that transforms theoretical understanding into tangible performance gains.

At its core, floating-point computation addresses the fundamental challenge of representing real numbers in a finite digital system. The IEEE 754 standard, adopted by virtually all modern processors, provides a consistent framework for representing a vast range of values with reasonable precision. Consider a simple operation like `3.14159 × 2.71828`. At the high-level language level, this appears as a straightforward multiplication. In reality, this single operation triggers a cascade of low-level operations:
- Converting decimal representations to binary floating-point
- Aligning exponents for addition/multiplication
- Performing the actual arithmetic operation
- Normalizing the result
- Handling potential overflow or underflow
- Rounding to the appropriate precision

SIMD operations extend this capability by performing the same operation on multiple data elements simultaneously. A single AVX2 instruction can process eight 32-bit floating-point values in parallel, potentially providing an 8x speedup over scalar code for appropriate workloads. This parallelism is crucial for modern applications including scientific computing, multimedia processing, machine learning, and financial modeling.

> **"The difference between a programmer who merely uses floating-point operations and one who truly understands them lies in their grasp of the physical reality beneath the FADD and MULPS instructions. To the uninformed, 3.14 is just a number; to the informed, it represents a precisely encoded binary fraction with a specific exponent, subject to rounding errors that accumulate through successive operations. This deeper understanding doesn't just satisfy intellectual curiosity—it enables the creation of numerical algorithms that work *with* the hardware's representation rather than against it, transforming theoretical knowledge into robust, accurate computations. In the world of numerical programming, floating-point ignorance isn't just a limitation—it's a liability that manifests as subtle inaccuracies, performance cliffs, and catastrophic failures in critical calculations."**

This chapter provides a comprehensive examination of floating-point and SIMD programming in x64 Assembly, focusing on those aspects most relevant to practical implementation. We'll explore the IEEE 754 standard, x87 FPU architecture, SSE/AVX instruction sets, data conversion techniques, and optimization strategies—revealing not just the syntax of instructions but their underlying implementation and practical applications. While previous chapters established the architectural foundations of x64 and its procedure call mechanisms, this chapter focuses on the critical bridge between abstract mathematical concepts and concrete hardware execution—the mechanism that transforms numerical algorithms into high-performance computational reality.

## 10.2 Floating-Point Fundamentals

Before examining specific instruction sets, it's essential to understand the fundamental principles of floating-point representation and arithmetic. The IEEE 754 standard provides the foundation for virtually all modern floating-point implementations.

### 10.2.1 IEEE 754 Standard Overview

The IEEE 754 standard defines how floating-point numbers are represented and manipulated in binary systems. It specifies:

* **Basic Formats:**
  - **Binary32 (Single-precision):** 32 bits total (1 sign, 8 exponent, 23 fraction)
  - **Binary64 (Double-precision):** 64 bits total (1 sign, 11 exponent, 52 fraction)
  - **Binary128 (Quad-precision):** 128 bits total (1 sign, 15 exponent, 112 fraction)

* **Special Values:**
  - **Zero:** Both positive and negative zero (distinguished but compare equal)
  - **Infinity:** Positive and negative infinity (result of overflow)
  - **NaN (Not a Number):** Result of invalid operations (0/0, √-1)
  - **Denormalized Numbers:** Numbers smaller than normal range

* **Rounding Modes:**
  - Round to nearest, ties to even (default)
  - Round toward positive infinity
  - Round toward negative infinity
  - Round toward zero (truncation)

* **Exception Handling:**
  - Invalid operation
  - Division by zero
  - Overflow
  - Underflow
  - Inexact result

**Floating-Point Representation Formula:**
For normal numbers: (-1)^sign × (1 + fraction) × 2^(exponent - bias)
For denormal numbers: (-1)^sign × (0 + fraction) × 2^(1 - bias)

Where bias = 127 for single-precision, 1023 for double-precision.

### 10.2.2 Floating-Point Precision and Range

Understanding the limitations of floating-point representation is critical for numerical programming:

* **Single-Precision (32-bit):**
  - Range: ±1.18×10^-38 to ±3.4×10^38
  - Precision: ~7 decimal digits
  - Machine epsilon: 1.19×10^-7 (smallest number where 1.0 + ε > 1.0)

* **Double-Precision (64-bit):**
  - Range: ±2.23×10^-308 to ±1.80×10^308
  - Precision: ~15-16 decimal digits
  - Machine epsilon: 2.22×10^-16

* **Common Precision Issues:**
  - **Rounding Errors:** Inherent in all floating-point operations
  - **Cancellation:** Loss of significance when subtracting nearly equal numbers
  - **Absorption:** Small values lost when added to large values
  - **Overflow:** Result exceeds representable range
  - **Underflow:** Result smaller than representable range
  - **Denormal Performance Penalty:** Some processors slow down with denormals

The following table details the key characteristics of different floating-point formats used in x64 architecture, highlighting their precision, range, and performance implications. Understanding these differences is crucial for selecting the appropriate format for specific computational tasks.

| **Format** | **Total Bits** | **Sign Bits** | **Exponent Bits** | **Fraction Bits** | **Exponent Bias** | **Decimal Precision** | **Approx. Range** | **Typical Use Cases** |
| :--------- | :------------- | :------------ | :---------------- | :---------------- | :---------------- | :-------------------- | :---------------- | :--------------------- |
| **Binary16** | **16** | **1** | **5** | **10** | **15** | **~3-4 digits** | **6.10×10^-5 to 6.55×10^4** | **Graphics, deep learning (limited support)** |
| **Binary32** | **32** | **1** | **8** | **23** | **127** | **~6-9 digits** | **1.18×10^-38 to 3.40×10^38** | **General-purpose computing, graphics** |
| **Binary64** | **64** | **1** | **11** | **52** | **1023** | **~15-17 digits** | **2.23×10^-308 to 1.80×10^308** | **Scientific computing, financial calculations** |
| **Binary80** | **80** | **1** | **15** | **63** | **16383** | **~18-21 digits** | **3.36×10^-4932 to 1.18×10^4932** | **x87 FPU internal format, high-precision math** |
| **Binary128** | **128** | **1** | **15** | **112** | **16383** | **~33-36 digits** | **6.48×10^-4966 to 1.19×10^4932** | **Specialized scientific applications** |

**Critical Insights from the Table:**
- Single-precision offers 2x memory bandwidth compared to double-precision
- Double-precision provides 2x the precision of single-precision
- Binary80 (x87 internal format) minimizes rounding errors in intermediate calculations
- Precision decreases as magnitude increases (more bits needed for exponent)
- Denormal numbers extend range but often incur performance penalties

### 10.2.3 Special Floating-Point Values

Understanding special values is essential for robust numerical code:

* **Zero:**
  - Represented with exponent and fraction both zero
  - Positive zero: sign bit 0
  - Negative zero: sign bit 1
  - +0.0 == -0.0 in comparisons, but 1/+0.0 = +∞ while 1/-0.0 = -∞

* **Infinity:**
  - Represented with maximum exponent and zero fraction
  - Positive infinity: sign bit 0
  - Negative infinity: sign bit 1
  - Result of overflow or division by zero

* **NaN (Not a Number):**
  - Represented with maximum exponent and non-zero fraction
  - Quiet NaN (QNaN): Propagates through operations without raising exceptions
  - Signaling NaN (SNaN): Raises invalid operation exception when used
  - Used for uninitialized variables, invalid operations

* **Denormalized Numbers:**
  - Represented with minimum exponent and non-zero fraction
  - Allow gradual underflow to zero
  - Extend range but often slower to process
  - Can cause 100x performance penalty on some processors

**Example Representations (Hexadecimal):**
- +0.0: `0x00000000` (single), `0x0000000000000000` (double)
- -0.0: `0x80000000` (single), `0x8000000000000000` (double)
- +∞: `0x7F800000` (single), `0x7FF0000000000000` (double)
- -∞: `0xFF800000` (single), `0xFFF0000000000000` (double)
- QNaN: `0x7FC00000` (single), `0x7FF8000000000000` (double)
- SNaN: `0x7FA00000` (single), `0x7FF4000000000000` (double)

### 10.2.4 Floating-Point Exceptions and Control

The MXCSR register (in SSE) or FPU control/status registers (in x87) manage floating-point behavior:

* **MXCSR Register (32 bits):**
  - **Exception Flags (bits 0-5):** Invalid, Denormal, Divide-by-zero, Overflow, Underflow, Precision
  - **Masking Bits (bits 7-12):** Mask for each exception
  - **Rounding Control (bits 13-14):** Round to nearest, down, up, toward zero
  - **Denormals-Are-Zero (DAZ) (bit 6):** Treat denormals as zero
  - **Flush-To-Zero (FTZ) (bit 15):** Flush denormals to zero

* **Common Control Patterns:**
  ```x86asm
  ; Set flush-to-zero and denormals-are-zero
  stmxcsr [old_mxcsr]
  mov eax, [old_mxcsr]
  or eax, 0x8040  ; Set FTZ and DAZ
  ldmxcsr eax
  
  ; Set rounding mode to nearest
  stmxcsr [old_mxcsr]
  mov eax, [old_mxcsr]
  and eax, 0xFFFFFFF3  ; Clear rounding control bits
  ldmxcsr eax
  ```

* **Handling Exceptions:**
  - Unmasked exceptions trigger hardware interrupts
  - Masked exceptions set status flags without interrupt
  - Can check exception flags after computation

Understanding these controls is essential for managing numerical stability and performance.

## 10.3 x87 FPU Architecture and Programming

The x87 Floating-Point Unit represents the legacy floating-point architecture in x86/x64 processors. Though largely superseded by SSE for new code, understanding x87 remains important for maintaining legacy code and certain specialized applications.

### 10.3.1 x87 Register Architecture

The x87 FPU features a unique stack-based register organization:

* **Eight 80-bit Data Registers (ST0-ST7):**
  - Organized as a circular stack
  - ST0 is the top of stack (TOS)
  - Other registers referenced relative to TOS

* **Status Word:**
  - Contains condition codes (C0-C3)
  - Tracks exception flags
  - Indicates stack overflow/underflow

* **Control Word:**
  - Controls precision (24, 53, or 64 bits)
  - Sets rounding mode
  - Masks/unmasks exceptions

* **Tag Word:**
  - Tracks status of each register (valid, zero, special, empty)
  - Enables efficient stack management

**Register Stack Visualization:**
```
      |----------|
TOS ->|   ST0    |
      |----------|
      |   ST1    |
      |----------|
      |   ST2    |
      |----------|
      |   ST3    |
      |----------|
      |   ST4    |
      |----------|
      |   ST5    |
      |----------|
      |   ST6    |
      |----------|
      |   ST7    |
      |----------|
```

The stack-based design allows compact instruction encoding but can make programming more complex than register-based approaches.

### 10.3.2 Basic x87 Instructions

x87 instructions follow a consistent naming pattern reflecting their stack operation:

* **Data Movement:**
  ```x86asm
  FLD DWORD [mem]   ; Push single-precision to ST0
  FLD QWORD [mem]   ; Push double-precision to ST0
  FLD TBYTE [mem]   ; Push extended-precision to ST0
  FSTP ST0, [mem]   ; Store ST0 to memory and pop
  FXCH ST0, ST1     ; Exchange ST0 and ST1
  ```

* **Arithmetic Operations:**
  ```x86asm
  FADD ST0, ST1     ; ST0 = ST0 + ST1
  FADD ST1, ST0     ; ST1 = ST1 + ST0
  FADDP ST1, ST0    ; ST1 = ST1 + ST0, then pop stack
  FSUB ST0, ST1     ; ST0 = ST0 - ST1
  FSUBR ST0, ST1    ; ST0 = ST1 - ST0 (reverse subtraction)
  FMUL ST0, ST1     ; ST0 = ST0 * ST1
  FDIV ST0, ST1     ; ST0 = ST0 / ST1
  FDIVR ST0, ST1    ; ST0 = ST1 / ST0 (reverse division)
  ```

* **Transcendental Functions:**
  ```x86asm
  FSIN              ; ST0 = sin(ST0)
  FCOS              ; ST0 = cos(ST0)
  FSINCOS           ; ST0 = sin(ST0), ST1 = cos(ST0)
  FPTAN             ; ST0 = tan(ST0)
  FPATAN            ; ST1 = arctan(ST1/ST0)
  F2XM1             ; ST0 = 2^ST0 - 1
  FYL2X             ; ST1 = ST1 * log2(ST0)
  ```

* **Comparison and Control:**
  ```x86asm
  FCOM ST0, ST1     ; Compare ST0 and ST1
  FCOMP ST0, ST1    ; Compare and pop
  FUCOM ST0, ST1    ; Unordered compare (doesn't raise exceptions)
  FSTSW AX          ; Store status word to AX
  FNSTCW [mem]      ; Store control word to memory
  FLDCW [mem]       ; Load control word from memory
  ```

### 10.3.3 x87 Programming Example

A complete example calculating the dot product of two vectors:

```x86asm
; double dot_product(double* a, double* b, int n)
dot_product:
    push rbp
    mov rbp, rsp
    sub rsp, 8       ; Space for local variable
    
    ; Initialize sum to 0.0
    fldz             ; ST0 = 0.0
    
    ; Set up loop
    mov rcx, rdx     ; RCX = n
    test rcx, rcx
    jz done
    
dot_loop:
    ; Load a[i] and b[i]
    fld QWORD [rdi]  ; ST0 = a[i], ST1 = sum
    fld QWORD [rsi]  ; ST0 = b[i], ST1 = a[i], ST2 = sum
    
    ; Multiply and add to sum
    fmulp st1, st0   ; ST0 = a[i]*b[i], ST1 = sum
    faddp st1, st0   ; ST0 = sum + a[i]*b[i]
    
    ; Advance pointers
    add rdi, 8
    add rsi, 8
    dec rcx
    jnz dot_loop
    
done:
    ; Store result
    fstp QWORD [rbp-8] ; Store sum to local
    movsd xmm0, [rbp-8] ; Return in XMM0 (System V ABI)
    
    ; Clean up stack and return
    add rsp, 8
    pop rbp
    ret
```

**Key Features of the Example:**
- Uses x87 stack operations for calculation
- Properly manages the floating-point stack
- Converts result to XMM0 for ABI compliance
- Handles edge case of n=0

### 10.3.4 x87 Considerations and Limitations

While x87 remains functional, it has several limitations compared to modern approaches:

* **Performance:**
  - Generally slower than SSE/AVX for scalar operations
  - No native vector capabilities
  - Stack operations can cause pipeline stalls

* **Precision:**
  - Uses 80-bit internal precision (Binary80)
  - Can cause unexpected results when values spill to memory
  - Inconsistent precision between registers and memory

* **ABI Compatibility:**
  - Modern ABIs (System V, Microsoft) use XMM registers for floating-point
  - Requires conversion between x87 and XMM for function calls
  - Complicates mixed x87/SSE code

* **Programming Complexity:**
  - Stack-based model requires careful management
  - Limited number of registers
  - More complex instruction set

For new code, SSE/AVX is generally preferred, but x87 remains important for legacy systems and certain specialized applications requiring extended precision.

## 10.4 SSE and SSE2: Modern Scalar Floating-Point

Streaming SIMD Extensions (SSE) and SSE2 represent the modern foundation for floating-point operations in x64 architecture, providing both scalar and vector capabilities with a cleaner register model than x87.

### 10.4.1 XMM Register Architecture

SSE introduced eight 128-bit XMM registers (XMM0-XMM7), expanded to sixteen (XMM0-XMM15) in x64:

* **Register Organization:**
  - 128-bit wide registers
  - Can hold multiple data elements:
    - Four 32-bit single-precision floats (packed)
    - Two 64-bit double-precision floats (packed)
    - Scalar single or double-precision float
    - Various integer formats

* **Register Usage (System V AMD64 ABI):**
  - XMM0-XMM7: Volatile (caller-saved) for arguments and return values
  - XMM8-XMM15: Volatile (caller-saved)
  - XMM6-XMM15: Non-volatile (callee-saved) in Windows ABI

* **Register Preservation:**
  - Non-volatile registers must be saved/restored by callee
  - Critical for proper function calls and exception handling

**XMM Register Visualization:**
```
+-------------------------------------------------------+
| XMM0 (128 bits)                                       |
+-------------------------------+-----------------------+
| Single-Precision (32-bit)     | Double-Precision (64) |
| [0]   [1]   [2]   [3]        | [0]         [1]       |
+-------------------------------+-----------------------+
```

This flexible organization enables both scalar and packed operations with the same registers.

### 10.4.2 Scalar Floating-Point Instructions

SSE introduced scalar floating-point operations that operate on single values in XMM registers:

* **Data Movement:**
  ```x86asm
  MOVSS XMM0, [mem]   ; Move single-precision scalar
  MOVSD XMM0, [mem]   ; Move double-precision scalar
  MOVSS XMM1, XMM0    ; Move within registers
  ```

* **Arithmetic Operations:**
  ```x86asm
  ADDSS XMM0, XMM1    ; Scalar single add
  ADDSD XMM0, XMM1    ; Scalar double add
  SUBSS XMM0, XMM1    ; Scalar single subtract
  MULSS XMM0, XMM1    ; Scalar single multiply
  DIVSS XMM0, XMM1    ; Scalar single divide
  ```

* **Comparison and Conditional Move:**
  ```x86asm
  CMPSS XMM0, XMM1, 0 ; Compare single (0=equal)
  CMPSD XMM0, XMM1, 0 ; Compare double
  MOVMSKPS EAX, XMM0  ; Extract comparison results to integer
  ```

* **Conversion:**
  ```x86asm
  CVTSI2SS XMM0, EAX  ; Integer to single-precision
  CVTSS2SD XMM0, XMM1 ; Single to double
  CVTTSS2SI EAX, XMM0 ; Truncate single to integer
  ```

* **Special Operations:**
  ```x86asm
  SQRTSS XMM0, XMM1   ; Square root of single
  RCPSS XMM0, XMM1    ; Reciprocal of single (approximate)
  RSQRTSS XMM0, XMM1  ; Reciprocal square root (approximate)
  ```

### 10.4.3 MXCSR Control Register

The MXCSR register controls floating-point behavior for SSE operations:

* **Structure:**
  - 32 bits total
  - Bits 0-5: Exception flags (set when unmasked exception occurs)
  - Bits 7-12: Exception masks (1=masked, no exception)
  - Bits 13-14: Rounding control
  - Bit 6: Denormals-Are-Zero (DAZ)
  - Bit 15: Flush-To-Zero (FTZ)

* **Common Settings:**
  ```x86asm
  ; Default settings (round to nearest, all exceptions masked)
  stmxcsr [default_mxcsr]
  mov dword [default_mxcsr], 0x1F80
  
  ; Set flush-to-zero and denormals-are-zero
  stmxcsr [ftz_mxcsr]
  mov eax, [ftz_mxcsr]
  or eax, 0x8040      ; Set FTZ and DAZ
  ldmxcsr eax
  ```

* **Reading and Modifying:**
  ```x86asm
  ; Save current MXCSR
  stmxcsr [old_mxcsr]
  
  ; Modify rounding mode to truncate
  mov eax, [old_mxcsr]
  and eax, 0xFFFFFFF3  ; Clear rounding control bits
  or eax, 0xC          ; Set to truncate mode
  ldmxcsr eax
  
  ; Restore original MXCSR
  ldmxcsr [old_mxcsr]
  ```

Proper MXCSR management is essential for numerical stability and performance, particularly when dealing with denormal values.

### 10.4.4 Scalar Floating-Point Programming Example

A complete example calculating the Euclidean norm (magnitude) of a vector:

```x86asm
; double vector_norm(double* v, int n)
vector_norm:
    push rbp
    mov rbp, rsp
    sub rsp, 16      ; Space for local variables
    
    ; Initialize sum of squares to 0.0
    xorps xmm0, xmm0 ; XMM0 = 0.0 (sum)
    
    ; Set up loop
    mov rcx, rsi     ; RCX = n
    test rcx, rcx
    jz done
    
norm_loop:
    ; Load v[i]
    movsd xmm1, [rdi] ; XMM1 = v[i]
    add rdi, 8        ; Advance pointer
    
    ; Square and accumulate
    mulsd xmm1, xmm1  ; XMM1 = v[i]^2
    addsd xmm0, xmm1  ; XMM0 += v[i]^2
    
    dec rcx
    jnz norm_loop
    
done:
    ; Take square root
    sqrtsd xmm0, xmm0 ; XMM0 = sqrt(sum)
    
    ; Clean up and return
    movsd [rbp-8], xmm0 ; Store result locally
    movsd xmm0, [rbp-8] ; Ensure proper return (System V)
    add rsp, 16
    pop rbp
    ret
```

**Key Features of the Example:**
- Uses scalar double-precision operations (SD suffix)
- Properly initializes accumulator to zero
- Efficient loop structure
- Correctly handles edge case of n=0
- ABI-compliant return value

This example demonstrates the cleaner programming model of SSE compared to x87, with explicit register usage rather than a stack-based approach.

## 10.5 Packed Floating-Point Operations with SSE

While scalar operations process one value at a time, packed operations process multiple values simultaneously—enabling true Single Instruction Multiple Data (SIMD) parallelism.

### 10.5.1 Packed Data Organization

XMM registers can hold multiple floating-point values:

* **Single-Precision (32-bit):**
  - Four values per 128-bit register
  - Example: `XMM0 = [v3, v2, v1, v0]` (little-endian order)

* **Double-Precision (64-bit):**
  - Two values per 128-bit register
  - Example: `XMM0 = [v1, v0]`

**Packed Data Visualization:**
```
+-------------------------------------------------------+
| XMM0 (128 bits)                                       |
+-------------------------------+-----------------------+
| Single-Precision (32-bit)     | Double-Precision (64) |
| [3]   [2]   [1]   [0]        | [1]         [0]       |
+-------------------------------+-----------------------+
```

The order is little-endian: the lowest address element appears in the least significant bits of the register.

### 10.5.2 Packed Arithmetic Instructions

SSE provides packed versions of most floating-point operations:

* **Addition and Subtraction:**
  ```x86asm
  ADDPS XMM0, XMM1    ; Packed single add (4 elements)
  ADDPD XMM0, XMM1    ; Packed double add (2 elements)
  SUBPS XMM0, XMM1    ; Packed single subtract
  ```

* **Multiplication and Division:**
  ```x86asm
  MULPS XMM0, XMM1    ; Packed single multiply
  MULPD XMM0, XMM1    ; Packed double multiply
  DIVPS XMM0, XMM1    ; Packed single divide
  ```

* **Square Root and Reciprocal:**
  ```x86asm
  SQRTPS XMM0, XMM1   ; Packed single square root
  RSQRTPS XMM0, XMM1  ; Packed single reciprocal sqrt (approx)
  RCPPS XMM0, XMM1    ; Packed single reciprocal (approx)
  ```

* **Comparison Operations:**
  ```x86asm
  CMPPS XMM0, XMM1, 0 ; Compare packed single (0=equal)
  CMPPD XMM0, XMM1, 2 ; Compare packed double (2=less than)
  ```

* **Min/Max Operations:**
  ```x86asm
  MINPS XMM0, XMM1    ; Packed single minimum
  MAXPS XMM0, XMM1    ; Packed single maximum
  ```

### 10.5.3 Data Movement and Shuffling

Moving and rearranging data within XMM registers:

* **Memory Access:**
  ```x86asm
  MOVAPS XMM0, [mem]  ; Move aligned packed single
  MOVUPS XMM0, [mem]  ; Move unaligned packed single
  MOVAPD XMM0, [mem]  ; Move aligned packed double
  ```

* **Register-to-Register:**
  ```x86asm
  MOVAPS XMM1, XMM0   ; Move packed single
  SHUFPS XMM0, XMM1, 0x4E ; Shuffle packed single
  ```

* **Horizontal Operations:**
  ```x86asm
  MOVHLPS XMM1, XMM0  ; Move high half to low half of XMM1
  MOVLHPS XMM0, XMM1  ; Move low half of XMM1 to high half of XMM0
  ```

* **Broadcasting:**
  ```x86asm
  SHUFPS XMM0, XMM0, 0x00 ; Broadcast element 0 to all elements
  ```

* **Extracting Elements:**
  ```x86asm
  MOVSS [mem], XMM0   ; Extract lowest single element
  ```

### 10.5.4 Packed Floating-Point Programming Example

A complete example calculating the dot product of two single-precision vectors using packed operations:

```x86asm
; float dot_product(float* a, float* b, int n)
dot_product:
    push rbp
    mov rbp, rsp
    sub rsp, 16      ; Space for alignment and locals
    
    ; Align stack to 16 bytes for safety
    and rsp, 0xFFFFFFFFFFFFFFF0
    
    ; Initialize sum to 0.0 (in all 4 elements)
    xorps xmm0, xmm0 ; XMM0 = [0.0, 0.0, 0.0, 0.0]
    
    ; Calculate number of full 4-element chunks
    mov eax, esi     ; EAX = n
    and esi, 0xFFFFFFFC ; ESI = n & ~3 (multiple of 4)
    shr eax, 2       ; EAX = n/4
    
    test eax, eax
    jz remainder_loop
    
dot_loop:
    ; Load a[i] and b[i] (4 elements each)
    movups xmm1, [rdi] ; XMM1 = a[i]
    movups xmm2, [rsi] ; XMM2 = b[i]
    
    ; Multiply and accumulate
    mulps xmm1, xmm2   ; XMM1 = a[i] * b[i]
    addps xmm0, xmm1   ; XMM0 += products
    
    ; Advance pointers
    add rdi, 16
    add rsi, 16
    dec eax
    jnz dot_loop
    
remainder_loop:
    ; Handle remaining elements (0-3)
    mov ecx, esi      ; ECX = remaining count
    test ecx, ecx
    jz horizontal_sum
    
    ; Process one element at a time
    movss xmm1, [rdi] ; Load a[i]
    movss xmm2, [rsi] ; Load b[i]
    mulss xmm1, xmm2  ; Multiply
    addss xmm0, xmm1  ; Accumulate
    
    add rdi, 4
    add rsi, 4
    dec ecx
    jnz remainder_loop
    
horizontal_sum:
    ; Horizontal sum of XMM0
    ; XMM0 = [s3, s2, s1, s0]
    movaps xmm1, xmm0
    shufps xmm1, xmm0, 0x93 ; XMM1 = [s0, s3, s2, s1]
    addps xmm0, xmm1        ; XMM0 = [s3+s0, s2+s3, s1+s2, s0+s1]
    movaps xmm1, xmm0
    shufps xmm1, xmm0, 0x4E ; XMM1 = [s0+s1, s3+s0, s2+s3, s1+s2]
    addps xmm0, xmm1        ; XMM0 = [s1+s2+s3+s0, ..., ..., ...]
    
    ; Extract result (lowest element)
    movss [rbp-4], xmm0
    movss xmm0, [rbp-4] ; Return in XMM0
    
    ; Clean up and return
    mov rsp, rbp
    pop rbp
    ret
```

**Key Features of the Example:**
- Processes 4 elements per iteration using packed operations
- Handles remainder elements with scalar operations
- Uses horizontal sum to combine partial results
- Properly aligns stack for safety
- ABI-compliant return value

This example demonstrates the performance potential of packed operations, processing four times as many elements per instruction compared to scalar code.

## 10.6 Advanced SIMD: AVX and AVX-512

Advanced Vector Extensions (AVX) and AVX-512 represent significant advancements in SIMD capabilities, providing wider registers, more flexible instruction formats, and enhanced functionality.

### 10.6.1 AVX Architecture Overview

AVX, introduced with Sandy Bridge processors, provides several key improvements over SSE:

* **Wider Registers:**
  - YMM0-YMM15 (256-bit registers, extending XMM0-XMM15)
  - Lower 128 bits correspond to XMM registers
  - Higher 128 bits are new

* **Three-Operand Syntax:**
  - Non-destructive operations (destination separate from sources)
  - Example: `VADDPS YMM0, YMM1, YMM2` (YMM0 = YMM1 + YMM2)
  - Eliminates need for register copying

* **VEX Prefix:**
  - Replaces traditional prefixes
  - Encodes additional register information
  - Enables access to 16 registers in 32-bit mode

* **New Instructions:**
  - Fused multiply-add (FMA)
  - Enhanced permute and shuffle operations
  - Better support for floating-point exceptions

**AVX Register Visualization:**
```
+---------------------------------------------------------------+
| YMM0 (256 bits)                                               |
+---------------------------------------+-----------------------+
| XMM0 (128 bits)                       | High 128 bits         |
+-------------------------------+-------+                       |
| Single-Precision (32-bit)     | Double|                       |
| [7] [6] [5] [4] [3] [2] [1] [0]      |                       |
+-------------------------------+-------+-----------------------+
```

### 10.6.2 AVX Instructions

AVX instructions follow the VEX-encoded three-operand format:

* **Arithmetic Operations:**
  ```x86asm
  VADDPS YMM0, YMM1, YMM2  ; Packed single add (8 elements)
  VADDPD YMM0, YMM1, YMM2  ; Packed double add (4 elements)
  VMULPS YMM0, YMM1, YMM2  ; Packed single multiply
  VDIVPS YMM0, YMM1, YMM2  ; Packed single divide
  ```

* **Fused Multiply-Add (FMA):**
  ```x86asm
  VFMADD132PS YMM0, YMM1, YMM2 ; YMM0 = YMM0*YMM1 + YMM2
  VFMADD213PS YMM0, YMM1, YMM2 ; YMM0 = YMM1*YMM0 + YMM2
  VFMADD231PS YMM0, YMM1, YMM2 ; YMM0 = YMM1*YMM2 + YMM0
  ```

* **Data Movement:**
  ```x86asm
  VMOVAPS YMM0, [mem]    ; Move aligned packed single
  VMOVUPS YMM0, [mem]    ; Move unaligned packed single
  VBLENDPS YMM0, YMM1, YMM2, 0x0F ; Blend elements
  ```

* **Permutation and Shuffling:**
  ```x86asm
  VPERMPS YMM0, YMM2, YMM1 ; Permute single elements
  VSHUFPS YMM0, YMM1, YMM2, 0x4E ; Shuffle packed single
  ```

* **Conversion:**
  ```x86asm
  VCVTDQ2PS YMM0, YMM1   ; Convert integers to single
  VCVTPS2DQ YMM0, YMM1   ; Convert single to integers
  ```

### 10.6.3 AVX-512 Architecture

AVX-512, introduced with Knights Landing and Skylake-X processors, provides even more advanced capabilities:

* **Wider Registers:**
  - ZMM0-ZMM31 (512-bit registers)
  - Lower 256 bits correspond to YMM registers

* **Mask Registers:**
  - Eight 64-bit mask registers (K0-K7)
  - Enable conditional execution per element
  - Example: `VADDPS ZMM0 {K1}, ZMM1, ZMM2`

* **Embedded Rounding and SAE:**
  - Control rounding mode per instruction
  - Suppress all exceptions (SAE) option
  - Example: `VADDPD ZMM0 {rn-sae}, ZMM1, ZMM2`

* **Vector Length eXtension (VLX):**
  - Same instruction works with XMM, YMM, or ZMM
  - Example: `VADDPD XMM0, XMM1, XMM2` (128-bit)
             `VADDPD YMM0, YMM1, YMM2` (256-bit)
             `VADDPD ZMM0, ZMM1, ZMM2` (512-bit)

* **New Features:**
  - Scatter/gather operations
  - Conflict detection
  - Embedded broadcast

**AVX-512 Register Visualization:**
```
+-------------------------------------------------------------------------------+
| ZMM0 (512 bits)                                                             |
+-------------------------------------------------------+-----------------------+
| YMM0 (256 bits)                                       | High 256 bits         |
+---------------------------------------+---------------+                       |
| XMM0 (128 bits)                       | High 128 bits |                       |
+-------------------------------+-------+               |                       |
| Single-Precision (32-bit)     | Double|               |                       |
| [15]...[8] [7]...[0]                 |               |                       |
+-------------------------------+-------+---------------+-----------------------+
```

### 10.6.4 AVX Programming Example

A complete example calculating the Mandelbrot set using AVX for parallel computation:

```x86asm
; void mandelbrot(float* output, float x0, float y0, float dx, float dy, 
;                int width, int height, int max_iter)
mandelbrot:
    push rbp
    mov rbp, rsp
    sub rsp, 32      ; Space for locals and alignment
    
    ; Align stack to 32 bytes for AVX
    and rsp, 0xFFFFFFFFFFFFFFE0
    
    ; Constants
    vmovaps ymm0, [const_2]     ; YMM0 = [2.0, 2.0, 2.0, 2.0, ...]
    vmovaps ymm1, [const_4]     ; YMM1 = [4.0, 4.0, 4.0, 4.0, ...]
    vmovaps ymm2, [const_iter]  ; YMM2 = [1.0, 2.0, 3.0, 4.0, ...] (iteration counters)
    
    ; Initialize y coordinate
    vmovss xmm3, [rsi]          ; XMM3 = y0
    vshufps ymm3, ymm3, ymm3, 0  ; YMM3 = [y0, y0, y0, y0, y0, y0, y0, y0]
    
row_loop:
    ; Initialize x coordinate for this row
    vmovss xmm4, [rdx]          ; XMM4 = x0
    vshufps ymm4, ymm4, ymm4, 0  ; YMM4 = [x0, x0, x0, x0, x0, x0, x0, x0]
    
    ; Calculate dx increment for 8 elements
    vmovss xmm5, [rdx+4]        ; XMM5 = dx
    vshufps ymm5, ymm5, ymm5, 0  ; YMM5 = [dx, dx, dx, dx, dx, dx, dx, dx]
    vmulps ymm6, ymm5, [const_8] ; YMM6 = [8*dx, 8*dx, ...]
    
col_loop:
    ; Initialize z = c for this pixel
    vmovaps ymm7, ymm4          ; YMM7 = x (real part)
    vxorps ymm8, ymm8, ymm8     ; YMM8 = 0.0 (imaginary part)
    vmovaps ymm9, ymm4          ; YMM9 = cx
    vmovaps ymm10, ymm3         ; YMM10 = cy
    
    ; Reset iteration counter
    vmovaps ymm11, ymm2         ; YMM11 = [1, 2, 3, 4, 5, 6, 7, 8]
    
mandel_loop:
    ; z = z^2 + c
    ; real = x^2 - y^2 + cx
    ; imag = 2*x*y + cy
    vmulps ymm12, ymm7, ymm7    ; x^2
    vmulps ymm13, ymm8, ymm8    ; y^2
    vsubps ymm14, ymm12, ymm13  ; x^2 - y^2
    vaddps ymm14, ymm14, ymm9   ; x^2 - y^2 + cx
    
    vmulps ymm15, ymm7, ymm8    ; x*y
    vaddps ymm15, ymm15, ymm15  ; 2*x*y
    vaddps ymm15, ymm15, ymm10  ; 2*x*y + cy
    
    ; Update z
    vmovaps ymm7, ymm14         ; x = real
    vmovaps ymm8, ymm15         ; y = imag
    
    ; Check |z| <= 2.0 (x^2 + y^2 <= 4.0)
    vmulps ymm12, ymm7, ymm7    ; x^2
    vmulps ymm13, ymm8, ymm8    ; y^2
    vaddps ymm12, ymm12, ymm13  ; x^2 + y^2
    
    ; Compare with 4.0
    vcmpps ymm13, ymm12, ymm1, 2 ; YMM13 = [1 if x^2+y^2 <= 4.0, else 0]
    
    ; Increment iteration counter where still in set
    vaddps ymm11, ymm11, ymm13  ; Increment only where in set
    
    ; Check if all pixels have escaped or max iterations reached
    vcmpeqps ymm13, ymm13, ymm8 ; YMM13 = [1 if all escaped, else 0]
    vptest ymm13, ymm13
    jc all_escaped
    
    vmovd eax, xmm11
    cmp eax, [max_iter]
    jl mandel_loop
    
all_escaped:
    ; Store results (iteration count)
    vmovups [rdi], ymm11
    
    ; Advance to next 8 pixels
    add rdi, 32
    vaddps ymm4, ymm4, ymm6     ; Advance x by 8*dx
    
    ; Check column limit
    vmovss xmm12, xmm4
    vcmpless xmm13, xmm12, [x_max]
    vblendvps xmm12, xmm12, xmm4, xmm13
    vmovss [current_x], xmm12
    cmp dword [current_x], [x_limit]
    jl col_loop
    
    ; Advance to next row
    vaddps ymm3, ymm3, [dy_vec] ; Advance y by dy
    add rsi, 4                  ; Advance output pointer by width
    
    ; Check row limit
    vmovss xmm3, xmm3
    cmp dword [rsi], [y_limit]
    jl row_loop
    
    ; Clean up and return
    vzeroupper
    mov rsp, rbp
    pop rbp
    ret

section .data
const_2:  dd 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0
const_4:  dd 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0
const_8:  dd 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0
const_iter: dd 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0
dy_vec:   dd dy, dy, dy, dy, dy, dy, dy, dy
x_max:    dd x_max_value
x_limit:  dd x_limit_value
y_limit:  dd y_limit_value
current_x: dd 0
```

**Key Features of the Example:**
- Processes 8 pixels simultaneously using AVX
- Uses vectorized iteration counters
- Efficient escape checking with vector comparisons
- Proper alignment for AVX operations
- Handles edge cases at image boundaries

This example demonstrates the significant performance potential of AVX, processing eight times as many elements per instruction compared to scalar code.

## 10.7 Data Conversion Techniques

Converting between different data types is a common requirement in numerical programming. Understanding the available conversion instructions and their characteristics is essential for efficient code.

### 10.7.1 Integer to Floating-Point Conversion

Converting integers to floating-point values:

* **Direct Conversion:**
  ```x86asm
  CVTSI2SS XMM0, EAX    ; 32-bit integer to single-precision
  CVTSI2SD XMM0, RAX    ; 64-bit integer to double-precision
  CVTDQ2PS XMM0, XMM1   ; Packed 32-bit integers to single
  ```

* **Truncation vs. Rounding:**
  - CVTTSS2SI: Truncates toward zero
  - CVTSS2SI: Rounds according to MXCSR

* **Precision Considerations:**
  - Single-precision can exactly represent integers up to 2^24
  - Double-precision can exactly represent integers up to 2^53
  - Larger integers lose precision when converted to float

* **Example:**
  ```x86asm
  ; Convert array of integers to floats
  int_to_float:
      mov rcx, rdx        ; RCX = count
      shr rcx, 2          ; Process 4 elements at a time
      
  convert_loop:
      movdqu xmm0, [rsi]  ; Load 4 integers
      cvtdq2ps xmm0, xmm0 ; Convert to single-precision
      movaps [rdi], xmm0  ; Store results
      
      add rsi, 16
      add rdi, 16
      dec rcx
      jnz convert_loop
      ret
  ```

### 10.7.2 Floating-Point to Integer Conversion

Converting floating-point values to integers:

* **Truncation:**
  ```x86asm
  CVTTSS2SI EAX, XMM0   ; Single to 32-bit integer (truncate)
  CVTTSD2SI RAX, XMM0   ; Double to 64-bit integer (truncate)
  CVTTPS2DQ XMM0, XMM1  ; Packed single to packed 32-bit integers
  ```

* **Rounding:**
  ```x86asm
  CVTSS2SI EAX, XMM0    ; Single to 32-bit integer (round)
  CVTSD2SI RAX, XMM0    ; Double to 64-bit integer (round)
  CVTPS2DQ XMM0, XMM1   ; Packed single to packed 32-bit integers
  ```

* **Saturation:**
  - No direct saturation instructions in base SSE
  - Can implement with comparisons and masking
  ```x86asm
  ; Saturate single-precision to 8-bit unsigned
  maxss xmm0, [zero]
  minss xmm0, [max_byte]
  cvttss2si eax, xmm0
  ```

* **Example:**
  ```x86asm
  ; Convert array of floats to integers (truncate)
  float_to_int:
      mov rcx, rdx        ; RCX = count
      shr rcx, 2          ; Process 4 elements at a time
      
  convert_loop:
      movaps xmm0, [rsi]  ; Load 4 floats
      cvttps2dq xmm0, xmm0 ; Convert to integers (truncate)
      movdqu [rdi], xmm0  ; Store results
      
      add rsi, 16
      add rdi, 16
      dec rcx
      jnz convert_loop
      ret
  ```

### 10.7.3 Floating-Point Format Conversion

Converting between different floating-point formats:

* **Single to Double:**
  ```x86asm
  CVTSS2SD XMM0, XMM1   ; Single to double
  CVTPS2PD XMM0, XMM1   ; Packed single to packed double (2 elements)
  ```

* **Double to Single:**
  ```x86asm
  CVTSD2SS XMM0, XMM1   ; Double to single
  CVTPD2PS XMM0, XMM1   ; Packed double to packed single
  ```

* **Precision Considerations:**
  - Converting double to single loses precision
  - Converting single to double preserves value exactly
  - Special values (NaN, infinity) are preserved

* **Example:**
  ```x86asm
  ; Convert array of doubles to floats
  double_to_float:
      mov rcx, rdx        ; RCX = count
      shr rcx, 1          ; Process 2 elements at a time
      
  convert_loop:
      movapd xmm0, [rsi]  ; Load 2 doubles
      cvtpd2ps xmm0, xmm0 ; Convert to single (2 elements)
      movaps [rdi], xmm0  ; Store results
      
      add rsi, 16
      add rdi, 8
      dec rcx
      jnz convert_loop
      ret
  ```

### 10.7.4 Special Value Handling

Properly handling special floating-point values during conversion:

* **NaN Propagation:**
  - Most conversions preserve NaN values
  - Integer conversions of NaN typically produce INT_MIN

* **Infinity Handling:**
  - Converting infinity to integer typically produces INT_MAX or INT_MIN
  - Depends on rounding mode and conversion type

* **Denormal Handling:**
  - May be flushed to zero with FTZ/DAZ enabled
  - Can cause performance penalties

* **Example:**
  ```x86asm
  ; Safe conversion with special value handling
  safe_float_to_int:
      ; Check for NaN
      movaps xmm1, xmm0
      cmpps xmm1, xmm1, 4  ; Compare for NaN (unordered)
      movmskps eax, xmm1
      test eax, eax
      jnz handle_nan
      
      ; Check for infinity
      movaps xmm1, xmm0
      andps xmm1, [abs_mask] ; Get absolute value
      cmpps xmm1, [max_float], 2 ; Compare with max float
      movmskps eax, xmm1
      test eax, eax
      jnz handle_inf
      
      ; Normal conversion
      cvttss2si eax, xmm0
      ret
      
  handle_nan:
      mov eax, 0x80000000  ; INT_MIN for NaN
      ret
      
  handle_inf:
      mov eax, 0x7FFFFFFF  ; INT_MAX for +inf
      cmpss xmm0, [zero], 0 ; Check sign
      movmskps ecx, xmm0
      test ecx, ecx
      jz inf_positive
      mov eax, 0x80000000  ; INT_MIN for -inf
  inf_positive:
      ret
      
  section .data
  abs_mask: dd 0x7FFFFFFF, 0x7FFFFFFF, 0x7FFFFFFF, 0x7FFFFFFF
  max_float: dd 3.402823466e+38, 0, 0, 0
  zero: dd 0.0, 0.0, 0.0, 0.0
  ```

This example demonstrates robust handling of special values during conversion, ensuring predictable behavior.

## 10.8 Memory Access Patterns for SIMD

Efficient memory access is critical for SIMD performance. Understanding cache behavior and alignment requirements is essential for high-performance code.

### 10.8.1 Aligned vs. Unaligned Access

Memory alignment significantly impacts SIMD performance:

* **Aligned Access:**
  - Address is multiple of register size (16 for XMM, 32 for YMM, 64 for ZMM)
  - `MOVAPS`, `MOVAPD`, `VMOVAPS` require alignment
  - Typically 2-3x faster than unaligned access
  - May cause general protection fault if misaligned

* **Unaligned Access:**
  - `MOVUPS`, `VMOVUPS` work with any address
  - Slightly slower than aligned access
  - No protection faults
  - May cause cache line splits (2 memory accesses)

* **Performance Impact:**
  - Aligned access: 1 memory operation
  - Unaligned access spanning cache lines: 2 memory operations
  - Unaligned access within cache line: 1 memory operation (slightly slower)

* **Example:**
  ```x86asm
  ; Aligned access (fastest)
  movaps xmm0, [array]  ; Requires array aligned to 16 bytes
  
  ; Unaligned access (slower)
  movups xmm0, [array+1] ; Works with any alignment
  
  ; Handling potential misalignment
  test rax, 0xF
  jz aligned_access
  movups xmm0, [rax]
  jmp process_data
aligned_access:
  movaps xmm0, [rax]
process_data:
  ; ... process data ...
  ```

### 10.8.2 Prefetching Strategies

Prefetching data into cache before use can hide memory latency:

* **Prefetch Instructions:**
  ```x86asm
  prefetcht0 [mem]  ; Prefetch into all cache levels
  prefetcht1 [mem]  ; Prefetch into L2/L3
  prefetcht2 [mem]  ; Prefetch into L2
  prefetchnta [mem] ; Prefetch into non-temporal cache
  ```

* **Effective Prefetching:**
  - Prefetch 512-1024 bytes ahead (8-16 cache lines)
  - Balance prefetch distance with computation time
  - Avoid prefetching too early (data evicted from cache)
  - Avoid prefetching too late (doesn't hide latency)

* **Example:**
  ```x86asm
  ; Vector addition with prefetching
  vector_add:
      mov rcx, rdx        ; RCX = count
      shr rcx, 4          ; Process 16 elements at a time (4 per XMM × 4 registers)
      
  add_loop:
      ; Prefetch data 512 bytes ahead (~128 elements)
      prefetcht0 [rsi+512]
      prefetcht0 [rdi+512]
      prefetcht0 [rdx+512]
      
      ; Load and process 16 elements
      movaps xmm0, [rsi]
      movaps xmm1, [rsi+16]
      movaps xmm2, [rsi+32]
      movaps xmm3, [rsi+48]
      
      addps xmm0, [rdi]
      addps xmm1, [rdi+16]
      addps xmm2, [rdi+32]
      addps xmm3, [rdi+48]
      
      movaps [rdx], xmm0
      movaps [rdx+16], xmm1
      movaps [rdx+32], xmm2
      movaps [rdx+48], xmm3
      
      ; Advance pointers
      add rsi, 64
      add rdi, 64
      add rdx, 64
      dec rcx
      jnz add_loop
      ret
  ```

### 10.8.3 Cache Considerations

Understanding cache behavior is essential for optimizing memory access:

* **Cache Line Size:**
  - Typically 64 bytes on modern processors
  - Data within same cache line accessed together
  - Avoid false sharing (multiple threads modifying same cache line)

* **Cache Hierarchy:**
  - L1: 32-64 KB, 4-8 way set associative, 3-4 cycle latency
  - L2: 256-512 KB, 8 way set associative, 10-12 cycle latency
  - L3: 8-32 MB, 16-24 way set associative, 30-40 cycle latency

* **Optimization Techniques:**
  - **Loop Tiling:** Process data in blocks that fit in cache
  - **Data Layout:** Structure of Arrays (SoA) vs Array of Structures (AoS)
  - **Write Combining:** Use non-temporal stores for streaming writes

* **Example of Loop Tiling:**
  ```x86asm
  ; Matrix multiplication with tiling
  matrix_multiply:
      mov r8, 0           ; i = 0
  outer_i:
      add r8, BLOCK_SIZE
      mov r9, 0           ; j = 0
  outer_j:
      add r9, BLOCK_SIZE
      mov r10, 0          ; k = 0
  inner_k:
      add r10, BLOCK_SIZE
      
      ; Process block [i, i+BLOCK_SIZE] x [j, j+BLOCK_SIZE]
      ; using tiles of size BLOCK_SIZE x BLOCK_SIZE
      
      cmp r10, matrix_size
      jle inner_k
      cmp r9, matrix_size
      jle outer_j
      cmp r8, matrix_size
      jle outer_i
      ret
  ```

This approach dramatically reduces cache misses by reusing data that remains in cache.

### 10.8.4 Handling Edge Cases

Real-world data rarely aligns perfectly with SIMD requirements:

* **Remainder Elements:**
  - Process leftover elements after main SIMD loop
  - Can use scalar code or smaller vector operations
  ```x86asm
  ; Handle remainder elements (0-3 for XMM)
  mov ecx, esi      ; ECX = remaining count
  test ecx, ecx
  jz done
  
  remainder_loop:
      movss xmm0, [rsi]
      ; Process single element
      add rsi, 4
      dec ecx
      jnz remainder_loop
  ```

* **Misaligned Head/Tail:**
  - Process initial misaligned elements with scalar code
  - Align main loop to vector size
  - Process final misaligned elements with scalar code
  ```x86asm
  ; Handle potential misalignment at start
  test rdi, 0xF
  jz aligned_start
  
  ; Process up to 3 elements to reach alignment
  and rax, 0xFFFFFFFFFFFFFFF0
  sub rax, rdi
  cmp rax, 3
  cmova rax, rcx
  ; Process rax elements with scalar code
  add rdi, rax
  sub rcx, rax
  
aligned_start:
  ; Main aligned loop
  ```

* **Masked Operations (AVX-512):**
  - Use mask registers to handle partial vectors
  ```x86asm
  ; Process with AVX-512 using mask
  kmovw k1, [mask_table + rcx]
  vmovups zmm0 {k1}, [rsi]
  vaddps zmm0 {k1}, zmm0, [rdi]
  vmovups [rdx] {k1}, zmm0
  ```

These techniques ensure robust handling of real-world data while maximizing SIMD performance.

## 10.9 Common Algorithms in SIMD

SIMD excels at data-parallel algorithms where the same operation is applied to multiple data elements. This section explores common algorithm patterns that benefit from SIMD implementation.

### 10.9.1 Vector Arithmetic

Basic vector operations are natural SIMD candidates:

* **Vector Addition:**
  ```x86asm
  ; void add_vectors(float* a, float* b, float* c, int n)
  add_vectors:
      mov rcx, rdx        ; RCX = n
      and rdx, 0xFFFFFFFFFFFFFFFC ; RDX = n & ~3 (multiple of 4)
      shr rcx, 2          ; RCX = n/4
      
      test rcx, rcx
      jz remainder
      
  add_loop:
      movaps xmm0, [rsi]  ; Load a[i]
      movaps xmm1, [rdi]  ; Load b[i]
      addps xmm0, xmm1    ; c[i] = a[i] + b[i]
      movaps [r8], xmm0   ; Store c[i]
      
      add rsi, 16
      add rdi, 16
      add r8, 16
      dec rcx
      jnz add_loop
      
  remainder:
      ; Handle remaining elements (0-3)
      mov ecx, edx
      test ecx, ecx
      jz done
      
  rem_loop:
      movss xmm0, [rsi]
      movss xmm1, [rdi]
      addss xmm0, xmm1
      movss [r8], xmm0
      
      add rsi, 4
      add rdi, 4
      add r8, 4
      dec ecx
      jnz rem_loop
      
  done:
      ret
  ```

* **Vector Scaling:**
  ```x86asm
  ; void scale_vector(float* v, float s, int n)
  scale_vector:
      movss xmm1, xmm0    ; Broadcast scalar s
      shufps xmm1, xmm1, 0
      
      mov rcx, rdx
      and rdx, 0xFFFFFFFFFFFFFFFC
      shr rcx, 2
      
      test rcx, rcx
      jz remainder
      
  scale_loop:
      movaps xmm0, [rsi]
      mulps xmm0, xmm1
      movaps [rsi], xmm0
      
      add rsi, 16
      dec rcx
      jnz scale_loop
      
  remainder:
      ; Handle remaining elements
      mov ecx, edx
      test ecx, ecx
      jz done
      
  rem_loop:
      movss xmm0, [rsi]
      mulss xmm0, xmm1
      movss [rsi], xmm0
      
      add rsi, 4
      dec ecx
      jnz rem_loop
      
  done:
      ret
  ```

### 10.9.2 Dot Product and Vector Norm

Computing dot products and norms efficiently:

* **Dot Product:**
  ```x86asm
  ; float dot_product(float* a, float* b, int n)
  dot_product:
      xorps xmm0, xmm0    ; Accumulator
      
      mov rcx, rdx
      and rdx, 0xFFFFFFFFFFFFFFFC
      shr rcx, 2
      
      test rcx, rcx
      jz remainder
      
  dot_loop:
      movaps xmm1, [rsi]  ; a[i]
      movaps xmm2, [rdi]  ; b[i]
      mulps xmm1, xmm2    ; a[i] * b[i]
      addps xmm0, xmm1    ; Accumulate
      
      add rsi, 16
      add rdi, 16
      dec rcx
      jnz dot_loop
      
  remainder:
      mov ecx, edx
      test ecx, ecx
      jz horizontal_sum
      
  rem_loop:
      movss xmm1, [rsi]
      movss xmm2, [rdi]
      mulss xmm1, xmm2
      addss xmm0, xmm1
      
      add rsi, 4
      add rdi, 4
      dec ecx
      jnz rem_loop
      
  horizontal_sum:
      ; Horizontal sum of XMM0
      movaps xmm1, xmm0
      shufps xmm1, xmm0, 0x93 ; [s0, s3, s2, s1]
      addps xmm0, xmm1
      movaps xmm1, xmm0
      shufps xmm1, xmm0, 0x4E ; [s0+s1, s3+s0, s2+s3, s1+s2]
      addps xmm0, xmm1        ; [sum, ..., ..., ...]
      
      movss [rsp], xmm0
      movss xmm0, [rsp]
      ret
  ```

* **Vector Norm:**
  ```x86asm
  ; float vector_norm(float* v, int n)
  vector_norm:
      xorps xmm0, xmm0    ; Sum of squares
      
      mov rcx, rdx
      and rdx, 0xFFFFFFFFFFFFFFFC
      shr rcx, 2
      
      test rcx, rcx
      jz remainder
      
  norm_loop:
      movaps xmm1, [rsi]  ; v[i]
      mulps xmm1, xmm1    ; v[i]^2
      addps xmm0, xmm1    ; Accumulate
      
      add rsi, 16
      dec rcx
      jnz norm_loop
      
  remainder:
      mov ecx, edx
      test ecx, ecx
      jz horizontal_sum
      
  rem_loop:
      movss xmm1, [rsi]
      mulss xmm1, xmm1
      addss xmm0, xmm1
      
      add rsi, 4
      dec ecx
      jnz rem_loop
      
  horizontal_sum:
      ; Horizontal sum
      movaps xmm1, xmm0
      shufps xmm1, xmm0, 0x93
      addps xmm0, xmm1
      movaps xmm1, xmm0
      shufps xmm1, xmm0, 0x4E
      addps xmm0, xmm1
      
      sqrtss xmm0, xmm0   ; sqrt(sum)
      movss [rsp], xmm0
      movss xmm0, [rsp]
      ret
  ```

### 10.9.3 Matrix Operations

Matrix computations benefit greatly from SIMD:

* **Matrix-Vector Multiplication:**
  ```x86asm
  ; void matvec(float* A, float* x, float* y, int rows, int cols)
  matvec:
      mov r8, rsi         ; R8 = &x[0]
      mov r9, rdx         ; R9 = &y[0]
      mov r10, rcx        ; R10 = rows
      mov r11, r8         ; R11 = cols
      
      xor rax, rax        ; i = 0
  row_loop:
      ; Process row i
      xorps xmm0, xmm0    ; y[i] = 0
      
      mov rcx, r11
      and r11d, 0xFFFFFFFC
      shr rcx, 2
      mov rsi, r8         ; RSI = &A[i*cols]
      
      test rcx, rcx
      jz rem_cols
      
  col_loop:
      movaps xmm1, [rsi]  ; Load 4 elements of A[i][j]
      movaps xmm2, [rdi]  ; Load 4 elements of x[j]
      mulps xmm1, xmm2
      haddps xmm1, xmm1   ; Horizontal add to get partial sum
      haddps xmm1, xmm1
      addss xmm0, xmm1
      
      add rsi, 16
      add rdi, 16
      dec rcx
      jnz col_loop
      
  rem_cols:
      mov ecx, r11d
      test ecx, ecx
      jz store_result
      
  rem_loop:
      movss xmm1, [rsi]
      movss xmm2, [rdi]
      mulss xmm1, xmm2
      addss xmm0, xmm1
      
      add rsi, 4
      add rdi, 4
      dec ecx
      jnz rem_loop
      
  store_result:
      movss [r9], xmm0    ; Store y[i]
      
      add r9, 4           ; Advance to next row result
      add r8, r11         ; Advance to next row of A
      inc rax             ; i++
      cmp rax, r10
      jl row_loop
      ret
  ```

* **Matrix-Matrix Multiplication:**
  ```x86asm
  ; void matmul(float* A, float* B, float* C, int M, int N, int K)
  matmul:
      ; Implementation would use tiling and vectorization
      ; for both A and B matrices
      ; This is a simplified example
      ; ...
      ret
  ```

### 10.9.4 Image Processing

Image operations are highly parallelizable:

* **Grayscale Conversion:**
  ```x86asm
  ; void rgb_to_grayscale(unsigned char* rgb, unsigned char* gray, int pixels)
  rgb_to_grayscale:
      mov rcx, rdx
      and rdx, 0xFFFFFFFFFFFFFFFC
      shr rcx, 2
      
      test rcx, rcx
      jz remainder
      
      ; Coefficients for grayscale: 0.299*R + 0.587*G + 0.114*B
      movaps xmm4, [coeffs]
      
  convert_loop:
      movdqu xmm0, [rsi]  ; Load 4 pixels (12 bytes, but we'll handle overlap)
      
      ; Extract R, G, B components
      movaps xmm1, xmm0
      pshufb xmm1, [shuffle_r]
      movaps xmm2, xmm0
      pshufb xmm2, [shuffle_g]
      movaps xmm3, xmm0
      pshufb xmm3, [shuffle_b]
      
      ; Convert to float and apply coefficients
      cvtdq2ps xmm1, xmm1
      cvtdq2ps xmm2, xmm2
      cvtdq2ps xmm3, xmm3
      mulps xmm1, xmm4
      shufps xmm4, xmm4, 0x93 ; Reorder coefficients
      mulps xmm2, xmm4
      shufps xmm4, xmm4, 0x4E
      mulps xmm3, xmm4
      
      ; Sum and convert back to integer
      addps xmm1, xmm2
      addps xmm1, xmm3
      cvttps2dq xmm1, xmm1
      packssdw xmm1, xmm1
      packuswb xmm1, xmm1
      
      ; Store result
      movq [rdi], xmm1
      
      add rsi, 12         ; Advance 3 bytes per pixel × 4 pixels
      add rdi, 4          ; Advance 1 byte per pixel × 4 pixels
      dec rcx
      jnz convert_loop
      
  remainder:
      ; Handle remaining pixels with scalar code
      ; ...
      ret
      
  section .data
  coeffs: dd 0.299, 0.587, 0.114, 0.0
  shuffle_r: db 0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15
  shuffle_g: db 1, 5, 9, 13, 0, 4, 8, 12, 2, 6, 10, 14, 3, 7, 11, 15
  shuffle_b: db 2, 6, 10, 14, 0, 4, 8, 12, 1, 5, 9, 13, 3, 7, 11, 15
  ```

* **Image Blurring (Box Filter):**
  ```x86asm
  ; void box_blur(float* src, float* dst, int width, int height)
  box_blur:
      ; Implementation would use vector loads and horizontal adds
      ; to compute the average of neighboring pixels
      ; ...
      ret
  ```

These examples demonstrate how common algorithms can be transformed to leverage SIMD parallelism for significant performance gains.

## 10.10 Performance Optimization Techniques

Writing high-performance SIMD code requires strategic instruction selection and careful optimization. This section explores practical techniques for maximizing performance through intelligent instruction usage.

### 10.10.1 Instruction Selection for Performance

Strategic instruction selection can significantly impact performance:

* **Fused Multiply-Add (FMA):**
  ```x86asm
  ; Without FMA
  mulps xmm0, xmm1
  addps xmm0, xmm2
  
  ; With FMA (AVX2+)
  vfmadd213ps xmm0, xmm1, xmm2  ; xmm0 = xmm0*xmm1 + xmm2
  ```
  - Reduces instruction count
  - Eliminates intermediate rounding
  - Can provide 1.5-2x speedup for math-heavy code

* **Horizontal Operations:**
  ```x86asm
  ; Slow horizontal sum
  movhlps xmm1, xmm0
  addps xmm0, xmm1
  movaps xmm1, xmm0
  shufps xmm1, xmm0, 1
  addss xmm0, xmm1
  
  ; Faster with AVX
  vhaddps xmm0, xmm0, xmm0
  vhaddps xmm0, xmm0, xmm0
  ```
  - AVX provides dedicated horizontal operations
  - Reduces instruction count for common patterns

* **Approximate Reciprocals:**
  ```x86asm
  ; Precise division
  divps xmm0, xmm1
  
  ; Faster approximation (with Newton-Raphson refinement)
  rcpss xmm0, xmm1
  movss xmm2, xmm0
  mulss xmm2, xmm1
  subss xmm2, [const_2]
  mulss xmm2, xmm0
  ```
  - Can be 2-4x faster than division
  - Requires refinement for full precision

* **Example Optimization: Dot Product with FMA**
  ```x86asm
  ; Standard dot product
  dot_product_std:
      xorps xmm0, xmm0
      mov rcx, rdx
      shr rcx, 2
      
  std_loop:
      movaps xmm1, [rsi]
      movaps xmm2, [rdi]
      mulps xmm1, xmm2
      addps xmm0, xmm1
      ; ...
  
  ; Optimized with FMA
  dot_product_fma:
      xorps xmm0, xmm0
      mov rcx, rdx
      shr rcx, 2
      
  fma_loop:
      movaps xmm1, [rsi]
      movaps xmm2, [rdi]
      vfmsub213ps xmm0, xmm1, xmm2  ; xmm0 -= xmm1*xmm2 (negative dot product)
      ; ...
  ```

### 10.10.2 Loop Unrolling and Software Pipelining

Optimizing loop structure for better performance:

* **Loop Unrolling:**
  ```x86asm
  ; Standard loop (1 element per iteration)
  loop_std:
      movaps xmm0, [rsi]
      addps xmm0, [rdi]
      movaps [rdx], xmm0
      add rsi, 16
      add rdi, 16
      add rdx, 16
      dec rcx
      jnz loop_std
  
  ; Unrolled loop (4 elements per iteration)
  loop_unrolled:
      movaps xmm0, [rsi]
      movaps xmm1, [rsi+16]
      movaps xmm2, [rsi+32]
      movaps xmm3, [rsi+48]
      addps xmm0, [rdi]
      addps xmm1, [rdi+16]
      addps xmm2, [rdi+32]
      addps xmm3, [rdi+48]
      movaps [rdx], xmm0
      movaps [rdx+16], xmm1
      movaps [rdx+32], xmm2
      movaps [rdx+48], xmm3
      add rsi, 64
      add rdi, 64
      add rdx, 64
      sub rcx, 4
      jg loop_unrolled
  ```
  - Reduces branch frequency
  - Enables better instruction scheduling
  - Can improve performance by 1.5-3x

* **Software Pipelining:**
  ```x86asm
  ; Standard loop
  loop_std:
      movaps xmm0, [rsi]
      addps xmm0, [rdi]
      movaps [rdx], xmm0
      add rsi, 16
      add rdi, 16
      add rdx, 16
      dec rcx
      jnz loop_std
  
  ; Software pipelined
  loop_pipelined:
      movaps xmm0, [rsi]
      add rsi, 16
  pipelined_loop:
      movaps xmm1, [rsi]
      addps xmm0, [rdi]
      movaps [rdx], xmm0
      add rdi, 16
      add rdx, 16
      
      movaps xmm0, xmm1
      add rsi, 16
      dec rcx
      jnz pipelined_loop
      
      addps xmm0, [rdi]
      movaps [rdx], xmm0
  ```
  - Hides instruction latency
  - Keeps multiple operations in flight
  - Particularly effective for memory-bound code

### 10.10.3 Register Allocation and Pressure Management

Effective register usage is critical for performance:

* **Register Allocation Strategies:**
  - Keep frequently accessed values in registers
  - Minimize register spills to memory
  - Structure algorithms to work within register constraints

* **x64 Advantages:**
  - 16 XMM registers (vs 8 in 32-bit mode)
  - More registers for function arguments and temporaries
  - Better support for complex algorithms

* **Common Patterns:**
  ```x86asm
  ; High register pressure (bad)
  movaps xmm0, [A]
  movaps xmm1, [B]
  movaps xmm2, [C]
  movaps xmm3, [D]
  ; ... more register usage ...
  
  ; Better: Reuse registers when possible
  movaps xmm0, [A]
  ; Use xmm0
  movaps xmm0, [B]      ; Reuse xmm0 after first use
  ; Use xmm0
  ```

* **Spill Code Optimization:**
  - Spill least frequently used values first
  - Align spilled values to cache lines
  - Minimize the number of spills

* **Example: Matrix Multiplication with Register Tiling**
  ```x86asm
  ; Process 4x4 block of C using registers
  matrix_mult_block:
      ; Load 4 rows of A (16 elements)
      movaps xmm0, [A]
      movaps xmm1, [A+16]
      movaps xmm2, [A+32]
      movaps xmm3, [A+48]
      
      ; Process 4 columns of B
      xor rax, rax
  col_loop:
      ; Load column j of B
      movss xmm4, [B]
      shufps xmm4, xmm4, 0
      movss xmm5, [B+4]
      shufps xmm5, xmm5, 0
      movss xmm6, [B+8]
      shufps xmm6, xmm6, 0
      movss xmm7, [B+12]
      shufps xmm7, xmm7, 0
      
      ; Multiply and accumulate
      mulps xmm4, xmm0
      mulps xmm5, xmm1
      mulps xmm6, xmm2
      mulps xmm7, xmm3
      addps xmm4, xmm5
      addps xmm6, xmm7
      addps xmm4, xmm6
      
      ; Store result
      movaps [C], xmm4
      
      add B, 16
      add C, 16
      inc rax
      cmp rax, 4
      jl col_loop
      ret
  ```

### 10.10.4 Memory Access Optimization

Optimizing memory access patterns for the memory hierarchy:

* **Cache Line Awareness:**
  ```x86asm
  ; Good: Sequential access (cache-friendly)
  mov rcx, length
  mov rsi, array
  loop_seq:
      movaps xmm0, [rsi]
      addps xmm0, xmm1
      movaps [rdi], xmm0
      add rsi, 16
      add rdi, 16
      dec rcx
      jnz loop_seq
  
  ; Bad: Random access (cache-unfriendly)
  mov rcx, length
  loop_rand:
      mov rdx, [indices + rcx*4]
      movaps xmm0, [array + rdx*4]
      ; ...
      dec rcx
      jnz loop_rand
  ```

* **Prefetching:**
  ```x86asm
  mov rcx, length
  mov rsi, array
  loop_prefetch:
      prefetcht0 [rsi + 512]  ; Load data 8 cache lines ahead
      movaps xmm0, [rsi]
      addps xmm0, xmm1
      movaps [rdi], xmm0
      add rsi, 16
      add rdi, 16
      dec rcx
      jnz loop_prefetch
  ```

* **Loop Tiling (Blocking):**
  ```x86asm
  ; Matrix multiplication with tiling
  mov rcx, 0
  outer_loop:
      add rcx, BLOCK_SIZE
      mov rdx, 0
  inner_loop:
      add rdx, BLOCK_SIZE
      ; Process block [RCX, RCX+BLOCK_SIZE] x [RDX, RDX+BLOCK_SIZE]
      cmp rdx, matrix_size
      jle inner_loop
      cmp rcx, matrix_size
      jle outer_loop
  ```

* **Structure Padding:**
  ```x86asm
  ; Structure with proper padding for cache line alignment
  align 64
  thread_local:
      value dd 0
      ; 60 bytes of padding
  ```

* **Write-Combining:**
  ```x86asm
  ; Use non-temporal stores for streaming output
  movntps [rdi], xmm0
  ```

## 10.11 Debugging Floating-Point and SIMD Code

Debugging numerical and SIMD code requires specialized techniques to understand floating-point behavior and vector operations.

### 10.11.1 Common Floating-Point Pitfalls

* **Precision Issues:**
  - Accumulation of rounding errors
  - Cancellation (loss of significance)
  - Absorption (small values lost in addition)
  ```x86asm
  ; Problem: 1.0 + 1e-16 == 1.0 in double precision
  movsd xmm0, [one]
  addsd xmm0, [tiny]
  ; xmm0 still equals 1.0 due to precision limits
  ```

* **Denormal Performance Penalty:**
  - Denormal values can cause 10-100x slowdown
  - Enable FTZ/DAZ to flush denormals to zero
  ```x86asm
  ; Enable flush-to-zero
  stmxcsr [mxcsr]
  mov eax, [mxcsr]
  or eax, 0x8000  ; Set FTZ bit
  ldmxcsr eax
  ```

* **Order of Operations:**
  - Floating-point addition is not associative
  - (a + b) + c may differ from a + (b + c)
  ```x86asm
  ; Different results due to rounding
  movss xmm0, [a]
  addss xmm0, [b]
  addss xmm0, [c]  ; Result 1
  
  movss xmm1, [b]
  addss xmm1, [c]
  addss xmm1, [a]  ; Result 2 (may differ)
  ```

* **Comparison Issues:**
  - Never compare floating-point values for exact equality
  - Use epsilon-based comparisons
  ```x86asm
  ; Bad: Direct comparison
  comiss xmm0, xmm1
  je equal
  
  ; Good: Epsilon comparison
  movss xmm2, [epsilon]
  subss xmm0, xmm1
  comiss xmm0, xmm2
  jbe equal
  ```

### 10.11.2 Debugging Tools and Techniques

* **GDB Commands for Floating-Point:**
  ```bash
  gdb program
  (gdb) info float        # Show x87 FPU state
  (gdb) info registers xmm0-xmm7  # Show XMM registers
  (gdb) p/t $xmm0         # Print XMM0 in binary
  (gdb) p (float[4]) $xmm0.v4_float  # Interpret as 4 floats
  ```

* **Hardware Performance Counters:**
  ```bash
  perf stat -e fpu_ops,fp_arith_inst,simd_inst ./program
  perf record -e cycles,instructions,fp_arith_inst ./program
  ```

* **Intel VTune:**
  - Detailed floating-point operation analysis
  - Vectorization efficiency metrics
  - Memory access pattern visualization
  - Floating-point exception tracking

* **Specialized Debugging Techniques:**
  ```x86asm
  ; Check for NaN
  movaps xmm1, xmm0
  cmpps xmm1, xmm1, 4  ; Compare for NaN (unordered)
  movmskps eax, xmm1
  test eax, eax
  jnz handle_nan
  
  ; Check for infinity
  movaps xmm1, xmm0
  andps xmm1, [abs_mask]
  cmpps xmm1, [max_float], 2
  movmskps eax, xmm1
  test eax, eax
  jnz handle_inf
  ```

### 10.11.3 Systematic Debugging Approach

1. **Reproduce the Issue:**
   - Create minimal test case with known input/output
   - Determine consistent reproduction steps

2. **Verify Numerical Correctness:**
   - Compare with reference implementation
   - Check intermediate results
   - Verify special value handling

3. **Examine Register State:**
   - Check XMM/YMM/ZMM registers at key points
   - Verify proper initialization
   - Check for unexpected NaN or infinity

4. **Analyze Memory Access:**
   - Check alignment of memory operands
   - Verify data layout matches expectations
   - Check for cache line splits

5. **Validate Instruction Selection:**
   - Confirm appropriate instruction usage
   - Check for precision issues
   - Verify proper handling of special values

6. **Measure Performance Characteristics:**
   - Use performance counters to identify bottlenecks
   - Compare with expected instruction metrics
   - Identify microarchitectural issues

> **"The most profound difference between debugging floating-point code and integer code is the spectrum of 'almost correct' results. In integer programming, a bug typically produces completely wrong results or crashes immediately. In floating-point programming, a bug might produce results that are 99.999% correct—accurate enough to pass initial tests but subtly flawed in critical ways. This near-correctness is both a blessing and a curse—it allows useful computation despite minor errors, but it also masks fundamental algorithmic flaws. Mastering floating-point debugging requires developing an intuition for the accumulation of rounding errors, the propagation of special values, and the subtle interactions between algorithm design and hardware representation. This mindset shift—from expecting exact results to understanding error bounds—is the hallmark of a proficient numerical programmer."**

## 10.12 Practical Applications and Case Studies

This section explores real-world applications of floating-point and SIMD programming, demonstrating how these techniques solve practical problems across diverse domains.

### 10.12.1 Scientific Computing: N-Body Simulation

N-body simulations model gravitational interactions between particles:

* **Algorithm Overview:**
  - For each particle, calculate force from all other particles
  - Update position and velocity based on forces
  - Repeat for multiple time steps

* **SIMD Implementation Strategy:**
  - Process multiple particles simultaneously
  - Use SIMD for distance calculations and force computations
  - Optimize memory access patterns

* **Key SIMD Optimization:**
  ```x86asm
  ; Calculate forces between a target particle and 4 others
  nbody_force_calc:
      ; Load target particle (x,y,z,m)
      movaps xmm0, [target_pos]  ; [z, y, x, ?]
      movss xmm4, [target_mass]
      
      ; Load 4 source particles
      movaps xmm1, [sources_pos] ; [z0, y0, x0, ?]
      movaps xmm2, [sources_pos+16] ; [z1, y1, x1, ?]
      movaps xmm3, [sources_pos+32] ; [z2, y2, x2, ?]
      ; xmm4 already has target mass
      
      ; Calculate dx, dy, dz for 4 particles
      subps xmm1, xmm0
      subps xmm2, xmm0
      subps xmm3, xmm0
      
      ; Calculate dx^2, dy^2, dz^2
      ; (using temporary registers)
      ; ...
      
      ; Horizontal operations to combine results
      ; ...
      
      ; Calculate force components
      ; ...
      
      ret
  ```

* **Performance Impact:**
  - 3-4x speedup with SSE
  - 6-8x speedup with AVX
  - Additional gains with FMA and AVX-512

* **Numerical Considerations:**
  - Use double-precision for accuracy
  - Handle close encounters carefully
  - Implement error control mechanisms

### 10.12.2 Graphics and Multimedia Processing

Image and video processing heavily relies on SIMD:

* **Image Resizing with Bilinear Interpolation:**
  ```x86asm
  ; void resize_bilinear(float* src, float* dst, 
  ;                     int src_w, int src_h, int dst_w, int dst_h)
  resize_bilinear:
      ; Calculate scale factors
      ; ...
      
      ; Process 4 destination pixels at a time
      mov rcx, dst_w
      and rcx, 0xFFFFFFFFFFFFFFFC
      
  width_loop:
      ; Calculate source coordinates for 4 pixels
      ; ...
      
      ; Load 4 source pixels (with appropriate offsets)
      movaps xmm0, [src + offset0]
      ; ...
      
      ; Bilinear interpolation calculations
      ; ...
      
      ; Store results
      movaps [dst], xmm0
      
      add dst, 16
      add rcx, 4
      cmp rcx, dst_w
      jl width_loop
      
      ; Handle row advancement
      ; ...
      ret
  ```

* **Video Encoding (H.264/AVC):**
  - Motion estimation using SIMD-optimized SAD (Sum of Absolute Differences)
  - DCT (Discrete Cosine Transform) using SIMD
  - Quantization and entropy coding

* **3D Graphics Transformations:**
  ```x86asm
  ; Transform 4 vertices by a 4x4 matrix
  transform_vertices:
      ; Load transformation matrix rows
      movaps xmm0, [matrix+0]   ; Row 0
      movaps xmm1, [matrix+16]  ; Row 1
      movaps xmm2, [matrix+32]  ; Row 2
      movaps xmm3, [matrix+48]  ; Row 3
      
      ; Load 4 vertices (x,y,z,1)
      movaps xmm4, [vertices+0]  ; Vertex 0
      movaps xmm5, [vertices+16] ; Vertex 1
      ; ...
      
      ; Transform vertex 0
      movaps xmm6, xmm4
      shufps xmm6, xmm6, 0x00    ; Broadcast x
      mulps xmm6, xmm0
      movaps xmm7, xmm4
      shufps xmm7, xmm7, 0x55    ; Broadcast y
      mulps xmm7, xmm1
      ; ...
      addps xmm6, xmm7
      ; ...
      
      ; Store transformed vertex
      movaps [result+0], xmm6
      
      ; Repeat for other vertices
      ; ...
      ret
  ```

* **Performance Considerations:**
  - Use single-precision for graphics (sufficient accuracy)
  - Optimize memory access for texture cache
  - Leverage GPU when appropriate

### 10.12.3 Machine Learning Inference

Machine learning models rely heavily on SIMD for inference:

* **Matrix Multiplication for Neural Networks:**
  ```x86asm
  ; void gemm(float* A, float* B, float* C, int M, int N, int K)
  gemm:
      ; Tiled implementation with register blocking
      mov r8, 0           ; i = 0
  i_loop:
      add r8, TILE_M
      mov r9, 0           ; j = 0
  j_loop:
      add r9, TILE_N
      mov r10, 0          ; k = 0
  k_loop:
      add r10, TILE_K
      
      ; Process block C[i:i+TILE_M, j:j+TILE_N]
      ; using A[i:i+TILE_M, k:k+TILE_K] and B[k:k+TILE_K, j:j+TILE_N]
      
      cmp r10, K
      jle k_loop
      cmp r9, N
      jle j_loop
      cmp r8, M
      jle i_loop
      ret
  ```

* **Activation Functions:**
  ```x86asm
  ; void relu(float* x, int n)
  relu:
      xorps xmm1, xmm1    ; Zero vector
      
      mov rcx, rdx
      and rdx, 0xFFFFFFFFFFFFFFFC
      shr rcx, 2
      
      test rcx, rcx
      jz remainder
      
  relu_loop:
      movaps xmm0, [rsi]
      maxps xmm0, xmm1    ; ReLU(x) = max(x, 0)
      movaps [rsi], xmm0
      
      add rsi, 16
      dec rcx
      jnz relu_loop
      
  remainder:
      ; Handle remaining elements
      ; ...
      ret
  ```

* **Softmax Function:**
  ```x86asm
  ; void softmax(float* x, float* y, int n)
  softmax:
      ; Find maximum value
      ; ...
      
      ; Compute exp(x[i] - max)
      ; ...
      
      ; Compute sum of exponents
      ; ...
      
      ; Compute final probabilities
      ; ...
      ret
  ```

* **Optimization Techniques:**
  - Quantization to 8-bit integers for mobile devices
  - FMA for efficient multiply-add operations
  - Memory layout optimization (NCHW vs NHWC)

### 10.12.4 Financial Calculations

Financial models require both precision and performance:

* **Monte Carlo Option Pricing:**
  ```x86asm
  ; void monte_carlo(float* results, int paths, int steps)
  monte_carlo:
      ; Initialize random number generator
      ; ...
      
      ; Process 4 paths simultaneously
      mov rcx, paths
      shr rcx, 2
      
  path_loop:
      ; Generate random numbers for 4 paths
      ; ...
      
      ; Simulate price paths
      mov r8, 0           ; step = 0
  step_loop:
      ; Load current prices
      movaps xmm0, [prices]
      
      ; Calculate price change (using Brownian motion)
      ; dS = S * (mu*dt + sigma*dW)
      mulps xmm0, [dt_mu]
      ; ...
      
      ; Update prices
      addps xmm0, [prices]
      movaps [prices], xmm0
      
      inc r8
      cmp r8, steps
      jl step_loop
      
      ; Calculate payoff
      ; ...
      
      ; Store results
      ; ...
      
      add rcx, 4
      cmp rcx, paths
      jl path_loop
      
      ; Calculate final option price
      ; ...
      ret
  ```

* **Black-Scholes Model:**
  ```x86asm
  ; float black_scholes(float S, float K, float T, float r, float sigma)
  black_scholes:
      ; Calculate d1 and d2
      movss xmm0, [sigma]
      mulss xmm0, [T_sqrt]
      movss xmm1, xmm0
      divss xmm1, [two]
      movss xmm2, xmm0
      mulss xmm2, xmm2
      movss xmm3, [r]
      addss xmm3, xmm2
      movss xmm4, [S]
      divss xmm4, [K]
      logss xmm4, xmm4
      addss xmm4, xmm3
      divss xmm4, xmm1
      movss [d1], xmm4
      
      ; Calculate N(d1) and N(d2)
      ; ...
      
      ; Calculate call price
      ; ...
      ret
  ```

* **Numerical Considerations:**
  - Use double-precision for financial calculations
  - Carefully handle edge cases
  - Validate against reference implementations
  - Monitor for numerical instability

## 10.13 Conclusion: The Future of Floating-Point and SIMD

This chapter has explored the intricate world of floating-point and SIMD programming in x64 Assembly, revealing how these capabilities transform abstract mathematical concepts into high-performance computational reality. From the fundamental IEEE 754 standard to advanced AVX-512 features, we've examined the critical components that enable efficient numerical computation.

The key insight is that floating-point and SIMD operations are not merely syntactic forms—they represent concrete physical operations that traverse floating-point units, vector registers, and memory hierarchies. The `ADDPS` instruction isn't just a way to add numbers; it triggers a precisely timed sequence of electrical signals that process multiple data elements in parallel. Understanding these operations transforms numerical programming from a syntactic exercise into an informed dialogue with the hardware.

For the beginning Assembly programmer, mastering floating-point and SIMD provides several critical advantages:

1. **Precision Control:** The ability to manage numerical precision with surgical precision, understanding the trade-offs between speed and accuracy.

2. **Performance Optimization:** Knowledge of how vector instructions map to execution units enables targeted optimizations that higher-level compilers might miss.

3. **Effective Debugging:** When numerical issues arise, understanding the hardware representation allows diagnosis of problems that might appear as inexplicable inaccuracies at higher levels of abstraction.

4. **Cross-Domain Proficiency:** Recognizing the underlying principles of numerical computation enables adaptation to different application domains while understanding the trade-offs involved.

The journey through floating-point and SIMD reveals a fundamental truth: all numerical computation ultimately rests on a few simple principles expressed through increasingly sophisticated circuitry. Binary representation, rounding behavior, vector parallelism—these principles, implemented through complex hardware, enable the sophisticated computations we take for granted.

As you proceed to write increasingly sophisticated numerical code, continually reflect on how instruction selection impacts the underlying hardware. Let these decisions be informed by an understanding of precision requirements, memory hierarchy interactions, and hardware capabilities. Remember that every floating-point operation you specify interacts with a complex, carefully engineered physical system; respecting that system's constraints and leveraging its capabilities is the essence of expert numerical programming.

> **"The most dangerous misconception in numerical programming is that floating-point arithmetic is merely 'approximate integer arithmetic.' In reality, it is a carefully designed system with its own rules, behaviors, and pitfalls—rules that become increasingly important as computations grow more complex. The expert numerical programmer doesn't just accept floating-point as a necessary evil; they understand it as a powerful tool with specific strengths and limitations. They know when to demand double-precision and when single-precision suffices, when to use FMA and when to avoid it, when to flush denormals and when to preserve them. This nuanced understanding transforms numerical code from a source of mysterious errors into a reliable engine of computational power—a transformation that separates the novice from the expert in the realm of high-performance computing."**

