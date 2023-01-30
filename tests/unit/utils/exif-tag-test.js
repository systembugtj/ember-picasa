import queryExifTags from 'dummy/utils/exif-tag';
import { module, test } from 'qunit';

module('Unit | Utility | exif-tag', function () {
  // TODO: Replace this with your real tests.
  test('it works', function (assert) {
    assert.expect(1);
    const done = assert.async();
    return queryExifTags('http://placekitten.com/2000/1125').then((tags) => {
      assert.notEqual(tags, null);
      done();
    });
  });
});
// Replace this with your real tests.
