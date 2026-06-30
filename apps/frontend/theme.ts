/**
 * Brand tokens — red header band + cream body (delivery mock).
 */
export const palette = {
  primary: "#E55B5B",
  primaryDark: "#cf4f4f",
  primaryMuted: "#FDECEC",
  /** Deep red hero / tab active pill */
  headerRed: "#C62828",
  /** Page background below red header */
  cream: "#FAF8F5",
  chipInactive: "#ECECEC",
  chipInactiveText: "#5C5C5C",
  text: "#1a1a1a",
  textSecondary: "#737373",
  border: "#f0f0f0",
  borderStrong: "#e5e5e5",
  background: "#FAF8F5",
  card: "#ffffff",
  overlay: "rgba(0,0,0,0.35)",
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fab: {
    shadowColor: palette.headerRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
};
