# 10\. Memory Management and Controlled Types in Ada: Safe Resource Handling for Everyday Applications

> **Why Memory Management Matters**
> 
> "Memory management isn't just for experts—it's a fundamental part of writing reliable code. Ada makes it simple and safe, even for beginners."

When you're writing a program that reads a file, connects to a database, or manages game assets, you're dealing with resources that need careful handling. In many programming languages, this means manually allocating and freeing memory—a process that's easy to get wrong. For example, in C, you might forget to close a file or free memory, leading to crashes or security vulnerabilities. In Java, you might forget to close a database connection, causing resource leaks that slow down your application.

Ada solves these problems with a powerful combination of automatic memory management and controlled types. With Ada, you don't have to worry about manual cleanup—when an object goes out of scope, Ada automatically releases its resources. This means your code is simpler, safer, and less prone to errors. Whether you're building a home automation system, a simple game, or a web application, Ada's memory management features help you focus on what your program does rather than how it manages resources.

## Stack vs. Heap: How Ada Handles Memory

All programs use two main types of memory: the stack and the heap. Understanding the difference between them is key to writing efficient and reliable code.

### The Stack

The stack is like a stack of plates in a cafeteria—new items are added to the top, and items are removed from the top. In programming terms, the stack is used for local variables that have a fixed size and a known lifetime. When you enter a function, space is allocated on the stack for its local variables. When you leave the function, that space is automatically reclaimed.

Ada uses the stack for most local variables. For example:

```ada
procedure Calculate_Sum is
   A : Integer := 5;
   B : Integer := 10;
   Sum : Integer;
begin
   Sum := A + B;
   -- A, B, and Sum are on the stack
   -- They are automatically cleaned up when Calculate_Sum exits
end Calculate_Sum;
```

The stack is fast and efficient because memory allocation and deallocation happen automatically. You don't need to worry about freeing memory—you just use variables, and Ada handles the rest.

### The Heap

The heap is like a big storage room where you can store items of varying sizes. In programming terms, the heap is used for dynamic memory allocation—when you need to create objects whose size or lifetime isn't known at compile time.

In Ada, you use access types (similar to pointers in other languages) to allocate memory on the heap. For example:

```ada
type Integer_Access is access Integer;
Data : Integer_Access := new Integer'(10);
```

Here, `Data` is an access type that points to an integer allocated on the heap. The key difference from the stack is that memory allocated on the heap doesn't automatically get freed when you leave a function—you need to explicitly free it with `Data := null;` (though Ada's controlled types make this unnecessary in many cases).

### Stack vs. Heap: When to Use Which

| **Memory Type** | **Best For** | **Lifetime** | **Allocation Speed** |
| :--- | :--- | :--- | :--- |
| **Stack** | Local variables, fixed-size data | Function scope | Very fast |
| **Heap** | Dynamic data, large structures | Program scope or controlled lifetime | Slower than stack |

For most everyday programming tasks, the stack is sufficient. But when you need to create data structures whose size depends on user input or runtime conditions, the heap becomes necessary. The important thing to remember is that with Ada's controlled types, you rarely need to manually manage heap memory—Ada handles it for you.

## Access Types: Safe Pointers in Ada

In many languages, pointers are powerful but dangerous. In C, for example, you can create dangling pointers (pointers to freed memory) or null pointers that cause crashes. Ada solves these problems with safe access types that are designed to be both powerful and reliable.

### Basic Access Types

An access type in Ada is like a pointer in other languages, but with strong type safety. Here's how you declare and use one:

```ada
type Integer_Access is access Integer;
Data : Integer_Access := new Integer'(10);
```

This creates an access type `Integer_Access` that points to an integer. `Data` is then initialized to point to a new integer with value 10 on the heap.

You can also create access types for records:

```ada
type Person is record
   Name : String(1..50);
   Age  : Natural;
end record;

type Person_Access is access Person;
Person_Data : Person_Access := new Person'(Name => "Alice", Age => 30);
```

### Access Type Safety Features

Ada's access types include several safety features that prevent common pointer errors:

- **Null checking**: Access types are automatically initialized to `null` unless explicitly assigned
- **Type safety**: You can't accidentally assign an access type to a different type
- **No pointer arithmetic**: Ada doesn't allow pointer arithmetic like in C, preventing many common errors
- **Controlled cleanup**: When combined with controlled types, access types automatically clean up resources

For example, in C you might write:

```c
int *data = malloc(sizeof(int));
*data = 10;
free(data);
// Now data is a dangling pointer
```

In Ada, you'd use:

```ada
type Integer_Access is access Integer;
Data : Integer_Access := new Integer'(10);
-- No need to free explicitly—controlled types handle it
```

### Controlled Access Types

The real power of Ada's access types comes when combined with controlled types. This lets you automatically manage resources without manual cleanup:

```ada
with Ada.Finalization;

package File_Handle is

   type File_Handle is new Ada.Finalization.Controlled with limited record
      File : Ada.Text_IO.File_Type;
   end record;

   procedure Initialize (Object : in out File_Handle);
   procedure Finalize (Object : in out File_Handle);

   procedure Open (Object : in out File_Handle; Name : String; Mode : Ada.Text_IO.File_Mode);
   procedure Close (Object : in out File_Handle);
   procedure Read_Line (Object : in out File_Handle; Line : out String; Last : out Natural);

private
   procedure Initialize (Object : in out File_Handle);
   procedure Finalize (Object : in out File_Handle);
end File_Handle;
```

In this example, `File_Handle` is a controlled type that automatically closes the file when it goes out of scope. You don't need to call `Close` explicitly—Ada handles it for you.

## Controlled Types: The Heart of Ada's Memory Management

Controlled types are Ada's secret weapon for safe resource management. They let you define exactly what happens when an object is created, copied, or destroyed—ensuring that resources are always properly managed.

### What Are Controlled Types?

A controlled type is a type that extends `Ada.Finalization.Controlled` and defines specific procedures to control its lifecycle. These procedures are:

- **Initialize**: Called when the object is created
- **Finalize**: Called when the object goes out of scope
- **Adjust**: Called when the object is copied (if not limited)

This gives you complete control over how resources are allocated and released.

### Creating a Controlled Type: The File Handle Example

Let's create a complete example of a controlled type for file handling:

```ada
with Ada.Finalization;
with Ada.Text_IO;

package File_Handle is

   type File_Handle is new Ada.Finalization.Controlled with limited record
      File : Ada.Text_IO.File_Type;
   end record;

   procedure Initialize (Object : in out File_Handle);
   procedure Finalize (Object : in out File_Handle);

   procedure Open (Object : in out File_Handle; Name : String; Mode : Ada.Text_IO.File_Mode);
   procedure Close (Object : in out File_Handle);
   procedure Read_Line (Object : in out File_Handle; Line : out String; Last : out Natural);

private
   procedure Initialize (Object : in out File_Handle);
   procedure Finalize (Object : in out File_Handle);
end File_Handle;
```

```ada
package body File_Handle is

   procedure Initialize (Object : in out File_Handle) is
   begin
      Object.File := Ada.Text_IO.Closed_File;
   end Initialize;

   procedure Finalize (Object : in out File_Handle) is
   begin
      if Object.File /= Ada.Text_IO.Closed_File then
         Ada.Text_IO.Close (Object.File);
      end if;
   end Finalize;

   procedure Open (Object : in out File_Handle; Name : String; Mode : Ada.Text_IO.File_Mode) is
   begin
      Ada.Text_IO.Open (File => Object.File, Mode => Mode, Name => Name);
   end Open;

   procedure Close (Object : in out File_Handle) is
   begin
      if Object.File /= Ada.Text_IO.Closed_File then
         Ada.Text_IO.Close (Object.File);
      end if;
   end Close;

   procedure Read_Line (Object : in out File_Handle; Line : out String; Last : out Natural) is
   begin
      Ada.Text_IO.Get_Line (Object.File, Line, Last);
   end Read_Line;

end File_Handle;
```

Now let's use this controlled type in a program:

```ada
with File_Handle;
with Ada.Text_IO;

procedure Test_File is
   F : File_Handle;
begin
   F.Open("data.txt", Ada.Text_IO.In_File);
   declare
      Line : String(1..100);
      Last : Natural;
   begin
      F.Read_Line(Line, Last);
      Ada.Text_IO.Put_Line(Line(1..Last));
   end;
   -- No need to call Close; Finalize will do it when F goes out of scope
end Test_File;
```

When `F` goes out of scope at the end of `Test_File`, Ada automatically calls `Finalize`, which closes the file. You don't need to remember to close it—Ada handles it for you.

### Why Controlled Types Matter

Controlled types solve the most common memory management problems:

- **Resource leaks**: Resources are automatically released when they're no longer needed
- **Dangling pointers**: Objects are properly cleaned up, preventing invalid references
- **Manual cleanup errors**: You don't have to remember to close files or free memory

This is especially important for everyday programming tasks. Imagine a home automation system that reads sensor data from files—if you forget to close a file, the system might run out of file handles and crash. With controlled types, this simply can't happen.

## How Controlled Types Work Under the Hood

Let's dive deeper into how controlled types work. When you create a controlled type, Ada automatically calls the `Initialize` procedure. When the object goes out of scope, Ada calls `Finalize`. If the object is copied, Ada calls `Adjust`.

### The Lifecycle of a Controlled Type

1. **Creation**: When you declare a controlled type variable, `Initialize` is called
2. **Usage**: You can use the object normally
3. **Copying**: If the object is copied, `Adjust` is called
4. **Destruction**: When the object goes out of scope, `Finalize` is called

Here's a simple example to demonstrate:

```ada
with Ada.Finalization;
with Ada.Text_IO;

package Example is

   type Example_Type is new Ada.Finalization.Controlled with record
      Value : Integer;
   end record;

   procedure Initialize (Object : in out Example_Type);
   procedure Finalize (Object : in out Example_Type);
   procedure Adjust (Object : in out Example_Type);

private
   procedure Initialize (Object : in out Example_Type);
   procedure Finalize (Object : in out Example_Type);
   procedure Adjust (Object : in out Example_Type);
end Example;
```

```ada
package body Example is

   procedure Initialize (Object : in out Example_Type) is
   begin
      Ada.Text_IO.Put_Line("Initialize called");
      Object.Value := 0;
   end Initialize;

   procedure Finalize (Object : in out Example_Type) is
   begin
      Ada.Text_IO.Put_Line("Finalize called");
   end Finalize;

   procedure Adjust (Object : in out Example_Type) is
   begin
      Ada.Text_IO.Put_Line("Adjust called");
   end Adjust;

end Example;
```

```ada
with Example;

procedure Test is
   A : Example.Example_Type;
   B : Example.Example_Type;
begin
   A.Value := 10;
   B := A;  -- Adjust is called here
end Test;
```

When you run this program, you'll see:

```
Initialize called
Initialize called
Adjust called
Finalize called
Finalize called
```

This shows the lifecycle of the controlled types. `Initialize` is called when each variable is created. `Adjust` is called when `B` is assigned from `A`. `Finalize` is called when each variable goes out of scope.

### When to Use Limited Controlled Types

By default, controlled types can be copied. But for some resources (like file handles), copying doesn't make sense—you don't want two objects to manage the same file. That's where limited controlled types come in.

A limited controlled type can't be copied. You declare it like this:

```ada
type File_Handle is new Ada.Finalization.Controlled with limited record
   File : Ada.Text_IO.File_Type;
end record;
```

The `limited` keyword means you can't assign one `File_Handle` to another. This prevents accidental copying of resources that shouldn't be shared.

## Memory Leaks: How Ada Prevents Them

Memory leaks are one of the most common problems in programming. They occur when you allocate memory but never free it, causing your program to use more and more memory over time. In C, this is a frequent issue—you might forget to call `free`, or you might have complex code paths where freeing is easy to miss.

Ada prevents memory leaks through several mechanisms:

- **Controlled types**: Resources are automatically cleaned up when objects go out of scope
- **No manual memory management**: You don't need to call `malloc` or `free`
- **Automatic cleanup**: Ada handles resource management for you

Let's compare how memory leaks happen in C versus how Ada prevents them.

### C Memory Leak Example

```c
#include <stdlib.h>

void Process_Data() {
   int *data = (int*)malloc(sizeof(int));
   *data = 10;
   // Forgot to free memory!
}
```

This function allocates memory but never frees it, causing a memory leak.

### Ada Memory Leak Prevention

```ada
with Ada.Finalization;

package Data_Manager is

   type Data_Handle is new Ada.Finalization.Controlled with record
      Data : Integer;
   end record;

   procedure Initialize (Object : in out Data_Handle);
   procedure Finalize (Object : in out Data_Handle);

private
   procedure Initialize (Object : in out Data_Handle);
   procedure Finalize (Object : in out Data_Handle);
end Data_Manager;
```

```ada
package body Data_Manager is

   procedure Initialize (Object : in out Data_Handle) is
   begin
      Object.Data := 0;
   end Initialize;

   procedure Finalize (Object : in out Data_Handle) is
   begin
      -- No need to free—Ada handles it automatically
   end Finalize;

end Data_Manager;
```

```ada
with Data_Manager;

procedure Test is
   D : Data_Manager.Data_Handle;
begin
   D.Data := 10;
   -- When D goes out of scope, Finalize is called automatically
end Test;
```

In Ada, there's no manual memory management to forget. The `Data_Handle` object is automatically cleaned up when it goes out of scope, preventing any memory leaks.

## Memory Management in Ada vs. Other Languages

Let's compare how Ada handles memory management compared to other popular languages. This table shows the key differences:

| **Language** | **Memory Management Approach** | **Key Features** |
| :--- | :--- | :--- |
| **C** | Manual allocation/deallocation | Requires explicit `malloc`/`free`; prone to leaks and dangling pointers |
| **C++** | RAII (Resource Acquisition Is Initialization) | Automatic cleanup via destructors; requires careful design |
| **Java** | Garbage collection | Automatic memory management; no manual deallocation; but resources like files still need manual closing |
| **Python** | Garbage collection + context managers | Automatic memory; context managers handle resources like files |
| **Ada** | Controlled types + automatic storage | Automatic cleanup via Finalize; strong type safety; no dangling pointers |

Let's explore each language in more detail.

### C: Manual Memory Management

In C, you're responsible for all memory management. You allocate memory with `malloc` and free it with `free`. This is powerful but error-prone—you might forget to free memory, or you might free it too early.

For example:

```c
int *data = malloc(sizeof(int));
*data = 10;
// Forgot to free!
```

This code leaks memory. To fix it, you'd need to add `free(data);` at the end.

### C++: RAII

C++ uses RAII (Resource Acquisition Is Initialization), where resources are tied to object lifetimes. When an object is created, it acquires resources; when it's destroyed, it releases them.

For example:

```cpp
class File {
public:
   File(const char* name) { fopen(name); }
   ~File() { fclose(); }
};

void Process() {
   File f("data.txt");
   // No need to close—destructor handles it
}
```

This is similar to Ada's controlled types, but C++ requires careful design to avoid issues like shallow copies.

### Java: Garbage Collection

Java uses garbage collection to automatically reclaim memory. You don't need to free memory manually, but you still need to close resources like files.

For example:

```java
FileReader reader = new FileReader("data.txt");
try {
   // Process file
} finally {
   reader.close(); // Must manually close
}
```

Java's garbage collector handles memory, but resources like files still need manual cleanup.

### Python: Context Managers

Python uses context managers (the `with` statement) to handle resource cleanup.

For example:

```python
with open("data.txt") as f:
   # Process file
# File is automatically closed
```

This is similar to Ada's controlled types, but Python's approach is more limited—it only works for specific resource types.

### Ada: Controlled Types

Ada's controlled types combine the best of both worlds. They provide automatic resource cleanup without manual effort, while maintaining strong type safety.

For example:

```ada
with File_Handle;

procedure Test is
   F : File_Handle;
begin
   F.Open("data.txt", Ada.Text_IO.In_File);
   -- No need to close—Finalize handles it
end Test;
```

This is simpler and safer than C++, Java, or Python approaches. You don't need to remember to close files, and there's no risk of forgetting to free memory.

## Best Practices for Memory Management in Ada

Now that you understand how Ada handles memory, let's look at best practices for using it effectively.

### 1\. Use Controlled Types for Any Resource That Needs Cleanup

Whenever you have a resource that needs to be cleaned up (files, database connections, network sockets), use a controlled type. This ensures the resource is always properly released.

For example:

```ada
with Ada.Finalization;

package Database_Connection is

   type Connection is new Ada.Finalization.Controlled with limited record
      Handle : Database_Handle;
   end record;

   procedure Initialize (Object : in out Connection);
   procedure Finalize (Object : in out Connection);

   procedure Connect (Object : in out Connection; Name : String);
   procedure Disconnect (Object : in out Connection);
   procedure Query (Object : in out Connection; SQL : String; Result : out String);

private
   procedure Initialize (Object : in out Connection);
   procedure Finalize (Object : in out Connection);
end Database_Connection;
```

This ensures the database connection is always properly closed, even if an exception occurs.

### 2\. Avoid Manual Memory Management When Possible

In Ada, you rarely need to manually manage memory. Let Ada handle it for you. For example, instead of:

```ada
type Integer_Access is access Integer;
Data : Integer_Access := new Integer'(10);
-- ...
Data := null; -- Manual cleanup
```

Use a controlled type:

```ada
type Integer_Handle is new Ada.Finalization.Controlled with record
   Value : Integer;
end record;

procedure Initialize (Object : in out Integer_Handle) is
begin
   Object.Value := 0;
end Initialize;

procedure Finalize (Object : in out Integer_Handle) is
begin
   -- No cleanup needed—Ada handles it
end Finalize;
```

### 3\. Understand the Difference Between Stack and Heap Allocation

For small, fixed-size data, use stack allocation (local variables). For larger or dynamically-sized data, use heap allocation with controlled types.

For example:

```ada
-- Stack allocation for small data
procedure Calculate_Sum is
   A : Integer := 5;
   B : Integer := 10;
   Sum : Integer := A + B;
end Calculate_Sum;

-- Heap allocation with controlled types for larger data
package Data_Manager is
   type Data_Handle is new Ada.Finalization.Controlled with record
      Data : String(1..1000);
   end record;
end Data_Manager;
```

### 4\. Test for Memory Leaks

Even with Ada's automatic memory management, it's good practice to test for memory leaks. Use tools like GNATcheck or GNATprove to verify your code.

For example, run:

```bash
gnatcheck your_program.adb
```

This will check for potential memory issues.

### 5\. Use Ada's Standard Containers

Ada provides standard containers like `Ada.Containers.Vectors` and `Ada.Containers.Doubly_Linked_Lists` that use controlled types under the hood. These containers automatically manage memory for you.

For example:

```ada
with Ada.Containers.Vectors;

package Integer_Vectors is new Ada.Containers.Vectors (Index_Type => Natural, Element_Type => Integer);

procedure Test is
   V : Integer_Vectors.Vector;
begin
   V.Append(10);
   V.Append(20);
   -- No need to free—container handles it
end Test;
```

## Real-World Example: A Simple Game with Memory Management

Let's build a simple game to see how Ada's memory management works in practice.

### Game Overview

We'll create a simple game where the player collects items. Each item has a name and value. We'll use controlled types to manage item memory automatically.

### Item Type with Controlled Memory

```ada
with Ada.Finalization;

package Item_Manager is

   type Item is new Ada.Finalization.Controlled with record
      Name : String(1..50);
      Value : Natural;
   end record;

   procedure Initialize (Object : in out Item);
   procedure Finalize (Object : in out Item);

   procedure Set_Name (Object : in out Item; Name : String);
   procedure Set_Value (Object : in out Item; Value : Natural);

private
   procedure Initialize (Object : in out Item);
   procedure Finalize (Object : in out Item);
end Item_Manager;
```

```ada
package body Item_Manager is

   procedure Initialize (Object : in out Item) is
   begin
      Object.Name := (others => ' ');
      Object.Value := 0;
   end Initialize;

   procedure Finalize (Object : in out Item) is
   begin
      -- No cleanup needed—Ada handles it
   end Finalize;

   procedure Set_Name (Object : in out Item; Name : String) is
   begin
      if Name'Length > Object.Name'Length then
         raise Constraint_Error with "Name too long";
      else
         Object.Name(1..Name'Length) := Name;
      end if;
   end Set_Name;

   procedure Set_Value (Object : in out Item; Value : Natural) is
   begin
      Object.Value := Value;
   end Set_Value;

end Item_Manager;
```

### Game with Item Collection

```ada
with Item_Manager;
with Ada.Text_IO;

procedure Game is
   use Ada.Text_IO;
   use Item_Manager;

   type Item_Array is array (1..10) of Item_Manager.Item;
   Items : Item_Array;
   Count : Natural := 0;
begin
   -- Add some items
   Items(1).Set_Name("Sword");
   Items(1).Set_Value(100);

   Items(2).Set_Name("Shield");
   Items(2).Set_Value(50);

   -- Display items
   for I in 1..Count loop
      Put_Line(Items(I).Name & " - " & Items(I).Value'Image);
   end loop;
   -- No need to free items—controlled types handle it
end Game;
```

This game automatically manages memory for items. When the `Items` array goes out of scope, Ada automatically cleans up all the items—no manual cleanup needed.

## Exercises: Building Your Own Memory-Managed Systems

Now that you've learned about Ada's memory management, let's put it into practice with some exercises.

### Exercise 1: Database Connection Manager

Create a controlled type for a database connection that automatically closes the connection when it goes out of scope.

> **Challenge**: Prove that your database connection is always properly closed, even if an exception occurs.

#### Solution Guidance

Start by defining your controlled type:

```ada
with Ada.Finalization;

package Database_Connection is

   type Connection is new Ada.Finalization.Controlled with limited record
      Handle : Database_Handle;
   end record;

   procedure Initialize (Object : in out Connection);
   procedure Finalize (Object : in out Connection);

   procedure Connect (Object : in out Connection; Name : String);
   procedure Query (Object : in out Connection; SQL : String; Result : out String);

private
   procedure Initialize (Object : in out Connection);
   procedure Finalize (Object : in out Connection);
end Database_Connection;
```

Then implement the package body:

```ada
package body Database_Connection is

   procedure Initialize (Object : in out Connection) is
   begin
      Object.Handle := Null_Handle;
   end Initialize;

   procedure Finalize (Object : in out Connection) is
   begin
      if Object.Handle /= Null_Handle then
         Close_Connection(Object.Handle);
      end if;
   end Finalize;

   procedure Connect (Object : in out Connection; Name : String) is
   begin
      Object.Handle := Open_Connection(Name);
   end Connect;

   procedure Query (Object : in out Connection; SQL : String; Result : out String) is
   begin
      Result := Execute_Query(Object.Handle, SQL);
   end Query;

end Database_Connection;
```

Now test it with a program that uses the connection:

```ada
with Database_Connection;

procedure Test_Database is
   C : Database_Connection.Connection;
begin
   C.Connect("mydb");
   declare
      Result : String(1..1000);
   begin
      C.Query("SELECT * FROM users", Result);
      Put_Line(Result);
   end;
   -- Connection is automatically closed when C goes out of scope
end Test_Database;
```

This ensures your database connection is always properly closed, even if an exception occurs during the query.

### Exercise 2: Dynamic Array with Automatic Memory Management

Create a controlled type for a dynamic array that automatically allocates and frees memory as needed.

> **Challenge**: Implement a dynamic array that can grow and shrink as needed, with automatic memory management.

#### Solution Guidance

Start by defining your controlled type:

```ada
with Ada.Finalization;

package Dynamic_Array is

   type Dynamic_Array is new Ada.Finalization.Controlled with record
      Data : access Integer_Array;
      Size : Natural;
   end record;

   procedure Initialize (Object : in out Dynamic_Array);
   procedure Finalize (Object : in out Dynamic_Array);
   procedure Adjust (Object : in out Dynamic_Array);

   procedure Append (Object : in out Dynamic_Array; Value : Integer);
   function Get (Object : Dynamic_Array; Index : Natural) return Integer;

private
   type Integer_Array is array (Natural range <>) of Integer;
   procedure Initialize (Object : in out Dynamic_Array);
   procedure Finalize (Object : in out Dynamic_Array);
   procedure Adjust (Object : in out Dynamic_Array);
end Dynamic_Array;
```

Then implement the package body:

```ada
package body Dynamic_Array is

   procedure Initialize (Object : in out Dynamic_Array) is
   begin
      Object.Data := new Integer_Array(1..10);
      Object.Size := 0;
   end Initialize;

   procedure Finalize (Object : in out Dynamic_Array) is
   begin
      if Object.Data /= null then
         free(Object.Data);
      end if;
   end Finalize;

   procedure Adjust (Object : in out Dynamic_Array) is
   begin
      Object.Data := new Integer_Array(Object.Data.all);
   end Adjust;

   procedure Append (Object : in out Dynamic_Array; Value : Integer) is
   begin
      if Object.Size = Object.Data'Length then
         -- Grow the array
         declare
            New_Data : access Integer_Array := new Integer_Array(1..Object.Data'Length * 2);
         begin
            New_Data(1..Object.Data'Length) := Object.Data.all;
            New_Data(Object.Data'Length + 1) := Value;
            free(Object.Data);
            Object.Data := New_Data;
            Object.Size := Object.Size + 1;
         end;
      else
         Object.Data(Object.Size + 1) := Value;
         Object.Size := Object.Size + 1;
      end if;
   end Append;

   function Get (Object : Dynamic_Array; Index : Natural) return Integer is
   begin
      return Object.Data(Index);
   end Get;

end Dynamic_Array;
```

Now test it with a program:

```ada
with Dynamic_Array;
with Ada.Text_IO;

procedure Test_Dynamic_Array is
   use Ada.Text_IO;
   A : Dynamic_Array.Dynamic_Array;
begin
   for I in 1..15 loop
      A.Append(I);
   end loop;

   for I in 1..A.Size loop
      Put_Line(A.Get(I)'Image);
   end loop;
   -- Memory is automatically freed when A goes out of scope
end Test_Dynamic_Array;
```

This dynamic array automatically allocates and frees memory as needed, with no manual cleanup required.

## Next Steps: Mastering Ada's Memory Management

Now that you've learned the basics of Ada's memory management, you're ready to take your skills to the next level. Here are some next steps:

1. **Explore Ada's standard containers**: Ada provides powerful containers like vectors, lists, and maps that use controlled types under the hood. These containers automatically manage memory for you, so you can focus on your application logic.

2. **Learn about controlled types with access types**: You can combine controlled types with access types to create more complex resource management systems. For example, you could create a controlled type that manages a pool of resources.

3. **Try formal verification**: Ada's SPARK toolset allows you to formally verify your memory management code. This ensures that your code is free of memory leaks and other issues.

4. **Build a larger project**: Apply what you've learned to build a larger project, like a home automation system or a simple game. Use controlled types to manage resources like files, sensors, and game assets.

> **The Power of Controlled Types**
> 
> "Ada's controlled types transform memory management from a source of bugs into a reliable engineering tool. With controlled types, you don't have to worry about manual cleanup—you can focus on what your program does rather than how it manages resources."

Memory management is a fundamental part of programming, but with Ada, it's simple and safe. Whether you're building a simple calculator or a complex home automation system, Ada's controlled types ensure that your resources are always properly managed. This means your code is simpler, safer, and less prone to errors.

As you continue your Ada journey, remember that memory management isn't just for experts—it's a fundamental part of writing reliable code. With Ada's controlled types, you can write code that's both powerful and easy to understand, even as a beginner. So go forth and build—your memory-managed applications are waiting to be created!