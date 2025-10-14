import { createContext, useContext, useState, useEffect } from 'react';
import getHomeInfo from '../utils/getHomeInfo.utils.js';

const HomeInfoContext = createContext();

export const HomeInfoProvider = ({ children }) => {
    const [homeInfo, setHomeInfo] = useState(null);
    const [homeInfoLoading, setHomeInfoLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchHomeInfo = async () => {
            try {
                console.log('🚀 HomeInfoContext - Starting to fetch home info...');
                const data = await getHomeInfo();
                console.log('✅ HomeInfoContext - Data fetched successfully:', data ? 'exists' : 'null');
                setHomeInfo(data);
            } catch (err) {
                console.error("❌ HomeInfoContext - Error fetching home info:", err);
                console.error("Error details:", {
                    message: err.message,
                    status: err.response?.status,
                    statusText: err.response?.statusText
                });
                setError(err);
            } finally {
                setHomeInfoLoading(false);
                console.log('🏁 HomeInfoContext - Loading finished');
            }
        };
        fetchHomeInfo();
    }, []);
    return (
        <HomeInfoContext.Provider value={{ homeInfo, homeInfoLoading, error }}>
            {children}
        </HomeInfoContext.Provider>
    );
};

export const useHomeInfo = () => useContext(HomeInfoContext);
