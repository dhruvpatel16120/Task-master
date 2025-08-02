export default function Footer() {
  return (
    <footer className="mt-auto text-center text-sm text-gray-500 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs sm:text-sm">
          © {new Date().getFullYear()} Task Master • Built with ❤️ by Dhruv Patel
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Stay organized, stay productive
        </p>
      </div>
    </footer>
  );
}
