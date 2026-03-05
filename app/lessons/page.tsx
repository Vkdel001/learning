'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/utils/api-client';
import AudioPlayer from '@/components/AudioPlayer';

interface CurriculumNode {
  id: string;
  name: string;
  nodeType: string;
  level: number;
}

interface Lesson {
  lessonId?: string;
  subtopicName: string;
  breadcrumbs: string[];
  explanation: string;
  examples: string[];
  keyPoints: string[];
  practiceQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

export default function LessonsPage() {
  const [grades, setGrades] = useState<CurriculumNode[]>([]);
  const [children, setChildren] = useState<CurriculumNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CurriculumNode[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const res = await fetch('/api/curriculum/grades');
      const data = await res.json();
      if (data.success) {
        setGrades(data.data);
      }
    } catch (err) {
      console.error('Failed to load grades:', err);
    }
  };

  const loadChildren = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/curriculum/${nodeId}/children`);
      const data = await res.json();
      if (data.success) {
        setChildren(data.data);
      }
    } catch (err) {
      console.error('Failed to load children:', err);
    }
  };

  const loadBreadcrumbs = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/curriculum/${nodeId}/breadcrumbs`);
      const data = await res.json();
      if (data.success) {
        setBreadcrumbs(data.data);
      }
    } catch (err) {
      console.error('Failed to load breadcrumbs:', err);
    }
  };

  const handleNodeClick = async (node: CurriculumNode) => {
    setSelectedNode(node);
    setLesson(null);
    setError('');
    
    await loadChildren(node.id);
    await loadBreadcrumbs(node.id);
  };

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      handleNodeClick(parent);
    } else {
      setSelectedNode(null);
      setChildren([]);
      setBreadcrumbs([]);
      loadGrades();
    }
  };

  const generateLesson = async () => {
    if (!selectedNode || selectedNode.nodeType !== 'subtopic') {
      setError('Please select a subtopic to generate a lesson');
      return;
    }

    setLoading(true);
    setError('');
    setLesson(null);

    try {
      const res = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtopicId: selectedNode.id }),
      });

      const data = await res.json();

      if (data.success) {
        setLesson(data.data);
      } else {
        setError(data.error || 'Failed to generate lesson');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate lesson');
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async () => {
    if (!lesson || !lesson.lessonId) {
      alert('Cannot mark lesson complete: Lesson ID missing');
      return;
    }

    setMarkingComplete(true);
    try {
      const response = await authenticatedFetch('/api/progress/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.lessonId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Lesson marked as complete! 🎉');
      } else {
        alert('Failed to mark lesson complete: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      alert('Failed to mark lesson complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  const getNodeTypeLabel = (nodeType: string) => {
    const labels: Record<string, string> = {
      grade: 'Subjects',
      subject: 'Sections',
      section: 'Topics',
      topic: 'Subtopics',
    };
    return labels[nodeType] || 'Items';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              AI Tutor 🇲🇺
            </Link>
            <nav className="flex gap-4">
              <Link href="/lessons" className="text-gray-700 hover:text-indigo-600 font-medium">
                Lessons
              </Link>
              <Link href="/quizzes" className="text-gray-700 hover:text-indigo-600">
                Quizzes
              </Link>
              <Link href="/progress" className="text-gray-700 hover:text-indigo-600">
                Progress
              </Link>
              <Link href="/test" className="text-gray-500 hover:text-gray-700">
                Test
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mb-6 flex items-center text-sm text-gray-600">
            <Link href="/lessons" className="hover:text-indigo-600">
              Home
            </Link>
            {breadcrumbs.map((node) => (
              <span key={node.id}>
                <span className="mx-2">›</span>
                <span className="font-medium">{node.name}</span>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Curriculum Browser */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Browse Curriculum
              </h2>

              {/* Back Button */}
              {selectedNode && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
                >
                  ← Back
                </button>
              )}

              {/* Grades List */}
              {!selectedNode && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Select Grade
                  </h3>
                  {grades.map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => handleNodeClick(grade)}
                      className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-gray-900"
                    >
                      {grade.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Children List */}
              {selectedNode && children.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    {getNodeTypeLabel(selectedNode.nodeType)}
                  </h3>
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleNodeClick(child)}
                      className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-medium text-gray-900"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Generate Lesson Button */}
              {selectedNode?.nodeType === 'subtopic' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={generateLesson}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      '🤖 Generate Lesson'
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Powered by Google Gemini AI
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Lesson Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!lesson && !error && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Topic to Learn
                  </h3>
                  <p className="text-gray-600">
                    Browse the curriculum on the left and select a subtopic to generate an AI-powered lesson
                  </p>
                </div>
              )}

              {/* Lesson Content */}
              {lesson && (
                <div className="space-y-8">
                  {/* Title */}
                  <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {lesson.subtopicName}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {lesson.breadcrumbs.join(' › ')}
                    </p>
                  </div>

                  {/* Listen to Full Lesson */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          🎧 Audio Narration
                        </h3>
                        <p className="text-sm text-gray-600">
                          Listen to the explanation being read aloud
                        </p>
                      </div>
                      <AudioPlayer 
                        text={`${lesson.subtopicName}. ${lesson.explanation}`}
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="text-2xl mr-2">📖</span>
                        Explanation
                      </h2>
                      <AudioPlayer text={lesson.explanation} />
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {lesson.explanation}
                    </p>
                  </section>

                  {/* Examples */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">💡</span>
                      Examples
                    </h2>
                    <div className="space-y-4">
                      {lesson.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                        >
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Example {idx + 1}
                          </p>
                          <p className="text-gray-700 whitespace-pre-line">
                            {example}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Key Points */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">🎯</span>
                      Key Points
                    </h2>
                    <ul className="space-y-2">
                      {lesson.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Practice Questions */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">❓</span>
                      Practice Questions
                    </h2>
                    <div className="space-y-6">
                      {lesson.practiceQuestions.map((q, idx) => (
                        <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900 mb-2">
                            Question {idx + 1}: {q.question}
                          </p>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                              Show Answer
                            </summary>
                            <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">
                              {q.answer}
                            </p>
                          </details>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Mark Complete Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={markLessonComplete}
                      disabled={markingComplete}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {markingComplete ? 'Marking Complete...' : '✓ Mark as Complete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
