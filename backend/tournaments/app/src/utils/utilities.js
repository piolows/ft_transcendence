import { Tournament } from "../modules/tournaments_classes.js";

export function createBracket(players) {
    const rounds = [];
    let currentRound = [...players];
    
    // Calculate number of rounds needed (log2 of player count)
    const numRounds = Math.ceil(Math.log2(players.length));
    
    for (let round = 0; round < numRounds; round++) {
        const matches = [];
        
        // Pair players for this round
        for (let i = 0; i < currentRound.length; i += 2) {
            if (i + 1 < currentRound.length) {
                matches.push({
                    player1: currentRound[i],
                    player2: currentRound[i + 1],
                    roundNumber: round + 1
                });
            } else {
                // Bye (odd number of players, last player advances automatically)
                matches.push({
                    player1: currentRound[i],
                    player2: null,
                    roundNumber: round + 1
                });
            }
        }
        
        rounds.push({
            roundNumber: round + 1,
            matches: matches
        });
        
        // Winners advance to next round (placeholder for now)
        currentRound = matches.map(match => match.player1);
    }
    
    return rounds;
}