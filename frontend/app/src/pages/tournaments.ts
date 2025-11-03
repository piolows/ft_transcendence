import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { Router, backend_url } from "../scripts/router";

export default class Tournament extends Component {
    private navbar = new NavBar(this.router);
    private items = [];

    // constructor(router: Router) {
    //     super(router);


    // }

    async load (app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        // load the navbar 
        app.innerHTML += `
            <div class="container mx-auto px-4">

        <div class="py-16 h-100" id="main-container">
            <h2 class="text-4xl font-bold text-center mb-12 retro-shadow">Tournaments</h2>

            <div class="pixel-box bg-opacity-80 bg-blue-900 p-8 grid gap-y-5" id="tournament-list">

                <div class="tournament-item grid grid-cols-3">
                    <div class="crt-text flex flex-col">
                        <p class="inline text-[32px]">Emad's room</p>
                        <p class="player-count text-green-300 inline">1/16 players</p>
                    </div>
                    <div class="join-button inline pixel-box bg-green-500 px-4 py-2 hover:bg-green-600 col-start-4 clicky w-60">
                        JOIN
                </div>
            </div>

                <div class="tournament-item grid grid-cols-3">
                    <div class="crt-text flex flex-col">
                        <p class="inline text-[32px]">Piolo's room</p>
                        <p class="player-count text-green-300 inline">3/16 players</p>
                    </div>
                    <div class="join-button inline pixel-box bg-green-500 px-4 py-2 hover:bg-green-600 col-start-4 clicky w-60">
                        <p>
                            JOIN
                        </p>
                    </div>
                </div>

                <div class="tournament-item grid grid-cols-3">
                    <div class="crt-text flex flex-col">
                        <p class="inline text-[32px]">Piolo's room</p>
                        <p class="player-count text-red-500 inline">16/16 players</p>
                    </div>
                    <div class="join-button inline pixel-box bg-green-500 px-4 py-2 hover:bg-green-600 col-start-4 clicky w-60">
                        JOIN
                    </div>
                </div>

                <div class="flex flex-row justify-center">
                    <!-- navigate to next page -->
                    <button class="mx-5 shadow-md/30 bg-blue-600 hover:bg-blue-700 clicky"><</button>

                    <p>1/5</p>

                    <button class="mx-5 shadow-md/30 bg-blue-600 hover:bg-blue-700 clicky">></button>
                </div>
        </div>

    </div>
        `
    }

    async init() {
        this.navbar.init();
        // this method will fetch tournament info from backend
        let data = null;
        try {
            let info = await fetch(backend_url + "/tournaments/list", {
                method: "GET",
                credentials: "include"
            })
            data = await info.json();
        }
        catch (error) {
            console.error("Failed to fetch tournament info:", error);
        }
        if (data !== null)
        {
            this.items = data.tournaments;
            console.log(this.items);
        }
    }
}