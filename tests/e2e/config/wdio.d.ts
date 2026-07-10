declare namespace WebdriverIO {
  interface Browser extends WebdriverIO.Browser {
    installAddOn: (extension: string, temporary: boolean) => Promise<void>;
  }
}
