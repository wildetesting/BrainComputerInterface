(function () {
  const COLORS = {
    walking: "#6c63ff",
    on_foot: "#6c63ff",
    running: "#ff6b6b",
    cycling: "#13a89e",
    vehicle: "#ffb86b",
    still: "#a69f96",
    unknown: "#a69f96",
    asleep: "#273469",
    sleeping: "#273469",
    light: "#4556b0",
    deep: "#151d4a",
    rem: "#6976d9",
    awake: "#cfc7bd",
    out_of_bed: "#cfc7bd",
  };

  function readPayload() {
    if (window.MovementDiary && typeof window.MovementDiary.getDiaryJson === "function") {
      return JSON.parse(window.MovementDiary.getDiaryJson());
    }
    return {
      generatedAt: new Date().toISOString(),
      today: isoDate(new Date()),
      localOnly: true,
      days: [],
      activity: [],
      locations: [],
      sleep: [],
      sleepNote: "Android bridge unavailable. Open this file inside the app.",
    };
  }

  function render() {
    const payload = readPayload();
    const today = payload.today;
    const todaySummary = payload.days.find((day) => day.date === today) || {
      date: today,
      steps: 0,
      sleepMinutes: 0,
      sleepConfidence: "unknown",
      diaryText: "No local movement diary has been recorded yet.",
    };

    document.getElementById("todayDate").textContent = formatDate(today);
    document.getElementById("stepCount").textContent = compactNumber(todaySummary.steps);
    document.getElementById("sleepHours").textContent = minutesToHours(todaySummary.sleepMinutes);
    document.getElementById("diaryText").textContent = todaySummary.diaryText;
    document.getElementById("sleepNote").textContent = payload.sleepNote || "";

    setRing("stepRing", Math.min(todaySummary.steps / 10000, 1));
    setRing("sleepRing", Math.min(todaySummary.sleepMinutes / 480, 1));
    renderTimeline("activityTimeline", activityForDate(payload.activity, today), "type");
    renderTimeline("sleepTimeline", sleepForDate(payload.sleep, today), "stage");
    renderLegend();
    renderRoute(payload.locations.filter((point) => isoDate(new Date(point.timestamp)) === today));
    renderHistory(payload.days);
  }

  function renderTimeline(elementId, rows, key) {
    const element = document.getElementById(elementId);
    element.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "segment unknown";
      empty.style.left = "0%";
      empty.style.width = "100%";
      empty.title = "No local samples yet";
      element.appendChild(empty);
      return;
    }

    rows.forEach((row, index) => {
      const start = new Date(row.timestamp || row.startTs);
      const end = row.endTs ? new Date(row.endTs) : new Date(rows[index + 1]?.timestamp || start.getTime() + 10 * 60 * 1000);
      const left = (minutesIntoDay(start) / 1440) * 100;
      const width = Math.max(((end - start) / 60000 / 1440) * 100, 0.5);
      const segment = document.createElement("div");
      segment.className = `segment ${row[key] || "unknown"}`;
      segment.style.left = `${Math.min(left, 99.5)}%`;
      segment.style.width = `${Math.min(width, 100 - left)}%`;
      segment.title = `${row[key] || "unknown"} ${formatTime(start)}`;
      element.appendChild(segment);
    });
  }

  function renderLegend() {
    const legend = document.getElementById("legend");
    const labels = ["still", "walking", "running", "cycling", "vehicle", "sleeping"];
    legend.replaceChildren(
      ...labels.map((label) => {
        const item = document.createElement("span");
        const dot = document.createElement("i");
        dot.style.background = COLORS[label] || COLORS.unknown;
        item.append(dot, label.replace("_", " "));
        return item;
      }),
    );
  }

  function renderRoute(points) {
    const svg = document.getElementById("routeTrace");
    svg.replaceChildren();
    if (points.length < 2) {
      const text = svgText("Location trace appears after local samples are recorded.", 24, 112);
      svg.appendChild(text);
      return;
    }

    const lats = points.map((point) => point.latitude);
    const lons = points.map((point) => point.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const latRange = maxLat - minLat || 0.001;
    const lonRange = maxLon - minLon || 0.001;
    const coords = points.map((point) => {
      const x = 22 + ((point.longitude - minLon) / lonRange) * 276;
      const y = 198 - ((point.latitude - minLat) / latRange) * 176;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", coords.join(" "));
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#6c63ff");
    polyline.setAttribute("stroke-width", "6");
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    svg.appendChild(polyline);

    const start = svgCircle(coords[0], "#13a89e");
    const end = svgCircle(coords[coords.length - 1], "#ff6b6b");
    svg.append(start, end);
  }

  function renderHistory(days) {
    const history = document.getElementById("history");
    const visible = days.slice(-30).reverse();
    const maxSteps = Math.max(10000, ...visible.map((day) => day.steps || 0));
    history.replaceChildren(
      ...visible.map((day) => {
        const row = document.createElement("div");
        row.className = "history-day";
        const date = document.createElement("span");
        date.textContent = shortDate(day.date);
        const bar = document.createElement("div");
        bar.className = "bar";
        const fill = document.createElement("span");
        fill.style.width = `${Math.min(((day.steps || 0) / maxSteps) * 100, 100)}%`;
        bar.appendChild(fill);
        const steps = document.createElement("strong");
        steps.textContent = compactNumber(day.steps || 0);
        row.append(date, bar, steps);
        return row;
      }),
    );
  }

  function setRing(id, ratio) {
    document.getElementById(id).style.setProperty("--progress", `${Math.round(ratio * 360)}deg`);
  }

  function activityForDate(rows, date) {
    return rows.filter((row) => isoDate(new Date(row.timestamp)) === date);
  }

  function sleepForDate(rows, date) {
    return rows.filter((row) => row.date === date);
  }

  function minutesIntoDay(date) {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  }

  function isoDate(date) {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function formatDate(value) {
    return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  function shortDate(value) {
    return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function compactNumber(value) {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
  }

  function minutesToHours(minutes) {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const remainder = Math.round(minutes % 60);
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  function svgText(content, x, y) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("fill", "#756f68");
    text.setAttribute("font-size", "13");
    text.textContent = content;
    return text;
  }

  function svgCircle(coord, color) {
    const [x, y] = coord.split(",").map(Number);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "7");
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "#f8f1e8");
    circle.setAttribute("stroke-width", "3");
    return circle;
  }

  window.MovementDiaryApp = { reload: render };
  document.getElementById("refreshButton").addEventListener("click", () => {
    if (window.MovementDiary && typeof window.MovementDiary.refreshFromPhone === "function") {
      window.MovementDiary.refreshFromPhone();
    } else {
      render();
    }
  });
  render();
})();
