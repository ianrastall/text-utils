# 8. Working with Hashtables and Custom Objects

Hashtables and custom objects are fundamental data structures in PowerShell that enable you to create rich, structured data representations. While cmdlets like `Where-Object`, `Select-Object`, `Sort-Object`, and `Group-Object` work with existing objects, hashtables and custom objects allow you to create your own structured data from scratch. This chapter provides a comprehensive guide to working with these essential PowerShell data structures, covering both fundamental concepts and advanced techniques.

This chapter covers:
- The fundamental principles of hashtables and custom objects in PowerShell
- Detailed syntax and usage patterns for creating and manipulating hashtables
- Techniques for creating custom objects with various methods
- Converting between hashtables, custom objects, and other data structures
- Using hashtables for configuration and parameter splatting
- Advanced techniques for object manipulation and transformation
- Performance considerations for large data structures
- Real-world scenarios across different domains
- Common mistakes and how to avoid them
- Troubleshooting techniques for complex data structures
- Practical exercises to reinforce learning

By the end of this chapter, you'll be able to create sophisticated data structures that enhance your PowerShell scripts' flexibility, readability, and maintainability. This knowledge is essential for building advanced automation solutions and working with complex data.

## 8.1 Understanding Hashtables and Custom Objects in PowerShell

Hashtables and custom objects are complementary data structures that serve different but related purposes in PowerShell.

### 8.1.1 The Importance of Hashtables and Custom Objects

These data structures serve several critical purposes in PowerShell:

1. **Data organization**: Structuring related information in a logical way
2. **Configuration management**: Storing settings and parameters in a structured format
3. **Parameter splatting**: Passing multiple parameters to cmdlets in a clean, readable way
4. **Data transformation**: Converting between different data representations
5. **State management**: Tracking and maintaining application or script state
6. **API interaction**: Working with JSON and other structured data formats
7. **Report generation**: Creating structured output for documentation and presentation

Consider this real-world example: storing system information.

**Without structured data**:
```powershell
$systemName = "Server01"
$osVersion = "Windows Server 2022"
$cpuCount = 8
$memoryGB = 32
```

This approach has limitations:
- Variables are disconnected and unrelated
- No inherent structure or organization
- Difficult to pass as a single unit
- Hard to extend or modify

**With structured data**:
```powershell
$systemInfo = [PSCustomObject]@{
    Name = "Server01"
    OSVersion = "Windows Server 2022"
    CPUCount = 8
    MemoryGB = 32
}
```

This approach:
- Groups related information together
- Maintains logical relationships between properties
- Can be passed as a single object
- Easily extended with additional properties
- Works seamlessly with PowerShell's object pipeline

### 8.1.2 Hashtables vs. Custom Objects

While hashtables and custom objects are related, they serve different purposes:

#### 8.1.2.1 Hashtables

- **Key-value pairs**: Store data as name-value pairs
- **Mutable**: Properties can be added, modified, or removed after creation
- **Ordered**: PowerShell 6+ maintains insertion order
- **Not objects**: Don't have methods or object identity
- **Syntax**: Created with `@{}`

#### 8.1.2.2 Custom Objects

- **Structured data**: Represent a single entity with multiple properties
- **Immutable**: Properties can't be added/removed after creation (though values can change)
- **Object identity**: Behave like any other PowerShell object
- **Methods**: Can have methods added (though rarely used)
- **Syntax**: Created with `[PSCustomObject]@{}` or `New-Object`

#### 8.1.2.3 When to Use Each

| Scenario | Hashtable | Custom Object |
|----------|-----------|---------------|
| Configuration data | ✓ | |
| Parameter splatting | ✓ | |
| Temporary data storage | ✓ | |
| Data to be converted to JSON | ✓ | ✓ |
| Pipeline input | | ✓ |
| Reporting and display | | ✓ |
| Object-oriented programming | | ✓ |

### 8.1.3 PowerShell's Object-Based Approach

PowerShell's object pipeline works seamlessly with both hashtables and custom objects:

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Data Sources    │────▶│ Hashtables &       │────▶│ Pipeline         │────▶│ Structured   │
│ (APIs, Files,  │     │ Custom Objects     │     │ Processing       │     │ Output       │
│ Cmdlets, etc.) │     │ (Data Structures)  │     │ (Cmdlets)        │     │              │
└─────────────────┘     └────────────────────┘     └──────────────────┘     └──────────────┘
```

Key advantages:
- **Consistency**: Same approach works across different data sources
- **Flexibility**: Convert between formats as needed
- **Integration**: Works with all PowerShell cmdlets and features
- **Type awareness**: Maintains data types through transformations

This object-oriented approach enables sophisticated data manipulation patterns that would be extremely difficult with text-based tools.

## 8.2 Introduction to Hashtables

Hashtables (also known as dictionaries or associative arrays) are key-value pair collections that provide efficient data storage and retrieval.

### 8.2.1 Basic Hashtable Syntax

#### 8.2.1.1 Creating Hashtables

```powershell
# Empty hashtable
$empty = @{}

# Hashtable with initial values
$person = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Alternative syntax (less common)
$person = New-Object System.Collections.Hashtable
$person["Name"] = "John Doe"
$person["Age"] = 30
```

#### 8.2.1.2 Accessing Hashtable Values

```powershell
# Dot notation (PowerShell 3.0+)
$person.Name  # Returns "John Doe"

# Bracket notation
$person["Name"]  # Returns "John Doe"
$person["Age"]  # Returns 30

# Variable key access
$key = "City"
$person[$key]  # Returns "New York"
```

#### 8.2.1.3 Adding and Modifying Values

```powershell
# Add new key-value pair
$person["Email"] = "john.doe@example.com"

# Modify existing value
$person["Age"] = 31

# Using dot notation (PowerShell 3.0+)
$person.Country = "USA"
```

#### 8.2.1.4 Removing Values

```powershell
# Remove key-value pair
$person.Remove("Country")

# Alternative syntax
$null = $person.Remove("Country")
```

### 8.2.2 Hashtable Properties and Methods

#### 8.2.2.1 Common Properties

```powershell
$person = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

$person.Count  # Returns 3
$person.Keys   # Returns "Name", "Age", "City"
$person.Values # Returns "John Doe", 30, "New York"
```

#### 8.2.2.2 Common Methods

```powershell
# Check if key exists
$person.ContainsKey("Name")  # Returns $true
$person.ContainsValue("New York")  # Returns $true

# Clear all entries
$person.Clear()

# Copy hashtable
$personCopy = $person.Clone()
```

#### 8.2.2.3 Iterating Through Hashtables

```powershell
# Using ForEach-Object
$person | ForEach-Object { 
    "Key: $($_.Key), Value: $($_.Value)" 
}

# Using foreach statement
foreach ($entry in $person.GetEnumerator()) {
    "Key: $($entry.Key), Value: $($entry.Value)"
}

# Using keys
foreach ($key in $person.Keys) {
    "Key: $key, Value: $($person[$key])"
}
```

### 8.2.3 Hashtable Best Practices

#### 8.2.3.1 Key Naming Conventions

- Use meaningful, descriptive names
- Be consistent with casing (PascalCase is common)
- Avoid spaces in keys (use camelCase or PascalCase instead)
- Consider using constants for frequently used keys

```powershell
# Good
$config = @{
    MaxRetries = 5
    TimeoutSeconds = 30
    LogFilePath = "C:\Logs\app.log"
}

# Avoid
$config = @{
    "max retries" = 5
    "timeout (seconds)" = 30
    "log file path" = "C:\Logs\app.log"
}
```

#### 8.2.3.2 Performance Considerations

- Hashtables provide O(1) lookup time (very fast)
- Creating large hashtables can be memory-intensive
- For very large datasets, consider alternative approaches

#### 8.2.3.3 Error Handling

```powershell
# Check if key exists before accessing
if ($person.ContainsKey("Email")) {
    $email = $person["Email"]
} else {
    $email = $null
}

# Using try/catch
try {
    $email = $person["Email"]
} catch {
    $email = $null
}

# Using null-coalescing (PowerShell 7+)
$email = $person["Email"] ?? $null
```

### 8.2.4 Hashtables vs. Other Collections

#### 8.2.4.1 Hashtables vs. Arrays

| Feature | Hashtable | Array |
|---------|-----------|-------|
| Access | By key (name) | By numeric index |
| Order | Maintained in PowerShell 6+ | Maintained |
| Lookup | O(1) - constant time | O(n) - linear time |
| Use case | Named properties | Ordered list of items |

#### 8.2.4.2 Hashtables vs. OrderedDictionary

```powershell
# Hashtable (order maintained in PowerShell 6+)
$hash = @{A=1; B=2; C=3}

# OrderedDictionary (explicit ordered dictionary)
$ordered = [System.Collections.Specialized.OrderedDictionary]::new()
$ordered.Add("A", 1)
$ordered.Add("B", 2)
$ordered.Add("C", 3)
```

OrderedDictionary:
- Explicitly designed for maintaining order
- Available in all PowerShell versions
- Slightly more verbose syntax
- Necessary for pre-PowerShell 6 compatibility

## 8.3 Basic Hashtable Operations

Understanding basic hashtable operations is essential before moving to more advanced scenarios.

### 8.3.1 Creating Hashtables

#### 8.3.1.1 Simple Hashtables

```powershell
# Empty hashtable
$empty = @{}

# Single-line hashtable
$colors = @{Red=0xFF0000; Green=0x00FF00; Blue=0x0000FF}

# Multi-line hashtable (more readable)
$person = @{
    FirstName = "John"
    LastName = "Doe"
    Age = 30
    City = "New York"
}
```

#### 8.3.1.2 Hashtables with Expressions

```powershell
# Hashtables with expressions
$system = @{
    Name = $env:COMPUTERNAME
    OS = (Get-CimInstance Win32_OperatingSystem).Caption
    Uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    Processes = (Get-Process).Count
}
```

#### 8.3.1.3 Hashtables from Objects

```powershell
# Convert object properties to hashtable
$process = Get-Process -Id $PID
$processHash = @{}
$process.PSObject.Properties | ForEach-Object {
    $processHash[$_.Name] = $_.Value
}

# Using ConvertTo-Hashtable (PowerShell 7+)
$process | ConvertTo-Hashtable
```

### 8.3.2 Accessing and Modifying Hashtables

#### 8.3.2.1 Basic Access

```powershell
$person = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Dot notation (PowerShell 3.0+)
$person.Name  # "John Doe"
$person.Age   # 30

# Bracket notation
$person["Name"]  # "John Doe"
$person["Age"]   # 30

# Variable key
$key = "City"
$person[$key]  # "New York"
```

#### 8.3.2.2 Adding and Modifying Values

```powershell
# Add new key-value pair
$person["Email"] = "john.doe@example.com"

# Modify existing value
$person["Age"] = 31

# Using dot notation (PowerShell 3.0+)
$person.Country = "USA"

# Using Set_Item method
$person.Set_Item("Phone", "555-1234")
```

#### 8.3.2.3 Removing Values

```powershell
# Remove key-value pair
$person.Remove("Country")

# Alternative syntax
$null = $person.Remove("Phone")

# Using bracket notation with $null
$person["Email"] = $null
```

### 8.3.3 Working with Hashtable Properties

#### 8.3.3.1 Counting Entries

```powershell
$person = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

$person.Count  # Returns 3
```

#### 8.3.3.2 Getting Keys and Values

```powershell
# Get all keys
$person.Keys  # Returns "Name", "Age", "City"

# Get all values
$person.Values  # Returns "John Doe", 30, "New York"

# Convert to arrays
$keysArray = @($person.Keys)
$valuesArray = @($person.Values)
```

#### 8.3.3.3 Checking for Keys and Values

```powershell
# Check if key exists
$person.ContainsKey("Name")  # Returns $true
$person.ContainsKey("Email")  # Returns $false

# Check if value exists
$person.ContainsValue("New York")  # Returns $true
$person.ContainsValue("London")  # Returns $false
```

### 8.3.4 Iterating Through Hashtables

#### 8.3.4.1 Using ForEach-Object

```powershell
$person = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

$person | ForEach-Object {
    "Key: $($_.Key), Value: $($_.Value)"
}
```

#### 8.3.4.2 Using foreach Statement

```powershell
# Using GetEnumerator()
foreach ($entry in $person.GetEnumerator()) {
    "Key: $($entry.Key), Value: $($entry.Value)"
}

# Using Keys collection
foreach ($key in $person.Keys) {
    "Key: $key, Value: $($person[$key])"
}
```

#### 8.3.4.3 Practical Iteration Examples

```powershell
# Display system environment variables
$envHash = @{}
Get-ChildItem env: | ForEach-Object {
    $envHash[$_.Name] = $_.Value
}

$envHash.GetEnumerator() | Sort-Object Key | ForEach-Object {
    "{0} = {1}" -f $_.Key, $_.Value
}

# Convert registry values to hashtable
$key = "HKLM:\Software\Microsoft\Windows\CurrentVersion"
$registryHash = @{}
Get-ItemProperty $key | Get-Member -MemberType NoteProperty | ForEach-Object {
    $registryHash[$_.Name] = (Get-ItemProperty $key).($_.Name)
}

$registryHash.GetEnumerator() | Format-Table -AutoSize
```

## 8.4 Advanced Hashtable Techniques

Beyond basic operations, hashtables support sophisticated patterns for data manipulation.

### 8.4.1 Nested Hashtables

#### 8.4.1.1 Basic Nested Hashtables

```powershell
# Simple nested hashtable
$config = @{
    Database = @{
        Server = "db01.example.com"
        Port = 1433
        Timeout = 30
    }
    Logging = @{
        Level = "Info"
        Path = "C:\Logs\app.log"
        RetentionDays = 7
    }
}

# Access nested values
$config.Database.Server  # "db01.example.com"
$config["Logging"]["Level"]  # "Info"
```

#### 8.4.1.2 Creating Nested Hashtables Dynamically

```powershell
# Build nested hashtable dynamically
$config = @{}
$config["Database"] = @{}
$config.Database["Server"] = "db01.example.com"
$config.Database["Port"] = 1433

# Alternative approach
$config = @{}
$config.Add("Database", @{})
$config.Database.Add("Server", "db01.example.com")
```

#### 8.4.1.3 Practical Nested Hashtable Examples

```powershell
# System configuration
$systemConfig = @{
    Network = @{
        Hostname = $env:COMPUTERNAME
        IPAddresses = (Get-NetIPAddress | Where-Object AddressFamily -eq "IPv4").IPAddress
        DNS = (Get-DnsClientServerAddress | Where-Object AddressFamily -eq "IPv4").ServerAddresses
    }
    Storage = @{
        Disks = Get-PhysicalDisk | ForEach-Object {
            @{
                Model = $_.Model
                SizeGB = [math]::Round($_.Size / 1GB)
                Health = $_.HealthStatus
            }
        }
        Volumes = Get-Volume | ForEach-Object {
            @{
                DriveLetter = $_.DriveLetter
                FileSystem = $_.FileSystem
                SizeGB = [math]::Round($_.Size / 1GB)
            }
        }
    }
}

# Accessing nested data
$systemConfig.Network.IPAddresses
$systemConfig.Storage.Disks[0].Model
```

### 8.4.2 Hashtables with Calculated Values

#### 8.4.2.1 Basic Calculated Values

```powershell
# Simple calculated values
$process = Get-Process -Id $PID
$processInfo = @{
    Name = $process.Name
    Id = $process.Id
    CPU = $process.CPU
    MemoryMB = $process.WorkingSet / 1MB
    StartTime = $process.StartTime.ToString("yyyy-MM-dd HH:mm:ss")
}
```

#### 8.4.2.2 Complex Calculated Values

```powershell
# More complex calculations
$disk = Get-PSDrive C
$diskInfo = @{
    Drive = $disk.Name
    UsedGB = [math]::Round(($disk.Used / 1GB), 2)
    FreeGB = [math]::Round(($disk.Free / 1GB), 2)
    TotalGB = [math]::Round(($disk.Used + $disk.Free) / 1GB, 2)
    PercentFree = [math]::Round(($disk.Free / ($disk.Used + $disk.Free)) * 100, 1)
    Status = if ($diskInfo.PercentFree -lt 10) { "Critical" } 
             elseif ($diskInfo.PercentFree -lt 20) { "Warning" } 
             else { "OK" }
}
```

#### 8.4.2.3 Practical Calculated Value Examples

```powershell
# Process resource summary
$process = Get-Process -Id $PID
$processSummary = @{
    Name = $process.Name
    Id = $process.Id
    CPU = "{0:N2}%" -f $process.CPU
    Memory = "{0:N2} MB" -f ($process.WorkingSet / 1MB)
    Uptime = "{0:D2}d {1:D2}h {2:D2}m" -f 
        ((Get-Date) - $process.StartTime).Days,
        ((Get-Date) - $process.StartTime).Hours,
        ((Get-Date) - $process.StartTime).Minutes
    Owner = try {
        $processSI = (Get-WmiObject Win32_Process -Filter "ProcessId = $($process.Id)").GetOwner()
        "$($processSI.Domain)\$($processSI.User)"
    } catch {
        "Unknown"
    }
}

# Service health check
$services = Get-Service | Where-Object StartType -eq "Automatic"
$serviceHealth = @{
    Total = $services.Count
    Running = ($services | Where-Object Status -eq "Running").Count
    Stopped = ($services | Where-Object Status -eq "Stopped").Count
    HealthPercent = [math]::Round(($serviceHealth.Running / $serviceHealth.Total) * 100, 1)
    Status = if ($serviceHealth.HealthPercent -eq 100) { "Healthy" }
             elseif ($serviceHealth.HealthPercent -ge 90) { "Warning" }
             else { "Critical" }
}
```

### 8.4.3 Converting Between Data Structures

#### 8.4.3.1 Hashtables to Objects

```powershell
# Convert hashtable to custom object
$personHash = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}
$personObj = [PSCustomObject]$personHash

# Alternative approach
$personObj = New-Object PSObject -Property $personHash
```

#### 8.4.3.2 Objects to Hashtables

```powershell
# Convert object to hashtable
$process = Get-Process -Id $PID
$processHash = @{}
$process.PSObject.Properties | ForEach-Object {
    $processHash[$_.Name] = $_.Value
}

# Using ConvertTo-Hashtable (PowerShell 7+)
$process | ConvertTo-Hashtable
```

#### 8.4.3.3 JSON Conversion

```powershell
# Convert hashtable to JSON
$config = @{
    Server = "api.example.com"
    Port = 8080
    Timeout = 30
}
$json = $config | ConvertTo-Json

# Convert JSON to hashtable
$recoveredConfig = $json | ConvertFrom-Json | ConvertTo-Hashtable
```

#### 8.4.3.4 Practical Conversion Examples

```powershell
# Convert registry to nested hashtable
function Get-RegistryHashtable {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    $result = @{}
    $key = Get-Item -Path $Path -ErrorAction SilentlyContinue
    if (-not $key) { return $result }
    
    # Add values
    $key.Property | ForEach-Object {
        $result[$_] = $key.GetValue($_)
    }
    
    # Add subkeys recursively
    $key.GetSubKeyNames() | ForEach-Object {
        $subkeyPath = Join-Path $Path $_
        $result[$_] = Get-RegistryHashtable -Path $subkeyPath
    }
    
    return $result
}

# Usage
$registryConfig = Get-RegistryHashtable -Path "HKLM:\Software\Microsoft\Windows"
$registryConfig | ConvertTo-Json | Out-File registry.json

# Convert CSV to nested hashtable
$csvData = Import-Csv .\data.csv
$groupedData = $csvData | Group-Object Category | ForEach-Object {
    $category = $_.Name
    $items = @{}
    $_.Group | ForEach-Object {
        $items[$_.Name] = @{
            Value = $_.Value
            Description = $_.Description
        }
    }
    @{ $category = $items }
}

$groupedData | ConvertTo-Json | Out-File grouped.json
```

### 8.4.4 Hashtables for Configuration

#### 8.4.4.1 Basic Configuration Pattern

```powershell
# Configuration pattern
$config = @{
    # Database settings
    Database = @{
        Server = "db01.example.com"
        Port = 1433
        DatabaseName = "AppDB"
        Username = "appuser"
        Password = "securepassword"
    }
    
    # Logging settings
    Logging = @{
        Level = "Info"
        Path = "C:\Logs\app.log"
        RetentionDays = 7
    }
    
    # API settings
    API = @{
        BaseUrl = "https://api.example.com/v1"
        Timeout = 30
        MaxRetries = 3
    }
}

# Using configuration
function Connect-Database {
    param(
        $Config = $script:config.Database
    )
    "Connecting to $($Config.Server):$($Config.Port)..."
}

Connect-Database
```

#### 8.4.4.2 Environment-Specific Configuration

```powershell
# Environment-specific configuration
$environments = @{
    Development = @{
        Database = @{
            Server = "dev-db.example.com"
            Port = 1433
        }
        Logging = @{
            Level = "Debug"
            Path = "C:\Logs\dev\app.log"
        }
    }
    Staging = @{
        Database = @{
            Server = "stage-db.example.com"
            Port = 1433
        }
        Logging = @{
            Level = "Info"
            Path = "C:\Logs\stage\app.log"
        }
    }
    Production = @{
        Database = @{
            Server = "prod-db.example.com"
            Port = 1433
        }
        Logging = @{
            Level = "Warning"
            Path = "C:\Logs\prod\app.log"
        }
    }
}

# Select environment
$envName = "Production"
$config = $environments[$envName]

# Use configuration
"Using database: $($config.Database.Server)"
"Logging level: $($config.Logging.Level)"
```

#### 8.4.4.3 Practical Configuration Examples

```powershell
# Application configuration manager
class ConfigManager {
    hidden [hashtable]$config
    
    ConfigManager([hashtable]$initialConfig) {
        $this.config = $initialConfig
    }
    
    [object]Get($path) {
        $parts = $path -split '\.'
        $current = $this.config
        
        foreach ($part in $parts) {
            if ($current -is [hashtable] -and $current.Contains($part)) {
                $current = $current[$part]
            } else {
                return $null
            }
        }
        
        return $current
    }
    
    [void]Set($path, $value) {
        $parts = $path -split '\.'
        $current = $this.config
        
        for ($i = 0; $i -lt $parts.Count - 1; $i++) {
            $part = $parts[$i]
            if (-not $current.Contains($part)) {
                $current[$part] = @{}
            }
            $current = $current[$part]
        }
        
        $current[$parts[-1]] = $value
    }
}

# Usage
$configData = @{
    App = @{
        Name = "MyApp"
        Version = "1.0.0"
    }
    Database = @{
        Server = "localhost"
        Port = 1433
    }
}

$config = [ConfigManager]::new($configData)
$config.Get("Database.Server")  # "localhost"
$config.Set("Database.Server", "prod-db.example.com")
$config.Get("Database.Server")  # "prod-db.example.com"
```

## 8.5 Introduction to Custom Objects

Custom objects allow you to create structured data representations that work seamlessly with PowerShell's object pipeline.

### 8.5.1 Basic Custom Object Syntax

#### 8.5.1.1 Creating Custom Objects

```powershell
# Using [PSCustomObject]
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Using New-Object (older approach)
$person = New-Object PSObject -Property @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Using Add-Member
$person = New-Object PSObject
$person | Add-Member -MemberType NoteProperty -Name Name -Value "John Doe"
$person | Add-Member -MemberType NoteProperty -Name Age -Value 30
$person | Add-Member -MemberType NoteProperty -Name City -Value "New York"
```

#### 8.5.1.2 Accessing Custom Object Properties

```powershell
# Dot notation
$person.Name  # Returns "John Doe"
$person.Age   # Returns 30
$person.City  # Returns "New York"
```

#### 8.5.1.3 Adding Properties to Existing Objects

```powershell
# Using Add-Member
$person | Add-Member -MemberType NoteProperty -Name Email -Value "john.doe@example.com"

# Using dot notation assignment (PowerShell 3.0+)
$person.Country = "USA"

# Using calculated properties
$person | Add-Member -MemberType ScriptProperty -Name IsAdult -Value {
    $this.Age -ge 18
}
```

### 8.5.2 Custom Object Properties

#### 8.5.2.1 Note Properties

```powershell
# Adding note properties
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
}

# Add property using Add-Member
$person | Add-Member -MemberType NoteProperty -Name City -Value "New York"

# Add property using dot notation (PowerShell 3.0+)
$person.Country = "USA"
```

#### 8.5.2.2 Script Properties

```powershell
# Adding script properties
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
    Age = 30
}

# Full name as script property
$person | Add-Member -MemberType ScriptProperty -Name FullName -Value {
    "$($this.FirstName) $($this.LastName)"
}

# Age category as script property
$person | Add-Member -MemberType ScriptProperty -Name AgeCategory -Value {
    if ($this.Age -lt 18) { "Minor" }
    elseif ($this.Age -lt 65) { "Adult" }
    else { "Senior" }
}
```

#### 8.5.2.3 Script Methods

```powershell
# Adding script methods
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
}

# Greeting method
$person | Add-Member -MemberType ScriptMethod -Name Greet -Value {
    param($greeting = "Hello")
    "$greeting, $($this.FirstName)!"
}

# Usage
$person.Greet()  # "Hello, John!"
$person.Greet("Welcome")  # "Welcome, John!"
```

### 8.5.3 Custom Object Best Practices

#### 8.5.3.1 Property Naming Conventions

- Use PascalCase for property names
- Be consistent with naming patterns
- Use meaningful, descriptive names
- Avoid abbreviations unless they're standard

```powershell
# Good
$system = [PSCustomObject]@{
    ComputerName = "Server01"
    OperatingSystem = "Windows Server 2022"
    TotalMemoryGB = 32
    ProcessorCount = 8
}

# Avoid
$system = [PSCustomObject]@{
    compName = "Server01"
    os = "Windows Server 2022"
    mem = 32
    proc = 8
}
```

#### 8.5.3.2 Type Consistency

- Ensure consistent data types for the same property across objects
- Consider using type constraints where appropriate
- Document expected types in comments

```powershell
# Consistent types
$users = @(
    [PSCustomObject]@{
        Name = "John Doe"
        Age = 30
        IsActive = $true
    },
    [PSCustomObject]@{
        Name = "Jane Smith"
        Age = 28
        IsActive = $false
    }
)

# Avoid inconsistent types
$badUsers = @(
    [PSCustomObject]@{
        Name = "John Doe"
        Age = "30"  # String instead of int
        IsActive = $true
    },
    [PSCustomObject]@{
        Name = "Jane Smith"
        Age = 28
        IsActive = "No"  # String instead of bool
    }
)
```

#### 8.5.3.3 Object Identity

- Understand that custom objects are reference types
- Be careful when modifying objects in collections
- Use `.Clone()` or recreate objects when needed

```powershell
# Object reference behavior
$obj1 = [PSCustomObject]@{Value = 10}
$obj2 = $obj1
$obj2.Value = 20
$obj1.Value  # Returns 20 (same object)

# Creating independent copies
$obj1 = [PSCustomObject]@{Value = 10}
$obj2 = $obj1.PSObject.Copy()
$obj2.Value = 20
$obj1.Value  # Returns 10 (different objects)
```

### 8.5.4 Custom Objects vs. Other Approaches

#### 8.5.4.1 Custom Objects vs. Hashtables

| Feature | Custom Object | Hashtable |
|---------|---------------|-----------|
| Pipeline | Works in pipeline | Doesn't work well in pipeline |
| Display | Formatted for display | Shows as hashtable |
| Properties | Fixed after creation | Can add/remove properties |
| Methods | Can have methods | No methods |
| Type | Has type identity | Always [hashtable] |

#### 8.5.4.2 PSCustomObject vs. New-Object

```powershell
# PSCustomObject (preferred)
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
}

# New-Object (older approach)
$person = New-Object PSObject -Property @{
    Name = "John Doe"
    Age = 30
}
```

`[PSCustomObject]` is preferred because:
- More concise syntax
- Better performance
- Maintains property order (PowerShell 3.0+)
- More readable code

## 8.6 Basic Custom Object Operations

Understanding basic custom object operations is essential before moving to more advanced scenarios.

### 8.6.1 Creating Custom Objects

#### 8.6.1.1 Simple Custom Objects

```powershell
# Using [PSCustomObject]
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Using New-Object
$person = New-Object PSObject -Property @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Using Add-Member
$person = New-Object PSObject
$person | Add-Member -MemberType NoteProperty -Name Name -Value "John Doe"
$person | Add-Member -MemberType NoteProperty -Name Age -Value 30
$person | Add-Member -MemberType NoteProperty -Name City -Value "New York"
```

#### 8.6.1.2 Custom Objects with Expressions

```powershell
# Custom object with expressions
$process = Get-Process -Id $PID
$processInfo = [PSCustomObject]@{
    Name = $process.Name
    Id = $process.Id
    CPU = $process.CPU
    MemoryMB = $process.WorkingSet / 1MB
    StartTime = $process.StartTime.ToString("yyyy-MM-dd HH:mm:ss")
}
```

#### 8.6.1.3 Collections of Custom Objects

```powershell
# Array of custom objects
$people = @(
    [PSCustomObject]@{
        Name = "John Doe"
        Age = 30
        City = "New York"
    },
    [PSCustomObject]@{
        Name = "Jane Smith"
        Age = 28
        City = "Boston"
    },
    [PSCustomObject]@{
        Name = "Bob Johnson"
        Age = 45
        City = "Chicago"
    }
)

# Building array dynamically
$people = @()
"John,30,New York", "Jane,28,Boston", "Bob,45,Chicago" -split "`n" | ForEach-Object {
    $parts = $_ -split ","
    $people += [PSCustomObject]@{
        Name = $parts[0]
        Age = [int]$parts[1]
        City = $parts[2]
    }
}
```

### 8.6.2 Working with Custom Object Properties

#### 8.6.2.1 Accessing Properties

```powershell
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Dot notation
$person.Name  # "John Doe"
$person.Age   # 30
$person.City  # "New York"
```

#### 8.6.2.2 Adding Properties

```powershell
# Using Add-Member
$person | Add-Member -MemberType NoteProperty -Name Email -Value "john.doe@example.com"

# Using dot notation assignment (PowerShell 3.0+)
$person.Country = "USA"

# Adding multiple properties
$additionalProps = @{
    Phone = "555-1234"
    Occupation = "Developer"
}
$additionalProps.GetEnumerator() | ForEach-Object {
    $person | Add-Member -MemberType NoteProperty -Name $_.Key -Value $_.Value
}
```

#### 8.6.2.3 Removing Properties

```powershell
# Removing properties (requires creating a new object)
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
    City = "New York"
}

# Create new object without City property
$personNoCity = $person | Select-Object Name, Age
```

### 8.6.3 Converting Between Data Structures

#### 8.6.3.1 Hashtables to Custom Objects

```powershell
# Convert hashtable to custom object
$personHash = @{
    Name = "John Doe"
    Age = 30
    City = "New York"
}
$personObj = [PSCustomObject]$personHash

# Alternative approach
$personObj = New-Object PSObject -Property $personHash
```

#### 8.6.3.2 Custom Objects to Hashtables

```powershell
# Convert custom object to hashtable
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
    City = "New York"
}
$personHash = @{}
$person.PSObject.Properties | ForEach-Object {
    $personHash[$_.Name] = $_.Value
}
```

#### 8.6.3.3 JSON Conversion

```powershell
# Convert custom object to JSON
$person = [PSCustomObject]@{
    Name = "John Doe"
    Age = 30
    City = "New York"
}
$json = $person | ConvertTo-Json

# Convert JSON to custom object
$recoveredPerson = $json | ConvertFrom-Json
```

#### 8.6.3.4 Practical Conversion Examples

```powershell
# Convert registry values to custom objects
$registryPath = "HKLM:\Software\Microsoft\Windows\CurrentVersion"
$registryValues = Get-ItemProperty $registryPath

$registryObjects = $registryValues | Get-Member -MemberType NoteProperty | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Name
        Value = $registryValues.($_.Name)
        Type = $_.TypeName
    }
}

$registryObjects | Format-Table -AutoSize

# Convert CSV to custom objects with calculated properties
$csvData = Import-Csv .\products.csv

$productObjects = $csvData | ForEach-Object {
    [PSCustomObject]@{
        ProductID = $_.ProductID
        Name = $_.Name
        Price = [decimal]$_.Price
        Quantity = [int]$_.Quantity
        TotalValue = [decimal]$_.Price * [int]$_.Quantity
        Status = if ([int]$_.Quantity -eq 0) { "Out of Stock" }
                 elseif ([int]$_.Quantity -lt 10) { "Low Stock" }
                 else { "In Stock" }
    }
}

$productObjects | Format-Table -AutoSize
```

### 8.6.4 Custom Object Methods

#### 8.6.4.1 Script Methods

```powershell
# Adding script methods
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
}

# Greeting method
$person | Add-Member -MemberType ScriptMethod -Name Greet -Value {
    param($greeting = "Hello")
    "$greeting, $($this.FirstName)!"
}

# Full name method
$person | Add-Member -MemberType ScriptMethod -Name GetFullName -Value {
    "$($this.FirstName) $($this.LastName)"
}

# Usage
$person.Greet()  # "Hello, John!"
$person.Greet("Welcome")  # "Welcome, John!"
$person.GetFullName()  # "John Doe"
```

#### 8.6.4.2 Advanced Method Examples

```powershell
# Process object with methods
$process = Get-Process -Id $PID | Select-Object -Property Name, Id, CPU, WorkingSet

# Add memory formatting method
$process | Add-Member -MemberType ScriptMethod -Name FormatMemory -Value {
    $mb = $this.WorkingSet / 1MB
    if ($mb -gt 1024) { "{0:N2} GB" -f ($mb / 1024) }
    else { "{0:N2} MB" -f $mb }
}

# Add CPU usage category method
$process | Add-Member -MemberType ScriptMethod -Name GetCPUCategory -Value {
    if ($this.CPU -gt 75) { "High" }
    elseif ($this.CPU -gt 50) { "Medium-High" }
    elseif ($this.CPU -gt 25) { "Medium" }
    else { "Low" }
}

# Usage
$process.FormatMemory()  # "100.50 MB"
$process.GetCPUCategory()  # "Low"
```

#### 8.6.4.3 Practical Method Examples

```powershell
# File object with methods
$file = Get-ChildItem $PROFILE

# Add age calculation method
$file | Add-Member -MemberType ScriptMethod -Name GetAge -Value {
    $days = (Get-Date) - $this.LastWriteTime
    "{0} days, {1} hours" -f $days.Days, $days.Hours
}

# Add size formatting method
$file | Add-Member -MemberType ScriptMethod -Name FormatSize -Value {
    $bytes = $this.Length
    if ($bytes -gt 1TB) { "{0:N2} TB" -f ($bytes / 1TB) }
    elseif ($bytes -gt 1GB) { "{0:N2} GB" -f ($bytes / 1GB) }
    elseif ($bytes -gt 1MB) { "{0:N2} MB" -f ($bytes / 1MB) }
    elseif ($bytes -gt 1KB) { "{0:N2} KB" -f ($bytes / 1KB) }
    else { "$bytes bytes" }
}

# Usage
$file.GetAge()  # "5 days, 12 hours"
$file.FormatSize()  # "3.25 KB"

# Service object with methods
$service = Get-Service -Name WinRM

# Add status description method
$service | Add-Member -MemberType ScriptMethod -Name GetStatusDescription -Value {
    switch ($this.Status) {
        "Running" { "Service is operational" }
        "Stopped" { "Service is not running" }
        "Paused" { "Service is paused" }
        default { "Service status: $($this.Status)" }
    }
}

# Add startup type description method
$service | Add-Member -MemberType ScriptMethod -Name GetStartupDescription -Value {
    switch ($this.StartType) {
        "Automatic" { "Starts automatically with system" }
        "Manual" { "Starts manually when needed" }
        "Disabled" { "Service is disabled" }
        default { "Startup type: $($this.StartType)" }
    }
}

# Usage
$service.GetStatusDescription()  # "Service is operational"
$service.GetStartupDescription()  # "Starts automatically with system"
```

## 8.7 Advanced Custom Object Techniques

Beyond basic operations, custom objects support sophisticated patterns for data representation.

### 8.7.1 Custom Object Inheritance

#### 8.7.1.1 Basic Object Inheritance

```powershell
# Base object
$basePerson = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
}

# Inherited object
$employee = $basePerson | Add-Member -PassThru NoteProperty EmployeeID "EMP123" -Force
$employee | Add-Member -PassThru NoteProperty Department "IT" -Force

# Verify inheritance
$employee.FirstName  # "John"
$employee.LastName   # "Doe"
$employee.EmployeeID # "EMP123"
$employee.Department # "IT"
```

#### 8.7.1.2 Prototype-Based Inheritance

```powershell
# Create prototype
$personPrototype = {
    param($firstName, $lastName)
    
    $obj = [PSCustomObject]@{
        FirstName = $firstName
        LastName = $lastName
    }
    
    $obj | Add-Member -MemberType ScriptMethod -Name Greet -Value {
        "Hello, $($this.FirstName)!"
    }
    
    return $obj
}

# Create instances
$john = & $personPrototype "John" "Doe"
$jane = & $personPrototype "Jane" "Smith"

# Verify
$john.Greet()  # "Hello, John!"
$jane.Greet()  # "Hello, Jane!"
```

#### 8.7.1.3 Practical Inheritance Examples

```powershell
# System asset hierarchy
function New-Asset {
    param(
        [string]$Name,
        [string]$Location
    )
    
    [PSCustomObject]@{
        Name = $Name
        Location = $Location
        AssetType = "Generic"
    }
}

function New-Computer {
    param(
        [string]$Name,
        [string]$Location,
        [string]$OS
    )
    
    $computer = New-Asset @PSBoundParameters
    $computer | Add-Member -MemberType NoteProperty -Name OS -Value $OS -PassThru |
        Add-Member -MemberType NoteProperty -Name AssetType -Value "Computer" -PassThru |
        Add-Member -MemberType ScriptMethod -Name GetUptime -Value {
            (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
        } -PassThru
}

function New-NetworkDevice {
    param(
        [string]$Name,
        [string]$Location,
        [string]$IPAddress
    )
    
    $device = New-Asset @PSBoundParameters
    $device | Add-Member -MemberType NoteProperty -Name IPAddress -Value $IPAddress -PassThru |
        Add-Member -MemberType NoteProperty -Name AssetType -Value "NetworkDevice" -PassThru |
        Add-Member -MemberType ScriptMethod -Name TestConnectivity -Value {
            Test-Connection -TargetName $this.IPAddress -Count 1 -Quiet
        } -PassThru
}

# Usage
$server = New-Computer -Name "SRV01" -Location "Datacenter A" -OS "Windows Server 2022"
$router = New-NetworkDevice -Name "RT01" -Location "Datacenter A" -IPAddress "192.168.1.1"

$server | Format-List *
$router | Format-List *
```

### 8.7.2 Custom Object Validation

#### 8.7.2.1 Basic Validation

```powershell
# Validate object properties
function Test-Person {
    param(
        [Parameter(Mandatory=$true)]
        $Person
    )
    
    $valid = $true
    
    if (-not $Person.FirstName) {
        Write-Warning "FirstName is required"
        $valid = $false
    }
    
    if (-not $Person.LastName) {
        Write-Warning "LastName is required"
        $valid = $false
    }
    
    if ($Person.Age -lt 0) {
        Write-Warning "Age must be non-negative"
        $valid = $false
    }
    
    return $valid
}

# Usage
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
    Age = 30
}
Test-Person $person  # Returns $true
```

#### 8.7.2.2 Advanced Validation with Classes (PowerShell 5.0+)

```powershell
# Using PowerShell classes for validation
class Person {
    [string]$FirstName
    [string]$LastName
    [int]$Age
    
    Person([string]$firstName, [string]$lastName, [int]$age) {
        $this.FirstName = $firstName
        $this.LastName = $lastName
        $this.SetAge($age)
    }
    
    [void]SetAge([int]$age) {
        if ($age -lt 0) {
            throw "Age must be non-negative"
        }
        $this.Age = $age
    }
    
    [string]GetFullName() {
        return "$($this.FirstName) $($this.LastName)"
    }
}

# Usage
try {
    $person = [Person]::new("John", "Doe", 30)
    $person.GetFullName()  # "John Doe"
    
    $invalidPerson = [Person]::new("Jane", "Smith", -5)  # Throws exception
} catch {
    Write-Error "Failed to create person: $_"
}
```

#### 8.7.2.3 Practical Validation Examples

```powershell
# Configuration validator
function Test-Config {
    param(
        [Parameter(Mandatory=$true)]
        $Config
    )
    
    $errors = @()
    
    # Database section
    if (-not $Config.Database) {
        $errors += "Database section is missing"
    } else {
        if (-not $Config.Database.Server) {
            $errors += "Database.Server is required"
        }
        if (-not $Config.Database.Port -or $Config.Database.Port -le 0) {
            $errors += "Database.Port must be a positive number"
        }
    }
    
    # Logging section
    if (-not $Config.Logging) {
        $errors += "Logging section is missing"
    } else {
        if ($Config.Logging.Level -notin "Debug", "Info", "Warning", "Error") {
            $errors += "Logging.Level must be Debug, Info, Warning, or Error"
        }
    }
    
    if ($errors.Count -eq 0) {
        return $true
    } else {
        $errors | ForEach-Object { Write-Error $_ }
        return $false
    }
}

# Usage
$config = @{
    Database = @{
        Server = "db01.example.com"
        Port = 1433
    }
    Logging = @{
        Level = "Info"
        Path = "C:\Logs\app.log"
    }
}

Test-Config $config  # Returns $true

$badConfig = @{
    Database = @{
        Server = "db01.example.com"
        # Missing Port
    }
    Logging = @{
        Level = "Invalid"  # Invalid level
        Path = "C:\Logs\app.log"
    }
}

Test-Config $badConfig  # Returns $false with error messages
```

### 8.7.3 Custom Object Serialization

#### 8.7.3.1 Basic Serialization

```powershell
# Serialize custom object to JSON
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
    Age = 30
}
$json = $person | ConvertTo-Json

# Deserialize JSON to custom object
$recoveredPerson = $json | ConvertFrom-Json

# Verify
$recoveredPerson.FirstName  # "John"
$recoveredPerson.LastName   # "Doe"
$recoveredPerson.Age        # 30
```

#### 8.7.3.2 Advanced Serialization Techniques

```powershell
# Custom serialization with depth
$process = Get-Process -Id $PID
$json = $process | ConvertTo-Json -Depth 3

# Custom serialization with compression
$largeObject = 1..10000 | ForEach-Object { 
    [PSCustomObject]@{Id = $_; Value = ("X" * $_)} 
}
$json = $largeObject | ConvertTo-Json -Compress

# Custom serialization with custom converters
$person = [PSCustomObject]@{
    Name = "John Doe"
    BirthDate = (Get-Date).AddYears(-30)
}

# Custom converter for dates
$person | Add-Member -MemberType ScriptProperty -Name BirthDateFormatted -Value {
    $this.BirthDate.ToString("yyyy-MM-dd")
}

$json = $person | Select-Object Name, BirthDateFormatted | ConvertTo-Json
```

#### 8.7.3.3 Practical Serialization Examples

```powershell
# System inventory serialization
$inventory = [PSCustomObject]@{
    ComputerName = $env:COMPUTERNAME
    OS = (Get-CimInstance Win32_OperatingSystem).Caption
    CPU = (Get-CimInstance Win32_Processor).Name
    MemoryGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
    Disks = Get-PhysicalDisk | ForEach-Object {
        [PSCustomObject]@{
            Model = $_.Model
            SizeGB = [math]::Round($_.Size / 1GB)
            Health = $_.HealthStatus
        }
    }
    Network = Get-NetIPAddress | Where-Object AddressFamily -eq "IPv4" | ForEach-Object {
        [PSCustomObject]@{
            Interface = $_.InterfaceAlias
            IPAddress = $_.IPAddress
            PrefixLength = $_.PrefixLength
        }
    }
}

# Save to file
$inventory | ConvertTo-Json -Depth 10 | Out-File system_inventory.json

# Load from file
$recoveredInventory = Get-Content system_inventory.json | ConvertFrom-Json

# Verify
$recoveredInventory.ComputerName
$recoveredInventory.Disks[0].Model

# API response handling
$response = Invoke-RestMethod -Uri "https://api.example.com/users"
$users = $response.data | ForEach-Object {
    [PSCustomObject]@{
        Id = $_.id
        Name = $_.name
        Email = $_.email
        CreatedAt = [datetime]$_.created_at
        IsActive = $_.is_active
    }
}

# Add custom methods
$users | ForEach-Object {
    $_ | Add-Member -MemberType ScriptMethod -Name GetStatus -Value {
        if ($this.IsActive) { "Active" } else { "Inactive" }
    }
}

$users | Format-Table Id, Name, Email, GetStatus
```

### 8.7.4 Custom Object Formatting

#### 8.7.4.1 Default Formatting

```powershell
# Default formatting behavior
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
    Age = 30
    City = "New York"
}

$person  # Formats as table with all properties
$person | Format-List  # Formats as list with all properties
```

#### 8.7.4.2 Custom Formatting with Format Data

```powershell
# Create custom format view
$formatXml = @"
<Configuration>
  <ViewDefinitions>
    <View>
      <Name>PersonView</Name>
      <ViewSelectedBy>
        <TypeName>Person</TypeName>
      </ViewSelectedBy>
      <TableControl>
        <TableHeaders>
          <TableColumnHeader><Label>Name</Label><Width>20</Width></TableColumnHeader>
          <TableColumnHeader><Label>Age</Label><Width>5</Width></TableColumnHeader>
          <TableColumnHeader><Label>Location</Label><Width>15</Width></TableColumnHeader>
        </TableHeaders>
        <TableRowEntries>
          <TableRowEntry>
            <TableColumnItems>
              <TableColumnItem><ScriptBlock>"$($this.FirstName) $($this.LastName)"</ScriptBlock></TableColumnItem>
              <TableColumnItem><PropertyName>Age</PropertyName></TableColumnItem>
              <TableColumnItem><PropertyName>City</PropertyName></TableColumnItem>
            </TableColumnItems>
          </TableRowEntry>
        </TableRowEntries>
      </TableControl>
    </View>
  </ViewDefinitions>
</Configuration>
"@

# Save to temporary file
$path = [System.IO.Path]::GetTempFileName() + ".format.ps1xml"
$formatXml | Out-File -FilePath $path

# Load format data
Update-FormatData -PrependPath $path

# Apply type name and use custom view
$person.PSObject.TypeNames.Insert(0, "Person")
$person | Format-Table -View PersonView
```

#### 8.7.4.3 Practical Formatting Examples

```powershell
# Process summary formatting
$process = Get-Process -Id $PID

# Add type name
$process.PSObject.TypeNames.Insert(0, "ProcessSummary")

# Create custom format view
$formatXml = @"
<Configuration>
  <ViewDefinitions>
    <View>
      <Name>ProcessSummary</Name>
      <ViewSelectedBy>
        <TypeName>ProcessSummary</TypeName>
      </ViewSelectedBy>
      <CustomControl>
        <CustomEntries>
          <CustomEntry>
            <CustomItem>
              <ExpressionBinding>
                <ScriptBlock>
                "Process: $($this.Name) (PID: $($this.Id))"
                "CPU: {0:N2}%" -f $this.CPU
                "Memory: {0:N2} MB" -f ($this.WorkingSet / 1MB)
                "Uptime: {0:D2}d {1:D2}h {2:D2}m" -f 
                    ((Get-Date) - $this.StartTime).Days,
                    ((Get-Date) - $this.StartTime).Hours,
                    ((Get-Date) - $this.StartTime).Minutes
                </ScriptBlock>
              </ExpressionBinding>
            </CustomItem>
          </CustomEntry>
        </CustomEntries>
      </CustomControl>
    </View>
  </ViewDefinitions>
</Configuration>
"@

# Save and load format data
$path = [System.IO.Path]::GetTempFileName() + ".format.ps1xml"
$formatXml | Out-File -FilePath $path
Update-FormatData -PrependPath $path

# Display with custom format
$process | Format-Custom -View ProcessSummary

# File system item formatting
Get-ChildItem | ForEach-Object {
    $item = $_
    
    # Add type name
    $item.PSObject.TypeNames.Insert(0, "FileSystemItem")
    
    # Add calculated properties
    $item | Add-Member -MemberType ScriptProperty -Name SizeFormatted -Value {
        $bytes = $this.Length
        if ($bytes -gt 1TB) { "{0:N2} TB" -f ($bytes / 1TB) }
        elseif ($bytes -gt 1GB) { "{0:N2} GB" -f ($bytes / 1GB) }
        elseif ($bytes -gt 1MB) { "{0:N2} MB" -f ($bytes / 1MB) }
        elseif ($bytes -gt 1KB) { "{0:N2} KB" -f ($bytes / 1KB) }
        else { "$bytes bytes" }
    } -PassThru |
    Add-Member -MemberType ScriptProperty -Name AgeFormatted -Value {
        $days = (Get-Date) - $this.LastWriteTime
        "{0} days" -f $days.Days
    }
}

# Create custom format view
$formatXml = @"
<Configuration>
  <ViewDefinitions>
    <View>
      <Name>FileSystemItem</Name>
      <ViewSelectedBy>
        <TypeName>FileSystemItem</TypeName>
      </ViewSelectedBy>
      <TableControl>
        <TableHeaders>
          <TableColumnHeader><Label>Name</Label><Width>30</Width></TableColumnHeader>
          <TableColumnHeader><Label>Type</Label><Width>10</Width></TableColumnHeader>
          <TableColumnHeader><Label>Size</Label><Width>12</Width></TableColumnHeader>
          <TableColumnHeader><Label>Age</Label><Width>10</Width></TableColumnHeader>
        </TableHeaders>
        <TableRowEntries>
          <TableRowEntry>
            <TableColumnItems>
              <TableColumnItem><PropertyName>Name</PropertyName></TableColumnItem>
              <TableColumnItem>
                <ScriptBlock>if ($this.PSIsContainer) { "Directory" } else { "File" }</ScriptBlock>
              </TableColumnItem>
              <TableColumnItem><PropertyName>SizeFormatted</PropertyName></TableColumnItem>
              <TableColumnItem><PropertyName>AgeFormatted</PropertyName></TableColumnItem>
            </TableColumnItems>
          </TableRowEntry>
        </TableRowEntries>
      </TableControl>
    </View>
  </ViewDefinitions>
</Configuration>
"@

# Save and load format data
$path = [System.IO.Path]::GetTempFileName() + ".format.ps1xml"
$formatXml | Out-File -FilePath $path
Update-FormatData -PrependPath $path

# Display with custom format
Get-ChildItem | Format-Table -View FileSystemItem
```

## 8.8 Parameter Splatting with Hashtables

Parameter splatting is a powerful technique that uses hashtables to pass multiple parameters to cmdlets.

### 8.8.1 Basic Parameter Splatting

#### 8.8.1.1 Simple Splatting Example

```powershell
# Traditional approach
Copy-Item -Path "C:\source\file.txt" -Destination "C:\destination\" -Force -Verbose

# Parameter splatting approach
$copyParams = @{
    Path = "C:\source\file.txt"
    Destination = "C:\destination\"
    Force = $true
    Verbose = $true
}
Copy-Item @copyParams
```

#### 8.8.1.2 Benefits of Parameter Splatting

- **Readability**: Parameters are clearly organized
- **Maintainability**: Easier to modify parameter sets
- **Reusability**: Parameter sets can be reused
- **Dynamic parameters**: Parameters can be built dynamically
- **Cleaner code**: Reduces command line clutter

### 8.8.2 Advanced Parameter Splatting Techniques

#### 8.8.2.1 Dynamic Parameter Building

```powershell
# Build parameters dynamically
$copyParams = @{
    Path = "C:\source\file.txt"
    Destination = "C:\destination\"
}

if ($ForceCopy) {
    $copyParams["Force"] = $true
}

if ($VerboseMode) {
    $copyParams["Verbose"] = $true
}

Copy-Item @copyParams
```

#### 8.8.2.2 Merging Parameter Hashtables

```powershell
# Base parameters
$baseParams = @{
    Path = "C:\source\"
    Destination = "C:\destination\"
    Recurse = $true
}

# Environment-specific parameters
$envParams = if ($IsProduction) {
    @{Force = $true; Verbose = $true}
} else {
    @{WhatIf = $true}
}

# Merge hashtables
$allParams = $baseParams + $envParams

# Use splatting
Copy-Item @allParams
```

#### 8.8.2.3 Splatting with Functions

```powershell
function Invoke-FileCopy {
    param(
        [string]$Source,
        [string]$Destination,
        [switch]$Force,
        [switch]$Recurse,
        [switch]$Verbose
    )
    
    $copyParams = @{
        Path = $Source
        Destination = $Destination
    }
    
    if ($Force) { $copyParams["Force"] = $true }
    if ($Recurse) { $copyParams["Recurse"] = $true }
    if ($Verbose) { $copyParams["Verbose"] = $true }
    
    Copy-Item @copyParams
}

# Usage
Invoke-FileCopy -Source "C:\source\" -Destination "C:\dest\" -Force -Recurse -Verbose
```

### 8.8.3 Practical Parameter Splatting Examples

#### 8.8.3.1 File Operations

```powershell
# Backup function with splatting
function Backup-Files {
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$Paths,
        
        [Parameter(Mandatory=$true)]
        [string]$Destination,
        
        [switch]$Compress,
        [switch]$Archive,
        [switch]$Verbose
    )
    
    # Create destination if needed
    if (-not (Test-Path $Destination)) {
        $itemParams = @{
            Path = $Destination
            ItemType = "Directory"
        }
        if ($Verbose) { $itemParams["Verbose"] = $true }
        New-Item @itemParams | Out-Null
    }
    
    # Copy parameters
    $copyParams = @{
        Destination = $Destination
    }
    if ($Verbose) { $copyParams["Verbose"] = $true }
    
    # Process each path
    foreach ($path in $Paths) {
        $copyParams["Path"] = $path
        
        try {
            Copy-Item @copyParams -ErrorAction Stop
            
            # Compress if requested
            if ($Compress) {
                $zipParams = @{
                    Path = "$Destination\$([System.IO.Path]::GetFileName($path))"
                    DestinationPath = "$Destination\$([System.IO.Path]::GetFileNameWithoutExtension($path)).zip"
                    CompressionLevel = "Fastest"
                }
                if ($Verbose) { $zipParams["Verbose"] = $true }
                Compress-Archive @zipParams
            }
            
            # Archive original if requested
            if ($Archive) {
                $archiveParams = @{
                    Path = $path
                    Destination = "$Destination\archive"
                    Force = $true
                }
                if ($Verbose) { $archiveParams["Verbose"] = $true }
                Copy-Item @archiveParams
            }
        } catch {
            Write-Error "Failed to process $path: $_"
        }
    }
}

# Usage
Backup-Files -Paths "C:\data\*", "D:\reports\*" `
    -Destination "E:\backup\$(Get-Date -Format 'yyyy-MM-dd')" `
    -Compress -Archive -Verbose
```

#### 8.8.3.2 API Interactions

```powershell
# API client with splatting
class ApiClient {
    hidden [hashtable]$config
    
    ApiClient([hashtable]$config) {
        $this.config = $config
    }
    
    [object]Get($endpoint, $queryParams = @{}) {
        $uri = "$($this.config.BaseUrl)/$endpoint"
        
        $invokeParams = @{
            Uri = $uri
            Method = "GET"
            Headers = $this.config.Headers
        }
        
        if ($queryParams.Count -gt 0) {
            $invokeParams["Body"] = $queryParams
        }
        
        if ($this.config.Timeout) {
            $invokeParams["TimeoutSec"] = $this.config.Timeout
        }
        
        return Invoke-RestMethod @invokeParams
    }
    
    [object]Post($endpoint, $body) {
        $uri = "$($this.config.BaseUrl)/$endpoint"
        
        $invokeParams = @{
            Uri = $uri
            Method = "POST"
            Headers = $this.config.Headers
            Body = $body | ConvertTo-Json
            ContentType = "application/json"
        }
        
        if ($this.config.Timeout) {
            $invokeParams["TimeoutSec"] = $this.config.Timeout
        }
        
        return Invoke-RestMethod @invokeParams
    }
}

# Usage
$config = @{
    BaseUrl = "https://api.example.com/v1"
    Headers = @{
        "Authorization" = "Bearer $($env:API_TOKEN)"
        "Accept" = "application/json"
    }
    Timeout = 30
}

$client = [ApiClient]::new($config)

# Get users with query parameters
$users = $client.Get("users", @{limit=100; offset=0})

# Create a new user
$newUser = @{
    name = "John Doe"
    email = "john.doe@example.com"
    role = "user"
}
$createdUser = $client.Post("users", $newUser)
```

#### 8.8.3.3 System Configuration

```powershell
# System configuration with splatting
function Configure-System {
    param(
        [switch]$ApplySecurity,
        [switch]$ConfigureNetwork,
        [switch]$SetupStorage,
        [switch]$Verbose
    )
    
    # Common parameters for all operations
    $commonParams = @{}
    if ($Verbose) { $commonParams["Verbose"] = $true }
    
    if ($ApplySecurity) {
        # Security configuration parameters
        $securityParams = @{
            AccountLockoutThreshold = 5
            AccountLockoutDuration = 30
            ResetAccountLockoutAfter = 30
            MinimumPasswordLength = 12
            PasswordComplexity = $true
        } + $commonParams
        
        # Apply security policy
        $null = secedit /export /cfg $env:TEMP\security.cfg @commonParams
        $configContent = Get-Content $env:TEMP\security.cfg -Raw
        
        foreach ($key in $securityParams.Keys) {
            $pattern = "(?<=^$key=).*"
            $configContent = $configContent -replace $pattern, $securityParams[$key]
        }
        
        Set-Content -Path $env:TEMP\security.cfg -Value $configContent @commonParams
        secedit /configure /db $env:TEMP\security.sdb /cfg $env:TEMP\security.cfg @commonParams
        Remove-Item $env:TEMP\security.* @commonParams
    }
    
    if ($ConfigureNetwork) {
        # Network configuration parameters
        $networkParams = @{
            Interface = "Ethernet"
            IPAddress = "192.168.1.100"
            SubnetMask = "255.255.255.0"
            Gateway = "192.168.1.1"
            DNS = @("8.8.8.8", "8.8.4.4")
        } + $commonParams
        
        # Configure network
        $interface = Get-NetAdapter -Name $networkParams.Interface @commonParams
        New-NetIPAddress @networkParams @commonParams
        Set-DnsClientServerAddress -InterfaceIndex $interface.ifIndex `
            -ServerAddresses $networkParams.DNS @commonParams
    }
    
    if ($SetupStorage) {
        # Storage configuration parameters
        $storageParams = @{
            DiskNumber = 1
            PartitionStyle = "GPT"
            DriveLetter = "D"
            FileSystem = "NTFS"
            Label = "Data"
        } + $commonParams
        
        # Setup storage
        Initialize-Disk @storageParams @commonParams
        New-Partition @storageParams @commonParams
        Format-Volume @storageParams @commonParams
    }
}

# Usage
Configure-System -ApplySecurity -ConfigureNetwork -SetupStorage -Verbose
```

## 8.9 Performance Considerations

Working with hashtables and custom objects can impact script performance, especially with large datasets.

### 8.9.1 Hashtable Performance

#### 8.9.1.1 Algorithm Complexity

Hashtables provide O(1) lookup time, making them extremely efficient for:
- Key-value pair storage
- Fast lookups by key
- Maintaining unique keys

Performance considerations:
- Creation time increases with number of entries
- Memory usage is proportional to number of entries
- Collisions can affect performance (rare in PowerShell)

#### 8.9.1.2 Measuring Hashtable Performance

```powershell
# Measure hashtable creation
$createTime = Measure-Command {
    $hash = @{}
    1..10000 | ForEach-Object {
        $hash["Key$_"] = "Value$_"
    }
}

# Measure hashtable lookup
$hash = 1..10000 | ForEach-Object { @{"Key$_" = "Value$_"} } | 
    Merge-HashTables
$lookupTime = Measure-Command {
    1..1000 | ForEach-Object {
        $null = $hash["Key$_"]
    }
}

# Display results
[pscustomobject]@{
    Operation = "Create 10,000 entries"
    TimeMs = $createTime.TotalMilliseconds
} | Format-Table

[pscustomobject]@{
    Operation = "1,000 lookups"
    TimeMs = $lookupTime.TotalMilliseconds
} | Format-Table
```

#### 8.9.1.3 Performance Comparison: Different Operations

```powershell
# Compare different hashtable operations
$tests = @(
    @{Name="Create"; Script={
        $hash = @{}
        1..10000 | ForEach-Object { $hash["Key$_"] = "Value$_" }
    }}
    @{Name="Lookup"; Script={
        $hash = 1..10000 | ForEach-Object { @{"Key$_" = "Value$_"} } | 
            Merge-HashTables
        1..1000 | ForEach-Object { $null = $hash["Key$_"] }
    }}
    @{Name="Add"; Script={
        $hash = @{}
        1..10000 | ForEach-Object { $hash["Key$_"] = "Value$_" }
        1..1000 | ForEach-Object { $hash["NewKey$_"] = "NewValue$_" }
    }}
    @{Name="Remove"; Script={
        $hash = 1..10000 | ForEach-Object { @{"Key$_" = "Value$_"} } | 
            Merge-HashTables
        1..1000 | ForEach-Object { $null = $hash.Remove("Key$_") }
    }}
)

$results = foreach ($test in $tests) {
    $time = Measure-Command { & $test.Script }
    [pscustomobject]@{
        Test = $test.Name
        TimeMs = $time.TotalMilliseconds
    }
}

$results | Format-Table -AutoSize
```

### 8.9.2 Custom Object Performance

#### 8.9.2.1 Algorithm Complexity

Custom object creation has O(1) complexity per object, but:
- Creating many objects can be memory-intensive
- Adding properties to existing objects is expensive
- Working with large object collections affects performance

#### 8.9.2.2 Measuring Object Performance

```powershell
# Measure custom object creation
$createTime = Measure-Command {
    $objects = 1..10000 | ForEach-Object {
        [PSCustomObject]@{
            Id = $_
            Value = "Value$_"
            Status = if ($_ % 2 -eq 0) { "Active" } else { "Inactive" }
        }
    }
}

# Measure object property access
$objects = 1..10000 | ForEach-Object {
    [PSCustomObject]@{
        Id = $_
        Value = "Value$_"
    }
}
$accessTime = Measure-Command {
    1..1000 | ForEach-Object {
        $null = $objects[$_].Value
    }
}

# Display results
[pscustomobject]@{
    Operation = "Create 10,000 objects"
    TimeMs = $createTime.TotalMilliseconds
} | Format-Table

[pscustomobject]@{
    Operation = "1,000 property accesses"
    TimeMs = $accessTime.TotalMilliseconds
} | Format-Table
```

#### 8.9.2.3 Performance Comparison: Different Methods

```powershell
# Compare different object creation methods
$tests = @(
    @{Name="PSCustomObject"; Script={
        1..10000 | ForEach-Object {
            [PSCustomObject]@{
                Id = $_
                Value = "Value$_"
            }
        }
    }}
    @{Name="New-Object"; Script={
        1..10000 | ForEach-Object {
            New-Object PSObject -Property @{
                Id = $_
                Value = "Value$_"
            }
        }
    }}
    @{Name="Add-Member"; Script={
        1..10000 | ForEach-Object {
            $obj = New-Object PSObject
            $obj | Add-Member -MemberType NoteProperty -Name Id -Value $_ -PassThru |
                Add-Member -MemberType NoteProperty -Name Value -Value "Value$_" -PassThru
        }
    }}
)

$results = foreach ($test in $tests) {
    $time = Measure-Command { & $test.Script }
    [pscustomobject]@{
        Test = $test.Name
        TimeMs = $time.TotalMilliseconds
    }
}

$results | Format-Table -AutoSize
```

### 8.9.3 Optimizing Hashtable Operations

#### 8.9.3.1 Pre-allocating Hashtables

```powershell
# Less efficient: dynamic resizing
$hash = @{}
1..10000 | ForEach-Object {
    $hash["Key$_"] = "Value$_"
}

# More efficient: pre-allocate capacity
$hash = [hashtable]::new(10000)
1..10000 | ForEach-Object {
    $hash["Key$_"] = "Value$_"
}
```

#### 8.9.3.2 Avoiding Unnecessary Hashtable Copies

```powershell
# Less efficient: creates copy on modification
$hash = @{}
1..10000 | ForEach-Object {
    $temp = $hash.Clone()
    $temp["Key$_"] = "Value$_"
    $hash = $temp
}

# More efficient: modify in place
$hash = @{}
1..10000 | ForEach-Object {
    $hash["Key$_"] = "Value$_"
}
```

#### 8.9.3.3 Using String Interning for Repeated Keys

```powershell
# Less efficient: repeated string allocation
$keys = "Name", "Age", "City", "Country", "Email"
$people = 1..10000 | ForEach-Object {
    $hash = @{}
    for ($i = 0; $i -lt $keys.Count; $i++) {
        $hash[$keys[$i]] = "Value$_-$i"
    }
    $hash
}

# More efficient: string interning
$keys = [System.String]::Intern("Name"), [System.String]::Intern("Age"), 
         [System.String]::Intern("City"), [System.String]::Intern("Country"),
         [System.String]::Intern("Email")
$people = 1..10000 | ForEach-Object {
    $hash = @{}
    for ($i = 0; $i -lt $keys.Count; $i++) {
        $hash[$keys[$i]] = "Value$_-$i"
    }
    $hash
}
```

### 8.9.4 Optimizing Custom Object Operations

#### 8.9.4.1 Object Creation Patterns

```powershell
# Less efficient: individual object creation
$people = 1..10000 | ForEach-Object {
    [PSCustomObject]@{
        Id = $_
        Name = "Person$_"
        Status = if ($_ % 2 -eq 0) { "Active" } else { "Inactive" }
    }
}

# More efficient: array assignment
$people = [System.Collections.ArrayList]::new(10000)
1..10000 | ForEach-Object {
    $people.Add([PSCustomObject]@{
        Id = $_
        Name = "Person$_"
        Status = if ($_ % 2 -eq 0) { "Active" } else { "Inactive" }
    }) | Out-Null
}
```

#### 8.9.4.2 Property Access Optimization

```powershell
# Less efficient: repeated property access
$people = 1..10000 | ForEach-Object {
    [PSCustomObject]@{
        Id = $_
        Name = "Person$_"
    }
}
$total = 0
$people | ForEach-Object {
    $total += $_.Id.Length
}

# More efficient: extract property first
$ids = $people | ForEach-Object { $_.Id }
$total = ($ids | ForEach-Object { $_.ToString().Length } | Measure-Object -Sum).Sum
```

#### 8.9.4.3 Avoiding Unnecessary Object Copies

```powershell
# Less efficient: creates copy on modification
$people = 1..10000 | ForEach-Object {
    [PSCustomObject]@{
        Id = $_
        Name = "Person$_"
    }
}
$updatedPeople = $people | ForEach-Object {
    $_ | Add-Member -MemberType NoteProperty -Name Status -Value "Active" -PassThru
}

# More efficient: create with all properties
$people = 1..10000 | ForEach-Object {
    [PSCustomObject]@{
        Id = $_
        Name = "Person$_"
        Status = "Active"
    }
}
```

## 8.10 Real-World Scenarios

Hashtables and custom objects are essential for real-world administration tasks. Let's explore practical scenarios across different domains.

### 8.10.1 Configuration Management

#### 8.10.1.1 Application Configuration

```powershell
# Application configuration manager
class ConfigManager {
    hidden [hashtable]$config
    hidden [string]$configPath
    
    ConfigManager([string]$configPath) {
        $this.configPath = $configPath
        $this.Load()
    }
    
    [void]Load() {
        if (Test-Path $this.configPath) {
            $this.config = Get-Content $this.configPath | ConvertFrom-Json | ConvertTo-Hashtable
        } else {
            $this.config = @{
                Database = @{
                    Server = "localhost"
                    Port = 1433
                    DatabaseName = "AppDB"
                }
                Logging = @{
                    Level = "Info"
                    Path = "C:\Logs\app.log"
                    RetentionDays = 7
                }
                API = @{
                    BaseUrl = "https://api.example.com/v1"
                    Timeout = 30
                    MaxRetries = 3
                }
            }
        }
    }
    
    [void]Save() {
        $this.config | ConvertTo-Json -Depth 10 | Set-Content $this.configPath
    }
    
    [object]Get($path) {
        $parts = $path -split '\.'
        $current = $this.config
        
        foreach ($part in $parts) {
            if ($current -is [hashtable] -and $current.Contains($part)) {
                $current = $current[$part]
            } else {
                return $null
            }
        }
        
        return $current
    }
    
    [void]Set($path, $value) {
        $parts = $path -split '\.'
        $current = $this.config
        
        for ($i = 0; $i -lt $parts.Count - 1; $i++) {
            $part = $parts[$i]
            if (-not $current.Contains($part)) {
                $current[$part] = @{}
            }
            $current = $current[$part]
        }
        
        $current[$parts[-1]] = $value
    }
}

# Usage
$configPath = "C:\App\config.json"
$config = [ConfigManager]::new($configPath)

# Get configuration values
$config.Get("Database.Server")  # "localhost"
$config.Get("Logging.Level")    # "Info"

# Update configuration
$config.Set("Database.Server", "prod-db.example.com")
$config.Set("Logging.Level", "Warning")

# Save configuration
$config.Save()

# Display current configuration
$config.Get("Database") | Format-List *
$config.Get("Logging") | Format-List *
```

#### 8.10.1.2 System Profile Management

```powershell
# System profile manager
class ProfileManager {
    hidden [hashtable]$profiles
    hidden [string]$profilePath
    
    ProfileManager([string]$profilePath) {
        $this.profilePath = $profilePath
        $this.Load()
    }
    
    [void]Load() {
        if (Test-Path $this.profilePath) {
            $this.profiles = Get-Content $this.profilePath | ConvertFrom-Json | ConvertTo-Hashtable
        } else {
            $this.profiles = @{}
        }
    }
    
    [void]Save() {
        $this.profiles | ConvertTo-Json -Depth 10 | Set-Content $this.profilePath
    }
    
    [void]AddProfile($name, $settings) {
        $this.profiles[$name] = $settings
    }
    
    [hashtable]GetProfile($name) {
        return $this.profiles[$name]
    }
    
    [void]ApplyProfile($name) {
        $profile = $this.GetProfile($name)
        if (-not $profile) { return }
        
        # Apply display settings
        if ($profile.Display) {
            $displayParams = @{
                Width = $profile.Display.Width
                Height = $profile.Display.Height
            }
            Set-DisplayResolution @displayParams
        }
        
        # Apply network settings
        if ($profile.Network) {
            $networkParams = @{
                Interface = $profile.Network.Interface
                IPAddress = $profile.Network.IPAddress
                SubnetMask = $profile.Network.SubnetMask
            }
            if ($profile.Network.Gateway) { $networkParams["Gateway"] = $profile.Network.Gateway }
            if ($profile.Network.DNS) { $networkParams["DNS"] = $profile.Network.DNS }
            
            Set-NetworkConfiguration @networkParams
        }
        
        # Apply power settings
        if ($profile.Power) {
            $powerParams = @{
                Scheme = $profile.Power.Scheme
            }
            Set-PowerScheme @powerParams
        }
    }
}

# Usage
$profilePath = "C:\Profiles\system_profiles.json"
$profileManager = [ProfileManager]::new($profilePath)

# Create workstation profile
$workstationProfile = @{
    Display = @{
        Width = 1920
        Height = 1080
    }
    Network = @{
        Interface = "Ethernet"
        IPAddress = "192.168.1.100"
        SubnetMask = "255.255.255.0"
        Gateway = "192.168.1.1"
        DNS = @("8.8.8.8", "8.8.4.4")
    }
    Power = @{
        Scheme = "High Performance"
    }
}
$profileManager.AddProfile("Workstation", $workstationProfile)

# Create server profile
$serverProfile = @{
    Display = @{
        Width = 1024
        Height = 768
    }
    Network = @{
        Interface = "Ethernet"
        IPAddress = "10.0.0.10"
        SubnetMask = "255.255.255.0"
        Gateway = "10.0.0.1"
        DNS = @("10.0.0.2")
    }
    Power = @{
        Scheme = "Balanced"
    }
}
$profileManager.AddProfile("Server", $serverProfile)

# Save profiles
$profileManager.Save()

# Apply workstation profile
$profileManager.ApplyProfile("Workstation")
```

### 8.10.2 Data Transformation

#### 8.10.2.1 CSV to Custom Object Transformation

```powershell
# CSV to custom object transformation
function ConvertTo-UserObject {
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        $InputObject
    )
    
    process {
        [PSCustomObject]@{
            UserID = $InputObject.UserID
            Username = $InputObject.Username
            FullName = $InputObject."First Name" + " " + $InputObject."Last Name"
            Email = $InputObject.Email
            Department = $InputObject.Department
            Role = $InputObject.Role
            IsActive = [bool]::Parse($InputObject.IsActive)
            CreatedDate = [datetime]$InputObject.CreatedDate
            LastLogin = if ($InputObject.LastLogin) { [datetime]$InputObject.LastLogin } else { $null }
        }
    }
}

# Add methods to user objects
function Add-UserMethods {
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        $InputObject
    )
    
    process {
        $user = $InputObject
        
        # Account age method
        $user | Add-Member -MemberType ScriptMethod -Name GetAccountAge -Value {
            $days = (Get-Date) - $this.CreatedDate
            "{0} days" -f $days.Days
        } -PassThru |
        
        # Status description method
        Add-Member -MemberType ScriptMethod -Name GetStatusDescription -Value {
            if (-not $this.IsActive) { "Inactive" }
            elseif ($this.LastLogin -and ((Get-Date) - $this.LastLogin).Days -le 7) { "Active (Recent)" }
            else { "Active" }
        } -PassThru
    }
}

# Usage
$users = Import-Csv .\users.csv | 
    ConvertTo-UserObject | 
    Add-UserMethods

# Display users
$users | Format-Table UserID, Username, FullName, Email, Department, Role, IsActive, CreatedDate, LastLogin, GetAccountAge, GetStatusDescription -AutoSize

# Analyze user data
$users | Group-Object Department | ForEach-Object {
    [PSCustomObject]@{
        Department = $_.Name
        TotalUsers = $_.Count
        ActiveUsers = ($_.Group | Where-Object IsActive).Count
        RecentLogins = ($_.Group | Where-Object { $_.LastLogin -and ((Get-Date) - $_.LastLogin).Days -le 7 }).Count
    }
} | Format-Table -AutoSize
```

#### 8.10.2.2 API Response Transformation

```powershell
# API response transformation
function ConvertTo-ProductObject {
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        $InputObject
    )
    
    process {
        $product = [PSCustomObject]@{
            ProductID = $InputObject.id
            Name = $InputObject.name
            Description = $InputObject.description
            Price = [decimal]$InputObject.price
            Currency = $InputObject.currency
            StockQuantity = [int]$InputObject.stock
            Category = $InputObject.category
            CreatedAt = [datetime]$InputObject.created_at
            UpdatedAt = [datetime]$InputObject.updated_at
            IsActive = $InputObject.is_active -eq $true
            Tags = $InputObject.tags -split ','
        }
        
        # Add calculated properties
        $product | Add-Member -MemberType NoteProperty -Name TotalValue -Value {
            $product.Price * $product.StockQuantity
        } -PassThru |
        
        # Add methods
        Add-Member -MemberType ScriptMethod -Name GetStatus -Value {
            if (-not $this.IsActive) { "Inactive" }
            elseif ($this.StockQuantity -eq 0) { "Out of Stock" }
            elseif ($this.StockQuantity -lt 10) { "Low Stock" }
            else { "In Stock" }
        } -PassThru |
        
        Add-Member -MemberType ScriptMethod -Name FormatPrice -Value {
            "{0} {1}" -f $this.Price.ToString("C"), $this.Currency
        }
    }
}

# Usage
$response = Invoke-RestMethod -Uri "https://api.example.com/v1/products"
$products = $response.data | ConvertTo-ProductObject

# Display products
$products | Format-Table ProductID, Name, FormatPrice, StockQuantity, TotalValue, GetStatus -AutoSize

# Analyze product data
$products | Group-Object Category | ForEach-Object {
    $categoryProducts = $_.Group
    
    [PSCustomObject]@{
        Category = $_.Name
        TotalProducts = $categoryProducts.Count
        TotalValue = ($categoryProducts | Measure-Object TotalValue -Sum).Sum
        AvgPrice = ($categoryProducts | Measure-Object Price -Average).Average
        OutOfStock = ($categoryProducts | Where-Object { $_.StockQuantity -eq 0 }).Count
        LowStock = ($categoryProducts | Where-Object { $_.StockQuantity -gt 0 -and $_.StockQuantity -lt 10 }).Count
    }
} | Format-Table -AutoSize

# Find top products by value
$products | Sort-Object TotalValue -Descending | Select-Object -First 10 | 
    Format-Table ProductID, Name, FormatPrice, StockQuantity, TotalValue -AutoSize
```

### 8.10.3 Parameter Management

#### 8.10.3.1 Command Builder with Splatting

```powershell
# Command builder with parameter splatting
class CommandBuilder {
    hidden [hashtable]$parameters
    hidden [string]$commandName
    
    CommandBuilder([string]$commandName) {
        $this.commandName = $commandName
        $this.parameters = @{}
    }
    
    [CommandBuilder]AddParameter([string]$name, $value) {
        $this.parameters[$name] = $value
        return $this
    }
    
    [CommandBuilder]AddSwitchParameter([string]$name, [bool]$value) {
        if ($value) {
            $this.parameters[$name] = $true
        }
        return $this
    }
    
    [object]Execute() {
        $cmd = Get-Command $this.commandName -ErrorAction Stop
        $validParams = $cmd.Parameters.Keys
        
        # Filter to only valid parameters
        $splatParams = @{}
        foreach ($param in $this.parameters.Keys) {
            if ($validParams -contains $param) {
                $splatParams[$param] = $this.parameters[$param]
            }
        }
        
        # Execute command with splatting
        & $this.commandName @splatParams
    }
    
    [string]ToString() {
        $paramStrings = @()
        foreach ($param in $this.parameters.Keys) {
            $value = $this.parameters[$param]
            if ($value -is [switch]) {
                $paramStrings += "-$param"
            } else {
                $paramStrings += "-$param `"$value`""
            }
        }
        return "$this.commandName $($paramStrings -join ' ')"
    }
}

# Usage
# Build a Get-Process command
$processBuilder = [CommandBuilder]::new("Get-Process")
$processBuilder.AddParameter("Name", "powershell") |
    AddSwitchParameter("IncludeUserName", $true) |
    AddParameter("ComputerName", "localhost")

# Execute the command
$processes = $processBuilder.Execute()

# Display the command string
$processBuilder.ToString()

# Build a Copy-Item command
$copyBuilder = [CommandBuilder]::new("Copy-Item")
$copyBuilder.AddParameter("Path", "C:\source\*") |
    AddParameter("Destination", "D:\backup\") |
    AddSwitchParameter("Recurse", $true) |
    AddSwitchParameter("Force", $true)

# Execute the command
$copyBuilder.Execute()

# Display the command string
$copyBuilder.ToString()
```

#### 8.10.3.2 Dynamic Parameter Handling

```powershell
# Dynamic parameter handling
function Invoke-SystemScan {
    [CmdletBinding(DefaultParameterSetName="Quick")]
    param(
        [Parameter(ParameterSetName="Quick")]
        [switch]$Quick,
        
        [Parameter(ParameterSetName="Custom")]
        [switch]$Custom,
        
        [Parameter(ParameterSetName="Custom", Mandatory=$true)]
        [ValidateSet("File", "Process", "Registry", "Network")]
        [string[]]$ScanTypes,
        
        [Parameter(ParameterSetName="Custom")]
        [string[]]$Targets,
        
        [switch]$GenerateReport,
        [string]$ReportPath = "C:\Reports\scan_$(Get-Date -Format 'yyyyMMdd_HHmmss').html",
        [switch]$Verbose
    )
    
    # Build base parameters
    $params = @{}
    if ($Verbose) { $params["Verbose"] = $true }
    
    # Build scan parameters based on mode
    if ($Quick) {
        $params["ScanTypes"] = @("File", "Process")
        $params["Targets"] = @("*")
    } elseif ($Custom) {
        $params["ScanTypes"] = $ScanTypes
        $params["Targets"] = if ($Targets) { $Targets } else { @("*") }
    }
    
    # Execute scan
    $results = Start-SystemScan @params
    
    # Generate report if requested
    if ($GenerateReport) {
        $reportParams = @{
            Results = $results
            Path = $ReportPath
        }
        if ($Verbose) { $reportParams["Verbose"] = $true }
        Export-ScanReport @reportParams
    }
    
    return $results
}

# Helper function to perform the actual scan
function Start-SystemScan {
    param(
        [string[]]$ScanTypes,
        [string[]]$Targets,
        [switch]$Verbose
    )
    
    $results = [System.Collections.ArrayList]::new()
    
    foreach ($type in $ScanTypes) {
        $typeParams = @{
            Targets = $Targets
        }
        if ($Verbose) { $typeParams["Verbose"] = $true }
        
        $typeResults = switch ($type) {
            "File" { Scan-Files @typeParams }
            "Process" { Scan-Processes @typeParams }
            "Registry" { Scan-Registry @typeParams }
            "Network" { Scan-Network @typeParams }
        }
        
        $results.AddRange($typeResults)
    }
    
    return $results
}

# Usage
# Quick scan
Invoke-SystemScan -Quick -GenerateReport

# Custom scan
Invoke-SystemScan -Custom -ScanTypes File,Registry -Targets "C:\sensitive\", "HKLM:\Software\Policies" -GenerateReport -ReportPath "C:\Reports\custom_scan.html"
```

## 8.11 Common Mistakes

Even experienced PowerShell users make mistakes with hashtables and custom objects. Understanding these pitfalls helps write more reliable scripts.

### 8.11.1 Hashtable Mistakes

#### 8.11.1.1 Case Sensitivity Issues

```powershell
# Case sensitivity behavior varies by platform
$hash = @{"Key" = "Value"}
$hash["key"]  # Returns "Value" on Windows, $null on Linux
```

PowerShell hashtable key comparison is case-insensitive on Windows but case-sensitive on Linux/macOS.

#### 8.11.1.2 Accidental Type Conversion

```powershell
# Accidental type conversion
$hash = @{Count = 10}
$hash["Count"]  # Returns 10 (int)
$hash.Count     # Returns number of entries (1), not the value
```

Using `.Count` accesses the hashtable's count, not the "Count" key's value.

#### 8.11.1.3 Missing Key Errors

```powershell
# Missing key error
$hash = @{"Name" = "John"}
$hash["Age"]  # Returns $null, no error
$hash.Age     # Returns $null, no error (PowerShell 3.0+)
```

Accessing missing keys returns `$null` without error, which can lead to subtle bugs.

#### 8.11.1.4 Solutions

1. **Explicit case handling**:
   ```powershell
   # Case-insensitive access (explicit)
   $key = "key"
   $hash.GetEnumerator() | 
       Where-Object { $_.Key.ToString().ToLower() -eq $key.ToLower() } | 
       Select-Object -ExpandProperty Value
   ```

2. **Avoid reserved names**:
   ```powershell
   # Avoid using reserved names like Count, Keys, Values
   $hash = @{
       ItemCount = 10
       ItemKeys = @("A", "B", "C")
   }
   ```

3. **Check for key existence**:
   ```powershell
   # Check if key exists
   if ($hash.ContainsKey("Age")) {
       $age = $hash["Age"]
   } else {
       $age = $null
   }
   
   # Using null-coalescing (PowerShell 7+)
   $age = $hash["Age"] ?? $null
   ```

### 8.11.2 Custom Object Mistakes

#### 8.11.2.1 Immutable Properties

```powershell
# Attempting to add properties to existing object
$person = [PSCustomObject]@{Name = "John"}
$person.Age = 30  # Works in PowerShell 3.0+
```

While PowerShell 3.0+ allows adding properties to custom objects, it's generally not recommended as it can lead to inconsistent object structures.

#### 8.11.2.2 Type Confusion

```powershell
# Type confusion
$process = Get-Process -Id $PID
$process.CPU -is [double]  # True
$process.Id -is [int]      # False (it's [int32])

# This can cause issues
if ($process.Id -gt 0) {  # Works
    # ...
}

if ($process.CPU -is [int]) {  # False, even if CPU is whole number
    # ...
}
```

PowerShell types don't always match expectations, leading to type-related bugs.

#### 8.11.2.3 Pipeline Behavior

```powershell
# Unexpected pipeline behavior
$people = @(
    [PSCustomObject]@{Name = "John"; Age = 30}
    [PSCustomObject]@{Name = "Jane"; Age = 28}
)

$people | Where-Object { $_.Age -gt 25 } | 
    ForEach-Object { 
        $_.Name = "Senior: $($_.Name)" 
        $_ 
    }

# Original objects are modified!
$people[0].Name  # "Senior: John"
```

Custom objects in collections are references, so modifying them in the pipeline affects the original objects.

#### 8.11.2.4 Solutions

1. **Create new objects for modifications**:
   ```powershell
   $updatedPeople = $people | ForEach-Object {
       [PSCustomObject]@{
           Name = "Senior: $($_.Name)"
           Age = $_.Age
       }
   }
   ```

2. **Use type checking carefully**:
   ```powershell
   # Better type checking
   if ($process.Id -is [int] -or $process.Id -is [int32]) {
       # ...
   }
   
   # Numeric check
   if ($process.CPU -is [numeric]) {
       # ...
   }
   ```

3. **Understand object identity**:
   ```powershell
   # Create independent copies
   $copy = $original.PSObject.Copy()
   ```

### 8.11.3 Parameter Splatting Mistakes

#### 8.11.3.1 Missing Splat Operator

```powershell
# Missing splat operator
$params = @{Path = "C:\file.txt"; Destination = "D:\"}
Copy-Item $params  # Treats $params as Path parameter
```

Forgetting the `@` splat operator treats the hashtable as a single parameter.

#### 8.11.3.2 Invalid Parameter Names

```powershell
# Invalid parameter names
$params = @{
    Source = "C:\file.txt"  # Should be Path
    Destination = "D:\"
}
Copy-Item @params  # Error: "Source" parameter not found
```

Parameter names must match the cmdlet's expected parameters.

#### 8.11.3.3 Type Mismatch

```powershell
# Type mismatch
$params = @{
    Path = "C:\file.txt"
    Destination = "D:\"
    Force = "true"  # Should be [bool], not [string]
}
Copy-Item @params  # Error: cannot convert value "true" to type System.Boolean
```

Values must be of the correct type for the parameters.

#### 8.11.3.4 Solutions

1. **Always use splat operator**:
   ```powershell
   Copy-Item @params  # Correct
   ```

2. **Validate parameter names**:
   ```powershell
   $validParams = (Get-Command Copy-Item).Parameters.Keys
   $invalid = $params.Keys | Where-Object { $validParams -notcontains $_ }
   if ($invalid) {
       throw "Invalid parameters: $($invalid -join ', ')"
   }
   ```

3. **Ensure proper types**:
   ```powershell
   # Convert types as needed
   if ($params.ContainsKey("Force")) {
       $params["Force"] = [bool]::Parse($params["Force"])
   }
   ```

### 8.11.4 Performance Anti-Patterns

#### 8.11.4.1 Repeated Hashtable Creation

```powershell
# Inefficient: creates hashtable repeatedly
1..10000 | ForEach-Object {
    $params = @{
        Path = "C:\file$_"
        Destination = "D:\backup\"
    }
    Copy-Item @params
}
```

Creating the same hashtable repeatedly is inefficient.

#### 8.11.4.2 Unnecessary Object Copies

```powershell
# Inefficient: creates object copy on each iteration
$person = [PSCustomObject]@{Name = "John"; Age = 30}
1..10000 | ForEach-Object {
    $updatedPerson = $person | Select-Object * | 
        Add-Member -MemberType NoteProperty -Name ID -Value $_ -PassThru
    # Use $updatedPerson
}
```

Creating object copies in loops is memory-intensive.

#### 8.11.4.3 Deep Copying Large Objects

```powershell
# Inefficient: deep copying large objects
$largeObject = Get-LargeData
$copiedObject = $largeObject | ConvertTo-Json | ConvertFrom-Json
```

Deep copying large objects using JSON conversion is slow and memory-intensive.

#### 8.11.4.4 Solutions

1. **Reuse hashtables**:
   ```powershell
   $baseParams = @{
       Destination = "D:\backup\"
   }
   1..10000 | ForEach-Object {
       $params = $baseParams.Clone()
       $params["Path"] = "C:\file$_"
       Copy-Item @params
   }
   ```

2. **Modify objects in place**:
   ```powershell
   $person = [PSCustomObject]@{Name = "John"; Age = 30}
   1..10000 | ForEach-Object {
       $person | Add-Member -MemberType NoteProperty -Name ID -Value $_ -Force
       # Use $person
   }
   ```

3. **Use shallow copies when possible**:
   ```powershell
   $copiedObject = $largeObject.PSObject.Copy()
   ```

## 8.12 Troubleshooting Hashtables and Custom Objects

When working with hashtables and custom objects, systematic troubleshooting helps identify and fix issues.

### 8.12.1 Diagnosing Hashtable Issues

When a hashtable behaves unexpectedly, follow this diagnostic process.

#### 8.12.1.1 Verify Hashtable Structure

```powershell
# Check hashtable structure
$hash = @{
    Name = "John"
    Age = 30
}

$hash | Get-Member  # Should show IDictionary methods
$hash.Count        # Should be 2
$hash.Keys         # Should be "Name", "Age"
$hash.Values       # Should be "John", 30
```

#### 8.12.1.2 Inspect Hashtable Entries

```powershell
# View all entries
$hash.GetEnumerator() | Format-Table -AutoSize

# Check specific entry
$hash["Name"]  # Should be "John"
$hash.Name     # Should be "John" (PowerShell 3.0+)
```

#### 8.12.1.3 Common Hashtable Problems

```powershell
# Problem: key not found
$hash = @{"Name" = "John"}
$hash["name"]  # Returns $null (case sensitivity issue)

# Problem: reserved name conflict
$hash = @{Count = 10}
$hash.Count    # Returns 1 (number of entries), not 10

# Problem: type mismatch
$hash = @{Age = "30"}
$hash["Age"] -gt 25  # Returns $false (string comparison)
```

#### 8.12.1.4 Diagnostic Commands

```powershell
# View hashtable in detail
$hash | Format-List *

# Check if key exists
$hash.ContainsKey("Name")  # Should be $true
$hash.ContainsValue("John")  # Should be $true

# Convert to custom object for better display
[PSCustomObject]$hash | Format-List *

# Debug hashtable creation
$hash = @{}
"Adding Name=John" | Write-Host
$hash["Name"] = "John"
"Adding Age=30" | Write-Host
$hash["Age"] = 30
$hash | Format-Table -AutoSize
```

### 8.12.2 Diagnosing Custom Object Issues

When a custom object behaves unexpectedly, follow this diagnostic process.

#### 8.12.2.1 Verify Object Structure

```powershell
# Check object structure
$person = [PSCustomObject]@{
    Name = "John"
    Age = 30
}

$person | Get-Member  # Should show properties Name and Age
$person.PSObject.Properties.Name  # Should be "Name", "Age"
$person.PSObject.TypeNames  # Should include "System.Management.Automation.PSCustomObject"
```

#### 8.12.2.2 Inspect Object Properties

```powershell
# View all properties
$person | Format-List *

# Check specific property
$person.Name  # Should be "John"
$person.Age   # Should be 30
```

#### 8.12.2.3 Common Object Problems

```powershell
# Problem: missing property
$person = [PSCustomObject]@{Name = "John"}
$person.Age  # Returns $null

# Problem: type mismatch
$person = [PSCustomObject]@{Age = "30"}
$person.Age -gt 25  # Returns $false (string comparison)

# Problem: method not found
$person = [PSCustomObject]@{Name = "John"}
$person.GetName()  # Method invocation error
```

#### 8.12.2.4 Diagnostic Commands

```powershell
# View object in detail
$person | Format-List *

# Check property types
$person | Get-Member -MemberType NoteProperty | 
    Select-Object Name, TypeName | 
    Format-Table -AutoSize

# Convert to hashtable for inspection
$personHashTable = @{}
$person.PSObject.Properties | ForEach-Object {
    $personHashTable[$_.Name] = $_.Value
}
$personHashTable | Format-Table -AutoSize

# Debug object creation
$person = [PSCustomObject]@{
    "Name" = "John"
    "Age" = 30
    "Debug" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}
$person | Format-List *
```

### 8.12.3 Verifying Hashtable Logic

Systematically verify that hashtable logic works as intended.

#### 8.12.3.1 Key Existence Testing

```powershell
# Test key existence
$hash = @{"Name" = "John"; "Age" = 30}

# Direct access
$hash["Name"] -ne $null  # True
$hash["Age"] -ne $null   # True
$hash["City"] -eq $null  # True

# ContainsKey method
$hash.ContainsKey("Name")  # True
$hash.ContainsKey("City")  # False

# Case sensitivity test
$hash = @{"KEY" = "Value"}
$hash["key"]  # Windows: "Value", Linux: $null
```

#### 8.12.3.2 Value Type Verification

```powershell
# Test value types
$hash = @{
    Name = "John"
    Age = 30
    IsActive = $true
    Scores = @(90, 85, 95)
}

$hash["Name"].GetType().Name  # String
$hash["Age"].GetType().Name   # Int32
$hash["IsActive"].GetType().Name  # Boolean
$hash["Scores"].GetType().Name   # Object[]
```

#### 8.12.3.3 Edge Case Testing

Test unusual or extreme values:

```powershell
# Test with null values
$nullTest = @{Key = $null}
$nullTest["Key"] -eq $null  # True

# Test with empty strings
$emptyTest = @{Key = ""}
$emptyTest["Key"] -eq ""  # True

# Test with different data types as keys
$typeTest = @{}
$typeTest[[int]1] = "Integer"
$typeTest[[string]1] = "String"
$typeTest.Count  # Should be 2 (different keys)
```

### 8.12.4 Verifying Custom Object Logic

Systematically verify that custom object logic works as intended.

#### 8.12.4.1 Property Verification

```powershell
# Test property existence
$person = [PSCustomObject]@{Name = "John"; Age = 30}
$person.PSObject.Properties.Name -contains "Name"  # True
$person.PSObject.Properties.Name -contains "Age"   # True
$person.PSObject.Properties.Name -contains "City"  # False

# Test property values
$person.Name -eq "John"  # True
$person.Age -eq 30       # True
```

#### 8.12.4.2 Method Verification

```powershell
# Test method existence
$person = [PSCustomObject]@{Name = "John"}
$person | Add-Member -MemberType ScriptMethod -Name Greet -Value {
    "Hello, $($this.Name)!"
}

$person.PSObject.Methods.Name -contains "Greet"  # True

# Test method functionality
$person.Greet() -eq "Hello, John!"  # True
```

#### 8.12.4.3 Edge Case Testing

Test unusual or extreme values:

```powershell
# Test with null properties
$person = [PSCustomObject]@{Name = $null; Age = $null}
$person.Name -eq $null  # True
$person.Age -eq $null   # True

# Test with empty objects
$empty = [PSCustomObject]@{}
$empty.PSObject.Properties.Count  # 0

# Test with calculated properties
$person = [PSCustomObject]@{
    FirstName = "John"
    LastName = "Doe"
}
$person | Add-Member -MemberType ScriptProperty -Name FullName -Value {
    "$($this.FirstName) $($this.LastName)"
}

$person.FullName -eq "John Doe"  # True
```

### 8.12.5 Debugging Complex Operations

Complex hashtable and object operations require special debugging techniques.

#### 8.12.5.1 Step-by-Step Evaluation

Break down complex operations:

```powershell
# Original complex operation
$config = @{
    Database = @{
        Server = "db01.example.com"
        Port = 1433
    }
}
$connectionString = "Server={0};Port={1}" -f $config.Database.Server, $config.Database.Port

# Test each component separately
$config.Database
$config.Database.Server
$config.Database.Port
```

#### 8.12.5.2 Intermediate Results

Capture intermediate results:

```powershell
# Complex object transformation
$process = Get-Process -Id $PID
$processInfo = [PSCustomObject]@{
    Name = $process.Name
    Id = $process.Id
    CPU = $process.CPU
    MemoryMB = $process.WorkingSet / 1MB
    StartTime = $process.StartTime.ToString("yyyy-MM-dd HH:mm:ss")
}

# Debug intermediate values
"Process name: $($process.Name)"
"Process ID: $($process.Id)"
"CPU usage: $($process.CPU)"
"Memory usage: $($process.WorkingSet / 1MB) MB"
"Start time: $($process.StartTime.ToString("yyyy-MM-dd HH:mm:ss"))"

# Verify final object
$processInfo | Format-List *
```

#### 8.12.5.3 Debugging Script Blocks

Use `Set-PSDebug` for script block debugging:

```powershell
# Enable tracing
Set-PSDebug -Trace 1

# Run hashtable operation
$hash = @{"Name" = "John"; "Age" = 30}
$hash["Name"]

# Run custom object operation
$person = [PSCustomObject]@{"Name" = "John"; "Age" = 30}
$person.Name

# Disable tracing
Set-PSDebug -Off
```

### 8.12.6 Common Error Messages and Solutions

Understanding common error messages helps resolve hashtable and object issues quickly.

#### 8.12.6.1 "Cannot index into a null array"

**Cause**: Accessing a null hashtable.

**Example**:
```powershell
$hash = $null
$hash["Key"]
```

**Solution**:
```powershell
# Initialize hashtable
$hash = @{}
$hash["Key"] = "Value"

# Check for null
if ($hash) {
    $value = $hash["Key"]
} else {
    $value = $null
}
```

#### 8.12.6.2 "The property 'PropertyName' cannot be found on this object"

**Cause**: Accessing a non-existent property on a custom object.

**Example**:
```powershell
$person = [PSCustomObject]@{Name = "John"}
$person.Age
```

**Solution**:
```powershell
# Check if property exists
if ($person.PSObject.Properties.Name -contains "Age") {
    $age = $person.Age
} else {
    $age = $null
}

# Use default value
$age = if ($person.PSObject.Properties.Name -contains "Age") { $person.Age } else { $null }
```

#### 8.12.6.3 "Cannot convert the "System.Collections.Hashtable" value of type "System.Collections.Hashtable" to type "System.Management.Automation.PSCustomObject""

**Cause**: Incorrect conversion between hashtable and custom object.

**Example**:
```powershell
$hash = @{Name = "John"}
$person = [PSCustomObject]$hash  # Works
$person = [PSCustomObject]$null  # Fails
```

**Solution**:
```powershell
# Safe conversion
$person = if ($hash) { [PSCustomObject]$hash } else { $null }

# Using ConvertTo-Hashtable (PowerShell 7+)
$person = $hash | ConvertTo-Hashtable
```

#### 8.12.6.4 "A hash table can only be added to another hash table"

**Cause**: Incorrect hashtable merging.

**Example**:
```powershell
$hash1 = @{A=1}
$hash2 = @{B=2}
$merged = $hash1 + $hash2  # Works in PowerShell 3.0+
```

**Solution**:
```powershell
# For PowerShell 2.0
$merged = @{}
$hash1.GetEnumerator() | ForEach-Object { $merged[$_.Key] = $_.Value }
$hash2.GetEnumerator() | ForEach-Object { $merged[$_.Key] = $_.Value }

# Using Merge-HashTables function
function Merge-HashTables {
    param(
        [hashtable]$Target,
        [hashtable]$Source
    )
    
    $source.GetEnumerator() | ForEach-Object {
        $Target[$_.Key] = $_.Value
    }
    
    return $Target
}

$merged = Merge-HashTables $hash1 $hash2
```

## 8.13 Advanced Topics

For power users, PowerShell offers advanced techniques for working with hashtables and custom objects.

### 8.13.1 Custom Hashtable Implementations

#### 8.13.1.1 Case-Sensitive Hashtable

```powershell
# Create case-sensitive hashtable
$caseSensitiveHash = [System.Collections.Hashtable]::Synchronized(
    [System.Collections.Hashtable]::new(
        [System.Collections.CaseInsensitiveHashCodeProvider]::Default,
        [System.Collections.CaseInsensitiveComparer]::Default
    )
)

$caseSensitiveHash["Key"] = "Value1"
$caseSensitiveHash["key"] = "Value2"

$caseSensitiveHash.Count  # Returns 2 (case-sensitive)
```

#### 8.13.1.2 Ordered Hashtable

```powershell
# Create ordered hashtable (PowerShell 6+ maintains order by default)
$orderedHash = [ordered]@{
    First = "First value"
    Second = "Second value"
    Third = "Third value"
}

# Alternative for PowerShell 5.1 and earlier
$orderedHash = New-Object System.Collections.Specialized.OrderedDictionary
$orderedHash.Add("First", "First value")
$orderedHash.Add("Second", "Second value")
$orderedHash.Add("Third", "Third value")
```

#### 8.13.1.3 Practical Custom Hashtable Examples

```powershell
# Cache implementation with expiration
class ExpiringCache {
    hidden [hashtable]$cache
    hidden [int]$defaultTtl
    
    ExpiringCache([int]$defaultTtl = 300) {
        $this.cache = @{}
        $this.defaultTtl = $defaultTtl
    }
    
    [void]Add([string]$key, $value, [int]$ttl = -1) {
        $expiration = (Get-Date).AddSeconds(
            if ($ttl -ge 0) { $ttl } else { $this.defaultTtl }
        )
        $this.cache[$key] = [PSCustomObject]@{
            Value = $value
            Expiration = $expiration
        }
    }
    
    [object]Get([string]$key) {
        if (-not $this.cache.Contains($key)) {
            return $null
        }
        
        $entry = $this.cache[$key]
        if ((Get-Date) -gt $entry.Expiration) {
            $this.cache.Remove($key)
            return $null
        }
        
        return $entry.Value
    }
    
    [void]Remove([string]$key) {
        $this.cache.Remove($key)
    }
    
    [void]Clear() {
        $this.cache.Clear()
    }
}

# Usage
$cache = [ExpiringCache]::new(10)  # 10 second TTL
$cache.Add("users", @(1,2,3))
$cache.Get("users")  # Returns @(1,2,3)
Start-Sleep -Seconds 11
$cache.Get("users")  # Returns $null (expired)
```

### 8.13.2 Advanced Custom Object Techniques

#### 8.13.2.1 Dynamic Type Creation

```powershell
# Create dynamic type
$domain = [AppDomain]::CurrentDomain
$assembly = New-Object System.Reflection.Emit.AssemblyName("DynamicTypes")
$builder = $domain.DefineDynamicAssembly($assembly, [System.Reflection.Emit.AssemblyBuilderAccess]::Run)
$module = $builder.DefineDynamicModule("MainModule")

$typeBuilder = $module.DefineType("Person", "Public")
$nameField = $typeBuilder.DefineField("Name", [string], "Public")
$ageField = $typeBuilder.DefineField("Age", [int], "Public")

$type = $typeBuilder.CreateType()

# Create instance
$instance = Activator::CreateInstance($type)
$instance.GetType().InvokeMember("Name", "SetProperty", $null, $instance, @("John"))
$instance.GetType().InvokeMember("Age", "SetProperty", $null, $instance, @(30))

# Use instance
$instance.GetType().InvokeMember("Name", "GetProperty", $null, $instance, $null)  # "John"
$instance.GetType().InvokeMember("Age", "GetProperty", $null, $instance, $null)  # 30
```

#### 8.13.2.2 Object Validation with Validation Attributes

```powershell
# Object validation with attributes
function New-ValidatedObject {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]
        [string]$Name,
        
        [ValidateRange(0, 120)]
        [int]$Age,
        
        [ValidateSet("Male", "Female", "Other")]
        [string]$Gender
    )
    
    [PSCustomObject]@{
        Name = $Name
        Age = $Age
        Gender = $Gender
    }
}

# Usage
try {
    $person = New-ValidatedObject -Name "John" -Age 30 -Gender "Male"
    $person  # Valid object
    
    $invalidPerson = New-ValidatedObject -Name "" -Age 150 -Gender "Unknown"  # Throws validation errors
} catch {
    Write-Error "Validation failed: $_"
}
```

#### 8.13.2.3 Practical Advanced Object Examples

```powershell
# Observable object pattern
class ObservableObject {
    hidden [hashtable]$properties
    hidden [System.Collections.ArrayList]$observers
    
    ObservableObject() {
        $this.properties = @{}
        $this.observers = [System.Collections.ArrayList]::new()
    }
    
    [void]AddProperty([string]$name, $value) {
        $this.properties[$name] = $value
    }
    
    [object]GetProperty([string]$name) {
        return $this.properties[$name]
    }
    
    [void]SetProperty([string]$name, $value) {
        $oldValue = $this.properties[$name]
        $this.properties[$name] = $value
        
        # Notify observers
        $this.observers | ForEach-Object {
            $_.OnPropertyChanged($this, $name, $oldValue, $value)
        }
    }
    
    [void]AddObserver([object]$observer) {
        $null = $this.observers.Add($observer)
    }
}

# Observer interface
class IObserver {
    [void]OnPropertyChanged([ObservableObject]$sender, [string]$propertyName, $oldValue, $newValue) {
        throw [NotImplementedException]::new()
    }
}

# Property change logger
class PropertyLogger : IObserver {
    [void]OnPropertyChanged([ObservableObject]$sender, [string]$propertyName, $oldValue, $newValue) {
        Write-Host "Property '$propertyName' changed from '$oldValue' to '$newValue'"
    }
}

# Usage
$person = [ObservableObject]::new()
$person.AddProperty("Name", "John")
$person.AddProperty("Age", 30)

$logger = [PropertyLogger]::new()
$person.AddObserver($logger)

$person.SetProperty("Name", "John Doe")  # Logs property change
$person.SetProperty("Age", 31)          # Logs property change
```

### 8.13.3 Parallel Processing with Hashtables

#### 8.13.3.1 Thread-Safe Hashtable Access

```powershell
# Thread-safe hashtable
$syncHash = [hashtable]::Synchronized(@{})

1..10 | ForEach-Object -Parallel {
    $id = $_
    $syncHash = $using:syncHash
    
    # Thread-safe access
    $syncHash[$id] = "Value $id"
    Start-Sleep -Milliseconds (Get-Random 100)
    
    # Read back value
    $value = $syncHash[$id]
    [PSCustomObject]@{
        Id = $id
        Value = $value
    }
} -ThrottleLimit 5
```

#### 8.13.3.2 Parallel Data Aggregation

```powershell
# Parallel data aggregation
$syncHash = [hashtable]::Synchronized(@{})

# Initialize counters
"syncHash initialization" | Write-Host
$syncHash["Total"] = 0
$syncHash["Even"] = 0
$syncHash["Odd"] = 0

# Process data in parallel
1..100 | ForEach-Object -Parallel {
    $id = $_
    $syncHash = $using:syncHash
    
    # Update counters
    $syncHash.SyncRoot.Lock()
    try {
        $syncHash["Total"]++
        if ($id % 2 -eq 0) {
            $syncHash["Even"]++
        } else {
            $syncHash["Odd"]++
        }
    } finally {
        $syncHash.SyncRoot.Unlock()
    }
    
    # Return individual result
    [PSCustomObject]@{
        Id = $id
        IsEven = ($id % 2 -eq 0)
    }
} -ThrottleLimit 10 | Sort-Object Id | Format-Table -AutoSize

# Display aggregated results
[PSCustomObject]@{
    Total = $syncHash["Total"]
    Even = $syncHash["Even"]
    Odd = $syncHash["Odd"]
} | Format-List *
```

#### 8.13.3.3 Practical Parallel Processing Examples

```powershell
# Parallel system inventory
$syncHash = [hashtable]::Synchronized(@{})

# Initialize results
$syncHash["Computers"] = [System.Collections.ArrayList]::new()
$syncHash["Errors"] = [System.Collections.ArrayList]::new()

# Get list of computers
$computers = "localhost", $env:COMPUTERNAME  # Add more computers as needed

# Gather inventory in parallel
$computers | ForEach-Object -Parallel {
    $computer = $_
    $syncHash = $using:syncHash
    
    try {
        # Gather system information
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ComputerName $computer
        $cpu = Get-CimInstance -ClassName Win32_Processor -ComputerName $computer
        $memory = Get-CimInstance -ClassName Win32_ComputerSystem -ComputerName $computer
        
        # Create inventory object
        $inventory = [PSCustomObject]@{
            ComputerName = $computer
            OS = $os.Caption
            CPU = $cpu.Name
            MemoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB)
            LastBoot = $os.LastBootUpTime
        }
        
        # Add to results
        $syncHash.SyncRoot.Lock()
        try {
            $null = $syncHash["Computers"].Add($inventory)
        } finally {
            $syncHash.SyncRoot.Unlock()
        }
    } catch {
        # Record error
        $errorRecord = [PSCustomObject]@{
            Computer = $computer
            Error = $_.Exception.Message
        }
        
        $syncHash.SyncRoot.Lock()
        try {
            $null = $syncHash["Errors"].Add($errorRecord)
        } finally {
            $syncHash.SyncRoot.Unlock()
        }
    }
} -ThrottleLimit 5

# Display results
"Inventory Results:" | Write-Host
$syncHash["Computers"] | Format-Table -AutoSize

if ($syncHash["Errors"].Count -gt 0) {
    "Errors:" | Write-Host
    $syncHash["Errors"] | Format-Table -AutoSize
}
```

### 8.13.4 Custom Object Serialization Extensions

#### 8.13.4.1 Custom ConvertTo-Hashtable Function

```powershell
# Enhanced ConvertTo-Hashtable function
function ConvertTo-Hashtable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        $InputObject,
        
        [switch]$Depth,
        [int]$MaxDepth = 5,
        [int]$CurrentDepth = 0
    )
    
    process {
        if ($CurrentDepth -ge $MaxDepth) {
            return $InputObject
        }
        
        if ($InputObject -is [hashtable]) {
            $result = @{}
            $InputObject.GetEnumerator() | ForEach-Object {
                $result[$_.Key] = ConvertTo-Hashtable $_.Value -Depth -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            }
            return $result
        }
        
        if ($InputObject -is [System.Collections.IDictionary]) {
            $result = @{}
            $InputObject.Keys | ForEach-Object {
                $result[$_] = ConvertTo-Hashtable $InputObject[$_] -Depth -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            }
            return $result
        }
        
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
            return $InputObject | ForEach-Object {
                ConvertTo-Hashtable $_ -Depth -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            }
        }
        
        if ($InputObject -is [psobject]) {
            $result = @{}
            $InputObject | Get-Member -MemberType NoteProperty, Property | ForEach-Object {
                $result[$_.Name] = ConvertTo-Hashtable $InputObject.($_.Name) -Depth -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            }
            return $result
        }
        
        return $InputObject
    }
}

# Usage
$process = Get-Process -Id $PID
$processHash = $process | ConvertTo-Hashtable -Depth
$processHash | ConvertTo-Json | Out-File process.json
```

#### 8.13.4.2 Custom ConvertFrom-Hashtable Function

```powershell
# Enhanced ConvertFrom-Hashtable function
function ConvertFrom-Hashtable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        $InputObject,
        
        [switch]$Depth,
        [int]$MaxDepth = 5,
        [int]$CurrentDepth = 0
    )
    
    process {
        if ($CurrentDepth -ge $MaxDepth) {
            return $InputObject
        }
        
        if ($InputObject -is [hashtable]) {
            $result = [PSCustomObject]@{}
            $InputObject.GetEnumerator() | ForEach-Object {
                $result | Add-Member -MemberType NoteProperty -Name $_.Key -Value (
                    ConvertFrom-Hashtable $_.Value -Depth -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
                ) -Force
            }
            return $result
        }
        
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
            return $InputObject | ForEach-Object {
                ConvertFrom-Hashtable $_ -Depth -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
            }
        }
        
        return $InputObject
    }
}

# Usage
$processJson = Get-Content process.json | ConvertFrom-Json
$processObj = $processJson | ConvertFrom-Hashtable -Depth
$processObj | Format-List *
```

#### 8.13.4.3 Practical Serialization Extensions

```powershell
# Type-aware serialization
class TypeAwareSerializer {
    static [string]Serialize($obj) {
        $typeInfo = @{
            Type = $obj.GetType().FullName
            Value = $obj
        }
        return $typeInfo | ConvertTo-Json -Depth 10
    }
    
    static [object]Deserialize($json) {
        $typeInfo = $json | ConvertFrom-Json
        return [TypeAwareSerializer]::CreateInstance($typeInfo.Type, $typeInfo.Value)
    }
    
    static [object]CreateInstance([string]$typeName, $value) {
        switch ($typeName) {
            "System.DateTime" {
                return [datetime]$value
            }
            "System.Collections.Hashtable" {
                $result = @{}
                $value.PSObject.Properties | ForEach-Object {
                    $result[$_.Name] = [TypeAwareSerializer]::CreateInstance(
                        $_.Value.Type, 
                        $_.Value.Value
                    )
                }
                return $result
            }
            "System.Management.Automation.PSCustomObject" {
                $result = [PSCustomObject]@{}
                $value.PSObject.Properties | ForEach-Object {
                    $result | Add-Member -MemberType NoteProperty -Name $_.Name -Value (
                        [TypeAwareSerializer]::CreateInstance($_.Value.Type, $_.Value.Value)
                    )
                }
                return $result
            }
            default {
                return $value
            }
        }
    }
}

# Usage
$complexObject = [PSCustomObject]@{
    Name = "John Doe"
    BirthDate = (Get-Date).AddYears(-30)
    Settings = @{
        Theme = "Dark"
        FontSize = 12
    }
}

# Serialize
$serialized = [TypeAwareSerializer]::Serialize($complexObject)
$serialized | Out-File complex.json

# Deserialize
$deserialized = [TypeAwareSerializer]::Deserialize(
    (Get-Content complex.json | ConvertFrom-Json)
)

# Verify
$deserialized | Format-List *
$deserialized.BirthDate.GetType().Name  # "DateTime"
```

## 8.14 Practical Exercises

Apply your knowledge of hashtables and custom objects with these hands-on exercises of varying difficulty.

### 8.14.1 Basic Exercises

#### 8.14.1.1 Hashtable Basics

1. Create a hashtable with your name, age, and city
2. Access each value using both dot notation and bracket notation
3. Add a new key-value pair for your country
4. Remove the city key-value pair

Solutions:
```powershell
# 1
$person = @{
    Name = "Your Name"
    Age = 30
    City = "Your City"
}

# 2
$person.Name
$person["Name"]
$person.Age
$person["Age"]
$person.City
$person["City"]

# 3
$person.Country = "Your Country"
# or
$person["Country"] = "Your Country"

# 4
$person.Remove("City")
# or
$null = $person.Remove("City")
```

#### 8.14.1.2 Custom Object Basics

1. Create a custom object with your name, age, and city
2. Access each property
3. Add a new property for your country
4. Verify the object has all expected properties

Solutions:
```powershell
# 1
$person = [PSCustomObject]@{
    Name = "Your Name"
    Age = 30
    City = "Your City"
}

# 2
$person.Name
$person.Age
$person.City

# 3
$person | Add-Member -MemberType NoteProperty -Name Country -Value "Your Country"
# or
$person.Country = "Your Country"

# 4
$person | Get-Member -MemberType NoteProperty
```

#### 8.14.1.3 Conversion Basics

1. Convert the hashtable from exercise 1 to a custom object
2. Convert the custom object from exercise 2 to a hashtable
3. Convert both to JSON and back
4. Verify the converted objects match the originals

Solutions:
```powershell
# 1
$personObj = [PSCustomObject]$personHash

# 2
$personHash = @{}
$personObj.PSObject.Properties | ForEach-Object {
    $personHash[$_.Name] = $_.Value
}

# 3
$jsonFromHash = $personHash | ConvertTo-Json
$recoveredHash = $jsonFromHash | ConvertFrom-Json | ConvertTo-Hashtable

$jsonFromObj = $personObj | ConvertTo-Json
$recoveredObj = $jsonFromObj | ConvertFrom-Json

# 4
Compare-Object $personHash $recoveredHash
Compare-Object ($personObj | ConvertTo-Hashtable) ($recoveredObj | ConvertTo-Hashtable)
```

### 8.14.2 Intermediate Exercises

#### 8.14.2.1 Process Information

1. Create a hashtable of process information (name, ID, CPU, memory)
2. Convert the hashtable to a custom object
3. Add a calculated property for memory in MB
4. Sort the objects by memory usage and display the top 5

Solutions:
```powershell
# 1
$processHash = @{}
Get-Process | ForEach-Object {
    $processHash[$_.Id] = @{
        Name = $_.Name
        CPU = $_.CPU
        WorkingSet = $_.WorkingSet
    }
}

# 2
$processObjects = $processHash.GetEnumerator() | ForEach-Object {
    [PSCustomObject]@{
        Id = $_.Key
        Name = $_.Value.Name
        CPU = $_.Value.CPU
        WorkingSet = $_.Value.WorkingSet
    }
}

# 3
$processObjects | ForEach-Object {
    $_ | Add-Member -MemberType NoteProperty -Name MemoryMB -Value ($_.WorkingSet / 1MB) -PassThru
}

# 4
$processObjects | 
    Sort-Object MemoryMB -Descending | 
    Select-Object -First 5 | 
    Format-Table Name, Id, CPU, MemoryMB -AutoSize
```

#### 8.14.2.2 File System Analysis

1. Create custom objects for files in your Documents folder
2. Add calculated properties for size in KB and age in days
3. Group the objects by file extension
4. Calculate statistics for each group (count, total size, average size)

Solutions:
```powershell
# 1
$files = Get-ChildItem $HOME\Documents -File | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Name
        FullName = $_.FullName
        Length = $_.Length
        LastWriteTime = $_.LastWriteTime
        Extension = $_.Extension
    }
}

# 2
$files | ForEach-Object {
    $_ | Add-Member -MemberType NoteProperty -Name SizeKB -Value ($_.Length / 1KB) -PassThru |
        Add-Member -MemberType NoteProperty -Name AgeDays -Value (
            ((Get-Date) - $_.LastWriteTime).Days
        ) -PassThru
}

# 3
$groups = $files | Group-Object Extension

# 4
$groups | ForEach-Object {
    [PSCustomObject]@{
        Extension = $_.Name
        Count = $_.Count
        TotalSizeMB = ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        AvgSizeKB = ($_.Group | Measure-Object SizeKB -Average).Average
    }
} | Sort-Object TotalSizeMB -Descending | Format-Table -AutoSize
```

#### 8.14.2.3 Parameter Splatting

1. Create a hashtable for Copy-Item parameters
2. Add Path, Destination, and Force parameters
3. Execute Copy-Item with the splatted parameters
4. Add error handling to the splatting operation

Solutions:
```powershell
# 1
$copyParams = @{}

# 2
$copyParams["Path"] = "$HOME\Documents\*"
$copyParams["Destination"] = "$HOME\Backup\"
$copyParams["Force"] = $true

# 3
try {
    Copy-Item @copyParams -ErrorAction Stop
} catch {
    Write-Error "Copy failed: $_"
}

# 4
# Verify parameters before execution
$validParams = (Get-Command Copy-Item).Parameters.Keys
$invalid = $copyParams.Keys | Where-Object { $validParams -notcontains $_ }
if ($invalid) {
    throw "Invalid parameters: $($invalid -join ', ')"
}

# Verify path exists
if (-not (Test-Path $copyParams.Path)) {
    throw "Source path does not exist: $($copyParams.Path)"
}

# Verify destination directory exists or can be created
if (-not (Test-Path $copyParams.Destination)) {
    try {
        $null = New-Item -Path $copyParams.Destination -ItemType Directory -ErrorAction Stop
    } catch {
        throw "Failed to create destination directory: $_"
    }
}

# Execute with error handling
try {
    Copy-Item @copyParams -ErrorAction Stop
    Write-Host "Copy completed successfully" -ForegroundColor Green
} catch {
    Write-Error "Copy failed: $_"
}
```

### 8.14.3 Advanced Exercises

#### 8.14.3.1 Performance Optimization

1. Optimize this hashtable creation for large datasets:
   ```powershell
   $hash = @{}
   1..100000 | ForEach-Object {
       $hash["Key$_"] = "Value$_"
   }
   ```

2. Optimize this custom object creation for large datasets:
   ```powershell
   $objects = 1..100000 | ForEach-Object {
       [PSCustomObject]@{
           Id = $_
           Value = "Value$_"
           Status = if ($_ % 2 -eq 0) { "Active" } else { "Inactive" }
       }
   }
   ```

3. Optimize this parameter splatting operation:
   ```powershell
   1..10000 | ForEach-Object {
       $params = @{
           Path = "C:\file$_"
           Destination = "D:\backup\"
           Force = $true
       }
       Copy-Item @params
   }
   ```

Solutions:
```powershell
# 1
# Pre-allocate hashtable capacity
$hash = [hashtable]::new(100000)
1..100000 | ForEach-Object {
    $hash["Key$_"] = "Value$_"
}

# 2
# Use ArrayList for better performance
$objects = [System.Collections.ArrayList]::new(100000)
1..100000 | ForEach-Object {
    $null = $objects.Add([PSCustomObject]@{
        Id = $_
        Value = "Value$_"
        Status = if ($_ % 2 -eq 0) { "Active" } else { "Inactive" }
    })
}

# 3
# Reuse parameter hashtable
$baseParams = @{
    Destination = "D:\backup\"
    Force = $true
}
1..10000 | ForEach-Object {
    $params = $baseParams.Clone()
    $params["Path"] = "C:\file$_"
    Copy-Item @params
}
```

#### 8.14.3.2 Complex Data Transformation

1. Transform process data into a nested structure by company and priority class
2. Calculate statistics for each group (count, average CPU, total memory)
3. Convert the structure to JSON with proper formatting
4. Load the JSON back into PowerShell objects

Solutions:
```powershell
# 1
$processData = Get-Process | 
    Where-Object Company -ne $null | 
    Group-Object Company | 
    ForEach-Object {
        $company = $_.Name
        $_.Group | 
            Group-Object PriorityClass | 
            ForEach-Object {
                [PSCustomObject]@{
                    Company = $company
                    PriorityClass = $_.Name
                    Processes = $_.Group | ForEach-Object {
                        [PSCustomObject]@{
                            Name = $_.Name
                            Id = $_.Id
                            CPU = $_.CPU
                            MemoryMB = $_.WorkingSet / 1MB
                        }
                    }
                }
            }
    }

# 2
$stats = $processData | ForEach-Object {
    [PSCustomObject]@{
        Company = $_.Company
        PriorityClass = $_.PriorityClass
        ProcessCount = $_.Processes.Count
        AvgCPU = ($_.Processes | Measure-Object CPU -Average).Average
        TotalMemoryMB = ($_.Processes | Measure-Object MemoryMB -Sum).Sum
    }
}

# 3
$json = $stats | ConvertTo-Json -Depth 10 -Compress
$json | Out-File process_stats.json

# 4
$recoveredStats = Get-Content process_stats.json | ConvertFrom-Json
$recoveredStats | Format-Table Company, PriorityClass, ProcessCount, 
    @{Name="AvgCPU";Expression={"{0:N2}" -f $_.AvgCPU}},
    @{Name="TotalMemoryMB";Expression={"{0:N2}" -f $_.TotalMemoryMB}} -AutoSize
```

#### 8.14.3.3 Advanced Reporting

1. Create a system health dashboard with multiple data sections
2. Use hashtables for configuration and parameter splatting
3. Implement custom object methods for data analysis
4. Format the report with custom formatting

Solutions:
```powershell
# 1
$dashboard = @{
    System = @{
        Name = $env:COMPUTERNAME
        OS = (Get-CimInstance Win32_OperatingSystem).Caption
        Uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    }
    CPU = @{
        Usage = (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue
        Count = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
    }
    Memory = @{
        TotalGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
        AvailableGB = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB)
        PercentUsed = [math]::Round(
            100 - ($dashboard.Memory.AvailableGB / $dashboard.Memory.TotalGB * 100), 1
        )
    }
    Storage = Get-PSDrive -PSProvider FileSystem | ForEach-Object {
        @{
            Drive = $_.Name
            UsedGB = [math]::Round(($_.Used / 1GB), 2)
            FreeGB = [math]::Round(($_.Free / 1GB), 2)
            TotalGB = [math]::Round(($_.Used + $_.Free) / 1GB, 2)
            PercentFree = [math]::Round(($_.Free / ($_.Used + $_.Free)) * 100, 1)
            Status = if ($_.Free / ($_.Used + $_.Free) -lt 0.1) { "Critical" }
                     elseif ($_.Free / ($_.Used + $_.Free) -lt 0.2) { "Warning" }
                     else { "OK" }
        }
    }
    Services = @{
        Total = (Get-Service).Count
        Running = (Get-Service | Where-Object Status -eq "Running").Count
        Stopped = (Get-Service | Where-Object Status -eq "Stopped").Count
        HealthPercent = [math]::Round(($dashboard.Services.Running / $dashboard.Services.Total) * 100, 1)
        Status = if ($dashboard.Services.HealthPercent -eq 100) { "Healthy" }
                 elseif ($dashboard.Services.HealthPercent -ge 90) { "Warning" }
                 else { "Critical" }
    }
}

# 2
# Parameter splatting for report generation
$reportParams = @{
    Path = "C:\Reports\system_health_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    Title = "System Health Report - $($env:COMPUTERNAME)"
    PreContent = "<h1>System Health Dashboard</h1>"
    PostContent = "<p>Generated on $(Get-Date)</p>"
}

# 3
# Convert to custom objects with methods
$systemObj = [PSCustomObject]$dashboard.System
$systemObj | Add-Member -MemberType ScriptMethod -Name GetUptime -Value {
    "{0:D2}d {1:D2}h {2:D2}m" -f 
        $this.Uptime.Days,
        $this.Uptime.Hours,
        $this.Uptime.Minutes
} -PassThru |
Add-Member -MemberType ScriptMethod -Name GetHealthStatus -Value {
    if ($this.Uptime.Days -gt 30) { "Warning: Long uptime" }
    else { "Healthy" }
}

# 4
# Custom report formatting
$reportContent = @(
    "<h2>System Information</h2>",
    "<ul>",
    "<li>Computer Name: $($systemObj.Name)</li>",
    "<li>Operating System: $($systemObj.OS)</li>",
    "<li>Uptime: $($systemObj.GetUptime())</li>",
    "<li>Status: $($systemObj.GetHealthStatus())</li>",
    "</ul>",
    
    "<h2>CPU Usage</h2>",
    "<ul>",
    "<li>Usage: {0:N2}%</li>" -f $dashboard.CPU.Usage,
    "<li>Logical Processors: $($dashboard.CPU.Count)</li>",
    "</ul>",
    
    "<h2>Memory</h2>",
    "<ul>",
    "<li>Total: $($dashboard.Memory.TotalGB) GB</li>",
    "<li>Available: $($dashboard.Memory.AvailableGB) GB</li>",
    "<li>Used: {0:N1}%</li>" -f $dashboard.Memory.PercentUsed,
    "</ul>",
    
    "<h2>Storage</h2>",
    "<table border='1'>",
    "<tr><th>Drive</th><th>Used (GB)</th><th>Free (GB)</th><th>Total (GB)</th><th>Status</th></tr>",
    $dashboard.Storage | ForEach-Object {
        "<tr>",
        "<td>$($_.Drive)</td>",
        "<td>$($_.UsedGB)</td>",
        "<td>$($_.FreeGB)</td>",
        "<td>$($_.TotalGB)</td>",
        "<td>$($_.Status)</td>",
        "</tr>"
    },
    "</table>",
    
    "<h2>Services</h2>",
    "<ul>",
    "<li>Total: $($dashboard.Services.Total)</li>",
    "<li>Running: $($dashboard.Services.Running)</li>",
    "<li>Stopped: $($dashboard.Services.Stopped)</li>",
    "<li>Health: {0:N1}% - $($dashboard.Services.Status)</li>" -f $dashboard.Services.HealthPercent,
    "</ul>"
)

# Generate report
$reportContent | Out-File @reportParams
```

## 8.15 Summary

In this comprehensive chapter, you've gained deep knowledge of working with hashtables and custom objects in PowerShell:

- Understood the fundamental principles of hashtables and custom objects versus traditional text processing
- Mastered the syntax and usage patterns of hashtables for efficient data storage and retrieval
- Learned techniques for creating and manipulating custom objects
- Discovered conversion patterns between hashtables, custom objects, and other data structures
- Gained insights into using hashtables for configuration and parameter splatting
- Explored advanced techniques for object manipulation and transformation
- Learned performance considerations and optimization strategies for large data structures
- Explored real-world scenarios across configuration management, data transformation, and parameter management
- Identified and learned to avoid common mistakes and pitfalls
- Acquired troubleshooting techniques for diagnosing complex data structure issues
- Explored advanced topics like custom hashtable implementations, parallel processing, and serialization extensions

You now have the knowledge and skills to create rich, structured data representations that enhance your PowerShell scripts' flexibility, readability, and maintainability. Hashtables and custom objects are foundational tools that enable you to build sophisticated automation solutions and work effectively with complex data.

## 8.16 Next Steps Preview: Chapter 9 – Error Handling and Script Robustness

In the next chapter, we'll explore error handling and techniques for making your PowerShell scripts robust and resilient. You'll learn:

- Understanding PowerShell's error handling system (terminating vs. non-terminating errors)
- Using Try/Catch/Finally blocks for structured error handling
- Working with the $Error automatic variable
- Creating custom error records
- Using -ErrorAction and -ErrorVariable parameters effectively
- Implementing retry logic for transient failures
- Writing defensive code to prevent errors
- Logging and reporting errors effectively
- Testing error handling scenarios
- Common pitfalls and how to avoid them

You'll gain the ability to create scripts that handle errors gracefully, provide meaningful feedback, and recover from failures - essential skills for production-quality PowerShell code.