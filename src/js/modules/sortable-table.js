// Sortable, paginated data table.
// Sort buttons live inside the column headers and the sorted <th> carries aria-sort.
// A visible role="status" line announces what changed after every sort or page change.
import { CLAIMS } from "../data/datasets.js";

const SOURCES = { claims: CLAIMS };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const FORMAT = {
  money: (v) => money.format(v),
  date: (v) => dateFmt.format(new Date(`${v}T00:00:00Z`)),
  text: (v) => v,
};

export function initSortableTable(root) {
  const rows = [...SOURCES[root.dataset.source]];
  const pageSize = Number(root.dataset.pageSize) || 10;
  const tbody = root.querySelector("tbody");
  const headers = [...root.querySelectorAll("th[data-key]")];
  const status = root.querySelector("[data-table-status]");
  const pager = root.querySelector("[data-pagination]");
  const noun = root.dataset.noun || "rows";
  const pageCount = Math.ceil(rows.length / pageSize);

  let sortKey = null;
  let sortDir = "ascending";
  let page = 1;

  // Pagination is built once. Prev and Next use aria-disabled instead of disabled
  // so they stay focusable and keyboard users are not dropped back to the top of the page.
  const makeButton = (label, attrs = {}) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pagination__button";
    b.innerHTML = label;
    Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
    const li = document.createElement("li");
    li.append(b);
    pager.querySelector("ul").append(li);
    return b;
  };

  const prev = makeButton('<span aria-hidden="true">&lsaquo;</span> Previous<span class="visually-hidden"> page</span>');
  const pageButtons = Array.from({ length: pageCount }, (_, i) =>
    makeButton(String(i + 1), { "aria-label": `Page ${i + 1}` }),
  );
  const next = makeButton('Next<span class="visually-hidden"> page</span> <span aria-hidden="true">&rsaquo;</span>');

  prev.addEventListener("click", () => page > 1 && go(page - 1));
  next.addEventListener("click", () => page < pageCount && go(page + 1));
  pageButtons.forEach((b, i) => b.addEventListener("click", () => go(i + 1)));

  headers.forEach((th) => {
    th.querySelector("button").addEventListener("click", () => {
      const key = th.dataset.key;
      sortDir = sortKey === key && sortDir === "ascending" ? "descending" : "ascending";
      sortKey = key;
      page = 1;
      sort();
      render();
    });
  });

  function sort() {
    const th = headers.find((h) => h.dataset.key === sortKey);
    const type = th.dataset.type || "text";
    const dir = sortDir === "ascending" ? 1 : -1;
    rows.sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      return (type === "money" ? x - y : String(x).localeCompare(String(y))) * dir;
    });
    headers.forEach((h) => {
      if (h === th) h.setAttribute("aria-sort", sortDir);
      else h.removeAttribute("aria-sort");
    });
  }

  function go(n) {
    page = n;
    render();
  }

  function render() {
    const start = (page - 1) * pageSize;
    const slice = rows.slice(start, start + pageSize);

    tbody.replaceChildren(
      ...slice.map((row) => {
        const tr = document.createElement("tr");
        headers.forEach((h, i) => {
          // First column is the row header so screen readers announce it with each cell
          const cell = document.createElement(i === 0 ? "th" : "td");
          if (i === 0) cell.scope = "row";
          const value = FORMAT[h.dataset.type || "text"](row[h.dataset.key]);
          if (h.dataset.key === "status") {
            const badge = document.createElement("span");
            badge.className = `badge badge--${row.status.split(" ")[0].toLowerCase()}`;
            badge.textContent = value;
            cell.append(badge);
          } else {
            cell.textContent = value;
          }
          if (h.dataset.type === "money") cell.className = "num";
          tr.append(cell);
        });
        return tr;
      }),
    );

    pageButtons.forEach((b, i) => {
      if (i + 1 === page) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    prev.setAttribute("aria-disabled", String(page === 1));
    next.setAttribute("aria-disabled", String(page === pageCount));

    const end = Math.min(start + pageSize, rows.length);
    let message = `Showing ${start + 1} to ${end} of ${rows.length} ${noun}`;
    if (sortKey) {
      const label = headers.find((h) => h.dataset.key === sortKey).querySelector("[data-label]").textContent;
      message += `, sorted by ${label} ${sortDir}`;
    }
    status.textContent = `${message}.`;
  }

  render();
}
