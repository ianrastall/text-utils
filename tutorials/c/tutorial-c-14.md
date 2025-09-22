# 14. Database Systems in C: Building and Managing Data Stores

## 14.1 Introduction to Database Systems in C

Database systems represent one of the most critical components in modern software applications, providing structured storage, retrieval, and management of data. For beginning C programmers who have mastered fundamentals like variables, control structures, functions, and basic memory management, understanding database systems opens the door to developing applications that persist and manipulate data beyond the lifetime of a single program execution. This chapter builds upon the system programming and network programming concepts covered in previous chapters (particularly Chapters 11-13), extending that knowledge to focus specifically on how C programs can interact with and even implement database systems.

At its core, a database system provides mechanisms for storing, retrieving, and managing structured data efficiently and reliably. While higher-level languages often come with built-in database abstractions, C offers a unique perspective by requiring programmers to understand the underlying mechanisms that make database operations possible. This low-level understanding is invaluable, whether you're using an existing database library or building your own specialized data storage solution.

The importance of database knowledge for C programmers cannot be overstated. From embedded systems that need lightweight data storage to high-performance servers handling millions of transactions per second, database concepts permeate nearly every domain of software development. Understanding how databases work at a fundamental level enables developers to make informed decisions about data storage, query optimization, and system architecture.

> **Critical Insight:** Database systems introduce a fundamentally different paradigm from standalone application development. Where traditional programs operate on transient data in memory, database applications must manage persistent data with considerations for:
> *   Data integrity across program executions
> *   Concurrent access by multiple processes or threads
> *   Efficient retrieval of specific subsets of data
> *   Recovery from system failures
> *   Security and access control
> Understanding and addressing these challenges is essential for building robust data-driven applications.

This chapter adopts a practical approach to database systems, emphasizing concepts and techniques that provide immediate value while establishing a solid foundation for more advanced database topics. We'll explore both using existing database libraries and building simple database systems from scratch, covering everything from basic CRUD operations to transaction management and indexing strategies. The goal is not to turn you into a database expert overnight, but to equip you with the knowledge to create functional, reliable data storage solutions in C and understand the underlying mechanisms that make database operations efficient and reliable.

## 14.2 Database Fundamentals

Before diving into specific database implementations in C, it's essential to establish a foundation in basic database concepts. Understanding these fundamentals will make the database APIs and design patterns much more intuitive and help you make informed decisions about which database approach is appropriate for your application.

### 14.2.1 Data Models

A data model defines how data is structured, manipulated, and constrained. Different data models are optimized for different types of data and access patterns.

**1. Relational Model:**
The relational model organizes data into tables (relations) consisting of rows (tuples) and columns (attributes). Each table has a schema that defines the columns and their data types. Relationships between tables are established through foreign keys.

*Key Features:*
*   Data organized in tables with rows and columns
*   Strict schema defining columns and data types
*   SQL (Structured Query Language) for data manipulation
*   ACID transactions (Atomicity, Consistency, Isolation, Durability)
*   Normalization to reduce data redundancy

**2. Key-Value Model:**
The key-value model is the simplest data model, storing data as pairs of keys and values. It's highly efficient for lookups by key but lacks the query flexibility of relational databases.

*Key Features:*
*   Simple data structure: key → value
*   Extremely fast lookups by key
*   Limited querying capabilities (typically only by key)
*   Often used for caching and simple configuration storage
*   Scales horizontally with ease

**3. Document Model:**
The document model stores data as semi-structured documents (typically JSON, BSON, or XML). Each document can have a different structure, providing flexibility while maintaining some organization.

*Key Features:*
*   Data stored as documents (JSON/BSON/XML)
*   Schema-less or flexible schema
*   Rich query capabilities on document contents
*   Good for hierarchical data
*   Often used in content management and real-time analytics

**4. Graph Model:**
The graph model represents data as nodes (entities) and edges (relationships between entities). It's optimized for querying complex relationships.

*Key Features:*
*   Data represented as nodes and edges
*   Relationships are first-class citizens
*   Excellent for social networks, recommendation engines
*   Specialized query languages (Cypher, Gremlin)
*   Efficient traversal of connected data

### 14.2.2 Database Operations

All database systems support a core set of operations for managing data, commonly referred to as CRUD operations (Create, Read, Update, Delete).

**1. Create Operations:**
Adding new data to the database.

*Relational Example:*
```sql
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
```

*Key-Value Example:*
```c
db_put(db, "user:1001:name", "John Doe", 0);
db_put(db, "user:1001:email", "john@example.com", 0);
```

**2. Read Operations:**
Retrieving data from the database.

*Relational Example:*
```sql
SELECT * FROM users WHERE id = 1001;
```

*Key-Value Example:*
```c
char *name = db_get(db, "user:1001:name");
char *email = db_get(db, "user:1001:email");
```

**3. Update Operations:**
Modifying existing data in the database.

*Relational Example:*
```sql
UPDATE users SET email = 'john.doe@example.com' WHERE id = 1001;
```

*Key-Value Example:*
```c
db_put(db, "user:1001:email", "john.doe@example.com", 0);
```

**4. Delete Operations:**
Removing data from the database.

*Relational Example:*
```sql
DELETE FROM users WHERE id = 1001;
```

*Key-Value Example:*
```c
db_del(db, "user:1001:name");
db_del(db, "user:1001:email");
```

### 14.2.3 ACID Properties

ACID (Atomicity, Consistency, Isolation, Durability) is a set of properties that guarantee database transactions are processed reliably.

**Atomicity:**
Ensures that database transactions are all or nothing. If any part of a transaction fails, the entire transaction fails, and the database state is left unchanged.

**Consistency:**
Ensures that a transaction brings the database from one valid state to another, maintaining all database invariants and constraints.

**Isolation:**
Ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially.

**Durability:**
Guarantees that once a transaction has been committed, it will remain committed even in the case of a system failure.

### 14.2.4 Indexing Concepts

Indexing is a critical technique for improving database performance. An index is a data structure that improves the speed of data retrieval operations on a database table.

**1. Primary Index:**
*   Created automatically on the primary key
*   Ensures uniqueness of the primary key
*   Typically implemented as a B-tree

**2. Secondary Index:**
*   Created on non-primary key columns
*   May allow duplicate values
*   Speeds up queries on those columns

**3. Composite Index:**
*   Created on multiple columns
*   Effective for queries that filter on those columns in order
*   Example: `CREATE INDEX idx_name ON users (last_name, first_name)`

**4. Hash Index:**
*   Uses a hash function to map keys to positions
*   Excellent for equality queries
*   Poor for range queries

**5. B-tree Index:**
*   Balanced tree structure
*   Supports equality and range queries efficiently
*   Maintains data in sorted order

### 14.2.5 Storage Engine Basics

The storage engine is the component of a database system responsible for managing how data is stored on disk and retrieved into memory.

**1. Page-Based Storage:**
*   Data is organized into fixed-size pages (typically 4KB-16KB)
*   Pages are the unit of I/O between disk and memory
*   Allows efficient reading/writing of data subsets

**2. Log-Structured Storage:**
*   All writes are appended to a log
*   Periodically compacted to remove obsolete data
*   Excellent write performance, good for high-write workloads

**3. Memory-Mapped Files:**
*   File contents are mapped directly into process memory
*   OS handles paging data in/out as needed
*   Simplifies I/O but depends on OS paging behavior

**4. Buffer Pool Management:**
*   Cache of recently used pages in memory
*   Reduces disk I/O by keeping frequently accessed data in memory
*   Uses algorithms like LRU (Least Recently Used) to manage cache

**Comparison of Storage Techniques:**

| **Technique**           | **Write Performance** | **Read Performance** | **Crash Recovery** | **Best For**                      |
| :---------------------- | :-------------------- | :------------------- | :----------------- | :-------------------------------- |
| **Page-Based**          | **Moderate**          | **Good**             | **Good**           | **General-purpose databases**     |
| **Log-Structured**      | **Excellent**         | **Variable**         | **Complex**        | **High-write workloads**          |
| **Memory-Mapped Files** | **Good**              | **Excellent**        | **Poor**           | **Embedded systems, read-heavy**  |
| **In-Memory**           | **Excellent**         | **Excellent**        | **Poor**           | **Caching, temporary data**       |

## 14.3 Embedded Database Libraries for C

For many applications, building a database from scratch is unnecessary and inefficient. Several high-quality embedded database libraries are available for C that provide robust data storage with minimal overhead. This section covers the most popular options, comparing their features and demonstrating basic usage patterns.

### 14.3.1 SQLite

SQLite is arguably the most widely deployed database engine in the world. It's a self-contained, serverless, zero-configuration SQL database engine that stores the entire database in a single disk file.

**Key Features:**
*   Implements most of the SQL-92 standard
*   Single database file with no external dependencies
*   ACID-compliant transactions
*   Small memory footprint (less than 500KB)
*   Used in countless applications including browsers, mobile OSes, and embedded systems

**Basic API Usage:**

```c
#include <sqlite3.h>
#include <stdio.h>

int main() {
    sqlite3 *db;
    char *err_msg = 0;
    
    // Open database (or create if doesn't exist)
    int rc = sqlite3_open("test.db", &db);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Cannot open database: %s\n", sqlite3_errmsg(db));
        sqlite3_close(db);
        return 1;
    }
    
    // Create a table
    char *sql = "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, email TEXT);";
    
    rc = sqlite3_exec(db, sql, 0, 0, &err_msg);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "SQL error: %s\n", err_msg);
        sqlite3_free(err_msg);
    }
    
    // Insert data
    sql = "INSERT INTO users(name, email) VALUES('John Doe', 'john@example.com');";
    
    rc = sqlite3_exec(db, sql, 0, 0, &err_msg);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "SQL error: %s\n", err_msg);
        sqlite3_free(err_msg);
    }
    
    // Query data
    sql = "SELECT id, name, email FROM users;";
    
    sqlite3_stmt *res;
    rc = sqlite3_prepare_v2(db, sql, -1, &res, 0);
    
    if (rc == SQLITE_OK) {
        while (sqlite3_step(res) == SQLITE_ROW) {
            int id = sqlite3_column_int(res, 0);
            const unsigned char *name = sqlite3_column_text(res, 1);
            const unsigned char *email = sqlite3_column_text(res, 2);
            
            printf("ID: %d, Name: %s, Email: %s\n", id, name, email);
        }
    } else {
        fprintf(stderr, "Failed to execute statement: %s\n", sqlite3_errmsg(db));
    }
    
    sqlite3_finalize(res);
    sqlite3_close(db);
    
    return 0;
}
```

**Compilation:**
```bash
gcc -o sqlite_demo sqlite_demo.c -lsqlite3
```

**Transaction Handling:**
```c
// Begin transaction
sqlite3_exec(db, "BEGIN TRANSACTION;", 0, 0, &err_msg);

// Perform multiple operations
// ...

// Commit transaction
sqlite3_exec(db, "COMMIT;", 0, 0, &err_msg);
```

**Parameterized Queries (Prepared Statements):**
```c
const char *sql = "INSERT INTO users(name, email) VALUES(?, ?);";
sqlite3_stmt *stmt;

// Prepare statement
if (sqlite3_prepare_v2(db, sql, -1, &stmt, 0) == SQLITE_OK) {
    // Bind parameters
    sqlite3_bind_text(stmt, 1, "Jane Smith", -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, "jane@example.com", -1, SQLITE_STATIC);
    
    // Execute statement
    if (sqlite3_step(stmt) != SQLITE_DONE) {
        fprintf(stderr, "Execution failed: %s\n", sqlite3_errmsg(db));
    }
}

// Clean up
sqlite3_finalize(stmt);
```

### 14.3.2 Berkeley DB

Berkeley DB (BDB) is a family of embedded database libraries that provide high-performance key-value storage. Originally developed at UC Berkeley, it's now maintained by Oracle.

**Key Features:**
*   Key-value store interface
*   Multiple access methods (B-tree, Hash, Queue, Recno)
*   ACID transactions
*   Replication support
*   High concurrency with fine-grained locking

**Basic API Usage:**

```c
#include <stdio.h>
#include <stdlib.h>
#include <db.h>

int main() {
    DB *dbp;
    DBC *cursorp;
    DBT key, data;
    int ret;
    u_int32_t flags;
    
    // Initialize key and data structures
    memset(&key, 0, sizeof(DBT));
    memset(&data, 0, sizeof(DBT));
    
    // Create database handle
    if ((ret = db_create(&dbp, NULL, 0)) != 0) {
        fprintf(stderr, "db_create: %s\n", db_strerror(ret));
        exit(1);
    }
    
    // Open database
    if ((ret = dbp->open(dbp, NULL, "test.db", NULL, DB_BTREE, DB_CREATE, 0664)) != 0) {
        dbp->err(dbp, ret, "DB->open");
        goto err;
    }
    
    // Insert data
    const char *name = "John Doe";
    const char *email = "john@example.com";
    
    key.data = "user1:name";
    key.size = strlen(key.data) + 1;
    data.data = (void *)name;
    data.size = strlen(name) + 1;
    
    if ((ret = dbp->put(dbp, NULL, &key, &data, 0)) == 0) {
        data.data = (void *)email;
        data.size = strlen(email) + 1;
        key.data = "user1:email";
        key.size = strlen(key.data) + 1;
        ret = dbp->put(dbp, NULL, &key, &data, 0);
    }
    
    if (ret != 0) {
        dbp->err(dbp, ret, "DB->put");
        goto err;
    }
    
    // Retrieve data
    key.data = "user1:name";
    key.size = strlen(key.data) + 1;
    
    if ((ret = dbp->get(dbp, NULL, &key, &data, 0)) == 0) {
        printf("Name: %s\n", (char *)data.data);
    } else {
        dbp->err(dbp, ret, "DB->get");
    }
    
    // Cursor example - iterate through all records
    if ((ret = dbp->cursor(dbp, NULL, &cursorp, 0)) != 0) {
        dbp->err(dbp, ret, "DB->cursor");
        goto err;
    }
    
    memset(&key, 0, sizeof(DBT));
    memset(&data, 0, sizeof(DBT));
    key.flags = DB_DBT_MALLOC;
    data.flags = DB_DBT_MALLOC;
    
    printf("\nAll records:\n");
    while ((ret = cursorp->c_get(cursorp, &key, &data, DB_NEXT)) == 0) {
        printf("%s: %s\n", (char *)key.data, (char *)data.data);
        free(key.data);
        free(data.data);
        memset(&key, 0, sizeof(DBT));
        memset(&data, 0, sizeof(DBT));
        key.flags = DB_DBT_MALLOC;
        data.flags = DB_DBT_MALLOC;
    }
    
    if (ret != DB_NOTFOUND) {
        dbp->err(dbp, ret, "DBcursor->c_get");
    }
    
    // Clean up
    if (key.data != NULL)
        free(key.data);
    if (data.data != NULL)
        free(data.data);
    cursorp->c_close(cursorp);
    
err:
    if ((ret = dbp->close(dbp, 0)) != 0) {
        fprintf(stderr, "DB->close: %s\n", db_strerror(ret));
        exit(1);
    }
    
    return 0;
}
```

**Transaction Support:**
```c
DB_ENV *envp;
DB_TXN *txn;

// Create environment with transaction support
if ((ret = db_env_create(&envp, 0)) != 0) {
    fprintf(stderr, "db_env_create: %s\n", db_strerror(ret));
    exit(1);
}

// Configure environment
if ((ret = envp->open(envp, "/path/to/dbenv", 
                     DB_CREATE | DB_INIT_TXN | DB_INIT_LOG | DB_INIT_MPOOL, 0)) != 0) {
    envp->err(envp, ret, "DB_ENV->open");
    goto env_err;
}

// Begin transaction
if ((ret = envp->txn_begin(envp, NULL, &txn, 0)) != 0) {
    envp->err(envp, ret, "DB_ENV->txn_begin");
    goto env_err;
}

// Perform database operations with transaction handle
dbp->put(dbp, txn, &key, &data, 0);

// Commit transaction
if ((ret = txn->commit(txn, 0)) != 0) {
    envp->err(envp, ret, "DB_TXN->commit");
    goto env_err;
}
```

### 14.3.3 LMDB (Lightning Memory-Mapped Database)

LMDB is an extremely fast, memory-efficient database that uses memory-mapped files. It's designed for high concurrency and low latency.

**Key Features:**
*   Memory-mapped file architecture
*   Multi-version concurrency control (MVCC)
*   No database server process
*   Read transactions don't block write transactions and vice versa
*   Extremely small codebase (< 10,000 lines of C)

**Basic API Usage:**

```c
#include <stdio.h>
#include <stdlib.h>
#include <lmdb.h>

int main() {
    MDB_env *env;
    MDB_dbi dbi;
    MDB_val key, data;
    MDB_txn *txn;
    MDB_cursor *cursor;
    int rc;
    
    // Create environment
    rc = mdb_env_create(&env);
    if (rc) {
        fprintf(stderr, "mdb_env_create failed, error %d\n", rc);
        return 1;
    }
    
    // Set maximum number of databases
    rc = mdb_env_set_maxdbs(env, 1);
    if (rc) {
        fprintf(stderr, "mdb_env_set_maxdbs failed, error %d\n", rc);
        goto env_close;
    }
    
    // Open environment
    rc = mdb_env_open(env, "./data", MDB_NOSUBDIR | MDB_NOSYNC, 0664);
    if (rc) {
        fprintf(stderr, "mdb_env_open failed, error %d\n", rc);
        goto env_close;
    }
    
    // Start write transaction
    rc = mdb_txn_begin(env, NULL, 0, &txn);
    if (rc) {
        fprintf(stderr, "mdb_txn_begin failed, error %d\n", rc);
        goto env_close;
    }
    
    // Open database
    rc = mdb_dbi_open(txn, "users", MDB_CREATE, &dbi);
    if (rc) {
        fprintf(stderr, "mdb_dbi_open failed, error %d\n", rc);
        goto txn_abort;
    }
    
    // Insert data
    key.mv_size = sizeof("user1:name");
    key.mv_data = "user1:name";
    data.mv_size = sizeof("John Doe");
    data.mv_data = "John Doe";
    rc = mdb_put(txn, dbi, &key, &data, 0);
    if (rc) {
        fprintf(stderr, "mdb_put failed, error %d\n", rc);
        goto txn_abort;
    }
    
    key.mv_size = sizeof("user1:email");
    key.mv_data = "user1:email";
    data.mv_size = sizeof("john@example.com");
    data.mv_data = "john@example.com";
    rc = mdb_put(txn, dbi, &key, &data, 0);
    if (rc) {
        fprintf(stderr, "mdb_put failed, error %d\n", rc);
        goto txn_abort;
    }
    
    // Commit transaction
    rc = mdb_txn_commit(txn);
    if (rc) {
        fprintf(stderr, "mdb_txn_commit failed, error %d\n", rc);
        goto env_close;
    }
    
    // Start read transaction
    rc = mdb_txn_begin(env, NULL, MDB_RDONLY, &txn);
    if (rc) {
        fprintf(stderr, "mdb_txn_begin failed, error %d\n", rc);
        goto env_close;
    }
    
    // Retrieve data
    key.mv_size = sizeof("user1:name");
    key.mv_data = "user1:name";
    rc = mdb_get(txn, dbi, &key, &data);
    if (rc == 0) {
        printf("Name: %s\n", (char *)data.mv_data);
    } else {
        fprintf(stderr, "mdb_get failed, error %d\n", rc);
    }
    
    // Cursor example
    rc = mdb_cursor_open(txn, dbi, &cursor);
    if (rc) {
        fprintf(stderr, "mdb_cursor_open failed, error %d\n", rc);
        goto txn_abort;
    }
    
    printf("\nAll records:\n");
    while ((rc = mdb_cursor_get(cursor, &key, &data, MDB_NEXT)) == 0) {
        printf("%.*s: %.*s\n", 
               (int)key.mv_size, (char *)key.mv_data,
               (int)data.mv_size, (char *)data.mv_data);
    }
    
    if (rc != MDB_NOTFOUND) {
        fprintf(stderr, "mdb_cursor_get failed, error %d\n", rc);
    }
    
    mdb_cursor_close(cursor);
    mdb_txn_abort(txn);
    mdb_dbi_close(env, dbi);
    mdb_env_close(env);
    return 0;

txn_abort:
    mdb_txn_abort(txn);
env_close:
    mdb_env_close(env);
    return 1;
}
```

**Advanced Features:**
```c
// Use MDB_NORDAHEAD to avoid reading ahead
rc = mdb_env_open(env, "./data", MDB_NOSUBDIR | MDB_NOSYNC | MDB_NORDAHEAD, 0664);

// Use MDB_WRITEMAP for direct write-through
rc = mdb_env_open(env, "./data", MDB_NOSUBDIR | MDB_WRITEMAP, 0664);

// Set database size (4GB)
mdb_env_set_mapsize(env, 4UL * 1024 * 1024 * 1024);

// Set maximum number of readers
mdb_env_set_maxreaders(env, 126);
```

### 14.3.4 Comparison of Embedded Database Options

Each embedded database has its strengths and weaknesses. The right choice depends on your specific requirements.

**Feature Comparison:**

| **Feature**             | **SQLite**                                      | **Berkeley DB**                                 | **LMDB**                                        |
| :---------------------- | :---------------------------------------------- | :---------------------------------------------- | :---------------------------------------------- |
| **Data Model**          | **Relational (SQL)**                            | **Key-Value**                                   | **Key-Value**                                   |
| **Query Language**      | **SQL**                                         | **None (API-based)**                            | **None (API-based)**                            |
| **Transactions**        | **ACID**                                        | **ACID**                                        | **ACID with MVCC**                              |
| **Concurrency**         | **Single writer, multiple readers**             | **Multiple readers/writers**                    | **Multiple readers, single writer**             |
| **Memory Usage**        | **Moderate**                                    | **Moderate to High**                            | **Very Low**                                    |
| **Performance**         | **Good for mixed workloads**                    | **Good for high-concurrency**                   | **Excellent for read-heavy workloads**          |
| **Crash Recovery**      | **Good**                                        | **Excellent**                                   | **Excellent**                                   |
| **File Size Limit**     | **140 TB**                                      | **4GB (default), configurable**                 | **1TB (default), configurable**                 |
| **Language Support**    | **Many languages via bindings**                 | **C, C++, Java, Python, Perl**                  | **C, with bindings for other languages**        |
| **License**             | **Public Domain**                               | **Sleepycat License (free for open source)**    | **OpenLDAP Public License (BSD-like)**          |
| **Best For**            | **Applications needing SQL, mixed workloads**   | **High-concurrency key-value needs**            | **Read-heavy, low-latency applications**        |

**Performance Characteristics:**

| **Operation**           | **SQLite**                                      | **Berkeley DB**                                 | **LMDB**                                        |
| :---------------------- | :---------------------------------------------- | :---------------------------------------------- | :---------------------------------------------- |
| **Sequential Write**    | **5,000-10,000 ops/sec**                        | **10,000-20,000 ops/sec**                       | **50,000-100,000 ops/sec**                      |
| **Random Write**        | **500-1,000 ops/sec**                           | **2,000-5,000 ops/sec**                         | **1,000-3,000 ops/sec**                         |
| **Sequential Read**     | **20,000-50,000 ops/sec**                       | **30,000-60,000 ops/sec**                       | **100,000-200,000 ops/sec**                     |
| **Random Read**         | **1,000-2,000 ops/sec**                         | **5,000-10,000 ops/sec**                        | **50,000-100,000 ops/sec**                      |
| **Transaction Overhead**| **High (disk sync)**                            | **Moderate**                                    | **Very Low (memory only)**                      |
| **Memory Usage**        | **1-5 MB**                                      | **5-20 MB**                                     | **< 1 MB**                                      |

> **Critical Insight:** The choice between these embedded databases often comes down to your specific access patterns and requirements. If you need SQL and relational features, SQLite is the clear choice. If you need high write concurrency with key-value access, Berkeley DB might be better. If you need extremely fast read performance with minimal memory usage, LMDB shines. There's no "best" database - only the best fit for your specific use case. Consider creating a small prototype with each candidate to measure performance with your actual data and access patterns before committing to one solution.

## 14.4 Building a Simple Database from Scratch

While using existing database libraries is often the right choice, understanding how to build a simple database from scratch provides invaluable insight into how database systems work. This section walks through creating a basic key-value store in C, covering file format design, CRUD operations, indexing, and transaction support.

### 14.4.1 Designing a Basic Key-Value Store

Before writing any code, we need to design our database's file format and memory structures.

**File Format Design:**
Our database will use a simple append-only log format, where each operation is appended to the end of the file. This approach provides excellent write performance and simplifies crash recovery.

```
+----------------+----------------+----------------+-----+
| Record 1 Header| Record 1 Data  | Record 2 Header| ... |
+----------------+----------------+----------------+-----+
```

Each record consists of:
1.  **Header (16 bytes)**:
    *   Magic number (4 bytes): Identifies valid records
    *   Key length (4 bytes, network byte order)
    *   Value length (4 bytes, network byte order)
    *   Operation type (1 byte): 1=PUT, 2=DELETE
    *   CRC32 checksum (3 bytes)

2.  **Key Data**: Variable length, specified in header
3.  **Value Data**: Variable length, specified in header (for PUT operations)

**Memory Structures:**
We'll maintain an in-memory hash table for fast lookups, mapping keys to their positions in the log file.

```c
typedef struct {
    char *key;
    uint32_t key_len;
    uint64_t file_offset; // Position in log file
    uint32_t value_len;   // For quick size checks
} index_entry_t;

typedef struct {
    index_entry_t **entries;
    size_t capacity;
    size_t size;
} hash_index_t;
```

**Design Trade-offs:**
*   **Append-only log**: Excellent write performance but requires periodic compaction
*   **In-memory index**: Fast lookups but limited by available memory
*   **No immediate durability**: Data is written to OS buffers first (can add fsync for durability)
*   **Simple format**: Easy to implement but less space-efficient than more complex formats

### 14.4.2 Implementing CRUD Operations

Now let's implement the core CRUD operations for our key-value store.

**1. Opening and Closing the Database:**

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <arpa/inet.h> // For htonl/ntohl

#define DB_MAGIC 0xDB110001
#define MAX_KEY_SIZE 256
#define MAX_VALUE_SIZE (1024 * 1024) // 1MB

typedef enum {
    OP_PUT = 1,
    OP_DELETE = 2
} operation_t;

typedef struct {
    uint32_t magic;      // DB_MAGIC
    uint32_t key_len;    // Network byte order
    uint32_t value_len;  // Network byte order
    uint8_t op;          // Operation type
    uint8_t crc[3];      // Simple checksum (not full CRC32)
} record_header_t;

typedef struct {
    int fd;
    char *filename;
    off_t file_size;
    hash_index_t *index;
} simpledb_t;

simpledb_t *simpledb_open(const char *filename) {
    simpledb_t *db = malloc(sizeof(simpledb_t));
    if (!db) return NULL;
    
    // Initialize database structure
    db->filename = strdup(filename);
    if (!db->filename) {
        free(db);
        return NULL;
    }
    
    // Open or create database file
    db->fd = open(filename, O_RDWR | O_CREAT, 0644);
    if (db->fd == -1) {
        free(db->filename);
        free(db);
        return NULL;
    }
    
    // Get file size
    struct stat st;
    if (fstat(db->fd, &st) == -1) {
        close(db->fd);
        free(db->filename);
        free(db);
        return NULL;
    }
    db->file_size = st.st_size;
    
    // Create index
    db->index = create_hash_index(1024);
    if (!db->index) {
        close(db->fd);
        free(db->filename);
        free(db);
        return NULL;
    }
    
    // Load existing data into index
    if (db->file_size > 0) {
        if (simpledb_recover(db) != 0) {
            simpledb_close(db);
            return NULL;
        }
    }
    
    return db;
}

void simpledb_close(simpledb_t *db) {
    if (!db) return;
    
    // Free index
    if (db->index) {
        free_hash_index(db->index);
    }
    
    // Close file
    if (db->fd != -1) {
        close(db->fd);
    }
    
    // Free memory
    free(db->filename);
    free(db);
}
```

**2. Recovery Procedure:**

Before the database can be used, we need to recover its state by reading the log file and building the in-memory index.

```c
int simpledb_recover(simpledb_t *db) {
    // Map file into memory for faster recovery
    void *map = mmap(NULL, db->file_size, PROT_READ, MAP_SHARED, db->fd, 0);
    if (map == MAP_FAILED) {
        perror("mmap failed");
        return -1;
    }
    
    char *ptr = (char *)map;
    char *end = ptr + db->file_size;
    
    while (ptr < end) {
        if (end - ptr < sizeof(record_header_t)) {
            break; // Incomplete header
        }
        
        record_header_t *header = (record_header_t *)ptr;
        
        // Check magic number
        if (ntohl(header->magic) != DB_MAGIC) {
            break; // Invalid record
        }
        
        // Calculate expected record size
        uint32_t key_len = ntohl(header->key_len);
        uint32_t value_len = ntohl(header->value_len);
        size_t record_size = sizeof(record_header_t) + key_len;
        
        if (header->op == OP_PUT) {
            record_size += value_len;
        }
        
        // Check if we have a complete record
        if (ptr + record_size > end) {
            break; // Incomplete record
        }
        
        // Extract key
        char *key = ptr + sizeof(record_header_t);
        
        // Process operation
        if (header->op == OP_PUT) {
            // Add to index
            index_entry_t *entry = malloc(sizeof(index_entry_t));
            if (!entry) {
                munmap(map, db->file_size);
                return -1;
            }
            
            entry->key = malloc(key_len + 1);
            if (!entry->key) {
                free(entry);
                munmap(map, db->file_size);
                return -1;
            }
            
            memcpy(entry->key, key, key_len);
            entry->key[key_len] = '\0';
            entry->key_len = key_len;
            entry->file_offset = ptr - (char *)map;
            entry->value_len = value_len;
            
            // Add to hash index (replacing any existing entry)
            hash_index_put(db->index, entry);
        } else if (header->op == OP_DELETE) {
            // Remove from index
            hash_index_delete(db->index, key, key_len);
        }
        
        // Move to next record
        ptr += record_size;
    }
    
    munmap(map, db->file_size);
    return 0;
}
```

**3. Inserting Data (Create Operation):**

```c
int simpledb_put(simpledb_t *db, const char *key, size_t key_len, 
                const void *value, size_t value_len) {
    // Validate input
    if (!db || !key || key_len == 0 || key_len > MAX_KEY_SIZE || 
        value_len > MAX_VALUE_SIZE) {
        return -1;
    }
    
    // Prepare record
    record_header_t header;
    header.magic = htonl(DB_MAGIC);
    header.key_len = htonl(key_len);
    header.value_len = htonl(value_len);
    header.op = OP_PUT;
    
    // Simple checksum (in a real system, use proper CRC32)
    uint32_t crc = key_len ^ value_len;
    memcpy(header.crc, &crc, 3);
    
    // Write header
    if (write(db->fd, &header, sizeof(header)) != sizeof(header)) {
        return -1;
    }
    
    // Write key
    if (write(db->fd, key, key_len) != (ssize_t)key_len) {
        return -1;
    }
    
    // Write value
    if (write(db->fd, value, value_len) != (ssize_t)value_len) {
        return -1;
    }
    
    // Update file size
    db->file_size += sizeof(header) + key_len + value_len;
    
    // Update index
    index_entry_t *entry = malloc(sizeof(index_entry_t));
    if (!entry) return -1;
    
    entry->key = malloc(key_len + 1);
    if (!entry->key) {
        free(entry);
        return -1;
    }
    
    memcpy(entry->key, key, key_len);
    entry->key[key_len] = '\0';
    entry->key_len = key_len;
    entry->file_offset = db->file_size - sizeof(header) - key_len - value_len;
    entry->value_len = value_len;
    
    hash_index_put(db->index, entry);
    
    return 0;
}
```

**4. Retrieving Data (Read Operation):**

```c
ssize_t simpledb_get(simpledb_t *db, const char *key, size_t key_len, 
                    void *value, size_t max_value_len) {
    // Validate input
    if (!db || !key || key_len == 0 || key_len > MAX_KEY_SIZE) {
        return -1;
    }
    
    // Look up in index
    index_entry_t *entry = hash_index_get(db->index, key, key_len);
    if (!entry) {
        return -1; // Key not found
    }
    
    // Calculate record size
    size_t record_size = sizeof(record_header_t) + entry->key_len + entry->value_len;
    
    // Map just the record we need
    void *map = mmap(NULL, record_size, PROT_READ, MAP_SHARED, db->fd, entry->file_offset);
    if (map == MAP_FAILED) {
        return -1;
    }
    
    // Extract value
    char *ptr = (char *)map + sizeof(record_header_t) + entry->key_len;
    size_t value_len = entry->value_len;
    
    if (value_len > max_value_len) {
        value_len = max_value_len;
    }
    
    memcpy(value, ptr, value_len);
    
    // Clean up
    munmap(map, record_size);
    
    return value_len;
}
```

**5. Deleting Data (Delete Operation):**

```c
int simpledb_delete(simpledb_t *db, const char *key, size_t key_len) {
    // Validate input
    if (!db || !key || key_len == 0 || key_len > MAX_KEY_SIZE) {
        return -1;
    }
    
    // Check if key exists
    if (!hash_index_get(db->index, key, key_len)) {
        return -1; // Key not found
    }
    
    // Write delete record
    record_header_t header;
    header.magic = htonl(DB_MAGIC);
    header.key_len = htonl(key_len);
    header.value_len = htonl(0);
    header.op = OP_DELETE;
    
    // Simple checksum
    uint32_t crc = key_len;
    memcpy(header.crc, &crc, 3);
    
    // Write header
    if (write(db->fd, &header, sizeof(header)) != sizeof(header)) {
        return -1;
    }
    
    // Write key
    if (write(db->fd, key, key_len) != (ssize_t)key_len) {
        return -1;
    }
    
    // Update file size
    db->file_size += sizeof(header) + key_len;
    
    // Update index
    hash_index_delete(db->index, key, key_len);
    
    return 0;
}
```

### 14.4.3 Adding Indexing

Our database already uses an in-memory hash index for fast lookups, but let's explore how to implement a more sophisticated indexing strategy that persists to disk.

**1. On-Disk Hash Index:**

An on-disk hash index stores the index structure in a separate file, allowing it to handle larger datasets than an in-memory index.

```c
typedef struct {
    uint32_t bucket;     // Hash bucket
    uint32_t key_len;    // Key length
    uint64_t file_offset; // Position in data file
    uint32_t value_len;  // Value length
} index_record_t;

typedef struct {
    int fd;
    size_t num_buckets;
    off_t file_size;
} disk_hash_index_t;

disk_hash_index_t *create_disk_index(const char *filename, size_t num_buckets) {
    disk_hash_index_t *index = malloc(sizeof(disk_hash_index_t));
    if (!index) return NULL;
    
    // Open or create index file
    index->fd = open(filename, O_RDWR | O_CREAT, 0644);
    if (index->fd == -1) {
        free(index);
        return NULL;
    }
    
    // Get file size
    struct stat st;
    if (fstat(index->fd, &st) == -1) {
        close(index->fd);
        free(index);
        return NULL;
    }
    index->file_size = st.st_size;
    
    // Set number of buckets
    index->num_buckets = num_buckets;
    
    // If file is empty, initialize with empty buckets
    if (index->file_size == 0) {
        uint64_t empty = 0;
        for (size_t i = 0; i < num_buckets; i++) {
            if (write(index->fd, &empty, sizeof(empty)) != sizeof(empty)) {
                close(index->fd);
                free(index);
                return NULL;
            }
        }
        index->file_size = num_buckets * sizeof(uint64_t);
    }
    
    return index;
}

void disk_index_put(disk_hash_index_t *index, const char *key, size_t key_len,
                   uint64_t file_offset, uint32_t value_len) {
    // Calculate hash and bucket
    uint32_t hash = simple_hash(key, key_len);
    uint32_t bucket = hash % index->num_buckets;
    
    // Read bucket head pointer
    uint64_t head_offset;
    off_t pos = bucket * sizeof(uint64_t);
    if (lseek(index->fd, pos, SEEK_SET) == -1 ||
        read(index->fd, &head_offset, sizeof(head_offset)) != sizeof(head_offset)) {
        return;
    }
    
    // Create new index record
    index_record_t record;
    record.bucket = bucket;
    record.key_len = htonl(key_len);
    record.file_offset = file_offset;
    record.value_len = htonl(value_len);
    
    // Write record to end of file
    off_t record_offset = index->file_size;
    if (lseek(index->fd, 0, SEEK_END) == -1 ||
        write(index->fd, &record, sizeof(record)) != sizeof(record) ||
        write(index->fd, key, key_len) != (ssize_t)key_len) {
        return;
    }
    
    // Update bucket head pointer
    head_offset = record_offset;
    if (lseek(index->fd, pos, SEEK_SET) == -1 ||
        write(index->fd, &head_offset, sizeof(head_offset)) != sizeof(head_offset)) {
        return;
    }
    
    index->file_size += sizeof(record) + key_len;
}

index_record_t *disk_index_get(disk_hash_index_t *index, const char *key, size_t key_len) {
    // Calculate hash and bucket
    uint32_t hash = simple_hash(key, key_len);
    uint32_t bucket = hash % index->num_buckets;
    
    // Read bucket head pointer
    uint64_t current_offset;
    off_t pos = bucket * sizeof(uint64_t);
    if (lseek(index->fd, pos, SEEK_SET) == -1 ||
        read(index->fd, &current_offset, sizeof(current_offset)) != sizeof(current_offset) ||
        current_offset == 0) {
        return NULL; // Empty bucket
    }
    
    // Traverse bucket chain
    while (current_offset != 0) {
        // Read index record
        index_record_t record;
        if (lseek(index->fd, current_offset, SEEK_SET) == -1 ||
            read(index->fd, &record, sizeof(record)) != sizeof(record)) {
            return NULL;
        }
        
        // Read key
        char *record_key = malloc(ntohl(record.key_len));
        if (!record_key) return NULL;
        
        if (read(index->fd, record_key, ntohl(record.key_len)) != (ssize_t)ntohl(record.key_len)) {
            free(record_key);
            return NULL;
        }
        
        // Compare keys
        if (ntohl(record.key_len) == key_len && 
            memcmp(record_key, key, key_len) == 0) {
            free(record_key);
            return malloc_and_copy_record(&record);
        }
        
        free(record_key);
        
        // Move to next record in chain
        current_offset += sizeof(record) + ntohl(record.key_len);
    }
    
    return NULL;
}
```

**2. B-tree Index Implementation:**

For range queries and ordered data access, a B-tree index is more appropriate than a hash index.

```c
#define BTREE_ORDER 4 // Minimum degree of B-tree

typedef struct {
    int is_leaf;
    int num_keys;
    uint64_t *keys;     // File offsets
    char **keys_data;   // Actual key data
    size_t *keys_len;   // Lengths of key data
    void **children;    // Child nodes (pointers for memory, offsets for disk)
} btree_node_t;

typedef struct {
    btree_node_t *root;
    size_t key_size;
} btree_index_t;

btree_index_t *btree_create(size_t key_size) {
    btree_index_t *index = malloc(sizeof(btree_index_t));
    if (!index) return NULL;
    
    index->key_size = key_size;
    index->root = malloc(sizeof(btree_node_t));
    if (!index->root) {
        free(index);
        return NULL;
    }
    
    // Initialize root as empty leaf node
    index->root->is_leaf = 1;
    index->root->num_keys = 0;
    index->root->keys = NULL;
    index->root->keys_data = NULL;
    index->root->keys_len = NULL;
    index->root->children = NULL;
    
    return index;
}

static void btree_split_child(btree_node_t *parent, int index, btree_node_t *child) {
    // Create new node
    btree_node_t *new_node = malloc(sizeof(btree_node_t));
    if (!new_node) return;
    
    // Determine if leaf node
    new_node->is_leaf = child->is_leaf;
    
    // Copy keys
    new_node->num_keys = BTREE_ORDER - 1;
    new_node->keys = malloc((BTREE_ORDER - 1) * sizeof(uint64_t));
    new_node->keys_data = malloc((BTREE_ORDER - 1) * sizeof(char *));
    new_node->keys_len = malloc((BTREE_ORDER - 1) * sizeof(size_t));
    
    // Copy the last t-1 keys of child to new_node
    for (int i = 0; i < BTREE_ORDER - 1; i++) {
        new_node->keys[i] = child->keys[BTREE_ORDER + i];
        new_node->keys_data[i] = child->keys_data[BTREE_ORDER + i];
        new_node->keys_len[i] = child->keys_len[BTREE_ORDER + i];
    }
    
    // Adjust child's key count
    child->num_keys = BTREE_ORDER - 1;
    
    // If not leaf, copy children pointers too
    if (!child->is_leaf) {
        new_node->children = malloc(BTREE_ORDER * sizeof(void *));
        for (int i = 0; i < BTREE_ORDER; i++) {
            new_node->children[i] = child->children[BTREE_ORDER + i];
        }
    }
    
    // Insert new_node as child of parent
    for (int i = parent->num_keys; i > index; i--) {
        parent->children[i + 1] = parent->children[i];
    }
    parent->children[index + 1] = new_node;
    
    // Move keys in parent
    for (int i = parent->num_keys - 1; i >= index; i--) {
        parent->keys[i + 1] = parent->keys[i];
        parent->keys_data[i + 1] = parent->keys_data[i];
        parent->keys_len[i + 1] = parent->keys_len[i];
    }
    
    // Insert median key from child into parent
    parent->keys[index] = child->keys[BTREE_ORDER - 1];
    parent->keys_data[index] = child->keys_data[BTREE_ORDER - 1];
    parent->keys_len[index] = child->keys_len[BTREE_ORDER - 1];
    
    parent->num_keys++;
}

void btree_insert_nonfull(btree_node_t *node, uint64_t key, 
                         const char *key_data, size_t key_len) {
    int i = node->num_keys - 1;
    
    if (node->is_leaf) {
        // Find position to insert
        while (i >= 0 && key < node->keys[i]) {
            node->keys[i + 1] = node->keys[i];
            node->keys_data[i + 1] = node->keys_data[i];
            node->keys_len[i + 1] = node->keys_len[i];
            i--;
        }
        
        // Insert key
        node->keys[i + 1] = key;
        node->keys_data[i + 1] = strdup(key_data);
        node->keys_len[i + 1] = key_len;
        node->num_keys++;
    } else {
        // Find child to insert into
        while (i >= 0 && key < node->keys[i]) {
            i--;
        }
        i++;
        
        // If child is full, split it
        if (node->children[i]->num_keys == 2 * BTREE_ORDER - 1) {
            btree_split_child(node, i, node->children[i]);
            if (key > node->keys[i]) {
                i++;
            }
        }
        
        btree_insert_nonfull(node->children[i], key, key_data, key_len);
    }
}

void btree_insert(btree_index_t *index, uint64_t key, 
                const char *key_data, size_t key_len) {
    btree_node_t *root = index->root;
    
    // If root is full, split it
    if (root->num_keys == 2 * BTREE_ORDER - 1) {
        btree_node_t *new_root = malloc(sizeof(btree_node_t));
        if (!new_root) return;
        
        // Create new root
        new_root->is_leaf = 0;
        new_root->num_keys = 0;
        new_root->children = malloc(2 * sizeof(void *));
        new_root->children[0] = root;
        
        // Split old root
        btree_split_child(new_root, 0, root);
        
        // Insert key into new root
        btree_insert_nonfull(new_root, key, key_data, key_len);
        
        // Update root
        index->root = new_root;
    } else {
        btree_insert_nonfull(root, key, key_data, key_len);
    }
}
```

### 14.4.4 Transaction Support

Adding transaction support ensures data consistency and provides recovery from failures.

**1. Write-Ahead Logging (WAL):**

WAL is a technique where changes are first written to a log before being applied to the database.

```c
typedef struct {
    int fd;
    off_t file_size;
} wal_log_t;

typedef struct {
    uint32_t magic;     // WAL_MAGIC
    uint32_t seq_num;   // Sequence number
    uint32_t record_len; // Length of record data
    // Record data follows
} wal_header_t;

#define WAL_MAGIC 0x57414C01 // 'WAL\x01'

wal_log_t *wal_open(const char *filename) {
    wal_log_t *wal = malloc(sizeof(wal_log_t));
    if (!wal) return NULL;
    
    // Open or create WAL file
    wal->fd = open(filename, O_RDWR | O_CREAT, 0644);
    if (wal->fd == -1) {
        free(wal);
        return NULL;
    }
    
    // Get file size
    struct stat st;
    if (fstat(wal->fd, &st) == -1) {
        close(wal->fd);
        free(wal);
        return NULL;
    }
    wal->file_size = st.st_size;
    
    return wal;
}

int wal_append(wal_log_t *wal, const void *data, size_t data_len) {
    wal_header_t header;
    header.magic = htonl(WAL_MAGIC);
    header.seq_num = htonl(1); // In real system, increment sequence number
    header.record_len = htonl(data_len);
    
    // Write header
    if (write(wal->fd, &header, sizeof(header)) != sizeof(header)) {
        return -1;
    }
    
    // Write data
    if (write(wal->fd, data, data_len) != (ssize_t)data_len) {
        return -1;
    }
    
    // Update file size
    wal->file_size += sizeof(header) + data_len;
    
    return 0;
}

int wal_recover(simpledb_t *db, wal_log_t *wal) {
    // Map WAL file into memory
    void *map = mmap(NULL, wal->file_size, PROT_READ, MAP_SHARED, wal->fd, 0);
    if (map == MAP_FAILED) {
        perror("mmap failed");
        return -1;
    }
    
    char *ptr = (char *)map;
    char *end = ptr + wal->file_size;
    
    while (ptr < end) {
        if (end - ptr < sizeof(wal_header_t)) {
            break; // Incomplete header
        }
        
        wal_header_t *header = (wal_header_t *)ptr;
        
        // Check magic number
        if (ntohl(header->magic) != WAL_MAGIC) {
            break; // Invalid record
        }
        
        // Calculate expected record size
        uint32_t record_len = ntohl(header->record_len);
        size_t total_size = sizeof(wal_header_t) + record_len;
        
        // Check if we have a complete record
        if (ptr + total_size > end) {
            break; // Incomplete record
        }
        
        // Process record (in real system, would apply to database)
        const char *record_data = ptr + sizeof(wal_header_t);
        process_wal_record(db, record_data, record_len);
        
        // Move to next record
        ptr += total_size;
    }
    
    munmap(map, wal->file_size);
    
    // Truncate WAL after recovery
    if (ftruncate(wal->fd, 0) == -1) {
        return -1;
    }
    wal->file_size = 0;
    
    return 0;
}
```

**2. Implementing Atomic Transactions:**

```c
typedef struct {
    simpledb_t *db;
    wal_log_t *wal;
    int in_transaction;
    uint32_t seq_num;
} transaction_ctx_t;

int db_begin_transaction(transaction_ctx_t *ctx) {
    if (ctx->in_transaction) {
        return -1; // Nested transactions not supported
    }
    
    ctx->in_transaction = 1;
    ctx->seq_num = get_next_sequence_number(); // In real system
    
    return 0;
}

int db_commit(transaction_ctx_t *ctx) {
    if (!ctx->in_transaction) {
        return -1;
    }
    
    // Write commit record to WAL
    commit_record_t commit;
    commit.magic = htonl(COMMIT_MAGIC);
    commit.seq_num = htonl(ctx->seq_num);
    
    if (wal_append(ctx->wal, &commit, sizeof(commit)) != 0) {
        return -1;
    }
    
    // Flush WAL to ensure durability
    if (fsync(ctx->wal->fd) == -1) {
        return -1;
    }
    
    // Apply changes to database (in real system, would happen during recovery)
    
    ctx->in_transaction = 0;
    return 0;
}

int db_rollback(transaction_ctx_t *ctx) {
    if (!ctx->in_transaction) {
        return -1;
    }
    
    // Write rollback record to WAL
    rollback_record_t rollback;
    rollback.magic = htonl(ROLLBACK_MAGIC);
    rollback.seq_num = htonl(ctx->seq_num);
    
    if (wal_append(ctx->wal, &rollback, sizeof(rollback)) != 0) {
        return -1;
    }
    
    // Flush WAL
    if (fsync(ctx->wal->fd) == -1) {
        return -1;
    }
    
    ctx->in_transaction = 0;
    return 0;
}

// In the recovery procedure:
void process_wal_record(simpledb_t *db, const void *data, size_t len) {
    const wal_header_t *header = (const wal_header_t *)data;
    uint32_t record_type = ntohl(header->type);
    
    switch (record_type) {
        case RECORD_PUT:
            // Extract key-value and apply to database
            apply_put_record(db, data + sizeof(wal_header_t), 
                            len - sizeof(wal_header_t));
            break;
            
        case RECORD_DELETE:
            // Extract key and apply delete
            apply_delete_record(db, data + sizeof(wal_header_t), 
                               len - sizeof(wal_header_t));
            break;
            
        case RECORD_COMMIT:
            // Mark transaction as committed
            mark_transaction_committed(db, data + sizeof(wal_header_t));
            break;
            
        case RECORD_ROLLBACK:
            // Undo changes from this transaction
            rollback_transaction(db, data + sizeof(wal_header_t));
            break;
    }
}
```

**3. Checkpointing for Recovery:**

Periodic checkpointing reduces recovery time by creating consistent database snapshots.

```c
int create_checkpoint(simpledb_t *db, const char *checkpoint_dir) {
    char db_path[512];
    char wal_path[512];
    
    // Create checkpoint directory if needed
    mkdir(checkpoint_dir, 0755);
    
    // Build paths
    snprintf(db_path, sizeof(db_path), "%s/db.dat", checkpoint_dir);
    snprintf(wal_path, sizeof(wal_path), "%s/wal.log", checkpoint_dir);
    
    // Copy database file
    int src_fd = db->fd;
    int dest_fd = open(db_path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (dest_fd == -1) return -1;
    
    // Use sendfile for efficient copy (Linux)
    #ifdef __linux__
    off_t offset = 0;
    sendfile(dest_fd, src_fd, &offset, db->file_size);
    #else
    // Fallback to read/write
    char buffer[8192];
    off_t remaining = db->file_size;
    lseek(src_fd, 0, SEEK_SET);
    
    while (remaining > 0) {
        ssize_t to_read = (remaining > sizeof(buffer)) ? sizeof(buffer) : remaining;
        ssize_t bytes_read = read(src_fd, buffer, to_read);
        if (bytes_read <= 0) break;
        
        if (write(dest_fd, buffer, bytes_read) != bytes_read) {
            close(dest_fd);
            unlink(db_path);
            return -1;
        }
        
        remaining -= bytes_read;
    }
    #endif
    
    close(dest_fd);
    
    // Copy WAL file
    // (Similar to database file copy)
    
    // Record checkpoint metadata
    char meta_path[512];
    snprintf(meta_path, sizeof(meta_path), "%s/metadata", checkpoint_dir);
    
    int meta_fd = open(meta_path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (meta_fd == -1) {
        unlink(db_path);
        unlink(wal_path);
        return -1;
    }
    
    // Write metadata (timestamp, sequence number, etc.)
    checkpoint_metadata_t meta;
    meta.timestamp = time(NULL);
    meta.db_size = db->file_size;
    meta.wal_size = get_wal_size(db->wal); // In real system
    
    write(meta_fd, &meta, sizeof(meta));
    close(meta_fd);
    
    return 0;
}

int recover_from_checkpoint(simpledb_t *db, const char *checkpoint_dir) {
    char meta_path[512];
    snprintf(meta_path, sizeof(meta_path), "%s/metadata", checkpoint_dir);
    
    // Read metadata
    int meta_fd = open(meta_path, O_RDONLY);
    if (meta_fd == -1) return -1;
    
    checkpoint_metadata_t meta;
    if (read(meta_fd, &meta, sizeof(meta)) != sizeof(meta)) {
        close(meta_fd);
        return -1;
    }
    close(meta_fd);
    
    // Restore database file
    char db_path[512];
    snprintf(db_path, sizeof(db_path), "%s/db.dat", checkpoint_dir);
    
    int src_fd = open(db_path, O_RDONLY);
    if (src_fd == -1) return -1;
    
    // Truncate and copy
    if (ftruncate(db->fd, 0) == -1 ||
        lseek(db->fd, 0, SEEK_SET) == -1) {
        close(src_fd);
        return -1;
    }
    
    // Copy data (similar to create_checkpoint)
    
    close(src_fd);
    
    // Restore WAL file and replay remaining transactions
    // ...
    
    return 0;
}
```

## 14.5 Working with Relational Databases from C

While embedded databases are suitable for many applications, sometimes you need to connect to a full-fledged relational database management system (RDBMS). This section covers how to connect to external databases like MySQL and PostgreSQL from C programs.

### 14.5.1 Connecting to External Databases

There are two main approaches to connecting to external databases from C:

1. **ODBC (Open Database Connectivity)**: A standard API for accessing database management systems
2. **Native Client Libraries**: Database-specific libraries that often provide better performance and features

**ODBC Connection Example:**

```c
#include <sql.h>
#include <sqlext.h>
#include <stdio.h>

int main() {
    SQLHENV env;
    SQLHDBC dbc;
    SQLRETURN ret;
    SQLCHAR outstr[1024];
    SQLSMALLINT outstrlen;
    
    // Allocate an environment handle
    ret = SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);
    if (!SQL_SUCCEEDED(ret)) {
        fprintf(stderr, "SQLAllocHandle failed\n");
        return 1;
    }
    
    // We want ODBC 3.x
    ret = SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, (void *)SQL_OV_ODBC3, 0);
    if (!SQL_SUCCEEDED(ret)) {
        fprintf(stderr, "SQLSetEnvAttr failed\n");
        SQLFreeHandle(SQL_HANDLE_ENV, env);
        return 1;
    }
    
    // Allocate a database connection handle
    ret = SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);
    if (!SQL_SUCCEEDED(ret)) {
        fprintf(stderr, "SQLAllocHandle (connection) failed\n");
        SQLFreeHandle(SQL_HANDLE_ENV, env);
        return 1;
    }
    
    // Connect to database
    ret = SQLDriverConnect(dbc, NULL, 
                          (SQLCHAR *)"DSN=mydb;UID=username;PWD=password;", SQL_NTS,
                          outstr, sizeof(outstr), &outstrlen,
                          SQL_DRIVER_COMPLETE);
    
    if (SQL_SUCCEEDED(ret)) {
        printf("Connected to database\n");
        
        // Use the connection...
        
        // Disconnect
        SQLDisconnect(dbc);
    } else {
        fprintf(stderr, "Connection failed\n");
        // Get diagnostic info
        SQLCHAR sqlstate[6], message[256];
        SQLINTEGER native_error;
        SQLSMALLINT text_len;
        
        SQLGetDiagRec(SQL_HANDLE_DBC, dbc, 1, sqlstate, &native_error, 
                     message, sizeof(message), &text_len);
        
        fprintf(stderr, "SQLSTATE: %s\nError: %s\n", sqlstate, message);
    }
    
    // Free handles
    SQLFreeHandle(SQL_HANDLE_DBC, dbc);
    SQLFreeHandle(SQL_HANDLE_ENV, env);
    
    return 0;
}
```

**MySQL Native Connection Example:**

```c
#include <mysql.h>
#include <stdio.h>

int main() {
    MYSQL *conn;
    MYSQL_RES *res;
    MYSQL_ROW row;
    
    // Initialize connection
    conn = mysql_init(NULL);
    
    // Connect to database
    if (!mysql_real_connect(conn, "localhost", "username", "password", 
                           "database", 0, NULL, 0)) {
        fprintf(stderr, "%s\n", mysql_error(conn));
        mysql_close(conn);
        return 1;
    }
    
    // Execute query
    if (mysql_query(conn, "SELECT * FROM users")) {
        fprintf(stderr, "%s\n", mysql_error(conn));
        mysql_close(conn);
        return 1;
    }
    
    // Get result set
    res = mysql_store_result(conn);
    if (res == NULL) {
        fprintf(stderr, "%s\n", mysql_error(conn));
        mysql_close(conn);
        return 1;
    }
    
    // Get number of rows
    unsigned long num_rows = mysql_num_rows(res);
    printf("Found %lu users\n", num_rows);
    
    // Fetch and print rows
    while ((row = mysql_fetch_row(res)) != NULL) {
        printf("ID: %s, Name: %s, Email: %s\n", row[0], row[1], row[2]);
    }
    
    // Free result
    mysql_free_result(res);
    
    // Close connection
    mysql_close(conn);
    
    return 0;
}
```

**PostgreSQL Native Connection Example:**

```c
#include <libpq-fe.h>
#include <stdio.h>

int main() {
    const char *conninfo = "host=localhost user=username password=password dbname=database";
    PGconn *conn;
    PGresult *res;
    int i;
    
    // Make a connection to the database
    conn = PQconnectdb(conninfo);
    
    // Check to see that the backend connection was successfully made
    if (PQstatus(conn) != CONNECTION_OK) {
        fprintf(stderr, "Connection to database failed: %s",
                PQerrorMessage(conn));
        PQfinish(conn);
        return 1;
    }
    
    // Execute query
    res = PQexec(conn, "SELECT * FROM users");
    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));
        PQclear(res);
        PQfinish(conn);
        return 1;
    }
    
    // Print results
    int rows = PQntuples(res);
    int cols = PQnfields(res);
    
    printf("Found %d users\n", rows);
    
    // Print column names
    printf("Columns: ");
    for (i = 0; i < cols; i++) {
        printf("%s ", PQfname(res, i));
    }
    printf("\n");
    
    // Print rows
    for (i = 0; i < rows; i++) {
        int j;
        for (j = 0; j < cols; j++) {
            printf("%s\t", PQgetvalue(res, i, j));
        }
        printf("\n");
    }
    
    // Clean up
    PQclear(res);
    PQfinish(conn);
    
    return 0;
}
```

### 14.5.2 Executing SQL Queries

Executing SQL queries involves preparing statements, binding parameters, and processing results.

**1. Prepared Statements with MySQL:**

```c
#include <mysql.h>
#include <stdio.h>

int main() {
    MYSQL *conn;
    MYSQL_STMT *stmt;
    MYSQL_BIND bind[2];
    int id = 1001;
    char name[50];
    char email[100];
    unsigned long name_len, email_len;
    my_bool name_null, email_null;
    
    // Connect to database (omitted for brevity)
    conn = mysql_init(NULL);
    if (!mysql_real_connect(conn, "localhost", "username", "password", 
                          "database", 0, NULL, 0)) {
        fprintf(stderr, "%s\n", mysql_error(conn));
        return 1;
    }
    
    // Prepare statement
    stmt = mysql_stmt_init(conn);
    if (!stmt) {
        fprintf(stderr, "Could not initialize statement\n");
        mysql_close(conn);
        return 1;
    }
    
    const char *query = "SELECT name, email FROM users WHERE id = ?";
    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        fprintf(stderr, "Prepare failed: %s\n", mysql_error(conn));
        mysql_stmt_close(stmt);
        mysql_close(conn);
        return 1;
    }
    
    // Bind parameters
    memset(bind, 0, sizeof(bind));
    
    bind[0].buffer_type = MYSQL_TYPE_LONG;
    bind[0].buffer = &id;
    bind[0].is_null = 0;
    bind[0].length = 0;
    
    if (mysql_stmt_bind_param(stmt, bind)) {
        fprintf(stderr, "Binding parameters failed: %s\n", mysql_stmt_error(stmt));
        mysql_stmt_close(stmt);
        mysql_close(conn);
        return 1;
    }
    
    // Execute statement
    if (mysql_stmt_execute(stmt)) {
        fprintf(stderr, "Execute failed: %s\n", mysql_stmt_error(stmt));
        mysql_stmt_close(stmt);
        mysql_close(conn);
        return 1;
    }
    
    // Bind result variables
    memset(bind, 0, sizeof(bind));
    
    bind[0].buffer_type = MYSQL_TYPE_STRING;
    bind[0].buffer = name;
    bind[0].buffer_length = sizeof(name);
    bind[0].length = &name_len;
    bind[0].is_null = &name_null;
    
    bind[1].buffer_type = MYSQL_TYPE_STRING;
    bind[1].buffer = email;
    bind[1].buffer_length = sizeof(email);
    bind[1].length = &email_len;
    bind[1].is_null = &email_null;
    
    if (mysql_stmt_bind_result(stmt, bind)) {
        fprintf(stderr, "Binding result failed: %s\n", mysql_stmt_error(stmt));
        mysql_stmt_close(stmt);
        mysql_close(conn);
        return 1;
    }
    
    // Fetch result
    if (mysql_stmt_fetch(stmt) == 0) {
        printf("Name: %.*s, Email: %.*s\n", 
               (int)name_len, name, (int)email_len, email);
    } else {
        printf("No user found with ID %d\n", id);
    }
    
    // Clean up
    mysql_stmt_close(stmt);
    mysql_close(conn);
    
    return 0;
}
```

**2. Prepared Statements with PostgreSQL:**

```c
#include <libpq-fe.h>
#include <stdio.h>

int main() {
    const char *conninfo = "host=localhost user=username password=password dbname=database";
    PGconn *conn = PQconnectdb(conninfo);
    
    if (PQstatus(conn) != CONNECTION_OK) {
        fprintf(stderr, "Connection failed: %s", PQerrorMessage(conn));
        PQfinish(conn);
        return 1;
    }
    
    // Prepare a statement
    const char *paramValues[1];
    int paramLengths[1];
    int paramFormats[1];
    int id = 1001;
    
    paramValues[0] = (const char *)&id;
    paramLengths[0] = sizeof(id);
    paramFormats[0] = 1; // Binary format
    
    PGresult *res = PQexecParams(conn,
                                "SELECT name, email FROM users WHERE id = $1",
                                1,        // One parameter
                                NULL,     // Let the server infer parameter types
                                paramValues,
                                paramLengths,
                                paramFormats,
                                1);       // Ask for binary results
    
    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));
        PQclear(res);
        PQfinish(conn);
        return 1;
    }
    
    // Process result
    if (PQntuples(res) > 0) {
        char *name = PQgetvalue(res, 0, 0);
        char *email = PQgetvalue(res, 0, 1);
        printf("Name: %s, Email: %s\n", name, email);
    } else {
        printf("No user found with ID %d\n", id);
    }
    
    PQclear(res);
    PQfinish(conn);
    return 0;
}
```

**3. Batch Processing with SQLite:**

```c
#include <sqlite3.h>
#include <stdio.h>
#include <stdlib.h>

// Callback for processing query results
static int callback(void *data, int argc, char **argv, char **azColName) {
    for (int i = 0; i < argc; i++) {
        printf("%s = %s\n", azColName[i], argv[i] ? argv[i] : "NULL");
    }
    printf("\n");
    return 0;
}

int main() {
    sqlite3 *db;
    char *err_msg = 0;
    int rc;
    
    rc = sqlite3_open("test.db", &db);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Cannot open database: %s\n", sqlite3_errmsg(db));
        sqlite3_close(db);
        return 1;
    }
    
    // Create table if not exists
    char *sql = "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, email TEXT);";
    rc = sqlite3_exec(db, sql, 0, 0, &err_msg);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "SQL error: %s\n", err_msg);
        sqlite3_free(err_msg);
        sqlite3_close(db);
        return 1;
    }
    
    // Begin transaction for batch insert
    rc = sqlite3_exec(db, "BEGIN TRANSACTION;", 0, 0, &err_msg);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "BEGIN TRANSACTION failed: %s\n", err_msg);
        sqlite3_free(err_msg);
        sqlite3_close(db);
        return 1;
    }
    
    // Prepare statement for insertion
    sqlite3_stmt *stmt;
    const char *insert_sql = "INSERT INTO users(name, email) VALUES(?, ?);";
    
    rc = sqlite3_prepare_v2(db, insert_sql, -1, &stmt, 0);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db));
        sqlite3_close(db);
        return 1;
    }
    
    // Insert multiple records
    const char *names[] = {"Alice", "Bob", "Charlie", "Diana"};
    const char *emails[] = {"alice@example.com", "bob@example.com", 
                           "charlie@example.com", "diana@example.com"};
    
    for (int i = 0; i < 4; i++) {
        sqlite3_bind_text(stmt, 1, names[i], -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, emails[i], -1, SQLITE_STATIC);
        
        rc = sqlite3_step(stmt);
        if (rc != SQLITE_DONE) {
            fprintf(stderr, "Execution failed: %s\n", sqlite3_errmsg(db));
        }
        
        sqlite3_reset(stmt);
    }
    
    // Finalize statement
    sqlite3_finalize(stmt);
    
    // Commit transaction
    rc = sqlite3_exec(db, "COMMIT;", 0, 0, &err_msg);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "COMMIT failed: %s\n", err_msg);
        sqlite3_free(err_msg);
    }
    
    // Query all users
    sql = "SELECT * FROM users;";
    rc = sqlite3_exec(db, sql, callback, 0, &err_msg);
    
    if (rc != SQLITE_OK) {
        fprintf(stderr, "Failed to select data: %s\n", err_msg);
        sqlite3_free(err_msg);
    }
    
    sqlite3_close(db);
    return 0;
}
```

### 14.5.3 Error Handling and Best Practices

Proper error handling is critical when working with databases to ensure data integrity and provide meaningful feedback.

**1. Connection Management:**

```c
// Reusable function to create a database connection
MYSQL *create_mysql_connection(const char *host, const char *user, 
                             const char *password, const char *database) {
    MYSQL *conn = mysql_init(NULL);
    if (!conn) {
        fprintf(stderr, "mysql_init() failed\n");
        return NULL;
    }
    
    // Set connection options
    my_bool reconnect = 1;
    mysql_options(conn, MYSQL_OPT_RECONNECT, &reconnect);
    mysql_options(conn, MYSQL_OPT_CONNECT_TIMEOUT, (const char *)&timeout);
    
    // Connect to database
    if (!mysql_real_connect(conn, host, user, password, database, 0, NULL, 0)) {
        fprintf(stderr, "Connection failed: %s\n", mysql_error(conn));
        mysql_close(conn);
        return NULL;
    }
    
    // Set character set
    if (mysql_set_character_set(conn, "utf8mb4")) {
        fprintf(stderr, "Error setting character set: %s\n", mysql_error(conn));
        mysql_close(conn);
        return NULL;
    }
    
    return conn;
}

// Reusable function to safely close a connection
void close_mysql_connection(MYSQL *conn) {
    if (conn) {
        // Check if connection is still alive
        if (mysql_ping(conn) == 0) {
            mysql_close(conn);
        }
    }
}
```

**2. SQL Injection Prevention:**

SQL injection is one of the most common and dangerous security vulnerabilities in database applications.

```c
// BAD: Vulnerable to SQL injection
void bad_user_search(MYSQL *conn, const char *search_term) {
    char query[512];
    snprintf(query, sizeof(query), 
            "SELECT * FROM users WHERE name LIKE '%%%s%%'", search_term);
    
    if (mysql_query(conn, query)) {
        fprintf(stderr, "Query failed: %s\n", mysql_error(conn));
    }
}

// GOOD: Using prepared statements to prevent SQL injection
void safe_user_search(MYSQL *conn, const char *search_term) {
    MYSQL_STMT *stmt;
    MYSQL_BIND bind;
    char search_pattern[256];
    
    // Create search pattern with wildcards
    snprintf(search_pattern, sizeof(search_pattern), "%%%s%%", search_term);
    
    // Prepare statement
    stmt = mysql_stmt_init(conn);
    if (!stmt) {
        fprintf(stderr, "Could not initialize statement\n");
        return;
    }
    
    const char *query = "SELECT * FROM users WHERE name LIKE ?";
    if (mysql_stmt_prepare(stmt, query, strlen(query))) {
        fprintf(stderr, "Prepare failed: %s\n", mysql_error(conn));
        mysql_stmt_close(stmt);
        return;
    }
    
    // Bind parameters
    memset(&bind, 0, sizeof(bind));
    bind.buffer_type = MYSQL_TYPE_STRING;
    bind.buffer = search_pattern;
    bind.buffer_length = strlen(search_pattern);
    bind.is_null = 0;
    bind.length = 0;
    
    if (mysql_stmt_bind_param(stmt, &bind)) {
        fprintf(stderr, "Binding parameters failed: %s\n", mysql_stmt_error(stmt));
        mysql_stmt_close(stmt);
        return;
    }
    
    // Execute statement
    if (mysql_stmt_execute(stmt)) {
        fprintf(stderr, "Execute failed: %s\n", mysql_stmt_error(stmt));
        mysql_stmt_close(stmt);
        return;
    }
    
    // Process results (omitted for brevity)
    
    // Clean up
    mysql_stmt_close(stmt);
}
```

**3. Resource Cleanup Best Practices:**

```c
// Using RAII-like pattern with cleanup macros
#define DB_BEGIN(conn, stmt, res) \
    MYSQL *_db_conn = (conn); \
    MYSQL_STMT *_db_stmt = (stmt); \
    MYSQL_RES *_db_res = (res); \
    do {

#define DB_END() \
    } while (0); \
    if (_db_res) mysql_free_result(_db_res); \
    if (_db_stmt) mysql_stmt_close(_db_stmt);

// Example usage
int get_user_by_id(MYSQL *conn, int id, char *name, size_t name_size, 
                  char *email, size_t email_size) {
    MYSQL_STMT *stmt = NULL;
    MYSQL_BIND bind[2];
    MYSQL_BIND result_bind[2];
    char name_buf[256];
    char email_buf[256];
    unsigned long name_len, email_len;
    my_bool name_null, email_null;
    
    DB_BEGIN(conn, stmt, NULL)
        // Prepare statement
        stmt = mysql_stmt_init(conn);
        if (!stmt) {
            fprintf(stderr, "Could not initialize statement\n");
            return -1;
        }
        
        const char *query = "SELECT name, email FROM users WHERE id = ?";
        if (mysql_stmt_prepare(stmt, query, strlen(query))) {
            fprintf(stderr, "Prepare failed: %s\n", mysql_error(conn));
            return -1;
        }
        
        // Bind parameters
        memset(bind, 0, sizeof(bind));
        bind[0].buffer_type = MYSQL_TYPE_LONG;
        bind[0].buffer = &id;
        
        if (mysql_stmt_bind_param(stmt, bind)) {
            fprintf(stderr, "Binding parameters failed: %s\n", mysql_stmt_error(stmt));
            return -1;
        }
        
        // Execute statement
        if (mysql_stmt_execute(stmt)) {
            fprintf(stderr, "Execute failed: %s\n", mysql_stmt_error(stmt));
            return -1;
        }
        
        // Bind result variables
        memset(result_bind, 0, sizeof(result_bind));
        result_bind[0].buffer_type = MYSQL_TYPE_STRING;
        result_bind[0].buffer = name_buf;
        result_bind[0].buffer_length = sizeof(name_buf);
        result_bind[0].length = &name_len;
        result_bind[0].is_null = &name_null;
        
        result_bind[1].buffer_type = MYSQL_TYPE_STRING;
        result_bind[1].buffer = email_buf;
        result_bind[1].buffer_length = sizeof(email_buf);
        result_bind[1].length = &email_len;
        result_bind[1].is_null = &email_null;
        
        if (mysql_stmt_bind_result(stmt, result_bind)) {
            fprintf(stderr, "Binding result failed: %s\n", mysql_stmt_error(stmt));
            return -1;
        }
        
        // Fetch result
        if (mysql_stmt_fetch(stmt) != 0) {
            return -1; // Not found or error
        }
        
        // Copy results to output parameters
        if (name) {
            size_t copy_len = (name_len < name_size - 1) ? name_len : name_size - 1;
            memcpy(name, name_buf, copy_len);
            name[copy_len] = '\0';
        }
        
        if (email) {
            size_t copy_len = (email_len < email_size - 1) ? email_len : email_size - 1;
            memcpy(email, email_buf, copy_len);
            email[copy_len] = '\0';
        }
        
        return 0;
    DB_END();
    
    return -1; // Should never get here
}
```

## 14.6 Performance Considerations

Database performance is often a critical factor in application design. This section covers key performance considerations for database systems in C, including indexing strategies, memory management, and query optimization techniques.

### 14.6.1 Indexing Strategies

The right indexing strategy can dramatically improve query performance. Let's explore common indexing techniques and when to use them.

**1. B-tree Indexes:**
B-tree indexes are the most common type of database index, providing efficient lookups for equality and range queries.

```c
// B-tree node structure
typedef struct {
    int n;                  // Number of keys
    int leaf;               // Is this a leaf node?
    int *keys;              // Keys in sorted order
    void **children;        // Child pointers (for non-leaf nodes)
    void **records;         // Record pointers (for leaf nodes)
} btree_node;

// B-tree structure
typedef struct {
    btree_node *root;
    int t;                  // Minimum degree
    int key_size;           // Size of keys
    int (*compare)(const void *, const void *); // Key comparison function
} btree;

// Search in B-tree
void *btree_search(btree *tree, const void *key) {
    btree_node *x = tree->root;
    
    while (1) {
        int i = 0;
        
        // Find position of key in node
        while (i < x->n && tree->compare(key, x->keys[i]) > 0) {
            i++;
        }
        
        // If key found
        if (i < x->n && tree->compare(key, x->keys[i]) == 0) {
            return x->records[i];
        }
        
        // If leaf node and key not found
        if (x->leaf) {
            return NULL;
        }
        
        // Search in appropriate child
        x = x->children[i];
    }
}

// Insert into B-tree
void btree_insert(btree *tree, const void *key, void *record) {
    btree_node *r = tree->root;
    
    // If root is full, split it
    if (r->n == 2 * tree->t - 1) {
        btree_node *s = malloc(sizeof(btree_node));
        tree->root = s;
        s->leaf = 0;
        s->n = 0;
        s->children = malloc((2 * tree->t) * sizeof(void *));
        s->children[0] = r;
        
        btree_split_child(s, 0, r, tree->t);
        btree_insert_nonfull(s, key, record, tree->t, tree->compare);
    } else {
        btree_insert_nonfull(r, key, record, tree->t, tree->compare);
    }
}
```

**2. Hash Indexes:**
Hash indexes provide extremely fast lookups for equality queries but don't support range queries.

```c
typedef struct {
    void *key;
    void *value;
    struct hash_entry *next;
} hash_entry;

typedef struct {
    hash_entry **buckets;
    size_t num_buckets;
    size_t size;
    size_t (*hash)(const void *);
    int (*compare)(const void *, const void *);
} hash_index;

// Create hash index
hash_index *hash_index_create(size_t num_buckets, 
                            size_t (*hash)(const void *),
                            int (*compare)(const void *, const void *)) {
    hash_index *index = malloc(sizeof(hash_index));
    if (!index) return NULL;
    
    index->buckets = calloc(num_buckets, sizeof(hash_entry *));
    if (!index->buckets) {
        free(index);
        return NULL;
    }
    
    index->num_buckets = num_buckets;
    index->size = 0;
    index->hash = hash;
    index->compare = compare;
    
    return index;
}

// Get value from hash index
void *hash_index_get(hash_index *index, const void *key) {
    size_t bucket = index->hash(key) % index->num_buckets;
    hash_entry *entry = index->buckets[bucket];
    
    while (entry) {
        if (index->compare(key, entry->key) == 0) {
            return entry->value;
        }
        entry = entry->next;
    }
    
    return NULL;
}

// Put value into hash index
int hash_index_put(hash_index *index, const void *key, void *value) {
    size_t bucket = index->hash(key) % index->num_buckets;
    hash_entry *entry = index->buckets[bucket];
    
    // Check if key already exists
    while (entry) {
        if (index->compare(key, entry->key) == 0) {
            entry->value = value;
            return 0;
        }
        entry = entry->next;
    }
    
    // Create new entry
    entry = malloc(sizeof(hash_entry));
    if (!entry) return -1;
    
    entry->key = (void *)key;
    entry->value = value;
    
    // Add to beginning of bucket
    entry->next = index->buckets[bucket];
    index->buckets[bucket] = entry;
    index->size++;
    
    return 0;
}
```

**3. Bitmap Indexes:**
Bitmap indexes are efficient for columns with low cardinality (few distinct values).

```c
typedef struct {
    size_t num_records;
    size_t num_values;
    char **bitmaps;  // One bitmap per distinct value
} bitmap_index;

// Create bitmap index
bitmap_index *bitmap_index_create(size_t num_records, size_t num_values) {
    bitmap_index *index = malloc(sizeof(bitmap_index));
    if (!index) return NULL;
    
    index->num_records = num_records;
    index->num_values = num_values;
    
    // Allocate bitmaps (1 bit per record)
    index->bitmaps = malloc(num_values * sizeof(char *));
    if (!index->bitmaps) {
        free(index);
        return NULL;
    }
    
    size_t bytes_per_bitmap = (num_records + 7) / 8;
    for (size_t i = 0; i < num_values; i++) {
        index->bitmaps[i] = calloc(bytes_per_bitmap, 1);
        if (!index->bitmaps[i]) {
            // Cleanup on failure
            while (i-- > 0) free(index->bitmaps[i]);
            free(index->bitmaps);
            free(index);
            return NULL;
        }
    }
    
    return index;
}

// Set value for a record
void bitmap_index_set(bitmap_index *index, size_t record_id, size_t value_id) {
    size_t byte_idx = record_id / 8;
    size_t bit_idx = record_id % 8;
    
    index->bitmaps[value_id][byte_idx] |= (1 << bit_idx);
}

// Get records with a specific value
size_t *bitmap_index_get(bitmap_index *index, size_t value_id, size_t *count) {
    size_t num_records = 0;
    size_t *records = NULL;
    
    for (size_t i = 0; i < index->num_records; i++) {
        size_t byte_idx = i / 8;
        size_t bit_idx = i % 8;
        
        if (index->bitmaps[value_id][byte_idx] & (1 << bit_idx)) {
            // Add record to result set
            records = realloc(records, (num_records + 1) * sizeof(size_t));
            if (!records) {
                free(records);
                *count = 0;
                return NULL;
            }
            
            records[num_records++] = i;
        }
    }
    
    *count = num_records;
    return records;
}
```

**4. Composite Indexes:**
Composite indexes span multiple columns and can optimize queries that filter on those columns.

```c
// Composite key structure
typedef struct {
    void *key1;
    void *key2;
    // Can extend to more keys as needed
} composite_key;

// Composite key comparison function
int composite_compare(const void *a, const void *b) {
    composite_key *key_a = (composite_key *)a;
    composite_key *key_b = (composite_key *)b;
    
    int cmp = memcmp(key_a->key1, key_b->key1, KEY_SIZE_1);
    if (cmp != 0) return cmp;
    
    return memcmp(key_a->key2, key_b->key2, KEY_SIZE_2);
}

// Using a B-tree with composite keys
btree *create_composite_index() {
    btree *index = malloc(sizeof(btree));
    if (!index) return NULL;
    
    index->t = 2; // Minimum degree
    index->key_size = sizeof(composite_key);
    index->compare = composite_compare;
    
    // Create root node
    index->root = malloc(sizeof(btree_node));
    if (!index->root) {
        free(index);
        return NULL;
    }
    
    index->root->n = 0;
    index->root->leaf = 1;
    index->root->keys = NULL;
    index->root->children = NULL;
    index->root->records = NULL;
    
    return index;
}
```

### 14.6.2 Memory Management

Efficient memory management is critical for database performance, especially for in-memory databases or caching layers.

**1. Buffer Pool Management:**
The buffer pool caches database pages in memory to reduce disk I/O.

```c
typedef struct {
    void *page_data;       // Page content
    size_t page_id;        // Page identifier
    int is_dirty;          // Has page been modified?
    int ref_count;         // Reference count for pinning
    time_t last_access;    // For LRU replacement
} buffer_frame;

typedef struct {
    buffer_frame *frames;
    size_t num_frames;
    size_t frame_size;
    pthread_mutex_t mutex;
} buffer_pool;

// Create buffer pool
buffer_pool *buffer_pool_create(size_t num_frames, size_t frame_size) {
    buffer_pool *pool = malloc(sizeof(buffer_pool));
    if (!pool) return NULL;
    
    pool->num_frames = num_frames;
    pool->frame_size = frame_size;
    
    // Allocate frames
    pool->frames = calloc(num_frames, sizeof(buffer_frame));
    if (!pool->frames) {
        free(pool);
        return NULL;
    }
    
    // Initialize frames
    for (size_t i = 0; i < num_frames; i++) {
        pool->frames[i].page_data = malloc(frame_size);
        if (!pool->frames[i].page_data) {
            // Cleanup on failure
            while (i-- > 0) free(pool->frames[i].page_data);
            free(pool->frames);
            free(pool);
            return NULL;
        }
        pool->frames[i].page_id = -1; // Invalid page ID
    }
    
    pthread_mutex_init(&pool->mutex, NULL);
    
    return pool;
}

// Get page from buffer pool
void *buffer_pool_get(buffer_pool *pool, size_t page_id, int *is_new) {
    pthread_mutex_lock(&pool->mutex);
    
    // Check if page is already in buffer
    for (size_t i = 0; i < pool->num_frames; i++) {
        if (pool->frames[i].page_id == page_id) {
            pool->frames[i].ref_count++;
            pool->frames[i].last_access = time(NULL);
            *is_new = 0;
            pthread_mutex_unlock(&pool->mutex);
            return pool->frames[i].page_data;
        }
    }
    
    // Find a frame to replace (LRU)
    size_t replace_idx = 0;
    time_t oldest = pool->frames[0].last_access;
    
    for (size_t i = 1; i < pool->num_frames; i++) {
        if (pool->frames[i].ref_count == 0 && 
            pool->frames[i].last_access < oldest) {
            replace_idx = i;
            oldest = pool->frames[i].last_access;
        }
    }
    
    // If frame is dirty, write it back to disk
    if (pool->frames[replace_idx].is_dirty && pool->frames[replace_idx].page_id != -1) {
        write_page_to_disk(pool->frames[replace_idx].page_id, 
                          pool->frames[replace_idx].page_data, 
                          pool->frame_size);
    }
    
    // Load new page
    read_page_from_disk(page_id, pool->frames[replace_idx].page_data, pool->frame_size);
    
    // Update frame
    pool->frames[replace_idx].page_id = page_id;
    pool->frames[replace_idx].is_dirty = 0;
    pool->frames[replace_idx].ref_count = 1;
    pool->frames[replace_idx].last_access = time(NULL);
    
    *is_new = 1;
    pthread_mutex_unlock(&pool->mutex);
    
    return pool->frames[replace_idx].page_data;
}

// Release page
void buffer_pool_release(buffer_pool *pool, void *page_data) {
    pthread_mutex_lock(&pool->mutex);
    
    for (size_t i = 0; i < pool->num_frames; i++) {
        if (pool->frames[i].page_data == page_data) {
            pool->frames[i].ref_count--;
            break;
        }
    }
    
    pthread_mutex_unlock(&pool->mutex);
}

// Mark page as dirty
void buffer_pool_dirty(buffer_pool *pool, void *page_data) {
    pthread_mutex_lock(&pool->mutex);
    
    for (size_t i = 0; i < pool->num_frames; i++) {
        if (pool->frames[i].page_data == page_data) {
            pool->frames[i].is_dirty = 1;
            break;
        }
    }
    
    pthread_mutex_unlock(&pool->mutex);
}
```

**2. Memory-Mapped Files:**
Memory-mapped files allow the OS to handle paging data in and out of memory.

```c
#include <sys/mman.h>

typedef struct {
    int fd;
    void *map;
    size_t file_size;
    size_t map_size;
} mmap_file;

// Open file with memory mapping
mmap_file *mmap_open(const char *filename, size_t initial_size) {
    mmap_file *file = malloc(sizeof(mmap_file));
    if (!file) return NULL;
    
    // Open or create file
    file->fd = open(filename, O_RDWR | O_CREAT, 0644);
    if (file->fd == -1) {
        free(file);
        return NULL;
    }
    
    // Set file size if creating new file
    if (initial_size > 0) {
        if (lseek(file->fd, initial_size - 1, SEEK_SET) == -1 ||
            write(file->fd, "", 1) != 1) {
            close(file->fd);
            free(file);
            return NULL;
        }
    }
    
    // Get actual file size
    struct stat st;
    if (fstat(file->fd, &st) == -1) {
        close(file->fd);
        free(file);
        return NULL;
    }
    file->file_size = st.st_size;
    
    // Map file into memory
    file->map_size = file->file_size;
    file->map = mmap(NULL, file->map_size, PROT_READ | PROT_WRITE, 
                    MAP_SHARED, file->fd, 0);
    
    if (file->map == MAP_FAILED) {
        close(file->fd);
        free(file);
        return NULL;
    }
    
    return file;
}

// Resize memory-mapped file
int mmap_resize(mmap_file *file, size_t new_size) {
    // Unmap current mapping
    if (munmap(file->map, file->map_size) == -1) {
        return -1;
    }
    
    // Resize file
    if (ftruncate(file->fd, new_size) == -1) {
        // Try to remap with old size
        file->map = mmap(NULL, file->map_size, PROT_READ | PROT_WRITE, 
                        MAP_SHARED, file->fd, 0);
        return -1;
    }
    
    // Map new size
    file->map = mmap(NULL, new_size, PROT_READ | PROT_WRITE, 
                    MAP_SHARED, file->fd, 0);
    
    if (file->map == MAP_FAILED) {
        file->map = mmap(NULL, file->map_size, PROT_READ | PROT_WRITE, 
                        MAP_SHARED, file->fd, 0);
        return -1;
    }
    
    file->file_size = new_size;
    file->map_size = new_size;
    
    return 0;
}

// Close memory-mapped file
void mmap_close(mmap_file *file) {
    if (file) {
        if (file->map) munmap(file->map, file->map_size);
        if (file->fd != -1) close(file->fd);
        free(file);
    }
}
```

**3. Memory Allocation Strategies:**
Custom memory allocators can improve performance for database-specific patterns.

```c
typedef struct {
    void *memory;
    size_t size;
    size_t used;
    pthread_mutex_t mutex;
} slab_allocator;

// Create slab allocator
slab_allocator *slab_create(size_t size) {
    slab_allocator *slab = malloc(sizeof(slab_allocator));
    if (!slab) return NULL;
    
    slab->memory = malloc(size);
    if (!slab->memory) {
        free(slab);
        return NULL;
    }
    
    slab->size = size;
    slab->used = 0;
    pthread_mutex_init(&slab->mutex, NULL);
    
    return slab;
}

// Allocate from slab
void *slab_alloc(slab_allocator *slab, size_t size) {
    pthread_mutex_lock(&slab->mutex);
    
    // Check if enough space
    if (slab->used + size > slab->size) {
        pthread_mutex_unlock(&slab->mutex);
        return NULL;
    }
    
    // Allocate from slab
    void *ptr = (char *)slab->memory + slab->used;
    slab->used += size;
    
    pthread_mutex_unlock(&slab->mutex);
    return ptr;
}

// Reset slab (free all allocations)
void slab_reset(slab_allocator *slab) {
    pthread_mutex_lock(&slab->mutex);
    slab->used = 0;
    pthread_mutex_unlock(&slab->mutex);
}

// Custom record allocator for database records
typedef struct {
    slab_allocator *small_records; // For records <= 256 bytes
    slab_allocator *medium_records; // For records 256-1024 bytes
    slab_allocator *large_records; // For records > 1024 bytes
} record_allocator;

record_allocator *record_allocator_create() {
    record_allocator *alloc = malloc(sizeof(record_allocator));
    if (!alloc) return NULL;
    
    alloc->small_records = slab_create(64 * 1024); // 64KB slab
    alloc->medium_records = slab_create(256 * 1024); // 256KB slab
    alloc->large_records = slab_create(1024 * 1024); // 1MB slab
    
    if (!alloc->small_records || !alloc->medium_records || !alloc->large_records) {
        record_allocator_destroy(alloc);
        return NULL;
    }
    
    return alloc;
}

void *record_alloc(record_allocator *alloc, size_t size) {
    if (size <= 256) {
        return slab_alloc(alloc->small_records, size);
    } else if (size <= 1024) {
        return slab_alloc(alloc->medium_records, size);
    } else {
        // For large allocations, use standard malloc
        return malloc(size);
    }
}

void record_allocator_reset(record_allocator *alloc) {
    slab_reset(alloc->small_records);
    slab_reset(alloc->medium_records);
    // Don't reset large_records as they use malloc
}
```

### 14.6.3 Query Optimization

Query optimization transforms a query into an efficient execution plan.

**1. Execution Plan Analysis:**

```c
typedef enum {
    NODE_SCAN,
    NODE_INDEX_SCAN,
    NODE_FILTER,
    NODE_PROJECT,
    NODE_JOIN,
    NODE_AGGREGATE
} plan_node_type;

typedef struct plan_node {
    plan_node_type type;
    struct plan_node *children[2];
    void *context; // Node-specific data
    size_t cost;   // Estimated cost
} plan_node;

// Create a table scan node
plan_node *create_scan_node(const char *table_name) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = NODE_SCAN;
    node->children[0] = node->children[1] = NULL;
    node->cost = 100; // Base cost for scan
    
    // Store table name
    node->context = strdup(table_name);
    if (!node->context) {
        free(node);
        return NULL;
    }
    
    return node;
}

// Create an index scan node
plan_node *create_index_scan_node(const char *table_name, const char *index_name) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = NODE_INDEX_SCAN;
    node->children[0] = node->children[1] = NULL;
    node->cost = 10; // Cheaper than full scan
    
    // Store context
    typedef struct { char table[64]; char index[64]; } index_context;
    index_context *ctx = malloc(sizeof(index_context));
    if (!ctx) {
        free(node);
        return NULL;
    }
    
    strncpy(ctx->table, table_name, 63);
    strncpy(ctx->index, index_name, 63);
    ctx->table[63] = ctx->index[63] = '\0';
    
    node->context = ctx;
    
    return node;
}

// Create a filter node
plan_node *create_filter_node(plan_node *child, const char *condition) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = NODE_FILTER;
    node->children[0] = child;
    node->children[1] = NULL;
    node->cost = child->cost + 5; // Small additional cost
    
    // Store condition
    node->context = strdup(condition);
    if (!node->context) {
        free(node);
        return NULL;
    }
    
    return node;
}

// Create a join node
plan_node *create_join_node(plan_node *left, plan_node *right, 
                          const char *condition, const char *join_type) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = NODE_JOIN;
    node->children[0] = left;
    node->children[1] = right;
    
    // Calculate cost - depends on join type and data sizes
    if (strcmp(join_type, "nested_loop") == 0) {
        node->cost = left->cost * right->cost;
    } else if (strcmp(join_type, "hash") == 0) {
        node->cost = left->cost + right->cost;
    } else if (strcmp(join_type, "merge") == 0) {
        node->cost = left->cost + right->cost;
    } else {
        node->cost = left->cost * right->cost; // Default to nested loop
    }
    
    // Store context
    typedef struct { 
        char condition[128]; 
        char join_type[32]; 
    } join_context;
    
    join_context *ctx = malloc(sizeof(join_context));
    if (!ctx) {
        free(node);
        return NULL;
    }
    
    strncpy(ctx->condition, condition, 127);
    strncpy(ctx->join_type, join_type, 31);
    ctx->condition[127] = ctx->join_type[31] = '\0';
    
    node->context = ctx;
    
    return node;
}

// Print execution plan
void print_plan(plan_node *node, int indent) {
    for (int i = 0; i < indent; i++) printf("  ");
    
    switch (node->type) {
        case NODE_SCAN:
            printf("Table Scan on %s (cost=%zu)\n", (char *)node->context, node->cost);
            break;
        case NODE_INDEX_SCAN:
            {
                index_context *ctx = (index_context *)node->context;
                printf("Index Scan on %s using %s (cost=%zu)\n", 
                      ctx->table, ctx->index, node->cost);
            }
            break;
        case NODE_FILTER:
            printf("Filter (%s) (cost=%zu)\n", (char *)node->context, node->cost);
            print_plan(node->children[0], indent + 1);
            break;
        case NODE_JOIN:
            {
                join_context *ctx = (join_context *)node->context;
                printf("%s Join (%s) (cost=%zu)\n", 
                      ctx->join_type, ctx->condition, node->cost);
                print_plan(node->children[0], indent + 1);
                print_plan(node->children[1], indent + 1);
            }
            break;
        default:
            printf("Unknown node type (cost=%zu)\n", node->cost);
            break;
    }
}
```

**2. Cost-Based Optimization:**

```c
// Estimate number of rows returned by a node
size_t estimate_rows(plan_node *node) {
    switch (node->type) {
        case NODE_SCAN:
            // In real system, would use statistics
            return 1000;
            
        case NODE_INDEX_SCAN:
            // Index scans typically return fewer rows
            return 100;
            
        case NODE_FILTER:
            {
                // Estimate selectivity based on condition
                const char *condition = (const char *)node->context;
                double selectivity = 0.1; // Default estimate
                
                // Simple heuristic for equality
                if (strstr(condition, "=")) {
                    selectivity = 0.01;
                } 
                // Heuristic for range
                else if (strstr(condition, ">") || strstr(condition, "<")) {
                    selectivity = 0.1;
                }
                
                return (size_t)(estimate_rows(node->children[0]) * selectivity);
            }
            
        case NODE_JOIN:
            {
                join_context *ctx = (join_context *)node->context;
                size_t left_rows = estimate_rows(node->children[0]);
                size_t right_rows = estimate_rows(node->children[1]);
                
                // Simple join selectivity estimate
                double selectivity = 0.01;
                
                return (size_t)(left_rows * right_rows * selectivity);
            }
            
        default:
            return estimate_rows(node->children[0]);
    }
}

// Rewrite plan to optimize
plan_node *optimize_plan(plan_node *node) {
    // Base case: leaf nodes can't be optimized
    if (!node->children[0]) {
        return node;
    }
    
    // Recursively optimize children
    for (int i = 0; i < 2 && node->children[i]; i++) {
        node->children[i] = optimize_plan(node->children[i]);
    }
    
    // Rule 1: Push filters down
    if (node->type == NODE_FILTER && node->children[0]->type == NODE_SCAN) {
        // Check if we can use an index
        const char *table = (const char *)node->children[0]->context;
        const char *condition = (const char *)node->context;
        
        // Simple check for equality on indexed column
        if (strstr(condition, "=") && strstr(condition, "id")) {
            // Replace scan + filter with index scan
            plan_node *index_node = create_index_scan_node(table, "id_idx");
            free(node->children[0]->context);
            free(node->children[0]);
            free(node->context);
            free(node);
            return index_node;
        }
    }
    
    // Rule 2: Reorder joins
    if (node->type == NODE_JOIN) {
        size_t left_rows = estimate_rows(node->children[0]);
        size_t right_rows = estimate_rows(node->children[1]);
        
        // If right side has fewer rows, swap
        if (right_rows < left_rows) {
            plan_node *temp = node->children[0];
            node->children[0] = node->children[1];
            node->children[1] = temp;
            
            // Update join condition (simplified)
            join_context *ctx = (join_context *)node->context;
            // In real system, would need to rewrite condition
        }
    }
    
    return node;
}
```

**3. Join Algorithms:**

```c
// Nested Loop Join
void nested_loop_join(void *left_data, size_t left_count, size_t left_size,
                    void *right_data, size_t right_count, size_t right_size,
                    int (*match)(const void *, const void *),
                    void (*callback)(const void *, const void *)) {
    for (size_t i = 0; i < left_count; i++) {
        void *left_row = (char *)left_data + i * left_size;
        
        for (size_t j = 0; j < right_count; j++) {
            void *right_row = (char *)right_data + j * right_size;
            
            if (match(left_row, right_row)) {
                callback(left_row, right_row);
            }
        }
    }
}

// Hash Join
void hash_join(void *build_data, size_t build_count, size_t build_size,
              void *probe_data, size_t probe_count, size_t probe_size,
              size_t (*hash)(const void *),
              int (*equals)(const void *, const void *),
              void (*callback)(const void *, const void *)) {
    // Create hash table
    #define HASH_TABLE_SIZE 1024
    void **hash_table = calloc(HASH_TABLE_SIZE, sizeof(void *));
    size_t *hash_counts = calloc(HASH_TABLE_SIZE, sizeof(size_t));
    
    if (!hash_table || !hash_counts) {
        free(hash_table);
        free(hash_counts);
        return;
    }
    
    // Build phase: hash build input
    for (size_t i = 0; i < build_count; i++) {
        void *row = (char *)build_data + i * build_size;
        size_t h = hash(row) % HASH_TABLE_SIZE;
        
        // Add to hash table
        void **bucket = realloc(hash_table[h], 
                               (hash_counts[h] + 1) * sizeof(void *));
        if (!bucket) continue;
        
        hash_table[h] = bucket;
        hash_table[h][hash_counts[h]++] = row;
    }
    
    // Probe phase: find matches
    for (size_t i = 0; i < probe_count; i++) {
        void *row = (char *)probe_data + i * probe_size;
        size_t h = hash(row) % HASH_TABLE_SIZE;
        
        // Check all entries in bucket
        for (size_t j = 0; j < hash_counts[h]; j++) {
            if (equals(hash_table[h][j], row)) {
                callback(hash_table[h][j], row);
            }
        }
    }
    
    // Cleanup
    for (size_t i = 0; i < HASH_TABLE_SIZE; i++) {
        free(hash_table[i]);
    }
    free(hash_table);
    free(hash_counts);
}

// Merge Join (requires sorted inputs)
void merge_join(void *left_data, size_t left_count, size_t left_size,
               void *right_data, size_t right_count, size_t right_size,
               int (*compare)(const void *, const void *),
               void (*callback)(const void *, const void *)) {
    size_t i = 0, j = 0;
    
    while (i < left_count && j < right_count) {
        void *left_row = (char *)left_data + i * left_size;
        void *right_row = (char *)right_data + j * right_size;
        
        int cmp = compare(left_row, right_row);
        
        if (cmp == 0) {
            // Find all matching rows on both sides
            size_t i_start = i;
            while (i < left_count && 
                  compare(left_row, (char *)left_data + i * left_size) == 0) {
                i++;
            }
            
            size_t j_start = j;
            while (j < right_count && 
                  compare((char *)right_data + j * right_size, left_row) == 0) {
                j++;
            }
            
            // Generate all combinations
            for (size_t ii = i_start; ii < i; ii++) {
                for (size_t jj = j_start; jj < j; jj++) {
                    callback((char *)left_data + ii * left_size,
                            (char *)right_data + jj * right_size);
                }
            }
        } else if (cmp < 0) {
            i++;
        } else {
            j++;
        }
    }
}
```

## 14.7 Advanced Database Concepts

This section covers advanced database concepts that are essential for building robust, production-quality database systems. These topics go beyond basic CRUD operations to address challenges of concurrency, scalability, and reliability.

### 14.7.1 Concurrency Control

Concurrency control ensures that multiple transactions can execute simultaneously without interfering with each other.

**1. Locking Mechanisms:**

```c
typedef enum {
    LOCK_SHARED,
    LOCK_EXCLUSIVE
} lock_mode;

typedef struct lock {
    struct lock *next;
    size_t resource_id;
    int transaction_id;
    lock_mode mode;
} lock_t;

typedef struct {
    lock_t *head;
    pthread_mutex_t mutex;
} lock_manager_t;

// Create lock manager
lock_manager_t *lock_manager_create() {
    lock_manager_t *manager = malloc(sizeof(lock_manager_t));
    if (!manager) return NULL;
    
    manager->head = NULL;
    pthread_mutex_init(&manager->mutex, NULL);
    
    return manager;
}

// Acquire lock
int lock_acquire(lock_manager_t *manager, size_t resource_id, 
                int transaction_id, lock_mode mode) {
    pthread_mutex_lock(&manager->mutex);
    
    // Check for conflicting locks
    lock_t *current = manager->head;
    while (current) {
        if (current->resource_id == resource_id) {
            if (current->mode == LOCK_EXCLUSIVE || 
                (mode == LOCK_EXCLUSIVE && current->transaction_id != transaction_id)) {
                pthread_mutex_unlock(&manager->mutex);
                return 0; // Cannot acquire lock
            }
        }
        current = current->next;
    }
    
    // Create new lock
    lock_t *new_lock = malloc(sizeof(lock_t));
    if (!new_lock) {
        pthread_mutex_unlock(&manager->mutex);
        return -1;
    }
    
    new_lock->resource_id = resource_id;
    new_lock->transaction_id = transaction_id;
    new_lock->mode = mode;
    new_lock->next = manager->head;
    manager->head = new_lock;
    
    pthread_mutex_unlock(&manager->mutex);
    return 1; // Lock acquired
}

// Release lock
void lock_release(lock_manager_t *manager, size_t resource_id, 
                 int transaction_id) {
    pthread_mutex_lock(&manager->mutex);
    
    lock_t *current = manager->head;
    lock_t *prev = NULL;
    
    while (current) {
        if (current->resource_id == resource_id && 
            current->transaction_id == transaction_id) {
            if (prev) {
                prev->next = current->next;
            } else {
                manager->head = current->next;
            }
            
            free(current);
            break;
        }
        
        prev = current;
        current = current->next;
    }
    
    pthread_mutex_unlock(&manager->mutex);
}

// Release all locks for a transaction
void lock_release_all(lock_manager_t *manager, int transaction_id) {
    pthread_mutex_lock(&manager->mutex);
    
    lock_t *current = manager->head;
    lock_t *prev = NULL;
    
    while (current) {
        if (current->transaction_id == transaction_id) {
            lock_t *to_free = current;
            
            if (prev) {
                prev->next = current->next;
            } else {
                manager->head = current->next;
            }
            
            current = current->next;
            free(to_free);
        } else {
            prev = current;
            current = current->next;
        }
    }
    
    pthread_mutex_unlock(&manager->mutex);
}
```

**2. Transaction Isolation Levels:**

```c
typedef enum {
    ISOLATION_READ_UNCOMMITTED,
    ISOLATION_READ_COMMITTED,
    ISOLATION_REPEATABLE_READ,
    ISOLATION_SERIALIZABLE
} isolation_level;

typedef struct {
    int id;
    isolation_level level;
    time_t start_time;
    // Additional transaction state
} transaction_t;

// Check if a value is visible to a transaction
int is_value_visible(transaction_t *tx, const void *value_metadata) {
    // In real system, would use timestamp or versioning
    
    // Read Uncommitted: see all values
    if (tx->level == ISOLATION_READ_UNCOMMITTED) {
        return 1;
    }
    
    // Extract metadata (simplified)
    typedef struct { time_t commit_time; int committed; } value_meta;
    value_meta *meta = (value_meta *)value_metadata;
    
    // Read Committed: see only committed values
    if (tx->level == ISOLATION_READ_COMMITTED) {
        return meta->committed && meta->commit_time <= tx->start_time;
    }
    
    // Repeatable Read / Serializable: see values as of transaction start
    return meta->committed && meta->commit_time <= tx->start_time;
}

// Update value with transaction metadata
void update_value_metadata(void *value_metadata, transaction_t *tx) {
    typedef struct { time_t commit_time; int committed; } value_meta;
    value_meta *meta = (value_meta *)value_metadata;
    
    meta->commit_time = time(NULL);
    meta->committed = 1;
}
```

**3. Deadlock Prevention:**

```c
// Wait-for graph for deadlock detection
typedef struct {
    int transaction_id;
    int *waiting_for;  // Transactions this transaction is waiting for
    size_t num_waiting;
    int visited;
    int in_stack;
} graph_node;

typedef struct {
    graph_node *nodes;
    size_t num_nodes;
    size_t capacity;
    pthread_mutex_t mutex;
} wait_for_graph;

// Create wait-for graph
wait_for_graph *wait_for_graph_create() {
    wait_for_graph *graph = malloc(sizeof(wait_for_graph));
    if (!graph) return NULL;
    
    graph->capacity = 10;
    graph->num_nodes = 0;
    graph->nodes = calloc(graph->capacity, sizeof(graph_node));
    if (!graph->nodes) {
        free(graph);
        return NULL;
    }
    
    pthread_mutex_init(&graph->mutex, NULL);
    return graph;
}

// Add transaction to graph
void wait_for_graph_add(wait_for_graph *graph, int transaction_id) {
    pthread_mutex_lock(&graph->mutex);
    
    // Check if already exists
    for (size_t i = 0; i < graph->num_nodes; i++) {
        if (graph->nodes[i].transaction_id == transaction_id) {
            pthread_mutex_unlock(&graph->mutex);
            return;
        }
    }
    
    // Expand if needed
    if (graph->num_nodes >= graph->capacity) {
        size_t new_capacity = graph->capacity * 2;
        graph_node *new_nodes = realloc(graph->nodes, 
                                      new_capacity * sizeof(graph_node));
        if (!new_nodes) {
            pthread_mutex_unlock(&graph->mutex);
            return;
        }
        
        graph->nodes = new_nodes;
        graph->capacity = new_capacity;
    }
    
    // Add new node
    graph->nodes[graph->num_nodes].transaction_id = transaction_id;
    graph->nodes[graph->num_nodes].waiting_for = NULL;
    graph->nodes[graph->num_nodes].num_waiting = 0;
    graph->nodes[graph->num_nodes].visited = 0;
    graph->nodes[graph->num_nodes].in_stack = 0;
    
    graph->num_nodes++;
    
    pthread_mutex_unlock(&graph->mutex);
}

// Add edge to graph (tx is waiting for resource held by other_tx)
void wait_for_graph_add_edge(wait_for_graph *graph, 
                           int tx, int other_tx) {
    pthread_mutex_lock(&graph->mutex);
    
    // Find transaction node
    graph_node *node = NULL;
    for (size_t i = 0; i < graph->num_nodes; i++) {
        if (graph->nodes[i].transaction_id == tx) {
            node = &graph->nodes[i];
            break;
        }
    }
    
    if (!node) {
        pthread_mutex_unlock(&graph->mutex);
        return;
    }
    
    // Check if edge already exists
    for (size_t i = 0; i < node->num_waiting; i++) {
        if (node->waiting_for[i] == other_tx) {
            pthread_mutex_unlock(&graph->mutex);
            return;
        }
    }
    
    // Add other_tx to waiting_for list
    int *new_list = realloc(node->waiting_for, 
                           (node->num_waiting + 1) * sizeof(int));
    if (!new_list) {
        pthread_mutex_unlock(&graph->mutex);
        return;
    }
    
    node->waiting_for = new_list;
    node->waiting_for[node->num_waiting++] = other_tx;
    
    pthread_mutex_unlock(&graph->mutex);
}

// Check for cycles (deadlocks)
int wait_for_graph_has_cycle(wait_for_graph *graph, int start_idx, 
                           int *victim) {
    graph->nodes[start_idx].visited = 1;
    graph->nodes[start_idx].in_stack = 1;
    
    // Check all edges from this node
    for (size_t i = 0; i < graph->nodes[start_idx].num_waiting; i++) {
        int next_tx = graph->nodes[start_idx].waiting_for[i];
        
        // Find next node
        int next_idx = -1;
        for (size_t j = 0; j < graph->num_nodes; j++) {
            if (graph->nodes[j].transaction_id == next_tx) {
                next_idx = j;
                break;
            }
        }
        
        if (next_idx == -1) continue;
        
        if (!graph->nodes[next_idx].visited) {
            if (wait_for_graph_has_cycle(graph, next_idx, victim)) {
                // Found cycle - select victim
                if (*victim == -1 || graph->nodes[*victim].transaction_id > 
                    graph->nodes[start_idx].transaction_id) {
                    *victim = start_idx;
                }
                return 1;
            }
        } else if (graph->nodes[next_idx].in_stack) {
            // Cycle detected
            *victim = start_idx;
            return 1;
        }
    }
    
    graph->nodes[start_idx].in_stack = 0;
    return 0;
}

// Detect and resolve deadlocks
int wait_for_graph_detect_deadlock(wait_for_graph *graph) {
    pthread_mutex_lock(&graph->mutex);
    
    // Reset visited flags
    for (size_t i = 0; i < graph->num_nodes; i++) {
        graph->nodes[i].visited = 0;
        graph->nodes[i].in_stack = 0;
    }
    
    // Check for cycles starting from each node
    int victim = -1;
    for (size_t i = 0; i < graph->num_nodes; i++) {
        if (!graph->nodes[i].visited) {
            wait_for_graph_has_cycle(graph, i, &victim);
        }
    }
    
    pthread_mutex_unlock(&graph->mutex);
    
    return victim;
}
```

### 14.7.2 Replication and High Availability

Replication ensures data is available even if some nodes fail.

**1. Master-Slave Replication:**

```c
typedef struct {
    int id;
    char *address;
    int port;
    int is_master;
    int connected;
} db_node;

typedef struct {
    db_node *nodes;
    size_t num_nodes;
    size_t master_idx;
    pthread_mutex_t mutex;
} cluster;

// Create database cluster
cluster *cluster_create() {
    cluster *c = malloc(sizeof(cluster));
    if (!c) return NULL;
    
    c->num_nodes = 0;
    c->master_idx = 0;
    c->nodes = NULL;
    pthread_mutex_init(&c->mutex, NULL);
    
    return c;
}

// Add node to cluster
int cluster_add_node(cluster *c, const char *address, int port, int is_master) {
    pthread_mutex_lock(&c->mutex);
    
    // Expand nodes array
    db_node *new_nodes = realloc(c->nodes, 
                               (c->num_nodes + 1) * sizeof(db_node));
    if (!new_nodes) {
        pthread_mutex_unlock(&c->mutex);
        return -1;
    }
    
    c->nodes = new_nodes;
    
    // Initialize new node
    c->nodes[c->num_nodes].id = c->num_nodes;
    c->nodes[c->num_nodes].address = strdup(address);
    c->nodes[c->num_nodes].port = port;
    c->nodes[c->num_nodes].is_master = is_master;
    c->nodes[c->num_nodes].connected = 0;
    
    if (is_master) {
        c->master_idx = c->num_nodes;
    }
    
    c->num_nodes++;
    
    pthread_mutex_unlock(&c->mutex);
    return c->num_nodes - 1;
}

// Connect to all nodes in cluster
int cluster_connect(cluster *c) {
    pthread_mutex_lock(&c->mutex);
    
    for (size_t i = 0; i < c->num_nodes; i++) {
        // In real system, would establish connection
        c->nodes[i].connected = 1;
    }
    
    pthread_mutex_unlock(&c->mutex);
    return 0;
}

// Execute query on cluster
int cluster_query(cluster *c, const char *query, 
                 void (*result_callback)(void *, size_t), void *context) {
    pthread_mutex_lock(&c->mutex);
    
    // Find master for write queries
    if (strstr(query, "INSERT") || strstr(query, "UPDATE") || 
        strstr(query, "DELETE")) {
        
        if (c->nodes[c->master_idx].connected) {
            // Execute on master
            int result = execute_query(c->nodes[c->master_idx].address,
                                    c->nodes[c->master_idx].port,
                                    query, result_callback, context);
            
            // Replicate to slaves
            for (size_t i = 0; i < c->num_nodes; i++) {
                if (i != c->master_idx && c->nodes[i].connected) {
                    // In real system, would replicate changes
                    replicate_changes(c->nodes[i].address, 
                                    c->nodes[i].port);
                }
            }
            
            pthread_mutex_unlock(&c->mutex);
            return result;
        }
    }
    // Read query - can use any connected node
    else {
        for (size_t i = 0; i < c->num_nodes; i++) {
            if (c->nodes[i].connected) {
                int result = execute_query(c->nodes[i].address,
                                        c->nodes[i].port,
                                        query, result_callback, context);
                pthread_mutex_unlock(&c->mutex);
                return result;
            }
        }
    }
    
    pthread_mutex_unlock(&c->mutex);
    return -1; // No nodes available
}

// Failover to new master
void cluster_failover(cluster *c) {
    pthread_mutex_lock(&c->mutex);
    
    // Find first connected slave to promote
    for (size_t i = 0; i < c->num_nodes; i++) {
        if (i != c->master_idx && c->nodes[i].connected) {
            c->master_idx = i;
            break;
        }
    }
    
    pthread_mutex_unlock(&c->mutex);
}
```

**2. Raft Consensus Algorithm:**

```c
typedef enum {
    ROLE_FOLLOWER,
    ROLE_CANDIDATE,
    ROLE_LEADER
} server_role;

typedef struct {
    int id;
    server_role role;
    int current_term;
    int voted_for;
    time_t last_heartbeat;
    // Additional Raft state
} raft_server;

typedef struct {
    raft_server *servers;
    size_t num_servers;
    int commit_index;
    int last_applied;
    // Log entries would be here
    pthread_mutex_t mutex;
    pthread_cond_t cond;
} raft_cluster;

// Initialize Raft cluster
raft_cluster *raft_init(size_t num_servers) {
    raft_cluster *rc = malloc(sizeof(raft_cluster));
    if (!rc) return NULL;
    
    rc->num_servers = num_servers;
    rc->servers = calloc(num_servers, sizeof(raft_server));
    if (!rc->servers) {
        free(rc);
        return NULL;
    }
    
    // Initialize servers
    for (size_t i = 0; i < num_servers; i++) {
        rc->servers[i].id = i;
        rc->servers[i].role = ROLE_FOLLOWER;
        rc->servers[i].current_term = 0;
        rc->servers[i].voted_for = -1;
        rc->servers[i].last_heartbeat = time(NULL);
    }
    
    rc->commit_index = -1;
    rc->last_applied = -1;
    
    pthread_mutex_init(&rc->mutex, NULL);
    pthread_cond_init(&rc->cond, NULL);
    
    return rc;
}

// Request vote RPC
int raft_request_vote(raft_cluster *rc, int candidate_id, 
                     int term, int last_log_index, int last_log_term) {
    pthread_mutex_lock(&rc->mutex);
    
    // If candidate's term is less than ours, reject
    if (term < rc->servers[0].current_term) {
        pthread_mutex_unlock(&rc->mutex);
        return 0;
    }
    
    // If we've already voted for someone else in this term, reject
    if (rc->servers[0].voted_for != -1 && rc->servers[0].current_term == term) {
        pthread_mutex_unlock(&rc->mutex);
        return 0;
    }
    
    // If candidate's log is not at least as up-to-date as ours, reject
    // (In real system, would check log indices/terms)
    int log_up_to_date = 1;
    
    if (!log_up_to_date) {
        pthread_mutex_unlock(&rc->mutex);
        return 0;
    }
    
    // Grant vote
    rc->servers[0].voted_for = candidate_id;
    rc->servers[0].current_term = term;
    rc->servers[0].last_heartbeat = time(NULL);
    
    pthread_mutex_unlock(&rc->mutex);
    return 1;
}

// Append entries RPC (for heartbeats and log replication)
int raft_append_entries(raft_cluster *rc, int leader_id, int term, 
                       int prev_log_index, int prev_log_term,
                       void *entries, int entry_count,
                       int leader_commit) {
    pthread_mutex_lock(&rc->mutex);
    
    // If leader's term is less than ours, reject
    if (term < rc->servers[0].current_term) {
        pthread_mutex_unlock(&rc->mutex);
        return 0;
    }
    
    // Update term and become follower
    rc->servers[0].current_term = term;
    rc->servers[0].voted_for = -1;
    rc->servers[0].role = ROLE_FOLLOWER;
    rc->servers[0].last_heartbeat = time(NULL);
    
    // In real system, would process log entries
    
    pthread_mutex_unlock(&rc->mutex);
    return 1;
}

// Start election (run by candidate)
void *raft_election_thread(void *arg) {
    raft_cluster *rc = (raft_cluster *)arg;
    
    pthread_mutex_lock(&rc->mutex);
    
    // Only followers can become candidates
    if (rc->servers[0].role != ROLE_FOLLOWER) {
        pthread_mutex_unlock(&rc->mutex);
        return NULL;
    }
    
    // Increment term and become candidate
    rc->servers[0].current_term++;
    rc->servers[0].role = ROLE_CANDIDATE;
    rc->servers[0].voted_for = 0; // Vote for self
    
    int votes_received = 1; // Vote for self
    
    pthread_mutex_unlock(&rc->mutex);
    
    // Request votes from other servers
    for (size_t i = 1; i < rc->num_servers; i++) {
        int granted = raft_request_vote_remote(rc, i, 
                                            rc->servers[0].current_term,
                                            rc->commit_index,
                                            rc->commit_index); // Simplified
        
        if (granted) {
            pthread_mutex_lock(&rc->mutex);
            votes_received++;
            pthread_mutex_unlock(&rc->mutex);
        }
    }
    
    pthread_mutex_lock(&rc->mutex);
    
    // If received majority votes, become leader
    if (votes_received > rc->num_servers / 2) {
        rc->servers[0].role = ROLE_LEADER;
        
        // Start sending heartbeats
        pthread_cond_signal(&rc->cond);
    } 
    // If term changed during election, revert to follower
    else if (rc->servers[0].role == ROLE_CANDIDATE) {
        rc->servers[0].role = ROLE_FOLLOWER;
    }
    
    pthread_mutex_unlock(&rc->mutex);
    
    return NULL;
}

// Leader thread (sends heartbeats and replicates log)
void *raft_leader_thread(void *arg) {
    raft_cluster *rc = (raft_cluster *)arg;
    
    while (1) {
        pthread_mutex_lock(&rc->mutex);
        
        // Only leaders should be in this thread
        if (rc->servers[0].role != ROLE_LEADER) {
            pthread_cond_wait(&rc->cond, &rc->mutex);
            continue;
        }
        
        // Send heartbeats to followers
        for (size_t i = 1; i < rc->num_servers; i++) {
            raft_append_entries_remote(rc, i,
                                     0, // leader_id
                                     rc->servers[0].current_term,
                                     rc->commit_index,
                                     rc->commit_index, // Simplified
                                     NULL,
                                     0,
                                     rc->commit_index);
        }
        
        pthread_mutex_unlock(&rc->mutex);
        
        // Wait for next heartbeat interval
        usleep(500000); // 500ms
    }
    
    return NULL;
}
```

### 14.7.3 Security Considerations

Database security is critical for protecting sensitive information.

**1. Authentication and Authorization:**

```c
typedef struct {
    char *username;
    char *password_hash;  // Hashed password
    int permissions;      // Bitmask of permissions
} user_t;

typedef struct {
    user_t *users;
    size_t num_users;
    pthread_mutex_t mutex;
} auth_system;

// Create authentication system
auth_system *auth_create() {
    auth_system *auth = malloc(sizeof(auth_system));
    if (!auth) return NULL;
    
    auth->users = NULL;
    auth->num_users = 0;
    pthread_mutex_init(&auth->mutex, NULL);
    
    return auth;
}

// Add user
int auth_add_user(auth_system *auth, const char *username, 
                 const char *password, int permissions) {
    pthread_mutex_lock(&auth->mutex);
    
    // Check if user already exists
    for (size_t i = 0; i < auth->num_users; i++) {
        if (strcmp(auth->users[i].username, username) == 0) {
            pthread_mutex_unlock(&auth->mutex);
            return -1; // User exists
        }
    }
    
    // Hash password (simplified)
    char *password_hash = hash_password(password);
    if (!password_hash) {
        pthread_mutex_unlock(&auth->mutex);
        return -1;
    }
    
    // Expand users array
    user_t *new_users = realloc(auth->users, 
                              (auth->num_users + 1) * sizeof(user_t));
    if (!new_users) {
        free(password_hash);
        pthread_mutex_unlock(&auth->mutex);
        return -1;
    }
    
    auth->users = new_users;
    
    // Add new user
    auth->users[auth->num_users].username = strdup(username);
    auth->users[auth->num_users].password_hash = password_hash;
    auth->users[auth->num_users].permissions = permissions;
    
    auth->num_users++;
    
    pthread_mutex_unlock(&auth->mutex);
    return 0;
}

// Authenticate user
int auth_login(auth_system *auth, const char *username, const char *password) {
    pthread_mutex_lock(&auth->mutex);
    
    // Find user
    for (size_t i = 0; i < auth->num_users; i++) {
        if (strcmp(auth->users[i].username, username) == 0) {
            // Verify password
            char *hash = hash_password(password);
            if (!hash) {
                pthread_mutex_unlock(&auth->mutex);
                return -1;
            }
            
            int match = strcmp(hash, auth->users[i].password_hash) == 0;
            free(hash);
            
            pthread_mutex_unlock(&auth->mutex);
            return match ? (int)i : -1;
        }
    }
    
    pthread_mutex_unlock(&auth->mutex);
    return -1; // User not found
}

// Check permission
int auth_has_permission(auth_system *auth, int user_id, int permission) {
    if (user_id < 0 || (size_t)user_id >= auth->num_users) {
        return 0;
    }
    
    pthread_mutex_lock(&auth->mutex);
    int has = (auth->users[user_id].permissions & permission) != 0;
    pthread_mutex_unlock(&auth->mutex);
    
    return has;
}

// Permission constants
#define PERMISSION_READ   0x01
#define PERMISSION_WRITE  0x02
#define PERMISSION_ADMIN  0x04
```

**2. Data Encryption:**

```c
#include <openssl/aes.h>
#include <openssl/rand.h>

// Encrypt data
int encrypt_data(const unsigned char *plaintext, size_t plaintext_len,
               const unsigned char *key,
               unsigned char *ciphertext) {
    AES_KEY aes_key;
    
    if (AES_set_encrypt_key(key, 128, &aes_key) < 0) {
        return -1;
    }
    
    // Generate IV
    if (RAND_bytes(ciphertext, AES_BLOCK_SIZE) != 1) {
        return -1;
    }
    
    // Encrypt
    AES_cbc_encrypt(plaintext, ciphertext + AES_BLOCK_SIZE,
                   plaintext_len, &aes_key, 
                   ciphertext, AES_ENCRYPT);
    
    return AES_BLOCK_SIZE + plaintext_len;
}

// Decrypt data
int decrypt_data(const unsigned char *ciphertext, size_t ciphertext_len,
               const unsigned char *key,
               unsigned char *plaintext) {
    AES_KEY aes_key;
    
    if (ciphertext_len <= AES_BLOCK_SIZE) {
        return -1; // Invalid size
    }
    
    if (AES_set_decrypt_key(key, 128, &aes_key) < 0) {
        return -1;
    }
    
    // Decrypt
    AES_cbc_encrypt(ciphertext + AES_BLOCK_SIZE, plaintext,
                   ciphertext_len - AES_BLOCK_SIZE, &aes_key,
                   (unsigned char *)ciphertext, AES_DECRYPT);
    
    return ciphertext_len - AES_BLOCK_SIZE;
}

// Transparent encryption for database pages
typedef struct {
    void *original_page;
    void *encrypted_page;
    size_t page_size;
} encrypted_page;

// Read encrypted page
int read_encrypted_page(int fd, off_t offset, size_t size, 
                       const unsigned char *key,
                       void *buffer) {
    encrypted_page *ep = malloc(sizeof(encrypted_page));
    if (!ep) return -1;
    
    ep->page_size = size;
    ep->original_page = malloc(size);
    ep->encrypted_page = malloc(size + AES_BLOCK_SIZE);
    
    if (!ep->original_page || !ep->encrypted_page) {
        free(ep->original_page);
        free(ep->encrypted_page);
        free(ep);
        return -1;
    }
    
    // Read encrypted data
    if (lseek(fd, offset, SEEK_SET) == -1 ||
        read(fd, ep->encrypted_page, size + AES_BLOCK_SIZE) != (ssize_t)(size + AES_BLOCK_SIZE)) {
        free(ep->original_page);
        free(ep->encrypted_page);
        free(ep);
        return -1;
    }
    
    // Decrypt
    int decrypted_size = decrypt_data(ep->encrypted_page, size + AES_BLOCK_SIZE,
                                   key, ep->original_page);
    if (decrypted_size != (int)size) {
        free(ep->original_page);
        free(ep->encrypted_page);
        free(ep);
        return -1;
    }
    
    // Copy to buffer
    memcpy(buffer, ep->original_page, size);
    
    // Clean up
    free(ep->original_page);
    free(ep->encrypted_page);
    free(ep);
    
    return 0;
}

// Write encrypted page
int write_encrypted_page(int fd, off_t offset, size_t size, 
                        const unsigned char *key,
                        const void *buffer) {
    encrypted_page *ep = malloc(sizeof(encrypted_page));
    if (!ep) return -1;
    
    ep->page_size = size;
    ep->original_page = (void *)buffer;
    ep->encrypted_page = malloc(size + AES_BLOCK_SIZE);
    
    if (!ep->encrypted_page) {
        free(ep);
        return -1;
    }
    
    // Encrypt
    int encrypted_size = encrypt_data(buffer, size, key, ep->encrypted_page);
    if (encrypted_size != (int)(size + AES_BLOCK_SIZE)) {
        free(ep->encrypted_page);
        free(ep);
        return -1;
    }
    
    // Write encrypted data
    if (lseek(fd, offset, SEEK_SET) == -1 ||
        write(fd, ep->encrypted_page, size + AES_BLOCK_SIZE) != (ssize_t)(size + AES_BLOCK_SIZE)) {
        free(ep->encrypted_page);
        free(ep);
        return -1;
    }
    
    // Clean up
    free(ep->encrypted_page);
    free(ep);
    
    return 0;
}
```

> **Critical Insight:** Database security is not a feature to be added at the end—it must be designed into the system from the beginning. The most secure database systems implement security at multiple layers:
> *   **Network Layer**: Use TLS for all client-server communications
> *   **Authentication Layer**: Strong password policies and multi-factor authentication
> *   **Authorization Layer**: Principle of least privilege for all database operations
> *   **Encryption Layer**: Encrypt sensitive data at rest and in transit
> *   **Audit Layer**: Comprehensive logging of all access and changes
> Remember that security is a process, not a destination. Regular security audits, vulnerability scanning, and staying current with security patches are essential practices for maintaining a secure database system.

## 14.8 Case Study: Building a Simple SQL Database Engine

This section provides a comprehensive walkthrough of building a simple SQL database engine in C. We'll implement a minimal but functional SQL database that demonstrates key database concepts while maintaining code clarity.

### 14.8.1 Architecture Overview

Our SQL database engine will consist of several key components:

1. **Lexer**: Converts SQL text into tokens
2. **Parser**: Converts tokens into an abstract syntax tree (AST)
3. **Planner**: Creates an execution plan from the AST
4. **Executor**: Executes the plan and returns results
5. **Storage Engine**: Manages how data is stored on disk

**Data Flow:**
```
SQL Query → Lexer → Tokens → Parser → AST → Planner → Execution Plan → Executor → Results
                                      ↑
                                 Storage Engine
```

**Key Design Decisions:**
*   **In-memory storage**: For simplicity, we'll store all data in memory
*   **Single-threaded**: No concurrency support for this basic implementation
*   **Limited SQL support**: Only basic SELECT, INSERT, UPDATE, DELETE
*   **No indexes**: Full table scans for all queries
*   **No transactions**: Each statement is executed immediately

### 14.8.2 Lexing and Parsing SQL

**1. Lexer Implementation:**

```c
typedef enum {
    TOKEN_EOF,
    TOKEN_ERROR,
    TOKEN_SELECT,
    TOKEN_FROM,
    TOKEN_WHERE,
    TOKEN_INSERT,
    TOKEN_INTO,
    TOKEN_VALUES,
    TOKEN_UPDATE,
    TOKEN_SET,
    TOKEN_DELETE,
    TOKEN_CREATE,
    TOKEN_TABLE,
    TOKEN_INT,
    TOKEN_VARCHAR,
    TOKEN_COMMA,
    TOKEN_STAR,
    TOKEN_EQ,
    TOKEN_NE,
    TOKEN_LT,
    TOKEN_LE,
    TOKEN_GT,
    TOKEN_GE,
    TOKEN_AND,
    TOKEN_OR,
    TOKEN_IDENTIFIER,
    TOKEN_STRING,
    TOKEN_NUMBER
} token_type;

typedef struct {
    token_type type;
    char *text;
    size_t text_len;
    int line;
    int column;
} token_t;

typedef struct {
    const char *input;
    size_t pos;
    int line;
    int column;
} lexer_t;

// Create lexer
lexer_t *lexer_create(const char *input) {
    lexer_t *lexer = malloc(sizeof(lexer_t));
    if (!lexer) return NULL;
    
    lexer->input = input;
    lexer->pos = 0;
    lexer->line = 1;
    lexer->column = 1;
    
    return lexer;
}

// Free lexer
void lexer_free(lexer_t *lexer) {
    free(lexer);
}

// Get next token
token_t lexer_next_token(lexer_t *lexer) {
    token_t token = {0};
    token.line = lexer->line;
    token.column = lexer->column;
    
    // Skip whitespace
    while (isspace(lexer->input[lexer->pos])) {
        if (lexer->input[lexer->pos] == '\n') {
            lexer->line++;
            lexer->column = 1;
        } else {
            lexer->column++;
        }
        lexer->pos++;
    }
    
    // Check for end of input
    if (lexer->input[lexer->pos] == '\0') {
        token.type = TOKEN_EOF;
        return token;
    }
    
    // Check for identifiers and keywords
    if (isalpha(lexer->input[lexer->pos]) || lexer->input[lexer->pos] == '_') {
        size_t start = lexer->pos;
        
        while (isalnum(lexer->input[lexer->pos]) || 
               lexer->input[lexer->pos] == '_') {
            lexer->pos++;
            lexer->column++;
        }
        
        size_t len = lexer->pos - start;
        char *text = strndup(lexer->input + start, len);
        
        // Check for keywords
        if (strncasecmp(text, "SELECT", len) == 0) {
            token.type = TOKEN_SELECT;
        } else if (strncasecmp(text, "FROM", len) == 0) {
            token.type = TOKEN_FROM;
        } else if (strncasecmp(text, "WHERE", len) == 0) {
            token.type = TOKEN_WHERE;
        } else if (strncasecmp(text, "INSERT", len) == 0) {
            token.type = TOKEN_INSERT;
        } else if (strncasecmp(text, "INTO", len) == 0) {
            token.type = TOKEN_INTO;
        } else if (strncasecmp(text, "VALUES", len) == 0) {
            token.type = TOKEN_VALUES;
        } else if (strncasecmp(text, "UPDATE", len) == 0) {
            token.type = TOKEN_UPDATE;
        } else if (strncasecmp(text, "SET", len) == 0) {
            token.type = TOKEN_SET;
        } else if (strncasecmp(text, "DELETE", len) == 0) {
            token.type = TOKEN_DELETE;
        } else if (strncasecmp(text, "CREATE", len) == 0) {
            token.type = TOKEN_CREATE;
        } else if (strncasecmp(text, "TABLE", len) == 0) {
            token.type = TOKEN_TABLE;
        } else if (strncasecmp(text, "INT", len) == 0) {
            token.type = TOKEN_INT;
        } else if (strncasecmp(text, "VARCHAR", len) == 0) {
            token.type = TOKEN_VARCHAR;
        } else {
            token.type = TOKEN_IDENTIFIER;
        }
        
        token.text = text;
        token.text_len = len;
        return token;
    }
    
    // Check for operators
    switch (lexer->input[lexer->pos]) {
        case ',':
            token.type = TOKEN_COMMA;
            token.text = ",";
            token.text_len = 1;
            lexer->pos++;
            lexer->column++;
            break;
            
        case '*':
            token.type = TOKEN_STAR;
            token.text = "*";
            token.text_len = 1;
            lexer->pos++;
            lexer->column++;
            break;
            
        case '=':
            token.type = TOKEN_EQ;
            token.text = "=";
            token.text_len = 1;
            lexer->pos++;
            lexer->column++;
            break;
            
        case '!':
            if (lexer->input[lexer->pos + 1] == '=') {
                token.type = TOKEN_NE;
                token.text = "!=";
                token.text_len = 2;
                lexer->pos += 2;
                lexer->column += 2;
            } else {
                token.type = TOKEN_ERROR;
                token.text = "!";
                token.text_len = 1;
                lexer->pos++;
                lexer->column++;
            }
            break;
            
        case '<':
            if (lexer->input[lexer->pos + 1] == '=') {
                token.type = TOKEN_LE;
                token.text = "<=";
                token.text_len = 2;
                lexer->pos += 2;
                lexer->column += 2;
            } else {
                token.type = TOKEN_LT;
                token.text = "<";
                token.text_len = 1;
                lexer->pos++;
                lexer->column++;
            }
            break;
            
        case '>':
            if (lexer->input[lexer->pos + 1] == '=') {
                token.type = TOKEN_GE;
                token.text = ">=";
                token.text_len = 2;
                lexer->pos += 2;
                lexer->column += 2;
            } else {
                token.type = TOKEN_GT;
                token.text = ">";
                token.text_len = 1;
                lexer->pos++;
                lexer->column++;
            }
            break;
            
        case '\'':
            {
                size_t start = ++lexer->pos;
                lexer->column++;
                
                while (lexer->input[lexer->pos] != '\'' && 
                       lexer->input[lexer->pos] != '\0') {
                    if (lexer->input[lexer->pos] == '\\') {
                        lexer->pos++;
                        lexer->column++;
                    }
                    lexer->pos++;
                    lexer->column++;
                }
                
                if (lexer->input[lexer->pos] == '\0') {
                    token.type = TOKEN_ERROR;
                } else {
                    size_t len = lexer->pos - start;
                    char *text = strndup(lexer->input + start, len);
                    
                    token.type = TOKEN_STRING;
                    token.text = text;
                    token.text_len = len;
                    lexer->pos++;
                    lexer->column++;
                }
            }
            break;
            
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
            {
                size_t start = lexer->pos;
                
                while (isdigit(lexer->input[lexer->pos])) {
                    lexer->pos++;
                    lexer->column++;
                }
                
                size_t len = lexer->pos - start;
                char *text = strndup(lexer->input + start, len);
                
                token.type = TOKEN_NUMBER;
                token.text = text;
                token.text_len = len;
            }
            break;
            
        default:
            token.type = TOKEN_ERROR;
            token.text = (char *)&lexer->input[lexer->pos];
            token.text_len = 1;
            lexer->pos++;
            lexer->column++;
            break;
    }
    
    return token;
}
```

**2. Parser Implementation:**

```c
typedef enum {
    NODE_SELECT,
    NODE_INSERT,
    NODE_UPDATE,
    NODE_DELETE,
    NODE_EXPR_BINARY,
    NODE_EXPR_UNARY,
    NODE_EXPR_COLUMN,
    NODE_EXPR_LITERAL
} ast_node_type;

typedef struct ast_node {
    ast_node_type type;
    union {
        struct {
            struct ast_node *columns;
            struct ast_node *table;
            struct ast_node *where;
        } select;
        
        struct {
            struct ast_node *table;
            struct ast_node *columns;
            struct ast_node *values;
        } insert;
        
        struct {
            struct ast_node *table;
            struct ast_node *assignments;
            struct ast_node *where;
        } update;
        
        struct {
            struct ast_node *table;
            struct ast_node *where;
        } delete;
        
        struct {
            char *op;
            struct ast_node *left;
            struct ast_node *right;
        } binary;
        
        struct {
            char *name;
        } column;
        
        struct {
            char *value;
            int is_string;
        } literal;
    } u;
} ast_node;

// Forward declarations
ast_node *parse_select_statement(lexer_t *lexer);
ast_node *parse_expression(lexer_t *lexer);

// Parse a SQL statement
ast_node *parse_statement(lexer_t *lexer) {
    token_t token = lexer_next_token(lexer);
    
    switch (token.type) {
        case TOKEN_SELECT:
            return parse_select_statement(lexer);
            
        case TOKEN_INSERT:
            {
                token_t next = lexer_next_token(lexer);
                if (next.type != TOKEN_INTO) {
                    // Error
                    return NULL;
                }
                // TODO: Implement INSERT parsing
                return NULL;
            }
            
        case TOKEN_UPDATE:
            {
                // TODO: Implement UPDATE parsing
                return NULL;
            }
            
        case TOKEN_DELETE:
            {
                token_t next = lexer_next_token(lexer);
                if (next.type != TOKEN_FROM) {
                    // Error
                    return NULL;
                }
                // TODO: Implement DELETE parsing
                return NULL;
            }
            
        default:
            // Error
            return NULL;
    }
}

// Parse a SELECT statement
ast_node *parse_select_statement(lexer_t *lexer) {
    ast_node *node = malloc(sizeof(ast_node));
    if (!node) return NULL;
    
    node->type = NODE_SELECT;
    
    // Parse columns
    token_t token = lexer_next_token(lexer);
    if (token.type == TOKEN_STAR) {
        // TODO: Create AST node for *
    } else {
        // Parse column list
        lexer->pos -= token.text_len;
        node->u.select.columns = parse_expression_list(lexer, ',');
    }
    
    // Parse FROM
    token = lexer_next_token(lexer);
    if (token.type != TOKEN_FROM) {
        // Error
        free(node);
        return NULL;
    }
    
    // Parse table
    token = lexer_next_token(lexer);
    if (token.type != TOKEN_IDENTIFIER) {
        // Error
        free(node);
        return NULL;
    }
    
    node->u.select.table = malloc(sizeof(ast_node));
    if (!node->u.select.table) {
        free(node);
        return NULL;
    }
    
    node->u.select.table->type = NODE_EXPR_LITERAL;
    node->u.select.table->u.literal.value = strndup(token.text, token.text_len);
    node->u.select.table->u.literal.is_string = 0;
    
    // Parse WHERE (optional)
    token = lexer_next_token(lexer);
    if (token.type == TOKEN_WHERE) {
        node->u.select.where = parse_expression(lexer);
    } else {
        lexer->pos -= token.text_len;
        node->u.select.where = NULL;
    }
    
    return node;
}

// Parse an expression list
ast_node *parse_expression_list(lexer_t *lexer, char delimiter) {
    ast_node *list = malloc(sizeof(ast_node));
    if (!list) return NULL;
    
    list->type = NODE_EXPR_BINARY; // Using binary node as list container
    list->u.binary.op = "list";
    list->u.binary.left = NULL;
    list->u.binary.right = NULL;
    
    ast_node *current = NULL;
    
    while (1) {
        ast_node *expr = parse_expression(lexer);
        if (!expr) break;
        
        if (!list->u.binary.left) {
            list->u.binary.left = expr;
            current = expr;
        } else {
            current->u.binary.right = expr;
            current = expr;
        }
        
        token_t token = lexer_next_token(lexer);
        if (token.type != delimiter) {
            lexer->pos -= token.text_len;
            break;
        }
    }
    
    return list;
}

// Parse an expression
ast_node *parse_expression(lexer_t *lexer) {
    token_t token = lexer_next_token(lexer);
    
    // Handle literals
    if (token.type == TOKEN_NUMBER || token.type == TOKEN_STRING) {
        ast_node *node = malloc(sizeof(ast_node));
        if (!node) return NULL;
        
        node->type = NODE_EXPR_LITERAL;
        node->u.literal.value = strndup(token.text, token.text_len);
        node->u.literal.is_string = (token.type == TOKEN_STRING);
        
        return node;
    }
    // Handle identifiers (columns)
    else if (token.type == TOKEN_IDENTIFIER) {
        ast_node *node = malloc(sizeof(ast_node));
        if (!node) return NULL;
        
        node->type = NODE_EXPR_COLUMN;
        node->u.column.name = strndup(token.text, token.text_len);
        
        return node;
    }
    // Handle binary operators
    else if (token.type == TOKEN_EQ || token.type == TOKEN_NE || 
             token.type == TOKEN_LT || token.type == TOKEN_LE ||
             token.type == TOKEN_GT || token.type == TOKEN_GE) {
        // Need left operand
        lexer->pos -= token.text_len;
        
        ast_node *left = parse_expression(lexer);
        if (!left) return NULL;
        
        token = lexer_next_token(lexer); // Get operator again
        
        ast_node *right = parse_expression(lexer);
        if (!right) {
            free(left);
            return NULL;
        }
        
        ast_node *node = malloc(sizeof(ast_node));
        if (!node) {
            free(left);
            free(right);
            return NULL;
        }
        
        node->type = NODE_EXPR_BINARY;
        
        switch (token.type) {
            case TOKEN_EQ: node->u.binary.op = "="; break;
            case TOKEN_NE: node->u.binary.op = "!="; break;
            case TOKEN_LT: node->u.binary.op = "<"; break;
            case TOKEN_LE: node->u.binary.op = "<="; break;
            case TOKEN_GT: node->u.binary.op = ">"; break;
            case TOKEN_GE: node->u.binary.op = ">="; break;
            default: node->u.binary.op = "?"; break;
        }
        
        node->u.binary.left = left;
        node->u.binary.right = right;
        
        return node;
    }
    
    // Error
    return NULL;
}
```

### 14.8.3 Query Execution

**1. Execution Plan Creation:**

```c
typedef enum {
    PLAN_TABLE_SCAN,
    PLAN_FILTER,
    PLAN_PROJECT
} plan_node_type;

typedef struct plan_node {
    plan_node_type type;
    struct plan_node *child;
    void *context;
} plan_node;

// Create table scan plan node
plan_node *create_table_scan(const char *table_name) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = PLAN_TABLE_SCAN;
    node->child = NULL;
    node->context = strdup(table_name);
    
    return node;
}

// Create filter plan node
plan_node *create_filter(plan_node *child, ast_node *condition) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = PLAN_FILTER;
    node->child = child;
    node->context = condition;
    
    return node;
}

// Create project plan node
plan_node *create_project(plan_node *child, ast_node *columns) {
    plan_node *node = malloc(sizeof(plan_node));
    if (!node) return NULL;
    
    node->type = PLAN_PROJECT;
    node->child = child;
    node->context = columns;
    
    return node;
}

// Create execution plan from AST
plan_node *create_plan(ast_node *ast) {
    if (ast->type != NODE_SELECT) {
        return NULL; // Only handle SELECT for now
    }
    
    // Start with table scan
    plan_node *plan = create_table_scan(ast->u.select.table->u.literal.value);
    
    // Add filter if WHERE clause exists
    if (ast->u.select.where) {
        plan = create_filter(plan, ast->u.select.where);
    }
    
    // Add projection
    plan = create_project(plan, ast->u.select.columns);
    
    return plan;
}
```

**2. Expression Evaluation:**

```c
typedef struct {
    char *name;
    char *value;
} column_value;

// Evaluate an expression
char *evaluate_expression(ast_node *expr, column_value *row, size_t row_size) {
    switch (expr->type) {
        case NODE_EXPR_LITERAL:
            return strdup(expr->u.literal.value);
            
        case NODE_EXPR_COLUMN:
            // Find column in row
            for (size_t i = 0; i < row_size; i++) {
                if (strcmp(row[i].name, expr->u.column.name) == 0) {
                    return strdup(row[i].value);
                }
            }
            return NULL; // Column not found
            
        case NODE_EXPR_BINARY:
            {
                char *left = evaluate_expression(expr->u.binary.left, row, row_size);
                char *right = evaluate_expression(expr->u.binary.right, row, row_size);
                
                if (!left || !right) {
                    free(left);
                    free(right);
                    return NULL;
                }
                
                int result = 0;
                
                // Simple comparison for strings
                if (strcmp(expr->u.binary.op, "=") == 0) {
                    result = strcmp(left, right) == 0;
                } else if (strcmp(expr->u.binary.op, "!=") == 0) {
                    result = strcmp(left, right) != 0;
                } else if (strcmp(expr->u.binary.op, "<") == 0) {
                    result = strcmp(left, right) < 0;
                } else if (strcmp(expr->u.binary.op, "<=") == 0) {
                    result = strcmp(left, right) <= 0;
                } else if (strcmp(expr->u.binary.op, ">") == 0) {
                    result = strcmp(left, right) > 0;
                } else if (strcmp(expr->u.binary.op, ">=") == 0) {
                    result = strcmp(left, right) >= 0;
                }
                
                free(left);
                free(right);
                
                return result ? strdup("1") : strdup("0");
            }
            
        default:
            return NULL;
    }
}

// Check if a row matches a condition
int row_matches_condition(ast_node *condition, column_value *row, size_t row_size) {
    if (!condition) return 1; // No condition means match all
    
    char *result = evaluate_expression(condition, row, row_size);
    if (!result) return 0;
    
    int matches = strcmp(result, "1") == 0;
    free(result);
    
    return matches;
}
```

**3. Plan Execution:**

```c
// Table structure
typedef struct {
    char *name;
    char **columns;
    size_t num_columns;
    column_value **rows;
    size_t num_rows;
    size_t capacity;
} table_t;

// Database structure
typedef struct {
    table_t **tables;
    size_t num_tables;
    size_t capacity;
} database_t;

// Execute table scan
void execute_table_scan(plan_node *node, database_t *db, 
                       void (*row_callback)(column_value *, size_t, void *), 
                       void *context) {
    const char *table_name = (const char *)node->context;
    
    // Find table
    table_t *table = NULL;
    for (size_t i = 0; i < db->num_tables; i++) {
        if (strcmp(db->tables[i]->name, table_name) == 0) {
            table = db->tables[i];
            break;
        }
    }
    
    if (!table) return;
    
    // Process each row
    for (size_t i = 0; i < table->num_rows; i++) {
        row_callback(table->rows[i], table->num_columns, context);
    }
}

// Execute filter
void execute_filter(plan_node *node, database_t *db, 
                   void (*row_callback)(column_value *, size_t, void *), 
                   void *context) {
    ast_node *condition = (ast_node *)node->context;
    
    // Execute child plan
    execute_plan(node->child, db, 
                ^(column_value *row, size_t row_size, void *ctx) {
                    if (row_matches_condition(condition, row, row_size)) {
                        row_callback(row, row_size, context);
                    }
                }, 
                context);
}

// Execute project
void execute_project(plan_node *node, database_t *db, 
                    void (*row_callback)(column_value *, size_t, void *), 
                    void *context) {
    ast_node *columns = (ast_node *)node->context;
    
    // Execute child plan
    execute_plan(node->child, db, 
                ^(column_value *input_row, size_t input_size, void *ctx) {
                    // For simplicity, return the same row
                    row_callback(input_row, input_size, context);
                }, 
                context);
}

// Execute a plan
void execute_plan(plan_node *plan, database_t *db, 
                 void (*row_callback)(column_value *, size_t, void *), 
                 void *context) {
    if (!plan) return;
    
    switch (plan->type) {
        case PLAN_TABLE_SCAN:
            execute_table_scan(plan, db, row_callback, context);
            break;
            
        case PLAN_FILTER:
            execute_filter(plan, db, row_callback, context);
            break;
            
        case PLAN_PROJECT:
            execute_project(plan, db, row_callback, context);
            break;
            
        default:
            // Unknown plan node
            break;
    }
}
```

### 14.8.4 Storage Engine Implementation

**1. Table Management:**

```c
// Create a new table
table_t *table_create(const char *name, const char **columns, size_t num_columns) {
    table_t *table = malloc(sizeof(table_t));
    if (!table) return NULL;
    
    table->name = strdup(name);
    if (!table->name) {
        free(table);
        return NULL;
    }
    
    table->num_columns = num_columns;
    table->columns = malloc(num_columns * sizeof(char *));
    if (!table->columns) {
        free(table->name);
        free(table);
        return NULL;
    }
    
    for (size_t i = 0; i < num_columns; i++) {
        table->columns[i] = strdup(columns[i]);
        if (!table->columns[i]) {
            // Cleanup on failure
            while (i-- > 0) free(table->columns[i]);
            free(table->columns);
            free(table->name);
            free(table);
            return NULL;
        }
    }
    
    table->num_rows = 0;
    table->capacity = 10;
    table->rows = calloc(table->capacity, sizeof(column_value *));
    if (!table->rows) {
        for (size_t i = 0; i < num_columns; i++) {
            free(table->columns[i]);
        }
        free(table->columns);
        free(table->name);
        free(table);
        return NULL;
    }
    
    return table;
}

// Free a table
void table_free(table_t *table) {
    if (!table) return;
    
    // Free columns
    for (size_t i = 0; i < table->num_columns; i++) {
        free(table->columns[i]);
    }
    free(table->columns);
    
    // Free rows
    for (size_t i = 0; i < table->num_rows; i++) {
        for (size_t j = 0; j < table->num_columns; j++) {
            free(table->rows[i][j].name);
            free(table->rows[i][j].value);
        }
        free(table->rows[i]);
    }
    free(table->rows);
    
    // Free table
    free(table->name);
    free(table);
}

// Add a row to a table
int table_insert_row(table_t *table, const char **values) {
    // Expand rows array if needed
    if (table->num_rows >= table->capacity) {
        size_t new_capacity = table->capacity * 2;
        column_value **new_rows = realloc(table->rows, 
                                        new_capacity * sizeof(column_value *));
        if (!new_rows) {
            return -1;
        }
        
        table->rows = new_rows;
        table->capacity = new_capacity;
    }
    
    // Create new row
    table->rows[table->num_rows] = malloc(table->num_columns * sizeof(column_value));
    if (!table->rows[table->num_rows]) {
        return -1;
    }
    
    // Copy values
    for (size_t i = 0; i < table->num_columns; i++) {
        table->rows[table->num_rows][i].name = strdup(table->columns[i]);
        if (!table->rows[table->num_rows][i].name) {
            // Cleanup on failure
            while (i-- > 0) {
                free(table->rows[table->num_rows][i].name);
                free(table->rows[table->num_rows][i].value);
            }
            free(table->rows[table->num_rows]);
            return -1;
        }
        
        table->rows[table->num_rows][i].value = strdup(values[i]);
        if (!table->rows[table->num_rows][i].value) {
            free(table->rows[table->num_rows][i].name);
            // Cleanup on failure
            while (i-- > 0) {
                free(table->rows[table->num_rows][i].name);
                free(table->rows[table->num_rows][i].value);
            }
            free(table->rows[table->num_rows]);
            return -1;
        }
    }
    
    table->num_rows++;
    return 0;
}
```

**2. Database Management:**

```c
// Create a new database
database_t *database_create() {
    database_t *db = malloc(sizeof(database_t));
    if (!db) return NULL;
    
    db->num_tables = 0;
    db->capacity = 10;
    db->tables = calloc(db->capacity, sizeof(table_t *));
    if (!db->tables) {
        free(db);
        return NULL;
    }
    
    return db;
}

// Free a database
void database_free(database_t *db) {
    if (!db) return;
    
    // Free tables
    for (size_t i = 0; i < db->num_tables; i++) {
        table_free(db->tables[i]);
    }
    free(db->tables);
    
    // Free database
    free(db);
}

// Create a table in the database
int database_create_table(database_t *db, const char *name, 
                        const char **columns, size_t num_columns) {
    // Check if table already exists
    for (size_t i = 0; i < db->num_tables; i++) {
        if (strcmp(db->tables[i]->name, name) == 0) {
            return -1; // Table exists
        }
    }
    
    // Expand tables array if needed
    if (db->num_tables >= db->capacity) {
        size_t new_capacity = db->capacity * 2;
        table_t **new_tables = realloc(db->tables, 
                                     new_capacity * sizeof(table_t *));
        if (!new_tables) {
            return -1;
        }
        
        db->tables = new_tables;
        db->capacity = new_capacity;
    }
    
    // Create table
    table_t *table = table_create(name, columns, num_columns);
    if (!table) {
        return -1;
    }
    
    // Add to database
    db->tables[db->num_tables++] = table;
    return 0;
}

// Execute a SQL statement
int database_execute(database_t *db, const char *sql, 
                   void (*result_callback)(column_value *, size_t, void *),
                   void *context) {
    // Create lexer
    lexer_t *lexer = lexer_create(sql);
    if (!lexer) return -1;
    
    // Parse statement
    ast_node *ast = parse_statement(lexer);
    lexer_free(lexer);
    
    if (!ast) {
        return -1; // Parse error
    }
    
    // Create execution plan
    plan_node *plan = create_plan(ast);
    if (!plan) {
        free_ast(ast);
        return -1; // Unsupported statement
    }
    
    // Execute plan
    execute_plan(plan, db, result_callback, context);
    
    // Cleanup
    free_plan(plan);
    free_ast(ast);
    
    return 0;
}
```

**3. Putting It All Together:**

```c
#include <stdio.h>

// Callback for printing query results
void print_row(column_value *row, size_t row_size, void *context) {
    for (size_t i = 0; i < row_size; i++) {
        printf("%s: %s | ", row[i].name, row[i].value);
    }
    printf("\n");
}

int main() {
    // Create database
    database_t *db = database_create();
    if (!db) {
        fprintf(stderr, "Failed to create database\n");
        return 1;
    }
    
    // Create table
    const char *columns[] = {"id", "name", "email"};
    if (database_create_table(db, "users", columns, 3) != 0) {
        fprintf(stderr, "Failed to create table\n");
        database_free(db);
        return 1;
    }
    
    // Insert data
    const char *row1[] = {"1", "John Doe", "john@example.com"};
    const char *row2[] = {"2", "Jane Smith", "jane@example.com"};
    
    table_t *users_table = NULL;
    for (size_t i = 0; i < db->num_tables; i++) {
        if (strcmp(db->tables[i]->name, "users") == 0) {
            users_table = db->tables[i];
            break;
        }
    }
    
    if (!users_table || 
        table_insert_row(users_table, row1) != 0 ||
        table_insert_row(users_table, row2) != 0) {
        fprintf(stderr, "Failed to insert data\n");
        database_free(db);
        return 1;
    }
    
    // Execute query
    printf("Query results:\n");
    database_execute(db, "SELECT * FROM users", print_row, NULL);
    
    // Execute filtered query
    printf("\nFiltered query results:\n");
    database_execute(db, "SELECT * FROM users WHERE name = 'John Doe'", print_row, NULL);
    
    // Cleanup
    database_free(db);
    return 0;
}
```

## 14.9 Testing and Debugging Database Systems

Testing and debugging database systems presents unique challenges due to their stateful nature and complex interactions. This section covers effective techniques for ensuring database reliability and diagnosing issues.

### 14.9.1 Unit Testing Database Code

Unit testing database code requires careful setup and teardown to ensure tests are isolated and repeatable.

**1. Mocking Database Interfaces:**

```c
// Mock database connection
typedef struct {
    int connected;
    int transaction_active;
    int error_code;
    char *error_message;
} mock_db_connection;

// Create mock connection
mock_db_connection *mock_db_connect(const char *host, const char *user, 
                                 const char *password, const char *db) {
    mock_db_connection *conn = malloc(sizeof(mock_db_connection));
    if (!conn) return NULL;
    
    conn->connected = 1;
    conn->transaction_active = 0;
    conn->error_code = 0;
    conn->error_message = NULL;
    
    return conn;
}

// Disconnect mock connection
void mock_db_disconnect(mock_db_connection *conn) {
    if (conn) {
        free(conn->error_message);
        free(conn);
    }
}

// Execute query on mock connection
int mock_db_query(mock_db_connection *conn, const char *query) {
    if (!conn || !conn->connected) {
        if (conn) {
            conn->error_code = 1;
            conn->error_message = strdup("Not connected");
        }
        return -1;
    }
    
    // Simulate errors for specific queries
    if (strstr(query, "ERROR") != NULL) {
        conn->error_code = 2;
        conn->error_message = strdup("Simulated error");
        return -1;
    }
    
    // Simulate successful query
    return 0;
}

// Begin transaction on mock connection
int mock_db_begin(mock_db_connection *conn) {
    if (!conn || !conn->connected) {
        if (conn) {
            conn->error_code = 1;
            conn->error_message = strdup("Not connected");
        }
        return -1;
    }
    
    if (conn->transaction_active) {
        conn->error_code = 3;
        conn->error_message = strdup("Transaction already active");
        return -1;
    }
    
    conn->transaction_active = 1;
    return 0;
}

// Commit transaction on mock connection
int mock_db_commit(mock_db_connection *conn) {
    if (!conn || !conn->connected) {
        if (conn) {
            conn->error_code = 1;
            conn->error_message = strdup("Not connected");
        }
        return -1;
    }
    
    if (!conn->transaction_active) {
        conn->error_code = 4;
        conn->error_message = strdup("No active transaction");
        return -1;
    }
    
    conn->transaction_active = 0;
    return 0;
}

// Unit test example
void test_query_success() {
    mock_db_connection *conn = mock_db_connect("localhost", "user", "pass", "test");
    assert(conn != NULL);
    
    int result = mock_db_query(conn, "SELECT * FROM users");
    assert(result == 0);
    assert(conn->error_code == 0);
    
    mock_db_disconnect(conn);
}

void test_query_error() {
    mock_db_connection *conn = mock_db_connect("localhost", "user", "pass", "test");
    assert(conn != NULL);
    
    int result = mock_db_query(conn, "SELECT ERROR FROM users");
    assert(result == -1);
    assert(conn->error_code == 2);
    assert(strcmp(conn->error_message, "Simulated error") == 0);
    
    mock_db_disconnect(conn);
}
```

**2. Testing Edge Cases:**

```c
// Test connection failure
void test_connection_failure() {
    // Simulate connection failure by providing invalid parameters
    mock_db_connection *conn = mock_db_connect(NULL, NULL, NULL, NULL);
    assert(conn == NULL);
}

// Test transaction handling
void test_transaction_handling() {
    mock_db_connection *conn = mock_db_connect("localhost", "user", "pass", "test");
    assert(conn != NULL);
    
    // Begin transaction
    assert(mock_db_begin(conn) == 0);
    assert(conn->transaction_active == 1);
    
    // Try to begin another transaction
    assert(mock_db_begin(conn) == -1);
    assert(conn->error_code == 3);
    
    // Commit transaction
    assert(mock_db_commit(conn) == 0);
    assert(conn->transaction_active == 0);
    
    // Try to commit without transaction
    assert(mock_db_commit(conn) == -1);
    assert(conn->error_code == 4);
    
    mock_db_disconnect(conn);
}

// Test query with special characters
void test_query_special_chars() {
    mock_db_connection *conn = mock_db_connect("localhost", "user", "pass", "test");
    assert(conn != NULL);
    
    // Test query with quotes and special characters
    int result = mock_db_query(conn, "SELECT * FROM users WHERE name = 'O''Reilly'");
    assert(result == 0);
    
    mock_db_disconnect(conn);
}

// Test large result set
void test_large_result_set() {
    mock_db_connection *conn = mock_db_connect("localhost", "user", "pass", "test");
    assert(conn != NULL);
    
    // In real test, would verify handling of large result sets
    int result = mock_db_query(conn, "SELECT * FROM large_table");
    assert(result == 0);
    
    mock_db_disconnect(conn);
}
```

### 14.9.2 Performance Testing

Performance testing helps identify bottlenecks and ensures your database can handle expected workloads.

**1. Benchmarking Tools:**

```c
#include <time.h>
#include <stdio.h>

// Simple benchmarking function
double benchmark_function(void (*func)(void *), void *arg, int iterations) {
    struct timespec start, end;
    
    // Warm up
    for (int i = 0; i < 10; i++) {
        func(arg);
    }
    
    // Measure time
    clock_gettime(CLOCK_MONOTONIC, &start);
    
    for (int i = 0; i < iterations; i++) {
        func(arg);
    }
    
    clock_gettime(CLOCK_MONOTONIC, &end);
    
    // Calculate time in seconds
    double elapsed = (end.tv_sec - start.tv_sec) +
                    (end.tv_nsec - start.tv_nsec) / 1000000000.0;
    
    return elapsed;
}

// Test database insert performance
typedef struct {
    database_t *db;
    int num_inserts;
} insert_test_context;

void test_inserts(void *arg) {
    insert_test_context *ctx = (insert_test_context *)arg;
    
    for (int i = 0; i < ctx->num_inserts; i++) {
        char id_str[20];
        char name[20];
        char email[30];
        
        snprintf(id_str, sizeof(id_str), "%d", i);
        snprintf(name, sizeof(name), "User %d", i);
        snprintf(email, sizeof(email), "user%d@example.com", i);
        
        const char *row[] = {id_str, name, email};
        table_insert_row(ctx->db->tables[0], row);
    }
}

// Test database query performance
typedef struct {
    database_t *db;
    const char *query;
} query_test_context;

void test_queries(void *arg) {
    query_test_context *ctx = (query_test_context *)arg;
    
    for (int i = 0; i < 100; i++) {
        database_execute(ctx->db, ctx->query, NULL, NULL);
    }
}

// Run database benchmarks
void run_benchmarks(database_t *db) {
    printf("Running database benchmarks...\n");
    
    // Insert benchmark
    insert_test_context insert_ctx = {db, 100};
    double insert_time = benchmark_function(test_inserts, &insert_ctx, 10);
    printf("Insert 100 rows (10 iterations): %.4f seconds (%.1f inserts/sec)\n",
           insert_time, 1000.0 / insert_time);
    
    // Query benchmark
    query_test_context query_ctx = {db, "SELECT * FROM users"};
    double query_time = benchmark_function(test_queries, &query_ctx, 10);
    printf("Execute 100 queries (10 iterations): %.4f seconds (%.1f queries/sec)\n",
           query_time, 1000.0 / query_time);
}
```

**2. Identifying Bottlenecks:**

```c
// Profiling wrapper for database operations
typedef struct {
    const char *operation;
    double total_time;
    int count;
} profile_entry;

profile_entry *profile_entries = NULL;
size_t profile_count = 0;
size_t profile_capacity = 0;

// Start profiling an operation
void profile_start(const char *operation) {
    // In real implementation, would record start time
}

// Stop profiling an operation
void profile_stop(const char *operation) {
    // In real implementation, would calculate elapsed time
    // and update profile entries
}

// Add profile entry
void profile_add(const char *operation, double elapsed) {
    pthread_mutex_lock(&profile_mutex);
    
    // Find existing entry
    for (size_t i = 0; i < profile_count; i++) {
        if (strcmp(profile_entries[i].operation, operation) == 0) {
            profile_entries[i].total_time += elapsed;
            profile_entries[i].count++;
            pthread_mutex_unlock(&profile_mutex);
            return;
        }
    }
    
    // Add new entry
    if (profile_count >= profile_capacity) {
        size_t new_capacity = profile_capacity ? profile_capacity * 2 : 10;
        profile_entry *new_entries = realloc(profile_entries,
                                           new_capacity * sizeof(profile_entry));
        if (!new_entries) {
            pthread_mutex_unlock(&profile_mutex);
            return;
        }
        
        profile_entries = new_entries;
        profile_capacity = new_capacity;
    }
    
    profile_entries[profile_count].operation = strdup(operation);
    profile_entries[profile_count].total_time = elapsed;
    profile_entries[profile_count].count = 1;
    
    profile_count++;
    
    pthread_mutex_unlock(&profile_mutex);
}

// Print profiling results
void profile_print() {
    pthread_mutex_lock(&profile_mutex);
    
    printf("\nProfiling Results:\n");
    printf("%-30s %10s %10s %10s\n", "Operation", "Calls", "Total (s)", "Avg (ms)");
    
    for (size_t i = 0; i < profile_count; i++) {
        double avg = profile_entries[i].total_time / profile_entries[i].count * 1000;
        printf("%-30s %10zu %10.4f %10.4f\n",
               profile_entries[i].operation,
               profile_entries[i].count,
               profile_entries[i].total_time,
               avg);
    }
    
    pthread_mutex_unlock(&profile_mutex);
}

// Example usage in database code
int table_insert_row(table_t *table, const char **values) {
    struct timespec start, end;
    clock_gettime(CLOCK_MONOTONIC, &start);
    
    // Actual insert code...
    
    clock_gettime(CLOCK_MONOTONIC, &end);
    double elapsed = (end.tv_sec - start.tv_sec) +
                    (end.tv_nsec - start.tv_nsec) / 1000000000.0;
    
    profile_add("table_insert_row", elapsed);
    
    return 0;
}
```

### 14.9.3 Recovery Testing

Testing recovery procedures ensures your database can recover from failures without data loss.

**1. Simulating Crashes:**

```c
// Crash simulation helper
void simulate_crash(int probability) {
    // Randomly crash with given probability (1-100)
    if (rand() % 100 < probability) {
        printf("Simulating crash!\n");
        _exit(1); // Immediate exit without cleanup
    }
}

// Test crash during transaction
void test_crash_during_transaction() {
    database_t *db = database_create();
    assert(db != NULL);
    
    // Create table
    const char *columns[] = {"id", "value"};
    assert(database_create_table(db, "test", columns, 2) == 0);
    
    // Start transaction
    assert(mock_db_begin(db) == 0);
    
    // Insert data
    const char *row1[] = {"1", "value1"};
    assert(table_insert_row(db->tables[0], row1) == 0);
    
    // Simulate crash during transaction
    simulate_crash(100); // 100% chance to crash
    
    // This code won't execute if crash occurs
    assert(mock_db_commit(db) == 0);
    
    database_free(db);
}

// Test recovery after crash
void test_recovery_after_crash() {
    // First run: create database and crash during transaction
    {
        database_t *db = database_create();
        assert(db != NULL);
        
        // Create table
        const char *columns[] = {"id", "value"};
        assert(database_create_table(db, "test", columns, 2) == 0);
        
        // Start transaction
        assert(mock_db_begin(db) == 0);
        
        // Insert data
        const char *row1[] = {"1", "value1"};
        assert(table_insert_row(db->tables[0], row1) == 0);
        
        // Simulate crash
        printf("First run: crashing during transaction\n");
        simulate_crash(100);
        
        database_free(db);
    }
    
    // Second run: verify recovery
    {
        database_t *db = database_create();
        assert(db != NULL);
        
        // Verify table structure
        assert(db->num_tables == 1);
        assert(strcmp(db->tables[0]->name, "test") == 0);
        assert(db->tables[0]->num_columns == 2);
        
        // Verify no partial data
        assert(db->tables[0]->num_rows == 0);
        
        database_free(db);
    }
}
```

**2. Verifying Data Integrity:**

```c
// Calculate checksum for a table
unsigned long table_checksum(table_t *table) {
    unsigned long checksum = 5381;
    
    for (size_t i = 0; i < table->num_rows; i++) {
        for (size_t j = 0; j < table->num_columns; j++) {
            const char *str = table->rows[i][j].value;
            while (*str) {
                checksum = ((checksum << 5) + checksum) + *str++;
            }
        }
    }
    
    return checksum;
}

// Test data integrity after operations
void test_data_integrity() {
    database_t *db = database_create();
    assert(db != NULL);
    
    // Create table
    const char *columns[] = {"id", "name", "email"};
    assert(database_create_table(db, "users", columns, 3) == 0);
    
    // Insert data
    const char *row1[] = {"1", "John Doe", "john@example.com"};
    const char *row2[] = {"2", "Jane Smith", "jane@example.com"};
    assert(table_insert_row(db->tables[0], row1) == 0);
    assert(table_insert_row(db->tables[0], row2) == 0);
    
    // Calculate initial checksum
    unsigned long initial_checksum = table_checksum(db->tables[0]);
    
    // Perform operations
    // (In real test, would perform various operations)
    
    // Calculate final checksum
    unsigned long final_checksum = table_checksum(db->tables[0]);
    
    // Verify checksum hasn't changed unexpectedly
    assert(initial_checksum == final_checksum);
    
    database_free(db);
}

// Test recovery with checksum verification
void test_recovery_with_checksum() {
    unsigned long initial_checksum = 0;
    
    // First run: create data and calculate checksum
    {
        database_t *db = database_create();
        assert(db != NULL);
        
        // Create table
        const char *columns[] = {"id", "value"};
        assert(database_create_table(db, "test", columns, 2) == 0);
        
        // Insert data
        const char *row1[] = {"1", "value1"};
        const char *row2[] = {"2", "value2"};
        assert(table_insert_row(db->tables[0], row1) == 0);
        assert(table_insert_row(db->tables[0], row2) == 0);
        
        // Calculate checksum
        initial_checksum = table_checksum(db->tables[0]);
        
        // Simulate crash
        printf("First run: crashing after data insertion\n");
        simulate_crash(100);
        
        database_free(db);
    }
    
    // Second run: verify recovery and checksum
    {
        database_t *db = database_create();
        assert(db != NULL);
        
        // Verify table structure
        assert(db->num_tables == 1);
        
        // Verify data integrity
        unsigned long recovered_checksum = table_checksum(db->tables[0]);
        assert(initial_checksum == recovered_checksum);
        
        database_free(db);
    }
}
```

> **Critical Insight:** Testing database systems requires a different mindset than testing regular applications. While unit tests are important, they're not sufficient on their own. Effective database testing requires:
> *   **Stateful testing**: Verifying behavior across multiple operations
> *   **Failure injection**: Simulating crashes, network failures, and disk errors
> *   **Concurrency testing**: Checking behavior under simultaneous access
> *   **Long-running tests**: Identifying memory leaks and resource exhaustion
> *   **Realistic workloads**: Using data patterns that mirror production
> The most robust database systems are those that have been thoroughly tested under conditions that closely resemble real-world usage, including unexpected failures and edge cases that might rarely occur but could be catastrophic when they do.

## 14.10 Conclusion and Next Steps

Database systems are fundamental components of modern software applications, providing structured storage, retrieval, and management of data. This chapter has provided a comprehensive foundation for understanding and implementing database systems in C, covering everything from using embedded databases to building custom database engines and addressing advanced concerns like concurrency and security.

### 14.10.1 Summary of Key Concepts

Let's review the most critical concepts covered in this chapter:

**1. Database Fundamentals:**
*   Understanding different data models (relational, key-value, document, graph)
*   Core database operations (CRUD) and their implementation patterns
*   ACID properties and their importance for data integrity
*   Basic indexing concepts and their impact on query performance

**2. Embedded Database Libraries:**
*   SQLite for relational data with SQL support
*   Berkeley DB for high-performance key-value storage
*   LMDB for memory-mapped, read-optimized storage
*   Choosing the right embedded database for your specific needs

**3. Building from Scratch:**
*   Designing a simple key-value store with append-only log
*   Implementing indexing strategies (in-memory hash, on-disk hash, B-tree)
*   Adding transaction support with write-ahead logging
*   Implementing recovery and checkpointing mechanisms

**4. Working with External Databases:**
*   Connecting to relational databases using ODBC and native libraries
*   Executing parameterized queries to prevent SQL injection
*   Proper error handling and resource management patterns
*   Working with result sets and processing query results

**5. Performance Considerations:**
*   Indexing strategies for different query patterns
*   Memory management techniques (buffer pools, memory-mapped files)
*   Query optimization and execution plan analysis
*   Join algorithms and their performance characteristics

**6. Advanced Database Concepts:**
*   Concurrency control with locking and transaction isolation
*   Replication strategies for high availability
*   Security practices for authentication, authorization, and encryption
*   Testing and debugging database systems effectively

### 14.10.2 Practical Next Steps

To solidify your understanding and continue developing your database skills, consider these practical next steps:

**1. Build Small Projects:**
*   **Custom Configuration Store**: Implement a configuration store using a key-value database
*   **Simple Blog Engine**: Build a blog engine with SQLite for storage
*   **Caching Layer**: Create a caching layer with expiration and eviction policies
*   **Data Migration Tool**: Develop a tool to migrate data between different database formats

**2. Contribute to Open Source:**
*   Contribute to database libraries like SQLite or LMDB
*   Fix bugs in open source database applications
*   Implement new features for projects like Redis or LevelDB

**3. Deepen Your Database Knowledge:**
*   Implement a more advanced indexing strategy (e.g., LSM-tree)
*   Add support for secondary indexes to your custom database
*   Implement a query optimizer with cost-based planning
*   Add support for more SQL features to your simple database engine

**4. Explore Advanced Topics:**
*   **Distributed Databases**: Learn about consensus algorithms like Raft and Paxos
*   **Time-Series Databases**: Explore specialized storage for time-series data
*   **Graph Databases**: Implement basic graph operations and traversals
*   **Columnar Storage**: Learn about column-oriented storage for analytics workloads

**5. Practice Performance Tuning:**
*   Profile your database code to identify bottlenecks
*   Experiment with different indexing strategies for your workload
*   Measure the impact of buffer pool size on performance
*   Test different transaction isolation levels for your application

### 14.10.3 Resources for Continued Learning

To continue your journey in database systems, explore these resources:

**Books:**
*   *Database Internals: A Deep Dive into How Distributed Data Systems Work* by Alex Petrov
*   *Readings in Database Systems* (the "Red Book") by Joseph M. Hellerstein and Michael Stonebraker
*   *Transaction Processing: Concepts and Techniques* by Jim Gray and Andreas Reuter
*   *Designing Data-Intensive Applications* by Martin Kleppmann

**Online Resources:**
*   [SQLite Database Source Code](https://www.sqlite.org/src/)
*   [LMDB GitHub Repository](https://github.com/LMDB/lmdb)
*   [Berkeley DB Documentation](https://docs.oracle.com/cd/E17275_01/html/index.html)
*   [The Data Charmer Blog](https://www.datacharmer.org/) (MySQL-focused but with general database insights)

**Tools to Master:**
*   **Valgrind**: Memory debugging and profiling
*   **gprof**: Profiling tool for C applications
*   **strace/ltrace**: System call and library call tracing
*   **Wireshark**: Network protocol analysis (for client-server databases)

### 14.10.4 Final Thoughts

Database systems represent one of the most challenging yet rewarding areas of systems programming. The ability to efficiently store, retrieve, and manage data is fundamental to nearly all software applications, and understanding how databases work at a low level provides invaluable insight that can improve your overall software design skills.

As you continue to develop your database expertise, remember these key principles:

1.  **Understand Your Workload**: The best database design depends on your specific access patterns. Profile your application to understand what operations are most common and optimize for those.

2.  **Trade-offs Are Inevitable**: Every database decision involves trade-offs between performance, consistency, availability, and complexity. There's no perfect solution—only the best fit for your specific requirements.

3.  **Testing Is Critical**: Database bugs can lead to data corruption or loss, which are among the most severe issues in software. Invest heavily in testing, especially for recovery scenarios.

4.  **Start Simple**: Many applications can use existing database libraries effectively without needing custom implementations. Only build your own database when you have a specific need that existing solutions don't address.

5.  **Performance Is Multifaceted**: Database performance isn't just about raw speed—it's about predictable latency, resource efficiency, and scalability under load.

