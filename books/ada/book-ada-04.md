# Chapter 4: Lexical Style and Basic Syntax

> "Ada's syntax is designed to be explicit and readable. Every keyword and
> symbol has a clear purpose, ensuring that code remains maintainable over
> decades. This precision is critical in safety-critical systems where
> ambiguity can lead to catastrophic failures."  
> — Senior Architect, NASA Jet Propulsion Laboratory

## 4.1 Syntax Notation (BNF)

Ada's syntax is formally defined using Backus-Naur Form (BNF), a mathematical
notation for describing context-free grammars. The Ada Reference Manual (ARM)
uses an Extended BNF (EBNF) variant based on ISO/IEC 14977 to precisely define
every syntactic construct, eliminating ambiguity in language
interpretation. This formal definition ensures
precise language specifications, enabling consistent compiler implementations across
platforms.

BNF consists of production rules where non-terminal symbols (enclosed in angle
brackets) are defined in terms of terminal symbols and other non-terminals.
For example:

```ebnf
<if_statement> ::= if <condition> then
                    <sequence_of_statements>
                 [else
                    <sequence_of_statements>]
                 end if
```

Here, `if`, `then`, `else`, and `end if` are terminal symbols (keywords),
while `<condition>` and `<sequence_of_statements>` are non-terminals that can
be further defined. The square brackets indicate optional elements.

Ada's BNF rules are context-free, meaning they don't consider surrounding
context when parsing. However, semantic checks (like type checking) are
handled separately during compilation. This separation allows the BNF to focus
purely on structure while the compiler handles meaning.

### BNF in the Ada Reference Manual

The ARM organizes syntax definitions by chapter. For example, Chapter 2
defines lexical elements, Chapter 3 defines declarations, and Chapter 5
defines statements. Each section uses BNF to precisely specify syntax rules.
Consider this example from the ARM for loop statements:

```ebnf
<for_loop> ::= [for <loop_parameter_specification>]
                loop
                   <sequence_of_statements>
                end loop [loop_label];
```

This rule specifies that a for-loop must start with `for`, followed by a
parameter specification, then `loop`, then statements, and finally `end loop`
with an optional label.

> **BNF in 30 seconds**
> Non-terminal = placeholder you still need to define.
> Terminal = exact word/symbol you type.
> `[ ]` optional, `{ }` zero-or-more, `|` picks one branch.
> That's it—now you can read any Ada grammar rule in the ARM.

### BNF vs. Other Notations

While BNF is the standard for language definition, other notations exist:

- Extended BNF (EBNF): Adds repetition operators like `*` (zero or more) and
  `+` (one or more)
- Syntax Diagrams: Visual representations of syntax rules
- Parsing Expression Grammars (PEG): A newer alternative with different
  parsing semantics

Ada's ARM primarily uses BNF, but some modern versions incorporate EBNF
extensions for readability. For example, the ARM might write:

```ebnf
<real_literal> ::= <digit_sequence> . <digit_sequence> [exponent]
                 | . <digit_sequence> [exponent]
                 | <digit_sequence> exponent
```

Where `[exponent]` indicates optional exponent part.

### Why BNF Matters for Safety

Formal syntax definitions are critical for safety-critical systems. When the
ARM specifies syntax precisely, compiler vendors can implement consistent
behavior. This eliminates "undefined behavior" common in languages like C/C++
where syntax ambiguities lead to unpredictable results.

For example, consider this C code snippet:

```c
if (a == b)
   if (c == d)
      do_something();
else
   do_something_else();
```

This has ambiguous structure due to missing braces. In Ada, the equivalent:

```ada
if A = B then
   if C = D then
      Do_Something;
   end if;
else
   Do_Something_Else;
end if;
```

is unambiguous because Ada requires explicit `end if` markers. BNF ensures
this structure is precisely defined.

```ebnf
<if_statement> ::= if <condition> then <sequence_of_statements>
                   {elsif <condition> then <sequence_of_statements>}
                   [else <sequence_of_statements>] end if
```

When a parser reduces an Ada `if` expression, each branch in the tree is
anchored by the terminating `end if;`, so there is no place for a dangling
`else`. Parsing tools such as `gnatpp` (the GNAT pretty-printer) rely on this
grammar: they can safely reformat source because the syntax tree has only one
legal shape for each construct.

### Real-World BNF Example: Array Declaration

Let's examine a more complex example from the ARM:

```ebnf
<array_type_definition> ::= <array_definition> | <array_subtype_definition>

<array_definition> ::= <index_constraint> [of <element_subtype_indication>]

<index_constraint> ::= ( <index_constraint_element> {, <index_constraint_element>} )

<index_constraint_element> ::= <discrete_subtype_definition>
                            | <range>

<range> ::= <simple_expression> .. <simple_expression>
```

This BNF rule defines how array types are declared in Ada. It shows that an
array definition consists of an index constraint followed by an optional
element subtype indication. The index constraint can have multiple elements
separated by commas, where each element is either a discrete subtype
definition or a range.

This precise definition ensures consistent interpretation across compilers.
For example, the following array declaration:

```ada
type My_Array is array (1..10, Positive range <>) of Integer;
```

is parsed correctly because the BNF rules define exactly how indices and
ranges work.

### Table 4.1: Common BNF Constructs in Ada

Table 4.1 summarises the BNF notation used throughout this chapter so you can
quickly decode each production rule.

| BNF Construct    | Meaning                  | Example Usage                           |
| ---------------- | ------------------------ | --------------------------------------- |
| `<non_terminal>` | Non-terminal symbol      | `<if_statement>`                        |
| `"terminal"`     | Terminal symbol (literal) | `"if"`                                  |
| Vertical bar (pipe) | Alternative              | Use the vertical bar character to separate alternatives |
| `[ ]`            | Optional                 | `[else <statements>]`                   |
| `{ }`            | Zero or more repetitions | `{, <parameter>}`                       |
| `...`            | Omitted details          | `<complex_construct> ::= ...`           |

### The Role of BNF in Compiler Development

Compiler developers use BNF to build parsers that translate source code into
abstract syntax trees. This process involves:

1. **Lexical Analysis**: Breaking input into tokens (identifiers, keywords,
   etc.)
2. **Syntax Analysis**: Using BNF rules to check token sequences
3. **Semantic Analysis**: Verifying type correctness and other rules

The BNF definition ensures that all Ada compilers handle syntax consistently.
For example, when parsing a `for` loop:

```ada
for I in 1..10 loop
   Put_Line(Integer'Image(I));
end loop;
```

The parser uses BNF rules to recognize:

- `for` as keyword
- `I` as identifier
- `in` as keyword
- `1..10` as range
- `loop` as keyword
- Statements between `loop` and `end loop`

This consistency is critical for safety-critical systems where different
compilers must behave identically.

### BNF and Language Evolution

Ada's BNF evolves with each standard. For example, Ada 2012 introduced aspect
specifications:

```ada
<aspect_specification> ::= with <aspect_identifier> => <expression>
```

This rule defines how aspects like `Pre` and `Post` are written in contracts.
The BNF ensures consistent implementation across compilers, allowing
developers to rely on the same syntax features regardless of toolchain.

Ada 2022 extends the grammar with structured parallel constructs. The
`parallel` reserved word appears in production rules such as:

```ebnf
<parallel_block> ::= parallel <handled_sequence_of_statements>
                     {and <handled_sequence_of_statements>}
                     end parallel
```

We will explore the concurrency implications in Chapter 11, but the lexical
lesson is that `parallel` now introduces a block much like `declare` or
`loop`.

### Translating BNF to Source Code

BNF is most useful when you can trace each symbol to real code. Revisit the
`if_statement` rule from earlier:

```ebnf
<if_statement> ::= if <condition> then <sequence_of_statements>
                   {elsif <condition> then <sequence_of_statements>}
                   [else <sequence_of_statements>] end if
```

You can map it directly to Ada source by following the placeholders:

1. Replace `<condition>` with a boolean expression.
2. Swap `<sequence_of_statements>` for one or more Ada statements.
3. Repeat the optional/iterated parts as needed.

```ada
if Temperature > Safe_Limit then
   Initiate_Cooling;
elsif Temperature > Warning_Limit then
   Log_Warning;
else
   Continue_Normal_Operation;
end if;
```

Each clause mirrors the grammar: an `if` keyword, a condition, a `then`, and a
statement sequence, followed by zero or more `elsif` blocks and an optional
`else` before the closing `end if;`.

### Real-World Example: Launch Abort Rules

Launch systems often encode complex guard logic that traces neatly back to BNF
rules. Consider a simplified abort decision:

```ada
if (Fuel_Level < Minimum_Fuel) or else (Guidance_Status = Faulted) then
   Abort_Countdown;
elsif Weather_Status = Red_Flag then
   Hold_Countdown;
end if;
```

Mission assurance teams can review the code against the grammar to ensure no
dangling `else` clauses or missing branches slip in—proof that the BNF-driven
structure aids safety-critical reviews.

### Common Mistakes When Reading BNF

- Treating `{ ... }` as “exactly once” rather than “zero or more”; remember the
  braces indicate repetition, not mandatory presence.
- Forgetting that optional `[ ... ]` clauses may hide required punctuation like
  `else`—the brackets mean the entire clause can be omitted, not that the
  keyword itself becomes optional when the clause is present.
- Ignoring terminators. The `end if;` token in the grammar is part of the
  production, so leaving it out in code is a syntax error, not mere style.
- Reading terminal symbols case-insensitively. The grammar lists them in
  lowercase, but Ada accepts any casing; tooling and reviews expect lowercase
  for readability.

### BNF Quick Check

1. Using the grammar for `<for_loop>`, sketch code that iterates over an array
   of temperatures and logs values above a limit.
2. Identify the optional portion of the `if_statement` grammar and explain when
   it is acceptable to omit it in production code.
3. Translate the `parallel_block` rule into a short Ada snippet and describe a
   scenario where it improves responsiveness on multicore hardware.

## 4.2 Lexical Elements

Lexical elements are the smallest units of meaning in Ada code. These include
identifiers, reserved words, delimiters, and numeric literals. Proper
understanding of lexical elements is essential for writing correct Ada code.

Ada treats horizontal tabs as single whitespace characters (ARM 2.1), making them
legal for code alignment but equivalent to spaces in parsing. When aligning
comments or code blocks, consider that different editors may display tabs with
different widths, potentially breaking visual alignment.

### 4.2.1 Identifiers and Reserved Words

Identifiers are names given to program entities like variables, types, and
subprograms. Ada identifiers follow specific rules:

- Must start with a letter (A-Z or a-z)
- May contain letters, digits (0-9), and underscores (\_)
- Cannot contain spaces or special characters
- Are case-insensitive (e.g., `Temperature` and `temperature` are identical)

> **Ada Casefold Rules**  
> Ada treats identifiers case-insensitively: `Variable`, `VARIABLE`, and
> `variable` all refer to the same entity. However, consistency in casing
> improves readability and is enforced by coding standards.

Ada's case-insensitivity simplifies writing but requires disciplined naming
conventions. The community standard uses PascalCase for types and subprograms,
and snake_case for variables and parameters.

#### Unicode Identifiers

Ada 2022 supports Unicode identifiers using characters beyond basic ASCII.
Identifiers may include Latin-1 supplement characters and Unicode letters
that satisfy the `XID_Start` and `XID_Continue` properties (defined in
Unicode Standard Annex #31). For example:

```ada
Δθ : Float;  -- Greek delta and theta
Température : Float;  -- French accented character
Velocität : Float;  -- German umlaut
```

While Unicode identifiers enhance internationalization, consider tool support
and team preferences before using them extensively. Some legacy tools may not
display or process Unicode identifiers correctly.

#### 4.2.1.1 Reserved Words

Reserved words are keywords with special meaning in Ada. They cannot be used
as identifiers and are always written in lowercase in source code. The
complete Ada 2022 list is shown below (alphabetical order):

```text
abort      abs        abstract   accept     access     aliased     all         and
array      at         begin      body       case       constant    declare     delay
delta      digits     do         else       elsif      end         entry       exception
exit       for        function   generic    goto       if          in          interface
is         limited    loop       mod        new        not         null        of
or         others     out        overriding package    parallel    pragma      private
procedure  protected  raise      range      record     rem         renames     requeue
return     reverse    select     separate   some       subtype     synchronized tagged
task       terminate  then       type       until      use         when        while
with       xor
```

> **Tip:** The Ada Reference Manual (ARM) maintains this authoritative list;
> tools such as `gnatls` can also display the current reserved words for a
> given compiler release.

Correct code may use a reserved word inside a longer identifier, but the
reserved word itself cannot be redeclared:

```ada
If_Value : Integer := 0;  -- legal: "if" appears inside a longer identifier
if : Integer := 42;       -- illegal: plain "if" is a reserved word
```

Ada 2022 defines exactly 70 reserved words—the list above contains them all.
You can confirm the count with tooling such as `gnatls -v` or by consulting
Annex P of the Ada Reference Manual (ARM). Note in particular the newer additions
`some` (quantified expressions) and `parallel` (structured parallelism), which
may be unfamiliar if you last used Ada 2005.

#### 4.2.1.2 Naming Conventions

Ada's case-insensitivity requires disciplined naming conventions to ensure
readability:

- **PascalCase for Types and Subprograms**: `Temperature_Sensor`,
  `Calculate_Distance`
- **snake_case for Variables and Parameters**: `current_temperature`,
  `total_count`
- **UPPERCASE for Constants**: `MAX_SPEED`, `PI`

These conventions make code self-documenting. For example:

```ada
type Vehicle_Speed is new Float range 0.0 .. 350.0;
Current_Speed : Vehicle_Speed := 0.0;
Max_Speed : constant Vehicle_Speed := 300.0;
```

Here, `Vehicle_Speed` is clearly a type, `Current_Speed` is a variable, and
`Max_Speed` is a constant.

Large, long-lived Ada programs often extend these conventions with lightweight
prefixes that encode intent without sacrificing readability. For example,
embedded teams may adopt a “systems Hungarian” style such as `In_Speed` or
`Out_Voltage` to clarify data direction at call sites. The key is consistency:
choose a scheme in your project standards and apply it everywhere so that
maintainers decades later can infer semantics at a glance.

#### 4.2.1.3 Real-World Examples

**Aerospace Navigation System:**

```ada
type Latitude is new Float range -90.0 .. 90.0;
type Longitude is new Float range -180.0 .. 180.0;

Current_Latitude : Latitude := 40.7128;
Current_Longitude : Longitude := -74.0060;
```

**Industrial Control System:**

```ada
type Motor_Speed_RPM is new Integer range 0 .. 10000;
type Pressure_PSI is new Float range 0.0 .. 500.0;

Current_Motor_Speed : Motor_Speed_RPM := 0;
System_Pressure : Pressure_PSI := 14.7;  -- Atmospheric pressure
```

**Financial Trading System:**

```ada
type Currency_Code is (USD, EUR, GBP, JPY, CHF);
type Price_Cents is new Integer range 0 .. Integer'Last;

Base_Currency : Currency_Code := USD;
Current_Price : Price_Cents := 12550;  -- $125.50
```

The naming conventions clearly indicate the type and purpose of each variable,
preventing accidental mixing of incompatible values—a critical safety feature
across all domains.

#### 4.2.1.4 Invalid Identifiers

Some identifiers are invalid due to Ada's rules:

- `123var` — starts with a digit
- `my-var` — contains hyphen
- `@name` — contains special character
- `for` — reserved word

Using invalid identifiers causes immediate compile-time errors:

```text
error: invalid identifier "123var"
error: reserved word "for" cannot be used as identifier
```

#### 4.2.1.5 Table 4.2: Reserved Words by Category

| Category                     | Reserved Words                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Control & Flow               | if, elsif, else, then, case, when, loop, while, for, exit, goto, reverse, select, until, return, do                                            |
| Program Structure & Units    | begin, declare, end, package, procedure, function, separate, body, generic, private, protected, interface, is, renames                         |
| Types & Data Definition      | type, subtype, range, array, record, access, limited, digits, delta, abstract, tagged, aliased, constant                                      |
| Concurrency & Synchronization | accept, entry, task, synchronized, abort, delay, requeue, parallel, terminate                                                                   |
| Operators & Logic            | and, or, xor, not, abs, mod, rem                                                                                                               |
| Declarations & Visibility    | pragma, raise, others, some, use, with, null, new, all, out, in, of, overriding, at, exception                                                 |

> The groups above are intended for study purposes only; every reserved word
> retains equal grammatical status in the language regardless of category.

Ada 2012 introduced quantified expressions that rely on the `some` reserved
word, allowing boolean tests across collections:

```ada
if (some Reading of Temperature_Array => Reading > 100.0) then
   Trigger_Cooling_Fan;
end if;
```

Ada 2022 adds the `parallel` reserved word to support explicit parallel blocks
and loops for multi-core execution:

```ada
parallel
   Update_Temperature;
and
   Update_Pressure;
end parallel;
```

You will also encounter `parallel loop` and `parallel` reductions in Ada 2022
tasking code. These constructs appear in detail in Chapter 11 on concurrency,
but it is helpful to recognise the reserved word early when reading modern Ada
code bases.

### 4.2.2 Delimiters and Separators

Delimiters and separators are symbols that define structure in Ada code. They
include arithmetic operators, relational operators, punctuation marks, and
grouping symbols.

#### 4.2.2.1 Arithmetic Operators

Ada supports standard arithmetic operators:

```text
+  Addition
-  Subtraction or unary negation
*  Multiplication
/  Division
** Exponentiation
```

These operators follow standard precedence rules. For example, multiplication
has higher precedence than addition:

```ada
X := 2 + 3 * 4;  -- X = 14, not 20
```

Parentheses can override precedence:

```ada
X := (2 + 3) * 4;  -- X = 20
```

`mod` and `rem` frequently confuse newcomers. `mod` returns a non-negative
result whose sign matches the divisor, while `rem` keeps the sign of the
left-hand operand:

```ada
Put_Line(Integer'Image( 13 mod  5));  --  3
Put_Line(Integer'Image(-13 mod  5));  --  2
Put_Line(Integer'Image(-13 rem  5));  -- -3
```

> **Mnemonic:** **MOD**ulo sign follows the **DIVISOR**; **REM**nant keeps the **DIVIDEND**'s sign.

#### 4.2.2.2 Relational Operators

Relational operators compare values:

```text
=  Equality
/= Not equal
<  Less than
>  Greater than
<= Less than or equal
>= Greater than or equal
```

These operators work with numeric types, characters, and strings:

```ada
if Temperature < 0.0 then
   Freeze_Detected;
end if;

if Name = "John" then
   Greet_John;
end if;
```

#### 4.2.2.3 Punctuation and Grouping Symbols

Ada uses several punctuation symbols:

```text
.  Decimal point or record field access
,  Parameter separator or array index separator
;  Statement terminator
:  Declaration separator or label prefix
( )  Grouping expressions or function parameters
[ ]  Array aggregates (Ada 2012+ shorthand)
{ }  Not part of Ada syntax
```

Ada 2012 introduced square brackets as an alternative notation for array
aggregates, particularly when working with containers:

```ada
type Number_Array is array (1 .. 4) of Integer;
Numbers : Number_Array := [1, 2, 3, 4];
```

Curly braces remain outside the Ada grammar and are sometimes reserved for
tooling or pseudo-code, but they never appear in compilable Ada source.

The dot (`.`) has two primary uses:

1. **Decimal point in real literals**:

   ```ada
   Pi : constant Float := 3.14159;
   ```

2. **Record field access**:

   ```ada
   type Point is record
      X : Float;
      Y : Float;
   end record;

   P : Point := (X => 1.0, Y => 2.0);
   X_Value : Float := P.X;
   ```

The colon (`:`) is used for:

1. **Variable declarations**:

   ```ada
   X : Integer := 10;
   ```

2. **Labels**:

   ```ada
   Outer_Loop: for I in 1..10 loop
      Inner_Loop: for J in 1..10 loop
         if I = J then
            exit Outer_Loop;
         end if;
      end loop Inner_Loop;
   end loop Outer_Loop;
   ```

The semicolon (`;`) terminates statements:

```ada
X := 10;  -- Terminates assignment statement
Y := 20;  -- Terminates assignment statement
```

#### 4.2.2.4 Special Delimiters

Ada includes special delimiters for specific purposes:

```text
=>  Association symbol (used in record aggregates, function calls)
..  Range operator (1..10)
```

The association symbol (`=>`) is used in:

1. **Record aggregates**:

   ```ada
   P : Point := (X => 1.0, Y => 2.0);
   ```

2. **Named parameter passing**:

   ```ada
   Calculate_Distance(Lat1 => 40.7128, Lon1 => -74.0060);
   ```

The range operator (`..`) defines ranges:

```ada
for I in 1..10 loop
   -- Executes 10 times
end loop;
```

#### 4.2.2.5 Table 4.3: Common Delimiters and Their Usage

Table 4.3 collects the delimiters discussed above and shows a representative
example for each so you can spot them quickly during code reviews.

| Delimiter | Usage                                 | Example                                |
| --------- | ------------------------------------- | -------------------------------------- |
| +         | Addition                              | X := A + B                             |
| -         | Subtraction or unary negation         | X := -Y                                |
| \*        | Multiplication                        | Area := Width * Height                |
| /         | Division                              | Average := Sum / Count                 |
| **        | Exponentiation                        | Square := X ** 2                     |
| =         | Equality                              | if A = B then                          |
| /=        | Not equal                             | if A /= B then                         |
| <         | Less than                             | if Temp < 100.0 then                   |
| >         | Greater than                          | if Speed > Max_Speed then              |
| <=        | Less than or equal                    | if Count <= Max_Count then             |
| >=        | Greater than or equal                 | if Pressure >= Min_Pressure then       |
| .         | Decimal point or record field access  | Pi := 3.14159; X := Point.X            |
| ,         | Parameter separator                   | Add(A, B, C)                           |
| ;         | Statement terminator                  | X := 10; Y := 20;                      |
| :         | Declaration separator or label prefix | X : Integer := 10; Outer_Loop: for ... |
| =>        | Association symbol                    | (X => 1.0, Y => 2.0)                   |
| ..        | Range operator                        | for I in 1..10 loop                    |

#### 4.2.2.6 Real-World Example: Medical Device System

In a medical device that monitors patient vital signs:

```ada
type Heart_Rate is new Integer range 20..250;
type Blood_Pressure is record
   Systolic : Integer range 40..250;
   Diastolic : Integer range 20..150;
end record;

current_heart_rate : Heart_Rate := 72;
current_blood_pressure : Blood_Pressure :=
   (Systolic => 120, Diastolic => 80);

if current_heart_rate > 100 then
   Alert_System.Activate;
end if;
```

Here, the delimiters define structure clearly:

- `:` in declarations
- `=>` in record aggregates
- `.` for record field access
- `>` for comparison
- `;` to terminate statements

This precise use of delimiters prevents ambiguity in safety-critical code.

#### 4.2.2.7 Common Mistakes with Delimiters

New Ada programmers often make these mistakes:

1. **Missing semicolons**:

   ```ada
   X := 10  -- Missing semicolon
   Y := 20;
   ```

   This causes a compile error: "missing semicolon"

2. **Incorrect use of `=` vs `:=`**:

   ```ada
   X = 10;  -- Should be X := 10;
   ```

   `=` is for comparison, `:=` for assignment

3. **Confusing `.` for decimal point vs record access**:

   ```ada
   Point.X := 1.0;  -- Correct
   Point.1.0 := 2.0;  -- Invalid syntax
   ```

### 4.2.3 Common Pitfalls

- Reusing a reserved word for an identifier—`end`, `range`, or `task` might
   look descriptive, but they trigger compile-time errors.
- Mixing case inconsistently. The compiler accepts it, but humans (and code
   reviews) struggle when `MotorSpeed`, `motor_speed`, and `Motorspeed` appear
   side-by-side. Establish a convention and stick to it.
- Forgetting that Ada is case-insensitive when integrating with foreign code.
   An imported C symbol named `InitSensor` must be referenced exactly as exported;
   adding or removing underscores in Ada will change the linker name.
- Leaving out blank lines around code fences in documentation literals—tools
   such as Markdownlint expect the spacing illustrated in this chapter when
   you prepare design notes or coding standards.

### 4.2.4 Practice Drill

1. Rename three identifiers from a legacy subsystem to follow the PascalCase
   and snake_case conventions described above. What readability improvements do
   you notice during code review?
2. Write a short Ada snippet that demonstrates both a legal and an illegal use
   of a reserved word inside an identifier. What diagnostic does GNAT emit on
   the illegal case?
3. Construct a record declaration using named associations (`=>`) and annotate
   each delimiter with comments to reinforce its role.

## 4.3 Numeric Literals

Numeric literals represent numbers in Ada code. They include integers, real
numbers, and based literals (numbers in different bases).

### 4.3.1 Integer Literals

Integer literals represent whole numbers. They can be:

- Decimal: `42`, `1234567890`
- Based: `16#FF#`, `2#1010#`, `8#777#`
- Based with exponent: `16#FF#E-2` (255 × 10^-2)

Integer literals cannot contain decimal points or exponents. They can include
underscores for readability:

```ada
Large_Number : constant Integer := 1_000_000_000;
Binary_Value : constant Integer := 2#1010_1010#;
```

Underscores carry no semantic meaning—they are removed by the compiler before
evaluation—so `1_000_000` is precisely the same value as `1000000`. Use them
liberally to prevent mistakes when scanning long literals.

> **Underscores are free safety belts**  
> The compiler strips underscores, but your eyes don't. A 24-bit colour value
> `16#FF_12_A0#` is instantly recognised as R-G-B bytes; without underscores a
> single flipped hex digit becomes a nightmare to spot during review.

#### 4.3.1.1 Integer Range Constraints

Ada integers have implementation-defined ranges, but must support at least:

- Standard Integer: -2^31 to 2^31-1 (32-bit)
- Long_Integer: -2^63 to 2^63-1 (64-bit)

For safety-critical systems, programmers often define precise integer ranges:

```ada
type Sensor_Value is range 0..100;
type Temperature is range -50..150;
```

These ranges ensure values stay within physical limits. Attempting to assign
an out-of-range value causes a constraint error:

```ada
Value : Sensor_Value := 101;  -- Raises CONSTRAINT_ERROR
```

#### 4.3.1.2 Real-World Example: Aerospace System

In an aircraft altitude system:

```ada
type Altitude_Feet is new Integer range 0..50000;
current_altitude : Altitude_Feet := 35000;
```

This ensures altitude values never exceed 50,000 feet—a critical safety
constraint.

#### 4.3.1.3 Common Integer Literal Mistakes

1. **Using decimal point in integer literals**:

   ```ada
   X : Integer := 10.0;  -- Error: real literal cannot be assigned to integer
   ```

2. **Invalid based literal syntax**:

   ```ada
   X : Integer := 16#FF;  -- Error: missing closing #
   ```

3. **Using invalid characters in based literals**:

   ```ada
   X : Integer := 2#123#;  -- Error: binary digits must be 0 or 1
   ```

### 4.3.2 Real Literals

Real literals represent floating-point numbers. They can be:

- Decimal: `3.14`, `0.001`, `1.0E-5`
- Scientific notation: `6.022E23`, `1.602e-19`
- Based: `16#FF#E-2`, `2#1.01#E1`

Real literals must contain a decimal point or exponent. They can include
underscores for readability:

```ada
Pi : constant Float := 3.1415926535_89793;
Avogadro : constant Float := 6.022_140_76E23;
```

#### 4.3.2.1 Real Literal Precision

Ada defines two standard floating-point types:

- `Float`: Minimum precision of 6 decimal digits
- `Long_Float`: Minimum precision of 12 decimal digits

Programmers can define custom floating-point types with precise precision:

```ada
type Voltage is digits 6 range 0.0..12.0;
type Pressure is digits 8 range 0.0..1000.0;
```

Here, `digits 6` specifies at least 6 significant decimal digits of precision.

#### 4.3.2.2 Real-World Example: Scientific Calculation

In a physics simulation:

```ada
type Acceleration is digits 10 range -100.0..100.0;
gravity : constant Acceleration := 9.80665;
speed : Acceleration := 0.0;
time : Float := 10.0;

speed := gravity * time;  -- 98.0665
```

This ensures precise calculation of acceleration values.

#### 4.3.2.3 Common Real Literal Mistakes

1. **Missing decimal point**:

   ```ada
   X : Float := 10;  -- Valid but not ideal; better to use 10.0
   ```

2. **Invalid exponent format**:

   ```ada
   X : Float := 1.0E-2.0;  -- Error: exponent must be integer
   ```

3. **Using commas as decimal separators**:

   ```ada
   X : Float := 3,14;  -- Error: comma is not allowed
   ```

### 4.3.3 Based Literals

Based literals represent numbers in different bases. They use the format:

```text
base#digits#
```

Where:

- `base` is an integer between 2 and 16
- `digits` are valid for the base (0-9 for base 10, 0-9 and A-F for base 16)

Based literals can include underscores for readability:

```ada
Binary_Value : constant Integer := 2#1010_1010#;
Hex_Value : constant Integer := 16#FF_FF#;
Octal_Value : constant Integer := 8#777#;
```

#### 4.3.3.1 Fractional Based Literals

Based literals can also represent fractional values using a decimal point:

```ada
-- Binary fraction: 1.5 in decimal
Binary_Fraction : constant Float := 2#1.1#;  -- 1 + 0.5 = 1.5

-- Hexadecimal fraction: 10.75 in decimal  
Hex_Fraction : constant Float := 16#A.C#;    -- 10 + 12/16 = 10.75

-- Octal fraction: 3.125 in decimal
Octal_Fraction : constant Float := 8#3.1#;   -- 3 + 1/8 = 3.125
```

The fractional part follows the same base rules as the integer part. For
example, in base 16, `.C` represents 12/16 = 0.75.

#### 4.3.3.2 Based Literals with Exponents

Based literals can include exponents:

```text
base#digits#Eexponent
```

For example:

```ada
Hex_With_Exponent : constant Float := 16#FF#E-2;  -- 255 × 10^-2 = 2.55
Binary_With_Exponent : constant Float := 2#1.01#E1;  -- 1.25 × 10^1 = 12.5
```

#### 4.3.3.3 Base Conversion Examples

Here are common base conversions:

| Base                  | Example   | Decimal Equivalent |
| --------------------- | --------- | ------------------ |
| Binary                | 2#1010#   | 10                 |
| Hexadecimal           | 16#FF#    | 255                |
| Octal                 | 8#777#    | 511                |
| Base 10               | 10#123#   | 123                |
| Base 16 with exponent | 16#FF#E-2 | 2.55               |
| Base 2 with exponent  | 2#1.01#E1 | 12.5               |

#### 4.3.3.4 Real-World Example: Embedded Systems

In embedded systems, based literals are commonly used for:

- Memory addresses (hexadecimal)
- Bit masks (binary)
- Configuration values (various bases)

```ada
-- Memory address in hex
Memory_Address : constant Integer := 16#FFFF#;

-- Bit mask for flags
Flag_Bit_Mask : constant Integer := 2#0000_1000#;

-- Configuration value in octal
Config_Value : constant Integer := 8#77#;
```

#### 4.3.3.5 Common Based Literal Mistakes

1. **Invalid base**:

   ```ada
   X : Integer := 1#1#;  -- Error: base must be between 2 and 16
   ```

2. **Invalid digits for base**:

   ```ada
   X : Integer := 2#2#;  -- Error: binary digits must be 0 or 1
   ```

3. **Missing # symbols**:

   ```ada
   X : Integer := 16#FF;  -- Error: missing closing #
   ```

### 4.3.5 Enumeration Literals

Enumeration literals represent a fixed set of named values. Character literals
are written between apostrophes, while user-defined enumeration literals are
bare identifiers:

```ada
type Compass_Direction is (North, East, South, West);
type ASCII is (NUL, SOH, STX, ETX, ... , DEL);

Heading : Compass_Direction := North;
Newline : constant Character := '\n';
```

Enumeration literals participate in the lexical rules just like numeric
literals: they are single tokens, cannot contain whitespace, and are
case-insensitive. Chapter 6 (Types and Declarations) revisits derived
enumerations and Chapter 7 (Control Structures) shows how `for` loops iterate
over enumeration ranges, but it is helpful to recognize them now as part of
Ada's lexical vocabulary.

Do not confuse character literals with strings: `'A'` represents a single
character value of type `Character`, while "A" is a string literal of type
`String` with length 1. Likewise, `'\n'` is a newline character, whereas
"\n" is a two-character string containing a backslash followed by the letter
`n`. The compiler treats these as distinct lexical categories, so be explicit
about which one you need.

### 4.3.6 String Literals

String literals represent sequences of characters enclosed in double quotes.
Ada supports various string literal forms to handle different character sets
and encodings.

#### 4.3.6.1 Basic String Literals

Standard string literals are sequences of characters in double quotes:

```ada
Message : constant String := "Hello, World!";
Empty_String : constant String := "";
Quote_Example : constant String := "He said ""Hello"" to me.";
```

To include a double quote within a string literal, use two consecutive double
quotes (`""`).

#### 4.3.6.2 Escape Sequences and Special Characters

Ada uses character literals rather than C-style escape sequences:

```ada
New_Line : constant Character := ASCII.LF;  -- Line feed
Tab_Char : constant Character := ASCII.HT;  -- Horizontal tab
Null_Char : constant Character := ASCII.NUL; -- Null character

-- Building strings with special characters
Status_Line : constant String := "Status: OK" & ASCII.LF;
```

#### 4.3.6.3 Wide and Wide_Wide Strings

Ada supports Unicode through Wide_Character and Wide_Wide_Character types:

```ada
-- Wide strings (16-bit characters)
Wide_Message : constant Wide_String := "Café";

-- Wide_Wide strings (32-bit characters, full Unicode)
Unicode_Message : constant Wide_Wide_String := "Hello 世界";
```

These are essential for internationalized applications where text may contain
characters outside the basic ASCII range.

#### 4.3.6.4 Real-World Example: Configuration Messages

In an embedded system with multi-language support:

```ada
type Language is (English, French, German);

function Get_Alert_Message(Lang : Language) return String is
begin
   case Lang is
      when English => return "SYSTEM ALERT: Temperature exceeded";
      when French  => return "ALERTE SYSTÈME: Température dépassée";
      when German  => return "SYSTEMALARM: Temperatur überschritten";
   end case;
end Get_Alert_Message;
```

#### 4.3.6.5 Common String Literal Mistakes

1. **Confusing character and string literals**:

   ```ada
   Ch : Character := "A";  -- Error: should be 'A'
   ```

2. **Incorrect quote escaping**:

   ```ada
   Quote : String := "He said "Hello"";  -- Error: should be ""Hello""
   ```

3. **Mixing string types**:

   ```ada
   Mixed : String := Wide_String'("Test");  -- Explicit conversion needed
   ```

### 4.3.7 Common Pitfalls

- Dropping underscores when copying values from specifications. The compiler
   treats `2#1010_1010#` and `2#10101010#` the same, but humans often misread
   the latter.
- Using `rem` when the algorithm depends on a non-negative remainder (or vice
   versa). Always decide whether you need the sign of the divisor (`mod`) or
   the dividend (`rem`).
- Forgetting to close based literals with `#`. The compiler will happily read
   `16#FF` as two tokens (`16#` and `FF`) and report a confusing syntax error.
- Mixing enumeration and numeric literals in I/O without conversion; use
   `'Image` attributes (`Direction'Image(Heading)`) to render enumeration values
   safely.

### 4.3.8 Practice Drill

1. Express the decimal value 255 as both a hexadecimal based literal and a real
   literal that uses an exponent.
2. Write a small enumeration for traffic-light states and iterate over it with
   a `for` loop, printing each literal via `'Image` to reinforce enumeration I/O.
3. Given a sensor value subtype constrained to `0 .. 4095`, explain why
   suppressing range checks could be dangerous and propose a safer optimisation
   (for example, a tighter subtype or pre-validation step).

## 4.4 Comments, Pragmas, and Aspects

### 4.4.1 Writing Effective Comments

Comments in Ada start with `--` and continue to the end of the line. They are
ignored by the compiler but critical for documentation.

#### 4.4.1.1 Comment Best Practices

1. **Explain why, not what**: Comments should describe the reasoning behind
   code, not just repeat what the code does.

   ```ada
   -- Calculate Haversine distance for great circle navigation
   -- This formula accounts for Earth's curvature and is accurate
   -- for distances up to 20,000 kilometers.
   Distance := Calculate_Haversine(Lat1, Lon1, Lat2, Lon2);
   ```

2. **Document contracts**: Use comments to explain preconditions,
   postconditions, and invariants.

   ```ada
   -- Pre: B must not be zero to avoid division by zero
   -- Post: Result * B = A
   function Divide(A, B : Integer) return Integer is
   begin
      return A / B;
   end Divide;
   ```

3. **Comment complex algorithms**: Explain non-obvious logic.

   ```ada
   -- This algorithm uses Newton-Raphson iteration to find
   -- square roots with high precision. It converges quickly
   -- for most inputs but may diverge for negative numbers.
   ```

4. **Comment configuration values**: Explain why specific values are chosen.

   ```ada
   -- Maximum altitude for commercial aircraft: 50,000 feet
   Max_Altitude : constant Float := 50_000.0;
   ```

5. **Comment safety-critical sections**: Highlight code where errors could
   cause physical harm.

   ```ada
   -- Safety-critical section: validate sensor readings before use
   if Sensor_Value < 0.0 or Sensor_Value > 100.0 then
      raise Invalid_Sensor_Value;
   end if;
   ```

#### 4.4.1.2 Comment Formatting

Ada comments should follow these formatting rules:

- Start with `--` followed by a space
- Keep lines under 80 characters
- Use consistent indentation
- Place comments above the code they describe

```ada
-- Calculate distance using Haversine formula
-- This formula accounts for Earth's curvature and is accurate
-- for distances up to 20,000 kilometers. The formula is:
$$a = \sin^2\left(\frac{\Delta\varphi}{2}\right) + \cos(\varphi_1) \cdot \cos(\varphi_2) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$
-- Where φ is latitude, λ is longitude, R is Earth's radius
function Calculate_Haversine(Lat1, Lon1, Lat2, Lon2 : Float) return Float is
   -- Implementation details
end Calculate_Haversine;
```

#### 4.4.1.3 Real-World Example: Medical Device System

In a medical device that monitors patient vital signs:

```ada
-- Heart rate must be between 20 and 250 beats per minute
-- Values outside this range indicate sensor error or patient emergency
type Heart_Rate is range 20..250;

-- Blood pressure readings must be within physiological limits
-- Systolic: 40-250 mmHg, Diastolic: 20-150 mmHg
type Blood_Pressure is record
   Systolic : Integer range 40..250;
   Diastolic : Integer range 20..150;
end record;

-- Safety-critical check: validate vital signs before processing
if Current_Heart_Rate < 20 or Current_Heart_Rate > 250 then
   -- This indicates sensor failure or medical emergency
   Trigger_Emergency_Alert;
end if;
```

#### 4.4.1.4 Note Box: The Importance of Comments in Safety-Critical Systems

> "In Ada, comments are not optional—they are the glue that holds complex
> systems together. A well-commented Ada program is a living specification.
> When a system has a 30-year lifecycle, the original developers may no longer
> be available. Comments ensure that new engineers can understand the code's
> intent and constraints without guessing."
>
> — Senior Architect, NASA Jet Propulsion Laboratory

### 4.4.2 Introduction to Pragmas

Pragmas are compiler directives that provide special instructions to the
compiler. They are not part of the language semantics but affect compilation
behavior.

#### 4.4.2.1 Common Pragmas

Ada includes several standard pragmas:

- **Inline**: Requests the compiler to inline a subprogram
- **Assert**: Checks a condition at runtime
- **Suppress**: Disables certain checks for performance
- **Restrictions**: Sets language restrictions for safety-critical systems
- **Import**: Links external code (e.g., C functions)

#### 4.4.2.2 Inline Pragma

The `Inline` pragma requests the compiler to replace a function call with its
body:

```ada
pragma Inline(Calculate_Distance);

function Calculate_Distance(Lat1, Lon1, Lat2, Lon2 : Float) return Float is
   -- Implementation
end Calculate_Distance;
```

This can improve performance for small, frequently called functions. However,
overuse can increase code size.

#### 4.4.2.3 Assert Pragma

The `Assert` pragma checks a condition at runtime:

```ada
pragma Assert(Speed <= Max_Speed);

if Speed > Max_Speed then
   raise Speed_Exceeded;
end if;
```

This provides runtime verification of critical conditions. In safety-critical
systems, assertions are often enabled in testing but disabled in production.

#### 4.4.2.4 Suppress Pragma

The `Suppress` pragma disables certain checks for performance:

```ada
pragma Suppress(All_Checks);
-- Safety-critical section: must be manually verified
```

This should be used with extreme caution. The Ada Reference Manual states:

> "The use of suppress pragmas is strongly discouraged in safety-critical
> systems. They can lead to undefined behavior if used incorrectly."

In mission-critical or safety-critical software you should suppress at most the
specific check you have proved redundant—and even then only for the smallest
possible scope. Suppressing `Range_Check`, `Overflow_Check`, or
`Constraint_Error` around sensor data, for example, invites silent memory
corruption and can render certification evidence invalid. Prefer targeted
optimisations (better algorithms, representation clauses, or compiler switch
tuning) before reaching for `Suppress`.

On the rare occasions where a suppression is justified, document the proof and
constrain its scope. For example, if static analysis demonstrates that a Direct
Memory Access (DMA) ring buffer index is always within bounds, you can wrap the
proven code in a block and suppress only the index check for that object:

```ada
declare
   pragma Suppress(Index_Check, On => Sensor_Buffer);
begin
   -- Copying has been formally verified to stay within Sensor_Buffer'Range
   Copy_DMA_Frame (Sensor_Buffer, Frame);
end;
```

Here the suppression applies to a single declaration and the justification is
recorded alongside the code. Certification standards such as DO-178C (Software
Considerations in Airborne Systems) require documented justification for any
check suppression, including evidence that the suppressed condition has been
verified through other means.

#### 4.4.2.5 Restrictions Pragma

The `Restrictions` pragma limits language features for safety-critical
systems:

```ada
pragma Restrictions(No_Exception_Propagation);
pragma Restrictions(No_Task_Termination);
```

This is commonly used in Ravenscar profile for real-time systems.

#### 4.4.2.6 Real-World Example: Aerospace System

In an aircraft control system:

```ada
-- Safety-critical function: must be inlined for performance
pragma Inline(Calculate_Altitude);

function Calculate_Altitude(Pressure : Float) return Float is
   -- Implementation
end Calculate_Altitude;

-- Safety check: ensure altitude is within limits
pragma Assert(Altitude >= 0.0 and Altitude <= 50_000.0);
```

#### 4.4.2.7 Note Box: Pragmas in Safety-Critical Systems

> "Pragmas in Ada are a double-edged sword: they provide powerful control but
> must be used with caution. In safety-critical systems, the use of pragmas is
> strictly governed by coding standards to prevent unintended consequences.
> For example, the DO-178C standard requires all pragma usage to be documented
> and justified in the software development plan."
>
> — Principal Engineer, Airbus Defense and Space

### 4.4.3 Introduction to Aspect Specifications

Aspect specifications are a modern Ada feature (introduced in Ada 2012) that
provide declarative annotations for code. They are similar to pragmas but more
integrated with the language syntax.

#### 4.4.3.1 Aspect Syntax

Aspects use the `with` keyword followed by the aspect name and value:

```ada
function Divide(A, B : Integer) return Integer
  with Pre => B /= 0,
       Post => Divide'Result * B = A
is
begin
   return A / B;
end Divide;
```

Here, `Pre` and `Post` are aspect specifications for preconditions and
postconditions.

#### 4.4.3.2 Common Aspects

Ada includes several standard aspects:

- **Pre**: Specifies a precondition (must be true before the subprogram
  executes)
- **Post**: Specifies a postcondition (must be true after the subprogram
  executes)
- **Type_Invariant**: Specifies constraints on a type's state
- **Size**: Specifies memory layout for records
- **Inline**: Similar to pragma but more integrated

#### 4.4.3.3 Contract-Based Programming

Aspects enable contract-based programming where correctness is formally
specified:

```ada
function Withdraw(Account : in out Account_Type; Amount : Money) return Money
  with Pre => Amount > 0.0 and Amount <= Account.Balance,
       Post => Withdraw'Result = Account.Balance'Old - Amount
is
begin
   Account.Balance := Account.Balance - Amount;
   return Account.Balance;
end Withdraw;
```

If a caller violates these contracts, the compiler raises an error—preventing
runtime failures.

#### 4.4.3.4 Type Invariants

Type invariants specify constraints on a type's state:

```ada
type Valid_Heart_Rate is Heart_Rate
  with Dynamic_Predicate => Valid_Heart_Rate in 30..250;
```

This ensures any variable of type `Valid_Heart_Rate` stays within
physiological ranges.

#### 4.4.3.5 Real-World Example: Medical Device System

In a medical device that monitors patient vital signs:

```ada
type Heart_Rate is range 20..250
  with Dynamic_Predicate => Heart_Rate in 30..250;

procedure Update_Heart_Rate(Rate : in Heart_Rate)
  with Pre => Rate in 30..250,
       Post => Current_Heart_Rate = Rate;
```

This ensures heart rate values stay within physiological limits and provides
formal verification of the update operation.

#### 4.4.3.6 Aspect vs. Pragma

Aspects are generally preferred over pragmas because:

- They are part of the language syntax
- They can be checked at compile time
- They integrate better with static analysis tools
- They are more readable and self-documenting

For example, this pragma:

```ada
pragma Assert(Speed <= Max_Speed);
```

Is better written as an aspect:

```ada
procedure Adjust_Speed(New_Speed : Float)
  with Pre => New_Speed <= Max_Speed;
```

The same modernisation applies to many older pragmas. What once required a
separate directive can now be expressed inline with the declaration:

```ada
procedure Old_Way;
pragma Inline(Old_Way);        -- pragma form

procedure New_Way
   with Inline;                 -- aspect form (Ada 2012+)
```

Using aspects keeps the metadata co-located with the declaration, which makes
reviews easier and reduces the chance that a pragma drifts away from the code
it is meant to influence.

Historically, many of these annotations began life as pragmas in Ada 83/95.
Ada 2012 standardised aspect syntax for the majority of common directives and
Ada 2022 continues that migration path. When you encounter legacy code that
still uses `pragma Inline` or `pragma Volatile`, you can usually translate it
directly into the corresponding aspect on the declaration.

> **Style Rule:** New code should prefer aspects over pragmas when both forms
> are available. Keep pragma form only when using pre-Ada 2012 toolchains or
> when the pragma has no aspect equivalent. For subprograms declared in bodies
> where aspect syntax is illegal, move the aspect to the declaration or keep
> the pragma.

#### 4.4.3.8 Pragma to Aspect Migration Guide

Table 4.5 shows the systematic mapping from legacy pragma forms to modern
aspect specifications, helping with code modernization efforts.

| Legacy Pragma Form | Modern Aspect Form | Notes |
| ------------------ | ------------------ | ----- |
| `pragma Inline(Subprogram)` | `procedure Subprogram with Inline` | Applies to subprogram declaration |
| `pragma Volatile(Object)` | `Object : Type with Volatile` | Applies to object declaration |
| `pragma Atomic(Object)` | `Object : Type with Atomic` | Ensures atomic access |
| `pragma Pack(Record_Type)` | `type Record_Type is ... with Pack` | Minimizes record storage |
| `pragma Pure(Package)` | `package Package with Pure` | No side effects allowed |
| `pragma Preelaborate(Package)` | `package Package with Preelaborate` | Elaboration optimization |
| `pragma Convention(C, Type)` | `type Type is ... with Convention => C` | Foreign language binding |

The aspect form provides better locality and is checked more thoroughly by
static analysis tools. When modernizing legacy code, prioritize high-visibility
declarations first (public interfaces, safety-critical components).

#### 4.4.3.9 Table 4.6: Common Aspect Specifications in Ada

| Aspect            | Purpose                  | Example Usage                                |
| ----------------- | ------------------------ | -------------------------------------------- |
| Pre               | Precondition             | `with Pre => B /= 0`                         |
| Post              | Postcondition            | `with Post => Result * B = A`                |
| Type_Invariant    | Type constraints         | `with Type_Invariant => X in 0..100`         |
| Dynamic_Predicate | Dynamic type constraints | `with Dynamic_Predicate => Value in 30..250` |
| Size              | Memory layout control    | `with Size => 32`                            |
| Inline            | Subprogram inlining      | `with Inline`                                |
| Volatile          | Prevents optimisation across external updates | `with Volatile`            |
| Atomic            | Guarantees atomic read/write | `with Atomic`                           |
| Address           | Places object at specific address | `with Address => System'To_Address(...)` |

#### 4.4.3.10 Real-World Example: Financial Transaction System

In a financial transaction system:

```ada
type Currency is delta 0.01 digits 15;

function Process_Transaction(Amount : Currency) return Boolean
  with Pre => Amount > 0.0,
       Post => Process_Transaction'Result = (Transaction_Amount = Amount);
```

This ensures transactions are always positive and provides formal verification
of the transaction process.

#### 4.4.3.11 The Future of Aspect Specifications

Ada continues to enhance aspect specifications in each standard. Ada 2022
added:

- Support for aspects on anonymous types
- Enhanced contract support in generic units
- New aspects for parallelism and concurrency

These enhancements make Ada's contract-based programming more powerful and
flexible.

### 4.4.4 Common Mistakes

- Relying on `pragma Suppress` for performance before proving the check is
   redundant. In most cases a tighter subtype or a memoised computation removes
   the hot path entirely.
- Leaving assertions (`pragma Assert`) disabled in qualification builds.
   Certification authorities often require evidence that checks were exercised;
   keep them enabled until late in the release cycle.
- Mixing pragma and aspect forms for the same concept. Pick one style—prefer
   aspects in new code—so reviewers do not have to hunt in multiple locations.
- Forgetting that comment blocks must be maintained with the code. A stale
   requirement description is worse than none; update or delete comments when
   behaviour changes.

### 4.4.5 Practice Drill

1. Convert an existing `pragma Inline` or `pragma Suppress` in your project to
   the equivalent aspect form and record whether the change improved local
   readability.
2. Draft a brief comment block that captures the *why* for a safety-critical
   validation step. Share it with a teammate and confirm they can restate the
   rationale without reading the code.
3. Identify a subprogram where you can add a `Pre` or `Post` aspect to encode
   an implicit assumption. Implement the aspect and run unit tests to confirm it
   holds.

## 4.5 Lexical Quick Reference

| Concept                | Key Rule                                                         | Example                                          |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| Identifiers            | Start with a letter; case-insensitive                            | `Temperature_Sensor`, `Current_Speed`            |
| Reserved Words         | 69 fixed keywords, always lowercase                              | `if`, `loop`, `pragma`, `parallel`               |
| Assignment             | Uses `:=` for updates, `=` for comparison                        | `Count := Count + 1;`                            |
| Comments               | Begin with `--` and extend to end of line                        | `-- Safety check before firing thruster`         |
| Numeric Literals       | Optional underscores for readability                             | `1_000_000`, `2#1010_1010#`                      |
| Enumeration            | Named literals in a fixed set                                    | `Heading : Direction := North;`                  |
| Delimiters             | Semicolon ends statements; square brackets form aggregates       | `Numbers : constant Int_Array := [1, 2, 3];`     |
| Quantified Expressions | `some`/`all` quantify over containers (Ada 2012)                 | `if (some R of Readings => R > Limit) then`      |
| Parallel Blocks        | `parallel` groups handled sequences (Ada 2022)                   | `parallel ... and ... end parallel;`             |
| Pragmas & Aspects      | Compiler directives and declarative metadata for contracts       | `pragma Restrictions(...)`, `procedure P with Inline;` |

## 4.6 Exercises

1. Identify the invalid identifiers in this list and explain why: `2nd_Place`,
   `end_loop`, `Altitude`, `range`, `Pressure_Sensor`.
2. Write the decimal number 42 as both a binary and hexadecimal based literal.
3. Add a `Pre` aspect to the following subprogram so that division by zero is
   prevented:

   ```ada
   function Divide (Numerator, Denominator : Integer) return Integer is
   begin
      return Numerator / Denominator;
   end Divide;
   ```

4. Given the pragma `pragma Suppress(Range_Check);`, outline one safer way to
   achieve the same performance goal without disabling range checks (e.g.
   narrower subtypes, prevalidated data, or a more efficient algorithm).

> "Ada's aspect specifications transform what would be runtime checks in other
> languages into compile-time verifications. This is the foundation of Ada's
> reliability in safety-critical systems."  
> — Senior Software Engineer, NASA Jet Propulsion Laboratory
