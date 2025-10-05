import { Router, backend_url } from "../scripts/router";
import navbar from "../components/nav_bar";
import footer from "../components/footer";
import Webpage from "../scripts/router";

export default class ErrorHandler implements Webpage {
	private error_code = "404";
	private router: Router;
	
	constructor(router: Router) {
		this.router = router;
	}

	set_status(status: string) {
		this.error_code = status;
	}

	load(app: HTMLDivElement | HTMLElement) {
		const err_msg = `
			<div class="center text-center mt-50">
				<h1>Unexpected Error</h1>
				<h4>Error code ${this.error_code}</h4>
			</div>`;

		app.innerHTML = navbar(this.router.is_logged_in()) + err_msg + footer();
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