import { useState, useEffect } from 'react';

const CountUp = ({ end, duration = 1500 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease-out expo function for a smoother animation
      const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      
      setCount(Math.floor(easeOutExpo(percentage) * end));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure it ends exactly on the target value
      }
    };

    const raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
};

export default CountUp;
