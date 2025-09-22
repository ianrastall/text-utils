# 4. Structures and Unions in C

## 4.1 The Need for Composite Data Types

In the previous chapters, we explored fundamental data types (integers, floating-point numbers, characters) and how to organize them into arrays for homogeneous collections. However, real-world data is rarely so uniform. Consider a student record: it might include a student ID (integer), name (string), GPA (floating-point), and enrollment status (boolean). Managing these related but heterogeneous pieces of data as separate variables would be cumbersome, error-prone, and would obscure the natural grouping of information that constitutes a single logical entity.

This is where **composite data types** become essential. Composite types allow us to bundle multiple related data items of different types into a single, cohesive unit. In C, the two primary composite types are **structures** (`struct`) and **unions** (`union`). Structures provide the foundation for creating custom data types that model real-world entities, while unions offer a mechanism for interpreting the same memory location in multiple ways.

> **"A structure is to data what a sentence is to words—it transforms isolated elements into meaningful, organized information. Without structures, programming would be reduced to manipulating disconnected fragments rather than modeling coherent concepts."**

Understanding structures and unions is critical because:
*   They enable the creation of domain-specific abstractions that mirror real-world entities
*   They form the basis for implementing complex data structures (linked lists, trees, graphs)
*   They improve code organization, readability, and maintainability
*   They facilitate data encapsulation and information hiding
*   They are fundamental to interacting with system APIs and data formats

While higher-level languages often provide more sophisticated object-oriented features, C's structures represent the essential building blocks for data organization. Mastering them provides insight into how data is physically represented in memory and how complex information can be systematically managed. This chapter explores structures and unions in depth, revealing their syntax, memory implications, practical applications, and best practices for effective usage.

## 4.2 Structure Fundamentals

### 4.2.1 Structure Declaration and Definition

A structure is a user-defined data type that groups together variables of different data types under a single name. The syntax for declaring a structure uses the `struct` keyword followed by an optional tag name and a list of member declarations enclosed in braces.

**Structure Declaration Syntax:**
```c
struct <tag_name> {
    <data_type1> <member1>;
    <data_type2> <member2>;
    // ...
    <data_typeN> <memberN>;
};
```

**Example: Student Structure**
```c
struct Student {
    int id;
    char name[50];
    float gpa;
    int enrolled;
};
```

This declaration defines a new type `struct Student` that contains four members: an integer `id`, a character array `name`, a floating-point `gpa`, and an integer `enrolled` (serving as a boolean).

**Key Points:**
*   The declaration **defines a new type** but does not allocate memory.
*   The tag name (`Student` in the example) becomes part of the type name (`struct Student`).
*   Member declarations specify the data types and names of the structure's components.
*   Structure declarations are typically placed outside any function (at file scope) so they can be used throughout the program.

**Alternative Declaration Styles:**
```c
// Style 1: Declaration with tag (most common)
struct Point {
    int x;
    int y;
};

// Style 2: Declaration with typedef (simplifies usage)
typedef struct {
    int x;
    int y;
} Point;

// Style 3: Declaration with tag and typedef
typedef struct Point {
    int x;
    int y;
} Point;
```

Style 3 is often preferred as it provides both the `struct Point` and `Point` type names, enhancing code clarity and flexibility.

### 4.2.2 Structure Variables and Initialization

Once a structure type is declared, you can create variables of that type, which allocates memory for all the structure's members.

**Structure Variable Declaration:**
```c
struct Student s1; // Using tag name
Point p1;          // Using typedef name (if defined)
```

**Initialization:**
Structure variables can be initialized at declaration time. C89 requires initialization in declaration order, while C99 introduces designated initializers for more flexible initialization.

**C89 Initialization:**
```c
struct Student s1 = {1001, "John Doe", 3.75, 1};
```
*   Values must be provided in the exact order of member declaration
*   Missing values are set to zero (for numeric types) or null (for pointers)

**C99 Designated Initializers:**
```c
struct Student s2 = {
    .id = 1002,
    .name = "Jane Smith",
    .gpa = 3.9,
    .enrolled = 1
};
```
*   Members can be initialized in any order
*   Only specified members are initialized; others are set to zero/null
*   Improves readability and reduces errors when structure definitions change

**Partial Initialization:**
```c
struct Student s3 = {.id = 1003, .gpa = 4.0};
// name and enrolled will be zero-initialized
```

**Array of Structures:**
```c
struct Student class[30]; // Array of 30 Student structures
```

### 4.2.3 Accessing Structure Members

Structure members are accessed using the **dot operator** (`.`), which connects the structure variable name with the member name.

```c
struct Student s1 = {1001, "John Doe", 3.75, 1};

printf("ID: %d\n", s1.id);
printf("Name: %s\n", s1.name);
printf("GPA: %.2f\n", s1.gpa);

s1.gpa = 3.85; // Modify a member
s1.enrolled = 0; // Student has withdrawn
```

**Key Rules:**
*   The dot operator has higher precedence than the address-of (`&`) and dereference (`*`) operators
*   Member access expressions can be used on the left side of assignments to modify values
*   Each member is treated as a variable of its declared type

**Nested Member Access:**
For structures containing other structures, member access is chained:
```c
struct Address {
    char street[50];
    char city[30];
    char zip[10];
};

struct Student {
    int id;
    char name[50];
    struct Address addr;
    float gpa;
};

struct Student s1 = {
    .id = 1001,
    .name = "John Doe",
    .addr = {"123 Main St", "Anytown", "12345"},
    .gpa = 3.75
};

printf("City: %s\n", s1.addr.city);
```

### 4.2.4 Structures and Memory Layout

Understanding how structures are laid out in memory is crucial for writing efficient and portable code. While the C standard guarantees that structure members are allocated in the order of declaration, it also permits **padding** between members to satisfy **alignment** requirements.

**Alignment Requirements:**
Most hardware architectures require that data of a certain type be stored at memory addresses that are multiples of the type's size. For example:
*   `char` (1 byte): Can be at any address (alignment of 1)
*   `int` (4 bytes): Typically requires alignment of 4
*   `double` (8 bytes): Typically requires alignment of 8

**Padding:**
To satisfy alignment requirements, the compiler may insert unused bytes (padding) between structure members or at the end of the structure.

**Example Structure Memory Layout:**
Consider this structure on a typical 64-bit system where `int` is 4 bytes and `double` is 8 bytes:

```c
struct Example {
    char a;     // 1 byte
    int b;      // 4 bytes
    double c;   // 8 bytes
    char d;     // 1 byte
};
```

The memory layout would likely be:

| **Offset** | **Member** | **Size (bytes)** | **Description**          |
| :--------- | :--------- | :--------------- | :----------------------- |
| **0**      | **`a`**    | **1**            | **char value**           |
| **1-3**    | **Padding**| **3**            | **For int alignment**    |
| **4-7**    | **`b`**    | **4**            | **int value**            |
| **8-15**   | **`c`**    | **8**            | **double value**         |
| **16**     | **`d`**    | **1**            | **char value**           |
| **17-23**  | **Padding**| **7**            | **For structure alignment** |
| **Total**  |            | **24**           | **(not 14 as might be expected)** |

**Key Observations:**
1.  After `a` (1 byte), 3 padding bytes are inserted to align `b` (int) to a 4-byte boundary
2.  `c` (double) is placed at offset 8 (a multiple of 8)
3.  After `d`, 7 padding bytes are added so the total structure size is a multiple of the largest member's alignment (8 for double)
4.  `sizeof(struct Example)` returns 24, not 14 (1+4+8+1)

**Why Padding Matters:**
*   **Memory Usage:** Padding can significantly increase memory consumption, especially for large arrays of structures
*   **Performance:** Proper alignment enables faster memory access; misaligned access may cause performance penalties or hardware exceptions
*   **Portability:** Padding patterns vary across compilers and architectures, affecting binary compatibility

**Controlling Padding:**
While generally best left to the compiler, some compilers offer pragmas or attributes to pack structures tightly (reducing padding at the cost of potential performance):

```c
#pragma pack(1) // GCC, Clang, MSVC
struct PackedExample {
    char a;
    int b;
    double c;
    char d;
};
#pragma pack()  // Restore default packing
```

This would create a 14-byte structure but may incur performance penalties on some architectures. Use packing directives judiciously and only when necessary (e.g., for network protocols or file formats requiring specific layouts).

## 4.3 Structures and Pointers

### 4.3.1 Pointers to Structures

Pointers to structures are extremely common in C programming, especially when working with dynamic memory allocation or passing structures to functions.

**Declaration and Initialization:**
```c
struct Student s1 = {1001, "John Doe", 3.75, 1};
struct Student *sptr = &s1; // Pointer to structure
```

**Accessing Members Through Pointers:**
There are two equivalent ways to access structure members through a pointer:

1.  **Dereference followed by dot operator:**
    ```c
    printf("ID: %d\n", (*sptr).id);
    ```

2.  **Arrow operator (`->`):**
    ```c
    printf("ID: %d\n", sptr->id);
    ```

The arrow operator is preferred as it's more concise and readable. It combines pointer dereferencing and member access into a single operation.

**Example:**
```c
struct Student *create_student(int id, const char *name, float gpa, int enrolled) {
    struct Student *s = malloc(sizeof(struct Student));
    if (s == NULL) {
        return NULL;
    }
    
    s->id = id;
    strncpy(s->name, name, sizeof(s->name) - 1);
    s->name[sizeof(s->name) - 1] = '\0';
    s->gpa = gpa;
    s->enrolled = enrolled;
    
    return s;
}

void print_student(const struct Student *s) {
    printf("ID: %d, Name: %s, GPA: %.2f, Enrolled: %s\n",
           s->id, s->name, s->gpa, s->enrolled ? "Yes" : "No");
}

int main() {
    struct Student *s1 = create_student(1001, "John Doe", 3.75, 1);
    if (s1) {
        print_student(s1);
        free(s1);
    }
    return 0;
}
```

**Why Pointers to Structures Are Important:**
*   **Efficiency:** Passing a pointer (typically 4-8 bytes) is much cheaper than copying an entire structure
*   **Modification:** Functions can modify structure contents through pointers
*   **Dynamic Allocation:** Essential for creating structures on the heap
*   **Data Structures:** Foundation for linked structures (lists, trees, graphs)

### 4.3.2 Structures Containing Pointers

Structures often contain pointers as members, enabling dynamic memory allocation and flexible data organization.

**Example: Dynamic String in Structure**
```c
struct Person {
    char *name;      // Pointer to dynamically allocated string
    int age;
    char *occupation; // Another dynamically allocated string
};

struct Person *create_person(const char *name, int age, const char *occupation) {
    struct Person *p = malloc(sizeof(struct Person));
    if (!p) return NULL;
    
    // Allocate and copy name
    p->name = malloc(strlen(name) + 1);
    if (!p->name) {
        free(p);
        return NULL;
    }
    strcpy(p->name, name);
    
    p->age = age;
    
    // Allocate and copy occupation
    p->occupation = malloc(strlen(occupation) + 1);
    if (!p->occupation) {
        free(p->name);
        free(p);
        return NULL;
    }
    strcpy(p->occupation, occupation);
    
    return p;
}

void free_person(struct Person *p) {
    if (p) {
        free(p->name);
        free(p->occupation);
        free(p);
    }
}
```

**Memory Management Considerations:**
1.  **Ownership Semantics:** Clearly define who is responsible for allocating and freeing memory
2.  **Deep vs. Shallow Copy:** When copying structures with pointers, decide whether to copy the pointed-to data (deep copy) or just the pointers (shallow copy)
3.  **Memory Leak Prevention:** Ensure all allocated memory is properly freed, especially in error conditions
4.  **Null Initialization:** Always initialize pointer members to `NULL` to distinguish between allocated and unallocated state

**Example: Deep Copy Function**
```c
struct Person *copy_person(const struct Person *src) {
    if (!src) return NULL;
    
    struct Person *dest = malloc(sizeof(struct Person));
    if (!dest) return NULL;
    
    // Deep copy name
    dest->name = malloc(strlen(src->name) + 1);
    if (!dest->name) {
        free(dest);
        return NULL;
    }
    strcpy(dest->name, src->name);
    
    dest->age = src->age;
    
    // Deep copy occupation
    dest->occupation = malloc(strlen(src->occupation) + 1);
    if (!dest->occupation) {
        free(dest->name);
        free(dest);
        return NULL;
    }
    strcpy(dest->occupation, src->occupation);
    
    return dest;
}
```

### 4.3.3 Arrays of Structures

Arrays of structures combine the power of homogeneous collections with heterogeneous data elements, creating tabular data structures.

**Declaration and Initialization:**
```c
struct Student class[5] = {
    {1001, "John Doe", 3.75, 1},
    {1002, "Jane Smith", 3.90, 1},
    {1003, "Bob Johnson", 2.85, 1},
    {1004, "Alice Williams", 3.50, 0},
    {1005, "Charlie Brown", 3.20, 1}
};
```

**Accessing Elements:**
```c
// Access the third student's name
printf("Student 3: %s\n", class[2].name);

// Modify the fifth student's GPA
class[4].gpa = 3.30;

// Using pointers
struct Student *p = class; // Points to first element
printf("First student ID: %d\n", p->id);
printf("Second student ID: %d\n", (p+1)->id);
```

**Memory Layout:**
Arrays of structures are laid out contiguously in memory, with each structure occupying its full size (including padding):

| **Offset** | **Structure** | **Member** | **Description**          |
| :--------- | :------------ | :--------- | :----------------------- |
| **0-23**   | **class[0]**  |            | **First Student**        |
| **24-47**  | **class[1]**  |            | **Second Student**       |
| **48-71**  | **class[2]**  |            | **Third Student**        |
| **72-95**  | **class[3]**  |            | **Fourth Student**       |
| **96-119** | **class[4]**  |            | **Fifth Student**        |

Assuming the `Student` structure from earlier has a size of 64 bytes (due to padding), the entire array occupies 5 × 64 = 320 bytes.

**Practical Application: Database Operations**
```c
#include <stdio.h>
#include <string.h>

#define MAX_STUDENTS 100

struct Student {
    int id;
    char name[50];
    float gpa;
    int enrolled;
};

int find_student_by_id(struct Student db[], int count, int id) {
    for (int i = 0; i < count; i++) {
        if (db[i].id == id) {
            return i; // Found at position i
        }
    }
    return -1; // Not found
}

void print_student(const struct Student *s) {
    printf("ID: %d, Name: %-20s, GPA: %.2f, Enrolled: %s\n",
           s->id, s->name, s->gpa, s->enrolled ? "Yes" : "No");
}

int main() {
    struct Student database[MAX_STUDENTS];
    int student_count = 0;
    
    // Add students (in a real program, this would come from input)
    database[student_count++] = (struct Student){1001, "John Doe", 3.75, 1};
    database[student_count++] = (struct Student){1002, "Jane Smith", 3.90, 1};
    database[student_count++] = (struct Student){1003, "Bob Johnson", 2.85, 1};
    
    // Find and print a student
    int pos = find_student_by_id(database, student_count, 1002);
    if (pos >= 0) {
        print_student(&database[pos]);
    } else {
        printf("Student not found\n");
    }
    
    // Print all enrolled students
    printf("\nEnrolled Students:\n");
    for (int i = 0; i < student_count; i++) {
        if (database[i].enrolled) {
            print_student(&database[i]);
        }
    }
    
    return 0;
}
```

**Output:**
```
ID: 1002, Name: Jane Smith          , GPA: 3.90, Enrolled: Yes

Enrolled Students:
ID: 1001, Name: John Doe            , GPA: 3.75, Enrolled: Yes
ID: 1002, Name: Jane Smith          , GPA: 3.90, Enrolled: Yes
ID: 1003, Name: Bob Johnson         , GPA: 2.85, Enrolled: Yes
```

This example demonstrates basic database operations using an array of structures, including searching and filtering.

## 4.4 Nested Structures

### 4.4.1 Structures Within Structures

Structures can contain other structures as members, creating hierarchical data organizations that mirror complex real-world relationships.

**Declaration Syntax:**
```c
struct Address {
    char street[50];
    char city[30];
    char state[3];
    char zip[10];
};

struct Student {
    int id;
    char name[50];
    struct Address addr; // Structure member
    float gpa;
    int enrolled;
};
```

**Initialization:**
```c
struct Student s1 = {
    .id = 1001,
    .name = "John Doe",
    .addr = {
        .street = "123 Main St",
        .city = "Anytown",
        .state = "CA",
        .zip = "12345"
    },
    .gpa = 3.75,
    .enrolled = 1
};
```

**Accessing Nested Members:**
```c
printf("Street: %s\n", s1.addr.street);
printf("City: %s\n", s1.addr.city);

// Using pointers
struct Student *sptr = &s1;
printf("State: %s\n", sptr->addr.state);
```

**Memory Layout:**
The nested structure is laid out contiguously within the containing structure. If `Address` has a size of 100 bytes (including padding) and `Student` has other members totaling 64 bytes, the total size would be approximately 164 bytes (plus any additional padding for alignment).

**Benefits of Nested Structures:**
*   **Logical Grouping:** Related data is organized together (e.g., all address fields)
*   **Code Reuse:** The same nested structure can be used in multiple parent structures
*   **Modularity:** Changes to the nested structure affect only that component
*   **Readability:** Clearer representation of data relationships

**Example: Library System**
```c
struct Date {
    int day;
    int month;
    int year;
};

struct Book {
    char title[100];
    char author[50];
    char isbn[20];
    int copies;
};

struct Member {
    int id;
    char name[50];
    struct Address addr;
    struct Date join_date;
};

struct Loan {
    int loan_id;
    struct Member *member;
    struct Book *book;
    struct Date loan_date;
    struct Date due_date;
    int returned;
};
```

This example shows how nested structures can model a library system, with clear relationships between dates, addresses, members, books, and loans.

### 4.4.2 Self-Referential Structures

A self-referential structure contains a pointer to its own type, enabling the creation of dynamic data structures like linked lists, trees, and graphs.

**Basic Linked List Node:**
```c
struct Node {
    int data;
    struct Node *next; // Pointer to same structure type
};
```

**Memory Diagram:**
```
+-----+-----+    +-----+-----+    +-----+-----+
| data|next | -> | data|next | -> | data|next | -> NULL
+-----+-----+    +-----+-----+    +-----+-----+
```

**Creating a Linked List:**
```c
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

struct Node *create_node(int data) {
    struct Node *node = malloc(sizeof(struct Node));
    if (node) {
        node->data = data;
        node->next = NULL;
    }
    return node;
}

void insert_beginning(struct Node **head, int data) {
    struct Node *new_node = create_node(data);
    if (new_node) {
        new_node->next = *head;
        *head = new_node;
    }
}

void print_list(struct Node *head) {
    struct Node *current = head;
    while (current) {
        printf("%d -> ", current->data);
        current = current->next;
    }
    printf("NULL\n");
}

void free_list(struct Node *head) {
    struct Node *current = head;
    while (current) {
        struct Node *next = current->next;
        free(current);
        current = next;
    }
}

int main() {
    struct Node *list = NULL;
    
    insert_beginning(&list, 30);
    insert_beginning(&list, 20);
    insert_beginning(&list, 10);
    
    printf("List: ");
    print_list(list);
    // Output: 10 -> 20 -> 30 -> NULL
    
    free_list(list);
    return 0;
}
```

**Key Characteristics of Self-Referential Structures:**
*   **Dynamic Size:** Structures can be added or removed at runtime
*   **Non-Contiguous Memory:** Elements are linked via pointers, not stored contiguously
*   **Flexible Organization:** Can implement various data structures (singly/doubly linked lists, trees, graphs)
*   **Memory Efficiency:** Only allocates memory for needed elements

**Doubly Linked List Example:**
```c
struct DNode {
    int data;
    struct DNode *next;
    struct DNode *prev; // Additional pointer for backward traversal
};

void insert_after(struct DNode *node, int data) {
    if (!node) return;
    
    struct DNode *new_node = malloc(sizeof(struct DNode));
    if (!new_node) return;
    
    new_node->data = data;
    new_node->next = node->next;
    new_node->prev = node;
    
    if (node->next) {
        node->next->prev = new_node;
    }
    node->next = new_node;
}
```

**Binary Tree Node Example:**
```c
struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode *create_tree_node(int data) {
    struct TreeNode *node = malloc(sizeof(struct TreeNode));
    if (node) {
        node->data = data;
        node->left = node->right = NULL;
    }
    return node;
}
```

> **"Self-referential structures transform static data types into dynamic, evolving systems. They are the bridge between simple data organization and complex algorithmic structures—where data becomes not just information, but a living, interconnected network."**

## 4.5 Typedef and Structures

### 4.5.1 Creating Type Aliases for Structures

The `typedef` keyword creates an alias for a data type, simplifying structure declarations and improving code readability.

**Basic Syntax:**
```c
typedef existing_type new_type_name;
```

**With Structures:**
There are three common patterns for using `typedef` with structures:

**Pattern 1: Typedef with Tag**
```c
typedef struct Student {
    int id;
    char name[50];
    float gpa;
} Student;
```
*   Creates two type names: `struct Student` and `Student`
*   Most flexible approach
*   Allows forward declarations

**Pattern 2: Typedef with Anonymous Structure**
```c
typedef struct {
    int id;
    char name[50];
    float gpa;
} Student;
```
*   Creates only one type name: `Student`
*   Cannot create forward declarations to this type
*   Simpler but less flexible

**Pattern 3: Separate Declaration and Typedef**
```c
struct Student {
    int id;
    char name[50];
    float gpa;
};

typedef struct Student Student;
```
*   Explicitly separates structure declaration from typedef
*   Clear but more verbose

**Usage Comparison:**
```c
// Without typedef
struct Student s1;
struct Student *sptr;

// With typedef
Student s1;
Student *sptr;
```

The typedef version eliminates the need for the `struct` keyword, making declarations cleaner and more similar to built-in types.

**Example: Complex Number Structure**
```c
typedef struct {
    double real;
    double imag;
} Complex;

Complex add_complex(Complex a, Complex b) {
    Complex result;
    result.real = a.real + b.real;
    result.imag = a.imag + b.imag;
    return result;
}

int main() {
    Complex c1 = {3.0, 4.0};
    Complex c2 = {1.0, 2.0};
    Complex sum = add_complex(c1, c2);
    printf("Sum: %.1f + %.1fi\n", sum.real, sum.imag);
    return 0;
}
```

### 4.5.2 Best Practices with Typedef

While `typedef` can improve code readability, it should be used judiciously to avoid obscuring the underlying type.

**When to Use Typedef for Structures:**
1.  **Simplifying Complex Declarations:**
    ```c
    typedef int (*CompareFunc)(const void *, const void *);
    // Instead of using the complex pointer declaration repeatedly
    ```

2.  **Creating Abstract Data Types:**
    ```c
    typedef struct Queue Queue;
    // Hides implementation details from users of the Queue
    ```

3.  **Improving Readability for Common Structures:**
    ```c
    typedef struct {
        int width;
        int height;
    } Dimensions;
    ```

**When to Avoid Typedef:**
1.  **When It Obscures the Underlying Type:**
    ```c
    typedef char* String;
    String s1, s2; // s2 is NOT a String pointer, it's a char*
    // Prefer: typedef char* String; (but be aware of pitfalls)
    ```

2.  **For Simple Structures That Benefit from Explicit Declaration:**
    ```c
    // struct Point is clear enough without typedef
    struct Point { int x; int y; };
    ```

3.  **When Portability Across Translation Units is Concerned:**
    *   Anonymous structure typedefs cannot be forward-declared

**Common Pitfalls:**
*   **Misunderstanding Pointer Typedefs:**
    ```c
    typedef char* String;
    String s1, s2; // s2 is char*, not String*
    ```
    Better approach:
    ```c
    typedef char* String;
    String s1;
    String s2;
    // Both are char*, but it's clear they're the same type
    ```

*   **Over-Abstraction:**
    ```c
    typedef struct Node Node;
    // If Node is always used with struct Node*, the typedef adds little value
    ```

**Recommended Pattern:**
For most structure definitions, use the combined typedef with tag pattern:
```c
typedef struct Student {
    int id;
    char name[50];
    float gpa;
} Student;
```

This provides:
*   Clear type name (`Student`)
*   Ability to use `struct Student` for forward declarations
*   Consistent naming convention
*   Readable code without obscuring the underlying structure nature

**Example: File Position Structure**
```c
typedef struct fpos {
    long line;
    long column;
    char *filename;
} fpos_t;

void log_error(const fpos_t *pos, const char *message) {
    printf("Error in %s at line %ld, column %ld: %s\n",
           pos->filename, pos->line, pos->column, message);
}
```

The `_t` suffix convention (common in POSIX) indicates this is a typedef-defined type.

## 4.6 Unions: Sharing Memory Space

### 4.6.1 Union Declaration and Fundamentals

A union is a special data type that allows storing different data types in the same memory location. Unlike structures, which allocate separate storage for each member, all members of a union share the same memory space.

**Union Declaration Syntax:**
```c
union <tag_name> {
    <data_type1> <member1>;
    <data_type2> <member2>;
    // ...
    <data_typeN> <memberN>;
};
```

**Example: Data Variant Union**
```c
union Data {
    int i;
    float f;
    char str[20];
};
```

**Key Characteristics:**
*   **Shared Memory:** All members occupy the same memory location
*   **Size Determination:** The size of a union is at least large enough to hold the largest member
*   **Active Member:** At any time, only one member should be considered "active" (contain a valid value)
*   **No Simultaneous Use:** Writing to one member invalidates the values of other members

**Memory Layout Example:**
For the `Data` union on a system where:
*   `int` is 4 bytes
*   `float` is 4 bytes
*   `char[20]` is 20 bytes

The union would be 20 bytes in size (to accommodate the largest member, `str`).

| **Offset** | **Member** | **Size (bytes)** | **Notes**                |
| :--------- | :--------- | :--------------- | :----------------------- |
| **0-3**    | **`i`**    | **4**            | **Also used by `f`**     |
| **0-19**   | **`str`**  | **20**           | **Largest member**       |
| **Total**  |            | **20**           | **(size of union)**      |

When `i` is written to, bytes 0-3 contain the integer value. When `str` is written to, all 20 bytes contain the string data, overwriting the integer value.

**Declaration and Usage:**
```c
union Data data;

data.i = 10;          // Store an integer
printf("data.i: %d\n", data.i);

data.f = 220.5;       // Store a float (overwrites i)
printf("data.f: %.1f\n", data.f);

strcpy(data.str, "C Programming"); // Store a string (overwrites f)
printf("data.str: %s\n", data.str);
```

**Output:**
```
data.i: 10
data.f: 220.5
data.str: C Programming
```

However, attempting to access a member that wasn't last written produces **undefined behavior**:
```c
data.i = 10;
printf("data.f: %.1f\n", data.f); // UNDEFINED BEHAVIOR! (interpreting int as float)
```

### 4.6.2 Using Unions Effectively

To use unions safely and effectively, you need a mechanism to track which member is currently active.

**Tagged Union Pattern:**
The most common and safe approach is to combine a union with a tag field that indicates the active member.

```c
typedef enum {
    INT_TYPE,
    FLOAT_TYPE,
    STRING_TYPE
} DataType;

typedef struct {
    DataType type;
    union {
        int i;
        float f;
        char str[20];
    } value;
} SafeData;

void print_data(const SafeData *data) {
    switch (data->type) {
        case INT_TYPE:
            printf("Integer: %d\n", data->value.i);
            break;
        case FLOAT_TYPE:
            printf("Float: %.2f\n", data->value.f);
            break;
        case STRING_TYPE:
            printf("String: %s\n", data->value.str);
            break;
    }
}

int main() {
    SafeData d1 = {INT_TYPE, .value.i = 42};
    SafeData d2 = {FLOAT_TYPE, .value.f = 3.14};
    SafeData d3 = {STRING_TYPE, .value.str = "Hello"};
    
    print_data(&d1);
    print_data(&d2);
    print_data(&d3);
    
    return 0;
}
```

**Output:**
```
Integer: 42
Float: 3.14
String: Hello
```

**Common Applications of Unions:**
1.  **Hardware Registers:** Different interpretations of the same physical memory
2.  **Network Protocols:** Different message types sharing a common header
3.  **Variant Records:** Representing values that can be one of several types
4.  **Memory Optimization:** When only one of several large members will be used at a time
5.  **Type Punning:** Examining the bit pattern of a value as a different type (use with caution)

**Example: Network Packet Handling**
```c
typedef enum {
    LOGIN_REQUEST,
    LOGIN_RESPONSE,
    DATA_PACKET
} PacketType;

typedef struct {
    PacketType type;
    int sequence;
    union {
        struct {
            char username[20];
            char password[20];
        } login_req;
        
        struct {
            int success;
            char message[50];
        } login_resp;
        
        struct {
            char data[1000];
            int data_len;
        } data;
    } payload;
} NetworkPacket;

void process_packet(const NetworkPacket *packet) {
    switch (packet->type) {
        case LOGIN_REQUEST:
            printf("Login request: %s\n", packet->payload.login_req.username);
            break;
        case LOGIN_RESPONSE:
            printf("Login response: %s\n", packet->payload.login_resp.message);
            break;
        case DATA_PACKET:
            printf("Data packet (%d bytes)\n", packet->payload.data.data_len);
            break;
    }
}
```

### 4.6.3 Unions vs. Structures: When to Use Which

| **Feature**               | **Structure**                                      | **Union**                                         |
| :------------------------ | :------------------------------------------------- | :------------------------------------------------ |
| **Memory Allocation**     | **Separate storage** for each member               | **Shared storage** for all members                |
| **Size**                  | **Sum of members** plus padding                    | **Size of largest member** plus padding           |
| **Active Members**        | **All members** can have valid values simultaneously | **Only one member** should be active at a time    |
| **Purpose**               | **Group related but distinct data**                | **Represent same data in multiple ways**          |
| **Use Case**              | **Student record, Point coordinates**              | **Variant types, Hardware registers**             |
| **Memory Efficiency**     | **Less efficient** for mutually exclusive data     | **More efficient** for mutually exclusive data    |
| **Safety**                | **Inherently safer**                               | **Requires tracking active member** (use tagged union) |

**Decision Guidelines:**
*   Use a **structure** when you need to store multiple related pieces of data simultaneously (e.g., a student record with ID, name, and GPA).
*   Use a **union** when you need to interpret the same memory location in different ways, and only one interpretation is valid at any time (e.g., a configuration value that can be integer, float, or string).
*   Always prefer a **tagged union** (structure containing a union and a tag) over a raw union for safety and clarity.
*   Consider alternatives like C++ variants or language-specific features if available and appropriate for your project.

**Example: Choosing Between Structure and Union**

For representing measurement data:
```c
// Structure approach (stores all types simultaneously)
struct Measurement {
    int int_value;
    float float_value;
    double double_value;
};
// Size: sizeof(int) + sizeof(float) + sizeof(double) + padding (wasteful)

// Union approach (stores only one type at a time)
struct Measurement {
    enum {INT, FLOAT, DOUBLE} type;
    union {
        int i;
        float f;
        double d;
    } value;
};
// Size: sizeof(enum) + max(sizeof(int), sizeof(float), sizeof(double)) + padding
```

The union approach is more memory-efficient when measurements will only ever be one type at a time.

## 4.7 Advanced Structure Features

### 4.7.1 Bit Fields

Bit fields allow you to specify the exact number of bits used for integer members of a structure, enabling memory optimization for boolean flags or small-value integers.

**Declaration Syntax:**
```c
struct <tag_name> {
    <type> <member_name> : <width_in_bits>;
    // ...
};
```

**Example: Flags Structure**
```c
struct Flags {
    unsigned int is_admin : 1;
    unsigned int is_active : 1;
    unsigned int permissions : 4;
    unsigned int status : 2;
};
```

This structure uses bit fields to pack multiple boolean and small integer values into a compact representation.

**Memory Layout (assuming 32-bit unsigned int):**
*   `is_admin`: 1 bit
*   `is_active`: 1 bit
*   `permissions`: 4 bits
*   `status`: 2 bits
*   Total: 8 bits (1 byte) - though padding may make the structure larger

**Usage:**
```c
struct Flags f = {1, 1, 0xF, 2};
printf("Admin: %d, Active: %d\n", f.is_admin, f.is_active);
printf("Permissions: 0x%X, Status: %d\n", f.permissions, f.status);

f.permissions = 5; // Set to binary 0101
f.status = 3;      // Maximum value for 2 bits
```

**Key Considerations:**
*   **Type Restrictions:** Bit fields must be of integer type (`int`, `unsigned int`, `signed int`)
*   **Size Limitations:** Width cannot exceed the size of the underlying type
*   **Endianness:** The order of bit fields within a storage unit is implementation-defined (varies by compiler and architecture)
*   **Addressing:** You cannot take the address of a bit field member (no `&f.is_admin`)
*   **Performance:** Accessing bit fields may be slower than regular integers due to masking operations

**Practical Application: Hardware Registers**
```c
// Register definition for a hypothetical device
struct ControlRegister {
    unsigned int enable : 1;
    unsigned int interrupt_enable : 1;
    unsigned int mode : 2;
    unsigned int reserved : 4;
    unsigned int baud_rate : 8;
    // 16 bits used, 16 bits remaining in 32-bit register
};

void set_baud_rate(struct ControlRegister *reg, int rate) {
    // Map rate to appropriate value for baud_rate field
    reg->baud_rate = calculate_baud_value(rate);
}

int get_mode(const struct ControlRegister *reg) {
    return reg->mode;
}
```

**Portability Warning:**
Bit field layouts are not standardized across compilers. Code relying on specific bit field ordering may not be portable. For hardware access where bit ordering matters, consider using bitwise operations on regular integers instead of bit fields.

### 4.7.2 Anonymous Structures and Unions (C11)

C11 introduced anonymous structures and unions, which can be embedded directly within other structures or unions without a name.

**Anonymous Structure Example:**
```c
struct Point {
    int x;
    int y;
};

struct Rectangle {
    struct Point top_left;
    struct {
        int width;
        int height;
    }; // Anonymous structure
};
```

**Usage:**
```c
struct Rectangle r = {{ 0 }}, {{ 0 }}, {10, 20}};
printf("Width: %d, Height: %d\n", r.width, r.height); // Direct access
printf("Top left: (%d, %d)\n", r.top_left.x, r.top_left.y);
```

**Anonymous Union Example:**
```c
struct Data {
    enum {INT, FLOAT, STRING} type;
    union {
        int i;
        float f;
        char s[20];
    }; // Anonymous union
};
```

**Usage:**
```c
struct Data d1 = {INT, .i = 42};
struct Data d2 = {FLOAT, .f = 3.14};
struct Data d3 = {STRING, .s = "Hello"};

printf("d1: %d\n", d1.i);
printf("d2: %.2f\n", d2.f);
printf("d3: %s\n", d3.s);
```

**Benefits of Anonymous Structures/Unions:**
*   **Flatter Access:** Members can be accessed directly without intermediate names
*   **Simplified Code:** Reduces the number of indirections needed
*   **Better Encapsulation:** Hides implementation details
*   **Tagged Union Simplification:** Makes tagged unions cleaner to use

**Limitations:**
*   Requires C11 or later compiler support
*   Cannot be forward-declared
*   May reduce code clarity if overused

**Example: Complex Number with Anonymous Structure**
```c
struct Complex {
    union {
        struct {
            double real;
            double imag;
        };
        double components[2];
    };
};

double magnitude(const struct Complex *c) {
    return sqrt(c->real * c->real + c->imag * c->imag);
}

int main() {
    struct Complex c = {.real = 3.0, .imag = 4.0};
    printf("Magnitude: %.1f\n", magnitude(&c));
    // Can also access as c.components[0] and c.components[1]
    return 0;
}
```

### 4.7.3 Flexible Array Members (C99)

Flexible array members allow a structure to have an array of unspecified size as its last member, enabling variable-length structures.

**Declaration Syntax:**
```c
struct <tag_name> {
    // Other members...
    <element_type> <array_name>[];
};
```

**Example: Dynamic String Structure**
```c
struct String {
    size_t length;
    char data[];
};
```

**Memory Allocation Pattern:**
```c
// Allocate structure + string data in single block
struct String *create_string(const char *str) {
    size_t len = strlen(str);
    struct String *s = malloc(sizeof(struct String) + len + 1);
    if (s) {
        s->length = len;
        strcpy(s->data, str);
    }
    return s;
}

void free_string(struct String *s) {
    free(s);
}
```

**Key Characteristics:**
*   Must be the **last member** of the structure
*   Has **no specified size** (`[]` instead of `[N]`)
*   The structure itself **does not include space** for the array
*   Memory must be allocated in **a single block** containing both the structure and array data
*   Provides **cache efficiency** (structure and data are contiguous)

**Benefits Over Separate Allocation:**
*   **Single Allocation/Deallocation:** One `malloc`/`free` instead of two
*   **Memory Locality:** Structure header and data are contiguous, improving cache performance
*   **Simplified Memory Management:** No risk of forgetting to free the array

**Example: Dynamic Array of Integers**
```c
struct IntArray {
    size_t count;
    int values[];
};

struct IntArray *create_int_array(size_t count) {
    struct IntArray *arr = malloc(sizeof(struct IntArray) + count * sizeof(int));
    if (arr) {
        arr->count = count;
        // Initialize values if needed
    }
    return arr;
}

int main() {
    struct IntArray *arr = create_int_array(10);
    if (arr) {
        for (size_t i = 0; i < arr->count; i++) {
            arr->values[i] = i * i;
        }
        
        // Use the array...
        
        free(arr);
    }
    return 0;
}
```

**Important Note:** Flexible array members are a C99 feature. For compatibility with older C standards, the "struct hack" pattern was used (declaring the array with size 1 and allocating extra space), but this is technically undefined behavior. Flexible array members provide a standardized, well-defined alternative.

## 4.8 Common Pitfalls with Structures and Unions

### 4.8.1 Structure Padding and Alignment Issues

Structure padding, while necessary for performance, can lead to unexpected memory usage and compatibility issues.

**Unexpected Memory Usage:**
```c
struct Example1 {
    char a;   // 1 byte
    int b;    // 4 bytes
    char c;   // 1 byte
}; // Total size: 12 bytes (not 6) due to padding

struct Example2 {
    char a;   // 1 byte
    char c;   // 1 byte
    int b;    // 4 bytes
}; // Total size: 8 bytes (more efficient ordering)
```

**Portability Problems:**
Padding patterns vary across compilers and architectures. A structure defined on one system may have a different memory layout on another, causing issues with:
*   Binary file formats
*   Network protocols
*   Shared memory between processes

**Mitigation Strategies:**
1.  **Order Members by Size:** Place larger members first to minimize padding
    ```c
    struct Efficient {
        double d;   // 8 bytes
        int i;      // 4 bytes
        short s;    // 2 bytes
        char c1, c2; // 1 byte each
    }; // Total size: 16 bytes (vs 24 with poor ordering)
    ```

2.  **Use Packing Directives Sparingly:**
    ```c
    #pragma pack(push, 1)
    struct Packed {
        char a;
        int b;
        char c;
    };
    #pragma pack(pop)
    ```
    *   Reduces size (6 bytes instead of 12)
    *   May cause performance penalties on some architectures
    *   Only use when necessary (e.g., for network protocols)

3.  **Serialize for Cross-Platform Data:**
    *   Don't write raw structures to files or networks
    *   Instead, convert to a defined format (e.g., JSON, XML, or custom serialization)
    *   Use functions to pack/unpack structure data

**Example: Safe Network Transmission**
```c
// Instead of:
// send(socket, &data, sizeof(DataStruct), 0);

// Do:
void serialize_data(const DataStruct *data, char *buffer) {
    memcpy(buffer, &data->field1, sizeof(data->field1));
    buffer += sizeof(data->field1);
    memcpy(buffer, &data->field2, sizeof(data->field2));
    // Continue for all fields
}

void deserialize_data(const char *buffer, DataStruct *data) {
    memcpy(&data->field1, buffer, sizeof(data->field1));
    buffer += sizeof(data->field1);
    memcpy(&data->field2, buffer, sizeof(data->field2));
    // Continue for all fields
}
```

### 4.8.2 Union Misuse

Unions are powerful but prone to misuse, particularly when the active member is not properly tracked.

**Undefined Behavior Examples:**
```c
union Data {
    int i;
    float f;
};

union Data d;
d.i = 10;
printf("f: %f\n", d.f); // UNDEFINED BEHAVIOR! (interpreting int as float)

d.f = 3.14;
printf("i: %d\n", d.i); // UNDEFINED BEHAVIOR! (interpreting float as int)
```

**Consequences:**
*   Incorrect values
*   Program crashes
*   Security vulnerabilities
*   Unpredictable behavior that varies by compiler

**Best Practices:**
1.  **Always Use Tagged Unions:**
    ```c
    typedef struct {
        enum {INT, FLOAT} type;
        union {
            int i;
            float f;
        } value;
    } SafeData;
    
    void print_data(const SafeData *d) {
        if (d->type == INT) {
            printf("Integer: %d\n", d->value.i);
        } else {
            printf("Float: %f\n", d->value.f);
        }
    }
    ```

2.  **Validate the Tag Before Accessing:**
    ```c
    if (data->type == FLOAT_TYPE) {
        // Safe to access data->value.f
    } else {
        // Handle error
    }
    ```

3.  **Provide Accessor Functions:**
    ```c
    int get_int_value(const SafeData *data) {
        if (data->type != INT_TYPE) {
            // Handle error
            return 0;
        }
        return data->value.i;
    }
    ```

### 4.8.3 Structure Assignment and Comparison

Unlike arrays, structures can be assigned as a whole, but there are important limitations to understand.

**Structure Assignment:**
```c
struct Point {
    int x;
    int y;
};

struct Point p1 = {10, 20};
struct Point p2 = p1; // Valid: copies all members
```

This performs a **shallow copy**—all member values are copied, but if the structure contains pointers, only the pointer values are copied, not the data they point to.

**Problem with Pointer Members:**
```c
struct String {
    char *data;
    size_t length;
};

struct String s1 = {malloc(6), 5};
strcpy(s1.data, "Hello");

struct String s2 = s1; // Shallow copy
// Now s1.data and s2.data point to the same memory!

free(s1.data); // Also invalidates s2.data
printf("%s\n", s2.data); // UNDEFINED BEHAVIOR!
```

**Structure Comparison:**
Unlike assignment, C does **not** support direct structure comparison:
```c
struct Point p1 = {10, 20};
struct Point p2 = {10, 20};
if (p1 == p2) { // ERROR: Illegal comparison
    // ...
}
```

**Workaround:**
```c
int points_equal(const struct Point *p1, const struct Point *p2) {
    return (p1->x == p2->x) && (p1->y == p2->y);
}
```

**Deep Copy vs. Shallow Copy:**
*   **Shallow Copy:** Copies structure members directly (pointers are copied, not their targets)
*   **Deep Copy:** Allocates new memory for pointer members and copies the pointed-to data

**Deep Copy Implementation:**
```c
struct String *copy_string(const struct String *src) {
    struct String *dest = malloc(sizeof(struct String));
    if (!dest) return NULL;
    
    dest->length = src->length;
    dest->data = malloc(src->length + 1);
    if (!dest->data) {
        free(dest);
        return NULL;
    }
    strcpy(dest->data, src->data);
    
    return dest;
}
```

## 4.9 Best Practices for Structure and Union Design

### 4.9.1 Design Principles

**Cohesion:**
Structure members should be closely related and represent a single logical entity.

*   **Good:** 
    ```c
    struct Rectangle {
        int x, y;      // Position
        int width, height; // Dimensions
    };
    ```
*   **Poor:**
    ```c
    struct Mixed {
        int student_id;
        char product_name[50];
        float temperature;
    }; // Lacks cohesion
    ```

**Information Hiding:**
Hide implementation details by providing accessor functions rather than direct member access.

```c
// In header file
typedef struct Date Date;

Date *date_create(int year, int month, int day);
void date_destroy(Date *date);
int date_get_year(const Date *date);
// Other accessors...

// In implementation file
struct Date {
    int year;
    int month;
    int day;
};
```

**Minimal Interface:**
Provide only the necessary operations on a structure, reducing dependencies and improving maintainability.

**Forward Declarations:**
Use opaque pointers to hide structure implementation:

```c
// In header (public interface)
typedef struct Database Database;

Database *db_connect(const char *host);
void db_disconnect(Database *db);
// Only function declarations, no structure definition

// In implementation file
struct Database {
    // Private implementation details
    int connection_id;
    char *host;
    // ...
};
```

**Design for Extension:**
Structure your data to accommodate future changes:

```c
struct Header {
    int version; // Allows for future format changes
    size_t size;
    // Other fields...
};
```

### 4.9.2 Memory Management Guidelines

**Clear Ownership Semantics:**
Define who is responsible for allocating and freeing memory, especially for structures containing pointers.

*   **Creator Responsibility:**
    ```c
    struct Person *person_create(const char *name, int age);
    void person_destroy(struct Person *person);
    ```

*   **Transfer of Ownership:**
    ```c
    void list_add(List *list, struct Item *item); 
    // List now owns the item and will free it
    ```

**Consistent Allocation/Deallocation:**
Ensure allocation and deallocation follow the same pattern:

```c
// Good: Consistent pattern
struct Resource *res = resource_create();
// ...
resource_destroy(res);

// Bad: Inconsistent pattern
struct Resource *res = malloc(sizeof(struct Resource));
// ...
free(res->subresource);
free(res);
```

**Use RAII-Like Patterns:**
Though C lacks destructors, you can structure code to ensure cleanup:

```c
void process_data() {
    FILE *file = fopen("data.txt", "r");
    if (!file) { /* handle error */ }
    
    struct Database *db = db_connect("localhost");
    if (!db) {
        fclose(file);
        return;
    }
    
    // Process data...
    
    db_disconnect(db);
    fclose(file);
}
```

**Handle Allocation Failures Gracefully:**
Always check for `NULL` after memory allocation:

```c
struct Person *person_create(const char *name, int age) {
    struct Person *p = malloc(sizeof(struct Person));
    if (!p) return NULL;
    
    p->name = strdup(name);
    if (!p->name) {
        free(p);
        return NULL;
    }
    
    p->age = age;
    return p;
}
```

### 4.9.3 Documentation and Code Clarity

**Meaningful Names:**
Use descriptive names for structures and members:

```c
// Good
struct NetworkConnection {
    int socket_fd;
    struct sockaddr_in address;
    time_t last_activity;
};

// Poor
struct Conn {
    int s;
    struct sockaddr_in addr;
    time_t t;
};
```

**Comprehensive Comments:**
Document structure purpose, member meanings, and invariants:

```c
/**
 * Represents a geometric rectangle
 * Invariant: width and height must be non-negative
 */
struct Rectangle {
    int x;      ///< X-coordinate of top-left corner
    int y;      ///< Y-coordinate of top-left corner
    int width;  ///< Width (must be >= 0)
    int height; ///< Height (must be >= 0)
};
```

**Consistent Style:**
Follow a consistent style for structure definitions:

*   Always use typedef with tag
*   Keep related structures together
*   Order members logically (e.g., by size for efficiency)
*   Group related members with comments

**Header File Organization:**
Structure header files to provide clear interfaces:

```c
/* rectangle.h */
#ifndef RECTANGLE_H
#define RECTANGLE_H

/**
 * @file rectangle.h
 * @brief Rectangle geometry operations
 */

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Rectangle structure
 * All coordinates are in pixels
 */
typedef struct {
    int x;      ///< X-coordinate of top-left corner
    int y;      ///< Y-coordinate of top-left corner
    int width;  ///< Width in pixels (>= 0)
    int height; ///< Height in pixels (>= 0)
} Rectangle;

/**
 * @brief Create a new rectangle
 * @param x X-coordinate of top-left corner
 * @param y Y-coordinate of top-left corner
 * @param width Width in pixels (must be >= 0)
 * @param height Height in pixels (must be >= 0)
 * @return New rectangle, or NULL if width/height invalid
 */
Rectangle *rectangle_create(int x, int y, int width, int height);

// Other function declarations...

#ifdef __cplusplus
}
#endif

#endif /* RECTANGLE_H */
```

## 4.10 Practical Applications

### 4.10.1 Contact Management System

This example demonstrates a practical contact management system using structures, dynamic memory, and file I/O.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_NAME 50
#define MAX_PHONE 15
#define MAX_EMAIL 50
#define MAX_CONTACTS 100

typedef struct {
    char name[MAX_NAME];
    char phone[MAX_PHONE];
    char email[MAX_EMAIL];
} Contact;

// Function prototypes
void add_contact(Contact contacts[], int *count);
void list_contacts(const Contact contacts[], int count);
void search_contacts(const Contact contacts[], int count);
void save_contacts(const Contact contacts[], int count, const char *filename);
int load_contacts(Contact contacts[], int max_contacts, const char *filename);
void trim_whitespace(char *str);
int is_valid_email(const char *email);
void display_menu();

int main() {
    Contact contacts[MAX_CONTACTS];
    int contact_count = 0;
    char filename[] = "contacts.dat";
    
    // Load existing contacts
    contact_count = load_contacts(contacts, MAX_CONTACTS, filename);
    printf("Loaded %d contacts from %s\n", contact_count, filename);
    
    int choice;
    do {
        display_menu();
        printf("Enter your choice: ");
        scanf("%d", &choice);
        getchar(); // Clear newline from input buffer
        
        switch (choice) {
            case 1:
                add_contact(contacts, &contact_count);
                break;
            case 2:
                list_contacts(contacts, contact_count);
                break;
            case 3:
                search_contacts(contacts, contact_count);
                break;
            case 4:
                save_contacts(contacts, contact_count, filename);
                printf("Contacts saved to %s\n", filename);
                break;
            case 5:
                printf("Exiting program.\n");
                break;
            default:
                printf("Invalid choice. Please try again.\n");
        }
    } while (choice != 5);
    
    return 0;
}

void display_menu() {
    printf("\nContact Management System\n");
    printf("1. Add new contact\n");
    printf("2. List all contacts\n");
    printf("3. Search contacts\n");
    printf("4. Save contacts to file\n");
    printf("5. Exit\n");
}

void add_contact(Contact contacts[], int *count) {
    if (*count >= MAX_CONTACTS) {
        printf("Contact list is full!\n");
        return;
    }
    
    Contact new_contact;
    
    printf("Enter name: ");
    fgets(new_contact.name, MAX_NAME, stdin);
    trim_whitespace(new_contact.name);
    
    printf("Enter phone: ");
    fgets(new_contact.phone, MAX_PHONE, stdin);
    trim_whitespace(new_contact.phone);
    
    do {
        printf("Enter email: ");
        fgets(new_contact.email, MAX_EMAIL, stdin);
        trim_whitespace(new_contact.email);
        
        if (!is_valid_email(new_contact.email)) {
            printf("Invalid email format. Please try again.\n");
        }
    } while (!is_valid_email(new_contact.email));
    
    contacts[*count] = new_contact;
    (*count)++;
    printf("Contact added successfully!\n");
}

void list_contacts(const Contact contacts[], int count) {
    if (count == 0) {
        printf("No contacts to display.\n");
        return;
    }
    
    printf("\n%-20s %-15s %-30s\n", "Name", "Phone", "Email");
    printf("%-20s %-15s %-30s\n", "--------------------", "---------------", "------------------------------");
    
    for (int i = 0; i < count; i++) {
        printf("%-20s %-15s %-30s\n", 
               contacts[i].name, 
               contacts[i].phone, 
               contacts[i].email);
    }
}

void search_contacts(const Contact contacts[], int count) {
    if (count == 0) {
        printf("No contacts to search.\n");
        return;
    }
    
    char query[50];
    printf("Enter search term: ");
    fgets(query, sizeof(query), stdin);
    trim_whitespace(query);
    
    int found = 0;
    printf("\n%-20s %-15s %-30s\n", "Name", "Phone", "Email");
    printf("%-20s %-15s %-30s\n", "--------------------", "---------------", "------------------------------");
    
    for (int i = 0; i < count; i++) {
        if (strstr(contacts[i].name, query) ||
            strstr(contacts[i].phone, query) ||
            strstr(contacts[i].email, query)) {
            
            printf("%-20s %-15s %-30s\n", 
                   contacts[i].name, 
                   contacts[i].phone, 
                   contacts[i].email);
            found = 1;
        }
    }
    
    if (!found) {
        printf("No matching contacts found.\n");
    }
}

void save_contacts(const Contact contacts[], int count, const char *filename) {
    FILE *file = fopen(filename, "wb");
    if (!file) {
        perror("Error opening file for writing");
        return;
    }
    
    // Write count first
    fwrite(&count, sizeof(int), 1, file);
    
    // Write all contacts
    fwrite(contacts, sizeof(Contact), count, file);
    
    fclose(file);
}

int load_contacts(Contact contacts[], int max_contacts, const char *filename) {
    FILE *file = fopen(filename, "rb");
    if (!file) {
        // File might not exist yet
        return 0;
    }
    
    int count;
    size_t items_read;
    
    // Read count
    items_read = fread(&count, sizeof(int), 1, file);
    if (items_read != 1) {
        fclose(file);
        return 0;
    }
    
    // Ensure we don't exceed array bounds
    if (count > max_contacts) {
        count = max_contacts;
    }
    
    // Read contacts
    items_read = fread(contacts, sizeof(Contact), count, file);
    if (items_read != (size_t)count) {
        count = (int)items_read;
    }
    
    fclose(file);
    return count;
}

void trim_whitespace(char *str) {
    // Trim leading whitespace
    char *start = str;
    while (isspace((unsigned char)*start)) {
        start++;
    }
    
    // Trim trailing whitespace
    char *end = start + strlen(start) - 1;
    while (end > start && isspace((unsigned char)*end)) {
        end--;
    }
    *(end + 1) = '\0';
    
    // Move string to beginning
    if (start != str) {
        memmove(str, start, end - start + 2);
    }
}

int is_valid_email(const char *email) {
    // Simple email validation
    const char *at = strchr(email, '@');
    if (!at) return 0;
    
    const char *dot = strrchr(at, '.');
    return (dot && dot > at + 1 && strlen(dot) > 1);
}
```

**Key Techniques Demonstrated:**
*   Structure definition for contact records
*   Array of structures for contact storage
*   Dynamic memory management (implicitly via array)
*   File I/O for persistent storage
*   Input validation and sanitization
*   String manipulation for search and formatting
*   Menu-driven user interface

**Design Considerations:**
*   Fixed-size array limits contacts to `MAX_CONTACTS`
*   Binary file format for efficient storage
*   Simple email validation (could be enhanced)
*   Whitespace trimming for cleaner data entry
*   Case-insensitive search via `strstr`

### 4.10.2 Linked List Implementation

This example demonstrates a robust linked list implementation using structures and pointers.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    char data[50];
    struct Node *next;
} Node;

typedef struct {
    Node *head;
    Node *tail;
    int size;
} LinkedList;

// Function prototypes
LinkedList *list_create();
void list_destroy(LinkedList *list);
int list_size(const LinkedList *list);
void list_add(LinkedList *list, const char *value);
int list_contains(const LinkedList *list, const char *value);
void list_remove(LinkedList *list, const char *value);
void list_print(const LinkedList *list);
void list_reverse(LinkedList *list);

LinkedList *list_create() {
    LinkedList *list = malloc(sizeof(LinkedList));
    if (!list) return NULL;
    
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
    
    return list;
}

void list_destroy(LinkedList *list) {
    if (!list) return;
    
    Node *current = list->head;
    while (current) {
        Node *next = current->next;
        free(current);
        current = next;
    }
    
    free(list);
}

int list_size(const LinkedList *list) {
    return list->size;
}

void list_add(LinkedList *list, const char *value) {
    if (!list || !value) return;
    
    Node *new_node = malloc(sizeof(Node));
    if (!new_node) return;
    
    strncpy(new_node->data, value, sizeof(new_node->data) - 1);
    new_node->data[sizeof(new_node->data) - 1] = '\0';
    new_node->next = NULL;
    
    if (!list->head) {
        list->head = new_node;
        list->tail = new_node;
    } else {
        list->tail->next = new_node;
        list->tail = new_node;
    }
    
    list->size++;
}

int list_contains(const LinkedList *list, const char *value) {
    if (!list || !value) return 0;
    
    Node *current = list->head;
    while (current) {
        if (strcmp(current->data, value) == 0) {
            return 1;
        }
        current = current->next;
    }
    
    return 0;
}

void list_remove(LinkedList *list, const char *value) {
    if (!list || !value || !list->head) return;
    
    // Special case: removing head
    if (strcmp(list->head->data, value) == 0) {
        Node *to_remove = list->head;
        list->head = list->head->next;
        if (!list->head) {
            list->tail = NULL;
        }
        free(to_remove);
        list->size--;
        return;
    }
    
    // General case
    Node *current = list->head;
    while (current->next) {
        if (strcmp(current->next->data, value) == 0) {
            Node *to_remove = current->next;
            current->next = to_remove->next;
            
            if (!current->next) {
                list->tail = current;
            }
            
            free(to_remove);
            list->size--;
            return;
        }
        current = current->next;
    }
}

void list_print(const LinkedList *list) {
    printf("List (%d items): ", list->size);
    
    Node *current = list->head;
    while (current) {
        printf("%s", current->data);
        current = current->next;
        if (current) {
            printf(" -> ");
        }
    }
    printf(" -> NULL\n");
}

void list_reverse(LinkedList *list) {
    if (!list || !list->head || !list->head->next) {
        return; // Empty or single-node list
    }
    
    Node *prev = NULL;
    Node *current = list->head;
    Node *next = NULL;
    
    list->tail = list->head; // Old head becomes new tail
    
    while (current) {
        next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    }
    
    list->head = prev; // New head
}

int main() {
    LinkedList *list = list_create();
    if (!list) {
        fprintf(stderr, "Failed to create list\n");
        return 1;
    }
    
    list_add(list, "Apple");
    list_add(list, "Banana");
    list_add(list, "Cherry");
    list_add(list, "Date");
    
    printf("Original list:\n");
    list_print(list);
    
    printf("\nContains 'Banana': %s\n", 
           list_contains(list, "Banana") ? "Yes" : "No");
    printf("Contains 'Grape': %s\n", 
           list_contains(list, "Grape") ? "Yes" : "No");
    
    printf("\nRemoving 'Banana':\n");
    list_remove(list, "Banana");
    list_print(list);
    
    printf("\nReversing list:\n");
    list_reverse(list);
    list_print(list);
    
    list_destroy(list);
    return 0;
}
```

**Output:**
```
Original list:
List (4 items): Apple -> Banana -> Cherry -> Date -> NULL

Contains 'Banana': Yes
Contains 'Grape': No

Removing 'Banana':
List (3 items): Apple -> Cherry -> Date -> NULL

Reversing list:
List (3 items): Date -> Cherry -> Apple -> NULL
```

**Key Techniques Demonstrated:**
*   Structure definitions for nodes and list metadata
*   Dynamic memory allocation for nodes
*   Robust memory management with proper cleanup
*   Comprehensive list operations (add, remove, search, reverse)
*   Special case handling (empty list, single node, head/tail operations)
*   Size tracking for efficient operations

**Design Considerations:**
*   Maintains both head and tail pointers for efficient appending
*   Tracks size for O(1) size queries
*   Handles special cases explicitly for robustness
*   Provides clean interface with implementation details hidden
*   Proper memory management prevents leaks

### 4.10.3 Using Unions for Data Representation

This example demonstrates a practical application of unions for representing different data types in a single structure.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

typedef enum {
    INTEGER,
    FLOAT,
    STRING,
    BOOLEAN
} ValueType;

typedef struct {
    ValueType type;
    union {
        int i;
        float f;
        char *s;
        int b; // Using int for boolean (0 = false, non-zero = true)
    } value;
} ConfigValue;

typedef struct {
    char name[50];
    ConfigValue value;
} ConfigItem;

typedef struct {
    ConfigItem *items;
    int count;
    int capacity;
} Config;

// Function prototypes
Config *config_create(int initial_capacity);
void config_destroy(Config *config);
int config_set_int(Config *config, const char *name, int value);
int config_set_float(Config *config, const char *name, float value);
int config_set_string(Config *config, const char *name, const char *value);
int config_set_bool(Config *config, const char *name, int value);
const ConfigValue *config_get(const Config *config, const char *name);
void config_print(const Config *config);

Config *config_create(int initial_capacity) {
    if (initial_capacity <= 0) {
        initial_capacity = 4; // Default capacity
    }
    
    Config *cfg = malloc(sizeof(Config));
    if (!cfg) return NULL;
    
    cfg->items = malloc(initial_capacity * sizeof(ConfigItem));
    if (!cfg->items) {
        free(cfg);
        return NULL;
    }
    
    cfg->count = 0;
    cfg->capacity = initial_capacity;
    return cfg;
}

void config_destroy(Config *config) {
    if (!config) return;
    
    for (int i = 0; i < config->count; i++) {
        if (config->items[i].value.type == STRING) {
            free(config->items[i].value.value.s);
        }
    }
    
    free(config->items);
    free(config);
}

int config_set_int(Config *config, const char *name, int value) {
    // Check if name already exists
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->items[i].name, name) == 0) {
            // Update existing item
            if (config->items[i].value.type == STRING) {
                free(config->items[i].value.value.s);
            }
            config->items[i].value.type = INTEGER;
            config->items[i].value.value.i = value;
            return 1;
        }
    }
    
    // Need to add new item
    if (config->count >= config->capacity) {
        // Grow array
        int new_capacity = config->capacity * 2;
        ConfigItem *new_items = realloc(config->items, 
                                       new_capacity * sizeof(ConfigItem));
        if (!new_items) return 0;
        
        config->items = new_items;
        config->capacity = new_capacity;
    }
    
    // Add new item
    strncpy(config->items[config->count].name, name, sizeof(config->items[config->count].name) - 1);
    config->items[config->count].name[sizeof(config->items[config->count].name) - 1] = '\0';
    
    config->items[config->count].value.type = INTEGER;
    config->items[config->count].value.value.i = value;
    
    config->count++;
    return 1;
}

// Similar implementations for config_set_float, config_set_string, config_set_bool...
int config_set_float(Config *config, const char *name, float value) {
    // Similar to config_set_int but for FLOAT type
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->items[i].name, name) == 0) {
            if (config->items[i].value.type == STRING) {
                free(config->items[i].value.value.s);
            }
            config->items[i].value.type = FLOAT;
            config->items[i].value.value.f = value;
            return 1;
        }
    }
    
    if (config->count >= config->capacity) {
        int new_capacity = config->capacity * 2;
        ConfigItem *new_items = realloc(config->items, 
                                       new_capacity * sizeof(ConfigItem));
        if (!new_items) return 0;
        
        config->items = new_items;
        config->capacity = new_capacity;
    }
    
    strncpy(config->items[config->count].name, name, sizeof(config->items[config->count].name) - 1);
    config->items[config->count].name[sizeof(config->items[config->count].name) - 1] = '\0';
    
    config->items[config->count].value.type = FLOAT;
    config->items[config->count].value.value.f = value;
    
    config->count++;
    return 1;
}

int config_set_string(Config *config, const char *name, const char *value) {
    // Similar to config_set_int but for STRING type (with dynamic allocation)
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->items[i].name, name) == 0) {
            if (config->items[i].value.type == STRING) {
                free(config->items[i].value.value.s);
            }
            config->items[i].value.type = STRING;
            
            config->items[i].value.value.s = strdup(value);
            if (!config->items[i].value.value.s) {
                config->items[i].value.type = INTEGER; // Revert to safe state
                config->items[i].value.value.i = 0;
                return 0;
            }
            return 1;
        }
    }
    
    if (config->count >= config->capacity) {
        int new_capacity = config->capacity * 2;
        ConfigItem *new_items = realloc(config->items, 
                                       new_capacity * sizeof(ConfigItem));
        if (!new_items) return 0;
        
        config->items = new_items;
        config->capacity = new_capacity;
    }
    
    strncpy(config->items[config->count].name, name, sizeof(config->items[config->count].name) - 1);
    config->items[config->count].name[sizeof(config->items[config->count].name) - 1] = '\0';
    
    config->items[config->count].value.type = STRING;
    config->items[config->count].value.value.s = strdup(value);
    if (!config->items[config->count].value.value.s) {
        config->count--; // Remove the partially added item
        return 0;
    }
    
    config->count++;
    return 1;
}

int config_set_bool(Config *config, const char *name, int value) {
    // Similar to config_set_int but for BOOLEAN type
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->items[i].name, name) == 0) {
            if (config->items[i].value.type == STRING) {
                free(config->items[i].value.value.s);
            }
            config->items[i].value.type = BOOLEAN;
            config->items[i].value.value.b = (value != 0);
            return 1;
        }
    }
    
    if (config->count >= config->capacity) {
        int new_capacity = config->capacity * 2;
        ConfigItem *new_items = realloc(config->items, 
                                       new_capacity * sizeof(ConfigItem));
        if (!new_items) return 0;
        
        config->items = new_items;
        config->capacity = new_capacity;
    }
    
    strncpy(config->items[config->count].name, name, sizeof(config->items[config->count].name) - 1);
    config->items[config->count].name[sizeof(config->items[config->count].name) - 1] = '\0';
    
    config->items[config->count].value.type = BOOLEAN;
    config->items[config->count].value.value.b = (value != 0);
    
    config->count++;
    return 1;
}

const ConfigValue *config_get(const Config *config, const char *name) {
    for (int i = 0; i < config->count; i++) {
        if (strcmp(config->items[i].name, name) == 0) {
            return &config->items[i].value;
        }
    }
    return NULL;
}

void config_print(const Config *config) {
    printf("Configuration (%d items):\n", config->count);
    
    for (int i = 0; i < config->count; i++) {
        printf("  %s = ", config->items[i].name);
        
        switch (config->items[i].value.type) {
            case INTEGER:
                printf("%d\n", config->items[i].value.value.i);
                break;
            case FLOAT:
                printf("%.2f\n", config->items[i].value.value.f);
                break;
            case STRING:
                printf("\"%s\"\n", config->items[i].value.value.s);
                break;
            case BOOLEAN:
                printf("%s\n", config->items[i].value.value.b ? "true" : "false");
                break;
        }
    }
}

int main() {
    Config *cfg = config_create(4);
    if (!cfg) {
        fprintf(stderr, "Failed to create config\n");
        return 1;
    }
    
    config_set_int(cfg, "max_connections", 100);
    config_set_float(cfg, "timeout", 30.5);
    config_set_string(cfg, "server_name", "localhost");
    config_set_bool(cfg, "debug_mode", 1);
    
    config_print(cfg);
    
    // Update a value
    config_set_int(cfg, "max_connections", 200);
    
    // Get and use a value
    const ConfigValue *timeout = config_get(cfg, "timeout");
    if (timeout && timeout->type == FLOAT) {
        printf("\nTimeout value: %.2f\n", timeout->value.f);
    }
    
    config_destroy(cfg);
    return 0;
}
```

**Output:**
```
Configuration (4 items):
  max_connections = 100
  timeout = 30.50
  server_name = "localhost"
  debug_mode = true

Timeout value: 30.50
```

**Key Techniques Demonstrated:**
*   Tagged union pattern for safe type handling
*   Dynamic memory management for string values
*   Configurable storage capacity with automatic growth
*   Type-safe value retrieval
*   Comprehensive memory management to prevent leaks
*   Clear interface for configuration operations

**Design Considerations:**
*   Uses a tagged union to safely represent multiple data types
*   Automatically manages memory for string values
*   Grows storage capacity as needed
*   Provides type-safe access to configuration values
*   Includes proper cleanup to prevent memory leaks

## 4.11 Conclusion and Path Forward

This chapter has provided a comprehensive exploration of structures and unions in C, building upon the pointer and dynamic memory foundations established in Chapter 3. We've examined structure declaration and usage, memory layout considerations, the relationship between structures and pointers, nested and self-referential structures, typedef usage, union mechanics, and advanced features like bit fields and flexible array members. We've also addressed common pitfalls and best practices for robust structure and union design, culminating in practical applications demonstrating real-world implementations.

Key concepts mastered include:
*   Structure declaration, initialization, and member access with proper memory considerations
*   The critical relationship between structures and pointers, including pointer-to-structure operations
*   Self-referential structures as the foundation for dynamic data structures
*   Effective use of typedef to simplify structure declarations
*   Union mechanics and the essential tagged union pattern for safe usage
*   Advanced structure features including bit fields, anonymous structures/unions, and flexible array members
*   Common pitfalls like padding issues, union misuse, and shallow copying problems
*   Best practices for structure design, memory management, and code clarity
*   Practical applications across contact management, linked data structures, and configuration systems

The examples demonstrated practical applications that transform theoretical concepts into working solutions, illustrating how structures and unions enable the modeling of complex real-world data and relationships. By understanding both the capabilities and limitations of these composite types, you've gained the ability to design efficient, maintainable data structures that form the backbone of robust C programs.

As you progress, the concepts in this chapter form the essential foundation for more advanced topics:
*   **Chapter 5 (File I/O and Advanced String Handling)** will apply structure techniques to persistent data storage
*   **Chapter 6 (Function Pointers and Callbacks)** will combine structures with function pointers for powerful design patterns
*   **Chapter 7 (Advanced Data Structures)** will leverage these fundamentals to implement trees, hash tables, and other complex structures
*   **Chapter 8 (Memory Management Techniques)** will deepen your understanding of structure-based memory organization

> **"Structures transform C from a language of isolated variables into a language of meaningful relationships. They are the bridge between raw memory and conceptual understanding—where data becomes not just information, but a representation of reality itself."**

