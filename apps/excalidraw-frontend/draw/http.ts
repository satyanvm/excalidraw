import axios from "axios";

export async function getExistingShapes(roomId: Number) {
  const slug = await axios.get(`http://localhost:3001/roomchats/${roomId}`);

  const res = await axios.get(`http://localhost:3001/chats/chatroom`);

  const messages: string[] = res.data.messages;

  const shapes: any = messages
    .map((str) => {
      try {
        return JSON.parse(str);
      } catch (err) {
        console.error("Failed to parse message:", str, err);
        return null;
      }
    })
    .filter(Boolean);

  return shapes;
} 
