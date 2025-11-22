export default function Footer() {
  return (
   <footer className="bg-[#fafafa] border-t border-gray-200 mt-10">
  <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} <span className="text-indigo-600 font-medium">TinyLink</span>.
      </div>
    </footer>
  );
}
