# 17. GUI Development in Ada

> "GUI development in Ada isn't just for aerospace engineers—it's about creating intuitive interfaces for everyday applications like home automation systems and personal finance tools. With Ada's strong typing and reliability features, you can build user-friendly applications that are both safe and maintainable."

When you think of GUI development, you might imagine complex enterprise applications or safety-critical systems. But graphical interfaces are everywhere in daily life—your smart thermostat, fitness tracker, coffee maker, and even your car's infotainment system all have graphical interfaces. These interfaces make complex technology accessible and easy to use. Ada provides a powerful yet approachable way to build these interfaces without requiring specialized knowledge of safety-critical systems.

This chapter explores how to create graphical user interfaces in Ada using GTKAda, the most popular GUI library for Ada. You'll learn to build practical applications like home automation controllers, personal finance trackers, and simple games—all while leveraging Ada's strengths in reliability and maintainability. Whether you're building a tool for yourself or for others, Ada's GUI capabilities will help you create professional-looking applications with confidence.

## 17.1 Why GUI Development Matters for Everyday Applications

GUI development is essential for making technology accessible to everyone. Consider these common scenarios:

- A smart home controller that lets you manage lights, temperature, and security with a single interface
- A personal finance app that helps you track expenses and budget without complex spreadsheets
- A home media center that lets you browse and play movies with a simple remote control interface

Without graphical interfaces, these technologies would be intimidating or impossible for most people to use. GUIs transform complex functionality into intuitive interactions that anyone can understand.

Ada excels at GUI development for several reasons:

- **Strong type safety**: Prevents common errors like null pointer exceptions or memory leaks
- **Reliability**: Ensures your application behaves predictably even under unexpected conditions
- **Maintainability**: Clear code structure makes it easier to update and extend your application
- **Cross-platform support**: Write once, run anywhere—your application works on Windows, macOS, and Linux

Unlike many GUI frameworks that prioritize speed of development over reliability, Ada's approach ensures your applications are robust from the start. You won't need to worry about mysterious crashes or security vulnerabilities caused by common programming errors.

### 17.1.1 GUI Libraries for Ada

| **Library** | **Description** | **Best For** |
| :--- | :--- | :--- |
| **GTKAda** | Ada binding for GTK+ toolkit, cross-platform | Cross-platform desktop applications |
| **AdaX** | Low-level X Window System bindings | X11-based applications on Unix systems |
| **AdaWin** | Windows API bindings | Windows-specific applications |
| **AdaFX** | Cross-platform framework for embedded systems | Embedded GUIs with limited resources |

GTKAda is the most widely used GUI library for Ada. It provides a modern, cross-platform toolkit that's perfect for everyday applications. The other libraries have specific use cases, but GTKAda is the best starting point for most developers.

## 17.2 Setting Up Your GUI Development Environment

Before you can start building GUI applications, you need to set up your development environment. The process varies slightly depending on your operating system, but it's straightforward for all major platforms.

### 17.2.1 Installing GTKAda

#### 17.2.1.1 Windows

1. Download the GNAT Community Edition from [AdaCore's website](https://www.adacore.com/download)
2. During installation, select the "GTKAda" component
3. Verify installation by opening a command prompt and running:
   ```bash
   gnatls --version
   ```
   You should see GTKAda version information in the output.

#### 17.2.1.2 macOS

1. Install Homebrew if you haven't already:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install GTKAda:
   ```bash
   brew install gtkada
   ```
3. Verify installation:
   ```bash
   gnatls --version
   ```

#### 17.2.1.3 Linux (Ubuntu/Debian)

1. Install GTKAda:
   ```bash
   sudo apt update
   sudo apt install libgtkada-dev
   ```
2. Verify installation:
   ```bash
   gnatls --version
   ```

### 17.2.2 Creating Your First Project

Now that GTKAda is installed, let's create a simple project structure:

```bash
mkdir gui_example
cd gui_example
mkdir src
```

Create a project file named `gui_example.gpr`:

```ada
project GUI_Example is
   for Source_Dirs use ("src");
   for Object_Dir use "obj";
   for Main use ("src/main.adb");
   
   package Compiler is
      for Default_Switches ("Ada") use ("-g", "-O0");
   end Compiler;
   
   package Linker is
      for Default_Switches ("Ada") use ("-lgtk-3", "-lgdk-3", "-lpangocairo-1.0", "-latk-1.0", "-lcairo", "-lgdk_pixbuf-2.0", "-lgio-2.0", "-lgobject-2.0", "-lglib-2.0");
   end Linker;
end GUI_Example;
```

This project file:
- Specifies where source files are located
- Sets the object directory for compiled files
- Defines the main program file
- Configures compiler and linker options for GTKAda

### 17.2.3 Testing Your Setup

Create a simple "Hello World" program to verify your installation:

```ada
-- src/hello_world.adb
with Gtk.Main; use Gtk.Main;
with Gtk.Window; use Gtk.Window;
with Gtk.Label; use Gtk.Label;

procedure Hello_World is
   Win : Gtk_Window;
   Label : Gtk_Label;
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "Hello World");
   Set_Default_Size (Win, 300, 200);
   Set_Title (Win, "Hello World");
   
   Label := Create ("Welcome to GUI Development in Ada!");
   Add (Win, Label);
   
   Show_All (Win);
   Main;
end Hello_World;
```

Build and run the program:

```bash
gnatmake -P gui_example.gpr
./hello_world
```

You should see a window titled "Hello World" with the text "Welcome to GUI Development in Ada!" inside it. If you see this window, your environment is set up correctly!

## 17.3 Building Your First GUI Application

Now that your environment is ready, let's create a more interactive application. We'll build a simple calculator that performs basic arithmetic operations.

### 17.3.1 Step 1: Create the Basic Window Structure

First, we'll create the main window with a vertical box layout:

```ada
with Gtk.Main; use Gtk.Main;
with Gtk.Window; use Gtk.Window;
with Gtk.Box; use Gtk.Box;
with Gtk.Button; use Gtk.Button;
with Gtk.Label; use Gtk.Label;
with Gtk.Entry; use Gtk.Entry;

procedure Calculator is
   Win : Gtk_Window;
   Box : Gtk_Box;
   Display : Gtk_Entry;
   Buttons : array (1..16) of Gtk_Button;
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "Simple Calculator");
   Set_Default_Size (Win, 300, 400);
   Set_Title (Win, "Simple Calculator");
   
   -- Create vertical box for layout
   Box := Create (Vertical);
   Add (Win, Box);
   
   -- Create display area
   Display := Create;
   Set_Editable (Display, False);
   Add (Box, Display);
   
   -- Create number buttons (0-9)
   for I in 1..9 loop
      Buttons(I) := Create (I'Image);
      Add (Box, Buttons(I));
   end loop;
   
   -- Create special buttons
   Buttons(10) := Create ("0");
   Buttons(11) := Create ("+");
   Buttons(12) := Create ("-");
   Buttons(13) := Create ("*");
   Buttons(14) := Create ("/");
   Buttons(15) := Create ("=");
   Buttons(16) := Create ("Clear");
   
   for I in 10..16 loop
      Add (Box, Buttons(I));
   end loop;
   
   Show_All (Win);
   Main;
end Calculator;
```

This code creates a window with a display area and number buttons arranged vertically. The `Display` widget is a text entry field that's not editable by the user—perfect for showing calculation results.

### 17.3.2 Step 2: Add Event Handling

Now let's add event handlers to make the calculator functional:

```ada
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Text_IO; use Ada.Text_IO;

procedure Calculator is
   Win : Gtk_Window;
   Box : Gtk_Box;
   Display : Gtk_Entry;
   Buttons : array (1..16) of Gtk_Button;
   Current_Input : Unbounded_String := To_Unbounded_String ("");
   Operation : Character := ' ';
   First_Number : Float := 0.0;
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "Simple Calculator");
   Set_Default_Size (Win, 300, 400);
   Set_Title (Win, "Simple Calculator");
   
   -- Create vertical box for layout
   Box := Create (Vertical);
   Add (Win, Box);
   
   -- Create display area
   Display := Create;
   Set_Editable (Display, False);
   Add (Box, Display);
   
   -- Create number buttons (0-9)
   for I in 1..9 loop
      Buttons(I) := Create (I'Image);
      Set_On_Clicked (Buttons(I), (procedure (B : access Gtk_Button_Record'Class) is
         begin
            Current_Input := Current_Input & To_Unbounded_String (I'Image);
            Set_Text (Display, To_String (Current_Input));
         end));
      Add (Box, Buttons(I));
   end loop;
   
   -- Create special buttons
   Buttons(10) := Create ("0");
   Set_On_Clicked (Buttons(10), (procedure (B : access Gtk_Button_Record'Class) is
      begin
         Current_Input := Current_Input & To_Unbounded_String ("0");
         Set_Text (Display, To_String (Current_Input));
      end));
   Add (Box, Buttons(10));
   
   Buttons(11) := Create ("+");
   Set_On_Clicked (Buttons(11), (procedure (B : access Gtk_Button_Record'Class) is
      begin
         First_Number := Float (Value (To_String (Current_Input)));
         Operation := '+';
         Current_Input := To_Unbounded_String ("");
      end));
   Add (Box, Buttons(11));
   
   -- Similar handlers for other operations...
   
   Buttons(15) := Create ("=");
   Set_On_Clicked (Buttons(15), (procedure (B : access Gtk_Button_Record'Class) is
      begin
         declare
            Second_Number : Float := Float (Value (To_String (Current_Input)));
            Result : Float;
         begin
            case Operation is
               when '+' => Result := First_Number + Second_Number;
               when '-' => Result := First_Number - Second_Number;
               when '*' => Result := First_Number * Second_Number;
               when '/' => Result := First_Number / Second_Number;
               when others => Result := 0.0;
            end case;
            Current_Input := To_Unbounded_String (Result'Image);
            Set_Text (Display, To_String (Current_Input));
         end;
      end));
   Add (Box, Buttons(15));
   
   Buttons(16) := Create ("Clear");
   Set_On_Clicked (Buttons(16), (procedure (B : access Gtk_Button_Record'Class) is
      begin
         Current_Input := To_Unbounded_String ("");
         Set_Text (Display, "");
         First_Number := 0.0;
         Operation := ' ';
      end));
   Add (Box, Buttons(16));
   
   Show_All (Win);
   Main;
end Calculator;
```

This code adds event handlers for each button:
- Number buttons add digits to the current input
- Operation buttons store the first number and the operation type
- The equals button performs the calculation
- The clear button resets the calculator

When you run this program, you'll have a functional calculator that can perform basic arithmetic operations.

### 17.3.3 Understanding the Code

Let's break down the key elements:

1. **Widget Creation**: Each GUI component (window, box, buttons) is created using GTKAda procedures like `Create` and `Add`.

2. **Event Handling**: The `Set_On_Clicked` procedure attaches a handler to button clicks. These handlers are anonymous procedures that execute when the button is clicked.

3. **State Management**: Variables like `Current_Input`, `Operation`, and `First_Number` track the calculator's state between interactions.

4. **String Handling**: Ada's `Unbounded_String` type makes it easy to build and manipulate text in the display.

This simple example demonstrates how GUI development in Ada combines familiar programming concepts with intuitive visual elements.

## 17.4 Common GUI Components

Let's explore the most common GUI components you'll use in your applications, with practical examples for each.

### 17.4.1 Buttons

Buttons are the most fundamental GUI component—they trigger actions when clicked.

```ada
-- Create a button with text
Button := Create ("Click Me");

-- Change button text
Set_Text (Button, "New Text");

-- Set a handler for button clicks
Set_On_Clicked (Button, (procedure (B : access Gtk_Button_Record'Class) is
   begin
      Put_Line ("Button clicked!");
   end));
```

**Best Practices**:
- Use descriptive text for buttons ("Submit" instead of "Button 1")
- Disable buttons when they're not applicable
- Provide visual feedback when buttons are clicked

### 17.4.2 Labels

Labels display static text information to users.

```ada
-- Create a label with initial text
Label := Create ("Initial Text");

-- Change label text
Set_Text (Label, "Updated Text");

-- Set label properties
Set_Halign (Label, Align_Start);  -- Align text to start
Set_Margin_Top (Label, 10);       -- Add top margin
```

**Best Practices**:
- Use labels for instructions and status messages
- Keep text concise and clear
- Use appropriate font sizes and colors for readability

### 17.4.3 Text Entries

Text entries allow users to input text.

```ada
-- Create a text entry field
Entry := Create;

-- Set initial text
Set_Text (Entry, "Default Text");

-- Get user input
declare
   User_Input : constant String := Get_Text (Entry);
begin
   -- Process input
end;

-- Make entry read-only
Set_Editable (Entry, False);
```

**Best Practices**:
- Use placeholder text to guide users
- Validate input before processing
- Provide clear error messages for invalid input

### 17.4.4 Layout Management

Layout management is crucial for creating professional-looking interfaces. GTKAda provides several layout containers:

#### 17.4.4.1 Vertical Box

```ada
Box := Create (Vertical);
Add (Box, Widget1);
Add (Box, Widget2);
```

Arranges widgets vertically from top to bottom.

#### 17.4.4.2 Horizontal Box

```ada
Box := Create (Horizontal);
Add (Box, Widget1);
Add (Box, Widget2);
```

Arranges widgets horizontally from left to right.

#### 17.4.4.3 Grid Layout

```ada
Grid := Create;
Set_Column_Spacing (Grid, 5);
Set_Row_Spacing (Grid, 5);

Attach (Grid, Widget1, 0, 0, 1, 1);  -- Column 0, Row 0, width 1, height 1
Attach (Grid, Widget2, 1, 0, 1, 1);  -- Column 1, Row 0, width 1, height 1
Attach (Grid, Widget3, 0, 1, 2, 1);  -- Column 0, Row 1, width 2, height 1
```

Arranges widgets in a grid pattern with precise control over placement.

### 17.4.5 Common GUI Components Reference Table

| **Component** | **Purpose** | **Example Use Case** |
| :--- | :--- | :--- |
| **Button** | Triggers actions when clicked | Submit form, start process |
| **Label** | Displays static text | Instructions, status messages |
| **Text Entry** | Allows user input of text | Username, password fields |
| **Check Box** | Toggle between two states | Enable/disable features |
| **Radio Button** | Select one option from a group | Gender selection, preferences |
| **Combo Box** | Dropdown list of options | Select country, product type |
| **Scrollable Area** | View large content in small space | Long text, image galleries |
| **Progress Bar** | Show progress of long operations | File downloads, data processing |

## 17.5 Advanced GUI Features

Once you're comfortable with basic components, you can explore more advanced features that make your applications more powerful and user-friendly.

### 17.5.1 Dialog Boxes

Dialog boxes are essential for interactions that require user input or confirmation.

```ada
with Gtk.File_Chooser; use Gtk.File_Chooser;

procedure Open_File is
   Win : Gtk_Window;
   Button : Gtk_Button;
   Filename : String (1..256);
   Length : Natural;
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "File Open");
   Set_Default_Size (Win, 300, 200);
   Set_Title (Win, "File Open");
   
   Button := Create ("Open File");
   Add (Win, Button);
   
   Set_On_Clicked (Button, (procedure (B : access Gtk_Button_Record'Class) is
      declare
         Dialog : Gtk_File_Chooser_Dialog;
      begin
         Dialog := Create ("Open File", Win, File_Chooser_Action_Open);
         if Run (Dialog) = Response_Accept then
            Filename := Get_Filename (Dialog);
            -- Process the selected file
         end if;
         Destroy (Dialog);
      end);
   end));
   
   Show_All (Win);
   Main;
end Open_File;
```

This code creates a file open dialog that lets users select a file from their system. The `Run` procedure displays the dialog and waits for user input, then returns the selected filename.

### 17.5.2 Custom Widgets

Sometimes you need widgets that don't exist in standard libraries. GTKAda allows you to create custom widgets:

```ada
with Gtk.Drawing_Area; use Gtk.Drawing_Area;
with Gtk.Style_Context; use Gtk.Style_Context;

package Custom_Widgets is
   type Color_Picker is new Gtk_Drawing_Area with null record;
   procedure Draw (W : in out Color_Picker; Context : Gtk_Style_Context'Class);
end Custom_Widgets;

package body Custom_Widgets is
   procedure Draw (W : in out Color_Picker; Context : Gtk_Style_Context'Class) is
      Width : constant Natural := Get_Allocated_Width (W);
      Height : constant Natural := Get_Allocated_Height (W);
   begin
      -- Draw a gradient background
      Set_Source_Rgba (Context, 1.0, 0.0, 0.0, 0.5);
      Rectangle (Context, 0, 0, Width, Height);
      Fill (Context);
   end Draw;
end Custom_Widgets;
```

This example creates a custom color picker widget that draws a red gradient background. You can extend this to create more complex widgets with user interaction.

### 17.5.3 Theming and Styling

GTKAda supports theming to give your applications a professional look:

```ada
with Gtk.Style_Context; use Gtk.Style_Context;

procedure Style_Window (Win : Gtk_Window) is
   Context : Gtk_Style_Context'Class := Get_Style_Context (Win);
begin
   -- Set background color
   Set_Background_Color (Context, (Red => 0.9, Green => 0.9, Blue => 0.9, Alpha => 1.0));
   
   -- Set font size
   Set_Font (Context, "Arial 12");
   
   -- Set padding
   Set_Margin_Top (Win, 10);
   Set_Margin_Bottom (Win, 10);
   Set_Margin_Left (Win, 10);
   Set_Margin_Right (Win, 10);
end Style_Window;
```

This code styles a window with a light gray background, Arial font, and consistent padding. You can create more complex styles using CSS-like syntax.

### 17.5.4 Advanced GUI Features Reference Table

| **Feature** | **Purpose** | **Example Use Case** |
| :--- | :--- | :--- |
| **Dialog Boxes** | Specialized interaction windows | File open/save, confirmation dialogs |
| **Custom Widgets** | Create unique UI elements | Custom data visualizations, specialized controls |
| **Theming and Styling** | Control visual appearance | Professional-looking applications, brand consistency |
| **Drag and Drop** | Move data between widgets | File management, rearranging items |
| **Animations** | Add visual feedback | Progress indicators, interactive elements |
| **Accessibility Features** | Support for users with disabilities | Screen readers, high-contrast modes |

## 17.6 Best Practices for GUI Development

Following best practices will make your GUI applications more reliable, maintainable, and user-friendly.

### 17.6.1 Separating UI and Logic

Keep your user interface code separate from your business logic. This makes your code easier to understand and maintain.

```ada
-- ui_package.ads
package UI_Package is
   procedure Create_Window;
   procedure Handle_Button_Click;
end UI_Package;

-- business_logic.ads
package Business_Logic is
   function Calculate (A, B : Float) return Float;
   procedure Save_Data (Data : String);
end Business_Logic;

-- main.adb
with UI_Package; use UI_Package;
with Business_Logic; use Business_Logic;

procedure Main is
begin
   Create_Window;
   Main;
end Main;
```

In this example:
- `UI_Package` handles all GUI-related code
- `Business_Logic` handles all calculation and data operations
- The main program simply starts the UI

This separation makes it easy to change the UI without affecting business logic, and vice versa.

### 17.6.2 Error Handling in GUIs

GUI applications need special error handling to provide good user experiences.

```ada
procedure Process_Data is
   Input : String := Get_Text (Entry);
begin
   declare
      Value : Float := Float (Value (Input));
   begin
      -- Process valid data
   exception
      when others =>
         -- Show error message to user
         Show_Error_Message ("Invalid input: please enter a number");
   end;
end Process_Data;
```

Key error handling practices:
- Provide clear, actionable error messages
- Don't crash the application on invalid input
- Validate input before processing
- Use dialog boxes for important error messages

### 17.6.3 Design Patterns for GUIs

#### 17.6.3.1 Model-View-Controller (MVC)

MVC is a common pattern for organizing GUI applications:

```ada
-- Model: Data storage
package Data_Model is
   type Data_Record is record
      Name : String (1..50);
      Age : Natural;
   end record;
   
   procedure Save (Data : Data_Record);
   function Load return Data_Record;
end Data_Model;

-- View: UI components
package UI_View is
   procedure Create_Window;
   procedure Update_Display (Data : Data_Model.Data_Record);
end UI_View;

-- Controller: Handles interactions
package Controller is
   procedure Handle_Button_Click;
   procedure Handle_Input_Changed;
end Controller;
```

In this pattern:
- **Model**: Manages data storage and retrieval
- **View**: Displays data to the user
- **Controller**: Handles user interactions and updates the model and view

This separation makes your code more modular and easier to test.

### 17.6.4 Best Practices Reference Table

| **Practice** | **Why It Matters** | **Example** |
| :--- | :--- | :--- |
| **Separate UI and Logic** | Easier maintenance and testing | Business logic in separate package from UI code |
| **Proper Error Handling** | Better user experience | Clear error messages instead of crashes |
| **Use Design Patterns** | More maintainable code | MVC pattern for organizing application structure |
| **Responsive Design** | Works on different screen sizes | Layouts that adapt to window resizing |
| **Accessibility Features** | Works for all users | Screen reader support, high-contrast modes |
| **Consistent Styling** | Professional appearance | Uniform colors, fonts, and spacing throughout app |

## 17.7 Real-World Examples

Let's look at practical examples of GUI applications built with Ada that solve real problems.

### 17.7.1 Home Automation Controller

A home automation controller lets you manage lights, temperature, and security from a single interface.

```ada
with Gtk.Main; use Gtk.Main;
with Gtk.Window; use Gtk.Window;
with Gtk.Box; use Gtk.Box;
with Gtk.Button; use Gtk.Button;
with Gtk.Label; use Gtk.Label;
with Gtk.Switch; use Gtk.Switch;

procedure Home_Automation is
   Win : Gtk_Window;
   Box : Gtk_Box;
   Light_Switch : Gtk_Switch;
   Temperature_Label : Gtk_Label;
   Security_Label : Gtk_Label;
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "Home Automation");
   Set_Default_Size (Win, 400, 300);
   Set_Title (Win, "Home Automation");
   
   Box := Create (Vertical);
   Add (Win, Box);
   
   -- Light control
   Add (Box, Create ("Light Control"));
   Light_Switch := Create;
   Set_Label (Light_Switch, "Living Room Light");
   Add (Box, Light_Switch);
   
   -- Temperature control
   Add (Box, Create ("Temperature Control"));
   Temperature_Label := Create ("Current Temperature: 22°C");
   Add (Box, Temperature_Label);
   
   -- Security control
   Add (Box, Create ("Security Control"));
   Security_Label := Create ("Security System: Armed");
   Add (Box, Security_Label);
   
   Show_All (Win);
   Main;
end Home_Automation;
```

This simple example demonstrates how to create a home automation interface with switches for lights, labels for temperature, and status indicators for security systems. You could extend this to add more features like scheduling, remote control, and energy usage monitoring.

### 17.7.2 Personal Finance Tracker

A personal finance tracker helps users manage their money with a simple interface.

```ada
with Gtk.Main; use Gtk.Main;
with Gtk.Window; use Gtk.Window;
with Gtk.Box; use Gtk.Box;
with Gtk.Button; use Gtk.Button;
with Gtk.Label; use Gtk.Label;
with Gtk.Entry; use Gtk.Entry;
with Gtk.Tree_View; use Gtk.Tree_View;
with Gtk.List_Store; use Gtk.List_Store;

procedure Finance_Tracker is
   Win : Gtk_Window;
   Box : Gtk_Box;
   Amount_Entry : Gtk_Entry;
   Description_Entry : Gtk_Entry;
   Add_Button : Gtk_Button;
   Transactions_List : Gtk_Tree_View;
   List_Store : Gtk_List_Store;
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "Personal Finance");
   Set_Default_Size (Win, 600, 400);
   Set_Title (Win, "Personal Finance");
   
   Box := Create (Vertical);
   Add (Win, Box);
   
   -- Add transaction form
   Add (Box, Create ("Add Transaction"));
   
   Amount_Entry := Create;
   Set_Hexpand (Amount_Entry, True);
   Add (Box, Amount_Entry);
   
   Description_Entry := Create;
   Set_Hexpand (Description_Entry, True);
   Add (Box, Description_Entry);
   
   Add_Button := Create ("Add Transaction");
   Add (Box, Add_Button);
   
   -- Transactions list
   Add (Box, Create ("Transactions"));
   
   List_Store := Create (2);  -- Two columns: amount and description
   Set_Column_Sort_Column_Id (List_Store, 0, Sort_Type_Ascending);
   
   Transactions_List := Create (List_Store);
   Add (Box, Transactions_List);
   
   Show_All (Win);
   Main;
end Finance_Tracker;
```

This example creates a personal finance tracker with:
- Input fields for amount and description
- A button to add transactions
- A list view to display transactions

You could extend this to add features like:
- Category selection for transactions
- Charting for spending patterns
- Budget tracking with alerts
- Data export to CSV or other formats

### 17.7.3 Data Visualization Tool

A data visualization tool helps users understand complex data through charts and graphs.

```ada
with Gtk.Main; use Gtk.Main;
with Gtk.Window; use Gtk.Window;
with Gtk.Box; use Gtk.Box;
with Gtk.Drawing_Area; use Gtk.Drawing_Area;
with Gtk.Style_Context; use Gtk.Style_Context;

procedure Data_Visualization is
   Win : Gtk_Window;
   Box : Gtk_Box;
   Drawing_Area : Gtk_Drawing_Area;
   Data : array (1..10) of Float := (10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0);
begin
   Initialize;
   Win := Create (Gtk_Window_Type, "Data Visualization");
   Set_Default_Size (Win, 600, 400);
   Set_Title (Win, "Data Visualization");
   
   Box := Create (Vertical);
   Add (Win, Box);
   
   Drawing_Area := Create;
   Set_Hexpand (Drawing_Area, True);
   Set_Vexpand (Drawing_Area, True);
   Add (Box, Drawing_Area);
   
   Set_On_Draw (Drawing_Area, (procedure (W : access Gtk_Drawing_Area_Record'Class; Context : Gtk_Style_Context'Class) is
      Width : constant Natural := Get_Allocated_Width (W);
      Height : constant Natural := Get_Allocated_Height (W);
      Bar_Width : constant Float := Float (Width) / Float (Data'Length);
   begin
      -- Draw background
      Set_Source_Rgba (Context, 1.0, 1.0, 1.0, 1.0);
      Rectangle (Context, 0, 0, Width, Height);
      Fill (Context);
      
      -- Draw bars
      for I in Data'Range loop
         Bar_Height : constant Float := Data(I) / 100.0 * Float (Height);
         Set_Source_Rgba (Context, 0.2, 0.6, 0.8, 1.0);
         Rectangle (Context, 
                   Integer (Float (I-1) * Bar_Width), 
                   Height - Integer (Bar_Height),
                   Integer (Bar_Width), 
                   Integer (Bar_Height));
         Fill (Context);
      end loop;
   end));
   
   Show_All (Win);
   Main;
end Data_Visualization;
```

This example creates a simple bar chart visualization. You could extend this to:
- Add axis labels and titles
- Support different chart types (line, pie, scatter)
- Add interactive elements (hover effects, tooltips)
- Implement data loading from files or databases

## 17.8 Exercises for Readers

Now it's time to put your knowledge into practice with some hands-on exercises.

### 17.8.1 Exercise 1: Simple Calculator

Create a calculator application with:
- A display area showing current input and results
- Number buttons (0-9)
- Operation buttons (+, -, ×, ÷)
- Clear and equals buttons
- Error handling for division by zero

> **Challenge**: Add support for decimal numbers and more complex operations like square root.

#### 17.8.1.1 Solution Guidance

Start by creating the basic window structure with a vertical box layout. Add a text entry for the display area, then create buttons for numbers and operations. For the calculation logic:
- Store the first number and operation when an operator is pressed
- Store the second number when the equals button is pressed
- Perform the calculation and display the result
- Handle division by zero with an error message

### 17.8.2 Exercise 2: Personal Contact Manager

Create a contact management application with:
- A form for adding new contacts (name, phone, email)
- A list view showing all contacts
- Buttons to edit and delete contacts
- Data storage in a file or database

> **Challenge**: Add search functionality and contact categorization.

#### 17.8.2.1 Solution Guidance

Create a form with text entries for name, phone, and email. Add a "Save" button that adds the contact to a list. For the list view:
- Use a `Gtk_Tree_View` with columns for name, phone, and email
- Store contact data in a `Gtk_List_Store`
- Add buttons to edit and delete selected contacts
- Implement file saving and loading using Ada's text file operations

### 17.8.3 Exercise 3: Weather Data Viewer

Create a weather data application that:
- Displays current temperature and conditions
- Shows a 5-day forecast as a bar chart
- Allows users to search for different locations
- Fetches data from a public weather API

> **Challenge**: Add weather alerts and historical data comparison.

#### 17.8.3.1 Solution Guidance

Start with a simple interface showing temperature and conditions. For the forecast chart:
- Use a `Gtk_Drawing_Area` to draw bar charts for high/low temperatures
- Fetch data from a weather API using Ada's HTTP client
- Add a text entry for location search
- Implement error handling for network issues or invalid locations

## 17.9 Next Steps for GUI Development in Ada

Now that you've learned the basics of GUI development in Ada, here's how to continue your journey.

### 17.9.1 Explore Advanced GUI Features

- **Drag and drop**: Allow users to move items between lists or windows
- **Animations**: Add visual feedback for user interactions
- **Custom widgets**: Create specialized UI elements for your needs
- **Accessibility features**: Make your applications usable for everyone

### 17.9.2 Integrate with Ada's Other Features

- **Concurrency**: Use tasks to keep your UI responsive during long operations
- **Networking**: Build applications that communicate over networks
- **Database access**: Store and retrieve data from databases
- **File I/O**: Read and write files for data storage

### 17.9.3 Join the Ada Community

The Ada community is active and supportive. Join:
- **AdaCore Forums**: For technical support and discussions
- **GitHub Repositories**: For open-source Ada projects
- **Ada mailing lists**: For discussions and questions
- **Ada conferences**: Events like Ada Europe

### 17.9.4 Build Real-World Applications

Start with small projects and gradually build more complex applications:
- A home automation controller
- A personal finance tracker
- A data visualization tool
- A simple game
- A custom tool for your specific needs

## 17.10 Conclusion: The Power of GUI Development in Ada

> "GUI development in Ada isn't just for aerospace engineers—it's about creating intuitive interfaces for everyday applications like home automation systems and personal finance tools. With Ada's strong typing and reliability features, you can build user-friendly applications that are both safe and maintainable."

GUI development in Ada is accessible to beginners while providing professional-grade capabilities. You've learned how to:
- Set up your development environment
- Create basic windows and components
- Handle user interactions
- Implement advanced features like dialog boxes and custom widgets
- Follow best practices for maintainable code
- Build real-world applications

Ada's strengths in reliability and maintainability make it an excellent choice for GUI development. Your applications will be less prone to crashes and security vulnerabilities, and easier to maintain and extend over time.

For everyday applications, these benefits translate directly to better user experiences. A home automation system that works reliably builds trust with users. A personal finance app that calculates correctly prevents financial mistakes. GUI development with Ada gives you the tools to create professional-looking applications with confidence.

As you continue your journey with Ada, remember that GUI development is about solving real problems for real people. Start with simple projects and gradually build more complex applications as you gain confidence. Use the tools and resources available in the Ada community, and don't be afraid to ask for help when you need it.

