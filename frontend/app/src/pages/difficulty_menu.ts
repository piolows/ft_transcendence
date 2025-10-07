import Webpage, { Router, backend_url } from "../scripts/router";
import title from "../components/main_title";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import menu from "../components/menu";

export default class DifficultyMenu implements Webpage {
	private router: Router;

	constructor(router: Router) {
		this.router = router;
	}

	load(app: HTMLDivElement | HTMLElement) {
		let cards = [
			["Easy", "Challenge the AI bot on Easy difficulty", "/pong?op=bot&difficulty=0"],
			["Medium", "Challenge the AI bot on Medium difficulty", "/pong?op=bot&difficulty=1"],
			["Hard", "Challenge the AI bot on Hard difficulty", "/pong?op=bot&difficulty=2"],
			["Extreme", "Challenge the AI bot on Extreme difficulty", "/pong?op=bot&difficulty=3"],
		];
		app.innerHTML = navbar(this.router.is_logged_in()) + "<div class=\"container mx-auto mt-16 px-4\">" + title() + menu(cards) + "</div>" + footer();
	}

	init() {
		if (!this.router.is_logged_in()) {
			google.accounts.id.renderButton(
				document.getElementById("google-login-button")!,
				{ theme: "outline", size: "large" }
			);
		}
		else {
			fetch(backend_url + "/auth/me", {
				credentials: "include", // VERY IMPORTANT! Sends cookies with request
			}).then(async (res) => {
				const data = await res.json();

				if (data.loggedIn) {
					const profile = document.getElementById('profile-info');
					const pfp = document.getElementById('pfp') as HTMLImageElement;
					const uname = document.getElementById('uname');
					const umail = document.getElementById('umail');
					profile && (profile.style.display = "block");
					pfp && (pfp.src = data.user.avatarURL);
					uname && (uname.innerText = data.user.username);
					umail && (umail.innerText = data.user.email);
				}
			}).catch ((err) => {
				console.error("Failed to check session:", err);
			});
				
			const logout = document.getElementById("logout-button") as HTMLButtonElement;

			logout.onclick = async () => {
				try {
					const res = await fetch(backend_url + "/auth/me", {
						credentials: "include"
					});
					const data = await res.json();

					if (data.loggedIn) {
						await fetch(backend_url + "/auth/logout", {
							method: "POST",
							body: JSON.stringify({}),
							credentials: "include"
						})
					}
					this.router.route("/", true);
				} catch (err) {
					console.error("Failed to log out:", err);
				}
			}
		}
	}
}
