document.getElementById("luggageForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const bookingId = document.getElementById("bookingId").value.trim();
  const numBags = parseInt(document.getElementById("numBags").value, 10);
  const weight = 50; // Fixed weight
  const luggageId = Math.floor(100000 + Math.random() * 900000); // 6-digit random ID

  // ✅ Limit check: no more than 5 bags
  if (isNaN(numBags) || numBags < 1) {
    alert("Please enter a valid number of bags.");
    return;
  }

  if (numBags > 5) {
    alert("Only a maximum of 5 bags are allowed.");
    return;
  }

  // ✅ Check if booking ID exists before submitting luggage
  try {
    const checkBookingRes = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
    if (!checkBookingRes.ok) {
      const errorData = await checkBookingRes.json();
      alert("Error: " + (errorData.error || "Invalid booking ID."));
      return; // ⛔ Stop further execution
    }
  } catch (err) {
    console.error("Booking check failed:", err);
    alert("Server error while validating booking ID.");
    return;
  }

  // ✅ Update luggage tag UI
  document.getElementById("tagId").textContent = luggageId;
  document.getElementById("tagBooking").textContent = bookingId;
  document.getElementById("tagWeight").textContent = weight;
  document.getElementById("tagBags").textContent = numBags;
  document.getElementById("tag").style.display = "block";

  // ✅ Submit luggage data
  try {
    const res = await fetch("http://localhost:5000/api/luggage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bookingId,
        weight,
        luggageId,
        numBags
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Luggage check-in successful!");
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error("Failed to submit luggage data:", err);
    alert("Server error while checking in luggage.");
  }
});
