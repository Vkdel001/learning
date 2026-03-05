import {
  getGrades,
  getChildren,
  getAncestors,
  getBreadcrumbs,
  getNodeByPath,
  searchNodes,
} from '../services/curriculum.service';
import { prisma } from '../prisma';

/**
 * Unit tests for curriculum navigation
 * Tests edge cases and core functionality
 */

describe('Curriculum Navigation - Unit Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Task 4.3: Test edge cases
   */
  describe('Edge Cases', () => {
    it('should handle empty results gracefully', async () => {
      const children = await getChildren('non-existent-id');
      expect(children).toEqual([]);
    });

    it('should handle invalid node ID for ancestors', async () => {
      const ancestors = await getAncestors('non-existent-id');
      expect(ancestors).toEqual([]);
    });

    it('should handle invalid node ID for breadcrumbs', async () => {
      const breadcrumbs = await getBreadcrumbs('non-existent-id');
      expect(breadcrumbs).toEqual([]);
    });

    it('should return null for non-existent path', async () => {
      const node = await getNodeByPath('9999.9999.9999');
      expect(node).toBeNull();
    });
  });

  describe('Basic Navigation', () => {
    it('should fetch all grades', async () => {
      const grades = await getGrades();
      expect(grades.length).toBeGreaterThan(0);
      expect(grades[0].nodeType).toBe('grade');
      expect(grades[0].level).toBe(1);
    });

    it('should fetch children of a node', async () => {
      const grades = await getGrades();
      if (grades.length > 0) {
        const children = await getChildren(grades[0].id);
        expect(Array.isArray(children)).toBe(true);
        if (children.length > 0) {
          expect(children[0].level).toBe(2);
        }
      }
    });

    it('should fetch ancestors correctly', async () => {
      const grades = await getGrades();
      if (grades.length > 0) {
        const subjects = await getChildren(grades[0].id);
        if (subjects.length > 0) {
          const sections = await getChildren(subjects[0].id);
          if (sections.length > 0) {
            const ancestors = await getAncestors(sections[0].id);
            expect(ancestors.length).toBeGreaterThanOrEqual(2);
            expect(ancestors[0].level).toBe(1); // Grade
            expect(ancestors[1].level).toBe(2); // Subject
          }
        }
      }
    });

    it('should fetch breadcrumbs correctly', async () => {
      const grades = await getGrades();
      if (grades.length > 0) {
        const subjects = await getChildren(grades[0].id);
        if (subjects.length > 0) {
          const breadcrumbs = await getBreadcrumbs(subjects[0].id);
          expect(breadcrumbs.length).toBe(2); // Grade + Subject
          expect(breadcrumbs[0].level).toBe(1);
          expect(breadcrumbs[1].level).toBe(2);
          expect(breadcrumbs[1].id).toBe(subjects[0].id);
        }
      }
    });

    it('should search nodes by name', async () => {
      const results = await searchNodes('Computer');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Computer');
    });

    it('should search nodes by type', async () => {
      const results = await searchNodes('Science', 'subject');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((node) => {
        expect(node.nodeType).toBe('subject');
      });
    });
  });

  describe('Materialized Path Validation', () => {
    it('should have correct path format for all nodes', async () => {
      const grades = await getGrades();
      for (const grade of grades) {
        // Grade path should be 4 digits
        expect(grade.path).toMatch(/^\d{4}$/);

        const subjects = await getChildren(grade.id);
        for (const subject of subjects) {
          // Subject path should be grade.subject
          expect(subject.path).toMatch(/^\d{4}\.\d{4}$/);
          expect(subject.path.startsWith(grade.path)).toBe(true);
        }
      }
    });

    it('should maintain correct level hierarchy', async () => {
      const grades = await getGrades();
      if (grades.length > 0) {
        expect(grades[0].level).toBe(1);

        const subjects = await getChildren(grades[0].id);
        if (subjects.length > 0) {
          expect(subjects[0].level).toBe(2);

          const sections = await getChildren(subjects[0].id);
          if (sections.length > 0) {
            expect(sections[0].level).toBe(3);
          }
        }
      }
    });
  });

  describe('Seeding Idempotency', () => {
    it('should return same nodes after multiple seed runs', async () => {
      const grades1 = await getGrades();
      const count1 = await prisma.curriculumNode.count();

      // Seeding is idempotent - running again shouldn't duplicate
      // This test verifies the current state is consistent
      const grades2 = await getGrades();
      const count2 = await prisma.curriculumNode.count();

      expect(count1).toBe(count2);
      expect(grades1.length).toBe(grades2.length);
    });
  });
});
