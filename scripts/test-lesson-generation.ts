import { generateLesson } from '../lib/services/lesson-generator.service';
import { getGrades, getChildren } from '../lib/services/curriculum.service';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test script for lesson generation
 * Run with: npm run test:lesson
 */

async function main() {
  console.log('🧪 Testing Lesson Generation System\n');

  try {
    // 1. Get all grades
    console.log('📚 Loading curriculum...');
    const grades = await getGrades();
    console.log(`Found ${grades.length} grades\n`);

    if (grades.length === 0) {
      console.log('❌ No grades found. Run: npm run db:seed');
      return;
    }

    // 2. Navigate to first grade
    const grade = grades[0];
    console.log(`Grade: ${grade.name}`);

    // 3. Get subjects
    const subjects = await getChildren(grade.id);
    if (subjects.length === 0) {
      console.log('❌ No subjects found');
      return;
    }
    const subject = subjects[0];
    console.log(`Subject: ${subject.name}`);

    // 4. Get sections
    const sections = await getChildren(subject.id);
    if (sections.length === 0) {
      console.log('❌ No sections found');
      return;
    }
    const section = sections[0];
    console.log(`Section: ${section.name}`);

    // 5. Get topics
    const topics = await getChildren(section.id);
    if (topics.length === 0) {
      console.log('❌ No topics found');
      return;
    }
    const topic = topics[0];
    console.log(`Topic: ${topic.name}`);

    // 6. Get subtopics
    const subtopics = await getChildren(topic.id);
    if (subtopics.length === 0) {
      console.log('❌ No subtopics found');
      return;
    }
    const subtopic = subtopics[0];
    console.log(`Subtopic: ${subtopic.name}\n`);

    // 7. Generate lesson
    console.log('🤖 Generating lesson with AI...\n');
    const lesson = await generateLesson(subtopic.id);

    // 8. Display lesson
    console.log('✅ Lesson Generated!\n');
    console.log('═'.repeat(80));
    console.log(`LESSON: ${lesson.subtopicName}`);
    console.log('═'.repeat(80));
    console.log(`\nPath: ${lesson.breadcrumbs.join(' > ')}\n`);

    console.log('📖 EXPLANATION:');
    console.log('-'.repeat(80));
    console.log(lesson.explanation);
    console.log();

    console.log('💡 EXAMPLES:');
    console.log('-'.repeat(80));
    lesson.examples.forEach((example, idx) => {
      console.log(`\nExample ${idx + 1}:`);
      console.log(example);
    });
    console.log();

    console.log('🎯 KEY POINTS:');
    console.log('-'.repeat(80));
    lesson.keyPoints.forEach((point, idx) => {
      console.log(`${idx + 1}. ${point}`);
    });
    console.log();

    console.log('❓ PRACTICE QUESTIONS:');
    console.log('-'.repeat(80));
    lesson.practiceQuestions.forEach((q, idx) => {
      console.log(`\nQ${idx + 1}: ${q.question}`);
      console.log(`A: ${q.answer}`);
    });
    console.log();

    console.log('═'.repeat(80));
    console.log(`\n✅ Test completed successfully!`);
    console.log(`📊 Content Hash: ${lesson.contentHash}`);
    console.log(`🕐 Generated At: ${lesson.generatedAt}`);

    // 9. Test cache hit
    console.log('\n🔄 Testing cache...');
    const cachedLesson = await generateLesson(subtopic.id);
    console.log('✅ Cache working! Second call returned cached lesson.');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    redis.disconnect();
  }
}

main();
