import { useState, type FormEvent } from "react";
import { loginUser } from "../lib/api";

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
			const data = await loginUser({ email, password });
			localStorage.setItem("token", data.token);
			onSuccess(data.token);
		} catch (loginError) {
			setError(loginError instanceof Error ? loginError.message : "メールアドレスまたはパスワードが違います。");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="auth-shell">
			<div className="auth-card">
				<p className="eyebrow">Steam Stock Game</p>
				<h1>ログイン</h1>
				<p className="muted">登録したメールアドレスとパスワードを入力してください。</p>

				<form className="form-grid" onSubmit={handleSubmit}>
					<label className="field">
						<span>Email</span>
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="email"
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
