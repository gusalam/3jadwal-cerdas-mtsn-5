import { Card } from "@/components/ui/card";

export const PublicMaps = () => (
  <section className="space-y-4">
    <h2 className="text-lg font-bold text-foreground">Lokasi Sekolah</h2>
    <Card className="overflow-hidden">
      <iframe
        src="https://maps.google.com/maps?q=MTsN%205%20Jakarta&t=&z=15&ie=UTF8&iwloc=&output=embed"
        className="w-full h-[250px] sm:h-[350px] lg:h-[400px] border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Lokasi MTsN 5 Jakarta"
      />
    </Card>
  </section>
);
