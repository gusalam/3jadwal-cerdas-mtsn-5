import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicHero } from "@/components/public/PublicHero";
import { PublicFeatureCards } from "@/components/public/PublicFeatureCards";
import { PublicInfoGrid } from "@/components/public/PublicInfoGrid";
import { PublicVideoSlider } from "@/components/public/PublicVideoSlider";
import { PublicAnnouncements } from "@/components/public/PublicAnnouncements";
import { PublicNews } from "@/components/public/PublicNews";
import { PublicGallery } from "@/components/public/PublicGallery";
import { PublicFooter } from "@/components/public/PublicFooter";

const PublicSchedulePage = () => (
  <div className="min-h-screen bg-background">
    <PublicNavbar />
    <PublicHero />
    <PublicFeatureCards />
    <PublicInfoGrid />
    <PublicGallery />
    <PublicVideoSlider />
    <PublicAnnouncements />
    <PublicNews />
    <PublicFooter />
  </div>
);

export default PublicSchedulePage;
