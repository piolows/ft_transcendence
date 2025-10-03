import "../styles.css";

var backend_url = "http://localhost:4161";

declare global {
  interface Window {
    handleCredentialResponse: (response: google.accounts.id.CredentialResponse) => void;
  }
}

function showLogoutButton(user: {
    id: number,
    username: string,
    email: string,
	avatarURL: URL
  }) {
	const loginBtn = document.getElementById("login-button");
	const googleLoginBtn = document.getElementById("google-login-button");
	const signupBtn = document.getElementById("signup-button");
	const logoutBtn = document.getElementById("logout-button");
	const profile = document.getElementById("profile-info");

	if (profile) profile.style.display = "block";
	if (loginBtn) loginBtn.style.display = "none";
	if (googleLoginBtn) googleLoginBtn.style.display = "none";
	if (signupBtn) signupBtn.style.display = "none";
	if (logoutBtn) logoutBtn.style.display = "block";
}

function showLoginButton() {
	const loginBtn = document.getElementById("login-button");
	const googleLoginBtn = document.getElementById("google-login-button");
	const signupBtn = document.getElementById("signup-button");
	const logoutBtn = document.getElementById("logout-button");
	const profile = document.getElementById("profile-info");

	if (profile) profile.style.display = "none";
	if (loginBtn) loginBtn.style.display = "block";
	if (googleLoginBtn) googleLoginBtn.style.display = "block";
	if (signupBtn) signupBtn.style.display = "block";
	if (logoutBtn) logoutBtn.style.display = "none";
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
		})
    }
	showLoginButton();
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

interface Registration {
    loginButton: HTMLElement | null;
    signupButton: HTMLElement | null;
    loginScreen: HTMLElement | null;
    signupScreen: HTMLElement | null;
    loginCloseButton: HTMLElement | null;
    signupCloseButton: HTMLElement | null;
}

const elements: Registration = {
    loginButton: document.getElementById('login-button'),
    signupButton: document.getElementById('signup-button'),
    loginScreen: document.getElementById('login-screen'),
    signupScreen: document.getElementById('signup-screen'),
    loginCloseButton: document.getElementById('login-close-button'),
    signupCloseButton: document.getElementById('signup-close-button')
};

const showScreen = (screen: HTMLElement | null): void => {
    screen?.classList.remove('hidden');
};

const hideScreen = (screen: HTMLElement | null): void => {
	checkSession();
    screen?.classList.add('hidden');
};

elements.loginButton?.addEventListener('click', () => showScreen(elements.loginScreen));
elements.signupButton?.addEventListener('click', () => showScreen(elements.signupScreen));
elements.loginCloseButton?.addEventListener('click', () => hideScreen(elements.loginScreen));
elements.signupCloseButton?.addEventListener('click', () => hideScreen(elements.signupScreen));

async function handleFormSubmit(form: HTMLFormElement, endpoint: string, screen: HTMLElement | null) {
	form.addEventListener("submit", async (event) => {
		event.preventDefault(); // Stop normal form submit & page reload

		// Collect form data
		const formData = new FormData(form);
		const body = Object.fromEntries(formData.entries());

		try {
			const response = await fetch(`${backend_url}/auth/${endpoint}`, {
				method: "POST",
				credentials: "include", // IMPORTANT for sending/receiving cookies!
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			});

			const data = await response.json();

			if (response.ok) {
				checkSession();
				hideScreen(screen);
			} else {
				alert(`Error: ${data.message}`);
			}
		} catch (error) {
			document.getElementById("message")!.textContent = "❌ Network error";
			console.error("Fetch error:", error);
		}
	});
}

// Attach handlers
const loginForm = document.getElementById("loginForm") as HTMLFormElement;
const registerForm = document.getElementById("registerForm") as HTMLFormElement;

handleFormSubmit(loginForm, "login", elements.loginScreen);
handleFormSubmit(registerForm, "register", elements.signupScreen);

// Call it on page load
checkSession();