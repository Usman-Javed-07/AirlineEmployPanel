document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#bookingsTable tbody");

  try {
    const response = await fetch(`${BASE_URL}/bookings`);
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

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cancel-btn") && !e.target.disabled) {
    const button = e.target;
    const bookingId = button.dataset.id;

    // Ask the employee for their name
    const employeeName = prompt("Please enter your name:");
    if (!employeeName) {
      alert("Employee name is required to cancel the booking.");
      return;
    }

    if (confirm(`Cancel booking ${bookingId}?`)) {
      // Disable button to prevent double-click
      button.disabled = true;

      try {
        const res = await fetch(`${BASE_URL}/cancel`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, employeeName })
        });

        const result = await res.json();
        alert(result.message || result.error);
        location.reload();
      } catch (err) {
        console.error("Error cancelling booking:", err);
        alert("Something went wrong. Please try again.");
        button.disabled = false; // Re-enable on failure
      }
    }
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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}
