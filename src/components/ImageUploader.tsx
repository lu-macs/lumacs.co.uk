import { useState } from 'react';
import { OurUploadButton } from './OurUploadThing';
import { Label } from './ui/label';
import { Input } from './ui/input';

export function ImageUploader() {
  const [password, setPassword] = useState('');
  return (
    <>
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <OurUploadButton
        input={{ password }}
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log('Files: ', res);
          alert('Upload Completed');
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </>
  );
}
