import Webpage from "../scripts/router";

export default class Pong implements Webpage {
	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = 
			`<a href = "/">
				<button id="back-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-4 left-4">
					Back
				</button>
			</a>
			<h1 class="text-4xl font-bold text-blue-500 underline italic text-center mb-5">Pongoid</h1>
			<div id="p1_score" class="hidden">0</div>
			<div id="p2_score" class="hidden">0</div>
			<div id="parent-container" class="flex justify-center">
				<canvas id="gameCanvas" width="800" height="600"></canvas>
			</div>`;
	}
}