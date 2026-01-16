import axios from "axios";

export async function getExistingShapes(roomId: Number) {
  try {
    const slugResponse = await axios.get(
      `http://localhost:3001/roomchats/${roomId}`,
    );
    const slug = slugResponse.data.slug;

    if (!slug) {
      return [];
    }

    const res = await axios.get(`http://localhost:3001/chats/${slug}`);

    const messages: string[] = res.data.messages || [];

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
  } catch (err) {
    console.error("Error fetching shapes:", err);
    return [];
  }
}

