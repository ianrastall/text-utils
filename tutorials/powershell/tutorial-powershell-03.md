# 3. Introduction to Commands

Now that you have a properly configured PowerShell environment, it's time to start working with commands. PowerShell's command structure is fundamentally different from traditional shells, and understanding this foundation is critical for effective scripting.

This chapter provides a comprehensive introduction to PowerShell commands, covering:
- Basic command execution and structure
- The Verb-Noun naming convention and its importance
- Working with variables and basic data types
- Understanding and using aliases effectively
- The object-oriented nature of PowerShell commands
- Core discovery and help systems
- Practical command patterns for real-world scenarios

By the end of this chapter, you'll be comfortable executing basic PowerShell commands, understanding their structure, and beginning to build your own command sequences.

## 3.1 Your First Commands

The journey into PowerShell begins with executing your first commands. Unlike traditional shells that primarily deal with text, PowerShell works with structured objects, which fundamentally changes how you interact with the system.

### 3.1.1 Basic Command Structure

PowerShell commands follow a consistent structure that makes them predictable and easy to learn.

#### 3.1.1.1 Command Syntax

PowerShell commands typically follow this pattern:

```
<Command> -<Parameter> <Value> -<Parameter> <Value> | <Command> -<Parameter> <Value>
```

For example:

```powershell
Get-Process -Name powershell | Where-Object { $_.CPU -gt 100 }
```

Breaking this down:
- `Get-Process`: The command (cmdlet) being executed
- `-Name powershell`: A parameter and its value
- `|`: The pipeline operator, passing objects to the next command
- `Where-Object { $_.CPU -gt 100 }`: Another command with a script block parameter

#### 3.1.1.2 Command Types

PowerShell recognizes several types of commands:

| Type | Description | Example |
|------|-------------|---------|
| Cmdlets | Native PowerShell commands | `Get-Process` |
| Functions | PowerShell-defined commands | `Get-Command` |
| Scripts | `.ps1` files containing PowerShell code | `.\MyScript.ps1` |
| Executables | External programs | `ipconfig.exe` |
| Aliases | Shortcuts for other commands | `ls` (for `Get-ChildItem`) |

You can determine a command's type using:

```powershell
Get-Command Get-Process | Select-Object CommandType, Definition
```

#### 3.1.1.3 Command Discovery

PowerShell provides powerful tools for discovering commands:

```powershell
# Find all commands containing "process"
Get-Command *process*

# Find all Get-* commands
Get-Command -Verb Get

# Find all commands related to services
Get-Command -Noun Service
```

This discoverability is a key advantage of PowerShell's consistent naming convention.

### 3.1.2 Executing Your First Commands

Let's start with some basic commands to get familiar with PowerShell's interface.

#### 3.1.2.1 Basic Information Commands

```powershell
# Display current date and time
Get-Date

# List files and directories in current location
Get-ChildItem

# Show current location
Get-Location

# Display system information
Get-ComputerInfo
```

Each of these commands returns structured objects, not just text. To verify this:

```powershell
(Get-Date).GetType().FullName
# Returns: System.DateTime

(Get-ChildItem).GetType().FullName
# Returns: System.Object[] (array of FileInfo/DirectoryInfo objects)
```

#### 3.1.2.2 Command Parameters

Most commands accept parameters to modify their behavior:

```powershell
# Get processes with names starting with "pw"
Get-Process -Name pw*

# Get detailed information about PowerShell process
Get-Process -Id $PID -FileVersionInfo

# List files in C:\Windows with .exe extension
Get-ChildItem -Path C:\Windows -Filter *.exe
```

Parameters can often be specified positionally (without the parameter name):

```powershell
# Equivalent to Get-ChildItem -Path C:\Windows
Get-ChildItem C:\Windows
```

However, using named parameters is generally recommended for clarity, especially in scripts.

#### 3.1.2.3 Common Parameter Patterns

PowerShell commands follow consistent parameter naming conventions:

- `-Path` / `-LiteralPath`: File system paths
- `-Name`: Object names
- `-Id`: Numeric identifiers
- `-Filter`: Server-side filtering
- `-Include` / `-Exclude`: Client-side filtering
- `-Recurse`: Process subdirectories
- `-Force`: Override restrictions
- `-WhatIf`: Show what would happen without executing
- `-Confirm`: Prompt for confirmation

Understanding these patterns helps predict how commands will work.

### 3.1.3 Understanding Command Output

PowerShell's object-oriented nature means commands return structured data, not just text.

#### 3.1.3.1 Examining Command Output

Let's examine the output of a common command:

```powershell
$process = Get-Process -Name powershell -First 1
```

To see the properties available:

```powershell
$process | Get-Member
```

This shows all properties (data) and methods (actions) available on the object.

To view specific properties:

```powershell
$process | Format-List Id, Name, CPU, WorkingSet, Path
```

#### 3.1.3.2 Formatting Output

PowerShell provides several formatting commands:

```powershell
# Table format (default for many commands)
Get-Process | Format-Table -Property Name, Id, CPU

# List format (detailed properties)
Get-Process -Name powershell | Format-List

# Custom table format
Get-Process | Format-Table Name, Id, @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}}

# Wide format (for many properties)
Get-Process -Name powershell | Format-Wide Name
```

These formatting commands don't change the underlying objects—only how they're displayed.

#### 3.1.3.3 Working with Command Output

Since commands return objects, you can directly access their properties:

```powershell
# Get the ID of the PowerShell process
(Get-Process -Name powershell).Id

# Calculate total memory used by all processes
(Get-Process | Measure-Object WorkingSet -Sum).Sum

# Find the process with highest CPU usage
Get-Process | Sort-Object CPU -Descending | Select-Object -First 1
```

This object-based approach eliminates the need for text parsing required in traditional shells.

### 3.1.4 Command Execution Details

Understanding how PowerShell executes commands provides insight into its behavior.

#### 3.1.4.1 Command Resolution Order

When you enter a command, PowerShell searches for it in this order:

1. Alias
2. Function
3. Cmdlet
4. Script
5. Executable (in PATH)

You can see which command will execute using:

```powershell
Get-Command ls
```

On Windows, this typically shows `ls` is an alias for `Get-ChildItem`.

#### 3.1.4.2 Command Search Paths

PowerShell searches for commands in these locations:

```powershell
$env:PATH -split [System.IO.Path]::PathSeparator
```

Additionally, it searches module paths:

```powershell
$env:PSModulePath -split [System.IO.Path]::PathSeparator
```

#### 3.1.4.3 Command Caching

PowerShell caches command information for performance:

```powershell
# View command cache
$ExecutionContext.SessionState.InvokeCommand.CommandNotFoundAction

# Clear command cache
$ExecutionContext.SessionState.InvokeCommand.GetCommand("Get-Command", [System.Management.Automation.CommandTypes]::All, $null)
```

This is why you sometimes need to restart PowerShell after installing new modules.

### 3.1.5 Practical Command Exercises

Let's reinforce these concepts with hands-on exercises.

#### 3.1.5.1 Basic Command Practice

1. Display the current date and time
2. List all files in your Documents folder
3. Find your PowerShell process and display its memory usage
4. Calculate the total size of all .txt files in C:\Windows

Solutions:
```powershell
# 1
Get-Date

# 2
Get-ChildItem -Path $HOME\Documents

# 3
Get-Process -Id $PID | Select-Object Name, WorkingSet

# 4
(Get-ChildItem -Path C:\Windows -Filter *.txt | Measure-Object Length -Sum).Sum
```

#### 3.1.5.2 Command Discovery Challenge

Without using online resources, find commands to:
1. Get network adapter information
2. Restart a service
3. Create a new directory
4. Display event logs

Solutions:
```powershell
# 1
Get-Command *network*

# 2
Get-Command *service* | Where-Object Verb -eq Restart

# 3
Get-Command *item* | Where-Object Noun -eq Item

# 4
Get-Command *event*
```

#### 3.1.5.3 Output Formatting Challenge

Format process information to show:
- Name
- ID
- Memory usage in MB (calculated property)
- CPU usage (only if greater than 0)

Solution:
```powershell
Get-Process | Where-Object CPU -gt 0 | 
    Select-Object Name, Id, @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}} | 
    Format-Table -AutoSize
```

## 3.2 The Verb-Noun Naming Convention

One of PowerShell's most powerful features is its consistent Verb-Noun naming convention. This design principle makes commands predictable and discoverable.

### 3.2.1 Understanding the Convention

PowerShell commands follow a strict Verb-Noun pattern where:
- **Verb**: Describes the action being performed
- **Noun**: Specifies the thing being acted upon

This creates commands like:
- `Get-Process` (retrieve processes)
- `Stop-Service` (halt a service)
- `New-Item` (create a new item)

#### 3.2.1.1 Benefits of the Convention

The Verb-Noun pattern provides several advantages:

1. **Discoverability**: Knowing what you want to do helps find the command
2. **Consistency**: Similar operations use the same verbs
3. **Predictability**: Commands behave consistently across contexts
4. **Readability**: Commands form natural language statements
5. **Extensibility**: New commands fit into existing patterns

Consider the difference between:
```powershell
Get-Service -Name Spooler | Stop-Service
```
and traditional shell commands:
```bash
service cups stop
```

The PowerShell version clearly states "get the Spooler service and stop it," while the traditional command requires knowledge of the specific service management syntax.

#### 3.2.1.2 Standard Verb Groups

PowerShell defines standard verb groups to ensure consistency:

| Group | Verbs | Purpose |
|-------|-------|---------|
| Common | Get, Set, New, Remove, Invoke | Most frequently used operations |
| Communications | Connect, Disconnect, Send, Receive | Network and communication operations |
| Data | Backup, Restore, Update, Import, Export | Data management operations |
| Lifecycle | Install, Uninstall, Start, Stop, Restart | Service and application lifecycle |
| Security | Grant, Revoke, Test, Protect, Unblock | Security-related operations |

You can view all approved verbs:

```powershell
Get-Verb | Group-Object -Property Group | Select-Object Name, Count
```

### 3.2.2 Working with Verbs

Understanding verbs is key to discovering and using PowerShell commands effectively.

#### 3.2.2.1 Common Verb Patterns

Certain verbs appear frequently across different nouns:

| Verb | Meaning | Example Commands |
|------|---------|------------------|
| Get | Retrieve information | `Get-Process`, `Get-Service`, `Get-ChildItem` |
| Set | Configure or modify | `Set-Location`, `Set-ExecutionPolicy` |
| New | Create something | `New-Item`, `New-Object`, `New-PSSession` |
| Remove | Delete something | `Remove-Item`, `Remove-PSDrive` |
| Test | Verify a condition | `Test-Path`, `Test-Connection` |
| Start | Begin an operation | `Start-Service`, `Start-Process` |
| Stop | End an operation | `Stop-Service`, `Stop-Process` |
| Restart | Stop and start again | `Restart-Service`, `Restart-Computer` |
| Find | Search for something | `Find-Module`, `Find-Package` |
| Convert | Transform data | `ConvertTo-Json`, `ConvertFrom-Csv` |

#### 3.2.2.2 Finding Commands by Verb

The `Get-Command` cmdlet lets you search by verb:

```powershell
# Find all Get-* commands
Get-Command -Verb Get

# Find all commands with "Item" in the noun
Get-Command -Noun *Item*

# Find all commands related to services
Get-Command -Noun Service
```

This makes it easy to discover commands when you know what action you want to perform.

#### 3.2.2.3 Verb-Specific Behavior Patterns

Verbs often imply specific behaviors:

- **Get verbs**:
  - Typically retrieve information
  - Usually safe to run (no side effects)
  - Often return multiple objects

- **Set verbs**:
  - Modify system state
  - May require elevated privileges
  - Often have `-WhatIf` and `-Confirm` parameters

- **New verbs**:
  - Create new resources
  - May fail if resource already exists
  - Often return the created object

- **Remove verbs**:
  - Delete resources
  - Often have safety checks
  - May require confirmation

Understanding these patterns helps predict command behavior.

### 3.2.3 Working with Nouns

Nouns specify the target of the operation and follow their own patterns.

#### 3.2.3.1 Common Noun Patterns

PowerShell uses consistent nouns across different contexts:

| Noun | Meaning | Example Commands |
|------|---------|------------------|
| Process | Running program instances | `Get-Process`, `Stop-Process` |
| Service | Windows services | `Get-Service`, `Restart-Service` |
| Item | Generic file system object | `Get-Item`, `Remove-Item` |
| ChildItem | Items within a container | `Get-ChildItem`, `Copy-ChildItem` |
| Event | System events | `Get-Event`, `Write-Event` |
| Computer | Computer systems | `Test-Computer`, `Restart-Computer` |

#### 3.2.3.2 Noun Hierarchy and Consistency

PowerShell maintains consistency in noun usage:

- `Get-Item` works on any provider path (file system, registry, etc.)
- `Get-ChildItem` retrieves items within a container
- `Get-Content` gets the content of an item

This creates a logical hierarchy:
- `Item` → Single object
- `ChildItem` → Objects within a container
- `Content` → Data within an item

#### 3.2.3.3 Finding Commands by Noun

Use `Get-Command` to discover commands by noun:

```powershell
# Find all commands related to processes
Get-Command -Noun Process

# Find all commands related to files
Get-Command -Noun Item | Where-Object Name -match File

# Find all network-related commands
Get-Command | Where-Object Noun -match Network
```

This approach helps when you know what you want to work with but not the specific action.

### 3.2.4 Advanced Naming Convention Usage

The naming convention enables sophisticated command discovery and usage patterns.

#### 3.2.4.1 Command Prediction

Knowing the convention lets you predict commands:

| Task | Predicted Command | Actual Command |
|------|-------------------|----------------|
| Retrieve network adapters | `Get-NetworkAdapter` | `Get-NetAdapter` |
| Stop a process | `Stop-Process` | `Stop-Process` |
| Create a directory | `New-Directory` | `New-Item -ItemType Directory` |
| Test internet connection | `Test-Internet` | `Test-NetConnection` |

While not always exact, this prediction ability significantly reduces the need to memorize commands.

#### 3.2.4.2 Command Composition

The consistent naming enables natural command composition:

```powershell
# Get services, filter running ones, sort by name
Get-Service | Where-Object Status -eq Running | Sort-Object Name

# Find text files, get content, search for "error"
Get-ChildItem -Filter *.txt | Get-Content | Select-String "error"
```

This reads almost like natural language: "Get services, where status equals running, sort by name."

#### 3.2.4.3 Discovering Related Commands

When you find one useful command, related commands are easy to discover:

```powershell
# Found Get-Process is useful
# What other process commands exist?
Get-Command -Noun Process

# Found Get-ChildItem is useful
# What other item commands exist?
Get-Command -Noun Item
```

This creates a self-documenting ecosystem where learning one command leads to discovering others.

### 3.2.5 Verb and Noun Exceptions

While the convention is mostly consistent, some exceptions exist.

#### 3.2.5.1 Common Exceptions

- **Out verbs**: `Out-File`, `Out-GridView`, `Out-Host`
  - Handle output redirection
  - Don't follow standard verb patterns

- **Provider-specific commands**: `Push-Location`, `Pop-Location`
  - Work with the location stack
  - Special case for navigation

- **Legacy commands**: `dir`, `cd`, `cls`
  - Aliases for compatibility
  - Not following Verb-Noun pattern

- **.NET method calls**: `$process.Kill()`
  - Use .NET naming conventions
  - Not PowerShell cmdlets

#### 3.2.5.2 Handling Exceptions

When encountering exceptions:

1. Recognize they're often aliases for proper cmdlets:
   ```powershell
   Get-Alias dir
   # Returns: Get-ChildItem
   ```

2. Use `Get-Help` to understand behavior:
   ```powershell
   Get-Help Out-File
   ```

3. Prefer standard cmdlets over aliases in scripts:
   ```powershell
   # Better
   Get-ChildItem -Path C:\Windows
   
   # Avoid in scripts
   dir C:\Windows
   ```

#### 3.2.5.3 Creating Your Own Commands

When writing custom functions, follow the convention:

```powershell
# Good
function Get-UserInformation { ... }

# Bad
function UserInfo { ... }
```

This ensures your commands integrate seamlessly with PowerShell's ecosystem.

### 3.2.6 Practical Naming Convention Exercises

Apply your understanding of the naming convention with these exercises.

#### 3.2.6.1 Command Prediction Challenge

Predict the PowerShell command for each task, then verify:

1. Retrieve information about network adapters
2. Stop the Print Spooler service
3. Create a new directory called "Reports"
4. Test connectivity to google.com
5. Remove all .tmp files from C:\Temp

Solutions:
```powershell
# 1
Get-NetAdapter

# 2
Stop-Service -Name Spooler

# 3
New-Item -Path C:\Reports -ItemType Directory

# 4
Test-NetConnection -ComputerName google.com

# 5
Remove-Item -Path C:\Temp\*.tmp
```

#### 3.2.6.2 Command Discovery Challenge

Using only `Get-Command`, find commands to:

1. Get the current PowerShell version
2. List available modules
3. Start the Windows Update service
4. Find files containing "password"
5. Display system uptime

Solutions:
```powershell
# 1
Get-Command *version*

# 2
Get-Command *module*

# 3
Get-Command *service* | Where-Object Verb -eq Start

# 4
Get-Command *file* | Where-Object Noun -match Content

# 5
Get-Command *uptime*
```

#### 3.2.6.3 Command Composition Challenge

Create command sequences for:

1. Find the 5 largest .log files in C:\Windows, sorted by size
2. Get all running services, filter for "Network", display name and status
3. Test connection to 5 common websites (google.com, microsoft.com, etc.)
4. Get process information for PowerShell, display only name and memory usage in MB

Solutions:
```powershell
# 1
Get-ChildItem -Path C:\Windows -Filter *.log -Recurse -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object -First 5 Name, @{Name="SizeMB";Expression={($_.Length / 1MB)}}

# 2
Get-Service | Where-Object Status -eq Running | 
    Where-Object Name -match Network | 
    Format-Table Name, Status

# 3
"google.com", "microsoft.com", "github.com", "amazon.com", "apple.com" | 
    ForEach-Object { Test-NetConnection -ComputerName $_ -Count 1 }

# 4
Get-Process -Name powershell | 
    Select-Object Name, @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}}
```

## 3.3 Variables and Basic Data Types

Variables and data types form the foundation of PowerShell scripting. Understanding how to work with them is essential for effective automation.

### 3.3.1 Understanding PowerShell Variables

Variables in PowerShell store data that can be referenced and manipulated.

#### 3.3.1.1 Variable Syntax

PowerShell variables follow this syntax:

```powershell
$VariableName = Value
```

Key characteristics:
- All variables begin with `$`
- Case-insensitive (`$Name` and `$name` refer to the same variable)
- No declaration needed (variables are created when assigned)
- Scope determines visibility (covered in later chapters)

Example:
```powershell
$Name = "John Doe"
$Age = 30
$IsAdmin = $true
```

#### 3.3.1.2 Variable Naming Rules

Variable names can contain:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscores (_)

They cannot:
- Start with a number
- Contain spaces or special characters (except underscore)
- Be reserved words (like `if`, `function`, etc.)

Special characters can be used with braces:
```powershell
${My Variable} = "Value with space"
${123Number} = 456
```

But this is generally discouraged for readability.

#### 3.3.1.3 Variable Types

PowerShell is loosely typed, but variables have underlying .NET types:

```powershell
$Name = "John"          # System.String
$Age = 30               # System.Int32
$Price = 19.99          # System.Double
$IsAdmin = $true        # System.Boolean
$Date = Get-Date        # System.DateTime
$Process = Get-Process  # System.Diagnostics.Process[]
```

You can explicitly cast types:
```powershell
[string]$Name = "John"
[int]$Age = "30"  # Converts string to integer
```

### 3.3.2 Basic Data Types

PowerShell supports various data types inherited from .NET.

#### 3.3.2.1 String Types

Strings store text data:

```powershell
$name = "John Doe"
$greeting = 'Hello, World!'
$path = "C:\Windows"  # Note: Backslashes don't need escaping in double quotes
```

**String features:**
- Single quotes: Literal strings (no variable expansion)
- Double quotes: Expand variables (`"Hello, $name"`)
- Here-strings: Multi-line strings
  ```powershell
  $text = @"
  This is a
  multi-line
  string.
  "@
  ```
- Format operator: `-f`
  ```powershell
  "Name: {0}, Age: {1}" -f $name, $age
  ```

#### 3.3.2.2 Numeric Types

PowerShell supports various numeric types:

```powershell
$int = 42                # System.Int32
$long = 123456789012     # System.Int64
$float = 3.14            # System.Double
$decimal = [decimal]10.99 # System.Decimal
$hex = 0xFF              # Hexadecimal (255)
$binary = 0b1010         # Binary (10)
```

**Numeric operations:**
```powershell
$sum = 10 + 5            # Addition
$product = 10 * 5        # Multiplication
$power = 2 ** 8          # Exponentiation (256)
```

#### 3.3.2.3 Boolean Types

Booleans represent true/false values:

```powershell
$isAdmin = $true
$hasAccess = $false
```

**Boolean operations:**
```powershell
$both = $isAdmin -and $hasAccess
$either = $isAdmin -or $hasAccess
$notAdmin = -not $isAdmin
```

#### 3.3.2.4 DateTime Types

DateTime handles dates and times:

```powershell
$now = Get-Date
$specific = [datetime]"2023-10-15"
$format = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
```

**DateTime operations:**
```powershell
$tomorrow = (Get-Date).AddDays(1)
$duration = New-TimeSpan -Start $start -End $end
```

#### 3.3.2.5 Null Values

`$null` represents the absence of a value:

```powershell
$empty = $null
if ($empty -eq $null) { ... }
```

**Null handling:**
```powershell
# Null-coalescing operator (PowerShell 7+)
$value = $input ?? "default"

# Null-conditional operator (PowerShell 7+)
$length = $text?.Length
```

### 3.3.3 Working with Variables

Understanding variable operations is essential for scripting.

#### 3.3.3.1 Variable Assignment

Basic assignment:
```powershell
$name = "John"
$age = 30
```

Multiple assignment:
```powershell
$a, $b, $c = 1, 2, 3
```

Assignment from command output:
```powershell
$processes = Get-Process
$currentTime = Get-Date
```

#### 3.3.3.2 Variable Scopes

PowerShell has several scope levels:

| Scope | Description | Example |
|-------|-------------|---------|
| Global | Available to all sessions | `$global:var = "global"` |
| Script | Available throughout script | `$script:var = "script"` |
| Local | Current scope and child scopes | `$local:var = "local"` |
| Private | Not visible to child scopes | `$private:var = "private"` |

Scope resolution order:
1. Local
2. Script
3. Global

Example:
```powershell
$global:company = "Contoso"

function Test-Scopes {
    $script:department = "IT"
    $local:role = "Admin"
    $private:secret = "TopSecret"
    
    Write-Host "Global: $global:company"
    Write-Host "Script: $script:department"
    Write-Host "Local: $local:role"
    Write-Host "Private: $private:secret"  # Will be empty
}
```

#### 3.3.3.3 Variable Inspection

Examine variables with:

```powershell
# View all variables
Get-Variable

# View specific variable
Get-Variable name

# View variable properties
(Get-Variable name).Value
(Get-Variable name).TypeNameOfValue

# View variable scope
(Get-Variable name).Scope
```

#### 3.3.3.4 Variable Manipulation

Common variable operations:

```powershell
# Increment
$count = 0
$count++

# String concatenation
$greeting = "Hello" + ", " + $name

# Array operations
$items = @("apple", "banana", "cherry")
$items += "date"  # Add item

# Hash table operations
$person = @{Name="John"; Age=30}
$person.City = "New York"
```

### 3.3.4 Special Automatic Variables

PowerShell provides several automatic variables that contain system information.

#### 3.3.4.1 Common Automatic Variables

| Variable | Description | Example Usage |
|----------|-------------|---------------|
| `$_` or `$PSItem` | Current object in pipeline | `Get-Process | Where-Object { $_.CPU -gt 100 }` |
| `$Args` | Arguments passed to function | `function Test { $args }` |
| `$Error` | Array of error objects | `$Error[0]` |
| `$Home` | User's home directory | `cd $Home` |
| `$PID` | Process ID of PowerShell | `Get-Process -Id $PID` |
| `$PSVersionTable` | PowerShell version info | `$PSVersionTable.PSVersion` |
| `$True`/`$False` | Boolean values | `if ($true) { ... }` |
| `$Null` | Null value | `if ($var -eq $null) { ... }` |
| `$MyInvocation` | Information about current command | `$MyInvocation.MyCommand` |

#### 3.3.4.2 Provider-Related Variables

| Variable | Description |
|----------|-------------|
| `$PWD` | Current working directory |
| `$HOME` | User's home directory |
| `$ExecutionContext` | Current execution context |
| `$Host` | Host application information |

#### 3.3.4.3 Error-Related Variables

| Variable | Description |
|----------|-------------|
| `$Error` | Array of error objects (most recent first) |
| `$ErrorActionPreference` | Default error action (Continue, Stop, SilentlyContinue, Inquire) |
| `$WarningPreference` | Default warning action |
| `$DebugPreference` | Default debug message action |
| `$VerbosePreference` | Default verbose message action |

### 3.3.5 Practical Variable Exercises

Apply your variable knowledge with these exercises.

#### 3.3.5.1 Basic Variable Practice

1. Create variables for your name, age, and whether you're an administrator
2. Calculate your birth year based on current year and age
3. Create a greeting message combining your name and age
4. Determine if you're eligible to vote (age >= 18)

Solutions:
```powershell
# 1
$name = "John Doe"
$age = 30
$isAdmin = $true

# 2
$birthYear = (Get-Date).Year - $age

# 3
$greeting = "Hello, $name! You are $age years old."

# 4
$canVote = $age -ge 18
```

#### 3.3.5.2 Type Conversion Challenge

1. Convert a string "123" to an integer and add 1
2. Convert a number 3.14159 to a string with 2 decimal places
3. Convert a string "true" to a boolean
4. Convert current date to a specific format "yyyy-MM-dd"

Solutions:
```powershell
# 1
$result = [int]"123" + 1

# 2
$formatted = "{0:N2}" -f 3.14159

# 3
$bool = [bool]::Parse("true")

# 4
$dateStr = Get-Date -Format "yyyy-MM-dd"
```

#### 3.3.5.3 Variable Scope Challenge

Create a script that demonstrates variable scope with:
1. A global variable
2. A script-scoped variable
3. A function that accesses these variables
4. A private variable that's not visible outside its scope

Solution:
```powershell
# Global variable
$global:company = "Contoso"

# Script-scoped variable
$script:department = "IT"

function Test-Scopes {
    # Local variable
    $local:role = "Administrator"
    
    # Private variable
    $private:secret = "TopSecret"
    
    Write-Host "Global company: $global:company"
    Write-Host "Script department: $script:department"
    Write-Host "Local role: $local:role"
    
    # Try to access private variable from parent scope
    $parentSecret = $private:secret
    Write-Host "Private secret (should be empty): '$parentSecret'"
}

# Execute the function
Test-Scopes

# Try to access function's private variable
Write-Host "Function's private variable: '$private:secret'"
```

## 3.4 Aliases

Aliases provide shorthand names for commands, improving typing efficiency but potentially reducing script readability.

### 3.4.1 Understanding Aliases

Aliases are alternative names for commands that make interactive use more efficient.

#### 3.4.1.1 What Are Aliases?

An alias is a shortcut name for a command:

```powershell
# ls is an alias for Get-ChildItem
ls

# cd is an alias for Set-Location
cd C:\Windows
```

#### 3.4.1.2 Purpose of Aliases

Aliases serve two main purposes:
1. **Interactive efficiency**: Faster typing during interactive sessions
2. **Familiarity**: Providing familiar names for users coming from other shells

#### 3.4.1.3 Alias Types

PowerShell has several types of aliases:

| Type | Description | Example |
|------|-------------|---------|
| Built-in | Provided by PowerShell | `ls`, `cd`, `dir` |
| Module-defined | Provided by modules | `gcm` (from Microsoft.PowerShell.Management) |
| User-defined | Created by users | `np` for Notepad |

### 3.4.2 Working with Aliases

PowerShell provides commands specifically for managing aliases.

#### 3.4.2.1 Listing Aliases

```powershell
# List all aliases
Get-Alias

# List aliases for a specific command
Get-Alias -Definition Get-ChildItem

# List aliases starting with "g"
Get-Alias g*
```

#### 3.4.2.2 Understanding Alias Information

Each alias has several properties:

```powershell
Get-Alias ls | Format-List *
```

Key properties:
- `Name`: The alias itself (e.g., "ls")
- `Definition`: The command it maps to (e.g., "Get-ChildItem")
- `Options`: Alias options (ReadOnly, Constant, etc.)
- `ResolvedCommand`: The actual command object

#### 3.4.2.3 Creating Aliases

```powershell
# Create temporary alias
Set-Alias np notepad.exe

# Create permanent alias (add to profile)
"Set-Alias np notepad.exe" | Add-Content $PROFILE
```

#### 3.4.2.4 Removing Aliases

```powershell
# Remove temporary alias
Remove-Alias np

# Remove from profile (edit profile file)
```

### 3.4.3 Common Aliases

PowerShell includes numerous built-in aliases.

#### 3.4.3.1 File System Aliases

| Alias | Command | Purpose |
|-------|---------|---------|
| `cd` | `Set-Location` | Change directory |
| `ls` or `dir` | `Get-ChildItem` | List directory contents |
| `pwd` | `Get-Location` | Show current directory |
| `cat` or `type` | `Get-Content` | Display file contents |
| `echo` | `Write-Output` | Display text |
| `clear` or `cls` | `Clear-Host` | Clear console |

#### 3.4.3.2 Pipeline Aliases

| Alias | Command | Purpose |
|-------|---------|---------|
| `%` | `ForEach-Object` | Process each object |
| `?` | `Where-Object` | Filter objects |
| `sort` | `Sort-Object` | Sort objects |
| `select` | `Select-Object` | Select properties |
| `measure` | `Measure-Object` | Calculate statistics |

#### 3.4.3.3 General Utility Aliases

| Alias | Command | Purpose |
|-------|---------|---------|
| `gal` | `Get-Alias` | List aliases |
| `gcm` | `Get-Command` | List commands |
| `gci` | `Get-ChildItem` | List directory contents |
| `gsv` | `Get-Service` | List services |
| `gps` | `Get-Process` | List processes |
| `kill` | `Stop-Process` | Stop processes |

### 3.4.4 Aliases vs. Best Practices

While convenient, aliases present some challenges for script development.

#### 3.4.4.1 When to Use Aliases

**Appropriate for:**
- Interactive command-line use
- Quick one-liners
- Personal scripts not shared with others
- Situations where brevity is critical

**Inappropriate for:**
- Production scripts
- Shared code
- Learning materials
- Situations requiring clarity

#### 3.4.4.2 Alias Readability Issues

Consider these examples:

```powershell
# Using aliases (less clear)
gps | ? { $_.CPU -gt 100 } | stop

# Using full cmdlets (more clear)
Get-Process | Where-Object { $_.CPU -gt 100 } | Stop-Process
```

The second example is more readable for those unfamiliar with the aliases.

#### 3.4.4.3 Scripting Best Practices

1. **Avoid aliases in production scripts**
   ```powershell
   # Bad
   gci C:\Windows | ? { $_.Length -gt 1MB }
   
   # Good
   Get-ChildItem -Path C:\Windows | Where-Object { $_.Length -gt 1MB }
   ```

2. **Use full parameter names**
   ```powershell
   # Bad
   Get-Process -N powershell
   
   # Good
   Get-Process -Name powershell
   ```

3. **Document custom aliases**
   ```powershell
   # If you must use custom aliases, document them
   Set-Alias np notepad.exe  # Open Notepad
   ```

### 3.4.5 Advanced Alias Management

For power users, PowerShell offers advanced alias management capabilities.

#### 3.4.5.1 Creating Persistent Aliases

Add to your profile for permanent aliases:

```powershell
# Add to $PROFILE
Set-Alias np notepad.exe
Set-Alias ff 'C:\Program Files\Mozilla Firefox\firefox.exe'
```

#### 3.4.5.2 Parameterized Aliases

Create functions instead of aliases for parameterized commands:

```powershell
# Better than alias with parameters
function Open-Firefox {
    param(
        [string]$Url = "https://www.google.com"
    )
    Start-Process firefox.exe -ArgumentList $Url
}
```

#### 3.4.5.3 Alias Export and Import

Export aliases to share with others:

```powershell
# Export aliases to CSV
Get-Alias | Select-Object Name, Definition | Export-Csv -Path aliases.csv

# Import aliases from CSV
Import-Csv -Path aliases.csv | ForEach-Object {
    Set-Alias -Name $_.Name -Value $_.Definition -Scope Global
}
```

#### 3.4.5.4 Alias Conflict Resolution

When aliases conflict:

```powershell
# Check if command is an alias
Get-Command ls

# Use full command name to bypass alias
Microsoft.PowerShell.Management\Get-ChildItem

# Remove problematic alias
Remove-Alias ls
```

### 3.4.6 Practical Alias Exercises

Apply your alias knowledge with these exercises.

#### 3.4.6.1 Alias Discovery Challenge

1. Find all aliases for `Get-Command`
2. Determine what `gsv` stands for
3. Find the command behind the `cat` alias
4. List all aliases starting with "g"

Solutions:
```powershell
# 1
Get-Alias -Definition Get-Command

# 2
Get-Alias gsv

# 3
Get-Alias cat

# 4
Get-Alias g*
```

#### 3.4.6.2 Alias Usage Challenge

1. Use aliases to list all .exe files in C:\Windows
2. Use aliases to stop the Spooler service
3. Use aliases to display the first 5 processes sorted by CPU
4. Use aliases to find your PowerShell process

Solutions:
```powershell
# 1
ls C:\Windows -Filter *.exe

# 2
gsv spooler | stop-service

# 3
gps | sort cpu -desc | select -first 5

# 4
gps | ? { $_.ProcessName -eq 'powershell' }
```

#### 3.4.6.3 Alias Best Practices Challenge

Convert these alias-based commands to full cmdlet versions:

1. `ls | ? { $_.PSIsContainer }`
2. `gps | sort ws -desc | select -first 3`
3. `cat .\log.txt | ? { $_ -match 'error' }`
4. `gcm *item* | select name,definition`

Solutions:
```powershell
# 1
Get-ChildItem | Where-Object { $_.PSIsContainer }

# 2
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 3

# 3
Get-Content -Path .\log.txt | Where-Object { $_ -match 'error' }

# 4
Get-Command -Noun *Item* | Select-Object Name, Definition
```

## 3.5 Thinking in Objects

PowerShell's object-oriented nature is its most powerful feature, but also the most challenging for those coming from text-based shells.

### 3.5.1 Understanding PowerShell Objects

Unlike traditional shells that pass text between commands, PowerShell passes structured objects.

#### 3.5.1.1 What Are Objects?

An object is a structured piece of data with:
- **Properties**: Data fields (e.g., `.Name`, `.Id`, `.StartTime`)
- **Methods**: Actions that can be performed (e.g., `.Kill()`, `.Refresh()`)

Example object structure:
```
Process (System.Diagnostics.Process)
├── Properties
│   ├── Id: 1234
│   ├── Name: "powershell"
│   ├── CPU: 87.2
│   ├── WorkingSet: 123456789
│   └── Path: "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
└── Methods
    ├── Kill()
    ├── Refresh()
    ├── Start()
    └── WaitForExit()
```

#### 3.5.1.2 Creating Objects

PowerShell creates objects automatically:

```powershell
# Get-Process returns Process objects
$processes = Get-Process

# Get-Date returns DateTime objects
$date = Get-Date

# New-Object creates custom objects
$person = New-Object PSObject -Property @{
    Name = "John"
    Age = 30
    City = "New York"
}
```

#### 3.5.1.3 Viewing Object Structure

Use `Get-Member` to inspect objects:

```powershell
Get-Process | Get-Member

# Output:
#    TypeName: System.Diagnostics.Process
#
# Name                       MemberType     Definition
# ----                       ----------     ----------
# Kill                       Method         void Kill()
# Refresh                    Method         void Refresh()
# ...
# Id                         Property       int Id {get;}
# MachineName                Property       string MachineName {get;}
# MainModule                 Property       System.Diagnostics.ProcessModule MainModule {get;}
```

### 3.5.2 Working with Object Properties

Object properties contain the data you typically want to work with.

#### 3.5.2.1 Accessing Properties

```powershell
# Get a single property
(Get-Process -Name powershell).Id

# Get multiple properties
Get-Process -Name powershell | Select-Object Id, Name, CPU

# Access in pipeline
Get-Process | Where-Object { $_.CPU -gt 100 }
```

#### 3.5.2.2 Calculated Properties

Create custom properties on the fly:

```powershell
Get-Process | Select-Object Name, Id, @{
    Name = "MemoryMB"
    Expression = { [math]::Round($_.WorkingSet / 1MB) }
}
```

#### 3.5.2.3 Property Expansion

Simplify access to nested properties:

```powershell
# Without expansion
Get-Process | Select-Object @{Name="Company";Expression={$_.MainModule.FileName}}

# With property expansion
Get-Process | Select-Object Name, Id, "MainModule.Company"
```

### 3.5.3 Working with Object Methods

Methods allow you to perform actions on objects.

#### 3.5.3.1 Common Methods

```powershell
# Stop a process
$process = Get-Process -Name notepad -First 1
$process.Kill()

# Refresh process information
$process.Refresh()

# Convert to JSON
Get-Process | ConvertTo-Json

# Format as table
Get-Process | Format-Table Name, Id
```

#### 3.5.3.2 Method Parameters

Some methods accept parameters:

```powershell
# Start a process with arguments
$process = New-Object System.Diagnostics.Process
$process.StartInfo.FileName = "notepad.exe"
$process.StartInfo.Arguments = "document.txt"
$process.Start()
```

#### 3.5.3.3 .NET Methods

PowerShell objects often expose .NET methods:

```powershell
# String methods
"Hello World".ToUpper()
"Hello World".Split(" ")

# DateTime methods
(Get-Date).AddDays(7)
(Get-Date).ToString("yyyy-MM-dd")
```

### 3.5.4 Object Transformation in the Pipeline

The pipeline is where PowerShell's object orientation shines.

#### 3.5.4.1 Pipeline Mechanics

```powershell
Get-Process | Where-Object { $_.CPU -gt 100 } | Stop-Process
```

1. `Get-Process` emits Process objects
2. `Where-Object` filters them based on CPU property
3. `Stop-Process` receives filtered objects and calls `.Kill()` on each

#### 3.5.4.2 Object Streaming

PowerShell processes objects one at a time:

```powershell
# Only 100 lines in memory at any time
Get-Content largefile.log -ReadCount 100 | ForEach-Object {
    $_ | Where-Object { $_ -match "ERROR" }
}
```

#### 3.5.4.3 Pipeline Variable

`$_` or `$PSItem` represents the current object in the pipeline:

```powershell
Get-Process | ForEach-Object {
    "Process: $($_.Name), ID: $($_.Id)"
}
```

### 3.5.5 Object vs. Text Processing Comparison

Understanding the difference between object-based and text-based processing is crucial.

#### 3.5.5.1 Text-Based Processing (Traditional Shells)

```bash
ps aux | grep chrome | awk '{print $2}' | xargs kill
```

Issues:
- Fragile to format changes
- Column position assumptions
- Locale-sensitive formatting
- Requires multiple text processing tools
- Hard to extend

#### 3.5.5.2 Object-Based Processing (PowerShell)

```powershell
Get-Process -Name chrome | Stop-Process
```

Advantages:
- No parsing required
- Direct property access
- Type-safe operations
- Consistent behavior across systems
- Easier to extend and modify

#### 3.5.5.3 Real-World Example: Process Memory Analysis

**Bash approach:**
```bash
ps -eo rss,comm --sort=-rss | head -n 6 | tail -n 5 | awk '{ printf "%s (%d MB)\n", $2, $1/1024 }'
```

**PowerShell approach:**
```powershell
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 `
    Name, @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}}
```

PowerShell's version is:
- More readable
- Less fragile
- Type-safe (no unit conversion errors)
- Easier to modify
- More maintainable

### 3.5.6 Practical Object Exercises

Apply your object knowledge with these exercises.

#### 3.5.6.1 Object Inspection Challenge

1. Get your PowerShell process and inspect its properties
2. Find the company name associated with the process
3. Determine the main module file path
4. Calculate memory usage in MB

Solutions:
```powershell
# 1
$process = Get-Process -Id $PID
$process | Get-Member

# 2
$process.MainModule.FileName

# 3
$process.MainModule.FileName

# 4
[math]::Round($process.WorkingSet / 1MB)
```

#### 3.5.6.2 Object Transformation Challenge

1. Get all processes, sort by memory usage, show top 5
2. Format the output to show Name, ID, and Memory in MB
3. Filter for processes using more than 100MB of memory
4. Stop any process named "notepad" using more than 50MB

Solutions:
```powershell
# 1 & 2
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 `
    Name, Id, @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}}

# 3
Get-Process | Where-Object { $_.WorkingSet -gt 100MB }

# 4
Get-Process -Name notepad | Where-Object { $_.WorkingSet -gt 50MB } | Stop-Process -Force
```

#### 3.5.6.3 Object Method Challenge

1. Create a DateTime object for today
2. Add 7 days to it
3. Format it as "dddd, MMMM dd, yyyy"
4. Get the day of the week as a number (1-7)

Solutions:
```powershell
# 1
$date = Get-Date

# 2
$nextWeek = $date.AddDays(7)

# 3
$nextWeek.ToString("dddd, MMMM dd, yyyy")

# 4
[System.Globalization.CultureInfo]::InvariantCulture.Calendar.GetDayOfWeek($nextWeek).value + 1
```

## 3.6 Summary

In this comprehensive chapter, you've learned about PowerShell commands through:
- Executing your first commands with detailed understanding of structure and output
- Mastering the Verb-Noun naming convention and its power for command discovery
- Working with variables and basic data types essential for scripting
- Understanding aliases and when to use them appropriately
- Embracing PowerShell's object-oriented nature for robust automation

You now have a solid foundation in PowerShell's command structure, enabling you to:
- Discover and use commands effectively
- Understand and predict command behavior
- Work with variables and data types
- Write readable, maintainable scripts
- Process data using PowerShell's object pipeline

This knowledge forms the basis for more advanced scripting and automation tasks covered in subsequent chapters.

## 3.7 Next Steps Preview: Chapter 4 – Filtering Objects with Where-Object

In the next chapter, we'll dive deeper into one of PowerShell's most powerful features: filtering objects. You'll learn:
- How `Where-Object` works under the hood
- Different filtering techniques and operators
- Performance considerations for large datasets
- Advanced filtering patterns with script blocks
- Combining filters for complex conditions
- Real-world examples of filtering in administration tasks
- Common pitfalls and how to avoid them

You'll gain the ability to efficiently filter and process data, a critical skill for effective PowerShell scripting and automation.

