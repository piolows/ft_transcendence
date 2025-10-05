import menu_card from "./menu_card";

export default function menu(info: Array<Array<string>>) {
	let cards: Array<string> = [];
	info.forEach(element => {
		cards.push(menu_card(element[0], element[1], element.length > 2 ? element[2] : "#"));
	});

	return `<!-- selection grid -->
        <div class="center grid grid-cols-1 md:grid-cols-${info.length >= 3 ? 3 : info.length} gap-8 mt-16 lg:mr-35 lg:ml-35 popout">
			${ cards.join('\n') }
        </div>`;
}