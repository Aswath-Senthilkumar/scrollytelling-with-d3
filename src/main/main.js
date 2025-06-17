// Initialize Scrollama
document.addEventListener("DOMContentLoaded", function () {
  const animationTriggered = {
    chart1: false,
    chart2: false,
    chart3: false,
    chart4: false,
    chart5: false,
    chart6: false,
    viz7: false,
    chart8: false,
    chart9: false,
    chart10: false,
  };

  const scroller1 = scrollama();
  const scroller2 = scrollama();
  const scroller3 = scrollama();
  const scroller4 = scrollama();
  const scroller5 = scrollama();
  const scroller6 = scrollama();
  const scroller7 = scrollama();
  const scroller8 = scrollama();
  const scroller9 = scrollama();
  const scroller10 = scrollama();

  function handleStepProgress1(response) {
    const { element, index, progress } = response;
    updateChart1Progress(index, progress);
  }

  function handleStepEnter1(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section1 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit1(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress2(response) {
    const { element, index, progress } = response;
    updateChart2Progress(index, progress);
  }

  function handleStepEnter2(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section2 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit2(response) {
    const { element, direction, index } = response;

    element.classList.remove("is-active");
  }

  function handleStepProgress3(response) {
    const { element, index, progress } = response;
    updateChart3Progress(index, progress);
  }

  function handleStepEnter3(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section3 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit3(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress4(response) {
    const { element, index, progress } = response;
    updateChart4Progress(index, progress);
  }

  function handleStepEnter4(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section4 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit4(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress5(response) {
    const { element, index, progress } = response;
    updateChart5Progress(index, progress);
  }

  function handleStepEnter5(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section5 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit5(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress6(response) {
    const { element, index, progress } = response;
    updateChart6Progress(index, progress);
  }

  function handleStepEnter6(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section6 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit6(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress7(response) {
    const { element, index, progress } = response;
    updateViz7Progress(index, progress);
  }

  function handleStepEnter7(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section7 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit7(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress8(response) {
    const { element, index, progress } = response;
    updateChart8Progress(index, progress);
  }

  function handleStepEnter8(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section8 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit8(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress9(response) {
    const { element, index, progress } = response;
    updateChart9Progress(index, progress);
  }

  function handleStepEnter9(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section9 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit9(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function handleStepProgress10(response) {
    const { element, index, progress } = response;
    updateChart10Progress(index, progress);
  }

  function handleStepEnter10(response) {
    const { element, direction, index } = response;
    element.classList.add("is-active");
    const titleEl = document.querySelector("#scrolly-section10 h2");
    if (titleEl) {
      titleEl.style.opacity = "1";
      titleEl.style.visibility = "visible";
    }
  }

  function handleStepExit10(response) {
    const { element, direction, index } = response;
    element.classList.remove("is-active");
  }

  function init() {
    scroller1
      .setup({
        step: "#scrolly-1 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter1)
      .onStepExit(handleStepExit1)
      .onStepProgress(handleStepProgress1);

    scroller2
      .setup({
        step: "#scrolly-2 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter2)
      .onStepExit(handleStepExit2)
      .onStepProgress(handleStepProgress2);

    scroller3
      .setup({
        step: "#scrolly-3 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter3)
      .onStepExit(handleStepExit3)
      .onStepProgress(handleStepProgress3);

    scroller4
      .setup({
        step: "#scrolly-4 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter4)
      .onStepExit(handleStepExit4)
      .onStepProgress(handleStepProgress4);

    scroller5
      .setup({
        step: "#scrolly .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter5)
      .onStepExit(handleStepExit5)
      .onStepProgress(handleStepProgress5);

    scroller6
      .setup({
        step: "#scrolly-6 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter6)
      .onStepExit(handleStepExit6)
      .onStepProgress(handleStepProgress6);

    scroller7
      .setup({
        step: "#scrolly2 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter7)
      .onStepExit(handleStepExit7)
      .onStepProgress(handleStepProgress7);

    scroller8
      .setup({
        step: "#scrolly-8 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter8)
      .onStepExit(handleStepExit8)
      .onStepProgress(handleStepProgress8);

    scroller9
      .setup({
        step: "#scrolly-9 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter9)
      .onStepExit(handleStepExit9)
      .onStepProgress(handleStepProgress9);

    scroller10
      .setup({
        step: "#scrolly-10 .step",
        offset: 0.5,
        progress: true,
        debug: false,
      })
      .onStepEnter(handleStepEnter10)
      .onStepExit(handleStepExit10)
      .onStepProgress(handleStepProgress10);

    window.addEventListener("resize", function () {
      scroller1.resize();
      scroller2.resize();
      scroller3.resize();
      scroller4.resize();
      scroller5.resize();
      scroller6.resize();
      scroller7.resize();
      scroller8.resize();
      scroller9.resize();
      scroller10.resize();
    });
  }

  function updateChart1Progress(index, progress) {
    if (window.updateChart1) {
      window.updateChart1(progress, index);
    }
  }

  function updateChart2Progress(index, progress) {
    if (window.updateChart2) {
      window.updateChart2(progress, index);
    }
  }

  function updateChart3Progress(index, progress) {
    if (window.updateChart3) {
      window.updateChart3(progress, index);
    }
  }

  function updateChart4Progress(index, progress) {
    if (window.updateChart4) {
      window.updateChart4(progress, index);
    }
  }

  function updateChart5Progress(index, progress) {
    if (window.updateChart5) {
      window.updateChart5(progress, index);
    }
  }

  function updateChart6Progress(index, progress) {
    if (window.updateChart6) {
      window.updateChart6(progress, index);
    }
  }

  function updateViz7Progress(index, progress) {
    if (window.updateViz7) {
      window.updateViz7(progress);
    }
  }

  function updateChart8Progress(index, progress) {
    if (window.updateChart8) {
      window.updateChart8(progress, index);
    }
  }

  function updateChart9Progress(index, progress) {
    if (window.updateChart9) {
      window.updateChart9(progress, index);
    }
  }

  function updateChart10Progress(index, progress) {
    if (window.updateChart10) {
      window.updateChart10(progress, index);
    }
  }

  init();
});
