# 9. Multithreading and Concurrency in C

## 9.1 The Need for Concurrency

### 9.1.1 Evolution of Computing Hardware

The landscape of computing hardware has undergone a fundamental transformation in recent decades. For much of computing history, performance gains came primarily from increasing processor clock speeds. However, physical limitations related to heat dissipation and power consumption have largely halted this trend. Instead, modern computing advances through **increased parallelism**—adding more processing cores rather than making single cores faster.

This shift from sequential to parallel processing represents a paradigm change that requires corresponding changes in software design. Where once programmers could rely on automatic performance improvements from faster clock speeds, they now must explicitly design software to leverage multiple processing units. This transition has made understanding and implementing concurrency no longer optional for performance-critical applications but essential for taking full advantage of modern hardware.

**Processor Evolution Timeline:**

| **Era**               | **Primary Performance Driver** | **Typical Core Count** | **Programming Model**     |
| :-------------------- | :----------------------------- | :--------------------- | :------------------------ |
| **1970s-1990s**       | **Increasing clock speed**     | **1**                  | **Single-threaded**       |
| **2000s**             | **Superscalar execution**      | **1**                  | **Single-threaded**       |
| **2005-2010**         | **Dual/Quad-core processors**  | **2-4**                | **Emerging multithreading** |
| **2010-Present**      | **Many-core architectures**    | **4-64+**              | **Essential multithreading** |
| **Specialized Hardware** | **GPU/TPU acceleration**     | **100s-1000s**         | **Massive parallelism**   |

This hardware evolution has profound implications for software development. Applications that fail to utilize multiple cores will not benefit from hardware advances and will increasingly fall behind in performance compared to properly parallelized alternatives. Concurrency is no longer a specialized topic reserved for high-performance computing but a fundamental skill required across the software development spectrum.

### 9.1.2 Concurrency vs. Parallelism

While often used interchangeably, **concurrency** and **parallelism** represent distinct but related concepts:

*   **Concurrency** refers to the composition of independently executing processes or threads. It's about dealing with multiple things at once—structuring programs to handle multiple tasks that may start, run, and complete in overlapping time periods, potentially on a single processor through time-slicing.

*   **Parallelism** refers to physically executing multiple computations simultaneously, typically requiring multiple processors or cores.

**Key Distinctions:**

| **Aspect**            | **Concurrency**                                | **Parallelism**                              |
| :-------------------- | :--------------------------------------------- | :------------------------------------------- |
| **Primary Goal**      | **Structure for multiple tasks**               | **Speed through simultaneous execution**     |
| **Hardware Requirement** | **Can work on single-core systems**          | **Requires multiple cores/processors**       |
| **Focus**             | **Task decomposition and coordination**        | **Computation distribution**                 |
| **Challenge**         | **Correctness (avoiding race conditions)**     | **Efficiency (load balancing)**              |
| **Programming Model** | **Event-driven, asynchronous**                 | **Data-parallel, task-parallel**             |

A program can be concurrent but not parallel (executing multiple tasks on a single core through time-slicing), parallel but not concurrent (performing the same operation on multiple data elements simultaneously), both, or neither. Effective modern programming often requires understanding and implementing both concepts.

### 9.1.3 Benefits and Challenges of Multithreading

Multithreading offers significant benefits but introduces complex challenges that require careful management.

**Benefits of Multithreading:**

*   **Improved Performance:** Utilizing multiple cores for CPU-bound tasks
*   **Responsiveness:** Keeping UI responsive while performing background operations
*   **Resource Sharing:** Threads within a process share memory and resources
*   **Economical:** Creating and managing threads is less resource-intensive than processes
*   **Simplified Design:** Some problems naturally map to concurrent solutions

**Challenges of Multithreading:**

*   **Synchronization Complexity:** Coordinating access to shared resources
*   **Race Conditions:** Unpredictable behavior due to timing dependencies
*   **Deadlocks:** Circular dependencies causing threads to wait indefinitely
*   **Non-determinism:** Behavior varies between runs, making bugs hard to reproduce
*   **Debugging Difficulty:** Concurrency bugs often manifest only under specific timing conditions
*   **Performance Overhead:** Synchronization primitives introduce computational costs

> **"Concurrency is not a feature; it's a fundamental constraint of modern computing. The question is no longer whether your program should be concurrent, but how gracefully it will fail when it isn't. Mastering concurrency transforms programmers from writing code that merely works to creating systems that scale with the hardware evolution."**

The transition to concurrent programming represents one of the most significant conceptual shifts in modern software development. Unlike sequential programming where execution follows a predictable path, concurrent programs must account for numerous possible execution sequences, making correctness harder to verify and debug. This complexity, however, is the price of harnessing the full power of modern computing hardware.

## 9.2 The C11 Threading API

### 9.2.1 Introduction to <threads.h>

C11 introduced the `<threads.h>` header as part of the standard library, providing a portable threading API. While not as widely adopted as POSIX threads (Pthreads), the C11 threading API offers the significant advantage of being standardized and available across compliant compilers without platform-specific dependencies.

**Key Components of <threads.h>:**

| **Component**         | **Purpose**                                      | **Header**      |
| :-------------------- | :----------------------------------------------- | :-------------- |
| **`thrd_t`**          | **Thread identifier type**                       | **<threads.h>** |
| **`mtx_t`**           | **Mutex type**                                   | **<threads.h>** |
| **`cnd_t`**           | **Condition variable type**                      | **<threads.h>** |
| **`tss_t`**           | **Thread-specific storage identifier**           | **<threads.h>** |
| **`once_flag`**       | **One-time initialization control**              | **<threads.h>** |
| **`call_once`**       | **Ensures function runs once**                   | **<threads.h>** |

**Basic Example:**
```c
#include <stdio.h>
#include <threads.h>

int thread_function(void *arg) {
    int id = *(int *)arg;
    printf("Thread %d is running\n", id);
    return id;
}

int main() {
    thrd_t thread;
    int arg = 42;
    
    // Create thread
    if (thrd_create(&thread, thread_function, &arg) != thrd_success) {
        fprintf(stderr, "Thread creation failed\n");
        return 1;
    }
    
    // Wait for thread to complete
    int result;
    if (thrd_join(thread, &result) == thrd_success) {
        printf("Thread returned %d\n", result);
    }
    
    return 0;
}
```

**Advantages of C11 Threading API:**
*   **Standardized:** Part of the C language specification
*   **Portable:** Works across compliant implementations
*   **Simpler:** More straightforward than Pthreads in many cases
*   **Integrated:** Works with other C11 features like atomics

**Limitations:**
*   **Less mature implementations:** Not all compilers fully support it
*   **Fewer features:** Less comprehensive than Pthreads
*   **Less adoption:** Many existing codebases use Pthreads or platform-specific APIs

### 9.2.2 Thread Creation and Management

The C11 threading API provides functions for creating, joining, and managing threads.

**Thread Creation:**
```c
int thrd_create(thrd_t *thr, thrd_start_t func, void *arg);
```
*   Creates a new thread that executes `func(arg)`
*   Returns `thrd_success` on success, error code otherwise
*   Thread function must return an `int` value

**Thread Joining:**
```c
int thrd_join(thrd_t thr, int *res);
```
*   Blocks until the specified thread terminates
*   If `res` is not NULL, stores the thread's return value
*   Required to prevent resource leaks (similar to `wait` for processes)

**Thread Detaching:**
```c
int thrd_detach(thrd_t thr);
```
*   Releases thread resources upon completion
*   Cannot join a detached thread
*   Useful for daemon-like threads that run indefinitely

**Current Thread Operations:**
```c
thrd_t thrd_current(void);  // Get current thread ID
int thrd_equal(thrd_t a, thrd_t b);  // Compare thread IDs
```

**Thread Yielding and Sleeping:**
```c
void thrd_yield(void);  // Yield to other threads
int thrd_sleep(const struct timespec *duration, 
              struct timespec *remaining);
```

**Implementation Example:**
```c
#include <stdio.h>
#include <threads.h>
#include <time.h>

int worker(void *arg) {
    int id = *(int *)arg;
    
    // Simulate work
    struct timespec ts = { .tv_sec = 0, .tv_nsec = 500000000 };
    thrd_sleep(&ts, NULL);
    
    printf("Worker %d completed\n", id);
    return id * 10;
}

int main() {
    #define NUM_THREADS 5
    thrd_t threads[NUM_THREADS];
    int thread_args[NUM_THREADS];
    int results[NUM_THREADS];
    
    // Create threads
    for (int i = 0; i < NUM_THREADS; i++) {
        thread_args[i] = i;
        if (thrd_create(&threads[i], worker, &thread_args[i]) != thrd_success) {
            fprintf(stderr, "Failed to create thread %d\n", i);
            // Handle error - perhaps join already created threads
        }
    }
    
    // Join threads and collect results
    for (int i = 0; i < NUM_THREADS; i++) {
        if (thrd_join(threads[i], &results[i]) == thrd_success) {
            printf("Thread %d returned %d\n", i, results[i]);
        }
    }
    
    return 0;
}
```

**Thread Attributes:**
Unlike Pthreads, C11 does not provide a direct way to set thread attributes like stack size or scheduling policy. This is one area where the API is less flexible than Pthreads.

### 9.2.3 Thread Synchronization Primitives

C11 provides basic synchronization primitives through `<threads.h>`.

#### Mutexes

Mutexes (mutual exclusion objects) protect shared data from concurrent access.

**Mutex Operations:**
```c
int mtx_init(mtx_t *mutex, int type);
int mtx_lock(mtx_t *mutex);
int mtx_trylock(mtx_t *mutex);
int mtx_unlock(mtx_t *mutex);
void mtx_destroy(mtx_t *mutex);
```

**Mutex Types:**
*   `mtx_plain`: Basic mutex
*   `mtx_recursive`: Can be locked multiple times by the same thread
*   `mtx_timed`: Supports timed locking (with `mtx_timedlock`)
*   Combine with `|` operator: `mtx_plain | mtx_recursive`

**Example:**
```c
#include <threads.h>

typedef struct {
    mtx_t lock;
    int value;
} Counter;

void counter_init(Counter *c) {
    mtx_init(&c->lock, mtx_plain);
    c->value = 0;
}

void counter_increment(Counter *c) {
    mtx_lock(&c->lock);
    c->value++;
    mtx_unlock(&c->lock);
}

int counter_get(Counter *c) {
    int val;
    mtx_lock(&c->lock);
    val = c->value;
    mtx_unlock(&c->lock);
    return val;
}
```

#### Condition Variables

Condition variables allow threads to wait for specific conditions.

**Condition Variable Operations:**
```c
int cnd_init(cnd_t *cond);
int cnd_wait(cnd_t *cond, mtx_t *mutex);
int cnd_timedwait(cnd_t *cond, mtx_t *mutex, 
                 const struct timespec *time_point);
int cnd_signal(cnd_t *cond);
int cnd_broadcast(cnd_t *cond);
void cnd_destroy(cnd_t *cond);
```

**Example:**
```c
typedef struct {
    mtx_t lock;
    cnd_t cond;
    int ready;
} Resource;

void resource_init(Resource *r) {
    mtx_init(&r->lock, mtx_plain);
    cnd_init(&r->cond);
    r->ready = 0;
}

void wait_for_resource(Resource *r) {
    mtx_lock(&r->lock);
    while (!r->ready) {
        cnd_wait(&r->cond, &r->lock);
    }
    mtx_unlock(&r->lock);
}

void signal_resource_ready(Resource *r) {
    mtx_lock(&r->lock);
    r->ready = 1;
    cnd_signal(&r->cond);
    mtx_unlock(&r->lock);
}
```

### 9.2.4 Thread-Specific Data

Thread-specific data (TSD) allows each thread to have its own instance of a variable.

**TSD Operations:**
```c
int tss_create(tss_t *key, tss_dtor_t destructor);
void *tss_get(tss_t key);
int tss_set(tss_t key, void *value);
void tss_delete(tss_t key);
```

**Example:**
```c
#include <threads.h>
#include <stdio.h>

static tss_t thread_id_key;

void destructor(void *value) {
    free(value);
}

int thread_func(void *arg) {
    char *id = malloc(20);
    snprintf(id, 20, "Thread-%d", *(int *)arg);
    
    tss_set(thread_id_key, id);
    
    char *my_id = tss_get(thread_id_key);
    printf("My ID: %s\n", my_id);
    
    return 0;
}

int main() {
    if (tss_create(&thread_id_key, destructor) != thrd_success) {
        fprintf(stderr, "TSS creation failed\n");
        return 1;
    }
    
    thrd_t t1, t2;
    int id1 = 1, id2 = 2;
    
    thrd_create(&t1, thread_func, &id1);
    thrd_create(&t2, thread_func, &id2);
    
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    
    tss_delete(thread_id_key);
    return 0;
}
```

**One-Time Initialization:**
```c
static once_flag flag = ONCE_FLAG_INIT;

void init_once(void) {
    // Initialize something that should happen only once
}

// In multiple threads:
call_once(&flag, init_once);
```

This ensures `init_once` is called exactly once, no matter how many threads call `call_once` with the same flag.

## 9.3 POSIX Threads (Pthreads)

### 9.3.1 Introduction to Pthreads

POSIX Threads (Pthreads) is the de facto standard threading API for Unix-like systems, offering a comprehensive and mature interface for multithreaded programming. While not part of the C standard, Pthreads is widely available across Linux, macOS, and other POSIX-compliant systems.

**Key Advantages of Pthreads:**
*   **Mature and stable:** Decades of real-world use
*   **Comprehensive:** Rich feature set for complex concurrency needs
*   **Widely supported:** Available on virtually all Unix-like systems
*   **Fine-grained control:** Detailed thread attributes and scheduling options

**Basic Structure:**
```c
#include <pthread.h>

void *thread_function(void *arg) {
    // Thread code
    return NULL;
}

int main() {
    pthread_t thread;
    int arg = 42;
    
    // Create thread
    if (pthread_create(&thread, NULL, thread_function, &arg) != 0) {
        perror("Thread creation failed");
        return 1;
    }
    
    // Wait for thread to complete
    void *result;
    if (pthread_join(thread, &result) == 0) {
        // Process result
    }
    
    return 0;
}
```

### 9.3.2 Thread Creation and Termination

#### Thread Creation

```c
int pthread_create(pthread_t *thread, 
                  const pthread_attr_t *attr,
                  void *(*start_routine) (void *),
                  void *arg);
```

*   `thread`: Output parameter for thread identifier
*   `attr`: Thread attributes (NULL for defaults)
*   `start_routine`: Function for thread to execute
*   `arg`: Argument to pass to start routine

**Thread Attributes:**
```c
pthread_attr_t attr;
pthread_attr_init(&attr);

// Set attributes
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
pthread_attr_setstacksize(&attr, 1024*1024); // 1MB stack

// Create thread with attributes
pthread_create(&thread, &attr, thread_func, &arg);

pthread_attr_destroy(&attr);
```

**Common Attribute Settings:**
*   **Detach State:** `PTHREAD_CREATE_JOINABLE` (default) or `PTHREAD_CREATE_DETACHED`
*   **Stack Size:** `pthread_attr_setstacksize()`
*   **Stack Address:** `pthread_attr_setstack()`
*   **Scheduling Policy:** `pthread_attr_setschedpolicy()`
*   **Scheduling Priority:** `pthread_attr_setschedparam()`

#### Thread Termination

**Joinable Threads:**
```c
void *result;
int rc = pthread_join(thread, &result);
```
*   Blocks until thread terminates
*   Retrieves thread's return value
*   Required to prevent resource leaks

**Detached Threads:**
```c
pthread_detach(thread);
```
*   Releases resources automatically on termination
*   Cannot be joined
*   Useful for long-running background tasks

**Thread Cancellation:**
```c
pthread_cancel(thread);  // Request cancellation
pthread_setcancelstate(); // Set cancellation state
pthread_setcanceltype();  // Set cancellation type
```

**Thread Cleanup Handlers:**
```c
void cleanup(void *arg) {
    // Cleanup resources
}

void *thread_func(void *arg) {
    pthread_cleanup_push(cleanup, arg);
    // Do work
    pthread_cleanup_pop(0); // 1 to execute cleanup now
    return NULL;
}
```

### 9.3.3 Mutexes and Condition Variables

#### Mutexes

Mutexes are the primary synchronization primitive for protecting shared data.

**Mutex Initialization:**
```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER; // Static init

// Or dynamic initialization
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, NULL);
```

**Mutex Operations:**
```c
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_trylock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

**Mutex Attributes:**
```c
pthread_mutexattr_t attr;
pthread_mutexattr_init(&attr);
pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE);
pthread_mutex_init(&mutex, &attr);
pthread_mutexattr_destroy(&attr);
```

**Mutex Types:**
*   `PTHREAD_MUTEX_NORMAL`: Basic mutex (deadlock on relock)
*   `PTHREAD_MUTEX_RECURSIVE`: Can be locked multiple times by same thread
*   `PTHREAD_MUTEX_ERRORCHECK`: Checks for common errors (double lock)
*   `PTHREAD_MUTEX_DEFAULT`: Implementation-defined (usually normal)

#### Condition Variables

Condition variables enable threads to wait for specific conditions.

**Condition Variable Initialization:**
```c
pthread_cond_t cond = PTHREAD_COND_INITIALIZER; // Static init

// Or dynamic initialization
pthread_cond_t cond;
pthread_cond_init(&cond, NULL);
```

**Condition Variable Operations:**
```c
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);
int pthread_cond_timedwait(pthread_cond_t *cond, pthread_mutex_t *mutex,
                          const struct timespec *abstime);
int pthread_cond_signal(pthread_cond_t *cond);
int pthread_cond_broadcast(pthread_cond_t *cond);
```

**Classic Condition Wait Pattern:**
```c
pthread_mutex_lock(&mutex);
while (condition_is_false) {
    pthread_cond_wait(&cond, &mutex);
}
// Condition is true - proceed
pthread_mutex_unlock(&mutex);
```

**Classic Condition Signal Pattern:**
```c
pthread_mutex_lock(&mutex);
// Change condition to true
pthread_cond_signal(&cond);
pthread_mutex_unlock(&mutex);
```

### 9.3.4 Advanced Synchronization Techniques

#### Read-Write Locks

Read-write locks allow multiple readers or one writer.

**Operations:**
```c
pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;

pthread_rwlock_rdlock(&rwlock);  // Acquire read lock
pthread_rwlock_wrlock(&rwlock);  // Acquire write lock
pthread_rwlock_unlock(&rwlock);  // Release lock
```

**Use Case:**
*   Read-heavy data structures
*   Configuration data that's read frequently but updated rarely
*   Cache implementations

#### Barriers

Barriers synchronize multiple threads at a specific point.

**Operations:**
```c
pthread_barrier_t barrier;
pthread_barrier_init(&barrier, NULL, num_threads);

// Each thread calls:
pthread_barrier_wait(&barrier);

pthread_barrier_destroy(&barrier);
```

**Use Case:**
*   Parallel algorithms with distinct phases
*   Starting multiple threads at exactly the same time
*   Synchronizing threads before proceeding to next stage

#### Spinlocks

Spinlocks are lightweight locks that busy-wait instead of yielding.

**Operations:**
```c
pthread_spinlock_t lock;
pthread_spin_init(&lock, 0); // 0=unshared between processes

pthread_spin_lock(&lock);
// Critical section
pthread_spin_unlock(&lock);

pthread_spin_destroy(&lock);
```

**Use Case:**
*   Very short critical sections
*   Situations where context switch overhead exceeds spin time
*   Real-time systems with strict timing requirements

#### Thread-Local Storage

Pthreads provides thread-specific data management.

**Operations:**
```c
pthread_key_t key;
pthread_key_create(&key, destructor);

void *value = malloc(sizeof(int));
pthread_setspecific(key, value);

void *my_value = pthread_getspecific(key);
```

**Use Case:**
*   Per-thread caches
*   Error handling state
*   Context objects that need to be accessible throughout call stack

## 9.4 Synchronization Primitives

### 9.4.1 Mutexes

Mutexes (mutual exclusion objects) are the fundamental building block for thread synchronization.

**Core Principles:**
*   Only one thread can hold a mutex at any time
*   Other threads attempting to lock the mutex will block
*   Ensures exclusive access to shared resources

**Implementation Considerations:**
*   **Lock Granularity:** Fine-grained locks (per data item) vs. coarse-grained (entire structure)
*   **Lock Ordering:** Consistent ordering prevents deadlocks
*   **Lock Duration:** Minimize time holding locks
*   **Error Checking:** Use error-checking mutexes during development

**Common Mutex Patterns:**

**Guarded Data Pattern:**
```c
typedef struct {
    pthread_mutex_t lock;
    int value;
} ProtectedData;

void update_data(ProtectedData *data, int new_value) {
    pthread_mutex_lock(&data->lock);
    data->value = new_value;
    pthread_mutex_unlock(&data->lock);
}

int get_data(const ProtectedData *data) {
    int val;
    pthread_mutex_lock(&data->lock);
    val = data->value;
    pthread_mutex_unlock(&data->lock);
    return val;
}
```

**Scoped Lock Pattern:**
```c
// Using a helper struct for RAII-style locking
typedef struct {
    pthread_mutex_t *mutex;
} MutexGuard;

MutexGuard lock_mutex(pthread_mutex_t *mutex) {
    pthread_mutex_lock(mutex);
    MutexGuard guard = {mutex};
    return guard;
}

void unlock_mutex(MutexGuard *guard) {
    pthread_mutex_unlock(guard->mutex);
}

// Usage
void critical_section(pthread_mutex_t *mutex) {
    MutexGuard guard = lock_mutex(mutex);
    // Critical section - mutex automatically unlocked when guard goes out of scope
    unlock_mutex(&guard);
}
```

**Try-Lock Pattern:**
```c
int try_update_resource(Resource *res, int new_value) {
    if (pthread_mutex_trylock(&res->lock) == 0) {
        res->value = new_value;
        pthread_mutex_unlock(&res->lock);
        return 1; // Success
    }
    return 0; // Resource busy
}
```

### 9.4.2 Semaphores

Semaphores are counters that control access to a resource with limited capacity.

**Binary vs. Counting Semaphores:**
*   **Binary Semaphore:** Counter with values 0 and 1 (equivalent to a mutex)
*   **Counting Semaphore:** Counter with values 0 to N

**POSIX Semaphore Operations:**
```c
#include <semaphore.h>

sem_t sem;
sem_init(&sem, 0, initial_value); // 0=thread-shared, initial_value

sem_wait(&sem);    // Decrement (block if 0)
sem_trywait(&sem); // Decrement (return error if 0)
sem_timedwait(&sem, &abs_time); // With timeout
sem_post(&sem);    // Increment
sem_destroy(&sem);
```

**Implementation Example:**
```c
#include <semaphore.h>
#include <pthread.h>

#define BUFFER_SIZE 10

typedef struct {
    int buffer[BUFFER_SIZE];
    int count;
    sem_t empty;
    sem_t full;
    pthread_mutex_t lock;
} BoundedBuffer;

void buffer_init(BoundedBuffer *bb) {
    sem_init(&bb->empty, 0, BUFFER_SIZE);
    sem_init(&bb->full, 0, 0);
    pthread_mutex_init(&bb->lock, NULL);
    bb->count = 0;
}

void buffer_put(BoundedBuffer *bb, int item) {
    sem_wait(&bb->empty);  // Wait for empty slot
    pthread_mutex_lock(&bb->lock);
    
    bb->buffer[bb->count++] = item;
    
    pthread_mutex_unlock(&bb->lock);
    sem_post(&bb->full);   // Signal item available
}

int buffer_get(BoundedBuffer *bb) {
    int item;
    
    sem_wait(&bb->full);   // Wait for item
    pthread_mutex_lock(&bb->lock);
    
    item = bb->buffer[--bb->count];
    
    pthread_mutex_unlock(&bb->lock);
    sem_post(&bb->empty);  // Signal empty slot
    
    return item;
}
```

**Common Semaphore Patterns:**

**Resource Pool Pattern:**
```c
#define MAX_CONNECTIONS 10
sem_t connection_semaphore;

void init_connections() {
    sem_init(&connection_semaphore, 0, MAX_CONNECTIONS);
}

Connection *get_connection() {
    sem_wait(&connection_semaphore);
    return allocate_connection();
}

void release_connection(Connection *conn) {
    free_connection(conn);
    sem_post(&connection_semaphore);
}
```

**Barrier Pattern:**
```c
sem_t barrier_sem;
int thread_count = 0;
pthread_mutex_t barrier_mutex = PTHREAD_MUTEX_INITIALIZER;

void barrier_init(int num_threads) {
    sem_init(&barrier_sem, 0, 0);
    thread_count = num_threads;
}

void barrier_wait() {
    static int count = 0;
    
    pthread_mutex_lock(&barrier_mutex);
    if (++count == thread_count) {
        // Last thread to arrive - release all
        for (int i = 0; i < thread_count - 1; i++) {
            sem_post(&barrier_sem);
        }
        count = 0;
        pthread_mutex_unlock(&barrier_mutex);
    } else {
        pthread_mutex_unlock(&barrier_mutex);
        sem_wait(&barrier_sem); // Wait for release
    }
}
```

### 9.4.3 Condition Variables

Condition variables allow threads to wait for specific conditions to become true.

**Core Principles:**
*   Always used with a mutex
*   Enable threads to sleep until a condition is met
*   Require a predicate (condition check) in a loop

**Correct Usage Pattern:**
```c
pthread_mutex_lock(&mutex);
while (condition_is_false) {
    pthread_cond_wait(&cond, &mutex);
}
// Condition is true - proceed
pthread_mutex_unlock(&mutex);
```

**Why a Loop is Necessary:**
*   **Spurious Wakeups:** Threads may wake without a signal
*   **Lost Wakeups:** Signal may happen before wait
*   **Multiple Waiters:** Signal may wake multiple threads

**Implementation Example:**
```c
typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t cond;
    int count;
    int max_count;
} Counter;

void counter_init(Counter *c, int max) {
    pthread_mutex_init(&c->lock, NULL);
    pthread_cond_init(&c->cond, NULL);
    c->count = 0;
    c->max_count = max;
}

void counter_wait_for_max(Counter *c) {
    pthread_mutex_lock(&c->lock);
    while (c->count < c->max_count) {
        pthread_cond_wait(&c->cond, &c->lock);
    }
    pthread_mutex_unlock(&c->lock);
}

void counter_increment(Counter *c) {
    pthread_mutex_lock(&c->lock);
    c->count++;
    if (c->count >= c->max_count) {
        pthread_cond_signal(&c->cond);
    }
    pthread_mutex_unlock(&c->lock);
}
```

**Common Condition Variable Patterns:**

**Producer-Consumer Pattern:**
```c
typedef struct {
    int buffer[10];
    int count;
    pthread_mutex_t lock;
    pthread_cond_t not_full;
    pthread_cond_t not_empty;
} PCBuffer;

void pc_init(PCBuffer *buf) {
    pthread_mutex_init(&buf->lock, NULL);
    pthread_cond_init(&buf->not_full, NULL);
    pthread_cond_init(&buf->not_empty, NULL);
    buf->count = 0;
}

void pc_put(PCBuffer *buf, int item) {
    pthread_mutex_lock(&buf->lock);
    while (buf->count == 10) {
        pthread_cond_wait(&buf->not_full, &buf->lock);
    }
    
    buf->buffer[buf->count++] = item;
    
    pthread_cond_signal(&buf->not_empty);
    pthread_mutex_unlock(&buf->lock);
}

int pc_get(PCBuffer *buf) {
    int item;
    
    pthread_mutex_lock(&buf->lock);
    while (buf->count == 0) {
        pthread_cond_wait(&buf->not_empty, &buf->lock);
    }
    
    item = buf->buffer[--buf->count];
    
    pthread_cond_signal(&buf->not_full);
    pthread_mutex_unlock(&buf->lock);
    
    return item;
}
```

**Thread Pool Pattern:**
```c
typedef struct {
    void (*function)(void *);
    void *argument;
} Task;

typedef struct {
    Task *tasks;
    int capacity;
    int head;
    int tail;
    int count;
    pthread_mutex_t lock;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
} TaskQueue;

void task_queue_init(TaskQueue *q, int capacity) {
    q->tasks = malloc(capacity * sizeof(Task));
    q->capacity = capacity;
    q->head = q->tail = q->count = 0;
    pthread_mutex_init(&q->lock, NULL);
    pthread_cond_init(&q->not_empty, NULL);
    pthread_cond_init(&q->not_full, NULL);
}

void task_queue_push(TaskQueue *q, Task task) {
    pthread_mutex_lock(&q->lock);
    while (q->count == q->capacity) {
        pthread_cond_wait(&q->not_full, &q->lock);
    }
    
    q->tasks[q->tail] = task;
    q->tail = (q->tail + 1) % q->capacity;
    q->count++;
    
    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->lock);
}

Task task_queue_pop(TaskQueue *q) {
    Task task;
    
    pthread_mutex_lock(&q->lock);
    while (q->count == 0) {
        pthread_cond_wait(&q->not_empty, &q->lock);
    }
    
    task = q->tasks[q->head];
    q->head = (q->head + 1) % q->capacity;
    q->count--;
    
    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->lock);
    
    return task;
}
```

### 9.4.4 Barriers

Barriers synchronize multiple threads at a specific point in execution.

**Core Principles:**
*   All threads must reach the barrier before any can proceed
*   Useful for dividing computation into distinct phases
*   Can be implemented with condition variables or using POSIX barrier API

**POSIX Barrier API:**
```c
pthread_barrier_t barrier;
pthread_barrier_init(&barrier, NULL, count);
pthread_barrier_wait(&barrier);
pthread_barrier_destroy(&barrier);
```

**Manual Implementation:**
```c
typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t cond;
    int count;
    int threshold;
    int generation;
} Barrier;

void barrier_init(Barrier *b, int threshold) {
    pthread_mutex_init(&b->lock, NULL);
    pthread_cond_init(&b->cond, NULL);
    b->threshold = threshold;
    b->count = 0;
    b->generation = 0;
}

void barrier_wait(Barrier *b) {
    pthread_mutex_lock(&b->lock);
    int gen = b->generation;
    
    if (++b->count == b->threshold) {
        b->count = 0;
        b->generation++;
        pthread_cond_broadcast(&b->cond);
    } else {
        while (gen == b->generation) {
            pthread_cond_wait(&b->cond, &b->lock);
        }
    }
    
    pthread_mutex_unlock(&b->lock);
}
```

**Use Cases:**
*   Parallel algorithms with distinct phases (e.g., parallel sorting)
*   Starting multiple threads at exactly the same time
*   Synchronizing threads before proceeding to next computation stage

**Example: Parallel Prefix Sum**
```c
#define N 1000
int data[N];
Barrier phase_barrier;

void *phase1(void *arg) {
    int id = *(int *)arg;
    // Process first half
    for (int i = id; i < N/2; i += NUM_THREADS) {
        data[i] += data[i-1];
    }
    barrier_wait(&phase_barrier);
    return NULL;
}

void *phase2(void *arg) {
    barrier_wait(&phase_barrier);
    int id = *(int *)arg;
    // Process second half with updated values from first half
    for (int i = N/2 + id; i < N; i += NUM_THREADS) {
        data[i] += data[i-1];
    }
    return NULL;
}
```

### 9.4.5 Read-Write Locks

Read-write locks allow multiple readers or one writer, optimizing for read-heavy workloads.

**Core Principles:**
*   Multiple threads can hold read lock simultaneously
*   Only one thread can hold write lock
*   Write lock excludes all read locks

**POSIX Read-Write Lock API:**
```c
pthread_rwlock_t rwlock;
pthread_rwlock_init(&rwlock, NULL);

pthread_rwlock_rdlock(&rwlock);  // Acquire read lock
pthread_rwlock_wrlock(&rwlock);  // Acquire write lock
pthread_rwlock_unlock(&rwlock);  // Release lock

pthread_rwlock_destroy(&rwlock);
```

**Implementation Example:**
```c
typedef struct {
    pthread_rwlock_t lock;
    char *config_data;
    size_t data_size;
} ConfigStore;

void config_init(ConfigStore *store) {
    pthread_rwlock_init(&store->lock, NULL);
    store->config_data = NULL;
    store->data_size = 0;
}

char *config_get(ConfigStore *store, size_t *size) {
    pthread_rwlock_rdlock(&store->lock);
    
    if (size) *size = store->data_size;
    char *copy = malloc(store->data_size);
    if (copy) {
        memcpy(copy, store->config_data, store->data_size);
    }
    
    pthread_rwlock_unlock(&store->lock);
    return copy;
}

int config_update(ConfigStore *store, const char *new_data, size_t size) {
    pthread_rwlock_wrlock(&store->lock);
    
    char *new_copy = realloc(store->config_data, size);
    if (!new_copy) {
        pthread_rwlock_unlock(&store->lock);
        return 0; // Allocation failed
    }
    
    memcpy(new_copy, new_data, size);
    store->config_data = new_copy;
    store->data_size = size;
    
    pthread_rwlock_unlock(&store->lock);
    return 1;
}
```

**Considerations:**
*   **Starvation:** Write lock may starve if readers are frequent
*   **Priority Inversion:** Low-priority writer waiting for high-priority readers
*   **Upgrade Deadlock:** Reader trying to upgrade to writer (deadlock risk)

**Advanced Pattern: Read-Write Lock with Upgrade:**
```c
int config_try_upgrade(ConfigStore *store) {
    // First drop read lock
    pthread_rwlock_unlock(&store->lock);
    
    // Try to acquire write lock
    if (pthread_rwlock_trywrlock(&store->lock) == 0) {
        return 1; // Successfully upgraded
    }
    
    // Failed - reacquire read lock
    pthread_rwlock_rdlock(&store->lock);
    return 0;
}
```

## 9.5 Common Concurrency Patterns

### 9.5.1 Producer-Consumer Pattern

The producer-consumer pattern is one of the most fundamental concurrency patterns, where one or more threads (producers) generate data and one or more threads (consumers) process it.

**Key Components:**
*   **Shared Buffer:** Fixed-size queue for data exchange
*   **Synchronization:** Mutexes and condition variables to coordinate access
*   **Termination Condition:** Mechanism to signal end of processing

**Implementation with Pthreads:**
```c
#include <pthread.h>
#include <semaphore.h>

#define BUFFER_SIZE 10

typedef struct {
    int buffer[BUFFER_SIZE];
    int head;
    int tail;
    int count;
    pthread_mutex_t lock;
    pthread_cond_t not_full;
    pthread_cond_t not_empty;
} BoundedBuffer;

void buffer_init(BoundedBuffer *bb) {
    pthread_mutex_init(&bb->lock, NULL);
    pthread_cond_init(&bb->not_full, NULL);
    pthread_cond_init(&bb->not_empty, NULL);
    bb->head = bb->tail = bb->count = 0;
}

void buffer_put(BoundedBuffer *bb, int item) {
    pthread_mutex_lock(&bb->lock);
    while (bb->count == BUFFER_SIZE) {
        pthread_cond_wait(&bb->not_full, &bb->lock);
    }
    
    bb->buffer[bb->tail] = item;
    bb->tail = (bb->tail + 1) % BUFFER_SIZE;
    bb->count++;
    
    pthread_cond_signal(&bb->not_empty);
    pthread_mutex_unlock(&bb->lock);
}

int buffer_get(BoundedBuffer *bb) {
    int item;
    
    pthread_mutex_lock(&bb->lock);
    while (bb->count == 0) {
        pthread_cond_wait(&bb->not_empty, &bb->lock);
    }
    
    item = bb->buffer[bb->head];
    bb->head = (bb->head + 1) % BUFFER_SIZE;
    bb->count--;
    
    pthread_cond_signal(&bb->not_full);
    pthread_mutex_unlock(&bb->lock);
    
    return item;
}

// Producer thread function
void *producer(void *arg) {
    BoundedBuffer *bb = (BoundedBuffer *)arg;
    
    for (int i = 0; i < 100; i++) {
        buffer_put(bb, i);
        printf("Produced: %d\n", i);
    }
    
    return NULL;
}

// Consumer thread function
void *consumer(void *arg) {
    BoundedBuffer *bb = (BoundedBuffer *)arg;
    
    for (int i = 0; i < 100; i++) {
        int item = buffer_get(bb);
        printf("Consumed: %d\n", item);
    }
    
    return NULL;
}

int main() {
    BoundedBuffer bb;
    buffer_init(&bb);
    
    pthread_t prod_thread, cons_thread;
    
    pthread_create(&prod_thread, NULL, producer, &bb);
    pthread_create(&cons_thread, NULL, consumer, &bb);
    
    pthread_join(prod_thread, NULL);
    pthread_join(cons_thread, NULL);
    
    return 0;
}
```

**Variations:**
*   **Multiple Producers/Multiple Consumers:** Requires careful synchronization
*   **Termination Signaling:** Special value or flag to indicate end of data
*   **Priority Queue:** Consumers process highest priority items first

**Real-World Applications:**
*   **Web Servers:** Request queue processed by worker threads
*   **GUI Applications:** Event queue processed by UI thread
*   **Data Processing Pipelines:** Stages connected by producer-consumer queues
*   **Logging Systems:** Log messages produced by various components, consumed by writer thread

### 9.5.2 Worker Thread Pool

A thread pool maintains a collection of worker threads that execute tasks from a shared queue.

**Key Components:**
*   **Task Queue:** Holds tasks waiting for execution
*   **Worker Threads:** Continuously pull tasks from queue
*   **Synchronization:** Ensures safe queue access
*   **Shutdown Mechanism:** Clean termination of pool

**Implementation:**
```c
#include <pthread.h>
#include <stdlib.h>

typedef struct Task {
    void (*function)(void *);
    void *argument;
    struct Task *next;
} Task;

typedef struct {
    Task *head;
    Task *tail;
    pthread_mutex_t lock;
    pthread_cond_t not_empty;
    int shutdown;
} TaskQueue;

typedef struct {
    pthread_t *threads;
    TaskQueue queue;
    int thread_count;
} ThreadPool;

void task_queue_init(TaskQueue *queue) {
    queue->head = queue->tail = NULL;
    pthread_mutex_init(&queue->lock, NULL);
    pthread_cond_init(&queue->not_empty, NULL);
    queue->shutdown = 0;
}

void task_queue_push(TaskQueue *queue, Task *task) {
    pthread_mutex_lock(&queue->lock);
    
    if (queue->tail) {
        queue->tail->next = task;
    } else {
        queue->head = task;
    }
    queue->tail = task;
    task->next = NULL;
    
    pthread_cond_signal(&queue->not_empty);
    pthread_mutex_unlock(&queue->lock);
}

Task *task_queue_pop(TaskQueue *queue) {
    pthread_mutex_lock(&queue->lock);
    
    while (queue->head == NULL && !queue->shutdown) {
        pthread_cond_wait(&queue->not_empty, &queue->lock);
    }
    
    Task *task = NULL;
    if (queue->head) {
        task = queue->head;
        queue->head = queue->head->next;
        if (!queue->head) {
            queue->tail = NULL;
        }
    }
    
    pthread_mutex_unlock(&queue->lock);
    return task;
}

void *worker_thread(void *arg) {
    ThreadPool *pool = (ThreadPool *)arg;
    
    while (1) {
        Task *task = task_queue_pop(&pool->queue);
        
        if (!task) {
            // Shutdown signal or error
            break;
        }
        
        // Execute task
        task->function(task->argument);
        
        // Clean up task
        free(task);
    }
    
    return NULL;
}

int thread_pool_init(ThreadPool *pool, int num_threads) {
    pool->thread_count = num_threads;
    pool->threads = malloc(num_threads * sizeof(pthread_t));
    if (!pool->threads) {
        return 0;
    }
    
    task_queue_init(&pool->queue);
    
    for (int i = 0; i < num_threads; i++) {
        if (pthread_create(&pool->threads[i], NULL, 
                          worker_thread, pool) != 0) {
            // Handle error
            return 0;
        }
    }
    
    return 1;
}

void thread_pool_submit(ThreadPool *pool, 
                       void (*function)(void *), void *arg) {
    Task *task = malloc(sizeof(Task));
    if (!task) return;
    
    task->function = function;
    task->argument = arg;
    
    task_queue_push(&pool->queue, task);
}

void thread_pool_shutdown(ThreadPool *pool) {
    pthread_mutex_lock(&pool->queue.lock);
    pool->queue.shutdown = 1;
    pthread_cond_broadcast(&pool->queue.not_empty);
    pthread_mutex_unlock(&pool->queue.lock);
    
    for (int i = 0; i < pool->thread_count; i++) {
        pthread_join(pool->threads[i], NULL);
    }
    
    free(pool->threads);
}
```

**Usage Example:**
```c
void task_function(void *arg) {
    int id = *(int *)arg;
    printf("Task %d executed by thread %ld\n", id, (long)pthread_self());
    free(arg);
}

int main() {
    ThreadPool pool;
    thread_pool_init(&pool, 4);
    
    // Submit tasks
    for (int i = 0; i < 20; i++) {
        int *id = malloc(sizeof(int));
        *id = i;
        thread_pool_submit(&pool, task_function, id);
    }
    
    // Allow time for tasks to complete
    sleep(1);
    
    thread_pool_shutdown(&pool);
    return 0;
}
```

**Advantages:**
*   **Reduced Overhead:** Avoids thread creation/destruction for each task
*   **Resource Control:** Limits maximum concurrency
*   **Load Balancing:** Distributes work across available threads
*   **Responsiveness:** Tasks begin processing immediately when submitted

**Tuning Parameters:**
*   **Thread Count:** Should match available hardware concurrency
*   **Queue Size:** Bounded vs. unbounded (risk of memory exhaustion)
*   **Task Granularity:** Balance between parallelism and overhead

### 9.5.3 Reader-Writer Pattern

The reader-writer pattern optimizes for scenarios where data is read frequently but written infrequently.

**Key Principles:**
*   Multiple readers can access data simultaneously
*   Writers require exclusive access
*   Prevents writer starvation with proper implementation

**Implementation with Read-Write Locks:**
```c
#include <pthread.h>

typedef struct {
    pthread_rwlock_t rwlock;
    int data;
} SharedData;

void shared_data_init(SharedData *sd) {
    pthread_rwlock_init(&sd->rwlock, NULL);
    sd->data = 0;
}

int shared_data_read(const SharedData *sd) {
    pthread_rwlock_rdlock(&sd->rwlock);
    int value = sd->data;
    pthread_rwlock_unlock(&sd->rwlock);
    return value;
}

void shared_data_write(SharedData *sd, int value) {
    pthread_rwlock_wrlock(&sd->rwlock);
    sd->data = value;
    pthread_rwlock_unlock(&sd->rwlock);
}
```

**Implementation with Mutexes and Condition Variables (for platforms without rwlocks):**
```c
typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t ok_to_read;
    pthread_cond_t ok_to_write;
    int active_readers;
    int active_writers;
    int waiting_readers;
    int waiting_writers;
} RWLock;

void rwlock_init(RWLock *rw) {
    pthread_mutex_init(&rw->lock, NULL);
    pthread_cond_init(&rw->ok_to_read, NULL);
    pthread_cond_init(&rw->ok_to_write, NULL);
    rw->active_readers = 0;
    rw->active_writers = 0;
    rw->waiting_readers = 0;
    rw->waiting_writers = 0;
}

void rwlock_rdlock(RWLock *rw) {
    pthread_mutex_lock(&rw->lock);
    
    rw->waiting_readers++;
    while (rw->active_writers > 0 || rw->waiting_writers > 0) {
        pthread_cond_wait(&rw->ok_to_read, &rw->lock);
    }
    rw->waiting_readers--;
    
    rw->active_readers++;
    pthread_mutex_unlock(&rw->lock);
}

void rwlock_rdunlock(RWLock *rw) {
    pthread_mutex_lock(&rw->lock);
    if (--rw->active_readers == 0 && rw->waiting_writers > 0) {
        pthread_cond_signal(&rw->ok_to_write);
    }
    pthread_mutex_unlock(&rw->lock);
}

void rwlock_wrlock(RWLock *rw) {
    pthread_mutex_lock(&rw->lock);
    
    rw->waiting_writers++;
    while (rw->active_readers > 0 || rw->active_writers > 0) {
        pthread_cond_wait(&rw->ok_to_write, &rw->lock);
    }
    rw->waiting_writers--;
    
    rw->active_writers++;
    pthread_mutex_unlock(&rw->lock);
}

void rwlock_wrunlock(RWLock *rw) {
    pthread_mutex_lock(&rw->lock);
    rw->active_writers--;
    
    if (rw->waiting_writers > 0) {
        pthread_cond_signal(&rw->ok_to_write);
    } else if (rw->waiting_readers > 0) {
        pthread_cond_broadcast(&rw->ok_to_read);
    }
    
    pthread_mutex_unlock(&rw->lock);
}
```

**Considerations:**
*   **Starvation:** Without care, writers may starve if readers are frequent
*   **Priority:** Some implementations allow prioritizing writers over readers
*   **Upgrade/Downgrade:** Handling transitions between read and write locks

**Real-World Applications:**
*   **Configuration Systems:** Read configuration frequently, update rarely
*   **Caching:** Read cache entries often, update infrequently
*   **Database Systems:** Read queries vs. write transactions
*   **File Systems:** Read operations vs. metadata updates

### 9.5.4 Parallel Algorithms

Many algorithms can be parallelized to leverage multiple cores.

#### Parallel For Loop

Dividing work across threads for independent iterations.

**Implementation:**
```c
#include <pthread.h>

typedef struct {
    void (*function)(int, void *);
    void *arg;
    int start;
    int end;
} ParallelArgs;

void *parallel_worker(void *arg) {
    ParallelArgs *pargs = (ParallelArgs *)arg;
    
    for (int i = pargs->start; i < pargs->end; i++) {
        pargs->function(i, pargs->arg);
    }
    
    return NULL;
}

void parallel_for(int num_threads, int start, int end,
                 void (*function)(int, void *), void *arg) {
    if (num_threads <= 0) {
        num_threads = sysconf(_SC_NPROCESSORS_ONLN);
    }
    
    int chunk_size = (end - start + num_threads - 1) / num_threads;
    pthread_t threads[num_threads];
    ParallelArgs args[num_threads];
    
    for (int i = 0; i < num_threads; i++) {
        args[i].function = function;
        args[i].arg = arg;
        args[i].start = start + i * chunk_size;
        args[i].end = (i == num_threads - 1) ? end : 
                     start + (i + 1) * chunk_size;
        
        if (args[i].start < end) {
            pthread_create(&threads[i], NULL, parallel_worker, &args[i]);
        }
    }
    
    for (int i = 0; i < num_threads; i++) {
        if (args[i].start < end) {
            pthread_join(threads[i], NULL);
        }
    }
}

// Example usage: Parallel vector addition
void add_vectors(int i, void *arg) {
    double *a = ((double **)arg)[0];
    double *b = ((double **)arg)[1];
    double *c = ((double **)arg)[2];
    c[i] = a[i] + b[i];
}

int main() {
    #define N 1000000
    double a[N], b[N], c[N];
    
    // Initialize vectors...
    
    double *args[] = {a, b, c};
    parallel_for(0, 0, N, add_vectors, args);
    
    return 0;
}
```

#### Parallel Merge Sort

Dividing and conquering with parallel recursion.

```c
#include <pthread.h>

typedef struct {
    int *array;
    int left;
    int right;
} SortArgs;

void merge(int *array, int left, int mid, int right) {
    // Standard merge operation
}

void *merge_sort_thread(void *arg) {
    SortArgs *sargs = (SortArgs *)arg;
    merge_sort(sargs->array, sargs->left, sargs->right);
    return NULL;
}

void merge_sort(int *array, int left, int right) {
    if (left >= right) return;
    
    int mid = left + (right - left) / 2;
    
    // Sort left half in current thread
    merge_sort(array, left, mid);
    
    // Sort right half in new thread
    SortArgs args = {array, mid + 1, right};
    pthread_t thread;
    
    if (pthread_create(&thread, NULL, merge_sort_thread, &args) == 0) {
        pthread_join(thread, NULL);
    } else {
        // Fallback to sequential if thread creation fails
        merge_sort(array, mid + 1, right);
    }
    
    // Merge the two halves
    merge(array, left, mid, right);
}
```

#### Parallel Prefix Sum

Calculating cumulative sums in parallel.

```c
void parallel_prefix_sum(int *array, int n, int num_threads) {
    // Step 1: Divide into blocks and compute local sums
    int block_size = (n + num_threads - 1) / num_threads;
    int *block_sums = malloc(num_threads * sizeof(int));
    pthread_t threads[num_threads];
    
    // Compute local prefix sums and block sums
    for (int i = 0; i < num_threads; i++) {
        int start = i * block_size;
        int end = (i == num_threads - 1) ? n : (i + 1) * block_size;
        if (start >= n) continue;
        
        // Compute local prefix sum
        for (int j = start + 1; j < end; j++) {
            array[j] += array[j - 1];
        }
        
        // Store block sum
        block_sums[i] = array[end - 1];
    }
    
    // Step 2: Compute prefix sum of block sums
    for (int i = 1; i < num_threads; i++) {
        block_sums[i] += block_sums[i - 1];
    }
    
    // Step 3: Adjust local sums with block prefix
    for (int i = 1; i < num_threads; i++) {
        int start = i * block_size;
        int end = (i == num_threads - 1) ? n : (i + 1) * block_size;
        int offset = block_sums[i - 1];
        
        for (int j = start; j < end; j++) {
            array[j] += offset;
        }
    }
    
    free(block_sums);
}
```

## 9.6 Concurrency Pitfalls

### 9.6.1 Race Conditions

Race conditions occur when the behavior of a program depends on the relative timing of events, particularly the interleaving of operations from multiple threads.

**Classic Example: Counter Race Condition**
```c
int counter = 0;

void increment_counter() {
    int temp = counter;
    temp++;
    counter = temp;
}
```

If two threads call `increment_counter()` concurrently, the final value might be 1 instead of 2, depending on the interleaving of operations.

**Memory Model Perspective:**
Without proper synchronization, the C memory model makes no guarantees about the visibility of memory operations between threads. Each thread might have its own cached view of memory.

**Detection Strategies:**
*   **Code Review:** Look for shared data without synchronization
*   **Static Analysis:** Tools that detect potential race conditions
*   **Dynamic Analysis:** Tools like ThreadSanitizer that detect races at runtime
*   **Stress Testing:** Run with many threads and iterations

**Prevention Strategies:**
*   **Mutex Protection:** Guard shared data with mutexes
*   **Atomic Operations:** Use atomic types for simple operations
*   **Immutable Data:** Design data structures to be immutable
*   **Thread Confinement:** Restrict data to a single thread

**Example Fix with Mutex:**
```c
int counter = 0;
pthread_mutex_t counter_mutex = PTHREAD_MUTEX_INITIALIZER;

void increment_counter() {
    pthread_mutex_lock(&counter_mutex);
    counter++;
    pthread_mutex_unlock(&counter_mutex);
}
```

### 9.6.2 Deadlocks

Deadlocks occur when two or more threads are blocked forever, each waiting for a resource held by another.

**Necessary Conditions (Coffman Conditions):**
1.  **Mutual Exclusion:** Resources cannot be shared
2.  **Hold and Wait:** Threads hold resources while waiting for others
3.  **No Preemption:** Resources cannot be forcibly taken
4.  **Circular Wait:** Circular chain of threads waiting for resources

**Classic Dining Philosophers Problem:**
```c
#define NUM_PHILOSOPHERS 5
pthread_mutex_t forks[NUM_PHILOSOPHERS];

void *philosopher(void *arg) {
    int id = *(int *)arg;
    int left = id;
    int right = (id + 1) % NUM_PHILOSOPHERS;
    
    while (1) {
        // Try to pick up both forks
        pthread_mutex_lock(&forks[left]);
        pthread_mutex_lock(&forks[right]);
        
        // Eat...
        
        pthread_mutex_unlock(&forks[right]);
        pthread_mutex_unlock(&forks[left]);
        
        // Think...
    }
    
    return NULL;
}
```

This can deadlock if all philosophers pick up their left fork simultaneously.

**Prevention Strategies:**

**1. Resource Ordering:**
```c
void *philosopher_fixed(void *arg) {
    int id = *(int *)arg;
    int first = (id < (id + 1) % NUM_PHILOSOPHERS) ? id : (id + 1) % NUM_PHILOSOPHERS;
    int second = (id < (id + 1) % NUM_PHILOSOPHERS) ? (id + 1) % NUM_PHILOSOPHERS : id;
    
    pthread_mutex_lock(&forks[first]);
    pthread_mutex_lock(&forks[second]);
    
    // Eat...
    
    pthread_mutex_unlock(&forks[second]);
    pthread_mutex_unlock(&forks[first]);
    
    return NULL;
}
```

**2. Try-Lock Approach:**
```c
void *philosopher_trylock(void *arg) {
    int id = *(int *)arg;
    int left = id;
    int right = (id + 1) % NUM_PHILOSOPHERS;
    
    while (1) {
        pthread_mutex_lock(&forks[left]);
        
        if (pthread_mutex_trylock(&forks[right]) == 0) {
            // Eat...
            pthread_mutex_unlock(&forks[right]);
        } else {
            // Release left fork and try again
            pthread_mutex_unlock(&forks[left]);
            sched_yield(); // Give other threads a chance
            continue;
        }
        
        pthread_mutex_unlock(&forks[left]);
        // Think...
    }
    
    return NULL;
}
```

**3. Limit Concurrent Philosophers:**
```c
sem_t table;
#define MAX_EATING 4  // One less than total philosophers

void *philosopher_semaphore(void *arg) {
    int id = *(int *)arg;
    int left = id;
    int right = (id + 1) % NUM_PHILOSOPHERS;
    
    while (1) {
        sem_wait(&table);  // Acquire seat at table
        
        pthread_mutex_lock(&forks[left]);
        pthread_mutex_lock(&forks[right]);
        
        // Eat...
        
        pthread_mutex_unlock(&forks[right]);
        pthread_mutex_unlock(&forks[left]);
        
        sem_post(&table);  // Release seat
        
        // Think...
    }
    
    return NULL;
}
```

### 9.6.3 Livelocks

Livelocks occur when threads are not blocked but are unable to make progress due to repeated interactions.

**Example: Polite Threads**
```c
int flag1 = 0, flag2 = 0;

void *thread1(void *arg) {
    while (1) {
        flag1 = 1;
        while (flag2) {
            flag1 = 0;
            // Wait a bit
            flag1 = 1;
        }
        // Critical section
        flag1 = 0;
    }
    return NULL;
}

void *thread2(void *arg) {
    while (1) {
        flag2 = 1;
        while (flag1) {
            flag2 = 0;
            // Wait a bit
            flag2 = 1;
        }
        // Critical section
        flag2 = 0;
    }
    return NULL;
}
```

If both threads set their flags at the same time, they may repeatedly reset and retry without making progress.

**Prevention Strategies:**
*   **Random Backoff:** Introduce randomness in retry timing
*   **Priority Assignment:** Give one thread priority over others
*   **Avoid Busy Waiting:** Use condition variables instead of polling

**Fixed Version with Random Backoff:**
```c
void *thread1_fixed(void *arg) {
    while (1) {
        flag1 = 1;
        while (flag2) {
            flag1 = 0;
            usleep(rand() % 1000);  // Random delay
            flag1 = 1;
        }
        // Critical section
        flag1 = 0;
    }
    return NULL;
}
```

### 9.6.4 Starvation

Starvation occurs when a thread is perpetually denied necessary resources.

**Example: Unfair Mutex**
```c
pthread_mutex_t unfair_mutex;
int turn = 0;
int thread_count = 0;

void lock_unfair() {
    int my_turn = __sync_fetch_and_add(&thread_count, 1);
    
    while (turn != my_turn) {
        // Busy wait
    }
}

void unlock_unfair() {
    turn++;
}
```

If threads continuously join the queue, earlier threads might never get the mutex.

**Prevention Strategies:**
*   **Fair Scheduling:** Use FIFO queues for lock acquisition
*   **Priority Aging:** Increase priority of waiting threads over time
*   **Avoid Priority Inversion:** Use priority inheritance protocols

**Fair Mutex Implementation:**
```c
typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t cond;
    int *queue;
    int capacity;
    int head;
    int tail;
} FairMutex;

void fair_mutex_init(FairMutex *fm, int capacity) {
    pthread_mutex_init(&fm->lock, NULL);
    pthread_cond_init(&fm->cond, NULL);
    fm->queue = malloc(capacity * sizeof(int));
    fm->capacity = capacity;
    fm->head = fm->tail = 0;
}

int fair_mutex_lock(FairMutex *fm) {
    pthread_mutex_lock(&fm->lock);
    
    int ticket = fm->tail;
    if ((fm->tail + 1) % fm->capacity == fm->head) {
        pthread_mutex_unlock(&fm->lock);
        return 0; // Queue full
    }
    
    fm->queue[fm->tail] = ticket;
    fm->tail = (fm->tail + 1) % fm->capacity;
    
    while (fm->head != ticket) {
        pthread_cond_wait(&fm->cond, &fm->lock);
    }
    
    pthread_mutex_unlock(&fm->lock);
    return 1;
}

void fair_mutex_unlock(FairMutex *fm) {
    pthread_mutex_lock(&fm->lock);
    fm->head = (fm->head + 1) % fm->capacity;
    pthread_cond_signal(&fm->cond);
    pthread_mutex_unlock(&fm->lock);
}
```

### 9.6.5 Memory Visibility Issues

Memory visibility issues occur when changes made by one thread are not immediately visible to others.

**Example: Non-Visible Update**
```c
int ready = 0;
int data = 0;

void *producer(void *arg) {
    data = 42;      // Write data
    ready = 1;      // Signal data is ready
    return NULL;
}

void *consumer(void *arg) {
    while (!ready) {
        // Busy wait
    }
    printf("Data: %d\n", data);  // Might print 0!
    return NULL;
}
```

Due to compiler optimizations and CPU caching, the consumer might see `ready` as 1 but `data` as 0.

**Memory Model Concepts:**

| **Term**                | **Description**                                      |
| :---------------------- | :--------------------------------------------------- |
| **Happens-Before**      | **Guarantees visibility of memory operations**       |
| **Memory Barrier**      | **Prevents reordering of memory operations**         |
| **Acquire Operation**   | **Ensures subsequent reads see previous writes**     |
| **Release Operation**   | **Ensures previous writes are visible after**        |
| **Sequential Consistency** | **Simplest model (all threads see same order)**    |

**Solutions:**

**1. Mutex Protection:**
```c
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *producer(void *arg) {
    pthread_mutex_lock(&lock);
    data = 42;
    pthread_mutex_unlock(&lock);
    ready = 1;
    return NULL;
}

void *consumer(void *arg) {
    while (!ready) {
        // Busy wait
    }
    pthread_mutex_lock(&lock);
    printf("Data: %d\n", data);
    pthread_mutex_unlock(&lock);
    return NULL;
}
```

**2. Atomic Operations (C11):**
```c
#include <stdatomic.h>

atomic_int ready = 0;
int data = 0;

void *producer(void *arg) {
    data = 42;
    atomic_store(&ready, 1);
    return NULL;
}

void *consumer(void *arg) {
    while (atomic_load(&ready) == 0) {
        // Busy wait
    }
    printf("Data: %d\n", data);
    return NULL;
}
```

**3. Memory Barriers:**
```c
#include <stdatomic.h>

int ready = 0;
int data = 0;

void *producer(void *arg) {
    data = 42;
    atomic_thread_fence(memory_order_release);
    ready = 1;
    return NULL;
}

void *consumer(void *arg) {
    while (!ready) {
        // Busy wait
    }
    atomic_thread_fence(memory_order_acquire);
    printf("Data: %d\n", data);
    return NULL;
}
```

> **"Concurrency bugs are the quantum particles of programming—they only manifest when you're not looking for them. A program that works perfectly in testing may fail catastrophically in production due to subtle timing differences. True mastery of concurrency requires not just understanding the tools, but developing an intuition for the invisible forces that govern thread interactions in the memory hierarchy."**

## 9.7 Debugging and Testing Concurrent Programs

### 9.7.1 Tools for Concurrency Debugging

#### ThreadSanitizer

ThreadSanitizer (TSan) is a dynamic analysis tool that detects data races.

**Usage:**
```bash
gcc -fsanitize=thread -g program.c -o program
./program
```

**Example Output:**
```
WARNING: ThreadSanitizer: data race (pid=12345)
  Write of size 4 at 0x7d8000000000 by thread T1:
    #0 increment_counter counter.c:7 (program+0x4c8b5d)
    #1 thread_function thread.c:12 (program+0x4d3f8a)

  Previous read of size 4 at 0x7d8000000000 by thread T2:
    #0 increment_counter counter.c:6 (program+0x4c8b5d)
    #1 thread_function thread.c:12 (program+0x4d3f8a)

  Location is global 'counter' of size 4 at 0x7d8000000000 (program+0x000000010000)
```

**Advantages:**
*   **Low overhead:** ~5-15x slowdown (vs 10-50x for Valgrind)
*   **Precise reports:** Shows stack traces for both threads
*   **Works with real applications**

#### Helgrind (Valgrind)

Helgrind is a Valgrind tool for detecting synchronization errors.

**Usage:**
```bash
valgrind --tool=helgrind ./program
```

**Example Output:**
```
==12345== Possible data race writing variable at 0x100020
==12345==    at 0x4005B6: increment_counter (counter.c:7)
==12345==    by 0x4005A7: thread_function (thread.c:12)
==12345== 
==12345== This conflicts with a previous read
==12345==    at 0x4005B0: increment_counter (counter.c:6)
==12345==    by 0x4005A7: thread_function (thread.c:12)
```

**Advantages:**
*   **Comprehensive:** Detects various synchronization issues
*   **Detailed:** Shows memory access patterns
*   **No code changes:** Works with unmodified binaries

#### GDB Thread Debugging

GDB provides powerful thread debugging capabilities.

**Key Commands:**
```bash
(gdb) info threads        # List all threads
(gdb) thread 2            # Switch to thread 2
(gdb) bt                  # Backtrace for current thread
(gdb) thread apply all bt # Backtrace for all threads
(gdb) set scheduler-locking on # Lock other threads during stepping
```

**Example Session:**
```
(gdb) run
[New Thread 0x7ffff7fd9700 (LWP 12346)]
[New Thread 0x7ffff75d8700 (LWP 12347)]

Thread 3 "program" hit breakpoint 1, producer (arg=0x0) at producer.c:10
10      data = 42;

(gdb) info threads
  Id   Target Id         Frame 
* 3    Thread 0x7ffff75d8700 (LWP 12347) "program" producer (arg=0x0) at producer.c:10
  2    Thread 0x7ffff7fd9700 (LWP 12346) "program" consumer (arg=0x0) at consumer.c:8
  1    Thread 0x7ffff7fe0740 (LWP 12345) "program" main (argc=1, argv=0x7fffffffe0d8) at main.c:15

(gdb) thread 2
[Switching to thread 2 (Thread 0x7ffff7fd9700 (LWP 12346))]
#0  consumer (arg=0x0) at consumer.c:8
8       while (!ready) {

(gdb) print ready
$1 = 0
```

### 9.7.2 Testing Strategies

#### Deterministic Testing

Force specific thread interleavings for reproducible testing.

**Thread Scheduler Control:**
```c
#ifdef TESTING
    #define SCHEDULE_POINT sched_yield()
#else
    #define SCHEDULE_POINT
#endif

void critical_section() {
    // ...
    SCHEDULE_POINT;  // Force context switch at specific point
    // ...
}
```

**Testing Framework Example:**
```c
#include <pthread.h>
#include <unistd.h>

typedef struct {
    int (*test_case)(void);
    const char *name;
} TestCase;

int test_counter_increment() {
    // Setup
    pthread_t t1, t2;
    int result1, result2;
    
    // Run test with controlled scheduling
    pthread_create(&t1, NULL, increment_thread, &result1);
    sched_yield();  // Force t1 to run first
    pthread_create(&t2, NULL, increment_thread, &result2);
    
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    
    return (counter == 2);
}

int run_test(TestCase *test) {
    printf("Running test: %s...", test->name);
    int result = test->test_case();
    printf("%s\n", result ? "PASS" : "FAIL");
    return result;
}

int main() {
    TestCase tests[] = {
        {test_counter_increment, "Counter increment"},
        // Add more tests...
        {NULL, NULL}
    };
    
    int failures = 0;
    for (int i = 0; tests[i].test_case; i++) {
        if (!run_test(&tests[i])) {
            failures++;
        }
    }
    
    return failures ? 1 : 0;
}
```

#### Fuzz Testing

Randomly vary thread execution to uncover race conditions.

**Fuzz Testing Framework:**
```c
#include <pthread.h>
#include <stdlib.h>
#include <time.h>

void random_yield() {
    if (rand() % 4 == 0) {  // 25% chance
        sched_yield();
    }
}

void *fuzzed_thread(void *arg) {
    for (int i = 0; i < 1000; i++) {
        // Critical section with random yields
        pthread_mutex_lock(&lock);
        random_yield();
        
        shared_data++;
        random_yield();
        
        pthread_mutex_unlock(&lock);
        random_yield();
    }
    return NULL;
}

int main() {
    srand(time(NULL));
    
    for (int run = 0; run < 100; run++) {
        // Reset state
        shared_data = 0;
        
        // Create threads
        pthread_t t1, t2;
        pthread_create(&t1, NULL, fuzzed_thread, NULL);
        pthread_create(&t2, NULL, fuzzed_thread, NULL);
        
        pthread_join(t1, NULL);
        pthread_join(t2, NULL);
        
        // Check result
        if (shared_data != 2000) {
            printf("Test failed on run %d: %d != 2000\n", 
                   run, shared_data);
            // Could save state for debugging
        }
    }
    
    return 0;
}
```

#### Model Checking

Use formal methods to verify correctness.

**Example with CPROVER:**
```c
#include <pthread.h>

int shared = 0;
pthread_mutex_t lock;

void *thread1(void *arg) {
    pthread_mutex_lock(&lock);
    shared++;
    pthread_mutex_unlock(&lock);
    return NULL;
}

void *thread2(void *arg) {
    pthread_mutex_lock(&lock);
    shared++;
    pthread_mutex_unlock(&lock);
    return NULL;
}

int main() {
    pthread_mutex_init(&lock, NULL);
    
    pthread_t t1, t2;
    pthread_create(&t1, NULL, thread1, NULL);
    pthread_create(&t2, NULL, thread2, NULL);
    
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    
    __CPROVER_assert(shared == 2, "Final value should be 2");
    return 0;
}
```

Model checkers like CBMC (C Bounded Model Checker) can verify that `shared` is always 2 after both threads complete, by exploring all possible thread interleavings.

### 9.7.3 Common Debugging Patterns

#### Logging with Thread IDs

```c
#include <pthread.h>
#include <stdio.h>

void log_message(const char *format, ...) {
    va_list args;
    va_start(args, format);
    
    pthread_t tid = pthread_self();
    printf("[Thread %lu] ", (unsigned long)tid);
    vprintf(format, args);
    
    va_end(args);
}

// Usage
void *worker(void *arg) {
    log_message("Starting work\n");
    // ...
    log_message("Completed work\n");
    return NULL;
}
```

#### Deadlock Detection

```c
#include <pthread.h>
#include <time.h>

#define DEADLOCK_TIMEOUT 5  // Seconds

typedef struct {
    pthread_mutex_t mutex;
    time_t last_lock_time;
} TimedMutex;

int timed_mutex_lock(TimedMutex *tm) {
    time_t start = time(NULL);
    
    while (pthread_mutex_trylock(&tm->mutex) != 0) {
        if (time(NULL) - start > DEADLOCK_TIMEOUT) {
            fprintf(stderr, "Possible deadlock detected!\n");
            // Could dump thread states
            return -1;
        }
        usleep(10000);  // 10ms
    }
    
    tm->last_lock_time = time(NULL);
    return 0;
}
```

#### Concurrency Bug Patterns

**1. Heisenbugs:**
*   **Symptoms:** Bugs that disappear when debugging
*   **Cause:** Timing changes from logging or breakpoints
*   **Solution:** Non-intrusive monitoring, record-replay debugging

**2. Priority Inversion:**
*   **Symptoms:** High-priority thread blocked by low-priority thread
*   **Cause:** Medium-priority thread preempting lock holder
*   **Solution:** Priority inheritance protocols

**3. ABA Problem:**
*   **Symptoms:** Lock-free algorithms fail when value changes and returns to original
*   **Cause:** Pointer reuse in lock-free structures
*   **Solution:** Tagged pointers, hazard pointers

## 9.8 Advanced Concurrency Techniques

### 9.8.1 Lock-Free Programming

Lock-free programming uses atomic operations to implement concurrent data structures without mutexes.

**Key Principles:**
*   **Progress Guarantee:** At least one thread makes progress
*   **Atomic Operations:** CAS (Compare-And-Swap) as fundamental building block
*   **Memory Ordering:** Precise control over visibility of operations

**CAS (Compare-And-Swap) Operation:**
```c
bool cas(int *ptr, int old_val, int new_val) {
    // Atomic operation: if *ptr == old_val, set *ptr = new_val
    // Returns true if successful
}
```

**Lock-Free Stack Implementation:**
```c
#include <stdatomic.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

typedef struct {
    atomic_uintptr_t head;
} LockFreeStack;

void stack_init(LockFreeStack *s) {
    atomic_store(&s->head, (uintptr_t)NULL);
}

void stack_push(LockFreeStack *s, int value) {
    Node *node = malloc(sizeof(Node));
    node->value = value;
    
    uintptr_t old_head;
    do {
        old_head = atomic_load(&s->head);
        node->next = (Node *)old_head;
    } while (!atomic_compare_exchange_weak(&s->head, &old_head, (uintptr_t)node));
}

int stack_pop(LockFreeStack *s) {
    uintptr_t old_head;
    do {
        old_head = atomic_load(&s->head);
        if (!old_head) return -1;  // Stack empty
        
        Node *next = ((Node *)old_head)->next;
    } while (!atomic_compare_exchange_weak(&s->head, &old_head, (uintptr_t)next));
    
    int value = ((Node *)old_head)->value;
    free((Node *)old_head);
    return value;
}
```

**Memory Ordering Considerations:**
*   **memory_order_relaxed:** No ordering constraints
*   **memory_order_acquire:** Barrier before operation
*   **memory_order_release:** Barrier after operation
*   **memory_order_acq_rel:** Both acquire and release
*   **memory_order_seq_cst:** Sequentially consistent (default)

**Example with Explicit Memory Ordering:**
```c
void stack_push_ordered(LockFreeStack *s, int value) {
    Node *node = malloc(sizeof(Node));
    node->value = value;
    
    uintptr_t old_head = atomic_load_explicit(&s->head, memory_order_relaxed);
    
    do {
        node->next = (Node *)old_head;
    } while (!atomic_compare_exchange_weak_explicit(
        &s->head, &old_head, (uintptr_t)node,
        memory_order_release, memory_order_relaxed));
}
```

**Challenges of Lock-Free Programming:**
*   **Complexity:** Algorithms are significantly harder to design and verify
*   **ABA Problem:** Value changes and returns to original, fooling CAS
*   **Memory Reclamation:** Safe deletion of nodes is non-trivial
*   **Performance:** May not outperform well-designed lock-based approaches

### 9.8.2 Memory Model and Atomic Operations

The C11 memory model provides a formal specification of how memory operations interact across threads.

**Atomic Types:**
```c
#include <stdatomic.h>

atomic_int counter;
atomic_flag flag = ATOMIC_FLAG_INIT;
atomic_llong big_value;
```

**Atomic Operations:**
```c
atomic_fetch_add(&counter, 1);  // Returns old value, adds 1
atomic_exchange(&counter, 0);   // Sets to 0, returns old value
atomic_compare_exchange_weak(&counter, &expected, desired);
```

**Memory Ordering Parameters:**
```c
// Sequentially consistent (default)
atomic_fetch_add(&counter, 1);

// Relaxed ordering (only atomicity, no ordering)
atomic_fetch_add_explicit(&counter, 1, memory_order_relaxed);

// Release-acquire ordering
atomic_store_explicit(&ready, 1, memory_order_release);
int value = atomic_load_explicit(&data, memory_order_acquire);
```

**Release-Acquire Pattern:**
```c
int data;
atomic_int ready = 0;

void producer() {
    data = 42;
    // All previous writes are visible after this store
    atomic_store_explicit(&ready, 1, memory_order_release);
}

void consumer() {
    int r = atomic_load_explicit(&ready, memory_order_acquire);
    if (r) {
        // data is guaranteed to be 42 here
        printf("Data: %d\n", data);
    }
}
```

This pattern establishes a happens-before relationship: all writes before the release store are visible after the acquire load.

**Sequential Consistency:**
```c
atomic_int x = 0, y = 0;

// Thread 1
atomic_store(&x, 1);
int a = atomic_load(&y);

// Thread 2
atomic_store(&y, 1);
int b = atomic_load(&x);
```

With sequential consistency, it's impossible for both `a` and `b` to be 0. Without it (with relaxed ordering), this outcome is possible.

**Use Cases for Different Memory Orders:**
*   **memory_order_seq_cst:** General purpose, when simplicity is more important than performance
*   **memory_order_acquire/release:** Most common pattern for synchronization
*   **memory_order_relaxed:** Counters and other independent operations
*   **memory_order_consume:** Data dependencies (rarely used correctly)

### 9.8.3 Thread Cancellation and Cleanup

#### Thread Cancellation

POSIX provides mechanisms for safely terminating threads.

**Cancellation Types:**
*   **Deferred Cancellation:** Thread terminates at cancellation points
*   **Asynchronous Cancellation:** Immediate termination (risky)

**Cancellation Points:**
*   `pthread_join()`, `pthread_cond_wait()`, `read()`, `write()`, etc.
*   Functions specified in POSIX as cancellation points

**Example:**
```c
#include <pthread.h>

void cleanup(void *arg) {
    printf("Cleaning up resource: %s\n", (char *)arg);
}

void *worker(void *arg) {
    pthread_cleanup_push(cleanup, "Resource 1");
    pthread_cleanup_push(cleanup, "Resource 2");
    
    // Set cancellation type to deferred (default)
    pthread_setcanceltype(PTHREAD_CANCEL_DEFERRED, NULL);
    
    // Set cancellation state to enabled (default)
    pthread_setcancelstate(PTHREAD_CANCEL_ENABLE, NULL);
    
    // Do work
    while (1) {
        // This is a cancellation point
        sleep(1);
    }
    
    pthread_cleanup_pop(0);
    pthread_cleanup_pop(0);
    return NULL;
}

int main() {
    pthread_t thread;
    pthread_create(&thread, NULL, worker, NULL);
    
    sleep(5);
    pthread_cancel(thread);
    pthread_join(thread, NULL);
    
    return 0;
}
```

#### Thread-Specific Cleanup

Using thread-specific data with destructors:

```c
static pthread_key_t resource_key;

void resource_destructor(void *value) {
    printf("Cleaning up thread-specific resource\n");
    free(value);
}

void *thread_func(void *arg) {
    // Allocate thread-specific resource
    int *resource = malloc(sizeof(int));
    *resource = *(int *)arg;
    
    // Set as thread-specific data
    pthread_setspecific(resource_key, resource);
    
    // Do work...
    
    return NULL;
}

int main() {
    pthread_key_create(&resource_key, resource_destructor);
    
    pthread_t t1, t2;
    int id1 = 1, id2 = 2;
    
    pthread_create(&t1, NULL, thread_func, &id1);
    pthread_create(&t2, NULL, thread_func, &id2);
    
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    
    pthread_key_delete(resource_key);
    return 0;
}
```

The destructor will be called automatically when each thread exits.

#### Graceful Shutdown Patterns

**Worker Thread Shutdown:**
```c
typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t work_available;
    int shutdown;
    // Other queue fields...
} TaskQueue;

void task_queue_shutdown(TaskQueue *q) {
    pthread_mutex_lock(&q->lock);
    q->shutdown = 1;
    pthread_cond_broadcast(&q->work_available);
    pthread_mutex_unlock(&q->lock);
}

void *worker_thread(void *arg) {
    TaskQueue *q = (TaskQueue *)arg;
    
    while (1) {
        pthread_mutex_lock(&q->lock);
        
        while (!q->shutdown && queue_empty(q)) {
            pthread_cond_wait(&q->work_available, &q->lock);
        }
        
        if (q->shutdown) {
            pthread_mutex_unlock(&q->lock);
            break;
        }
        
        Task *task = queue_pop(q);
        pthread_mutex_unlock(&q->lock);
        
        execute_task(task);
        free(task);
    }
    
    return NULL;
}
```

**Cancellation with Cleanup:**
```c
void *cancellable_worker(void *arg) {
    Resource *res = acquire_resource();
    pthread_cleanup_push(release_resource, res);
    
    while (1) {
        // Set cancellation point
        pthread_testcancel();
        
        // Do work with resource
        process(res);
    }
    
    pthread_cleanup_pop(1);
    return NULL;
}

int main() {
    pthread_t thread;
    pthread_create(&thread, NULL, cancellable_worker, NULL);
    
    sleep(5);
    pthread_cancel(thread);
    pthread_join(thread, NULL);
    
    return 0;
}
```

## 9.9 Practical Applications

### 9.9.1 Web Server Implementation

A multithreaded web server demonstrates several concurrency patterns.

**Architecture Overview:**
*   **Main Thread:** Accepts incoming connections
*   **Worker Thread Pool:** Processes requests
*   **Task Queue:** Holds pending requests
*   **Shared Resources:** Connection counters, statistics

**Implementation:**
```c
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <stdlib.h>

#define PORT 8080
#define MAX_CONNECTIONS 100
#define THREAD_POOL_SIZE 10

typedef struct {
    int socket;
} ConnectionTask;

typedef struct {
    ConnectionTask *tasks;
    int capacity;
    int head;
    int tail;
    int count;
    pthread_mutex_t lock;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
    int shutdown;
} TaskQueue;

typedef struct {
    pthread_t *threads;
    TaskQueue queue;
    int thread_count;
} ThreadPool;

void task_queue_init(TaskQueue *q, int capacity) {
    q->tasks = malloc(capacity * sizeof(ConnectionTask));
    q->capacity = capacity;
    q->head = q->tail = q->count = 0;
    pthread_mutex_init(&q->lock, NULL);
    pthread_cond_init(&q->not_empty, NULL);
    pthread_cond_init(&q->not_full, NULL);
    q->shutdown = 0;
}

void task_queue_push(TaskQueue *q, ConnectionTask task) {
    pthread_mutex_lock(&q->lock);
    
    while (q->count == q->capacity && !q->shutdown) {
        pthread_cond_wait(&q->not_full, &q->lock);
    }
    
    if (q->shutdown) {
        pthread_mutex_unlock(&q->lock);
        close(task.socket);
        return;
    }
    
    q->tasks[q->tail] = task;
    q->tail = (q->tail + 1) % q->capacity;
    q->count++;
    
    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->lock);
}

ConnectionTask task_queue_pop(TaskQueue *q) {
    pthread_mutex_lock(&q->lock);
    
    while (q->count == 0 && !q->shutdown) {
        pthread_cond_wait(&q->not_empty, &q->lock);
    }
    
    ConnectionTask task = {-1};
    if (q->count > 0) {
        task = q->tasks[q->head];
        q->head = (q->head + 1) % q->capacity;
        q->count--;
        pthread_cond_signal(&q->not_full);
    }
    
    pthread_mutex_unlock(&q->lock);
    return task;
}

void *worker_thread(void *arg) {
    ThreadPool *pool = (ThreadPool *)arg;
    
    while (1) {
        ConnectionTask task = task_queue_pop(&pool->queue);
        if (task.socket == -1) {
            break;  // Shutdown signal
        }
        
        // Process request
        handle_request(task.socket);
        close(task.socket);
    }
    
    return NULL;
}

void thread_pool_init(ThreadPool *pool, int num_threads) {
    pool->thread_count = num_threads;
    pool->threads = malloc(num_threads * sizeof(pthread_t));
    
    task_queue_init(&pool->queue, MAX_CONNECTIONS);
    
    for (int i = 0; i < num_threads; i++) {
        pthread_create(&pool->threads[i], NULL, 
                      worker_thread, pool);
    }
}

void thread_pool_shutdown(ThreadPool *pool) {
    pthread_mutex_lock(&pool->queue.lock);
    pool->queue.shutdown = 1;
    pthread_cond_broadcast(&pool->queue.not_empty);
    pthread_mutex_unlock(&pool->queue.lock);
    
    for (int i = 0; i < pool->thread_count; i++) {
        pthread_join(pool->threads[i], NULL);
    }
    
    free(pool->threads);
    free(pool->queue.tasks);
}

void handle_request(int client_socket) {
    // Read request
    char buffer[1024];
    ssize_t bytes_read = read(client_socket, buffer, sizeof(buffer) - 1);
    if (bytes_read <= 0) {
        return;
    }
    buffer[bytes_read] = '\0';
    
    // Simple HTTP response
    const char *response = 
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/html\r\n"
        "Connection: close\r\n\r\n"
        "<html><body><h1>Hello, World!</h1></body></html>";
    
    write(client_socket, response, strlen(response));
}

int main() {
    // Create server socket
    int server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket == -1) {
        perror("Socket creation failed");
        return 1;
    }
    
    // Set socket options
    int opt = 1;
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    // Bind to port
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);
    
    if (bind(server_socket, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        return 1;
    }
    
    // Listen for connections
    if (listen(server_socket, MAX_CONNECTIONS) < 0) {
        perror("Listen failed");
        return 1;
    }
    
    printf("Server listening on port %d\n", PORT);
    
    // Initialize thread pool
    ThreadPool pool;
    thread_pool_init(&pool, THREAD_POOL_SIZE);
    
    // Main accept loop
    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        
        int client_socket = accept(server_socket, 
                                 (struct sockaddr *)&client_addr, 
                                 &client_len);
        if (client_socket < 0) {
            if (errno == EINTR) continue;  // Interrupted, try again
            perror("Accept failed");
            break;
        }
        
        // Create task and add to queue
        ConnectionTask task = {client_socket};
        task_queue_push(&pool.queue, task);
    }
    
    // Cleanup
    thread_pool_shutdown(&pool);
    close(server_socket);
    return 0;
}
```

**Key Concurrency Aspects:**
*   **Thread Pool Pattern:** Efficient handling of multiple connections
*   **Bounded Task Queue:** Prevents resource exhaustion
*   **Graceful Shutdown:** Proper cleanup of resources
*   **Shared State Management:** Thread-safe queue operations

### 9.9.2 Parallel Data Processing

Parallel processing of large datasets demonstrates computational concurrency.

**Problem Statement:**
Process a large dataset (e.g., image processing, data analysis) by dividing work across threads.

**Implementation:**
```c
#include <pthread.h>
#include <stdlib.h>
#include <stdio.h>

typedef struct {
    double *input;
    double *output;
    int start;
    int end;
    int width;
    int height;
} ProcessingTask;

void *process_chunk(void *arg) {
    ProcessingTask *task = (ProcessingTask *)arg;
    
    for (int i = task->start; i < task->end; i++) {
        int y = i / task->width;
        int x = i % task->width;
        
        // Example: Apply a simple filter
        double sum = 0.0;
        int count = 0;
        
        // 3x3 neighborhood
        for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
                int nx = x + dx;
                int ny = y + dy;
                
                if (nx >= 0 && nx < task->width && 
                    ny >= 0 && ny < task->height) {
                    sum += task->input[ny * task->width + nx];
                    count++;
                }
            }
        }
        
        task->output[i] = sum / count;
    }
    
    return NULL;
}

void parallel_process(double *input, double *output, 
                     int width, int height, int num_threads) {
    if (num_threads <= 0) {
        num_threads = sysconf(_SC_NPROCESSORS_ONLN);
    }
    
    int total_pixels = width * height;
    int chunk_size = (total_pixels + num_threads - 1) / num_threads;
    pthread_t threads[num_threads];
    ProcessingTask tasks[num_threads];
    
    for (int i = 0; i < num_threads; i++) {
        tasks[i].input = input;
        tasks[i].output = output;
        tasks[i].width = width;
        tasks[i].height = height;
        tasks[i].start = i * chunk_size;
        tasks[i].end = (i == num_threads - 1) ? 
                      total_pixels : (i + 1) * chunk_size;
        
        if (tasks[i].start < total_pixels) {
            pthread_create(&threads[i], NULL, 
                          process_chunk, &tasks[i]);
        }
    }
    
    for (int i = 0; i < num_threads; i++) {
        if (tasks[i].start < total_pixels) {
            pthread_join(threads[i], NULL);
        }
    }
}

int main() {
    #define WIDTH 4096
    #define HEIGHT 4096
    
    double *input = malloc(WIDTH * HEIGHT * sizeof(double));
    double *output = malloc(WIDTH * HEIGHT * sizeof(double));
    
    // Initialize input data...
    for (int i = 0; i < WIDTH * HEIGHT; i++) {
        input[i] = (double)rand() / RAND_MAX;
    }
    
    // Process in parallel
    parallel_process(input, output, WIDTH, HEIGHT, 0);
    
    // Use output...
    
    free(input);
    free(output);
    return 0;
}
```

**Performance Considerations:**
*   **Work Division:** Equal work per thread for load balancing
*   **Data Locality:** Process contiguous memory regions for cache efficiency
*   **Thread Count:** Match to hardware concurrency for optimal performance
*   **Overhead:** Balance between parallelism and thread management cost

**Advanced Pattern: Pipeline Processing**

For multi-stage processing:

```c
typedef struct {
    double *stage1;
    double *stage2;
    double *stage3;
    int start;
    int end;
    int width;
    int height;
} PipelineTask;

void *pipeline_stage1(void *arg) {
    PipelineTask *task = (PipelineTask *)arg;
    // Process stage 1
    return NULL;
}

void *pipeline_stage2(void *arg) {
    PipelineTask *task = (PipelineTask *)arg;
    // Process stage 2
    return NULL;
}

void *pipeline_stage3(void *arg) {
    PipelineTask *task = (PipelineTask *)arg;
    // Process stage 3
    return NULL;
}

void pipeline_process(double *input, double *output, 
                     int width, int height, int num_threads) {
    // Allocate intermediate buffers
    double *stage1 = malloc(width * height * sizeof(double));
    double *stage2 = malloc(width * height * sizeof(double));
    
    // Create pipeline tasks
    PipelineTask tasks[num_threads];
    pthread_t stage1_threads[num_threads];
    pthread_t stage2_threads[num_threads];
    pthread_t stage3_threads[num_threads];
    
    int chunk_size = (width * height + num_threads - 1) / num_threads;
    
    for (int i = 0; i < num_threads; i++) {
        tasks[i].stage1 = stage1;
        tasks[i].stage2 = stage2;
        tasks[i].width = width;
        tasks[i].height = height;
        tasks[i].start = i * chunk_size;
        tasks[i].end = (i == num_threads - 1) ? 
                      width * height : (i + 1) * chunk_size;
    }
    
    // Start pipeline
    for (int i = 0; i < num_threads; i++) {
        pthread_create(&stage1_threads[i], NULL, 
                      pipeline_stage1, &tasks[i]);
    }
    
    for (int i = 0; i < num_threads; i++) {
        pthread_join(stage1_threads[i], NULL);
        pthread_create(&stage2_threads[i], NULL, 
                      pipeline_stage2, &tasks[i]);
    }
    
    for (int i = 0; i < num_threads; i++) {
        pthread_join(stage2_threads[i], NULL);
        pthread_create(&stage3_threads[i], NULL, 
                      pipeline_stage3, &tasks[i]);
    }
    
    for (int i = 0; i < num_threads; i++) {
        pthread_join(stage3_threads[i], NULL);
    }
    
    free(stage1);
    free(stage2);
}
```

### 9.9.3 Real-Time Systems Considerations

While this chapter emphasizes general-purpose concurrency, real-time systems have additional constraints.

**Key Considerations for Real-Time Systems:**

| **Aspect**            | **General Purpose**          | **Real-Time**                |
| :-------------------- | :--------------------------- | :--------------------------- |
| **Scheduling**        | **Fairness, throughput**     | **Predictable deadlines**    |
| **Priority**          | **Usually static**           | **Dynamic, priority-based**  |
| **Locking**           | **Standard mutexes**         | **Priority inheritance**     |
| **Memory Allocation** | **malloc/free acceptable**   | **Pre-allocated pools**      |
| **Latency**           | **Not strictly bounded**     | **Strictly bounded**         |

**Priority Inversion Solution:**

```c
pthread_mutexattr_t attr;
pthread_mutexattr_init(&attr);
pthread_mutexattr_setprotocol(&attr, PTHREAD_PRIO_INHERIT);
pthread_mutex_init(&mutex, &attr);
```

This ensures a high-priority thread waiting for a mutex held by a low-priority thread temporarily inherits the high priority.

**Real-Time Thread Creation:**

```c
struct sched_param param;
pthread_attr_t attr;

pthread_attr_init(&attr);
pthread_attr_setschedpolicy(&attr, SCHED_FIFO);
param.sched_priority = 50;  // High priority
pthread_attr_setschedparam(&attr, &param);
pthread_attr_setinheritsched(&attr, PTHREAD_EXPLICIT_SCHED);

pthread_create(&thread, &attr, realtime_task, NULL);
```

**Memory Allocation Strategies:**

```c
// Pre-allocate all memory at startup
void *memory_pool;
size_t pool_size = 1024 * 1024; // 1MB

void init_realtime_system() {
    memory_pool = malloc(pool_size);
    // Initialize custom allocator using memory_pool
}

void *rt_malloc(size_t size) {
    // Allocate from pre-allocated pool
    // No system calls, deterministic timing
}
```

**Critical Sections Minimization:**

```c
void critical_section() {
    pthread_mutex_lock(&mutex);
    // DO ONLY WHAT'S ABSOLUTELY NECESSARY
    // Keep this section as short as possible
    pthread_mutex_unlock(&mutex);
    
    // Continue processing outside critical section
}
```

## 9.10 Conclusion and Path Forward

This chapter has provided a comprehensive exploration of multithreading and concurrency in C, building upon the memory management foundations established in Chapter 8. We've examined standard threading APIs (C11 and Pthreads), synchronization primitives, common concurrency patterns, pitfalls and debugging techniques, and advanced concepts like lock-free programming, analyzing both the capabilities and limitations of various approaches.

Key concepts mastered include:
*   Understanding the distinction between concurrency and parallelism
*   Effective use of threading APIs (C11 `<threads.h>` and POSIX Pthreads)
*   Mastery of synchronization primitives (mutexes, condition variables, semaphores)
*   Implementation of common concurrency patterns (producer-consumer, thread pools)
*   Identification and resolution of concurrency pitfalls (race conditions, deadlocks)
*   Application of debugging and testing strategies for concurrent programs
*   Advanced techniques including memory models and lock-free programming
*   Practical applications across web servers, data processing, and real-time systems

The examples demonstrated practical implementations that transform theoretical concepts into working solutions, illustrating how concurrent programming enables applications to fully leverage modern multi-core hardware. By understanding both the mechanics and strategic implications of concurrency, you've gained the ability to design and implement robust, efficient concurrent systems.

As you progress, the concepts in this chapter form the essential foundation for more advanced topics:
*   **Chapter 10 (Advanced Algorithms)** will leverage concurrency for algorithm acceleration
*   **Chapter 11 (System Programming)** will apply these concepts to operating system components
*   **Chapter 12 (Performance Optimization)** will deepen the performance analysis of concurrent code
*   **Chapter 13 (Network Programming)** will extend these techniques to distributed systems

> **"Concurrency is not merely a technical challenge but a fundamental shift in how we conceptualize computation. It forces us to move beyond the comforting linearity of sequential execution and embrace the complex, interconnected reality of modern computing. Those who master this paradigm don't just write faster code—they learn to think in parallel, transforming their approach to problem-solving at the most fundamental level."**
