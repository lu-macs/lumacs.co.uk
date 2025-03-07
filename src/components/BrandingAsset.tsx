import { Button } from './ui/button';
import { Card } from './ui/cool-card';

export const BrandingAsset = ({
  name,
  type,
}: {
  name: string;
  type: 'light' | 'dark';
}) => {
  const sanitizedName = name.replaceAll(' ', '').toLowerCase();
  const assetPath = `/assets/branding/${sanitizedName}`;

  return (
    <Card>
      <div className="p-4 space-y-4">
        {/* Header Section */}
        <div className="text-lg font-bold">
          {name} - {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>

        {/* Image Preview Section */}
        <div
          className={`w-48 h-48 flex items-center justify-center ${
            type === 'light' ? 'bg-white' : 'bg-black'
          }`}
        >
          <img
            src={`${assetPath}/${type}.svg`}
            alt={`${name} branding asset`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Download Links Section */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Download:</div>
          <div className="flex flex-col gap-2">
            {['svg', 'png', 'png + bg'].map((extension) => (
              <Button asChild key={extension} variant={'secondary'}>
                <a
                  onClick={() => plausible('Branding Asset Download', {props: {name, type, extension}})}
                  href={`${assetPath}/${type}${
                    extension === 'png + bg' ? '_bg' : ''
                  }.${extension.replace('png + bg', 'png')}`}
                  download={`lumacs_${sanitizedName}_${type}`}
                >
                  {extension.toUpperCase()}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
