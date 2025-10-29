import Component, { Router, backend_url } from "../scripts/router";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";

export default class Profile extends Component {
    private navbar = new NavBar(this.router);
    private footer = new Footer(this.router);

    async load(app: HTMLDivElement | HTMLElement) {
        if (!this.router.loggedin) {
            this.router.route("/login");
            return;
        }

        await this.navbar.load(app);
        app.innerHTML += `
            <main class="container mx-auto px-4 py-8">
                <!-- profile header -->
                <div class="flex items-center justify-center mb-12">
                    <div class="pixel-box bg-blue-900 p-8 w-full max-w-4xl">
                        <div class="flex items-center space-x-8">
                            <img src="${backend_url + this.router.login_info.avatarURL}" 
                                class="w-32 h-32 rounded-full pixel-box" alt="Profile Picture">
                            <div>
                                <h1 class="text-4xl font-bold rainbow mb-2">${this.router.login_info.username}</h1>
                                <p class="text-gray-400 font-silkscreen">${this.router.login_info.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <!-- Game Statistics -->
                    <div class="pixel-box bg-blue-900 p-6">
                        <h2 class="text-2xl font-bold retro-shadow mb-6">Game Statistics</h2>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="font-silkscreen">Total Games</span>
                                <span id="total-games" class="crt-text">0</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-silkscreen">Wins</span>
                                <span id="wins" class="crt-text text-green-400">0</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-silkscreen">Losses</span>
                                <span id="losses" class="crt-text text-red-400">0</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-silkscreen">Win Rate</span>
                                <span id="win-rate" class="crt-text text-yellow-400">0%</span>
                            </div>
                        </div>
                    </div>

                    <!-- recent activity -->
                    <div class="pixel-box bg-blue-900 p-6">
                        <h2 class="text-2xl font-bold retro-shadow mb-6">Recent Activity</h2>
                        <div id="recent-games" class="space-y-4">
                            <div class="text-center font-silkscreen text-gray-400">
                                No recent games
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;
        app.innerHTML += this.footer.get_html();
    }

    async init() {
        this.navbar.init();

        // all dummy data
        const totalGames = document.getElementById('total-games');
        const wins = document.getElementById('wins');
        const losses = document.getElementById('losses');
        const winRate = document.getElementById('win-rate');
        
        if (totalGames) totalGames.textContent = '42';
        if (wins) wins.textContent = '28';
        if (losses) losses.textContent = '14';
        if (winRate) winRate.textContent = '66%';

        const recentGames = document.getElementById('recent-games');
        if (recentGames) {
            const dummyGames = [
                { opponent: 'Player1', result: 'WIN', score: '10-8' },
                { opponent: 'Player2', result: 'LOSS', score: '7-10' },
                { opponent: 'Player3', result: 'WIN', score: '10-5' }
            ];

            recentGames.innerHTML = dummyGames
                .map(game => `
                    <div class="flex justify-between items-center font-silkscreen">
                        <span>${game.opponent}</span>
                        <span class="${game.result === 'WIN' ? 'text-green-400' : 'text-red-400'}">${game.result}</span>
                        <span>${game.score}</span>
                    </div>
                `).join('');
        }
    }
}