import { isConstructorDeclaration, isInterfaceDeclaration } from "typescript";
import account from "./account";

export default function navbar(loggedin: boolean, site_title?: string) {
	const log_sect = account(loggedin);

	return `<!-- nav bar -->
    <nav class="bg-blue-500 p-4 text-white">
        <div class="container mx-auto flex justify-between items-center">
            <a href="/"><h1 class="text-2xl font-bold popout">${site_title ?? "pongy"}</h1></a>
			${log_sect}
        </div>
    </nav>`;
}
