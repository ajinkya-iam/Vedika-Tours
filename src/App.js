import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Highlights from "./components/Highlights";
import Services from "./components/Services";
import Tours from "./components/Tours";
import Fleet from "./components/Fleet";
import Testimonials from "./components/Testimonials";
import About from "./components/About";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import MobileFloatingCTA from "./components/MobileFloatingCTA";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./components/admin/ProtectedRoute";

// Main Landing Page Component
function LandingPage() {
  return (
    <div className="App">
      <Header />
      <HeroSection />
      <Highlights />
      <Services />
      <Tours />
      <Fleet />
      <Testimonials />
      <About />
      <CTASection />
      <Footer />
      <MobileFloatingCTA />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
