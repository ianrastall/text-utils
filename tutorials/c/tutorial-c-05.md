# 5. File I/O and Advanced String Handling in C

## 5.1 The Bridge Between Memory and Persistence

In the previous chapters, we've explored how data is represented and manipulated within a program's memory space. However, the true power of computing lies not just in processing data, but in preserving it beyond the lifespan of a single program execution. This is where **file input/output (I/O)** becomes essential. File I/O provides the critical bridge between volatile memory (RAM) and persistent storage (disks, SSDs, etc.), enabling programs to:

*   Save state between executions
*   Process large datasets that exceed available memory
*   Exchange information with other programs and systems
*   Create permanent records of computational results
*   Implement configuration and data storage mechanisms

Similarly, while Chapter 2 introduced basic string handling, real-world programming demands more sophisticated text manipulation capabilities. **Advanced string handling** techniques are indispensable for parsing structured data, processing user input safely, generating formatted output, and implementing complex text-based algorithms.

> **"File I/O transforms programs from transient calculations into enduring tools. Without it, computing would be limited to ephemeral operations with no lasting impact—a calculator that forgets its results as soon as you press clear."**

Understanding file I/O and advanced string handling is critical because:
*   They form the foundation for data persistence and interchange
*   They enable interaction with the broader computing ecosystem
*   They are essential for implementing robust configuration and data storage
*   They provide the mechanisms for processing structured text formats (CSV, JSON, XML)
*   They are fundamental to implementing logging, debugging, and diagnostics

This chapter explores both topics in depth, starting with the fundamentals of file operations and progressing to advanced techniques for handling both binary and text data. We'll examine the C standard library's file handling capabilities, delve into sophisticated string manipulation functions, and explore practical applications that combine these techniques to solve real-world problems.

## 5.2 The C File Model: Streams and Buffers

Before diving into specific functions, it's essential to understand C's conceptual model for file handling. Unlike lower-level system calls that deal with raw file descriptors, C provides an abstraction layer through **streams**.

### 5.2.1 Streams: The Abstraction Layer

In C, all file operations are performed through **streams**, which are high-level abstractions that hide the complexities of different storage media and operating system interfaces.

**Key Characteristics of Streams:**
*   **Uniform Interface:** The same functions work for files, terminals, pipes, and other I/O devices
*   **Buffering:** Streams typically buffer data to minimize expensive system calls
*   **Directionality:** Streams can be input-only, output-only, or bidirectional
*   **Position Tracking:** Each stream maintains a current position within the data

**Three Standard Streams:**
C automatically opens three standard streams when a program starts:

| **Stream** | **File Pointer** | **Purpose**                                      | **Typical Destination** |
| :--------- | :--------------- | :----------------------------------------------- | :---------------------- |
| **Standard Input** | **`stdin`**      | **Program input**                                | **Keyboard**            |
| **Standard Output** | **`stdout`**     | **Normal program output**                        | **Terminal screen**     |
| **Standard Error** | **`stderr`**     | **Error messages and diagnostics**               | **Terminal screen**     |

These streams are declared in `<stdio.h>` and are available without explicit opening.

**Why Buffering Matters:**
Without buffering, each character-level I/O operation would require a system call, which is computationally expensive. Buffering allows multiple operations to be batched together:

*   **Fully Buffered:** Data is transferred only when the buffer fills (typical for files)
*   **Line Buffered:** Data is transferred when a newline is encountered (typical for terminals)
*   **Unbuffered:** Data is transferred immediately (rare, but possible with `setbuf`/`setvbuf`)

You can control buffering with functions like `setvbuf`:
```c
FILE *fp = fopen("data.txt", "w");
setvbuf(fp, NULL, _IOFBF, 4096); // Set 4KB full buffering
```

### 5.2.2 The `FILE` Structure

At the heart of C's stream model is the `FILE` structure, defined in `<stdio.h>`. This structure contains all the information needed to manage a stream:

*   Buffer pointers and size
*   Current position in the stream
*   Error and end-of-file indicators
*   File descriptor (for underlying system interface)
*   Buffering information
*   Mode flags (read/write/append, etc.)

While the exact definition is implementation-specific, you interact with `FILE` through a pointer (`FILE *`). You never manipulate the structure directly—only through standard library functions.

**Key Insight:** The `FILE *` is your handle to the stream. All file operations require this pointer, which the standard library functions use to access the underlying `FILE` structure.

### 5.2.3 Text vs. Binary Streams

C distinguishes between **text streams** and **binary streams**, which affects how data is processed:

| **Characteristic** | **Text Stream**                                  | **Binary Stream**                               |
| :----------------- | :----------------------------------------------- | :---------------------------------------------- |
| **Purpose**        | **Human-readable text**                          | **Raw binary data**                             |
| **Mode Specifier** | **No 'b' in fopen mode (e.g., "r", "w")**        | **'b' in fopen mode (e.g., "rb", "wb")**        |
| **Line Endings**   | **Translated (e.g., LF ↔ CR/LF)**                | **Preserved exactly**                           |
| **EOF Handling**   | **Special character translation**                | **No special handling**                         |
| **Portability**    | **Less portable across OSes**                    | **More portable**                               |
| **Use Cases**      | **Configuration files, logs, user-readable data** | **Images, executables, serialized data**        |

**Critical Note:** On Unix-like systems (Linux, macOS), there is no difference between text and binary streams. However, on Windows, the distinction is significant due to different line ending conventions (CR/LF vs. LF). Always use binary mode (`"rb"`, `"wb"`) when working with non-text data to ensure portability.

## 5.3 Basic File Operations

### 5.3.1 Opening and Closing Files

#### `fopen` - Opening a File Stream

The `fopen` function establishes a connection between a program and a file, creating a stream for I/O operations.

**Function Signature:**
```c
FILE *fopen(const char *filename, const char *mode);
```

**Common Mode Strings:**

| **Mode** | **Description**                                | **File Must Exist** | **Read/Write** | **Position**          |
| :------- | :--------------------------------------------- | :------------------ | :------------- | :-------------------- |
| **`"r"`**  | **Read text**                                  | **Yes**             | **Read-only**  | **Beginning**         |
| **`"w"`**  | **Write text (truncate/create)**               | **No**              | **Write-only** | **Beginning**         |
| **`"a"`**  | **Append text (create if needed)**             | **No**              | **Write-only** | **End**               |
| **`"r+"`** | **Read/write text**                            | **Yes**             | **Both**       | **Beginning**         |
| **`"w+"`** | **Read/write text (truncate/create)**          | **No**              | **Both**       | **Beginning**         |
| **`"a+"`** | **Read/append text (create if needed)**        | **No**              | **Both**       | **End (read at beg)** |
| **`"rb"`, `"wb"`, etc.** | **Binary mode variants**             | **Same as above**   | **Same**       | **Same**              |

**Examples:**
```c
// Open for reading
FILE *input = fopen("data.txt", "r");
if (input == NULL) {
    perror("Error opening input file");
    // Handle error
}

// Open for writing (create or truncate)
FILE *output = fopen("results.txt", "w");
if (output == NULL) {
    fprintf(stderr, "Error opening output file: %s\n", strerror(errno));
    // Handle error
}

// Open for reading and writing (must exist)
FILE *update = fopen("database.dat", "r+");
```

**Error Handling Best Practices:**
*   Always check the return value of `fopen` for `NULL`
*   Use `perror` or `strerror` to get human-readable error messages
*   Consider the specific error condition (file not found vs. permission denied)
*   Clean up resources and exit gracefully when errors occur

#### `fclose` - Closing a File Stream

The `fclose` function terminates the connection between a program and a file stream, flushing any buffered data and releasing system resources.

**Function Signature:**
```c
int fclose(FILE *stream);
```

**Return Value:**
*   `0` on success
*   `EOF` (typically -1) on error

**Example:**
```c
if (fclose(output) == EOF) {
    perror("Error closing file");
    // Handle error (though little can be done at this point)
}
```

**Important Considerations:**
*   Always close files when finished with them to prevent resource leaks
*   Closing a stream flushes any buffered output
*   Failure to close a file properly can result in lost data
*   Closing a stream multiple times causes undefined behavior

**Best Practice Pattern:**
```c
FILE *fp = fopen(filename, "r");
if (fp == NULL) {
    // Handle error
    return;
}

// Perform operations...

if (fclose(fp) == EOF) {
    // Log error but continue (data might already be processed)
    fprintf(stderr, "Warning: Error closing file %s\n", filename);
}
```

### 5.3.2 Reading from Files

#### Character-Oriented Input

**`fgetc` - Read a Single Character**
```c
int fgetc(FILE *stream);
```
*   Returns the next character as an `int` (to accommodate `EOF`)
*   Returns `EOF` on end-of-file or error
*   Increments the file position

**Example:**
```c
int c;
while ((c = fgetc(input)) != EOF) {
    putchar(c); // Echo to stdout
}
```

**`fgets` - Read a Line of Text**
```c
char *fgets(char *str, int size, FILE *stream);
```
*   Reads up to `size-1` characters into `str`
*   Includes newline character if it fits
*   Always null-terminates the string
*   Returns `str` on success, `NULL` on error or EOF

**Example:**
```c
char line[256];
while (fgets(line, sizeof(line), input) != NULL) {
    // Process line
    printf("Read line: %s", line);
}
```

#### Formatted Input

**`fscanf` - Formatted Input**
```c
int fscanf(FILE *stream, const char *format, ...);
```
*   Reads and parses input according to format string
*   Returns number of successfully assigned items
*   Returns `EOF` if input failure occurs before any assignment

**Example:**
```c
int id;
char name[50];
float score;

int result = fscanf(input, "%d %49s %f", &id, name, &score);
if (result == 3) {
    printf("ID: %d, Name: %s, Score: %.2f\n", id, name, score);
} else if (result != EOF) {
    printf("Warning: Only %d items read\n", result);
}
```

**Format String Warnings:**
*   `%s` reads until whitespace—use width specifier (`%49s`) to prevent buffer overflow
*   `%[...]` scanset can read specific character sets
*   Leading whitespace in format string matches any amount of whitespace in input

#### Binary Input

**`fread` - Read Binary Data**
```c
size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream);
```
*   Reads `nmemb` items of `size` bytes each into `ptr`
*   Returns number of items successfully read (may be less than requested)
*   Useful for reading structured data or arrays

**Example:**
```c
struct Record {
    int id;
    float value;
    char name[20];
};

struct Record records[100];
size_t items_read = fread(records, sizeof(struct Record), 100, input);
printf("Read %zu records\n", items_read);
```

### 5.3.3 Writing to Files

#### Character-Oriented Output

**`fputc` - Write a Single Character**
```c
int fputc(int c, FILE *stream);
```
*   Writes character `c` to stream
*   Returns character written, or `EOF` on error

**Example:**
```c
for (char c = 'A'; c <= 'Z'; c++) {
    fputc(c, output);
}
```

**`fputs` - Write a String**
```c
int fputs(const char *str, FILE *stream);
```
*   Writes string `str` to stream (without null terminator)
*   Returns non-negative on success, `EOF` on error
*   Does not append newline (unlike `puts`)

**Example:**
```c
fputs("Hello, World!\n", output);
```

#### Formatted Output

**`fprintf` - Formatted Output**
```c
int fprintf(FILE *stream, const char *format, ...);
```
*   Writes formatted output to stream
*   Returns number of characters written, or negative on error

**Example:**
```c
fprintf(output, "ID: %d, Name: %-20s, Value: %.2f\n", id, name, value);
```

#### Binary Output

**`fwrite` - Write Binary Data**
```c
size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream);
```
*   Writes `nmemb` items of `size` bytes each from `ptr`
*   Returns number of items successfully written

**Example:**
```c
struct Record records[50] = { /* initialized data */ };
size_t items_written = fwrite(records, sizeof(struct Record), 50, output);
```

#### Buffer Management

**`fflush` - Flush Output Buffer**
```c
int fflush(FILE *stream);
```
*   Forces buffered output to be written to the file
*   Returns `0` on success, `EOF` on error
*   Only meaningful for output streams

**Use Cases:**
*   After important operations to ensure data isn't lost on crash
*   Before user prompts to ensure messages appear immediately
*   When implementing transactional behavior

**Example:**
```c
fprintf(output, "Processing step 1 complete\n");
fflush(output); // Ensure message appears immediately
```

**Important Note:** `fflush` should not be used on input streams (behavior is undefined in standard C, though some implementations support it).

## 5.4 File Positioning and Manipulation

### 5.4.1 Seeking Within Files

Precise control over file position is essential for random access to file content.

#### `fseek` - Set File Position

```c
int fseek(FILE *stream, long offset, int whence);
```

*   Sets the file position indicator for `stream`
*   Returns `0` on success, non-zero on error
*   `offset` is relative to position specified by `whence`:
    *   `SEEK_SET`: Beginning of file
    *   `SEEK_CUR`: Current position
    *   `SEEK_END`: End of file

**Examples:**
```c
// Go to beginning of file
fseek(fp, 0L, SEEK_SET);

// Skip 100 bytes from current position
fseek(fp, 100L, SEEK_CUR);

// Go to 10 bytes before end of file
fseek(fp, -10L, SEEK_END);
```

**Important Considerations:**
*   For text streams, `offset` must be `0` or a value returned by `ftell`
*   Binary streams allow arbitrary offsets
*   On error, file position is indeterminate

#### `ftell` - Get Current File Position

```c
long ftell(FILE *stream);
```

*   Returns current file position as an offset from beginning
*   Returns `-1L` on error

**Example:**
```c
long pos = ftell(fp);
if (pos == -1L) {
    perror("ftell failed");
} else {
    printf("Current position: %ld\n", pos);
}
```

#### `rewind` - Reset to Beginning

```c
void rewind(FILE *stream);
```

*   Equivalent to `fseek(stream, 0L, SEEK_SET)`
*   Also clears error and end-of-file indicators
*   No return value (cannot directly detect errors)

**Example:**
```c
rewind(fp); // Reset to beginning, clear indicators
```

### 5.4.2 Temporary Files

Temporary files provide a mechanism for creating files that are automatically cleaned up.

#### `tmpfile` - Create Temporary File

```c
FILE *tmpfile(void);
```

*   Creates a temporary binary file open for update (`"w+b"`)
*   File is automatically removed when closed or program terminates
*   Returns `FILE *` on success, `NULL` on error

**Example:**
```c
FILE *temp = tmpfile();
if (temp == NULL) {
    perror("Failed to create temporary file");
    return;
}

// Use temporary file...
fprintf(temp, "Temporary data\n");
rewind(temp);

char buffer[100];
if (fgets(buffer, sizeof(buffer), temp) != NULL) {
    printf("Read from temp: %s", buffer);
}
```

#### `tmpnam` - Generate Temporary Filename

```c
char *tmpnam(char *str);
```

*   Generates a unique temporary filename
*   If `str` is `NULL`, uses internal static buffer (not thread-safe)
*   If `str` is not `NULL`, stores result there (must be `L_tmpnam` chars)

**Example:**
```c
char filename[L_tmpnam];
if (tmpnam(filename) == NULL) {
    perror("Failed to generate temp filename");
    return;
}

FILE *temp = fopen(filename, "w+");
if (temp == NULL) {
    perror("Failed to open temp file");
    return;
}

// Use the file...
unlink(filename); // Delete when done (POSIX)
fclose(temp);
```

**Best Practices for Temporary Files:**
*   Use `tmpfile` when possible (automatic cleanup)
*   If using `tmpnam`, ensure filename is secure (use `mkstemp` on POSIX)
*   Always delete temporary files when no longer needed
*   Consider security implications (race conditions in filename generation)

## 5.5 Advanced File Operations

### 5.5.1 File Status and Properties

Understanding file properties is essential for robust file handling.

#### `stat` - Get File Status (POSIX)

```c
int stat(const char *path, struct stat *buf);
```

*   Fills `buf` with information about file at `path`
*   Returns `0` on success, `-1` on error

**Common `struct stat` Members:**

| **Member**          | **Description**                                |
| :------------------ | :--------------------------------------------- |
| **`st_dev`**        | **ID of device containing file**               |
| **`st_ino`**        | **Inode number**                               |
| **`st_mode`**       | **File type and mode (permissions)**           |
| **`st_nlink`**      | **Number of hard links**                       |
| **`st_uid`**        | **User ID of owner**                           |
| **`st_gid`**        | **Group ID of owner**                          |
| **`st_size`**       | **Total size, in bytes**                       |
| **`st_atime`**      | **Time of last access**                        |
| **`st_mtime`**      | **Time of last modification**                  |
| **`st_ctime`**      | **Time of last status change**                 |

**Example:**
```c
#include <sys/stat.h>
#include <time.h>

struct stat file_info;
if (stat("data.txt", &file_info) == -1) {
    perror("stat failed");
    return;
}

printf("File size: %lld bytes\n", (long long)file_info.st_size);
printf("Last modified: %s", ctime(&file_info.st_mtime));

// Check if it's a regular file
if (S_ISREG(file_info.st_mode)) {
    printf("This is a regular file\n");
}
```

#### `fstat` - Get File Status from File Descriptor

```c
int fstat(int fd, struct stat *buf);
```

*   Same as `stat`, but operates on an open file descriptor
*   Useful when you already have a file open

**Example:**
```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("fopen failed");
    return;
}

int fd = fileno(fp); // Get file descriptor from FILE*
struct stat file_info;
if (fstat(fd, &file_info) == -1) {
    perror("fstat failed");
    fclose(fp);
    return;
}

// Process file_info...
fclose(fp);
```

### 5.5.2 File Permissions (POSIX)

File permissions control access to files and directories.

#### `chmod` - Change File Permissions

```c
int chmod(const char *path, mode_t mode);
```

*   Changes permissions of file at `path` to `mode`
*   Returns `0` on success, `-1` on error

**Permission Bits:**

| **Symbolic** | **Octal** | **Description**              |
| :----------- | :-------- | :--------------------------- |
| **`S_IRUSR`** | **0400**  | **User read permission**     |
| **`S_IWUSR`** | **0200**  | **User write permission**    |
| **`S_IXUSR`** | **0100**  | **User execute permission**  |
| **`S_IRGRP`** | **0040**  | **Group read permission**    |
| **`S_IWGRP`** | **0020**  | **Group write permission**   |
| **`S_IXGRP`** | **0010**  | **Group execute permission** |
| **`S_IROTH`** | **0004**  | **Other read permission**    |
| **`S_IWOTH`** | **0002**  | **Other write permission**   |
| **`S_IXOTH`** | **0001**  | **Other execute permission** |

**Example:**
```c
// Set permissions to user read/write, group read
if (chmod("data.txt", S_IRUSR | S_IWUSR | S_IRGRP) == -1) {
    perror("chmod failed");
}
```

#### `access` - Check File Accessibility

```c
int access(const char *path, int mode);
```

*   Checks if calling process can access file per `mode`
*   `mode` can be `R_OK`, `W_OK`, `X_OK`, `F_OK`
*   Returns `0` if accessible, `-1` if not

**Example:**
```c
if (access("config.cfg", R_OK) == 0) {
    printf("Config file is readable\n");
} else {
    perror("Config file not accessible");
}
```

**Important Security Note:** There's a potential race condition between `access` and subsequent file operations. It's generally safer to attempt the operation and handle errors than to check first.

### 5.5.3 Working with Directories

Directory operations allow programs to navigate the file system.

#### `opendir`, `readdir`, `closedir` (POSIX)

```c
DIR *opendir(const char *name);
struct dirent *readdir(DIR *dirp);
int closedir(DIR *dirp);
```

*   `opendir`: Opens a directory stream
*   `readdir`: Reads next directory entry
*   `closedir`: Closes directory stream

**`struct dirent` Members:**
*   `d_name`: Null-terminated filename
*   `d_ino`: File inode number (may not be present on all systems)

**Example: List Directory Contents**
```c
#include <dirent.h>

void list_directory(const char *path) {
    DIR *dir = opendir(path);
    if (dir == NULL) {
        perror("opendir failed");
        return;
    }
    
    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        // Skip . and ..
        if (strcmp(entry->d_name, ".") == 0 || 
            strcmp(entry->d_name, "..") == 0) {
            continue;
        }
        printf("%s\n", entry->d_name);
    }
    
    closedir(dir);
}
```

**Cross-Platform Note:** Windows uses different APIs (`FindFirstFile`, `FindNextFile`). Consider using a cross-platform library like dirent.h for Windows or higher-level abstractions.

## 5.6 Advanced String Handling

### 5.6.1 String Conversion Functions

Converting between strings and numeric values is a common requirement.

#### Integer Conversions

**`atoi` - ASCII to Integer**
```c
int atoi(const char *nptr);
```
*   Converts string to `int`
*   **No error handling** - returns 0 for invalid input
*   **Generally discouraged** in favor of `strtol`

**`strtol` - String to Long**
```c
long strtol(const char *nptr, char **endptr, int base);
```
*   Converts string to `long`
*   `endptr` receives pointer to first invalid character
*   `base` specifies number base (2-36, or 0 for auto-detection)
*   Sets `errno` on overflow/underflow

**Example:**
```c
char *str = "1234abc";
char *endptr;
long value = strtol(str, &endptr, 10);

if (endptr == str) {
    printf("No digits found\n");
} else if (*endptr != '\0') {
    printf("Partial conversion: %ld, remaining: '%s'\n", value, endptr);
} else {
    printf("Complete conversion: %ld\n", value);
}

// Handle overflow
errno = 0;
value = strtol("9999999999999999999999999", &endptr, 10);
if (errno == ERANGE) {
    printf("Overflow occurred\n");
}
```

#### Floating-Point Conversions

**`atof` - ASCII to Float**
```c
double atof(const char *nptr);
```
*   Converts string to `double`
*   **No error handling** - returns 0.0 for invalid input
*   **Generally discouraged** in favor of `strtod`

**`strtod` - String to Double**
```c
double strtod(const char *nptr, char **endptr);
```
*   Converts string to `double`
*   Similar error handling to `strtol`

**Example:**
```c
char *str = "3.14159 is pi";
char *endptr;
double value = strtod(str, &endptr);

printf("Value: %f\n", value);
if (*endptr) {
    printf("Remaining string: '%s'\n", endptr);
}
```

#### Safe Conversion Pattern

```c
int safe_atoi(const char *str, int *out) {
    char *endptr;
    long value;
    
    // Reset errno before call
    errno = 0;
    value = strtol(str, &endptr, 10);
    
    // Check for conversion errors
    if (errno == ERANGE || value > INT_MAX || value < INT_MIN) {
        return 0; // Out of int range
    }
    
    // Check for no conversion or extra characters
    if (endptr == str || *endptr != '\0') {
        return 0; // Invalid input
    }
    
    *out = (int)value;
    return 1; // Success
}
```

### 5.6.2 String Formatting

Advanced string formatting techniques provide powerful ways to generate text.

#### `sprintf` and `snprintf`

**`sprintf` - String Print**
```c
int sprintf(char *str, const char *format, ...);
```
*   Writes formatted string to `str`
*   **No buffer size check** - prone to buffer overflow
*   **Generally discouraged** in favor of `snprintf`

**`snprintf` - Safe String Print**
```c
int snprintf(char *str, size_t size, const char *format, ...);
```
*   Writes at most `size-1` characters to `str`
*   Always null-terminates the result
*   Returns number of characters that **would have been written**
*   **Preferred for all string formatting**

**Example:**
```c
char buffer[50];
int ret = snprintf(buffer, sizeof(buffer), 
                  "Value: %d, String: %s", 42, "Hello");
                  
if (ret < 0) {
    // Encoding error
} else if (ret >= sizeof(buffer)) {
    // Truncation occurred
    printf("Warning: String was truncated\n");
} else {
    printf("Successfully formatted string: %s\n", buffer);
}
```

#### Format String Vulnerabilities

Format string vulnerabilities occur when user input is used directly as the format string:

```c
// DANGEROUS - user_input could contain format specifiers
printf(user_input);

// SAFE - always use a static format string
printf("%s", user_input);
```

**Consequences of Format String Vulnerabilities:**
*   Program crashes (segmentation faults)
*   Information disclosure (reading stack memory)
*   Arbitrary memory writes (in severe cases)
*   Complete program compromise

**Best Practice:** Always use a static format string and pass user input as an argument:

```c
// Good practice
printf("%s", user_input);
```

### 5.6.3 String Tokenization

Splitting strings into meaningful tokens is a common text processing task.

#### `strtok` - String Tokenizer

```c
char *strtok(char *str, const char *delim);
```
*   Splits `str` into tokens separated by characters in `delim`
*   First call: `strtok(str, delim)` - initializes and returns first token
*   Subsequent calls: `strtok(NULL, delim)` - continues tokenizing
*   **Modifies the original string** (replaces delimiters with nulls)
*   **Not thread-safe** (uses internal static state)

**Example:**
```c
char input[] = "apple,banana,cherry;date";
char *token = strtok(input, ",;");

while (token != NULL) {
    printf("Token: %s\n", token);
    token = strtok(NULL, ",;");
}
```

#### `strtok_r` - Reentrant String Tokenizer (POSIX)

```c
char *strtok_r(char *str, const char *delim, char **saveptr);
```
*   Thread-safe version of `strtok`
*   `saveptr` maintains tokenizer state between calls
*   Required for multi-threaded programs

**Example:**
```c
char input1[] = "apple,banana,cherry";
char input2[] = "dog,cat,bird";

char *saveptr1, *saveptr2;
char *token1 = strtok_r(input1, ",", &saveptr1);
char *token2 = strtok_r(input2, ",", &saveptr2);

while (token1 || token2) {
    if (token1) {
        printf("Input1: %s\n", token1);
        token1 = strtok_r(NULL, ",", &saveptr1);
    }
    
    if (token2) {
        printf("Input2: %s\n", token2);
        token2 = strtok_r(NULL, ",", &saveptr2);
    }
}
```

#### Advanced Tokenization Techniques

**Using `strcspn` and `strspn` for Custom Tokenization:**

```c
char *custom_tokenize(char *str, const char *delim, char **saveptr) {
    if (str != NULL) {
        *saveptr = str;
    }
    
    if (*saveptr == NULL || **saveptr == '\0') {
        return NULL; // End of string
    }
    
    // Skip leading delimiters
    size_t skip = strspn(*saveptr, delim);
    *saveptr += skip;
    if (**saveptr == '\0') {
        *saveptr = NULL;
        return NULL;
    }
    
    // Find end of token
    size_t len = strcspn(*saveptr, delim);
    char *token = *saveptr;
    
    // Terminate token and advance saveptr
    if ((*saveptr)[len] != '\0') {
        (*saveptr)[len] = '\0';
        *saveptr += len + 1;
    } else {
        *saveptr = NULL;
    }
    
    return token;
}
```

### 5.6.4 String Search and Manipulation

Advanced string functions enable sophisticated text processing.

#### Search Functions

**`strchr` and `strrchr` - Character Search**
```c
char *strchr(const char *str, int c);
char *strrchr(const char *str, int c);
```
*   `strchr`: Finds first occurrence of `c` in `str`
*   `strrchr`: Finds last occurrence of `c` in `str`
*   Returns pointer to character, or `NULL` if not found

**Example:**
```c
char *path = "/usr/local/bin/gcc";
char *filename = strrchr(path, '/');
if (filename) {
    printf("Filename: %s\n", filename + 1); // "gcc"
}
```

**`strstr` - Substring Search**
```c
char *strstr(const char *haystack, const char *needle);
```
*   Finds first occurrence of `needle` in `haystack`
*   Returns pointer to beginning of substring, or `NULL` if not found

**Example:**
```c
char *text = "The quick brown fox";
char *pos = strstr(text, "brown");
if (pos) {
    printf("Found at position %ld\n", pos - text); // 10
}
```

#### Span Functions

**`strspn` and `strcspn` - Character Span**
```c
size_t strspn(const char *str, const char *accept);
size_t strcspn(const char *str, const char *reject);
```
*   `strspn`: Returns length of initial segment consisting entirely of characters from `accept`
*   `strcspn`: Returns length of initial segment consisting entirely of characters not in `reject`

**Example:**
```c
char *str = "123abc456";
size_t digits = strspn(str, "0123456789"); // 3
size_t non_digits = strcspn(str, "0123456789"); // 0

char *str2 = "abc123";
size_t leading_non_digits = strspn(str2, "0123456789"); // 0
size_t leading_digits = strcspn(str2, "0123456789"); // 3
```

#### Advanced String Manipulation

**`strdup` - Duplicate String**
```c
char *strdup(const char *str);
```
*   Allocates memory and copies `str` to new buffer
*   Returns pointer to new string, or `NULL` on error
*   Caller must `free` the returned string

**Example:**
```c
char *original = "Hello, World!";
char *copy = strdup(original);
if (copy) {
    // Modify copy...
    free(copy);
}
```

**`strndup` - Duplicate String with Length Limit**
```c
char *strndup(const char *str, size_t n);
```
*   Similar to `strdup`, but copies at most `n` characters
*   Always null-terminates the result

**Example:**
```c
char *partial = strndup("Hello, World!", 5); // "Hello"
```

## 5.7 Working with Structures and Files

### 5.7.1 Text-Based Storage

Storing structures as human-readable text provides portability and ease of editing.

#### CSV Format Handling

Comma-Separated Values (CSV) is a common format for tabular data.

**Example: Saving Structures as CSV**
```c
#include <stdio.h>

struct Employee {
    int id;
    char name[50];
    float salary;
    int department;
};

void save_employees_csv(const char *filename, 
                      const struct Employee *employees, 
                      int count) {
    FILE *fp = fopen(filename, "w");
    if (!fp) return;
    
    // Write header
    fprintf(fp, "ID,Name,Salary,Department\n");
    
    // Write data
    for (int i = 0; i < count; i++) {
        // Escape commas in name field
        char escaped_name[100];
        snprintf(escaped_name, sizeof(escaped_name), 
                "\"%s\"", employees[i].name);
        
        // Replace commas with spaces in the escaped name
        for (char *p = escaped_name; *p; p++) {
            if (*p == ',') *p = ' ';
        }
        
        fprintf(fp, "%d,%s,%.2f,%d\n", 
                employees[i].id, 
                escaped_name,
                employees[i].salary,
                employees[i].department);
    }
    
    fclose(fp);
}

int load_employees_csv(const char *filename, 
                     struct Employee *employees, 
                     int max_count) {
    FILE *fp = fopen(filename, "r");
    if (!fp) return -1;
    
    char line[256];
    // Skip header
    if (fgets(line, sizeof(line), fp) == NULL) {
        fclose(fp);
        return -1;
    }
    
    int count = 0;
    while (count < max_count && fgets(line, sizeof(line), fp) != NULL) {
        // Remove newline
        size_t len = strlen(line);
        if (len > 0 && line[len-1] == '\n') {
            line[len-1] = '\0';
        }
        
        // Parse line - simplified for example
        char *token;
        char *saveptr;
        
        token = strtok_r(line, ",", &saveptr);
        if (token) employees[count].id = atoi(token);
        
        token = strtok_r(NULL, ",", &saveptr);
        if (token) {
            // Remove quotes if present
            size_t token_len = strlen(token);
            if (token[0] == '"' && token[token_len-1] == '"') {
                token[token_len-1] = '\0';
                strncpy(employees[count].name, token+1, 
                       sizeof(employees[count].name)-1);
            } else {
                strncpy(employees[count].name, token, 
                       sizeof(employees[count].name)-1);
            }
            employees[count].name[sizeof(employees[count].name)-1] = '\0';
        }
        
        token = strtok_r(NULL, ",", &saveptr);
        if (token) employees[count].salary = atof(token);
        
        token = strtok_r(NULL, ",", &saveptr);
        if (token) employees[count].department = atoi(token);
        
        count++;
    }
    
    fclose(fp);
    return count;
}
```

**CSV Considerations:**
*   Handle commas within fields (typically by quoting)
*   Handle embedded quotes (typically by doubling)
*   Consider different line ending conventions
*   Validate data during parsing

#### INI File Format

INI files provide a simple key-value configuration format.

**Example: INI Parser**
```c
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE 256
#define MAX_SECTION 50
#define MAX_KEY 50
#define MAX_VALUE 100

struct Config {
    char section[MAX_SECTION];
    char key[MAX_KEY];
    char value[MAX_VALUE];
};

int parse_ini(const char *filename, struct Config *configs, int max_configs) {
    FILE *fp = fopen(filename, "r");
    if (!fp) return -1;
    
    char current_section[MAX_SECTION] = "";
    int count = 0;
    
    char line[MAX_LINE];
    while (fgets(line, sizeof(line), fp) != NULL) {
        // Remove newline
        size_t len = strlen(line);
        if (len > 0 && line[len-1] == '\n') {
            line[len-1] = '\0';
        }
        
        // Skip empty lines and comments
        char *p = line;
        while (isspace((unsigned char)*p)) p++;
        if (*p == '\0' || *p == ';' || *p == '#') {
            continue;
        }
        
        // Section header [section]
        if (*p == '[') {
            p++;
            char *end = strchr(p, ']');
            if (end) {
                *end = '\0';
                strncpy(current_section, p, sizeof(current_section)-1);
                current_section[sizeof(current_section)-1] = '\0';
            }
            continue;
        }
        
        // Key-value pair: key = value
        char *equals = strchr(p, '=');
        if (equals) {
            *equals = '\0';
            char *key = p;
            char *value = equals + 1;
            
            // Trim whitespace
            while (isspace((unsigned char)*key)) key++;
            char *key_end = key + strlen(key) - 1;
            while (key_end > key && isspace((unsigned char)*key_end)) *key_end-- = '\0';
            
            while (isspace((unsigned char)*value)) value++;
            char *value_end = value + strlen(value) - 1;
            while (value_end > value && isspace((unsigned char)*value_end)) *value_end-- = '\0';
            
            if (count < max_configs) {
                strncpy(configs[count].section, current_section, 
                       sizeof(configs[count].section)-1);
                strncpy(configs[count].key, key, 
                       sizeof(configs[count].key)-1);
                strncpy(configs[count].value, value, 
                       sizeof(configs[count].value)-1);
                configs[count].section[sizeof(configs[count].section)-1] = '\0';
                configs[count].key[sizeof(configs[count].key)-1] = '\0';
                configs[count].value[sizeof(configs[count].value)-1] = '\0';
                count++;
            }
        }
    }
    
    fclose(fp);
    return count;
}
```

### 5.7.2 Binary Storage

Binary storage provides efficient, compact representation of structured data.

#### Direct Binary I/O

```c
// Save array of structures
size_t save_structures_bin(const char *filename, 
                         const void *data, 
                         size_t size, 
                         size_t count) {
    FILE *fp = fopen(filename, "wb");
    if (!fp) return 0;
    
    size_t written = fwrite(data, size, count, fp);
    fclose(fp);
    return written;
}

// Load array of structures
size_t load_structures_bin(const char *filename, 
                         void *data, 
                         size_t size, 
                         size_t max_count) {
    FILE *fp = fopen(filename, "rb");
    if (!fp) return 0;
    
    // Get file size
    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);
    fseek(fp, 0, SEEK_SET);
    
    // Calculate maximum count we can read
    size_t max_possible = file_size / size;
    size_t count = (max_possible < max_count) ? max_possible : max_count;
    
    size_t read = fread(data, size, count, fp);
    fclose(fp);
    return read;
}
```

**Portability Considerations:**
*   **Endianness:** Byte order differs between architectures (x86 = little-endian, some ARM = big-endian)
*   **Alignment and Padding:** Structure layout varies by compiler and architecture
*   **Data Type Sizes:** `int` may be 2 or 4 bytes; `long` may be 4 or 8 bytes

**Solutions for Binary Portability:**
1.  **Define a fixed binary format** (specify byte order, padding, field sizes)
2.  **Serialize each field individually** rather than writing entire structures
3.  **Use a cross-platform serialization library** (e.g., Google Protocol Buffers)

#### Endianness Handling

```c
#include <stdint.h>

// Convert 32-bit value from host to network byte order (big-endian)
uint32_t hton32(uint32_t host) {
    #if __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__
        return ((host >> 24) & 0x000000FF) |
               ((host >> 8) & 0x0000FF00) |
               ((host << 8) & 0x00FF0000) |
               ((host << 24) & 0xFF000000);
    #else
        return host; // Already big-endian
    #endif
}

// Write a 32-bit integer in a portable way
size_t write_int32(FILE *fp, int32_t value) {
    uint32_t net_value = hton32((uint32_t)value);
    return fwrite(&net_value, sizeof(net_value), 1, fp);
}

// Read a 32-bit integer in a portable way
size_t read_int32(FILE *fp, int32_t *value) {
    uint32_t net_value;
    size_t result = fread(&net_value, sizeof(net_value), 1, fp);
    if (result == 1) {
        *value = (int32_t)ntoh32(net_value);
    }
    return result;
}
```

### 5.7.3 Serialization and Deserialization

Creating a custom serialization format provides control over data representation.

#### Custom Serialization Example

```c
#include <stdio.h>
#include <string.h>
#include <stdint.h>

// Simple serialization format:
// [type][length][data]
// Types: 0 = int, 1 = float, 2 = string

enum ValueType {
    TYPE_INT = 0,
    TYPE_FLOAT = 1,
    TYPE_STRING = 2
};

// Write a value with type information
int serialize_value(FILE *fp, enum ValueType type, const void *value) {
    if (fwrite(&type, sizeof(type), 1, fp) != 1) {
        return 0;
    }
    
    switch (type) {
        case TYPE_INT: {
            int32_t net_value = hton32(*(const int32_t *)value);
            return fwrite(&net_value, sizeof(net_value), 1, fp) == 1;
        }
        case TYPE_FLOAT: {
            // For simplicity, treat float as 4 bytes
            uint32_t net_value = hton32(*(const uint32_t *)value);
            return fwrite(&net_value, sizeof(net_value), 1, fp) == 1;
        }
        case TYPE_STRING: {
            const char *str = (const char *)value;
            size_t len = strlen(str);
            if (len > 65535) len = 65535; // Limit string length
            
            uint16_t net_len = hton16((uint16_t)len);
            if (fwrite(&net_len, sizeof(net_len), 1, fp) != 1) {
                return 0;
            }
            return fwrite(str, 1, len, fp) == len;
        }
        default:
            return 0;
    }
}

// Read a value with type information
int deserialize_value(FILE *fp, enum ValueType *type, void *buffer, size_t buffer_size) {
    if (fread(type, sizeof(*type), 1, fp) != 1) {
        return 0;
    }
    
    switch (*type) {
        case TYPE_INT: {
            uint32_t net_value;
            if (fread(&net_value, sizeof(net_value), 1, fp) != 1) {
                return 0;
            }
            if (buffer_size >= sizeof(int32_t)) {
                *(int32_t *)buffer = ntoh32(net_value);
                return sizeof(int32_t);
            }
            return 0;
        }
        case TYPE_FLOAT: {
            uint32_t net_value;
            if (fread(&net_value, sizeof(net_value), 1, fp) != 1) {
                return 0;
            }
            if (buffer_size >= sizeof(float)) {
                *(uint32_t *)buffer = ntoh32(net_value);
                return sizeof(float);
            }
            return 0;
        }
        case TYPE_STRING: {
            uint16_t net_len;
            if (fread(&net_len, sizeof(net_len), 1, fp) != 1) {
                return 0;
            }
            size_t len = ntoh16(net_len);
            
            if (len >= buffer_size) {
                len = buffer_size - 1; // Leave room for null terminator
            }
            
            if (fread(buffer, 1, len, fp) != len) {
                return 0;
            }
            
            ((char *)buffer)[len] = '\0';
            return len + 1;
        }
        default:
            return 0;
    }
}
```

#### Object Serialization Example

```c
struct Person {
    int id;
    char name[50];
    float height;
    int is_employee;
};

int serialize_person(FILE *fp, const struct Person *person) {
    if (!serialize_value(fp, TYPE_INT, &person->id)) return 0;
    if (!serialize_value(fp, TYPE_STRING, person->name)) return 0;
    if (!serialize_value(fp, TYPE_FLOAT, &person->height)) return 0;
    if (!serialize_value(fp, TYPE_INT, &person->is_employee)) return 0;
    return 1;
}

int deserialize_person(FILE *fp, struct Person *person) {
    enum ValueType type;
    
    if (!deserialize_value(fp, &type, &person->id, sizeof(person->id)) || type != TYPE_INT) {
        return 0;
    }
    
    if (!deserialize_value(fp, &type, person->name, sizeof(person->name)) || type != TYPE_STRING) {
        return 0;
    }
    
    if (!deserialize_value(fp, &type, &person->height, sizeof(person->height)) || type != TYPE_FLOAT) {
        return 0;
    }
    
    if (!deserialize_value(fp, &type, &person->is_employee, sizeof(person->is_employee)) || type != TYPE_INT) {
        return 0;
    }
    
    return 1;
}
```

> **"Serialization transforms complex data structures into a sequence of bytes that can travel through time and space—preserving information across program executions, system boundaries, and even hardware architectures. It is the alchemy that turns ephemeral memory into enduring knowledge."**

## 5.8 Error Handling in File Operations

### 5.8.1 Understanding Error Conditions

Effective error handling requires understanding the mechanisms C provides for reporting errors.

#### The `errno` Global Variable

*   Declared in `<errno.h>`
*   Set by system calls and library functions on error
*   Zero indicates no error
*   Positive values indicate specific error conditions

**Common Error Codes:**

| **Error Code** | **Meaning**                                      |
| :------------- | :----------------------------------------------- |
| **`EACCES`**   | **Permission denied**                            |
| **`ENOENT`**   | **No such file or directory**                    |
| **`EEXIST`**   | **File exists**                                  |
| **`EINVAL`**   | **Invalid argument**                             |
| **`EMFILE`**   | **Too many open files**                          |
| **`ENOSPC`**   | **No space left on device**                      |
| **`ERANGE`**   | **Result too large** (for numeric conversions)   |
| **`EIO`**      | **I/O error**                                    |

#### Error Reporting Functions

**`perror` - Print Error Message**
```c
void perror(const char *s);
```
*   Prints `s` followed by colon, space, and error message
*   Based on current value of `errno`

**Example:**
```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("fopen failed"); 
    // Outputs something like: "fopen failed: No such file or directory"
}
```

**`strerror` - Get Error Message String**
```c
char *strerror(int errnum);
```
*   Returns pointer to string describing error `errnum`
*   Thread-safe in modern implementations

**Example:**
```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    fprintf(stderr, "Error %d opening file: %s\n", errno, strerror(errno));
}
```

#### `ferror` and `feof` - Stream-Specific Errors

```c
int ferror(FILE *stream);
int feof(FILE *stream);
```
*   `ferror`: Checks if an error occurred on `stream`
*   `feof`: Checks if end-of-file indicator is set for `stream`

**Important Usage Pattern:**
```c
char buffer[100];
while (fgets(buffer, sizeof(buffer), fp) != NULL) {
    // Process line
}

if (ferror(fp)) {
    perror("Error reading file");
} else if (feof(fp)) {
    printf("Reached end of file\n");
}
```

**Critical Note:** Never check `feof` before reading—this is a common mistake. The end-of-file indicator is only set *after* an attempt to read past the end.

### 5.8.2 Robust Error Handling Patterns

#### Comprehensive File Reading Pattern

```c
FILE *fp = fopen(filename, "r");
if (fp == NULL) {
    fprintf(stderr, "Error opening %s: %s\n", filename, strerror(errno));
    return;
}

char buffer[1024];
while (1) {
    if (fgets(buffer, sizeof(buffer), fp) == NULL) {
        if (ferror(fp)) {
            fprintf(stderr, "Error reading %s: %s\n", filename, strerror(errno));
            clearerr(fp); // Clear error to allow further operations
            break;
        } else if (feof(fp)) {
            break; // Clean end of file
        }
    }
    
    // Process line
    // ...
}

if (fclose(fp) != 0) {
    fprintf(stderr, "Error closing %s: %s\n", filename, strerror(errno));
}
```

#### Retry Mechanism for Transient Errors

```c
#include <errno.h>
#include <unistd.h> // For sleep

#define MAX_RETRIES 3
#define RETRY_DELAY 1 // Seconds

FILE *open_with_retry(const char *filename, const char *mode) {
    FILE *fp;
    int retries = 0;
    
    while (retries < MAX_RETRIES) {
        fp = fopen(filename, mode);
        if (fp != NULL) {
            return fp; // Success
        }
        
        if (errno != EINTR && errno != EAGAIN) {
            return NULL; // Not a retryable error
        }
        
        retries++;
        fprintf(stderr, "Retry %d/%d after error %d\n", 
                retries, MAX_RETRIES, errno);
        sleep(RETRY_DELAY);
    }
    
    return NULL; // Failed after all retries
}
```

#### Graceful Degradation Pattern

```c
void process_file(const char *filename) {
    FILE *fp = fopen(filename, "r");
    if (fp == NULL) {
        // Try alternative file
        char alt_filename[256];
        snprintf(alt_filename, sizeof(alt_filename), 
                "default_%s", filename);
        
        fp = fopen(alt_filename, "r");
        if (fp == NULL) {
            // Last resort: use built-in defaults
            fprintf(stderr, "Fatal: Could not open %s or %s\n", 
                    filename, alt_filename);
            use_default_settings();
            return;
        }
        
        fprintf(stderr, "Warning: Using default configuration from %s\n", 
                alt_filename);
    }
    
    // Process file...
    fclose(fp);
}
```

## 5.9 Memory-Mapped Files (Advanced)

### 5.9.1 Introduction to Memory-Mapped I/O

Memory-mapped files provide an alternative to standard stream I/O by mapping file contents directly into the process's address space.

**Benefits:**
*   **Simplified Code:** Treat file contents as memory
*   **Performance:** Avoids buffer copying between user and kernel space
*   **Random Access:** Efficient seeking through pointer arithmetic
*   **Shared Memory:** Multiple processes can map the same file

**Limitations:**
*   **Platform-Specific:** Different APIs on POSIX vs. Windows
*   **Memory Constraints:** Large files may exceed address space
*   **Complex Error Handling:** Different failure modes than stream I/O
*   **Not Suitable for All Operations:** Poor for small, sequential writes

### 5.9.2 Using Memory-Mapped Files

#### POSIX Memory Mapping (`mmap`)

```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
int munmap(void *addr, size_t length);
```

**Example: Reading a File with mmap**
```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

char *read_file_mmap(const char *filename, size_t *size_out) {
    int fd = open(filename, O_RDONLY);
    if (fd == -1) {
        perror("open failed");
        return NULL;
    }
    
    struct stat sb;
    if (fstat(fd, &sb) == -1) {
        perror("fstat failed");
        close(fd);
        return NULL;
    }
    
    *size_out = sb.st_size;
    
    char *addr = mmap(NULL, sb.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    close(fd); // Can close fd after mmap
    
    if (addr == MAP_FAILED) {
        perror("mmap failed");
        return NULL;
    }
    
    return addr;
}

void free_file_mmap(char *addr, size_t size) {
    if (munmap(addr, size) == -1) {
        perror("munmap failed");
    }
}

int main() {
    size_t size;
    char *content = read_file_mmap("example.txt", &size);
    if (content) {
        // Process content as if it were a regular memory buffer
        printf("File content (%zu bytes):\n%.*s\n", size, (int)size, content);
        free_file_mmap(content, size);
    }
    return 0;
}
```

#### Windows Memory Mapping

Windows uses a different API based on handles:

```c
HANDLE CreateFileMapping(
  HANDLE hFile,
  LPSECURITY_ATTRIBUTES lpAttributes,
  DWORD flProtect,
  DWORD dwMaximumSizeHigh,
  DWORD dwMaximumSizeLow,
  LPCTSTR lpName
);

LPVOID MapViewOfFile(
  HANDLE hFileMappingObject,
  DWORD dwDesiredAccess,
  DWORD dwFileOffsetHigh,
  DWORD dwFileOffsetLow,
  SIZE_T dwNumberOfBytesToMap
);
```

**Example: Reading a File with Windows API**
```c
#include <windows.h>
#include <stdio.h>

char *read_file_winmap(const char *filename, DWORD *size_out) {
    HANDLE hFile = CreateFileA(
        filename,
        GENERIC_READ,
        FILE_SHARE_READ,
        NULL,
        OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL,
        NULL
    );
    
    if (hFile == INVALID_HANDLE_VALUE) {
        printf("CreateFile failed (%d)\n", GetLastError());
        return NULL;
    }
    
    DWORD size = GetFileSize(hFile, NULL);
    *size_out = size;
    
    HANDLE hMap = CreateFileMapping(
        hFile,
        NULL,
        PAGE_READONLY,
        0,
        0,
        NULL
    );
    
    CloseHandle(hFile);
    
    if (hMap == NULL) {
        printf("CreateFileMapping failed (%d)\n", GetLastError());
        return NULL;
    }
    
    char *addr = (char *)MapViewOfFile(
        hMap,
        FILE_MAP_READ,
        0,
        0,
        0
    );
    
    CloseHandle(hMap);
    
    if (addr == NULL) {
        printf("MapViewOfFile failed (%d)\n", GetLastError());
        return NULL;
    }
    
    return addr;
}

void free_file_winmap(char *addr) {
    if (!UnmapViewOfFile(addr)) {
        printf("UnmapViewOfFile failed (%d)\n", GetLastError());
    }
}
```

#### Cross-Platform Memory Mapping

For cross-platform code, consider using an abstraction layer:

```c
#ifdef _WIN32
    // Windows implementation
#else
    // POSIX implementation
#endif

void *map_file(const char *filename, size_t *size) {
    // Platform-specific implementation
}

void unmap_file(void *addr, size_t size) {
    // Platform-specific implementation
}
```

## 5.10 Best Practices for File I/O and String Handling

### 5.10.1 Security Considerations

#### Path Traversal Vulnerabilities

Path traversal occurs when user input influences file paths without proper validation.

**Vulnerable Example:**
```c
char filename[256];
snprintf(filename, sizeof(filename), "data/%s.txt", user_input);
FILE *fp = fopen(filename, "r");
```

If `user_input` is `"../../passwords"`, this could access files outside the intended directory.

**Prevention Strategies:**
1.  **Validate and Sanitize Input:**
    ```c
    // Remove path separators
    for (char *p = user_input; *p; p++) {
        if (*p == '/' || *p == '\\') {
            *p = '_';
        }
    }
    ```

2.  **Use Fixed Base Directories:**
    ```c
    #include <libgen.h>
    
    char full_path[512];
    snprintf(full_path, sizeof(full_path), "data/%s", basename(user_input));
    ```

3.  **Canonicalize Paths:**
    ```c
    #ifdef __linux__
        char resolved_path[PATH_MAX];
        if (realpath(full_path, resolved_path) == NULL) {
            // Handle error
        }
        // Check if resolved_path starts with expected prefix
    #endif
    ```

#### Format String Vulnerabilities

As discussed earlier, always use a static format string:

```c
// DANGEROUS
printf(user_input);

// SAFE
printf("%s", user_input);
```

#### Buffer Overflow Prevention

Always use bounded string functions:

```c
// UNSAFE
strcpy(dest, src);
strcat(dest, src);
sprintf(dest, format, ...);

// SAFE
strncpy(dest, src, sizeof(dest)-1);
dest[sizeof(dest)-1] = '\0';
strncat(dest, src, sizeof(dest)-strlen(dest)-1);
snprintf(dest, sizeof(dest), format, ...);
```

### 5.10.2 Performance Optimization

#### Buffering Strategies

*   **Increase Buffer Size:** For large file operations, use larger buffers
    ```c
    #define BUFFER_SIZE (64 * 1024) // 64KB buffer
    setvbuf(fp, NULL, _IOFBF, BUFFER_SIZE);
    ```

*   **Choose Appropriate Buffering Mode:**
    *   `_IOFBF`: Full buffering (best for large files)
    *   `_IOLBF`: Line buffering (best for interactive output)
    *   `_IONBF`: No buffering (rarely needed)

#### Minimizing System Calls

*   **Batch I/O Operations:** Read/write larger chunks at once
    ```c
    // Better than reading character by character
    char buffer[4096];
    while ((n = fread(buffer, 1, sizeof(buffer), fp)) > 0) {
        // Process buffer
    }
    ```

*   **Avoid Unnecessary Flushing:**
    ```c
    // BAD: flushes after every line
    for (int i = 0; i < 1000; i++) {
        fprintf(fp, "Line %d\n", i);
        fflush(fp);
    }
    
    // GOOD: let standard buffering handle it
    for (int i = 0; i < 1000; i++) {
        fprintf(fp, "Line %d\n", i);
    }
    ```

#### Choosing Appropriate I/O Methods

| **Scenario**                     | **Recommended Approach**         |
| :------------------------------- | :------------------------------- |
| **Large sequential reads/writes** | **`fread`/`fwrite` with buffers** |
| **Small random access**          | **`fseek` + `fread`/`fwrite`**    |
| **Text processing**              | **`fgets` + string functions**    |
| **Very large files**             | **Memory-mapped I/O**             |
| **Frequent small writes**        | **Buffered output + periodic flush** |

### 5.10.3 Cross-Platform Considerations

#### Line Ending Differences

*   **Windows:** `\r\n` (CR/LF)
*   **Unix/Linux/macOS:** `\n` (LF)
*   **Classic Mac OS:** `\r` (CR)

**Strategies:**
*   Use binary mode (`"rb"`, `"wb"`) when line endings matter
*   Convert line endings when necessary:
    ```c
    void convert_crlf_to_lf(char *buffer, size_t *len) {
        char *src = buffer;
        char *dst = buffer;
        while (src < buffer + *len) {
            if (*src == '\r' && src + 1 < buffer + *len && src[1] == '\n') {
                *dst++ = '\n';
                src += 2;
            } else if (*src == '\r') {
                *dst++ = '\n';
                src++;
            } else {
                *dst++ = *src++;
            }
        }
        *len = dst - buffer;
    }
    ```

#### Path Separators

*   **Windows:** `\` (but often accepts `/`)
*   **Unix-like:** `/`

**Strategies:**
*   Use forward slashes `/` universally (works on Windows too)
*   Create a platform-agnostic path handling function:
    ```c
    void build_path(char *buffer, size_t size, const char *dir, const char *file) {
    #ifdef _WIN32
        snprintf(buffer, size, "%s\\%s", dir, file);
    #else
        snprintf(buffer, size, "%s/%s", dir, file);
    #endif
    }
    ```

#### File System Limitations

| **File System** | **Max Filename Length** | **Max Path Length** | **Case Sensitivity** |
| :-------------- | :---------------------- | :------------------ | :------------------- |
| **FAT32**       | **255**                 | **260**             | **No**               |
| **NTFS**        | **255**                 | **32,767**          | **No**               |
| **ext4**        | **255**                 | **4,096**           | **Yes**              |
| **APFS**        | **255**                 | **1,024**           | **Configurable**     |

**Best Practices:**
*   Keep filenames reasonably short (< 100 characters)
*   Avoid special characters in filenames
*   Handle case sensitivity appropriately
*   Check path length before operations

## 5.11 Practical Applications

### 5.11.1 Configuration File Parser

This example implements a robust configuration file parser supporting sections, comments, and various data types.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE 512
#define MAX_SECTION 64
#define MAX_KEY 64
#define MAX_VALUE 256

// Configuration value types
typedef enum {
    CFG_STRING,
    CFG_INT,
    CFG_FLOAT,
    CFG_BOOL
} ConfigType;

// Configuration entry
typedef struct {
    char section[MAX_SECTION];
    char key[MAX_KEY];
    ConfigType type;
    union {
        char str[MAX_VALUE];
        int i;
        float f;
        int b; // 0 = false, 1 = true
    } value;
} ConfigEntry;

// Configuration database
typedef struct {
    ConfigEntry *entries;
    int count;
    int capacity;
} ConfigDB;

// Function prototypes
ConfigDB *config_create(int initial_capacity);
void config_destroy(ConfigDB *config);
int config_load(ConfigDB *config, const char *filename);
int config_get_string(const ConfigDB *config, const char *section, 
                     const char *key, char *out, size_t out_size);
int config_get_int(const ConfigDB *config, const char *section, 
                  const char *key, int *out);
int config_get_float(const ConfigDB *config, const char *section, 
                    const char *key, float *out);
int config_get_bool(const ConfigDB *config, const char *section, 
                   const char *key, int *out);
void config_print(const ConfigDB *config);

ConfigDB *config_create(int initial_capacity) {
    ConfigDB *cfg = malloc(sizeof(ConfigDB));
    if (!cfg) return NULL;
    
    cfg->capacity = (initial_capacity > 0) ? initial_capacity : 16;
    cfg->count = 0;
    
    cfg->entries = malloc(cfg->capacity * sizeof(ConfigEntry));
    if (!cfg->entries) {
        free(cfg);
        return NULL;
    }
    
    return cfg;
}

void config_destroy(ConfigDB *config) {
    if (!config) return;
    free(config->entries);
    free(config);
}

static void trim_whitespace(char *str) {
    char *end;
    
    // Trim leading space
    while (isspace((unsigned char)*str)) str++;
    
    if (*str == 0) {
        *str = '\0';
        return;
    }
    
    // Trim trailing space
    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end)) end--;
    
    // Write new null terminator
    end[1] = '\0';
}

static int parse_bool(const char *str) {
    if (strcasecmp(str, "true") == 0 || 
        strcasecmp(str, "yes") == 0 ||
        strcasecmp(str, "on") == 0 ||
        strcmp(str, "1") == 0) {
        return 1;
    }
    return 0;
}

int config_load(ConfigDB *config, const char *filename) {
    FILE *fp = fopen(filename, "r");
    if (!fp) return 0;
    
    char current_section[MAX_SECTION] = "default";
    char line[MAX_LINE];
    int line_num = 0;
    
    while (fgets(line, sizeof(line), fp) != NULL) {
        line_num++;
        
        // Remove newline
        size_t len = strlen(line);
        if (len > 0 && line[len-1] == '\n') {
            line[len-1] = '\0';
        }
        
        // Skip empty lines and comments
        char *p = line;
        while (isspace((unsigned char)*p)) p++;
        if (*p == '\0' || *p == ';' || *p == '#') {
            continue;
        }
        
        // Section header [section]
        if (*p == '[') {
            p++;
            char *end = strchr(p, ']');
            if (!end) {
                fprintf(stderr, "%s:%d: Missing closing bracket\n", 
                        filename, line_num);
                continue;
            }
            
            *end = '\0';
            strncpy(current_section, p, sizeof(current_section)-1);
            current_section[sizeof(current_section)-1] = '\0';
            trim_whitespace(current_section);
            continue;
        }
        
        // Key-value pair: key = value
        char *equals = strchr(p, '=');
        if (!equals) {
            fprintf(stderr, "%s:%d: Missing equals sign\n", 
                    filename, line_num);
            continue;
        }
        
        *equals = '\0';
        char *key = p;
        char *value = equals + 1;
        
        // Trim whitespace
        trim_whitespace(key);
        trim_whitespace(value);
        
        if (strlen(key) == 0) {
            fprintf(stderr, "%s:%d: Empty key\n", filename, line_num);
            continue;
        }
        
        // Grow array if needed
        if (config->count >= config->capacity) {
            int new_capacity = config->capacity * 2;
            ConfigEntry *new_entries = realloc(config->entries, 
                                             new_capacity * sizeof(ConfigEntry));
            if (!new_entries) {
                fclose(fp);
                return 0;
            }
            config->entries = new_entries;
            config->capacity = new_capacity;
        }
        
        // Store entry
        ConfigEntry *entry = &config->entries[config->count];
        strncpy(entry->section, current_section, sizeof(entry->section)-1);
        strncpy(entry->key, key, sizeof(entry->key)-1);
        entry->section[sizeof(entry->section)-1] = '\0';
        entry->key[sizeof(entry->key)-1] = '\0';
        
        // Try to determine value type
        char *endptr;
        errno = 0;
        long int_val = strtol(value, &endptr, 10);
        
        if (errno == 0 && *endptr == '\0') {
            // Integer
            entry->type = CFG_INT;
            entry->value.i = (int)int_val;
        } else {
            float float_val = strtof(value, &endptr);
            if (errno == 0 && *endptr == '\0') {
                // Float
                entry->type = CFG_FLOAT;
                entry->value.f = float_val;
            } else if (strcasecmp(value, "true") == 0 || 
                      strcasecmp(value, "false") == 0 ||
                      strcasecmp(value, "yes") == 0 || 
                      strcasecmp(value, "no") == 0 ||
                      strcmp(value, "1") == 0 || 
                      strcmp(value, "0") == 0) {
                // Boolean
                entry->type = CFG_BOOL;
                entry->value.b = parse_bool(value);
            } else {
                // String
                entry->type = CFG_STRING;
                strncpy(entry->value.str, value, sizeof(entry->value.str)-1);
                entry->value.str[sizeof(entry->value.str)-1] = '\0';
            }
        }
        
        config->count++;
    }
    
    fclose(fp);
    return 1;
}

int config_get_string(const ConfigDB *config, const char *section, 
                    const char *key, char *out, size_t out_size) {
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->entries[i].section, section) == 0 &&
            strcmp(config->entries[i].key, key) == 0 &&
            config->entries[i].type == CFG_STRING) {
            
            strncpy(out, config->entries[i].value.str, out_size-1);
            out[out_size-1] = '\0';
            return 1;
        }
    }
    return 0;
}

int config_get_int(const ConfigDB *config, const char *section, 
                  const char *key, int *out) {
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->entries[i].section, section) == 0 &&
            strcmp(config->entries[i].key, key) == 0) {
            
            switch (config->entries[i].type) {
                case CFG_INT:
                    *out = config->entries[i].value.i;
                    return 1;
                case CFG_FLOAT:
                    *out = (int)config->entries[i].value.f;
                    return 1;
                case CFG_BOOL:
                    *out = config->entries[i].value.b;
                    return 1;
                case CFG_STRING:
                    // Try to convert string to int
                    char *endptr;
                    errno = 0;
                    long value = strtol(config->entries[i].value.str, &endptr, 10);
                    if (errno == 0 && *endptr == '\0') {
                        *out = (int)value;
                        return 1;
                    }
                    break;
            }
        }
    }
    return 0;
}

int config_get_float(const ConfigDB *config, const char *section, 
                    const char *key, float *out) {
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->entries[i].section, section) == 0 &&
            strcmp(config->entries[i].key, key) == 0) {
            
            switch (config->entries[i].type) {
                case CFG_FLOAT:
                    *out = config->entries[i].value.f;
                    return 1;
                case CFG_INT:
                    *out = (float)config->entries[i].value.i;
                    return 1;
                case CFG_BOOL:
                    *out = (float)config->entries[i].value.b;
                    return 1;
                case CFG_STRING:
                    // Try to convert string to float
                    char *endptr;
                    errno = 0;
                    float value = strtof(config->entries[i].value.str, &endptr);
                    if (errno == 0 && *endptr == '\0') {
                        *out = value;
                        return 1;
                    }
                    break;
            }
        }
    }
    return 0;
}

int config_get_bool(const ConfigDB *config, const char *section, 
                   const char *key, int *out) {
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->entries[i].section, section) == 0 &&
            strcmp(config->entries[i].key, key) == 0) {
            
            switch (config->entries[i].type) {
                case CFG_BOOL:
                    *out = config->entries[i].value.b;
                    return 1;
                case CFG_INT:
                    *out = (config->entries[i].value.i != 0);
                    return 1;
                case CFG_FLOAT:
                    *out = (config->entries[i].value.f != 0.0f);
                    return 1;
                case CFG_STRING:
                    *out = parse_bool(config->entries[i].value.str);
                    return 1;
            }
        }
    }
    return 0;
}

void config_print(const ConfigDB *config) {
    const char *current_section = "";
    
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->entries[i].section, current_section) != 0) {
            printf("\n[%s]\n", config->entries[i].section);
            current_section = config->entries[i].section;
        }
        
        printf("%s = ", config->entries[i].key);
        
        switch (config->entries[i].type) {
            case CFG_STRING:
                printf("\"%s\"\n", config->entries[i].value.str);
                break;
            case CFG_INT:
                printf("%d\n", config->entries[i].value.i);
                break;
            case CFG_FLOAT:
                printf("%.6f\n", config->entries[i].value.f);
                break;
            case CFG_BOOL:
                printf("%s\n", config->entries[i].value.b ? "true" : "false");
                break;
        }
    }
}

int main() {
    ConfigDB *config = config_create(16);
    if (!config) {
        fprintf(stderr, "Failed to create config database\n");
        return 1;
    }
    
    if (!config_load(config, "config.ini")) {
        fprintf(stderr, "Failed to load config.ini\n");
        config_destroy(config);
        return 1;
    }
    
    printf("Configuration contents:\n");
    config_print(config);
    
    // Example of retrieving values
    char db_host[100];
    int db_port;
    float timeout;
    int debug;
    
    if (config_get_string(config, "database", "host", 
                         db_host, sizeof(db_host))) {
        printf("\nDatabase host: %s\n", db_host);
    }
    
    if (config_get_int(config, "database", "port", &db_port)) {
        printf("Database port: %d\n", db_port);
    }
    
    if (config_get_float(config, "network", "timeout", &timeout)) {
        printf("Network timeout: %.2f seconds\n", timeout);
    }
    
    if (config_get_bool(config, "system", "debug", &debug)) {
        printf("Debug mode: %s\n", debug ? "enabled" : "disabled");
    }
    
    config_destroy(config);
    return 0;
}
```

**Sample config.ini:**
```ini
# Sample configuration file
[database]
host = localhost
port = 5432
user = admin
password = secret

[network]
timeout = 30.5
retries = 3

[system]
debug = true
max_connections = 100
```

**Key Techniques Demonstrated:**
*   Flexible configuration storage with multiple data types
*   Robust parsing with error reporting
*   Type conversion between different value representations
*   Memory management with dynamic array growth
*   Comprehensive retrieval functions for different data types
*   Proper string handling with trimming and validation

### 5.11.2 Log File Analyzer

This example demonstrates processing a large log file to extract meaningful statistics.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>

#define MAX_LINE 1024
#define MAX_IP 16
#define MAX_PATH 256
#define MAX_USER_AGENT 256

// Log entry structure
typedef struct {
    char ip[MAX_IP];
    time_t timestamp;
    char method[8];
    char path[MAX_PATH];
    int status;
    int bytes;
    char user_agent[MAX_USER_AGENT];
} LogEntry;

// Statistics structure
typedef struct {
    int total_requests;
    int status_200;
    int status_404;
    int status_500;
    int total_bytes;
    
    struct {
        char ip[MAX_IP];
        int count;
    } top_ip;
    
    struct {
        char path[MAX_PATH];
        int count;
    } top_path;
} LogStats;

// Function prototypes
int parse_log_line(const char *line, LogEntry *entry);
void update_stats(LogStats *stats, const LogEntry *entry);
void print_stats(const LogStats *stats);
int analyze_log_file(const char *filename, LogStats *stats);

int parse_log_line(const char *line, LogEntry *entry) {
    // Common Log Format: 
    // 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
    
    char timestamp_str[30];
    char request[256];
    
    int result = sscanf(line, "%15s - %*s [%29[^]]] \"%255[^\"]\" %d %d %255[^\n]", 
                       entry->ip, timestamp_str, request, 
                       &entry->status, &entry->bytes, entry->user_agent);
    
    if (result < 5) {
        return 0; // Not enough fields
    }
    
    // Parse request line
    result = sscanf(request, "%7s %255s HTTP/%*s", entry->method, entry->path);
    if (result < 2) {
        return 0; // Invalid request format
    }
    
    // Parse timestamp
    struct tm tm = {0};
    if (strptime(timestamp_str, "%d/%b/%Y:%H:%M:%S %z", &tm) == NULL) {
        return 0; // Invalid timestamp
    }
    entry->timestamp = mktime(&tm);
    
    return 1;
}

void update_stats(LogStats *stats, const LogEntry *entry) {
    stats->total_requests++;
    stats->total_bytes += entry->bytes;
    
    // Status code statistics
    if (entry->status == 200) stats->status_200++;
    else if (entry->status == 404) stats->status_404++;
    else if (entry->status == 500) stats->status_500++;
    
    // Track top IP
    if (stats->total_requests == 1 || 
        (strcmp(entry->ip, stats->top_ip.ip) == 0)) {
        stats->top_ip.count++;
    } else {
        // This is a simplification - in reality you'd want a proper frequency counter
        if (strcmp(entry->ip, stats->top_ip.ip) != 0 && 
            stats->top_ip.count < 2) {
            strncpy(stats->top_ip.ip, entry->ip, sizeof(stats->top_ip.ip)-1);
            stats->top_ip.ip[sizeof(stats->top_ip.ip)-1] = '\0';
            stats->top_ip.count = 1;
        }
    }
    
    // Track top path
    if (stats->total_requests == 1 || 
        (strcmp(entry->path, stats->top_path.path) == 0)) {
        stats->top_path.count++;
    } else {
        // This is a simplification - in reality you'd want a proper frequency counter
        if (strcmp(entry->path, stats->top_path.path) != 0 && 
            stats->top_path.count < 2) {
            strncpy(stats->top_path.path, entry->path, sizeof(stats->top_path.path)-1);
            stats->top_path.path[sizeof(stats->top_path.path)-1] = '\0';
            stats->top_path.count = 1;
        }
    }
}

void print_stats(const LogStats *stats) {
    printf("Log Analysis Results:\n");
    printf("Total requests: %d\n", stats->total_requests);
    printf("Total bytes transferred: %d\n", stats->total_bytes);
    printf("Successful requests (200): %d (%.1f%%)\n", 
           stats->status_200, 
           stats->total_requests ? (stats->status_200 * 100.0 / stats->total_requests) : 0);
    printf("Not found (404): %d (%.1f%%)\n", 
           stats->status_404, 
           stats->total_requests ? (stats->status_404 * 100.0 / stats->total_requests) : 0);
    printf("Server errors (500): %d (%.1f%%)\n", 
           stats->status_500, 
           stats->total_requests ? (stats->status_500 * 100.0 / stats->total_requests) : 0);
    printf("Most frequent IP: %s (%d requests)\n", stats->top_ip.ip, stats->top_ip.count);
    printf("Most requested path: %s (%d requests)\n", stats->top_path.path, stats->top_path.count);
}

int analyze_log_file(const char *filename, LogStats *stats) {
    FILE *fp = fopen(filename, "r");
    if (!fp) {
        perror("Error opening log file");
        return 0;
    }
    
    // Initialize stats
    memset(stats, 0, sizeof(LogStats));
    
    char line[MAX_LINE];
    LogEntry entry;
    
    while (fgets(line, sizeof(line), fp) != NULL) {
        // Remove newline
        size_t len = strlen(line);
        if (len > 0 && line[len-1] == '\n') {
            line[len-1] = '\0';
        }
        
        if (parse_log_line(line, &entry)) {
            update_stats(stats, &entry);
        }
    }
    
    fclose(fp);
    return 1;
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s <log_file>\n", argv[0]);
        return 1;
    }
    
    LogStats stats;
    if (analyze_log_file(argv[1], &stats)) {
        print_stats(&stats);
    } else {
        return 1;
    }
    
    return 0;
}
```

**Key Techniques Demonstrated:**
*   Parsing complex log file format with `sscanf`
*   Timestamp conversion with `strptime` and `mktime`
*   Incremental statistics gathering
*   Handling large files with line-by-line processing
*   Basic frequency counting for top items
*   Comprehensive error handling

**Limitations and Improvements:**
*   The top IP and top path tracking is simplified (would need a hash table for real usage)
*   Could add date range filtering
*   Could add more detailed statistics (requests per hour, user agent analysis)
*   Could implement more robust log format detection

### 5.11.3 Data Serialization Library

This example creates a flexible serialization system for arbitrary data types.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdarg.h>

// Serialization context
typedef struct {
    FILE *fp;
    int error;
    char error_msg[256];
} SerializeCtx;

// Serialization type codes
typedef enum {
    SER_NULL = 0,
    SER_INT = 1,
    SER_FLOAT = 2,
    SER_STRING = 3,
    SER_ARRAY_START = 4,
    SER_ARRAY_END = 5,
    SER_OBJECT_START = 6,
    SER_OBJECT_END = 7,
    SER_KEY = 8
} SerializeType;

// Initialize serialization context
void serialize_init(SerializeCtx *ctx, FILE *fp) {
    memset(ctx, 0, sizeof(SerializeCtx));
    ctx->fp = fp;
}

// Check if error occurred
int serialize_has_error(const SerializeCtx *ctx) {
    return ctx->error;
}

// Get error message
const char *serialize_error(const SerializeCtx *ctx) {
    return ctx->error_msg;
}

// Write a single byte
static void serialize_byte(SerializeCtx *ctx, uint8_t value) {
    if (ctx->error) return;
    
    if (fputc(value, ctx->fp) == EOF) {
        ctx->error = 1;
        strcpy(ctx->error_msg, "Write error");
    }
}

// Write a 32-bit integer in network byte order
static void serialize_int32(SerializeCtx *ctx, int32_t value) {
    if (ctx->error) return;
    
    uint8_t bytes[4];
    bytes[0] = (value >> 24) & 0xFF;
    bytes[1] = (value >> 16) & 0xFF;
    bytes[2] = (value >> 8) & 0xFF;
    bytes[3] = value & 0xFF;
    
    if (fwrite(bytes, 1, 4, ctx->fp) != 4) {
        ctx->error = 1;
        strcpy(ctx->error_msg, "Write error");
    }
}

// Write a string with length prefix
static void serialize_string(SerializeCtx *ctx, const char *str) {
    if (ctx->error || str == NULL) return;
    
    size_t len = strlen(str);
    if (len > 0xFFFFFFFF) len = 0xFFFFFFFF;
    
    serialize_int32(ctx, (int32_t)len);
    if (ctx->error) return;
    
    if (len > 0 && fwrite(str, 1, len, ctx->fp) != len) {
        ctx->error = 1;
        strcpy(ctx->error_msg, "Write error");
    }
}

// Start serialization of a value
void serialize_value(SerializeCtx *ctx, SerializeType type, ...) {
    if (ctx->error) return;
    
    serialize_byte(ctx, (uint8_t)type);
    if (ctx->error) return;
    
    va_list args;
    va_start(args, type);
    
    switch (type) {
        case SER_NULL:
            // Nothing more to write
            break;
            
        case SER_INT: {
            int32_t value = va_arg(args, int32_t);
            serialize_int32(ctx, value);
            break;
        }
        
        case SER_FLOAT: {
            float value = (float)va_arg(args, double);
            // Convert float to integer representation
            int32_t int_rep;
            memcpy(&int_rep, &value, sizeof(int_rep));
            serialize_int32(ctx, int_rep);
            break;
        }
        
        case SER_STRING: {
            const char *str = va_arg(args, const char *);
            serialize_string(ctx, str);
            break;
        }
        
        case SER_KEY: {
            const char *key = va_arg(args, const char *);
            serialize_string(ctx, key);
            break;
        }
        
        case SER_ARRAY_START:
        case SER_OBJECT_START:
        case SER_ARRAY_END:
        case SER_OBJECT_END:
            // No additional data
            break;
            
        default:
            ctx->error = 1;
            strcpy(ctx->error_msg, "Invalid type code");
    }
    
    va_end(args);
}

// Start an object
void serialize_object_start(SerializeCtx *ctx) {
    serialize_value(ctx, SER_OBJECT_START);
}

// Add a key-value pair to an object
void serialize_object_key_value(SerializeCtx *ctx, const char *key, SerializeType value_type, ...) {
    if (ctx->error) return;
    
    serialize_value(ctx, SER_KEY, key);
    
    va_list args;
    va_start(args, value_type);
    
    switch (value_type) {
        case SER_NULL:
            serialize_value(ctx, SER_NULL);
            break;
        case SER_INT: {
            int32_t value = va_arg(args, int32_t);
            serialize_value(ctx, SER_INT, value);
            break;
        }
        case SER_FLOAT: {
            float value = (float)va_arg(args, double);
            serialize_value(ctx, SER_FLOAT, value);
            break;
        }
        case SER_STRING: {
            const char *str = va_arg(args, const char *);
            serialize_value(ctx, SER_STRING, str);
            break;
        }
        default:
            ctx->error = 1;
            strcpy(ctx->error_msg, "Invalid value type for object");
    }
    
    va_end(args);
}

// End an object
void serialize_object_end(SerializeCtx *ctx) {
    serialize_value(ctx, SER_OBJECT_END);
}

// Start an array
void serialize_array_start(SerializeCtx *ctx) {
    serialize_value(ctx, SER_ARRAY_START);
}

// Add a value to an array
void serialize_array_value(SerializeCtx *ctx, SerializeType value_type, ...) {
    if (ctx->error) return;
    
    va_list args;
    va_start(args, value_type);
    
    switch (value_type) {
        case SER_NULL:
            serialize_value(ctx, SER_NULL);
            break;
        case SER_INT: {
            int32_t value = va_arg(args, int32_t);
            serialize_value(ctx, SER_INT, value);
            break;
        }
        case SER_FLOAT: {
            float value = (float)va_arg(args, double);
            serialize_value(ctx, SER_FLOAT, value);
            break;
        }
        case SER_STRING: {
            const char *str = va_arg(args, const char *);
            serialize_value(ctx, SER_STRING, str);
            break;
        }
        default:
            ctx->error = 1;
            strcpy(ctx->error_msg, "Invalid value type for array");
    }
    
    va_end(args);
}

// End an array
void serialize_array_end(SerializeCtx *ctx) {
    serialize_value(ctx, SER_ARRAY_END);
}

// Example usage
int main() {
    FILE *fp = fopen("data.bin", "wb");
    if (!fp) {
        perror("Failed to open output file");
        return 1;
    }
    
    SerializeCtx ctx;
    serialize_init(&ctx, fp);
    
    // Create a complex data structure
    serialize_object_start(&ctx);
    
    serialize_object_key_value(&ctx, "name", SER_STRING, "John Doe");
    serialize_object_key_value(&ctx, "age", SER_INT, 30);
    serialize_object_key_value(&ctx, "height", SER_FLOAT, 5.9f);
    
    // Nested object
    serialize_object_key_value(&ctx, "address", SER_OBJECT_START);
    serialize_object_key_value(&ctx, "street", SER_STRING, "123 Main St");
    serialize_object_key_value(&ctx, "city", SER_STRING, "Anytown");
    serialize_object_key_value(&ctx, "zip", SER_STRING, "12345");
    serialize_object_end(&ctx); // End address object
    
    // Array of strings
    serialize_object_key_value(&ctx, "hobbies", SER_ARRAY_START);
    serialize_array_value(&ctx, SER_STRING, "Reading");
    serialize_array_value(&ctx, SER_STRING, "Hiking");
    serialize_array_value(&ctx, SER_STRING, "Programming");
    serialize_array_end(&ctx); // End hobbies array
    
    serialize_object_end(&ctx); // End main object
    
    fclose(fp);
    
    if (serialize_has_error(&ctx)) {
        printf("Serialization error: %s\n", serialize_error(&ctx));
        return 1;
    }
    
    printf("Data successfully serialized to data.bin\n");
    return 0;
}
```

**Key Techniques Demonstrated:**
*   Flexible serialization format with type information
*   Support for nested structures (objects within objects)
*   Support for arrays of mixed types
*   Network byte order for portability
*   Comprehensive error handling
*   Variadic functions for convenient API

**Advantages Over Simple Binary I/O:**
*   **Self-describing format:** Contains type information
*   **Version tolerance:** Can handle missing fields
*   **Cross-platform:** Handles endianness and size differences
*   **Extensible:** New types can be added without breaking old data
*   **Human-readable (with tooling):** Structure is apparent in the binary format

> **"The difference between data and information is organization. Serialization transforms raw bytes into meaningful structures, turning digital chaos into ordered knowledge that can be preserved, transmitted, and understood across time and space."**

## 5.12 Conclusion and Path Forward

This chapter has provided a comprehensive exploration of file I/O and advanced string handling in C, building upon the structure and union foundations established in Chapter 4. We've examined the C stream model, basic and advanced file operations, sophisticated string manipulation techniques, and the integration of these concepts for persistent data storage. We've also addressed critical error handling patterns, security considerations, and performance optimizations, culminating in practical applications demonstrating real-world implementations.

Key concepts mastered include:
*   The stream abstraction and buffering mechanisms underlying C's file I/O
*   Fundamental file operations (opening, reading, writing, closing) with proper error handling
*   Advanced file manipulation (positioning, temporary files, status queries)
*   Sophisticated string conversion, formatting, tokenization, and search techniques
*   Strategies for storing structured data in both text and binary formats
*   Serialization techniques for creating portable data representations
*   Robust error handling patterns specific to file operations
*   Security considerations for file paths, format strings, and buffer management
*   Performance optimization strategies for various I/O scenarios
*   Cross-platform considerations for line endings, path separators, and file system limitations
*   Practical applications across configuration management, log analysis, and data serialization

The examples demonstrated practical applications that transform theoretical concepts into working solutions, illustrating how file I/O and string handling enable the creation of robust, persistent systems. By understanding both the capabilities and limitations of these techniques, you've gained the ability to design efficient, secure data storage and manipulation strategies that form the backbone of reliable C programs.

As you progress, the concepts in this chapter form the essential foundation for more advanced topics:
*   **Chapter 6 (The C Preprocessor)** will explore how preprocessing can enhance file-based operations
*   **Chapter 7 (Advanced Data Structures)** will leverage file I/O for persistent storage of complex structures
*   **Chapter 8 (Multithreading and Concurrency)** will address file access in concurrent environments
*   **Chapter 9 (Networking)** will extend these concepts to network-based data exchange

The discipline required to handle file operations safely—mindful of resource management, vigilant about error conditions, and careful with data representation—is precisely the discipline that separates novice C programmers from proficient software engineers. As you continue your journey, remember that robust file handling is not merely a technical requirement but a fundamental aspect of creating software that persists beyond the immediate execution environment.
