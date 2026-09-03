import { wedding } from '@/lib/wedding-config';
import { rsvpOpen } from '@/lib/rsvp-domain';
import { json } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){return json({wedding,rsvpOpen:rsvpOpen(wedding.rsvp)});}
