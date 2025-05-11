document.getElementById("luggageForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const bookingId = document.getElementById("bookingId").value.trim();
  const numBags = parseInt(document.getElementById("numBags").value, 10);
  const weight = 50;
  const luggageId = Math.floor(100000 + Math.random() * 900000);

  if (isNaN(numBags) || numBags < 1) {
    Toastify({
  text: "Please enter a valid number of bags.",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

    return;
  }

  if (numBags > 5) {
   Toastify({
  text: "Only a maximum of 5 bags are allowed.",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

    return;
  }

  // ✅ Check if booking ID is valid
  try {
    const checkBookingRes = await fetch(`${BASE_URL}/bookings/${bookingId}`);
    if (!checkBookingRes.ok) {
      const errorData = await checkBookingRes.json();
      Toastify({
  text: "Error: " + (errorData.error || "Invalid booking ID."),
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

      return;
    }
  } catch (err) {
    console.error("Booking check failed:", err);
    Toastify({
  text: "Server error while validating booking ID.",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

    return;
  }

  // ✅ Check if luggage already exists for this booking ID
  try {
    const luggageCheckRes = await fetch(`${BASE_URL}/luggage/check/${bookingId}`);
    const luggageData = await luggageCheckRes.json();
    if (luggageData.exists) {
     Toastify({
  text: "Luggage already checked in for this booking ID.",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

      return;
    }
  } catch (err) {
    console.error("Luggage existence check failed:", err);
    Toastify({
  text: "Server error while checking luggage duplication.",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

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
      Toastify({
  text: "Luggage check-in successful!",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#4CAF50", // Green for success
  close: true,
}).showToast();

    } else {
      Toastify({
  text: "Error: " + (data.error || "An unexpected error occurred."),
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

    }
  } catch (err) {
    console.error("Failed to submit luggage data:", err);
    Toastify({
  text: "Server error while checking in luggage.",
  duration: 5000, // Adjust duration as needed
  gravity: "top",
  position: "right",
  backgroundColor: "#f44336", // Red for error
  close: true,
}).showToast();

  }
});
