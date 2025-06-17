// chart10.js
// Bowl-Line Graph of Ideal Nutrition

document.addEventListener("DOMContentLoaded", function () {
  createChart10();
});

function createChart10() {
  const svg = d3
    .select("#viz10")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 900 600");

  let width, height;
  const center = { x: 0, y: 0 };
  const rad = () => Math.min(width, height) * 0.4;

  let dataset;
  let age = "2-3";
  let gender = "M";
  let update1 = true;

  const order = [
    "Fiber",
    "Iron",
    "Added Sugars",
    "Carbohydrate (DGA)",
    "Protein (RDA)",
    "Saturated Fatty Acids",
  ];
  const color = [
    "#00897B",
    "#C0CA33",
    "#FFB300",
    "#FF7043",
    "#1976D2",
    "#7E57C2",
  ];
  const max_line_len = 80;
  const customX0Multipliers = [-1, -0.945, -0.81, 1, 0.945, 0.81];
  const customY0Multipliers = [-0.25, 0, 0.25, -0.25, 0, 0.25];

  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "5px 8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

  const bbox = svg.node().getBoundingClientRect();
  width = bbox.width;
  height = bbox.height;
  center.x = width / 2;
  center.y = height / 2;

  const controlsDiv = d3
    .select("#viz10")
    .append("div")
    .attr("class", "controls")
    .style("position", "absolute")
    .style("bottom", "10px")
    .style("left", "50%")
    .style("transform", "translateX(-50%)")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("gap", "10px")
    .style("padding", "12px 15px")
    .style("background-color", "rgba(255,255,255,0.9)")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.15)")
    .style("z-index", "5");

  controlsDiv
    .append("div")
    .style("font-weight", "bold")
    .style("margin-bottom", "10px")
    .style("font-size", "14px")
    .style("width", "100%")
    .style("text-align", "center")
    .text("Adjust Nutrition Settings:");

  const controlsRow = controlsDiv
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("align-items", "center")
    .style("justify-content", "space-between")
    .style("gap", "20px")
    .style("width", "100%");

  const ageControl = controlsRow
    .append("div")
    .style("display", "flex")
    .style("align-items", "center");

  ageControl
    .append("label")
    .style("margin-right", "10px")
    .style("font-size", "14px")
    .text("Age Range: ");

  ageControl
    .append("select")
    .attr("id", "chart10-age")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("border", "1px solid #ccc")
    .on("change", function () {
      age = this.value;
      updateVisualization();
    })
    .selectAll("option")
    .data(["2-3", "4-8", "9-13", "14-18", "19-30", "31-50", "51+"])
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d)
    .property("selected", (d) => d === "2-3");

  const genderSwitch = controlsRow
    .append("div")
    .attr("class", "gender-switch")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "8px");

  genderSwitch
    .append("span")
    .attr("id", "male-label")
    .text("Male")
    .style("font-weight", "bold")
    .style("color", "#1976D2")
    .style("font-size", "14px");

  const switchLabel = genderSwitch
    .append("label")
    .attr("class", "switch")
    .style("position", "relative")
    .style("width", "50px")
    .style("height", "26px");

  switchLabel
    .append("input")
    .attr("type", "checkbox")
    .attr("id", "chart10-genderToggle")
    .on("change", function () {
      gender = this.checked ? "F" : "M";

      d3.select("#male-label")
        .style("font-weight", this.checked ? "normal" : "bold")
        .style("color", this.checked ? "#666" : "#1976D2");

      d3.select("#female-label")
        .style("font-weight", this.checked ? "bold" : "normal")
        .style("color", this.checked ? "#E91E63" : "#666");

      d3.select(".slider-circle").style(
        "transform",
        this.checked ? "translateX(24px)" : "translateX(0)"
      );

      d3.select(".slider").style(
        "background-color",
        this.checked ? "#E91E63" : "#1976D2"
      );

      updateVisualization();
    });

  switchLabel
    .append("span")
    .attr("class", "slider")
    .style("position", "absolute")
    .style("cursor", "pointer")
    .style("top", "0")
    .style("left", "0")
    .style("right", "0")
    .style("bottom", "0")
    .style("background-color", "#1976D2")
    .style("border-radius", "13px")
    .style("transition", "background-color 0.3s");

  switchLabel
    .append("span")
    .attr("class", "slider-circle")
    .style("position", "absolute")
    .style("content", "''")
    .style("height", "20px")
    .style("width", "20px")
    .style("left", "3px")
    .style("bottom", "3px")
    .style("background-color", "#fff")
    .style("border-radius", "50%")
    .style("transition", "transform 0.3s");

  genderSwitch
    .append("span")
    .attr("id", "female-label")
    .text("Female")
    .style("font-weight", "normal")
    .style("color", "#666")
    .style("font-size", "14px");

  svg
    .append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .text("Ideal Nutrient Intake by Age and Gender");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 80)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(
      "Select age range and gender to see recommended daily nutrition values"
    );

  d3.csv("/Data/ideal_nutritional_intake.csv")
    .then((raw) => {
      const parseNum = (s) => {
        const v = parseFloat(s);
        return isNaN(v) ? 0 : v;
      };
      dataset = raw.map((d) => ({
        nutrient: d.Nutrient.trim(),
        M_2_3: parseNum(d["M 2-3"]),
        F_2_3: parseNum(d["F 2-3"]),
        M_4_8: parseNum(d["M 4-8"]),
        F_4_8: parseNum(d["F 4-8"]),
        M_9_13: parseNum(d["M 9-13"]),
        F_9_13: parseNum(d["F 9-13"]),
        M_14_18: parseNum(d["M 14-18"]),
        F_14_18: parseNum(d["F 14-18"]),
        M_19_30: parseNum(d["M 19-30"]),
        F_19_30: parseNum(d["F 19-30"]),
        M_31_50: parseNum(d["M 31-50"]),
        F_31_50: parseNum(d["F 31-50"]),
        M_51_: parseNum(d["M 51+"]),
        F_51_: parseNum(d["F 51+"]),
      }));

      updateVisualization();
    })
    .catch((error) => {
      console.error("Error loading data:", error);
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Error loading data. Please check console for details.");
    });

  function updateVisualization() {
    if (!dataset) return;

    const suffix = age.replace("+", "_").replace(/-/, "_");
    const bucket = `${gender}_${suffix}`;

    svg.selectAll(".bowl-wave, .bowl-text, .spike, .nutrient-text").remove();

    const cals = dataset.find((d) => d.nutrient === "Calorie Level Assessed");

    const defs = svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "waveGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#00BCD4");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#FFC107");

    const rin = rad() - 20;
    const bowlX = center.x;
    const bowlY = center.y - 78;

    const clip = defs.append("clipPath").attr("id", "bowlClip");
    clip
      .append("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(0)
          .outerRadius(rin)
          .startAngle(0)
          .endAngle(Math.PI)()
      )
      .attr("transform", `translate(${bowlX},${bowlY}) rotate(90)`);

    const maxcal = 4500;
    const calval = cals ? +cals[bucket] || 0 : 0;
    const fillFrac = Math.min(calval / maxcal, 1);

    const w = 2 * rin;
    const base_y = bowlY + rin;
    const wave_y = base_y - w * fillFrac;
    const waveAmp = rin * 0.03;
    const points = d3
      .range(0, w + 1, w / 40)
      .map((x) => [
        bowlX - rin + x,
        wave_y + Math.sin((x / w) * 2 * Math.PI) * waveAmp,
      ]);

    const wavecurve = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => d[0])
      .y((d) => d[1]);

    const wavesin =
      wavecurve(points) +
      ` L ${bowlX + rin},${base_y}` +
      ` L ${bowlX - rin},${base_y} Z`;

    const water = svg.append("g").attr("clip-path", "url(#bowlClip)");

    const wave = water
      .append("path")
      .attr("class", "bowl-wave")
      .attr("d", wavesin)
      .attr("fill", "url(#waveGradient)")
      .attr("opacity", 0.7);

    if (!update1) {
      wave
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .attrTween("d", () => (t) => {
          const a = waveAmp * Math.sin(2 * Math.PI * t);
          const pts = points.map(([x, y]) => [x, y + a]);
          return (
            wavecurve(pts) +
            ` L ${bowlX + rin},${base_y}` +
            ` L ${bowlX - rin},${base_y} Z`
          );
        });
    } else {
      update1 = false;
    }

    const arc = d3
      .arc()
      .innerRadius(rin - 5)
      .outerRadius(rin)
      .startAngle(0)
      .endAngle(Math.PI);

    svg
      .append("path")
      .attr("d", arc())
      .attr("transform", `translate(${bowlX},${bowlY}) rotate(90)`)
      .attr("stroke", "#333")
      .attr("fill", "#000")
      .attr("stroke-width", 2);

    svg
      .append("text")
      .attr("class", "bowl-text")
      .attr("x", center.x)
      .attr("y", center.y + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text(`${Math.round(calval)} kcal`);

    const nut_labels = order
      .map((name) => dataset.find((d) => d.nutrient === name))
      .filter(Boolean);

    const nut_max = {};
    nut_labels.forEach((d) => {
      nut_max[d.nutrient] =
        d3.max(
          Object.keys(d)
            .filter((k) => /^[MF]_/.test(k))
            .map((k) => +d[k] || 0)
        ) || 1;
    });

    const spikesData = order.map((nutrient, i) => {
      const dObj = dataset.find((d) => d.nutrient === nutrient) || {};
      const curr = +(dObj[bucket] ?? 0);
      const maxFor = nut_max[nutrient] || 1;
      const actual = (curr / maxFor) * max_line_len;
      const len = curr === 0 ? 20 : actual;
      const isLeft = i < 3;
      const dir = isLeft ? -1 : 1;

      const x0 = center.x + rin * customX0Multipliers[i];
      const y0 = center.y + rin * customY0Multipliers[i];

      return {
        nutrientName: nutrient,
        x0,
        y0,
        dir,
        len,
        color: color[i],
        curr,
      };
    });

    const lines = svg
      .selectAll("line.spike")
      .data(spikesData, (d) => d.nutrientName);

    lines.exit().remove();

    const linesEnter = lines
      .enter()
      .append("line")
      .attr("class", "spike")
      .attr("x1", (d) => d.x0)
      .attr("y1", (d) => d.y0)
      .attr("x2", (d) => d.x0)
      .attr("y2", (d) => d.y0)
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 5);

    linesEnter
      .merge(lines)
      .transition()
      .duration(800)
      .ease(d3.easeSinInOut)
      .attr("x2", (d) => d.x0 + d.dir * d.len);

    const circles = svg
      .selectAll("circle.spike")
      .data(spikesData, (d) => d.nutrientName);

    circles.exit().remove();

    const circlesEnter = circles
      .enter()
      .append("circle")
      .attr("class", "spike")
      .attr("cx", (d) => d.x0)
      .attr("cy", (d) => d.y0)
      .attr("r", 6)
      .attr("fill", (d) => d.color)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 25 + "px")
          .html(
            `<strong>${d.nutrientName}</strong>: ${
              d.curr === 0 ? "<10 g" : `${d.curr}g`
            }`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    circlesEnter
      .merge(circles)
      .transition()
      .duration(800)
      .ease(d3.easeSinInOut)
      .attr("cx", (d) => d.x0 + d.dir * d.len);

    const texts = svg
      .selectAll("text.nutrient-text")
      .data(spikesData, (d) => d.nutrientName);

    texts.exit().remove();

    const textsEnter = texts
      .enter()
      .append("text")
      .attr("class", "nutrient-text")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0 + 4)
      .attr("text-anchor", (d) => (d.dir < 0 ? "end" : "start"))
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text((d) => {
        const name = d && d.nutrientName ? d.nutrientName : "";
        const val =
          d && typeof d.curr === "number"
            ? d.curr === 0
              ? "<10g"
              : `${d.curr}g`
            : "";
        return `${name}: ${val}`;
      });

    textsEnter
      .merge(texts)
      .transition()
      .duration(800)
      .ease(d3.easeSinInOut)
      .attr("x", (d) => d.x0 + d.dir * d.len + d.dir * 10);
  }
}
