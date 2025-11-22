import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 shadow rounded-xl text-center">
        <img src="/404NotFound.png" alt="Not Found Illustration" className="h-70 mx-auto  mb-6 items-center"></img>
      <h1 className="text-3xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500 mt-2">This page doesn’t exist.</p>

      <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 mt-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
