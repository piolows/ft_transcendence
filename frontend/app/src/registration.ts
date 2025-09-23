import "./styles.css";

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
    screen?.classList.add('hidden');
};

elements.loginButton?.addEventListener('click', () => showScreen(elements.loginScreen));
elements.signupButton?.addEventListener('click', () => showScreen(elements.signupScreen));
elements.loginCloseButton?.addEventListener('click', () => hideScreen(elements.loginScreen));
elements.signupCloseButton?.addEventListener('click', () => hideScreen(elements.signupScreen));