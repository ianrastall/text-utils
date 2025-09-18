# 2. Ada's Strong Typing System

While most programming languages treat types as mere documentation, Ada transforms them into powerful compile-time verification tools. This chapter explores how Ada's rigorous type system eliminates entire categories of errors before code ever runs, with practical examples demonstrating how constrained types, subtypes, and strong equivalence prevent bugs that plague other languages. You'll learn to leverage Ada's type system as your first line of defense in building reliable software.

**Key Principle:** In Ada, types aren't just labels—they're contracts that the compiler enforces. Every time you declare a variable, function parameter, or return value, you're specifying not just what data it holds, but what it *means* in your program's domain. This semantic precision prevents entire classes of errors that would otherwise surface only during testing or in production.

## 1.1 Why Strong Typing Matters: Beyond Syntax Checking

Most programming languages use types primarily for memory allocation decisions. C, C++, and Java use types to determine how much memory to allocate for a variable and how to interpret its bits. Ada uses types as semantic validators that catch logical errors during compilation. Consider this critical distinction:

#### 1.1.0.1 C/C++ Type System
- Primarily for memory layout
- Implicit conversions common
- Numeric types often interchangeable
- Pointer arithmetic encouraged
- Errors often surface at runtime

```c
// C code - compiles without warnings
int voltage = 240;
float current = 15.5;
double power = voltage * current; // Implicit conversion
```

This C code compiles without any warnings or errors. The integer `voltage` is automatically converted to a floating-point value when multiplied by `current`, and the result is stored in `power`. While this might seem convenient, it hides a fundamental issue: the program has no way to distinguish between voltage values and current values. Both are just numbers, and the compiler doesn't care if you accidentally assign a current value to a voltage variable.

#### 1.1.0.2 Ada Type System
- Enforces semantic correctness
- No implicit conversions
- Numeric types strictly separated
- Pointer arithmetic prohibited
- Errors caught at compile time

```ada
Voltage : Integer := 240;
Current : Float := 15.5;
Power : Float := Voltage * Current; -- ERROR: type mismatch
```

This Ada code will fail to compile. The compiler detects that you're trying to multiply an `Integer` (`Voltage`) with a `Float` (`Current`) and assign the result to a `Float` (`Power`). Ada requires explicit conversion between these types: `Float(Voltage) * Current`. This might seem inconvenient at first, but it forces you to acknowledge that voltage and current are conceptually different quantities that require explicit handling.

### 1.1.1 The Mars Climate Orbiter Lesson

In 1999, NASA lost a $125 million spacecraft because one team used metric units while another used imperial units. The error went undetected because both systems used the same `double` type. Ada's strong typing would have required explicit unit conversion with distinct types, making this error impossible:

```ada
type Newton_Seconds is new Float;
type Pound_Force_Seconds is new Float;

-- These are completely incompatible types
N : Newton_Seconds := 1000.0;
P : Pound_Force_Seconds := N; -- Compile-time error: type mismatch
```

In this Ada example, `Newton_Seconds` and `Pound_Force_Seconds` are distinct types—even though they're both based on `Float`. Assigning one to the other requires an explicit conversion function, which would force developers to acknowledge the unit conversion. This simple type distinction would have prevented the Mars Climate Orbiter disaster by making the unit mismatch impossible to overlook.

### 1.1.2 The Real Cost of Type Errors

Type errors are not just theoretical problems—they have real-world consequences. Consider these examples:

- A banking application that accidentally treated dollars as euros could transfer $1 million instead of €1 million, causing massive financial loss
- A medical device that confused milligrams with grams could administer a lethal dose of medication
- A flight control system that mixed up feet and meters could cause a plane to crash

In most languages, these errors would only surface during testing or in production. In Ada, they're caught during compilation—before anyone ever runs the code. This might seem like a small difference, but it fundamentally changes how you approach software development. Instead of writing code and hoping it works, you write code that *cannot* be incorrect according to your type definitions.

### 1.1.3 How Ada's Type System Differs from Other Languages

Let's examine how Ada's type system compares to other popular languages:

| **Feature** | **C/C++** | **Java** | **Python** | **Ada** |
| :--- | :--- | :--- | :--- | :--- |
| **Type checking** | Static, weak | Static, strong | Dynamic | Static, strong |
| **Implicit conversions** | Common | Limited | Common | None |
| **User-defined types** | Structs, classes | Classes | Classes | Types, subtypes |
| **Type equivalence** | Structural | Structural | Structural | Name-based |
| **Pointer arithmetic** | Allowed | Not allowed | Not applicable | Prohibited |
| **Runtime type checks** | Minimal | Some | Full | Extensive |

The key difference is in **name-based equivalence**. In C and Java, two types are considered compatible if they have the same structure (structural equivalence). In Ada, two types are compatible only if they share the same name declaration (name-based equivalence). This might seem restrictive, but it prevents accidental substitution of conceptually different values that happen to have the same representation.

## 1.2 Core Typing Mechanisms in Depth

Ada's type system has three fundamental components: basic types, derived types, and subtypes. Each serves a specific purpose in building reliable software.

### 1.2.1 Type Equivalence vs. Name Equivalence

Most languages use *structural equivalence*—types are compatible if their structures match. Ada uses *name equivalence*—two types are compatible only if they share the same name declaration.

```ada
-- Two identical structures are still incompatible types
type Sensor_ID is new Integer;
type Device_ID is new Integer;

S : Sensor_ID := 100;
D : Device_ID := S; -- ERROR: type mismatch despite same structure
```

In this example, `Sensor_ID` and `Device_ID` are both derived from `Integer` and have identical internal representations. However, because they have different names, they're considered completely different types. Attempting to assign one to the other results in a compile-time error.

#### 1.2.1.1 Why Name Equivalence Matters

This prevents accidental substitution of conceptually different values that happen to have the same representation. A sensor ID and device ID might both be integers, but they represent fundamentally different concepts in your system. In a building management system, you might have:

```ada
type Room_Number is new Integer;
type Sensor_ID is new Integer;

Current_Room : Room_Number := 101;
Sensor : Sensor_ID := Current_Room; -- ERROR: type mismatch
```

This error would catch a mistake where someone accidentally assigned a room number to a sensor ID. Without strong typing, this could lead to the wrong sensor being controlled for the wrong room—a potentially serious error in a smart building system.

### 1.2.2 Subtypes with Constraints

Subtypes add constraints to existing types, creating compile-time validation. They're one of Ada's most powerful features for preventing errors.

```ada
-- Constrained numeric subtypes
subtype Percentage is Integer range 0..100;
subtype Latitude  is Float range -90.0..90.0;
subtype Port      is Positive range 1024..65535;

P : Percentage := 150; -- Compile-time error
L : Latitude  := 100.0; -- Compile-time error
```

These subtypes define specific ranges of valid values. Any attempt to assign a value outside these ranges results in a compile-time error. This is different from C or Java, where you'd have to manually check these ranges at runtime.

#### 1.2.2.1 Constraint Best Practices

When using subtypes, follow these best practices:

- **Use subtypes for all domain-specific values**: Don't just use `Integer` for everything. Create specific subtypes for temperatures, voltages, percentages, etc.
- **Name constraints meaningfully**: `Valid_Temperature` is better than `T` or `Num`.
- **Constraints become automatic runtime checks**: Even if you pass values at runtime (e.g., from user input), Ada will check them against the subtype constraints.

Let's see a practical example of how subtypes prevent errors:

```ada
-- Without subtypes (prone to errors)
procedure Set_Temperature(T : Integer) is
begin
   if T < -50 or T > 150 then
      raise Invalid_Temperature;
   end if;
   -- ... rest of code ...
end Set_Temperature;

-- With subtypes (compile-time safety)
subtype Temperature is Integer range -50..150;
procedure Set_Temperature(T : Temperature) is
begin
   -- No need for range checks - compiler guarantees validity
   -- ... rest of code ...
end Set_Temperature;
```

In the first version, you have to manually check the temperature range at runtime. This is error-prone—developers might forget to check, or the check might be incorrect. In the second version, the compiler guarantees that `T` is always within the valid range, so you don't need any runtime checks. This makes your code simpler, safer, and more reliable.

### 1.2.3 Derived Types for Semantic Safety

When you need to create a new type that has similar properties but distinct meaning, use derived types:

```ada
type Voltage is new Integer;
type Current is new Integer;

V : Voltage := 240;
C : Current := 15;

-- This is now a type error, as it should be:
Power : Integer := V * C; -- ERROR: no operator for mixed types
```

To enable operations between derived types, you must explicitly define the semantics:

```ada
function "*" (Left : Voltage; Right : Current)
   return Power is
begin
   return Power (Left) * Power (Right);
end "*";
```

This is different from C++, where you could implicitly convert between types or use operator overloading without explicit definitions. In Ada, you must explicitly define how different types interact, which forces you to think about the semantics of your operations.

#### 1.2.3.1 Practical Application: Financial Calculations

Let's see how derived types prevent errors in a financial application:

```ada
type Dollars is new Float;
type Euros is new Float;

-- This would fail to compile:
Total : Euros := 100.0 * Dollars(1.1); -- ERROR: incompatible types

-- Instead, you must explicitly convert:
function Convert_Dollars_To_Euros(D : Dollars) return Euros is
   (Euros(D) * 0.95); -- Assuming 1 USD = 0.95 EUR
```

In this example, the compiler prevents you from multiplying dollars by euros without explicit conversion. This might seem like extra work, but it prevents a common financial error: accidentally treating dollars as euros or vice versa. In a banking system, this could mean transferring the wrong amount of money.

## 1.3 Advanced Type Features for Reliability

Ada's type system includes several advanced features that make it uniquely powerful for building reliable software.

### 1.3.1 Tagged Types for Safe Polymorphism

Ada's approach to object-oriented programming with built-in runtime checks is fundamentally different from C++. In Ada, polymorphism is achieved through tagged types, which automatically insert runtime checks when converting between types.

```ada
type Sensor is tagged record
   ID      : Sensor_ID;
   Status  : Status_Type;
end record;

type Temperature_Sensor is new Sensor with record
   Units   : Temperature_Units;
   Reading : Float;
end record;

-- Safe dispatching call
procedure Process (S : Sensor'Class) is
begin
   -- Compiler inserts runtime tag check
   if S in Temperature_Sensor then
      Handle_Temperature (Temperature_Sensor (S));
   end if;
end Process;
```

Unlike C++, where you can accidentally slice objects or have unsafe casts, Ada automatically checks the type at runtime. If you try to treat a `Sensor` as a `Temperature_Sensor` when it's not, Ada will raise a `Constraint_Error` at runtime.

#### 1.3.1.1 Practical Application: Medical Device Safety

In an infusion pump system, you might have different types of sensors:

```ada
subtype Milliliters is Float range 0.0..5000.0;
subtype Milligrams is Float range 0.0..1000.0;
subtype Flow_Rate  is Float range 0.0..500.0; -- mL/hour

-- These prevent dangerous unit confusion:
procedure Set_Dose (Volume : Milliliters);
procedure Set_Concentration (Mass : Milligrams; Volume : Milliliters);
procedure Set_Flow_Rate (Rate : Flow_Rate);
```

A developer cannot accidentally set flow rate in mg/hour instead of mL/hour—the compiler enforces unit correctness. If you tried to write:

```ada
Set_Flow_Rate(100.0); -- This is fine (Flow_Rate is a subtype of Float)
Set_Flow_Rate(Milligrams(100.0)); -- ERROR: type mismatch
```

The compiler would catch the error immediately. This might seem like a small detail, but in a medical device, it could mean the difference between a safe operation and a fatal overdose.

### 1.3.2 Enumeration Types with Custom Behavior

Ada's enumeration types are more powerful than in most languages. You can define custom attributes and operations for enums:

```ada
type Traffic_Light is (Red, Yellow, Green);

-- Define custom attributes
function Next_State(Light : Traffic_Light) return Traffic_Light is
begin
   case Light is
      when Red   => return Green;
      when Yellow => return Red;
      when Green  => return Yellow;
   end case;
end Next_State;

-- Usage
Current_Light : Traffic_Light := Red;
Next_Light    : Traffic_Light := Next_State(Current_Light);
```

Unlike C or Java enums, Ada enums are first-class types with their own operations. You can't accidentally assign an integer to a Traffic_Light:

```ada
Current_Light := 0; -- ERROR: type mismatch
Current_Light := Red; -- Correct
```

This prevents common errors like using magic numbers for enum values.

### 1.3.3 Type Invariants for Data Integrity

Ada 2012 introduced type invariants—properties that must always be true for a type. These are checked automatically whenever a value of the type is modified:

```ada
type Bank_Account is record
   Balance : Float;
   Overdraft_Limit : Float;
end record
with Invariant => Bank_Account.Balance >= -Bank_Account.Overdraft_Limit;

-- This would fail the invariant check:
Account : Bank_Account := (Balance => -1000.0, Overdraft_Limit => 500.0);
```

In this example, the type invariant ensures that the account balance never goes below the overdraft limit. If you try to create an invalid account, the compiler will raise a `Constraint_Error`.

Type invariants are particularly useful for complex data structures where maintaining invariants manually would be error-prone. They ensure that your data always remains in a valid state, no matter how it's modified.

## 1.4 Practical Type System Patterns

Now that we've explored Ada's type system fundamentals, let's look at practical patterns for building reliable software.

### 1.4.1 Pattern 1: Range Constraints for State Safety

Prevent invalid state transitions through constrained types:

```ada
type System_State is (Off, Starting, Running, Stopping);
subtype Operational_State is System_State range Starting..Running;

procedure Transition (Current : System_State; Next : out System_State) is
begin
   case Current is
      when Off =>
         Next := Starting; -- Valid transition
      when Running =>
         Next := Stopping; -- Valid transition
      when others =>
         raise Invalid_Transition;
   end case;
end Transition;

-- Usage with compile-time state validation:
Current_State : System_State := Off;
Next_State    : Operational_State; -- Must be valid operational state

Transition (Current_State, Next_State); -- Compiler verifies state validity
```

In this example, `Operational_State` is a subtype of `System_State` that only includes `Starting` and `Running`. When you call `Transition`, the compiler ensures that `Next_State` is always a valid operational state. This prevents errors where you might accidentally set the system to `Off` during a transition that should only produce operational states.

#### 1.4.1.1 Real-World Application: Home Automation

Consider a home thermostat system:

```ada
type Thermostat_Mode is (Off, Heat, Cool, Auto);
subtype Active_Mode is Thermostat_Mode range Heat..Auto;

procedure Set_Mode(M : Active_Mode) is
begin
   -- Only allow heat, cool, or auto modes
   -- No need to check for Off mode
   ...
end Set_Mode;

-- This would fail to compile:
Set_Mode(Off); -- ERROR: type mismatch
```

By using a subtype for active modes, you prevent the system from accidentally being set to "Off" when it's supposed to be in an active mode. This ensures that your home automation system always behaves as expected, without manual checks for invalid states.

### 1.4.2 Pattern 2: Physical Units with Derived Types

Create a type-safe physical units system:

```ada
type Meters is new Float;
type Seconds is new Float;
type Meters_Per_Second is new Float;

-- Explicit conversion functions
function To_MPS (M : Meters; S : Seconds) return Meters_Per_Second is
   (Meters_Per_Second (M) / Meters_Per_Second (S));

-- Safe calculation
Distance : Meters  := 100.0;
Time     : Seconds := 10.0;
Velocity : Meters_Per_Second := To_MPS (Distance, Time);
```

In this example, `Meters`, `Seconds`, and `Meters_Per_Second` are distinct types. You can't accidentally assign a distance to a time variable or vice versa:

```ada
Time := Distance; -- ERROR: type mismatch
```

This prevents errors like the Mars Climate Orbiter incident by making unit conversions explicit.

#### 1.4.2.1 Extending with SPARK

In the SPARK subset of Ada, you can add formal proofs about your units:

```ada
function To_MPS (M : Meters; S : Seconds) return Meters_Per_Second
   with Pre  => S > 0.0,
        Post => To_MPS'Result = Meters_Per_Second (M) / Meters_Per_Second (S);
```

This contract specifies that the input time must be positive and that the result equals the division of distance by time. SPARK can then formally verify these properties, ensuring your calculations are mathematically correct.

### 1.4.3 Pattern 3: Type-Safe Data Structures

Ada's type system allows you to create data structures that enforce correctness at compile time:

```ada
type Non_Empty_String is record
   Value : String(1..100);
end record
with Dynamic_Predicate => Non_Empty_String.Value'Length > 0;

-- This would fail to compile:
S : Non_Empty_String := (Value => "");
```

In this example, `Non_Empty_String` is a record type with a dynamic predicate that ensures the string is never empty. Any attempt to create an empty string results in a compile-time error.

This pattern is useful for any data structure where certain invariants must always hold true. For example, you could create a `Positive_Integer` type that only allows values greater than zero, or a `Valid_Email` type that enforces email format rules.

## 1.5 Common Pitfalls and Solutions

Even with Ada's powerful type system, developers new to Ada often fall into common traps. Let's explore these pitfalls and how to avoid them.

### 1.5.1 Pitfall 1: Overusing Integer and Float

New Ada developers often fall back to basic numeric types instead of creating domain-specific types. This defeats the purpose of Ada's type system.

#### 1.5.1.1 Avoid This:

```ada
procedure Set_Parameters (
   Param1 : Integer;
   Param2 : Integer;
   Param3 : Float);
```

This code uses basic types for everything. It's impossible to tell from the parameter names what each parameter represents. A developer could accidentally swap `Param1` and `Param2`, and the compiler wouldn't catch it.

#### 1.5.1.2 Prefer This:

```ada
subtype Pressure   is Integer range 0..1000;
subtype Temperature is Integer range -40..125;
subtype Humidity    is Float range 0.0..1.0;

procedure Set_Parameters (
   P : Pressure;
   T : Temperature;
   H : Humidity);
```

Now each parameter has a specific meaning and valid range. The compiler will catch any attempts to pass incorrect values:

```ada
Set_Parameters(100, 150, 0.5); -- ERROR: Temperature out of range
Set_Parameters(100, 25, 1.5);  -- ERROR: Humidity out of range
```

This is much safer than using basic types. It's also more self-documenting—anyone reading the code knows exactly what each parameter represents.

### 1.5.2 Pitfall 2: Type Conversions as Workarounds

When you find yourself writing many type conversions, it's usually a sign that your type model doesn't match your domain. Instead of:

```ada
V : Integer := Integer (Voltage_Value); -- Avoid this pattern
```

Redesign your types to eliminate the need for conversions:

```ada
type Voltage is range 0..1000;
type Current is range 0..500;

function Calculate_Power (V : Voltage; I : Current) return Integer is
   (Integer (V) * Integer (I)); -- Single conversion at interface
```

In this example, you only need to convert at the interface between your domain types and the calculation function. The rest of your code works with the domain-specific types, which prevents errors throughout your program.

#### 1.5.2.1 Real-World Example: Financial Calculations

Consider a banking application that handles currency conversions:

```ada
-- Bad approach: using Float for everything
procedure Process_Transaction(Amount : Float; Currency : String);

-- Good approach: using distinct types
type USD is new Float;
type EUR is new Float;

function Convert_USD_To_EUR(USD_Amount : USD) return EUR is
   (EUR(USD_Amount * 0.95));

procedure Process_Transaction(Amount : USD);
```

In the bad approach, you have to manually check the currency string and convert it to the right value. In the good approach, the compiler enforces that you only pass USD amounts to `Process_Transaction`, and you have a dedicated conversion function for EUR.

### 1.5.3 Pitfall 3: Ignoring Subtypes for Enumerations

Many developers treat enumerations as simple labels without using subtypes to restrict valid values.

#### 1.5.3.1 Avoid This:

```ada
type Traffic_Light is (Red, Yellow, Green);
```

This allows any `Traffic_Light` value, but in some contexts, you might want to restrict to only certain values.

#### 1.5.3.2 Prefer This:

```ada
type Traffic_Light is (Red, Yellow, Green);
subtype Active_Light is Traffic_Light range Yellow..Green;

-- Now you can use Active_Light where only yellow or green are valid
procedure Set_Display(L : Active_Light);
```

This prevents errors where you might accidentally set the traffic light to red when it should only be yellow or green.

## 1.6 Exercises: Building a Type-Safe System

Now that you've learned Ada's type system fundamentals, let's put them into practice with two exercises. These exercises will help you apply what you've learned to real-world scenarios.

### 1.6.1 Exercise 1: Aircraft Control System

Design a type-safe system for aircraft control surfaces:

- Create distinct types for `Aileron`, `Elevator`, and `Rudder`
- Define appropriate range constraints for each
- Prevent accidental mixing of control surfaces
- Implement a safe mixing function for coordinated turns

#### 1.6.1.1 Solution Guidance

Start by defining distinct types for each control surface:

```ada
type Aileron is new Integer range -30..30; -- Degrees
type Elevator is new Integer range -15..15; -- Degrees
type Rudder is new Integer range -20..20; -- Degrees
```

Now create a function that takes these types as parameters:

```ada
procedure Set_Control_Surface(
   A : Aileron;
   E : Elevator;
   R : Rudder);
```

Try to pass an `Elevator` value to the `A` parameter:

```ada
Set_Control_Surface(Elevator(10), Elevator(5), Rudder(0)); -- ERROR: type mismatch
```

The compiler will catch this immediately. Now create a function for coordinated turns:

```ada
function Coordinated_Turn(A : Aileron; R : Rudder) return (Aileron, Rudder) is
   (A, R);
```

This function takes an aileron and rudder value and returns them unchanged. Because the types are distinct, you can't accidentally swap them:

```ada
Coordinated_Turn(Rudder(10), Aileron(20)); -- ERROR: type mismatch
```

The key insight is that each control surface has its own type with specific range constraints. This prevents errors where you might accidentally use the wrong value for the wrong control surface.

### 1.6.2 Exercise 2: Chemical Processing Plant

Create a type system for a chemical processing system:

- Define types for different chemical compounds
- Create safe temperature and pressure ranges for each
- Prevent incompatible chemical combinations
- Implement a reaction validation function using subtypes

#### 1.6.2.1 Solution Guidance

Start by defining types for different chemicals:

```ada
type Acid is new Float range 0.0..100.0; -- Concentration percentage
type Base is new Float range 0.0..100.0;
type Solvent is new Float range 0.0..100.0;
```

Now create safe temperature ranges for each:

```ada
subtype Acid_Temperature is Integer range -10..50;
subtype Base_Temperature is Integer range 0..80;
subtype Solvent_Temperature is Integer range -20..60;
```

Implement a reaction validation function:

```ada
procedure React(Ac : Acid; B : Base; A_Temp : Acid_Temperature; B_Temp : Base_Temperature) is
begin
   -- Only allow reactions within safe temperature ranges
   -- Compiler ensures temperatures are valid
   ...
end React;
```

Try to pass a solvent temperature to the acid temperature parameter:

```ada
React(Acid(20.0), Base(30.0), Solvent_Temperature(25), Base_Temperature(40)); -- ERROR: type mismatch
```

The compiler will catch this immediately. This prevents dangerous situations where you might accidentally mix chemicals at unsafe temperatures.

## 1.7 Next Steps: From Types to Contracts

Now that you've mastered Ada's strong typing system, you're ready to combine these techniques with Ada 2012's formal contract features. In the next chapter, we'll explore how to:

### 1.7.1 Upcoming: Design by Contract

- Write precise preconditions and postconditions
- Use type invariants to protect data integrity
- Combine contracts with strong typing for maximum safety
- Transition from runtime checks to formal verification
- Apply contracts to real-world scenarios

### 1.7.2 Practice Challenge

Take your aircraft control system from the exercise and enhance it with contracts:

- Add preconditions to prevent invalid control inputs
- Define postconditions for coordinated turn maneuvers
- Create invariants for system state consistency
- Document the safety properties your contracts enforce

#### 1.7.2.1 Example Enhancement

```ada
procedure Set_Control_Surface(
   A : Aileron;
   E : Elevator;
   R : Rudder)
with
   Pre  => (A + E + R) <= 50, -- Total control surface movement limited
   Post => Set_Control_Surface'Result = (A, E, R);
```

This contract ensures that the total movement of all control surfaces doesn't exceed 50 degrees, which might be a safety requirement for the aircraft.

### 1.7.3 Key Insight

Strong typing is Ada's foundation, but contracts are its superpower. When you combine constrained types with formal specifications, you create software that's not just less error-prone, but *provably correct* within its specified domain. This is why Ada remains the language of choice when failure is not an option.

In the next chapter, we'll dive deeper into how contracts work with strong typing to create software that's not just reliable, but mathematically verifiable. You'll learn how to specify exactly what your code should do and have the compiler verify it for you—before it ever runs. This is the true power of Ada's type system: it turns your type definitions into a living specification of your program's behavior.

By the end of the next chapter, you'll be able to create software that's not just less likely to fail, but *guaranteed* to work correctly within its specified domain. This is the difference between writing code that *might* work and writing code that *must* work.
