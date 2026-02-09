import React from 'react'
import RentalContractForm from '../components/apartment/RentalContractForm'

export default function RentalContractPage() {
  const handleSubmit = async (payload) => {
    // TODO: connect API here (e.g., createContract(payload))
    // eslint-disable-next-line no-console
    console.log('submit contract payload', payload)
  }

  return (
    <div style={{ padding: 16 }}>
      <RentalContractForm onSubmit={handleSubmit} />
    </div>
  )
}


