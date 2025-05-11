document.getElementById("luggageForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const bookingId = document.getElementById("bookingId").value.trim();
  const numBags = parseInt(document.getElementById("numBags").value, 10);
  const weight = 50;
  const luggageId = Math.floor(100000 + Math.random() * 900000);

  if (isNaN(numBags) || numBags < 1) {
    alert("Please enter a valid number of bags.");
    return;
  }

  if (numBags > 5) {
    alert("Only a maximum of 5 bags are allowed.");
    return;
  }

  // ✅ Check if booking ID is valid
  try {
    const checkBookingRes = await fetch(`${BASE_URL}/bookings/${bookingId}`);
    if (!checkBookingRes.ok) {
      const errorData = await checkBookingRes.json();
      alert("Error: " + (errorData.error || "Invalid booking ID."));
      return;
    }
  } catch (err) {
    console.error("Booking check failed:", err);
    alert("Server error while validating booking ID.");
    return;
  }

  // ✅ Check if luggage already exists for this booking ID
  try {
    const luggageCheckRes = await fetch(`${BASE_URL}/luggage/check/${bookingId}`);
    const luggageData = await luggageCheckRes.json();
    if (luggageData.exists) {
      alert("Luggage already checked in for this booking ID.");
      return;
    }
  } catch (err) {
    console.error("Luggage existence check failed:", err);
    alert("Server error while checking luggage duplication.");
    return;
  }

  // ✅ Update luggage tag UI
  document.getElementById("tagId").textContent = luggageId;
  document.getElementById("tagBooking").textContent = bookingId;
  document.getElementById("tagWeight").textContent = weight;
  document.getElementById("tagBags").textContent = numBags;
  document.getElementById("tag").style.display = "block";

  // ✅ Submit luggage
  try {
    const res = await fetch(`${BASE_URL}/luggage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bookingId, weight, luggageId, numBags })
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
