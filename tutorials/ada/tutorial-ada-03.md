# 3. Ada Subprograms: Procedures, Functions, and Packages

While many programming languages treat functions and procedures as interchangeable constructs, Ada makes a deliberate semantic distinction that enforces clear design principles. This tutorial explores Ada's rigorous approach to subprograms and packages—the foundation of its modular design philosophy. You'll learn how Ada's packaging system creates strong encapsulation boundaries, enables precise visibility control, and supports the development of verifiable components for reliable software systems. Through practical examples, we'll demonstrate how these features transform code organization from a maintenance challenge into a reliability asset.

> In Ada, subprograms aren't just code containers—they're formal contracts between callers and callees. This perspective shifts development from "making code work" to "specifying how it must work," creating the foundation for verifiable systems. When you define a subprogram in Ada, you're not just writing instructions; you're documenting exactly what the subprogram expects, what it guarantees, and how it interacts with the rest of your system. This contract-based approach means errors are caught earlier in the development process, making your code more predictable and maintainable.

## 3.1 Procedures vs. Functions: Semantic Distinctions

Unlike languages that treat all subprograms as functions (even when they don't return values), Ada enforces a clear semantic distinction between procedures and functions that reflects their intended purpose. This distinction isn't arbitrary—it's designed to make your code more self-documenting and less error-prone.

### 3.1.1 Procedures

- Perform actions with side effects
- No return value (by design)
- Parameters can be `in`, `out`, or `in out`
- Represent "commands" in the system
- Should be used when the primary purpose is state modification

```ada
procedure Set_Target_Temperature (
   Sensor_ID : in Sensor_ID;
   Target    : in Celsius;
   Success   : out Boolean) is
begin
   -- Modify system state
   if not Sensor_Initialized(Sensor_ID) then
      Success := False;
      return;
   end if;
   
   Temperature_Values(Sensor_ID) := Target;
   Success := True;
exception
   when others =>
      Success := False;
end Set_Target_Temperature;
```

This procedure sets a target temperature for a specific sensor. It takes a sensor identifier and target value as inputs (`in` parameters), and returns a success status through an `out` parameter. The procedure modifies the system state by updating the temperature value, which is why it's a procedure rather than a function.

### 3.1.2 Functions

- Compute and return values
- Must have a return value
- Parameters typically `in` only
- Represent "queries" in the system
- Should be free of side effects (ideally)

```ada
function Get_Current_Temperature (
   Sensor_ID : Sensor_ID) return Celsius is
begin
   -- Return value without modifying state
   return Temperature_Values(Sensor_ID);
end Get_Current_Temperature;
```

This function retrieves the current temperature for a sensor. It takes a sensor identifier as an input parameter and returns a temperature value. Crucially, it doesn't modify any system state—it simply reads and returns data. This makes it a perfect candidate for a function.

### 3.1.3 The Command-Query Separation Principle

Bertrand Meyer's principle states: "Asking a question should not change the answer." Ada enforces this at the language level:

- Functions should not modify visible state
- Procedures should not return values (beyond status)
- Mixing these roles creates subtle bugs that are hard to verify

Consider this flawed design in a typical language:

```python
def get_temperature(sensor_id):
    # This function both reads and updates state
    current = read_hardware(sensor_id)
    update_last_read(sensor_id, current)
    return current
```

In this Python example, the function both retrieves data and modifies state. This creates ambiguity—callers might not expect the function to change anything, leading to unexpected behavior. In Ada, this would be impossible because functions can't modify state. Instead, you'd have:

```ada
function Get_Current_Temperature (Sensor_ID : Sensor_ID) return Celsius is
   -- No state modification allowed
begin
   return Temperature_Values(Sensor_ID);
end Get_Current_Temperature;

procedure Update_Last_Read (Sensor_ID : Sensor_ID) is
begin
   -- State modification happens here
   Last_Read_Times(Sensor_ID) := Current_Time;
end Update_Last_Read;
```

This separation makes your code clearer and more reliable. You can't accidentally mix read and write operations, which prevents subtle bugs that are difficult to track down.

#### 3.1.3.1 Parameter Modes: The Contract Language

Ada's parameter modes form a precise contract language that explicitly states how data flows into and out of subprograms:

##### `in` Parameters

- Input only (read-only)
- Corresponds to precondition elements
- Must have valid values on entry
- Cannot be modified in the subprogram

```ada
procedure Validate_Temperature (
   Temp : in Celsius;  -- Read-only input
   Valid : out Boolean) is
begin
   Valid := (Temp >= -50.0 and Temp <= 150.0);
   -- Temp cannot be modified here
end Validate_Temperature;
```

##### `out` Parameters

- Output only (write-only)
- Corresponds to postcondition elements
- Must be assigned before return
- Initial value is undefined

```ada
procedure Read_Sensor (
   ID : Sensor_ID;
   Value : out Celsius) is
begin
   -- Must assign Value before returning
   Value := Hardware_Read(ID);
end Read_Sensor;
```

##### `in out` Parameters

- Input and output
- Corresponds to both pre and postconditions
- Must have valid initial value
- Must maintain validity after modification

```ada
procedure Adjust_Temperature (
   Target : in out Celsius) is
begin
   -- Can read initial value and modify
   if Target > 100.0 then
      Target := 100.0;  -- Cap at maximum
   end if;
end Adjust_Temperature;
```

##### Best Practices

- Prefer `in` for most parameters—this is the safest and most common mode
- Use `out` for primary results (when the function would otherwise return multiple values)
- Limit `in out` to necessary cases—these are more error-prone because they allow both reading and writing
- Avoid global variables as substitutes for parameters—this creates hidden dependencies and makes code harder to test

Consider this example where `in out` is misused:

```ada
-- Poor design: using in out when in would suffice
procedure Update_Temperature (
   ID : in out Sensor_ID;
   Value : in out Celsius) is
begin
   -- Only need to read ID, not modify it
   Temperature_Values(ID) := Value;
end Update_Temperature;
```

This is problematic because `ID` is passed as `in out`, suggesting it might be modified. But in reality, it's only read. A better design uses `in`:

```ada
-- Better design: using in for read-only parameters
procedure Update_Temperature (
   ID : in Sensor_ID;
   Value : in Celsius) is
begin
   Temperature_Values(ID) := Value;
end Update_Temperature;
```

This small change makes the contract clearer and prevents accidental modification of the sensor ID.

## 3.2 Packages: The Foundation of Modularity

While many languages use classes as the primary modularization unit, Ada uses packages—a more flexible construct that supports multiple organization patterns. Packages provide a powerful mechanism for encapsulating related functionality while controlling visibility and dependencies.

### 3.2.1 Package Structure and Visibility Control

Ada packages have two distinct parts: the specification (what callers see) and the body (the implementation details). This separation creates clear boundaries between interface and implementation.

#### 3.2.1.1 Package Specification

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
   Not_Initialized : exception;

end Temperature_Sensors;
```

#### 3.2.1.2 Package Body

The implementation (hidden from callers):

```ada
package body Temperature_Sensors is

   procedure Initialize is
   begin
      -- Implementation details
      Initialized := True;
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

### 3.2.2 Key Visibility Rules

- Items in the `private` part are visible to the package body but not to clients
- Package bodies can see all items in their own spec (public and private)
- Clients can only see public items in the spec
- Private types hide implementation details while exposing functionality

This strict visibility control creates strong encapsulation boundaries that prevent unintended dependencies. For example, clients of `Temperature_Sensors` can't access `Last_Values` directly—they must go through `Get_Last_Value`. This ensures that any access to the internal data goes through proper validation and error handling.

### 3.2.3 Private Types for Information Hiding

Ada provides multiple levels of information hiding through private types, giving you fine-grained control over what clients can see:

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

### 3.2.4 Private Type Selection Guide

| **Type Form** | **Visibility** | **Best For** |
| :--- | :--- | :--- |
| **Standard record** | Complete visibility | Data structures where clients need full access |
| **Private type** | Operations only | Abstract data types with hidden implementation |
| **Limited private** | Assignment only | Resources that shouldn't be copied (files, devices) |
| **Private with discriminants** | Controlled visibility | Types with runtime-sized components |

Let's explore each type form in detail:

#### 3.2.4.1 Standard Record

A standard record exposes all its fields to clients. This is appropriate when the data structure is simple and clients need direct access to all components.

```ada
type Point is record
   X : Integer;
   Y : Integer;
end record;
```

Clients can directly access `X` and `Y`:

```ada
P : Point := (X => 5, Y => 10);
P.X := 15;  -- Allowed
```

This is useful for simple data structures but provides no encapsulation—changes to the record structure will affect all clients.

#### 3.2.4.2 Private Type

A private type hides implementation details while exposing operations. Clients can only interact with the type through the public operations defined in the specification.

```ada
package Temperature_Sensors is
   type Sensor_Handle is private;
   
   function Create_Sensor (ID : Positive) return Sensor_Handle;
   procedure Read_Value (S : Sensor_Handle; Value : out Celsius);
   
private
   type Sensor_Handle is record
      ID         : Positive;
      Last_Value : Celsius;
   end record;
end Temperature_Sensors;
```

Clients can create and use sensors but can't see the internal representation:

```ada
S : Sensor_Handle := Create_Sensor(5);
Read_Value(S, Value);  -- Works
S.ID := 10;            -- ERROR: cannot access private record component
```

This is ideal for abstract data types where you want to control how the data is accessed and modified.

#### 3.2.4.3 Limited Private Type

A limited private type restricts operations to only assignment and equality testing. Clients cannot copy or assign these types directly.

```ada
package Device_Manager is
   type Device_Handle is limited private;
   
   function Open_Device (Name : String) return Device_Handle;
   procedure Close_Device (D : in out Device_Handle);
   
private
   type Device_Handle is record
      Handle : System.Address;
   end record;
end Device_Manager;
```

Clients can create and close devices but cannot copy them:

```ada
D1 : Device_Handle := Open_Device("sensor1");
D2 : Device_Handle := D1;  -- ERROR: limited private types cannot be copied
Close_Device(D1);
```

This is perfect for resources that should have only one owner, like file handles or hardware devices.

#### 3.2.4.4 Private with Discriminants

A private type with discriminants allows runtime-sized components while hiding implementation details.

```ada
package String_Buffer is
   type Buffer (Size : Positive) is private;
   
   procedure Append (B : in out Buffer; S : String);
   
private
   type Buffer (Size : Positive) is record
      Data : String(1..Size);
      Length : Natural := 0;
   end record;
end String_Buffer;
```

Clients can create buffers of specific sizes but don't see the implementation:

```ada
B : Buffer(100) := (Size => 100);
Append(B, "Hello");  -- Works
B.Data := "Test";    -- ERROR: cannot access private component
```

This is useful for types where the size is determined at runtime but the implementation details should remain hidden.

## 3.3 Package Hierarchies and Child Packages

Ada's package hierarchy system provides a powerful mechanism for organizing large systems while maintaining strong encapsulation. Unlike inheritance-based systems, Ada's package hierarchy creates clear ownership relationships without the fragility of deep inheritance trees.

### 3.3.1 Parent and Child Package Structure

#### 3.3.1.1 Parent Package (file: temperature_sensors.ads)

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

#### 3.3.1.2 Child Package (file: temperature_sensors.hardware.ads)

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

### 3.3.2 Child Package Visibility Rules

- A child package can see all public items of its parent
- A child package _cannot_ see private items of its parent (unless the parent has a `private` part)
- Sibling packages cannot see each other's items
- A grandchild can see its parent and its parent's parent
- Visibility follows the hierarchy strictly—no back doors

This controlled visibility enables hierarchical design without the fragility of inheritance-based systems. For example, consider a home automation system with temperature, humidity, and motion sensors:

```ada
package Home_Sensors is
   -- Public interface for all sensors
end Home_Sensors;

package Home_Sensors.Temperature is
   -- Temperature-specific operations
end Home_Sensors.Temperature;

package Home_Sensors.Humidity is
   -- Humidity-specific operations
end Home_Sensors.Humidity;

package Home_Sensors.Motion is
   -- Motion-specific operations
end Home_Sensors.Motion;
```

Each child package has access to the parent's public interface but not to the other child packages. This keeps the system modular and prevents accidental dependencies between unrelated components.

### 3.3.3 Private Child Packages

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

This pattern is perfect for initialization routines that should be hidden from clients but need to be part of the package's implementation. The private child package `Initialization` is only visible to the parent package body, not to any clients of the package.

### 3.3.4 Package Hierarchy Design Patterns

#### 3.3.4.1 Layered Architecture

- `System`: Top-level interface
- `System.Core`: Core functionality
- `System.IO`: Input/output operations
- `System.Utils`: Utility functions

This structure creates clear separation of concerns. For example, in a home automation system:

```ada
package Home_Automation is
   -- Top-level interface
end Home_Automation;

package Home_Automation.Core is
   -- Core logic for device management
end Home_Automation.Core;

package Home_Automation.IO is
   -- Hardware-specific I/O operations
end Home_Automation.IO;

package Home_Automation.Utils is
   -- Utility functions like math operations
end Home_Automation.Utils;
```

Each layer depends only on layers below it, creating a clean dependency graph.

#### 3.3.4.2 Feature-Based Organization

- `Sensors`: Base sensor interface
- `Sensors.Temperature`: Temperature sensors
- `Sensors.Pressure`: Pressure sensors
- `Sensors.Diagnostics`: Sensor diagnostics

This structure groups related functionality together. For example, in a home monitoring system:

```ada
package Sensors is
   -- Base sensor interface
end Sensors;

package Sensors.Temperature is
   -- Temperature-specific operations
end Sensors.Temperature;

package Sensors.Pressure is
   -- Pressure-specific operations
end Sensors.Pressure;

package Sensors.Diagnostics is
   -- Diagnostic operations for all sensors
end Sensors.Diagnostics;
```

This organization makes it easy to find related functionality and keeps the system modular.

## 3.4 Library Units and System Organization

Ada's library unit system provides a formal mechanism for organizing large systems with precise dependency control. Unlike languages where dependencies are implicit or managed through build systems, Ada makes dependencies explicit and verifiable.

### 3.4.1 Library Unit Types and Dependencies

#### 3.4.1.1 Standard Packages

Independent units with no special dependencies:

```ada
package Math_Utils is
   function Square (X : Float) return Float;
   function Cube (X : Float) return Float;
end Math_Utils;
```

Can be compiled independently once dependencies are satisfied. These are perfect for general-purpose utilities that don't depend on other parts of your system.

#### 3.4.1.2 Parent Packages

Define namespaces for child packages:

```ada
package Sensors is
   -- Base interface
   type Sensor_ID is new Positive;
end Sensors;
```

Must be compiled before child packages. Parent packages act as the foundation for hierarchical organization.

#### 3.4.1.3 Child Packages

Extend parent package functionality:

```ada
with Ada.Real_Time;
package Sensors.Temperature is
   function Read (ID : Sensor_ID) return Float;
   -- ...
end Sensors.Temperature;
```

Depend on parent package; siblings are independent. Child packages can access the parent's public items but not private items.

#### 3.4.1.4 Subunits

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

Allows modular implementation of large package bodies. Subunits make it easier to manage large codebases by splitting them into smaller, more manageable files.

#### 3.4.1.5 Dependency Management Best Practices

Ada's `with` clause provides precise dependency control:

##### Good Practice

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

##### Poor Practice

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

Limit `with` clauses to only what's necessary and avoid excessive `use` clauses to prevent namespace pollution and hidden dependencies. In the good practice example, we only import what we need (`Temperature_Sensors.Hardware`), and we explicitly qualify `Hardware.Read_Sensor` rather than using `use` for the entire package.

### 3.4.2 GNAT Project Files for Large Systems

For industrial-scale systems, GNAT project files manage dependencies:

```ada
project Home_Automation is

   type Build_Type is ("debug", "production");
   Build : Build_Type := "debug";

   for Source_Dirs use ("src", "src/sensors", "src/control");
   for Object_Dir use "obj/" & Build;
   for Main use ("home_automation.adb");

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

end Home_Automation;
```

### 3.4.3 Project File Best Practices

- Use separate project files for different system components
- Define build configurations for development and production
- Organize source directories by functionality
- Set appropriate compiler switches for each configuration
- Use project hierarchies for large systems

For example, a home automation system might have:

- `home_automation.gpr`: Main project file
- `sensors.gpr`: Sensor subsystem project
- `control.gpr`: Control subsystem project
- `ui.gpr`: User interface project

Each project file can have its own build configurations and dependencies, making it easy to manage large systems.

## 3.5 Package Initialization and Finalization

Ada provides controlled mechanisms for package initialization and finalization—critical for reliable systems where startup and shutdown sequences matter. Unlike languages where global initialization order is undefined, Ada gives you precise control over when and how initialization happens.

### 3.5.1 Initialization Patterns

#### 3.5.1.1 Implicit Initialization

Using variable declarations:

```ada
package Sensors is
   -- Variables initialize at elaboration
   Sensor_Count : Natural := 0;
   Initialized  : Boolean := False;

   -- ...
end Sensors;
```

Simple but limited control over initialization order. This works well for simple cases but can lead to problems in complex systems.

#### 3.5.1.2 Explicit Initialization Procedure

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

Gives complete control over initialization sequence. This is ideal for systems where initialization order matters.

### 3.5.2 Advanced Initialization Control

#### 3.5.2.1 Elaboration Control Pragmas

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

Directs the compiler to ensure proper elaboration order. `Elaborate_Body` ensures the package body is elaborated before any references to the package, and `Elaborate_All` ensures all child packages are elaborated.

#### 3.5.2.2 Elaboration Checks

Enable runtime elaboration checks:

```bash
gnatmake -gnatE your_program.adb
```

This compiles with elaboration checks that detect:

- Calling subprograms before elaboration
- Circular dependencies
- Missing elaboration pragmas

For example, if you try to call a function from a package that hasn't been elaborated, Ada will raise a `Program_Error` at runtime.

#### 3.5.2.3 Initialization with Contracts

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

Contracts document and verify initialization requirements. The `Initializes` aspect specifies which variables are initialized by the package, and the contracts ensure proper initialization sequence.

### 3.5.3 The Initialization Order Problem

In many languages, global variable initialization order is undefined or implementation-dependent. This caused the Ariane 5 rocket failure. Ada provides multiple solutions:

#### 3.5.3.1 Problem

- Package A depends on Package B
- But Package B initializes after Package A
- Results in undefined behavior

#### 3.5.3.2 Solutions

- Use `pragma Elaborate`/`Elaborate_All`
- Use explicit initialization procedures
- Compile with elaboration checks (`-gnatE`)
- Use the `with` clause dependency graph

For reliable systems, all four approaches should be used together to ensure reliable initialization. For example, in a home automation system:

```ada
package Home_Automation is
   pragma Elaborate_Body;
   -- ...
end Home_Automation;

package Home_Automation.Sensors is
   pragma Elaborate_All (Home_Automation);
   -- ...
end Home_Automation.Sensors;
```

This ensures that the main package is elaborated before any sensor operations, preventing initialization order issues.

## 3.6 Real-World Package Design Patterns

Let's explore two practical examples of package design that demonstrate Ada's modular capabilities without focusing on safety-critical domains.

### 3.6.1 Home Climate Control System

A robust climate control package for home automation:

```ada
package Climate_Control is

   -- Public types with constraints
   subtype Temperature is Float range -20.0..50.0;
   subtype Humidity is Float range 0.0..100.0;

   -- State management
   function Is_Ready return Boolean;
   procedure Initialize with
      Pre  => not Is_Ready,
      Post => Is_Ready;

   -- Climate operations with contracts
   procedure Set_Target_Temp (
      Temp : Temperature) with
      Pre  => Is_Ready,
      Post => Target_Temperature = Temp;

   function Get_Current_Temp return Temperature with
      Pre => Is_Ready;

   procedure Set_Target_Humidity (
      Humidity : Humidity) with
      Pre  => Is_Ready,
      Post => Target_Humidity = Humidity;

private
   -- Implementation details hidden
   Target_Temperature : Temperature := 22.0;
   Target_Humidity : Humidity := 45.0;
   Ready : Boolean := False;

end Climate_Control;
```

This pattern combines strong typing, contracts, and information hiding for maximum reliability. Clients can't set temperatures outside the valid range, and they can't access the system before it's initialized. The private implementation details are hidden, so clients only interact with the public interface.

### 3.6.2 Smart Home Lighting Control

A lighting control system for home automation:

```ada
package Lighting_Control is

   -- Safety-critical types
   subtype Brightness is Natural range 0..100;
   subtype Color_Temperature is Natural range 2000..6500; -- Kelvin

   -- System state
   type Operating_Mode is (Off, Dimmed, Normal, Bright);
   function Current_Mode return Operating_Mode;

   -- Control operations with strict contracts
   procedure Set_Mode (
      Mode : Operating_Mode) with
      Pre  => Mode in Operating_Mode,
      Post => Current_Mode = Mode;

   procedure Set_Brightness (
      Level : Brightness) with
      Pre  => Current_Mode in (Dimmed, Normal, Bright),
      Post => Brightness_Level = Level;

   procedure Set_Color_Temp (
      Temp : Color_Temperature) with
      Pre  => Current_Mode in (Normal, Bright),
      Post => Color_Temperature = Temp;

private
   -- Hidden implementation
   Mode : Operating_Mode := Off;
   Brightness_Level : Brightness := 0;
   Color_Temperature : Color_Temperature := 2700;

end Lighting_Control;
```

This implementation ensures safe state transitions and parameter validation. For example, you can't set color temperature when the lights are off, and brightness levels are always within valid ranges. The private implementation details are hidden, so clients interact only through the public interface.

## 3.7 Exercises: Building Robust Package Hierarchies

### 3.7.1 Exercise 1: Home Automation Sensor System

Design a package hierarchy for a home automation sensor system:

- Create a parent package for the sensor system
- Define child packages for temperature, humidity, and motion sensors
- Use private types to hide hardware-specific details
- Add contracts to ensure safe initialization and operation
- Verify that improper state transitions are impossible

**Challenge:** Prove that sensor readings cannot be accessed before system initialization.

#### 3.7.1.1 Solution Guidance

Start with the parent package:

```ada
package Home_Sensors is
   -- Public types
   subtype Sensor_ID is Positive range 1..20;
   
   -- Public operations
   procedure Initialize;
   function Is_Ready return Boolean;
   
   -- Child packages will extend this interface
end Home_Sensors;
```

Create child packages for different sensor types:

```ada
package Home_Sensors.Temperature is
   function Read_Temp (ID : Sensor_ID) return Temperature;
private
   -- Implementation details
   Last_Readings : array (Sensor_ID) of Temperature;
end Home_Sensors.Temperature;
```

Add contracts to ensure proper initialization:

```ada
function Read_Temp (ID : Sensor_ID) return Temperature with
   Pre  => Home_Sensors.Is_Ready,
   Post => Read_Temp in Temperature;
```

This ensures that `Read_Temp` can only be called after the system is initialized.

### 3.7.2 Exercise 2: Smart Home Lighting Control

Build a package structure for a home lighting control system:

- Design a package hierarchy with appropriate encapsulation
- Use private types for critical components
- Implement strict initialization protocols
- Add contracts to enforce safety properties
- Structure the system for modular verification

**Challenge:** Create a verification plan showing how each safety requirement is enforced through package design.

#### 3.7.2.1 Solution Guidance

Create a parent package for the lighting system:

```ada
package Home_Lighting is
   -- Public types
   subtype Brightness is Natural range 0..100;
   subtype Color_Temp is Natural range 2000..6500;
   
   -- Public operations
   procedure Initialize;
   function Is_Ready return Boolean;
   
   -- Child packages
end Home_Lighting;
```

Create child packages for different lighting types:

```ada
package Home_Lighting.Dimmable is
   procedure Set_Brightness (Level : Brightness) with
      Pre  => Home_Lighting.Is_Ready and Level in Brightness;
      
   procedure Set_Color_Temp (Temp : Color_Temp) with
      Pre  => Home_Lighting.Is_Ready and Temp in Color_Temp;
      
private
   -- Implementation details
end Home_Lighting.Dimmable;
```

Add contracts to prevent invalid operations:

```ada
procedure Set_Color_Temp (Temp : Color_Temp) with
   Pre  => Home_Lighting.Is_Ready and Temp in Color_Temp and
           Current_Mode in (Normal, Bright),
   Post => Color_Temperature = Temp;
```

This ensures that color temperature can only be set when the lights are in a mode that supports it.

### 3.7.3 Package Design Verification Strategy

1. **Structure verification:** Check package hierarchy against requirements
2. **Visibility verification:** Ensure proper information hiding
3. **Dependency verification:** Analyze and minimize coupling
4. **Initialization verification:** Confirm safe startup sequences
5. **Contract verification:** Prove design-by-contract properties
6. **Integration verification:** Test package interactions

For highest reliability, all six verification steps are required to demonstrate proper package design.

## 3.8 Next Steps: Design by Contract

Now that you've mastered Ada's subprogram and package system, you're ready to explore how to specify precise behavioral requirements directly in your code. In the next tutorial, we'll dive into Design by Contract—Ada 2012's powerful feature for building verifiable systems. You'll learn how to:

### 3.8.1 Upcoming: Design by Contract

- Specify preconditions and postconditions
- Use type invariants to protect data integrity
- Combine contracts with strong typing for maximum safety
- Transition from runtime checks to formal verification
- Apply contracts to real-world scenarios

### 3.8.2 Practice Challenge

Enhance your home automation system with contracts:

- Add preconditions to prevent invalid sensor operations
- Define postconditions for sensor readings
- Create invariants for system state consistency
- Document the safety properties your contracts enforce
- Verify that your contracts prevent known failure modes

#### 3.8.2.1 The Path to Verified Systems

Ada's subprogram and package system provides the structural foundation for building reliable software, but contracts provide the semantic precision needed for verification. When combined with strong typing and formal methods, these features create a pathway from traditional development to mathematically verified software.

This integrated approach is why Ada remains the language of choice for systems where reliability and correctness matter. As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just less error-prone, but _provably correct_ within its specified domain.

