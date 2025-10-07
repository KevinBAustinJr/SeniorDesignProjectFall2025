const statusText = document.getElementById("status-text");

document.getElementById("sendMission").onclick = () => {
  const dest = document.getElementById("destination").value;
  if (!dest) return alert("Please enter a destination!");
  statusText.textContent = `Mission set for "${dest}"`;
  statusText.style.color = "#00cec9";
};