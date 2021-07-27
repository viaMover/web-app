import Vibrant from 'node-vibrant/lib/bundle';
import { DirectiveBinding } from 'vue/types/options';

export const getShadowDirective = {
  bind(el: HTMLElement, binding: DirectiveBinding): void {
    if (binding.value !== undefined) {
      el.style.boxShadow = `0px 0px 16px ${binding.value}`;
      return;
    }

    el.addEventListener('load', () => {
      if (binding.value !== undefined) {
        el.style.boxShadow = `0px 0px 16px ${binding.modifiers.color}`;
        return;
      }

      if (!('src' in el)) {
        return;
      }

      const target = el as HTMLImageElement;
      if (!target.currentSrc) {
        return;
      }

      new Vibrant(target, {
        useWorker: true
      })
        .getPalette()
        .then((p) => {
          const color = p.Vibrant?.rgb.join(',');
          target.style.boxShadow = `0px 0px 16px rgb(${color})`;
        })
        .catch(() => {
          // to prevent ERR::FAILED because of CORS absence
          // or canvas preventing from accessing because of
          // CORS taint
          target.style.boxShadow = `0px 0px 16px rgb(0 0 0 / 50%)`;
        });
    });
  },
  update(el: HTMLElement, binding: DirectiveBinding): void {
    if (binding.value !== undefined && binding.oldValue !== binding.value) {
      el.style.boxShadow = `0px 0px 16px ${binding.value}`;
      return;
    }
  },
  inserted(el: HTMLElement, binding: DirectiveBinding): void {
    if (binding.value !== undefined) {
      el.style.boxShadow = `0px 0px 16px ${binding.value}`;
      return;
    }
  }
};
