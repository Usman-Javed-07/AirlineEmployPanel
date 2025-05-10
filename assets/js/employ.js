document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#bookingsTable tbody");

  try {
    const response = await fetch("http://localhost:5000/api/bookings");
    const bookings = await response.json();

    if (Array.isArray(bookings) && bookings.length > 0) {
      bookings.forEach(booking => {
        const tr = document.createElement("tr");

        const isCancelled = booking.status === "cancelled";
        const cancelDisabled = isCancelled ? "disabled" : "";
        const cancelClass = isCancelled ? "cancel-btn disabled-btn" : "cancel-btn";

        tr.innerHTML = `
          <td>${booking.booking_id}</td>
          <td>${booking.full_name}</td>
          <td>${booking.email}</td>
          <td>${booking.dob ? formatDate(booking.dob) : "-"}</td>
          <td>${booking.nationality}</td>
          <td>${booking.flight_route}</td>
          <td>${booking.flight_class}</td>
          <td>${formatDate(booking.flight_date)}</td>
          <td>${booking.departure_time}</td>
          <td>${booking.arrival_time}</td>
          <td>${booking.vessel}</td>
          <td>${parseExtras(booking.extras)}</td>
          <td>£${booking.total_amount}</td>
          <td>${booking.status}</td>
          <td><button class="${cancelClass}" data-id="${booking.booking_id}" ${cancelDisabled}>Cancel</button></td>
        `;

        tableBody.appendChild(tr);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="25">No bookings available.</td></tr>`;
    }

  } catch (error) {
    console.error("Failed to load bookings:", error);
    tableBody.innerHTML = `<tr><td colspan="25">Error loading bookings.</td></tr>`;
  }
});

function parseExtras(extrasJSON) {
  try {
    const extras = JSON.parse(extrasJSON || "[]");
    if (!extras.length) return "-";
    return extras.map(e => e.name || e).join(", ");
  } catch {
    return "-";
  }
}

function maskCard(cardNumber) {
  if (!cardNumber || cardNumber.length < 4) return "****";
  return "**** **** **** " + cardNumber.slice(-4);
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cancel-btn") && !e.target.disabled) {
    const bookingId = e.target.dataset.id;
    if (confirm(`Cancel booking ${bookingId}?`)) {
      const res = await fetch("http://localhost:5000/api/cancel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId })
      });
      const result = await res.json();
      alert(result.message || result.error);
      location.reload();
    }
  }
});

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}
