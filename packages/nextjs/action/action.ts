'use server'
import { Deta } from 'deta';
// @ts-ignore
const deta = new Deta(process.env.DETA);
export async function put(data:any, database:any) {

    const db = deta.Base(database);
    await db.put(data);
}