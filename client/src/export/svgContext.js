const FONT_SIZE_PATTERN = /(\d+(?:\.\d+)?)px/;

function round(value) {
  return Math.round(value * 100) / 100;
}

function escapeText(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Looks like a canvas drawing context, but writes SVG instead of pixels.
// That lets the exact same render code produce both the on-screen picture and the SVG file.
export function createSvgContext(fontFamily) {
  const output = [];
  const definitions = [];
  const stateStack = [];
  let pathData = "";
  let clipCount = 0;

  const context = {
    strokeStyle: "#000000",
    fillStyle: "#000000",
    lineWidth: 1,
    lineCap: "butt",
    lineJoin: "miter",
    globalAlpha: 1,
    font: "",
    textBaseline: "alphabetic",
    clipId: null,
  };

  function getCommonAttributes() {
    const opacity = context.globalAlpha < 1 ? ` opacity="${round(context.globalAlpha)}"` : "";
    const clip = context.clipId ? ` clip-path="url(#${context.clipId})"` : "";
    return `${opacity}${clip}`;
  }

  return Object.assign(context, {
    save() {
      stateStack.push({ ...context });
    },

    restore() {
      Object.assign(context, stateStack.pop());
    },

    beginPath() {
      pathData = "";
    },

    moveTo(x, y) {
      pathData += `M${round(x)} ${round(y)}`;
    },

    lineTo(x, y) {
      pathData += `L${round(x)} ${round(y)}`;
    },

    quadraticCurveTo(controlX, controlY, x, y) {
      pathData += `Q${round(controlX)} ${round(controlY)} ${round(x)} ${round(y)}`;
    },

    closePath() {
      pathData += "Z";
    },

    roundRect(x, y, width, height, radius) {
      const right = x + width;
      const bottom = y + height;
      const arc = `A${round(radius)} ${round(radius)} 0 0 1`;

      pathData +=
        `M${round(x + radius)} ${round(y)}H${round(right - radius)}${arc} ${round(right)} ${round(y + radius)}` +
        `V${round(bottom - radius)}${arc} ${round(right - radius)} ${round(bottom)}` +
        `H${round(x + radius)}${arc} ${round(x)} ${round(bottom - radius)}` +
        `V${round(y + radius)}${arc} ${round(x + radius)} ${round(y)}Z`;
    },

    ellipse(centerX, centerY, radiusX, radiusY) {
      const left = round(centerX - radiusX);
      const right = round(centerX + radiusX);
      const arc = `A${round(radiusX)} ${round(radiusY)} 0 1 0`;

      pathData += `M${left} ${round(centerY)}${arc} ${right} ${round(centerY)}${arc} ${left} ${round(centerY)}Z`;
    },

    clip() {
      clipCount += 1;
      context.clipId = `clip-${clipCount}`;
      definitions.push(`<clipPath id="${context.clipId}"><path d="${pathData}"/></clipPath>`);
    },

    stroke() {
      output.push(
        `<path d="${pathData}" fill="none" stroke="${context.strokeStyle}" ` +
          `stroke-width="${round(context.lineWidth)}" stroke-linecap="${context.lineCap}" ` +
          `stroke-linejoin="${context.lineJoin}"${getCommonAttributes()}/>`
      );
    },

    fill() {
      output.push(`<path d="${pathData}" fill="${context.fillStyle}"${getCommonAttributes()}/>`);
    },

    fillRect(x, y, width, height) {
      output.push(
        `<rect x="${round(x)}" y="${round(y)}" width="${round(width)}" height="${round(height)}" ` +
          `fill="${context.fillStyle}"${getCommonAttributes()}/>`
      );
    },

    fillText(text, x, y) {
      const fontSize = FONT_SIZE_PATTERN.exec(context.font)?.[1] ?? "20";
      output.push(
        `<text x="${round(x)}" y="${round(y)}" font-size="${fontSize}" font-family='${fontFamily}' ` +
          `fill="${context.fillStyle}" dominant-baseline="hanging" xml:space="preserve"` +
          `${getCommonAttributes()}>${escapeText(text)}</text>`
      );
    },

    toMarkup() {
      return `<defs>${definitions.join("")}</defs>${output.join("")}`;
    },
  });
}
