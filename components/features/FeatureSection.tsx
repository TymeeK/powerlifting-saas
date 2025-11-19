import { FeatureSectionHeader } from './FeatureSectionHeader';
import { FeaturesGrid } from './FeaturesGrid';
import { FeatureDemoSection } from './FeatureDemoSection';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: Feature[];
  demoTitle: string;
  demoDescription: string;
  benefits: string[];
  demo: ReactNode;
  reverse?: boolean;
  background?: 'default' | 'muted';
}

export function FeatureSection({
  icon,
  title,
  description,
  features,
  demoTitle,
  demoDescription,
  benefits,
  demo,
  reverse = false,
  background = 'default',
}: FeatureSectionProps) {
  return (
    <section
      className={`py-20 lg:py-32 ${
        background === 'muted' ? 'bg-muted/50' : ''
      }`}
    >
      <div className='container mx-auto px-6 sm:px-8 lg:px-16'>
        <div className='max-w-6xl mx-auto'>
          <FeatureSectionHeader
            icon={icon}
            title={title}
            description={description}
          />
          <div className='mb-16'>
            <FeaturesGrid features={features} />
          </div>
          <FeatureDemoSection
            title={demoTitle}
            description={demoDescription}
            benefits={benefits}
            demo={demo}
            reverse={reverse}
          />
        </div>
      </div>
    </section>
  );
}
