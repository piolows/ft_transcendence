import Component from "../scripts/router";
import NavBar from "../components/nav_bar";
import { backend_url } from "../scripts/router";

export default class TournamentRoom extends Component {
    private navbar = new NavBar(this.router);

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        // console.log('in tournament room path');
        await this.get_info();
    }

    async get_info() {
        // fetch the tournament from the backend to get its info
        console.log(`tournament uri ${this.real_path}`);
        // get the id from the url
        // let res = await fetch(`${backend_url}/tournaments/`)
    }

    async init() {

    }

    unload() {

    }

}