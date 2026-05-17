(function() {
"use strict";

if (!window.Stimulus || !window.Stimulus.Application) {
  console.error("[rails-realtime-erd] Stimulus is not loaded — aborting controller registration.");
  return;
}
var Application = window.Stimulus.Application;
var Controller = window.Stimulus.Controller;

var application = Application.start();
application.warnings = true;
application.debug = false;
window.RailsRealtimeErdStimulus = application;

/* ========================== filter_controller ========================== */
class FilterController extends Controller {
  static targets = [
    "search", "modelList", "modelRow", "modelCheckbox",
    "previewRelations", "showRelationComment", "showKey", "showComment", "hideColumns", "showOnlyKeys",
    "showKeyLabel", "showCommentLabel", "showOnlyKeysLabel"
  ];

  connect() {
    this.state = {
      selectModels: [],
      isPreviewRelations: false,
      isShowRelationComment: false,
      isShowKey: false,
      isShowComment: false,
      isHideColumns: false,
      isShowOnlyKeys: false,
      filterText: ""
    };
    this.syncDom();
    this.applyHideColumnsDisabling();
    this.broadcast();
  }

  allModelNames() {
    return this.modelRowTargets.map(row => row.dataset.modelName);
  }

  applyFromState(newState) {
    this.state = { ...this.state, ...newState };
    this.syncDom();
    this.applyHideColumnsDisabling();
    this.broadcast();
  }

  syncDom() {
    this.modelCheckboxTargets.forEach(cb => {
      cb.checked = this.state.selectModels.includes(cb.value);
    });
    if (this.hasPreviewRelationsTarget) this.previewRelationsTarget.checked = !!this.state.isPreviewRelations;
    if (this.hasShowRelationCommentTarget) this.showRelationCommentTarget.checked = !!this.state.isShowRelationComment;
    if (this.hasShowKeyTarget) this.showKeyTarget.checked = !!this.state.isShowKey;
    if (this.hasShowCommentTarget) this.showCommentTarget.checked = !!this.state.isShowComment;
    if (this.hasHideColumnsTarget) this.hideColumnsTarget.checked = !!this.state.isHideColumns;
    if (this.hasShowOnlyKeysTarget) this.showOnlyKeysTarget.checked = !!this.state.isShowOnlyKeys;
    if (this.hasSearchTarget) this.searchTarget.value = this.state.filterText;
    this.applySearchFilter();
  }

  applySearchFilter() {
    const q = (this.state.filterText || "").toLowerCase();
    this.modelRowTargets.forEach(row => {
      const name = (row.dataset.modelName || "").toLowerCase();
      const table = (row.dataset.tableName || "").toLowerCase();
      const visible = !q || name.includes(q) || table.includes(q);
      if (visible) {
        row.removeAttribute("data-rre-hidden");
      } else {
        row.setAttribute("data-rre-hidden", "");
      }
    });
  }

  applyHideColumnsDisabling() {
    const disabled = !!this.state.isHideColumns;
    const inputs = [
      this.hasShowKeyTarget && this.showKeyTarget,
      this.hasShowCommentTarget && this.showCommentTarget,
      this.hasShowOnlyKeysTarget && this.showOnlyKeysTarget
    ].filter(Boolean);
    inputs.forEach(input => { input.disabled = disabled; });
    const labels = [
      this.hasShowKeyLabelTarget && this.showKeyLabelTarget,
      this.hasShowCommentLabelTarget && this.showCommentLabelTarget,
      this.hasShowOnlyKeysLabelTarget && this.showOnlyKeysLabelTarget
    ].filter(Boolean);
    labels.forEach(label => {
      if (disabled) {
        label.classList.add("cursor-not-allowed", "opacity-60");
        label.classList.remove("cursor-pointer");
      } else {
        label.classList.remove("cursor-not-allowed", "opacity-60");
        label.classList.add("cursor-pointer");
      }
    });
  }

  onModelToggle(event) {
    const value = event.target.value;
    if (event.target.checked) {
      if (!this.state.selectModels.includes(value)) {
        this.state.selectModels = [...this.state.selectModels, value];
      }
    } else {
      this.state.selectModels = this.state.selectModels.filter(m => m !== value);
    }
    this.broadcast();
  }

  onOptionChange() {
    this.state = {
      ...this.state,
      isPreviewRelations: this.hasPreviewRelationsTarget && this.previewRelationsTarget.checked,
      isShowRelationComment: this.hasShowRelationCommentTarget && this.showRelationCommentTarget.checked,
      isShowKey: this.hasShowKeyTarget && this.showKeyTarget.checked,
      isShowComment: this.hasShowCommentTarget && this.showCommentTarget.checked,
      isHideColumns: this.hasHideColumnsTarget && this.hideColumnsTarget.checked,
      isShowOnlyKeys: this.hasShowOnlyKeysTarget && this.showOnlyKeysTarget.checked
    };
    this.applyHideColumnsDisabling();
    this.broadcast();
  }

  onSearchChange(event) {
    this.state.filterText = event.target.value || "";
    this.applySearchFilter();
  }

  selectAll() {
    const visible = this.modelRowTargets.filter(row => !row.hasAttribute("data-rre-hidden"));
    visible.forEach(row => {
      const name = row.dataset.modelName;
      if (!this.state.selectModels.includes(name)) {
        this.state.selectModels = [...this.state.selectModels, name];
      }
    });
    this.syncDom();
    this.broadcast();
  }

  unselectAll() {
    const visible = this.modelRowTargets.filter(row => !row.hasAttribute("data-rre-hidden"));
    const toRemove = new Set(visible.map(r => r.dataset.modelName));
    this.state.selectModels = this.state.selectModels.filter(m => !toRemove.has(m));
    this.syncDom();
    this.broadcast();
  }

  reset() {
    this.state = {
      selectModels: [],
      isPreviewRelations: false,
      isShowRelationComment: false,
      isShowKey: false,
      isShowComment: false,
      isHideColumns: false,
      isShowOnlyKeys: false,
      filterText: ""
    };
    this.syncDom();
    this.applyHideColumnsDisabling();
    this.broadcast();
  }

  broadcast() {
    this.dispatch("changed", { detail: { ...this.state }, bubbles: true });
  }
}

/* ========================== diagram_controller ========================== */
class DiagramController extends Controller {
  static targets = ["preview", "codeOutput"];

  connect() {
    const dataNode = document.getElementById("rre-schema-data");
    let schema = { Models: [], Relations: [] };
    if (dataNode) {
      try { schema = JSON.parse(dataNode.textContent); } catch (_) {}
    }
    this.schema = {
      Models: (schema.Models || []).slice().sort((a, b) => a.ModelName < b.ModelName ? -1 : 1),
      Relations: schema.Relations || []
    };
    this.lastState = null;
    this.mermaidReady = this.initMermaid();
    this.boundFilterChanged = (e) => this.onFilterChanged(e.detail);
    document.addEventListener("filter:changed", this.boundFilterChanged);
  }

  disconnect() {
    document.removeEventListener("filter:changed", this.boundFilterChanged);
  }

  async initMermaid() {
    if (typeof window.mermaid === "undefined") return;
    window.mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      maxTextSize: 99999999
    });
  }

  onFilterChanged(state) {
    this.lastState = state;
    this.render();
  }

  computeCode(state) {
    const lines = [];
    lines.push("erDiagram");
    lines.push("    %% --------------------------------------------------------");
    lines.push("    %% Generated by \"Rails Realtime ERD\"");
    lines.push(`    %% Restore Hash: ${location.hash || ""}`);
    lines.push("    %% --------------------------------------------------------");
    lines.push("");

    const data = this.filteredData(state);

    data.Models.forEach(model => {
      lines.push(`    %% table name: ${model.TableName}`);
      lines.push(`    %% table comment: ${model.TableComment}`);
      lines.push(`    ${model.ModelName.replace(/:/g, "-")} {`);

      if (!state.isHideColumns) {
        model.Columns.forEach(column => {
          if (state.isShowOnlyKeys && !column.key) return;
          const key = state.isShowKey ? (column.key || "") : "";
          const comment = state.isShowComment ? `"${column.comment || ""}"` : "";
          lines.push(`        ${column.type} ${column.name} ${key} ${comment}`);
        });
      }
      lines.push("    }");
      lines.push("");
    });

    data.Relations.forEach(relation => {
      const comment = state.isShowRelationComment ? `"${relation.Comment}"` : `""`;
      lines.push(`    ${relation.LeftModelName.replace(/:/g, "-")} ${relation.LeftValue}${relation.Line}${relation.RightValue} ${relation.RightModelName.replace(/:/g, "-")} : ${comment}`);
    });

    return lines.join("\n");
  }

  filteredData(state) {
    const selected = new Set(state.selectModels || []);
    let relations;
    if (state.isPreviewRelations) {
      relations = this.schema.Relations.filter(r => selected.has(r.LeftModelName) || selected.has(r.RightModelName));
    } else {
      relations = this.schema.Relations.filter(r => selected.has(r.LeftModelName) && selected.has(r.RightModelName));
    }
    return {
      Models: this.schema.Models.filter(m => selected.has(m.ModelName)),
      Relations: relations
    };
  }

  currentCode() {
    if (!this.lastState) return "";
    return this.computeCode(this.lastState);
  }

  currentSvg() {
    if (!this.hasPreviewTarget) return "";
    const svg = this.previewTarget.querySelector("svg");
    return svg ? new XMLSerializer().serializeToString(svg) : "";
  }

  async render() {
    if (!this.lastState) return;
    const code = this.computeCode(this.lastState);
    if (this.hasCodeOutputTarget) this.codeOutputTarget.value = code;

    await this.mermaidReady;
    if (typeof window.mermaid === "undefined" || !this.hasPreviewTarget) return;
    try {
      const renderId = `mermaid-erd-${Date.now()}`;
      const result = await window.mermaid.render(renderId, code);
      const svg = (result && result.svg) ? result.svg : result;
      this.previewTarget.innerHTML = svg;
    } catch (err) {
      console.error("[rails-realtime-erd] mermaid render failed", err);
      this.previewTarget.innerHTML = `<pre class="text-red-300 p-4 text-xs">${(err && err.message) || err}</pre>`;
    }
  }
}

/* ========================== hash_state_controller ========================== */
class HashStateController extends Controller {
  static outlets = ["filter"];

  connect() {
    this.boundHashChange = () => this.restore();
    window.addEventListener("hashchange", this.boundHashChange);
    document.addEventListener("filter:changed", this.boundFilterChanged = (e) => this.writeHash(e.detail));
    this.tryRestoreOnce();
  }

  disconnect() {
    window.removeEventListener("hashchange", this.boundHashChange);
    document.removeEventListener("filter:changed", this.boundFilterChanged);
  }

  filterOutletConnected(outlet) {
    this.tryRestoreOnce(outlet);
  }

  tryRestoreOnce(outlet) {
    const target = outlet || (this.hasFilterOutlet ? this.filterOutlet : null);
    if (!target || this.restored) return;
    this.restored = true;
    this.restore(target);
  }

  restore(outlet) {
    const target = outlet || (this.hasFilterOutlet ? this.filterOutlet : null);
    if (!target) return;
    if (!location.hash || location.hash.length < 2) return;
    try {
      const parsed = JSON.parse(atob(location.hash.substring(1)));
      target.applyFromState({
        selectModels: parsed.selectModels || [],
        isPreviewRelations: !!parsed.isPreviewRelations,
        isShowRelationComment: !!parsed.isShowRelationComment,
        isShowKey: !!parsed.isShowKey,
        isShowComment: !!parsed.isShowComment,
        isHideColumns: !!parsed.isHideColumns,
        isShowOnlyKeys: !!parsed.isShowOnlyKeys
      });
    } catch (_) { /* ignore */ }
  }

  writeHash(state) {
    if (!state) return;
    const payload = {
      selectModels: state.selectModels,
      isPreviewRelations: state.isPreviewRelations,
      isShowRelationComment: state.isShowRelationComment,
      isShowKey: state.isShowKey,
      isShowComment: state.isShowComment,
      isHideColumns: state.isHideColumns,
      isShowOnlyKeys: state.isShowOnlyKeys
    };
    const encoded = btoa(JSON.stringify(payload));
    history.replaceState(null, "", `#${encoded}`);
  }
}

/* ========================== clipboard_controller ========================== */
class ClipboardController extends Controller {
  static targets = ["copyUrlButton", "copyUrlLabel", "copyMermaidButton", "copyMermaidLabel", "copyMarkdownButton", "copyMarkdownLabel"];
  static outlets = ["diagram"];

  async copyUrl() {
    await this.write(location.href);
    this.flash(this.copyUrlLabelTarget, "Copy Link for Sharing", "Copied Link for Sharing");
  }

  async copyMermaid() {
    const code = this.hasDiagramOutlet ? this.diagramOutlet.currentCode() : "";
    await this.write(code);
    this.flash(this.copyMermaidLabelTarget, "Copy Mermaid Code", "Copied Mermaid Code");
  }

  async copyMarkdown() {
    const code = this.hasDiagramOutlet ? this.diagramOutlet.currentCode() : "";
    await this.write("```mermaid\n" + code + "\n```\n");
    this.flash(this.copyMarkdownLabelTarget, "Copy Markdown Code", "Copied Markdown Code");
  }

  async write(text) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch (_) { /* ignore */ }
  }

  flash(labelEl, idleText, busyText) {
    if (!labelEl) return;
    labelEl.textContent = busyText;
    setTimeout(() => { labelEl.textContent = idleText; }, 1000);
  }
}

/* ========================== download_controller ========================== */
class DownloadController extends Controller {
  static outlets = ["diagram"];

  downloadSvg() {
    if (!this.hasDiagramOutlet) return;
    const svgString = this.diagramOutlet.currentSvg();
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, "rails_realtime_erd.svg");
    URL.revokeObjectURL(url);
  }

  downloadPng() {
    if (!this.hasDiagramOutlet) return;
    const svgEl = this.diagramOutlet.previewTarget.querySelector("svg");
    if (!svgEl) return;
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const width = svgEl.viewBox && svgEl.viewBox.baseVal && svgEl.viewBox.baseVal.width
      ? svgEl.viewBox.baseVal.width
      : (svgEl.width.baseVal ? svgEl.width.baseVal.value : svgEl.clientWidth);
    const height = svgEl.viewBox && svgEl.viewBox.baseVal && svgEl.viewBox.baseVal.height
      ? svgEl.viewBox.baseVal.height
      : (svgEl.height.baseVal ? svgEl.height.baseVal.value : svgEl.clientHeight);
    canvas.width = width || 800;
    canvas.height = height || 600;
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      this.triggerDownload(canvas.toDataURL("image/png"), "rails_realtime_erd.png");
    };
    image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgString)));
  }

  triggerDownload(href, filename) {
    const a = document.createElement("a");
    a.href = href;
    a.setAttribute("download", filename);
    a.dispatchEvent(new MouseEvent("click"));
  }
}

/* ========================== tab_controller ========================== */
class TabController extends Controller {
  static targets = ["erdButton", "codeButton", "erdPane", "codePane"];

  showErd() { this.show("erd"); }
  showCode() { this.show("code"); }

  show(which) {
    const erdActive = which === "erd";
    this.erdPaneTarget.toggleAttribute("data-rre-hidden", !erdActive);
    this.codePaneTarget.toggleAttribute("data-rre-hidden", erdActive);

    if (erdActive) {
      this.erdButtonTarget.classList.remove("bg-gray-400");
      this.erdButtonTarget.classList.add("bg-white");
      this.codeButtonTarget.classList.remove("bg-white");
      this.codeButtonTarget.classList.add("bg-gray-400");
    } else {
      this.erdButtonTarget.classList.remove("bg-white");
      this.erdButtonTarget.classList.add("bg-gray-400");
      this.codeButtonTarget.classList.remove("bg-gray-400");
      this.codeButtonTarget.classList.add("bg-white");
    }
  }
}

/* ========================== zoom_pan_controller ========================== */
class ZoomPanController extends Controller {
  static targets = ["canvas", "area"];

  connect() {
    this.scale = 1;
    this.posX = 0;
    this.posY = 0;
    this.spacePressed = false;
    this.dragging = false;
    this.lastTouchDistance = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.boundKeyDown = (e) => this.onKeyDown(e);
    this.boundKeyUp = (e) => this.onKeyUp(e);
    this.boundMouseDown = (e) => this.onMouseDown(e);
    this.boundMouseMove = (e) => this.onMouseMove(e);
    this.boundMouseUp = (e) => this.onMouseUp(e);
    this.boundWheel = (e) => this.onWheel(e);
    this.boundTouchStart = (e) => this.onTouchStart(e);
    this.boundTouchMove = (e) => this.onTouchMove(e);
    this.boundTouchEnd = (e) => this.onTouchEnd(e);

    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    window.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mousemove", this.boundMouseMove);
    window.addEventListener("mouseup", this.boundMouseUp);
    window.addEventListener("wheel", this.boundWheel, { passive: false });
    window.addEventListener("touchstart", this.boundTouchStart, { passive: false });
    window.addEventListener("touchmove", this.boundTouchMove, { passive: false });
    window.addEventListener("touchend", this.boundTouchEnd);

    this.applyTransform();
  }

  disconnect() {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    window.removeEventListener("mousedown", this.boundMouseDown);
    window.removeEventListener("mousemove", this.boundMouseMove);
    window.removeEventListener("mouseup", this.boundMouseUp);
    window.removeEventListener("wheel", this.boundWheel);
    window.removeEventListener("touchstart", this.boundTouchStart);
    window.removeEventListener("touchmove", this.boundTouchMove);
    window.removeEventListener("touchend", this.boundTouchEnd);
  }

  preview() { return document.getElementById("rre-preview"); }

  isInsidePreview(target) {
    const preview = this.preview();
    return preview && preview.contains(target);
  }

  applyTransform() {
    if (!this.hasAreaTarget) return;
    this.areaTarget.style.transform = `scale(${this.scale}) translate(${this.posX}px, ${this.posY}px)`;
  }

  onKeyDown(e) {
    if (e.code === "Space" && !this.spacePressed) {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
      this.spacePressed = true;
      this.element.setAttribute("data-zoom-pan-space-pressed", "true");
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (e.code === "Space") {
      this.spacePressed = false;
      this.dragging = false;
      this.element.removeAttribute("data-zoom-pan-space-pressed");
      this.element.removeAttribute("data-zoom-pan-dragging");
    }
  }

  onMouseDown(e) {
    if (this.spacePressed || e.button === 1) {
      this.dragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.element.setAttribute("data-zoom-pan-dragging", "true");
      e.preventDefault();
    }
  }

  onMouseMove(e) {
    if (this.dragging) {
      const dx = (e.clientX - this.lastMouseX) / this.scale;
      const dy = (e.clientY - this.lastMouseY) / this.scale;
      this.posX += dx;
      this.posY += dy;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.applyTransform();
      e.preventDefault();
    }
  }

  onMouseUp(e) {
    if (e.button === 1) e.preventDefault();
    this.dragging = false;
    this.element.removeAttribute("data-zoom-pan-dragging");
  }

  onWheel(e) {
    if (!this.isInsidePreview(e.target)) return;
    e.preventDefault();
    const preview = this.preview();
    const rect = preview.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const x = mouseX / this.scale - this.posX;
    const y = mouseY / this.scale - this.posY;
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newScale = Math.min(Math.max(this.scale + delta, 0.5), 3);
    this.posX = mouseX / newScale - x;
    this.posY = mouseY / newScale - y;
    this.scale = newScale;
    this.applyTransform();
  }

  touchDistance(touches) {
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  }
  touchCenter(touches) {
    return { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 };
  }

  onTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.lastTouchDistance = this.touchDistance(e.touches);
    }
  }
  onTouchMove(e) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const preview = this.preview();
    if (!preview || !preview.contains(e.target)) return;
    const newDistance = this.touchDistance(e.touches);
    const delta = (newDistance - this.lastTouchDistance) * 0.01;
    this.lastTouchDistance = newDistance;
    const center = this.touchCenter(e.touches);
    const rect = preview.getBoundingClientRect();
    const tx = center.x - rect.left;
    const ty = center.y - rect.top;
    const x = tx / this.scale - this.posX;
    const y = ty / this.scale - this.posY;
    const newScale = Math.min(Math.max(this.scale + delta, 0.5), 3);
    if (newScale === this.scale) return;
    this.posX = tx / newScale - x;
    this.posY = ty / newScale - y;
    this.scale = newScale;
    this.applyTransform();
  }
  onTouchEnd(e) {
    if (e.touches.length < 2) this.lastTouchDistance = 0;
  }

  zoomIn()  { this.scale = Math.min(this.scale + 0.1, 3); this.applyTransform(); }
  zoomOut() { this.scale = Math.max(this.scale - 0.1, 0.5); this.applyTransform(); }
  move(dx, dy) { const step = 10 / this.scale; this.posX += dx * step; this.posY += dy * step; this.applyTransform(); }
  moveUp()    { this.move(0, -10); }
  moveDown()  { this.move(0, 10); }
  moveLeft()  { this.move(-10, 0); }
  moveRight() { this.move(10, 0); }
}

application.register("filter", FilterController);
application.register("diagram", DiagramController);
application.register("hash-state", HashStateController);
application.register("clipboard", ClipboardController);
application.register("download", DownloadController);
application.register("tab", TabController);
application.register("zoom-pan", ZoomPanController);

})();
