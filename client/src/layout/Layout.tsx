import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'; 
import Footer from '../components/Footer';

const Layout = () => {

  return (
    <div className='bg-[#155e75]'>
      <div>
        <Header/>
        <main>
          <Outlet/>
        </main>
      </div>
      <Footer/>
    </div>
  )
}

export default Layout
