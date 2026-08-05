import { useState, type FormEvent } from "react";
import { registerUser } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

type RegisterProps = {
  onSuccess: (token: string) => void;
};

export default function Register({ onSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません。");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem("token", data.token!);
      onSuccess(data.token!);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Steam Stock Game</p>
        <h1>アカウント登録</h1>
        <p className="muted">アカウントを作成してください。</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>名前</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="表示名" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
          </label>

          <label className="field">
            <span>Confirm</span>
            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="confirm password" required />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <div style={{ marginTop: 12 }}>
            <Link to="/login" style={{ color: 'red' }}>既にアカウントをお持ちですか？ ログイン</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
