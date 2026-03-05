import { prisma } from '../prisma';
import { CurriculumNode } from '@prisma/client';

/**
 * Curriculum Navigation Service
 * Handles hierarchical curriculum tree navigation using materialized paths
 */

export interface CurriculumNodeWithChildren extends CurriculumNode {
  children?: CurriculumNodeWithChildren[];
}

/**
 * Get all grades (level 1 nodes)
 */
export async function getGrades(): Promise<CurriculumNode[]> {
  return prisma.curriculumNode.findMany({
    where: {
      level: 1,
      nodeType: 'grade',
    },
    orderBy: {
      path: 'asc',
    },
  });
}

/**
 * Get subjects for a specific grade (level 2 nodes)
 */
export async function getSubjects(gradeId: string): Promise<CurriculumNode[]> {
  const grade = await prisma.curriculumNode.findUnique({
    where: { id: gradeId },
  });

  if (!grade) {
    return [];
  }

  return prisma.curriculumNode.findMany({
    where: {
      level: 2,
      nodeType: 'subject',
      path: {
        startsWith: grade.path + '.',
      },
    },
    orderBy: {
      path: 'asc',
    },
  });
}

/**
 * Get sections for a specific subject (level 3 nodes)
 */
export async function getSections(subjectId: string): Promise<CurriculumNode[]> {
  const subject = await prisma.curriculumNode.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return [];
  }

  return prisma.curriculumNode.findMany({
    where: {
      level: 3,
      nodeType: 'section',
      path: {
        startsWith: subject.path + '.',
      },
    },
    orderBy: {
      path: 'asc',
    },
  });
}

/**
 * Get topics for a specific section (level 4 nodes)
 */
export async function getTopics(sectionId: string): Promise<CurriculumNode[]> {
  const section = await prisma.curriculumNode.findUnique({
    where: { id: sectionId },
  });

  if (!section) {
    return [];
  }

  return prisma.curriculumNode.findMany({
    where: {
      level: 4,
      nodeType: 'topic',
      path: {
        startsWith: section.path + '.',
      },
    },
    orderBy: {
      path: 'asc',
    },
  });
}

/**
 * Get subtopics for a specific topic (level 5 nodes)
 */
export async function getSubtopics(topicId: string): Promise<CurriculumNode[]> {
  const topic = await prisma.curriculumNode.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    return [];
  }

  return prisma.curriculumNode.findMany({
    where: {
      level: 5,
      nodeType: 'subtopic',
      path: {
        startsWith: topic.path + '.',
      },
    },
    orderBy: {
      path: 'asc',
    },
  });
}

/**
 * Get a node by its materialized path
 */
export async function getNodeByPath(path: string): Promise<CurriculumNode | null> {
  return prisma.curriculumNode.findUnique({
    where: { path },
  });
}

/**
 * Get a node by ID
 */
export async function getNodeById(id: string): Promise<CurriculumNode | null> {
  return prisma.curriculumNode.findUnique({
    where: { id },
  });
}

/**
 * Get all ancestors of a node (parent, grandparent, etc.)
 */
export async function getAncestors(nodeId: string): Promise<CurriculumNode[]> {
  const node = await prisma.curriculumNode.findUnique({
    where: { id: nodeId },
  });

  if (!node) {
    return [];
  }

  // Parse path to get ancestor paths
  // Example: "0001.0002.0003" -> ["0001", "0001.0002"]
  const pathParts = node.path.split('.');
  const ancestorPaths: string[] = [];

  for (let i = 1; i < pathParts.length; i++) {
    ancestorPaths.push(pathParts.slice(0, i).join('.'));
  }

  if (ancestorPaths.length === 0) {
    return [];
  }

  return prisma.curriculumNode.findMany({
    where: {
      path: {
        in: ancestorPaths,
      },
    },
    orderBy: {
      level: 'asc',
    },
  });
}

/**
 * Get immediate children of a node
 */
export async function getChildren(nodeId: string): Promise<CurriculumNode[]> {
  const node = await prisma.curriculumNode.findUnique({
    where: { id: nodeId },
  });

  if (!node) {
    return [];
  }

  return prisma.curriculumNode.findMany({
    where: {
      level: node.level + 1,
      path: {
        startsWith: node.path + '.',
      },
    },
    orderBy: {
      path: 'asc',
    },
  });
}

/**
 * Get breadcrumb trail for a node (ancestors + current node)
 */
export async function getBreadcrumbs(nodeId: string): Promise<CurriculumNode[]> {
  const node = await prisma.curriculumNode.findUnique({
    where: { id: nodeId },
  });

  if (!node) {
    return [];
  }

  const ancestors = await getAncestors(nodeId);
  return [...ancestors, node];
}

/**
 * Search curriculum nodes by name
 */
export async function searchNodes(
  query: string,
  nodeType?: string
): Promise<CurriculumNode[]> {
  return prisma.curriculumNode.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
      ...(nodeType && { nodeType }),
    },
    orderBy: [
      { level: 'asc' },
      { path: 'asc' },
    ],
    take: 20, // Limit results
  });
}
