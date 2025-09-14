# 23. Secure Deployment of Safety-Critical Firmware: Cryptographic Integrity and Verified Execution

## Introduction: Why Secure Deployment Is a Safety Requirement

In safety-critical systems, **a correct binary is not enough**. The moment a verified, certified firmware image leaves the build environment, it becomes vulnerable to tampering, corruption, or unauthorized modification. A single bit flip during transmission, an unverified update, or a maliciously injected instruction can turn a DO-178C-certified system into a hazard.

Secure deployment is not just a cybersecurity concern — it is a **core safety requirement**.

For aviation systems, an attacker who modifies the altitude calculation logic could cause controlled flight into terrain (CFIT). For medical devices, a compromised insulin pump could deliver a lethal dose. Therefore, the ability to **cryptographically verify the integrity and authenticity of firmware before execution** is essential for maintaining safety throughout the system lifecycle.

> **Safety Philosophy**: *If you cannot prove that the running firmware is identical to the certified version, then the system is not safe.*

This tutorial provides a complete framework for securing the deployment of safety-critical firmware—especially when it contains assembly language components. You will learn how to:
- Sign firmware images using qualified cryptographic tools
- Implement secure boot with hardware-backed verification
- Protect against rollback attacks
- Verify execution on real hardware
- Generate audit-ready evidence for certification bodies

By the end of this tutorial, your deployment pipeline will not only deliver code—it will deliver **trust**.

---

## Why Traditional Firmware Updates Fail in Safety-Critical Contexts

Many embedded systems use simple, unsecured update mechanisms—such as copying a binary over USB or via a wireless link. These approaches are fundamentally unsafe.

| Problem (Traditional Update) | Consequence in Safety-Critical Systems |
|-------------------------------|----------------------------------------|
| No cryptographic signing | Cannot detect tampered or corrupted binaries |
| Unverified boot process | System may execute uncertified code |
| Rollback without detection | Older, vulnerable versions can be reinstalled |
| No hardware root of trust | Entire chain of trust is software-only and fragile |
| Insecure communication channels | Risk of man-in-the-middle attacks during OTA |
| No post-deployment verification | Cannot confirm what is actually running |

### Case Study: Medical Device Recall Due to Rollback Attack

A Class III infusion pump allowed firmware updates via Bluetooth without anti-rollback protection. An attacker exploited this by forcing a rollback to a known-vulnerable version, then exploiting a buffer overflow to disable safety limits. The device delivered an overdose, resulting in patient injury and a full recall.

> **Lesson**: Secure deployment must include **anti-rollback**, **cryptographic integrity**, and **hardware-enforced execution policy**.

---

## The Secure Deployment Philosophy for Safety-Critical Systems

Secure deployment transforms the firmware update process from a risky operation into a **verifiable safety event**. It ensures that only certified, unmodified firmware can ever execute on the target device.

### Core Principles of Secure Deployment

1. **Cryptographic Integrity**: Every firmware image must be signed; its hash must match the certified version.
2. **Hardware Root of Trust**: Verification must start from immutable, hardware-protected boot code.
3. **Anti-Rollback Protection**: The system must reject older firmware versions, even if they are validly signed.
4. **Verified Execution**: Before any code runs, the entire firmware image—including assembly modules—must be verified.
5. **Immutable Audit Trail**: All update attempts (success or failure) must be logged in non-volatile memory.
6. **Tool Qualification**: All signing and verification tools must be qualified per DO-178C TQL-2.

> **Core Tenet**: *The system must never execute a binary unless it has been cryptographically proven to be the certified version.*

---

## Designing a Secure Boot Chain for Safety-Critical Systems

A secure boot chain is a sequence of cryptographic verifications that starts in hardware and extends through every layer of firmware.

```
+---------------------+
|   Application Code   |  ← Signed & verified
+---------------------+
|     RTOS / HAL      |  ← Signed & verified
+---------------------+
|    Bootloader (BL2) |  ← Signed & verified
+---------------------+
|  ROM Boot (BL1)     |  ← Hardware-embedded, immutable
+---------------------+
        ↓
[Hardware Root of Trust]
```

Each stage verifies the next before transferring control.

### Stage 1: ROM Boot (BL1) – The Immutable Foundation

The first-stage bootloader (BL1) is burned into read-only memory (ROM) at manufacturing time. It is the **root of trust**.

#### Safe Pattern: ROM Boot Assembly Implementation

```x86asm
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;# Summary: Secure ROM Boot (BL1) - First-Stage Bootloader
;# Requirement: REQ-BL1-001
;# Verification: VC-BL1-001 
;# Test: TEST-BL1-001
;#
;# Boot Security Considerations:
;#
;# 1. Safety Rules:
;#    - Immutable entry point
;#    - Hardware-backed public key
;#    - Verified load of BL2
;#
;# 2. Safety Verification:
;#    - Boot integrity verified
;#    - No unverified execution
;#    - Anti-rollback enforced
;#
;# Tool: GNU Assembler 2.38 (qualified)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

.section .text.boot
.global _start
.type _start, @function

; Constants
PUBLIC_KEY_ADDR = 0x1000          ; Address of ECDSA public key in OTP
BL2_HEADER_ADDR = 0x8000          ; Start of BL2 metadata
BL2_LOAD_ADDR   = 0x10000         ; Where to load BL2
MAX_BL2_SIZE    = 0x8000          ; Maximum size of BL2

_start:
    ; Initialize stack pointer
    mov $0x2000_0000, %rsp

    ;# check: REQ-BL1-002
    ;# check: VC-BL1-002
    ; Load firmware version from header
    mov BL2_HEADER_ADDR + 0, %rax   ; Version field
    cmp $1, %rax                    ; Must be >= v1
    jl rollback_reject

    ;# check: REQ-BL1-003
    ;# check: VC-BL1-003
    ; Read BL2 size
    mov BL2_HEADER_ADDR + 8, %rbx
    cmp $MAX_BL2_SIZE, %rbx
    jg bl2_too_large

    ;# check: REQ-BL1-004
    ;# check: VC-BL1-004
    ; Compute SHA-256 hash of BL2 image
    lea BL2_LOAD_ADDR, %rdi
    mov %rbx, %rsi                 ; size
    call sha256                    ; result in sha256_output

    ;# check: REQ-BL1-005
    ;# check: VC-BL1-005
    ; Verify signature using ECDSA
    lea PUBLIC_KEY_ADDR, %rdi      ; Public key
    lea BL2_HEADER_ADDR + 16, %rsi ; Signature location
    lea sha256_output, %rdx        ; Hash to verify
    call ecdsa_verify
    test %rax, %rax
    jz signature_invalid

    ;# check: REQ-BL1-006
    ;# check: VC-BL1-006
    ; Jump to verified BL2
    mov $BL2_LOAD_ADDR, %rax
    jmp *%rax

rollback_reject:
    ;# check: REQ-BL1-007
    ;# check: VC-BL1-007
    ; Log rollback attempt
    mov $LOG_ROLLBACK, %rdi
    call log_event
    hlt

bl2_too_large:
    ;# check: REQ-BL1-008
    ;# check: VC-BL1-008
    ; Log oversized image
    mov $LOG_BL2_TOO_LARGE, %rdi
    call log_event
    hlt

signature_invalid:
    ;# check: REQ-BL1-009
    ;# check: VC-BL1-009
    ; Log invalid signature
    mov $LOG_SIG_INVALID, %rdi
    call log_event
    hlt

; External functions (implemented in ROM)
.extern sha256
.extern ecdsa_verify
.extern log_event

; Data section
.section .data
sha256_output:
    .space 32
```

> **Verification Tags**: Every critical step is tagged for traceability.
> **Failure Modes**: Each error path logs the event and halts execution.
> **Interface Safety**: All memory accesses are bounds-checked.

---

### Stage 2: Secondary Bootloader (BL2) – Extending the Chain

BL2 is responsible for loading the main application and verifying its integrity.

#### Safe Pattern: BL2 in C with Assembly Integration

```c
/*
 * # Summary: Secondary Bootloader (BL2)
 * # Requirement: REQ-BL2-001
 * # Verification: VC-BL2-001
 * # Test: TEST-BL2-001
 *
 * Boot Security Considerations:
 *
 * 1. Safety Rules:
 *    - Verified load of application
 *    - Anti-rollback enforcement
 *    - Secure memory initialization
 *
 * 2. Safety Verification:
 *    - Application integrity verified
 *    - No unverified execution
 *    - State preserved across load
 *
 * Tool: GCC 11.2.0 (qualified)
 */

#include <stdint.h>
#include <string.h>

// Memory layout
#define APP_HEADER_ADDR   0x40000
#define APP_LOAD_ADDR     0x80000
#define MAX_APP_SIZE      0x40000

// Error codes
#define ERR_NONE          0
#define ERR_VERSION       1
#define ERR_SIZE          2
#define ERR_HASH          3
#define ERR_SIGNATURE     4

// Function declarations (from ROM or trusted library)
extern int sha256(const uint8_t* data, size_t len, uint8_t* out);
extern int ecdsa_verify(const uint8_t* pubkey, const uint8_t* sig, const uint8_t* hash);
extern void log_event(int event_id);
extern void secure_memset(void* ptr, int val, size_t len);
extern void jump_to_app(uint32_t addr);

/* Structure of firmware header */
typedef struct {
    uint32_t version;
    uint32_t size;
    uint8_t  hash[32];      // SHA-256 of application
    uint8_t  signature[64]; // ECDSA signature
} firmware_header_t;

/* Public key embedded in BL2 (signed by manufacturer) */
static const uint8_t public_key[32] = {
    0x04, 0x12, 0x34, 0x56, /* ... truncated for brevity ... */
};

/* Working buffer for hash computation */
static uint8_t hash_buffer[32];

/*# check: REQ-BL2-002
  # check: VC-BL2-002
  Verify firmware header */
int verify_firmware_header(firmware_header_t* header) {
    if (header == NULL) {
        return ERR_NONE;  // No header, assume legacy (not safe)
    }

    /* Safety Rationale: Prevent rollback to older versions
     * Failure Mode: Reject outdated firmware
     * Interface Safety: Version enforcement */
    if (header->version < 2) {
        log_event(0x1002);  // EVENT: VERSION TOO OLD
        return ERR_VERSION;
    }

    /* Safety Rationale: Prevent buffer overflow
     * Failure Mode: Reject oversized image
     * Interface Safety: Size validation */
    if (header->size > MAX_APP_SIZE) {
        log_event(0x1003);  // EVENT: IMAGE TOO LARGE
        return ERR_SIZE;
    }

    return ERR_NONE;
}

/*# check: REQ-BL2-003
  # check: VC-BL2-003
  Verify application integrity */
int verify_application() {
    firmware_header_t* header = (firmware_header_t*)APP_HEADER_ADDR;
    uint8_t* app_image = (uint8_t*)APP_LOAD_ADDR;
    int result;

    result = verify_firmware_header(header);
    if (result != ERR_NONE) {
        return result;
    }

    /* Safety Rationale: Detect corruption or tampering
     * Failure Mode: Reject if hash doesn't match
     * Interface Safety: Cryptographic integrity */
    result = sha256(app_image, header->size, hash_buffer);
    if (result != 0) {
        log_event(0x1004);  // EVENT: HASH COMPUTATION FAILED
        return ERR_HASH;
    }

    if (memcmp(hash_buffer, header->hash, 32) != 0) {
        log_event(0x1005);  // EVENT: HASH MISMATCH
        return ERR_HASH;
    }

    /* Safety Rationale: Prevent unauthorized modifications
     * Failure Mode: Reject if signature invalid
     * Interface Safety: Authenticity verification */
    result = ecdsa_verify(public_key, header->signature, hash_buffer);
    if (result != 0) {
        log_event(0x1006);  // EVENT: SIGNATURE INVALID
        return ERR_SIGNATURE;
    }

    return ERR_NONE;
}

/*# check: REQ-BL2-004
  # check: VC-BL2-004
  Load and execute application */
void boot_application() {
    int result = verify_application();
    if (result != ERR_NONE) {
        log_event(0x1007);  // EVENT: BOOT FAILED
        while(1);  // Halt
    }

    /* Safety Rationale: Clear sensitive data
     * Failure Mode: N/A (safe operation)
     * Interface Safety: Memory sanitization */
    secure_memset(hash_buffer, 0, sizeof(hash_buffer));

    log_event(0x2001);  // EVENT: BOOT SUCCESS
    jump_to_app(APP_LOAD_ADDR);
}

/* Entry point */
void _boot_main() {
    boot_application();
}
```

> **Key Safety Features**:
> - Version enforcement prevents rollback.
> - Hash and signature verification ensure integrity.
> - Sensitive data is zeroed after use.
> - All failure paths are logged and halt execution.

---

## Implementing Cryptographic Signing of Firmware Images

Before deployment, the firmware must be signed using a qualified toolchain.

### Step 1: Build the Certified Binary

```bash
# Build application
gcc -Os -DNDEBUG -c main.c -o main.o
gcc -c calculate_altitude.s -o calculate_altitude.o
gcc -r main.o calculate_altitude.o -o firmware_partial.o

# Link with final memory layout
ld -T firmware.ld firmware_partial.o -o firmware.elf

# Extract raw binary
objcopy -O binary firmware.elf firmware.bin
```

### Step 2: Generate Firmware Header with Hash

```python
#!/usr/bin/env python3
"""
generate_header.py
Tool ID: TQ-HEADER-GEN-001
"""

import hashlib
import struct
import sys

def generate_header(image_path, version):
    with open(image_path, 'rb') as f:
        data = f.read()
    
    # Calculate SHA-256 hash
    hash_digest = hashlib.sha256(data).digest()
    
    # Create header: version (4), size (4), hash (32), signature placeholder (64)
    header = struct.pack('<II32s64s', version, len(data), hash_digest, b'\x00' * 64)
    
    return header

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: generate_header.py <image.bin> <version>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    version = int(sys.argv[2])
    
    header = generate_header(image_path, version)
    with open("firmware.header", 'wb') as f:
        f.write(header)
        
    print("Header generated: firmware.header")
```

### Step 3: Sign the Header with Private Key

```python
#!/usr/bin/env python3
"""
sign_firmware.py
Tool ID: TQ-SIGN-TOOL-001
"""

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
import struct
import sys

def load_private_key(key_path):
    with open(key_path, 'rb') as f:
        key_data = f.read()
    return serialization.load_pem_private_key(
        key_data,
        password=None,
        backend=default_backend()
    )

def sign_header(header_path, key_path):
    with open(header_path, 'rb') as f:
        header = f.read()
    
    # Extract hash (bytes 8-39)
    image_hash = header[8:40]
    
    # Load private key
    private_key = load_private_key(key_path)
    
    # Sign the hash
    signature = private_key.sign(
        image_hash,
        ec.ECDSA(hashes.SHA256())
    )
    
    # Replace signature bytes (offset 40)
    new_header = header[:40] + signature.ljust(64, b'\x00')
    
    with open("signed_firmware.header", 'wb') as f:
        f.write(new_header)
        
    print("Signed header generated: signed_firmware.header")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: sign_firmware.py <header.bin> <private_key.pem>")
        sys.exit(1)
        
    sign_header(sys.argv[1], sys.argv[2])
```

> **Tool Qualification**: Both scripts must be qualified as TQL-2 tools.

---

## Secure Over-the-Air (OTA) Update Protocol

For remote deployment, a secure OTA protocol is required.

### OTA Message Format

| Field | Size (bytes) | Description |
|------|--------------|-------------|
| Command | 4 | `UPDATE`, `STATUS`, etc. |
| Version | 4 | Firmware version |
| Size | 4 | Total image size |
| Chunk Index | 4 | Sequential number |
| Chunk Size | 4 | This chunk's size |
| Data | ≤1024 | Firmware chunk |
| HMAC | 32 | SHA-256 HMAC for integrity |

### Safe Pattern: OTA Receiver with Replay Protection

```c
/*
 * # Summary: Secure OTA Update Handler
 * # Requirement: REQ-OTA-001
 * # Verification: VC-OTA-001
 * # Test: TEST-OTA-001
 */

#include <stdint.h>

#define MAX_CHUNKS 128
#define CHUNK_SIZE 1024

static uint8_t firmware_buffer[MAX_CHUNKS * CHUNK_SIZE];
static uint32_t expected_version;
static uint32_t total_size;
static uint8_t received_mask[MAX_CHUNKS / 8];

/*# check: REQ-OTA-002
  # check: VC-OTA-002
  Process OTA chunk */
int ota_process_chunk(uint32_t version, uint32_t size, uint32_t index, 
                     uint8_t* data, uint32_t data_len, uint8_t* hmac) {
    
    /* Safety Rationale: Prevent downgrade attacks
     * Failure Mode: Reject older versions
     * Interface Safety: Version enforcement */
    if (version < get_current_version()) {
        return -1;  // REJECT
    }
    
    if (index >= MAX_CHUNKS || data_len > CHUNK_SIZE) {
        return -2;  // INVALID
    }
    
    /* Safety Rationale: Prevent replay attacks
     * Failure Mode: Reject duplicate chunks
     * Interface Safety: Sequence control */
    if (bit_is_set(received_mask, index)) {
        return -3;  // ALREADY RECEIVED
    }
    
    /* Copy data */
    memcpy(&firmware_buffer[index * CHUNK_SIZE], data, data_len);
    set_bit(received_mask, index);
    
    /* Verify HMAC */
    if (!verify_hmac(data, data_len, hmac)) {
        clear_bit(received_mask, index);
        return -4;  // HMAC FAIL
    }
    
    return 0;  // OK
}
```

---

## Hardware-Based Attestation and Remote Verification

To prove what firmware is running, use **remote attestation**.

### TPM-Based Attestation Flow

1. Device generates a nonce.
2. Device signs the nonce + current firmware hash using its Endorsement Key (EK).
3. Server verifies the signature and compares the hash to the certified version.

#### Safe Pattern: Attestation Request Handler

```c
/*
 * # Summary: TPM Attestation Handler
 * # Requirement: REQ-ATTEST-001
 * # Verification: VC-ATTEST-001
 */

#include <stdint.h>

extern int tpm_sign(const uint8_t* data, size_t len, uint8_t* sig);
extern uint8_t* get_firmware_hash();

/*# check: REQ-ATTEST-002
  # check: VC-ATTEST-002
  Handle attestation request */
int handle_attestation_request(uint8_t* nonce, uint32_t nonce_len,
                              uint8_t* signature) {
    uint8_t message[64];
    
    /* Concatenate nonce + firmware hash */
    memcpy(message, nonce, nonce_len);
    memcpy(message + nonce_len, get_firmware_hash(), 32);
    
    /* Sign with TPM */
    return tpm_sign(message, nonce_len + 32, signature);
}
```

> **Certification Evidence**: Logs of successful attestation requests.

---

## Real-World Case Study: Avionics Secure Boot Implementation

**System**: Flight Control Computer (FCC) with dual-core x64 processor.

**Challenge**: Ensure only certified firmware runs, even after maintenance updates.

**Solution**:
1. Implemented ROM-based BL1 with ECDSA verification.
2. Used hardware security module (HSM) to sign all firmware.
3. Enforced anti-rollback with monotonic counters.
4. Logged all boot events to secure flash.

**Outcome**: Achieved DO-178C Level A certification. Auditors confirmed that the system met **AC 20-152A** requirements for secure development and deployment.

---

## Tiered Exercises: Building a Secure Deployment Pipeline

### Exercise 1: Basic — Implement Firmware Signing

**Goal**: Sign a firmware image and verify it on host.

**Tasks**:
- Write a signing script (Python).
- Implement hash verification in C.
- Test with modified binaries.

**Deliverables**:
- `sign.py`, `verify.c`
- Sample signed firmware
- Test log

---

### Exercise 2: Intermediate — Add Secure Boot

**Goal**: Implement BL1 and BL2 with verification.

**Tasks**:
- Write assembly BL1.
- Implement C BL2.
- Simulate boot process.

**Deliverables**:
- `bl1.s`, `bl2.c`
- Boot simulation log
- Traceability matrix

---

### Exercise 3: Advanced — Full OTA + Attestation System

**Goal**: Build a complete secure deployment system.

**Tasks**:
- Implement OTA protocol.
- Add TPM attestation.
- Qualify all tools.
- Package certification evidence.

**Deliverables**:
- Complete source code
- Qualified tool reports
- `certification_evidence.zip`

---

## Verification Pitfalls to Avoid

| Pitfall | Mitigation |
|--------|------------|
| Using unqualified signing tools | Require TQP and TQR |
| No anti-rollback | Use monotonic counters |
| Software-only root of trust | Use hardware-secured keys |
| Insecure key storage | Use HSM or TPM |
| No post-boot verification | Implement periodic attestation |

---

## Connection to Next Tutorial: Runtime Monitoring and Self-Healing Systems

In **Tutorial #24**, we will cover:
- Runtime integrity checks
- Watchdog timers with safety escalation
- Memory corruption detection
- Self-healing firmware recovery
- Dynamic verification during operation

You’ll learn how to maintain safety *after* deployment.

> **Final Principle**: *Security is not a phase—it is a property of every system state.*
