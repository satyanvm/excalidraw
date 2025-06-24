import { useEffect, useState } from "react";
import { WS_URL } from "../app/config/config";

export function useSocket(){

    const [loading,setLoading] = useState(false);
    const [socket, setSocket] = useState<WebSocket>();
            
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNWI5NzE5Yy1lZjA3LTQ4MGMtYTQwMi01YWJlNTBiYzI5N2UiLCJpYXQiOjE3NTA3NjM3NDR9.nSCuytzovpoE5ZNP5S9Zl7EyqYCE5BzhVA1Jx7GM65I`)
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
        
    },[]);
    return {
        socket, loading
    }
}