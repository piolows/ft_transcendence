const colors: any = {
	blue: ["bg-blue-900", "text-blue-300", "bg-blue-500"], 
	green: ["bg-green-900", "text-green-300", "bg-green-500"],
	purple: ["bg-purple-900", "text-purple-300", "bg-purple-500"],
	red: ["bg-red-900", "text-red-300", "bg-red-500"],
	yellow: ["bg-yellow-900", "text-yellow-300", "bg-yellow-500"],
	orange: ["bg-orange-900", "text-orange-300", "bg-orange-500"],
	cyan: ["bg-cyan-900", "text-cyan-300", "bg-cyan-500"],
	pink: ["bg-pink-900", "text-pink-300", "bg-pink-500"],
	teal: ["bg-teal-900", "text-teal-300", "bg-teal-500"],
	gray: ["bg-gray-900", "text-gray-300", "bg-gray-500"],
	white: ["bg-white/10", "text-black", "bg-white/20"]
}

export default function menu_card(title: string, desc: string, color: string, buttons?: Array<Array<string>>) {
	let ret = `<div class="pixel-box bg-opacity-80 ${colors[color][0]} p-8 text-center group hover:transform hover:scale-105 transition-all popout">
                    <h3 class="text-xl font-pressstart ${colors[color][1]} mb-4">${title}</h3>
                    <p class="font-silkscreen mb-6">${desc}</p>`;

	if (buttons && buttons.length > 0) {
		for (let i = 0; i < buttons.length; i++) {
			ret += `<a href="${buttons[i][1]}">
                        <button class="${colors[color][2]} text-white px-6 py-3 rounded clicky font-pixelify group-hover:animate-pulse">
                            ${buttons[i][0]}
                        </button>
                    </a>`;
		}
	}
    ret += `</div>`;
	return ret;
}