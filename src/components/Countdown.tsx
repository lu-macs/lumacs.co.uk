import { useEffect, useState } from "react";

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
  const millisecondsPerSecond = 1000;
  const millisecondsPerMinute = millisecondsPerSecond * 60;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;
  const millisecondsPerYear = millisecondsPerDay * 365.25;
  const millisecondsPerMonth = millisecondsPerYear / 12;

  const years = Math.floor(countDown / millisecondsPerYear);
  const months = Math.floor(
    (countDown % millisecondsPerYear) / millisecondsPerMonth
  );
  const days = Math.floor(
    (countDown % millisecondsPerMonth) / millisecondsPerDay
  );
  const hours = Math.floor(
    (countDown % millisecondsPerDay) / millisecondsPerHour
  );
  const minutes = Math.floor(
    (countDown % millisecondsPerHour) / millisecondsPerMinute
  );
  const seconds = Math.floor(
    (countDown % millisecondsPerMinute) / millisecondsPerSecond
  );

  const finished = countDown < 0;

  return [years, months, days, hours, minutes, seconds, finished] as const;
};

const NumberDisplay = ({
  number,
  length,
  name,
}: {
  number: number;
  length?: number;
  name: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="font-mono" suppressHydrationWarning>
        {length ? number.toString().padStart(length, '0') : number}
      </span>
      <span
        className="text-xl"
        suppressHydrationWarning
      >
        {name}
        {number === 1 ? '' : 's'}
      </span>
    </div>
  );
};

export const CountdownToDate = ({
  date,
  message,
}: {
  date: Date;
  message: string | null;
}) => {
  const [years, months, days, hours, minutes, seconds, finished] =
    useCountdown(date);

  const countdown = finished ? (
    <div className="flex flex-col items-center justify-center gap-2 text-center text-7xl">
      {message ?? 'Timer has completed!'}
    </div>
  ) : (
    <div
      suppressHydrationWarning
      className="flex flex-row flex-wrap items-center justify-center gap-4 text-6xl font-bold"
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
      {years > 0 && <NumberDisplay number={years} name="year" />}
      {(months > 0 || years > 0) && (
        <NumberDisplay number={months} length={2} name="month" />
      )}
      {(days > 0 || months > 0 || years > 0) && (
        <NumberDisplay number={days} length={2} name="day" />
      )}
      {(hours > 0 || days > 0 || months > 0 || years > 0) && (
        <NumberDisplay number={hours} length={2} name="hour" />
      )}
      {(minutes > 0 || hours > 0 || days > 0 || months > 0 || years > 0) && (
        <NumberDisplay number={minutes} length={2} name="minute" />
      )}
      {(seconds >= 0 ||
        minutes > 0 ||
        hours > 0 ||
        days > 0 ||
        months > 0 ||
        years > 0) && (
        <NumberDisplay number={seconds} length={2} name="second" />
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      {countdown}
    </div>
  );
};
