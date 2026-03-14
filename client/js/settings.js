/**
 * SettingsManager — builds and manages the settings panel.
 *
 * Reads SETTINGS_SCHEMA to auto-generate controls. On change, routes each
 * setting to the right destination:
 *   target="physics" → sends {action: "update_settings", settings: {...}} over WebSocket
 *   target="render"  → calls onRenderChange(id, value) for local application
 *
 * Adding a new setting requires only a schema entry — no changes here.
 */

import { SETTINGS_SCHEMA } from "./settings_schema.js";

export class SettingsManager {
  /**
   * @param {import('./ws.js').RopeSocket} socket
   * @param {function(string, *): void} onRenderChange - called with (id, value)
   */
  constructor(socket, onRenderChange) {
    this.socket = socket;
    this.onRenderChange = onRenderChange;
    this.values = this._collectDefaults();
    this._buildPanel();
    this._wireToggle();
  }

  /** Return the current value of a setting by id. */
  get(id) {
    return this.values[id];
  }

  // ------------------------------------------------------------------
  // Setup
  // ------------------------------------------------------------------

  _collectDefaults() {
    const vals = {};
    for (const group of SETTINGS_SCHEMA) {
      for (const s of group.settings) {
        vals[s.id] = s.default;
      }
    }
    return vals;
  }

  _buildPanel() {
    // Shared tooltip element — lives in body with fixed positioning so it is
    // never clipped by the panel's overflow-y:auto scroll container.
    this._tooltip = document.createElement("div");
    this._tooltip.className = "settings-tooltip";
    this._tooltip.hidden = true;
    document.body.appendChild(this._tooltip);

    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("settings-hint")) {
        this._tooltip.hidden = true;
      }
    });

    const panel = document.getElementById("settings-panel");
    for (const group of SETTINGS_SCHEMA) {
      const groupEl = document.createElement("div");
      groupEl.className = "settings-group";

      const title = document.createElement("h3");
      title.textContent = group.group;
      groupEl.appendChild(title);

      for (const schema of group.settings) {
        groupEl.appendChild(this._buildControl(schema));
      }
      panel.appendChild(groupEl);
    }
  }

  _wireToggle() {
    const btn = document.getElementById("settings-toggle");
    const panel = document.getElementById("settings-panel");
    btn.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
  }

  // ------------------------------------------------------------------
  // Control builders
  // ------------------------------------------------------------------

  _buildControl(schema) {
    const row = document.createElement("div");
    row.className = "settings-row";

    // Wrap label + hint in a div so the hint is NOT inside the <label>.
    // A hint inside <label> causes the browser to fire a synthetic click on
    // the associated input when the hint is clicked, which immediately
    // dismisses the tooltip via the document listener.
    const labelWrap = document.createElement("div");
    labelWrap.className = "settings-label-wrap";
    row.appendChild(labelWrap);

    const label = document.createElement("label");
    label.htmlFor = `setting-${schema.id}`;
    label.textContent = schema.label;
    labelWrap.appendChild(label);

    if (schema.description) {
      const hint = document.createElement("span");
      hint.className = "settings-hint";
      hint.textContent = "?";
      hint.addEventListener("click", (e) => {
        e.stopPropagation();
        const already = !this._tooltip.hidden && this._tooltip.dataset.for === schema.id;
        this._tooltip.hidden = already;
        if (!already) {
          this._tooltip.textContent = schema.description;
          this._tooltip.dataset.for = schema.id;
          const r = hint.getBoundingClientRect();
          this._tooltip.style.top   = (r.bottom + 6) + "px";
          this._tooltip.style.right  = (window.innerWidth - r.right - 4) + "px";
        }
      });
      labelWrap.appendChild(hint);
    }

    const input = document.createElement("input");
    input.id = `setting-${schema.id}`;
    input.type = schema.type;

    if (schema.type === "range") {
      input.min = schema.min;
      input.max = schema.max;
      input.step = schema.step;
      input.value = schema.default;

      const display = document.createElement("span");
      display.className = "settings-value";
      display.textContent = schema.default;

      input.addEventListener("input", () => {
        const val = parseFloat(input.value);
        display.textContent = val;
        this._onChange(schema, val);
      });

      row.appendChild(input);
      row.appendChild(display);

    } else if (schema.type === "color") {
      input.value = schema.default;
      input.addEventListener("input", () => this._onChange(schema, input.value));
      row.appendChild(input);

    } else if (schema.type === "checkbox") {
      input.checked = schema.default;
      input.addEventListener("change", () => this._onChange(schema, input.checked));
      row.appendChild(input);
    }

    return row;
  }

  // ------------------------------------------------------------------
  // Change routing
  // ------------------------------------------------------------------

  _onChange(schema, value) {
    this.values[schema.id] = value;
    if (schema.target === "physics") {
      this.socket.send({ action: "update_settings", settings: { [schema.id]: value } });
    } else {
      this.onRenderChange(schema.id, value);
    }
  }
}
