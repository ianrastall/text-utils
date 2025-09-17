# 13. Multi-Core and Concurrency in Assembly

## 13.1 Introduction to Multi-Core Systems and Concurrency

Modern computing systems are defined not by raw clock speed, but by parallelism. The era of single-core performance scaling ended in the mid-2000s. Since then, hardware manufacturers have focused on integrating multiple processing units — cores — onto a single die. This architectural shift demands that software, even at the lowest levels, be designed with concurrency in mind. Assembly language programmers, often perceived as working in isolation on single-threaded optimizations, must now understand how their code behaves in multi-core environments.

Concurrency in assembly is not merely about launching multiple threads; it is about managing shared state, avoiding race conditions, ensuring memory consistency, and leveraging hardware primitives for synchronization. Unlike high-level languages that abstract these concerns behind libraries and runtime systems, assembly programmers interact directly with the CPU’s concurrency mechanisms: atomic instructions, memory barriers, cache coherency protocols, and inter-processor interrupts.

This chapter is not limited to safety-critical systems, though such systems benefit immensely from precise control over concurrency. Instead, we address the general case: how any assembly programmer — whether optimizing game engines, writing device drivers, or building embedded firmware — can harness multi-core architectures effectively and safely.

> **“Concurrency is not parallelism. Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once.”** — Rob Pike  
> While this quote originates from high-level language design, it applies equally to assembly. Concurrency in assembly is the orchestration of multiple execution contexts — whether truly parallel on separate cores or interleaved via time-slicing — and requires explicit management of shared resources.

The goals of this chapter are:

- To explain the hardware foundations of multi-core execution.
- To demonstrate how to write assembly code that safely shares data between cores.
- To introduce synchronization primitives available at the instruction level.
- To show how to avoid common pitfalls: data races, deadlocks, false sharing, and memory reordering.
- To provide practical examples of concurrent assembly routines that scale across cores.

By the end of this chapter, you will be able to write assembly programs that not only run on multi-core systems but are optimized for them — maximizing throughput while preserving correctness.

---

## 13.2 Hardware Foundations of Multi-Core Execution

Before writing concurrent assembly code, one must understand the hardware that executes it. Modern multi-core CPUs are not simply multiple independent processors glued together. They share resources — caches, memory controllers, system buses — and coordinate through complex protocols to maintain a coherent view of memory.

### 13.2.1 Core Topology and Cache Hierarchy

A typical multi-core x86-64 processor contains:

- Multiple physical cores, each capable of independent instruction execution.
- Each core has private L1 instruction and data caches.
- L2 cache may be per-core or shared among a small group of cores (e.g., per CCX in AMD Zen, or per core cluster in Intel).
- L3 cache is typically shared across all cores on the die.
- Memory controller and system interconnect (e.g., Intel’s Ring or Mesh, AMD’s Infinity Fabric) route memory requests between cores and DRAM.

This hierarchy has profound implications for performance and correctness. Data written by one core may not be immediately visible to another due to caching. The hardware implements cache coherency protocols (typically MESI or MOESI variants) to ensure that all cores eventually see a consistent view of memory — but “eventually” is not sufficient for correct concurrent programs.

### 13.2.2 Memory Ordering and the Memory Model

x86-64 provides a relatively strong memory ordering model compared to other architectures like ARM or RISC-V. However, it is not sequentially consistent. The processor may reorder certain memory operations for performance, as long as the reordering is not observable from the perspective of a single thread.

The key rules of x86-64 memory ordering are:

- Loads are not reordered with other loads.
- Stores are not reordered with other stores.
- Stores are not reordered with older loads.
- Loads may be reordered with older stores to different locations.
- Intra-processor forwarding allows a load to obtain data from a store buffer before it becomes globally visible.
- Locked instructions (e.g., `lock add`, `xchg`) have full memory barrier semantics.
- Explicit memory barriers (`mfence`, `lfence`, `sfence`) can enforce ordering.

This means that without explicit synchronization, one core may observe memory writes from another core in an order different from the program order.

> **“The hardware will do what it must for performance — it is your responsibility to constrain it for correctness.”**  
> This mantra should guide every assembly programmer writing concurrent code. Assume nothing about memory visibility or ordering unless you enforce it with barriers or atomic operations.

### 13.2.3 Inter-Core Communication Mechanisms

Cores communicate via shared memory, but also through explicit signaling mechanisms:

- **Inter-Processor Interrupts (IPIs)**: One core can send an interrupt to another, typically used by operating systems for scheduling or TLB shootdowns.
- **Wait instructions**: `pause` (for spin-wait loops), `monitor`/`mwait` (for power-efficient waiting on memory addresses).
- **Atomic Read-Modify-Write (RMW) instructions**: `lock xadd`, `lock cmpxchg`, etc., which perform operations atomically across cores.
- **Memory barriers**: Ensure ordering of memory operations between cores.

These mechanisms form the building blocks for higher-level synchronization constructs like mutexes, semaphores, and condition variables — even when implemented in assembly.

---

## 13.3 Atomic Operations and Synchronization Primitives

At the heart of concurrent assembly programming are atomic operations — instructions that perform read-modify-write sequences that cannot be interrupted or interleaved by other cores.

### 13.3.1 The `lock` Prefix

The `lock` prefix in x86-64 ensures that the following instruction executes atomically with respect to all other cores. It asserts a bus lock (on older systems) or uses cache coherency mechanisms (on modern systems) to prevent other cores from accessing the target memory location until the operation completes.

Supported instructions include:

- `add`, `or`, `and`, `xor`, `sub`, `inc`, `dec`, `neg`, `not`
- `xchg`
- `cmpxchg`, `cmpxchg8b`, `cmpxchg16b`
- `xadd`

Example: Atomic increment of a shared counter.

```x86asm
section .data
    counter dq 0

section .text
global atomic_increment
atomic_increment:
    lock inc qword [counter]
    ret
```

This guarantees that even if multiple cores call `atomic_increment` simultaneously, each increment will be applied exactly once, with no lost updates.

### 13.3.2 Compare-and-Swap (CAS)

The `cmpxchg` instruction is the foundation of lock-free programming. It compares the value in a register with a memory location; if they are equal, it replaces the memory location with a new value. Otherwise, it loads the actual memory value into the register.

```x86asm
; Attempt to atomically set *ptr to new_val if it equals old_val
; Inputs: RDI = ptr, RSI = old_val, RDX = new_val
; Output: RAX = actual value read, ZF set if successful
atomic_cas:
    mov rax, rsi          ; expected value
    lock cmpxchg [rdi], rdx
    ret
```

This can be used to implement mutexes, reference counting, lock-free queues, and more.

### 13.3.3 Memory Barriers

Even with atomic operations, memory reordering can break correctness. Consider two threads initializing a structure and then setting a flag:

```x86asm
; Thread 1
mov [data], 42
mov [ready], 1

; Thread 2
wait_for_ready:
    cmp [ready], 0
    je wait_for_ready
    mov rax, [data]   ; May read 0, not 42!
```

Due to store buffering, Thread 2 might see `ready=1` before `data=42` becomes visible. To fix this, insert a store barrier:

```x86asm
; Thread 1
mov [data], 42
sfence                ; Ensure data is globally visible before setting ready
mov [ready], 1
```

Similarly, Thread 2 should use a load barrier if it needs to ensure subsequent loads are not speculated ahead:

```x86asm
; Thread 2
wait_for_ready:
    cmp [ready], 0
    je wait_for_ready
    lfence            ; Prevent speculative loads before this point
    mov rax, [data]
```

For full bidirectional barrier, use `mfence`.

---

## 13.4 Implementing Mutexes and Spinlocks in Assembly

While high-level languages provide mutexes via OS or library calls, understanding how to build them from scratch in assembly reveals the underlying mechanics.

### 13.4.1 Simple Spinlock Using `xchg`

A spinlock is a lock that causes a thread to wait in a loop (“spin”) until the lock becomes available.

```x86asm
section .data
    spinlock dq 0      ; 0 = unlocked, 1 = locked

section .text

; Acquire spinlock
spinlock_acquire:
.try_again:
    mov rax, 1
    xchg rax, [spinlock]   ; Atomically swap 1 into spinlock, old value in rax
    test rax, rax          ; Was it 0 (unlocked)?
    jnz .try_again         ; If not, retry
    ret

; Release spinlock
spinlock_release:
    mov qword [spinlock], 0
    ret
```

This works, but wastes CPU cycles while spinning. We can improve it with the `pause` instruction, which hints to the CPU that this is a spin-wait loop, reducing power consumption and improving performance on hyperthreaded cores.

```x86asm
spinlock_acquire:
.try_again:
    mov rax, 1
    xchg rax, [spinlock]
    test rax, rax
    jz .acquired
    pause              ; Hint: spinning
    jmp .try_again
.acquired:
    ret
```

### 13.4.2 Ticket Lock for Fairness

Simple spinlocks can be unfair — a core may starve if others continually acquire the lock. A ticket lock ensures FIFO ordering.

```x86asm
section .data
    ticket_lock:
        .next_ticket dq 0   ; Next ticket to be assigned
        .now_serving dq 0   ; Ticket currently being served

spinlock_acquire_ticket:
    ; Atomically fetch and increment next_ticket
    mov rax, 1
    lock xadd [ticket_lock.next_ticket], rax
    ; RAX now contains our ticket number
.wait:
    cmp rax, [ticket_lock.now_serving]
    je .acquired
    pause
    jmp .wait
.acquired:
    ret

spinlock_release_ticket:
    lock inc qword [ticket_lock.now_serving]
    ret
```

Each thread gets a sequentially increasing ticket number. Only the thread whose ticket matches `now_serving` may proceed. This prevents starvation and improves fairness under contention.

---

## 13.5 Memory Consistency and Cache Coherency

Understanding cache coherency is essential for writing correct concurrent assembly code. The MESI protocol (Modified, Exclusive, Shared, Invalid) governs how caches maintain consistency.

### 13.5.1 MESI Protocol States

Each cache line in a core’s cache can be in one of four states:

| **State**     | **Description**                                                                 |
| :---          | :---                                                                            |
| **Modified**  | The cache line is dirty (modified) and only exists in this core’s cache.        |
| **Exclusive** | The cache line is clean and only exists in this core’s cache.                   |
| **Shared**    | The cache line is clean and may exist in other cores’ caches.                   |
| **Invalid**   | The cache line is invalid and must be fetched from memory or another cache.     |

When a core writes to a cache line in Shared state, it must first invalidate all other copies (RFO — Read For Ownership). This causes cache coherency traffic and can degrade performance if multiple cores frequently write to nearby memory locations — a phenomenon known as **false sharing**.

### 13.5.2 False Sharing and Padding

False sharing occurs when two unrelated variables, used by different cores, reside on the same cache line. Writes to one variable invalidate the entire cache line, forcing the other core to reload it — even though the variables are logically independent.

Example:

```x86asm
section .data
    ; BAD: These may share a cache line
    counter1 dq 0
    counter2 dq 0
```

If Core 0 increments `counter1` and Core 1 increments `counter2`, each increment invalidates the other’s cache line, causing unnecessary coherency traffic.

Solution: Pad to separate cache lines (typically 64 bytes).

```x86asm
section .data
    counter1 dq 0
    times 7 dq 0    ; Pad to 64 bytes (8 * 8)
    counter2 dq 0
```

Or use alignment directives:

```x86asm
align 64
counter1 dq 0
align 64
counter2 dq 0
```

### 13.5.3 Performance Implications

Cache misses due to coherency can be orders of magnitude slower than L1 hits. Tools like `perf` (Linux) or VTune (Intel) can measure cache coherency traffic and help identify false sharing.

> **“The cost of a cache miss is not measured in cycles — it is measured in lost opportunities for parallelism.”**  
> When one core stalls waiting for a cache line, it cannot perform useful work. In highly concurrent programs, this can serialize execution and destroy scalability.

---

## 13.6 Advanced Synchronization: Semaphores, Barriers, and Lock-Free Queues

Beyond mutexes, assembly programmers may need to implement more sophisticated synchronization primitives.

### 13.6.1 Binary Semaphore

A binary semaphore is similar to a mutex but can be released by a different thread. We can build it using `cmpxchg`.

```x86asm
section .data
    semaphore dq 1      ; 1 = available, 0 = taken

semaphore_wait:
.try:
    mov rax, 1
    mov rbx, 0
    lock cmpxchg [semaphore], rbx
    jnz .acquired
    pause
    jmp .try
.acquired:
    ret

semaphore_signal:
    mov qword [semaphore], 1
    ret
```

### 13.6.2 Counting Semaphore

A counting semaphore allows up to N concurrent acquirers.

```x86asm
section .data
    count_sem:
        .count dq 3     ; Allow 3 concurrent entries
        .mutex dq 0     ; Internal spinlock for atomic update

count_sem_wait:
    ; Acquire internal mutex
    call spinlock_acquire   ; Assume spinlock_acquire uses [count_sem.mutex]
    dec qword [count_sem.count]
    js .block
    call spinlock_release
    ret
.block:
    ; Undo decrement and block
    inc qword [count_sem.count]
    call spinlock_release
    ; In real code, you'd yield or wait on a condition variable.
    ; For simplicity, we spin.
    pause
    jmp count_sem_wait

count_sem_signal:
    call spinlock_acquire
    inc qword [count_sem.count]
    call spinlock_release
    ret
```

### 13.6.3 Thread Barrier

A barrier ensures that all threads reach a certain point before any proceed.

```x86asm
section .data
    barrier:
        .total_threads dq 4
        .arrived dq 0
        .generation dq 0

barrier_wait:
    push rax
    push rbx
    push rcx
    push rdx

    ; Atomically increment arrived count
    mov rax, 1
    lock xadd [barrier.arrived], rax
    inc rax             ; rax = our arrival number (1-indexed)

    ; Check if we're the last to arrive
    cmp rax, [barrier.total_threads]
    jl .wait

    ; Last thread: reset counter and increment generation
    mov qword [barrier.arrived], 0
    lock inc qword [barrier.generation]
    jmp .exit

.wait:
    mov rbx, [barrier.generation]
.wait_loop:
    cmp rbx, [barrier.generation]
    je .wait_loop
    ; Generation changed — barrier lifted

.exit:
    pop rdx
    pop rcx
    pop rbx
    pop rax
    ret
```

Each thread increments the arrival count. The last thread resets the counter and increments the generation number. Other threads wait for the generation to change.

### 13.6.4 Lock-Free Queue (Single Producer, Single Consumer)

A lock-free queue avoids mutexes entirely, using atomic operations for synchronization.

```x86asm
; Simple ring buffer, size must be power of 2
section .data
    queue:
        .buffer times 16 dq 0   ; 16 elements
        .mask   dq 15           ; size - 1
        .head   dq 0            ; producer writes here
        .tail   dq 0            ; consumer reads here

; Producer: enqueue value in RDI
queue_enqueue:
    mov rax, [queue.head]
.loop:
    mov rbx, rax
    mov rcx, [queue.tail]
    lea rdx, [rbx + 1]
    and rdx, [queue.mask]       ; wrap around
    cmp rdx, rcx                ; full if next head == tail
    je .loop                    ; spin if full (or handle overflow)
    lock cmpxchg [queue.head], rdx
    jnz .loop
    ; Store value
    shl rbx, 3                  ; index * 8
    mov [queue.buffer + rbx], rdi
    ret

; Consumer: dequeue into RAX
queue_dequeue:
    mov rax, [queue.tail]
.loop:
    mov rbx, rax
    mov rcx, [queue.head]
    cmp rbx, rcx                ; empty if tail == head
    je .loop                    ; spin if empty
    lea rdx, [rbx + 1]
    and rdx, [queue.mask]
    lock cmpxchg [queue.tail], rdx
    jnz .loop
    ; Load value
    shl rbx, 3
    mov rax, [queue.buffer + rbx]
    ret
```

This implementation is lock-free and wait-free for single producer/consumer. For multiple producers or consumers, additional atomic operations or CAS loops are needed.

---

## 13.7 Practical Examples and Benchmarks

Let’s examine real-world scenarios where multi-core assembly programming matters.

### 13.7.1 Parallel Summation

Sum an array using multiple cores. Each core sums a portion, then results are combined.

```x86asm
; Assume 4 cores, array of 1M 64-bit integers
section .data
    array times 1000000 dq 0
    partial_sums dq 0, 0, 0, 0
    num_cores dq 4
    array_size dq 1000000

; Core ID passed in RDI (0-3), returns partial sum in RAX
parallel_sum_worker:
    push rbx
    push rcx
    push rdx
    push rsi

    ; Calculate start and end indices
    mov rax, [array_size]
    cqo
    idiv qword [num_cores]      ; RAX = chunk size
    mov rbx, rax                ; chunk_size
    mov rcx, rdi                ; core_id
    mul rcx                     ; RAX = start index
    mov rsi, rax                ; start
    add rax, rbx                ; end
    cmp rax, [array_size]       ; don't exceed array
    cmovg rax, [array_size]
    mov rdx, rax                ; end

    ; Sum elements from start to end
    xor rax, rax                ; sum = 0
    shl rsi, 3                  ; start * 8
    shl rdx, 3                  ; end * 8
    add rsi, array              ; start address
    add rdx, array              ; end address
.loop:
    cmp rsi, rdx
    jge .done
    add rax, [rsi]
    add rsi, 8
    jmp .loop
.done:
    ; Store partial sum
    shl rcx, 3                  ; core_id * 8
    mov [partial_sums + rcx], rax

    pop rsi
    pop rdx
    pop rcx
    pop rbx
    ret
```

The main thread would launch four worker threads (via OS or threading library), wait for them to finish, then sum the `partial_sums`.

### 13.7.2 Producer-Consumer Pipeline

One core produces data, another consumes it, using a lock-free queue.

```x86asm
; Core 0: Producer
producer_main:
    mov rdi, 1
    call queue_enqueue
    mov rdi, 2
    call queue_enqueue
    ; ... etc

; Core 1: Consumer
consumer_main:
    call queue_dequeue
    ; RAX contains value
    call process_value
    jmp consumer_main
```

This pattern is common in multimedia processing, network packet handling, and real-time systems.

### 13.7.3 Benchmarking Concurrency Overhead

To measure the cost of synchronization, compare:

- Single-threaded summation.
- Multi-threaded with atomic increments.
- Multi-threaded with per-core accumulators and final reduction.

Atomic increments incur high contention:

```x86asm
; BAD: High contention
shared_counter dq 0
worker_bad:
    mov rcx, 1000000
.loop:
    lock inc qword [shared_counter]
    loop .loop
    ret
```

Per-core counters scale better:

```x86asm
; GOOD: Scalable
per_core_counters dq 0, 0, 0, 0
worker_good:
    ; RDI = core_id
    mov rcx, 250000      ; each core does 1/4 of the work
.loop:
    inc qword [per_core_counters + rdi*8]
    loop .loop
    ret
```

Final reduction:

```x86asm
reduce_results:
    xor rax, rax
    add rax, [per_core_counters + 0]
    add rax, [per_core_counters + 8]
    add rax, [per_core_counters + 16]
    add rax, [per_core_counters + 24]
    ret
```

Benchmark results typically show near-linear speedup for the scalable version, while the atomic version may even be slower than single-threaded due to contention.

---

## 13.8 Debugging and Profiling Concurrent Assembly Code

Concurrency bugs are notoriously difficult to reproduce and debug. They often manifest only under specific timing conditions.

### 13.8.1 Common Bugs

- **Race conditions**: Unprotected access to shared data.
- **Deadlocks**: Circular wait dependencies.
- **Livelocks**: Threads continually retry without progress.
- **Starvation**: Some threads never acquire needed resources.
- **ABA problem**: In CAS, a value changes from A to B and back to A, causing incorrect assumptions.

### 13.8.2 Tools and Techniques

- **Intel Inspector**, **ThreadSanitizer**: Detect data races (though less effective for pure assembly).
- **perf**: Monitor cache misses, context switches, and CPU utilization.
- **Manual logging**: Insert serializing instructions (e.g., `cpuid`) and log timestamps via `rdtsc`.
- **Deterministic replay**: Use record-and-replay tools if available.

Example: Logging with `rdtsc`.

```x86asm
log_timestamp:
    rdtsc
    shl rdx, 32
    or rax, rdx         ; RAX = 64-bit timestamp
    ; Store to log buffer
    ret
```

### 13.8.3 Stress Testing

Concurrency bugs often appear only under load. Write test harnesses that:

- Launch many threads.
- Vary timing with random sleeps or pauses.
- Run for extended periods.

---

## 13.9 Operating System Interaction

Even in assembly, you rarely manage threads directly. You rely on the OS for thread creation, scheduling, and synchronization.

### 13.9.1 Thread Creation via System Calls

On Linux, use `clone` system call.

```x86asm
; Create thread with function in RDI, stack in RSI
create_thread:
    mov rax, 56         ; __NR_clone
    mov rdi, 0x00010000 ; CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND
    mov rsi, rsi        ; child stack
    mov rdx, 0          ; parent_tid
    mov r10, 0          ; child_tid
    mov r8, 0           ; tls
    syscall
    test rax, rax
    jz .child_entry
    ret                 ; parent returns child PID
.child_entry:
    call rdi            ; call thread function
    mov rax, 60         ; __NR_exit
    mov rdi, 0
    syscall
```

### 13.9.2 Futexes for Efficient Waiting

Instead of spinning, use futexes (fast user-space mutexes) to block until woken by the OS.

```x86asm
section .data
    futex_var dq 0

futex_wait:
    ; RDI = address, RSI = expected value
    mov rax, 202        ; __NR_futex
    mov rdx, 0          ; FUTEX_WAIT
    mov r10, 0          ; timeout = NULL
    syscall
    ret

futex_wake:
    ; RDI = address, RSI = number to wake
    mov rax, 202
    mov rdx, 1          ; FUTEX_WAKE
    syscall
    ret
```

Used in higher-level mutex implementations to avoid spinning when contended.

---

## 13.10 Advanced Topics: NUMA, Hyper-Threading, and Vectorization

### 13.10.1 NUMA Awareness

On multi-socket systems, memory access latency varies depending on which socket owns the memory. Use `numactl` (Linux) to bind threads and memory to specific nodes.

In assembly, optimize by:

- Allocating memory local to the core that uses it.
- Avoiding remote memory accesses in hot loops.

### 13.10.2 Hyper-Threading Considerations

Hyper-threading (SMT) shares core resources between logical threads. Contention for execution units, cache, or TLB can degrade performance.

- Use `CPUID` to detect topology.
- Avoid spinning on shared locks — use `pause` to yield to sibling thread.
- Pad data structures to avoid cache line sharing between logical cores.

### 13.10.3 Vectorization and Concurrency

SIMD instructions (SSE, AVX) can process multiple data elements in parallel. Combine with multi-core for two levels of parallelism.

Example: Parallel vectorized sum.

```x86asm
; Each core processes 1/4 of array with AVX
worker_avx:
    ; RDI = start index, RSI = end index
    mov rax, rdi
    shl rax, 3          ; to bytes
    add rax, array
    vxorpd ymm0, ymm0, ymm0   ; accumulator
.loop:
    cmp rax, rsi
    jge .done
    vaddpd ymm0, ymm0, [rax]  ; add 4 doubles
    add rax, 32
    jmp .loop
.done:
    ; Horizontal sum ymm0
    vextractf128 xmm1, ymm0, 1
    vaddpd xmm0, xmm0, xmm1
    vhaddpd xmm0, xmm0, xmm0
    vhaddpd xmm0, xmm0, xmm0
    vmovsd [partial_sums + rcx*8], xmm0
    ret
```

---

## 13.11 Summary and Best Practices

### 13.11.1 Key Takeaways

- Multi-core programming in assembly requires explicit management of shared state.
- Use atomic operations (`lock`, `xchg`, `cmpxchg`) for synchronization.
- Memory barriers (`mfence`, `sfence`, `lfence`) enforce ordering.
- Avoid false sharing by aligning data to cache line boundaries.
- Prefer lock-free or wait-free algorithms when possible.
- Use OS primitives (futexes, threads) for blocking and scheduling.

### 13.11.2 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Use Atomic Operations**     | For shared mutable state, always use `lock`-prefixed or atomic RMW instructions. |
| **Minimize Critical Sections**| Hold locks for the shortest time possible.                                      |
| **Avoid False Sharing**       | Pad or align data structures to 64-byte boundaries.                             |
| **Use Memory Barriers**       | When ordering matters, insert explicit fences.                                  |
| **Prefer Per-Core Data**      | Use thread-local or per-core accumulators to avoid contention.                  |
| **Leverage OS Synchronization**| Use futexes or condition variables instead of spinning when waiting.            |
| **Profile and Benchmark**     | Measure scalability and contention under realistic loads.                       |

> **“Correctness first, performance second — but in assembly, you must achieve both.”**  
> Unlike high-level languages where safety often comes at a performance cost, assembly allows you to write code that is both correct and optimal. But this power demands discipline.

> **“Concurrency is like juggling chainsaws — thrilling when done right, catastrophic when done wrong.”**  
> The tools are powerful. Use them with precision.

---

## 13.12 Exercises

1. Implement a reader-writer lock in assembly using `cmpxchg`. Readers should be able to enter concurrently if no writer is active.
2. Write a lock-free stack (push and pop) using `cmpxchg`.
3. Modify the parallel summation example to use `mfence` and measure the performance impact.
4. Create a benchmark that demonstrates false sharing: measure performance with and without padding.
5. Implement a barrier that uses a futex instead of spinning.
6. Write a multi-producer, multi-consumer lock-free queue.
7. Use `perf` to measure cache misses in a contended atomic increment loop.
8. Implement a spinlock that yields the CPU (via `syscall` or `hlt`) after a certain number of retries.
9. Write assembly code that detects the number of cores and cache line size using `CPUID`.
10. Create a thread-safe memory allocator using a lock-free freelist.

---

## 13.13 Further Reading

- Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volumes 1–3.
- “The Art of Multiprocessor Programming” by Maurice Herlihy and Nir Shavit.
- Linux `futex` man page and kernel documentation.
- Agner Fog’s optimization manuals (www.agner.org).
- “Is Parallel Programming Hard, And, If So, What Can You Do About It?” by Paul E. McKenney.
