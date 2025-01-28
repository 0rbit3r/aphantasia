import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import { Home, About, Registration, Chat, Login, Welcome, UserAndSettings } from './pages'
import ScrollToTop from './components/behavior/ScrollToTop'
import { AuthProvider } from './Contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import CacheBuster from 'react-cache-buster'
import Loader from './components/Loader'
import { version } from '../package.json'
import GraphPage from './pages/graph/GraphPage'
import CreateThought from './pages/createThought/CreateThought'
import { RealtimeStatsProvider } from './Contexts/RealtimeStatsContext'
import ThoughtsList from './pages/thoughtsList/thoughtsList'
import { NotificationsPage } from './pages/notifications/NotificationsPage'

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
            <Router>
              <ScrollToTop>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute redirectPath='/login'><Chat /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/user" element={<ProtectedRoute redirectPath='/login'><UserAndSettings /></ProtectedRoute>} />
                  <Route path="/register" element={<Registration />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/graph" element={<GraphPage />} />
                  <Route path="/graph/:urlThoughtId" element={<GraphPage />} />
                  <Route path="/create-thought" element={<ProtectedRoute redirectPath='/login'><CreateThought /></ProtectedRoute>} />
                  <Route path='/list' element={<ThoughtsList />} />
                  <Route path='/zvoneček' element={<ProtectedRoute redirectPath='/login'>< NotificationsPage/></ProtectedRoute> } />
                  <Route path="*" element={<div>404 :-(</div>} />
                </Routes>
              </ScrollToTop>
              <Navbar />
            </Router>
          </AuthProvider>
        </RealtimeStatsProvider>
      </CacheBuster>
    </main>

  )
}

export default App