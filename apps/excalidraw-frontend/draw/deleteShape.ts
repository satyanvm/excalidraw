import axios from "axios";

export async function handleDeletion(roomId: any, shape: any){
    try{
        const res = await axios.get(`http://localhost:3001/room/id/${roomId}`);
        const slug = res.data.slug;
    const response = await axios.post(`http://localhost:3001/deletechat/${slug}`, {
        shape: shape
    });
    if(response.status === 200){
        console.log("Deletion successful");
    } else {
        console.log("Deletion unsuccessful");
    }
    } catch(e){
        console.error(e);
    }
}