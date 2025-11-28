import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import CustomerApp from './routes/CustomerApp'

const StaffApp = lazy(() => import('./routes/StaffApp'))

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <p>Yükleniyor...</p>
  </div>
)

const App = () => (
  <Routes>
    <Route path="/" element={<CustomerApp />} />
    <Route
      path="/admin/*"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <StaffApp variant="admin" />
        </Suspense>
      }
    />
    <Route
      path="/garson/*"
      element={
        <Suspense fallback={<LoadingFallback />}>
          <StaffApp variant="waiter" />
        </Suspense>
      }
    />
    <Route path="*" element={<CustomerApp />} />
  </Routes>
)

export default App



