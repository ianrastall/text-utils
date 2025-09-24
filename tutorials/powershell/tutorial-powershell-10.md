# 10. Working with PowerShell Modules

PowerShell modules are the fundamental building blocks for organizing, sharing, and reusing PowerShell code. They provide a structured way to package related functions, variables, aliases, and other resources into a single, manageable unit. This chapter provides a comprehensive guide to working with PowerShell modules, covering both fundamental concepts and advanced techniques for professional module development.

This chapter covers:
- Understanding the PowerShell module system and its importance
- Creating custom modules with proper structure and organization
- Using module manifests for metadata and dependencies
- Exporting functions, variables, and aliases from modules
- Managing module scope and visibility
- Discovering and installing modules from the PowerShell Gallery
- Creating private functions and internal module structure
- Versioning and updating modules
- Best practices for module design and development
- Common pitfalls and how to avoid them

By the end of this chapter, you'll be able to organize your PowerShell code into reusable, maintainable modules that can be shared across teams and projects. This is essential knowledge for professional PowerShell development and automation at scale.

## 10.1 Understanding PowerShell Modules

PowerShell modules are the primary mechanism for packaging and distributing PowerShell functionality. Understanding modules is crucial for working with PowerShell in professional environments.

### 10.1.1 What Are PowerShell Modules?

#### 10.1.1.1 Module Definition

PowerShell modules are packages that contain PowerShell commands (cmdlets, functions, workflows), providers, variables, and other resources. They provide:

- **Encapsulation**: Related functionality grouped together
- **Scoping**: Control over what's visible to users
- **Versioning**: Support for multiple versions
- **Dependency management**: Tracking required components
- **Discoverability**: Standardized structure for finding commands

#### 10.1.1.2 Module Types

PowerShell supports several module types:

| Type | Description | Use Case |
|------|-------------|----------|
| **Script modules** | `.psm1` files containing PowerShell code | Most common type for custom modules |
| **Binary modules** | `.dll` files containing compiled C# code | High-performance scenarios |
| **Manifest modules** | `.psd1` files describing module structure | Adding metadata to script/binary modules |
| **Dynamic modules** | Created at runtime with `New-Module` | Temporary functionality |
| **Configuration modules** | DSC resources for configuration management | Infrastructure as code |

#### 10.1.1.3 Module Structure

A typical module follows this structure:

```
MyModule/
├── MyModule.psd1    # Module manifest (metadata)
├── MyModule.psm1    # Module implementation
├── Private/         # Private functions (not exported)
│   └── *.ps1
├── Public/          # Public functions (exported)
│   └── *.ps1
├── en-US/           # Localized help
│   └── about_MyModule.help.txt
├── Resources/       # Additional resources
│   ├── Images/
│   └── Data/
└── Tests/           # Module tests
    └── *.Tests.ps1
```

### 10.1.2 Importance of Modules

#### 10.1.2.1 Code Organization

Modules solve critical code organization challenges:

- **Namespace management**: Prevent command name collisions
- **Encapsulation**: Hide implementation details
- **Dependency management**: Track required components
- **Version control**: Manage different versions of functionality

```powershell
# Without modules: naming conflicts
function Get-Data { ... }
function Get-Data { ... }  # Overwrites previous function

# With modules: isolated namespaces
Import-Module ModuleA  # Contains Get-Data
Import-Module ModuleB  # Contains different Get-Data
ModuleA\Get-Data  # Calls ModuleA's version
ModuleB\Get-Data  # Calls ModuleB's version
```

#### 10.1.2.2 Code Reuse and Sharing

Modules enable code reuse across projects and teams:

- Package functionality once, use everywhere
- Share through PowerShell Gallery or internal repositories
- Version control for backward compatibility
- Standardized installation and update process

#### 10.1.2.3 Professional Development

Modules are essential for professional PowerShell development:

- Required for complex automation solutions
- Foundation for PowerShell Desired State Configuration (DSC)
- Standard approach for enterprise PowerShell development
- Required for publishing to the PowerShell Gallery

### 10.1.3 Module Lifecycle

#### 10.1.3.1 Module Discovery

PowerShell discovers modules in specific locations:

```powershell
# View module paths
$env:PSModulePath -split ';'

# Typical paths:
# - User-specific: C:\Users\<user>\Documents\PowerShell\Modules
# - System-wide: C:\Program Files\WindowsPowerShell\Modules
# - PowerShell installation: $PSHOME\Modules
```

#### 10.1.3.2 Module Loading

Modules are loaded through several mechanisms:

```powershell
# Explicit import
Import-Module MyModule

# Auto-loading (PowerShell 3.0+)
MyModule\Get-Something  # Auto-loads module

# Manifest-based loading
# PowerShell loads modules when commands are used

# Required modules
# Specified in module manifest
```

#### 10.1.3.3 Module Execution

When a module executes:

1. Module script block runs in its own scope
2. Public functions become available in session
3. Private functions remain hidden
4. Module variables are isolated
5. On module removal, exported items are removed

#### 10.1.3.4 Module Removal

Modules can be removed when no longer needed:

```powershell
# Remove module
Remove-Module MyModule

# Force removal (even if in use)
Remove-Module MyModule -Force

# Remove all versions
Get-Module MyModule | Remove-Module -Force
```

## 10.2 Creating Custom Modules

Creating custom modules is straightforward but requires attention to structure and best practices.

### 10.2.1 Basic Module Creation

#### 10.2.1.1 Simple Script Module

```powershell
# Create module directory
New-Item -Path "$env:USERPROFILE\Documents\PowerShell\Modules\MyModule" -ItemType Directory

# Create module file
@'
function Get-Greeting {
    param(
        [string]$Name = "World"
    )
    "Hello, $Name!"
}

# Export the function
Export-ModuleMember -Function Get-Greeting
'@ | Set-Content -Path "$env:USERPROFILE\Documents\PowerShell\Modules\MyModule\MyModule.psm1"
```

#### 10.2.1.2 Using the Module

```powershell
# Import the module
Import-Module MyModule

# Use the function
Get-Greeting -Name "PowerShell"

# View exported commands
Get-Command -Module MyModule

# View module information
Get-Module MyModule | Format-List *
```

#### 10.2.1.3 Module Auto-Loading

```powershell
# PowerShell 3.0+ auto-loads modules
# No need to explicitly import
Get-Greeting -Name "Auto-Load"

# Check if module is loaded
Get-Module MyModule  # Should show as loaded
```

### 10.2.2 Module Structure Best Practices

#### 10.2.2.1 Organized Module Structure

```powershell
# Create proper module structure
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\MyModule"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\Private" -ItemType Directory
New-Item -Path "$moduleRoot\Public" -ItemType Directory

# Create public function
@'
function Get-Greeting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    "Hello, $Name!"
}
'@ | Set-Content -Path "$moduleRoot\Public\Get-Greeting.ps1"

# Create private function
@'
function Get-TimeOfDay {
    $hour = (Get-Date).Hour
    if ($hour -lt 12) { "morning" }
    elseif ($hour -lt 18) { "afternoon" }
    else { "evening" }
}
'@ | Set-Content -Path "$moduleRoot\Private\Get-TimeOfDay.ps1"

# Create module file
@'
# Dot source all public functions
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Export all public functions
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
'@ | Set-Content -Path "$moduleRoot\MyModule.psm1"
```

#### 10.2.2.2 Module Versioning

```powershell
# Include version in module structure
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\MyModule\1.0.0"
# Create structure under versioned directory

# Or use semantic versioning in manifest
# (See section 10.3 on manifests)
```

#### 10.2.2.3 Cross-Platform Considerations

```powershell
# Platform-specific code
if ($IsWindows) {
    # Windows-specific code
} elseif ($IsMacOS) {
    # macOS-specific code
} elseif ($IsLinux) {
    # Linux-specific code
}

# Or in module structure
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\MyModule"
New-Item -Path "$moduleRoot\Windows" -ItemType Directory
New-Item -Path "$moduleRoot\Linux" -ItemType Directory
New-Item -Path "$moduleRoot\MacOS" -ItemType Directory
```

### 10.2.3 Advanced Module Creation Techniques

#### 10.2.3.1 Dynamic Module Creation

```powershell
# Create module at runtime
$module = New-Module -Name MyDynamicModule -ScriptBlock {
    function Get-DynamicGreeting {
        "Hello from dynamic module!"
    }
    Export-ModuleMember -Function Get-DynamicGreeting
}

# Import the module
$module | Import-Module

# Use the function
Get-DynamicGreeting

# Remove when done
Remove-Module MyDynamicModule
```

#### 10.2.3.2 Nested Modules

```powershell
# Create nested module structure
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\ParentModule"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\ChildModule" -ItemType Directory

# Create child module
@'
function Get-ChildGreeting {
    "Hello from child module!"
}
Export-ModuleMember -Function Get-ChildGreeting
'@ | Set-Content -Path "$moduleRoot\ChildModule\ChildModule.psm1"

# Create parent module
@'
# Import child module
Import-Module (Join-Path $PSScriptRoot "ChildModule\ChildModule.psm1")

function Get-ParentGreeting {
    "Hello from parent module!"
}
Export-ModuleMember -Function Get-ParentGreeting
'@ | Set-Content -Path "$moduleRoot\ParentModule.psm1"
```

#### 10.2.3.3 Module Initialization

```powershell
# Module initialization code
@'
# Initialization code (runs once when module loads)
$script:ModuleStartTime = Get-Date
Write-Verbose "Module loaded at $script:ModuleStartTime"

# Dot source all public functions
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Export all public functions
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName

# Cleanup code (runs when module is removed)
$ExecutionContext.SessionState.Module.OnRemove = {
    $duration = (Get-Date) - $script:ModuleStartTime
    Write-Verbose "Module was loaded for $($duration.TotalMinutes) minutes"
}
'@ | Set-Content -Path "$moduleRoot\MyModule.psm1"
```

## 10.3 Using Module Manifests

Module manifests (`.psd1` files) provide metadata about your module and control its behavior.

### 10.3.1 Creating Module Manifests

#### 10.3.1.1 Basic Manifest Creation

```powershell
# Create module manifest
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "My first PowerShell module" `
    -Author "Your Name" `
    -CompanyName "Your Company" `
    -Copyright "(c) $(Get-Date -Format yyyy) Your Company. All rights reserved."
```

#### 10.3.1.2 Manifest Structure

A basic manifest contains:

```powershell
@{
    # Script module or binary module file associated with this manifest
    RootModule = 'MyModule.psm1'
    
    # Version number of this module
    ModuleVersion = '1.0.0'
    
    # Supported PSEditions
    # CompatiblePSEditions = @()
    
    # ID used to uniquely identify this module
    # GUID = 'a1b2c3d4-1234-5678-90ab-cdef12345678'
    
    # Author of this module
    Author = 'Your Name'
    
    # Company or vendor of this module
    CompanyName = 'Your Company'
    
    # Copyright statement for this module
    Copyright = '(c) 2023 Your Company. All rights reserved.'
    
    # Description of the functionality provided by this module
    Description = 'My first PowerShell module'
    
    # Functions to export from this module
    FunctionsToExport = 'Get-Greeting'
    
    # Cmdlets to export from this module
    # CmdletsToExport = '*'
    
    # Variables to export from this module
    # VariablesToExport = '*'
    
    # Aliases to export from this module
    # AliasesToExport = '*'
    
    # List of all modules packaged with this module
    # ModuleList = @()
    
    # List of all files packaged with this module
    # FileList = @()
    
    # Private data to pass to the module
    # PrivateData = @{ }
    
    # HelpInfo URI of this module
    # HelpInfoURI = ''
    
    # Default prefix for commands exported from this module
    # DefaultCommandPrefix = ''
}
```

### 10.3.2 Advanced Manifest Features

#### 10.3.2.1 Required Modules

```powershell
# Specify required modules
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -RequiredModules @(
        @{ ModuleName = "PSScriptAnalyzer"; ModuleVersion = "1.20.0" },
        @{ ModuleName = "PowerShellGet"; MaximumVersion = "2.2.5" }
    )
```

#### 10.3.2.2 Nested Modules

```powershell
# Specify nested modules
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -NestedModules @("ChildModule1.psm1", "ChildModule2.psm1")
```

#### 10.3.2.3 DSC Resources

```powershell
# Declare DSC resources
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -DscResourcesToExport @("MyDscResource1", "MyDscResource2")
```

#### 10.3.2.4 PowerShell Editions and Compatibility

```powershell
# Specify compatible PowerShell editions
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -CompatiblePSEditions @("Desktop", "Core")
```

### 10.3.3 Managing Module Manifests

#### 10.3.3.1 Updating Manifests

```powershell
# Update existing manifest
Update-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -FunctionsToExport @("Get-Greeting", "Set-Greeting") `
    -Description "Updated module description" `
    -ModuleVersion "1.1.0"
```

#### 10.3.3.2 Validating Manifests

```powershell
# Validate manifest structure
Test-ModuleManifest -Path "$moduleRoot\MyModule.psd1"

# Validate with additional checks
$manifest = Test-ModuleManifest -Path "$moduleRoot\MyModule.psd1"
if ($manifest.ExportedFunctions.Count -eq 0) {
    Write-Warning "Module exports no functions"
}
```

#### 10.3.3.3 Manifest Best Practices

```powershell
# Good manifest practices
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "Comprehensive description of module functionality" `
    -Author "Your Name <your.email@example.com>" `
    -CompanyName "Your Company" `
    -Copyright "(c) $(Get-Date -Format yyyy) Your Company. All rights reserved." `
    -PowerShellVersion "5.1" `
    -FunctionsToExport @("Get-Greeting", "Set-Greeting") `
    -CmdletsToExport @() `
    -VariablesToExport @() `
    -AliasesToExport @() `
    -RequiredModules @(
        @{ 
            ModuleName = "PSScriptAnalyzer"; 
            ModuleVersion = "1.20.0";
            Guid = "a1b2c3d4-1234-5678-90ab-cdef12345678"
        }
    ) `
    -Tags @("greeting", "example", "tutorial") `
    -ProjectUri "https://github.com/yourusername/MyModule" `
    -LicenseUri "https://opensource.org/licenses/MIT" `
    -ReleaseNotes @"
## 1.0.0
- Initial release
- Added Get-Greeting function
- Added Set-Greeting function
"@
```

## 10.4 Exporting Module Members

Properly exporting module members controls what's visible to users and maintains encapsulation.

### 10.4.1 Exporting Functions

#### 10.4.1.1 Basic Function Export

```powershell
# In module file (psm1)
function Get-Greeting {
    param([string]$Name = "World")
    "Hello, $Name!"
}

# Export the function
Export-ModuleMember -Function Get-Greeting
```

#### 10.4.1.2 Manifest-Based Export

```powershell
# In manifest (psd1)
FunctionsToExport = @("Get-Greeting", "Set-Greeting")
```

#### 10.4.1.3 Dynamic Function Export

```powershell
# Dynamically export functions from directory
$publicFunctions = Get-ChildItem -Path "$PSScriptRoot\Public\*.ps1"
foreach ($function in $publicFunctions) {
    . $function.FullName
}
Export-ModuleMember -Function $publicFunctions.BaseName
```

### 10.4.2 Exporting Variables and Aliases

#### 10.4.2.1 Variable Export

```powershell
# Define module-scoped variable
$script:ModuleConfig = @{
    Greeting = "Hello"
    Punctuation = "!"
}

# Export the variable
Export-ModuleMember -Variable ModuleConfig
```

#### 10.4.2.2 Alias Export

```powershell
# Create alias
Set-Alias -Name gg -Value Get-Greeting

# Export the alias
Export-ModuleMember -Alias gg
```

#### 10.4.2.3 Manifest-Based Export

```powershell
# In manifest (psd1)
VariablesToExport = @("ModuleConfig")
AliasesToExport = @("gg")
```

### 10.4.3 Managing Module Scope

#### 10.4.3.1 Script vs. Local Scope

```powershell
# In module file
$script:ModuleVariable = "Visible throughout module"
$local:FunctionVariable = "Visible only in this function"

function Get-Greeting {
    # Can access $script:ModuleVariable
    # Cannot access $local:FunctionVariable from outside
}
```

#### 10.4.3.2 Private Functions

```powershell
# Private function (not exported)
function Get-TimeOfDay {
    $hour = (Get-Date).Hour
    if ($hour -lt 12) { "morning" }
    elseif ($hour -lt 18) { "afternoon" }
    else { "evening" }
}

# Public function (exported)
function Get-Greeting {
    param([string]$Name = "World")
    "$($script:GreetingPrefix), $Name!"
}

# Only export public functions
Export-ModuleMember -Function Get-Greeting
```

#### 10.4.3.3 Module-Qualified Names

```powershell
# Access functions with module qualifier
MyModule\Get-Greeting

# List module-qualified commands
Get-Command -Module MyModule | ForEach-Object {
    "${_.ModuleName}\$($_.Name)"
}
```

## 10.5 Module Management

Effective module management is crucial for working with PowerShell in production environments.

### 10.5.1 Discovering Modules

#### 10.5.1.1 Local Module Discovery

```powershell
# List installed modules
Get-Module -ListAvailable

# Find specific module
Get-Module -ListAvailable -Name MyModule

# Detailed module information
Get-Module -ListAvailable -Name MyModule | Format-List *
```

#### 10.5.1.2 PowerShell Gallery Discovery

```powershell
# Find modules in PowerShell Gallery
Find-Module -Name PSScriptAnalyzer

# Filter by tag
Find-Module -Tag DSC

# Filter by version
Find-Module -Name PowerShellGet -RequiredVersion 2.2.5

# Filter by repository
Find-Module -Repository PSGallery
```

#### 10.5.1.3 Advanced Discovery Techniques

```powershell
# Find modules with specific commands
Find-Module | Where-Object {
    (Test-ModuleManifest $_.Path).ExportedCommands.Name -contains "Get-Greeting"
}

# Find modules by description
Find-Module | Where-Object Description -match "logging"

# Find modules with dependencies
Find-Module -Name Pester | Select-Object -ExpandProperty RequiredModules
```

### 10.5.2 Installing and Updating Modules

#### 10.5.2.1 Basic Installation

```powershell
# Install module for current user
Install-Module -Name PSScriptAnalyzer -Scope CurrentUser

# Install for all users (requires admin)
Install-Module -Name PowerShellGet -Scope AllUsers

# Install specific version
Install-Module -Name PowerShellGet -RequiredVersion 2.2.5
```

#### 10.5.2.2 Advanced Installation

```powershell
# Install with dependencies
Install-Module -Name Pester -AllowClobber -Force

# Install from specific repository
Register-PSRepository -Name MyRepo -SourceLocation "https://myrepo.example.com/api/v2"
Install-Module -Name MyModule -Repository MyRepo

# Install pre-release version
Install-Module -Name PowerShellGet -AllowPrerelease
```

#### 10.5.2.3 Updating Modules

```powershell
# Update specific module
Update-Module -Name PowerShellGet

# Update all modules
Get-InstalledModule | Update-Module -Force

# Update to specific version
Update-Module -Name PowerShellGet -RequiredVersion 2.2.5

# What-if update (show what would happen)
Update-Module -Name PowerShellGet -WhatIf
```

### 10.5.3 Managing Installed Modules

#### 10.5.3.1 Listing Installed Modules

```powershell
# Basic listing
Get-InstalledModule

# Detailed information
Get-InstalledModule | Format-List *

# Filter by name
Get-InstalledModule -Name PowerShellGet

# Filter by version
Get-InstalledModule | Where-Object Version -ge "2.0.0"
```

#### 10.5.3.2 Uninstalling Modules

```powershell
# Uninstall module
Uninstall-Module -Name PSScriptAnalyzer

# Uninstall specific version
Uninstall-Module -Name PowerShellGet -RequiredVersion 2.2.5

# Uninstall all versions
Get-InstalledModule -Name MyModule | Uninstall-Module -AllVersions

# What-if uninstall
Uninstall-Module -Name PSScriptAnalyzer -WhatIf
```

#### 10.5.3.3 Module Dependency Management

```powershell
# View module dependencies
(Get-Module -ListAvailable -Name PowerShellGet).RequiredModules

# Install all dependencies
Install-Module -Name MyModule -Force -AllowClobber

# Check for missing dependencies
$module = Get-Module -ListAvailable -Name MyModule
$missing = $module.RequiredModules | Where-Object {
    -not (Get-Module -ListAvailable -Name $_.ModuleName)
}
if ($missing) {
    Write-Warning "Missing dependencies: $($missing.ModuleName -join ', ')"
}
```

## 10.6 Advanced Module Techniques

Professional module development requires advanced techniques for complex scenarios.

### 10.6.1 Module Versioning Strategies

#### 10.6.1.1 Semantic Versioning

```powershell
# Semantic versioning structure: MAJOR.MINOR.PATCH
# - MAJOR: Breaking changes
# - MINOR: New functionality (backward compatible)
# - PATCH: Bug fixes (backward compatible)

# Example versions:
# 1.0.0   - Initial stable release
# 1.1.0   - Added new features
# 1.1.1   - Bug fixes
# 2.0.0   - Breaking changes
```

#### 10.6.1.2 Version Management in Manifest

```powershell
# Update version in manifest
Update-ModuleManifest -Path "$moduleRoot\MyModule.psd1" -ModuleVersion "1.1.0"

# Automatic version increment
$manifest = Test-ModuleManifest -Path "$moduleRoot\MyModule.psd1"
$version = [System.Version]$manifest.Version
$newVersion = "{0}.{1}.{2}" -f $version.Major, $version.Minor, ($version.Build + 1)
Update-ModuleManifest -Path "$moduleRoot\MyModule.psd1" -ModuleVersion $newVersion
```

#### 10.6.1.3 Version Compatibility

```powershell
# Check version compatibility
function Test-ModuleCompatibility {
    param(
        [string]$ModuleName,
        [version]$RequiredVersion
    )
    
    $installed = Get-Module -ListAvailable -Name $ModuleName
    if (-not $installed) { return $false }
    
    $latest = $installed | Sort-Object Version -Descending | Select-Object -First 1
    return $latest.Version -ge $RequiredVersion
}

# Usage
Test-ModuleCompatibility -ModuleName "PowerShellGet" -RequiredVersion "2.0.0"
```

### 10.6.2 Module Testing

#### 10.6.2.1 Basic Module Testing

```powershell
# Create test structure
New-Item -Path "$moduleRoot\Tests" -ItemType Directory
Set-Content -Path "$moduleRoot\Tests\MyModule.Tests.ps1" -Value @'
Describe "MyModule" {
    It "Exports Get-Greeting function" {
        (Get-Command -Module MyModule).Name | Should -Contain "Get-Greeting"
    }
    
    It "Get-Greeting returns expected result" {
        Get-Greeting -Name "PowerShell" | Should -Be "Hello, PowerShell!"
    }
}
'@

# Run tests
Invoke-Pester -Path "$moduleRoot\Tests"
```

#### 10.6.2.2 Advanced Module Testing

```powershell
# Test private functions
Set-Content -Path "$moduleRoot\Tests\PrivateFunctions.Tests.ps1" -Value @'
Describe "Private Functions" {
    BeforeAll {
        # Import module for testing
        Import-Module "$env:USERPROFILE\Documents\PowerShell\Modules\MyModule\MyModule.psm1" -Force
    }
    
    It "Get-TimeOfDay returns morning before noon" {
        # Mock Get-Date to control time
        Mock Get-Date { [DateTime]::Parse("09:00") }
        & $moduleRoot\Private\Get-TimeOfDay.ps1 | Should -Be "morning"
    }
    
    It "Get-TimeOfDay returns afternoon between noon and 6pm" {
        Mock Get-Date { [DateTime]::Parse("14:00") }
        & $moduleRoot\Private\Get-TimeOfDay.ps1 | Should -Be "afternoon"
    }
}
'@
```

#### 10.6.2.3 Code Coverage

```powershell
# Measure code coverage
Invoke-Pester -Path "$moduleRoot\Tests" -CodeCoverage "$moduleRoot\*.psm1" `
    -CodeCoverageOutputFile "$moduleRoot\coverage.xml" `
    -CodeCoverageOutputFileFormat "JaCoCo"
```

### 10.6.3 Module Documentation

#### 10.6.3.1 Comment-Based Help

```powershell
# In public function
<#
.SYNOPSIS
    Gets a greeting message

.DESCRIPTION
    Returns a greeting message for the specified name.
    If no name is provided, defaults to "World".

.PARAMETER Name
    The name to include in the greeting

.EXAMPLE
    Get-Greeting -Name "PowerShell"
    Returns "Hello, PowerShell!"

.INPUTS
    System.String

.OUTPUTS
    System.String

.NOTES
    Created by Your Name on $(Get-Date -Format "yyyy-MM-dd")
#>
function Get-Greeting {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    "Hello, $Name!"
}
```

#### 10.6.3.2 External Help

```powershell
# Create about help
New-Item -Path "$moduleRoot\en-US" -ItemType Directory
Set-Content -Path "$moduleRoot\en-US\about_MyModule.help.txt" -Value @'
# about_MyModule

## SHORT DESCRIPTION
Provides greeting functionality.

## LONG DESCRIPTION
The MyModule module provides functions for generating greeting messages.

## EXAMPLES
Get-Greeting -Name "PowerShell"

## KEYWORDS
greeting, hello, example
'@

# Create XML help (advanced)
# Requires PlatyPS module
Import-Module PlatyPS
New-ExternalHelp -Path "$moduleRoot\Docs" -OutputPath "$moduleRoot\en-US"
```

#### 10.6.3.3 Online Documentation

```powershell
# In manifest
New-ModuleManifest -Path "$moduleRoot\MyModule.psd1" `
    -ProjectUri "https://github.com/yourusername/MyModule" `
    -HelpInfoUri "https://yourdocs.example.com/MyModule"
```

## 10.7 Publishing Modules

Publishing modules makes them available to others through the PowerShell Gallery or private repositories.

### 10.7.1 Preparing for Publication

#### 10.7.1.1 Module Readiness Check

```powershell
# Check module for common issues
Test-ModuleManifest -Path "$moduleRoot\MyModule.psd1"
Invoke-ScriptAnalyzer -Path $moduleRoot -Recurse

# Check help documentation
Get-Help Get-Greeting -Full

# Run tests
Invoke-Pester -Path "$moduleRoot\Tests" -CodeCoverage "$moduleRoot\*.psm1"
```

#### 10.7.1.2 Module Signing

```powershell
# Sign module for security
$cert = Get-ChildItem -Path Cert:\CurrentUser\My | 
    Where-Object { $_.Subject -match "Code Signing" }
Set-AuthenticodeSignature -FilePath "$moduleRoot\MyModule.psm1" -Certificate $cert
```

#### 10.7.1.3 Release Notes

```powershell
# Create release notes
Set-Content -Path "$moduleRoot\ReleaseNotes.md" -Value @"
## 1.0.0 (2023-10-15)
### Added
- Initial release
- Get-Greeting function
- Set-Greeting function

### Fixed
- None

### Changed
- None
"@
```

### 10.7.2 Publishing to PowerShell Gallery

#### 10.7.2.1 Basic Publication

```powershell
# Register PowerShell Gallery account
# (One-time setup)
Register-PSRepository -Default

# Publish module
Publish-Module -Path "$moduleRoot" -Repository PSGallery -NuGetApiKey "YOUR_API_KEY"
```

#### 10.7.2.2 Advanced Publication

```powershell
# Publish specific version
Publish-Module -Path "$moduleRoot" -Repository PSGallery `
    -NuGetApiKey "YOUR_API_KEY" `
    -RequiredVersion "1.1.0"

# Publish as prerelease
Publish-Module -Path "$moduleRoot" -Repository PSGallery `
    -NuGetApiKey "YOUR_API_KEY" `
    -Prerelease "alpha1"

# What-if publication
Publish-Module -Path "$moduleRoot" -Repository PSGallery -WhatIf
```

### 10.7.3 Private Module Repositories

#### 10.7.3.1 Setting Up a Private Repository

```powershell
# Create private repository (ProGet example)
New-PSRepository -Name MyPrivateRepo `
    -SourceLocation "https://proget.example.com/psmodules/v2" `
    -PublishLocation "https://proget.example.com/psmodules/v2/package" `
    -InstallationPolicy Trusted
```

#### 10.7.3.2 Publishing to Private Repository

```powershell
# Publish to private repository
Publish-Module -Path "$moduleRoot" -Repository MyPrivateRepo `
    -NuGetApiKey "PRIVATE_API_KEY"
```

#### 10.7.3.3 Consuming from Private Repository

```powershell
# Install from private repository
Install-Module -Name MyModule -Repository MyPrivateRepo
```

## 10.8 Module Design Patterns

Professional module development follows established design patterns for consistency and maintainability.

### 10.8.1 Module Structure Patterns

#### 10.8.1.1 Standard Structure

```powershell
# Recommended structure
MyModule/
├── MyModule.psd1       # Module manifest
├── MyModule.psm1       # Module bootstrap
├── Private/            # Private functions
│   ├── *.ps1
│   └── ...
├── Public/             # Public functions
│   ├── *.ps1
│   └── ...
├── en-US/              # Localized help
│   ├── about_MyModule.help.txt
│   └── MyModule.dll-Help.xml
├── Resources/          # Additional resources
│   ├── Images/
│   └── Data/
├── Tests/              # Module tests
│   ├── *.Tests.ps1
│   └── ...
├── Docs/               # Documentation
│   ├── *.md
│   └── ...
└── ReleaseNotes.md     # Release notes
```

#### 10.8.1.2 Bootstrap Pattern

```powershell
# MyModule.psm1
# Dot source all public functions
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Dot source all private functions
Get-ChildItem -Path $PSScriptRoot\Private\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Export all public functions
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
```

#### 10.8.1.3 Configuration Pattern

```powershell
# MyModule.psm1
# Load configuration
$script:Config = @{
    GreetingPrefix = "Hello"
    Punctuation = "!"
}

if (Test-Path "$PSScriptRoot\config.json") {
    $script:Config = Get-Content "$PSScriptRoot\config.json" | ConvertFrom-Json
}

# Public functions can access $script:Config
```

### 10.8.2 Function Design Patterns

#### 10.8.2.1 Consistent Verb-Noun Pattern

```powershell
# Good: Consistent naming
Get-Greeting
Set-Greeting
Test-Greeting
New-Greeting

# Bad: Inconsistent naming
Get-Greeting
Configure-Greeting
Check-Greeting
Create-Greeting
```

#### 10.8.2.2 Parameter Validation Pattern

```powershell
function Set-Greeting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]
        [string]$Prefix,
        
        [ValidateSet("!", ".", "?")]
        [string]$Punctuation = "!"
    )
    
    $script:Config.GreetingPrefix = $Prefix
    $script:Config.Punctuation = $Punctuation
}
```

#### 10.8.2.3 Pipeline Support Pattern

```powershell
function Get-Greeting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        [string[]]$Name
    )
    
    process {
        foreach ($n in $Name) {
            "$($script:Config.GreetingPrefix), $n$($script:Config.Punctuation)"
        }
    }
}

# Usage
"PowerShell", "World" | Get-Greeting
```

### 10.8.3 Error Handling Patterns

#### 10.8.3.1 Consistent Error Records

```powershell
function Get-Greeting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    
    try {
        # Check for invalid names
        if ($Name -match "[0-9]") {
            $errorId = "InvalidName,MyModule"
            $category = [System.Management.Automation.ErrorCategory]::InvalidArgument
            $message = "Name cannot contain numbers: $Name"
            
            $exception = [System.ArgumentException]::new($message)
            $errorRecord = [System.Management.Automation.ErrorRecord]::new(
                $exception, $errorId, $category, $Name
            )
            
            $PSCmdlet.ThrowTerminatingError($errorRecord)
        }
        
        "$($script:Config.GreetingPrefix), $Name$($script:Config.Punctuation)"
    } catch {
        # Add context to error
        $newException = [System.Exception]::new(
            "Failed to generate greeting: $($_.Exception.Message)",
            $_.Exception
        )
        
        $errorRecord = [System.Management.Automation.ErrorRecord]::new(
            $newException,
            "GreetingFailed,MyModule",
            [System.Management.Automation.ErrorCategory]::NotSpecified,
            $Name
        )
        
        $PSCmdlet.ThrowTerminatingError($errorRecord)
    }
}
```

#### 10.8.3.2 Error Action Preference Pattern

```powershell
function Get-Greeting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name,
        
        [ValidateSet("Continue", "Stop", "SilentlyContinue", "Inquire")]
        [string]$ErrorAction = $ErrorActionPreference
    )
    
    process {
        try {
            # Function logic
        } catch {
            # Handle error based on ErrorAction
            switch ($ErrorAction) {
                "Stop" { throw }
                "Continue" { Write-Error $_ }
                "SilentlyContinue" { return }
                "Inquire" { 
                    $response = Read-Host "Error occurred. Continue? (Y/N)"
                    if ($response -ne "Y") { throw }
                }
            }
        }
    }
}
```

## 10.9 Common Module Pitfalls

Even experienced PowerShell developers encounter common module pitfalls. Understanding these issues helps write more robust modules.

### 10.9.1 Common Module Mistakes

#### 10.9.1.1 Missing Module Manifest

```powershell
# Bad: No manifest
# Just a psm1 file with no psd1
# Results in:
# - No versioning
# - No dependency management
# - Limited metadata

# Good: Always include manifest
New-ModuleManifest -Path MyModule.psd1 -RootModule MyModule.psm1
```

#### 10.9.1.2 Improper Function Export

```powershell
# Bad: Exporting all functions
Export-ModuleMember -Function *

# Bad: No export statement
# Results in no functions being available

# Good: Explicitly export only public functions
Export-ModuleMember -Function Get-Greeting, Set-Greeting
```

#### 10.9.1.3 Hard-Coded Paths

```powershell
# Bad: Hard-coded paths
$scriptPath = "C:\MyModule\Private\Get-TimeOfDay.ps1"

# Good: Use $PSScriptRoot
$scriptPath = Join-Path $PSScriptRoot "Private\Get-TimeOfDay.ps1"
```

### 10.9.2 Module Anti-Patterns

#### 10.9.2.1 Over-Exporting

```powershell
# Bad: Exporting private functions
Export-ModuleMember -Function Get-Greeting, Get-TimeOfDay

# Good: Only export public functions
Export-ModuleMember -Function Get-Greeting
```

#### 10.9.2.2 Module Pollution

```powershell
# Bad: Adding variables to global scope
$global:MyModuleConfig = @{...}

# Good: Keep variables in module scope
$script:ModuleConfig = @{...}
```

#### 10.9.2.3 Ignoring Error Handling

```powershell
# Bad: No error handling
function Get-Greeting {
    $result = Invoke-RestMethod "https://api.example.com/greeting"
    $result.message
}

# Good: Proper error handling
function Get-Greeting {
    try {
        $result = Invoke-RestMethod "https://api.example.com/greeting" -ErrorAction Stop
        $result.message
    } catch {
        $errorId = "ApiCallFailed,MyModule"
        $category = [System.Management.Automation.ErrorCategory]::ResourceUnavailable
        $exception = [System.Exception]::new("API call failed: $($_.Exception.Message)", $_.Exception)
        $errorRecord = [System.Management.Automation.ErrorRecord]::new($exception, $errorId, $category, $null)
        $PSCmdlet.ThrowTerminatingError($errorRecord)
    }
}
```

### 10.9.3 Troubleshooting Module Issues

#### 10.9.3.1 Module Loading Problems

**Symptoms**: Module doesn't load or commands aren't available.

**Diagnosis**:
```powershell
# Check module paths
$env:PSModulePath -split ';'

# Check if module exists in paths
Get-Module -ListAvailable -Name MyModule

# Verbose import
Import-Module MyModule -Verbose

# Check for errors
$Error[0] | Format-List * -Force
```

#### 10.9.3.2 Command Not Found

**Symptoms**: Module loads but commands aren't available.

**Diagnosis**:
```powershell
# Check exported commands
(Get-Module -Name MyModule).ExportedCommands

# Check command availability
Get-Command -Module MyModule

# Check for name conflicts
Get-Command Get-Greeting -All
```

#### 10.9.3.3 Version Conflicts

**Symptoms**: Unexpected behavior due to multiple versions.

**Diagnosis**:
```powershell
# Check all installed versions
Get-Module -ListAvailable -Name MyModule | Format-List Name, Version, ModuleBase

# Check loaded version
Get-Module -Name MyModule | Format-List Name, Version, ModuleBase

# Remove specific version
Get-Module -ListAvailable -Name MyModule | 
    Where-Object Version -eq "1.0.0" | 
    Remove-Module -Force
```

## 10.10 Practical Module Exercises

Apply your module knowledge with these hands-on exercises of varying difficulty.

### 10.10.1 Basic Exercises

#### 10.10.1.1 Simple Module Creation

1. Create a module named "GreetingModule" with a single function "Get-Greeting"
2. The function should take a Name parameter and return a greeting message
3. Create a module manifest with appropriate metadata
4. Install the module and verify it works

Solutions:
```powershell
# 1
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\GreetingModule"
New-Item -Path $moduleRoot -ItemType Directory

# 2
Set-Content -Path "$moduleRoot\GreetingModule.psm1" -Value @'
function Get-Greeting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    "Hello, $Name!"
}
Export-ModuleMember -Function Get-Greeting
'@

# 3
New-ModuleManifest -Path "$moduleRoot\GreetingModule.psd1" `
    -RootModule "GreetingModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "Provides greeting functionality" `
    -Author "Your Name" `
    -CompanyName "Your Company" `
    -Copyright "(c) $(Get-Date -Format yyyy) Your Company. All rights reserved." `
    -FunctionsToExport "Get-Greeting"

# 4
Import-Module GreetingModule
Get-Greeting -Name "PowerShell"
Get-Module GreetingModule | Format-List *
```

#### 10.10.1.2 Module Structure

1. Create a module with proper structure (Public/Private directories)
2. Place a public function in the Public directory
3. Place a private function in the Private directory
4. Create a module bootstrap file that loads both

Solutions:
```powershell
# 1
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\StructuredModule"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\Public" -ItemType Directory
New-Item -Path "$moduleRoot\Private" -ItemType Directory

# 2
Set-Content -Path "$moduleRoot\Public\Get-Greeting.ps1" -Value @'
function Get-Greeting {
    param(
        [string]$Name = "World"
    )
    $timeOfDay = Get-TimeOfDay
    "Good $timeOfDay, $Name!"
}
'@

# 3
Set-Content -Path "$moduleRoot\Private\Get-TimeOfDay.ps1" -Value @'
function Get-TimeOfDay {
    $hour = (Get-Date).Hour
    if ($hour -lt 12) { "morning" }
    elseif ($hour -lt 18) { "afternoon" }
    else { "evening" }
}
'@

# 4
Set-Content -Path "$moduleRoot\StructuredModule.psm1" -Value @'
# Dot source all public functions
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Dot source all private functions
Get-ChildItem -Path $PSScriptRoot\Private\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Export all public functions
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
'@

# Create manifest
New-ModuleManifest -Path "$moduleRoot\StructuredModule.psd1" `
    -RootModule "StructuredModule.psm1" `
    -ModuleVersion "1.0.0" `
    -FunctionsToExport "Get-Greeting"
```

#### 10.10.1.3 Module Manifest

1. Create a module manifest with required metadata
2. Specify module version as 1.0.0
3. Add a description and author information
4. Specify that the module requires PowerShell 5.1+

Solutions:
```powershell
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\ManifestModule"
New-Item -Path $moduleRoot -ItemType Directory

# Create minimal module file
Set-Content -Path "$moduleRoot\ManifestModule.psm1" -Value @'
function Get-Greeting {
    "Hello, World!"
}
Export-ModuleMember -Function Get-Greeting
'@

# 1-3
New-ModuleManifest -Path "$moduleRoot\ManifestModule.psd1" `
    -RootModule "ManifestModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "Module demonstrating manifest usage" `
    -Author "Your Name <your.email@example.com>" `
    -CompanyName "Your Company" `
    -Copyright "(c) $(Get-Date -Format yyyy) Your Company. All rights reserved." `
    -FunctionsToExport "Get-Greeting" `
    # 4
    -PowerShellVersion "5.1"
    
# Verify
Test-ModuleManifest -Path "$moduleRoot\ManifestModule.psd1" | Format-List *
```

### 10.10.2 Intermediate Exercises

#### 10.10.2.1 Module with Dependencies

1. Create a module that depends on PSScriptAnalyzer
2. Use a function from PSScriptAnalyzer in your module
3. Specify the dependency in your module manifest
4. Test that the module loads correctly when dependency is present

Solutions:
```powershell
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\DependencyModule"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\Public" -ItemType Directory

# 1-2
Set-Content -Path "$moduleRoot\Public\Analyze-Script.ps1" -Value @'
function Analyze-Script {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        [string]$Path
    )
    
    process {
        Invoke-ScriptAnalyzer -Path $Path
    }
}
'@

# 3
New-ModuleManifest -Path "$moduleRoot\DependencyModule.psd1" `
    -RootModule "DependencyModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "Module with PSScriptAnalyzer dependency" `
    -Author "Your Name" `
    -FunctionsToExport "Analyze-Script" `
    -RequiredModules @(
        @{ 
            ModuleName = "PSScriptAnalyzer"; 
            ModuleVersion = "1.20.0" 
        }
    )

# Create bootstrap
Set-Content -Path "$moduleRoot\DependencyModule.psm1" -Value @'
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
'@

# 4
# First, ensure PSScriptAnalyzer is installed
Install-Module -Name PSScriptAnalyzer -Scope CurrentUser -Force

# Test module
Import-Module DependencyModule
Analyze-Script -Path $PROFILE
```

#### 10.10.2.2 Module with Help

1. Add comment-based help to your module functions
2. Create external help files (about_MyModule.help.txt)
3. Test that help displays correctly with Get-Help
4. Add help URIs to your module manifest

Solutions:
```powershell
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\HelpModule"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\Public" -ItemType Directory
New-Item -Path "$moduleRoot\en-US" -ItemType Directory

# 1
Set-Content -Path "$moduleRoot\Public\Get-Greeting.ps1" -Value @'
<#
.SYNOPSIS
    Gets a greeting message

.DESCRIPTION
    Returns a greeting message for the specified name.

.PARAMETER Name
    The name to include in the greeting

.EXAMPLE
    Get-Greeting -Name "PowerShell"
    Returns "Hello, PowerShell!"

.INPUTS
    System.String

.OUTPUTS
    System.String

.NOTES
    Created by Your Name on $(Get-Date -Format "yyyy-MM-dd")
#>
function Get-Greeting {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    "Hello, $Name!"
}
'@

# 2
Set-Content -Path "$moduleRoot\en-US\about_HelpModule.help.txt" -Value @'
# about_HelpModule

## SHORT DESCRIPTION
Provides greeting functionality.

## LONG DESCRIPTION
The HelpModule module provides functions for generating greeting messages.

## EXAMPLES
Get-Greeting -Name "PowerShell"

## KEYWORDS
greeting, hello, example
'@

# 3
# Create bootstrap and manifest
Set-Content -Path "$moduleRoot\HelpModule.psm1" -Value @'
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
'@

New-ModuleManifest -Path "$moduleRoot\HelpModule.psd1" `
    -RootModule "HelpModule.psm1" `
    -ModuleVersion "1.0.0" `
    -FunctionsToExport "Get-Greeting" `
    # 4
    -HelpInfoUri "https://yourdocs.example.com/HelpModule"

# Test help
Import-Module HelpModule
Get-Help Get-Greeting -Full
Get-Help about_HelpModule
```

#### 10.10.2.3 Module Testing

1. Create a Pester test for your module functions
2. Test both success and error conditions
3. Include tests for private functions
4. Measure code coverage

Solutions:
```powershell
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\TestModule"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\Public" -ItemType Directory
New-Item -Path "$moduleRoot\Private" -ItemType Directory
New-Item -Path "$moduleRoot\Tests" -ItemType Directory

# Create module
Set-Content -Path "$moduleRoot\Public\Get-Greeting.ps1" -Value @'
function Get-Greeting {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    "Hello, $Name!"
}
'@

Set-Content -Path "$moduleRoot\Private\Get-TimeOfDay.ps1" -Value @'
function Get-TimeOfDay {
    $hour = (Get-Date).Hour
    if ($hour -lt 12) { "morning" }
    elseif ($hour -lt 18) { "afternoon" }
    else { "evening" }
}
'@

Set-Content -Path "$moduleRoot\TestModule.psm1" -Value @'
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}
Get-ChildItem -Path $PSScriptRoot\Private\*.ps1 | ForEach-Object {
    . $_.FullName
}
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
'@

New-ModuleManifest -Path "$moduleRoot\TestModule.psd1" `
    -RootModule "TestModule.psm1" `
    -ModuleVersion "1.0.0" `
    -FunctionsToExport "Get-Greeting"

# 1-2
Set-Content -Path "$moduleRoot\Tests\PublicFunctions.Tests.ps1" -Value @'
Describe "Public Functions" {
    BeforeAll {
        Import-Module "$using:moduleRoot\TestModule.psm1" -Force
    }
    
    It "Get-Greeting returns expected result" {
        Get-Greeting -Name "PowerShell" | Should -Be "Hello, PowerShell!"
    }
    
    It "Get-Greeting throws on empty name" {
        { Get-Greeting -Name "" } | Should -Throw
    }
}
'@

# 3
Set-Content -Path "$moduleRoot\Tests\PrivateFunctions.Tests.ps1" -Value @'
Describe "Private Functions" {
    BeforeAll {
        # Import private function directly for testing
        . "$using:moduleRoot\Private\Get-TimeOfDay.ps1"
    }
    
    It "Get-TimeOfDay returns morning before noon" {
        # Mock Get-Date
        function Get-Date { [DateTime]::Parse("09:00") }
        Get-TimeOfDay | Should -Be "morning"
    }
    
    It "Get-TimeOfDay returns afternoon between noon and 6pm" {
        function Get-Date { [DateTime]::Parse("14:00") }
        Get-TimeOfDay | Should -Be "afternoon"
    }
    
    It "Get-TimeOfDay returns evening after 6pm" {
        function Get-Date { [DateTime]::Parse("19:00") }
        Get-TimeOfDay | Should -Be "evening"
    }
}
'@

# 4
Invoke-Pester -Path "$moduleRoot\Tests" -CodeCoverage "$moduleRoot\*.psm1"
```

### 10.10.3 Advanced Exercises

#### 10.10.3.1 Comprehensive Module Development

1. Design a module for system inventory collection
2. Implement proper structure with Public/Private directories
3. Add error handling with custom error records
4. Create comprehensive help documentation
5. Implement module testing with code coverage

Solutions:
```powershell
# 1-2
$moduleRoot = "$env:USERPROFILE\Documents\PowerShell\Modules\SystemInventory"
New-Item -Path $moduleRoot -ItemType Directory
New-Item -Path "$moduleRoot\Public" -ItemType Directory
New-Item -Path "$moduleRoot\Private" -ItemType Directory
New-Item -Path "$moduleRoot\en-US" -ItemType Directory
New-Item -Path "$moduleRoot\Tests" -ItemType Directory

# Public functions
Set-Content -Path "$moduleRoot\Public\Get-SystemInfo.ps1" -Value @'
<#
.SYNOPSIS
    Gets system information

.DESCRIPTION
    Collects comprehensive system information including OS, CPU, and memory.

.EXAMPLE
    Get-SystemInfo
    Returns system information for the local computer

.EXAMPLE
    Get-SystemInfo -ComputerName Server01
    Returns system information for remote computer

.INPUTS
    None

.OUTPUTS
    PSCustomObject with system information

.NOTES
    Created by Your Name on $(Get-Date -Format "yyyy-MM-dd")
#>
function Get-SystemInfo {
    [CmdletBinding()]
    param(
        [string]$ComputerName = $env:COMPUTERNAME
    )
    
    try {
        # OS information
        $os = Get-CimInstance -ClassName Win32_OperatingSystem `
            -ComputerName $ComputerName -ErrorAction Stop
        
        # CPU information
        $cpu = Get-CimInstance -ClassName Win32_Processor `
            -ComputerName $ComputerName -ErrorAction Stop
        
        # Memory information
        $memory = Get-CimInstance -ClassName Win32_ComputerSystem `
            -ComputerName $ComputerName -ErrorAction Stop
        
        # Build result object
        [PSCustomObject]@{
            ComputerName = $ComputerName
            OS = $os.Caption
            Version = $os.Version
            CPU = $cpu.Name
            CPUCount = $cpu.NumberOfCores
            TotalMemoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
            FreeMemoryGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
            Uptime = (Get-Date) - $os.LastBootUpTime
        }
    } catch {
        # 3
        $errorId = "SystemInfoCollectionFailed,SystemInventory"
        $category = [System.Management.Automation.ErrorCategory]::ResourceUnavailable
        $message = "Failed to collect system information from $ComputerName: $($_.Exception.Message)"
        
        $exception = [System.Exception]::new($message, $_.Exception)
        $errorRecord = [System.Management.Automation.ErrorRecord]::new(
            $exception, $errorId, $category, $ComputerName
        )
        
        $PSCmdlet.ThrowTerminatingError($errorRecord)
    }
}
'@

# Private helper
Set-Content -Path "$moduleRoot\Private\ConvertTo-FormattedUptime.ps1" -Value @'
function ConvertTo-FormattedUptime {
    param(
        [timespan]$Uptime
    )
    
    "{0:D2}d {1:D2}h {2:D2}m" -f $Uptime.Days, $Uptime.Hours, $Uptime.Minutes
}
'@

# Module bootstrap
Set-Content -Path "$moduleRoot\SystemInventory.psm1" -Value @'
# Dot source all public functions
Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Dot source all private functions
Get-ChildItem -Path $PSScriptRoot\Private\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Export all public functions
Export-ModuleMember -Function (Get-ChildItem -Path $PSScriptRoot\Public\*.ps1).BaseName
'@

# Module manifest
New-ModuleManifest -Path "$moduleRoot\SystemInventory.psd1" `
    -RootModule "SystemInventory.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "Collects system inventory information" `
    -Author "Your Name" `
    -CompanyName "Your Company" `
    -Copyright "(c) $(Get-Date -Format yyyy) Your Company. All rights reserved." `
    -FunctionsToExport "Get-SystemInfo" `
    # 4
    -ProjectUri "https://github.com/yourusername/SystemInventory" `
    -LicenseUri "https://opensource.org/licenses/MIT" `
    -ReleaseNotes @"
## 1.0.0
- Initial release
- Added Get-SystemInfo function
"@

# 5 - Tests
Set-Content -Path "$moduleRoot\Tests\SystemInventory.Tests.ps1" -Value @'
Describe "SystemInventory Module" {
    It "Exports Get-SystemInfo function" {
        (Get-Command -Module SystemInventory).Name | Should -Contain "Get-SystemInfo"
    }
    
    Context "Local system" {
        It "Returns system information" {
            $result = Get-SystemInfo
            $result.ComputerName | Should -Be $env:COMPUTERNAME
            $result.OS | Should -Not -BeNullOrEmpty
        }
    }
    
    Context "Error handling" {
        It "Throws specific error for invalid computer" {
            { Get-SystemInfo -ComputerName "NonExistent" } | 
                Should -Throw -ExceptionType "System.Management.Automation.CmdletInvocationException"
        }
    }
}
'@

# Run tests with coverage
Invoke-Pester -Path "$moduleRoot\Tests" -CodeCoverage "$moduleRoot\*.psm1"
```

#### 10.10.3.2 Module Publishing Workflow

1. Create a GitHub repository for your module
2. Implement a CI/CD pipeline for testing and publishing
3. Add versioning based on Git tags
4. Implement pre-release and stable release workflows

Solutions:
```powershell
# This exercise focuses on the workflow rather than PowerShell code
# Key components:

# 1. GitHub Repository Structure
#    - src/ (module code)
#    - tests/ (Pester tests)
#    - docs/ (documentation)
#    - .github/workflows (CI/CD pipelines)
#    - LICENSE
#    - README.md
#    - build.ps1 (build script)

# 2. CI/CD Pipeline (GitHub Actions example)
#    .github/workflows/ci.yml
<#
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install dependencies
      run: |
        Install-Module -Name Pester -Force -SkipPublisherCheck
        Install-Module -Name PlatyPS -Force -SkipPublisherCheck
    
    - name: Run tests
      run: |
        Invoke-Pester -Path ./tests -Output Detailed
        
    - name: Generate documentation
      run: |
        New-ExternalHelp -Path ./docs -OutputPath ./en-US
        
    - name: Build module
      run: |
        # Copy files to build directory
        # Update version based on git tag
        # Create module package
#>

# 3. Versioning based on Git tags
#    build.ps1 script excerpt:
<#
function Get-Version {
    $tags = git tag --list 'v*' | Sort-Object {[version]$_} -Descending
    if ($tags) {
        return $tags[0].TrimStart('v')
    }
    return "0.0.1"
}

$version = Get-Version
Update-ModuleManifest -Path "src/MyModule.psd1" -ModuleVersion $version
#>

# 4. Release workflows
#    .github/workflows/release.yml
<#
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Publish to PowerShell Gallery
      env:
        API_KEY: ${{ secrets.PS_GALLERY_API_KEY }}
      run: |
        $env:PSGalleryApiKey = $env:API_KEY
        Publish-Module -Path ./src -Repository PSGallery -NuGetApiKey $env:PSGalleryApiKey
#>
```

#### 10.10.3.3 Enterprise Module Framework

1. Design a module framework for enterprise use
2. Implement module versioning and compatibility
3. Add module configuration system
4. Implement module health monitoring
5. Create module deployment system

Solutions:
```powershell
# 1. Enterprise module structure
$enterpriseRoot = "C:\EnterpriseModules"
New-Item -Path $enterpriseRoot -ItemType Directory
New-Item -Path "$enterpriseRoot\Framework" -ItemType Directory
New-Item -Path "$enterpriseRoot\Modules" -ItemType Directory
New-Item -Path "$enterpriseRoot\Config" -ItemType Directory
New-Item -Path "$enterpriseRoot\Logs" -ItemType Directory

# 2. Versioning and compatibility
Set-Content -Path "$enterpriseRoot\Framework\Versioning.ps1" -Value @'
class ModuleVersion {
    [version]$Version
    [DateTime]$ReleaseDate
    [string]$ReleaseNotes
    [bool]$IsStable
    
    ModuleVersion([version]$Version, [DateTime]$ReleaseDate, [string]$ReleaseNotes, [bool]$IsStable) {
        $this.Version = $Version
        $this.ReleaseDate = $ReleaseDate
        $this.ReleaseNotes = $ReleaseNotes
        $this.IsStable = $IsStable
    }
}

class ModuleCompatibility {
    static [bool] IsCompatible([version]$required, [version]$available) {
        # Major version must match for compatibility
        return $required.Major -eq $available.Major -and
               $required.Minor -le $available.Minor
    }
}
'@

# 3. Configuration system
Set-Content -Path "$enterpriseRoot\Framework\Configuration.ps1" -Value @'
$script:ModuleConfig = @{}

function Get-ModuleConfig {
    param(
        [string]$Module,
        [string]$Setting
    )
    
    if (-not $script:ModuleConfig.ContainsKey($Module)) {
        $configPath = Join-Path "$enterpriseRoot\Config" "$Module.config.json"
        if (Test-Path $configPath) {
            $script:ModuleConfig[$Module] = Get-Content $configPath | ConvertFrom-Json
        } else {
            $script:ModuleConfig[$Module] = @{}
        }
    }
    
    return $script:ModuleConfig[$Module].$Setting
}

function Set-ModuleConfig {
    param(
        [string]$Module,
        [string]$Setting,
        $Value
    )
    
    if (-not $script:ModuleConfig.ContainsKey($Module)) {
        $script:ModuleConfig[$Module] = @{}
    }
    
    $script:ModuleConfig[$Module].$Setting = $Value
    
    # Persist to disk
    $configPath = Join-Path "$enterpriseRoot\Config" "$Module.config.json"
    $script:ModuleConfig[$Module] | ConvertTo-Json | Set-Content $configPath
}
'@

# 4. Health monitoring
Set-Content -Path "$enterpriseRoot\Framework\Monitoring.ps1" -Value @'
$script:ModuleHealth = @{}

function Register-ModuleHealthCheck {
    param(
        [string]$Module,
        [scriptblock]$Check,
        [timespan]$Interval = [timespan]::FromMinutes(5)
    )
    
    $script:ModuleHealth[$Module] = @{
        Check = $Check
        Interval = $Interval
        LastRun = [DateTime]::MinValue
        Result = $null
    }
}

function Invoke-ModuleHealthChecks {
    $now = [DateTime]::UtcNow
    foreach ($entry in $script:ModuleHealth.GetEnumerator()) {
        $module = $entry.Key
        $health = $entry.Value
        
        if (($now - $health.LastRun) -ge $health.Interval) {
            try {
                $health.Result = & $health.Check
                $health.LastRun = $now
                Write-Verbose "Health check for $module succeeded"
            } catch {
                Write-Warning "Health check for $module failed: $_"
                $health.Result = $null
            }
        }
    }
}

# Example usage
Register-ModuleHealthCheck -Module "SystemInventory" -Check {
    $result = Get-SystemInfo -ErrorAction Stop
    return $result.OS -match "Windows"
}
'@

# 5. Deployment system
Set-Content -Path "$enterpriseRoot\Framework\Deployment.ps1" -Value @'
function Install-EnterpriseModule {
    param(
        [string]$ModuleName,
        [version]$Version,
        [string]$Repository = "InternalGallery"
    )
    
    # Check compatibility
    $current = Get-Module -Name $ModuleName -ListAvailable | 
        Sort-Object Version -Descending | 
        Select-Object -First 1
    
    if ($current -and -not [ModuleCompatibility]::IsCompatible($Version, $current.Version)) {
        Write-Warning "Version $Version is not compatible with current version $($current.Version)"
        return $false
    }
    
    # Install module
    Install-Module -Name $ModuleName -RequiredVersion $Version `
        -Repository $Repository -Scope AllUsers -Force
    
    # Configure module
    $config = Get-ModuleConfig -Module $ModuleName
    if ($config -and $config.SetupScript) {
        . $config.SetupScript
    }
    
    return $true
}

function Update-EnterpriseModule {
    param(
        [string]$ModuleName,
        [string]$Repository = "InternalGallery"
    )
    
    $latest = Find-Module -Name $ModuleName -Repository $Repository | 
        Sort-Object Version -Descending | 
        Select-Object -First 1
    
    return Install-EnterpriseModule -ModuleName $ModuleName `
        -Version $latest.Version `
        -Repository $Repository
}
'@

# Bootstrap framework
Set-Content -Path "$enterpriseRoot\Framework\EnterpriseFramework.psm1" -Value @'
# Load framework components
Get-ChildItem -Path $PSScriptRoot\*.ps1 | ForEach-Object {
    . $_.FullName
}

# Export framework functions
Export-ModuleMember -Function `
    Get-ModuleConfig, Set-ModuleConfig, `
    Register-ModuleHealthCheck, Invoke-ModuleHealthChecks, `
    Install-EnterpriseModule, Update-EnterpriseModule
'@

New-ModuleManifest -Path "$enterpriseRoot\Framework\EnterpriseFramework.psd1" `
    -RootModule "EnterpriseFramework.psm1" `
    -ModuleVersion "1.0.0" `
    -Description "Enterprise module framework" `
    -FunctionsToExport @(
        "Get-ModuleConfig", "Set-ModuleConfig",
        "Register-ModuleHealthCheck", "Invoke-ModuleHealthChecks",
        "Install-EnterpriseModule", "Update-EnterpriseModule"
    )
```

## 10.11 Summary

In this comprehensive chapter, you've gained deep knowledge of working with PowerShell modules:

- Understood the fundamental principles of PowerShell modules and their importance in professional development
- Mastered the syntax and structure for creating custom modules with proper organization
- Learned techniques for using module manifests to control behavior and metadata
- Discovered how to properly export functions, variables, and aliases from modules
- Gained insights into managing module scope and visibility for clean encapsulation
- Explored discovering, installing, and updating modules from the PowerShell Gallery
- Learned advanced techniques for creating private functions and internal module structure
- Understood versioning strategies and best practices for module updates
- Acquired skills for module testing, documentation, and publishing
- Identified and learned to avoid common module pitfalls and anti-patterns

You now have the knowledge and skills to organize your PowerShell code into reusable, maintainable modules that can be shared across teams and projects. This is essential for professional PowerShell development and automation at scale.

## 10.12 Next Steps Preview: Chapter 11 – PowerShell Remoting

In the next chapter, we'll explore PowerShell remoting - the technology that enables you to run PowerShell commands and scripts on remote computers. You'll learn:

- Understanding the PowerShell remoting architecture and components
- Configuring WinRM for PowerShell remoting
- Using Enter-PSSession for interactive remote sessions
- Using Invoke-Command for running commands on remote computers
- Working with remote variables and sessions
- Managing credentials and security for remoting
- Troubleshooting common remoting issues
- Advanced remoting techniques (implicit remoting, session configurations)
- Best practices for secure and efficient remoting
- Common pitfalls and how to avoid them

You'll gain the ability to manage multiple systems simultaneously, automate distributed tasks, and build centralized management solutions - essential skills for enterprise PowerShell administration.