# 2. Setting Up Your Environment

Before you can begin writing effective PowerShell scripts, you need a reliable, well-configured development environment. Unlike simple command-line tools, PowerShell supports rich editing experiences, debugging, syntax highlighting, tab completion, and integration with source control systems. A properly set-up environment dramatically improves productivity, reduces errors, and makes learning faster and more enjoyable.

In this chapter, we will:
- Choose the correct PowerShell edition for your specific needs
- Install PowerShell on various operating systems with detailed platform-specific instructions
- Select and configure a code editor with comprehensive comparisons
- Install and configure the PowerShell extension for VS Code with advanced settings
- Configure IntelliSense, syntax checking, and debugging with practical examples
- Create and manage PowerShell profiles with real-world templates
- Customize your prompt with multiple approaches and visual examples
- Install and manage modules with PowerShellGet and alternative methods
- Troubleshoot common setup issues with detailed diagnostic procedures
- Configure security settings appropriate for different environments
- Optimize performance for large-scale scripting scenarios
- Set up source control integration for PowerShell development
- Configure remote development environments

By the end of this chapter, you'll have a fully functional, personalized PowerShell workspace ready for real-world scripting in any environment.

## 2.1 Choosing the Right PowerShell Edition

PowerShell exists in two main editions: **Windows PowerShell 5.1** and **PowerShell 7.x** (also known as PowerShell Core). Understanding the differences between them is essential for making the right choice for your environment.

### 2.1.1 Windows PowerShell vs. PowerShell 7

| Feature | Windows PowerShell 5.1 | PowerShell 7.4 |
|--------|-------------------------|----------------|
| Base Runtime | .NET Framework 4.5+ | .NET 7 |
| OS Support | Windows only | Windows, Linux, macOS |
| COM Support | Yes | No |
| WMI Support | Native WMI (`Get-WmiObject`) | CIM only (`Get-CimInstance`) |
| GUI Support | Full (Windows Forms, WPF) | Limited |
| Installation | Built into Windows | Separate install |
| Future Development | Complete (no new features) | Actively developed |
| Module Compatibility | All legacy modules | Most modules; some exceptions |
| Default Execution Policy | Restricted | RemoteSigned |
| TLS Support | TLS 1.0-1.2 | TLS 1.2-1.3 |
| Background Jobs | PowerShell jobs | PowerShell jobs + .NET tasks |
| Pipeline Parallelism | Not available | `ForEach-Object -Parallel` |
| Null Coalescing | Not available | `??` operator |
| Error View | Traditional | Concise, Comprehensive, Normal |
| Configuration Files | registry-based | JSON-based |

#### 2.1.1.1 Key Differences Between Editions

**Windows PowerShell 5.1**:
- Shipped with Windows 7 SP1 through Windows 10 and Windows Server 2008 R2+
- Uses `.NET Framework`, which is Windows-only
- Supports COM objects, ADSI, WMI, and other legacy Windows technologies
- No longer receiving feature updates — only security fixes
- Default execution policy is `Restricted` on client OS
- Limited support for modern TLS protocols
- Does not support pipeline parallelism
- Has no native null-coalescing operator
- Uses registry for configuration settings
- Has limited error formatting options

**PowerShell 7.4**:
- Open-source, cross-platform implementation built on .NET 7
- Released under MIT license at [github.com/PowerShell/PowerShell](https://github.com/PowerShell/PowerShell)
- Designed to be backward compatible with most Windows PowerShell scripts and modules
- Includes modern language features (e.g., null-coalescing operator `??`, pipeline parallelism)
- Default execution policy is `RemoteSigned`
- Full TLS 1.2 and 1.3 support
- Supports `ForEach-Object -Parallel` for concurrent processing
- Provides multiple error formatting views
- Uses JSON configuration files
- Recommended for all new development

When considering the transition from Windows PowerShell to PowerShell 7, it's important to understand that PowerShell 7 is not merely an incremental update but represents a fundamental architectural shift. While Windows PowerShell was designed specifically for Windows administration, PowerShell 7 was built from the ground up as a cross-platform automation engine. This means that while PowerShell 7 maintains compatibility with most Windows PowerShell scripts, it also introduces new capabilities that weren't possible in the Windows-only ecosystem.

One critical consideration is that PowerShell 7 operates in "constrained language mode" by default when running under certain security contexts, which can affect how scripts execute. Understanding these security boundaries is essential for proper environment configuration.

### 2.1.2 When to Use Each Edition

#### 2.1.2.1 Use PowerShell 7.4 If:
- You are starting a new project
- You work in mixed or non-Windows environments
- You want access to modern language features
- You do not depend on COM, DCOM, or legacy WMI
- You plan to use containers, CI/CD pipelines, or cloud automation
- You need better performance for large data processing
- You require modern security protocols (TLS 1.3)
- You want consistent behavior across platforms
- You need pipeline parallelism for performance-critical operations
- You prefer the improved error messages and formatting
- You want to future-proof your automation investments

#### 2.1.2.2 Use Windows PowerShell 5.1 Only If:
- You rely on COM-based modules (e.g., SCCM cmdlets, certain Exchange tools)
- You must use `Get-WmiObject` instead of `Get-CimInstance` for specific functionality
- Your organization restricts unsigned binaries and cannot easily deploy PowerShell 7
- You require full GUI support for Windows Forms or WPF applications
- You depend on specific Windows PowerShell-only modules that haven't been ported
- You're working in an environment with strict compatibility requirements
- You need to interact with legacy Windows components that only expose COM interfaces
- You're maintaining existing scripts that would require significant refactoring

#### 2.1.2.3 Mixed Environment Strategy

Many organizations adopt a transitional strategy:

1. **New development**: Use PowerShell 7 for all new scripts
2. **Legacy maintenance**: Keep Windows PowerShell for maintaining existing scripts
3. **Hybrid execution**: Call Windows PowerShell from PowerShell 7 when needed:
   ```powershell
   powershell.exe -Command "Import-Module ActiveDirectory; Get-ADUser -Identity jsmith"
   ```

4. **Compatibility testing**: Before migrating, test scripts with:
   ```powershell
   powershell.exe -File .\legacy-script.ps1
   pwsh.exe -File .\legacy-script.ps1
   ```

5. **Gradual migration**: Refactor critical scripts first, less critical later

This approach allows organizations to benefit from PowerShell 7's improvements while maintaining compatibility with legacy systems.

### 2.1.3 Determining Your Current PowerShell Version

Before making any changes, verify your current PowerShell environment:

```powershell
$PSVersionTable
```

Key properties to check:
- `PSVersion`: Major version number (5.x vs 7.x)
- `PSEdition`: "Desktop" (Windows PowerShell) vs "Core" (PowerShell 7)
- `OS`: Operating system details
- `PSCompatibleVersions`: Compatibility versions supported
- `BuildVersion`: For Windows PowerShell only
- `GitCommitId`: For PowerShell 7 only

To check which PowerShell editions are installed:

```powershell
Get-Command powershell, pwsh -ErrorAction SilentlyContinue | 
    Select-Object Name, Version, Source
```

This will show if both `powershell.exe` (Windows PowerShell) and `pwsh.exe` (PowerShell 7) are available.

## 2.2 Installing PowerShell 7

Now that we've chosen our edition, let's install PowerShell 7 across platforms with detailed instructions for each operating system.

### 2.2.1 Installing on Windows

There are several ways to install PowerShell 7 on Windows. The recommended method uses **Winget**, Microsoft's package manager, but we'll cover multiple installation methods with detailed troubleshooting.

#### 2.2.1.1 Using Winget (Recommended)

Winget is Microsoft's modern package manager, included with Windows 11 and available for Windows 10.

First, ensure Winget is installed:
- Windows 11: Already included
- Windows 10: Install from Microsoft Store or [GitHub releases](https://github.com/microsoft/winget-cli/releases)

Open an elevated PowerShell console (Run as Administrator) and run:

```powershell
winget install --id Microsoft.PowerShell --source winget
```

Detailed installation process:
1. Winget contacts the Microsoft repository
2. Downloads the latest PowerShell 7 installer
3. Verifies the package signature
4. Runs the installer with default settings
5. Adds `pwsh.exe` to the system PATH
6. Creates Start Menu entries
7. Registers PowerShell 7 with Windows Terminal (if installed)

After installation completes, verify it worked:

```powershell
pwsh --version
```

Expected output:
```
PowerShell 7.4.3
```

You can now launch PowerShell 7 via:
- Start Menu → "PowerShell 7"
- Command line: `pwsh`
- Windows Terminal: Add a new profile pointing to `pwsh.exe`

#### 2.2.1.2 Manual Installer

Download the latest MSI from:
- [https://aka.ms/powershell-release?tag=stable](https://aka.ms/powershell-release?tag=stable)

Choose between:
- MSI installer (recommended for most users)
- ZIP package (portable installation)
- MSIX package (Windows Store format)

For the MSI installer:
1. Run the downloaded file
2. Accept the license agreement
3. Choose installation location (default: `C:\Program Files\PowerShell\7`)
4. Select components:
   - PowerShell executable
   - Start Menu shortcuts
   - Windows Update (optional)
   - .NET Global Tools path (optional)
   - Register Windows PowerShell capability (optional)
5. Complete installation

The installer will:
- Install to `C:\Program Files\PowerShell\7`
- Add `pwsh.exe` to PATH
- Integrate with Windows Terminal (if installed)
- Create registry entries for system management
- Set up file associations for `.ps1` files

No reboot required.

#### 2.2.1.3 Installing via Microsoft Update

For enterprise environments, PowerShell 7 can be deployed through Microsoft Update:

1. Configure WSUS or Configuration Manager
2. Approve the PowerShell 7 update
3. Deploy to target systems

This method ensures consistent deployment across large environments and integrates with existing patch management processes.

#### 2.2.1.4 Portable Installation (ZIP Package)

For environments where you cannot install software:

1. Download the ZIP package
2. Extract to a directory (e.g., `C:\PowerShell\7`)
3. Add the directory to PATH:
   ```powershell
   [Environment]::SetEnvironmentVariable(
       "Path",
       [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\PowerShell\7",
       "User"
   )
   ```
4. Verify:
   ```powershell
   pwsh -version
   ```

Portable installations are useful for:
- Restricted environments
- Testing new versions without affecting system installation
- Creating isolated environments for specific projects

#### 2.2.1.5 Troubleshooting Windows Installation

**Issue: Installation fails with "Error 0x80070643"**
- Cause: .NET Framework prerequisites missing
- Solution: Install .NET Framework 4.7.2 or later

**Issue: "PowerShell 7 is already installed" but not found**
- Cause: Previous installation corrupted
- Solution: Uninstall via Control Panel, then reinstall

**Issue: PATH not updated properly**
- Solution: Manually add to PATH:
  ```powershell
  $path = [Environment]::GetEnvironmentVariable("Path", "Machine")
  if ($path -notlike "*PowerShell\7*") {
      [Environment]::SetEnvironmentVariable(
          "Path",
          "$path;C:\Program Files\PowerShell\7",
          "Machine"
      )
  }
  ```

**Issue: Windows Terminal doesn't show PowerShell 7**
- Solution: Add profile manually:
  1. Open Windows Terminal settings (JSON)
  2. Add new profile:
     ```json
     {
         "guid": "{57b57d6b-96c1-4b8f-8b8c-8e8f8a8b8c8d}",
         "name": "PowerShell 7",
         "commandline": "pwsh.exe",
         "icon": "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png"
     }
     ```

### 2.2.2 Installing on macOS

PowerShell supports multiple installation methods on macOS, each with different advantages.

#### 2.2.2.1 Using Homebrew (Recommended)

Homebrew is the de facto package manager for macOS.

First, install Homebrew if you haven't already:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install PowerShell:
```bash
brew install --cask powershell
```

This installs PowerShell to `/usr/local/microsoft/powershell/7/` and creates a symlink at `/usr/local/bin/pwsh`.

To verify:
```bash
pwsh --version
```

#### 2.2.2.2 Manual Installation (PKG)

Download the PKG installer from the PowerShell GitHub releases page.

Steps:
1. Open the downloaded PKG file
2. Follow the installation wizard
3. Accept the license agreement
4. Complete installation

The installer places PowerShell in `/usr/local/microsoft/powershell/7/`.

#### 2.2.2.3 Installing via .NET Global Tool

If you have .NET SDK installed:

```bash
dotnet tool install --global PowerShell
```

This installs PowerShell as a .NET Global Tool, accessible via `dotnet pwsh`.

#### 2.2.2.4 Troubleshooting macOS Installation

**Issue: "PowerShell was blocked from opening because it is from an unidentified developer"**
- Solution: Go to System Preferences → Security & Privacy → General → Click "Open Anyway"

**Issue: Command not found after installation**
- Solution: Add to PATH:
  ```bash
  echo 'export PATH="/usr/local/microsoft/powershell/7:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```

**Issue: Certificate validation errors**
- Cause: macOS security restrictions
- Solution:
  ```powershell
  pwsh -Command "[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {\$true}"
  ```

**Issue: Missing dependencies**
- Solution: Install required libraries:
  ```bash
  brew install openssl icu4c
  ```

### 2.2.3 Installing on Linux

PowerShell supports multiple Linux distributions with detailed installation instructions for each.

#### 2.2.3.1 Ubuntu 22.04 / Debian 11+

Add the Microsoft GPG key and repository:

```bash
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

Update APT cache:
```bash
sudo apt update
```

Install PowerShell:
```bash
sudo apt install -y powershell
```

Start PowerShell:
```bash
pwsh
```

#### 2.2.3.2 Ubuntu 20.04

```bash
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y powershell
```

#### 2.2.3.3 Ubuntu 18.04

```bash
wget https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y powershell
```

#### 2.2.3.4 Debian 10 (Buster)

```bash
wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y powershell
```

#### 2.2.3.5 Debian 11 (Bullseye)

```bash
wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y powershell
```

#### 2.2.3.6 CentOS/RHEL 8+

Enable EPEL:
```bash
sudo dnf install epel-release -y
```

Add Microsoft repository:
```bash
curl https://packages.microsoft.com/config/rhel/8/prod.repo | sudo tee /etc/yum.repos.d/microsoft.repo
```

Install:
```bash
sudo dnf install -y powershell
```

Launch:
```bash
pwsh
```

#### 2.2.3.7 CentOS/RHEL 7

```bash
sudo curl https://packages.microsoft.com/config/rhel/7/prod.repo | sudo tee /etc/yum.repos.d/microsoft.repo
sudo yum install -y powershell
```

#### 2.2.3.8 Fedora 33+

```bash
sudo rpm -Uvh https://packages.microsoft.com/config/rhel/7/packages-microsoft-prod.rpm
sudo dnf install -y powershell
```

#### 2.2.3.9 SUSE Linux Enterprise Server 15

```bash
sudo rpm -Uvh https://packages.microsoft.com/config/sles/15/packages-microsoft-prod.rpm
sudo zypper install -y powershell
```

#### 2.2.3.10 Alpine Linux

PowerShell 7.2+ supports Alpine:

```bash
wget https://github.com/PowerShell/PowerShell/releases/download/v7.4.3/powershell-7.4.3-linux-alpine-x64.tar.gz
mkdir -p ~/powershell
tar -zxf ./powershell-7.4.3-linux-alpine-x64.tar.gz -C ~/powershell
~/powershell/pwsh
```

#### 2.2.3.11 Troubleshooting Linux Installation

**Issue: Missing dependencies**
- Common missing packages: `libunwind`, `libssl`, `icu`
- Solution for Debian/Ubuntu:
  ```bash
  sudo apt install -y libunwind8 libssl1.1 libicu67
  ```
- For RHEL/CentOS:
  ```bash
  sudo yum install -y libunwind openssl-libs icu
  ```

**Issue: GPG key errors**
- Solution:
  ```bash
  sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys EB3E94ADBE1229CF
  ```

**Issue: Repository not found**
- Check correct distribution code name
- Verify repository URL matches your distro version

**Issue: Permission denied when running pwsh**
- Solution:
  ```bash
  sudo chmod +x /usr/bin/pwsh
  ```

### 2.2.4 Verifying Installation

Regardless of platform, confirm installation succeeded:

```powershell
$PSVersionTable.PSVersion
```

Output should show:
```
Major: 7
Minor: 4
Build: x
Revision: x
```

Also check:
```powershell
$PSVersionTable.PSEdition
```
Should return `Core`.

And:
```powershell
$PSVersionTable.OS
```
Shows your operating system.

Check installation path:
```powershell
(Get-Process -Id $PID).Path
```

Verify .NET runtime:
```powershell
$PSVersionTable.Platform
$PSVersionTable.ClrVersion
$PSVersionTable.Culture
```

Check available PowerShell editions on Windows:
```powershell
Get-ChildItem -Path HKLM:\SOFTWARE\Microsoft\PowerShell\*\PowerShellEngine | 
    ForEach-Object { Get-ItemProperty -Path $_.PSPath }
```

## 2.3 Choosing a Code Editor

While you can write PowerShell scripts in Notepad, a proper code editor significantly enhances the experience. The right editor improves productivity through features like syntax highlighting, IntelliSense, debugging, and integration with source control.

### 2.3.1 Available Editors

| Editor | Pros | Cons | Best For |
|-------|------|------|----------|
| **Visual Studio Code** | Free, powerful, excellent PowerShell support, cross-platform, integrated terminal, Git integration | Requires extension for full PowerShell support | Most PowerShell developers |
| **PowerShell ISE** | Built-in, good for beginners, integrated debugger, shows command parameters | Deprecated, Windows-only, no PowerShell 7 support, limited features | Legacy Windows PowerShell maintenance |
| **Vim / Neovim** | Lightweight, highly customizable, available everywhere, powerful editing commands | Steep learning curve, requires configuration | Terminal-focused developers |
| **Sublime Text** | Fast, clean UI, powerful editing features, good plugin ecosystem | Paid license for full features, less PowerShell-specific | Developers who prefer lightweight editors |
| **JetBrains Rider** | Full IDE experience, excellent debugging, integrated with other JetBrains tools | Expensive, heavier resource usage | Enterprise environments with other JetBrains tools |
| **Notepad++** | Lightweight, Windows-only, good for quick edits | Limited PowerShell support, no debugging | Quick edits on Windows |
| **Emacs** | Highly extensible, powerful editing, available on all platforms | Steep learning curve, requires configuration | Emacs enthusiasts |

#### 2.3.1.1 Recommendation: Use Visual Studio Code

**Visual Studio Code (VS Code)** is the de facto standard for PowerShell development today. It offers:
- Free and open-source
- Cross-platform (Windows, Linux, macOS)
- Excellent IntelliSense and debugging
- Integrated terminal
- Git integration
- Extensions ecosystem
- Active community support
- Regular updates
- Customizable interface
- Remote development capabilities

VS Code has effectively replaced the aging PowerShell ISE, which Microsoft has officially deprecated. The PowerShell ISE lacks support for PowerShell 7 and has not received feature updates since 2016.

#### 2.3.1.2 When to Consider Alternatives

While VS Code is recommended for most users, consider alternatives in these scenarios:

**Use Vim/Neovim if:**
- You work primarily in terminal environments
- You need to edit files on remote servers
- You're already proficient with Vim
- You need a lightweight editor with minimal resource usage
- You work in environments where GUI applications aren't available

**Use JetBrains Rider if:**
- You're part of a team using other JetBrains tools (ReSharper, Rider for C#)
- You need advanced debugging features
- You work with mixed-language projects (C#, PowerShell, etc.)
- Your organization has enterprise licenses
- You need deep .NET integration

**Use Sublime Text if:**
- You prefer a lightweight editor with fast startup
- You already own a license
- You need a simpler interface than VS Code
- You work on older hardware with limited resources

**Use PowerShell ISE only if:**
- You're maintaining legacy Windows PowerShell scripts
- You're in an environment that restricts software installation
- You're training users who will only work with Windows PowerShell
- You need the ISE's specific form designer capabilities

### 2.3.2 Editor Feature Comparison

| Feature | VS Code | PowerShell ISE | Vim | Sublime Text | Rider |
|---------|---------|----------------|-----|--------------|-------|
| PowerShell Support | Excellent (via extension) | Built-in | Good (via plugins) | Good (via plugins) | Excellent |
| Cross-Platform | Yes | No | Yes | Yes | Yes |
| Integrated Terminal | Yes | Yes | No | No | Yes |
| Debugging | Full | Full | Limited | Limited | Full |
| IntelliSense | Excellent | Good | Good | Good | Excellent |
| Git Integration | Excellent | None | Good | Good | Excellent |
| Performance | Good | Good | Excellent | Excellent | Moderate |
| Resource Usage | Moderate | Moderate | Low | Low | High |
| Learning Curve | Moderate | Low | High | Low-Moderate | Moderate |
| Cost | Free | Free | Free | Paid | Paid |
| Remote Development | Yes | No | Yes | Limited | Yes |
| Customization | Extensive | Limited | Extensive | Extensive | Extensive |

### 2.3.3 Setting Up Multiple Editors

Many professionals use multiple editors for different scenarios:

- **VS Code**: Primary development environment
- **Vim**: Quick edits on remote servers or in terminal sessions
- **PowerShell ISE**: When maintaining legacy Windows PowerShell scripts

This multi-editor approach provides flexibility while leveraging the strengths of each tool.

## 2.4 Installing and Configuring the PowerShell Extension for VS Code

VS Code does not include PowerShell support out of the box. You must install the official extension, which provides rich editing features specifically designed for PowerShell.

### 2.4.1 Installing the Extension

#### 2.4.1.1 Via VS Code Interface

1. Open VS Code
2. Go to **Extensions** (Ctrl+Shift+X)
3. Search for `PowerShell`
4. Find the one published by **Microsoft** (Publisher ID: `ms-vscode.PowerShell`)
5. Click **Install**

#### 2.4.1.2 Via Command Line

From terminal or VS Code command palette:
```bash
code --install-extension ms-vscode.PowerShell
```

#### 2.4.1.3 Manual Installation

If behind a corporate proxy:
1. Download VSIX from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell)
2. In VS Code: Extensions → ... → Install from VSIX
3. Select the downloaded file

### 2.4.2 Confirming the Extension Is Active

After installation, open a `.ps1` file or create a new one (`test.ps1`).

The bottom status bar should display:

```
PowerShell [Running] | pwsh
```

Hover over it to see version details.

If it shows `powershell.exe`, click it and select `pwsh` from the list to ensure you're using PowerShell 7.

To verify the extension is functioning:
1. Create a new file `test.ps1`
2. Type `Get-Proc` and press Ctrl+Space
3. Should show `Get-Process` in completion list
4. Hover over `Get-Process` to see documentation
5. Press F8 on a line to execute it

### 2.4.3 Extension Configuration

The PowerShell extension has numerous configuration options accessible via:
- Settings UI: Ctrl+, → search "powershell"
- settings.json: Ctrl+Shift+P → "Preferences: Open Settings (JSON)"

#### 2.4.3.1 Essential Settings

```json
{
    "powershell.powerShellDefaultVersion": "PowerShell 7 (x64)",
    "powershell.integratedConsole.showOnStartup": true,
    "powershell.integratedConsole.focusConsoleOnExecute": true,
    "powershell.enableProfileLoading": true,
    "powershell.scriptAnalysis.enable": true,
    "powershell.codeFormatting.autoCorrectAliases": true,
    "powershell.codeFormatting.useConstantParameterStatus": true,
    "powershell.codeFormatting.newLineAfterCloseBrace": true,
    "powershell.codeFormatting.preset": "OTBS",
    "powershell.codeFormatting.openBraceOnSameLine": true,
    "powershell.codeFormatting.newLineAfterOpenBrace": false,
    "powershell.codeFormatting.whitespaceBetweenParameters": true,
    "powershell.codeFormatting.trimWhitespaceAroundPipe": true,
    "powershell.powerShellExePath": "C:\\Program Files\\PowerShell\\7\\pwsh.exe"
}
```

#### 2.4.3.2 Advanced Settings for Large Projects

```json
{
    "powershell.developer.featureFlags": [
        "PSReadLine"
    ],
    "powershell.debugging.createTemporaryIntegratedConsole": true,
    "powershell.developer.editorServicesLogLevel": "Diagnostic",
    "powershell.powerShellAdditionalExePaths": [
        {
            "exePath": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
            "versionName": "PowerShell 7 (x64)"
        },
        {
            "exePath": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
            "versionName": "Windows PowerShell"
        }
    ]
}
```

### 2.4.4 Enabling Script Analysis (PSScriptAnalyzer)

The PowerShell extension includes **PSScriptAnalyzer**, a static analysis tool that flags potential issues.

By default, it runs automatically on `.ps1` files.

Example warning:
```powershell
Write-Host "Hello" -foregroundcolor "red"
```
→ Flags `-foregroundcolor`: Should be lowercase `-ForegroundColor`

#### 2.4.4.1 Customizing Rules

Create a `.vscode\settings.json` file in your project root:

```json
{
    "powershell.scriptAnalysis.enable": true,
    "powershell.scriptAnalysis.settingsPath": "./ScriptAnalyzerSettings.psd1"
}
```

Then create `ScriptAnalyzerSettings.psd1`:

```powershell
@{
    Severity = @('Error', 'Warning')
    IncludeRules = @(
        'PSUseApprovedVerbs',
        'PSAvoidUsingCmdletAliases',
        'PSUseToExportFieldsInManifest',
        'PSAvoidGlobalVars',
        'PSUsePSCredentialType'
    )
    ExcludeRules = @(
        'PSUseSingularNouns',
        'PSAvoidUsingPlainTextForPassword'
    )
    # Rule-specific configuration
    'PSAvoidUsingCmdletAliases' = @{
        Whitelist = @('ft', 'Select-Object')
    }
    'PSUseApprovedVerbs' = @{
        Whitelist = @('Serve')
    }
}
```

This enforces best practices while allowing exceptions for specific scenarios.

#### 2.4.4.2 Rule Categories

PSScriptAnalyzer rules fall into these categories:

- **Style**: Code formatting and conventions
- **Security**: Potential security issues
- **Potential Bugs**: Code that might not work as expected
- **Code Smell**: Suboptimal code patterns
- **Best Practice**: Recommended practices

You can configure different severity levels for each category.

## 2.5 Configuring Your Editing Experience

Now that the extension is installed, let's optimize the editor for PowerShell with detailed configuration options.

### 2.5.1 Enabling IntelliSense

IntelliSense provides auto-completion for cmdlets, parameters, variables, and .NET members.

#### 2.5.1.1 How IntelliSense Works

The PowerShell extension provides:
- **Command completion**: Type `Get-Proc` → `Get-Process`
- **Parameter completion**: After `-` in a cmdlet
- **Parameter value completion**: For enum values
- **Variable completion**: For defined variables
- **.NET member completion**: After `$obj.`
- **Help tooltips**: Hover for documentation

#### 2.5.1.2 Configuration Options

```json
{
    "editor.quickSuggestions": {
        "other": true,
        "comments": false,
        "strings": false
    },
    "editor.suggest.snippetsPreventQuickSuggestions": false,
    "powershell.intellisense": "Computer",
    "powershell.editorServicesWaitForDebugger": false,
    "powershell.integratedConsole.focusConsoleOnExecute": true
}
```

#### 2.5.1.3 Advanced IntelliSense Features

- **Command discovery**: Type `gcm *process*` to find commands
- **Parameter discovery**: Type `Get-Process -<Tab>`
- **.NET type discovery**: Type `[System.<Tab>]`
- **Module discovery**: Type `Import-Module <Tab>`

### 2.5.2 Syntax Highlighting and Formatting

The PowerShell extension enables syntax coloring by default with extensive customization options.

#### 2.5.2.1 Format On Save

Add to your user or workspace settings:
```json
{
    "editor.formatOnSave": true,
    "powershell.codeFormatting.autoCorrectAliases": true,
    "powershell.codeFormatting.useConstantParameterStatus": true,
    "powershell.codeFormatting.newLineAfterCloseBrace": true,
    "powershell.codeFormatting.preset": "OTBS",
    "powershell.codeFormatting.openBraceOnSameLine": true,
    "powershell.codeFormatting.newLineAfterOpenBrace": false,
    "powershell.codeFormatting.whitespaceBetweenParameters": true,
    "powershell.codeFormatting.trimWhitespaceAroundPipe": true
}
```

This configuration:
- Replaces aliases like `cd` with `Set-Location`
- Ensures consistent spacing around operators
- Formats braces according to OTBS (One True Brace Style)
- Adds whitespace between parameters for readability
- Trims unnecessary whitespace around pipes

#### 2.5.2.2 Manual Formatting

- Select code and press `Shift+Alt+F`
- Use command palette: `PowerShell: Format Document`
- Format selection: `PowerShell: Format Selection`

#### 2.5.2.3 Custom Formatting Rules

Create a `.vscode\powershell.json` file:

```json
{
    "powershell.codeFormatting.preset": "Custom",
    "powershell.codeFormatting.openBraceOnSameLine": true,
    "powershell.codeFormatting.newLineAfterOpenBrace": false,
    "powershell.codeFormatting.newLineAfterCloseBrace": true,
    "powershell.codeFormatting.whitespaceBeforeOpenBrace": true,
    "powershell.codeFormatting.whitespaceBeforeOpenParen": true,
    "powershell.codeFormatting.whitespaceAroundOperator": true,
    "powershell.codeFormatting.whitespaceAfterSeparator": true,
    "powershell.codeFormatting.trimWhitespaceAroundPipe": true,
    "powershell.codeFormatting.whitespaceAfterPipe": true,
    "powershell.codeFormatting.ignoreOneLineBlock": true,
    "powershell.codeFormatting.alignPropertyValuePairs": true,
    "powershell.codeFormatting.useCorrectCasing": true
}
```

This provides granular control over every aspect of code formatting.

### 2.5.3 Integrated Console

One of VS Code's most powerful features is the **integrated terminal**.

#### 2.5.3.1 Configuration Options

```json
{
    "powershell.integratedConsole.showOnStartup": true,
    "powershell.integratedConsole.focusConsoleOnExecute": true,
    "powershell.integratedConsole.useLegacyReadLine": false,
    "terminal.integrated.defaultProfile.windows": "PowerShell",
    "terminal.integrated.profiles.windows": {
        "PowerShell": {
            "source": "PowerShell",
            "icon": "terminal-powershell",
            "args": []
        }
    }
}
```

#### 2.5.3.2 Using the Integrated Console

Press `` Ctrl+` `` to open it.

By default, it launches the system shell (CMD or Bash), but you can change it:

1. Click the dropdown arrow next to `+`
2. Select `pwsh` from the list

Now all commands execute in PowerShell 7.

You can:
- Run selected lines with `F8`
- Debug scripts interactively
- Test snippets without leaving the editor
- View command output alongside your code

#### 2.5.3.3 Advanced Console Features

- **Command history**: Up/down arrows
- **Tab completion**: Press Tab for suggestions
- **Prediction**: PowerShell 7.2+ shows command predictions
- **Custom prompts**: Configure in your profile
- **Multiple consoles**: Split terminal with `` Alt+Shift+5 ``

### 2.5.4 Snippets and Code Templates

The PowerShell extension includes code snippets to accelerate development.

#### 2.5.4.1 Built-in Snippets

Type these prefixes and press Tab:
- `fun` → Function template
- `param` → Parameter block
- `begin` → Begin block
- `process` → Process block
- `end` → End block
- `class` → Class definition
- `enum` → Enum definition
- `try` → Try/catch block

#### 2.5.4.2 Creating Custom Snippets

1. Ctrl+Shift+P → "Preferences: Configure User Snippets"
2. Select "powershell.json"
3. Add custom snippets:

```json
{
    "Advanced Function Template": {
        "prefix": "advfun",
        "body": [
            "function ${1:Verb}-${2:Noun} {",
            "    [CmdletBinding()]",
            "    param (",
            "        [Parameter(Mandatory = $true)]",
            "        [string]$${3:Parameter}",
            "    )",
            "",
            "    begin {",
            "        Write-Verbose 'Starting ${1:Verb}-${2:Noun}'",
            "    }",
            "",
            "    process {",
            "        try {",
            "            # Process logic here",
            "        }",
            "        catch {",
            "            Write-Error $_",
            "        }",
            "    }",
            "",
            "    end {",
            "        Write-Verbose 'Completed ${1:Verb}-${2:Noun}'",
            "    }",
            "}"
        ],
        "description": "Advanced function template"
    }
}
```

## 2.6 Debugging PowerShell Scripts in VS Code

Debugging transforms PowerShell from a scripting tool into a full development environment. Proper debugging capabilities are essential for developing complex scripts and modules.

### 2.6.1 Setting Breakpoints

#### 2.6.1.1 Basic Breakpoints

Click in the left margin next to a line number to set a breakpoint (red dot).

Or press `F9` with the cursor on a line.

Example script (`debug-test.ps1`):
```powershell
$name = Read-Host "Enter your name"
$greeting = "Hello, $name!"
Write-Output $greeting
```

Set a breakpoint on line 2.

Press `F5` to start debugging.

Execution pauses before assigning `$greeting`. Hover over variables to inspect values.

#### 2.6.1.2 Conditional Breakpoints

Right-click the breakpoint and select "Edit Breakpoint" to add conditions:

- **Expression**: Break when condition is true
  ```powershell
  $name -eq 'admin'
  ```
- **Hit Count**: Break after X executions
- **Action**: Run a command when breakpoint hits

#### 2.6.1.3 Function Breakpoints

Set breakpoints on function entry:
1. Ctrl+Shift+D to open Debug view
2. Click "+ Add Configuration"
3. Select "PowerShell: Add Function Breakpoint"
4. Enter function name

### 2.6.2 Launch Configuration

First time debugging, VS Code prompts you to select an environment. Choose **PowerShell**.

It creates `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "PowerShell",
            "request": "launch",
            "name": "PowerShell Launch Current File",
            "script": "${file}",
            "args": [],
            "cwd": "${fileDirname}",
            "createTemporaryIntegratedConsole": true
        },
        {
            "type": "PowerShell",
            "request": "launch",
            "name": "PowerShell Launch Current File w/Args Prompt",
            "script": "${file}",
            "args": [
                "${command:AskForParamArgs}"
            ],
            "cwd": "${fileDirname}"
        }
    ]
}
```

#### 2.6.2.1 Advanced Configuration Options

```json
{
    "type": "PowerShell",
    "request": "launch",
    "name": "Debug with Parameters",
    "script": "${file}",
    "args": [
        "-Parameter1", "Value1",
        "-Parameter2", "Value2"
    ],
    "cwd": "${workspaceFolder}",
    "createTemporaryIntegratedConsole": true,
    "powerShellExePath": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
    "stopOnEntry": true,
    "internalConsoleOptions": "neverOpen"
}
```

#### 2.6.2.2 Debugging Specific Scenarios

**Debugging a module:**
```json
{
    "name": "Debug Module",
    "type": "PowerShell",
    "request": "launch",
    "script": "Import-Module MyModule",
    "cwd": "${workspaceFolder}"
}
```

**Debugging with elevated privileges:**
```json
{
    "name": "Run as Administrator",
    "type": "PowerShell",
    "request": "launch",
    "script": "${file}",
    "runAsAdmin": true
}
```

**Debugging a background job:**
```json
{
    "name": "Debug Job",
    "type": "PowerShell",
    "request": "attach",
    "processId": "${command:PickPSHostProcess}"
}
```

### 2.6.3 Debug Actions

While paused:
- `F5`: Continue
- `F10`: Step Over
- `F11`: Step Into
- `Shift+F11`: Step Out
- `Ctrl+Shift+F5`: Restart
- `Shift+F5`: Stop

#### 2.6.3.1 Debugging Tools

VS Code provides several panels to help with debugging:

**Variables Panel**:
- Shows all variables in current scope
- Expand objects to see properties
- Right-click to add to Watch

**Watch Panel**:
- Add specific variables to monitor
- Evaluate expressions
- Track changes across steps

**Call Stack Panel**:
- Shows function call hierarchy
- Click to navigate to specific frame
- View parameters for each frame

**Breakpoints Panel**:
- Manage all breakpoints
- Enable/disable individually
- View conditions and hit counts

#### 2.6.3.2 Advanced Debugging Techniques

**Remote Debugging**:
1. On target machine:
   ```powershell
   $session = New-PSSession -HostName remotehost -UserName user
   Enter-PSSession $session
   Enable-PSRemoting
   ```
2. In VS Code:
   ```json
   {
       "name": "Attach to Remote",
       "type": "PowerShell",
       "request": "attach",
       "runspaceId": 1,
       "hostName": "remotehost",
       "port": 5985,
       "userName": "user"
   }
   ```

**Debugging Background Jobs**:
1. Start job:
   ```powershell
   Start-Job -ScriptBlock { 1..10 | ForEach-Object { Start-Sleep 1; $_ } }
   ```
2. Attach debugger:
   ```json
   {
       "name": "Attach to Job",
       "type": "PowerShell",
       "request": "attach",
       "processId": "${command:PickPSHostProcess}"
   }
   ```

## 2.7 Creating and Managing PowerShell Profiles

A **profile** is a script that runs every time PowerShell starts. It allows you to customize your environment with aliases, functions, module imports, and other customizations.

### 2.7.1 Profile Paths

PowerShell supports multiple profile paths with different scopes:

| Scope | Path |
|------|------|
| Current User, Current Host | `$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1` |
| All Users, Current Host | `$PSHOME\Microsoft.PowerShell_profile.ps1` |
| Current User, All Hosts | `$HOME\Documents\PowerShell\Profile.ps1` |
| All Users, All Hosts | `$PSHOME\Profile.ps1` |
| Current User, VS Code Host | `$HOME\Documents\PowerShell\Microsoft.VSCode_profile.ps1` |
| Current User, PowerShell Core Host | `$HOME\Documents\PowerShell\PowerShell_profile.ps1` |

For most users, use **Current User, Current Host**.

Check your active profile path:
```powershell
$PROFILE | Format-List * -Force
```

This shows all possible profile paths and whether they exist.

### 2.7.2 Creating Your Profile

If the profile doesn't exist:
```powershell
if (!(Test-Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}
```

Open it:
```powershell
notepad $PROFILE
```

Or in VS Code:
```powershell
code $PROFILE
```

### 2.7.3 Profile Loading Order

When PowerShell starts, it loads profiles in this order:
1. All Users, All Hosts
2. All Users, Current Host
3. Current User, All Hosts
4. Current User, Current Host

This allows for layered configuration:
- Enterprise-wide settings in All Users profiles
- Host-specific settings in Current Host profiles
- Personal preferences in Current User profiles

### 2.7.4 Sample Profile Content

Here's a comprehensive example with explanations:

```powershell
#region Initialization
# Set execution policy for the session
if ((Get-ExecutionPolicy) -ne 'Bypass') {
    Set-ExecutionPolicy Bypass -Scope Process -Force
}

# Configure error handling
$ErrorActionPreference = 'Continue'
$WarningPreference = 'Continue'
$VerbosePreference = 'SilentlyContinue'

# Configure console appearance
$Host.PrivateData.ErrorForegroundColor = 'Red'
$Host.PrivateData.WarningForegroundColor = 'Yellow'
$Host.PrivateData.VerboseForegroundColor = 'Cyan'
#endregion

#region Module Management
# Auto-import frequently used modules
$modulesToImport = @(
    'PSReadLine',
    'Pester',
    'Az.Accounts',
    'ActiveDirectory'
)

foreach ($module in $modulesToImport) {
    if (Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue) {
        Import-Module $module -ErrorAction SilentlyContinue
    }
}

# Configure module auto-loading
$env:PSModulePath = $env:PSModulePath + 
    ";$HOME\Documents\PowerShell\Modules;" +
    "$HOME\.local\share\powershell\Modules"

# Set module update policy
if (Get-Command Update-Module -ErrorAction SilentlyContinue) {
    Update-Module -Name $modulesToImport -ErrorAction SilentlyContinue -Force
}
#endregion

#region Aliases and Shortcuts
# Common aliases
Set-Alias ll Get-ChildItem
Set-Alias gcm Get-Command
Set-Alias gci Get-ChildItem
Set-Alias grep Select-String
Set-Alias df Get-PSDrive

# Directory navigation shortcuts
function .. { Set-Location .. }
function ... { Set-Location ../.. }
function .... { Set-Location ../../.. }

# Quick access to profile
function Edit-Profile {
    code $PROFILE
}
#endregion

#region PSReadLine Configuration
# Configure history
Set-PSReadLineOption -HistorySavePath "$env:APPDATA\PowerShell\PSReadLineHistory.txt"
Set-PSReadLineOption -HistorySaveStyle SaveIncrementally
Set-PSReadLineOption -MaximumHistoryCount 4000

# Configure editing mode (Windows: Windows, Linux/macOS: Emacs)
Set-PSReadLineOption -EditMode Windows

# Configure prediction (PowerShell 7.2+)
if ($PSVersionTable.PSVersion -ge [version]'7.2.0') {
    Set-PSReadLineOption -PredictionSource History
    Set-PSReadLineOption -Colors @{
        "Prediction" = [ConsoleColor]::DarkGray
    }
}

# Key bindings
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
Set-PSReadLineKeyHandler -Key Ctrl+d -Function DeleteChar
#endregion

#region Custom Functions
# List available commands with examples
function Get-CommandWithExamples {
    param(
        [string]$Name = '*'
    )
    Get-Command $Name | ForEach-Object {
        $command = $_
        $help = Get-Help $command.Name -Examples -ErrorAction SilentlyContinue
        if ($help) {
            [PSCustomObject]@{
                Command = $command.Name
                Examples = $help.Examples | Out-String
            }
        }
    }
}

# Search help content
function Find-Help {
    param(
        [string]$Keyword
    )
    Get-Help * | Where-Object { $_.Name -match $Keyword -or $_.Synopsis -match $Keyword }
}
#endregion

#region Startup Messages
# Display PowerShell version
Write-Host "PowerShell $($PSVersionTable.PSVersion.ToString())" -ForegroundColor Green

# Show working directory
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Show available modules
$loadedModules = Get-Module | Where-Object { $_.Name -in $modulesToImport }
if ($loadedModules) {
    Write-Host "Loaded modules:" -ForegroundColor Yellow
    $loadedModules | Format-Table Name, Version
}
#endregion

#region Environment Variables
# Add custom paths
$env:Path += ";C:\Tools;C:\Dev\bin"

# Set environment-specific variables
if ($IsWindows) {
    $env:EDITOR = 'code'
}
elseif ($IsLinux) {
    $env:EDITOR = 'vim'
}
elseif ($IsMacOS) {
    $env:EDITOR = 'code'
}
#endregion

#region Prompt Configuration
function prompt {
    # Show current directory
    $path = (Get-Location).Path
    
    # Add Git status if in repository
    $gitStatus = $null
    if (Test-Path .git) {
        $gitStatus = git status --porcelain 2>$null
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($gitStatus) {
            $path += " ($branch*)"
        }
        else {
            $path += " ($branch)"
        }
    }
    
    # Show execution time for last command
    $lastCommand = Get-History -Count 1
    if ($lastCommand -and $lastCommand.Duration) {
        $duration = $lastCommand.Duration.ToString("m'm 's's'")
        $path += " [$duration]"
    }
    
    # Return formatted prompt
    "$path> "
}
#endregion
```

### 2.7.5 Managing Multiple Profiles

For complex environments, consider these strategies:

#### 2.7.5.1 Modular Profiles

Break your profile into separate files:

```
Documents\PowerShell\
├── profile.ps1
├── modules.ps1
├── aliases.ps1
├── functions.ps1
└── prompt.ps1
```

Then in `profile.ps1`:
```powershell
$profileDir = Split-Path $PROFILE
. "$profileDir\modules.ps1"
. "$profileDir\aliases.ps1"
. "$profileDir\functions.ps1"
. "$profileDir\prompt.ps1"
```

#### 2.7.5.2 Environment-Specific Profiles

Create profiles for different scenarios:

- `dev-profile.ps1` - Development environment
- `admin-profile.ps1` - Administrative tasks
- `cloud-profile.ps1` - Cloud management

Then load as needed:
```powershell
. $HOME\Documents\PowerShell\cloud-profile.ps1
```

#### 2.7.5.3 Host-Specific Configuration

Check the host application:
```powershell
if ($host.Name -eq 'ConsoleHost') {
    # Console-specific settings
}
elseif ($host.Name -eq 'Visual Studio Code Host') {
    # VS Code-specific settings
}
```

## 2.8 Customizing the Prompt

The default prompt is basic. You can make it more informative and visually appealing with various customization options.

### 2.8.1 Basic Prompt Function

As shown in the profile example, define a `prompt` function:

```powershell
function prompt {
    $time = Get-Date -Format "HH:mm"
    $path = (Get-Location).Path.Replace($HOME, "~")
    "[$time] $path`n> "
}
```

Result:
```
[14:23] ~\Documents
>
```

### 2.8.2 Advanced Prompt with Git Integration

Install `posh-git`:
```powershell
Install-Module posh-git -Scope CurrentUser
```

Add to profile:
```powershell
Import-Module posh-git
$GitPromptSettings.DefaultPromptPrefix.Text = '$(Get-Date -Format "HH:mm") '
$GitPromptSettings.DefaultPromptSuffix.Text = "`n> "
$GitPromptSettings.BranchColor = [ConsoleColor]::Green
$GitPromptSettings.BeforeStatus.Text = ' ['
$GitPromptSettings.AfterStatus.Text = '] '
```

Now your prompt shows branch name and status when in a Git repo.

### 2.8.3 Modern Prompts: Oh My Posh

For even richer customization, use **Oh My Posh**.

#### 2.8.3.1 Installation

Install:
```powershell
# Windows
winget install JanDeDobbeleer.OhMyPosh -s winget

# macOS
brew install oh-my-posh

# Linux
sudo wget https://github.com/JanDeDobbeleer/oh-my-posh/releases/latest/download/posh-linux-amd64 -O /usr/local/bin/oh-my-posh
sudo chmod +x /usr/local/bin/oh-my-posh
```

#### 2.8.3.2 Configuration

Create a custom theme or use presets.

Basic setup:
```powershell
oh-my-posh init pwsh | Invoke-Expression
```

For custom configuration:
```powershell
oh-my-posh init pwsh --config "$env:USERPROFILE\.mytheme.omp.json" | Invoke-Expression
```

Sample theme configuration (`~/.mytheme.omp.json`):
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "session",
          "style": "powerline",
          "powerline_symbol": "",
          "foreground": "#100e23",
          "background": "#fffb38"
        },
        {
          "type": "path",
          "style": "powerline",
          "powerline_symbol": "",
          "foreground": "#ffffff",
          "background": "#01d277",
          "properties": {
            "prefix": " ",
            "style": "mixed"
          }
        },
        {
          "type": "git",
          "style": "powerline",
          "powerline_symbol": "",
          "foreground": "#100e23",
          "background": "#f1e05a",
          "properties": {
            "display_status": true,
            "display_stash_count": true,
            "display_upstream_icon": true
          }
        }
      ]
    }
  ]
}
```

#### 2.8.3.3 Advanced Oh My Posh Features

- **Multiple segments**: Time, user, host, directory, Git status, AWS profile, etc.
- **Conditional segments**: Show only when relevant
- **Custom icons**: Use Nerd Fonts for special characters
- **Dynamic background**: Change based on success/failure
- **Right prompt**: Secondary information on right side

Example of a comprehensive prompt configuration:

```powershell
oh-my-posh --init --shell pwsh --config ~/.mytheme.omp.json | Invoke-Expression
```

With this configuration, your prompt will display:
- Current time
- User and host information
- Current directory (with home directory shortened)
- Git branch and status indicators
- Exit code of last command
- Background color changes based on success/failure

### 2.8.4 Starship Prompt

An alternative to Oh My Posh is **Starship**, written in Rust with extensive customization.

#### 2.8.4.1 Installation

```powershell
# Windows
scoop install starship

# macOS
brew install starship

# Linux
curl -fsSL https://starship.rs/install.sh | bash
```

#### 2.8.4.2 Configuration

Create `~/.config/starship.toml`:

```toml
# Don't print a new line at the start of the prompt
add_newline = false

# Replace the "❯" symbol in the prompt
[character]                            # The name of the module we are configuring is "character"
success_symbol = "[➜](bold green)"    # The "success_symbol" segment is being set to "➜" with the color "bold green"
error_symbol = "[✗](bold red)"        # The "error_symbol" segment is being set to "✗" with the color "bold red"

[directory]
truncation_length = 8
truncate_to_repo = true
format = "[$path]($style)[$read_only]($read_only_style) "

[git_branch]
format = 'on [$symbol$branch]($style) '
symbol = " "

[git_status]
format = '[\($all_status$ahead_behind\)]($style) '
conflicted = "🏳"
ahead = "⇡${count}"
diverged = "⇕⇡${ahead_count}⇣${behind_count}"
behind = "⇣${count}"
stashed = "📦"
```

Then add to profile:
```powershell
Invoke-Expression (&starship init powershell)
```

## 2.9 Managing Modules with PowerShellGet

PowerShell's functionality comes from **modules** — reusable packages of commands. You manage them using **PowerShellGet** and the **PowerShell Gallery**.

### 2.9.1 What Is PowerShellGet?

`PowerShellGet` is the package manager for PowerShell modules. It allows you to:
- Find modules: `Find-Module`
- Install modules: `Install-Module`
- Update modules: `Update-Module`
- Remove modules: `Uninstall-Module`
- Publish modules: `Publish-Module`

It connects to the **PowerShell Gallery** ([www.powershellgallery.com](https://www.powershellgallery.com)), the official public repository.

#### 2.9.1.1 PowerShellGet Versions

PowerShellGet comes in different versions:
- PowerShellGet 1.0: Included with Windows PowerShell 5.1
- PowerShellGet 2.0+: Available as a module for PowerShell 5.1 and PowerShell 7

Check your version:
```powershell
Get-Module PowerShellGet -ListAvailable | Select-Object Name, Version
```

Update to latest:
```powershell
Install-Module PowerShellGet -Force -AllowClobber
```

### 2.9.2 Installing a Module

Example: Install the `Az` module for Azure management:

```powershell
Install-Module -Name Az -Scope CurrentUser
```

Flags:
- `-Name`: Module name
- `-Scope`: Installation scope (`CurrentUser` or `AllUsers`)
- `-Force`: Skip confirmation prompts
- `-AllowClobber`: Allow cmdlet name conflicts
- `-SkipPublisherCheck`: Bypass digital signature warnings (not recommended)
- `-Repository`: Specify repository (default: PSGallery)
- `-RequiredVersion`: Install specific version
- `-MinimumVersion`: Minimum acceptable version

After installation:
```powershell
Import-Module Az
Connect-AzAccount
```

#### 2.9.2.1 Installing Specific Versions

```powershell
# Install specific version
Install-Module -Name Az -RequiredVersion 10.0.0 -Scope CurrentUser

# Install minimum version
Install-Module -Name Az -MinimumVersion 9.5.0 -Scope CurrentUser
```

#### 2.9.2.2 Installing Pre-release Versions

```powershell
Install-Module -Name Pester -AllowPrerelease -Scope CurrentUser
```

#### 2.9.2.3 Installing from Alternative Repositories

```powershell
# Register private repository
Register-PSRepository -Name MyRepo -SourceLocation "https://myrepo.example.com/api/v2" -InstallationPolicy Trusted

# Install from private repository
Install-Module -Name InternalModule -Repository MyRepo
```

### 2.9.3 Listing Installed Modules

```powershell
Get-InstalledModule
```

Filter:
```powershell
Get-InstalledModule -Name Az*
```

See file locations:
```powershell
(Get-Module -ListAvailable Az).ModuleBase
```

#### 2.9.3.1 Detailed Module Information

```powershell
Get-InstalledModule | Format-List Name, Version, Repository, Description, InstalledDate
```

#### 2.9.3.2 Finding Commands from a Module

```powershell
Get-Command -Module Az.Accounts
```

### 2.9.4 Updating Modules

Regularly update modules:
```powershell
Update-Module -Name Az -Force
```

Or update all:
```powershell
Get-InstalledModule | Update-Module -Force
```

#### 2.9.4.1 Update Strategies

**Conservative approach** (recommended for production):
```powershell
# Only update if newer version exists
Get-InstalledModule | Where-Object {
    (Find-Module -Name $_.Name).Version -gt $_.Version
} | Update-Module -Force
```

**Selective update**:
```powershell
# Update only critical modules
"PSReadLine", "Pester", "PowerShellGet" | ForEach-Object {
    Update-Module -Name $_ -Force
}
```

**Dry run** (check what would update):
```powershell
Get-InstalledModule | Update-Module -WhatIf
```

#### 2.9.4.2 Handling Breaking Changes

Before updating critical modules:
1. Check release notes:
   ```powershell
   (Find-Module Az).Description
   ```
2. Test in non-production environment
3. Use version pinning in production:
   ```powershell
   Install-Module -Name Az -RequiredVersion 10.0.0
   ```

### 2.9.5 Module Auto-Loading

PowerShell automatically imports modules when you call a cmdlet they provide.

Example:
```powershell
Get-AzVm
```
→ If `Az.Compute` isn't loaded, PowerShell loads it automatically.

This reduces startup time and simplifies usage.

#### 2.9.5.1 Controlling Auto-Loading

Disable auto-loading:
```powershell
$PSModuleAutoLoadingPreference = 'None'
```

Restore default behavior:
```powershell
$PSModuleAutoLoadingPreference = 'All'
```

#### 2.9.5.2 Module Manifest Configuration

In a module manifest (.psd1), you can control auto-loading:
```powershell
# Only auto-load when specific cmdlets are called
RequiredModules = @(
    @{ 
        ModuleName = 'Az.Accounts'; 
        ModuleVersion = '2.8.0'; 
        Guid = '8c17c70d-411f-46c5-87b1-6fac9b6a0019' 
    }
)
```

### 2.9.6 Alternative Module Installation Methods

#### 2.9.6.1 Manual Installation

For modules not in the Gallery:

1. Download ZIP from source (GitHub, etc.)
2. Extract to module path:
   ```powershell
   $modulePath = "$HOME\Documents\PowerShell\Modules"
   Expand-Archive -Path .\Module.zip -DestinationPath $modulePath
   ```
3. Verify:
   ```powershell
   Get-Module -ListAvailable -Name ModuleName
   ```

#### 2.9.6.2 GitHub Installation

Install directly from GitHub:
```powershell
Install-Module -Name PowerShellGet -Force
Install-Script -Name Install-ModuleFromGitHub -Force
Install-ModuleFromGitHub -Repository PowerShell/PSReadLine
```

#### 2.9.6.3 Using PackageManagement

Alternative to PowerShellGet:
```powershell
# Find modules
Find-Package -ProviderName PowerShellGet -Source https://www.powershellgallery.com/api/v2 -Name Az

# Install module
Install-Package -Name Az -ProviderName PowerShellGet -Source https://www.powershellgallery.com/api/v2
```

### 2.9.7 Module Signing and Security

#### 2.9.7.1 Understanding Module Signing

PowerShell modules can be digitally signed to verify:
- Origin (who created it)
- Integrity (has it been modified)

#### 2.9.7.2 Checking Module Signature

```powershell
Get-AuthenticodeSignature -FilePath C:\Path\To\Module.psm1
```

#### 2.9.7.3 Configuring Execution Policy for Modules

```powershell
# Allow signed remote scripts
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Allow all local scripts, signed remote scripts
Set-ExecutionPolicy RemoteSigned
```

#### 2.9.7.4 Creating a Trusted Repository

```powershell
# Register repository as trusted
Register-PSRepository -Name PSGallery -InstallationPolicy Trusted

# Verify
Get-PSRepository
```

## 2.10 Common Setup Issues and Troubleshooting

Even with careful planning, issues arise. Here are common problems and solutions with detailed diagnostic procedures.

### 2.10.1 Issue: Execution Policy Prevents Module Installation

Error:
```
PackageManagement\Install-Package : The module requires scripts to be signed.
```

#### 2.10.1.1 Diagnosis

Check current execution policy:
```powershell
Get-ExecutionPolicy -List
```

#### 2.10.1.2 Solution

Set appropriate policy:
```powershell
# For current user (no admin rights needed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# For all users (requires admin)
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine
```

#### 2.10.1.3 Understanding Execution Policy Scopes

| Scope | Description | Requires Admin |
|-------|-------------|----------------|
| Process | Current session only | No |
| CurrentUser | Current user only | No |
| LocalMachine | All users on machine | Yes |
| MachinePolicy | Group Policy setting | No (set by admin) |
| UserPolicy | Group Policy setting | No (set by admin) |

#### 2.10.1.4 Temporary Bypass

For one-time execution:
```powershell
pwsh -ExecutionPolicy Bypass -File .\install-modules.ps1
```

### 2.10.2 Issue: VS Code Uses Wrong PowerShell Version

Symptom: Status bar shows `powershell.exe` instead of `pwsh`.

#### 2.10.2.1 Diagnosis

Check which PowerShell is running:
```powershell
$PSVersionTable.PSVersion
$PSVersionTable.PSEdition
```

#### 2.10.2.2 Solution

1. Click the PowerShell version in the bottom bar
2. Select `Enter a path...`
3. Enter the path to `pwsh.exe`:
   - Windows: `C:\Program Files\PowerShell\7\pwsh.exe`
   - macOS: `/usr/local/microsoft/powershell/7/pwsh`
   - Linux: `/opt/microsoft/powershell/7/pwsh`

Alternatively, configure in `settings.json`:
```json
{
    "powershell.powerShellDefaultVersion": "PowerShell 7 (x64)",
    "powershell.powerShellAdditionalExePaths": [
        {
            "exePath": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
            "versionName": "PowerShell 7 (x64)"
        }
    ]
}
```

#### 2.10.2.3 Verifying the Fix

Restart VS Code and check:
```powershell
$PSVersionTable.PSVersion
```
Should show 7.x version.

### 2.10.3 Issue: Certificate Trust Failure During Module Install

Error:
```
The underlying connection was closed: Could not establish trust relationship for the SSL/TLS secure channel.
```

#### 2.10.3.1 Diagnosis

This typically occurs in corporate environments with:
- SSL inspection
- Custom root certificates
- Network security appliances

#### 2.10.3.2 Solutions

**Preferred solution: Install corporate root certificate**
1. Obtain root CA certificate from IT
2. Install in Trusted Root Certification Authorities store

**Temporary workaround:**
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

**More robust workaround:**
```powershell
# Create a trust-all certificate policy
class TrustAllCertsPolicy : System.Net.ICertificatePolicy {
    [bool] CheckValidationResult([System.Net.ServicePoint] $srvPoint, [System.Security.Cryptography.X509Certificates.X509Certificate] $certificate, [System.Net.WebRequest] $request, [int] $certificateProblem) {
        return $true
    }
}

[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
```

**Permanent solution for corporate environments:**
```powershell
# Configure PowerShell to use system certificate store
Install-PackageProvider -Name NuGet -Force
Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
```

### 2.10.4 Issue: Profile Not Loading in VS Code

Symptom: Functions or aliases defined in profile are missing in integrated console.

#### 2.10.4.1 Diagnosis

By default, VS Code does not load the PowerShell profile.

Check if profile loading is enabled:
```powershell
$profileLoaded = $false
if (Test-Path $PROFILE) {
    $profileLoaded = $true
}
$profileLoaded
```

#### 2.10.4.2 Solution

In `settings.json`:
```json
{
    "powershell.integratedConsole.showOnStartup": true,
    "powershell.enableProfileLoading": true
}
```

#### 2.10.4.3 Verifying Profile Loading

Add diagnostic output to your profile:
```powershell
Write-Host "Profile loaded at $(Get-Date)" -ForegroundColor Cyan
```

Restart VS Code and check if message appears.

#### 2.10.4.4 Selective Profile Loading

For environments where full profile loading is problematic:
```json
{
    "powershell.enableProfileLoading": true,
    "powershell.profile": "C:\\Users\\username\\Documents\\PowerShell\\VSCode_profile.ps1"
}
```

Create a minimal profile specifically for VS Code.

### 2.10.5 Issue: Slow Startup Times

Symptom: PowerShell takes several seconds to start.

#### 2.10.5.1 Diagnosis

Common causes:
- Too many modules in profile
- Complex profile scripts
- Network drives in module path
- Antivirus scanning

#### 2.10.5.2 Solutions

**Profile optimization:**
1. Measure profile load time:
   ```powershell
   Measure-Command { $null = $PROFILE }
   ```
2. Identify slow components:
   ```powershell
   $start = Get-Date
   . $PROFILE
   (Get-Date) - $start
   ```

**Optimization techniques:**
- Load modules on demand rather than in profile
- Remove unnecessary commands from profile
- Use module auto-loading instead of explicit imports
- Avoid network paths in module search

**Example optimized profile:**
```powershell
# Only load essential modules
Import-Module PSReadLine -ErrorAction SilentlyContinue

# Define functions that load modules when called
function Connect-Az {
    if (-not (Get-Module -Name Az.Accounts -ErrorAction SilentlyContinue)) {
        Import-Module Az.Accounts
    }
    Connect-AzAccount
}
```

**Additional performance tweaks:**
```powershell
# Disable telemetry
$env:POWERSHELL_TELEMETRY_OPTOUT = 1

# Reduce module path
$env:PSModulePath = ($env:PSModulePath -split [IO.Path]::PathSeparator | 
    Where-Object { Test-Path $_ -PathType Container }) -join [IO.Path]::PathSeparator
```

### 2.10.6 Issue: Command Not Found After Installing Module

Cause: Module installed but not imported.

#### 2.10.6.1 Diagnosis

Check if module is installed:
```powershell
Get-InstalledModule -Name ModuleName -ErrorAction SilentlyContinue
```

Check if module is available:
```powershell
Get-Module -ListAvailable -Name ModuleName
```

#### 2.10.6.2 Solutions

**Manual import:**
```powershell
Import-Module ModuleName
```

**Auto-loading verification:**
```powershell
# Should trigger auto-loading
Get-Command -Module ModuleName
```

**Profile configuration:**
Add to profile:
```powershell
if (Get-Module -ListAvailable -Name ModuleName) {
    Import-Module ModuleName -ErrorAction SilentlyContinue
}
```

**Path verification:**
Ensure module path is correct:
```powershell
$env:PSModulePath -split [IO.Path]::PathSeparator
```

### 2.10.7 Issue: Module Installation Fails with Network Errors

Symptom: `Install-Module` fails with network-related errors.

#### 2.10.7.1 Diagnosis

Check network connectivity:
```powershell
Test-NetConnection -ComputerName www.powershellgallery.com -Port 443
```

Check proxy settings:
```powershell
[Net.WebRequest]::DefaultWebProxy | Select-Object Address, BypassList
```

#### 2.10.7.2 Solutions

**Configure proxy:**
```powershell
# Set system proxy
[Net.WebRequest]::DefaultWebProxy = New-Object Net.WebProxy("http://proxy:8080")
[Net.WebRequest]::DefaultWebProxy.Credentials = [Net.CredentialCache]::DefaultCredentials

# Set PowerShell-specific proxy
$env:HTTP_PROXY = "http://proxy:8080"
$env:HTTPS_PROXY = "http://proxy:8080"
```

**Use alternative connection method:**
```powershell
Install-PackageProvider -Name NuGet -Force
Register-PSRepository -Default -InstallationPolicy Trusted
```

**Manual installation:**
1. Download module from browser
2. Install manually:
   ```powershell
   Save-Package -Name ModuleName -Source https://www.powershellgallery.com/api/v2 -Path .
   Expand-Archive -Path .\ModuleName.nupkg -DestinationPath "$HOME\Documents\PowerShell\Modules"
   ```

## 2.11 Security Configuration for Production Environments

When setting up PowerShell in production environments, security considerations are paramount. Proper configuration helps prevent misuse while enabling necessary functionality.

### 2.11.1 Execution Policy Best Practices

#### 2.11.1.1 Understanding Execution Policy Levels

| Policy | Description | Security Level |
|--------|-------------|----------------|
| Restricted | No scripts can run | Highest |
| AllSigned | All scripts must be signed | High |
| RemoteSigned | Local scripts OK, remote must be signed | Medium-High |
| Unrestricted | No restrictions (prompts for remote) | Medium |
| Bypass | No restrictions, no warnings | Low |
| Undefined | No policy set for scope | Depends on parent |

#### 2.11.1.2 Recommended Policy Settings

**Workstation environments:**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Server environments:**
```powershell
Set-ExecutionPolicy AllSigned -Scope LocalMachine
```

**Automation environments:**
```powershell
Set-ExecutionPolicy Bypass -Scope Process
```

#### 2.11.1.3 Scope Hierarchy

Execution policies are evaluated in this order:
1. MachinePolicy (Group Policy)
2. UserPolicy (Group Policy)
3. Process
4. CurrentUser
5. LocalMachine

The most specific policy wins.

### 2.11.2 Script Block Logging

#### 2.11.2.1 Enabling Script Block Logging

Via Group Policy:
```
Computer Configuration → Administrative Templates → Windows Components → PowerShell → Turn On PowerShell Script Block Logging
```

Via registry:
```powershell
Set-ItemProperty -Path 'HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging' -Name 'EnableScriptBlockLogging' -Value '1' -Force
```

#### 2.11.2.2 Viewing Logged Script Blocks

```powershell
Get-WinEvent -LogName 'Microsoft-Windows-PowerShell/Operational' | 
    Where-Object Id -eq 4104 | 
    Select-Object TimeCreated, Message
```

#### 2.11.2.3 Log Management Considerations

- Logs can grow quickly in active environments
- Consider log rotation and archival
- Ensure sufficient disk space
- Monitor for suspicious activity

### 2.11.3 Constrained Language Mode

#### 2.11.3.1 Understanding Constrained Language Mode

Restricts PowerShell language features to prevent potentially harmful operations.

#### 2.11.3.2 Enabling Constrained Language Mode

```powershell
$ExecutionContext.SessionState.LanguageMode = "ConstrainedLanguage"
```

#### 2.11.3.3 Features Restricted in Constrained Mode

- Reflection
- Add-Type
- Calling native code
- Creating runspaces
- Most .NET type manipulation

#### 2.11.3.4 Implementing in Production

Via Group Policy:
```
Computer Configuration → Administrative Templates → Windows Components → PowerShell → Turn On PowerShell Transcription
```

Via registry:
```powershell
Set-ItemProperty -Path 'HKLM:\Software\Policies\Microsoft\Windows\PowerShell' -Name 'LanguageMode' -Value 'ConstrainedLanguage' -Force
```

### 2.11.4 Antimalware Scan Interface (AMSI)

#### 2.11.4.1 Verifying AMSI Status

```powershell
(Get-WindowsOptionalFeature -Online -FeatureName Windows-Defender-AMSI).State
```

#### 2.11.4.2 Enabling AMSI

AMSI is enabled by default in Windows 10+/Server 2016+.

To verify:
```powershell
[Enum]::GetNames('System.Management.Automation.AmsiUtils') -contains 'Context'
```

Should return `True`.

#### 2.11.4.3 Troubleshooting AMSI

If scripts are being blocked incorrectly:
```powershell
# Check AMSI results
[Microsoft.PowerShell.Amsi.AmsiUtils]::GetSessionInfo()
```

Work with security team to adjust detection signatures.

### 2.11.5 Just Enough Administration (JEA)

#### 2.11.5.1 Understanding JEA

JEA provides role-based access control for PowerShell remoting.

#### 2.11.5.2 Basic JEA Configuration

1. Create role capability file (`FileServerOperator.psrc`):
   ```powershell
   @{
       VisibleCmdlets = 'Restart-Service'
       VisibleProviders = 'FileSystem'
       ScriptsToProcess = 'C:\Scripts\CustomFunctions.ps1'
   }
   ```

2. Create session configuration file (`FileServerOperator.pssc`):
   ```powershell
   @{
       SessionType = 'RestrictedRemoteServer'
       RunAsVirtualAccount = $true
       RoleDefinitions = @{
           'CONTOSO\FileServerOperators' = @{ RoleCapabilities = 'FileServerOperator' }
       }
   }
   ```

3. Register configuration:
   ```powershell
   Register-PSSessionConfiguration -Name FileServerOperator -Path .\FileServerOperator.pssc
   ```

#### 2.11.5.3 Connecting with JEA

```powershell
Enter-PSSession -ComputerName FileServer01 -ConfigurationName FileServerOperator
```

## 2.12 Performance Optimization for Large-Scale Environments

When working with large datasets or complex scripts, performance considerations become critical.

### 2.12.1 Memory Management

#### 2.12.1.1 Monitoring Memory Usage

```powershell
Get-Process -Id $PID | Select-Object PM, NPM, WS
```

#### 2.12.1.2 Reducing Memory Footprint

- Use streaming pipelines instead of collecting all data
- Avoid unnecessary variables
- Use `[System.GC]::Collect()` judiciously
- Consider 64-bit PowerShell for large datasets

#### 2.12.1.3 Example: Processing Large Files

**Inefficient approach:**
```powershell
(Get-Content largefile.csv) | Where-Object { $_ -match 'ERROR' }
```

**Efficient approach:**
```powershell
Get-Content largefile.csv -ReadCount 1000 | ForEach-Object {
    $_ | Where-Object { $_ -match 'ERROR' }
}
```

### 2.12.2 Pipeline Parallelism

#### 2.12.2.1 Using ForEach-Object -Parallel

```powershell
1..10 | ForEach-Object -Parallel {
    Start-Sleep -Seconds (Get-Random -Minimum 1 -Maximum 3)
    "Completed $_ at $(Get-Date -Format HH:mm:ss)"
} -ThrottleLimit 5
```

#### 2.12.2.2 Performance Considerations

- Optimal throttle limit depends on CPU cores
- Too high: diminishing returns, increased memory
- Too low: underutilized resources
- Test with your specific workload

#### 2.12.2.3 Error Handling in Parallel

```powershell
$results = 1..10 | ForEach-Object -Parallel {
    try {
        # Work that might fail
        if ($_ % 3 -eq 0) { throw "Error on $_" }
        "Success: $_"
    }
    catch {
        "Error: $_"
    }
} -AsJob | Receive-Job -Wait
```

### 2.12.3 .NET Interop for Performance-Critical Sections

#### 2.12.3.1 When to Use .NET Directly

- String manipulation on large datasets
- Complex mathematical operations
- Working with binary data
- High-frequency operations

#### 2.12.3.2 Example: Fast String Processing

```powershell
# PowerShell approach (slower)
$lines = Get-Content largefile.txt
$filtered = $lines | Where-Object { $_ -match 'ERROR' }

# .NET approach (faster)
$reader = [System.IO.File]::OpenText("largefile.txt")
$results = [System.Collections.Generic.List[string]]::new()
try {
    while ($null -ne ($line = $reader.ReadLine())) {
        if ($line.Contains("ERROR")) {
            $results.Add($line)
        }
    }
}
finally {
    $reader.Close()
}
```

#### 2.12.3.3 Measuring Performance

```powershell
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
# Code to measure
$stopwatch.Stop()
$stopwatch.Elapsed
```

## 2.13 Source Control Integration

Integrating PowerShell development with source control systems is essential for team collaboration and version management.

### 2.13.1 Git Integration with VS Code

#### 2.13.1.1 Basic Setup

1. Install Git from [git-scm.com](https://git-scm.com)
2. VS Code detects Git automatically
3. Initialize repository:
   - Open folder in VS Code
   - Click "Initialize Repository" in Source Control view

#### 2.13.1.2 .gitignore Configuration

Create `.gitignore` with PowerShell-specific entries:

```
# PowerShell specific
*.ps1xml
*.psc1
*.pssc
*.psrc
*.psd1
*.psm1
*.ps1
!*.ps1

# Exclude build artifacts
bin/
obj/
output/
dist/

# Exclude sensitive files
*.secret.*
secrets/
credentials.json

# Exclude VS Code settings
.vscode/settings.json
```

#### 2.13.1.3 Git Hooks for PowerShell

Create `hooks/pre-commit` to validate scripts:

```bash
#!/bin/sh
echo "Validating PowerShell scripts..."
find . -name "*.ps1" -exec powershell -Command "Invoke-ScriptAnalyzer {}" \;
if [ $? -ne 0 ]; then
  echo "PowerShell validation failed. Commit aborted."
  exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 2.13.2 PowerShell-Specific Git Practices

#### 2.13.2.1 Module Versioning

Follow semantic versioning in module manifests:

```powershell
# In Module.psd1
ModuleVersion = '1.2.3'
```

#### 2.13.2.2 Changelog Management

Maintain `CHANGELOG.md` with structured format:

```markdown
# Changelog

## [1.2.3] - 2023-10-15
### Added
- New-Resource cmdlet for creating resources

### Changed
- Updated Get-Resource to include new properties

### Fixed
- Fixed memory leak in resource cleanup
```

#### 2.13.2.3 Branching Strategy

Recommended strategy for PowerShell modules:
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `release/*`: Release preparation
- `hotfix/*`: Critical production fixes

## 2.14 Summary

In this comprehensive chapter, you've learned how to:
- Choose between Windows PowerShell and PowerShell 7 with detailed comparison criteria
- Install PowerShell 7 on Windows, macOS, and Linux with platform-specific instructions and troubleshooting
- Select and configure a code editor with thorough comparisons of available options
- Install and configure the PowerShell extension for VS Code with advanced settings
- Configure IntelliSense, syntax checking, and debugging with practical examples and customization
- Create and manage PowerShell profiles with real-world templates and modular approaches
- Customize your prompt with multiple approaches including Oh My Posh and Starship
- Install and manage modules with PowerShellGet and alternative methods including security considerations
- Troubleshoot common setup issues with detailed diagnostic procedures and solutions
- Configure security settings appropriate for different environments including execution policies and JEA
- Optimize performance for large-scale scripting scenarios with memory management and parallel processing
- Set up source control integration for PowerShell development with Git best practices
- Configure remote development environments for cross-platform workflows

You now have a fully operational, professional-grade PowerShell workspace ready for real-world scripting in any environment. With this foundation in place, you're ready to begin writing scripts with confidence, efficiency, and consistency.

## 2.15 Next Steps Preview: Chapter 3 – Your First Commands

In the next chapter, we'll move from setup to action. You'll:
- Run your first PowerShell commands with detailed explanations
- Learn the Verb-Noun naming convention in depth with comprehensive examples
- Explore core cmdlets like `Get-Command`, `Get-Help`, `Get-Member` with advanced usage patterns
- Discover how to find and learn new commands through systematic exploration
- Practice filtering and selecting data with `Where-Object` and `Select-Object` using real datasets
- Understand the pipeline concept through hands-on exercises with visual representations
- Learn about PowerShell's object-oriented nature through practical examples
- Work with basic data types and variables in PowerShell
- Create your first simple scripts with immediate practical applications
- Troubleshoot common command issues with systematic approaches

You'll transition from environment setup to actual scripting — gaining immediate value from PowerShell in just a few minutes while building a solid foundation for more advanced topics.