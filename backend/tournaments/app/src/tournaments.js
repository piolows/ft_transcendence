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
    admin;
    // tournamentSocket = null;
    maxPlayers;
    players = {};
    matches = {};   // match uuid : game JSON object
    winner = null; // stores winner info which is: user_info object containing id/username/email/pfp
    constructor(admin, maxPlayers = 8) {
        this.uuid = shortUUID();
        this.admin = admin;
        this.maxPlayers = maxPlayers;
    }
}

// tournament routes
export const tournamentHandler = (fastify, options, done) => {
    fastify.get("/:id", async (req, reply) => {
        if (!tournaments[req.params.id])
            return reply.code(404).send({ error: "Tournament not found" });
        return reply.send(tournaments[req.params.id]);
    });

    fastify.post("/create", async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.code(403).send({ error: "Must be signed in to create a tournament" });
        const tournament = new Tournament(req.session.user, req.body.maxPlayers);
        tournaments[tournament.uuid] = tournament;
        return reply.send(`added tournament ${tournament.uuid} testing tournaments backend`);
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

    done();
}
