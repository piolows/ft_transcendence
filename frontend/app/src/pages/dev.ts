import Component from "../scripts/router";
import NavBar from "../components/nav_bar";

export default class Dev extends Component {
	private navbar = new NavBar(this.router);

	async load(app: HTMLDivElement | HTMLElement) {
		await this.navbar.load(app);
		app.innerHTML += `
			<!-- main content -->
			<main class="container mx-auto mt-8 px-4">

				<section class="mb-16">
					<h2 class="text-5xl font-bold mb-10 text-center">Effects Showcase</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<button class="bg-green-500 text-white py-2 px-4 rounded clicky">Clicky effect</button>
						<button class="bg-yellow-500 text-white py-2 px-4 rounded popout">Popout effect</button>
						<button class="bg-red-500 text-white py-2 px-4 rounded goodbye">Goodbye effect</button>
					</div>
				</section>

				<!-- text effects -->
				<section class="mb-16">
					<h2 class="text-2xl select-none font-bold mb-6 retro-shadow">Text Effects</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="text-center p-4">
							<h3 class="rainbow mb-4">Rainbow Text</h3>
							<p class="glitch text-xl mb-4">Glitch Effect (hover)</p>
							<p class="crt-text text-xl mb-4">CRT Text Effect</p>
							<p class="blinker text-xl">Blinking Text</p>
						</div>
						<div class="text-center p-4">
							<h3 class="wiggler text-xl mb-4">Wiggle Effect (hover)</h3>
							<p class="retro-shadow text-xl mb-4">Retro Shadow</p>
							<div class="overflow-hidden">
								<p class="marquee-text text-xl">Marque text like the one we saw at F1 crazy right</p>
							</div>
						</div>
					</div>
				</section>

				<!-- box styles -->
				<section class="mb-16">
					<h2 class="text-2xl font-bold mb-6 retro-shadow">Box Styles</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div class="retro-border bg-blue-900 p-6 text-center">
							<p>Retro Border Box</p>
						</div>
						<div class="pixel-box bg-blue-900 p-6 text-center">
							<p>Pixel Box Style</p>
						</div>
						<div class="scanline-effect bg-blue-900 p-6 text-center">
							<p>Scanline Effect</p> <!-- not really working -->
						</div>
					</div>
					<div class="pixel-box bg-blue-800 mt-6">
							<button id="settings-dropdown" class="w-full p-3 text-center transition-colors cursor-pointer">

								<p class="text-xs font-pixelify text-gray-300">GAME SETTINGS</p>
								<span id="toggle-icon" class="text-white text-sm">▼</span>

							</button>
							<div id="game-settings" class="hidden px-4 pb-4 space-y-4">
								<div class="retro-border p-3 bg-blue-900">
									<div class="relative mb-8">
										<p class="text-xs font-pixelify text-gray-300 mb-2 text-center">BALL SPEED</p>
										<input id="slider-name" type="range" min="0" max="10" value="5" step="1" class="w-full h-2 bg-white rounded-full appearance-none cursor-pointer">
										<span class="text-sm absolute start-0 -bottom-6">0</span>
										<span class="text-sm absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">5</span>
										<span class="text-sm absolute end-0 -bottom-6">10</span>
									</div>
									<div class="relative mb-4">
										<p class="text-xs font-pixelify text-gray-300 mb-2 text-center">PADDLE SIZE</p>
										<input id="slider-name" type="range" min="0" max="10" value="5" step="1" class="w-full h-2 bg-white rounded-full appearance-none cursor-pointer">
										<span class="text-sm absolute start-0 -bottom-6">0</span>
										<span class="text-sm absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">5</span>
										<span class="text-sm absolute end-0 -bottom-6">10</span>
									</div>
								</div>
							</div>
				</section>

				<!-- sliders -->
				<section class="mb-16">
					<h2 class="text-2xl select-none font-bold mb-6 retro-shadow">Sliders</h2>
					<div class="pixel-box p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
						<div class="relative">
							<label for="slider-name" class="block mb-2.5 text-sm">Default slider</label>
							<input id="slider-name" type="range" value="50" class="w-full h-2 bg-white rounded-full appearance-none cursor-pointer">
						</div>
						<div class="relative">
							<label for="slider-name" class="block mb-2.5 text-sm">Slider w steps and labels</label>
							<input id="slider-name" type="range" min="0" max="10" value="5" step="1" class="w-full h-2 bg-white rounded-full appearance-none cursor-pointer">
							<span class="text-sm absolute start-0 -bottom-6">0</span>
							<span class="text-sm absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">5</span>
							<span class="text-sm absolute end-0 -bottom-6">10</span>
						</div>
						<div class="relative">
							<label for="slider-name" class="block mb-2.5 text-sm">Slider disabled</label>
							<input id="slider-name" type="range" value="50" class="w-full h-2 bg-white rounded-full appearance-none cursor-pointer" disabled>
						</div>
					<div>
				</section>

				<!-- combination demos -->
				<section class="mb-16">
					<h2 class="text-2xl font-bold mb-6 retro-shadow">Combined Effects</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="pixel-box bg-blue-900 p-6 scanline-effect">
							<h3 class="rainbow wiggler mb-4">Super crazy wazy box</h3>
							<p class="crt-text">With like many effects</p>
						</div>
						<div class="retro-border bg-blue-900 p-6">
							<h3 class="glitch blinker mb-4">Crazy wazy colorzy box</h3>
							<p class="retro-shadow">With cool stuff</p>
						</div>
					</div>
				</section>

				<!-- typography -->
				<section class="mb-16">
					<h2 class="text-2xl font-bold mb-6 retro-shadow">Typography</h2>
					<div class="space-y-4">
						<h3 class="custom_header rainbow">Header Style</h3>
						<h4 class="custom_subheader crt-text">Subheader Style</h4>
						<p class="custom_text glitch">Regular Text Style</p>
						<p class="custom_smalltext retro-shadow">Small Text Style</p>
					</div>
				</section>

				
			</main>

			<footer class="text-center pb-8">
				<p class="rainbow">Footer! Goodbye.</p>
			</footer>`;
	}

	async init() {
		this.navbar.init();

		// game settings dropdown
		const toggleButton = document.getElementById('settings-dropdown');
		const content = document.getElementById('game-settings');
		const icon = document.getElementById('toggle-icon');
		
		if (toggleButton && content && icon) {
			toggleButton.addEventListener('click', () => {
				const isHidden = content.classList.contains('hidden');
				if (isHidden) {
					content.classList.remove('hidden');
					icon.textContent = '▲';
				} else {
					content.classList.add('hidden');
					icon.textContent = '▼';
				}
			});
		}
	}
}
