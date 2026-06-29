import { useEffect, useState } from 'react';

type Departure = {
  line: string;
  destination: string;
  times: string[];
};

type BusDeparturesResponse = Departure[];

const REFRESH_INTERVAL = 60_000;

const normalizeTime = (time: string) => time.split('~').pop() ?? time;

const renderTimeLabel = (time: string) => {
  const parts = time.split('~');

  if (parts.length > 1) {
    const originalTime = parts[0];
    const updatedTime = parts[parts.length - 1];

    return (
      <>
        <span className="line-through text-white/45">{originalTime}</span>
        <span>{updatedTime}</span>
      </>
    );
  }

  return normalizeTime(time);
};

export default function BusDepartures() {
  const [departures, setDepartures] = useState<BusDeparturesResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDepartures = async () => {
      try {
        setError(null);
        const response = await fetch('/api/bus-departures', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as BusDeparturesResponse;

        if (!isMounted) {
          return;
        }

        setDepartures(payload);
        setLastUpdated(new Date());
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : 'Failed to load bus departures',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDepartures();

    const interval = window.setInterval(() => {
      void loadDepartures();
    }, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden p-3">
        <div className="mb-3 flex items-center justify-end gap-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
          <span>
            {isLoading && departures.length === 0
              ? 'Loading departures'
              : lastUpdated
                ? lastUpdated.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Waiting'}
          </span>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {departures.map((departure) => (
              <article
                key={`${departure.line}-${departure.destination}`}
                className="rounded-xl border border-white/10 bg-white/5 p-1 shadow-lg shadow-black/10"
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 rounded-lg bg-amber-300/15 px-2 py-1 text-lg font-black leading-none text-amber-300">
                    {departure.line}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-white/85">
                      {departure.destination}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {departure.times.map((time) => (
                        <span
                          key={`${departure.line}-${departure.destination}-${time}`}
                          className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[11px] font-medium text-white/90"
                        >
                          {renderTimeLabel(time)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {!isLoading && departures.length === 0 && (
              <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                No bus departures are currently available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
