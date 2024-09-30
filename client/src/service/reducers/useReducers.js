export function useReducer(state = null, action) {
    switch (action.type) {
      case "LOGIN":
        return action.payload; //ต้องการอะไรให้ส่งอันนั้น
      case "LOGOUT":
        localStorage.clear();
        return action.payload;
  
      default:
        return state;
    }
  }
  
  
  