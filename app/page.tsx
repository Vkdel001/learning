export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          AI Tutor Mauritius 🇲🇺
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Free AI-powered tutoring for secondary school students
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-gray-700">
            We're building an AI tutor to help students in Mauritius who cannot afford private tuition.
          </p>
          <p className="text-gray-700 mt-2">
            Features: AI-generated lessons, voice narration, quizzes, and progress tracking.
          </p>
        </div>
      </div>
    </main>
  );
}
