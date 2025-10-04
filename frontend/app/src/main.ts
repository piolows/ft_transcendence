import { Router, backend_url } from "./scripts/router";
import ErrorHandler from "./pages/error";
import Homepage from "./pages/home";
import Roshambo from "./pages/roshambo";
import SignUp from "./pages/signup";
import Login from "./pages/login";
import Pong from "./pages/pong";
import Dev from "./pages/dev";

const app_div = document.querySelector<HTMLDivElement>("#app");

const router = new Router(app_div, new ErrorHandler());

router.add_route("/", new Homepage());
router.add_route("/dev", new Dev());
router.add_route("/pong", new Pong());
router.add_route("/roshambo", new Roshambo());
router.add_route("/login", new Login(router));
router.add_route("/register", new SignUp(router));

router.route(location.pathname);

declare global {
  interface Window {
    handleCredentialResponse: (response: google.accounts.id.CredentialResponse) => void;
  }
}

async function logoutSession() {
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
		});
    }
	// show login/signup buttons
  } catch (err) {
    console.error("Failed to log out:", err);
  }
}

// Expose it to the global scope
(window as any).logoutSession = logoutSession;

async function checkSession() {
  try {
    const res = await fetch(backend_url + "/auth/me", {
    	credentials: "include", // VERY IMPORTANT! Sends cookies with request
    });
    const data = await res.json();

    if (data.loggedIn) {
		const profile = document.getElementById('profile-info');
		const pfp = document.getElementById('pfp') as HTMLImageElement;
		const uname = document.getElementById('uname');
		const umail = document.getElementById('umail');
		if (profile)
			profile.style.display = "block";
		if (pfp)
			pfp.src = data.user.avatarURL;
		if (uname)
			uname.innerText = data.user.username;
		if (umail)
			umail.innerText = data.user.email;
    	showLogoutButton(data.user);
    } else {
    	showLoginButton();
    }
  } catch (err) {
    console.error("Failed to check session:", err);
  }
}

// Attach it to window
if (!window.handleCredentialResponse) {
	window.handleCredentialResponse = (response) => {
		// Example: send the credential to your backend
		fetch(backend_url + "/auth/google-login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: response.credential }),
			credentials: "include"
		})
		.then(res => res.json())
		.then(data => {
			console.log("Backend response:", data)
			checkSession()
		})
		.catch(err => console.error("Error sending token to backend:", err));
	};
}
