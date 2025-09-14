# 8. Object-Oriented Programming in Ada: Safe and Simple Polymorphism

> **OOP Safety Paradox**
> 
> **Traditional view:** "OOP introduces hidden control flow that's impossible to verify"
> 
> **Ada approach:** "OOP can be made predictable and verifiable through careful language design"
> 
> Ada demonstrates that polymorphism isn't the problem—it's how most languages implement it that creates risks. Ada's object-oriented features are designed to be simple, explicit, and verifiable, making them accessible to beginners while still powerful enough for complex applications.

Object-oriented programming (OOP) is a powerful way to organize code by grouping related data and behavior together. Many programming languages have OOP features, but Ada takes a unique approach that makes OOP safer and easier to understand. Unlike other languages where polymorphism happens automatically behind the scenes, Ada makes everything explicit and verifiable. This means you get the benefits of OOP without the hidden complexity that can lead to bugs.

In this chapter, you'll learn how to use Ada's object-oriented features for everyday programming tasks. You'll see how to create reusable components, model real-world objects, and build flexible systems—all with clear, predictable behavior. Whether you're building a simple game, a home automation system, or a data processing tool, Ada's OOP features will help you write better code.

## Why Ada's OOP Is Different

Most programming languages treat object-oriented programming as an all-or-nothing feature. In Java or C++, classes are the default way to structure code, and polymorphism happens automatically. This can be convenient, but it also makes it hard to understand exactly what's happening when your code runs.

Ada takes a different approach. Instead of forcing OOP on you, Ada gives you precise control over when and how you use it. You only get polymorphism when you explicitly ask for it. This makes your code more predictable and easier to understand—perfect for beginners who are just learning about OOP.

### Key Differences Between Ada and Other Languages

| Feature | Traditional OOP (Java/C++) | Ada's OOP |
| :--- | :--- | :--- |
| **Default behavior** | Polymorphism is implicit | Polymorphism is explicit (requires `tagged`) |
| **Class syntax** | Separate class definition | Record-based with `tagged` keyword |
| **Inheritance** | Single inheritance only | Multiple inheritance through interfaces |
| **Type safety** | Runtime checks only | Compile-time and runtime checks |
| **Verification** | Difficult to verify | Built-in support for formal verification |
| **Learning curve** | Hidden complexity | Explicit, understandable behavior |

Let's look at a simple example to see how Ada's approach works in practice.

### A Simple Example: Animals in a Zoo

Imagine you're building a zoo management system. In many languages, you might create a base class `Animal` and then derive specific types like `Lion` and `Elephant`:

```java
// Java example
class Animal {
    void makeSound() {
        System.out.println("Generic animal sound");
    }
}

class Lion extends Animal {
    @Override
    void makeSound() {
        System.out.println("Roar!");
    }
}
```

In Ada, you would do something similar but with explicit polymorphism:

```ada
type Animal is tagged record
   Name : String (1..50);
end record;

procedure Make_Sound (A : Animal) is
begin
   Put_Line ("Generic animal sound");
end Make_Sound;

type Lion is new Animal with null record;

procedure Make_Sound (L : Lion) is
begin
   Put_Line ("Roar!");
end Make_Sound;
```

Notice the differences:
- In Java, the `@Override` annotation makes it clear that the method is being overridden, but the polymorphism itself is implicit
- In Ada, you must explicitly define the `Make_Sound` procedure for each type
- Ada uses the `tagged` keyword to indicate that a type can be used polymorphically

This explicitness makes it easier to understand exactly how your code will behave. There are no hidden virtual calls or surprise behavior—everything is visible in the code.

## Tagged Types: The Foundation of Ada OOP

In Ada, all object-oriented features are built around **tagged types**. A tagged type is simply a record that has been marked with the `tagged` keyword. This tells Ada that this type can participate in polymorphic behavior.

### Basic Tagged Type Declaration

Let's create a simple tagged type for a sensor:

```ada
type Sensor is tagged record
   ID      : Natural;
   Status  : String (1..20);
   Value   : Float;
end record;
```

This creates a type called `Sensor` that has three fields: an ID, a status string, and a value. The `tagged` keyword is what makes this type polymorphic.

### Derived Types: Extending Existing Types

You can create new types based on existing tagged types using the `new` keyword:

```ada
type Temperature_Sensor is new Sensor with record
   Units   : String (1..10);
   Min_Val : Float;
   Max_Val : Float;
end record;

type Pressure_Sensor is new Sensor with record
   Min_Pressure : Float;
   Max_Pressure : Float;
end record;
```

Here, `Temperature_Sensor` and `Pressure_Sensor` are both derived from `Sensor`. They inherit all the fields from `Sensor` and add their own specific fields.

### Dispatching Operations: How Polymorphism Works

To make a procedure or function polymorphic, you need to define it for the base type. This is called a **dispatching operation**:

```ada
function Get_Value (S : Sensor) return Float is
begin
   return S.Value;
end Get_Value;

function Get_Value (T : Temperature_Sensor) return Float is
begin
   -- Convert to Celsius if needed
   if T.Units = "Fahrenheit" then
      return (T.Value - 32.0) * 5.0 / 9.0;
   else
      return T.Value;
   end if;
end Get_Value;
```

When you call `Get_Value` with a `Sensor'Class` parameter, Ada automatically chooses the right implementation based on the actual type:

```ada
procedure Process_Sensor (S : Sensor'Class) is
begin
   Put_Line ("Value: " & Get_Value(S)'Image);
end Process_Sensor;
```

The `Sensor'Class` type is special—it means "any type derived from `Sensor`." This is how Ada achieves polymorphism: by allowing you to work with objects through their base type while still using the correct implementation for each specific type.

### Why This Matters for Beginners

This explicit approach has several advantages for beginners:
- **No hidden behavior**: You can see exactly which implementation will be called
- **No surprises**: There are no virtual tables or hidden dispatch mechanisms
- **Clearer code**: The polymorphism is visible in the code, not hidden in compiler magic
- **Easier debugging**: When something goes wrong, you can see exactly where it's happening

Let's see a complete example with a simple zoo management system:

```ada
with Ada.Text_IO; use Ada.Text_IO;

type Animal is tagged record
   Name : String (1..50);
end record;

procedure Make_Sound (A : Animal) is
begin
   Put_Line ("Generic animal sound");
end Make_Sound;

type Lion is new Animal with null record;

procedure Make_Sound (L : Lion) is
begin
   Put_Line ("Roar!");
end Make_Sound;

type Elephant is new Animal with null record;

procedure Make_Sound (E : Elephant) is
begin
   Put_Line ("Trumpet!");
end Make_Sound;

procedure Process_Animal (A : Animal'Class) is
begin
   Put_Line ("Processing " & A.Name);
   Make_Sound(A);
end Process_Animal;

procedure Zoo_Manager is
   My_Lion    : Lion    := (Name => "Simba", others => <>);
   My_Elephant : Elephant := (Name => "Dumbo", others => <>);
begin
   Process_Animal(My_Lion);
   Process_Animal(My_Elephant);
end Zoo_Manager;
```

When you run this program, it will output:

```
Processing Simba
Roar!
Processing Dumbo
Trumpet!
```

Notice how the `Process_Animal` procedure works with any animal type, but calls the correct `Make_Sound` implementation for each one. This is polymorphism in action—without any hidden complexity.

## Advanced Dispatching Operations

Ada provides several advanced features for controlling how polymorphic behavior works. These features are designed to make your code more predictable and verifiable.

### Dispatching on Multiple Parameters

In most languages, polymorphism only happens based on the type of the object (the `this` parameter). In Ada, you can have polymorphism based on multiple parameters:

```ada
function Process_Command (
   S : Sensor'Class;
   C : Command'Class) return Response is
   pragma Dispatching_Policy (Prefer_Highest);
begin
   -- Implementation
   return Response;
end Process_Command;
```

This function will dispatch based on both the sensor type and the command type. This is useful when you need to handle different combinations of inputs in different ways.

### Dispatching Policy Control

Ada lets you control how dispatching happens:

```ada
-- At program unit level
pragma Dispatching_Policy (EDF); -- Earliest Deadline First

-- For specific operations
function Process_Alarm (
   A : Alarm'Class;
   H : Handler'Class) return Response is
   pragma Dispatching_Policy (FIFO_Within_Priorities);
begin
   -- Implementation
end Process_Alarm;
```

These policies make dispatching behavior predictable and verifiable—essential for safety-critical systems, but also helpful for understanding how your code works.

### Dispatching with Contracts

One of Ada's most powerful features is combining polymorphism with Design by Contract:

```ada
function Validate (S : Sensor; Value : Float) return Boolean with
   Pre  => Value'Valid,
   Post => Validate'Result = (Value in S.Min_Value..S.Max_Value);

function Validate (
   T : Temperature_Sensor;
   Value : Float) return Boolean with
   Pre  => Value'Valid and T.Units = Celsius,
   Post => Validate'Result = (Value in T.Min_Val..T.Max_Val);
```

Here, the `Validate` function for `Temperature_Sensor` refines the contract of the base version. Ada ensures that derived types follow the Liskov substitution principle—meaning a derived type can always be used where the base type is expected.

## Interface Types and Controlled Inheritance

Ada provides sophisticated mechanisms for interface-based programming and controlled inheritance—avoiding many traditional OOP pitfalls.

### Abstract Types and Interface Types

#### Abstract Tagged Types

```ada
type Sensor is abstract tagged record
   ID     : Natural;
   Status : String (1..20);
end record;

function Get_Value (S : Sensor) return Float is abstract;

type Temperature_Sensor is new Sensor with record
   Units : String (1..10);
end record;

function Get_Value (T : Temperature_Sensor) return Float is
begin
   return T.Value;
end Get_Value;
```

This ensures that all derived types implement required operations. If you forget to implement `Get_Value` for `Temperature_Sensor`, the compiler will give you an error.

#### Interface Types (Multiple Inheritance)

```ada
type Measurable is interface;
function Get_Value (M : Measurable) return Float is abstract;

type Calibratable is interface;
procedure Calibrate (C : in out Calibratable) is abstract;

type Sensor is abstract new Measurable and Calibratable with null record;

type Temperature_Sensor is new Sensor with record
   Units : String (1..10);
end record;

function Get_Value (T : Temperature_Sensor) return Float is
begin
   return T.Value;
end Get_Value;

procedure Calibrate (T : in out Temperature_Sensor) is
begin
   -- Calibration code
end Calibrate;
```

This enables safe multiple inheritance through interface types. You can have a type that implements multiple interfaces without the complications of traditional multiple inheritance.

### Interface-Based Design Benefits

| Benefit | Real-World Example |
| :--- | :--- |
| Decouples specification from implementation | A game where different character types all implement the same interface |
| Enables true polymorphism without inheritance | A home automation system where different sensors all provide the same interface |
| Supports multiple inheritance safely | A medical device where sensors need to implement both measurement and calibration interfaces |
| Reduces coupling between components | A web application where different data sources all implement the same interface |
| Improves testability through interface mocking | A unit test that uses a mock sensor instead of a real one |

## Controlled Inheritance Patterns

Ada provides mechanisms to control inheritance for safety and simplicity.

### 1. Sealed Types

Prevent further derivation of a type:

```ada
type Final_Sensor is new Sensor with private;
pragma Final_Type(Final_Sensor);

package body Final_Sensor is
   -- Implementation
   -- Cannot be further derived
end Final_Sensor;
```

This is useful for types where additional derivation could compromise safety or simplicity.

### 2. Limited Private Types

Control access to type internals:

```ada
package Sensors is
   type Sensor is abstract tagged limited private;

   function Get_ID (S : Sensor) return Natural;
   procedure Set_Status (S : in out Sensor; Status : String);

private
   type Sensor is abstract tagged record
      ID     : Natural;
      Status : String (1..20);
   end record;
end Sensors;
```

This prevents unsafe modifications from outside the package.

### 3. Controlled Extension

Limit what can be added in derived types:

```ada
type Base_Type is tagged record
   -- ...
end record;

type Extension_Point is tagged private;

type Derived_Type is new Base_Type and Extension_Point with record
   -- Additional components
end record;

private
type Extension_Point is tagged record
   Safety_Flags : Safety_Masks;
end record;
```

This ensures derived types maintain safety properties.

## Safety-Critical OOP Patterns

Let's look at some common OOP patterns that work well in Ada.

### 1. State Pattern for State Machines

```ada
type System_State is abstract tagged null record;
procedure Handle_Event (
   S : in out System_State;
   E : Event_Type) is abstract;

type Idle_State is new System_State with null record;
procedure Handle_Event (
   S : in out Idle_State;
   E : Event_Type) is
begin
   case E is
      when Start =>
         Set_State(Running_State);
      when others =>
         null;
   end case;
end Handle_Event;

type Running_State is new System_State with null record;
procedure Handle_Event (
   S : in out Running_State;
   E : Event_Type) is
begin
   case E is
      when Stop =>
         Set_State(Idle_State);
      when Emergency =>
         Set_State(Emergency_State);
      when others =>
         null;
   end case;
end Handle_Event;
```

This pattern ensures only valid state transitions can occur. It's perfect for modeling things like game characters, home automation systems, or simple robots.

### 2. Strategy Pattern for Algorithm Selection

```ada
type Control_Strategy is abstract tagged null record;
function Calculate_Output (
   S : Control_Strategy;
   Input : Control_Input) return Control_Output is abstract;

type PID_Strategy is new Control_Strategy with record
   Kp, Ki, Kd : Float;
end record;
function Calculate_Output (
   S : PID_Strategy;
   Input : Control_Input) return Control_Output is
begin
   -- PID calculation
   return Result;
end Calculate_Output;

type Fuzzy_Strategy is new Control_Strategy with record
   Rules : Fuzzy_Rule_Set;
end record;
function Calculate_Output (
   S : Fuzzy_Strategy;
   Input : Control_Input) return Control_Output is
begin
   -- Fuzzy logic calculation
   return Result;
end Calculate_Output;
```

This pattern enables safe runtime algorithm selection. It's great for applications where you might want to switch between different calculation methods based on conditions.

### 3. Visitor Pattern for Data Processing

```ada
type Sensor_Element is abstract tagged null record;
procedure Accept (
   E : Sensor_Element;
   V : in out Sensor_Visitor) is abstract;

type Temperature_Sensor is new Sensor_Element with record
   Value : Float;
end record;
procedure Accept (
   E : Temperature_Sensor;
   V : in out Sensor_Visitor) is
begin
   V.Visit_Temperature(E);
end Accept;

type Safety_Check_Visitor is new Sensor_Visitor with null record;
procedure Visit_Temperature (
   V : in out Safety_Check_Visitor;
   S : Temperature_Sensor) is
begin
   if S.Value > MAX_TEMP then
      Trigger_Alarm;
   end if;
end Visit_Temperature;
```

This pattern ensures exhaustive processing of heterogeneous data. It's perfect for applications where you need to process different types of data in the same way.

### OOP Pattern Selection Guide

| Pattern | When to Use | Benefits |
| :--- | :--- | :--- |
| **State Pattern** | Complex state machines with many states | Prevents invalid state transitions |
| **Strategy Pattern** | Multiple algorithms for same task | Ensures algorithm safety properties |
| **Visitor Pattern** | Processing heterogeneous data collections | Guarantees exhaustive processing |
| **Template Method** | Fixed algorithm with variable steps | Maintains algorithm invariants |

## Exercises: Building Verified Polymorphic Systems

### Exercise 1: Zoo Management System

Design a polymorphic zoo management system:

- Create an abstract base type for animals
- Implement concrete types for different animals (lion, elephant, bird)
- Add contracts to ensure safe behavior
- Use the state pattern for animal states (awake, sleeping, feeding)
- Verify that impossible state transitions are contractually prohibited

> **Challenge:** Prove that the zoo system cannot put animals in impossible states.

#### Solution Guidance

Start by defining your animal base type:

```ada
type Animal is abstract tagged record
   Name : String (1..50);
   State : Animal_State;
end record;

procedure Feed (A : in out Animal) is abstract;
procedure Sleep (A : in out Animal) is abstract;
procedure Wake (A : in out Animal) is abstract;
```

Then create concrete animal types:

```ada
type Lion is new Animal with null record;
procedure Feed (L : in out Lion) is
begin
   -- Lion-specific feeding
end Feed;

procedure Sleep (L : in out Lion) is
begin
   -- Lion-specific sleeping
end Sleep;
```

Add state transitions with contracts:

```ada
procedure Wake (L : in out Lion) with
   Pre  => L.State = Sleeping,
   Post => L.State = Awake;
```

This contract ensures that a lion can only wake up if it's currently sleeping.

### Exercise 2: Home Automation System

Build a polymorphic home automation system:

- Design an interface for different types of sensors
- Implement concrete sensors for temperature, humidity, and motion
- Add contracts to ensure data validity
- Use the strategy pattern for different processing algorithms
- Create a verification plan for polymorphic behavior

> **Challenge:** Prove that sensor data cannot be misinterpreted due to polymorphism.

#### Solution Guidance

Start by defining your sensor interface:

```ada
type Sensor is interface;
function Get_Value (S : Sensor) return Float is abstract;
procedure Calibrate (S : in out Sensor) is abstract;
```

Then implement concrete sensors:

```ada
type Temperature_Sensor is new Sensor with record
   Units : String (1..10);
   Value : Float;
end record;

function Get_Value (T : Temperature_Sensor) return Float is
begin
   return T.Value;
end Get_Value;

procedure Calibrate (T : in out Temperature_Sensor) is
begin
   -- Calibration code
end Calibrate;
```

Add contracts to ensure data validity:

```ada
function Get_Value (T : Temperature_Sensor) return Float with
   Post => Get_Value'Result in -50.0..50.0;
```

This contract ensures that temperature values are always within a reasonable range.

## Verification Strategy for Polymorphic Systems

1. **Static verification**: Use `gnatprove` to verify contract refinement
2. **Type safety**: Verify all downcasts with tag checks
3. **Dispatching verification**: Prove correct dispatching behavior
4. **State preservation**: Verify invariants across dispatching
5. **Path coverage**: Ensure all polymorphic paths are tested
6. **Formal proof**: For critical components, use SPARK for mathematical verification

For highest reliability, all six verification steps are required to demonstrate safe polymorphic behavior.

## Common OOP Mistakes and How to Avoid Them

### Mistake: Overusing Inheritance

Many beginners think inheritance is always the best solution. But sometimes composition is better:

```ada
-- Bad: Inheriting from a large base class
type Smart_Thermostat is new Thermostat with record
   -- Additional components
end record;

-- Good: Using composition
type Smart_Thermostat is record
   Base_Thermostat : Thermostat;
   -- Additional components
end record;
```

### Mistake: Forgetting to Use 'Class

When working with polymorphism, you need to use `Type'Class`:

```ada
-- Bad: Using the base type directly
procedure Process (S : Sensor) is
begin
   -- This won't dispatch properly
end Process;

-- Good: Using the class type
procedure Process (S : Sensor'Class) is
begin
   -- This will dispatch properly
end Process;
```

### Mistake: Unsafe Downcasting

```ada
-- Bad: No tag check
T : Temperature_Sensor := Temperature_Sensor(S);

-- Good: With tag check
if S in Temperature_Sensor then
   T : Temperature_Sensor := Temperature_Sensor(S);
   -- Work with T
end if;
```

## Why Ada's OOP Is Great for Beginners

Ada's object-oriented features are designed to be simple and explicit. Unlike other languages where polymorphism happens behind the scenes, Ada makes everything visible in the code. This means:

- **No hidden behavior**: You can see exactly which implementation will be called
- **No surprises**: There are no virtual tables or hidden dispatch mechanisms
- **Clearer code**: The polymorphism is visible in the code, not hidden in compiler magic
- **Easier debugging**: When something goes wrong, you can see exactly where it's happening

Let's look at a simple example of Ada's OOP in action. Imagine you're building a simple game where different characters have different abilities:

```ada
with Ada.Text_IO; use Ada.Text_IO;

type Character is tagged record
   Name : String (1..50);
   Health : Natural;
end record;

procedure Attack (C : in out Character) is
begin
   Put_Line (C.Name & " attacks!");
end Attack;

type Warrior is new Character with null record;
procedure Attack (W : in out Warrior) is
begin
   Put_Line (W.Name & " swings sword!");
end Attack;

type Mage is new Character with null record;
procedure Attack (M : in out Mage) is
begin
   Put_Line (M.Name & " casts fireball!");
end Attack;

procedure Process_Character (C : Character'Class) is
begin
   Put_Line ("Processing " & C.Name);
   Attack(C);
end Process_Character;

procedure Game_Main is
   My_Warrior : Warrior := (Name => "Aragorn", Health => 100, others => <>);
   My_Mage : Mage := (Name => "Gandalf", Health => 80, others => <>);
begin
   Process_Character(My_Warrior);
   Process_Character(My_Mage);
end Game_Main;
```

When you run this program, it will output:

```
Processing Aragorn
Aragorn swings sword!
Processing Gandalf
Gandalf casts fireball!
```

Notice how the `Process_Character` procedure works with any character type, but calls the correct `Attack` implementation for each one. This is polymorphism in action—without any hidden complexity.

## Next Steps: Generics and Template Programming

Now that you've mastered Ada's object-oriented programming features, you're ready to explore how to create reusable, type-safe components through generics. In the next tutorial, we'll dive into Ada's powerful generic programming system, showing how to:

### Upcoming: Generics and Template Programming

- Create reusable components with formal parameters
- Specify constraints on generic parameters
- Verify generic code correctness
- Combine generics with Design by Contract
- Apply generics to safety-critical patterns

### Practice Challenge

Enhance your zoo management system with generics:

- Create generic animal interface packages
- Add constraints to ensure type safety
- Implement contracts for generic operations
- Verify that instantiations maintain safety properties
- Create a verification plan for generic components

#### The Path to Verified Reusability

Object-oriented programming provides the foundation for building flexible systems, but generics enable building flexible systems efficiently. When combined with strong typing, Design by Contract, and formal verification, Ada's generic system creates a powerful framework for developing and certifying reusable components.

This integrated approach is why Ada remains the language of choice for organizations that need both flexibility and reliability. As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just functionally correct, but economically sustainable throughout its lifecycle.

For beginners, this means you'll be able to write code that's both flexible and reliable. You'll be able to create components that work for many different situations without sacrificing safety or predictability. And most importantly, you'll understand exactly how your code works—no hidden surprises, no unexpected behavior. That's the power of Ada's object-oriented programming.