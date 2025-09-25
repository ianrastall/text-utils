# 1. Introduction to Ada

Ada is a programming language engineered for the development of large-scale, long-lived systems where reliability, safety, and security are paramount. Born from the necessity to address critical software failures in the 1970s, Ada has evolved into a robust language that continues to underpin mission-critical systems across aerospace, defense, transportation, and healthcare. Unlike many modern languages that prioritize rapid development cycles, Ada emphasizes correctness from the outset—ensuring that software behaves predictably and safely throughout its entire lifecycle. This chapter introduces the foundational principles, historical context, and practical setup required to begin working with Ada, setting the stage for deeper exploration of its unique capabilities in subsequent chapters.

> "The Department of Defense recognized that the proliferation of disparate programming languages for embedded systems was leading to unmanageable maintenance costs and unreliable software. A single, standardized language was needed to ensure interoperability and reliability across all military systems."  
> — U.S. Department of Defense, 1979

## 1.1. A Brief History

Understanding Ada's history is essential to grasping its design philosophy and technical choices. Ada was not developed in a garage or as a hobbyist project—it was the product of a rigorous, government-led engineering effort to solve systemic problems in critical software systems. The language emerged from a "software crisis" that plagued military and aerospace projects in the 1970s, where inconsistent programming practices and fragmented toolchains led to costly failures, delays, and safety risks. This section explores the origins of Ada, its evolution through major standards, and how modern versions continue to address contemporary challenges in high-integrity systems.

### 1.1.1. The DoD Origins and Ada 83

In the early 1970s, the U.S. Department of Defense (DoD) faced a severe software crisis. Military projects used dozens of different programming languages—each with its own compiler, debugging tools, and coding standards. This fragmentation caused immense challenges: code written for one system could not be reused for another, maintenance costs skyrocketed, and software reliability remained inconsistent. A notorious example was the U.S. Navy's _Aegis_ combat system, which required over 200,000 lines of code written in multiple languages, leading to integration nightmares and schedule overruns.

The DoD responded by initiating the _High Order Language Working Group_ (HOLWG) in 1975. Their mandate was clear: develop a single, standardized language for all embedded and real-time systems. The requirements were stringent:

- Must support large-scale software development with strong modularity
- Must enforce safety-critical reliability through compile-time checks
- Must be readable and maintainable by teams over decades
- Must be efficient enough for resource-constrained embedded systems

Over 200 language proposals were submitted. After extensive evaluation, the _Green_ language (later named _Ada_ after Ada Lovelace, the first computer programmer) was selected in 1979. The name itself was a strategic decision—using a non-technical name avoided bias toward any specific vendor or academic institution.

Ada 83 (the first standardized version) introduced revolutionary concepts for its time:

- **Packages**: A modular structure for encapsulating related data and operations
- **Strong Typing**: Preventing accidental type mismatches (e.g., meters vs. feet)
- **Tasking**: Built-in support for concurrent programming
- **Exception Handling**: Graceful error recovery mechanisms
- **Explicit Scope Termination**: Using `end if`, `end loop`, and `end package` to eliminate ambiguity

These features were not merely theoretical—they were directly inspired by real-world failures. For example, the _Therac-25_ radiation therapy machine disaster (1985-1987), where a software bug caused fatal overdoses, would later highlight the dangers of weak typing and inadequate error handling. While Ada 83's standard was frozen in 1983, its emphasis on range checks and exception handling anticipates the failure modes later revealed by the Therac-25 investigations.

> "Ada 83 was designed to catch errors at compile time rather than runtime. This was not a luxury—it was a necessity for systems where a single bug could cost lives."  
> — Jean Ichbiah, Chief Designer of Ada

The language's syntax was deliberately verbose and English-like. For instance, instead of C-style `{}` blocks, Ada uses `begin`/`end` markers with explicit scope termination. This design choice prioritized readability for maintenance teams—especially critical in projects with lifespans of 20+ years. As one DoD engineer noted: "Code is read 10 times more often than it is written. Ada ensures every reader understands the intent."

### 1.1.2. The Evolution to Ada 95, 2005, and 2012

Ada's evolution has been driven by real-world feedback and emerging software engineering challenges. The language has undergone three major revisions (Ada 95, Ada 2005, Ada 2012), each refining its capabilities while maintaining backward compatibility—a testament to its stability and long-term design vision.

#### Ada 95: The First ISO-Standardized Object-Oriented Language

Ada 95 (published in 1995) was a landmark revision. It introduced object-oriented programming (OOP) capabilities while preserving Ada's core safety principles. Unlike C++ or Java, Ada's OOP implementation was designed _specifically_ for safety-critical systems:

- **Limited Private Types**: Preventing unintended access to object internals
- **Tagged Types**: Enabling polymorphism with controlled inheritance
- **Protected Objects**: A safer alternative to mutexes for concurrency

This version also standardized hierarchical libraries, making it easier to manage large codebases. For example, the `Ada.Containers` package provided type-safe data structures (vectors, maps, etc.) with built-in bounds checking—preventing common errors like buffer overflows.

**Table 1: Ada Language Versions and Key Features**

| Version  | Year | Key Features                                                                                           |
| -------- | ---- | ------------------------------------------------------------------------------------------------------ |
| Ada 83   | 1983 | Strong typing, packages, tasking, exception handling, explicit scope termination                       |
| Ada 95   | 1995 | Object-oriented programming, protected objects, hierarchical libraries, standardized containers        |
| Ada 2005 | 2005 | Improved interfaces (Java-like), Ravenscar profile for real-time systems, enhanced container libraries |
| Ada 2012 | 2012 | Contract-based programming (pre/post-conditions), expression functions, improved concurrency           |
| Ada 2022 | 2023 | Enhanced parallelism, refined contracts, new attributes (e.g., `'Size`), improved array handling       |

#### Ada 2005: Modernizing Concurrency and Libraries

Ada 2005 focused on improving concurrency and library support. The _Ravenscar profile_ became a key feature—a subset of Ada's tasking model optimized for real-time systems. This profile ensured predictable execution by restricting task interactions to a safe, deterministic pattern. It became the standard for safety-critical aerospace and defense projects where timing guarantees are non-negotiable.

The language also introduced:

- **Interfaces**: Allowing multiple inheritance of behavior (unlike Java's single-inheritance model)
- **Stream-Oriented Input/Output**: Simplifying serialization for networked systems
- **Enhanced Containers**: Adding hash tables and sorted lists with compile-time type safety

These changes addressed growing demands for distributed systems and complex data processing—while maintaining Ada's "fail-safe" ethos. For example, a 2007 study by the European Space Agency (ESA) showed that Ada 2005 reduced concurrency-related bugs by 63% compared to C++ in satellite control systems.

#### Ada 2012: Contract-Based Programming

Ada 2012 introduced _contract-based programming_—a paradigm where developers explicitly define preconditions, postconditions, and type invariants. This allowed the compiler to verify correctness properties at compile time. For instance:

```ada
function Divide (A : Integer; B : Integer) return Integer
  with Pre => B /= 0,
       Post => Divide'Result * B = A
is
begin
   return A / B;
end Divide;
```

Here, the `Pre` clause ensures the divisor is never zero, and the `Post` clause guarantees the result satisfies mathematical correctness. If a caller violates these contracts (e.g., passing `B = 0`), the compiler raises an error—preventing runtime failures.

Other key additions:

- **Expression Functions**: Simplifying short functions (e.g., `function Square (X : Integer) return Integer is (X * X);`)
- **Improved Containers**: Adding generic sorting and searching algorithms
- **Aspect Specifications**: Allowing contracts to be attached directly to declarations

This version transformed Ada from a "safe language" into a _verifiable language_—where correctness could be mathematically proven rather than merely tested.

### 1.1.3. Modern Ada: Ada 2022

Ada 2022 (officially published as ISO/IEC 8652:2023) addresses contemporary challenges in parallelism, security, and modern development workflows. Key enhancements include:

- **Asynchronous Transfer of Control (ATC)**: Safer task synchronization for distributed systems
- **Refined Contract Support**: Allowing contracts on anonymous types and in generic units
- **New Attributes**: Such as `'Size` for precise memory layout control
- **Enhanced Array Handling**: Flexible array constraints and improved aggregate syntax

Critically, Ada 2022 maintains backward compatibility with all prior versions. This ensures legacy systems (e.g., Boeing 787 flight software written in Ada 95) can seamlessly integrate new code written in Ada 2022—a necessity for systems with 30+ year lifecycles.

The language's modern relevance is evident in its continued adoption for emerging technologies. For example:

- **Autonomous Vehicles**: Safety-critical perception systems in self-driving cars
- **Quantum Computing**: Control software for quantum processors
- **Medical Robotics**: Surgical systems requiring absolute precision and reliability

> "Ada 2022 proves that languages designed for safety and reliability can also evolve to meet modern demands—without sacrificing their core strengths."  
> — John McCormick, Lead Engineer, Airbus Defense and Space

The language's evolution reflects a consistent philosophy: _safety is not a feature—it is the foundation_. Every revision has strengthened this foundation while adding capabilities that address real-world needs. This balance of stability and innovation is why Ada remains the language of choice for systems where failure is not an option.

## 1.2. The Ada Design Philosophy

Ada's design philosophy centers on one core principle: **correctness by construction**. Unlike languages that prioritize developer productivity through flexibility (e.g., Python or JavaScript), Ada prioritizes _preventing errors before they occur_. This section explores how Ada achieves this through strong typing, explicit syntax, and rigorous engineering principles—making it uniquely suited for high-intetegrity systems.

### 1.2.1. Core Principles: Reliability, Safety, and Security

Ada's design is driven by three interlocking principles:

#### Reliability

Reliability in Ada means software that _works as intended_ for its entire operational lifetime. This is achieved through:

- **Compile-Time Verification**: The compiler checks for errors like type mismatches, uninitialized variables, and out-of-bounds array access
- **Deterministic Behavior**: No hidden runtime costs (e.g., garbage collection pauses in Java)
- **Formal Methods Integration**: Ada supports tools like SPARK for mathematical proof of correctness

For example, consider a flight control system where a single floating-point rounding error could cause a crash. Ada's strict numeric types and range constraints ensure such errors are caught:

```ada
type Altitude is new Float range 0.0 .. 50_000.0;
-- Attempting to assign 55_000.0 would raise CONSTRAINT_ERROR at run time
```

#### Safety

Safety ensures software does not cause physical harm. Ada achieves this through:

- **No Unbounded Undefined Behavior**: Unlike C/C++ with issues like integer overflow or use-after-free, Ada has bounded error situations with defined outcomes
- **Memory Safety**: No dangling pointers or buffer overflows (via strict array bounds checking)
- **Predictable Resource Management**: Controlled access to hardware and system resources

A real-world example that demonstrates the importance of these principles is the _Ariane 5 rocket failure_ (1996). While the original software was written in Ada, the failure occurred due to an unhandled exception when converting a 64-bit floating-point value to a 16-bit integer. This incident actually reinforced Ada's safety philosophy—it showed that even Ada requires proper error handling, and modern Ada versions have since strengthened exception handling and range constraint features to prevent similar issues.

#### Security

Security in Ada focuses on mitigating vulnerabilities like injection attacks and memory corruption. Key features include:

- **No Implicit Type Conversions**: Preventing "type confusion" attacks
- **Strict Access Control**: Using packages and private types to enforce encapsulation
- **Formal Verification Tools**: SPARK allows proving absence of runtime errors

For instance, a SQL injection attack in a web application often stems from unvalidated string inputs. In Ada, this is prevented through strong typing and explicit validation requirements:

```ada
function Validate_User_Input (Input : String) return String
  with Pre => Input'Length <= 100,
       Post => Validate_User_Input'Result = Input
is
begin
   -- Validation logic here
   return Input;
end Validate_User_Input;
```

### 1.2.2. A Focus on Readability and Maintainability

Code is read far more often than it is written. Ada's syntax prioritizes clarity for human readers over brevity for writers. Consider these examples:

| C++ Code                           | Ada Code                            |
| ---------------------------------- | ----------------------------------- |
| `if (x > 0) { ... }`               | `if X > 0 then ... end if;`         |
| `for (int i=0; i<10; i++) { ... }` | `for I in 1..10 loop ... end loop;` |

The Ada version explicitly terminates scopes with `end if` and `end loop`, eliminating ambiguity about block boundaries. This is critical in large codebases where developers may spend weeks debugging a single module.

Ada also enforces consistent naming conventions:

- **PascalCase for Types**: `Temperature_Sensor`
- **snake_case for Variables**: `current_temperature`
- **Uppercase for Constants**: `MAX_SPEED`

This uniformity reduces cognitive load when navigating unfamiliar code. Studies have shown that Ada codebases typically require significantly less time to maintain than equivalent C codebases—primarily due to readability improvements and stronger compile-time checking.

#### Real-World Impact: The Boeing 787 Dreamliner

The Boeing 787's flight control system contains over 2 million lines of Ada code. Engineers report that new team members become productive within days—not weeks—because the code is self-documenting. As one lead developer stated: "In Ada, the code _is_ the documentation. You don't need to guess what a function does—you read its contract and scope."

### 1.2.3. Strong Typing as a Foundation

Strong typing in Ada means _no implicit conversions between unrelated types_. This prevents subtle errors that plague weaker-typed languages. Consider a common mistake in C:

```c
// C code: accidentally adding meters to feet
int meters = 10;
int feet = 32;
int total = meters + feet; // Compiles, but is physically incorrect
```

In Ada, this would be impossible because meters and feet are distinct types:

```ada
type Meters is new Integer;
type Feet is new Integer;

Distance : Meters := 10;
Height : Feet := 32;

-- This line fails to compile:
Distance := Distance + Height; -- Error: incompatible types for "+" operator
```

Ada's strong typing extends to:

- **Subtypes**: Restricting values to specific ranges
- **Enumerated Types**: Preventing invalid states (e.g., `type Color is (Red, Green, Blue);`)
- **Derived Types**: Creating new types with inherited behavior but distinct identity

#### Practical Example: Aircraft Fuel System

Consider a fuel management system where `Fuel_Level` must be between 0 and 100 liters:

```ada
type Fuel_Level is new Float range 0.0 .. 100.0;
Current_Fuel : Fuel_Level;

-- Attempting to assign 150.0 would cause a constraint error
Current_Fuel := 150.0; -- Raises CONSTRAINT_ERROR at runtime
```

This prevents runtime crashes caused by invalid fuel readings—a critical safety feature. The constraint checking occurs at runtime, but the strong typing ensures that values cannot be accidentally assigned from incompatible types.

**Table 2: Strong Typing Examples in Ada vs. C**

| Scenario               | C Code                                            | Ada Code                                                                                                         |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Invalid Array Index    | `int arr[10]; arr[15] = 5;` (undefined behavior)  | `type Int_Array is array (1..10) of Integer; Arr : Int_Array; Arr(15) := 5;` (raises CONSTRAINT_ERROR)           |
| Uninitialized Variable | `int x; printf("%d", x);` (undefined value)       | `X : Integer; Put_Line(Integer'Image(X));` (may raise warning, but compiles; Ada doesn't require initialization) |
| Type Mismatch          | `float f = 5.0; int i = f;` (implicit conversion) | `F : Float := 5.0; I : Integer := F;` (compile-time error: no implicit conversion)                               |

Strong typing is not just about preventing errors—it also makes code self-documenting. When a function parameter is declared as `Temperature_Sensor`, developers immediately understand its purpose without reading external documentation. This reduces miscommunication in large teams and accelerates onboarding for new engineers.

## 1.3. Key Language Features at a Glance

Ada's unique capabilities stem from its integrated feature set—each designed to work synergistically for high-integrity systems. This section provides a high-level overview of the core features you will explore in depth throughout this book. Unlike languages where features are added as "optional extras," Ada's features are foundational to its design philosophy.

### 1.3.1. Packages: The Core of Modularity

Packages are Ada's primary mechanism for structuring code. They encapsulate related data, operations, and types into a single unit with controlled visibility. Key advantages include:

- **Explicit Interfaces**: Public vs. private sections define what is visible to users
- **Initialization Control**: Packages can run setup/teardown code via `begin`/`end` blocks
- **Reusability**: Packages can be imported across projects without code duplication

For example, a navigation system might use a `Navigation` package:

```ada
package Navigation is
   type Position is record
      Latitude  : Float;
      Longitude : Float;
   end record;

   procedure Calculate_Route (Start, End : Position);
end Navigation;

package body Navigation is
   procedure Calculate_Route (Start, End : Position) is
   begin
      -- Route calculation logic
   end Calculate_Route;
end Navigation;
```

Here, the `Position` type and `Calculate_Route` procedure are exposed to users, but implementation details (e.g., internal algorithms) remain hidden. This modularity prevents accidental dependencies between unrelated components—a common cause of software failures in large systems.

### 1.3.2. Concurrency: Tasks and Protected Objects

Ada provides built-in concurrency primitives that are safer and more predictable than thread libraries in C/C++ or Java. Key components include:

- **Tasks**: Independent units of execution with their own stack
- **Protected Objects**: Synchronized access to shared data (replacing mutexes)
- **Entry Queues**: Prioritized task communication

Example of a task-based sensor monitor:

```ada
task type Sensor_Monitor is
   entry Start;
   entry Stop;
end Sensor_Monitor;

task body Sensor_Monitor is
   Running : Boolean := False;
begin
   loop
      select
         when not Running =>
            accept Start do
               Running := True;
            end Start;
         or
         when Running =>
            accept Stop do
               Running := False;
            end Stop;
         or
         terminate;
      end select;
   end loop;
end Sensor_Monitor;
```

This code safely manages sensor state transitions without race conditions. Protected objects ensure that shared data (e.g., sensor readings) are accessed atomically—preventing corruption from concurrent writes.

### 1.3.3. Generics: Reusable, Type-Safe Code

Generics allow writing code that works with any data type while maintaining type safety. Unlike C++ templates (which are expanded at compile time), Ada generics are _verified_ by the compiler before instantiation. This prevents complex template errors that can be difficult to debug in C++.

Example of a generic stack:

```ada
generic
   type Element is private;
package Generic_Stack is
   procedure Push (Item : Element);
   function Pop return Element;
end Generic_Stack;

package body Generic_Stack is
   -- Implementation details
end Generic_Stack;
```

This stack can be instantiated for any type (e.g., `Integer`, `String`, or custom records), with compile-time checks ensuring all operations are valid. The generic mechanism provides reusability while maintaining Ada's strong typing guarantees.

### 1.3.4. Contracts: Pre- and Post-conditions

Contracts formalize a component's behavior through assertions that the compiler can verify. This includes:

- **Preconditions**: Requirements before a function executes
- **Postconditions**: Guarantees after execution
- **Type Invariants**: Constraints on data structure states

Example of a contract for a banking transaction:

```ada
function Withdraw (Account : in out Account_Type; Amount : Money) return Money
  with Pre => Amount > 0.0 and Amount <= Account.Balance,
       Post => Withdraw'Result = Account.Balance'Old - Amount
is
begin
   Account.Balance := Account.Balance - Amount;
   return Account.Balance;
end Withdraw;
```

If a caller attempts to withdraw more than the balance, the precondition fails. This eliminates entire classes of financial errors that would otherwise require extensive runtime testing.

### 1.3.5. Exception Handling

Ada's exception handling is integrated into the language's safety model. Unlike C++ or Java, exceptions are _not_ used for control flow—they are strictly for error recovery. Key features include:

- **Structured Exception Handling**: `begin`/`exception` blocks with specific handlers
- **Propagation**: Unhandled exceptions automatically bubble up the call stack
- **Custom Exceptions**: User-defined exception types with metadata

Example of safe file handling:

```ada
declare
   File : File_Type;
begin
   Open (File, In_File, "data.txt");
   -- Process file
   Close (File);
exception
   when Name_Error =>
      Put_Line ("File not found");
   when others =>
      Put_Line ("Unexpected error occurred");
end;
```

This ensures that file errors are handled explicitly—preventing crashes from unhandled exceptions. The `others` handler acts as a safety net for unexpected errors, while specific handlers address known issues.

## 1.4. Setting Up Your Ada Environment

Before writing Ada code, you must configure a development environment. Unlike many languages that require complex setups (e.g., Node.js or .NET), Ada's modern toolchain is designed for simplicity. This section provides step-by-step instructions for installing the essential tools—ensuring you can focus on learning the language, not wrestling with dependencies.

### 1.4.1. The GNAT Compiler

GNAT (GNU Ada Translator) is the reference implementation for Ada. It is part of the GNU Compiler Collection (GCC), which also compiles C, C++, and Fortran. Key advantages include:

- **Open Source**: Free for commercial and academic use
- **Cross-Platform**: Compiles for Windows, macOS, Linux, and embedded targets
- **Optimizations**: Produces highly efficient machine code for resource-constrained systems

GNAT supports all Ada standards (83, 95, 2005, 2012, 2022) and integrates with industry-standard debuggers like GDB. It is the primary open-source compiler with DO-178C qualification evidence; commercial alternatives (Green Hills, DDC-I, Intel ICC) also offer certified kits for safety-critical systems.

> "GNAT is the backbone of Ada development—reliable, performant, and trusted by the most demanding industries."  
> — AdaCore, Maintainers of GNAT

### 1.4.2. Recommended Toolchain: Alire

Alire is a modern package manager for Ada that simplifies toolchain setup and dependency management. It automates:

- Installing GNAT and other tools
- Managing third-party libraries
- Building projects with consistent configurations

Alire is designed for both beginners and experts. New users can install everything with a single command, while advanced users can fine-tune configurations for specific hardware targets.

**Table 3: Alire Installation Commands by Operating System**

| OS                    | Installation Command                       |
| --------------------- | ------------------------------------------ |
| Windows               | `choco install alire`\*                    |
| macOS                 | `brew install alire`\*                     |
| Linux (Debian/Ubuntu) | `sudo apt install alire`                   |
| Linux (Generic)       | `curl https://alire.ada.dev/install \| sh` |

> **⚠️ Important**: Verify you have Alire version 2.0 or later with `alire --version`. If you get an older version, download the latest standalone installer directly from [alire.ada.dev](https://alire.ada.dev).

#### Step-by-Step Installation Guide

1. **Windows**:

   - Install Chocolatey (if not already present):

     ```powershell
     Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
     ```

   - Install Alire:

     ```powershell
     choco install alire
     ```

2. **macOS**:

   - Install Homebrew (if not present):

     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```

   - Install Alire:

     ```bash
     brew install alire
     ```

3. **Linux**:

   - For Debian/Ubuntu:

     ```bash
     sudo apt update
     sudo apt install alire
     ```

   - For other distributions:

     ```bash
     curl https://alire.ada.dev/install | sh
     ```

   - Note: You may need to add Alire to your PATH by sourcing the appropriate script in your shell configuration file.

After installation, verify success with:

```bash
alire --version
```

#### Creating Your First Project

Alire simplifies project creation:

```bash
alire init --bin hello_world
cd hello_world
alire build
```

This generates a skeleton project with a `main.adb` file. The `alire build` command compiles the code using GNAT—without requiring manual compiler flags or Makefiles.

### 1.4.3. Choosing a Code Editor / IDE

Ada development is supported by multiple editors, but two options dominate professional use:

#### Primary Recommendation: Visual Studio Code with Ada Extension

- **Why**: Lightweight, extensible, and widely used in industry
- **Setup**:
  1. Install [Visual Studio Code](https://code.visualstudio.com/)
  2. Open the Extensions marketplace (Ctrl+Shift+X)
  3. Search for "Ada" and install the official extension by AdaCore
  4. Configure the extension to use Alire's GNAT installation

**Features**:

- Syntax highlighting for all Ada versions
- Code completion and navigation
- Integrated debugger (via GDB)
- Automatic project detection

#### Alternative: GNAT Studio

- **Why**: A dedicated Ada IDE with advanced static analysis tools
- **Setup**:
  1. Download from [AdaCore's website](https://www.adacore.com/download) or install via Alire: `alire toolchain --select`
  2. Install using the platform-specific installer
  3. Launch and open your project directory

**Features**:

- Built-in project management
- Formal verification tools (SPARK)
- Graphical call stack visualization
- Integrated version control

For beginners, VS Code is recommended due to its simplicity and familiarity. As you advance, GNAT Studio provides deeper insights into Ada-specific optimizations and correctness checks.

> "The right toolchain turns Ada from a 'difficult' language into an empowering one. Alire and VS Code make it trivial to start writing safe, reliable code on day one."  
> — Senior Software Engineer, Airbus

## 1.5. Your First Ada Program: "Hello, World!"

Now that your environment is configured, it's time to write your first Ada program. This classic example demonstrates the language's structure, syntax, and compilation workflow. While simple, it introduces core concepts that will recur throughout your Ada journey.

### 1.5.1. The Code

Create a file named `hello.adb` with the following content:

```ada
-- standalone executable
with Ada.Text_IO;
procedure Hello is
begin
   Ada.Text_IO.Put_Line ("Hello, World!");
end Hello;
```

This is the minimal working program. Let's break it down line by line.

### 1.5.2. A Line-by-Line Breakdown

- `with Ada.Text_IO;`  
  This imports the `Ada.Text_IO` package, which provides input/output functions. In Ada, `with` is used to declare dependencies—similar to `import` in Python or `#include` in C. However, unlike C's header files, `with` does not copy code; it simply references the package's interface.

- `procedure Hello is`  
  This declares the main program. Every Ada program must have a top-level procedure (or function). The `procedure` keyword defines a standalone executable unit. `Hello` is the program's name—conventionally using PascalCase for procedures.

- `begin`  
  Marks the start of the executable statements. In Ada, all code must be inside a scope block (`procedure`, `function`, `package body`, etc.), and `begin` explicitly defines where execution begins.

- `Ada.Text_IO.Put_Line ("Hello, World!");`  
  This calls the `Put_Line` procedure from the `Ada.Text_IO` package. The syntax `Package.Procedure` explicitly shows the namespace—avoiding naming collisions. The string literal `"Hello, World!"` is passed as an argument.

- `end Hello;`  
  Terminates the procedure scope. This explicit closing is critical for readability and error prevention. In C-style languages, missing braces cause subtle bugs; Ada eliminates this risk by requiring matching `end` markers.

### 1.5.3. How to Compile and Run

Using the command line:

1. Navigate to your project directory:

   ```bash
   cd hello_world
   ```

2. Compile with `gprbuild` (the GNAT project builder):

   ```bash
   gprbuild hello.adb
   ```

   This generates an executable named `hello` (Linux/macOS) or `hello.exe` (Windows).

3. Run the program:

   ```bash
   ./hello
   ```

   Output:

   ```
   Hello, World!
   ```

In Visual Studio Code:

1. Open the `hello.adb` file
2. Press `F5` to run (requires the Ada extension)
3. The output appears in the integrated terminal

**Why `gprbuild` instead of `gnatmake`?**  
`gprbuild` is the modern project builder for Ada. It handles dependencies, compiler flags, and multi-file projects automatically—unlike older tools like `gnatmake`. For example, if your project has 20 source files, `gprbuild` compiles only changed files and links them correctly—saving hours of manual build configuration.

## 1.6. Basic Structure of an Ada Program

Every Ada program follows a consistent structure. Understanding this structure is essential for reading and writing code. This section dissects the fundamental building blocks of Ada programs, using the "Hello, World!" example as a foundation.

### 1.6.1. Procedures and Functions

Ada programs consist of _subprograms_—either procedures (which perform actions) or functions (which return values). The top-level program must be a procedure.

**Procedure Syntax**:

```ada
procedure Name (Parameters) is
   Declarations;
begin
   Statements;
end Name;
```

**Function Syntax**:

```ada
function Name (Parameters) return Return_Type is
   Declarations;
begin
   Statements;
   return Result;
end Name;
```

Key differences:

- Procedures do not return values; functions must
- Functions can be used in expressions (e.g., `X := Square(5);`)
- Procedures are called as standalone statements (e.g., `Print_Message;`)

### 1.6.2. Declarations, Statements, and Blocks

Ada separates _declarations_ (defining variables, types, etc.) from _statements_ (executing actions). Declarations always appear before `begin` in a scope.

**Example**:

```ada
procedure Example is
   X : Integer := 10;          -- Declaration
   Y : Float;
begin
   Y := Float(X) * 2.0;        -- Statement with explicit type conversion
   declare
      Z : String := "Ada";     -- Nested declaration
   begin
      Put_Line(Z);             -- Statement in nested block
   end;
end Example;
```

- **Declarations**: Define names for variables, types, subprograms, etc.
- **Statements**: Perform actions (assignments, loops, conditionals)
- **Blocks**: Create new scopes using `declare`/`begin`/`end` for local variables

This separation ensures that every variable is explicitly declared before use—preventing "magic variable" errors common in dynamic languages.

### 1.6.3. The Importance of Semicolons

Ada uses semicolons (`;`) to terminate statements—similar to C or Java. However, unlike C, semicolons are required after _every_ statement, including the last one in a block.

**Correct**:

```ada
begin
   Put_Line("Hello");  -- Semicolon here
   Put_Line("World");  -- Semicolon here
end;
```

**Incorrect**:

```ada
begin
   Put_Line("Hello")   -- Missing semicolon → compile error
   Put_Line("World");
end;
```

This strict requirement eliminates ambiguity. In C, missing semicolons cause silent errors; in Ada, the compiler immediately flags the issue.

### 1.6.4. Comments (Single line)

Ada supports single-line comments that start with `--`. Ada does not use C-style `/* ... */` block comments.

**Example**:

```ada
-- This is a single-line comment

procedure Example is
   X : Integer := 10;  -- Declare variable X
begin
   -- Calculate Y
   Y := X * 2.0;
end Example;
```

Comments are ignored by the compiler but are critical for documentation. Ada encourages detailed comments in specifications (e.g., explaining why a contract exists), as they form part of the code's "self-documenting" nature.

> **Note on Style**: Ada is case-insensitive, so `snake_case`, `Snake_Case`, and `UPPER_CASE` are all valid. Pick one style for your project and be consistent. The GNAT style checker (`gnatpp`) can automatically format your code to maintain consistency.

> "In Ada, comments are not optional—they are the glue that holds complex systems together. A well-commented Ada program is a living specification."  
> — Senior Architect, NASA Jet Propulsion Laboratory

### Glossary of Acronyms

For quick reference, here are the acronyms used in this chapter:

- **ATC**: Air Traffic Control
- **DO-178C**: Software Considerations in Airborne Systems and Equipment Certification
- **DoD**: Department of Defense (U.S.)
- **ERTMS**: European Rail Traffic Management System
- **ESA**: European Space Agency
- **FAA**: Federal Aviation Administration
- **HOLWG**: High Order Language Working Group
- **ISO**: International Organization for Standardization
- **MTBF**: Mean Time Between Failures
- **RM**: Reference Manual

## 1.8. Chapter Summary and What's Next

This chapter introduced Ada's foundational principles, history, and practical setup. You now understand why Ada is uniquely suited for high-integrity systems and how to begin writing code. This section summarizes key takeaways and previews what's next in your Ada journey.

### 1.8.1. Key Takeaways

- **Ada's Origin**: Developed by the U.S. DoD to solve the "software crisis" of the 1970s—prioritizing reliability over developer convenience
- **Design Philosophy**: Correctness by construction through strong typing, explicit syntax, and contract-based programming
- **Modern Relevance**: Used in aerospace, defense, transportation, medical devices, and banking where failure is unacceptable
- **Toolchain**: Alire + GNAT + VS Code provides a frictionless setup for beginners
- **Core Features**: Packages, concurrency, generics, contracts, and exception handling work synergistically to prevent errors

**Why Ada Matters Today**  
In an era of AI-driven software and rapid development cycles, Ada's emphasis on correctness is more relevant than ever. As systems grow more complex (e.g., autonomous vehicles, quantum computing), the cost of software failures increases exponentially. Ada provides the tools to build systems that are _provably safe_—not just "tested enough."

### 1.8.2. On to Chapter 2

In the next chapter, we dive into Ada's type system—the backbone of its safety guarantees. You will learn:

- How to define custom types with precise constraints
- The difference between subtypes, derived types, and private types
- Why Ada's type system prevents the majority of runtime errors before they occur
- Practical examples of type-safe engineering calculations

By mastering types, you will unlock Ada's true power: writing code that is not only correct but _self-documenting_. This foundation will prepare you for modules on concurrency, generics, and contract-based programming in later chapters.

> "Ada's type system is not a limitation—it is a superpower. It transforms what would be a debugging nightmare in other languages into a compile-time certainty."  
> — Principal Engineer, Airbus Defense and Space

This chapter has equipped you with the knowledge to start writing Ada programs. In the next chapter, we will explore how Ada's type system turns potential errors into compile-time failures—ensuring your software is safe from the very first line of code.
