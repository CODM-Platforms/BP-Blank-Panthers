// This utility talks to our custom local WhatsApp Bot Server (running on port 3001)

export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const response = await fetch('http://localhost:3001/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bot server responded with status: ${response.status}`);
    }

    console.log(`Successfully queued message to ${phoneNumber}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to reach WhatsApp bot server:`, error);
    return { success: false, error };
  }
}

export async function sendApprovalMessage(phoneNumber: string, playerName: string) {
  const groupLink = "https://chat.whatsapp.com/GChzRd9x5ai12Ol94DBa7S";
  
  const message = `
🎮 *WELCOME TO BLACK PANTHERS CODM* 🐾

Hello ${playerName},
Congratulations! Your clan registration has been *APPROVED* by the Clan Master.

*WHAT YOU NEED TO DO NEXT:*
1️⃣ Click the link below to join our official WhatsApp Group.
2️⃣ Once you join, please introduce yourself to the members.
3️⃣ Make sure you have the *ẞP.ঐ* tag in your CODM username!

*JOIN THE CLAN GROUP HERE:*
${groupLink}

Welcome to the family!
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
}

export async function sendTournamentInvite(phoneNumber: string, playerName: string, tournamentName: string, confirmLink: string) {
  const message = `
⚠️ *NEW TOURNAMENT ALERT* ⚠️

Hello ${playerName},
The Clan Master has scheduled a new tournament: *${tournamentName}*.

You have been selected to participate. We need you to confirm your attendance so we can assign your Squad.

*CLICK HERE TO CONFIRM OR DECLINE:*
${confirmLink}

_Please respond as soon as possible to avoid losing your slot._
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
}
