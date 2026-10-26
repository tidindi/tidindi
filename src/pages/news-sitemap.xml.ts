import { nyheter, xmlSvar } from '../data/nettstedskart';
export async function GET() { return xmlSvar(await nyheter()); }
