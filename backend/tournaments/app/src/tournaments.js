// handler for any /tournament route
// /tournament/create: create a tournament body: { name, maxPlayers } returns { tournamentId }
// /tournament/join: join a tournament. body: { tournamentId, playerId } returns { success: true/false, message }
// tournament/:id: get a tournament by its id returns { tournamentId, name, maxPlayers, players: [playerId], status }

class tournament {
    uuid;
    tournamentId;
    adminId;
    tournamentSocket = null;
    maxPlayers = 8;
    players = {};   // contains player username : user_info object
    matches = {};   // match uuid : match object 
    winner = {}; // stores winner info which is: user_info object containing id/username/email/pfp
    constructor(tournamentId, adminId, tournamentSocket) {
        this.tournamentId = tournamentId
        this.adminId = adminId
        this.tournamenSocket = tournamentSocket
    }
}

// tournament routes
export async function tournamentHandler(fastify, options, done)
{
    fastify.get('/:id', (req, reply) => {
        return reply.send('testing tournaments backend');
    });

    fastify.post('/create', (req, reply) => {
        return reply.send('testing tournaments backend');
    });


    fastify.post('/join', (req, reply) => {
        return reply.send('testing tournaments backend');
    });

    fastify.get('/list', (req, reply) => {
        return reply.send('testing tournaments backend');
    });

    done();
}
