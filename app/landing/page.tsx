'use client';

import { AnimatePresence, motion } from 'framer-motion';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import StatsBar from '@/components/landing/StatsBar';
import SpacesSection from '@/components/landing/SpacesSection';
import TopicsSection from '@/components/landing/TopicsSection';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyNotWhatsapp from '@/components/landing/WhyNotWhatsapp';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTABanner from '@/components/landing/CTABanner';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <LandingNav />
        <Hero />
        <StatsBar />
        <SpacesSection />
        <TopicsSection />
        <HowItWorks />
        <WhyNotWhatsapp />
        <FeaturesSection />
        <CTABanner />
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
