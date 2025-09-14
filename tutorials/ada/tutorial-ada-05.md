# 5\. Exception Handling and Robust Error Management in Ada

In safety-critical systems, how errors are handled is often more important than preventing them. Ada's exception system transforms error management from an afterthought into a first-class design element with precise semantics and verifiable properties. This tutorial explores Ada's robust approach to exceptions, showing how to design systems that fail gracefully rather than catastrophically. You'll learn to build error handling strategies that not only recover from problems but also prove their correctness - turning what is often a source of fragility into a foundation for reliability.

#### Error Management Philosophy

> **Traditional approach:** "Let's try to avoid errors and handle the ones we anticipate"  

> **Ada approach:** "Let's design for failure and prove our recovery strategies work"  

This fundamental shift in perspective is what makes Ada uniquely suited for systems where failure is not an option.

## Why Most Exception Systems Fail in Critical Applications

General-purpose exception systems often create more problems than they solve in safety-critical contexts. Understanding these pitfalls is essential to leveraging Ada's superior approach.

### Common Exception System Deficiencies

- Unpredictable resource consumption (stack usage, memory allocation)
- Hidden control flow paths that complicate verification
- No distinction between recoverable and fatal errors
- Exception swallowing that masks underlying problems
- Inconsistent propagation semantics across language boundaries

### Real-World Consequences

- 1996: Ariane 5 explosion partly due to unhandled exception
- 2004: Mars rover Spirit stuck due to uncaught exception
- 2010: "Flash crash" exacerbated by exception handling issues
- Medical device recalls due to improper error recovery

### The Ariane 5 Case Study Revisited

The Ariane 5 rocket explosion was caused by a floating-point error that should have been handled. But critically, the error handling system itself failed because:

- The exception handler was removed during optimization
- No verification ensured the handler's presence
- The system lacked a proper fallback mode
- Error propagation wasn't formally specified

Ada's exception system, combined with contracts, would have prevented this by requiring verified error handling paths and providing predictable recovery mechanisms.

#### Ada's Exception Philosophy

Rather than treating exceptions as mere error signals, Ada integrates them into the design process with:

- Predictable resource usage during propagation
- Explicit control flow that supports verification
- Clear distinction between recoverable and fatal conditions
- Formal specification of error handling requirements
- Integration with Design by Contract for complete verification

This approach transforms error management from a runtime concern into a design-time verification problem.

## Exception Semantics and Propagation

Ada's exception system provides precise control over error signaling and handling with predictable behavior.

### Basic Exception Structure

#### Exception Declaration and Raising

```ada
    -- Declare custom exceptions
    Sensor_Error   : exception;
    Timeout_Error  : exception;
    Invalid_Value  : exception;

    -- Raise exceptions with context
    procedure Read_Sensor (ID : Sensor_ID; Value : out Float) is
    begin
       if not Sensor_Ready(ID) then
          raise Sensor_Error with "Sensor " & ID'Image & " not ready";
       end if;

       Value := Read_Hardware_Sensor(ID);

       if Value > MAX_VALID_VALUE then
          raise Invalid_Value with "Value " & Value'Image & " exceeds limit";
       end if;
    end Read_Sensor;
```

#### Exception Handling

```ada
    procedure Process_Sensor_Data is
       Value : Float;
    begin
       Read_Sensor(1, Value);
       Analyze(Value);

    exception
       when Sensor_Error =>
          Log_Error("Sensor failure");
          Initialize_Sensors;

       when Invalid_Value =>
          Log_Error("Invalid reading");
          Calibrate_Sensor(1);

       when others =>
          Emergency_Shutdown;
    end Process_Sensor_Data;
```

### Key Exception Properties

- Exceptions are _raised_ at a specific point in code
- Propagation follows the static call tree (not dynamic)
- Handlers are selected based on the exception's identity
- Propagation stops at the first matching handler
- Unhandled exceptions propagate to the environment

Unlike many languages, Ada's exception propagation is fully determined at compile time, making it verifiable.

### Exception Propagation Mechanics

Understanding the precise propagation rules is critical for safety-critical systems:

#### Propagation Path

1.  Exception raised in current subprogram
2.  Check for handler in current subprogram
3.  If none, unwind stack to caller
4.  Check caller for handler
5.  Repeat until handler found or program terminates

This follows the static call tree, not the dynamic call sequence.

#### Stack Unwinding

- Local objects with `finalize` are properly cleaned up
- No hidden resource leaks during propagation
- Predictable stack usage (no unbounded recursion)
- No heap allocation during propagation

This determinism is essential for safety-critical applications.

### Exception Handling Best Practices

- Handle exceptions at the appropriate level of abstraction
- Never swallow exceptions without action
- Preserve context when propagating exceptions
- Use specific exception types rather than `others`
- Ensure all code paths have error handling
- Test all exception paths thoroughly

## Custom Exception Hierarchies

While Ada doesn't have inheritance-based exception hierarchies like some OOP languages, it provides powerful mechanisms for creating structured exception taxonomies.

### Exception Taxonomy Patterns

#### 1\. Tagged Type Exception Pattern

Using tagged types to create an extensible exception hierarchy:

```ada
    package Exceptions is

       type System_Exception is tagged private;
       function Reason (E : System_Exception) return String;

       type Sensor_Exception is new System_Exception with private;
       type Communication_Exception is new System_Exception with private;
       type Hardware_Exception is new System_Exception with private;

       -- Specific exception constructors
       function Sensor_Timeout return Sensor_Exception;
       function Sensor_Offline return Sensor_Exception;
       function Buffer_Overflow return Communication_Exception;

    private
       type System_Exception is tagged record
          Message : Unbounded_String;
       end record;

       type Sensor_Exception is new System_Exception with null record;
       -- ...

    end Exceptions;
```

#### 2\. Exception Package Hierarchy

Using package structure to organize exceptions:

```ada
    package System_Exceptions is
       System_Error : exception;
    end System_Exceptions;

    package System_Exceptions.Sensor is
       Sensor_Error   : exception;
       Timeout_Error  : exception;
       Calibration_Error : exception;
    end System_Exceptions.Sensor;

    package System_Exceptions.Communication is
       Communication_Error : exception;
       Buffer_Overflow     : exception;
       Checksum_Failure    : exception;
    end System_Exceptions.Communication;

    -- Usage
    with System_Exceptions.Sensor;
    use System_Exceptions.Sensor;

    procedure Read_Sensor is
    begin
       -- ...
    exception
       when Timeout_Error =>
          -- Handle timeout
    end Read_Sensor;
```

### Exception Hierarchy Design Guidelines

#### Good Hierarchy

- Organized by error domain (sensors, comms, etc.)
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

### Exception Context and Diagnostics

Providing rich context is essential for effective error handling:

```ada
    with Ada.Exceptions; use Ada.Exceptions;

    package Sensor_Exceptions is

       Sensor_Error : exception;

       -- Enhanced exception with context
       type Sensor_Exception is new Exception_Occurrence with private;

       function Create_Sensor_Error (
          ID      : Sensor_ID;
          Message : String;
          Value   : Float := Float'Last) return Sensor_Exception;

       function Get_Sensor_ID (E : Sensor_Exception) return Sensor_ID;
       function Get_Value (E : Sensor_Exception) return Float;

    private
       type Sensor_Exception is new Exception_Occurrence with record
          Sensor_ID : System.Sensor_ID;
          Value     : Float;
       end record;

    end Sensor_Exceptions;

    -- Usage
    raise Create_Sensor_Error(
       ID      => 5,
       Message => "Value out of range",
       Value   => 150.0);
```

### Context Information Best Practices

- Include component identifier (sensor ID, task name)
- Capture relevant parameter values
- Record timestamp of error occurrence
- Preserve system state context
- Include error severity level
- Provide recovery suggestions when possible

Rich context transforms error handling from generic recovery to targeted problem resolution.

## Exception Contracts and Verification

One of Ada's most powerful capabilities is specifying exception behavior as part of Design by Contract, enabling formal verification of error handling.

### Exception Specifications as Contracts

#### Basic Exception Contracts

```ada
    function Calculate_Safety_Margin (
       Load, Capacity : Positive) return Float with
       Pre  => Capacity > Load,
       Post => Calculate_Safety_Margin'Result in 0.0..1.0,
       -- Contract: Only these exceptions can be raised
       Exceptional_Cases =>
          (Capacity_Error => Capacity <= Load,
           others          => False);
```

Specifies exactly when and why exceptions may occur.

#### Exceptional Postconditions

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

Specifies behavior even when exceptions occur.

#### Exception Contract Verification Levels

| Verification Level | What It Checks | How To Enable |
| :--- | :--- | :--- |
| **Runtime Checking** | Exceptions only raised as specified | `-gnata` compiler flag |
| **Static Analysis** | Proof that no unspecified exceptions can occur | `gnatprove --level=1` |
| **Formal Verification** | Mathematical proof of exception contract compliance | SPARK with `--level=2` |

For safety-critical systems, all three levels should be used to ensure comprehensive exception verification.

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

    -- Exception contract shows chaining
    Exceptional_Cases =>
       (Data_Processing_Error =>
          Exception_Message(Data_Processing_Error)'Length > 0 and
          Exception_Identity(Data_Processing_Error) = Data_Processing_Error and
          Exception_Occurrence(Data_Processing_Error).Exception_Name = "Parse_Error");
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

## Error Recovery Patterns for Safety-Critical Systems

In safety-critical systems, error recovery isn't optional - it's a fundamental requirement. Ada provides patterns for implementing robust recovery strategies.

### Recovery Pattern Taxonomy

#### 1\. Retry Pattern

For transient errors that may resolve with repetition:

```ada
    function Read_Sensor_With_Retry (
       ID      : Sensor_ID;
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

#### DO-178C Error Recovery Requirements

For avionics software at DAL A, error recovery must satisfy:

- Degraded functionality must be safe
- Recovery procedures must be verified
- Error conditions must be fully specified
- Recovery cannot introduce new hazards
- System must maintain safe state during recovery

Ada's exception contracts and verification tools provide the only practical path to meeting these requirements without prohibitive verification costs.

## Combining Exceptions with Design by Contract

The real power of Ada's exception system emerges when combined with Design by Contract, creating a complete framework for specifying and verifying error behavior.

### Contract-Exception Integration Patterns

#### 1\. Preconditions as Exception Prevention

Use preconditions to prevent exceptions:

```ada
    function Calculate_Factorial (N : Natural) return Positive with
       Pre  => N <= 12,  -- Prevents overflow
       Post => Calculate_Factorial'Result > 0;

    -- Implementation can now assume N <= 12
    function Calculate_Factorial (N : Natural) return Positive is
    begin
       if N = 0 then
          return 1;
       else
          return N * Calculate_Factorial(N-1);
       end if;
    end Calculate_Factorial;
```

With the precondition, the implementation no longer needs to check for overflow.

#### 2\. Exceptions as Contract Violations

Use exceptions to handle contract violations:

```ada
    procedure Set_Temperature (
       Sensor_ID : in     Sensor_ID;
       Value     : in     Celsius;
       Success   :    out Boolean) with
       Pre  => Value in VALID_TEMPERATURE_RANGE,
       Post => (if Success then
                Temperature(Sensor_ID) = Value);

    -- Implementation with contract enforcement
    procedure Set_Temperature (
       Sensor_ID : in     Sensor_ID;
       Value     : in     Celsius;
       Success   :    out Boolean) is
    begin
       if Value not in VALID_TEMPERATURE_RANGE then
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

1.  **Static verification:** Use gnatprove to verify no contract violations can occur
2.  **Runtime verification:** Compile with -gnata to catch violations during testing
3.  **Exception path testing:** Verify all exception handlers through testing
4.  **Recovery validation:** Confirm system state after recovery
5.  **Formal proof:** For critical components, use SPARK for mathematical verification

This multi-layered approach ensures comprehensive verification of error handling behavior.

## Real-World Error Management Case Studies

### Boeing 787 Dreamliner Flight Control

Error management in the flight control system:

- Structured exception taxonomy by system component
- Multiple recovery levels (graceful degradation)
- Formal verification of all critical error paths
- Complete traceability from requirements to error handling
- Tool-qualified exception handling code

The Ada-based approach reduced error-related certification evidence by 40% compared to previous Boeing models.

### Medical Infusion Pump System

Error handling in a life-critical infusion pump:

- Strict separation of recoverable vs. fatal errors
- Multiple fallback mechanisms for critical operations
- State restoration guarantees after errors
- Formal contracts specifying error behavior
- Complete verification of all error recovery paths

This implementation prevented numerous potential failure modes that had caused recalls in previous pump models.

### Avionics Error Management Pattern

A robust error handling pattern from DO-178C certified code:

```ada
    package Flight_Control.Errors with
       SPARK_Mode => On
    is

       -- Error severity levels
       type Error_Severity is (Warning, Error, Critical, Fatal);

       -- Error record with context
       type Error_Record (Severity : Error_Severity := Warning) is record
          Code        : Error_Code;
          Timestamp   : Time;
          Component   : Component_ID;
          Description : Unbounded_String;
          case Severity is
             when Warning | Error | Critical =>
                Recovery_Action : Recovery_Procedure;
             when Fatal =>
                null;
          end case;
       end record;

       -- Error handling interface
       procedure Handle_Error (E : Error_Record);
       function Current_Error return Error_Record;
       function System_Degraded return Boolean;

       -- Contracts specify error behavior
       Contract_Cases =>
          (System_Degraded =>
             Current_Error.Severity in Warning..Critical,
           not System_Degraded =>
             Current_Error.Severity = Warning);

    end Flight_Control.Errors;
```

### Certification Evidence Package

The complete error management certification package included:

- Formal error taxonomy specification
- Exception contracts for all critical components
- Verification reports proving no unhandled exceptions
- Test evidence for all error recovery paths
- Formal proof of critical error handling properties
- Problem reports and resolution evidence

This comprehensive evidence package enabled successful certification with minimal audit findings.

## Exercises: Building Verified Error Management Systems

### Exercise 1: Avionics Sensor Error Handling

Design an error management system for aircraft sensors:

- Create a structured exception taxonomy for sensor errors
- Implement retry and fallback patterns for critical sensors
- Add contracts to specify error behavior
- Verify that all error paths maintain system safety
- Prove that no unhandled exceptions can occur

> **Challenge:** Demonstrate that the system cannot enter an unsafe state due to sensor errors.

### Exercise 2: Medical Device Error Recovery

Build an error recovery system for an infusion pump:

- Design a circuit breaker pattern for critical components
- Implement state restoration guarantees
- Create exception contracts for all safety-critical operations
- Structure the system for modular verification
- Generate complete certification evidence

> **Challenge:** Prove that the pump will never deliver an unsafe dose due to error conditions.

### Error Management Verification Strategy

#### Static Verification

- Use gnatprove to verify no unhandled exceptions
- Prove exception contracts hold
- Verify resource safety during propagation
- Confirm error recovery guarantees

#### Runtime Verification

- Compile with -gnata for runtime checks
- Test all exception paths
- Validate recovery procedures
- Measure error handling performance

For highest safety levels, both static and runtime verification are required to demonstrate comprehensive error management.

## Next Steps: Generics and Template Programming

Now that you've mastered Ada's exception handling system, you're ready to explore how to create reusable, verifiable components through generics. In the next tutorial, we'll dive into Ada's powerful generic programming system, showing how to:

### Upcoming: Generics and Template Programming

- Create reusable components with formal parameters
- Specify constraints on generic parameters
- Verify generic code correctness
- Combine generics with Design by Contract
- Apply generics to safety-critical patterns

### Practice Challenge

Enhance your avionics sensor system with generics:

- Create generic sensor interface packages
- Add constraints to ensure type safety
- Implement contracts for generic operations
- Verify that instantiations maintain safety properties
- Create a verification plan for generic components

#### The Path to Verified Reusability

Exception handling provides the foundation for building reliable systems, but generics enable building reliable systems _efficiently_. When combined with strong typing, Design by Contract, and formal verification, Ada's generic system creates a powerful framework for developing and certifying reusable components.

This integrated approach is why Ada remains the language of choice for organizations that need both reliability and development efficiency. As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just functionally correct, but _economically sustainable_ throughout its lifecycle.
