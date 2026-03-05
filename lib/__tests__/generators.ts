import * as fc from 'fast-check';

/**
 * Test data generators for property-based testing
 * These generators create random but valid test data
 */

// User generators
export const userEmailArbitrary = fc.emailAddress();

export const userNameArbitrary = fc.string({ minLength: 2, maxLength: 100 });

export const gradeArbitrary = fc.integer({ min: 7, max: 13 });

export const userRegistrationArbitrary = fc.record({
  name: userNameArbitrary,
  email: userEmailArbitrary,
  grade: gradeArbitrary,
});

// Password generators (for testing validation)
export const weakPasswordArbitrary = fc.string({ maxLength: 7 });

export const strongPasswordArbitrary = fc.string({ minLength: 8, maxLength: 100 });

// OTP generators
export const otpArbitrary = fc.integer({ min: 100000, max: 999999 }).map(String);

// UUID generator
export const uuidArbitrary = fc.uuid();

// Curriculum node generators
export const nodeTypeArbitrary = fc.constantFrom(
  'grade',
  'subject',
  'section',
  'topic',
  'subtopic'
);

export const materializedPathArbitrary = fc
  .array(fc.integer({ min: 1, max: 9999 }), { minLength: 1, maxLength: 5 })
  .map((parts) => parts.map((n) => n.toString().padStart(4, '0')).join('.'));

export const curriculumNodeArbitrary = fc.record({
  id: uuidArbitrary,
  name: fc.string({ minLength: 3, maxLength: 100 }),
  path: materializedPathArbitrary,
  level: fc.integer({ min: 1, max: 5 }),
  nodeType: nodeTypeArbitrary,
});

// Content hash generator (using hexadecimal string)
export const contentHashArbitrary = fc
  .array(
    fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
    { minLength: 64, maxLength: 64 }
  )
  .map((arr) => arr.join(''));

// Text hash generator
export const textHashArbitrary = fc
  .array(
    fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
    { minLength: 64, maxLength: 64 }
  )
  .map((arr) => arr.join(''));

// Session token generator
export const sessionTokenArbitrary = fc
  .array(
    fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'),
    { minLength: 64, maxLength: 64 }
  )
  .map((arr) => arr.join(''));
export const lessonArbitrary = fc.record({
  id: uuidArbitrary,
  subtopicId: uuidArbitrary,
  contentHash: contentHashArbitrary,
  explanation: fc.lorem({ maxCount: 3 }),
  examples: fc.array(fc.lorem({ maxCount: 1 }), { minLength: 1, maxLength: 3 }),
  keyPoints: fc.array(fc.string({ minLength: 10, maxLength: 100 }), {
    minLength: 3,
    maxLength: 7,
  }),
  practiceQuestions: fc.array(
    fc.record({
      question: fc.string({ minLength: 10, maxLength: 200 }),
      answer: fc.string({ minLength: 10, maxLength: 500 }),
    }),
    { minLength: 3, maxLength: 5 }
  ),
  promptVersion: fc.integer({ min: 1, max: 100 }),
  aiProvider: fc.constantFrom('gemini', 'openai', 'claude'),
});

// Quiz generators
export const mcqQuestionArbitrary = fc.record({
  question: fc.string({ minLength: 10, maxLength: 200 }),
  options: fc.array(fc.string({ minLength: 5, maxLength: 100 }), {
    minLength: 4,
    maxLength: 4,
  }),
  correctIndex: fc.integer({ min: 0, max: 3 }),
});

export const quizArbitrary = fc.record({
  id: uuidArbitrary,
  topicId: uuidArbitrary,
  contentHash: contentHashArbitrary,
  questions: fc.array(mcqQuestionArbitrary, { minLength: 5, maxLength: 10 }),
  promptVersion: fc.integer({ min: 1, max: 100 }),
  aiProvider: fc.constantFrom('gemini', 'openai', 'claude'),
});

// Session generators
export const sessionArbitrary = fc.record({
  sessionId: uuidArbitrary,
  userId: uuidArbitrary,
  token: sessionTokenArbitrary,
  expiresAt: fc.date({ min: new Date(), max: new Date(Date.now() + 86400000) }),
});

// Date generators
export const pastDateArbitrary = fc.date({ max: new Date() });

export const futureDateArbitrary = fc.date({ min: new Date() });

// Score generators
export const scoreArbitrary = fc.integer({ min: 0, max: 100 });

// Time spent generator (in seconds)
export const timeSpentArbitrary = fc.integer({ min: 10, max: 3600 });

// Audio segment generators
export const audioSegmentArbitrary = fc.record({
  id: uuidArbitrary,
  textHash: textHashArbitrary,
  text: fc.lorem({ maxCount: 2 }),
  audioUrl: fc.webUrl(),
  duration: fc.integer({ min: 1, max: 300 }),
  provider: fc.constantFrom('elevenlabs', 'google-tts', 'azure-tts'),
  usageCount: fc.integer({ min: 0, max: 1000 }),
});

// Helper function to generate test data
export function generateTestData<T>(arbitrary: fc.Arbitrary<T>, count: number = 1): T[] {
  return fc.sample(arbitrary, count);
}

// Helper function for property tests with custom config
export const propertyTestConfig = {
  numRuns: 100, // Run each property test 100 times
  verbose: false,
};
