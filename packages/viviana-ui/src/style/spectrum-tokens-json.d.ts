type ColorToken = {
  sets: {
    light: { value: string };
    dark: { value: string };
  };
};

declare const tokens: Record<string, unknown> & {
  "gray-25": ColorToken;
  "background-base-color": ColorToken;
  "background-layer-1-color": ColorToken;
  "background-layer-2-color": {
    sets: {
      light: ColorToken;
      dark: ColorToken;
    };
  };
};

export default tokens;
