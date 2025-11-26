import { randomUUID } from "crypto";

export var tournaments = {}; // uuid : tournament_object
export var tournament_admins = {}; // username : tournament_uuid

function shortUUID() {
  return randomUUID().replace(/-/g, "").slice(0, 5);
}


export class Tournament {
    uuid;
    game_uuid;  // this uuid is to associate a game object with this tournament
    roomName;
    adminInfo;
    maxPlayers;
    status;
    players = {};
    matches = {};   // match uuid : game JSON object
    rounds = [];  // array of arrays of match uuids/match objects
    winner = null; // stores winner info which is: user_info object containing id/username/email/pfp
    constructor(roomName, adminInfo, maxPlayers = 8, status="waiting") {
        this.uuid = shortUUID();
        this.game_uuid = shortUUID();   // this uuid will be sent to the games service to create a game for this tournament
        this.adminInfo = adminInfo;
        this.maxPlayers = maxPlayers;
        this.roomName = roomName == "" ? `${adminInfo.username}'s Room` : roomName;
        this.status = status;
    }
}

