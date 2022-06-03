export default class NotificationMessage {
  static activeNotification;

  constructor(string, { duration, type } = {}) {
    this.string = string;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.getType()}" style="--value:${this.getDuration()}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">${this.getType()}</div>
            <div class="notification-body">
                ${this.getString()}
            </div>
        </div>
    </div>
    `;
  }

  render() {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }
    const element = document.createElement("div");
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
  }

  show(parent = document.body) {
    parent.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);

    NotificationMessage.activeNotification = this;
  }

  getDuration() {
    return this.duration ? this.duration / 1000 : 2;
  }

  getType() {
    return this.type ? this.type : "success";
  }

  getString() {
    return this.string
      ? `${this.string} ${(Math.random() * 100).toFixed(0)}`
      : "Успешно";
  }

  update(str, { duration, type }) {
    this.string = str;
    this.duration = duration;
    this.type = type;
    this.element.body.innerHTML = this.template;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
