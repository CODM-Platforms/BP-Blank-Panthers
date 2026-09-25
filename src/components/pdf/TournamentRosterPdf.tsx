import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const ACCENT = '#E8262C';
const DARK = '#111318';
const MUTED = '#5b6270';

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: DARK },

  headerRow: { flexDirection: 'row', alignItems: 'center', borderBottom: `3 solid ${ACCENT}`, paddingBottom: 12, marginBottom: 20 },
  logo: { width: 44, height: 44, borderRadius: 6, marginRight: 12 },
  clanName: { fontSize: 16, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  clanSubtitle: { fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  genDate: { marginLeft: 'auto', fontSize: 8, color: MUTED, textAlign: 'right' },

  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 4 },
  meta: { fontSize: 10, color: MUTED, marginBottom: 18 },

  statsRow: { flexDirection: 'row', marginBottom: 22 },
  statBox: { flex: 1, backgroundColor: '#fdecec', borderLeft: `3 solid ${ACCENT}`, borderRadius: 4, padding: 10, marginRight: 10 },
  statValue: { fontSize: 20, fontFamily: 'Helvetica-Bold' },
  statLabel: { fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  teamHeading: { backgroundColor: DARK, color: ACCENT, fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, padding: 7, marginTop: 16, marginBottom: 10, borderRadius: 3 },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { width: '48%', border: '1 solid #e2e5df', borderRadius: 6, padding: 10, marginBottom: 10, marginRight: '2%', flexDirection: 'row' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, marginRight: 8, backgroundColor: '#eef1e8' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  cardIgn: { fontSize: 9, color: ACCENT, fontFamily: 'Helvetica-Bold', marginTop: 1 },
  cardRow: { flexDirection: 'row', marginTop: 3 },
  cardLabel: { fontSize: 7, color: MUTED, width: 52, textTransform: 'uppercase' },
  cardValue: { fontSize: 8, flex: 1 },

  footer: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTop: '1 solid #e2e5df', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: MUTED },
});

interface Participant {
  member: {
    fullName: string;
    codmUsername: string;
    codmUid: string;
    deviceModel: string;
    whatsappNumber: string;
    country: string;
    region: string;
    profilePicture: string | null;
  };
  team: { name: string } | null;
}

interface Props {
  clanName: string;
  clanTag: string;
  logoUrl: string | null;
  tournamentName: string;
  tournamentDate: string;
  tournamentMode: string;
  participants: Participant[];
  generatedAt: string;
}

export default function TournamentRosterPdf({
  clanName,
  clanTag,
  logoUrl,
  tournamentName,
  tournamentDate,
  tournamentMode,
  participants,
  generatedAt,
}: Props) {
  const teamGroups = new Map<string, Participant[]>();
  for (const p of participants) {
    const key = p.team?.name ?? 'Unassigned';
    if (!teamGroups.has(key)) teamGroups.set(key, []);
    teamGroups.get(key)!.push(p);
  }
  const teamCount = Array.from(teamGroups.keys()).filter((k) => k !== 'Unassigned').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <View>
            <Text style={styles.clanName}>{clanName}</Text>
            <Text style={styles.clanSubtitle}>{clanTag} · Elite CODM Division</Text>
          </View>
          <Text style={styles.genDate}>Generated{'\n'}{generatedAt}</Text>
        </View>

        <Text style={styles.title}>{tournamentName}</Text>
        <Text style={styles.meta}>{tournamentDate} · {tournamentMode}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{participants.length}</Text>
            <Text style={styles.statLabel}>Confirmed Players</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{teamCount}</Text>
            <Text style={styles.statLabel}>Squads Formed</Text>
          </View>
        </View>

        {Array.from(teamGroups.entries()).map(([teamName, members]) => (
          <View key={teamName} wrap={false}>
            <Text style={styles.teamHeading}>{teamName}</Text>
            <View style={styles.cardGrid}>
              {members.map((p, i) => (
                <View key={i} style={styles.card}>
                  {p.member.profilePicture ? (
                    <Image src={p.member.profilePicture} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName}>{p.member.fullName}</Text>
                    <Text style={styles.cardIgn}>{p.member.codmUsername}</Text>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>UID</Text>
                      <Text style={styles.cardValue}>{p.member.codmUid}</Text>
                    </View>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>WhatsApp</Text>
                      <Text style={styles.cardValue}>{p.member.whatsappNumber}</Text>
                    </View>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Device</Text>
                      <Text style={styles.cardValue}>{p.member.deviceModel}</Text>
                    </View>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Location</Text>
                      <Text style={styles.cardValue}>{p.member.region}, {p.member.country}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{clanName} — Tactical Directives Enforced</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
