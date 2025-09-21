# 9. Generics and Template Programming in Ada

> **Why Generics Matter**
> 
> "Generics are like templates for code - they let you write a single piece of code that works with many different types, without sacrificing type safety."
> 
> In Ada, generics are not just a convenience feature—they're a fundamental part of the language that enables you to build reusable, type-safe components that work with any data type. Unlike some languages where generics are an afterthought, Ada's generics are deeply integrated into the language, providing strong guarantees that your code will work correctly with whatever types you choose.

When you're starting out in programming, you might write code like this:

```ada
procedure Add_Integers (A, B : Integer; Result : out Integer) is
begin
   Result := A + B;
end Add_Integers;
```

This works great for integers, but what if you want to add floats? You'd need to write another procedure:

```ada
procedure Add_Floats (A, B : Float; Result : out Float) is
begin
   Result := A + B;
end Add_Floats;
```

And if you need to add doubles, or custom types? You'd end up with many nearly identical procedures. This is where generics come in—they let you write a single procedure that works with any numeric type:

```ada
generic
   type Number is digits <>;
procedure Add (A, B : Number; Result : out Number) is
begin
   Result := A + B;
end Add;
```

Now you can use this same procedure for integers, floats, or any other numeric type:

```ada
with Add;
procedure Test_Add is
   Int_Result : Integer;
   Float_Result : Float;
begin
   Add (1, 2, Int_Result);    -- Works for integers
   Add (1.5, 2.5, Float_Result); -- Works for floats
end Test_Add;
```

This is just the beginning of what Ada's generics can do. In this chapter, you'll learn how to create reusable components that work with any data type while maintaining strong type safety. You'll see how generics can simplify your code, reduce duplication, and make your programs more reliable.

## 1.1 Why Generics Are Important for Every Programmer

Generics are not just for experts—they're a fundamental tool that every programmer should know. Think about it: when you're building a program, how often do you find yourself writing nearly identical code for different data types? Maybe you have a sorting algorithm that works for integers, and another for strings, and another for custom objects. With generics, you write it once and use it for everything.

Here's why generics matter for everyday programming:

- **Less code duplication**: Write one implementation that works for many types
- **Type safety**: The compiler ensures your code works correctly with whatever types you choose
- **Easier maintenance**: Fix a bug in one place, and it's fixed for all types
- **More flexibility**: Your code can work with types you didn't even know about when you wrote it

Let's look at a real-world example. Imagine you're building a simple shopping list app. You might need to sort items by name, by price, or by date added. Without generics, you'd write separate sorting functions for each type:

```ada
-- Sort shopping items by name
procedure Sort_By_Name (Items : in out Item_Array) is
   -- Implementation
end Sort_By_Name;

-- Sort shopping items by price
procedure Sort_By_Price (Items : in out Item_Array) is
   -- Implementation
end Sort_By_Price;
```

With generics, you can write a single sorting function that works with any comparison function:

```ada
generic
   type Item is private;
   with function "<" (Left, Right : Item) return Boolean;
procedure Sort (Items : in out Item_Array);
```

Now you can sort by name, price, or any other property without duplicating code:

```ada
-- Sort by name
package Name_Sort is new Sort (Item => Shopping_Item, "<" => Compare_By_Name);

-- Sort by price
package Price_Sort is new Sort (Item => Shopping_Item, "<" => Compare_By_Price);
```

This is the power of generics—they let you write code once and use it in many different ways.

## 1.2 Basic Syntax of Ada Generics

Ada's generics use a simple but powerful syntax that makes it easy to create reusable components. Let's break down the basic structure.

### 1.2.1 Generic Package Declaration

A generic package starts with the `generic` keyword, followed by formal parameters:

```ada
generic
   -- Formal parameters go here
package Package_Name is
   -- Public declarations
end Package_Name;
```

For example, a simple generic stack:

```ada
generic
   type Element is private;
package Generic_Stack is
   procedure Push (X : in Element);
   procedure Pop (X : out Element);
   function Is_Empty return Boolean;
end Generic_Stack;
```

### 1.2.2 Generic Subprogram Declaration

A generic subprogram works similarly:

```ada
generic
   -- Formal parameters go here
procedure Procedure_Name;
```

For example, a generic swap procedure:

```ada
generic
   type T is private;
procedure Swap (A, B : in out T);
```

### 1.2.3 Instantiation

To use a generic component, you instantiate it with actual parameters:

```ada
package Instance_Name is new Generic_Name (Actual_Parameters);
```

For example, instantiating the stack for integers:

```ada
package Int_Stack is new Generic_Stack (Element => Integer);
```

Or for strings:

```ada
package String_Stack is new Generic_Stack (Element => String);
```

### 1.2.4 Key Syntax Notes

- **`generic` keyword**: Marks the beginning of generic specifications
- **Formal parameters**: Placeholders for types, subprograms, or values
- **Actual parameters**: The real types or values used when instantiating
- **`is new`**: Used when creating an instance of a generic component
- **`with` clause**: Required for generic subprograms to specify dependencies

### 1.2.5 Complete Example: Generic Calculator

Let's create a complete example of a generic calculator:

```ada
generic
   type Number is digits <>;
package Generic_Calculator is
   function Add (A, B : Number) return Number;
   function Subtract (A, B : Number) return Number;
   function Multiply (A, B : Number) return Number;
   function Divide (A, B : Number) return Number;
end Generic_Calculator;

package body Generic_Calculator is
   function Add (A, B : Number) return Number is
   begin
      return A + B;
   end Add;

   function Subtract (A, B : Number) return Number is
   begin
      return A - B;
   end Subtract;

   function Multiply (A, B : Number) return Number is
   begin
      return A * B;
   end Multiply;

   function Divide (A, B : Number) return Number is
   begin
      return A / B;
   end Divide;
end Generic_Calculator;
```

Now we can use this calculator for different numeric types:

```ada
with Generic_Calculator;
procedure Test_Calculator is
   package Float_Calc is new Generic_Calculator (Float);
   package Integer_Calc is new Generic_Calculator (Integer);
   
   F1, F2, F3 : Float;
   I1, I2, I3 : Integer;
begin
   F1 := 1.5;
   F2 := 2.5;
   F3 := Float_Calc.Add(F1, F2);
   Put_Line("Float result: " & F3'Image);
   
   I1 := 3;
   I2 := 4;
   I3 := Integer_Calc.Add(I1, I2);
   Put_Line("Integer result: " & I3'Image);
end Test_Calculator;
```

This program will output:

```
Float result:  4.00000E+00
Integer result: 7
```

Notice how the same generic calculator works for both floating-point and integer types without any changes to the implementation.

## 1.3 Formal Parameters: The Building Blocks of Generics

Ada's generics support several types of formal parameters, each serving a specific purpose.

### 1.3.1 Type Parameters

Type parameters are the most common type of formal parameter. They let you specify a placeholder for a type that will be provided when the generic is instantiated.

```ada
generic
   type T is private;
```

This declares a formal type parameter `T` that can be any private type (a type with no visible implementation details).

You can also specify more constraints on type parameters:

```ada
generic
   type T is digits <>;  -- Any floating-point type
   type U is range <>;   -- Any integer type
   type V is array (Integer range <>) of Character;  -- Any string type
```

For example, a generic array sorting procedure:

```ada
generic
   type Element is private;
   with function "<" (Left, Right : Element) return Boolean;
   type Index is range <>;
   type Array_Type is array (Index range <>) of Element;
procedure Sort (A : in out Array_Type);
```

This procedure can sort arrays of any type that supports comparison.

### 1.3.2 Subprogram Parameters

Subprogram parameters let you pass functions or procedures as parameters to your generic component.

```ada
generic
   with function Compare (A, B : T) return Boolean;
```

For example, in a generic search function:

```ada
generic
   type Element is private;
   with function Find_Match (Item : Element) return Boolean;
procedure Search (Items : in out Array_Type);
```

This allows you to search for items that match a specific condition.

### 1.3.3 Object Parameters

Object parameters let you pass values as parameters to your generic component.

```ada
generic
   Default_Value : Integer;
```

For example, a generic counter with a default starting value:

```ada
generic
   Default_Value : Integer;
package Counter is
   procedure Reset;
   function Get_Value return Integer;
   procedure Increment;
end Counter;
```

### 1.3.4 Package Parameters

Package parameters let you pass entire packages as parameters.

```ada
generic
   package Math_Package is new Math (<>);
```

For example, a generic trigonometry calculator that works with different numeric types:

```ada
generic
   package Float_Package is new Float_Trigonometry (<>);
package Trig_Calculator is
   function Sin (X : Float) return Float;
end Trig_Calculator;
```

### 1.3.5 Formal Parameters Comparison

| Parameter Type | Syntax | Best For |
| :--- | :--- | :--- |
| **Type Parameter** | `type T is private` | When you need to work with any data type |
| **Subprogram Parameter** | `with function Compare (A, B : T) return Boolean` | When you need custom behavior for different types |
| **Object Parameter** | `Default_Value : Integer` | When you need to configure behavior with a value |
| **Package Parameter** | `package Math_Package is new Math (<>);` | When you need to use an entire package's functionality |

## 1.4 Instantiation: Using Your Generic Components

Once you've created a generic component, you need to instantiate it with actual parameters to use it in your program.

### 1.4.1 Basic Instantiation

The simplest way to instantiate a generic is with positional parameters:

```ada
package Int_Stack is new Generic_Stack (Integer);
```

Or with named parameters:

```ada
package Int_Stack is new Generic_Stack (Element => Integer);
```

Named parameters are often clearer, especially when there are multiple parameters.

### 1.4.2 Instantiation with Constraints

When you need to specify constraints on types:

```ada
generic
   type T is range <>;
package Generic_Range is
   function Min return T;
   function Max return T;
end Generic_Range;

package Int_Range is new Generic_Range (T => Integer);
package Byte_Range is new Generic_Range (T => Natural range 0..255);
```

### 1.4.3 Instantiation with Subprograms

When you need to provide a subprogram parameter:

```ada
generic
   type Element is private;
   with function "<" (Left, Right : Element) return Boolean;
package Generic_Sort is
   procedure Sort (A : in out Array_Type);
end Generic_Sort;

-- Define comparison function
function Compare_By_Name (A, B : Shopping_Item) return Boolean is
begin
   return A.Name < B.Name;
end Compare_By_Name;

-- Instantiate with named parameters
package Name_Sort is new Generic_Sort (Element => Shopping_Item, "<" => Compare_By_Name);
```

### 1.4.4 Instantiation with Packages

When you need to pass a package as a parameter:

```ada
generic
   package Math_Package is new Math (<>);
package Trig_Calculator is
   function Sin (X : Float) return Float;
end Trig_Calculator;

-- Create a math package for Float
package Float_Math is new Math (Float);

-- Instantiate with named parameters
package Float_Trig is new Trig_Calculator (Math_Package => Float_Math);
```

### 1.4.5 Instantiation Best Practices

- **Use named parameters**: They make your code more readable and less error-prone
- **Group related instantiations**: Put related generic instantiations in the same package
- **Avoid unnecessary complexity**: Only specify what you need
- **Document your instantiations**: Explain why you chose specific parameters

## 1.5 Constraints on Generic Parameters

One of Ada's most powerful features is the ability to constrain generic parameters, ensuring that only types that meet specific requirements can be used.

### 1.5.1 Numeric Constraints

For numeric types, you can specify different constraints:

```ada
generic
   type T is digits <>;  -- Floating-point types
   type U is range <>;   -- Integer types
   type V is delta <>;   -- Fixed-point types
```

For example, a generic calculator that only works with floating-point types:

```ada
generic
   type Number is digits <>;
package Generic_Floating_Calculator is
   function Add (A, B : Number) return Number;
end Generic_Floating_Calculator;
```

This can only be instantiated with floating-point types like `Float`, `Long_Float`, or `Decimal`.

### 1.5.2 Array Constraints

For array types, you can specify constraints on the index and element types:

```ada
generic
   type Index is range <>;
   type Element is private;
   type Array_Type is array (Index range <>) of Element;
```

For example, a generic array processing procedure:

```ada
generic
   type Index is range <>;
   type Element is private;
   type Array_Type is array (Index range <>) of Element;
   with procedure Process (E : in out Element);
procedure Process_Array (A : in out Array_Type);
```

This procedure can process arrays of any index type and element type, as long as they support the `Process` procedure.

### 1.5.3 Subprogram Constraints

For subprogram parameters, you can specify the exact signature:

```ada
generic
   with function Compare (Left, Right : T) return Boolean;
```

For example, a generic search function:

```ada
generic
   type Element is private;
   with function Find_Match (Item : Element) return Boolean;
procedure Search (Items : in out Array_Type);
```

This ensures that the `Find_Match` function has the correct signature for the element type.

### 1.5.4 Constraint Comparison

| Constraint Type | Syntax | Example |
| :--- | :--- | :--- |
| **Numeric** | `type T is digits <>` | `Float`, `Long_Float`, `Decimal` |
| **Range** | `type T is range <>` | `Integer`, `Natural`, `Positive` |
| **Array** | `type Array_Type is array (Index range <>) of Element` | `String`, `Integer_Array` |
| **Subprogram** | `with function Compare (Left, Right : T) return Boolean` | `"<"`, `">="`, custom comparison |

## 1.6 Private Types in Generics

Ada's generics work seamlessly with private types, allowing you to create reusable components that hide implementation details.

### 1.6.1 Generic Package with Private Types

```ada
generic
   type Element is private;
package Generic_Stack is
   procedure Push (X : in Element);
   procedure Pop (X : out Element);
   function Is_Empty return Boolean;
private
   -- Implementation details hidden from clients
   type Stack_Array is array (Positive range <>) of Element;
   type Stack_Type is record
      Data : Stack_Array (1..100);
      Top  : Natural := 0;
   end record;
   Stack : Stack_Type;
end Generic_Stack;
```

The client only sees the public interface, not the implementation details:

```ada
with Generic_Stack;
procedure Test_Stack is
   package Int_Stack is new Generic_Stack (Element => Integer);
   Value : Integer;
begin
   Int_Stack.Push(42);
   Int_Stack.Pop(Value);
   Put_Line("Popped: " & Value'Image);
end Test_Stack;
```

The client doesn't need to know that the stack is implemented as an array—it only needs to know how to use the interface.

### 1.6.2 Generic Package with Limited Private Types

For types that shouldn't be copied:

```ada
generic
   type Element is limited private;
package Generic_Resource is
   procedure Acquire (Resource : out Element);
   procedure Release (Resource : in out Element);
private
   -- Implementation details
end Generic_Resource;
```

This ensures that the resource type can't be copied, which is important for things like file handles or hardware devices.

### 1.6.3 Private Type Constraints

You can also constrain private types:

```ada
generic
   type T is private with Default_Value => 0;
package Generic_Counter is
   procedure Reset;
   function Get_Value return T;
   procedure Increment;
end Generic_Counter;
```

This ensures that the type has a default value of 0, which is useful for counters.

## 1.7 Generic Inheritance and Composition

Ada's generics support both inheritance and composition patterns, allowing you to build complex systems from reusable components.

### 1.7.1 Generic Inheritance

You can create generic types that inherit from other generic types:

```ada
generic
   type Base_Element is private;
package Generic_Base is
   -- Base functionality
end Generic_Base;

generic
   type Derived_Element is private;
   with package Base_Package is new Generic_Base (Base_Element);
package Generic_Derived is
   -- Derived functionality
end Generic_Derived;
```

This allows you to build a hierarchy of generic types.

### 1.7.2 Generic Composition

You can also compose generic components together:

```ada
generic
   type Element is private;
package Generic_Stack is
   -- Stack implementation
end Generic_Stack;

generic
   type Element is private;
package Generic_Counter is
   -- Counter implementation
end Generic_Counter;

generic
   type Element is private;
package Generic_Counter_Stack is
   Stack : Generic_Stack (Element);
   Counter : Generic_Counter (Element);
   -- Combined functionality
end Generic_Counter_Stack;
```

This allows you to build complex components by combining simpler ones.

### 1.7.3 Generic Inheritance vs Composition

| Pattern | When to Use | Benefits |
| :--- | :--- | :--- |
| **Generic Inheritance** | When you need to extend existing generic functionality | Creates a clear hierarchy of related types |
| **Generic Composition** | When you need to combine multiple generic components | Creates flexible, reusable components from smaller parts |

## 1.8 Practical Examples: Building Reusable Components

Let's look at some practical examples of generics that you can use in everyday programming.

### 1.8.1 Generic Stack Implementation

```ada
generic
   type Element is private;
package Generic_Stack is
   procedure Push (X : in Element);
   procedure Pop (X : out Element);
   function Is_Empty return Boolean;
   function Is_Full return Boolean;
   procedure Clear;
private
   type Stack_Array is array (Positive range <>) of Element;
   type Stack_Type is record
      Data : Stack_Array (1..100);
      Top  : Natural := 0;
   end record;
   Stack : Stack_Type;
end Generic_Stack;

package body Generic_Stack is
   procedure Push (X : in Element) is
   begin
      if Is_Full then
         raise Stack_Overflow;
      else
         Stack.Top := Stack.Top + 1;
         Stack.Data(Stack.Top) := X;
      end if;
   end Push;

   procedure Pop (X : out Element) is
   begin
      if Is_Empty then
         raise Stack_Underflow;
      else
         X := Stack.Data(Stack.Top);
         Stack.Top := Stack.Top - 1;
      end if;
   end Pop;

   function Is_Empty return Boolean is
   begin
      return Stack.Top = 0;
   end Is_Empty;

   function Is_Full return Boolean is
   begin
      return Stack.Top = Stack.Data'Length;
   end Is_Full;

   procedure Clear is
   begin
      Stack.Top := 0;
   end Clear;
end Generic_Stack;
```

Now you can use this stack for any type:

```ada
with Generic_Stack;
procedure Test_Stack is
   package Int_Stack is new Generic_Stack (Element => Integer);
   package String_Stack is new Generic_Stack (Element => String);
   Value : Integer;
   Text : String;
begin
   Int_Stack.Push(42);
   Int_Stack.Push(100);
   Int_Stack.Pop(Value);
   Put_Line("Popped: " & Value'Image);
   
   String_Stack.Push("Hello");
   String_Stack.Push("World");
   String_Stack.Pop(Text);
   Put_Line("Popped: " & Text);
end Test_Stack;
```

### 1.8.2 Generic Sorting Algorithm

```ada
generic
   type Element is private;
   with function "<" (Left, Right : Element) return Boolean;
   type Index is range <>;
   type Array_Type is array (Index range <>) of Element;
procedure Generic_Sort (A : in out Array_Type);

package body Generic_Sort is
   procedure Sort (A : in out Array_Type) is
      Temp : Element;
      I, J : Index;
   begin
      for I in A'First .. A'Last - 1 loop
         for J in I + 1 .. A'Last loop
            if A(J) < A(I) then
               Temp := A(I);
               A(I) := A(J);
               A(J) := Temp;
            end if;
         end loop;
      end loop;
   end Sort;
end Generic_Sort;
```

Now you can sort arrays of any type that supports comparison:

```ada
with Generic_Sort;
procedure Test_Sort is
   type Int_Array is array (1..10) of Integer;
   type String_Array is array (1..5) of String (1..20);
   
   package Int_Sort is new Generic_Sort (Integer, "<", Positive, Int_Array);
   package String_Sort is new Generic_Sort (String, "<", Positive, String_Array);
   
   I_Array : Int_Array := (5, 3, 8, 1, 9, 2, 7, 4, 6, 10);
   S_Array : String_Array := ("Apple", "Banana", "Cherry", "Date", "Elderberry");
begin
   Int_Sort.Sort(I_Array);
   for I in I_Array'Range loop
      Put(I_Array(I)'Image & " ");
   end loop;
   New_Line;
   
   String_Sort.Sort(S_Array);
   for S in S_Array'Range loop
      Put(S_Array(S) & " ");
   end loop;
   New_Line;
end Test_Sort;
```

This will output:

```
1 2 3 4 5 6 7 8 9 10 
Apple Banana Cherry Date Elderberry 
```

### 1.8.3 Generic Calculator with Constraints

```ada
generic
   type Number is digits <>;
package Generic_Calculator is
   function Add (A, B : Number) return Number;
   function Subtract (A, B : Number) return Number;
   function Multiply (A, B : Number) return Number;
   function Divide (A, B : Number) return Number;
   function Power (A : Number; B : Natural) return Number;
end Generic_Calculator;

package body Generic_Calculator is
   function Add (A, B : Number) return Number is
   begin
      return A + B;
   end Add;

   function Subtract (A, B : Number) return Number is
   begin
      return A - B;
   end Subtract;

   function Multiply (A, B : Number) return Number is
   begin
      return A * B;
   end Multiply;

   function Divide (A, B : Number) return Number is
   begin
      return A / B;
   end Divide;

   function Power (A : Number; B : Natural) return Number is
      Result : Number := 1.0;
   begin
      for I in 1..B loop
         Result := Result * A;
      end loop;
      return Result;
   end Power;
end Generic_Calculator;
```

Now you can use this calculator for different numeric types:

```ada
with Generic_Calculator;
procedure Test_Calculator is
   package Float_Calc is new Generic_Calculator (Float);
   package Integer_Calc is new Generic_Calculator (Integer);
   Float_Result : Float;
   Integer_Result : Integer;
begin
   Float_Result := Float_Calc.Power(2.0, 3);
   Put_Line("2^3 = " & Float_Result'Image);
   
   Integer_Result := Integer_Calc.Power(2, 5);
   Put_Line("2^5 = " & Integer_Result'Image);
end Test_Calculator;
```

This will output:

```
2^3 =  8.00000E+00
2^5 = 32
```

## 1.9 Ada Generics vs C++ Templates: A Comparison

Many programmers are familiar with C++ templates, so it's helpful to understand how Ada generics compare.

| Feature | Ada Generics | C++ Templates |
| :--- | :--- | :--- |
| **Syntax** | `generic` keyword followed by formal parameters | `template <...>` syntax |
| **Type Safety** | Strong, enforced at compile time | Weaker, depends on usage |
| **Instantiation** | Explicit with `is new` | Implicit based on usage |
| **Error Messages** | Clear, specific errors | Often cryptic and hard to understand |
| **Code Generation** | One instance per actual type | One instance per actual type |
| **Constraints** | Explicit constraints on formal parameters | Constraints via SFINAE or concepts (C++20) |
| **Private Types** | Fully supported with hidden implementation | Supported but more complex |
| **Default Parameters** | Supported | Supported |
| **Compile Time** | Faster due to simpler model | Slower due to complex template system |

### 1.9.1 Key Differences

- **Explicit vs Implicit Instantiation**: In Ada, you explicitly instantiate generics with `is new`. In C++, templates are instantiated implicitly based on usage. This makes Ada's generics easier to understand and debug.
- **Stronger Type Safety**: Ada's generics have stronger type safety guarantees. If you try to use a type that doesn't meet the requirements, the compiler will give you a clear error message.
- **Better Error Messages**: Ada's error messages for generics are usually much clearer than C++'s, which can be notoriously cryptic.
- **Simpler Model**: Ada's generics are simpler and more predictable than C++ templates, making them easier to learn and use correctly.

Let's look at a simple example to see the difference:

```ada
-- Ada generic
generic
   type T is private;
procedure Swap (A, B : in out T);

-- Instantiation
package Int_Swap is new Swap (Integer);
```

In C++, the equivalent would be:

```cpp
// C++ template
template <typename T>
void swap(T& a, T& b) {
   T temp = a;
   a = b;
   b = temp;
}

// Instantiation (implicit)
int a = 1, b = 2;
swap(a, b);
```

In Ada, the instantiation is explicit, which makes it clear what's happening. In C++, the template is instantiated implicitly based on usage, which can make it harder to understand exactly what's happening behind the scenes.

## 1.10 Best Practices for Using Generics

Here are some best practices to help you use generics effectively:

### 1.10.1 \. Use Named Parameters

Named parameters make your code more readable and less error-prone:

```ada
-- Good
package Int_Stack is new Generic_Stack (Element => Integer);

-- Bad
package Int_Stack is new Generic_Stack (Integer);
```

### 1.10.2 \. Keep Generics Simple

Start with simple generics and build up complexity gradually:

```ada
-- Simple
generic
   type T is private;
package Simple_Generic is
   procedure Do_Something (X : T);
end Simple_Generic;

-- Complex
generic
   type T is private;
   with function Compare (A, B : T) return Boolean;
   with procedure Process (X : T);
package Complex_Generic is
   -- ...
end Complex_Generic;
```

### 1.10.3 \. Document Your Generics

Add comments to explain what your generic does and what constraints it has:

```ada
generic
   type T is private;
   -- Must support equality comparison
   with function "=" (Left, Right : T) return Boolean;
package Equality_Checker is
   -- Checks if two values are equal
   function Is_Equal (A, B : T) return Boolean;
end Equality_Checker;
```

### 1.10.4 \. Use Constraints to Ensure Correct Usage

Add constraints to make sure only appropriate types are used:

```ada
generic
   type T is digits <>;
   -- Only floating-point types allowed
package Float_Calculator is
   function Square_Root (X : T) return T;
end Float_Calculator;
```

### 1.10.5 \. Test Your Generics

Test your generic components with different types to ensure they work correctly:

```ada
with Generic_Stack;
procedure Test_Generic_Stack is
   package Int_Stack is new Generic_Stack (Element => Integer);
   package String_Stack is new Generic_Stack (Element => String);
   -- Test both instantiations
begin
   -- Test integer stack
   Int_Stack.Push(42);
   Int_Stack.Push(100);
   -- ...
   
   -- Test string stack
   String_Stack.Push("Hello");
   String_Stack.Push("World");
   -- ...
end Test_Generic_Stack;
```

### 1.10.6 \. Avoid Over-Engineering

Don't make your generics more complex than they need to be:

```ada
-- Simple and effective
generic
   type T is private;
package Simple_Generic is
   procedure Do_Something (X : T);
end Simple_Generic;

-- Overly complex
generic
   type T is private;
   with function Compare (A, B : T) return Boolean;
   with procedure Process (X : T);
   with function Get_Value (X : T) return Integer;
   with procedure Set_Value (X : in out T; Value : Integer);
package Overly_Complex_Generic is
   -- ...
end Overly_Complex_Generic;
```

## 1.11 Real-World Applications of Generics

Let's look at some real-world applications of generics that you might encounter in everyday programming.

### 1.11.1 Data Structures

Generics are perfect for creating reusable data structures like stacks, queues, and linked lists:

```ada
generic
   type Element is private;
package Generic_Queue is
   procedure Enqueue (X : in Element);
   procedure Dequeue (X : out Element);
   function Is_Empty return Boolean;
end Generic_Queue;
```

Now you can create queues for any type:

```ada
with Generic_Queue;
procedure Test_Queue is
   package Int_Queue is new Generic_Queue (Element => Integer);
   package String_Queue is new Generic_Queue (Element => String);
   Value : Integer;
   Text : String;
begin
   Int_Queue.Enqueue(42);
   Int_Queue.Dequeue(Value);
   
   String_Queue.Enqueue("Hello");
   String_Queue.Dequeue(Text);
end Test_Queue;
```

### 1.11.2 Algorithms

Generics are perfect for creating reusable algorithms like sorting, searching, and filtering:

```ada
generic
   type Element is private;
   with function "<" (Left, Right : Element) return Boolean;
   type Index is range <>;
   type Array_Type is array (Index range <>) of Element;
procedure Generic_Sort (A : in out Array_Type);
```

Now you can sort arrays of any type that supports comparison:

```ada
with Generic_Sort;
procedure Test_Sort is
   type Int_Array is array (1..10) of Integer;
   type String_Array is array (1..5) of String (1..20);
   
   package Int_Sort is new Generic_Sort (Integer, "<", Positive, Int_Array);
   package String_Sort is new Generic_Sort (String, "<", Positive, String_Array);
   
   I_Array : Int_Array := (5, 3, 8, 1, 9, 2, 7, 4, 6, 10);
   S_Array : String_Array := ("Apple", "Banana", "Cherry", "Date", "Elderberry");
begin
   Int_Sort.Sort(I_Array);
   String_Sort.Sort(S_Array);
end Test_Sort;
```

### 1.11.3 Utility Functions

Generics are perfect for creating reusable utility functions like math operations or string processing:

```ada
generic
   type Number is digits <>;
package Generic_Math is
   function Square (X : Number) return Number;
   function Cube (X : Number) return Number;
   function Power (X : Number; Y : Natural) return Number;
end Generic_Math;
```

Now you can use these math functions for any numeric type:

```ada
with Generic_Math;
procedure Test_Math is
   package Float_Math is new Generic_Math (Float);
   package Integer_Math is new Generic_Math (Integer);
   Float_Result : Float;
   Integer_Result : Integer;
begin
   Float_Result := Float_Math.Square(2.5);
   Integer_Result := Integer_Math.Cube(3);
end Test_Math;
```

### 1.11.4 Real-World Example: Shopping List App

Let's build a complete shopping list app using generics:

```ada
-- Item type
type Shopping_Item is record
   Name : String (1..50);
   Price : Float;
   Quantity : Natural;
end record;

-- Generic sorting for shopping items
generic
   type Item is private;
   with function Compare (A, B : Item) return Boolean;
   type Index is range <>;
   type Array_Type is array (Index range <>) of Item;
procedure Generic_Sort (A : in out Array_Type);

-- Generic stack for shopping items
generic
   type Item is private;
package Generic_Stack is
   procedure Push (X : in Item);
   procedure Pop (X : out Item);
   function Is_Empty return Boolean;
end Generic_Stack;

-- Main program
with Generic_Sort;
with Generic_Stack;
procedure Shopping_List is
   -- Define comparison functions
   function Compare_By_Name (A, B : Shopping_Item) return Boolean is
   begin
      return A.Name < B.Name;
   end Compare_By_Name;
   
   function Compare_By_Price (A, B : Shopping_Item) return Boolean is
   begin
      return A.Price < B.Price;
   end Compare_By_Price;
   
   -- Instantiate generics
   package Name_Sort is new Generic_Sort (Shopping_Item, Compare_By_Name, Positive, Shopping_Item_Array);
   package Price_Sort is new Generic_Sort (Shopping_Item, Compare_By_Price, Positive, Shopping_Item_Array);
   package Item_Stack is new Generic_Stack (Shopping_Item);
   
   -- Shopping list
   Items : Shopping_Item_Array := (/* items */);
begin
   -- Sort by name
   Name_Sort.Sort(Items);
   
   -- Sort by price
   Price_Sort.Sort(Items);
   
   -- Use stack for undo functionality
   Item_Stack.Push(Current_Item);
   Item_Stack.Pop(Previous_Item);
end Shopping_List;
```

This example shows how generics can simplify complex applications by providing reusable components for sorting, stacking, and other common tasks.

## 1.12 Common Mistakes and How to Avoid Them

### 1.12.1 Mistake: Forgetting to Specify Constraints

```ada
-- Bad
generic
   type T is private;
package Generic_Calculator is
   function Add (A, B : T) return T;
end Generic_Calculator;

-- This will fail if T doesn't support addition
```

#### 1.12.1.1 Solution: Add Constraints

```ada
-- Good
generic
   type T is digits <>;
package Generic_Calculator is
   function Add (A, B : T) return T;
end Generic_Calculator;
```

### 1.12.2 Mistake: Using Too Many Parameters

```ada
-- Bad
generic
   type T is private;
   with function Compare (A, B : T) return Boolean;
   with procedure Process (X : T);
   with function Get_Value (X : T) return Integer;
   with procedure Set_Value (X : in out T; Value : Integer);
package Overly_Complex_Generic is
   -- ...
end Overly_Complex_Generic;
```

#### 1.12.2.1 Solution: Keep It Simple

```ada
-- Good
generic
   type T is private;
package Simple_Generic is
   procedure Do_Something (X : T);
end Simple_Generic;
```

### 1.12.3 Mistake: Not Testing with Multiple Types

```ada
-- Bad
with Generic_Stack;
procedure Test_Stack is
   package Int_Stack is new Generic_Stack (Element => Integer);
   -- Only test with integers
begin
   Int_Stack.Push(42);
end Test_Stack;
```

#### 1.12.3.1 Solution: Test with Multiple Types

```ada
-- Good
with Generic_Stack;
procedure Test_Stack is
   package Int_Stack is new Generic_Stack (Element => Integer);
   package String_Stack is new Generic_Stack (Element => String);
   Value : Integer;
   Text : String;
begin
   Int_Stack.Push(42);
   String_Stack.Push("Hello");
   -- Test both instantiations
end Test_Stack;
```

## 1.13 Next Steps: Putting It All Together

Now that you've learned the basics of Ada generics, it's time to put it all together. Here are some ideas for what to try next:

### 1.13.1 \. Build Your Own Generic Data Structures

Create a generic linked list, binary tree, or hash table. Test it with different types to make sure it works correctly.

### 1.13.2 \. Create a Generic Math Library

Build a library of math functions that work with different numeric types. Include functions for square roots, powers, trigonometry, and more.

### 1.13.3 \. Develop a Generic Sorting Library

Create a library of sorting algorithms (bubble sort, quicksort, mergesort) that work with any comparable type.

### 1.13.4 \. Build a Generic File Processing System

Create a system that can read and write files of different types, using generics to handle the specific data types.

### 1.13.5 \. Create a Generic Game Component

Build a game component (like a character or item) that can work with different types of data, using generics to make it reusable.

Remember, the key to mastering generics is practice. Start with simple examples and gradually build up to more complex ones. Don't be afraid to experiment and try new things—generics are a powerful tool that can make your code simpler, cleaner, and more reusable.

## 1.14 Conclusion: The Power of Reusable Code

> **The Power of Generics**
> 
> "Generics are like building blocks for code—they let you create components that work with many different types, without sacrificing type safety or clarity."
> 
> In this chapter, you've learned how to use Ada's generics to create reusable, type-safe components. You've seen how generics can simplify your code, reduce duplication, and make your programs more reliable. Whether you're building a simple calculator, a shopping list app, or a complex data structure, generics give you the tools to write code that works with any type while maintaining strong type safety.

Ada's generics are not just for experts—they're a fundamental tool that every programmer should know. By using generics, you can write code once and use it in many different ways, saving time and reducing errors. You've learned how to create generic packages and subprograms, how to constrain generic parameters, and how to use generics with private types. You've seen how Ada's generics compare to C++ templates, and you've learned best practices for using generics effectively.

As you continue your programming journey, remember that generics are a powerful tool that can make your code simpler, cleaner, and more reusable. Whether you're building a home automation system, a game, or a data processing tool, generics will help you write better code. So go forth and create—your reusable components are waiting to be built!

