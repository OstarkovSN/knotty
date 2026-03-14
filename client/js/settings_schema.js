/**
 * Settings schema — single source of truth for all user-configurable parameters.
 *
 * To add a new setting, append one entry to the appropriate group below.
 * The UI panel, routing, and type coercion are all derived from this schema
 * automatically — no other JS changes required.
 *
 * Field reference:
 *   id           {string}  Unique key. For target="physics" must match the
 *                          Python RuntimeSettings field name exactly.
 *   label        {string}  Human-readable label shown in the panel.
 *   description  {string}  Tooltip shown on hover.
 *   type         {string}  Input type: "range" | "color" | "checkbox"
 *   target       {string}  "physics" → sent to server via WebSocket
 *                          "render"  → applied locally to the renderer
 *   default      {*}       Initial value.
 *   min/max/step            Required for type="range".
 */

export const SETTINGS_SCHEMA = [
  {
    group: "Physics",
    settings: [
      {
        id: "gravity_y",
        label: "Gravity",
        description: "Downward acceleration applied to all rope nodes. More negative = stronger pull.",
        type: "range",
        min: -20, max: 0, step: 0.1,
        default: -9.81,
        target: "physics",
      },
      {
        id: "damping",
        label: "Damping",
        description: "Velocity multiplier applied each tick. Lower values make the rope lose energy faster and settle sooner.",
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.98,
        target: "physics",
      },
      {
        id: "substeps",
        label: "Substeps",
        description: "Number of constraint-solving passes per frame. More substeps improve stability but cost more CPU.",
        type: "range",
        min: 1, max: 20, step: 1,
        default: 5,
        target: "physics",
      },
    ],
  },
  {
    group: "Rope",
    settings: [
      {
        id: "stiffness",
        label: "Stiffness",
        description: "Fraction of constraint error corrected each substep. 1.0 = inextensible, 0.0 = fully elastic.",
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 1.0,
        target: "physics",
      },
      {
        id: "stretch_limit",
        label: "Stretch Limit",
        description: "Hard cap on segment length as a ratio of its rest length. Beyond this the rope is always corrected in full, regardless of stiffness. 1.0 = no stretch allowed, 2.0 = can double in length.",
        type: "range",
        min: 1.0, max: 3.0, step: 0.05,
        default: 1.5,
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
        description: "Color of the rope tube.",
        type: "color",
        default: "#e8c97a",
        target: "render",
      },
      {
        id: "tubeRadius",
        label: "Tube Radius",
        description: "Visual thickness of the rope in world units.",
        type: "range",
        min: 0.01, max: 0.2, step: 0.005,
        default: 0.05,
        target: "render",
      },
    ],
  },
];
