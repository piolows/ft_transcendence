import { isConstructorDeclaration, isInterfaceDeclaration } from "typescript";
import account from "./account";

export default function navbar(loggedin: boolean, site_title: string = "PONGOID") {
	const log_sect = account(loggedin);

	return `<!-- nav bar -->
    <nav class="relative z-10 p-4">
        <div class="container mx-auto flex justify-between items-center">
            <!-- logo -->
            <div class="flex items-center space-x-2">
                <a href="/">
                    <h1 class="text-4xl font-bold pixel-box bg-opacity-50 p-4">${site_title}</h1>
                </a>
            </div>

            <!-- auth -->
            <div class="flex items-center space-x-6">
                <div id="profile-info" class="hidden">
                    <div class="flex items-center space-x-4">
                        <img id="pfp" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
                        <div>
                            <h4 id="uname" class="crt-text"></h4>
                            <p id="umail" class="text-xs font-silkscreen"></p>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-4">
                    <button id="login-button" class="pixel-box bg-blue-600 px-6 py-2 hover:bg-blue-700 clicky">
                        LOGIN
                    </button>
                    <button id="signup-button" class="pixel-box bg-green-500 px-6 py-2 hover:bg-green-600 clicky">
                        SIGN UP
                    </button>
                </div>
            </div>
        </div>
    </nav>`;

	// return `<!-- nav bar -->
    // <nav class="relative z-10 p-4">
    //     <div class="container mx-auto flex justify-between items-center">
    //         <!-- logo -->
    //         <div class="flex items-center space-x-2">
    //             <h1 class="text-4xl font-bold pixel-box bg-opacity-50 p-4">PONGOID</h1>
    //         </div>

    //         <!-- auth -->
    //         <div class="flex items-center space-x-6">
    //             <div id="profile-info" class="hidden">
    //                 <div class="flex items-center space-x-4">
    //                     <img id="pfp" class="w-12 h-12 rounded-full pixel-box" alt="Profile">
    //                     <div>
    //                         <h4 id="uname" class="crt-text"></h4>
    //                         <p id="umail" class="text-xs font-silkscreen"></p>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div class="flex space-x-4">
    //                 <button id="logout-button" class="hidden hover:text-blue-200 clicky wiggler">
    //                     LOGOUT
    //                 </button>
    //             </div>
    //         </div>
    //     </div>
    // </nav>`;
}
