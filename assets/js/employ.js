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
    Toastify({
      text: "Failed to load bookings.",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#f44336",
    }).showToast();
  }
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cancel-btn") && !e.target.disabled) {
    const button = e.target;
    const bookingId = button.dataset.id;

    try {
      // Ask for employee name
      const { isConfirmed, value: employeeName } = await Swal.fire({
        title: 'Enter your name',
        input: 'text',
        inputLabel: 'Employee Name',
        inputPlaceholder: 'Type your name here',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return 'Name is required!';
        }
      });

      if (!isConfirmed || !employeeName) return;

      // Confirm cancellation
      const confirmCancel = await Swal.fire({
        title: `Cancel booking ${bookingId}?`,
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
      });

      if (!confirmCancel.isConfirmed) return;

      // Disable button to prevent double click
      button.disabled = true;

      // Cancel API request
      const res = await fetch(`${BASE_URL}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, employeeName })
      });

      const result = await res.json();

      if (result.error) {
        Toastify({
          text: result.error,
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#f44336",
          close: true,
        }).showToast();
        button.disabled = false; // re-enable if error
      } else {
        Toastify({
          text: result.message || "Booking cancelled successfully!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#4CAF50",
          close: true,
        }).showToast();

        // Update row in UI
        const row = button.closest("tr");
        const statusCell = row.children[13];
        statusCell.textContent = "cancelled";

        button.classList.add("disabled-btn");
      }

    } catch (err) {
      console.error("Error cancelling booking:", err);
      Toastify({
        text: "Something went wrong. Please try again.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#f44336",
        close: true,
      }).showToast();
      button.disabled = false;
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
