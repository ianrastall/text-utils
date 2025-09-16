# 24\. Ada and C/C++ Interoperability

Interoperability between programming languages is a critical skill for modern software developers, especially when leveraging existing libraries or integrating components written in different languages. While Ada's strong typing and safety features make it ideal for building robust systems, many valuable libraries and frameworks exist only in C or C++. This chapter explores how Ada can seamlessly interact with C and C++ code—enabling developers to harness the strengths of both worlds without sacrificing safety or maintainability. Unlike previous chapters focused on safety-critical systems, this tutorial targets general-purpose applications where interoperability solves practical problems: using a C graphics library for a desktop application, integrating Ada code into a C++ game engine, or connecting to a database via SQLite from Ada. Whether you're a beginner exploring language boundaries or an experienced developer building hybrid systems, these techniques will empower you to create more capable software with fewer limitations.

> "Ada's interoperability with C is one of its strongest features, allowing developers to leverage existing C libraries while maintaining Ada's safety and reliability. This capability turns Ada from a standalone language into a versatile component of larger systems." — AdaCore Developer

> "When integrating Ada with C++, the key is to use C as a bridge. C++'s name mangling makes direct interfacing difficult, but a C interface layer solves this elegantly while preserving type safety." — Senior Software Engineer

## Why Interoperability Matters for General-Purpose Applications

Interoperability isn't just for aerospace or defense projects—it's essential for everyday software development. Consider these real-world scenarios:

- A Python web application needs high-performance numerical calculations; integrating Ada's math libraries through C bindings improves performance without rewriting the entire system.
- A C++ game engine requires a specialized physics simulation; Ada's strong typing ensures calculations are precise and free from subtle bugs.
- A legacy C database application needs modern security features; Ada's cryptography libraries can be wrapped in C interfaces for seamless integration.
- A cross-platform desktop application uses a C GUI toolkit; Ada's object-oriented features can extend the toolkit with type-safe components.

Unlike languages with limited interoperability (e.g., Python's GIL blocking true parallelism in C extensions), Ada provides first-class support for C and C++ integration. Its `Interfaces.C` package offers standardized type mappings, while pragmas like `Import` and `Export` handle calling conventions automatically. This makes Ada uniquely suited for hybrid systems where safety and performance coexist.

### Language Interoperability Comparison

| **Feature** | **Ada** | **Python** | **C++** | **Java** |
| :--- | :--- | :--- | :--- | :--- |
| **C Interoperability** | Built-in `Interfaces.C` with compile-time checks | ctypes (dynamic, runtime errors) | Native support but manual memory management | JNI (complex, verbose) |
| **C++ Interoperability** | Requires C bridge layer but safe | Limited via CPython API | Native but name mangling issues | JNI with C bridge |
| **Data Type Safety** | Compile-time verification of mappings | Dynamic type checking (runtime errors) | Manual verification | JVM type safety |
| **Memory Management** | Automatic with explicit control | Garbage collected | Manual or smart pointers | Garbage collected |
| **Exception Handling** | Safe propagation through C bridges | CPython exceptions not propagated | Native C++ exceptions | JVM exceptions not propagated |
| **Build Integration** | GNAT project files for mixed-language projects | Custom build scripts | Native C++ build systems | Maven/Gradle for JNI |

This table highlights Ada's advantages. For example, when calling a C function from Ada, the compiler verifies parameter types and calling conventions at compile time. In Python, using `ctypes` requires manual type declarations that can fail at runtime—a critical issue for safety-critical applications. Ada's approach ensures interoperability is safe by construction.

## Core Concepts of Ada-C Interoperability

Ada's C interoperability is built on three pillars: standardized type mappings, explicit calling conventions, and controlled memory management. Let's explore these through practical examples.

### The Interfaces.C Package

Ada's `Interfaces.C` package provides standardized type definitions for C interoperability. These types map directly to C's primitive types, ensuring compatibility:

```ada
with Interfaces.C; use Interfaces.C;

procedure Example is
   C_Int : C_Int := 42;
   C_Float : C_Float := 3.14;
   C_Char : Character := 'A';
   C_String : char_array := To_C("Hello");
begin
   -- Use these types with C functions
end Example;
```

Key mappings:
- `C_Int` ↔ `int` (32-bit integer)
- `C_Long` ↔ `long` (platform-dependent)
- `C_Float` ↔ `float` (single precision)
- `C_Double` ↔ `double` (double precision)
- `C_Char` ↔ `char` (single character)
- `char_array` ↔ `char*` (null-terminated string)

The `Ada.Strings.C_Utils` package provides conversion functions like `To_C` and `To_Ada` for seamless string handling:

```ada
with Ada.Strings.C_Utils; use Ada.Strings.C_Utils;

procedure String_Conversion is
   Ada_Str : String := "Ada";
   C_Str : char_array := To_C(Ada_Str);
   Ada_Str2 : String := To_Ada(C_Str);
begin
   Put_Line("Original: " & Ada_Str);
   Put_Line("Converted: " & Ada_Str2);
end String_Conversion;
```

This ensures null-termination is handled correctly—critical for C functions expecting null-terminated strings.

### Calling C Functions from Ada

The `pragma Import` directive declares C functions in Ada with correct calling conventions. Let's call the standard C `sqrt` function:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure Call_C_Sqrt is
   function sqrt (x : C_Double) return C_Double;
   pragma Import (C, sqrt, "sqrt");
begin
   Put_Line("sqrt(4.0) = " & C_Double'Image(sqrt(4.0)));
end Call_C_Sqrt;
```

**Build and Run:**
```bash
gnatmake call_c_sqrt.adb -largs -lm
./call_c_sqrt
# Output: sqrt(4.0) =  2.00000000000000E+00
```

The `-lm` flag links the math library. Without it, the linker fails to find `sqrt`.

**Critical Details:**
- Parameter types must match C exactly (`C_Double` not `Float`)
- Function names must match C's symbol name exactly ("sqrt" not "sqrtf")
- The `pragma Import` specifies the C name explicitly

### Handling C Pointers and Memory

C functions often use pointers for input/output parameters. Ada handles these through access types:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure C_Pointer_Example is
   type int_ptr is access all C_Int;
   function malloc (size : size_t) return System.Address;
   pragma Import (C, malloc, "malloc");
   function free (ptr : System.Address) return void;
   pragma Import (C, free, "free");

   Ptr : System.Address;
   Value : int_ptr;
begin
   Ptr := malloc(4);  -- Allocate 4 bytes for int
   Value := int_ptr(Ptr);
   Value.all := 42;
   Put_Line("Value: " & C_Int'Image(Value.all));
   free(Ptr);
end C_Pointer_Example;
```

**Key Points:**
- `System.Address` represents raw memory addresses
- Access types (`int_ptr`) cast addresses to typed pointers
- Always free memory allocated by C to prevent leaks
- Use `System.Storage_Elements` for precise memory manipulation

For arrays, use `Interfaces.C`'s `array` types:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure C_Array_Example is
   type int_array is array (Natural range <>) of C_Int;
   function create_array (size : size_t) return System.Address;
   pragma Import (C, create_array, "create_array");
   function get_element (arr : System.Address; index : size_t) return C_Int;
   pragma Import (C, get_element, "get_element");
begin
   declare
      Arr : System.Address := create_array(3);
   begin
      for I in 0..2 loop
         Put_Line("Element " & size_t'Image(I) & ": " & 
                  C_Int'Image(get_element(Arr, I)));
      end loop;
   end;
end C_Array_Example;
```

This example assumes a C function `create_array` that allocates a C array, and `get_element` that retrieves values. In practice, you'd define these in a C source file and link them.

## Ada to C++ Interoperability: The C Bridge Pattern

C++ introduces name mangling—compilers encode function signatures into symbols for overloading support. This makes direct Ada-C++ calls impossible without a C bridge. The solution: wrap C++ code in C-compatible interfaces.

### Step 1: Create C-Compatible C++ Code

```cpp
// calculator.h
extern "C" {
    typedef struct Calculator Calculator;
    Calculator* create_calculator();
    int multiply(Calculator* calc, int a, int b);
    void destroy_calculator(Calculator* calc);
}

// calculator.cpp
#include "calculator.h"
#include <iostream>

class CalculatorImpl {
public:
    int multiply(int a, int b) { return a * b; }
};

extern "C" {
    Calculator* create_calculator() {
        return new CalculatorImpl();
    }
    int multiply(Calculator* calc, int a, int b) {
        return static_cast<CalculatorImpl*>(calc)->multiply(a, b);
    }
    void destroy_calculator(Calculator* calc) {
        delete static_cast<CalculatorImpl*>(calc);
    }
}
```

Key details:
- `extern "C"` prevents name mangling for C interface functions
- Opaque pointers (`Calculator*`) hide C++ implementation details
- `static_cast` safely converts between C and C++ types

### Step 2: Interface in Ada

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

package Calculator is
   type Calculator is limited private;
   type Calculator_Access is access all Calculator;

   function Create_Calculator return Calculator_Access;
   pragma Import (C, Create_Calculator, "create_calculator");

   function Multiply (Calc : Calculator_Access; A, B : Integer) return Integer;
   pragma Import (C, Multiply, "multiply");

   procedure Destroy_Calculator (Calc : Calculator_Access);
   pragma Import (C, Destroy_Calculator, "destroy_calculator");

private
   type Calculator is record
      Ptr : System.Address;
   end record;
end Calculator;

package body Calculator is
   -- Implementation details hidden
end Calculator;
```

**Usage Example:**
```ada
with Calculator; use Calculator;

procedure Main is
   Calc : Calculator_Access := Create_Calculator;
   Result : Integer := Multiply(Calc, 7, 6);
begin
   Put_Line("7 * 6 = " & Integer'Image(Result));
   Destroy_Calculator(Calc);
end Main;
```

**Build Process:**
1. Compile C++ code: `g++ -c calculator.cpp -o calculator.o`
2. Compile Ada code: `gnatmake main.adb calculator.o -largs -lstdc++`
3. Run: `./main`

**Critical Considerations:**
- Always link C++ standard library (`-lstdc++`)
- Use `limited private` types to prevent accidental copying
- Opaque pointers ensure C++ implementation details stay hidden
- Memory management must be explicit (no garbage collection)

### Advanced C++ Interoperability: Classes and Inheritance

For complex C++ classes, create C interface functions for each method:

```cpp
// shape.h
extern "C" {
    typedef struct Shape Shape;
    Shape* create_circle(double radius);
    double get_area(Shape* shape);
    void destroy_shape(Shape* shape);
}

// shape.cpp
#include "shape.h"
#include <cmath>

class Circle {
public:
    Circle(double r) : radius(r) {}
    double area() const { return 3.14159 * radius * radius; }
private:
    double radius;
};

extern "C" {
    Shape* create_circle(double radius) {
        return new Circle(radius);
    }
    double get_area(Shape* shape) {
        return static_cast<Circle*>(shape)->area();
    }
    void destroy_shape(Shape* shape) {
        delete static_cast<Circle*>(shape);
    }
}
```

Ada interface:

```ada
package Shape is
   type Shape is limited private;
   type Shape_Access is access all Shape;

   function Create_Circle (Radius : Double) return Shape_Access;
   pragma Import (C, Create_Circle, "create_circle");

   function Get_Area (Shape : Shape_Access) return Double;
   pragma Import (C, Get_Area, "get_area");

   procedure Destroy_Shape (Shape : Shape_Access);
   pragma Import (C, Destroy_Shape, "destroy_shape");

private
   type Shape is record
      Ptr : System.Address;
   end record;
end Shape;
```

This pattern works for any C++ class—simply expose methods through C-compatible functions.

## C/C++ to Ada Interoperability: Exporting Ada Functions

When C/C++ code needs to call Ada functions (e.g., callbacks), use `pragma Export` to expose Ada procedures as C symbols.

### Basic Example: Simple Callback

Ada code:
```ada
with Ada.Text_IO; use Ada.Text_IO;

procedure Callback_Example is
   procedure Log (Message : char_array) is
   begin
      Put_Line(To_Ada(Message));
   end Log;
   pragma Export (C, Log, "log_message");
end Callback_Example;
```

C code:
```c
#include <stdio.h>

extern void log_message(const char* message);

int main() {
    log_message("Hello from C!");
    return 0;
}
```

**Build:**
```bash
gnatmake callback_example.adb -c
gcc main.c callback_example.o -o app
./app
# Output: Hello from C!
```

### Handling Complex Callbacks

For callbacks with multiple parameters:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

package Callbacks is
   type Callback is access procedure (X : C_Int; Y : C_Int);
   procedure Add (A, B : C_Int) is
   begin
      Put_Line("Sum: " & C_Int'Image(A + B));
   end Add;
   pragma Export (C, Add, "add_callback");
end Callbacks;
```

C header:
```c
typedef void (*callback_t)(int, int);
void register_callback(callback_t cb);
```

C implementation:
```c
#include "callbacks.h"

static callback_t registered_callback = NULL;

void register_callback(callback_t cb) {
    registered_callback = cb;
}

void trigger_callback() {
    if (registered_callback) {
        registered_callback(5, 7);
    }
}
```

Ada main:
```ada
with Callbacks; use Callbacks;
with Interfaces.C; use Interfaces.C;

procedure Main is
   procedure Register_Callback (Cb : Callback);
   pragma Import (C, Register_Callback, "register_callback");

   procedure Trigger_Callback;
   pragma Import (C, Trigger_Callback, "trigger_callback");
begin
   Register_Callback(Callbacks.Add'Access);
   Trigger_Callback;
end Main;
```

**Build:**
```bash
gnatmake main.adb callbacks.o callbacks.c.o -largs -lstdc++
```

**Key Points:**
- Use `Access` attributes for procedure references
- Ensure callback types match exactly between Ada and C
- Handle null pointers carefully in C code

## Advanced Data Types: Records, Arrays, and Strings

### Mapping C Structures to Ada Records

C structures require precise memory layout matching. Use `pragma Convention(C)` to ensure compatibility:

```c
// geometry.h
struct Point {
    double x;
    double y;
};
```

Ada interface:
```ada
with Interfaces.C; use Interfaces.C;

package Geometry is
   type Point is record
      X : C_Double;
      Y : C_Double;
   end record;
   pragma Convention (C, Point);
end Geometry;
```

**Usage:**
```ada
with Geometry; use Geometry;
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure Point_Example is
   function create_point (x : C_Double; y : C_Double) return System.Address;
   pragma Import (C, create_point, "create_point");

   function get_x (point : System.Address) return C_Double;
   pragma Import (C, get_x, "get_x");

   function get_y (point : System.Address) return C_Double;
   pragma Import (C, get_y, "get_y");

   Ptr : System.Address := create_point(3.0, 4.0);
   Pt : Point renames Point'Address (Ptr);
begin
   Put_Line("X: " & C_Double'Image(get_x(Ptr)));
   Put_Line("Y: " & C_Double'Image(get_y(Ptr)));
   Put_Line("Direct: X=" & Pt.X'Image & ", Y=" & Pt.Y'Image);
end Point_Example;
```

**C Implementation:**
```c
#include "geometry.h"

void* create_point(double x, double y) {
    struct Point* p = malloc(sizeof(struct Point));
    p->x = x;
    p->y = y;
    return p;
}

double get_x(void* p) {
    return ((struct Point*)p)->x;
}

double get_y(void* p) {
    return ((struct Point*)p)->y;
}
```

**Critical Details:**
- `pragma Convention(C)` ensures Ada record matches C struct layout
- `renames` allows direct access to memory as Ada record
- Always allocate/free memory in the same language (C allocates, C frees)

### Handling C Arrays in Ada

C arrays are pointers to contiguous memory. Ada handles them through access types:

```c
// array.h
double* create_array(size_t size);
void free_array(double* arr);
double get_element(double* arr, size_t index);
```

Ada interface:
```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

package Array_Handler is
   type Double_Array is array (Natural range <>) of C_Double;
   type Double_Array_Access is access Double_Array;

   function Create_Array (Size : size_t) return System.Address;
   pragma Import (C, Create_Array, "create_array");

   procedure Free_Array (Arr : System.Address);
   pragma Import (C, Free_Array, "free_array");

   function Get_Element (Arr : System.Address; Index : size_t) return C_Double;
   pragma Import (C, Get_Element, "get_element");
end Array_Handler;
```

Usage:
```ada
with Array_Handler; use Array_Handler;

procedure Main is
   Arr : System.Address := Create_Array(3);
begin
   Put_Line("Element 0: " & C_Double'Image(Get_Element(Arr, 0)));
   Put_Line("Element 1: " & C_Double'Image(Get_Element(Arr, 1)));
   Free_Array(Arr);
end Main;
```

**Key Considerations:**
- Ada does not automatically manage C-allocated memory—explicit `Free_Array` is required
- Use `Natural range <>)` for flexible array sizing
- For read-only access, consider `constant` access types

### String Handling Best Practices

String interoperability is error-prone due to null-termination requirements. Always use `Ada.Strings.C_Utils`:

```ada
with Ada.Strings.C_Utils; use Ada.Strings.C_Utils;
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure String_Example is
   function to_upper (str : char_array) return char_array;
   pragma Import (C, to_upper, "to_upper");

   Ada_Str : constant String := "hello";
   C_Str : char_array := To_C(Ada_Str);
   Upper_Str : char_array := to_upper(C_Str);
begin
   Put_Line("Original: " & To_Ada(C_Str));
   Put_Line("Uppercase: " & To_Ada(Upper_Str));
end String_Example;
```

**C Implementation:**
```c
#include <string.h>
#include <ctype.h>

char* to_upper(char* str) {
    char* result = strdup(str);
    for (size_t i = 0; result[i]; i++) {
        result[i] = toupper((unsigned char)result[i]);
    }
    return result;
}
```

**Critical Notes:**
- `strdup` creates a new string—must be freed by caller
- `To_Ada` automatically handles null-termination
- Never pass Ada strings directly to C—always convert with `To_C`
- For strings with embedded nulls, use `char_array` instead of `String`

## Memory Management: Bridging the Gap

Memory management differences between Ada and C/C++ are a common source of bugs. Ada uses automatic memory management with controlled access types, while C/C++ requires manual allocation/free. Let's explore best practices.

### C-Allocated Memory in Ada

When C allocates memory, Ada must free it explicitly:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure Memory_Example is
   function malloc (size : size_t) return System.Address;
   pragma Import (C, malloc, "malloc");
   function free (ptr : System.Address) return void;
   pragma Import (C, free, "free");

   Ptr : System.Address := malloc(1024);
   Buffer : array (1..1024) of Character
      with Address => Ptr;
begin
   -- Use Buffer (e.g., read from file)
   free(Ptr);
end Memory_Example;
```

**Key Points:**
- `System.Address` represents raw memory
- `with Address =>` binds Ada array to C-allocated memory
- Always free memory in the same language it was allocated
- Use `System.Storage_Elements` for precise memory manipulation

### Ada-Allocated Memory in C

When Ada allocates memory for C use:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure Ada_Alloc_Example is
   type Int_Array is array (Natural range <>) of C_Int;
   type Int_Array_Access is access Int_Array;
   Ptr : Int_Array_Access := new Int_Array(0..9);

   function print_array (arr : System.Address; size : size_t) return void;
   pragma Import (C, print_array, "print_array");
begin
   print_array(Ptr'Address, 10);
   -- Ada automatically frees Ptr when it goes out of scope
end Ada_Alloc_Example;
```

**C Implementation:**
```c
#include <stdio.h>

void print_array(int* arr, size_t size) {
    for (size_t i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}
```

**Critical Considerations:**
- Ada's automatic memory management handles deallocation
- Never free Ada-allocated memory in C—this causes undefined behavior
- Use `new` for Ada-allocated memory that C will use
- For large arrays, consider `pragma Pack` to control memory layout

### Memory Leak Prevention

Memory leaks occur when allocated memory isn't freed. Ada's `pragma Finalize` helps manage C resources:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Finalization; use Ada.Finalization;

type C_Memory is new Limited_Controlled with record
   Ptr : System.Address;
end record;

procedure Finalize (Obj : in out C_Memory) is
   function free (ptr : System.Address) return void;
   pragma Import (C, free, "free");
begin
   free(Obj.Ptr);
end Finalize;

procedure Main is
   Mem : C_Memory;
begin
   Mem.Ptr := malloc(1024);
   -- No explicit free needed—Finalize runs automatically
end Main;
```

This pattern ensures memory is freed when the object goes out of scope, even during exceptions.

## Error Handling and Exception Safety

Error handling differs significantly between Ada and C/C++. Ada uses exceptions, while C uses return codes. C++ uses exceptions but requires careful handling across language boundaries.

### C Functions Returning Error Codes

C functions typically return error codes. Ada must check these:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Exceptions; use Ada.Exceptions;
with Ada.Text_IO; use Ada.Text_IO;

procedure Safe_Calls is
   function open_file (filename : char_array; mode : char_array) return System.Address;
   pragma Import (C, open_file, "fopen");

   function fclose (stream : System.Address) return int;
   pragma Import (C, fclose, "fclose");

   function ferror (stream : System.Address) return int;
   pragma Import (C, ferror, "ferror");

   Stream : System.Address;
   RC : int;
begin
   Stream := open_file(To_C("test.txt"), To_C("r"));
   if Stream = System.Null_Address then
      raise Program_Error with "File open failed";
   end if;

   RC := fclose(Stream);
   if RC /= 0 then
      raise Program_Error with "File close failed";
   end if;
exception
   when E : others =>
      Put_Line("Error: " & Exception_Information(E));
end Safe_Calls;
```

**Key Points:**
- Check return codes for C functions
- Convert errors to Ada exceptions for consistent handling
- Use `Exception_Information` for detailed error messages

### C++ Exceptions Across Language Boundaries

C++ exceptions cannot propagate to Ada. Always catch them in C++:

```cpp
// wrapper.cpp
extern "C" {
    int safe_multiply(int a, int b) {
        try {
            return a * b;
        } catch (...) {
            return -1; // Error code
        }
    }
}
```

Ada interface:
```ada
function Safe_Multiply (A, B : Integer) return Integer;
pragma Import (C, Safe_Multiply, "safe_multiply");

procedure Main is
   Result : Integer := Safe_Multiply(7, 6);
begin
   if Result = -1 then
      Put_Line("Error occurred");
   else
      Put_Line("Result: " & Integer'Image(Result));
   end if;
end Main;
```

**Critical Considerations:**
- Never let C++ exceptions cross into Ada
- Use error codes or status flags for error reporting
- In C++, catch all exceptions and convert to return codes

### Ada Exceptions in C Code

Ada exceptions cannot propagate to C. Always handle them in Ada:

```ada
with Ada.Exceptions; use Ada.Exceptions;
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure Safe_Callback is
   procedure Callback (X : C_Int) is
   begin
      if X < 0 then
         raise Constraint_Error with "Negative value";
      end if;
      Put_Line("Callback: " & C_Int'Image(X));
   end Callback;
   pragma Export (C, Callback, "callback");

   procedure Register_Callback (Cb : Callback);
   pragma Import (C, Register_Callback, "register_callback");
begin
   Register_Callback(Callback'Access);
exception
   when E : others =>
      Put_Line("Exception in callback: " & Exception_Information(E));
end Safe_Callback;
```

**C Implementation:**
```c
#include <stdio.h>

typedef void (*callback_t)(int);

static callback_t registered_callback = NULL;

void register_callback(callback_t cb) {
    registered_callback = cb;
}

void trigger_callback(int x) {
    if (registered_callback) {
        registered_callback(x);
    }
}
```

**Key Points:**
- Ada exceptions must be handled within Ada code
- Never let exceptions cross into C code
- Use `pragma Export` with caution—callbacks must be exception-safe

## Case Study: SQLite Database Integration

SQLite is a popular C library for embedded databases. Let's integrate it into Ada using best practices for interoperability.

### Step 1: Interface with SQLite's C API

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Strings.C_Utils; use Ada.Strings.C_Utils;
with Ada.Text_IO; use Ada.Text_IO;

package SQLite is
   type sqlite3 is limited private;
   type sqlite3_ptr is access all sqlite3;

   function sqlite3_open (filename : char_array; db : access sqlite3_ptr) return int;
   pragma Import (C, sqlite3_open, "sqlite3_open");

   function sqlite3_close (db : sqlite3_ptr) return int;
   pragma Import (C, sqlite3_close, "sqlite3_close");

   function sqlite3_exec (db : sqlite3_ptr; sql : char_array; 
                         callback : System.Address; 
                         arg : System.Address; 
                         errmsg : access char) return int;
   pragma Import (C, sqlite3_exec, "sqlite3_exec");

   function sqlite3_errmsg (db : sqlite3_ptr) return char_array;
   pragma Import (C, sqlite3_errmsg, "sqlite3_errmsg");
end SQLite;
```

### Step 2: Implement Database Operations

```ada
with SQLite; use SQLite;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;

package body SQLite is
   procedure Execute (DB : sqlite3_ptr; SQL : String) is
      RC : int;
      ErrMsg : char_array;
      C_SQL : char_array := To_C(SQL);
   begin
      RC := sqlite3_exec(DB, C_SQL, null, null, ErrMsg'Access);
      if RC /= 0 then
         Put_Line("SQL error: " & To_Ada(sqlite3_errmsg(DB)));
      end if;
   end Execute;
end SQLite;
```

### Step 3: Full Example Usage

```ada
with SQLite; use SQLite;
with Ada.Text_IO; use Ada.Text_IO;

procedure Database_Example is
   DB : sqlite3_ptr;
   RC : int;
begin
   RC := sqlite3_open(To_C("test.db"), DB'Access);
   if RC /= 0 then
      Put_Line("Can't open database: " & To_Ada(sqlite3_errmsg(DB)));
      return;
   end if;

   Execute(DB, "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");
   Execute(DB, "INSERT INTO users (name) VALUES ('Ada')");
   Execute(DB, "INSERT INTO users (name) VALUES ('C')");

   -- Query results
   declare
      procedure Callback (Data : System.Address; ColCount : int; 
                         ColValues : System.Address; ColNames : System.Address) return int;
      pragma Import (C, Callback, "callback");
   begin
      RC := sqlite3_exec(DB, "SELECT * FROM users", Callback'Access, null, null);
      if RC /= 0 then
         Put_Line("Query error: " & To_Ada(sqlite3_errmsg(DB)));
      end if;
   end;

   sqlite3_close(DB);
end Database_Example;
```

### Step 4: Callback Implementation

```ada
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Text_IO; use Ada.Text_IO;

package body Database_Example is
   function Callback (Data : System.Address; ColCount : int; 
                     ColValues : System.Address; ColNames : System.Address) return int is
      Values : array (0..ColCount-1) of char_array;
   begin
      for I in 0..ColCount-1 loop
         declare
            Value : constant char_array := Interfaces.C.To_Ada(Interfaces.C.char_array(ColValues(I)));
         begin
            Put("Column " & Integer'Image(I) & ": " & To_Ada(Value) & "  ");
         end;
      end loop;
      New_Line;
      return 0;
   end Callback;
end Database_Example;
```

**Build Process:**
```bash
gnatmake database_example.adb -largs -lsqlite3
./database_example
```

**Output:**
```
Column 0: 1  Column 1: Ada  
Column 0: 2  Column 1: C  
```

**Key Best Practices:**
- Use `sqlite3_errmsg` for detailed error messages
- Always check return codes from SQLite functions
- Handle null pointers carefully (e.g., `DB'Access`)
- Convert C strings to Ada strings using `To_Ada`
- Use `pragma Import` with exact symbol names

## Case Study: C++ Game Engine with Ada Physics Engine

Imagine a C++ game engine that needs a physics simulation module. Ada's strong typing ensures calculations are precise and free from subtle bugs. Let's integrate them.

### Step 1: C++ Game Engine (main.cpp)

```cpp
#include <iostream>
#include "physics.h"

extern "C" {
    void* create_physics_engine();
    void step_physics(void* engine, double dt);
    void destroy_physics_engine(void* engine);
}

int main() {
    void* engine = create_physics_engine();
    for (int i = 0; i < 100; i++) {
        step_physics(engine, 0.016);
    }
    destroy_physics_engine(engine);
    return 0;
}
```

### Step 2: Ada Physics Engine (physics.adb)

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

package Physics is
   type Physics_Engine is limited private;
   type Physics_Engine_Access is access all Physics_Engine;

   function Create_Physics_Engine return System.Address;
   pragma Export (C, Create_Physics_Engine, "create_physics_engine");

   procedure Step_Physics (Engine : System.Address; DT : C_Double);
   pragma Export (C, Step_Physics, "step_physics");

   procedure Destroy_Physics_Engine (Engine : System.Address);
   pragma Export (C, Destroy_Physics_Engine, "destroy_physics_engine");

private
   type Physics_Engine is record
      -- Implementation details
   end record;
end Physics;

package body Physics is
   procedure Step_Physics (Engine : System.Address; DT : C_Double) is
   begin
      -- Physics simulation logic
      Put_Line("Stepping physics with delta time: " & C_Double'Image(DT));
   end Step_Physics;

   function Create_Physics_Engine return System.Address is
      Engine : Physics_Engine_Access := new Physics_Engine;
   begin
      return Engine'Address;
   end Create_Physics_Engine;

   procedure Destroy_Physics_Engine (Engine : System.Address) is
      Ptr : Physics_Engine_Access := Physics_Engine_Access(Engine);
   begin
      Free(Ptr);
   end Destroy_Physics_Engine;
end Physics;
```

### Step 3: Build and Run

```bash
gnatmake physics.adb -c
g++ main.cpp physics.o -o game
./game
```

**Output:**
```
Stepping physics with delta time:  1.60000000000000E-02
Stepping physics with delta time:  1.60000000000000E-02
... (100 times)
```

**Key Advantages:**
- C++ handles game loop and rendering
- Ada handles physics calculations with type safety
- Memory management is explicit but safe
- No runtime overhead from C++ exceptions

## Tools and Best Practices for Mixed-Language Projects

### GNAT Project Files for Mixed Projects

GNAT project files (`*.gpr`) manage mixed-language builds:

```ada
project Mixed_Project is
   for Source_Dirs use ("src");
   for Object_Dir use "obj";
   for Main use ("main.cpp");
   for Exec_Dir use ".";
   for Languages use ("C", "C++", "Ada");
   for Library_Name use "physics";
   for Library_Dir use "lib";
   for Library_Kind use "static";
   for Library_Options use ("-lm");
   for Object_Suffix use (".o");
end Mixed_Project;
```

**Key Directives:**
- `Languages` specifies all languages used
- `Library_Name` builds a static library
- `Library_Options` links required libraries (e.g., math library)
- `Object_Suffix` ensures consistent object file naming

### GNAT Studio Features for Interoperability

GNAT Studio provides excellent support for mixed-language projects:
- **Syntax Highlighting**: C/C++ code in Ada files (and vice versa)
- **Cross-Reference Navigation**: Jump between Ada and C/C++ symbols
- **Build Configuration**: Integrated build system for mixed projects
- **Debugging**: Single-step debugging across language boundaries

To enable these features:
1. Open the GNAT project file
2. Right-click the project → **Properties**
3. Under **Build**, select **Mixed Language Project**
4. Add C/C++ source files to the project

### Common Pitfalls and Solutions

| **Pitfall** | **Cause** | **Solution** |
| :--- | :--- | :--- |
| **Name Mangling Errors** | C++ symbols not declared `extern "C"` | Wrap C++ functions in `extern "C"` blocks |
| **Memory Leaks** | C-allocated memory not freed | Use `Ada.Finalization` for automatic cleanup |
| **String Handling Errors** | Missing null-termination | Always use `Ada.Strings.C_Utils.To_C` |
| **Type Mismatches** | Ada `Float` vs C `double` | Use `C_Double` for double-precision floats |
| **Exception Propagation** | C++ exceptions crossing into Ada | Catch exceptions in C++ and return error codes |
| **Calling Convention Errors** | Incorrect calling conventions | Use `pragma Import (C, ...)` with exact names |

### Best Practices Checklist

1. **Use C as a Bridge for C++**: Always wrap C++ code in C-compatible interfaces
2. **Verify Data Types**: Use `Interfaces.C` types for all interoperable data
3. **Handle Memory Explicitly**: Never mix memory allocation/deallocation between languages
4. **Check Return Codes**: Always check C function return codes for errors
5. **Avoid Global State**: Use opaque pointers to hide implementation details
6. **Test Incrementally**: Test small interoperability components before full integration
7. **Document Interfaces**: Use comments to specify calling conventions and memory ownership

> "The key to successful language interoperability is treating the interface as a contract. Define clear boundaries, specify ownership rules, and verify everything at compile time. Ada's strong typing makes this contract enforceable." — Senior Software Architect

## Advanced Techniques: Performance Optimization

### Zero-Copy Data Sharing

For high-performance applications, avoid copying data between languages:

```ada
with Interfaces.C; use Interfaces.C;
with Ada.Text_IO; use Ada.Text_IO;

procedure Zero_Copy_Example is
   type Float_Array is array (Natural range <>) of C_Float;
   type Float_Array_Access is access Float_Array;

   function create_buffer (size : size_t) return System.Address;
   pragma Import (C, create_buffer, "create_buffer");

   function process_buffer (buffer : System.Address; size : size_t) return void;
   pragma Import (C, process_buffer, "process_buffer");

   Buffer : Float_Array_Access := new Float_Array(0..999);
begin
   -- Share Ada-allocated memory with C
   process_buffer(Buffer'Address, 1000);
end Zero_Copy_Example;
```

**C Implementation:**
```c
#include <stdio.h>

void* create_buffer(size_t size) {
    return malloc(size * sizeof(float));
}

void process_buffer(float* buffer, size_t size) {
    for (size_t i = 0; i < size; i++) {
        buffer[i] = i * 1.0f;
    }
}
```

**Key Benefits:**
- No data copying—direct memory sharing
- Ideal for large datasets (e.g., image processing)
- Uses Ada's automatic memory management for deallocation

### Inline C Code in Ada

For performance-critical sections, use GNAT's `pragma Import (C, ...)` with inline assembly:

```ada
with Interfaces.C; use Interfaces.C;

procedure Fast_Sum (A, B : C_Int; Result : out C_Int) is
   pragma Import (C, Fast_Sum, "fast_sum");
   pragma Inline (Fast_Sum);
begin
   null; -- Actual implementation in C
end Fast_Sum;
```

**C Implementation:**
```c
#include <stdint.h>

__attribute__((always_inline))
void fast_sum(int32_t a, int32_t b, int32_t* result) {
    *result = a + b;
}
```

**Build:**
```bash
gnatmake main.adb -c
gcc -O3 inline.c main.o -o app
```

**Performance Impact:**
- Eliminates function call overhead
- Allows compiler optimizations across language boundaries
- Ideal for tight loops and mathematical operations

### Cross-Language Inlining

For small functions, use `pragma Inline` to optimize across boundaries:

```ada
with Interfaces.C; use Interfaces.C;

package Math is
   function Add (A, B : C_Int) return C_Int;
   pragma Import (C, Add, "add");
   pragma Inline (Add);
end Math;

package body Math is
   -- Implementation in C
end Math;
```

**C Implementation:**
```c
#include <stdint.h>

int32_t add(int32_t a, int32_t b) {
    return a + b;
}
```

**Result:**
- Compiler inlines the function call
- No function call overhead
- Optimized for performance-critical paths

## Real-World Applications and Case Studies

### Case Study: Embedded Systems with Ada and C

Many embedded systems use C for hardware drivers and Ada for application logic. Let's integrate them:

**C Driver (gpio.c):**
```c
#include <stdint.h>

void gpio_set_pin(uint8_t pin, uint8_t value) {
    // Hardware-specific implementation
    volatile uint32_t* reg = (uint32_t*)0x40020000;
    if (value) {
        *reg |= (1 << pin);
    } else {
        *reg &= ~(1 << pin);
    }
}
```

**Ada Interface:**
```ada
with Interfaces.C; use Interfaces.C;

package GPIO is
   procedure Set_Pin (Pin : C_UInt8; Value : C_UInt8);
   pragma Import (C, Set_Pin, "gpio_set_pin");
end GPIO;
```

**Ada Application:**
```ada
with GPIO; use GPIO;

procedure Main is
begin
   Set_Pin(5, 1);  -- Turn on LED
   delay 1.0;
   Set_Pin(5, 0);  -- Turn off LED
end Main;
```

**Build:**
```bash
gnatmake main.adb -c
gcc gpio.c main.o -o app
```

**Why This Works:**
- C handles hardware-specific details
- Ada provides type-safe application logic
- No runtime overhead from inter-language calls
- Compile-time verification of parameter types

### Case Study: Web Server with Ada and C Libraries

A high-performance web server uses C libraries for networking and Ada for business logic:

**C Networking Library (network.c):**
```c
#include <sys/socket.h>
#include <netinet/in.h>

int create_server(int port) {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(sockfd, (struct sockaddr*)&addr, sizeof(addr));
    listen(sockfd, 5);
    return sockfd;
}

int accept_connection(int sockfd) {
    struct sockaddr_in addr;
    socklen_t addrlen = sizeof(addr);
    return accept(sockfd, (struct sockaddr*)&addr, &addrlen);
}
```

**Ada Interface:**
```ada
with Interfaces.C; use Interfaces.C;

package Network is
   function Create_Server (Port : C_Int) return C_Int;
   pragma Import (C, Create_Server, "create_server");

   function Accept_Connection (Sockfd : C_Int) return C_Int;
   pragma Import (C, Accept_Connection, "accept_connection");
end Network;
```

**Ada Application:**
```ada
with Network; use Network;
with Ada.Text_IO; use Ada.Text_IO;

procedure Web_Server is
   Server_Socket : C_Int := Create_Server(8080);
   Client_Socket : C_Int;
begin
   loop
      Client_Socket := Accept_Connection(Server_Socket);
      -- Process request in Ada
      Put_Line("New connection from client");
   end loop;
end Web_Server;
```

**Build:**
```bash
gnatmake web_server.adb -c
gcc network.c web_server.o -o server -lsocket
```

**Key Benefits:**
- C handles low-level networking
- Ada processes requests with type safety
- No memory management issues
- Clear separation of concerns

## Conclusion

Ada's interoperability with C and C++ is a powerful tool for building robust, high-performance applications. By leveraging standardized type mappings, explicit calling conventions, and careful memory management, developers can seamlessly integrate Ada with existing libraries and frameworks. Unlike languages with limited interoperability, Ada provides compile-time verification of interface contracts—ensuring safety and reliability from the start.

> "Ada's interoperability capabilities are not just about connecting languages—they're about creating systems where safety and performance coexist. By using C as a bridge for C++ and leveraging Ada's strong typing, developers can build hybrid systems that are both efficient and reliable." — AdaCore Developer

This chapter has covered practical techniques for Ada-C/C++ interoperability, from basic function calls to advanced memory management and performance optimization. Whether you're integrating a C graphics library into an Ada application, using Ada for physics calculations in a C++ game engine, or connecting to a SQLite database from Ada, these principles ensure your code is safe, maintainable, and efficient.

As you experiment with these techniques, remember:
- Always verify data types and calling conventions
- Handle memory explicitly and consistently
- Use C as a bridge for C++ interoperability
- Leverage GNAT's tools for mixed-language projects

By mastering these skills, you'll unlock the full potential of Ada while leveraging the vast ecosystem of C and C++ libraries. The result? Software that is not only functional but also safe, reliable, and maintainable—exactly what modern applications demand.

## Resources and Further Learning

### Core Documentation

| **Resource** | **URL** | **Description** |
| :--- | :--- | :--- |
| **Ada Reference Manual** | [https://www.adaic.org/resources/add_content/standards/12rm/html/RM-TOC.html](https://www.adaic.org/resources/add_content/standards/12rm/html/RM-TOC.html) | Official Ada language specification |
| **GNAT User's Guide** | [https://docs.adacore.com/gnat_ugn-docs/html/gnat_ugn/gnat_ugn.html](https://docs.adacore.com/gnat_ugn-docs/html/gnat_ugn/gnat_ugn.html) | Comprehensive guide to GNAT tools |
| **Interfaces.C Documentation** | [https://gcc.gnu.org/onlinedocs/gcc-12.2.0/ada/libgnat/Interfaces_C.html](https://gcc.gnu.org/onlinedocs/gcc-12.2.0/ada/libgnat/Interfaces_C.html) | Standard Ada-C interoperability package |
| **Ada.Strings.C_Utils** | [https://gcc.gnu.org/onlinedocs/gcc-12.2.0/ada/libgnat/Ada_Strings_C_Utils.html](https://gcc.gnu.org/onlinedocs/gcc-12.2.0/ada/libgnat/Ada_Strings_C_Utils.html) | String conversion utilities for C interoperability |

### Books and Tutorials

- **"Ada 2022: The Craft of Programming" by John Barnes**: Covers interoperability techniques in depth
- **"Professional Ada Programming" by John English**: Practical examples of mixed-language projects
- **"Ada for C++ Programmers" by Stephen Michell**: Focuses on Ada-C++ interoperability
- **AdaCore Learning Portal**: [https://learn.adacore.com](https://learn.adacore.com) with free tutorials on interoperability

### Online Communities

| **Platform** | **URL** | **Best For** |
| :--- | :--- | :--- |
| **AdaCore Forums** | [https://forums.adacore.com](https://forums.adacore.com) | Official support for GNAT tools |
| **Stack Overflow** | [https://stackoverflow.com/questions/tagged/ada](https://stackoverflow.com/questions/tagged/ada) | General Ada programming questions |
| **Reddit r/Ada** | [https://reddit.com/r/Ada](https://reddit.com/r/Ada) | Community discussions and news |
| **GitHub Ada Projects** | [https://github.com/topics/ada](https://github.com/topics/ada) | Real-world Ada code examples |

### Advanced Topics

- **Formal Verification of Interoperability**: Using SPARK to verify C interfaces
- **Cross-Platform Interoperability**: Handling different ABIs and calling conventions
- **Performance Optimization**: Zero-copy data sharing and inline assembly
- **Legacy System Modernization**: Integrating Ada with C++ legacy codebases

> "The true power of Ada's interoperability lies not in connecting languages, but in creating systems where safety and performance coexist without compromise. By mastering these techniques, you'll build software that stands the test of time." — Senior Software Architect

This chapter has equipped you with practical skills for Ada-C/C++ interoperability. Whether you're building a web application, embedded system, or game engine, these techniques will empower you to leverage the best of both worlds—Ada's safety and C/C++'s ecosystem. Start experimenting with the examples provided—Ada's compiler will catch errors before they become runtime bugs, giving you confidence in your code from day one.
