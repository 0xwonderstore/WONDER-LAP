import React from 'react';
import { Archive } from 'lucide-react';
import './ArchiveButton.css';

interface ArchiveButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label: string;
}

const ArchiveButton: React.FC<ArchiveButtonProps> = ({ onClick, label }) => {
  return (
    <button className="archive-button" onClick={onClick}>
      <div className="archive-button-wrapper">
        <div className="archive-text">{label}</div>
        <span className="archive-icon">
          <Archive size={16} />
        </span>
      </div>
    </button>
  );
};

export default ArchiveButton;
