import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * @class AutoSCaleModifier
 * A auto scale modifer on image to lazy load a image when element is visible in viewport.
 *
 * @property string width
 * @property string height
 */
export default class AutoScaleModifier extends Modifier {
  @service autoScaleImage;

  element = null;
  args = null;

  modify(element, [imageSrc, width, height, fallbackSrc]) {
    this.element = element;
    this.args = { imageSrc, width, height, fallbackSrc };
    this.loadImage.perform();
  }
  get width() {
    return this.args.width || 0;
  }
  get height() {
    return this.args.height || 0;
  }

  get imageSrc() {
    return this.args.imageSrc || '';
  }

  get fallbackSrc() {
    return this.args.fallbackSrc || '';
  }

  @task *loadImage() {
    this.loaded = false;
    let width = parseInt(this.width);
    let height = parseInt(this.height);
    const src = this.imageSrc;
    const fallbackSrc = this.fallbackSrc;

    const result = yield this.autoScaleImage
      .get('scaleImage')
      .perform(src, width, height, fallbackSrc);

    this.element.src = result.imageSrc;
    this.element.style.width = `${result.size.width}px`;
    this.element.style.height = `${result.size.height}px`;
  }
}
