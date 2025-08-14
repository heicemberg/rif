// app/page.tsx
import { Hero } from '@/components/home/Hero';
import { FeaturedPrize } from '@/components/home/FeaturedPrize';
import { TrustBadges } from '@/components/widgets/TrustBadges';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { Winners } from '@/components/home/Winners';

import { SocialProof } from '@/components/widgets/SocialProof';


export default function HomePage() {
  return (
    <>
      <Hero variant="centered" />
      <TrustBadges variant="inline" />
      <HowItWorks variant="timeline" />
      <Winners variant="featured" />
      <Testimonials variant="carousel" />
      <SocialProof variant="default" />

    </>
  );
}