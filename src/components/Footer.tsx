import React from "react";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => (
  <footer className="hidden md:block fixed left-0 right-0 bottom-0 z-50 bg-gray-900 text-white shadow-[0_-2px_16px_0_rgba(0,0,0,0.12)] w-full" style={{ height: '8%' }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4" style={{ height: '100%' }}>
      {/* Navigation */}
      <nav className="flex gap-8 text-sm font-medium">
        <a href="#home" className="hover:text-teal-400 transition-colors duration-200">Home</a>
        <a href="#about" className="hover:text-teal-400 transition-colors duration-200">About</a>
        <a href="#services" className="hover:text-teal-400 transition-colors duration-200">Services</a>
        <a href="#blog" className="hover:text-teal-400 transition-colors duration-200">Blog</a>
        <a href="#contact" className="hover:text-teal-400 transition-colors duration-200">Contact</a>
      </nav>
      {/* Social Icons */}
      <div className="flex gap-5">
        <a href="https://www.instagram.com/p_a_v_a_n.04/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-full bg-gray-800 hover:bg-teal-500 transition-colors duration-200 shadow-md">
          <FaInstagram size={20} />
        </a>
        <a href="https://www.linkedin.com/in/pavan-kolipakula/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-full bg-gray-800 hover:bg-teal-500 transition-colors duration-200 shadow-md">
          <FaLinkedin size={20} />
        </a>
        <a href="https://github.com/pavan3001" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-full bg-gray-800 hover:bg-teal-500 transition-colors duration-200 shadow-md">
          <FaGithub size={20} />
        </a>
      </div>
      {/* Copyright */}
      <span className="text-xs text-gray-400 ml-8">&copy; 2025 <span className="font-semibold text-teal-400">Pavan Kumar Kolipakula</span>. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
