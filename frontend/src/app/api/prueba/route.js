export async function GET(){
    const data = { message : "Haz hecho una solicitud"}

    return Response.json(data, {status : 200})
}