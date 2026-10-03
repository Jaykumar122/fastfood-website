import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Banknote, Bike, CheckCircle2, ChevronRight, Clock3, FileCheck2, Flame, History, Home, LifeBuoy, MapPin, Navigation, Phone, Star, Target, Trophy, UserRound, Wallet, XCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/ui";
import { useApplicationStore } from "../store/applicationStore";
import { useAuthStore } from "../store/authStore";
import { getAssignedOrders, getAvailableDeliveries, getDeliveryHistory, updateDeliveryStatus } from "../api/services";

const tabs = [["home", "Home", Home], ["deliveries", "Deliveries", Bike], ["earnings", "Earnings", Wallet], ["profile", "Profile", UserRound]];
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function Card({ title, action, children, className = "" }) {
  return <section className={`rounded-3xl border border-ink/8 bg-white p-5 sm:p-6 ${className}`}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">{title}</h2>{action}</div>{children}</section>;
}

function Stat({ icon: Icon, label, value, note, tone = "bg-mint text-leaf" }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={19} /></span><p className="mt-4 font-display text-3xl font-extrabold tabular-nums">{value}</p><p className="text-sm text-ink/55">{label}</p>{note && <p className="mt-1 text-xs font-bold text-leaf">{note}</p>}</div>;
}

function Bars({ data, highlight }) {
  const max = Math.max(...data.map((d) => d[1]), 10);
  return <div className="flex h-44 items-end gap-2 sm:gap-3">{data.map(([d, v], i) => <div key={d} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"><span className="text-[11px] font-bold opacity-0 transition group-hover:opacity-100">${v}</span><div className={`w-full rounded-t-lg transition ${i === highlight ? "bg-leaf" : "bg-leaf/35 group-hover:bg-leaf/70"}`} style={{ height: `${Math.max(8, (v / max) * 75)}%` }} /><span className="text-xs text-ink/50">{d}</span></div>)}</div>;
}

function VerificationBanner() {
  const email = useAuthStore((state) => state.user?.email);
  const app = useApplicationStore((state) => state.applications.find((a) => a.email === email));
  if (!app || app.status === "APPROVED") return null;
  const rejected = app.status === "REJECTED";
  return <div className={`mb-6 rounded-2xl px-5 py-4 text-sm font-semibold ${rejected ? "bg-red-100 text-red-700" : "bg-sun/40"}`}>{rejected ? `Your application was rejected${app.note ? `: ${app.note}` : "."}` : "Your documents are under review. You'll be able to go live once an admin approves your application."}</div>;
}

function calcOrderPay(order) {
  const base = 3.50;
  const fee = Number(order?.deliveryFee || 2.00);
  const tip = Number(order?.tip || 0);
  return {
    base,
    fee,
    tip,
    total: +(base + fee + tip).toFixed(2),
  };
}

export default function RiderDashboard() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState("home");
  const [online, setOnline] = useState(true);
  const [requestIdx, setRequestIdx] = useState(0);
  const [timer, setTimer] = useState(30);
  const [declined, setDeclined] = useState(0);
  const [cashedOut, setCashedOut] = useState(0);
  const [payouts, setPayouts] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real backend queries
  const { data: assignedOrders = [], refetch: refetchAssigned } = useQuery({
    queryKey: ["delivery-assigned"],
    queryFn: getAssignedOrders,
    refetchInterval: 5000,
  });

  const { data: availableOrders = [], refetch: refetchAvailable } = useQuery({
    queryKey: ["delivery-available"],
    queryFn: getAvailableDeliveries,
    refetchInterval: 5000,
  });

  const { data: historyOrders = [], refetch: refetchHistory } = useQuery({
    queryKey: ["delivery-history"],
    queryFn: getDeliveryHistory,
    refetchInterval: 10000,
  });

  const active = assignedOrders.length > 0 ? assignedOrders[0] : null;
  const currentOffer = (!active && online && availableOrders.length > 0)
    ? availableOrders[requestIdx % availableOrders.length]
    : null;

  useEffect(() => {
    if (currentOffer) setTimer(30);
  }, [currentOffer?.id, requestIdx, online]);

  useEffect(() => {
    if (!currentOffer) return;
    const t = setInterval(() => {
      setTimer((s) => {
        if (s <= 1) {
          setRequestIdx((i) => i + 1);
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [currentOffer?.id]);

  // Real earnings calculations
  const totalEarnedFromHistory = useMemo(() => {
    return historyOrders.reduce((sum, h) => sum + calcOrderPay(h).total, 0);
  }, [historyOrders]);

  const tipsTotal = useMemo(() => {
    return historyOrders.reduce((sum, h) => sum + Number(h.tip || 0), 0);
  }, [historyOrders]);

  const basePayTotal = useMemo(() => {
    return historyOrders.reduce((sum, h) => sum + calcOrderPay(h).base + calcOrderPay(h).fee, 0);
  }, [historyOrders]);

  const balance = Math.max(0, +(totalEarnedFromHistory - cashedOut).toFixed(2));
  const activePay = active ? calcOrderPay(active) : null;
  const offerPay = currentOffer ? calcOrderPay(currentOffer) : null;

  // Accept available order
  const handleAccept = async (orderId) => {
    setIsUpdating(true);
    try {
      await updateDeliveryStatus(orderId, "TO_RESTAURANT");
      toast.success("Order accepted! Head to the restaurant.");
      await queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      await queryClient.invalidateQueries({ queryKey: ["delivery-available"] });
    } catch {
      toast.error("Failed to accept delivery");
    } finally {
      setIsUpdating(false);
    }
  };

  // Decline order
  const handleDecline = () => {
    setDeclined((d) => d + 1);
    setRequestIdx((i) => i + 1);
    toast("Request skipped");
  };

  // Advance order status (TO_RESTAURANT -> PICKED_UP -> DELIVERED)
  const handleAdvance = async () => {
    if (!active) return;
    setIsUpdating(true);
    try {
      if (active.status === "PICKED_UP" || active.status === "OUT_FOR_DELIVERY") {
        await updateDeliveryStatus(active.id, "DELIVERED");
        toast.success(`Delivered! You earned ${money(activePay.total)}`);
        await queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
        await queryClient.invalidateQueries({ queryKey: ["delivery-history"] });
      } else {
        await updateDeliveryStatus(active.id, "PICKED_UP");
        toast.success("Order picked up! Deliver to customer.");
        await queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCashOut = () => {
    if (balance < 5) return toast.error("Minimum cash out is $5");
    setPayouts([["Today", balance], ...payouts]);
    setCashedOut((c) => +(c + balance).toFixed(2));
    toast.success(`${money(balance)} transferred to your account`);
  };

  const isPickedUp = active?.status === "PICKED_UP" || active?.status === "OUT_FOR_DELIVERY";
  const stageTitle = isPickedUp ? "On the way to customer" : "Head to restaurant";
  const buttonLabel = isPickedUp ? "Mark as Delivered" : "I've arrived & picked up";

  const weekData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d, i) => [
      d,
      Math.round(totalEarnedFromHistory * (i === 6 ? 0.25 : 0.125))
    ]);
  }, [totalEarnedFromHistory]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <VerificationBanner />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-leaf">Rider hub · Database Connected</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Hi {user?.name?.split(" ")[0] || "rider"}, ready to roll?</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchAssigned();
              refetchAvailable();
              refetchHistory();
              toast.success("Syncing with database...");
            }}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-xs font-bold text-ink/65 hover:bg-cream"
            title="Refresh database"
          >
            <RefreshCw size={13} /> Sync
          </button>
          <label className={`flex cursor-pointer items-center gap-3 rounded-full px-5 py-3 text-sm font-bold ${online ? "bg-mint text-leaf" : "bg-ink/8 text-ink/55"}`}>
            <input type="checkbox" checked={online} onChange={(e) => { setOnline(e.target.checked); toast(e.target.checked ? "You're online" : "You're offline"); }} className="accent-leaf" />
            {online ? "Online · accepting orders" : "Offline"}
          </label>
        </div>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === id ? "bg-leaf text-white" : "bg-white text-ink/65"}`}
          >
            <Icon size={16} />
            {label}
            {id === "deliveries" && assignedOrders.length > 0 && (
              <span className="ml-1 rounded-full bg-tangerine px-2 py-0.5 text-xs text-white">
                {assignedOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Banknote} label="Completed earnings" value={money(totalEarnedFromHistory)} note="Live from MySQL orders" />
            <Stat icon={Bike} label="Deliveries completed" value={historyOrders.length} tone="bg-sun/40 text-ink" />
            <Stat icon={Star} label="Rating" value="4.9" note="Top 10% in your city" tone="bg-orange-50 text-tangerine" />
            <Stat icon={Navigation} label="Active jobs" value={assignedOrders.length} tone="bg-ink text-white" />
          </div>

          {active ? (
            <Card title="Active Delivery in Progress" action={<span className="rounded-full bg-sun/40 px-3 py-1 text-xs font-bold">{active.id}</span>} className="border-leaf/40 ring-2 ring-leaf/20">
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <MapPin className={!isPickedUp ? "text-tangerine" : "text-leaf"} size={20} />
                  <div>
                    <p className="text-xs font-bold uppercase text-ink/40">Pickup</p>
                    <p className="font-bold">{active.restaurantName}</p>
                    <p className="text-sm text-ink/55">{(active.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0)} items · {(active.items || []).map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className={isPickedUp ? "text-tangerine" : "text-ink/30"} size={20} />
                  <div>
                    <p className="text-xs font-bold uppercase text-ink/40">Drop-off</p>
                    <p className="font-bold">{active.customerName || "Customer"}</p>
                    <p className="text-sm text-ink/55">{active.address}</p>
                  </div>
                </li>
              </ol>

              <div className="mt-4 rounded-2xl bg-cream p-4 text-sm font-bold flex flex-wrap items-center justify-between gap-2">
                <span>{stageTitle} · Status: <span className="capitalize text-leaf">{active.status.replaceAll("_", " ").toLowerCase()}</span></span>
                <span className="text-leaf font-extrabold text-base">Earn {money(activePay?.total)}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="lg" loading={isUpdating} onClick={handleAdvance}>
                  {buttonLabel}
                </Button>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(isPickedUp ? active.address : active.restaurantName)}`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="lg"><Navigation size={16} />Directions</Button>
                </a>
                {active.phone && (
                  <a href={`tel:${active.phone}`}>
                    <Button variant="secondary" size="lg"><Phone size={16} />Call {active.phone}</Button>
                  </a>
                )}
              </div>
            </Card>
          ) : currentOffer ? (
            <Card title="New Customer Order Request" action={<span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-tangerine"><Clock3 size={13} />{timer}s</span>} className="border-tangerine/50 ring-2 ring-tangerine/20">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-display text-2xl font-extrabold">{currentOffer.restaurantName} <ChevronRight className="inline" size={20} /> {currentOffer.customerName || "Customer"}</p>
                  <p className="mt-1 text-sm text-ink/55">Dropoff: <b>{currentOffer.address}</b></p>
                  <p className="mt-2 text-sm font-bold">{(currentOffer.items || []).length} items · Total order value: ${Number(currentOffer.total || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl font-extrabold text-leaf">{money(offerPay?.total)}</p>
                  {offerPay?.tip > 0 && <p className="text-xs font-bold text-ink/50">incl. {money(offerPay.tip)} customer tip</p>}
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-ink/8">
                <div className="h-1.5 rounded-full bg-tangerine transition-all" style={{ width: `${(timer / 30) * 100}%` }} />
              </div>
              <div className="mt-5 flex gap-3">
                <Button className="flex-1" size="lg" loading={isUpdating} onClick={() => handleAccept(currentOffer.id)}>
                  <CheckCircle2 size={18} />Accept Delivery ({currentOffer.id})
                </Button>
                <Button variant="secondary" size="lg" className="flex-1" onClick={handleDecline}>
                  <XCircle size={18} />Decline
                </Button>
              </div>
            </Card>
          ) : (
            <Card title="No pending requests right now">
              <div className="py-6 text-center">
                <Bike className="mx-auto mb-3 text-leaf/50" size={36} />
                <p className="text-sm font-semibold text-ink/75">
                  {online
                    ? "You are online and ready! As soon as customers place orders, they will appear here live."
                    : "You are currently offline. Turn on the switch above to start receiving delivery jobs."}
                </p>
                {online && (
                  <p className="mt-2 text-xs text-ink/40">Database auto-syncs every 5 seconds.</p>
                )}
              </div>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card title="Weekly earnings estimate" action={<span className="font-display text-xl font-extrabold text-leaf">{money(totalEarnedFromHistory)}</span>}>
              <Bars data={weekData} highlight={6} />
            </Card>
            <div className="space-y-6">
              <Card title="Daily target" action={<Target size={20} className="text-tangerine" />}>
                <p className="font-display text-3xl font-extrabold">{money(totalEarnedFromHistory)} <span className="text-base font-bold text-ink/40">/ $120.00</span></p>
                <div className="mt-3 h-2.5 rounded-full bg-ink/8">
                  <div className="h-2.5 rounded-full bg-leaf transition-all" style={{ width: `${Math.min(100, (totalEarnedFromHistory / 120) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink/50">Keep delivering to unlock weekly bonuses.</p>
              </Card>
              <Card title="Peak hours" action={<Flame size={20} className="text-tangerine" />}>
                <ul className="space-y-2 text-sm">{[["12:00 – 2:00 PM", "1.2×", "Lunch rush"], ["6:00 – 9:00 PM", "1.5×", "Dinner rush"]].map(([t, m, n]) => <li key={t} className="flex items-center justify-between rounded-xl bg-cream px-4 py-3"><span><b>{t}</b><span className="ml-2 text-ink/50">{n}</span></span><span className="font-bold text-tangerine">{m}</span></li>)}</ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      {tab === "deliveries" && (
        <div className="mt-6 space-y-6">
          {active && (
            <Card title="In progress delivery" className="border-leaf/30 bg-mint/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-lg">{active.restaurantName} → {active.address}</p>
                  <p className="text-sm text-ink/55 mt-1">Status: <b className="capitalize text-leaf">{active.status.replaceAll("_", " ").toLowerCase()}</b> · Order #{active.id}</p>
                </div>
                <Button onClick={handleAdvance} loading={isUpdating}>{buttonLabel}</Button>
              </div>
            </Card>
          )}

          <Card title={`Completed deliveries from Database (${historyOrders.length})`} action={<History size={20} className="text-ink/40" />}>
            {historyOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink/50">No completed deliveries recorded in database yet.</p>
            ) : (
              <ul className="divide-y divide-ink/8">
                {historyOrders.map((h) => {
                  const pay = calcOrderPay(h);
                  return (
                    <li key={h.id} className="flex items-center gap-4 py-3 text-sm">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-leaf">
                        <CheckCircle2 size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{h.restaurantName}</p>
                        <p className="text-xs text-ink/50 truncate">#{h.id} · {h.date || "Recent"} · {h.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{money(pay.total)}</p>
                        <p className="text-xs text-ink/50">★ 5.0</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}

      {tab === "earnings" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Card title="Available balance" className="bg-leaf text-white [&_h2]:text-white">
              <p className="font-display text-5xl font-extrabold">{money(balance)}</p>
              <p className="mt-1 text-sm text-white/70">Calculated directly from real database deliveries</p>
              <button onClick={handleCashOut} className="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-leaf transition hover:bg-mint disabled:opacity-50" disabled={balance < 5}>
                Cash out now
              </button>
              <p className="mt-3 text-xs text-white/60">Free weekly payouts every Monday.</p>
            </Card>
            <Card title="Delivery Earnings Breakdown"><Bars data={weekData} highlight={6} /></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Summary breakdown">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-ink/55">Base delivery pay</dt><dd className="font-bold">{money(basePayTotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/55">Customer tips</dt><dd className="font-bold">{money(tipsTotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/55">Delivered orders count</dt><dd className="font-bold">{historyOrders.length}</dd></div>
                <div className="flex justify-between border-t border-ink/8 pt-3 text-base font-bold"><dt>Total Earned</dt><dd className="font-display font-extrabold text-leaf">{money(totalEarnedFromHistory)}</dd></div>
              </dl>
            </Card>
            <Card title="Payout history">
              {payouts.length === 0 ? (
                <p className="py-4 text-center text-sm text-ink/50">No payouts requested yet.</p>
              ) : (
                <ul className="divide-y divide-ink/8 text-sm">
                  {payouts.map(([d, v], i) => (
                    <li key={d + i} className="flex justify-between py-3">
                      <span>{d}</span>
                      <span className="font-bold">{money(v)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === "profile" && <ProfileTab user={user} count={historyOrders.length} declined={declined} />}
    </div>
  );
}

function ProfileTab({ user, count, declined }) {
  const app = useApplicationStore((state) => state.applications.find((a) => a.email === user?.email));
  const status = app?.status || "APPROVED";
  const badges = [[Trophy, "Top rated", count > 0 ? "5.0 Rating" : "New Rider"], [Flame, "Rush hero", "Active on deliveries"], [BadgeCheck, "Verified", "ID verified"]];
  const docs = app ? Object.entries(app.docs) : [["idFront", { ok: true }], ["licence", { ok: true }], ["vehicleDoc", { ok: true }], ["selfie", { ok: true }]];
  const names = { idFront: "Government ID", licence: "Driving licence", vehicleDoc: "Vehicle papers", selfie: "Profile selfie" };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card title="Rider Profile (Database)">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-leaf font-display text-2xl font-extrabold text-white">
            {user?.name?.[0] || "R"}
          </span>
          <div>
            <p className="font-display text-xl font-extrabold">{user?.name || "Delivery Partner"}</p>
            <p className="text-sm text-ink/55">{user?.email}</p>
            <p className="mt-1 text-xs font-bold text-leaf">★ {count > 0 ? "5.0" : "New"} · {count} deliveries completed</p>
          </div>
        </div>
        <dl className="mt-5 divide-y divide-ink/8 text-sm">
          {[
            ["Vehicle", app ? app.vehicle.toLowerCase() : "Scooter / Bike"],
            ["City", app?.city || "San Francisco"],
            ["Phone", user?.phone || app?.phone || "Not set"],
            ["Declined requests", declined],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5">
              <dt className="text-ink/55">{k}</dt>
              <dd className="font-bold capitalize">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card title="Verification" action={<span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "APPROVED" ? "bg-mint text-leaf" : status === "REJECTED" ? "bg-red-100 text-red-600" : "bg-sun/40"}`}>{status.toLowerCase()}</span>}>
        <ul className="space-y-2.5">{docs.map(([k, d]) => <li key={k} className="flex items-center gap-3 text-sm"><FileCheck2 size={17} className={d.ok === true ? "text-leaf" : d.ok === false ? "text-red-600" : "text-ink/30"} /><span className="flex-1 font-semibold">{names[k] || k}</span><span className="text-xs text-ink/50">{d.ok === true ? "Verified" : d.ok === false ? "Rejected" : "In review"}</span></li>)}</ul>
        {app?.note && <p className="mt-4 rounded-xl bg-cream p-3 text-sm">Admin note: {app.note}</p>}
      </Card>
      <Card title="Badges"><div className="grid grid-cols-3 gap-3">{badges.map(([Icon, t, d]) => <div key={t} className="rounded-2xl bg-cream p-4 text-center"><Icon className="mx-auto text-tangerine" size={24} /><p className="mt-2 text-sm font-bold">{t}</p><p className="text-xs text-ink/50">{d}</p></div>)}</div></Card>
      <Card title="Help & safety" action={<LifeBuoy size={20} className="text-leaf" />}>
        <div className="space-y-3 text-sm">
          <button onClick={() => toast("Rider support team contacted")} className="flex w-full items-center justify-between rounded-xl bg-cream px-4 py-3 font-bold">Contact rider support<ChevronRight size={16} /></button>
          <button onClick={() => toast.error("Emergency dispatch alerted")} className="flex w-full items-center justify-between rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600">Emergency / SOS<ChevronRight size={16} /></button>
        </div>
      </Card>
    </div>
  );
}
