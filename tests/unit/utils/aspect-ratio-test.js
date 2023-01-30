import aspectRatio from 'dummy/utils/aspect-ratio';
import fetchImage from 'dummy/utils/fetch-image';
import { module, test } from 'qunit';

module('Unit | Utility | aspect ratio', function () {
  test('it works', function (assert) {
    assert.expect(1);
    let done = assert.async();
    fetchImage('http://placekitten.com/2000/1125')
      .then((img) => {
        return aspectRatio(img, 200, 300);
      })
      .then((size) => {
        assert.ok(size);
        done();
      });
  });
});
