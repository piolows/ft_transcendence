import page_dev from "./pages/dev";
import page_home from "./pages/home";
import page_pong from "./pages/pong";
import page_login from "./pages/login";
import page_signup from "./pages/signup";

class Router {
	
}

var app_div = document.querySelector<HTMLDivElement>("#app");

// Simple router: maps paths to components
const routes: Record<string, () => string> = {
  "/": page_home,
  "/dev": page_dev,
  "/pong": page_pong,
  "/roshambo": page_pong,
  "/login": page_login,
  "/signup": page_signup,
};

// Render a route into #app
function navigateTo(path: string) {
  const viewFn = routes[path] || (() => "<h1>404 Not Found</h1>");
  app_div!.innerHTML = viewFn();

  // Push state so back/forward buttons work
  history.pushState({ path }, "", path);
}

// Handle back/forward buttons
window.onpopstate = (event) => {
	const path = event.state?.path || "/";
	const viewFn = routes[path] || (() => "<h1>404 Not Found</h1>");
	app_div!.innerHTML = viewFn();
};

// Intercept clicks on <a data-link>
document.addEventListener("click", (e) => {
  const target = e.target as HTMLAnchorElement;
  if (target.matches("[data-link]")) {
    e.preventDefault();
    navigateTo(target.getAttribute("href")!);
  }
});

// Initial load
navigateTo(location.pathname);
