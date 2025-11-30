import React from 'react';
import { Sparkles, Github, Twitter, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 relative z-10">
      {/* Glassmorphism Container */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Logo & Description */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3 group cursor-default">
                <Sparkles className="w-5 h-5 text-brand-primary group-hover:animate-spin" />
                <span className="text-xl font-black bg-gradient-to-r from-brand-primary to-pink-500 bg-clip-text text-transparent">
                  WONDER LAB
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Discover trending products and insights with our advanced analytics platform.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-primary hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <p>&copy; {new Date().getFullYear()} Wonder Lab. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 animate-pulse" />
              <span>for creators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
