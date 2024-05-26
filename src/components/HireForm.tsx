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

// x name
// x preferred method of contact (email, instagram, facebook)
// x username/email
// x location
// x brief description of event
// x date

// do you want normal performers? (a brief description of what normal performers will be doing)
// num of normal performers
// amount of time for normal performers

// do you want fire performers? (a brief description of what fire performers will be doing)
// num fire performers
// amount of time for fire performers

// do you want aerial performers? (a brief description of what aerial performers will be doing)
// num aerial performers
// amount of time for aerial performers

// price estimate

const HireFormSchema = z.object({
  name: z.string(),
  company: z.string(),
  preferredContactMethod: z.enum(['email', 'instagram', 'facebook']),
  username: z.string(),
  location: z.string(),
  briefDescriptionOfEvent: z.string(),
  date: z.date(),
  numNormalPerformers: z.number(),
  amountOfTimeForNormalPerformers: z.number(),
  numFirePerformers: z.number(),
  amountOfTimeForFirePerformers: z.number(),
  numAerialPerformers: z.number(),
  amountOfTimeForAerialPerformers: z.number(),
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

  const onSubmit = (data: z.infer<typeof HireFormSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Ell" {...field} />
              </FormControl>
              <FormDescription>
                This is the name of the person we should contact and discuss
                anything with.
              </FormDescription>
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
                This is the name of the company or organisation hiring us.
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
                This is the preferred method of contact for us to use.
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
              <FormLabel>Username / Email</FormLabel>
              <FormControl>
                <Input placeholder="hello@lumacs.co.uk" {...field} />
              </FormControl>
              <FormDescription>
                This is the username or email we should contact and discuss
                anything with (this should match with your preferred contact
                method).
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
                Where will your event take place?
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
              <FormLabel>Brief Description of Event</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A fun event for university students where they can have a go at juggling. We need experienced jugglers to help out."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is a brief description of the event you are looking to
                organise and what you want us to do at the event.
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
            Do you want normal performers?
          </Label>
        </div>

        {showNormalPerformers && (
          <>
            <FormField
              control={form.control}
              name="numNormalPerformers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Normal Performers</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      {...field}
                      type="number"
                      min={0}
                      max={20}
                    />
                  </FormControl>
                  <FormDescription>
                    How many normal do you want to perform?
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
                    Number of hours of performance for each normal performer
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0"
                      {...field}
                      type="number"
                      min={0}
                      max={10}
                    />
                  </FormControl>
                  <FormDescription>
                    How many hours do you want each normal performer to spend at
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
                      placeholder="0"
                      {...field}
                      type="number"
                      min={0}
                      max={20}
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
                      placeholder="0"
                      {...field}
                      type="number"
                      min={0}
                      max={10}
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
                      placeholder="0"
                      {...field}
                      type="number"
                      min={0}
                      max={20}
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
                      placeholder="0"
                      {...field}
                      type="number"
                      min={0}
                      max={10}
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
