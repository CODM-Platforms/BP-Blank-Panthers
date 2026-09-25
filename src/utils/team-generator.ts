/**
 * Auto Team Generator Algorithm
 * 
 * Takes an array of confirmed participants and chunks them into 
 * squads based on the required team size (e.g., 4 for BR, 5 for MP).
 */

export interface Participant {
  id: string;
  name: string;
  codmUsername: string;
}

export function generateTeams(participants: Participant[], teamSize: number) {
  // 1. Shuffle participants for randomness (Optional: you can order by rank instead)
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  const totalPlayers = shuffled.length;
  const numberOfTeams = Math.floor(totalPlayers / teamSize);
  const remainder = totalPlayers % teamSize;
  
  const teams = [];
  
  // 2. Generate Full Squads
  for (let i = 0; i < numberOfTeams; i++) {
    const startIndex = i * teamSize;
    const squadMembers = shuffled.slice(startIndex, startIndex + teamSize);
    
    teams.push({
      name: `Squad ${i + 1}`,
      members: squadMembers.map((p, index) => ({
        ...p,
        seatNumber: index + 1 // Seat 1, Seat 2, etc.
      }))
    });
  }
  
  // 3. Handle leftover players who didn't fit into a complete squad
  const unassigned = remainder > 0 ? shuffled.slice(numberOfTeams * teamSize) : [];

  return {
    teams,
    unassigned,
    metrics: {
      totalConfirmed: totalPlayers,
      squadsCreated: numberOfTeams,
      playersLeftOver: remainder
    }
  };
}
