import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-[#7C3AED] focus:text-white focus:rounded-lg">
      Skip to main content
    </a>
  );
};
