import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Bike, LockKeyhole, Mail, ShieldCheck, Store, UserRound, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { loginUser, registerUser, USE_MOCKS } from "../api/services";
import { Button, Input } from "../components/ui";
import { photos } from "../mocks/data";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";

const loginSchema = z.object({ email: z.email("Enter a valid email"), password: z.string().min(6, "Use at least 6 characters") });
const registerSchema = loginSchema.extend({ name: z.string().min(2, "Enter your name") });

export const PORTALS = {
  CUSTOMER: { role: "CUSTOMER", label: "Customer", login: "/login", register: "/register", home: "/", landing: "/", icon: UserRound, demo: "customer@fastfood.app", image: "photo-1586793783658-261cddf883ef", quote: "Fast enough for lunch break. Good enough to tell everyone about.", by: "Avery, fastfood customer", loginTitle: "Welcome back", loginSub: "Sign in to track orders, save favorites, and reorder fast.", registerTitle: "Let's get started", registerSub: "Your next great meal is only a few taps away." },
  RESTAURANT_OWNER: { role: "RESTAURANT_OWNER", label: "Restaurant partner", login: "/restaurant/login", register: "/restaurant/signup", home: "/owner", landing: "/restaurant", icon: Store, demo: "owner@fastfood.app", image: "photo-1556910103-1c02745aae4d", quote: "Our dinner rush doubled and the dashboard keeps the kitchen calm.", by: "Maya, owner at Stacked & Smashed", loginTitle: "Restaurant sign in", loginSub: "Manage your menu, accept incoming orders and track sales.", registerTitle: "Open your restaurant", registerSub: "Reach new customers and manage orders from one dashboard." },
  DELIVERY_PARTNER: { role: "DELIVERY_PARTNER", label: "Delivery partner", login: "/delivery/login", register: "/delivery/signup", home: "/delivery", landing: "/deliver", icon: Bike, demo: "rider@fastfood.app", image: "photo-1526367790999-0150786686a2", quote: "I pick my own hours and see exactly what each drop pays.", by: "Marcus, delivery partner", loginTitle: "Delivery partner sign in", loginSub: "Go online, pick up orders and track your earnings.", registerTitle: "Ride with fastfood", registerSub: "Flexible hours, weekly payouts and tips that are all yours." },
  ADMIN: { role: "ADMIN", label: "Admin", login: "/admin/login", register: null, home: "/admin", landing: null, icon: ShieldCheck, demo: "admin@fastfood.app", image: "photo-1504674900247-0877df9cc836", quote: "Restricted area. Authorized fastfood staff only.", by: "fastfood operations", loginTitle: "Admin console", loginSub: "Authorized staff only. Accounts are created by the platform team." },
};

export const loginPathForPath = (pathname) => pathname.startsWith("/owner") ? PORTALS.RESTAURANT_OWNER.login : pathname.startsWith("/delivery") ? PORTALS.DELIVERY_PARTNER.login : pathname.startsWith("/admin") ? PORTALS.ADMIN.login : PORTALS.CUSTOMER.login;

function SocialButtons() {
  return (
    <>
      <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink/30"><span className="h-px flex-1 bg-ink/10" />or continue with<span className="h-px flex-1 bg-ink/10" /></div>
      <div className="grid grid-cols-2 gap-3">{["Google", "Apple"].map((name) => <button key={name} type="button" onClick={() => toast(`${name} sign-in is a demo button`)} className="rounded-xl border border-ink/12 bg-white py-3 text-sm font-bold transition hover:border-ink/30 active:scale-[.98]">{name}</button>)}</div>
    </>
  );
}

function CustomerAuthLayout({ mode, title, subtitle, children }) {
  const tiles = [photos.chicken[1], photos.pizza[0], photos.salad[3], photos.dessert[1], photos.indian[0], photos.breakfast[0]];
  return (
    <div className="min-h-screen bg-tangerine lg:grid lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative flex flex-col overflow-hidden px-6 pb-16 pt-6 text-white sm:px-10 lg:min-h-screen lg:p-14">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-tangerine"><Zap size={20} fill="currentColor" /></span>fast<span className="-ml-2 text-sun">food</span></Link>
        <h2 className="mt-8 max-w-lg font-display text-4xl font-extrabold leading-[1.04] sm:text-5xl lg:mt-16 lg:text-6xl">Hungry? <span className="text-sun">Dinner</span> is 25 minutes away.</h2>
        <p className="mt-4 max-w-md text-white/80">Order from 12 local kitchens, track your rider live and save your favorites.</p>
        <div className="mt-10 hidden grid-cols-3 gap-3 lg:grid">{tiles.map((src, index) => <div key={src} className={`overflow-hidden rounded-3xl bg-white/20 ${index % 2 ? "mt-6" : ""}`}><img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /></div>)}</div>
        <div className="mt-auto hidden items-center gap-6 pt-10 text-sm font-bold text-white/85 lg:flex"><span>★ 4.8 average rating</span><span>Free delivery over $25</span><span>Live tracking</span></div>
      </section>
      <section className="-mt-8 flex flex-col rounded-t-[32px] bg-cream px-6 pb-10 pt-8 sm:px-10 lg:mt-0 lg:min-h-screen lg:justify-center lg:rounded-none lg:rounded-l-[40px] lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <div className="grid grid-cols-2 rounded-2xl bg-ink/6 p-1 text-sm font-bold">{[["login", "Sign in", PORTALS.CUSTOMER.login], ["register", "Sign up", PORTALS.CUSTOMER.register]].map(([key, label, to]) => <Link key={key} to={to} replace className={`rounded-xl py-3 text-center transition ${mode === key ? "bg-white shadow-sm" : "text-ink/50 hover:text-ink"}`}>{label}</Link>)}</div>
          <h1 className="mt-8 font-display text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-ink/55">{subtitle}</p>
          {children}
          <SocialButtons />
        </div>
      </section>
    </div>
  );
}

export function AuthLayout({ portal, mode, title, subtitle, children }) {
  if (portal.role === "CUSTOMER") return <CustomerAuthLayout mode={mode} title={title} subtitle={subtitle}>{children}</CustomerAuthLayout>;
  const Icon = portal.icon;
  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[.85fr_1.15fr]">
      <div className="flex flex-col p-5 sm:p-10 lg:p-14">
        <Link to={portal.landing || portal.login} className="mb-12 flex items-center gap-2 font-display text-xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-tangerine text-white"><Zap size={20} fill="currentColor" /></span>fast<span className="-ml-2 text-tangerine">food</span></Link>
        <div className="mx-auto my-auto w-full max-w-md">
          {portal.landing && <Link to={portal.landing} className="mb-5 flex items-center gap-2 text-sm font-bold text-ink/50 hover:text-ink"><ArrowLeft size={17} />Back to home</Link>}
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-leaf"><Icon size={14} />{portal.label} portal</span>
          <h1 className="font-display text-4xl font-extrabold">{title}</h1>
          <p className="mt-3 text-ink/55">{subtitle}</p>
          {children}
        </div>
      </div>
      <div className="relative m-4 hidden overflow-hidden rounded-[32px] bg-leaf lg:block">
        <img src={`https://images.unsplash.com/${portal.image}?auto=format&fit=crop&w=1400&q=85`} alt="" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
        <blockquote className="absolute bottom-14 left-14 max-w-lg text-white"><p className="font-display text-4xl font-bold leading-tight">“{portal.quote}”</p><footer className="mt-5 text-sm text-white/60">{portal.by}</footer></blockquote>
      </div>
    </div>
  );
}

function PortalLogin({ portal }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: USE_MOCKS ? portal.demo : "", password: "password" } });

  const submit = async (values) => {
    try {
      const result = await loginUser({ ...values, role: portal.role });
      if (result.user.role !== portal.role) { toast.error(`This is the ${portal.label.toLowerCase()} sign in. Use the right portal for your account.`); return; }
      setAuth(result);
      if (useProfileStore?.getState()?.syncUser) {
        useProfileStore.getState().syncUser(result.user);
      }
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}`);
      navigate(location.state?.from || portal.home, { replace: true, state: { allowedNav: true } });
    } catch {
      toast.error("We couldn't sign you in");
    }
  };

  return (
    <AuthLayout portal={portal} mode="login" title={portal.loginTitle} subtitle={portal.loginSub}>
      <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-4">
        <Input label="Email address" icon={Mail} type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Password" icon={LockKeyhole} type="password" error={errors.password?.message} {...register("password")} />
        <div className="flex justify-end"><button type="button" className="text-sm font-bold text-leaf">Forgot password?</button></div>
        <Button className="w-full" size="lg" loading={isSubmitting}>Sign in <ArrowRight size={18} /></Button>
      </form>
      {portal.register
        ? <p className="mt-7 text-center text-sm text-ink/55">New here? <Link to={portal.register} className="font-bold text-tangerine">Create an account</Link></p>
        : <p className="mt-7 text-center text-sm text-ink/55">Admin accounts can't be self-registered.</p>}
    </AuthLayout>
  );
}

function PortalRegister({ portal }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) });
  const submit = async (values) => {
    try {
      const result = await registerUser({ ...values, role: portal.role });
      setAuth(result);
      if (useProfileStore?.getState()?.syncUser) {
        useProfileStore.getState().syncUser(result.user);
      }
      toast.success("Your account is ready");
      navigate(portal.home, { replace: true, state: { allowedNav: true } });
    } catch {
      toast.error("We couldn't create your account");
    }
  };
  return (
    <AuthLayout portal={portal} mode="register" title={portal.registerTitle} subtitle={portal.registerSub}>
      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-4">
        <Input label={portal.role === "RESTAURANT_OWNER" ? "Owner name" : "Full name"} icon={UserRound} placeholder="Avery Morgan" error={errors.name?.message} {...register("name")} />
        <Input label="Email address" icon={Mail} type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Password" icon={LockKeyhole} type="password" error={errors.password?.message} {...register("password")} />
        <Button className="w-full" size="lg" loading={isSubmitting}>Create account <ArrowRight size={18} /></Button>
      </form>
      <p className="mt-7 text-center text-sm text-ink/55">Already have an account? <Link to={portal.login} className="font-bold text-tangerine">Sign in</Link></p>
    </AuthLayout>
  );
}

export const LoginPage = () => <PortalLogin portal={PORTALS.CUSTOMER} />;
export const RegisterPage = () => <PortalRegister portal={PORTALS.CUSTOMER} />;
export const RestaurantLoginPage = () => <PortalLogin portal={PORTALS.RESTAURANT_OWNER} />;
export const DeliveryLoginPage = () => <PortalLogin portal={PORTALS.DELIVERY_PARTNER} />;
export const AdminLoginPage = () => <PortalLogin portal={PORTALS.ADMIN} />;
