import { Router } from '../scripts/router';

export default function google_button(router: Router)
{
	const backend_url = 'https://localhost:4161';
	if (!router.is_logged_in()) {
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