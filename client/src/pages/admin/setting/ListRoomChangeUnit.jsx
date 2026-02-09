import React from 'react'
import { useListRoom } from '../../../hooks/useListRoom'
import ListRoomChangeUnitForm from './components/ListRoomChangeUnitForm'

const ListRoomChangeUnitPage = () => {
    // ใช้ utility hook แทน useQuery
    const { data, isLoading, isError,refetch} = useListRoom()


    return (
        <>
            <ListRoomChangeUnitForm 
                data={data}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
            />
        </>
    )
}

export default ListRoomChangeUnitPage