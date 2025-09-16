# 1 . Concurrency and Protected Objects in Ada

While most programming languages treat concurrency as an afterthought requiring external libraries, Ada integrates safe parallelism directly into the language. This tutorial explores Ada's unique tasking model and protected objects—features designed from the ground up for building reliable concurrent systems where race conditions and deadlocks are prevented at compile time. You'll learn how to structure concurrent applications that maintain correctness guarantees even in demanding real-time environments, whether you're building a home automation system, a web server, or a data processing pipeline.

#### 1.0.0.1 Concurrency vs. Parallelism

> **Concurrency**: Managing multiple tasks that make progress independently  
>  
> **Parallelism**: Executing multiple tasks simultaneously

Ada provides language-level support for both, with safety guarantees that prevent the most common concurrency errors. Concurrency is about structuring your program to handle multiple tasks at once, while parallelism is about actually executing those tasks simultaneously on multiple processors. Ada excels at both by providing high-level abstractions that handle the complexity for you.

## 1.1 The Concurrency Problem: Why Most Languages Fail

Concurrency bugs are notoriously difficult to detect and reproduce. Traditional approaches using threads and mutexes create fragile systems where:

### 1.1.1 Typical Concurrency Issues

- **Race conditions**: Unpredictable behavior from timing dependencies
- **Deadlocks**: Circular dependencies causing system freeze
- **Priority inversion**: High-priority tasks blocked by low-priority ones
- **Heisenbugs**: Errors that disappear when observed

### 1.1.2 Real-World Consequences

- **Banking application**: A customer's balance might show $1000 when it should be $500 due to race conditions in transaction processing
- **Web server**: A popular website crashes when multiple users access it simultaneously due to improper synchronization
- **Home automation system**: Lights turn on unexpectedly because of timing issues in sensor readings
- **Video game**: Character movements become jerky when multiple players interact in the same area

### 1.1.3 The Therac-25 Radiation Therapy Machine (Revisited)

In addition to the contract violations we discussed previously, the Therac-25 failures were compounded by race conditions in the software. The system used shared variables without proper synchronization, allowing dangerous states to occur when specific timing conditions were met. Ada's protected objects would have prevented these race conditions by design.

#### 1.1.3.1 Ada's Concurrency Philosophy

Rather than exposing low-level mechanisms and expecting developers to use them correctly, Ada provides high-level abstractions with built-in safety. The language enforces correct usage patterns through:

- Tasks as first-class language elements
- Protected objects for safe data sharing
- Priority-based scheduling with inheritance
- Deadline monitoring and timing constraints
- Compile-time deadlock detection

This approach shifts error prevention from developer discipline to language enforcement. Instead of relying on programmers to remember complex synchronization rules, Ada's compiler checks for common mistakes at compile time.

## 1.2 Ada Tasks: The Foundation of Concurrency

### 1.2.1 Basic Task Structure

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
   end loop;
end Sensor_Reader;
```

### 1.2.2 Task Select Statement Explained

The `select` statement is Ada's powerful mechanism for handling multiple communication possibilities:

- `when` clauses specify guards (preconditions) for entries
- `accept` blocks until the entry is called and executes the handler
- `or` separates alternative options
- Time delays can be integrated directly into the selection

This structure prevents race conditions by making communication atomic. Unlike traditional threading models where you must manually manage locks, Ada's `select` statement handles synchronization automatically.

### 1.2.3 Task Communication Patterns

#### 1.2.3.1 \. Simple Synchronous Call

```ada
Sensor_Reader.Start;
-- Caller blocks until Start completes
```

Basic synchronous communication pattern where the caller waits for the task to complete the operation.

#### 1.2.3.2 \. Asynchronous Transfer

```ada
Sensor_Reader.Start;
-- Continue immediately without waiting
```

Use `pragma Asynchronous` for true fire-and-forget communication where the caller doesn't wait for the task to complete.

#### 1.2.3.3 \. Timed Entry Call

```ada
select
   Sensor_Reader.Get_Value(V);
or
   delay 0.5; -- 500ms timeout
   raise Timeout_Error;
end select;
```

Prevents indefinite blocking with timeout handling—critical for responsive applications.

#### 1.2.3.4 \. Conditional Call

```ada
select
   Sensor_Reader.Get_Value(V);
else
   -- Proceed without value
   Handle_Missing_Data;
end select;
```

Executes alternative code if the entry isn't immediately available, making your program more resilient.

## 1.3 Protected Objects: Safe Shared Data

While tasks handle active concurrency, protected objects provide safe access to shared data—solving the most common source of concurrency bugs.

### 1.3.1 Why Protected Objects Beat Mutexes

#### 1.3.1.1 Traditional Mutex Approach

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

#### 1.3.1.2 Ada Protected Objects

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

### 1.3.2 Protected Object Implementation

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

#### 1.3.2.1 Key Elements

- `when` clause: Entry barrier (compile-time checked)
- Automatic mutual exclusion
- No explicit locks required
- Priority inheritance prevents inversion

#### 1.3.2.2 How It Works

1. Caller attempts entry call
2. Barrier condition evaluated
3. If true, caller gains access
4. If false, caller queued
5. Automatic lock released on exit

### 1.3.3 Protected Objects vs. Traditional Locks: A Comparison

| Feature | Traditional Mutex | Ada Protected Objects |
| :--- | :--- | :--- |
| **Lock management** | Manual lock/unlock sequence | Automatic lock management |
| **Deadlock prevention** | Requires careful lock ordering; prone to deadlocks | Compile-time deadlock detection |
| **Priority inversion** | Possible; requires manual handling | Built-in priority inheritance |
| **Entry barriers** | Not available; need manual checks | Compile-time checked conditions (when clauses) |
| **Code complexity** | Higher; error-prone | Lower; safer by design |

This table highlights why protected objects are superior to traditional mutexes. With protected objects, the compiler verifies that your synchronization logic is correct before your program even runs. You don't have to remember to unlock mutexes or worry about deadlocks—the language handles it for you.

## 1.4 Advanced Concurrency Patterns

### 1.4.1 \. Priority-Based Scheduling

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

#### 1.4.1.1 Real-World Example: Home Automation System

In a home automation system, you might have:

- A high-priority task for emergency shutdowns
- Medium-priority tasks for temperature control
- Low-priority tasks for background logging

This ensures that critical operations always get executed first, even when the system is busy.

### 1.4.2 \. Real-Time Deadline Monitoring

Ensure tasks meet timing requirements:

```ada
task Climate_Control is
   pragma Task_Dispatching_Policy (EDF_Within_Priorities);
   pragma Deadline (Seconds => 0.01); -- 10ms deadline
end Climate_Control;
```

The runtime monitors deadlines and raises exceptions if missed. This is crucial for responsive applications like video games or web servers where slow responses frustrate users.

### 1.4.3 \. Rendezvous with Parameters

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

Parameters are safely copied during the rendezvous—no risk of data corruption from concurrent access.

### 1.4.4 \. Dynamic Task Creation

Create tasks at runtime with controlled scope:

```ada
task type Worker is
   -- Definition
end Worker;

type Worker_Access is access Worker;

-- Create dynamically:
W : Worker_Access := new Worker;
```

Use with caution in safety-critical systems; often better to use task pools for predictable behavior.

#### 1.4.4.1 Priority Inversion: The Mars Pathfinder Story

In 1997, the Mars Pathfinder lander experienced repeated system resets due to priority inversion. A low-priority meteorological task held a mutex needed by a high-priority communications task, but was preempted by medium-priority tasks. This caused the communications task to miss deadlines.

Ada's priority inheritance protocol would have automatically elevated the low-priority task's priority while it held the mutex, preventing the inversion. The problem was eventually fixed with a software patch that implemented priority inheritance—a feature built into Ada's protected objects from the start.

## 1.5 Combining Contracts with Concurrency

One of Ada's most powerful capabilities is applying Design by Contract principles to concurrent systems. This creates verifiable guarantees about concurrent behavior.

### 1.5.1 Contract Patterns for Tasks

#### 1.5.1.1 Task Interface Contracts

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

These contracts ensure valid state transitions for the task interface. For example, you can't stop a sensor that's not running, and after stopping, it must not be running.

#### 1.5.1.2 Protected Object Contracts

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
```

Contracts on protected objects ensure data integrity across concurrent accesses. In this example, the `Check_Temperature` entry will only trigger an alarm if the temperature exceeds the threshold, and the contract guarantees this behavior.

### 1.5.2 Verification of Concurrent Properties

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

With these contracts, SPARK can prove that controls cannot be modified when locked. This verification happens at compile time, so you know your system is correct before it ever runs.

### 1.5.3 Common Concurrency Pitfalls and Solutions

#### 1.5.3.1 Pitfall: Deadlock from Circular Dependencies

```
-- Task A
accept Resource_B;
accept Resource_A;

-- Task B
accept Resource_A;
accept Resource_B;
```

#### 1.5.3.2 Solution: Resource Ordering Protocol

```
-- Always acquire in same order
-- Task A and B both:
accept Resource_A;
accept Resource_B;
```

Ada's compile-time checks can detect potential deadlocks when resource ordering is violated. By enforcing a consistent order for acquiring resources, you eliminate the possibility of circular dependencies.

## 1.6 Real-World Concurrency Applications

### 1.6.1 Home Automation System

A home automation system for temperature and humidity control:

```ada
protected Home_Environment is
   entry Set_Temperature (Temp : Celsius) with
      Pre => Temp in -20.0..50.0;

   entry Set_Humidity (Humidity : Percent) with
      Pre => Humidity in 0.0..100.0;

   function Get_Temperature return Celsius;
   function Get_Humidity return Percent;

private
   Current_Temp : Celsius := 22.0;
   Current_Hum  : Percent := 45.0;
end Home_Environment;

task Temperature_Sensor is
   pragma Priority (Medium_Priority);
end Temperature_Sensor;

task Humidity_Sensor is
   pragma Priority (Medium_Priority);
end Humidity_Sensor;

task Climate_Control is
   pragma Priority (High_Priority);
   -- Processing logic
end Climate_Control;
```

This structure ensures safe data sharing between sensors and control systems while maintaining valid temperature and humidity ranges. The protected object automatically handles synchronization, so you don't have to worry about race conditions.

### 1.6.2 Web Server Example

A simple web server handling multiple client connections:

```ada
protected Request_Handler is
   entry Handle_Request (Request : String; Response : out String) with
      Pre => Request'Length <= MAX_REQUEST_SIZE;

   function Get_Request_Count return Natural;
private
   Requests : array (1..100) of String(1..100);
   Count : Natural := 0;
end Request_Handler;

task type Client_Task is
   -- Task definition
end Client_Task;
```

This server can handle up to 100 simultaneous requests with proper synchronization. The protected object ensures that multiple clients can access the request queue without corrupting data. The contract guarantees that requests won't exceed the maximum size, preventing buffer overflows.

#### 1.6.2.1 Real-World Benefits

- **No data corruption**: The protected object ensures that multiple clients can access shared data safely
- **Deadlock prevention**: The compiler checks for potential deadlocks at compile time
- **Priority management**: Critical operations like emergency shutdowns get processed first
- **Timeout handling**: Clients won't wait indefinitely for responses
- **Correctness verification**: Contracts prove that the system behaves as expected

## 1.7 Exercises: Building Safe Concurrent Systems

### 1.7.1 Exercise 1: Home Automation System

Design a concurrent home automation system:

- Create tasks for temperature and humidity sensors with different update rates
- Implement protected objects for shared environment data
- Add contracts to ensure valid temperature and humidity ranges
- Set appropriate priorities for critical operations (e.g., emergency shutdown)
- Verify absence of deadlocks with SPARK

> **Challenge:** Prove that the system never allows invalid temperature readings.

#### 1.7.1.1 Solution Guidance

Start by defining your protected object with contracts:

```ada
protected Home_Environment is
   entry Set_Temperature (Temp : Celsius) with
      Pre => Temp in -20.0..50.0,
      Post => Get_Temperature = Temp;

   entry Set_Humidity (Humidity : Percent) with
      Pre => Humidity in 0.0..100.0,
      Post => Get_Humidity = Humidity;

   function Get_Temperature return Celsius;
   function Get_Humidity return Percent;

private
   Current_Temp : Celsius := 22.0;
   Current_Hum  : Percent := 45.0;
end Home_Environment;
```

Then create sensor tasks:

```ada
task Temperature_Sensor is
   pragma Priority (Medium_Priority);
end Temperature_Sensor;

task body Temperature_Sensor is
begin
   loop
      -- Read hardware sensor
      declare
         Value : Celsius := Read_Hardware_Temperature;
      begin
         Home_Environment.Set_Temperature(Value);
      end;
      delay 5.0; -- 5 seconds between readings
   end loop;
end Temperature_Sensor;
```

Finally, add a climate control task that processes data:

```ada
task Climate_Control is
   pragma Priority (High_Priority);
end Climate_Control;

task body Climate_Control is
begin
   loop
      select
         accept Adjust_Temperature (Target : Celsius) do
            Home_Environment.Set_Temperature(Target);
         end Adjust_Temperature;
      or
         delay 1.0; -- Check every second
         if Home_Environment.Get_Temperature > 30.0 then
            -- Activate cooling
         end if;
      end select;
   end loop;
end Climate_Control;
```

This system ensures that temperature readings are always valid and that critical operations get processed first. The contracts prevent invalid temperatures from being set, and the priority settings ensure that emergency actions take precedence.

### 1.7.2 Exercise 2: Web Server Example

Build a web server with:

- Multiple client connection tasks
- Protected objects for shared request queue
- Contracts ensuring valid request processing
- Deadline monitoring for response times
- Formal verification of safety properties

> **Challenge:** Prove that the server can handle concurrent requests without data corruption.

#### 1.7.2.1 Solution Guidance

Start by defining the protected request handler:

```ada
protected Request_Handler is
   entry Handle_Request (Request : String; Response : out String) with
      Pre => Request'Length <= MAX_REQUEST_SIZE,
      Post => (if Handle_Request'Result then
               Response'Length > 0);

   function Get_Request_Count return Natural;
private
   Requests : array (1..100) of String(1..100);
   Count : Natural := 0;
end Request_Handler;
```

Then create a client task:

```ada
task type Client_Task is
   pragma Priority (Medium_Priority);
end Client_Task;

task body Client_Task is
   Request : String(1..100);
   Response : String(1..100);
begin
   loop
      -- Get request from client
      Request := Get_Client_Request;
      
      select
         Request_Handler.Handle_Request(Request, Response);
      or
         delay 0.5; -- 500ms timeout
         Response := "Timeout: Server busy";
      end select;
      
      -- Send response to client
      Send_Response(Response);
   end loop;
end Client_Task;
```

Finally, create a task pool for handling requests:

```ada
task type Request_Handler_Task is
   pragma Priority (High_Priority);
end Request_Handler_Task;

task body Request_Handler_Task is
   Request : String(1..100);
   Response : String(1..100);
begin
   loop
      select
         accept Handle_Request (Req : String; Res : out String) do
            Request := Req;
            -- Process request
            Response := Process_Request(Req);
         end Handle_Request;
      else
         delay 0.1; -- Yield to other tasks
      end select;
      
      -- Send response back to client
      Send_Response(Response);
   end loop;
end Request_Handler_Task;
```

This server handles up to 100 requests simultaneously with proper synchronization. The contracts ensure that requests won't exceed the maximum size, and the timeout handling prevents clients from waiting indefinitely. The priority settings ensure that critical operations get processed first.

## 1.8 Verification Strategy for Concurrent Systems

1. **Start with runtime checking** (`-gnata`) to catch basic errors
2. **Add contracts to all task interfaces and protected objects**
3. **Use `gnatprove --level=1` for basic verification**
4. **For critical systems, transition to SPARK subset**
5. **Focus verification efforts on shared data and state transitions**
6. **Test timing properties with real hardware**

This multi-layered approach ensures comprehensive verification of concurrent systems. By starting with simple runtime checks and gradually adding more rigorous verification, you can build confidence in your system's correctness.

## 1.9 Next Steps: Real-Time Systems Programming

Now that you've mastered Ada's concurrency model, you're ready to apply these techniques to real-time systems where timing guarantees are as critical as functional correctness. In the next tutorial, we'll explore how to:

### 1.9.1 Upcoming: Real-Time Systems in Ada

- Implement precise timing constraints
- Use Ada's real-time dispatching policies
- Verify worst-case execution times
- Combine contracts with timing requirements
- Build systems that meet DO-178C and IEC 62304 requirements

### 1.9.2 Practice Challenge

Enhance your home automation system with real-time features:

- Add deadlines to all critical operations
- Implement rate-monotonic scheduling
- Verify timing properties with SPARK
- Add temporal contracts to your specifications
- Test under simulated high-load conditions

#### 1.9.2.1 The Power of Integrated Concurrency

Ada's approach to concurrency represents a fundamental shift from how most languages handle parallelism. Rather than exposing low-level mechanisms that are easy to misuse, Ada provides high-level abstractions with built-in safety. This transforms concurrency from a source of bugs into a reliable engineering tool.

When combined with strong typing and Design by Contract, Ada's concurrency model enables the development of systems that are not just concurrent, but _provably correct_ in their parallel behavior. This is why Ada remains the language of choice for systems where timing errors can have catastrophic consequences.

For everyday applications, this means your home automation system will never crash when multiple sensors update simultaneously, your web server will handle peak traffic without data corruption, and your applications will respond predictably even under heavy load. The discipline Ada enforces today prevents problems tomorrow—whether you're building a simple calculator or a complex data processing pipeline.