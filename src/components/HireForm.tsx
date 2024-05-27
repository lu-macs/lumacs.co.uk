import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const HireFormSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  preferredContactMethod: z.enum(['email', 'instagram', 'facebook']),
  username: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  briefDescriptionOfEvent: z.string().min(1).max(1000),
  date: z.date(),
  numNormalPerformers: z.number().min(0).max(20),
  amountOfTimeForNormalPerformers: z.number().min(0).max(10),
  numFirePerformers: z.number().min(0).max(20),
  amountOfTimeForFirePerformers: z.number().min(0).max(10),
  numAerialPerformers: z.number().min(0).max(20),
  amountOfTimeForAerialPerformers: z.number().min(0).max(10),
});

export const HireForm = () => {
  const [showNormalPerformers, setShowNormalPerformers] = useState(false);
  const [showFirePerformers, setShowFirePerformers] = useState(false);
  const [showAerialPerformers, setShowAerialPerformers] = useState(false);

  const form = useForm<z.infer<typeof HireFormSchema>>({
    resolver: zodResolver(HireFormSchema),
    defaultValues: {
      name: '',
      username: '',
      location: '',
      briefDescriptionOfEvent: '',
      date: new Date(),
      numNormalPerformers: 0,
      amountOfTimeForNormalPerformers: 0,
      numFirePerformers: 0,
      amountOfTimeForFirePerformers: 0,
      numAerialPerformers: 0,
      amountOfTimeForAerialPerformers: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof HireFormSchema>) => {
    console.log(data);

    toast.promise(
      fetch('/api/hire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
      {
        loading: 'Submitting your form...',
        success: () => {
          form.reset();
          return 'Thank you for your submission!';
        },
        error:
          'There was an error submitting your form. Please try again later.',
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mx-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of Primary Contact</FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company / Organisation</FormLabel>
              <FormControl>
                <Input placeholder="Magic and Circus Society" {...field} />
              </FormControl>
              <FormDescription>
                Name of the hiring company or organisation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredContactMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Method of Contact</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                We will contact you via this method.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media Handle / Email</FormLabel>
              <FormControl>
                <Input placeholder="hello@lumacs.co.uk" {...field} />
              </FormControl>
              <FormDescription>
                The media handle or email we will contact you via (this should
                match with your preferred contact method).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Lancaster Uni campus" {...field} />
              </FormControl>
              <FormDescription>
                Where will your event take place? Please be as specific as you
                can regarding venue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="briefDescriptionOfEvent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Brief Description of Event (
                {form.getValues('briefDescriptionOfEvent').length}/1000
                characters)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A fun event for university students where they can have a go at juggling. We need experienced jugglers to help out."
                  className="resize-y"
                  maxLength={1000}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Briefly describe your event and the services you need us to
                provide.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Event</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When will your event take place?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-2 items-center">
          <Checkbox
            id="showNormalPerformers"
            checked={showNormalPerformers}
            onClick={() => {
              if (showNormalPerformers) {
                setShowNormalPerformers(false);
                form.resetField('numNormalPerformers');
                form.resetField('amountOfTimeForNormalPerformers');
              } else {
                setShowNormalPerformers(true);
              }
            }}
          />
          <Label htmlFor="showNormalPerformers">
            Do you want circus/magic performers?
          </Label>
        </div>

        {showNormalPerformers && (
          <>
            <FormField
              control={form.control}
              name="numNormalPerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of circus/magic Performers</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={20}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many circus/magic do you want to perform?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountOfTimeForNormalPerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of hours of performance for each circus/magic
                    performer
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={10}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many hours do you want each circus/magic performer to
                    spend at the event?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex space-x-2 items-center">
          <Checkbox
            id="showFirePerformers"
            checked={showFirePerformers}
            onClick={() => {
              if (showFirePerformers) {
                setShowFirePerformers(false);
                form.resetField('numFirePerformers');
                form.resetField('amountOfTimeForFirePerformers');
              } else {
                setShowFirePerformers(true);
              }
            }}
          />
          <Label htmlFor="showFirePerformers">
            Do you want fire performers?
          </Label>
        </div>

        {showFirePerformers && (
          <>
            <FormField
              control={form.control}
              name="numFirePerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Fire Performers</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={20}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many fire do you want to perform?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountOfTimeForFirePerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of hours of performance for each fire performer
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={10}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many hours do you want each fire performer to spend at
                    the event?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex space-x-2 items-center">
          <Checkbox
            id="showAerialPerformers"
            checked={showAerialPerformers}
            onClick={() => {
              if (showAerialPerformers) {
                setShowAerialPerformers(false);
                form.resetField('numAerialPerformers');
                form.resetField('amountOfTimeForAerialPerformers');
              } else {
                setShowAerialPerformers(true);
              }
            }}
          />
          <Label htmlFor="showAerialPerformers">
            Do you want aerial performers?
          </Label>
        </div>

        {showAerialPerformers && (
          <>
            <FormField
              control={form.control}
              name="numAerialPerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Aerial Performers</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={20}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many aerial do you want to perform?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountOfTimeForAerialPerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of hours of performance for each aerial performer
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={10}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many hours do you want each aerial performer to spend at
                    the event?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex space-x-2 items-center">
          <span>
            Price Estimate (please note this is an estimate and is in no way a
            guarantee):
          </span>
          <span className="font-bold">
            £
            {25 +
              form.getValues('numNormalPerformers') *
                form.getValues('amountOfTimeForNormalPerformers') *
                25 +
              form.getValues('numFirePerformers') *
                form.getValues('amountOfTimeForFirePerformers') *
                35 +
              form.getValues('numAerialPerformers') *
                form.getValues('amountOfTimeForAerialPerformers') *
                25}
          </span>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
