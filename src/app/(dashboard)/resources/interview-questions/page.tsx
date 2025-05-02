"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Code, 
  Server, 
  Hash, 
  BookOpen, 
  Search,
  List,
  FileText,
  MessagesSquare,
  BookOpenText
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Categories and their icons
const categories = [
  { id: "sql", name: "SQL", icon: Database, color: "text-blue-500", bgColor: "bg-blue-500/10", hoverColor: "group-hover:bg-blue-500/20" },
  { id: "python", name: "Python", icon: Code, color: "text-green-500", bgColor: "bg-green-500/10", hoverColor: "group-hover:bg-green-500/20" },
  { id: "react", name: "React", icon: Hash, color: "text-purple-500", bgColor: "bg-purple-500/10", hoverColor: "group-hover:bg-purple-500/20" },
  { id: "system-design", name: "System Design", icon: Server, color: "text-orange-500", bgColor: "bg-orange-500/10", hoverColor: "group-hover:bg-orange-500/20" },
];

// SQL Questions Data (just using the SQL ones for now, can add others later)
const questionsData = {
  sql: {
    basic: [
      {
        id: "string-data-types",
        question: "What are the String Data Types in MySQL?",
        answer: `MySQL provides several string data types to store text and binary data:

CHAR(n): Fixed-length string, padded with spaces to specified length
VARCHAR(n): Variable-length string with maximum length n
TEXT: Variable-length string with maximum length of 65,535 characters
MEDIUMTEXT: Up to 16,777,215 characters
LONGTEXT: Up to 4,294,967,295 characters
ENUM: String object with only one value chosen from a list
SET: String object that can have zero or more values from a list

\`\`\`sql
CREATE TABLE users (
    name CHAR(50),      -- Fixed length
    email VARCHAR(100), -- Variable length
    bio TEXT,          -- Longer text
    status ENUM('active', 'inactive', 'pending')  -- Enumerated value
);
\`\`\`

Note: Choose VARCHAR over CHAR when the column length varies considerably to save space.`
      },
      {
        id: "adding-users",
        question: "How to add users in MySQL?",
        answer: `There are two main ways to add users in MySQL:

1. Using CREATE USER Statement:

\`\`\`sql
CREATE USER 'username'@'hostname' IDENTIFIED BY 'password';

-- Example:
CREATE USER 'john'@'localhost' IDENTIFIED BY 'strongpass123';
\`\`\`

2. Using GRANT Statement (creates user if doesn't exist):

\`\`\`sql
GRANT privileges ON database.table TO 'username'@'hostname' IDENTIFIED BY 'password';

-- Example:
GRANT ALL PRIVILEGES ON mydb.* TO 'john'@'localhost' IDENTIFIED BY 'strongpass123';
\`\`\`

Additional steps:

Grant privileges to the new user:
\`\`\`sql
GRANT privilege1, privilege2 ON database_name.table_name TO 'username'@'hostname';
\`\`\`

Apply the privileges:
\`\`\`sql
FLUSH PRIVILEGES;
\`\`\`

Best Practices:
- Always use strong passwords
- Grant only necessary privileges (principle of least privilege)
- Regularly review user privileges`
      },
      {
        id: "blob-in-mysql",
        question: "What is BLOB in MySQL?",
        answer: `BLOB (Binary Large OBject) is a MySQL data type used to store large binary objects such as:

- Images
- Audio files
- Video files
- PDF documents
- Other binary data

MySQL provides four BLOB types:

- TINYBLOB: Up to 255 bytes
- BLOB: Up to 65,535 bytes
- MEDIUMBLOB: Up to 16,777,215 bytes
- LONGBLOB: Up to 4,294,967,295 bytes

\`\`\`sql
CREATE TABLE documents (
    id INT PRIMARY KEY,
    file_name VARCHAR(255),
    content MEDIUMBLOB,
    upload_date TIMESTAMP
);
\`\`\`

Best Practices:
- Consider storing files in the filesystem and only storing file paths in the database for better performance
- Use the smallest BLOB type that can accommodate your data
- Be mindful of the maximum packet size in your MySQL configuration`
      },
      {
        id: "temporal-data-types",
        question: "What are the Temporal Data Types in MySQL?",
        answer: `MySQL provides several temporal data types to store date and time information:

- DATE: Stores date in 'YYYY-MM-DD' format (1000-01-01 to 9999-12-31)
- TIME: Stores time in 'HH:MM:SS' format (-838:59:59 to 838:59:59)
- DATETIME: Combines DATE and TIME (1000-01-01 00:00:00 to 9999-12-31 23:59:59)
- TIMESTAMP: Stores datetime values, converted to UTC for storage
- YEAR: Stores year values from 1901 to 2155

\`\`\`sql
CREATE TABLE events (
    id INT PRIMARY KEY,
    event_date DATE,
    start_time TIME,
    created_at DATETIME,
    last_updated TIMESTAMP,
    fiscal_year YEAR
);
\`\`\`

Key Differences:

- TIMESTAMP is automatically converted to UTC for storage and back to the session timezone for retrieval
- DATETIME stores the value as-is without timezone conversion
- TIMESTAMP uses less storage (4 bytes) compared to DATETIME (8 bytes)

Best Practices:
- Use TIMESTAMP for tracking record creation/modification times
- Use DATETIME for future dates or historical dates before 1970
- Consider timezone implications when choosing between TIMESTAMP and DATETIME`
      },
      {
        id: "what-is-mysql",
        question: "What is MySQL?",
        answer: `MySQL is an open-source relational database management system (RDBMS) that uses Structured Query Language (SQL). It was originally developed by MySQL AB and is now owned by Oracle Corporation.

Key Features:

- Open-source and free Community Edition
- Cross-platform compatibility
- High performance and reliability
- Robust transaction support
- Comprehensive security features
- Scalability and replication support
- Strong data integrity

Common Use Cases:

- Web applications
- Content management systems
- E-commerce platforms
- Enterprise applications
- Data warehousing

Popular Stacks Using MySQL:
- LAMP (Linux, Apache, MySQL, PHP/Python/Perl)
- WAMP (Windows, Apache, MySQL, PHP)
- MAMP (Mac, Apache, MySQL, PHP)`
      }
    ],
    intermediate: [
      {
        id: "types-of-relationships",
        question: "What are the types of relationships used in MySQL?",
        answer: `In MySQL, relationships (also called relationships between tables) define how data in different tables is connected. There are three main types of relationships:

1. One-to-One (1:1):

Each record in the first table has exactly one matching record in the second table
Example: Each person has one passport number

\`\`\`sql
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE user_profiles (
    profile_id INT PRIMARY KEY,
    user_id INT UNIQUE,
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
\`\`\`

2. One-to-Many (1:N):

Each record in the first table can have multiple matching records in the second table
Example: One customer can have many orders

\`\`\`sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
\`\`\`

3. Many-to-Many (M:N):

Multiple records in the first table can have multiple matching records in the second table
Requires a junction/bridge table
Example: Students can enroll in multiple courses, and courses can have multiple students

\`\`\`sql
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    title VARCHAR(100)
);

CREATE TABLE enrollments (
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
\`\`\`

Best Practices:
- Use appropriate indexes on foreign key columns
- Consider referential integrity constraints
- Plan for cascading updates/deletes
- Document relationships in schema design`
      },
      {
        id: "mysql-clients-utilities",
        question: "What are the MySQL clients and utilities?",
        answer: `MySQL provides various clients and utilities for different purposes:

1. Command-Line Clients:

\`\`\`bash
mysql: Interactive command-line client
mysql -u username -p
mysql -h hostname -u username -p database_name

mysqladmin: Administrative client
mysqladmin -u root -p status
mysqladmin -u root -p processlist
\`\`\`

2. Graphical Clients:

- MySQL Workbench: Official GUI tool
  - Database design
  - SQL development
  - Administration
  - Data migration
- phpMyAdmin: Web-based administration tool
- DBeaver: Universal database tool
- HeidiSQL: Lightweight client for Windows

3. Utility Programs:

\`\`\`bash
mysqlcheck: Table maintenance
mysqlcheck -u root -p --all-databases
mysqlcheck -u root -p --optimize database_name

mysqldump: Backup utility
mysqldump -u root -p database_name > backup.sql
mysqldump -u root -p --all-databases > full_backup.sql

mysqlimport: Data import utility
mysqlimport -u root -p database_name data.txt
mysqlimport -u root -p --local database_name *.txt
\`\`\`

Common Tasks and Utilities:
- Database backup and restore
- Data import and export
- Table maintenance and repair
- Performance monitoring
- User administration
- Schema management`
      }
    ],
    advanced: [
      {
        id: "transaction-storage-engines",
        question: "What are Transaction Storage Engines in MySQL?",
        answer: `Transaction Storage Engines in MySQL are components that handle the storage and retrieval of data, with each engine having different characteristics and capabilities regarding transactions, locking, and performance.

1. InnoDB (Default since MySQL 5.5):

- Fully ACID compliant
- Supports transactions
- Row-level locking
- Foreign key constraints
- Crash recovery

\`\`\`sql
CREATE TABLE transactions (
    id INT PRIMARY KEY,
    amount DECIMAL(10,2)
) ENGINE = InnoDB;

-- Transaction example
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
\`\`\`

2. MyISAM:

- Table-level locking
- No transaction support
- Full-text indexing
- Faster for read-heavy operations

\`\`\`sql
CREATE TABLE logs (
    id INT PRIMARY KEY,
    message TEXT,
    FULLTEXT(message)
) ENGINE = MyISAM;
\`\`\`

3. MEMORY (HEAP):

- Data stored in memory
- Very fast access
- Table-level locking
- No transaction support

\`\`\`sql
CREATE TABLE cache (
    id INT PRIMARY KEY,
    data VARCHAR(100)
) ENGINE = MEMORY;
\`\`\`

4. Comparing Storage Engines:

\`\`\`sql
-- Show available storage engines
SHOW ENGINES;

-- Check table's engine
SHOW TABLE STATUS WHERE Name = 'table_name';

-- Convert table to different engine
ALTER TABLE table_name ENGINE = InnoDB;
\`\`\`

Selection Criteria:
- Transaction requirements
- Concurrency needs
- Recovery capabilities
- Performance characteristics
- Specific feature requirements`
      },
      {
        id: "sharding-in-sql",
        question: "What is Sharding in SQL?",
        answer: `Sharding is a database architecture pattern related to horizontal partitioning — the practice of separating one table's rows into multiple different tables, known as partitions or shards. Each shard is held on a separate database server instance.

1. Sharding Methods:

Range Based
\`\`\`sql
-- Example of range-based sharding logic
-- Shard 1: customer_id 1-1000000
CREATE TABLE customers_1 (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100)
) WHERE customer_id BETWEEN 1 AND 1000000;

-- Shard 2: customer_id 1000001-2000000
CREATE TABLE customers_2 (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100)
) WHERE customer_id BETWEEN 1000001 AND 2000000;
\`\`\`

Hash Based
\`\`\`sql
-- Example of hash-based sharding logic
-- Shard selection based on customer_id % num_shards
SELECT * FROM customers_shard_0;
-- For customer_id % 4 = 0

SELECT * FROM customers_shard_1;
-- For customer_id % 4 = 1
\`\`\`

Directory Based
\`\`\`sql
-- Example of lookup table for sharding
CREATE TABLE shard_directory (
    customer_id INT PRIMARY KEY,
    shard_id INT,
    shard_location VARCHAR(100)
);
\`\`\`

2. Advantages:

- Improved scalability
- Better performance
- Increased availability
- Geographic distribution

3. Challenges:

- Complex queries across shards
- Maintaining referential integrity
- Rebalancing data
- Backup and recovery

Implementation Considerations:
- Choose appropriate shard key
- Plan for data distribution
- Handle cross-shard queries
- Manage schema changes
- Monitor shard performance`
      }
    ]
  },
  python: {
    basic: [
      {
        id: "init-method",
        question: "What is __init__?",
        answer: `The __init__ method is a special method in Python classes, also known as a constructor. It's automatically called when a new instance of a class is created.

\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# Creating an instance
person = Person("John", 30)
\`\`\`

Note: The first parameter of __init__ is always self, which refers to the instance being created. It must be included even if you don't use it.

Key Points:
- Initializes instance attributes
- Automatically called on object creation
- Can accept parameters for initialization
- Returns None implicitly`
      },
      {
        id: "arrays-vs-lists",
        question: "Arrays vs Lists",
        answer: `Arrays and lists in Python serve different purposes and have distinct characteristics:

Lists:
- Can contain elements of different data types
- More flexible and commonly used
- Built-in Python data structure
- More memory space but more versatile

Arrays:
- Must contain elements of same data type
- More efficient for numerical computations
- Requires importing array module
- Less memory space but less flexible

\`\`\`python
# List example
my_list = [1, "hello", 3.14, True]

# Array example
import array
my_array = array.array('i', [1, 2, 3, 4])  # 'i' indicates integer type
\`\`\``
      },
      {
        id: "executable-script",
        question: "Making Python Script Executable",
        answer: `To make a Python script executable on Unix systems, you need to follow these steps:

\`\`\`python
#!/usr/bin/env python3
print("Hello, World!")

# In terminal:
# chmod +x script.py
# ./script.py
\`\`\`

Steps:
1. Add shebang line (#!/usr/bin/env python3) at the start
2. Make file executable using chmod command
3. Execute script using ./script.py

Note: The shebang line must be the first line of the file and specifies which interpreter should be used to run the script.`
      },
      {
        id: "slicing",
        question: "Slicing in Python",
        answer: `Slicing is a technique in Python that allows you to extract parts of sequences like strings, lists, and tuples using a slice notation [start:stop:step].

\`\`\`python
# Basic slicing
my_list = [0, 1, 2, 3, 4, 5]
print(my_list[1:4])    # Output: [1, 2, 3]
print(my_list[::2])    # Output: [0, 2, 4]
print(my_list[::-1])   # Output: [5, 4, 3, 2, 1, 0]

# String slicing
text = "Python"
print(text[1:4])       # Output: "yth"
\`\`\`

Slice Parameters:
- start: First index (inclusive)
- stop: Last index (exclusive)
- step: Increment between each item`
      },
      {
        id: "docstring",
        question: "Docstring in Python",
        answer: `A docstring (documentation string) is a string literal that appears as the first statement in a module, function, class, or method. It is used to document Python code.

\`\`\`python
def calculate_area(radius):
    """
    Calculate the area of a circle.
    
    Args:
        radius (float): The radius of the circle
        
    Returns:
        float: The area of the circle
    """
    return 3.14 * radius ** 2

# Accessing docstring
print(calculate_area.__doc__)
\`\`\`

Note: Docstrings are accessible through the __doc__ attribute and are used by tools like help() to generate documentation.

Types of Docstrings:
- Single-line docstrings
- Multi-line docstrings
- Module docstrings
- Class docstrings`
      }
    ],
    intermediate: [
      {
        id: "list-dict-comprehensions",
        question: "What are List and Dictionary Comprehensions in Python?",
        answer: `List and Dictionary comprehensions are concise ways to create lists and dictionaries using a single line of code. They provide a more readable and efficient alternative to using loops.

\`\`\`python
# List Comprehension
numbers = [1, 2, 3, 4, 5]

# Traditional way
squares = []
for n in numbers:
    squares.append(n**2)

# Using list comprehension
squares = [n**2 for n in numbers]
even_squares = [n**2 for n in numbers if n % 2 == 0]

# Dictionary Comprehension
# Traditional way
square_dict = {}
for n in numbers:
    square_dict[n] = n**2

# Using dict comprehension
square_dict = {n: n**2 for n in numbers}
even_square_dict = {n: n**2 for n in numbers if n % 2 == 0}
\`\`\`

Components of Comprehensions:
- Output expression
- Input sequence
- Optional condition
- Optional nested loops

Note: While comprehensions can make code more concise, they should be used judiciously. Very complex comprehensions can reduce readability.`
      },
      {
        id: "decorators",
        question: "What are Decorators in Python?",
        answer: `Decorators are a way to modify or enhance functions or classes without directly changing their source code. They use the @decorator syntax and are a form of metaprogramming.

\`\`\`python
# Simple function decorator
def timer_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start} seconds")
        return result
    return wrapper

@timer_decorator
def slow_function():
    import time
    time.sleep(1)
    return "Done!"

# Class decorator
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Database:
    def __init__(self):
        print("Initializing database connection")
\`\`\`

Common Use Cases:
- Logging and debugging
- Performance measurement
- Access control and authentication
- Caching and memoization
- Input validation

Note: Decorators are executed at function definition time, not at function call time. They can be stacked (multiple decorators on a single function).`
      },
      {
        id: "generators",
        question: "What are Generators in Python?",
        answer: `Generators are special functions that return an iterator object. They use the yield keyword to return values one at a time, making them memory efficient for handling large datasets.

\`\`\`python
# Simple generator function
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

# Using the generator
counter = count_up_to(5)
print(next(counter))  # 1
print(next(counter))  # 2

# Generator expression (similar to list comprehension)
squares = (x**2 for x in range(1000000))  # Memory efficient

# Generator with multiple yields
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# Using generator in a for loop
fib = fibonacci()
for _ in range(10):
    print(next(fib))
\`\`\`

Advantages of Generators:
- Memory efficient
- Can represent infinite sequences
- Lazy evaluation
- Perfect for large datasets
- Can be used in for loops

Note: Once a generator has been exhausted (all values yielded), it cannot be reused. You need to create a new generator object.`
      }
    ],
    advanced: [
      {
        id: "gil",
        question: "What is the Global Interpreter Lock (GIL) in Python?",
        answer: `The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously. This lock is necessary mainly because CPython's memory management is not thread-safe.

\`\`\`python
import threading
import time

# CPU-bound task (affected by GIL)
def cpu_bound(n):
    while n > 0:
        n -= 1

# I/O-bound task (less affected by GIL)
def io_bound():
    time.sleep(1)

# Demonstrating GIL impact
def run_tasks(func, n_threads):
    start = time.time()
    threads = []
    
    for _ in range(n_threads):
        t = threading.Thread(target=func)
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    
    return time.time() - start

# Compare single vs multi-threaded performance
def cpu_intensive():
    cpu_bound(10**7)

# Single thread
print("Single thread time:", run_tasks(cpu_intensive, 1))

# Multiple threads
print("Multi thread time:", run_tasks(cpu_intensive, 4))
\`\`\`

GIL Impact:
- Limits multi-core execution
- Affects CPU-bound threads
- Less impact on I/O-bound operations
- Single-threaded performance optimization

Working Around GIL:
- Using multiprocessing
- Using alternative Python implementations (Jython, IronPython)
- C extensions that release GIL
- Async I/O for concurrent operations`
      },
      {
        id: "metaclasses",
        question: "What are Metaclasses in Python?",
        answer: `Metaclasses are classes for classes - they allow you to customize class creation. They define the type of a class, just as a class defines the type of an instance. Metaclasses are used for class creation customization, API design, and framework development.

\`\`\`python
# Basic metaclass example
class MyMetaclass(type):
    def __new__(cls, name, bases, attrs):
        # Add a new method to the class
        attrs['new_method'] = lambda self: "I'm a new method"
        return super().__new__(cls, name, bases, attrs)

class MyClass(metaclass=MyMetaclass):
    pass

# Instance creation will have the new method
obj = MyClass()
print(obj.new_method())  # Output: I'm a new method

# Metaclass for abstract base classes
from abc import ABCMeta, abstractmethod

class Interface(metaclass=ABCMeta):
    @abstractmethod
    def my_method(self):
        pass

# Singleton using metaclass
class Singleton(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=Singleton):
    def __init__(self):
        print("Initializing database connection")
\`\`\`

Common Use Cases:
- Abstract Base Classes
- Class Registration
- Interface Enforcement
- Attribute Creation Rules
- Class Decoration

Key Methods:
- __new__: Class instance creation
- __init__: Class initialization
- __call__: Instance creation control
- __prepare__: Namespace preparation`
      },
      {
        id: "asyncio",
        question: "What is Asyncio in Python?",
        answer: `Asyncio is Python's built-in library for writing concurrent code using the async/await syntax. It provides a framework for writing single-threaded concurrent code using coroutines, multiplexing I/O access over sockets and other resources.

\`\`\`python
import asyncio
import aiohttp
import time

# Basic coroutine
async def hello_world():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

# Running a coroutine
asyncio.run(hello_world())

# Multiple coroutines
async def fetch_data(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = []
        urls = [
            'http://example.com',
            'http://example.org',
            'http://example.net'
        ]
        
        for url in urls:
            task = asyncio.create_task(fetch_data(session, url))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return results
\`\`\`

Key Concepts:
- Coroutines (async/await)
- Event loops
- Tasks and Futures
- Asynchronous context managers
- Exception handling

Best Use Cases:
- I/O-bound network operations
- Web scraping
- Real-time applications
- High-concurrency servers`
      }
    ]
  },
  react: {
    basic: [
      {
        id: "what-is-react",
        question: "What is React?",
        answer: `React is a powerful JavaScript library designed for building user interfaces, particularly for single-page applications where a fast and interactive user experience is critical. It was created by Facebook and is now maintained by both Facebook and a vibrant community of developers.

React enables developers to construct large, dynamic web applications that can update data without requiring a full page reload. At its core, React revolves around the concept of components—reusable, self-contained pieces of code that can be combined to form complex user interfaces.

Unlike traditional frameworks, React adopts a declarative approach, allowing developers to define how the UI should look based on its current state, making the code easier to understand and maintain. One of its standout features is the use of a virtual DOM, which optimizes updates to the actual DOM, resulting in improved performance by reducing unnecessary re-renders.`
      },
      {
        id: "advantages-of-react",
        question: "What are the advantages of using React?",
        answer: `React offers a range of advantages that make it a go-to choice for modern web development:

- **Component-Based Architecture:** Allows developers to break down the UI into reusable, modular pieces, which simplifies maintenance and enhances scalability.

- **Virtual DOM:** A lightweight copy of the actual DOM that optimizes rendering by only updating the parts of the UI that change, boosting application performance.

- **Declarative Syntax:** You describe what the UI should look like for a given state, making it easier to debug and predict behavior.

- **Large, Active Community:** Provides extensive resources, tutorials, and third-party libraries to accelerate development.

- **Flexibility:** Integrates seamlessly with other tools or frameworks for tasks like routing or state management.

- **Server-Side Rendering:** Improves SEO and speeds up initial page loads.

- **Gentle Learning Curve:** For developers familiar with JavaScript, React is relatively easy to learn, especially with the introduction of Hooks.`
      },
      {
        id: "limitations-of-react",
        question: "What are the limitations of React?",
        answer: `While React is a fantastic tool, it does come with some limitations that developers should be aware of:

- **View-Layer Only:** React is primarily a view-layer library, meaning it doesn't provide built-in solutions for things like routing or state management—you'll need to pair it with additional libraries like Redux or React Router.

- **Overwhelming Documentation:** While comprehensive, React's documentation can feel overwhelming for beginners due to its size and the rapid pace of updates.

- **Decision Fatigue:** React's flexibility can lead to decision fatigue since it doesn't enforce a specific structure, leaving developers to choose from countless complementary tools.

- **JSX Complexity:** The JSX syntax, which blends HTML-like code with JavaScript, can be confusing for newcomers despite its power.

- **Application Complexity:** Large React applications can become complex, requiring careful state and side-effect management to avoid performance issues.

- **Learning Curve for Hooks:** The shift toward functional components and Hooks might pose a learning challenge for developers accustomed to class-based approaches.`
      },
      {
        id: "use-state-hook",
        question: "What is useState() in React?",
        answer: `The useState() Hook is a fundamental feature in React that allows functional components to manage state, a capability that was previously exclusive to class components. Introduced with React Hooks, useState() provides a simple way to add stateful logic to your components without the verbosity of classes.

When you call useState(), it returns an array with two elements: the current state value and a function to update it. This Hook is incredibly versatile, enabling dynamic UI updates based on user interactions or other events.

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

In this snippet, useState(0) initializes the count state variable to 0. The setCount function updates count when the button is clicked, triggering a re-render with the new value. This demonstrates how useState() empowers functional components to handle dynamic data efficiently, making them as powerful as their class-based counterparts while keeping the code concise and readable.`
      },
      {
        id: "keys-in-react",
        question: "What are keys in React?",
        answer: `Keys in React are special attributes used when rendering lists of elements to help React identify which items have changed, been added, or been removed. They provide a stable identity to each element in a list, enabling React to optimize the rendering process by only updating the necessary parts of the DOM.

Keys must be unique among sibling elements within the same list but don't need to be globally unique across the application. This mechanism is crucial for performance, especially in dynamic lists where items might shift, as it prevents React from re-rendering the entire list unnecessarily.

\`\`\`jsx
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => (
  <li key={number.toString()}>
    {number}
  </li>
));
\`\`\`

In this code, each <li> element is assigned a key based on the number converted to a string. When the list changes—say, an item is added or removed—React uses these keys to efficiently update only the affected elements rather than re-rendering the whole list.

Without keys, React might struggle to track changes, leading to potential bugs or performance issues, making keys an essential tool for list rendering.`
      }
    ],
    intermediate: [
      {
        id: "jsx-in-react",
        question: "What is JSX?",
        answer: `JSX, or JavaScript XML, is a syntax extension for JavaScript that allows developers to write HTML-like code directly within JavaScript files. It's a cornerstone of React development, making it easier to define and visualize the structure of UI components.

While it looks like HTML, JSX is actually transpiled into regular JavaScript function calls by tools like Babel, which React then uses to create elements. This blend of markup and logic in one place enhances readability and maintainability.

\`\`\`jsx
const element = <h1>Hello, world!</h1>;
\`\`\`

This JSX is transformed into:

\`\`\`javascript
const element = React.createElement('h1', null, 'Hello, world!');
\`\`\`

Here, the JSX <h1>Hello, world!</h1> becomes a call to React.createElement(), which constructs the UI element.

JSX isn't required in React—you could write raw JavaScript—but its intuitive syntax makes it the preferred choice for most developers, streamlining the process of building and understanding complex UIs.`
      },
      {
        id: "components-difference",
        question: "What are the differences between functional and class components?",
        answer: `In React, components can be defined as either functional or class components, each with distinct characteristics:

**Functional Components:**
- Plain JavaScript functions that take props as an argument and return JSX
- Simpler, more concise syntax
- Can handle state and side effects with Hooks
- Preferred in modern React development

\`\`\`jsx
import React, { useState } from 'react';

function FunctionalComponent() {
  const [count, setCount] = useState(0);
  return <h1>{count}</h1>;
}
\`\`\`

**Class Components:**
- ES6 classes that extend React.Component
- Require a render method to return JSX
- Inherently support state and lifecycle methods
- More verbose syntax

\`\`\`jsx
import React, { Component } from 'react';

class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return <h1>{this.state.count}</h1>;
  }
}
\`\`\`

In the functional component, useState manages the count, while in the class component, state is handled via this.state and updated with this.setState. Functional components are now preferred due to their simplicity and the power of Hooks, while class components remain relevant for legacy code or specific use cases requiring lifecycle methods not yet fully replicated by Hooks.`
      },
      {
        id: "virtual-dom",
        question: "What is the virtual DOM?",
        answer: `The virtual DOM is a lightweight, in-memory representation of the actual DOM, and it's a key feature that sets React apart. Instead of directly manipulating the real DOM, which can be slow due to reflows and repaints, React maintains this virtual version to track the UI's state.

When a component's state changes, React first updates the virtual DOM with the new data. It then performs a process called reconciliation, comparing the updated virtual DOM with the previous version to identify what's changed. Finally, React applies only those changes to the actual DOM, minimizing costly operations.

This approach significantly boosts performance, especially in complex applications with frequent updates, by reducing unnecessary re-renders and ensuring the UI stays in sync with the state efficiently.

The virtual DOM's benefits include:

- **Improved Performance:** By batching DOM updates and only applying necessary changes
- **Simplified Programming Model:** Developers can think in terms of the entire UI state at any time
- **Cross-Platform Capabilities:** The virtual DOM abstraction allows React to target platforms beyond the browser (like React Native)
- **Declarative API:** React handles the "how" of DOM updates, letting developers focus on the "what"`
      },
      {
        id: "controlled-components",
        question: "What are the differences between controlled and uncontrolled components?",
        answer: `Controlled and uncontrolled components are two approaches to handling form data in React:

**Controlled Components:**
- Form input values are tied to component state
- React fully manages the data through state updates
- Provides fine-grained control over the form
- Simplifies validation and conditional rendering

\`\`\`jsx
import React, { useState } from 'react';

function ControlledComponent() {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}
\`\`\`

**Uncontrolled Components:**
- The DOM handles form data internally
- Access data using refs when needed
- Simpler approach with less code
- Less control over form data

\`\`\`jsx
import React, { useRef } from 'react';

function UncontrolledComponent() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    alert(inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} />
      <button type="submit">Submit</button>
    </form>
  );
}
\`\`\`

In the controlled example, the input's value is bound to the value state, and handleChange updates it. In the uncontrolled example, the input's value lives in the DOM, accessed via inputRef.current when the button is clicked.

Controlled components are preferred for dynamic forms, while uncontrolled ones suit simpler scenarios.`
      }
    ],
    advanced: [
      {
        id: "props-drilling",
        question: "What is prop drilling in React?",
        answer: `Prop drilling is a situation in React where data is passed from a parent component through multiple layers of child components via props, even if some intermediate components don't use the data themselves. This can clutter component code and make maintenance harder as the component tree grows.

\`\`\`jsx
function Grandparent() {
  const data = "Hello from Grandparent";
  return <Parent data={data} />;
}

function Parent({ data }) {
  return <Child data={data} />;
}

function Child({ data }) {
  return <p>{data}</p>;
}
\`\`\`

In this case, Parent doesn't need data but must pass it to Child, demonstrating prop drilling. While this works for small apps, it becomes cumbersome in larger ones.

Solutions to avoid prop drilling include:

- **Context API:** Provides a way to share values between components without explicitly passing props through every level.
- **State Management Libraries:** Redux, MobX, or Recoil can manage global state.
- **Component Composition:** Restructuring components to avoid deep nesting.
- **Custom Hooks:** Sharing stateful logic between components.

These approaches allow data to be shared directly with deeper components, bypassing unnecessary prop passing and improving code scalability.`
      },
      {
        id: "error-boundaries",
        question: "What are error boundaries?",
        answer: `Error boundaries are special React components that catch JavaScript errors in their child component tree, preventing the entire application from crashing. They act like a UI-level try-catch mechanism.

To create an error boundary, a class component must implement one or both of the following lifecycle methods:
- static getDerivedStateFromError(error): Updates the component's state to show a fallback UI.
- componentDidCatch(error, errorInfo): Logs error details for debugging.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
\`\`\`

Usage Example:

\`\`\`jsx
<ErrorBoundary>
    <MyComponent />
</ErrorBoundary>
\`\`\`

If MyComponent throws an error, ErrorBoundary catches it and renders a fallback UI instead of breaking the app. This ensures a better user experience by gracefully handling unexpected errors.

Limitations of Error Boundaries:
- They do not catch errors in event handlers, asynchronous code (e.g., setTimeout, fetch), or server-side rendering.
- They only work for their child components, not for themselves.
- They must be class components, as there is no Hook equivalent yet.`
      },
      {
        id: "react-hooks",
        question: "What is React Hooks?",
        answer: `React Hooks are functions introduced in React 16.8 that enable functional components to use state, lifecycle features, and other React functionalities traditionally limited to class components. They simplify code by eliminating the need for classes and enhance reusability through custom Hooks.

Key built-in Hooks include:

- **useState:** Manages state in functional components
- **useEffect:** Handles side effects like data fetching, subscriptions, or DOM manipulation
- **useContext:** Accesses React Context API for sharing data
- **useReducer:** Manages complex state logic
- **useRef:** Creates mutable references that persist across renders
- **useMemo:** Memoizes expensive calculations to optimize performance
- **useCallback:** Memoizes functions to prevent unnecessary re-renders

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

Hooks revolutionized React development by:
- Making functional components as powerful as class components
- Enabling better code organization and reuse
- Reducing boilerplate code
- Providing a more consistent way to use React features
- Simplifying complex component logic

They've become the standard approach for new React development due to their simplicity and flexibility.`
      },
      {
        id: "react-router",
        question: "What is React Router?",
        answer: `React Router is a popular library for handling client-side routing in React applications. It allows developers to create single-page applications (SPAs) with multiple views or pages, each with its own URL, without requiring full page reloads.

Key features include:

- **Declarative Routing:** Define routes using components like \`<Route>\`, \`<Switch>\`, and \`<Link>\`
- **Nested Routes:** Support for nested routes to handle complex layouts
- **Route Parameters:** Dynamic segments in URLs (e.g., /users/:id) for dynamic data
- **Programmatic Navigation:** Use useHistory or withRouter to navigate programmatically

\`\`\`jsx
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

function Home() {
  return <h2>Home Page</h2>;
}

function About() {
  return <h2>About Page</h2>;
}

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/about">
          <About />
        </Route>
      </Switch>
    </Router>
  );
}
\`\`\`

In this example:
- \`<Router>\` wraps the app to enable routing
- \`<Link>\` provides navigation links without reloading the page
- \`<Switch>\` ensures only one \`<Route>\` matches and renders based on the URL

React Router integrates seamlessly with React's component model, making it easy to manage navigation and maintain a smooth user experience in SPAs.`
      }
    ]
  }
};

export default function InterviewQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("sql");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const breadcrumbItems = [
    {
      href: "/resources",
      label: "Resources",
      icon: BookOpenText,
    },
    {
      href: "/resources/interview-questions",
      label: "Interview Questions",
      icon: MessagesSquare,
    },
  ];

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filterQuestions = (questions: any[], term: string) => {
    if (!term) return questions;
    return questions.filter(q => 
      q.question.toLowerCase().includes(term.toLowerCase()) || 
      q.answer.toLowerCase().includes(term.toLowerCase())
    );
  };

  const basicQuestions = filterQuestions(questionsData.sql?.basic || [], searchTerm);
  const intermediateQuestions = filterQuestions(questionsData.sql?.intermediate || [], searchTerm);
  const advancedQuestions = filterQuestions(questionsData.sql?.advanced || [], searchTerm);

  const pythonBasicQuestions = filterQuestions(questionsData.python?.basic || [], searchTerm);
  const pythonIntermediateQuestions = filterQuestions(questionsData.python?.intermediate || [], searchTerm);
  const pythonAdvancedQuestions = filterQuestions(questionsData.python?.advanced || [], searchTerm);

  const reactBasicQuestions = filterQuestions(questionsData.react?.basic || [], searchTerm);
  const reactIntermediateQuestions = filterQuestions(questionsData.react?.intermediate || [], searchTerm);
  const reactAdvancedQuestions = filterQuestions(questionsData.react?.advanced || [], searchTerm);

  return (
    <div className="space-y-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Interview Questions
          </h2>
          <p className="text-muted-foreground">
            Comprehensive database of interview questions with detailed answers
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={cn(
                "group h-full cursor-pointer transition-all hover:border-primary hover:shadow-lg",
                activeCategory === category.id ? "border-primary shadow-md" : ""
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              <div className="relative h-full p-6">
                {/* Animated gradient background */}
                <div className={cn(
                  "absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent",
                  activeCategory === category.id ? "opacity-100" : "opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                )} />

                <div className="relative space-y-4">
                  <div
                    className={cn(
                      "w-fit rounded-lg p-2.5 transition-colors duration-300",
                      category.bgColor,
                      category.hoverColor,
                    )}
                  >
                    <category.icon
                      className={cn(
                        "h-6 w-6 transition-transform group-hover:scale-110",
                        category.color,
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.name} interview questions and answers
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Questions content */}
        {activeCategory === "sql" && (
          <motion.div
            key="sql-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="basic">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="intermediate">
                  <Code className="mr-2 h-4 w-4" />
                  Intermediate
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Server className="mr-2 h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Basic MySQL Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {basicQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {basicQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="intermediate" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Intermediate MySQL Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {intermediateQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {intermediateQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Advanced MySQL Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {advancedQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {advancedQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {activeCategory === "python" && (
          <motion.div
            key="python-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="basic">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="intermediate">
                  <Code className="mr-2 h-4 w-4" />
                  Intermediate
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Server className="mr-2 h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Basic Python Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {pythonBasicQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {pythonBasicQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="intermediate" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Intermediate Python Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {pythonIntermediateQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {pythonIntermediateQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Advanced Python Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {pythonAdvancedQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {pythonAdvancedQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {activeCategory === "react" && (
          <motion.div
            key="react-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="basic">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="intermediate">
                  <Code className="mr-2 h-4 w-4" />
                  Intermediate
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Server className="mr-2 h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Basic React Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {reactBasicQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {reactBasicQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="intermediate" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Intermediate React Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {reactIntermediateQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {reactIntermediateQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Advanced React Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {reactAdvancedQuestions.length} questions
                  </p>
                </div>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {reactAdvancedQuestions.map((q) => (
                    <motion.div key={q.id} variants={item}>
                      <QuestionCard
                        question={q.question}
                        answer={q.answer}
                        isExpanded={!!expandedQuestions[q.id]}
                        onToggle={() => toggleQuestion(q.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {activeCategory !== "sql" && activeCategory !== "python" && activeCategory !== "react" && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <List className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground">
              {categories.find(c => c.id === activeCategory)?.name} questions are currently in development
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface QuestionCardProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function QuestionCard({ question, answer, isExpanded, onToggle }: QuestionCardProps) {
  return (
    <Card 
      className="group relative overflow-hidden transition-all hover:shadow-md"
      onClick={onToggle}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative cursor-pointer p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-medium">{question}</h3>
          <button className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-muted-foreground"
          >
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {answer.split("```").map((part, i) => {
                // Code block handling
                if (i % 2 === 1) {
                  const [language, ...codeParts] = part.split("\n");
                  const code = codeParts.join("\n");
                  return (
                    <pre key={i} className="rounded-md bg-muted p-4">
                      <code className="text-xs font-mono text-muted-foreground">
                        {code}
                      </code>
                    </pre>
                  );
                }
                
                // Regular text with paragraph handling
                return (
                  <div key={i}>
                    {part.split("\n\n").map((paragraph, j) => (
                      <div key={j} className="mb-4">
                        {paragraph.split("\n").map((line, k) => {
                          // Handle list items
                          if (line.startsWith("- ")) {
                            return (
                              <div key={k} className="flex items-start gap-2 ml-2 mb-1">
                                <div className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground" />
                                <p>{line.substring(2)}</p>
                              </div>
                            );
                          }
                          return <p key={k} className="mb-1">{line}</p>;
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
} 