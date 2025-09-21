# 4. Design by Contract in Ada

Design by Contract (DbC) transforms software development from a process of debugging to one of formal verification. Introduced in Ada 2012, this paradigm allows developers to specify precise behavioral requirements directly in code, enabling the compiler to verify correctness properties at both compile-time and runtime. This tutorial explores how to implement robust contracts that catch errors early, document system behavior precisely, and form the foundation for mathematical verification in complex systems.

>Traditional development: "Let's write code and see if it works."  
>Ada with contracts: "Let's specify exactly how it must work, then verify compliance."

## 1.1 The Contract Paradigm: Beyond Unit Testing

While unit tests verify specific input/output pairs, contracts define universal properties that must hold for all possible executions. This shift from testing to specification is fundamental to building truly reliable systems.

### 1.1.1 Traditional Unit Testing

- Verifies specific test cases
- Cannot prove absence of errors
- Documentation separate from code
- Brittle to refactoring
- Runtime verification only

```ada
-- Typical test case
Assert (Calculate_Factorial(5) = 120, "Factorial 5 failed");
```

### 1.1.2 Design by Contract

- Specifies universal properties
- Can prove absence of certain errors
- Documentation embedded in code
- Self-documenting through specifications
- Verification at multiple levels (compile, run, formal)

```ada
function Factorial (N : Natural) return Positive with
   Pre  => N <= 12,
   Post => Factorial'Result > 0 and
           (if N > 0 then Factorial'Result mod N = 0);
```

### 1.1.3 Contract Components Explained

#### 1.1.3.1 Preconditions (`Pre`)

Requirements that must be true for the caller before invoking the subprogram. They define the subprogram's domain of responsibility.

- Specify valid input ranges
- Define required state conditions
- Enforce interface contracts

#### 1.1.3.2 Postconditions (`Post`)

Guarantees provided by the subprogram after execution. They define what the subprogram promises to deliver.

- Specify output properties
- Document state changes
- Define relationships between inputs and outputs

## 1.2 Implementing Contracts in Ada 2012+

### 1.2.1 Basic Contract Syntax

Contracts are specified using aspect syntax directly in the subprogram declaration:

```ada
function Square_Root (X : Float) return Float with
   Pre  => X >= 0.0,
   Post => Square_Root'Result * Square_Root'Result = X and
           Square_Root'Result >= 0.0;
```

### 1.2.2 Key Syntax Notes

- Contracts use `=>` (implies) rather than `:=`
- `'Result` refers to the function's return value
- Multiple conditions can be combined with `and`, `or`
- Contracts can reference parameters and global variables

### 1.2.3 Advanced Contract Features

#### 1.2.3.1 Old Values in Postconditions

Reference original parameter values using `Old`:

```ada
procedure Increment (X : in out Integer) with
   Pre  => X < Integer'Last,
   Post => X = X'Old + 1;
```

Without `Old`, `X` in the postcondition would refer to the updated value.

#### 1.2.3.2 Class-wide Preconditions

For dispatching operations, use `Pre'Class`:

```ada
procedure Process (S : Sensor'Class) with
   Pre'Class => S.Is_Active;
```

Ensures the precondition applies to all derived types in the hierarchy.

## 1.3 Real-World Contract Applications

### 1.3.1 Calculator Application

Contracts for a division operation prevent division by zero errors:

```ada
function Divide (A, B : Float) return Float with
   Pre  => B /= 0.0,
   Post => Divide'Result * B = A;
```

This simple contract ensures the divisor is never zero and that the result satisfies the mathematical relationship between inputs and output.

### 1.3.2 Temperature Conversion System

Contracts for a temperature conversion system ensure valid ranges and accurate calculations:

```ada
function Celsius_to_Fahrenheit (C : Float) return Float with
   Pre  => C >= -273.15,
   Post => Celsius_to_Fahrenheit'Result >= -459.67;

function Fahrenheit_to_Celsius (F : Float) return Float with
   Pre  => F >= -459.67,
   Post => Fahrenheit_to_Celsius'Result >= -273.15;
```

These contracts prevent physically impossible temperature conversions and ensure mathematical correctness.

### 1.3.3 Inventory Management System

Contracts for a stock management system ensure valid operations:

```ada
procedure Add_Inventory (Item : String; Quantity : Natural) with
   Pre  => Quantity > 0,
   Post => Get_Quantity(Item) = Get_Quantity(Item)'Old + Quantity;

procedure Remove_Inventory (Item : String; Quantity : Natural) with
   Pre  => Quantity <= Get_Quantity(Item),
   Post => Get_Quantity(Item) = Get_Quantity(Item)'Old - Quantity;
```

These contracts prevent negative stock levels and ensure inventory quantities remain consistent.

## 1.4 Type Invariants: Protecting Data Integrity

While pre/post conditions govern subprogram behavior, type invariants ensure data structure consistency throughout the program's execution.

### 1.4.1 Defining and Using Invariants

```ada
type Bank_Account is record
   Balance : Float;
   Owner   : String (1..50);
end record with
   Type_Invariant =>
      Bank_Account.Balance >= 0.0 and
      Bank_Account.Owner'Length > 0;

function Is_Valid (A : Bank_Account) return Boolean is
   (A.Balance >= 0.0 and A.Owner'Length > 0);
```

#### 1.4.1.1 When Invariants Are Checked

- At the end of object initialization
- After any operation that could modify the object
- At subprogram boundaries when objects are passed
- Explicitly with `Assert (A in Bank_Account)`

#### 1.4.1.2 Best Practices

- Define invariants for all critical data structures
- Keep them simple and verifiable
- Use them to enforce domain constraints
- Combine with subprogram contracts for complete verification

### 1.4.2 Practical Application: Calendar Event System

Ensure calendar events maintain consistency:

```ada
type Calendar_Event is record
   Start_Time : Time;
   End_Time   : Time;
   Title      : String (1..100);
end record with
   Type_Invariant =>
      Start_Time <= End_Time and
      Title'Length > 0;

function Is_Valid (E : Calendar_Event) return Boolean is
   (E.Start_Time <= E.End_Time and E.Title'Length > 0);
```

This invariant ensures events always have valid time ranges and non-empty titles.

## 1.5 Verification Levels: From Runtime Checks to Formal Proof

### 1.5.1 Level 1: Runtime Contract Checking

Basic enforcement during execution:

```bash
gnatmake -gnata your_program.adb
```

This compiles with runtime checks for all contracts. Violations raise `Assert_Failure`.

- Catches errors during testing
- Adds minimal runtime overhead
- Essential for general development

### 1.5.2 Level 2: Static Verification

Prove contracts hold without execution:

```bash
gnatprove --level=1 --report=all your_program.adb
```

Uses formal methods to prove contracts are always satisfied.

- Verifies absence of runtime errors
- Requires precise contracts
- Higher assurance than testing alone

### 1.5.3 Level 3: SPARK Formal Verification

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
- Required for highest assurance applications

#### 1.5.3.1 Verification Level Comparison

| Verification Level | Confidence | Effort | Best For |
| :--- | :--- | :--- | :--- |
| **Runtime Checking** | Medium | Low | Development and testing |
| **Static Verification** | High | Moderate | Complex logic verification |
| **Formal Proof (SPARK)** | Very High | High | Mathematical proof of correctness |

## 1.6 Advanced Contract Patterns

### 1.6.1 Pattern 1: State Machine Contracts

Specify valid state transitions for complex systems:

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

### 1.6.2 Why State Machine Contracts Matter

In a home automation system, state machine contracts ensure only valid transitions occur. For example, a thermostat can't transition directly from "Off" to "Running" without going through "Initializing" first. This prevents logical errors that could cause unexpected behavior in your smart home system.

### 1.6.3 Pattern 2: Data Flow Contracts

Verify complex data transformations:

```ada
function Process_Sensor_Data (Raw : Sensor_Array) return Processed_Data with
   Pre  => Raw'Length > 0 and Raw'Length <= MAX_SENSOR_COUNT,
   Pre  => (for all I in Raw'Range => Raw(I).Quality > MIN_QUALITY),
   Post => Processed_Data'Result'Length = Raw'Length and
           (for all I in Processed_Data'Result'Range =>
              Processed_Data'Result(I).Value in VALID_RANGE);
```

### 1.6.4 Avoiding Common Contract Mistakes

#### 1.6.4.1 Mistake: Overly Complex Contracts

```ada
-- Hard to verify and understand
Pre => (A and (B or C)) xor (D and not E);
```

#### 1.6.4.2 Solution: Break into Helper Functions

```ada
function Valid_Configuration (C : Config) return Boolean is
   (C.A and (C.B or C.C));

function Safe_Operation (C : Config) return Boolean is
   (C.D and not C.E);

Pre => Valid_Configuration(C) xor Safe_Operation(C);
```

## 1.7 Exercises: Building Contract-First Systems

### 1.7.1 Exercise 1: Calculator Application

Design a contract-first calculator system:

- Define preconditions for all arithmetic operations
- Specify postconditions that ensure mathematical correctness
- Create type invariants for numeric types
- Verify that impossible operations are contractually prohibited

**Challenge:** Prove that division by zero is impossible through contracts.

#### 1.7.1.1 Solution Guidance

Start by defining a safe division function:

```ada
function Divide (A, B : Float) return Float with
   Pre  => B /= 0.0,
   Post => Divide'Result * B = A;
```

Create type invariants for your numeric types:

```ada
type Valid_Float is new Float with
   Type_Invariant => Valid_Float in Float'First .. Float'Last;
```

For subtraction, ensure no overflow:

```ada
function Subtract (A, B : Float) return Float with
   Pre  => A >= B,
   Post => Subtract'Result = A - B;
```

### 1.7.2 Exercise 2: Inventory Management System

Implement contracts for a retail inventory system:

- Preconditions ensuring valid item names and quantities
- Postconditions preserving inventory consistency
- Type invariants for product records
- Contracts that prevent negative stock levels

**Challenge:** Prove that total inventory value remains consistent after transactions.

#### 1.7.2.1 Solution Guidance

Define a product record with invariants:

```ada
type Product is record
   Name     : String (1..50);
   Price    : Float;
   Quantity : Natural;
end record with
   Type_Invariant =>
      Product.Price >= 0.0 and
      Product.Quantity >= 0 and
      Product.Name'Length > 0;
```

Create transaction contracts:

```ada
procedure Add_Item (Item : Product) with
   Pre  => Get_Quantity(Item.Name) = 0,
   Post => Get_Quantity(Item.Name) = Item.Quantity;

procedure Remove_Item (Item_Name : String; Quantity : Natural) with
   Pre  => Quantity <= Get_Quantity(Item_Name),
   Post => Get_Quantity(Item_Name) = Get_Quantity(Item_Name)'Old - Quantity;
```

## 1.8 Verification Strategy

1. Start with runtime checking (`-gnata`)
2. Add contracts incrementally, starting with critical operations
3. Use `gnatprove --level=1` to identify provable contracts
4. Refine contracts based on verification results
5. For complex components, move to SPARK for full verification

## 1.9 Next Steps: Concurrency and Contracts

With Design by Contract mastered, you're ready to combine these techniques with Ada's built-in concurrency model. In the next tutorial, we'll explore how to:

### 1.9.1 Upcoming: Safe Concurrency with Contracts

- Apply contracts to task interfaces
- Use protected objects with formal specifications
- Verify absence of race conditions
- Combine contracts with real-time scheduling
- Formally verify concurrent system properties

### 1.9.2 Practice Challenge

Enhance your calculator application with concurrency:

- Create tasks for different operations
- Specify contracts for task interactions
- Use protected objects with invariants for shared state
- Verify that conflicting operations cannot occur

#### 1.9.2.1 The Path to Verified Systems

Design by Contract transforms Ada from a safe language into a _verifiable_ language. When combined with strong typing and formal methods, it provides a pathway from traditional development to mathematically verified software. This is why Ada remains the language of choice for systems where correctness matters.

As you progress through this tutorial series, you'll see how these techniques combine to create software that's not just less error-prone, but _provably correct_ within its specified domain. Whether you're building a simple calculator or a complex inventory system, contracts give you the tools to ensure your software behaves exactly as intended.

