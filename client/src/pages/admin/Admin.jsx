import React from 'react'
import { Outlet } from 'react-router-dom'
import FormAdmin from '../../components/form/dashboard/FormAdmin'


const AdminPages = () => {


  return (
    <>
      <div>
        <FormAdmin />
      </div>
      <Outlet />
    </>
  )
}

export default AdminPages