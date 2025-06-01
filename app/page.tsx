export default function Home() {
  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col bg-black text-white">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Willkommen bei NextBank
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-xl">
          Ihre digitale Bank für modernes Banking – sicher, schnell und überall
          erreichbar.
        </p>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} NextBank – Ihre Online-Bank
      </footer>
    </div>
  );
}
