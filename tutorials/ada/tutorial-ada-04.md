# 4\. Design by Contract in Ada: Formal Verification for Safety-Critical Systems

Design by Contract (DbC) transforms software development from a process of debugging to one of formal verification. Introduced in Ada 2012, this paradigm allows developers to specify precise behavioral requirements directly in code, enabling the compiler to verify correctness properties at both compile-time and runtime. This tutorial explores how to implement robust contracts that catch errors early, document system behavior precisely, and form the foundation for mathematical verification in critical systems.

#### From Testing to Proving

Traditional development: "Let's write code and see if it works."  
Ada with contracts: "Let's specify exactly how it must work, then verify compliance."

## The Contract Paradigm: Beyond Unit Testing

While unit tests verify specific input/output pairs, contracts define universal properties that must hold for all possible executions. This shift from testing to specification is fundamental to building truly reliable systems.

#### Traditional Unit Testing

- Verifies specific test cases
- Cannot prove absence of errors
- Documentation separate from code
- Brittle to refactoring
- Runtime verification only

```ada
  -- Typical test case
  Assert (Calculate_Factorial(5) = 120, "Factorial 5 failed");
```

#### Design by Contract

- Specifies universal properties
- Can prove absence of certain errors
- Documentation embedded in code
- Self-documenting through specifications
- Verification at multiple levels (compile, run, formal)

```ada
  function Factorial (N : Natural) return Positive with
  Pre => N <= 12,
  Post => Factorial'Result > 0 and
  (if N > 0 then Factorial'Result mod N = 0);
```

#### Contract Components Explained

##### Preconditions (`Pre`)

Requirements that must be true for the caller before invoking the subprogram. They define the subprogram's domain of responsibility.

- Specify valid input ranges
- Define required state conditions
- Enforce interface contracts

##### Postconditions (`Post`)

Guarantees provided by the subprogram after execution. They define what the subprogram promises to deliver.

- Specify output properties
- Document state changes
- Define relationships between inputs and outputs

## Implementing Contracts in Ada 2012+

### Basic Contract Syntax

Contracts are specified using aspect syntax directly in the subprogram declaration:

```ada
    function Square_Root (X : Float) return Float with
       Pre  => X >= 0.0,
       Post => Square_Root'Result * Square_Root'Result = X and
               Square_Root'Result >= 0.0;
```

### Key Syntax Notes

- Contracts use `=>` (implies) rather than `:=`
- `'Result` refers to the function's return value
- Multiple conditions can be combined with `and`, `or`
- Contracts can reference parameters and global variables

### Advanced Contract Features

#### Old Values in Postconditions

Reference original parameter values using `Old`:

```ada
    procedure Increment (X : in out Integer) with
       Pre  => X < Integer'Last,
       Post => X = X'Old + 1;
```

Without `Old`, `X` in the postcondition would refer to the updated value.

#### Class-wide Preconditions

For dispatching operations, use `Pre'Class`:

```ada
    procedure Process (S : Sensor'Class) with
       Pre'Class => S.Is_Active;
```

Ensures the precondition applies to all derived types in the hierarchy.

## Real-World Contract Applications

### Aviation System: Flight Control

Contracts for a critical flight control function:

```ada
    procedure Adjust_Elevator (
       Current_Angle : in     Elevator_Angle;
       Target_Angle  : in     Elevator_Angle;
       Rate_Limit    : in     Angle_Rate;
       New_Angle     :    out Elevator_Angle) with
       Pre  => abs (Target_Angle - Current_Angle) <= MAX_MANEUVER,
       Pre  => Rate_Limit <= MAX_RATE,
       Post => abs (New_Angle - Current_Angle) <= Rate_Limit and
               New_Angle in Current_Angle-10 .. Current_Angle+10 and
               (if Target_Angle > Current_Angle then New_Angle > Current_Angle) and
               (if Target_Angle < Current_Angle then New_Angle < Current_Angle);
```

These contracts ensure physically impossible maneuvers cannot be commanded.

### Medical Device: Drug Infusion

Contracts for a life-critical infusion calculation:

```ada
    function Calculate_Infusion_Rate (
       Patient_Weight : Weight_Kg;
       Drug_Concentration : Concentration;
       Dosage : Dosage_Mg_Per_Kg) return Flow_Rate_ML_Per_Hour with
       Pre  => Patient_Weight > 0.0 and
               Drug_Concentration > 0.0 and
               Dosage >= MIN_DOSE and Dosage <= MAX_DOSE,
       Post => Calculate_Infusion_Rate'Result >= MIN_FLOW_RATE and
               Calculate_Infusion_Rate'Result <= MAX_FLOW_RATE and
               abs (Calculate_Infusion_Rate'Result * Drug_Concentration -
                    Patient_Weight * Dosage) < TOLERANCE;
```

Prevents dangerous dosage errors through mathematical verification.

### The Therac-25 Radiation Therapy Machine

In the 1980s, a software error in the Therac-25 radiation therapy machine caused massive overdoses, resulting in patient deaths. The error occurred because:

- No preconditions checked input sequence validity
- No postconditions verified safe radiation levels
- State transitions weren't formally specified

With Ada's contracts, these safety properties could have been specified and verified:

```ada
    procedure Deliver_Radiation (
       Mode : Radiation_Mode;
       Dose : Radiation_Dose) with
       Pre  => (if Mode = ELECTRON then Dose <= MAX_ELECTRON_DOSE) and
               (if Mode = X_RAY then Dose <= MAX_XRAY_DOSE) and
               System_State = READY,
       Post => Radiation_Active = (Dose > 0.0);
```

## Type Invariants: Protecting Data Integrity

While pre/post conditions govern subprogram behavior, type invariants ensure data structure consistency throughout the program's execution.

### Defining and Using Invariants

```ada
    type Temperature_Sensor is record
       ID      : Sensor_ID;
       Reading : Celsius;
       Status  : Sensor_Status;
    end record with
       Type_Invariant =>
          (if Status = Operational then Reading in VALID_TEMPERATURE_RANGE) and
          (Status /= Failed or Alert_History'Length > 0);

    function Is_Consistent (S : Temperature_Sensor) return Boolean is
       (S.Status /= Operational or S.Reading in VALID_TEMPERATURE_RANGE);
```

#### When Invariants Are Checked

- At the end of object initialization
- After any operation that could modify the object
- At subprogram boundaries when objects are passed
- Explicitly with `Assert (S in Temperature_Sensor)`

#### Best Practices

- Define invariants for all critical data structures
- Keep them simple and verifiable
- Use them to enforce domain constraints
- Combine with subprogram contracts for complete verification

### Practical Application: Database Record Integrity

Ensure database records maintain consistency:

```ada
    type Patient_Record is record
       ID           : Patient_ID;
       Name         : String (1..100);
       Weight       : Weight_Kg;
       Height       : Height_Cm;
       BMI          : BMI_Value;
       Last_Updated : Time;
    end record with
       Type_Invariant =>
          Weight > 0.0 and
          Height > 0.0 and
          BMI = Weight / (Height/100.0)**2 and
          BMI in 10.0..100.0 and
          Last_Updated <= Clock;
```

This invariant ensures BMI is always correctly calculated and within valid ranges.

## Verification Levels: From Runtime Checks to Formal Proof

### Level 1: Runtime Contract Checking

Basic enforcement during execution:

```bash
    gnatmake -gnata your_program.adb
```

This compiles with runtime checks for all contracts. Violations raise `Assert_Failure`.

- Catches errors during testing
- Adds minimal runtime overhead
- Essential for safety-critical deployments

### Level 2: Static Verification

Prove contracts hold without execution:

```bash
    gnatprove --level=1 --report=all your_program.adb
```

Uses formal methods to prove contracts are always satisfied.

- Verifies absence of runtime errors
- Requires precise contracts
- Higher assurance than testing alone

### Level 3: SPARK Formal Verification

Mathematical proof of correctness:

```ada
    -- In SPARK subset
    function Factorial (N : Natural) return Positive with
       Pre  => N <= 12,
       Post => Factorial'Result = (if N = 0 then 1 else N * Factorial(N-1));
```

SPARK's simplified subset enables complete formal verification.

- Proves functional correctness
- Verifies absence of all runtime errors
- Required for highest safety certifications

#### Verification Level Comparison

| Verification Level | Confidence | Effort | Best For |
| :--- | :--- | :--- | :--- |
| Runtime Checking | Medium | Low | General safety-critical systems |
| Static Verification | High | Moderate | Certified safety systems (DO-178C Level B) |
| Formal Proof (SPARK) | Very High | High | Highest safety systems (DO-178C Level A) |

## Advanced Contract Patterns

### Pattern 1: State Machine Contracts

Specify valid state transitions for critical systems:

```ada
    type System_State is (Off, Initializing, Ready, Running, Degraded, Failed);

    function Valid_Transition (Current, Next : System_State) return Boolean is
       (case Current is
          when Off        => Next = Initializing,
          when Initializing => Next in Ready | Failed,
          when Ready      => Next in Running | Degraded | Failed,
          when Running    => Next in Degraded | Failed,
          when Degraded   => Next in Running | Failed,
          when Failed     => Next = Failed);

    procedure Transition (Current : in out System_State; Next : System_State) with
       Pre  => Valid_Transition(Current, Next),
       Post => Current = Next and
               (if Current = Failed then Next = Failed);
```

### Why State Machine Contracts Matter

In the 2004 Mars Exploration Rover mission, a state machine error caused Spirit rover to repeatedly reboot. Formal state contracts would have prevented this by ensuring only valid transitions could occur.

### Pattern 2: Data Flow Contracts

Verify complex data transformations:

```ada
    function Process_Sensor_Data (Raw : Sensor_Array) return Processed_Data with
       Pre  => Raw'Length > 0 and Raw'Length <= MAX_SENSOR_COUNT,
       Pre  => (for all I in Raw'Range => Raw(I).Quality > MIN_QUALITY),
       Post => Processed_Data'Result'Length = Raw'Length and
               (for all I in Processed_Data'Result'Range =>
                  Processed_Data'Result(I).Value in VALID_RANGE);
```

### Avoiding Common Contract Mistakes

#### Mistake: Overly Complex Contracts

```ada
    -- Hard to verify and understand
    Pre => (A and (B or C)) xor (D and not E);
```

#### Solution: Break into Helper Functions

```ada
    function Valid_Configuration (C : Config) return Boolean is
       (C.A and (C.B or C.C));

    function Safe_Operation (C : Config) return Boolean is
       (C.D and not C.E);

    Pre => Valid_Configuration(C) xor Safe_Operation(C);
```

## Exercises: Building Contract-First Systems

### Exercise 1: Elevator Control System

Design a contract-first elevator control system:

- Define preconditions for all movement operations
- Specify postconditions that ensure physical safety
- Create invariants for elevator state consistency
- Verify that impossible states are contractually prohibited

**Challenge:** Prove that the elevator cannot move with doors open.

### Exercise 2: Financial Transaction System

Implement contracts for a banking transaction:

- Preconditions ensuring valid accounts and amounts
- Postconditions preserving accounting invariants
- Type invariants for account consistency
- Contracts that prevent race conditions

**Challenge:** Prove that total system funds remain constant.

### Verification Strategy

1.  Start with runtime checking (`-gnata`)
2.  Add contracts incrementally, starting with critical operations
3.  Use `gnatprove --level=1` to identify provable contracts
4.  Refine contracts based on verification results
5.  For critical components, move to SPARK for full verification

## Next Steps: Concurrency and Contracts

With Design by Contract mastered, you're ready to combine these techniques with Ada's built-in concurrency model. In the next tutorial, we'll explore how to:

### Upcoming: Safe Concurrency with Contracts

- Apply contracts to task interfaces
- Use protected objects with formal specifications
- Verify absence of race conditions
- Combine contracts with real-time scheduling
- Formally verify concurrent system properties

### Practice Challenge

Enhance your elevator system with concurrency:

- Create tasks for elevator movement and door control
- Specify contracts for task interactions
- Use protected objects with invariants for shared state
- Verify that conflicting operations cannot occur

#### The Path to Verified Systems

Design by Contract transforms Ada from a safe language into a _verifiable_ language. When combined with strong typing and formal methods, it provides a pathway from traditional development to mathematically verified software. This is why Ada remains the language of choice for systems where failure is not just expensive, but catastrophic.

As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just less error-prone, but _provably correct_ within its specified domain.