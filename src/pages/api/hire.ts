import { HireFormSchema } from '@/components/HireForm';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const webhook = 'REPLACE_WITH_WEBHOOK';

  if (webhook.length < 1) {
    return new Response('Webhook not set', { status: 500 });
  }

  const data = HireFormSchema.parse({
    ...body,
    date: new Date(body.date),
  });

  console.log(data, webhook);

  try {
    await fetch(`https://discord.com/api/webhooks/${webhook}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: 'New Event',
            url: 'https://lumacs.co.uk/hire/',
            fields: [
              {
                name: 'Name of Primary Contact',
                value: data.name,
              },
              {
                name: 'Company / Organisation',
                value: data.company,
              },
              {
                name: 'Preferred Method of Contact',
                value: data.preferredContactMethod,
              },
              {
                name: 'Media Handle / Email',
                value: data.username,
              },
              {
                name: 'Location',
                value: data.location,
              },
              {
                name: 'Brief Description of Event',
                value: data.briefDescriptionOfEvent,
              },
              {
                name: 'Date of Event',
                value: data.date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
              },
              {
                name: 'Number of circus/magic performers',
                value: data.numNormalPerformers,
              },
              {
                name: 'Amount of time for circus/magic performers',
                value: data.amountOfTimeForNormalPerformers,
              },
              {
                name: 'Number of fire performers',
                value: data.numFirePerformers,
              },
              {
                name: 'Amount of time for fire performers',
                value: data.amountOfTimeForFirePerformers,
              },
              {
                name: 'Number of aerial performers',
                value: data.numAerialPerformers,
              },
              {
                name: 'Amount of time for aerial performers',
                value: data.amountOfTimeForAerialPerformers,
              },
              {
                name: 'Price Estimate',
                value: `£${
                  25 +
                  data.numNormalPerformers *
                    data.amountOfTimeForNormalPerformers *
                    25 +
                  data.numFirePerformers *
                    data.amountOfTimeForFirePerformers *
                    35 +
                  data.numAerialPerformers *
                    data.amountOfTimeForAerialPerformers *
                    25
                }`,
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error(error);
    return new Response(
      'There was an error submitting your form. Please try again later.',
      {
        status: 500,
      }
    );
  }

  return new Response('ok', {
    status: 200,
  });
};

export const prerender = false;
