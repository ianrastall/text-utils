# 1 \. Testing Frameworks in Ada

> "Testing isn't just for safety-critical systems—it's essential for any application where reliability matters. With Ada's AUnit framework, you can build robust, maintainable code for home automation, personal finance tools, and more—without specialized knowledge."

When you're first learning to program, it's easy to think testing is just for "big projects" or "professional developers." But even simple applications like a home automation system or personal finance tool can benefit from structured testing. Imagine a smart thermostat that turns off your heater when it's already cold, or a budgeting app that miscalculates your savings. These aren't theoretical problems—they happen every day to developers who skip testing. Ada's AUnit framework gives you the tools to catch these issues early, build confidence in your code, and create software that works reliably for real users.

This chapter explores AUnit, Ada's standard unit testing framework. You'll learn how to write tests for everyday applications, organize them effectively, and integrate them into your development workflow—all without needing specialized knowledge of testing methodologies. Whether you're building a calculator, a data processing tool, or a home automation system, AUnit provides a simple, reliable way to verify your code works as intended.

## 1.1 Why Testing Matters for Everyday Applications

Testing is often seen as a chore for large teams working on complex systems, but it's equally valuable for small projects and personal applications. Consider these common scenarios:

- A home automation system that turns off lights at the wrong time because of an off-by-one error in time calculations
- A personal finance app that miscalculates interest due to floating-point rounding issues
- A data processing tool that silently corrupts data when handling edge cases

Without testing, these problems might only surface when users encounter them—often after the software has been deployed. With testing, you can catch these issues during development, when fixing them is easy and cheap.

### 1.1.1 Manual Testing vs. Automated Testing

| **Aspect** | **Manual Testing** | **AUnit Framework** |
| :--- | :--- | :--- |
| **Test Organization** | Ad-hoc, hard to maintain | Structured test suites |
| **Test Execution** | Manual command line | Automated test runner |
| **Result Reporting** | Manual check | Detailed test reports |
| **Setup/Teardown** | Manual setup each test | Built-in setup/teardown |
| **Edge Case Testing** | Easy to miss | Systematic edge case testing |

Let's look at a practical example. Suppose you're building a simple calculator application:

```ada
function Add (A, B : Integer) return Integer is
begin
   return A + B;
end Add;
```

With manual testing, you might run the program and enter values:

```
Enter first number: 2
Enter second number: 2
Result: 4
```

This works for one case, but what about negative numbers? Zero? Large numbers? You'd need to manually test each scenario, which is time-consuming and error-prone.

With AUnit, you can write automated tests that check all these cases:

```ada
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Add(2, 2) = 4, "2 + 2 should equal 4");
   AUnit.Assertions.Assert (Add(-1, 1) = 0, "-1 + 1 should equal 0");
   AUnit.Assertions.Assert (Add(0, 0) = 0, "0 + 0 should equal 0");
   AUnit.Assertions.Assert (Add(Integer'Last, 1) = Integer'Last + 1, "Integer'Last + 1 should work");
end Test_Addition;
```

When you run the tests, AUnit automatically checks all these cases and reports which ones pass or fail. This is more efficient, more thorough, and less error-prone than manual testing.

### 1.1.2 Real-World Benefits of Testing

- **Faster development**: Catch bugs early when they're easier to fix
- **More confidence**: Know your code works correctly before deploying
- **Easier maintenance**: Test existing functionality when making changes
- **Better documentation**: Tests serve as living documentation of expected behavior
- **Improved collaboration**: Clear tests help others understand your code

For everyday applications, these benefits translate directly to better user experiences. A home automation system that works reliably builds trust with users. A personal finance app that calculates correctly prevents financial mistakes. Testing isn't just for professionals—it's a practical tool for any developer who wants to build reliable software.

## 1.2 Introduction to AUnit

AUnit is Ada's standard unit testing framework. It's part of the GNAT distribution, so no extra installation is needed for most users. AUnit provides a simple, reliable way to write and run tests for Ada code.

### 1.2.1 Key Features of AUnit

- **Simple syntax**: Uses familiar Ada concepts
- **Automated test runner**: Executes all tests and reports results
- **Test suites**: Organize tests into logical groups
- **Setup/teardown**: Prepare and clean up test environments
- **Detailed reporting**: Clear output showing which tests passed or failed
- **Integration with GNAT**: Works seamlessly with Ada projects

AUnit is designed to be accessible to beginners while providing powerful features for more advanced users. You don't need to learn a new language—just understand how to use AUnit's simple procedures and packages.

### 1.2.2 Why AUnit Over Other Testing Frameworks?

Many languages have multiple testing frameworks, but Ada's ecosystem is simpler. AUnit is the standard, supported by GNAT, and works with all Ada projects. While other testing tools exist, AUnit is the most straightforward option for beginners.

Let's compare AUnit to manual testing for a simple application:

```ada
-- Manual testing approach
with Ada.Text_IO; use Ada.Text_IO;
procedure Main is
begin
   Put_Line("Testing Add(2, 2): " & (if Add(2, 2) = 4 then "PASS" else "FAIL"));
   Put_Line("Testing Add(-1, 1): " & (if Add(-1, 1) = 0 then "PASS" else "FAIL"));
   -- ... more tests
end Main;
```

This works but has drawbacks:
- No built-in reporting system
- Hard to organize many tests
- No setup/teardown for common test conditions
- Manual interpretation of results

With AUnit, the same tests become:

```ada
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Add(2, 2) = 4, "2 + 2 should equal 4");
   AUnit.Assertions.Assert (Add(-1, 1) = 0, "-1 + 1 should equal 0");
   -- ... more tests
end Test_Addition;
```

And you get:
- Automated test runner
- Clear pass/fail reporting
- Organized test suites
- Setup/teardown capabilities
- Detailed error messages

This is more efficient and reliable for any application, big or small.

## 1.3 Setting Up AUnit for Your Projects

AUnit is included with GNAT, so setting it up is straightforward. Let's walk through the steps.

### 1.3.1 Basic Setup

1. **Create a project directory**:
   ```bash
   mkdir my_project
   cd my_project
   mkdir src tests
   ```

2. **Create a project file** (`my_project.gpr`):
   ```ada
   project My_Project is
      for Source_Dirs use ("src", "tests");
      for Object_Dir use "obj";
      for Main use ("src/main.adb");
      
      package Compiler is
         for Default_Switches ("Ada") use ("-g", "-O0", "-gnata");
      end Compiler;
   end My_Project;
   ```

3. **Create a test file** (`tests/test_calculator.adb`):
   ```ada
   with AUnit.Test_Cases;
   with AUnit.Assertions;
   with Calculator;

   package body Test_Calculator is

      procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
      begin
         AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
      end Test_Addition;

   end Test_Calculator;
   ```

4. **Create a test runner** (`tests/test_runner.adb`):
   ```ada
   with AUnit.Runner;
   with AUnit.Test_Suites;
   with Test_Calculator;

   procedure Test_Runner is
      Test_Suite : AUnit.Test_Suites.Test_Suite;
   begin
      Test_Suite.Add_Test (Test_Calculator.Test_Addition'Access);
      AUnit.Runner.Run_Tests (Test_Suite);
   end Test_Runner;
   ```

5. **Build and run tests**:
   ```bash
   gnatmake -P my_project.gpr tests/test_runner.adb
   ./test_runner
   ```

This will execute your test and show the results. For a simple calculator, you should see:

```
Running test suite...
  Test_Calculator.Test_Addition: PASS
Total: 1 test, 1 passed, 0 failed
```

### 1.3.2 Understanding the Setup

- **`AUnit.Test_Cases`**: Provides the base test case class
- **`AUnit.Assertions`**: Contains assertion procedures for testing
- **`AUnit.Runner`**: Executes tests and reports results
- **`AUnit.Test_Suites`**: Organizes tests into logical groups

You don't need to install anything extra—just include these packages in your code. AUnit is part of GNAT, so it's always available when you install Ada.

### 1.3.3 Project File Best Practices

For larger projects, organize your project file to separate source and test code:

```ada
project My_Project is
   type Build_Type is ("debug", "release");
   Build : Build_Type := "debug";

   for Source_Dirs use ("src", "tests");
   for Object_Dir use "obj/" & Build;
   for Main use ("src/main.adb");

   package Compiler is
      case Build is
         when "debug" =>
            for Default_Switches ("Ada") use ("-g", "-O0", "-gnata");
         when "release" =>
            for Default_Switches ("Ada") use ("-O2", "-gnatp", "-gnata");
      end case;
   end Compiler;
end My_Project;
```

This structure:
- Separates source and test directories
- Uses different object directories for debug and release builds
- Includes debugging information for tests
- Optimizes release builds for performance

You can build tests separately from your main application by creating a separate main program for tests.

## 1.4 Writing Your First Tests

Let's create a complete example of testing a simple calculator application. This will show you the basics of writing tests with AUnit.

### 1.4.1 Step 1: Create the Calculator Package

First, create the calculator package to test:

```ada
-- src/calculator.ads
package Calculator is
   function Add (A, B : Integer) return Integer;
   function Subtract (A, B : Integer) return Integer;
   function Multiply (A, B : Integer) return Integer;
   function Divide (A, B : Integer) return Float;
end Calculator;
```

```ada
-- src/calculator.adb
package body Calculator is
   function Add (A, B : Integer) return Integer is
   begin
      return A + B;
   end Add;
   
   function Subtract (A, B : Integer) return Integer is
   begin
      return A - B;
   end Subtract;
   
   function Multiply (A, B : Integer) return Integer is
   begin
      return A * B;
   end Multiply;
   
   function Divide (A, B : Integer) return Float is
   begin
      return Float(A) / Float(B);
   end Divide;
end Calculator;
```

### 1.4.2 Step 2: Create Test Cases

Now create the test cases:

```ada
-- tests/test_calculator.adb
with AUnit.Test_Cases;
with AUnit.Assertions;
with Calculator;

package body Test_Calculator is

   procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
      AUnit.Assertions.Assert (Calculator.Add(-1, 1) = 0, "-1 + 1 should equal 0");
      AUnit.Assertions.Assert (Calculator.Add(0, 0) = 0, "0 + 0 should equal 0");
      AUnit.Assertions.Assert (Calculator.Add(Integer'Last, 1) = Integer'Last + 1, 
                              "Integer'Last + 1 should work");
   end Test_Addition;
   
   procedure Test_Subtraction (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Subtract(5, 3) = 2, "5 - 3 should equal 2");
      AUnit.Assertions.Assert (Calculator.Subtract(3, 5) = -2, "3 - 5 should equal -2");
      AUnit.Assertions.Assert (Calculator.Subtract(0, 0) = 0, "0 - 0 should equal 0");
   end Test_Subtraction;
   
   procedure Test_Multiplication (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Multiply(2, 3) = 6, "2 * 3 should equal 6");
      AUnit.Assertions.Assert (Calculator.Multiply(-2, 3) = -6, "-2 * 3 should equal -6");
      AUnit.Assertions.Assert (Calculator.Multiply(0, 5) = 0, "0 * 5 should equal 0");
   end Test_Multiplication;
   
   procedure Test_Division (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Divide(6, 2) = 3.0, "6 / 2 should equal 3.0");
      AUnit.Assertions.Assert (Calculator.Divide(7, 2) = 3.5, "7 / 2 should equal 3.5");
      AUnit.Assertions.Assert (Calculator.Divide(0, 5) = 0.0, "0 / 5 should equal 0.0");
   end Test_Division;

end Test_Calculator;
```

### 1.4.3 Step 3: Create a Test Runner

Now create a test runner to execute all tests:

```ada
-- tests/test_runner.adb
with AUnit.Runner;
with AUnit.Test_Suites;
with Test_Calculator;

procedure Test_Runner is
   Test_Suite : AUnit.Test_Suites.Test_Suite;
begin
   Test_Suite.Add_Test (Test_Calculator.Test_Addition'Access);
   Test_Suite.Add_Test (Test_Calculator.Test_Subtraction'Access);
   Test_Suite.Add_Test (Test_Calculator.Test_Multiplication'Access);
   Test_Suite.Add_Test (Test_Calculator.Test_Division'Access);
   AUnit.Runner.Run_Tests (Test_Suite);
end Test_Runner;
```

### 1.4.4 Step 4: Build and Run Tests

```bash
# 2 Build the project
gnatmake -P my_project.gpr tests/test_runner.adb

# 3 Run the tests
./test_runner
```

The output will show:

```
Running test suite...
  Test_Calculator.Test_Addition: PASS
  Test_Calculator.Test_Subtraction: PASS
  Test_Calculator.Test_Multiplication: PASS
  Test_Calculator.Test_Division: PASS
Total: 4 tests, 4 passed, 0 failed
```

This simple example shows how AUnit makes testing straightforward. You write tests that check specific functionality, and AUnit automatically runs them and reports results.

### 3.0.1 Understanding the Test Code

Let's break down the test code:

```ada
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
   -- ... more assertions
end Test_Addition;
```

- **`T : in out AUnit.Test_Cases.Test_Case`**: The test case parameter
- **`AUnit.Assertions.Assert`**: Checks if a condition is true
- **`Calculator.Add(2, 2) = 4`**: The condition to test
- **`"2 + 2 should equal 4"`**: A descriptive message for failures

Each test is a procedure that takes a test case parameter. Inside, you use assertions to check that your code behaves as expected.

## 3.1 Advanced Testing Features

Once you've mastered the basics, you can explore more advanced testing features that make your tests more powerful and maintainable.

### 3.1.1 Test Suites and Organization

As your project grows, you'll want to organize tests into logical groups. AUnit makes this easy with test suites.

#### 3.1.1.1 Example: Organizing Tests by Functionality

```ada
-- tests/test_suites.adb
with AUnit.Runner;
with AUnit.Test_Suites;
with Test_Calculator;
with Test_Temperature_Sensor;

procedure Test_Suite_Runner is
   Main_Suite : AUnit.Test_Suites.Test_Suite;
   Calculator_Suite : AUnit.Test_Suites.Test_Suite;
   Sensor_Suite : AUnit.Test_Suites.Test_Suite;
begin
   -- Create calculator test suite
   Calculator_Suite.Add_Test (Test_Calculator.Test_Addition'Access);
   Calculator_Suite.Add_Test (Test_Calculator.Test_Subtraction'Access);
   
   -- Create sensor test suite
   Sensor_Suite.Add_Test (Test_Temperature_Sensor.Test_Read_Temperature'Access);
   
   -- Add sub-suites to main suite
   Main_Suite.Add_Suite (Calculator_Suite);
   Main_Suite.Add_Suite (Sensor_Suite);
   
   AUnit.Runner.Run_Tests (Main_Suite);
end Test_Suite_Runner;
```

This structure:
- Groups related tests together
- Makes it easy to run specific test groups
- Provides clear organization for larger projects

When you run this, you'll see:

```
Running test suite...
  Calculator_Suite:
    Test_Calculator.Test_Addition: PASS
    Test_Calculator.Test_Subtraction: PASS
  Sensor_Suite:
    Test_Temperature_Sensor.Test_Read_Temperature: PASS
Total: 3 tests, 3 passed, 0 failed
```

### 3.1.2 Setup and Teardown Procedures

Many tests need common setup and cleanup steps. AUnit provides `Setup` and `Teardown` procedures for this purpose.

#### 3.1.2.1 Example: Testing a Temperature Sensor

```ada
-- tests/test_temperature_sensor.adb
with AUnit.Test_Cases;
with AUnit.Assertions;
with Temperature_Sensor;

package body Test_Temperature_Sensor is

   procedure Setup (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      Temperature_Sensor.Initialize;
   end Setup;
   
   procedure Teardown (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      Temperature_Sensor.Cleanup;
   end Teardown;
   
   procedure Test_Read_Temperature (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature > -50.0, 
                              "Temperature should be above -50°C");
      AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature < 100.0, 
                              "Temperature should be below 100°C");
   end Test_Read_Temperature;
   
end Test_Temperature_Sensor;
```

#### 3.1.2.2 Registering Setup/Teardown in the Test Runner

```ada
-- tests/test_runner.adb
with AUnit.Runner;
with AUnit.Test_Suites;
with Test_Temperature_Sensor;

procedure Test_Runner is
   Test_Suite : AUnit.Test_Suites.Test_Suite;
begin
   Test_Suite.Add_Test (Test_Temperature_Sensor.Test_Read_Temperature'Access,
                        Setup  => Test_Temperature_Sensor.Setup'Access,
                        Teardown => Test_Temperature_Sensor.Teardown'Access);
   AUnit.Runner.Run_Tests (Test_Suite);
end Test_Runner;
```

This ensures:
- `Setup` runs before each test
- `Teardown` runs after each test
- Tests don't interfere with each other
- Resources are properly cleaned up

### 3.1.3 Test Fixtures for Common Test Data

For tests that need common data, you can create test fixtures:

```ada
-- tests/test_calculator.adb
with AUnit.Test_Cases;
with AUnit.Assertions;
with Calculator;

package body Test_Calculator is

   type Test_Fixture is record
      A : Integer;
      B : Integer;
      Expected : Integer;
   end record;
   
   procedure Setup (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      -- Set up test data
      T.Set_Fixture (Test_Fixture'(A => 2, B => 2, Expected => 4));
   end Setup;
   
   procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
      Fixture : Test_Fixture := T.Get_Fixture (Test_Fixture'Access);
   begin
      AUnit.Assertions.Assert (Calculator.Add(Fixture.A, Fixture.B) = Fixture.Expected,
                              "Addition failed for " & Fixture.A'Image & " + " & Fixture.B'Image);
   end Test_Addition;
   
end Test_Calculator;
```

This pattern:
- Centralizes test data
- Makes tests easier to read
- Reduces duplication
- Ensures consistent test data across tests

## 3.2 Common Assertion Types

AUnit provides several assertion types for different testing needs. Let's explore the most common ones.

### 3.2.1 Basic Assertions

| **Assertion** | **Usage** | **Example** |
| :--- | :--- | :--- |
| **Assert** | Check a condition is true | `Assert (X = Y, "X should equal Y")` |
| **Assert_Not** | Check a condition is false | `Assert_Not (X = Y, "X should not equal Y")` |
| **Assert_Equal** | Check two values are equal | `Assert_Equal (X, Y, "X should equal Y")` |
| **Assert_Not_Equal** | Check two values are not equal | `Assert_Not_Equal (X, Y, "X should not equal Y")` |
| **Assert_True** | Check a boolean is true | `Assert_True (X > 0, "X should be positive")` |
| **Assert_False** | Check a boolean is false | `Assert_False (X < 0, "X should not be negative")` |

Let's see these in action:

```ada
procedure Test_Assertions (T : in out AUnit.Test_Cases.Test_Case) is
begin
   -- Basic assertions
   AUnit.Assertions.Assert (2 + 2 = 4, "2 + 2 should equal 4");
   AUnit.Assertions.Assert_Not (2 + 2 = 5, "2 + 2 should not equal 5");
   
   -- Equality assertions
   AUnit.Assertions.Assert_Equal (2 + 2, 4, "2 + 2 should equal 4");
   AUnit.Assertions.Assert_Not_Equal (2 + 2, 5, "2 + 2 should not equal 5");
   
   -- Boolean assertions
   AUnit.Assertions.Assert_True (5 > 0, "5 should be positive");
   AUnit.Assertions.Assert_False (5 < 0, "5 should not be negative");
end Test_Assertions;
```

### 3.2.2 String Assertions

For string comparisons, AUnit provides special assertions:

```ada
procedure Test_String_Assertions (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert_Equal ("Hello", "Hello", "Strings should match");
   AUnit.Assertions.Assert_Not_Equal ("Hello", "World", "Strings should not match");
   
   AUnit.Assertions.Assert_Equal ("Hello", "Hello", "Strings should match");
   AUnit.Assertions.Assert_Not_Equal ("Hello", "Hello ", "Strings should not match (with space)");
end Test_String_Assertions;
```

### 3.2.3 Numeric Assertions

For numeric comparisons, you can specify precision:

```ada
procedure Test_Numeric_Assertions (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert_Equal (1.0, 1.0, "Floats should match");
   AUnit.Assertions.Assert_Equal (1.0, 1.000001, "Floats should match within tolerance", 
                                 Tolerance => 0.0001);
   
   AUnit.Assertions.Assert_Less (2.0, 3.0, "2 should be less than 3");
   AUnit.Assertions.Assert_Greater (3.0, 2.0, "3 should be greater than 2");
end Test_Numeric_Assertions;
```

### 3.2.4 Exception Assertions

For testing error handling, you can check if exceptions are raised:

```ada
procedure Test_Exception_Assertions (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert_Exception (Calculator.Divide(10, 0), 
                                     "Divide by zero should raise exception");
                                     
   AUnit.Assertions.Assert_No_Exception (Calculator.Divide(10, 2), 
                                       "Divide by non-zero should not raise exception");
end Test_Exception_Assertions;
```

These assertions make it easy to test error conditions without complicating your test code.

## 3.3 Best Practices for Effective Testing

Following best practices makes your tests more effective and maintainable. Here are key practices for writing good tests.

### 3.3.1 Write Clear Test Names

Test names should clearly describe what they're testing:

```ada
-- Good: clear name
procedure Test_Addition_With_Positive_Numbers (T : in out AUnit.Test_Cases.Test_Case) is
begin
   -- test code
end Test_Addition_With_Positive_Numbers;

-- Bad: unclear name
procedure Test1 (T : in out AUnit.Test_Cases.Test_Case) is
begin
   -- test code
end Test1;
```

Clear names make it easy to understand what each test does, especially when reports show failures.

### 3.3.2 Test One Thing Per Test

Each test should focus on a single behavior:

```ada
-- Good: one behavior per test
procedure Test_Addition_With_Positive_Numbers (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
end Test_Addition_With_Positive_Numbers;

procedure Test_Addition_With_Negative_Numbers (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(-1, 1) = 0, "-1 + 1 should equal 0");
end Test_Addition_With_Negative_Numbers;

-- Bad: multiple behaviors in one test
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
   AUnit.Assertions.Assert (Calculator.Add(-1, 1) = 0, "-1 + 1 should equal 0");
end Test_Addition;
```

This makes it easier to identify which specific behavior failed when a test fails.

### 3.3.3 Test Edge Cases

Always test boundary conditions and edge cases:

```ada
procedure Test_Division_Edge_Cases (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Divide(10, 2) = 5.0, "10 / 2 should equal 5.0");
   AUnit.Assertions.Assert (Calculator.Divide(1, 2) = 0.5, "1 / 2 should equal 0.5");
   AUnit.Assertions.Assert (Calculator.Divide(0, 5) = 0.0, "0 / 5 should equal 0.0");
   
   -- Edge cases
   AUnit.Assertions.Assert_Exception (Calculator.Divide(10, 0), 
                                     "Divide by zero should raise exception");
end Test_Division_Edge_Cases;
```

Edge cases often reveal bugs that aren't caught by typical test cases.

### 3.3.4 Keep Tests Independent

Each test should be able to run independently of others:

```ada
-- Good: independent tests
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
end Test_Addition;

procedure Test_Subtraction (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Subtract(5, 3) = 2, "5 - 3 should equal 2");
end Test_Subtraction;

-- Bad: dependent tests
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
end Test_Addition;

procedure Test_Subtraction (T : in out AUnit.Test_Cases.Test_Case) is
begin
   -- Depends on previous test state
   AUnit.Assertions.Assert (Calculator.Subtract(5, 3) = 2, "5 - 3 should equal 2");
end Test_Subtraction;
```

Independent tests can be run in any order, making test results more reliable.

## 3.4 Common Pitfalls and How to Avoid Them

Even with AUnit, beginners can encounter common pitfalls. Let's explore these challenges and how to solve them.

### 3.4.1 Pitfall 1: Testing Implementation Instead of Behavior

**Problem**: Testing how code works rather than what it does.

```ada
-- Bad: testing implementation details
procedure Test_Calculator (T : in out AUnit.Test_Cases.Test_Case) is
begin
   -- Testing internal state
   AUnit.Assertions.Assert (Calculator.Internal_State = 0, "Internal state should be 0");
end Test_Calculator;
```

**Solution**: Test the public interface, not internal details.

```ada
-- Good: testing behavior
procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
end Test_Addition;
```

This makes your tests more resilient to implementation changes.

### 3.4.2 Pitfall 2: Writing Tests That Are Too Complex

**Problem**: Tests that are harder to understand than the code they're testing.

```ada
-- Bad: complex test logic
procedure Test_Complicated_Calculation (T : in out AUnit.Test_Cases.Test_Case) is
   X : Integer := 5;
   Y : Integer := 10;
   Z : Integer;
begin
   for I in 1..10 loop
      X := X + I;
      Y := Y * 2;
   end loop;
   Z := X + Y;
   AUnit.Assertions.Assert (Z = 100, "Z should equal 100");
end Test_Complicated_Calculation;
```

**Solution**: Simplify tests to focus on behavior.

```ada
-- Good: simple test
procedure Test_Complicated_Calculation (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Calculate(5, 10) = 100, "Calculate should return 100");
end Test_Complicated_Calculation;
```

This makes tests easier to understand and maintain.

### 3.4.3 Pitfall 3: Ignoring Error Handling

**Problem**: Only testing successful cases, not error conditions.

```ada
-- Bad: only testing success
procedure Test_Division (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Divide(10, 2) = 5.0, "10 / 2 should equal 5.0");
end Test_Division;
```

**Solution**: Test both success and error conditions.

```ada
-- Good: testing both success and error
procedure Test_Division (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculator.Divide(10, 2) = 5.0, "10 / 2 should equal 5.0");
   AUnit.Assertions.Assert_Exception (Calculator.Divide(10, 0), 
                                     "Divide by zero should raise exception");
end Test_Division;
```

This ensures your code handles errors correctly.

### 3.4.4 Pitfall 4: Not Using Setup/Teardown for Common Initialization

**Problem**: Repeating initialization code in multiple tests.

```ada
-- Bad: repeated initialization
procedure Test1 (T : in out AUnit.Test_Cases.Test_Case) is
   Sensor : Temperature_Sensor_Type;
begin
   Sensor.Initialize;
   AUnit.Assertions.Assert (Sensor.Read_Temperature > -50.0, "Temperature should be above -50°C");
end Test1;

procedure Test2 (T : in out AUnit.Test_Cases.Test_Case) is
   Sensor : Temperature_Sensor_Type;
begin
   Sensor.Initialize;
   AUnit.Assertions.Assert (Sensor.Read_Temperature < 100.0, "Temperature should be below 100°C");
end Test2;
```

**Solution**: Use setup/teardown for common initialization.

```ada
-- Good: using setup/teardown
procedure Setup (T : in out AUnit.Test_Cases.Test_Case) is
begin
   Sensor.Initialize;
end Setup;

procedure Teardown (T : in out AUnit.Test_Cases.Test_Case) is
begin
   Sensor.Cleanup;
end Teardown;

procedure Test1 (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Sensor.Read_Temperature > -50.0, "Temperature should be above -50°C");
end Test1;

procedure Test2 (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Sensor.Read_Temperature < 100.0, "Temperature should be below 100°C");
end Test2;
```

This reduces duplication and makes tests more maintainable.

## 3.5 Integrating AUnit with Project Files

AUnit integrates seamlessly with Ada project files, making it easy to manage tests as part of your project.

### 3.5.1 Basic Project File Configuration

```ada
project My_Project is
   for Source_Dirs use ("src", "tests");
   for Object_Dir use "obj";
   for Main use ("src/main.adb");
   
   package Compiler is
      for Default_Switches ("Ada") use ("-g", "-O0", "-gnata");
   end Compiler;
end My_Project;
```

This structure:
- Includes both source and test directories
- Uses a single object directory
- Includes debugging information for tests

### 3.5.2 Building Tests Separately

For larger projects, you might want to build tests separately from your main application:

```ada
project My_Project is
   for Source_Dirs use ("src", "tests");
   for Object_Dir use "obj";
   
   package Compiler is
      for Default_Switches ("Ada") use ("-g", "-O0", "-gnata");
   end Compiler;
   
   -- Main application
   package Application is
      for Main use ("src/main.adb");
   end Application;
   
   -- Test runner
   package Tests is
      for Main use ("tests/test_runner.adb");
   end Tests;
end My_Project;
```

You can build the main application or tests separately:

```bash
# 4 Build main application
gnatmake -P my_project.gpr -XApplication

# 5 Build tests
gnatmake -P my_project.gpr -XTests
```

This makes it easy to build just what you need.

### 5.0.1 Conditional Compilation for Tests

You can include test code only in debug builds:

```ada
project My_Project is
   for Source_Dirs use ("src", "tests");
   for Object_Dir use "obj";
   
   package Compiler is
      for Default_Switches ("Ada") use ("-g", "-O0", "-gnata");
   end Compiler;
   
   -- Main application
   package Application is
      for Main use ("src/main.adb");
   end Application;
   
   -- Test runner
   package Tests is
      for Main use ("tests/test_runner.adb");
   end Tests;
   
   -- Only include test code in debug builds
   package Test_Config is
      case Build is
         when "debug" =>
            for Sources use ("tests/test_calculator.adb");
         when "release" =>
            for Sources use ();
      end case;
   end Test_Config;
end My_Project;
```

This ensures test code isn't included in release builds, reducing the size of your final application.

## 5.1 Practical Exercises: Building Your First Test Suite

Let's put what you've learned into practice with hands-on exercises.

### 5.1.1 Exercise 1: Simple Calculator Tests

Create a test suite for a simple calculator application.

#### 5.1.1.1 Step 1: Create the Calculator Package

```ada
-- src/calculator.ads
package Calculator is
   function Add (A, B : Integer) return Integer;
   function Subtract (A, B : Integer) return Integer;
   function Multiply (A, B : Integer) return Integer;
   function Divide (A, B : Integer) return Float;
end Calculator;
```

```ada
-- src/calculator.adb
package body Calculator is
   function Add (A, B : Integer) return Integer is
   begin
      return A + B;
   end Add;
   
   function Subtract (A, B : Integer) return Integer is
   begin
      return A - B;
   end Subtract;
   
   function Multiply (A, B : Integer) return Integer is
   begin
      return A * B;
   end Multiply;
   
   function Divide (A, B : Integer) return Float is
   begin
      return Float(A) / Float(B);
   end Divide;
end Calculator;
```

#### 5.1.1.2 Step 2: Create Test Cases

```ada
-- tests/test_calculator.adb
with AUnit.Test_Cases;
with AUnit.Assertions;
with Calculator;

package body Test_Calculator is

   procedure Test_Addition (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Add(2, 2) = 4, "2 + 2 should equal 4");
      AUnit.Assertions.Assert (Calculator.Add(-1, 1) = 0, "-1 + 1 should equal 0");
      AUnit.Assertions.Assert (Calculator.Add(0, 0) = 0, "0 + 0 should equal 0");
   end Test_Addition;
   
   procedure Test_Subtraction (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Subtract(5, 3) = 2, "5 - 3 should equal 2");
      AUnit.Assertions.Assert (Calculator.Subtract(3, 5) = -2, "3 - 5 should equal -2");
      AUnit.Assertions.Assert (Calculator.Subtract(0, 0) = 0, "0 - 0 should equal 0");
   end Test_Subtraction;
   
   procedure Test_Multiplication (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Multiply(2, 3) = 6, "2 * 3 should equal 6");
      AUnit.Assertions.Assert (Calculator.Multiply(-2, 3) = -6, "-2 * 3 should equal -6");
      AUnit.Assertions.Assert (Calculator.Multiply(0, 5) = 0, "0 * 5 should equal 0");
   end Test_Multiplication;
   
   procedure Test_Division (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Calculator.Divide(6, 2) = 3.0, "6 / 2 should equal 3.0");
      AUnit.Assertions.Assert (Calculator.Divide(7, 2) = 3.5, "7 / 2 should equal 3.5");
      AUnit.Assertions.Assert (Calculator.Divide(0, 5) = 0.0, "0 / 5 should equal 0.0");
      AUnit.Assertions.Assert_Exception (Calculator.Divide(10, 0), 
                                        "Divide by zero should raise exception");
   end Test_Division;

end Test_Calculator;
```

#### 5.1.1.3 Step 3: Create a Test Runner

```ada
-- tests/test_runner.adb
with AUnit.Runner;
with AUnit.Test_Suites;
with Test_Calculator;

procedure Test_Runner is
   Test_Suite : AUnit.Test_Suites.Test_Suite;
begin
   Test_Suite.Add_Test (Test_Calculator.Test_Addition'Access);
   Test_Suite.Add_Test (Test_Calculator.Test_Subtraction'Access);
   Test_Suite.Add_Test (Test_Calculator.Test_Multiplication'Access);
   Test_Suite.Add_Test (Test_Calculator.Test_Division'Access);
   AUnit.Runner.Run_Tests (Test_Suite);
end Test_Runner;
```

#### 5.1.1.4 Step 4: Build and Run Tests

```bash
# 6 Build the project
gnatmake -P project.gpr tests/test_runner.adb

# 7 Run the tests
./test_runner
```

This exercise gives you hands-on experience with writing tests for a simple application. You'll see how AUnit makes testing straightforward and reliable.

### 7.0.1 Exercise 2: Temperature Sensor Tests

Create tests for a temperature sensor application.

#### 7.0.1.1 Step 1: Create the Temperature Sensor Package

```ada
-- src/temperature_sensor.ads
package Temperature_Sensor is
   procedure Initialize;
   procedure Cleanup;
   function Read_Temperature return Float;
end Temperature_Sensor;
```

```ada
-- src/temperature_sensor.adb
package body Temperature_Sensor is
   Temperature : Float := 0.0;
   
   procedure Initialize is
   begin
      -- Simulate sensor initialization
      Temperature := 22.0;
   end Initialize;
   
   procedure Cleanup is
   begin
      -- Simulate cleanup
      Temperature := 0.0;
   end Cleanup;
   
   function Read_Temperature return Float is
   begin
      return Temperature;
   end Read_Temperature;
end Temperature_Sensor;
```

#### 7.0.1.2 Step 2: Create Test Cases

```ada
-- tests/test_temperature_sensor.adb
with AUnit.Test_Cases;
with AUnit.Assertions;
with Temperature_Sensor;

package body Test_Temperature_Sensor is

   procedure Setup (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      Temperature_Sensor.Initialize;
   end Setup;
   
   procedure Teardown (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      Temperature_Sensor.Cleanup;
   end Teardown;
   
   procedure Test_Read_Temperature (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature > -50.0, 
                              "Temperature should be above -50°C");
      AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature < 100.0, 
                              "Temperature should be below 100°C");
   end Test_Read_Temperature;
   
   procedure Test_Initialize_Cleanup (T : in out AUnit.Test_Cases.Test_Case) is
   begin
      Temperature_Sensor.Cleanup;
      AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature = 0.0, 
                              "Temperature should be 0 after cleanup");
      
      Temperature_Sensor.Initialize;
      AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature > 0.0, 
                              "Temperature should be positive after initialization");
   end Test_Initialize_Cleanup;

end Test_Temperature_Sensor;
```

#### 7.0.1.3 Step 3: Create a Test Runner

```ada
-- tests/test_runner.adb
with AUnit.Runner;
with AUnit.Test_Suites;
with Test_Temperature_Sensor;

procedure Test_Runner is
   Test_Suite : AUnit.Test_Suites.Test_Suite;
begin
   Test_Suite.Add_Test (Test_Temperature_Sensor.Test_Read_Temperature'Access,
                        Setup  => Test_Temperature_Sensor.Setup'Access,
                        Teardown => Test_Temperature_Sensor.Teardown'Access);
   Test_Suite.Add_Test (Test_Temperature_Sensor.Test_Initialize_Cleanup'Access,
                        Setup  => Test_Temperature_Sensor.Setup'Access,
                        Teardown => Test_Temperature_Sensor.Teardown'Access);
   AUnit.Runner.Run_Tests (Test_Suite);
end Test_Runner;
```

#### 7.0.1.4 Step 4: Build and Run Tests

```bash
# 8 Build the project
gnatmake -P project.gpr tests/test_runner.adb

# 9 Run the tests
./test_runner
```

This exercise shows how to test hardware-related code with setup/teardown procedures. You'll see how AUnit makes testing sensor code reliable and maintainable.

## 9.1 Real-World Testing Scenarios

Let's explore how testing applies to common real-world applications.

### 9.1.1 Home Automation System

A home automation system might include:
- Temperature sensors
- Lighting controls
- Security systems

Each component can be tested separately:

```ada
-- Test temperature sensor readings
procedure Test_Temperature_Sensor (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature > -50.0, 
                           "Temperature should be above -50°C");
   AUnit.Assertions.Assert (Temperature_Sensor.Read_Temperature < 100.0, 
                           "Temperature should be below 100°C");
end Test_Temperature_Sensor;

-- Test lighting controls
procedure Test_Light_Control (T : in out AUnit.Test_Cases.Test_Case) is
begin
   Light_Control.Turn_On;
   AUnit.Assertions.Assert (Light_Control.Is_On, "Light should be on");
   
   Light_Control.Turn_Off;
   AUnit.Assertions.Assert (not Light_Control.Is_On, "Light should be off");
end Test_Light_Control;
```

This modular approach makes it easy to test each component independently.

### 9.1.2 Personal Finance Tool

A personal finance tool might include:
- Interest calculations
- Budget tracking
- Transaction processing

Each feature can be tested separately:

```ada
-- Test interest calculations
procedure Test_Interest_Calculation (T : in out AUnit.Test_Cases.Test_Case) is
begin
   AUnit.Assertions.Assert (Calculate_Interest(1000.0, 0.05, 1) = 50.0, 
                           "5% interest on $1000 should be $50");
   AUnit.Assertions.Assert (Calculate_Interest(5000.0, 0.02, 2) = 200.0, 
                           "2% interest on $5000 for 2 years should be $200");
end Test_Interest_Calculation;

-- Test budget tracking
procedure Test_Budget_Tracking (T : in out AUnit.Test_Cases.Test_Case) is
begin
   Budget_Tracking.Add_Transaction(100.0, "Groceries");
   AUnit.Assertions.Assert (Budget_Tracking.Get_Balance = 100.0, 
                           "Balance should be $100 after transaction");
   
   Budget_Tracking.Add_Transaction(-50.0, "Utilities");
   AUnit.Assertions.Assert (Budget_Tracking.Get_Balance = 50.0, 
                           "Balance should be $50 after second transaction");
end Test_Budget_Tracking;
```

This approach ensures each part of your application works correctly before combining them.

## 9.2 Next Steps for Mastering AUnit

Now that you've learned the basics, here are some next steps to continue your journey:

### 9.2.1 \. Explore Advanced Testing Techniques

Try these more advanced techniques:
- **Mock objects**: Simulate hardware or external dependencies
- **Parameterized tests**: Run the same test with different inputs
- **Test-driven development**: Write tests before writing code
- **Continuous integration**: Automatically run tests on code changes

### 9.2.2 \. Practice with Real-World Projects

Apply AUnit to your own projects:
- Build a home automation system with sensor testing
- Create a personal finance tool with transaction testing
- Develop a data processing pipeline with validation testing

### 9.2.3 \. Learn About Test Coverage

Measure how much of your code is tested:
```bash
gnatcov run -P project.gpr --level=stmt
gnatcov report -P project.gpr
```

This shows which parts of your code are covered by tests and which need more testing.

### 9.2.4 \. Join the Ada Community

The Ada community is active and supportive. Join:
- **AdaCore forums**: For technical support
- **GitHub repositories**: For Ada projects and examples
- **Ada mailing lists**: For discussions and questions

## 9.3 Conclusion: The Power of Reliable Testing

> "Testing isn't just for safety-critical systems—it's essential for any application where reliability matters. With AUnit, you can build robust, maintainable code for home automation, personal finance tools, and more—without specialized knowledge."

Testing is a fundamental skill for any programmer, regardless of experience level. AUnit makes testing in Ada simple, reliable, and accessible to beginners. With AUnit, you can:
- Catch bugs early when they're easier to fix
- Build confidence in your code before deploying
- Make maintenance easier by verifying existing functionality
- Create documentation through test cases
- Collaborate more effectively with clear tests

For everyday applications, these benefits translate directly to better user experiences. A home automation system that works reliably builds trust with users. A personal finance app that calculates correctly prevents financial mistakes. Testing isn't just for professionals—it's a practical tool for any developer who wants to build reliable software.

As you continue your Ada journey, remember that testing isn't an extra step—it's an essential part of development. By incorporating testing from the beginning, you'll develop good habits that will serve you well as your projects grow.

Testing is more than just a technical skill—it's a mindset. It encourages you to think carefully about what your code should do, how it should behave, and how to verify that it works correctly. This mindset will make you a better programmer, regardless of what language or platform you use.
