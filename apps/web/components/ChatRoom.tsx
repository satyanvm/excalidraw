import axios from "axios";
import { ChatRoomClient } from "./ChatRoomClient";

async function getId(id: Number) {
    const response = await axios.get('http://localhost:3001/roomchats/1');
    console.log("the slug is" + response.data.slug);
    return response.data.slug;   
}

async function getChats(id: Number) {
  const slug = await getId(id);

  const response = await axios.get('http://localhost:3001/chats/chatroom');
  
  console.log("response.data:", response.data); 
  console.log("typeof response.data:", typeof response.data);
  
  return response.data; 
}

export async function ChatRoom({id}: {
    id: Number  
}) {
    const messages = await getChats(id); 
    
    return <ChatRoomClient messages={ messages } id = {id}></ChatRoomClient>

}
