import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/prisma/db';

type Role = 'SUPER_ADMIN' | 'CLAN_MASTER';
type PreferredMode = 'BR' | 'MP' | 'Both';

interface SeedMemberProfile {
  fullName: string;
  codmUsername: string;
  codmUid: string;
  whatsappNumber: string; // include country code, e.g. +2547XXXXXXXX
  deviceModel: string;
  deviceSerial: string; // last 6 characters, letters and digits
  country: string;
  region: string;
  preferredMode: PreferredMode;
  profilePicture?: string; // path under public/, e.g. /members/bp404.jpeg
  adminNotes?: string;
}

interface SeedAdmin {
  name: string;
  email: string;
  role: Role;
  isLead: boolean;
  passwordEnv: string;
  // Present only for an admin who is also a playing clan member - they'll
  // get a normal roster entry (Member) linked to their account, so they can
  // be invited to and attend tournaments like any other player.
  member?: SeedMemberProfile;
}

const admins: SeedAdmin[] = [
  {
    name: '404',
    email: '721luqman@gmail.com',
    role: 'SUPER_ADMIN',
    isLead: false,
    passwordEnv: 'SEED_SUPERADMIN_PASSWORD',
    member: {
      fullName: 'Luqman Hamza',
      codmUsername: 'ẞP.ঐ-4:0:4-',
      codmUid: '6984334395914518530',
      whatsappNumber: '+255612901039',
      deviceModel: 'Plus10T',
      deviceSerial: '546efa24',
      country: 'Tanzania',
      region: 'Zanzibar',
      preferredMode: 'Both',
      profilePicture: '/members/bp404.jpeg',
    },
  },
  {
    name: 'Guitzy',
    email: 'Khalifaumaru07@gmail.com',
    role: 'CLAN_MASTER',
    isLead: true,
    passwordEnv: 'SEED_MASTER1_PASSWORD',
    member: {
      fullName: 'Khalifa',
      codmUsername: 'ẞP.ঐGUITZY',
      codmUid: '7326055061910388737',
      whatsappNumber: '+255711634255',
      deviceModel: 'Samsung Note 20 Ultra',
      deviceSerial: '0D29XD',
      country: 'Tanzania',
      region: 'Dar es Salaam',
      preferredMode: 'Both',
      profilePicture: '/members/bpguitzy.jpeg',
    },
  },
  {
    name: 'Crady',
    email: 'candycharles515@gmail.com',
    role: 'CLAN_MASTER',
    isLead: false,
    passwordEnv: 'SEED_MASTER2_PASSWORD',
    member: {
      fullName: 'Dr. Crady',
      codmUsername: 'ẞP.ঐ.CƦɅD¥',
      codmUid: '7001568063791759361',
      whatsappNumber: '+255745793206',
      deviceModel: 'Samsung A26 5G',
      deviceSerial: '1C5ZAW',
      country: 'Tanzania',
      region: 'Dar es Salaam',
      preferredMode: 'Both',
      profilePicture: '/members/bpcrady.jpeg',
    },
  },
  {
    // Placeholder profile - Lenxon hasn't sent their real player info yet.
    // Update this block (and re-run the seed) once they do; name/email are
    // real, everything else is filler until then.
    name: 'Lenxon',
    email: 'master3@bp-panthers.com',
    role: 'CLAN_MASTER',
    isLead: false,
    passwordEnv: 'SEED_MASTER3_PASSWORD',
    member: {
      fullName: 'Lenxon',
      codmUsername: 'ẞP.ঐLENXON',
      codmUid: 'PENDING-LENXON-UID',
      whatsappNumber: 'PENDING-LENXON-WHATSAPP',
      deviceModel: 'Pending',
      deviceSerial: 'PEND',
      country: 'Pending',
      region: 'Pending',
      preferredMode: 'Both',
      profilePicture: '/members/bplenxon.jpeg',
      adminNotes: 'Placeholder profile - awaiting real player details from Lenxon.',
    },
  },
];

const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/GChzRd9x5ai12Ol94DBa7S';

async function main() {
  let clan = await db.orm.public.Clan.where({ tag: 'BP' }).first();
  if (!clan) {
    clan = await db.orm.public.Clan.create({
      name: 'BP Black Panthers',
      tag: 'BP',
      whatsappGroupLink: WHATSAPP_GROUP_LINK,
    });
    console.log(`Created clan: ${clan.name}`);
  } else if (!clan.whatsappGroupLink) {
    await db.orm.public.Clan.where({ id: clan.id }).update({ whatsappGroupLink: WHATSAPP_GROUP_LINK });
    console.log('Set clan WhatsApp group link.');
  }

  for (const admin of admins) {
    const plainPassword = process.env[admin.passwordEnv];
    if (!plainPassword) {
      throw new Error(
        `Missing ${admin.passwordEnv} in the environment. Set it (e.g. in .env, not committed) before seeding.`
      );
    }
    const hashed = await bcrypt.hash(plainPassword, 12);

    // Match the existing account by email first, falling back to name so
    // that editing an admin's email or IGN in this file (e.g. once someone
    // sends their real info) updates their existing row instead of quietly
    // creating a duplicate under the new value.
    const existingUser = (await db.orm.public.User.where({ email: admin.email }).first())
      ?? (await db.orm.public.User.where({ name: admin.name }).first());

    let memberId: string | undefined;
    if (admin.member) {
      const m = admin.member;
      const existingMember = existingUser?.memberId
        ? await db.orm.public.Member.first({ id: existingUser.memberId })
        : await db.orm.public.Member.where({ codmUsername: m.codmUsername }).first();
      if (!existingMember) {
        const created = await db.orm.public.Member.create({
          clanId: clan.id,
          fullName: m.fullName,
          codmUsername: m.codmUsername,
          codmUid: m.codmUid,
          whatsappNumber: m.whatsappNumber,
          deviceModel: m.deviceModel,
          deviceSerial: m.deviceSerial,
          country: m.country,
          region: m.region,
          preferredMode: m.preferredMode,
          profilePicture: m.profilePicture ?? null,
          adminNotes: m.adminNotes ?? null,
          status: 'ACTIVE',
        });
        memberId = created.id;
        console.log(`Created member profile for ${admin.name}: ${m.codmUsername}`);
      } else {
        await db.orm.public.Member.where({ id: existingMember.id }).update({
          fullName: m.fullName,
          codmUsername: m.codmUsername,
          codmUid: m.codmUid,
          whatsappNumber: m.whatsappNumber,
          deviceModel: m.deviceModel,
          deviceSerial: m.deviceSerial,
          country: m.country,
          region: m.region,
          preferredMode: m.preferredMode,
          profilePicture: m.profilePicture ?? null,
          adminNotes: m.adminNotes ?? null,
          status: 'ACTIVE',
        });
        memberId = existingMember.id;
        console.log(`Updated member profile for ${admin.name}: ${m.codmUsername}`);
      }
    }

    if (!existingUser) {
      await db.orm.public.User.create({
        name: admin.name,
        email: admin.email,
        password: hashed,
        role: admin.role,
        isLead: admin.isLead,
        clanId: clan.id,
        memberId: memberId ?? null,
      });
      console.log(`Created ${admin.name} <${admin.email}>`);
    } else {
      await db.orm.public.User.where({ id: existingUser.id }).update({
        name: admin.name,
        email: admin.email,
        password: hashed,
        role: admin.role,
        isLead: admin.isLead,
        clanId: clan.id,
        memberId: memberId ?? null,
      });
      console.log(`Updated ${admin.name} <${admin.email}>`);
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
