import Component, { Router } from "../scripts/router";

export default class MainTitle extends Component {
	title: string;

	constructor(router: Router, title: string = "PONGOID") {
		super(router);
		this.title = title;
	}

	get_html() {
		return `
		<div class="relative text-center py-20">
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <div class="relative">
                <h1 class="text-8xl font-bold mb-8 popout-huge">
                    <span class="retro-shadow crt-text">${ this.title }</span>
                </h1>
                <p class="text-xl font-silkscreen mb-12 rainbow">PONG ON STEROIDS!</p>
                <div class="space-y-4">
                <a href="/pong/difficulty">
                    <button class="pixel-box bg-green-500 px-8 py-4 text-xl hover:bg-green-600 clicky wiggler">
                        CLICK HERE TO PLAY INSTANTLY <!-- will go to online queue -->
                    </button> <!-- will eventually make some sound or serve some purpose idk -->
                </a>
                </div>
            </div>
        </div>`;
	}

	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}
