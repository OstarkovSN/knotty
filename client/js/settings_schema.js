/**
 * Settings schema — single source of truth for all user-configurable parameters.
 *
 * To add a new setting, append one entry to the appropriate group below.
 * The UI panel, routing, and type coercion are all derived from this schema
 * automatically — no other JS changes required.
 *
 * Field reference:
 *   id       {string}  Unique key. For target="physics" must match the
 *                      Python RuntimeSettings field name exactly.
 *   label    {string}  Human-readable label shown in the panel.
 *   type     {string}  Input type: "range" | "color" | "checkbox"
 *   target   {string}  "physics" → sent to server via WebSocket
 *                      "render"  → applied locally to the renderer
 *   default  {*}       Initial value.
 *   min/max/step       Required for type="range".
 */

export const SETTINGS_SCHEMA = [
  {
    group: "Physics",
    settings: [
      {
        id: "gravity_y",
        label: "Gravity",
        type: "range",
        min: -20, max: 0, step: 0.1,
        default: -9.81,
        target: "physics",
      },
      {
        id: "damping",
        label: "Damping",
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.98,
        target: "physics",
      },
      {
        id: "substeps",
        label: "Substeps",
        type: "range",
        min: 1, max: 20, step: 1,
        default: 5,
        target: "physics",
      },
    ],
  },
  {
    group: "Rendering",
    settings: [
      {
        id: "ropeColor",
        label: "Rope Color",
        type: "color",
        default: "#e8c97a",
        target: "render",
      },
      {
        id: "tubeRadius",
        label: "Tube Radius",
        type: "range",
        min: 0.01, max: 0.2, step: 0.005,
        default: 0.05,
        target: "render",
      },
    ],
  },
];
