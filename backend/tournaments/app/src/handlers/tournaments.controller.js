// handler for any /tournament route
// /tournament/create: create a tournament body: { name, maxPlayers } returns { tournamentId }
// /tournament/join: join a tournament. body: { tournamentId, playerId } returns { success: true/false, message }
// tournament/:id: get a tournament by its id returns { tournamentId, name, maxPlayers, players: [playerId], status }

// an object that contains tournament information
// it contains the players of the tournament, the spectators 
import { tournaments, tournament_admins } from '../modules/tournaments_classes.js';
import { Tournament } from '../modules/tournaments_classes.js'; 
import { createBracket } from '../utils/utilities.js';

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
        // if (tournament_admins[req.session.user.username])
        //     return reply.send({ success: false, code: 403, error: "User already has an open tournament" });
        const tournament = new Tournament(req.body !== undefined ? req.body.roomName : "", req.session.user, req.body !== undefined ? req.body.maxPlayers : 8);
        const rooms = Math.ceil(tournament.maxPlayers / 2);
        const headers = { ...req.headers };
        fastify.log.info(`creating ${rooms} rooms`);
        // for (let i = 0; i < rooms; i++)
        // {
        //     try {
        //         headers['Content-Type'] = 'application/json';
        //         // call new game from games service
        //         const res = await fetch(process.env.GAMES_URL + '/pong/new', {
        //             method: "POST",
        //             headers: headers,
        //             // send the tournament uuid in the body
        //             body: JSON.stringify({
        //                 tournament_id: tournament.uuid
        //             })
        //         });
        //     } catch (error) {
        //         reply.send({ success: false, code: 500, error: "Failed to create game rooms"});
        //     }
        // }
        tournaments[tournament.uuid] = tournament;
        tournament_admins[req.session.user.username] = tournament.uuid;
        return reply.send({ success: true, tournamentId: tournament.uuid });
    });

    // start the tournament. the tournament id will be passed in the body
    // receive a boolean that will say whether the tournament is local or remote
    // if the tournament is local, randomly pair players and start matches
    fastify.post('/start', async(req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be an admin to start a tournament" });
        // loop through every match and send a request to make them start the match
        const tournamentId = req.body.tournamentId;
        const isLocal = typeof req.body.isLocal !== undefined ? req.body.isLocal : false;
        if (!tournaments[tournamentId])
            return reply.send({ success: false, code: 404, error: "Tournament not found" });
        const players = Object.values(tournaments[tournamentId].players);
        /* 
            create a match object for each matchup
            when created, it will randomly pair each player against each other
            each match object will consist of:
                - player 1
                - player 2
                - winner
                -(only if not local)match id
                - status (waiting, in-progress, completed)
            create different rounds of matches
         */
        // get the amount of rounds this tournament will have based on the number of players
        const rounds = Math.ceil(Math.log2(players.length));
        // for every round, push an empty object into the rounds array
        for (let i = 0; i < rounds; i++) {
            // each round will have an array of matches
        }



        // for (let i = 0; i < players.length; i += 2) {
        //     const player_1 = players[i];
        //     const player_2 = players[i + 1];

        //     const res = await fetch(process.env('GAMES_URL') + '/games/new', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json'},
        //         body: JSON.stringify({
        //             tournament_id: tournamentId           
        //         })
        //     }); 
        // }
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
        const tournamentId = req.body.tournamentId;
        const isLocal = typeof req.body.isLocal !== undefined ? req.body.isLocal : false;
        fastify.log.info(req.body);
        console.log(req.body);
        if (!isLocal && (!req.session || !req.session.user))
            return reply.send({ success: false, code: 403, error: "Must be signed in to join a tournament" });
        fastify.log.info(tournaments);
        console.log(tournaments);
        fastify.log.info(tournaments[tournamentId]);
        console.log(tournaments[tournamentId]);
        if (isLocal) {
            if (!tournaments[tournamentId].players[req.body.username]) {
                if (Object.keys(tournaments[tournamentId].players).length < tournaments[tournamentId].maxPlayers) {
                    tournaments[tournamentId].players[req.body.username] = {"username": req.body.username};
                    return reply.send({ success: true, msg: "Joined the tournament successfully"});
                } else {
                    return reply.send({ success: false, msg: "Tournament is full" });
                }
            } else {
                return reply.send( {success: false, msg: "User is already in tournament"});
            }
        } else {
            if (!tournaments[tournamentId].players[req.session.user.username]) {
                if (Object.keys(tournaments[tournamentId].players).length < tournaments[tournamentId].maxPlayers) {
                    tournaments[tournamentId].players[req.session.user.username] = req.session.user;
                    return reply.send({ success: true, msg: "Joined the tournament successfully"});
                } else {
                    return reply.send({ success: false, msg: "Tournament is full" });
                }
            }
        }
        return reply.send({ success: false, msg: "User is already in tournament" });
    });

    fastify.post('/leave', async (req, reply) => {
        if (!req.session || !req.session.user)
            return reply.send({ success: false, code: 403, error: "Must be signed in to leave a tournament" });
        const tournamentId = req.body.tournamentId;
        const tournament = tournaments[tournamentId];
        if (!tournament)
            return reply.send({ success: false, code: 404, error: "Tournament not found" });
        const user = req.session.user.username;
        if (!tournament.players[user])
            return reply.send({ success: false, code: 400, error: "User is not in the tournament" });
        delete tournament.players[user];
        return reply.send({ success: true, msg: "Left the tournament successfully" });
    });


    done();
}

// send a request to the games service to get results of a game
// send a request to the games service to create a match