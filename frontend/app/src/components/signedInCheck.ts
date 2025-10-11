import { Router } from '../scripts/router';
import { backend_url } from '../scripts/router';

export default function isGoogleSignedIn(router: Router)
{
	if (router.is_logged_in() === false)
	{
		// put the google sign in button
		google.accounts.id.renderButton(
			document.getElementById('google-login-button'),
			{ theme: 'outline', size: 'large' }
		);
	}
	else
	{
		fetch(backend_url + '/auth/me', {
			credentials: 'include',
			headers: {'Referrer-Policy': 'no-referrer'}
		}).then(async (res) => {
			const data = await res.json();
			console.log(data);
			if (data.loggedIn)
			{
				const profile = document.getElementById('profile-info');
				const pfp = document.getElementById('pfp') as HTMLImageElement;
				const uname = document.getElementById('uname');
				const umail = document.getElementById('umail');
				profile && (profile.style.display = "block");
				pfp && (pfp.src = (data.user.avatarURL.includes("http") ? "" : backend_url) + data.user.avatarURL);
				uname && (uname.innerText = data.user.username);
				umail && (umail.innerText = data.user.email);
			}
		}).catch ((error) => {
			console.log('Failed to check session: ', error);
		});

		const logout_button = document.getElementById('logout-button');

		logout_button.onclick = async () => {
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
				router.route("/", true);
			} catch (err) {
				console.error("Failed to log out:", err);
			}
		}
	}
}
