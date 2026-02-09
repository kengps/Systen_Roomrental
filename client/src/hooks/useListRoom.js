import { useQuery } from '@tanstack/react-query'
import { getRoom } from '../service/api/rooms'
import persistMiddleware from '../service/zustand/middleware/persistMiddleware'

/**
 * Custom hook สำหรับดึงข้อมูลห้องพัก
 * ใช้ React Query cache เพื่อป้องกันการเรียก API ซ้ำ
 * 
 * @returns {Object} - { data, isLoading, isError, error }
 */
export const useListRoom = () => {
    const { user } = persistMiddleware()
    const profileId = user?.userPayLoad?.user?.id

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
        isSuccess
    } = useQuery({
        queryKey: ['listRoom', profileId],
        queryFn: () => getRoom(profileId),
        enabled: !!profileId, // เรียก API เฉพาะเมื่อมี profileId
        staleTime: 5 * 60 * 1000, // 5 นาที - ข้อมูลจะไม่ stale
        cacheTime: 10 * 60 * 1000, // 10 นาที - เก็บใน cache
        retry: 3, // ลองใหม่ 3 ครั้งเมื่อ error
        retryDelay: 1000, // รอ 1 วินาทีก่อนลองใหม่
    })

    return {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
        isSuccess,
        profileId
    }
}

export default useListRoom
