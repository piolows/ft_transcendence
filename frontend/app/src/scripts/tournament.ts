export default class Tournament {
	private players: Array<any> = [];
	private eliminated: Array<any> = [];
	private active: Array<Array<any>> = [];

	add_player(name?: string) {
		if (!name)
			name = `Player ${this.players.length + 1}`;
		this.players.push({
			name,
			score: 0,
			wins: 0,
			losses: 0,
			draws: 0
		});
	}

	start_round(): Array<Array<any>> {
		let selected = 0;
		let pairing: Array<any>;
		while (this.players.length > 1)
		{
			pairing = [];
			selected = Math.floor(Math.random() * this.players.length);
			pairing.push(this.players[selected]);
			this.players.slice(selected, 1);
			selected = Math.floor(Math.random() * this.players.length);
			pairing.push(this.players[selected]);
			this.players.slice(selected, 1);
			this.active.push(pairing);
		}
		return this.active;
	}
}