import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import Tooltip from "./components/tooltip/src/index.js";
import header from "./bestsellers-header.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  subelements = {};

  update = (event) => {
    this.updateComponents(false, event.detail.from, event.detail.to);
  };

  constructor() {}

  async render() {
    this.componentsObject = {
      sales: new ColumnChart(defaultSalesChartFotmat),
      orders: new ColumnChart(defaultOrdersChartFormat),
      customers: new ColumnChart(defaultCustomersChartFormat),
      sortTable: new SortableTable(header, defaultSortTableChartFormat),
    };

    await this.updateComponents(true);

    this.componentsObject.rangePicker = new RangePicker();
    const div = document.createElement("div");
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subelements = this.getSubelements();
    this.componentsUpdate();
    document.getElementsByClassName("progress-bar")[0].style.display = "none";
    this.initEvents();
    const tooltip = new Tooltip();
    tooltip.render();
    document.body.append(tooltip.element);
    tooltip.initialize();
    return this.element;
  }

  getTemplate() {
    return `
    <div class="dashboard full-height flex-column">
          <div class="content__top-panel"><h2 class="page-title">Панель управления</h2><div class="rangepicker">
            <div data-element="rangePicker">
            </div>
            <div class="rangepicker__selector" data-elem="selector"></div>
          </div>
        </div>
        <div class="dashboard__charts">
            <div data-element="sales"> </div>
            <div data-element="orders"> </div>
            <div data-element="customers"> </div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortTable"></div>
    </div>
    `;
  }

  getChatrtsTemplate() {
    return Object.values(this.componentsObject)
      .map((component) => {
        if (component instanceof ColumnChart) {
          return component.element.outerHTML;
        }
      })
      .join("");
  }

  componentsUpdate() {
    const subsList = Object.entries(this.subelements);

    for (const [elementName, elementValue] of subsList) {
      elementValue.append(this.componentsObject[elementName].element);
    }
  }

  getSubelements() {
    const subs = {};
    const subsList = this.element.querySelectorAll("[data-element]");

    for (const element of subsList) {
      subs[element.dataset.element] = element;
    }

    return subs;
  }

  initEvents() {
    this.componentsObject.rangePicker.element.addEventListener(
      "date-select",
      this.update
    );
  }

  fetchDataAll(isFirstTime = false, from = new Date(), to = new Date()) {
    const y = Object.entries(this.componentsObject).filter(([name, element]) =>
      this.filterFetch(element, isFirstTime)
    );
    return Object.entries(this.componentsObject)
      .filter(([name, element]) => this.filterFetch(element, isFirstTime))
      .map(([componentName, componentValue]) => {
        return componentValue
          .fetchData({ start: from, end: to })
          .then((result) => {
            return {
              component: componentName,
              data: result,
            };
          });
      });
  }

  filterFetch(element, isFirstTime) {
    if (element instanceof RangePicker) {
      return false;
    }
    if (element instanceof SortableTable && !isFirstTime) {
      return false;
    }

    return true;
  }

  async updateComponents(isFirstTime, from, to) {
    const responseDataArray = await Promise.all(
      this.fetchDataAll(isFirstTime, from, to)
    );
    for (const result of responseDataArray) {
      this.componentsObject[result.component].update(result.data);
    }
  }
}

const defaultSalesChartFotmat = {
  url: "api/dashboard/sales",
  label: "sales",
  formatHeading: (data) => `$${data}`,
  immediateFetch: false,
  range: {
    from: new Date("2020-04-06"),
    to: new Date("2020-05-06"),
  },
};

const defaultOrdersChartFormat = {
  url: "api/dashboard/orders",
  label: "orders",
  link: "#",
  immediateFetch: false,
  range: {
    from: new Date("2020-04-06"),
    to: new Date("2020-05-06"),
  },
};

const defaultCustomersChartFormat = {
  url: "api/dashboard/customers",
  label: "customers",
  immediateFetch: false,
  range: {
    from: new Date("2020-04-06"),
    to: new Date("2020-05-06"),
  },
};

const defaultSortTableChartFormat = {
  url: "api/dashboard/bestsellers",
  immediateFetch: false,
  isSortLocally: true,
  chunk: 100,
};
