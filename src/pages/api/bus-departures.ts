export async function GET() {
  try {
    const response = await fetch(
      'https://screen.bailriggfm.co.uk/api/bus-departures',
      {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return new Response('Failed to fetch bus departures', {
        status: response.status,
        headers: {
          'cache-control': 'no-store',
        },
      });
    }

    const body = await response.text();

    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Failed to fetch bus departures',
      {
        status: 500,
        headers: {
          'cache-control': 'no-store',
        },
      },
    );
  }
}
