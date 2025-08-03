import React from 'react';

const MetaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2.754a9.246 9.246 0 1 0 0 18.492A9.246 9.246 0 0 0 12 2.754Z" />
      <path d="m9.15 17.06-2.5-4.322a.5.5 0 0 1 .433-.746h10.042a.5.5 0 0 1 .434.746l-2.5 4.322a.5.5 0 0 1-.866 0l-2.03-3.515a.5.5 0 0 0-.866 0l-2.03 3.515a.5.5 0 0 1-.868 0Z" />
    </svg>
  );

export default MetaIcon;
