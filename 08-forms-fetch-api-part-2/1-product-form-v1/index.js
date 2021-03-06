import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  subElements = [];
  defaultFormData = {
    title: "",
    description: "",
    images: [],
    price: "",
    discount: "",
    quantity: "",
    status: 0,
  };

  save = (event) => {
    if (event) {
      event.preventDefault();
    }

    this.element.dispatchEvent(this.event);
  };

  constructor(productId = "") {
    this.productId = productId;
    this.event = this.productId
      ? new CustomEvent("product-updated")
      : new CustomEvent("product-saved");
  }

  getTemplate(productInfo, categoryTouples) {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара" value="${
              productInfo.title
            }">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара">${
            productInfo.description
          }</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          ${this.getImageListContainer(productInfo.images)}
          <button type="button" name="uploadImage" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.getSubcategorySelect(categoryTouples, productInfo.subcategory)}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" value="${
              productInfo.price
            }">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" value="${
              productInfo.discount
            }">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1" value="${
            productInfo.quantity
          }">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id="status">
            ${this.getSelectOption(1, "Активен", productInfo.status)}
            ${this.getSelectOption(0, "Неактивен", productInfo.status)}
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>`;
  }

  getImageListContainer(images) {
    return `
    <div data-element="imageListContainer">
      <ul class="sortable-list">
        ${images
          .map((image) => {
            return `
          <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${image.url}">
            <input type="hidden" name="source" value="${image.source}">
            <span>
              <img src="icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
              <span>${image.source}</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
          </li>`;
          })
          .join("")}
      </ul>
    </div>`;
  }

  getSubcategorySelect(categoryTouples, activeSubcategory) {
    return `
    <select class="form-control" name="subcategory" id="subcategory">
      ${categoryTouples
        .map(([value, title]) =>
          this.getSelectOption(value, title, activeSubcategory)
        )
        .join("")}
    </select>`;
  }

  getSelectOption(value, title, selectValue) {
    return `<option value='${value}' ${
      selectValue === value ? "selected" : ""
    }>${title}</option>`;
  }

  async render() {
    const wrapper = document.createElement("div");
    const [categories, productInfo] = await Promise.all([
      this.loadCategories(),
      this.loadProductInfo(),
    ]);
    const escapedInfo = this.escapeProductInfo(productInfo);
    const categoryTouples = this.getCategoryTouples(categories);

    wrapper.innerHTML = this.getTemplate(escapedInfo, categoryTouples);
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener("submit", this.save);
  }

  async loadProductInfo() {
    if (!this.productId) {
      return this.defaultFormData;
    }

    const url = new URL("api/rest/products", BACKEND_URL);
    url.searchParams.set("id", this.productId);

    const [product] = await fetchJson(url);

    return product;
  }

  async loadCategories() {
    const url = new URL("api/rest/categories", BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");

    const categories = await fetchJson(url);

    return categories;
  }

  escapeProductInfo(productInfo) {
    const entries = Object.entries(productInfo);
    const escapedEntries = entries.map(([key, value]) => {
      const escapedValue =
        typeof value === "string" ? escapeHtml(value) : value;

      return [key, escapedValue];
    });

    return Object.fromEntries(escapedEntries);
  }

  getCategoryTouples(categories) {
    return categories.reduce((result, category) => {
      const subcategories = category.subcategories.map((subcategory) => [
        subcategory.id,
        `${category.title} > ${subcategory.title}`,
      ]);

      result.push(...subcategories);

      return result;
    }, []);
  }

  getSubElements() {
    const result = {};
    const collection = this.element.querySelectorAll("[data-element]");

    for (const elem of collection) {
      const name = elem.dataset.element;
      result[name] = elem;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements.productForm.removeEventListener("submit", this.save);
    this.element = null;
  }
}
