# 31. Interfacing C with Hardware Protocols

## 31.1 The Critical Bridge: C as the Hardware-Software Interface

In the ecosystem of computing systems, **C occupies a unique and indispensable position as the primary language for hardware interfacing**. Unlike higher-level languages that abstract away hardware details, C provides the precise control, memory access, and performance characteristics required to interact directly with physical devices. This chapter explores how C serves as the critical bridge between software logic and physical hardware, enabling developers to communicate with devices ranging from simple sensors to complex communication peripherals.

> **Critical Insight**: Hardware interfacing in C is fundamentally about **translating abstract data into precise electrical signals and vice versa**. This translation requires understanding both the protocol specifications (the "language" devices speak) and the physical constraints (timing, voltage levels, noise margins) that govern reliable communication. Unlike application programming where errors might cause crashes or incorrect results, hardware interface errors often manifest as subtle, intermittent failures that are difficult to diagnose—making rigorous protocol adherence and thorough validation essential.

### 31.1.1 Why C Dominates Hardware Interfacing

C's supremacy in hardware interfacing stems from several technical advantages that align perfectly with the requirements of direct hardware control:

1.  **Memory Model Precision**: C's pointer arithmetic and memory layout control map directly to hardware register addresses
2.  **Deterministic Performance**: Predictable code generation without garbage collection or runtime surprises
3.  **Minimal Runtime**: No mandatory operating system dependencies—works in bare-metal environments
4.  **Bit-Level Manipulation**: Direct access to individual bits for register programming
5.  **Compiler Maturity**: Decades of optimization for target-specific code generation
6.  **Portability**: Same codebase can target diverse architectures with minimal changes
7.  **Industry Ecosystem**: Vast libraries and tools built around C for hardware development

While newer languages like Rust gain traction in systems programming, C remains the lingua franca of hardware interfaces due to its unparalleled combination of low-level access and widespread toolchain support. The vast majority of microcontroller SDKs, peripheral drivers, and hardware abstraction layers are written in C, making proficiency in hardware-interfacing C essential for embedded and systems developers.

### 31.1.2 Hardware Communication Fundamentals

All hardware communication protocols share common characteristics that shape their implementation in C:

| **Communication Aspect** | **Description**                                      | **C Implementation Impact**                          |
| :----------------------- | :--------------------------------------------------- | :--------------------------------------------------- |
| **Physical Layer**       | **Electrical signaling (voltage levels, timing)**    | **Timing loops, GPIO configuration, signal integrity** |
| **Data Framing**         | **How bits are grouped into meaningful units**       | **Bit manipulation, buffer management**              |
| **Synchronization**      | **How sender/receiver stay in sync**                 | **Clock management, handshaking mechanisms**         |
| **Error Detection**      | **How transmission errors are identified**           | **Checksums, parity bits, error handling**           |
| **Addressing**           | **How multiple devices are selected**                | **Device addressing, chip select management**        |
| **Flow Control**         | **How data rate is managed**                         | **Buffer management, hardware/software flow control** |

**Critical Communication Paradigms**:
- **Synchronous**: Clock signal synchronizes data transfer (SPI, I2C)
- **Asynchronous**: No shared clock; timing based on agreed baud rate (UART)
- **Half-Duplex**: Data flows in one direction at a time (I2C)
- **Full-Duplex**: Simultaneous bidirectional communication (SPI, UART with separate lines)
- **Master/Slave**: One device controls communication (SPI, I2C)
- **Peer-to-Peer**: Equal communication partners (USB in some modes)

### 31.1.3 Memory Access Models for Hardware

C interfaces with hardware through specific memory access patterns:

**Memory-Mapped I/O**:
- Hardware registers appear as memory addresses
- Accessed via pointer dereferencing
- Common on ARM, RISC-V, and most modern architectures
- Example:
  ```c
  // Memory-mapped UART on ARM Cortex-M
  #define UART_BASE 0x4000C000
  #define UART_DR   (*(volatile uint32_t*)(UART_BASE + 0x000))
  #define UART_FR   (*(volatile uint32_t*)(UART_BASE + 0x018))
  
  void uart_write(char c) {
      // Wait until transmit FIFO has space
      while (UART_FR & (1 << 5)) {} // TXFF bit
      UART_DR = c;
  }
  ```

**Port-Mapped I/O**:
- Specialized instructions for I/O access (IN, OUT on x86)
- Separate address space from memory
- Accessed via compiler intrinsics or assembly
- Example:
  ```c
  // Port-mapped UART on x86
  #include <sys/io.h>
  
  void uart_write(char c) {
      // Wait until transmit holding register empty
      while (inb(0x3FD) & 0x20) {} // LSR register, THRE bit
      outb(c, 0x3F8); // Write to data register
  }
  ```

**Critical Implementation Considerations**:
1.  **`volatile` Keyword**: Prevents compiler optimizations that would skip "redundant" reads/writes
2.  **Memory Barriers**: Ensures correct ordering of hardware accesses (compiler and CPU)
3.  **Alignment Requirements**: Some architectures require aligned accesses to registers
4.  **Atomicity**: Critical sections for multi-byte register access

## 31.2 Serial Communication Protocols

### 31.2.1 UART (Universal Asynchronous Receiver-Transmitter)

UART is the simplest serial communication protocol, widely used for debugging, sensor interfaces, and low-speed communication.

**Protocol Fundamentals**:
- Asynchronous (no clock signal)
- Fixed baud rate (bits per second)
- Data frame: Start bit (0) + 5-9 data bits + optional parity + 1-2 stop bits (1)
- Common configurations: 8N1 (8 data bits, no parity, 1 stop bit)

**Hardware Implementation**:
```
    ┌─────────┐     ┌─────────┐     ┌─────────┐
TXD │ START   │  D0 │    D1   │ ... │  STOP   │
    │ (0)     │     │         │     │ (1)     │
    └─────────┴─────┴─────────┴─────┴─────────┘
      1 bit       1 bit       1 bit   1-2 bits
```

**Register-Based UART Control**:
```c
// STM32F4 UART register definitions (simplified)
typedef struct {
    volatile uint32_t SR;   // Status register
    volatile uint32_t DR;   // Data register
    volatile uint32_t BRR;  // Baud rate register
    volatile uint32_t CR1;  // Control register 1
    // ... other registers
} UART_TypeDef;

#define UART2_BASE 0x40004400
#define UART2 ((UART_TypeDef*)UART2_BASE)

// UART initialization
void uart_init(uint32_t baud_rate) {
    // Enable clock to UART2 and GPIOA
    RCC->APB1ENR |= RCC_APB1ENR_USART2EN;
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    
    // Configure PA2 (TX) and PA3 (RX) as alternate function
    GPIOA->MODER &= ~(GPIO_MODER_MODE2 | GPIO_MODER_MODE3);
    GPIOA->MODER |= (GPIO_MODER_MODE2_1 | GPIO_MODER_MODE3_1); // Alternate function mode
    GPIOA->AFR[0] &= ~((0xF << (2*4)) | (0xF << (3*4)));
    GPIOA->AFR[0] |= ((7 << (2*4)) | (7 << (3*4))); // AF7 for USART2
    
    // Calculate baud rate divisor
    uint32_t bus_clock = 42000000; // Example APB1 clock
    UART2->BRR = (bus_clock + baud_rate/2) / baud_rate;
    
    // Enable transmitter and receiver
    UART2->CR1 = USART_CR1_TE | USART_CR1_RE;
    
    // Enable UART
    UART2->CR1 |= USART_CR1_UE;
}

// Blocking write (polling)
void uart_write(char c) {
    // Wait until transmit data register empty
    while (!(UART2->SR & USART_SR_TXE)) {}
    UART2->DR = c;
}

// Non-blocking write with buffer
#define UART_TX_BUFFER_SIZE 64
static char tx_buffer[UART_TX_BUFFER_SIZE];
static volatile uint16_t tx_head, tx_tail;

void uart_write_async(char c) {
    uint16_t next_head = (tx_head + 1) % UART_TX_BUFFER_SIZE;
    if (next_head != tx_tail) {
        tx_buffer[tx_head] = c;
        tx_head = next_head;
        
        // Enable TXE interrupt if not already enabled
        if (!(UART2->CR1 & USART_CR1_TXEIE)) {
            UART2->CR1 |= USART_CR1_TXEIE;
        }
    }
}

// UART interrupt handler
void USART2_IRQHandler(void) {
    if (UART2->SR & USART_SR_TXE) {
        if (tx_tail != tx_head) {
            // Transmit next character
            UART2->DR = tx_buffer[tx_tail];
            tx_tail = (tx_tail + 1) % UART_TX_BUFFER_SIZE;
        } else {
            // Buffer empty - disable TXE interrupt
            UART2->CR1 &= ~USART_CR1_TXEIE;
        }
    }
}
```

**Critical UART Considerations**:
- **Baud Rate Accuracy**: Clock source precision affects communication reliability
- **FIFO Management**: Hardware FIFOs require careful handling to avoid overflows
- **Flow Control**: Hardware (RTS/CTS) or software (XON/XOFF) flow control for high speeds
- **Error Handling**: Framing errors, parity errors, overrun errors
- **Timing Constraints**: Interrupt latency affects maximum baud rate

### 31.2.2 SPI (Serial Peripheral Interface)

SPI is a synchronous, full-duplex protocol commonly used for high-speed communication with peripherals like displays, sensors, and memory.

**Protocol Fundamentals**:
- Synchronous (clock signal from master)
- Full-duplex (simultaneous send/receive)
- Master/slave architecture
- Four-wire interface:
  - SCLK: Serial Clock (output from master)
  - MOSI: Master Out Slave In
  - MISO: Master In Slave Out
  - CS/SS: Chip Select/Slave Select (active low)

**Clock Polarity and Phase**:
- **CPOL (Clock Polarity)**: Idle state of clock (0=idle low, 1=idle high)
- **CPHA (Clock Phase)**: Edge for data capture (0=leading edge, 1=trailing edge)
- Four possible mode combinations (0-3)

**Hardware Implementation**:
```
Master:  ┌───────┐     ┌───────┐     ┌───────┐
        SCLK  ──┘       └───────┘       └───────
        MOSI  ──┐   D0  ┌───┐   D1  ┌───┐
        MISO  ──┘   D0  └───┘   D1  └───┘
        CS    ────────────┐           ┌─────────
Slave:  ┌───────┐         └───────────┘
        SCLK  ──┐       ┌───────┐       ┌───────
        MOSI  ──┘   D0  └───┘   D1  └───┘
        MISO  ──┐   D0  ┌───┐   D1  ┌───┐
        CS    ────────────┘           └─────────
```

**Register-Based SPI Control**:
```c
// STM32F4 SPI register definitions (simplified)
typedef struct {
    volatile uint32_t CR1;    // Control register 1
    volatile uint32_t CR2;    // Control register 2
    volatile uint32_t SR;     // Status register
    volatile uint32_t DR;     // Data register
    // ... other registers
} SPI_TypeDef;

#define SPI1_BASE 0x40013000
#define SPI1 ((SPI_TypeDef*)SPI1_BASE)

// SPI initialization
void spi_init(uint32_t clock_speed, uint8_t mode) {
    // Enable clock to SPI1 and GPIOA
    RCC->APB2ENR |= RCC_APB2ENR_SPI1EN;
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    
    // Configure PA5 (SCLK), PA6 (MISO), PA7 (MOSI) as alternate function
    GPIOA->MODER &= ~(GPIO_MODER_MODE5 | GPIO_MODER_MODE6 | GPIO_MODER_MODE7);
    GPIOA->MODER |= (GPIO_MODER_MODE5_1 | 
                    GPIO_MODER_MODE6_1 | 
                    GPIO_MODER_MODE7_1);
    GPIOA->AFR[0] &= ~((0xF << (5*4)) | (0xF << (6*4)) | (0xF << (7*4)));
    GPIOA->AFR[0] |= ((5 << (5*4)) | (5 << (6*4)) | (5 << (7*4))); // AF5 for SPI1
    
    // Configure PA4 as GPIO output for CS (software-controlled)
    GPIOA->MODER &= ~GPIO_MODER_MODE4;
    GPIOA->MODER |= GPIO_MODER_MODE4_0; // Output mode
    GPIOA->BSRR = (1 << (4 + 16)); // Set CS high (inactive)
    
    // Calculate baud rate prescaler
    uint32_t bus_clock = 84000000; // Example APB2 clock
    uint32_t prescaler = 0;
    while (bus_clock > clock_speed) {
        bus_clock >>= 1;
        prescaler++;
        if (prescaler >= 7) break;
    }
    
    // Configure SPI parameters
    SPI1->CR1 = 
        (prescaler << 3) |     // Baud rate prescaler
        ((mode & 0x1) << 0) |  // CPHA
        ((mode & 0x2) << 1) |  // CPOL (shifted)
        SPI_CR1_MSTR |         // Master mode
        SPI_CR1_SSM |          // Software slave management
        SPI_CR1_SSI |          // Internal slave select
        SPI_CR1_BR_2 |         // Set to 010 (64:1) as starting point
        SPI_CR1_BR_0;
    
    // Enable SPI
    SPI1->CR1 |= SPI_CR1_SPE;
}

// SPI transfer (full-duplex)
uint8_t spi_transfer(uint8_t data) {
    // Wait until transmit buffer empty
    while (!(SPI1->SR & SPI_SR_TXE)) {}
    
    // Write data to DR
    SPI1->DR = data;
    
    // Wait until receive buffer not empty
    while (!(SPI1->SR & SPI_SR_RXNE)) {}
    
    // Read received data
    return (uint8_t)SPI1->DR;
}

// SPI transaction with CS handling
void spi_transaction(uint8_t *tx, uint8_t *rx, size_t len) {
    // Activate slave (CS low)
    GPIOA->BSRR = (1 << (4 + 16)); // Clear PA4
    
    // Transfer data
    for (size_t i = 0; i < len; i++) {
        rx[i] = spi_transfer(tx[i]);
    }
    
    // Deactivate slave (CS high)
    GPIOA->BSRR = (1 << 4);
}
```

**Bit-Banged SPI Implementation**:
```c
// Software-controlled SPI (bit-banging)
#define SPI_SCLK_PIN 5
#define SPI_MOSI_PIN 7
#define SPI_MISO_PIN 6
#define SPI_CS_PIN   4

void spi_bitbang_init(void) {
    // Configure GPIO pins
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    
    // SCLK, MOSI, CS as outputs
    GPIOA->MODER &= ~(GPIO_MODER_MODE5 | 
                     GPIO_MODER_MODE7 | 
                     GPIO_MODER_MODE4);
    GPIOA->MODER |= (GPIO_MODER_MODE5_0 | 
                    GPIO_MODER_MODE7_0 | 
                    GPIO_MODER_MODE4_0);
    
    // MISO as input
    GPIOA->MODER &= ~GPIO_MODER_MODE6;
    
    // Set initial states
    GPIOA->BSRR = (1 << (SPI_SCLK_PIN + 16)) | // SCLK high
                 (1 << (SPI_CS_PIN + 16));     // CS high
}

uint8_t spi_bitbang_transfer(uint8_t data) {
    uint8_t result = 0;
    
    for (int i = 7; i >= 0; i--) {
        // Set MOSI
        if (data & (1 << i)) {
            GPIOA->BSRR = (1 << SPI_MOSI_PIN);
        } else {
            GPIOA->BSRR = (1 << (SPI_MOSI_PIN + 16));
        }
        
        // Toggle clock (assuming mode 0: CPOL=0, CPHA=0)
        GPIOA->BSRR = (1 << SPI_SCLK_PIN);     // Clock high
        __NOP(); __NOP(); __NOP(); __NOP();    // Delay for timing
        result <<= 1;
        if (GPIOA->IDR & (1 << SPI_MISO_PIN)) {
            result |= 1;
        }
        GPIOA->BSRR = (1 << (SPI_SCLK_PIN + 16)); // Clock low
        __NOP(); __NOP(); __NOP(); __NOP();    // Delay for timing
    }
    
    return result;
}
```

**Critical SPI Considerations**:
- **Clock Speed**: Must match slave device capabilities
- **Mode Selection**: CPOL/CPHA must match slave requirements
- **Chip Select Management**: Timing relative to clock
- **Timing Constraints**: Setup/hold times for data
- **Hardware vs. Software SPI**: Hardware SPI handles timing precisely; bit-banging offers flexibility but timing challenges

### 31.2.3 I2C (Inter-Integrated Circuit)

I2C is a synchronous, half-duplex protocol designed for connecting multiple devices with minimal wiring.

**Protocol Fundamentals**:
- Synchronous (clock signal from master)
- Half-duplex (bidirectional data line)
- Multi-master capable
- Two-wire interface:
  - SCL: Serial Clock (open-drain, pulled up)
  - SDA: Serial Data (open-drain, pulled up)
- 7-bit or 10-bit device addressing
- ACK/NACK after each byte

**Signal Timing**:
- START condition: SDA transitions from high to low while SCL is high
- STOP condition: SDA transitions from low to high while SCL is high
- Data valid when SCL is high (setup/hold times critical)

**Hardware Implementation**:
```
        ┌───┐   ┌───┐   ┌───┐   ┌───┐
SCL  ───┘   └───┘   └───┘   └───┘   └──
        ┌─────────────────────────────┐
SDA  ───┘                             └──
       START                          STOP
```

**Register-Based I2C Control**:
```c
// STM32F4 I2C register definitions (simplified)
typedef struct {
    volatile uint32_t CR1;    // Control register 1
    volatile uint32_t CR2;    // Control register 2
    volatile uint32_t OAR1;   // Own address register 1
    volatile uint32_t OAR2;   // Own address register 2
    volatile uint32_t DR;     // Data register
    volatile uint32_t SR1;    // Status register 1
    volatile uint32_t SR2;    // Status register 2
    volatile uint32_t CCR;    // Clock control register
    // ... other registers
} I2C_TypeDef;

#define I2C1_BASE 0x40005400
#define I2C1 ((I2C_TypeDef*)I2C1_BASE)

// I2C initialization
void i2c_init(uint32_t clock_speed) {
    // Enable clock to I2C1 and GPIOB
    RCC->APB1ENR |= RCC_APB1ENR_I2C1EN;
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOBEN;
    
    // Configure PB6 (SCL) and PB7 (SDA) as alternate function open-drain
    GPIOB->MODER &= ~(GPIO_MODER_MODE6 | GPIO_MODER_MODE7);
    GPIOB->MODER |= (GPIO_MODER_MODE6_1 | GPIO_MODER_MODE7_1);
    GPIOB->OTYPER |= (GPIO_OTYPER_OT_6 | GPIO_OTYPER_OT_7); // Open-drain
    GPIOB->OSPEEDR |= (GPIO_OSPEEDER_OSPEEDR6 | GPIO_OSPEEDER_OSPEEDR7); // High speed
    GPIOB->PUPDR |= (GPIO_PUPDR_PUPDR6_0 | GPIO_PUPDR_PUPDR7_0); // Pull-up
    GPIOB->AFR[0] &= ~((0xF << (6*4)) | (0xF << (7*4)));
    GPIOB->AFR[0] |= ((4 << (6*4)) | (4 << (7*4))); // AF4 for I2C1
    
    // Calculate clock control register value
    uint32_t bus_clock = 30000000; // Example APB1 clock
    uint16_t ccr = 0;
    
    if (clock_speed <= 100000) {
        // Standard mode (100 kHz)
        ccr = (uint16_t)(bus_clock / (clock_speed * 2));
        if (ccr < 0x04) ccr = 0x04; // Minimum value
        I2C1->CCR = ccr;
        I2C1->TRISE = (bus_clock / 1000000) + 1; // Max rise time
    } else {
        // Fast mode (400 kHz)
        ccr = (uint16_t)(bus_clock / (clock_speed * 3));
        if (ccr < 0x01) ccr = 0x01;
        I2C1->CCR = I2C_CCR_FS | ccr;
        I2C1->TRISE = (bus_clock / 10000000) * 300 / 1000 + 1;
    }
    
    // Enable I2C
    I2C1->CR1 |= I2C_CR1_PE;
}

// Generate START condition
bool i2c_start(void) {
    // Wait until bus not busy
    uint32_t timeout = 10000;
    while ((I2C1->SR2 & I2C_SR2_BUSY) && --timeout) {}
    if (!timeout) return false;
    
    // Generate START
    I2C1->CR1 |= I2C_CR1_START;
    
    // Wait for SB flag (START generated)
    timeout = 10000;
    while (!(I2C1->SR1 & I2C_SR1_SB) && --timeout) {}
    if (!timeout) {
        I2C1->CR1 |= I2C_CR1_STOP;
        return false;
    }
    
    return true;
}

// Send slave address
bool i2c_address(uint8_t address, bool read) {
    // Send address (7-bit address + R/W bit)
    I2C1->DR = (address << 1) | (read ? 1 : 0);
    
    // Wait for ADDR flag
    uint32_t timeout = 10000;
    while (!(I2C1->SR1 & I2C_SR1_ADDR) && --timeout) {}
    if (!timeout) {
        I2C1->CR1 |= I2C_CR1_STOP;
        return false;
    }
    
    // Clear ADDR flag by reading SR1 then SR2
    __IO uint32_t tmp = I2C1->SR1;
    tmp = I2C1->SR2;
    (void)tmp;
    
    return true;
}

// Send a byte of data
bool i2c_send_byte(uint8_t data) {
    I2C1->DR = data;
    
    // Wait for TXE or BTF
    uint32_t timeout = 10000;
    while (!((I2C1->SR1 & I2C_SR1_TXE) || (I2C1->SR1 & I2C_SR1_BTF)) && --timeout) {}
    if (!timeout) {
        I2C1->CR1 |= I2C_CR1_STOP;
        return false;
    }
    
    // Check for NACK
    if (I2C1->SR1 & I2C_SR1_AF) {
        I2C1->CR1 |= I2C_CR1_STOP;
        I2C1->SR1 &= ~I2C_SR1_AF; // Clear AF
        return false;
    }
    
    return true;
}

// Receive a byte of data
bool i2c_receive_byte(uint8_t *data, bool last) {
    if (last) {
        // Disable ACK for last byte
        I2C1->CR1 &= ~I2C_CR1_ACK;
        // Generate STOP after reading data
        I2C1->CR1 |= I2C_CR1_STOP;
    }
    
    // Wait for RXNE
    uint32_t timeout = 10000;
    while (!(I2C1->SR1 & I2C_SR1_RXNE) && --timeout) {}
    if (!timeout) return false;
    
    *data = (uint8_t)I2C1->DR;
    return true;
}

// I2C write transaction
bool i2c_write(uint8_t address, const uint8_t *data, size_t len) {
    if (!i2c_start()) return false;
    if (!i2c_address(address, false)) return false;
    
    for (size_t i = 0; i < len; i++) {
        if (!i2c_send_byte(data[i])) return false;
    }
    
    // Generate STOP
    I2C1->CR1 |= I2C_CR1_STOP;
    return true;
}

// I2C read transaction
bool i2c_read(uint8_t address, uint8_t *data, size_t len) {
    if (!i2c_start()) return false;
    if (!i2c_address(address, true)) return false;
    
    for (size_t i = 0; i < len; i++) {
        if (!i2c_receive_byte(&data[i], i == len-1)) return false;
    }
    
    return true;
}
```

**Bit-Banged I2C Implementation**:
```c
// Software-controlled I2C (bit-banging)
#define I2C_SCL_PIN 6
#define I2C_SDA_PIN 7

void i2c_bitbang_init(void) {
    // Configure GPIO pins as open-drain outputs
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOBEN;
    
    GPIOB->MODER &= ~(GPIO_MODER_MODE6 | GPIO_MODER_MODE7);
    GPIOB->MODER |= (GPIO_MODER_MODE6_0 | GPIO_MODER_MODE7_0);
    GPIOB->OTYPER |= (GPIO_OTYPER_OT_6 | GPIO_OTYPER_OT_7);
    GPIOB->OSPEEDR |= (GPIO_OSPEEDER_OSPEEDR6 | GPIO_OSPEEDER_OSPEEDR7);
    GPIOB->PUPDR |= (GPIO_PUPDR_PUPDR6_0 | GPIO_PUPDR_PUPDR7_0);
    
    // Set initial states (both lines high)
    GPIOB->BSRR = (1 << (I2C_SCL_PIN + 16)) | (1 << (I2C_SDA_PIN + 16));
}

// Set SCL line state
void i2c_scl(bool state) {
    if (state) {
        GPIOB->BSRR = (1 << (I2C_SCL_PIN + 16)); // Set high (release)
    } else {
        GPIOB->BSRR = (1 << I2C_SCL_PIN);        // Set low
    }
    __NOP(); __NOP(); // Timing delay
}

// Set SDA line state
void i2c_sda(bool state) {
    if (state) {
        GPIOB->BSRR = (1 << (I2C_SDA_PIN + 16)); // Set high (release)
    } else {
        GPIOB->BSRR = (1 << I2C_SDA_PIN);        // Set low
    }
    __NOP(); __NOP(); // Timing delay
}

// Read SDA line state
bool i2c_read_sda(void) {
    // Configure as input to read
    GPIOB->MODER &= ~(GPIO_MODER_MODE7);
    bool state = (GPIOB->IDR & (1 << I2C_SDA_PIN)) != 0;
    // Return to output mode
    GPIOB->MODER |= GPIO_MODER_MODE7_0;
    __NOP(); __NOP();
    return state;
}

// Generate START condition
void i2c_start(void) {
    // Both lines should be high
    i2c_sda(true);
    i2c_scl(true);
    
    // START: SDA low while SCL high
    i2c_sda(false);
    i2c_scl(false); // Hold SCL low after START
}

// Generate STOP condition
void i2c_stop(void) {
    // SCL should be low
    i2c_scl(false);
    i2c_sda(false);
    
    // STOP: SDA high while SCL high
    i2c_scl(true);
    i2c_sda(true);
}

// Send a byte and get ACK
bool i2c_send_byte(uint8_t byte) {
    for (int i = 7; i >= 0; i--) {
        i2c_scl(false);
        i2c_sda((byte >> i) & 1);
        i2c_scl(true);
    }
    
    // Read ACK (SDA should be low)
    i2c_scl(false);
    i2c_sda(true); // Release SDA
    i2c_scl(true);
    bool ack = !i2c_read_sda();
    i2c_scl(false);
    
    return ack;
}

// Receive a byte and send ACK
uint8_t i2c_receive_byte(bool send_ack) {
    uint8_t byte = 0;
    
    // Configure SDA as input
    GPIOB->MODER &= ~GPIO_MODER_MODE7;
    
    for (int i = 7; i >= 0; i--) {
        i2c_scl(false);
        __NOP(); __NOP();
        i2c_scl(true);
        byte |= (i2c_read_sda() << i);
    }
    
    // Send ACK/NACK
    i2c_scl(false);
    i2c_sda(!send_ack); // NACK when send_ack is false
    i2c_scl(true);
    i2c_scl(false);
    
    // Return SDA to output mode
    GPIOB->MODER |= GPIO_MODER_MODE7_0;
    
    return byte;
}

// I2C write transaction
bool i2c_write(uint8_t address, const uint8_t *data, size_t len) {
    i2c_start();
    
    // Send address (write)
    if (!i2c_send_byte((address << 1) | 0)) {
        i2c_stop();
        return false;
    }
    
    // Send data
    for (size_t i = 0; i < len; i++) {
        if (!i2c_send_byte(data[i])) {
            i2c_stop();
            return false;
        }
    }
    
    i2c_stop();
    return true;
}

// I2C read transaction
bool i2c_read(uint8_t address, uint8_t *data, size_t len) {
    i2c_start();
    
    // Send address (read)
    if (!i2c_send_byte((address << 1) | 1)) {
        i2c_stop();
        return false;
    }
    
    // Receive data
    for (size_t i = 0; i < len; i++) {
        data[i] = i2c_receive_byte(i < len-1);
    }
    
    i2c_stop();
    return true;
}
```

**Critical I2C Considerations**:
- **Pull-up Resistors**: Essential for open-drain operation (typically 1-10kΩ)
- **Bus Capacitance**: Limits maximum speed (rise/fall times)
- **Clock Stretching**: Slaves can hold SCL low to slow communication
- **Arbitration**: Multi-master conflict resolution
- **Address Conflicts**: Multiple devices with same address cause bus errors

## 31.3 USB Programming in C

### 31.3.1 USB Protocol Fundamentals

USB (Universal Serial Bus) is a complex protocol designed for versatile device connectivity. Understanding its architecture is essential for effective implementation.

**USB Architecture**:
- **Host-centric**: Single host controls all communication
- **Tiered star topology**: Hubs expand connectivity
- **Differential signaling**: D+ and D- for noise immunity
- **Speed tiers**: Low (1.5 Mbps), Full (12 Mbps), High (480 Mbps), SuperSpeed (5+ Gbps)

**USB Data Flow Model**:
- **Control Transfers**: For device configuration and command/status
- **Interrupt Transfers**: For periodic, low-latency data (keyboards, mice)
- **Bulk Transfers**: For large, reliable data with no timing guarantees (printers, storage)
- **Isochronous Transfers**: For time-sensitive data with no error correction (audio, video)

**USB Descriptors**:
- **Device Descriptor**: Basic device information (vendor ID, product ID, etc.)
- **Configuration Descriptor**: Power requirements, interfaces
- **Interface Descriptor**: Functionality provided by the device
- **Endpoint Descriptor**: Communication channels (address, type, size)
- **String Descriptors**: Human-readable strings (manufacturer, product)

### 31.3.2 USB Device Development

Developing a USB device requires implementing the USB protocol stack on the device side.

**USB Device Stack Components**:
1.  **Physical Layer**: USB transceiver handling differential signals
2.  **Link Layer**: Packet formatting, CRC, handshaking
3.  **Protocol Layer**: Control transfers, enumeration
4.  **Function Layer**: Device-specific functionality

**USB Device Descriptor Example**:
```c
// USB device descriptor
typedef struct {
    uint8_t  bLength;            // Size of this descriptor
    uint8_t  bDescriptorType;    // DEVICE (0x01)
    uint16_t bcdUSB;             // USB specification release (e.g., 0x0200 = USB 2.0)
    uint8_t  bDeviceClass;       // Device class (0=defined at interface level)
    uint8_t  bDeviceSubClass;    // Device subclass
    uint8_t  bDeviceProtocol;    // Device protocol
    uint8_t  bMaxPacketSize0;    // Max packet size for endpoint 0
    uint16_t idVendor;           // Vendor ID (assigned by USB-IF)
    uint16_t idProduct;          // Product ID (assigned by vendor)
    uint16_t bcdDevice;          // Device release number
    uint8_t  iManufacturer;      // Index of manufacturer string
    uint8_t  iProduct;           // Index of product string
    uint8_t  iSerialNumber;      // Index of serial number string
    uint8_t  bNumConfigurations; // Number of configurations
} USB_DeviceDescriptor;

// Example descriptor
static const USB_DeviceDescriptor device_descriptor = {
    .bLength            = sizeof(USB_DeviceDescriptor),
    .bDescriptorType    = 0x01, // DEVICE
    .bcdUSB             = 0x0200, // USB 2.0
    .bDeviceClass       = 0x00, // Defined at interface level
    .bDeviceSubClass    = 0x00,
    .bDeviceProtocol    = 0x00,
    .bMaxPacketSize0    = 64,   // Endpoint 0 max packet size
    .idVendor           = 0x1234, // Example vendor ID
    .idProduct          = 0x5678, // Example product ID
    .bcdDevice          = 0x0100, // Version 1.0
    .iManufacturer      = 1,    // String index 1
    .iProduct           = 2,    // String index 2
    .iSerialNumber      = 3,    // String index 3
    .bNumConfigurations = 1     // One configuration
};
```

**USB Configuration Descriptor Example**:
```c
// Configuration descriptor
typedef struct {
    uint8_t  bLength;             // Size of this descriptor
    uint8_t  bDescriptorType;     // CONFIGURATION (0x02)
    uint16_t wTotalLength;        // Total length of configuration
    uint8_t  bNumInterfaces;      // Number of interfaces
    uint8_t  bConfigurationValue; // Value for SetConfiguration
    uint8_t  iConfiguration;      // Index of string descriptor
    uint8_t  bmAttributes;        // Attributes (bus-powered, self-powered, remote wakeup)
    uint8_t  bMaxPower;           // Max power in 2mA units
} USB_ConfigDescriptor;

// Interface descriptor
typedef struct {
    uint8_t  bLength;            // Size of this descriptor
    uint8_t  bDescriptorType;    // INTERFACE (0x04)
    uint8_t  bInterfaceNumber;   // Zero-based interface number
    uint8_t  bAlternateSetting;  // Alternate setting
    uint8_t  bNumEndpoints;      // Number of endpoints (excluding EP0)
    uint8_t  bInterfaceClass;    // Interface class
    uint8_t  bInterfaceSubClass; // Interface subclass
    uint8_t  bInterfaceProtocol; // Interface protocol
    uint8_t  iInterface;         // Index of string descriptor
} USB_InterfaceDescriptor;

// Endpoint descriptor
typedef struct {
    uint8_t  bLength;           // Size of this descriptor
    uint8_t  bDescriptorType;   // ENDPOINT (0x05)
    uint8_t  bEndpointAddress;  // Endpoint address (direction and number)
    uint8_t  bmAttributes;      // Transfer type (control, interrupt, bulk, isochronous)
    uint16_t wMaxPacketSize;    // Maximum packet size
    uint8_t  bInterval;         // Polling interval (for interrupt/isochronous)
} USB_EndpointDescriptor;

// Example configuration (simplified)
static const uint8_t config_descriptor[] = {
    // Configuration descriptor
    0x09,                        // bLength
    0x02,                        // bDescriptorType = CONFIGURATION
    0x22, 0x00,                  // wTotalLength (34 bytes)
    0x01,                        // bNumInterfaces
    0x01,                        // bConfigurationValue
    0x00,                        // iConfiguration
    0xC0,                        // bmAttributes (self-powered, remote wakeup)
    0x32,                        // bMaxPower (100mA)
    
    // Interface descriptor
    0x09,                        // bLength
    0x04,                        // bDescriptorType = INTERFACE
    0x00,                        // bInterfaceNumber
    0x00,                        // bAlternateSetting
    0x02,                        // bNumEndpoints (1 IN, 1 OUT)
    0xFF,                        // bInterfaceClass (vendor-specific)
    0x00,                        // bInterfaceSubClass
    0x00,                        // bInterfaceProtocol
    0x00,                        // iInterface
    
    // Endpoint 1 IN (interrupt)
    0x07,                        // bLength
    0x05,                        // bDescriptorType = ENDPOINT
    0x81,                        // bEndpointAddress (IN, endpoint 1)
    0x03,                        // bmAttributes (interrupt)
    0x40, 0x00,                  // wMaxPacketSize (64 bytes)
    0x01,                        // bInterval (1ms)
    
    // Endpoint 1 OUT (bulk)
    0x07,                        // bLength
    0x05,                        // bDescriptorType = ENDPOINT
    0x01,                        // bEndpointAddress (OUT, endpoint 1)
    0x02,                        // bmAttributes (bulk)
    0x40, 0x00,                  // wMaxPacketSize (64 bytes)
    0x00                         // bInterval (unused)
};
```

**USB Device State Machine**:
```c
typedef enum {
    USB_STATE_DETACHED,
    USB_STATE_ATTACHED,
    USB_STATE_POWERED,
    USB_STATE_DEFAULT,
    USB_STATE_ADDRESS,
    USB_STATE_CONFIGURED,
    USB_STATE_SUSPENDED
} USB_DeviceState;

static USB_DeviceState device_state = USB_STATE_DETACHED;

// Handle USB reset
void usb_handle_reset(void) {
    // Reset endpoint states
    endpoint0_state = EP0_STATE_SETUP;
    
    // Clear device address
    usb_set_address(0);
    
    // Reset device state
    device_state = USB_STATE_DEFAULT;
}

// Handle SET_ADDRESS request
void usb_set_address(uint8_t address) {
    // Store address for later application
    current_address = address;
    
    // Will apply after status phase
    apply_address_after_status = true;
}

// Handle SET_CONFIGURATION request
void usb_set_configuration(uint8_t config) {
    if (config == 0) {
        // Unconfigure device
        device_state = USB_STATE_ADDRESS;
    } else if (config == 1) {
        // Configure device
        device_state = USB_STATE_CONFIGURED;
        
        // Initialize endpoints
        endpoint_init();
    }
}
```

**USB Control Transfer Handling**:
```c
// Setup packet structure
typedef struct {
    uint8_t  bmRequestType; // Bitmapped fields (direction, type, recipient)
    uint8_t  bRequest;      // Request code
    uint16_t wValue;        // Word-sized field (varies by request)
    uint16_t wIndex;        // Word-sized field (varies by request)
    uint16_t wLength;       // Number of bytes to transfer
} USB_SetupPacket;

// Control transfer states
typedef enum {
    EP0_STATE_SETUP,
    EP0_STATE_DATA_IN,
    EP0_STATE_DATA_OUT,
    EP0_STATE_STATUS_IN,
    EP0_STATE_STATUS_OUT
} EP0_State;

static EP0_State endpoint0_state = EP0_STATE_SETUP;
static USB_SetupPacket setup_packet;
static uint8_t *control_buf;
static uint16_t control_len;
static uint16_t control_sent;

// Handle setup packet
void usb_handle_setup(const USB_SetupPacket *pkt) {
    setup_packet = *pkt;
    endpoint0_state = EP0_STATE_SETUP;
    
    // Handle standard requests
    switch (pkt->bRequest) {
        case USB_REQ_GET_DESCRIPTOR:
            usb_handle_get_descriptor(pkt);
            break;
            
        case USB_REQ_SET_ADDRESS:
            usb_handle_set_address(pkt);
            break;
            
        case USB_REQ_SET_CONFIGURATION:
            usb_handle_set_configuration(pkt);
            break;
            
        // ... other standard requests
            
        default:
            // Vendor-specific request
            usb_handle_vendor_request(pkt);
            break;
    }
}

// Handle GET_DESCRIPTOR request
void usb_handle_get_descriptor(const USB_SetupPacket *pkt) {
    uint8_t type = pkt->wValue >> 8;
    uint8_t index = pkt->wValue & 0xFF;
    uint16_t length = pkt->wLength;
    
    switch (type) {
        case USB_DESC_DEVICE:
            control_buf = (uint8_t*)&device_descriptor;
            control_len = sizeof(device_descriptor);
            break;
            
        case USB_DESC_CONFIGURATION:
            control_buf = (uint8_t*)config_descriptor;
            control_len = config_descriptor[2] | (config_descriptor[3] << 8);
            break;
            
        case USB_DESC_STRING:
            if (index == 0) {
                // Language ID descriptor
                static const uint8_t lang_id[] = {4, 3, 0x09, 0x04}; // English (US)
                control_buf = (uint8_t*)lang_id;
                control_len = 4;
            } else {
                // Find string in string table
                control_buf = get_string_descriptor(index);
                if (!control_buf) {
                    usb_stall_endpoint(0);
                    return;
                }
                control_len = control_buf[0];
            }
            break;
            
        default:
            usb_stall_endpoint(0);
            return;
    }
    
    // Limit to requested length
    if (control_len > length) {
        control_len = length;
    }
    
    // Send data phase (IN)
    control_sent = 0;
    endpoint0_state = EP0_STATE_DATA_IN;
    usb_send_packet(0, control_buf, control_len > 64 ? 64 : control_len);
}

// Handle SET_ADDRESS request
void usb_handle_set_address(const USB_SetupPacket *pkt) {
    uint8_t address = pkt->wValue & 0x7F;
    
    // Store address for after status phase
    pending_address = address;
    apply_address_after_status = true;
    
    // Status phase (IN)
    endpoint0_state = EP0_STATE_STATUS_IN;
    usb_send_zlp(0);
}

// Handle data IN transfer completion
void usb_handle_in_complete(uint8_t ep_num) {
    if (ep_num == 0) {
        switch (endpoint0_state) {
            case EP0_STATE_DATA_IN:
                control_sent += 64;
                if (control_sent < control_len) {
                    // Send next packet
                    uint16_t remaining = control_len - control_sent;
                    usb_send_packet(0, control_buf + control_sent, 
                                  remaining > 64 ? 64 : remaining);
                } else {
                    // Data phase complete - status phase
                    endpoint0_state = EP0_STATE_STATUS_OUT;
                }
                break;
                
            case EP0_STATE_STATUS_IN:
                if (apply_address_after_status) {
                    usb_set_address(pending_address);
                    apply_address_after_status = false;
                }
                endpoint0_state = EP0_STATE_SETUP;
                break;
                
            default:
                break;
        }
    }
    // Handle other endpoints...
}
```

### 31.3.3 USB Host Programming with libusb

libusb provides a cross-platform API for USB host programming in C.

**libusb Architecture**:
- **Device Discovery**: Enumerate connected devices
- **Device Handling**: Open/close devices, claim interfaces
- **Transfer Management**: Synchronous and asynchronous transfers
- **Event Handling**: Monitor device events

**Basic libusb Usage**:
```c
#include <libusb-1.0/libusb.h>
#include <stdio.h>
#include <stdlib.h>

#define VENDOR_ID  0x1234
#define PRODUCT_ID 0x5678

int main(void) {
    libusb_context *ctx = NULL;
    libusb_device_handle *handle = NULL;
    int r; // Return code
    
    // Initialize libusb
    r = libusb_init(&ctx);
    if (r < 0) {
        fprintf(stderr, "Failed to initialize libusb: %s\n", libusb_error_name(r));
        return 1;
    }
    
    // Set debugging (0=none, 1=errors, 2=warnings, 3=info, 4=debug)
    libusb_set_debug(ctx, 3);
    
    // Open device by vendor and product ID
    handle = libusb_open_device_with_vid_pid(ctx, VENDOR_ID, PRODUCT_ID);
    if (!handle) {
        fprintf(stderr, "Device not found\n");
        libusb_exit(ctx);
        return 1;
    }
    
    // Claim interface 0
    r = libusb_claim_interface(handle, 0);
    if (r < 0) {
        fprintf(stderr, "Failed to claim interface: %s\n", libusb_error_name(r));
        libusb_close(handle);
        libusb_exit(ctx);
        return 1;
    }
    
    // Control transfer example (GET_DESCRIPTOR)
    unsigned char buf[256];
    r = libusb_control_transfer(
        handle,
        LIBUSB_REQUEST_TYPE_STANDARD | LIBUSB_RECIPIENT_DEVICE | LIBUSB_ENDPOINT_IN,
        LIBUSB_REQUEST_GET_DESCRIPTOR,
        (LIBUSB_DT_DEVICE << 8),
        0,
        buf,
        sizeof(buf),
        1000 // Timeout in ms
    );
    
    if (r > 0) {
        printf("Received %d bytes of device descriptor\n", r);
        // Process descriptor...
    } else {
        fprintf(stderr, "Control transfer failed: %s\n", libusb_error_name(r));
    }
    
    // Bulk transfer example
    unsigned char data_out[] = {0x01, 0x02, 0x03, 0x04};
    int actual_length;
    r = libusb_bulk_transfer(
        handle,
        0x01, // Endpoint 1 OUT
        data_out,
        sizeof(data_out),
        &actual_length,
        1000
    );
    
    if (r == 0) {
        printf("Sent %d bytes via bulk transfer\n", actual_length);
    } else {
        fprintf(stderr, "Bulk transfer failed: %s\n", libusb_error_name(r));
    }
    
    // Release interface
    libusb_release_interface(handle, 0);
    
    // Close device
    libusb_close(handle);
    
    // Clean up
    libusb_exit(ctx);
    
    return 0;
}
```

**Asynchronous Transfers with libusb**:
```c
// Completion callback for asynchronous transfer
void LIBUSB_CALL transfer_callback(struct libusb_transfer *transfer) {
    if (transfer->status == LIBUSB_TRANSFER_COMPLETED) {
        printf("Transfer completed successfully\n");
        // Process received data
        for (int i = 0; i < transfer->actual_length; i++) {
            printf("%02x ", transfer->buffer[i]);
        }
        printf("\n");
    } else {
        fprintf(stderr, "Transfer failed: %s\n", 
                libusb_error_name(transfer->status));
    }
    
    // Clean up transfer
    libusb_free_transfer(transfer);
}

// Submit asynchronous interrupt transfer
int submit_interrupt_transfer(libusb_device_handle *handle) {
    struct libusb_transfer *transfer;
    unsigned char *buffer = malloc(64);
    if (!buffer) return LIBUSB_ERROR_NO_MEM;
    
    transfer = libusb_alloc_transfer(0);
    if (!transfer) {
        free(buffer);
        return LIBUSB_ERROR_NO_MEM;
    }
    
    // Set up interrupt transfer
    libusb_fill_interrupt_transfer(
        transfer,
        handle,
        0x81, // Endpoint 1 IN
        buffer,
        64,
        transfer_callback,
        NULL, // User data
        1000  // Timeout in ms
    );
    
    // Submit transfer
    int r = libusb_submit_transfer(transfer);
    if (r < 0) {
        libusb_free_transfer(transfer);
        free(buffer);
        return r;
    }
    
    return 0;
}

// Main event loop
int main(void) {
    // ... initialization code
    
    // Submit asynchronous transfer
    if (submit_interrupt_transfer(handle) != 0) {
        // Handle error
    }
    
    // Event processing loop
    while (1) {
        // Handle pending events with 1 second timeout
        int r = libusb_handle_events_timeout_completed(ctx, 
                                                     &(struct timeval){1, 0}, 
                                                     NULL);
        if (r < 0) {
            if (r == LIBUSB_ERROR_INTERRUPTED) {
                continue;
            }
            fprintf(stderr, "Event handling failed: %s\n", 
                    libusb_error_name(r));
            break;
        }
    }
    
    // ... cleanup code
}
```

**Critical USB Considerations**:
- **Enumeration Process**: Device must respond correctly to setup requests
- **Endpoint Management**: Proper handling of data flow and buffer management
- **Power Management**: Handling suspend/resume events
- **Error Handling**: Timeouts, stalls, and other transfer errors
- **Driver Installation**: Windows requires INF files; Linux uses udev rules

## 31.4 GPIO Control and General Purpose Interfaces

### 31.4.1 GPIO Fundamentals

General Purpose Input/Output (GPIO) pins provide the most basic hardware interface, allowing direct control of digital signals.

**GPIO Modes**:
- **Input Mode**: Read external signal state
  - Floating: No pull-up/pull-down (avoid in most cases)
  - Pull-up: Internal resistor to Vcc
  - Pull-down: Internal resistor to GND
- **Output Mode**: Drive external signal
  - Push-pull: Active drive high and low
  - Open-drain: Drive low only; high is floating (requires external pull-up)
- **Alternate Function**: Connect to internal peripherals (UART, SPI, etc.)

**GPIO Electrical Characteristics**:
- **Voltage Levels**: Logic high/low thresholds (varies by voltage)
- **Drive Strength**: Current sourcing/sinking capability
- **Slew Rate**: Output transition speed control
- **Schmitt Trigger**: Hysteresis for noise immunity on inputs

### 31.4.2 Register-Based GPIO Control

Microcontroller GPIO is typically controlled through memory-mapped registers.

**Common GPIO Register Types**:
- **Data Register (DR)**: Read input or set output state
- **Set/Reset Register (BSRR/BRR)**: Atomic set/clear operations
- **Output Data Register (ODR)**: Output state
- **Input Data Register (IDR)**: Input state
- **Mode Register (MODER)**: Pin mode (input, output, alternate, analog)
- **Output Type Register (OTYPER)**: Push-pull vs. open-drain
- **Speed Register (OSPEEDR)**: Output slew rate
- **Pull-up/Pull-down Register (PUPDR)**: Pull resistor configuration
- **Alternate Function Registers (AFRL/AFRH)**: Peripheral selection

**GPIO Initialization Example**:
```c
// STM32F4 GPIO register definitions
typedef struct {
    volatile uint32_t MODER;    // Mode register
    volatile uint32_t OTYPER;   // Output type register
    volatile uint32_t OSPEEDR;  // Output speed register
    volatile uint32_t PUPDR;    // Pull-up/pull-down register
    volatile uint32_t IDR;      // Input data register
    volatile uint32_t ODR;      // Output data register
    volatile uint32_t BSRR;     // Bit set/reset register
    volatile uint32_t LCKR;     // Configuration lock register
    volatile uint32_t AFR[2];   // Alternate function registers
} GPIO_TypeDef;

#define GPIOA_BASE 0x40020000
#define GPIOA ((GPIO_TypeDef*)GPIOA_BASE)

// Configure PA5 as push-pull output
void gpio_init(void) {
    // Enable clock to GPIOA
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    
    // Configure PA5 as output (moder: 01 = output mode)
    GPIOA->MODER &= ~GPIO_MODER_MODE5;
    GPIOA->MODER |= GPIO_MODER_MODE5_0;
    
    // Configure as push-pull (otyper: 0 = push-pull)
    GPIOA->OTYPER &= ~GPIO_OTYPER_OT_5;
    
    // Configure speed (ospeedr: 01 = medium speed)
    GPIOA->OSPEEDR &= ~GPIO_OSPEEDER_OSPEEDR5;
    GPIOA->OSPEEDR |= GPIO_OSPEEDER_OSPEEDR5_0;
    
    // Configure pull-up/pull-down (pupdr: 00 = no pull)
    GPIOA->PUPDR &= ~GPIO_PUPDR_PUPDR5;
}

// Set PA5 high
void gpio_set(void) {
    GPIOA->BSRR = (1 << 5);
}

// Set PA5 low
void gpio_clear(void) {
    GPIOA->BSRR = (1 << (5 + 16));
}

// Toggle PA5
void gpio_toggle(void) {
    GPIOA->ODR ^= (1 << 5);
}

// Read PA0
bool gpio_read(void) {
    return (GPIOA->IDR & (1 << 0)) != 0;
}
```

**Bit-Banding for Atomic Access**:
```c
// STM32 bit-band calculation
#define BITBAND_SRAM_REF    0x20000000
#define BITBAND_SRAM_BASE   0x22000000
#define BITBAND_PERIPH_REF  0x40000000
#define BITBAND_PERIPH_BASE 0x42000000

#define BITBAND(addr, bit)  ((BITBAND_PERIPH_BASE + (addr - BITBAND_PERIPH_REF)*32 + (bit)*4))

// Atomic set/clear without read-modify-write
void gpio_set_bitband(void) {
    *BITBAND(&GPIOA->ODR, 5) = 1; // Set PA5 high
}

void gpio_clear_bitband(void) {
    *BITBAND(&GPIOA->ODR, 5) = 0; // Set PA5 low
}
```

### 31.4.3 Advanced GPIO Techniques

**PWM Generation Using GPIO**:
```c
// Software PWM implementation
#define PWM_PIN 5
#define PWM_PERIOD_MS 20  // 50 Hz
#define PWM_RESOLUTION 100

static uint32_t pwm_duty[PWM_RESOLUTION];

void pwm_init(void) {
    // Configure GPIO
    gpio_init();
    
    // Initialize duty cycle array
    memset(pwm_duty, 0, sizeof(pwm_duty));
}

void pwm_set_duty(uint8_t channel, uint8_t duty) {
    if (duty > 100) duty = 100;
    pwm_duty[channel] = (duty * PWM_PERIOD_MS * 1000) / 100; // Convert to microseconds
}

void pwm_timer_tick(uint32_t us) {
    static uint32_t time = 0;
    time += us;
    
    if (time >= PWM_PERIOD_MS * 1000) {
        time = 0;
        gpio_set(); // Start of period
    }
    
    // Check if we should clear the output
    for (int i = 0; i < PWM_RESOLUTION; i++) {
        if (pwm_duty[i] > 0 && time >= pwm_duty[i]) {
            gpio_clear(); // End of duty cycle
            break;
        }
    }
}
```

**Input Capture for Timing Measurements**:
```c
// Capture rising edge timing
#define CAPTURE_PIN 0
#define CAPTURE_BUFFER_SIZE 10

static volatile uint32_t capture_buffer[CAPTURE_BUFFER_SIZE];
static volatile uint16_t capture_head = 0;
static volatile bool buffer_overflow = false;

void capture_init(void) {
    // Enable clock to GPIOA and TIM2
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    RCC->APB1ENR |= RCC_APB1ENR_TIM2EN;
    
    // Configure PA0 as input
    GPIOA->MODER &= ~GPIO_MODER_MODE0;
    GPIOA->PUPDR &= ~GPIO_PUPDR_PUPDR0;
    GPIOA->PUPDR |= GPIO_PUPDR_PUPDR0_0; // Pull-up
    
    // Configure TIM2 for input capture
    TIM2->PSC = 83;  // 1 MHz timer clock (84 MHz / 84)
    TIM2->ARR = 0xFFFFFFFF; // Max period
    TIM2->CCMR1 = TIM_CCMR1_CC1S_0; // CC1 channel configured as input, IC1 mapped on TI1
    TIM2->CCER = TIM_CCER_CC1E | TIM_CCER_CC1P; // Rising edge capture
    TIM2->DIER = TIM_DIER_CC1IE; // Enable capture interrupt
    TIM2->CR1 = TIM_CR1_CEN; // Enable counter
    
    // Enable TIM2 interrupt
    NVIC_EnableIRQ(TIM2_IRQn);
}

void TIM2_IRQHandler(void) {
    if (TIM2->SR & TIM_SR_CC1IF) {
        // Read captured value
        uint32_t capture = TIM2->CCR1;
        
        // Store in buffer
        if (capture_head < CAPTURE_BUFFER_SIZE) {
            capture_buffer[capture_head++] = capture;
        } else {
            buffer_overflow = true;
        }
        
        // Clear interrupt flag
        TIM2->SR &= ~TIM_SR_CC1IF;
    }
}

// Calculate pulse width from captures
uint32_t get_pulse_width(void) {
    if (capture_head < 2) return 0;
    
    // Return difference between last two captures
    return capture_buffer[capture_head-1] - capture_buffer[capture_head-2];
}
```

**GPIO Interrupt Handling**:
```c
// Configure PA0 for external interrupt
void gpio_interrupt_init(void) {
    // Enable clock to GPIOA and SYSCFG
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    RCC->APB2ENR |= RCC_APB2ENR_SYSCFGEN;
    
    // Configure PA0 as input
    GPIOA->MODER &= ~GPIO_MODER_MODE0;
    GPIOA->PUPDR &= ~GPIO_PUPDR_PUPDR0;
    GPIOA->PUPDR |= GPIO_PUPDR_PUPDR0_0; // Pull-up
    
    // Connect EXTI line 0 to PA0
    SYSCFG->EXTICR[0] &= ~SYSCFG_EXTICR1_EXTI0;
    SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI0_PA;
    
    // Configure EXTI line 0 for falling edge
    EXTI->FTSR |= EXTI_FTSR_TR0; // Falling trigger
    EXTI->IMR |= EXTI_IMR_MR0;   // Unmask interrupt
    
    // Enable EXTI0 interrupt
    NVIC_EnableIRQ(EXTI0_IRQn);
}

// EXTI0 interrupt handler
void EXTI0_IRQHandler(void) {
    // Check if EXTI0 line is pending
    if (EXTI->PR & EXTI_PR_PR0) {
        // Handle interrupt
        handle_button_press();
        
        // Clear pending bit
        EXTI->PR = EXTI_PR_PR0;
    }
}
```

## 31.5 Device Driver Development

### 31.5.1 Linux Device Driver Fundamentals

Linux device drivers provide the interface between user-space applications and hardware devices.

**Driver Types**:
- **Character Devices**: Accessed as a stream of bytes (e.g., serial ports, GPIO)
- **Block Devices**: Accessed in fixed-size blocks (e.g., disks)
- **Network Devices**: Handle network packets
- **Platform Devices**: Devices integrated into SoCs

**Key Driver Components**:
- **Module Initialization/Exit**: `module_init()`, `module_exit()`
- **File Operations**: `open`, `read`, `write`, `ioctl`, `release`
- **Device Registration**: `register_chrdev()`, `device_create()`
- **Hardware Access**: `ioremap()`, `request_irq()`
- **Concurrency Control**: Mutexes, spinlocks

### 31.5.2 Writing a Simple Character Driver

**Basic Character Driver Structure**:
```c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/uaccess.h>

#define DEVICE_NAME "mydevice"
#define CLASS_NAME "myclass"

static int major_number;
static struct class *myclass = NULL;
static struct device *mydevice = NULL;
static struct cdev mycdev;

// Device-specific data
static char message[256] = {0};
static short message_length = 0;

// File operations
static int device_open(struct inode *inode, struct file *file) {
    printk(KERN_INFO "Device opened\n");
    return 0;
}

static int device_release(struct inode *inode, struct file *file) {
    printk(KERN_INFO "Device closed\n");
    return 0;
}

static ssize_t device_read(struct file *file, char __user *buffer, 
                          size_t length, loff_t *offset) {
    int bytes_to_read = message_length - *offset;
    if (bytes_to_read <= 0) {
        return 0; // End of file
    }
    
    if (length > bytes_to_read) {
        length = bytes_to_read;
    }
    
    if (copy_to_user(buffer, message + *offset, length)) {
        return -EFAULT;
    }
    
    *offset += length;
    return length;
}

static ssize_t device_write(struct file *file, const char __user *buffer, 
                           size_t length, loff_t *offset) {
    if (length > sizeof(message) - 1) {
        return -EINVAL;
    }
    
    if (copy_from_user(message, buffer, length)) {
        return -EFAULT;
    }
    
    message[length] = '\0';
    message_length = length;
    return length;
}

static long device_ioctl(struct file *file, unsigned int cmd, unsigned long arg) {
    switch (cmd) {
        case 0:
            printk(KERN_INFO "IOCTL command 0 received\n");
            break;
        case 1:
            printk(KERN_INFO "IOCTL command 1 received\n");
            break;
        default:
            return -EINVAL;
    }
    return 0;
}

// File operations structure
static struct file_operations fops = {
    .owner = THIS_MODULE,
    .open = device_open,
    .release = device_release,
    .read = device_read,
    .write = device_write,
    .unlocked_ioctl = device_ioctl,
};

// Module initialization
static int __init mydriver_init(void) {
    // Allocate major number
    if ((major_number = register_chrdev(0, DEVICE_NAME, &fops)) < 0) {
        printk(KERN_ALERT "Failed to register character device\n");
        return major_number;
    }
    
    // Create device class
    if (IS_ERR(myclass = class_create(THIS_MODULE, CLASS_NAME))) {
        unregister_chrdev(major_number, DEVICE_NAME);
        return PTR_ERR(myclass);
    }
    
    // Create device node
    if (IS_ERR(mydevice = device_create(myclass, NULL, 
                                      MKDEV(major_number, 0), NULL, DEVICE_NAME))) {
        class_destroy(myclass);
        unregister_chrdev(major_number, DEVICE_NAME);
        return PTR_ERR(mydevice);
    }
    
    // Initialize character device
    cdev_init(&mycdev, &fops);
    if (cdev_add(&mycdev, MKDEV(major_number, 0), 1) < 0) {
        device_destroy(myclass, MKDEV(major_number, 0));
        class_destroy(myclass);
        unregister_chrdev(major_number, DEVICE_NAME);
        return -1;
    }
    
    printk(KERN_INFO "Device registered with major number %d\n", major_number);
    return 0;
}

// Module exit
static void __exit mydriver_exit(void) {
    cdev_del(&mycdev);
    device_destroy(myclass, MKDEV(major_number, 0));
    class_destroy(myclass);
    unregister_chrdev(major_number, DEVICE_NAME);
    printk(KERN_INFO "Device unregistered\n");
}

module_init(mydriver_init);
module_exit(mydriver_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A simple character device driver");
MODULE_VERSION("1.0");
```

**User-Space Testing Program**:
```c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>

#define DEVICE_PATH "/dev/mydevice"

int main() {
    int fd = open(DEVICE_PATH, O_RDWR);
    if (fd < 0) {
        perror("Failed to open device");
        return 1;
    }
    
    // Write to device
    const char *msg = "Hello from user space!";
    if (write(fd, msg, strlen(msg)) < 0) {
        perror("Write failed");
        close(fd);
        return 1;
    }
    
    // Read from device
    char buffer[256];
    ssize_t bytes_read = read(fd, buffer, sizeof(buffer)-1);
    if (bytes_read < 0) {
        perror("Read failed");
        close(fd);
        return 1;
    }
    buffer[bytes_read] = '\0';
    printf("Read from device: %s\n", buffer);
    
    // IOCTL call
    if (ioctl(fd, 0, NULL) < 0) {
        perror("IOCTL failed");
    }
    
    close(fd);
    return 0;
}
```

### 31.5.3 Interrupt Handling in Drivers

Interrupts are essential for responsive hardware interaction.

**Interrupt Registration**:
```c
#include <linux/interrupt.h>

#define GPIO_IRQ_PIN 0
#define GPIO_IRQ_NUMBER 16  // Example IRQ number

static irqreturn_t gpio_irq_handler(int irq, void *dev_id) {
    // Handle interrupt
    printk(KERN_INFO "GPIO interrupt occurred\n");
    
    // Clear interrupt source (hardware-specific)
    // ...
    
    return IRQ_HANDLED;
}

static int request_gpio_irq(void) {
    int result;
    
    // Set up interrupt trigger (example for GPIO)
    // ...
    
    // Request interrupt
    result = request_irq(GPIO_IRQ_NUMBER, 
                        gpio_irq_handler,
                        IRQF_TRIGGER_FALLING,
                        "gpio_irq",
                        NULL);
    
    if (result) {
        printk(KERN_ERR "Failed to request IRQ %d\n", GPIO_IRQ_NUMBER);
        return result;
    }
    
    printk(KERN_INFO "Successfully requested IRQ %d\n", GPIO_IRQ_NUMBER);
    return 0;
}

static void free_gpio_irq(void) {
    free_irq(GPIO_IRQ_NUMBER, NULL);
}
```

**Top Half vs. Bottom Half**:
- **Top Half**: Runs in interrupt context; must be fast and non-blocking
- **Bottom Half**: Runs in process context; can sleep and perform complex operations

**Tasklet Implementation**:
```c
#include <linux/interrupt.h>

static void gpio_tasklet_handler(unsigned long data) {
    // Process interrupt in bottom half
    printk(KERN_INFO "Tasklet processing GPIO event\n");
    // Perform time-consuming operations
}

static DECLARE_TASKLET(gpio_tasklet, gpio_tasklet_handler, 0);

static irqreturn_t gpio_irq_handler(int irq, void *dev_id) {
    // Schedule tasklet for bottom half processing
    tasklet_schedule(&gpio_tasklet);
    return IRQ_HANDLED;
}
```

**Workqueue Implementation**:
```c
#include <linux/workqueue.h>

static struct workqueue_struct *gpio_wq;
static struct work_struct gpio_work;

static void gpio_work_handler(struct work_struct *work) {
    // Process interrupt in workqueue context
    printk(KERN_INFO "Workqueue processing GPIO event\n");
    // Can sleep and perform complex operations
}

static irqreturn_t gpio_irq_handler(int irq, void *dev_id) {
    // Schedule work for bottom half processing
    queue_work(gpio_wq, &gpio_work);
    return IRQ_HANDLED;
}

static int __init gpio_driver_init(void) {
    // Create workqueue
    gpio_wq = create_singlethread_workqueue("gpio_wq");
    if (!gpio_wq) {
        return -ENOMEM;
    }
    
    // Initialize work
    INIT_WORK(&gpio_work, gpio_work_handler);
    
    // Request interrupt
    // ...
    
    return 0;
}

static void __exit gpio_driver_exit(void) {
    // Flush and destroy workqueue
    flush_workqueue(gpio_wq);
    destroy_workqueue(gpio_wq);
    
    // Free interrupt
    // ...
}
```

## 31.6 Hardware Abstraction Layers

### 31.6.1 Designing Effective HALs

Hardware Abstraction Layers (HALs) isolate hardware-specific code from application logic, enhancing portability and maintainability.

**HAL Design Principles**:
1.  **Complete Encapsulation**: No hardware details leak through the interface
2.  **Consistent Semantics**: Same behavior across all platforms
3.  **Minimal Interface**: Expose only necessary functionality
4.  **Performance Transparency**: Minimal overhead compared to direct usage
5.  **Error Handling Uniformity**: Standardized error reporting

**HAL Quality Spectrum**:
| **Poor HAL**                          | **Good HAL**                           |
| :------------------------------------ | :------------------------------------- |
| **Leaky implementation details**      | **Complete encapsulation**             |
| **Inconsistent behavior**             | **Identical semantics on all platforms** |
| **High performance overhead**         | **Near-native performance**            |
| **Complex interface**                 | **Simple, focused interface**          |
| **Requires platform checks by users** | **Users completely platform-agnostic** |

### 31.6.2 Implementing a Hardware Abstraction Layer

**UART HAL Interface**:
```c
/* hal_uart.h */
#ifndef HAL_UART_H
#define HAL_UART_H

#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * UART configuration structure
 */
typedef struct {
    uint32_t baud_rate;
    uint8_t data_bits;   // 5-9
    uint8_t stop_bits;   // 1 or 2
    char parity;         // 'N', 'E', 'O'
} UART_Config;

/**
 * Initialize UART with specified configuration
 * @param config UART configuration
 * @return true on success, false on error
 */
bool hal_uart_init(const UART_Config *config);

/**
 * Write data to UART
 * @param data Buffer containing data to write
 * @param len Number of bytes to write
 * @return Number of bytes written
 */
size_t hal_uart_write(const uint8_t *data, size_t len);

/**
 * Read data from UART
 * @param data Buffer to store read data
 * @param len Maximum number of bytes to read
 * @return Number of bytes read
 */
size_t hal_uart_read(uint8_t *data, size_t len);

/**
 * Check if UART is ready for writing
 * @return true if ready, false otherwise
 */
bool hal_uart_tx_ready(void);

/**
 * Check if data is available for reading
 * @return true if data available, false otherwise
 */
bool hal_uart_rx_ready(void);

#ifdef __cplusplus
}
#endif

#endif /* HAL_UART_H */
```

**STM32F4 UART HAL Implementation**:
```c
/* hal_uart_stm32f4.c */
#include "hal_uart.h"
#include "stm32f4xx.h"

// UART register definitions
typedef struct {
    volatile uint32_t SR;   // Status register
    volatile uint32_t DR;   // Data register
    volatile uint32_t BRR;  // Baud rate register
    volatile uint32_t CR1;  // Control register 1
    // ... other registers
} UART_TypeDef;

#define UART2_BASE 0x40004400
#define UART2 ((UART_TypeDef*)UART2_BASE)

// Private functions
static void uart_enable_clocks(void) {
    // Enable clock to UART2 and GPIOA
    RCC->APB1ENR |= RCC_APB1ENR_USART2EN;
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
}

static void uart_configure_pins(void) {
    // Configure PA2 (TX) and PA3 (RX) as alternate function
    GPIOA->MODER &= ~(GPIO_MODER_MODE2 | GPIO_MODER_MODE3);
    GPIOA->MODER |= (GPIO_MODER_MODE2_1 | GPIO_MODER_MODE3_1);
    GPIOA->AFR[0] &= ~((0xF << (2*4)) | (0xF << (3*4)));
    GPIOA->AFR[0] |= ((7 << (2*4)) | (7 << (3*4))); // AF7 for USART2
}

static bool uart_configure_baud_rate(uint32_t baud_rate) {
    uint32_t bus_clock = 42000000; // Example APB1 clock
    uint32_t divisor = (bus_clock + baud_rate/2) / baud_rate;
    
    if (divisor < 1) return false;
    
    UART2->BRR = divisor;
    return true;
}

static bool uart_configure_frame(const UART_Config *config) {
    // Configure data bits, parity, stop bits
    uint32_t cr1 = 0;
    
    // Data bits
    if (config->data_bits == 9) {
        cr1 |= USART_CR1_M; // 9 data bits
    } else {
        // 8 data bits is default
    }
    
    // Parity
    if (config->parity != 'N') {
        cr1 |= USART_CR1_PCE; // Parity control enable
        if (config->parity == 'O') {
            cr1 |= USART_CR1_PS; // Odd parity
        }
    }
    
    // Stop bits
    if (config->stop_bits == 2) {
        cr1 |= USART_CR1_STOP_1; // 2 stop bits
    }
    
    UART2->CR1 = cr1;
    return true;
}

bool hal_uart_init(const UART_Config *config) {
    // Enable clocks
    uart_enable_clocks();
    
    // Configure pins
    uart_configure_pins();
    
    // Configure baud rate
    if (!uart_configure_baud_rate(config->baud_rate)) {
        return false;
    }
    
    // Configure frame format
    if (!uart_configure_frame(config)) {
        return false;
    }
    
    // Enable transmitter and receiver
    UART2->CR1 |= USART_CR1_TE | USART_CR1_RE;
    
    // Enable UART
    UART2->CR1 |= USART_CR1_UE;
    
    return true;
}

size_t hal_uart_write(const uint8_t *data, size_t len) {
    size_t written = 0;
    
    for (size_t i = 0; i < len; i++) {
        // Wait until transmit data register empty
        while (!(UART2->SR & USART_SR_TXE)) {}
        
        // Write data
        UART2->DR = data[i];
        written++;
    }
    
    // Wait for transmission complete
    while (!(UART2->SR & USART_SR_TC)) {}
    
    return written;
}

size_t hal_uart_read(uint8_t *data, size_t len) {
    size_t read = 0;
    
    for (size_t i = 0; i < len; i++) {
        // Wait until receive data register not empty
        while (!(UART2->SR & USART_SR_RXNE)) {}
        
        // Read data
        data[i] = (uint8_t)UART2->DR;
        read++;
    }
    
    return read;
}

bool hal_uart_tx_ready(void) {
    return (UART2->SR & USART_SR_TXE) != 0;
}

bool hal_uart_rx_ready(void) {
    return (UART2->SR & USART_SR_RXNE) != 0;
}
```

**nRF52 UART HAL Implementation**:
```c
/* hal_uart_nrf52.c */
#include "hal_uart.h"
#include "nrf.h"

// UART instance
#define UART_INSTANCE 0
#define NRF_UART NRF_UART0

// Private functions
static void uart_enable_clocks(void) {
    // Enable UART clock
    NRF_CLOCK->TASKS_START = 1;
    while (NRF_CLOCK->EVENTS_HFCLKSTARTED == 0) {}
    
    NRF_UART->ENABLE = (UART_ENABLE_ENABLE_Enabled << UART_ENABLE_ENABLE_Pos);
}

static void uart_configure_pins(const UART_Config *config) {
    // Configure pins (P0.08=TX, P0.06=RX)
    NRF_UART->PSELTXD = 8;
    NRF_UART->PSELRXD = 6;
    
    // Configure as output/input
    NRF_GPIO->PIN_CNF[8] = 
        (GPIO_PIN_CNF_DIR_Output << GPIO_PIN_CNF_DIR_Pos) |
        (GPIO_PIN_CNF_INPUT_Connect << GPIO_PIN_CNF_INPUT_Pos) |
        (GPIO_PIN_CNF_PULL_Disabled << GPIO_PIN_CNF_PULL_Pos) |
        (GPIO_PIN_CNF_DRIVE_S0S1 << GPIO_PIN_CNF_DRIVE_Pos) |
        (GPIO_PIN_CNF_SENSE_Disabled << GPIO_PIN_CNF_SENSE_Pos);
    
    NRF_GPIO->PIN_CNF[6] = 
        (GPIO_PIN_CNF_DIR_Input << GPIO_PIN_CNF_DIR_Pos) |
        (GPIO_PIN_CNF_INPUT_Connect << GPIO_PIN_CNF_INPUT_Pos) |
        (GPIO_PIN_CNF_PULL_Disabled << GPIO_PIN_CNF_PULL_Pos) |
        (GPIO_PIN_CNF_DRIVE_S0S1 << GPIO_PIN_CNF_DRIVE_Pos) |
        (GPIO_PIN_CNF_SENSE_Disabled << GPIO_PIN_CNF_SENSE_Pos);
}

static bool uart_configure_baud_rate(uint32_t baud_rate) {
    switch (baud_rate) {
        case 1200:   NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud1200; break;
        case 2400:   NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud2400; break;
        case 4800:   NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud4800; break;
        case 9600:   NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud9600; break;
        case 14400:  NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud14400; break;
        case 19200:  NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud19200; break;
        case 28800:  NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud28800; break;
        case 38400:  NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud38400; break;
        case 57600:  NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud57600; break;
        case 76800:  NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud76800; break;
        case 115200: NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud115200; break;
        case 230400: NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud230400; break;
        case 250000: NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud250000; break;
        case 460800: NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud460800; break;
        case 921600: NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud921600; break;
        case 1000000:NRF_UART->BAUDRATE = UART_BAUDRATE_BAUDRATE_Baud1M; break;
        default: return false;
    }
    return true;
}

static bool uart_configure_frame(const UART_Config *config) {
    // Configure data bits, parity, stop bits
    uint32_t config_reg = 0;
    
    // Data bits
    switch (config->data_bits) {
        case 8: config_reg |= (UART_CONFIG_DATA8_Bits << UART_CONFIG_DATA_Pos); break;
        case 9: config_reg |= (UART_CONFIG_DATA9_Bits << UART_CONFIG_DATA_Pos); break;
        default: return false;
    }
    
    // Parity
    switch (config->parity) {
        case 'N': config_reg |= (UART_CONFIG_PARITY_Excluded << UART_CONFIG_PARITY_Pos); break;
        case 'E': config_reg |= (UART_CONFIG_PARITY_Included << UART_CONFIG_PARITY_Pos); break;
        case 'O': config_reg |= (UART_CONFIG_PARITY_Included << UART_CONFIG_PARITY_Pos) | 
                            (1 << 2); // Odd parity
                            break;
        default: return false;
    }
    
    // Stop bits
    if (config->stop_bits == 2) {
        config_reg |= (UART_CONFIG_STOP_Two << UART_CONFIG_STOP_Pos);
    } else {
        config_reg |= (UART_CONFIG_STOP_One << UART_CONFIG_STOP_Pos);
    }
    
    NRF_UART->CONFIG = config_reg;
    return true;
}

bool hal_uart_init(const UART_Config *config) {
    // Enable clocks
    uart_enable_clocks();
    
    // Configure pins
    uart_configure_pins(config);
    
    // Configure baud rate
    if (!uart_configure_baud_rate(config->baud_rate)) {
        return false;
    }
    
    // Configure frame format
    if (!uart_configure_frame(config)) {
        return false;
    }
    
    // Enable UART
    NRF_UART->ENABLE = (UART_ENABLE_ENABLE_Enabled << UART_ENABLE_ENABLE_Pos);
    
    // Enable transmitter and receiver
    NRF_UART->TASKS_STARTTX = 1;
    NRF_UART->TASKS_STARTRX = 1;
    
    return true;
}

size_t hal_uart_write(const uint8_t *data, size_t len) {
    size_t written = 0;
    
    for (size_t i = 0; i < len; i++) {
        // Write data
        NRF_UART->TXD = data[i];
        
        // Wait for TX to complete
        while (NRF_UART->EVENTS_TXDRDY == 0) {}
        NRF_UART->EVENTS_TXDRDY = 0;
        
        written++;
    }
    
    return written;
}

size_t hal_uart_read(uint8_t *data, size_t len) {
    size_t read = 0;
    
    for (size_t i = 0; i < len; i++) {
        // Wait for RX data
        while (NRF_UART->EVENTS_RXDRDY == 0) {}
        NRF_UART->EVENTS_RXDRDY = 0;
        
        // Read data
        data[i] = (uint8_t)NRF_UART->RXD;
        read++;
    }
    
    return read;
}

bool hal_uart_tx_ready(void) {
    return (NRF_UART->EVENTS_TXDRDY != 0);
}

bool hal_uart_rx_ready(void) {
    return (NRF_UART->EVENTS_RXDRDY != 0);
}
```

**HAL Build Configuration**:
```c
/* hal_uart.c */
#include "hal_uart.h"

// Platform-specific implementation
#if defined(STM32F4)
    #include "hal_uart_stm32f4.c"
#elif defined(NRF52)
    #include "hal_uart_nrf52.c"
#elif defined(ESP32)
    #include "hal_uart_esp32.c"
#else
    #error "Unsupported platform"
#endif
```

## 31.7 Debugging Hardware Interfaces

### 31.7.1 Common Hardware Issues

Hardware interface debugging requires understanding both software and physical layer issues.

**Signal Integrity Problems**:
- **Ringin**g: Overshoot/undershoot causing multiple edges
- **Crosstalk**: Signals coupling between adjacent wires
- **Ground Bounce**: Voltage fluctuations due to simultaneous switching
- **Reflections**: Impedance mismatches causing signal reflections
- **Noise**: External interference corrupting signals

**Timing Issues**:
- **Setup/Hold Violations**: Data not stable when clock transitions
- **Clock Skew**: Clock arriving at different times across circuit
- **Jitter**: Timing variations in clock or data signals
- **Propagation Delays**: Signals taking longer than expected

**Electrical Characteristics**:
- **Voltage Levels**: Signals outside valid logic thresholds
- **Current Limitations**: Exceeding drive capability
- **Rise/Fall Times**: Too slow for required speed
- **Capacitive Loading**: Excessive capacitance slowing edges

### 31.7.2 Debugging Tools and Techniques

**Logic Analyzers**:
- Capture digital signals with precise timing
- Trigger on specific protocol conditions
- Decode protocols (I2C, SPI, UART) automatically
- Example usage:
  ```c
  // Add debugging GPIO toggles
  #define DEBUG_PIN 5
  
  void uart_write(char c) {
      GPIO_SET(DEBUG_PIN);  // Signal start of operation
      // ... UART operation
      GPIO_CLEAR(DEBUG_PIN); // Signal end of operation
  }
  ```

**Oscilloscopes**:
- Visualize analog signal characteristics
- Measure voltage levels, rise/fall times
- Check signal integrity
- Trigger on specific analog conditions

**Protocol Analyzers**:
- USB protocol analyzers
- I2C/SPI bus analyzers
- Ethernet analyzers
- Decode and display protocol traffic

**Software Tracing**:
```c
// Circular buffer for event tracing
#define TRACE_SIZE 128
typedef struct {
    uint32_t timestamp;
    uint8_t event_id;
    uint16_t data;
} TraceEvent;

TraceEvent trace_buffer[TRACE_SIZE];
uint16_t trace_index = 0;
uint32_t trace_start_time = 0;

void init_tracing(void) {
    trace_start_time = get_system_time();
}

void log_event(uint8_t event_id, uint16_t data) {
    uint32_t timestamp = get_system_time() - trace_start_time;
    
    trace_buffer[trace_index].timestamp = timestamp;
    trace_buffer[trace_index].event_id = event_id;
    trace_buffer[trace_index].data = data;
    
    trace_index = (trace_index + 1) % TRACE_SIZE;
}

// Event IDs
#define EVENT_UART_START 1
#define EVENT_UART_TX    2
#define EVENT_UART_RX    3
#define EVENT_I2C_START  4
// ... more events

// Usage in UART code
void uart_write(char c) {
    log_event(EVENT_UART_START, c);
    // ... UART operation
    log_event(EVENT_UART_TX, c);
}
```

### 31.7.3 Systematic Debugging Approach

**Isolating Hardware vs. Software Issues**:
1.  **Verify Hardware Connections**:
    - Check wiring, pinouts, and physical connections
    - Confirm pull-up resistors where required
    - Measure voltages with multimeter

2.  **Validate Signal Characteristics**:
    - Use oscilloscope to check signal integrity
    - Verify timing parameters (setup/hold times)
    - Confirm voltage levels meet specifications

3.  **Protocol-Level Verification**:
    - Use protocol analyzer to capture traffic
    - Verify sequence matches specification
    - Check for proper ACK/NACK, START/STOP conditions

4.  **Software Validation**:
    - Add debug logging and tracing
    - Verify register configurations
    - Check interrupt handling

**Step-by-Step Validation Example for I2C**:
1.  **Physical Layer Check**:
    - Measure SCL/SDA voltages with oscilloscope
    - Verify pull-up resistors are present (typically 1-10kΩ)
    - Check for proper rise/fall times

2.  **Basic Communication Test**:
    ```c
    // Test I2C by scanning for devices
    void i2c_scan(void) {
        for (uint8_t addr = 0; addr < 128; addr++) {
            if (i2c_address(addr, false)) {
                printf("Device found at 0x%02X\n", addr);
            }
        }
    }
    ```

3.  **Register Read/Write Test**:
    ```c
    // Test reading a known register from a sensor
    bool test_sensor(void) {
        uint8_t id;
        if (!i2c_read_register(0x68, 0x75, &id, 1)) {
            printf("Failed to read sensor ID\n");
            return false;
        }
        
        if (id != 0x71) {
            printf("Unexpected sensor ID: 0x%02X\n", id);
            return false;
        }
        
        printf("Sensor detected successfully\n");
        return true;
    }
    ```

4.  **Timing Analysis**:
    - Measure clock frequency with oscilloscope
    - Verify setup/hold times meet device specifications
    - Check for clock stretching

## 31.8 Case Studies

### 31.8.1 Sensor Integration (I2C)

**BMP280 Temperature/Pressure Sensor Integration**:
```c
// BMP280 register definitions
#define BMP280_REG_ID        0xD0
#define BMP280_REG_RESET     0xE0
#define BMP280_REG_STATUS    0xF3
#define BMP280_REG_CTRL_MEAS 0xF4
#define BMP280_REG_CONFIG    0xF5
#define BMP280_REG_PRESS_MSB 0xF7
#define BMP280_REG_TEMP_MSB  0xFA

// BMP280 calibration data
typedef struct {
    uint16_t T1;
    int16_t T2, T3;
    uint16_t P1;
    int16_t P2, P3, P4, P5, P6, P7, P8, P9;
} BMP280_Calibration;

// BMP280 device structure
typedef struct {
    uint8_t addr;
    BMP280_Calibration calib;
} BMP280_Device;

// Initialize BMP280
bool bmp280_init(BMP280_Device *dev, uint8_t addr) {
    dev->addr = addr;
    
    // Check device ID
    uint8_t id;
    if (!i2c_read_reg(dev->addr, BMP280_REG_ID, &id, 1) || id != 0x58) {
        return false;
    }
    
    // Reset device
    uint8_t reset = 0xB6;
    if (!i2c_write_reg(dev->addr, BMP280_REG_RESET, &reset, 1)) {
        return false;
    }
    // Wait for reset to complete
    k_sleep(K_MSEC(2));
    
    // Read calibration data
    uint8_t calib_data[24];
    if (!i2c_read_reg(dev->addr, 0x88, calib_data, 24)) {
        return false;
    }
    
    // Parse calibration data
    dev->calib.T1 = (calib_data[1] << 8) | calib_data[0];
    dev->calib.T2 = (calib_data[3] << 8) | calib_data[2];
    dev->calib.T3 = (calib_data[5] << 8) | calib_data[4];
    dev->calib.P1 = (calib_data[7] << 8) | calib_data[6];
    dev->calib.P2 = (calib_data[9] << 8) | calib_data[8];
    // ... parse remaining calibration data
    
    // Configure device
    uint8_t ctrl_meas = (0x03 << 5) | // Oversampling x4 for temperature
                        (0x03 << 2) | // Oversampling x16 for pressure
                        0x03;         // Normal mode
    if (!i2c_write_reg(dev->addr, BMP280_REG_CTRL_MEAS, &ctrl_meas, 1)) {
        return false;
    }
    
    uint8_t config = (0x04 << 5) | // Standby time 0.5ms
                     (0x00 << 2) | // Filter off
                     0x00;         // SPI disabled
    if (!i2c_write_reg(dev->addr, BMP280_REG_CONFIG, &config, 1)) {
        return false;
    }
    
    return true;
}

// Read uncompensated temperature
static int32_t bmp280_read_uncomp_temp(BMP280_Device *dev) {
    uint8_t data[3];
    if (!i2c_read_reg(dev->addr, BMP280_REG_TEMP_MSB, data, 3)) {
        return 0;
    }
    
    return (int32_t)((data[0] << 12) | (data[1] << 4) | (data[2] >> 4));
}

// Read uncompensated pressure
static uint32_t bmp280_read_uncomp_press(BMP280_Device *dev) {
    uint8_t data[3];
    if (!i2c_read_reg(dev->addr, BMP280_REG_PRESS_MSB, data, 3)) {
        return 0;
    }
    
    return (uint32_t)((data[0] << 12) | (data[1] << 4) | (data[2] >> 4));
}

// Compensate temperature
static int32_t bmp280_compensate_temp(BMP280_Device *dev, int32_t adc_temp) {
    int32_t var1, var2, T;
    
    var1 = ((((adc_temp >> 3) - ((int32_t)dev->calib.T1 << 1))) * 
            ((int32_t)dev->calib.T2)) >> 11;
    var2 = (((((adc_temp >> 4) - ((int32_t)dev->calib.T1)) * 
             ((adc_temp >> 4) - ((int32_t)dev->calib.T1))) >> 12) * 
            ((int32_t)dev->calib.T3)) >> 14;
    
    dev->t_fine = var1 + var2;
    T = (dev->t_fine * 5 + 128) >> 8;
    
    return T;
}

// Compensate pressure
static uint32_t bmp280_compensate_press(BMP280_Device *dev, uint32_t adc_press) {
    int64_t var1, var2, p;
    
    var1 = ((int64_t)dev->t_fine) - 128000;
    var2 = var1 * var1 * (int64_t)dev->calib.P6;
    var2 = var2 + ((var1 * (int64_t)dev->calib.P5) << 17);
    var2 = var2 + (((int64_t)dev->calib.P4) << 35);
    var1 = ((var1 * var1 * (int64_t)dev->calib.P3) >> 8) + 
           ((var1 * (int64_t)dev->calib.P2) << 12);
    var1 = (((int64_t)1) << 47) + var1;
    p = 1048576 - adc_press;
    p = (((p << 31) - var2) * 3125) / var1;
    var1 = ((int64_t)dev->calib.P9 * (p >> 13) * (p >> 13)) >> 25;
    var2 = ((int64_t)dev->calib.P8 * p) >> 19;
    
    p = ((p + var1 + var2) >> 8) + ((int64_t)dev->calib.P7 << 4);
    
    return (uint32_t)p;
}

// Read temperature and pressure
bool bmp280_read(BMP280_Device *dev, float *temp, float *press) {
    int32_t uncomp_temp = bmp280_read_uncomp_temp(dev);
    uint32_t uncomp_press = bmp280_read_uncomp_press(dev);
    
    if (uncomp_temp == 0 || uncomp_press == 0) {
        return false;
    }
    
    int32_t t = bmp280_compensate_temp(dev, uncomp_temp);
    uint32_t p = bmp280_compensate_press(dev, uncomp_press);
    
    *temp = t / 100.0f;
    *press = p / 256.0f;
    
    return true;
}
```

**Critical Sensor Integration Considerations**:
- **Initialization Sequence**: Must follow device-specific requirements
- **Calibration Data**: Essential for accurate measurements
- **Timing Constraints**: Between configuration and data reads
- **Error Handling**: Device not present, communication failures
- **Data Compensation**: Raw sensor data requires mathematical compensation

### 31.8.2 Display Interface (SPI)

**SSD1306 OLED Display Interface**:
```c
// SSD1306 command definitions
#define SSD1306_CMD_DISPLAY_OFF       0xAE
#define SSD1306_CMD_DISPLAY_ON        0xAF
#define SSD1306_CMD_SET_CONTRAST      0x81
#define SSD1306_CMD_NORMAL_DISPLAY    0xA6
#define SSD1306_CMD_INVERT_DISPLAY    0xA7
#define SSD1306_CMD_SET_START_LINE    0x40
#define SSD1306_CMD_SET_PAGE_ADDR     0xB0
#define SSD1306_CMD_SET_COLUMN_ADDR   0x21
#define SSD1306_CMD_MEMORY_MODE       0x20
#define SSD1306_CMD_SEG_REMAP         0xA1
#define SSD1306_CMD_COM_SCAN_DEC      0xC8
#define SSD1306_CMD_SET_MUX_RATIO     0xA8
#define SSD1306_CMD_SET_DISPLAY_OFFSET 0xD3
#define SSD1306_CMD_SET_DISPLAY_CLK   0xD5
#define SSD1306_CMD_SET_PRECHARGE     0xD9
#define SSD1306_CMD_SET_COM_PINS      0xDA
#define SSD1306_CMD_SET_VCOMH_DESEL   0xDB
#define SSD1306_CMD_CHARGE_PUMP       0x8D

// Display parameters
#define SSD1306_WIDTH  128
#define SSD1306_HEIGHT 64
#define SSD1306_PAGES  (SSD1306_HEIGHT / 8)

// Display device structure
typedef struct {
    uint8_t cs_pin;
    uint8_t dc_pin;
    uint8_t reset_pin;
    uint8_t buffer[SSD1306_WIDTH * SSD1306_PAGES];
} SSD1306_Device;

// Initialize SSD1306
bool ssd1306_init(SSD1306_Device *dev) {
    // Configure GPIO pins
    gpio_configure(dev->cs_pin, GPIO_OUTPUT);
    gpio_configure(dev->dc_pin, GPIO_OUTPUT);
    gpio_configure(dev->reset_pin, GPIO_OUTPUT);
    
    // Reset display
    gpio_clear(dev->reset_pin);
    k_sleep(K_MSEC(10));
    gpio_set(dev->reset_pin);
    k_sleep(K_MSEC(10));
    
    // Initialize SPI
    spi_init(8000000, 0); // 8 MHz, mode 0
    
    // Send initialization commands
    ssd1306_command(dev, SSD1306_CMD_DISPLAY_OFF);
    ssd1306_command(dev, SSD1306_CMD_SET_DISPLAY_CLK);
    ssd1306_command(dev, 0x80);
    ssd1306_command(dev, SSD1306_CMD_SET_MUX_RATIO);
    ssd1306_command(dev, 0x3F);
    ssd1306_command(dev, SSD1306_CMD_SET_DISPLAY_OFFSET);
    ssd1306_command(dev, 0x00);
    ssd1306_command(dev, SSD1306_CMD_SET_START_LINE | 0x00);
    ssd1306_command(dev, SSD1306_CMD_CHARGE_PUMP);
    ssd1306_command(dev, 0x14);
    ssd1306_command(dev, SSD1306_CMD_MEMORY_MODE);
    ssd1306_command(dev, 0x00);
    ssd1306_command(dev, SSD1306_CMD_SEG_REMAP | 0x01);
    ssd1306_command(dev, SSD1306_CMD_COM_SCAN_DEC);
    ssd1306_command(dev, SSD1306_CMD_SET_COM_PINS);
    ssd1306_command(dev, 0x12);
    ssd1306_command(dev, SSD1306_CMD_SET_CONTRAST);
    ssd1306_command(dev, 0xCF);
    ssd1306_command(dev, SSD1306_CMD_SET_PRECHARGE);
    ssd1306_command(dev, 0xF1);
    ssd1306_command(dev, SSD1306_CMD_SET_VCOMH_DESEL);
    ssd1306_command(dev, 0x40);
    ssd1306_command(dev, SSD1306_CMD_NORMAL_DISPLAY);
    ssd1306_command(dev, SSD1306_CMD_DISPLAY_ON);
    
    // Clear display buffer
    memset(dev->buffer, 0, sizeof(dev->buffer));
    
    return true;
}

// Send command to display
void ssd1306_command(SSD1306_Device *dev, uint8_t cmd) {
    gpio_clear(dev->cs_pin);
    gpio_clear(dev->dc_pin); // Command mode
    
    spi_transfer(&cmd, NULL, 1);
    
    gpio_set(dev->cs_pin);
}

// Send data to display
void ssd1306_data(SSD1306_Device *dev, const uint8_t *data, size_t len) {
    gpio_clear(dev->cs_pin);
    gpio_set(dev->dc_pin); // Data mode
    
    spi_transfer(data, NULL, len);
    
    gpio_set(dev->cs_pin);
}

// Set pixel in buffer
void ssd1306_set_pixel(SSD1306_Device *dev, int x, int y, bool set) {
    if (x < 0 || x >= SSD1306_WIDTH || y < 0 || y >= SSD1306_HEIGHT) {
        return;
    }
    
    uint8_t page = y / 8;
    uint8_t bit = y % 8;
    uint8_t mask = 1 << bit;
    
    if (set) {
        dev->buffer[page * SSD1306_WIDTH + x] |= mask;
    } else {
        dev->buffer[page * SSD1306_WIDTH + x] &= ~mask;
    }
}

// Update display from buffer
void ssd1306_update(SSD1306_Device *dev) {
    // Set column address
    uint8_t col_cmd[] = {
        SSD1306_CMD_SET_COLUMN_ADDR,
        0, // Start column
        SSD1306_WIDTH - 1 // End column
    };
    ssd1306_command(dev, col_cmd[0]);
    ssd1306_command(dev, col_cmd[1]);
    ssd1306_command(dev, col_cmd[2]);
    
    // Set page address
    uint8_t page_cmd[] = {
        SSD1306_CMD_SET_PAGE_ADDR,
        0, // Start page
        SSD1306_PAGES - 1 // End page
    };
    ssd1306_command(dev, page_cmd[0]);
    ssd1306_command(dev, page_cmd[1]);
    ssd1306_command(dev, page_cmd[2]);
    
    // Send display buffer
    ssd1306_data(dev, dev->buffer, sizeof(dev->buffer));
}
```

**Optimization Techniques**:
```c
// Optimized buffer update (only changed regions)
typedef struct {
    uint8_t x;
    uint8_t y;
    uint8_t width;
    uint8_t height;
} DisplayRegion;

static DisplayRegion dirty_region = {0};

void ssd1306_set_pixel_optimized(SSD1306_Device *dev, int x, int y, bool set) {
    if (x < 0 || x >= SSD1306_WIDTH || y < 0 || y >= SSD1306_HEIGHT) {
        return;
    }
    
    // Update dirty region
    if (dirty_region.width == 0) {
        dirty_region.x = x;
        dirty_region.y = y;
        dirty_region.width = 1;
        dirty_region.height = 1;
    } else {
        uint8_t x2 = dirty_region.x + dirty_region.width;
        uint8_t y2 = dirty_region.y + dirty_region.height;
        
        if (x < dirty_region.x) {
            dirty_region.width = x2 - x;
            dirty_region.x = x;
        } else if (x >= x2) {
            dirty_region.width = x - dirty_region.x + 1;
        }
        
        if (y < dirty_region.y) {
            dirty_region.height = y2 - y;
            dirty_region.y = y;
        } else if (y >= y2) {
            dirty_region.height = y - dirty_region.y + 1;
        }
    }
    
    // Set pixel
    uint8_t page = y / 8;
    uint8_t bit = y % 8;
    uint8_t mask = 1 << bit;
    
    if (set) {
        dev->buffer[page * SSD1306_WIDTH + x] |= mask;
    } else {
        dev->buffer[page * SSD1306_WIDTH + x] &= ~mask;
    }
}

void ssd1306_update_optimized(SSD1306_Device *dev) {
    if (dirty_region.width == 0) {
        return; // No changes
    }
    
    // Set column address
    uint8_t col_cmd[] = {
        SSD1306_CMD_SET_COLUMN_ADDR,
        dirty_region.x,
        dirty_region.x + dirty_region.width - 1
    };
    ssd1306_command(dev, col_cmd[0]);
    ssd1306_command(dev, col_cmd[1]);
    ssd1306_command(dev, col_cmd[2]);
    
    // Set page address
    uint8_t start_page = dirty_region.y / 8;
    uint8_t end_page = (dirty_region.y + dirty_region.height - 1) / 8;
    uint8_t page_cmd[] = {
        SSD1306_CMD_SET_PAGE_ADDR,
        start_page,
        end_page
    };
    ssd1306_command(dev, page_cmd[0]);
    ssd1306_command(dev, page_cmd[1]);
    ssd1306_command(dev, page_cmd[2]);
    
    // Send only the dirty region
    for (uint8_t page = start_page; page <= end_page; page++) {
        size_t offset = page * SSD1306_WIDTH + dirty_region.x;
        size_t length = dirty_region.width;
        ssd1306_data(dev, &dev->buffer[offset], length);
    }
    
    // Clear dirty region
    dirty_region.width = 0;
}
```

### 31.8.3 USB HID Device

**Custom USB HID Device Implementation**:
```c
// USB HID descriptor
static const uint8_t hid_descriptor[] = {
    0x09,        // bLength
    0x21,        // bDescriptorType (HID)
    0x11, 0x01,  // bcdHID (1.11)
    0x00,        // bCountryCode
    0x01,        // bNumDescriptors
    0x22,        // bDescriptorType[0] (Report)
    0x24, 0x00,  // wDescriptorLength[0] (36)
};

// HID report descriptor (simplified)
static const uint8_t report_descriptor[] = {
    0x05, 0x01,        // Usage Page (Generic Desktop)
    0x09, 0x02,        // Usage (Mouse)
    0xA1, 0x01,        // Collection (Application)
    0x09, 0x01,        //   Usage (Pointer)
    0xA1, 0x00,        //   Collection (Physical)
    0x05, 0x09,        //     Usage Page (Button)
    0x19, 0x01,        //     Usage Minimum (0x01)
    0x29, 0x03,        //     Usage Maximum (0x03)
    0x15, 0x00,        //     Logical Minimum (0)
    0x25, 0x01,        //     Logical Maximum (1)
    0x95, 0x03,        //     Report Count (3)
    0x75, 0x01,        //     Report Size (1)
    0x81, 0x02,        //     Input (Data,Var,Abs)
    0x95, 0x01,        //     Report Count (1)
    0x75, 0x05,        //     Report Size (5)
    0x81, 0x01,        //     Input (Cnst)
    0x05, 0x01,        //     Usage Page (Generic Desktop)
    0x09, 0x30,        //     Usage (X)
    0x09, 0x31,        //     Usage (Y)
    0x09, 0x38,        //     Usage (Wheel)
    0x15, 0x81,        //     Logical Minimum (-127)
    0x25, 0x7F,        //     Logical Maximum (127)
    0x75, 0x08,        //     Report Size (8)
    0x95, 0x03,        //     Report Count (3)
    0x81, 0x06,        //     Input (Data,Var,Rel)
    0xC0,              //   End Collection
    0xC0,              // End Collection
};

// HID report structure
typedef struct {
    uint8_t buttons;  // Bit 0: Left, Bit 1: Right, Bit 2: Middle
    int8_t x;         // X movement
    int8_t y;         // Y movement
    int8_t wheel;     // Wheel movement
} HID_Report;

// USB setup request handling
void usb_handle_hid_request(const USB_SetupPacket *pkt) {
    switch (pkt->bRequest) {
        case USB_REQ_GET_DESCRIPTOR:
            if ((pkt->wValue >> 8) == 0x21) { // HID descriptor
                usb_send_control_data(hid_descriptor, sizeof(hid_descriptor));
            } else if ((pkt->wValue >> 8) == 0x22) { // Report descriptor
                usb_send_control_data(report_descriptor, sizeof(report_descriptor));
            }
            break;
            
        case 0x09: // SET_REPORT
            // Handle host-to-device reports
            break;
            
        case 0x01: // GET_REPORT
            // Prepare report data
            HID_Report report = {0};
            usb_send_control_data((uint8_t*)&report, sizeof(report));
            break;
            
        default:
            usb_stall_endpoint(0);
            break;
    }
}

// Send HID report
bool hid_send_report(const HID_Report *report) {
    return usb_send_packet(1, (uint8_t*)report, sizeof(HID_Report));
}

// Example usage
void send_mouse_move(int8_t x, int8_t y, uint8_t buttons) {
    HID_Report report = {
        .buttons = buttons,
        .x = x,
        .y = y,
        .wheel = 0
    };
    hid_send_report(&report);
}
```

**Cross-Platform Compatibility Considerations**:
- **Report Descriptor Compliance**: Must follow HID specification
- **Polling Interval**: Set appropriate for device type
- **Driver Installation**: Windows may require INF file
- **OS-Specific Quirks**: macOS, Linux, and Windows handle HID differently
- **Power Management**: Handle suspend/resume properly

## 31.9 Advanced Topics

### 31.9.1 DMA for High-Performance Transfers

Direct Memory Access (DMA) offloads data transfer tasks from the CPU to dedicated hardware.

**DMA Concepts**:
- **Channels**: Independent DMA streams
- **Descriptors**: Configuration for transfer operations
- **Sources/Destinations**: Memory or peripheral addresses
- **Transfer Modes**: Memory-to-memory, peripheral-to-memory, etc.
- **Circular Buffer**: Automatic wrap-around for continuous transfers

**STM32 DMA Configuration**:
```c
// Configure DMA for UART reception
void uart_dma_init(void) {
    // Enable DMA clock
    RCC->AHB1ENR |= RCC_AHB1ENR_DMA1EN;
    
    // Configure DMA channel
    DMA1_Stream5->CR = 0;
    DMA1_Stream5->CR = 
        (0 << DMA_SxCR_CHSEL_Pos) |    // Channel 0
        (0 << DMA_SxCR_MBURST_Pos) |   // Memory burst single
        (0 << DMA_SxCR_PBURST_Pos) |   // Peripheral burst single
        (1 << DMA_SxCR_CT_Pos) |      // Double buffer mode
        (0 << DMA_SxCR_DBM_Pos) |     // Double buffer mode disabled
        (0 << DMA_SxCR_PL_Pos) |      // Priority low
        (0 << DMA_SxCR_PINCOS_Pos) |  // Peripheral increment offset size
        (1 << DMA_SxCR_MSIZE_Pos) |   // Memory data size: 16-bit
        (1 << DMA_SxCR_PSIZE_Pos) |   // Peripheral data size: 16-bit
        (1 << DMA_SxCR_MINC_Pos) |    // Memory increment mode
        (0 << DMA_SxCR_PINC_Pos) |    // Peripheral increment mode
        (0 << DMA_SxCR_CIRC_Pos) |    // Circular mode
        (0 << DMA_SxCR_DIR_Pos) |     // Direction: peripheral-to-memory
        (1 << DMA_SxCR_TCIE_Pos) |    // Transfer complete interrupt enable
        (1 << DMA_SxCR_TEIE_Pos);     // Transfer error interrupt enable
    
    // Set peripheral address
    DMA1_Stream5->PAR = (uint32_t)&UART2->DR;
    
    // Set memory addresses
    DMA1_Stream5->M0AR = (uint32_t)rx_buffer1;
    DMA1_Stream5->M1AR = (uint32_t)rx_buffer2;
    
    // Set number of data items
    DMA1_Stream5->NDTR = RX_BUFFER_SIZE;
    
    // Enable DMA channel
    DMA1_Stream5->CR |= DMA_SxCR_EN;
    
    // Enable DMA for UART reception
    UART2->CR3 |= USART_CR3_DMAR;
    
    // Enable DMA interrupts
    NVIC_EnableIRQ(DMA1_Stream5_IRQn);
}

// DMA interrupt handler
void DMA1_Stream5_IRQHandler(void) {
    if (DMA1->HISR & DMA_HISR_TCIF5) {
        // Transfer complete
        if (DMA1_Stream5->CR & DMA_SxCR_CT) {
            // Buffer 1 complete
            process_dma_buffer(rx_buffer1, RX_BUFFER_SIZE);
        } else {
            // Buffer 2 complete
            process_dma_buffer(rx_buffer2, RX_BUFFER_SIZE);
        }
        
        // Clear interrupt flag
        DMA1->HIFCR = DMA_HIFCR_CTCIF5;
    }
    
    if (DMA1->HISR & DMA_HISR_TEIF5) {
        // Transfer error
        // Handle error
        DMA1->HIFCR = DMA_HIFCR_CTEIF5;
    }
}
```

**Critical DMA Considerations**:
- **Memory Alignment**: DMA transfers often require aligned addresses
- **Cache Coherency**: Ensure cache is flushed/invalidated properly
- **Buffer Management**: Double/triple buffering for continuous streams
- **Interrupt Overhead**: Balance interrupt frequency with CPU load
- **Peripheral Support**: Not all peripherals support DMA

### 31.9.2 Real-Time Considerations

Hardware interfaces in real-time systems require special attention to timing constraints.

**Critical Timing Parameters**:
- **Interrupt Latency**: Time from hardware event to ISR entry
- **Interrupt Response Time**: Time from hardware event to ISR completion
- **Jitter**: Variation in response time
- **Worst-Case Execution Time (WCET)**: Maximum time for critical operations

**Reducing Interrupt Latency**:
```c
// Critical section with minimal duration
void process_sensor_data(void) {
    uint32_t value;
    
    // Disable interrupts for minimal critical section
    uint32_t primask = __get_PRIMASK();
    __disable_irq();
    
    // Read sensor value (atomic operation)
    value = SENSOR_REG;
    
    __set_PRIMASK(primask);
    
    // Process value (outside critical section)
    apply_filter(value);
    update_display(value);
}

// Nested interrupt configuration (ARM Cortex-M)
void configure_nested_interrupts(void) {
    // Set priorities (lower value = higher priority)
    NVIC_SetPriority(UART_IRQn, 1);   // High priority
    NVIC_SetPriority(TIMER_IRQn, 2);  // Medium priority
    NVIC_SetPriority(GPIO_IRQn, 3);   // Low priority
    
    // Enable nested interrupts
    NVIC_SetPriorityGrouping(0); // All bits for preemption
}
```

**Deterministic Communication Patterns**:
```c
// Time-triggered communication
#define COMM_PERIOD_MS 10
static uint32_t last_comm_time = 0;

void communication_task(void) {
    uint32_t current_time = get_system_time();
    
    if (current_time - last_comm_time >= COMM_PERIOD_MS) {
        // Send sensor data
        send_sensor_data();
        
        // Receive commands
        receive_commands();
        
        last_comm_time = current_time;
    }
}
```

### 31.9.3 Power Management

Power management is critical for battery-operated devices with hardware interfaces.

**Sleep Modes During Communication**:
```c
// Low-power UART reception
void uart_low_power_init(void) {
    // Configure UART for low-power reception
    UART2->CR1 |= USART_CR1_UESM;  // Enable UART in Stop mode
    UART2->CR1 |= USART_CR1_PDC;   // Peripheral clock stopped in Stop mode
    
    // Configure wake-up on start bit
    UART2->CR3 |= USART_CR3_WUS_1; // Wake up on start bit
    UART2->CR3 |= USART_CR3_EIE;   // Enable error interrupt for wake-up
}

// Enter low-power mode
void enter_low_power_mode(void) {
    // Clear sleep-on-exit bit
    SCB->SCR &= ~SCB_SCR_SLEEPONEXIT_Msk;
    
    // Enter sleep mode
    __DSB();
    __WFI();
}

// System tick handler
void SysTick_Handler(void) {
    // Check if we should enter low-power mode
    if (system_idle()) {
        enter_low_power_mode();
    }
}
```

**Wake-on-Event Configuration**:
```c
// Configure GPIO for wake-up
void gpio_wakeup_init(void) {
    // Enable clock to GPIOA and PWR
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    RCC->APB1ENR |= RCC_APB1ENR_PWREN;
    
    // Configure PA0 as input with pull-up
    GPIOA->MODER &= ~GPIO_MODER_MODE0;
    GPIOA->PUPDR &= ~GPIO_PUPDR_PUPDR0;
    GPIOA->PUPDR |= GPIO_PUPDR_PUPDR0_0; // Pull-up
    
    // Connect EXTI line 0 to PA0
    SYSCFG->EXTICR[0] &= ~SYSCFG_EXTICR1_EXTI0;
    SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI0_PA;
    
    // Configure EXTI line 0 for falling edge
    EXTI->FTSR |= EXTI_FTSR_TR0;
    EXTI->IMR |= EXTI_IMR_MR0;
    
    // Configure for wake-up
    EXTI->EMR |= EXTI_EMR_MR0; // Enable wake-up
    
    // Enable wake-up in PWR
    PWR->CSR1 |= PWR_CSR1_EWUP1;
}

// Enter stop mode with wake-up
void enter_stop_mode(void) {
    // Select regulator voltage scaling
    PWR->CR1 |= PWR_CR1_VOS_0;
    
    // Clear wake-up flags
    PWR->CR3 |= PWR_CR3_EWUP1;
    
    // Enter Stop mode
    SCB->SCR |= SCB_SCR_SLEEPDEEP_Msk;
    PWR->CR1 |= PWR_CR1_LPMS_1; // Stop mode 0
    
    __DSB();
    __WFI();
    
    // System wakes here after wake-up event
    SCB->SCR &= ~SCB_SCR_SLEEPDEEP_Msk;
    
    // Re-initialize clocks
    SystemClock_Config();
}
```

## 31.10 Conclusion and Best Practices Summary

Interfacing C with hardware protocols represents a critical skill set for systems and embedded developers. As demonstrated throughout this chapter, successful hardware interfacing requires a deep understanding of both the protocol specifications and the practical implementation details that bridge software logic to physical signals.

### Essential Best Practices

1.  **Understand the Protocol Specification**: Study the official documentation thoroughly
2.  **Use Appropriate Abstraction**: Balance between direct register access and abstraction layers
3.  **Validate Hardware Connections**: Verify physical layer before debugging software
4.  **Implement Robust Error Handling**: Account for all possible failure modes
5.  **Test at Multiple Levels**: Unit tests, integration tests, system tests
6.  **Use Hardware-Accurate Timing**: Respect setup/hold times and protocol constraints
7.  **Document Assumptions**: Future maintainers need to understand design choices
8.  **Measure Performance Impact**: Ensure hardware interfaces meet timing requirements
9.  **Validate Signal Integrity**: Use oscilloscope to verify electrical characteristics
10. **Consider Power Implications**: Optimize for low-power operation where needed

### Protocol Selection Decision Framework

| **Requirement**              | **Recommended Protocol**       | **When to Consider Alternative**         |
| :--------------------------- | :----------------------------- | :--------------------------------------- |
| **Simple Debugging**         | **UART**                       | SPI/I2C for higher speed                 |
| **High-Speed Sensor Data**   | **SPI**                        | I2C for fewer wires                      |
| **Multiple Devices on Bus**  | **I2C**                        | SPI with multiple CS lines               |
| **Human Interface Devices**  | **USB HID**                    | Bluetooth for wireless                   |
| **Long-Distance Communication** | **RS-485 (UART variant)**    | CAN for industrial environments          |
| **High-Bandwidth Data**      | **USB Bulk**                   | Ethernet for networked devices           |

### Continuing Your Hardware Interfacing Journey

To deepen your expertise in hardware interfacing with C:

1.  **Study Protocol Specifications**: Read official USB, I2C, SPI specifications
2.  **Build Hardware Test Jigs**: Create tools for validating signal integrity
3.  **Contribute to Open-Source Drivers**: Fix bugs or add features to Linux drivers
4.  **Experiment with New Protocols**: Try CAN, Ethernet, or PCIe interfaces
5.  **Learn About Signal Integrity**: Study transmission line theory and PCB layout

> **Final Insight**: The most effective hardware interface developers think in terms of **signal behavior** rather than just data values. They understand that a '1' in software translates to a specific voltage level for a specific duration on a physical wire, and that timing, noise, and electrical characteristics are as important as the protocol specification. As computing continues to move toward edge devices, IoT, and embedded systems, the ability to interface C code with physical hardware will only become more valuable. By mastering the techniques in this chapter, you've equipped yourself to build the critical bridges between software and the physical world.

Remember: **Hardware doesn't care about your software abstractions—it responds only to electrical signals.** Your role as a C developer interfacing with hardware is to ensure those signals accurately represent the data and commands your software intends to send and receive. With disciplined application of the principles in this chapter, you can create robust, efficient, and reliable hardware interfaces that form the foundation of countless embedded and systems applications.

