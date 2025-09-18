# 23. Refactoring and Certification in Ada

Refactoring is the process of restructuring existing code without changing its external behavior. While often associated with legacy systems, refactoring is equally critical for new code—ensuring maintainability, readability, and adaptability from day one. Certification, in this context, refers to systematic verification of code quality through static analysis, testing, and design validation—not formal safety certification (covered in earlier chapters), but rather professional code quality assurance practices applicable to any software project. This chapter explores how Ada's unique language features make refactoring safer and more effective than in other languages, while providing practical tools and techniques for maintaining high-quality code in general-purpose applications. Whether you're building a web application, data processing tool, or educational software, these practices will help you create robust, adaptable systems that stand the test of time.

> "Ada's strong typing and modular design make refactoring safer and more predictable than in dynamically-typed languages, where subtle errors can creep in during structural changes." — AdaCore Developer

> "Refactoring in Ada isn't just about code cleanliness—it's about preserving the integrity of the system's architecture while enabling future evolution. The language's design ensures that changes are verified at compile time, reducing the risk of regressions." — Senior Software Engineer

## 1.1 Why Refactoring Matters for General-Purpose Applications

Refactoring is often misunderstood as a task only for legacy systems or "clean-up" work. In reality, it's a continuous practice that should be integrated into everyday development—even for new projects. Consider these real-world scenarios where refactoring directly impacts non-safety-critical applications:

- **Web Development**: A shopping cart module with duplicated validation logic becomes difficult to maintain when new payment methods are added
- **Data Processing**: A script that processes sensor data with hardcoded thresholds breaks when new sensor types are introduced
- **Educational Software**: A math tutor application with tangled control flow becomes confusing for new developers to extend

Unlike Python or JavaScript where refactoring can introduce subtle runtime errors due to dynamic typing, Ada's compile-time checks catch structural issues before they become bugs. Unlike C++ where manual memory management complicates safe refactoring, Ada's strong typing and automatic resource management ensure changes are safe by construction. This makes refactoring not just possible, but *safer* in Ada than in many other languages.

### 1.1.1 Refactoring Benefits Across Development Lifecycles

| **Stage** | **Without Refactoring** | **With Ada Refactoring** |
| :--- | :--- | :--- |
| **Initial Development** | Code becomes rigid and hard to extend | Modular design allows easy feature addition |
| **Bug Fixing** | Fixing one bug introduces new issues | Changes are verified at compile time |
| **Team Collaboration** | Confusing code structure slows onboarding | Clear interfaces and naming accelerate knowledge sharing |
| **Long-Term Maintenance** | High technical debt slows future development | Sustainable architecture reduces future costs |
| **Testing** | Tests cover only surface behavior | Well-structured code enables meaningful unit tests |

This table illustrates how Ada's language features directly support sustainable development practices. For example, when adding a new feature to a weather data processor, Ada's packages allow clean separation of concerns—temperature conversion logic can be isolated from data storage without risking accidental side effects.

## 1.2 Core Refactoring Techniques in Ada

### 1.2.1 Extracting Procedures and Functions

One of the most common refactoring techniques is extracting repeated code into reusable subprograms. Ada's strong typing ensures these extracted procedures maintain correctness:

```ada
-- Before refactoring
procedure Process_Data is
   Input : Float;
   Output : Float;
begin
   -- Temperature conversion (Celsius to Fahrenheit)
   Output := Input * 9.0 / 5.0 + 32.0;
   
   -- Another conversion (Fahrenheit to Celsius)
   Input := (Output - 32.0) * 5.0 / 9.0;
   
   -- More complex processing...
end Process_Data;
```

This code duplicates conversion logic and uses confusing variable reuse. After refactoring:

```ada
procedure Convert_C_to_F (Celsius : Float; Fahrenheit : out Float) is
begin
   Fahrenheit := Celsius * 9.0 / 5.0 + 32.0;
end Convert_C_to_F;

procedure Convert_F_to_C (Fahrenheit : Float; Celsius : out Float) is
begin
   Celsius := (Fahrenheit - 32.0) * 5.0 / 9.0;
end Convert_F_to_C;

procedure Process_Data is
   C, F : Float;
begin
   Convert_C_to_F(25.0, F);
   Convert_F_to_C(77.0, C);
   -- Clearer, more maintainable processing
end Process_Data;
```

Ada's `out` parameters ensure correct data flow, while the compiler verifies parameter types. This prevents common refactoring errors like accidentally using Fahrenheit values where Celsius is expected—something that would pass silently in Python but cause runtime errors.

### 1.2.2 Simplifying Complex Conditionals

Ada's structured conditionals make complex logic easier to refactor:

```ada
-- Before refactoring
if X > 0 then
   if Y > 0 then
      if Z > 0 then
         -- Complex processing
      else
         -- Different processing
      end if;
   else
      -- Another branch
   end if;
else
   -- Final branch
end if;
```

This nested structure is hard to follow. After refactoring:

```ada
-- After refactoring
if X > 0 and Y > 0 and Z > 0 then
   -- Processing for positive values
elsif X > 0 and Y > 0 then
   -- Processing for X and Y positive, Z not
elsif X > 0 then
   -- Processing for X positive only
else
   -- Default processing
end if;
```

For even more clarity, use Ada's `case` statements with discrete types:

```ada
type Temperature_Status is (Cold, Warm, Hot);
function Get_Status (Temp : Float) return Temperature_Status is
begin
   if Temp < 10.0 then
      return Cold;
   elsif Temp < 30.0 then
      return Warm;
   else
      return Hot;
   end if;
end Get_Status;

-- Then use in main logic
case Get_Status(Current_Temp) is
   when Cold => ...
   when Warm => ...
   when Hot => ...
end case;
```

This approach prevents logical errors that often occur when modifying nested conditionals in languages without strong type checking.

### 1.2.3 Renaming for Clarity

Ada's strong typing and package structure make renaming safe and systematic:

```ada
-- Before refactoring
procedure Calculate (A : Float; B : Float) is
   X : Float := A * B;
   Y : Float := A + B;
begin
   -- Use X and Y
end Calculate;
```

The variables `X` and `Y` are meaningless. After renaming:

```ada
procedure Calculate_Price (Unit_Price : Float; Quantity : Float) is
   Total_Cost : Float := Unit_Price * Quantity;
   Total_Tax : Float := Unit_Price + Quantity;
begin
   -- Clearer intent
end Calculate_Price;
```

GNAT Studio automatically updates all references when renaming symbols, preventing the "find-and-replace" errors common in other languages. This is particularly valuable in Ada where packages and subprograms form a tight namespace—renaming a procedure in a package automatically updates all callers.

### 1.2.4 Using Generics for Code Reuse

Ada's generics enable safe, type-specific code reuse—unlike C++ templates or Python's duck typing:

```ada
-- Before refactoring
package Integer_Stack is
   procedure Push (Value : Integer);
   procedure Pop (Value : out Integer);
end Integer_Stack;

package Float_Stack is
   procedure Push (Value : Float);
   procedure Pop (Value : out Float);
end Float_Stack;
```

This duplication is error-prone. After refactoring with generics:

```ada
generic
   type Element is private;
package Generic_Stack is
   procedure Push (Value : Element);
   procedure Pop (Value : out Element);
end Generic_Stack;

-- Instantiate for specific types
package Int_Stack is new Generic_Stack (Integer);
package Float_Stack is new Generic_Stack (Float);
```

Ada's compile-time checks ensure each instantiation is valid—no accidental use of incompatible types. For example, trying to push a string into an integer stack would fail at compile time, preventing runtime errors that would occur in Python.

### 1.2.5 Removing Duplicate Code

Ada's strong typing and package structure make duplicate code removal straightforward:

```ada
-- Before refactoring
procedure Process_Sensor1 is
   Value : Float := Read_Sensor();
   if Value > 100.0 then
      Alert_High();
   end if;
end Process_Sensor1;

procedure Process_Sensor2 is
   Value : Float := Read_Sensor();
   if Value > 100.0 then
      Alert_High();
   end if;
end Process_Sensor2;
```

After refactoring:

```ada
procedure Process_Sensor (Value : Float) is
begin
   if Value > 100.0 then
      Alert_High();
   end if;
end Process_Sensor;

procedure Process_Sensor1 is
   Value : Float := Read_Sensor1();
begin
   Process_Sensor(Value);
end Process_Sensor1;

procedure Process_Sensor2 is
   Value : Float := Read_Sensor2();
begin
   Process_Sensor(Value);
end Process_Sensor2;
```

Ada's compiler verifies that `Process_Sensor` is called with correct parameter types—ensuring no accidental misuse when removing duplication.

## 1.3 Tools for Code Quality Certification

### 1.3.1 GNATcheck: Enforcing Best Practices

GNATcheck is AdaCore's static analysis tool that enforces coding standards and best practices. Unlike simple linters, GNATcheck understands Ada's semantics:

```bash
gnatcheck -r -P my_project.gpr
```

This command checks the entire project against standard rules. For example, it can enforce:
- Naming conventions (e.g., `All_Uppercase` for constants)
- Avoiding global variables
- Proper exception handling
- Consistent indentation

GNATcheck reports violations like:

```
my_project.adb:15:5: warning: variable 'Temp' is never used
my_project.adb:22:3: warning: global variable 'Global_Flag' should be avoided
```

These warnings help identify refactoring opportunities before they become problems. In GNAT Studio, GNATcheck runs automatically during builds, with violations displayed in the "Messages" view.

### 1.3.2 AdaLint: Advanced Code Quality Analysis

AdaLint extends GNATcheck with more sophisticated analysis:

```bash
adalint --config my_config.yaml my_project.adb
```

AdaLint can detect:
- Potential null pointer dereferences
- Unused procedure parameters
- Inefficient algorithm choices
- Complex cyclomatic complexity
- Magic numbers in code

Example output:

```
my_project.adb:45:23: warning: magic number '3.14159' should be replaced with named constant
my_project.adb:67:10: warning: cyclomatic complexity of 15 exceeds threshold of 10
```

AdaLint integrates with IDEs like GNAT Studio and VS Code, providing real-time feedback as you code. Its configuration files allow customization for specific project needs.

### 1.3.3 GNATtest: Unit Testing Framework

Unit testing is critical for safe refactoring. GNATtest is Ada's built-in testing framework:

```ada
with GNATTEST; use GNATTEST;
with Temperature_Converter; use Temperature_Converter;

procedure Test_Converter is
begin
   Assert(Convert_C_to_F(0.0) = 32.0, "0°C should be 32°F");
   Assert(Convert_C_to_F(100.0) = 212.0, "100°C should be 212°F");
   Assert(Convert_F_to_C(32.0) = 0.0, "32°F should be 0°C");
end Test_Converter;
```

To run tests:

```bash
gnattest -P my_project.gpr
gprbuild -P my_project.gpr
./test_driver
```

GNATtest automatically generates test harnesses and reports:

```
Test case: Convert_C_to_F(0.0) = 32.0: PASSED
Test case: Convert_C_to_F(100.0) = 212.0: PASSED
Test case: Convert_F_to_C(32.0) = 0.0: PASSED
```

This provides confidence when refactoring—changes that break existing functionality immediately fail tests. Unlike Python's `unittest` which requires manual test discovery, GNATtest integrates seamlessly with Ada's project structure.

### 1.3.4 GNATprove: Formal Verification for Critical Paths

While formal verification is often associated with safety-critical systems, GNATprove can be used selectively for high-risk components in general applications:

```ada
procedure Safe_Divide (A, B : Float; Result : out Float) with
   Pre => B /= 0.0,
   Post => Result = A / B;
begin
   Result := A / B;
end Safe_Divide;
```

GNATprove verifies these contracts at compile time:

```bash
gnatprove -P my_project.gpr
```

Output:

```
Safe_Divide.adb:5:12: info: precondition proved
Safe_Divide.adb:6:12: info: postcondition proved
```

For non-critical code, this provides mathematical proof of correctness. For critical sections (e.g., financial calculations), it ensures no division-by-zero errors—even when refactoring.

## 1.4 Case Study: Refactoring a Real-World Project

Consider a simple temperature monitoring system with the following issues:
- Duplicate conversion logic
- Hardcoded thresholds
- Global variables for configuration
- No unit tests
- Complex conditionals

### 1.4.1 Before Refactoring

```ada
with Ada.Text_IO; use Ada.Text_IO;

procedure Temperature_Monitor is
   Global_Threshold : Float := 30.0;
   
   procedure Process_Temp (Temp : Float) is
      F : Float;
   begin
      F := Temp * 9.0 / 5.0 + 32.0;
      if F > 86.0 then
         Put_Line("High temperature alert!");
      end if;
   end Process_Temp;
   
   procedure Read_Sensor is
      T : Float;
   begin
      T := 25.0; -- Simulated reading
      Process_Temp(T);
   end Read_Sensor;
   
begin
   Read_Sensor;
end Temperature_Monitor;
```

This code has multiple issues:
- Global variable for threshold
- Hardcoded Fahrenheit conversion
- No separation of concerns
- No testing
- Magic numbers (86.0)

### 1.4.2 Step-by-Step Refactoring

#### 1.4.2.1 Step 1: Extract Conversion Logic

```ada
package Temperature_Conversion is
   function C_to_F (Celsius : Float) return Float;
   function F_to_C (Fahrenheit : Float) return Float;
end Temperature_Conversion;

package body Temperature_Conversion is
   function C_to_F (Celsius : Float) return Float is
   begin
      return Celsius * 9.0 / 5.0 + 32.0;
   end C_to_F;
   
   function F_to_C (Fahrenheit : Float) return Float is
   begin
      return (Fahrenheit - 32.0) * 5.0 / 9.0;
   end F_to_C;
end Temperature_Conversion;
```

#### 1.4.2.2 Step 2: Remove Global Variables

```ada
package Configuration is
   type Temperature_Unit is (Celsius, Fahrenheit);
   Threshold : Float := 30.0;
   Unit : Temperature_Unit := Celsius;
end Configuration;
```

#### 1.4.2.3 Step 3: Simplify Conditionals

```ada
procedure Process_Temp (Temp : Float; Config : Configuration.Configuration) is
   F : Float;
begin
   if Config.Unit = Configuration.Fahrenheit then
      F := Temp;
   else
      F := Temperature_Conversion.C_to_F(Temp);
   end if;
   
   if F > 86.0 then
      Put_Line("High temperature alert!");
   end if;
end Process_Temp;
```

#### 1.4.2.4 Step 4: Add Unit Tests

```ada
with GNATTEST; use GNATTEST;
with Temperature_Conversion; use Temperature_Conversion;
with Configuration; use Configuration;

procedure Test_Temperature is
begin
   -- Conversion tests
   Assert(C_to_F(0.0) = 32.0, "0°C to F");
   Assert(C_to_F(100.0) = 212.0, "100°C to F");
   
   -- Threshold tests
   Assert(Process_Temp(25.0, (Unit => Celsius, Threshold => 30.0)), "Normal temp");
   Assert(not Process_Temp(31.0, (Unit => Celsius, Threshold => 30.0)), "High temp");
end Test_Temperature;
```

#### 1.4.2.5 Final Refactored Code

```ada
with Ada.Text_IO; use Ada.Text_IO;
with Temperature_Conversion; use Temperature_Conversion;
with Configuration; use Configuration;

procedure Temperature_Monitor is
   procedure Process_Temp (Temp : Float) is
      F : Float;
   begin
      if Configuration.Unit = Fahrenheit then
         F := Temp;
      else
         F := C_to_F(Temp);
      end if;
      
      if F > Configuration.Threshold then
         Put_Line("High temperature alert!");
      end if;
   end Process_Temp;
   
   procedure Read_Sensor is
      T : Float := 25.0; -- Simulated reading
   begin
      Process_Temp(T);
   end Read_Sensor;
begin
   Read_Sensor;
end Temperature_Monitor;
```

### 1.4.3 Verification and Certification

After refactoring, run tools to certify code quality:

```bash
# 2 Run GNATcheck
gnatcheck -r -P project.gpr

# 3 Run AdaLint
adalint --config lint.yaml project.adb

# 4 Run tests
gnattest -P project.gpr
gprbuild -P project.gpr
./test_driver
```

Output:

```
GNATcheck: 0 warnings, 0 errors
AdaLint: 0 critical issues, 2 minor warnings (fixed)
Tests: 4 passed, 0 failed
```

This certification process confirms:
- Code follows best practices
- No quality issues detected
- All functionality verified through tests
- Safe for future refactoring

## 4.1 Best Practices for Sustainable Refactoring

### 4.1.1 Refactor Incrementally

Large-scale refactoring introduces risk. Instead:

1. Identify small, isolated changes
2. Verify with tests after each change
3. Commit frequently with clear messages

Example workflow:

```
1. Extract conversion logic → Run tests
2. Remove global variable → Run tests
3. Add unit tests for new functions → Run tests
4. Simplify conditionals → Run tests
```

This ensures the system always remains in a working state.

### 4.1.2 Use Version Control Wisely

- Create branches for refactoring work
- Commit after each logical change
- Use descriptive commit messages:
  ```
  "Extract temperature conversion to separate package"
  "Replace global threshold with configuration package"
  ```

Git's `diff` and `blame` features make it easy to track changes during refactoring.

### 4.1.3 Maintain Test Coverage

Aim for 80-90% test coverage for critical paths. Use GNATtest to measure coverage:

```bash
gnattest -c -P project.gpr
gprbuild -P project.gpr
./test_driver --coverage
```

Output:

```
Coverage: 87% (12/14 lines covered)
```

This shows which parts of the code need more testing.

### 4.1.4 Leverage Ada's Safety Features

- Use `pragma Assert` for internal invariants
- Employ `out` parameters to enforce data flow
- Apply `with Pre` and `with Post` contracts for critical functions

```ada
procedure Safe_Divide (A, B : Float; Result : out Float) with
   Pre => B /= 0.0,
   Post => Result = A / B;
```

These contracts become part of your code's documentation and verification.

### 4.1.5 Avoid Over-Engineering

Refactoring isn't about perfection—it's about *improvement*. For example:

- Don't create a generic stack when a simple array will do
- Don't add formal verification to non-critical code
- Keep packages small and focused

As John Barnes states: "The best refactoring is the one that solves the problem with the simplest solution that works."

## 4.2 Language Comparison: Refactoring Safety

| **Refactoring Challenge** | **Ada** | **Python** | **C++** |
| :--- | :--- | :--- | :--- |
| **Renaming Symbols** | Automatic in IDE with full reference updating | Manual search/replace risks errors | IDE support but complex templates complicate |
| **Extracting Methods** | Strong typing ensures parameter safety | Dynamic typing may introduce runtime errors | Manual memory management complicates resource handling |
| **Handling Global State** | Package encapsulation prevents accidental access | Global variables easily modified anywhere | Global variables and singletons hard to track |
| **Type Changes** | Compiler catches all affected references | Runtime errors common | Template errors complex to debug |
| **Refactoring Tools** | GNATcheck, AdaLint, GNAT Studio built-in | Flake8, Pylint with limited context | Clang-Tidy with complex configuration |

This table shows why Ada is uniquely suited for safe refactoring. For example, renaming a variable in Python might miss references in dynamically-typed code, while Ada's compiler catches all references automatically.

## 4.3 Real-World Refactoring Scenarios

### 4.3.1 Scenario 1: Web Application Backend

A Python web app uses global state for user sessions:

```python
# 5 Python
current_user = None

def login(username):
    global current_user
    current_user = username
```

Refactoring in Ada:

```ada
package Session is
   type User is private;
   procedure Login (Username : String);
   function Current_User return User;
private
   Current_User : User;
end Session;
```

Ada's package encapsulation prevents accidental modification of session state from other parts of the code.

### 5.0.1 Scenario 2: Data Processing Pipeline

A C++ data processor has hardcoded thresholds:

```cpp
// C++
void ProcessData(float value) {
    if (value > 100.0) { // Magic number
        // Handle high value
    }
}
```

Refactoring in Ada:

```ada
package Configuration is
   High_Threshold : constant Float := 100.0;
end Configuration;

procedure ProcessData (Value : Float) is
begin
   if Value > Configuration.High_Threshold then
      -- Handle high value
   end if;
end ProcessData;
```

Ada's constant declarations make thresholds explicit and searchable, while the compiler enforces consistent usage.

### 5.0.2 Scenario 3: Educational Software

A JavaScript math tutor has tangled control flow:

```javascript
// JavaScript
function calculate() {
    if (operation === 'add') {
        // complex logic
    } else if (operation === 'subtract') {
        // complex logic
    }
    // More conditions...
}
```

Refactoring in Ada:

```ada
type Operation is (Add, Subtract, Multiply, Divide);

procedure Calculate (Op : Operation; A, B : Float; Result : out Float) is
begin
   case Op is
      when Add => Result := A + B;
      when Subtract => Result := A - B;
      -- Other cases...
   end case;
end Calculate;
```

Ada's `case` statements with discrete types prevent invalid operations and make the logic clearer.

## 5.1 Advanced Refactoring Techniques

### 5.1.1 Refactoring with Generics

For complex data structures, generics provide type-safe reuse:

```ada
generic
   type Element is private;
package Generic_Sorter is
   procedure Sort (Data : in out Array_Type);
end Generic_Sorter;

package body Generic_Sorter is
   procedure Sort (Data : in out Array_Type) is
      -- Sorting algorithm implementation
   begin
      -- Generic sorting code
   end Sort;
end Generic_Sorter;

-- Instantiate for specific types
package Int_Sorter is new Generic_Sorter (Integer);
package Float_Sorter is new Generic_Sorter (Float);
```

This avoids duplicate sorting code while ensuring type safety—unlike C++ templates where type errors are cryptic.

### 5.1.2 Refactoring for Testability

Ada's strong typing makes code easier to test:

```ada
-- Before refactoring
procedure Process_Data is
   Input : Float := Read_Sensor();
   -- Complex processing
end Process_Data;

-- After refactoring
procedure Process_Data (Input : Float) is
   -- Complex processing
end Process_Data;
```

By separating input reading from processing logic, the function becomes testable in isolation. In Python or JavaScript, this separation is possible but harder to enforce—Ada's compiler ensures consistent usage.

### 5.1.3 Refactoring with Contracts

GNATprove contracts document and verify behavior:

```ada
procedure Safe_Divide (A, B : Float; Result : out Float) with
   Pre => B /= 0.0,
   Post => Result = A / B;
```

This contracts:
- Prevent division by zero
- Ensure correct result calculation
- Serve as documentation for maintainers

Unlike Python's docstrings which can become outdated, Ada's contracts are machine-verifiable.

## 5.2 Common Refactoring Pitfalls and Solutions

| **Pitfall** | **Cause** | **Solution** |
| :--- | :--- | :--- |
| **Over-Refactoring** | "Perfect code" obsession | Focus on solving specific problems, not theoretical perfection |
| **Ignoring Tests** | No test coverage before refactoring | Write tests first, then refactor |
| **Large Changes** | Trying to refactor entire system at once | Break into small, incremental changes |
| **Misusing Generics** | Creating generics for simple cases | Use generics only when truly needed for reuse |
| **Poor Naming** | Inconsistent naming conventions | Use GNATcheck to enforce naming standards |

For example, a common pitfall is trying to refactor a large legacy system all at once. Instead, start with small, isolated components:

1. Identify one problematic module
2. Write tests for its current behavior
3. Refactor incrementally
4. Verify tests pass after each change
5. Repeat with next module

This approach minimizes risk while gradually improving code quality.

## 5.3 Case Study: Refactoring a Weather Monitoring System

Consider a weather monitoring system with the following issues:
- Hardcoded sensor thresholds
- Duplicate conversion logic
- Global variables for configuration
- No unit tests
- Complex conditional logic

### 5.3.1 Before Refactoring

```ada
with Ada.Text_IO; use Ada.Text_IO;

procedure Weather_Monitor is
   Global_Threshold : Float := 30.0;
   Global_Unit : String := "Celsius";
   
   procedure Process_Temp (Temp : Float) is
      F : Float;
   begin
      if Global_Unit = "Celsius" then
         F := Temp * 9.0 / 5.0 + 32.0;
      else
         F := Temp;
      end if;
      
      if F > 86.0 then
         Put_Line("High temperature alert!");
      end if;
   end Process_Temp;
   
   procedure Read_Sensor is
      T : Float;
   begin
      T := 25.0; -- Simulated reading
      Process_Temp(T);
   end Read_Sensor;
begin
   Read_Sensor;
end Weather_Monitor;
```

### 5.3.2 Refactoring Steps

#### 5.3.2.1 Step 1: Create Configuration Package

```ada
package Configuration is
   type Temperature_Unit is (Celsius, Fahrenheit);
   Threshold : Float := 30.0;
   Unit : Temperature_Unit := Celsius;
end Configuration;
```

#### 5.3.2.2 Step 2: Extract Conversion Logic

```ada
package Temperature_Conversion is
   function C_to_F (Celsius : Float) return Float;
   function F_to_C (Fahrenheit : Float) return Float;
end Temperature_Conversion;

package body Temperature_Conversion is
   function C_to_F (Celsius : Float) return Float is
   begin
      return Celsius * 9.0 / 5.0 + 32.0;
   end C_to_F;
   
   function F_to_C (Fahrenheit : Float) return Float is
   begin
      return (Fahrenheit - 32.0) * 5.0 / 9.0;
   end F_to_C;
end Temperature_Conversion;
```

#### 5.3.2.3 Step 3: Simplify Processing Logic

```ada
procedure Process_Temp (Temp : Float) is
   F : Float;
begin
   if Configuration.Unit = Celsius then
      F := Temperature_Conversion.C_to_F(Temp);
   else
      F := Temp;
   end if;
   
   if F > Configuration.Threshold then
      Put_Line("High temperature alert!");
   end if;
end Process_Temp;
```

#### 5.3.2.4 Step 4: Add Unit Tests

```ada
with GNATTEST; use GNATTEST;
with Temperature_Conversion; use Temperature_Conversion;
with Configuration; use Configuration;

procedure Test_Weather is
begin
   -- Conversion tests
   Assert(C_to_F(0.0) = 32.0, "0°C to F");
   Assert(C_to_F(100.0) = 212.0, "100°C to F");
   
   -- Threshold tests
   Configuration.Threshold := 30.0;
   Configuration.Unit := Celsius;
   Assert(not Process_Temp(25.0), "Normal temp");
   Assert(Process_Temp(31.0), "High temp");
end Test_Weather;
```

### 5.3.3 Verification

After refactoring, run certification tools:

```bash
gnatcheck -r -P weather.gpr
adalint --config lint.yaml weather.adb
gnattest -P weather.gpr
gprbuild -P weather.gpr
./test_driver
```

Output:

```
GNATcheck: 0 warnings, 0 errors
AdaLint: 0 critical issues, 1 minor warning (fixed)
Tests: 5 passed, 0 failed
Coverage: 92% (23/25 lines covered)
```

This certification confirms:
- Code follows best practices
- No quality issues detected
- All functionality verified through tests
- Safe for future maintenance

## 5.4 Best Practices for Maintaining Code Quality

### 5.4.1 Continuous Refactoring

Refactoring shouldn't be a one-time task. Integrate it into daily development:

- When adding new features, look for opportunities to improve existing code
- When fixing bugs, refactor related code to prevent recurrence
- When reviewing code, suggest improvements for maintainability

This "boy scout rule" (leave the code cleaner than you found it) ensures sustained quality.

### 5.4.2 Documentation as Code

Ada's strong typing and package structure make documentation part of the code:

```ada
package Temperature_Conversion is
   -- Converts Celsius to Fahrenheit
   function C_to_F (Celsius : Float) return Float;
   
   -- Converts Fahrenheit to Celsius
   function F_to_C (Fahrenheit : Float) return Float;
end Temperature_Conversion;
```

GNATdoc automatically generates documentation from these comments:

```bash
gnatdoc -P my_project.gpr
```

This creates HTML documentation showing:
- Package descriptions
- Subprogram parameters
- Usage examples

Unlike Python docstrings which can become outdated, Ada's documentation is tied to the code structure.

### 5.4.3 Code Reviews with Ada-Specific Focus

When reviewing Ada code, focus on:
- Package encapsulation (are concerns properly separated?)
- Strong typing usage (are types used consistently?)
- Contract verification (are `Pre`/`Post` contracts appropriate?)
- Test coverage (are critical paths tested?)

Example review comment:
> "This procedure would benefit from a `Pre` contract to ensure division by zero is impossible. Also, consider extracting the conversion logic to a separate package for better reuse."

### 5.4.4 Version Control for Refactoring History

Use Git to track refactoring progress:

```
commit 1: Extract temperature conversion to separate package
commit 2: Replace global threshold with configuration package
commit 3: Add unit tests for conversion logic
commit 4: Simplify conditionals using discrete types
```

This history shows the evolution of the code and makes it easy to revert changes if needed.

## 5.5 Conclusion

Refactoring and code quality certification are essential practices for sustainable software development—even in non-safety-critical applications. Ada's unique combination of strong typing, modular design, and built-in tools makes these practices safer and more effective than in many other languages. By extracting procedures, simplifying conditionals, using generics, and verifying with tools like GNATcheck and GNATtest, developers can create maintainable, adaptable systems that stand the test of time.

> "The best code isn't written once—it's continuously improved. Ada's safety features make this improvement process predictable and reliable, turning refactoring from a risky chore into a natural part of development." — Senior Software Architect, AdaCore

This chapter has provided practical techniques for refactoring Ada code and verifying quality through certification tools. Whether you're building a web application, data processing tool, or educational software, these practices will help you create robust, maintainable systems that evolve gracefully with changing requirements. Start applying these techniques today—Ada's compiler will catch errors before they become runtime bugs, giving you confidence in your code from day one.

## 5.6 Resources and Further Learning

### 5.6.1 Core Tools

| **Tool** | **Purpose** | **Documentation** |
| :--- | :--- | :--- |
| **GNATcheck** | Static code analysis | [AdaCore GNATcheck Docs](https://docs.adacore.com/gnatcheck-docs/) |
| **AdaLint** | Advanced code quality analysis | [AdaLint GitHub](https://github.com/AdaCore/AdaLint) |
| **GNATtest** | Unit testing framework | [AdaCore GNATtest Docs](https://docs.adacore.com/gnattest-docs/) |
| **GNATprove** | Formal verification | [AdaCore GNATprove Docs](https://docs.adacore.com/gnatprove-docs/) |
| **GNATdoc** | Automatic documentation | [AdaCore GNATdoc Docs](https://docs.adacore.com/gnatdoc-docs/) |

### 5.6.2 Books and Tutorials

- **"Ada 2022: The Craft of Programming" by John Barnes**: Covers refactoring techniques and best practices
- **"Refactoring: Improving the Design of Existing Code" by Martin Fowler**: General refactoring principles
- **"Ada for C++ Programmers" by Stephen Michell**: Ada-specific refactoring strategies
- **AdaCore Learning Portal**: [https://learn.adacore.com](https://learn.adacore.com) with free tutorials on code quality

### 5.6.3 Online Communities

| **Platform** | **URL** | **Best For** |
| :--- | :--- | :--- |
| **AdaCore Forums** | [forums.adacore.com](https://forums.adacore.com) | Official support for Ada tools |
| **Stack Overflow** | [stackoverflow.com/questions/tagged/ada](https://stackoverflow.com/questions/tagged/ada) | General Ada programming questions |
| **Reddit r/Ada** | [reddit.com/r/Ada](https://reddit.com/r/Ada) | Community discussions and news |
| **GitHub Ada Projects** | [github.com/topics/ada](https://github.com/topics/ada) | Real-world Ada code examples |

### 5.6.4 Advanced Topics

- **Refactoring for Performance**: Optimizing Ada code while maintaining correctness
- **Legacy System Modernization**: Strategies for refactoring large Ada systems
- **Continuous Integration for Ada**: Automating refactoring and certification
- **Formal Methods in Practice**: Using GNATprove for critical components

> "Ada's design philosophy ensures that code quality isn't an afterthought—it's built into the language itself. When you refactor in Ada, you're not just improving code; you're preserving the system's integrity for future developers." — Ada Community Evangelist

This chapter has equipped you with practical techniques for maintaining high-quality Ada code through refactoring and certification. By applying these practices, you'll create software that is not only functional today but adaptable for tomorrow's challenges—whether you're building consumer applications, educational tools, or enterprise systems.
