// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="brand-footer py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-start md:items-center gap-4">
          <Link to="/" className="inline-flex items-center">
            {/* Gunakan wordmark versi terang agar kontras di footer gelap */}
            <img
              src="/brand/gurunada_final_light-03.png"
              alt="GuruNada"
              className="h-8 w-auto select-none"
              draggable={false}
            />
            <span className="sr-only">GuruNada</span>
          </Link>
          <p className="text-sm opacity-80 leading-snug">
            Belajar piano dari nol hingga mahir
          </p>
        </div>

        {/* Menu */}
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="transition hover:opacity-90">
            Home
          </Link>
          <Link to="/about" className="transition hover:opacity-90">
            About
          </Link>
          <Link to="/questionnaire" className="transition hover:opacity-90">
            Kuisioner
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-xs md:text-sm opacity-80 text-center md:text-right flex items-center justify-center md:justify-end gap-2">
          <span>
            © {new Date().getFullYear()} GuruNada. All rights reserved.
          </span>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 bg-[#0F1828]/90">
            <img
              src="/brand/gurunada_final_light-02.png"
              alt="GuruNada logo"
              className="h-5 md:h-6 w-auto select-none"
              draggable={false}
            />
          </span>
        </div>
      </div>
    </footer>
  );
}
