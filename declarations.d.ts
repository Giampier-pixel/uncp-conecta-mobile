// CSS module imports (web platform files)
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Side-effect CSS imports (e.g. global.css in NativeWind / Expo web)
declare module '*.css' {
  const content: undefined;
  export default content;
}
