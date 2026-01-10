import { ChatRoom } from "../../../components/ChatRoom";

export default async function ChatRoomPage({ params }: any) {
  const { roomId } = await params;
  const theroomId = Number(roomId);
  if (isNaN(theroomId)) {
    return <div>Invalid room ID</div>;
  }

  return <ChatRoom id={theroomId} />;
}
