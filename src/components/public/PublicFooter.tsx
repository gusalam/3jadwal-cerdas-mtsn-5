import { Instagram, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import schoolLogo from "@/assets/logo.png";

const quickLinks = [
  { label: "Profil Sekolah", href: "#tentang" },
  { label: "Berita", href: "#berita" },
  { label: "Galeri", href: "#galeri" },
  { label: "Jadwal Pelajaran", href: "/jadwal-publik" },
];

export const PublicFooter = () => (
  <footer id="kontak" className="bg-primary text-primary-foreground">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Identitas */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center p-1.5">
              <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm">MTsN 5 Jakarta</h3>
              <p className="text-xs opacity-70">Madrasah Mandiri Berprestasi</p>
            </div>
          </div>
          <p className="text-xs opacity-70 leading-relaxed">
            Madrasah Tsanawiyah Negeri 5 Jakarta, membentuk generasi unggul beriman, berilmu, dan berakhlak mulia.
          </p>
        </div>

        {/* Kontak */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm border-b border-primary-foreground/20 pb-2">Kontak</h4>
          <div className="space-y-3 text-xs">
            <a href="tel:0214401833" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <Phone className="w-3.5 h-3.5 shrink-0" /> (021) 4401833
            </a>
            <a href="mailto:mtslimajakarta@gmail.com" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <Mail className="w-3.5 h-3.5 shrink-0" /> mtslimajakarta@gmail.com
            </a>
            <a href="https://wa.me/6285771014119" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <MessageCircle className="w-3.5 h-3.5 shrink-0" /> +62 857-7101-4119
            </a>
            <div className="flex items-start gap-2 opacity-80">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Jl. Mardani Raya No. 25, Jakarta Pusat</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm border-b border-primary-foreground/20 pb-2">Quick Links</h4>
          <div className="space-y-2.5 text-xs">
            {quickLinks.map((link) =>
              link.href.startsWith("/") ? (
                <a key={link.label} href={link.href} className="block opacity-80 hover:opacity-100 transition-opacity">
                  → {link.label}
                </a>
              ) : (
                <button
                  key={link.label}
                  className="block opacity-80 hover:opacity-100 transition-opacity text-left"
                  onClick={() => document.getElementById(link.href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" })}
                >
                  → {link.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Sosial Media */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm border-b border-primary-foreground/20 pb-2">Ikuti Kami</h4>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/mtsn5jkt" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 flex items-center justify-center transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://youtube.com/@mtsn5jakarta" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 flex items-center justify-center transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="mailto:mtslimajakarta@gmail.com" className="w-10 h-10 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 flex items-center justify-center transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Mini map */}
          <div className="rounded-xl overflow-hidden border border-primary-foreground/10">
            <iframe
              src="https://maps.google.com/maps?q=MTsN%205%20Jakarta&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-32 border-0"
              loading="lazy"
              title="Lokasi MTsN 5 Jakarta"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-primary-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-60">
        <p>© {new Date().getFullYear()} MTsN 5 Jakarta. All rights reserved.</p>
        <p>e-Jadwal Digital Platform</p>
      </div>
    </div>
  </footer>
);
