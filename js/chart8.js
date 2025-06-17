// chart8.js
// Fast Food Workforce Chart - Small Multiples

(async function () {
  if (window.chart8Initialized) {
    console.log("Chart8 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz8");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");
  container.style("background-color", "#f8f9fa");

  window.chart8Initialized = false;
  window.chart8AnimatedOnce = false;
  window.chart8Rendered = false;

  try {
    const years = d3.range(2001, 2024);
    const CHART_W = 100;
    const CHART_H = 50;
    const GUTTER = 20;
    const MARGIN = { top: 50, left: 50 };
    const PADDING = 2;

    const stateGrid = {
      AK: { row: 1, col: -0.3 },
      AL: { row: 8, col: 5.4 },
      AR: { row: 7, col: 3.6 },
      AZ: { row: 7, col: 0.9 },
      CA: { row: 6, col: 0 },
      CO: { row: 6, col: 1.8 },
      CT: { row: 5, col: 8.1 },
      DE: { row: 6, col: 8.1 },
      FL: { row: 9, col: 7.2 },
      GA: { row: 8, col: 6.3 },
      HI: { row: 10, col: 0 },
      IA: { row: 5, col: 3.6 },
      ID: { row: 4, col: 0.9 },
      IL: { row: 4, col: 4.5 },
      IN: { row: 5, col: 4.5 },
      KS: { row: 7, col: 2.7 },
      KY: { row: 6, col: 4.5 },
      LA: { row: 8, col: 3.6 },
      MA: { row: 4, col: 8.1 },
      MD: { row: 6, col: 7.2 },
      ME: { row: 2, col: 9 },
      MI: { row: 4, col: 5.4 },
      MN: { row: 4, col: 3.6 },
      MO: { row: 6, col: 3.6 },
      MS: { row: 8, col: 4.5 },
      MT: { row: 4, col: 1.8 },
      NC: { row: 7, col: 5.4 },
      ND: { row: 4, col: 2.7 },
      NE: { row: 6, col: 2.7 },
      NH: { row: 3, col: 9 },
      NJ: { row: 5, col: 7.2 },
      NM: { row: 7, col: 1.8 },
      NV: { row: 5, col: 0.9 },
      NY: { row: 4, col: 7.2 },
      OH: { row: 5, col: 5.4 },
      OK: { row: 8, col: 2.7 },
      OR: { row: 5, col: 0 },
      PA: { row: 5, col: 6.3 },
      RI: { row: 5, col: 9 },
      SC: { row: 7, col: 6.3 },
      SD: { row: 5, col: 2.7 },
      TN: { row: 7, col: 4.5 },
      TX: { row: 9, col: 2.7 },
      UT: { row: 6, col: 0.9 },
      VA: { row: 6, col: 6.3 },
      VT: { row: 3, col: 8.1 },
      WA: { row: 4, col: 0 },
      WI: { row: 3, col: 4.5 },
      WV: { row: 6, col: 5.4 },
      WY: { row: 5, col: 1.8 },
      DC: { row: 7, col: 7.2 },
      VI: { row: -10, col: 0 },
      PR: { row: -10, col: 0 },
      GU: { row: -10, col: 0 },
    };

    const stateData = {};
    const currentAttr = "TOT_EMP";
    let globalCountMax = 0;

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const modal = d3
      .select("body")
      .append("div")
      .attr("id", "state-modal")
      .style("display", "none")
      .style("position", "fixed")
      .style("z-index", "1000")
      .style("left", "0")
      .style("top", "0")
      .style("width", "100%")
      .style("height", "100%")
      .style("overflow", "auto")
      .style("background-color", "rgba(0,0,0,0.4)")
      .style("align-items", "center")
      .style("justify-content", "center");

    d3.select("#state-modal").style("display", "none");

    const modalContent = modal
      .append("div")
      .style("background-color", "white")
      .style("margin", "0 auto")
      .style("padding", "30px")
      .style("border", "1px solid #888")
      .style("width", "70%")
      .style("max-width", "750px")
      .style("border-radius", "8px")
      .style("box-shadow", "0 4px 15px rgba(0,0,0,0.2)")
      .style("position", "relative");

    modalContent
      .append("span")
      .attr("class", "close")
      .style("color", "#aaa")
      .style("position", "absolute")
      .style("top", "10px")
      .style("right", "15px")
      .style("font-size", "28px")
      .style("font-weight", "bold")
      .style("cursor", "pointer")
      .html("&times;");

    modalContent
      .append("h2")
      .attr("id", "modal-title")
      .style("margin-top", "0")
      .style("margin-bottom", "20px")
      .style("text-align", "center");

    modalContent
      .append("svg")
      .attr("id", "modal-chart")
      .style("display", "block")
      .style("margin", "0 auto");

    let dataLoaded = false;
    let states = [];

    Promise.all(
      years.map((y) =>
        d3.csv(`data/state_final/${y}_updated.csv`, (row) => {
          const occ = row.OCC_TITLE.trim().toLowerCase();
          const st = row.ST;
          if (!st) return null;
          if (!stateData[st]) stateData[st] = { values: [] };

          let rec = stateData[st].values.find((v) => v.year === y);
          if (!rec) {
            rec = {
              year: y,
              cooks: { TOT_EMP: 0, A_MEAN: 0 },
              combined: { TOT_EMP: 0, A_MEAN: 0 },
            };
            stateData[st].values.push(rec);
          }
          if (occ === "cooks, fast food") {
            rec.cooks.TOT_EMP += +row.TOT_EMP;
          } else if (occ.startsWith("combined food preparation")) {
            rec.combined.TOT_EMP += +row.TOT_EMP;
          }
          return null;
        })
      )
    )
      .then(() => {
        Object.values(stateData).forEach((s) => {
          years.forEach((y) => {
            if (!s.values.find((v) => v.year === y)) {
              s.values.push({
                year: y,
                cooks: { TOT_EMP: 0, A_MEAN: 0 },
                combined: { TOT_EMP: 0, A_MEAN: 0 },
              });
            }
          });
          s.values.sort((a, b) => a.year - b.year);
        });

        states = Object.entries(stateData).map(([st, s]) => ({
          state: st,
          values: s.values,
        }));

        globalCountMax = d3.max(states, (s) =>
          d3.max(s.values, (v) => v.cooks.TOT_EMP + v.combined.TOT_EMP)
        );

        dataLoaded = true;

        window.chart8Initialized = true;
        console.log(
          "Chart8 data loaded and ready for rendering when scrolled into view"
        );
      })
      .catch(console.error);

    function showModal(d) {
      d3.select("#state-modal")
        .style("display", "flex")
        .style("visibility", "visible");
      d3.select("#modal-title").text(d.state);
      drawModalChart(d.values);
    }

    function hideModal() {
      d3.select("#state-modal")
        .style("display", "none")
        .style("visibility", "hidden");
      d3.select("#modal-chart").selectAll("*").remove();
    }

    d3.select(".close").on("click", hideModal);
    d3.select("#state-modal").on("click", function (e) {
      if (e.target.id === "state-modal") hideModal();
    });

    function drawSmallMultiples(states) {
      const allStacks = states.flatMap((s) => {
        const cooksPct = percentSeries(s.values, currentAttr, "cooks");
        const combinedPct = percentSeries(s.values, currentAttr, "combined");
        return cooksPct.map((d, i) => cooksPct[i].value + combinedPct[i].value);
      });
      const minSum = d3.min(allStacks),
        maxSum = d3.max(allStacks);

      const maxCol = d3.max(Object.values(stateGrid), (d) => d.col),
        maxRow = d3.max(Object.values(stateGrid), (d) => d.row);
      const svgW = MARGIN.left * 2 + (maxCol + 1) * (CHART_W + GUTTER) - GUTTER;
      const svgH = MARGIN.top * 2 + (maxRow + 1) * (CHART_H + GUTTER) - GUTTER;

      const svg = container
        .append("svg")
        .attr("width", svgW)
        .attr("height", svgH)
        .attr("viewBox", `0 0 ${svgW} ${svgH}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("background-color", "#f8f9fa");

      svg
        .append("text")
        .attr("x", svgW / 2)
        .attr("y", 80)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Fast Food Workforce Distribution by State");

      const xScale = d3.scaleLinear([2001, 2023], [0, CHART_W]);
      const yScale = d3
        .scalePow()
        .exponent(0.5)
        .domain([minSum, maxSum])
        .range([CHART_H, 0]);
      const stackGen = d3
        .stack()
        .keys(["cooks", "combined"])
        .value((d, key) => d[key]);

      const areaGen = d3
        .area()
        .x((d) => xScale(d.data.year))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

      const groups = svg
        .selectAll("g.state")
        .data(states, (d) => d.state)
        .enter()
        .append("g")
        .attr("class", "state")
        .attr("transform", (d) => {
          const { row, col } = stateGrid[d.state] || {};
          return `translate(${MARGIN.left + col * (CHART_W + GUTTER)},${
            MARGIN.top + row * (CHART_H + GUTTER)
          })`;
        });

      groups
        .append("rect")
        .attr("class", "cell-bg")
        .attr("width", CHART_W)
        .attr("height", CHART_H)
        .attr("fill", "#f8f9fa")
        .attr("stroke", "#ccc");

      groups
        .append("text")
        .attr("class", "state-label")
        .attr("x", 3)
        .attr("y", 12)
        .text((d) => d.state);

      groups
        .append("path")
        .attr("class", "area-cooks")
        .datum((d) => {
          const cooksPct = percentSeries(d.values, currentAttr, "cooks");
          const combinedPct = percentSeries(d.values, currentAttr, "combined");
          const pctData = d.values.map((pt, i) => ({
            year: pt.year,
            cooks: cooksPct[i].value,
            combined: combinedPct[i].value,
          }));
          return stackGen(pctData)[0];
        })
        .attr("d", areaGen);

      groups
        .append("path")
        .attr("class", "area-combined")
        .datum((d) => {
          const cooksPct = percentSeries(d.values, currentAttr, "cooks");
          const combinedPct = percentSeries(d.values, currentAttr, "combined");
          const pctData = d.values.map((pt, i) => ({
            year: pt.year,
            cooks: cooksPct[i].value,
            combined: combinedPct[i].value,
          }));
          return stackGen(pctData)[1];
        })
        .attr("d", areaGen);

      groups
        .on("mouseover", (event, d) => {
          const rec = d.values.find((v) => v.year === 2023);
          const cooks = rec.cooks.TOT_EMP;
          const combined = rec.combined.TOT_EMP;
          const total = cooks + combined;

          tooltip
            .html(
              `
          <strong>${d.state} (2023)</strong><br/>
          Total employees: ${total.toLocaleString()}<br/>
          Cooks: ${cooks.toLocaleString()}<br/>
          Other workers: ${combined.toLocaleString()}
        `
            )
            .style("visibility", "visible");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY + 5 + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

      dynamicResize(groups);

      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top * 2})`);
      legend
        .append("rect")
        .attr("x", svgW - 250)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#ffd941");
      legend
        .append("text")
        .attr("x", svgW - 235)
        .attr("y", 10)
        .text("Chefs and Head Cooks");
      legend
        .append("rect")
        .attr("x", svgW - 250)
        .attr("y", 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#FF5252");
      legend
        .append("text")
        .attr("x", svgW - 235)
        .attr("y", 30)
        .text("Other Workers");

      groups.on("click", (e, d) => showModal(d));

      console.log("Showing chart8 after rendering");
      container.style("visibility", "visible");
      container.style("opacity", "1");
      window.chart8Rendered = true;

      return { groups, areaGen, stackGen };
    }

    function dynamicResize(groups) {
      groups.each(function () {
        const g = d3.select(this),
          rect = g.select("rect.cell-bg"),
          bbox = this.getBBox(),
          overflow = bbox.height - CHART_H;
        if (overflow > 0) {
          const newH = CHART_H + overflow + PADDING;
          rect.attr("height", newH);
          g.selectAll("path").attr(
            "transform",
            `translate(0,${overflow + PADDING})`
          );
          g.select("text.state-label").attr(
            "transform",
            `translate(0,${overflow + PADDING})`
          );
        } else {
          rect.attr("height", CHART_H);
          g.selectAll("path").attr("transform", null);
          g.select("text.state-label").attr("transform", null);
        }
      });
    }

    function percentSeries(values, keyType, key) {
      const first = values.find((v) => v[key][keyType] > 0),
        base = first ? first[key][keyType] : 1;
      return values.map((pt) => ({
        year: pt.year,
        value: base > 0 ? (pt[key][keyType] - base) / base : 0,
      }));
    }

    function drawModalChart(values) {
      const margin = { top: 30, right: 50, bottom: 50, left: 80 },
        w = 600 - margin.left - margin.right,
        h = 350 - margin.top - margin.bottom;

      const parent = d3
        .select("#modal-chart")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .style("background-color", "white");

      parent.selectAll("*").remove();

      const svg = parent
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      svg
        .append("rect")
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "#f8f9fa")
        .attr("rx", 5)
        .attr("ry", 5);

      const x = d3
        .scaleLinear()
        .domain(d3.extent(values, (d) => d.year))
        .range([0, w]);

      const y = d3
        .scaleLinear()
        .domain([0, globalCountMax * 1.1])
        .nice()
        .range([h, 0]);

      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(5).tickSize(-h).tickFormat(""));

      svg
        .append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat(""));

      svg
        .selectAll(".grid line")
        .style("stroke", "#e0e0e0")
        .style("stroke-opacity", 0.7)
        .style("shape-rendering", "crispEdges");

      svg.selectAll(".grid path").style("stroke-width", 0);

      svg
        .append("g")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))
        .style("font-size", "12px");

      svg.append("g").call(d3.axisLeft(y).ticks(6)).style("font-size", "12px");

      svg
        .append("text")
        .attr("transform", `translate(${w / 2}, ${h + 35})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -(h / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Employees");

      const lineC = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.cooks.TOT_EMP))
        .curve(d3.curveMonotoneX);

      const lineM = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.combined.TOT_EMP))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(values)
        .attr("d", lineC)
        .attr("stroke", "#ffd941")
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);

      svg
        .append("path")
        .datum(values)
        .attr("d", lineM)
        .attr("stroke", "#FF5252")
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);

      svg
        .selectAll(".dot-cooks")
        .data(values)
        .enter()
        .append("circle")
        .attr("class", "dot-cooks")
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.cooks.TOT_EMP))
        .attr("r", 4)
        .attr("fill", "#ffd941")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .style("opacity", 1);

      svg
        .selectAll(".dot-combined")
        .data(values)
        .enter()
        .append("circle")
        .attr("class", "dot-combined")
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.combined.TOT_EMP))
        .attr("r", 4)
        .attr("fill", "#FF5252")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .style("opacity", 1);

      const lg = svg
        .append("g")
        .attr("transform", `translate(${w - 180}, 20)`)
        .attr("class", "legend")
        .style("font-size", "12px");

      lg.append("rect")
        .attr("width", 170)
        .attr("height", 60)
        .attr("fill", "white")
        .attr("stroke", "#e0e0e0")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("opacity", 0.8);

      lg.append("line")
        .attr("x1", 10)
        .attr("y1", 20)
        .attr("x2", 30)
        .attr("y2", 20)
        .attr("stroke", "#ffd941")
        .attr("stroke-width", 3);
      lg.append("circle")
        .attr("cx", 20)
        .attr("cy", 20)
        .attr("r", 4)
        .attr("fill", "#ffd941");
      lg.append("text")
        .attr("x", 40)
        .attr("y", 24)
        .text("Chefs and Head Cooks");

      lg.append("line")
        .attr("x1", 10)
        .attr("y1", 45)
        .attr("x2", 30)
        .attr("y2", 45)
        .attr("stroke", "#FF5252")
        .attr("stroke-width", 3);
      lg.append("circle")
        .attr("cx", 20)
        .attr("cy", 45)
        .attr("r", 4)
        .attr("fill", "#FF5252");
      lg.append("text").attr("x", 40).attr("y", 49).text("Other Workers");
    }

    window.updateChart8 = function (progress, stepIndex) {
      try {
        if (dataLoaded && !window.chart8Rendered && progress > 0.2) {
          console.log("Chart8 entering viewport with progress:", progress);
          drawSmallMultiples(states);
          window.chart8AnimatedOnce = true;
        }
      } catch (err) {
        console.error("Error in updateChart8:", err);
      }
    };
  } catch (error) {
    console.error("Error initializing Chart8:", error);
    container.style("visibility", "visible").style("opacity", "1");
    container.html(
      "<div style='padding: 2rem; text-align: center;'>Unable to load workforce visualization. Please check your connection and try again.</div>"
    );
  }
})();
