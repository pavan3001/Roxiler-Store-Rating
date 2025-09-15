import React from "react";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => (
  <footer className="hidden md:flex fixed left-0 right-0 bottom-0 z-50 bg-gray-900 text-white shadow-[0_-2px_16px_0_rgba(0,0,0,0.12)] w-full items-center justify-center" style={{ height: '40px' }}>
  <div className="max-w-7xl w-full flex flex-row items-center justify-between px-8" style={{ height: '100%' }}>
     
  <div className="flex gap-3 items-center">
        <a href="https://www.instagram.com/p_a_v_a_n.04/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-1 rounded-full bg-gray-800 hover:bg-teal-500 transition-colors duration-200 shadow-md">
          <FaInstagram size={16} />
        </a>
        <a href="https://www.linkedin.com/in/pavan-kolipakula/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-1 rounded-full bg-gray-800 hover:bg-teal-500 transition-colors duration-200 shadow-md">
          <FaLinkedin size={16} />
        </a>
        <a href="https://github.com/pavan3001" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-1 rounded-full bg-gray-800 hover:bg-teal-500 transition-colors duration-200 shadow-md">
          <FaGithub size={16} />
        </a>
      </div>
  {/* Copyright */}
  <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">&copy; 2025 <span className="font-semibold text-teal-400">Pavan Kumar Kolipakula</span>. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
