import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { Home } from '@/pages/Home'
import { Animals } from '@/pages/Animals'
import { AnimalDetail } from '@/pages/AnimalDetail'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { Auth } from '@/pages/Auth'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminAnimals } from '@/pages/admin/AdminAnimals'
import { AdminBookings } from '@/pages/admin/AdminBookings'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/animals"
          element={
            <PublicLayout>
              <Animals />
            </PublicLayout>
          }
        />
        <Route
          path="/animals/:id"
          element={
            <PublicLayout>
              <AnimalDetail />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicLayout>
              <Auth />
            </PublicLayout>
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="animals" element={<AdminAnimals />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
