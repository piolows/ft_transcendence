import menu_card from "./menu_card";

export default function sect_menu() {
	const pong_card = menu_card("Pong Game", "Play the recreation of the classic pong game from 1985.", "/pong");
	const tournamnets_card = menu_card("Tournaments", "Compete for the top spot in a multiple-round elimination-style tournament!");
	const roshambo_card = menu_card("Roshambo Game", "Challenge your opponent in a 1 on 1 game of Rock, Paper, Scissors.");
	return `<!-- selection grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 lg:mr-35 lg:ml-35 popout">
			${roshambo_card}
			${tournamnets_card}
			${pong_card}
        </div>`;
}