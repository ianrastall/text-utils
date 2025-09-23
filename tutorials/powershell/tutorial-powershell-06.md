# 6. Sorting and Measuring with Sort-Object & Measure-Object

After filtering and selecting data, the next critical steps in data processing are sorting and measurement. Sorting organizes data in meaningful sequences, while measurement extracts statistical insights. Together, these operations transform raw data into actionable information. This chapter provides a comprehensive guide to sorting and measuring objects in PowerShell, covering both fundamental concepts and advanced techniques.

This chapter covers:
- The fundamental principles of sorting and measurement in PowerShell
- Detailed syntax and usage patterns for `Sort-Object` and `Measure-Object`
- Advanced sorting techniques including multi-property sorting and custom sort logic
- Statistical measurement capabilities including min, max, average, sum, and standard deviation
- Performance considerations for large datasets
- Real-world sorting and measurement scenarios across different domains
- Common mistakes and how to avoid them
- Troubleshooting techniques for complex sorting and measurement operations
- Practical exercises to reinforce learning

By the end of this chapter, you'll be able to organize and analyze data effectively, transforming raw information into meaningful insights that drive better decision-making and automation.

## 6.1 Understanding Sorting and Measurement in PowerShell

Sorting and measurement are essential operations in data analysis. While traditional shells often rely on external tools like `sort` and `awk` for these tasks, PowerShell provides native cmdlets that work directly with objects, making these operations more powerful and integrated.

### 6.1.1 The Importance of Sorting and Measurement

Sorting and measurement serve several critical purposes in PowerShell:

1. **Data organization**: Arranging data in meaningful sequences for better comprehension
2. **Pattern recognition**: Identifying trends and anomalies through statistical analysis
3. **Decision support**: Providing quantitative insights for informed decision-making
4. **Report generation**: Structuring data for documentation and presentation
5. **Performance optimization**: Identifying bottlenecks through resource analysis
6. **Data validation**: Verifying data integrity through statistical checks

Consider this real-world example: analyzing process resource usage.

**Without sorting and measurement**:
```powershell
Get-Process | Select-Object Name, Id, CPU, WorkingSet
```

This outputs data in arbitrary order with no statistical context.

**With sorting and measurement**:
```powershell
Get-Process | 
    Sort-Object WorkingSet -Descending | 
    Select-Object -First 10 | 
    Format-Table Name, Id, 
        @{Name="CPU";Expression={"{0:N2}%" -f $_.CPU}},
        @{Name="MemoryMB";Expression={"{0:N2}" -f ($_.WorkingSet / 1MB)}}

(Get-Process | Measure-Object WorkingSet -Average -Maximum).Average / 1MB
```

This provides:
- Top resource consumers in descending order
- Formatted values for readability
- Contextual statistical information

### 6.1.2 Sorting and Measurement vs. Traditional Shell Approaches

Traditional shells like Bash rely on external tools for sorting and measurement:

```bash
ps aux | sort -k4 -nr | head -n 11 | awk '{printf "%s (%.2f MB)\n", $11, $6/1024}'
```

This approach has significant limitations:

1. **Fragility**: Depends on specific column positions and output formatting
2. **Locale sensitivity**: Behaves differently with different number formats
3. **Type ambiguity**: Treats all data as strings, requiring manual conversion
4. **Tool dependency**: Requires multiple external tools (sort, awk, head)
5. **Limited statistical capabilities**: Basic min/max/average only

PowerShell's object-based approach avoids these issues:

```powershell
Get-Process | 
    Sort-Object WorkingSet -Descending | 
    Select-Object -First 10 | 
    Select-Object Name, 
        @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}}
```

This approach:
- Directly references named properties
- Understands data types (numeric, string, date)
- Provides rich statistical capabilities
- Works consistently across different data sources
- Enables complex sorting and measurement patterns

### 6.1.3 PowerShell's Object-Based Approach

PowerShell sorting and measurement work with structured objects rather than text streams:

```
┌─────────────┐     ┌───────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Data Source │────▶│ Sort-Object       │────▶│ Measure-Object   │────▶│ Organized    │
│ (Objects)   │     │ (Sort Data)       │     │ (Analyze Data)   │     │ Insights     │
└─────────────┘     └───────────────────┘     └──────────────────┘     └──────────────┘
```

Key advantages:
- **Type awareness**: Understands numeric, string, and date values
- **Property access**: Directly references object properties
- **Streaming**: Processes one object at a time, minimizing memory usage
- **Consistency**: Same approach works across different data sources
- **Rich statistics**: Provides comprehensive statistical analysis

This object-oriented approach enables sophisticated data organization and analysis patterns that would be extremely difficult with text-based tools.

## 6.2 Introduction to Sort-Object

`Sort-Object` is PowerShell's primary cmdlet for sorting objects in the pipeline based on specified properties.

### 6.2.1 Basic Syntax and Structure

`Sort-Object` has several usage patterns:

#### 6.2.1.1 Basic Property Sorting

```powershell
# Sort processes by name (ascending)
Get-Process | Sort-Object Name

# Sort processes by memory usage (descending)
Get-Process | Sort-Object WorkingSet -Descending
```

#### 6.2.1.2 Multi-Property Sorting

```powershell
# Sort by CPU descending, then by memory descending
Get-Process | Sort-Object CPU -Descending, WorkingSet -Descending
```

#### 6.2.1.3 Case-Sensitive Sorting

```powershell
# Case-sensitive sort
Get-Process | Sort-Object Name -CaseSensitive
```

#### 6.2.1.4 Unique Sorting

```powershell
# Sort and return only unique values
Get-Process | Sort-Object Name -Unique
```

### 6.2.2 Positional Parameters

`Sort-Object` accepts property names positionally:

```powershell
# Equivalent to: Sort-Object Name
Get-Process | Sort-Object Name

# Equivalent to: Sort-Object CPU -Descending
Get-Process | Sort-Object CPU Descending
```

This positional flexibility improves typing efficiency but can reduce script clarity, especially with complex sorting.

### 6.2.3 Sorting Order

#### 6.2.3.1 Ascending vs. Descending Order

By default, `Sort-Object` sorts in ascending order:

```powershell
# Ascending (default)
Get-Process | Sort-Object CPU

# Descending
Get-Process | Sort-Object CPU -Descending
```

#### 6.2.3.2 Custom Sort Order

For custom sort orders, use calculated properties:

```powershell
# Custom priority order
Get-Service | Sort-Object {
    switch ($_.Status) {
        "Running" { 1 }
        "Stopped" { 2 }
        "Paused" { 3 }
        default { 4 }
    }
}
```

### 6.2.4 Comparison with Other Sorting Methods

PowerShell offers multiple approaches for sorting data.

#### 6.2.4.1 Sort-Object vs. Array Sorting

PowerShell arrays have a `Sort()` method, but it has limitations:

```powershell
# Array sort method (less flexible)
$processes = Get-Process
[Array]::Sort($processes, [System.Comparison[object]]{
    param($a, $b)
    $a.CPU.CompareTo($b.CPU)
})

# Sort-Object (more flexible)
Get-Process | Sort-Object CPU
```

`Sort-Object` is generally preferred because:
- Works with the pipeline
- Handles complex sorting more elegantly
- Supports calculated properties
- More readable for most scenarios

#### 6.2.4.2 Sort-Object vs. IndexOf Sorting

For specialized sorting needs, you might use `IndexOf`:

```powershell
# Sort by custom priority list
$priorities = "Critical", "High", "Medium", "Low"
Get-Alerts | Sort-Object { $priorities.IndexOf($_.Priority) }
```

This approach is useful for custom sort orders but less efficient for large datasets.

## 6.3 Basic Sorting Techniques

Understanding basic sorting techniques is essential before moving to more advanced scenarios.

### 6.3.1 Sorting by Single Property

#### 6.3.1.1 Numeric Properties

```powershell
# Sort processes by CPU usage (ascending)
Get-Process | Sort-Object CPU

# Sort processes by memory usage (descending)
Get-Process | Sort-Object WorkingSet -Descending
```

Numeric sorting follows numerical value, not string representation.

#### 6.3.1.2 String Properties

```powershell
# Sort processes by name (ascending)
Get-Process | Sort-Object Name

# Sort processes by name (descending)
Get-Process | Sort-Object Name -Descending
```

String sorting follows alphabetical order, with case-insensitivity by default.

#### 6.3.1.3 Date Properties

```powershell
# Sort files by last write time (oldest first)
Get-ChildItem | Sort-Object LastWriteTime

# Sort files by last write time (newest first)
Get-ChildItem | Sort-Object LastWriteTime -Descending
```

Date sorting follows chronological order.

### 6.3.2 Case Sensitivity in Sorting

#### 6.3.2.1 Case-Insensitive Sorting (Default)

```powershell
# Case-insensitive sort (default)
"banana", "Apple", "cherry" | Sort-Object
# Result: Apple, banana, cherry
```

#### 6.3.2.2 Case-Sensitive Sorting

```powershell
# Case-sensitive sort
"banana", "Apple", "cherry" | Sort-Object -CaseSensitive
# Result: Apple, banana, cherry (same as above on Windows)
# On Linux: Apple, banana, cherry (different behavior)
```

Case sensitivity behavior varies by platform:
- Windows: Generally case-insensitive file systems
- Linux/macOS: Case-sensitive file systems

#### 6.3.2.3 Practical Case Sensitivity Examples

```powershell
# Processes sorted case-sensitively by name
Get-Process | Sort-Object Name -CaseSensitive

# Files sorted case-sensitively by name
Get-ChildItem | Sort-Object Name -CaseSensitive

# Services sorted case-insensitively by display name
Get-Service | Sort-Object DisplayName
```

### 6.3.3 Sorting with Unique Values

#### 6.3.3.1 Basic Unique Sorting

```powershell
# Unique process names (sorted)
Get-Process | Sort-Object Name -Unique
```

This combines sorting with uniqueness, returning only the first occurrence of each value.

#### 6.3.3.2 Multi-Property Uniqueness

```powershell
# Unique combinations of name and ID (sorted)
Get-Process | Sort-Object Name, Id -Unique
```

The uniqueness is determined by the combination of specified properties.

#### 6.3.3.3 Practical Unique Sorting Examples

```powershell
# Unique user accounts (sorted)
Get-Process -IncludeUserName | Sort-Object UserName -Unique

# Unique file extensions (sorted)
Get-ChildItem | Sort-Object Extension -Unique

# Unique remote IP addresses (sorted)
Get-NetTCPConnection | Sort-Object RemoteAddress -Unique
```

### 6.3.4 Sorting Pipeline Data

#### 6.3.4.1 Basic Pipeline Sorting

```powershell
# Sort processes by CPU, then select top 5
Get-Process | 
    Sort-Object CPU -Descending | 
    Select-Object -First 5
```

Sorting should typically occur after filtering but before selection and subsetting.

#### 6.3.4.2 Order of Operations

Optimal pipeline order for performance:
1. Server-side filtering (cmdlet parameters)
2. Client-side filtering (`Where-Object`)
3. Sorting (`Sort-Object`)
4. Property selection (`Select-Object`)
5. Object subsetting (`-First`, `-Last`, `-Skip`)

```powershell
# Optimal order
Get-Process | 
    Where-Object CPU -gt 50 | 
    Sort-Object WorkingSet -Descending | 
    Select-Object Name, Id, CPU, 
        @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}} | 
    Select-Object -First 10
```

## 6.4 Advanced Sorting Techniques

Beyond basic property sorting, `Sort-Object` supports sophisticated sorting patterns.

### 6.4.1 Multi-Property Sorting

#### 6.4.1.1 Basic Multi-Property Sorting

```powershell
# Sort by CPU descending, then by memory descending
Get-Process | Sort-Object CPU -Descending, WorkingSet -Descending
```

Objects are first sorted by the primary property, then by the secondary property within groups of identical primary values.

#### 6.4.1.2 Different Sort Orders per Property

```powershell
# Sort by name ascending, then by CPU descending
Get-Process | Sort-Object Name, @{Expression="CPU"; Descending=$true}
```

#### 6.4.1.3 Practical Multi-Property Examples

```powershell
# Sort services by status (running first), then by name
Get-Service | Sort-Object @{Expression={if ($_.Status -eq "Running") {0} else {1}}}, Name

# Sort files by directory (ascending), then by size (descending)
Get-ChildItem -Recurse | 
    Sort-Object DirectoryName, 
        @{Expression="Length"; Descending=$true}

# Sort network connections by local port (ascending), then remote address (ascending)
Get-NetTCPConnection | 
    Sort-Object LocalPort, RemoteAddress
```

### 6.4.2 Calculated Property Sorting

#### 6.4.2.1 Basic Calculated Property Sorting

```powershell
# Sort processes by memory usage in MB
Get-Process | Sort-Object @{Expression={($_.WorkingSet / 1MB)}}
```

#### 6.4.2.2 Complex Calculated Sorting

```powershell
# Sort files by age (newest first)
Get-ChildItem | 
    Sort-Object @{Expression={((Get-Date) - $_.LastWriteTime).TotalDays}} -Descending
```

#### 6.4.2.3 Practical Calculated Sorting Examples

```powershell
# Sort processes by CPU to memory ratio
Get-Process | 
    Sort-Object @{Expression={if ($_.WorkingSet -gt 0) { $_.CPU / ($_.WorkingSet / 1MB) } else { 0 }}}

# Sort files by size with units
Get-ChildItem | 
    Sort-Object @{Expression={
        $size = $_.Length
        if ($size -gt 1GB) { $size / 1GB }
        elseif ($size -gt 1MB) { $size / 1MB }
        elseif ($size -gt 1KB) { $size / 1KB }
        else { $size }
    }}

# Sort event log entries by severity
Get-WinEvent -LogName System -MaxEvents 100 | 
    Sort-Object @{Expression={
        switch ($_.Level) {
            1 { 0 }  # Critical
            2 { 1 }  # Error
            3 { 2 }  # Warning
            4 { 3 }  # Information
            default { 4 }
        }
    }}
```

### 6.4.3 Custom Sort Logic with Script Blocks

#### 6.4.3.1 Basic Custom Sorting

```powershell
# Sort processes by name length
Get-Process | Sort-Object { $_.Name.Length }
```

#### 6.4.3.2 Complex Custom Sorting

```powershell
# Sort files by extension type priority
Get-ChildItem | Sort-Object {
    switch ($_.Extension) {
        ".exe" { 1 }
        ".dll" { 2 }
        ".txt" { 3 }
        ".log" { 4 }
        default { 5 }
    }
}
```

#### 6.4.3.3 Practical Custom Sorting Examples

```powershell
# Sort processes by owner priority
Get-Process -IncludeUserName | Sort-Object {
    switch ($_.UserName) {
        { $_ -match "Administrators" } { 1 }
        { $_ -match "SYSTEM" } { 2 }
        default { 3 }
    }
}

# Sort services by startup type priority
Get-Service | Sort-Object {
    switch ($_.StartType) {
        "Automatic" { 1 }
        "Manual" { 2 }
        "Disabled" { 3 }
        default { 4 }
    }
}

# Sort network connections by threat level
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    Sort-Object {
        if ($privateIPs -match $_.RemoteAddress) { 1 }  # Internal
        else { 2 }  # External
    }
```

### 6.4.4 Stable Sorting

#### 6.4.4.1 Understanding Stable Sorting

A stable sort preserves the original order of equal elements:

```powershell
# Original order: B, A, C, A
"Banana", "Apple", "Cherry", "Apricot" | 
    Sort-Object { $_.Substring(0,1) }  # Sort by first letter

# Result: Apple, Apricot, Banana, Cherry (stable sort)
```

PowerShell's `Sort-Object` is stable, preserving relative order of equal elements.

#### 6.4.4.2 Practical Stable Sorting Examples

```powershell
# Sort processes by CPU, preserving original order for equal CPU
Get-Process | Sort-Object CPU

# Sort files by extension, preserving directory order
Get-ChildItem -Recurse | Sort-Object Extension

# Sort event log entries by date, preserving original order for same timestamp
Get-WinEvent -LogName System | Sort-Object TimeCreated
```

### 6.4.5 Sorting with Culture-Specific Rules

#### 6.4.5.1 Culture-Aware Sorting

```powershell
# Sort using current culture
"äpple", "banana", "cherry" | Sort-Object

# Sort using specific culture (Swedish)
$swedish = [System.Globalization.CultureInfo]"sv-SE"
"äpple", "banana", "cherry" | Sort-Object -Culture $swedish
```

#### 6.4.5.2 Ignoring Non-Sort Elements

```powershell
# Sort ignoring diacritics
$sortOptions = [System.Globalization.CompareOptions]::IgnoreNonSpace
"café", "cafe", "cable" | Sort-Object -Culture "en-US" -Compare $sortOptions
```

#### 6.4.5.3 Practical Culture-Specific Sorting

```powershell
# Sort file names with culture-specific rules
Get-ChildItem | Sort-Object Name -Culture "en-US"

# Sort processes by name with Turkish-specific rules (I vs ı)
$turkish = [System.Globalization.CultureInfo]"tr-TR"
Get-Process | Sort-Object Name -Culture $turkish

# Sort using linguistic sorting (vs. ordinal)
$linguistic = [System.Globalization.CompareOptions]::StringSort
"file10.txt", "file2.txt" | Sort-Object -Compare $linguistic
```

## 6.5 Introduction to Measure-Object

`Measure-Object` is PowerShell's primary cmdlet for calculating statistical information about object properties.

### 6.5.1 Basic Syntax and Structure

#### 6.5.1.1 Basic Measurement

```powershell
# Measure count of processes
Get-Process | Measure-Object

# Measure numeric properties of processes
Get-Process | Measure-Object CPU, WorkingSet -Average -Maximum -Minimum -Sum
```

#### 6.5.1.2 Property-Specific Measurement

```powershell
# Measure specific property
Get-Process | Measure-Object WorkingSet -Sum -Average
```

#### 6.5.1.3 Text Measurement

```powershell
# Measure text properties
"Hello", "World", "PowerShell" | Measure-Object -Character -Line -Word
```

### 6.5.2 Measurement Types

#### 6.5.2.1 Numeric Measurements

```powershell
# Basic statistics
Get-Process | Measure-Object CPU -Minimum -Maximum -Average -Sum
```

Available numeric measurements:
- `-Minimum`: Smallest value
- `-Maximum`: Largest value
- `-Average`: Mean value
- `-Sum`: Total sum
- `-StandardDeviation`: Statistical standard deviation

#### 6.5.2.2 Text Measurements

```powershell
# Text statistics
Get-Content .\log.txt | Measure-Object -Line -Word -Character
```

Available text measurements:
- `-Line`: Number of lines
- `-Word`: Number of words
- `-Character`: Number of characters

#### 6.5.2.3 Boolean Measurements

```powershell
# Count true/false values
1, 0, $true, $false, $null | Measure-Object -Property $_ -Boolean
```

Available boolean measurements:
- `-True`: Count of true values
- `-False`: Count of false values

### 6.5.3 Measurement Output

#### 6.5.3.1 Understanding Output Properties

`Measure-Object` output includes these key properties:

| Property | Description |
|----------|-------------|
| `Count` | Total number of objects |
| `Average` | Mean value (for numeric properties) |
| `Sum` | Total sum (for numeric properties) |
| `Maximum` | Largest value (for numeric properties) |
| `Minimum` | Smallest value (for numeric properties) |
| `StandardDeviation` | Statistical standard deviation |
| `Property` | Name of the measured property |

#### 6.5.3.2 Interpreting Measurement Results

```powershell
$result = Get-Process | Measure-Object WorkingSet -Average -Maximum

# Access specific values
$result.Average / 1MB  # Average in MB
$result.Maximum / 1MB  # Maximum in MB
```

#### 6.5.3.3 Formatting Measurement Results

```powershell
# Format numeric results
$result = Get-Process | Measure-Object CPU -Average
"Average CPU usage: {0:N2}%" -f $result.Average

# Format multiple results
$result = Get-Process | Measure-Object WorkingSet -Average -Maximum
@"
Average memory: {0:N2} MB
Maximum memory: {1:N2} MB
"@ -f ($result.Average / 1MB), ($result.Maximum / 1MB)
```

### 6.5.4 Comparison with Other Measurement Methods

PowerShell offers multiple approaches for measurement.

#### 6.5.4.1 Measure-Object vs. Manual Calculation

```powershell
# Measure-Object approach
$result = Get-Process | Measure-Object WorkingSet -Average

# Manual calculation approach
$processes = Get-Process
$average = ($processes | Measure-Object WorkingSet -Sum).Sum / $processes.Count
```

`Measure-Object` is generally preferred because:
- More concise
- Handles streaming data efficiently
- Provides multiple statistics in one operation
- Better performance for large datasets

#### 6.5.4.2 Measure-Object vs. Group-Object

```powershell
# Measure-Object for overall statistics
Get-Process | Measure-Object CPU -Average

# Group-Object for grouped statistics
Get-Process | Group-Object Company | 
    ForEach-Object {
        [PSCustomObject]@{
            Company = $_.Name
            AverageCPU = ($_.Group | Measure-Object CPU -Average).Average
        }
    }
```

Use `Measure-Object` for overall statistics, `Group-Object` for grouped statistics.

## 6.6 Basic Measurement Techniques

Understanding basic measurement techniques is essential before moving to more advanced scenarios.

### 6.6.1 Counting Objects

#### 6.6.1.1 Basic Counting

```powershell
# Count all processes
Get-Process | Measure-Object

# Count result
(Get-Process | Measure-Object).Count
```

#### 6.6.1.2 Counting Filtered Objects

```powershell
# Count high CPU processes
Get-Process | Where-Object CPU -gt 50 | Measure-Object

# Count result
(Get-Process | Where-Object CPU -gt 50 | Measure-Object).Count
```

#### 6.6.1.3 Practical Counting Examples

```powershell
# Count files in directory
Get-ChildItem | Measure-Object

# Count text files
Get-ChildItem | Where-Object Extension -eq ".txt" | Measure-Object

# Count event log entries
Get-WinEvent -LogName System -MaxEvents 100 | Measure-Object

# Count unique process names
Get-Process | Sort-Object Name -Unique | Measure-Object
```

### 6.6.2 Numeric Measurements

#### 6.6.2.1 Basic Statistics

```powershell
# Basic statistics for process memory
Get-Process | Measure-Object WorkingSet -Minimum -Maximum -Average -Sum
```

#### 6.6.2.2 Multiple Property Measurement

```powershell
# Statistics for multiple properties
Get-Process | Measure-Object CPU, WorkingSet -Average -Maximum
```

#### 6.6.2.3 Practical Numeric Measurement Examples

```powershell
# Process CPU statistics
Get-Process | Measure-Object CPU -Minimum -Maximum -Average

# File size statistics
Get-ChildItem | Measure-Object Length -Minimum -Maximum -Average -Sum

# Event log ID statistics
Get-WinEvent -LogName System -MaxEvents 100 | 
    Measure-Object Id -Minimum -Maximum -Average

# Service startup time statistics
Get-WmiObject Win32_Service | 
    Where-Object { $_.Status -eq "Running" -and $_.ProcessId -gt 0 } | 
    ForEach-Object {
        $process = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
        if ($process) {
            (Get-Date) - $process.StartTime
        }
    } | 
    Measure-Object TotalSeconds -Minimum -Maximum -Average
```

### 6.6.3 Text Measurements

#### 6.6.3.1 Basic Text Statistics

```powershell
# Basic text statistics
Get-Content .\log.txt | Measure-Object -Line -Word -Character
```

#### 6.6.3.2 Filtered Text Measurement

```powershell
# Statistics for error lines
Get-Content .\log.txt | 
    Where-Object { $_ -match "ERROR" } | 
    Measure-Object -Line -Word -Character
```

#### 6.6.3.3 Practical Text Measurement Examples

```powershell
# Log file statistics
Get-Content .\application.log | Measure-Object -Line -Word -Character

# Error-specific statistics
Get-Content .\application.log | 
    Where-Object { $_ -match "ERROR" } | 
    Measure-Object -Line

# Configuration file statistics
Get-Content .\config.ini | 
    Where-Object { $_ -notmatch "^\s*;" } | 
    Measure-Object -Line

# Code file statistics (excluding comments)
Get-Content .\script.ps1 | 
    Where-Object { $_ -notmatch "^\s*#" } | 
    Measure-Object -Line
```

### 6.6.4 Boolean Measurements

#### 6.6.4.1 Basic Boolean Measurement

```powershell
# Count true values
$true, $false, $true, $null | Measure-Object -Boolean
```

#### 6.6.4.2 Property-Based Boolean Measurement

```powershell
# Count running services
Get-Service | Measure-Object Status -eq "Running" -Boolean
```

#### 6.6.4.3 Practical Boolean Measurement Examples

```powershell
# Count running services
Get-Service | Measure-Object { $_.Status -eq "Running" } -Boolean

# Count processes with window titles
Get-Process | Measure-Object MainWindowTitle -Boolean

# Count files with read-only attribute
Get-ChildItem | 
    Measure-Object { $_.Attributes -band [System.IO.FileAttributes]::ReadOnly } -Boolean

# Count failed login attempts
Get-WinEvent -LogName Security | 
    Where-Object Id -eq 4625 | 
    Measure-Object
```

## 6.7 Advanced Measurement Techniques

Beyond basic measurements, `Measure-Object` supports sophisticated statistical analysis.

### 6.7.1 Standard Deviation and Variance

#### 6.7.1.1 Basic Standard Deviation

```powershell
# Calculate standard deviation
Get-Process | Measure-Object CPU -StandardDeviation
```

#### 6.7.1.2 Interpreting Standard Deviation

Standard deviation measures data dispersion:
- Low standard deviation: Values are close to the mean
- High standard deviation: Values are spread out over a wider range

```powershell
$result = Get-Process | Measure-Object CPU -Average -StandardDeviation
"Average CPU: {0:N2}%, Deviation: {1:N2}%" -f $result.Average, $result.StandardDeviation
```

#### 6.7.1.3 Practical Standard Deviation Examples

```powershell
# Process CPU consistency
$result = Get-Process | Measure-Object CPU -Average -StandardDeviation
if ($result.StandardDeviation -gt ($result.Average * 0.5)) {
    "CPU usage is highly variable"
} else {
    "CPU usage is relatively consistent"
}

# File size distribution
$result = Get-ChildItem | Measure-Object Length -Average -StandardDeviation
"Average size: {0:N2} MB, Deviation: {1:N2} MB" -f 
    ($result.Average / 1MB), 
    ($result.StandardDeviation / 1MB)

# Network latency analysis
$latencies = Test-Connection google.com -Count 10 | 
    Select-Object -ExpandProperty ResponseTime
$result = $latencies | Measure-Object -Average -StandardDeviation
"Average latency: {0:N0} ms, Deviation: {1:N0} ms" -f $result.Average, $result.StandardDeviation
```

### 6.7.2 Grouped Measurements

#### 6.7.2.1 Basic Grouped Measurement

```powershell
# Grouped by process name
Get-Process | Group-Object Name | 
    ForEach-Object {
        [PSCustomObject]@{
            Name = $_.Name
            Count = $_.Count
            AverageCPU = ($_.Group | Measure-Object CPU -Average).Average
            MaxMemoryMB = ($_.Group | Measure-Object WorkingSet -Maximum).Maximum / 1MB
        }
    }
```

#### 6.7.2.2 Advanced Grouped Measurement

```powershell
# Grouped by memory usage ranges
$processes = Get-Process
$groups = @(
    @{Name="High"; Min=200MB; Max=[long]::MaxValue}
    @{Name="Medium"; Min=100MB; Max=200MB}
    @{Name="Low"; Min=0; Max=100MB}
)

$groups | ForEach-Object {
    $groupProcesses = $processes | 
        Where-Object WorkingSet -ge $_.Min | 
        Where-Object WorkingSet -lt $_.Max
    
    [PSCustomObject]@{
        MemoryRange = $_.Name
        Count = $groupProcesses.Count
        AverageCPU = ($groupProcesses | Measure-Object CPU -Average).Average
    }
}
```

#### 6.7.2.3 Practical Grouped Measurement Examples

```powershell
# Services by startup type
Get-Service | Group-Object StartType | 
    ForEach-Object {
        [PSCustomObject]@{
            StartType = $_.Name
            Count = $_.Count
            Running = ($_.Group | Where-Object Status -eq "Running").Count
        }
    }

# Files by extension
Get-ChildItem | Group-Object Extension | 
    ForEach-Object {
        $sizes = $_.Group | Measure-Object Length -Sum -Average
        [PSCustomObject]@{
            Extension = $_.Name
            Count = $_.Count
            TotalSizeMB = $sizes.Sum / 1MB
            AvgSizeKB = $sizes.Average / 1KB
        }
    } | 
    Sort-Object TotalSizeMB -Descending

# Event log entries by severity
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object Level | 
    ForEach-Object {
        [PSCustomObject]@{
            Severity = switch ($_.Name) {
                1 { "Critical" }
                2 { "Error" }
                3 { "Warning" }
                4 { "Information" }
                default { "Unknown" }
            }
            Count = $_.Count
        }
    }
```

### 6.7.3 Weighted Measurements

#### 6.7.3.1 Basic Weighted Average

```powershell
# Weighted average based on process count
$services = Get-Service | Group-Object Status
$total = ($services | Measure-Object Count -Sum).Sum

$weightedAvg = 0
foreach ($group in $services) {
    $weight = $group.Count / $total
    $value = switch ($group.Name) {
        "Running" { 1.0 }
        "Stopped" { 0.5 }
        default { 0.0 }
    }
    $weightedAvg += $weight * $value
}
$weightedAvg
```

#### 6.7.3.2 Practical Weighted Measurement Examples

```powershell
# Weighted process resource usage
$processes = Get-Process
$totalMemory = ($processes | Measure-Object WorkingSet -Sum).Sum

$weightedCPU = 0
foreach ($process in $processes) {
    $weight = $process.WorkingSet / $totalMemory
    $weightedCPU += $weight * $process.CPU
}
"Weighted CPU usage: {0:N2}%" -f $weightedCPU

# Weighted file age analysis
$files = Get-ChildItem
$totalSize = ($files | Measure-Object Length -Sum).Sum

$weightedAge = 0
foreach ($file in $files) {
    $weight = $file.Length / $totalSize
    $ageDays = ((Get-Date) - $file.LastWriteTime).Days
    $weightedAge += $weight * $ageDays
}
"Weighted average file age: {0:N1} days" -f $weightedAge

# Weighted service criticality
$criticalServices = "LanmanServer", "Netlogon", "EventLog"
$services = Get-Service | Group-Object Status
$total = ($services | Measure-Object Count -Sum).Sum

$weightedCritical = 0
foreach ($group in $services) {
    $weight = $group.Count / $total
    $criticalCount = ($group.Group | Where-Object Name -in $criticalServices).Count
    $criticalPercent = $criticalCount / $group.Count
    $weightedCritical += $weight * $criticalPercent
}
"Weighted critical service percentage: {0:P1}" -f $weightedCritical
```

### 6.7.4 Time Series Analysis

#### 6.7.4.1 Basic Time Series Measurement

```powershell
# CPU usage over time
$samples = 1..10 | ForEach-Object {
    Start-Sleep -Seconds 1
    (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue
}

$samples | Measure-Object -Average -Maximum -Minimum -StandardDeviation
```

#### 6.7.4.2 Advanced Time Series Analysis

```powershell
# Network throughput analysis
$startTime = Get-Date
$samples = 1..60 | ForEach-Object {
    $bytes = (Get-NetAdapterStatistics).ReceivedBytes
    Start-Sleep -Seconds 1
    $elapsed = (Get-Date) - $startTime
    [PSCustomObject]@{
        Time = $elapsed.TotalSeconds
        Bytes = $bytes
    }
}

# Calculate throughput (bytes per second)
for ($i = 1; $i -lt $samples.Count; $i++) {
    $interval = $samples[$i].Time - $samples[$i-1].Time
    $bytes = $samples[$i].Bytes - $samples[$i-1].Bytes
    $samples[$i].Throughput = $bytes / $interval
}

$samples[1..($samples.Count-1)] | 
    Measure-Object Throughput -Average -Maximum -Minimum
```

#### 6.7.4.3 Practical Time Series Examples

```powershell
# Process memory growth analysis
$process = Get-Process -Id $PID
$samples = 1..10 | ForEach-Object {
    Start-Sleep -Seconds 5
    $process.Refresh()
    [PSCustomObject]@{
        Time = Get-Date
        MemoryMB = $process.WorkingSet / 1MB
    }
}

# Calculate memory growth rate
for ($i = 1; $i -lt $samples.Count; $i++) {
    $timeDiff = ($samples[$i].Time - $samples[$i-1].Time).TotalSeconds
    $memDiff = $samples[$i].MemoryMB - $samples[$i-1].MemoryMB
    $samples[$i].GrowthRate = $memDiff / $timeDiff
}

$samples[1..($samples.Count-1)] | 
    Measure-Object GrowthRate -Average -Maximum

# Disk I/O monitoring
$samples = 1..5 | ForEach-Object {
    $disk = Get-PhysicalDisk | Select-Object -First 1
    $stats = $disk | Get-StorageReliabilityCounter
    Start-Sleep -Seconds 10
    [PSCustomObject]@{
        Time = Get-Date
        Temperature = $stats.Temperature
        LifeLeft = $stats.LifeLeft
        ReadErrors = $stats.ReadErrorsTotal
        WriteErrors = $stats.WriteErrorsTotal
    }
}

# Calculate error rates
for ($i = 1; $i -lt $samples.Count; $i++) {
    $timeDiff = ($samples[$i].Time - $samples[$i-1].Time).TotalSeconds
    $readDiff = $samples[$i].ReadErrors - $samples[$i-1].ReadErrors
    $writeDiff = $samples[$i].WriteErrors - $samples[$i-1].WriteErrors
    $samples[$i].ReadErrorRate = $readDiff / $timeDiff
    $samples[$i].WriteErrorRate = $writeDiff / $timeDiff
}

$samples[1..($samples.Count-1)] | 
    Measure-Object ReadErrorRate, WriteErrorRate -Average
```

## 6.8 Performance Considerations

Sorting and measurement operations can significantly impact script performance, especially with large datasets.

### 6.8.1 Sorting Performance

#### 6.8.1.1 Algorithm Complexity

`Sort-Object` uses a stable sorting algorithm with O(n log n) complexity.

Performance considerations:
- Sorting time increases more than linearly with data size
- Memory usage is proportional to data size
- Property access adds overhead

#### 6.8.1.2 Measuring Sort Performance

```powershell
# Measure sort performance
$sortTime = Measure-Command {
    Get-Process | Sort-Object CPU -Descending
}

# Display results
[pscustomobject]@{
    Operation = "Sort-Object CPU -Descending"
    Time = $sortTime.TotalMilliseconds
    Processes = (Get-Process).Count
} | Format-Table
```

#### 6.8.1.3 Performance Comparison: Different Sort Types

```powershell
# Compare different sort operations
$tests = @(
    @{Name="Name (asc)"; Script={Get-Process | Sort-Object Name}}
    @{Name="Name (desc)"; Script={Get-Process | Sort-Object Name -Descending}}
    @{Name="CPU (desc)"; Script={Get-Process | Sort-Object CPU -Descending}}
    @{Name="Memory (desc)"; Script={Get-Process | Sort-Object WorkingSet -Descending}}
    @{Name="Multi-property"; Script={Get-Process | Sort-Object CPU -Descending, WorkingSet -Descending}}
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

### 6.8.2 Measurement Performance

#### 6.8.2.1 Algorithm Complexity

`Measure-Object` has O(n) complexity for most operations.

Performance considerations:
- Measurement time increases linearly with data size
- Multiple statistics require only one pass through data
- Calculated properties add overhead

#### 6.8.2.2 Measuring Measurement Performance

```powershell
# Measure measurement performance
$measureTime = Measure-Command {
    Get-Process | Measure-Object CPU, WorkingSet -Average -Maximum
}

# Display results
[pscustomobject]@{
    Operation = "Measure-Object CPU, WorkingSet -Average -Maximum"
    Time = $measureTime.TotalMilliseconds
    Processes = (Get-Process).Count
} | Format-Table
```

#### 6.8.2.3 Performance Comparison: Different Measurements

```powershell
# Compare different measurement operations
$tests = @(
    @{Name="Count"; Script={Get-Process | Measure-Object}}
    @{Name="CPU stats"; Script={Get-Process | Measure-Object CPU -Average -Maximum}}
    @{Name="Memory stats"; Script={Get-Process | Measure-Object WorkingSet -Average -Maximum}}
    @{Name="Multiple stats"; Script={Get-Process | Measure-Object CPU, WorkingSet -Average -Maximum}}
    @{Name="Text stats"; Script={Get-Content .\log.txt | Measure-Object -Line -Word -Character}}
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

### 6.8.3 Optimizing Sorting Operations

#### 6.8.3.1 Reduce Data Before Sorting

```powershell
# Less efficient: sorts all processes
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# More efficient: filters then sorts
Get-Process | 
    Where-Object CPU -gt 50 | 
    Sort-Object WorkingSet -Descending | 
    Select-Object -First 10
```

#### 6.8.3.2 Minimize Property Access

```powershell
# Less efficient: calculated property sort
Get-Process | 
    Sort-Object @{Expression={($_.WorkingSet / 1MB)}}

# More efficient: sort by native property
Get-Process | Sort-Object WorkingSet -Descending
```

#### 6.8.3.3 Avoid Unnecessary Uniqueness

```powershell
# Less efficient: unique sort when not needed
Get-Process | Sort-Object Name -Unique

# More efficient: regular sort when uniqueness not required
Get-Process | Sort-Object Name
```

#### 6.8.3.4 Performance Comparison: Optimization Techniques

```powershell
# Compare optimization techniques
$tests = @(
    @{Name="Full sort"; Script={Get-Process | Sort-Object CPU -Descending}}
    @{Name="Filter then sort"; Script={
        Get-Process | Where-Object CPU -gt 50 | Sort-Object WorkingSet -Descending
    }}
    @{Name="Native property sort"; Script={Get-Process | Sort-Object WorkingSet -Descending}}
    @{Name="Calculated property sort"; Script={
        Get-Process | Sort-Object @{Expression={($_.WorkingSet / 1MB)}}
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

### 6.8.4 Optimizing Measurement Operations

#### 6.8.4.1 Measure Only Needed Statistics

```powershell
# Less efficient: measures all statistics
Get-Process | Measure-Object CPU -Minimum -Maximum -Average -Sum -StandardDeviation

# More efficient: measures only needed statistics
Get-Process | Measure-Object CPU -Average
```

#### 6.8.4.2 Measure Early in the Pipeline

```powershell
# Less efficient: selects properties first
Get-Process | 
    Select-Object Name, CPU | 
    Measure-Object CPU -Average

# More efficient: measures before selecting properties
Get-Process | Measure-Object CPU -Average
```

#### 6.8.4.3 Avoid Redundant Measurements

```powershell
# Less efficient: multiple measurements
$avg = (Get-Process | Measure-Object CPU -Average).Average
$max = (Get-Process | Measure-Object CPU -Maximum).Maximum

# More efficient: single measurement
$result = Get-Process | Measure-Object CPU -Average -Maximum
$avg = $result.Average
$max = $result.Maximum
```

#### 6.8.4.4 Performance Comparison: Measurement Optimization

```powershell
# Compare measurement optimization techniques
$tests = @(
    @{Name="All stats"; Script={Get-Process | Measure-Object CPU -Minimum -Maximum -Average -Sum -StandardDeviation}}
    @{Name="Single stat"; Script={Get-Process | Measure-Object CPU -Average}}
    @{Name="Early measurement"; Script={
        Get-Process | Measure-Object CPU -Average
    }}
    @{Name="Late measurement"; Script={
        Get-Process | Select-Object CPU | Measure-Object CPU -Average
    }}
    @{Name="Redundant measurements"; Script={
        $null = (Get-Process | Measure-Object CPU -Average).Average
        $null = (Get-Process | Measure-Object CPU -Maximum).Maximum
    }}
    @{Name="Combined measurements"; Script={
        $null = Get-Process | Measure-Object CPU -Average -Maximum
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

## 6.9 Real-World Sorting and Measurement Scenarios

Sorting and measurement are essential for real-world administration tasks. Let's explore practical scenarios across different domains.

### 6.9.1 Process Management

#### 6.9.1.1 Resource Monitoring Reports

```powershell
# Top resource consumers report
Get-Process | 
    Sort-Object WorkingSet -Descending | 
    Select-Object -First 10 | 
    Select-Object Name, Id, 
        @{Name="CPU";Expression={"{0:N2}%" -f $_.CPU}},
        @{Name="MemoryMB";Expression={"{0:N2}" -f ($_.WorkingSet / 1MB)}},
        @{Name="Uptime";Expression={((Get-Date) - $_.StartTime).ToString("d\.hh\:mm\:ss")}} |
    Format-Table -AutoSize

# Resource statistics
$cpuStats = Get-Process | Measure-Object CPU -Average -Maximum
$memoryStats = Get-Process | Measure-Object WorkingSet -Average -Maximum -StandardDeviation

@"
System Resource Statistics:
- Average CPU usage: {0:N2}%
- Peak CPU usage: {1:N2}%
- Average memory usage: {2:N2} MB
- Peak memory usage: {3:N2} MB
- Memory consistency: {4:N2} MB deviation
"@ -f $cpuStats.Average, $cpuStats.Maximum, 
    ($memoryStats.Average / 1MB), 
    ($memoryStats.Maximum / 1MB), 
    ($memoryStats.StandardDeviation / 1MB)
```

#### 6.9.1.2 Process Inventory Analysis

```powershell
# Process ownership analysis
Get-Process -IncludeUserName | 
    Group-Object UserName | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }},
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }} |
    Sort-Object TotalMemoryMB -Descending |
    Format-Table -AutoSize

# Process memory distribution
$processes = Get-Process
$groups = @(
    @{Name="High"; Min=200MB; Max=[long]::MaxValue}
    @{Name="Medium"; Min=100MB; Max=200MB}
    @{Name="Low"; Min=0; Max=100MB}
)

$groups | ForEach-Object {
    $groupProcesses = $processes | 
        Where-Object WorkingSet -ge $_.Min | 
        Where-Object WorkingSet -lt $_.Max
    
    [PSCustomObject]@{
        MemoryRange = $_.Name
        Count = $groupProcesses.Count
        AverageCPU = ($groupProcesses | Measure-Object CPU -Average).Average
        TotalMemoryMB = ($groupProcesses | Measure-Object WorkingSet -Sum).Sum / 1MB
    }
} | Format-Table -AutoSize
```

### 6.9.2 File System Operations

#### 6.9.2.1 File Analysis Reports

```powershell
# Large file distribution
Get-ChildItem -Path C:\ -Recurse -File -ErrorAction SilentlyContinue | 
    Group-Object { 
        if ($_.Length -gt 1GB) { "1GB+" }
        elseif ($_.Length -gt 100MB) { "100MB-1GB" }
        elseif ($_.Length -gt 10MB) { "10MB-100MB" }
        else { "<10MB" }
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="AvgSizeMB";Expression={
            ($_.Group | Measure-Object Length -Average).Average / 1MB
        }} |
    Sort-Object TotalSizeMB -Descending |
    Format-Table -AutoSize

# File age analysis
$files = Get-ChildItem -Path C:\ -Recurse -File -ErrorAction SilentlyContinue
$totalSize = ($files | Measure-Object Length -Sum).Sum

$ageGroups = @(
    @{Name="Today"; Max=1}
    @{Name="This week"; Max=7}
    @{Name="This month"; Max=30}
    @{Name="This year"; Max=365}
    @{Name="Older"; Max=[int]::MaxValue}
)

$ageGroups | ForEach-Object {
    $maxDays = $_.Max
    $groupFiles = if ($maxDays -eq [int]::MaxValue) {
        $files | Where-Object { ((Get-Date) - $_.LastWriteTime).Days -ge 365 }
    } else {
        $files | Where-Object { ((Get-Date) - $_.LastWriteTime).Days -le $maxDays }
    }
    
    [PSCustomObject]@{
        AgeGroup = $_.Name
        Count = $groupFiles.Count
        TotalSizeMB = ($groupFiles | Measure-Object Length -Sum).Sum / 1MB
        PercentTotal = ($groupFiles | Measure-Object Length -Sum).Sum / $totalSize * 100
    }
} | Format-Table -AutoSize
```

#### 6.9.2.2 Storage Optimization Analysis

```powershell
# Duplicate file analysis
$duplicates = Get-ChildItem -Path C:\ -Recurse -File -ErrorAction SilentlyContinue | 
    Group-Object Length | 
    Where-Object Count -gt 1

$potentialSavings = 0
$duplicateReport = foreach ($group in $duplicates) {
    $totalSize = $group.Count * $group.Name
    $potentialSavings += ($group.Count - 1) * $group.Name
    
    [PSCustomObject]@{
        SizeMB = $group.Name / 1MB
        FileCount = $group.Count
        SampleFile = $group.Group[0].FullName
    }
}

@"
Duplicate File Analysis:
- {0} groups of duplicate files
- Potential storage savings: {1:N2} MB
"@ -f $duplicates.Count, ($potentialSavings / 1MB)

$duplicateReport | 
    Sort-Object SizeMB -Descending | 
    Select-Object -First 10 | 
    Format-Table SizeMB, FileCount, SampleFile -AutoSize

# Orphaned file detection
$systemDirs = "C:\Windows", "C:\Program Files", "C:\ProgramData"
$orphanedFiles = Get-ChildItem -Path C:\ -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { 
        $dir = $_.DirectoryName
        $systemDirs -notcontains $dir -and 
        $dir -notmatch "Users\\[^\\]+\\AppData" 
    }

$orphanedStats = $orphanedFiles | 
    Measure-Object Length -Sum -Average

@"
Orphaned File Statistics:
- Total orphaned files: {0}
- Total size: {1:N2} MB
- Average size: {2:N2} KB
"@ -f $orphanedFiles.Count, 
    ($orphanedStats.Sum / 1MB), 
    ($orphanedStats.Average / 1KB)
```

### 6.9.3 Event Log Analysis

#### 6.9.3.1 Event Pattern Recognition

```powershell
# Event frequency analysis
$events = Get-WinEvent -LogName System -MaxEvents 1000

$eventStats = $events | 
    Group-Object Id | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="First";Expression={$_.Group[0].TimeCreated}},
        @{Name="Last";Expression={$_.Group[-1].TimeCreated}} |
    Sort-Object Count -Descending |
    Select-Object -First 10

$eventStats | Format-Table -AutoSize

# Event severity distribution
$severityStats = $events | 
    Group-Object Level | 
    ForEach-Object {
        [PSCustomObject]@{
            Severity = switch ($_.Name) {
                1 { "Critical" }
                2 { "Error" }
                3 { "Warning" }
                4 { "Information" }
                default { "Unknown" }
            }
            Count = $_.Count
            Percent = $_.Count / $events.Count * 100
        }
    } | 
    Sort-Object Count -Descending

$severityStats | Format-Table -AutoSize
```

#### 6.9.3.2 Security Event Analysis

```powershell
# Failed login pattern analysis
$failedLogins = Get-WinEvent -LogName Security -MaxEvents 1000 | 
    Where-Object Id -eq 4625  # Failed logon

# Workstation analysis
$workstationStats = $failedLogins | 
    Group-Object { 
        $xml = [xml]$_.ToXml()
        $xml.Event.EventData.Data[5].'#text'  # Workstation name
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="First";Expression={$_.Group[0].TimeCreated}},
        @{Name="Last";Expression={$_.Group[-1].TimeCreated}} |
    Sort-Object Count -Descending |
    Select-Object -First 10

# Account analysis
$accountStats = $failedLogins | 
    Group-Object { 
        $xml = [xml]$_.ToXml()
        $xml.Event.EventData.Data[0].'#text'  # Account name
    } | 
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Select-Object -First 10

@"
Failed Login Analysis:
- Total failed logins: {0}
- Top workstations:
{1}
- Top accounts:
{2}
"@ -f $failedLogins.Count, 
    ($workstationStats | Format-Table | Out-String), 
    ($accountStats | Format-Table | Out-String)
```

### 6.9.4 Active Directory Queries

#### 6.9.4.1 User Activity Analysis

```powershell
# User logon pattern analysis
$users = Get-ADUser -Filter * -Properties LastLogonDate, PasswordLastSet

# Logon frequency analysis
$logonStats = $users | 
    Where-Object LastLogonDate | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastLogonDate).Days
        if ($days -le 7) { "Last week" }
        elseif ($days -le 30) { "Last month" }
        elseif ($days -le 90) { "Last quarter" }
        else { "90+ days" }
    } | 
    Select-Object Name, Count |
    Sort-Object Name

# Password age analysis
$passwordStats = $users | 
    Where-Object PasswordLastSet | 
    Group-Object { 
        $days = ((Get-Date) - $_.PasswordLastSet).Days
        if ($days -le 30) { "0-30 days" }
        elseif ($days -le 90) { "31-90 days" }
        else { "90+ days" }
    } | 
    Select-Object Name, Count |
    Sort-Object Name

@"
User Activity Analysis:
- Logon frequency:
{0}
- Password age distribution:
{1}
"@ -f ($logonStats | Format-Table | Out-String), 
    ($passwordStats | Format-Table | Out-String)
```

#### 6.9.4.2 Group Management Analysis

```powershell
# Group membership analysis
$groups = Get-ADGroup -Filter * | 
    ForEach-Object {
        $members = Get-ADGroupMember -Identity $_.DistinguishedName -Recursive -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            GroupName = $_.Name
            MemberCount = $members.Count
            GroupType = $_.GroupScope
        }
    }

# Membership distribution
$membershipStats = $groups | 
    Group-Object { 
        if ($_.MemberCount -gt 1000) { ">1000 members" }
        elseif ($_.MemberCount -gt 500) { "501-1000 members" }
        elseif ($_.MemberCount -gt 100) { "101-500 members" }
        else { "<=100 members" }
    } | 
    Select-Object Name, 
        @{Name="GroupCount";Expression={$_.Count}},
        @{Name="TotalMembers";Expression={
            ($_.Group | Measure-Object MemberCount -Sum).Sum
        }} |
    Sort-Object TotalMembers -Descending

# Empty group analysis
$emptyGroups = $groups | Where-Object MemberCount -eq 0
$emptyGroupStats = $emptyGroups | 
    Group-Object { 
        $days = ((Get-Date) - $_.WhenCreated).Days
        if ($days -le 30) { "Created last month" }
        elseif ($days -le 90) { "Created last quarter" }
        else { "Created earlier" }
    } | 
    Select-Object Name, Count

@"
Group Membership Analysis:
- Membership distribution:
{0}
- Empty groups: {1} total
{2}
"@ -f ($membershipStats | Format-Table | Out-String), 
    $emptyGroups.Count, 
    ($emptyGroupStats | Format-Table | Out-String)
```

### 6.9.5 Network Configuration

#### 6.9.5.1 Connection Analysis

```powershell
# Connection pattern analysis
$connections = Get-NetTCPConnection | 
    Where-Object State -eq "Established"

# Remote address analysis
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
$connectionStats = $connections | 
    Group-Object { 
        if ($privateIPs -match $_.RemoteAddress) { "Internal" } 
        else { "External" } 
    } | 
    ForEach-Object {
        $data = $_.Group | ForEach-Object {
            $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
            [PSCustomObject]@{
                Sent = $process.IOWriteBytes
                Received = $process.IOReadBytes
            }
        }
        
        $totalSent = ($data | Measure-Object Sent -Sum).Sum
        $totalReceived = ($data | Measure-Object Received -Sum).Sum
        
        [PSCustomObject]@{
            ConnectionType = $_.Name
            Count = $_.Count
            TotalSentMB = $totalSent / 1MB
            TotalReceivedMB = $totalReceived / 1MB
            TotalMB = ($totalSent + $totalReceived) / 1MB
        }
    }

# Process connection analysis
$processStats = $connections | 
    Group-Object { 
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $process.Name 
    } | 
    Select-Object Name, 
        @{Name="ConnectionCount";Expression={$_.Count}},
        @{Name="TotalMB";Expression={
            $data = $_.Group | ForEach-Object {
                $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
                $process.IOWriteBytes + $process.IOReadBytes
            }
            ($data | Measure-Object -Sum).Sum / 1MB
        }} |
    Sort-Object TotalMB -Descending |
    Select-Object -First 10

@"
Network Connection Analysis:
- Connection types:
{0}
- Top processes by data transfer:
{1}
"@ -f ($connectionStats | Format-Table | Out-String), 
    ($processStats | Format-Table | Out-String)
```

#### 6.9.5.2 DNS Analysis

```powershell
# DNS record analysis
$records = Get-DnsServerResourceRecord -ZoneName "example.com"

# Record type distribution
$typeStats = $records | 
    Group-Object RecordType | 
    Select-Object Name, Count |
    Sort-Object Count -Descending

# TTL analysis
$tllStats = $records | 
    Measure-Object TimeToLive -Minimum -Maximum -Average -StandardDeviation

@"
DNS Record Analysis:
- Record type distribution:
{0}
- TTL statistics (seconds):
  Minimum: {1}
  Maximum: {2}
  Average: {3:N0}
  Deviation: {4:N0}
"@ -f ($typeStats | Format-Table | Out-String),
    $tllStats.Minimum,
    $tllStats.Maximum,
    $tllStats.Average,
    $tllStats.StandardDeviation
```

## 6.10 Common Sorting and Measurement Mistakes

Even experienced PowerShell users make sorting and measurement mistakes. Understanding these pitfalls helps write more reliable scripts.

### 6.10.1 Sorting Mistakes

#### 6.10.1.1 Incorrect Sort Order

```powershell
# Sorts by string value, not numeric value
"file1.txt", "file2.txt", "file10.txt" | Sort-Object
# Result: file1.txt, file10.txt, file2.txt
```

This happens because string sorting compares character by character.

#### 6.10.1.2 Case Sensitivity Issues

```powershell
# Case sensitivity behavior varies by platform
"apple", "Banana", "cherry" | Sort-Object
# Windows: apple, Banana, cherry
# Linux: Banana, apple, cherry
```

#### 6.10.1.3 Pipeline Order Mistakes

```powershell
# Less efficient: sorts full objects
Get-Process | 
    Sort-Object CPU -Descending | 
    Select-Object Name, Id, CPU

# More efficient: selects properties first
Get-Process | 
    Select-Object Name, Id, CPU | 
    Sort-Object CPU -Descending
```

Sorting full objects is less efficient than sorting reduced objects.

#### 6.10.1.4 Solutions

1. **Numeric sorting for numeric-like strings**:
   ```powershell
   "file1.txt", "file2.txt", "file10.txt" | 
       Sort-Object { [int]($_ -replace "\D+", "") }
   ```

2. **Explicit case handling**:
   ```powershell
   # Case-insensitive sort (explicit)
   "apple", "Banana", "cherry" | Sort-Object { $_.ToLower() }
   
   # Case-sensitive sort
   "apple", "Banana", "cherry" | Sort-Object -CaseSensitive
   ```

3. **Optimize pipeline order**:
   ```powershell
   # Optimal order
   Get-Process | 
       Where-Object CPU -gt 50 | 
       Select-Object Name, Id, CPU | 
       Sort-Object CPU -Descending
   ```

### 6.10.2 Measurement Mistakes

#### 6.10.2.1 Measuring Empty Collections

```powershell
# Returns error
@() | Measure-Object Property -Average
```

Measuring empty collections with numeric properties returns an error.

#### 6.10.2.2 Type Mismatch in Measurement

```powershell
# Returns incorrect results
"10", "20", "30" | Measure-Object -Average
# Treats as strings, not numbers
```

PowerShell treats pipeline input as strings unless explicitly converted.

#### 6.10.2.3 Redundant Measurements

```powershell
# Inefficient: multiple passes through data
$avg = (Get-Process | Measure-Object CPU -Average).Average
$max = (Get-Process | Measure-Object CPU -Maximum).Maximum
```

This requires two separate passes through the data.

#### 6.10.2.4 Solutions

1. **Handle empty collections**:
   ```powershell
   $collection = Get-Process | Where-Object CPU -gt 100
   if ($collection) {
       $collection | Measure-Object CPU -Average
   } else {
       [PSCustomObject]@{Average = 0}
   }
   ```

2. **Ensure proper data types**:
   ```powershell
   10, 20, 30 | Measure-Object -Average
   # Or convert strings to numbers
   "10", "20", "30" | ForEach-Object { [int]$_ } | Measure-Object -Average
   ```

3. **Combine measurements**:
   ```powershell
   $result = Get-Process | Measure-Object CPU -Average -Maximum
   $avg = $result.Average
   $max = $result.Maximum
   ```

### 6.10.3 Performance Anti-Patterns

#### 6.10.3.1 Sorting Unnecessarily

```powershell
# Unnecessary sort
Get-Process | 
    Sort-Object Name | 
    Where-Object Name -eq "powershell"
```

Sorting is unnecessary when filtering for a specific value.

#### 6.10.3.2 Measuring Before Filtering

```powershell
# Inefficient: measures all processes
Get-Process | 
    Measure-Object CPU -Average | 
    Where-Object Average -gt 50
```

Measurement should typically follow filtering.

#### 6.10.3.3 Complex Calculated Properties in Sort

```powershell
# Inefficient: complex calculation for each object
Get-Process | 
    Sort-Object { 
        (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue 
    }
```

Performing expensive operations inside sort expressions slows processing.

#### 6.10.3.4 Solutions

1. **Avoid unnecessary sorting**:
   ```powershell
   # Better: filter without sorting
   Get-Process -Name powershell
   ```

2. **Optimize measurement order**:
   ```powershell
   # Better: filter before measuring
   Get-Process | 
       Where-Object CPU -gt 50 | 
       Measure-Object
   ```

3. **Pre-calculate expensive values**:
   ```powershell
   $cpuPercent = (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue
   Get-Process | 
       Add-Member -MemberType NoteProperty -Name "CPUPercent" -Value $cpuPercent -PassThru | 
       Sort-Object CPUPercent
   ```

### 6.10.4 Unique Sorting Issues

#### 6.10.4.1 Unexpected Case Sensitivity

```powershell
# Returns only one entry ("test.txt")
"test.txt", "TEST.TXT" | 
    ForEach-Object { 
        [PSCustomObject]@{Name = $_} 
    } | 
    Sort-Object Name -Unique
```

`Sort-Object -Unique` is case-insensitive by default.

#### 6.10.4.2 Property Order Affecting Uniqueness

```powershell
# Different results based on property order
$objects = @(
    [PSCustomObject]@{A=1; B=2}
    [PSCustomObject]@{A=2; B=1}
)

$objects | Sort-Object A, B -Unique  # Returns both objects
$objects | Sort-Object B, A -Unique  # Returns both objects
```

The order of properties affects what's considered unique.

#### 6.10.4.3 Memory Issues with Large Datasets

```powershell
# May cause out of memory error
Get-Process -IncludeUserName | Sort-Object UserName -Unique
```

`Sort-Object -Unique` stores all objects in memory to determine uniqueness.

#### 6.10.4.4 Solutions

1. **Case-sensitive uniqueness**:
   ```powershell
   $unique = @{}
   Get-Process | ForEach-Object {
       $key = $_.Name  # Case-sensitive key
       if (-not $unique.ContainsKey($key)) {
           $unique[$key] = $_
           $_
       }
   }
   ```

2. **Understand property order impact**:
   ```powershell
   # Be consistent with property order
   Get-Process | Sort-Object Name, Id -Unique
   ```

3. **Handle large datasets carefully**:
   ```powershell
   # Process in chunks for very large datasets
   $chunkSize = 1000
   $allData = Get-Process
   $unique = @{}
   
   for ($i = 0; $i -lt $allData.Count; $i += $chunkSize) {
       $chunk = $allData[$i..($i + $chunkSize - 1)]
       $chunk | ForEach-Object {
           $key = "$($_.Name)|$($_.Id)"
           if (-not $unique.ContainsKey($key)) {
               $unique[$key] = $_
           }
       }
   }
   
   $unique.Values | Sort-Object Name
   ```

## 6.11 Troubleshooting Sorting and Measurement

When sorting and measurement operations don't work as expected, systematic troubleshooting helps identify and fix issues.

### 6.11.1 Diagnosing Sorting Failures

When a sort returns unexpected results, follow this diagnostic process.

#### 6.11.1.1 Verify Input Data

Ensure the input pipeline contains expected 

```powershell
# Check what's being sorted
$processes = Get-Process
$processes | Get-Member  # Verify properties
$processes | Format-List -First 3  # Inspect sample data
```

#### 6.11.1.2 Isolate the Sort Condition

Test the sort condition independently:

```powershell
# Test with a known object
$testObject = Get-Process -Name powershell -First 1
$testObject.CPU

# Test with explicit values
100, 50, 200 | Sort-Object
```

#### 6.11.1.3 Simplify Complex Sorts

Break down complex sorts:

```powershell
# Original complex sort
Get-Process | Sort-Object CPU -Descending, WorkingSet -Descending

# Test each component separately
Get-Process | Sort-Object CPU -Descending
Get-Process | Sort-Object WorkingSet -Descending
```

#### 6.11.1.4 Common Diagnostic Commands

```powershell
# View pipeline input
Get-Process | Tee-Object -Variable input | 
    Sort-Object CPU -Descending

# Inspect sorted results
$sorted = Get-Process | Sort-Object CPU -Descending
$sorted | Format-List -First 3

# Verify sort order
$sorted.CPU -eq ($sorted.CPU | Sort-Object -Descending)
```

### 6.11.2 Diagnosing Measurement Failures

When a measurement returns unexpected results, follow this diagnostic process.

#### 6.11.2.1 Verify Input Data

Ensure the input pipeline contains expected 

```powershell
# Check what's being measured
$processes = Get-Process
$processes | Get-Member  # Verify properties
$processes | Format-List -First 3  # Inspect sample data
```

#### 6.11.2.2 Isolate the Measurement

Test the measurement independently:

```powershell
# Test with a known object
$testObject = Get-Process -Name powershell -First 1
$testObject.CPU

# Test with explicit values
10, 20, 30 | Measure-Object -Average
```

#### 6.11.2.3 Simplify Complex Measurements

Break down complex measurements:

```powershell
# Original complex measurement
Get-Process | Measure-Object CPU -Average -Maximum

# Test each component separately
Get-Process | Measure-Object CPU -Average
Get-Process | Measure-Object CPU -Maximum
```

#### 6.11.2.4 Common Diagnostic Commands

```powershell
# View pipeline input
Get-Process | Tee-Object -Variable input | 
    Measure-Object CPU -Average

# Inspect measurement results
$result = Get-Process | Measure-Object CPU -Average
$result | Format-List *

# Verify measurement logic
$manualAvg = (Get-Process | Measure-Object CPU -Sum).Sum / (Get-Process).Count
$manualAvg -eq $result.Average
```

### 6.11.3 Verifying Sort Logic

Systematically verify that sort logic works as intended.

#### 6.11.3.1 Property Type Verification

```powershell
# Test property types
$processes = Get-Process
$processes[0].CPU.GetType().Name  # Should be Double
$processes[0].WorkingSet.GetType().Name  # Should be Int64
$processes[0].Name.GetType().Name  # Should be String
```

#### 6.11.3.2 Edge Case Testing

Test unusual or extreme values:

```powershell
# Test with null values
$nullTest = $null, 10, 20 | Sort-Object
# Null values sort first

# Test with empty strings
$emptyTest = "", "a", "b" | Sort-Object
# Empty strings sort first

# Test with different data types
$typeTest = 100, "50", 200 | Sort-Object
# Numbers sort before strings
```

#### 6.11.3.3 Sort Stability Testing

```powershell
# Test sort stability
$original = 1, 2, 3, 2, 1 | ForEach-Object { [PSCustomObject]@{Value=$_; Id=$_} }
$sorted = $original | Sort-Object Value

# Verify stability (original order preserved for equal values)
$sorted[0].Id -eq 1  # First 1
$sorted[1].Id -eq 1  # Second 1
$sorted[2].Id -eq 2  # First 2
$sorted[3].Id -eq 2  # Second 2
$sorted[4].Id -eq 3  # 3
```

### 6.11.4 Verifying Measurement Logic

Systematically verify that measurement logic works as intended.

#### 6.11.4.1 Basic Statistics Verification

```powershell
# Verify average calculation
$values = 10, 20, 30
$manualAvg = ($values | Measure-Object -Sum).Sum / $values.Count
$measureAvg = $values | Measure-Object -Average
$manualAvg -eq $measureAvg.Average

# Verify standard deviation calculation
$mean = $manualAvg
$squaredDiff = $values | ForEach-Object { [math]::Pow($_ - $mean, 2) }
$variance = ($squaredDiff | Measure-Object -Sum).Sum / ($values.Count - 1)
$manualStdDev = [math]::Sqrt($variance)
$measureStdDev = $values | Measure-Object -StandardDeviation
[math]::Round($manualStdDev, 6) -eq [math]::Round($measureStdDev.StandardDeviation, 6)
```

#### 6.11.4.2 Edge Case Testing

Test unusual or extreme values:

```powershell
# Test with single value
$single = 100 | Measure-Object -Average -Maximum -Minimum
$single.Average -eq 100
$single.Maximum -eq 100
$single.Minimum -eq 100

# Test with empty collection
try {
    @() | Measure-Object -Average
} catch {
    "Empty collection handled correctly"
}

# Test with null values
$nullTest = $null, 10, 20 | Measure-Object -Average
$nullTest.Average -eq 15
```

#### 6.11.4.3 Text Measurement Verification

```powershell
# Verify line count
$text = "line1`nline2`nline3"
$lines = $text -split "`n" | Where-Object { $_ -ne "" }
$measureLines = $text | Measure-Object -Line
$lines.Count -eq $measureLines.Lines

# Verify word count
$words = $text -split "\s+" | Where-Object { $_ -ne "" }
$measureWords = $text | Measure-Object -Word
$words.Count -eq $measureWords.Words
```

### 6.11.5 Debugging Complex Operations

Complex sorting and measurement operations require special debugging techniques.

#### 6.11.5.1 Step-by-Step Evaluation

Break down complex operations:

```powershell
# Original complex operation
Get-Process | 
    Sort-Object { $_.WorkingSet / 1MB } -Descending | 
    Select-Object -First 10 | 
    Measure-Object CPU -Average

# Test each component separately
$sorted = Get-Process | Sort-Object { $_.WorkingSet / 1MB } -Descending
$top10 = $sorted | Select-Object -First 10
$average = $top10 | Measure-Object CPU -Average
```

#### 6.11.5.2 Intermediate Results

Capture intermediate results:

```powershell
$processes = Get-Process

$memoryMB = $processes | ForEach-Object { $_.WorkingSet / 1MB }
$sortedIndices = $memoryMB | Sort-Object -Descending -PassThru | 
    ForEach-Object { $memoryMB.IndexOf($_) }

$top10 = $processes[$sortedIndices[0..9]]
$cpuAverage = $top10 | Measure-Object CPU -Average

[pscustomobject]@{
    TopProcess = $top10[0].Name
    MemoryMB = [math]::Round($memoryMB[$sortedIndices[0]], 2)
    AverageCPU = [math]::Round($cpuAverage.Average, 2)
}
```

#### 6.11.5.3 Debugging Script Blocks

Use `Set-PSDebug` for script block debugging:

```powershell
# Enable tracing
Set-PSDebug -Trace 1

# Run sort operation
Get-Process | Sort-Object { $_.WorkingSet / 1MB } -Descending

# Run measurement operation
Get-Process | Measure-Object CPU -Average

# Disable tracing
Set-PSDebug -Off
```

### 6.11.6 Common Error Messages and Solutions

Understanding common error messages helps resolve sorting and measurement issues quickly.

#### 6.11.6.1 "Cannot compare [string] with [int]"

**Cause**: Comparing different data types during sorting.

**Example**:
```powershell
"100", "50", "200" | Sort-Object
```

**Solution**:
```powershell
# Convert to same type
"100", "50", "200" | ForEach-Object { [int]$_ } | Sort-Object

# Or use calculated property
"100", "50", "200" | Sort-Object { [int]$_ }
```

#### 6.11.6.2 "Input object cannot be bound to any parameters"

**Cause**: Incorrect parameter usage with `Sort-Object`.

**Example**:
```powershell
Get-Process | Sort-Object -Property Name Descending
```

**Solution**:
```powershell
# Use correct parameter syntax
Get-Process | Sort-Object Name -Descending

# Or use calculated property syntax
Get-Process | Sort-Object @{Expression="Name"; Descending=$true}
```

#### 6.11.6.3 "The property cannot be found on this object"

**Cause**: Referencing non-existent property in sort or measurement.

**Example**:
```powershell
Get-Process | Sort-Object MemoryUsage
```

**Solution**:
```powershell
# Verify property name
Get-Process | Get-Member

# Use correct property name
Get-Process | Sort-Object WorkingSet
```

#### 6.11.6.4 "Measure-Object: Input object is not numeric"

**Cause**: Measuring non-numeric property with numeric statistics.

**Example**:
```powershell
Get-Process | Measure-Object Name -Average
```

**Solution**:
```powershell
# Use appropriate measurement type
Get-Process | Measure-Object Name  # Count only

# Or convert to numeric
Get-Process | Measure-Object Id -Average
```

## 6.12 Advanced Topics

For power users, PowerShell offers advanced sorting and measurement capabilities that extend beyond basic cmdlet usage.

### 6.12.1 Custom Sorting with .NET Comparers

#### 6.12.1.1 Creating Custom Comparers

```powershell
# Create custom string comparer
Add-Type @"
using System;
using System.Collections;

public class NaturalStringComparer : IComparer {
    public int Compare(object x, object y) {
        string s1 = x as string ?? string.Empty;
        string s2 = y as string ?? string.Empty;
        
        int i = 0, j = 0;
        while (i < s1.Length && j < s2.Length) {
            if (char.IsDigit(s1[i]) && char.IsDigit(s2[j])) {
                // Compare numeric parts
                long n1 = 0, n2 = 0;
                while (i < s1.Length && char.IsDigit(s1[i])) {
                    n1 = n1 * 10 + (s1[i++] - '0');
                }
                while (j < s2.Length && char.IsDigit(s2[j])) {
                    n2 = n2 * 10 + (s2[j++] - '0');
                }
                if (n1 != n2) return n1.CompareTo(n2);
            } else {
                // Compare non-numeric parts
                int result = char.ToLower(s1[i]).CompareTo(char.ToLower(s2[j]));
                if (result != 0) return result;
                i++; j++;
            }
        }
        return (s1.Length - i) - (s2.Length - j);
    }
}
"@

# Use custom comparer
$comparer = New-Object NaturalStringComparer
"file1.txt", "file10.txt", "file2.txt" | Sort-Object -Comparer $comparer
```

#### 6.12.1.2 Practical Custom Comparer Example

```powershell
# Create version comparer
Add-Type @"
using System;
using System.Collections;

public class VersionComparer : IComparer {
    public int Compare(object x, object y) {
        Version v1 = new Version(x.ToString());
        Version v2 = new Version(y.ToString());
        return v1.CompareTo(v2);
    }
}
"@

# Compare software versions
$versions = "1.0", "1.0.1", "2.0", "1.10", "1.2"
$comparer = New-Object VersionComparer
$versions | Sort-Object -Comparer $comparer
```

### 6.12.2 Advanced Statistical Analysis

#### 6.12.2.1 Percentile Calculation

```powershell
function Get-Percentile {
    param(
        [double[]]$Data,
        [ValidateRange(0, 100)]
        [double]$Percentile
    )
    
    $sorted = $Data | Sort-Object
    $index = ($sorted.Count - 1) * $Percentile / 100
    $lower = [math]::Floor($index)
    $upper = [math]::Ceiling($index)
    
    if ($lower -eq $upper) {
        return $sorted[$lower]
    }
    
    $fraction = $index - $lower
    $sorted[$lower] + ($sorted[$upper] - $sorted[$lower]) * $fraction
}

# Usage
$cpuValues = Get-Process | ForEach-Object { $_.CPU }
"Median CPU: {0:N2}%" -f (Get-Percentile $cpuValues 50)
"95th Percentile CPU: {0:N2}%" -f (Get-Percentile $cpuValues 95)
```

#### 6.12.2.2 Moving Average Calculation

```powershell
function Get-MovingAverage {
    param(
        [double[]]$Data,
        [int]$WindowSize
    )
    
    $result = [System.Collections.Generic.List[double]]::new()
    
    for ($i = 0; $i -lt $Data.Count; $i++) {
        $start = [math]::Max(0, $i - $WindowSize + 1)
        $window = $Data[$start..$i]
        $avg = ($window | Measure-Object -Average).Average
        $result.Add($avg)
    }
    
    $result
}

# Usage
$cpuSamples = 1..60 | ForEach-Object {
    (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue
    Start-Sleep -Seconds 1
}

$movingAvg = Get-MovingAverage $cpuSamples 5
$movingAvg | Format-Table -AutoSize
```

#### 6.12.2.3 Correlation Analysis

```powershell
function Get-Correlation {
    param(
        [double[]]$X,
        [double[]]$Y
    )
    
    $n = [math]::Min($X.Count, $Y.Count)
    if ($n -lt 2) { return 0 }
    
    $sumX = 0
    $sumY = 0
    $sumXY = 0
    $sumX2 = 0
    $sumY2 = 0
    
    for ($i = 0; $i -lt $n; $i++) {
        $sumX += $X[$i]
        $sumY += $Y[$i]
        $sumXY += $X[$i] * $Y[$i]
        $sumX2 += $X[$i] * $X[$i]
        $sumY2 += $Y[$i] * $Y[$i]
    }
    
    $numerator = $n * $sumXY - $sumX * $sumY
    $denominator = [math]::Sqrt(
        ($n * $sumX2 - $sumX * $sumX) * 
        ($n * $sumY2 - $sumY * $sumY)
    )
    
    if ($denominator -eq 0) { 0 } else { $numerator / $denominator }
}

# Usage
$processes = Get-Process
$cpuValues = $processes | ForEach-Object { $_.CPU }
$memoryValues = $processes | ForEach-Object { $_.WorkingSet / 1MB }

"CPU-Memory correlation: {0:N4}" -f (Get-Correlation $cpuValues $memoryValues)
```

### 6.12.3 Parallel Sorting and Measurement (PowerShell 7+)

PowerShell 7 introduces parallel processing capabilities for improved performance.

#### 6.12.3.1 Basic Parallel Sorting

```powershell
# Sort large dataset in parallel
$sorted = 1..10000 | ForEach-Object -Parallel {
    $chunk = $_
    $chunk | Sort-Object
} -ThrottleLimit 5 | Sort-Object
```

#### 6.12.3.2 Advanced Parallel Measurement

```powershell
# Measure large dataset in parallel
$total = 1..10 | ForEach-Object -Parallel {
    $chunk = $_
    $chunk | Measure-Object -Sum
} | 
    Measure-Object Sum -Sum

"Total: {0:N0}" -f $total.Sum
```

#### 6.12.3.3 Performance Comparison

```powershell
# Compare sequential vs. parallel sorting
$sequential = Measure-Command {
    1..100000 | Sort-Object
}

$parallel = Measure-Command {
    $chunks = 1..100000 | Split-Pipeline -Size 10000
    $sortedChunks = $chunks | ForEach-Object -Parallel {
        $_ | Sort-Object
    }
    $sortedChunks | ForEach-Object { $_ } | Sort-Object
}

[pscustomobject]@{
    Method = "Sequential"
    Time = $sequential.TotalSeconds
} | Format-Table

[pscustomobject]@{
    Method = "Parallel"
    Time = $parallel.TotalSeconds
} | Format-Table
```

### 6.12.4 Custom Measurement Functions

#### 6.12.4.1 Basic Measurement Function

```powershell
function Measure-ObjectStatistics {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromPipeline=$true)]
        $InputObject,
        
        [string]
        $Property,
        
        [switch]
        $IncludeStandardDeviation
    )
    
    begin {
        $values = [System.Collections.Generic.List[double]]::new()
    }
    
    process {
        if ($Property) {
            $value = $_.$Property
        } else {
            $value = $_
        }
        
        if ($value -is [numeric]) {
            $values.Add([double]$value)
        }
    }
    
    end {
        $count = $values.Count
        if ($count -eq 0) {
            Write-Warning "No numeric values to measure"
            return
        }
        
        $sum = ($values | Measure-Object -Sum).Sum
        $average = $sum / $count
        $minimum = $values | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
        $maximum = $values | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
        
        $result = [PSCustomObject]@{
            Count = $count
            Sum = $sum
            Average = $average
            Minimum = $minimum
            Maximum = $maximum
        }
        
        if ($IncludeStandardDeviation) {
            $variance = ($values | ForEach-Object { 
                [math]::Pow($_ - $average, 2) 
            } | Measure-Object -Sum).Sum / ($count - 1)
            $result | Add-Member -MemberType NoteProperty -Name "StandardDeviation" -Value ([math]::Sqrt($variance))
        }
        
        $result
    }
}

# Usage
Get-Process | Measure-ObjectStatistics WorkingSet -IncludeStandardDeviation
```

#### 6.12.4.2 Advanced Measurement Function

```powershell
function Measure-ObjectDistribution {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromPipeline=$true)]
        $InputObject,
        
        [string]
        $Property,
        
        [int]
        $Buckets = 10,
        
        [switch]
        $LogScale
    )
    
    begin {
        $values = [System.Collections.Generic.List[double]]::new()
    }
    
    process {
        if ($Property) {
            $value = $_.$Property
        } else {
            $value = $_
        }
        
        if ($value -is [numeric]) {
            $values.Add([double]$value)
        }
    }
    
    end {
        if ($values.Count -eq 0) {
            Write-Warning "No numeric values to measure"
            return
        }
        
        $min = $values | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
        $max = $values | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
        
        if ($min -eq $max) {
            # All values are the same
            $buckets = @(1)
            $ranges = @("$min")
        } else {
            if ($LogScale) {
                $logMin = [math]::Log($min)
                $logMax = [math]::Log($max)
                $logStep = ($logMax - $logMin) / $Buckets
                
                $buckets = 0..($Buckets-1) | ForEach-Object {
                    $lower = [math]::Exp($logMin + ($_ * $logStep))
                    $upper = [math]::Exp($logMin + (($_ + 1) * $logStep))
                    [PSCustomObject]@{
                        Lower = $lower
                        Upper = $upper
                        Count = 0
                    }
                }
            } else {
                $step = ($max - $min) / $Buckets
                
                $buckets = 0..($Buckets-1) | ForEach-Object {
                    $lower = $min + ($_ * $step)
                    $upper = $min + (($_ + 1) * $step)
                    [PSCustomObject]@{
                        Lower = $lower
                        Upper = $upper
                        Count = 0
                    }
                }
            }
            
            # Count values in each bucket
            foreach ($value in $values) {
                for ($i = 0; $i -lt $Buckets.Count; $i++) {
                    if ($value -ge $buckets[$i].Lower -and $value -lt $buckets[$i].Upper) {
                        $buckets[$i].Count++
                        break
                    }
                    # Handle max value
                    if ($i -eq $Buckets.Count - 1 -and $value -eq $max) {
                        $buckets[$i].Count++
                        break
                    }
                }
            }
        }
        
        # Format results
        $results = $buckets | ForEach-Object {
            [PSCustomObject]@{
                Range = if ($LogScale) {
                    "{0:N2} - {1:N2}" -f $_.Lower, $_.Upper
                } else {
                    "{0:N2} - {1:N2}" -f $_.Lower, $_.Upper
                }
                Count = $_.Count
                Percent = $_.Count / $values.Count * 100
            }
        }
        
        $results | Sort-Object Range | 
            Select-Object Range, Count, 
                @{Name="Percent";Expression={"{0:N1}%" -f $_.Percent}}
    }
}

# Usage
Get-Process | Measure-ObjectDistribution WorkingSet -Buckets 5
```

## 6.13 Practical Sorting and Measurement Exercises

Apply your sorting and measurement knowledge with these hands-on exercises of varying difficulty.

### 6.13.1 Basic Sorting and Measurement Challenges

#### 6.13.1.1 Process Information

1. Sort processes by memory usage (descending)
2. Measure average CPU usage across all processes
3. Sort services by status (running first), then by name
4. Measure the total memory used by all processes

Solutions:
```powershell
# 1
Get-Process | Sort-Object WorkingSet -Descending

# 2
(Get-Process | Measure-Object CPU -Average).Average

# 3
Get-Service | Sort-Object @{Expression={if ($_.Status -eq "Running") {0} else {1}}}, Name

# 4
(Get-Process | Measure-Object WorkingSet -Sum).Sum / 1MB
```

#### 6.13.1.2 File System Information

1. Sort files by last write time (newest first)
2. Measure the total size of all files in a directory
3. Sort files by extension
4. Measure the average file size in a directory

Solutions:
```powershell
# 1
Get-ChildItem | Sort-Object LastWriteTime -Descending

# 2
(Get-ChildItem | Measure-Object Length -Sum).Sum / 1MB

# 3
Get-ChildItem | Sort-Object Extension

# 4
(Get-ChildItem | Measure-Object Length -Average).Average / 1KB
```

#### 6.13.1.3 Event Log Information

1. Sort event log entries by time (newest first)
2. Measure the number of event log entries
3. Sort events by severity (critical first)
4. Measure the distribution of event IDs

Solutions:
```powershell
# 1
Get-WinEvent -LogName System -MaxEvents 100 | Sort-Object TimeCreated -Descending

# 2
(Get-WinEvent -LogName System -MaxEvents 100 | Measure-Object).Count

# 3
Get-WinEvent -LogName System -MaxEvents 100 | 
    Sort-Object @{Expression={switch ($_.Level) { 1 {0} 2 {1} 3 {2} 4 {3} default {4} }}}

# 4
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object Id | 
    Select-Object Name, Count | 
    Sort-Object Count -Descending
```

### 6.13.2 Intermediate Sorting and Measurement Scenarios

#### 6.13.2.1 Process Analysis

1. Sort processes by CPU to memory ratio (descending)
2. Measure memory usage statistics by process owner
3. Sort processes by uptime (longest running first)
4. Measure the correlation between CPU and memory usage

Solutions:
```powershell
# 1
Get-Process | 
    Sort-Object @{Expression={if ($_.WorkingSet -gt 0) { $_.CPU / ($_.WorkingSet / 1MB) } else { 0 }}} -Descending

# 2
Get-Process -IncludeUserName | 
    Group-Object UserName | 
    ForEach-Object {
        [PSCustomObject]@{
            User = $_.Name
            AvgMemoryMB = ($_.Group | Measure-Object WorkingSet -Average).Average / 1MB
            MaxMemoryMB = ($_.Group | Measure-Object WorkingSet -Maximum).Maximum / 1MB
        }
    } | 
    Sort-Object AvgMemoryMB -Descending

# 3
Get-Process | 
    Sort-Object @{Expression={(Get-Date) - $_.StartTime}} -Descending

# 4
$processes = Get-Process
$cpuValues = $processes | ForEach-Object { $_.CPU }
$memoryValues = $processes | ForEach-Object { $_.WorkingSet / 1MB }

# Simple correlation (not statistically robust)
$avgCPU = ($cpuValues | Measure-Object -Average).Average
$avgMemory = ($memoryValues | Measure-Object -Average).Average

$numerator = 0
$denomCPU = 0
$denomMemory = 0

for ($i = 0; $i -lt $processes.Count; $i++) {
    $numerator += ($cpuValues[$i] - $avgCPU) * ($memoryValues[$i] - $avgMemory)
    $denomCPU += [math]::Pow($cpuValues[$i] - $avgCPU, 2)
    $denomMemory += [math]::Pow($memoryValues[$i] - $avgMemory, 2)
}

$correlation = $numerator / [math]::Sqrt($denomCPU * $denomMemory)
"CPU-Memory correlation: {0:N4}" -f $correlation
```

#### 6.13.2.2 File System Analysis

1. Sort files by size with appropriate units (B, KB, MB, GB)
2. Measure file type distribution by extension
3. Sort files by age (oldest first)
4. Measure duplicate file potential savings

Solutions:
```powershell
# 1
Get-ChildItem | 
    Sort-Object Length -Descending | 
    Select-Object Name, 
        @{Name="Size";Expression={
            $size = $_.Length
            if ($size -gt 1GB) { "{0:N2} GB" -f ($size / 1GB) }
            elseif ($size -gt 1MB) { "{0:N2} MB" -f ($size / 1MB) }
            elseif ($size -gt 1KB) { "{0:N2} KB" -f ($size / 1KB) }
            else { "$size B" }
        }}

# 2
Get-ChildItem | 
    Group-Object Extension | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={($_.Group | Measure-Object Length -Sum).Sum / 1MB}} |
    Sort-Object TotalSizeMB -Descending

# 3
Get-ChildItem | 
    Sort-Object @{Expression={((Get-Date) - $_.LastWriteTime).TotalDays}}

# 4
$duplicates = Get-ChildItem | 
    Group-Object Length | 
    Where-Object Count -gt 1

$potentialSavings = $duplicates | 
    ForEach-Object { ($_.Count - 1) * $_.Name } | 
    Measure-Object -Sum

"Potential savings: {0:N2} MB" -f ($potentialSavings.Sum / 1MB)
```

#### 6.13.2.3 Network Analysis

1. Sort connections by data transferred (descending)
2. Measure connection statistics by process
3. Sort remote addresses by geographic location
4. Measure network throughput over time

Solutions:
```powershell
# 1
Get-NetTCPConnection | 
    ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            ProcessName = $process.Name
            RemoteAddress = $_.RemoteAddress
            RemotePort = $_.RemotePort
            TotalMB = ($process.IOWriteBytes + $process.IOReadBytes) / 1MB
        }
    } | 
    Sort-Object TotalMB -Descending

# 2
Get-NetTCPConnection | 
    Group-Object { 
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $process.Name 
    } | 
    ForEach-Object {
        $data = $_.Group | ForEach-Object {
            $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
            $process.IOWriteBytes + $process.IOReadBytes
        }
        
        [PSCustomObject]@{
            Process = $_.Name
            ConnectionCount = $_.Count
            TotalMB = ($data | Measure-Object -Sum).Sum / 1MB
        }
    } | 
    Sort-Object TotalMB -Descending

# 3
# Note: Requires external IP geolocation service
Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    ForEach-Object {
        $geo = Get-IPGeolocation -IPAddress $_.RemoteAddress
        [PSCustomObject]@{
            RemoteAddress = $_.RemoteAddress
            Country = $geo.Country
            City = $geo.City
        }
    } | 
    Sort-Object Country, City

# 4
$samples = 1..10 | ForEach-Object {
    $bytes = (Get-NetAdapterStatistics).ReceivedBytes
    Start-Sleep -Seconds 5
    $elapsed = $_ * 5
    [PSCustomObject]@{
        Time = $elapsed
        Bytes = $bytes
    }
}

for ($i = 1; $i -lt $samples.Count; $i++) {
    $timeDiff = $samples[$i].Time - $samples[$i-1].Time
    $bytesDiff = $samples[$i].Bytes - $samples[$i-1].Bytes
    $samples[$i].Throughput = $bytesDiff / $timeDiff
}

$samples[1..($samples.Count-1)] | 
    Select-Object Time, 
        @{Name="ThroughputMbps";Expression={($_.Throughput * 8 / 1MB)}}
```

### 6.13.3 Advanced Sorting and Measurement Problems

#### 6.13.3.1 Performance Optimization

1. Optimize this sort for large directories:
   ```powershell
   Get-ChildItem C:\Data -Recurse | 
       Sort-Object { ((Get-Date) - $_.LastWriteTime).TotalDays }
   ```

2. Rewrite this measurement to avoid multiple passes:
   ```powershell
   $avg = (Get-Process | Measure-Object CPU -Average).Average
   $max = (Get-Process | Measure-Object CPU -Maximum).Maximum
   $min = (Get-Process | Measure-Object CPU -Minimum).Minimum
   ```

3. Optimize this pipeline for performance:
   ```powershell
   Get-Process | 
       Sort-Object CPU -Descending | 
       Select-Object -First 10 | 
       Select-Object Name, 
           @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}}
   ```

Solutions:
```powershell
# 1
# Pre-calculate age to avoid repeated calculations
$files = Get-ChildItem C:\Data -Recurse -File -ErrorAction SilentlyContinue
$filesWithAge = $files | ForEach-Object {
    [PSCustomObject]@{
        File = $_
        AgeDays = ((Get-Date) - $_.LastWriteTime).TotalDays
    }
}
$filesWithAge | Sort-Object AgeDays

# 2
# Single measurement pass
$result = Get-Process | Measure-Object CPU -Average -Maximum -Minimum
$avg = $result.Average
$max = $result.Maximum
$min = $result.Minimum

# 3
# Optimize pipeline order
Get-Process | 
    Where-Object CPU -ne $null | 
    Select-Object Name, 
        @{Name="MemoryMB";Expression={($_.WorkingSet / 1MB)}},
        CPU | 
    Sort-Object CPU -Descending | 
    Select-Object -First 10
```

#### 6.13.3.2 Complex Data Analysis

1. Calculate the 95th percentile of process CPU usage
2. Analyze file size distribution using logarithmic buckets
3. Calculate moving average of network throughput over time
4. Measure correlation between service startup time and memory usage

Solutions:
```powershell
# 1
$cpuValues = Get-Process | ForEach-Object { $_.CPU }
$sorted = $cpuValues | Sort-Object
$index = [math]::Floor(($sorted.Count - 1) * 0.95)
"95th Percentile CPU: {0:N2}%" -f $sorted[$index]

# 2
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue
$sizes = $files | ForEach-Object { $_.Length / 1MB }
$logSizes = $sizes | ForEach-Object { [math]::Log($_) }

$minLog = $logSizes | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
$maxLog = $logSizes | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$step = ($maxLog - $minLog) / 10

$buckets = 0..9 | ForEach-Object {
    $lower = [math]::Exp($minLog + ($_ * $step))
    $upper = [math]::Exp($minLog + (($_ + 1) * $step))
    [PSCustomObject]@{
        Range = "{0:N2} - {1:N2} MB" -f $lower, $upper
        Count = ($sizes | Where-Object { $_ -ge $lower -and $_ -lt $upper }).Count
    }
}

$buckets | Format-Table Range, Count

# 3
$samples = 1..60 | ForEach-Object {
    $bytes = (Get-NetAdapterStatistics).ReceivedBytes
    Start-Sleep -Seconds 1
    [PSCustomObject]@{
        Time = $_
        Bytes = $bytes
    }
}

$windowSize = 5
$movingAvg = for ($i = 0; $i -lt $samples.Count; $i++) {
    $start = [math]::Max(0, $i - $windowSize + 1)
    $window = $samples[$start..$i]
    $bytesDiff = $window[-1].Bytes - $window[0].Bytes
    $timeDiff = $window[-1].Time - $window[0].Time
    if ($timeDiff -gt 0) {
        $bytesDiff / $timeDiff
    } else {
        0
    }
}

$samples | ForEach-Object {
    $index = $_.Time - 1
    [PSCustomObject]@{
        Time = $_.Time
        Throughput = $movingAvg[$index]
    }
} | Format-Table

# 4
$services = Get-WmiObject Win32_Service | 
    Where-Object { $_.Status -eq "Running" -and $_.ProcessId -gt 0 }

$serviceData = $services | ForEach-Object {
    $process = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
    if ($process) {
        [PSCustomObject]@{
            StartTime = $process.StartTime
            MemoryMB = $process.WorkingSet / 1MB
        }
    }
}

$startTimeValues = $serviceData | ForEach-Object { 
    [double]($_.StartTime - (Get-Date).Date).TotalSeconds 
}
$memoryValues = $serviceData | ForEach-Object { $_.MemoryMB }

# Simple correlation (not statistically robust)
$avgStart = ($startTimeValues | Measure-Object -Average).Average
$avgMemory = ($memoryValues | Measure-Object -Average).Average

$numerator = 0
$denomStart = 0
$denomMemory = 0

for ($i = 0; $i -lt $serviceData.Count; $i++) {
    $numerator += ($startTimeValues[$i] - $avgStart) * ($memoryValues[$i] - $avgMemory)
    $denomStart += [math]::Pow($startTimeValues[$i] - $avgStart, 2)
    $denomMemory += [math]::Pow($memoryValues[$i] - $avgMemory, 2)
}

$correlation = $numerator / [math]::Sqrt($denomStart * $denomMemory)
"Startup-Memory correlation: {0:N4}" -f $correlation
```

#### 6.13.3.3 Advanced Reporting

1. Generate a process resource heatmap showing CPU vs. memory usage
2. Create a file system health dashboard with multiple statistical views
3. Build a network security scorecard based on connection patterns
4. Produce an Active Directory user activity timeline

Solutions:
```powershell
# 1
$processes = Get-Process | Where-Object WorkingSet -gt 0
$cpuMax = ($processes | Measure-Object CPU -Maximum).Maximum
$memoryMax = ($processes | Measure-Object WorkingSet -Maximum).Maximum

$processes | 
    Select-Object Name, 
        @{Name="CPUHeat";Expression={[math]::Min(10, [math]::Ceiling($_.CPU / $cpuMax * 10))}},
        @{Name="MemoryHeat";Expression={[math]::Min(10, [math]::Ceiling($_.WorkingSet / $memoryMax * 10))}} |
    Sort-Object CPUHeat, MemoryHeat -Descending |
    Format-Table Name, 
        @{Name="CPU";Expression={"█" * $_.CPUHeat}},
        @{Name="Memory";Expression={"█" * $_.MemoryHeat}} -AutoSize

# 2
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue

# Size distribution
$sizes = $files | ForEach-Object { $_.Length / 1MB }
$sizeStats = $sizes | Measure-Object -Minimum -Maximum -Average -StandardDeviation

# Age distribution
$ages = $files | ForEach-Object { ((Get-Date) - $_.LastWriteTime).Days }
$ageStats = $ages | Measure-Object -Minimum -Maximum -Average

# Extension distribution
$extensions = $files | 
    Group-Object Extension | 
    Select-Object Name, Count | 
    Sort-Object Count -Descending | 
    Select-Object -First 5

@"
File System Health Dashboard:
- Total files: {0}
- Size distribution (MB):
  Min: {1:N2}, Max: {2:N2}, Avg: {3:N2}, StdDev: {4:N2}
- Age distribution (days):
  Min: {5}, Max: {6}, Avg: {7:N1}
- Top extensions:
{8}
"@ -f $files.Count,
    $sizeStats.Minimum, $sizeStats.Maximum, $sizeStats.Average, $sizeStats.StandardDeviation,
    $ageStats.Minimum, $ageStats.Maximum, $ageStats.Average,
    ($extensions | Format-Table | Out-String)

# 3
$connections = Get-NetTCPConnection | Where-Object State -eq "Established"
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"

# External connections
$external = $connections | Where-Object { $privateIPs -notmatch $_.RemoteAddress }
$externalPercent = $external.Count / $connections.Count * 100

# High data transfer
$highData = $connections | ForEach-Object {
    $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        Process = $process.Name
        TotalMB = ($process.IOWriteBytes + $process.IOReadBytes) / 1MB
    }
} | Where-Object TotalMB -gt 100

# Score calculation
$score = 100
$score -= [math]::Min(50, $externalPercent)  # 1 point per percent external
$score -= [math]::Min(25, $highData.Count * 5)  # 5 points per high data connection

@"
Network Security Scorecard:
- Total connections: {0}
- External connections: {1} ({2:N1}%)
- High data transfer connections: {3}
- Security score: {4}/100
"@ -f $connections.Count,
    $external.Count, $externalPercent,
    $highData.Count,
    $score

# 4
$users = Get-ADUser -Filter * -Properties LastLogonDate, PasswordLastSet

# Activity timeline
$timeline = @(
    @{Period="Today"; Max=1}
    @{Period="This week"; Max=7}
    @{Period="This month"; Max=30}
    @{Period="This quarter"; Max=90}
    @{Period="This year"; Max=365}
    @{Period="Older"; Max=[int]::MaxValue}
)

$activity = $timeline | ForEach-Object {
    $maxDays = $_.Max
    $count = if ($maxDays -eq [int]::MaxValue) {
        $users | Where-Object { $_.LastLogonDate -and ((Get-Date) - $_.LastLogonDate).Days -ge 365 } | 
            Measure-Object | 
            Select-Object -ExpandProperty Count
    } else {
        $users | Where-Object { $_.LastLogonDate -and ((Get-Date) - $_.LastLogonDate).Days -le $maxDays } | 
            Measure-Object | 
            Select-Object -ExpandProperty Count
    }
    
    [PSCustomObject]@{
        Period = $_.Period
        Count = $count
        Percent = $count / $users.Count * 100
    }
}

$activity | 
    Format-Table Period, 
        @{Name="Count";Expression={"{0}" -f $_.Count}},
        @{Name="Percent";Expression={"{0:N1}%" -f $_.Percent}} -AutoSize
```

## 6.14 Summary

In this comprehensive chapter, you've gained deep knowledge of sorting and measuring objects in PowerShell with `Sort-Object` and `Measure-Object`:

- Understood the fundamental principles of sorting and measurement versus traditional text processing
- Mastered the syntax and usage patterns of `Sort-Object` for basic and advanced sorting scenarios
- Learned techniques for sorting by single properties, multiple properties, and calculated properties
- Discovered custom sorting logic using script blocks and .NET comparers
- Gained insights into the capabilities of `Measure-Object` for statistical analysis
- Explored basic and advanced measurement techniques including standard deviation and correlation
- Learned performance considerations and optimization strategies for large datasets
- Explored real-world sorting and measurement scenarios across process management, file systems, event logs, Active Directory, and networking
- Identified and learned to avoid common sorting and measurement mistakes and pitfalls
- Acquired troubleshooting techniques for diagnosing sorting and measurement issues
- Explored advanced topics like custom comparers, statistical analysis, and parallel processing

You now have the knowledge and skills to effectively organize and analyze data in PowerShell, transforming raw information into meaningful insights that drive better decision-making and automation. Sorting and measurement are foundational skills that enable you to make sense of complex data and extract valuable information for system administration and automation tasks.

## 6.15 Next Steps Preview: Chapter 7 – Grouping Objects with Group-Object

In the next chapter, we'll explore `Group-Object`, PowerShell's cmdlet for grouping objects based on common properties. You'll learn:

- How to group objects by one or multiple properties
- Techniques for working with grouped data
- Advanced grouping with calculated properties and script blocks
- Combining grouping with sorting, measurement, and filtering
- Performance considerations for grouping large datasets
- Real-world examples of grouping in administration tasks
- Creating custom views of grouped data
- Common pitfalls and how to avoid them

You'll gain the ability to organize data into meaningful categories, revealing patterns and relationships that are not apparent in flat data structures. This capability is essential for advanced data analysis and reporting in PowerShell.