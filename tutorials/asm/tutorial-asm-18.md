# 18. Mixed-Language Build Systems in Assembly

## 18.1 Introduction to Mixed-Language Build Systems

Modern software is rarely written in a single language. Performance-critical kernels are written in assembly or C, business logic in Python or JavaScript, system services in Rust or Go, and user interfaces in high-level frameworks. The assembly programmer — once isolated in the realm of bootloaders and device drivers — now operates in a polyglot ecosystem where seamless integration across languages is not a luxury but a necessity.

A build system automates the compilation, linking, and packaging of source code into executable programs or libraries. In mixed-language projects, it must coordinate compilers, assemblers, linkers, and language-specific toolchains — each with its own flags, dependencies, output formats, and runtime requirements.

> **“A build system is not a necessary evil — it is the circulatory system of your software. Without it, your components cannot communicate; with it, they thrive.”**  
> Treat your build system with the same rigor as your code. A broken build is a broken product — regardless of how perfect the assembly kernel may be.

> **“If you cannot build it reliably, you do not own it. If you cannot reproduce it, you cannot debug it.”**  
> Deterministic, version-controlled, automated builds are non-negotiable in mixed-language environments. Manual steps, hardcoded paths, and undocumented dependencies are the enemies of scalability and collaboration.

By the end of this chapter, you will understand:

- How to structure mixed-language projects for maintainability.
- How to compile and link assembly with C, C++, Rust, Go, Python, Java, and JavaScript.
- How to use Make, CMake, Meson, and language-specific tools (Cargo, Go, setuptools, Maven).
- How to manage dependencies, include paths, and library search directories.
- How to handle cross-compilation and platform-specific code.
- How to write portable build scripts for Linux, macOS, and Windows.
- How to debug build failures and linker errors.
- How to optimize build performance with caching, parallelization, and incremental builds.
- How to package and distribute mixed-language libraries.

---

## 18.2 Project Structure and Organization

Before writing build scripts, organize your source tree logically. A well-structured project simplifies build automation and onboarding.

### 18.2.1 Recommended Directory Layout

```
project/
├── src/
│   ├── asm/             # Assembly source files (.asm, .s)
│   ├── c/               # C source files
│   ├── cpp/             # C++ source files
│   ├── rust/            # Rust source (if not using Cargo workspace)
│   └── include/         # Headers for C/C++
├── bindings/
│   ├── python/
│   ├── java/
│   ├── nodejs/
│   └── wasm/
├── build/               # Build artifacts (object files, libraries)
├── dist/                # Distribution packages
├── scripts/             # Helper scripts (build, test, deploy)
├── tests/               # Test code in various languages
├── docs/                # Documentation
├── Makefile             # Primary build driver
├── CMakeLists.txt       # For CMake-based builds
└── README.md
```

### 18.2.2 Separation of Concerns

- Keep assembly source in `src/asm/`.
- Place language-specific wrappers in `bindings/`.
- Store compiled objects and libraries in `build/`.
- Avoid mixing source and build artifacts.

### 18.2.3 Version Control and Ignoring Build Artifacts

Use `.gitignore` to exclude build products:

```
build/
dist/
*.o
*.so
*.dll
*.dylib
*.a
*.lib
```

---

## 18.3 Building Assembly with NASM, YASM, and GAS

Assembly source must be assembled into object files before linking. The choice of assembler affects syntax, directives, and output formats.

### 18.3.1 NASM (Netwide Assembler)

Most popular for x86-64. Uses Intel syntax.

```bash
nasm -f elf64 src/asm/math.asm -o build/math.o
```

- `-f elf64`: Output format (ELF for Linux, `macho64` for macOS, `win64` for Windows).
- Use `-g` for debug symbols.

Example `Makefile` rule:

```makefile
build/%.o: src/asm/%.asm
	@mkdir -p $(dir $@)
	nasm -f elf64 -g -o $@ $<
```

### 18.3.2 YASM

Fork of NASM with additional features. Compatible syntax.

```bash
yasm -f elf64 -g -o build/math.o src/asm/math.asm
```

### 18.3.3 GAS (GNU Assembler)

Uses AT&T syntax by default. Part of binutils.

```bash
as --64 -g -o build/math.o src/asm/math.s
```

To use Intel syntax:

```bash
as --64 -g --msyntax=intel --mnaked-reg -o build/math.o src/asm/math.s
```

### 18.3.4 Cross-Platform Output Formats

| **Platform** | **NASM Format** | **GAS Flag**       |
| :---         | :---            | :---               |
| **Linux**    | `elf64`         | `--64`             |
| **macOS**    | `macho64`       | `--64` (with `-arch x86_64`) |
| **Windows**  | `win64`         | `--64` (with PE/COFF) |

Example: Conditional format in Makefile.

```makefile
UNAME := $(shell uname)
ifeq ($(UNAME), Linux)
    ASM_FORMAT = elf64
else ifeq ($(UNAME), Darwin)
    ASM_FORMAT = macho64
else
    ASM_FORMAT = win64
endif

build/%.o: src/asm/%.asm
	@mkdir -p $(dir $@)
	nasm -f $(ASM_FORMAT) -g -o $@ $<
```

---

## 18.4 Integrating Assembly with C and C++

The most common mixed-language scenario: linking assembly object files with C/C++ code.

### 18.4.1 Compiling C/C++ to Object Files

```bash
gcc -c -fPIC -g -Isrc/include -o build/main.o src/c/main.c
g++ -c -fPIC -g -Isrc/include -o build/wrapper.o src/cpp/wrapper.cpp
```

### 18.4.2 Linking into Static or Shared Libraries

Static library (`.a`):

```bash
ar rcs build/libmath.a build/math.o build/main.o
```

Shared library (`.so`):

```bash
gcc -shared -fPIC -o build/libmath.so build/math.o build/main.o
```

### 18.4.3 Complete Makefile Example

```makefile
CC = gcc
CXX = g++
NASM = nasm
CFLAGS = -fPIC -g -Isrc/include
LDFLAGS = -shared

ASM_FORMAT = elf64
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
    ASM_FORMAT = macho64
    LDFLAGS = -dynamiclib
endif

SRCS_ASM = src/asm/math.asm
SRCS_C = src/c/main.c
SRCS_CPP = src/cpp/wrapper.cpp

OBJS_ASM = $(SRCS_ASM:src/asm/%.asm=build/%.o)
OBJS_C = $(SRCS_C:src/c/%.c=build/%.o)
OBJS_CPP = $(SRCS_CPP:src/cpp/%.cpp=build/%.o)

TARGET = build/libmath.so

all: $(TARGET)

$(TARGET): $(OBJS_ASM) $(OBJS_C) $(OBJS_CPP)
	$(CC) $(LDFLAGS) -o $@ $^

build/%.o: src/asm/%.asm
	@mkdir -p $(dir $@)
	$(NASM) -f $(ASM_FORMAT) -g -o $@ $<

build/%.o: src/c/%.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c -o $@ $<

build/%.o: src/cpp/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CFLAGS) -c -o $@ $<

clean:
	rm -rf build/

.PHONY: all clean
```

---

## 18.5 Building with CMake

CMake is a cross-platform build system generator. It abstracts compiler and platform differences.

### 18.5.1 Basic CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.10)
project(MixedLangMath)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# Enable assembly support
enable_language(ASM_NASM)

# Set assembly flags
set(CMAKE_ASM_NASM_FLAGS "${CMAKE_ASM_NASM_FLAGS} -g")

# Platform-specific settings
if(APPLE)
    set(CMAKE_ASM_NASM_OBJECT_FORMAT macho64)
elseif(WIN32)
    set(CMAKE_ASM_NASM_OBJECT_FORMAT win64)
else()
    set(CMAKE_ASM_NASM_OBJECT_FORMAT elf64)
endif()

# Add assembly source
add_library(math_lib STATIC
    src/asm/math.asm
    src/c/main.c
    src/cpp/wrapper.cpp
)

# Include directories
target_include_directories(math_lib PRIVATE src/include)

# Create shared library
add_library(math_shared SHARED
    src/asm/math.asm
    src/c/main.c
    src/cpp/wrapper.cpp
)
target_include_directories(math_shared PRIVATE src/include)
```

Build:

```bash
mkdir build && cd build
cmake ..
make
```

### 18.5.2 Handling Dependencies

Link against external libraries:

```cmake
target_link_libraries(math_shared m pthread)
```

### 18.5.3 Installing Targets

```cmake
install(TARGETS math_shared
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)
install(FILES src/include/math.h
    DESTINATION include
)
```

---

## 18.6 Integrating with Rust (Cargo)

Rust’s build system, Cargo, can link against external static or shared libraries.

### 18.6.1 Using a Build Script (`build.rs`)

Create `build.rs` to compile assembly and C code before Rust compilation.

```rust
// build.rs
use std::env;
use std::path::PathBuf;

fn main() {
    let target = env::var("TARGET").unwrap();
    let out_dir = env::var("OUT_DIR").unwrap();

    // Compile assembly
    let asm_src = "src/asm/math.asm";
    let asm_obj = format!("{}/math.o", out_dir);
    let format = if target.contains("linux") {
        "elf64"
    } else if target.contains("darwin") {
        "macho64"
    } else if target.contains("windows") {
        "win64"
    } else {
        panic!("Unsupported target");
    };

    std::process::Command::new("nasm")
        .args(&["-f", format, "-o", &asm_obj, asm_src])
        .status()
        .expect("nasm failed");

    // Compile C wrapper
    cc::Build::new()
        .file("src/c/wrapper.c")
        .compile("wrapper");

    // Tell Rust linker to link our object
    println!("cargo:rustc-link-search=native={}", out_dir);
    println!("cargo:rustc-link-lib=static=math");
    println!("cargo:rustc-link-lib=static=wrapper");
}
```

### 18.6.2 Declare in `Cargo.toml`

```toml
[package]
name = "mixed_math"
version = "0.1.0"
build = "build.rs"

[build-dependencies]
cc = "1.0"
```

### 18.6.3 Call from Rust

```rust
// src/lib.rs
extern "C" {
    fn add_ints(a: i64, b: i64) -> i64;
}

pub fn safe_add(a: i64, b: i64) -> i64 {
    unsafe { add_ints(a, b) }
}
```

---

## 18.7 Integrating with Go (cgo and Custom Build Scripts)

Go uses cgo to interface with C, which can link assembly.

### 18.7.1 Basic cgo with Assembly

Go file (`math.go`):

```go
package main

/*
#cgo CFLAGS: -I./src/include
#cgo LDFLAGS: -L./build -lmath
#include "math.h"
*/
import "C"
import "fmt"

func main() {
    result := C.add_ints(5, 7)
    fmt.Println(result)
}
```

But this requires `libmath.so` to exist. Use a Makefile to build it first.

### 18.7.2 Makefile for Go + Assembly

```makefile
GO = go
NASM = nasm
CC = gcc

ASM_FORMAT = elf64
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
    ASM_FORMAT = macho64
endif

all: build/libmath.so run

build/libmath.so: build/math.o build/wrapper.o
	$(CC) -shared -o $@ $^

build/%.o: src/asm/%.asm
	@mkdir -p build
	$(NASM) -f $(ASM_FORMAT) -g -o $@ $<

build/%.o: src/c/%.c
	@mkdir -p build
	$(CC) -fPIC -c -o $@ $<

run:
	$(GO) run .

clean:
	rm -rf build/

.PHONY: all clean run
```

---

## 18.8 Integrating with Python (setuptools and Extension Modules)

Python extension modules can be built with assembly via setuptools.

### 18.8.1 Setup Script with Custom Build

`setup.py`:

```python
from setuptools import setup, Extension
from setuptools.command.build_ext import build_ext
import subprocess
import os

class CustomBuild(build_ext):
    def run(self):
        # Build assembly and C first
        subprocess.check_call(['make', '-C', 'src/asm'])
        build_ext.run(self)

module = Extension('pymath',
                   sources=['src/python/pymath.c'],
                   extra_objects=['src/asm/build/math.o'],
                   extra_compile_args=['-Isrc/include'],
                   extra_link_args=['-Lsrc/asm/build'])

setup(
    name='pymath',
    ext_modules=[module],
    cmdclass={'build_ext': CustomBuild},
)
```

### 18.8.2 Makefile in `src/asm/`

```makefile
ASM_FORMAT = elf64
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
    ASM_FORMAT = macho64
endif

build/math.o: math.asm
	@mkdir -p build
	nasm -f $(ASM_FORMAT) -g -o $@ $<

.PHONY: clean
clean:
	rm -rf build/
```

### 18.8.3 Build and Install

```bash
python setup.py build_ext --inplace
python -c "import pymath; print(pymath.add(5, 7))"
```

---

## 18.9 Integrating with Java (Maven and JNI)

Java uses JNI for native code. Build native library with Make or CMake, then package with Maven.

### 18.9.1 Maven `pom.xml`

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>mathlib</artifactId>
    <version>1.0</version>
    <packaging>jar</packaging>

    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.0.0</version>
                <executions>
                    <execution>
                        <id>build-native</id>
                        <phase>generate-sources</phase>
                        <goals>
                            <goal>exec</goal>
                        </goals>
                        <configuration>
                            <executable>make</executable>
                            <workingDirectory>src/main/native</workingDirectory>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

### 18.9.2 Makefile in `src/main/native/`

```makefile
UNAME := $(shell uname)
ifeq ($(UNAME), Darwin)
    LIB_EXT = dylib
    LDFLAGS = -dynamiclib
else ifeq ($(UNAME), Linux)
    LIB_EXT = so
    LDFLAGS = -shared
else
    LIB_EXT = dll
    LDFLAGS = -shared
endif

TARGET = ../../../../target/libmath.$(LIB_EXT)

$(TARGET): math_jni.o
	$(CC) $(LDFLAGS) -o $@ $^

%.o: %.asm
	nasm -f $(ASM_FORMAT) -g -o $@ $<

clean:
	rm -f *.o $(TARGET)
```

### 18.9.3 Load in Java

```java
public class MathLib {
    static {
        System.loadLibrary("math");
    }
    public native long add(long a, long b);
}
```

Build:

```bash
mvn compile
```

---

## 18.10 Integrating with JavaScript (Node.js and WebAssembly)

### 18.10.1 Node.js Native Addons with node-gyp

`binding.gyp`:

```json
{
  "targets": [
    {
      "target_name": "math",
      "sources": [ "src/nodejs/math.cc" ],
      "conditions": [
        ["OS=='linux'", {
          "conditions": [
            ["target_arch=='x64'", {
              "variables": { "asm_format": "elf64" }
            }]
          ]
        }],
        ["OS=='mac'", {
          "variables": { "asm_format": "macho64" }
        }]
      ],
      "actions": [
        {
          "action_name": "assemble",
          "inputs": [ "src/asm/math.asm" ],
          "outputs": [ "build/math.o" ],
          "action": [
            "nasm", "-f", "<(asm_format)", "-g", "-o", "build/math.o", "src/asm/math.asm"
          ]
        }
      ],
      "link_settings": {
        "libraries": [ "<(module_root_dir)/build/math.o" ]
      }
    }
  ]
}
```

Build:

```bash
node-gyp configure build
```

### 18.10.2 WebAssembly via Emscripten

Compile C wrapper to WASM:

```bash
emcc src/c/wrapper.c src/asm/math.asm -o dist/math.js \
    -s EXPORTED_FUNCTIONS='["_add_ints"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall"]'
```

Use in browser:

```html
<script src="dist/math.js"></script>
<script>
    Module.onRuntimeInitialized = () => {
        const result = Module.ccall('add_ints', 'number', ['number', 'number'], [5, 7]);
        console.log(result);
    };
</script>
```

---

## 18.11 Cross-Compilation and Platform-Specific Code

Build for multiple platforms from one host.

### 18.11.1 Cross-Compilation with GCC

Install cross-compilers:

```bash
# Ubuntu
sudo apt install gcc-mingw-w64-x86-64-posix
```

Cross-compile assembly:

```bash
x86_64-w64-mingw32-as --64 -o build/math.o src/asm/math.s
```

### 18.11.2 Conditional Compilation

Use preprocessor directives in C wrappers.

```c
#ifdef _WIN32
    // Windows-specific code
#elif __APPLE__
    // macOS-specific
#else
    // Linux/Unix
#endif
```

In assembly, use macros:

```x86asm
%ifdef WIN64
    ; Windows code
%elifdef MAC
    ; macOS code
%else
    ; Linux code
%endif
```

---

## 18.12 Debugging Build Failures

Common errors and solutions.

### 18.12.1 Linker Errors

- **Undefined reference**: Symbol not exported or misspelled.
  - Fix: Use `global` in assembly, check `nm` output.
- **Architecture mismatch**: Mixing 32-bit and 64-bit objects.
  - Fix: Ensure all compilers/assemblers target same architecture.
- **Missing library**: `-lfoo` not found.
  - Fix: Use `-L` to specify library path.

### 18.12.2 Assembly Errors

- **Invalid instruction**: Using AVX on non-AVX system.
  - Fix: Check CPU flags or use runtime dispatch.
- **Syntax error**: AT&T vs Intel syntax.
  - Fix: Use correct assembler flags.

### 18.12.3 Build System Errors

- **Missing dependency**: `nasm` not installed.
  - Fix: Install required tools.
- **Path error**: Hardcoded paths.
  - Fix: Use relative paths or environment variables.

---

## 18.13 Optimizing Build Performance

Large projects need fast, incremental builds.

### 18.13.1 Parallel Builds

Make:

```bash
make -j4
```

CMake:

```bash
cmake --build . --parallel 4
```

### 18.13.2 Caching

Use `ccache` for C/C++:

```bash
export CC="ccache gcc"
```

### 18.13.3 Incremental Assembly

Only rebuild changed files. Make and CMake do this by default.

---

## 18.14 Packaging and Distribution

Distribute your library via package managers.

### 18.14.1 Python: PyPI

```bash
python setup.py sdist bdist_wheel
twine upload dist/*
```

### 18.14.2 Rust: crates.io

```toml
# Cargo.toml
[package]
name = "mixed-math"
version = "0.1.0"
edition = "2021"
```

```bash
cargo publish
```

### 18.14.3 Java: Maven Central

Deploy JAR and native libraries.

### 18.14.4 System Packages: DEB, RPM, Homebrew

Example `debian/rules`:

```makefile
#!/usr/bin/make -f
%:
	dh $@ --with=autoreconf

override_dh_auto_build:
	make

override_dh_auto_install:
	make install DESTDIR=$$(pwd)/debian/mixed-math
```

---

## 18.15 Best Practices and Pitfalls

### 18.15.1 Best Practices Table

| **Practice**                  | **Description**                                                                 |
| :---                          | :---                                                                            |
| **Use Version-Controlled Build Scripts** | No manual steps — everything automated and reproducible.               |
| **Declare All Dependencies**  | Specify required tools (nasm, gcc, rustc, etc.) in documentation.       |
| **Test on All Target Platforms** | Linux, macOS, Windows — in CI if possible.                             |
| **Use Relative Paths**        | Avoid hardcoded `/usr/local` — use `$(CURDIR)` or CMake variables.      |
| **Provide Fallbacks**         | If nasm not found, try yasm or gas.                                        |
| **Clean Build Artifacts**     | `make clean` should remove all generated files.                            |
| **Document Build Steps**      | README.md should have exact commands to build from scratch.                |

### 18.15.2 Common Pitfalls

- **Silent Failures**: Missing `set -e` in shell scripts.
- **Race Conditions**: Parallel builds without proper dependencies.
- **Environment Assumptions**: Assuming `gcc` is always available.
- **Symbol Conflicts**: Not using unique prefixes for exported symbols.
- **Debug/Release Confusion**: Shipping debug builds to production.

> **“A build that works on your machine is a prototype. A build that works on any machine is a product.”**  
> Test your build scripts in clean containers or virtual machines. What works in your development environment will fail elsewhere if not designed for portability.

> **“The build system is the first test of your software’s design. If it’s fragile, your software is fragile.”**  
> Invest in robust, well-documented, automated builds. They are the foundation of reliable software delivery.

---

## 18.16 Exercises

1. Create a mixed C/assembly project with Makefile that builds a shared library.
2. Convert the above project to CMake and verify it builds on Linux and macOS.
3. Write a Rust crate that uses a build script to compile an assembly file and link it statically.
4. Create a Python extension module that calls an assembly function, using setuptools and a custom build step.
5. Build a Java JNI library with Maven that compiles assembly source during the build phase.
6. Write a Node.js native addon that links against an assembly object file using node-gyp.
7. Compile an assembly function to WebAssembly via Emscripten and call it from a web page.
8. Set up cross-compilation for Windows from Linux using MinGW.
9. Add parallel build support to a large Makefile project.
10. Package a mixed-language library for PyPI, including prebuilt wheels for multiple platforms.

---

## 18.17 Further Reading

- GNU Make Manual: https://www.gnu.org/software/make/manual/
- CMake Documentation: https://cmake.org/documentation/
- Rust Cargo Book: https://doc.rust-lang.org/cargo/
- Python setuptools: https://setuptools.pypa.io/
- Java JNI Guide: https://docs.oracle.com/javase/8/docs/technotes/guides/jni/
- Node.js node-gyp: https://github.com/nodejs/node-gyp
- Emscripten: https://emscripten.org/
