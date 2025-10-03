import sect_navbar from "../components/nav_bar";
import sect_title from "../components/main_title";
import sect_menu from "../components/menu";
import sect_footer from "../components/footer";

export default function page_home() {
	return sect_navbar() + "<div class=\"container mx-auto mt-16 px-4\">" + sect_title() + sect_menu() + "</div>" + sect_footer();
}