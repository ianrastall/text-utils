# 3\. Ada Subprograms: Procedures, Functions, and Packages

While many languages treat functions and procedures as interchangeable, Ada makes a deliberate semantic distinction that enforces clear design principles. This tutorial explores Ada's rigorous approach to subprograms and packages - the foundation of its modular design philosophy. You'll learn how Ada's packaging system creates strong encapsulation boundaries, enables precise visibility control, and supports the development of verifiable components for safety-critical systems. Through practical examples, we'll demonstrate how these features transform code organization from a maintenance challenge into a reliability asset.

#### Subprograms as Contracts

In Ada, subprograms aren't just code containers - they're formal contracts between callers and callees. This perspective shifts development from "making code work" to "specifying how it must work," creating the foundation for verifiable systems.

## Procedures vs. Functions: Semantic Distinctions

Unlike languages that treat all subprograms as functions (even when they don't return values), Ada enforces a clear semantic distinction between procedures and functions that reflects their intended purpose.

#### Procedures

- Perform actions with side effects
- No return value (by design)
- Parameters can be `in`, `out`, or `in out`
- Represent "commands" in the system
- Should be used when the primary purpose is state modification

```ada
  procedure Set_Temperature (
  Sensor_ID : in Sensor-Identifier;
  Value : in Celsius;
  Success : out Boolean) is
  -- Implementation
  begin
  -- Modify system state
  Temperature_Values(Sensor_ID) := Value;
  Success := True;
  exception
  when others =>
  Success := False;
  end Set_Temperature;
```

#### Functions

- Compute and return values
- Must have a return value
- Parameters typically `in` only
- Represent "queries" in the system
- Should be free of side effects (ideally)

```ada
  function Get_Temperature (
  Sensor_ID : Sensor-Identifier) return Celsius is
  -- Implementation
  begin
  -- Return value without modifying state
  return Temperature_Values(Sensor_ID);

  -- No exception handler needed -
  -- functions should not mask errors
  end Get_Temperature;
```

### The Command-Query Separation Principle

Bertrand Meyer's principle states: "Asking a question should not change the answer." Ada enforces this at the language level:

- Functions should not modify visible state
- Procedures should not return values (beyond status)
- Mixing these roles creates subtle bugs that are hard to verify

Violating this principle was a contributing factor in the Therac-25 radiation therapy machine failures. Ada's semantic distinction prevents this class of errors by design.

#### Parameter Modes: The Contract Language

Ada's parameter modes form a precise contract language:

##### `in` Parameters

- Input only (read-only)
- Corresponds to precondition elements
- Must have valid values on entry
- Cannot be modified in the subprogram

##### `out` Parameters

- Output only (write-only)
- Corresponds to postcondition elements
- Must be assigned before return
- Initial value is undefined

##### `in out` Parameters

- Input and output
- Corresponds to both pre and postconditions
- Must have valid initial value
- Must maintain validity after modification

##### Best Practices

- Prefer `in` for most parameters
- Use `out` for primary results
- Limit `in out` to necessary cases
- Avoid global variables as substitutes for parameters

## Packages: The Foundation of Modularity

While many languages use classes as the primary modularization unit, Ada uses packages - a more flexible construct that supports multiple organization patterns.

### Package Structure and Visibility Control

#### Package Specification

The public interface (what callers see):

```ada
    package Temperature_Sensors is

       -- Public types
       subtype Sensor_ID is Positive range 1..100;
       subtype Celsius is Float range -273.15..1000.0;

       -- Public constants
       MAX_SENSORS : constant := 100;

       -- Public subprograms
       procedure Initialize;
       function Is_Initialized return Boolean;
       procedure Read_Sensor (ID : Sensor_ID; Value : out Celsius);
       function Get_Last_Value (ID : Sensor_ID) return Celsius;

    private
       -- Private implementation details
       Initialized : Boolean := False;
       Last_Values : array (Sensor_ID) of Celsius := (others => 0.0);

    end Temperature_Sensors;
```

#### Package Body

The implementation (hidden from callers):

```ada
    package body Temperature_Sensors is

       procedure Initialize is
       begin
          -- Implementation details
          Initialized := True;
          -- ...
       end Initialize;

       function Is_Initialized return Boolean is
       begin
          return Initialized;
       end Is_Initialized;

       procedure Read_Sensor (ID : Sensor_ID; Value : out Celsius) is
       begin
          if not Initialized then
             raise Not_Initialized;
          end if;

          -- Hardware-specific implementation
          Value := Read_Hardware_Sensor(ID);
          Last_Values(ID) := Value;
       end Read_Sensor;

       function Get_Last_Value (ID : Sensor_ID) return Celsius is
       begin
          return Last_Values(ID);
       end Get_Last_Value;

    end Temperature_Sensors;
```

### Key Visibility Rules

- Items in the `private` part are visible to the package body but not to clients
- Package bodies can see all items in their own spec (public and private)
- Clients can only see public items in the spec
- Private types hide implementation details while exposing functionality

This strict visibility control creates strong encapsulation boundaries that prevent unintended dependencies.

### Private Types for Information Hiding

Ada provides multiple levels of information hiding through private types:

```ada
    package Sensor_Management is

       -- Full type visibility (all details visible)
       type Sensor_Record is record
          ID      : Positive;
          Value   : Float;
          Status  : Status_Type;
       end record;

       -- Private type (only operations visible)
       type Sensor_Handle is private;

       -- Limited private type (only assignment and testing for equality)
       type Sensor_Controller is limited private;

       -- Public operations on private types
       function Create_Sensor (ID : Positive) return Sensor_Handle;
       procedure Read_Value (S : Sensor_Handle; Value : out Float);

    private
       -- Implementation details hidden from clients
       type Sensor_Handle is record
          ID         : Positive;
          Last_Value : Float;
          -- ...
       end record;

       type Sensor_Controller is record
          -- Complex implementation
       end record;

    end Sensor_Management;
```

### Private Type Selection Guide

| Type Form | Visibility | Best For |
| :--- | :--- | :--- |
| Standard record | Complete visibility | Data structures where clients need full access |
| Private type | Operations only | Abstract data types with hidden implementation |
| Limited private | Assignment only | Resources that shouldn't be copied (files, devices) |
| Private with discriminants | Controlled visibility | Types with runtime-sized components |                |

## Package Hierarchies and Child Packages

Ada's package hierarchy system provides a powerful mechanism for organizing large systems while maintaining strong encapsulation.

### Parent and Child Package Structure

#### Parent Package (file: temperature_sensors.ads)

```ada
    package Temperature_Sensors is

       subtype Sensor_ID is Positive range 1..100;
       subtype Celsius is Float range -273.15..1000.0;

       procedure Initialize;
       function Is_Initialized return Boolean;

       -- Child packages will extend this interface
       -- No private part needed for parent-only declaration

    end Temperature_Sensors;
```

#### Child Package (file: temperature_sensors.hardware.ads)

```ada
    with Ada.Real_Time;

    package Temperature_Sensors.Hardware is

       -- Child can see parent's public items
       procedure Read_Sensor (ID : Sensor_ID; Value : out Celsius);
       function Get_Last_Timestamp (ID : Sensor_ID) return Ada.Real_Time.Time;

    private
       -- Private to this child package
       Last_Timestamps : array (Sensor_ID) of Ada.Real_Time.Time;

    end Temperature_Sensors.Hardware;

    -- Child package body
    with Ada.Real_Time; use Ada.Real_Time;

    package body Temperature_Sensors.Hardware is

       procedure Read_Sensor (ID : Sensor_ID; Value : out Celsius) is
          Now : Time := Clock;
       begin
          -- Implementation using hardware interface
          Value := Read_Hardware_Sensor(ID);
          Last_Timestamps(ID) := Now;
       end Read_Sensor;

       function Get_Last_Timestamp (ID : Sensor_ID) return Time is
       begin
          return Last_Timestamps(ID);
       end Get_Last_Timestamp;

    end Temperature_Sensors.Hardware;
```

### Child Package Visibility Rules

- A child package can see all public items of its parent
- A child package _cannot_ see private items of its parent (unless the parent has a `private` part)
- Sibling packages cannot see each other's items
- A grandchild can see its parent and its parent's parent
- Visibility follows the hierarchy strictly - no back doors

This controlled visibility enables hierarchical design without the fragility of inheritance-based systems.

### Private Child Packages

For implementation details that should be hidden from clients:

```ada
    -- Parent package
    package Temperature_Sensors is
       -- Public interface
       procedure Initialize;
       -- ...
    private
       -- Private part visible to children
       Initialized : Boolean := False;
    end Temperature_Sensors;

    -- Private child package (visible only to parent)
    private package Temperature_Sensors.Initialization is
       procedure Perform_Hardware_Init;
    end Temperature_Sensors.Initialization;

    -- Parent package body
    package body Temperature_Sensors is
       -- Parent body can see private child
       with Temperature_Sensors.Initialization;

       procedure Initialize is
       begin
          Temperature_Sensors.Initialization.Perform_Hardware_Init;
          Initialized := True;
       end Initialize;
    end Temperature_Sensors;

    -- Private child body
    package body Temperature_Sensors.Initialization is
       procedure Perform_Hardware_Init is
       begin
          -- Hardware-specific initialization
          null;
       end Perform_Hardware_Init;
    end Temperature_Sensors.Initialization;
```

### Package Hierarchy Design Patterns

#### Layered Architecture

- `System`: Top-level interface
- `System.Core`: Core functionality
- `System.IO`: Input/output operations
- `System.Utils`: Utility functions

#### Feature-Based Organization

- `Sensors`: Base sensor interface
- `Sensors.Temperature`: Temperature sensors
- `Sensors.Pressure`: Pressure sensors
- `Sensors.Diagnostics`: Sensor diagnostics

## Library Units and System Organization

Ada's library unit system provides a formal mechanism for organizing large systems with precise dependency control.

### Library Unit Types and Dependencies

#### 1\. Standard Packages

Independent units with no special dependencies:

```ada
    package Math_Utils is
       function Square (X : Float) return Float;
       function Cube (X : Float) return Float;
    end Math_Utils;
```

Can be compiled independently once dependencies are satisfied.

#### 2\. Parent Packages

Define namespaces for child packages:

```ada
    package Sensors is
       -- Base interface
       type Sensor_ID is new Positive;
    end Sensors;
```

Must be compiled before child packages.

#### 3\. Child Packages

Extend parent package functionality:

```ada
    with Ada.Real_Time;
    package Sensors.Temperature is
       function Read (ID : Sensor_ID) return Float;
       -- ...
    end Sensors.Temperature;
```

Depend on parent package; siblings are independent.

#### 4\. Subunits

Split large bodies into manageable pieces:

```ada
    package body Sensors is
       procedure Initialize is
       begin
          -- ...
       end Initialize;

       procedure Read_Sensor (ID : Sensor_ID) is
          separate; -- Implementation in separate file
       end Read_Sensor;
    end Sensors;

    -- In file sensors-read_sensor.adb
    separate (Sensors)
    procedure Read_Sensor (ID : Sensor_ID) is
    begin
       -- Detailed implementation
       null;
    end Read_Sensor;
```

Allows modular implementation of large package bodies.

#### Dependency Management Best Practices

Ada's `with` clause provides precise dependency control:

#### Good Practice

```ada
    -- Only with what's needed
    with Temperature_Sensors.Hardware;
    use Temperature_Sensors;

    procedure Read_All is
       Value : Celsius;
    begin
       for ID in Sensor_ID loop
          Hardware.Read_Sensor(ID, Value);
          -- ...
       end loop;
    end Read_All;
```

#### Poor Practice

```ada
    -- Excessive with clauses
    with Temperature_Sensors;
    with Temperature_Sensors.Hardware;
    with Temperature_Sensors.Diagnostics;
    with Ada.Text_IO;
    with Ada.Real_Time;
    -- ... several more

    -- Excessive use clauses
    use Temperature_Sensors;
    use Temperature_Sensors.Hardware;
    use Ada.Text_IO;
    -- ...
```

Limit `with` clauses to only what's necessary and avoid excessive `use` clauses to prevent namespace pollution and hidden dependencies.

### GNAT Project Files for Large Systems

For industrial-scale systems, GNAT project files manage dependencies:

```ada
    project Flight_Control_System is

       type Build_Type is ("debug", "production");
       Build : Build_Type := "debug";

       for Source_Dirs use ("src", "src/sensors", "src/control");
       for Object_Dir use "obj/" & Build;
       for Main use ("flight_control.adb");

       package Compiler is
          case Build is
             when "debug" =>
                for Default_Switches ("Ada") use ("-g", "-O0", "-gnata");
             when "production" =>
                for Default_Switches ("Ada") use ("-O2", "-gnatp", "-gnata");
          end case;
       end Compiler;

       package Builder is
          for Default_Switches ("Ada") use ("-j8");
       end Builder;

       package Linker is
          for Default_Switches ("Ada") use ("-Wl,-Map=obj/mapfile");
       end Linker;

    end Flight_Control_System;
```

### Project File Best Practices

- Use separate project files for different system components
- Define build configurations for development and production
- Organize source directories by functionality
- Set appropriate compiler switches for each configuration
- Use project hierarchies for large systems

## Package Initialization and Finalization

Ada provides controlled mechanisms for package initialization and finalization - critical for safety-critical systems where startup and shutdown sequences matter.

### Initialization Patterns

#### 1\. Implicit Initialization

Using variable declarations:

```ada
    package Sensors is
       -- Variables initialize at elaboration
       Sensor_Count : Natural := 0;
       Initialized  : Boolean := False;

       -- ...
    end Sensors;
```

Simple but limited control over initialization order.

#### 2\. Explicit Initialization Procedure

Using an initialization procedure:

```ada
    package Sensors is
       -- No implicit initialization
       Sensor_Count : Natural;
       Initialized  : Boolean;

       -- Explicit initialization
       procedure Initialize;

       -- ...
    end Sensors;

    package body Sensors is
       procedure Initialize is
       begin
          -- Controlled initialization sequence
          Sensor_Count := 0;
          Initialized := True;
          -- Additional setup
       end Initialize;
    end Sensors;
```

Gives complete control over initialization sequence.

### Advanced Initialization Control

#### Elaboration Control Pragmas

Control elaboration order explicitly:

```ada
    package Sensors is
       pragma Elaborate_Body;
       -- ...
    end Sensors;

    package Sensors.Hardware is
       pragma Elaborate_All (Sensors);
       -- ...
    end Sensors.Hardware;
```

Directs the compiler to ensure proper elaboration order.

#### Elaboration Checks

Enable runtime elaboration checks:

```bash
    gnatmake -gnatE your_program.adb
```

This compiles with elaboration checks that detect:

- Calling subprograms before elaboration
- Circular dependencies
- Missing elaboration pragmas

#### Initialization with Contracts

Using Design by Contract for initialization:

```ada
    package Sensors with
       Initializes => (Sensor_Count, Initialized) is

       function Is_Ready return Boolean with
          Post => Is_Ready = Initialized;

       procedure Initialize with
          Pre  => not Is_Ready,
          Post => Is_Ready;

    private
       Sensor_Count : Natural := 0;
       Initialized  : Boolean := False;
    end Sensors;
```

Contracts document and verify initialization requirements.

### The Initialization Order Problem

In many languages, global variable initialization order is undefined or implementation-dependent. This caused the Ariane 5 rocket failure. Ada provides multiple solutions:

#### Problem

- Package A depends on Package B
- But Package B initializes after Package A
- Results in undefined behavior

#### Solutions

- Use `pragma Elaborate`/`Elaborate_All`
- Use explicit initialization procedures
- Compile with elaboration checks (`-gnatE`)
- Use the `with` clause dependency graph

For safety-critical systems, all four approaches should be used together to ensure reliable initialization.

## Real-World Package Design Patterns

### 1\. Safety-Critical Sensor Interface

A robust sensor interface package:

```ada
    package Critical_Sensors with
       SPARK_Mode => On
    is

       -- Public types with constraints
       subtype Sensor_ID is Positive range 1..MAX_SENSORS;
       subtype Celsius is Float range -273.15..1000.0;
       subtype Valid_Celsius is Celsius range -50.0..150.0;

       -- State management
       function Is_Initialized return Boolean;
       procedure Initialize with
          Pre  => not Is_Initialized,
          Post => Is_Initialized;

       -- Sensor operations with contracts
       procedure Read_Sensor (
          ID    : Sensor_ID;
          Value : out Valid_Celsius) with
          Pre  => Is_Initialized,
          Post => Value in Valid_Celsius;

       function Get_Last_Value (
          ID : Sensor_ID) return Valid_Celsius with
          Pre => Is_Initialized;

    private
       -- Implementation details hidden
       Initialized : Boolean := False;
       Last_Values : array (Sensor_ID) of Celsius := (others => 0.0);

    end Critical_Sensors;
```

This pattern combines strong typing, contracts, and information hiding for maximum safety.

### 2\. Medical Device Control Package

A pacemaker control package:

```ada
    package Pacemaker_Control with
       SPARK_Mode => On
    is

       -- Safety-critical types
       subtype BPM is Natural range 30..200;
       subtype Milliamps is Float range 0.0..20.0;
       subtype Pulse_Width is Natural range 0.1..2.0;

       -- System state
       type Operating_Mode is (Standby, Monitoring, Pacing);
       function Current_Mode return Operating_Mode;

       -- Control operations with strict contracts
       procedure Start_Monitoring with
          Pre  => Current_Mode = Standby,
          Post => Current_Mode = Monitoring;

       procedure Start_Pacing (
          Rate      : BPM;
          Amplitude : Milliamps;
          Width     : Pulse_Width) with
          Pre  => Current_Mode = Monitoring,
          Post => Current_Mode = Pacing;

       procedure Stop_Pacing with
          Pre  => Current_Mode = Pacing,
          Post => Current_Mode = Monitoring;

       -- Safety monitoring
       procedure Check_Safety with
          Post => (if Current_Mode = Pacing then
                   Amplitude <= MAX_SAFE_AMPLITUDE);

    private
       -- Hidden implementation
       Mode : Operating_Mode := Standby;

       -- Safety constants
       MAX_SAFE_AMPLITUDE : constant Milliamps := 15.0;

    end Pacemaker_Control;
```

This implementation ensures safe state transitions and parameter validation.

#### DO-178C Considerations for Package Design

For avionics software at DAL A, package design must address:

- **Information hiding:** Critical algorithms must be encapsulated
- **Modular verification:** Each package must be verifiable in isolation
- **Traceability:** Package structure should align with requirements
- **Minimized coupling:** Reduce dependencies between components
- **Deterministic initialization:** Prevent race conditions during startup

Ada's package system, combined with SPARK, provides the only practical approach to meeting these requirements without prohibitive verification costs.

## Exercises: Building Robust Package Hierarchies

### Exercise 1: Avionics Sensor System

Design a package hierarchy for an aircraft sensor system:

- Create a parent package for the sensor system
- Define child packages for temperature, pressure, and attitude sensors
- Use private types to hide hardware-specific details
- Add contracts to ensure safe initialization and operation
- Verify that improper state transitions are impossible

**Challenge:** Prove that sensor readings cannot be accessed before system initialization.

### Exercise 2: Medical Device Package Design

Build a package structure for an infusion pump:

- Design a package hierarchy with appropriate encapsulation
- Use private types for critical components
- Implement strict initialization protocols
- Add contracts to enforce safety properties
- Structure the system for modular verification

**Challenge:** Create a verification plan showing how each safety requirement is enforced through package design.

### Package Design Verification Strategy

1.  **Structure verification:** Check package hierarchy against requirements
2.  **Visibility verification:** Ensure proper information hiding
3.  **Dependency verification:** Analyze and minimize coupling
4.  **Initialization verification:** Confirm safe startup sequences
5.  **Contract verification:** Prove design-by-contract properties
6.  **Integration verification:** Test package interactions

For highest safety levels, all six verification steps are required to demonstrate proper package design.

## Next Steps: Design by Contract

Now that you've mastered Ada's subprogram and package system, you're ready to explore how to specify precise behavioral requirements directly in your code. In the next tutorial, we'll dive into Design by Contract - Ada 2012's powerful feature for building verifiable systems. You'll learn how to:

### Upcoming: Design by Contract

- Specify preconditions and postconditions
- Use type invariants to protect data integrity
- Combine contracts with strong typing for maximum safety
- Transition from runtime checks to formal verification
- Apply contracts to real-world safety-critical scenarios

### Practice Challenge

Enhance your avionics sensor system with contracts:

- Add preconditions to prevent invalid sensor operations
- Define postconditions for sensor readings
- Create invariants for system state consistency
- Document the safety properties your contracts enforce
- Verify that your contracts prevent known failure modes

#### The Path to Verified Systems

Ada's subprogram and package system provides the structural foundation for building reliable software, but contracts provide the semantic precision needed for verification. When combined with strong typing and formal methods, these features create a pathway from traditional development to mathematically verified software.

This integrated approach is why Ada remains the language of choice for systems where failure is not just expensive, but catastrophic. As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just less error-prone, but _provably correct_ within its specified domain.
