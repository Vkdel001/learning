'use client';

import { useState, useEffect } from 'react';

interface CurriculumNode {
  id: string;
  name: string;
  nodeType: string;
  level: number;
}

interface Lesson {
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

export default function TestPage() {
  const [grades, setGrades] = useState<CurriculumNode[]>([]);
  const [children, setChildren] = useState<CurriculumNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CurriculumNode[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load grades on mount
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Tutor Test Page
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curriculum Browser */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Curriculum</h2>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                {breadcrumbs.map((node, idx) => (
                  <span key={node.id}>
                    {idx > 0 && ' > '}
                    {node.name}
                  </span>
                ))}
              </div>
            )}

            {/* Grades */}
            {!selectedNode && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Grades</h3>
                {grades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => handleNodeClick(grade)}
                    className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    {grade.name}
                  </button>
                ))}
              </div>
            )}

            {/* Children */}
            {selectedNode && children.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    setChildren([]);
                    setBreadcrumbs([]);
                    loadGrades();
                  }}
                  className="text-blue-600 hover:text-blue-800 mb-2"
                >
                  ← Back
                </button>
                <h3 className="font-medium text-gray-700">
                  {selectedNode.nodeType === 'grade' && 'Subjects'}
                  {selectedNode.nodeType === 'subject' && 'Sections'}
                  {selectedNode.nodeType === 'section' && 'Topics'}
                  {selectedNode.nodeType === 'topic' && 'Subtopics'}
                </h3>
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleNodeClick(child)}
                    className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded"
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}

            {/* Generate Lesson Button */}
            {selectedNode?.nodeType === 'subtopic' && (
              <button
                onClick={generateLesson}
                disabled={loading}
                className="w-full mt-4 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : '🤖 Generate Lesson'}
              </button>
            )}
          </div>

          {/* Lesson Display */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Lesson Content</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!lesson && !error && (
              <p className="text-gray-500">
                Select a subtopic and click "Generate Lesson" to see AI-generated content
              </p>
            )}

            {lesson && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {lesson.subtopicName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {lesson.breadcrumbs.join(' > ')}
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Explanation
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {lesson.explanation}
                  </p>
                </div>

                {/* Examples */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Examples
                  </h4>
                  <div className="space-y-3">
                    {lesson.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 border-l-4 border-blue-500 p-4"
                      >
                        <p className="text-gray-700 whitespace-pre-line">
                          {example}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Key Points
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    {lesson.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-gray-700">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practice Questions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Practice Questions
                  </h4>
                  <div className="space-y-4">
                    {lesson.practiceQuestions.map((q, idx) => (
                      <div key={idx} className="border-l-4 border-green-500 pl-4">
                        <p className="font-medium text-gray-800 mb-2">
                          Q{idx + 1}: {q.question}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Answer:</span> {q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
