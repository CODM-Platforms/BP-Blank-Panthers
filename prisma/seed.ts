import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/prisma/db';

type Role = 'SUPER_ADMIN' | 'CLAN_MASTER';
type PreferredMode = 'BR' | 'MP' | 'Both';

interface SeedMemberProfile {
  fullName: string;
  codmUsername: string;
  codmUid: string;
  playerId: string;
  whatsappNumber: string; // include country code, e.g. +2547XXXXXXXX
  deviceModel: string;
  deviceSerial: string; // last 4 digits only
  country: string;
  region: string;
  preferredMode: PreferredMode;
  profilePicture?: string; // path under public/, e.g. /members/bp404.jpeg
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

// The lead clan master's identity is the one shown on every member approval,
// regardless of which clan master actually clicks approve.
const admins: SeedAdmin[] = [
  {
    name: 'Luqman Hamza',
    email: '721luqman@gmail.com',
    role: 'SUPER_ADMIN',
    isLead: false,
    passwordEnv: 'SEED_SUPERADMIN_PASSWORD',
    member: {
      fullName: 'Luqman Hamza',
      codmUsername: 'ẞP.ঐ-4:0:4-',
      codmUid: '6984334395914518530',
      playerId: '404',
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
    name: 'Khalifa',
    email: 'Khalifaumaru07@gmail.com',
    role: 'CLAN_MASTER',
    isLead: true,
    passwordEnv: 'SEED_MASTER1_PASSWORD',
    member: {
      fullName: 'Khalifa',
      codmUsername: 'ẞP.ঐGUITZY',
      codmUid: '7326055061910388737',
      playerId: 'GUITZY',
      whatsappNumber: '+255711634255',
      deviceModel: 'Samsung Note 20 Ultra',
      deviceSerial: '0D29XD',
      country: 'Tanzania',
      region: 'Dar es Salaam',
      preferredMode: 'Both',
      profilePicture: '/members/bpguitzy.jpeg',
    },
  },
  { name: 'Clan Master Two', email: 'master2@bp-panthers.com', role: 'CLAN_MASTER', isLead: false, passwordEnv: 'SEED_MASTER2_PASSWORD' },
  { name: 'Clan Master Three', email: 'master3@bp-panthers.com', role: 'CLAN_MASTER', isLead: false, passwordEnv: 'SEED_MASTER3_PASSWORD' },
];

async function main() {
  let clan = await db.orm.public.Clan.where({ tag: 'BP' }).first();
  if (!clan) {
    clan = await db.orm.public.Clan.create({ name: 'BP Black Panthers', tag: 'BP' });
    console.log(`Created clan: ${clan.name}`);
  }

  for (const admin of admins) {
    const plainPassword = process.env[admin.passwordEnv];
    if (!plainPassword) {
      throw new Error(
        `Missing ${admin.passwordEnv} in the environment. Set it (e.g. in .env, not committed) before seeding.`
      );
    }
    const hashed = await bcrypt.hash(plainPassword, 12);

    let memberId: string | undefined;
    if (admin.member) {
      const m = admin.member;
      const existingMember = await db.orm.public.Member.where({ codmUsername: m.codmUsername }).first();
      if (!existingMember) {
        const created = await db.orm.public.Member.create({
          clanId: clan.id,
          fullName: m.fullName,
          codmUsername: m.codmUsername,
          codmUid: m.codmUid,
          playerId: m.playerId,
          whatsappNumber: m.whatsappNumber,
          deviceModel: m.deviceModel,
          deviceSerial: m.deviceSerial,
          country: m.country,
          region: m.region,
          preferredMode: m.preferredMode,
          profilePicture: m.profilePicture ?? null,
          status: 'ACTIVE',
        });
        memberId = created.id;
        console.log(`Created member profile for ${admin.name}: ${m.codmUsername}`);
      } else {
        await db.orm.public.Member.where({ id: existingMember.id }).update({
          fullName: m.fullName,
          codmUid: m.codmUid,
          playerId: m.playerId,
          whatsappNumber: m.whatsappNumber,
          deviceModel: m.deviceModel,
          deviceSerial: m.deviceSerial,
          country: m.country,
          region: m.region,
          preferredMode: m.preferredMode,
          profilePicture: m.profilePicture ?? null,
          status: 'ACTIVE',
        });
        memberId = existingMember.id;
        console.log(`Updated member profile for ${admin.name}: ${m.codmUsername}`);
      }
    }

    const existingUser = await db.orm.public.User.where({ email: admin.email }).first();
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
