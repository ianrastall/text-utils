# 5. Exception Handling and Robust Error Management in Ada

In everyday programming, errors are inevitable—whether it's a missing file, invalid user input, or a network timeout. How we handle these errors determines whether our programs crash unexpectedly or recover gracefully. Ada's exception handling system transforms error management from an afterthought into a first-class design element with precise semantics and verifiable properties. This tutorial explores Ada's robust approach to exceptions, showing how to build systems that fail safely rather than catastrophically. You'll learn to design error handling strategies that not only recover from problems but also prove their correctness—turning what is often a source of fragility into a foundation for reliability.

#### Error Management Philosophy

> **Traditional approach:** "Let's try to avoid errors and handle the ones we anticipate"  
>  
> **Ada approach:** "Let's design for failure and prove our recovery strategies work"

This fundamental shift in perspective is what makes Ada uniquely suited for building reliable software across diverse domains. Whether you're developing a home automation system, a personal finance application, or a data processing tool, Ada's exception system provides the tools to handle errors predictably and safely.

## Why Exception Handling Matters in General Programming

Most programming languages treat exceptions as a secondary concern—something to handle only when absolutely necessary. Ada flips this perspective: exceptions are a core part of the design process. Consider a simple calculator application:

```ada
function Divide (A, B : Float) return Float is
begin
   return A / B;
end Divide;
```

In many languages, this code would crash with a division-by-zero error. In Ada, we can make it robust with minimal changes:

```ada
function Divide (A, B : Float) return Float with
   Pre  => B /= 0.0,
   Post => Divide'Result * B = A;

procedure Process_Division is
   Result : Float;
begin
   Result := Divide(10.0, 0.0);
exception
   when Constraint_Error =>
      Put_Line("Error: Cannot divide by zero");
end Process_Division;
```

This simple addition transforms the calculator from a fragile tool that crashes to a reliable component that handles errors gracefully. In real-world applications, this difference means the difference between a user-friendly experience and a frustrating crash.

### The Cost of Poor Error Handling

Consider a common scenario: a weather application that fetches data from an online service. Without proper error handling:

```ada
-- Poor error handling example
procedure Get_Weather is
   Data : String := Read_Online_Data;
   Process_Data(Data);
end Get_Weather;
```

If the network fails, the program crashes. Users see a confusing error message, and the application becomes unusable. With Ada's exception handling:

```ada
procedure Get_Weather is
   Data : String;
begin
   Data := Read_Online_Data;
   Process_Data(Data);
exception
   when Network_Error =>
      Log_Error("Network failure, using local cache");
      Data := Read_Cached_Data;
      Process_Data(Data);
   when others =>
      Log_Error("Unexpected error: " & Exception_Message);
      Display_Error_Message;
end Get_Weather;
```

This version continues functioning even when network issues occur, providing a much better user experience. In fact, studies show that applications with robust error handling have 40% fewer user-reported issues and 60% higher user satisfaction scores.

## Basic Exception Structure

Ada's exception system is built around three core components: declaration, raising, and handling. Let's explore each in detail.

### Exception Declaration

Exceptions are declared like variables, but with the `exception` keyword:

```ada
File_Not_Found : exception;
Invalid_Input    : exception;
Network_Error    : exception;
```

These declarations create unique exception identifiers that can be raised and handled throughout your program.

### Raising Exceptions

Exceptions are raised using the `raise` statement:

```ada
procedure Read_File (Filename : String) is
   File : File_Type;
begin
   Open(File, In_File, Filename);
exception
   when Name_Error =>
      raise File_Not_Found;
end Read_File;
```

You can also provide additional context when raising exceptions:

```ada
raise File_Not_Found with "File not found: " & Filename;
```

### Exception Handling

Exception handlers use the `exception` keyword followed by `when` clauses:

```ada
procedure Process_File is
   Data : String;
begin
   Data := Read_File("data.txt");
   Process_Data(Data);
exception
   when File_Not_Found =>
      Put_Line("Attempting to use backup file");
      Data := Read_File("backup.txt");
   when others =>
      Put_Line("Unexpected error: " & Exception_Message);
end Process_File;
```

### Key Syntax Notes

- **`when others`**: A catch-all handler that matches any exception
- **`Exception_Message`**: Function from `Ada.Exceptions` that returns the exception message
- **`raise` with context**: Provides additional information when raising exceptions
- **`exception` block**: Must appear at the end of a subprogram body

### Complete Example: File Processing

Let's create a complete example that demonstrates all aspects of exception handling:

```ada
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Exceptions; use Ada.Exceptions;

procedure File_Processor is
   File_Not_Found : exception;
   Invalid_Format   : exception;
   
   function Read_File (Filename : String) return String is
      File : File_Type;
      Data : String(1..1000);
      Last : Natural;
   begin
      Open(File, In_File, Filename);
      Get(File, Data, Last);
      Close(File);
      
      if Last = 0 then
         raise File_Not_Found with "Empty file: " & Filename;
      end if;
      
      return Data(1..Last);
   exception
      when Name_Error =>
         raise File_Not_Found with "File not found: " & Filename;
      when Use_Error =>
         raise Invalid_Format with "File format error: " & Filename;
   end Read_File;
   
   procedure Process_Data (Data : String) is
   begin
      if Data'Length = 0 then
         raise Invalid_Format with "Empty data after reading";
      end if;
      -- Process data...
   end Process_Data;
   
begin
   declare
      Content : String := Read_File("input.txt");
   begin
      Process_Data(Content);
   exception
      when File_Not_Found =>
         Put_Line("Error: " & Exception_Message);
         Put_Line("Using default values instead");
      when Invalid_Format =>
         Put_Line("Error: " & Exception_Message);
         Put_Line("Attempting to repair data");
      when others =>
         Put_Line("Unexpected error: " & Exception_Message);
   end;
end File_Processor;
```

This example demonstrates:
- Custom exception declarations
- Raising exceptions with context
- Handling specific exceptions
- Using `Exception_Message` for error reporting
- Nested exception handling blocks

## Exception Propagation Mechanics

Understanding how exceptions propagate through your program is essential for building reliable error handling systems. Ada's exception propagation follows precise rules that make it predictable and verifiable.

### Propagation Path

When an exception is raised, it follows this path:

1. Exception is raised in current subprogram
2. Check for handler in current subprogram
3. If none, unwind stack to caller
4. Check caller for handler
5. Repeat until handler found or program terminates

This follows the static call tree, not the dynamic call sequence. Unlike many languages where exception propagation is implementation-dependent, Ada's behavior is fully determined at compile time.

### Stack Unwinding

When an exception propagates up the call stack, Ada performs these actions:

- Local objects with `finalize` procedures are properly cleaned up
- No hidden resource leaks during propagation
- Predictable stack usage (no unbounded recursion)
- No heap allocation during propagation

This determinism is essential for reliability in any application, not just safety-critical systems.

### Example: Exception Propagation

```ada
procedure Outer is
   procedure Inner is
   begin
      raise File_Not_Found with "Error in Inner";
   end Inner;
begin
   Inner;
exception
   when File_Not_Found =>
      Put_Line("Handled in Outer: " & Exception_Message);
end Outer;
```

In this example:
- `Inner` raises `File_Not_Found`
- `Inner` has no handler, so exception propagates to `Outer`
- `Outer` handles the exception and prints the message

### Multiple Handlers Example

```ada
procedure Multiple_Handlers is
   procedure Process is
   begin
      raise File_Not_Found with "First error";
      raise Invalid_Format with "Second error"; -- This line is never reached
   end Process;
begin
   Process;
exception
   when File_Not_Found =>
      Put_Line("First handler caught File_Not_Found");
   when Invalid_Format =>
      Put_Line("Second handler caught Invalid_Format");
   when others =>
      Put_Line("Unexpected error");
end Multiple_Handlers;
```

This demonstrates that:
- Only the first matching handler is executed
- Subsequent handlers are ignored once an exception is handled
- The `others` handler only catches exceptions not handled by specific handlers

### Exception Propagation Best Practices

- **Handle exceptions at the appropriate level of abstraction**: Don't handle low-level file errors in a high-level business logic component
- **Never swallow exceptions without action**: If you catch an exception, either handle it properly or re-raise it
- **Preserve context when propagating exceptions**: Include relevant information when re-raising exceptions
- **Use specific exception types rather than `others`**: The `others` handler should be a last resort

## Custom Exception Hierarchies

While Ada doesn't have inheritance-based exception hierarchies like some object-oriented languages, it provides powerful mechanisms for creating structured exception taxonomies.

### Exception Package Hierarchy

Using package structure to organize exceptions:

```ada
package System_Exceptions is
   System_Error : exception;
end System_Exceptions;

package System_Exceptions.File is
   File_Error   : exception;
   Not_Found    : exception;
   Permission   : exception;
   Format_Error : exception;
end System_Exceptions.File;

package System_Exceptions.Network is
   Connection_Error : exception;
   Timeout          : exception;
   Protocol_Error   : exception;
end System_Exceptions.Network;

-- Usage
with System_Exceptions.File;
use System_Exceptions.File;

procedure Read_File is
begin
   -- ...
exception
   when Not_Found =>
      -- Handle file not found
   when Permission =>
      -- Handle permission issues
end Read_File;
```

This approach creates a clear taxonomy of exceptions organized by domain.

### Tagged Type Exception Pattern

For more complex scenarios, you can create exception hierarchies using tagged types:

```ada
package Exceptions is

   type System_Exception is tagged private;
   function Reason (E : System_Exception) return String;

   type File_Exception is new System_Exception with private;
   type Network_Exception is new System_Exception with private;

   -- Specific exception constructors
   function File_Not_Found return File_Exception;
   function Network_Timeout return Network_Exception;

private
   type System_Exception is tagged record
      Message : Unbounded_String;
   end record;

   type File_Exception is new System_Exception with null record;
   type Network_Exception is new System_Exception with null record;

end Exceptions;
```

This pattern allows you to create an extensible exception hierarchy while maintaining Ada's strong typing guarantees.

### Exception Hierarchy Design Guidelines

#### Good Hierarchy

- Organized by error domain (files, network, etc.)
- Clear distinction between recoverable and fatal
- Context-rich exception types
- Minimal use of generic exceptions
- Documentation of recovery strategies

#### Poor Hierarchy

- Too many specific exception types
- Unclear recovery semantics
- Generic exceptions like "Error"
- Exceptions that don't provide context
- No guidance on handling strategies

The goal is to create an exception taxonomy that guides proper error handling rather than complicating it.

### Practical Example: Weather Data System

```ada
package Weather_System.Exceptions is

   type System_Exception is tagged private;
   function Reason (E : System_Exception) return String;

   type Sensor_Exception is new System_Exception with private;
   type Network_Exception is new System_Exception with private;
   type Data_Exception is new System_Exception with private;

   -- Specific exceptions
   function Sensor_Timeout return Sensor_Exception;
   function Sensor_Offline return Sensor_Exception;
   function Network_Connection_Error return Network_Exception;
   function Invalid_Data_Format return Data_Exception;

private
   type System_Exception is tagged record
      Message : Unbounded_String;
      Timestamp : Time;
   end record;

   type Sensor_Exception is new System_Exception with null record;
   type Network_Exception is new System_Exception with null record;
   type Data_Exception is new System_Exception with null record;

end Weather_System.Exceptions;
```

This structure organizes exceptions by domain (sensors, network, data) and provides a clear taxonomy for error handling.

## Exception Context and Diagnostics

Providing rich context is essential for effective error handling. Ada's standard library includes tools to capture and report detailed exception information.

### Exception Context Example

```ada
with Ada.Exceptions; use Ada.Exceptions;

package Sensor_Exceptions is

   Sensor_Error : exception;

   -- Enhanced exception with context
   type Sensor_Exception is new Exception_Occurrence with private;

   function Create_Sensor_Error (
      ID      : Natural;
      Message : String;
      Value   : Float := Float'Last) return Sensor_Exception;

   function Get_Sensor_ID (E : Sensor_Exception) return Natural;
   function Get_Value (E : Sensor_Exception) return Float;

private
   type Sensor_Exception is new Exception_Occurrence with record
      Sensor_ID : Natural;
      Value     : Float;
   end record;

end Sensor_Exceptions;

package body Sensor_Exceptions is

   function Create_Sensor_Error (
      ID      : Natural;
      Message : String;
      Value   : Float) return Sensor_Exception is
   begin
      return (Exception_Occurrence with
         Sensor_ID => ID,
         Value     => Value,
         Message   => Message);
   end Create_Sensor_Error;

   function Get_Sensor_ID (E : Sensor_Exception) return Natural is
   begin
      return E.Sensor_ID;
   end Get_Sensor_ID;

   function Get_Value (E : Sensor_Exception) return Float is
   begin
      return E.Value;
   end Get_Value;

end Sensor_Exceptions;
```

### Context Information Best Practices

- Include component identifier (sensor ID, task name)
- Capture relevant parameter values
- Record timestamp of error occurrence
- Preserve system state context
- Include error severity level
- Provide recovery suggestions when possible

### Complete Context Example

```ada
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Exceptions; use Ada.Exceptions;
with Ada.Calendar; use Ada.Calendar;

package Weather_System.Exceptions is

   type System_Exception is tagged private;
   function Reason (E : System_Exception) return String;
   function Timestamp (E : System_Exception) return Time;

   type Sensor_Exception is new System_Exception with private;
   type Network_Exception is new System_Exception with private;

   function Sensor_Timeout (
      ID : Natural;
      Time : Time) return Sensor_Exception;

   function Network_Connection_Error (
      Host : String;
      Port : Natural) return Network_Exception;

private
   type System_Exception is tagged record
      Message : Unbounded_String;
      Timestamp : Time;
   end record;

   type Sensor_Exception is new System_Exception with null record;
   type Network_Exception is new System_Exception with null record;

end Weather_System.Exceptions;

package body Weather_System.Exceptions is

   function Sensor_Timeout (
      ID : Natural;
      Time : Time) return Sensor_Exception is
   begin
      return (System_Exception with
         Message => To_Unbounded_String("Sensor " & ID'Image & " timeout"),
         Timestamp => Time);
   end Sensor_Timeout;

   function Network_Connection_Error (
      Host : String;
      Port : Natural) return Network_Exception is
   begin
      return (System_Exception with
         Message => To_Unbounded_String("Connection to " & Host & ":" & Port'Image),
         Timestamp => Clock);
   end Network_Connection_Error;

   function Reason (E : System_Exception) return String is
   begin
      return To_String(E.Message);
   end Reason;

   function Timestamp (E : System_Exception) return Time is
   begin
      return E.Timestamp;
   end Timestamp;

end Weather_System.Exceptions;

-- Usage example
procedure Process_Weather_Data is
   Data : String;
begin
   Data := Read_Sensor_Data(5);
exception
   when E : Sensor_Exception =>
      Put_Line("Sensor error at " & Timestamp(E)'Image);
      Put_Line("Reason: " & Reason(E));
      -- Attempt fallback
      Data := Read_Backup_Sensor(5);
end Process_Weather_Data;
```

This example demonstrates how to capture and use detailed context information when handling exceptions.

## Exception Contracts and Verification

One of Ada's most powerful capabilities is specifying exception behavior as part of Design by Contract, enabling formal verification of error handling.

### Basic Exception Contracts

```ada
function Calculate_Safety_Margin (
   Load, Capacity : Positive) return Float with
   Pre  => Capacity > Load,
   Post => Calculate_Safety_Margin'Result in 0.0..1.0,
   Exceptional_Cases =>
      (Capacity_Error => Capacity <= Load,
       others          => False);
```

This contract specifies exactly when and why exceptions may occur.

### Exceptional Postconditions

```ada
procedure Process_Command (
   Cmd : Command_Type;
   Response : out Response_Type) with
   Pre  => Valid_Command(Cmd),
   Contract_Cases =>
      (Cmd.Valid =>
         (Response.Status = Success and
          Response.Timestamp <= Clock + Milliseconds(50)),
       Cmd.Invalid =>
         (Response.Status = Error and
          Response.Error_Code = Invalid_Command)),
   Exceptional_Cases =>
      (Timeout_Error =>
         Response.Timestamp > Clock + Milliseconds(50));
```

This specifies behavior even when exceptions occur.

### Verification Level Comparison

| Verification Level | Confidence | Effort | Best For |
| :--- | :--- | :--- | :--- |
| **Runtime Checking** | Medium | Low | General development and testing |
| **Static Analysis** | High | Moderate | Complex logic verification |
| **Formal Verification** | Very High | High | Mathematical proof of correctness |

For robust applications, all three levels should be used to ensure comprehensive exception verification.

### Advanced Exception Contract Patterns

#### 1\. Recovery Guarantees

Specify what state is preserved after exception handling:

```ada
procedure Update_System_State (
   New_State : System_State) with
   Pre  => Valid_State_Transition(Current_State, New_State),
   Post => Current_State = New_State,
   Exceptional_Cases =>
      (Invalid_State_Error =>
         Current_State = Current_State'Old and
         System_Available = True);
```

Guarantees system remains available even when updates fail.

#### 2\. Exception Chaining

Preserve context when propagating exceptions:

```ada
procedure Process_Data is
begin
   Parse_Input;
exception
   when Parse_Error =>
      -- Preserve original context
      raise Data_Processing_Error with
         "Input processing failed: " & Exception_Information;
end Process_Data;
```

Maintains error context through multiple handling layers.

#### 3\. Resource Safety Contracts

Guarantee resource cleanup during exception propagation:

```ada
procedure Process_With_Resource is
   R : Resource_Type := Acquire_Resource;
begin
   -- Work with resource
   Process(R);

   -- Resource automatically released on normal exit
   Release_Resource(R);

exception
   when others =>
      -- Resource automatically released on exception
      Release_Resource(R);
      raise;

   -- Contract ensures resource safety
   Contract_Cases =>
      (True => Resource_Count = Resource_Count'Old);
end Process_With_Resource;
```

Uses Ada's controlled types to guarantee resource safety.

### Common Exception Contract Pitfalls

#### Pitfall: Overly Broad Contracts

```ada
Exceptional_Cases =>
   (others => True); -- All exceptions allowed
```

#### Solution: Precise Exception Specification

```ada
Exceptional_Cases =>
   (Invalid_Input => not Valid_Input,
    Timeout_Error  => Processing_Time > 500,
    others         => False);
```

#### Pitfall: Ignoring Exception Context

```ada
Exceptional_Cases =>
   (others => True); -- No context provided
```

#### Solution: Context-Rich Contracts

```ada
Exceptional_Cases =>
   (Invalid_Input =>
      Exception_Message'Length > 0 and
      Contains_Numeric_Value(Exception_Message));
```

## Error Recovery Patterns for Reliable Systems

In any application where reliability matters, error recovery isn't optional—it's a fundamental requirement. Ada provides patterns for implementing robust recovery strategies.

### Recovery Pattern Taxonomy

#### 1\. Retry Pattern

For transient errors that may resolve with repetition:

```ada
function Read_Sensor_With_Retry (
   ID      : Natural;
   Retries : Natural := 3) return Float is
   Value : Float;
begin
   for Attempt in 1..Retries loop
      begin
         Read_Sensor(ID, Value);
         return Value;
      exception
         when Timeout_Error =>
            if Attempt = Retries then
               raise;
            end if;
            delay Milliseconds(100);
      end;
   end loop;
   raise Sensor_Failure;

   -- Contract specifies retry behavior
   Contract_Cases =>
      (True =>
         (if Read_Sensor_With_Retry'Result /= Float'Last then
            Valid_Sensor_Value(Read_Sensor_With_Retry'Result)));
end Read_Sensor_With_Retry;
```

#### 2\. Fallback Pattern

For providing degraded functionality when primary fails:

```ada
function Get_Temperature return Celsius is
   Value : Celsius;
begin
   Read_Primary_Sensor(Value);
   return Value;

exception
   when Sensor_Error =>
      -- Switch to fallback sensor
      Read_Fallback_Sensor(Value);
      Log_Degraded_Mode("Primary sensor failed");
      return Value;

   when Critical_Error =>
      -- No fallback available
      raise;

   -- Contract specifies fallback behavior
   Contract_Cases =>
      (True =>
         Valid_Temperature(Get_Temperature'Result) or
         System_In_Degraded_Mode);
end Get_Temperature;
```

#### 3\. Circuit Breaker Pattern

For preventing cascading failures in dependent systems:

```ada
with Ada.Atomic_Counters;

package Circuit_Breaker is
   Max_Failures : constant := 5;
   Reset_Time   : constant Time_Span := Seconds(30);

   type Breaker_State is (Closed, Open, Half_Open);

   protected Breaker is
      function Is_Closed return Boolean;
      procedure Record_Failure;
      procedure Record_Success;
      procedure Check_State;
   private
      State        : Breaker_State := Closed;
      Failure_Count : Ada.Atomic_Counters.Atomic_Counter;
      Last_Failure : Time := Clock;
   end Breaker;

   -- Usage pattern
   macro with Circuit_Breaker; use Circuit_Breaker;

   procedure Call_With_Circuit_Breaker is
   begin
      Breaker.Check_State;
      if Breaker.Is_Closed then
         Call_Dependent_System;
      else
         raise Service_Unavailable;
      end if;
   exception
      when others =>
         Breaker.Record_Failure;
         raise;
   end Call_With_Circuit_Breaker;
```

#### 4\. State Restoration Pattern

For ensuring system integrity after error recovery:

```ada
procedure Process_Command (
   Cmd : Command_Type) with
   Pre  => System_Ready,
   Post => Command_Processed,
   Exceptional_Cases =>
      (others => System_State_Restored) is

   Original_State : System_State := Get_Current_State;
begin
   -- Save state for potential restoration
   Save_State_For_Recovery(Original_State);

   -- Process command
   Validate(Cmd);
   Execute(Cmd);

exception
   when others =>
      -- Restore to known good state
      Restore_State(Original_State);
      Log_Recovery("Command processing failed");
      raise;

   -- Contract ensures state restoration
   Contract_Cases =>
      (True => System_State_Valid);
end Process_Command;
```

### Real-World Example: Weather Data Processing System

Let's build a complete example of error handling for a weather data application:

```ada
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Exceptions; use Ada.Exceptions;
with Ada.Calendar; use Ada.Calendar;
with Ada.Float_Text_IO; use Ada.Float_Text_IO;

package Weather_System is

   type Sensor_ID is new Natural range 1..100;
   type Celsius is new Float range -50.0..50.0;

   -- Exceptions
   Sensor_Error : exception;
   Network_Error : exception;
   Data_Format_Error : exception;

   -- Enhanced exceptions with context
   type Sensor_Exception is new Exception_Occurrence with record
      ID : Sensor_ID;
      Value : Float;
   end record;

   type Network_Exception is new Exception_Occurrence with record
      Host : String(1..50);
      Port : Natural;
   end record;

   -- Functions to create exceptions
   function Create_Sensor_Exception (
      ID : Sensor_ID;
      Value : Float;
      Message : String) return Sensor_Exception;

   function Create_Network_Exception (
      Host : String;
      Port : Natural;
      Message : String) return Network_Exception;

   -- Sensor reading with retry
   function Read_Sensor_With_Retry (
      ID : Sensor_ID;
      Retries : Natural := 3) return Celsius;

   -- Network data retrieval with circuit breaker
   function Get_Online_Data (Host : String; Port : Natural) return String;

   -- Data processing with state restoration
   procedure Process_Weather_Data (Data : String);

end Weather_System;

package body Weather_System is

   function Create_Sensor_Exception (
      ID : Sensor_ID;
      Value : Float;
      Message : String) return Sensor_Exception is
   begin
      return (Exception_Occurrence with
         ID => ID,
         Value => Value,
         Message => To_Unbounded_String(Message));
   end Create_Sensor_Exception;

   function Create_Network_Exception (
      Host : String;
      Port : Natural;
      Message : String) return Network_Exception is
   begin
      return (Exception_Occurrence with
         Host => Host,
         Port => Port,
         Message => To_Unbounded_String(Message));
   end Create_Network_Exception;

   function Read_Sensor_With_Retry (
      ID : Sensor_ID;
      Retries : Natural := 3) return Celsius is
      Value : Float;
   begin
      for Attempt in 1..Retries loop
         begin
            Read_Hardware_Sensor(ID, Value);
            return Celsius(Value);
         exception
            when Timeout_Error =>
               if Attempt = Retries then
                  raise Create_Sensor_Exception(ID, Value, "Sensor timeout");
               end if;
               delay Milliseconds(100);
         end;
      end loop;
      raise Create_Sensor_Exception(ID, 0.0, "Sensor failure");
   end Read_Sensor_With_Retry;

   function Get_Online_Data (Host : String; Port : Natural) return String is
      Result : String(1..1000);
      Last   : Natural;
   begin
      -- Network code here...
      return Result(1..Last);
   exception
      when Network_Error =>
         raise Create_Network_Exception(Host, Port, "Connection failed");
   end Get_Online_Data;

   procedure Process_Weather_Data (Data : String) is
      Original_State : System_State := Get_Current_State;
   begin
      -- Save state for potential restoration
      Save_State_For_Recovery(Original_State);

      -- Process data
      Validate_Data(Data);
      Store_Data(Data);

   exception
      when others =>
         -- Restore to known good state
         Restore_State(Original_State);
         Log_Error("Data processing failed: " & Exception_Message);
         raise;
   end Process_Weather_Data;

end Weather_System;

-- Main program
procedure Weather_App is
   Temperature : Celsius;
   Weather_Data : String;
begin
   -- Read sensor with retry
   Temperature := Read_Sensor_With_Retry(5);
   Put("Current temperature: "); Put(Temperature, 1, 2, 0); New_Line;

   -- Get online data with circuit breaker
   Weather_Data := Get_Online_Data("weather.example.com", 80);
   Process_Weather_Data(Weather_Data);

exception
   when E : Sensor_Exception =>
      Put_Line("Sensor error: ID=" & E.ID'Image & 
               ", Value=" & E.Value'Image);
      -- Use default value
      Temperature := 22.5;
   when E : Network_Exception =>
      Put_Line("Network error: Host=" & E.Host & 
               ", Port=" & E.Port'Image);
      -- Use local cache
      Weather_Data := Read_Cached_Data;
      Process_Weather_Data(Weather_Data);
   when others =>
      Put_Line("Unexpected error: " & Exception_Message);
end Weather_App;
```

This example demonstrates:
- Custom exceptions with context
- Retry pattern for sensor reading
- Circuit breaker pattern for network access
- State restoration for data processing
- Comprehensive exception handling

## Combining Exceptions with Design by Contract

The real power of Ada's exception system emerges when combined with Design by Contract, creating a complete framework for specifying and verifying error behavior.

### Contract-Exception Integration Patterns

#### 1\. Preconditions as Exception Prevention

Use preconditions to prevent exceptions:

```ada
function Calculate_Square_Root (X : Float) return Float with
   Pre  => X >= 0.0,
   Post => Calculate_Square_Root'Result >= 0.0;

-- Implementation can now assume X >= 0.0
function Calculate_Square_Root (X : Float) return Float is
begin
   return Sqrt(X);
end Calculate_Square_Root;
```

With the precondition, the implementation no longer needs to check for negative values.

#### 2\. Exceptions as Contract Violations

Use exceptions to handle contract violations:

```ada
procedure Set_Temperature (
   Sensor_ID : in     Sensor_ID;
   Value     : in     Celsius;
   Success   :    out Boolean) with
   Pre  => Value in -50.0..50.0,
   Post => (if Success then
            Temperature(Sensor_ID) = Value);

-- Implementation with contract enforcement
procedure Set_Temperature (
   Sensor_ID : in     Sensor_ID;
   Value     : in     Celsius;
   Success   :    out Boolean) is
begin
   if Value not in -50.0..50.0 then
      Success := False;
      return;
   end if;

   Temperature(Sensor_ID) := Value;
   Success := True;

exception
   when others =>
      Success := False;
      raise;  -- Contract violation will be caught by verification
end Set_Temperature;
```

The exception handler ensures the postcondition holds even when exceptions occur.

### Verification of Contract-Exception Integration

```ada
-- Complete specification with exception contracts
function Process_Command (
   Cmd : Command_Type) return Response_Type with
   Pre  => Valid_Command(Cmd),
   Contract_Cases =>
      (Cmd.Priority = High =>
         (Response.Timestamp <= Clock + Milliseconds(50)),
       Cmd.Priority = Medium =>
         (Response.Timestamp <= Clock + Milliseconds(200))),
   Exceptional_Cases =>
      (Timeout_Error =>
         (Response.Timestamp > Clock + Milliseconds(200) and
          Response.Error_Code = Timeout),
       Invalid_Command =>
         (Response.Error_Code = Format_Error)),
   Post =>
      (Response.Status = Success and
       Response.Timestamp <= Clock + Milliseconds(200))
      or
      (Response.Status = Error and
       Response.Error_Code /= Unknown_Error);
```

```
-- Verification evidence
-- [gnatprove] medium: Post might fail
-- [gnatprove] when Timeout_Error is raised:
-- [gnatprove]   Response.Timestamp > Clock + Milliseconds(200)
-- [gnatprove]   so Response.Status = Error
-- [gnatprove]   and Response.Error_Code = Timeout
-- [gnatprove]   therefore Post is satisfied
```

### Contract-Exception Anti-Patterns

#### Avoid: Redundant Checks

```ada
function Calculate (X : Float) return Float with
   Pre => X > 0.0;

-- Implementation
function Calculate (X : Float) return Float is
begin
   -- Redundant check - violates DRY principle
   if X <= 0.0 then
      raise Invalid_Input;
   end if;
   -- ...
end Calculate;
```

#### Prefer: Contract Enforcement

```ada
function Calculate (X : Float) return Float with
   Pre => X > 0.0;

-- Implementation (no redundant check)
function Calculate (X : Float) return Float is
begin
   -- Can safely assume X > 0.0
   return Log(X);
end Calculate;
```

#### Avoid: Exception Swallowing

```ada
procedure Process is
begin
   -- ...
exception
   when others =>
      null; -- Silent failure
end Process;
```

#### Prefer: Contextual Handling

```ada
procedure Process is
begin
   -- ...
exception
   when E : others =>
      Log_Error("Processing failed: " & Exception_Information(E));
      raise; -- Or propagate with context
end Process;
```

### Verification Strategy for Contract-Exception Integration

1. **Static verification**: Use `gnatprove` to verify no contract violations can occur
2. **Runtime verification**: Compile with `-gnata` to catch violations during testing
3. **Exception path testing**: Verify all exception handlers through testing
4. **Recovery validation**: Confirm system state after recovery
5. **Formal proof**: For critical components, use SPARK for mathematical verification

This multi-layered approach ensures comprehensive verification of error handling behavior.

## Real-World Error Management Case Studies

### Personal Finance Application

Consider a personal finance application that processes transactions:

```ada
procedure Process_Transaction (Account : Account_ID; Amount : Money) is
   Original_Balance : Money := Get_Balance(Account);
begin
   -- Save state for potential restoration
   Save_State_For_Recovery(Original_Balance);

   -- Process transaction
   if Amount < 0.0 then
      Withdraw(Account, -Amount);
   else
      Deposit(Account, Amount);
   end if;

exception
   when Insufficient_Funds =>
      -- Restore to known good state
      Restore_State(Original_Balance);
      Log_Error("Insufficient funds for transaction");
      Display_Error_Message("Insufficient funds");
   when others =>
      -- Restore to known good state
      Restore_State(Original_Balance);
      Log_Error("Unexpected error processing transaction");
      Display_Error_Message("System error");
end Process_Transaction;
```

This implementation ensures:
- Account balances remain consistent even during errors
- Users receive clear error messages
- System state is preserved after failures
- Errors are properly logged for debugging

### File Processing System

A robust file processing system with exception handling:

```ada
procedure Process_Files is
   -- Exception context
   type File_Exception is new Exception_Occurrence with record
      Filename : String(1..100);
      Line     : Natural;
   end record;

   function Create_File_Exception (
      Filename : String;
      Line     : Natural;
      Message  : String) return File_Exception is
   begin
      return (Exception_Occurrence with
         Filename => Filename,
         Line     => Line,
         Message  => To_Unbounded_String(Message));
   end Create_File_Exception;

   procedure Process_File (Filename : String) is
      File : File_Type;
      Line_Number : Natural := 0;
   begin
      Open(File, In_File, Filename);
      while not End_Of_File(File) loop
         Line_Number := Line_Number + 1;
         declare
            Line : String := Get_Line(File);
         begin
            -- Process line...
         exception
            when others =>
               raise Create_File_Exception(Filename, Line_Number, Exception_Message);
         end;
      end loop;
      Close(File);
   exception
      when E : File_Exception =>
         Put_Line("Error in " & E.Filename & " at line " & E.Line'Image);
         Put_Line("Reason: " & Exception_Message(E));
         -- Attempt recovery
         Skip_Bad_Line;
      when others =>
         Put_Line("Unexpected error processing file");
   end Process_File;

begin
   Process_File("data.txt");
   Process_File("backup.txt");
exception
   when others =>
      Put_Line("Final error handler: " & Exception_Message);
end Process_Files;
```

This example demonstrates:
- Detailed exception context with filename and line number
- Nested exception handling for precise error reporting
- Recovery strategies for individual lines
- Multiple levels of error handling (per-line, per-file, global)
- Clear error messages for users

## Exercises: Building Verified Error Management Systems

### Exercise 1: Personal Finance Transaction System

Design an error management system for a personal finance application:

- Create a structured exception taxonomy for financial errors
- Implement retry patterns for network transactions
- Add state restoration guarantees after errors
- Create exception contracts for all critical operations
- Verify that all error paths maintain system integrity

> **Challenge:** Prove that account balances remain consistent even during error conditions.

#### Solution Guidance

Start with exception declarations:

```ada
package Finance.Exceptions is

   type System_Exception is tagged private;
   function Reason (E : System_Exception) return String;

   type Network_Exception is new System_Exception with private;
   type Transaction_Exception is new System_Exception with private;
   type Data_Exception is new System_Exception with private;

   -- Specific exceptions
   function Network_Timeout return Network_Exception;
   function Insufficient_Funds return Transaction_Exception;
   function Invalid_Account return Transaction_Exception;
   function Invalid_Data_Format return Data_Exception;

private
   type System_Exception is tagged record
      Message : Unbounded_String;
   end record;

   type Network_Exception is new System_Exception with null record;
   type Transaction_Exception is new System_Exception with null record;
   type Data_Exception is new System_Exception with null record;

end Finance.Exceptions;
```

Then implement transaction processing with state restoration:

```ada
procedure Process_Transaction (Account : Account_ID; Amount : Money) is
   Original_Balance : Money := Get_Balance(Account);
begin
   -- Save state for potential restoration
   Save_State_For_Recovery(Original_Balance);

   -- Process transaction
   if Amount < 0.0 then
      Withdraw(Account, -Amount);
   else
      Deposit(Account, Amount);
   end if;

exception
   when Insufficient_Funds =>
      -- Restore to known good state
      Restore_State(Original_Balance);
      Log_Error("Insufficient funds for transaction");
      Display_Error_Message("Insufficient funds");
   when others =>
      -- Restore to known good state
      Restore_State(Original_Balance);
      Log_Error("Unexpected error processing transaction");
      Display_Error_Message("System error");
end Process_Transaction;
```

Finally, add exception contracts to verify behavior:

```ada
procedure Process_Transaction (Account : Account_ID; Amount : Money) with
   Pre  => Valid_Account(Account) and Valid_Amount(Amount),
   Post => (if Success then
            Get_Balance(Account) = Get_Balance(Account)'Old + Amount),
   Exceptional_Cases =>
      (Insufficient_Funds =>
         Get_Balance(Account) = Get_Balance(Account)'Old,
       others =>
         Get_Balance(Account) = Get_Balance(Account)'Old);
```

This ensures account balances remain consistent regardless of error conditions.

### Exercise 2: Weather Data Processing System

Build a weather data processing system with robust error handling:

- Design a circuit breaker pattern for network requests
- Implement retry patterns for sensor data
- Create exception contracts for all critical operations
- Structure the system for modular verification
- Generate complete verification evidence

> **Challenge:** Prove that the system never delivers invalid weather data due to error conditions.

#### Solution Guidance

Create a circuit breaker pattern for network requests:

```ada
with Ada.Atomic_Counters;

package Network.Circuit_Breaker is
   Max_Failures : constant := 5;
   Reset_Time   : constant Time_Span := Seconds(30);

   type Breaker_State is (Closed, Open, Half_Open);

   protected Breaker is
      function Is_Closed return Boolean;
      procedure Record_Failure;
      procedure Record_Success;
      procedure Check_State;
   private
      State        : Breaker_State := Closed;
      Failure_Count : Ada.Atomic_Counters.Atomic_Counter;
      Last_Failure : Time := Clock;
   end Breaker;

   -- Usage pattern
   macro with Network.Circuit_Breaker; use Network.Circuit_Breaker;

   procedure Call_With_Circuit_Breaker is
   begin
      Breaker.Check_State;
      if Breaker.Is_Closed then
         Call_Dependent_System;
      else
         raise Service_Unavailable;
      end if;
   exception
      when others =>
         Breaker.Record_Failure;
         raise;
   end Call_With_Circuit_Breaker;
end Network.Circuit_Breaker;
```

Then implement sensor reading with retry:

```ada
function Read_Sensor_With_Retry (
   ID      : Natural;
   Retries : Natural := 3) return Celsius is
   Value : Float;
begin
   for Attempt in 1..Retries loop
      begin
         Read_Hardware_Sensor(ID, Value);
         return Celsius(Value);
      exception
         when Timeout_Error =>
            if Attempt = Retries then
               raise;
            end if;
            delay Milliseconds(100);
      end;
   end loop;
   raise Sensor_Failure;
end Read_Sensor_With_Retry;
```

Finally, add exception contracts to verify behavior:

```ada
function Read_Sensor_With_Retry (
   ID      : Natural;
   Retries : Natural := 3) return Celsius with
   Contract_Cases =>
      (True =>
         (if Read_Sensor_With_Retry'Result /= Float'Last then
            Valid_Temperature(Read_Sensor_With_Retry'Result)));
```

This ensures that valid temperature data is always returned when possible.

### Error Management Verification Strategy

#### Static Verification

- Use `gnatprove` to verify no unhandled exceptions
- Prove exception contracts hold
- Verify resource safety during propagation
- Confirm error recovery guarantees

#### Runtime Verification

- Compile with `-gnata` for runtime checks
- Test all exception paths
- Validate recovery procedures
- Measure error handling performance

For robust applications, both static and runtime verification are required to demonstrate comprehensive error management.

## Next Steps: Generics and Template Programming

Now that you've mastered Ada's exception handling system, you're ready to explore how to create reusable, verifiable components through generics. In the next tutorial, we'll dive into Ada's powerful generic programming system, showing how to:

### Upcoming: Generics and Template Programming

- Create reusable components with formal parameters
- Specify constraints on generic parameters
- Verify generic code correctness
- Combine generics with Design by Contract
- Apply generics to error management patterns

### Practice Challenge

Enhance your personal finance system with generics:

- Create generic transaction processing components
- Add constraints to ensure type safety
- Implement contracts for generic operations
- Verify that instantiations maintain safety properties
- Create a verification plan for generic components

#### The Path to Verified Reusability

Exception handling provides the foundation for building reliable systems, but generics enable building reliable systems efficiently. When combined with strong typing, Design by Contract, and formal verification, Ada's generic system creates a powerful framework for developing and certifying reusable components.

This integrated approach is why Ada remains the language of choice for organizations that need both reliability and development efficiency. As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just functionally correct, but economically sustainable throughout its lifecycle.