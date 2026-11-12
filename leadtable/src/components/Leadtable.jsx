import { useMemo, useState } from "react";
import "./Leadtable.css";

const SAMPLE_LEADTABLE = [
  { id: 1, name: "Asha Verma", company: "Venkatnarayana", email: "bunny@gmail.com", status: "New" },
  { id: 2, name: "Rohit Nair", company: "Sumith", email: "sumith@gmail.com", status: "Contacted" },
  { id: 3, name: "Meera Iyer", company: "Saketh", email: "saketh@gmail.com", status: "Qualified" },
  { id: 4, name: "Karthik Rao", company: "raju", email: "raju@gmail.com", status: "Lost" },
  { id: 5, name: "Divya Menon", company: "vishnu", email: "vishnu@gmail.com", status: "Won" },
];

const STATUSES = ["All", "New", "Contacted", "Qualified", "Won", "Lost"];
const PAGE_SIZE = 5;

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function Leadtable({ leads = SAMPLE_LEADS }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState({ key: "created", dir: "desc" });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = leads.filter((lead) => {
      const matchesStatus = status === "All" || lead.status === status;
      const matchesQuery =
        !q || [lead.name, lead.company, lead.email].some((field) => field.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const result = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? result : -result;
    });
  }, [leads, query, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const ariaSort = (key) =>
    sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  return (
    <section className="leadtable">
      <header className="leadtable__header">
        <h2 className="leadtable__title">Leads</h2>
        <p className="leadtable__count">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </p>
      </header>

      <div className="leadtable__controls">
        <input
          type="search"
          className="leadtable__search"
          placeholder="Search by name, company or email"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          aria-label="Search leads"
        />
        <div className="leadtable__filters" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`leadtable__chip ${status === s ? "is-active" : ""}`}
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="leadtable__scroll">
        <table className="leadtable__table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort(col.key)}
                  className={col.numeric ? "is-numeric" : ""}
                >
                  <button type="button" className="leadtable__sort" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    <span className="leadtable__arrow" aria-hidden="true">
                      {sort.key === col.key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="leadtable__empty">
                  No leads match your search. Clear the search or pick another status.
                </td>
              </tr>
            ) : (
              visible.map((lead) => (
                <tr key={lead.id}>
                  <td className="leadtable__name">{lead.name}</td>
                  <td>{lead.company}</td>
                  <td>
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td>
                    <span className={`leadtable__badge leadtable__badge--${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="leadtable__pager">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="leadtable__pager-buttons">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            Previous
          </button>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}