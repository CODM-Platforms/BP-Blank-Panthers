import { redirect } from 'next/navigation';

// Results are shown as part of the main tournament page once it's
// COMPLETED - no need for a separate implementation.
export default function TournamentResults({ params }: { params: { id: string } }) {
  redirect(`/tournaments/${params.id}`);
}
