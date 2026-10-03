import { ArrowLeft, ArrowRight, BadgeCheck, Bike, Car, CheckCircle2, CircleDashed, FileCheck2, IdCard, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, Upload, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/services";
import { Button, Input } from "../components/ui";
import { useApplicationStore } from "../store/applicationStore";
import { useAuthStore } from "../store/authStore";
import { AuthLayout, PORTALS } from "./AuthPages";

const steps = ["Account", "Phone", "Vehicle", "Documents", "Payout", "Review"];
const vehicles = [["BICYCLE", "Bicycle", Bike], ["SCOOTER", "Scooter", Bike], ["CAR", "Car", Car]];
const docList = [
  ["idFront", "Government ID", "Passport, national ID or driver licence"],
  ["licence", "Driving licence", "Not required for bicycle riders"],
  ["vehicleDoc", "Vehicle registration & insurance", "Not required for bicycle riders"],
  ["selfie", "Profile selfie", "Clear photo of your face, no sunglasses"],
];
const cities = ["San Francisco", "Oakland", "San Jose", "Berkeley"];
const verifySteps = [
  ["Application submitted", "We've got your details."],
  ["Document review", "Usually within 24 hours."],
  ["Background check", "Takes 1–3 business days."],
  ["Approved & activated", "Start accepting deliveries."],
];

const initial = { name: "", email: "", password: "", city: cities[0], phone: "", otp: "", dob: "", vehicle: "SCOOTER", plate: "", licenceNo: "", licenceExp: "", docs: {}, holder: "", account: "", routing: "", emName: "", emPhone: "", bg: false, terms: false };

function Select({ label, value, onChange, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select value={value} onChange={onChange} className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-sm">{children}</select></label>;
}

function Check({ checked, onChange, children }) {
  return <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/70"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-tangerine" /><span>{children}</span></label>;
}

export default function DeliverySignup() {
  const portal = PORTALS.DELIVERY_PARTNER;
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const submitApplication = useApplicationStore((state) => state.submitApplication);
  const [step, setStep] = useState(0);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const needsLicence = f.vehicle !== "BICYCLE";

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (f.name.trim().length < 2) e.name = "Enter your full name";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
      if (f.password.length < 8) e.password = "Use at least 8 characters";
    }
    if (step === 1) {
      if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number";
      else if (!sent) e.otp = "Send the code first";
      else if (f.otp !== "123456") e.otp = "Incorrect code. Demo code is 123456";
    }
    if (step === 2) {
      const age = (Date.now() - new Date(f.dob).getTime()) / 31557600000;
      if (!f.dob || age < 18) e.dob = "You must be 18 or older";
      if (needsLicence) {
        if (f.plate.trim().length < 4) e.plate = "Enter your plate number";
        if (f.licenceNo.trim().length < 5) e.licenceNo = "Enter your licence number";
        if (!f.licenceExp || new Date(f.licenceExp) < new Date()) e.licenceExp = "Licence must be valid";
      }
    }
    if (step === 3) {
      docList.forEach(([k]) => { if ((k === "licence" || k === "vehicleDoc") && !needsLicence) return; if (!f.docs[k]) e[k] = "Upload required"; });
    }
    if (step === 4) {
      if (f.holder.trim().length < 2) e.holder = "Enter the account holder name";
      if (f.account.replace(/\D/g, "").length < 6) e.account = "Enter a valid account number";
      if (f.routing.replace(/\D/g, "").length !== 9) e.routing = "Routing number is 9 digits";
      if (f.emName.trim().length < 2) e.emName = "Enter a contact name";
      if (f.emPhone.replace(/\D/g, "").length < 10) e.emPhone = "Enter a 10-digit number";
    }
    if (step === 5) {
      if (!f.bg) e.bg = "Consent is required";
      if (!f.terms) e.terms = "Please accept the terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < 5) return setStep(step + 1);
    setBusy(true);
    try {
      const result = await registerUser({ name: f.name, email: f.email, password: f.password, role: portal.role });
      const id = `DP-${Math.abs([...f.email].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 900000 + 100000}`;
      submitApplication({ id, name: f.name, email: f.email, city: f.city, vehicle: f.vehicle, phone: f.phone, plate: f.plate, licenceNo: f.licenceNo, submitted: "Just now", docs: Object.fromEntries(Object.entries(f.docs).map(([k, file]) => [k, { file, ok: null }])) });
      setDone({ ...result, appId: id });
    } catch {
      toast.error("We couldn't submit your application");
    }
    setBusy(false);
  };

  const sendCode = () => {
    if (f.phone.replace(/\D/g, "").length < 10) return setErrors({ phone: "Enter a 10-digit phone number" });
    setSent(true); setErrors({});
    toast.success("Code sent. Demo code: 123456");
  };

  const upload = (key) => (e) => {
    const file = e.target.files?.[0];
    if (file) setF({ ...f, docs: { ...f.docs, [key]: file.name } });
  };

  if (done) {
    return (
      <AuthLayout portal={portal} mode="register" title="Application received" subtitle="Thanks for applying. We're verifying your details now.">
        <ol className="mt-8 space-y-5">{verifySteps.map(([t, d], i) => <li key={t} className="flex gap-3">{i === 0 ? <CheckCircle2 className="text-leaf" size={22} /> : i === 1 ? <CircleDashed className="text-tangerine" size={22} /> : <CircleDashed className="text-ink/25" size={22} />}<div><p className="font-bold">{t}{i === 1 && <span className="ml-2 rounded-full bg-sun/40 px-2 py-0.5 text-xs">In progress</span>}</p><p className="text-sm text-ink/55">{d}</p></div></li>)}</ol>
        <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-ink/60">Reference <b className="text-ink">{done.appId}</b>. In this demo you can explore the rider hub right away.</div>
        <Button className="mt-6 w-full" size="lg" onClick={() => { setAuth(done); navigate(portal.home, { replace: true, state: { allowedNav: true } }); }}>Go to rider hub <ArrowRight size={18} /></Button>
      </AuthLayout>
    );
  }

  const Err = ({ k }) => (errors[k] ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{errors[k]}</span> : null);

  return (
    <AuthLayout portal={portal} mode="register" title="Become a rider" subtitle="Quick verified signup. Takes about 5 minutes.">
      <div className="mt-6">
        <div className="flex gap-1.5">{steps.map((s, i) => <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-tangerine" : "bg-ink/10"}`} />)}</div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink/45">Step {step + 1} of {steps.length} · {steps[step]}</p>
      </div>
      <div className="mt-6 space-y-4">
        {step === 0 && <>
          <Input label="Full name (as on your ID)" icon={UserRound} value={f.name} onChange={set("name")} error={errors.name} placeholder="Marcus Reed" />
          <Input label="Email address" icon={Mail} type="email" value={f.email} onChange={set("email")} error={errors.email} placeholder="you@example.com" />
          <Input label="Password" icon={LockKeyhole} type="password" value={f.password} onChange={set("password")} error={errors.password} placeholder="At least 8 characters" />
          <Select label="City you'll deliver in" value={f.city} onChange={set("city")}>{cities.map((c) => <option key={c}>{c}</option>)}</Select>
        </>}
        {step === 1 && <>
          <div className="flex items-end gap-2"><Input className="flex-1" label="Mobile number" icon={Phone} type="tel" value={f.phone} onChange={set("phone")} error={errors.phone} placeholder="(415) 555-0134" /><Button variant="secondary" onClick={sendCode} className="mb-0.5 h-[50px]">{sent ? "Resend" : "Send code"}</Button></div>
          <Input label="6-digit verification code" icon={ShieldCheck} inputMode="numeric" maxLength={6} value={f.otp} onChange={set("otp")} error={errors.otp} placeholder="123456" />
          <p className="text-xs text-ink/50">We use your number to share delivery updates with customers. Demo code: 123456.</p>
        </>}
        {step === 2 && <>
          <div><span className="mb-2 block text-sm font-bold">How will you deliver?</span><div className="grid grid-cols-3 gap-2">{vehicles.map(([id, label, Icon]) => <button type="button" key={id} onClick={() => setF({ ...f, vehicle: id })} className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-bold ${f.vehicle === id ? "border-tangerine bg-orange-50 text-tangerine" : "border-ink/10 bg-white"}`}><Icon size={20} />{label}</button>)}</div></div>
          <Input label="Date of birth" type="date" value={f.dob} onChange={set("dob")} error={errors.dob} max={new Date().toISOString().slice(0, 10)} />
          {needsLicence ? <>
            <Input label="Plate number" icon={IdCard} value={f.plate} onChange={set("plate")} error={errors.plate} placeholder="7ABC123" />
            <div className="grid gap-4 sm:grid-cols-2"><Input label="Driving licence no." value={f.licenceNo} onChange={set("licenceNo")} error={errors.licenceNo} placeholder="D1234567" /><Input label="Licence expiry" type="date" value={f.licenceExp} onChange={set("licenceExp")} error={errors.licenceExp} /></div>
          </> : <p className="rounded-xl bg-mint p-3 text-sm text-leaf">Bicycle riders don't need a licence or vehicle papers.</p>}
        </>}
        {step === 3 && <>
          {docList.filter(([k]) => needsLicence || (k !== "licence" && k !== "vehicleDoc")).map(([k, label, hint]) => (
            <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${errors[k] ? "border-red-500" : f.docs[k] ? "border-leaf bg-mint/50" : "border-dashed border-ink/20 bg-white"}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cream">{f.docs[k] ? <FileCheck2 size={18} className="text-leaf" /> : <Upload size={18} />}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="block truncate text-xs text-ink/50">{f.docs[k] || hint}</span>{errors[k] && <span className="text-xs font-semibold text-red-600">{errors[k]}</span>}</span>
              <span className="text-xs font-bold text-tangerine">{f.docs[k] ? "Replace" : "Upload"}</span>
              <input type="file" accept="image/*,.pdf" className="sr-only" onChange={upload(k)} />
            </label>
          ))}
          <p className="text-xs text-ink/50">Files stay in your browser in this demo and are not uploaded.</p>
        </>}
        {step === 4 && <>
          <p className="text-sm font-bold">Where should we send your earnings?</p>
          <Input label="Account holder name" value={f.holder} onChange={set("holder")} error={errors.holder} placeholder="Marcus Reed" />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Account number" inputMode="numeric" value={f.account} onChange={set("account")} error={errors.account} /><Input label="Routing number" inputMode="numeric" maxLength={9} value={f.routing} onChange={set("routing")} error={errors.routing} placeholder="9 digits" /></div>
          <p className="pt-2 text-sm font-bold">Emergency contact</p>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Contact name" value={f.emName} onChange={set("emName")} error={errors.emName} /><Input label="Contact phone" type="tel" value={f.emPhone} onChange={set("emPhone")} error={errors.emPhone} /></div>
        </>}
        {step === 5 && <>
          <div className="divide-y divide-ink/8 rounded-2xl bg-white p-1 text-sm">
            {[["Name", f.name], ["Email", f.email], ["Phone", `${f.phone} · verified`], ["City", f.city], ["Vehicle", `${f.vehicle.toLowerCase()}${needsLicence ? ` · ${f.plate}` : ""}`], ["Documents", `${Object.keys(f.docs).length} uploaded`], ["Payout", `Account ending ${f.account.replace(/\D/g, "").slice(-4)}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><span className="text-ink/50">{k}</span><span className="truncate text-right font-bold capitalize">{v}</span></div>)}
          </div>
          <Check checked={f.bg} onChange={(v) => setF({ ...f, bg: v })}>I consent to an identity and background check.</Check><Err k="bg" />
          <Check checked={f.terms} onChange={(v) => setF({ ...f, terms: v })}>I agree to the Rider Terms and Privacy Policy.</Check><Err k="terms" />
        </>}
      </div>
      <div className="mt-7 flex gap-3">
        {step > 0 && <Button variant="secondary" size="lg" onClick={() => { setErrors({}); setStep(step - 1); }}><ArrowLeft size={18} />Back</Button>}
        <Button className="flex-1" size="lg" loading={busy} onClick={next}>{step === 5 ? <>Submit application <BadgeCheck size={18} /></> : <>Continue <ArrowRight size={18} /></>}</Button>
      </div>
      <p className="mt-6 text-center text-sm text-ink/55">Already a rider? <a href={portal.login} className="font-bold text-tangerine">Sign in</a></p>
    </AuthLayout>
  );
}
