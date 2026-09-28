// Stamp & signature "document elements", shared by the Letter editor and the
// Invoice print preview.
//
// Every element is stored in millimetres relative to the `.page` box it sits
// on (pageIndex = which `.page` in the document), and the exact same markup
// and CSS are used for the on-screen preview and for the printed document.
// Because the preview page and the printed page have the same width in mm,
// an element placed on screen prints in the same spot, at the same size.
//
// Element shape:
//   { id, type: "stamp" | "signature", src (data URI), aspect (height/width),
//     pageIndex, width, left, anchor: "top" | "bottom", top | bottom }
// anchor "bottom" keeps the element a fixed distance from the bottom of the
// page (used by the bottom-center default); dragging one switches it to
// "top".

export const PX_PER_MM = 96 / 25.4;
export const MIN_ELEMENT_WIDTH_MM = 8;
export const ELEMENT_LABELS = { stamp: "Stamp", signature: "Signature" };

const round1 = (n) => Math.round(n * 10) / 10;
const clamp = (n, min, max) => Math.min(Math.max(n, min), Math.max(min, max));

const escapeAttr = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

// Shared by the preview and the print document. The editing chrome
// (outline, remove button, resize handle) only exists in the editable
// preview markup and is hidden for print anyway.
export const DOCUMENT_ELEMENT_STYLES = `
  .doc-layer{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:5;}
  .doc-el{position:absolute;pointer-events:auto;}
  .doc-el img{display:block;width:100%;height:auto;pointer-events:none;-webkit-user-select:none;user-select:none;}
  .doc-editing .doc-el{cursor:move;}
  .doc-editing .doc-el:hover{outline:1px dashed rgba(26,115,232,.8);outline-offset:2px;}
  .doc-el.is-selected{outline:2px solid #1a73e8 !important;outline-offset:2px;}
  .doc-el-remove,.doc-el-handle{display:none;position:absolute;}
  .doc-el.is-selected .doc-el-remove,.doc-el.is-selected .doc-el-handle{display:block;}
  .doc-el-remove{top:-12px;right:-12px;width:20px;height:20px;border-radius:50%;background:#dc3545;color:#fff;font:700 14px/20px Arial,sans-serif;text-align:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.3);}
  .doc-el-handle{right:-7px;bottom:-7px;width:13px;height:13px;background:#1a73e8;border:2px solid #fff;border-radius:3px;cursor:nwse-resize;box-shadow:0 1px 3px rgba(0,0,0,.3);}
  .doc-placing,.doc-placing *{cursor:crosshair !important;}
  .doc-placing .page{outline:2px dashed rgba(26,115,232,.55);outline-offset:-2px;}
  @media print{
    .doc-el{outline:none !important;}
    .doc-el-remove,.doc-el-handle{display:none !important;}
    .doc-placing .page{outline:none !important;}
  }
`;

const positionStyle = (el) => {
  const vertical =
    el.anchor === "bottom" ? `bottom:${el.bottom}mm;` : `top:${el.top}mm;`;
  return `left:${el.left}mm;${vertical}width:${el.width}mm;`;
};

export const buildElementHtml = (el, { editable = false, selected = false } = {}) =>
  `<div class="doc-el doc-el-${el.type}${selected ? " is-selected" : ""}" data-el-id="${escapeAttr(el.id)}" style="${positionStyle(el)}">` +
  `<img src="${escapeAttr(el.src)}" alt="${ELEMENT_LABELS[el.type] || ""}" draggable="false"/>` +
  (editable
    ? `<span class="doc-el-remove" data-el-action="remove" title="Remove">&times;</span>` +
      `<span class="doc-el-handle" data-el-action="resize" title="Drag to resize"></span>`
    : "") +
  `</div>`;

// The elements that belong on one page, wrapped in a layer covering that
// page. Returns "" when the page has none.
export const buildElementsLayerHtml = (
  elements,
  pageIndex,
  { editable = false, selectedId = null } = {},
) => {
  const onPage = (elements || []).filter(
    (el) => (el.pageIndex ?? 0) === pageIndex,
  );
  if (onPage.length === 0) return "";

  return `<div class="doc-layer"${editable ? ' data-live="true"' : ""}>${onPage
    .map((el) =>
      buildElementHtml(el, { editable, selected: el.id === selectedId }),
    )
    .join("")}</div>`;
};

// height / width of an image, so a new element's height is known before it
// is rendered (the printed element keeps the same ratio: width in mm,
// height auto).
export const loadImageAspect = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(1);
    const img = new Image();
    img.onload = () =>
      resolve(img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1);
    img.onerror = () => resolve(1);
    img.src = src;
  });

// Inline a remote image (e.g. the Cloudinary stamp) as a data URI, so the
// document is self-contained: it prints without waiting on the network and
// keeps working even if the organization image is later replaced/deleted.
export const imageUrlToDataUri = async (url) => {
  if (!url) return null;
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("Could not load image");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const newId = (type) =>
  `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// Bottom-center default: horizontally centered, a fixed distance above the
// bottom of the page.
export const createBottomCenterElement = ({
  type,
  src,
  aspect,
  width,
  pageWidthMm,
  bottomMm,
  pageIndex = 0,
}) => ({
  id: newId(type),
  type,
  src,
  aspect,
  pageIndex,
  width,
  left: round1((pageWidthMm - width) / 2),
  anchor: "bottom",
  bottom: round1(bottomMm),
});

// Clicked position: the element is centered on the click, kept inside the
// page.
export const createElementAtPoint = ({
  type,
  src,
  aspect,
  width,
  pageWidthMm,
  pageIndex,
  xMm,
  yMm,
  pageHeightMm,
}) => {
  const height = width * aspect;
  return {
    id: newId(type),
    type,
    src,
    aspect,
    pageIndex,
    width,
    left: round1(clamp(xMm - width / 2, 0, pageWidthMm - width)),
    anchor: "top",
    top: round1(
      clamp(yMm - height / 2, 0, (pageHeightMm || Infinity) - height),
    ),
  };
};

/*
 * Interactive editing of elements inside a preview iframe's document:
 * placement clicks, select, drag to move, drag the corner handle to resize,
 * × / Delete to remove, arrow keys to nudge (1mm, Shift = 5mm).
 * State stays in React — `getState` reads it, the callbacks report changes,
 * and `render()` redraws the layers from state. Nothing here reloads the
 * iframe, so the document being edited (and its scroll position) stays put.
 *
 * options: {
 *   pageWidthMm,
 *   getState: () => ({ elements, selectedId, placement }),
 *   onChange(elements), onSelect(id | null),
 *   onPlace({ pageIndex, xMm, yMm, pageHeightMm }), onCancelPlacement(),
 * }
 */
export const attachDocumentElementEditor = (doc, options) => {
  const { pageWidthMm } = options;
  const pages = () => Array.from(doc.querySelectorAll(".page"));
  let drag = null;
  let pendingRender = false;

  const render = () => {
    if (drag) {
      pendingRender = true;
      return;
    }
    const { elements, selectedId, placement } = options.getState();
    doc.querySelectorAll('.doc-layer[data-live="true"]').forEach((n) =>
      n.remove(),
    );
    pages().forEach((page, index) => {
      const html = buildElementsLayerHtml(elements, index, {
        editable: true,
        selectedId,
      });
      if (!html) return;
      page.insertAdjacentHTML("beforeend", html);
    });
    doc.body?.classList.add("doc-editing");
    doc.body?.classList.toggle("doc-placing", Boolean(placement));
  };

  const findNode = (id) =>
    Array.from(doc.querySelectorAll(".doc-el[data-el-id]")).find(
      (n) => n.dataset.elId === id,
    );

  // Leaves any text editing and gives this document keyboard focus, so
  // Delete / arrow keys reach the selected element (the mousedown that
  // selects it is cancelled, which would otherwise keep focus elsewhere).
  const blurEditable = () => {
    const active = doc.activeElement;
    if (active && active !== doc.body && active.blur) active.blur();
    doc.defaultView?.focus();
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    const { elements, selectedId, placement } = options.getState();
    const target = e.target instanceof doc.defaultView.Element ? e.target : e.target?.parentElement;

    if (placement) {
      const page = target?.closest(".page");
      if (!page) return;
      e.preventDefault();
      e.stopPropagation();
      blurEditable();
      const rect = page.getBoundingClientRect();
      options.onPlace({
        pageIndex: pages().indexOf(page),
        xMm: (e.clientX - rect.left) / PX_PER_MM,
        yMm: (e.clientY - rect.top) / PX_PER_MM,
        pageHeightMm: rect.height / PX_PER_MM,
      });
      return;
    }

    const node = target?.closest(".doc-el");
    if (!node) {
      if (selectedId) options.onSelect(null);
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    blurEditable();

    const id = node.dataset.elId;
    const el = elements.find((x) => x.id === id);
    if (!el) return;

    const action = target.dataset?.elAction;
    if (action === "remove") {
      options.onChange(elements.filter((x) => x.id !== id));
      options.onSelect(null);
      return;
    }

    doc
      .querySelectorAll(".doc-el.is-selected")
      .forEach((n) => n !== node && n.classList.remove("is-selected"));
    node.classList.add("is-selected");

    const page = node.closest(".page");
    const pageRect = page.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    drag = {
      id,
      mode: action === "resize" ? "resize" : "move",
      startX: e.clientX,
      startY: e.clientY,
      left: el.left,
      top: (nodeRect.top - pageRect.top) / PX_PER_MM,
      width: el.width,
      height: nodeRect.height / PX_PER_MM,
      pageHeightMm: pageRect.height / PX_PER_MM,
      moved: false,
      next: null,
    };
    if (id !== selectedId) options.onSelect(id);
  };

  const onMouseMove = (e) => {
    if (!drag) return;
    const node = findNode(drag.id);
    if (!node) return;
    e.preventDefault();

    const dx = (e.clientX - drag.startX) / PX_PER_MM;
    const dy = (e.clientY - drag.startY) / PX_PER_MM;
    if (Math.abs(dx) + Math.abs(dy) > 0.2) drag.moved = true;

    if (drag.mode === "move") {
      const left = round1(clamp(drag.left + dx, 0, pageWidthMm - drag.width));
      const top = round1(
        clamp(drag.top + dy, 0, drag.pageHeightMm - drag.height),
      );
      node.style.left = `${left}mm`;
      node.style.top = `${top}mm`;
      node.style.bottom = "auto";
      drag.next = { left, top, anchor: "top", bottom: undefined };
    } else {
      const width = round1(
        clamp(drag.width + dx, MIN_ELEMENT_WIDTH_MM, pageWidthMm - drag.left),
      );
      node.style.width = `${width}mm`;
      drag.next = { width };
    }
  };

  const onMouseUp = () => {
    if (!drag) return;
    const finished = drag;
    drag = null;

    if (finished.moved && finished.next) {
      const { elements } = options.getState();
      options.onChange(
        elements.map((el) =>
          el.id === finished.id ? { ...el, ...finished.next } : el,
        ),
      );
    }
    if (pendingRender) {
      pendingRender = false;
      render();
    }
  };

  const onKeyDown = (e) => {
    const { elements, selectedId, placement } = options.getState();

    if (e.key === "Escape") {
      if (placement) options.onCancelPlacement?.();
      else if (selectedId) options.onSelect(null);
      return;
    }
    if (!selectedId) return;

    // Keys typed into the letter text are never treated as element edits.
    const active = doc.activeElement;
    if (active && active !== doc.body && active.isContentEditable) return;

    const el = elements.find((x) => x.id === selectedId);
    if (!el) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      options.onChange(elements.filter((x) => x.id !== selectedId));
      options.onSelect(null);
      return;
    }

    const step = e.shiftKey ? 5 : 1;
    const moves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (!moves[e.key]) return;
    e.preventDefault();

    const [dx, dy] = moves[e.key];
    const next = {
      left: round1(clamp(el.left + dx, 0, pageWidthMm - el.width)),
    };
    if (el.anchor === "bottom") next.bottom = round1(Math.max(0, el.bottom - dy));
    else next.top = round1(Math.max(0, el.top + dy));

    options.onChange(
      elements.map((x) => (x.id === selectedId ? { ...x, ...next } : x)),
    );
  };

  doc.addEventListener("mousedown", onMouseDown, true);
  doc.addEventListener("mousemove", onMouseMove);
  doc.addEventListener("mouseup", onMouseUp);
  doc.addEventListener("keydown", onKeyDown);
  doc.defaultView?.addEventListener("blur", onMouseUp);

  render();

  return {
    render,
    destroy: () => {
      doc.removeEventListener("mousedown", onMouseDown, true);
      doc.removeEventListener("mousemove", onMouseMove);
      doc.removeEventListener("mouseup", onMouseUp);
      doc.removeEventListener("keydown", onKeyDown);
      doc.defaultView?.removeEventListener("blur", onMouseUp);
    },
  };
};
