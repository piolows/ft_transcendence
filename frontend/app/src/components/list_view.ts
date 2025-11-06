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
	rows: Array<ListViewItem> = [];
	page: number = 0;
	per_page: number = 0;
	arrows: boolean = true;
	selector: boolean = true;
	bg_color: string = "bg-white";
	text_color: string = "text-black";
	items_str: string = "items";
	borders: number = 0;

	add_value(value: string, row_id: number, columns?: number) {
		if (row_id >= this.rows.length) {
			for (let i = this.rows.length; i < row_id; i++)
				this.rows.push(new ListViewItem());
			this.rows.push(new ListViewItem([{ value, cols: columns && columns > 1 ? columns : 1 }]));
		}
		else
			this.rows[row_id].add(value, columns);
	}

	add_row(values: Array<any>, opts?: any) {
		let row = [];
		for (let value of values) {
			if (typeof value == "string" || !value.cols || value.cols < 1)
				row.push({ value, cols: 1 });
			else
				row.push(value);
		}
		const lvi = new ListViewItem(row);
		if (opts) {
			opts.height && (lvi.height = opts.height);
			opts.bg_color && (lvi.bg_color = opts.bg_color);
			opts.text_color && (lvi.text_color = opts.text_color);
		}
		if (!opts?.bg_color)
			lvi.bg_color = this.bg_color;
		if (!opts?.text_color)
			lvi.text_color = this.text_color;
		this.rows.push(lvi);
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
				<div id="row-${idx}" class="w-full grid grid-flow-col auto-cols-fr p-2 ${row.bg_color} ${row.text_color} ${cols} ${borders}" ${row_h}>
					${ row.items.map((item, id) => {
							return `<div id="item-${idx}-${id}" class="col-span-${item.cols}">${item.value}</div>`;
						}).join('')
					}
				</div>
		`;}).join('');
	}

	get_html() {
		const mid = this.rows.length == 0 ? 'items-center justify-center' : '';
		const ofy = this.per_page == 0 ? 'overflow-y-auto' : '';
		const classes = `"h-full pixel-box m-4 mr-8 ${mid} ${ofy} ${this.bg_color} ${this.text_color}"`;
		const table_contents = this.rows.length == 0 ? `<div class="h-full w-full flex justify-center items-center"><p class="text-center">No more ${this.items_str}</p></div>` : this.get_list();
		return `
			<div class=${classes}>
				${table_contents}
			</div>`;
	}

	async load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}
