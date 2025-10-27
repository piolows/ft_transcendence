import { Router } from "./scripts/router";
import ErrorHandler from "./pages/error";
import Homepage from "./pages/home";
// import Roshambo from "./pages/roshambo";
import SignUp from "./pages/signup";
import Login from "./pages/login";
import Pong from "./pages/pong";
import Dev from "./pages/dev";
import PongRoom from "./pages/pong_room";
import PongJoin from "./pages/pong_join";
import PongMenu from "./pages/pong_menu";
import DifficultyMenu from "./pages/difficulty_menu";
import Profile from "./pages/profile";

const app_div = document.querySelector<HTMLDivElement>("#app")!;

const router = new Router(app_div);

router.set_error_handler(new ErrorHandler(router));

router.add_route("/", new Homepage(router));
router.add_route("/dev", new Dev(router));
router.add_route("/pong/game", new Pong(router));
router.add_route("/pong/menu", new PongMenu(router));
router.add_route("/pong/room", new PongRoom(router));
router.add_route("/pong/join", new PongJoin(router));
router.add_route("/pong/difficulty", new DifficultyMenu(router));
router.add_route("/register", new SignUp(router));
router.add_route("/login", new Login(router));
router.add_route("/profile", new Profile(router));
// router.add_route("/roshambo", new Roshambo());

router.start();
