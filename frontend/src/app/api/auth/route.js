import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken';
import 'dotenv/config';

let SECRET = process.env.SECRETA;


export async function POST(req) {
  
    
    
    try {
    const { token } = await req.json();
   
        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }
        //verificando valides del token
        const dataToken = jwt.verify(token, SECRET)
        
       
        

        const response = NextResponse.json({ message: 'Token stored successfully' , dataToken});
        response.cookies.set('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 
        });
        response.cookies.set('user', dataToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}