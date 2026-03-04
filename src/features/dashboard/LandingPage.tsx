import { HeroSection } from "@/features/landing/HeroSection";
import { FeatureSection } from "@/features/landing/FeatureSection";
import { SocialProofSection } from "@/features/landing/SocialProofSection";
import { CTASection } from "@/features/landing/CTASection";

interface Props {
  onSubmit: (username: string) => void;
}

export function LandingPage({ onSubmit }: Props) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <HeroSection onSubmit={onSubmit} />
      <SocialProofSection onUserSelect={onSubmit} />
      <FeatureSection />
      <CTASection />

      {/* Footer - Inline for now or move to separate component */}
      <footer className="py-8 text-center text-sm text-(--color-text-muted) border-t border-gray-100">
        <p>© 2026 Astrolabe. Built with ❤️ for the open source community.</p>
      </footer>
    </main>
  );
}
