// handler for any /tournament route
// /tournament/create: create a tournament body: { name, maxPlayers } returns { tournamentId }
// /tournament/join: join a tournament. body: { tournamentId, playerId } returns { success: true/false, message }
// tournament/:id: get a tournament by its id returns { tournamentId, name, maxPlayers, players: [playerId], status }

// an object that contains tournament information
// it contains the players of the tournament, the spectators 
import { tournaments, tournament_admins } from '../modules/tournaments_classes.js';
import { Tournament } from '../modules/tournaments_classes.js'; 

// tournament routes
export const tournamentHandler = (fastify, options, done) => {
    fastify.get("/:id", async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to create a tournament" });
        if (!tournaments[req.params.id])
            return reply.send({ success: false, code: 404, error: "Tournament not found" });
        // send the tournament object as a JSON object
        fastify.log.info(`returning tournament ${req.params.id}`);
        return reply.send({ success: true, tournament: tournaments[req.params.id]});
    });

    // temporary endpoint to list all tournaments
    fastify.get('/list', async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to create a tournament" });1
        return reply.send({ success: true, tournaments: tournaments});
    })

    // this creates a tournament
    fastify.post("/create", async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to create a tournament" });
        if (tournament_admins[req.session.user.username])
            return reply.send({ success: false, code: 403, error: "User already has an open tournament" });
        const tournament = new Tournament(req.session.user, req.body !== undefined ? req.body.maxPlayers : 8);
        const rooms = Math.ceil(tournament.maxPlayers / 2);
        const headers = { ...req.headers };
        fastify.log.info(`creating ${rooms} rooms`);
        for (let i = 0; i < rooms; i++)
        {
            try {
                headers['Content-Type'] = 'application/json';
                // call new game from games service
                const res = await fetch(process.env.GAMES_URL + '/pong/new', {
                    method: "POST",
                    headers: headers,
                    // send the tournament uuid in the body
                    body: JSON.stringify({
                        tournament_id: tournament.uuid
                    })
                });
            } catch (error) {
                reply.send({ success: false, code: 500, error: "Failed to create game rooms"});
            }
        }
        tournaments[tournament.uuid] = tournament;
        tournament_admins[req.session.user.username] = tournament.uuid;
        return reply.send({ success: true, tournamentId: tournament.uuid });
    });

    // start the tournament. the tournament id will be passed in the body
    fastify.post('/start', async(req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to create a tournament" });
        // loop through every match and send a request to make them start the match
        const tournamentId = req.body.tournamentId;
        if (!tournaments[tournamentId])
            return reply.send({ success: false, code: 404, error: "Tournament not found" });
        const players = Object.values(tournaments[tournamentId].players);
        for (let i = 0; i < players.length; i += 2) {
            const player_1 = players[i];
            const player_2 = players[i + 1];

            const res = await fetch(process.env('GAMES_URL') + '/games/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    tournament_id: tournamentId           
                })
            }); 
        }
        return reply.send({ success: true });
    });

    fastify.delete("/:id", async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to create a tournament" });
        if (req.params.id && tournaments[req.params.id]) {
            delete tournament_admins[tournaments[req.params.id].adminInfo.username];
            delete tournaments[req.params.id];
            return reply.send({ success: false, status: "deleted" });
        }
        return reply.send({ success: true, status: "accepted" });
    });


    fastify.post("/join", async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to create a tournament" });
        // body would contain as player: true, false
        return reply.send({ success: true, msg: "testing tournaments backend" });
    });


    done();
}

// send a request to the games service to get results of a game
// send a request to the games service to create a match