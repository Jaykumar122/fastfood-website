import { useQuery } from "@tanstack/react-query";
import { Award, Bell, Briefcase, Check, CreditCard, Heart, Home, LogOut, MapPin, Package, Pencil, Phone, Plus, Star, Trash2, UserRound, Utensils, Wallet } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../api/services";
import { Button, Input, Modal } from "../components/ui";
import { useAuthStore } from "../store/authStore";
import { useFavoritesStore } from "../store/favoritesStore";
import { formatAddress, useProfileStore } from "../store/profileStore";

const tiers = [["Bronze", 0], ["Silver", 500], ["Gold", 1500]];
const dietOptions = ["Vegetarian", "Vegan", "Eggetarian", "Chicken", "No nuts", "Gluten-free", "Mild spice", "Extra spicy"];
const labelIcons = { Home, Work: Briefcase, Other: MapPin };
const makeBlankAddress = (user) => ({
  label: "Home",
  recipient: user?.name || "Customer",
  street: "",
  unit: "",
  city: "San Francisco",
  state: "CA",
  zip: "",
  phone: user?.phone || "",
  note: "",
  isDefault: false,
});

function Section({ icon: Icon, title, action, children }) {
  return (
    <section className="rounded-3xl border border-ink/8 bg-white p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Icon size={20} className="text-tangerine" />{title}</h2>{action}</div>
      {children}
    </section>
  );
}

function Toggle({ on, onChange, label, help }) {
  return (
    <button type="button" onClick={onChange} className="flex w-full items-center justify-between gap-4 py-3 text-left">
      <span><span className="block text-sm font-bold">{label}</span><span className="block text-xs text-ink/45">{help}</span></span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-leaf" : "bg-ink/15"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} /></span>
    </button>
  );
}

function AddressForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (form.recipient.trim().length < 2) next.recipient = "Enter recipient name";
    if (form.street.trim().length < 4) next.street = "Enter the street address";
    if (!form.city.trim()) next.city = "Required";
    if (!form.state.trim()) next.state = "Required";
    if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(form.zip.trim())) next.zip = "Enter valid postal/ZIP code";
    if (form.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number";
    setErrors(next);
    if (!Object.keys(next).length) onSave(form);
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2">{["Home", "Work", "Other"].map((label) => <button type="button" key={label} onClick={() => setForm({ ...form, label })} className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${form.label === label ? "border-tangerine bg-orange-50" : "border-ink/10"}`}>{label}</button>)}</div>
      <Input label="Recipient name" value={form.recipient} onChange={set("recipient")} error={errors.recipient} />
      <Input label="Street address" value={form.street} onChange={set("street")} error={errors.street} />
      <Input label="Apt, suite, floor (optional)" value={form.unit} onChange={set("unit")} />
      <div className="grid grid-cols-6 gap-3"><Input className="col-span-3" label="City" value={form.city} onChange={set("city")} error={errors.city} /><Input className="col-span-1" label="State" value={form.state} onChange={set("state")} error={errors.state} /><Input className="col-span-2" label="ZIP" inputMode="numeric" value={form.zip} onChange={set("zip")} error={errors.zip} /></div>
      <Input label="Phone" icon={Phone} value={form.phone} onChange={set("phone")} error={errors.phone} />
      <Input label="Delivery instructions" placeholder="Gate code, landmark, where to leave it" value={form.note} onChange={set("note")} />
      <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} className="h-4 w-4 accent-tangerine" />Make this my default address</label>
      <div className="flex gap-3"><Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button><Button type="submit" className="flex-1">Save address</Button></div>
    </form>
  );
}

function CardForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ number: "", expiry: "", name: "" });
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const digits = form.number.replace(/\s/g, "");
    if (!/^\d{16}$/.test(digits)) return setError("Enter a 16-digit card number");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) return setError("Expiry must be MM/YY");
    onSave({ brand: digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card", last4: digits.slice(-4), expiry: form.expiry });
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Name on card" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <Input label="Card number" icon={CreditCard} inputMode="numeric" placeholder="4242 4242 4242 4242" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} />
      <Input label="Expiry" placeholder="MM/YY" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} error={error} />
      <p className="text-xs text-ink/45">Only the brand and last 4 digits are stored on this device.</p>
      <div className="flex gap-3"><Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button><Button type="submit" className="flex-1">Save card</Button></div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const profile = useProfileStore();
  const favorites = useFavoritesStore();
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const [details, setDetails] = useState({ name: user?.name || "", phone: user?.phone || "+1 555 012 4488", birthday: user?.birthday || "", gender: user?.gender || "" });
  const [editing, setEditing] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);

  const spent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const points = Math.round(spent * 10);
  const tierIndex = tiers.reduce((best, [, min], index) => (points >= min ? index : best), 0);
  const next = tiers[tierIndex + 1];
  const progress = next ? Math.min(100, ((points - tiers[tierIndex][1]) / (next[1] - tiers[tierIndex][1])) * 100) : 100;
  const initials = (user?.name || "Guest").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const savedDishes = favorites.dishes?.length || 0;
  const savedRestaurants = favorites.restaurants?.length || 0;

  const saveDetails = (event) => {
    event.preventDefault();
    if (details.name.trim().length < 2) return toast.error("Enter your name");
    updateUser(details);
    if (profile.syncUser) profile.syncUser({ ...user, ...details });
    toast.success("Profile updated");
  };

  const userAddresses = profile.getAddressesForUser ? profile.getAddressesForUser(user) : profile.addresses;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="overflow-hidden rounded-[28px] bg-ink text-white">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-9">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-tangerine font-display text-3xl font-extrabold">{initials}</div>
          <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.2em] text-sun">{["Bronze", "Silver", "Gold"][tierIndex]} member</p><h1 className="mt-1 truncate font-display text-3xl font-extrabold sm:text-4xl">{user?.name}</h1><p className="truncate text-sm text-white/55">{user?.email} · Member since Jan 2026</p></div>
          <button onClick={() => { logout(); navigate("/", { replace: true }); }} className="flex items-center gap-2 self-start rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold hover:bg-white/10"><LogOut size={16} />Sign out</button>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
          {[[Package, orders.length, "Orders"], [Star, `$${spent.toFixed(0)}`, "Total spent"], [Heart, savedDishes + savedRestaurants, "Favorites"], [MapPin, userAddresses.length, "Addresses"]].map(([Icon, value, label], index) => <div key={label} className={`p-5 text-center ${index % 2 ? "border-l border-white/10" : ""} ${index > 1 ? "border-t border-white/10 sm:border-t-0" : ""} ${index === 2 ? "sm:border-l" : ""}`}><Icon size={18} className="mx-auto text-sun" /><p className="mt-2 font-display text-2xl font-extrabold">{value}</p><p className="text-xs text-white/50">{label}</p></div>)}
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <Section icon={Award} title="Rush rewards">
          <div className="flex items-end justify-between"><p className="font-display text-4xl font-extrabold">{points.toLocaleString()}<span className="ml-2 text-base font-bold text-ink/40">points</span></p><p className="text-sm font-bold text-leaf">{["Bronze", "Silver", "Gold"][tierIndex]}</p></div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-tangerine transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-sm text-ink/55">{next ? `${next[1] - points} points to reach ${next[0]}. Earn 10 points for every $1 spent.` : "You've reached the top tier. Enjoy free delivery perks."}</p>
        </Section>

        <Section icon={Wallet} title="Fastfood wallet">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-ink/50">Available balance</p><p className="font-display text-4xl font-extrabold">${profile.wallet.toFixed(2)}</p></div><div className="flex gap-2">{[10, 25, 50].map((amount) => <Button key={amount} size="sm" variant="secondary" onClick={() => { profile.topUp(amount); toast.success(`$${amount} added to your wallet`); }}>+ ${amount}</Button>)}</div></div>
          <ul className="mt-5 divide-y divide-ink/8 text-sm">{profile.walletTx.slice(0, 5).map((tx) => <li key={tx.id} className="flex justify-between py-3"><span>{tx.label}<span className="ml-2 text-xs text-ink/40">{tx.date}</span></span><span className={`font-bold ${tx.amount > 0 ? "text-leaf" : ""}`}>{tx.amount > 0 ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}</span></li>)}</ul>
          <p className="mt-3 text-xs text-ink/40">Demo wallet: top-ups are simulated. Use it at checkout.</p>
        </Section>

        <Section icon={UserRound} title="Personal details">
          <form onSubmit={saveDetails} className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} />
            <Input label="Email" value={user?.email || ""} disabled readOnly />
            <Input label="Mobile number" icon={Phone} value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} />
            <Input label="Birthday" type="date" value={details.birthday} onChange={(event) => setDetails({ ...details, birthday: event.target.value })} />
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-bold">Gender (optional)</span><select value={details.gender} onChange={(event) => setDetails({ ...details, gender: event.target.value })} className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-sm"><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option></select></label>
            <div className="sm:col-span-2"><Button type="submit">Save changes</Button></div>
          </form>
        </Section>

        <Section icon={MapPin} title="Saved addresses" action={<Button size="sm" onClick={() => setEditing(makeBlankAddress(user))}><Plus size={16} />Add new</Button>}>
          {userAddresses.length === 0 && <p className="rounded-2xl bg-cream p-6 text-center text-sm text-ink/55">No saved addresses yet. Add one to check out faster.</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {userAddresses.map((address) => {
              const Icon = labelIcons[address.label] || MapPin;
              return (
                <article key={address.id} className={`rounded-2xl border p-5 ${address.isDefault ? "border-tangerine bg-orange-50/60" : "border-ink/10"}`}>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-display font-bold"><Icon size={18} className="text-tangerine" />{address.label}</span>{address.isDefault && <span className="rounded-full bg-tangerine px-2.5 py-1 text-[11px] font-bold text-white">Default</span>}</div>
                  <p className="mt-3 text-sm font-bold">{address.recipient}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/65">{formatAddress(address)}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55"><Phone size={13} />{address.phone}</p>
                  {address.note && <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-xs italic text-ink/55">“{address.note}”</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => setEditing(address)} className="flex items-center gap-1.5 rounded-lg bg-ink/5 px-3 py-2 text-xs font-bold hover:bg-ink/10"><Pencil size={13} />Edit</button>
                    {!address.isDefault && <button onClick={() => { profile.setDefaultAddress(address.id, user?.email); toast.success("Default address updated"); }} className="flex items-center gap-1.5 rounded-lg bg-ink/5 px-3 py-2 text-xs font-bold hover:bg-ink/10"><Check size={13} />Set default</button>}
                    <button onClick={() => { profile.removeAddress(address.id, user?.email); toast("Address removed"); }} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={13} />Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section icon={CreditCard} title="Payment methods" action={<Button size="sm" variant="secondary" onClick={() => setCardOpen(true)}><Plus size={16} />Add card</Button>}>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.cards.map((card) => <div key={card.id} className="flex items-center justify-between rounded-2xl bg-ink p-5 text-white"><div><p className="text-xs font-bold uppercase tracking-widest text-white/45">{card.brand}{card.isDefault && " · Default"}</p><p className="mt-2 font-display text-lg font-bold tracking-widest">•••• {card.last4}</p><p className="text-xs text-white/50">Expires {card.expiry}</p></div><button onClick={() => profile.removeCard(card.id)} aria-label="Remove card" className="rounded-lg p-2 hover:bg-white/10"><Trash2 size={17} /></button></div>)}
            <div className="rounded-2xl border border-dashed border-ink/15 p-5 text-sm text-ink/55">Cash on delivery is always available at checkout.</div>
          </div>
        </Section>

        <Section icon={Utensils} title="Food preferences">
          <p className="mb-4 text-sm text-ink/55">We'll use these to highlight dishes that suit you.</p>
          <div className="flex flex-wrap gap-2">{dietOptions.map((diet) => { const on = profile.diets.includes(diet); return <button key={diet} onClick={() => profile.toggleDiet(diet)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${on ? "border-leaf bg-leaf text-white" : "border-ink/12 hover:border-ink/30"}`}>{on && "✓ "}{diet}</button>; })}</div>
        </Section>

        <Section icon={Bell} title="Notifications">
          <div className="divide-y divide-ink/8">
            <Toggle label="Order updates" help="Live status from the kitchen and your rider" on={profile.notifications.orderUpdates} onChange={() => profile.toggleNotification("orderUpdates")} />
            <Toggle label="Offers and promo codes" help="Deals from restaurants near you" on={profile.notifications.promos} onChange={() => profile.toggleNotification("promos")} />
            <Toggle label="SMS alerts" help="Text me when my rider arrives" on={profile.notifications.sms} onChange={() => profile.toggleNotification("sms")} />
          </div>
        </Section>

        <div className="flex flex-wrap gap-3 text-sm font-bold"><Link to="/orders" className="rounded-xl bg-white px-5 py-3 ring-1 ring-ink/10 hover:ring-ink/30">View order history</Link><Link to="/favorites" className="rounded-xl bg-white px-5 py-3 ring-1 ring-ink/10 hover:ring-ink/30">Saved favorites</Link></div>
      </div>

      <Modal open={!!editing} title={editing?.id ? "Edit address" : "Add address"} onClose={() => setEditing(null)}>
        {editing && <AddressForm initial={editing} onCancel={() => setEditing(null)} onSave={(values) => { profile.saveAddress(values, user?.email); setEditing(null); toast.success("Address saved"); }} />}
      </Modal>
      <Modal open={cardOpen} title="Add a card" onClose={() => setCardOpen(false)}>
        <CardForm onCancel={() => setCardOpen(false)} onSave={(card) => { profile.addCard(card); setCardOpen(false); toast.success("Card saved"); }} />
      </Modal>
    </div>
  );
}
