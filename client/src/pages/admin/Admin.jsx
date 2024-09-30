import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminPages = () => {


  return (
    <>
      <div>Welcome to AdminPages</div>
      <Outlet/>
    </>
  )
}

export default AdminPages