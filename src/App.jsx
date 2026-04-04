import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppNav } from './components/AppNav'
import { Editor } from './components/Editor'
import LandingPage   from './pages/LandingPage'
import AboutPage     from './pages/AboutPage'
import HowToUsePage  from './pages/support/HowToUsePage'
import FaqPage       from './pages/support/FaqPage'
import ContactPage   from './pages/support/ContactPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        <AppNav />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/"                    element={<LandingPage />} />
            <Route path="/design"              element={<Editor />} />
            <Route path="/about"               element={<AboutPage />} />
            <Route path="/support"             element={<Navigate to="/support/how-to-use" replace />} />
            <Route path="/support/how-to-use"  element={<HowToUsePage />} />
            <Route path="/support/faq"         element={<FaqPage />} />
            <Route path="/support/contact"     element={<ContactPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
