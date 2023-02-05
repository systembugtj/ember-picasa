// eslint-disable-next-line no-unused-vars
import ResizeService from '@systembug/ember-picasa/services/resize';
import config from '../config/environment';

export function initialize(application) {
  const resizeServiceDefaults = Object.assign(
    {},
    {
      debounceTimeout: 200,
      heightSensitive: true,
      widthSensitive: true,
    },
    config.resizeServiceDefaults ?? {}
  );

  let injectionFactories = resizeServiceDefaults.injectionFactories ?? [
    'view',
    'component',
    'modifier',
  ];

  application.unregister('config:resize-service');

  const options = {
    instantiate: false,
  };
  application.register('config:resize-service', resizeServiceDefaults, options);
  application.register('service:resize-service', ResizeService);
  const resizeService = application.resolveRegistration(
    'service:resize-service'
  );
  resizeService.prototype.resizeServiceDefaults = resizeServiceDefaults;

  injectionFactories.forEach((factory) => {
    application.inject(factory, 'resizeService', 'service:resize-service');
  });
}

export default {
  initialize,
  name: 'resize',
};
