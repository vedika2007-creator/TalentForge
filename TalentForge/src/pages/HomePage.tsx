import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { StatisticsSection } from '../components/landing/StatisticsSection';
import { WhySection } from '../components/landing/WhySection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { StudentShowcaseSection } from '../components/landing/StudentShowcaseSection';
import { ProjectShowcaseSection } from '../components/landing/ProjectShowcaseSection';
import { RecruiterMatchingSection } from '../components/landing/RecruiterMatchingSection';
import { EvidenceVisualizationSection } from '../components/landing/EvidenceVisualizationSection';
import { CollaborationPreviewSection } from '../components/landing/CollaborationPreviewSection';
import { SkillGapSection } from '../components/landing/SkillGapSection';
import { TeacherVerificationPreviewSection } from '../components/landing/TeacherVerificationPreviewSection';
import { AdminAnalyticsSection } from '../components/landing/AdminAnalyticsSection';
import { CtaSection } from '../components/landing/CtaSection';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <div className="space-y-0">
      <HeroSection onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
      <StatisticsSection />
      <WhySection onNavigate={onNavigate} />
      <HowItWorksSection onNavigate={onNavigate} />
      <StudentShowcaseSection onNavigate={onNavigate} />
      <ProjectShowcaseSection onNavigate={onNavigate} />
      <RecruiterMatchingSection onNavigate={onNavigate} />
      <EvidenceVisualizationSection onNavigate={onNavigate} />
      <CollaborationPreviewSection onNavigate={onNavigate} />
      <SkillGapSection onNavigate={onNavigate} />
      <TeacherVerificationPreviewSection onNavigate={onNavigate} />
      <AdminAnalyticsSection onNavigate={onNavigate} />
      <CtaSection onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
