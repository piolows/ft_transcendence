// frontend.ts
interface Window {
	google: any;
}
window.handleCredentialResponse = (response: any) => {
// response.credential is your ID token (JWT)
console.log("ID token:", response.credential);

// Send ID token to your backend
fetch("/api/auth/google", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ idToken: response.credential }),
})
	.then(r => r.json())
	.then(data => console.log("Backend response:", data))
	.catch(console.error);
};