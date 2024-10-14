import React, {useState, createContext} from 'react'

//สร้าง Store Context
export const StoreContext = createContext({})

export const StoreContextProvider =  ({ children }) => {
    // initail State
    const [information, setInformation] = useState({firstName: undefined, lastName: undefined, nickname: undefined})
    const [account, setAccount] = useState({email: undefined, password: undefined, confirmPassword: undefined})
  
    //value สำหรับ return ไปให้หน้าต่าง ๆ ใช้ 
    const store = {
      information : [information, setInformation],
      account: [account, setAccount],
    }
    
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  }