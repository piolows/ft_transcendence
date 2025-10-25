// handler for any /tournament route
// /tournament/create: create a tournament body: { name, maxPlayers } returns { tournamentId }
// /tournament/join: join a tournament. body: { tournamentId, playerId } returns { success: true/false, message }
// tournament/:id: get a tournament by its id returns { tournamentId, name, maxPlayers, players: [playerId], status }

// an object that contains tournament information
// it contains the players of the tournament, the spectators 
function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

var tournaments = {}; // uuid : tournament_object

class Tournament {
    uuid;
    game_uuid;  // this uuid is to associate a game object with this tournament
    admin;
    maxPlayers;
    players = {};
    matches = {};   // match uuid : game JSON object
    winner = null; // stores winner info which is: user_info object containing id/username/email/pfp
    constructor(admin, maxPlayers = 8) {
        this.uuid = shortUUID();
        this.game_uuid = shortUUID();   // this uuid will be sent to the games service to create a game for this tournament
        this.admin = admin;
        this.maxPlayers = maxPlayers;
    }
}

// tournament routes
export const tournamentHandler = (fastify, options, done) => {
    fastify.get("/:id", async (req, reply) => {
        if (!tournaments[req.params.id])
            return reply.code(404).send({ error: "Tournament not found" });
        // send the tournament object as a JSON object

        return reply.send(tournaments[req.params.id]);
    });

    // this creates a tournament
    fastify.post("/create", async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.code(403).send({ error: "Must be signed in to create a tournament" });
        const tournament = new Tournament(req.session.user, req.body.maxPlayers);
        tournaments[tournament.uuid] = tournament;
        return reply.code(200).send({ status: 'success', tournamentId: tournament.uuid });
        // return reply.send(`added tournament ${tournament.uuid} testing tournaments backend`);
    });

    // start the tournament. the tournament id will be passed in the body
    fastify.post('/start', async(req, reply) => {
        // loop through every match and send a request to make them start the match
        const tournamentId = req.body.tournamentId;
        if (!tournaments[tournamentId])
            return reply.code(404).send({ error: "Tournament not found" });
        const players = Object.values(tournaments[tournamentId].players);
        for (let i = 0; i < players.length; i += 2) {
            const player_1 = players[i];
            const player_2 = players[i + 1];

            const res = await fetch(process.env('GAMES_URL') + '/games/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'}
                body: JSON.stringify({
                    
                })
            }); 
        }
    });

    fastify.delete("/:id", async (req, reply) => {

        // return reply.send("testing tournaments backend");
    });


    fastify.post("/join", async (req, reply) => {
        // body would contain as player: true, false
        return reply.send("testing tournaments backend");
    });

    fastify.get("/list", async (req, reply) => {
        return reply.send("testing tournaments backend");
    });

    fastify.post('/start', async (req, reply) => {
        
    });

    done();
}

// send a request to the games service to get results of a game
// send a request to the games service to create a match