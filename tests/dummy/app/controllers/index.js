import Controller from '@ember/controller';

export default class IndexController extends Controller {
  get images() {
    return this.model;
  }
}
