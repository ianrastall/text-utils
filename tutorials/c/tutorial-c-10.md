# 10. Advanced Algorithms in C

## 10.1 Algorithm Analysis Fundamentals

### 10.1.1 Time and Space Complexity

Understanding algorithm efficiency is paramount to selecting the right approach for a given problem. While basic complexity analysis was covered in earlier chapters, advanced algorithm work requires deeper insight into performance characteristics and practical considerations that affect real-world implementations.

**Time Complexity** measures how the runtime of an algorithm grows as the input size increases. It's typically expressed using asymptotic notation (Big O, Omega, Theta) that describes the growth rate while ignoring constant factors and lower-order terms.

**Space Complexity** measures the amount of memory an algorithm uses relative to the input size. This includes both the input data and any additional space used during computation.

**Key Complexity Classes:**

| **Notation** | **Name**           | **Growth Rate**                     | **Example Algorithms**                   |
| :----------- | :----------------- | :---------------------------------- | :--------------------------------------- |
| **O(1)**     | **Constant**       | **Fixed time regardless of input**  | **Array access, hash table lookup**      |
| **O(log n)** | **Logarithmic**    | **Grows slowly with input size**    | **Binary search, balanced trees**        |
| **O(n)**     | **Linear**         | **Grows proportionally to input**   | **Linear search, list traversal**        |
| **O(n log n)** | **Linearithmic** | **Efficient sorting algorithms**    | **Merge sort, heap sort, FFT**           |
| **O(n²)**    | **Quadratic**      | **Grows with square of input**      | **Bubble sort, nested loops**            |
| **O(n³)**    | **Cubic**          | **Grows with cube of input**        | **Matrix multiplication**                |
| **O(2ⁿ)**    | **Exponential**    | **Rapid growth for small inputs**   | **Brute-force solutions, TSP**           |
| **O(n!)**    | **Factorial**      | **Extremely rapid growth**          | **Permutation generation**               |

**Practical Considerations Beyond Asymptotic Analysis:**
*   **Constant Factors:** An O(n) algorithm with large constants may be slower than O(n log n) for practical input sizes
*   **Memory Hierarchy Effects:** Cache misses can dominate runtime for large datasets
*   **Input Characteristics:** Real-world data often has patterns that affect performance
*   **Implementation Quality:** A well-implemented O(n²) algorithm may outperform a poorly implemented O(n log n) one

### 10.1.2 Amortized Analysis

Amortized analysis provides a more nuanced view of algorithm performance by averaging costs over a sequence of operations, rather than focusing on worst-case individual operations.

**Common Techniques:**
*   **Aggregate Method:** Calculate total cost of n operations, then divide by n
*   **Accounting Method:** Assign "credits" to operations to pay for expensive operations later
*   **Potential Method:** Define a potential function that measures the "prepaid work"

**Example: Dynamic Array Resizing**

```c
// Dynamic array implementation
typedef struct {
    int *data;
    size_t size;
    size_t capacity;
} DynamicArray;

void array_init(DynamicArray *arr, size_t initial_capacity) {
    arr->data = malloc(initial_capacity * sizeof(int));
    arr->size = 0;
    arr->capacity = initial_capacity;
}

void array_push(DynamicArray *arr, int value) {
    if (arr->size == arr->capacity) {
        // Double capacity when full
        size_t new_capacity = arr->capacity * 2;
        int *new_data = realloc(arr->data, new_capacity * sizeof(int));
        if (!new_data) {
            // Handle error
            return;
        }
        arr->data = new_data;
        arr->capacity = new_capacity;
    }
    arr->data[arr->size++] = value;
}
```

**Worst-Case vs. Amortized Analysis:**
*   **Worst-Case:** `array_push` is O(n) when resizing is needed
*   **Amortized:** Each `array_push` is O(1) when averaged over many operations

**Accounting Method Explanation:**
1.  Charge $2 for each insertion
2.  $1 pays for the insertion itself
3.  $1 is "saved" for future resizing
4.  When resizing occurs, use saved funds to pay for copying elements

**Why Amortized Analysis Matters:**
*   Provides realistic performance expectations for sequences of operations
*   Helps understand why certain data structures perform well in practice
*   Guides design decisions for data structures with occasional expensive operations

### 10.1.3 Practical Performance Measurement

Theoretical complexity provides guidance, but real-world performance requires empirical measurement.

**Benchmarking Best Practices:**
*   **Use Representative Data:** Test with inputs similar to production data
*   **Warm-up Runs:** Discard initial runs to account for cache effects
*   **Multiple Trials:** Run multiple times and take median or average
*   **Vary Input Sizes:** Measure performance across different scales
*   **Control Environment:** Minimize background processes during testing

**Example Benchmarking Code:**
```c
#include <time.h>
#include <stdio.h>

double benchmark(void (*func)(void *), void *arg, int trials) {
    // Warm-up
    func(arg);
    
    struct timespec start, end;
    double total_time = 0.0;
    
    for (int i = 0; i < trials; i++) {
        clock_gettime(CLOCK_MONOTONIC, &start);
        func(arg);
        clock_gettime(CLOCK_MONOTONIC, &end);
        
        double elapsed = (end.tv_sec - start.tv_sec) + 
                        (end.tv_nsec - start.tv_nsec) / 1e9;
        total_time += elapsed;
    }
    
    return total_time / trials;
}

// Example usage
void test_sort(void *arg) {
    int *array = (int *)arg;
    // Call sorting function on array
}

int main() {
    #define ARRAY_SIZE 10000
    #define TRIALS 10
    
    int *array = malloc(ARRAY_SIZE * sizeof(int));
    // Initialize array...
    
    double time = benchmark(test_sort, array, TRIALS);
    printf("Average time: %.6f seconds\n", time);
    
    free(array);
    return 0;
}
```

**Profiling Tools:**
*   **gprof:** Basic profiling for function call counts and timing
*   **perf:** Linux performance analysis tool with hardware counter support
*   **Valgrind (Callgrind):** Detailed call graph and cache simulation
*   **Intel VTune:** Advanced performance profiler for Intel processors

**Interpreting Results:**
*   **Identify Hotspots:** Focus optimization efforts on most time-consuming parts
*   **Understand Scaling:** Does performance follow expected complexity?
*   **Check for Anomalies:** Unexpected spikes may indicate cache issues or other problems
*   **Compare Implementations:** Quantify improvements from algorithmic changes

> **"Complexity analysis is the compass that guides algorithm selection, but empirical measurement is the map that reveals the actual terrain. A theoretically optimal algorithm may perform poorly in practice due to hidden constants, memory hierarchy effects, or input characteristics that deviate from assumptions. True mastery of algorithms requires both theoretical understanding and empirical validation."**

## 10.2 Sorting Algorithms

### 10.2.1 Advanced Comparison Sorts

While basic sorting algorithms (bubble sort, insertion sort) were covered in earlier chapters, this section explores more sophisticated comparison-based sorting techniques essential for handling large datasets efficiently.

#### Merge Sort

Merge sort is a divide-and-conquer algorithm with guaranteed O(n log n) performance.

**Key Characteristics:**
*   **Stable:** Preserves relative order of equal elements
*   **Not In-Place:** Requires O(n) additional space
*   **Consistent Performance:** Same time complexity for best, average, and worst cases
*   **Parallelizable:** Naturally suited for parallel implementation

**Implementation:**
```c
void merge(int arr[], int temp[], int left, int mid, int right) {
    int i = left;
    int j = mid + 1;
    int k = left;
    
    // Merge the two halves
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    
    // Copy remaining elements
    while (i <= mid) {
        temp[k++] = arr[i++];
    }
    while (j <= right) {
        temp[k++] = arr[j++];
    }
    
    // Copy back to original array
    for (i = left; i <= right; i++) {
        arr[i] = temp[i];
    }
}

void merge_sort_recursive(int arr[], int temp[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        merge_sort_recursive(arr, temp, left, mid);
        merge_sort_recursive(arr, temp, mid + 1, right);
        merge(arr, temp, left, mid, right);
    }
}

void merge_sort(int arr[], int n) {
    int *temp = malloc(n * sizeof(int));
    if (!temp) {
        // Handle allocation failure
        return;
    }
    
    merge_sort_recursive(arr, temp, 0, n - 1);
    free(temp);
}
```

**Optimizations:**
*   **Small Array Optimization:** Switch to insertion sort for small subarrays
*   **Natural Merge Sort:** Take advantage of existing order in the data
*   **In-Place Variants:** More complex but reduce space requirements
*   **Bottom-Up Approach:** Avoids recursion overhead

#### Heap Sort

Heap sort uses a binary heap data structure to achieve O(n log n) sorting.

**Key Characteristics:**
*   **In-Place:** Requires only O(1) additional space
*   **Not Stable:** Does not preserve order of equal elements
*   **Worst-Case O(n log n):** Unlike quicksort which can degrade to O(n²)
*   **Poor Cache Performance:** Random memory access patterns

**Implementation:**
```c
void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        // Swap
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        
        // Recursively heapify
        heapify(arr, n, largest);
    }
}

void heap_sort(int arr[], int n) {
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        
        // Call heapify on reduced heap
        heapify(arr, i, 0);
    }
}
```

**Optimizations:**
*   **Floyd's Heap Construction:** Builds heap in O(n) time
*   **Bottom-Up Heapify:** Reduces number of comparisons
*   **Adaptive Variants:** Take advantage of partially sorted data

#### Quick Sort Variants

While basic quicksort was covered earlier, advanced variants address its weaknesses.

**Median-of-Three Pivot Selection:**
```c
int median_of_three(int arr[], int left, int right) {
    int mid = left + (right - left) / 2;
    
    // Sort the three elements
    if (arr[left] > arr[mid]) {
        int temp = arr[left]; arr[left] = arr[mid]; arr[mid] = temp;
    }
    if (arr[left] > arr[right]) {
        int temp = arr[left]; arr[left] = arr[right]; arr[right] = temp;
    }
    if (arr[mid] > arr[right]) {
        int temp = arr[mid]; arr[mid] = arr[right]; arr[right] = temp;
    }
    
    // Place pivot at right-1
    int temp = arr[mid]; arr[mid] = arr[right-1]; arr[right-1] = temp;
    return arr[right-1];
}

void quick_sort_optimized(int arr[], int left, int right) {
    if (left >= right) return;
    
    // Use median-of-three for pivot
    int pivot = median_of_three(arr, left, right);
    
    int i = left;
    int j = right - 1;
    
    while (1) {
        while (arr[++i] < pivot) {}
        while (arr[--j] > pivot) {}
        if (i >= j) break;
        
        // Swap
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    // Restore pivot
    int temp = arr[i];
    arr[i] = arr[right-1];
    arr[right-1] = temp;
    
    // Sort subarrays
    quick_sort_optimized(arr, left, i - 1);
    quick_sort_optimized(arr, i + 1, right);
}
```

**Tail Recursion Elimination:**
```c
void quick_sort_tailrec(int arr[], int left, int right) {
    while (left < right) {
        int pivot_index = partition(arr, left, right);
        
        // Recursively sort smaller subarray
        if (pivot_index - left < right - pivot_index) {
            quick_sort_tailrec(arr, left, pivot_index - 1);
            left = pivot_index + 1;
        } else {
            quick_sort_tailrec(arr, pivot_index + 1, right);
            right = pivot_index - 1;
        }
    }
}
```

**IntroSort (Hybrid Algorithm):**
Combines quicksort, heapsort, and insertion sort:
1.  Start with quicksort
2.  Switch to heapsort if recursion depth exceeds threshold (to guarantee O(n log n))
3.  Use insertion sort for small subarrays

### 10.2.2 Non-Comparison Sorts

Non-comparison sorts can achieve better than O(n log n) performance under specific conditions by exploiting properties of the data.

#### Counting Sort

Counting sort works well when the range of possible values (k) is not significantly larger than the number of elements (n).

**Key Characteristics:**
*   **Time Complexity:** O(n + k)
*   **Space Complexity:** O(n + k)
*   **Stable:** Preserves order of equal elements
*   **Not In-Place:** Requires additional space

**Implementation:**
```c
void counting_sort(int arr[], int n, int max_value) {
    int *count = calloc(max_value + 1, sizeof(int));
    int *output = malloc(n * sizeof(int));
    
    if (!count || !output) {
        // Handle allocation failure
        free(count);
        free(output);
        return;
    }
    
    // Count occurrences
    for (int i = 0; i < n; i++) {
        count[arr[i]]++;
    }
    
    // Cumulative count
    for (int i = 1; i <= max_value; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array (stable)
    for (int i = n - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    
    // Copy back to original array
    for (int i = 0; i < n; i++) {
        arr[i] = output[i];
    }
    
    free(count);
    free(output);
}
```

**Optimizations and Variations:**
*   **Negative Value Support:** Shift values to make them non-negative
*   **In-Place Variants:** More complex but reduce space requirements
*   **Counting Sort for Objects:** Sort objects based on integer keys

#### Radix Sort

Radix sort processes digits from least significant to most significant (LSD) or vice versa (MSD).

**Key Characteristics:**
*   **Time Complexity:** O(d(n + k)) where d = digits, k = radix
*   **Space Complexity:** O(n + k)
*   **Stable:** When using a stable sub-sort (like counting sort)
*   **Works on Integers/Fixed-Length Strings**

**Implementation (LSD Radix Sort):**
```c
void counting_sort_by_digit(int arr[], int n, int exp) {
    int *output = malloc(n * sizeof(int));
    int count[10] = {0};
    
    // Count occurrences of each digit
    for (int i = 0; i < n; i++) {
        int digit = (arr[i] / exp) % 10;
        count[digit]++;
    }
    
    // Cumulative count
    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    // Copy back
    for (int i = 0; i < n; i++) {
        arr[i] = output[i];
    }
    
    free(output);
}

void radix_sort(int arr[], int n) {
    // Find maximum to know number of digits
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    
    // Do counting sort for every digit
    for (int exp = 1; max / exp > 0; exp *= 10) {
        counting_sort_by_digit(arr, n, exp);
    }
}
```

**Variations:**
*   **MSD Radix Sort:** Processes most significant digit first, better for variable-length data
*   **Binary Radix Sort:** Uses binary representation, efficient for binary data
*   **In-Place Radix Sort:** More complex but reduces memory overhead

#### Bucket Sort

Bucket sort distributes elements into buckets, sorts each bucket, and concatenates results.

**Key Characteristics:**
*   **Time Complexity:** O(n) average case with uniform distribution
*   **Space Complexity:** O(n + k) where k = number of buckets
*   **Depends on Input Distribution:** Performance varies with data distribution
*   **Works Well with Uniformly Distributed Data**

**Implementation:**
```c
void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

void bucket_sort(float arr[], int n) {
    // Create buckets
    struct {
        float *values;
        int count;
        int capacity;
    } *buckets = malloc(n * sizeof(*buckets));
    
    if (!buckets) return;
    
    // Initialize buckets
    for (int i = 0; i < n; i++) {
        buckets[i].count = 0;
        buckets[i].capacity = 10; // Initial capacity
        buckets[i].values = malloc(buckets[i].capacity * sizeof(float));
        if (!buckets[i].values) {
            // Handle error
            return;
        }
    }
    
    // Distribute elements into buckets
    for (int i = 0; i < n; i++) {
        int bucket_idx = (int)(n * arr[i]);
        
        // Ensure bucket has space
        if (buckets[bucket_idx].count == buckets[bucket_idx].capacity) {
            buckets[bucket_idx].capacity *= 2;
            float *new_values = realloc(buckets[bucket_idx].values,
                                      buckets[bucket_idx].capacity * sizeof(float));
            if (!new_values) {
                // Handle error
                return;
            }
            buckets[bucket_idx].values = new_values;
        }
        
        buckets[bucket_idx].values[buckets[bucket_idx].count++] = arr[i];
    }
    
    // Sort individual buckets
    int index = 0;
    for (int i = 0; i < n; i++) {
        insertion_sort(buckets[i].values, buckets[i].count);
        for (int j = 0; j < buckets[i].count; j++) {
            arr[index++] = buckets[i].values[j];
        }
        free(buckets[i].values);
    }
    
    free(buckets);
}
```

**Optimizations:**
*   **Dynamic Bucket Sizing:** Adjust bucket sizes based on data distribution
*   **Recursive Bucket Sort:** Apply bucket sort recursively to buckets
*   **Histogram Sort:** Pre-compute bucket sizes for better memory allocation

### 10.2.3 External Sorting

External sorting handles datasets too large to fit in memory by using disk storage.

**Key Challenges:**
*   **I/O Operations are Expensive:** Minimize disk access
*   **Limited Memory Buffer:** Work with small amount of RAM
*   **Sequential Access Preferred:** Random disk access is slow

**Merge Sort Based Approach:**
1.  Divide input into chunks that fit in memory
2.  Sort each chunk in memory
3.  Write sorted chunks to temporary files
4.  Merge the sorted chunks

**Implementation:**
```c
#include <stdio.h>

#define BUFFER_SIZE 1000  // Memory buffer size

// Sort a chunk of data in memory
void sort_chunk(int *buffer, int size) {
    // Use any efficient in-memory sort (e.g., quicksort)
    // For simplicity, we'll use a basic insertion sort
    for (int i = 1; i < size; i++) {
        int key = buffer[i];
        int j = i - 1;
        
        while (j >= 0 && buffer[j] > key) {
            buffer[j + 1] = buffer[j];
            j--;
        }
        buffer[j + 1] = key;
    }
}

// Merge k sorted files into one output file
void merge_files(FILE **files, int num_files, FILE *output) {
    int *buffers = malloc(num_files * sizeof(int));
    int *has_data = calloc(num_files, sizeof(int));
    
    if (!buffers || !has_data) {
        // Handle allocation failure
        free(buffers);
        free(has_data);
        return;
    }
    
    // Read first element from each file
    for (int i = 0; i < num_files; i++) {
        if (fscanf(files[i], "%d", &buffers[i]) == 1) {
            has_data[i] = 1;
        }
    }
    
    // Merge loop
    while (1) {
        // Find smallest element
        int min_idx = -1;
        for (int i = 0; i < num_files; i++) {
            if (has_data[i] && (min_idx == -1 || buffers[i] < buffers[min_idx])) {
                min_idx = i;
            }
        }
        
        if (min_idx == -1) break; // No more data
        
        // Write to output
        fprintf(output, "%d\n", buffers[min_idx]);
        
        // Read next element from this file
        if (fscanf(files[min_idx], "%d", &buffers[min_idx]) != 1) {
            has_data[min_idx] = 0;
        }
    }
    
    free(buffers);
    free(has_data);
}

void external_sort(const char *input_file, const char *output_file) {
    FILE *input = fopen(input_file, "r");
    if (!input) {
        // Handle error
        return;
    }
    
    // Phase 1: Create sorted chunks
    char chunk_files[100][256];
    int num_chunks = 0;
    int buffer[BUFFER_SIZE];
    
    while (1) {
        // Read chunk
        int count = 0;
        while (count < BUFFER_SIZE && fscanf(input, "%d", &buffer[count]) == 1) {
            count++;
        }
        
        if (count == 0) break; // No more data
        
        // Sort chunk
        sort_chunk(buffer, count);
        
        // Write to temporary file
        snprintf(chunk_files[num_chunks], 256, "chunk_%d.tmp", num_chunks);
        FILE *chunk = fopen(chunk_files[num_chunks], "w");
        if (!chunk) {
            // Handle error
            fclose(input);
            return;
        }
        
        for (int i = 0; i < count; i++) {
            fprintf(chunk, "%d\n", buffer[i]);
        }
        
        fclose(chunk);
        num_chunks++;
    }
    
    fclose(input);
    
    // Phase 2: Merge chunks
    FILE *output = fopen(output_file, "w");
    if (!output) {
        // Handle error
        return;
    }
    
    FILE **chunk_handles = malloc(num_chunks * sizeof(FILE *));
    if (!chunk_handles) {
        // Handle error
        fclose(output);
        return;
    }
    
    // Open all chunk files
    for (int i = 0; i < num_chunks; i++) {
        chunk_handles[i] = fopen(chunk_files[i], "r");
        if (!chunk_handles[i]) {
            // Handle error
            for (int j = 0; j < i; j++) {
                fclose(chunk_handles[j]);
            }
            free(chunk_handles);
            fclose(output);
            return;
        }
    }
    
    // Merge the chunks
    merge_files(chunk_handles, num_chunks, output);
    
    // Cleanup
    for (int i = 0; i < num_chunks; i++) {
        fclose(chunk_handles[i]);
        remove(chunk_files[i]);
    }
    free(chunk_handles);
    fclose(output);
}
```

**Optimizations:**
*   **Replacement Selection:** Creates longer sorted runs by using a priority queue
*   **Polyphase Merge:** Uses an uneven distribution of runs for more efficient merging
*   **Cache-Aware Merging:** Optimizes buffer sizes for memory hierarchy

## 10.3 Searching Algorithms

### 10.3.1 Advanced Search Techniques

#### Binary Search Variants

Standard binary search has O(log n) complexity, but variations address specific needs.

**Fractional Cascading:**
When searching for the same value in multiple sorted arrays.

```c
// Preprocessing step
void preprocess_fractional_cascading(int *arrays[], int sizes[], 
                                   int num_arrays, int **pointers) {
    // Create a merged array with pointers to original arrays
    // This is a simplified example
    int total_size = 0;
    for (int i = 0; i < num_arrays; i++) {
        total_size += sizes[i];
    }
    
    int *merged = malloc(total_size * sizeof(int));
    int *array_idx = malloc(total_size * sizeof(int));
    int *element_idx = malloc(total_size * sizeof(int));
    
    int pos = 0;
    for (int i = 0; i < num_arrays; i++) {
        for (int j = 0; j < sizes[i]; j++) {
            merged[pos] = arrays[i][j];
            array_idx[pos] = i;
            element_idx[pos] = j;
            pos++;
        }
    }
    
    // Sort the merged array while maintaining array/element indices
    // (simplified - in practice would use a stable sort)
    
    // Store pointers for each array element to corresponding positions in merged array
    for (int i = 0; i < num_arrays; i++) {
        pointers[i] = malloc(sizes[i] * sizeof(int));
        for (int j = 0; j < sizes[i]; j++) {
            // Find position in merged array
            // In practice would use binary search
            pointers[i][j] = /* position */;
        }
    }
    
    free(merged);
    free(array_idx);
    free(element_idx);
}

// Search operation
int *fractional_cascading_search(int *arrays[], int sizes[], 
                               int num_arrays, int **pointers, int value) {
    static int results[100]; // Assuming max 100 arrays
    
    // Search in first array
    int pos = binary_search(arrays[0], sizes[0], value);
    results[0] = pos;
    
    // Use pointer to find approximate position in next array
    for (int i = 1; i < num_arrays; i++) {
        int approx_pos = pointers[i-1][results[i-1]];
        // Search in a small neighborhood around approx_pos
        int start = (approx_pos > 10) ? approx_pos - 10 : 0;
        int end = (approx_pos < sizes[i] - 10) ? approx_pos + 10 : sizes[i] - 1;
        results[i] = binary_search_range(arrays[i], start, end, value);
    }
    
    return results;
}
```

**Exponential Search:**
Combines binary search with exponential probing for unbounded or infinite lists.

```c
int exponential_search(int arr[], int n, int target) {
    // If target is at first position
    if (arr[0] == target) {
        return 0;
    }
    
    // Find range for binary search
    int i = 1;
    while (i < n && arr[i] <= target) {
        i *= 2;
    }
    
    // Perform binary search in found range
    int low = i / 2;
    int high = (i < n) ? i : n - 1;
    
    return binary_search_range(arr, low, high, target);
}
```

**Advantages:**
*   **Faster for elements near beginning** of the array
*   **Works with unbounded arrays** (like linked lists)
*   **O(log i) complexity** where i is the position of the target

#### Interpolation Search

Interpolation search estimates the position of the target value based on the distribution of values.

```c
int interpolation_search(int arr[], int n, int target) {
    int low = 0;
    int high = n - 1;
    
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        // Calculate probable position
        int pos = low + ((double)(high - low) / 
                 (arr[high] - arr[low])) * (target - arr[low]);
        
        // Target found
        if (arr[pos] == target) {
            return pos;
        }
        
        // Adjust search range
        if (arr[pos] < target) {
            low = pos + 1;
        } else {
            high = pos - 1;
        }
    }
    
    return -1; // Not found
}
```

**Performance Characteristics:**
*   **Average Case:** O(log log n) for uniformly distributed data
*   **Worst Case:** O(n) for non-uniform distributions
*   **Best For:** Large, uniformly distributed datasets

**Comparison of Search Algorithms:**

| **Algorithm**         | **Time Complexity** | **Best For**                          | **Requirements**              |
| :-------------------- | :------------------ | :------------------------------------ | :---------------------------- |
| **Linear Search**     | **O(n)**            | **Small arrays, unsorted data**       | **None**                      |
| **Binary Search**     | **O(log n)**        | **General sorted arrays**             | **Sorted array**              |
| **Interpolation Search** | **O(log log n)**  | **Large uniform sorted arrays**       | **Sorted, uniform data**      |
| **Exponential Search** | **O(log i)**      | **Elements near beginning**           | **Sorted array**              |
| **Hash Table**        | **O(1) average**    | **Fast lookups with memory to spare** | **Good hash function**        |

### 10.3.2 String Searching Algorithms

#### Knuth-Morris-Pratt (KMP) Algorithm

KMP avoids unnecessary character comparisons by using information from previous matches.

**Key Insight:** When a mismatch occurs, use the information about the pattern to determine where the next match could begin, avoiding re-examination of previously matched characters.

**Prefix Function (LPS - Longest Prefix Suffix):**
```c
void compute_lps(char *pattern, int m, int *lps) {
    int len = 0; // Length of previous longest prefix suffix
    lps[0] = 0;  // LPS[0] is always 0
    
    int i = 1;
    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
}
```

**KMP Search Implementation:**
```c
void kmp_search(char *text, char *pattern) {
    int n = strlen(text);
    int m = strlen(pattern);
    
    int *lps = malloc(m * sizeof(int));
    if (!lps) return;
    
    compute_lps(pattern, m, lps);
    
    int i = 0; // Index for text
    int j = 0; // Index for pattern
    
    while (i < n) {
        if (pattern[j] == text[i]) {
            i++;
            j++;
        }
        
        if (j == m) {
            printf("Found pattern at index %d\n", i - j);
            j = lps[j - 1];
        } else if (i < n && pattern[j] != text[i]) {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    free(lps);
}
```

**Time Complexity:**
*   **Preprocessing:** O(m)
*   **Searching:** O(n)
*   **Overall:** O(m + n)

#### Rabin-Karp Algorithm

Rabin-Karp uses hashing to find patterns in text, with the ability to check multiple patterns simultaneously.

**Key Insight:** Compute hash values for the pattern and each substring of the text, only comparing characters when hash values match.

**Implementation:**
```c
#define BASE 256
#define PRIME 101

void rabin_karp_search(char *text, char *pattern) {
    int n = strlen(text);
    int m = strlen(pattern);
    
    // Calculate hash value for pattern and first window of text
    int pattern_hash = 0;
    int text_hash = 0;
    int h = 1; // BASE^(m-1) % PRIME
    
    // Calculate BASE^(m-1) % PRIME
    for (int i = 0; i < m - 1; i++) {
        h = (h * BASE) % PRIME;
    }
    
    // Calculate initial hash values
    for (int i = 0; i < m; i++) {
        pattern_hash = (BASE * pattern_hash + pattern[i]) % PRIME;
        text_hash = (BASE * text_hash + text[i]) % PRIME;
    }
    
    // Slide pattern over text
    for (int i = 0; i <= n - m; i++) {
        // Check if hash values match
        if (pattern_hash == text_hash) {
            // Check character by character
            int j;
            for (j = 0; j < m; j++) {
                if (text[i + j] != pattern[j]) {
                    break;
                }
            }
            
            if (j == m) {
                printf("Found pattern at index %d\n", i);
            }
        }
        
        // Calculate hash for next window
        if (i < n - m) {
            text_hash = (BASE * (text_hash - text[i] * h) + text[i + m]) % PRIME;
            
            // Handle negative values
            if (text_hash < 0) {
                text_hash += PRIME;
            }
        }
    }
}
```

**Time Complexity:**
*   **Average Case:** O(n + m)
*   **Worst Case:** O(nm) (with many hash collisions)
*   **Multiple Pattern Search:** O(n + m*k) where k = number of patterns

#### Boyer-Moore Algorithm

Boyer-Moore skips sections of the text by using two heuristics: bad character and good suffix.

**Bad Character Heuristic:**
```c
void bad_char_heuristic(char *pattern, int m, int badchar[256]) {
    // Initialize all occurrences as -1
    for (int i = 0; i < 256; i++) {
        badchar[i] = -1;
    }
    
    // Fill actual values
    for (int i = 0; i < m; i++) {
        badchar[(int)pattern[i]] = i;
    }
}
```

**Good Suffix Heuristic:**
```c
void good_suffix_heuristic(char *pattern, int m, int *gsuffix) {
    // Initialize all values to 0
    for (int i = 0; i <= m; i++) {
        gsuffix[i] = 0;
    }
    
    // Compute suffix lengths
    int *suffix = malloc((m + 1) * sizeof(int));
    if (!suffix) return;
    
    compute_suffix(pattern, m, suffix);
    
    // Case 1: Matched suffix appears elsewhere in pattern
    for (int i = 0; i < m; i++) {
        gsuffix[m - 1 - suffix[i]] = m - 1 - i;
    }
    
    // Case 2: Prefix matches suffix
    for (int i = 0; i < m - 1; i++) {
        if (suffix[i] == i + 1) {
            for (int j = 0; j < m - 1 - i; j++) {
                if (gsuffix[j] == 0) {
                    gsuffix[j] = m - 1 - i;
                }
            }
        }
    }
    
    free(suffix);
}
```

**Boyer-Moore Search:**
```c
void boyer_moore_search(char *text, char *pattern) {
    int n = strlen(text);
    int m = strlen(pattern);
    
    int badchar[256];
    bad_char_heuristic(pattern, m, badchar);
    
    int *gsuffix = malloc((m + 1) * sizeof(int));
    if (!gsuffix) return;
    
    good_suffix_heuristic(pattern, m, gsuffix);
    
    int s = 0; // Shift of pattern
    while (s <= n - m) {
        int j = m - 1;
        
        // Keep reducing index while characters match
        while (j >= 0 && pattern[j] == text[s + j]) {
            j--;
        }
        
        if (j < 0) {
            printf("Found pattern at index %d\n", s);
            s += (s + m < n) ? m - gsuffix[0] : 1;
        } else {
            // Max of bad character and good suffix shifts
            int bad_shift = j - badchar[(int)text[s + j]];
            int good_shift = gsuffix[j];
            
            s += (bad_shift > good_shift) ? bad_shift : good_shift;
        }
    }
    
    free(gsuffix);
}
```

**Performance Characteristics:**
*   **Preprocessing:** O(m)
*   **Searching:** O(n) average case, O(nm) worst case
*   **Best For:** Large alphabets and long patterns
*   **Often Sublinear:** Can skip characters, examining fewer than n characters

## 10.4 Graph Algorithms

### 10.4.1 Shortest Path Algorithms

#### Dijkstra's Algorithm

Dijkstra's algorithm finds the shortest paths from a single source to all other vertices in a graph with non-negative edge weights.

**Key Characteristics:**
*   **Time Complexity:** O((V + E) log V) with binary heap
*   **Space Complexity:** O(V + E)
*   **Cannot Handle Negative Weights**
*   **Greedy Approach**

**Implementation with Binary Heap:**
```c
#include <limits.h>
#include <stdbool.h>

typedef struct {
    int vertex;
    int distance;
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
void decrease_key(MinHeap *min_heap, int v, int new_distance);
int is_in_min_heap(MinHeap *min_heap, int v);

// Dijkstra's algorithm
void dijkstra(Graph *graph, int src) {
    int V = graph->num_vertices;
    int dist[V];      // Shortest distances
    int parent[V];    // Parent array for path reconstruction
    
    // Create min heap
    MinHeap *min_heap = create_min_heap(V);
    if (!min_heap) return;
    
    // Initialize min heap with all vertices
    for (int v = 0; v < V; v++) {
        dist[v] = INT_MAX;
        min_heap->array[v] = new_min_heap_node(v, dist[v]);
        min_heap->pos[v] = v;
    }
    
    // Decrease distance of src to 0
    dist[src] = 0;
    decrease_key(min_heap, src, dist[src]);
    
    // Process all vertices
    while (!is_empty(min_heap)) {
        // Extract vertex with minimum distance
        MinHeapNode *min_heap_node = extract_min(min_heap);
        int u = min_heap_node->vertex;
        
        // Update distances of adjacent vertices
        AdjListNode *p = graph->array[u].head;
        while (p != NULL) {
            int v = p->dest;
            
            // If shortest distance to v is not final and distance to v through u is shorter
            if (is_in_min_heap(min_heap, v) && 
                dist[u] != INT_MAX && 
                p->weight + dist[u] < dist[v]) {
                
                dist[v] = dist[u] + p->weight;
                parent[v] = u;
                decrease_key(min_heap, v, dist[v]);
            }
            
            p = p->next;
        }
    }
    
    // Print shortest distances
    print_solution(dist, parent, V);
    
    // Cleanup
    free_min_heap(min_heap);
}
```

**Optimizations:**
*   **Fibonacci Heap:** Reduces time complexity to O(E + V log V)
*   **Bidirectional Search:** Search from both source and destination
*   **A* Algorithm:** Use heuristics for goal-directed search
*   **Contraction Hierarchies:** Preprocessing for road networks

#### Bellman-Ford Algorithm

Bellman-Ford handles graphs with negative edge weights and detects negative cycles.

**Key Characteristics:**
*   **Time Complexity:** O(VE)
*   **Space Complexity:** O(V)
*   **Can Handle Negative Weights**
*   **Detects Negative Cycles**

**Implementation:**
```c
bool bellman_ford(Graph *graph, int src) {
    int V = graph->num_vertices;
    int E = graph->num_edges;
    int dist[V];
    
    // Initialize distances
    for (int i = 0; i < V; i++) {
        dist[i] = INT_MAX;
    }
    dist[src] = 0;
    
    // Relax all edges |V| - 1 times
    for (int i = 0; i < V - 1; i++) {
        for (int j = 0; j < E; j++) {
            int u = graph->edge[j].src;
            int v = graph->edge[j].dest;
            int weight = graph->edge[j].weight;
            
            if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
            }
        }
    }
    
    // Check for negative weight cycles
    for (int i = 0; i < E; i++) {
        int u = graph->edge[i].src;
        int v = graph->edge[i].dest;
        int weight = graph->edge[i].weight;
        
        if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
            return false; // Negative cycle detected
        }
    }
    
    // Print shortest distances
    print_solution(dist, V);
    return true; // No negative cycle
}
```

**Applications:**
*   **Currency Arbitrage:** Finding profitable currency exchange cycles
*   **Network Routing:** Some routing protocols use Bellman-Ford variants
*   **Constraint Satisfaction Problems:** Solving difference constraints

#### Floyd-Warshall Algorithm

Floyd-Warshall finds shortest paths between all pairs of vertices.

**Key Characteristics:**
*   **Time Complexity:** O(V³)
*   **Space Complexity:** O(V²)
*   **Can Handle Negative Weights (but not negative cycles)**
*   **Dynamic Programming Approach**

**Implementation:**
```c
void floyd_warshall(int graph[][V], int dist[][V], int next[][V]) {
    // Initialize distance and next matrices
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            dist[i][j] = graph[i][j];
            if (graph[i][j] != INF && i != j) {
                next[i][j] = j;
            } else {
                next[i][j] = -1;
            }
        }
    }
    
    // Main algorithm
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] != INF && 
                    dist[k][j] != INF && 
                    dist[i][k] + dist[k][j] < dist[i][j]) {
                    
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }
    
    // Check for negative cycles
    for (int i = 0; i < V; i++) {
        if (dist[i][i] < 0) {
            printf("Negative cycle detected from %d to %d\n", i, i);
        }
    }
}
```

**Path Reconstruction:**
```c
void print_path(int next[][V], int u, int v) {
    if (next[u][v] == -1) {
        return;
    }
    
    printf("Path from %d to %d: %d", u, v, u);
    while (u != v) {
        u = next[u][v];
        printf(" -> %d", u);
    }
    printf("\n");
}
```

**Applications:**
*   **Network Routing:** All-pairs shortest paths for routing tables
*   **Transitive Closure:** Determining reachability between nodes
*   **Finding Regular Expressions:** For finite automata
*   **Optimal Routing in Transportation Networks**

### 10.4.2 Minimum Spanning Tree Algorithms

#### Prim's Algorithm

Prim's algorithm grows a minimum spanning tree from a single vertex.

**Key Characteristics:**
*   **Time Complexity:** O(E log V) with binary heap
*   **Space Complexity:** O(V + E)
*   **Similar to Dijkstra's** but with different key update rule
*   **Greedy Approach**

**Implementation:**
```c
void prim_mst(Graph *graph, int start_vertex) {
    int V = graph->num_vertices;
    int parent[V]; // MST parent array
    int key[V];    // Key values for min-key selection
    bool mst_set[V]; // Set of vertices in MST
    
    // Initialize all keys as infinite
    for (int i = 0; i < V; i++) {
        key[i] = INT_MAX;
        mst_set[i] = false;
    }
    
    // Start with first vertex
    key[start_vertex] = 0;
    parent[start_vertex] = -1;
    
    // Create min heap
    MinHeap *min_heap = create_min_heap(V);
    if (!min_heap) return;
    
    // Initialize min heap with all vertices
    for (int v = 0; v < V; v++) {
        min_heap->array[v] = new_min_heap_node(v, key[v]);
        min_heap->pos[v] = v;
    }
    
    // MST has V-1 edges
    for (int count = 0; count < V - 1; count++) {
        // Extract vertex with minimum key
        MinHeapNode *min_heap_node = extract_min(min_heap);
        int u = min_heap_node->vertex;
        mst_set[u] = true;
        
        // Update key values of adjacent vertices
        AdjListNode *p = graph->array[u].head;
        while (p != NULL) {
            int v = p->dest;
            
            // If v not in MST and weight(u,v) < key[v]
            if (mst_set[v] == false && p->weight < key[v]) {
                key[v] = p->weight;
                parent[v] = u;
                decrease_key(min_heap, v, key[v]);
            }
            
            p = p->next;
        }
    }
    
    // Print MST
    print_mst(parent, graph);
    
    free_min_heap(min_heap);
}
```

#### Kruskal's Algorithm

Kruskal's algorithm builds the MST by adding edges in increasing order of weight.

**Key Characteristics:**
*   **Time Complexity:** O(E log E) or O(E log V)
*   **Space Complexity:** O(V + E)
*   **Uses Union-Find data structure**
*   **Works well for sparse graphs**

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

int compare_edges(const void *a, const void *b) {
    Edge *a_edge = (Edge *)a;
    Edge *b_edge = (Edge *)b;
    return a_edge->weight - b_edge->weight;
}

void kruskal_mst(Graph *graph) {
    int V = graph->num_vertices;
    Edge result[V]; // Store MST
    int e = 0;      // Index for result[]
    int i = 0;      // Index for sorted edges
    
    // Sort all edges by weight
    qsort(graph->edge, graph->num_edges, sizeof(graph->edge[0]), compare_edges);
    
    // Allocate memory for subsets
    Subset *subsets = malloc(V * sizeof(Subset));
    if (!subsets) return;
    
    // Create V subsets with single elements
    for (int v = 0; v < V; v++) {
        subsets[v].parent = v;
        subsets[v].rank = 0;
    }
    
    // MST has V-1 edges
    while (e < V - 1 && i < graph->num_edges) {
        Edge next_edge = graph->edge[i++];
        
        int x = find(subsets, next_edge.src);
        int y = find(subsets, next_edge.dest);
        
        // If including this edge doesn't cause cycle
        if (x != y) {
            result[e++] = next_edge;
            union_sets(subsets, x, y);
        }
    }
    
    // Print MST
    print_mst(result, e);
    
    free(subsets);
}
```

**Comparison of MST Algorithms:**

| **Algorithm** | **Time Complexity** | **Best For**                          | **Implementation Complexity** |
| :------------ | :------------------ | :------------------------------------ | :---------------------------- |
| **Prim's**    | **O(E log V)**      | **Dense graphs**                      | **Moderate**                  |
| **Kruskal's** | **O(E log E)**      | **Sparse graphs, disjoint sets**      | **Higher (needs Union-Find)** |

### 10.4.3 Advanced Graph Algorithms

#### Topological Sorting

Topological sorting orders vertices in a directed acyclic graph (DAG) such that for every directed edge u→v, u comes before v.

**Key Characteristics:**
*   **Time Complexity:** O(V + E)
*   **Space Complexity:** O(V)
*   **Only Works on DAGs**
*   **Multiple Valid Orderings Possible**

**Kahn's Algorithm (Indegree-based):**
```c
void topological_sort(Graph *graph) {
    int V = graph->num_vertices;
    int *in_degree = calloc(V, sizeof(int));
    
    if (!in_degree) return;
    
    // Calculate in-degree of each vertex
    for (int v = 0; v < V; v++) {
        AdjListNode *node = graph->array[v].head;
        while (node) {
            in_degree[node->dest]++;
            node = node->next;
        }
    }
    
    // Queue for vertices with in-degree 0
    Queue queue;
    queue_init(&queue, V);
    
    // Add all vertices with in-degree 0
    for (int v = 0; v < V; v++) {
        if (in_degree[v] == 0) {
            queue_enqueue(&queue, v);
        }
    }
    
    int count = 0;  // Count of visited vertices
    int *top_order = malloc(V * sizeof(int));
    
    if (!top_order) {
        free(in_degree);
        return;
    }
    
    // Process vertices
    while (!queue_is_empty(&queue)) {
        int u = queue_dequeue(&queue);
        top_order[count++] = u;
        
        // Update in-degrees of adjacent vertices
        AdjListNode *node = graph->array[u].head;
        while (node) {
            if (--in_degree[node->dest] == 0) {
                queue_enqueue(&queue, node->dest);
            }
            node = node->next;
        }
    }
    
    // Check if there was a cycle
    if (count != V) {
        printf("Graph has a cycle\n");
    } else {
        // Print topological order
        for (int i = 0; i < V; i++) {
            printf("%d ", top_order[i]);
        }
        printf("\n");
    }
    
    free(in_degree);
    free(top_order);
    queue_destroy(&queue);
}
```

**DFS-Based Approach:**
```c
void topological_sort_dfs(Graph *graph, int v, bool visited[], Stack *stack) {
    visited[v] = true;
    
    // Recur for all adjacent vertices
    AdjListNode *node = graph->array[v].head;
    while (node) {
        if (!visited[node->dest]) {
            topological_sort_dfs(graph, node->dest, visited, stack);
        }
        node = node->next;
    }
    
    // Push current vertex to stack
    stack_push(stack, v);
}

void topological_sort(Graph *graph) {
    int V = graph->num_vertices;
    bool *visited = calloc(V, sizeof(bool));
    Stack stack;
    
    if (!visited) return;
    
    stack_init(&stack, V);
    
    // Call DFS for all unvisited vertices
    for (int i = 0; i < V; i++) {
        if (!visited[i]) {
            topological_sort_dfs(graph, i, visited, &stack);
        }
    }
    
    // Print contents of stack
    while (!stack_is_empty(&stack)) {
        printf("%d ", stack_pop(&stack));
    }
    printf("\n");
    
    free(visited);
    stack_destroy(&stack);
}
```

**Applications:**
*   **Task Scheduling:** With dependencies between tasks
*   **Build Systems:** Determining compilation order
*   **Course Prerequisites:** Planning course sequences
*   **Spreadsheet Calculation:** Determining formula evaluation order

#### Strongly Connected Components (SCC)

SCC algorithms identify maximal subgraphs where every vertex is reachable from every other vertex.

**Kosaraju's Algorithm:**
```c
void fill_order(Graph *graph, int v, bool visited[], Stack *stack) {
    visited[v] = true;
    
    // Recur for all adjacent vertices
    AdjListNode *node = graph->array[v].head;
    while (node) {
        if (!visited[node->dest]) {
            fill_order(graph, node->dest, visited, stack);
        }
        node = node->next;
    }
    
    // Push current vertex to stack
    stack_push(stack, v);
}

void dfs_util(Graph *graph, int v, bool visited[]) {
    visited[v] = true;
    printf("%d ", v);
    
    // Recur for all adjacent vertices
    AdjListNode *node = graph->array[v].head;
    while (node) {
        if (!visited[node->dest]) {
            dfs_util(graph, node->dest, visited);
        }
        node = node->next;
    }
}

Graph *get_transpose(Graph *graph) {
    Graph *g = create_graph(graph->num_vertices);
    
    for (int v = 0; v < graph->num_vertices; v++) {
        AdjListNode *node = graph->array[v].head;
        while (node) {
            add_edge(g, node->dest, v);
            node = node->next;
        }
    }
    
    return g;
}

void strongly_connected_components(Graph *graph) {
    int V = graph->num_vertices;
    Stack stack;
    bool *visited = calloc(V, sizeof(bool));
    
    if (!visited) return;
    
    stack_init(&stack, V);
    
    // Fill vertices in stack according to finishing times
    for (int i = 0; i < V; i++) {
        if (!visited[i]) {
            fill_order(graph, i, visited, &stack);
        }
    }
    
    // Create a reversed graph
    Graph *reversed = get_transpose(graph);
    
    // Mark all vertices as not visited
    memset(visited, 0, V * sizeof(bool));
    
    // Process vertices in order defined by stack
    while (!stack_is_empty(&stack)) {
        int v = stack_pop(&stack);
        
        if (!visited[v]) {
            // Print SCC
            dfs_util(reversed, v, visited);
            printf("\n");
        }
    }
    
    free(visited);
    stack_destroy(&stack);
    destroy_graph(reversed);
}
```

**Tarjan's Algorithm:**
```c
void tarjan_scc_util(Graph *graph, int u, int *ids, int *low, 
                   bool *on_stack, Stack *stack, int *id_counter, int *scc_count) {
    ids[u] = low[u] = (*id_counter)++;
    stack_push(stack, u);
    on_stack[u] = true;
    
    AdjListNode *node = graph->array[u].head;
    while (node) {
        int v = node->dest;
        
        if (ids[v] == -1) {
            // Unvisited node - recurse
            tarjan_scc_util(graph, v, ids, low, on_stack, stack, id_counter, scc_count);
            low[u] = (low[u] < low[v]) ? low[u] : low[v];
        } else if (on_stack[v]) {
            // Back edge to node on stack
            low[u] = (low[u] < ids[v]) ? low[u] : ids[v];
        }
        
        node = node->next;
    }
    
    // If u is a root node, pop the stack and generate SCC
    if (ids[u] == low[u]) {
        printf("SCC %d: ", ++(*scc_count));
        while (1) {
            int v = stack_pop(stack);
            on_stack[v] = false;
            printf("%d ", v);
            if (v == u) break;
        }
        printf("\n");
    }
}

void tarjan_strongly_connected_components(Graph *graph) {
    int V = graph->num_vertices;
    int *ids = malloc(V * sizeof(int));
    int *low = malloc(V * sizeof(int));
    bool *on_stack = calloc(V, sizeof(bool));
    Stack stack;
    
    if (!ids || !low || !on_stack) {
        // Handle allocation failure
        free(ids);
        free(low);
        free(on_stack);
        return;
    }
    
    stack_init(&stack, V);
    
    // Initialize all ids as -1 (unvisited)
    for (int i = 0; i < V; i++) {
        ids[i] = -1;
    }
    
    int id_counter = 0;
    int scc_count = 0;
    
    // Visit all unvisited vertices
    for (int i = 0; i < V; i++) {
        if (ids[i] == -1) {
            tarjan_scc_util(graph, i, ids, low, on_stack, &stack, 
                           &id_counter, &scc_count);
        }
    }
    
    free(ids);
    free(low);
    free(on_stack);
    stack_destroy(&stack);
}
```

**Applications:**
*   **Social Network Analysis:** Identifying tightly-knit communities
*   **Web Crawling:** Organizing pages by connectivity
*   **Circuit Design:** Analyzing feedback loops
*   **Compiler Design:** Optimizing control flow

#### Maximum Flow (Ford-Fulkerson)

The Ford-Fulkerson method finds the maximum flow in a flow network.

**Key Characteristics:**
*   **Time Complexity:** O(E * max_flow)
*   **Space Complexity:** O(V + E)
*   **Uses Residual Graphs**
*   **Edmonds-Karp variant uses BFS for O(VE²) complexity**

**Implementation:**
```c
bool bfs(ResidualGraph *rg, int s, int t, int parent[]) {
    int V = rg->vertices;
    bool *visited = calloc(V, sizeof(bool));
    
    if (!visited) return false;
    
    Queue queue;
    queue_init(&queue, V);
    
    queue_enqueue(&queue, s);
    visited[s] = true;
    parent[s] = -1;
    
    while (!queue_is_empty(&queue)) {
        int u = queue_dequeue(&queue);
        
        for (int v = 0; v < V; v++) {
            if (!visited[v] && rg->capacity[u][v] > rg->flow[u][v]) {
                queue_enqueue(&queue, v);
                parent[v] = u;
                visited[v] = true;
            }
        }
    }
    
    bool result = visited[t];
    free(visited);
    queue_destroy(&queue);
    return result;
}

int ford_fulkerson(ResidualGraph *rg, int source, int sink) {
    int V = rg->vertices;
    int *parent = malloc(V * sizeof(int));
    int max_flow = 0;
    
    if (!parent) return 0;
    
    // Augment flow while there's a path from source to sink
    while (bfs(rg, source, sink, parent)) {
        // Find minimum residual capacity along the path
        int path_flow = INT_MAX;
        for (int v = sink; v != source; v = parent[v]) {
            int u = parent[v];
            path_flow = (path_flow < rg->capacity[u][v] - rg->flow[u][v]) ? 
                       path_flow : rg->capacity[u][v] - rg->flow[u][v];
        }
        
        // Update residual capacities and reverse edges
        for (int v = sink; v != source; v = parent[v]) {
            int u = parent[v];
            rg->flow[u][v] += path_flow;
            rg->flow[v][u] -= path_flow;
        }
        
        max_flow += path_flow;
    }
    
    free(parent);
    return max_flow;
}
```

**Applications:**
*   **Network Flow Analysis:** Maximum data throughput
*   **Bipartite Matching:** Finding maximum matchings
*   **Image Segmentation:** Separating foreground from background
*   **Baseball Elimination:** Determining if a team can still win

> **"Algorithms are the distilled wisdom of computational problem-solving, transforming brute-force approaches into elegant solutions. They represent the collective insight of generations of computer scientists who have wrestled with the same problems you face today. When you implement an algorithm, you're not just writing code—you're connecting with a rich intellectual tradition that spans decades of innovation."**

## 10.5 Dynamic Programming

### 10.5.1 Principles of Dynamic Programming

Dynamic Programming (DP) is a powerful technique for solving optimization problems by breaking them down into overlapping subproblems and storing solutions to avoid redundant computation.

**Two Key Properties for DP Applicability:**
1.  **Optimal Substructure:** The optimal solution to the problem contains optimal solutions to subproblems
2.  **Overlapping Subproblems:** The problem can be broken down into subproblems that are reused multiple times

**DP Approaches:**
*   **Top-Down (Memoization):** Recursive approach with caching of results
*   **Bottom-Up (Tabulation):** Iterative approach building solutions from smallest subproblems

**Example: Fibonacci Sequence**

**Naive Recursive (Exponential Time):**
```c
int fib_naive(int n) {
    if (n <= 1) return n;
    return fib_naive(n - 1) + fib_naive(n - 2);
}
```

**Memoization (Top-Down DP):**
```c
int fib_memo(int n, int *memo) {
    if (n <= 1) return n;
    
    if (memo[n] != -1) {
        return memo[n];
    }
    
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo);
    return memo[n];
}

int fibonacci(int n) {
    int *memo = malloc((n + 1) * sizeof(int));
    if (!memo) return -1;
    
    for (int i = 0; i <= n; i++) {
        memo[i] = -1;
    }
    
    int result = fib_memo(n, memo);
    free(memo);
    return result;
}
```

**Tabulation (Bottom-Up DP):**
```c
int fibonacci(int n) {
    if (n <= 1) return n;
    
    int *dp = malloc((n + 1) * sizeof(int));
    if (!dp) return -1;
    
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    int result = dp[n];
    free(dp);
    return result;
}
```

**Space-Optimized Tabulation:**
```c
int fibonacci(int n) {
    if (n <= 1) return n;
    
    int a = 0, b = 1, c;
    
    for (int i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    
    return b;
}
```

### 10.5.2 Classic DP Problems

#### Longest Common Subsequence (LCS)

LCS finds the longest subsequence common to two sequences.

**Problem Definition:**
Given two sequences X[1..m] and Y[1..n], find the longest sequence that appears in both.

**DP Formulation:**
*   Let L[i][j] be the length of LCS of X[1..i] and Y[1..j]
*   Base case: L[i][0] = L[0][j] = 0
*   Recurrence:
  ```
  L[i][j] = L[i-1][j-1] + 1, if X[i] == Y[j]
            max(L[i-1][j], L[i][j-1]), otherwise
  ```

**Implementation:**
```c
int lcs(char *X, char *Y, int m, int n) {
    int **L = malloc((m + 1) * sizeof(int *));
    if (!L) return 0;
    
    for (int i = 0; i <= m; i++) {
        L[i] = malloc((n + 1) * sizeof(int));
        if (!L[i]) {
            // Handle error
            for (int j = 0; j < i; j++) {
                free(L[j]);
            }
            free(L);
            return 0;
        }
    }
    
    // Build L[m+1][n+1] in bottom-up fashion
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0) {
                L[i][j] = 0;
            } else if (X[i - 1] == Y[j - 1]) {
                L[i][j] = L[i - 1][j - 1] + 1;
            } else {
                L[i][j] = (L[i - 1][j] > L[i][j - 1]) ? 
                          L[i - 1][j] : L[i][j - 1];
            }
        }
    }
    
    int result = L[m][n];
    
    // Free memory
    for (int i = 0; i <= m; i++) {
        free(L[i]);
    }
    free(L);
    
    return result;
}
```

**Reconstructing the LCS:**
```c
void print_lcs(char *X, char *Y, int **L, int m, int n) {
    int index = L[m][n];
    char *lcs = malloc((index + 1) * sizeof(char));
    
    if (!lcs) return;
    
    lcs[index] = '\0';
    
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (X[i - 1] == Y[j - 1]) {
            lcs[index - 1] = X[i - 1];
            i--;
            j--;
            index--;
        } else if (L[i - 1][j] > L[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    
    printf("LCS: %s\n", lcs);
    free(lcs);
}
```

**Space Optimization:**
Since each row only depends on the previous row, we can reduce space complexity from O(mn) to O(n):
```c
int lcs_optimized(char *X, char *Y, int m, int n) {
    int *prev = calloc((n + 1), sizeof(int));
    int *curr = calloc((n + 1), sizeof(int));
    
    if (!prev || !curr) {
        free(prev);
        free(curr);
        return 0;
    }
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (X[i - 1] == Y[j - 1]) {
                curr[j] = prev[j - 1] + 1;
            } else {
                curr[j] = (prev[j] > curr[j - 1]) ? prev[j] : curr[j - 1];
            }
        }
        
        // Swap rows
        int *temp = prev;
        prev = curr;
        curr = temp;
    }
    
    int result = prev[n];
    free(prev);
    free(curr);
    return result;
}
```

#### 0-1 Knapsack Problem

The knapsack problem asks to maximize the value of items in a knapsack without exceeding its weight capacity.

**Problem Definition:**
Given n items with values v[1..n] and weights w[1..n], and a knapsack capacity W, maximize Σv[i] for selected items where Σw[i] ≤ W.

**DP Formulation:**
*   Let K[i][w] be the maximum value achievable with first i items and capacity w
*   Base case: K[0][w] = K[i][0] = 0
*   Recurrence:
  ```
  K[i][w] = max(K[i-1][w], v[i] + K[i-1][w-w[i]]), if w[i] ≤ w
            K[i-1][w], otherwise
  ```

**Implementation:**
```c
int knapsack(int W, int wt[], int val[], int n) {
    int **K = malloc((n + 1) * sizeof(int *));
    if (!K) return 0;
    
    for (int i = 0; i <= n; i++) {
        K[i] = malloc((W + 1) * sizeof(int));
        if (!K[i]) {
            // Handle error
            for (int j = 0; j < i; j++) {
                free(K[j]);
            }
            free(K);
            return 0;
        }
    }
    
    // Build table K[][] in bottom-up manner
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (i == 0 || w == 0) {
                K[i][w] = 0;
            } else if (wt[i - 1] <= w) {
                K[i][w] = (val[i - 1] + K[i - 1][w - wt[i - 1]] > K[i - 1][w]) ?
                          val[i - 1] + K[i - 1][w - wt[i - 1]] : K[i - 1][w];
            } else {
                K[i][w] = K[i - 1][w];
            }
        }
    }
    
    int result = K[n][W];
    
    // Free memory
    for (int i = 0; i <= n; i++) {
        free(K[i]);
    }
    free(K);
    
    return result;
}
```

**Reconstructing the Solution:**
```c
void print_knapsack_items(int W, int wt[], int val[], int n) {
    int **K = malloc((n + 1) * sizeof(int *));
    // [Build K table as above...]
    
    printf("Items included in knapsack:\n");
    
    int w = W;
    for (int i = n; i > 0 && w > 0; i--) {
        // If this item is included
        if (K[i][w] != K[i - 1][w]) {
            printf("Item %d (weight: %d, value: %d)\n", 
                   i, wt[i - 1], val[i - 1]);
            
            // Decrease weight by the item's weight
            w -= wt[i - 1];
        }
    }
    
    // Free memory
    for (int i = 0; i <= n; i++) {
        free(K[i]);
    }
    free(K);
}
```

**Space Optimization:**
We can reduce space complexity from O(nW) to O(W):
```c
int knapsack_optimized(int W, int wt[], int val[], int n) {
    int *dp = calloc((W + 1), sizeof(int));
    if (!dp) return 0;
    
    for (int i = 0; i < n; i++) {
        // Process from right to left to avoid overwriting values we need
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = (dp[w] < val[i] + dp[w - wt[i]]) ? 
                    val[i] + dp[w - wt[i]] : dp[w];
        }
    }
    
    int result = dp[W];
    free(dp);
    return result;
}
```

#### Matrix Chain Multiplication

This problem finds the optimal way to parenthesize matrix multiplication to minimize operations.

**Problem Definition:**
Given a sequence of matrices A₁, A₂, ..., Aₙ with dimensions p₀×p₁, p₁×p₂, ..., pₙ₋₁×pₙ, find the parenthesization that minimizes the number of scalar multiplications.

**DP Formulation:**
*   Let M[i][j] be the minimum number of multiplications needed to compute Aᵢ...Aⱼ
*   Base case: M[i][i] = 0
*   Recurrence:
  ```
  M[i][j] = min(M[i][k] + M[k+1][j] + p[i-1]*p[k]*p[j]) for k in [i, j-1]
  ```

**Implementation:**
```c
int matrix_chain_order(int p[], int n) {
    // n is the number of matrices, so we have n+1 dimensions
    int **M = malloc(n * sizeof(int *));
    int **S = malloc(n * sizeof(int *));
    
    if (!M || !S) {
        // Handle allocation failure
        free(M);
        free(S);
        return 0;
    }
    
    for (int i = 0; i < n; i++) {
        M[i] = malloc(n * sizeof(int));
        S[i] = malloc(n * sizeof(int));
        if (!M[i] || !S[i]) {
            // Handle allocation failure
            for (int j = 0; j < i; j++) {
                free(M[j]);
                free(S[j]);
            }
            free(M);
            free(S);
            return 0;
        }
    }
    
    // M[i][j] = minimum number of scalar multiplications
    // needed to compute matrix A[i]A[i+1]...A[j]
    // S[i][j] = index at which to split for optimal parenthesization
    
    // Cost is zero when multiplying one matrix
    for (int i = 1; i < n; i++) {
        M[i][i] = 0;
    }
    
    // L is chain length
    for (int L = 2; L < n; L++) {
        for (int i = 1; i < n - L + 1; i++) {
            int j = i + L - 1;
            M[i][j] = INT_MAX;
            
            for (int k = i; k <= j - 1; k++) {
                // Cost = cost of left subchain + cost of right subchain
                // + cost of multiplying the two resulting matrices
                int cost = M[i][k] + M[k + 1][j] + p[i - 1] * p[k] * p[j];
                
                if (cost < M[i][j]) {
                    M[i][j] = cost;
                    S[i][j] = k;
                }
            }
        }
    }
    
    int result = M[1][n - 1];
    
    // Free memory
    for (int i = 0; i < n; i++) {
        free(M[i]);
        free(S[i]);
    }
    free(M);
    free(S);
    
    return result;
}
```

**Printing Optimal Parenthesization:**
```c
void print_optimal_parens(int **S, int i, int j) {
    if (i == j) {
        printf("A%d", i);
    } else {
        printf("(");
        print_optimal_parens(S, i, S[i][j]);
        print_optimal_parens(S, S[i][j] + 1, j);
        printf(")");
    }
}
```

## 10.6 Greedy Algorithms

### 10.6.1 Principles of Greedy Algorithms

Greedy algorithms make locally optimal choices at each step with the hope of finding a global optimum. Unlike dynamic programming, they don't reconsider previous choices.

**When Greedy Approaches Work:**
1.  **Greedy Choice Property:** A globally optimal solution can be arrived at by making a locally optimal choice
2.  **Optimal Substructure:** An optimal solution to the problem contains optimal solutions to subproblems

**Advantages:**
*   **Simplicity:** Usually easier to implement than DP
*   **Efficiency:** Often has better time complexity
*   **Intuitive:** Follows natural problem-solving approach

**Disadvantages:**
*   **Not Always Optimal:** May produce suboptimal results for some problems
*   **Hard to Prove Correctness:** Requires careful mathematical proof

### 10.6.2 Classic Greedy Problems

#### Activity Selection Problem

The activity selection problem selects the maximum number of non-overlapping activities.

**Problem Definition:**
Given n activities with start and finish times, select the maximum number that don't overlap.

**Greedy Choice:** Always pick the activity with the earliest finish time.

**Implementation:**
```c
typedef struct {
    int start;
    int finish;
} Activity;

// Comparison function for qsort
int compare_activities(const void *a, const void *b) {
    Activity *act_a = (Activity *)a;
    Activity *act_b = (Activity *)b;
    return act_a->finish - act_b->finish;
}

int select_activities(Activity activities[], int n) {
    // Sort activities by finish time
    qsort(activities, n, sizeof(Activity), compare_activities);
    
    // The first activity always gets selected
    int result = 1;
    int i = 0;
    
    // Consider rest of the activities
    for (int j = 1; j < n; j++) {
        // If this activity has start time >= finish time of previously selected
        // then select it
        if (activities[j].start >= activities[i].finish) {
            result++;
            i = j;
        }
    }
    
    return result;
}
```

**Proof of Optimality:**
1.  Let A be an optimal solution, and let B be the solution from the greedy algorithm
2.  If the first activity in A is the same as in B, we're done
3.  Otherwise, replace the first activity in A with the first in B (which finishes earlier)
4.  The resulting solution is still optimal and matches the greedy choice

#### Huffman Coding

Huffman coding creates an optimal prefix code for data compression.

**Problem Definition:**
Given a set of characters with frequencies, create a binary code with minimum expected length.

**Greedy Choice:** Always merge the two least frequent nodes.

**Implementation:**
```c
typedef struct MinHeapNode {
    char data;
    unsigned freq;
    struct MinHeapNode *left, *right;
} MinHeapNode;

typedef struct {
    unsigned size;
    unsigned capacity;
    MinHeapNode **array;
} MinHeap;

// Min-heap helper functions
MinHeap *create_min_heap(unsigned capacity);
void min_heapify(MinHeap *min_heap, int idx);
int is_size_one(MinHeap *min_heap);
MinHeapNode *extract_min(MinHeap *min_heap);
void insert_min_heap(MinHeap *min_heap, MinHeapNode *min_heap_node);
void build_min_heap(MinHeap *min_heap);

MinHeapNode *new_node(char data, unsigned freq) {
    MinHeapNode *temp = malloc(sizeof(MinHeapNode));
    if (!temp) return NULL;
    
    temp->left = temp->right = NULL;
    temp->data = data;
    temp->freq = freq;
    
    return temp;
}

// Compare two heap nodes
int compare_nodes(const void *a, const void *b) {
    MinHeapNode *l = *(MinHeapNode **)a;
    MinHeapNode *r = *(MinHeapNode **)b;
    return l->freq - r->freq;
}

MinHeap *create_and_build_min_heap(char data[], int freq[], int size) {
    MinHeap *min_heap = create_min_heap(size);
    if (!min_heap) return NULL;
    
    for (int i = 0; i < size; i++) {
        min_heap->array[i] = new_node(data[i], freq[i]);
    }
    
    min_heap->size = size;
    build_min_heap(min_heap);
    
    return min_heap;
}

MinHeapNode *build_huffman_tree(char data[], int freq[], int size) {
    MinHeapNode *left, *right, *top;
    
    // Create min heap of capacity equal to size
    MinHeap *min_heap = create_and_build_min_heap(data, freq, size);
    if (!min_heap) return NULL;
    
    // Iterate while size of heap doesn't become 1
    while (!is_size_one(min_heap)) {
        // Extract two minimum frequency items
        left = extract_min(min_heap);
        right = extract_min(min_heap);
        
        // Create a new internal node with frequency equal to the sum
        // of the two nodes frequencies. Make the two extracted node as
        // left and right children of this new node.
        top = new_node('$', left->freq + right->freq);
        if (!top) {
            // Handle error
            return NULL;
        }
        
        top->left = left;
        top->right = right;
        
        insert_min_heap(min_heap, top);
    }
    
    // Return the root of Huffman tree
    return extract_min(min_heap);
}

void print_codes(MinHeapNode *root, int arr[], int top) {
    // Assign 0 to left edge and recur
    if (root->left) {
        arr[top] = 0;
        print_codes(root->left, arr, top + 1);
    }
    
    // Assign 1 to right edge and recur
    if (root->right) {
        arr[top] = 1;
        print_codes(root->right, arr, top + 1);
    }
    
    // If this is a leaf node, print the character and its code
    if (is_leaf(root)) {
        printf("%c: ", root->data);
        for (int i = 0; i < top; i++) {
            printf("%d", arr[i]);
        }
        printf("\n");
    }
}
```

**Applications:**
*   **Data Compression:** File compression algorithms (ZIP, GZIP)
*   **Transmission Efficiency:** Reducing bandwidth usage
*   **Storage Optimization:** Minimizing storage requirements

#### Dijkstra's Algorithm as Greedy

Dijkstra's shortest path algorithm is a greedy algorithm that always selects the vertex with the smallest known distance.

**Why It's Greedy:**
*   At each step, it makes a locally optimal choice (closest unvisited vertex)
*   This choice leads to a globally optimal solution for non-negative weights
*   It never reconsiders previous choices

**Proof of Correctness:**
The greedy choice property holds because when a vertex u is added to the set of visited vertices, the shortest path to u has been found (for non-negative weights).

### 10.6.3 Greedy vs. Dynamic Programming

**Comparison of Approaches:**

| **Aspect**            | **Greedy Algorithms**               | **Dynamic Programming**             |
| :-------------------- | :---------------------------------- | :---------------------------------- |
| **Approach**          | **Top-down**                        | **Bottom-up or Top-down**           |
| **Optimality**        | **Not always optimal**              | **Always optimal**                  |
| **Time Complexity**   | **Usually lower**                   | **Usually higher**                  |
| **Space Complexity**  | **Usually lower**                   | **Usually higher**                  |
| **Proof Requirement** | **Requires proof of greedy choice** | **Requires optimal substructure**   |
| **Problem Structure** | **Greedy choice property**          | **Overlapping subproblems**         |
| **Backtracking**      | **No backtracking**                 | **May reconsider previous choices** |

**When to Choose Which:**
*   **Choose Greedy When:**
  *   The problem has the greedy choice property
  *   Simplicity and efficiency are priorities
  *   Proof of correctness is straightforward
  
*   **Choose DP When:**
  *   The problem has overlapping subproblems
  *   Greedy approach doesn't yield optimal results
  *   The solution space is too large for brute force

**Example Decision Process:**
1.  Does the problem ask for an optimal solution? (If not, neither may apply)
2.  Does the problem have optimal substructure?
3.  For greedy: Does the greedy choice property hold?
4.  For DP: Are there overlapping subproblems?
5.  If both apply, compare time/space requirements and implementation complexity

## 10.7 String Algorithms

### 10.7.1 Suffix Arrays and Trees

Suffix arrays and trees provide efficient solutions for many string problems.

#### Suffix Array Construction

A suffix array is a sorted array of all suffixes of a string.

**Naive Construction (O(n² log n)):**
```c
typedef struct {
    int index;
    char *suffix;
} Suffix;

int compare_suffixes(const void *a, const void *b) {
    return strcmp(((Suffix *)a)->suffix, ((Suffix *)b)->suffix);
}

int *build_suffix_array(char *text, int n) {
    // Create suffixes
    Suffix *suffixes = malloc(n * sizeof(Suffix));
    if (!suffixes) return NULL;
    
    for (int i = 0; i < n; i++) {
        suffixes[i].index = i;
        suffixes[i].suffix = &text[i];
    }
    
    // Sort suffixes
    qsort(suffixes, n, sizeof(Suffix), compare_suffixes);
    
    // Store sorted order
    int *suffix_array = malloc(n * sizeof(int));
    if (!suffix_array) {
        free(suffixes);
        return NULL;
    }
    
    for (int i = 0; i < n; i++) {
        suffix_array[i] = suffixes[i].index;
    }
    
    free(suffixes);
    return suffix_array;
}
```

**Efficient Construction (O(n log n)):**
The Manber-Myers algorithm sorts suffixes by their first 1, 2, 4, 8, ... characters.

```c
int *build_suffix_array_efficient(char *text, int n) {
    // Position array - rank of each suffix
    int *pos = malloc(n * sizeof(int));
    // Temporary array for sorting
    int *tmp = malloc(n * sizeof(int));
    // Suffix array
    int *sa = malloc(n * sizeof(int));
    
    if (!pos || !tmp || !sa) {
        // Handle allocation failure
        free(pos);
        free(tmp);
        free(sa);
        return NULL;
    }
    
    // Initialize with first character
    for (int i = 0; i < n; i++) {
        pos[i] = text[i];
        sa[i] = i;
    }
    
    // Sort by first character
    // (Implementation would use counting sort for O(n) sorting)
    
    // Sort by 2^k characters
    for (int gap = 1; gap < n; gap *= 2) {
        // Comparison function based on current ranks
        auto cmp = [&](int i, int j) {
            if (pos[i] != pos[j]) {
                return pos[i] < pos[j];
            }
            int ri = (i + gap < n) ? pos[i + gap] : -1;
            int rj = (j + gap < n) ? pos[j + gap] : -1;
            return ri < rj;
        };
        
        // Sort suffix array using the comparison
        // (Implementation would use radix sort)
        
        // Update positions
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++) {
            tmp[sa[i]] = tmp[sa[i - 1]] + (cmp(sa[i - 1], sa[i]) ? 1 : 0);
        }
        
        for (int i = 0; i < n; i++) {
            pos[i] = tmp[i];
        }
    }
    
    free(pos);
    free(tmp);
    return sa;
}
```

#### Longest Common Prefix (LCP) Array

The LCP array stores the length of the longest common prefix between consecutive suffixes in the suffix array.

**Construction:**
```c
int *build_lcp_array(char *text, int *suffix_array, int n) {
    int *lcp = malloc(n * sizeof(int));
    int *rank = malloc(n * sizeof(int));
    
    if (!lcp || !rank) {
        // Handle allocation failure
        free(lcp);
        free(rank);
        return NULL;
    }
    
    // Build rank array (inverse of suffix array)
    for (int i = 0; i < n; i++) {
        rank[suffix_array[i]] = i;
    }
    
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank[i] > 0) {
            int j = suffix_array[rank[i] - 1];
            
            // Compute LCP
            while (i + h < n && j + h < n && text[i + h] == text[j + h]) {
                h++;
            }
            
            lcp[rank[i]] = h;
            
            // Optimization for next iteration
            if (h > 0) h--;
        }
    }
    
    free(rank);
    return lcp;
}
```

#### Applications of Suffix Arrays

**Pattern Matching:**
```c
int *suffix_array_search(char *text, char *pattern, int *suffix_array, int n) {
    int m = strlen(pattern);
    int *results = NULL;
    int count = 0;
    
    // Binary search for the first occurrence
    int low = 0;
    int high = n - 1;
    
    while (low <= high) {
        int mid = (low + high) / 2;
        int result = strncmp(&text[suffix_array[mid]], pattern, m);
        
        if (result < 0) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    
    // Check if pattern exists
    if (low < n && strncmp(&text[suffix_array[low]], pattern, m) == 0) {
        // Count occurrences
        int start = low;
        while (low < n && strncmp(&text[suffix_array[low]], pattern, m) == 0) {
            low++;
        }
        
        // Allocate and fill results
        count = low - start;
        results = malloc(count * sizeof(int));
        if (results) {
            for (int i = 0; i < count; i++) {
                results[i] = suffix_array[start + i];
            }
        }
    }
    
    return results;
}
```

**Longest Repeated Substring:**
```c
char *longest_repeated_substring(char *text, int *suffix_array, int *lcp, int n) {
    // Find maximum value in LCP array
    int max_lcp = 0;
    int max_index = 0;
    
    for (int i = 1; i < n; i++) {
        if (lcp[i] > max_lcp) {
            max_lcp = lcp[i];
            max_index = i;
        }
    }
    
    // Extract the substring
    if (max_lcp == 0) {
        return NULL; // No repeated substring
    }
    
    char *result = malloc((max_lcp + 1) * sizeof(char));
    if (!result) return NULL;
    
    strncpy(result, &text[suffix_array[max_index]], max_lcp);
    result[max_lcp] = '\0';
    
    return result;
}
```

### 10.7.2 Edit Distance (Levenshtein Distance)

Edit distance measures the minimum number of operations to transform one string into another.

**Operations:**
*   Insert a character
*   Delete a character
*   Replace a character

**DP Formulation:**
*   Let D[i][j] be the edit distance between X[1..i] and Y[1..j]
*   Base case: D[i][0] = i, D[0][j] = j
*   Recurrence:
  ```
  D[i][j] = min(D[i-1][j] + 1,        // Deletion
                D[i][j-1] + 1,        // Insertion
                D[i-1][j-1] + cost)   // Substitution
  ```
  where cost = 0 if X[i] == Y[j], else 1

**Implementation:**
```c
int edit_distance(char *X, char *Y) {
    int m = strlen(X);
    int n = strlen(Y);
    
    int **D = malloc((m + 1) * sizeof(int *));
    if (!D) return -1;
    
    for (int i = 0; i <= m; i++) {
        D[i] = malloc((n + 1) * sizeof(int));
        if (!D[i]) {
            // Handle error
            for (int j = 0; j < i; j++) {
                free(D[j]);
            }
            free(D);
            return -1;
        }
    }
    
    // Initialize base cases
    for (int i = 0; i <= m; i++) {
        D[i][0] = i;
    }
    for (int j = 0; j <= n; j++) {
        D[0][j] = j;
    }
    
    // Fill the DP table
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            int cost = (X[i - 1] == Y[j - 1]) ? 0 : 1;
            D[i][j] = min(D[i - 1][j] + 1, 
                         D[i][j - 1] + 1,
                         D[i - 1][j - 1] + cost);
        }
    }
    
    int result = D[m][n];
    
    // Free memory
    for (int i = 0; i <= m; i++) {
        free(D[i]);
    }
    free(D);
    
    return result;
}
```

**Space Optimization:**
Since each row only depends on the previous row, we can reduce space complexity to O(n):
```c
int edit_distance_optimized(char *X, char *Y) {
    int m = strlen(X);
    int n = strlen(Y);
    
    // We only need two rows
    int *prev = malloc((n + 1) * sizeof(int));
    int *curr = malloc((n + 1) * sizeof(int));
    
    if (!prev || !curr) {
        free(prev);
        free(curr);
        return -1;
    }
    
    // Initialize base case
    for (int j = 0; j <= n; j++) {
        prev[j] = j;
    }
    
    for (int i = 1; i <= m; i++) {
        curr[0] = i;
        
        for (int j = 1; j <= n; j++) {
            int cost = (X[i - 1] == Y[j - 1]) ? 0 : 1;
            curr[j] = min(prev[j] + 1, 
                         curr[j - 1] + 1,
                         prev[j - 1] + cost);
        }
        
        // Swap rows
        int *temp = prev;
        prev = curr;
        curr = temp;
    }
    
    int result = prev[n];
    free(prev);
    free(curr);
    return result;
}
```

**Reconstructing the Operations:**
```c
void print_edit_operations(char *X, char *Y, int **D, int m, int n) {
    int i = m, j = n;
    
    while (i > 0 && j > 0) {
        if (X[i - 1] == Y[j - 1]) {
            printf("No operation: %c\n", X[i - 1]);
            i--;
            j--;
        } else {
            int del = D[i - 1][j] + 1;
            int ins = D[i][j - 1] + 1;
            int sub = D[i - 1][j - 1] + 1;
            
            if (del <= ins && del <= sub) {
                printf("Delete: %c\n", X[i - 1]);
                i--;
            } else if (ins <= del && ins <= sub) {
                printf("Insert: %c\n", Y[j - 1]);
                j--;
            } else {
                printf("Substitute: %c -> %c\n", X[i - 1], Y[j - 1]);
                i--;
                j--;
            }
        }
    }
    
    // Handle remaining characters
    while (i > 0) {
        printf("Delete: %c\n", X[i - 1]);
        i--;
    }
    while (j > 0) {
        printf("Insert: %c\n", Y[j - 1]);
        j--;
    }
}
```

## 10.8 Computational Geometry

### 10.8.1 Convex Hull Algorithms

The convex hull of a set of points is the smallest convex polygon containing all points.

#### Graham Scan

Graham scan constructs the convex hull in O(n log n) time.

**Key Steps:**
1.  Find the point with the lowest y-coordinate (and leftmost if tie)
2.  Sort all points by polar angle with respect to the base point
3.  Process points in order, maintaining a stack of hull points

**Implementation:**
```c
typedef struct {
    int x, y;
} Point;

// Comparison functions
int compare_points(const void *a, const void *b) {
    Point *p1 = (Point *)a;
    Point *p2 = (Point *)b;
    
    if (p1->y == p2->y) {
        return (p1->x < p2->x) ? -1 : (p1->x > p2->x);
    }
    return (p1->y < p2->y) ? -1 : (p1->y > p2->y);
}

int orientation(Point p, Point q, Point r) {
    int val = (q.y - p.y) * (r.x - q.x) - 
              (q.x - p.x) * (r.y - q.y);
    
    if (val == 0) return 0;  // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or counterclockwise
}

int distance_sq(Point p1, Point p2) {
    int dx = p1.x - p2.x;
    int dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}

int compare_angles(const void *vp1, const void *vp2, void *vbase) {
    Point *p1 = (Point *)vp1;
    Point *p2 = (Point *)vp2;
    Point *base = (Point *)vbase;
    
    int o = orientation(*base, *p1, *p2);
    if (o == 0) {
        return (distance_sq(*base, *p2) >= distance_sq(*base, *p1)) ? -1 : 1;
    }
    return (o == 2) ? -1 : 1;
}

Point *graham_scan(Point points[], int n, int *hull_size) {
    // Find bottom-most point
    int ymin = points[0].y, min = 0;
    for (int i = 1; i < n; i++) {
        int y = points[i].y;
        
        // Pick bottom-most or choose the left-most point in case of tie
        if ((y < ymin) || (ymin == y && points[i].x < points[min].x)) {
            ymin = points[i].y;
            min = i;
        }
    }
    
    // Place the bottom-most point at first position
    Point temp = points[0];
    points[0] = points[min];
    points[min] = temp;
    
    // Sort n-1 points with respect to the first point
    // A custom compare function is used
    qsort_r(points + 1, n - 1, sizeof(Point), 
           (int (*)(const void *, const void *, void *))compare_angles, 
           &points[0]);
    
    // Create an empty stack and push first three points
    Point *hull = malloc(n * sizeof(Point));
    if (!hull) {
        *hull_size = 0;
        return NULL;
    }
    
    int top = 2;
    hull[0] = points[0];
    hull[1] = points[1];
    hull[2] = points[2];
    
    // Process remaining n-3 points
    for (int i = 3; i < n; i++) {
        // Keep removing top while the angle formed by points next-to-top, 
        // top, and points[i] makes a non-left turn
        while (top >= 1 && orientation(hull[top - 1], hull[top], points[i]) != 2) {
            top--;
        }
        
        hull[++top] = points[i];
    }
    
    *hull_size = top + 1;
    return hull;
}
```

#### Jarvis March (Gift Wrapping)

Jarvis march constructs the convex hull in O(nh) time, where h is the number of hull points.

**Key Steps:**
1.  Start from the leftmost point
2.  Keep wrapping points in counterclockwise order
3.  Repeat until back to the starting point

**Implementation:**
```c
Point *jarvis_march(Point points[], int n, int *hull_size) {
    // Initialize output
    Point *hull = malloc(n * sizeof(Point));
    if (!hull) {
        *hull_size = 0;
        return NULL;
    }
    
    // Find the leftmost point
    int l = 0;
    for (int i = 1; i < n; i++) {
        if (points[i].x < points[l].x) {
            l = i;
        }
    }
    
    int p = l, q;
    int index = 0;
    
    do {
        // Add current point to result
        hull[index++] = points[p];
        
        // Search for a point 'q' such that orientation(p, q, r) is counterclockwise
        // for all points 'r'
        q = (p + 1) % n;
        for (int i = 0; i < n; i++) {
            // If i is more counterclockwise than current q, update q
            if (orientation(points[p], points[i], points[q]) == 2) {
                q = i;
            }
        }
        
        p = q; // Set p as q for next iteration
    } while (p != l); // While we don't come to first point
    
    *hull_size = index;
    return hull;
}
```

### 10.8.2 Line Segment Intersection

Determining if two line segments intersect is a fundamental computational geometry problem.

**Key Insight:** Two segments (p1,q1) and (p2,q2) intersect if and only if:
1.  (p1,q1,p2) and (p1,q1,q2) have different orientations, AND
2.  (p2,q2,p1) and (p2,q2,q1) have different orientations

**Orientation Function:**
```c
// To find orientation of ordered triplet (p, q, r)
// Returns:
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
int orientation(Point p, Point q, Point r) {
    int val = (q.y - p.y) * (r.x - q.x) - 
              (q.x - p.x) * (r.y - q.y);
    
    if (val == 0) return 0;  // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or counterclockwise
}
```

**General Case Check:**
```c
// Check if point q lies on segment pr
int on_segment(Point p, Point q, Point r) {
    if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) &&
        q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y)) {
        return 1;
    }
    return 0;
}

// Main function to check if two segments intersect
int do_intersect(Point p1, Point q1, Point p2, Point q2) {
    // Find the four orientations needed in general case
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);
    
    // General case
    if (o1 != o2 && o3 != o4) {
        return 1;
    }
    
    // Special cases (collinear points)
    if (o1 == 0 && on_segment(p1, p2, q1)) return 1;
    if (o2 == 0 && on_segment(p1, q2, q1)) return 1;
    if (o3 == 0 && on_segment(p2, p1, q2)) return 1;
    if (o4 == 0 && on_segment(p2, q1, q2)) return 1;
    
    return 0; // Doesn't intersect
}
```

**Sweep Line Algorithm for Multiple Segments:**
For finding all intersections among n segments, the sweep line algorithm runs in O((n + k) log n) time, where k is the number of intersections.

```c
typedef struct {
    Point point;
    int segment_id;
    int is_left; // 1 for left endpoint, 0 for right
} Event;

int compare_events(const void *a, const void *b) {
    Event *e1 = (Event *)a;
    Event *e2 = (Event *)b;
    
    // Sort by x-coordinate
    if (e1->point.x != e2->point.x) {
        return (e1->point.x < e2->point.x) ? -1 : 1;
    }
    
    // If same x, left endpoints before right endpoints
    if (e1->is_left != e2->is_left) {
        return e1->is_left ? -1 : 1;
    }
    
    // Otherwise sort by y-coordinate
    return (e1->point.y < e2->point.y) ? -1 : 1;
}

// Implementation of the sweep line algorithm would follow,
// using a balanced BST to maintain the active segments
```

### 10.8.3 Closest Pair of Points

Finding the closest pair of points in a set can be done in O(n log n) time using divide and conquer.

**Key Steps:**
1.  Sort points by x-coordinate
2.  Divide the set into two halves
3.  Recursively find closest pairs in each half
4.  Check for closer pairs that span the division

**Implementation:**
```c
double distance(Point p1, Point p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return sqrt(dx * dx + dy * dy);
}

// Compare points by x-coordinate
int compare_x(const void *a, const void *b) {
    Point *p1 = (Point *)a;
    Point *p2 = (Point *)b;
    return (p1->x < p2->x) ? -1 : (p1->x > p2->x);
}

// Compare points by y-coordinate
int compare_y(const void *a, const void *b) {
    Point *p1 = (Point *)a;
    Point *p2 = (Point *)b;
    return (p1->y < p2->y) ? -1 : (p1->y > p2->y);
}

// Find closest pair in strip of points sorted by y-coordinate
double strip_closest(Point strip[], int size, double d) {
    double min = d;
    
    // Sort strip by y-coordinate (already done in our implementation)
    
    // Pick all points one by one and try the next points till the difference
    // between y coordinates is smaller than d
    for (int i = 0; i < size; i++) {
        for (int j = i + 1; j < size && (strip[j].y - strip[i].y) < min; j++) {
            double dist = distance(strip[i], strip[j]);
            if (dist < min) {
                min = dist;
            }
        }
    }
    
    return min;
}

double closest_util(Point points_x[], Point points_y[], int n) {
    // If there are 2 or 3 points, use brute force
    if (n <= 3) {
        double min = DBL_MAX;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double dist = distance(points_x[i], points_x[j]);
                if (dist < min) {
                    min = dist;
                }
            }
        }
        return min;
    }
    
    // Find the middle point
    int mid = n / 2;
    Point mid_point = points_x[mid];
    
    // Divide points into left and right halves
    Point *points_y_left = malloc(mid * sizeof(Point));
    Point *points_y_right = malloc((n - mid) * sizeof(Point));
    
    if (!points_y_left || !points_y_right) {
        free(points_y_left);
        free(points_y_right);
        return DBL_MAX;
    }
    
    int li = 0, ri = 0;
    for (int i = 0; i < n; i++) {
        if (points_y[i].x <= mid_point.x && li < mid) {
            points_y_left[li++] = points_y[i];
        } else {
            points_y_right[ri++] = points_y[i];
        }
    }
    
    // Recursively find the smallest distances in left and right halves
    double dl = closest_util(points_x, points_y_left, mid);
    double dr = closest_util(points_x + mid, points_y_right, n - mid);
    
    // Find the smaller of two distances
    double d = (dl < dr) ? dl : dr;
    
    // Build an array strip[] that contains points close to the line dividing the halves
    Point *strip = malloc(n * sizeof(Point));
    int j = 0;
    for (int i = 0; i < n; i++) {
        if (abs(points_y[i].x - mid_point.x) < d) {
            strip[j] = points_y[i];
            j++;
        }
    }
    
    // Find the closest points in strip
    double min_strip = strip_closest(strip, j, d);
    
    // Free allocated memory
    free(points_y_left);
    free(points_y_right);
    free(strip);
    
    // Return the minimum of d and min_strip
    return (d < min_strip) ? d : min_strip;
}

double closest_pair(Point points[], int n) {
    Point *points_x = malloc(n * sizeof(Point));
    Point *points_y = malloc(n * sizeof(Point));
    
    if (!points_x || !points_y) {
        free(points_x);
        free(points_y);
        return DBL_MAX;
    }
    
    // Copy points to arrays sorted by x and y
    memcpy(points_x, points, n * sizeof(Point));
    memcpy(points_y, points, n * sizeof(Point));
    
    // Sort arrays
    qsort(points_x, n, sizeof(Point), compare_x);
    qsort(points_y, n, sizeof(Point), compare_y);
    
    double result = closest_util(points_x, points_y, n);
    
    free(points_x);
    free(points_y);
    
    return result;
}
```

**Optimizations:**
*   **Avoid Square Roots:** Compare squared distances instead
*   **Reduce Memory:** Reuse arrays instead of allocating new ones
*   **Prune Early:** Stop comparisons when distance exceeds current minimum

## 10.9 Advanced Data Structures for Algorithms

### 10.9.1 Union-Find with Path Compression

Union-Find (Disjoint Set Union) is a data structure for tracking partitions of elements.

**Basic Implementation:**
```c
typedef struct {
    int *parent;
    int *rank;
    int size;
} UnionFind;

UnionFind *uf_create(int size) {
    UnionFind *uf = malloc(sizeof(UnionFind));
    if (!uf) return NULL;
    
    uf->parent = malloc(size * sizeof(int));
    uf->rank = malloc(size * sizeof(int));
    
    if (!uf->parent || !uf->rank) {
        free(uf->parent);
        free(uf->rank);
        free(uf);
        return NULL;
    }
    
    uf->size = size;
    
    // Initialize each element as its own set
    for (int i = 0; i < size; i++) {
        uf->parent[i] = i;
        uf->rank[i] = 0;
    }
    
    return uf;
}

int uf_find(UnionFind *uf, int x) {
    if (uf->parent[x] != x) {
        uf->parent[x] = uf_find(uf, uf->parent[x]); // Path compression
    }
    return uf->parent[x];
}

void uf_union(UnionFind *uf, int x, int y) {
    int xroot = uf_find(uf, x);
    int yroot = uf_find(uf, y);
    
    if (xroot == yroot) {
        return; // Already in same set
    }
    
    // Union by rank
    if (uf->rank[xroot] < uf->rank[yroot]) {
        uf->parent[xroot] = yroot;
    } else if (uf->rank[xroot] > uf->rank[yroot]) {
        uf->parent[yroot] = xroot;
    } else {
        uf->parent[yroot] = xroot;
        uf->rank[xroot]++;
    }
}

void uf_destroy(UnionFind *uf) {
    free(uf->parent);
    free(uf->rank);
    free(uf);
}
```

**Time Complexity:**
*   **Without Path Compression:** O(log n) per operation
*   **With Path Compression and Union by Rank:** O(α(n)) per operation
  *   α(n) is the inverse Ackermann function, which grows extremely slowly
  *   For all practical purposes, this is essentially constant time

**Applications:**
*   **Kruskal's MST Algorithm**
*   **Connected Components in Graphs**
*   **Image Segmentation**
*   **Percolation Problems**

### 10.9.2 Segment Trees

Segment trees support range queries and updates in logarithmic time.

**Key Operations:**
*   **Range Query:** Find some function (sum, min, max) over a range
*   **Point/Range Update:** Update one or more elements

**Implementation:**
```c
typedef struct {
    int *tree;
    int size;
} SegmentTree;

SegmentTree *seg_tree_create(int arr[], int n) {
    // Height of segment tree
    int height = (int)ceil(log2(n));
    
    // Maximum size of segment tree
    int max_size = 2 * (int)pow(2, height) - 1;
    
    SegmentTree *st = malloc(sizeof(SegmentTree));
    if (!st) return NULL;
    
    st->tree = malloc(max_size * sizeof(int));
    st->size = max_size;
    
    if (!st->tree) {
        free(st);
        return NULL;
    }
    
    // Build the tree
    build_tree_util(st->tree, arr, 0, n - 1, 0);
    
    return st;
}

int build_tree_util(int tree[], int arr[], int ss, int se, int si) {
    // If there is one element in array, store it in current node
    if (ss == se) {
        tree[si] = arr[ss];
        return arr[ss];
    }
    
    // If there are more than one elements, then recur for left and right subtrees
    int mid = ss + (se - ss) / 2;
    tree[si] = build_tree_util(tree, arr, ss, mid, si * 2 + 1) +
               build_tree_util(tree, arr, mid + 1, se, si * 2 + 2);
    return tree[si];
}

int get_sum_util(int *tree, int ss, int se, int qs, int qe, int si) {
    // If segment of this node is a part of given range, return the sum
    if (qs <= ss && qe >= se) {
        return tree[si];
    }
    
    // If segment of this node is outside the given range
    if (se < qs || ss > qe) {
        return 0;
    }
    
    // If a part of this segment overlaps with the given range
    int mid = ss + (se - ss) / 2;
    return get_sum_util(tree, ss, mid, qs, qe, 2 * si + 1) +
           get_sum_util(tree, mid + 1, se, qs, qe, 2 * si + 2);
}

int seg_tree_get_sum(SegmentTree *st, int n, int qs, int qe) {
    // Check for erroneous input values
    if (qs < 0 || qe > n - 1 || qs > qe) {
        printf("Invalid Input\n");
        return -1;
    }
    
    return get_sum_util(st->tree, 0, n - 1, qs, qe, 0);
}

void update_value_util(int *tree, int ss, int se, int i, int diff, int si) {
    // Base case: If the input index lies outside the range of this segment
    if (i < ss || i > se) {
        return;
    }
    
    // If the input index is in range of this node, update the value
    tree[si] = tree[si] + diff;
    
    // If not a leaf node, recur for children
    if (se != ss) {
        int mid = ss + (se - ss) / 2;
        update_value_util(tree, ss, mid, i, diff, 2 * si + 1);
        update_value_util(tree, mid + 1, se, i, diff, 2 * si + 2);
    }
}

void seg_tree_update_value(SegmentTree *st, int arr[], int n, int i, int new_val) {
    // Check for erroneous input index
    if (i < 0 || i > n - 1) {
        printf("Invalid Input\n");
        return;
    }
    
    // Get the difference between new value and old value
    int diff = new_val - arr[i];
    
    // Update the value in array
    arr[i] = new_val;
    
    // Update the values of nodes in segment tree
    update_value_util(st->tree, 0, n - 1, i, diff, 0);
}

void seg_tree_destroy(SegmentTree *st) {
    free(st->tree);
    free(st);
}
```

**Variations:**
*   **Range Minimum/Maximum Query (RMQ):** Find min/max in a range
*   **Lazy Propagation:** Efficient range updates
*   **Persistent Segment Trees:** Maintain historical versions

### 10.9.3 Fenwick Trees (Binary Indexed Trees)

Fenwick trees provide efficient prefix sum calculations and updates.

**Key Advantages:**
*   **Simpler implementation** than segment trees for prefix sums
*   **Less memory** than segment trees (n vs 4n)
*   **Faster constant factors**

**Implementation:**
```c
typedef struct {
    int *tree;
    int size;
} FenwickTree;

FenwickTree *fenwick_tree_create(int size) {
    FenwickTree *ft = malloc(sizeof(FenwickTree));
    if (!ft) return NULL;
    
    ft->tree = calloc(size + 1, sizeof(int));
    if (!ft->tree) {
        free(ft);
        return NULL;
    }
    
    ft->size = size;
    return ft;
}

// Returns sum of arr[0..index]
int fenwick_tree_sum(FenwickTree *ft, int index) {
    int sum = 0;
    
    // Index in BIT is 1 more than array index
    index++;
    
    // Traverse ancestors of BITree[index]
    while (index > 0) {
        sum += ft->tree[index];
        
        // Move index to parent node
        index -= index & (-index);
    }
    
    return sum;
}

// Updates a node in BITree at given index
void fenwick_tree_update(FenwickTree *ft, int index, int delta) {
    // Index in BIT is 1 more than array index
    index++;
    
    // Traverse all ancestors and add 'delta'
    while (index <= ft->size) {
        ft->tree[index] += delta;
        
        // Update index to that of parent
        index += index & (-index);
    }
}

// Range query [l, r]
int fenwick_tree_range_query(FenwickTree *ft, int l, int r) {
    return fenwick_tree_sum(ft, r) - fenwick_tree_sum(ft, l - 1);
}

void fenwick_tree_destroy(FenwickTree *ft) {
    free(ft->tree);
    free(ft);
}
```

**Applications:**
*   **Prefix Sum Calculations**
*   **Frequency Tables**
*   **Inversion Counting**
*   **Arbitrary Range Queries** (with additional processing)

**Comparison with Segment Trees:**

| **Feature**           | **Fenwick Tree**                    | **Segment Tree**                   |
| :-------------------- | :---------------------------------- | :--------------------------------- |
| **Memory Usage**      | **O(n)**                            | **O(n)** (but larger constant)**   |
| **Prefix Queries**    | **O(log n)**                        | **O(log n)**                       |
| **Range Queries**     | **O(log n)**                        | **O(log n)**                       |
| **Point Updates**     | **O(log n)**                        | **O(log n)**                       |
| **Range Updates**     | **Not directly supported**          | **O(log n) with lazy propagation** |
| **Implementation**    | **Simpler**                         | **More complex**                   |
| **Flexibility**       | **Limited to prefix operations**    | **More versatile**                 |

## 10.10 Algorithm Design Techniques

### 10.10.1 Divide and Conquer

Divide and conquer solves problems by breaking them into smaller subproblems, solving those, and combining the results.

**Key Steps:**
1.  **Divide:** Break the problem into smaller subproblems
2.  **Conquer:** Solve the subproblems recursively
3.  **Combine:** Merge the solutions to form the final solution

**Examples:**
*   **Merge Sort:** Divide array, sort subarrays, merge results
*   **Quick Sort:** Partition array, sort partitions
*   **Binary Search:** Divide array, search appropriate half
*   **Strassen's Matrix Multiplication:** Divide matrices into submatrices

**Master Theorem:**
Provides asymptotic analysis for divide and conquer recurrences of the form:
T(n) = aT(n/b) + f(n)

Where:
*   a ≥ 1: Number of subproblems
*   b > 1: Factor by which problem size is reduced
*   f(n): Cost of dividing and combining

**Cases:**
1.  If f(n) = O(n^(log_b a - ε)) for some ε > 0, then T(n) = Θ(n^(log_b a))
2.  If f(n) = Θ(n^(log_b a)), then T(n) = Θ(n^(log_b a) log n)
3.  If f(n) = Ω(n^(log_b a + ε)) for some ε > 0, and af(n/b) ≤ cf(n) for some c < 1, then T(n) = Θ(f(n))

**Example Application:**
For merge sort: T(n) = 2T(n/2) + Θ(n)
*   a = 2, b = 2, f(n) = Θ(n)
*   n^(log_b a) = n^(log_2 2) = n
*   f(n) = Θ(n) = Θ(n^(log_b a)), so case 2 applies
*   T(n) = Θ(n log n)

### 10.10.2 Randomized Algorithms

Randomized algorithms use randomness as part of their logic to achieve good average-case performance.

**Types:**
*   **Las Vegas Algorithms:** Always produce correct results, but running time is random
*   **Monte Carlo Algorithms:** Running time is fixed, but may produce incorrect results with some probability

**Example: Randomized Quick Sort**

```c
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] <= pivot) {
            i++;
            // Swap arr[i] and arr[j]
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    // Swap arr[i+1] and arr[high]
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}

int random_partition(int arr[], int low, int high) {
    // Pick a random pivot
    int random = low + rand() % (high - low + 1);
    
    // Swap with last element
    int temp = arr[random];
    arr[random] = arr[high];
    arr[high] = temp;
    
    return partition(arr, low, high);
}

void random_quick_sort(int arr[], int low, int high) {
    if (low < high) {
        int pi = random_partition(arr, low, high);
        
        random_quick_sort(arr, low, pi - 1);
        random_quick_sort(arr, pi + 1, high);
    }
}
```

**Advantages:**
*   **Simplicity:** Often simpler than deterministic counterparts
*   **Efficiency:** Better average-case performance
*   **Avoids Worst Cases:** Randomization prevents predictable worst cases

**Applications:**
*   **Sorting:** Randomized quicksort
*   **Selection:** Randomized quickselect
*   **Graph Algorithms:** Minimum cut
*   **Cryptography:** Primality testing

### 10.10.3 Backtracking

Backtracking incrementally builds candidates to solutions and abandons partial candidates as soon as they cannot lead to a valid solution.

**Key Steps:**
1.  **Choose:** Make a choice from available options
2.  **Explore:** Recursively explore the consequences of the choice
3.  **Unchoose:** Undo the choice and try alternatives

**Example: N-Queens Problem**

```c
int is_safe(int board[][N], int row, int col) {
    // Check row on left side
    for (int i = 0; i < col; i++) {
        if (board[row][i]) {
            return 0;
        }
    }
    
    // Check upper diagonal on left side
    for (int i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j]) {
            return 0;
        }
    }
    
    // Check lower diagonal on left side
    for (int i = row, j = col; j >= 0 && i < N; i++, j--) {
        if (board[i][j]) {
            return 0;
        }
    }
    
    return 1;
}

int solve_n_queens_util(int board[][N], int col) {
    // Base case: If all queens are placed
    if (col >= N) {
        return 1;
    }
    
    // Try placing queen in all rows of this column
    for (int i = 0; i < N; i++) {
        if (is_safe(board, i, col)) {
            // Place queen
            board[i][col] = 1;
            
            // Recur to place rest of queens
            if (solve_n_queens_util(board, col + 1)) {
                return 1;
            }
            
            // Backtrack: Remove queen
            board[i][col] = 0;
        }
    }
    
    // If no placement works
    return 0;
}

int solve_n_queens(int board[][N]) {
    if (solve_n_queens_util(board, 0) == 0) {
        printf("Solution does not exist\n");
        return 0;
    }
    
    // Print solution
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            printf("%d ", board[i][j]);
        }
        printf("\n");
    }
    
    return 1;
}
```

**Optimization Techniques:**
*   **Pruning:** Eliminate branches that cannot lead to a solution
*   **Memoization:** Store results of expensive function calls
*   **Constraint Propagation:** Reduce search space by propagating constraints

### 10.10.4 Branch and Bound

Branch and bound is an algorithm design paradigm for discrete and combinatorial optimization problems.

**Key Components:**
*   **Branching:** Divide problem into subproblems
*   **Bounding:** Calculate upper/lower bounds for subproblems
*   **Pruning:** Eliminate subproblems that cannot contain optimal solution

**Example: Traveling Salesman Problem (TSP)**

```c
#define INF INT_MAX

typedef struct {
    int lower_bound;
    int vertex;
    int path_length;
    int visited[100]; // Assuming max 100 vertices
} Node;

int calculate_bound(int graph[][100], int n, int path[], int path_length, int last_vertex) {
    int bound = path_length;
    
    // Add minimum edge from last vertex
    int min = INF;
    for (int i = 0; i < n; i++) {
        if (!path[i] && graph[last_vertex][i] < min) {
            min = graph[last_vertex][i];
        }
    }
    bound += min;
    
    // Add minimum edges for unvisited vertices
    for (int i = 0; i < n; i++) {
        if (!path[i]) {
            min = INF;
            for (int j = 0; j < n; j++) {
                if (i != j && graph[i][j] < min) {
                    min = graph[i][j];
                }
            }
            bound += min;
        }
    }
    
    return bound;
}

int tsp_branch_and_bound(int graph[][100], int n) {
    // Priority queue for nodes
    PriorityQueue pq;
    pq_init(&pq);
    
    // Create initial node
    Node *root = malloc(sizeof(Node));
    if (!root) return INF;
    
    root->path_length = 0;
    root->vertex = 0;
    memset(root->visited, 0, sizeof(root->visited));
    root->visited[0] = 1;
    root->lower_bound = calculate_bound(graph, n, root->visited, 0, 0);
    
    pq_insert(&pq, root);
    
    int min_cost = INF;
    
    while (!pq_is_empty(&pq)) {
        Node *min_node = pq_extract_min(&pq);
        
        // If this path is complete
        if (min_node->path_length == n - 1) {
            // Add edge back to starting vertex
            int cost = min_node->path_length + graph[min_node->vertex][0];
            if (cost < min_cost) {
                min_cost = cost;
            }
            free(min_node);
            continue;
        }
        
        // Branch: Create child nodes for all unvisited vertices
        for (int i = 0; i < n; i++) {
            if (!min_node->visited[i]) {
                Node *child = malloc(sizeof(Node));
                if (!child) {
                    // Handle error
                    continue;
                }
                
                // Copy parent data
                memcpy(child->visited, min_node->visited, sizeof(min_node->visited));
                child->visited[i] = 1;
                child->path_length = min_node->path_length + 1;
                child->vertex = i;
                child->path_length = min_node->path_length + graph[min_node->vertex][i];
                
                // Calculate bound
                child->lower_bound = calculate_bound(graph, n, 
                                                   child->visited, 
                                                   child->path_length, 
                                                   i);
                
                // If bound is less than current min cost, add to queue
                if (child->lower_bound < min_cost) {
                    pq_insert(&pq, child);
                } else {
                    free(child);
                }
            }
        }
        
        free(min_node);
    }
    
    pq_destroy(&pq);
    return min_cost;
}
```

**Applications:**
*   **Traveling Salesman Problem**
*   **Integer Programming**
*   **Knapsack Problem**
*   **Job Scheduling**

### 10.10.5 Approximation Algorithms

Approximation algorithms find near-optimal solutions for NP-hard problems in polynomial time.

**Key Concepts:**
*   **Approximation Ratio:** How close the solution is to optimal
*   **Polynomial-Time Approximation Scheme (PTAS):** For any ε > 0, can find a (1+ε)-approximation in polynomial time
*   **Fully Polynomial-Time Approximation Scheme (FPTAS):** Polynomial in both input size and 1/ε

**Example: Vertex Cover Approximation**

```c
// 2-approximation algorithm for vertex cover
int vertex_cover_approx(Graph *graph) {
    int V = graph->num_vertices;
    int *cover = calloc(V, sizeof(int));
    int count = 0;
    
    if (!cover) return -1;
    
    // Initialize all vertices as not in cover
    memset(cover, 0, V * sizeof(int));
    
    // Consider all edges one by one
    for (int u = 0; u < V; u++) {
        // Pick all edges adjacent to u
        AdjListNode *p = graph->array[u].head;
        while (p) {
            int v = p->dest;
            
            // If edge u-v is not considered yet
            if (!cover[u] && !cover[v]) {
                // Include u and v in the cover
                cover[u] = 1;
                cover[v] = 1;
                count += 2;
            }
            
            p = p->next;
        }
    }
    
    // Print the vertex cover
    printf("Vertex cover: ");
    for (int i = 0; i < V; i++) {
        if (cover[i]) {
            printf("%d ", i);
        }
    }
    printf("\n");
    
    free(cover);
    return count;
}
```

**Approximation Ratio Proof:**
*   The algorithm produces a vertex cover (all edges are covered)
*   The size of the cover is at most 2 times the optimal solution
*   Because each edge in the matching is covered by two vertices, and the optimal solution must include at least one vertex per edge

**Applications:**
*   **Vertex Cover:** As shown above
*   **Traveling Salesman Problem:** Christofides algorithm (1.5-approximation)
*   **Bin Packing:** First-fit decreasing (11/9 OPT + 1)
*   **Set Cover:** Greedy algorithm (ln n)-approximation

## 10.11 Practical Implementation Considerations

### 10.11.1 Memory Management for Large Datasets

Efficient memory management is critical when implementing algorithms on large datasets.

**Strategies:**
*   **Memory Pooling:** Pre-allocate memory to avoid fragmentation
*   **Object Reuse:** Reuse objects instead of allocating/deallocating
*   **External Memory Algorithms:** Process data in chunks that fit in memory
*   **Memory-Mapped Files:** Use OS memory mapping for large files

**Example: Memory Pool for Graph Nodes**
```c
typedef struct {
    int value;
    struct Node *next;
} Node;

typedef struct {
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

**External Memory Sorting Example:**
See section 10.2.3 for a detailed implementation of external sorting.

### 10.11.2 Cache-Friendly Algorithms

Modern CPUs have multiple cache levels, and algorithms that respect cache hierarchy perform significantly better.

**Principles:**
*   **Spatial Locality:** Access memory sequentially when possible
*   **Temporal Locality:** Reuse data while it's still in cache
*   **Cache Blocking:** Process data in blocks that fit in cache

**Example: Matrix Multiplication Optimization**

**Naive Implementation (Poor Cache Performance):**
```c
void matrix_multiply_naive(int A[][N], int B[][N], int C[][N]) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = 0;
            for (int k = 0; k < N; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}
```

**Cache-Optimized Implementation:**
```c
#define BLOCK_SIZE 32

void matrix_multiply_optimized(int A[][N], int B[][N], int C[][N]) {
    // Initialize result matrix
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            C[i][j] = 0;
        }
    }
    
    // Block-based multiplication
    for (int ii = 0; ii < N; ii += BLOCK_SIZE) {
        for (int jj = 0; jj < N; jj += BLOCK_SIZE) {
            for (int kk = 0; kk < N; kk += BLOCK_SIZE) {
                // Multiply BLOCK_SIZE x BLOCK_SIZE blocks
                for (int i = ii; i < ii + BLOCK_SIZE && i < N; i++) {
                    for (int k = kk; k < kk + BLOCK_SIZE && k < N; k++) {
                        int r = A[i][k];
                        for (int j = jj; j < jj + BLOCK_SIZE && j < N; j++) {
                            C[i][j] += r * B[k][j];
                        }
                    }
                }
            }
        }
    }
}
```

**Why It's Better:**
*   The inner loop accesses `B[k][j]` sequentially
*   The value `A[i][k]` is reused for multiple elements of B
*   Blocks fit in cache, reducing cache misses

**Other Cache Optimization Techniques:**
*   **Loop Tiling:** Restructure loops to improve locality
*   **Data Structure Padding:** Align data to cache lines
*   **Prefetching:** Load data into cache before it's needed
*   **Structure of Arrays (SoA):** Store data by field rather than by object

### 10.11.3 Parallelizing Algorithms

Many algorithms can be parallelized to leverage multi-core processors.

**Approaches:**
*   **Task Parallelism:** Divide work into independent tasks
*   **Data Parallelism:** Process different data elements in parallel
*   **Pipeline Parallelism:** Divide algorithm into stages processed in parallel

**Example: Parallel Merge Sort**

```c
#include <pthread.h>

typedef struct {
    int *array;
    int left;
    int right;
} SortArgs;

void merge(int *array, int left, int mid, int right) {
    // Standard merge operation
}

void *merge_sort_thread(void *arg) {
    SortArgs *sargs = (SortArgs *)arg;
    merge_sort(sargs->array, sargs->left, sargs->right);
    return NULL;
}

void merge_sort(int *array, int left, int right) {
    if (left >= right) return;
    
    int mid = left + (right - left) / 2;
    
    // Sort left half in current thread
    merge_sort(array, left, mid);
    
    // Sort right half in new thread
    SortArgs args = {array, mid + 1, right};
    pthread_t thread;
    
    if (pthread_create(&thread, NULL, merge_sort_thread, &args) == 0) {
        pthread_join(thread, NULL);
    } else {
        // Fallback to sequential if thread creation fails
        merge_sort(array, mid + 1, right);
    }
    
    // Merge the two halves
    merge(array, left, mid, right);
}
```

**Considerations for Parallel Algorithms:**
*   **Workload Balance:** Distribute work evenly among threads
*   **Synchronization Overhead:** Minimize locking and communication
*   **Data Dependencies:** Identify and manage dependencies between operations
*   **Scalability:** Ensure performance improves with more cores

**Advanced Parallel Patterns:**
*   **Parallel Prefix Sum:** Used in many parallel algorithms
*   **Map-Reduce:** Process data in parallel, then combine results
*   **Divide and Conquer Parallelism:** Recursively parallelize subproblems

### 10.11.4 Numerical Stability

Numerical algorithms must consider precision and rounding errors.

**Common Issues:**
*   **Cancellation:** Loss of precision when subtracting nearly equal numbers
*   **Overflow/Underflow:** Values exceeding representable range
*   **Rounding Errors:** Accumulation of small errors in iterative algorithms

**Example: Stable Summation**

**Naive Summation:**
```c
double sum_naive(double arr[], int n) {
    double sum = 0.0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}
```

**Kahan Summation (Compensated Summation):**
```c
double sum_kahan(double arr[], int n) {
    double sum = 0.0;
    double c = 0.0; // A running compensation for lost low-order bits
    
    for (int i = 0; i < n; i++) {
        double y = arr[i] - c; // So far, the low-order bits of y are lost
        double t = sum + y;     // (sum + y) recovers the high-order part of y
        c = (t - sum) - y;      // (t - sum) cancels high-order part of y
                                // leaving low-order part of y
        sum = t;                // Algebraically, c should always be zero
    }                           // Beware hardware optimization discarding "extra" operations
    
    return sum;
}
```

**Why Kahan Summation Works:**
The variable `c` accumulates the rounding errors, which are then subtracted from the next addition, effectively compensating for precision loss.

**Other Numerical Stability Techniques:**
*   **Scaling:** Scale values to prevent overflow/underflow
*   **Reordering Operations:** Change operation order to minimize error
*   **Higher Precision:** Use double instead of float when necessary
*   **Error Analysis:** Analyze and bound potential errors

## 10.12 Conclusion and Path Forward

This chapter has provided a comprehensive exploration of advanced algorithms in C, building upon the foundational knowledge of data structures and memory management established in previous chapters. We've examined sophisticated sorting and searching techniques, graph algorithms, dynamic programming, greedy approaches, string algorithms, computational geometry, and advanced data structures, analyzing both the theoretical underpinnings and practical implementation details.

Key concepts mastered include:
*   Understanding advanced algorithm analysis beyond basic Big O notation
*   Implementing and optimizing advanced sorting algorithms for various scenarios
*   Mastery of graph algorithms for pathfinding, connectivity, and optimization
*   Application of dynamic programming to solve complex optimization problems
*   Strategic use of greedy algorithms when appropriate
*   Implementation of specialized string algorithms for pattern matching
*   Computational geometry techniques for spatial problems
*   Advanced data structures that enable efficient algorithm implementation
*   Algorithm design paradigms including divide and conquer, backtracking, and approximation
*   Practical considerations for memory management, cache efficiency, and parallelism

The examples demonstrated practical implementations that transform theoretical concepts into working solutions, illustrating how sophisticated algorithms enable efficient solutions to complex computational problems. By understanding both the mechanics and strategic implications of algorithm selection, you've gained the ability to choose and implement appropriate approaches for specific computational challenges.

As you progress, the concepts in this chapter form the essential foundation for more advanced topics:
*   **Chapter 11 (System Programming)** will apply these algorithms to operating system components
*   **Chapter 12 (Performance Optimization)** will deepen the performance analysis of algorithm implementations
*   **Chapter 13 (Network Programming)** will leverage graph algorithms for network analysis
*   **Chapter 14 (Database Systems)** will apply indexing and search algorithms to data management

> **"Algorithms are the invisible engines of the digital world—they transform raw data into meaningful information, solve complex problems with elegant efficiency, and push the boundaries of what's computationally possible. Mastering them is not merely about memorizing implementations, but about developing an intuition for the fundamental patterns that underlie all computational problem-solving. This intuition, once cultivated, becomes the most powerful tool in a programmer's arsenal."**

