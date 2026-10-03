import { ArrowLeft, ArrowRight, BadgeCheck, Building2, CheckCircle2, CircleDashed, FileCheck2, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, Store, Upload, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/services";
import { Button, Input } from "../components/ui";
import { useApplicationStore } from "../store/applicationStore";
import { useAuthStore } from "../store/authStore";
import { AuthLayout, PORTALS } from "./AuthPages";

const steps = ["Account", "Business", "Location", "Menu", "Documents", "Payout", "Review"];
const cuisines = ["Indian", "Burgers", "Italian", "Healthy", "Japanese", "Breakfast", "Desserts", "Grill", "Other"];
const foodTypes = ["Vegetarian", "Vegan", "Egg", "Chicken"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const docList = [
  ["licence", "Business licence", "Trade or shop registration"],
  ["foodSafety", "Food safety certificate", "Health department or FSSAI licence"],
  ["idFront", "Owner government ID", "Passport, national ID or driver licence"],
  ["bankProof", "Bank proof", "Cancelled cheque or statement header"],
];
const timeline = [["Application submitted", "We've got your details."], ["Document review", "Usually within 24 hours."], ["Kitchen verification", "A quick call or photo check."], ["Go live", "Your menu appears to customers."]];
const initial = { owner: "", email: "", password: "", phone: "", otp: "", name: "", cuisine: "Indian", description: "", years: "1", licenceNo: "", taxId: "", address: "", city: "San Francisco", zip: "", open: "10:00", close: "22:00", days: [...days], prep: "25", radius: "5", types: ["Vegetarian"], dishes: "10", docs: {}, holder: "", account: "", routing: "", terms: false, quality: false };

function Select({ label, value, onChange, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select value={value} onChange={onChange} className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-sm">{children}</select></label>;
}
function Check({ checked, onChange, children }) {
  return <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/70"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-tangerine" /><span>{children}</span></label>;
}

export default function RestaurantSignup() {
  const portal = PORTALS.RESTAURANT_OWNER;
  const setAuth = useAuthStore((state) => state.setAuth);
  const submitRestaurantApp = useApplicationStore((state) => state.submitRestaurantApp);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const digits = (v) => v.replace(/\D/g, "");

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (f.owner.trim().length < 2) e.owner = "Enter the owner's name";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
      if (f.password.length < 8) e.password = "Use at least 8 characters";
      if (digits(f.phone).length < 10) e.phone = "Enter a 10-digit phone number";
      else if (!sent) e.otp = "Send the verification code first";
      else if (f.otp !== "123456") e.otp = "Incorrect code. Demo code is 123456";
    }
    if (step === 1) {
      if (f.name.trim().length < 2) e.name = "Enter your restaurant name";
      if (f.description.trim().length < 20) e.description = "Describe your restaurant in at least 20 characters";
      if (f.licenceNo.trim().length < 5) e.licenceNo = "Enter your food licence number";
      if (f.taxId.trim().length < 5) e.taxId = "Enter your tax ID";
    }
    if (step === 2) {
      if (f.address.trim().length < 6) e.address = "Enter the street address";
      if (digits(f.zip).length !== 5) e.zip = "Enter a 5-digit ZIP code";
      if (f.days.length === 0) e.days = "Select at least one open day";
      if (f.close <= f.open) e.close = "Closing time must be after opening";
    }
    if (step === 3) {
      if (f.types.length === 0) e.types = "Select at least one food type";
      if (Number(f.dishes) < 5) e.dishes = "List at least 5 dishes to launch";
      if (!f.docs.logo) e.logo = "Upload a logo or cover photo";
      if (!f.docs.menuFile) e.menuFile = "Upload your menu (photo or PDF)";
    }
    if (step === 4) docList.forEach(([k]) => { if (!f.docs[k]) e[k] = "Upload required"; });
    if (step === 5) {
      if (f.holder.trim().length < 2) e.holder = "Enter the account holder name";
      if (digits(f.account).length < 6) e.account = "Enter a valid account number";
      if (digits(f.routing).length !== 9) e.routing = "Routing number is 9 digits";
    }
    if (step === 6) {
      if (!f.quality) e.quality = "Please confirm";
      if (!f.terms) e.terms = "Please accept the partner terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 6) return setStep(step + 1);
    setBusy(true);
    try {
      const result = await registerUser({ name: f.owner, email: f.email, password: f.password, role: portal.role });
      const id = `RS-${Math.abs([...f.email].reduce((a, c) => a * 31 + c.charCodeAt(0), 11)) % 900000 + 100000}`;
      const docs = Object.fromEntries(docList.map(([k]) => [k, { file: f.docs[k], ok: null }]));
      submitRestaurantApp({ id, name: f.name, owner: f.owner, email: f.email, cuisine: f.cuisine, city: f.city, address: f.address, licence: f.licenceNo, submitted: "Just now", docs });
      setDone({ ...result, appId: id });
    } catch {
      toast.error("We couldn't submit your application");
    }
    setBusy(false);
  };

  const sendCode = () => {
    if (digits(f.phone).length < 10) return setErrors({ phone: "Enter a 10-digit phone number" });
    setSent(true); setErrors({});
    toast.success("Code sent. Demo code: 123456");
  };
  const upload = (key) => (e) => { const file = e.target.files?.[0]; if (file) setF({ ...f, docs: { ...f.docs, [key]: file.name } }); };
  const Upload_ = ({ k, label, hint }) => (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${errors[k] ? "border-red-500" : f.docs[k] ? "border-leaf bg-mint/50" : "border-dashed border-ink/20 bg-white"}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cream">{f.docs[k] ? <FileCheck2 size={18} className="text-leaf" /> : <Upload size={18} />}</span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="block truncate text-xs text-ink/50">{f.docs[k] || hint}</span>{errors[k] && <span className="text-xs font-semibold text-red-600">{errors[k]}</span>}</span>
      <span className="text-xs font-bold text-tangerine">{f.docs[k] ? "Replace" : "Upload"}</span>
      <input type="file" accept="image/*,.pdf" className="sr-only" onChange={upload(k)} />
    </label>
  );
  const Err = ({ k }) => (errors[k] ? <span className="block text-xs font-semibold text-red-600">{errors[k]}</span> : null);

  if (done) {
    return (
      <AuthLayout portal={portal} mode="register" title="Application received" subtitle={`Thanks! We're reviewing ${f.name}.`}>
        <ol className="mt-8 space-y-5">{timeline.map(([t, d], i) => <li key={t} className="flex gap-3">{i === 0 ? <CheckCircle2 className="text-leaf" size={22} /> : i === 1 ? <CircleDashed className="text-tangerine" size={22} /> : <CircleDashed className="text-ink/25" size={22} />}<div><p className="font-bold">{t}{i === 1 && <span className="ml-2 rounded-full bg-sun/40 px-2 py-0.5 text-xs">In progress</span>}</p><p className="text-sm text-ink/55">{d}</p></div></li>)}</ol>
        <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink/60">Reference <b className="text-ink">{done.appId}</b>. In this demo you can open the owner dashboard right away.</div>
        <Button className="mt-6 w-full" size="lg" onClick={() => { setAuth(done); navigate(portal.home, { replace: true, state: { allowedNav: true } }); }}>Open owner dashboard <ArrowRight size={18} /></Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout portal={portal} mode="register" title="List your restaurant" subtitle="Verified onboarding. Takes about 8 minutes.">
      <div className="mt-6">
        <div className="flex gap-1.5">{steps.map((s, i) => <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-tangerine" : "bg-ink/10"}`} />)}</div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink/45">Step {step + 1} of {steps.length} · {steps[step]}</p>
      </div>
      <div className="mt-6 space-y-4">
        {step === 0 && <>
          <Input label="Owner name" icon={UserRound} value={f.owner} onChange={set("owner")} error={errors.owner} placeholder="Maya Chen" />
          <Input label="Business email" icon={Mail} type="email" value={f.email} onChange={set("email")} error={errors.email} placeholder="you@restaurant.com" />
          <Input label="Password" icon={LockKeyhole} type="password" value={f.password} onChange={set("password")} error={errors.password} placeholder="At least 8 characters" />
          <div className="flex items-end gap-2"><Input className="flex-1" label="Mobile number" icon={Phone} type="tel" value={f.phone} onChange={set("phone")} error={errors.phone} placeholder="(415) 555-0134" /><Button variant="secondary" onClick={sendCode} className="mb-0.5 h-[50px]">{sent ? "Resend" : "Send code"}</Button></div>
          <Input label="6-digit verification code" icon={ShieldCheck} inputMode="numeric" maxLength={6} value={f.otp} onChange={set("otp")} error={errors.otp} placeholder="123456" />
        </>}
        {step === 1 && <>
          <Input label="Restaurant name" icon={Store} value={f.name} onChange={set("name")} error={errors.name} placeholder="Spice Route" />
          <div className="grid gap-4 sm:grid-cols-2"><Select label="Main cuisine" value={f.cuisine} onChange={set("cuisine")}>{cuisines.map((c) => <option key={c}>{c}</option>)}</Select><Select label="Years in business" value={f.years} onChange={set("years")}>{["Under 1", "1", "2–5", "5–10", "10+"].map((c) => <option key={c}>{c}</option>)}</Select></div>
          <label className="block"><span className="mb-2 block text-sm font-bold">About your restaurant</span><textarea rows={3} value={f.description} onChange={set("description")} className={`w-full rounded-xl border bg-white p-4 text-sm ${errors.description ? "border-red-500" : "border-ink/12"}`} placeholder="Family-run kitchen serving slow-cooked curries and fresh tandoor breads." /><Err k="description" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Food licence no." icon={Building2} value={f.licenceNo} onChange={set("licenceNo")} error={errors.licenceNo} placeholder="FS-123456" /><Input label="Tax ID / EIN" value={f.taxId} onChange={set("taxId")} error={errors.taxId} placeholder="12-3456789" /></div>
        </>}
        {step === 2 && <>
          <Input label="Street address" icon={MapPin} value={f.address} onChange={set("address")} error={errors.address} placeholder="214 Mission Street" />
          <div className="grid gap-4 sm:grid-cols-2"><Select label="City" value={f.city} onChange={set("city")}>{["San Francisco", "Oakland", "San Jose", "Berkeley"].map((c) => <option key={c}>{c}</option>)}</Select><Input label="ZIP code" inputMode="numeric" maxLength={5} value={f.zip} onChange={set("zip")} error={errors.zip} placeholder="94103" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Opens" type="time" value={f.open} onChange={set("open")} /><Input label="Closes" type="time" value={f.close} onChange={set("close")} error={errors.close} /></div>
          <div><span className="mb-2 block text-sm font-bold">Open days</span><div className="flex flex-wrap gap-2">{days.map((d) => <button type="button" key={d} onClick={() => toggle("days", d)} className={`rounded-full px-4 py-2 text-sm font-bold ${f.days.includes(d) ? "bg-tangerine text-white" : "bg-white text-ink/60"}`}>{d}</button>)}</div><Err k="days" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Select label="Avg. prep time" value={f.prep} onChange={set("prep")}>{["10", "15", "25", "35", "45"].map((c) => <option key={c} value={c}>{c} min</option>)}</Select><Select label="Delivery radius" value={f.radius} onChange={set("radius")}>{["2", "3", "5", "8", "10"].map((c) => <option key={c} value={c}>{c} miles</option>)}</Select></div>
        </>}
        {step === 3 && <>
          <div><span className="mb-2 block text-sm font-bold">What do you serve?</span><div className="flex flex-wrap gap-2">{foodTypes.map((t) => <button type="button" key={t} onClick={() => toggle("types", t)} className={`rounded-full px-4 py-2 text-sm font-bold ${f.types.includes(t) ? "bg-leaf text-white" : "bg-white text-ink/60"}`}>{t}</button>)}</div><Err k="types" /></div>
          <Input label="Dishes you'll list at launch" type="number" min="1" value={f.dishes} onChange={set("dishes")} error={errors.dishes} />
          <Upload_ k="logo" label="Logo or cover photo" hint="Square or wide image, at least 800px" />
          <Upload_ k="menuFile" label="Menu (photo or PDF)" hint="We'll help you digitise it" />
        </>}
        {step === 4 && <>
          {docList.map(([k, label, hint]) => <Upload_ key={k} k={k} label={label} hint={hint} />)}
          <p className="text-xs text-ink/50">Files stay in your browser in this demo and are not uploaded.</p>
        </>}
        {step === 5 && <>
          <p className="text-sm font-bold">Where should we send your payouts?</p>
          <Input label="Account holder / business name" value={f.holder} onChange={set("holder")} error={errors.holder} placeholder="Spice Route LLC" />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Account number" inputMode="numeric" value={f.account} onChange={set("account")} error={errors.account} /><Input label="Routing number" inputMode="numeric" maxLength={9} value={f.routing} onChange={set("routing")} error={errors.routing} placeholder="9 digits" /></div>
          <div className="rounded-2xl bg-white p-4 text-sm"><p className="font-bold">Simple pricing</p><p className="mt-1 text-ink/60">15% commission per order, no setup fee, weekly payouts every Monday.</p></div>
        </>}
        {step === 6 && <>
          <div className="divide-y divide-ink/8 rounded-2xl bg-white p-1 text-sm">
            {[["Restaurant", f.name], ["Owner", `${f.owner} · phone verified`], ["Cuisine", f.cuisine], ["Address", `${f.address}, ${f.city} ${f.zip}`], ["Hours", `${f.open} – ${f.close} · ${f.days.length} days`], ["Serves", f.types.join(", ")], ["Documents", `${Object.keys(f.docs).length} uploaded`], ["Payout", `Account ending ${digits(f.account).slice(-4)}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><span className="text-ink/50">{k}</span><span className="truncate text-right font-bold">{v}</span></div>)}
          </div>
          <Check checked={f.quality} onChange={(v) => setF({ ...f, quality: v })}>I confirm all details are accurate and our kitchen follows local food safety rules.</Check><Err k="quality" />
          <Check checked={f.terms} onChange={(v) => setF({ ...f, terms: v })}>I agree to the Restaurant Partner Terms and Privacy Policy.</Check><Err k="terms" />
        </>}
      </div>
      <div className="mt-7 flex gap-3">
        {step > 0 && <Button variant="secondary" size="lg" onClick={() => { setErrors({}); setStep(step - 1); }}><ArrowLeft size={18} />Back</Button>}
        <Button className="flex-1" size="lg" loading={busy} onClick={next}>{step === 6 ? <>Submit application <BadgeCheck size={18} /></> : <>Continue <ArrowRight size={18} /></>}</Button>
      </div>
      <p className="mt-6 text-center text-sm text-ink/55">Already a partner? <a href={portal.login} className="font-bold text-tangerine">Sign in</a></p>
    </AuthLayout>
  );
}
