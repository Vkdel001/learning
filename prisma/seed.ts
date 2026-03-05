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
            name: 'Introduction to Computing',
            nodeType: 'section',
            children: [
              {
                name: 'What is a Computer?',
                nodeType: 'topic',
                children: [
                  { name: 'Hardware Components', nodeType: 'subtopic' },
                  { name: 'Software Types', nodeType: 'subtopic' },
                  { name: 'Input and Output Devices', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Computer Systems',
                nodeType: 'topic',
                children: [
                  { name: 'Operating Systems Basics', nodeType: 'subtopic' },
                  { name: 'File Management', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Digital Literacy',
            nodeType: 'section',
            children: [
              {
                name: 'Using Applications',
                nodeType: 'topic',
                children: [
                  { name: 'Word Processing', nodeType: 'subtopic' },
                  { name: 'Spreadsheets Basics', nodeType: 'subtopic' },
                  { name: 'Presentations', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Internet Safety',
                nodeType: 'topic',
                children: [
                  { name: 'Online Safety', nodeType: 'subtopic' },
                  { name: 'Digital Citizenship', nodeType: 'subtopic' },
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
            name: 'Programming Fundamentals',
            nodeType: 'section',
            children: [
              {
                name: 'Introduction to Programming',
                nodeType: 'topic',
                children: [
                  { name: 'What is Programming?', nodeType: 'subtopic' },
                  { name: 'Algorithms and Flowcharts', nodeType: 'subtopic' },
                  { name: 'Pseudocode', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Basic Python',
                nodeType: 'topic',
                children: [
                  { name: 'Variables and Data Types', nodeType: 'subtopic' },
                  { name: 'Input and Output', nodeType: 'subtopic' },
                  { name: 'Basic Operators', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Data and Information',
            nodeType: 'section',
            children: [
              {
                name: 'Data Representation',
                nodeType: 'topic',
                children: [
                  { name: 'Binary Numbers', nodeType: 'subtopic' },
                  { name: 'Text Encoding', nodeType: 'subtopic' },
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
            name: 'Control Structures',
            nodeType: 'section',
            children: [
              {
                name: 'Selection',
                nodeType: 'topic',
                children: [
                  { name: 'If Statements', nodeType: 'subtopic' },
                  { name: 'If-Else Statements', nodeType: 'subtopic' },
                  { name: 'Nested Conditions', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Iteration',
                nodeType: 'topic',
                children: [
                  { name: 'For Loops', nodeType: 'subtopic' },
                  { name: 'While Loops', nodeType: 'subtopic' },
                  { name: 'Loop Control', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'Data Structures',
            nodeType: 'section',
            children: [
              {
                name: 'Lists and Arrays',
                nodeType: 'topic',
                children: [
                  { name: 'Creating Lists', nodeType: 'subtopic' },
                  { name: 'List Operations', nodeType: 'subtopic' },
                  { name: 'List Iteration', nodeType: 'subtopic' },
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
            name: 'Functions and Procedures',
            nodeType: 'section',
            children: [
              {
                name: 'Functions',
                nodeType: 'topic',
                children: [
                  { name: 'Defining Functions', nodeType: 'subtopic' },
                  { name: 'Parameters and Arguments', nodeType: 'subtopic' },
                  { name: 'Return Values', nodeType: 'subtopic' },
                ],
              },
              {
                name: 'Scope and Lifetime',
                nodeType: 'topic',
                children: [
                  { name: 'Local Variables', nodeType: 'subtopic' },
                  { name: 'Global Variables', nodeType: 'subtopic' },
                ],
              },
            ],
          },
          {
            name: 'File Handling',
            nodeType: 'section',
            children: [
              {
                name: 'Working with Files',
                nodeType: 'topic',
                children: [
                  { name: 'Reading Files', nodeType: 'subtopic' },
                  { name: 'Writing Files', nodeType: 'subtopic' },
                  { name: 'File Modes', nodeType: 'subtopic' },
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
