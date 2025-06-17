// chart6.js
// Food Expenditure Line Chart - Home vs. Away

(async function () {
  if (window.chart6Initialized) {
    console.log("Chart6 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz6");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");
  container.style("background-color", "#f8f9fa");

  window.chart6Initialized = false;
  window.chart6AnimatedOnce = false;
  window.chart6Rendered = false;

  try {
    const colorFAH = "#1f78b4";
    const colorFAFH = "#e31a1c";
    let dataArray = [];

    const chartContainer = container
      .append("div")
      .attr("class", "chart-container")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("position", "relative");

    const legend = chartContainer
      .append("div")
      .attr("id", "legend")
      .style("position", "absolute")
      .style("top", "40px")
      .style("right", "20px")
      .style("background", "rgba(255,255,255,0.8)")
      .style("padding", "5px 10px")
      .style("border-radius", "4px")
      .style("font-size", "0.9em")
      .style("z-index", "5")
      .html(
        `<span style="color:${colorFAH};font-weight:bold;">&#9632;</span> Food at Home (FAH)
         <span style="color:${colorFAFH};font-weight:bold;margin-left:10px;">&#9632;</span> Food Away from Home (FAFH)`
      );

    const svg = chartContainer
      .append("svg")
      .attr("id", "chart6-svg")
      .style("width", "100%")
      .style("height", "100%");

    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const margin = { top: 70, right: 40, bottom: 70, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const chartGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top + 60}) scale(0.9)`
      );

    const xScale = d3.scaleLinear().range([0, chartWidth]);
    const yScale = d3.scaleLinear().range([chartHeight, 0]);

    const lineFAH = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.FAH));

    const lineFAFH = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.FAFH));

    const fahLinePath = chartGroup
      .append("path")
      .attr("class", "fah-line")
      .attr("fill", "none")
      .attr("stroke", colorFAH)
      .attr("stroke-width", 4);

    const fafhLinePath = chartGroup
      .append("path")
      .attr("class", "fafh-line")
      .attr("fill", "none")
      .attr("stroke", colorFAFH)
      .attr("stroke-width", 4);

    const pointsGroup = chartGroup.append("g").attr("class", "points");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "food-expenditure-tooltip")
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("box-shadow", "0px 2px 4px rgba(0, 0, 0, 0.3)")
      .style("z-index", "1000")
      .style("display", "none");

    const vline2010 = chartGroup
      .append("line")
      .attr("class", "vline-2010")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#d32f2f")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    const lineDuration = 3000;

    try {
      const response = await fetch("/Data/nominal_expenditures.numbers");
      const buffer = await response.arrayBuffer();

      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];

      dataArray = XLSX.utils
        .sheet_to_json(ws, { header: 0 })
        .map((r) => ({
          year: +r["Year"],
          FAH: +r["Total FAH"],
          FAFH: +r["Total FAFH"],
        }))
        .sort((a, b) => a.year - b.year);

      console.log("Data loaded successfully:", dataArray);

      xScale.domain(d3.extent(dataArray, (d) => d.year));
      yScale.domain([0, d3.max(dataArray, (d) => Math.max(d.FAH, d.FAFH))]);

      const x2010 = xScale(2010);
      vline2010.attr("x1", x2010).attr("x2", x2010);

      chartGroup
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickFormat(d3.format("d"))
            .tickSize(-chartHeight)
            .tickSizeOuter(0)
        );

      chartGroup.append("g").call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickFormat((d) => `$${d3.format(",")(d)}`)
          .tickSize(-chartWidth)
          .tickSizeOuter(0)
      );

      chartGroup.selectAll(".tick line").attr("stroke", "#ccc");

      chartGroup
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year")
        .style("font-size", "14px")
        .style("font-weight", "bold");

      chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 25)
        .attr("text-anchor", "middle")
        .text("Expenditure (Million USD)")
        .style("font-size", "14px")
        .style("font-weight", "bold");

      chartGroup
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .text("Food Expenditure: At Home vs. Away From Home")
        .style("font-size", "18px")
        .style("font-weight", "bold");

      updateLinePlot(dataArray.length);

      window.updateChart6 = function (stepIndex, progress) {
        try {
          if (!window.chart6Rendered && progress > 0.1) {
            console.log("Initializing chart6 elements");
            window.chart6Rendered = true;

            container.style("visibility", "visible");
            container.style("opacity", "1");

            let displayCount = dataArray.length;

            updateLinePlot(displayCount);

            window.chart6AnimatedOnce = true;
          } else if (window.chart6Rendered && !window.chart6AnimatedOnce) {
            let displayCount = dataArray.length;
            updateLinePlot(displayCount);
            window.chart6AnimatedOnce = true;
          }
        } catch (err) {
          console.error("Error in updateChart6:", err);
        }
      };

      window.chart6Initialized = true;
      console.log("Chart6 initialized and ready for scrollytelling");
    } catch (error) {
      console.error("Error loading or parsing expenditure data:", error);
      container.style("visibility", "visible").style("opacity", "1");
      container.html(
        "<div style='padding: 2rem; text-align: center;'>Unable to load food expenditure data. Please check your connection and try again.</div>"
      );
    }

    function updateLinePlot(n) {
      const slice = dataArray.slice(0, n);

      if (slice.length === 0) {
        console.error("No data available for the chart");
        return;
      }

      const firstYear = slice[0]?.year || 2000;
      const lastYear = slice[slice.length - 1]?.year || 2023;
      const yearRange = lastYear - firstYear;

      vline2010
        .transition()
        .duration(300)
        .attr("opacity", slice.some((d) => d.year === 2010) ? 1 : 0);

      pointsGroup.selectAll(".circle-fah, .circle-fafh").remove();

      const fahPathLength = fahLinePath.node().getTotalLength();
      const fafhPathLength = fafhLinePath.node().getTotalLength();

      fahLinePath
        .attr("d", lineFAH(slice))
        .attr("stroke-dasharray", function () {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(lineDuration)
        .attr("stroke-dashoffset", 0);

      fafhLinePath
        .attr("d", lineFAFH(slice))
        .attr("stroke-dasharray", function () {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(lineDuration)
        .attr("stroke-dashoffset", 0);

      const foodAtHomeCircles = pointsGroup
        .selectAll(".circle-fah")
        .data(slice, (d) => d.year);

      foodAtHomeCircles
        .enter()
        .append("circle")
        .attr("class", "circle-fah")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.FAH))
        .attr("r", 0) // Start with radius 0
        .attr("fill", (d) => (d.year === lastYear ? "#fff" : colorFAH))
        .attr("stroke", (d) => (d.year === lastYear ? colorFAH : "none"))
        .attr("stroke-width", (d) => (d.year === lastYear ? 2 : 0))
        .attr("opacity", 0)
        .transition()
        .delay((d) => {
          const xPos = (d.year - firstYear) / (lastYear - firstYear);
          return xPos * (lineDuration * 0.9);
        })
        .duration(200)
        .attr("r", (d) => (d.year === lastYear ? 8 : 4))
        .attr("opacity", 1);

      const foodAwayCircles = pointsGroup
        .selectAll(".circle-fafh")
        .data(slice, (d) => d.year);

      foodAwayCircles
        .enter()
        .append("circle")
        .attr("class", "circle-fafh")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.FAFH))
        .attr("r", 0)
        .attr("fill", (d) => (d.year === lastYear ? "#fff" : colorFAFH))
        .attr("stroke", (d) => (d.year === lastYear ? colorFAFH : "none"))
        .attr("stroke-width", (d) => (d.year === lastYear ? 2 : 0))
        .attr("opacity", 0)
        .transition()
        .delay((d) => {
          const xPos = (d.year - firstYear) / (lastYear - firstYear);
          return xPos * (lineDuration * 0.9);
        })
        .duration(200)
        .attr("r", (d) => (d.year === lastYear ? 8 : 4))
        .attr("opacity", 1);

      setupTooltips();

      function setupTooltips() {
        pointsGroup
          .selectAll(".circle-fah")
          .on("mouseover touchstart", (e, d) => {
            tooltip
              .html(
                `<strong>Year:</strong> ${
                  d.year
                }<br/><strong>Food at Home:</strong> $${d3.format(",")(
                  Math.round(d.FAH)
                )}`
              )
              .style("left", `${e.pageX + 10}px`)
              .style("top", `${e.pageY - 20}px`)
              .style("display", "block");
          });

        pointsGroup
          .selectAll(".circle-fafh")
          .on("mouseover touchstart", (e, d) => {
            tooltip
              .html(
                `<strong>Year:</strong> ${
                  d.year
                }<br/><strong>Food Away from Home:</strong> $${d3.format(",")(
                  Math.round(d.FAFH)
                )}`
              )
              .style("left", `${e.pageX + 10}px`)
              .style("top", `${e.pageY - 20}px`)
              .style("display", "block");
          });

        pointsGroup
          .selectAll(".circle-fah, .circle-fafh")
          .on("mouseout touchend", () => tooltip.style("display", "none"));
      }

      const base2010 = dataArray.find((d) => d.year === 2010) || slice[0];
      const endData = slice[slice.length - 1] || {
        year: 2023,
        FAH: 0,
        FAFH: 0,
      };

      const pctFAH = base2010
        ? Math.round(((endData.FAH - base2010.FAH) / base2010.FAH) * 100)
        : 0;
      const signFAH = pctFAH > 0 ? "+" : "";

      const fahLabel = pointsGroup.selectAll(".label-fah").data([endData]);

      fahLabel
        .enter()
        .append("text")
        .attr("class", "label-fah")
        .attr("x", xScale(endData.year) + 35)
        .attr("y", yScale(endData.FAH))
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", colorFAH)
        .attr("opacity", 0)
        .text(`${signFAH}${pctFAH}%`)
        .transition()
        .delay(lineDuration + 150)
        .duration(150)
        .attr("opacity", 1);

      fahLabel.exit().remove();

      const pctFAFH = base2010
        ? Math.round(((endData.FAFH - base2010.FAFH) / base2010.FAFH) * 100)
        : 0;
      const signFAFH = pctFAFH > 0 ? "+" : "";

      const fafhLabel = pointsGroup.selectAll(".label-fafh").data([endData]);

      fafhLabel
        .enter()
        .append("text")
        .attr("class", "label-fafh")
        .attr("x", xScale(endData.year) + 40)
        .attr("y", yScale(endData.FAFH))
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", colorFAFH)
        .attr("opacity", 0)
        .text(`${signFAFH}${pctFAFH}%`)
        .transition()
        .delay(lineDuration + 150)
        .duration(150)
        .attr("opacity", 1);

      fafhLabel.exit().remove();

      if (slice.some((d) => d.year >= 2010)) {
        chartGroup
          .append("text")
          .attr("class", "recession-annotation")
          .attr("x", xScale(2010) + 10)
          .attr("y", 20)
          .attr("text-anchor", "start")
          .attr("fill", "#666")
          .text("Great Recession Recovery")
          .style("font-size", "12px")
          .style("font-style", "italic")
          .attr("opacity", 0)
          .transition()
          .delay(lineDuration / 2)
          .duration(500)
          .attr("opacity", 1);
      }
    }
  } catch (error) {
    console.error("Error initializing Chart6:", error);
    container.style("visibility", "visible").style("opacity", "1");
    container.html(
      "<div style='padding: 2rem; text-align: center;'>Unable to load food expenditure visualization. Please check your connection and try again.</div>"
    );
  }
})();
