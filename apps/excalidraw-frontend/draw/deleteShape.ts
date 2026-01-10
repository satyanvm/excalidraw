import axios from "axios";

export async function handleDeletion(roomId: any, shape: any){
    try{
        const slug = await axios.get(`http://localhost:3001/room/${roomId}`);
    const response = await axios.post(`http://localhost:3001/deletechat/${slug}`, {
        shape: shape
    });
    if(response){
        console.log("Deletion successfull");
    } else {
        console.log("Deletion unsuccessfull");
    }
    } catch(e){
        console.error(e);
    }
}