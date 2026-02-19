import {useState, useMemo, useCallback} from "react";

export const useFloorRoomSelector = ({
                                         rooms = [],
                                         setValue, // optional (react-hook-form)
                                     }) => {
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [availableRoomsForFloor, setAvailableRoomsForFloor] = useState([]);

    // 📌 คำนวณชั้นที่มีห้องว่าง
    const availableFloors = useMemo(() => {
        return [
            ...new Set(
                rooms
                    ?.filter((room) => room.status === "available")
                    .map((room) => room.floor)
            ),
        ].sort((a, b) => a - b);
    }, [rooms]);

    // 📌 เปลี่ยนชั้น
    const handleFloorChange = useCallback(
        (floor) => {
            setSelectedFloor(floor);

            const roomsData = rooms
                .filter((room) => room.floor === floor && room.status === "available")
                .sort((a, b) => a.roomNumber - b.roomNumber);

            setAvailableRoomsForFloor(roomsData);

            // ถ้าใช้ react-hook-form
            if (setValue) {
                setValue("floor", floor, {shouldValidate: true});
                setValue("roomId", undefined, {shouldValidate: true});
                setValue("roomNumber", undefined);
                setValue("price", undefined);
            }
        },
        [rooms, setValue]
    );

    // 📌 เปลี่ยนห้อง
    const handleRoomChange = useCallback(
        (roomId) => {
            const room = availableRoomsForFloor.find((r) => r._id === roomId);

            if (!room) return;

            if (setValue) {
                setValue("roomId", room._id, {shouldValidate: true});
                setValue("roomNumber", room.roomNumber);
                setValue("price", room.price);
            }

            return room; // เผื่อ component อยากใช้ต่อ
        },
        [availableRoomsForFloor, setValue]
    );

    return {
        selectedFloor,
        availableRoomsForFloor,
        availableFloors,
        handleFloorChange,
        handleRoomChange,
    };
};

// import {useEffect, useMemo, useCallback, useState} from "react";
//
// /**
//  * useFloorRoomSelector
//  *
//  * @param {Object} params
//  * @param {Array} params.rooms - รายการ rooms ทั้งหมด
//  * @param {Function} params.setValue - react-hook-form setValue (optional)
//  * @param {Object} params.initial - ค่าเริ่มต้น (optional)
//  * @param {number|null} params.initial.floor
//  * @param {string|undefined|null} params.initial.roomId
//  */
// export const useFloorRoomSelector = ({
//                                          rooms = [],
//                                          setValue, // optional (react-hook-form)
//                                          initial = {},
//                                      }) => {
//     const [selectedFloor, setSelectedFloor] = useState(initial?.floor ?? null);
//     const [availableRoomsForFloor, setAvailableRoomsForFloor] = useState([]);
//
//     // ✅ ห้อง "available" เท่านั้น (ปรับเงื่อนไขได้)
//     const availableRooms = useMemo(() => {
//         return (rooms || []).filter((r) => r?.status === "available");
//     }, [rooms]);
//
//     // ✅ รายการชั้นที่มีห้องว่าง
//     const availableFloors = useMemo(() => {
//         return [...new Set(availableRooms.map((r) => r.floor))].sort((a, b) => a - b);
//     }, [availableRooms]);
//
//     // ✅ helper: ตั้ง availableRoomsForFloor ตาม floor
//     const setRoomsForFloor = useCallback(
//         (floor) => {
//             const roomsData = availableRooms
//                 .filter((room) => room.floor === floor)
//                 .sort((a, b) => a.roomNumber - b.roomNumber);
//
//             setAvailableRoomsForFloor(roomsData);
//             return roomsData;
//         },
//         [availableRooms]
//     );
//
//     // ✅ เปลี่ยนชั้น (reset room)
//     const handleFloorChange = useCallback(
//         (floor) => {
//             setSelectedFloor(floor);
//
//             setRoomsForFloor(floor);
//
//             if (setValue) {
//                 setValue("floor", floor, {shouldValidate: true});
//                 setValue("roomId", undefined, {shouldValidate: true});
//                 setValue("roomNumber", undefined);
//                 setValue("price", undefined);
//             }
//         },
//         [setRoomsForFloor, setValue]
//     );
//
//     // ✅ เปลี่ยนห้อง (ได้ roomId + roomNumber + price)
//     const handleRoomChange = useCallback(
//         (roomId) => {
//             const room = availableRoomsForFloor.find((r) => r._id === roomId);
//             if (!room) return null;
//
//             if (setValue) {
//                 setValue("roomId", room._id, {shouldValidate: true});
//                 setValue("roomNumber", room.roomNumber);
//                 setValue("price", room.price);
//             }
//
//             return room;
//         },
//         [availableRoomsForFloor, setValue]
//     );
//
//     /**
//      * ✅ syncFromRoomId(roomId)
//      * ใช้ตอน "แก้ไข tenant" ที่มี room เดิมอยู่แล้ว
//      * - จะ set selectedFloor ให้ตรงกับ room นั้น
//      * - จะ set availableRoomsForFloor ให้มีรายการห้องในชั้นนั้น
//      * - และ setValue ค่า floor/roomId/roomNumber/price ให้ครบ
//      */
//     const syncFromRoomId = useCallback(
//         (roomId) => {
//             if (!roomId) return null;
//
//             // หา room จาก rooms ทั้งหมด (ไม่จำกัดเฉพาะ available เพื่อรองรับห้องที่ tenant อยู่ = unavailable)
//             const room = (rooms || []).find((r) => r?._id === roomId);
//             if (!room) return null;
//
//             setSelectedFloor(room.floor);
//
//             // ตอนแก้ไข tenant: อยากให้เห็น "available" ของชั้นนั้น
//             // แต่ถ้าห้องปัจจุบันเป็น unavailable (เพราะถูกเช่าอยู่) ให้ push เข้า list ด้วยเพื่อให้เลือกเห็น
//             let roomsData = availableRooms
//                 .filter((r) => r.floor === room.floor)
//                 .sort((a, b) => a.roomNumber - b.roomNumber);
//
//             const exists = roomsData.some((r) => r._id === room._id);
//             if (!exists) {
//                 roomsData = [room, ...roomsData].sort((a, b) => a.roomNumber - b.roomNumber);
//             }
//
//             setAvailableRoomsForFloor(roomsData);
//
//             if (setValue) {
//                 setValue("floor", room.floor, {shouldValidate: true});
//                 setValue("roomId", room._id, {shouldValidate: true});
//                 setValue("roomNumber", room.roomNumber);
//                 setValue("price", room.price);
//             }
//
//             return room;
//         },
//         [rooms, availableRooms, setValue]
//     );
//
//     // ✅ init: ถ้ามี initial.floor ให้โหลด rooms ของชั้นนั้นทันที
//     useEffect(() => {
//         if (selectedFloor != null) {
//             setRoomsForFloor(selectedFloor);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []); // init ครั้งเดียว
//
//     return {
//         selectedFloor,
//         availableRoomsForFloor,
//         availableFloors,
//         handleFloorChange,
//         handleRoomChange,
//         syncFromRoomId, // ✅ สำคัญมากตอน Edit
//     };
// };
