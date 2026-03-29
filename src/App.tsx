import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PublicSchedulePage from "./pages/PublicSchedulePage";
import JadwalPublikPage from "./pages/JadwalPublikPage";
import Index from "./pages/Index";
import GuruPage from "./pages/GuruPage";
import MapelPage from "./pages/MapelPage";
import KelasPage from "./pages/KelasPage";
import JamPage from "./pages/JamPage";
import PreferensiPage from "./pages/PreferensiPage";
import JadwalPage from "./pages/JadwalPage";
import StatistikPage from "./pages/StatistikPage";
import AdminPage from "./pages/AdminPage";
import TahunAjaranPage from "./pages/TahunAjaranPage";
import KegiatanPage from "./pages/KegiatanPage";
import BeritaPage from "./pages/BeritaPage";
import PengumumanPage from "./pages/PengumumanPage";
import GaleriPage from "./pages/GaleriPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import BeritaDetailPage from "./pages/BeritaDetailPage";
import PengumumanDetailPage from "./pages/PengumumanDetailPage";
import ProfilPage from "./pages/ProfilPage";
import ProfilCmsPage from "./pages/ProfilCmsPage";
import BannerCmsPage from "./pages/BannerCmsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicSchedulePage />} />
          <Route path="/jadwal-publik" element={<JadwalPublikPage />} />
          <Route path="/berita/:id" element={<BeritaDetailPage />} />
          <Route path="/pengumuman/:id" element={<PengumumanDetailPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/guru" element={<ProtectedRoute><GuruPage /></ProtectedRoute>} />
          <Route path="/mapel" element={<ProtectedRoute><MapelPage /></ProtectedRoute>} />
          <Route path="/kelas" element={<ProtectedRoute><KelasPage /></ProtectedRoute>} />
          <Route path="/jam" element={<ProtectedRoute><JamPage /></ProtectedRoute>} />
          <Route path="/preferensi" element={<ProtectedRoute><PreferensiPage /></ProtectedRoute>} />
          <Route path="/jadwal" element={<ProtectedRoute><JadwalPage /></ProtectedRoute>} />
          <Route path="/statistik" element={<ProtectedRoute><StatistikPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/tahun-ajaran" element={<ProtectedRoute><TahunAjaranPage /></ProtectedRoute>} />
          <Route path="/kegiatan" element={<ProtectedRoute><KegiatanPage /></ProtectedRoute>} />
          <Route path="/cms-berita" element={<ProtectedRoute><BeritaPage /></ProtectedRoute>} />
          <Route path="/cms-pengumuman" element={<ProtectedRoute><PengumumanPage /></ProtectedRoute>} />
          <Route path="/cms-galeri" element={<ProtectedRoute><GaleriPage /></ProtectedRoute>} />
          <Route path="/cms-profil" element={<ProtectedRoute><ProfilCmsPage /></ProtectedRoute>} />
          <Route path="/cms-banner" element={<ProtectedRoute><BannerCmsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
