export default function menu_card(title: string, desc: string, url?: string) {
	return `<a href="${url ?? "#"}" >
				<div class="text-center p-7 bg-white rounded-lg shadow-lg clicky" style="min-height: 188px;">
					<h3 class="text-xl font-bold text-blue-500 mb-2 clicky">${title}</h3>
					<p>${desc}</p>
				</div>
            </a>`;
}