import Component from '@glimmer/component';
import { schedule, next, scheduleOnce } from '@ember/runloop';
import { action } from '@ember/object';

export default class PicasaSplitChildComponent extends Component {
  childSplitView;
  anchorSide;
  element;

  get parent() {
    return this.args.parent;
  }
  get computedClassnames() {
    return `split-view-child ${this.parent?.isDragger ? 'isDragging' : ''} ${
      this.parent?.isVertical ? 'vertical' : 'horizontal'
    } ${this.childSplitView ? 'nested' : ''} ${this.args.class} ember-view`;
  }

  constructor() {
    super(...arguments);
    schedule('afterRender', this, () => {
      this['register-as'] = this; // register-as is a new property
    });
  }

  @action
  refreshSplits(element) {
    this.element = element;
    const parent = this.parent;

    // run next to avoid changing the component during a render iteration
    next(this, () => {
      if (parent && parent.addSplit) {
        parent.addSplit(this);
      }
      this._setStyle();
    });
  }
  @action
  updateSplits() {
    this._setStyle();
    this.updateChildSplitView();
  }

  _setStyle() {
    const anchorSide = this.anchorSide;
    let l = null;
    let r = null;
    let t = null;
    let b = null;
    if (anchorSide === 'left') {
      l = `${this.anchorOffset}px`;
    } else if (anchorSide === 'right') {
      r = `${this.anchorOffset}px`;
    } else if (anchorSide === 'top') {
      t = `${this.anchorOffset}px`;
    } else if (anchorSide === 'bottom') {
      b = `${this.anchorOffset}px`;
    }
    const style = this.element.style;
    style.left = l;
    style.right = r;
    style.top = t;
    style.bottom = b;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    const parent = this.parent;

    if (parent && parent.removeSplit) {
      parent.removeSplit(this);
    }
  }
  parentSize() {
    const anchorSide = this.anchorSide;
    if (!anchorSide) {
      return 0;
    }

    if (anchorSide === 'left' || anchorSide === 'right') {
      return this.parent.width;
    }

    return this.parent.height;
  }

  get anchorOffset() {
    const anchorSide = this.anchorSide;

    if (!anchorSide) {
      return undefined;
    }

    const sashWidth = this.parent.sash.width;
    const splitPosition = this.parent.splitPosition;

    if (anchorSide === 'left' || anchorSide === 'top') {
      return splitPosition + sashWidth / 2;
    }

    const parentSize = this.parentSize;
    if (!parentSize) {
      return 0;
    }
    return parentSize - splitPosition + sashWidth / 2;
  }

  // eslint-disable-next-line ember/no-observers
  updateChildSplitView() {
    // must run afterRender so that the size has updated
    scheduleOnce('afterRender', this, this.updateSize);
  }

  updateSize() {
    const childSplitView = this.childSplitView;

    const element = this.element;
    if (childSplitView) {
      childSplitView.set('width', element.width);
      childSplitView.set('height', element.height);
    }
  }

  collapse() {
    if (this.anchorSide === 'left' || this.anchorSide === 'top') {
      this.parent.splitPosition = this.parentSize;
    } else {
      this.parent.splitPosition = 0;
    }
    this.parent.constrainSplit();
  }

  cssInt(name) {
    return parseInt(this.element.style[name], 10) || 0;
  }

  get minSizeVertical() {
    return (
      this.cssInt('min-width') +
      this.cssInt('padding-left') +
      this.cssInt('padding-right') +
      this.cssInt('border-left') +
      this.cssInt('border-right') +
      this.cssInt('margin-left') +
      this.cssInt('margin-right') +
      this.parent.sash.width / 2
    );
  }

  get minSizeHorizontal() {
    return (
      this.cssInt('min-height') +
      this.cssInt('padding-top') +
      this.cssInt('padding-bottom') +
      this.cssInt('border-top') +
      this.cssInt('border-bottom') +
      this.cssInt('margin-top') +
      this.cssInt('margin-bottom') +
      this.parent.sash.width / 2
    );
  }

  // eslint-disable-next-line ember/no-observers
  get minSize() {
    const childSplitView = this.childSplitView;
    if (childSplitView) {
      return childSplitView.minSize;
    }

    if (this.parent.isVertical) {
      return this.minSizeVertical;
    }

    return this.minSizeHorizontal;
  }
}
