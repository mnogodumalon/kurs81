import { useState } from 'react'
import AppLayout, { type PageKey } from '@/components/AppLayout'
import DashboardOverview from '@/pages/DashboardOverview'
import KursePage from '@/pages/KursePage'
import DozentenPage from '@/pages/DozentenPage'
import TeilnehmerPage from '@/pages/TeilnehmerPage'
import RaeumePage from '@/pages/RaeuemPage'
import AnmeldungenPage from '@/pages/AnmeldungenPage'

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardOverview onNavigate={setCurrentPage} />
      case 'kurse': return <KursePage />
      case 'dozenten': return <DozentenPage />
      case 'teilnehmer': return <TeilnehmerPage />
      case 'raeume': return <RaeumePage />
      case 'anmeldungen': return <AnmeldungenPage />
    }
  }

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  )
}

export default App
