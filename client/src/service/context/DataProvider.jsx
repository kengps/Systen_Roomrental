// services/api/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';


const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // const [msgData, setMsgData] = useState(null);
    // const [botData, setBotData] = useState(null);
    // const [botDataV2, setBotDataV2] = useState(null);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);


    // const getMsg = useStore(state => state.getMsg);
    // const getBot = botStore(state => state.getBot);
    // const getBotV2 = botStore(state => state.getBotV2);

    const fetchData = async () => {
        // setLoading(true);
        // try {
        //     const msgData = await getMsg();
        //     const botData = await getBot();
        //     const botDataV2 = await getBotV2();
        //     setMsgData(msgData);
        //     setBotData(botData);
        //     setBotDataV2(botDataV2);
        // } catch (err) {
        //     setError(err);
        // } finally {
        //     setLoading(false);
        // }
    };

    useEffect(() => {
        // fetchData();
    }, []);

    return (
        <DataContext.Provider
        // value={{ msgData, botData, botDataV2,loading, error, refetch: fetchData }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const resultData = () => useContext(DataContext);
