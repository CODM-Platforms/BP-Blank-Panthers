'use server'

import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';

export async function submitDossier(formData: FormData) {
  try {
    let clan = await db.orm.public.Clan.first();
    if (!clan) {
      clan = await db.orm.public.Clan.create({
        name: 'BP Black Panthers',
        tag: 'BP',
      });
    }

    const countryCode = formData.get('countryCode') as string;
    const whatsapp = formData.get('whatsapp') as string;

    await db.orm.public.Member.create({
      clanId: clan.id,
      fullName: formData.get('fullName') as string,
      codmUsername: formData.get('codmUsername') as string,
      codmUid: formData.get('codmUid') as string,
      playerId: formData.get('playerId') as string,
      whatsappNumber: `${countryCode}${whatsapp}`,
      deviceModel: formData.get('deviceModel') as string,
      deviceSerial: formData.get('deviceSerial') as string,
      country: formData.get('country') as string,
      region: formData.get('region') as string,
      preferredMode: formData.get('preferredMode') as string,
      profilePicture: (formData.get('profilePicture') as string) || null,
      status: 'PENDING',
    });

  } catch (error) {
    console.error("Dossier Submission Error:", error);
    return { error: 'Failed to submit dossier. UID or Callsign might already be registered.' };
  }

  // Redirect to success page or just home
  redirect('/?registered=true');
}
