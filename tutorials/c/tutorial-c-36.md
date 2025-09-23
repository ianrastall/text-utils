# 36. C Quick Reference Guide

## 36.1 Comprehensive Syntax Summary

### Basic Program Structure
```c
#include <stdio.h>  // Preprocessor directive for standard I/O

// Function prototype declaration
int add(int a, int b);

int main(void) {    // Entry point - void indicates no parameters
    int result = add(3, 4);
    printf("Result: %d\n", result);
    return 0;       // Success exit code (from stdlib.h: EXIT_SUCCESS = 0)
}

// Function definition
int add(int a, int b) {
    return a + b;
}
```

### Data Types
| **Category**       | **Types**                                                                 | **Size (typical)** | **Range/Notes**                              |
|--------------------|---------------------------------------------------------------------------|--------------------|----------------------------------------------|
| **Basic**          | `char`                                                                    | 1 byte             | -128 to 127 or 0 to 255 (implementation-defined) |
|                    | `signed char`                                                             | 1 byte             | -128 to 127                                  |
|                    | `unsigned char`                                                           | 1 byte             | 0 to 255                                     |
|                    | `int`                                                                     | 4 bytes            | -2,147,483,648 to 2,147,483,647              |
|                    | `unsigned int`                                                            | 4 bytes            | 0 to 4,294,967,295                           |
|                    | `short` or `short int`                                                    | 2 bytes            | -32,768 to 32,767                            |
|                    | `unsigned short`                                                          | 2 bytes            | 0 to 65,535                                  |
|                    | `long` or `long int`                                                      | 4/8 bytes          | -2,147,483,648 to 2,147,483,647 (32-bit)     |
|                    | `unsigned long`                                                           | 4/8 bytes          | 0 to 4,294,967,295 (32-bit)                  |
|                    | `long long` or `long long int`                                            | 8 bytes            | -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |
|                    | `unsigned long long`                                                      | 8 bytes            | 0 to 18,446,744,073,709,551,615              |
|                    | `float`                                                                   | 4 bytes            | 1.2E-38 to 3.4E+38 (6 decimal digits)        |
|                    | `double`                                                                  | 8 bytes            | 2.3E-308 to 1.7E+308 (15 decimal digits)     |
|                    | `long double`                                                             | 10/16 bytes        | Implementation-defined                       |
| **Fixed-width**    | `int8_t`, `int16_t`, `int32_t`, `int64_t`                                 | Exact sizes        | From `<stdint.h>`                            |
|                    | `uint8_t`, `uint16_t`, `uint32_t`, `uint64_t`                             | Exact sizes        | From `<stdint.h>`                            |
| **Boolean**        | `_Bool`                                                                   | 1 byte             | 0 or 1                                       |
|                    | `bool`                                                                    | 1 byte             | From `<stdbool.h>` (true=1, false=0)         |
| **Void**           | `void`                                                                    | N/A                | Represents absence of type                   |

### Type Qualifiers
| **Qualifier**      | **Description**                                                           |
|--------------------|---------------------------------------------------------------------------|
| `const`            | Variable cannot be modified after initialization                          |
| `volatile`         | Variable may change unexpectedly (e.g., hardware registers)               |
| `restrict`         | Pointer is the only way to access the data (C99+, for optimization)       |
| `static`           | Internal linkage (file scope) or persistent storage (function scope)      |
| `extern`           | External linkage (declaration of variable defined elsewhere)              |
| `register`         | Suggests to compiler to store in register (largely ignored by modern compilers) |

### Control Structures
```c
// if-else ladder
if (x > 0) {
    // x is positive
} else if (x < 0) {
    // x is negative
} else {
    // x is zero
}

// switch statement (only works with integer types)
int day = 3;
switch (day) {
    case 1:
        printf("Monday");
        break;
    case 2:
        printf("Tuesday");
        break;
    case 3:
    case 4:
        printf("Midweek");
        break;
    default:
        printf("Weekend or invalid");
}

// while loop
int i = 0;
while (i < 10) {
    printf("%d\n", i++);
}

// for loop (classic)
for (int i = 0; i < 10; i++) {
    printf("%d\n", i);
}

// for loop (C99+ - declaration in initializer)
for (int i = 0, j = 10; i < j; i++, j--) {
    printf("%d %d\n", i, j);
}

// do-while loop (executes at least once)
int count = 0;
do {
    printf("Count: %d\n", count++);
} while (count < 5);

// break and continue
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;  // Skip even numbers
    if (i > 7) break;          // Exit loop early
    printf("Odd number: %d\n", i);
}

// goto (use sparingly)
int error = 0;
if (something_bad) error = 1;
if (something_worse) error = 2;

if (error) {
    goto cleanup;
}

// ... normal processing ...

cleanup:
if (error) {
    printf("Error occurred: %d\n", error);
}
// Cleanup resources
```

### Pointers and Memory Management
```c
// Basic pointer usage
int x = 10;
int *p = &x;      // p points to x
int y = *p;       // y = 10 (dereference)

// Pointer arithmetic
int arr[5] = {1, 2, 3, 4, 5};
int *ptr = arr;
printf("%d\n", *ptr);    // 1
printf("%d\n", *(ptr+1)); // 2
printf("%d\n", ptr[2]);  // 3 (equivalent to *(ptr+2))

// Array vs pointer equivalence
printf("%d\n", arr[0]);   // 1
printf("%d\n", 0[arr]);   // 1 (valid but unusual)
printf("%d\n", *(arr));   // 1
printf("%d\n", *(arr+1)); // 2

// Function pointers
int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }

// Declaration: pointer to function taking two ints and returning int
int (*operation)(int, int);

operation = add;
printf("Add: %d\n", operation(5, 3));  // 8

operation = subtract;
printf("Subtract: %d\n", operation(5, 3));  // 2

// Array of function pointers
int (*operations[2])(int, int) = {add, subtract};
printf("Result: %d\n", operations[0](10, 5));  // 15

// Pointers to pointers
int a = 5;
int *p = &a;
int **pp = &p;
printf("%d\n", **pp);  // 5

// Pointer to function returning pointer to int
int *(*func_ptr)(void) = some_function;

// Pointer to array
int (*array_ptr)[10];  // Pointer to array of 10 ints
```

### Structures, Unions, and Enumerations
```c
// Basic structure
struct Point {
    int x;
    int y;
};
struct Point p1 = {1, 2};
printf("Point: (%d, %d)\n", p1.x, p1.y);

// Structure with designated initializers (C99+)
struct Point p2 = {.x = 3, .y = 4};

// Typedef for cleaner syntax
typedef struct {
    int width;
    int height;
} Rectangle;
Rectangle r = {10, 20};

// Structure with pointer to self (for linked data structures)
typedef struct Node {
    int data;
    struct Node *next;
} Node;

// Union - shares memory among members
union Data {
    int i;
    float f;
    char str[20];
};
union Data data;
data.i = 10;      // Store an integer
printf("%d\n", data.i);  // 10
data.f = 220.5;   // Now store a float (overwrites previous value)
printf("%f\n", data.f);  // 220.500000

// Anonymous union (C11+)
struct {
    char c;
    union {
        int i;
        double d;
    };
} mixed;
mixed.c = 'h';
mixed.i = 123;  // Valid
mixed.d = 3.14; // Also valid (overwrites i)

// Enumerations
typedef enum {
    RED,
    GREEN,
    BLUE
} Color;
Color c = GREEN;

// Enum with specified values
typedef enum {
    ERROR_NONE = 0,
    ERROR_FILE_NOT_FOUND = 2,
    ERROR_PERMISSION_DENIED = 3,
    ERROR_COUNT
} ErrorCode;

// Anonymous enum
enum {
    MAX_BUFFER_SIZE = 1024,
    DEFAULT_TIMEOUT = 5000
};
```

### Preprocessor Directives
```c
// Basic macros
#define PI 3.14159265359
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define SQUARE(x) ((x) * (x))

// Stringification
#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)
printf("Value: " TOSTRING(PI) "\n");  // Value: 3.14159265359

// Token pasting
#define CONCAT(a, b) a ## b
int xy = 10;
printf("%d\n", CONCAT(x, y));  // 10

// Conditional compilation
#define DEBUG 1

#if DEBUG > 0
    #define LOG(msg) printf("[DEBUG] %s\n", msg)
#else
    #define LOG(msg) 
#endif

#ifdef DEBUG
    // Debug-only code
#endif

#ifndef HEADER_GUARD
    #define HEADER_GUARD
    // Header contents
#endif

// #error directive
#if !defined(__GNUC__) && !defined(__clang__)
    #error "This code requires GCC or Clang"
#endif

// Variadic macros (C99+)
#define DEBUG_PRINT(fmt, ...) \
    do { if (DEBUG) fprintf(stderr, fmt, __VA_ARGS__); } while (0)

DEBUG_PRINT("Value: %d, String: %s\n", 42, "hello");

// _Pragma operator (C99+)
#define PRAGMA(x) _Pragma(#x)
PRAGMA(GCC optimize ("O3"))
```

### Compound Literals (C99+)
```c
// Create anonymous objects
int *p = (int[]){1, 2, 3};  // Array literal
printf("%d\n", p[1]);       // 2

// Structure literal
struct Point *point = &(struct Point){.x = 5, .y = 10};
printf("Point: (%d, %d)\n", point->x, point->y);

// Can be used in function calls
draw_circle((struct Circle){.center = (struct Point){10, 20}, .radius = 5});
```

### Designated Initializers (C99+)
```c
// Structure initialization
struct Point p = {.x = 10, .y = 20};

// Array initialization
int arr[5] = {[0] = 1, [2] = 3, [4] = 5};

// Sparse array initialization
int sparse[100] = {
    [10] = 100,
    [20] = 200,
    [99] = 999
};

// Nested designated initializers
struct {
    int a;
    struct {
        int x;
        int y;
    } point;
} nested = {.a = 1, .point = {.x = 2, .y = 3}};
```

### Flexible Array Members (C99+)
```c
// Structure with variable-length data
struct Buffer {
    size_t length;
    char data[];  // Flexible array member (must be last member)
};

// Allocate with extra space for data
struct Buffer *buf = malloc(sizeof(struct Buffer) + 100);
buf->length = 100;
strcpy(buf->data, "Hello, world!");

// Clean up
free(buf);
```

### Anonymous Structures and Unions (C11+)
```c
struct {
    int x;
    union {
        int i;
        float f;
    };  // Anonymous union
} point;

point.x = 10;
point.i = 20;  // Access union members directly
point.f = 3.14; // Also valid (overwrites i)
```

## 36.2 Comprehensive Standard Library Function Reference

### stdio.h - Input/Output
| **Function**         | **Description**                                      | **Example**                                  | **Return Value**                             |
|----------------------|------------------------------------------------------|----------------------------------------------|----------------------------------------------|
| `printf`             | Formatted output to stdout                           | `printf("Value: %d\n", x);`                  | # of characters written or negative on error |
| `fprintf`            | Formatted output to file                             | `fprintf(fp, "Data: %d\n", x);`              | # of characters written or negative on error |
| `sprintf`            | Formatted output to string (unsafe)                  | `sprintf(buf, "Value: %d", x);`              | # of characters written or negative on error |
| `snprintf`           | Formatted output to string with size limit           | `snprintf(buf, sizeof(buf), "Val: %d", x);`  | # of characters that *would have been* written |
| `vprintf`/`vfprintf`/`vsprintf`/`vsnprintf` | Variadic versions of above      | `vsnprintf(buf, size, fmt, args);`           | Same as non-variadic versions                |
| `scanf`              | Formatted input from stdin                           | `scanf("%d", &x);`                           | # of successfully matched items              |
| `fscanf`             | Formatted input from file                            | `fscanf(fp, "%d", &x);`                      | # of successfully matched items              |
| `sscanf`             | Formatted input from string                          | `sscanf(str, "%d", &x);`                     | # of successfully matched items              |
| `vscanf`/`vfscanf`/`vsscanf` | Variadic versions of input functions         | `vsscanf(str, fmt, args);`                   | # of successfully matched items              |
| `fgets`              | Read string from stream (safer than gets)            | `fgets(buffer, sizeof(buffer), stdin);`      | buffer on success, NULL on error/EOF         |
| `fputs`              | Write string to stream                               | `fputs("Hello\n", stdout);`                  | non-negative on success, EOF on error        |
| `fgetc`/`getc`       | Read single character                                | `int c = fgetc(fp);`                         | character or EOF                             |
| `fputc`/`putc`       | Write single character                               | `fputc('A', fp);`                            | character written or EOF on error            |
| `ungetc`             | Push character back onto stream                      | `ungetc(c, fp);`                             | character pushed or EOF on error             |
| `fopen`              | Open file                                            | `FILE *fp = fopen("file.txt", "r");`         | file pointer or NULL on error                |
| `freopen`            | Reopen stream with different file                    | `freopen("newfile.txt", "w", stdout);`       | file pointer or NULL on error                |
| `fclose`             | Close file                                           | `fclose(fp);`                                | 0 on success, EOF on error                   |
| `fflush`             | Flush stream buffer                                  | `fflush(stdout);`                            | 0 on success, EOF on error                   |
| `fseek`              | Set file position                                    | `fseek(fp, 0, SEEK_END);`                    | 0 on success, non-zero on error             |
| `ftell`              | Get current file position                            | `long pos = ftell(fp);`                      | current position or -1L on error             |
| `rewind`             | Set file position to beginning                       | `rewind(fp);`                                | void                                         |
| `fgetpos`/`fsetpos`  | Get/set file position (more robust than fseek/ftell) | `fgetpos(fp, &pos);`                         | 0 on success, non-zero on error              |
| `feof`               | Check for end-of-file                                | `while (!feof(fp)) { ... }`                  | non-zero if EOF, 0 otherwise                 |
| `ferror`             | Check for error                                      | `if (ferror(fp)) { ... }`                    | non-zero if error, 0 otherwise               |
| `clearerr`           | Clear error and EOF indicators                       | `clearerr(fp);`                              | void                                         |
| `setvbuf`            | Set stream buffering                                 | `setvbuf(fp, NULL, _IONBF, 0);`              | 0 on success, non-zero on error              |
| `setbuf`             | Set stream buffering (simplified)                    | `setbuf(fp, buffer);`                        | void                                         |

**File Modes**:
- `"r"`: Read (file must exist)
- `"w"`: Write (creates new file, truncates existing)
- `"a"`: Append (creates new file if needed)
- `"r+"`: Read/update (file must exist)
- `"w+"`: Write/update (creates/truncates)
- `"a+"`: Append/update (creates if needed)
- `"rb"`, `"wb"`, etc.: Binary mode (no newline translation)

### stdlib.h - General Utilities
| **Function**         | **Description**                                      | **Example**                                  | **Return Value**                             |
|----------------------|------------------------------------------------------|----------------------------------------------|----------------------------------------------|
| `malloc`             | Allocate uninitialized memory                        | `int *arr = malloc(10 * sizeof(int));`       | pointer to memory or NULL                    |
| `calloc`             | Allocate and zero-initialize memory                  | `int *arr = calloc(10, sizeof(int));`        | pointer to memory or NULL                    |
| `realloc`            | Resize allocated memory                              | `arr = realloc(arr, 20 * sizeof(int));`      | pointer to memory or NULL                    |
| `free`               | Free allocated memory                                | `free(arr);`                                 | void                                         |
| `exit`               | Terminate program                                    | `exit(EXIT_FAILURE);`                        | does not return                              |
| `atexit`             | Register function to call at exit                    | `atexit(cleanup);`                           | 0 on success, non-zero on failure            |
| `system`             | Execute shell command                                | `system("ls -l");`                           | implementation-defined                       |
| `getenv`             | Get environment variable                             | `char *path = getenv("PATH");`               | value or NULL if not found                   |
| `setenv`             | Set environment variable (POSIX)                     | `setenv("MY_VAR", "value", 1);`              | 0 on success, -1 on error                    |
| `putenv`             | Set environment variable (less safe)                 | `putenv("MY_VAR=value");`                    | 0 on success, non-zero on error              |
| `abort`              | Abort program (causes SIGABRT)                       | `abort();`                                   | does not return                              |
| `abs`/`labs`/`llabs` | Absolute value                                       | `int a = abs(-5);`                           | absolute value                               |
| `div`/`ldiv`/`lldiv` | Integer division                                     | `div_t result = div(10, 3);`                 | quotient and remainder                       |
| `atof`               | Convert string to double                             | `double d = atof("3.14");`                   | converted value                              |
| `atoi`/`atol`/`atoll`| Convert string to int/long/long long                 | `int i = atoi("123");`                       | converted value                              |
| `strtol`/`strtoll`   | Convert string to long/long long                     | `long l = strtol(str, &endptr, 10);`         | converted value                              |
| `strtoul`/`strtoull` | Convert string to unsigned long/long long            | `unsigned long ul = strtoul(str, &endptr, 16);` | converted value                           |
| `strtod`/`strtof`/`strtold` | Convert string to double/float/long double     | `double d = strtod(str, &endptr);`           | converted value                              |
| `rand`/`srand`       | Generate random numbers                              | `srand(time(NULL)); x = rand();`             | random number (0 to RAND_MAX)                |
| `qsort`              | Sort array                                           | `qsort(arr, n, sizeof(int), compare_func);`  | void                                         |
| `bsearch`            | Binary search                                        | `bsearch(key, arr, n, sizeof(int), cmp);`    | pointer to found item or NULL                |
| `mblen`/`mbtowc`/`wctomb` | Multibyte character handling                    | `int len = mblen(s, MB_CUR_MAX);`            | length or -1 on error                        |
| `mbstowcs`/`wcstombs`| Convert between multibyte and wide character strings | `size_t n = mbstowcs(wcs, mbstr, size);`     | # of characters converted                    |

### string.h - String Manipulation
| **Function**         | **Description**                                      | **Example**                                  | **Return Value**                             |
|----------------------|------------------------------------------------------|----------------------------------------------|----------------------------------------------|
| `strcpy`             | Copy string (unsafe - use strlcpy or strncpy)        | `strcpy(dest, src);`                         | dest                                         |
| `strncpy`            | Copy string with size limit                          | `strncpy(dest, src, sizeof(dest)-1);`        | dest                                         |
| `strcat`             | Concatenate strings (unsafe)                         | `strcat(dest, src);`                         | dest                                         |
| `strncat`            | Concatenate with size limit                          | `strncat(dest, src, sizeof(dest)-strlen(dest)-1);` | dest                                      |
| `strlen`             | Get string length                                    | `size_t len = strlen(str);`                  | length (excluding null terminator)           |
| `strcmp`             | Compare strings                                      | `if (strcmp(a, b) == 0) { ... }`             | <0, 0, >0 based on comparison                |
| `strncmp`            | Compare strings up to n characters                   | `if (strncmp(a, b, 10) == 0) { ... }`        | <0, 0, >0 based on comparison                |
| `strcoll`            | Compare strings using locale                         | `if (strcoll(a, b) == 0) { ... }`            | <0, 0, >0 based on locale comparison         |
| `strchr`             | Find first occurrence of character                   | `char *p = strchr(str, 'a');`                | pointer to character or NULL                 |
| `strrchr`            | Find last occurrence of character                    | `char *p = strrchr(str, 'a');`               | pointer to character or NULL                 |
| `strpbrk`            | Find first occurrence in any set of characters       | `char *p = strpbrk(str, "aeiou");`           | pointer to character or NULL                 |
| `strspn`             | Span of characters from set                          | `size_t n = strspn(str, "0123456789");`      | length of span                               |
| `strcspn`            | Span until any character from set                    | `size_t n = strcspn(str, " \t\n");`          | length of span                               |
| `strstr`             | Find substring                                       | `char *p = strstr(str, "needle");`           | pointer to substring or NULL                 |
| `strtok`             | Tokenize string                                      | `char *token = strtok(str, " ,");`           | pointer to next token or NULL                |
| `strxfrm`            | Transform string for comparison                      | `strxfrm(buf, str, size);`                   | length of transformed string                 |
| `memcpy`             | Copy memory blocks                                 | `memcpy(dest, src, n);`                      | dest                                         |
| `memmove`            | Copy memory blocks (safe for overlapping)            | `memmove(dest, src, n);`                     | dest                                         |
| `memcmp`             | Compare memory blocks                                | `if (memcmp(a, b, n) == 0) { ... }`          | <0, 0, >0 based on comparison                |
| `memchr`             | Find character in memory block                       | `void *p = memchr(ptr, 'a', n);`             | pointer to character or NULL                 |
| `memset`             | Fill memory block                                    | `memset(buf, 0, size);`                      | dest                                         |
| `strerror`           | Get string description of error number               | `printf("%s\n", strerror(errno));`           | pointer to error string                      |
| `strdup`             | Duplicate string (POSIX)                             | `char *copy = strdup(original);`              | pointer to duplicate or NULL                 |
| `strndup`            | Duplicate string with length limit (POSIX)           | `char *copy = strndup(str, n);`              | pointer to duplicate or NULL                 |
| `strnlen`            | Get string length with limit (POSIX)                 | `size_t len = strnlen(str, maxlen);`         | min(strlen(str), maxlen)                     |

### math.h - Mathematical Functions
| **Function**         | **Description**                                      | **Example**                                  | **Return Value**                             |
|----------------------|------------------------------------------------------|----------------------------------------------|----------------------------------------------|
| `acos`/`asin`/`atan` | Inverse trigonometric functions                      | `double a = acos(0.5);`                      | result in radians                            |
| `atan2`              | Two-argument arctangent                            | `double a = atan2(y, x);`                    | result in radians                            |
| `cos`/`sin`/`tan`    | Trigonometric functions                              | `double s = sin(M_PI/2);`                    | result                                       |
| `cosh`/`sinh`/`tanh` | Hyperbolic functions                                 | `double sh = sinh(x);`                       | result                                       |
| `acosh`/`asinh`/`atanh` | Inverse hyperbolic functions                       | `double ah = acosh(x);`                      | result                                       |
| `exp`                | Exponential function                                 | `double e = exp(1.0);`                       | e^x                                          |
| `log`                | Natural logarithm                                    | `double l = log(2.718);`                     | ln(x)                                        |
| `log10`              | Base-10 logarithm                                    | `double l = log10(100.0);`                   | log₁₀(x)                                     |
| `log2`               | Base-2 logarithm (C99+)                              | `double l = log2(8.0);`                      | log₂(x)                                      |
| `pow`                | Power function                                       | `double y = pow(2.0, 3.0);`                  | x^y                                          |
| `sqrt`               | Square root                                          | `double x = sqrt(16.0);`                     | √x                                           |
| `cbrt`               | Cube root (C99+)                                     | `double x = cbrt(27.0);`                     | ∛x                                           |
| `hypot`              | Hypotenuse (sqrt(x²+y²)) (C99+)                     | `double h = hypot(3.0, 4.0);`                | √(x²+y²)                                     |
| `exp2`               | Base-2 exponential (C99+)                            | `double e = exp2(3.0);`                      | 2^x                                          |
| `expm1`              | exp(x)-1 (C99+)                                      | `double e = expm1(0.001);`                   | e^x - 1                                      |
| `log1p`              | log(1+x) (C99+)                                      | `double l = log1p(0.001);`                   | ln(1+x)                                      |
| `logb`               | Extract exponent (C99+)                                | `double l = logb(123.45);`                   | floating-point exponent                      |
| `ilogb`              | Integer exponent (C99+)                              | `int i = ilogb(123.45);`                     | integer exponent                             |
| `scalbn`/`scalbln`   | Scale by power of FLT_RADIX (C99+)                   | `double s = scalbn(x, n);`                   | x * FLT_RADIX^n                              |
| `fabs`               | Absolute value (floating-point)                      | `double a = fabs(-3.14);`                    | |x|                                         |
| `fmod`               | Floating-point remainder                             | `double m = fmod(5.3, 2.0);`                 | x - n*y (n = trunc(x/y))                     |
| `remainder`          | IEEE remainder (C99+)                                | `double r = remainder(x, y);`                | x - n*y (n = nearest integer to x/y)         |
| `remquo`             | Remainder and part of quotient (C99+)                | `double r = remquo(x, y, &quo);`             | remainder                                    |
| `copysign`           | Copy sign (C99+)                                     | `double c = copysign(x, y);`                 | |x| with sign of y                          |
| `nan`                | Generate quiet NaN (C99+)                            | `double n = nan("");`                        | quiet NaN                                    |
| `nextafter`/`nexttoward` | Next representable value (C99+)                   | `double n = nextafter(x, y);`                | next representable value                     |
| `fdim`               | Positive difference (C99+)                             | `double d = fdim(x, y);`                     | max(x-y, 0)                                  |
| `fmax`/`fmin`        | Maximum/minimum of two values (C99+)                 | `double m = fmax(x, y);`                     | maximum/minimum                              |
| `fma`                | Fused multiply-add (C99+)                            | `double r = fma(x, y, z);`                   | (x*y)+z (with single rounding)               |
| `ceil`/`floor`       | Round up/down                                        | `double c = ceil(3.14);`                     | rounded value                                |
| `trunc`              | Truncate to integer (C99+)                           | `double t = trunc(3.7);`                     | truncated value                              |
| `round`              | Round to nearest integer (C99+)                      | `double r = round(3.5);`                     | rounded value                                |
| `lround`/`llround`   | Round and convert to integer (C99+)                  | `long l = lround(3.5);`                      | rounded integer                              |
| `rint`/`lrint`/`llrint` | Round to integer (using current rounding mode)     | `double r = rint(3.5);`                      | rounded value                                |
| `nearbyint`          | Round to integer (without raising inexact exception) | `double n = nearbyint(3.5);`                 | rounded value                                |
| `frexp`              | Extract mantissa and exponent                        | `double m = frexp(x, &exp);`                 | mantissa                                     |
| `ldexp`              | Multiply by power of 2                               | `double d = ldexp(m, exp);`                  | m * 2^exp                                    |
| `modf`               | Break into fractional and integer parts              | `double i; double f = modf(x, &i);`          | fractional part                              |
| `isfinite`           | Check if finite (C99+)                               | `if (isfinite(x)) { ... }`                   | non-zero if finite                           |
| `isinf`              | Check if infinite (C99+)                             | `if (isinf(x)) { ... }`                      | non-zero if infinite                         |
| `isnan`              | Check if NaN (C99+)                                  | `if (isnan(x)) { ... }`                      | non-zero if NaN                              |
| `isnormal`           | Check if normal (C99+)                               | `if (isnormal(x)) { ... }`                   | non-zero if normal                           |
| `signbit`            | Check sign bit (C99+)                                | `if (signbit(x)) { ... }`                    | non-zero if negative                         |
| `fpclassify`         | Classify floating-point value (C99+)                 | `int c = fpclassify(x);`                     | FP_NAN, FP_INFINITE, FP_ZERO, FP_SUBNORMAL, FP_NORMAL |

### time.h - Time Functions
| **Function**         | **Description**                                      | **Example**                                  | **Return Value**                             |
|----------------------|------------------------------------------------------|----------------------------------------------|----------------------------------------------|
| `clock`              | Measure processor time                               | `clock_t start = clock();`                   | processor time or (clock_t)-1 on error       |
| `time`               | Get current calendar time                            | `time_t now = time(NULL);`                   | current time or (time_t)-1 on error          |
| `difftime`           | Compute difference between two times                 | `double sec = difftime(t2, t1);`             | difference in seconds                        |
| `mktime`             | Convert tm structure to time_t                       | `time_t t = mktime(&tm);`                    | time_t representation or -1 on error         |
| `asctime`            | Convert tm structure to string                       | `char *str = asctime(&tm);`                  | pointer to string                            |
| `ctime`              | Convert time_t to string                             | `printf("%s", ctime(&now));`                 | pointer to string                            |
| `gmtime`             | Convert time_t to UTC tm structure                   | `struct tm *utc = gmtime(&now);`             | pointer to tm structure                      |
| `localtime`          | Convert time_t to local time tm structure            | `struct tm *local = localtime(&now);`        | pointer to tm structure                      |
| `strftime`           | Format time as string                                | `strftime(buf, sizeof(buf), "%Y-%m-%d", tm);`| # of characters placed in buffer             |
| `wcsftime`           | Wide-character version of strftime                   | `wcsftime(wbuf, size, L"%Y-%m-%d", tm);`    | # of characters placed in buffer             |
| `nanosleep`          | High-resolution sleep (POSIX)                        | `struct timespec ts = {0, 500000000}; nanosleep(&ts, NULL);` | 0 on success, -1 on error |
| `gettimeofday`       | Get current time with microseconds (POSIX)           | `struct timeval tv; gettimeofday(&tv, NULL);` | 0 on success, -1 on error                    |

### ctype.h - Character Handling
| **Function**         | **Description**                                      | **Example**                                  | **Return Value**                             |
|----------------------|------------------------------------------------------|----------------------------------------------|----------------------------------------------|
| `isalnum`            | Check if alphanumeric                                | `if (isalnum(c)) { ... }`                    | non-zero if true                             |
| `isalpha`            | Check if alphabetic                                  | `if (isalpha(c)) { ... }`                    | non-zero if true                             |
| `isblank`            | Check if blank (space or tab) (C99+)                 | `if (isblank(c)) { ... }`                    | non-zero if true                             |
| `iscntrl`            | Check if control character                           | `if (iscntrl(c)) { ... }`                    | non-zero if true                             |
| `isdigit`            | Check if digit                                       | `if (isdigit(c)) { ... }`                    | non-zero if true                             |
| `isgraph`            | Check if printable character (excluding space)         | `if (isgraph(c)) { ... }`                    | non-zero if true                             |
| `islower`            | Check if lowercase letter                            | `if (islower(c)) { ... }`                    | non-zero if true                             |
| `isprint`            | Check if printable character (including space)         | `if (isprint(c)) { ... }`                    | non-zero if true                             |
| `ispunct`            | Check if punctuation character                       | `if (ispunct(c)) { ... }`                    | non-zero if true                             |
| `isspace`            | Check if whitespace character                        | `if (isspace(c)) { ... }`                    | non-zero if true                             |
| `isupper`            | Check if uppercase letter                            | `if (isupper(c)) { ... }`                    | non-zero if true                             |
| `isxdigit`           | Check if hexadecimal digit                           | `if (isxdigit(c)) { ... }`                   | non-zero if true                             |
| `tolower`            | Convert to lowercase                                 | `char c = tolower('A');`                     | lowercase character                          |
| `toupper`            | Convert to uppercase                                 | `char c = toupper('a');`                     | uppercase character                          |

### errno.h - Error Handling
| **Macro**            | **Description**                                      | **Common Values**                            |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `errno`              | Global error number (set by system calls)            | `0` (no error)                               |
| `perror`             | Print error message corresponding to errno           |                                              |
| `strerror`           | Get string description of error number               |                                              |
| `EACCES`             | Permission denied                                    |                                              |
| `EAGAIN`             | Resource temporarily unavailable                   |                                              |
| `EBADF`              | Bad file descriptor                                  |                                              |
| `EFAULT`             | Bad address                                          |                                              |
| `EINVAL`             | Invalid argument                                     |                                              |
| `ENOENT`             | No such file or directory                            |                                              |
| `ENOMEM`             | Cannot allocate memory                               |                                              |
| `ENOSPC`             | No space left on device                              |                                              |
| `ERANGE`             | Result too large                                     |                                              |

### stdarg.h - Variable Arguments
| **Function/Macro**   | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `va_list`            | Type for variable argument list                      | `va_list args;`                              |
| `va_start`           | Initialize variable argument list                    | `va_start(args, last_fixed_param);`          |
| `va_arg`             | Retrieve next argument                               | `int i = va_arg(args, int);`                 |
| `va_end`             | Clean up variable argument list                      | `va_end(args);`                              |
| `va_copy`            | Copy variable argument list (C99+)                   | `va_list args2; va_copy(args2, args);`       |

Example usage:
```c
#include <stdarg.h>
#include <stdio.h>

double average(int count, ...) {
    va_list args;
    va_start(args, count);
    
    double sum = 0.0;
    for (int i = 0; i < count; i++) {
        sum += va_arg(args, double);
    }
    
    va_end(args);
    return sum / count;
}

// Usage
double avg = average(4, 1.5, 2.5, 3.5, 4.5);
```

### assert.h - Diagnostics
| **Macro**            | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `assert`             | Verify condition at runtime                          | `assert(ptr != NULL);`                       |
| `static_assert`      | Verify condition at compile time (C11+)              | `static_assert(sizeof(int) == 4, "int not 4 bytes");` |

### locale.h - Localization
| **Function**         | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `setlocale`          | Set locale                                           | `setlocale(LC_ALL, "en_US.UTF-8");`          |
| `localeconv`         | Get locale-specific numeric formatting               | `struct lconv *lc = localeconv();`           |

### setjmp.h - Non-local Jumps
| **Function/Macro**   | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `setjmp`             | Save environment for later jump                      | `if (setjmp(env) == 0) { ... }`              |
| `longjmp`            | Restore environment and jump back                    | `longjmp(env, 1);`                           |

Example usage:
```c
#include <setjmp.h>
#include <stdio.h>

jmp_buf env;

void error_handler() {
    longjmp(env, 1);
}

int main() {
    if (setjmp(env) == 0) {
        // Normal execution
        printf("Starting...\n");
        error_handler();
    } else {
        // Error recovery
        printf("Error occurred!\n");
    }
    return 0;
}
```

### signal.h - Signal Handling
| **Function/Macro**   | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `signal`             | Set signal handler                                   | `signal(SIGINT, handler);`                   |
| `raise`              | Raise signal                                         | `raise(SIGTERM);`                            |
| `SIG_DFL`/`SIG_IGN`  | Default/ignore signal                                | `signal(SIGINT, SIG_DFL);`                   |

Common signals:
- `SIGABRT`: Abort signal from `abort()`
- `SIGFPE`: Floating-point exception
- `SIGILL`: Illegal instruction
- `SIGINT`: Interrupt signal (Ctrl+C)
- `SIGSEGV`: Invalid memory access
- `SIGTERM`: Termination request

### stdatomic.h - Atomic Operations (C11+)
| **Function/Macro**   | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `atomic_flag`        | Simple atomic boolean flag                           | `atomic_flag flag = ATOMIC_FLAG_INIT;`       |
| `atomic_init`        | Initialize atomic variable                           | `atomic_init(&counter, 0);`                  |
| `atomic_store`       | Store value atomically                               | `atomic_store(&counter, 10);`                |
| `atomic_load`        | Load value atomically                                | `int val = atomic_load(&counter);`           |
| `atomic_exchange`    | Exchange values atomically                           | `int old = atomic_exchange(&counter, 10);`   |
| `atomic_compare_exchange_weak`/`strong` | Compare and exchange atomically       | `bool success = atomic_compare_exchange_strong(&counter, &expected, 10);` |
| `atomic_fetch_add`/`sub`/`or`/`and`/`xor` | Atomic arithmetic/bitwise operations | `int old = atomic_fetch_add(&counter, 1);` |
| `memory_order`       | Memory ordering constraints                          | `atomic_store_explicit(&x, 1, memory_order_release);` |

### threads.h - Threading (C11+)
| **Function/Macro**   | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `thrd_t`             | Thread identifier                                    | `thrd_t thread;`                             |
| `thrd_create`        | Create thread                                        | `thrd_create(&thread, func, arg);`           |
| `thrd_join`          | Wait for thread to complete                          | `thrd_join(thread, &result);`                |
| `thrd_exit`          | Terminate thread                                     | `thrd_exit(result);`                         |
| `thrd_detach`        | Detach thread                                        | `thrd_detach(thread);`                       |
| `thrd_sleep`         | Sleep for specified time                             | `thrd_sleep(&ts, &rem);`                     |
| `thrd_yield`         | Yield thread execution                               | `thrd_yield();`                              |
| `mtx_t`              | Mutex type                                           | `mtx_t mutex;`                               |
| `mtx_init`           | Initialize mutex                                       | `mtx_init(&mutex, mtx_plain);`             |
| `mtx_lock`/`mtx_trylock` | Lock mutex                                       | `mtx_lock(&mutex);`                          |
| `mtx_unlock`         | Unlock mutex                                         | `mtx_unlock(&mutex);`                        |
| `cnd_t`              | Condition variable type                              | `cnd_t cond;`                                |
| `cnd_init`           | Initialize condition variable                        | `cnd_init(&cond);`                           |
| `cnd_signal`/`cnd_broadcast` | Signal condition variable                     | `cnd_signal(&cond);`                         |
| `cnd_wait`           | Wait on condition variable                           | `cnd_wait(&cond, &mutex);`                   |
| `tss_t`              | Thread-specific storage key                          | `tss_t key;`                                 |
| `tss_create`         | Create thread-specific storage                       | `tss_create(&key, destructor);`              |
| `tss_set`/`tss_get`  | Set/get thread-specific value                        | `tss_set(key, value);`                       |

### inttypes.h - Format Macros for Integer Types (C99+)
| **Macro**            | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `PRId8`              | Format specifier for int8_t                          | `printf("Value: %" PRId8 "\n", x);`          |
| `PRIi8`              | Format specifier for int8_t (alternate)              | `printf("Value: %" PRIi8 "\n", x);`          |
| `PRIo8`              | Format specifier for octal int8_t                    | `printf("Value: %" PRIo8 "\n", x);`          |
| `PRIu8`              | Format specifier for unsigned int8_t                 | `printf("Value: %" PRIu8 "\n", x);`          |
| `PRIx8`/`PRIX8`      | Format specifier for hex int8_t (lower/upper case)   | `printf("Value: %" PRIx8 "\n", x);`          |
| `PRId16`/`PRId32`/`PRId64` | Format specifiers for various integer sizes      | `printf("Value: %" PRId64 "\n", x);`        |
| `SCNd8`/`SCNi8`/etc. | Scanf format specifiers                              | `scanf("%" SCNd32, &x);`                     |

### stdbool.h - Boolean Type (C99+)
| **Macro/Value**      | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `bool`               | Boolean type                                         | `bool flag = true;`                          |
| `true`               | Boolean true value                                   | `if (flag == true) { ... }`                  |
| `false`              | Boolean false value                                  | `flag = false;`                              |

### stddef.h - Common Definitions
| **Definition**       | **Description**                                      | **Example**                                  |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `NULL`               | Null pointer constant                                | `int *ptr = NULL;`                           |
| `offsetof`           | Offset of field within structure                     | `size_t offset = offsetof(struct S, field);` |
| `ptrdiff_t`          | Signed integer type for pointer differences          | `ptrdiff_t diff = &a - &b;`                   |
| `size_t`             | Unsigned integer type for sizes                      | `size_t len = strlen(str);`                  |
| `wchar_t`            | Wide character type                                  | `wchar_t wc = L'Ω';`                         |

### limits.h - Implementation Limits
| **Definition**       | **Description**                                      | **Typical Value**                            |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `CHAR_BIT`           | Number of bits in a char                             | 8                                            |
| `SCHAR_MIN`/`SCHAR_MAX` | Range of signed char                             | -128 to 127                                  |
| `UCHAR_MAX`          | Range of unsigned char                               | 0 to 255                                     |
| `CHAR_MIN`/`CHAR_MAX` | Range of char (depends on implementation)          | -128 to 127 or 0 to 255                      |
| `MB_LEN_MAX`         | Maximum multibyte characters in a wide character     | 6                                            |
| `SHRT_MIN`/`SHRT_MAX` | Range of short int                               | -32,768 to 32,767                            |
| `USHRT_MAX`          | Range of unsigned short                              | 0 to 65,535                                  |
| `INT_MIN`/`INT_MAX`  | Range of int                                         | -2,147,483,648 to 2,147,483,647              |
| `UINT_MAX`           | Range of unsigned int                                | 0 to 4,294,967,295                           |
| `LONG_MIN`/`LONG_MAX` | Range of long int                                | -2,147,483,648 to 2,147,483,647 (32-bit)     |
| `ULONG_MAX`          | Range of unsigned long                               | 0 to 4,294,967,295 (32-bit)                  |
| `LLONG_MIN`/`LLONG_MAX` | Range of long long                               | -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |
| `ULLONG_MAX`         | Range of unsigned long long                          | 0 to 18,446,744,073,709,551,615              |

### float.h - Floating-Point Limits
| **Definition**       | **Description**                                      | **Typical Value**                            |
|----------------------|------------------------------------------------------|----------------------------------------------|
| `FLT_RADIX`          | Radix of exponent representation                     | 2                                            |
| `FLT_MANT_DIG`       | Number of radix digits in mantissa (float)           | 24                                           |
| `DBL_MANT_DIG`       | Number of radix digits in mantissa (double)          | 53                                           |
| `LDBL_MANT_DIG`      | Number of radix digits in mantissa (long double)     | 64 or 113                                    |
| `FLT_DIG`            | Decimal digits of precision (float)                  | 6                                            |
| `DBL_DIG`            | Decimal digits of precision (double)                 | 15                                           |
| `LDBL_DIG`           | Decimal digits of precision (long double)            | 18 or 33                                     |
| `FLT_MIN_EXP`        | Minimum negative integer such that FLT_RADIX raised to that power minus 1 is a normalized float | -125 |
| `DBL_MIN_EXP`        | Same for double                                      | -1021                                        |
| `LDBL_MIN_EXP`       | Same for long double                                 | -16381 or -967                               |
| `FLT_MIN_10_EXP`     | Minimum negative integer such that 10 raised to that power is a normalized float | -37 |
| `DBL_MIN_10_EXP`     | Same for double                                      | -307                                         |
| `LDBL_MIN_10_EXP`    | Same for long double                                 | -307 or -4932                                |
| `FLT_MAX_EXP`        | Maximum integer such that FLT_RADIX raised to that power minus 1 is a representable finite float | 128 |
| `DBL_MAX_EXP`        | Same for double                                      | 1024                                         |
| `LDBL_MAX_EXP`       | Same for long double                                 | 16384 or 1024                                |
| `FLT_MAX_10_EXP`     | Maximum integer such that 10 raised to that power is a representable finite float | 38 |
| `DBL_MAX_10_EXP`     | Same for double                                      | 308                                          |
| `LDBL_MAX_10_EXP`    | Same for long double                                 | 308 or 4932                                  |
| `FLT_MAX`            | Maximum representable float                          | 3.402823466e+38F                             |
| `DBL_MAX`            | Maximum representable double                         | 1.7976931348623158e+308                     |
| `LDBL_MAX`           | Maximum representable long double                    | 1.18973149535723176502e+4932L               |
| `FLT_EPSILON`        | Difference between 1 and the least value greater than 1 that is representable (float) | 1.19209290e-07F |
| `DBL_EPSILON`        | Same for double                                      | 2.2204460492503131e-16                      |
| `LDBL_EPSILON`       | Same for long double                                 | 1.08420217248550443401e-19L                 |
| `FLT_MIN`            | Minimum normalized positive float                    | 1.175494351e-38F                             |
| `DBL_MIN`            | Minimum normalized positive double                   | 2.2250738585072014e-308                     |
| `LDBL_MIN`           | Minimum normalized positive long double              | 3.36210314311209350626e-4932L               |

## 36.3 Common Idioms and Patterns

### Memory Management Patterns

#### Safe Memory Allocation
```c
// Safe allocation with error checking
void *safe_malloc(size_t size) {
    void *ptr = malloc(size);
    if (!ptr) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }
    return ptr;
}

// Safer calloc with overflow check
void *safe_calloc(size_t nmemb, size_t size) {
    if (nmemb && SIZE_MAX / nmemb < size) {
        fprintf(stderr, "Memory allocation overflow\n");
        exit(EXIT_FAILURE);
    }
    return calloc(nmemb, size);
}

// Safe realloc with overflow check
void *safe_realloc(void *ptr, size_t nmemb, size_t size) {
    if (nmemb && SIZE_MAX / nmemb < size) {
        fprintf(stderr, "Memory allocation overflow\n");
        exit(EXIT_FAILURE);
    }
    void *new_ptr = realloc(ptr, nmemb * size);
    if (!new_ptr) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }
    return new_ptr;
}
```

#### Memory Context Pattern (for batch freeing)
```c
typedef struct MemContext {
    void **blocks;
    size_t capacity;
    size_t count;
} MemContext;

bool memctx_init(MemContext *ctx, size_t initial_capacity) {
    ctx->blocks = malloc(initial_capacity * sizeof(void *));
    if (!ctx->blocks) return false;
    ctx->capacity = initial_capacity;
    ctx->count = 0;
    return true;
}

void *memctx_alloc(MemContext *ctx, size_t size) {
    // Grow if needed
    if (ctx->count >= ctx->capacity) {
        size_t new_capacity = ctx->capacity * 2;
        void **new_blocks = realloc(ctx->blocks, new_capacity * sizeof(void *));
        if (!new_blocks) return NULL;
        ctx->blocks = new_blocks;
        ctx->capacity = new_capacity;
    }
    
    // Allocate memory
    void *ptr = malloc(size);
    if (!ptr) return NULL;
    
    // Track allocation
    ctx->blocks[ctx->count++] = ptr;
    return ptr;
}

void memctx_free_all(MemContext *ctx) {
    for (size_t i = 0; i < ctx->count; i++) {
        free(ctx->blocks[i]);
    }
    free(ctx->blocks);
    ctx->blocks = NULL;
    ctx->count = 0;
}

// Usage
MemContext ctx;
memctx_init(&ctx, 10);
char *str1 = memctx_alloc(&ctx, 100);
char *str2 = memctx_alloc(&ctx, 200);
// ... use strings ...
memctx_free_all(&ctx);  // Frees all at once
```

#### RAII Pattern in C (Resource Acquisition Is Initialization)
```c
typedef struct {
    FILE *fp;
    bool valid;
} FileHandle;

bool file_open(FileHandle *handle, const char *filename, const char *mode) {
    handle->fp = fopen(filename, mode);
    handle->valid = (handle->fp != NULL);
    return handle->valid;
}

void file_close(FileHandle *handle) {
    if (handle->valid && handle->fp) {
        fclose(handle->fp);
        handle->fp = NULL;
    }
    handle->valid = false;
}

#ifdef __GNUC__
#define AUTO_CLOSE __attribute__((cleanup(file_close_auto)))
#else
#define AUTO_CLOSE
#endif

static inline void file_close_auto(FileHandle *handle) {
    file_close(handle);
}

// Usage with automatic cleanup
void process_file(const char *filename) {
    FileHandle AUTO_CLOSE file = {0};
    if (!file_open(&file, filename, "r")) {
        log_error("Failed to open file: %s", filename);
        return;
    }
    
    // Process file - will auto-close on return
    char buffer[256];
    while (fgets(buffer, sizeof(buffer), file.fp)) {
        // ...
    }
}
```

### Error Handling Patterns

#### Result Type Pattern
```c
typedef enum {
    OK = 0,
    ERR_INVALID_PARAM,
    ERR_IO,
    ERR_MEMORY,
    ERR_NOT_FOUND,
    ERR_COUNT
} ErrorCode;

typedef struct {
    ErrorCode code;
    char message[256];
} Result;

// Create success result
Result ok_result() {
    return (Result){.code = OK};
}

// Create error result
Result error_result(ErrorCode code, const char *format, ...) {
    Result result = {.code = code};
    va_list args;
    va_start(args, format);
    vsnprintf(result.message, sizeof(result.message), format, args);
    va_end(args);
    return result;
}

// Process data with result type
Result process_data(const char *input, size_t len) {
    if (!input) {
        return error_result(ERR_INVALID_PARAM, "Null input pointer");
    }
    
    if (len == 0) {
        return error_result(ERR_INVALID_PARAM, "Zero-length input");
    }
    
    // Process data...
    
    return ok_result();
}

// Usage
Result result = process_data(buffer, len);
if (result.code != OK) {
    fprintf(stderr, "Error %d: %s\n", result.code, result.message);
    return 1;
}
```

#### Error Chain Pattern
```c
typedef struct Error {
    ErrorCode code;
    char message[128];
    struct Error *cause;
} Error;

void error_init(Error *err) {
    err->code = OK;
    err->message[0] = '\0';
    err->cause = NULL;
}

void error_set(Error *err, ErrorCode code, const char *format, ...) {
    err->code = code;
    va_list args;
    va_start(args, format);
    vsnprintf(err->message, sizeof(err->message), format, args);
    va_end(args);
    err->cause = NULL;
}

void error_chain(Error *err, Error *cause, const char *format, ...) {
    err->code = cause->code;
    va_list args;
    va_start(args, format);
    vsnprintf(err->message, sizeof(err->message), format, args);
    va_end(args);
    err->cause = cause;
}

void error_print(const Error *err) {
    if (err->code == OK) return;
    
    printf("Error: %s", err->message);
    if (err->cause) {
        printf(" [caused by: ");
        error_print(err->cause);
        printf("]");
    }
    printf("\n");
}

// Usage
Error db_err;
error_set(&db_err, ERR_IO, "Database connection failed");

Error app_err;
error_chain(&app_err, &db_err, "Failed to process request");

error_print(&app_err);
// Output: Error: Failed to process request [caused by: Database connection failed]
```

### Data Structure Patterns

#### Structure of Arrays (SoA) vs Array of Structures (AoS)
```c
// Array of Structures (AoS) - poor cache utilization
typedef struct {
    float x, y, z;
    float vx, vy, vz;
} ParticleAoS;

ParticleAoS particles_aos[1000];

// Process positions (causes many cache misses)
void update_positions_aos(float dt) {
    for (int i = 0; i < 1000; i++) {
        particles_aos[i].x += particles_aos[i].vx * dt;
        particles_aos[i].y += particles_aos[i].vy * dt;
        particles_aos[i].z += particles_aos[i].vz * dt;
    }
}

// Structure of Arrays (SoA) - excellent cache utilization
typedef struct {
    float x[1000];
    float y[1000];
    float z[1000];
    float vx[1000];
    float vy[1000];
    float vz[1000];
} ParticlesSoA;

ParticlesSoA particles_soa;

// Process positions (cache-friendly)
void update_positions_soa(float dt) {
    for (int i = 0; i < 1000; i++) {
        particles_soa.x[i] += particles_soa.vx[i] * dt;
        particles_soa.y[i] += particles_soa.vy[i] * dt;
        particles_soa.z[i] += particles_soa.vz[i] * dt;
    }
}
```

#### Type-Safe Enumerations
```c
// Traditional enum (not type-safe)
typedef enum {
    STATUS_OK,
    STATUS_ERROR,
    STATUS_TIMEOUT
} Status;

// Type-safe enum pattern
typedef uint8_t Status;
#define STATUS_OK      ((Status)0)
#define STATUS_ERROR   ((Status)1)
#define STATUS_TIMEOUT ((Status)2)

static inline bool is_valid_status(Status s) {
    return s <= STATUS_TIMEOUT;
}

// Usage
Status get_status() {
    return STATUS_OK;
}

void process_status(Status s) {
    if (!is_valid_status(s)) {
        // Handle invalid status
        return;
    }
    // Process status
}
```

#### Opaque Type Pattern
```c
// header.h
#ifndef MYLIB_H
#define MYLIB_H

typedef struct Database Database;

Database *db_connect(const char *host, int port);
void db_disconnect(Database *db);
int db_query(Database *db, const char *sql, void (*callback)(void *row));

#endif

// implementation.c
#include "mylib.h"
#include <stdlib.h>

struct Database {
    // Private implementation details
    int connection_id;
    char *host;
    int port;
    bool connected;
};

Database *db_connect(const char *host, int port) {
    Database *db = malloc(sizeof(Database));
    if (!db) return NULL;
    
    db->host = strdup(host);
    if (!db->host) {
        free(db);
        return NULL;
    }
    
    db->port = port;
    db->connected = false;
    
    // Connect to database...
    
    return db;
}

void db_disconnect(Database *db) {
    if (!db) return;
    free(db->host);
    free(db);
}
```

### Concurrency Patterns

#### Mutex-Protected Data
```c
#include <pthread.h>

typedef struct {
    int value;
    pthread_mutex_t mutex;
} SafeInt;

bool safe_int_init(SafeInt *si) {
    si->value = 0;
    return pthread_mutex_init(&si->mutex, NULL) == 0;
}

void safe_int_destroy(SafeInt *si) {
    pthread_mutex_destroy(&si->mutex);
}

int safe_int_get(SafeInt *si) {
    pthread_mutex_lock(&si->mutex);
    int value = si->value;
    pthread_mutex_unlock(&si->mutex);
    return value;
}

void safe_int_set(SafeInt *si, int value) {
    pthread_mutex_lock(&si->mutex);
    si->value = value;
    pthread_mutex_unlock(&si->mutex);
}

// Usage
SafeInt counter;
safe_int_init(&counter);
safe_int_set(&counter, 42);
printf("Counter: %d\n", safe_int_get(&counter));
safe_int_destroy(&counter);
```

#### Thread Pool Pattern
```c
typedef struct {
    void (*function)(void *arg);
    void *arg;
} Task;

typedef struct {
    Task *tasks;
    size_t capacity;
    size_t head;
    size_t tail;
    size_t count;
    pthread_mutex_t mutex;
    pthread_cond_t cond;
    bool shutdown;
} TaskQueue;

typedef struct {
    pthread_t *threads;
    size_t thread_count;
    TaskQueue queue;
} ThreadPool;

bool thread_pool_init(ThreadPool *pool, size_t num_threads) {
    // Initialize task queue
    pool->queue.tasks = malloc(1024 * sizeof(Task));
    if (!pool->queue.tasks) return false;
    pool->queue.capacity = 1024;
    pool->queue.head = 0;
    pool->queue.tail = 0;
    pool->queue.count = 0;
    if (pthread_mutex_init(&pool->queue.mutex, NULL) != 0) {
        free(pool->queue.tasks);
        return false;
    }
    if (pthread_cond_init(&pool->queue.cond, NULL) != 0) {
        pthread_mutex_destroy(&pool->queue.mutex);
        free(pool->queue.tasks);
        return false;
    }
    pool->queue.shutdown = false;
    
    // Create threads
    pool->threads = malloc(num_threads * sizeof(pthread_t));
    if (!pool->threads) {
        pthread_cond_destroy(&pool->queue.cond);
        pthread_mutex_destroy(&pool->queue.mutex);
        free(pool->queue.tasks);
        return false;
    }
    pool->thread_count = num_threads;
    
    // Start worker threads
    for (size_t i = 0; i < num_threads; i++) {
        if (pthread_create(&pool->threads[i], NULL, worker_thread, pool) != 0) {
            // Cleanup on error
            pool->queue.shutdown = true;
            pthread_cond_broadcast(&pool->queue.cond);
            for (size_t j = 0; j < i; j++) {
                pthread_join(pool->threads[j], NULL);
            }
            free(pool->threads);
            pthread_cond_destroy(&pool->queue.cond);
            pthread_mutex_destroy(&pool->queue.mutex);
            free(pool->queue.tasks);
            return false;
        }
    }
    
    return true;
}

void *worker_thread(void *arg) {
    ThreadPool *pool = arg;
    
    while (1) {
        pthread_mutex_lock(&pool->queue.mutex);
        
        // Wait for task or shutdown
        while (pool->queue.count == 0 && !pool->queue.shutdown) {
            pthread_cond_wait(&pool->queue.cond, &pool->queue.mutex);
        }
        
        if (pool->queue.shutdown) {
            pthread_mutex_unlock(&pool->queue.mutex);
            break;
        }
        
        // Get task
        Task task = pool->queue.tasks[pool->queue.head];
        pool->queue.head = (pool->queue.head + 1) % pool->queue.capacity;
        pool->queue.count--;
        
        pthread_mutex_unlock(&pool->queue.mutex);
        
        // Execute task
        task.function(task.arg);
    }
    
    return NULL;
}

bool thread_pool_submit(ThreadPool *pool, void (*function)(void *), void *arg) {
    pthread_mutex_lock(&pool->queue.mutex);
    
    if (pool->queue.shutdown) {
        pthread_mutex_unlock(&pool->queue.mutex);
        return false;
    }
    
    // Check if queue is full
    if (pool->queue.count == pool->queue.capacity) {
        pthread_mutex_unlock(&pool->queue.mutex);
        return false;
    }
    
    // Add task
    size_t next_tail = (pool->queue.tail + 1) % pool->queue.capacity;
    pool->queue.tasks[pool->queue.tail] = (Task){function, arg};
    pool->queue.tail = next_tail;
    pool->queue.count++;
    
    pthread_cond_signal(&pool->queue.cond);
    pthread_mutex_unlock(&pool->queue.mutex);
    
    return true;
}

void thread_pool_shutdown(ThreadPool *pool) {
    pthread_mutex_lock(&pool->queue.mutex);
    pool->queue.shutdown = true;
    pthread_cond_broadcast(&pool->queue.cond);
    pthread_mutex_unlock(&pool->queue.mutex);
    
    // Wait for all threads to finish
    for (size_t i = 0; i < pool->thread_count; i++) {
        pthread_join(pool->threads[i], NULL);
    }
    
    // Cleanup
    free(pool->threads);
    free(pool->queue.tasks);
    pthread_mutex_destroy(&pool->queue.mutex);
    pthread_cond_destroy(&pool->queue.cond);
}
```

### Functional Programming Patterns

#### Function Composition
```c
typedef int (*UnaryFunction)(int);

int compose(UnaryFunction f, UnaryFunction g, int x) {
    return f(g(x));
}

// Example functions
int square(int x) { return x * x; }
int increment(int x) { return x + 1; }

// Usage
int result = compose(square, increment, 5);  // square(increment(5)) = 36
```

#### Higher-Order Functions
```c
// Map function for arrays
void map_int(int *array, size_t size, int (*transform)(int)) {
    for (size_t i = 0; i < size; i++) {
        array[i] = transform(array[i]);
    }
}

// Filter function for arrays
size_t filter_int(int *array, size_t size, bool (*predicate)(int), int *out_array) {
    size_t count = 0;
    for (size_t i = 0; i < size; i++) {
        if (predicate(array[i])) {
            out_array[count++] = array[i];
        }
    }
    return count;
}

// Example usage
int double_value(int x) { return x * 2; }
bool is_even(int x) { return x % 2 == 0; }

int main() {
    int numbers[] = {1, 2, 3, 4, 5};
    size_t size = sizeof(numbers) / sizeof(numbers[0]);
    
    // Double all numbers
    map_int(numbers, size, double_value);
    
    // Filter even numbers
    int even_numbers[5];
    size_t even_count = filter_int(numbers, size, is_even, even_numbers);
    
    return 0;
}
```

## 36.4 Best Practices Checklist

### Memory Management
- [ ] Always check return value of `malloc`, `calloc`, `realloc`
- [ ] Initialize pointers to `NULL` after freeing
- [ ] Avoid memory leaks by ensuring all allocations have corresponding frees
- [ ] Use `calloc` instead of `malloc` + manual zeroing when appropriate
- [ ] Prefer stack allocation for small, fixed-size data
- [ ] Use tools like Valgrind, AddressSanitizer to detect memory issues
- [ ] Validate pointer before dereferencing
- [ ] Check array bounds before access
- [ ] Use flexible array members for variable-length structures
- [ ] Implement memory context pattern for complex allocations

### Error Handling
- [ ] Check return values of all system calls and library functions
- [ ] Use meaningful error messages with context
- [ ] Consider using result types instead of raw error codes
- [ ] Don't ignore `errno` after system calls that can fail
- [ ] Clean up resources before returning from error conditions
- [ ] Use `perror` or `strerror` for system error messages
- [ ] Implement error chaining for better diagnostics
- [ ] Validate function parameters at entry points
- [ ] Use assertions for internal invariants
- [ ] Document error conditions in function comments

### Security
- [ ] Never use `gets`, `strcpy`, `strcat`, `sprintf` without size limits
- [ ] Always validate input from untrusted sources
- [ ] Use `snprintf` instead of `sprintf`
- [ ] Use `strncpy` with proper null-termination
- [ ] Validate array indices before access
- [ ] Consider stack protection (`-fstack-protector-strong`)
- [ ] Enable `_FORTIFY_SOURCE=2` for additional checks
- [ ] Use `restrict` keyword where appropriate
- [ ] Implement safe string handling wrappers
- [ ] Be aware of format string vulnerabilities

### Code Quality
- [ ] Use `const` for read-only data
- [ ] Use `static` for file-scope functions/variables
- [ ] Prefer `size_t` for sizes and counts
- [ ] Avoid global variables where possible
- [ ] Use enums instead of magic numbers
- [ ] Document non-obvious code
- [ ] Keep functions small and focused (< 50 lines)
- [ ] Follow consistent naming conventions
- [ ] Use meaningful variable names
- [ ] Avoid deep nesting (max 3-4 levels)
- [ ] Prefer early returns over deep nesting
- [ ] Use designated initializers for structures
- [ ] Use compound literals where appropriate
- [ ] Avoid unnecessary type casts
- [ ] Use `stdbool.h` for boolean values
- [ ] Use `stdint.h` for fixed-width types when needed
- [ ] Check for integer overflow in arithmetic operations
- [ ] Use `assert` for internal invariants

### Performance
- [ ] Understand memory access patterns (cache-friendly code)
- [ ] Minimize branch mispredictions in critical paths
- [ ] Use appropriate data structures for the task
- [ ] Consider loop unrolling for performance-critical loops
- [ ] Avoid unnecessary memory allocations in hot paths
- [ ] Profile before optimizing
- [ ] Use Structure of Arrays (SoA) for data processing
- [ ] Align data structures to cache line boundaries
- [ ] Use compiler hints like `__builtin_expect`
- [ ] Consider manual vectorization for critical paths
- [ ] Minimize function call overhead in hot paths
- [ ] Use inline functions for small, frequently called functions

### Portability
- [ ] Avoid compiler-specific extensions when possible
- [ ] Be aware of endianness issues with binary data
- [ ] Consider alignment requirements across platforms
- [ ] Use fixed-width types (`int32_t`, etc.) when exact sizes matter
- [ ] Avoid assumptions about `int` size (use `long` or fixed-width types)
- [ ] Be careful with bit-fields (implementation-defined behavior)
- [ ] Test on multiple platforms and compilers
- [ ] Use standard C features rather than POSIX-specific ones when possible
- [ ] Handle newline differences between platforms
- [ ] Avoid assumptions about file system structure

### Modern C Features
- [ ] Use C99/C11 features where supported by your toolchain
- [ ] Use designated initializers for structure initialization
- [ ] Use compound literals for anonymous objects
- [ ] Use flexible array members for variable-length data
- [ ] Use `static_assert` for compile-time checks
- [ ] Use `_Alignas` and `_Alignof` for alignment control
- [ ] Consider `threads.h` for portable threading (C11+)
- [ ] Use `atomic` operations for thread-safe programming (C11+)
- [ ] Use `_Generic` for type-generic macros (C11+)

### Testing
- [ ] Write unit tests for critical functionality
- [ ] Test edge cases and error conditions
- [ ] Use fuzz testing for input processing code
- [ ] Test with AddressSanitizer and UndefinedBehaviorSanitizer
- [ ] Verify memory safety with Valgrind
- [ ] Test performance characteristics
- [ ] Test on multiple platforms and architectures
- [ ] Verify thread safety with ThreadSanitizer
- [ ] Use code coverage tools to identify untested code

### Documentation
- [ ] Document function purpose, parameters, and return values
- [ ] Document error conditions and expected behavior
- [ ] Document thread safety guarantees
- [ ] Document memory ownership rules
- [ ] Keep documentation up-to-date with code changes
- [ ] Use consistent documentation style
- [ ] Document design decisions in code comments
- [ ] Document limitations and known issues

## 36.5 Troubleshooting Guide

### Segmentation Fault (SIGSEGV)
**Common Causes**:
- Dereferencing a null pointer
- Accessing freed memory
- Buffer overflow (array index out of bounds)
- Stack overflow (deep recursion or large stack allocation)
- Uninitialized pointer
- Memory alignment issues
- Use after free
- Double free
- Stack corruption

**Debugging Steps**:
1. Compile with debugging symbols: `gcc -g -o program program.c`
2. Run in GDB: `gdb ./program`
3. When it crashes: `bt` (backtrace) to see where it happened
4. Examine variables: `print variable`
5. Check memory access: `x/4x &pointer` to examine memory
6. Use `info frame` to see current stack frame
7. Use `disassemble` to see assembly code around crash

**Quick Fixes**:
- Initialize all pointers to NULL
- Check pointer before dereferencing
- Verify array bounds before access
- Use AddressSanitizer: `gcc -fsanitize=address -g program.c`
- Check for stack overflow (large local arrays, deep recursion)
- Verify memory alignment for SIMD operations
- Use Valgrind: `valgrind --tool=memcheck ./program`

### Memory Leaks
**Common Causes**:
- Forgetting to free allocated memory
- Losing pointer to allocated memory
- Not freeing in all code paths (especially error conditions)
- Circular references in data structures
- Failure to clean up resources in error handling

**Debugging Steps**:
1. Use Valgrind: `valgrind --leak-check=full ./program`
2. Look for "definitely lost" blocks in output
3. Note allocation stack traces
4. Check all allocation paths for matching frees
5. Use AddressSanitizer: `gcc -fsanitize=address program.c`

**Quick Fixes**:
- Use RAII pattern with cleanup attributes (GCC)
- Create a memory tracking system for critical paths
- Implement a memory context system for batch freeing
- Use smart pointers pattern (wrapper functions)
- Implement a resource cleanup function that handles all resources

### Buffer Overflow
**Common Causes**:
- Using `strcpy` instead of `strncpy`
- Using `sprintf` instead of `snprintf`
- Incorrect array bounds calculations
- Not accounting for null terminator
- Off-by-one errors
- Misusing pointer arithmetic

**Debugging Steps**:
1. Compile with `-fsanitize=address` (AddressSanitizer)
2. Run program - ASan will report overflow location
3. Check buffer sizes and copy operations
4. Verify all string operations include space for null terminator
5. Use Valgrind's memcheck tool

**Quick Fixes**:
- Replace `strcpy` with `strncpy` + manual null termination
- Replace `sprintf` with `snprintf`
- Use safe string functions (consider implementing your own)
- Add buffer size checks before operations
- Use designated initializers to prevent struct overflow
- Use compiler warnings (`-Warray-bounds`)

### Type Conversion Issues
**Common Causes**:
- Implicit conversions between signed/unsigned
- Truncation when assigning larger types to smaller
- Floating-point precision issues
- Incorrect format specifiers in printf/scanf
- Pointer to integer conversions
- Integer overflow in arithmetic operations

**Debugging Steps**:
1. Compile with `-Wconversion` to get conversion warnings
2. Check for warnings about sign conversion
3. Verify format specifiers match variable types
4. Use explicit casts where necessary
5. Check for integer overflow in arithmetic

**Quick Fixes**:
- Use correct format specifiers (`%zu` for size_t, `%td` for ptrdiff_t)
- Explicitly cast when converting between signed/unsigned
- Use fixed-width types when exact sizes matter
- Validate values before conversion
- Use `stdint.h` types for precise size requirements
- Check for integer overflow in arithmetic operations

### Preprocessor Problems
**Common Causes**:
- Macro side effects (multiple evaluation)
- Missing parentheses in macro definitions
- Header file inclusion issues
- Conditional compilation errors
- Token pasting issues
- Stringification problems

**Debugging Steps**:
1. View preprocessed output: `gcc -E program.c > program.i`
2. Check for unexpected macro expansions
3. Verify header guard patterns
4. Check for circular dependencies
5. Use `#error` directives for conditional compilation debugging

**Quick Fixes**:
- Wrap macro parameters in parentheses: `#define MAX(a,b) ((a) > (b) ? (a) : (b))`
- Use `do { ... } while(0)` for multi-statement macros
- Use `#pragma once` or proper header guards
- Avoid complex macros; prefer inline functions
- Use `-dD` flag to see macro definitions in preprocessed output

### Thread Synchronization Issues
**Common Causes**:
- Race conditions
- Deadlocks
- False sharing
- Memory visibility issues
- Improper mutex usage
- Condition variable misuse

**Debugging Steps**:
1. Use ThreadSanitizer: `gcc -fsanitize=thread program.c`
2. Use Helgrind (Valgrind tool for thread errors)
3. Add extensive logging with timestamps
4. Use printf debugging with thread IDs
5. Check for proper mutex locking/unlocking
6. Verify condition variable usage patterns

**Quick Fixes**:
- Always lock and unlock mutexes in the same order
- Use scoped locking patterns
- Minimize critical section size
- Use condition variables correctly (always check predicate in loop)
- Consider using higher-level synchronization primitives
- Use memory barriers where necessary

### Floating-Point Precision Issues
**Common Causes**:
- Comparing floats for exact equality
- Accumulating rounding errors
- Catastrophic cancellation
- Overflow/underflow
- Inconsistent precision across platforms

**Debugging Steps**:
1. Print values with high precision: `printf("%.17g\n", x);`
2. Check for NaN or infinity values
3. Verify calculation order
4. Use `nextafter` to check precision

**Quick Fixes**:
- Use epsilon comparisons: `fabs(a - b) < epsilon`
- Choose appropriate epsilon based on magnitude
- Rearrange calculations to minimize error
- Use higher precision types where necessary
- Use `fma` for fused multiply-add operations
- Be aware of floating-point limitations

## 36.6 Debugging Quick Tips

### GDB Essentials
```bash
# Start debugging
gdb ./program

# Common commands
break main          # Set breakpoint at main
break file.c:10     # Set breakpoint at line 10 of file.c
break func          # Set breakpoint at function
break *0x4005b0     # Set breakpoint at address
run                 # Start program
run arg1 arg2       # Start with arguments
continue            # Continue execution
next                # Step over function calls
step                # Step into function calls
finish              # Run until current function returns
print variable      # Print variable value
print/x variable    # Print in hex
print *pointer@10   # Print 10 elements of array
backtrace           # Show call stack
bt full             # Show call stack with local variables
info locals         # Show local variables
info args           # Show function arguments
info registers      # Show register values
display variable    # Automatically display variable after each step
undisplay n         # Remove automatic display
watch variable      # Break when variable changes
delete n            # Delete breakpoint n
disable n           # Disable breakpoint n
enable n            # Enable breakpoint n
quit                # Exit GDB

# Post-mortem debugging (after crash)
gdb ./program core   # Analyze core dump

# Scripting
gdb -x commands.txt  # Run GDB commands from file

# Remote debugging
gdbserver :1234 ./program  # On target
target remote localhost:1234  # On host
```

### GDB Advanced Techniques
```bash
# Conditional breakpoints
break file.c:10 if x > 5

# Commands on breakpoint
break file.c:10
commands
    print x
    continue
end

# Reverse debugging (if supported)
record             # Start recording execution
reverse-continue   # Run backward to previous breakpoint
reverse-step       # Step backward
reverse-next       # Next backward

# Core dump analysis
gdb ./program core
bt                 # Backtrace
info threads       # List threads
thread apply all bt # Backtrace for all threads

# Memory examination
x/10x &variable    # Examine 10 hex words at address
x/20i address      # Examine 20 instructions
info proc mappings # Show memory mappings (Linux)

# Function call tracing
break malloc
commands
    bt
    continue
end
```

### Valgrind for Memory Issues
```bash
# Memory leak detection
valgrind --leak-check=full --show-leak-kinds=all ./program

# Memory error detection
valgrind --tool=memcheck --leak-check=full ./program

# Cache profiling
valgrind --tool=cachegrind ./program
cg_annotate cachegrind.out.12345

# Call graph analysis
valgrind --tool=callgrind ./program
kcachegrind callgrind.out.12345

# Thread error detection
valgrind --tool=helgrind ./program

# Massif heap profiler
valgrind --tool=massif ./program
ms_print massif.out.12345
```

### AddressSanitizer (ASan)
```bash
# Compile with ASan
gcc -fsanitize=address -fno-omit-frame-pointer -g program.c -o program

# Run program (ASan will report errors)
./program

# Environment variables for ASan
ASAN_OPTIONS=detect_leaks=1:log_to_syslog=0 ./program

# Common ASan reports:
# - heap-use-after-free
# - heap-buffer-overflow
# - stack-use-after-return
# - stack-buffer-overflow
# - global-buffer-overflow
# - memory leaks
# - invalid-free
# - double-free

# LeakSanitizer (LSan) - part of ASan
ASAN_OPTIONS=detect_leaks=1 ./program
```

### UndefinedBehaviorSanitizer (UBSan)
```bash
# Compile with UBSan
gcc -fsanitize=undefined -fno-omit-frame-pointer -g program.c -o program

# Run program (UBSan will report errors)
./program

# Specific checks
gcc -fsanitize=signed-integer-overflow -fsanitize=shift ./program.c

# Common UBSan reports:
# - signed integer overflow
# - unsigned integer overflow (with -fsanitize=unsigned-integer-overflow)
# - shift out of range
# - null pointer dereference
# - alignment issues
# - type punning violations
# - division by zero
```

### ThreadSanitizer (TSan)
```bash
# Compile with TSan
gcc -fsanitize=thread -g program.c -o program

# Run program (TSan will report thread issues)
./program

# Common TSan reports:
# - data races
# - deadlock
# - mutex order inversion
# - invalid mutex usage
# - thread leak
```

### Print Debugging Techniques
```c
// Conditional debugging
#ifdef DEBUG
    #define DEBUG_PRINT(fmt, ...) fprintf(stderr, "[DEBUG] " fmt, ##__VA_ARGS__)
#else
    #define DEBUG_PRINT(fmt, ...) 
#endif

// Function entry/exit tracing
#define TRACE() DEBUG_PRINT("%s:%d %s()\n", __FILE__, __LINE__, __func__)

// Hex dump for binary data
void hex_dump(const void *data, size_t size) {
    const unsigned char *bytes = data;
    for (size_t i = 0; i < size; i++) {
        printf("%02x ", bytes[i]);
        if ((i+1) % 16 == 0) printf("\n");
    }
    printf("\n");
}

// Assertion with message
#define ASSERT(cond, msg) \
    do { \
        if (!(cond)) { \
            fprintf(stderr, "Assertion failed: %s (%s:%d)\n", \
                    msg, __FILE__, __LINE__); \
            abort(); \
        } \
    } while (0)

// Error checking wrapper
#define CHECK(expr) \
    do { \
        if (!(expr)) { \
            fprintf(stderr, "Error: %s (%s:%d)\n", \
                    #expr, __FILE__, __LINE__); \
            exit(EXIT_FAILURE); \
        } \
    } while (0)

// Function call tracing
#define TRACE_CALL(func, ...) \
    do { \
        DEBUG_PRINT("Calling %s\n", #func); \
        func(__VA_ARGS__); \
        DEBUG_PRINT("Returned from %s\n", #func); \
    } while (0)
```

### Static Analysis Tools
```bash
# Clang Static Analyzer
scan-build gcc program.c

# CppCheck
cppcheck --enable=all --inconclusive --std=c11 program.c

# Coverity (commercial)
cov-build --dir cov-int gcc program.c
cov-analyze --dir cov-int
cov-format-errors --dir cov-int

# GCC warnings
gcc -Wall -Wextra -Werror -Wconversion -Wshadow -Wformat=2 -Wcast-qual \
    -Wcast-align -Wunused -Wmissing-prototypes -Wstrict-prototypes \
    -Wold-style-definition -Wpedantic program.c

# Clang warnings
clang -Weverything -Wno-disabled-macro-expansion -Wno-float-equal \
      -Wno-padded -Wno-reserved-id-macro -Wno-covered-switch-default \
      program.c
```

### Common Debugging Patterns

**1. Finding the exact crash location**:
```c
// Add trace points before suspected crash
TRACE();
// ... code ...
TRACE();
// ... code ...
```

**2. Tracking memory allocations**:
```c
// Simple memory tracker
#define malloc(size) safe_malloc(size, __FILE__, __LINE__)
void *safe_malloc(size_t size, const char *file, int line) {
    void *ptr = malloc(size);
    printf("ALLOC %p (%zu) at %s:%d\n", ptr, size, file, line);
    return ptr;
}
```

**3. Verifying function preconditions**:
```c
void process_data(const char *data, size_t len) {
    ASSERT(data != NULL, "data is NULL");
    ASSERT(len > 0, "len is zero");
    // ...
}
```

**4. Logging state before critical operations**:
```c
void critical_operation() {
    log_state();  // Log relevant state
    // Perform critical operation
}
```

**5. Detecting memory corruption**:
```c
// Add canaries around critical data
#define CANARY_VALUE 0xDEADBEEF

typedef struct {
    uint32_t canary1;
    // Critical data
    int value;
    char buffer[64];
    uint32_t canary2;
} ProtectedData;

bool validate_canaries(const ProtectedData *pd) {
    return pd->canary1 == CANARY_VALUE && pd->canary2 == CANARY_VALUE;
}
```

**6. Detecting use-after-free**:
```c
// Fill freed memory with pattern
void *safe_malloc(size_t size) {
    void *ptr = malloc(size);
    if (ptr) memset(ptr, 0xAA, size);
    return ptr;
}

void safe_free(void *ptr, size_t size) {
    if (ptr) memset(ptr, 0xDD, size);
    free(ptr);
}
```

## 36.7 C11/C17 Features Quick Reference

### C11 Standard Features
| **Feature**               | **Description**                                      | **Example**                                  |
|---------------------------|------------------------------------------------------|----------------------------------------------|
| `_Static_assert`          | Compile-time assertions                              | `_Static_assert(sizeof(int) == 4, "int not 4 bytes");` |
| `alignas`/`alignof`       | Control alignment                                    | `alignas(16) int x;`                         |
| `_Noreturn`               | Functions that don't return                          | `_Noreturn void panic(void);`                |
| `threads.h`               | Basic threading support                              | `thrd_t thread; thrd_create(&thread, func, NULL);` |
| `atomic.h`                | Atomic operations                                    | `atomic_int counter; atomic_fetch_add(&counter, 1);` |
| `bool` type               | Boolean type (from stdbool.h)                        | `bool flag = true;`                          |
| `nullptr`                 | Null pointer constant (from stddef.h)                | `void *ptr = NULL;`                          |
| Unicode support           | UTF-8/16/32 string literals                          | `u8"UTF-8 string";`                          |
| `_Generic`                | Type-generic expressions                             | `#define max(a, b) _Generic((a), int: max_int, float: max_float)(a, b)` |
| `_Thread_local`           | Thread-local storage                                 | `_Thread_local int counter;`                 |
| Digit separators          | Single quotes in numeric literals                    | `int million = 1'000'000;`                   |

### C17 Standard Features
| **Feature**               | **Description**                                      |
|---------------------------|------------------------------------------------------|
| Removed trigraphs         | Trigraphs no longer part of the language             |
| `_STDC_VERSION`           | Set to 201710L for C17                               |
| Minor clarifications      | Various editorial changes and defect fixes           |
| `static` array indices    | Allow `static` in array parameter declarations       |

### Compiler-Specific Extensions (GCC/Clang)

| **Extension**             | **Description**                                      | **Example**                                  |
|---------------------------|------------------------------------------------------|----------------------------------------------|
| `__attribute__`           | Function/variable attributes                         | `__attribute__((noreturn)) void panic();`    |
| Statement expressions     | Statements in expression context                     | `int max = ({int a=5,b=10; a>b?a:b;});`      |
| Zero-length arrays        | Flexible array members                               | `struct buf { int len; char data[]; };`      |
| `typeof`                  | Type inference                                       | `typeof(x) y = x;`                           |
| `cleanup` attribute       | Automatic resource cleanup                           | `__attribute__((cleanup(cleanup_func)))`     |
| `__FUNCTION__`            | Current function name                                | `printf("%s\n", __FUNCTION__);`              |
| `__PRETTY_FUNCTION__`     | Pretty-printed function name                         | `printf("%s\n", __PRETTY_FUNCTION__);`       |
| `__builtin_expect`        | Branch prediction hint                               | `if (__builtin_expect(error, 0)) { ... }`     |
| `__builtin_prefetch`      | Data prefetching                                     | `__builtin_prefetch(&array[i+64], 0, 3);`    |
| `__VA_ARGS__`             | Variadic macros                                      | `#define LOG(...) printf(__VA_ARGS__)`       |
| `#pragma` directives      | Compiler-specific directives                         | `#pragma GCC optimize ("O3")`                |
| `__func__`                | Current function name (C99 standard)                 | `printf("%s\n", __func__);`                  |
| `__COUNTER__`             | Incrementing counter                                 | `int var##__COUNTER__;`                      |
| `__has_feature`           | Check for compiler features                          | `#if __has_feature(c_static_assert)`         |

## 36.8 Quick Conversion Guide

### C to C++ Conversion Tips
| **C Feature**             | **C++ Equivalent**                                   | **Notes**                                    |
|---------------------------|------------------------------------------------------|----------------------------------------------|
| `malloc`/`free`           | `new`/`delete`                                       | Prefer smart pointers in modern C++          |
| `struct Point { ... };`   | `struct Point { ... };`                              | In C++, no need for `struct` keyword        |
| Function pointers         | Function objects, lambdas, `std::function`           | Type-safe and more flexible alternatives     |
| Manual memory management  | RAII, smart pointers                                 | Automatic resource management                |
| Macros                    | Templates, inline functions, `constexpr`             | Type-safe and debuggable alternatives        |
| `void*`                   | Templates, type-safe containers                      | Avoids casting                               |
| `printf`                  | `std::cout`                                          | Type-safe streaming                          |
| `#define MAX`             | `constexpr int max(int a, int b) { ... }`            | Type-safe and debuggable                     |
| `typedef`                 | `using`                                              | More readable syntax                         |
| Manual error handling     | Exceptions                                           | Structured error handling                    |
| `union`                   | `std::variant` (C++17)                               | Type-safe union                              |
| Global functions          | Namespaces                                           | Better organization                          |
| Manual string handling    | `std::string`                                        | Safer and more convenient                    |
| Manual array handling     | `std::array`, `std::vector`                          | Bounds-checked and more features             |
| Manual container creation | STL containers                                       | Production-tested implementations            |
| Manual sorting            | `std::sort`                                          | Optimized and generic                        |

### C to Rust Conversion Tips
| **C Feature**             | **Rust Equivalent**                                  | **Notes**                                    |
|---------------------------|------------------------------------------------------|----------------------------------------------|
| Manual memory management  | Ownership/borrowing system                           | Compile-time memory safety                   |
| Pointers                  | References (`&T`, `&mut T`)                          | No dangling pointers                         |
| `malloc`/`free`           | `Box<T>`, containers                                 | Automatic memory management                  |
| Global variables          | `static` with interior mutability                    | Controlled mutability                        |
| `struct`                  | `struct`                                             | Similar concept, different safety guarantees |
| Manual error handling     | `Result<T, E>`                                       | Type-safe error handling                     |
| `#define` macros          | Macros via `macro_rules!`                            | Hygienic macros                              |
| Manual concurrency        | Thread-safe abstractions                             | Compile-time concurrency safety              |
| Manual string handling    | `String`, `&str`                                     | UTF-8 guaranteed                             |
| Manual array handling     | `[T; N]`, `Vec<T>`                                   | Bounds-checked                               |
| Manual memory layout      | `#[repr(C)]`, `#[repr(align)]`                       | Control memory layout                        |
| Manual resource management| `Drop` trait                                       | Automatic cleanup                            |
| Manual type conversions   | Explicit `as` or conversion traits                   | Explicit conversions                         |
| Manual function pointers  | Closures, function pointers                          | More flexible                                |
| Manual error propagation  | `?` operator                                         | Concise error handling                       |
| Manual memory alignment   | `#[repr(align)]`                                     | Control alignment                            |

## 36.9 Final Checklist for Production Code

Before deploying C code to production, verify:

### Memory Management
- [ ] All memory allocations are checked for failure
- [ ] All pointers are checked before dereferencing
- [ ] All array accesses are bounds-checked
- [ ] All string operations use size-limited versions
- [ ] Flexible array members are properly sized
- [ ] No memory leaks detected by Valgrind/ASan
- [ ] No use-after-free detected by ASan
- [ ] No double-free issues
- [ ] Proper handling of memory alignment requirements
- [ ] Memory context pattern used where appropriate

### Error Handling
- [ ] All system calls check return values and handle errors
- [ ] All resources (files, sockets) are properly closed
- [ ] Error conditions are documented in function comments
- [ ] Meaningful error messages with context are provided
- [ ] Error chaining is used for better diagnostics
- [ ] All error paths are tested
- [ ] Resource cleanup happens in all code paths
- [ ] No ignored return values from critical functions
- [ ] `errno` is checked after relevant system calls

### Security
- [ ] No use of unsafe functions like `gets`, `strcpy`, `sprintf`
- [ ] All input from untrusted sources is validated
- [ ] Buffer sizes are checked before operations
- [ ] Stack protection is enabled (`-fstack-protector-strong`)
- [ ] `_FORTIFY_SOURCE=2` is enabled for additional checks
- [ ] Format string vulnerabilities are prevented
- [ ] Integer overflow checks are in place
- [ ] Sensitive data is properly zeroed after use
- [ ] Memory safe from timing attacks where relevant

### Code Quality
- [ ] Consistent coding style is followed
- [ ] Functions are small and focused (< 50 lines)
- [ ] Meaningful variable and function names are used
- [ ] Comments explain "why" not "what"
- [ ] Documentation is up-to-date
- [ ] Magic numbers are replaced with named constants
- [ ] Enums are used instead of raw integers
- [ ] `const` is used for read-only data
- [ ] `static` is used for file-scope functions/variables
- [ ] Designated initializers are used for structures
- [ ] Compound literals are used where appropriate
- [ ] Proper type conversions are used
- [ ] Integer overflow is checked in arithmetic operations
- [ ] Floating-point comparisons use epsilon

### Performance
- [ ] Critical paths have been profiled
- [ ] Memory access patterns are cache-friendly
- [ ] Branch mispredictions are minimized in hot paths
- [ ] Appropriate data structures are used
- [ ] Unnecessary memory allocations are avoided in hot paths
- [ ] Loop unrolling is considered for performance-critical loops
- [ ] Structure of Arrays (SoA) is used for data processing
- [ ] Compiler hints like `__builtin_expect` are used where helpful

### Portability
- [ ] Code compiles on all target platforms
- [ ] Endianness issues are handled for binary data
- [ ] Alignment requirements are considered
- [ ] Fixed-width types are used where exact sizes matter
- [ ] File system assumptions are minimized
- [ ] Newline differences between platforms are handled
- [ ] Compiler-specific extensions are minimized

### Testing
- [ ] Unit tests cover critical functionality
- [ ] Edge cases and error conditions are tested
- [ ] Fuzz testing is used for input processing code
- [ ] AddressSanitizer and UBSan have been run
- [ ] Valgrind shows no memory errors
- [ ] ThreadSanitizer shows no thread issues
- [ ] Code coverage is measured and tracked
- [ ] Performance benchmarks are established

### Documentation
- [ ] Function purpose, parameters, and return values are documented
- [ ] Error conditions and expected behavior are documented
- [ ] Thread safety guarantees are documented
- [ ] Memory ownership rules are documented
- [ ] Design decisions are documented in code comments
- [ ] Limitations and known issues are documented
- [ ] API documentation is generated (e.g., with Doxygen)

Remember: **In C, the compiler won't save you from yourself.** The language gives you power and control, but with that comes responsibility for ensuring your code is safe, correct, and maintainable. This reference guide provides the essential knowledge to write effective C code, but the real mastery comes from understanding the implications of your choices and developing disciplined coding habits. Always prioritize safety and correctness over cleverness, and remember that the best C code is often the simplest code that correctly solves the problem.

