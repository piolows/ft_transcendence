import Component from "../scripts/router";
import NavBar from "../components/nav_bar";

export default class Tournament extends Component {
    private navbar = new NavBar(this.router);
    private players: string[] = [];

    async load(app: HTMLDivElement | HTMLElement) {
        await this.navbar.load(app);
        // make a main container
        const main_container = document.createElement("div");
        main_container.className = "container mx-auto px-4 pixel-box h-full";

        const title_container = document.createElement("div");
        title_container.className = "py-16";
        const title = document.createElement("h1");
        title.className = "text-4xl font-bold text-center mb-12 retro-shadow";
        title.innerText = "TOURNAMENTS";
        title_container.appendChild(title);

        app.appendChild(title_container);
        app.appendChild(main_container);
        
        // add an input box in the main container to enter player names. add a button to either submit or add a bot instead
        const input_container = document.createElement("div");

    }
    async init() {
        await this.navbar.init();
    }

    unload(){

    }
}