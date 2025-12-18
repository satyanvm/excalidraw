import axios from "axios";
import { ChatRoom } from "../../../components/ChatRoom";

interface PageProps {
  params: {
    roomId: string;
  };
}

async function getRoomId(slug: string) {
  const response = await axios.get("http://localhost:3001/room/chatroom");
  return response.data.id;
}

export default async function ChatRoomPage({ params }: PageProps) {
  const { roomId } = await params;
  const theroomId = Number(roomId);
  if (isNaN(theroomId)) {
    return <div>Invalid room ID</div>;
  }

  return <ChatRoom id={theroomId} />;
}
