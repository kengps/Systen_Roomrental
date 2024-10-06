import React from 'react'
import { Outlet } from 'react-router-dom'
import FormAdmin from '../../components/form/dashboard/FormAdmin'


const AdminPages = () => {

  console.log('====================================');
  console.log('เข้ามาไหม');
  console.log('====================================');

  return (
    <>
  
      <FormAdmin />
      {/* <Outlet /> */}
    </>
  )
}

export default AdminPages