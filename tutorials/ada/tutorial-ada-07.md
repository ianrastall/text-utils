# 7\. Real-Time Systems Programming in Ada: Timing Guarantees for Critical Applications

In safety-critical systems, functional correctness is only half the battle - timing correctness is equally vital. Ada provides unique language-level support for real-time programming, allowing developers to specify, verify, and guarantee timing behavior with mathematical precision. This tutorial explores how to leverage Ada's real-time features to build systems that not only do the right thing, but do it at the right time, every time. You'll learn to transform timing requirements from vague aspirations into verifiable system properties.

#### The Real-Time Challenge

**Hard real-time:** Missing a deadline is a system failure  
**Firm real-time:** Late results are useless  
**Soft real-time:** Performance degrades gracefully  
Ada provides the tools to meet hard real-time requirements through language features designed specifically for timing-critical applications.

## Why Most Languages Fail at Real-Time Programming

General-purpose languages lack the mechanisms to provide timing guarantees, forcing developers to rely on external libraries and platform-specific extensions. This creates fragile systems where:

### Common Timing Failures

- Unpredictable garbage collection pauses
- Non-deterministic memory allocation
- Hidden priority inversions
- Unbounded execution times

### Real-World Consequences

- 1996: Ariane 5 explosion caused by timing overflow
- 2004: Mars rover Spirit stuck due to priority inversion
- 2010: "Flash crash" partially attributed to timing issues
- Medical device malfunctions from missed deadlines

### The Ariane 5 Case Study

The 1996 Ariane 5 rocket explosion was caused by a 64-bit floating point value being converted to a 16-bit integer. But crucially, the error occurred in _inertial reference system code that was no longer needed after launch_. The system failed because:

- There was no way to specify that certain code was only valid during specific phases
- Timing constraints weren't enforced at the language level
- Error handling didn't account for timing context

Ada's real-time features, combined with contracts, would have prevented this by specifying phase-specific validity and timing constraints.

#### Ada's Real-Time Philosophy

Rather than treating timing as an afterthought, Ada integrates real-time capabilities directly into the language with:

- Predictable execution semantics
- Language-defined timing primitives
- Compile-time schedulability analysis
- Deadline monitoring built into the runtime
- Formal verification of timing properties

This approach transforms timing from a deployment concern into a design-time verification problem.

## Core Real-Time Features in Ada

### 1\. Precise Time Representation

Ada provides a robust time model with nanosecond precision:

```ada
    with Ada.Real_Time; use Ada.Real_Time;

    procedure Time_Demo is
       Now        : Time := Clock;
       One_Second : Time_Span := Seconds(1);
       Ten_Ms     : Time_Span := Milliseconds(10);
       Five_Us    : Time_Span := Microseconds(5);
    begin
       -- Absolute time operations
       Next_Time := Now + One_Second;

       -- Relative time operations
       if Delay_Until_Time - Clock >= Ten_Ms then
          Handle_Timing_Violation;
       end if;

       -- Time span arithmetic
       Total_Delay := Ten_Ms + Five_Us;
    end Time_Demo;
```

### Key Time Types

- `Time`: Absolute point in time (since epoch)
- `Time_Span`: Duration between two time points
- `Clock`: Function returning current time
- `Seconds`, `Milliseconds`, etc.: Duration constructors

Unlike other languages, Ada's time model is part of the language standard, ensuring consistent behavior across platforms.

### 2\. Deadline Monitoring

Specify and verify timing constraints directly in code:

```ada
    task Critical_Process is
       pragma Task_Dispatching_Policy (EDF_Within_Priorities);
       pragma Deadline (Seconds => 0.010); -- 10ms deadline
       -- Task definition
    end Critical_Process;

    task body Critical_Process is
    begin
       loop
          -- Work that must complete within deadline
          Process_Data;

          -- Optional deadline check
          if Clock - Start_Time > Milliseconds(10) then
             raise Deadline_Missed;
          end if;
       end loop;
    exception
       when Deadline_Error =>
          Handle_Deadline_Violation;
    end Critical_Process;
```

### Deadline Best Practices

- Specify deadlines at task declaration for static analysis
- Use runtime checks for critical operations within tasks
- Combine with contracts for complete verification
- Verify worst-case execution time (WCET) through analysis

### 3\. Dispatching Policies

Control how the runtime schedules tasks:

```ada
    -- At the program unit level
    pragma Task_Dispatching_Policy (FIFO_Within_Priorities);
    -- or
    pragma Task_Dispatching_Policy (EDF_Within_Priorities); -- Earliest Deadline First

    -- Task-specific priority
    task type Sensor_Reader is
       pragma Priority (System.Priority'Last - 10);
       -- Definition
    end Sensor_Reader;
```

#### Available Policies

- `FIFO_Within_Priorities`: Standard priority-based
- `EDF_Within_Priorities`: Earliest deadline first
- `Round_Robin_Within_Priorities`: Time-sliced

#### Policy Selection Guide

- Use EDF for systems with strict deadlines
- Use FIFO for traditional priority-based systems
- Round robin only for non-critical background tasks

## Real-Time Scheduling Analysis

One of Ada's most powerful capabilities is enabling schedulability analysis at compile time, rather than through error-prone runtime testing.

### Rate Monotonic Analysis (RMA)

A mathematical approach to verify that all deadlines will be met:

#### The Math Behind RMA

For n periodic tasks, the sufficient condition for schedulability is:

```
U ≤ n(2^(1/n) - 1)
```

Where U is the total CPU utilization:

```
U = Σ (C_i / T_i)

C_i = worst-case execution time  
T_i = task period
```

#### Ada Implementation

```ada
    -- Task with 10ms period, 2ms WCET
    task type Sensor_Task is
       pragma Priority (System.Priority'Last - 5);
       pragma Task_Info (Storage_Size => 4096);
       pragma Time_Handler (Period => Milliseconds(10),
                            WCET    => Microseconds(2000));
    end Sensor_Task;
```

These annotations allow tools like GNATprove to perform formal schedulability analysis.

### WCET Analysis Tools

Ada integrates with industry-standard WCET analysis tools:

- **aiT**: AbsInt's WCET analyzer
- **Bound-T**: Tidorum's timing analyzer
- **GNATprove**: SPARK-based verification
- **TimeWiz**: Ada-specific timing analysis

These tools work with Ada's predictable execution model to calculate precise worst-case execution times.

### Schedulability Verification

Using SPARK for formal timing verification:

```ada
    task type Control_Loop with
       Initializes => (State),
       WCET         => Microseconds(500),
       Period       => Milliseconds(1) is
       entry Start;
       entry Stop;
    end Control_Loop with
       Priority => High_Priority,
       Deadline => Milliseconds(1);

    -- SPARK can prove:
    -- 1. WCET is never exceeded
    -- 2. All deadlines are met
    -- 3. No priority inversion occurs
```

#### Practical Schedulability Example: Flight Control System

Consider a flight control system with these tasks:

| **Task** | **Period (ms)** | **WCET (ms)** | **Utilization** |
| :--- | :--- | :--- | :--- |
| **Attitude Control** | 1 | 0.3 | 30% |
| **Navigation Update** | 10 | 1.5 | 15% |
| **System Monitoring** | 100 | 5.0 | 5% |

```
Total Utilization: 50%
```

With 50% utilization, this system easily meets the RMA bound (69.3% for 3 tasks), guaranteeing all deadlines will be met. Ada's annotations make this analysis automatic.

## Temporal Contracts: Specifying Timing Behavior

Building on Design by Contract, Ada allows specification of temporal properties directly in code - creating what we call "temporal contracts."

### Basic Temporal Contracts

#### Deadline Specifications

```ada
    procedure Process_Command (
       Cmd : Command_Type;
       Response : out Response_Type) with
       Pre  => Valid_Command(Cmd),
       Post => Valid_Response(Response),
       -- Temporal contract:
       Time_Dependency => Cmd.Timestamp + Milliseconds(50) >= Clock;
```

Specifies that the command must be processed within 50ms of receipt.

#### WCET Specifications

```ada
    function Calculate_Trajectory (
       Current_State : State;
       Target        : Coordinates) return Trajectory with
       Pre  => Valid_State(Current_State),
       Post => Valid_Trajectory(Result),
       -- Temporal contract:
       WCET => Microseconds(2500);
```

Specifies a worst-case execution time of 2.5ms for verification.

### Advanced Temporal Patterns

#### 1\. Phase-Based Timing Constraints

Different timing requirements for different system phases:

```ada
    procedure Process_Flight_Phase (
       Phase : Flight_Phase;
       Data  : Sensor_Data) with
       Pre  => Valid_Phase(Phase),
       Time_Dependency =>
          (case Phase is
             when Launch      => Clock <= T0 + Seconds(180),
             when Ascent      => Clock <= T0 + Seconds(600),
             when Orbit       => Clock <= T0 + Seconds(3600),
             when Descent     => Clock <= T0 + Seconds(7200));
```

#### 2\. Jitter Constraints

Limit variation in execution timing:

```ada
    procedure Sample_Sensor (
       Value : out Sensor_Value) with
       Post => Valid_Sensor_Value(Value),
       -- Temporal contract:
       Jitter => Microseconds(50),
       Period => Milliseconds(100);
```

Ensures samples occur within 50μs of their nominal 100ms interval.

#### 3\. Deadline Chaining

Specify timing relationships between operations:

```ada
    procedure Process_Command (
       Cmd : Command;
       Response : out Response) with
       Pre  => Valid_Command(Cmd),
       Post => Valid_Response(Response),
       Time_Dependency =>
          (if Cmd.Priority = High then
             Response.Timestamp <= Cmd.Timestamp + Milliseconds(10))
          and
          (if Cmd.Priority = Medium then
             Response.Timestamp <= Cmd.Timestamp + Milliseconds(50));
```

### Temporal Contract Verification

Temporal contracts can be verified at multiple levels:

#### Runtime Verification

```bash
    gnatmake -gnata -D your_program.adb
```

Checks timing contracts during execution

#### Static Verification

```bash
    gnatprove --level=2 --report=all your_program.adb
```

Proves timing properties without execution

For the highest safety levels (DO-178C Level A), both approaches are typically required.

## Real-World Real-Time Applications

### Avionics: Flight Control System

A safety-critical flight control example:

```ada
    with Ada.Real_Time; use Ada.Real_Time;

    task type Control_Loop is
       pragma Task_Dispatching_Policy (EDF_Within_Priorities);
       pragma Priority (System.Priority'Last - 5);
       pragma Deadline (Milliseconds(5)); -- 200Hz loop
    end Control_Loop;

    task body Control_Loop is
       Next_Time : Time := Clock;
       Period    : Time_Span := Milliseconds(5);
    begin
       loop
          -- Read sensors (with timing contracts)
          Read_Sensors;

          -- Calculate control (with WCET specification)
          Calculate_Control;

          -- Apply control (with deadline constraint)
          Apply_Control;

          -- Maintain precise timing
          Next_Time := Next_Time + Period;
          delay until Next_Time;
       end loop;
    exception
       when Deadline_Error =>
          Switch_To_Fallback_Mode;
    end Control_Loop;
```

This structure guarantees a precisely timed 200Hz control loop.

### Medical Device: Pacemaker Controller

Life-critical timing requirements:

```ada
    task Pacemaker_Controller is
       pragma Priority (System.Priority'Last);
       pragma Deadline (Milliseconds(100)); -- 10Hz minimum
    end Pacemaker_Controller;

    task body Pacemaker_Controller is
       Beat_Interval : constant Time_Span := Milliseconds(1000);
       Next_Beat     : Time := Clock;
    begin
       loop
          -- Check heart activity
          if Heartbeat_Detected then
             -- Reset timer if natural beat detected
             Next_Beat := Clock + Beat_Interval;
          elsif Clock >= Next_Beat then
             -- Generate electrical pulse
             Generate_Pulse;
             Next_Beat := Next_Beat + Beat_Interval;
          end if;

          -- Sleep until next check
          delay until Clock + Milliseconds(10);
       end loop;
    end Pacemaker_Controller;
```

This implementation ensures pacing within 100ms of required intervals.

#### DO-178C Certification Requirements

For avionics software at DAL A (highest criticality), timing must satisfy:

- Worst-case execution time analysis
- Verification of all deadline requirements
- Proof of no priority inversion
- Analysis of timing behavior under fault conditions
- Validation through hardware-in-the-loop testing

Ada's integrated real-time features, combined with contracts and SPARK, provide the only practical path to meeting these requirements without prohibitive verification costs.

## Advanced Real-Time Patterns

### Pattern 1: Time-Triggered Architecture

Implement a predictable time-triggered system:

```ada
    with Ada.Real_Time; use Ada.Real_Time;

    procedure Time_Triggered_System is
       Frame_Duration : constant Time_Span := Milliseconds(10);
       Start_Time     : Time := Clock;
       Current_Frame  : Natural := 0;
    begin
       loop
          -- Synchronize to frame boundary
          delay until Start_Time + Frame_Duration * Current_Frame;

          -- Frame 0: Sensor reading
          if Current_Frame mod 4 = 0 then
             Read_Sensors;
          end if;

          -- Frame 1: Control calculation
          if Current_Frame mod 4 = 1 then
             Calculate_Control;
          end if;

          -- Frame 2: Output update
          if Current_Frame mod 4 = 2 then
             Update_Outputs;
          end if;

          -- Frame 3: System check
          if Current_Frame mod 4 = 3 then
             Check_System;
          end if;

          Current_Frame := (Current_Frame + 1) mod 4;
       end loop;
    end Time_Triggered_System;
```

### Why Time-Triggered Architectures Matter

Time-triggered systems provide deterministic behavior that's easier to verify than event-triggered systems. They're required for many safety-critical applications because:

- Predictable timing behavior
- Simpler schedulability analysis
- Easier fault containment
- Reduced testing burden

Ada's precise time model makes implementing time-triggered architectures straightforward and verifiable.

### Pattern 2: Adaptive Deadline Management

Handle varying workloads while maintaining critical deadlines:

```ada
    task Critical_Task is
       pragma Deadline (Milliseconds(10));
    end Critical_Task;

    task body Critical_Task is
       Base_Deadline : constant Time_Span := Milliseconds(10);
       Current_Deadline : Time_Span := Base_Deadline;
    begin
       loop
          -- Monitor system load
          Current_Load := Measure_Load;

          -- Adjust deadline based on load
          if Current_Load > 0.8 then
             -- Under heavy load, relax less critical deadlines
             Current_Deadline := Base_Deadline * 1.5;
          else
             Current_Deadline := Base_Deadline;
          end if;

          -- Process with current deadline constraint
          Process_Data (Deadline => Current_Deadline);
       end loop;
    end Critical_Task;
```

### WCET-Aware Programming

Structure code for predictable worst-case execution:

#### Avoid:

- Unbounded loops
- Dynamic memory allocation
- Recursion
- Exceptions in critical paths

#### Prefer:

- Bounded loops with loop invariants
- Static memory allocation
- Iteration over recursion
- Error codes over exceptions

## Exercises: Building Verified Real-Time Systems

### Exercise 1: Automotive Braking System

Design a real-time braking controller:

- Implement a 100Hz control loop with WCET constraints
- Use temporal contracts for all timing requirements
- Verify schedulability using RMA
- Implement fault handling with timing guarantees
- Prove worst-case timing properties with SPARK

> **Challenge:** Prove the system can always apply brakes within 100ms of detecting an obstacle.

### Exercise 2: Industrial Robot Controller

Build a robot motion controller with:

- Multiple synchronized control loops
- Phase-based timing requirements
- Jitter constraints for smooth motion
- Deadline chaining for coordinated movement
- Formal timing verification

> **Challenge:** Prove that all joints move in precise synchronization within 1ms tolerance.

### Verification Strategy for Real-Time Systems

1.  **Design phase:** Specify all timing requirements as temporal contracts
2.  **Implementation:** Structure code for predictable execution
3.  **Static analysis:** Use GNATprove for schedulability analysis
4.  **WCET analysis:** Apply tools like aiT to determine worst-case times
5.  **Runtime verification:** Test with -gnata -D flags
6.  **Hardware validation:** Perform hardware-in-the-loop testing

For the highest safety levels, all six steps are required to demonstrate timing correctness.

## Next Steps: Integration and Certification

Now that you've mastered Ada's real-time capabilities, you're ready to apply these techniques to full system integration and certification. In the next tutorial, we'll explore how to:

### Upcoming: Certification and Integration

- Integrate Ada components with other languages
- Meet DO-178C and IEC 62304 certification requirements
- Combine all Ada features for complete system verification
- Transition from development to certified deployment
- Build traceability from requirements to code

### Practice Challenge

Enhance your automotive braking system with certification features:

- Add complete requirements traceability
- Implement certification artifacts
- Verify against DO-178C objectives
- Create a verification matrix
- Prepare for tool qualification

#### The Path to Certified Systems

Real-time programming in Ada represents the culmination of the language's design philosophy: transforming critical system properties from runtime concerns into verifiable design-time guarantees. When combined with strong typing, Design by Contract, and safe concurrency, Ada provides a complete framework for building systems where timing errors are as impossible as type errors.

This integrated approach is why Ada remains the language of choice for systems where missing a deadline is not just a bug, but a catastrophic failure. As you complete this tutorial series, you'll see how these techniques combine to create software that's not just functionally correct, but _temporally guaranteed_ within its specified domain.
