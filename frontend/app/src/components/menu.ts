import menu_card from "./menu_card";

export default function menu(info: any, title?: string) { // str str a
	// let cards: Array<string> = [];
	// info.forEach(element => {
	// 	cards.push(menu_card(element[0], element[1], element.length > 2 ? element[2] : "#"));
	// });
	let cards = "";
	for (let i = 0; i < info.length; i++) {
		cards += menu_card(info[i][0], info[i][1], info[i][2], info[i][3] ?? []);
	}
	return `<!-- selection grid -->
		${title ? `<div class="py-16">
            <h2 class="text-4xl font-bold text-center mb-12 retro-shadow">${title}</h2>` : ""}
		<div class="center grid grid-cols-1 sm:grid-cols-${info.length >= 2 ? 2 : info.length} lg:grid-cols-${info.length >= 3 ? 3 : info.length} gap-8">
			${cards}
			${title ? `</div>` : ""}
        </div>`;
}