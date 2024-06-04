import { useState } from 'react';
import { Button } from './ui/button';

export const ExcludeAnalytics = () => {
  const [excluding, setExcluding] = useState(
    window.localStorage.getItem('plausible_ignore') === 'true'
  );

  const toggleExcluding = () => {
    if (excluding) {
      window.localStorage.removeItem('plausible_ignore');
    } else {
      window.localStorage.setItem('plausible_ignore', 'true');
    }
    setExcluding((excluding) => !excluding);
  };

  return (
    <>
      <p className="text-center max-w-2xl mb-2">
        You currently{' '}
        <span
          className={`font-bold ${
            excluding ? 'text-destructive' : 'text-primary'
          }`}
        >
          {excluding ? 'are' : 'are not'}
        </span>{' '}
        excluding your visits.
      </p>
      <Button
        variant={excluding ? 'default' : 'destructive'}
        onClick={toggleExcluding}
      >
        {excluding ? 'Include' : 'Exclude'} Visits
      </Button>
    </>
  );
};
