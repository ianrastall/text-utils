# 2\. Ada's Strong Typing System: Preventing Errors at Compile Time

While most programming languages treat types as mere documentation, Ada transforms them into powerful compile-time verification tools. This tutorial explores how Ada's rigorous type system eliminates entire categories of errors before code ever runs, with practical examples demonstrating how constrained types, subtypes, and strong equivalence prevent bugs that plague other languages. You'll learn to leverage Ada's type system as your first line of defense in building reliable software.

**Key Principle:** In Ada, types aren't just labels - they're contracts that the compiler enforces.

## Why Strong Typing Matters: Beyond Syntax Checking

Most languages use types primarily for memory allocation decisions. Ada uses types as semantic validators that catch logical errors during compilation. Consider this critical distinction:

#### C/C++ Type System

- Primarily for memory layout
- Implicit conversions common
- Numeric types often interchangeable
- Pointer arithmetic encouraged
- Errors often surface at runtime

```c
  // C code - compiles without warnings
  int voltage = 240;
  float current = 15.5;
  double power = voltage \* current; // Implicit conversion
```

#### Ada Type System

- Enforces semantic correctness
- No implicit conversions
- Numeric types strictly separated
- Pointer arithmetic prohibited
- Errors caught at compile time

```ada
  -- Ada code - compilation error
  Voltage : Integer := 240;
  Current : Float := 15.5;
  Power : Float := Voltage \* Current; -- ERROR: type mismatch
```

### The Mars Climate Orbiter Lesson

In 1999, NASA lost a $125 million spacecraft because one team used metric units while another used imperial units. The error went undetected because both systems used the same `double` type. Ada's strong typing would have required explicit unit conversion with distinct types, making this error impossible:

```ada
    subtype Meters is Float;
    subtype Feet   is Float;

    -- These are completely incompatible types
    M : Meters := 1000.0;
    F : Feet   := M; -- Compile-time error: type mismatch
```

## Core Typing Mechanisms in Depth

### 1\. Type Equivalence vs. Name Equivalence

Most languages use _structural equivalence_ (types are compatible if their structures match). Ada uses _name equivalence_ - two types are compatible only if they share the same name declaration.

```ada
    -- Two identical structures are still incompatible types
    type Sensor_ID is new Integer;
    type Device_ID is new Integer;

    S : Sensor_ID := 100;
    D : Device_ID := S; -- ERROR: type mismatch despite same structure
```

### Why Name Equivalence Matters

This prevents accidental substitution of conceptually different values that happen to have the same representation. A sensor ID and device ID might both be integers, but they represent fundamentally different concepts in your system.

### 2\. Subtypes with Constraints

Subtypes add constraints to existing types, creating compile-time validation:

```ada
    -- Constrained numeric subtypes
    subtype Percentage is Integer range 0..100;
    subtype Latitude  is Float range -90.0..90.0;
    subtype Port      is Positive range 1024..65535;

    P : Percentage := 150; -- Compile-time error
    L : Latitude  := 100.0; -- Compile-time error
```

### Constraint Best Practices

- Use subtypes for all domain-specific values
- Name constraints meaningfully (`Valid_Temperature` vs `T`)
- Constraints become automatic runtime checks

## Advanced Type Features for Reliability

### Derived Types for Semantic Safety

When you need to create a new type that has similar properties but distinct meaning:

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

### Tagged Types for Safe Polymorphism

Ada's approach to OOP with built-in runtime checks:

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

Unlike C++, Ada automatically inserts runtime checks when converting between tagged types.

#### Practical Application: Medical Device Safety

In an infusion pump system:

```ada
    subtype Milliliters is Float range 0.0..5000.0;
    subtype Milligrams is Float range 0.0..1000.0;
    subtype Flow_Rate  is Float range 0.0..500.0; -- mL/hour

    -- These prevent dangerous unit confusion:
    procedure Set_Dose (Volume : Milliliters);
    procedure Set_Concentration (Mass : Milligrams; Volume : Milliliters);
    procedure Set_Flow_Rate (Rate : Flow_Rate);
```

A developer cannot accidentally set flow rate in mg/hour instead of mL/hour - the compiler enforces unit correctness.

## Practical Type System Patterns

### Pattern 1: Range Constraints for State Safety

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

### Pattern 2: Physical Units with Derived Types

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

### Extending with SPARK

In the SPARK subset of Ada, you can add formal proofs about your units:

```ada
    function To_MPS (M : Meters; S : Seconds) return Meters_Per_Second
       with Pre  => S > 0.0,
            Post => To_MPS'Result = Meters_Per_Second (M) / Meters_Per_Second (S);
```

## Common Pitfalls and Solutions

### Pitfall 1: Overusing Integer and Float

New Ada developers often fall back to basic numeric types instead of creating domain-specific types. This defeats the purpose of Ada's type system.

#### Avoid This:

```ada
    procedure Set_Parameters (
       Param1 : Integer;
       Param2 : Integer;
       Param3 : Float);
```

#### Prefer This:

```ada
    subtype Pressure   is Integer range 0..1000;
    subtype Temperature is Integer range -40..125;
    subtype Humidity    is Float range 0.0..1.0;

    procedure Set_Parameters (
       P : Pressure;
       T : Temperature;
       H : Humidity);
```

### Pitfall 2: Type Conversions as Workarounds

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

## Exercises: Building a Type-Safe System

### Exercise 1: Aircraft Control System

Design a type-safe system for aircraft control surfaces:

- Create distinct types for `Aileron`, `Elevator`, and `Rudder`
- Define appropriate range constraints
- Prevent accidental mixing of control surfaces
- Implement a safe mixing function for coordinated turns

### Exercise 2: Chemical Processing Plant

Create a type system for a chemical processing system:

- Define types for different chemical compounds
- Create safe temperature and pressure ranges for each
- Prevent incompatible chemical combinations
- Implement a reaction validation function using subtypes

#### Solution Guidance

For the aircraft system, your solution should prevent code like:

```ada
   Set_Aileron (Elevator_Value); -- Should be a compile-time error
```

The type system should enforce that each control surface receives only values appropriate for its specific range and physical constraints.

## Next Steps: From Types to Contracts

Now that you've mastered Ada's strong typing system, you're ready to combine these techniques with Ada 2012's formal contract features. In the next tutorial, we'll explore how to:

### Upcoming: Design by Contract

- Write precise preconditions and postconditions
- Use type invariants to protect data integrity
- Combine contracts with strong typing for maximum safety
- Transition from runtime checks to formal verification
- Apply contracts to real-world safety-critical scenarios

### Practice Challenge

Take your aircraft control system from the exercise and enhance it with contracts:

- Add preconditions to prevent invalid control inputs
- Define postconditions for coordinated turn maneuvers
- Create invariants for system state consistency
- Document the safety properties your contracts enforce

### Key Insight

Strong typing is Ada's foundation, but contracts are its superpower. When you combine constrained types with formal specifications, you create software that's not just less error-prone, but _provably correct_ within its specified domain. This is why Ada remains the language of choice when failure is not an option.