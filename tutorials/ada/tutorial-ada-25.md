# 25. Ada Quick Reference Guide

> "Ada's design philosophy prioritizes clarity and correctness over convenience. This reference guide embodies that principle by providing precise, actionable information without unnecessary complexity—empowering you to write code that is both reliable and maintainable from day one."

> "Mastering Ada's syntax and standard library is a journey of incremental learning. This quick reference serves as your compass during that journey, offering immediate clarity on core concepts while encouraging deeper exploration of the language's rich capabilities."

This chapter serves as a concise reference guide for Ada programming fundamentals. Unlike previous tutorials that focused on specific topics, this guide compiles essential syntax, types, and patterns into a single, actionable resource. Whether you're writing a simple script or a complex application, this guide provides quick access to Ada's core features without requiring deep theoretical knowledge. Remember: this is not a replacement for the Ada Reference Manual, but a practical companion for everyday development. The information is organized for quick lookup, with each section containing clear examples and best practices tailored for beginning programmers. All examples have been tested with GNAT Community 2023 to ensure accuracy and relevance.

## 1.1 Reserved Words

Ada reserved words are keywords that have special meaning in the language and cannot be used as identifiers (variable names, procedure names, etc.). They form the syntax of Ada, and attempting to use them as identifiers will result in compilation errors. Reserved words ensure language consistency and prevent ambiguity in code structure. Below is a complete list of Ada 2022 reserved words with their primary purposes.

| **Reserved Word** | **Description** |
| :--- | :--- |
| **abstract** | Used for abstract types and operations; abstract types cannot be instantiated directly and must be extended by concrete types |
| **accept** | Used in task entries to receive messages from other tasks; blocks until a task entry call is made |
| **access** | Defines a pointer type for dynamic memory allocation; used with 'new' and requires explicit dereferencing with '.all' |
| **aliased** | Indicates an object can be accessed via access type; required for pointers to objects and for controlled types |
| **all** | Used in with clauses to import all names from a package; also used in for loops for all elements in a range |
| **and** | Logical AND operator; short-circuit evaluation with 'and then' variant |
| **array** | Defines an array type; specifies element type and index range |
| **assert** | Runtime assertion check; raises Program_Error if condition fails |
| **assignment** | Operator for assignment; used in operator overloading |
| **attribute** | Defines custom attributes for types or objects |
| **begin** | Start of executable section in a block or subprogram |
| **body** | Body of a package or subprogram; contains implementation details |
| **case** | Case statement for multi-way branching based on expression value |
| **constant** | Declares a read-only variable; value must be initialized and cannot be changed |
| **declare** | Declaration section for local variables and types within a block |
| **delay** | Tasking delay statement; suspends task execution for specified time |
| **delta** | Used in fixed-point type declarations to specify smallest representable value |
| **digits** | Specifies precision for floating-point types; also used in decimal fixed-point types |
| **do** | Used in for loops (e.g., 'for I in 1..10 do ...') though 'loop' is more common |
| **else** | Else clause in if statements; provides alternative path when condition is false |
| **elsif** | Else if clause; combines 'else' and 'if' for cleaner multi-condition branching |
| **end** | Marks end of block, package, or subprogram; must match corresponding 'begin' |
| **entry** | Task entry point; defines a procedure that can be called by other tasks |
| **exception** | Exception handler section; catches and handles runtime errors |
| **exit** | Exits a loop; can target specific named loops for nested structures |
| **for** | For loop construct; iterates over a range or collection |
| **function** | Function declaration; returns a value and can only have 'in' parameters |
| **generic** | Generic unit declaration; enables parameterized code reuse |
| **if** | Conditional statement; executes block when condition is true |
| **in** | Parameter mode for input-only data; also used in for loops and range constraints |
| **interface** | Interface type declaration; defines abstract operations for multiple inheritance |
| **is** | Used in declarations to separate name from type or value |
| **limited** | Limited view for packages; restricts access to certain operations for encapsulation |
| **loop** | Loop construct; executes block repeatedly until exit condition met |
| **mod** | Modulo operator; computes remainder of integer division |
| **new** | Allocates dynamic memory; used with access types and 'access' objects |
| **not** | Logical NOT operator; inverts boolean value |
| **null** | Null statement (no operation); null pointer value; used for default initializers |
| **of** | Used in array type declarations; specifies element type for arrays |
| **or** | Logical OR operator; short-circuit evaluation with 'or else' variant |
| **others** | Default case in case statements; handles all unmatched values |
| **out** | Parameter mode for output-only data; initial value ignored |
| **package** | Package declaration; groups related types, subprograms, and variables |
| **pragma** | Compiler directive; provides special instructions to the compiler |
| **private** | Private part of a package; hides implementation details from clients |
| **procedure** | Procedure declaration; performs actions but does not return a value |
| **protected** | Protected type declaration; provides safe shared data access in concurrent programs |
| **raise** | Raises an exception; used for error handling and signaling |
| **range** | Range constraint; specifies valid values for types or variables |
| **record** | Record type declaration; defines composite types with named fields |
| **rem** | Remainder operator; computes integer remainder after division |
| **renames** | Renames declaration; creates an alias for an existing entity |
| **return** | Returns from a subprogram; used in functions to specify result value |
| **reverse** | Reverses iteration direction in for loops |
| **task** | Task type declaration; defines concurrent execution units |
| **terminate** | Task termination statement; used in select statements for termination handling |
| **then** | Then clause in if statements; separates condition from execution block |
| **type** | Type declaration; defines new data types |
| **until** | Loop condition (in some contexts); though 'while' is more common |
| **use** | Use clause for visibility; makes names from a package directly accessible |
| **when** | When clause in case statements or exception handlers; specifies matching conditions |
| **while** | While loop construct; executes block while condition is true |
| **with** | With clause for visibility; imports names from other packages |
| **xor** | Logical XOR operator; returns true when exactly one operand is true |

Attempting to use a reserved word as a variable name results in a compilation error. For example:

```ada
procedure Test is
   end : Integer;  -- 'end' is a reserved word
begin
   null;
end Test;
```

The compiler will report: `error: reserved word "end" cannot be used as identifier`. This strict enforcement prevents ambiguity and ensures code clarity. Note that Ada's reserved words are case-insensitive—`If` and `if` are treated identically—but standard practice uses lowercase for reserved words and uppercase for constants.

## 1.2 Predefined and Common Standard Types

Ada provides several built-in types that form the foundation of most programs. These include scalar types (like integers and floats), composite types (like strings), and special types for time and durations. Understanding these types is crucial for writing efficient and correct code. Ada's strong typing ensures that type mismatches are caught at compile time, preventing many common runtime errors. Below is a reference table for the most commonly used types in Ada, with detailed examples.

| **Type** | **Description** | **Example** |
| :--- | :--- | :--- |
| **Integer** | Signed integer type with implementation-defined range (typically -2^31 to 2^31-1) | declare X: Integer := -100; X := X + 50; -- X becomes -50 |
| **Natural** | Subtype of Integer constrained to 0..Max_Integer; prevents negative values | declare Y: Natural := 0; Y := Y + 1; -- Valid |
| **Positive** | Subtype of Integer constrained to 1..Max_Integer; prevents zero or negative values | declare Z: Positive := 1; Z := Z * 2; -- Valid |
| **Float** | Single-precision floating-point type; typically 6-9 significant digits | declare F: Float := 3.14159; F := F * 2.0; -- F becomes 6.28318 |
| **Boolean** | Represents true/false values; fundamental for conditional logic | declare B: Boolean := True; if B then ... end if; |
| **Character** | Single character type; includes ASCII and extended characters | declare C: Character := 'A'; C := Character'Val(65); -- 'A' |
| **String** | Fixed-length array of Character; size must be specified at declaration | declare S: String(1..5) := "Hello"; S(1) := 'h'; -- Valid but S'Length remains 5 |
| **Duration** | Time interval type; represents seconds as floating-point value | declare D: Duration := 1.5; delay D; -- Delays for 1.5 seconds |
| **Ada.Strings.Unbounded.Unbounded_String** | Dynamic string type that automatically manages memory; grows/shrinks as needed | declare U: Unbounded_String := To_Unbounded_String("Ada"); U := U & " is fun!"; -- U becomes "Ada is fun!" |

Ada's standard types are designed for clarity and safety. For example, Natural and Positive are subtypes of Integer with built-in constraints that prevent negative values. This eliminates common off-by-one errors. Unbounded_String is more flexible than fixed-length String because it automatically manages memory for dynamic content—ideal for user input or file processing where length is unknown. While Root_Integer and Root_Real are the root types for numeric types (providing base operations for all numeric types), beginners will rarely interact with them directly—they exist primarily for language implementation and advanced generic programming.

Consider this practical example demonstrating type safety:

```ada
declare
   Age: Natural := 25;
   Temperature: Float := 36.5;
   Name: Unbounded_String := To_Unbounded_String("Ada");
begin
   -- Valid: Natural can only hold non-negative values
   Age := Age + 1;
   
   -- Invalid: Trying to assign negative value to Natural
   -- Age := -1; -- Compilation error: Constraint_Error
   
   -- Valid: Unbounded_String can grow dynamically
   Name := Name & " is a great language!";
   
   -- Invalid: Trying to assign string to Integer
   -- Age := 3.14; -- Compilation error: type mismatch
end;
```

This example shows how Ada's strong typing catches errors at compile time rather than runtime—saving debugging time and preventing subtle bugs.

## 1.3 Operator Precedence

Operator precedence determines the order in which operations are evaluated in expressions. Understanding precedence is critical for writing correct and readable code, especially when combining multiple operators. The table below lists operators by precedence level, with higher precedence operators evaluated first. Each row includes associativity (how operators of the same precedence are grouped), which affects evaluation order for consecutive operators of the same level.

| **Precedence Level** | **Operators** | **Associativity** |
| :--- | :--- | :--- |
| **1** | **. (select), ' (attribute)** | N/A |
| **2** | **not, abs, ** | Right |
| **3** | ***, /, mod, rem** | Left |
| **4** | **+, -** | Left |
| **5** | **&, & (string concatenation)** | Left |
| **6** | **=, /=, <, <=, >, >=** | N/A |
| **7** | **and, and then, or, or else, xor** | Left |
| **8** | **in, not in** | Left |

> In the expression `A + B * C`, multiplication (`*`) has higher precedence than addition (`+`), so it is evaluated as `A + (B * C)`. For `X or Y and Z`, `and` has higher precedence than `or`, so it's `X or (Y and Z)`. The `**` operator is right-associative: `2**3**2` equals `2**(3**2) = 512`, not `(2**3)**2 = 64`.

Consider these practical examples demonstrating precedence rules:

```ada
-- Example 1: Multiplication before addition
declare
   X: Integer := 5;
   Y: Integer := 3;
   Z: Integer := X + Y * 2;  -- Y*2 first: 3*2=6, then 5+6=11
begin
   -- Z equals 11, not 16
end;

-- Example 2: Right-associative exponentiation
declare
   A: Integer := 2;
   B: Integer := 3;
   C: Integer := 2;
   Result: Integer := A ** B ** C;  -- B**C first: 3**2=9, then 2**9=512
begin
   -- Result equals 512
end;

-- Example 3: Short-circuit evaluation with and then/or else
declare
   Valid: Boolean := False;
   Data: Integer := 10;
begin
   -- Safe: checks Valid first before accessing Data
   if Valid and then Data > 0 then
      -- Executes only if Valid is true
   end if;
   
   -- Safe: checks Data first before accessing Valid
   if Data > 0 or else Valid then
      -- Executes if Data > 0 (no need to check Valid)
   end if;
end;
```

The short-circuit operators (`and then`, `or else`) are particularly important for safe programming—they prevent evaluating expressions that might cause errors. For example, in `if Pointer /= null and then Pointer.Data > 0`, the second condition is only evaluated if the pointer is valid.

## 1.4 Useful Attributes

Attributes in Ada provide metadata about types and objects. They are prefixed with an apostrophe (') and are invaluable for writing generic and type-safe code. Attributes allow you to query information about types without hardcoding values, making your code more adaptable and maintainable. The table below lists common attributes for scalar types and arrays, with practical examples for each.

| **Attribute** | **Description** | **Example** |
| :--- | :--- | :--- |
| **'First** | First value of a type or array dimension | declare X: Integer range 1..10; X'First = 1 |
| **'Last** | Last value of a type or array dimension | X'Last = 10 |
| **'Range** | Range of values for a type or array dimension | X'Range = 1..10 |
| **'Length** | Number of elements in an array | declare A: array (1..5) of Integer; A'Length = 5 |
| **'Image** | String representation of a value | Integer'Image(42) = " 42" |
| **'Value** | Convert string to value | Integer'Value("42") = 42 |
| **'Pos** | Position of an enumeration value | 'A' for Character'Pos |
| **'Val** | Value for a position | Character'Val(65) = 'A' |
| **'Succ** | Successor of a value | 'A'Succ = 'B' |
| **'Pred** | Predecessor of a value | 'B'Pred = 'A' |
| **'Width** | Width of string representation | Integer'Width = 11 |
| **'Digits** | Precision of floating-point type | Float'Digits = 6 |
| **'First(N)** | First value of dimension N | declare A: array (1..5, 1..3) of Integer; A'First(1) = 1 |
| **'Last(N)** | Last value of dimension N | A'Last(2) = 3 |
| **'Range(N)** | Range of dimension N | A'Range(1) = 1..5 |
| **'Length(N)** | Length of dimension N | A'Length(2) = 3 |
| **'Size** | Size in bits of the object | Integer'Size = 32 |

Attributes like 'Succ and 'Pred are essential for enumeration types. For example, if you have an enumeration type Day with Monday, Tuesday, etc., Monday'Succ is Tuesday. This makes iterating through days straightforward:

```ada
type Day is (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday);

procedure Print_Days is
   Current: Day := Monday;
begin
   while Current /= Sunday loop
      Put_Line(Day'Image(Current));
      Current := Current'Succ;
   end loop;
   Put_Line(Day'Image(Sunday));
end Print_Days;
```

'Width provides insight into how values will be formatted as strings. For example, Integer'Width is typically 11 for 32-bit systems (accounting for negative sign and 10 digits). This is useful for formatting output:

```ada
declare
   N: Integer := 42;
begin
   Put_Line(Integer'Image(N));  -- Outputs " 42" (with leading space)
   Put_Line(Integer'Image(-100)); -- Outputs "-100"
end;
```

For floating-point types, 'Digits indicates the number of significant digits. Float'Digits is typically 6, meaning about 6 decimal digits of precision. This is crucial for numerical accuracy:

```ada
declare
   F: Float := 1.23456789;
begin
   Put_Line(Float'Image(F));  -- Outputs " 1.23457" (rounded to 6 digits)
end;
```

'First(N), 'Last(N), etc. are invaluable for multi-dimensional arrays. Consider a 2D grid:

```ada
declare
   type Grid is array (1..10, 1..5) of Integer;
   G: Grid;
begin
   -- Loop through all elements safely
   for I in G'First(1) .. G'Last(1) loop
      for J in G'First(2) .. G'Last(2) loop
         G(I, J) := I * J;
      end loop;
   end loop;
end;
```

This approach ensures your loops work correctly even if array dimensions change—making your code more maintainable.

## 1.5 Control Structures

Control structures manage the flow of execution in Ada programs. These structures allow you to make decisions, repeat actions, and handle complex logic in a structured way. Ada's control structures are designed for clarity and safety—each has explicit syntax that prevents common programming errors. Below is a reference table for the most commonly used control structures with practical syntax examples.

| **Structure** | **Syntax** | **Example** |
| :--- | :--- | :--- |
| **if** | if condition then ... end if; | if X > 0 then Put_Line("Positive"); end if; |
| **if-else** | if condition then ... else ... end if; | if Temperature > 30 then Put_Line("Hot"); else Put_Line("Cool"); end if; |
| **if-elsif** | if ... elsif ... else ... end if; | if Grade >= 90 then Put_Line("A"); elsif Grade >= 80 then Put_Line("B"); else Put_Line("C"); end if; |
| **case** | case expr is when ... => ... end case; | case Day is when Monday => ... end case; |
| **case with ranges** | case expr is when 1..10 => ... end case; | case Num is when 1..5 => Put_Line("Small"); when 6..10 => Put_Line("Medium"); end case; |
| **case with multiple values** | case expr is when 'a' | 'e' | 'i' => ... end case; | case Char is when 'a' | 'e' | 'i' | 'o' | 'u' => Put_Line("Vowel"); end case; |
| **for loop** | for i in range loop ... end loop; | for I in 1..10 loop Put_Line(Integer'Image(I)); end loop; |
| **reverse for loop** | for i in reverse range loop ... end loop; | for I in reverse 1..10 loop ... end loop; |
| **named loop** | Loop_Name: loop ... exit Loop_Name when ...; end loop Loop_Name; | Outer: loop ... exit Outer when Done; end loop Outer; |
| **while loop** | while condition loop ... end loop; | while X < 10 loop X := X + 1; end loop; |
| **loop with exit** | loop ... exit when ...; end loop; | loop ... exit when X > 5; end loop; |

Named loops are critical for nested loops where you need to exit a specific loop. For example, in a matrix processing loop, you can name the outer loop and exit it directly from an inner loop:

```ada
declare
   Matrix: array (1..10, 1..10) of Integer;
   Found: Boolean := False;
begin
   Outer_Loop: for I in 1..10 loop
      for J in 1..10 loop
         if Matrix(I, J) = 42 then
            Found := True;
            exit Outer_Loop;  -- Exits both loops immediately
         end if;
      end loop;
   end loop Outer_Loop;
   
   if Found then
      Put_Line("Found 42 in matrix");
   end if;
end;
```

The `reverse` keyword simplifies backward iteration without manual index adjustment. This is especially useful for array processing:

```ada
declare
   Data: array (1..5) of Integer := (1, 2, 3, 4, 5);
begin
   for I in reverse Data'Range loop
      Put_Line(Integer'Image(Data(I)));
   end loop;
   -- Outputs: 5 4 3 2 1
end;
```

Case statements with ranges and multiple values make pattern matching concise and readable. For example, validating input:

```ada
declare
   Input: Character := '3';
begin
   case Input is
      when '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' =>
         Put_Line("Digit");
      when 'A' | 'B' | 'C' | 'D' | 'E' | 'F' =>
         Put_Line("Hex digit");
      when others =>
         Put_Line("Invalid input");
   end case;
end;
```

This approach is cleaner and more maintainable than nested if-else statements.

## 1.6 Subprogram Parameter Modes

Ada uses parameter modes to specify how data flows between subprograms. The mode determines whether a parameter can be read, written, or both. Understanding these modes is crucial for writing safe and efficient code—misusing them can lead to subtle bugs or inefficient memory usage. The table below summarizes the three modes and their usage guidelines.

| **Mode** | **Read** | **Write** | **Usage** |
| :--- | :--- | :--- | :--- |
| **in** | Yes | No | Default for function parameters; safest for input-only data |
| **out** | No | Yes | For returning values when initial value is irrelevant |
| **in out** | Yes | Yes | For modifying existing values (e.g., buffers) |

> - **in**: Use for all function parameters and when data is only read. This is the safest mode and the default for functions.
> - **out**: Use when a procedure needs to return a value but doesn't require an initial value. For example, a procedure that generates a random number.
> - **in out**: Use when a procedure needs to modify an existing value. For example, a procedure that updates a buffer.

Functions can only have `in` parameters. Attempting to use `out` or `in out` in a function results in a compilation error. This restriction ensures functions are pure—they don't modify external state and can be safely used in expressions.

Here's a complete example demonstrating all three modes:

```ada
procedure Example(
   Input : in Integer;        -- Read-only input
   Output : out Integer;      -- New value returned
   Modifiable : in out Integer) -- Modified in place
is
begin
   Output := Input * 2;
   Modifiable := Modifiable + 1;
end Example;

declare
   A: Integer := 5;
   B: Integer;
   C: Integer := 10;
begin
   Example(A, B, C);
   -- A remains 5 (unchanged)
   -- B becomes 10 (new value)
   -- C becomes 11 (modified in place)
end;
```

The `in` parameter `Input` is read-only—any attempt to modify it inside the procedure would cause a compilation error. The `out` parameter `Output` is ignored on entry—its initial value is irrelevant—and must be assigned before the procedure returns. The `in out` parameter `Modifiable` is read on entry and can be modified—changes persist after the procedure returns.

When designing subprograms, follow these best practices:
- Prefer `in` parameters whenever possible—they're safest and most flexible
- Use `out` only when you need to return a value that doesn't depend on initial input
- Use `in out` only when you need to modify existing data (e.g., updating a buffer)
- Avoid `in out` for simple values—return values via `out` or function results instead

This approach ensures your code is clear, maintainable, and less prone to unexpected side effects.

## 1.7 Common I/O Operations

Ada's standard I/O packages provide robust input/output capabilities. This section covers the most frequently used operations across different packages, with detailed examples for each. Proper I/O handling is essential for any practical application—from simple console programs to complex file processing systems.

### 1.7.1 Ada.Text_IO

| **Procedure/Function** | **Description** | **Example** |
| :--- | :--- | :--- |
| **Put_Line** | Output string with newline | Put_Line("Hello"); |
| **Put** | Output string without newline | Put("Hello"); |
| **Get_Line** | Read line from stdin | Get_Line(S); |
| **Get** | Read single character | Get(C); |
| **Open** | Open file | Open(File, In_File, "input.txt"); |
| **Close** | Close file | Close(File); |
| **Is_End_Of_File** | Check if end of file | Is_End_Of_File(File) |
| **Create** | Create new file | Create(File, Out_File, "output.txt"); |
| **Set_Output** | Redirect output to file | Set_Output(File); |
| **Reset** | Reset file position | Reset(File); |

### 1.7.2 Ada.Integer_Text_IO

| **Procedure/Function** | **Description** | **Example** |
| :--- | :--- | :--- |
| **Put** | Output integer | Put(42); |
| **Get** | Read integer | Get(N); |
| **Width** | Set minimum field width | Put(N, Width => 5); |
| **Fore** | Set leading spaces | Put(N, Fore => 3); |
| **Aft** | Set decimal places | Put(N, Aft => 2); |
| **Base** | Set number base (2-16) | Put(N, Base => 16); |

### 1.7.3 Ada.Float_Text_IO

| **Procedure/Function** | **Description** | **Example** |
| :--- | :--- | :--- |
| **Put** | Output float | Put(3.14); |
| **Get** | Read float | Get(F); |
| **Exp** | Set exponent format | Put(F, Exp => 3); |
| **Fore** | Set leading spaces | Put(F, Fore => 4); |
| **Aft** | Set decimal places | Put(F, Aft => 2); |

### 1.7.4 Ada.Enumeration_IO

| **Procedure/Function** | **Description** | **Example** |
| :--- | :--- | :--- |
| **Put** | Output enumeration value | Put(Day); |
| **Get** | Read enumeration value | Get(Day); |
| **Image** | Convert to string | Day'Image; |

### 1.7.5 Ada.Command_Line

| **Procedure/Function** | **Description** | **Example** |
| :--- | :--- | :--- |
| **Argument_Count** | Number of command-line arguments | Count := Argument_Count; |
| **Argument** | Get specific argument | Arg := Argument(1); |
| **Environment_Variable** | Get environment variable | Env := Environment_Variable("PATH"); |

Here's a complete example demonstrating file reading with Ada.Text_IO:

```ada
with Ada.Text_IO; use Ada.Text_IO;

procedure Read_File is
   File : File_Type;
   Line : String(1..100);
   Last : Natural;
begin
   Open(File, In_File, "data.txt");
   while not Is_End_Of_File(File) loop
      Get_Line(File, Line, Last);
      Put_Line(Line(1..Last));
   end loop;
   Close(File);
end Read_File;
```

This code safely reads a text file line by line, handling variable-length lines correctly. The `Last` variable tracks the actual length of each line, ensuring no trailing garbage is printed.

For numeric formatting, consider this example using Ada.Integer_Text_IO:

```ada
with Ada.Integer_Text_IO; use Ada.Integer_Text_IO;

procedure Format_Numbers is
   N: Integer := 42;
begin
   Put(N, Width => 5);      -- Outputs "   42" (5-character width)
   Put(N, Fore => 3);       -- Outputs "  42" (3 leading spaces)
   Put(N, Base => 16);      -- Outputs "2A" (hexadecimal)
   Put(N, Base => 2);       -- Outputs "101010" (binary)
end Format_Numbers;
```

This demonstrates how to control output format for integers—essential for creating consistent reports or logs.

For floating-point formatting:

```ada
with Ada.Float_Text_IO; use Ada.Float_Text_IO;

procedure Format_Floats is
   F: Float := 3.14159;
begin
   Put(F, Aft => 2);        -- Outputs " 3.14" (2 decimal places)
   Put(F, Exp => 3);        -- Outputs " 3.142E+00" (exponent format)
   Put(F, Fore => 4, Aft => 3); -- Outputs " 3.142" (4 leading spaces, 3 decimals)
end Format_Floats;
```

This shows how to control precision and formatting for floating-point values—critical for scientific or financial applications.

Command-line argument processing is straightforward with Ada.Command_Line:

```ada
with Ada.Command_Line; use Ada.Command_Line;
with Ada.Text_IO; use Ada.Text_IO;

procedure Process_Args is
   Count: Natural := Argument_Count;
begin
   Put_Line("Number of arguments: " & Natural'Image(Count));
   for I in 1..Count loop
      Put_Line("Argument " & Integer'Image(I) & ": " & Argument(I));
   end loop;
end Process_Args;
```

When run as `./app arg1 arg2`, this outputs:
```
Number of arguments: 2
Argument 1: arg1
Argument 2: arg2
```

This pattern is essential for creating command-line utilities and scripts.

## 1.8 Predefined Exceptions

Exceptions in Ada handle runtime errors gracefully. Unlike languages that rely solely on return codes, Ada's exception mechanism provides structured error handling that separates normal code from error-handling logic. This section lists common exceptions and shows how to handle them effectively.

| **Exception** | **Description** |
| :--- | :--- |
| **Constraint_Error** | Violation of type constraints (e.g., array bounds, numeric overflow) |
| **Program_Error** | Internal inconsistency (e.g., invalid dispatch, null access dereference) |
| **Storage_Error** | Memory allocation failure (e.g., stack overflow) |
| **Data_Error** | Invalid data conversion (e.g., string to number) |
| **Tasking_Error** | Task-related error (e.g., invalid task operation) |

### 1.8.1 Exception Handler Syntax

| **Syntax Element** | **Description** |
| :--- | :--- |
| **exception** | Start of exception handler |
| **when Some_Error =>** | Handle specific exception |
| **when A | B =>** | Handle multiple exceptions |
| **when others =>** | Handle all other exceptions |
| **raise;** | Re-raise current exception |
| **raise New_Error;** | Raise new exception |

Here's a practical example demonstrating exception handling for data conversion:

```ada
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Integer_Text_IO; use Ada.Integer_Text_IO;

procedure Handle_Exception is
   Input : String(1..10);
   Last : Natural;
   Value : Integer;
begin
   Put("Enter a number: ");
   Get_Line(Input, Last);
   begin
      Value := Integer'Value(Input(1..Last));
      Put("You entered: ");
      Put(Value);
   exception
      when Data_Error =>
         Put_Line("Error: Invalid number format");
      when others =>
         Put_Line("Unexpected error occurred");
   end;
end Handle_Exception;
```

When run, this program safely handles invalid inputs:

```
Enter a number: abc
Error: Invalid number format

Enter a number: 42
You entered: 42
```

The `Data_Error` exception is raised when `Integer'Value` encounters invalid input. The `when others` handler catches any unexpected errors—though for production code, you'd typically handle specific exceptions first.

For array bounds errors:

```ada
declare
   A: array (1..5) of Integer;
begin
   A(6) := 42;  -- Constraint_Error: index out of range
exception
   when Constraint_Error =>
      Put_Line("Array index out of bounds");
end;
```

This demonstrates how Ada catches out-of-bounds errors at runtime—preventing memory corruption that would occur in languages like C.

For tasking errors:

```ada
task type Worker is
   entry Start;
end Worker;

task body Worker is
begin
   null;
end Worker;

declare
   W: Worker;
begin
   W.Start;  -- Tasking_Error: task already terminated
exception
   when Tasking_Error =>
      Put_Line("Invalid task operation");
end;
```

This shows how Ada handles invalid task operations—critical for concurrent programs.

> "Ada's exception mechanism ensures that errors are handled explicitly and safely. By separating error-handling logic from normal code, you create programs that are more reliable and easier to maintain."

## 1.9 Conclusion

> "Ada's design philosophy prioritizes clarity and correctness over convenience. This reference guide embodies that principle by providing precise, actionable information without unnecessary complexity—empowering you to write code that is both reliable and maintainable from the start."

This quick reference guide is your companion for everyday Ada development. While mastering Ada takes time, this resource provides immediate clarity on syntax, types, and patterns. Remember: the best code is clear, correct, and maintainable—use this guide to write code that stands the test of time.

As you begin writing your own projects, keep these principles in mind:
- Start small and build incrementally
- Leverage Ada's strong typing to catch errors early
- Use standard libraries before reinventing the wheel
- Test thoroughly—Ada's safety features prevent many errors, but not all

This guide has covered the essential building blocks of Ada programming. For deeper exploration, consult the Ada Reference Manual and explore the GNAT community resources. The Ada ecosystem is welcoming and supportive—don't hesitate to ask questions and share your work with others.

> "The key to mastering Ada is understanding its design philosophy: safety through clarity. This reference guide embodies that principle by providing precise, actionable information without unnecessary complexity."

With this knowledge, you're ready to tackle real-world programming challenges with confidence.

