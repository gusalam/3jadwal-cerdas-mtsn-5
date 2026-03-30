import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail } from "lucide-react";
import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";

export const PublicLocation = () => {
  const fade = useScrollFadeIn();

  return (
    <section id="kontak" ref={fade.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-700 ${fade.className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-secondary rounded-full" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Lokasi & Kontak</h2>
        <MapPin className="w-5 h-5 text-secondary" />
      </div>

      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Map embed */}
            <div className="aspect-video md:aspect-auto md:min-h-[280px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.86589!3d-6.175110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sMTsN%205%20Jakarta!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi MTsN 5 Jakarta"
              />
            </div>

            {/* Contact info */}
            <div className="p-6 sm:p-8 flex flex-col justify-center space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Alamat</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Jl. Mardani Raya No. 25, Cempaka Putih, Jakarta Pusat, DKI Jakarta 10520
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Telepon</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">(021) 4401833</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">mtslimajakarta@gmail.com</p>
                </div>
              </div>

              <a href="https://maps.app.goo.gl/4fKTCkq4xWcBSwQMA" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="rounded-full text-xs mt-2">
                  Lihat di Google Maps →
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
