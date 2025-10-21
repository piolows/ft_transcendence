// handler for any /tournament route
// /tournament/create: create a tournament body: { name, maxPlayers } returns { tournamentId }
// /tournament/join: join a tournament. body: { tournamentId, playerId } returns { success: true/false, message }
// tournament/:id: get a tournament by its id returns { tournamentId, name, maxPlayers, players: [playerId], status }

function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

class Tournament {
    uuid;
    tournamentId;
    adminId;
    tournamentSocket = null;
    maxPlayers = 8;
    players = {};   // contains player username : user_info object
    matches = {};   // match uuid : game object
    winner = {}; // stores winner info which is: user_info object containing id/username/email/pfp
    constructor(tournamentId, adminId, tournamentSocket) {
        this.uuid = shortUUID();
        this.tournamentId = tournamentId
        this.adminId = adminId
        this.tournamenSocket = tournamentSocket
    }
}

// tournament routes
export const tournamentHandler = (fastify, options, done) => {
    let tournaments = {}; // tournamentId : tournament object

    fastify.get("/:id", async (req, reply) => {
        return reply.send("testing tournaments backend");
    });

    fastify.post("/create", async (req, reply) => {
        const tournament = new Tournament();
        tournaments[tournament.uuid] = tournament;
        return reply.send("testing tournaments backend");
    });


    fastify.post("/join", async (req, reply) => {
        return reply.send("testing tournaments backend");
    });

    fastify.get("/list", async (req, reply) => {
        return reply.send("testing tournaments backend");
    });

    done();
}
