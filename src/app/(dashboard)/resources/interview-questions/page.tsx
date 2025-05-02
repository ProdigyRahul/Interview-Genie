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
  List
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
};

export default function InterviewQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("sql");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Interview Questions", href: "/resources/interview-questions" },
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

  const basicQuestions = filterQuestions(questionsData.basic || [], searchTerm);
  const intermediateQuestions = filterQuestions(questionsData.intermediate || [], searchTerm);
  const advancedQuestions = filterQuestions(questionsData.advanced || [], searchTerm);

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

        {activeCategory !== "sql" && (
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