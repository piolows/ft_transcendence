import Component from "../scripts/router";

export default class ListView extends Component {
	private items: Array<Array<string>> = [];
	page: number = 0;
	per_page: number = 0;
	arrows: boolean = true;
	selector: boolean = true;
	bg_color: string = "bg-white";
	text_color: string = "text-black";
	items_str: string = "items";
	borders: number = 0;

	private get_list() {
		if (this.items.length == 0)
			return '';
		let max_len = 0;
		for (let item of this.items)
			max_len = Math.max(max_len, item.length);
		const cols = `grid-cols-${max_len}`;
		const max_h = this.per_page > 0 ? `style="max-height: ${1 / this.per_page * 100}%; height: ${1 / this.per_page * 100}%;"` : ``;
		const borders = this.borders > 0 ? `border-t-${this.borders} border-b-${this.borders}` : '';
		return this.items.map((row, idx) => `
			<div id="row-${idx}" class="w-full grid ${cols} ${borders}" ${max_h}>
				${
					row.map((str, id) => {
						return `<div id="item-${idx}-${id}" class="overflow-hidden">${str}</div>`;
					}).join('')
				}
			</div>
		`).join('');
	}

	add_row(row: Array<any>) {
		this.items.push(row);
	}

	get_html() {
		return `
			<div class="flex flex-col h-full box-border m-4 mr-6 pixel-box overflow-x-auto ${this.per_page == 0 ? 'overflow-y-auto' : ''} ${this.bg_color} ${this.text_color}" style="widt: 100%;">
				${this.items.length == 0 ? `<p class="text-center">No ${this.items_str}</p>` : this.get_list()}
			</div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}
