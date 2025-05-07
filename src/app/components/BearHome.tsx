export default function BearHome() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-indigo-300 relative">
        <img
          src="/animated-bear.gif" // You can use a Lottie animation or GIF here
          alt="Cute Bear"
          className="w-48 h-48 animate-bounce"
        />
        <button className="mt-8 px-6 py-3 bg-yellow-400 text-xl font-bold rounded-2xl shadow-lg hover:scale-105 transition">
          Go!
        </button>
      </div>
    );
  }
  