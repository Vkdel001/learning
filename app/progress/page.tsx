'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/utils/api-client';
import { getSessionToken } from '@/lib/utils/auth-client';
import Header from '@/components/Header';
import { ProgressSkeleton } from '@/components/LoadingSkeleton';
import { ErrorBoundary, ErrorDisplay } from '@/components/ErrorBoundary';

interface ProgressStats {
  totalLessonsCompleted: number;
  totalQuizzesAttempted: number;
  averageQuizScore: number;
  recentActivity: Array<{
    type: 'lesson' | 'quiz';
    name: string;
    completedAt: string;
    score?: number;
  }>;
}

export default function ProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = getSessionToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const res = await authenticatedFetch('/api/progress/stats');
      const data = await res.json();
      
      console.log('Progress stats response:', data);
      
      if (data.success) {
        setStats(data.data);
        setError('');
      } else if (res.status === 401) {
        console.error('Unauthorized - redirecting to login');
        router.push('/auth/login');
      } else {
        console.error('Failed to load stats:', data.error);
        setError(data.error || 'Failed to load progress stats');
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'Failed to load progress stats');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Progress</h1>

        {loading && <ProgressSkeleton />}

        {error && <ErrorDisplay error={error} onRetry={loadStats} />}

        {!loading && !error && stats && (
          <div className="space-y-6">
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-yellow-800">Debug Info:</p>
                <p className="text-yellow-700">Lessons: {stats.totalLessonsCompleted}</p>
                <p className="text-yellow-700">Quizzes: {stats.totalQuizzesAttempted}</p>
                <p className="text-yellow-700">Avg Score: {stats.averageQuizScore.toFixed(1)}%</p>
                <p className="text-yellow-700">Activities: {stats.recentActivity.length}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {stats.totalLessonsCompleted}
                    </p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quizzes Taken</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.totalQuizzesAttempted}
                    </p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.averageQuizScore.toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>

              {stats.recentActivity.length === 0 && (
                <p className="text-gray-600 text-center py-8">
                  No activity yet. Start learning to see your progress here!
                </p>
              )}

              {stats.recentActivity.length > 0 && (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {activity.type === 'lesson' ? '📖' : '🎯'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {activity.type === 'lesson' ? 'Lesson completed' : 'Quiz taken'}
                            {activity.score !== undefined && (
                              <span className="ml-2 text-indigo-600 font-semibold">
                                Score: {activity.score.toFixed(0)}%
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(activity.completedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Keep Going! 💪</h3>
              <p className="text-indigo-100">
                {stats.totalLessonsCompleted === 0 && stats.totalQuizzesAttempted === 0
                  ? 'Start your learning journey today!'
                  : stats.averageQuizScore >= 80
                  ? "You're doing amazing! Keep up the excellent work!"
                  : stats.averageQuizScore >= 60
                  ? "Great progress! Keep practicing to improve your scores."
                  : "Every expert was once a beginner. Keep learning and you'll get there!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
