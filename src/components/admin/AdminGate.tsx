import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { adminConfigured, getAdminClient } from "@/lib/admin/client";

/**
 * Puerta del panel: solo muestra su contenido a un administrador con sesión iniciada.
 *
 * Esto es comodidad, no seguridad. La seguridad real está en la base de datos (reglas RLS):
 * aunque alguien se saltara esta pantalla, Supabase rechazaría cualquier cambio.
 */
type Gate =
  | { step: "loading" }
  | { step: "signed-out" }
  | { step: "not-admin"; email: string; userId: string }
  | { step: "ready"; email: string };

const field =
  "h-12 w-full rounded-xl border border-input bg-secondary/70 px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:border-orbit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orbit/60";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: (email: string) => ReactNode }) {
  const [gate, setGate] = useState<Gate>({ step: "loading" });

  useEffect(() => {
    if (!adminConfigured) return;
    let alive = true;
    let unsubscribe = () => {};

    const check = async (user: { id: string; email?: string | undefined } | null) => {
      if (!alive) return;
      if (!user) return setGate({ step: "signed-out" });
      const db = await getAdminClient();
      const { data, error } = await db.rpc("is_admin");
      if (!alive) return;
      const email = user.email ?? "";
      setGate(
        !error && data === true
          ? { step: "ready", email }
          : { step: "not-admin", email, userId: user.id },
      );
    };

    void getAdminClient().then(async (db) => {
      const { data } = await db.auth.getSession();
      void check(data.session?.user ?? null);
      const sub = db.auth.onAuthStateChange((event, session) => {
        // Renovar la sesión en segundo plano no cambia quién eres: no hace falta volver a revisar
        if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
        void check(session?.user ?? null);
      });
      unsubscribe = () => sub.data.subscription.unsubscribe();
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  if (!adminConfigured) {
    return (
      <Panel title="El panel todavía no está conectado">
        <p>
          El panel guarda los productos y las fotos en Supabase, y esta copia de la tienda aún no
          tiene las llaves.
        </p>
        <p>
          Sigue los pasos 1 a 3 y el paso 5 de{" "}
          <code className="text-foreground">LEEME-SUPABASE.md</code>. Al reiniciar{" "}
          <code className="text-foreground">npm run dev</code> aquí aparecerá el inicio de sesión.
        </p>
      </Panel>
    );
  }

  if (gate.step === "loading") {
    return (
      <Panel title="Panel de administración">
        <p role="status">Comprobando tu sesión…</p>
      </Panel>
    );
  }

  if (gate.step === "signed-out") return <SignIn />;

  if (gate.step === "not-admin") {
    return (
      <Panel title="Tu usuario no es administrador">
        <p>
          Iniciaste sesión como <span className="text-foreground">{gate.email}</span>, pero ese
          usuario no está en la lista de administradores.
        </p>
        <p>Para agregarlo, ejecuta esto en el SQL Editor de Supabase:</p>
        <pre className="overflow-x-auto rounded-xl bg-secondary p-4 text-[13px] text-foreground">
          {`insert into public.admins values ('${gate.userId}');`}
        </pre>
        <SignOutButton />
      </Panel>
    );
  }

  return <>{children(gate.email)}</>;
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void getAdminClient().then((db) => db.auth.signOut())}
      className="inline-flex h-11 items-center rounded-full border border-input px-5 text-[15px] text-foreground transition-colors hover:bg-secondary"
    >
      Cerrar sesión
    </button>
  );
}

function SignIn() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const db = await getAdminClient();
      const { error: authError } = await db.auth.signInWithPassword({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
      if (authError) {
        setError(
          /invalid login/i.test(authError.message)
            ? "Correo o contraseña incorrectos. Revisa que sea el usuario que creaste en Supabase (Authentication → Users)."
            : `No se pudo iniciar sesión: ${authError.message}`,
        );
      }
    } catch {
      setError("No hay conexión con Supabase. Revisa tu internet e inténtalo de nuevo.");
    }
    setSending(false);
  };

  return (
    <Panel title="Panel de administración">
      <p>Entra con el usuario administrador que creaste en Supabase.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="mb-1.5 block text-foreground">
            Correo
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            spellCheck={false}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-foreground">
            Contraseña
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={field}
          />
        </div>
        {error && (
          <p role="alert" className="text-promo">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="h-12 w-full rounded-full bg-primary text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {sending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </Panel>
  );
}
