export default class ColumnChart {
  subElements = {}
  chartHeight = 50

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = (data) => data,
  } = {}) {
    this.data = data
    this.label = label
    this.link = link
    this.value = formatHeading(value)
    this.render()
  }

  get template() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: 50">
            <div data-element="header" class="column-chart__title">
                Total ${this.label}
                ${this.getLink()}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                    ${this.value}
                </div>
                <div data-element="body" class="column-chart__chart">
                ${this.getColumnBody()}
                </div>
            </div>
        </div>
   `
  }

  render() {
    const element = document.createElement('div')
    element.innerHTML = this.template

    this.element = element.firstElementChild

    if (this.data.length > 0) {
      this.element.classList.remove('column-chart_loading')
    }

    this.subElements = this.getSubElements()
  }

  getSubElements() {
    const result = {}
    const elements = this.element.querySelectorAll('[data-element]')
    for (const key of elements) {
      const name = key.dataset.element

      result[name] = key
    }
    return result
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data)
    const scale = this.chartHeight / maxValue

    return this.data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0)

        return `
                 <div style="--value: ${Math.floor(item * scale)}"
                 data-tooltip="${percent}%"></div>
                `
      })
      .join('')
  }

  getLink() {
    return this.link
      ? `  <a class="column-chart__link" href="${this.link}">
            View All</a>`
      : ''
  }

  update(data) {
    this.data = data
    this.subElements.body.innerHTML = this.getColumnBody()
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove()
    this.element = null
    this.subElements = {}
  }
}
