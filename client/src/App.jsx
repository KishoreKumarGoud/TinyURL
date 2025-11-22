import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import HealthPage from "./pages/HealthPage";
import Layout from "./components/Layout";
import "./index.css";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/code/:code" element={<Stats />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </Layout>
  );
}
