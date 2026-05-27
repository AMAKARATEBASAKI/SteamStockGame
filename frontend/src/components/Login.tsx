import { useState, type FormEvent } from "react";
import { API_URL } from "../lib/api";

type LoginProps = {
	onSuccess: (token: string) => void;
};

export default function Login({ onSuccess }: LoginProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Login failed");
			}

			if (!data.token) {
				throw new Error("Token was not returned from the server");
			}

			localStorage.setItem("token", data.token);
			onSuccess(data.token);
		} catch (loginError) {
			setError(loginError instanceof Error ? loginError.message : "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="auth-shell">
			<div className="auth-card">
				<p className="eyebrow">Steam Stock Game</p>
				<h1>ログイン</h1>
				<p className="muted">API を使うにはログインしてトークンを保持してください。</p>

				<form className="form-grid" onSubmit={handleSubmit}>
					<label className="field">
						<span>Email</span>
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="test@example.com"
							autoComplete="email"
							required
						/>
					</label>

					<label className="field">
						<span>Password</span>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="password"
							autoComplete="current-password"
							required
						/>
					</label>

					{error && <p className="error-text">{error}</p>}

					<button className="primary-button" type="submit" disabled={loading}>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</section>
	);
}
