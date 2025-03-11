import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Home, About, Registration, Chat, Login, UserAndSettings } from './pages'
import ScrollToTop from './components/behavior/ScrollToTop'
import { AuthProvider } from './Contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import CacheBuster from 'react-cache-buster'
import Loader from './components/Loader'
import { version } from '../package.json'
import GraphPage from './pages/graph/GraphPage'
import { RealtimeStatsProvider } from './Contexts/RealtimeStatsContext'
import Navbar from './components/Navbar'
import CreateThought from './pages/CreateThought'
import { NotificationsPage } from './pages/NotificationsPage'
import ThoughtsList from './pages/thoughtsList'
import NotFoundPage from './pages/NotFoundPage'
import { UserSettingsProvider } from './Contexts/UserSettingsContext'


// const clearCache =  (): Promise<void> => {
//   return new Promise((resolve) => {
//     console.log('Clearing cache...');
//     resolve();
//   });
// };

function App() {
  return (
    <main>
      <CacheBuster //todo not checked whether this works or not...
        currentVersion={version}
        isEnabled={import.meta.env.PROD}
        isVerboseMode={false}
        loadingComponent={<Loader />}
        metaFileDirectory={'.'}>
        <RealtimeStatsProvider >
          <AuthProvider>
            <UserSettingsProvider>
              <Router>
                <Navbar />
                <ScrollToTop>
                  <Routes>
                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/" element={<Navigate to="/graph" />} />
                    <Route path="/chat" element={<ProtectedRoute redirectPath='/login'><Chat /></ProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/user" element={<ProtectedRoute redirectPath='/login'><UserAndSettings /></ProtectedRoute>} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/graph" element={<GraphPage />} />
                    <Route path="/graph/:urlThoughtId" element={<GraphPage />} />
                    <Route path="/create-thought" element={<ProtectedRoute redirectPath='/login'><CreateThought /></ProtectedRoute>} />
                    <Route path='/list' element={<ThoughtsList />} />
                    <Route path='/zvoneček' element={<ProtectedRoute redirectPath='/login'>< NotificationsPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFoundPage></NotFoundPage>} />
                  </Routes>
                </ScrollToTop>
              </Router>
            </UserSettingsProvider>
          </AuthProvider>
        </RealtimeStatsProvider>
      </CacheBuster>
    </main>

  )
}

export default App