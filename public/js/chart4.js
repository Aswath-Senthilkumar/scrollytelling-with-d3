// chart4.js
// Fast Food Consumption Patterns Visualization

(async function () {
  if (window.chart4Initialized) {
    console.log("Chart4 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz4");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");

  window.chart4Initialized = false;
  window.chart4AnimatedOnce = false;
  window.chart4Rendered = false;

  try {
    const raw = await fetch("Data/datasets/ffsales.csv").then((r) =>
      r.ok ? r.text() : Promise.reject(r.statusText)
    );
    const lines = raw.split(/\r?\n/).filter((l) => l.trim());
    const fullData = lines
      .slice(1)
      .map((l) => {
        const [yr, val] = l.replace(/'/g, "").replace(/^,*/, "").split(",");
        let year = +yr;
        if (yr.length === 2) year = +yr < 50 ? 2000 + +yr : 1900 + +yr;
        return { year, sales: +val };
      })
      .filter((d) => d.year >= 2000 && d.year <= 2023)
      .sort((a, b) => a.year - b.year);

    const displayYears = [2000, 2005, 2010, 2015, 2020, 2023];
    const data = fullData.filter((d) => displayYears.includes(d.year));

    console.log("Years in dataset:", data.map((d) => d.year).join(", "));

    const chartWrapper = container
      .append("div")
      .attr("class", "chart-container")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("position", "relative")
      .style("margin", "0 auto");

    const chartContainer = chartWrapper.append("div").attr("id", "container4");
    const yAxisElement = chartContainer.append("div").attr("id", "y-axis4");
    const chartAreaElement = chartContainer
      .append("div")
      .attr("id", "chart-area4");
    const chartElement = chartAreaElement.append("div").attr("id", "chart4");
    const xAxisElement = chartAreaElement.append("div").attr("id", "x-axis4");

    chartWrapper
      .append("div")
      .attr("id", "chart4-title")
      .style("text-align", "center")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("position", "absolute")
      .style("width", "100%")
      .style("top", "50px")
      .text("Progression in the Sales");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "chart4-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    const chartHeight = 480;
    chartElement.style("height", `${chartHeight}px`);
    yAxisElement.style("height", `${chartHeight}px`);
    const maxSales = Math.max(...data.map((d) => d.sales));
    const pixelsPerBillion = chartHeight / maxSales;

    function getTickInterval(maxVal) {
      const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
      const cands = [0.2, 0.5, 1, 2, 5, 10].map((f) => f * mag);
      let best = cands[0],
        bestDiff = Infinity;
      cands.forEach((i) => {
        const cnt = Math.floor(maxVal / i),
          rem = maxVal % i;
        const ticks = cnt + 1 + (rem ? 1 : 0);
        if (ticks < 3 || ticks > 12) return;
        if (rem && rem / i < 0.2) return;
        const diff = Math.abs(ticks - 7);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = i;
        }
      });
      return best;
    }

    function buildYAxis() {
      yAxisElement.html("");
      const interval = getTickInterval(maxSales);
      const top = Math.ceil(maxSales / interval) * interval;

      for (let v = 0; v <= top; v += interval) {
        const lbl = document.createElement("div");
        lbl.textContent = `$${v}B`;
        lbl.style.position = "absolute";
        lbl.style.right = "0";
        lbl.style.bottom = `${v * pixelsPerBillion}px`;
        yAxisElement.node().appendChild(lbl);
      }
    }

    function buildXAxis() {
      xAxisElement.html("");
      data.forEach((d) => {
        const lbl = document.createElement("div");
        lbl.textContent = d.year;
        lbl.style.width = "140px";
        lbl.style.textAlign = "center";
        xAxisElement.node().appendChild(lbl);
      });
    }

    function prepareEmptyBars() {
      chartElement.html("");
      data.forEach((d, i) => {
        const bar = document.createElement("div");
        bar.className = "burger-bar";
        bar.dataset.idx = i;
        bar.dataset.year = d.year;
        bar.dataset.sales = d.sales;

        const stack = document.createElement("div");
        stack.className = "burger-stack";
        bar.appendChild(stack);

        bar.addEventListener("mouseenter", (ev) => {
          tooltip
            .style("visibility", "visible")
            .html(
              `<div><strong>Year ${d.year}</strong></div>` +
                `<div>Fast Food Sales: $${d.sales.toFixed(2)} billion</div>`
            );
          tooltip
            .style("top", ev.pageY - 10 + "px")
            .style("left", ev.pageX + 10 + "px");
        });

        bar.addEventListener("mousemove", (ev) => {
          tooltip
            .style("top", ev.pageY - 10 + "px")
            .style("left", ev.pageX + 10 + "px");
        });

        bar.addEventListener("mouseleave", () => {
          tooltip.style("visibility", "hidden");
        });

        chartElement.node().appendChild(bar);
      });
    }

    const ingredients = ["patty", "cheese", "onion", "lettuce", "tomato"];
    function buildBurger(barElem, value, animate = false) {
      const stack = barElem.querySelector(".burger-stack");
      stack.innerHTML = "";
      const exactH = value * pixelsPerBillion;
      barElem.style.height = `${exactH}px`;
      const LAYER_H = 30,
        OVERLAP = 24,
        netH = LAYER_H - OVERLAP;
      const nLayers = Math.max(3, Math.ceil(exactH / netH));

      const imgs = [];

      const bb = document.createElement("img");
      bb.src = "Data/images/bottombun.png";
      bb.classList.add("overlap");
      imgs.push(bb);

      for (let j = 1; j < nLayers - 1; j++) {
        const img = document.createElement("img");
        img.src = `Data/images/${ingredients[j % ingredients.length]}.png`;
        img.classList.add("overlap");
        imgs.push(img);
      }

      const tb = document.createElement("img");
      tb.src = "Data/images/topbun.png";
      tb.classList.add("overlap");
      imgs.push(tb);

      imgs.forEach((img, k) => {
        img.style.zIndex = k;
        img.style.position = "absolute";
        img.style.left = "0";
        img.style.width = "100%";
        img.style.height = `${LAYER_H}px`;
        img.style.objectFit = "contain";
        const rawB = k * netH;
        const maxB = exactH - LAYER_H;
        img.style.bottom = `${Math.min(rawB, maxB)}px`;

        stack.appendChild(img);

        if (animate) {
          setTimeout(() => {
            img.classList.add("visible");
          }, 50 * k);
        } else {
          img.classList.add("visible");
        }
      });
    }

    applyChartCSS();

    function applyChartCSS() {
      const styleRules = `
        #container4 {
          position: relative;
          width: 520px;
          height: 580px;
          margin: 0 auto;
          transform: translate(45px, 80px);
        }
        #y-axis4 {
          position: absolute;
          left: -166px;
          width: 60px;
          border-right: 1px solid #333;
          padding-right: 1rem;
          padding-bottom: 0;
          height: 480px;
          font-size: 1.1rem;
          color: #333;
          text-align: right;
        }
        #y-axis4 > div {
          position: absolute;
          right: 1rem;
          transform: translateY(50%);
        }
        #chart-area4 {
          position: relative;
          width: 520px;
          height: 580px;
          margin: 0 auto;
        }
        #chart4 {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 130%;
          margin-left: -90px;
          border-bottom: 1px solid #333;
          height: 480px;
        }
        #x-axis4 {
          display: flex;
          position: absolute;
          justify-content: space-between;
          width: 130%;
          left: -90px;
          top: 480px;
          font-size: 1.1rem;
          color: #333;
        }
        .burger-bar {
          position: relative;
          width: 120px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          transition: height 0.5s ease;
          cursor: pointer;
          transform: translateY(+10px);
        }
        .burger-stack {
          position: absolute;
          bottom: 0;
          width: 140%;
          left: -20%;
        }
        #chart4 .burger-bar img {
          width: 130%;
          opacity: 0;
          transform: translateY(28px) scale(1, 1);
          transition: opacity 0.6s ease, transform 0.6s ease;
          pointer-events: none;
        }
        #chart4 .burger-bar img.visible {
          opacity: 1;
          transform: translateY(0) scale(1.5, 1.5);
        }
        #chart4 .burger-stack img.overlap {
          position: absolute;
          left: -15%;
          width: 130%;
          transform-origin: center bottom;
          pointer-events: none;
        }
      `;

      const styleElement = document.createElement("style");
      styleElement.textContent = styleRules;
      document.head.appendChild(styleElement);
    }

    function initializeChart() {
      buildYAxis();
      buildXAxis();
      prepareEmptyBars();
    }

    function setupScrolling() {
      const idxByYear = new Map(data.map((d, i) => [d.year, i]));

      const stepsCompleted = {
        step0: false,
        step1: false,
        step2: false,
      };

      function buildAllBurgersHidden() {
        console.log("Pre-building all burgers (hidden)");
        try {
          data.forEach((d, i) => {
            const barElem = document.querySelector(
              `#chart4 .burger-bar[data-idx="${i}"]`
            );
            if (!barElem) {
              console.error(
                `Could not find bar element for index ${i}, year ${d.year}`
              );
              return;
            }

            const stack = barElem.querySelector(".burger-stack");
            if (!stack) {
              console.error(
                `Could not find stack for bar ${i}, year ${d.year}`
              );
              return;
            }

            stack.innerHTML = "";
            const exactH = d.sales * pixelsPerBillion;
            barElem.style.height = `${exactH}px`;
            const LAYER_H = 30,
              OVERLAP = 24,
              netH = LAYER_H - OVERLAP;
            const nLayers = Math.max(3, Math.ceil(exactH / netH));

            const bb = document.createElement("img");
            bb.src = "Data/images/bottombun.png";
            bb.classList.add("overlap");
            bb.style.zIndex = 0;
            bb.style.position = "absolute";
            bb.style.left = "0";
            bb.style.width = "100%";
            bb.style.height = `${LAYER_H}px`;
            bb.style.objectFit = "contain";
            bb.style.bottom = `0px`;
            stack.appendChild(bb);

            for (let j = 1; j < nLayers - 1; j++) {
              const img = document.createElement("img");
              img.src = `Data/images/${
                ingredients[j % ingredients.length]
              }.png`;
              img.classList.add("overlap");
              img.style.zIndex = j;
              img.style.position = "absolute";
              img.style.left = "0";
              img.style.width = "100%";
              img.style.height = `${LAYER_H}px`;
              img.style.objectFit = "contain";
              const rawB = j * netH;
              const maxB = exactH - LAYER_H;
              img.style.bottom = `${Math.min(rawB, maxB)}px`;
              stack.appendChild(img);
            }

            const tb = document.createElement("img");
            tb.src = "Data/images/topbun.png";
            tb.classList.add("overlap");
            tb.style.zIndex = nLayers - 1;
            tb.style.position = "absolute";
            tb.style.left = "0";
            tb.style.width = "100%";
            tb.style.height = `${LAYER_H}px`;
            tb.style.objectFit = "contain";
            const rawB = (nLayers - 1) * netH;
            const maxB = exactH - LAYER_H;
            tb.style.bottom = `${Math.min(rawB, maxB)}px`;
            stack.appendChild(tb);

            console.log(
              `Built burger for year ${d.year} with ${nLayers} layers, height: ${exactH}px`
            );
          });
        } catch (err) {
          console.error("Error building burgers:", err);
        }
      }

      function animateBurger(year) {
        try {
          const idx = idxByYear.get(year);
          if (idx === undefined) {
            console.error(`No data found for year ${year}`);
            return;
          }

          const barElem = document.querySelector(
            `#chart4 .burger-bar[data-idx="${idx}"]`
          );
          if (!barElem) {
            console.error(
              `Could not find burger bar element for year ${year} (idx: ${idx})`
            );
            return;
          }

          console.log(`Animating burger for year ${year} (idx: ${idx})`);
          const stack = barElem.querySelector(".burger-stack");
          if (!stack) {
            console.error(`Stack not found for year ${year}`);
            return;
          }

          const images = stack.querySelectorAll("img");
          if (images.length === 0) {
            console.error(`No images found in stack for year ${year}`);
            return;
          }

          const baseDelay = 30;
          const maxDuration = images.length * baseDelay;

          images.forEach((img, i) => {
            setTimeout(() => {
              img.classList.add("visible");
            }, i * baseDelay);
          });

          console.log(
            `Animation started for ${year} with ${images.length} layers, total duration: ${maxDuration}ms`
          );
        } catch (err) {
          console.error(`Error animating burger for year ${year}:`, err);
        }
      }

      window.updateChart4 = function (progress, stepIndex) {
        try {
          if (!window.chart4Rendered && progress > 0.1) {
            console.log("Initializing chart4 elements");
            initializeChart();
            window.chart4Rendered = true;

            container.style("visibility", "visible");
            container.style("opacity", "1");

            buildAllBurgersHidden();

            setTimeout(() => {
              console.log("Animating all years at once");
              const allYears = [2000, 2005, 2010, 2015, 2020, 2023];

              allYears.forEach((year, index) => {
                setTimeout(() => {
                  animateBurger(year);

                  const barElem = document.querySelector(
                    `#chart4 .burger-bar[data-year="${year}"]`
                  );
                  if (barElem) {
                    console.log(
                      `Year ${year} animation triggered, height: ${barElem.style.height}`
                    );
                  }
                }, index * 120);
              });

              stepsCompleted.step0 = true;
              stepsCompleted.step1 = true;
              stepsCompleted.step2 = true;
            }, 400);
          }

          if (window.chart4Rendered && progress > 0.33) {
          }
        } catch (err) {
          console.error("Error in updateChart4:", err);
        }
      };
    }

    window.chart4Initialized = true;
    setupScrolling();
    console.log("Chart4 initialized and ready for scrollytelling");
  } catch (error) {
    console.error("Error initializing Chart4:", error);
    container.style("visibility", "visible").style("opacity", "1");
    container.html(
      "<div style='padding: 2rem; text-align: center;'>Unable to load consumption patterns visualization. Please check your connection and try again.</div>"
    );
  }
})();
