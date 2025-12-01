interface Window {
  Configs: {
    api: string;
  };
  SpinePlugin: any;
}

declare module '*.css' {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}
