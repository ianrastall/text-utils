# 14. Exception Handling and Interrupts in Assembly

## 14.1 Introduction to Exceptions and Interrupts

Exception handling and interrupts are foundational mechanisms that allow a processor to respond to asynchronous events and synchronous error conditions. While high-level languages often abstract these concepts behind try-catch blocks or signal handlers, assembly programmers must interact with them directly — configuring interrupt descriptor tables, writing interrupt service routines, and managing CPU state transitions.

This chapter is the fourteenth in a series on x86-64 assembly language programming. It assumes familiarity with registers, memory addressing, stack operations, and basic control flow. While safety-critical systems — such as avionics or medical devices — demand rigorous handling of exceptions and interrupts, this tutorial is designed for general-purpose programming. Whether you are writing an operating system kernel, a performance-critical driver, a real-time application, or simply seeking deeper insight into how your programs interact with hardware, this chapter provides the necessary tools and concepts.

Exceptions and interrupts are not merely error-handling mechanisms — they are the means by which the CPU delegates control to software in response to events both internal (e.g., division by zero) and external (e.g., keyboard press, timer tick). Mastering them is essential for any programmer working below the abstraction layer of modern operating systems.

> **“The CPU does not panic — it delegates. When something unexpected happens, it hands control to you. Your job is to handle it gracefully.”**  
> This principle underlies all exception and interrupt handling. The processor saves minimal state and jumps to a predefined location. What happens next is entirely your responsibility.

> **“Interrupts are the heartbeat of a real-time system; exceptions are its immune response.”**  
> While this analogy originates in embedded and safety-critical domains, it applies universally. Interrupts drive scheduling, I/O, and timing. Exceptions protect against invalid operations and enable debugging, recovery, and diagnostics.

By the end of this chapter, you will understand:

- The difference between exceptions, interrupts, and traps.
- How the x86-64 interrupt descriptor table (IDT) works.
- How to write and register interrupt service routines (ISRs).
- How to handle divide-by-zero, page faults, general protection faults, and more.
- How to interface with hardware interrupts via the APIC or PIC.
- How to return from interrupts and exceptions safely.
- How to chain or forward handlers in multi-layered systems (e.g., OS + application).
- How to use interrupts for high-resolution timing and inter-processor communication.

---

## 14.2 Types of Exceptions and Interrupts

Before writing handlers, we must classify the events that trigger them. The x86-64 architecture defines three broad categories: **exceptions**, **interrupts**, and **traps**. Though often used interchangeably in casual conversation, they differ in origin, timing, and handling semantics.

### 14.2.1 Exceptions

Exceptions are **synchronous** events triggered by the currently executing instruction. They occur as a direct result of program behavior — either erroneous or intentional.

Exceptions are further divided into:

- **Faults**: Reported before the instruction completes. The return address pushed onto the stack points to the faulting instruction, allowing re-execution after correction (e.g., page fault).
- **Traps**: Reported after the instruction completes. The return address points to the next instruction (e.g., `int3` breakpoint).
- **Aborts**: Severe, unrecoverable errors. The program state may be corrupted (e.g., machine check).

Common CPU exceptions include:

| **Exception**             | **Vector** | **Type** | **Description**                                  |
| :---                      | :---       | :---     | :---                                             |
| **Divide Error**          | 0          | Fault    | Division by zero or overflow.                    |
| **Debug Exception**       | 1          | Trap/Fault| Breakpoints, watchpoints, single-step.           |
| **Non-Maskable Interrupt**| 2          | Interrupt| System-wide critical event (e.g., hardware error).|
| **Breakpoint**            | 3          | Trap     | `int3` instruction.                              |
| **Overflow**              | 4          | Trap     | `into` instruction if overflow flag set.          |
| **Bound Range Exceeded**  | 5          | Fault    | `bound` instruction out of range.                |
| **Invalid Opcode**        | 6          | Fault    | Undefined or unsupported instruction.            |
| **Device Not Available**  | 7          | Fault    | Floating-point unit not available.               |
| **Double Fault**          | 8          | Abort    | Exception during exception handler.              |
| **Invalid TSS**           | 10         | Fault    | Task state segment invalid.                      |
| **Segment Not Present**   | 11         | Fault    | Segment in descriptor table marked not present.  |
| **Stack-Segment Fault**   | 12         | Fault    | Stack limit exceeded or invalid stack segment.   |
| **General Protection**    | 13         | Fault    | Privilege violation or segment limit exceeded.   |
| **Page Fault**            | 14         | Fault    | Invalid virtual memory access.                   |
| **Floating-Point Error**  | 16         | Fault    | x87 FPU error.                                   |
| **Alignment Check**       | 17         | Fault    | Unaligned memory access (if AC flag set).        |
| **Machine Check**         | 18         | Abort    | Hardware-detected CPU or bus error.              |

### 14.2.2 Interrupts

Interrupts are **asynchronous** events triggered by external hardware or software signals. They are not tied to the current instruction stream.

- **Maskable Interrupts**: Can be disabled via the interrupt flag (IF) in RFLAGS. Handled via vectors 32–255.
- **Non-Maskable Interrupts (NMI)**: Cannot be disabled. Vector 2. Used for critical system events.

Hardware interrupts originate from devices such as timers, keyboards, disks, and network cards. Software interrupts are generated via the `int n` instruction.

### 14.2.3 System Calls and Software Interrupts

While modern systems use `syscall`/`sysret` for system calls, legacy code and some kernels still use software interrupts (e.g., `int 0x80` on Linux). These are traps — synchronous, software-generated interrupts.

---

## 14.3 The Interrupt Descriptor Table (IDT)

The IDT is a data structure that tells the CPU where to jump when an exception or interrupt occurs. It is an array of 8-byte or 16-byte descriptors, each corresponding to a vector number (0–255).

### 14.3.1 IDT Entry Structure

In 64-bit mode, IDT entries are 16 bytes (128 bits). Each entry contains:

- Offset bits 0–15 (low)
- Selector (code segment)
- IST (Interrupt Stack Table) index and type fields
- Offset bits 16–31 (mid)
- Offset bits 32–63 (high)
- Reserved

The CPU uses the vector number as an index into the IDT. For example, divide error (vector 0) uses IDT[0], page fault (vector 14) uses IDT[14].

### 14.3.2 Setting Up the IDT

To use custom handlers, you must:

1. Define handler functions.
2. Create IDT entries pointing to them.
3. Load the IDT with the `lidt` instruction.

Example IDT setup in assembly:

```x86asm
section .data
    idt_start:
        times 256 dq 0   ; 256 entries, 16 bytes each = 4096 bytes
    idt_end:

    idtr:
        dw idt_end - idt_start - 1   ; limit
        dq idt_start                 ; base

section .text

; Load the IDT
load_idt:
    lidt [idtr]
    ret
```

Each entry must be initialized with a gate descriptor. We’ll define macros to simplify this.

```x86asm
%macro idt_gate 3
    ; %1 = handler address, %2 = selector, %3 = type
    dw %1 & 0xFFFF              ; offset low
    dw %2                       ; segment selector
    db 0                        ; IST (0 = use normal stack)
    db %3                       ; type and attributes
    dw (%1 >> 16) & 0xFFFF      ; offset mid
    dd (%1 >> 32)               ; offset high
    dd 0                        ; reserved
%endmacro

; Example: Set up divide error handler
setup_idt:
    lea rax, [divide_error_handler]
    mov word [idt_start + 0*16], ax           ; offset low
    mov word [idt_start + 0*16 + 6], ax       ; offset mid (bits 16-31)
    mov dword [idt_start + 0*16 + 8], eax     ; offset high (bits 32-63)
    mov word [idt_start + 0*16 + 2], 0x08     ; code selector (kernel CS)
    mov byte [idt_start + 0*16 + 4], 0        ; IST = 0
    mov byte [idt_start + 0*16 + 5], 0x8E     ; type: 32-bit interrupt gate, DPL=0
    ; Repeat for other vectors...
    call load_idt
    ret
```

The type byte `0x8E` means:

- Bit 7: Present (1)
- Bits 6–5: Descriptor privilege level (00 = kernel)
- Bits 4–0: Gate type (1110 = 64-bit interrupt gate)

### 14.3.3 Interrupt vs. Trap Gates

- **Interrupt gates** (`0x8E`) clear the interrupt flag (IF), disabling maskable interrupts during handler execution.
- **Trap gates** (`0x8F`) do not clear IF, allowing nested interrupts.

Use interrupt gates for most handlers to prevent reentrancy issues. Use trap gates only for debug or profiling handlers where nested interrupts are safe.

---

## 14.4 Writing Interrupt Service Routines (ISRs)

An ISR is a function invoked by the CPU when an interrupt or exception occurs. It must:

- Save volatile registers (if modifying them).
- Perform minimal work (defer heavy processing).
- Send EOI (End of Interrupt) to PIC/APIC if handling hardware interrupt.
- Restore registers and execute `iretq` to return.

### 14.4.1 Basic ISR Structure

```x86asm
; Divide error handler (vector 0)
divide_error_handler:
    ; Save registers
    push rax
    push rbx
    push rcx
    push rdx
    push rdi
    push rsi
    push rbp
    push r8
    push r9
    push r10
    push r11

    ; Handler code — e.g., print error, log, or terminate
    mov rdi, err_divide_msg
    call print_string

    ; Restore registers
    pop r11
    pop r10
    pop r9
    pop r8
    pop rbp
    pop rsi
    pop rdi
    pop rdx
    pop rcx
    pop rbx
    pop rax

    ; Return via iretq
    iretq

section .data
err_divide_msg db "Divide Error: Division by zero or overflow", 10, 0
```

Note: `iretq` pops RIP, CS, RFLAGS, RSP, and SS from the stack — in that order. The stack must be in this exact format.

### 14.4.2 Stack Layout on Entry

When an exception or interrupt occurs, the CPU pushes the following onto the stack:

- SS (if crossing privilege levels)
- RSP (if crossing privilege levels)
- RFLAGS
- CS
- RIP

For some exceptions (e.g., page fault, general protection), it also pushes an error code.

Example for page fault:

```x86asm
page_fault_handler:
    ; Stack: [RIP, CS, RFLAGS, RSP, SS, error_code] — if CPL changed
    ; Or:   [RIP, CS, RFLAGS, error_code] — if same CPL
    ; Save registers
    push rax
    push rbx
    ; ... etc

    ; Read CR2 to get faulting address
    mov rax, cr2
    mov [fault_addr], rax

    ; Print or log
    mov rdi, err_page_msg
    call print_string
    mov rdi, rax
    call print_hex

    ; If you want to recover, map the page and return
    ; Otherwise, terminate

    ; Clean up error code if present
    add rsp, 8

    ; Restore and return
    pop rbx
    pop rax
    iretq

section .data
fault_addr dq 0
err_page_msg db "Page Fault at address: 0x", 0
```

Always check whether an error code was pushed. Vectors that push error codes: 8, 10–14, 17.

---

## 14.5 Handling Specific Exceptions

Let’s examine handlers for common exceptions.

### 14.5.1 Divide Error (Vector 0)

Triggered by `div` or `idiv` when divisor is zero or quotient overflows.

```x86asm
divide_error_handler:
    push rbp
    mov rbp, rsp
    push rax
    push rbx
    push rdi
    push rsi

    mov rdi, msg_divide_error
    call kernel_print

    ; Optionally, dump registers or stack
    call dump_registers

    ; Terminate or recover
    call process_terminate

    ; Should not return, but if it does:
    pop rsi
    pop rdi
    pop rbx
    pop rax
    leave
    iretq

msg_divide_error db "Divide Error Exception", 10, 0
```

Recovery is rarely possible — usually, the program must be terminated or the thread aborted.

### 14.5.2 Page Fault (Vector 14)

Occurs when accessing unmapped or protected memory. Used by OSes to implement demand paging.

```x86asm
page_fault_handler:
    push rbp
    mov rbp, rsp
    push rax
    push rbx
    push rcx
    push rdx
    push rdi
    push rsi

    ; Read faulting address from CR2
    mov rax, cr2
    mov [current_fault_addr], rax

    ; Check error code (on stack)
    mov rbx, [rbp + 8]   ; error code above saved RBP
    ; Bit 0: 0 = not present, 1 = protection violation
    ; Bit 1: 0 = read, 1 = write
    ; Bit 2: 0 = user, 1 = supervisor
    ; Bit 3: 1 = reserved bit violation
    ; Bit 4: 1 = instruction fetch

    test bl, 1
    jnz .protection_violation

    ; Try to map the page
    mov rdi, rax         ; faulting address
    call vm_map_page
    test rax, rax
    jz .success

.protection_violation:
    mov rdi, msg_page_fault
    call kernel_print
    mov rdi, [current_fault_addr]
    call print_hex
    call newline
    call dump_registers
    call process_terminate

.success:
    pop rsi
    pop rdi
    pop rdx
    pop rcx
    pop rbx
    pop rax
    leave
    add rsp, 8           ; remove error code
    iretq

section .data
current_fault_addr dq 0
msg_page_fault db "Page Fault at: ", 0
```

### 14.5.3 General Protection Fault (Vector 13)

Indicates privilege violation, segment limit exceeded, or invalid descriptor.

```x86asm
gpf_handler:
    push rbp
    mov rbp, rsp
    push rax
    push rdi

    mov rdi, msg_gpf
    call kernel_print

    ; Error code contains segment selector index
    movzx rax, word [rbp + 8]
    call print_hex
    call newline

    call dump_registers
    call process_terminate

    pop rdi
    pop rax
    leave
    add rsp, 8
    iretq

msg_gpf db "General Protection Fault, error code: ", 0
```

---

## 14.6 Hardware Interrupts and the Programmable Interrupt Controller (PIC)

Hardware interrupts are delivered via external devices. On legacy systems, the 8259A PIC routes IRQs to CPU interrupts. Modern systems use the APIC (Advanced Programmable Interrupt Controller).

### 14.6.1 Legacy PIC Setup

The PIC maps IRQ0–IRQ15 to interrupt vectors 32–47 by default. You must remap it to avoid conflict with CPU exceptions (0–31).

```x86asm
; Remap PIC to vectors 32-47
remap_pic:
    ; ICW1 - begin initialization
    mov al, 0x11
    out 0x20, al        ; Master PIC
    out 0xA0, al        ; Slave PIC

    ; ICW2 - remap offset
    mov al, 32          ; Master offset = 32
    out 0x21, al
    mov al, 40          ; Slave offset = 40
    out 0xA1, al

    ; ICW3 - master/slave relation
    mov al, 4           ; Slave at IRQ2
    out 0x21, al
    mov al, 2           ; Slave ID = 2
    out 0xA1, al

    ; ICW4 - environment info
    mov al, 0x01        ; 8086 mode
    out 0x21, al
    out 0xA1, al

    ; Mask all interrupts initially
    mov al, 0xFF
    out 0x21, al
    out 0xA1, al
    ret
```

### 14.6.2 Handling Timer Interrupt (IRQ0)

The timer (PIT) fires approximately 100–1000 times per second.

```x86asm
timer_handler:
    push rax
    push rdx

    ; Send EOI to PIC
    mov al, 0x20
    out 0x20, al        ; Master PIC EOI

    ; Increment tick counter
    inc qword [tick_count]

    ; Optionally, call scheduler
    call schedule_if_needed

    pop rdx
    pop rax
    iretq

section .data
tick_count dq 0
```

### 14.6.3 Enabling Specific IRQs

Unmask IRQs by clearing bits in the PIC mask register.

```x86asm
enable_irq:
    ; RDI = IRQ number (0-15)
    push rax
    push rbx

    mov rbx, rdi
    cmp rbx, 8
    jl .master
    ; Slave IRQ
    sub rbx, 8
    mov al, 0xFF
    in al, 0xA1         ; read slave mask
    btr ax, bx          ; clear bit
    out 0xA1, al
    jmp .done
.master:
    mov al, 0xFF
    in al, 0x21         ; read master mask
    btr ax, bx
    out 0x21, al
.done:
    pop rbx
    pop rax
    ret
```

---

## 14.7 Advanced Programmable Interrupt Controller (APIC)

Modern x86-64 systems use the APIC for multi-core interrupt routing, timer interrupts, and inter-processor interrupts (IPIs).

### 14.7.1 Detecting and Initializing APIC

Check CPUID for APIC support, then enable in IA32_APIC_BASE MSR.

```x86asm
init_apic:
    ; Check CPUID
    mov eax, 1
    cpuid
    bt edx, 9           ; APIC on-chip?
    jnc .no_apic

    ; Enable APIC
    mov ecx, 0x1B       ; IA32_APIC_BASE MSR
    rdmsr
    or ah, 0x80         ; Set enable bit (bit 11)
    wrmsr

    ; Set Spurious Interrupt Vector (SVR)
    mov eax, 0x000000FF ; Enable APIC, spurious vector 0xFF
    mov edx, 0
    mov ecx, 0x80F      ; SVR register
    wrmsr

    ret
.no_apic:
    ; Fall back to PIC or halt
    hlt
```

### 14.7.2 Local APIC Timer

The local APIC timer is per-core and more precise than PIT.

```x86asm
setup_apic_timer:
    ; Set initial count
    mov eax, 0x00FFFFFF ; 16 million ticks
    mov ecx, 0x82F      ; Initial Count register
    wrmsr

    ; Set divide config (divide by 16)
    mov eax, 0x00000003
    mov ecx, 0x82D      ; Divide Configuration
    wrmsr

    ; Set LVT Timer (vector 32, periodic)
    mov eax, 32 | (1<<17) ; vector 32, periodic
    mov ecx, 0x82E      ; LVT Timer
    wrmsr
    ret
```

### 14.7.3 Inter-Processor Interrupts (IPIs)

IPIs allow one core to interrupt another — essential for scheduling, TLB shootdowns, and synchronization.

```x86asm
send_ipi:
    ; RDI = destination core (APIC ID)
    ; RSI = vector
    push rax
    push rbx

    ; Write to Interrupt Command Register (ICR)
    mov eax, esi        ; vector
    mov edx, edi        ; destination APIC ID
    shl edx, 24
    or edx, 0x000C4000  ; fixed delivery, assert, trigger mode

    mov ecx, 0x830      ; ICR Low
    xchg eax, edx
    wrmsr               ; write high then low

    pop rbx
    pop rax
    ret
```

---

## 14.8 Returning from Interrupts and Exceptions

The `iretq` instruction is used to return from all interrupts and exceptions. It restores:

- RIP
- CS
- RFLAGS
- RSP
- SS

If the exception occurred in user mode and the handler runs in kernel mode, `iretq` automatically switches stacks and privilege levels.

### 14.8.1 Stack Switching and Privilege Levels

When an interrupt or exception crosses from user (CPL=3) to kernel (CPL=0), the CPU:

- Loads SS and RSP from the Task State Segment (TSS).
- Pushes user SS, user RSP, RFLAGS, CS, RIP.
- Optionally pushes error code.

Your TSS must be properly configured.

```x86asm
section .data
    tss:
        .reserved1 dq 0
        .rsp0 dq stack_top   ; kernel stack for CPL=0
        .rsp1 dq 0
        .rsp2 dq 0
        .reserved2 dq 0
        .ist1 dq 0
        .ist2 dq 0
        .ist3 dq 0
        .ist4 dq 0
        .ist5 dq 0
        .ist6 dq 0
        .ist7 dq 0
        .reserved3 dq 0
        .iomap_offset dw 0
        .s0 db 0, 0

    tss_descriptor:
        dw tss_end - tss - 1
        dw tss & 0xFFFF
        db (tss >> 16) & 0xFF
        db 0x89             ; type = 32-bit TSS, present
        db 0x60             ; limit high + granularity
        db (tss >> 24) & 0xFF
        dq tss >> 32
        dq 0
    tss_end:

section .text
load_tss:
    mov ax, 0x28        ; TSS segment selector
    ltr ax
    ret
```

### 14.8.2 Interrupt Stack Table (IST)

For critical exceptions (e.g., double fault, NMI), the CPU can switch to a known-good stack via IST. Configure in TSS and IDT entry.

```x86asm
; In TSS, set ist1 to point to safe stack
mov qword [tss.ist1], safe_stack_top

; In IDT entry for double fault, set IST index to 1
mov byte [idt_start + 8*16 + 4], 1   ; IST=1
```

---

## 14.9 Debugging and Recovery Strategies

Exceptions are not just for crashing — they can be used for debugging, profiling, and even recovery.

### 14.9.1 Breakpoints and Single-Stepping

The debug exception (vector 1) is triggered by:

- `int3` instruction (0xCC)
- Hardware breakpoints (DR0–DR3)
- Single-step (TF flag in RFLAGS)

```x86asm
breakpoint_handler:
    push rax
    push rdi

    mov rdi, msg_breakpoint
    call kernel_print

    ; Optionally, invoke debugger
    call debugger_shell

    ; Clear TF if single-stepping
    pushfq
    pop rax
    and rax, ~0x100     ; clear TF
    push rax
    popfq

    pop rdi
    pop rax
    iretq

msg_breakpoint db "Breakpoint hit", 10, 0
```

### 14.9.2 Recovering from Page Faults

As shown earlier, page faults can be recovered by mapping the missing page.

```x86asm
recoverable_page_fault:
    mov rax, cr2        ; faulting address
    and rax, ~0xFFF     ; page align
    call allocate_frame
    test rax, rax
    jz .oom

    call map_page
    jmp .return

.oom:
    ; Out of memory — kill process
    call process_kill

.return:
    add rsp, 8          ; pop error code
    iretq
```

### 14.9.3 Double Fault and Triple Fault

A double fault (vector 8) occurs when an exception happens during another exception handler. Often caused by stack overflow or invalid IDT.

```x86asm
double_fault_handler:
    ; Use IST stack — must be preconfigured
    mov rdi, msg_double_fault
    call kernel_print
    call dump_registers
    ; Attempt to log to disk or serial
    call panic_log
    ; Halt or reboot
    cli
    hlt

msg_double_fault db "Double Fault — System Halted", 10, 0
```

If a double fault handler itself faults, a triple fault occurs — causing CPU reset.

---

## 14.10 System Calls via Software Interrupts

Though `syscall` is preferred, `int 0x80` (Linux) or `int 0x2E` (Windows) are still used.

```x86asm
; Linux system call via int 0x80
; RAX = syscall number, RDI, RSI, RDX, R10, R8, R9 = args
sys_write:
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, msg
    mov rdx, len
    int 0x80
    ret

section .data
msg db "Hello via interrupt", 10
len equ $ - msg
```

Handler in kernel:

```x86asm
syscall_handler:
    ; Save user state
    push rbp
    mov rbp, rsp

    ; Dispatch based on RAX
    mov rax, [rbp + 16] ; syscall number (above CS, RIP, RFLAGS)
    cmp rax, 1
    je .sys_write

    ; ...

.sys_write:
    ; Extract args from user stack or registers
    mov rdi, [rbp + 24] ; RDI saved by CPU
    mov rsi, [rbp + 32] ; RSI
    mov rdx, [rbp + 40] ; RDX
    call sys_write_impl

    ; Return value in RAX
    mov [rbp + 16], rax

    leave
    iretq
```

---

## 14.11 Performance and Optimization Considerations

Interrupt handling must be fast. Delays cause missed events, audio glitches, network packet loss, or scheduling jitter.

### 14.11.1 Minimize Handler Work

- Acknowledge interrupt (send EOI) immediately.
- Defer processing to a bottom half or thread.
- Use lock-free queues to pass data to deferred handlers.

### 14.11.2 Avoid Floating-Point in Handlers

Floating-point state is not saved by default. If you must use it, save and restore manually.

```x86asm
handler_with_fp:
    sub rsp, 512
    fxsave [rsp]        ; save FP state

    ; ... FP operations ...

    fxrstor [rsp]
    add rsp, 512
    iretq
```

### 14.11.3 Use Per-Core Data

Avoid locking by using per-core counters, buffers, and state.

```x86asm
; Each core has its own tick counter
tick_counters:
    dq 0, 0, 0, 0, 0, 0, 0, 0   ; up to 8 cores

timer_handler:
    ; Get core ID (via CPUID or APIC)
    mov eax, 1
    cpuid
    shr ebx, 24         ; APIC ID in bits 31-24 of EBX
    and ebx, 7

    ; Increment per-core counter
    inc qword [tick_counters + rbx*8]

    mov al, 0x20
    out 0x20, al
    iretq
```

---

## 14.12 Exception and Interrupt Handling in User Space

Applications can handle some exceptions via signal handlers (Unix) or structured exception handling (Windows).

### 14.12.1 Signal Handlers in Linux

Install handler for SIGFPE (divide error) or SIGSEGV (segmentation fault).

```x86asm
extern signal
extern printf

section .data
    fmt db "Caught signal %d", 10, 0
    sigfpe_handler dq handler_fpe

section .text
global _start
_start:
    ; Install handler
    mov rdi, 8          ; SIGFPE
    mov rsi, handler_fpe
    call signal

    ; Cause divide error
    xor rdx, rdx
    mov rax, 1
    mov rbx, 0
    div rbx             ; should trigger SIGFPE

    ; Exit
    mov rax, 60
    mov rdi, 0
    syscall

handler_fpe:
    ; RDI = signal number
    push rdi
    mov rdi, fmt
    pop rsi
    xor rax, rax
    call printf
    ; Exit or longjmp
    mov rax, 60
    mov rdi, 1
    syscall
```

### 14.12.2 Structured Exception Handling (SEH) on Windows

SEH uses `__try`/`__except` in C, but can be implemented manually in assembly via `fs:[0]` (SEH chain).

---

## 14.13 Summary and Best Practices

### 14.13.1 Key Takeaways

- Exceptions are synchronous; interrupts are asynchronous.
- The IDT maps vectors to handler addresses.
- ISRs must save registers, perform minimal work, and return via `iretq`.
- Hardware interrupts require EOI to PIC/APIC.
- Page faults can be recovered; double faults usually cannot.
- Use IST for critical exception stacks.
- Keep handlers fast — defer heavy work.
- Test extensively — concurrency and timing make bugs hard to reproduce.

### 14.13.2 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Minimize Handler Latency**  | Acknowledge interrupts immediately; defer processing.                           |
| **Use IST for Critical Faults**| Configure separate stacks for double fault, NMI.                                |
| **Save All Volatile Registers**| Even if you don’t use them — calling conventions may be violated otherwise.     |
| **Send EOI Promptly**         | For PIC/APIC, failing to send EOI disables further interrupts.                  |
| **Avoid Floating-Point**      | Unless you explicitly save/restore state with `fxsave`/`fxrstor`.               |
| **Validate Error Codes**      | For exceptions that push them (e.g., page fault, GPF).                          |
| **Test Under Load**           | Race conditions and stack overflows appear only under stress.                   |
| **Log and Dump State**        | On fatal exceptions, dump registers and stack for post-mortem analysis.         |

> **“An unhandled exception is not a failure of the program — it is a failure of the programmer.”**  
> Every exception vector must have a handler. Even if that handler only prints an error and halts, it must exist. Silence is not golden — it is catastrophic.

> **“Interrupts are like guests: welcome them politely, serve them quickly, and see them out promptly.”**  
> A slow interrupt handler is worse than no handler — it degrades system responsiveness and can cascade into system failure.

---

## 14.14 Exercises

1. Write a divide-by-zero handler that prints the faulting instruction address and terminates the process.
2. Implement a page fault handler that maps a zero-filled page on demand (simplified demand paging).
3. Set up the PIC and write a timer interrupt handler that counts ticks and prints every 100th tick.
4. Configure the APIC timer and replace the PIT timer handler.
5. Write an ISR that uses the IST mechanism — configure TSS and IDT entry.
6. Create a user-space signal handler for SIGSEGV that prints the faulting address (from `siginfo_t`).
7. Implement a double fault handler that attempts to log state to a serial port before halting.
8. Write a system call dispatcher using `int 0x80` that supports `sys_write`, `sys_exit`, and `sys_getpid`.
9. Use hardware breakpoints (DR0–DR3) to trigger a debug exception when a specific memory address is written.
10. Build a minimal kernel that handles keyboard interrupts (IRQ1) and echoes characters to the screen.

---

## 14.15 Further Reading

- Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volumes 3A and 3B.
- “Operating Systems: Three Easy Pieces” by Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau.
- OSDev Wiki (https://wiki.osdev.org) — Interrupts, PIC, APIC, IDT.
- Linux source code — `arch/x86/kernel/irq.c`, `entry_64.S`.
- “Protected Mode Software Architecture” by Tom Shanley.
