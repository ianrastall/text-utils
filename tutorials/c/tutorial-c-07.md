# 7. Advanced Data Structures in C

## 7.1 Beyond Linear Collections

Having explored fundamental data structures like arrays and linked lists in previous chapters, we now turn to more sophisticated organizational patterns that enable efficient solutions to complex computational problems. While basic structures suffice for simple data organization, **advanced data structures** provide specialized capabilities for specific computational challenges—enabling faster searches, efficient memory usage, and elegant solutions to problems that would be intractable with simpler approaches.

> **"Data structures are the architecture of computation—they determine not just what can be computed, but how efficiently and elegantly it can be accomplished. Mastering them transforms a programmer from a code writer into a computational architect."**

Advanced data structures matter because:
*   They enable solutions to problems with large datasets that would be impractical with naive approaches
*   They provide specialized capabilities for specific computational patterns (searching, sorting, graph traversal)
*   They optimize for critical resources: time, memory, disk access, or network bandwidth
*   They form the foundation for higher-level abstractions in operating systems, databases, and applications
*   They represent conceptual frameworks that transcend specific implementations

This chapter explores the most important advanced data structures, focusing on their C implementations, performance characteristics, and practical applications. We'll examine not just how to implement these structures, but when and why to choose one over another—a crucial skill for effective system design.

## 7.2 Linked Data Structures: Beyond the Basic List

### 7.2.1 Doubly Linked Lists

While Chapter 4 introduced singly linked lists, **doubly linked lists** enhance this structure with backward traversal capabilities by adding a previous pointer to each node.

**Structure Definition:**
```c
typedef struct Node {
    int data;
    struct Node *next;
    struct Node *prev;
} Node;
```

**Memory Layout:**
```
+-----+------+------+
| prev| data | next |
+-----+------+------+
   ^      |      ^
   |      v      |
+-----+  +-----+  +-----+
|  |  |  |  |  |  |  |  |
+-----+  +-----+  +-----+
```

**Key Operations:**
*   **Insertion:** Can be at head, tail, or middle with O(1) complexity when position is known
*   **Deletion:** Similarly efficient with O(1) when node is known
*   **Traversal:** Forward and backward with equal efficiency

**Implementation Example:**
```c
Node *create_node(int data) {
    Node *node = malloc(sizeof(Node));
    if (node) {
        node->data = data;
        node->next = node->prev = NULL;
    }
    return node;
}

void insert_after(Node *node, int data) {
    if (!node) return;
    
    Node *new_node = create_node(data);
    if (!new_node) return;
    
    new_node->next = node->next;
    new_node->prev = node;
    
    if (node->next) {
        node->next->prev = new_node;
    }
    node->next = new_node;
}

void remove_node(Node *node) {
    if (!node) return;
    
    if (node->prev) {
        node->prev->next = node->next;
    }
    if (node->next) {
        node->next->prev = node->prev;
    }
    
    free(node);
}
```

**Advantages Over Singly Linked Lists:**
*   Bidirectional traversal
*   Efficient deletion when only the node pointer is available
*   Easier list reversal

**Disadvantages:**
*   Additional memory per node (for previous pointer)
*   Slightly more complex pointer manipulation

### 7.2.2 Circular Linked Lists

Circular linked lists connect the last node back to the first, creating a continuous loop.

**Variations:**
*   **Singly Circular:** Tail node points to head
*   **Doubly Circular:** Both head and tail have complete connections

**Structure Definition (Singly Circular):**
```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;
```

**Key Operations:**
*   **Traversal:** Must detect when back at start (typically by comparing to head)
*   **Insertion/Deletion:** Similar to standard lists but with special handling for head/tail

**Implementation Example:**
```c
void insert_at_end(Node **head, int data) {
    Node *new_node = create_node(data);
    if (!new_node) return;
    
    if (!*head) {
        *head = new_node;
        new_node->next = new_node; // Point to self
    } else {
        Node *tail = (*head)->prev; // For doubly circular
        new_node->next = *head;
        new_node->prev = tail;
        tail->next = new_node;
        (*head)->prev = new_node;
    }
}
```

**Practical Applications:**
*   Round-robin scheduling
*   Buffer implementations (circular buffers)
*   Game development (circular turn sequences)
*   Cryptographic algorithms requiring cyclic operations

### 7.2.3 Sentinel Nodes

Sentinel nodes are dummy nodes that simplify edge case handling in linked structures.

**Benefits:**
*   Eliminates special cases for head/tail operations
*   Simplifies boundary conditions in algorithms
*   Reduces code complexity and potential bugs

**Implementation Example:**
```c
typedef struct {
    Node *head;
    Node *tail;
    Node sentinel; // Dummy node
} List;

void list_init(List *list) {
    list->sentinel.next = &list->sentinel;
    list->sentinel.prev = &list->sentinel;
    list->head = &list->sentinel;
    list->tail = &list->sentinel;
}

int list_is_empty(const List *list) {
    return list->head->next == &list->sentinel;
}
```

With a sentinel node, operations no longer need special handling for empty lists or boundary conditions, as the sentinel always provides a valid node to reference.

## 7.3 Abstract Data Types: Stacks and Queues

### 7.3.1 Stack Implementation

A stack follows the **Last-In-First-Out (LIFO)** principle. While arrays can implement stacks, linked lists provide dynamic sizing.

**Array-Based Stack:**
```c
typedef struct {
    int *items;
    int top;
    int capacity;
} Stack;

int stack_init(Stack *stack, int capacity) {
    stack->items = malloc(capacity * sizeof(int));
    if (!stack->items) return 0;
    stack->top = -1;
    stack->capacity = capacity;
    return 1;
}

int stack_push(Stack *stack, int item) {
    if (stack->top == stack->capacity - 1) {
        return 0; // Stack overflow
    }
    stack->items[++(stack->top)] = item;
    return 1;
}

int stack_pop(Stack *stack, int *item) {
    if (stack->top == -1) {
        return 0; // Stack underflow
    }
    *item = stack->items[(stack->top)--];
    return 1;
}
```

**Linked List Stack:**
```c
typedef struct {
    Node *top;
} Stack;

void stack_push(Stack *stack, int item) {
    Node *node = create_node(item);
    if (node) {
        node->next = stack->top;
        stack->top = node;
    }
}

int stack_pop(Stack *stack, int *item) {
    if (!stack->top) return 0;
    
    Node *temp = stack->top;
    *item = temp->data;
    stack->top = stack->top->next;
    free(temp);
    return 1;
}
```

**Time Complexity Comparison:**

| **Operation** | **Array-Based** | **Linked List** | **Notes**                              |
| :------------ | :-------------- | :-------------- | :------------------------------------- |
| **`push`**    | **O(1)**        | **O(1)**        | **Array may need resizing**            |
| **`pop`**     | **O(1)**        | **O(1)**        | **Consistent performance**             |
| **`peek`**    | **O(1)**        | **O(1)**        | **Access top element**                 |
| **Memory**    | **Fixed**       | **Dynamic**     | **Array wastes space if underutilized** |

**Practical Applications:**
*   Function call stack
*   Expression evaluation and syntax parsing
*   Backtracking algorithms
*   Undo/redo functionality
*   Browser history navigation

### 7.3.2 Queue Implementation

A queue follows the **First-In-First-Out (FIFO)** principle. Efficient implementations require tracking both head and tail.

**Array-Based Circular Queue:**
```c
typedef struct {
    int *items;
    int front;
    int rear;
    int size;
    int capacity;
} Queue;

int queue_init(Queue *queue, int capacity) {
    queue->items = malloc(capacity * sizeof(int));
    if (!queue->items) return 0;
    queue->front = queue->rear = -1;
    queue->size = 0;
    queue->capacity = capacity;
    return 1;
}

int queue_enqueue(Queue *queue, int item) {
    if ((queue->rear + 1) % queue->capacity == queue->front) {
        return 0; // Queue full
    }
    
    if (queue->front == -1) {
        queue->front = queue->rear = 0;
    } else {
        queue->rear = (queue->rear + 1) % queue->capacity;
    }
    
    queue->items[queue->rear] = item;
    queue->size++;
    return 1;
}

int queue_dequeue(Queue *queue, int *item) {
    if (queue->front == -1) {
        return 0; // Queue empty
    }
    
    *item = queue->items[queue->front];
    
    if (queue->front == queue->rear) {
        queue->front = queue->rear = -1;
    } else {
        queue->front = (queue->front + 1) % queue->capacity;
    }
    
    queue->size--;
    return 1;
}
```

**Linked List Queue:**
```c
typedef struct {
    Node *front;
    Node *rear;
} Queue;

void queue_enqueue(Queue *queue, int item) {
    Node *node = create_node(item);
    if (!node) return;
    
    if (!queue->rear) {
        queue->front = queue->rear = node;
    } else {
        queue->rear->next = node;
        queue->rear = node;
    }
}

int queue_dequeue(Queue *queue, int *item) {
    if (!queue->front) return 0;
    
    Node *temp = queue->front;
    *item = temp->data;
    
    queue->front = queue->front->next;
    
    if (!queue->front) {
        queue->rear = NULL;
    }
    
    free(temp);
    return 1;
}
```

**Time Complexity Comparison:**

| **Operation** | **Array-Based** | **Linked List** | **Notes**                              |
| :------------ | :-------------- | :-------------- | :------------------------------------- |
| **`enqueue`** | **O(1)**        | **O(1)**        | **Array uses modulo arithmetic**       |
| **`dequeue`** | **O(1)**        | **O(1)**        | **Consistent performance**             |
| **Memory**    | **Fixed**       | **Dynamic**     | **Array wastes space if underutilized** |
| **Resizing**  | **O(n)**        | **N/A**         | **Array requires copying on resize**   |

**Practical Applications:**
*   Task scheduling
*   Breadth-First Search (BFS) algorithm
*   Print job management
*   Network packet buffering
*   Producer-consumer problems

### 7.3.3 Priority Queues

Priority queues serve elements based on priority rather than insertion order.

**Binary Heap Implementation:**
```c
typedef struct {
    int *heap;
    int size;
    int capacity;
} PriorityQueue;

// Helper functions
static int parent(int i) { return (i - 1) / 2; }
static int left(int i) { return 2 * i + 1; }
static int right(int i) { return 2 * i + 2; }

void heapify(PriorityQueue *pq, int i) {
    int largest = i;
    int l = left(i);
    int r = right(i);
    
    if (l < pq->size && pq->heap[l] > pq->heap[largest]) {
        largest = l;
    }
    if (r < pq->size && pq->heap[r] > pq->heap[largest]) {
        largest = r;
    }
    
    if (largest != i) {
        int temp = pq->heap[i];
        pq->heap[i] = pq->heap[largest];
        pq->heap[largest] = temp;
        heapify(pq, largest);
    }
}

int pq_insert(PriorityQueue *pq, int item) {
    if (pq->size == pq->capacity) {
        return 0; // Full
    }
    
    // Start at end
    int i = pq->size++;
    pq->heap[i] = item;
    
    // Fix heap property
    while (i != 0 && pq->heap[parent(i)] < pq->heap[i]) {
        int temp = pq->heap[i];
        pq->heap[i] = pq->heap[parent(i)];
        pq->heap[parent(i)] = temp;
        i = parent(i);
    }
    
    return 1;
}

int pq_extract_max(PriorityQueue *pq, int *item) {
    if (pq->size <= 0) {
        return 0; // Empty
    }
    if (pq->size == 1) {
        *item = pq->heap[0];
        pq->size--;
        return 1;
    }
    
    *item = pq->heap[0];
    pq->heap[0] = pq->heap[--(pq->size)];
    heapify(pq, 0);
    return 1;
}
```

**Time Complexity:**

| **Operation**       | **Time Complexity** | **Notes**                              |
| :------------------ | :------------------ | :------------------------------------- |
| **`insert`**        | **O(log n)**        | **Percolate up**                       |
| **`extract_max`**   | **O(log n)**        | **Heapify down**                       |
| **`peek`**          | **O(1)**            | **Access root element**                |
| **`build_heap`**    | **O(n)**            | **From array of n elements**           |

**Applications:**
*   Dijkstra's shortest path algorithm
*   Huffman coding
*   Event-driven simulations
*   Task scheduling with priorities
*   Merge k sorted lists

## 7.4 Tree Structures

### 7.4.1 Binary Trees

Binary trees form the foundation for many advanced tree structures, with each node having at most two children.

**Structure Definition:**
```c
typedef struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;
```

**Tree Traversal Methods:**
*   **Pre-order:** Node → Left → Right
*   **In-order:** Left → Node → Right
*   **Post-order:** Left → Right → Node
*   **Level-order:** By levels (requires queue)

**Implementation Example (Recursive):**
```c
void preorder_traversal(TreeNode *node) {
    if (!node) return;
    
    printf("%d ", node->data);      // Visit node
    preorder_traversal(node->left);  // Traverse left
    preorder_traversal(node->right); // Traverse right
}

void inorder_traversal(TreeNode *node) {
    if (!node) return;
    
    inorder_traversal(node->left);   // Traverse left
    printf("%d ", node->data);       // Visit node
    inorder_traversal(node->right);  // Traverse right
}
```

**Iterative In-Order Traversal:**
```c
void iterative_inorder(TreeNode *root) {
    if (!root) return;
    
    Stack stack;
    stack_init(&stack, 100);
    
    TreeNode *current = root;
    
    while (current || !stack_is_empty(&stack)) {
        // Reach leftmost node
        while (current) {
            stack_push(&stack, (long)current);
            current = current->left;
        }
        
        // Current is NULL at this point
        current = (TreeNode *)stack_pop(&stack);
        printf("%d ", current->data);
        
        // Visit right subtree
        current = current->right;
    }
    
    stack_destroy(&stack);
}
```

**Time and Space Complexity:**
*   **Time:** O(n) for all traversals (each node visited once)
*   **Space:** O(h) where h is tree height (stack space for recursion/iteration)

### 7.4.2 Binary Search Trees (BSTs)

Binary Search Trees maintain ordering properties that enable efficient searching.

**BST Property:**
For any node:
*   All elements in left subtree ≤ node value
*   All elements in right subtree ≥ node value

**Structure Definition:**
```c
typedef struct BSTNode {
    int key;
    // Additional data can go here
    struct BSTNode *left;
    struct BSTNode *right;
} BSTNode;
```

**Core Operations:**
```c
BSTNode *bst_search(BSTNode *root, int key) {
    if (!root || root->key == key) {
        return root;
    }
    
    if (key < root->key) {
        return bst_search(root->left, key);
    } else {
        return bst_search(root->right, key);
    }
}

BSTNode *bst_insert(BSTNode *root, int key) {
    if (!root) {
        BSTNode *node = malloc(sizeof(BSTNode));
        if (node) {
            node->key = key;
            node->left = node->right = NULL;
        }
        return node;
    }
    
    if (key < root->key) {
        root->left = bst_insert(root->left, key);
    } else if (key > root->key) {
        root->right = bst_insert(root->right, key);
    }
    // Duplicate keys not inserted (could be handled differently)
    
    return root;
}

BSTNode *bst_min(BSTNode *node) {
    while (node && node->left) {
        node = node->left;
    }
    return node;
}

BSTNode *bst_delete(BSTNode *root, int key) {
    if (!root) return NULL;
    
    if (key < root->key) {
        root->left = bst_delete(root->left, key);
    } else if (key > root->key) {
        root->right = bst_delete(root->right, key);
    } else {
        // Node with only one child or no child
        if (!root->left) {
            BSTNode *temp = root->right;
            free(root);
            return temp;
        } else if (!root->right) {
            BSTNode *temp = root->left;
            free(root);
            return temp;
        }
        
        // Node with two children
        BSTNode *temp = bst_min(root->right);
        root->key = temp->key;
        root->right = bst_delete(root->right, temp->key);
    }
    return root;
}
```

**Time Complexity (Balanced Tree):**
*   **Search:** O(log n)
*   **Insertion:** O(log n)
*   **Deletion:** O(log n)

**Time Complexity (Degenerate Tree - Linked List):**
*   **All operations:** O(n)

**Practical Considerations:**
*   BST performance depends on tree balance
*   Randomized insertion helps avoid worst-case scenarios
*   Without balancing, sorted input creates degenerate trees
*   Ideal for in-memory data where balancing overhead is acceptable

### 7.4.3 Self-Balancing Trees: AVL Trees

AVL trees maintain balance through rotations, guaranteeing O(log n) operations.

**Balance Factor:**
For any node: `height(left) - height(right)`
Must be -1, 0, or 1 for AVL property

**Rotation Types:**
*   **Left Rotation:** For right-heavy trees
*   **Right Rotation:** For left-heavy trees
*   **Left-Right Rotation:** For left-heavy with right child
*   **Right-Left Rotation:** For right-heavy with left child

**Implementation Example:**
```c
typedef struct AVLNode {
    int key;
    int height;
    struct AVLNode *left;
    struct AVLNode *right;
} AVLNode;

int height(AVLNode *node) {
    return node ? node->height : 0;
}

int get_balance(AVLNode *node) {
    return node ? height(node->left) - height(node->right) : 0;
}

AVLNode *right_rotate(AVLNode *y) {
    AVLNode *x = y->left;
    AVLNode *T2 = x->right;
    
    // Perform rotation
    x->right = y;
    y->left = T2;
    
    // Update heights
    y->height = 1 + max(height(y->left), height(y->right));
    x->height = 1 + max(height(x->left), height(x->right));
    
    return x;
}

AVLNode *left_rotate(AVLNode *x) {
    AVLNode *y = x->right;
    AVLNode *T2 = y->left;
    
    // Perform rotation
    y->left = x;
    x->right = T2;
    
    // Update heights
    x->height = 1 + max(height(x->left), height(x->right));
    y->height = 1 + max(height(y->left), height(y->right));
    
    return y;
}

AVLNode *avl_insert(AVLNode *node, int key) {
    // Standard BST insertion
    if (!node) {
        AVLNode *new_node = malloc(sizeof(AVLNode));
        if (new_node) {
            new_node->key = key;
            new_node->height = 1;
            new_node->left = new_node->right = NULL;
        }
        return new_node;
    }
    
    if (key < node->key) {
        node->left = avl_insert(node->left, key);
    } else if (key > node->key) {
        node->right = avl_insert(node->right, key);
    } else {
        return node; // Duplicate keys not inserted
    }
    
    // Update height
    node->height = 1 + max(height(node->left), height(node->right));
    
    // Get balance factor
    int balance = get_balance(node);
    
    // Left Left Case
    if (balance > 1 && key < node->left->key) {
        return right_rotate(node);
    }
    
    // Right Right Case
    if (balance < -1 && key > node->right->key) {
        return left_rotate(node);
    }
    
    // Left Right Case
    if (balance > 1 && key > node->left->key) {
        node->left = left_rotate(node->left);
        return right_rotate(node);
    }
    
    // Right Left Case
    if (balance < -1 && key < node->right->key) {
        node->right = right_rotate(node->right);
        return left_rotate(node);
    }
    
    return node;
}
```

**Time Complexity:**
*   **All operations:** O(log n) guaranteed
*   **Rotation overhead:** Constant time per operation

**Comparison with Other Balanced Trees:**

| **Tree Type** | **Balance Mechanism** | **Rotation Complexity** | **Use Cases**                          |
| :------------ | :-------------------- | :---------------------- | :------------------------------------- |
| **AVL**       | **Strict height balance** | **Frequent rotations**  | **Read-heavy workloads**               |
| **Red-Black** | **Color-based**         | **Fewer rotations**     | **General-purpose**                    |
| **Splay**     | **Move-to-root**        | **Amortized O(log n)**  | **Locality of reference**              |
| **B-Tree**    | **Multi-way nodes**     | **Page-oriented**       | **Disk-based storage**                 |

### 7.4.4 B-Trees

B-Trees are optimized for systems where reading blocks of data is expensive (like disk storage).

**Key Properties:**
*   Each node contains multiple keys (between t-1 and 2t-1 for order t)
*   All leaves at same level
*   Nodes have between t and 2t children
*   Designed for systems with large data blocks

**Structure Definition:**
```c
#define MIN_KEYS 2 // Minimum degree - 1

typedef struct BTreeNode {
    int n;             // Current number of keys
    int keys[2*MIN_KEYS]; // Keys
    struct BTreeNode *children[2*MIN_KEYS + 1]; // Children pointers
    int is_leaf;       // Is this a leaf node?
} BTreeNode;
```

**Search Operation:**
```c
BTreeNode *btree_search(BTreeNode *x, int k) {
    int i = 0;
    
    // Find the first key >= k
    while (i < x->n && k > x->keys[i]) {
        i++;
    }
    
    // Found the key
    if (i < x->n && k == x->keys[i]) {
        return x;
    }
    
    // Reached leaf without finding key
    if (x->is_leaf) {
        return NULL;
    }
    
    // Search appropriate child
    return btree_search(x->children[i], k);
}
```

**Insertion Process:**
1.  Start at root
2.  Traverse to appropriate leaf
3.  If leaf has space, insert key
4.  If leaf is full, split and propagate upward

**Split Child Operation:**
```c
void btree_split_child(BTreeNode *x, int i, BTreeNode *y) {
    // Create new node to hold half of y's keys
    BTreeNode *z = malloc(sizeof(BTreeNode));
    if (!z) return;
    
    z->is_leaf = y->is_leaf;
    z->n = MIN_KEYS;
    
    // Copy keys from y to z
    for (int j = 0; j < MIN_KEYS; j++) {
        z->keys[j] = y->keys[j + MIN_KEYS + 1];
    }
    
    // If not a leaf, copy children too
    if (!y->is_leaf) {
        for (int j = 0; j <= MIN_KEYS; j++) {
            z->children[j] = y->children[j + MIN_KEYS + 1];
        }
    }
    
    // Update y's key count
    y->n = MIN_KEYS;
    
    // Make space for new child in x
    for (int j = x->n; j >= i + 1; j--) {
        x->children[j + 1] = x->children[j];
    }
    
    // Link new child
    x->children[i + 1] = z;
    
    // Move keys in x to make space
    for (int j = x->n - 1; j >= i; j--) {
        x->keys[j + 1] = x->keys[j];
    }
    
    // Move key from y to x
    x->keys[i] = y->keys[MIN_KEYS];
    
    // Update key count in x
    x->n++;
}
```

**Time Complexity:**
*   **Search, Insert, Delete:** O(log_t n) where t is the minimum degree
*   **Disk Accesses:** O(log_t n) - optimized for block-based storage

**Practical Applications:**
*   Database indexing systems
*   File system directories
*   Large-scale data storage systems
*   Any scenario with expensive data access operations

## 7.5 Hash Tables

### 7.5.1 Hash Table Fundamentals

Hash tables provide average-case O(1) operations by mapping keys to array indices using a hash function.

**Core Components:**
*   **Hash Function:** Converts keys to array indices
*   **Array of Buckets:** Storage for elements
*   **Collision Resolution:** Strategy for handling hash collisions

**Structure Definition:**
```c
typedef struct HashEntry {
    int key;
    int value;
    struct HashEntry *next; // For chaining
} HashEntry;

typedef struct {
    HashEntry **buckets;
    int capacity;
    int size;
} HashTable;
```

### 7.5.2 Hash Functions

A good hash function:
*   Is deterministic (same key → same hash)
*   Distributes keys uniformly across buckets
*   Is computationally efficient
*   Minimizes collisions

**Common Hash Functions:**

| **Function**                | **Description**                              | **Use Cases**                |
| :-------------------------- | :------------------------------------------- | :--------------------------- |
| **Division Method**         | **`h(k) = k mod m`**                         | **Simple integer keys**      |
| **Multiplication Method**   | **`h(k) = floor(m * (k*A mod 1))`**          | **More uniform distribution** |
| **Universal Hashing**       | **Randomized family of hash functions**      | **Cryptographic security**   |
| **Cryptographic Hashes**    | **MD5, SHA-1, SHA-256**                      | **Security-critical apps**   |

**Implementation Example:**
```c
// Simple hash function for integer keys
unsigned int hash_int(const void *key, int capacity) {
    int k = *(const int *)key;
    return (unsigned int)k % capacity;
}

// Better hash function using multiplication method
unsigned int hash_int_better(const void *key, int capacity) {
    int k = *(const int *)key;
    const float A = 0.6180339887f; // Golden ratio
    float frac = k * A - (int)(k * A);
    return (unsigned int)(capacity * frac);
}
```

### 7.5.3 Collision Resolution

#### Separate Chaining

Each bucket contains a linked list of elements with the same hash.

**Implementation:**
```c
int hash_table_init(HashTable *table, int capacity) {
    table->buckets = calloc(capacity, sizeof(HashEntry *));
    if (!table->buckets) return 0;
    
    table->capacity = capacity;
    table->size = 0;
    return 1;
}

int hash_table_put(HashTable *table, int key, int value) {
    unsigned int index = hash_int(&key, table->capacity);
    
    // Check if key already exists
    HashEntry *entry = table->buckets[index];
    while (entry) {
        if (entry->key == key) {
            entry->value = value;
            return 1;
        }
        entry = entry->next;
    }
    
    // Create new entry
    HashEntry *new_entry = malloc(sizeof(HashEntry));
    if (!new_entry) return 0;
    
    new_entry->key = key;
    new_entry->value = value;
    new_entry->next = table->buckets[index];
    table->buckets[index] = new_entry;
    
    table->size++;
    return 1;
}

int hash_table_get(const HashTable *table, int key, int *value) {
    unsigned int index = hash_int(&key, table->capacity);
    
    HashEntry *entry = table->buckets[index];
    while (entry) {
        if (entry->key == key) {
            *value = entry->value;
            return 1;
        }
        entry = entry->next;
    }
    
    return 0; // Key not found
}
```

#### Open Addressing

All elements stored directly in the hash table array, with collisions resolved by probing.

**Probing Methods:**
*   **Linear Probing:** `h(k, i) = (h'(k) + i) mod m`
*   **Quadratic Probing:** `h(k, i) = (h'(k) + c1*i + c2*i²) mod m`
*   **Double Hashing:** `h(k, i) = (h1(k) + i*h2(k)) mod m`

**Implementation (Linear Probing):**
```c
typedef enum {
    EMPTY,
    OCCUPIED,
    DELETED
} EntryState;

typedef struct {
    int key;
    int value;
    EntryState state;
} HashEntry;

typedef struct {
    HashEntry *entries;
    int capacity;
    int size;
} HashTable;

int hash_table_put(HashTable *table, int key, int value) {
    int index = hash_int(&key, table->capacity);
    int i = 0;
    
    while (i < table->capacity) {
        int probe_index = (index + i) % table->capacity;
        
        if (table->entries[probe_index].state == EMPTY ||
            table->entries[probe_index].state == DELETED) {
            // Found empty slot
            table->entries[probe_index].key = key;
            table->entries[probe_index].value = value;
            table->entries[probe_index].state = OCCUPIED;
            table->size++;
            return 1;
        } else if (table->entries[probe_index].key == key) {
            // Update existing key
            table->entries[probe_index].value = value;
            return 1;
        }
        
        i++;
    }
    
    return 0; // Table is full
}
```

**Collision Resolution Comparison:**

| **Method**           | **Memory Usage** | **Cache Performance** | **Deletion Complexity** | **Best Load Factor** |
| :------------------- | :--------------- | :-------------------- | :---------------------- | :------------------- |
| **Separate Chaining** | **Higher**       | **Poorer**            | **Simple**              | **~0.7-1.0**         |
| **Linear Probing**    | **Lower**        | **Better**            | **Complex (tombstones)** | **~0.5-0.7**         |
| **Quadratic Probing** | **Lower**        | **Better**            | **Complex**             | **~0.5-0.7**         |
| **Double Hashing**    | **Lower**        | **Better**            | **Complex**             | **~0.5-0.7**         |

### 7.5.4 Dynamic Resizing

To maintain performance, hash tables must resize when load factor exceeds threshold.

**Load Factor:**
`α = n / m` where n = number of elements, m = table capacity

**Resizing Process:**
1.  Create new table with larger capacity (typically 2x)
2.  Rehash all elements into new table
3.  Replace old table with new table

**Implementation:**
```c
#define MAX_LOAD_FACTOR 0.75

int hash_table_resize(HashTable *table, int new_capacity) {
    HashEntry **new_buckets = calloc(new_capacity, sizeof(HashEntry *));
    if (!new_buckets) return 0;
    
    // Rehash all entries
    for (int i = 0; i < table->capacity; i++) {
        HashEntry *entry = table->buckets[i];
        while (entry) {
            HashEntry *next = entry->next;
            
            // Compute new index
            unsigned int index = hash_int(&entry->key, new_capacity);
            
            // Insert into new table
            entry->next = new_buckets[index];
            new_buckets[index] = entry;
            
            entry = next;
        }
    }
    
    // Replace buckets
    free(table->buckets);
    table->buckets = new_buckets;
    table->capacity = new_capacity;
    
    return 1;
}

int hash_table_put(HashTable *table, int key, int value) {
    // Check if resize needed
    if ((float)table->size / table->capacity >= MAX_LOAD_FACTOR) {
        if (!hash_table_resize(table, table->capacity * 2)) {
            return 0; // Resize failed
        }
    }
    
    // Continue with normal insertion...
    // [rest of implementation as before]
}
```

**Resizing Strategy Considerations:**
*   **Growth Factor:** 2x is common, but 1.5x can reduce memory fragmentation
*   **Shrinking:** May be needed when elements are removed (e.g., halve when α < 0.25)
*   **Concurrency:** Resizing complicates thread-safe implementations
*   **Performance Impact:** Resizing is O(n), but amortized cost remains O(1)

## 7.6 Graph Structures

### 7.6.1 Graph Representation

Graphs model relationships between entities and come in two primary representations:

#### Adjacency Matrix

A 2D array where `matrix[i][j]` indicates an edge between vertices i and j.

**Structure Definition:**
```c
typedef struct {
    int **matrix;
    int num_vertices;
    int is_directed;
} AdjacencyMatrix;
```

**Implementation:**
```c
int graph_init(AdjacencyMatrix *graph, int num_vertices, int is_directed) {
    graph->num_vertices = num_vertices;
    graph->is_directed = is_directed;
    
    // Allocate matrix
    graph->matrix = malloc(num_vertices * sizeof(int *));
    if (!graph->matrix) return 0;
    
    for (int i = 0; i < num_vertices; i++) {
        graph->matrix[i] = calloc(num_vertices, sizeof(int));
        if (!graph->matrix[i]) {
            // Cleanup on error
            for (int j = 0; j < i; j++) {
                free(graph->matrix[j]);
            }
            free(graph->matrix);
            return 0;
        }
    }
    
    return 1;
}

void graph_add_edge(AdjacencyMatrix *graph, int src, int dest, int weight) {
    if (src < 0 || src >= graph->num_vertices ||
        dest < 0 || dest >= graph->num_vertices) {
        return;
    }
    
    graph->matrix[src][dest] = weight;
    if (!graph->is_directed) {
        graph->matrix[dest][src] = weight;
    }
}
```

#### Adjacency List

An array of linked lists where each list contains neighbors of a vertex.

**Structure Definition:**
```c
typedef struct Edge {
    int dest;
    int weight;
    struct Edge *next;
} Edge;

typedef struct {
    Edge **adj_lists;
    int num_vertices;
    int is_directed;
} AdjacencyList;
```

**Implementation:**
```c
int graph_init(AdjacencyList *graph, int num_vertices, int is_directed) {
    graph->num_vertices = num_vertices;
    graph->is_directed = is_directed;
    
    graph->adj_lists = calloc(num_vertices, sizeof(Edge *));
    return graph->adj_lists != NULL;
}

void graph_add_edge(AdjacencyList *graph, int src, int dest, int weight) {
    if (src < 0 || src >= graph->num_vertices ||
        dest < 0 || dest >= graph->num_vertices) {
        return;
    }
    
    // Add edge from src to dest
    Edge *new_edge = malloc(sizeof(Edge));
    if (!new_edge) return;
    
    new_edge->dest = dest;
    new_edge->weight = weight;
    new_edge->next = graph->adj_lists[src];
    graph->adj_lists[src] = new_edge;
    
    // For undirected graphs, add reverse edge
    if (!graph->is_directed) {
        new_edge = malloc(sizeof(Edge));
        if (!new_edge) return;
        
        new_edge->dest = src;
        new_edge->weight = weight;
        new_edge->next = graph->adj_lists[dest];
        graph->adj_lists[dest] = new_edge;
    }
}
```

**Representation Comparison:**

| **Property**          | **Adjacency Matrix** | **Adjacency List** | **Notes**                              |
| :-------------------- | :------------------- | :----------------- | :------------------------------------- |
| **Space Complexity**  | **O(V²)**            | **O(V + E)**       | **Matrix wastes space for sparse graphs** |
| **Add Edge**          | **O(1)**             | **O(1)**           | **Both constant time**                 |
| **Remove Edge**       | **O(1)**             | **O(degree)**      | **List requires traversal**            |
| **Check Edge**        | **O(1)**             | **O(degree)**      | **Matrix direct access**               |
| **Iterate Neighbors** | **O(V)**             | **O(degree)**      | **List more efficient for sparse graphs** |
| **Best For**          | **Dense graphs**     | **Sparse graphs**  | **Depends on graph characteristics**   |

### 7.6.2 Graph Traversal Algorithms

#### Breadth-First Search (BFS)

BFS explores nodes level by level using a queue.

**Implementation:**
```c
#include <stdbool.h>

void bfs(AdjacencyList *graph, int start_vertex) {
    bool *visited = calloc(graph->num_vertices, sizeof(bool));
    if (!visited) return;
    
    Queue queue;
    queue_init(&queue, graph->num_vertices);
    
    visited[start_vertex] = true;
    queue_enqueue(&queue, start_vertex);
    
    while (!queue_is_empty(&queue)) {
        int current_vertex;
        queue_dequeue(&queue, &current_vertex);
        printf("Visited %d\n", current_vertex);
        
        // Get all adjacent vertices
        Edge *edge = graph->adj_lists[current_vertex];
        while (edge) {
            if (!visited[edge->dest]) {
                visited[edge->dest] = true;
                queue_enqueue(&queue, edge->dest);
            }
            edge = edge->next;
        }
    }
    
    free(visited);
    queue_destroy(&queue);
}
```

#### Depth-First Search (DFS)

DFS explores as far as possible along each branch before backtracking.

**Recursive Implementation:**
```c
void dfs_recursive(AdjacencyList *graph, bool *visited, int vertex) {
    visited[vertex] = true;
    printf("Visited %d\n", vertex);
    
    Edge *edge = graph->adj_lists[vertex];
    while (edge) {
        if (!visited[edge->dest]) {
            dfs_recursive(graph, visited, edge->dest);
        }
        edge = edge->next;
    }
}

void dfs(AdjacencyList *graph, int start_vertex) {
    bool *visited = calloc(graph->num_vertices, sizeof(bool));
    if (!visited) return;
    
    dfs_recursive(graph, visited, start_vertex);
    free(visited);
}
```

**Iterative Implementation:**
```c
void dfs_iterative(AdjacencyList *graph, int start_vertex) {
    bool *visited = calloc(graph->num_vertices, sizeof(bool));
    if (!visited) return;
    
    Stack stack;
    stack_init(&stack, graph->num_vertices);
    
    stack_push(&stack, start_vertex);
    
    while (!stack_is_empty(&stack)) {
        int current_vertex = stack_pop(&stack);
        
        if (!visited[current_vertex]) {
            visited[current_vertex] = true;
            printf("Visited %d\n", current_vertex);
            
            // Push all unvisited neighbors
            Edge *edge = graph->adj_lists[current_vertex];
            while (edge) {
                if (!visited[edge->dest]) {
                    stack_push(&stack, edge->dest);
                }
                edge = edge->next;
            }
        }
    }
    
    free(visited);
    stack_destroy(&stack);
}
```

**Traversal Comparison:**

| **Property**          | **BFS**                      | **DFS**                      |
| :-------------------- | :--------------------------- | :--------------------------- |
| **Data Structure**    | **Queue**                    | **Stack (or recursion)**     |
| **Exploration Order** | **Level by level**           | **Depth first**              |
| **Shortest Path**     | **Finds shortest path**      | **Does not guarantee shortest** |
| **Memory Usage**      | **O(V) for queue**           | **O(V) for stack/recursion** |
| **Use Cases**         | **Shortest path, connectivity** | **Cycle detection, topological sort** |

### 7.6.3 Minimum Spanning Tree (MST)

MST connects all vertices with minimum total edge weight.

#### Prim's Algorithm

Grows MST from a single vertex, adding minimum-weight edges.

**Implementation:**
```c
#include <limits.h>

typedef struct {
    int vertex;
    int key;
} MinHeapNode;

typedef struct {
    int size;
    int capacity;
    int *pos;
    MinHeapNode **array;
} MinHeap;

// Min-heap helper functions
MinHeap *create_min_heap(int capacity);
void min_heapify(MinHeap *min_heap, int idx);
int is_empty(MinHeap *min_heap);
MinHeapNode *extract_min(MinHeap *min_heap);
void decrease_key(MinHeap *min_heap, int v, int new_key);
int is_in_min_heap(MinHeap *min_heap, int v);

// Prim's algorithm
void prim_mst(AdjacencyList *graph, int start_vertex) {
    int num_vertices = graph->num_vertices;
    int parent[num_vertices]; // MST parent array
    int key[num_vertices];    // Key values for min-key selection
    
    // Create min heap
    MinHeap *min_heap = create_min_heap(num_vertices);
    if (!min_heap) return;
    
    // Initialize min heap with all vertices
    for (int v = 0; v < num_vertices; v++) {
        parent[v] = -1;
        key[v] = INT_MAX;
        min_heap->array[v] = new_min_heap_node(v, key[v]);
        min_heap->pos[v] = v;
    }
    
    // Decrease key of start_vertex to 0
    key[start_vertex] = 0;
    decrease_key(min_heap, start_vertex, key[start_vertex]);
    
    // MST has V-1 edges
    for (int count = 0; count < num_vertices - 1; count++) {
        // Extract vertex with minimum key
        MinHeapNode *min_heap_node = extract_min(min_heap);
        int u = min_heap_node->vertex;
        
        // Update key values of adjacent vertices
        Edge *edge = graph->adj_lists[u];
        while (edge) {
            int v = edge->dest;
            
            // If v is not in MST and weight(u,v) < key[v]
            if (is_in_min_heap(min_heap, v) && edge->weight < key[v]) {
                key[v] = edge->weight;
                parent[v] = u;
                decrease_key(min_heap, v, key[v]);
            }
            
            edge = edge->next;
        }
    }
    
    // Print MST
    printf("Edge \tWeight\n");
    for (int i = 1; i < num_vertices; i++) {
        printf("%d - %d \t%d\n", parent[i], i, key[i]);
    }
    
    free_min_heap(min_heap);
}
```

#### Kruskal's Algorithm

Sorts all edges and adds them if they don't form a cycle.

**Implementation:**
```c
// Union-Find data structure for cycle detection
typedef struct {
    int parent;
    int rank;
} Subset;

int find(Subset subsets[], int i) {
    if (subsets[i].parent != i) {
        subsets[i].parent = find(subsets, subsets[i].parent);
    }
    return subsets[i].parent;
}

void union_sets(Subset subsets[], int x, int y) {
    int xroot = find(subsets, x);
    int yroot = find(subsets, y);
    
    if (subsets[xroot].rank < subsets[yroot].rank) {
        subsets[xroot].parent = yroot;
    } else if (subsets[xroot].rank > subsets[yroot].rank) {
        subsets[yroot].parent = xroot;
    } else {
        subsets[yroot].parent = xroot;
        subsets[xroot].rank++;
    }
}

// Edge structure for sorting
typedef struct {
    int src, dest, weight;
} Edge;

// Comparison function for qsort
int compare_edges(const void *a, const void *b) {
    Edge *a_edge = (Edge *)a;
    Edge *b_edge = (Edge *)b;
    return a_edge->weight - b_edge->weight;
}

void kruskal_mst(AdjacencyList *graph) {
    int num_vertices = graph->num_vertices;
    int num_edges = 0;
    
    // Count edges (for undirected graph)
    for (int i = 0; i < num_vertices; i++) {
        Edge *edge = graph->adj_lists[i];
        while (edge) {
            num_edges++;
            edge = edge->next;
        }
    }
    
    // Create array of edges
    Edge *edges = malloc(num_edges * sizeof(Edge));
    if (!edges) return;
    
    // Fill edge array
    int e = 0;
    for (int i = 0; i < num_vertices; i++) {
        Edge *edge = graph->adj_lists[i];
        while (edge) {
            edges[e].src = i;
            edges[e].dest = edge->dest;
            edges[e].weight = edge->weight;
            e++;
            edge = edge->next;
        }
    }
    
    // Sort edges by weight
    qsort(edges, num_edges, sizeof(Edge), compare_edges);
    
    // Create MST result array
    Edge *mst = malloc((num_vertices - 1) * sizeof(Edge));
    if (!mst) {
        free(edges);
        return;
    }
    
    // Initialize Union-Find subsets
    Subset *subsets = malloc(num_vertices * sizeof(Subset));
    if (!subsets) {
        free(edges);
        free(mst);
        return;
    }
    
    for (int i = 0; i < num_vertices; i++) {
        subsets[i].parent = i;
        subsets[i].rank = 0;
    }
    
    // Build MST
    int mst_e = 0;
    for (int i = 0; i < num_edges && mst_e < num_vertices - 1; i++) {
        int src = edges[i].src;
        int dest = edges[i].dest;
        
        int x = find(subsets, src);
        int y = find(subsets, dest);
        
        // If including this edge doesn't cause cycle
        if (x != y) {
            mst[mst_e++] = edges[i];
            union_sets(subsets, x, y);
        }
    }
    
    // Print MST
    printf("Edge \tWeight\n");
    for (int i = 0; i < num_vertices - 1; i++) {
        printf("%d - %d \t%d\n", mst[i].src, mst[i].dest, mst[i].weight);
    }
    
    free(edges);
    free(mst);
    free(subsets);
}
```

**MST Algorithm Comparison:**

| **Algorithm** | **Time Complexity** | **Best For**                          | **Implementation Complexity** |
| :------------ | :------------------ | :------------------------------------ | :---------------------------- |
| **Prim's**    | **O(E log V)**      | **Dense graphs**                      | **Moderate**                  |
| **Kruskal's** | **O(E log E)**      | **Sparse graphs, disjoint sets**      | **Higher (needs Union-Find)** |

## 7.7 Tries (Prefix Trees)

### 7.7.1 Trie Fundamentals

Tries (prefix trees) are specialized tree structures for efficient string storage and retrieval.

**Key Properties:**
*   Each node represents a single character
*   Edges represent possible next characters
*   Paths from root represent strings
*   Efficient for prefix-based operations

**Structure Definition:**
```c
#define ALPHABET_SIZE 26  // For lowercase English letters

typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    int is_end_of_word;
} TrieNode;

typedef struct {
    TrieNode *root;
} Trie;
```

**Implementation:**
```c
TrieNode *create_trie_node() {
    TrieNode *node = malloc(sizeof(TrieNode));
    if (node) {
        node->is_end_of_word = 0;
        for (int i = 0; i < ALPHABET_SIZE; i++) {
            node->children[i] = NULL;
        }
    }
    return node;
}

int trie_init(Trie *trie) {
    trie->root = create_trie_node();
    return trie->root != NULL;
}

// Convert char to index (assuming 'a'-'z')
int char_to_index(char c) {
    return c - 'a';
}

int trie_insert(Trie *trie, const char *key) {
    TrieNode *current = trie->root;
    
    for (int i = 0; key[i]; i++) {
        int index = char_to_index(key[i]);
        
        if (!current->children[index]) {
            current->children[index] = create_trie_node();
            if (!current->children[index]) {
                return 0; // Allocation failed
            }
        }
        
        current = current->children[index];
    }
    
    current->is_end_of_word = 1;
    return 1;
}

int trie_search(const Trie *trie, const char *key) {
    TrieNode *current = trie->root;
    
    for (int i = 0; key[i]; i++) {
        int index = char_to_index(key[i]);
        
        if (!current->children[index]) {
            return 0; // Not found
        }
        
        current = current->children[index];
    }
    
    return (current != NULL && current->is_end_of_word);
}
```

### 7.7.2 Advanced Trie Operations

#### Prefix Search

Check if any string in the trie starts with a given prefix.

```c
int trie_starts_with(const Trie *trie, const char *prefix) {
    TrieNode *current = trie->root;
    
    for (int i = 0; prefix[i]; i++) {
        int index = char_to_index(prefix[i]);
        
        if (!current->children[index]) {
            return 0; // Prefix not found
        }
        
        current = current->children[index];
    }
    
    return 1; // Prefix exists
}
```

#### Autocomplete/Suggestions

Generate all words that start with a given prefix.

```c
void trie_suggestions_recursive(TrieNode *node, char *prefix, int depth, 
                               void (*callback)(const char *)) {
    if (node->is_end_of_word) {
        prefix[depth] = '\0';
        callback(prefix);
    }
    
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        if (node->children[i]) {
            prefix[depth] = i + 'a';
            trie_suggestions_recursive(node->children[i], 
                                      prefix, depth + 1, callback);
        }
    }
}

void trie_suggestions(const Trie *trie, const char *prefix, 
                     void (*callback)(const char *)) {
    TrieNode *current = trie->root;
    
    // Navigate to the end of the prefix
    for (int i = 0; prefix[i]; i++) {
        int index = char_to_index(prefix[i]);
        
        if (!current->children[index]) {
            return; // Prefix not found
        }
        
        current = current->children[index];
    }
    
    // Add null terminator for the prefix
    char buffer[100];
    strcpy(buffer, prefix);
    int prefix_len = strlen(prefix);
    
    // Generate suggestions
    trie_suggestions_recursive(current, buffer, prefix_len, callback);
}
```

#### Memory-Efficient Tries (Patricia Tries)

Patricia (Practical Algorithm To Retrieve Information Coded in Alphanumeric) tries compress paths with single-child nodes.

**Benefits:**
*   Reduced memory usage
*   Fewer node traversals
*   Better cache performance

**Implementation Strategy:**
*   Store string fragments in edges rather than single characters
*   Compress paths where possible
*   More complex insertion and search algorithms

### 7.7.3 Trie Applications

Tries excel in scenarios involving string manipulation and prefix operations:

**Autocomplete Systems:**
*   Search engine suggestions
*   IDE code completion
*   Mobile keyboard predictions

**Spell Checking:**
*   Fast dictionary lookups
*   Prefix-based word suggestions
*   Efficient storage of large word lists

**IP Routing:**
*   Longest prefix match for IP addresses
*   Efficient routing table lookups
*   Hierarchical address space representation

**String Sorting:**
*   Lexicographical sorting through depth-first traversal
*   No explicit comparison operations needed
*   Efficient for strings with common prefixes

**Pattern Matching:**
*   Aho-Corasick algorithm for multiple pattern matching
*   Suffix trees for advanced string analysis
*   Text compression algorithms

> **"Tries transform the abstract concept of string relationships into a concrete spatial structure, where proximity in the tree directly corresponds to similarity in the strings. This elegant mapping between linguistic and spatial relationships makes them indispensable for any application dealing with textual data at scale."**

## 7.8 Implementation Considerations

### 7.8.1 Memory Management Patterns

Effective memory management is crucial for advanced data structures.

#### Arena Allocation

Allocate all nodes from a single memory pool for better locality.

```c
typedef struct {
    Node *memory;
    int capacity;
    int used;
} Arena;

int arena_init(Arena *arena, int capacity) {
    arena->memory = malloc(capacity * sizeof(Node));
    if (!arena->memory) return 0;
    arena->capacity = capacity;
    arena->used = 0;
    return 1;
}

Node *arena_alloc(Arena *arena) {
    if (arena->used >= arena->capacity) {
        return NULL;
    }
    return &arena->memory[arena->used++];
}

void arena_reset(Arena *arena) {
    arena->used = 0;
}
```

**Benefits:**
*   Reduced fragmentation
*   Better cache performance
*   Single deallocation (free the arena)
*   Faster allocation (pointer bump)

#### Object Pooling

Pre-allocate objects for reuse, avoiding frequent allocations.

```c
typedef struct NodePool {
    Node *free_list;
    int object_count;
} NodePool;

int node_pool_init(NodePool *pool, int initial_size) {
    pool->free_list = NULL;
    pool->object_count = 0;
    
    for (int i = 0; i < initial_size; i++) {
        Node *node = malloc(sizeof(Node));
        if (!node) {
            node_pool_destroy(pool);
            return 0;
        }
        node->next = pool->free_list;
        pool->free_list = node;
        pool->object_count++;
    }
    
    return 1;
}

Node *node_pool_alloc(NodePool *pool) {
    if (!pool->free_list) {
        // Optional: grow the pool
        return malloc(sizeof(Node));
    }
    
    Node *node = pool->free_list;
    pool->free_list = pool->free_list->next;
    return node;
}

void node_pool_free(NodePool *pool, Node *node) {
    node->next = pool->free_list;
    pool->free_list = node;
}
```

**Benefits:**
*   Reduced allocation overhead
*   Predictable performance
*   Protection against fragmentation
*   Can implement custom allocation strategies

### 7.8.2 Performance Analysis

Understanding time and space complexity is essential for selecting appropriate data structures.

#### Big O Notation Refresher

| **Notation** | **Name**           | **Growth Rate**                     | **Example Operations**               |
| :----------- | :----------------- | :---------------------------------- | :----------------------------------- |
| **O(1)**     | **Constant**       | **Fixed time regardless of input**  | **Array access, hash table lookup**  |
| **O(log n)** | **Logarithmic**    | **Grows slowly with input size**    | **Binary search, balanced trees**    |
| **O(n)**     | **Linear**         | **Grows proportionally to input**   | **List traversal, linear search**    |
| **O(n log n)** | **Linearithmic** | **Efficient sorting algorithms**    | **Merge sort, heap sort**            |
| **O(n²)**    | **Quadratic**      | **Grows with square of input**      | **Bubble sort, nested loops**        |
| **O(2ⁿ)**    | **Exponential**    | **Rapid growth for small inputs**   | **Brute-force solutions**            |

#### Amortized Analysis

Some operations have high worst-case costs but low average costs.

**Example: Dynamic Array Resizing**
*   **Worst-case:** O(n) for single insertion (when resizing)
*   **Amortized:** O(1) per insertion (resizing happens infrequently)

**Accounting Method:**
1.  Charge $2 for each insertion
2.  $1 pays for the insertion
3.  $1 is saved for future resizing
4.  When resizing, use saved funds to pay for copying elements

#### Space-Time Tradeoffs

Often, improving time complexity requires additional space.

| **Data Structure** | **Time Improvement** | **Space Cost** | **Use Case**                         |
| :----------------- | :------------------- | :------------- | :----------------------------------- |
| **Hash Table**     | **O(1) lookup**      | **O(n) extra** | **Fast dictionary operations**       |
| **Suffix Array**   | **O(m) pattern search** | **O(n) extra** | **Text indexing**                    |
| **Fenwick Tree**   | **O(log n) queries** | **O(n) extra** | **Efficient prefix sums**            |
| **Bloom Filter**   | **O(1) membership**  | **O(n) extra** | **Probabilistic set membership**     |

### 7.8.3 Choosing the Right Data Structure

Selecting the appropriate data structure requires considering multiple factors:

#### Problem Characteristics

*   **Data Size:** Small vs. large datasets have different optimization needs
*   **Access Patterns:** Frequent lookups vs. frequent modifications
*   **Operation Mix:** Which operations are most common?
*   **Memory Constraints:** Embedded systems vs. servers
*   **Concurrency Requirements:** Single-threaded vs. multi-threaded

#### Decision Framework

1.  **Identify primary operations** (search, insert, delete, range queries)
2.  **Determine frequency of each operation**
3.  **Consider data characteristics** (sorted, random, string vs. numeric)
4.  **Evaluate memory constraints**
5.  **Analyze worst-case vs. average-case requirements**
6.  **Consider implementation complexity vs. performance gains**

#### Decision Tree Example

```
Is data sorted?
├── Yes
│   ├── Need frequent insertions/deletions? → Balanced BST (AVL, Red-Black)
│   └── Mostly lookups? → Binary search on array
└── No
    ├── Need fast lookups? 
    │   ├── String keys? → Hash table or Trie
    │   └── Numeric keys? → Hash table
    └── Need range queries? → Balanced BST
```

#### Real-World Considerations

*   **Cache Performance:** Contiguous memory (arrays) often outperforms pointer-based structures
*   **Implementation Quality:** A well-implemented simple structure may outperform a poorly implemented complex one
*   **Existing Libraries:** Consider using well-tested implementations rather than rolling your own
*   **Development Time:** Complex structures require more development and debugging time

## 7.9 Practical Applications

### 7.9.1 In-Memory Database Indexing

Implementing a simple index using a balanced BST.

```c
#include <string.h>

#define MAX_KEY_LENGTH 50
#define MAX_RECORDS 1000

typedef struct {
    char key[MAX_KEY_LENGTH];
    int record_id;
} IndexEntry;

typedef struct BSTNode {
    IndexEntry entry;
    struct BSTNode *left;
    struct BSTNode *right;
} BSTNode;

// BST implementation for string keys
BSTNode *bst_insert(BSTNode *root, const char *key, int record_id) {
    if (!root) {
        BSTNode *node = malloc(sizeof(BSTNode));
        if (node) {
            strncpy(node->entry.key, key, MAX_KEY_LENGTH - 1);
            node->entry.key[MAX_KEY_LENGTH - 1] = '\0';
            node->entry.record_id = record_id;
            node->left = node->right = NULL;
        }
        return node;
    }
    
    int cmp = strcmp(key, root->entry.key);
    if (cmp < 0) {
        root->left = bst_insert(root->left, key, record_id);
    } else if (cmp > 0) {
        root->right = bst_insert(root->right, key, record_id);
    }
    // Duplicate keys not inserted
    
    return root;
}

int *bst_range_query(BSTNode *root, const char *min_key, 
                    const char *max_key, int *count) {
    // Implementation for range queries
    // Would collect all records with keys between min_key and max_key
    // For brevity, simplified version
    *count = 0;
    int *results = NULL;
    
    // In a real implementation, this would traverse the tree
    // and collect matching records
    
    return results;
}

// Database representation
typedef struct {
    BSTNode *index;
    char records[MAX_RECORDS][100]; // Simplified record storage
    int record_count;
} Database;

int db_init(Database *db) {
    db->index = NULL;
    db->record_count = 0;
    return 1;
}

int db_insert(Database *db, const char *key, const char *data) {
    if (db->record_count >= MAX_RECORDS) {
        return 0; // Database full
    }
    
    // Store record
    strncpy(db->records[db->record_count], data, 99);
    db->records[db->record_count][99] = '\0';
    
    // Create index entry
    db->index = bst_insert(db->index, key, db->record_count);
    
    db->record_count++;
    return 1;
}

// Range query example
void db_range_query(Database *db, const char *min_key, 
                   const char *max_key) {
    int count;
    int *results = bst_range_query(db->index, min_key, max_key, &count);
    
    if (count > 0) {
        printf("Found %d records:\n", count);
        for (int i = 0; i < count; i++) {
            printf("  %s\n", db->records[results[i]]);
        }
        free(results);
    } else {
        printf("No records found in range\n");
    }
}
```

**Key Features:**
*   Balanced BST for efficient indexing
*   Range query capability
*   Separation of index and data storage
*   Efficient lookups by key

**Performance Characteristics:**
*   **Insertion:** O(log n) with balanced tree
*   **Point Query:** O(log n)
*   **Range Query:** O(log n + k) where k is number of results
*   **Memory Overhead:** O(n) for index structure

### 7.9.2 File System Path Resolution

Using a trie to efficiently store and resolve file system paths.

```c
#include <string.h>
#include <ctype.h>

#define MAX_PATH_COMPONENTS 32
#define MAX_COMPONENT_LENGTH 256

typedef struct DirNode {
    char name[MAX_COMPONENT_LENGTH];
    struct DirNode *parent;
    struct DirNode *children;
    struct DirNode *next_sibling;
    int is_file;
    // Additional file/directory metadata would go here
} DirNode;

typedef struct {
    DirNode *root;
} FileSystem;

// Helper to split path into components
int split_path(const char *path, char components[MAX_PATH_COMPONENTS][MAX_COMPONENT_LENGTH]) {
    int count = 0;
    char temp[MAX_COMPONENT_LENGTH];
    int temp_len = 0;
    
    // Skip leading slash
    if (path[0] == '/') {
        path++;
    }
    
    for (int i = 0; path[i]; i++) {
        if (path[i] == '/' && temp_len > 0) {
            temp[temp_len] = '\0';
            strncpy(components[count], temp, MAX_COMPONENT_LENGTH - 1);
            components[count][MAX_COMPONENT_LENGTH - 1] = '\0';
            count++;
            temp_len = 0;
        } else {
            if (temp_len < MAX_COMPONENT_LENGTH - 1) {
                temp[temp_len++] = path[i];
            }
        }
    }
    
    // Add last component
    if (temp_len > 0) {
        temp[temp_len] = '\0';
        strncpy(components[count], temp, MAX_COMPONENT_LENGTH - 1);
        components[count][MAX_COMPONENT_LENGTH - 1] = '\0';
        count++;
    }
    
    return count;
}

DirNode *find_child(DirNode *parent, const char *name) {
    DirNode *child = parent->children;
    while (child) {
        if (strcmp(child->name, name) == 0) {
            return child;
        }
        child = child->next_sibling;
    }
    return NULL;
}

int fs_init(FileSystem *fs) {
    fs->root = malloc(sizeof(DirNode));
    if (!fs->root) return 0;
    
    strcpy(fs->root->name, "/");
    fs->root->parent = NULL;
    fs->root->children = NULL;
    fs->root->next_sibling = NULL;
    fs->root->is_file = 0;
    
    return 1;
}

int fs_create_path(FileSystem *fs, const char *path, int is_file) {
    char components[MAX_PATH_COMPONENTS][MAX_COMPONENT_LENGTH];
    int component_count = split_path(path, components);
    
    if (component_count == 0) {
        return 1; // Root already exists
    }
    
    DirNode *current = fs->root;
    
    // Traverse or create directories
    for (int i = 0; i < component_count - (is_file ? 0 : 1); i++) {
        DirNode *child = find_child(current, components[i]);
        if (!child) {
            // Create new directory
            child = malloc(sizeof(DirNode));
            if (!child) return 0;
            
            strncpy(child->name, components[i], MAX_COMPONENT_LENGTH - 1);
            child->name[MAX_COMPONENT_LENGTH - 1] = '\0';
            child->parent = current;
            child->children = NULL;
            child->next_sibling = current->children;
            child->is_file = 0;
            
            current->children = child;
        }
        current = child;
    }
    
    if (is_file) {
        // Create file
        DirNode *file = find_child(current, components[component_count - 1]);
        if (!file) {
            file = malloc(sizeof(DirNode));
            if (!file) return 0;
            
            strncpy(file->name, components[component_count - 1], MAX_COMPONENT_LENGTH - 1);
            file->name[MAX_COMPONENT_LENGTH - 1] = '\0';
            file->parent = current;
            file->children = NULL;
            file->next_sibling = current->children;
            file->is_file = 1;
            
            current->children = file;
        }
    }
    
    return 1;
}

DirNode *fs_resolve_path(FileSystem *fs, const char *path) {
    char components[MAX_PATH_COMPONENTS][MAX_COMPONENT_LENGTH];
    int component_count = split_path(path, components);
    
    DirNode *current = fs->root;
    
    for (int i = 0; i < component_count; i++) {
        current = find_child(current, components[i]);
        if (!current) {
            return NULL; // Path not found
        }
    }
    
    return current;
}
```

**Key Features:**
*   Efficient path resolution using tree structure
*   Natural representation of hierarchical file systems
*   Support for both files and directories
*   Easy traversal and manipulation

**Advantages Over Alternative Approaches:**
*   **Faster path resolution** than linear search through flat list
*   **Natural hierarchy representation** matching file system structure
*   **Efficient relative path resolution** using parent pointers
*   **Easy directory listing** through child traversal

### 7.9.3 Network Packet Routing

Implementing a longest prefix match router using a binary trie.

```c
#include <arpa/inet.h> // For ntohl, htonl

#define IP_BITS 32

typedef struct RouteNode {
    struct RouteNode *left;
    struct RouteNode *right;
    int is_route;
    int prefix_length;
    unsigned int next_hop;
} RouteNode;

typedef struct {
    RouteNode *root;
} Router;

RouteNode *create_route_node() {
    RouteNode *node = malloc(sizeof(RouteNode));
    if (node) {
        node->left = node->right = NULL;
        node->is_route = 0;
        node->prefix_length = 0;
        node->next_hop = 0;
    }
    return node;
}

int router_init(Router *router) {
    router->root = create_route_node();
    return router->root != NULL;
}

void router_add_route(Router *router, const char *network, 
                     int prefix_length, unsigned int next_hop) {
    // Convert network string to integer
    struct in_addr addr;
    if (inet_aton(network, &addr) == 0) {
        return; // Invalid network address
    }
    
    unsigned int ip = ntohl(addr.s_addr);
    
    RouteNode *current = router->root;
    
    // Set the route at the appropriate node
    for (int i = 0; i < prefix_length; i++) {
        int bit = (ip >> (IP_BITS - 1 - i)) & 1;
        
        if (bit == 0) {
            if (!current->left) {
                current->left = create_route_node();
            }
            current = current->left;
        } else {
            if (!current->right) {
                current->right = create_route_node();
            }
            current = current->right;
        }
    }
    
    current->is_route = 1;
    current->prefix_length = prefix_length;
    current->next_hop = next_hop;
}

unsigned int router_lookup(const Router *router, const char *ip_str) {
    struct in_addr addr;
    if (inet_aton(ip_str, &addr) == 0) {
        return 0; // Invalid IP address
    }
    
    unsigned int ip = ntohl(addr.s_addr);
    RouteNode *current = router->root;
    RouteNode *last_route = NULL;
    
    for (int i = 0; i < IP_BITS; i++) {
        if (!current) {
            break;
        }
        
        if (current->is_route) {
            last_route = current;
        }
        
        int bit = (ip >> (IP_BITS - 1 - i)) & 1;
        if (bit == 0) {
            current = current->left;
        } else {
            current = current->right;
        }
    }
    
    // Check if we ended at a route
    if (current && current->is_route) {
        last_route = current;
    }
    
    return last_route ? last_route->next_hop : 0;
}

// Example usage
int main() {
    Router router;
    if (!router_init(&router)) {
        return 1;
    }
    
    // Add routes
    router_add_route(&router, "192.168.1.0", 24, 0x0A000001); // 10.0.0.1
    router_add_route(&router, "10.0.0.0", 8, 0x0A000002);     // 10.0.0.2
    router_add_route(&router, "172.16.0.0", 12, 0x0A000003);  // 10.0.0.3
    
    // Look up some IPs
    printf("192.168.1.100 -> %s\n", 
           inet_ntoa((struct in_addr){htonl(router_lookup(&router, "192.168.1.100"))}));
    printf("10.1.2.3 -> %s\n", 
           inet_ntoa((struct in_addr){htonl(router_lookup(&router, "10.1.2.3"))}));
    printf("172.20.1.1 -> %s\n", 
           inet_ntoa((struct in_addr){htonl(router_lookup(&router, "172.20.1.1"))}));
    
    return 0;
}
```

**Key Features:**
*   Longest prefix match for IP routing
*   Efficient lookup in O(32) operations (fixed time)
*   Binary trie structure matching IP address bit patterns
*   Support for standard CIDR notation

**Performance Characteristics:**
*   **Insertion:** O(prefix_length) = O(32) = O(1)
*   **Lookup:** O(32) = O(1)
*   **Memory Usage:** O(number of routes × 32) in worst case
*   **Optimizations:** Path compression, leaf pushing

**Real-World Considerations:**
*   Modern routers use more sophisticated structures like LC-tries
*   Hardware acceleration (TCAMs) for extremely fast lookups
*   Support for IPv6 requires 128-bit trie (more memory efficient structures needed)
*   Route aggregation to reduce table size

## 7.10 Conclusion and Path Forward

This chapter has provided a comprehensive exploration of advanced data structures in C, building upon the foundational knowledge of pointers, memory management, and structures established in previous chapters. We've examined linked structures, abstract data types, tree-based organizations, hash-based mappings, graph representations, and specialized structures like tries, analyzing their implementation details, performance characteristics, and practical applications.

Key concepts mastered include:
*   Enhanced linked structures (doubly linked, circular, sentinel nodes)
*   Stack and queue implementations with array and linked list approaches
*   Priority queues using binary heaps
*   Binary search trees and self-balancing variants (AVL trees)
*   B-trees for disk-oriented storage systems
*   Hash table design with collision resolution strategies
*   Graph representations and traversal algorithms
*   Trie structures for string-oriented operations
*   Memory management patterns for efficient structure implementation
*   Performance analysis techniques and space-time tradeoffs
*   Practical applications across database indexing, file systems, and networking

The examples demonstrated practical implementations that transform theoretical concepts into working solutions, illustrating how advanced data structures enable efficient solutions to complex computational problems. By understanding both the capabilities and limitations of these structures, you've gained the ability to select and implement appropriate data organizations for specific computational challenges.

As you progress, the concepts in this chapter form the essential foundation for more advanced topics:
*   **Chapter 8 (Memory Management Techniques)** will explore specialized allocators for data structures
*   **Chapter 9 (Multithreading and Concurrency)** will address thread-safe implementations
*   **Chapter 10 (Advanced Algorithms)** will leverage these structures for sophisticated algorithms
*   **Chapter 11 (System Programming)** will apply these concepts to operating system components

> **"Data structures are the silent partners in computation—they work behind the scenes, organizing information so that algorithms can transform it efficiently. Mastering them is not merely about memorizing implementations, but about developing an intuition for how information wants to be organized to solve a given problem."**

The discipline required to implement and use advanced data structures effectively—mindful of performance characteristics, vigilant about memory management, and careful with implementation details—is precisely the discipline that separates competent programmers from true computational engineers. As you continue your journey, remember that the right data structure often transforms an intractable problem into a manageable one, revealing elegant solutions where none seemed possible.

With this foundation firmly established, you're now prepared to explore the deeper aspects of C programming, where the explicit memory management and low-level control that make C powerful combine with sophisticated data organization to create truly robust and efficient systems. The next chapter on memory management techniques will reveal how to optimize these structures for specific performance requirements, pushing the boundaries of what's possible in C.