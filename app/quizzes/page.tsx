'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CurriculumNode {
  id: string;
  name: string;
  nodeType: string;
  level: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  topicName: string;
  breadcrumbs: string[];
  difficulty: string;
  questions: QuizQuestion[];
}

export default function QuizzesPage() {
  const [grades, setGrades] = useState<CurriculumNode[]>([]);
  const [children, setChildren] = useState<CurriculumNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CurriculumNode[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Quiz taking state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

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
    setQuiz(null);
    setError('');
    resetQuiz();
    
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

  const generateQuiz = async () => {
    if (!selectedNode || selectedNode.nodeType !== 'topic') {
      setError('Please select a topic to generate a quiz');
      return;
    }

    setLoading(true);
    setError('');
    setQuiz(null);
    resetQuiz();

    try {
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topicId: selectedNode.id,
          difficulty 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setQuiz(data.data);
        setSelectedAnswers(new Array(data.data.questions.length).fill(-1));
      } else {
        setError(data.error || 'Failed to generate quiz');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    setCurrentQuestion(0);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getNodeTypeLabel = (nodeType: string) => {
    const labels: Record<string, string> = {
      grade: 'Subjects',
      subject: 'Sections',
      section: 'Topics',
    };
    return labels[nodeType] || 'Items';
  };

  const currentQ = quiz?.questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== -1;
  const allAnswered = selectedAnswers.every(a => a !== -1);

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
              <Link href="/lessons" className="text-gray-700 hover:text-indigo-600">
                Lessons
              </Link>
              <Link href="/quizzes" className="text-gray-700 hover:text-indigo-600 font-medium">
                Quizzes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="mb-6 flex items-center text-sm text-gray-600">
            <Link href="/quizzes" className="hover:text-indigo-600">
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
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Browse Topics
              </h2>

              {selectedNode && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
                >
                  ← Back
                </button>
              )}

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

              {selectedNode?.nodeType === 'topic' && !quiz && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  
                  <button
                    onClick={generateQuiz}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {loading ? 'Generating...' : '🎯 Generate Quiz'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {!quiz && !error && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Topic for Quiz
                  </h3>
                  <p className="text-gray-600">
                    Browse topics and generate a quiz to test your knowledge
                  </p>
                </div>
              )}

              {quiz && !showResults && currentQ && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {quiz.topicName} Quiz
                    </h1>
                    <span className="text-sm text-gray-500">
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </span>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                    <p className="text-lg font-medium text-gray-900">
                      {currentQ.question}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentQ.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedAnswers[currentQuestion] === idx
                            ? 'border-indigo-600 bg-indigo-50 text-gray-900'
                            : 'border-gray-200 hover:border-indigo-300 bg-white text-gray-900'
                        }`}
                      >
                        <span className="font-medium mr-2 text-gray-900">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="text-gray-900">{option}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {currentQuestion < quiz.questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        disabled={!isAnswered}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quiz && showResults && (
                <div className="space-y-6">
                  <div className="text-center py-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Quiz Complete!
                    </h2>
                    <p className="text-5xl font-bold text-indigo-600 my-4">
                      {calculateScore()} / {quiz.questions.length}
                    </p>
                    <p className="text-gray-600">
                      {calculateScore() === quiz.questions.length
                        ? 'Perfect score! 🎉'
                        : calculateScore() >= quiz.questions.length * 0.7
                        ? 'Great job! 👏'
                        : 'Keep practicing! 💪'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {quiz.questions.map((q, idx) => {
                      const userAnswer = selectedAnswers[idx];
                      const isCorrect = userAnswer === q.correctAnswer;
                      
                      return (
                        <div
                          key={idx}
                          className={`p-6 rounded-lg border-2 ${
                            isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="font-semibold text-gray-900">
                              {idx + 1}. {q.question}
                            </p>
                            <span className="text-2xl">
                              {isCorrect ? '✅' : '❌'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {q.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-3 rounded ${
                                  optIdx === q.correctAnswer
                                    ? 'bg-green-200 font-medium text-gray-900'
                                    : optIdx === userAnswer && !isCorrect
                                    ? 'bg-red-200 text-gray-900'
                                    : 'bg-white text-gray-900'
                                }`}
                              >
                                <span className="mr-2 font-semibold text-gray-900">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className="text-gray-900">{option}</span>
                                {optIdx === q.correctAnswer && <span className="ml-2 text-green-700 font-bold">✓</span>}
                                {optIdx === userAnswer && !isCorrect && <span className="ml-2 text-red-700 font-bold">✗</span>}
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200">
                            <strong className="text-gray-900">Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setQuiz(null);
                      resetQuiz();
                    }}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    Take Another Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}