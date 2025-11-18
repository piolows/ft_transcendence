import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class TournamentRoom extends Component {
    private navbar = new NavBar(this.router);

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        const tournament = await this.get_info();
        app.innerHTML += `
        <h2 class="pt-16 sm:text-3xl md:text-md lg:text-4xl font-bold text-center mb-12 retro-shadow">${tournament.roomName}</h2>
        <div id="main-container" class="container pixel-box mx-auto bg-blue-900 p-8">
            
        </div>
        `
    }

    async get_info() {
        const id = this.real_path.split("/").pop();
        // get the tournament info from the backend
        try {
            const tournament = await fetch(`${backend_url}/tournaments/${id}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await tournament.json();
            if (!data.success) {
                await this.router.route_error(this.real_path, data.code, data.error);
                return ;
            }
            return data.tournament;
        } catch (error) {
            await this.router.route_error(this.real_path, 500, "Internal Server Error");
        }
    }

    async init() {
        
    }

    unload() {

    }

}