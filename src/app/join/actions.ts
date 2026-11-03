'use server';

import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import { withClanTag } from '@/config/clan';

export async function submitDossier(formData: FormData) {
  try {
    let clan = await db.orm.public.Clan.first();
    if (!clan) {
      clan = await db.orm.public.Clan.create({
        name: 'BP Black Panthers',
        tag: 'BP',
      });
    }

    const countryCode = (formData.get('countryCode') as string) || '+255';
    const whatsapp = ((formData.get('whatsapp') as string) || '').trim();
    const handle = ((formData.get('handle') as string) || '').trim();

    const selectedCountry = (formData.get('country') as string) || 'Tanzania';
    const customCountry = ((formData.get('customCountry') as string) || '').trim();
    const country = selectedCountry === 'OTHER' && customCountry ? customCountry : selectedCountry;

    const selectedRegion = (formData.get('region') as string) || 'Dar es Salaam';
    const customRegion = ((formData.get('customRegion') as string) || '').trim();
    const region = selectedRegion === 'OTHER' && customRegion ? customRegion : selectedRegion;

    const selectedClass = ((formData.get('codmClass') as string) || '').trim();
    const customClass = ((formData.get('customCodmClass') as string) || '').trim();
    const codmClass =
      selectedClass === 'OTHER'
        ? customClass || null
        : selectedClass || null;

    await db.orm.public.Member.create({
      clanId: clan.id,
      fullName: ((formData.get('fullName') as string) || '').trim(),
      codmUsername: withClanTag(handle),
      codmUid: ((formData.get('codmUid') as string) || '').trim(),
      whatsappNumber: `${countryCode}${whatsapp}`,
      deviceModel: ((formData.get('deviceModel') as string) || '').trim(),
      deviceSerial: ((formData.get('deviceSerial') as string) || '').trim(),
      country,
      region,
      preferredMode: (formData.get('preferredMode') as string) || 'Both',
      codmClass,
      profilePicture: (formData.get('profilePicture') as string) || null,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Application Submission Error:', error);
    return { error: 'Failed to submit application. Your CODM Username, UID, or WhatsApp number may already be registered.' };
  }

  redirect('/?registered=true');
}
