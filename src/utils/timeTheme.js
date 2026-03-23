export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
};

export const themes = {
  morning: {
    name: "morning",
    background: "linear-gradient(135deg, #FFF9C4, #FFE082, #FFB74D)",
    cardBg: "rgba(255, 255, 255, 0.85)",
    primary: "#F57F17",
    secondary: "#FF8F00",
    text: "#4E342E",
    subtext: "#795548",
    buttonBg: "#FF8F00",
    buttonText: "#ffffff",
    navBg: "rgba(255, 236, 179, 0.95)",
    shadow: "0 8px 32px rgba(255, 143, 0, 0.3)",
    greeting: "Good Morning! ☀️",
    icon: "🌅",
    loginPosition: { justifyContent: "flex-start", paddingTop: "80px" },
    buttonAnimation: "slideFromTop",
  },
  afternoon: {
    name: "afternoon",
    background: "linear-gradient(135deg, #E3F2FD, #90CAF9, #42A5F5)",
    cardBg: "rgba(255, 255, 255, 0.85)",
    primary: "#1565C0",
    secondary: "#1976D2",
    text: "#0D47A1",
    subtext: "#1565C0",
    buttonBg: "#1976D2",
    buttonText: "#ffffff",
    navBg: "rgba(227, 242, 253, 0.95)",
    shadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
    greeting: "Good Afternoon! ☀️",
    icon: "🌤️",
    loginPosition: { justifyContent: "center", paddingTop: "0px" },
    buttonAnimation: "slideFromLeft",
  },
  evening: {
    name: "evening",
    background: "linear-gradient(135deg, #FBE9E7, #FFAB91, #FF7043)",
    cardBg: "rgba(255, 255, 255, 0.85)",
    primary: "#BF360C",
    secondary: "#E64A19",
    text: "#BF360C",
    subtext: "#D84315",
    buttonBg: "#E64A19",
    buttonText: "#ffffff",
    navBg: "rgba(251, 233, 231, 0.95)",
    shadow: "0 8px 32px rgba(230, 74, 25, 0.3)",
    greeting: "Good Evening! 🌆",
    icon: "🌅",
    loginPosition: { justifyContent: "flex-end", paddingBottom: "80px" },
    buttonAnimation: "slideFromRight",
  },
  night: {
    name: "night",
    background: "linear-gradient(135deg, #0a0a2e, #1a1a4e, #0d1b4b)",
    cardBg: "rgba(255, 255, 255, 0.08)",
    primary: "#90CAF9",
    secondary: "#64B5F6",
    text: "#E3F2FD",
    subtext: "#90CAF9",
    buttonBg: "#1565C0",
    buttonText: "#ffffff",
    navBg: "rgba(10, 10, 46, 0.95)",
    shadow: "0 8px 32px rgba(144, 202, 249, 0.2)",
    greeting: "Good Night! 🌙",
    icon: "🌙",
    loginPosition: { justifyContent: "flex-end", paddingBottom: "40px" },
    buttonAnimation: "slideFromBottom",
  },
};

export const getTheme = () => {
  const timeOfDay = getTimeOfDay();
  return themes[timeOfDay];
};