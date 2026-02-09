import React from 'react'
import TenantCreateForm from '../components/apartment/TenantCreateForm'

export default function TenantCreatePage() {
  const handleSubmit = async (payload) => {
    // TODO: connect API create-tenant endpoint
    // eslint-disable-next-line no-console
    console.log('submit tenant payload', payload)
  }

  return (
    <div style={{ padding: 16 }}>
      <TenantCreateForm onSubmit={handleSubmit} />
    </div>
  )
}


