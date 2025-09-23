# 7. Grouping Objects with Group-Object

Grouping is a powerful data organization technique that reveals patterns and relationships within your data. While sorting arranges data in sequence and measurement extracts statistical insights, grouping categorizes data into meaningful segments based on shared characteristics. This chapter provides a comprehensive guide to grouping objects in PowerShell with the `Group-Object` cmdlet, covering both fundamental concepts and advanced techniques.

This chapter covers:
- The fundamental principles of object grouping in PowerShell
- Detailed syntax and usage patterns for `Group-Object`
- Basic and advanced grouping techniques using properties and calculated expressions
- Working with grouped object collections and their properties
- Combining grouping with sorting, measurement, and filtering
- Performance considerations for grouping large datasets
- Real-world grouping scenarios across different domains
- Common mistakes and how to avoid them
- Troubleshooting techniques for complex grouping operations
- Advanced grouping techniques and custom implementations
- Practical exercises to reinforce learning

By the end of this chapter, you'll be able to organize data into meaningful categories, revealing patterns and relationships that are not apparent in flat data structures. This capability is essential for advanced data analysis and reporting in PowerShell.

## 7.1 Understanding Object Grouping in PowerShell

Grouping transforms flat data into hierarchical structures by organizing objects into categories based on shared properties. Unlike traditional shells that require complex text processing for grouping, PowerShell provides native cmdlet support that works directly with objects.

### 7.1.1 The Importance of Object Grouping

Grouping serves several critical purposes in PowerShell:

1. **Pattern recognition**: Revealing relationships and distributions within data
2. **Data categorization**: Organizing information into meaningful segments
3. **Aggregate analysis**: Enabling statistical operations on subsets of data
4. **Report generation**: Structuring data for documentation and presentation
5. **Anomaly detection**: Identifying outliers through comparative analysis
6. **Decision support**: Providing categorized insights for informed decision-making

Consider this real-world example: analyzing process resource usage.

**Without grouping**:
```powershell
Get-Process | Select-Object Name, Id, CPU, WorkingSet
```

This outputs a flat list with no categorization.

**With grouping**:
```powershell
Get-Process | 
    Group-Object Company | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="AvgCPU";Expression={($_.Group | Measure-Object CPU -Average).Average}},
        @{Name="TotalMemoryMB";Expression={($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB}} |
    Sort-Object TotalMemoryMB -Descending |
    Format-Table -AutoSize
```

This reveals:
- Which companies' software consumes the most resources
- Average CPU usage per vendor
- Total memory consumption by vendor
- Relative contribution of each vendor to system load

### 7.1.2 Grouping vs. Traditional Shell Approaches

Traditional shells like Bash rely on external tools for grouping:

```bash
ps aux | awk '{print $11}' | sort | uniq -c | sort -nr
```

This approach has significant limitations:

1. **Fragility**: Depends on specific column positions and output formatting
2. **Locale sensitivity**: Behaves differently with different number formats
3. **Type ambiguity**: Treats all data as strings, requiring manual conversion
4. **Tool dependency**: Requires multiple external tools (awk, sort, uniq)
5. **Limited analysis**: Basic counting only, no rich object manipulation

PowerShell's object-based approach avoids these issues:

```powershell
Get-Process | Group-Object Company | 
    Sort-Object Count -Descending | 
    Select-Object Name, Count
```

This approach:
- Directly references named properties
- Understands data types (numeric, string, date)
- Provides access to original objects within groups
- Enables complex analysis within groups
- Works consistently across different data sources

### 7.1.3 PowerShell's Object-Based Grouping Approach

PowerShell grouping works with structured objects rather than text streams:

```
┌─────────────┐     ┌───────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Data Source │────▶│ Group-Object      │────▶│ Analyze Groups   │────▶│ Categorized  │
│ (Objects)   │     │ (Group Data)      │     │ (Statistics,     │     │ Insights     │
└─────────────┘     └───────────────────┘     │ Sorting, etc.)   │     └──────────────┘
                                            └──────────────────┘
```

Key advantages:
- **Type awareness**: Understands numeric, string, and date values
- **Property access**: Directly references object properties
- **Streaming**: Processes one object at a time, minimizing memory usage
- **Consistency**: Same approach works across different data sources
- **Rich analysis**: Provides access to original objects within groups

This object-oriented approach enables sophisticated data categorization patterns that would be extremely difficult with text-based tools.

## 7.2 Introduction to Group-Object

`Group-Object` is PowerShell's primary cmdlet for grouping objects in the pipeline based on specified properties.

### 7.2.1 Basic Syntax and Structure

`Group-Object` has several usage patterns:

#### 7.2.1.1 Basic Property Grouping

```powershell
# Group processes by company
Get-Process | Group-Object Company

# Group files by extension
Get-ChildItem | Group-Object Extension
```

#### 7.2.1.2 Case Sensitivity Control

```powershell
# Case-sensitive grouping
Get-Process | Group-Object Name -CaseSensitive

# Case-insensitive grouping (default)
Get-Process | Group-Object Name
```

#### 7.2.1.3 No Element Output

```powershell
# Group without including original objects
Get-Process | Group-Object Company -NoElement
```

This returns only group names and counts, reducing memory usage.

#### 7.2.1.4 Hash Table Output

```powershell
# Output as hash table
Get-Process | Group-Object Company -AsHashTable -AsString
```

This creates a hash table where keys are group names and values are group objects.

### 7.2.2 Positional Parameters

`Group-Object` accepts property names positionally:

```powershell
# Equivalent to: Group-Object Company
Get-Process | Group-Object Company
```

This positional flexibility improves typing efficiency but can reduce script clarity, especially with complex grouping.

### 7.2.3 Understanding Group-Object Output

`Group-Object` returns objects of type `Microsoft.PowerShell.Commands.GroupInfo` with these key properties:

| Property | Description |
|----------|-------------|
| `Name` | The value used for grouping (the "key") |
| `Count` | Number of objects in the group |
| `Group` | Array of the original objects in the group |
| `Values` | Array of the values used for grouping (when using calculated properties) |

#### 7.2.3.1 Basic Group Output

```powershell
Get-Process | Group-Object Company | Format-List *
```

Sample output:
```
Name   : Microsoft Corporation
Count  : 15
Group  : {explorer, SearchIndexer, dllhost, SecurityHealthService...}
Values : {Microsoft Corporation, Microsoft Corporation, Microsoft Corporation...}
```

#### 7.2.3.2 NoElement Output

```powershell
Get-Process | Group-Object Company -NoElement | Format-List *
```

Sample output:
```
Name  : Microsoft Corporation
Count : 15
```

#### 7.2.3.3 Hash Table Output

```powershell
Get-Process | Group-Object Company -AsHashTable -AsString
```

Sample output:
```
Key          Value
---          -----
Microsoft Corporation {explorer, SearchIndexer, dllhost, SecurityHealthService...}
```

### 7.2.4 Comparison with Other Grouping Methods

PowerShell offers multiple approaches for grouping data.

#### 7.2.4.1 Group-Object vs. Manual Grouping

```powershell
# Group-Object approach (preferred)
Get-Process | Group-Object Company

# Manual grouping approach
$groups = @{}
Get-Process | ForEach-Object {
    $key = $_.Company
    if (-not $groups.ContainsKey($key)) {
        $groups[$key] = @()
    }
    $groups[$key] += $_
}
$groups
```

`Group-Object` is generally preferred because:
- More concise and readable
- Handles the pipeline efficiently
- Provides standard output format
- Better performance for most scenarios

#### 7.2.4.2 Group-Object vs. Group-PSObject (PowerShell 7.2+)

PowerShell 7.2 introduced `Group-PSObject`, which provides enhanced grouping capabilities:

```powershell
# Traditional Group-Object
Get-Process | Group-Object Company

# Enhanced Group-PSObject (PowerShell 7.2+)
Get-Process | Group-PSObject Company -NoElement
```

`Group-PSObject` offers:
- Better performance
- Additional parameters for advanced scenarios
- More consistent behavior
- Future-proof implementation

## 7.3 Basic Grouping Techniques

Understanding basic grouping techniques is essential before moving to more advanced scenarios.

### 7.3.1 Grouping by Single Property

#### 7.3.1.1 String Property Grouping

```powershell
# Group processes by company
Get-Process | Group-Object Company

# Group services by status
Get-Service | Group-Object Status
```

#### 7.3.1.2 Numeric Property Grouping

```powershell
# Group processes by priority class
Get-Process | Group-Object PriorityClass

# Group files by size ranges (using calculated property - see 7.4)
```

#### 7.3.1.3 Date Property Grouping

```powershell
# Group files by creation date
Get-ChildItem | Group-Object CreationTime.Date

# Group event log entries by date
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object { $_.TimeCreated.Date }
```

### 7.3.2 Case Sensitivity in Grouping

#### 7.3.2.1 Case-Insensitive Grouping (Default)

```powershell
# Case-insensitive grouping (default)
"Apple", "apple", "banana" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name

# Result: 2 groups (Apple/apple, banana)
```

#### 7.3.2.2 Case-Sensitive Grouping

```powershell
# Case-sensitive grouping
"Apple", "apple", "banana" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name -CaseSensitive

# Result: 3 groups (Apple, apple, banana)
```

#### 7.3.2.3 Practical Case Sensitivity Examples

```powershell
# Processes grouped case-sensitively by name
Get-Process | Group-Object Name -CaseSensitive

# Files grouped case-sensitively by extension
Get-ChildItem | Group-Object Extension -CaseSensitive

# Services grouped case-insensitively by display name
Get-Service | Group-Object DisplayName
```

### 7.3.3 Working with Group Results

#### 7.3.3.1 Basic Group Analysis

```powershell
# Get group counts
Get-Process | Group-Object Company | 
    Select-Object Name, Count | 
    Sort-Object Count -Descending

# Get largest groups
Get-Process | Group-Object Company | 
    Sort-Object Count -Descending | 
    Select-Object -First 5
```

#### 7.3.3.2 Accessing Group Members

```powershell
# Access processes in a specific group
$groups = Get-Process | Group-Object Company
$groups | Where-Object Name -eq "Microsoft Corporation" | 
    Select-Object -ExpandProperty Group

# Get properties of group members
$groups = Get-Process | Group-Object Company
$groups | ForEach-Object {
    [PSCustomObject]@{
        Company = $_.Name
        ProcessCount = $_.Count
        TotalMemoryMB = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
    }
}
```

#### 7.3.3.3 Practical Group Analysis Examples

```powershell
# Process company analysis
Get-Process | Group-Object Company | 
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

# Service status analysis
Get-Service | Group-Object Status | 
    Select-Object Name, Count |
    Format-Table -AutoSize

# File extension analysis
Get-ChildItem | Group-Object Extension | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }} |
    Sort-Object TotalSizeMB -Descending |
    Format-Table -AutoSize
```

### 7.3.4 Pipeline Grouping

#### 7.3.4.1 Basic Pipeline Grouping

```powershell
# Group processes, then analyze
Get-Process | 
    Group-Object Company | 
    Sort-Object Count -Descending | 
    Select-Object -First 10 | 
    Select-Object Name, Count
```

#### 7.3.4.2 Order of Operations

Optimal pipeline order for performance:
1. Server-side filtering (cmdlet parameters)
2. Client-side filtering (`Where-Object`)
3. Grouping (`Group-Object`)
4. Sorting (`Sort-Object`)
5. Property selection (`Select-Object`)

```powershell
# Optimal order
Get-Process | 
    Where-Object Company -ne $null | 
    Group-Object Company | 
    Sort-Object Count -Descending | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }}
```

## 7.4 Advanced Grouping Techniques

Beyond basic property grouping, `Group-Object` supports sophisticated grouping patterns.

### 7.4.1 Multi-Property Grouping

#### 7.4.1.1 Basic Multi-Property Grouping

```powershell
# Group services by status and start type
Get-Service | Group-Object Status, StartType
```

Objects are grouped by the combination of specified properties.

#### 7.4.1.2 Practical Multi-Property Examples

```powershell
# Group processes by company and priority class
Get-Process | Group-Object Company, PriorityClass

# Group files by directory and extension
Get-ChildItem -Recurse | Group-Object DirectoryName, Extension

# Group network connections by local port and remote address
Get-NetTCPConnection | Group-Object LocalPort, RemoteAddress
```

### 7.4.2 Calculated Property Grouping

#### 7.4.2.1 Basic Calculated Property Grouping

```powershell
# Group files by size ranges
Get-ChildItem | 
    Group-Object { 
        if ($_.Length -gt 1GB) { "1GB+" }
        elseif ($_.Length -gt 100MB) { "100MB-1GB" }
        elseif ($_.Length -gt 10MB) { "10MB-100MB" }
        else { "<10MB" }
    }
```

#### 7.4.2.2 Complex Calculated Grouping

```powershell
# Group processes by CPU usage ranges
Get-Process | 
    Group-Object { 
        if ($_.CPU -gt 75) { "High" }
        elseif ($_.CPU -gt 50) { "Medium-High" }
        elseif ($_.CPU -gt 25) { "Medium" }
        else { "Low" }
    }
```

#### 7.4.2.3 Practical Calculated Grouping Examples

```powershell
# Group files by age ranges
Get-ChildItem | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastWriteTime).Days
        if ($days -le 1) { "Today" }
        elseif ($days -le 7) { "This week" }
        elseif ($days -le 30) { "This month" }
        elseif ($days -le 90) { "This quarter" }
        else { "90+ days" }
    }

# Group event log entries by severity
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object { 
        switch ($_.Level) {
            1 { "Critical" }
            2 { "Error" }
            3 { "Warning" }
            4 { "Information" }
            default { "Unknown" }
        }
    }

# Group processes by memory usage to CPU ratio
Get-Process | 
    Where-Object { $_.WorkingSet -gt 0 } | 
    Group-Object { 
        $ratio = $_.CPU / ($_.WorkingSet / 1MB)
        if ($ratio -gt 1) { "High CPU per MB" }
        elseif ($ratio -gt 0.5) { "Medium CPU per MB" }
        else { "Low CPU per MB" }
    }
```

### 7.4.3 Custom Grouping Logic with Script Blocks

#### 7.4.3.1 Basic Custom Grouping

```powershell
# Group processes by name length ranges
Get-Process | 
    Group-Object { 
        if ($_.Name.Length -gt 15) { "Long" }
        elseif ($_.Name.Length -gt 10) { "Medium" }
        else { "Short" }
    }
```

#### 7.4.3.2 Complex Custom Grouping

```powershell
# Group services by criticality
$criticalServices = "LanmanServer", "Netlogon", "EventLog"
Get-Service | 
    Group-Object { 
        if ($_.Name -in $criticalServices) { "Critical" }
        elseif ($_.StartType -eq "Automatic") { "Standard" }
        else { "Non-essential" }
    }
```

#### 7.4.3.3 Practical Custom Grouping Examples

```powershell
# Group processes by owner type
Get-Process -IncludeUserName | 
    Group-Object { 
        if ($_.UserName -match "Administrators") { "Admin" }
        elseif ($_.UserName -match "SYSTEM") { "System" }
        else { "User" }
    }

# Group files by permission type
Get-ChildItem | 
    ForEach-Object {
        $acl = Get-Acl $_.FullName -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            File = $_
            Owner = $acl.Owner
        }
    } | 
    Group-Object { 
        if ($_.Owner -match "Administrators") { "Admin-owned" }
        elseif ($_.Owner -match "SYSTEM") { "System-owned" }
        else { "User-owned" }
    }

# Group network connections by threat level
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    Group-Object { 
        if ($privateIPs -match $_.RemoteAddress) { "Internal" } 
        else { "External" } 
    }
```

### 7.4.4 Grouping with Culture-Specific Rules

#### 7.4.4.1 Culture-Aware Grouping

```powershell
# Group using current culture
"äpple", "apple", "banana" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name

# Group using specific culture (Swedish)
$swedish = [System.Globalization.CultureInfo]"sv-SE"
"äpple", "apple", "banana" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name -Culture $swedish
```

#### 7.4.4.2 Ignoring Non-Grouping Elements

```powershell
# Group ignoring diacritics
$sortOptions = [System.Globalization.CompareOptions]::IgnoreNonSpace
"café", "cafe", "cable" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name -Culture "en-US" -Compare $sortOptions
```

#### 7.4.4.3 Practical Culture-Specific Grouping

```powershell
# Group file names with culture-specific rules
Get-ChildItem | Group-Object Name -Culture "en-US"

# Group processes by name with Turkish-specific rules (I vs ı)
$turkish = [System.Globalization.CultureInfo]"tr-TR"
Get-Process | Group-Object Name -Culture $turkish

# Group using linguistic sorting (vs. ordinal)
$linguistic = [System.Globalization.CompareOptions]::StringSort
"file10.txt", "file2.txt", "file1.txt" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name -Compare $linguistic
```

## 7.5 Working with Grouped Data

Once data is grouped, you need techniques to analyze and transform the grouped results.

### 7.5.1 Basic Group Analysis

#### 7.5.1.1 Group Count Analysis

```powershell
# Top 10 largest groups
Get-Process | Group-Object Company | 
    Sort-Object Count -Descending | 
    Select-Object -First 10

# Groups with more than 5 members
Get-Process | Group-Object Company | 
    Where-Object Count -gt 5
```

#### 7.5.1.2 Group Size Distribution

```powershell
# Group size statistics
$groups = Get-Process | Group-Object Company
$groups.Count | Measure-Object -Minimum -Maximum -Average -StandardDeviation

# Group size distribution
$groups | 
    Group-Object { 
        if ($_.Count -gt 10) { ">10" }
        elseif ($_.Count -gt 5) { "6-10" }
        else { "<=5" }
    } | 
    Select-Object Name, Count
```

### 7.5.2 Analyzing Group Members

#### 7.5.2.1 Basic Member Analysis

```powershell
# Average CPU per company
Get-Process | Group-Object Company | 
    Select-Object Name, 
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }}

# Total memory per company
Get-Process | Group-Object Company | 
    Select-Object Name, 
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }}
```

#### 7.5.2.2 Advanced Member Analysis

```powershell
# Company resource efficiency (CPU per MB)
Get-Process | 
    Where-Object WorkingSet -gt 0 | 
    Group-Object Company | 
    Select-Object Name, 
        @{Name="CPUperMB";Expression={
            $totalCPU = ($_.Group | Measure-Object CPU -Sum).Sum
            $totalMemoryMB = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
            if ($totalMemoryMB -gt 0) { $totalCPU / $totalMemoryMB } else { 0 }
        }} |
    Sort-Object CPUperMB -Descending
```

#### 7.5.2.3 Practical Group Analysis Examples

```powershell
# Process company analysis
Get-Process | Group-Object Company | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }},
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }},
        @{Name="PeakMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Maximum).Maximum / 1MB
        }} |
    Sort-Object TotalMemoryMB -Descending |
    Format-Table -AutoSize

# Service status analysis by startup type
Get-Service | Group-Object Status, StartType | 
    Select-Object @{Name="Status";Expression={$_.Values[0]}},
        @{Name="StartType";Expression={$_.Values[1]}},
        Count |
    Sort-Object Status, StartType |
    Format-Table -AutoSize

# File extension analysis
Get-ChildItem | Group-Object Extension | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="AvgSizeKB";Expression={
            ($_.Group | Measure-Object Length -Average).Average / 1KB
        }} |
    Sort-Object TotalSizeMB -Descending |
    Format-Table -AutoSize
```

### 7.5.3 Transforming Grouped Data

#### 7.5.3.1 Basic Data Transformation

```powershell
# Convert groups to custom objects
Get-Process | Group-Object Company | 
    ForEach-Object {
        [PSCustomObject]@{
            Company = $_.Name
            ProcessCount = $_.Count
            TotalMemoryMB = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }
    }
```

#### 7.5.3.2 Advanced Data Transformation

```powershell
# Create hierarchical report
Get-Process | 
    Group-Object Company | 
    ForEach-Object {
        $company = $_.Name
        $_.Group | 
            Group-Object PriorityClass | 
            ForEach-Object {
                [PSCustomObject]@{
                    Company = $company
                    Priority = $_.Name
                    Count = $_.Count
                    TotalMemoryMB = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
                }
            }
    } | 
    Sort-Object Company, Priority
```

#### 7.5.3.3 Practical Data Transformation Examples

```powershell
# Process resource heatmap by company
$processes = Get-Process | Where-Object Company -ne $null
$cpuMax = ($processes | Measure-Object CPU -Maximum).Maximum
$memoryMax = ($processes | Measure-Object WorkingSet -Maximum).Maximum

Get-Process | 
    Where-Object Company -ne $null | 
    Group-Object Company | 
    ForEach-Object {
        $avgCPU = ($_.Group | Measure-Object CPU -Average).Average
        $totalMemory = ($_.Group | Measure-Object WorkingSet -Sum).Sum
        
        [PSCustomObject]@{
            Company = $_.Name
            ProcessCount = $_.Count
            AvgCPU = $avgCPU
            TotalMemoryMB = $totalMemory / 1MB
            CPUHeat = "█" * [math]::Min(10, [math]::Ceiling($avgCPU / $cpuMax * 10))
            MemoryHeat = "█" * [math]::Min(10, [math]::Ceiling($totalMemory / $memoryMax * 10))
        }
    } | 
    Sort-Object TotalMemoryMB -Descending |
    Format-Table Company, ProcessCount, 
        @{Name="CPU";Expression={"{0:N2}%" -f $_.AvgCPU}},
        @{Name="MemoryMB";Expression={"{0:N2}" -f $_.TotalMemoryMB}},
        CPUHeat, MemoryHeat -AutoSize

# File system health report
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue

# Size distribution
$sizeGroups = $files | 
    Group-Object { 
        if ($_.Length -gt 1GB) { "1GB+" }
        elseif ($_.Length -gt 100MB) { "100MB-1GB" }
        elseif ($_.Length -gt 10MB) { "10MB-100MB" }
        else { "<10MB" }
    }

# Age distribution
$ageGroups = $files | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastWriteTime).Days
        if ($days -le 1) { "Today" }
        elseif ($days -le 7) { "This week" }
        elseif ($days -le 30) { "This month" }
        else { "30+ days" }
    }

@"
File System Health Report:
- Total files: {0:N0}
- Size distribution:
{1}
- Age distribution:
{2}
"@ -f $files.Count,
    ($sizeGroups | 
        Select-Object Name, 
            @{Name="Count";Expression={$_.Count}},
            @{Name="Percent";Expression={"{0:N1}%" -f ($_.Count / $files.Count * 100)}} |
        Format-Table | Out-String),
    ($ageGroups | 
        Select-Object Name, 
            @{Name="Count";Expression={$_.Count}},
            @{Name="Percent";Expression={"{0:N1}%" -f ($_.Count / $files.Count * 100)}} |
        Format-Table | Out-String)
```

### 7.5.4 Group Nesting

#### 7.5.4.1 Basic Nested Grouping

```powershell
# Nested grouping: Company → PriorityClass
Get-Process | 
    Group-Object Company | 
    ForEach-Object {
        $company = $_.Name
        $_.Group | 
            Group-Object PriorityClass | 
            ForEach-Object {
                [PSCustomObject]@{
                    Company = $company
                    Priority = $_.Name
                    Count = $_.Count
                }
            }
    }
```

#### 7.5.4.2 Multi-Level Nested Grouping

```powershell
# Three-level nesting: Company → PriorityClass → Process Name Length
Get-Process | 
    Group-Object Company | 
    ForEach-Object {
        $company = $_.Name
        $_.Group | 
            Group-Object PriorityClass | 
            ForEach-Object {
                $priority = $_.Name
                $_.Group | 
                    Group-Object { [math]::Min(15, $_.Name.Length) } | 
                    ForEach-Object {
                        [PSCustomObject]@{
                            Company = $company
                            Priority = $priority
                            NameLength = $_.Name
                            Count = $_.Count
                        }
                    }
            }
    }
```

#### 7.5.4.3 Practical Nested Grouping Examples

```powershell
# Service analysis: Status → StartType
Get-Service | 
    Group-Object Status | 
    ForEach-Object {
        $status = $_.Name
        $_.Group | 
            Group-Object StartType | 
            ForEach-Object {
                [PSCustomObject]@{
                    Status = $status
                    StartType = $_.Name
                    Count = $_.Count
                }
            }
    } | 
    Sort-Object Status, StartType |
    Format-Table -AutoSize

# File system analysis: Directory → Extension
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | 
    Group-Object DirectoryName | 
    ForEach-Object {
        $directory = $_.Name
        $_.Group | 
            Group-Object Extension | 
            ForEach-Object {
                $totalSize = ($_.Group | Measure-Object Length -Sum).Sum
                [PSCustomObject]@{
                    Directory = $directory
                    Extension = $_.Name
                    FileCount = $_.Count
                    TotalSizeMB = $totalSize / 1MB
                }
            }
    } | 
    Sort-Object Directory, TotalSizeMB -Descending |
    Format-Table -AutoSize

# Network connection analysis: Process → Connection Type
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"

Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            ProcessName = $process.Name
            RemoteAddress = $_.RemoteAddress
            IsInternal = $privateIPs -match $_.RemoteAddress
        }
    } | 
    Group-Object ProcessName | 
    ForEach-Object {
        $processName = $_.Name
        $_.Group | 
            Group-Object IsInternal | 
            ForEach-Object {
                $data = $_.Group | ForEach-Object {
                    $process = Get-Process -Name $processName -ErrorAction SilentlyContinue
                    $process.IOWriteBytes + $process.IOReadBytes
                }
                [PSCustomObject]@{
                    ProcessName = $processName
                    ConnectionType = if ($_.Name -eq "True") { "Internal" } else { "External" }
                    ConnectionCount = $_.Count
                    TotalMB = ($data | Measure-Object -Sum).Sum / 1MB
                }
            }
    } | 
    Sort-Object ProcessName, ConnectionType |
    Format-Table -AutoSize
```

## 7.6 Performance Considerations

Grouping operations can significantly impact script performance, especially with large datasets.

### 7.6.1 Grouping Performance

#### 7.6.1.1 Algorithm Complexity

`Group-Object` has O(n) complexity for most operations.

Performance considerations:
- Grouping time increases linearly with data size
- Memory usage is proportional to number of groups
- Property access adds overhead
- Calculated properties add significant overhead

#### 7.6.1.2 Measuring Grouping Performance

```powershell
# Measure grouping performance
$groupTime = Measure-Command {
    Get-Process | Group-Object Company
}

# Display results
[pscustomobject]@{
    Operation = "Group-Object Company"
    Time = $groupTime.TotalMilliseconds
    Processes = (Get-Process).Count
    Groups = (Get-Process | Group-Object Company).Count
} | Format-Table
```

#### 7.6.1.3 Performance Comparison: Different Grouping Types

```powershell
# Compare different grouping operations
$tests = @(
    @{Name="Company"; Script={Get-Process | Group-Object Company}}
    @{Name="Name"; Script={Get-Process | Group-Object Name}}
    @{Name="PriorityClass"; Script={Get-Process | Group-Object PriorityClass}}
    @{Name="Calculated (size)"; Script={
        Get-Process | Group-Object { if ($_.WorkingSet -gt 100MB) { "Large" } else { "Small" } }
    }}
)

$results = foreach ($test in $tests) {
    $time = Measure-Command { & $test.Script }
    [pscustomobject]@{
        Test = $test.Name
        TimeMs = $time.TotalMilliseconds
        Groups = (& $test.Script).Count
    }
}

$results | Format-Table -AutoSize
```

### 7.6.2 Optimizing Grouping Operations

#### 7.6.2.1 Reduce Data Before Grouping

```powershell
# Less efficient: groups all processes
Get-Process | Group-Object Company

# More efficient: filters then groups
Get-Process | 
    Where-Object Company -ne $null | 
    Group-Object Company
```

#### 7.6.2.2 Minimize Property Access

```powershell
# Less efficient: calculated property grouping
Get-Process | 
    Group-Object { if ($_.WorkingSet -gt 100MB) { "Large" } else { "Small" } }

# More efficient: group by native property when possible
Get-Process | Group-Object PriorityClass
```

#### 7.6.2.3 Use -NoElement for Large Datasets

```powershell
# Less efficient: includes all group members
Get-Process | Group-Object Company

# More efficient: only counts
Get-Process | Group-Object Company -NoElement
```

#### 7.6.2.4 Performance Comparison: Optimization Techniques

```powershell
# Compare optimization techniques
$tests = @(
    @{Name="Full group"; Script={Get-Process | Group-Object Company}}
    @{Name="Filter then group"; Script={
        Get-Process | Where-Object Company -ne $null | Group-Object Company
    }}
    @{Name="Native property"; Script={Get-Process | Group-Object PriorityClass}}
    @{Name="Calculated property"; Script={
        Get-Process | Group-Object { if ($_.WorkingSet -gt 100MB) { "Large" } else { "Small" } }
    }}
    @{Name="NoElement"; Script={Get-Process | Group-Object Company -NoElement}}
)

$results = foreach ($test in $tests) {
    $time = Measure-Command { & $test.Script }
    [pscustomobject]@{
        Test = $test.Name
        TimeMs = $time.TotalMilliseconds
        Groups = (& $test.Script).Count
    }
}

$results | Format-Table -AutoSize
```

### 7.6.3 Memory Considerations

#### 7.6.3.1 Memory Usage Analysis

```powershell
# Measure memory before grouping
$before = (Get-Process -Id $PID).WorkingSet

# Perform grouping
$groups = Get-Process | Group-Object Company

# Measure memory after grouping
$after = (Get-Process -Id $PID).WorkingSet

# Calculate difference
[pscustomobject]@{
    Operation = "Group-Object Company"
    MemoryIncreaseKB = ($after - $before) / 1KB
    Processes = (Get-Process).Count
    Groups = $groups.Count
} | Format-Table
```

#### 7.6.3.2 Memory Optimization Techniques

```powershell
# Technique 1: Use -NoElement to reduce memory
$groupsNoElement = Get-Process | Group-Object Company -NoElement

# Technique 2: Process in chunks for very large datasets
$chunkSize = 1000
$allData = Get-Process
$groupCounts = @{}

for ($i = 0; $i -lt $allData.Count; $i += $chunkSize) {
    $chunk = $allData[$i..($i + $chunkSize - 1)]
    $chunkGroups = $chunk | Group-Object Company
    
    foreach ($group in $chunkGroups) {
        if (-not $groupCounts.ContainsKey($group.Name)) {
            $groupCounts[$group.Name] = 0
        }
        $groupCounts[$group.Name] += $group.Count
    }
}

$groupCounts
```

#### 7.6.3.3 Performance vs. Memory Trade-offs

```powershell
# Compare memory usage of different approaches
$tests = @(
    @{Name="Full groups"; Script={
        $null = Get-Process | Group-Object Company
        (Get-Process -Id $PID).WorkingSet
    }}
    @{Name="NoElement"; Script={
        $null = Get-Process | Group-Object Company -NoElement
        (Get-Process -Id $PID).WorkingSet
    }}
    @{Name="Hash table"; Script={
        $groups = @{}
        Get-Process | ForEach-Object {
            $key = $_.Company
            if (-not $groups.ContainsKey($key)) {
                $groups[$key] = 0
            }
            $groups[$key]++
        }
        (Get-Process -Id $PID).WorkingSet
    }}
)

$baseMemory = (Get-Process -Id $PID).WorkingSet
$results = foreach ($test in $tests) {
    # Reset memory state
    [System.GC]::Collect()
    Start-Sleep -Milliseconds 100
    
    $memory = & $test.Script
    [pscustomobject]@{
        Test = $test.Name
        MemoryKB = ($memory - $baseMemory) / 1KB
    }
}

$results | Format-Table -AutoSize
```

### 7.6.4 Advanced Performance Techniques

#### 7.6.4.1 Parallel Grouping (PowerShell 7+)

```powershell
# Group large dataset in parallel
$chunkSize = 1000
$allData = 1..10000 | ForEach-Object { [PSCustomObject]@{Value = (Get-Random 10)} }

$groupedChunks = $allData | Split-Pipeline -Size $chunkSize | 
    ForEach-Object -Parallel {
        $_ | Group-Object Value
    }

# Combine results
$finalGroups = @{}
foreach ($chunk in $groupedChunks) {
    foreach ($group in $chunk) {
        if (-not $finalGroups.ContainsKey($group.Name)) {
            $finalGroups[$group.Name] = 0
        }
        $finalGroups[$group.Name] += $group.Count
    }
}

$finalGroups
```

#### 7.6.4.2 Memory-Efficient Grouping for Huge Datasets

```powershell
# Process huge dataset with minimal memory
$reader = [System.IO.File]::OpenText("huge_data.csv")
$groupCounts = @{}

try {
    while ($null -ne ($line = $reader.ReadLine())) {
        $value = $line.Split(',')[0]
        if (-not $groupCounts.ContainsKey($value)) {
            $groupCounts[$value] = 0
        }
        $groupCounts[$value]++
    }
}
finally {
    $reader.Close()
}

$groupCounts
```

#### 7.6.4.3 Performance Comparison: Advanced Techniques

```powershell
# Generate test data
$testData = 1..50000 | ForEach-Object { 
    [PSCustomObject]@{Value = (Get-Random 100)} 
}

# Compare techniques
$tests = @(
    @{Name="Group-Object"; Script={
        $testData | Group-Object Value
    }}
    @{Name="Hash table"; Script={
        $groups = @{}
        $testData | ForEach-Object {
            $key = $_.Value
            if (-not $groups.ContainsKey($key)) {
                $groups[$key] = 0
            }
            $groups[$key]++
        }
        $groups
    }}
    @{Name="Parallel"; Script={
        $chunkSize = 5000
        $testData | Split-Pipeline -Size $chunkSize | 
            ForEach-Object -Parallel {
                $chunkGroups = @{}
                $_ | ForEach-Object {
                    $key = $_.Value
                    if (-not $chunkGroups.ContainsKey($key)) {
                        $chunkGroups[$key] = 0
                    }
                    $chunkGroups[$key]++
                }
                $chunkGroups
            } | 
            ForEach-Object {
                $chunkGroups = $_
                $chunkGroups.GetEnumerator() | ForEach-Object {
                    [PSCustomObject]@{
                        Name = $_.Key
                        Count = $_.Value
                    }
                }
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

## 7.7 Real-World Grouping Scenarios

Grouping is essential for real-world administration tasks. Let's explore practical scenarios across different domains.

### 7.7.1 Process Management

#### 7.7.1.1 Resource Usage Analysis

```powershell
# Company resource consumption analysis
Get-Process | 
    Where-Object Company -ne $null | 
    Group-Object Company | 
    Select-Object Name, 
        @{Name="ProcessCount";Expression={$_.Count}},
        @{Name="TotalCPU";Expression={
            ($_.Group | Measure-Object CPU -Sum).Sum
        }},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }},
        @{Name="AvgMemoryPerProcessMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Average).Average / 1MB
        }} |
    Sort-Object TotalMemoryMB -Descending |
    Format-Table -AutoSize

# Priority class analysis
Get-Process | 
    Group-Object PriorityClass | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }} |
    Format-Table -AutoSize
```

#### 7.7.1.2 Process Ownership Analysis

```powershell
# User process ownership analysis
Get-Process -IncludeUserName | 
    Where-Object UserName -ne $null | 
    Group-Object UserName | 
    Select-Object Name, 
        @{Name="ProcessCount";Expression={$_.Count}},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }},
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }} |
    Sort-Object ProcessCount -Descending |
    Format-Table -AutoSize

# Process ownership by privilege level
$adminUsers = "Administrator", "Administrators", "NT AUTHORITY\SYSTEM"

Get-Process -IncludeUserName | 
    Where-Object UserName -ne $null | 
    Group-Object { 
        if ($_.UserName -in $adminUsers) { "Admin" }
        else { "User" }
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }},
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }} |
    Format-Table -AutoSize
```

### 7.7.2 File System Operations

#### 7.7.2.1 File Type Analysis

```powershell
# File extension statistics
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | 
    Group-Object Extension | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="AvgSizeKB";Expression={
            ($_.Group | Measure-Object Length -Average).Average / 1KB
        }},
        @{Name="LargestFile";Expression={
            ($_.Group | Sort-Object Length -Descending | Select-Object -First 1).Name
        }} |
    Sort-Object TotalSizeMB -Descending |
    Format-Table -AutoSize

# File size distribution
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue

$files | 
    Group-Object { 
        if ($_.Length -gt 1GB) { "1GB+" }
        elseif ($_.Length -gt 100MB) { "100MB-1GB" }
        elseif ($_.Length -gt 10MB) { "10MB-100MB" }
        elseif ($_.Length -gt 1MB) { "1MB-10MB" }
        elseif ($_.Length -gt 100KB) { "100KB-1MB" }
        else { "<100KB" }
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="AvgSizeKB";Expression={
            ($_.Group | Measure-Object Length -Average).Average / 1KB
        }} |
    Sort-Object { 
        switch ($_.Name) {
            "1GB+" { 0 }
            "100MB-1GB" { 1 }
            "10MB-100MB" { 2 }
            "1MB-10MB" { 3 }
            "100KB-1MB" { 4 }
            "<100KB" { 5 }
        }
    } |
    Format-Table -AutoSize
```

#### 7.7.2.2 File Age Analysis

```powershell
# File age distribution
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue

$files | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastWriteTime).Days
        if ($days -le 1) { "Today" }
        elseif ($days -le 7) { "This week" }
        elseif ($days -le 30) { "This month" }
        elseif ($days -le 90) { "This quarter" }
        else { "90+ days" }
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="AvgAgeDays";Expression={
            ($_.Group | 
                ForEach-Object { ((Get-Date) - $_.LastWriteTime).Days } | 
                Measure-Object -Average
            ).Average
        }} |
    Format-Table -AutoSize

# Directory activity analysis
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | 
    Group-Object DirectoryName | 
    Select-Object Name, 
        @{Name="FileCount";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="NewestFile";Expression={
            ($_.Group | Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1).LastWriteTime.ToString("yyyy-MM-dd")
        }},
        @{Name="OldestFile";Expression={
            ($_.Group | Sort-Object LastWriteTime | 
                Select-Object -First 1).LastWriteTime.ToString("yyyy-MM-dd")
        }} |
    Sort-Object FileCount -Descending |
    Select-Object -First 20 |
    Format-Table -AutoSize
```

### 7.7.3 Event Log Analysis

#### 7.7.3.1 Event Pattern Recognition

```powershell
# Event ID frequency analysis
Get-WinEvent -LogName System -MaxEvents 1000 | 
    Group-Object Id | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="First";Expression={$_.Group[0].TimeCreated}},
        @{Name="Last";Expression={$_.Group[-1].TimeCreated}},
        @{Name="FrequencyPerHour";Expression={
            $hours = ((Get-Date) - $_.Group[0].TimeCreated).TotalHours
            if ($hours -gt 0) { $_.Count / $hours } else { 0 }
        }} |
    Sort-Object Count -Descending |
    Format-Table -AutoSize

# Event severity distribution
Get-WinEvent -LogName System -MaxEvents 1000 | 
    Group-Object { 
        switch ($_.Level) {
            1 { "Critical" }
            2 { "Error" }
            3 { "Warning" }
            4 { "Information" }
            default { "Unknown" }
        }
    } | 
    Select-Object Name, Count |
    Format-Table -AutoSize
```

#### 7.7.3.2 Security Event Analysis

```powershell
# Failed login pattern analysis
$failedLogins = Get-WinEvent -LogName Security -MaxEvents 1000 | 
    Where-Object Id -eq 4625  # Failed logon

# Workstation analysis
$failedLogins | 
    Group-Object { 
        $xml = [xml]$_.ToXml()
        $xml.Event.EventData.Data[5].'#text'  # Workstation name
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="First";Expression={$_.Group[0].TimeCreated}},
        @{Name="Last";Expression={$_.Group[-1].TimeCreated}} |
    Sort-Object Count -Descending |
    Format-Table -AutoSize

# Account analysis
$failedLogins | 
    Group-Object { 
        $xml = [xml]$_.ToXml()
        $xml.Event.EventData.Data[0].'#text'  # Account name
    } | 
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Format-Table -AutoSize
```

### 7.7.4 Active Directory Queries

#### 7.7.4.1 User Activity Analysis

```powershell
# User logon pattern analysis
$users = Get-ADUser -Filter * -Properties LastLogonDate

$users | 
    Where-Object LastLogonDate | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastLogonDate).Days
        if ($days -le 7) { "Last week" }
        elseif ($days -le 30) { "Last month" }
        elseif ($days -le 90) { "Last quarter" }
        else { "90+ days" }
    } | 
    Select-Object Name, Count |
    Format-Table -AutoSize

# Password age analysis
$users = Get-ADUser -Filter * -Properties PasswordLastSet

$users | 
    Where-Object PasswordLastSet | 
    Group-Object { 
        $days = ((Get-Date) - $_.PasswordLastSet).Days
        if ($days -le 30) { "0-30 days" }
        elseif ($days -le 90) { "31-90 days" }
        else { "90+ days" }
    } | 
    Select-Object Name, Count |
    Format-Table -AutoSize
```

#### 7.7.4.2 Group Management Analysis

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

$groups | 
    Group-Object GroupType | 
    Select-Object Name, 
        @{Name="GroupCount";Expression={$_.Count}},
        @{Name="TotalMembers";Expression={
            ($_.Group | Measure-Object MemberCount -Sum).Sum
        }} |
    Format-Table -AutoSize

# Membership distribution
$groups | 
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
    Sort-Object TotalMembers -Descending |
    Format-Table -AutoSize
```

### 7.7.5 Network Configuration

#### 7.7.5.1 Connection Analysis

```powershell
# Connection pattern analysis
$connections = Get-NetTCPConnection | 
    Where-Object State -eq "Established"

# Remote address analysis
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"

$connections | 
    Group-Object { 
        if ($privateIPs -match $_.RemoteAddress) { "Internal" } 
        else { "External" } 
    } | 
    ForEach-Object {
        $data = $_.Group | ForEach-Object {
            $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
            $process.IOWriteBytes + $process.IOReadBytes
        }
        
        [PSCustomObject]@{
            ConnectionType = $_.Name
            ConnectionCount = $_.Count
            TotalMB = ($data | Measure-Object -Sum).Sum / 1MB
        }
    } |
    Format-Table -AutoSize

# Process connection analysis
$connections | 
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
    Format-Table -AutoSize
```

#### 7.7.5.2 DNS Analysis

```powershell
# DNS record analysis
$records = Get-DnsServerResourceRecord -ZoneName "example.com"

# Record type distribution
$records | 
    Group-Object RecordType | 
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Format-Table -AutoSize

# TTL distribution
$records | 
    Group-Object { 
        if ($_.TimeToLive.TotalSeconds -gt 86400) { ">1 day" }
        elseif ($_.TimeToLive.TotalSeconds -gt 3600) { "1 hour - 1 day" }
        elseif ($_.TimeToLive.TotalSeconds -gt 600) { "10 min - 1 hour" }
        else { "<10 min" }
    } | 
    Select-Object Name, Count |
    Format-Table -AutoSize
```

## 7.8 Common Grouping Mistakes

Even experienced PowerShell users make grouping mistakes. Understanding these pitfalls helps write more reliable scripts.

### 7.8.1 Grouping Mistakes

#### 7.8.1.1 Incorrect Grouping Logic

```powershell
# Groups by string value, not numeric value
"file1.txt", "file2.txt", "file10.txt" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name

# Result: 3 separate groups (file1.txt, file2.txt, file10.txt)
```

This happens because string grouping compares character by character.

#### 7.8.1.2 Case Sensitivity Issues

```powershell
# Case sensitivity behavior varies by platform
"apple", "Apple", "banana" | 
    ForEach-Object { [PSCustomObject]@{Name = $_} } | 
    Group-Object Name
# Windows: 2 groups (apple/Apple, banana)
# Linux: 3 groups (apple, Apple, banana)
```

#### 7.8.1.3 Pipeline Order Mistakes

```powershell
# Less efficient: groups full objects
Get-Process | 
    Group-Object Company | 
    Select-Object Name, Count

# More efficient: selects properties first (but not applicable here)
# Grouping requires full objects for -NoElement parameter
```

Unlike other cmdlets, grouping typically needs the full objects.

#### 7.8.1.4 Solutions

1. **Numeric grouping for numeric-like strings**:
   ```powershell
   "file1.txt", "file2.txt", "file10.txt" | 
       ForEach-Object { 
           [PSCustomObject]@{
               Name = $_
               SortKey = [int]($_ -replace "\D+", "")
           }
       } | 
       Group-Object SortKey
   ```

2. **Explicit case handling**:
   ```powershell
   # Case-insensitive grouping (explicit)
   "apple", "Apple", "banana" | 
       ForEach-Object { 
           [PSCustomObject]@{Name = $_.ToLower()} 
       } | 
       Group-Object Name
   
   # Case-sensitive grouping
   "apple", "Apple", "banana" | 
       ForEach-Object { 
           [PSCustomObject]@{Name = $_} 
       } | 
       Group-Object Name -CaseSensitive
   ```

3. **Understand grouping requirements**:
   ```powershell
   # Grouping typically needs full objects
   # Use -NoElement when only counts are needed
   Get-Process | Group-Object Company -NoElement
   ```

### 7.8.2 Group Analysis Mistakes

#### 7.8.2.1 Accessing Group Members Incorrectly

```powershell
# Incorrect: trying to access Group property outside pipeline
$groups = Get-Process | Group-Object Company
$groups.Group  # Returns all groups' Group properties as array
```

This doesn't provide access to individual group members.

#### 7.8.2.2 Incorrect Statistical Analysis

```powershell
# Incorrect: measuring the groups themselves
$groups = Get-Process | Group-Object Company
$groups | Measure-Object Count -Average

# Correct: measuring group members
$groups | ForEach-Object {
    $_.Group | Measure-Object CPU -Average
}
```

#### 7.8.2.3 Memory Issues with Large Groups

```powershell
# May cause out of memory error with large datasets
$groups = Get-Process | Group-Object Company
$groups | ForEach-Object {
    $_.Group | Measure-Object WorkingSet -Sum
}
```

Processing large groups can consume significant memory.

#### 7.8.2.4 Solutions

1. **Properly access group members**:
   ```powershell
   $groups = Get-Process | Group-Object Company
   $groups | ForEach-Object {
       [PSCustomObject]@{
           Company = $_.Name
           AvgCPU = ($_.Group | Measure-Object CPU -Average).Average
       }
   }
   ```

2. **Correct statistical analysis**:
   ```powershell
   Get-Process | Group-Object Company | 
       Select-Object Name, 
           @{Name="AvgCPU";Expression={
               ($_.Group | Measure-Object CPU -Average).Average
           }}
   ```

3. **Handle large groups carefully**:
   ```powershell
   Get-Process | 
       Group-Object Company | 
       ForEach-Object {
           $company = $_.Name
           $totalMemory = 0
           $_.Group | ForEach-Object {
               $totalMemory += $_.WorkingSet
           }
           [PSCustomObject]@{
               Company = $company
               TotalMemoryMB = $totalMemory / 1MB
           }
       }
   ```

### 7.8.3 Performance Anti-Patterns

#### 7.8.3.1 Grouping Unnecessarily

```powershell
# Unnecessary grouping
Get-Process | 
    Group-Object Name | 
    Where-Object Name -eq "powershell"
```

Grouping is unnecessary when filtering for a specific value.

#### 7.8.3.2 Grouping Before Filtering

```powershell
# Inefficient: groups all processes
Get-Process | 
    Group-Object Company | 
    Where-Object Name -ne $null
```

Filtering should typically precede grouping.

#### 7.8.3.3 Complex Calculated Properties in Grouping

```powershell
# Inefficient: complex calculation for each object
Get-Process | 
    Group-Object { 
        (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue 
    }
```

Performing expensive operations inside grouping expressions slows processing.

#### 7.8.3.4 Solutions

1. **Avoid unnecessary grouping**:
   ```powershell
   # Better: filter without grouping
   Get-Process -Name powershell
   ```

2. **Optimize grouping order**:
   ```powershell
   # Better: filter before grouping
   Get-Process | 
       Where-Object Company -ne $null | 
       Group-Object Company
   ```

3. **Pre-calculate expensive values**:
   ```powershell
   $cpuPercent = (Get-Counter "\Processor(_Total)\% Processor Time").CounterSamples.CookedValue
   Get-Process | 
       Add-Member -MemberType NoteProperty -Name "CPUPercent" -Value $cpuPercent -PassThru | 
       Group-Object CPUPercent
   ```

### 7.8.4 Unique Grouping Issues

#### 7.8.4.1 Unexpected Case Sensitivity

```powershell
# Returns separate groups ("test.txt" and "TEST.TXT")
"test.txt", "TEST.TXT" | 
    ForEach-Object { 
        [PSCustomObject]@{Name = $_} 
    } | 
    Group-Object Name
```

Grouping behavior varies by platform for case sensitivity.

#### 7.8.4.2 Property Order Affecting Grouping

```powershell
# Different results based on property order
$objects = @(
    [PSCustomObject]@{A=1; B=2}
    [PSCustomObject]@{A=2; B=1}
)

$objects | Group-Object A, B  # Returns 2 groups
$objects | Group-Object B, A  # Returns 2 groups
```

The order of properties affects how groups are formed.

#### 7.8.4.3 Memory Issues with Large Datasets

```powershell
# May cause out of memory error
Get-Process -IncludeUserName | Group-Object UserName
```

Grouping stores all objects in memory, which can be problematic for large datasets.

#### 7.8.4.4 Solutions

1. **Case-sensitive grouping control**:
   ```powershell
   # Explicit case handling
   $objects | Group-Object { $_.Name.ToLower() }
   ```

2. **Understand property order impact**:
   ```powershell
   # Be consistent with property order
   Get-Process | Group-Object Name, Id
   ```

3. **Handle large datasets carefully**:
   ```powershell
   # Process in chunks for very large datasets
   $chunkSize = 1000
   $allData = Get-Process
   $groupCounts = @{}
   
   for ($i = 0; $i -lt $allData.Count; $i += $chunkSize) {
       $chunk = $allData[$i..($i + $chunkSize - 1)]
       $chunkGroups = $chunk | Group-Object Company
       
       foreach ($group in $chunkGroups) {
           if (-not $groupCounts.ContainsKey($group.Name)) {
               $groupCounts[$group.Name] = 0
           }
           $groupCounts[$group.Name] += $group.Count
       }
   }
   
   $groupCounts
   ```

## 7.9 Troubleshooting Grouping Operations

When grouping operations don't work as expected, systematic troubleshooting helps identify and fix issues.

### 7.9.1 Diagnosing Grouping Failures

When a grouping returns unexpected results, follow this diagnostic process.

#### 7.9.1.1 Verify Input Data

Ensure the input pipeline contains expected 

```powershell
# Check what's being grouped
$processes = Get-Process
$processes | Get-Member  # Verify properties
$processes | Format-List -First 3  # Inspect sample data
```

#### 7.9.1.2 Isolate the Grouping Condition

Test the grouping condition independently:

```powershell
# Test with a known object
$testObject = Get-Process -Name powershell -First 1
$testObject.Company

# Test with explicit values
"Microsoft", "Microsoft", "Apple" | 
    ForEach-Object { [PSCustomObject]@{Company = $_} } | 
    Group-Object Company
```

#### 7.9.1.3 Simplify Complex Grouping

Break down complex grouping:

```powershell
# Original complex grouping
Get-Process | 
    Group-Object { 
        if ($_.WorkingSet -gt 200MB) { "High" } 
        else { "Low" } 
    }

# Test with simple values
100MB, 300MB, 50MB | 
    ForEach-Object { 
        [PSCustomObject]@{WorkingSet = $_} 
    } | 
    Group-Object { 
        if ($_.WorkingSet -gt 200MB) { "High" } 
        else { "Low" } 
    }
```

#### 7.9.1.4 Common Diagnostic Commands

```powershell
# View pipeline input
Get-Process | Tee-Object -Variable input | 
    Group-Object Company

# Inspect grouped results
$groups = Get-Process | Group-Object Company
$groups | Format-List -Property Name, Count
$groups[0] | Format-List -Property *
$groups[0].Group | Format-List -First 3
```

### 7.9.2 Verifying Group Logic

Systematically verify that group logic works as intended.

#### 7.9.2.1 Property Type Verification

```powershell
# Test property types
$processes = Get-Process
$processes[0].Company.GetType().Name  # Should be String
$processes[0].WorkingSet.GetType().Name  # Should be Int64
$processes[0].CPU.GetType().Name  # Should be Double
```

#### 7.9.2.2 Edge Case Testing

Test unusual or extreme values:

```powershell
# Test with null values
$nullTest = $null, "A", "B" | 
    ForEach-Object { [PSCustomObject]@{Value = $_} } | 
    Group-Object Value
# Null values form their own group

# Test with empty strings
$emptyTest = "", "A", "B" | 
    ForEach-Object { [PSCustomObject]@{Value = $_} } | 
    Group-Object Value
# Empty strings form their own group

# Test with different data types
$typeTest = 100, "50", 200 | 
    ForEach-Object { [PSCustomObject]@{Value = $_} } | 
    Group-Object Value
# Numbers and strings form separate groups
```

#### 7.9.2.3 Group Consistency Testing

```powershell
# Test group consistency
$original = 1, 2, 3, 2, 1 | ForEach-Object { [PSCustomObject]@{Value=$_} }
$groups = $original | Group-Object Value

# Verify groups contain correct members
$groups | Where-Object Name -eq 1 | 
    Select-Object -ExpandProperty Group | 
    ForEach-Object Value
# Should return 1, 1

$groups | Where-Object Name -eq 2 | 
    Select-Object -ExpandProperty Group | 
    ForEach-Object Value
# Should return 2, 2
```

### 7.9.3 Verifying Group Analysis

Systematically verify that group analysis works as intended.

#### 7.9.3.1 Basic Group Analysis Verification

```powershell
# Verify group counts
$processes = Get-Process
$total = ($processes | Measure-Object).Count
$groupTotal = (Get-Process | Group-Object Company | 
    Measure-Object Count -Sum).Sum
$total -eq $groupTotal

# Verify group member access
$groups = Get-Process | Group-Object Company
$groupMembers = $groups | ForEach-Object { $_.Group }
$allProcesses = Get-Process
Compare-Object $groupMembers $allProcesses -IncludeEqual
```

#### 7.9.3.2 Statistical Analysis Verification

```powershell
# Verify average calculation per group
$groups = Get-Process | Group-Object Company

foreach ($group in $groups) {
    $manualAvg = ($group.Group | Measure-Object CPU -Sum).Sum / $group.Count
    $measureAvg = ($group.Group | Measure-Object CPU -Average).Average
    [math]::Round($manualAvg, 6) -eq [math]::Round($measureAvg, 6)
}
```

#### 7.9.3.3 Nested Group Analysis Verification

```powershell
# Verify nested grouping
$outerGroups = Get-Process | Group-Object Company
$totalProcesses = 0

foreach ($outer in $outerGroups) {
    $innerGroups = $outer.Group | Group-Object PriorityClass
    $innerTotal = ($innerGroups | Measure-Object Count -Sum).Sum
    $totalProcesses += $innerTotal
    
    # Verify inner groups sum to outer group count
    $innerTotal -eq $outer.Count
}

# Verify all processes accounted for
$totalProcesses -eq (Get-Process).Count
```

### 7.9.4 Debugging Complex Grouping Operations

Complex grouping operations require special debugging techniques.

#### 7.9.4.1 Step-by-Step Evaluation

Break down complex operations:

```powershell
# Original complex operation
Get-Process | 
    Group-Object Company | 
    ForEach-Object {
        [PSCustomObject]@{
            Company = $_.Name
            AvgCPU = ($_.Group | Measure-Object CPU -Average).Average
            TotalMemoryMB = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }
    }

# Test each component separately
$groups = Get-Process | Group-Object Company
$groups | Select-Object Name, Count
$groups | ForEach-Object { ($_.Group | Measure-Object CPU -Average).Average }
$groups | ForEach-Object { ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB }
```

#### 7.9.4.2 Intermediate Results

Capture intermediate results:

```powershell
$processes = Get-Process

# Verify grouping
$groups = $processes | Group-Object Company
"Total groups: $($groups.Count)"
$groups | ForEach-Object {
    "Group $($_.Name): $($_.Count) processes"
}

# Verify group members
$groups[0] | Format-List -Property Name, Count
$groups[0].Group | Format-List -Property Name, CPU, WorkingSet -First 3

# Verify analysis
$groups | ForEach-Object {
    $avgCPU = ($_.Group | Measure-Object CPU -Average).Average
    $totalMemory = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
    "Company $($_.Name): Avg CPU=$avgCPU%, Total Memory=$totalMemory MB"
}
```

#### 7.9.4.3 Debugging Script Blocks

Use `Set-PSDebug` for script block debugging:

```powershell
# Enable tracing
Set-PSDebug -Trace 1

# Run grouping operation
Get-Process | 
    Group-Object { 
        if ($_.WorkingSet -gt 100MB) { "Large" } 
        else { "Small" } 
    }

# Disable tracing
Set-PSDebug -Off
```

### 7.9.5 Common Error Messages and Solutions

Understanding common error messages helps resolve grouping issues quickly.

#### 7.9.5.1 "Cannot compare [string] with [int]"

**Cause**: Comparing different data types during grouping.

**Example**:
```powershell
"100", "50", "200" | 
    ForEach-Object { [PSCustomObject]@{Value = $_} } | 
    Group-Object Value
```

**Solution**:
```powershell
# Convert to same type
"100", "50", "200" | 
    ForEach-Object { [PSCustomObject]@{Value = [int]$_} } | 
    Group-Object Value

# Or use calculated property
"100", "50", "200" | 
    ForEach-Object { [PSCustomObject]@{Value = $_} } | 
    Group-Object { [int]$_.Value }
```

#### 7.9.5.2 "Input object cannot be bound to any parameters"

**Cause**: Incorrect parameter usage with `Group-Object`.

**Example**:
```powershell
Get-Process | Group-Object -Property Company -NoElement
```

**Solution**:
```powershell
# Use correct parameter syntax
Get-Process | Group-Object Company -NoElement

# Or use calculated property syntax
Get-Process | Group-Object { $_.Company } -NoElement
```

#### 7.9.5.3 "The property cannot be found on this object"

**Cause**: Referencing non-existent property in grouping.

**Example**:
```powershell
Get-Process | Group-Object MemoryUsage
```

**Solution**:
```powershell
# Verify property name
Get-Process | Get-Member

# Use correct property name
Get-Process | Group-Object WorkingSet
```

#### 7.9.5.4 "Group-Object: Object reference not set to an instance of an object"

**Cause**: Null values in grouping property.

**Example**:
```powershell
Get-Process | Group-Object Company
# Some processes may have $null Company property
```

**Solution**:
```powershell
# Handle null values
Get-Process | 
    Select-Object Name, 
        @{Name="Company";Expression={if ($_.Company) { $_.Company } else { "Unknown" }}} | 
    Group-Object Company

# Or filter out nulls
Get-Process | 
    Where-Object Company -ne $null | 
    Group-Object Company
```

## 7.10 Advanced Topics

For power users, PowerShell offers advanced grouping capabilities that extend beyond basic cmdlet usage.

### 7.10.1 Custom Grouping with .NET Collections

#### 7.10.1.1 Using Dictionary for Custom Grouping

```powershell
# Create dictionary for custom grouping
$groups = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[object]]]::new()

Get-Process | ForEach-Object {
    $key = if ($_.Company) { $_.Company } else { "Unknown" }
    
    if (-not $groups.ContainsKey($key)) {
        $groups[$key] = [System.Collections.Generic.List[object]]::new()
    }
    
    $groups[$key].Add($_)
}

# Convert to standard Group-Object format
$groups.GetEnumerator() | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Key
        Count = $_.Value.Count
        Group = $_.Value
        Values = [object[]]::new($_.Value.Count) | ForEach-Object { $key }
    }
}
```

#### 7.10.1.2 Practical Dictionary Grouping Example

```powershell
# Group processes by memory usage ranges with custom dictionary
$ranges = @(
    @{Name="High"; Min=200MB; Max=[long]::MaxValue}
    @{Name="Medium"; Min=100MB; Max=200MB}
    @{Name="Low"; Min=0; Max=100MB}
)

$groups = [System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[object]]]::new()

Get-Process | ForEach-Object {
    $range = $ranges | Where-Object { 
        $_.Min -le $_.WorkingSet -and $_.WorkingSet -lt $_.Max 
    } | Select-Object -First 1
    
    if (-not $groups.ContainsKey($range.Name)) {
        $groups[$range.Name] = [System.Collections.Generic.List[object]]::new()
    }
    
    $groups[$range.Name].Add($_)
}

# Convert to standard format
$groups.GetEnumerator() | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Key
        Count = $_.Value.Count
        Group = $_.Value
    }
}
```

### 7.10.2 Advanced Group Analysis

#### 7.10.2.1 Group Statistical Comparison

```powershell
# Compare statistics between groups
$groups = Get-Process | Group-Object Company

$stats = $groups | ForEach-Object {
    [PSCustomObject]@{
        Company = $_.Name
        AvgCPU = ($_.Group | Measure-Object CPU -Average).Average
        AvgMemoryMB = ($_.Group | Measure-Object WorkingSet -Average).Average / 1MB
    }
}

# Calculate overall averages
$totalAvgCPU = ($stats | Measure-Object AvgCPU -Average).Average
$totalAvgMemory = ($stats | Measure-Object AvgMemoryMB -Average).Average

# Calculate deviations
$stats | ForEach-Object {
    [PSCustomObject]@{
        Company = $_.Company
        CPUDeviation = $_.AvgCPU - $totalAvgCPU
        MemoryDeviation = $_.AvgMemoryMB - $totalAvgMemory
    }
} | 
    Sort-Object CPUDeviation -Descending |
    Format-Table -AutoSize
```

#### 7.10.2.2 Group Correlation Analysis

```powershell
# Analyze correlation within groups
$groups = Get-Process | Group-Object Company

$correlations = $groups | ForEach-Object {
    $cpuValues = $_.Group | ForEach-Object { $_.CPU }
    $memoryValues = $_.Group | ForEach-Object { $_.WorkingSet / 1MB }
    
    # Simple correlation calculation
    $n = $_.Count
    $sumX = ($cpuValues | Measure-Object -Sum).Sum
    $sumY = ($memoryValues | Measure-Object -Sum).Sum
    $sumXY = 0
    $sumX2 = 0
    $sumY2 = 0
    
    for ($i = 0; $i -lt $n; $i++) {
        $sumXY += $cpuValues[$i] * $memoryValues[$i]
        $sumX2 += $cpuValues[$i] * $cpuValues[$i]
        $sumY2 += $memoryValues[$i] * $memoryValues[$i]
    }
    
    $numerator = $n * $sumXY - $sumX * $sumY
    $denominator = [math]::Sqrt(
        ($n * $sumX2 - $sumX * $sumX) * 
        ($n * $sumY2 - $sumY * $sumY)
    )
    
    $correlation = if ($denominator -eq 0) { 0 } else { $numerator / $denominator }
    
    [PSCustomObject]@{
        Company = $_.Name
        Correlation = $correlation
    }
}

$correlations | Sort-Object Correlation -Descending | Format-Table -AutoSize
```

#### 7.10.2.3 Group Trend Analysis

```powershell
# Analyze trends within groups over time
$samples = 1..10 | ForEach-Object {
    $processes = Get-Process
    $timestamp = Get-Date
    
    $processes | ForEach-Object {
        [PSCustomObject]@{
            Timestamp = $timestamp
            Name = $_.Name
            Company = $_.Company
            CPU = $_.CPU
            MemoryMB = $_.WorkingSet / 1MB
        }
    }
    
    Start-Sleep -Seconds 5
}

# Group by company and time
$grouped = $samples | 
    Group-Object Company | 
    ForEach-Object {
        $company = $_.Name
        $_.Group | 
            Group-Object Timestamp | 
            ForEach-Object {
                [PSCustomObject]@{
                    Company = $company
                    Timestamp = $_.Name
                    AvgCPU = ($_.Group | Measure-Object CPU -Average).Average
                    TotalMemoryMB = ($_.Group | Measure-Object MemoryMB -Sum).Sum
                }
            }
    }

# Calculate trends
$companyTrends = $grouped | 
    Group-Object Company | 
    ForEach-Object {
        $points = $_.Group | Sort-Object Timestamp
        $n = $points.Count
        
        if ($n -lt 2) {
            $trend = 0
        } else {
            $timeDiff = ($points[-1].Timestamp - $points[0].Timestamp).TotalSeconds
            $cpuDiff = $points[-1].AvgCPU - $points[0].AvgCPU
            $trend = $cpuDiff / $timeDiff
        }
        
        [PSCustomObject]@{
            Company = $_.Name
            Trend = $trend  # CPU/sec
        }
    }

$companyTrends | Sort-Object Trend -Descending | Format-Table -AutoSize
```

### 7.10.3 Parallel Grouping (PowerShell 7+)

PowerShell 7 introduces parallel processing capabilities for improved performance.

#### 7.10.3.1 Basic Parallel Grouping

```powershell
# Group large dataset in parallel
$chunkSize = 5000
$testData = 1..50000 | ForEach-Object { 
    [PSCustomObject]@{Value = (Get-Random 100)} 
}

$groupedChunks = $testData | Split-Pipeline -Size $chunkSize | 
    ForEach-Object -Parallel {
        $_ | Group-Object Value
    }

# Combine results
$finalGroups = [System.Collections.Concurrent.ConcurrentDictionary[string, int]]::new()
foreach ($chunk in $groupedChunks) {
    foreach ($group in $chunk) {
        [ref]$count = 0
        $finalGroups.AddOrUpdate(
            $group.Name, 
            $group.Count, 
            { param($key, $oldCount) $oldCount + $group.Count }
        ) | Out-Null
    }
}

$finalGroups | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Key
        Count = $_.Value
    }
} | Sort-Object Count -Descending
```

#### 7.10.3.2 Advanced Parallel Group Analysis

```powershell
# Parallel group analysis
$chunkSize = 5000
$processes = Get-Process

$groupedChunks = $processes | Split-Pipeline -Size $chunkSize | 
    ForEach-Object -Parallel {
        $_ | 
            Group-Object Company | 
            ForEach-Object {
                [PSCustomObject]@{
                    Company = $_.Name
                    ProcessCount = $_.Count
                    TotalCPU = ($_.Group | Measure-Object CPU -Sum).Sum
                    TotalMemory = ($_.Group | Measure-Object WorkingSet -Sum).Sum
                }
            }
    }

# Combine results
$finalResults = @{}
$groupedChunks | ForEach-Object {
    if (-not $finalResults.ContainsKey($_.Company)) {
        $finalResults[$_.Company] = [PSCustomObject]@{
            Company = $_.Company
            ProcessCount = 0
            TotalCPU = 0
            TotalMemory = 0
        }
    }
    
    $finalResults[$_.Company].ProcessCount += $_.ProcessCount
    $finalResults[$_.Company].TotalCPU += $_.TotalCPU
    $finalResults[$_.Company].TotalMemory += $_.TotalMemory
}

$finalResults.Values | ForEach-Object {
    [PSCustomObject]@{
        Company = $_.Company
        ProcessCount = $_.ProcessCount
        AvgCPU = $_.TotalCPU / $_.ProcessCount
        TotalMemoryMB = $_.TotalMemory / 1MB
    }
} | Sort-Object TotalMemoryMB -Descending
```

#### 7.10.3.3 Performance Comparison

```powershell
# Generate test data
$testData = 1..100000 | ForEach-Object { 
    [PSCustomObject]@{Value = (Get-Random 100)} 
}

# Compare sequential vs. parallel grouping
$sequential = Measure-Command {
    $testData | Group-Object Value
}

$parallel = Measure-Command {
    $chunkSize = 10000
    $groupedChunks = $testData | Split-Pipeline -Size $chunkSize | 
        ForEach-Object -Parallel {
            $_ | Group-Object Value
        }
    
    $finalGroups = @{}
    $groupedChunks | ForEach-Object {
        if (-not $finalGroups.ContainsKey($_.Name)) {
            $finalGroups[$_.Name] = 0
        }
        $finalGroups[$_.Name] += $_.Count
    }
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

### 7.10.4 Custom Grouping Functions

#### 7.10.4.1 Basic Grouping Function

```powershell
function Group-ObjectStatistics {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromPipeline=$true)]
        $InputObject,
        
        [string]
        $Property,
        
        [scriptblock]
        $Expression,
        
        [switch]
        $NoElement
    )
    
    begin {
        $groups = @{}
    }
    
    process {
        $key = if ($Expression) {
            & $Expression $_
        } else {
            $_.$Property
        }
        
        if ($key -eq $null) { $key = "[null]" }
        
        if (-not $groups.ContainsKey($key)) {
            $groups[$key] = @()
        }
        
        $groups[$key] += $_
    }
    
    end {
        $results = foreach ($key in $groups.Keys) {
            $items = $groups[$key]
            $count = $items.Count
            
            if ($NoElement) {
                [PSCustomObject]@{
                    Name = $key
                    Count = $count
                }
            } else {
                [PSCustomObject]@{
                    Name = $key
                    Count = $count
                    Group = $items
                    Values = [object[]]::new($count) | ForEach-Object { $key }
                }
            }
        }
        
        $results
    }
}

# Usage
Get-Process | Group-ObjectStatistics Company
```

#### 7.10.4.2 Advanced Grouping Function

```powershell
function Group-ObjectDistribution {
    [CmdletBinding(DefaultParameterSetName="Property")]
    param(
        [Parameter(ValueFromPipeline=$true)]
        $InputObject,
        
        [Parameter(ParameterSetName="Property")]
        [string]
        $Property,
        
        [Parameter(ParameterSetName="Expression")]
        [scriptblock]
        $Expression,
        
        [int]
        $Buckets = 10,
        
        [switch]
        $LogScale,
        
        [switch]
        $NoElement
    )
    
    begin {
        $values = [System.Collections.Generic.List[object]]::new()
        $rawObjects = [System.Collections.Generic.List[object]]::new()
    }
    
    process {
        $rawObjects.Add($_)
        
        $value = if ($Expression) {
            & $Expression $_
        } else {
            $_.$Property
        }
        
        $values.Add($value)
    }
    
    end {
        if ($values.Count -eq 0) {
            Write-Warning "No values to group"
            return
        }
        
        # Determine value type
        $valueType = $values[0].GetType()
        if (-not $valueType.IsNumeric()) {
            # For non-numeric, group by distinct values
            $groups = $rawObjects | Group-Object -Property $Property -NoElement:$NoElement
            return $groups
        }
        
        # For numeric values
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
                
                $bucketRanges = 0..($Buckets-1) | ForEach-Object {
                    $lower = [math]::Exp($logMin + ($_ * $logStep))
                    $upper = [math]::Exp($logMin + (($_ + 1) * $logStep))
                    [PSCustomObject]@{
                        Lower = $lower
                        Upper = $upper
                        Objects = [System.Collections.Generic.List[object]]::new()
                    }
                }
            } else {
                $step = ($max - $min) / $Buckets
                
                $bucketRanges = 0..($Buckets-1) | ForEach-Object {
                    $lower = $min + ($_ * $step)
                    $upper = $min + (($_ + 1) * $step)
                    [PSCustomObject]@{
                        Lower = $lower
                        Upper = $upper
                        Objects = [System.Collections.Generic.List[object]]::new()
                    }
                }
            }
            
            # Assign values to buckets
            for ($i = 0; $i -lt $values.Count; $i++) {
                $value = $values[$i]
                $obj = $rawObjects[$i]
                
                for ($j = 0; $j -lt $bucketRanges.Count; $j++) {
                    $range = $bucketRanges[$j]
                    if ($value -ge $range.Lower -and $value -lt $range.Upper) {
                        $range.Objects.Add($obj)
                        break
                    }
                    # Handle max value
                    if ($j -eq $bucketRanges.Count - 1 -and $value -eq $max) {
                        $range.Objects.Add($obj)
                        break
                    }
                }
            }
        }
        
        # Create group objects
        $results = $bucketRanges | ForEach-Object {
            $range = $_
            if ($NoElement) {
                [PSCustomObject]@{
                    Name = if ($LogScale) {
                        "{0:N2} - {1:N2}" -f $range.Lower, $range.Upper
                    } else {
                        "{0:N2} - {1:N2}" -f $range.Lower, $range.Upper
                    }
                    Count = $range.Objects.Count
                }
            } else {
                [PSCustomObject]@{
                    Name = if ($LogScale) {
                        "{0:N2} - {1:N2}" -f $range.Lower, $range.Upper
                    } else {
                        "{0:N2} - {1:N2}" -f $range.Lower, $range.Upper
                    }
                    Count = $range.Objects.Count
                    Group = $range.Objects
                    Values = $range.Objects | ForEach-Object { 
                        if ($Expression) { & $Expression $_ } else { $_.$Property } 
                    }
                }
            }
        }
        
        $results
    }
}

# Usage
Get-Process | Group-ObjectDistribution WorkingSet -Buckets 5 -LogScale
```

## 7.11 Practical Grouping Exercises

Apply your grouping knowledge with these hands-on exercises of varying difficulty.

### 7.11.1 Basic Grouping Challenges

#### 7.11.1.1 Process Information

1. Group processes by company
2. Count processes in each company group
3. Group services by status
4. Count services in each status group

Solutions:
```powershell
# 1
Get-Process | Group-Object Company

# 2
Get-Process | Group-Object Company | 
    Select-Object Name, Count |
    Sort-Object Count -Descending

# 3
Get-Service | Group-Object Status

# 4
Get-Service | Group-Object Status | 
    Select-Object Name, Count
```

#### 7.11.1.2 File System Information

1. Group files by extension
2. Count files of each extension type
3. Group files by directory
4. Count files in each directory

Solutions:
```powershell
# 1
Get-ChildItem | Group-Object Extension

# 2
Get-ChildItem | Group-Object Extension | 
    Select-Object Name, Count |
    Sort-Object Count -Descending

# 3
Get-ChildItem -Recurse | Group-Object DirectoryName

# 4
Get-ChildItem -Recurse | 
    Group-Object DirectoryName | 
    Select-Object Name, Count |
    Sort-Object Count -Descending
```

#### 7.11.1.3 Event Log Information

1. Group event log entries by ID
2. Count events of each ID type
3. Group events by severity level
4. Count events of each severity level

Solutions:
```powershell
# 1
Get-WinEvent -LogName System -MaxEvents 100 | Group-Object Id

# 2
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object Id | 
    Select-Object Name, Count |
    Sort-Object Count -Descending

# 3
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object Level

# 4
Get-WinEvent -LogName System -MaxEvents 100 | 
    Group-Object { 
        switch ($_.Level) {
            1 { "Critical" }
            2 { "Error" }
            3 { "Warning" }
            4 { "Information" }
            default { "Unknown" }
        }
    } | 
    Select-Object Name, Count
```

### 7.11.2 Intermediate Grouping Scenarios

#### 7.11.2.1 Process Analysis

1. Group processes by memory usage ranges (Low <100MB, Medium 100-200MB, High >200MB)
2. Calculate average CPU for each memory group
3. Group processes by company and priority class
4. Calculate total memory usage per company and priority class

Solutions:
```powershell
# 1
Get-Process | 
    Group-Object { 
        if ($_.WorkingSet -gt 200MB) { "High" }
        elseif ($_.WorkingSet -gt 100MB) { "Medium" }
        else { "Low" }
    }

# 2
Get-Process | 
    Group-Object { 
        if ($_.WorkingSet -gt 200MB) { "High" }
        elseif ($_.WorkingSet -gt 100MB) { "Medium" }
        else { "Low" }
    } | 
    Select-Object Name, 
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }} |
    Format-Table -AutoSize

# 3
Get-Process | Group-Object Company, PriorityClass

# 4
Get-Process | 
    Group-Object Company, PriorityClass | 
    Select-Object @{Name="Company";Expression={$_.Values[0]}},
        @{Name="Priority";Expression={$_.Values[1]}},
        @{Name="TotalMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        }} |
    Sort-Object Company, TotalMemoryMB -Descending |
    Format-Table -AutoSize
```

#### 7.11.2.2 File System Analysis

1. Group files by size ranges (use logarithmic buckets)
2. Calculate total size per size range
3. Group files by age ranges (Today, This week, This month, Older)
4. Calculate average size per age range

Solutions:
```powershell
# 1
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue
$logSizes = $files | ForEach-Object { [math]::Log($_.Length) }

$minLog = $logSizes | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
$maxLog = $logSizes | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$step = ($maxLog - $minLog) / 10

$files | 
    Group-Object { 
        $logSize = [math]::Log($_.Length)
        [math]::Floor(($logSize - $minLog) / $step)
    }

# 2
$files | 
    Group-Object { 
        $logSize = [math]::Log($_.Length)
        [math]::Floor(($logSize - $minLog) / $step)
    } | 
    Select-Object Name, 
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }} |
    Format-Table -AutoSize

# 3
Get-ChildItem | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastWriteTime).Days
        if ($days -eq 0) { "Today" }
        elseif ($days -le 7) { "This week" }
        elseif ($days -le 30) { "This month" }
        else { "Older" }
    }

# 4
Get-ChildItem | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastWriteTime).Days
        if ($days -eq 0) { "Today" }
        elseif ($days -le 7) { "This week" }
        elseif ($days -le 30) { "This month" }
        else { "Older" }
    } | 
    Select-Object Name, 
        @{Name="AvgSizeKB";Expression={
            ($_.Group | Measure-Object Length -Average).Average / 1KB
        }} |
    Format-Table -AutoSize
```

#### 7.11.2.3 Network Analysis

1. Group connections by connection type (Internal vs. External)
2. Calculate total data transferred per connection type
3. Group connections by process
4. Calculate average connections per process

Solutions:
```powershell
# 1
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    Group-Object { 
        if ($privateIPs -match $_.RemoteAddress) { "Internal" } 
        else { "External" } 
    }

# 2
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            Connection = $_
            Process = $process
            TotalBytes = $process.IOWriteBytes + $process.IOReadBytes
        }
    } | 
    Group-Object { 
        if ($privateIPs -match $_.Connection.RemoteAddress) { "Internal" } 
        else { "External" } 
    } | 
    Select-Object Name, 
        @{Name="TotalMB";Expression={
            ($_.Group | Measure-Object TotalBytes -Sum).Sum / 1MB
        }} |
    Format-Table -AutoSize

# 3
Get-NetTCPConnection | 
    Group-Object { 
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $process.Name 
    }

# 4
Get-NetTCPConnection | 
    Group-Object { 
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $process.Name 
    } | 
    Select-Object Name, Count |
    Format-Table -AutoSize
```

### 7.11.3 Advanced Grouping Problems

#### 7.11.3.1 Performance Optimization

1. Optimize this grouping for large directories:
   ```powershell
   Get-ChildItem C:\Data -Recurse | 
       Group-Object { ((Get-Date) - $_.LastWriteTime).Days }
   ```

2. Rewrite this grouping to use -NoElement where appropriate:
   ```powershell
   Get-Process | 
       Group-Object Company | 
       Select-Object Name, Count
   ```

3. Optimize this nested grouping for performance:
   ```powershell
   Get-Process | 
       Group-Object Company | 
       ForEach-Object {
           $_.Group | 
               Group-Object PriorityClass | 
               ForEach-Object {
                   [PSCustomObject]@{
                       Company = $_.Name
                       Priority = $_.Name
                       Count = $_.Count
                   }
               }
       }
   ```

Solutions:
```powershell
# 1
# Pre-calculate age to avoid repeated calculations
$files = Get-ChildItem C:\Data -Recurse -File -ErrorAction SilentlyContinue
$filesWithAge = $files | ForEach-Object {
    [PSCustomObject]@{
        File = $_
        AgeDays = [int]((Get-Date) - $_.LastWriteTime).TotalDays
    }
}
$filesWithAge | Group-Object AgeDays

# 2
# Use -NoElement to reduce memory usage
Get-Process | Group-Object Company -NoElement

# 3
# Use calculated property for nested grouping
Get-Process | 
    Group-Object @{ 
        Expression = { "{0}|{1}" -f $_.Company, $_.PriorityClass } 
    } | 
    ForEach-Object {
        $parts = $_.Name -split "\|"
        [PSCustomObject]@{
            Company = $parts[0]
            Priority = $parts[1]
            Count = $_.Count
        }
    }
```

#### 7.11.3.2 Complex Data Analysis

1. Group processes by CPU to memory ratio ranges and calculate statistics
2. Analyze file size distribution using logarithmic grouping with statistics
3. Group network connections by threat level and calculate data transfer statistics
4. Group Active Directory users by activity patterns and calculate statistics

Solutions:
```powershell
# 1
Get-Process | 
    Where-Object WorkingSet -gt 0 | 
    Group-Object { 
        $ratio = $_.CPU / ($_.WorkingSet / 1MB)
        if ($ratio -gt 1) { "High" }
        elseif ($ratio -gt 0.5) { "Medium" }
        else { "Low" }
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="AvgCPU";Expression={
            ($_.Group | Measure-Object CPU -Average).Average
        }},
        @{Name="AvgMemoryMB";Expression={
            ($_.Group | Measure-Object WorkingSet -Average).Average / 1MB
        }},
        @{Name="CPUperMB";Expression={
            $totalCPU = ($_.Group | Measure-Object CPU -Sum).Sum
            $totalMemoryMB = ($_.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
            if ($totalMemoryMB -gt 0) { $totalCPU / $totalMemoryMB } else { 0 }
        }} |
    Format-Table -AutoSize

# 2
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue
$sizes = $files | ForEach-Object { $_.Length / 1MB }
$logSizes = $sizes | ForEach-Object { [math]::Log($_) }

$minLog = $logSizes | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
$maxLog = $logSizes | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$step = ($maxLog - $minLog) / 10

$files | 
    Group-Object { 
        $logSize = [math]::Log($_.Length / 1MB)
        $bucket = [math]::Floor(($logSize - $minLog) / $step)
        [math]::Max(0, [math]::Min(9, $bucket))
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="TotalSizeMB";Expression={
            ($_.Group | Measure-Object Length -Sum).Sum / 1MB
        }},
        @{Name="AvgSizeMB";Expression={
            ($_.Group | Measure-Object Length -Average).Average / 1MB
        }},
        @{Name="Range";Expression={
            $lower = [math]::Exp($minLog + ($_.Name * $step))
            $upper = [math]::Exp($minLog + (($_.Name + 1) * $step))
            "{0:N2} - {1:N2} MB" -f $lower, $upper
        }} |
    Sort-Object Name |
    Format-Table Range, Count, TotalSizeMB, AvgSizeMB -AutoSize

# 3
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
$highDataThreshold = 100MB

Get-NetTCPConnection | 
    Where-Object State -eq "Established" | 
    ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $totalBytes = $process.IOWriteBytes + $process.IOReadBytes
        [PSCustomObject]@{
            Connection = $_
            Process = $process
            TotalBytes = $totalBytes
            IsInternal = $privateIPs -match $_.RemoteAddress
            IsHighData = $totalBytes -gt $highDataThreshold
        }
    } | 
    Group-Object { 
        if (-not $_.IsInternal -and $_.IsHighData) { "High Risk" }
        elseif (-not $_.IsInternal) { "Medium Risk" }
        else { "Low Risk" }
    } | 
    Select-Object Name, 
        @{Name="ConnectionCount";Expression={$_.Count}},
        @{Name="TotalMB";Expression={
            ($_.Group | Measure-Object TotalBytes -Sum).Sum / 1MB
        }},
        @{Name="AvgMB";Expression={
            ($_.Group | Measure-Object TotalBytes -Average).Average / 1MB
        }} |
    Format-Table -AutoSize

# 4
$users = Get-ADUser -Filter * -Properties LastLogonDate, PasswordLastSet

$users | 
    Where-Object LastLogonDate | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastLogonDate).Days
        if ($days -le 7) { "Active" }
        elseif ($days -le 30) { "Warning" }
        else { "Inactive" }
    } | 
    Select-Object Name, 
        @{Name="Count";Expression={$_.Count}},
        @{Name="AvgPasswordAge";Expression={
            $passwordAges = $_.Group | Where-Object PasswordLastSet | 
                ForEach-Object { ((Get-Date) - $_.PasswordLastSet).Days }
            ($passwordAges | Measure-Object -Average).Average
        }} |
    Format-Table -AutoSize
```

#### 7.11.3.3 Advanced Reporting

1. Generate a process resource heatmap by company and priority class
2. Create a file system health dashboard with multiple grouping views
3. Build a network security scorecard based on connection grouping
4. Produce an Active Directory user activity heatmap

Solutions:
```powershell
# 1
$processes = Get-Process | Where-Object Company -ne $null
$cpuMax = ($processes | Measure-Object CPU -Maximum).Maximum
$memoryMax = ($processes | Measure-Object WorkingSet -Maximum).Maximum

$processes | 
    Group-Object Company, PriorityClass | 
    ForEach-Object {
        $company = $_.Values[0]
        $priority = $_.Values[1]
        $avgCPU = ($_.Group | Measure-Object CPU -Average).Average
        $totalMemory = ($_.Group | Measure-Object WorkingSet -Sum).Sum
        
        [PSCustomObject]@{
            Company = $company
            Priority = $priority
            ProcessCount = $_.Count
            AvgCPU = $avgCPU
            TotalMemoryMB = $totalMemory / 1MB
            CPUHeat = "█" * [math]::Min(10, [math]::Ceiling($avgCPU / $cpuMax * 10))
            MemoryHeat = "█" * [math]::Min(10, [math]::Ceiling($totalMemory / $memoryMax * 10))
        }
    } | 
    Sort-Object Company, Priority |
    Format-Table Company, Priority, ProcessCount, 
        @{Name="CPU";Expression={"{0:N2}%" -f $_.AvgCPU}},
        @{Name="MemoryMB";Expression={"{0:N2}" -f $_.TotalMemoryMB}},
        CPUHeat, MemoryHeat -AutoSize

# 2
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue

# Size distribution
$sizeGroups = $files | 
    Group-Object { 
        if ($_.Length -gt 1GB) { "1GB+" }
        elseif ($_.Length -gt 100MB) { "100MB-1GB" }
        elseif ($_.Length -gt 10MB) { "10MB-100MB" }
        else { "<10MB" }
    }

# Age distribution
$ageGroups = $files | 
    Group-Object { 
        $days = ((Get-Date) - $_.LastWriteTime).Days
        if ($days -le 1) { "Today" }
        elseif ($days -le 7) { "This week" }
        elseif ($days -le 30) { "This month" }
        else { "30+ days" }
    }

# Extension distribution
$extensionGroups = $files | 
    Group-Object Extension | 
    Sort-Object Count -Descending | 
    Select-Object -First 5

@"
File System Health Dashboard:
- Total files: {0:N0}
- Size distribution:
{1}
- Age distribution:
{2}
- Top extensions:
{3}
"@ -f $files.Count,
    ($sizeGroups | 
        Select-Object Name, 
            @{Name="Count";Expression={$_.Count}},
            @{Name="Percent";Expression={"{0:N1}%" -f ($_.Count / $files.Count * 100)}} |
        Format-Table | Out-String),
    ($ageGroups | 
        Select-Object Name, 
            @{Name="Count";Expression={$_.Count}},
            @{Name="Percent";Expression={"{0:N1}%" -f ($_.Count / $files.Count * 100)}} |
        Format-Table | Out-String),
    ($extensionGroups | 
        Select-Object Name, 
            @{Name="Count";Expression={$_.Count}},
            @{Name="Percent";Expression={"{0:N1}%" -f ($_.Count / $files.Count * 100)}} |
        Format-Table | Out-String)

# 3
$connections = Get-NetTCPConnection | Where-Object State -eq "Established"
$privateIPs = "10\.", "172\.(1[6-9]|2[0-9]|3[0-1])\.", "192\.168\.", "127\.0\.0\.1"
$highDataThreshold = 100MB

# Connection type analysis
$typeAnalysis = $connections | 
    ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $totalBytes = $process.IOWriteBytes + $process.IOReadBytes
        [PSCustomObject]@{
            Connection = $_
            Process = $process
            TotalBytes = $totalBytes
            IsInternal = $privateIPs -match $_.RemoteAddress
            IsHighData = $totalBytes -gt $highDataThreshold
        }
    } | 
    Group-Object { 
        if (-not $_.IsInternal -and $_.IsHighData) { "High Risk" }
        elseif (-not $_.IsInternal) { "Medium Risk" }
        else { "Low Risk" }
    } | 
    ForEach-Object {
        [PSCustomObject]@{
            RiskLevel = $_.Name
            ConnectionCount = $_.Count
            TotalMB = ($_.Group | Measure-Object TotalBytes -Sum).Sum / 1MB
        }
    }

# Process analysis
$processAnalysis = $connections | 
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
    Sort-Object TotalMB -Descending | 
    Select-Object -First 5

@"
Network Security Scorecard:
- Total connections: {0}
- Risk distribution:
{1}
- Top processes by data transfer:
{2}
- Security score: {3}/100
"@ -f $connections.Count,
    ($typeAnalysis | Format-Table | Out-String),
    ($processAnalysis | Format-Table | Out-String),
    [math]::Max(0, [math]::Min(100, 100 - ($typeAnalysis | 
        Where-Object RiskLevel -eq "High Risk" | 
        Select-Object -ExpandProperty TotalMB) * 0.1))

# 4
$users = Get-ADUser -Filter * -Properties LastLogonDate

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

# Create heatmap
$maxCount = $activity | Measure-Object Count -Maximum | Select-Object -ExpandProperty Maximum
$activity | ForEach-Object {
    $barLength = [math]::Min(20, [math]::Ceiling($_.Count / $maxCount * 20))
    [PSCustomObject]@{
        Period = $_.Period
        Count = $_.Count
        Percent = "{0:N1}%" -f $_.Percent
        Heatmap = "█" * $barLength
    }
} | Format-Table Period, Count, Percent, Heatmap -AutoSize
```

## 7.12 Summary

In this comprehensive chapter, you've gained deep knowledge of grouping objects in PowerShell with `Group-Object`:

- Understood the fundamental principles of grouping versus traditional text processing
- Mastered the syntax and usage patterns of `Group-Object` for basic and advanced grouping scenarios
- Learned techniques for grouping by single properties, multiple properties, and calculated properties
- Discovered custom grouping logic using script blocks and .NET collections
- Gained insights into working with grouped data and analyzing group members
- Explored transforming grouped data into custom formats and hierarchical structures
- Learned performance considerations and optimization strategies for large datasets
- Explored real-world grouping scenarios across process management, file systems, event logs, Active Directory, and networking
- Identified and learned to avoid common grouping mistakes and pitfalls
- Acquired troubleshooting techniques for diagnosing grouping issues
- Explored advanced topics like custom grouping functions, statistical analysis, and parallel grouping

You now have the knowledge and skills to effectively organize data into meaningful categories, revealing patterns and relationships that are not apparent in flat data structures. Grouping is a foundational skill that enables you to make sense of complex data and extract valuable insights for system administration and automation tasks.

## 7.13 Next Steps Preview: Chapter 8 – Working with Hashtables and Custom Objects

In the next chapter, we'll explore two essential PowerShell data structures: hashtables and custom objects. You'll learn:

- How to create and manipulate hashtables for efficient data storage and retrieval
- Working with nested hashtables and converting between hashtables and other data structures
- Creating custom objects with Add-Member and [PSCustomObject]
- Converting between objects and hashtables
- Using hashtables for configuration and parameter splatting
- Advanced techniques for object manipulation and transformation
- Real-world examples of hashtables and custom objects in administration tasks
- Performance considerations for large data structures
- Common pitfalls and how to avoid them

You'll gain the ability to create rich, structured data representations that enhance your PowerShell scripts' flexibility, readability, and maintainability. This knowledge is essential for building sophisticated automation solutions and working with complex data.