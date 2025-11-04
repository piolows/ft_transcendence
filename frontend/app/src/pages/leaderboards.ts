import Component, { Router } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";

export default class Leaderboards extends Component {
    private navbar = new NavBar(this.router);
    private footer = new Footer(this.router);

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        app.innerHTML += `
            <main class="container mx-auto px-4 py-8">
                <div class="text-center">
                    <h1 class="text-5xl font-bold mb-12 retro-shadow">LEADERBOARDS</h1>
                    <div class="inline-block w-full max-w-4xl pixel-box bg-opacity-80 bg-blue-900 p-8">
                        <div class="space-y-6 font-vt323 text-2xl">
                            <div class="grid grid-cols-3 font-bold mb-8 px-4">
                                <span class="text-3xl retro-shadow text-left">RANK</span>
                                <span class="text-3xl retro-shadow text-center">PLAYER</span>
                                <span class="text-3xl retro-shadow text-right">POINTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-yellow-400 text-left">#1</span>
                                <span class="rainbow text-center">piolo</span>
                                <span class="text-yellow-400 text-right">9999 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-gray-300 text-left">#2</span>
                                <span class="crt-text text-center">pierce</span>
                                <span class="text-gray-300 text-right">8888 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-orange-400 text-left">#3</span>
                                <span class="crt-text text-center">emad</span>
                                <span class="text-orange-400 text-right">7777 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-blue-400 text-left">#4</span>
                                <span class="crt-text text-center">alex</span>
                                <span class="text-blue-400 text-right">6666 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-purple-400 text-left">#5</span>
                                <span class="crt-text text-center">taylor swift</span>
                                <span class="text-purple-400 text-right">5513 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-green-400 text-left">#6</span>
                                <span class="crt-text text-center">childish gambino</span>
                                <span class="text-green-400 text-right">4444 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-red-400 text-left">#7</span>
                                <span class="crt-text text-center">oprah</span>
                                <span class="text-red-400 text-right">3333 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-pink-400 text-left">#8</span>
                                <span class="crt-text text-center">dr phil</span>
                                <span class="text-pink-400 text-right">2222 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-cyan-400 text-left">#9</span>
                                <span class="crt-text text-center">ayan</span>
                                <span class="text-cyan-400 text-right">1111 PTS</span>
                            </div>
                            <div class="grid grid-cols-3 px-4">
                                <span class="text-indigo-400 text-left">#10</span>
                                <span class="crt-text text-center">the girl reaading this</span>
                                <span class="text-indigo-400 text-right">1000 PTS</span>
                            </div>
                        </div>

                        <!-- pages -->
                        <div class="mt-8 flex justify-center items-center space-x-8 font-pixelify">
                            <button class="pixel-box bg-blue-700 px-6 py-3 hover:bg-blue-600 transition-colors clicky">
                                ◄ PREV
                            </button>
                            <span class="text-xl font-vt323">Page 1 / 5</span>
                            <button class="pixel-box bg-blue-700 px-6 py-3 hover:bg-blue-600 transition-colors clicky">
                                NEXT ►
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        `;
        app.innerHTML += this.footer.get_html();
    }

    init() {
        this.navbar.init();
    }
}