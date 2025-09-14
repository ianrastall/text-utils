# 6\. Concurrency and Protected Objects in Ada: Safe Parallelism for Critical Systems

While most programming languages treat concurrency as an afterthought requiring external libraries, Ada integrates safe parallelism directly into the language. This tutorial explores Ada's unique tasking model and protected objects - features designed from the ground up for building reliable concurrent systems where race conditions and deadlocks are prevented at compile time. You'll learn how to structure concurrent applications that maintain correctness guarantees even in the most demanding real-time environments.

#### Concurrency vs. Parallelism

> **Concurrency**: Managing multiple tasks that make progress independently  

> **Parallelism**: Executing multiple tasks simultaneously  

Ada provides language-level support for both, with safety guarantees that prevent the most common concurrency errors.

## The Concurrency Problem: Why Most Languages Fail

Concurrency bugs are notoriously difficult to detect and reproduce. Traditional approaches using threads and mutexes create fragile systems where:

### Typical Concurrency Issues

- Race conditions: Unpredictable behavior from timing dependencies
- Deadlocks: Circular dependencies causing system freeze
- Priority inversion: High-priority tasks blocked by low-priority ones
- Heisenbugs: Errors that disappear when observed

### Real-World Consequences

- 1996: Ariane 5 rocket explosion caused by race condition
- 2003: Northeast blackout from race condition in monitoring software
- 2012: Knight Capital $440M loss from threading error
- Medical device recalls due to priority inversion

### The Therac-25 Radiation Therapy Machine (Revisited)

In addition to the contract violations we discussed previously, the Therac-25 failures were compounded by race conditions in the software. The system used shared variables without proper synchronization, allowing dangerous states to occur when specific timing conditions were met. Ada's protected objects would have prevented these race conditions by design.

#### Ada's Concurrency Philosophy

Rather than exposing low-level mechanisms and expecting developers to use them correctly, Ada provides high-level abstractions with built-in safety. The language enforces correct usage patterns through:

- Tasks as first-class language elements
- Protected objects for safe data sharing
- Priority-based scheduling with inheritance
- Deadline monitoring and timing constraints
- Compile-time deadlock detection

This approach shifts error prevention from developer discipline to language enforcement.

## Ada Tasks: The Foundation of Concurrency

### Basic Task Structure

Tasks are defined as separate program units with their own execution context:

```ada
    task Sensor_Reader is
       entry Start;
       entry Stop;
       function Get_Last_Value return Float;
    end Sensor_Reader;

    task body Sensor_Reader is
       Last_Value : Float := 0.0;
       Running    : Boolean := False;
    begin
       loop
          select
             when not Running =>
                accept Start do
                   Running := True;
                end Start;
          or
             when Running =>
                accept Stop do
                   Running := False;
                end Stop;
          or
             accept Get_Last_Value return Float do
                Get_Last_Value := Last_Value;
             end Get_Last_Value;
          or
             delay 0.1; -- 100ms sampling interval
             if Running then
                Last_Value := Read_Hardware_Sensor;
             end if;
          end select;

          exit when Terminated;
       end loop;
    end Sensor_Reader;
```

### Task Select Statement Explained

The `select` statement is Ada's powerful mechanism for handling multiple communication possibilities:

- `when` clauses specify guards (preconditions) for entries
- `accept` blocks until the entry is called and executes the handler
- `or` separates alternative options
- Time delays can be integrated directly into the selection

This structure prevents race conditions by making communication atomic.

### Task Communication Patterns

#### 1\. Simple Synchronous Call

```ada
    Sensor_Reader.Start;
    -- Caller blocks until Start completes
```

Basic synchronous communication pattern.

#### 2\. Asynchronous Transfer

```ada
    Sensor_Reader.Start;
    -- Continue immediately without waiting
```

Use `pragma Asynchronous` for true fire-and-forget.

#### 3\. Timed Entry Call

```ada
    select
       Sensor_Reader.Get_Value(V);
    or
       delay 0.5; -- 500ms timeout
       raise Timeout_Error;
    end select;
```

Prevents indefinite blocking with timeout handling.

#### 4\. Conditional Call

```ada
    select
       Sensor_Reader.Get_Value(V);
    else
       -- Proceed without value
       Handle_Missing_Data;
    end select;
```

Executes alternative if entry isn't immediately available.

## Protected Objects: Safe Shared Data

While tasks handle active concurrency, protected objects provide safe access to shared data - solving the most common source of concurrency bugs.

### Why Protected Objects Beat Mutexes

#### Traditional Mutex Approach

- Manual lock/unlock sequence
- Deadlock-prone (lock ordering issues)
- No compile-time verification
- Priority inversion possible
- Locks often held too long

```ada
  // C code with mutex
  pthread_mutex_lock(&mutex);
  data = read_sensor();
  pthread_mutex_unlock(&mutex);
```

#### Ada Protected Objects

- Automatic lock management
- Compile-time deadlock detection
- Priority inheritance built in
- Entry barriers prevent invalid access
- Operations defined by contract

```ada
  protected Sensor_Data is
  entry Read (Value : out Float);
  procedure Write (Value : in Float);
  private
  Current_Value : Float := 0.0;
  Valid : Boolean := False;
  end Sensor_Data;
```

### Protected Object Implementation

```ada
    protected body Sensor_Data is
       entry Read (Value : out Float) when Valid is
       begin
          Value := Current_Value;
       end Read;

       procedure Write (Value : in Float) is
       begin
          Current_Value := Value;
          Valid := True;
       end Write;
    end Sensor_Data;
```

#### Key Elements

- `when` clause: Entry barrier (compile-time checked)
- Automatic mutual exclusion
- No explicit locks required
- Priority inheritance prevents inversion

#### How It Works

1.  Caller attempts entry call
2.  Barrier condition evaluated
3.  If true, caller gains access
4.  If false, caller queued
5.  Automatic lock released on exit

## Advanced Concurrency Patterns

### 1\. Priority-Based Scheduling

Assign priorities to tasks for deterministic execution:

```ada
    task type High_Priority_Task is
       pragma Priority (System.Priority'Last);
       -- Task definition
    end High_Priority_Task;
```

Ada supports priority inheritance to prevent priority inversion:

```ada
    pragma Task_Dispatching_Policy (FIFO_Within_Priorities);
```

### 2\. Real-Time Deadline Monitoring

Ensure tasks meet timing requirements:

```ada
    task Mission_Critical_Task is
       pragma Task_Dispatching_Policy (EDF_Within_Priorities);
       pragma Deadline (Seconds => 0.01); -- 10ms deadline
    end Mission_Critical_Task;
```

The runtime monitors deadlines and raises exceptions if missed.

### 3\. Rendezvous with Parameters

Safe data transfer between tasks:

```ada
    task Controller is
       entry Receive_Sensor_Data (Value : Float; Timestamp : Time);
    end Controller;

    task body Controller is
    begin
       loop
          accept Receive_Sensor_Data (Value : Float; Timestamp : Time) do
             Process(Value, Timestamp);
          end Receive_Sensor_Data;
       end loop;
    end Controller;
```

Parameters are safely copied during the rendezvous.

### 4\. Dynamic Task Creation

Create tasks at runtime with controlled scope:

```ada
    task type Worker is
       -- Definition
    end Worker;

    type Worker_Access is access Worker;

    -- Create dynamically:
    W : Worker_Access := new Worker;
```

Use with caution in safety-critical systems; often better to use task pools.

#### Priority Inversion: The Mars Pathfinder Story

In 1997, the Mars Pathfinder lander experienced repeated system resets due to priority inversion. A low-priority meteorological task held a mutex needed by a high-priority communications task, but was preempted by medium-priority tasks. This caused the communications task to miss deadlines.

Ada's priority inheritance protocol would have automatically elevated the low-priority task's priority while it held the mutex, preventing the inversion. The problem was eventually fixed with a software patch that implemented priority inheritance - a feature built into Ada's protected objects from the start.

## Combining Contracts with Concurrency

One of Ada's most powerful capabilities is applying Design by Contract principles to concurrent systems. This creates verifiable guarantees about concurrent behavior.

### Contract Patterns for Tasks

#### Task Interface Contracts

```ada
    task Sensor_Reader is
       entry Start with
          Pre => not Is_Running;

       entry Stop with
          Pre  => Is_Running,
          Post => not Is_Running;

       function Is_Running return Boolean;
    end Sensor_Reader;
```

These contracts ensure valid state transitions for the task interface.

#### Protected Object Contracts

```ada
    protected Temperature_Monitor with
       Initial_Condition => not Alarm_Active is
       entry Check_Temperature (Temp : Celsius) with
          Pre  => System_Ready,
          Post => (if Temp > Threshold then Alarm_Active);

       function Alarm_Status return Boolean;
    private
       Alarm_Active : Boolean := False;
    end Temperature_Monitor;
````

Contracts on protected objects ensure data integrity across concurrent accesses.

### Verification of Concurrent Properties

Use SPARK to prove critical concurrent properties:

```ada
    protected Flight_Control with
       Initializes => (Pitch, Roll, Yaw),
       Initializes => Control_Locked is
       entry Set_Pitch (Angle : Pitch_Angle) with
          Pre  => not Control_Locked,
          Post => Pitch = Angle;

       entry Lock_Controls (Code : Authorization_Code) with
          Pre  => not Control_Locked,
          Post => Control_Locked;

    private
       Pitch         : Pitch_Angle := 0.0;
       Control_Locked : Boolean := False;
    end Flight_Control;
```

With these contracts, SPARK can prove that controls cannot be modified when locked.

### Common Concurrency Pitfalls and Solutions

#### Pitfall: Deadlock from Circular Dependencies

```
    -- Task A
    accept Resource_B;
    accept Resource_A;

    -- Task B
    accept Resource_A;
    accept Resource_B;
```

#### Solution: Resource Ordering Protocol

```
    -- Always acquire in same order
    -- Task A and B both:
    accept Resource_A;
    accept Resource_B;
```

Ada's compile-time checks can detect potential deadlocks when resource ordering is violated.

## Real-World Concurrency Applications

### Avionics System: Flight Control

A multi-sensor flight control system:

```ada
    protected Flight_Data is
       entry Set_Attitude (Pitch, Roll, Yaw : Degrees) with
          Pre => System_Available;

       function Get_Attitude return Attitude_Data with
          Post => Get_Attitude.Valid;

    private
       Current_Attitude : Attitude_Data := (Valid => False, others => 0.0);
    end Flight_Data;

    task Attitude_Sensor is
       pragma Priority (High_Priority);
    end Attitude_Sensor;

    task Flight_Computer with
       Priority => Highest_Priority,
       Deadline   => 0.01; -- 10ms deadline
    -- Processing logic
```

This structure ensures safe data sharing between sensors and control systems.

### Medical Device: Patient Monitoring

Critical patient monitoring system:

```ada
    protected Patient_Vitals is
       entry Record_Heart_Rate (BPM : Positive) with
          Pre  => BPM <= 300,
          Post => Heart_Rate = BPM;

       entry Record_Blood_Pressure (Systolic, Diastolic : Pressure) with
          Pre  => Systolic > Diastolic and Systolic <= 300;

       function Is_Stable return Boolean with
          Post => (if Is_Stable'Result then
                   Heart_Rate in 60..100 and
                   Systolic in 90..120);

    private
       Heart_Rate  : Positive := 75;
       Systolic    : Pressure := 120;
       Diastolic   : Pressure := 80;
    end Patient_Vitals;
```

Contracts ensure data validity while protected objects prevent race conditions.

#### DO-178C Certification Requirements

For avionics software at DAL A (highest criticality), concurrency must satisfy:

- Deterministic task scheduling
- Guaranteed worst-case execution time
- Proven absence of deadlocks
- Verified priority inversion handling
- Formal specification of all shared data

Ada's built-in concurrency features, combined with contracts and SPARK, provide the only practical path to meeting these requirements without prohibitive verification costs.

## Exercises: Building Safe Concurrent Systems

### Exercise 1: Air Traffic Control Simulator

Design a concurrent air traffic control system:

- Create tasks for radar sensors with different update rates
- Implement protected objects for aircraft data
- Add contracts to ensure safe separation distances
- Set appropriate priorities for critical operations
- Verify absence of deadlocks with SPARK

> **Challenge:** Prove that two aircraft cannot occupy the same airspace.

### Exercise 2: Nuclear Reactor Monitoring

Build a reactor monitoring system with:

- Multiple sensor tasks with different priorities
- Protected objects for shared reactor state
- Deadline monitoring for safety-critical readings
- Contracts ensuring valid state transitions
- Formal verification of safety properties

> **Challenge:** Prove that emergency shutdown can always proceed regardless of system load.

### Verification Strategy for Concurrent Systems

1.  Start with runtime checking (`-gnata`) to catch basic errors
2.  Add contracts to all task interfaces and protected objects
3.  Use `gnatprove --level=1` for basic verification
4.  For critical systems, transition to SPARK subset
5.  Focus verification efforts on shared data and state transitions
6.  Test timing properties with real hardware

## Next Steps: Real-Time Systems Programming

Now that you've mastered Ada's concurrency model, you're ready to apply these techniques to real-time systems where timing guarantees are as critical as functional correctness. In the next tutorial, we'll explore how to:

### Upcoming: Real-Time Systems in Ada

- Implement precise timing constraints
- Use Ada's real-time dispatching policies
- Verify worst-case execution times
- Combine contracts with timing requirements
- Build systems that meet DO-178C and IEC 62304 requirements

### Practice Challenge

Enhance your air traffic control system with real-time features:

- Add deadlines to all critical operations
- Implement rate-monotonic scheduling
- Verify timing properties with SPARK
- Add temporal contracts to your specifications
- Test under simulated high-load conditions

#### The Power of Integrated Concurrency

Ada's approach to concurrency represents a fundamental shift from how most languages handle parallelism. Rather than exposing low-level mechanisms that are easy to misuse, Ada provides high-level abstractions with built-in safety. This transforms concurrency from a source of bugs into a reliable engineering tool.

When combined with strong typing and Design by Contract, Ada's concurrency model enables the development of systems that are not just concurrent, but _provably correct_ in their parallel behavior. This is why Ada remains the language of choice for systems where timing errors can have catastrophic consequences.
