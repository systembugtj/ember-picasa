import Component from '@glimmer/component';
import { next } from '@ember/runloop';
import { action } from '@ember/object';

export default class PicasaSplitSashComponent extends Component {
  width = 6;
  widthPercentage = null;
  element;

  get parent() {
    return this.args.parent;
  }

  get computedClassnames() {
    return `split-view-sash ${this.parent?.isDragging ? 'isDragging' : ''} ${
      this.parent?.isVertical ? 'vertical' : 'horizontal'
    } ember-view`;
  }

  @action
  updateStyle(element) {
    this.element = element;
    const parent = this.parent;
    next(this, () => {
      if (parent) {
        this.parent.sash = this;
      }
      this._setStyle();
    });
  }

  @action
  refreshStyle() {
    this._setStyle();
  }

  _setStyle() {
    const width = this.width;
    const position = this.parent.splitPosition;
    const isVertical = this.parent.isVertical;

    const style = this.element.style;

    if (isVertical) {
      style.left = `${position - width / 2}px`;
      style.top = null;
    } else {
      style.left = null;
      style.top = `${position - width / 2}px`;
    }

    if (isVertical) {
      style.width = `${width}px`;
      style.height = null;
    } else {
      style.width = null;
      style.height = `${width}px`;
    }
  }

  @action
  mouseDown(event) {
    event.preventDefault();
    this.parent.isDragging = true;
  }
}
