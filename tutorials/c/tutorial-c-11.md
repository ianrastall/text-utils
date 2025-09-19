# 11. System Programming in C: Interacting with the Operating System Kernel

## 11.1 Introduction to System Programming

System programming represents the critical layer where application code directly interfaces with the core services provided by the operating system kernel. Unlike standard application programming that primarily utilizes higher-level libraries (like `stdio.h` for file operations), system programming involves invoking **system calls** – the fundamental, privileged entry points into the kernel that manage hardware resources, enforce security, and provide essential abstractions. While the C standard library (`libc`) often wraps these system calls for convenience and portability, understanding the underlying mechanisms is paramount for developing robust, efficient, and truly portable software, especially when dealing with performance constraints, unique hardware requirements, or scenarios where the standard library abstractions prove insufficient or introduce unwanted overhead.

For the beginning programmer familiar with basic C syntax, control structures, functions, and perhaps simple file I/O using `fopen` and `fprintf`, system programming can initially seem daunting. The concepts involve a deeper understanding of process execution, memory management beyond the heap and stack, and the intricate relationship between user space and kernel space. However, the principles governing system calls are logical and consistent. The primary distinction lies in the **context switch** and **privilege level change** that occurs when a system call is made. User-space programs execute with limited privileges; they cannot directly access hardware or critical kernel data structures. When a program needs a service only the kernel can provide (like reading a file, creating a new process, or allocating more memory), it triggers a system call. This causes the CPU to switch to a higher privilege mode (kernel mode), execute the requested service within the secure kernel environment, and then switch back to user mode, returning the result (or an error) to the application.

Mastering system programming in C is not merely an academic exercise; it is a foundational skill for a vast array of practical software development. Consider the ubiquitous command-line tools you use daily: `ls`, `cp`, `grep`, `ssh`, `ps`. These are all system programs, heavily reliant on system calls for file operations, process management, terminal control, and inter-process communication. Web servers like Apache or Nginx leverage system calls for high-performance network I/O (sockets), process/thread management, and file serving. Database management systems interact directly with the kernel for memory-mapped files, efficient disk I/O, and synchronization primitives. Even seemingly simple tasks like getting the current time with high precision (`clock_gettime`) or querying system resource limits (`getrlimit`) involve system calls. Understanding these mechanisms empowers you to write programs that are not only functional but also efficient, predictable in their resource usage, and capable of handling the complex realities of concurrent execution and hardware interaction that underpin modern computing.

> **Critical Distinction:** A system call is *not* a C library function. While C library functions (like those in `libc`) are implemented in user space and often *invoke* system calls to get kernel services, the system call itself is the specific, low-level request made to the kernel. The C library provides a convenient, often more portable, interface *on top of* the system call interface. For example, `fopen` (a library function) typically uses the `open` system call internally, but also manages buffering and stream state in user space. Directly using `open` (a system call wrapper) gives you finer control but less convenience.

This chapter moves beyond the confines of the C standard library to explore the POSIX (Portable Operating System Interface) standard, which defines a consistent set of system calls and behaviors primarily for Unix-like operating systems (Linux, macOS, BSD variants). While Windows has its own distinct system call interface (the Win32 API), the concepts of system calls, processes, files, and IPC are universal. Focusing on POSIX provides a coherent and widely applicable foundation, as it underpins the vast majority of server, embedded, and open-source development environments. The principles learned here – error handling, resource management, concurrency considerations – are directly transferable, even if the specific function names differ on other platforms.

## 11.2 Core Concepts and Prerequisites

Before delving into specific system calls, it is essential to solidify the conceptual bedrock upon which system programming rests. These concepts define the environment in which system calls operate and dictate how programs interact with the kernel and each other.

### 11.2.1 The Process: The Fundamental Unit of Execution

In modern operating systems, the **process** is the primary abstraction representing an executing program. When you run a command like `./myprogram`, the shell (itself a process) instructs the kernel to create a new process. This new process receives:

1.  **A Unique Identifier (PID):** The Process ID, a positive integer assigned by the kernel, serves as the process's primary handle for system calls (e.g., `kill(pid, signal)`). The special PID `0` is often used internally by the kernel; PID `1` is traditionally the `init` process (or `systemd` on modern Linux).
2.  **A Private Virtual Address Space:** The kernel provides each process with the *illusion* of having exclusive access to a large, contiguous block of memory. This space contains the program's code (text segment), initialized and uninitialized global/static data (data and bss segments), the runtime stack (for function calls and local variables), and the heap (for dynamic memory allocation via `malloc`/`brk`/`sbrk`). Crucially, one process cannot directly read or write the memory of another process; communication requires explicit mechanisms (IPC).
3.  **Resources:** The kernel tracks resources owned by the process: open files (represented by file descriptors), pending signals, CPU time used, accounting information, and security credentials (user ID, group ID).
4.  **Execution Context:** This includes the program counter (current instruction), CPU registers, and the current state (running, runnable, waiting, stopped, zombie).

The **process lifecycle** is central to system programming:
*   **Creation:** Primarily via `fork()` (and its variants like `vfork()`, largely obsolete) or `exec()` family calls (which replace the current process image).
*   **Execution:** The process runs instructions, makes system calls, and may create child processes or threads.
*   **Termination:** A process terminates normally (by calling `exit()` or returning from `main()`) or abnormally (due to a signal like `SIGSEGV`). Upon termination, most resources are reclaimed by the kernel, but an entry in the process table (a "zombie" process) remains until the parent process acknowledges termination via `wait()` or `waitpid()`.
*   **Reaping:** The parent process uses `wait()`/`waitpid()` to collect the exit status of a terminated child, allowing the kernel to fully remove the process's residual state.

Understanding process states and transitions is vital for debugging and designing concurrent applications. A process blocked waiting for I/O (e.g., reading from a slow disk) is in a "waiting" state; the kernel schedules other runnable processes while it waits.

### 11.2.2 File Descriptors: The Universal Resource Handle

In Unix-like systems, the concept of a "file" is generalized far beyond simple disk storage. The kernel uses **file descriptors (FDs)** – small, non-negative integers – as the fundamental, uniform handle for *any* I/O resource. This elegant abstraction unifies access to:

*   Regular files on disk
*   Directories
*   Pipes (for inter-process communication)
*   Sockets (for network communication)
*   Terminals (keyboard, screen)
*   Devices (e.g., `/dev/tty`, `/dev/null`, serial ports)
*   Event notification mechanisms (e.g., `inotify`, `epoll`)

When a process starts, it inherits three standard file descriptors from its parent (usually the shell):

*   **File Descriptor 0 (STDIN_FILENO):** Standard Input (typically the keyboard).
*   **File Descriptor 1 (STDOUT_FILENO):** Standard Output (typically the terminal screen).
*   **File Descriptor 2 (STDERR_FILENO):** Standard Error (also typically the terminal screen, but separate for redirection purposes).

Key properties of file descriptors:
*   **Per-Process:** FDs are meaningful only within the context of the specific process that opened them. If process A opens a file getting FD 3, process B opening the same file will get a different FD (e.g., 5). However, both FDs refer to the *same underlying open file description* in the kernel if opened with the same path and flags (more on this later).
*   **Kernel-Managed State:** The kernel maintains internal data structures tracking the current file offset, status flags (e.g., non-blocking mode), and access mode (read, write, read-write) associated with each open file description. Multiple FDs (even in different processes) can point to the same open file description.
*   **Inheritance by `fork()`:** When a process calls `fork()`, the child process receives an exact copy of the parent's file descriptor table. Both parent and child FDs refer to the *same* underlying open file descriptions. Changes made via one FD (like advancing the file offset with `read`/`write`) are visible through the other FD. This is crucial for implementing pipes.
*   **Limited Number:** Each process has a limited number of FDs it can have open simultaneously (checkable via `ulimit -n` in the shell or `getrlimit(RLIMIT_NOFILE, ...)` system call). Exceeding this limit causes system calls like `open()` to fail with `EMFILE` or `ENFILE`.

The power of the file descriptor abstraction lies in its universality. Once you have an FD (obtained via `open`, `pipe`, `socket`, `accept`, etc.), you can use the *same* set of system calls (`read`, `write`, `close`, `fcntl`, `ioctl`, `select`/`poll`/`epoll`) to interact with vastly different types of resources. This simplifies I/O programming significantly.

### 11.2.3 Error Handling: The Paramount Concern

System programming is inherently fraught with potential points of failure. Hardware can fail, disks can fill up, networks can disconnect, resources can be exhausted, permissions can be denied, and processes can be interrupted. **Robust error handling is not optional; it is the cornerstone of reliable system software.** Ignoring errors leads to unpredictable behavior, security vulnerabilities, and difficult-to-diagnose bugs.

The universal mechanism for reporting errors from system calls (and many library functions wrapping them) is:

1.  **Return Value:** Most system calls return `-1` (or sometimes `NULL` for pointer-returning calls) to indicate an error occurred.
2.  **`errno` Global Variable:** Upon returning an error, the system call sets the global variable `errno` (declared in `<errno.h>`) to a specific error code value (e.g., `EACCES`, `ENOENT`, `ENOMEM`). **Crucially, `errno` is only meaningful if the function returned an error indication.** Its value is *not* reset to zero on success. Relying on `errno` without checking the return value first is a common beginner mistake.
3.  **Error Code Constants:** `<errno.h>` defines symbolic constants (like `ENOENT` for "No such file or directory") which are more readable and portable than raw numbers. Always use these constants.
4.  **`perror()` and `strerror()`:** These functions help translate `errno` into human-readable strings:
    *   `void perror(const char *msg);` Prints `msg` followed by a colon, a space, and the error message corresponding to the current `errno` value, then a newline. (e.g., `perror("open");` might print `open: No such file or directory`).
    *   `char *strerror(int errnum);` Returns a pointer to a string describing the error code `errnum`. Useful for logging or custom error messages.

> **Imperative Practice:** **Every single system call must have its return value checked.** There are very few exceptions (like `close()` in some contexts, though even that can fail and should often be checked). Failing to check an error return is a critical flaw. Consider this common anti-pattern:
> ```c
> int fd = open("data.txt", O_RDONLY);
> // WRONG! What if open failed? fd is -1, next read will likely crash.
> char buffer[1024];
> read(fd, buffer, sizeof(buffer));
> ```
> The correct pattern is:
> ```c
> int fd = open("data.txt", O_RDONLY);
> if (fd == -1) {
>     // Handle error: log, perror, exit, retry, etc.
>     perror("open data.txt failed");
>     exit(EXIT_FAILURE); // Or return an error code
> }
> // Proceed safely, knowing fd is valid
> ```
> Always ask: *What could go wrong here?* and handle it explicitly.

### 11.2.4 Concurrency and Signals

System programming often involves concurrent execution: multiple processes running seemingly simultaneously (via time-slicing by the kernel), or multiple threads within a single process (though threads are covered more deeply in a later chapter). Concurrency introduces challenges like race conditions and the need for synchronization.

**Signals** are a fundamental, asynchronous inter-process communication mechanism used by the kernel and processes to notify a process of events. Examples include:
*   `SIGINT` (Ctrl+C from terminal)
*   `SIGSEGV` (Segmentation Fault - invalid memory access)
*   `SIGCHLD` (Child process terminated or stopped)
*   `SIGALRM` (Timer expired)
*   `SIGPIPE` (Writing to a pipe with no readers)

Signals are **asynchronous**: they can be delivered to a process at *any* point during its execution (except during certain critical kernel operations). By default, most signals cause the process to terminate (often with a core dump), stop, or be ignored. Processes can **catch** signals using `signal()` or `sigaction()` to install a custom **signal handler** function. However, signal handlers have severe restrictions: they must be async-signal-safe (only call a limited set of functions like `write`, `sigprocmask`, `_exit`), cannot access global data unsafely, and should ideally just set a flag for the main program loop to check. Misusing signal handlers is a common source of subtle, hard-to-reproduce bugs.

Understanding signal basics is essential because:
1.  Many system calls can be **interrupted** by signals, causing them to return `-1` with `errno` set to `EINTR`. Your code must be prepared to handle this, typically by restarting the interrupted system call (unless the signal handler explicitly sets a flag to terminate).
2.  Signals like `SIGCHLD` are crucial for processes that create children (`fork()`) to avoid zombie processes.
3.  Signals provide a way to implement timeouts (`alarm()`, `setitimer()`) and handle critical events (e.g., `SIGTERM` for graceful shutdown).

## 11.3 File I/O System Calls

While the C standard I/O library (`<stdio.h>`) provides buffered, high-level functions (`fopen`, `fread`, `fprintf`, `fclose`), direct use of file I/O system calls offers greater control, avoids buffering complexities in certain scenarios (like dealing with non-seekable devices), and is essential for understanding the underlying mechanics. The core system calls for file operations are `open`, `read`, `write`, `lseek`, and `close`.

### 11.3.1 Opening Files: The `open` System Call

The `open` system call creates a new file descriptor referring to the file specified by its pathname. It is significantly more powerful and complex than `fopen`.

**Function Signature:**
```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

int open(const char *pathname, int flags);
int open(const char *pathname, int flags, mode_t mode);
```

*   **`pathname`:** The path to the file to open (absolute or relative to the current working directory).
*   **`flags`:** A bitmask specifying the access mode and behavior. Must include exactly one of:
    *   `O_RDONLY`: Open for reading only.
    *   `O_WRONLY`: Open for writing only.
    *   `O_RDWR`: Open for reading and writing.
    Additionally, combine (using bitwise OR `|`) any of the following:
    *   `O_CREAT`: If the file does not exist, create it. Requires the `mode` argument.
    *   `O_EXCL`: When used with `O_CREAT`, fail if the file already exists (prevents race conditions during creation). Useful for lock files.
    *   `O_TRUNC`: If the file exists and is a regular file, truncate it to length 0. Requires write permission.
    *   `O_APPEND`: All writes will append to the end of the file. Atomic with respect to other processes writing to the same file.
    *   `O_NONBLOCK`: Open in non-blocking mode (primarily for FIFOs and sockets, but affects some devices).
    *   `O_SYNC`: Write operations complete only when data is physically written to the storage device (slower, more durable).
    *   `O_DIRECT`: Attempt to bypass the page cache (for very specific high-performance scenarios).
*   **`mode` (required only if `O_CREAT` is specified):** Specifies the permissions (access mode) to assign to the newly created file, *modified* by the process's **umask**. It's a bitmask using constants like:
    *   `S_IRUSR` (0400): Read permission, owner.
    *   `S_IWUSR` (0200): Write permission, owner.
    *   `S_IXUSR` (0100): Execute permission, owner.
    *   `S_IRGRP` (0040): Read permission, group.
    *   `S_IWGRP` (0020): Write permission, group.
    *   `S_IXGRP` (0010): Execute permission, group.
    *   `S_IROTH` (0004): Read permission, others.
    *   `S_IWOTH` (0002): Write permission, others.
    *   `S_IXOTH` (0001): Execute permission, others.
    Common combinations: `0644` (owner: rw-, group/others: r--), `0755` (owner: rwx, group/others: r-x).

**Return Value:**
*   On success: A new, non-negative file descriptor (the smallest available integer).
*   On error: `-1`, and `errno` is set appropriately (e.g., `ENOENT`, `EACCES`, `EEXIST`, `EMFILE`).

**Example: Opening for Reading (Existing File)**
```c
int fd = open("input.txt", O_RDONLY);
if (fd == -1) {
    perror("open input.txt");
    exit(EXIT_FAILURE);
}
```

**Example: Creating/Truncating for Writing**
```c
int fd = open("output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
if (fd == -1) {
    perror("open output.txt");
    exit(EXIT_FAILURE);
}
// File is created (if needed) or emptied, ready for writing.
```

**Example: Creating Exclusively (Avoiding Race)**
```c
int fd = open("lockfile", O_CREAT | O_EXCL | O_WRONLY, 0644);
if (fd == -1) {
    if (errno == EEXIST) {
        fprintf(stderr, "Lock file exists, another instance running?\n");
    } else {
        perror("open lockfile");
    }
    exit(EXIT_FAILURE);
}
// We hold the lock; write PID or other info to fd if needed.
```

### 11.3.2 Reading and Writing: `read` and `write`

Once a file descriptor is open, `read` and `write` are used for actual data transfer.

**Function Signatures:**
```c
#include <unistd.h>

ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
```

*   **`fd`:** The file descriptor to read from or write to.
*   **`buf`:** A pointer to the buffer where data will be read into (`read`) or written from (`write`).
*   **`count`:** The maximum number of bytes to attempt to read or write.

**Return Value (`read`):**
*   On success: Number of bytes read (can be less than `count`, especially for pipes, sockets, or if interrupted). `0` indicates end-of-file (for regular files) or no data available (for some devices).
*   On error: `-1`, `errno` set.

**Return Value (`write`):**
*   On success: Number of bytes written (should usually equal `count` for regular files; might be less for pipes/sockets/bufs full).
*   On error: `-1`, `errno` set.

**Critical Considerations:**

1.  **Partial Transfers:** **Never assume `read` or `write` transfers the full requested `count` bytes in a single call.** Especially for non-regular files (pipes, sockets, terminals), they often return fewer bytes. Your code *must* handle this by looping until the desired amount is transferred or an error/end-of-file occurs.
    ```c
    // Robust read loop for exactly n bytes (or error/EOF)
    ssize_t read_n(int fd, void *buf, size_t n) {
        size_t total_read = 0;
        while (total_read < n) {
            ssize_t bytes_read = read(fd, (char *)buf + total_read, n - total_read);
            if (bytes_read == -1) {
                if (errno == EINTR) continue; // Interrupted, retry
                return -1; // Real error
            }
            if (bytes_read == 0) break; // EOF
            total_read += bytes_read;
        }
        return total_read; // Could be < n if EOF reached
    }
    ```
2.  **`EINTR` Error:** As mentioned in the concurrency section, system calls can be interrupted by signals, returning `-1` with `errno` set to `EINTR`. Well-behaved code should retry the system call (unless the signal handler sets a flag indicating termination). The loop above demonstrates handling `EINTR` for `read`.
3.  **Buffering:** Unlike `stdio`'s `fread`/`fwrite`, `read`/`write` are **unbuffered**. Each call results in a system call (kernel transition). For high-performance sequential I/O on regular files, using larger buffer sizes (e.g., 4KB, 8KB, matching filesystem block size) minimizes the number of system calls and is significantly faster than reading/writing one byte at a time. The `stdio` library's buffering exists primarily to reduce the overhead of these system calls.
4.  **Atomicity:** For regular files, `read` and `write` at the current file offset are atomic with respect to other processes also accessing the file (the kernel ensures the offset update and data transfer happen as a single, uninterruptible operation). `O_APPEND` writes are always atomic relative to the end of the file, regardless of the current offset.

### 11.3.3 Positioning: The `lseek` System Call

The `lseek` system call changes the current file offset for an open file descriptor, enabling random access I/O.

**Function Signature:**
```c
#include <sys/types.h>
#include <unistd.h>

off_t lseek(int fd, off_t offset, int whence);
```

*   **`fd`:** The open file descriptor.
*   **`offset`:** A signed offset.
*   **`whence`:** Specifies how to interpret `offset`:
    *   `SEEK_SET`: Set offset to `offset` bytes from the start of the file.
    *   `SEEK_CUR`: Set offset to current offset plus `offset` bytes.
    *   `SEEK_END`: Set offset to end-of-file plus `offset` bytes (usually negative for reading backwards).

**Return Value:**
*   On success: The resulting file offset (measured in bytes from the beginning of the file).
*   On error: `(off_t) -1`, `errno` set (e.g., `ESPIPE` for pipes/FIFOs/sockets which are unseekable).

**Common Uses:**

*   **Random Access:** Jump to a specific position to read or write.
    ```c
    // Read 100 bytes starting at byte 1000
    if (lseek(fd, 1000, SEEK_SET) == (off_t)-1) { /* error */ }
    read(fd, buffer, 100);
    ```
*   **Appending without `O_APPEND`:** Seek to the end, then write. (But `O_APPEND` is simpler and atomic).
*   **Getting File Size:** Seek to `SEEK_END`, 0 offset. The return value is the file size.
    ```c
    off_t size = lseek(fd, 0, SEEK_END);
    if (size == (off_t)-1) { /* error */ }
    ```
*   **Truncating Files:** While `O_TRUNC` truncates on open, `ftruncate(fd, length)` is the system call to truncate an *already open* file to a specific length.

**Important Note:** The file offset is part of the **open file description** maintained by the kernel, *not* the file descriptor itself. If two file descriptors (e.g., in parent and child after `fork()`, or via `dup()`) refer to the same open file description, changing the offset via one affects the other.

### 11.3.4 Closing Files: The `close` System Call

The `close` system call releases the file descriptor and deallocates associated kernel resources.

**Function Signature:**
```c
#include <unistd.h>

int close(int fd);
```

*   **`fd`:** The file descriptor to close.

**Return Value:**
*   On success: `0`.
*   On error: `-1`, `errno` set (e.g., `EBADF` for invalid FD).

**Critical Points:**

1.  **Resource Leak:** Forgetting to `close` file descriptors is a common resource leak. While the kernel automatically closes all FDs when a process terminates, long-running processes (daemons, servers) must close FDs they no longer need to avoid exhausting the per-process FD limit (`EMFILE`).
2.  **Error Handling:** `close` can fail (e.g., if a write-back to disk encounters an error after the last `write` but before closing). While often ignored in simple programs, robust code (especially for critical data) *should* check the return value of `close`. Ignoring a `close` error on a file you just wrote critical data to could mean the data wasn't actually saved to disk.
3.  **Inheritance:** FDs closed in the parent *before* `fork()` are not inherited by the child. FDs closed in the child after `fork()` do not affect the parent's FDs (they are copies, but both point to the same underlying open file description until one is closed).

### 11.3.5 Comparing `stdio` and System Call I/O

The following table summarizes key differences between the high-level `stdio` library and direct system call I/O for files. Understanding when to use which is important.

| **Feature**               | **`stdio` Library (`fopen`, `fread`, etc.)**          | **System Calls (`open`, `read`, etc.)**               |
| :------------------------ | :---------------------------------------------------- | :---------------------------------------------------- |
| **Abstraction Level**     | High-level, buffered                                  | Low-level, unbuffered                                 |
| **Primary Unit**          | Stream (`FILE *`)                                     | File Descriptor (`int`)                               |
| **Buffering**             | Automatic (full, line, none) managed by library       | None; each call is a direct system call               |
| **Performance (Sequential)** | Generally faster for small reads/writes due to buffering | Slower for small ops; faster for large ops if buffering is tuned |
| **Control**               | Less direct control over I/O behavior                 | Fine-grained control (e.g., `O_DIRECT`, `O_SYNC`)     |
| **Portability**           | Highly portable across C environments                 | POSIX-specific; Windows uses different APIs           |
| **Error Handling**        | `ferror()`, `feof()`; `errno` sometimes set           | Explicit `-1` return + `errno`                        |
| **File Positioning**      | `fseek`, `ftell`                                      | `lseek`                                               |
| **File Truncation**       | `ftruncate` not standard; often requires system call  | `ftruncate` system call                               |
| **Non-File Resources**    | Limited support (e.g., `fdopen` bridges gap)          | Native support (pipes, sockets, devices via FDs)      |
| **Typical Use Case**      | General application I/O, text processing              | System utilities, performance-critical code, IPC, network |

**When to Use System Calls Directly:**
*   When you need precise control over I/O behavior (e.g., `O_DIRECT`, `O_SYNC`, `O_NONBLOCK`).
*   When working with resources that aren't regular files (pipes, sockets, devices).
*   When implementing your own buffering strategy optimized for a specific workload.
*   When writing code that must avoid the overhead of `stdio` buffering (e.g., low-latency logging, certain IPC patterns).
*   When the `stdio` library lacks functionality you need (e.g., `O_EXCL` creation semantics).

**When `stdio` is Preferable:**
*   For most general-purpose file reading/writing, especially text.
*   When simplicity and portability across all C environments are paramount.
*   When the automatic buffering provides sufficient performance.

## 11.4 Process Management System Calls

Creating, managing, and terminating processes are fundamental system programming tasks. The primary system calls involved are `fork`, `exec`, `wait`, and `exit`.

### 11.4.1 Creating New Processes: `fork` and `vfork`

The `fork` system call is the cornerstone of process creation in Unix. It creates a new process by duplicating the calling process.

**Function Signature:**
```c
#include <unistd.h>

pid_t fork(void);
```

**Return Value:**
*   **In the Child Process:** `0`. This is the *only* way the child can directly know it is the child.
*   **In the Parent Process:** The PID of the newly created child process.
*   **On Error:** `-1`, `errno` set (e.g., `EAGAIN` for resource limits, `ENOMEM` for insufficient memory).

**What Happens During `fork()`:**
1.  The kernel creates a new process table entry.
2.  It duplicates the parent's address space (code, data, heap, stack) for the child. **Crucially, this is done using Copy-On-Write (COW) semantics.** Initially, both parent and child share the same physical memory pages. Only when one process *modifies* a page does the kernel make a private copy for that process. This makes `fork` very efficient in practice.
3.  The child inherits:
    *   File descriptors (FDs point to the *same* open file descriptions; closing an FD in one process doesn't affect the other's FD, but affects the shared description).
    *   Current working directory.
    *   User and group IDs.
    *   Environment variables.
    *   Signal dispositions (but pending signals are *not* inherited).
    *   Resource limits.
4.  The child does *not* inherit:
    *   Pending signals.
    *   Memory locks.
    *   Process-associated timers.
    *   Thread-specific data (if threads exist).

**The Classic `fork` Pattern:**
```c
pid_t pid = fork();
if (pid == -1) {
    perror("fork");
    exit(EXIT_FAILURE);
} else if (pid == 0) {
    // Child process code
    printf("Child: My PID is %d, Parent PID is %d\n", getpid(), getppid());
    // Often, the child will call an exec() function next
    execlp("ls", "ls", "-l", NULL);
    // If exec returns, it failed
    perror("execlp");
    exit(EXIT_FAILURE);
} else {
    // Parent process code
    printf("Parent: My PID is %d, Child PID is %d\n", getpid(), pid);
    // Parent often waits for the child to finish
    int status;
    if (waitpid(pid, &status, 0) == -1) {
        perror("waitpid");
        exit(EXIT_FAILURE);
    }
    if (WIFEXITED(status)) {
        printf("Child exited with status %d\n", WEXITSTATUS(status));
    }
}
```

**`vfork()` (Historical/Legacy):** An older, more dangerous variant. The child borrows the parent's memory and thread of execution; the parent is suspended until the child either exits or calls `exec`. Intended for efficiency when `exec` is called immediately after `fork`, but prone to subtle errors if the child modifies memory or returns from the function containing `vfork`. **Avoid `vfork()` in new code; modern kernels optimize `fork` sufficiently with COW.** Use `posix_spawn()` if efficiency is critical.

### 11.4.2 Executing New Programs: The `exec` Family

The `exec` family of functions replaces the current process image with a new program. They *do not* create a new process; they transform the calling process into a different program. `fork` is almost always used first to create a new process, which then calls `exec` to run a different program.

**Common `exec` Variants:**
```c
#include <unistd.h>

// Path: Full path to executable specified (e.g., "/bin/ls")
int execl(const char *path, const char *arg, ... /* (char  *) NULL */);
int execv(const char *path, char *const argv[]);

// File: Searches PATH for executable (e.g., "ls")
int execlp(const char *file, const char *arg, ... /* (char  *) NULL */);
int execvp(const char *file, char *const argv[]);

// Environment: Allows specifying the environment for the new process
int execle(const char *path, const char *arg, ... /*, (char *) NULL, char *const envp[] */);
int execve(const char *path, char *const argv[], char *const envp[]);
```

*   **`l` vs `v`:** `l` (list) takes the command-line arguments as separate parameters ending with `NULL`. `v` (vector) takes the arguments as an array (`argv`) ending with `NULL`.
*   **`p`:** Searches the directories listed in the `PATH` environment variable for the executable file.
*   **`e`:** Allows passing a custom environment array (`envp`) to the new program. Without `e`, the new program inherits the current process's environment.

**Key Points:**
1.  **No Return on Success:** If `exec` succeeds, it *never* returns to the calling code. The original program's text, data, heap, and stack are replaced by those of the new program. Execution starts at the new program's `main`.
2.  **Return on Failure:** Returns `-1` only if an error occurs (e.g., file not found, permission denied). The original program continues running.
3.  **File Descriptors:** By default, all open file descriptors are inherited by the new program. However, descriptors opened with the `FD_CLOEXEC` flag (set via `fcntl(fd, F_SETFD, FD_CLOEXEC)`) are automatically closed during `exec`.
4.  **Arguments:** The first argument (`arg0` or `argv[0]`) is conventionally the name of the program (often the same as the executable file name). Subsequent arguments are the command-line arguments.
5.  **Environment:** The new program's environment is either inherited (default) or explicitly set (with `execle`/`execve`).

**Example using `execlp`:**
```c
execlp("ls", "ls", "-l", "/home/user", (char *)NULL);
// If we get here, execlp failed
perror("execlp");
exit(EXIT_FAILURE);
```

**Example using `execvp` (more flexible):**
```c
char *args[] = {"ls", "-l", "/home/user", NULL};
execvp(args[0], args);
perror("execvp");
exit(EXIT_FAILURE);
```

### 11.4.3 Waiting for Child Termination: `wait` and `waitpid`

After creating a child process (usually with `fork` followed by `exec`), the parent often needs to wait for the child to terminate to obtain its exit status and prevent it from becoming a zombie.

**Function Signatures:**
```c
#include <sys/wait.h>

pid_t wait(int *status);
pid_t waitpid(pid_t pid, int *status, int options);
```

*   **`status`:** A pointer to an integer where the exit status of the child is stored. Use macros to interpret it:
    *   `WIFEXITED(status)`: True if child exited normally.
    *   `WEXITSTATUS(status)`: Returns the exit status (if `WIFEXITED` true).
    *   `WIFSIGNALED(status)`: True if child terminated due to a signal.
    *   `WTERMSIG(status)`: Returns the signal number (if `WIFSIGNALED` true).
    *   `WIFSTOPPED(status)`: True if child is stopped (e.g., by a signal).
    *   `WSTOPSIG(status)`: Returns the signal that stopped the child.
*   **`pid` (for `waitpid`):**
    *   `> 0`: Wait for the specific child with that PID.
    *   `0`: Wait for any child in the same process group.
    *   `-1`: Wait for any child (same as `wait()`).
    *   `< -1`: Wait for any child in the process group `|-pid|`.
*   **`options` (for `waitpid`):** Bitmask:
    *   `WNOHANG`: Return immediately if no child has exited (don't block).
    *   `WUNTRACED`: Report status of stopped children.
    *   `WCONTINUED` (Linux): Report status of continued children (via `SIGCONT`).

**Return Value:**
*   On success: PID of the child that terminated (or whose status changed).
*   On error: `-1`, `errno` set (e.g., `ECHILD` if no children, `EINTR` if interrupted by signal).
*   For `waitpid` with `WNOHANG`: `0` if no child has exited.

**Why `wait` is Essential:**
When a child process terminates, it enters a **zombie state** (also called a defunct process). The kernel retains minimal information about the zombie (PID, exit status) so the parent can retrieve it via `wait`/`waitpid`. The zombie consumes a slot in the kernel's process table but no other resources. If the parent never waits (e.g., due to a bug), the zombie remains until the parent terminates. When the parent terminates, all its zombie children are "adopted" by the `init` process (PID 1), which periodically calls `wait` to clean them up. However, **leaving zombies is poor practice**; it wastes kernel resources and can eventually exhaust the process table limit, preventing new processes from being created. Always reap your children!

**Common Pattern:**
```c
pid_t pid = fork();
if (pid == -1) {
    // handle error
} else if (pid == 0) {
    // Child: execute program
    execlp("someprog", "someprog", arg1, arg2, NULL);
    exit(EXIT_FAILURE); // Only reached if exec fails
} else {
    // Parent
    int status;
    pid_t wpid = waitpid(pid, &status, 0); // Block until child exits
    if (wpid == -1) {
        // handle error
    }
    if (WIFEXITED(status)) {
        printf("Child %d exited, status=%d\n", wpid, WEXITSTATUS(status));
    } else if (WIFSIGNALED(status)) {
        printf("Child %d killed by signal %d\n", wpid, WTERMSIG(status));
    }
}
```

**Handling Multiple Children / `SIGCHLD`:**
A parent managing multiple children cannot block indefinitely in `wait` for one child if others might exit. The solution is to:
1.  Install a signal handler for `SIGCHLD` (sent to parent when a child terminates).
2.  In the handler, repeatedly call `waitpid` with `WNOHANG` to reap *all* terminated children without blocking.
3.  Ensure the handler is async-signal-safe (use `sigaction` with `SA_RESTART` if needed, but `waitpid` with `WNOHANG` is safe).

```c
static void sigchld_handler(int sig) {
    (void)sig; // Avoid unused parameter warning
    int saved_errno = errno; // Preserve errno
    pid_t pid;
    while ((pid = waitpid((pid_t)-1, 0, WNOHANG)) > 0) {
        // Optionally log reaped child pid
    }
    if (pid == -1 && errno != ECHILD) {
        // Unexpected error, log it
    }
    errno = saved_errno; // Restore errno
}

int main() {
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART; // Restart interrupted system calls
    if (sigaction(SIGCHLD, &sa, NULL) == -1) {
        perror("sigaction");
        exit(EXIT_FAILURE);
    }

    // Create multiple children...
    while (1) {
        // Main program loop; children are reaped asynchronously
    }
}
```

### 11.4.4 Process Termination: `exit` and `_exit`

A process terminates normally by calling `exit()` or returning from `main()`. It terminates abnormally due to an uncaught signal (e.g., `SIGSEGV`, `SIGFPE`).

**`exit(int status)` (Library Function):**
*   Defined in `<stdlib.h>`.
*   Performs cleanup:
    *   Flushes and closes all open `stdio` streams (calls `fclose` on all).
    *   Calls functions registered with `atexit()`.
    *   Deletes temporary files created with `tmpfile()`.
*   Finally, makes the `_exit(status)` system call.

**`_exit(int status)` (System Call):**
*   Defined in `<unistd.h>`.
*   Terminates the process *immediately*.
*   **Does not** flush `stdio` buffers.
*   **Does not** call `atexit` handlers.
*   **Does not** delete `tmpfile` files.
*   The low 8 bits of `status` become the process's exit status, available to the parent via `wait`/`waitpid`.

**When to Use `_exit`:**
*   **In the child process after `fork` but before `exec`:** If the child encounters an error (e.g., `exec` fails), it should call `_exit` instead of `exit`. Using `exit` would flush the parent's `stdio` buffers (which were duplicated at `fork` time) in the child, potentially causing duplicate output in the parent if it also uses `stdio`.
*   **In signal handlers:** To terminate immediately without triggering potentially unsafe cleanup.
*   **When absolute minimal termination is required.**

**Example (Correct Child Termination on `exec` Failure):**
```c
pid_t pid = fork();
if (pid == -1) {
    // error
} else if (pid == 0) {
    // Child
    execlp("nonexistent", "nonexistent", NULL);
    // exec failed
    perror("execlp");
    _exit(EXIT_FAILURE); // CRITICAL: Use _exit, not exit!
} else {
    // Parent
    // ...
}
```

## 11.5 Signals: Asynchronous Event Handling

Signals provide a mechanism for asynchronous notification of events to a process. They are a fundamental part of process control and inter-process communication.

### 11.5.1 Signal Concepts and Default Dispositions

Each signal has a unique number (e.g., `SIGINT=2`, `SIGKILL=9`, `SIGTERM=15`) and a symbolic name defined in `<signal.h>`. The kernel or other processes can send signals to a target process. When a signal is generated, the kernel sets a bit in the process's pending signal mask. At a safe point in execution (not during critical kernel operations), the kernel checks for pending signals and delivers them.

Each signal has a **default disposition** – what happens if the process doesn't explicitly handle it:
*   **Term:** Process terminates (e.g., `SIGINT`, `SIGTERM`, `SIGKILL`).
*   **Core:** Process terminates and produces a core dump (e.g., `SIGSEGV`, `SIGABRT`).
*   **Ign:** Signal is ignored (e.g., `SIGCHLD`, `SIGURG` - though `SIGCHLD` default is often Ign, its behavior is special).
*   **Stop:** Process is stopped (suspended) (e.g., `SIGSTOP`, `SIGTSTP`).
*   **Cont:** If stopped, the process is continued (e.g., `SIGCONT`).

**Important Signals:**
*   `SIGKILL` (9) and `SIGSTOP` (19/17): **Cannot be caught, blocked, or ignored.** `SIGKILL` always terminates; `SIGSTOP` always stops.
*   `SIGTERM` (15): The "polite" termination request. Processes should catch this to perform graceful shutdown (save state, close files, etc.).
*   `SIGINT` (2): Interrupt from keyboard (Ctrl+C). Default is Term.
*   `SIGQUIT` (3): Quit from keyboard (Ctrl+\). Default is Core (generates core dump).
*   `SIGSEGV` (11): Segmentation Violation (invalid memory access). Default is Core.
*   `SIGCHLD` (17/20): Child process terminated, stopped, or continued. Default is Ign, but processes often catch it to reap zombies without blocking.
*   `SIGALRM` (14): Timer expired (set via `alarm()` or `setitimer()`).
*   `SIGHUP` (1): Hangup detected on controlling terminal (or death of controlling process). Often used by daemons to trigger re-reading config files.

### 11.5.2 Signal Handling: `signal` and `sigaction`

The `signal` function is the older, simpler, but less reliable interface for setting signal handlers. **`sigaction` is the preferred, more powerful, and standardized method.**

**`sigaction` Function Signature:**
```c
#include <signal.h>

int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
```

*   **`signum`:** The signal number to handle (e.g., `SIGINT`).
*   **`act`:** Pointer to a `struct sigaction` specifying the new action (can be `NULL` to query).
*   **`oldact`:** Pointer to a `struct sigaction` where the previous action is stored (can be `NULL`).

**`struct sigaction` Definition:**
```c
struct sigaction {
    void     (*sa_handler)(int);   // Old-style handler OR SIG_DFL, SIG_IGN
    void     (*sa_sigaction)(int, siginfo_t *, void *); // Real-time handler (use if SA_SIGINFO set)
    sigset_t   sa_mask;            // Additional signals to block during handler execution
    int        sa_flags;           // Flags (e.g., SA_RESTART, SA_SIGINFO)
    void     (*sa_restorer)(void); // Obsolete, should be NULL
};
```

**Setting a Handler (Simple Case):**
```c
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>

void handle_sigint(int sig) {
    printf("Caught signal %d (SIGINT). Exiting gracefully...\n", sig);
    // Perform cleanup: close files, save state, etc.
    exit(EXIT_SUCCESS); // Or set a flag for main loop to check
}

int main() {
    struct sigaction sa;
    sa.sa_handler = handle_sigint; // Set the handler function
    sigemptyset(&sa.sa_mask);      // Block no additional signals during handler
    sa.sa_flags = 0;               // No special flags

    if (sigaction(SIGINT, &sa, NULL) == -1) {
        perror("sigaction");
        exit(EXIT_FAILURE);
    }

    printf("Running. Press Ctrl+C (SIGINT) to trigger handler.\n");
    while (1) {
        // Main program loop
        sleep(1);
    }
}
```

**Key `sigaction` Features:**

1.  **`sa_handler` vs `sa_sigaction`:** If `SA_SIGINFO` is *not* set in `sa_flags`, use `sa_handler` (takes only the signal number). If `SA_SIGINFO` *is* set, use `sa_sigaction` (takes signal number, a `siginfo_t` struct with detailed info, and a context pointer – useful for real-time signals).
2.  **`sa_mask`:** A signal set (manipulated via `sigemptyset`, `sigfillset`, `sigaddset`, `sigdelset`) specifying signals that are **blocked** (temporarily prevented from delivery) *while the signal handler is executing*. This prevents re-entrancy issues if the same signal (or others) is sent during handler execution. Blocking related signals (e.g., block `SIGTERM` while handling `SIGTERM`) is often prudent.
3.  **`sa_flags`:** Important flags:
    *   `SA_RESTART`: Causes certain system calls interrupted by this signal to be automatically restarted by the kernel, instead of failing with `EINTR`. (e.g., `read`, `write`, `wait`, `open` on slow devices). **Crucial for robust I/O handling.** Without it, you must manually restart interrupted system calls.
    *   `SA_NOCLDSTOP`: For `SIGCHLD`, don't receive notification when child is stopped (only when terminated).
    *   `SA_NOCLDWAIT`: For `SIGCHLD`, automatically reap child processes, preventing zombies. (Less common than using `waitpid`).
    *   `SA_SIGINFO`: Use the `sa_sigaction` handler with extended info.
4.  **Atomicity:** Setting the action with `sigaction` is an atomic operation, avoiding race conditions present in the older `signal` function.

> **Critical Warning:** Signal handlers must be **async-signal-safe**. The set of functions safe to call from within a signal handler is extremely limited (see `man 7 signal-safety`). **Never** call `printf`, `malloc`, `exit`, or most `stdio` functions from a signal handler. Safe functions include: `write` (to a file descriptor, not `stdout`), `_exit`, `sigprocmask`, `sigaction`, `read`, `close`, and a few others. The safest practice is to have the handler merely set a **volatile sig_atomic_t** flag, which the main program loop checks periodically. This avoids all concurrency issues within the handler itself.

### 11.5.3 Signal Sets and Blocking: `sigprocmask`

Processes can explicitly block and unblock signals using signal masks. Blocked signals are held pending (in the process's pending signal set) until unblocked.

**Function Signature:**
```c
#include <signal.h>

int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);
```

*   **`how`:** How to change the signal mask:
    *   `SIG_BLOCK`: Add signals in `set` to the current mask (block them).
    *   `SIG_UNBLOCK`: Remove signals in `set` from the current mask (unblock them).
    *   `SIG_SETMASK`: Set the mask to the value in `set`.
*   **`set`:** The signal set to apply (can be `NULL` to just query).
*   **`oldset`:** Where to store the previous signal mask (can be `NULL`).

**Signal Set Manipulation Functions:**
```c
int sigemptyset(sigset_t *set);    // Initialize set to empty
int sigfillset(sigset_t *set);     // Initialize set to full (all signals)
int sigaddset(sigset_t *set, int signum); // Add signum to set
int sigdelset(sigset_t *set, int signum); // Remove signum from set
int sigismember(const sigset_t *set, int signum); // Is signum in set?
```

**Why Block Signals?**
1.  **Critical Sections:** Prevent interruption during operations that must complete atomically (e.g., updating shared global data structures used by both main program and signal handler).
2.  **Preventing Race Conditions:** When modifying data also accessed by a signal handler, block the signal during the modification.
3.  **Synchronization:** Temporarily blocking a signal while waiting for it to be delivered (e.g., using `sigsuspend`).

**Example: Blocking `SIGINT` During Critical Section**
```c
sigset_t block_set, old_set;
sigemptyset(&block_set);
sigaddset(&block_set, SIGINT);

// Block SIGINT
if (sigprocmask(SIG_BLOCK, &block_set, &old_set) == -1) {
    perror("sigprocmask block");
    exit(EXIT_FAILURE);
}

// CRITICAL SECTION - SIGINT cannot interrupt this
update_global_data_structure();

// Restore previous signal mask (unblocks SIGINT if it was unblocked before)
if (sigprocmask(SIG_SETMASK, &old_set, NULL) == -1) {
    perror("sigprocmask restore");
    exit(EXIT_FAILURE);
}
```

### 11.5.4 Waiting for Signals: `sigsuspend` and `pause`

Sometimes a process needs to wait for a specific signal to arrive. `pause()` simply suspends the process until *any* signal is caught. However, it has a critical race condition: there's a gap between checking a flag set by a signal handler and calling `pause`, during which the signal might arrive, causing `pause` to wait indefinitely.

`sigsuspend` solves this race by atomically unblocking signals and waiting for one to arrive.

**Function Signature:**
```c
#include <signal.h>

int sigsuspend(const sigset_t *mask);
```

*   **`mask`:** The signal mask to use *temporarily* while waiting. The current mask is saved, replaced by `mask`, and the process is suspended until a signal is caught (whose handler returns). The original mask is then restored.

**Pattern for Waiting for a Signal:**
1.  Block the signal you want to wait for (using `sigprocmask(SIG_BLOCK)`).
2.  Set a global flag (e.g., `volatile sig_atomic_t got_signal = 0;`) that the signal handler sets to 1.
3.  In the main program, check the flag. If not set, call `sigsuspend` with a mask that *unblocks* the desired signal (and blocks others as needed). This atomically unblocks the signal and waits.

```c
volatile sig_atomic_t got_sigusr1 = 0;

void handle_sigusr1(int sig) {
    got_sigusr1 = 1;
}

int main() {
    // Setup handler
    struct sigaction sa;
    sa.sa_handler = handle_sigusr1;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    if (sigaction(SIGUSR1, &sa, NULL) == -1) {
        perror("sigaction");
        exit(EXIT_FAILURE);
    }

    // Block SIGUSR1 initially
    sigset_t block_set, orig_set;
    sigemptyset(&block_set);
    sigaddset(&block_set, SIGUSR1);
    if (sigprocmask(SIG_BLOCK, &block_set, &orig_set) == -1) {
        perror("sigprocmask");
        exit(EXIT_FAILURE);
    }

    printf("Waiting for SIGUSR1...\n");
    while (!got_sigusr1) {
        // Atomically unblock SIGUSR1 and wait for it
        sigsuspend(&orig_set); // orig_set blocks SIGUSR1? No, we want to unblock it!
        // Correction: We want a mask that UNBLOCKS SIGUSR1 relative to orig_set.
        // Better: Create a mask that is orig_set MINUS SIGUSR1.
        // Common practice: Block all signals *except* the one we want during wait.
        // But for simplicity in this example, assume orig_set is the mask we want
        // except we need SIGUSR1 unblocked. This sigsuspend call is flawed as written.
        // Proper way: Create a temporary mask = orig_set, then unblock SIGUSR1 in it.
    }

    // ... (Proper implementation involves creating a mask = orig_set, then sigdelset(&temp_mask, SIGUSR1))
}
```

*(Note: The example above highlights the complexity; a robust implementation requires careful mask manipulation. Often, higher-level synchronization like condition variables is preferable to `sigsuspend` for application logic.)*

## 11.6 Inter-Process Communication (IPC)

Processes often need to communicate and synchronize with each other. While files and signals provide limited IPC, dedicated mechanisms offer more structured and efficient communication. We cover three fundamental POSIX IPC mechanisms: Pipes, FIFOs (Named Pipes), and Message Queues.

### 11.6.1 Pipes: Unidirectional Communication

A **pipe** is a unidirectional data channel that can only be used between processes with a common ancestor (typically parent and child created via `fork`). It has a read end and a write end. Data written to the write end is buffered by the kernel and read from the read end in FIFO order.

**Creating a Pipe: `pipe` System Call**
```c
#include <unistd.h>

int pipe(int pipefd[2]);
```

*   **`pipefd`:** An array of two integers. `pipefd[0]` is the file descriptor for the **read end**. `pipefd[1]` is the file descriptor for the **write end**.
*   **Return Value:** `0` on success, `-1` on error.

**How Pipes Work with `fork`:**
1.  Parent calls `pipe()`, getting two FDs: `read_fd` and `write_fd`.
2.  Parent calls `fork()`.
3.  **Both parent and child have copies of both FDs.**
4.  Typically:
    *   Parent closes its copy of the **read end** (`read_fd`).
    *   Child closes its copy of the **write end** (`write_fd`).
    *   Now, parent writes to the pipe (via `write_fd`), child reads from it (via `read_fd`).
    *   *Or vice versa:* Parent reads, child writes.

**Critical Rules:**
*   **Close Unused Ends:** Always close the FDs you aren't using *immediately* after `fork`. Leaving unused write ends open prevents the read end from seeing EOF (since the kernel sees other potential writers).
*   **EOF Detection:** The read end returns `0` (indicating EOF) only when *all* write ends referencing the pipe are closed. If a process has a write FD open but isn't writing, the reader will block indefinitely waiting for data that never comes. Closing unused write FDs is essential for proper EOF signaling.
*   **Buffering:** Pipes have a limited kernel buffer (e.g., 64KB on Linux). Writes larger than `PIPE_BUF` (often 4096 bytes) are not atomic; multiple writers can interleave data. Reads/writes of `<= PIPE_BUF` bytes are atomic.

**Example: Parent Writes, Child Reads**
```c
int pipefd[2];
pid_t cpid;
char buf;

if (pipe(pipefd) == -1) {
    perror("pipe");
    exit(EXIT_FAILURE);
}

cpid = fork();
if (cpid == -1) {
    perror("fork");
    exit(EXIT_FAILURE);
}

if (cpid == 0) {    // Child reads from pipe
    close(pipefd[1]);          // Close unused write end
    while (read(pipefd[0], &buf, 1) > 0)
        write(STDOUT_FILENO, &buf, 1);
    write(STDOUT_FILENO, "\n", 1);
    close(pipefd[0]);
    _exit(EXIT_SUCCESS);
} else {            // Parent writes to pipe
    close(pipefd[0]);          // Close unused read end
    write(pipefd[1], "Hello, pipe!", 13);
    close(pipefd[1]);          // Reader will see EOF
    wait(NULL);                // Wait for child
    exit(EXIT_SUCCESS);
}
```

### 11.6.2 FIFOs (Named Pipes): Persistent Pipes

A **FIFO** (First-In-First-Out), or **named pipe**, is similar to an anonymous pipe but has a **pathname in the filesystem**. This allows unrelated processes (not just parent/child) to communicate, as long as they know the pathname.

**Creating a FIFO: `mkfifo` System Call**
```c
#include <sys/types.h>
#include <sys/stat.h>

int mkfifo(const char *pathname, mode_t mode);
```

*   **`pathname`:** The filesystem path for the FIFO (e.g., "/tmp/myfifo").
*   **`mode`:** Permissions (modified by umask), same as for `open(O_CREAT)`. Must include `S_IRUSR`, `S_IWUSR`, etc. (e.g., `0666`).
*   **Return Value:** `0` on success, `-1` on error (e.g., `EEXIST` if file already exists).

**Using a FIFO:**
1.  One process (the "server") creates the FIFO with `mkfifo`.
2.  Processes open the FIFO using `open(pathname, flags)`, just like a regular file.
    *   Opening for **read-only** (`O_RDONLY`) blocks until *some* process opens it for **write-only** (`O_WRONLY`).
    *   Opening for **write-only** (`O_WRONLY`) blocks until *some* process opens it for **read-only** (`O_RDONLY`).
    *   Use `O_NONBLOCK` to prevent blocking on open (but then `read`/`write` might fail with `EAGAIN`).
3.  Once both ends are open, `read` and `write` work identically to anonymous pipes.
4.  The FIFO pathname persists until explicitly removed with `unlink(pathname)` (like deleting a file). Closing the last FD referencing it does *not* delete the FIFO node.

**Example: Simple FIFO Client-Server**

*Server (creates FIFO, reads messages):*
```c
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

#define FIFO_PATH "/tmp/myfifo"

int main() {
    char buf[1024];
    int fd;

    // Create FIFO (ignore EEXIST if it already exists)
    if (mkfifo(FIFO_PATH, 0666) == -1 && errno != EEXIST) {
        perror("mkfifo");
        exit(EXIT_FAILURE);
    }

    printf("Server waiting for messages...\n");
    fd = open(FIFO_PATH, O_RDONLY); // Blocks until client opens for writing
    if (fd == -1) { perror("open"); exit(EXIT_FAILURE); }

    while (1) {
        ssize_t n = read(fd, buf, sizeof(buf));
        if (n <= 0) break; // Client closed, or error
        buf[n] = '\0';
        printf("Server received: %s", buf);
    }

    close(fd);
    unlink(FIFO_PATH); // Clean up FIFO node
    exit(EXIT_SUCCESS);
}
```

*Client (writes messages to FIFO):*
```c
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

#define FIFO_PATH "/tmp/myfifo"

int main(int argc, char *argv[]) {
    int fd;
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <message>\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    fd = open(FIFO_PATH, O_WRONLY); // Blocks until server opens for reading
    if (fd == -1) { perror("open"); exit(EXIT_FAILURE); }

    write(fd, argv[1], strlen(argv[1]));
    close(fd);
    exit(EXIT_SUCCESS);
}
```

### 11.6.3 POSIX Message Queues: Structured Messages

POSIX Message Queues (`mqueue`) provide a more structured IPC mechanism than pipes/FIFOs. Messages are discrete, typed (by priority), and buffered persistently by the kernel until read. They offer features like message prioritization and asynchronous notification.

**Key Functions:**
```c
#include <mqueue.h>

mqd_t mq_open(const char *name, int oflag);
mqd_t mq_open(const char *name, int oflag, mode_t mode, struct mq_attr *attr);
int mq_close(mqd_t mqdes);
int mq_unlink(const char *name);
int mq_send(mqd_t mqdes, const char *msg_ptr, size_t msg_len, unsigned msg_prio);
ssize_t mq_receive(mqd_t mqdes, char *msg_ptr, size_t msg_len, unsigned *msg_prio);
int mq_notify(mqd_t mqdes, const struct sigevent *notification);
int mq_setattr(mqd_t mqdes, const struct mq_attr *mqstat, struct mq_attr *omqstat);
```

**Creating/Opening a Queue: `mq_open`**
*   `name`: A name starting with `/` (e.g., "/myqueue").
*   `oflag`: `O_CREAT`, `O_EXCL`, `O_RDONLY`, `O_WRONLY`, `O_RDWR`.
*   `mode`: Permissions (if `O_CREAT` used).
*   `attr`: Optional pointer to `struct mq_attr` specifying queue attributes:
    *   `mq_flags`: `O_NONBLOCK` (non-blocking I/O).
    *   `mq_maxmsg`: Max messages in queue.
    *   `mq_msgsize`: Max size of a message.
    *   `mq_curmsgs`: Current number of messages (read-only).

**Sending and Receiving:**
*   `mq_send`: Writes a message (`msg_ptr`, length `msg_len`, priority `msg_prio`) to the queue. Higher priority numbers = higher priority. Blocks if queue is full (unless `O_NONBLOCK` set).
*   `mq_receive`: Reads the highest priority message (breaking ties by arrival time) into `msg_ptr` (buffer of size `msg_len`). Stores priority in `*msg_prio`. Blocks if queue is empty (unless `O_NONBLOCK` set).

**Notification: `mq_notify`**
Allows a process to request asynchronous notification (via signal or spawning a thread) when a message arrives on an empty queue. Only one process can be registered for notification per queue at a time.

**Example: Simple Message Queue Producer/Consumer**

*Consumer:*
```c
#include <mqueue.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>          // For O_* constants
#include <sys/stat.h>       // For mode constants

#define QUEUE_NAME "/test_queue"
#define MAX_SIZE 1024

int main() {
    mqd_t mq;
    char buffer[MAX_SIZE + 1];
    struct mq_attr attr;
    unsigned int prio;
    ssize_t bytes_read;

    // Set queue attributes
    attr.mq_flags = 0;
    attr.mq_maxmsg = 10;
    attr.mq_msgsize = MAX_SIZE;
    attr.mq_curmsgs = 0;

    // Create and open queue
    mq = mq_open(QUEUE_NAME, O_CREAT | O_RDONLY, 0644, &attr);
    if (mq == (mqd_t)-1) {
        perror("mq_open");
        exit(EXIT_FAILURE);
    }

    printf("Consumer waiting for messages...\n");
    while (1) {
        bytes_read = mq_receive(mq, buffer, MAX_SIZE, &prio);
        if (bytes_read == -1) {
            perror("mq_receive");
            break;
        }
        buffer[bytes_read] = '\0';
        printf("Received (prio %u): %s\n", prio, buffer);
    }

    mq_close(mq);
    mq_unlink(QUEUE_NAME); // Destroy queue
    exit(EXIT_SUCCESS);
}
```

*Producer:*
```c
#include <mqueue.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>

#define QUEUE_NAME "/test_queue"
#define MAX_SIZE 1024

int main(int argc, char *argv[]) {
    mqd_t mq;
    char buffer[MAX_SIZE];
    unsigned int prio = 1;

    if (argc != 2) {
        fprintf(stderr, "Usage: %s <message>\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    // Open existing queue
    mq = mq_open(QUEUE_NAME, O_WRONLY);
    if (mq == (mqd_t)-1) {
        perror("mq_open");
        exit(EXIT_FAILURE);
    }

    strncpy(buffer, argv[1], MAX_SIZE);
    if (mq_send(mq, buffer, strlen(buffer), prio) == -1) {
        perror("mq_send");
        exit(EXIT_FAILURE);
    }

    printf("Message sent.\n");
    mq_close(mq);
    exit(EXIT_SUCCESS);
}
```

**Advantages over Pipes:**
*   **Discrete Messages:** No risk of read/write intermingling; each `mq_send`/`mq_receive` is a complete message.
*   **Prioritization:** Messages can be ordered by importance.
*   **Kernel Persistence:** Messages remain in the queue until read, even if no reader is currently open (unlike pipes/FIFOs which require both ends open).
*   **Attributes:** Configurable message size and queue depth.
*   **Asynchronous Notification:** `mq_notify` enables event-driven designs.

**Disadvantages:**
*   **Complexity:** More complex API than pipes.
*   **Overhead:** Potentially higher overhead per message than pipes for very high-throughput scenarios.
*   **Portability:** While POSIX standard, implementation details and performance can vary; pipes are ubiquitous.

## 11.7 Network Programming: Sockets

Sockets are the primary API for network communication in Unix-like systems, providing an endpoint for sending and receiving data across networks. The Berkeley Sockets API (standardized by POSIX) is the foundation for virtually all networked applications (web servers, databases, chat apps, etc.).

### 11.7.1 Socket Basics and Addressing

A **socket** is an endpoint of communication, identified by a **socket descriptor** (an integer FD, similar to a file descriptor). Sockets are created using the `socket` system call.

**Creating a Socket: `socket`**
```c
#include <sys/socket.h>

int socket(int domain, int type, int protocol);
```

*   **`domain` (Address Family):** Specifies the communication domain.
    *   `AF_INET`: IPv4 Internet protocols.
    *   `AF_INET6`: IPv6 Internet protocols.
    *   `AF_UNIX` / `AF_LOCAL`: Local communication (same host, using filesystem paths or abstract names).
*   **`type`:** Specifies the communication semantics.
    *   `SOCK_STREAM`: Reliable, connection-oriented byte stream (TCP). Preserves message boundaries? No, it's a stream. Use application framing.
    *   `SOCK_DGRAM`: Connectionless, unreliable datagrams (UDP). Message boundaries preserved.
    *   `SOCK_RAW`: Raw network protocol access (rarely used directly by applications).
*   **`protocol`:** Usually `0`, meaning use the default protocol for the given domain/type (e.g., `IPPROTO_TCP` for `SOCK_STREAM`, `IPPROTO_UDP` for `SOCK_DGRAM`). Can specify explicitly if needed (e.g., `IPPROTO_ICMP` for raw sockets).
*   **Return Value:** Socket descriptor (non-negative integer) on success, `-1` on error.

**Network Addressing: `sockaddr` Structures**
Network addresses are represented by structures. The generic structure is `struct sockaddr`, but specific families use more detailed structures:

*   **IPv4 (`AF_INET`): `struct sockaddr_in`**
    ```c
    struct sockaddr_in {
        sa_family_t    sin_family; /* AF_INET */
        in_port_t      sin_port;   /* Port number (network byte order!) */
        struct in_addr sin_addr;   /* IPv4 address */
    };
    struct in_addr {
        uint32_t       s_addr;     /* IPv4 address (network byte order) */
    };
    ```
*   **IPv6 (`AF_INET6`): `struct sockaddr_in6`** (More complex, includes scope ID)
*   **Local (`AF_UNIX`): `struct sockaddr_un`**
    ```c
    struct sockaddr_un {
        sa_family_t sun_family;    /* AF_UNIX */
        char        sun_path[108]; /* Pathname */
    };
    ```

**Critical Concept: Byte Order**
Network protocols use **Big-Endian** byte order (Most Significant Byte first), also called **Network Byte Order**. Modern CPUs (x86, ARM) typically use **Little-Endian** (Least Significant Byte first). **All multi-byte values in network headers (IP addresses, port numbers) must be converted to/from network byte order.**

**Conversion Functions:**
```c
#include <arpa/inet.h>

uint32_t htonl(uint32_t hostlong);  // Host to Network Long (32-bit)
uint16_t htons(uint16_t hostshort);  // Host to Network Short (16-bit)
uint32_t ntohl(uint32_t netlong);   // Network to Host Long
uint16_t ntohs(uint16_t netshort);   // Network to Host Short
```

**Example (Setting IPv4 Address/Port):**
```c
struct sockaddr_in serv_addr;
memset(&serv_addr, 0, sizeof(serv_addr));
serv_addr.sin_family = AF_INET;
serv_addr.sin_port = htons(8080); // Convert port 8080 to network byte order
// INADDR_ANY = 0.0.0.0 (bind to all interfaces)
serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);
```

**String to Address Conversion:**
*   `inet_pton(domain, src, dst)`: Converts IPv4/IPv6 string (e.g., "192.168.1.1", "::1") to binary network address.
*   `inet_ntop(domain, src, dst, size)`: Converts binary network address to string.

### 11.7.2 Connection-Oriented Communication (TCP)

TCP (`SOCK_STREAM`) provides reliable, ordered, error-checked delivery of a byte stream between two endpoints. It requires establishing a connection before data transfer.

**Server Workflow:**
1.  **`socket()`:** Create a socket.
2.  **`bind()`:** Assign a local address (IP and port) to the socket.
3.  **`listen()`:** Mark the socket as a passive socket (listening for connections).
4.  **`accept()`:** Block, waiting for an incoming connection. Returns a *new* socket descriptor for the connected client.
5.  **`read()`/`write()`:** Communicate over the connected socket.
6.  **`close()`:** Close the connected socket (and eventually the listening socket).

**Client Workflow:**
1.  **`socket()`:** Create a socket.
2.  **`connect()`:** Actively connect to a server's address.
3.  **`read()`/`write()`:** Communicate over the connected socket.
4.  **`close()`:** Close the socket.

**Key System Calls:**

*   **`bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen)`**
    Assigns the address specified by `addr` to the socket `sockfd`. Crucial for servers to specify which interface/port to listen on. Fails if address is already in use (`EADDRINUSE`).

*   **`listen(int sockfd, int backlog)`**
    Marks `sockfd` as a passive socket that will be used to accept incoming connection requests via `accept()`. `backlog` specifies the maximum length of the queue of pending connections (connections that have completed the TCP handshake but haven't been accepted by the server yet). Typical values: 5-128.

*   **`accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen)`**
    Extracts the first connection request from the queue of pending connections for `sockfd`, creates a new connected socket, and returns a new file descriptor referring to that socket. The address of the connecting peer is stored in `addr` (if not NULL). **This is the socket used for actual communication.** The original `sockfd` remains open and listening for new connections.

*   **`connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen)`**
    Initiates a connection on `sockfd` to the address specified by `addr`. Blocks until the connection is established or fails (unless socket is non-blocking).

**Example: TCP Echo Server (Simplified)**
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8080
#define BUFFER_SIZE 1024

int main() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int addrlen = sizeof(address);
    char buffer[BUFFER_SIZE] = {0};
    char *hello = "Hello from server";

    // 1. Create socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    // 2. Bind socket to address
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    // 3. Listen for connections
    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port %d\n", PORT);

    // 4. Accept and handle connection
    if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
        perror("accept");
        exit(EXIT_FAILURE);
    }

    // 5. Read and echo
    read(new_socket, buffer, BUFFER_SIZE);
    printf("Received: %s\n", buffer);
    send(new_socket, hello, strlen(hello), 0);
    printf("Hello message sent\n");

    // 6. Close
    close(new_socket);
    close(server_fd);
    return 0;
}
```

**Example: TCP Echo Client (Simplified)**
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8080
#define SERVER_IP "127.0.0.1"
#define BUFFER_SIZE 1024

int main(int argc, char const *argv[]) {
    int sock = 0;
    struct sockaddr_in serv_addr;
    char *hello = "Hello from client";
    char buffer[BUFFER_SIZE] = {0};

    // 1. Create socket
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("socket creation");
        return -1;
    }

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT);

    // Convert IPv4 address from text
    if (inet_pton(AF_INET, SERVER_IP, &serv_addr.sin_addr) <= 0) {
        perror("invalid address");
        return -1;
    }

    // 2. Connect to server
    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        perror("connection failed");
        return -1;
    }

    // 3. Send and receive
    send(sock, hello, strlen(hello), 0);
    printf("Hello message sent\n");
    read(sock, buffer, BUFFER_SIZE);
    printf("Server: %s\n", buffer);

    // 4. Close
    close(sock);
    return 0;
}
```

**TCP Nuances:**
*   **Stream, Not Message:** TCP is a byte stream. `send`/`write` calls don't necessarily correspond to `recv`/`read` calls. You must implement **application framing** (e.g., length prefixes, delimiters) to delineate messages.
*   **Partial Reads/Writes:** Like file I/O, `read`/`recv` and `write`/`send` can transfer fewer bytes than requested. Always loop to handle partial transfers.
*   **Connection Termination:** Graceful shutdown uses `shutdown(sockfd, SHUT_WR)` (stop sending, but can still receive) followed by `close()`. Abrupt termination (e.g., process crash) causes the kernel to send `RST` packets.

### 11.7.3 Connectionless Communication (UDP)

UDP (`SOCK_DGRAM`) provides a connectionless, unreliable datagram service. Each `sendto` transmits a discrete message; each `recvfrom` receives one complete message. No connection setup/teardown is needed.

**Server Workflow:**
1.  **`socket()`:** Create UDP socket.
2.  **`bind()`:** Assign local address (IP/port) to socket (server must be bound to receive).
3.  **`recvfrom()`:** Block, waiting for a datagram. Returns data and sender's address.
4.  **`sendto()`:** Send reply datagram back to sender's address.
5.  **`close()`:** Close socket.

**Client Workflow:**
1.  **`socket()`:** Create UDP socket.
2.  **`sendto()`:** Send datagram to server's address (no `connect` needed).
3.  **`recvfrom()`:** Receive reply datagram (checks sender address).
4.  **`close()`:** Close socket.

*(Optional: Client can use `connect` on a UDP socket to a specific server address. This binds the socket so `send`/`recv` can be used without specifying the address each time, and filters incoming datagrams to only that address.)*

**Key System Calls:**

*   **`sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen)`**
    Sends a datagram from `sockfd` to the address specified by `dest_addr`.

*   **`recvfrom(int sockfd, void *buf, size_t len, int flags, struct sockaddr *src_addr, socklen_t *addrlen)`**
    Receives a datagram into `buf` and stores the sender's address in `src_addr`.

**Example: UDP Echo Server**
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8080
#define BUFFER_SIZE 1024

int main() {
    int sockfd;
    char buffer[BUFFER_SIZE];
    struct sockaddr_in servaddr, cliaddr;
    int n;
    socklen_t len;

    // Create socket
    if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("socket creation failed");
        exit(EXIT_FAILURE);
    }

    memset(&servaddr, 0, sizeof(servaddr));
    memset(&cliaddr, 0, sizeof(cliaddr));

    servaddr.sin_family    = AF_INET;
    servaddr.sin_addr.s_addr = INADDR_ANY;
    servaddr.sin_port = htons(PORT);

    // Bind
    if (bind(sockfd, (const struct sockaddr *)&servaddr, sizeof(servaddr)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    len = sizeof(cliaddr);
    n = recvfrom(sockfd, (char *)buffer, BUFFER_SIZE, MSG_WAITALL, (struct sockaddr *) &cliaddr, &len);
    buffer[n] = '\0';
    printf("Client: %s\n", buffer);
    sendto(sockfd, (const char *)buffer, n, MSG_CONFIRM, (const struct sockaddr *) &cliaddr, len);
    printf("Echo sent.\n");

    close(sockfd);
    return 0;
}
```

**Example: UDP Echo Client**
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8080
#define SERVER_IP "127.0.0.1"
#define BUFFER_SIZE 1024

int main() {
    int sockfd;
    char buffer[BUFFER_SIZE];
    struct sockaddr_in servaddr;

    // Create socket
    if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("socket creation failed");
        exit(EXIT_FAILURE);
    }

    memset(&servaddr, 0, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_port = htons(PORT);
    servaddr.sin_addr.s_addr = inet_addr(SERVER_IP);

    char *hello = "Hello from UDP Client";
    sendto(sockfd, (const char *)hello, strlen(hello), MSG_CONFIRM, (const struct sockaddr *) &servaddr, sizeof(servaddr));
    printf("Hello message sent.\n");

    int n = recvfrom(sockfd, (char *)buffer, BUFFER_SIZE, MSG_WAITALL, (struct sockaddr *) NULL, NULL);
    buffer[n] = '\0';
    printf("Server: %s\n", buffer);

    close(sockfd);
    return 0;
}
```

**UDP Characteristics:**
*   **Datagram Boundaries Preserved:** Each `sendto` corresponds to one `recvfrom`.
*   **Unreliable:** Datagrams can be lost, duplicated, or arrive out of order. Applications must handle this (e.g., sequence numbers, acknowledgments, timeouts).
*   **No Connection Overhead:** Lower latency than TCP for small, infrequent messages (no handshake).
*   **Broadcast/Multicast:** UDP supports sending to multiple recipients (broadcast to subnet, multicast to group).
*   **Stateless:** Server doesn't maintain connection state per client, enabling highly scalable services (e.g., DNS).

## 11.8 Memory Management System Calls

While `malloc`/`free` (from `<stdlib.h>`) manage the heap for most application memory needs, system programming sometimes requires direct interaction with the kernel for memory allocation, particularly for large blocks, specific alignment, or memory-mapped files. The primary system calls are `brk`/`sbrk` (historical) and `mmap`/`munmap` (modern, versatile).

### 11.8.1 `brk` and `sbrk`: The Program Break

The **program break** is the end of the process's uninitialized data segment (the `bss` segment). Memory between the start of the data segment and the program break is usable by the process. `brk` and `sbrk` adjust the program break, effectively growing or shrinking the heap.

**Function Signatures:**
```c
#include <unistd.h>

int brk(void *addr);
void *sbrk(intptr_t increment);
```

*   **`brk(addr)`:** Sets the program break to the location specified by `addr`. Returns `0` on success, `-1` on error. `addr` must be within the process's allowed address space.
*   **`sbrk(increment)`:** Increments the program break by `increment` bytes. Returns the *previous* break address on success, `(void *)-1` on error.
    *   `increment > 0`: Grow heap (request more memory).
    *   `increment < 0`: Shrink heap (return memory to system - rarely done effectively).
    *   `increment == 0`: Return current break address.

**How `malloc` Uses Them:**
The `malloc` implementation typically uses `sbrk` to request large chunks of memory from the kernel. It then manages these chunks internally, carving out smaller allocations for the application and coalescing freed blocks. Direct use of `brk`/`sbrk` is **strongly discouraged** for application code:
1.  **Non-Portable:** Behavior varies significantly between systems.
2.  **Inefficient:** `malloc`'s internal management is highly optimized.
3.  **Fragile:** Manual management is error-prone (e.g., failing to shrink properly).
4.  **Deprecated:** Modern systems favor `mmap` for large allocations.

**Example (Illustrative, Not Recommended for Apps):**
```c
void *p = sbrk(0); // Get current break
printf("Current break: %p\n", p);
void *new_p = sbrk(4096); // Request 4KB
if (new_p == (void *)-1) {
    perror("sbrk");
    exit(EXIT_FAILURE);
}
printf("New break: %p\n", new_p);
// new_p points to the start of the newly allocated memory
```

### 11.8.2 Memory-Mapped Files: `mmap` and `munmap`

`mmap` is a powerful system call that maps files (or devices) directly into a process's virtual address space. Once mapped, the file can be accessed like an array in memory, using standard pointer operations. This provides high-performance sequential and random access to files and enables efficient inter-process communication (when mapping a file with `MAP_SHARED`).

**Function Signature:**
```c
#include <sys/mman.h>

void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
```

*   **`addr`:** Suggested starting address for the mapping (usually `NULL` for kernel to choose).
*   **`length`:** Length of the mapping (in bytes).
*   **`prot`:** Desired memory protection (bitmask):
    *   `PROT_READ`: Pages can be read.
    *   `PROT_WRITE`: Pages can be written.
    *   `PROT_EXEC`: Pages can be executed.
    *   `PROT_NONE`: Pages cannot be accessed.
*   **`flags`:** Controls the nature of the mapping (bitmask):
    *   `MAP_SHARED`: Updates are visible to other processes mapping the same file and are carried through to the underlying file. (Required for IPC).
    *   `MAP_PRIVATE`: Updates are private to the process (copy-on-write); not visible to others and not carried to the file. (Useful for read-only access or private modifications).
    *   `MAP_ANONYMOUS` / `MAP_ANON`: Map anonymous memory (not backed by a file, like `malloc`). `fd` should be `-1`, `offset` `0`.
    *   `MAP_FIXED`: Place the mapping exactly at `addr` (dangerous, avoid).
*   **`fd`:** File descriptor of the file to map (must be open with compatible access mode). For `MAP_ANONYMOUS`, use `-1`.
*   **`offset`:** Offset within the file where the mapping starts (must be page-aligned).

**Return Value:**
*   On success: Pointer to the start of the mapped area.
*   On error: `(void *)-1`, `errno` set.

**Unmapping: `munmap`**
```c
int munmap(void *addr, size_t length);
```
Removes the mapping for the memory region starting at `addr` and extending `length` bytes. Further references to the region cause a segmentation fault.

**Common Use Cases:**

1.  **Efficient File I/O:**
    *   **Reading:** Map a file `MAP_SHARED` or `MAP_PRIVATE` with `PROT_READ`. Access file contents directly via pointers. Avoids `read`/`write` system calls and buffer copies.
    *   **Writing:** Map file `MAP_SHARED` with `PROT_READ|PROT_WRITE`. Modify memory; changes are automatically written back to the file (eventually, via kernel page cache). Use `msync()` for explicit flush to disk if needed.
    *   **Large Files:** More efficient than `read`/`lseek` for random access to very large files.

2.  **Inter-Process Communication (IPC):**
    *   Two or more processes map the *same file* (`MAP_SHARED`). Changes made by one process are immediately visible to others (after page cache flush). Requires careful synchronization (e.g., mutexes within the mapped region).

3.  **Anonymous Mappings (Heap Extension):**
    *   `mmap` with `MAP_ANONYMOUS` is how `malloc` often gets large chunks of memory (e.g., for very large allocations). More efficient than `sbrk` for large blocks as it doesn't require contiguous extension of the data segment.

**Example: Memory-Mapped File Read**
```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <file>\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    int fd = open(argv[1], O_RDONLY);
    if (fd == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    struct stat sb;
    if (fstat(fd, &sb) == -1) {
        perror("fstat");
        exit(EXIT_FAILURE);
    }

    // Map the entire file
    char *mapped = mmap(NULL, sb.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    if (mapped == MAP_FAILED) {
        perror("mmap");
        exit(EXIT_FAILURE);
    }

    // Access file contents via pointer
    printf("First 10 bytes: %.10s\n", mapped);

    // Unmap when done
    if (munmap(mapped, sb.st_size) == -1) {
        perror("munmap");
        // Not fatal, but resource leak
    }

    close(fd);
    exit(EXIT_SUCCESS);
}
```

**Example: Anonymous Mapped Memory (Like `malloc`)**
```c
size_t size = 1024 * 1024; // 1MB
int prot = PROT_READ | PROT_WRITE;
int flags = MAP_PRIVATE | MAP_ANONYMOUS;
void *ptr = mmap(NULL, size, prot, flags, -1, 0);
if (ptr == MAP_FAILED) {
    perror("mmap");
    exit(EXIT_FAILURE);
}

// Use the memory
strcpy(ptr, "Hello from mmap!");
printf("%s\n", (char *)ptr);

// Free the memory
if (munmap(ptr, size) == -1) {
    perror("munmap");
}
```

**Critical Considerations:**

1.  **Page Alignment:** `offset` must be a multiple of the system page size (`sysconf(_SC_PAGE_SIZE)`). `length` doesn't need to be, but the mapping will extend to the end of the last page.
2.  **Synchronization (`msync`):** For `MAP_SHARED` mappings, changes are written back to the file *eventually* by the kernel. Use `msync(addr, length, MS_SYNC)` to force an immediate, synchronous flush to disk (blocks until done), or `MS_ASYNC` for asynchronous flush request.
3.  **Error Handling:** `mmap` failures are common (e.g., `ENOMEM`, `EACCES`). Always check for `MAP_FAILED`.
4.  **File Truncation:** If a file is truncated *after* mapping, accessing pages beyond the new EOF causes `SIGBUS`.
5.  **Performance:** While often faster than `read`/`write` for large sequential access or random access, `mmap` has overhead for small files or single accesses. Profile.
6.  **IPC Synchronization:** When using `mmap` for IPC, you **must** use additional synchronization mechanisms (mutexes, semaphores) within the mapped region to prevent race conditions. The mapping itself does not provide synchronization.

## 11.9 Conclusion and Best Practices

System programming in C unlocks the full power of the operating system, enabling the development of efficient, robust, and deeply integrated software. This chapter has traversed the core mechanisms: file I/O at the system call level, process creation and management, signal handling, inter-process communication (pipes, FIFOs, message queues), network sockets, and low-level memory management. While the concepts are intricate, they form a coherent and logical framework governed by the kernel's abstractions.

**Key Takeaways for Robust System Programming:**

1.  **Error Handling is Non-Negotiable:** Check *every* system call return value. Understand and handle `errno` values correctly. Never ignore errors; they are critical diagnostics. Use `perror` or `strerror` for meaningful diagnostics during development and logging.
2.  **Master File Descriptors:** Understand their properties (per-process, inheritance, kernel state), the significance of standard FDs (0,1,2), and the critical importance of closing unused FDs (especially in child processes after `fork`).
3.  **Respect Concurrency:** Processes and signals introduce asynchrony. Design with race conditions in mind. Use blocking signals during critical sections (`sigprocmask`), employ async-signal-safe practices in handlers (set flags, don't call unsafe functions), and handle `EINTR` for interrupted system calls (often via `SA_RESTART`).
4.  **Process Lifecycle Management:** Always `wait` (or use `SIGCHLD` handling) for child processes to prevent zombies. Use `_exit` in children after failed `exec`, not `exit`.
5.  **IPC Mechanism Selection:** Choose the right tool:
    *   Pipes/FIFOs: Simple unidirectional byte streams (parent/child or named).
    *   Message Queues: Structured, prioritized messages with kernel persistence.
    *   Sockets: Network communication (TCP for reliable streams, UDP for datagrams).
    *   `mmap`: High-performance file access or shared memory IPC (with synchronization!).
6.  **Network Programming Nuances:** Understand TCP (stream, connection-oriented, requires framing) vs UDP (datagram, connectionless). Always convert addresses/ports to network byte order. Handle partial reads/writes. Implement timeouts for robustness.
7.  **Memory Mapping (`mmap`):** Prefer over `brk`/`sbrk`. Understand `MAP_SHARED` vs `MAP_PRIVATE`, synchronization needs for IPC, and the role of `msync`. Use for large files or IPC, but profile for small operations.
8.  **Consult Documentation Relentlessly:** System call behavior, error codes, and edge cases are precisely defined in the manual pages (`man 2 syscall`). Your understanding must be grounded in the authoritative source for your target platform (e.g., `man 2 open`, `man 7 signal`).

> **The Path Forward:** System programming is not merely about knowing function signatures; it is about understanding the underlying system model and the contract between user space and the kernel. The true mastery comes from writing, debugging, and refining code that interacts with these mechanisms. Start small: write a program that uses `pipe` and `fork` to implement a simple filter (like `grep`), create a daemon that logs to a file using `fork`/`setsid`/`dup2`, build a basic TCP echo server that handles multiple clients (using `fork` or `select`), or experiment with memory-mapped files for fast data processing. Encounter errors, debug them using `strace` (to trace system calls) and careful logging, and gradually build intuition for the system's behavior. This hands-on experience, combined with the foundational knowledge presented here, will transform you from a user of libraries into a developer who truly understands and harnesses the power of the operating system. The journey into system programming is challenging but immensely rewarding, forming the bedrock for expertise in performance-critical systems, operating system development, embedded systems, and high-scale distributed applications. Embrace the complexity, respect the kernel, and write code that is not only functional but also resilient and efficient.