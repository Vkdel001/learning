import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Computer Science Curriculum for Mauritius Secondary Schools
 * Grades 7-13 (Form 1-6 + Lower 6)
 */

interface CurriculumStructure {
  name: string;
  nodeType: 'grade' | 'subject' | 'section' | 'topic' | 'subtopic';
  children?: CurriculumStructure[];
}

const curriculum: CurriculumStructure[] = [
  {
    name: 'Grade 7',
    nodeType: 'grade',
    children: [
      {
        name: 'Computer Science',
        nodeType: 'subject',
        children: [
          {
            name: 'Data Representation',
            nodeType: 'section',
            children: [
              {
                name: 'Number Systems',
                nodeType: 'topic',
                children: [
                  { name: 'Decimal and Binary', nodeType: 'subtopic' },
                  { name: 'Hexadecimal System', nodeType: 'subtopic' },
                  { name: 'Number Conversions', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Text, Sound and Images',
                nodeType: 'topic',
                children: [
                  { name: 'Character Encoding (ASCII, Unicode)', nodeType: 'subtopic' },
                  { name: 'Image Representation', nodeType: 'subtopic' },
                  { name: 'Sound Sampling', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Data Storage and File Compression',
                nodeType: 'topic',
                children: [
                  { name: 'Storage Units (Bits, Bytes, KB, MB, GB)', nodeType: 'subtopic' },
                  { name: 'Lossy vs Lossless Compression', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Data Transmission',
            nodeType: 'section',
            children: [
              {
                name: 'Types and Methods of Data Transmission',
                nodeType: 'topic',
                children: [
                  { name: 'Serial vs Parallel Transmission', nodeType: 'subtopic' },
                  { name: 'Simplex, Half-Duplex, Full-Duplex', nodeType: 'subtopic' },
                  { name: 'Synchronous vs Asynchronous', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Methods of Error Detection',
                nodeType: 'topic',
                children: [
                  { name: 'Parity Checks', nodeType: 'subtopic' },
                  { name: 'Checksums', nodeType: 'subtopic' },
                  { name: 'Echo Checks', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Encryption',
                nodeType: 'topic',
                children: [
                  { name: 'Symmetric Encryption', nodeType: 'subtopic' },
                  { name: 'Asymmetric Encryption', nodeType: 'subtopic' },
                  { name: 'Public and Private Keys', nodeType: 'subtopic' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Grade 8',
    nodeType: 'grade',
    children: [
      {
        name: 'Computer Science',
        nodeType: 'subject',
        children: [
          {
            name: 'Hardware',
            nodeType: 'section',
            children: [
              {
                name: 'Computer Architecture',
                nodeType: 'topic',
                children: [
                  { name: 'Von Neumann Architecture', nodeType: 'subtopic' },
                  { name: 'CPU Components (ALU, CU, Registers)', nodeType: 'subtopic' },
                  { name: 'Fetch-Decode-Execute Cycle', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Input and Output Devices',
                nodeType: 'topic',
                children: [
                  { name: 'Input Devices (Keyboard, Mouse, Scanner)', nodeType: 'subtopic' },
                  { name: 'Output Devices (Monitor, Printer, Speaker)', nodeType: 'subtopic' },
                  { name: 'Sensors and Actuators', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Data Storage',
                nodeType: 'topic',
                children: [
                  { name: 'Primary Storage (RAM, ROM)', nodeType: 'subtopic' },
                  { name: 'Secondary Storage (HDD, SSD, USB)', nodeType: 'subtopic' },
                  { name: 'Cloud Storage', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Network Hardware',
                nodeType: 'topic',
                children: [
                  { name: 'Network Interface Cards (NIC)', nodeType: 'subtopic' },
                  { name: 'Routers and Switches', nodeType: 'subtopic' },
                  { name: 'Modems and Access Points', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Software',
            nodeType: 'section',
            children: [
              {
                name: 'Types of Software and Interrupts',
                nodeType: 'topic',
                children: [
                  { name: 'System Software vs Application Software', nodeType: 'subtopic' },
                  { name: 'Operating Systems', nodeType: 'subtopic' },
                  { name: 'Utility Software', nodeType: 'subtopic' },
                  { name: 'Hardware and Software Interrupts', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Programming Languages and IDEs',
                nodeType: 'topic',
                children: [
                  { name: 'High-Level vs Low-Level Languages', nodeType: 'subtopic' },
                  { name: 'Compilers and Interpreters', nodeType: 'subtopic' },
                  { name: 'Integrated Development Environments', nodeType: 'subtopic' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Grade 9',
    nodeType: 'grade',
    children: [
      {
        name: 'Computer Science',
        nodeType: 'subject',
        children: [
          {
            name: 'The Internet and Its Uses',
            nodeType: 'section',
            children: [
              {
                name: 'The Internet and World Wide Web',
                nodeType: 'topic',
                children: [
                  { name: 'Internet vs WWW', nodeType: 'subtopic' },
                  { name: 'IP Addresses and DNS', nodeType: 'subtopic' },
                  { name: 'URLs and HTTP/HTTPS', nodeType: 'subtopic' },
                  { name: 'Web Browsers and Search Engines', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Digital Currency',
                nodeType: 'topic',
                children: [
                  { name: 'Cryptocurrency Basics', nodeType: 'subtopic' },
                  { name: 'Blockchain Technology', nodeType: 'subtopic' },
                  { name: 'Digital Wallets', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Cyber Security',
                nodeType: 'topic',
                children: [
                  { name: 'Malware Types (Virus, Trojan, Worm)', nodeType: 'subtopic' },
                  { name: 'Phishing and Social Engineering', nodeType: 'subtopic' },
                  { name: 'Firewalls and Antivirus', nodeType: 'subtopic' },
                  { name: 'Strong Passwords and 2FA', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Programming Fundamentals',
            nodeType: 'section',
            children: [
              {
                name: 'Variables and Data Types',
                nodeType: 'topic',
                children: [
                  { name: 'Integer, Float, String, Boolean', nodeType: 'subtopic' },
                  { name: 'Type Conversion', nodeType: 'subtopic' },
                  { name: 'Constants', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Selection Statements',
                nodeType: 'topic',
                children: [
                  { name: 'If Statements', nodeType: 'subtopic' },
                  { name: 'If-Else Statements', nodeType: 'subtopic' },
                  { name: 'Elif and Nested Conditions', nodeType: 'subtopic' },
                  { name: 'Logical Operators (AND, OR, NOT)', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Iteration',
                nodeType: 'topic',
                children: [
                  { name: 'For Loops', nodeType: 'subtopic' },
                  { name: 'While Loops', nodeType: 'subtopic' },
                  { name: 'Break and Continue', nodeType: 'subtopic' },
                  { name: 'Nested Loops', nodeType: 'subtopic' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Grade 10',
    nodeType: 'grade',
    children: [
      {
        name: 'Computer Science',
        nodeType: 'subject',
        children: [
          {
            name: 'Automated and Emerging Technologies',
            nodeType: 'section',
            children: [
              {
                name: 'Automated Systems',
                nodeType: 'topic',
                children: [
                  { name: 'Sensors and Control Systems', nodeType: 'subtopic' },
                  { name: 'Feedback Loops', nodeType: 'subtopic' },
                  { name: 'Applications (Smart Homes, Manufacturing)', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Robotics',
                nodeType: 'topic',
                children: [
                  { name: 'Robot Components', nodeType: 'subtopic' },
                  { name: 'Robot Programming', nodeType: 'subtopic' },
                  { name: 'Applications in Industry', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Artificial Intelligence',
                nodeType: 'topic',
                children: [
                  { name: 'Machine Learning Basics', nodeType: 'subtopic' },
                  { name: 'Neural Networks', nodeType: 'subtopic' },
                  { name: 'AI Applications and Ethics', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Advanced Programming',
            nodeType: 'section',
            children: [
              {
                name: 'Functions and Procedures',
                nodeType: 'topic',
                children: [
                  { name: 'Defining Functions', nodeType: 'subtopic' },
                  { name: 'Parameters and Arguments', nodeType: 'subtopic' },
                  { name: 'Return Values', nodeType: 'subtopic' },
                  { name: 'Scope and Lifetime', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Arrays and Lists',
                nodeType: 'topic',
                children: [
                  { name: '1D and 2D Arrays', nodeType: 'subtopic' },
                  { name: 'List Methods', nodeType: 'subtopic' },
                  { name: 'Searching and Sorting', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'File Handling',
                nodeType: 'topic',
                children: [
                  { name: 'Reading from Files', nodeType: 'subtopic' },
                  { name: 'Writing to Files', nodeType: 'subtopic' },
                  { name: 'CSV and Text Files', nodeType: 'subtopic' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Grade 11',
    nodeType: 'grade',
    children: [
      {
        name: 'Computer Science',
        nodeType: 'subject',
        children: [
          {
            name: 'Object-Oriented Programming',
            nodeType: 'section',
            children: [
              {
                name: 'Classes and Objects',
                nodeType: 'topic',
                children: [
                  { name: 'Defining Classes', nodeType: 'subtopic' },
                  { name: 'Creating Objects', nodeType: 'subtopic' },
                  { name: 'Attributes and Methods', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'OOP Principles',
                nodeType: 'topic',
                children: [
                  { name: 'Encapsulation', nodeType: 'subtopic' },
                  { name: 'Inheritance', nodeType: 'subtopic' },
                  { name: 'Polymorphism', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Databases',
            nodeType: 'section',
            children: [
              {
                name: 'Database Concepts',
                nodeType: 'topic',
                children: [
                  { name: 'Tables and Records', nodeType: 'subtopic' },
                  { name: 'Primary Keys', nodeType: 'subtopic' },
                  { name: 'Relationships', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'SQL Basics',
                nodeType: 'topic',
                children: [
                  { name: 'SELECT Queries', nodeType: 'subtopic' },
                  { name: 'INSERT, UPDATE, DELETE', nodeType: 'subtopic' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Generate materialized path for a node
 */
function generatePath(parentPath: string | null, index: number): string {
  const paddedIndex = (index + 1).toString().padStart(4, '0');
  return parentPath ? `${parentPath}.${paddedIndex}` : paddedIndex;
}

/**
 * Recursively seed curriculum nodes
 */
async function seedNode(
  node: CurriculumStructure,
  level: number,
  path: string,
  parentId: string | null = null
): Promise<void> {
  // Upsert node (idempotent)
  const dbNode = await prisma.curriculumNode.upsert({
    where: { path },
    update: {
      name: node.name,
      nodeType: node.nodeType,
      level,
      parentId,
    },
    create: {
      name: node.name,
      path,
      level,
      nodeType: node.nodeType,
      parentId,
    },
  });

  // Seed children recursively
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const childPath = generatePath(path, i);
      await seedNode(node.children[i], level + 1, childPath, dbNode.id);
    }
  }
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting curriculum seeding...');

  for (let i = 0; i < curriculum.length; i++) {
    const gradePath = generatePath(null, i);
    console.log(`Seeding ${curriculum[i].name}...`);
    await seedNode(curriculum[i], 1, gradePath);
  }

  // Validation
  const totalNodes = await prisma.curriculumNode.count();
  const grades = await prisma.curriculumNode.count({ where: { level: 1 } });
  const subjects = await prisma.curriculumNode.count({ where: { level: 2 } });
  const sections = await prisma.curriculumNode.count({ where: { level: 3 } });
  const topics = await prisma.curriculumNode.count({ where: { level: 4 } });
  const subtopics = await prisma.curriculumNode.count({ where: { level: 5 } });

  console.log('\n✅ Seeding completed!');
  console.log(`📊 Total nodes: ${totalNodes}`);
  console.log(`   - Grades: ${grades}`);
  console.log(`   - Subjects: ${subjects}`);
  console.log(`   - Sections: ${sections}`);
  console.log(`   - Topics: ${topics}`);
  console.log(`   - Subtopics: ${subtopics}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
