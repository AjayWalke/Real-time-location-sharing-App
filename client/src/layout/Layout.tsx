import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

const Layout = () => {
  return (
    <div>
      <div>
        <Header/>
        <main>
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default Layout
