import Modifier, { ArgsFor, PositionalArgs, NamedArgs } from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { getOwner } from '@ember/application';
import ResizeService from '../services/resize';

const { floor } = Math;

interface ResizeAwareSignature {
  Args: {
    Positional: [];
    Named: {
      relative: boolean;
    };
  };
  Element: Element;
}

function cleanup(instance: ResizeAwareModifier) {
  instance.cleanup();
}

export default class ResizeAwareModifier extends Modifier<ResizeAwareSignature> {
  get resizeService(): ResizeService {
    return <ResizeService>getOwner(this)?.lookup('service:resize-service');
  }

  resizeDebouncedEventsEnabled = true;
  resizeEventsEnabled = true;

  _oldViewHeight: number | null = null;
  _oldViewHeightDebounced: number | null = null;
  _oldViewWidth: number | null = null;
  _oldViewWidthDebounced: number | null = null;
  resizeHeightSensitive = true;
  resizeWidthSensitive = true;

  target: any | null = null;

  get screenHeight() {
    return this.resizeService?.screenHeight;
  }
  get screenWidth() {
    return this.resizeService?.screenWidth;
  }

  constructor(owner: unknown, args: ArgsFor<ResizeAwareSignature>) {
    super(owner, args);
    registerDestructor(this, cleanup);
  }

  modify(
    element: Element,
    []: PositionalArgs<ResizeAwareSignature>,
    { relative }: NamedArgs<ResizeAwareSignature>
  ) {
    if (!this.target) {
      this.target = element;

      if (this.resizeEventsEnabled) {
        this.resizeService?.on('didResize', this, this._handleResizeEvent);
      }
      if (this.resizeDebouncedEventsEnabled) {
        this.resizeService?.on(
          'debouncedDidResize',
          this,
          this._handleDebouncedResizeEvent
        );
      }
    }
  }

  cleanup() {
    if (this.resizeEventsEnabled) {
      this.resizeService?.off('didResize', this, this._handleResizeEvent);
    }
    if (this.resizeDebouncedEventsEnabled) {
      this.resizeService?.off(
        'debouncedDidResize',
        this,
        this._handleDebouncedResizeEvent
      );
    }
  }

  _getComponentSize(): any {
    const rect = this.target?.getClientRects();
    return rect?.[0] ?? {};
  }

  _handleResizeEvent(evt: UIEvent) {
    const w = floor(this._getComponentSize().width);
    const h = floor(this._getComponentSize().height);
    if (
      (this.resizeWidthSensitive && this._oldViewWidth !== w) ||
      (this.resizeHeightSensitive && this._oldViewHeight !== h)
    ) {
      this.target?.dispatchEvent(
        new CustomEvent('resized', {
          detail: {
            width: w,
            height: h,
            event: evt,
            debounced: false,
          },
        })
      );
      this._oldViewHeight = h;
      this._oldViewWidth = w;
    }
  }

  _handleDebouncedResizeEvent(evt: UIEvent) {
    const w = floor(this._getComponentSize().width);
    const h = floor(this._getComponentSize().height);
    if (
      (this.resizeWidthSensitive && this._oldViewWidthDebounced !== w) ||
      (this.resizeHeightSensitive && this._oldViewHeightDebounced !== h)
    ) {
      this.target?.dispatchEvent(
        new CustomEvent('resized', {
          detail: {
            width: w,
            height: h,
            event: evt,
            debounced: true,
          },
        })
      );
      this._oldViewHeightDebounced = h;
      this._oldViewWidthDebounced = w;
    }
  }
}
