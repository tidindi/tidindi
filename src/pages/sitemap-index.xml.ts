import { indeks, xmlSvar } from '../data/nettstedskart';
export async function GET() { return xmlSvar(await indeks()); }
