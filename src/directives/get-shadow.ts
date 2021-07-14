import Vibrant from 'node-vibrant/lib/bundle';

export const getShadowDirective = {
  bind(el: HTMLElement): void {
    el.addEventListener('load', () => {
      if (!('src' in el)) {
        return;
      }

      const target = el as HTMLImageElement;
      if (!target.currentSrc) {
        return;
      }

      new Vibrant(target.currentSrc, {
        useWorker: false
      })
        .getPalette()
        .then((p) => {
          const color = p.Vibrant?.rgb.join(',');
          target.style.boxShadow = `0px 0px 16px rgb(${color})`;
        });
    });
  }
};
