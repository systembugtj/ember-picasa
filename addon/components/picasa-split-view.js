import Component from '@glimmer/component';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import SplitChild from './picasa-split-child';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * This class represents a view that is split either vertically or horizontally.
 * The split view is composed of three child views: a left or top view, a sash
 * view, and a right or bottom view.  The sash may be dragged to change the
 * relative width or height of the child views.
 *
 * Vertical SplitView example:
 *
 * ```handlebars
 * {{#split-view isVertical=true}}
 *   {{#split-child}}
 *     Content of the left view here.
 *   {{/split-child}}
 *   {{split-sash"}}
 *   {{#split-child}}
 *     Content of the right view here.
 *   {{/split-child}}
 * {{/split-view}}
 * ```
 *
 * Horizontal SplitView example:
 *
 * ```handlebars
 * {{#split-view isVertical=false}}
 *   {{#split-child}}
 *     Content of the top view here.
 *   {{/split-child}}
 *   {{split-sash"}}
 *   {{#split-child}}
 *     Content of the bottom view here.
 *   {{/split-child}}
 * {{/split-view}}
 * ```
 *
 * @cLass SplitViewComponent
 * @extends Ember.Component
 */

export default class PicasaSplitViewComponent extends Component {
  @service resizeService;

  /**
   * @property {boolean} isVertical - the orientation of the split: true = vertical, false = horizontal
   * @default true
   */
  isVertical = true;

  /**
   * @property {Number} splitPosition - the position of the split in pixels
   * @default 50
   */
  @tracked splitPosition = 250;
  @tracked isDragging = false;

  splits = [];
  element;
  isRoot = false;

  get computedClassnames() {
    return `split-view ${this.isDragging ? 'dragging' : ''} ${
      this.isVertical ? 'vertical' : 'horizontal'
    } ${this.args.class} ember-view`;
  }

  get minSize() {
    let result = 0;
    const children = this.splits;
    for (let i = 0; i < children.length; i += 1) {
      result += children[i].minSize;
    }
    result += (children.length - 1) * this.sash?.width;
    return result;
  }

  @action
  updateStyle() {
    this._setStyle();
    this.updateOrientation();
    this.constrainSplit();
  }

  updateOrientation() {
    const splits = this.splits;
    const leftOrTop = splits[0];
    const rightOrBottom = splits[1];

    if (this.isVertical) {
      leftOrTop.anchorSide = 'right';
      rightOrBottom.anchorSide = 'left';
    } else {
      leftOrTop.anchorSide = 'bottom';
      rightOrBottom.anchorSide = 'top';
    }
  }

  constrainSplit() {
    const splits = this.splits;
    const leftOrTop = splits[0];
    const rightOrBottom = splits[1];

    if (leftOrTop) {
      const minLeftOrTopPosition = leftOrTop.minSize;

      if (this.splitPosition < minLeftOrTopPosition) {
        this.splitPosition = minLeftOrTopPosition;
      }
    }

    const size = this.isVertical ? this.width : this.height;
    if (rightOrBottom) {
      const minRightOrBottomPosition = size - rightOrBottom.minSize;

      if (this.splitPosition > minRightOrBottomPosition) {
        this.splitPosition = minRightOrBottomPosition;
      }
    }

    leftOrTop?.refreshStyle();
    rightOrBottom?.refreshStyle();
  }

  @action
  handleMouseUp() {
    this.isDragging = false;
  }

  @action
  handleMouseLeave() {
    this.isDragging = false;
  }

  @action
  handleMouseMove(event) {
    if (!this.isDragging) {
      return;
    }

    let position = 0;

    const offset = this.offset();
    if (this.isVertical) {
      position = event.pageX - offset.left;
    } else {
      position = event.pageY - offset.top;
    }

    this.splitPosition = position;
    this.constrainSplit();
  }

  @action
  setupSplits(element) {
    this.element = element;
    const parentView = this.parentView;
    const isRoot = !(parentView instanceof SplitChild);

    // run next to avoid changing the component during a render iteration
    next(this, () => {
      this.isRoot = isRoot;
      const resizeService = this.resizeService;

      if (!isRoot) {
        parentView.childSplitView = this;
        if (resizeService) {
          resizeService.off('didResize', this, this.didResize);
        }
      } else {
        // only need width and height on root split-view
        // split-child passes it down the tree for nested ones
        if (resizeService) {
          resizeService.on('didResize', this, this.didResize);
        }
      }
      next(this, () => {
        this._setStyle();
        this.updateSize();
      });
    });
  }

  updateSize() {
    // must do this in afterRender so that the parent has calculated its width and height
    const clientRect = this.element.getBoundingClientRect();
    this.width = clientRect.width;
    this.height = clientRect.height;
  }

  willDestroy() {
    super.willDestroy();

    const resizeService = this.resizeService;
    if (resizeService) {
      resizeService.off('didResize', this, this.didResize);
    }
  }

  didResize() {
    const clientRect = this.element.getBoundingClientRect();
    this.width = clientRect.width;
    this.height = clientRect.height;
    this.constrainSplit();
  }

  _setStyle() {
    const style = this.element.style;
    if (this.isRoot) {
      // let the DOM know our minimum size
      const isVertical = this.isVertical;
      const size = `${this.minSize}px`;
      if (isVertical) {
        style.minWidth = size;
        style.minHeight = null;
      } else {
        style.minWidth = null;
        style.minHeight = size;
      }
    } else {
      style.minWidth = null;
      style.minHeight = null;
    }
  }

  addSplit(split) {
    const splits = this.splits;
    splits.push(split);

    if (splits.length === 2) {
      this.updateOrientation();
    }
  }

  removeSplit(split) {
    const index = this.splits.indexOf(split);
    if (index > -1) {
      // only splice array when item is found
      this.splits.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  offset() {
    const rect = this.element.getBoundingClientRect();
    const win = this.element.ownerDocument.defaultView;
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset,
    };
  }
}
