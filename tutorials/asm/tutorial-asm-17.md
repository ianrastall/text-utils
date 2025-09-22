# 17. Creating Assembly Interfaces for Higher-Level Languages

## 17.1 Introduction to Assembly Interfaces

Assembly language, despite its low-level nature, is not isolated from the broader software ecosystem. Modern applications — whether written in Python, Java, Rust, Go, or JavaScript — often rely on assembly-optimized libraries for performance-critical operations: cryptographic primitives, image and signal processing, physics simulations, and system-level interactions. The key to this integration lies in creating well-defined, stable, and efficient interfaces between assembly routines and higher-level languages.

> **“Assembly is the universal substrate. Any language that compiles to native code can — and often must — interface with it.”**  
> The performance or hardware-specific capabilities you implement in assembly are not confined to C. With the right interface, they become available to any language that can call native functions.

> **“An assembly interface is not a hack — it is a contract. Define it clearly, document it thoroughly, and maintain it rigorously.”**  
> Unlike internal assembly optimizations, interfaces are public APIs. They must be stable, versioned, and backward-compatible. A poorly designed interface will fracture ecosystems and frustrate users.

By the end of this chapter, you will understand:

- How to design ABI-compliant assembly functions for cross-language use.
- How to export symbols and manage name mangling.
- How to handle data types: integers, floats, structs, strings, and pointers.
- How to interface with C++ (including classes and name mangling).
- How to bind assembly to Python, Java, Rust, Go, and JavaScript.
- How to manage memory ownership and garbage collection boundaries.
- How to use Foreign Function Interfaces (FFI) and binding generators.
- How to handle exceptions and errors across language boundaries.
- How to package and distribute assembly libraries for multiple languages.
- How to debug and profile cross-language calls.

---

## 17.2 Designing Assembly Functions for Cross-Language Use

The foundation of any cross-language interface is a stable, well-documented Application Binary Interface (ABI). On x86-64 Unix-like systems, this means adhering to the System V ABI. On Windows, it means following the Microsoft x64 calling convention.

### 17.2.1 System V ABI Recap

As established in Chapter 15, the System V ABI specifies:

- Integer/pointer arguments in `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`.
- Floating-point arguments in `xmm0`–`xmm7`.
- Return values in `rax` (and `rdx` for 128-bit), or `xmm0` for floats.
- Caller-saved registers: `rax`, `rcx`, `rdx`, `rsi`, `rdi`, `r8`–`r11`, `xmm0`–`xmm15`.
- Callee-saved registers: `rbx`, `rbp`, `r12`–`r15`.

All assembly functions intended for cross-language use must strictly follow these rules.

### 17.2.2 Function Signature Design

Design functions with simple, flat signatures. Avoid:

- Nested structs passed by value (unless ≤16 bytes).
- Variadic functions (hard to bind).
- Functions returning large structs by value (use pointers instead).
- Callbacks that expect language-specific contexts (e.g., `this` pointers, closures).

Example: Good signature.

```x86asm
; Compute SHA-256 hash of a buffer
; Inputs: RDI = pointer to buffer, RSI = length, RDX = pointer to 32-byte output
; Returns: RAX = 0 on success, -1 on error
global sha256_hash
sha256_hash:
    ; ... implementation ...
    xor rax, rax   ; success
    ret
```

Example: Bad signature.

```x86asm
; Returns a 64-byte struct by value — inefficient and hard to bind
global bad_function
bad_function:
    ; ... fills 64 bytes in RAX, RDX, and stack? ...
    ret
```

### 17.2.3 Error Handling

Use return codes or output parameters for errors — not exceptions. Exceptions do not cross language boundaries reliably.

```x86asm
; RAX = 0 (success), -1 (invalid input), -2 (out of memory)
global safe_divide
safe_divide:
    ; RDI = a, RSI = b, RDX = ptr to result
    test rsi, rsi
    jz .divide_by_zero
    mov rax, rdi
    cqo
    idiv rsi
    mov [rdx], rax
    xor rax, rax
    ret
.divide_by_zero:
    mov rax, -1
    ret
```

### 17.2.4 Thread Safety and Reentrancy

Ensure assembly functions are thread-safe:

- Do not use static or global state unless protected by locks.
- Prefer per-call state passed via parameters.
- Avoid relying on FPU control word or MXCSR unless explicitly saved/restored.

---

## 17.3 Symbol Export and Name Mangling

Higher-level languages need to locate your assembly functions by name. This requires exporting symbols correctly and understanding how different languages and linkers mangle names.

### 17.3.1 Exporting Symbols in Assembly

Use the `global` directive to export symbols.

```x86asm
global add_numbers
global _add_numbers   ; for macOS or Windows if needed

add_numbers:
    mov rax, rdi
    add rax, rsi
    ret
```

On Linux, symbols are typically unmangled. On macOS and Windows, C symbols may be prefixed with an underscore.

Verify with `nm`:

```bash
nasm -f elf64 math.asm -o math.o
nm math.o
```

Output:

```
0000000000000000 T add_numbers
```

### 17.3.2 C++ Name Mangling

C++ mangles function names to encode type information. To avoid this, declare assembly functions as `extern "C"`.

C++ header:

```cpp
extern "C" {
    int add_numbers(int a, int b);
}
```

Assembly remains unchanged.

If you must interface with mangled names (e.g., for class methods), use `c++filt` to decode them.

```bash
nm yourlib.o | c++filt
```

Example mangled name: `_Z10add_numbersii` → `add_numbers(int, int)`

### 17.3.3 Versioned Symbols

For library distribution, use versioned symbols to maintain backward compatibility.

GNU ld version script (`math.map`):

```
MATH_1.0 {
    global:
        add_numbers;
        multiply_numbers;
    local:
        *;
};
```

Link with:

```bash
gcc -shared -Wl,--version-script=math.map -o libmath.so math.o
```

---

## 17.4 Data Type Mapping

Each language represents data types differently. Your assembly interface must use types that map cleanly across languages.

### 17.4.1 Integer and Floating-Point Types

Use fixed-width types for portability.

| **Assembly Type** | **C Type**       | **Rust Type** | **Go Type** | **Python (ctypes)** |
| :---              | :---             | :---          | :---        | :---                |
| **64-bit signed** | `int64_t`        | `i64`         | `int64`     | `c_int64`           |
| **64-bit unsigned**| `uint64_t`       | `u64`         | `uint64`    | `c_uint64`          |
| **Double**        | `double`         | `f64`         | `float64`   | `c_double`          |
| **Float**         | `float`          | `f32`         | `float32`   | `c_float`           |

Example: Multiply two doubles.

```x86asm
global multiply_doubles
multiply_doubles:
    ; xmm0 = a, xmm1 = b
    mulsd xmm0, xmm1
    ; result in xmm0
    ret
```

### 17.4.2 Structs and Tuples

Pass small structs (≤16 bytes) in registers. Larger structs via pointer.

C:

```c
typedef struct { double x, y; } point_t;
```

Assembly:

```x86asm
; Return point_t by value (in xmm0:xmm1)
global make_point
make_point:
    ; RDI = x, RSI = y (if passed as two doubles)
    ; But if passed as struct, may be in xmm0, xmm1
    ; For cross-language, prefer pointer-based interface
    movq xmm0, rdi
    movq xmm1, rsi
    ret
```

Better: Use pointer to avoid ambiguity.

```x86asm
; RDI = pointer to output point_t
; RSI = x, RDX = y
global make_point_ptr
make_point_ptr:
    movsd [rdi], xmm0    ; x
    movsd [rdi+8], xmm1  ; y
    mov rax, rdi         ; return pointer
    ret
```

### 17.4.3 Strings and Arrays

Strings are typically passed as pointer + length (not null-terminated, for safety).

```x86asm
; RDI = char* buffer, RSI = length
global reverse_string
reverse_string:
    test rsi, rsi
    jz .done
    lea rax, [rdi + rsi - 1]   ; end pointer
.loop:
    cmp rdi, rax
    jge .done
    mov cl, [rdi]
    mov dl, [rax]
    mov [rdi], dl
    mov [rax], cl
    inc rdi
    dec rax
    jmp .loop
.done:
    ret
```

Arrays follow the same pattern: pointer + length.

### 17.4.4 Pointers and References

All languages can handle pointers — but memory ownership must be explicit.

- If the assembly function allocates memory, document who must free it.
- If the assembly function retains a pointer, document lifetime requirements.
- Avoid returning pointers to static or stack-allocated data.

---

## 17.5 Interfacing with C++

C++ adds complexity through classes, methods, constructors, and destructors. However, assembly can interface with C++ via `extern "C"` wrappers or by mimicking object layouts.

### 17.5.1 extern "C" Wrappers

Expose C-style functions that wrap C++ objects.

C++:

```cpp
class Calculator {
public:
    int add(int a, int b) { return a + b; }
};

extern "C" {
    void* create_calculator() {
        return new Calculator();
    }

    int calculator_add(void* calc, int a, int b) {
        return static_cast<Calculator*>(calc)->add(a, b);
    }

    void destroy_calculator(void* calc) {
        delete static_cast<Calculator*>(calc);
    }
}
```

Assembly remains agnostic — it calls these C functions.

### 17.5.2 Direct Class Method Calls (Advanced)

If you must call a C++ method directly from assembly, you need to know:

- The object pointer (`this`) is passed in `rdi` (System V ABI).
- The method’s mangled name.

Example:

```x86asm
extern _ZN10Calculator3addEii   ; mangled name for Calculator::add(int, int)

global call_calculator_add
call_calculator_add:
    ; RDI = Calculator* (this), RSI = a, RDX = b
    call _ZN10Calculator3addEii
    ret
```

This is fragile — mangled names change with compilers and versions. Prefer `extern "C"` wrappers.

### 17.5.3 Virtual Methods and Vtables

Calling virtual methods requires indirecting through the vtable.

```x86asm
; RDI = object pointer
; Vtable is at [rdi]
; First virtual function at [rdi + 0]
call_virtual_method:
    mov rax, [rdi]      ; vtable pointer
    call [rax]          ; call first virtual function
    ret
```

Again, prefer C wrappers for stability.

---

## 17.6 Interfacing with Python

Python interfaces with native code via `ctypes`, `cffi`, or extension modules (C API).

### 17.6.1 ctypes

Write assembly as a shared library, then load with `ctypes`.

Assembly (`math.asm`):

```x86asm
global add_ints
add_ints:
    mov rax, rdi
    add rax, rsi
    ret
```

Compile:

```bash
nasm -f elf64 math.asm -o math.o
gcc -shared -fPIC -o libmath.so math.o
```

Python:

```python
from ctypes import CDLL, c_int64

lib = CDLL("./libmath.so")
lib.add_ints.argtypes = [c_int64, c_int64]
lib.add_ints.restype = c_int64

result = lib.add_ints(5, 7)
print(result)  # Output: 12
```

### 17.6.2 cffi

More Pythonic than `ctypes`.

```python
from cffi import FFI

ffi = FFI()
ffi.cdef("""
    long add_ints(long a, long b);
""")

lib = ffi.dlopen("./libmath.so")
result = lib.add_ints(5, 7)
print(result)
```

### 17.6.3 Python C API (Advanced)

For maximum performance, write a Python extension in C that wraps your assembly.

C wrapper (`pymath.c`):

```c
#include <Python.h>
extern long add_ints(long a, long b);

static PyObject* pymath_add(PyObject* self, PyObject* args) {
    long a, b, result;
    if (!PyArg_ParseTuple(args, "ll", &a, &b))
        return NULL;
    result = add_ints(a, b);
    return PyLong_FromLong(result);
}

static PyMethodDef methods[] = {
    {"add", pymath_add, METH_VARARGS, "Add two integers."},
    {NULL, NULL, 0, NULL}
};

static struct PyModuleDef module = {
    PyModuleDef_HEAD_INIT,
    "pymath",
    NULL,
    -1,
    methods
};

PyMODINIT_FUNC PyInit_pymath(void) {
    return PyModule_Create(&module);
}
```

Setup script (`setup.py`):

```python
from setuptools import setup, Extension

module = Extension('pymath',
                   sources=['pymath.c'],
                   extra_objects=['math.o'])

setup(name='pymath',
      ext_modules=[module])
```

Build and use:

```bash
python setup.py build_ext --inplace
python -c "import pymath; print(pymath.add(5, 7))"
```

---

## 17.7 Interfacing with Java (JNI)

Java uses the Java Native Interface (JNI) to call native code.

### 17.7.1 Write Java Class

```java
public class MathLib {
    static {
        System.loadLibrary("math");
    }

    public native long add(long a, long b);
}
```

Generate header:

```bash
javac MathLib.java
javah MathLib   # generates MathLib.h
```

Generated header (`MathLib.h`):

```c
JNIEXPORT jlong JNICALL Java_MathLib_add
  (JNIEnv *, jobject, jlong, jlong);
```

### 17.7.2 Implement in Assembly

Assembly (`math_jni.asm`):

```x86asm
extern Java_MathLib_add

global Java_MathLib_add
Java_MathLib_add:
    ; RDI = JNIEnv*, RSI = jobject, RDX = a, RCX = b
    mov rax, rdx
    add rax, rcx
    ret
```

Compile as shared library:

```bash
nasm -f elf64 math_jni.asm -o math_jni.o
gcc -shared -fPIC -I$JAVA_HOME/include -I$JAVA_HOME/include/linux -o libmath.so math_jni.o
```

Use in Java:

```java
public class Test {
    public static void main(String[] args) {
        MathLib lib = new MathLib();
        System.out.println(lib.add(5, 7)); // Output: 12
    }
}
```

Note: JNI functions have complex signatures. The first two parameters (`JNIEnv*`, `jobject`) are always present.

---

## 17.8 Interfacing with Rust

Rust has excellent FFI support via `extern "C"`.

### 17.8.1 Declare in Rust

```rust
#[link(name = "math")]
extern "C" {
    fn add_ints(a: i64, b: i64) -> i64;
}

fn main() {
    let result = unsafe { add_ints(5, 7) };
    println!("{}", result); // Output: 12
}
```

### 17.8.2 Safe Wrappers

Wrap unsafe FFI calls in safe Rust functions.

```rust
fn safe_add(a: i64, b: i64) -> Result<i64, &'static str> {
    if a == i64::MAX && b > 0 {
        return Err("Overflow");
    }
    Ok(unsafe { add_ints(a, b) })
}
```

### 17.8.3 Callbacks from Assembly to Rust

Pass function pointers from Rust to assembly.

Rust:

```rust
type Callback = extern "C" fn(i64) -> i64;

#[link(name = "math")]
extern "C" {
    fn process_with_callback(data: i64, cb: Callback) -> i64;
}

extern "C" fn my_callback(x: i64) -> i64 {
    x * 2
}

fn main() {
    let result = unsafe { process_with_callback(5, my_callback) };
    println!("{}", result);
}
```

Assembly:

```x86asm
global process_with_callback
process_with_callback:
    ; RDI = data, RSI = callback function pointer
    call rsi          ; call callback
    ret
```

---

## 17.9 Interfacing with Go

Go uses `cgo` to interface with C (and thus assembly).

### 17.9.1 cgo Example

Go file (`math.go`):

```go
package main

/*
#include <stdint.h>
extern int64_t add_ints(int64_t a, int64_t b);
*/
import "C"
import "fmt"

func main() {
    result := C.add_ints(5, 7)
    fmt.Println(result) // Output: 12
}
```

Compile assembly to shared library or archive.

```bash
nasm -f elf64 math.asm -o math.o
ar rcs libmath.a math.o
```

Build Go program:

```bash
go build -o program
```

### 17.9.2 Direct Assembly in Go (Advanced)

Go 1.20+ supports linking assembly directly via `go:linkname` and plan9 assembly — but x86-64 assembly requires careful handling.

Not recommended for beginners — use cgo instead.

---

## 17.10 Interfacing with JavaScript (Node.js and WebAssembly)

JavaScript can interface with native code via Node.js addons or WebAssembly.

### 17.10.1 Node.js Native Addons (N-API)

Use N-API for stable ABI.

C wrapper (`math.c`):

```c
#include <node_api.h>
#include <stdint.h>

extern int64_t add_ints(int64_t a, int64_t b);

napi_value Add(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    int64_t a, b;
    napi_get_value_int64(env, args[0], &a);
    napi_get_value_int64(env, args[1], &b);

    int64_t result = add_ints(a, b);

    napi_value ret;
    napi_create_int64(env, result, &ret);
    return ret;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc = {"add", 0, Add, 0, 0, 0, napi_default, 0};
    napi_define_properties(env, exports, 1, &desc);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

Build with `node-gyp`.

### 17.10.2 WebAssembly (WASM)

Compile assembly to WebAssembly via LLVM or Emscripten.

First, write C wrapper:

```c
// math.c
long add_ints(long a, long b) {
    return a + b;
}
```

Compile to WASM:

```bash
emcc math.c -o math.wasm -s EXPORTED_FUNCTIONS='["_add_ints"]' -s EXPORTED_RUNTIME_METHODS='["ccall"]'
```

Use in JavaScript:

```javascript
WebAssembly.instantiateStreaming(fetch('math.wasm'))
.then(obj => {
    const result = obj.instance.exports._add_ints(5, 7);
    console.log(result); // Output: 12
});
```

Note: Pure assembly → WASM is complex. Use C as intermediary.

---

## 17.11 Memory Management Across Language Boundaries

Memory allocated in one language must be freed in the same language — unless explicitly designed otherwise.

### 17.11.1 Ownership Rules

- If assembly allocates memory, provide a deallocation function.
- If a higher-level language allocates memory, do not free it in assembly.
- Use shared allocators (e.g., `malloc`/`free`) when possible.

Example:

```x86asm
global allocate_buffer
allocate_buffer:
    ; RDI = size
    push rdi
    call malloc
    pop rdi
    test rax, rax
    jz .error
    ret
.error:
    xor rax, rax
    ret

global free_buffer
free_buffer:
    ; RDI = pointer
    call free
    ret
```

### 17.11.2 Garbage Collection and Pinning

In garbage-collected languages (Java, Go, Python), objects may move. Pin objects or use indirect handles.

Java JNI:

```c
// Pin array
jint* arr = (*env)->GetIntArrayElements(env, jarray, NULL);
// ... use arr ...
(*env)->ReleaseIntArrayElements(env, jarray, arr, 0);
```

Go:

```go
// Pin with C.CBytes or unsafe.Pointer
ptr := C.CBytes(data)
defer C.free(ptr)
```

---

## 17.12 Error Handling and Exceptions

Exceptions do not cross language boundaries. Use return codes or output parameters.

### 17.12.1 Error Codes

```x86asm
; RAX = 0 (success), -1 (invalid), -2 (oom)
global safe_function
safe_function:
    cmp rdi, 0
    jl .invalid
    ; ... work ...
    xor rax, rax
    ret
.invalid:
    mov rax, -1
    ret
```

### 17.12.2 Error Strings

Provide error strings via global buffer or output parameter.

```x86asm
section .data
    error_buffer db 0, times 255

global get_last_error
get_last_error:
    mov rax, error_buffer
    ret

global safe_function
safe_function:
    cmp rdi, 0
    jl .invalid
    ; ... work ...
    xor rax, rax
    ret
.invalid:
    mov rax, error_buffer
    mov byte [rax], 0   ; clear
    mov rsi, err_msg
    call strcpy         ; simplified
    mov rax, -1
    ret

section .rodata
err_msg db "Invalid input", 0
```

### 17.12.3 Language-Specific Error Wrapping

In Python:

```python
class MathError(Exception):
    pass

def safe_add(a, b):
    result = lib.safe_function(a)
    if result == -1:
        raise MathError("Invalid input")
    return result
```

In Rust:

```rust
enum MathError {
    InvalidInput,
    OutOfMemory,
}

fn safe_add(a: i64) -> Result<i64, MathError> {
    let result = unsafe { safe_function(a) };
    match result {
        -1 => Err(MathError::InvalidInput),
        -2 => Err(MathError::OutOfMemory),
        x => Ok(x),
    }
}
```

---

## 17.13 Debugging and Profiling Cross-Language Calls

Debugging requires tools that understand both sides of the interface.

### 17.13.1 GDB for Mixed Debugging

Compile with `-g`.

```bash
gcc -g -shared -fPIC -o libmath.so math.o
```

In GDB:

```bash
gdb python
(gdb) run test.py
(gdb) break add_ints
(gdb) stepi
```

### 17.13.2 Profiling

Use `perf` (Linux) or VTune to profile assembly within higher-level applications.

```bash
perf record python test.py
perf report
```

Look for your assembly function in the profile.

### 17.13.3 Logging

Add logging to assembly via C `printf` or system calls.

```x86asm
extern printf
section .data
    log_fmt db "add_ints called with %ld, %ld", 10, 0

global add_ints
add_ints:
    push rdi
    push rsi
    mov rdi, log_fmt
    mov rsi, rdi
    mov rdx, rsi
    xor rax, rax
    call printf
    pop rsi
    pop rdi
    ; ... rest of function ...
```

---

## 17.14 Packaging and Distribution

Distribute your assembly library as a shared library (`.so`, `.dll`, `.dylib`) with language-specific bindings.

### 17.14.1 Build Scripts

Use `make`, `CMake`, or language-specific tools.

Example `Makefile`:

```makefile
CC = gcc
NASM = nasm
CFLAGS = -fPIC -g
LDFLAGS = -shared

all: libmath.so pymath.so javamath.so

libmath.so: math.o
	$(CC) $(LDFLAGS) -o $@ $^

math.o: math.asm
	$(NASM) -f elf64 $< -o $@

pymath.so: pymath.c math.o
	$(CC) $(CFLAGS) -shared -o $@ $^ $(shell python3-config --ldflags)

javamath.so: math_jni.o
	$(CC) $(LDFLAGS) -o $@ $^ -I$(JAVA_HOME)/include -I$(JAVA_HOME)/include/linux

clean:
	rm -f *.o *.so
```

### 17.14.2 Cross-Platform Considerations

- Use `#ifdef` for platform-specific code.
- Test on Linux, macOS, Windows.
- Provide prebuilt binaries for common platforms.

---

## 17.15 Best Practices and Pitfalls

### 17.15.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Use Simple Signatures**     | Avoid nested structs, callbacks, variadic functions.                             |
| **Document Ownership**        | Specify who allocates and frees memory.                                         |
| **Handle Errors via Return Codes**| Never rely on exceptions crossing boundaries.                                 |
| **Test on Target Languages**  | Validate bindings in Python, Java, Rust, etc.                                   |
| **Use Versioned Symbols**     | Maintain backward compatibility with symbol versioning.                         |
| **Provide High-Level Wrappers**| Ship with Python modules, Rust crates, Go packages, etc.                        |
| **Profile Performance**       | Ensure the assembly actually improves performance in the target environment.    |

### 17.15.2 Common Pitfalls

- **Name Mangling**: Forgetting `extern "C"` in C++.
- **Stack Misalignment**: Not aligning stack before calls in assembly.
- **Register Corruption**: Not preserving callee-saved registers.
- **Memory Leaks**: Allocating in assembly but not providing free function.
- **GC Issues**: Not pinning objects in garbage-collected languages.
- **Threading Bugs**: Using non-thread-safe global state.

> **“The most dangerous interface is the one that works — until it doesn’t.”**  
> Test under load, with multiple threads, and across language runtimes. What works in a simple test will fail in production if not designed rigorously.

> **“Your assembly is only as good as its documentation. If users can’t understand how to call it, they won’t — or worse, they’ll misuse it.”**  
> Document every function: parameters, return values, error codes, thread safety, memory ownership. Provide examples in each target language.

---

## 17.16 Exercises

1. Write an assembly function to compute Fibonacci numbers and bind it to Python using `ctypes`.
2. Create a shared library with a function that reverses a string in-place, and call it from Java via JNI.
3. Write a Rust program that calls an assembly function to compute CRC32 of a byte array.
4. Implement a Go cgo wrapper for an assembly function that finds the maximum value in an array.
5. Build a Node.js native addon that calls an assembly function to generate a random number.
6. Write an assembly function that allocates and returns a buffer, and provide a corresponding deallocator. Test in Python.
7. Create a WebAssembly module from an assembly function (via C wrapper) and call it from JavaScript.
8. Write a C++ class that wraps an assembly function, and expose it via `extern "C"` functions.
9. Implement error handling in assembly and propagate errors to Rust’s `Result` type.
10. Profile a Python program calling an assembly function vs. pure Python — measure speedup.

---

## 17.17 Further Reading

- System V ABI: https://refspecs.linuxfoundation.org/elf/x86_64-abi-0.99.pdf
- Python ctypes: https://docs.python.org/3/library/ctypes.html
- Java JNI: https://docs.oracle.com/javase/8/docs/technotes/guides/jni/
- Rust FFI: https://doc.rust-lang.org/nomicon/ffi.html
- Go cgo: https://pkg.go.dev/cmd/cgo
- Node.js N-API: https://nodejs.org/api/n-api.html
- WebAssembly: https://webassembly.org/

