import Component from "../scripts/router";

const AUTO = 0;
const FIT = -1;

class ListViewItem {
	items: Array<any> = [];
	bg_color: string = "bg-white";
	text_color: string = "text-black";
	height: number = AUTO;
	cols: number = 0;

	constructor(list?: Array<any>) {
		if (list) {
			this.items = list;
			for (let item of list) {
				if (!item.cols || item.cols < 1)
					item.cols = 1;
				this.cols += item.cols;
			}
		}
	}

	add(value: string, col_width?: number) {
		const cols = col_width && col_width > 1 ? col_width : 1;
		this.items.push({ value, cols });
		this.cols += cols;
	}
}

export default class ListView extends Component {
	private rows: Array<ListViewItem> = [];
	page: number = 0;
	per_page: number = 0;
	arrows: boolean = true;
	selector: boolean = true;
	bg_color: string = "bg-white";
	text_color: string = "text-black";
	items_str: string = "items";
	borders: number = 0;

	add_value(value: string, row_id: number, columns?: number) {
		if (row_id > this.rows.length) {
			for (let i = this.rows.length; i < row_id; i++)
				this.rows.push(new ListViewItem());
			this.rows.push(new ListViewItem([{ value, cols: columns && columns > 1 ? columns : 1 }]));
		}
		else
			this.rows[row_id].add(value, columns);
	}

	add_row(values: Array<any>) {
		let row = [];
		for (let value of values) {
			if (typeof value == "string" || !value.cols || value.cols < 1)
				row.push({ value, cols: 1 });
			else
				row.push(value);
		}
		this.rows.push(new ListViewItem(row));
	}

	private get_list() {
		if (this.rows.length == 0)
			return '';
		let max_len = 0;
		for (let row of this.rows)
			max_len = Math.max(max_len, row.cols);
		const cols = `grid-cols-${max_len}`;
		const borders = this.borders > 0 ? `border-t-${this.borders} border-b-${this.borders}` : '';
		return this.rows.map((row, idx) => {
			let h = this.per_page <= 0 || row.height < FIT ? FIT : row.height;
			let row_h = '';
			if (h == AUTO)
				row_h = `style="max-height: ${1 / this.per_page * 100}%; height: ${1 / this.per_page * 100}%;"`;
			else if (h != FIT)
				row_h = `style="height: ${row.height}px;"`;
			return `
				<div id="row-${idx}" class="w-full grid ${cols} ${borders}" ${row_h}>
					${ row.items.map((item, id) => {
							return `<div id="item-${idx}-${id}" class="overflow-hidden cols-${item.cols}">${item.value}</div>`;
						}).join('')
					}
				</div>
		`;}).join('');
	}

	get_html() {
		
		const mid = this.rows.length == 0 ? 'items-center justify-center' : '';
		const ofy = this.per_page == 0 ? 'overflow-y-auto' : '';
		const classes = `"flex flex-col h-full box-border m-4 mr-6 pixel-box overflow-x-auto ${mid} ${ofy} ${this.bg_color} ${this.text_color}"`;
		const table_contents = this.rows.length == 0 ? `<p class="text-center">No ${this.items_str}</p>` : this.get_list();
		return `
			<div class=${classes} style="widt: 100%;">
				${table_contents}
			</div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}
