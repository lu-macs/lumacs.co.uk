import type { APIRoute } from 'astro';

const redirects = new Map<string, string>();

redirects.set(
  'vote',
  'https://docs.google.com/forms/d/e/1FAIpQLSdQbtldzvZ76Bp57kv4P38s9TQy1bneilsPVwNx3i1I_40jkg/viewform'
);
redirects.set('insta', 'https://www.instagram.com/lu_macs/');
redirects.set(
  'join',
  'https://lancastersu.co.uk/groups/magic-and-circus-society-lumacs'
);
redirects.set(
  'christmas',
  'https://docs.google.com/forms/d/e/1FAIpQLScw_gNTtdFR3bW9DBAYuNtB_mGT9Uj0XZJfB_7nPEvirkB9wQ/viewform'
);
redirects.set('testing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
redirects.set('lucc', 'https://lumacs.co.uk/lucc/');
redirects.set(
  'merch',
  'https://lancastersu.co.uk/groups/magic-and-circus-society-lumacs/events/lumacs-merch'
);
redirects.set(
  'buymerch',
  'https://lancastersu.co.uk/groups/magic-and-circus-society-lumacs/events/lumacs-merch'
);
redirects.set(
  'showcase',
  'https://docs.google.com/forms/d/e/1FAIpQLSddqNdPALZdCaRTmKoQM8Hm47nCLqEm3M4Q20Y3oXgnD4w5iQ/viewform'
);
redirects.set('pwb', 'https://www.pwb.ngo/');
redirects.set(
  'giveitagocase',
  'https://docs.google.com/forms/d/e/1FAIpQLSddqNdPALZdCaRTmKoQM8Hm47nCLqEm3M4Q20Y3oXgnD4w5iQ/viewform'
);
redirects.set('bjc', 'https://docs.google.com/forms/d/e/1FAIpQLSfnPAVL2jyuCkQ-RXz8eVmrZkfya8MOuDbSn5z7JfCfwKlNmQ/viewform');
redirects.set('exec', 'https://docs.google.com/forms/d/e/1FAIpQLSf17YLfbDSxsxQhQc9_EI8sQgclWecD5mR3xmKykH0FMH1dlw/viewform');

export const GET: APIRoute = async ({
  params,
  redirect,
  request,
  clientAddress,
  locals,
}) => {
  const id = params.short?.toLowerCase();

  if (!id || !redirects.has(id)) {
    return redirect(`/qnf/${id}/`, 307);
  }

  locals.runtime.ctx.waitUntil(
    fetch('https://ingest.tokia.dev/api/event', {
      method: 'POST',
      headers: {
        'User-Agent': request.headers.get('User-Agent') ?? '',
        'X-Forwarded-For':
          request.headers.get('X-Forwarded-For') ?? clientAddress,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: 'lumacs.co.uk',
        name: 'Redirect',
        url: request.url,
        referrer: request.headers.get('Referer') ?? '',
        props: {
          from: id,
          to: redirects.get(id)!,
        },
      }),
    })
  );

  console.info({
    method: 'POST',
    headers: {
      'User-Agent': request.headers.get('User-Agent') ?? '',
      'X-Forwarded-For':
        request.headers.get('X-Forwarded-For') ?? clientAddress,
      'X-Real-IP': request.headers.get('X-Forwarded-For') ?? clientAddress,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      domain: 'lumacs.co.uk',
      name: 'Redirect',
      url: request.url,
      referrer: request.headers.get('Referer') ?? '',
      props: {
        from: id,
        to: redirects.get(id)!,
      },
    }),
  });

  return redirect(redirects.get(id)!, 307);
};

export const prerender = false;
