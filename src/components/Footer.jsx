// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-yellow-500 text-white py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Brand */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-bold">🎼 GuruNada</h2>
          <p className="text-sm">Belajar piano dari nol hingga mahir</p>
        </div>

        {/* Menu */}
        <div className="flex space-x-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <Link to="/questionnaire" className="hover:underline">
            Kuisioner
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-4 md:mt-0 text-sm text-center md:text-right">
          © {new Date().getFullYear()} GuruNada. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
