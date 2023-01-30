import Service from '@ember/service';
import { task } from 'ember-concurrency';
import aspectRatio from 'ember-image-utils/utils/aspect-ratio';
import fetchImage from 'ember-image-utils/utils/fetch-image';

export default class AutoImageSerice extends Service {
  // Most browser has 3 concurrent image loading.
  @task({
    maxConcurrency: 3,
    enqueue: true,
  })
  *scaleImage(src, width, height, fallbackSrc) {
    try {
      const image = yield fetchImage(src);
      const size = aspectRatio(image, width, height);
      return {
        imageSrc: src,
        size,
      };
    } catch (e) {
      return {
        imageSrc: fallbackSrc || '',
        size: { width, height },
      };
    }
  }
}
