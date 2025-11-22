import Header from "../pages/Header";
import Footer from "../pages/Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f5ff]

 flex flex-col">
      <Header />

      {/* Center the content just like the Header */}
      <main className="flex-grow w-full">
        <div className="max-w-5xl mx-auto w-full px-4 py-6">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
