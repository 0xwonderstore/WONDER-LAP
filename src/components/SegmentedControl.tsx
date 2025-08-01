import React, { useState, useRef, useEffect } from 'react';

interface SegmentedControlProps<T extends string> {
  tabs: { id: T; label: string; icon: React.ReactNode }[];
  activeTab: T;
  onTabChange: (id: T) => void;
}

const SegmentedControl = <T extends string>({ tabs, activeTab, onTabChange }: SegmentedControlProps<T>) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabNode = tabsRef.current[activeTabIndex];
    if (activeTabNode) {
      setIndicatorStyle({
        left: activeTabNode.offsetLeft,
        width: activeTabNode.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="relative bg-light-background dark:bg-dark-background p-1.5 rounded-xl flex items-center">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={el => tabsRef.current[index] = el}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold z-10 transition-colors duration-300 ${activeTab === tab.id ? 'text-white' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
      <div
        className="absolute top-1.5 bottom-1.5 bg-brand-primary rounded-lg shadow-md transition-all duration-300 ease-in-out"
        style={indicatorStyle}
      />
    </div>
  );
};

export default SegmentedControl;
