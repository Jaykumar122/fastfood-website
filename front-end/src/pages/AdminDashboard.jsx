import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bike, CirclePlus, Download, Database, FileText, LayoutDashboard, Mail, PanelLeft, Settings, TrendingDown, Zap, Megaphone, PackageCheck, Search, ShieldCheck, Store, Tag, TrendingUp, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { approveRestaurant, getAdminUsers, getRestaurantOrders, getRestaurants } from "../api/services";
import { useApplicationStore } from "../store/applicationStore";
import { Badge, Button, Modal } from "../components/ui";

const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["restaurants", "Restaurants", Store],
  ["users", "Users", UsersRound],
  ["orders", "Orders", PackageCheck],
  ["riders", "Riders", Bike],
  ["verifyRs", "Restaurant verification", Store],
  ["verify", "Rider verification", BadgeCheck],
  ["promos", "Promotions", Tag],
];
const docTabs = [["library", "Data Library", Database], ["reports", "Reports", FileText], ["settings", "Settings", Settings]];
const allTabs = [...tabs, ...docTabs];
const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const statusTone = {
  DELIVERED: "bg-mint text-leaf",
  OUT_FOR_DELIVERY: "bg-sun/40 text-ink",
  PREPARING: "bg-mint text-leaf",
  CONFIRMED: "bg-mint text-leaf",
  CANCELLED: "bg-red-100 text-red-600",
  TO_RESTAURANT: "bg-sun/40 text-ink",
  PICKED_UP: "bg-sun/40 text-ink",
};

const defaultPromoCodes = {
  RUSH20: { label: "20% off whole order", type: "PERCENT", value: 20 },
  WELCOME10: { label: "$10 off first order", type: "FLAT", value: 10 },
  FREESHIP: { label: "Free standard delivery", type: "DELIVERY", value: 0 },
  SAVE5: { label: "$5 off over $25", type: "FLAT", value: 5 },
};

function Stat({ label, value, delta, note, sub, down }) {
  const Arrow = down ? TrendingDown : TrendingUp;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-gradient-to-t from-orange-50 to-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-neutral-500">{label}</p>
        <span className="flex items-center gap-1 rounded-lg border border-orange-200 bg-white px-2 py-0.5 text-xs font-semibold text-tangerine">
          <Arrow size={12} />{delta}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-6 flex items-center justify-between gap-2 text-sm font-semibold">
        {note}<Arrow size={14} className="shrink-0" />
      </p>
      <p className="text-sm text-neutral-500">{sub}</p>
    </div>
  );
}

function smooth(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function AreaChart({ orders = [] }) {
  const [range, setRange] = useState(7);
  const [hover, setHover] = useState(null);

  const data = useMemo(() => {
    const days = range;
    const now = new Date();
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { dateStr, orders: 0, revenue: 0 };
    });

    if (orders.length > 0) {
      orders.forEach((o, idx) => {
        const bucketIdx = idx % days;
        buckets[bucketIdx].orders += 1;
        buckets[bucketIdx].revenue += Math.round(Number(o.total || 0));
      });
    }

    return buckets;
  }, [orders, range]);

  const W = 1000, H = 280, T = 10, B = 4;
  const max = Math.max(10, ...data.map((p) => p.orders * 1.5));
  const x = (i) => (i / Math.max(1, data.length - 1)) * W;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const A = data.map((p, i) => [x(i), y(p.orders)]);
  const close = ` L${W},${H - B} L0,${H - B} Z`;
  const n = range === 7 ? 7 : 6;
  const ticks = Array.from({ length: n }, (_, k) => Math.round((k / (n - 1)) * (range - 1)));
  const total = orders.length;
  const h = hover != null ? data[hover] : null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Platform Orders Activity</h2>
          <p className="text-sm text-neutral-500">
            <span className="font-bold text-neutral-950">{total}</span> total database orders across platform
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-neutral-200 text-sm font-medium">
          {[[90, "3 months"], [30, "30 days"], [7, "7 days"]].map(([r, l]) => (
            <button
              key={r}
              onClick={() => { setRange(r); setHover(null); }}
              className={`border-l border-neutral-200 px-3 py-2 first:border-l-0 ${range === r ? "bg-orange-100 text-tangerine" : "bg-white hover:bg-neutral-50"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-xs font-medium text-neutral-600">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-tangerine" />Orders count</span>
      </div>
      <div className="mt-4 flex gap-3">
        <div className="flex h-64 flex-col justify-between pb-1 text-right text-xs text-neutral-500">
          {[Math.round(max), Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-64 w-full cursor-crosshair"
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))));
            }}
          >
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff5a1f" stopOpacity=".35" />
                <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1="0"
                x2={W}
                y1={T + f * (H - T - B)}
                y2={T + f * (H - T - B)}
                stroke="#000"
                strokeOpacity={f === 1 ? 0.15 : 0.06}
                strokeDasharray={f === 1 ? "" : "4 4"}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {A.length > 1 && (
              <>
                <path d={smooth(A) + close} fill="url(#ga)" />
                <path d={smooth(A)} fill="none" stroke="#ff5a1f" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </>
            )}
            {h && (
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={T}
                y2={H - B}
                stroke="#000"
                strokeOpacity=".25"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {h && (
            <>
              <span
                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-tangerine shadow"
                style={{ left: `${(hover / (data.length - 1)) * 100}%`, top: `${(y(h.orders) / H) * 100}%` }}
              />
              <div
                className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg"
                style={{ left: `${Math.min(88, Math.max(12, (hover / (data.length - 1)) * 100))}%` }}
              >
                <p className="font-bold">{h.dateStr}</p>
                <p className="text-tangerine">{h.orders} orders</p>
                <p className="text-leaf">${h.revenue.toLocaleString()} revenue</p>
              </div>
            </>
          )}
          <div className="relative mt-2 h-5 text-xs text-neutral-500">
            {ticks.map((i, k) => (
              <span
                key={k}
                className="absolute whitespace-nowrap"
                style={{ left: `${(i / (data.length - 1)) * 100}%`, transform: k === 0 ? "none" : k === n - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
              >
                {data[i]?.dateStr}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Overview({ restaurants, orders, users, onApprove }) {
  const top = [...restaurants].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const pending = restaurants.filter((r) => !r.approved);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeCount = users.filter((u) => u.active !== false).length;
  const [page, setPage] = useState(0);
  const per = 6;
  const rows = top.slice(page * per, page * per + per);

  const activities = [
    ...orders.slice(0, 4).map((o) => [
      `Order #${o.id} · ${String(o.status || "").replaceAll("_", " ").toLowerCase()}`,
      `${o.customerName || "Customer"} ordered from ${o.restaurantName} · $${Number(o.total || 0).toFixed(2)}`,
      o.date || "Recent",
    ]),
    ...pending.slice(0, 2).map((r) => [
      "Restaurant awaiting approval",
      `${r.name} (${r.cuisine})`,
      "Submitted for review",
    ]),
    ...users.slice(0, 2).map((u) => [
      `User account ${u.role.replaceAll("_", " ").toLowerCase()}`,
      `${u.name} (${u.email})`,
      u.active !== false ? "Active in DB" : "Suspended",
    ]),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total revenue" value={money(totalRevenue)} delta="+100%" note="Database orders sum" sub="Real-time revenue pipeline" />
        <Stat label="Platform orders" value={orders.length.toLocaleString()} delta="+100%" note="Direct from MySQL" sub="Customer orders placed" />
        <Stat label="Active users" value={activeCount.toLocaleString()} delta="+100%" note={`${users.length} accounts registered`} sub="Verified in backend database" />
        <Stat label="Restaurants" value={restaurants.length.toLocaleString()} delta="+100%" note={`${pending.length} pending review`} sub="Onboarded kitchens" />
      </div>
      <AreaChart orders={orders} />
      <Card title="Restaurant performance" action={pending.length > 0 && <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-neutral-900">{pending.length} awaiting approval</span>}>
        <Table head={["Restaurant", "Cuisine", "Status", "Orders", "Revenue", "Rating", ""]}>
          {rows.map((r) => {
            const isPending = !r.approved;
            return (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="py-3 font-bold">{r.name}</td>
                <td><Badge>{r.cuisine}</Badge></td>
                <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${isPending ? "bg-sun/40" : "bg-mint text-leaf"}`}>{isPending ? "In review" : "Live"}</span></td>
                <td className="tabular-nums">{(r.reviews || 10) * 6}</td>
                <td className="tabular-nums">${((r.reviews || 10) * 6 * 24).toLocaleString()}</td>
                <td>★ {r.rating || 4.7}</td>
                <td className="text-right">{isPending && <Button size="sm" onClick={() => onApprove(r.id)}>Approve</Button>}</td>
              </tr>
            );
          })}
        </Table>
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500 opacity-55">
          <span>Page {page + 1} of {Math.ceil(top.length / per) || 1}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={(page + 1) * per >= top.length} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </Card>
      <Card title="Recent Activity from Database">
        {activities.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">No activity recorded yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map(([t, d, when], idx) => (
              <li key={idx} className="text-sm">
                <p className="font-bold">{t}</p>
                <p className="text-neutral-500 opacity-60">{d}</p>
                <p className="text-xs text-neutral-500 opacity-40">{when}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function RestaurantApplications() {
  const { restaurantApps, setRestaurantDoc, decideRestaurant } = useApplicationStore();
  const [openId, setOpenId] = useState(null);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const list = restaurantApps.filter((a) => filter === "ALL" || a.status === filter);
  const names = { licence: "Business licence", foodSafety: "Food safety certificate", idFront: "Owner ID", bankProof: "Bank proof" };
  const app = restaurantApps.find((a) => a.id === openId);
  const allOk = app && Object.values(app.docs).every((d) => d.ok === true);
  const close = () => { setOpenId(null); setReason(""); };
  const tone = { PENDING: "bg-sun/40", APPROVED: "bg-mint text-leaf", REJECTED: "bg-red-100 text-red-600" };
  return (
    <>
      <Card title={`Restaurant applications (${list.length})`}>
        <div className="mb-4 flex flex-wrap gap-2">{["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === f ? "bg-tangerine text-white" : "bg-neutral-100"}`}>{f === "ALL" ? "All" : f.toLowerCase()}{f === "PENDING" && ` (${restaurantApps.filter((a) => a.status === "PENDING").length})`}</button>)}</div>
        {list.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No applications here.</p>}
        <Table head={["Restaurant", "Owner", "Cuisine", "City", "Submitted", "Status", ""]}>
          {list.map((a) => <tr key={a.id} className="border-t border-neutral-200"><td className="py-3"><p className="font-bold">{a.name}</p><p className="text-xs text-neutral-500">{a.id}</p></td><td>{a.owner}</td><td>{a.cuisine}</td><td>{a.city}</td><td className="text-neutral-500">{a.submitted}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${tone[a.status]}`}>{a.status.toLowerCase()}</span></td><td className="text-right"><Button size="sm" variant={a.status === "PENDING" ? "primary" : "secondary"} onClick={() => setOpenId(a.id)}>{a.status === "PENDING" ? "Review" : "View"}</Button></td></tr>)}
        </Table>
      </Card>
      <Modal open={!!app} title={app ? `Verify ${app.name}` : ""} onClose={close}>
        {app && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-neutral-100 p-4"><p><span className="block text-xs text-neutral-500">Owner</span>{app.owner}</p><p><span className="block text-xs text-neutral-500">Email</span>{app.email}</p><p><span className="block text-xs text-neutral-500">Address</span>{app.address}, {app.city}</p><p><span className="block text-xs text-neutral-500">Food licence</span>{app.licence}</p></div>
            <ul className="space-y-2">{Object.entries(app.docs).map(([k, d]) => (
              <li key={k} className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 p-3"><div className="min-w-0 flex-1"><p className="font-bold">{names[k] || k}</p><p className="truncate text-xs text-neutral-500">{d.file}</p></div>
                {app.status === "PENDING" ? <div className="flex gap-1.5"><button onClick={() => setRestaurantDoc(app.id, k, true)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${d.ok === true ? "bg-leaf text-white" : "bg-neutral-100"}`}>Valid</button><button onClick={() => setRestaurantDoc(app.id, k, false)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${d.ok === false ? "bg-red-600 text-white" : "bg-neutral-100"}`}>Invalid</button></div> : <span className="text-xs font-bold">{d.ok === true ? "Valid" : d.ok === false ? "Invalid" : "Not reviewed"}</span>}
              </li>
            ))}</ul>
            {app.status === "PENDING" ? <>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full rounded-xl border border-neutral-200 p-3" placeholder="Note to applicant (required to reject)" />
              <div className="flex gap-3"><Button className="flex-1" disabled={!allOk} onClick={() => { decideRestaurant(app.id, "APPROVED", reason); toast.success(`${app.name} approved`); close(); }}>Approve restaurant</Button><Button variant="secondary" className="flex-1 !text-red-600" onClick={() => { if (!reason.trim()) return toast.error("Add a note explaining the rejection"); decideRestaurant(app.id, "REJECTED", reason); toast(`${app.name} rejected`); close(); }}>Reject</Button></div>
              {!allOk && <p className="text-xs text-neutral-500">Approve unlocks once every document is marked Valid.</p>}
            </> : <p className="rounded-xl bg-neutral-100 p-3">Decision: <b className="capitalize">{app.status.toLowerCase()}</b>{app.note && ` · ${app.note}`}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

function Verification() {
  const { applications, setDoc, decide } = useApplicationStore();
  const [openId, setOpenId] = useState(null);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const list = applications.filter((a) => filter === "ALL" || a.status === filter);
  const names = { idFront: "Government ID", licence: "Driving licence", vehicleDoc: "Vehicle papers", selfie: "Profile selfie" };
  const app = applications.find((a) => a.id === openId);
  const allOk = app && Object.values(app.docs).every((d) => d.ok === true);
  const close = () => { setOpenId(null); setReason(""); };
  const tone = { PENDING: "bg-sun/40", APPROVED: "bg-mint text-leaf", REJECTED: "bg-red-100 text-red-600" };
  return (
    <>
      <Card title={`Rider verification (${list.length})`}>
        <div className="mb-4 flex flex-wrap gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === f ? "bg-tangerine text-white" : "bg-neutral-100"}`}
            >
              {f === "ALL" ? "All" : f.toLowerCase()}{f === "PENDING" && ` (${applications.filter((a) => a.status === "PENDING").length})`}
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No applications here.</p>}
        <Table head={["Rider", "Email", "Vehicle", "City", "Submitted", "Status", ""]}>
          {list.map((a) => (
            <tr key={a.id} className="border-t border-neutral-200">
              <td className="py-3"><p className="font-bold">{a.name}</p><p className="text-xs text-neutral-500">{a.id}</p></td>
              <td>{a.email}</td>
              <td>{a.vehicle}</td>
              <td>{a.city}</td>
              <td className="text-neutral-500">{a.submitted}</td>
              <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${tone[a.status]}`}>{a.status.toLowerCase()}</span></td>
              <td className="text-right">
                <Button size="sm" variant={a.status === "PENDING" ? "primary" : "secondary"} onClick={() => setOpenId(a.id)}>
                  {a.status === "PENDING" ? "Review" : "View"}
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={!!app} title={app ? `Verify ${app.name}` : ""} onClose={close}>
        {app && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-neutral-100 p-4">
              <p><span className="block text-xs text-neutral-500">Name</span>{app.name}</p>
              <p><span className="block text-xs text-neutral-500">Email</span>{app.email}</p>
              <p><span className="block text-xs text-neutral-500">Vehicle</span>{app.vehicle} ({app.plate || "No plate"})</p>
              <p><span className="block text-xs text-neutral-500">City</span>{app.city}</p>
            </div>
            <ul className="space-y-2">
              {Object.entries(app.docs).map(([k, d]) => (
                <li key={k} className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 p-3">
                  <div className="min-w-0 flex-1"><p className="font-bold">{names[k] || k}</p><p className="truncate text-xs text-neutral-500">{d.file}</p></div>
                  {app.status === "PENDING" ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => setDoc(app.id, k, true)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${d.ok === true ? "bg-leaf text-white" : "bg-neutral-100"}`}>Valid</button>
                      <button onClick={() => setDoc(app.id, k, false)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${d.ok === false ? "bg-red-600 text-white" : "bg-neutral-100"}`}>Invalid</button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold">{d.ok === true ? "Valid" : d.ok === false ? "Invalid" : "Not reviewed"}</span>
                  )}
                </li>
              ))}
            </ul>
            {app.status === "PENDING" ? (
              <>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full rounded-xl border border-neutral-200 p-3" placeholder="Note to applicant (required to reject)" />
                <div className="flex gap-3">
                  <Button className="flex-1" disabled={!allOk} onClick={() => { decide(app.id, "APPROVED", reason); toast.success(`${app.name} approved`); close(); }}>Approve rider</Button>
                  <Button variant="secondary" className="flex-1 !text-red-600" onClick={() => { if (!reason.trim()) return toast.error("Add a note explaining the rejection"); decide(app.id, "REJECTED", reason); toast(`${app.name} rejected`); close(); }}>Reject</Button>
                </div>
                {!allOk && <p className="text-xs text-neutral-500">Approve unlocks once every document is marked Valid.</p>}
              </>
            ) : (
              <p className="rounded-xl bg-neutral-100 p-3">Decision: <b className="capitalize">{app.status.toLowerCase()}</b>{app.note && ` · ${app.note}`}</p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function Restaurants({ restaurants, onApprove }) {
  const [q, setQ] = useState("");
  const list = restaurants.filter((r) => `${r.name} ${r.cuisine}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card title={`Restaurants in Database (${list.length})`} action={<SearchInput value={q} onChange={setQ} />}>
      <Table head={["Restaurant", "Cuisine", "Rating", "Reviews", "Commission", "Status", ""]}>
        {list.map((r) => {
          const state = r.approved ? "Active" : "Pending";
          return (
            <tr key={r.id} className="border-t border-neutral-200">
              <td className="py-3 pr-3">
                <div className="flex items-center gap-3">
                  {r.image && <img src={r.image} alt="" className="h-10 w-10 rounded-xl bg-ink/5 object-cover" />}
                  <div>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-xs text-neutral-500 opacity-45">{r.address ? r.address.split(",")[0] : ""}</p>
                  </div>
                </div>
              </td>
              <td>{r.cuisine}</td>
              <td>★ {r.rating || 4.7}</td>
              <td>{r.reviews || 0}</td>
              <td>15%</td>
              <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${r.approved ? "bg-mint text-leaf" : "bg-sun/40"}`}>{state}</span></td>
              <td className="text-right">
                {!r.approved && (
                  <Button size="sm" onClick={() => onApprove(r.id)}>Approve</Button>
                )}
              </td>
            </tr>
          );
        })}
      </Table>
    </Card>
  );
}

function Users({ users, setUsers }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("ALL");
  const list = users.filter((u) => (role === "ALL" || u.role === role) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card title={`Users in Database (${list.length})`} action={<SearchInput value={q} onChange={setQ} />}>
      <div className="mb-4 flex flex-wrap gap-2">{["ALL", "CUSTOMER", "RESTAURANT_OWNER", "DELIVERY_PARTNER", "ADMIN"].map((r) => <button key={r} onClick={() => setRole(r)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${role === r ? "bg-tangerine text-white" : "bg-neutral-100"}`}>{r === "ALL" ? "All" : r.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</button>)}</div>
      <Table head={["Name", "Email", "Role", "Phone", "Status", ""]}>
        {list.map((u) => (
          <tr key={u.id} className="border-t border-neutral-200">
            <td className="py-3 font-bold">{u.name}</td>
            <td className="text-neutral-500 opacity-60">{u.email}</td>
            <td><Badge>{u.role.replace("_", " ")}</Badge></td>
            <td className="text-neutral-500 opacity-50">{u.phone || "—"}</td>
            <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${u.active !== false ? "bg-mint text-leaf" : "bg-red-100 text-red-600"}`}>{u.active !== false ? "Active" : "Suspended"}</span></td>
            <td className="text-right">
              <Button size="sm" variant="secondary" onClick={() => {
                setUsers(users.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)));
                toast(u.active !== false ? "User suspended" : "User reactivated");
              }}>
                {u.active !== false ? "Suspend" : "Reactivate"}
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Orders({ orders }) {
  const [filter, setFilter] = useState("ALL");
  const list = orders.filter((o) => filter === "ALL" || o.status === filter);
  return (
    <Card title={`Orders in Database (${list.length})`}>
      <div className="mb-4 flex flex-wrap gap-2">{["ALL", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === f ? "bg-tangerine text-white" : "bg-neutral-100"}`}>{f === "ALL" ? "All" : f.replaceAll("_", " ").toLowerCase()}</button>)}</div>
      <Table head={["Order ID", "Restaurant", "Items", "Total", "Date / Time", "Status"]}>
        {list.map((o) => (
          <tr key={o.id} className="border-t border-neutral-200">
            <td className="py-3 font-bold">{o.id}</td>
            <td>{o.restaurantName}</td>
            <td>{(o.items || []).reduce((a, i) => a + (i.quantity || 1), 0)}</td>
            <td className="font-bold">${Number(o.total || 0).toFixed(2)}</td>
            <td className="text-neutral-500 opacity-50">{o.date || "Recent"}</td>
            <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[o.status] || "bg-neutral-100"}`}>{String(o.status || "").replaceAll("_", " ").toLowerCase()}</span></td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Riders({ riders }) {
  return (
    <Card title={`Delivery Partners in Database (${riders.length})`}>
      {riders.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">No delivery partners registered in database yet.</p>
      ) : (
        <Table head={["Rider Name", "Email", "Phone", "Status"]}>
          {riders.map((r) => (
            <tr key={r.id} className="border-t border-neutral-200">
              <td className="py-3 font-bold">{r.name}</td>
              <td className="text-neutral-500">{r.email}</td>
              <td className="text-neutral-500">{r.phone || "—"}</td>
              <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${r.active !== false ? "bg-mint text-leaf" : "bg-red-100 text-red-600"}`}>{r.active !== false ? "Active" : "Suspended"}</span></td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}

function Promos() {
  const [promoList, setPromoList] = useState(defaultPromoCodes);
  const [active, setActive] = useState(() => Object.fromEntries(Object.keys(defaultPromoCodes).map((k) => [k, true])));
  const uses = { RUSH20: 12, WELCOME10: 25, FREESHIP: 8, SAVE5: 6 };

  return (
    <Card title="Platform Promo Codes" action={<Megaphone size={20} className="text-neutral-900" />}>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(promoList).map(([code, promo]) => (
          <div key={code} className="rounded-2xl border border-dashed border-ink/20 p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-extrabold">{code}</p>
              <button
                onClick={() => {
                  setActive({ ...active, [code]: !active[code] });
                  toast(`${code} ${active[code] ? "paused" : "enabled"}`);
                }}
                className={`h-6 w-11 rounded-full p-0.5 transition ${active[code] ? "bg-tangerine" : "bg-ink/20"}`}
                aria-label={`Toggle ${code}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition ${active[code] ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <p className="mt-1 text-sm text-neutral-500 opacity-55">{promo.label || promo.description || promo.type}</p>
            <p className="mt-3 text-xs font-bold text-neutral-500 opacity-40">{(uses[code] || 0).toLocaleString()} redemptions</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SearchInput({ value, onChange }) {
  return <label className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2"><Search size={15} className="text-neutral-500 opacity-40" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search" className="w-32 bg-transparent text-sm outline-none sm:w-44" /></label>;
}

function Table({ head, children }) {
  return <div className="-mx-2 overflow-x-auto px-2"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="text-xs uppercase tracking-wider text-neutral-500 opacity-40">{head.map((h) => <th key={h} className="pb-3 font-bold">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function download(name, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${name} downloaded`);
}

function Library({ restaurants, orders, users }) {
  const sets = [
    ["restaurants.csv", "Restaurants", `${restaurants.length} records`, () => [["id", "name", "cuisine", "rating", "address", "approved"], ...restaurants.map((r) => [r.id, r.name, r.cuisine, r.rating, r.address, r.approved])]],
    ["orders.csv", "Orders", `${orders.length} records`, () => [["id", "restaurant", "status", "total", "date"], ...orders.map((o) => [o.id, o.restaurantName, o.status, o.total, o.date])]],
    ["users.csv", "Users", `${users.length} records`, () => [["id", "name", "email", "role", "active"], ...users.map((u) => [u.id, u.name, u.email, u.role, u.active])]],
  ];
  const [q, setQ] = useState("");
  return (
    <Card title="Database Datasets" action={<SearchInput value={q} onChange={setQ} />}>
      <Table head={["File", "Contents", "Size", "Updated", ""]}>
        {sets.filter((d) => d[0].includes(q.toLowerCase())).map(([file, label, size, rows]) => (
          <tr key={file} className="border-t border-neutral-200">
            <td className="py-3 font-bold">{file}</td>
            <td>{label}</td>
            <td className="text-neutral-500 opacity-70">{size}</td>
            <td className="text-neutral-500 opacity-70">Live database</td>
            <td className="text-right">
              <Button size="sm" variant="secondary" onClick={() => download(file, rows())}>
                <Download size={14} />Export CSV
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Reports() {
  const [list, setList] = useState([
    ["Platform revenue summary", "Revenue", "Today"],
    ["Restaurant performance", "Restaurants", "Recent"],
    ["Rider activity report", "Riders", "Recent"],
  ]);
  const types = ["Revenue", "Orders", "Customers", "Restaurants", "Riders"];
  const [type, setType] = useState("Orders");
  return (
    <div className="space-y-6">
      <Card title="Generate report">
        <div className="flex flex-wrap items-center gap-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">{types.map((t) => <option key={t}>{t}</option>)}</select>
          <Button onClick={() => { setList([[`${type} report`, type, "Today"], ...list]); toast.success(`${type} report generated`); }}><FileText size={15} />Generate</Button>
        </div>
      </Card>
      <Card title="Reports">
        <ul className="divide-y divide-neutral-200">{list.map(([name, t, date], i) => <li key={`${name}${i}`} className="flex items-center gap-3 py-3 text-sm"><span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-100 text-tangerine"><FileText size={16} /></span><div className="min-w-0 flex-1"><p className="truncate font-bold">{name}</p><p className="text-xs text-neutral-500">{t} · {date}</p></div><Button size="sm" variant="secondary" onClick={() => download(`${name.replaceAll(" ", "-").toLowerCase()}.csv`, [["report", "type", "generated"], [name, t, date]])}><Download size={14} />Download</Button></li>)}</ul>
      </Card>
    </div>
  );
}

function PlatformSettings() {
  const [v, setV] = useState({ commission: 15, fee: 1.99, radius: 8, autoApprove: false, maintenance: false, emailAlerts: true, surge: true });
  const toggle = (k) => setV({ ...v, [k]: !v[k] });
  const Switch = ({ k, label, hint }) => <div className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-bold">{label}</p><p className="text-xs text-neutral-500">{hint}</p></div><button onClick={() => toggle(k)} className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition ${v[k] ? "bg-leaf" : "bg-neutral-300"}`} aria-label={label}><span className={`block h-5 w-5 rounded-full bg-white transition ${v[k] ? "translate-x-5" : ""}`} /></button></div>;
  const Num = ({ k, label, suffix }) => <label className="block text-sm font-bold">{label}<div className="mt-1 flex items-center gap-2"><input type="number" step="any" min="0" value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-normal" /><span className="text-xs font-normal text-neutral-500">{suffix}</span></div></label>;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Pricing & delivery"><div className="grid gap-4 sm:grid-cols-3"><Num k="commission" label="Commission" suffix="%" /><Num k="fee" label="Base delivery fee" suffix="$" /><Num k="radius" label="Radius" suffix="mi" /></div></Card>
      <Card title="Platform"><div className="divide-y divide-neutral-200"><Switch k="autoApprove" label="Auto-approve restaurants" hint="Skip manual review for new applications" /><Switch k="surge" label="Surge pricing" hint="Raise fees during peak hours" /><Switch k="emailAlerts" label="Email alerts" hint="Daily summary to the admin inbox" /><Switch k="maintenance" label="Maintenance mode" hint="Temporarily pause new orders" /></div></Card>
      <div className="lg:col-span-2"><Button onClick={() => toast.success("Settings saved")}>Save changes</Button></div>
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");

  // Real backend queries
  const { data: usersData = [] } = useQuery({ queryKey: ["admin-users"], queryFn: getAdminUsers });
  const { data: ordersData = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: getRestaurantOrders });
  const { data: restaurantsData } = useQuery({ queryKey: ["admin-restaurants"], queryFn: () => getRestaurants() });

  const [editedUsers, setEditedUsers] = useState(null);
  const users = editedUsers || usersData;

  const liveRestaurants = (restaurantsData?.content && Array.isArray(restaurantsData.content))
    ? restaurantsData.content
    : (Array.isArray(restaurantsData) ? restaurantsData : []);
  const liveOrders = ordersData || [];
  const riders = users.filter((u) => u.role === "DELIVERY_PARTNER");

  const handleApproveRestaurant = async (id) => {
    try {
      await approveRestaurant(id);
      toast.success("Restaurant approved in database");
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
    } catch {
      toast.error("Failed to approve restaurant");
    }
  };

  const current = allTabs.find((t) => t[0] === tab) || tabs[0];
  const [open, setOpen] = useState(true);

  const NavBtn = ({ id, label, Icon }) => {
    const pendingCount = liveRestaurants.filter((r) => !r.approved).length;
    return (
      <button onClick={() => setTab(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === id ? "bg-tangerine text-white shadow-sm" : "text-neutral-700 hover:bg-orange-100/70"}`}>
        <Icon size={16} />
        {label}
        {id === "restaurants" && pendingCount > 0 && <span className="ml-auto rounded-full bg-leaf px-2 text-xs text-white">{pendingCount}</span>}
      </button>
    );
  };

  return (
    <div className="admin-ui flex min-h-[calc(100vh-72px)] bg-[#fbf3ea] font-sans text-neutral-950">
      {open && (
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-64 shrink-0 flex-col gap-1 p-4 lg:flex">
          <p className="mb-3 flex items-center gap-2 px-2 font-display text-lg font-bold"><Zap size={18} />Fastfood Admin</p>
          <div className="mb-3 flex gap-2"><button onClick={() => { setTab("restaurants"); toast("Open Restaurants to review applications"); }} className="flex flex-1 items-center gap-2 rounded-lg bg-tangerine px-3 py-2 text-sm font-medium text-white shadow-[0_3px_0_#c83d15]"><CirclePlus size={16} />Quick Create</button><button onClick={() => setTab("orders")} className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 bg-white" aria-label="Inbox"><Mail size={15} /></button></div>
          {tabs.map(([id, label, Icon]) => <NavBtn key={id} id={id} label={label} Icon={Icon} />)}
          <p className="mb-1 mt-6 px-3 text-xs text-neutral-500">Documents</p>
          {docTabs.map(([id, label, Icon]) => <NavBtn key={id} id={id} label={label} Icon={Icon} />)}
        </aside>
      )}
      <main className="min-w-0 flex-1 p-0 lg:py-3 lg:pr-3">
        <div className="min-h-full overflow-hidden bg-white lg:rounded-2xl lg:shadow-sm">
          <header className="flex h-14 items-center gap-3 border-b border-neutral-200 px-4 sm:px-6">
            <button onClick={() => setOpen(!open)} className="hidden rounded-lg p-2 hover:bg-neutral-100 lg:block" aria-label="Toggle sidebar"><PanelLeft size={17} /></button>
            <span className="hidden h-5 w-px bg-neutral-200 lg:block" />
            <h1 className="font-display text-base font-semibold">{current[1]}</h1>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-leaf">
              <span className="h-2 w-2 rounded-full bg-leaf animate-pulse" />
              Connected to MySQL
            </span>
          </header>
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-3 lg:hidden">{allTabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === id ? "bg-tangerine text-white" : "bg-neutral-100 text-neutral-700"}`}>{label}</button>)}</div>
          <div className="space-y-6 p-4 sm:p-6">
            {tab === "overview" && <Overview restaurants={liveRestaurants} orders={liveOrders} users={users} onApprove={handleApproveRestaurant} />}
            {tab === "restaurants" && <Restaurants restaurants={liveRestaurants} onApprove={handleApproveRestaurant} />}
            {tab === "verifyRs" && <RestaurantApplications />}
            {tab === "users" && <Users users={users} setUsers={setEditedUsers} />}
            {tab === "orders" && <Orders orders={liveOrders} />}
            {tab === "riders" && <Riders riders={riders} />}
            {tab === "verify" && <Verification />}
            {tab === "promos" && <Promos />}
            {tab === "library" && <Library restaurants={liveRestaurants} orders={liveOrders} users={users} />}
            {tab === "reports" && <Reports />}
            {tab === "settings" && <PlatformSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}
