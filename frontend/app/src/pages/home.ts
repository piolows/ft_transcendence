import Webpage from "../scripts/router";
import title from "../components/main_title";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import menu from "../components/menu";

export default class Homepage implements Webpage {
	load(app: HTMLDivElement | HTMLElement) {
		app.innerHTML = navbar() + "<div class=\"container mx-auto mt-16 px-4\">" + title() + menu() + "</div>" + footer();
	}
}
