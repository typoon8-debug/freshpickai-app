interface Window {
  daum?: {
    Postcode: new (options: {
      oncomplete: (data: { zonecode: string; roadAddress: string; address: string }) => void;
    }) => {
      embed: (el: HTMLElement, opts?: { autoClose?: boolean }) => void;
    };
  };
}
