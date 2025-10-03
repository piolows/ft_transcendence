import { Router } from "./scripts/router";
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
router.add_route("/login", new Login());
router.add_route("/signup", new SignUp());

router.route(location.pathname);
