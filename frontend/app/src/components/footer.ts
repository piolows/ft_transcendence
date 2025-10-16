import Component, { Router } from "../scripts/router";

export default class Footer extends Component {
	constructor(router: Router) {
		super(router);
	}

	get_html() {
		return `<!-- footer -->
		<footer class="py-16 mt-20 text-center border-t border-blue-800">
			<div class="container mx-auto">
				<p class="font-silkscreen text-sm mb-6 rainbow">&copy; 2025 PONGY NATION</p>
				<div class="flex justify-center space-x-8">
					<a href="/dev" router-link>
						<button class="pixel-box bg-purple-900 p-4 font-pixelify clicky wiggler blinker">
							DEV MODE
						</button>
					</a>
				</div>
			</div>
		</footer>`;
	}

	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = this.get_html();
	}
}