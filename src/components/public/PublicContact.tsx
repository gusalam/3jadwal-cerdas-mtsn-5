import { Instagram, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const contacts = [
  { icon: Instagram, label: "Instagram", value: "@mtsn5jkt", href: "https://www.instagram.com/mtsn5jkt", color: "text-pink-500" },
  { icon: Youtube, label: "YouTube", value: "MTsN 5 Jakarta", href: "https://youtube.com/@mtsn5jakarta", color: "text-red-500" },
  { icon: Mail, label: "Email", value: "mtslimajakarta@gmail.com", href: "mailto:mtslimajakarta@gmail.com", color: "text-amber-500" },
  { icon: MessageCircle, label: "WhatsApp", value: "+62 857-7101-4119", href: "https://wa.me/6285771014119", color: "text-green-500" },
  { icon: Phone, label: "Telepon", value: "(021) 4401833", href: "tel:0214401833", color: "text-blue-500" },
  { icon: MapPin, label: "Lokasi", value: "Lihat di Google Maps", href: "https://maps.app.goo.gl/4fKTCkq4xWcBSwQMA", color: "text-red-400" },
];

export const PublicContact = () => (
  <section className="space-y-4">
    <h2 className="text-lg font-bold text-foreground">Kontak Sekolah</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {contacts.map((c) => (
        <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="block group">
          <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`${c.color} shrink-0`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  </section>
);
