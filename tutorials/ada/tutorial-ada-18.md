# 18\. Distributed Systems in Ada

> "Distributed systems aren't just for aerospace engineers—they're the backbone of everyday applications like smart homes, online games, and cloud services. Ada's reliability features make it an excellent choice for building distributed systems that are both robust and maintainable."

When you think of distributed systems, you might imagine complex aerospace control systems or massive cloud infrastructure. But distributed systems are actually everywhere in daily life—your smart thermostat communicates with your phone, your fitness tracker syncs data to the cloud, and your favorite online game connects players from around the world. These systems involve multiple computers working together over a network to solve problems that a single machine couldn't handle alone. Ada provides powerful tools to build these systems safely and reliably, without requiring specialized knowledge of safety-critical domains.

This chapter explores how to build distributed systems in Ada using practical, everyday examples. You'll learn to create client-server applications, handle network communication, and build systems that work together seamlessly—whether you're developing a home automation system, a multiplayer game, or a simple data collection tool. You'll discover how Ada's strong typing, tasking capabilities, and exception handling make distributed programming more reliable and less error-prone than in many other languages.

## Why Distributed Systems Matter for Everyday Applications

Distributed systems are fundamental to modern technology, but they're often invisible to end users. Consider these common scenarios:

- **Smart home systems**: Your thermostat, lights, and security cameras all communicate over your home network
- **Online games**: Players from different locations interact in real time through a central server
- **Cloud services**: Your photos, documents, and emails are stored and processed across multiple servers
- **IoT devices**: Sensors in your home or workplace send data to a central system for analysis

These systems differ from single-machine applications in key ways:
- They involve multiple computers communicating over networks
- They must handle network failures and delays gracefully
- They often need to scale to handle many users simultaneously
- They require careful coordination between components

Ada excels in this environment because it provides:
- **Strong type safety**: Prevents common errors like null pointer exceptions or memory leaks
- **Built-in tasking**: Makes concurrent network operations straightforward
- **Exception handling**: Gracefully handles network failures and errors
- **Reliability**: Ensures your system behaves predictably even under unexpected conditions

Unlike many languages where distributed programming requires complex libraries and frameworks, Ada provides these capabilities directly in the language—making it accessible to beginners while still powerful enough for complex systems.

### Distributed Systems vs. Traditional Applications

| **Aspect** | **Traditional Application** | **Distributed System** |
| :--- | :--- | :--- |
| **Architecture** | Single machine, single process | Multiple machines, multiple processes |
| **Communication** | Function calls within same process | Network messages between processes |
| **Failure Handling** | Local exceptions only | Must handle network failures and timeouts |
| **Scalability** | Limited by single machine resources | Can scale across multiple machines |
| **Complexity** | Simpler to develop and debug | More complex due to network interactions |

## Basic Concepts of Distributed Systems

Before diving into code, let's understand the fundamental concepts of distributed systems.

### Client-Server Model

The most common distributed system architecture is the client-server model:
- **Server**: A central program that provides services
- **Client**: Programs that request services from the server

This model is used in everyday applications like:
- Web browsers (clients) connecting to web servers
- Email clients connecting to mail servers
- Smart home devices connecting to a central hub

### Message Passing

In distributed systems, components communicate by sending messages over networks. These messages can be:
- Simple commands ("Turn on lights")
- Data requests ("What's the current temperature?")
- Responses to requests ("Temperature is 22°C")

Message passing is fundamental to distributed systems because it allows components to communicate without knowing each other's internal details.

### Network Communication Basics

Distributed systems rely on network protocols to communicate:
- **TCP/IP**: Reliable, connection-oriented communication
- **UDP**: Faster, connectionless communication (for real-time applications)
- **HTTP**: Standard protocol for web communication

Ada provides libraries for all these protocols, but for beginners, TCP/IP is the best starting point because it's reliable and widely used.

### Key Challenges in Distributed Systems

Distributed systems face several challenges that single-machine applications don't:
- **Network failures**: Connections can drop unexpectedly
- **Latency**: Network delays can affect responsiveness
- **Scalability**: Systems must handle increasing numbers of users
- **Consistency**: Ensuring all components have up-to-date information

Ada helps address these challenges through:
- Exception handling for network errors
- Tasking for concurrent operations
- Strong typing to prevent data corruption
- Reliable communication protocols

## Ada's Networking Capabilities

Ada provides several libraries for network communication, but the most accessible for beginners is GNAT.Sockets. This package provides a straightforward interface for TCP/IP communication.

### Setting Up Your Environment

Before you can start building distributed systems, you need to set up your development environment:

#### Windows
1. Download GNAT Community Edition from [AdaCore's website](https://www.adacore.com/download)
2. During installation, select "GNAT.Sockets" component
3. Verify installation by opening Command Prompt and running:
   ```bash
   gnatls --version
   ```
   You should see GNAT.Sockets version information in the output.

#### macOS
1. Install Homebrew if you haven't already:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install GNAT:
   ```bash
   brew install gnat
   ```
3. Verify installation:
   ```bash
   gnatls --version
   ```

#### Linux (Ubuntu/Debian)
1. Install GNAT:
   ```bash
   sudo apt update
   sudo apt install gnat
   ```
2. Verify installation:
   ```bash
   gnatls --version
   ```

### Creating Your First Network Project

Let's create a simple project structure:

```bash
mkdir distributed_example
cd distributed_example
mkdir src
```

Create a project file named `distributed_example.gpr`:

```ada
project Distributed_Example is
   for Source_Dirs use ("src");
   for Object_Dir use "obj";
   for Main use ("src/main.adb");
   
   package Compiler is
      for Default_Switches ("Ada") use ("-g", "-O0");
   end Compiler;
   
   package Linker is
      for Default_Switches ("Ada") use ("-lsocket", "-lnsl");
   end Linker;
end Distributed_Example;
```

This project file:
- Specifies where source files are located
- Sets the object directory for compiled files
- Defines the main program file
- Configures compiler and linker options for networking

### Testing Your Setup

Create a simple "Hello World" network program to verify your installation:

```ada
-- src/hello_world.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Hello_World is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Buffer : String (1..1024);
   Length : Natural;
begin
   Create_Socket (Socket);
   Get_Host_By_Name ("localhost", Address);
   Connect (Socket, Address, 8080);
   
   Send (Socket, "Hello from client");
   Receive (Socket, Buffer, Length);
   Put_Line ("Server response: " & Buffer (1..Length));
   
   Close (Socket);
end Hello_World;
```

Build and run the program:

```bash
gnatmake -P distributed_example.gpr
./hello_world
```

This simple program attempts to connect to a server on port 8080. Since we haven't created a server yet, it will fail—but this confirms your environment is set up correctly for networking.

## Building Your First Distributed System

Now that your environment is ready, let's create a distributed calculator application. This system will have:
- A server that performs calculations
- A client that sends calculation requests to the server

### Step 1: Create the Server

First, we'll create the server that listens for connections and processes requests:

```ada
-- src/calculator_server.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Numerics.Elementary_Functions; use Ada.Numerics.Elementary_Functions;

procedure Calculator_Server is
   Socket : Socket_Type;
   Client_Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Buffer : String (1..1024);
   Length : Natural;
   Command : Unbounded_String;
   Result : Float;
begin
   Create_Socket (Socket);
   Set_Socket_Option (Socket, Reuse_Address, True);
   Bind (Socket, Inet_Addr ("0.0.0.0"), 8080);
   Listen (Socket, 5);
   
   loop
      Accept (Socket, Client_Socket, Address);
      
      Receive (Client_Socket, Buffer, Length);
      Command := To_Unbounded_String (Buffer (1..Length));
      
      if Contains (Command, "ADD") then
         declare
            Parts : array (1..3) of Unbounded_String;
            Index : Natural := 1;
            Start : Natural := 1;
            End_Index : Natural;
         begin
            for I in 1..Length loop
               if Buffer(I) = ' ' then
                  Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                  Start := I + 1;
                  Index := Index + 1;
               end if;
            end loop;
            Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
            
            declare
               A : Float := Float (Value (To_String (Parts(2))));
               B : Float := Float (Value (To_String (Parts(3))));
            begin
               Result := A + B;
               Send (Client_Socket, "Result: " & Result'Image);
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid numbers");
            end;
         end;
      elsif Contains (Command, "SUBTRACT") then
         declare
            Parts : array (1..3) of Unbounded_String;
            Index : Natural := 1;
            Start : Natural := 1;
            End_Index : Natural;
         begin
            for I in 1..Length loop
               if Buffer(I) = ' ' then
                  Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                  Start := I + 1;
                  Index := Index + 1;
               end if;
            end loop;
            Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
            
            declare
               A : Float := Float (Value (To_String (Parts(2))));
               B : Float := Float (Value (To_String (Parts(3))));
            begin
               Result := A - B;
               Send (Client_Socket, "Result: " & Result'Image);
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid numbers");
            end;
         end;
      elsif Contains (Command, "MULTIPLY") then
         declare
            Parts : array (1..3) of Unbounded_String;
            Index : Natural := 1;
            Start : Natural := 1;
            End_Index : Natural;
         begin
            for I in 1..Length loop
               if Buffer(I) = ' ' then
                  Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                  Start := I + 1;
                  Index := Index + 1;
               end if;
            end loop;
            Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
            
            declare
               A : Float := Float (Value (To_String (Parts(2))));
               B : Float := Float (Value (To_String (Parts(3))));
            begin
               Result := A * B;
               Send (Client_Socket, "Result: " & Result'Image);
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid numbers");
            end;
         end;
      elsif Contains (Command, "DIVIDE") then
         declare
            Parts : array (1..3) of Unbounded_String;
            Index : Natural := 1;
            Start : Natural := 1;
            End_Index : Natural;
         begin
            for I in 1..Length loop
               if Buffer(I) = ' ' then
                  Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                  Start := I + 1;
                  Index := Index + 1;
               end if;
            end loop;
            Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
            
            declare
               A : Float := Float (Value (To_String (Parts(2))));
               B : Float := Float (Value (To_String (Parts(3))));
            begin
               if B = 0.0 then
                  Send (Client_Socket, "Error: Division by zero");
               else
                  Result := A / B;
                  Send (Client_Socket, "Result: " & Result'Image);
               end if;
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid numbers");
            end;
         end;
      else
         Send (Client_Socket, "Error: Unknown command");
      end if;
      
      Close (Client_Socket);
   end loop;
end Calculator_Server;
```

This server:
- Listens on port 8080 for incoming connections
- Receives commands from clients
- Processes basic arithmetic operations
- Sends results back to clients
- Handles errors gracefully

### Step 2: Create the Client

Now let's create the client that sends commands to the server:

```ada
-- src/calculator_client.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Calculator_Client is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Command : String := "ADD 5 3";
   Buffer : String (1..1024);
   Length : Natural;
begin
   Create_Socket (Socket);
   Get_Host_By_Name ("localhost", Address);
   Connect (Socket, Address, 8080);
   
   Send (Socket, Command);
   Receive (Socket, Buffer, Length);
   Put_Line ("Server response: " & Buffer (1..Length));
   
   Close (Socket);
end Calculator_Client;
```

This client:
- Connects to the server on localhost, port 8080
- Sends a calculation command
- Receives and displays the result

### Step 3: Build and Test

First, build the server:

```bash
gnatmake -P distributed_example.gpr src/calculator_server.adb
```

Then run the server in one terminal:

```bash
./calculator_server
```

Next, build the client in another terminal:

```bash
gnatmake -P distributed_example.gpr src/calculator_client.adb
```

Then run the client:

```bash
./calculator_client
```

You should see:

```
Server response: Result:  8.00000E+00
```

This confirms your distributed system is working correctly!

### Understanding the Code

Let's break down the key elements:

1. **Socket Creation**: Both server and client create sockets using `Create_Socket`.

2. **Binding and Listening**: The server binds to a specific port and listens for connections.

3. **Connecting**: The client connects to the server's address and port.

4. **Sending and Receiving**: Data is sent and received using `Send` and `Receive`.

5. **Error Handling**: The server uses exception handling to catch invalid inputs and division by zero.

This simple example demonstrates how distributed systems work in practice—components communicate over networks to solve problems together.

## Handling Failures in Distributed Systems

Distributed systems must handle network failures gracefully. Let's enhance our calculator system to handle common failure scenarios.

### Timeouts

Network operations can hang indefinitely if the server doesn't respond. Let's add timeouts to our client:

```ada
-- src/calculator_client_with_timeout.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Calendar; use Ada.Calendar;

procedure Calculator_Client_With_Timeout is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Command : String := "ADD 5 3";
   Buffer : String (1..1024);
   Length : Natural;
   Start_Time : Time;
   Elapsed : Time_Span;
begin
   Create_Socket (Socket);
   Get_Host_By_Name ("localhost", Address);
   Connect (Socket, Address, 8080);
   
   Start_Time := Clock;
   Send (Socket, Command);
   
   -- Wait up to 5 seconds for response
   loop
      Elapsed := Clock - Start_Time;
      if Elapsed > Seconds(5) then
         Put_Line ("Timeout: Server didn't respond");
         exit;
      end if;
      
      -- Check if data is available
      if Is_Data_Available (Socket) then
         Receive (Socket, Buffer, Length);
         Put_Line ("Server response: " & Buffer (1..Length));
         exit;
      end if;
      
      delay Milliseconds(100);
   end loop;
   
   Close (Socket);
end Calculator_Client_With_Timeout;
```

This client:
- Tracks how long it's been waiting for a response
- Times out after 5 seconds if no response arrives
- Checks for available data before attempting to receive

### Connection Errors

Let's handle connection errors in the client:

```ada
-- src/calculator_client_with_errors.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Calculator_Client_With_Errors is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Command : String := "ADD 5 3";
   Buffer : String (1..1024);
   Length : Natural;
begin
   Create_Socket (Socket);
   
   begin
      Get_Host_By_Name ("localhost", Address);
      Connect (Socket, Address, 8080);
      
      Send (Socket, Command);
      Receive (Socket, Buffer, Length);
      Put_Line ("Server response: " & Buffer (1..Length));
      
   exception
      when Socket_Error =>
         Put_Line ("Error: Could not connect to server");
      when others =>
         Put_Line ("Unexpected error: " & Exception_Message);
   end;
   
   Close (Socket);
end Calculator_Client_With_Errors;
```

This client:
- Uses exception handling to catch connection errors
- Provides clear error messages for users
- Handles unexpected errors gracefully

## Building a Distributed Home Automation System

Let's create a more practical example: a distributed home automation system. This system will:
- Have a central server that controls lights and temperature
- Have client devices (like a phone app) that send commands to the server

### Step 1: Create the Home Automation Server

```ada
-- src/home_automation_server.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;

procedure Home_Automation_Server is
   Socket : Socket_Type;
   Client_Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Buffer : String (1..1024);
   Length : Natural;
   Command : Unbounded_String;
   Light_State : Boolean := False;
   Temperature : Float := 22.0;
begin
   Create_Socket (Socket);
   Set_Socket_Option (Socket, Reuse_Address, True);
   Bind (Socket, Inet_Addr ("0.0.0.0"), 8080);
   Listen (Socket, 5);
   
   loop
      Accept (Socket, Client_Socket, Address);
      
      Receive (Client_Socket, Buffer, Length);
      Command := To_Unbounded_String (Buffer (1..Length));
      
      if Contains (Command, "LIGHT_ON") then
         Light_State := True;
         Send (Client_Socket, "Lights turned on");
      elsif Contains (Command, "LIGHT_OFF") then
         Light_State := False;
         Send (Client_Socket, "Lights turned off");
      elsif Contains (Command, "TEMP_SET") then
         declare
            Parts : array (1..2) of Unbounded_String;
            Index : Natural := 1;
            Start : Natural := 1;
            End_Index : Natural;
         begin
            for I in 1..Length loop
               if Buffer(I) = ' ' then
                  Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                  Start := I + 1;
                  Index := Index + 1;
               end if;
            end loop;
            Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
            
            declare
               Temp : Float := Float (Value (To_String (Parts(2))));
            begin
               if Temp < -20.0 or Temp > 50.0 then
                  Send (Client_Socket, "Error: Temperature out of range");
               else
                  Temperature := Temp;
                  Send (Client_Socket, "Temperature set to " & Temperature'Image & "°C");
               end if;
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid temperature");
            end;
         end;
      elsif Contains (Command, "STATUS") then
         declare
            Status : String := "Lights: " & (if Light_State then "On" else "Off") &
                              ", Temperature: " & Temperature'Image & "°C";
         begin
            Send (Client_Socket, Status);
         end;
      else
         Send (Client_Socket, "Error: Unknown command");
      end if;
      
      Close (Client_Socket);
   end loop;
end Home_Automation_Server;
```

This server:
- Manages light state and temperature
- Handles multiple commands (turn lights on/off, set temperature, check status)
- Validates inputs to prevent invalid values
- Sends appropriate responses to clients

### Step 2: Create the Home Automation Client

```ada
-- src/home_automation_client.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Home_Automation_Client is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Command : String;
   Buffer : String (1..1024);
   Length : Natural;
begin
   Create_Socket (Socket);
   Get_Host_By_Name ("localhost", Address);
   Connect (Socket, Address, 8080);
   
   Put_Line ("Home Automation Client");
   Put_Line ("Commands:");
   Put_Line ("  LIGHT_ON");
   Put_Line ("  LIGHT_OFF");
   Put_Line ("  TEMP_SET <temperature>");
   Put_Line ("  STATUS");
   Put_Line ("  QUIT");
   
   loop
      Put("Enter command: ");
      Get_Line (Command);
      
      if Command = "QUIT" then
         exit;
      end if;
      
      Send (Socket, Command);
      Receive (Socket, Buffer, Length);
      Put_Line ("Server response: " & Buffer (1..Length));
   end loop;
   
   Close (Socket);
end Home_Automation_Client;
```

This client:
- Provides a simple command-line interface
- Allows users to send commands to the server
- Displays server responses
- Exits when the user types "QUIT"

### Step 3: Build and Test

First, build and run the server:

```bash
gnatmake -P distributed_example.gpr src/home_automation_server.adb
./home_automation_server
```

Then build and run the client in another terminal:

```bash
gnatmake -P distributed_example.gpr src/home_automation_client.adb
./home_automation_client
```

Now you can interact with your home automation system:

```
Home Automation Client
Commands:
  LIGHT_ON
  LIGHT_OFF
  TEMP_SET <temperature>
  STATUS
  QUIT
Enter command: LIGHT_ON
Server response: Lights turned on
Enter command: TEMP_SET 25
Server response: Temperature set to  2.50000E+01°C
Enter command: STATUS
Server response: Lights: On, Temperature:  2.50000E+01°C
Enter command: QUIT
```

This simple system demonstrates how distributed systems work in practice—multiple components working together to control a real-world system.

## Handling Multiple Clients Concurrently

Our current server can only handle one client at a time. Let's enhance it to handle multiple clients concurrently using Ada's tasking features.

### Step 1: Create a Task for Each Client

```ada
-- src/home_automation_server_concurrent.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Task_Identification; use Ada.Task_Identification;

procedure Home_Automation_Server_Concurrent is
   Socket : Socket_Type;
   Client_Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Light_State : Boolean := False;
   Temperature : Float := 22.0;
   
   task type Client_Handler (Socket : Socket_Type) is
      entry Start;
   end Client_Handler;
   
   task body Client_Handler is
      Buffer : String (1..1024);
      Length : Natural;
      Command : Unbounded_String;
   begin
      accept Start;
      loop
         Receive (Socket, Buffer, Length);
         Command := To_Unbounded_String (Buffer (1..Length));
         
         if Contains (Command, "LIGHT_ON") then
            Light_State := True;
            Send (Socket, "Lights turned on");
         elsif Contains (Command, "LIGHT_OFF") then
            Light_State := False;
            Send (Socket, "Lights turned off");
         elsif Contains (Command, "TEMP_SET") then
            declare
               Parts : array (1..2) of Unbounded_String;
               Index : Natural := 1;
               Start : Natural := 1;
               End_Index : Natural;
            begin
               for I in 1..Length loop
                  if Buffer(I) = ' ' then
                     Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                     Start := I + 1;
                     Index := Index + 1;
                  end if;
               end loop;
               Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
               
               declare
                  Temp : Float := Float (Value (To_String (Parts(2))));
               begin
                  if Temp < -20.0 or Temp > 50.0 then
                     Send (Socket, "Error: Temperature out of range");
                  else
                     Temperature := Temp;
                     Send (Socket, "Temperature set to " & Temperature'Image & "°C");
                  end if;
               exception
                  when others =>
                     Send (Socket, "Error: Invalid temperature");
               end;
            end;
         elsif Contains (Command, "STATUS") then
            declare
               Status : String := "Lights: " & (if Light_State then "On" else "Off") &
                                 ", Temperature: " & Temperature'Image & "°C";
            begin
               Send (Socket, Status);
            end;
         else
            Send (Socket, "Error: Unknown command");
         end if;
      end loop;
   end Client_Handler;
   
begin
   Create_Socket (Socket);
   Set_Socket_Option (Socket, Reuse_Address, True);
   Bind (Socket, Inet_Addr ("0.0.0.0"), 8080);
   Listen (Socket, 5);
   
   loop
      Accept (Socket, Client_Socket, Address);
      declare
         Handler : Client_Handler (Client_Socket);
      begin
         Handler.Start;
      end;
   end loop;
end Home_Automation_Server_Concurrent;
```

This server:
- Creates a new task for each client connection
- Handles multiple clients simultaneously
- Maintains shared state (light state and temperature) across clients

### Step 2: Test with Multiple Clients

Now you can run multiple client instances and interact with the server simultaneously:

```
Client 1:
Home Automation Client
Commands:
  LIGHT_ON
  LIGHT_OFF
  TEMP_SET <temperature>
  STATUS
  QUIT
Enter command: LIGHT_ON
Server response: Lights turned on
Enter command: STATUS
Server response: Lights: On, Temperature:  2.20000E+01°C

Client 2:
Home Automation Client
Commands:
  LIGHT_ON
  LIGHT_OFF
  TEMP_SET <temperature>
  STATUS
  QUIT
Enter command: TEMP_SET 25
Server response: Temperature set to  2.50000E+01°C
Enter command: STATUS
Server response: Lights: On, Temperature:  2.50000E+01°C
```

This demonstrates how distributed systems can handle multiple users simultaneously—a critical capability for real-world applications.

## Best Practices for Distributed Systems in Ada

Following best practices will make your distributed systems more reliable, maintainable, and scalable.

### Separating Concerns

Keep your networking code separate from your business logic. This makes your code easier to understand and maintain.

```ada
-- network_interface.ads
package Network_Interface is
   procedure Connect (Server_Address : String; Port : Natural);
   procedure Send_Command (Command : String);
   function Receive_Response return String;
   procedure Disconnect;
end Network_Interface;

-- home_automation_logic.ads
package Home_Automation_Logic is
   procedure Turn_Lights_On;
   procedure Turn_Lights_Off;
   procedure Set_Temperature (Temp : Float);
   function Get_Status return String;
end Home_Automation_Logic;
```

This separation:
- Makes networking code reusable across different applications
- Makes business logic easier to test
- Reduces complexity in both areas

### Error Handling

Always handle network errors gracefully. Never assume connections will always succeed.

```ada
-- src/error_handling.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Error_Handling is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
begin
   Create_Socket (Socket);
   
   begin
      Get_Host_By_Name ("localhost", Address);
      Connect (Socket, Address, 8080);
      
      -- Send commands...
      
   exception
      when Socket_Error =>
         Put_Line ("Error: Could not connect to server");
         -- Retry logic or fallback behavior
      when others =>
         Put_Line ("Unexpected error: " & Exception_Message);
         -- Log error and provide user feedback
   end;
   
   Close (Socket);
end Error_Handling;
```

Key error handling practices:
- Use specific exception handlers for different error types
- Provide clear feedback to users
- Implement retry logic for transient errors
- Log errors for debugging and monitoring

### Security Considerations

Even simple distributed systems need security considerations:

```ada
-- src/security.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Secure_Connection is
   Socket : Socket_Type;
   Address : Sock_Addr_Type;
begin
   Create_Socket (Socket);
   Get_Host_By_Name ("localhost", Address);
   
   -- Use secure port (not 8080)
   Connect (Socket, Address, 8443);
   
   -- Implement encryption for sensitive data
   -- (This would require additional libraries)
   
   -- Validate all inputs from clients
   -- (Prevent buffer overflows and injection attacks)
   
   Close (Socket);
end Secure_Connection;
```

Basic security practices:
- Use secure ports for sensitive communications
- Validate all inputs from clients
- Avoid sending sensitive information in plain text
- Implement authentication for privileged operations

### Scalability Considerations

As your system grows, consider scalability:

```ada
-- src/scalability.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;

procedure Scalable_System is
   Socket : Socket_Type;
   Client_Socket : Socket_Type;
   Address : Sock_Addr_Type;
   
   task type Worker is
      entry Start (Socket : Socket_Type);
   end Worker;
   
   task body Worker is
      Socket : Socket_Type;
   begin
      accept Start (S : Socket_Type) do
         Socket := S;
      end Start;
      
      -- Process client request
   end Worker;
   
begin
   Create_Socket (Socket);
   Set_Socket_Option (Socket, Reuse_Address, True);
   Bind (Socket, Inet_Addr ("0.0.0.0"), 8080);
   Listen (Socket, 5);
   
   loop
      Accept (Socket, Client_Socket, Address);
      declare
         Worker_Task : Worker;
      begin
         Worker_Task.Start (Client_Socket);
      end;
   end loop;
end Scalable_System;
```

Scalability practices:
- Use task pools for handling multiple clients
- Consider load balancing across multiple servers
- Use database storage for persistent data
- Implement caching for frequently accessed data

## Real-World Distributed Systems Examples

Let's explore practical examples of distributed systems built with Ada.

### Smart Home Controller

A smart home controller manages lights, temperature, and security across multiple rooms:

```ada
-- src/smart_home_controller.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;

procedure Smart_Home_Controller is
   Socket : Socket_Type;
   Client_Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Light_States : array (1..10) of Boolean := (others => False);
   Temperatures : array (1..10) of Float := (others => 22.0);
   Security_Armed : Boolean := False;
begin
   Create_Socket (Socket);
   Set_Socket_Option (Socket, Reuse_Address, True);
   Bind (Socket, Inet_Addr ("0.0.0.0"), 8080);
   Listen (Socket, 5);
   
   loop
      Accept (Socket, Client_Socket, Address);
      
      declare
         Buffer : String (1..1024);
         Length : Natural;
         Command : Unbounded_String;
      begin
         Receive (Client_Socket, Buffer, Length);
         Command := To_Unbounded_String (Buffer (1..Length));
         
         if Contains (Command, "LIGHT_ON") then
            declare
               Room : Natural := Value (To_String (Command));
            begin
               if Room >= 1 and Room <= 10 then
                  Light_States(Room) := True;
                  Send (Client_Socket, "Light turned on in room " & Room'Image);
               else
                  Send (Client_Socket, "Error: Invalid room number");
               end if;
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid room number");
            end;
         elsif Contains (Command, "TEMP_SET") then
            declare
               Parts : array (1..2) of Unbounded_String;
               Index : Natural := 1;
               Start : Natural := 1;
               End_Index : Natural;
            begin
               for I in 1..Length loop
                  if Buffer(I) = ' ' then
                     Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                     Start := I + 1;
                     Index := Index + 1;
                  end if;
               end loop;
               Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
               
               declare
                  Room : Natural := Value (To_String (Parts(1)));
                  Temp : Float := Float (Value (To_String (Parts(2))));
               begin
                  if Room >= 1 and Room <= 10 then
                     if Temp < -20.0 or Temp > 50.0 then
                        Send (Client_Socket, "Error: Temperature out of range");
                     else
                        Temperatures(Room) := Temp;
                        Send (Client_Socket, "Temperature set to " & Temp'Image & "°C in room " & Room'Image);
                     end if;
                  else
                     Send (Client_Socket, "Error: Invalid room number");
                  end if;
               exception
                  when others =>
                     Send (Client_Socket, "Error: Invalid input");
               end;
            end;
         elsif Contains (Command, "SECURITY_ARM") then
            Security_Armed := True;
            Send (Client_Socket, "Security system armed");
         elsif Contains (Command, "SECURITY_DISARM") then
            Security_Armed := False;
            Send (Client_Socket, "Security system disarmed");
         elsif Contains (Command, "STATUS") then
            declare
               Status : String := "Lights: ";
               for I in 1..10 loop
                  Status := Status & "Room " & I'Image & ": " & 
                           (if Light_States(I) then "On" else "Off") & ", ";
               end loop;
               Status := Status & "Temperatures: ";
               for I in 1..10 loop
                  Status := Status & "Room " & I'Image & ": " & Temperatures(I)'Image & "°C, ";
               end loop;
               Status := Status & "Security: " & (if Security_Armed then "Armed" else "Disarmed");
               
               Send (Client_Socket, Status);
            end;
         else
            Send (Client_Socket, "Error: Unknown command");
         end if;
      end;
      
      Close (Client_Socket);
   end loop;
end Smart_Home_Controller;
```

This system:
- Manages multiple rooms with individual light and temperature control
- Includes security system management
- Provides detailed status reports
- Handles invalid inputs gracefully

### Multiplayer Game Server

A simple multiplayer game server that tracks player positions:

```ada
-- src/multiplayer_game_server.adb
with GNAT.Sockets; use GNAT.Sockets;
with Ada.Text_IO; use Ada.Text_IO;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;

procedure Multiplayer_Game_Server is
   Socket : Socket_Type;
   Client_Socket : Socket_Type;
   Address : Sock_Addr_Type;
   Players : array (1..10) of record
      Name : String (1..20);
      X : Float;
      Y : Float;
   end record := (others => (Name => (others => ' '), X => 0.0, Y => 0.0));
   Player_Count : Natural := 0;
begin
   Create_Socket (Socket);
   Set_Socket_Option (Socket, Reuse_Address, True);
   Bind (Socket, Inet_Addr ("0.0.0.0"), 8080);
   Listen (Socket, 5);
   
   loop
      Accept (Socket, Client_Socket, Address);
      
      declare
         Buffer : String (1..1024);
         Length : Natural;
         Command : Unbounded_String;
      begin
         Receive (Client_Socket, Buffer, Length);
         Command := To_Unbounded_String (Buffer (1..Length));
         
         if Contains (Command, "JOIN") then
            declare
               Name : String (1..20) := (others => ' ');
               Index : Natural := 6;
               Name_Length : Natural := 0;
            begin
               for I in 6..Length loop
                  if Buffer(I) = ' ' then
                     exit;
                  end if;
                  Name(Index) := Buffer(I);
                  Name_Length := Name_Length + 1;
                  Index := Index + 1;
               end loop;
               
               if Player_Count < 10 then
                  Player_Count := Player_Count + 1;
                  Players(Player_Count).Name := Name(1..Name_Length);
                  Players(Player_Count).X := 0.0;
                  Players(Player_Count).Y := 0.0;
                  Send (Client_Socket, "Joined as player " & Player_Count'Image);
               else
                  Send (Client_Socket, "Error: Server full");
               end if;
            exception
               when others =>
                  Send (Client_Socket, "Error: Invalid join command");
            end;
         elsif Contains (Command, "MOVE") then
            declare
               Parts : array (1..3) of Unbounded_String;
               Index : Natural := 1;
               Start : Natural := 6;
               End_Index : Natural;
            begin
               for I in 6..Length loop
                  if Buffer(I) = ' ' then
                     Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
                     Start := I + 1;
                     Index := Index + 1;
                  end if;
               end loop;
               Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
               
               declare
                  Player : Natural := Value (To_String (Parts(1)));
                  X : Float := Float (Value (To_String (Parts(2))));
                  Y : Float := Float (Value (To_String (Parts(3)));
               begin
                  if Player >= 1 and Player <= Player_Count then
                     Players(Player).X := X;
                     Players(Player).Y := Y;
                     Send (Client_Socket, "Position updated");
                  else
                     Send (Client_Socket, "Error: Invalid player");
                  end if;
               exception
                  when others =>
                     Send (Client_Socket, "Error: Invalid move command");
               end;
            end;
         elsif Contains (Command, "STATUS") then
            declare
               Status : String := "Players: ";
               for I in 1..Player_Count loop
                  Status := Status & Players(I).Name & " at (" & 
                           Players(I).X'Image & ", " & Players(I).Y'Image & "), ";
               end loop;
               
               Send (Client_Socket, Status);
            end;
         else
            Send (Client_Socket, "Error: Unknown command");
         end if;
      end;
      
      Close (Client_Socket);
   end loop;
end Multiplayer_Game_Server;
```

This system:
- Manages multiple players in a game
- Tracks player positions
- Handles join and movement commands
- Provides status reports

## Exercises for Readers

Now it's time to put your knowledge into practice with some hands-on exercises.

### Exercise 1: Distributed Calculator with Tasking

Create a distributed calculator system that:
- Uses Ada tasking to handle multiple clients concurrently
- Supports basic arithmetic operations (+, -, ×, ÷)
- Handles division by zero errors
- Times out after 5 seconds of inactivity

> **Challenge**: Add support for more complex operations like square root and exponentiation.

#### Solution Guidance

Start by creating a task type for handling client connections:

```ada
task type Client_Handler (Socket : Socket_Type) is
   entry Start;
end Client_Handler;

task body Client_Handler is
   Buffer : String (1..1024);
   Length : Natural;
   Command : Unbounded_String;
begin
   accept Start;
   loop
      Receive (Socket, Buffer, Length);
      Command := To_Unbounded_String (Buffer (1..Length));
      
      -- Process command
      -- Send response
   end loop;
end Client_Handler;
```

Then create a server that accepts connections and starts new handlers:

```ada
loop
   Accept (Socket, Client_Socket, Address);
   declare
      Handler : Client_Handler (Client_Socket);
   begin
      Handler.Start;
   end;
end loop;
```

Implement error handling for division by zero and invalid inputs. Add a timeout mechanism using Ada's `delay` statement.

### Exercise 2: Distributed Home Automation System

Create a distributed home automation system that:
- Controls multiple rooms with lights and temperature
- Tracks security system status
- Handles multiple clients simultaneously
- Provides detailed status reports

> **Challenge**: Add support for scheduling (e.g., "Turn on lights at 6 PM").

#### Solution Guidance

Start by creating data structures for your home state:

```ada
type Room_State is record
   Light : Boolean := False;
   Temperature : Float := 22.0;
end record;

type Home_State is array (1..10) of Room_State;
```

Then create a server that processes commands to modify this state:

```ada
if Contains (Command, "LIGHT_ON") then
   declare
      Room : Natural := Value (To_String (Command));
   begin
      if Room >= 1 and Room <= 10 then
         Home_State(Room).Light := True;
         Send (Client_Socket, "Light turned on in room " & Room'Image);
      else
         Send (Client_Socket, "Error: Invalid room number");
      end if;
   exception
      when others =>
         Send (Client_Socket, "Error: Invalid room number");
   end;
end if;
```

Implement a status command that returns the current state of all rooms.

### Exercise 3: Multiplayer Game Server

Create a multiplayer game server that:
- Tracks player positions in a 2D world
- Handles player movement commands
- Provides status reports of all players
- Handles player joins and leaves

> **Challenge**: Add collision detection to prevent players from moving through walls.

#### Solution Guidance

Start by defining player data structures:

```ada
type Player is record
   Name : String (1..20);
   X : Float;
   Y : Float;
end record;

type Player_Array is array (1..10) of Player;
Players : Player_Array := (others => (Name => (others => ' '), X => 0.0, Y => 0.0));
Player_Count : Natural := 0;
```

Then implement movement commands:

```ada
if Contains (Command, "MOVE") then
   declare
      Parts : array (1..3) of Unbounded_String;
      Index : Natural := 1;
      Start : Natural := 6;
      End_Index : Natural;
   begin
      for I in 6..Length loop
         if Buffer(I) = ' ' then
            Parts(Index) := To_Unbounded_String (Buffer (Start..I-1));
            Start := I + 1;
            Index := Index + 1;
         end if;
      end loop;
      Parts(Index) := To_Unbounded_String (Buffer (Start..Length));
      
      declare
         Player : Natural := Value (To_String (Parts(1)));
         X : Float := Float (Value (To_String (Parts(2)));
         Y : Float := Float (Value (To_String (Parts(3)));
      begin
         if Player >= 1 and Player <= Player_Count then
            Players(Player).X := X;
            Players(Player).Y := Y;
            Send (Client_Socket, "Position updated");
         else
            Send (Client_Socket, "Error: Invalid player");
         end if;
      exception
         when others =>
            Send (Client_Socket, "Error: Invalid move command");
      end;
   end;
end if;
```

Implement collision detection by checking new positions against predefined walls.

## Next Steps for Distributed Systems in Ada

Now that you've learned the basics of distributed systems in Ada, here's how to continue your journey.

### Explore Advanced Networking Features

- **UDP for real-time applications**: Faster communication for games and streaming
- **HTTP for web services**: Create RESTful APIs for web integration
- **WebSockets for bidirectional communication**: Real-time updates for chat applications
- **Encryption for secure communication**: Protect sensitive data with SSL/TLS

### Integrate with Other Ada Features

- **Tasking for concurrent operations**: Handle multiple clients efficiently
- **Exception handling for robustness**: Gracefully handle network failures
- **Strong typing for reliability**: Prevent data corruption and invalid inputs
- **Distributed Systems Annex**: Advanced features for large-scale systems

### Join the Ada Community

The Ada community is active and supportive. Join:
- **AdaCore Forums**: For technical support and discussions
- **GitHub Repositories**: For open-source Ada projects
- **Ada mailing lists**: For discussions and questions
- **Ada conferences**: Events like Ada Europe

### Build Real-World Applications

Start with small projects and gradually build more complex applications:
- A chat application for friends
- A weather data collection system
- A simple online store
- A distributed sensor network

## Conclusion: The Power of Distributed Systems in Ada

> "Distributed systems aren't just for aerospace engineers—they're the backbone of everyday applications like smart homes, online games, and cloud services. Ada's reliability features make it an excellent choice for building distributed systems that are both robust and maintainable."

Distributed systems are fundamental to modern technology, but they're often invisible to end users. Ada provides powerful tools to build these systems safely and reliably, without requiring specialized knowledge of safety-critical domains.

You've learned how to:
- Set up your development environment for networking
- Create client-server applications using TCP/IP
- Handle network errors and failures
- Build distributed systems that handle multiple clients concurrently
- Follow best practices for reliability and maintainability

Ada's strengths in reliability and maintainability make it an excellent choice for distributed systems. Your applications will be less prone to crashes and security vulnerabilities, and easier to maintain and extend over time.

For everyday applications, these benefits translate directly to better user experiences. A smart home system that works reliably builds trust with users. A multiplayer game that handles many players smoothly provides a better experience. Distributed systems with Ada give you the tools to create professional-looking applications with confidence.

As you continue your journey with Ada, remember that distributed systems are about solving real problems for real people. Start with simple projects and gradually build more complex applications as you gain confidence. Use the tools and resources available in the Ada community, and don't be afraid to ask for help when you need it.
