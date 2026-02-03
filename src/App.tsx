import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import GlobalDashboard from './pages/GlobalDashboard'
import { GitHubDashboard } from './pages/GitHubDashboard'
import SourcesPage from './pages/SourcesPage'
import SearchModal from './components/search/SearchModal'

function App() {
  return (
    <>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topic/:topic" element={<TopicPage />} />
          <Route path="/global" element={<GlobalDashboard />} />
          <Route path="/github" element={<GitHubDashboard />} />
          <Route path="/sources" element={<SourcesPage />} />
        </Routes>
      </MainLayout>
      <SearchModal />
    </>
  )
}

export default App
