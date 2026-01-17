import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, setDarkMode }) => {
  return (
    <label className="ui-switch">
      <input 
        type="checkbox" 
        checked={darkMode} 
        onChange={() => setDarkMode(prev => !prev)} 
      />
      <div className="slider">
        <div className="circle"></div>
      </div>
    </label>
  );
};

export default ThemeToggle;
