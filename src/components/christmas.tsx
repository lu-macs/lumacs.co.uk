import { useEffect, useState } from 'react';

const useCountdown = (targetDate: Date) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 100);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdown };

export const ChristmasCountdown = () => {
  const [days, hours, minutes, seconds] = useCountdown(new Date(2024, 11, 25));

  if ((days ?? 0) + (hours ?? 0) + (minutes ?? 0) + (seconds ?? 0) <= 0) {
    return (
      <a
        className="gap-4 flex flex-col items-center pt-4 cursor-pointer hover:text-muted-foreground"
        href="https://www.instagram.com/p/DD_1EjluF94/"
      >
        <div className="text-8xl">🎁</div>
        <div className="text-2xl italic underline">
          Click for our Christmas Surprise!
        </div>
      </a>
    );
  }

  return (
    <div
      className="lg:text-8xl md:text-6xl text-4xl font-bold pt-4"
      style={{
        background:
          'linear-gradient(45deg, #e05e6b, #ff9966, #98c379, #66c2a5, #7ea6e0, #b392f0, #e05e6b)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        animation: 'colorChange 3s linear infinite',
      }}
    >
      {days}d {hours}h {minutes}m {seconds}s
    </div>
  );
};
