import Component, { Router } from "../scripts/router";
import MenuCard from "./menu_card";

export default class Menu extends Component {
	title?: string;
	cards: Array<MenuCard> = [];

	constructor(router: Router, title?: string) {
		super(router);
		if (title)
			this.title = title;
	}

	add_card(card: MenuCard) {
		this.cards.push(card);
	}

	new_card(title: string, desc: string, color: string) {
		this.cards.push(new MenuCard(this.router, title, desc, color));
	}

	get_html() {
		if (this.cards.length == 0)
			return '';
		let cards_html = "";
		for (let card of this.cards) {
			cards_html += card.get_html();
		}
		const cols = this.cards.length >= 3 ? 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1'
			: this.cards.length === 2 ? 'md:grid-cols-2 grid-cols-1'
			: 'grid-cols-1';
		return `
			<!-- selection grid -->
				${ this.title ? `
			<div class="py-16">
				<h2 class="text-4xl font-bold text-center mb-12 retro-shadow">${ this.title }</h2>` : "" }
				<div class="grid ${cols} gap-8 justify-center mr-4">
					${ cards_html }
					${ this.title ? `</div>` : "" }
			</div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}
