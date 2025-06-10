import { useEffect, useState } from "react";
import { WS_URL } from "../app/config/config";

export function useSocket(){

    const [loading,setLoading] = useState(false);
    const [socket, setSocket] = useState<WebSocket>();
            
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjZhZTg0ZS02NzlhLTQxNGQtYmUwNC00MTA3Zjg1NjhmOGEiLCJpYXQiOjE3NDkwNDU3MzF9.5GXTXz3buFRCstmSaTrSTPvZbcbX-T9VVPaWW8uNcfU`)
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
        

    },[]);
    return {
        socket, loading
    }
}