import { Router } from "./scripts/router";
import ErrorHandler from "./pages/error";
import Homepage from "./pages/home";
import SignUp from "./pages/signup";
import Login from "./pages/login";
import Pong from "./pages/pong";
import Dev from "./pages/dev";
import PongRoom from "./pages/pong_room";
import PongJoin from "./pages/pong_join";
import PongMenu from "./pages/pong_menu";
import DifficultyMenu from "./pages/difficulty_menu";
import Profile from "./pages/profile";
import History from "./pages/history";
import Leaderboard from "./pages/leaderboard";
import Friends from "./pages/friends";
import TicTacToe from "./pages/tictactoe";
import CreateTournament from "./pages/tournament_init"
import { TournamentPage } from "./pages/tournament";

const app_div = document.querySelector<HTMLDivElement>("#app")!;

const router = new Router(app_div);

router.set_error_handler(new ErrorHandler(router));

router.add_route("/", new Homepage(router));
router.add_route("/dev", new Dev(router));
router.add_route("/pong/game", new Pong(router), { auth: true });
router.add_route("/pong/menu", new PongMenu(router), { auth_overlay: true });
router.add_route("/pong/room", new PongRoom(router), { auth: true, type: "strict_wild" });
router.add_route("/pong/join", new PongJoin(router), { auth: true, back_url: "/pong/menu", type: "overlay" });
router.add_route("/pong/difficulty", new DifficultyMenu(router));
router.add_route("/register", new SignUp(router), { auth: false, back_url: "/", type: "overlay" });
router.add_route("/login", new Login(router), { auth: false, back_url: "/", type: "overlay" });
router.add_route("/profile", new Profile(router), { auth: true, type: "wild" });
router.add_route("/history", new History(router), { auth: true, type: "wild" });
router.add_route("/friends", new Friends(router), { auth: true, type: "wild" });
router.add_route("/leaderboard", new Leaderboard(router));
router.add_route("/tictactoe", new TicTacToe(router), { auth: true });
router.add_route("/tournament/create", new CreateTournament(router), { auth: true });
router.add_route("/tournament", new TournamentPage(router), { auth: true});

window.onload = () => {
	console.log("Page loaded. Starting router...");
	router.start();
	console.log("Router started")
};
