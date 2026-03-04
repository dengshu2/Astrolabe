import { HeroSection } from "@/features/landing/HeroSection";
import { FeatureSection } from "@/features/landing/FeatureSection";
import { SocialProofSection } from "@/features/landing/SocialProofSection";
import { CTASection } from "@/features/landing/CTASection";
import { useLanguage } from "@/i18n";

interface Props {
  onSubmit: (username: string) => void;
}

export function LandingPage({ onSubmit }: Props) {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col bg-white">
      {/* First fold — fills exactly one viewport */}
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col">
        <HeroSection onSubmit={onSubmit} />
        <SocialProofSection onUserSelect={onSubmit} />
      </div>
      <FeatureSection />
      <CTASection />

      {/* Footer - Inline for now or move to separate component */}
      <footer className="py-8 text-center text-sm text-(--color-text-muted) border-t border-gray-100">
        <p>{t.footer.copyright}</p>
      </footer>
    </main>
  );
}
