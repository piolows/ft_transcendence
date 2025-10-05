import { Router, backend_url } from "./scripts/router";
import ErrorHandler from "./pages/error";
import Homepage from "./pages/home";
import Roshambo from "./pages/roshambo";
import SignUp from "./pages/signup";
import Login from "./pages/login";
import Pong from "./pages/pong";
import Dev from "./pages/dev";

declare global {
  interface Window {
    handleCredentialResponse: (response: google.accounts.id.CredentialResponse) => void;
  }
}

const app_div = document.querySelector<HTMLDivElement>("#app");

const router = new Router(app_div);

router.set_error_handler(new ErrorHandler(router));

router.add_route("/", new Homepage(router));
router.add_route("/dev", new Dev(router));
router.add_route("/pong", new Pong());
router.add_route("/roshambo", new Roshambo());
router.add_route("/login", new Login(router));
router.add_route("/register", new SignUp(router));

router.start();
