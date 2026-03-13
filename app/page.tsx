export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-6xl font-bold tracking-tighter mb-6">ChainTogether</h1>
        <p className="text-2xl text-gray-600 mb-10">
          Build better habits with your friends. Real accountability, real streaks.
        </p>
        <a
          href="/auth/signin"
          className="bg-black text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition"
        >
          Get Started Free
        </a>
      </div>
    </div>
  );
}