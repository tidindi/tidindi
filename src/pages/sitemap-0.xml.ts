import { alleSider, xmlSvar } from '../data/nettstedskart';
export async function GET() { return xmlSvar(await alleSider()); }
