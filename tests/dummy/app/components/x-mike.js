import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class XMikeComponent extends Component {
  @tracked resizeEvents = [];
  @action
  didResize(event) {
    this.resizeEvents = [
      ...this.resizeEvents,
      {
        width: event.detail.width,
        height: event.detail.height,
        debounced: false,
      },
    ];
  }

  @action
  debouncedDidResize(event) {
    this.resizeEvents = [
      ...this.resizeEvents,
      {
        width: event.detail.width,
        height: event.detail.height,
        debounced: true,
      },
    ];
  }
}
